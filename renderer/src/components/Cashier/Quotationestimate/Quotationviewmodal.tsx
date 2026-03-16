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

// ─── Load active template from localStorage (set by InvoiceBuilder) ──────────
function loadTemplate(): SavedTemplate | null {
  try { return JSON.parse(localStorage.getItem("activeInvoiceTemplate") || "null"); }
  catch { return null; }
}

interface Props {
  quotation: QuotationData;
  onClose: () => void;
  onEdit: () => void;
  /** Called when user clicks "Convert to Invoice" — parent navigates to CreateSalesInvoice with fromQuotation */
  onConvertToInvoice?: (quotation: QuotationData) => void;
  /** Called after duplicate — parent re-opens list or view with new quotation */
  onDuplicate?: (newQuotation: QuotationData) => void;
  /** Called after delete — parent navigates back to list */
  onDelete?: (id: string) => void;
}

export default function QuotationViewModal({
  quotation,
  onClose,
  onEdit,
  onConvertToInvoice,
  onDuplicate,
  onDelete,
}: Props) {
  const [tpl] = useState<SavedTemplate | null>(loadTemplate);

  // ── Three-dot dropdown state ──────────────────────────────────────────────
  const [showDotMenu, setShowDotMenu] = useState(false);
  const dotMenuRef = useRef<HTMLDivElement>(null);

  // Close dot menu on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dotMenuRef.current && !dotMenuRef.current.contains(e.target as Node)) {
        setShowDotMenu(false);
      }
    }
    if (showDotMenu) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [showDotMenu]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  // ── Three-dot menu actions ────────────────────────────────────────────────
  function handleMenuEdit() {
    setShowDotMenu(false);
    onEdit();
  }

  function handleEditHistory() {
    setShowDotMenu(false);
    alert("Edit History coming soon!");
  }

  async function handleDuplicate() {
    setShowDotMenu(false);
    if (!quotation.id) return;
    try {
      const newQ = await apiDuplicateQuotation(Number(quotation.id));
      if (onDuplicate) onDuplicate(apiToFormData(newQ));
      else alert(`Quotation duplicated as #${newQ.quotationNo}`);
    } catch (err: any) {
      alert(`Failed to duplicate: ${err.message}`);
    }
  }

  async function handleDelete() {
    setShowDotMenu(false);
    if (!window.confirm(`Delete Quotation #${quotation.quotationNo}? This cannot be undone.`)) return;
    try {
      await apiDeleteQuotation(Number(quotation.id));
      if (onDelete) onDelete(quotation.id);
      else { alert("Quotation deleted."); onClose(); }
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    }
  }

  // ── Convert to Invoice ────────────────────────────────────────────────────
  // NOTE: We do NOT close the quotation here.
  // The quotation status is set to "Closed" only when the sales invoice is actually saved.
  // The parent (CreateSalesInvoice) calls onBack which should trigger closeQuotation.
  // We pass the quotation id via the quotation object so CreateSalesInvoice can close it on save.
  function handleConvertToInvoice() {
    if (onConvertToInvoice) {
      onConvertToInvoice(quotation);
    }
  }

  // ── Pull all styling from template ────────────────────────────────────────
  const style  = tpl?.style;
  const vis    = tpl?.vis;
  const ts     = tpl?.ts;
  const misc   = tpl?.misc;
  const pv     = tpl?.pv;
  const bizInv = tpl?.inv;

  const tc      = style?.themeColor  ?? "#4f46e5";
  const font    = style?.font        ?? "Arial";
  const tSize   = style?.textSize    ?? "13px";
  const bColor  = style?.borderColor ?? "#e5e7eb";
  const bWidth  = style?.borderWidth ?? "1";
  const border  = `${bWidth}px solid ${bColor}`;
  const showLogo = style?.showLogo ?? false;
  const logoUrl  = style?.logoUrl  ?? "";
  const bgUrl    = ts?.backgroundUrl     ?? "";
  const bgOpac   = (ts?.backgroundOpacity ?? 15) / 100;
  const signUrl  = misc?.signatureUrl ?? "";

  const showSerial = ts?.cols?.["Serial Number"] !== false;
  const showHSN    = ts?.cols?.["HSN"]         !== false;
  const showMRP    = ts?.cols?.["MRP"]         === true;
  const showQty    = ts?.cols?.["Quantity"]    !== false;
  const showRate   = ts?.cols?.["Rate/Item"]   !== false;
  const showDisc   = ts?.cols?.["Discount"]    !== false;
  const showAmt    = ts?.cols?.["Amount"]      !== false;

  // ── Calculations ──────────────────────────────────────────────────────────
  const subtotal     = quotation.billItems.reduce((s, i) => s + i.amount, 0);
  const chargesTotal = quotation.additionalCharges.reduce((s, c) => s + c.amount, 0);
  const taxableAmt   = subtotal + chargesTotal;
  const discountVal  = quotation.discountPct > 0
    ? (taxableAmt * quotation.discountPct) / 100
    : quotation.discountAmt;
  const roundVal = quotation.roundOff === "+Add"
    ? quotation.roundOffAmt
    : quotation.roundOff === "-Reduce" ? -quotation.roundOffAmt : 0;
  const grandTotal = taxableAmt - discountVal + roundVal;

  const cgstTotal = quotation.billItems.reduce((s, i) => {
    const base = i.price * i.qty - (i.discountPct > 0 ? i.price*i.qty*i.discountPct/100 : i.discountAmt);
    return s + (base * i.taxRate) / 200;
  }, 0);
  const sgstTotal = cgstTotal;

  const hsnGroups = quotation.billItems.reduce<Record<string,{taxable:number;tax:number}>>((acc, item) => {
    const k = item.hsn || "-";
    if (!acc[k]) acc[k] = { taxable: 0, tax: 0 };
    const base = item.price*item.qty - (item.discountPct>0 ? item.price*item.qty*item.discountPct/100 : item.discountAmt);
    acc[k].taxable += base;
    acc[k].tax     += base * item.taxRate / 100;
    return acc;
  }, {});

  function handlePrint() {
    const el = document.getElementById("qvm-paper");
    if (!el) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Quotation #${quotation.quotationNo}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:${font},Arial,sans-serif;font-size:${tSize};color:#1a1a1a;padding:24px;background:#fff;}
  table{width:100%;border-collapse:collapse;}
  th,td{padding:6px 10px;border:${border};font-size:11.5px;}
  .tc{text-align:center;} .tr{text-align:right;}
  pre{font-family:inherit;white-space:pre-wrap;}
  @media print{body{padding:0;}}
</style></head><body>${el.innerHTML}</body></html>`);
    w.document.close(); w.focus();
    setTimeout(() => { w.print(); w.close(); }, 500);
  }

  return (
    <div className="qvm-overlay" onClick={onClose}>
      <div className="qvm-shell" onClick={e => e.stopPropagation()}>

        {/* ── Top Bar ───────────────────────────────────────────────────── */}
        <div className="qvm-topbar">
          <div className="qvm-topbar-left">
            <button className="qvm-back-btn" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="qvm-topbar-title">Quotation / Estimate #{quotation.quotationNo}</span>
            <span className={`qvm-status-badge qvm-status-badge--${quotation.status.toLowerCase()}`}>{quotation.status}</span>
          </div>
          <div className="qvm-topbar-right">
            {/* ── Three-dot menu ─────────────────────────────────── */}
            <div className="qvm-dot-menu-wrap" ref={dotMenuRef}>
              <button
                className="qvm-topbar-icon-btn"
                onClick={() => setShowDotMenu(v => !v)}
                title="More options"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="5"  cy="12" r="1.5" fill="currentColor"/>
                  <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                  <circle cx="19" cy="12" r="1.5" fill="currentColor"/>
                </svg>
              </button>

              {showDotMenu && (
                <div className="qvm-dot-dropdown">
                  <button className="qvm-dot-item" onClick={handleMenuEdit}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                  </button>
                  <button className="qvm-dot-item" onClick={handleEditHistory}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                      <polyline points="1 4 1 10 7 10"/>
                      <path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
                    </svg>
                    Edit History
                  </button>
                  <button className="qvm-dot-item" onClick={handleDuplicate}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    Duplicate
                  </button>
                  <div className="qvm-dot-divider" />
                  <button className="qvm-dot-item qvm-dot-item--danger" onClick={handleDelete}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Action Bar ────────────────────────────────────────────────── */}
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

          <div className="qvm-action-split">
            <button className="qvm-action-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Share
            </button>
            <button className="qvm-action-split-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></button>
          </div>

          <button className="qvm-action-btn qvm-action-btn--border" onClick={onEdit}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>

          <div className="qvm-action-spacer" />

          {/* Template indicator */}
          {tpl ? (
            <div className="qvm-template-tag">
              <span className="qvm-template-dot" style={{ background: tc }} />
              <span>Template: <b>{tpl.name}</b></span>
            </div>
          ) : (
            <div className="qvm-template-tag qvm-template-tag--warn">
              ⚠ No template — open Invoice Builder and save one
            </div>
          )}

          {/* ── Convert to Invoice button ─────────────────────────── */}
          {quotation.status !== "Closed" && (
            <button
              className="qvm-convert-btn"
              onClick={handleConvertToInvoice}
            >
              Convert to Invoice
            </button>
          )}
          {quotation.status === "Closed" && (
            <div className="qvm-converted-badge">
              ✓ Converted to Invoice
            </div>
          )}
        </div>

        {/* ── Invoice Paper ─────────────────────────────────────────────── */}
        <div className="qvm-preview-area">
          <div
            id="qvm-paper"
            className="qvm-paper"
            style={{ fontFamily: font, fontSize: tSize }}
          >
            {bgUrl && (
              <div aria-hidden="true" style={{
                position:"absolute", inset:0, zIndex:0, pointerEvents:"none",
                backgroundImage:`url(${bgUrl})`, backgroundSize:"cover",
                backgroundPosition:"center", opacity: bgOpac,
              }} />
            )}

            <div style={{ position:"relative", zIndex:1 }}>

              {/* ── HEADER ─────────────────────────────────────────────── */}
              <div className="qvm-inv-header-row">
                <div className="qvm-inv-biz-block">
                  {showLogo && logoUrl
                    ? <img src={logoUrl} alt="Logo" className="qvm-inv-logo" />
                    : <div className="qvm-inv-logo-ph" style={{ background: tc }}><span>SC</span></div>
                  }
                  <div className="qvm-inv-biz-text">
                    {(vis?.companyName ?? true)  && <div className="qvm-inv-company-name" style={{ color: tc }}>{bizInv?.companyName ?? "Your Company"}</div>}
                    {(vis?.slogan     ?? false)  && bizInv?.slogan && <div className="qvm-inv-slogan">{bizInv.slogan}</div>}
                    {(vis?.address    ?? true)   && bizInv?.address && <div className="qvm-inv-addr">{bizInv.address}{bizInv?.city ? `, ${bizInv.city}` : ""}{bizInv?.state ? `, ${bizInv.state}` : ""}</div>}
                    <div className="qvm-inv-contact-line">
                      {[
                        (vis?.gstin ?? true)  && bizInv?.gstin && `GSTIN: ${bizInv.gstin}`,
                        (vis?.phone ?? true)  && bizInv?.phone && `Ph: ${bizInv.phone}`,
                        (vis?.email ?? true)  && bizInv?.email && `Email: ${bizInv.email}`,
                      ].filter(Boolean).join("  ")}
                    </div>
                    {(vis?.pan ?? false) && bizInv?.pan && <div className="qvm-inv-contact-line">PAN: {bizInv.pan}</div>}
                  </div>
                </div>

                <div className="qvm-inv-meta-block" style={{ border }}>
                  <div className="qvm-inv-doc-type" style={{ background: tc }}>QUOTATION</div>
                  <div className="qvm-inv-meta-grid">
                    <div className="qvm-inv-meta-item">
                      <span className="qvm-inv-meta-key">Quotation No.</span>
                      <span className="qvm-inv-meta-val">{quotation.quotationNo}</span>
                    </div>
                    <div className="qvm-inv-meta-item">
                      <span className="qvm-inv-meta-key">Date</span>
                      <span className="qvm-inv-meta-val">{fmtDate(quotation.quotationDate)}</span>
                    </div>
                    {quotation.showDueDate && quotation.validityDate && (
                      <div className="qvm-inv-meta-item">
                        <span className="qvm-inv-meta-key">Valid Until</span>
                        <span className="qvm-inv-meta-val">{fmtDate(quotation.validityDate)}</span>
                      </div>
                    )}
                    {quotation.eWayBillNo && (
                      <div className="qvm-inv-meta-item">
                        <span className="qvm-inv-meta-key">E-Way Bill</span>
                        <span className="qvm-inv-meta-val">{quotation.eWayBillNo}</span>
                      </div>
                    )}
                    {quotation.challanNo && (
                      <div className="qvm-inv-meta-item">
                        <span className="qvm-inv-meta-key">Challan No.</span>
                        <span className="qvm-inv-meta-val">{quotation.challanNo}</span>
                      </div>
                    )}
                    {quotation.salesman && (
                      <div className="qvm-inv-meta-item">
                        <span className="qvm-inv-meta-key">Salesman</span>
                        <span className="qvm-inv-meta-val">{quotation.salesman}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <hr className="qvm-inv-hr" style={{ borderColor: tc }} />

              {/* ── BILL TO ──────────────────────────────────────────────── */}
              {quotation.party && (
                <div className="qvm-inv-party-row">
                  <div className="qvm-inv-party-box" style={{ border }}>
                    <div className="qvm-inv-party-type" style={{ color: tc }}>BILL TO</div>
                    {(pv?.billCompany ?? true)  && <div className="qvm-inv-party-name">{quotation.party.name}</div>}
                    {(pv?.billMobile  ?? true)  && quotation.party.mobile !== "-" && <div className="qvm-inv-party-detail">Mobile: {quotation.party.mobile}</div>}
                    {(pv?.billAddress ?? true)  && (quotation.party as any).billingAddress && <div className="qvm-inv-party-detail">{(quotation.party as any).billingAddress}</div>}
                    {(pv?.billGstin   ?? true)  && (quotation.party as any).gstin && <div className="qvm-inv-party-detail">GSTIN: {(quotation.party as any).gstin}</div>}
                  </div>
                </div>
              )}

              {/* ── ITEMS TABLE ───────────────────────────────────────────── */}
              <table className="qvm-inv-table" style={{ borderColor: bColor }}>
                <thead>
                  <tr style={{ background: tc, color: "#fff" }}>
                    {showSerial && <th className="qvm-inv-th qvm-inv-th--sno">#</th>}
                    <th className="qvm-inv-th">ITEM / SERVICES</th>
                    {showHSN  && <th className="qvm-inv-th qvm-inv-th--c">HSN/SAC</th>}
                    {showQty  && <th className="qvm-inv-th qvm-inv-th--c">QTY</th>}
                    {showMRP  && <th className="qvm-inv-th qvm-inv-th--r">MRP</th>}
                    {showRate && <th className="qvm-inv-th qvm-inv-th--r">RATE (₹)</th>}
                    {showDisc && <th className="qvm-inv-th qvm-inv-th--r">DISC.</th>}
                    <th className="qvm-inv-th qvm-inv-th--r">TAX</th>
                    {showAmt  && <th className="qvm-inv-th qvm-inv-th--r">AMOUNT (₹)</th>}
                  </tr>
                </thead>
                <tbody>
                  {quotation.billItems.length === 0
                    ? <tr><td colSpan={9} className="qvm-inv-no-items">No items added</td></tr>
                    : quotation.billItems.map((item, idx) => {
                      const base = item.price * item.qty;
                      const disc = item.discountPct > 0 ? base * item.discountPct / 100 : item.discountAmt;
                      const tax  = (base - disc) * item.taxRate / 100;
                      const itemName = (ts?.capitalize ?? false) ? item.name.toUpperCase() : item.name;
                      return (
                        <tr key={item.rowId} style={{ background: idx % 2 === 1 ? "#fafafa" : "#fff" }}>
                          {showSerial && <td className="qvm-inv-td qvm-inv-td--c">{idx + 1}</td>}
                          <td className="qvm-inv-td">
                            <div className="qvm-inv-item-name">{itemName}</div>
                            {(ts?.showDesc ?? true) && item.description && (
                              <div className="qvm-inv-item-desc">{item.description}</div>
                            )}
                          </td>
                          {showHSN  && <td className="qvm-inv-td qvm-inv-td--c">{item.hsn || "—"}</td>}
                          {showQty  && <td className="qvm-inv-td qvm-inv-td--c">{item.qty} {item.unit}</td>}
                          {showMRP  && <td className="qvm-inv-td qvm-inv-td--r">{item.price.toLocaleString("en-IN")}</td>}
                          {showRate && <td className="qvm-inv-td qvm-inv-td--r">{item.price.toLocaleString("en-IN")}</td>}
                          {showDisc && (
                            <td className="qvm-inv-td qvm-inv-td--r">
                              {disc > 0 ? disc.toFixed(0) : "—"}
                              {item.discountPct > 0 && <div className="qvm-inv-sub">({item.discountPct}%)</div>}
                            </td>
                          )}
                          <td className="qvm-inv-td qvm-inv-td--r">
                            {tax > 0 ? tax.toFixed(0) : "—"}
                            {item.taxRate > 0 && <div className="qvm-inv-sub">({item.taxRate}%)</div>}
                          </td>
                          {showAmt && <td className="qvm-inv-td qvm-inv-td--r qvm-inv-td--bold">{item.amount.toLocaleString("en-IN")}</td>}
                        </tr>
                      );
                    })
                  }
                </tbody>
                <tfoot>
                  <tr style={{ background: "#f3f4f6", fontWeight: 600 }}>
                    <td className="qvm-inv-tf" colSpan={showSerial ? 2 : 1}>TOTAL</td>
                    {showHSN  && <td />}
                    {showQty  && <td className="qvm-inv-tf qvm-inv-td--c">{quotation.billItems.reduce((s,i)=>s+i.qty,0)}</td>}
                    {showMRP  && <td />}
                    {showRate && <td />}
                    {showDisc && <td className="qvm-inv-tf qvm-inv-td--r">{quotation.billItems.reduce((s,i)=>s+(i.discountPct>0?i.price*i.qty*i.discountPct/100:i.discountAmt),0).toFixed(0)}</td>}
                    <td className="qvm-inv-tf qvm-inv-td--r">{(cgstTotal+sgstTotal).toFixed(0)}</td>
                    {showAmt  && <td className="qvm-inv-tf qvm-inv-td--r" style={{ color: tc }}>₹ {grandTotal.toLocaleString("en-IN")}</td>}
                  </tr>
                </tfoot>
              </table>

              {/* ── HSN SUMMARY ───────────────────────────────────────────── */}
              {(ts?.hsnSummary ?? false) && Object.keys(hsnGroups).length > 0 && (
                <div className="qvm-inv-hsn-wrap">
                  <div className="qvm-inv-hsn-title" style={{ color: tc }}>HSN-wise Tax Summary</div>
                  <table className="qvm-inv-table" style={{ marginTop: 6, borderColor: bColor }}>
                    <thead>
                      <tr style={{ background: tc, color: "#fff" }}>
                        <th className="qvm-inv-th">HSN/SAC</th>
                        <th className="qvm-inv-th qvm-inv-th--r">Taxable Value</th>
                        <th className="qvm-inv-th qvm-inv-th--r">CGST</th>
                        <th className="qvm-inv-th qvm-inv-th--r">SGST</th>
                        <th className="qvm-inv-th qvm-inv-th--r">Total Tax</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(hsnGroups).map(([hsn, g], i) => (
                        <tr key={hsn} style={{ background: i%2===1 ? "#fafafa" : "#fff" }}>
                          <td className="qvm-inv-td">{hsn}</td>
                          <td className="qvm-inv-td qvm-inv-td--r">₹{g.taxable.toFixed(2)}</td>
                          <td className="qvm-inv-td qvm-inv-td--r">₹{(g.tax/2).toFixed(2)}</td>
                          <td className="qvm-inv-td qvm-inv-td--r">₹{(g.tax/2).toFixed(2)}</td>
                          <td className="qvm-inv-td qvm-inv-td--r">₹{g.tax.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── TOTALS ────────────────────────────────────────────────── */}
              <div className="qvm-inv-totals-wrap">
                <table className="qvm-inv-totals-tbl">
                  <tbody>
                    <tr><td>Subtotal</td>                     <td>₹{subtotal.toFixed(2)}</td></tr>
                    {chargesTotal > 0 && <tr><td>Additional Charges</td><td>₹{chargesTotal.toFixed(2)}</td></tr>}
                    {cgstTotal > 0    && <tr><td>CGST</td>           <td>₹{cgstTotal.toFixed(2)}</td></tr>}
                    {sgstTotal > 0    && <tr><td>SGST</td>           <td>₹{sgstTotal.toFixed(2)}</td></tr>}
                    {discountVal > 0  && <tr><td>Discount</td>       <td style={{color:"#16a34a"}}>- ₹{discountVal.toFixed(2)}</td></tr>}
                    {roundVal !== 0   && <tr><td>Round Off</td>      <td>{roundVal>0?"+":""}₹{Math.abs(roundVal).toFixed(2)}</td></tr>}
                    <tr className="qvm-inv-grand-row">
                      <td>Grand Total</td>
                      <td style={{ color: tc }}>₹{grandTotal.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ── AMOUNT IN WORDS ───────────────────────────────────────── */}
              {(misc?.amountWords ?? true) && (
                <p className="qvm-inv-words"><b>Amount in Words:</b> {numToWords(grandTotal)}</p>
              )}

              {/* ── BANK DETAILS ──────────────────────────────────────────── */}
              {bizInv?.bank && (
                <div className="qvm-inv-bank" style={{ border }}>
                  <div className="qvm-inv-bank-title" style={{ color: tc }}>Bank Details</div>
                  <div className="qvm-inv-bank-body">
                    <div>Account: {bizInv.bank}</div>
                    {bizInv?.ifsc && <div>IFSC: {bizInv.ifsc}</div>}
                  </div>
                </div>
              )}

              {/* ── NOTES ─────────────────────────────────────────────────── */}
              {(misc?.showNotes ?? true) && quotation.notes && (
                <div className="qvm-inv-section">
                  <div className="qvm-inv-section-title">Notes</div>
                  <div>{quotation.notes}</div>
                </div>
              )}

              {/* ── TERMS ─────────────────────────────────────────────────── */}
              {(misc?.showTerms ?? true) && quotation.termsConditions && (
                <div className="qvm-inv-section">
                  <div className="qvm-inv-section-title">Terms &amp; Conditions</div>
                  <pre className="qvm-inv-terms-pre">{quotation.termsConditions}</pre>
                </div>
              )}

              {/* ── SIGNATURE ─────────────────────────────────────────────── */}
              <div className={`qvm-inv-sig-row${(misc?.receiverSig ?? false) ? " qvm-inv-sig-row--dual" : ""}`}>
                {(misc?.receiverSig ?? false) && (
                  <div className="qvm-inv-sig-box">
                    <div className="qvm-inv-sig-line" />
                    <div className="qvm-inv-sig-label">Receiver's Signature</div>
                  </div>
                )}
                <div className="qvm-inv-sig-box">
                  {signUrl && <img src={signUrl} alt="Sig" className="qvm-inv-sig-img" />}
                  <div className="qvm-inv-sig-line" />
                  <div className="qvm-inv-sig-label">Authorized Signatory</div>
                  {bizInv?.companyName && <div className="qvm-inv-sig-company">{bizInv.companyName}</div>}
                </div>
              </div>

              <div className="qvm-inv-footer-note">This is a computer generated quotation.</div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}