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
  amountReceived: number;
  receivedAmount?: number;
  outstandingAmount?: number;
  totalAmount?: number;
  party: { id?: number; name: string; mobile?: string; billingAddress?: string; gstin?: string } | null;
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
  signatureUrl?: string;
  showEmptySignatureBox?: boolean;
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
  onPaymentSaved?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onCancel?: () => void;
  onCreditNote?: () => void;
  onProfitDetails?: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtDateSlash(d: string) {
  if (!d) return "";
  const dt = new Date(d);
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
function fmtDateGB(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtC(n: number) {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}
function calcTotal(inv: Pick<SalesInvoice, "billItems" | "additionalCharges" | "discountPct" | "discountAmt" | "applyTCS" | "tcsRate" | "tcsBase" | "roundOffAmt">): number {
  const items = inv.billItems.reduce((s, i) => s + i.amount, 0);
  const charges = inv.additionalCharges.reduce((s, c) => s + c.amount, 0);
  const taxable = items + charges;
  const disc = taxable * (inv.discountPct / 100) + inv.discountAmt;
  const after = taxable - disc;
  const tcsBaseAmt = inv.tcsBase === "Taxable Amount" ? taxable : after;
  const tcs = inv.applyTCS ? tcsBaseAmt * (inv.tcsRate / 100) : 0;
  return Math.round((after + tcs + inv.roundOffAmt) * 100) / 100;
}
function getAlreadyReceived(inv: SalesInvoice): number {
  if (inv.receivedAmount != null) return Number(inv.receivedAmount);
  return Number(inv.amountReceived ?? 0);
}
function numToWords(n: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  if (n === 0) return "Zero";
  function h(num: number): string {
    if (num === 0) return "";
    if (num < 20) return ones[num] + " ";
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "") + " ";
    if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred " + h(num % 100);
    if (num < 100000) return h(Math.floor(num / 1000)) + "Thousand " + h(num % 1000);
    if (num < 10000000) return h(Math.floor(num / 100000)) + "Lakh " + h(num % 100000);
    return h(Math.floor(num / 10000000)) + "Crore " + h(num % 10000000);
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
          <div><label style={{ fontSize: 13, color: "#374151", fontWeight: 500, display: "block", marginBottom: 6 }}>Tax name</label><input value={taxName} onChange={e => setTaxName(e.target.value)} placeholder="Enter Tax Name" style={inp} /></div>
          <div><label style={{ fontSize: 13, color: "#374151", fontWeight: 500, display: "block", marginBottom: 6 }}>Enter Section Name</label><input value={section} onChange={e => setSection(e.target.value)} placeholder="Enter Section Name" style={inp} /></div>
          <div><label style={{ fontSize: 13, color: "#374151", fontWeight: 500, display: "block", marginBottom: 6 }}>Enter Rate (in %)</label><input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} style={inp} /></div>
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
  const alreadyReceived = getAlreadyReceived(invoice);
  const pending = invoice.outstandingAmount != null ? Number(invoice.outstandingAmount) : Math.max(0, grandTotal - alreadyReceived);

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
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
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

  async function handleSave() {
    if (amt <= 0) { setSaveError("Please enter a valid amount."); return; }
    const invoiceNumericId = Number(invoice.id);
    if (isNaN(invoiceNumericId) || invoiceNumericId <= 0) { setSaveError("Invalid invoice ID — cannot record payment."); return; }
    const partyId: number | undefined = invoice.party?.id ?? (invoice as any).partyId ?? undefined;
    if (!partyId) { setSaveError("Invoice has no party — cannot record payment."); return; }
    setSaving(true); setSaveError("");
    try {
      const res = await fetch("/api/payments-in", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partyId, date: payDate, mode: payMode, amount: amt, notes: notes || undefined, allocations: [{ invoiceId: invoiceNumericId, amount: amt }] }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? `Server error ${res.status}`);
      const totalSettled = amt + disc + tdsAmt;
      const newReceived = Math.min(alreadyReceived + amt, grandTotal);
      const newOutstanding = Math.max(0, pending - totalSettled);
      onSaved({ ...invoice, amountReceived: newReceived, receivedAmount: newReceived, outstandingAmount: newOutstanding, status: newOutstanding <= 0 ? "Paid" : newReceived > 0 ? "Partially Paid" : "Unpaid" });
    } catch (e: any) { setSaveError(e.message ?? "Something went wrong."); }
    finally { setSaving(false); }
  }

  const dropItem = (label: string, active: boolean): React.CSSProperties => ({ padding: "9px 14px", fontSize: 13, color: active ? "#4f46e5" : "#374151", cursor: "pointer", background: active ? "#ede9fe" : "transparent", fontWeight: active ? 600 : 400, borderBottom: "1px solid #f9fafb" });
  const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fff", fontFamily: "inherit" };
  const dropBox: React.CSSProperties = { position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 200, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, boxShadow: "0 10px 28px rgba(0,0,0,.13)", maxHeight: 250, overflowY: "auto" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: 860, maxWidth: "97vw", maxHeight: "93vh", overflowY: "auto", boxShadow: "0 24px 70px rgba(0,0,0,.22)", fontFamily: "Segoe UI, sans-serif", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 26px", borderBottom: "1px solid #f3f4f6", flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Record Payment For Invoice #{invoice.invoiceNo}</span>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#374151", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 20, padding: "22px 26px", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#f9fafb", borderRadius: 12, padding: "18px 18px 16px", border: "1px solid #e5e7eb" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
                <div><label style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 5 }}>Amount Received</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={inp} /></div>
                <div><label style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 5 }}>Payment In Discount</label><input type="number" value={discount} onChange={e => setDiscount(e.target.value)} style={inp} /></div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#374151", cursor: "pointer", userSelect: "none", marginBottom: applyTds ? 12 : 0 }}>
                <input type="checkbox" checked={applyTds} onChange={e => { setApplyTds(e.target.checked); if (!e.target.checked) setSelTds(null); }} style={{ width: 16, height: 16, accentColor: "#4f46e5", cursor: "pointer" }} />
                Apply TDS
              </label>
              {applyTds && (
                <div ref={tdsRef} style={{ position: "relative" }}>
                  <div onClick={() => setShowTdsDrop(v => !v)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, color: selTds ? "#111827" : "#9ca3af", userSelect: "none" }}>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>{selTds ? selTds.label : "Select Tds Rate"}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, flexShrink: 0 }}><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                  {showTdsDrop && (
                    <div style={dropBox}>
                      {tdsRates.map((r, i) => (
                        <div key={i} style={dropItem(r.label, selTds?.label === r.label)} onMouseDown={e => { e.preventDefault(); setSelTds(r); setShowTdsDrop(false); }} onMouseEnter={e => { if (selTds?.label !== r.label) (e.currentTarget as HTMLDivElement).style.background = "#f5f3ff"; }} onMouseLeave={e => { if (selTds?.label !== r.label) (e.currentTarget as HTMLDivElement).style.background = ""; }}>{r.label}</div>
                      ))}
                      <div onMouseDown={e => { e.preventDefault(); setShowTdsDrop(false); setShowAddTds(true); }} style={{ padding: "10px 14px", fontSize: 13, color: "#4f46e5", cursor: "pointer", fontWeight: 600, borderTop: "1px solid #f3f4f6", background: "#fafafe" }}>+ Add New Tds Rate</div>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6b7280", marginTop: 10, padding: "0 2px" }}>
                    <span>TDS Applicable on bill</span><span style={{ color: "#374151", fontWeight: 500 }}>- {fmtC(tdsAmt)}</span>
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 5 }}>Payment Date</label>
                <div onClick={() => dateRef.current?.showPicker?.()} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", border: "1px solid #e5e7eb", borderRadius: 8, height: 40, cursor: "pointer", background: "#fff", position: "relative" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15, color: "#6b7280", flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  <span style={{ flex: 1, fontSize: 13, color: "#111827" }}>{fmtDateGB(payDate)}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13, color: "#9ca3af" }}><polyline points="6 9 12 15 18 9" /></svg>
                  <input ref={dateRef} type="date" value={payDate} onChange={e => setPayDate(e.target.value)} style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }} />
                </div>
              </div>
              <div ref={modeRef} style={{ position: "relative" }}>
                <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 5 }}>Payment Mode</label>
                <div onClick={() => setShowModeDrop(v => !v)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", border: `1px solid ${showModeDrop ? "#4f46e5" : "#e5e7eb"}`, borderRadius: 8, height: 40, cursor: "pointer", fontSize: 13, color: "#111827", background: "#fff", userSelect: "none" }}>
                  <span>{payMode}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, color: "#9ca3af" }}><polyline points="6 9 12 15 18 9" /></svg>
                </div>
                {showModeDrop && (
                  <div style={{ ...dropBox, maxHeight: "none" }}>
                    {PM_LIST.map(m => <div key={m} style={dropItem(m, payMode === m)} onMouseDown={e => { e.preventDefault(); setPayMode(m); setShowModeDrop(false); }} onMouseEnter={e => { if (payMode !== m) (e.currentTarget as HTMLDivElement).style.background = "#f5f3ff"; }} onMouseLeave={e => { if (payMode !== m) (e.currentTarget as HTMLDivElement).style.background = payMode === m ? "#ede9fe" : ""; }}>{m}</div>)}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 5 }}>Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, resize: "vertical", minHeight: 90, outline: "none", fontFamily: "inherit", boxSizing: "border-box", background: "#fff" }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Invoice #{invoice.invoiceNo}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#374151", marginBottom: 4 }}><span>Invoice Amount</span><span style={{ fontWeight: 600 }}>{fmtC(grandTotal)}</span></div>
              {invoice.party?.name && <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 3 }}>{invoice.party.name}</div>}
              {invoice.dueDate && <div style={{ fontSize: 12, color: "#6b7280" }}>Due Date: {fmtDateGB(invoice.dueDate)}</div>}
            </div>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 12 }}>Record Payment Calculation</div>
              <div style={{ border: "1px solid #f3f4f6", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, padding: "10px 12px", borderBottom: "1px solid #f3f4f6", color: "#ef4444" }}><span>Invoice Pending Amt.</span><span>{fmtC(pending)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#374151", padding: "10px 12px", borderBottom: "1px solid #f3f4f6" }}><span>Amount Received</span><span>{fmtC(amt)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#374151", padding: "10px 12px", borderBottom: applyTds && tdsAmt > 0 ? "1px solid #f3f4f6" : "none" }}><span>Payment In Discount</span><span>{fmtC(disc)}</span></div>
                {applyTds && tdsAmt > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#374151", padding: "10px 12px" }}><span>TDS Deducted</span><span>- {fmtC(tdsAmt)}</span></div>}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, padding: "12px 12px", borderTop: "1px solid #f3f4f6" }}><span style={{ color: "#6b7280" }}>Balance Amount</span><span style={{ color: balance === 0 ? "#16a34a" : "#374151" }}>{fmtC(balance)}</span></div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid #f3f4f6", flexShrink: 0 }}>
          {saveError && <div style={{ margin: "10px 26px 0", padding: "9px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, color: "#dc2626", fontSize: 13 }}>{saveError}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "16px 26px" }}>
            <button onClick={onClose} disabled={saving} style={{ padding: "9px 26px", border: "1px solid #e5e7eb", background: "#fff", borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#374151", fontWeight: 500 }}>Close</button>
            <button onClick={handleSave} disabled={saving || amt <= 0} style={{ padding: "9px 28px", background: saving || amt <= 0 ? "#a5b4fc" : "#4f46e5", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: saving || amt <= 0 ? "not-allowed" : "pointer" }}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </div>
      </div>
      {showAddTds && <AddTdsRateModal onClose={() => setShowAddTds(false)} onSaved={r => { setTdsRates(prev => [...prev, r]); setSelTds(r); setShowAddTds(false); }} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INVOICE PAPER — exact match of the required UI
// ═══════════════════════════════════════════════════════════════════════════════
function InvoicePaper({ invoice, business, template, printRef }: {
  invoice: SalesInvoice; business: Business; template: SavedTemplate | null; printRef: React.RefObject<HTMLDivElement>;
}) {
  const companyName  = template?.inv.companyName || business.companyName;
  const phone        = template?.inv.phone       || business.phone;
  const defaultTerms = template?.inv.terms       || "1. Goods once sold will not be taken back or exchanged\n2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only";
  const misc = template?.misc ?? { showNotes: true, amountWords: true, showTerms: true, receiverSig: false, signatureUrl: "" };

  // ── Totals ──────────────────────────────────────────────────────────────────
  const itemsSubtotal   = invoice.billItems.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const chargesTotal    = invoice.additionalCharges.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const discountAmt     = Number(invoice.discountAmt) || 0;
  const roundOff        = Number(invoice.roundOffAmt) || 0;
  const grandTotal      = itemsSubtotal + chargesTotal - discountAmt + roundOff;
  const alreadyReceived = getAlreadyReceived(invoice);
  const totalQty        = invoice.billItems.reduce((s, i) => s + (Number(i.qty) || 0), 0);

  // Signature — template takes priority, then invoice-level
  const sigUrl = misc.signatureUrl || invoice.signatureUrl || "";

  // ── Shared cell styles ──────────────────────────────────────────────────────
  const headCell: React.CSSProperties = {
    padding: "8px 10px",
    fontSize: 11,
    fontWeight: 700,
    color: "#374151",
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    borderTop: "1.5px solid #1a1a1a",
    borderBottom: "1.5px solid #1a1a1a",
    background: "#fff",
  };
  const bodyCell: React.CSSProperties = {
    padding: "8px 10px",
    fontSize: 12.5,
    color: "#1a1a1a",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "top" as const,
  };

  return (
    <div
      ref={printRef}
      className="ivm-invoice-paper"
      style={{ fontFamily: "Arial, sans-serif", fontSize: "13px", minHeight: 900 }}
    >
      {/* ── 1. Top tag row ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: "#374151", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
          BILL OF SUPPLY
        </span>
        <span style={{
          padding: "2px 10px", border: "1px solid #9ca3af", borderRadius: 3,
          fontSize: 10, color: "#374151", letterSpacing: "0.03em",
        }}>
          ORIGINAL FOR RECIPIENT
        </span>
      </div>

      {/* ── 2. Company name + phone ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 23, fontWeight: 800, color: "#111827", lineHeight: 1.2, marginBottom: 4 }}>
          {companyName}
        </div>
        {phone && (
          <div style={{ fontSize: 12.5, color: "#374151" }}>
            Mobile:&nbsp;&nbsp;{phone}
          </div>
        )}
      </div>

      {/* ── 3. Dark meta bar ───────────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: invoice.dueDate ? "1fr 1fr 1fr" : "1fr 1fr",
        background: "#1a1a1a",
        color: "#fff",
        padding: "9px 14px",
        marginBottom: 16,
        fontSize: 12.5,
        gap: 4,
      }}>
        <div>
          <span style={{ color: "#9ca3af" }}>Invoice No.:&nbsp;</span>
          <strong>{invoice.invoiceNo}</strong>
        </div>
        <div style={{ textAlign: "center" }}>
          <span style={{ color: "#9ca3af" }}>Invoice Date:&nbsp;</span>
          <strong>{fmtDateSlash(invoice.invoiceDate)}</strong>
        </div>
        {invoice.dueDate && (
          <div style={{ textAlign: "right" }}>
            <span style={{ color: "#9ca3af" }}>Due Date:&nbsp;</span>
            <strong>{fmtDateSlash(invoice.dueDate)}</strong>
          </div>
        )}
      </div>

      {/* ── 4. BILL TO ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontSize: 10.5, fontWeight: 700, color: "#6b7280",
          textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 4,
        }}>
          BILL TO
        </div>
        {invoice.party ? (
          <>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 2 }}>
              {invoice.party.name}
            </div>
            {invoice.party.billingAddress && (
              <div style={{ fontSize: 12, color: "#374151", marginBottom: 1 }}>
                {invoice.party.billingAddress}
              </div>
            )}
            {invoice.party.mobile && (
              <div style={{ fontSize: 12, color: "#374151" }}>
                Mobile: {invoice.party.mobile}
              </div>
            )}
            {invoice.party.gstin && (
              <div style={{ fontSize: 12, color: "#374151" }}>
                GSTIN: {invoice.party.gstin}
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: 12, color: "#9ca3af" }}>–</div>
        )}
      </div>

      {/* ── 5. Items table (ITEMS | QTY. | RATE | AMOUNT) ─────────────────── */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 0 }}>
        <thead>
          <tr>
            <th style={{ ...headCell, textAlign: "left",   width: "50%" }}>ITEMS</th>
            <th style={{ ...headCell, textAlign: "center", width: "16%" }}>QTY.</th>
            <th style={{ ...headCell, textAlign: "center", width: "17%" }}>RATE</th>
            <th style={{ ...headCell, textAlign: "right",  width: "17%" }}>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {invoice.billItems.map((item, i) => (
            <tr key={i}>
              <td style={{ ...bodyCell, textAlign: "left" }}>{item.name || "Item"}</td>
              <td style={{ ...bodyCell, textAlign: "center" }}>
                {item.qty} {item.unit || "PCS"}
              </td>
              <td style={{ ...bodyCell, textAlign: "center" }}>
                {Number(item.price).toLocaleString("en-IN")}
              </td>
              <td style={{ ...bodyCell, textAlign: "right" }}>
                {Number(item.amount).toLocaleString("en-IN")}
              </td>
            </tr>
          ))}
          {/* Filler rows — keeps visual whitespace matching the UI */}
          {invoice.billItems.length < 5 && Array.from({ length: 5 - invoice.billItems.length }).map((_, i) => (
            <tr key={`filler-${i}`}>
              <td style={{ ...bodyCell, color: "transparent", userSelect: "none" as const }}>–</td>
              <td style={bodyCell} />
              <td style={bodyCell} />
              <td style={bodyCell} />
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── 6. SUBTOTAL full-width row ─────────────────────────────────────── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: "2px solid #1a1a1a",
        borderBottom: "1px solid #d1d5db",
        padding: "8px 10px",
        marginBottom: 14,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 52 }}>
          <span style={{
            fontSize: 11, fontWeight: 700,
            textTransform: "uppercase" as const, letterSpacing: "0.05em", color: "#374151",
          }}>
            SUBTOTAL
          </span>
          <span style={{ fontSize: 12.5, color: "#374151" }}>{totalQty}</span>
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "#111827" }}>
          ₹ {itemsSubtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* ── 7. Bottom section: Terms (left) | Charges + Totals (right) ────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "start" }}>

        {/* LEFT — Terms & Conditions */}
        <div>
          {misc.showTerms && (
            <>
              <div style={{
                fontSize: 10.5, fontWeight: 700,
                textTransform: "uppercase" as const, letterSpacing: "0.05em",
                color: "#374151", marginBottom: 5,
              }}>
                TERMS AND CONDITIONS
              </div>
              <div style={{ fontSize: 11.5, color: "#374151", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                {invoice.termsConditions || defaultTerms}
              </div>
            </>
          )}
          {misc.showNotes && invoice.notes && (
            <div style={{ marginTop: 10, fontSize: 11.5, color: "#374151", fontStyle: "italic" }}>
              <strong>Notes:</strong> {invoice.notes}
            </div>
          )}
        </div>

        {/* RIGHT — Additional charges | Discount | Total Amount | Received | Words */}
        <div style={{ minWidth: 240 }}>

          {/* Additional Charges */}
          {invoice.additionalCharges.map((c, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 12.5, color: "#374151", marginBottom: 5, gap: 40,
            }}>
              <span>{c.label || "Charge"}</span>
              <span>₹ {Number(c.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
          ))}

          {/* Discount */}
          {discountAmt > 0 && (
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 12.5, color: "#374151", marginBottom: 5, gap: 40,
            }}>
              <span>Discount</span>
              <span style={{ color: "#16a34a" }}>
                - ₹ {discountAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {/* Round Off */}
          {roundOff !== 0 && (
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 12.5, color: "#374151", marginBottom: 5, gap: 40,
            }}>
              <span>Round Off</span>
              <span>{roundOff > 0 ? "+" : ""}₹ {Math.abs(roundOff).toFixed(2)}</span>
            </div>
          )}

          {/* Total Amount — bold, with top border */}
          <div style={{
            display: "flex", justifyContent: "space-between", gap: 40,
            fontSize: 13, fontWeight: 700, color: "#111827",
            borderTop: "1px solid #d1d5db", paddingTop: 6, marginTop: 4, marginBottom: 6,
          }}>
            <span>Total Amount</span>
            <span>₹ {grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Received Amount */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            fontSize: 12.5, color: "#374151", marginBottom: 10, gap: 40,
          }}>
            <span>Received Amount</span>
            <span>₹ {alreadyReceived.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Total Amount in words */}
          {misc.amountWords && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10.5, color: "#6b7280", marginBottom: 2 }}>
                Total Amount (in words)
              </div>
              <div style={{ fontSize: 11.5, color: "#374151" }}>
                {numToWords(grandTotal)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 8. Signature — always shown at bottom right ──────────────────────── */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 28 }}>
        <div style={{ textAlign: "center", minWidth: 160 }}>
          {/* If user uploaded a signature image — show it */}
          {sigUrl ? (
            <img
              src={sigUrl}
              alt="Signature"
              style={{ height: 52, maxWidth: 150, objectFit: "contain", display: "block", margin: "0 auto 4px" }}
            />
          ) : invoice.showEmptySignatureBox ? (
            /* If user chose "Show Empty Box" — show dashed box */
            <div style={{ height: 52, border: "1px dashed #d1d5db", borderRadius: 4, marginBottom: 4 }} />
          ) : (
            /* Default — blank line (always present so label is always shown) */
            <div style={{ height: 52, borderTop: "1px solid #d1d5db", width: 140, margin: "0 auto 4px" }} />
          )}
          <div style={{ fontSize: 11, color: "#6b7280" }}>
            Authorized Signatory for<br />
            <strong style={{ color: "#111827" }}>{companyName}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main InvoiceViewModal ────────────────────────────────────────────────────
export default function InvoiceViewModal({
  invoice: initialInvoice, template, business, onClose, onEdit,
  onPaymentSaved, onDuplicate, onDelete, onCancel, onCreditNote, onProfitDetails,
}: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const [invoice, setInvoice] = useState<SalesInvoice>(initialInvoice);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [dotsOpen, setDotsOpen] = useState(false);
  const [showProfitModal, setShowProfitModal] = useState(false);
  const dotsRef = useRef<HTMLDivElement>(null);

  const font     = template?.style.font     ?? "Inter";
  const fontSize = template?.style.textSize ?? "13px";

  function buildInvoiceHtml(content: string) {
    const fontName = font.replace(/ /g, "+");
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
    <title>Invoice #${invoice.invoiceNo}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700;800&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: '${font}', Arial, sans-serif; font-size: ${fontSize}; color: #1a1a1a; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .inv-print { padding: 32px; max-width: 900px; margin: 0 auto; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 7px 10px; }
      .ivm-inv-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 12px; }
      .ivm-inv-company { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
      .ivm-inv-meta { font-size: 12px; color: #6b7280; margin-bottom: 2px; }
      .ivm-inv-meta-box { text-align: right; min-width: 180px; }
      .ivm-inv-meta-row { display: flex; justify-content: space-between; gap: 16px; font-size: 12px; color: #6b7280; margin-bottom: 4px; }
      .ivm-inv-logo { height: 56px; width: auto; object-fit: contain; }
      .ivm-party-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
      .ivm-party-box { padding: 10px 12px; border-radius: 6px; }
      .ivm-party-label { font-size: 10px; font-weight: 700; letter-spacing: 0.8px; margin-bottom: 4px; text-transform: uppercase; }
      .ivm-party-name { font-weight: 700; font-size: 14px; margin-bottom: 2px; }
      .ivm-party-detail { font-size: 12px; color: #6b7280; }
      .ivm-items-table { margin: 12px 0; width: 100%; border-collapse: collapse; }
      .ivm-items-table th { font-size: 11px; font-weight: 700; text-align: left; padding: 8px 10px; }
      .ivm-items-table td { padding: 8px 10px; vertical-align: top; border-bottom: 1px solid #f3f4f6; font-size: 12.5px; }
      .ivm-items-table .center { text-align: center; } .ivm-items-table .right { text-align: right; }
      .ivm-totals-row { display: flex; gap: 16px; margin-top: 8px; align-items: flex-start; }
      .ivm-bank-box { padding: 10px 12px; border-radius: 6px; font-size: 12px; flex: 1; }
      .ivm-totals-table { min-width: 280px; border-collapse: collapse; }
      .ivm-totals-table td { padding: 6px 10px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
      .ivm-totals-table .right { text-align: right; }
      .ivm-words-row { font-size: 12px; margin: 8px 0; padding: 8px 12px; background: #f9fafb; border-radius: 6px; }
      .ivm-terms-box { font-size: 12px; margin: 8px 0; padding: 8px 12px; background: #f9fafb; border-radius: 6px; }
      .ivm-notes-box { font-size: 12px; margin: 8px 0; font-style: italic; }
      .ivm-signature-row { display: flex; justify-content: space-between; margin-top: 24px; padding-top: 8px; }
      .ivm-sig-box { text-align: center; min-width: 160px; }
      .ivm-sig-line { border-top: 1px solid #d1d5db; width: 140px; margin: 0 auto 4px; height: 1px; }
      .ivm-sig-label { font-size: 11px; color: #6b7280; }
      .ivm-computer-gen { text-align: center; font-size: 10px; color: #9ca3af; margin-top: 16px; }
      .ivm-hsn-summary { margin-top: 12px; }
      @media print { body { margin: 0; } .inv-print { padding: 16px; } }
    </style></head>
    <body><div class="inv-print">${content}</div></body></html>`;
  }

  function handlePrint() {
    const content = printRef.current?.innerHTML ?? "";
    const w = window.open("", "_blank");
    if (!w) { alert("Please allow popups to print."); return; }
    w.document.write(buildInvoiceHtml(content));
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 800);
  }

  function handleDownload() {
    const content = printRef.current?.innerHTML ?? "";
    const html    = buildInvoiceHtml(content);
    const blob    = new Blob([html], { type: "text/html;charset=utf-8" });
    const url     = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    if (!w) {
      const a = document.createElement("a");
      a.href = url; a.download = `Invoice-${invoice.invoiceNo}.html`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      return;
    }
    w.addEventListener("load", () => {
      setTimeout(() => { w.print(); setTimeout(() => URL.revokeObjectURL(url), 60000); }, 800);
    });
  }

  useEffect(() => {
    function h(e: KeyboardEvent) { if (e.key === "Escape" && !showRecordPayment) onClose(); }
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [showRecordPayment]);

  // Sidebar values
  const grandTotal = calcTotal(invoice);
  const alreadyReceived = getAlreadyReceived(invoice);
  const balance = grandTotal - alreadyReceived;

  const statusColor = invoice.status === "Paid" ? "#16a34a"
    : invoice.status === "Unpaid" ? "#dc2626"
    : invoice.status === "Partially Paid" ? "#d97706"
    : "#6b7280";

  return (
    <>
      <div className="ivm-overlay" onClick={onClose}>
        <div className="ivm-shell" onClick={e => e.stopPropagation()}>

          {/* ── Top Bar ── */}
          <div className="ivm-topbar">
            <div className="ivm-topbar-left">
              <button className="ivm-back-btn" onClick={onClose}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <span className="ivm-title">Sales Invoice #{invoice.invoiceNo}</span>
              <span className="ivm-status-badge" style={{ background: statusColor + "18", color: statusColor, border: `1px solid ${statusColor}40` }}>
                {invoice.status}
              </span>
            </div>
            <div className="ivm-topbar-right">
              <button className="ivm-top-btn" onClick={() => { setShowProfitModal(true); onProfitDetails?.(); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                Profit Details
              </button>
              <div ref={dotsRef} style={{ position: "relative" }}>
                <button className="ivm-top-btn ivm-top-btn--dots" onClick={() => setDotsOpen(v => !v)}>
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
                </button>
                {dotsOpen && (
                  <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 500, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 10px 28px rgba(0,0,0,.15)", minWidth: 200, overflow: "hidden" }} onClick={() => setDotsOpen(false)}>
                    {[
                      { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>, label: "Edit", action: onEdit },
                      { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4.99" /></svg>, label: "Edit History", action: () => {} },
                      { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>, label: "Duplicate", action: onDuplicate },
                      { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>, label: "Issue Credit Note", action: onCreditNote },
                      null,
                      { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>, label: "Cancel Invoice", action: onCancel, warning: true },
                      { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>, label: "Delete", action: onDelete, danger: true },
                    ].map((item, i) => item === null ? (
                      <div key={i} style={{ height: 1, background: "#f3f4f6", margin: "2px 0" }} />
                    ) : (
                      <button key={i} onClick={item.action}
                        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 14, color: (item as any).danger ? "#dc2626" : (item as any).warning ? "#d97706" : "#374151", fontWeight: 500, textAlign: "left" }}
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

          {/* ── Action Bar ── */}
          <div className="ivm-actionbar">
            <div className="ivm-actionbar-left">
              <div className="ivm-action-group">
                <button className="ivm-action-btn" onClick={handlePrint}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                  Print PDF
                </button>
                <button className="ivm-action-split"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg></button>
              </div>
              <div className="ivm-action-group">
                <button className="ivm-action-btn" onClick={handleDownload}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  Download PDF
                </button>
                <button className="ivm-action-split"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg></button>
              </div>
              <div className="ivm-action-group">
                <button className="ivm-action-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                  Share
                </button>
                <button className="ivm-action-split"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg></button>
              </div>
            </div>
            <div className="ivm-actionbar-right">
              <button className="ivm-record-btn" onClick={e => { e.stopPropagation(); setShowRecordPayment(true); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                Record Payment In
              </button>
            </div>
          </div>

          {/* ── Main Body ── */}
          <div className="ivm-body">
            <div className="ivm-preview-area">
              <div className="ivm-preview-label">
                TAX INVOICE <span className="ivm-original-tag">ORIGINAL FOR RECIPIENT</span>
              </div>

              {/* Invoice Paper — single layout matching required UI */}
              <InvoicePaper invoice={invoice} business={business} template={template} printRef={printRef} />
            </div>

            {/* ── Payment History Sidebar ── */}
            <div className="ivm-sidebar">
              <div className="ivm-sidebar-title">Payment History</div>
              <div className="ivm-ph-row"><span>Invoice Amount</span><strong>₹{grandTotal.toLocaleString("en-IN")}</strong></div>
              <div className="ivm-ph-row"><span>Total Amount Received</span><strong>₹{alreadyReceived.toLocaleString("en-IN")}</strong></div>
              {alreadyReceived > 0 && (
                <div className="ivm-ph-entry">
                  <div className="ivm-ph-entry-top"><span>Payment Received</span><strong style={{ color: "#16a34a" }}>₹{alreadyReceived.toLocaleString("en-IN")}</strong></div>
                  <div className="ivm-ph-entry-date">{fmtDate(invoice.createdAt)}</div>
                </div>
              )}
              <div style={{ flex: 1 }} />
              <div className="ivm-ph-total-row"><span>Total Amount Received</span><strong>₹{alreadyReceived.toLocaleString("en-IN")}</strong></div>
              <div className="ivm-ph-balance-row">
                <span>Balance Amount</span>
                <strong style={{ color: balance > 0 ? "#dc2626" : "#16a34a" }}>₹{balance.toLocaleString("en-IN")}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showRecordPayment && (
        <RecordPaymentModal
          invoice={invoice}
          onClose={() => setShowRecordPayment(false)}
          onSaved={updated => { setInvoice(updated); setShowRecordPayment(false); onPaymentSaved?.(); }}
        />
      )}

      {dotsOpen && <div style={{ position: "fixed", inset: 0, zIndex: 499 }} onClick={() => setDotsOpen(false)} />}

      {showProfitModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 4000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowProfitModal(false)}>
          <div style={{ background: "#fff", borderRadius: 16, width: 580, maxWidth: "95vw", boxShadow: "0 24px 60px rgba(0,0,0,.2)", fontFamily: "Segoe UI,sans-serif" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Profit Calculation</span>
              <button onClick={() => setShowProfitModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 20, lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ padding: "0 24px 24px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
                    <th style={{ textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", padding: "8px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>Item Name</th>
                    <th style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#6b7280", padding: "8px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>QTY</th>
                    <th style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#4f46e5", padding: "8px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>Purchase Price<br /><span style={{ fontWeight: 400, textTransform: "none" }}>(Excl. Taxes)</span></th>
                    <th style={{ textAlign: "right", fontSize: 11, fontWeight: 700, color: "#6b7280", padding: "8px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.billItems.map((item: any, i: number) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                      <td style={{ padding: "10px 0", fontSize: 14, color: "#374151", fontWeight: 600 }}>{item.name || "Item"}</td>
                      <td style={{ textAlign: "center", padding: "10px 0", fontSize: 14, color: "#374151" }}>{item.qty} {item.unit || "PCS"}</td>
                      <td style={{ textAlign: "center", padding: "10px 0", fontSize: 14, color: "#9ca3af" }}>-</td>
                      <td style={{ textAlign: "right", padding: "10px 0", fontSize: 14, color: "#9ca3af" }}>-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ borderTop: "1px solid #f3f4f6", marginTop: 8 }}>
                {[
                  { label: "Sales Amount(Exl. Addn. Charges):", value: `₹ ${invoice.billItems.reduce((s: number, i: any) => s + (i.amount || 0), 0).toLocaleString("en-IN")}` },
                  { label: "Total Cost:", value: "₹ 0" },
                  { label: "Tax Payable:", value: "₹ 0" },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f9fafb", fontSize: 14, color: "#374151" }}>
                    <span>{r.label}</span><span>{r.value}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", fontSize: 14, color: "#374151", fontWeight: 600 }}>
                  <div>
                    <div>Profit:</div>
                    <div style={{ fontSize: 12, color: "#4f46e5", fontWeight: 400, marginTop: 2 }}>(Sales Amount - Total Cost - Tax Payable)</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#9ca3af" }}>
                    <span>-</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
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
