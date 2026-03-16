import { useEffect, useRef, useState } from "react";
import "./InvoiceViewModal.css";

// ─── TDS Rate data ────────────────────────────────────────────────────────────
const DEFAULT_TDS_RATES = [
  { label: "0.75% - 194C Payment to Contractor (individuals/ HUF) (Reduced)", rate: 0.75 },
  { label: "1.0% - 194C Payment to Contractor (individuals/ HUF)", rate: 1.0 },
  { label: "1.5% - 194C Payment to Contractor (others) (reduced)", rate: 1.5 },
  { label: "2.0% - 194C Payment to Contractor (others)", rate: 2.0 },
  { label: "2.0% - 194I Rent (Plant / Machinery / Equipment)", rate: 2.0 },
  { label: "2.0% - 194J Professional Fees / Technical Services / Royalty (technical services)", rate: 2.0 },
  { label: "3.75% - 194H Commission or Brokerage (Reduced)", rate: 3.75 },
  { label: "5.0% - 194D Insurance Commission", rate: 5.0 },
  { label: "7.5% - 194 Dividend (Reduced)", rate: 7.5 },
  { label: "7.5% - 194J Professional Fees / Technical Services / Royalty (others) (reduced)", rate: 7.5 },
  { label: "10.0% - 193 Interest on Securities", rate: 10.0 },
  { label: "10.0% - 194 Dividend", rate: 10.0 },
  { label: "10.0% - 194A Interest other than Interest on Securities (by banks)", rate: 10.0 },
  { label: "10.0% - 194I Rent (Land & Building)", rate: 10.0 },
  { label: "10.0% - 194J Professional Fees / Technical Services / Royalty (others)", rate: 10.0 },
  { label: "10.0% - 194K Payment to resident units", rate: 10.0 },
  { label: "30.0% - 194B Lottery / Crossword Puzzle", rate: 30.0 },
  { label: "0.1% - 194Q Purchase of goods", rate: 0.1 },
  { label: "2.0% - 194H Commission or Brokerage", rate: 2.0 },
];

function loadTdsRates(): { label: string; rate: number }[] {
  try {
    const custom = JSON.parse(localStorage.getItem("customTdsRates") || "[]");
    return [...DEFAULT_TDS_RATES, ...custom];
  } catch { return DEFAULT_TDS_RATES; }
}

function persistCustomTdsRate(r: { label: string; rate: number }) {
  try {
    const custom = JSON.parse(localStorage.getItem("customTdsRates") || "[]");
    localStorage.setItem("customTdsRates", JSON.stringify([...custom, r]));
  } catch {}
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface SalesInvoice {
  id: string;
  invoiceNo: number;
  invoiceDate: string;
  party: { name: string; mobile?: string; billingAddress?: string; gstin?: string } | null;
  shipTo?: { name: string; mobile?: string; billingAddress?: string } | null;
  billItems: { name?: string; description?: string; hsn?: string; qty: number; unit?: string; price: number; discountPct: number; discountAmt: number; taxRate: number; taxLabel?: string; amount: number }[];
  additionalCharges: { label?: string; amount: number }[];
  discountPct: number;
  discountAmt: number;
  applyTCS: boolean;
  tcsRate: number;
  tcsLabel?: string;
  tcsBase?: string;
  roundOffAmt: number;
  amountReceived: number;
  notes?: string;
  termsConditions?: string;
  eWayBillNo?: string;
  challanNo?: string;
  financedBy?: string;
  salesman?: string;
  dueDate?: string;
  showDueDate?: boolean;
  status: string;
  createdAt: string;
}

interface SavedTemplate {
  id: string; name: string; themeColor: string;
  style: { font: string; textSize: string; themeColor: string; borderColor: string; borderWidth: string; showLogo: boolean; logoUrl: string };
  vis: { companyName: boolean; slogan: boolean; address: boolean; gstin: boolean; phone: boolean; pan: boolean; email: boolean };
  misc: { showNotes: boolean; amountWords: boolean; showTerms: boolean; receiverSig: boolean; signatureUrl: string };
  ts: { hsnSummary: boolean; showDesc: boolean; capitalize: boolean; cols: Record<string, boolean>; backgroundUrl: string; backgroundOpacity: number };
  inv: { companyName: string; slogan: string; address: string; gstin: string; phone: string; email: string; pan: string; bank: string; ifsc: string; terms: string };
}

interface Business {
  companyName: string; address: string; gstin: string;
  phone: string; email: string; pan: string; bank: string; ifsc: string;
}

interface Props {
  invoice: SalesInvoice;
  template: SavedTemplate | null;
  business: Business;
  onClose: () => void;
  onEdit: () => void;
  onPrint: () => void;
  onDownload: () => void;
  onPaymentSaved?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onCancel?: () => void;
  onCreditNote?: () => void;
  onProfitDetails?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtDateGB(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtC(n: number) {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}
function calcTotal(inv: Pick<SalesInvoice,"billItems"|"additionalCharges"|"discountPct"|"discountAmt"|"applyTCS"|"tcsRate"|"tcsBase"|"roundOffAmt">): number {
  const items = inv.billItems.reduce((s, i) => s + i.amount, 0);
  const charges = inv.additionalCharges.reduce((s, c) => s + c.amount, 0);
  const taxable = items + charges;
  const disc = taxable * (inv.discountPct / 100) + inv.discountAmt;
  const after = taxable - disc;
  const tcsBaseAmt = inv.tcsBase === "Taxable Amount" ? taxable : after;
  const tcs = inv.applyTCS ? tcsBaseAmt * (inv.tcsRate / 100) : 0;
  return Math.round((after + tcs + inv.roundOffAmt) * 100) / 100;
}
function numToWords(n: number): string {
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  if (n === 0) return "Zero";
  function h(num: number): string {
    if (num === 0) return "";
    if (num < 20) return ones[num] + " ";
    if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? " "+ones[num%10] : "") + " ";
    if (num < 1000) return ones[Math.floor(num/100)] + " Hundred " + h(num%100);
    if (num < 100000) return h(Math.floor(num/1000)) + "Thousand " + h(num%1000);
    if (num < 10000000) return h(Math.floor(num/100000)) + "Lakh " + h(num%100000);
    return h(Math.floor(num/10000000)) + "Crore " + h(num%10000000);
  }
  const intPart = Math.floor(n);
  const decPart = Math.round((n - intPart) * 100);
  let result = h(intPart).trim() + " Rupees";
  if (decPart > 0) result += " and " + h(decPart).trim() + " Paise";
  return result + " Only";
}

// ─── Add TDS Rate Modal ───────────────────────────────────────────────────────
function AddTdsRateModal({ onClose, onSaved }: { onClose: () => void; onSaved: (r: { label: string; rate: number }) => void }) {
  const [taxName, setTaxName] = useState("");
  const [section, setSection] = useState("");
  const [rate, setRate] = useState(0);
  const canSave = taxName.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    const label = `${rate}% - ${section.trim() ? section.trim() + " " : ""}${taxName.trim()}`;
    const r = { label, rate };
    persistCustomTdsRate(r);
    onSaved(r);
  }

  const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 4000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 14, width: 500, maxWidth: "95vw", boxShadow: "0 24px 60px rgba(0,0,0,.22)", fontFamily: "Segoe UI, sans-serif" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #f3f4f6" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Add Tds Rate</span>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "#374151", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={{ fontSize: 13, color: "#374151", fontWeight: 500, display: "block", marginBottom: 6 }}>Tax name</label>
            <input value={taxName} onChange={e => setTaxName(e.target.value)} placeholder="Enter Tax Name" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "#374151", fontWeight: 500, display: "block", marginBottom: 6 }}>Enter Section Name</label>
            <input value={section} onChange={e => setSection(e.target.value)} placeholder="Enter Section Name" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "#374151", fontWeight: 500, display: "block", marginBottom: 6 }}>Enter Rate (in %)</label>
            <input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} style={inp} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: "1px solid #f3f4f6" }}>
          <button onClick={onClose} style={{ padding: "9px 22px", border: "1px solid #e5e7eb", background: "#fff", borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#374151", fontWeight: 500 }}>Close</button>
          <button onClick={handleSave} disabled={!canSave} style={{ padding: "9px 22px", background: canSave ? "#4f46e5" : "#c7d2fe", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: canSave ? "pointer" : "not-allowed" }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Record Payment Modal ─────────────────────────────────────────────────────
const PM_LIST = ["Cash", "UPI", "Card", "Netbanking", "Bank Transfer", "Cheque"] as const;

function RecordPaymentModal({ invoice, onClose, onSaved }: { invoice: SalesInvoice; onClose: () => void; onSaved: (updated: SalesInvoice) => void }) {
  const grandTotal = calcTotal(invoice);
  const pending = Math.max(0, grandTotal - invoice.amountReceived);

  const [amount, setAmount] = useState(String(Math.round(pending * 100) / 100));
  const [discount, setDiscount] = useState("0");
  const [applyTds, setApplyTds] = useState(false);
  const [tdsRates, setTdsRates] = useState<{ label: string; rate: number }[]>(loadTdsRates);
  const [selTds, setSelTds] = useState<{ label: string; rate: number } | null>(null);
  const [showTdsDrop, setShowTdsDrop] = useState(false);
  const [showAddTds, setShowAddTds] = useState(false);
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [payMode, setPayMode] = useState<typeof PM_LIST[number]>("Cash");
  const [showModeDrop, setShowModeDrop] = useState(false);
  const [notes, setNotes] = useState("");

  const tdsRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (tdsRef.current && !tdsRef.current.contains(e.target as Node)) setShowTdsDrop(false);
      if (modeRef.current && !modeRef.current.contains(e.target as Node)) setShowModeDrop(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const amt = parseFloat(amount) || 0;
  const disc = parseFloat(discount) || 0;
  const tdsAmt = applyTds && selTds ? pending * selTds.rate / 100 : 0;
  const balance = Math.max(0, pending - amt - disc - tdsAmt);

  function handleSave() {
    const invoices: SalesInvoice[] = JSON.parse(localStorage.getItem("salesInvoices") || "[]");
    const idx = invoices.findIndex(i => i.id === invoice.id);
    if (idx < 0) { onClose(); return; }
    const total = calcTotal(invoices[idx]);
    const newAmt = Math.min(invoice.amountReceived + amt, total);
    invoices[idx].amountReceived = newAmt;
    invoices[idx].status = newAmt >= total ? "Paid" : newAmt > 0 ? "Partially Paid" : "Unpaid";
    localStorage.setItem("salesInvoices", JSON.stringify(invoices));

    // Save to payment-in list
    const settings = JSON.parse(localStorage.getItem("paymentInSettings") || "{}");
    const piList = JSON.parse(localStorage.getItem("paymentInList") || "[]");
    const nextSeq = settings.seqNo || piList.length + 1;
    const prefix = settings.prefix || "";
    piList.push({
      id: `pi-${Date.now()}`,
      date: payDate,
      paymentNumber: prefix + String(nextSeq),
      partyName: invoice.party?.name || "",
      totalAmountSettled: amt,
      amountReceived: amt,
      discount: disc,
      paymentMode: payMode,
      notes,
      settledInvoices: [{
        invoiceId: invoice.id,
        invoiceNo: invoice.invoiceNo,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate || "",
        totalAmount: grandTotal,
        tds: tdsAmt,
        discount: disc,
        amountReceived: amt,
        balanceAmount: balance,
      }],
    });
    localStorage.setItem("paymentInList", JSON.stringify(piList));
    localStorage.setItem("paymentInSettings", JSON.stringify({ ...settings, seqNo: nextSeq + 1 }));
    onSaved(invoices[idx]);
    onClose();
  }

  const dropItem = (label: string, active: boolean): React.CSSProperties => ({
    padding: "9px 14px", fontSize: 13, color: active ? "#4f46e5" : "#374151",
    cursor: "pointer", background: active ? "#ede9fe" : "transparent",
    fontWeight: active ? 600 : 400, borderBottom: "1px solid #f9fafb",
  });
  const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fff", fontFamily: "inherit" };
  const dropBox: React.CSSProperties = { position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 200, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, boxShadow: "0 10px 28px rgba(0,0,0,.13)", maxHeight: 250, overflowY: "auto" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: 860, maxWidth: "97vw", maxHeight: "93vh", overflowY: "auto", boxShadow: "0 24px 70px rgba(0,0,0,.22)", fontFamily: "Segoe UI, sans-serif", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 26px", borderBottom: "1px solid #f3f4f6", flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Record Payment For Invoice #{invoice.invoiceNo}</span>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#374151", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 20, padding: "22px 26px", flex: 1 }}>

          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Amount + Discount + TDS */}
            <div style={{ background: "#f9fafb", borderRadius: 12, padding: "18px 18px 16px", border: "1px solid #e5e7eb" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 5 }}>Amount Received</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 5 }}>
                    Payment In Discount &nbsp;<span style={{ display: "inline-flex", width: 15, height: 15, borderRadius: "50%", border: "1px solid #d1d5db", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#9ca3af" }}>i</span>
                  </label>
                  <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} style={inp} />
                </div>
              </div>

              {/* Apply TDS */}
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#374151", cursor: "pointer", userSelect: "none", marginBottom: applyTds ? 12 : 0 }}>
                <input type="checkbox" checked={applyTds} onChange={e => { setApplyTds(e.target.checked); if (!e.target.checked) setSelTds(null); }}
                  style={{ width: 16, height: 16, accentColor: "#4f46e5", cursor: "pointer" }} />
                Apply TDS
              </label>

              {/* TDS Dropdown */}
              {applyTds && (
                <div ref={tdsRef} style={{ position: "relative" }}>
                  <div onClick={() => setShowTdsDrop(v => !v)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, color: selTds ? "#111827" : "#9ca3af", userSelect: "none" }}>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>{selTds ? selTds.label : "Select Tds Rate"}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, flexShrink: 0, transform: showTdsDrop ? "rotate(180deg)" : "" }}><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                  {showTdsDrop && (
                    <div style={dropBox}>
                      {tdsRates.map((r, i) => (
                        <div key={i} style={dropItem(r.label, selTds?.label === r.label)}
                          onMouseDown={e => { e.preventDefault(); setSelTds(r); setShowTdsDrop(false); }}
                          onMouseEnter={e => { if (selTds?.label !== r.label) (e.currentTarget as HTMLDivElement).style.background = "#f5f3ff"; }}
                          onMouseLeave={e => { if (selTds?.label !== r.label) (e.currentTarget as HTMLDivElement).style.background = ""; }}>
                          {r.label}
                        </div>
                      ))}
                      <div onMouseDown={e => { e.preventDefault(); setShowTdsDrop(false); setShowAddTds(true); }}
                        style={{ padding: "10px 14px", fontSize: 13, color: "#4f46e5", cursor: "pointer", fontWeight: 600, borderTop: "1px solid #f3f4f6", background: "#fafafe" }}>
                        + Add New Tds Rate
                      </div>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6b7280", marginTop: 10, padding: "0 2px" }}>
                    <span>TDS Applicable on bill</span>
                    <span style={{ color: "#374151", fontWeight: 500 }}>- {fmtC(tdsAmt)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Date + Mode */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 5 }}>Payment Date</label>
                <div onClick={() => dateRef.current?.showPicker?.()}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", border: "1px solid #e5e7eb", borderRadius: 8, height: 40, cursor: "pointer", background: "#fff", position: "relative" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15, color: "#6b7280", flexShrink: 0 }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span style={{ flex: 1, fontSize: 13, color: "#111827" }}>{fmtDateGB(payDate)}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13, color: "#9ca3af" }}><polyline points="6 9 12 15 18 9" /></svg>
                  <input ref={dateRef} type="date" value={payDate} onChange={e => setPayDate(e.target.value)}
                    style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }} />
                </div>
              </div>
              <div ref={modeRef} style={{ position: "relative" }}>
                <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 5 }}>Payment Mode</label>
                <div onClick={() => setShowModeDrop(v => !v)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", border: `1px solid ${showModeDrop ? "#4f46e5" : "#e5e7eb"}`, borderRadius: 8, height: 40, cursor: "pointer", fontSize: 13, color: "#111827", background: "#fff", userSelect: "none" }}>
                  <span>{payMode}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, color: "#9ca3af", transform: showModeDrop ? "rotate(180deg)" : "" }}><polyline points="6 9 12 15 18 9" /></svg>
                </div>
                {showModeDrop && (
                  <div style={{ ...dropBox, maxHeight: "none" }}>
                    {PM_LIST.map(m => (
                      <div key={m} style={dropItem(m, payMode === m)}
                        onMouseDown={e => { e.preventDefault(); setPayMode(m); setShowModeDrop(false); }}
                        onMouseEnter={e => { if (payMode !== m) (e.currentTarget as HTMLDivElement).style.background = "#f5f3ff"; }}
                        onMouseLeave={e => { if (payMode !== m) (e.currentTarget as HTMLDivElement).style.background = payMode === m ? "#ede9fe" : ""; }}>
                        {m}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 5 }}>Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, resize: "vertical", minHeight: 90, outline: "none", fontFamily: "inherit", boxSizing: "border-box", background: "#fff" }} />
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Invoice info */}
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Invoice #{invoice.invoiceNo}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#374151", marginBottom: 4 }}>
                <span>Invoice Amount</span><span style={{ fontWeight: 600 }}>{fmtC(grandTotal)}</span>
              </div>
              {invoice.party?.name && <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 3 }}>{invoice.party.name}</div>}
              {invoice.dueDate && <div style={{ fontSize: 12, color: "#6b7280" }}>Due Date: {fmtDateGB(invoice.dueDate)}</div>}
            </div>

            {/* Calculation */}
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 12 }}>Record Payment Calculation</div>
              <div style={{ border: "1px solid #f3f4f6", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, padding: "10px 12px", borderBottom: "1px solid #f3f4f6", color: "#ef4444" }}>
                  <span>Invoice Pending Amt.</span><span>{fmtC(pending)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#374151", padding: "10px 12px", borderBottom: "1px solid #f3f4f6" }}>
                  <span>Amount Received</span><span>{fmtC(amt)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#374151", padding: "10px 12px", borderBottom: applyTds && tdsAmt > 0 ? "1px solid #f3f4f6" : "none" }}>
                  <span>Payment In Discount</span><span>{fmtC(disc)}</span>
                </div>
                {applyTds && tdsAmt > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#374151", padding: "10px 12px", borderBottom: "none" }}>
                    <span>TDS Deducted</span><span>- {fmtC(tdsAmt)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, padding: "12px 12px", borderTop: "1px solid #f3f4f6" }}>
                  <span style={{ color: "#6b7280" }}>Balance Amount</span>
                  <span style={{ color: balance === 0 ? "#16a34a" : "#374151" }}>{fmtC(balance)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "16px 26px", borderTop: "1px solid #f3f4f6", flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: "9px 26px", border: "1px solid #e5e7eb", background: "#fff", borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#374151", fontWeight: 500 }}>Close</button>
          <button onClick={handleSave} style={{ padding: "9px 28px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Save</button>
        </div>
      </div>

      {showAddTds && (
        <AddTdsRateModal
          onClose={() => setShowAddTds(false)}
          onSaved={r => { setTdsRates(prev => [...prev, r]); setSelTds(r); setShowAddTds(false); }}
        />
      )}
    </div>
  );
}

// ─── Main InvoiceViewModal ────────────────────────────────────────────────────
export default function InvoiceViewModal({ invoice: initialInvoice, template, business, onClose, onEdit, onPrint, onDownload, onPaymentSaved, onDuplicate, onDelete, onCancel, onCreditNote, onProfitDetails }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const [invoice, setInvoice] = useState<SalesInvoice>(initialInvoice);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [dotsOpen, setDotsOpen] = useState(false);
  const [showProfitModal, setShowProfitModal] = useState(false);
  const dotsRef = useRef<HTMLDivElement>(null);

  const tc = template?.style.themeColor ?? "#4f46e5";
  const font = template?.style.font ?? "Inter";
  const fontSize = template?.style.textSize ?? "13px";
  const borderColor = template?.style.borderColor ?? "#e5e7eb";
  const borderWidth = template?.style.borderWidth ?? "1";
  const bw = `${borderWidth}px solid ${borderColor}`;
  const bgUrl = template?.ts.backgroundUrl ?? "";
  const bgOpacity = template?.ts.backgroundOpacity ?? 15;
  const showLogo = template?.style.showLogo && template?.style.logoUrl;
  const logoUrl = template?.style.logoUrl ?? "";
  const companyName = template?.inv.companyName || business.companyName;
  const address = template?.inv.address || business.address;
  const gstin = template?.inv.gstin || business.gstin;
  const phone = template?.inv.phone || business.phone;
  const email = template?.inv.email || business.email;
  const pan = template?.inv.pan || business.pan;
  const bankInfo = template?.inv.bank || business.bank;
  const ifsc = template?.inv.ifsc || business.ifsc;
  const defaultTerms = template?.inv.terms || "Goods once sold will not be taken back.";
  const vis = template?.vis ?? { companyName: true, address: true, gstin: true, phone: true, email: true, slogan: false, pan: false };
  const misc = template?.misc ?? { showNotes: true, amountWords: true, showTerms: true, receiverSig: false, signatureUrl: "" };
  const ts = template?.ts ?? { hsnSummary: false, showDesc: true, capitalize: false, cols: {}, backgroundUrl: "", backgroundOpacity: 15 };

  const showSerial = ts.cols["Serial Number"] !== false;
  const showHSN = ts.cols["HSN"] !== false;
  const showQty = ts.cols["Quantity"] !== false;
  const showRate = ts.cols["Rate/Item"] !== false;
  const showAmt = ts.cols["Amount"] !== false;

  const subtotal = invoice.billItems.reduce((s, i) => s + i.qty * i.price, 0);
  const totalTax = invoice.billItems.reduce((s, i) => {
    const base = i.qty * i.price - (i.qty * i.price * i.discountPct / 100) - i.discountAmt;
    return s + base * i.taxRate / 100;
  }, 0);
  const chargesTotal = invoice.additionalCharges.reduce((s, c) => s + c.amount, 0);
  const taxable = subtotal + chargesTotal;
  const discVal = taxable * invoice.discountPct / 100 || invoice.discountAmt;
  const afterDisc = taxable - discVal;
  const tcsValue = invoice.applyTCS ? afterDisc * invoice.tcsRate / 100 : 0;
  const grandTotal = afterDisc + tcsValue + invoice.roundOffAmt;
  const balance = grandTotal - invoice.amountReceived;

  const hsnGroups: Record<string, { taxable: number; cgst: number; sgst: number }> = {};
  invoice.billItems.forEach(item => {
    const hsn = item.hsn || "–";
    const base = item.qty * item.price - (item.qty * item.price * item.discountPct / 100) - item.discountAmt;
    const tax = base * item.taxRate / 100;
    if (!hsnGroups[hsn]) hsnGroups[hsn] = { taxable: 0, cgst: 0, sgst: 0 };
    hsnGroups[hsn].taxable += base;
    hsnGroups[hsn].cgst += tax / 2;
    hsnGroups[hsn].sgst += tax / 2;
  });

  function handlePrint() {
    const content = printRef.current?.innerHTML ?? "";
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Invoice #${invoice.invoiceNo}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=${font.replace(/ /g,"+")}:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: '${font}', sans-serif; font-size: ${fontSize}; color: #1a1a1a; }
        .inv-print { padding: 32px; } table { width: 100%; border-collapse: collapse; }
        th, td { padding: 7px 10px; font-size: ${fontSize}; }
        @media print { body { margin: 0; } }
      </style></head><body><div class="inv-print">${content}</div></body></html>`);
    w.document.close(); w.focus();
    setTimeout(() => { w.print(); w.close(); }, 500);
  }

  useEffect(() => {
    function h(e: KeyboardEvent) { if (e.key === "Escape" && !showRecordPayment) onClose(); }
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [showRecordPayment]);

  const statusColor = invoice.status === "Paid" ? "#16a34a" : invoice.status === "Unpaid" ? "#dc2626" : invoice.status === "Partially Paid" ? "#d97706" : "#6b7280";

  return (
    <>
      <div className="ivm-overlay" onClick={onClose}>
        <div className="ivm-shell" onClick={e => e.stopPropagation()}>

          {/* Top Bar */}
          <div className="ivm-topbar">
            <div className="ivm-topbar-left">
              <button className="ivm-back-btn" onClick={onClose}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <span className="ivm-title">Sales Invoice #{invoice.invoiceNo}</span>
              <span className="ivm-status-badge" style={{ background: statusColor+"18", color: statusColor, border: `1px solid ${statusColor}40` }}>
                {invoice.status}
              </span>
            </div>
            <div className="ivm-topbar-right">
              <button className="ivm-top-btn" onClick={() => { setShowProfitModal(true); onProfitDetails?.(); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                Profit Details
              </button>
              <div ref={dotsRef} style={{ position: "relative" }}>
                <button className="ivm-top-btn ivm-top-btn--dots" onClick={() => setDotsOpen(v => !v)}>
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{width:16,height:16}}><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                </button>
                {dotsOpen && (
                  <div style={{ position:"absolute", top:"calc(100% + 6px)", right:0, zIndex:500, background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, boxShadow:"0 10px 28px rgba(0,0,0,.15)", minWidth:200, overflow:"hidden" }} onClick={() => setDotsOpen(false)}>
                    {[
                      { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, label:"Edit", action: onEdit },
                      { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.99"/></svg>, label:"Edit History", action: () => {} },
                      { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>, label:"Duplicate", action: onDuplicate },
                      { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, label:"Issue Credit Note", action: onCreditNote },
                      null, // separator
                      { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>, label:"Cancel Invoice", action: onCancel, warning: true },
                      { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>, label:"Delete", action: onDelete, danger: true },
                    ].map((item, i) => item === null ? (
                      <div key={i} style={{ height:1, background:"#f3f4f6", margin:"2px 0" }} />
                    ) : (
                      <button key={i} onClick={item.action}
                        style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"10px 16px", background:"none", border:"none", cursor:"pointer", fontSize:14, color: (item as any).danger ? "#dc2626" : (item as any).warning ? "#d97706" : "#374151", fontWeight:500, textAlign:"left" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                        {item.icon} {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="ivm-close-btn" onClick={onClose}>✕</button>
            </div>
          </div>

          {/* Action Bar */}
          <div className="ivm-actionbar">
            <div className="ivm-actionbar-left">
              <div className="ivm-action-group">
                <button className="ivm-action-btn" onClick={handlePrint}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Print PDF
                </button>
                <button className="ivm-action-split"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></button>
              </div>
              <div className="ivm-action-group">
                <button className="ivm-action-btn" onClick={onDownload}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download PDF
                </button>
                <button className="ivm-action-split"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></button>
              </div>
              <div className="ivm-action-group">
                <button className="ivm-action-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  Share
                </button>
                <button className="ivm-action-split"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></button>
              </div>
            </div>
            <div className="ivm-actionbar-right">
              {/* <button className="ivm-eway-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                Generate E-way Bill
              </button>
              <button className="ivm-einvoice-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Generate e-Invoice
              </button> */}
              {/* ← NOW opens the Record Payment Modal */}
              <button className="ivm-record-btn" onClick={e => { e.stopPropagation(); setShowRecordPayment(true); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Record Payment In
              </button>
            </div>
          </div>

          {/* Main Body */}
          <div className="ivm-body">
            <div className="ivm-preview-area">
              <div className="ivm-preview-label">TAX INVOICE <span className="ivm-original-tag">ORIGINAL FOR RECIPIENT</span></div>
              <div ref={printRef} className="ivm-invoice-paper" style={{ fontFamily: font, fontSize, position: "relative", overflow: "hidden" }}>
                {bgUrl && <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${bgUrl})`, backgroundSize: "cover", backgroundPosition: "center", opacity: bgOpacity/100, pointerEvents: "none", zIndex: 0 }}/>}
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div className="ivm-inv-header">
                    {showLogo && <img src={logoUrl} alt="logo" className="ivm-inv-logo"/>}
                    <div style={{ flex: 1 }}>
                      {vis.companyName && <div className="ivm-inv-company" style={{ color: tc }}>{companyName}</div>}
                      {vis.address && <div className="ivm-inv-meta">{address}</div>}
                      <div className="ivm-inv-meta">{[vis.gstin && `GSTIN: ${gstin}`, vis.phone && `Mobile: ${phone}`, vis.email && `Email: ${email}`].filter(Boolean).join("  |  ")}</div>
                      {vis.pan && <div className="ivm-inv-meta">PAN: {pan}</div>}
                    </div>
                    <div className="ivm-inv-meta-box">
                      <div className="ivm-inv-meta-row"><span>Invoice No.</span><strong>{invoice.invoiceNo}</strong></div>
                      <div className="ivm-inv-meta-row"><span>Invoice Date</span><strong>{fmtDate(invoice.invoiceDate)}</strong></div>
                      {invoice.financedBy && <div className="ivm-inv-meta-row"><span>Financed By</span><strong>{invoice.financedBy}</strong></div>}
                    </div>
                  </div>
                  <hr style={{ borderColor: tc, borderWidth: "1.5px", margin: "8px 0" }}/>
                  <div className="ivm-party-grid">
                    <div className="ivm-party-box" style={{ border: bw }}>
                      <div className="ivm-party-label" style={{ color: tc }}>BILL TO</div>
                      {invoice.party ? (<>
                        <div className="ivm-party-name">{invoice.party.name}</div>
                        {invoice.party.mobile && <div className="ivm-party-detail">Mobile: {invoice.party.mobile}</div>}
                        {invoice.party.billingAddress && <div className="ivm-party-detail">{invoice.party.billingAddress}</div>}
                        {invoice.party.gstin && <div className="ivm-party-detail">GSTIN: {invoice.party.gstin}</div>}
                      </>) : <div className="ivm-party-detail">–</div>}
                    </div>
                    {invoice.eWayBillNo && (
                      <div className="ivm-party-box" style={{ border: bw }}>
                        <div className="ivm-party-label" style={{ color: tc }}>E-WAY BILL</div>
                        <div className="ivm-party-detail">{invoice.eWayBillNo}</div>
                      </div>
                    )}
                  </div>
                  <table className="ivm-items-table">
                    <thead>
                      <tr style={{ background: tc, color: "#fff" }}>
                        {showSerial && <th>S.No</th>}
                        <th>Items</th>
                        {showHSN && <th>HSN/SAC</th>}
                        {showQty && <th>Qty.</th>}
                        {showRate && <th>Rate</th>}
                        <th>Tax</th>
                        {showAmt && <th className="right">Amount</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.billItems.map((item, i) => {
                        const base = item.qty * item.price - (item.qty * item.price * item.discountPct/100) - item.discountAmt;
                        const tax = base * item.taxRate / 100;
                        return (
                          <tr key={i} style={{ background: i%2===0 ? "#fafafa" : "#fff" }}>
                            {showSerial && <td className="center">{i+1}</td>}
                            <td>
                              <div>{ts.capitalize ? (item.name||"Item").toUpperCase() : (item.name||"Item")}</div>
                              {ts.showDesc && item.description && <div style={{ fontSize:"11px", color:"#6b7280" }}>{item.description}</div>}
                            </td>
                            {showHSN && <td className="center">{item.hsn||"–"}</td>}
                            {showQty && <td className="center">{item.qty} {item.unit||""}</td>}
                            {showRate && <td className="center">₹{item.price.toLocaleString("en-IN")}</td>}
                            <td className="center">{item.taxRate>0 ? (<>₹{tax.toFixed(2)}<div style={{fontSize:"11px",color:"#6b7280"}}>({item.taxRate}%)</div></>) : "–"}</td>
                            {showAmt && <td className="right">₹{item.amount.toLocaleString("en-IN")}</td>}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {/* SUBTOTAL full-width row */}
                  <table className="ivm-items-table" style={{ marginBottom: 0 }}>
                    <tbody>
                      <tr style={{ borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ fontWeight: 700, fontSize: "12px", padding: "8px 10px" }}>SUBTOTAL</td>
                        <td className="center" style={{ fontWeight: 700, fontSize: "12px" }}>{invoice.billItems.reduce((s,i)=>s+i.qty,0)}</td>
                        {showRate && <td />}
                        {showHSN && <td />}
                        <td />
                        <td className="right" style={{ fontWeight: 700, fontSize: "12px" }}>₹ {subtotal.toLocaleString("en-IN")}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Terms left + Totals breakdown right */}
                  <div className="ivm-totals-row" style={{ alignItems: "flex-start", marginTop: 0 }}>
                    <div style={{ flex: 1 }}>
                      {/* Bank Details - kept but hidden via comment for future use */}
                      {/* <div className="ivm-bank-box" style={{ border: bw }}>
                        <div style={{ fontWeight: 700, marginBottom: 4, fontSize: "12px" }}>Bank Details</div>
                        <div>{bankInfo}</div>
                        {ifsc && <div>IFSC: {ifsc}</div>}
                      </div> */}
                      {misc.showTerms && (
                        <div className="ivm-terms-box" style={{ marginTop: 0, background: "transparent", padding: "10px 0" }}>
                          <div style={{ fontWeight: 700, marginBottom: 4, fontSize: "12px" }}>TERMS AND CONDITIONS</div>
                          <div style={{ color: "#374151", fontSize: "12px" }}>{invoice.termsConditions || defaultTerms}</div>
                        </div>
                      )}
                    </div>
                    <table className="ivm-totals-table" style={{ minWidth: 280 }}>
                      <tbody>
                        {invoice.additionalCharges.map((c, i) => c.amount !== 0 && (
                          <tr key={i}>
                            <td style={{ borderBottom: "none" }}>{c.label || "Additional Charge"}</td>
                            <td className="right" style={{ borderBottom: "none" }}>₹ {c.amount.toLocaleString("en-IN")}</td>
                          </tr>
                        ))}
                        {discVal > 0 && (
                          <tr>
                            <td style={{ borderBottom: "none" }}>Discount</td>
                            <td className="right" style={{ borderBottom: "none" }}>- ₹ {discVal.toLocaleString("en-IN")}</td>
                          </tr>
                        )}
                        {invoice.applyTCS && tcsValue > 0 && (
                          <tr>
                            <td style={{ borderBottom: "none" }}>{invoice.tcsLabel || "TCS"} ({invoice.tcsRate}%)</td>
                            <td className="right" style={{ borderBottom: "none" }}>₹ {tcsValue.toLocaleString("en-IN")}</td>
                          </tr>
                        )}
                        {invoice.roundOffAmt !== 0 && (
                          <tr>
                            <td style={{ borderBottom: "none" }}>Round Off</td>
                            <td className="right" style={{ borderBottom: "none" }}>₹ {invoice.roundOffAmt.toLocaleString("en-IN")}</td>
                          </tr>
                        )}
                        <tr style={{ fontWeight: 700, borderTop: "1px solid #e5e7eb" }}>
                          <td style={{ fontWeight: 700 }}>Total Amount</td>
                          <td className="right" style={{ fontWeight: 700 }}>₹ {grandTotal.toLocaleString("en-IN")}</td>
                        </tr>
                        <tr>
                          <td style={{ borderBottom: "none" }}>Received Amount</td>
                          <td className="right" style={{ borderBottom: "none" }}>₹ {invoice.amountReceived.toLocaleString("en-IN")}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {ts.hsnSummary && Object.keys(hsnGroups).length > 0 && (
                    <div className="ivm-hsn-summary">
                      <div style={{ fontWeight:700, color:tc, marginBottom:6, fontSize:"12px" }}>HSN-wise Tax Summary</div>
                      <table className="ivm-items-table">
                        <thead><tr style={{ background:tc, color:"#fff" }}><th>HSN/SAC</th><th>Taxable Value</th><th>CGST Rate</th><th>CGST Amount</th><th>SGST Rate</th><th>SGST Amount</th><th>Total Tax Amount</th></tr></thead>
                        <tbody>{Object.entries(hsnGroups).map(([hsn,{taxable,cgst,sgst}]) => (<tr key={hsn}><td className="center">{hsn}</td><td className="right">₹{taxable.toFixed(2)}</td><td className="center">9%</td><td className="right">₹{cgst.toFixed(2)}</td><td className="center">9%</td><td className="right">₹{sgst.toFixed(2)}</td><td className="right">₹{(cgst+sgst).toFixed(2)}</td></tr>))}</tbody>
                      </table>
                    </div>
                  )}
                  {misc.amountWords && (
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <div style={{ textAlign: "right", fontSize: "12px", color: "#374151", padding: "6px 0" }}>
                        <div><strong>Total Amount (in words)</strong></div>
                        <div>{numToWords(grandTotal)}</div>
                      </div>
                    </div>
                  )}
                  {/* Terms and Conditions moved into totals row (left side) - keeping this comment for reference */}
                  {/* {misc.showTerms && <div className="ivm-terms-box"><div style={{ fontWeight:700, marginBottom:4, fontSize:"12px" }}>Terms and Conditions</div><div style={{ color:"#6b7280" }}>{invoice.termsConditions || defaultTerms}</div></div>} */}
                  {misc.showNotes && invoice.notes && <div className="ivm-notes-box"><strong>Notes:</strong> {invoice.notes}</div>}
                  <div className="ivm-signature-row">
                    {misc.receiverSig && <div className="ivm-sig-box"><div className="ivm-sig-line"/><div className="ivm-sig-label">Receiver's Signature</div></div>}
                    <div className="ivm-sig-box" style={{ marginLeft:"auto" }}>
                      {misc.signatureUrl && <img src={misc.signatureUrl} alt="Signature" style={{ height:50, maxWidth:140, objectFit:"contain", display:"block", margin:"0 auto 4px" }}/>}
                      {!misc.signatureUrl && <div className="ivm-sig-line"/>}
                      <div className="ivm-sig-label">Authorized Signatory for<br/><strong>{companyName}</strong></div>
                    </div>
                  </div>
                  <div className="ivm-computer-gen">This is a computer generated invoice.</div>
                </div>
              </div>
            </div>

            {/* Payment History Sidebar */}
            <div className="ivm-sidebar">
              <div className="ivm-sidebar-title">Payment History</div>
              <div className="ivm-ph-row"><span>Invoice Amount</span><strong>₹{grandTotal.toLocaleString("en-IN")}</strong></div>
              <div className="ivm-ph-row"><span>Initial Amount Received</span><strong>₹{invoice.amountReceived.toLocaleString("en-IN")}</strong></div>
              {invoice.amountReceived > 0 && (
                <div className="ivm-ph-entry">
                  <div className="ivm-ph-entry-top"><span>Payment Received</span><strong style={{ color:"#16a34a" }}>₹{invoice.amountReceived.toLocaleString("en-IN")}</strong></div>
                  <div className="ivm-ph-entry-date">{fmtDate(invoice.createdAt)}</div>
                </div>
              )}
              <div style={{ flex:1 }}/>
              <div className="ivm-ph-total-row"><span>Total Amount Received</span><strong>₹{invoice.amountReceived.toLocaleString("en-IN")}</strong></div>
              <div className="ivm-ph-balance-row"><span>Balance Amount</span><strong style={{ color: balance>0 ? "#dc2626" : "#16a34a" }}>₹{balance.toLocaleString("en-IN")}</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showRecordPayment && (
        <RecordPaymentModal
          invoice={invoice}
          onClose={() => setShowRecordPayment(false)}
          onSaved={updated => {
            setInvoice(updated);
            setShowRecordPayment(false);
            onPaymentSaved?.();
          }}
        />
      )}

      {/* Dots click-outside overlay */}
      {dotsOpen && <div style={{ position:"fixed", inset:0, zIndex:499 }} onClick={() => setDotsOpen(false)} />}

      {/* Profit Details Modal */}
      {showProfitModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:4000, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={() => setShowProfitModal(false)}>
          <div style={{ background:"#fff", borderRadius:16, width:580, maxWidth:"95vw", boxShadow:"0 24px 60px rgba(0,0,0,.2)", fontFamily:"Segoe UI,sans-serif" }} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 24px", borderBottom:"1px solid #f3f4f6" }}>
              <span style={{ fontSize:16, fontWeight:700, color:"#111827" }}>Profit Calculation</span>
              <button onClick={() => setShowProfitModal(false)} style={{ background:"none", border:"none", cursor:"pointer", color:"#6b7280", fontSize:20, lineHeight:1 }}>✕</button>
            </div>
            <div style={{ padding:"0 24px 24px" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", marginTop:16 }}>
                <thead>
                  <tr style={{ borderBottom:"2px solid #f3f4f6" }}>
                    <th style={{ textAlign:"left", fontSize:11, fontWeight:700, color:"#6b7280", padding:"8px 0", textTransform:"uppercase", letterSpacing:"0.5px" }}>Item Name</th>
                    <th style={{ textAlign:"center", fontSize:11, fontWeight:700, color:"#6b7280", padding:"8px 0", textTransform:"uppercase", letterSpacing:"0.5px" }}>QTY</th>
                    <th style={{ textAlign:"center", fontSize:11, fontWeight:700, color:"#4f46e5", padding:"8px 0", textTransform:"uppercase", letterSpacing:"0.5px" }}>Purchase Price<br/><span style={{fontWeight:400,textTransform:"none"}}>(Excl. Taxes)</span></th>
                    <th style={{ textAlign:"right", fontSize:11, fontWeight:700, color:"#6b7280", padding:"8px 0", textTransform:"uppercase", letterSpacing:"0.5px" }}>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.billItems.map((item: any, i: number) => (
                    <tr key={i} style={{ borderBottom:"1px solid #f9fafb" }}>
                      <td style={{ padding:"10px 0", fontSize:14, color:"#374151", fontWeight:600 }}>{item.name || "Item"}</td>
                      <td style={{ textAlign:"center", padding:"10px 0", fontSize:14, color:"#374151" }}>{item.qty} {item.unit || "PCS"}</td>
                      <td style={{ textAlign:"center", padding:"10px 0", fontSize:14, color:"#9ca3af" }}>-</td>
                      <td style={{ textAlign:"right", padding:"10px 0", fontSize:14, color:"#9ca3af" }}>-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ borderTop:"1px solid #f3f4f6", marginTop:8 }}>
                {[
                  { label:"Sales Amount(Exl. Addn. Charges):", value:`₹ ${invoice.billItems.reduce((s:number,i:any)=>s+(i.amount||0),0).toLocaleString("en-IN")}` },
                  { label:"Total Cost:", value:"₹ 0" },
                  { label:"Tax Payable:", value:"₹ 0" },
                ].map(r => (
                  <div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #f9fafb", fontSize:14, color:"#374151" }}>
                    <span>{r.label}</span><span>{r.value}</span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", fontSize:14, color:"#374151", fontWeight:600 }}>
                  <div>
                    <div>Profit:</div>
                    <div style={{ fontSize:12, color:"#4f46e5", fontWeight:400, marginTop:2 }}>(Sales Amount - Total Cost - Tax Payable)</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, color:"#9ca3af" }}>
                    <span>-</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" style={{width:16,height:16}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}