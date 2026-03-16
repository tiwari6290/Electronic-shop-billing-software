import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentIn.css";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Party {
  id: number;
  name: string;
  mobile?: string;
  balance?: number;
}

interface SalesInvoice {
  id: string;
  invoiceNo: number;
  invoiceDate: string;
  dueDate: string;
  showDueDate: boolean;
  party: { name: string } | null;
  billItems: { amount: number }[];
  additionalCharges: { amount: number }[];
  discountPct: number;
  discountAmt: number;
  applyTCS: boolean;
  tcsRate: number;
  tcsBase: string;
  roundOffAmt: number;
  amountReceived: number;
  status: "Paid" | "Unpaid" | "Partially Paid" | "Cancelled";
  paymentTermsDays?: number;
}

interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  holderName: string;
  upiId?: string;
  openingBalance: number;
}

export interface SettledInvoiceRow {
  invoiceId: string;
  invoiceNo: number;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  tds: number;
  discount: number;
  amountReceived: number;
  balanceAmount: number;
}

export interface PaymentInRecord {
  id: string;
  date: string;
  paymentNumber: string;
  partyName: string;
  totalAmountSettled: number;
  amountReceived: number;
  discount: number;
  paymentMode: string;
  paymentReceivedIn?: string;
  notes?: string;
  settledInvoices: SettledInvoiceRow[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcInvoiceTotal(inv: SalesInvoice): number {
  const items = inv.billItems.reduce((s, i) => s + i.amount, 0);
  const charges = inv.additionalCharges.reduce((s, c) => s + c.amount, 0);
  const taxable = items + charges;
  const disc = taxable * (inv.discountPct / 100) + inv.discountAmt;
  const after = taxable - disc;
  const tcsBase = inv.tcsBase === "Total Amount" ? after : taxable;
  const tcs = inv.applyTCS ? tcsBase * (inv.tcsRate / 100) : 0;
  return Math.round((after + tcs + inv.roundOffAmt) * 100) / 100;
}

function fmtDate(iso: string) {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtCurrency(n: number) {
  return "₹ " + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}
function todayIso() { return new Date().toISOString().split("T")[0]; }

function numToWords(num: number): string {
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
    "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  if (num === 0) return "Zero";
  function helper(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n/10)] + (n%10?" "+ones[n%10]:"");
    if (n < 1000) return ones[Math.floor(n/100)]+" Hundred"+(n%100?" "+helper(n%100):"");
    if (n < 100000) return helper(Math.floor(n/1000))+" Thousand"+(n%1000?" "+helper(n%1000):"");
    if (n < 10000000) return helper(Math.floor(n/100000))+" Lakh"+(n%100000?" "+helper(n%100000):"");
    return helper(Math.floor(n/10000000))+" Crore"+(n%10000000?" "+helper(n%10000000):"");
  }
  const [intPart] = String(num).split(".");
  return helper(parseInt(intPart)) + " Rupees";
}

// ─── Add Bank Account Modal ───────────────────────────────────────────────────
function AddBankAccountModal({ onClose, onSave }: { onClose: () => void; onSave: (acc: BankAccount) => void }) {
  const [form, setForm] = useState({
    accountName: "", openingBalance: "", asOfDate: todayIso(),
    addDetails: true, accountNumber: "", reAccountNumber: "",
    ifscCode: "", bankName: "", holderName: "", upiId: "",
  });
  const [err, setErr] = useState<Record<string, string>>({});

  function change(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setErr(er => ({ ...er, [name]: "" }));
  }

  function submit() {
    const e: Record<string, string> = {};
    if (!form.accountName) e.accountName = "Required";
    if (form.addDetails) {
      if (!form.accountNumber) e.accountNumber = "Required";
      if (form.accountNumber !== form.reAccountNumber) e.reAccountNumber = "Account numbers don't match";
      if (!form.ifscCode) e.ifscCode = "Required";
      if (!form.bankName) e.bankName = "Required";
      if (!form.holderName) e.holderName = "Required";
    }
    if (Object.keys(e).length) { setErr(e); return; }
    const acc: BankAccount = {
      id: `ba-${Date.now()}`,
      accountName: form.accountName,
      accountNumber: form.accountNumber,
      ifscCode: form.ifscCode,
      bankName: form.bankName,
      holderName: form.holderName,
      upiId: form.upiId,
      openingBalance: parseFloat(form.openingBalance) || 0,
    };
    const existing: BankAccount[] = JSON.parse(localStorage.getItem("bankAccounts") || "[]");
    localStorage.setItem("bankAccounts", JSON.stringify([...existing, acc]));
    onSave(acc);
  }

  return (
    <div className="pi-overlay" onClick={onClose}>
      <div className="pi-modal" style={{ width: 540 }} onClick={e => e.stopPropagation()}>
        <div className="pi-modal-hdr">
          <span>Add Bank Account</span>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="pi-modal-body">
          <div className="pi-form-field">
            <label className="pi-form-label">Account Name *</label>
            <input className={`pi-input${err.accountName ? " pi-input--err" : ""}`}
              name="accountName" placeholder="ex: Personal Account"
              value={form.accountName} onChange={change} />
            {err.accountName && <span className="pi-err-txt">{err.accountName}</span>}
          </div>
          <div className="pi-row-2">
            <div className="pi-form-field">
              <label className="pi-form-label">Opening Balance</label>
              <div className="pi-prefix-input">
                <span>₹</span>
                <input name="openingBalance" type="number" placeholder="ex: 10,000"
                  value={form.openingBalance} onChange={change} />
              </div>
            </div>
            <div className="pi-form-field">
              <label className="pi-form-label">As of Date</label>
              <input className="pi-input" name="asOfDate" type="date"
                value={form.asOfDate} onChange={change} />
            </div>
          </div>
          <div className="pi-toggle-row">
            <span className="pi-form-label" style={{ marginBottom: 0 }}>Add Bank Details</span>
            <button className={`pi-toggle ${form.addDetails ? "pi-toggle--on" : "pi-toggle--off"}`}
              onClick={() => setForm(f => ({ ...f, addDetails: !f.addDetails }))}>
              <span className="pi-toggle-thumb" />
            </button>
          </div>
          {form.addDetails && (
            <div className="pi-row-2" style={{ marginTop: 12 }}>
              <div className="pi-form-field">
                <label className="pi-form-label">Bank Account Number *</label>
                <input className={`pi-input${err.accountNumber ? " pi-input--err" : ""}`}
                  name="accountNumber" placeholder="ex: 123456789157950"
                  value={form.accountNumber} onChange={change} />
                {err.accountNumber && <span className="pi-err-txt">{err.accountNumber}</span>}
              </div>
              <div className="pi-form-field">
                <label className="pi-form-label">Re-Enter Bank Account Number *</label>
                <input className={`pi-input${err.reAccountNumber ? " pi-input--err" : ""}`}
                  name="reAccountNumber" placeholder="ex: 123456789157950"
                  value={form.reAccountNumber} onChange={change} />
                {err.reAccountNumber && <span className="pi-err-txt">{err.reAccountNumber}</span>}
              </div>
              <div className="pi-form-field">
                <label className="pi-form-label">IFSC Code *</label>
                <input className={`pi-input${err.ifscCode ? " pi-input--err" : ""}`}
                  name="ifscCode" placeholder="ex: HDFC000075"
                  value={form.ifscCode} onChange={change} />
                {err.ifscCode && <span className="pi-err-txt">{err.ifscCode}</span>}
              </div>
              <div className="pi-form-field">
                <label className="pi-form-label">Bank &amp; Branch Name *</label>
                <input className={`pi-input${err.bankName ? " pi-input--err" : ""}`}
                  name="bankName" placeholder="ex: HDFC, Old Madras"
                  value={form.bankName} onChange={change} />
                {err.bankName && <span className="pi-err-txt">{err.bankName}</span>}
              </div>
              <div className="pi-form-field">
                <label className="pi-form-label">Account Holders Name *</label>
                <input className={`pi-input${err.holderName ? " pi-input--err" : ""}`}
                  name="holderName" placeholder="ex: Elisa wolf"
                  value={form.holderName} onChange={change} />
                {err.holderName && <span className="pi-err-txt">{err.holderName}</span>}
              </div>
              <div className="pi-form-field">
                <label className="pi-form-label">UPI ID</label>
                <input className="pi-input" name="upiId" placeholder="ex: elisa@okhdfic"
                  value={form.upiId} onChange={change} />
              </div>
            </div>
          )}
        </div>
        <div className="pi-modal-footer">
          <button className="pi-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="pi-btn-primary" onClick={submit}>Submit</button>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Settings Modal ─────────────────────────────────────────────────────
function QuickSettingsModal({ onClose, onSave }: { onClose: () => void; onSave: (seq: number, prefix: string) => void }) {
  const [enabled, setEnabled] = useState(true);
  const [prefix, setPrefix] = useState(() => JSON.parse(localStorage.getItem("paymentInSettings") || "{}").prefix || "");
  const [seqNo, setSeqNo] = useState(() => {
    const s = JSON.parse(localStorage.getItem("paymentInSettings") || "{}");
    if (s.seqNo) return s.seqNo;
    const list: PaymentInRecord[] = JSON.parse(localStorage.getItem("paymentInList") || "[]");
    return list.length + 1;
  });

  function save() {
    localStorage.setItem("paymentInSettings", JSON.stringify({ enabled, prefix, seqNo }));
    onSave(seqNo, prefix);
    onClose();
  }

  return (
    <div className="pi-overlay" onClick={onClose}>
      <div className="pi-modal" onClick={e => e.stopPropagation()}>
        <div className="pi-modal-hdr"><span>Quick Payment In Settings</span><button onClick={onClose}>✕</button></div>
        <div className="pi-modal-body">
          <div className="pi-settings-box">
            <div className="pi-settings-row">
              <div>
                <div className="pi-settings-label">Payment In Prefix &amp; Sequence Number</div>
                <div className="pi-settings-sub">Add your custom prefix &amp; sequence for Payment In Numbering</div>
              </div>
              <button className={`pi-toggle ${enabled ? "pi-toggle--on" : "pi-toggle--off"}`}
                onClick={() => setEnabled(!enabled)}>
                <span className="pi-toggle-thumb" />
              </button>
            </div>
            {enabled && (
              <>
                <div className="pi-row-2" style={{ marginTop: 14 }}>
                  <div className="pi-form-field">
                    <label className="pi-form-label">Prefix</label>
                    <input className="pi-input" value={prefix} onChange={e => setPrefix(e.target.value)} placeholder="Prefix" />
                  </div>
                  <div className="pi-form-field">
                    <label className="pi-form-label">Sequence Number</label>
                    <input className="pi-input" type="number" value={seqNo} onChange={e => setSeqNo(Number(e.target.value))} />
                  </div>
                </div>
                <div className="pi-seq-preview">Payment In Number: {(prefix || "") + seqNo}</div>
              </>
            )}
          </div>
        </div>
        <div className="pi-modal-footer">
          <button className="pi-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="pi-btn-primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Apply TDS Modal ──────────────────────────────────────────────────────────
function ApplyTDSModal({ invoiceNo, pending, onApply, onClose }: {
  invoiceNo: number; pending: number;
  onApply: (tds: number) => void; onClose: () => void;
}) {
  const [rate, setRate] = useState("");
  const [amount, setAmount] = useState("");
  const tds = parseFloat(amount) || (parseFloat(rate) ? pending * parseFloat(rate) / 100 : 0);

  return (
    <div className="pi-overlay" onClick={onClose}>
      <div className="pi-modal" style={{ width: 400 }} onClick={e => e.stopPropagation()}>
        <div className="pi-modal-hdr"><span>Apply TDS — Invoice #{invoiceNo}</span><button onClick={onClose}>✕</button></div>
        <div className="pi-modal-body">
          <div className="pi-form-field">
            <label className="pi-form-label">TDS Rate (%)</label>
            <input className="pi-input" type="number" placeholder="e.g. 2" value={rate}
              onChange={e => { setRate(e.target.value); setAmount(""); }} />
          </div>
          <div className="pi-form-field">
            <label className="pi-form-label">TDS Amount (₹)</label>
            <input className="pi-input" type="number" placeholder="or enter amount directly" value={amount}
              onChange={e => { setAmount(e.target.value); setRate(""); }} />
          </div>
          {tds > 0 && <div className="pi-tds-preview">TDS to apply: {fmtCurrency(tds)}</div>}
        </div>
        <div className="pi-modal-footer">
          <button className="pi-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="pi-btn-primary" onClick={() => { onApply(tds); onClose(); }}>Apply</button>
        </div>
      </div>
    </div>
  );
}

// ─── Apply Discount Modal ─────────────────────────────────────────────────────
function ApplyDiscountModal({ invoiceNo, pending, onApply, onClose }: {
  invoiceNo: number; pending: number;
  onApply: (disc: number) => void; onClose: () => void;
}) {
  const [rate, setRate] = useState("");
  const [amount, setAmount] = useState("");
  const disc = parseFloat(amount) || (parseFloat(rate) ? pending * parseFloat(rate) / 100 : 0);

  return (
    <div className="pi-overlay" onClick={onClose}>
      <div className="pi-modal" style={{ width: 400 }} onClick={e => e.stopPropagation()}>
        <div className="pi-modal-hdr"><span>Apply Discount — Invoice #{invoiceNo}</span><button onClick={onClose}>✕</button></div>
        <div className="pi-modal-body">
          <div className="pi-form-field">
            <label className="pi-form-label">Discount Rate (%)</label>
            <input className="pi-input" type="number" placeholder="e.g. 5" value={rate}
              onChange={e => { setRate(e.target.value); setAmount(""); }} />
          </div>
          <div className="pi-form-field">
            <label className="pi-form-label">Discount Amount (₹)</label>
            <input className="pi-input" type="number" placeholder="or enter amount directly" value={amount}
              onChange={e => { setAmount(e.target.value); setRate(""); }} />
          </div>
          {disc > 0 && <div className="pi-tds-preview">Discount to apply: {fmtCurrency(disc)}</div>}
        </div>
        <div className="pi-modal-footer">
          <button className="pi-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="pi-btn-primary" onClick={() => { onApply(disc); onClose(); }}>Apply</button>
        </div>
      </div>
    </div>
  );
}

// ─── Party Dropdown ───────────────────────────────────────────────────────────
function PartyDropdown({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const parties: Party[] = JSON.parse(localStorage.getItem("parties") || "[]");
  const filtered = parties.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setSearch(""); } }
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 0); }, [open]);

  if (disabled) {
    return (
      <div className="pi-select-trigger pi-select-trigger--disabled">
        <span>{value}</span>
      </div>
    );
  }

  return (
    <div className="pi-select-wrap" ref={ref}>
      <div className={`pi-select-trigger${open ? " pi-select-trigger--open" : ""}`} onClick={() => setOpen(!open)}>
        <span className={value ? "" : "pi-select-placeholder"}>{value || "Search party by name or number"}</span>
        <div className={`pi-select-icons${open ? " pi-select-icons--open" : ""}`}>
          {value && (
            <button className="pi-clear-btn" onMouseDown={e => { e.stopPropagation(); onChange(""); setOpen(false); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          )}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
        </div>
      </div>
      {open && (
        <div className="pi-dropdown">
          <div className="pi-dropdown-search">
            <input ref={inputRef} placeholder="Search party by name or number"
              value={search} onChange={e => setSearch(e.target.value)}
              onMouseDown={e => e.stopPropagation()} />
          </div>
          <div className="pi-dropdown-list">
            {filtered.length > 0 ? filtered.map(p => (
              <div key={p.id}
                className={`pi-dropdown-item${value === p.name ? " pi-dropdown-item--selected" : ""}`}
                onMouseDown={e => { e.preventDefault(); onChange(p.name); setOpen(false); setSearch(""); }}>
                {p.name}
              </div>
            )) : <div className="pi-dropdown-empty">No party found</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Account Dropdown ─────────────────────────────────────────────────────────
function AccountDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [accounts, setAccounts] = useState<BankAccount[]>(() =>
    JSON.parse(localStorage.getItem("bankAccounts") || "[]")
  );

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <>
      <div className="pi-select-wrap" ref={ref}>
        <div className={`pi-select-trigger${open ? " pi-select-trigger--open" : ""}`} onClick={() => setOpen(!open)}>
          <span className={value ? "" : "pi-select-placeholder"}>{value || "Select"}</span>
          <div className={`pi-select-icons${open ? " pi-select-icons--open" : ""}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
        </div>
        {open && (
          <div className="pi-account-dropdown">
            {accounts.map(a => (
              <div key={a.id}
                className={`pi-account-item${value === a.accountName ? " pi-account-item--selected" : ""}`}
                onMouseDown={e => { e.preventDefault(); onChange(a.accountName); setOpen(false); }}>
                {a.accountName}
              </div>
            ))}
            <div className="pi-account-add" onMouseDown={e => { e.preventDefault(); setShowAddModal(true); setOpen(false); }}>
              + Add New Account
            </div>
          </div>
        )}
      </div>
      {showAddModal && (
        <AddBankAccountModal
          onClose={() => setShowAddModal(false)}
          onSave={acc => {
            const updated = [...accounts, acc];
            setAccounts(updated);
            onChange(acc.accountName);
            setShowAddModal(false);
          }}
        />
      )}
    </>
  );
}

// ─── Date Field ───────────────────────────────────────────────────────────────
function DateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const hiddenRef = useRef<HTMLInputElement>(null);
  return (
    <div className="pi-date-field" onClick={() => hiddenRef.current?.showPicker()}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <span className="pi-date-display">{fmtDate(value)}</span>
      <svg className="pi-date-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 12 15 18 9" />
      </svg>
      <input ref={hiddenRef} type="date" className="pi-date-hidden" value={value}
        onChange={e => onChange(e.target.value)} />
    </div>
  );
}

// ─── Pending Invoice Row ──────────────────────────────────────────────────────
interface PRow {
  invoiceId: string;
  invoiceNo: number;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  originalPending: number;  // pending before this payment session
  tds: number;
  discount: number;
  amountReceived: number;
  checked: boolean;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PaymentIn() {
  const navigate = useNavigate();
  const isEditing = !!localStorage.getItem("editingPaymentIn");

  const editing: PaymentInRecord | null = (() => {
    try { return JSON.parse(localStorage.getItem("editingPaymentIn") || "null"); } catch { return null; }
  })();

  // Next payment number
  const settings = JSON.parse(localStorage.getItem("paymentInSettings") || "{}");
  const list: PaymentInRecord[] = JSON.parse(localStorage.getItem("paymentInList") || "[]");
  const nextSeq = settings.seqNo || list.length + 1;
  const nextPrefix = settings.prefix || "";

  const [partyName, setPartyName] = useState(editing?.partyName || "");
  const [amountReceived, setAmountReceived] = useState(editing?.amountReceived?.toString() || "0");
  const [discount, setDiscount] = useState(editing?.discount?.toString() || "0");
  const [date, setDate] = useState(editing?.date || todayIso());
  const [paymentMode, setPaymentMode] = useState(editing?.paymentMode || "Cash");
  const [paymentReceivedIn, setPaymentReceivedIn] = useState(editing?.paymentReceivedIn || "");
  const [paymentNumber, setPaymentNumber] = useState(() => {
    if (editing) return editing.paymentNumber;
    return String(nextSeq);
  });
  const [notes, setNotes] = useState(editing?.notes || "");
  const [showSettings, setShowSettings] = useState(false);
  const [invoiceSearch, setInvoiceSearch] = useState("");

  // TDS / Discount modals
  const [tdsModal, setTdsModal] = useState<{ invoiceId: string; invoiceNo: number; pending: number } | null>(null);
  const [discModal, setDiscModal] = useState<{ invoiceId: string; invoiceNo: number; pending: number } | null>(null);

  // Pending rows
  const [rows, setRows] = useState<PRow[]>([]);

  // Load/refresh rows when party changes
  useEffect(() => {
    if (!partyName) { setRows([]); return; }
    const invoices: SalesInvoice[] = JSON.parse(localStorage.getItem("salesInvoices") || "[]");
    const partyInvoices = invoices.filter(inv =>
      inv.party?.name === partyName &&
      (inv.status === "Unpaid" || inv.status === "Partially Paid")
    );

    if (editing) {
      // Editing mode: restore settled state
      const settledMap = new Map(editing.settledInvoices.map(s => [s.invoiceId, s]));
      // Include both currently pending AND previously settled invoices for this payment
      const allIds = new Set([
        ...partyInvoices.map(i => i.id),
        ...editing.settledInvoices.map(s => s.invoiceId),
      ]);
      const allInvoices: SalesInvoice[] = JSON.parse(localStorage.getItem("salesInvoices") || "[]");
      const rows: PRow[] = [];
      allIds.forEach(id => {
        const inv = allInvoices.find(i => i.id === id);
        if (!inv) return;
        const total = calcInvoiceTotal(inv);
        const settled = settledMap.get(id);
        const amtRec = settled?.amountReceived || 0;
        const tds = settled?.tds || 0;
        const disc = settled?.discount || 0;
        // Pending = (original pending) — for edit we show the invoice's current amountReceived minus what this payment contributed
        const pending = total - (inv.amountReceived - amtRec);
        rows.push({
          invoiceId: id,
          invoiceNo: inv.invoiceNo,
          invoiceDate: inv.invoiceDate,
          dueDate: inv.dueDate,
          totalAmount: total,
          originalPending: Math.max(0, pending),
          tds, discount: disc,
          amountReceived: amtRec,
          checked: amtRec > 0,
        });
      });
      setRows(rows.sort((a, b) => a.invoiceNo - b.invoiceNo));
    } else {
      const newRows: PRow[] = partyInvoices.map(inv => {
        const total = calcInvoiceTotal(inv);
        const pending = Math.max(0, total - inv.amountReceived);
        return {
          invoiceId: inv.id,
          invoiceNo: inv.invoiceNo,
          invoiceDate: inv.invoiceDate,
          dueDate: inv.dueDate,
          totalAmount: total,
          originalPending: pending,
          tds: 0, discount: 0,
          amountReceived: 0,
          checked: false,
        };
      });
      setRows(newRows.sort((a, b) => a.invoiceNo - b.invoiceNo));
    }
  }, [partyName]);

  // Auto-distribute amount when amountReceived changes.
  // If no rows are checked yet, auto-check ALL rows first, then distribute.
  useEffect(() => {
    const total = parseFloat(amountReceived) || 0;
    if (total <= 0) {
      // Clear all amounts when set to 0
      setRows(prev => prev.map(r => ({ ...r, amountReceived: 0 })));
      return;
    }
    setRows(prev => {
      const noneChecked = prev.every(r => !r.checked);
      // Auto-check all if none are checked
      const base = noneChecked ? prev.map(r => ({ ...r, checked: true })) : prev;
      let remaining = total;
      return base.map(row => {
        if (!row.checked) return { ...row, amountReceived: 0 };
        const effectivePending = row.originalPending - row.tds - row.discount;
        const toApply = Math.min(remaining, Math.max(0, effectivePending));
        remaining -= toApply;
        return { ...row, amountReceived: toApply };
      });
    });
  }, [amountReceived]);

  // When a row is checked, auto-assign from remaining
  function toggleRow(invoiceId: string, checked: boolean) {
    setRows(prev => {
      const updated = prev.map(r => r.invoiceId === invoiceId ? { ...r, checked } : r);
      // Redistribute
      const total = parseFloat(amountReceived) || 0;
      let remaining = total;
      return updated.map(row => {
        if (!row.checked) return { ...row, amountReceived: 0 };
        const effectivePending = row.originalPending - row.tds - row.discount;
        const toApply = Math.min(remaining, effectivePending);
        remaining -= toApply;
        return { ...row, amountReceived: toApply };
      });
    });
  }

  function toggleAll(checked: boolean) {
    setRows(prev => {
      const updated = prev.map(r => ({ ...r, checked }));
      const total = parseFloat(amountReceived) || 0;
      let remaining = total;
      return updated.map(row => {
        if (!row.checked) return { ...row, amountReceived: 0 };
        const effectivePending = row.originalPending - row.tds - row.discount;
        const toApply = Math.min(remaining, effectivePending);
        remaining -= toApply;
        return { ...row, amountReceived: toApply };
      });
    });
  }

  function applyTds(invoiceId: string, tds: number) {
    setRows(prev => prev.map(r => r.invoiceId === invoiceId ? { ...r, tds } : r));
  }

  function applyDiscount(invoiceId: string, disc: number) {
    setRows(prev => prev.map(r => r.invoiceId === invoiceId ? { ...r, discount: disc } : r));
  }

  // Party balance
  const getPartyBalance = () => {
    if (!partyName) return null;
    const parties: Party[] = JSON.parse(localStorage.getItem("parties") || "[]");
    return parties.find(p => p.name === partyName)?.balance ?? null;
  };

  const partyBalance = getPartyBalance();

  // Totals
  const checkedRows = rows.filter(r => r.checked);
  const totalInvoiceAmount = checkedRows.reduce((s, r) => s + r.totalAmount, 0);
  const totalTds = checkedRows.reduce((s, r) => s + r.tds, 0);
  const totalDiscount = checkedRows.reduce((s, r) => s + r.discount, 0);
  const totalAmtReceived = checkedRows.reduce((s, r) => s + r.amountReceived, 0);

  const allChecked = rows.length > 0 && rows.every(r => r.checked);
  const someChecked = rows.some(r => r.checked);

  // Filtered rows for display
  const displayRows = invoiceSearch
    ? rows.filter(r => String(r.invoiceNo).includes(invoiceSearch))
    : rows;

  const PAYMENT_MODES = ["Cash", "UPI", "Card", "Netbanking", "Bank Transfer", "Cheque"];

  function handleSave() {
    if (!partyName || !amountReceived) { alert("Please fill required fields"); return; }

    const settledInvoices: SettledInvoiceRow[] = checkedRows.map(r => ({
      invoiceId: r.invoiceId,
      invoiceNo: r.invoiceNo,
      invoiceDate: r.invoiceDate,
      dueDate: r.dueDate,
      totalAmount: r.totalAmount,
      tds: r.tds,
      discount: r.discount,
      amountReceived: r.amountReceived,
      balanceAmount: r.originalPending - r.tds - r.discount - r.amountReceived,
    }));

    const record: PaymentInRecord = {
      id: editing?.id || `pi-${Date.now()}`,
      date,
      paymentNumber: nextPrefix + paymentNumber,
      partyName,
      totalAmountSettled: totalAmtReceived,
      amountReceived: parseFloat(amountReceived) || 0,
      discount: parseFloat(discount) || 0,
      paymentMode,
      paymentReceivedIn: paymentMode !== "Cash" ? paymentReceivedIn : undefined,
      notes,
      settledInvoices,
    };

    // Update localStorage paymentInList
    const existingList: PaymentInRecord[] = JSON.parse(localStorage.getItem("paymentInList") || "[]");
    if (editing) {
      localStorage.setItem("paymentInList", JSON.stringify(existingList.map(p => p.id === editing.id ? record : p)));
    } else {
      localStorage.setItem("paymentInList", JSON.stringify([...existingList, record]));
    }

    // Update salesInvoices
    const invoices: SalesInvoice[] = JSON.parse(localStorage.getItem("salesInvoices") || "[]");

    // If editing, first revert old payments
    if (editing) {
      editing.settledInvoices.forEach(s => {
        const inv = invoices.find(i => i.id === s.invoiceId);
        if (inv) {
          inv.amountReceived = Math.max(0, inv.amountReceived - s.amountReceived);
        }
      });
    }

    // Apply new payments
    settledInvoices.forEach(s => {
      const inv = invoices.find(i => i.id === s.invoiceId);
      if (inv) {
        inv.amountReceived = inv.amountReceived + s.amountReceived;
        const total = calcInvoiceTotal(inv);
        if (inv.amountReceived >= total) inv.status = "Paid";
        else if (inv.amountReceived > 0) inv.status = "Partially Paid";
        else inv.status = "Unpaid";
      }
    });
    localStorage.setItem("salesInvoices", JSON.stringify(invoices));

    // Update party balance
    if (partyBalance !== null) {
      const parties: Party[] = JSON.parse(localStorage.getItem("parties") || "[]");
      const updated = parties.map(p => {
        if (p.name !== partyName) return p;
        const oldAmt = editing?.amountReceived || 0;
        const newAmt = parseFloat(amountReceived) || 0;
        return { ...p, balance: (p.balance || 0) - (newAmt - oldAmt) };
      });
      localStorage.setItem("parties", JSON.stringify(updated));
    }

    // Increment sequence
    if (!editing) {
      const s = JSON.parse(localStorage.getItem("paymentInSettings") || "{}");
      localStorage.setItem("paymentInSettings", JSON.stringify({ ...s, seqNo: (s.seqNo || 1) + 1 }));
    }

    localStorage.removeItem("editingPaymentIn");
    navigate("/cashier/payment-in-list");
  }

  const isSaveEnabled = !!(partyName && parseFloat(amountReceived) > 0);

  return (
    <>
      {/* ── Navbar ───────────────────────────────────────────────── */}
      <div className="pi-navbar">
        <div className="pi-navbar-left">
          <button className="pi-back-btn" onClick={() => { localStorage.removeItem("editingPaymentIn"); navigate(-1); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <span className="pi-navbar-title">
            {editing ? `Record Payment In #${editing.paymentNumber}` : `Record Payment In #${nextPrefix + paymentNumber}`}
          </span>
        </div>
        <div className="pi-navbar-right">
          <button className="pi-nav-icon-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" /><polyline points="3 9 12 15 21 9" />
            </svg>
          </button>
          <button className="pi-nav-settings-btn" onClick={() => setShowSettings(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </button>
          <button className="pi-nav-cancel-btn" onClick={() => { localStorage.removeItem("editingPaymentIn"); navigate(-1); }}>
            Cancel
          </button>
          <button className={`pi-nav-save-btn${!isSaveEnabled ? " pi-nav-save-btn--disabled" : ""}`}
            disabled={!isSaveEnabled} onClick={handleSave}>
            {editing ? "Save Changes" : "Save"}
          </button>
        </div>
      </div>

      {/* ── Page ─────────────────────────────────────────────────── */}
      <div className="pi-page">
        <div className="pi-top-grid">
          {/* Left card */}
          <div className="pi-card">
            <div className="pi-form-field">
              <label className="pi-form-label">Party Name</label>
              <PartyDropdown value={partyName} onChange={v => { setPartyName(v); setAmountReceived("0"); }}
                disabled={!!editing} />
            </div>
            {partyName && partyBalance !== null && (
              <div className="pi-balance-line">Current Balance: {fmtCurrency(Math.abs(partyBalance))}</div>
            )}
            <div className="pi-row-2">
              <div className="pi-form-field">
                <label className="pi-form-label">Amount Received</label>
                <input className="pi-input" type="number" value={amountReceived}
                  onChange={e => setAmountReceived(e.target.value)} />
              </div>
              <div className="pi-form-field">
                <label className="pi-form-label">
                  Payment In Discount
                  <span className="pi-label-info">i</span>
                </label>
                <input className="pi-input" type="number" value={discount}
                  onChange={e => setDiscount(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Right card */}
          <div className="pi-card">
            {/* Row 1: Date, Mode, and optionally Payment Received In */}
            <div className={paymentMode !== "Cash" ? "pi-row-3" : "pi-row-2"}>
              <div className="pi-form-field">
                <label className="pi-form-label">Payment Date</label>
                <DateField value={date} onChange={setDate} />
              </div>
              <div className="pi-form-field">
                <label className="pi-form-label">Payment Mode</label>
                <select className="pi-select" value={paymentMode}
                  onChange={e => { setPaymentMode(e.target.value); setPaymentReceivedIn(""); }}>
                  {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              {paymentMode !== "Cash" && (
                <div className="pi-form-field">
                  <label className="pi-form-label">Payment Received In</label>
                  <AccountDropdown value={paymentReceivedIn} onChange={setPaymentReceivedIn} />
                </div>
              )}
            </div>

            {/* Payment In Number — always shown for all modes */}
            <div className="pi-form-field" style={{ maxWidth: 240 }}>
              <label className="pi-form-label">Payment In Number</label>
              <input className="pi-input" value={paymentNumber}
                onChange={e => setPaymentNumber(e.target.value)} />
            </div>

            <div className="pi-form-field">
              <label className="pi-form-label">Notes</label>
              <textarea className="pi-textarea" value={notes}
                onChange={e => setNotes(e.target.value)} placeholder="Enter Notes" />
            </div>
          </div>
        </div>

        {/* ── Settle Invoices section ───────────────────────────── */}
        {!partyName ? (
          <div className="pi-empty-card">
            <div className="pi-empty">
              <svg viewBox="0 0 120 100" fill="none" style={{ width: 120 }}>
                <rect x="20" y="10" width="60" height="70" rx="4" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1.5" />
                <rect x="28" y="25" width="44" height="5" rx="2" fill="#e5e7eb" />
                <rect x="28" y="36" width="32" height="5" rx="2" fill="#e5e7eb" />
                <rect x="28" y="47" width="38" height="5" rx="2" fill="#e5e7eb" />
                <circle cx="85" cy="65" r="20" fill="#ede9fe" />
                <path d="M85 55 L85 75 M75 65 L95 65" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <div className="pi-empty-title">No party selected!</div>
              <div className="pi-empty-sub">Select Party Name to view transactions</div>
              <button className="pi-empty-btn">Select Party</button>
            </div>
          </div>
        ) : (
          <div className="pi-settle-section">
            <div className="pi-settle-hdr">
              <span className="pi-settle-title">Settle invoices with this payment</span>
              <div className="pi-settle-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input placeholder="Search Invoice Number" value={invoiceSearch}
                  onChange={e => setInvoiceSearch(e.target.value)} />
              </div>
            </div>

            {/* Table */}
            <div className="pi-settle-table-wrap">
              <table className="pi-settle-table">
                <thead>
                  <tr>
                    <th className="pi-sth pi-sth--cb">
                      <input type="checkbox" checked={allChecked}
                        onChange={e => toggleAll(e.target.checked)}
                        ref={el => { if (el) el.indeterminate = !allChecked && someChecked; }} />
                    </th>
                    <th className="pi-sth">Date</th>
                    <th className="pi-sth">Due Date</th>
                    <th className="pi-sth">Invoice #</th>
                    <th className="pi-sth">Invoice Amount</th>
                    <th className="pi-sth">TDS</th>
                    <th className="pi-sth">Discount</th>
                    <th className="pi-sth pi-sth--right">Amount Received</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#9ca3af", fontSize: 13 }}>
                        No pending invoices for this party
                      </td>
                    </tr>
                  ) : displayRows.map(row => {
                    const effectivePending = row.originalPending - row.tds - row.discount;
                    const pending = row.checked ? effectivePending - row.amountReceived : row.originalPending;
                    const showPending = pending > 0.01;
                    return (
                      <tr key={row.invoiceId} className={`pi-str${row.checked ? " pi-str--checked" : ""}`}>
                        <td className="pi-std pi-std--cb">
                          <input type="checkbox" checked={row.checked}
                            onChange={e => toggleRow(row.invoiceId, e.target.checked)} />
                        </td>
                        <td className="pi-std">{fmtDate(row.invoiceDate)}</td>
                        <td className="pi-std">{row.dueDate ? fmtDate(row.dueDate) : "–"}</td>
                        <td className="pi-std">{row.invoiceNo}</td>
                        <td className="pi-std">
                          <span>{fmtCurrency(row.totalAmount)}</span>
                          {showPending && (
                            <span className="pi-pending-txt"> ({fmtCurrency(pending)} pending)</span>
                          )}
                        </td>
                        <td className="pi-std">
                          {row.checked ? (
                            <button className="pi-apply-link"
                              onClick={() => setTdsModal({ invoiceId: row.invoiceId, invoiceNo: row.invoiceNo, pending: row.originalPending })}>
                              {row.tds > 0 ? fmtCurrency(row.tds) : "Apply TDS"}
                            </button>
                          ) : null}
                        </td>
                        <td className="pi-std">
                          <button className="pi-apply-link"
                            onClick={() => setDiscModal({ invoiceId: row.invoiceId, invoiceNo: row.invoiceNo, pending: row.originalPending })}>
                            {row.discount > 0 ? fmtCurrency(row.discount) : "Apply Discount"}
                          </button>
                        </td>
                        <td className="pi-std pi-std--right">
                          {row.checked ? fmtCurrency(row.amountReceived) : "₹0"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="pi-tfoot-row">
                    <td className="pi-std" colSpan={4}>
                      <strong>Total</strong>
                    </td>
                    <td className="pi-std"><strong>{checkedRows.length > 0 ? fmtCurrency(totalInvoiceAmount) : "₹0"}</strong></td>
                    <td className="pi-std"><strong>{fmtCurrency(totalTds)}</strong></td>
                    <td className="pi-std"><strong>{fmtCurrency(totalDiscount)}</strong></td>
                    <td className="pi-std pi-std--right"><strong>{fmtCurrency(totalAmtReceived)}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showSettings && (
        <QuickSettingsModal onClose={() => setShowSettings(false)}
          onSave={(seq, pfx) => setPaymentNumber(String(seq))} />
      )}
      {tdsModal && (
        <ApplyTDSModal
          invoiceNo={tdsModal.invoiceNo} pending={tdsModal.pending}
          onApply={tds => applyTds(tdsModal.invoiceId, tds)}
          onClose={() => setTdsModal(null)} />
      )}
      {discModal && (
        <ApplyDiscountModal
          invoiceNo={discModal.invoiceNo} pending={discModal.pending}
          onApply={disc => applyDiscount(discModal.invoiceId, disc)}
          onClose={() => setDiscModal(null)} />
      )}
    </>
  );
}