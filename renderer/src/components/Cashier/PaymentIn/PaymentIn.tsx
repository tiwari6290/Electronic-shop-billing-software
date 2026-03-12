import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./PaymentIn.css";
import {
  getPaymentInById,
  getPaymentInSettings,
  getPendingInvoicesForParty,
  createPaymentIn,
  updatePaymentIn,
  type PaymentInRecord,
  type PendingInvoice,
} from "../../../api/paymentInApi";
import { getParties }    from "../../../api/salesInvoiceApi";
import { getPartyBankAccounts } from "../../../api/salesInvoiceApi";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Party { id: number; name: string; partyName: string; balance?: number; }
interface BankAccount { id: number; accountHolder: string; accountNumber: string; bankName: string; ifscCode: string; branchName?: string; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtCurrency(n: number) { return "₹ " + n.toLocaleString("en-IN", { maximumFractionDigits: 2 }); }
function todayIso() { return new Date().toISOString().split("T")[0]; }
function numToWords(num: number): string {
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  if (num === 0) return "Zero";
  function h(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n/10)] + (n%10?" "+ones[n%10]:"");
    if (n < 1000) return ones[Math.floor(n/100)]+" Hundred"+(n%100?" "+h(n%100):"");
    if (n < 100000) return h(Math.floor(n/1000))+" Thousand"+(n%1000?" "+h(n%1000):"");
    if (n < 10000000) return h(Math.floor(n/100000))+" Lakh"+(n%100000?" "+h(n%100000):"");
    return h(Math.floor(n/10000000))+" Crore"+(n%10000000?" "+h(n%10000000):"");
  }
  return h(Math.floor(num)) + " Rupees";
}

// ─── Pending row ──────────────────────────────────────────────────────────────
interface PRow {
  invoiceId:       number;
  invoiceNo:       string;
  invoiceDate:     string;
  dueDate:         string;
  totalAmount:     number;
  originalPending: number;
  tds:             number;
  discount:        number;
  amountReceived:  number;
  checked:         boolean;
}

// ─── Add Bank Account Modal (uses party's bank accounts API) ──────────────────
function AddBankAccountModal({ partyId, onClose, onSave }: { partyId: number; onClose: () => void; onSave: (acc: BankAccount) => void }) {
  const [form, setForm] = useState({ accountHolder: "", bankName: "", accountNumber: "", confirmAccountNumber: "", ifscCode: "", branchName: "", upiId: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function submit() {
    const e: Record<string, string> = {};
    if (!form.accountHolder) e.accountHolder = "Required";
    if (!form.bankName)      e.bankName      = "Required";
    if (!form.accountNumber) e.accountNumber = "Required";
    if (form.confirmAccountNumber && form.confirmAccountNumber !== form.accountNumber) e.confirmAccountNumber = "Numbers don't match";
    if (!form.ifscCode)      e.ifscCode      = "Required";
    if (Object.keys(e).length) { setErr(e); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/parties/${partyId}/bank-accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountHolder: form.accountHolder, bankName: form.bankName, accountNumber: form.accountNumber, ifscCode: form.ifscCode.toUpperCase(), branchName: form.branchName || undefined, upiId: form.upiId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to save");
      onSave(data);
    } catch (err: any) { setErr({ accountHolder: err.message }); }
    finally { setSaving(false); }
  }

  function ch(name: string) { return (e: React.ChangeEvent<HTMLInputElement>) => { setForm(f => ({ ...f, [name]: e.target.value })); setErr(er => ({ ...er, [name]: "" })); }; }

  return (
    <div className="pi-overlay" onClick={onClose}>
      <div className="pi-modal" style={{ width: 540 }} onClick={e => e.stopPropagation()}>
        <div className="pi-modal-hdr"><span>Add Bank Account</span><button onClick={onClose}>✕</button></div>
        <div className="pi-modal-body">
          {[
            { label: "Account Holder *", key: "accountHolder", placeholder: "e.g. Mondal Electronic" },
            { label: "Bank Name *",       key: "bankName",      placeholder: "e.g. State Bank of India" },
            { label: "Account Number *",  key: "accountNumber", placeholder: "Enter account number", type: "password" },
            { label: "Confirm Account Number", key: "confirmAccountNumber", placeholder: "Re-enter account number" },
            { label: "IFSC Code *",       key: "ifscCode",      placeholder: "e.g. SBIN0001234" },
            { label: "Branch Name",       key: "branchName",    placeholder: "e.g. Howrah Main" },
            { label: "UPI ID",            key: "upiId",         placeholder: "e.g. name@upi" },
          ].map(f => (
            <div className="pi-form-field" key={f.key}>
              <label className="pi-form-label">{f.label}</label>
              <input className={`pi-input${err[f.key] ? " pi-input--err" : ""}`} type={f.type || "text"} placeholder={f.placeholder} value={(form as any)[f.key]} onChange={ch(f.key)} />
              {err[f.key] && <span className="pi-err-txt">{err[f.key]}</span>}
            </div>
          ))}
        </div>
        <div className="pi-modal-footer">
          <button className="pi-btn-cancel" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="pi-btn-primary" onClick={submit} disabled={saving}>{saving ? "Saving…" : "Submit"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Settings Modal (backend-driven) ────────────────────────────────────
function QuickSettingsModal({ nextNo, onClose, onSave }: { nextNo: string; onClose: () => void; onSave: (no: string) => void }) {
  const [val, setVal] = useState(nextNo);
  return (
    <div className="pi-overlay" onClick={onClose}>
      <div className="pi-modal" onClick={e => e.stopPropagation()}>
        <div className="pi-modal-hdr"><span>Payment In Settings</span><button onClick={onClose}>✕</button></div>
        <div className="pi-modal-body">
          <div className="pi-settings-box">
            <div className="pi-form-field">
              <label className="pi-form-label">Payment In Number</label>
              <input className="pi-input" value={val} onChange={e => setVal(e.target.value)} />
            </div>
            <div className="pi-seq-preview">Preview: {val}</div>
          </div>
        </div>
        <div className="pi-modal-footer">
          <button className="pi-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="pi-btn-primary" onClick={() => { onSave(val); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Apply TDS Modal ──────────────────────────────────────────────────────────
function ApplyTDSModal({ invoiceNo, pending, onApply, onClose }: { invoiceNo: string; pending: number; onApply: (tds: number) => void; onClose: () => void }) {
  const [rate, setRate] = useState("");
  const [amount, setAmount] = useState("");
  const tds = parseFloat(amount) || (parseFloat(rate) ? pending * parseFloat(rate) / 100 : 0);
  return (
    <div className="pi-overlay" onClick={onClose}>
      <div className="pi-modal" style={{ width: 400 }} onClick={e => e.stopPropagation()}>
        <div className="pi-modal-hdr"><span>Apply TDS — Invoice #{invoiceNo}</span><button onClick={onClose}>✕</button></div>
        <div className="pi-modal-body">
          <div className="pi-form-field"><label className="pi-form-label">TDS Rate (%)</label><input className="pi-input" type="number" placeholder="e.g. 2" value={rate} onChange={e => { setRate(e.target.value); setAmount(""); }} /></div>
          <div className="pi-form-field"><label className="pi-form-label">TDS Amount (₹)</label><input className="pi-input" type="number" placeholder="or enter amount" value={amount} onChange={e => { setAmount(e.target.value); setRate(""); }} /></div>
          {tds > 0 && <div className="pi-tds-preview">TDS to apply: {fmtCurrency(tds)}</div>}
        </div>
        <div className="pi-modal-footer"><button className="pi-btn-cancel" onClick={onClose}>Cancel</button><button className="pi-btn-primary" onClick={() => { onApply(tds); onClose(); }}>Apply</button></div>
      </div>
    </div>
  );
}

// ─── Apply Discount Modal ─────────────────────────────────────────────────────
function ApplyDiscountModal({ invoiceNo, pending, onApply, onClose }: { invoiceNo: string; pending: number; onApply: (disc: number) => void; onClose: () => void }) {
  const [rate, setRate] = useState("");
  const [amount, setAmount] = useState("");
  const disc = parseFloat(amount) || (parseFloat(rate) ? pending * parseFloat(rate) / 100 : 0);
  return (
    <div className="pi-overlay" onClick={onClose}>
      <div className="pi-modal" style={{ width: 400 }} onClick={e => e.stopPropagation()}>
        <div className="pi-modal-hdr"><span>Apply Discount — Invoice #{invoiceNo}</span><button onClick={onClose}>✕</button></div>
        <div className="pi-modal-body">
          <div className="pi-form-field"><label className="pi-form-label">Discount Rate (%)</label><input className="pi-input" type="number" placeholder="e.g. 5" value={rate} onChange={e => { setRate(e.target.value); setAmount(""); }} /></div>
          <div className="pi-form-field"><label className="pi-form-label">Discount Amount (₹)</label><input className="pi-input" type="number" placeholder="or enter amount" value={amount} onChange={e => { setAmount(e.target.value); setRate(""); }} /></div>
          {disc > 0 && <div className="pi-tds-preview">Discount to apply: {fmtCurrency(disc)}</div>}
        </div>
        <div className="pi-modal-footer"><button className="pi-btn-cancel" onClick={onClose}>Cancel</button><button className="pi-btn-primary" onClick={() => { onApply(disc); onClose(); }}>Apply</button></div>
      </div>
    </div>
  );
}

// ─── Party Dropdown ───────────────────────────────────────────────────────────
function PartyDropdown({ value, partyId, onChange, disabled }: { value: string; partyId: number | null; onChange: (name: string, id: number) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [parties, setParties] = useState<Party[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getParties().then(list => setParties(list.map((p: any) => ({ id: p.id, name: p.partyName, partyName: p.partyName }))));
  }, []);
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setSearch(""); } }
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 0); }, [open]);

  const filtered = parties.filter(p => p.partyName.toLowerCase().includes(search.toLowerCase()));

  if (disabled) return <div className="pi-select-trigger pi-select-trigger--disabled"><span>{value}</span></div>;

  return (
    <div className="pi-select-wrap" ref={ref}>
      <div className={`pi-select-trigger${open ? " pi-select-trigger--open" : ""}`} onClick={() => setOpen(!open)}>
        <span className={value ? "" : "pi-select-placeholder"}>{value || "Search party by name or number"}</span>
        <div className={`pi-select-icons${open ? " pi-select-icons--open" : ""}`}>
          {value && <button className="pi-clear-btn" onMouseDown={e => { e.stopPropagation(); onChange("", 0); setOpen(false); }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      {open && (
        <div className="pi-dropdown">
          <div className="pi-dropdown-search"><input ref={inputRef} placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} onMouseDown={e => e.stopPropagation()} /></div>
          <div className="pi-dropdown-list">
            {filtered.length > 0 ? filtered.map(p => (
              <div key={p.id} className={`pi-dropdown-item${partyId === p.id ? " pi-dropdown-item--selected" : ""}`} onMouseDown={e => { e.preventDefault(); onChange(p.partyName, p.id); setOpen(false); setSearch(""); }}>{p.partyName}</div>
            )) : <div className="pi-dropdown-empty">No party found</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Account Dropdown (bank accounts for selected party) ─────────────────────
function AccountDropdown({ partyId, value, onChange }: { partyId: number | null; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const loadAccounts = useCallback(async () => {
    if (!partyId) return;
    try {
    const list = await getPartyBankAccounts(partyId);
setAccounts(list.map(a => ({ ...a, branchName: a.branchName ?? undefined })));
    } catch { /* ignore */ }
  }, [partyId]);

  useEffect(() => { loadAccounts(); }, [loadAccounts]);
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <>
      <div className="pi-select-wrap" ref={ref}>
        <div className={`pi-select-trigger${open ? " pi-select-trigger--open" : ""}`} onClick={() => setOpen(!open)}>
          <span className={value ? "" : "pi-select-placeholder"}>{value || "Select account"}</span>
          <div className={`pi-select-icons${open ? " pi-select-icons--open" : ""}`}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></div>
        </div>
        {open && (
          <div className="pi-account-dropdown">
            {accounts.map(a => (
              <div key={a.id} className={`pi-account-item${value === a.accountHolder ? " pi-account-item--selected" : ""}`} onMouseDown={e => { e.preventDefault(); onChange(a.accountHolder); setOpen(false); }}>{a.accountHolder} · {a.bankName}</div>
            ))}
            <div className="pi-account-add" onMouseDown={e => { e.preventDefault(); setShowAddModal(true); setOpen(false); }}>+ Add New Account</div>
          </div>
        )}
      </div>
      {showAddModal && partyId && (
        <AddBankAccountModal partyId={partyId} onClose={() => setShowAddModal(false)} onSave={acc => { setAccounts(prev => [...prev, acc]); onChange(acc.accountHolder); setShowAddModal(false); }} />
      )}
    </>
  );
}

// ─── Date Field ───────────────────────────────────────────────────────────────
function DateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const hiddenRef = useRef<HTMLInputElement>(null);
  return (
    <div className="pi-date-field" onClick={() => hiddenRef.current?.showPicker()}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      <span className="pi-date-display">{fmtDate(value)}</span>
      <svg className="pi-date-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      <input ref={hiddenRef} type="date" className="pi-date-hidden" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const PAYMENT_MODES = ["Cash", "UPI", "Card", "Netbanking", "Bank Transfer", "Cheque"];

export default function PaymentIn() {
  const navigate    = useNavigate();
  const [params]    = useSearchParams();
  const editId      = params.get("editId") ? parseInt(params.get("editId")!) : null;
  const isEditing   = !!editId;

  // ── State ──────────────────────────────────────────────────────────────────
  const [loading,    setLoading]    = useState(isEditing);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const [partyName,          setPartyName]          = useState("");
  const [partyId,            setPartyId]            = useState<number | null>(null);
  const [amountReceived,     setAmountReceived]      = useState("0");
  const [discount,           setDiscount]            = useState("0");
  const [date,               setDate]                = useState(todayIso());
  const [paymentMode,        setPaymentMode]         = useState("Cash");
  const [paymentReceivedIn,  setPaymentReceivedIn]   = useState("");
  const [paymentNumber,      setPaymentNumber]       = useState("");
  const [notes,              setNotes]               = useState("");
  const [showSettings,       setShowSettings]        = useState(false);
  const [invoiceSearch,      setInvoiceSearch]       = useState("");
  const [rows,               setRows]                = useState<PRow[]>([]);
  const [loadingInvoices,    setLoadingInvoices]     = useState(false);
  const [tdsModal,           setTdsModal]            = useState<{ invoiceId: number; invoiceNo: string; pending: number } | null>(null);
  const [discModal,          setDiscModal]           = useState<{ invoiceId: number; invoiceNo: string; pending: number } | null>(null);
  const [nextPaymentNo,      setNextPaymentNo]       = useState("PI-1");

  // ── Load next payment number ───────────────────────────────────────────────
  useEffect(() => {
    getPaymentInSettings().then(s => {
      setNextPaymentNo(s.nextPaymentNo);
      if (!isEditing) setPaymentNumber(s.nextPaymentNo);
    }).catch(() => {});
  }, [isEditing]);

  // ── Load edit data ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!editId) return;
    setLoading(true);
    getPaymentInById(editId).then(rec => {
      setPartyName(rec.partyName);
      setPartyId(rec.partyId);
      setAmountReceived(String(rec.amount));
      setDate(rec.date);
      setPaymentMode(rec.mode);
      setPaymentNumber(rec.paymentNo);
      setNotes(rec.notes ?? "");
      // Restore settled rows
      const restoredRows: PRow[] = rec.allocations.map(a => ({
        invoiceId:       a.invoiceId,
        invoiceNo:       String(a.invoiceNo),
        invoiceDate:     a.invoiceDate,
        dueDate:         a.dueDate,
        totalAmount:     a.totalAmount,
        originalPending: a.amountReceived + a.balanceAmount,
        tds:             a.tds,
        discount:        a.discount,
        amountReceived:  a.amountReceived,
        checked:         true,
      }));
      setRows(restoredRows);
      setLoading(false);
    }).catch(err => {
      setError(err.message);
      setLoading(false);
    });
  }, [editId]);

  // ── Load pending invoices when party changes (new mode) ────────────────────
  useEffect(() => {
    if (isEditing || !partyId) { if (!partyId) setRows([]); return; }
    setLoadingInvoices(true);
    getPendingInvoicesForParty(partyId).then(invoices => {
      const newRows: PRow[] = invoices.map(inv => ({
        invoiceId:       inv.id,
        invoiceNo:       String(inv.invoiceNo),
        invoiceDate:     inv.invoiceDate,
        dueDate:         inv.dueDate,
        totalAmount:     inv.totalAmount,
        originalPending: inv.outstanding,
        tds:             0,
        discount:        0,
        amountReceived:  0,
        checked:         false,
      }));
      setRows(newRows.sort((a, b) => a.invoiceNo.localeCompare(b.invoiceNo)));
      setLoadingInvoices(false);
    }).catch(() => setLoadingInvoices(false));
  }, [partyId, isEditing]);

  // ── Auto-distribute amount across checked rows ─────────────────────────────
  useEffect(() => {
    const total = parseFloat(amountReceived) || 0;
    if (total <= 0) { setRows(prev => prev.map(r => ({ ...r, amountReceived: 0 }))); return; }
    setRows(prev => {
      const noneChecked = prev.every(r => !r.checked);
      const base = noneChecked ? prev.map(r => ({ ...r, checked: true })) : prev;
      let remaining = total;
      return base.map(row => {
        if (!row.checked) return { ...row, amountReceived: 0 };
        const eff = row.originalPending - row.tds - row.discount;
        const toApply = Math.min(remaining, Math.max(0, eff));
        remaining -= toApply;
        return { ...row, amountReceived: toApply };
      });
    });
  }, [amountReceived]);

  function toggleRow(invoiceId: number, checked: boolean) {
    setRows(prev => {
      const updated = prev.map(r => r.invoiceId === invoiceId ? { ...r, checked } : r);
      const total = parseFloat(amountReceived) || 0;
      let remaining = total;
      return updated.map(row => {
        if (!row.checked) return { ...row, amountReceived: 0 };
        const eff = row.originalPending - row.tds - row.discount;
        const toApply = Math.min(remaining, Math.max(0, eff));
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
        const eff = row.originalPending - row.tds - row.discount;
        const toApply = Math.min(remaining, Math.max(0, eff));
        remaining -= toApply;
        return { ...row, amountReceived: toApply };
      });
    });
  }

  function applyTds(invoiceId: number, tds: number)  { setRows(prev => prev.map(r => r.invoiceId === invoiceId ? { ...r, tds }      : r)); }
  function applyDiscount(invoiceId: number, disc: number) { setRows(prev => prev.map(r => r.invoiceId === invoiceId ? { ...r, discount: disc } : r)); }

  // ── Totals ─────────────────────────────────────────────────────────────────
  const checkedRows         = rows.filter(r => r.checked);
  const totalInvoiceAmount  = checkedRows.reduce((s, r) => s + r.totalAmount, 0);
  const totalTds            = checkedRows.reduce((s, r) => s + r.tds, 0);
  const totalDiscount       = checkedRows.reduce((s, r) => s + r.discount, 0);
  const totalAmtReceived    = checkedRows.reduce((s, r) => s + r.amountReceived, 0);
  const allChecked          = rows.length > 0 && rows.every(r => r.checked);
  const someChecked         = rows.some(r => r.checked);
  const displayRows         = invoiceSearch ? rows.filter(r => r.invoiceNo.includes(invoiceSearch)) : rows;

  // ── Save ───────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!partyId || !amountReceived) { alert("Please fill required fields"); return; }
    setSaving(true);
    setError(null);
    try {
      const allocations = checkedRows
        .filter(r => r.amountReceived > 0)
        .map(r => ({ invoiceId: r.invoiceId, amount: r.amountReceived }));

      const payload = {
        partyId,
        date,
        mode:        paymentMode,
        amount:      parseFloat(amountReceived),
        notes:       notes || undefined,
        allocations,
      };

      if (isEditing && editId) {
        await updatePaymentIn(editId, payload);
      } else {
        await createPaymentIn({ ...payload, partyId });
      }

      navigate("/cashier/payment-in-list");
    } catch (err: any) {
      setError(err.message ?? "Failed to save payment");
    } finally {
      setSaving(false);
    }
  }

  const isSaveEnabled = !!(partyId && parseFloat(amountReceived) > 0) && !saving;

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>Loading…</div>;

  return (
    <>
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <div className="pi-navbar">
        <div className="pi-navbar-left">
          <button className="pi-back-btn" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <span className="pi-navbar-title">
            {isEditing ? `Edit Payment In #${paymentNumber}` : `Record Payment In #${paymentNumber}`}
          </span>
        </div>
        <div className="pi-navbar-right">
          <button className="pi-nav-settings-btn" onClick={() => setShowSettings(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Settings
          </button>
          <button className="pi-nav-cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
          <button className={`pi-nav-save-btn${!isSaveEnabled ? " pi-nav-save-btn--disabled" : ""}`} disabled={!isSaveEnabled} onClick={handleSave}>
            {saving ? "Saving…" : isEditing ? "Save Changes" : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ margin: "12px 24px", padding: "10px 16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, color: "#dc2626", fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* ── Page ─────────────────────────────────────────────────────────── */}
      <div className="pi-page">
        <div className="pi-top-grid">
          {/* Left card */}
          <div className="pi-card">
            <div className="pi-form-field">
              <label className="pi-form-label">Party Name</label>
              <PartyDropdown value={partyName} partyId={partyId} onChange={(name, id) => { setPartyName(name); setPartyId(id); setAmountReceived("0"); }} disabled={isEditing} />
            </div>
            <div className="pi-row-2">
              <div className="pi-form-field">
                <label className="pi-form-label">Amount Received</label>
                <input className="pi-input" type="number" value={amountReceived} onChange={e => setAmountReceived(e.target.value)} />
              </div>
              <div className="pi-form-field">
                <label className="pi-form-label">Payment In Discount</label>
                <input className="pi-input" type="number" value={discount} onChange={e => setDiscount(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Right card */}
          <div className="pi-card">
            <div className={paymentMode !== "Cash" ? "pi-row-3" : "pi-row-2"}>
              <div className="pi-form-field">
                <label className="pi-form-label">Payment Date</label>
                <DateField value={date} onChange={setDate} />
              </div>
              <div className="pi-form-field">
                <label className="pi-form-label">Payment Mode</label>
                <select className="pi-select" value={paymentMode} onChange={e => { setPaymentMode(e.target.value); setPaymentReceivedIn(""); }}>
                  {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              {paymentMode !== "Cash" && (
                <div className="pi-form-field">
                  <label className="pi-form-label">Payment Received In</label>
                  <AccountDropdown partyId={partyId} value={paymentReceivedIn} onChange={setPaymentReceivedIn} />
                </div>
              )}
            </div>
            <div className="pi-form-field" style={{ maxWidth: 240 }}>
              <label className="pi-form-label">Payment In Number</label>
              <input className="pi-input" value={paymentNumber} onChange={e => setPaymentNumber(e.target.value)} />
            </div>
            <div className="pi-form-field">
              <label className="pi-form-label">Notes</label>
              <textarea className="pi-textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Enter Notes" />
            </div>
          </div>
        </div>

        {/* ── Settle Invoices ────────────────────────────────────────────── */}
        {!partyId ? (
          <div className="pi-empty-card">
            <div className="pi-empty">
              <svg viewBox="0 0 120 100" fill="none" style={{ width: 120 }}>
                <rect x="20" y="10" width="60" height="70" rx="4" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1.5"/>
                <rect x="28" y="25" width="44" height="5" rx="2" fill="#e5e7eb"/>
                <rect x="28" y="36" width="32" height="5" rx="2" fill="#e5e7eb"/>
                <rect x="28" y="47" width="38" height="5" rx="2" fill="#e5e7eb"/>
                <circle cx="85" cy="65" r="20" fill="#ede9fe"/>
                <path d="M85 55 L85 75 M75 65 L95 65" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              <div className="pi-empty-title">No party selected!</div>
              <div className="pi-empty-sub">Select Party Name to view transactions</div>
            </div>
          </div>
        ) : (
          <div className="pi-settle-section">
            <div className="pi-settle-hdr">
              <span className="pi-settle-title">Settle invoices with this payment</span>
              <div className="pi-settle-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input placeholder="Search Invoice Number" value={invoiceSearch} onChange={e => setInvoiceSearch(e.target.value)} />
              </div>
            </div>
            <div className="pi-settle-table-wrap">
              <table className="pi-settle-table">
                <thead>
                  <tr>
                    <th className="pi-sth pi-sth--cb">
                      <input type="checkbox" checked={allChecked} onChange={e => toggleAll(e.target.checked)} ref={el => { if (el) el.indeterminate = !allChecked && someChecked; }} />
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
                  {loadingInvoices ? (
                    <tr><td colSpan={8} style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>Loading invoices…</td></tr>
                  ) : displayRows.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#9ca3af", fontSize: 13 }}>No pending invoices for this party</td></tr>
                  ) : displayRows.map(row => {
                    const effectivePending = row.originalPending - row.tds - row.discount;
                    const pending = row.checked ? effectivePending - row.amountReceived : row.originalPending;
                    return (
                      <tr key={row.invoiceId} className={`pi-str${row.checked ? " pi-str--checked" : ""}`}>
                        <td className="pi-std pi-std--cb"><input type="checkbox" checked={row.checked} onChange={e => toggleRow(row.invoiceId, e.target.checked)} /></td>
                        <td className="pi-std">{fmtDate(row.invoiceDate)}</td>
                        <td className="pi-std">{row.dueDate ? fmtDate(row.dueDate) : "–"}</td>
                        <td className="pi-std">{row.invoiceNo}</td>
                        <td className="pi-std">
                          <span>{fmtCurrency(row.totalAmount)}</span>
                          {pending > 0.01 && <span className="pi-pending-txt"> ({fmtCurrency(pending)} pending)</span>}
                        </td>
                        <td className="pi-std">
                          {row.checked ? (
                            <button className="pi-apply-link" onClick={() => setTdsModal({ invoiceId: row.invoiceId, invoiceNo: row.invoiceNo, pending: row.originalPending })}>
                              {row.tds > 0 ? fmtCurrency(row.tds) : "Apply TDS"}
                            </button>
                          ) : null}
                        </td>
                        <td className="pi-std">
                          <button className="pi-apply-link" onClick={() => setDiscModal({ invoiceId: row.invoiceId, invoiceNo: row.invoiceNo, pending: row.originalPending })}>
                            {row.discount > 0 ? fmtCurrency(row.discount) : "Apply Discount"}
                          </button>
                        </td>
                        <td className="pi-std pi-std--right">{row.checked ? fmtCurrency(row.amountReceived) : "₹0"}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="pi-tfoot-row">
                    <td className="pi-std" colSpan={4}><strong>Total</strong></td>
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
      {showSettings && <QuickSettingsModal nextNo={nextPaymentNo} onClose={() => setShowSettings(false)} onSave={setPaymentNumber} />}
      {tdsModal && <ApplyTDSModal invoiceNo={tdsModal.invoiceNo} pending={tdsModal.pending} onApply={tds => applyTds(tdsModal.invoiceId, tds)} onClose={() => setTdsModal(null)} />}
      {discModal && <ApplyDiscountModal invoiceNo={discModal.invoiceNo} pending={discModal.pending} onApply={disc => applyDiscount(discModal.invoiceId, disc)} onClose={() => setDiscModal(null)} />}
    </>
  );
}