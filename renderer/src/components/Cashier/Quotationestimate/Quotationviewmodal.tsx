import { useEffect, useRef, useState } from "react";
import { QuotationData, fmtDate, apiDuplicateQuotation, apiDeleteQuotation, apiToFormData } from "./Quotationtypes";
import "./QuotationViewModal.css";

// ─── Exact SavedTemplate shape from InvoiceBuilder ───────────────────────────
interface StyleState   { font:string; textSize:string; themeColor:string; borderColor:string; borderWidth:string; showLogo:boolean; logoUrl:string; }
interface BusinessVis  { companyName:boolean; slogan:boolean; address:boolean; gstin:boolean; phone:boolean; pan:boolean; email:boolean; }
interface TableSettings { hsnSummary:boolean; showDesc:boolean; capitalize:boolean; stretch:boolean; quantityMode:string; cols:Record<string,boolean>; customCols:string[]; backgroundUrl:string; backgroundOpacity:number; }
interface MiscState    { showNotes:boolean; amountWords:boolean; showTerms:boolean; receiverSig:boolean; signatureUrl:string; }
interface InvoiceDetailsState { industryType:string; layout:string; showPO:boolean; showEwayBill:boolean; ewayBillNo:string; showVehicle:boolean; vehicleNo:string; customFields:{label:string;value:string}[]; }
interface PartyVis     { billCompany:boolean; billAddress:boolean; billMobile:boolean; billGstin:boolean; shipCompany:boolean; shipAddress:boolean; shipMobile:boolean; shipGstin:boolean; billCustomFields:{label:string;value:string}[]; shipCustomFields:{label:string;value:string}[]; }
interface InvoiceData  { companyName:string; slogan:string; address:string; state:string; city:string; gstin:string; phone:string; email:string; pan:string; bank:string; ifsc:string; notes:string; terms:string; invoiceNo:string; date:string; dueDate:string; placeOfSupply:string; poNo:string; billTo:{name:string;address:string;mobile:string;gstin:string}; shipTo:{name:string;address:string;mobile:string;gstin:string}; items:any[]; subtotal:number; cgst:number; sgst:number; grandTotal:number; }
interface SavedTemplate { id:string; name:string; themeColor:string; createdAt:string; inv:InvoiceData; style:StyleState; vis:BusinessVis; det:InvoiceDetailsState; pv:PartyVis; ts:TableSettings; misc:MiscState; }

// ─── Number to words ─────────────────────────────────────────────────────────
function numToWords(n: number): string {
  if (n === 0) return "Zero";
  const a=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const b=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  function w(num:number):string{
    if(num<20)return a[num];if(num<100)return b[Math.floor(num/10)]+(num%10?" "+a[num%10]:"");
    if(num<1000)return a[Math.floor(num/100)]+" Hundred"+(num%100?" "+w(num%100):"");
    if(num<100000)return w(Math.floor(num/1000))+" Thousand"+(num%1000?" "+w(num%1000):"");
    if(num<10000000)return w(Math.floor(num/100000))+" Lakh"+(num%100000?" "+w(num%100000):"");
    return w(Math.floor(num/10000000))+" Crore"+(num%10000000?" "+w(num%10000000):"");
  }
  const rs=Math.floor(n), ps=Math.round((n-rs)*100);
  return w(rs)+" Rupees"+(ps>0?" and "+w(ps)+" Paise":"")+" Only";
}

// ─── Format number with 2dp ───────────────────────────────────────────────────
function fmtN(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Load active template from localStorage ───────────────────────────────────
function loadTemplate(): SavedTemplate | null {
  try { return JSON.parse(localStorage.getItem("activeInvoiceTemplate") || "null"); }
  catch { return null; }
}

// ─── Date formatted as DD/MM/YYYY ─────────────────────────────────────────────
function fmtDateSlash(d: string) {
  if (!d) return "-";
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${dt.getFullYear()}`;
}

interface Props {
  quotation: QuotationData;
  onClose: () => void;
  onEdit: () => void;
  onConvertToInvoice?: (quotation: QuotationData) => void;
  onDuplicate?: (newQuotation: QuotationData) => void;
  onDelete?: (id: string) => void;
}

export default function QuotationViewModal({
  quotation, onClose, onEdit, onConvertToInvoice, onDuplicate, onDelete,
}: Props) {
  const [tpl] = useState<SavedTemplate | null>(loadTemplate);
  const printRef = useRef<HTMLDivElement>(null);

  const [showDotMenu, setShowDotMenu] = useState(false);
  const dotMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dotMenuRef.current && !dotMenuRef.current.contains(e.target as Node)) setShowDotMenu(false);
    }
    if (showDotMenu) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [showDotMenu]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  async function handleDuplicate() {
    setShowDotMenu(false);
    if (!quotation.id) return;
    try {
      const newQ = await apiDuplicateQuotation(Number(quotation.id));
      if (onDuplicate) onDuplicate(apiToFormData(newQ));
      else alert(`Quotation duplicated as #${newQ.quotationNo}`);
    } catch (err: any) { alert(`Failed to duplicate: ${err.message}`); }
  }

  async function handleDelete() {
    setShowDotMenu(false);
    if (!window.confirm(`Delete Quotation #${quotation.quotationNo}? This cannot be undone.`)) return;
    try {
      await apiDeleteQuotation(Number(quotation.id));
      if (onDelete) onDelete(quotation.id);
      else { alert("Quotation deleted."); onClose(); }
    } catch (err: any) { alert(`Failed to delete: ${err.message}`); }
  }

  // ── Pull styling from template ────────────────────────────────────────────
  const bizInv   = tpl?.inv;
  const misc     = tpl?.misc;
  const pv       = tpl?.pv;
  const ts       = tpl?.ts;
  const themeColor = tpl?.style?.themeColor || "#8B8B6A";
  const font       = tpl?.style?.font || "Arial";
  const fontSize   = tpl?.style?.textSize || "12px";
  const signUrl    = misc?.signatureUrl || "";

  // Company details from template or blank
  const companyName = bizInv?.companyName || "Your Company";
  const phone       = bizInv?.phone || "";
  const address     = bizInv?.address || "";
  const gstin       = bizInv?.gstin || "";
  const bank        = bizInv?.bank || "";
  const ifsc        = bizInv?.ifsc || "";
  const defaultTerms = bizInv?.terms || "1. Goods once sold will not be taken back or exchanged";

  // Border shorthand using themeColor
  const B = `1px solid ${themeColor}`;

  // ── Calculations ──────────────────────────────────────────────────────────
  // Each item: taxableBase = price*qty - discount, tax = base * taxRate/100, amount = base + tax
  // But quotation.billItems[].amount already includes tax (same pattern as invoice)
  // So: taxable = amount / (1 + taxRate/100), taxAmt = amount - taxable
  function getItemTaxable(item: any): number {
    const rate = Number(item.taxRate) || 0;
    if (rate > 0) return Number(item.amount) / (1 + rate / 100);
    return Number(item.amount);
  }
  function getItemTaxAmt(item: any): number {
    return Number(item.amount) - getItemTaxable(item);
  }

  const itemsSubtotal  = quotation.billItems.reduce((s, i) => s + Number(i.amount), 0);
  const totalTaxAmt    = quotation.billItems.reduce((s, i) => s + getItemTaxAmt(i), 0);
  const chargesTotal   = quotation.additionalCharges.reduce((s, c) => s + Number(c.amount), 0);
  const discountVal    = quotation.discountPct > 0
    ? (itemsSubtotal + chargesTotal) * quotation.discountPct / 100
    : Number(quotation.discountAmt) || 0;
  const roundVal = quotation.roundOff === "+Add"
    ? Number(quotation.roundOffAmt) || 0
    : quotation.roundOff === "-Reduce" ? -(Number(quotation.roundOffAmt) || 0) : 0;
  const grandTotal = itemsSubtotal + chargesTotal - discountVal + roundVal;

  // HSN summary
  const hsnMap: Record<string, { taxable: number; cgst: number; sgst: number; rate: number }> = {};
  quotation.billItems.forEach((item: any) => {
    const key = `${item.hsn || "-"}__${item.taxRate}`;
    if (!hsnMap[key]) hsnMap[key] = { taxable: 0, cgst: 0, sgst: 0, rate: Number(item.taxRate) || 0 };
    const tx  = getItemTaxable(item);
    const tax = getItemTaxAmt(item);
    hsnMap[key].taxable += tx;
    hsnMap[key].cgst    += tax / 2;
    hsnMap[key].sgst    += tax / 2;
  });
  const hsnRows = Object.entries(hsnMap).map(([key, v]) => ({ hsn: key.split("__")[0], ...v }));

  // Filler rows
  const MIN_ROWS = 5;
  const fillerCount = Math.max(0, MIN_ROWS - quotation.billItems.length);

  // ── Shared cell styles ─────────────────────────────────────────────────────
  const thCell: React.CSSProperties = {
    padding: "7px 8px", fontSize: 11, fontWeight: 700, color: "#1a1a1a",
    border: B, background: "#f5f5e8", whiteSpace: "nowrap" as const,
    textAlign: "center" as const,
  };
  const tdCell: React.CSSProperties = {
    padding: "7px 8px", fontSize: 11.5, color: "#1a1a1a",
    border: B, verticalAlign: "top" as const,
  };

  // ── Print handler ──────────────────────────────────────────────────────────
  function handlePrint() {
    const content = printRef.current?.innerHTML ?? "";
    const fontName = font.replace(/ /g, "+");
    const w = window.open("", "_blank");
    if (!w) { alert("Please allow popups to print."); return; }
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/>
    <title>Quotation #${quotation.quotationNo}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700;800&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      body{font-family:'${font}',Arial,sans-serif;font-size:${fontSize};color:#1a1a1a;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
      .inv-print{padding:24px;max-width:860px;margin:0 auto;}
      table{width:100%;border-collapse:collapse;}
      th,td{padding:6px 8px;}
      @media print{body{margin:0;}.inv-print{padding:12px;}}
    </style></head>
    <body><div class="inv-print">${content}</div></body></html>`);
    w.document.close(); w.focus();
    setTimeout(() => { w.print(); }, 800);
  }

  return (
    <div className="qvm-overlay" onClick={onClose}>
      <div className="qvm-shell" onClick={e => e.stopPropagation()}>

        {/* ── Top Bar ── */}
        <div className="qvm-topbar">
          <div className="qvm-topbar-left">
            <button className="qvm-back-btn" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="qvm-topbar-title">Quotation / Estimate #{quotation.quotationNo}</span>
            <span className={`qvm-status-badge qvm-status-badge--${quotation.status.toLowerCase()}`}>{quotation.status}</span>
          </div>
          <div className="qvm-topbar-right">
            <div className="qvm-dot-menu-wrap" ref={dotMenuRef}>
              <button className="qvm-topbar-icon-btn" onClick={() => setShowDotMenu(v => !v)} title="More options">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="5"  cy="12" r="1.5" fill="currentColor"/>
                  <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                  <circle cx="19" cy="12" r="1.5" fill="currentColor"/>
                </svg>
              </button>
              {showDotMenu && (
                <div className="qvm-dot-dropdown">
                  <button className="qvm-dot-item" onClick={() => { setShowDotMenu(false); onEdit(); }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </button>
                  <button className="qvm-dot-item" onClick={() => { setShowDotMenu(false); alert("Edit History coming soon!"); }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>
                    Edit History
                  </button>
                  <button className="qvm-dot-item" onClick={handleDuplicate}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    Duplicate
                  </button>
                  <div className="qvm-dot-divider"/>
                  <button className="qvm-dot-item qvm-dot-item--danger" onClick={handleDelete}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
            {/* Minimise-style icon (matches screenshot top-right) */}
            <button className="qvm-topbar-icon-btn" title="Minimise">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16,height:16 }}>
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Action Bar ── */}
        <div className="qvm-actionbar">
          <div className="qvm-action-split">
            <button className="qvm-action-btn" onClick={handlePrint}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download PDF
            </button>
            <button className="qvm-action-split-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></button>
          </div>

          <div className="qvm-action-split">
            <button className="qvm-action-btn" onClick={handlePrint}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print PDF
            </button>
            <button className="qvm-action-split-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></button>
          </div>

          {/* History icon (matches screenshot) */}
          <button className="qvm-action-btn qvm-action-btn--icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/><polyline points="12 7 12 12 15 15"/></svg>
          </button>

          <div className="qvm-action-split">
            <button className="qvm-action-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Share
            </button>
            <button className="qvm-action-split-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></button>
          </div>

          <div className="qvm-action-spacer"/>

          {quotation.status !== "Closed" ? (
            <button className="qvm-convert-btn" onClick={() => onConvertToInvoice?.(quotation)}>
              Convert to Invoice
            </button>
          ) : (
            <div className="qvm-converted-badge">✓ Converted to Invoice</div>
          )}
        </div>

        {/* ── Preview Area ── */}
        <div className="qvm-preview-area">
          <div className="qvm-paper" style={{ fontFamily: font, fontSize: fontSize, padding: 0 }}>

            {/* ── "QUOTATION" label above the bordered box ── */}
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em",
              color: "#1a1a1a", marginBottom: 8, paddingLeft: 2 }}>
              QUOTATION
            </div>

            {/* ── The entire invoice inside one outer border ── */}
            <div ref={printRef} style={{ border: `1.5px solid ${themeColor}`, overflow: "hidden" }}>

              {/* ── 1. Company (left) | Meta grid (right) ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: B }}>
                {/* Left: company info */}
                <div style={{ padding: "10px 14px", borderRight: B }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: 3 }}>
                    {companyName}
                  </div>
                  {phone   && <div style={{ fontSize: 11, color: "#374151", marginBottom: 1 }}>Mobile: {phone}</div>}
                  {gstin   && <div style={{ fontSize: 11, color: "#374151", marginBottom: 1 }}>GSTIN: {gstin}</div>}
                  {address && <div style={{ fontSize: 10.5, color: "#374151" }}>{address}</div>}
                </div>
                {/* Right: 3-col meta */}
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: B }}>
                    <div style={{ padding: "6px 10px", borderRight: B }}>
                      <div style={{ fontSize: 9.5, color: "#6b7280", fontWeight: 600, marginBottom: 2 }}>Quotation No.</div>
                      <div style={{ fontSize: 11.5, fontWeight: 700 }}>{quotation.quotationNo}</div>
                    </div>
                    <div style={{ padding: "6px 10px", borderRight: B }}>
                      <div style={{ fontSize: 9.5, color: "#6b7280", fontWeight: 600, marginBottom: 2 }}>Quotation Date</div>
                      <div style={{ fontSize: 11 }}>{fmtDateSlash(quotation.quotationDate)}</div>
                    </div>
                    <div style={{ padding: "6px 10px" }}>
                      <div style={{ fontSize: 9.5, color: "#6b7280", fontWeight: 600, marginBottom: 2 }}>Expiry Date</div>
                      <div style={{ fontSize: 11 }}>{quotation.validityDate ? fmtDateSlash(quotation.validityDate) : "-"}</div>
                    </div>
                  </div>
                  {/* Second row: Challan | E-Way Bill | blank */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <div style={{ padding: "6px 10px", borderRight: B }}>
                      <div style={{ fontSize: 9.5, color: "#6b7280", fontWeight: 600, marginBottom: 2 }}>Challan No.</div>
                      <div style={{ fontSize: 11 }}>{quotation.challanNo || "-"}</div>
                    </div>
                    <div style={{ padding: "6px 10px", borderRight: B }}>
                      <div style={{ fontSize: 9.5, color: "#6b7280", fontWeight: 600, marginBottom: 2 }}>E-Way Bill No.</div>
                      <div style={{ fontSize: 11 }}>{quotation.eWayBillNo || "-"}</div>
                    </div>
                    <div style={{ padding: "6px 10px" }}/>
                  </div>
                </div>
              </div>

              {/* ── 2. BILL TO (full width) ── */}
              <div style={{ borderBottom: B, padding: "9px 14px" }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: "#6b7280",
                  textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 4 }}>
                  BILL TO
                </div>
                {quotation.party ? (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 2 }}>
                      {(pv?.billCompany ?? true) ? quotation.party.name : ""}
                    </div>
                    {(pv?.billAddress ?? true) && (quotation.party as any).billingAddress && (
                      <div style={{ fontSize: 11, color: "#374151", marginBottom: 1 }}>
                        {(quotation.party as any).billingAddress}
                      </div>
                    )}
                    {(pv?.billGstin ?? true) && (quotation.party as any).gstin && (
                      <div style={{ fontSize: 11, color: "#374151" }}>GSTIN: {(quotation.party as any).gstin}</div>
                    )}
                    {(pv?.billMobile ?? true) && quotation.party.mobile && quotation.party.mobile !== "-" && (
                      <div style={{ fontSize: 11, color: "#374151" }}>Mobile: {quotation.party.mobile}</div>
                    )}
                  </>
                ) : <div style={{ fontSize: 11, color: "#9ca3af" }}>–</div>}
              </div>

              {/* ── 3. Items table ── */}
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ ...thCell, textAlign: "center", width: "6%"  }}>S.NO.</th>
                    <th style={{ ...thCell, textAlign: "left",   width: "32%" }}>ITEMS</th>
                    <th style={{ ...thCell, textAlign: "center", width: "12%" }}>QTY.</th>
                    <th style={{ ...thCell, textAlign: "right",  width: "15%" }}>RATE</th>
                    <th style={{ ...thCell, textAlign: "center", width: "16%" }}>TAX</th>
                    <th style={{ ...thCell, textAlign: "right",  width: "19%" }}>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.billItems.map((item: any, i: number) => {
                    const taxAmt = getItemTaxAmt(item);
                    const capitalize = ts?.capitalize ?? false;
                    const itemName   = capitalize ? (item.name || "").toUpperCase() : (item.name || "Item");
                    return (
                      <tr key={item.rowId || i}>
                        <td style={{ ...tdCell, textAlign: "center" }}>{i + 1}</td>
                        <td style={{ ...tdCell, textAlign: "left" }}>
                          <div style={{ fontWeight: 600 }}>{itemName}</div>
                          {(ts?.showDesc ?? true) && item.description && (
                            <div style={{ fontSize: 10, color: "#6b7280" }}>{item.description}</div>
                          )}
                        </td>
                        <td style={{ ...tdCell, textAlign: "center" }}>
                          {item.qty} {item.unit ? `${item.unit}` : "PCS"}
                          {item.unit && <span style={{ fontSize: 10, color: "#6b7280" }}> ({item.unit})</span>}
                        </td>
                        <td style={{ ...tdCell, textAlign: "right" }}>
                          {Number(item.price).toLocaleString("en-IN")}
                        </td>
                        <td style={{ ...tdCell, textAlign: "center" }}>
                          {Number(item.taxRate) > 0 ? (
                            <>
                              <div style={{ fontWeight: 600 }}>₹{fmtN(taxAmt)}</div>
                              <div style={{ fontSize: 10, color: "#6b7280" }}>({item.taxRate}%)</div>
                            </>
                          ) : "-"}
                        </td>
                        <td style={{ ...tdCell, textAlign: "right", fontWeight: 600 }}>
                          {fmtN(Number(item.amount))}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Filler rows */}
                  {Array.from({ length: fillerCount }).map((_, i) => (
                    <tr key={`f${i}`} style={{ height: 26 }}>
                      <td style={tdCell}/><td style={tdCell}/><td style={tdCell}/>
                      <td style={tdCell}/><td style={tdCell}/><td style={tdCell}/>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* ── 4. TOTAL + summary rows ── */}
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {/* TOTAL row */}
                  <tr style={{ background: "#f5f5e8" }}>
                    <td style={{ ...tdCell, width: "55%", fontWeight: 700, fontSize: 11,
                      textAlign: "center", letterSpacing: "0.05em", background: "#f5f5e8" }}>TOTAL</td>
                    <td style={{ ...tdCell, width: "12%", textAlign: "center", background: "#f5f5e8" }}>
                      {quotation.billItems.reduce((s: number, i: any) => s + Number(i.qty), 0)}
                    </td>
                    <td style={{ ...tdCell, width: "16%", textAlign: "right", fontWeight: 600, background: "#f5f5e8" }}>
                      ₹ {fmtN(totalTaxAmt)}
                    </td>
                    <td style={{ ...tdCell, width: "17%", textAlign: "right", fontWeight: 700, background: "#f5f5e8" }}>
                      ₹ {fmtN(itemsSubtotal)}
                    </td>
                  </tr>

                  {/* Additional charges */}
                  {quotation.additionalCharges.map((c: any, i: number) => (
                    <tr key={`ch${i}`}>
                      <td colSpan={3} style={{ ...tdCell, textAlign: "right", fontSize: 11.5 }}>
                        {c.label || "Additional Charge"}
                      </td>
                      <td style={{ ...tdCell, textAlign: "right", fontWeight: 600 }}>
                        ₹ {fmtN(Number(c.amount))}
                      </td>
                    </tr>
                  ))}

                  {/* Discount */}
                  {discountVal > 0 && (
                    <tr>
                      <td colSpan={3} style={{ ...tdCell, textAlign: "right", fontSize: 11.5 }}>Discount</td>
                      <td style={{ ...tdCell, textAlign: "right", color: "#16a34a", fontWeight: 600 }}>
                        - ₹ {fmtN(discountVal)}
                      </td>
                    </tr>
                  )}

                  {/* Round Off */}
                  {roundVal !== 0 && (
                    <tr>
                      <td colSpan={3} style={{ ...tdCell, textAlign: "right", fontSize: 11.5 }}>Round Off</td>
                      <td style={{ ...tdCell, textAlign: "right", fontWeight: 600 }}>
                        {roundVal > 0 ? "+" : ""}₹ {fmtN(Math.abs(roundVal))}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* ── 5. HSN/SAC Summary Table ── */}
              {hsnRows.length > 0 && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ ...thCell, textAlign: "left",   width: "10%" }}>HSN/SAC</th>
                      <th style={{ ...thCell, textAlign: "right",  width: "18%" }}>Taxable Value</th>
                      <th style={{ ...thCell, textAlign: "center", width: "8%"  }}>Rate</th>
                      <th style={{ ...thCell, textAlign: "right",  width: "16%" }}>CGST Amount</th>
                      <th style={{ ...thCell, textAlign: "center", width: "8%"  }}>Rate</th>
                      <th style={{ ...thCell, textAlign: "right",  width: "16%" }}>SGST Amount</th>
                      <th style={{ ...thCell, textAlign: "right",  width: "18%" }}>Total Tax Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hsnRows.map((row, i) => (
                      <tr key={i}>
                        <td style={{ ...tdCell, textAlign: "left"    }}>{row.hsn}</td>
                        <td style={{ ...tdCell, textAlign: "right"   }}>{fmtN(row.taxable)}</td>
                        <td style={{ ...tdCell, textAlign: "center"  }}>{row.rate / 2}%</td>
                        <td style={{ ...tdCell, textAlign: "right"   }}>{fmtN(row.cgst)}</td>
                        <td style={{ ...tdCell, textAlign: "center"  }}>{row.rate / 2}%</td>
                        <td style={{ ...tdCell, textAlign: "right"   }}>{fmtN(row.sgst)}</td>
                        <td style={{ ...tdCell, textAlign: "right", fontWeight: 600 }}>{fmtN(row.cgst + row.sgst)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* ── 6. Total Amount in words ── */}
              {(misc?.amountWords ?? true) && (
                <div style={{ padding: "7px 14px", borderTop: B, borderBottom: B, fontSize: 11.5 }}>
                  <strong>Total Amount (in words):&nbsp;</strong>{numToWords(grandTotal)}
                </div>
              )}

              {/* ── 7. Terms and Conditions (full width, no 3-col split like invoice) ── */}
              {(misc?.showTerms ?? true) && (quotation.termsConditions || defaultTerms) && (
                <div style={{ borderBottom: B, padding: "10px 14px" }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: "#374151", marginBottom: 5,
                    textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
                    Terms and Conditions
                  </div>
                  <div style={{ fontSize: 11, color: "#374151", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                    {quotation.termsConditions || defaultTerms}
                  </div>
                </div>
              )}

              {/* ── 8. Notes | Bank Details | (3-col bottom) ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: B }}>
                <div style={{ borderRight: B, padding: "10px 12px", minHeight: 60 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: "#374151", marginBottom: 5,
                    textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>NOTES</div>
                  <div style={{ fontSize: 11, color: "#374151" }}>{quotation.notes || ""}</div>
                </div>
                <div style={{ borderRight: B, padding: "10px 12px", minHeight: 60 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: "#374151", marginBottom: 5,
                    textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>BANK DETAILS</div>
                  {(bank || ifsc) ? (
                    <div style={{ fontSize: 11, color: "#374151", lineHeight: 1.9 }}>
                      {bank && <div>Bank: {bank}</div>}
                      {ifsc && <div>IFSC: {ifsc}</div>}
                    </div>
                  ) : <div style={{ fontSize: 11, color: "#9ca3af" }}>–</div>}
                </div>
                <div style={{ padding: "10px 12px", minHeight: 60 }}>
                  {/* spare column — salesman or custom info if available */}
                  {quotation.salesman && (
                    <>
                      <div style={{ fontSize: 9.5, fontWeight: 700, color: "#374151", marginBottom: 5,
                        textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>SALESMAN</div>
                      <div style={{ fontSize: 11, color: "#374151" }}>{quotation.salesman}</div>
                    </>
                  )}
                </div>
              </div>

              {/* ── 9. Signatures row ── */}
              <div style={{ display: "grid", gridTemplateColumns: (misc?.receiverSig ?? false) ? "1fr 1fr" : "1fr" }}>
                <div style={{
                  borderRight: (misc?.receiverSig ?? false) ? B : "none",
                  padding: "10px 14px", minHeight: 70,
                  display: "flex", flexDirection: "column", justifyContent: "flex-end",
                }}>
                  {signUrl ? (
                    <img src={signUrl} alt="Signature"
                      style={{ height: 44, maxWidth: 140, objectFit: "contain", marginBottom: 4, display: "block" }}/>
                  ) : (
                    <div style={{ height: 36, marginBottom: 4, borderTop: "1px solid #d1d5db", width: 130 }}/>
                  )}
                  <div style={{ fontSize: 10.5, color: "#374151" }}>
                    Authorised Signatory For<br/>
                    <strong style={{ color: "#111827" }}>{companyName}</strong>
                  </div>
                </div>
                {(misc?.receiverSig ?? false) && (
                  <div style={{ padding: "10px 14px", minHeight: 70,
                    display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "flex-end" }}>
                    <div style={{ height: 36, marginBottom: 4, borderTop: "1px solid #d1d5db", width: 130 }}/>
                    <div style={{ fontSize: 10.5, color: "#374151" }}>Receiver's Signature</div>
                  </div>
                )}
              </div>

            </div>{/* end bordered box */}

            <div style={{ textAlign: "center", fontSize: 10.5, color: "#9ca3af", marginTop: 12, letterSpacing: "0.04em" }}>
              This is a computer generated quotation.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}