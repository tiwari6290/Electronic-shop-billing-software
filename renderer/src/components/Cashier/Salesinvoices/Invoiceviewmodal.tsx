import { useEffect, useRef } from "react";
import "./InvoiceViewModal.css";

// ─── Types (minimal subset needed for rendering) ──────────────────────────────
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
  id: string;
  name: string;
  themeColor: string;
  style: {
    font: string; textSize: string; themeColor: string;
    borderColor: string; borderWidth: string;
    showLogo: boolean; logoUrl: string;
  };
  vis: {
    companyName: boolean; slogan: boolean; address: boolean;
    gstin: boolean; phone: boolean; pan: boolean; email: boolean;
  };
  misc: {
    showNotes: boolean; amountWords: boolean; showTerms: boolean;
    receiverSig: boolean; signatureUrl: string;
  };
  ts: {
    hsnSummary: boolean; showDesc: boolean; capitalize: boolean;
    cols: Record<string, boolean>;
    backgroundUrl: string; backgroundOpacity: number;
  };
  inv: {
    companyName: string; slogan: string; address: string;
    gstin: string; phone: string; email: string; pan: string;
    bank: string; ifsc: string;
    terms: string;
  };
}

interface Business {
  companyName: string;
  address: string;
  gstin: string;
  phone: string;
  email: string;
  pan: string;
  bank: string;
  ifsc: string;
}

interface Props {
  invoice: SalesInvoice;
  template: SavedTemplate | null;
  business: Business;
  onClose: () => void;
  onEdit: () => void;
  onPrint: () => void;
  onDownload: () => void;
}

function fmtDate(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function numToWords(n: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  if (n === 0) return "Zero";
  function helper(num: number): string {
    if (num === 0) return "";
    if (num < 20) return ones[num] + " ";
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "") + " ";
    if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred " + helper(num % 100);
    if (num < 100000) return helper(Math.floor(num / 1000)) + "Thousand " + helper(num % 1000);
    if (num < 10000000) return helper(Math.floor(num / 100000)) + "Lakh " + helper(num % 100000);
    return helper(Math.floor(num / 10000000)) + "Crore " + helper(num % 10000000);
  }
  const intPart = Math.floor(n);
  const decPart = Math.round((n - intPart) * 100);
  let result = helper(intPart).trim() + " Rupees";
  if (decPart > 0) result += " and " + helper(decPart).trim() + " Paise";
  return result + " Only";
}

export default function InvoiceViewModal({ invoice, template, business, onClose, onEdit, onPrint, onDownload }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

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

  // business info — use template's saved company info or fallback
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
  const showDisc = ts.cols["Discount"] !== false;
  const showAmt = ts.cols["Amount"] !== false;

  // Calculations
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

  // HSN summary grouping
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
        .inv-print { padding: 32px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 7px 10px; font-size: ${fontSize}; }
        @media print { body { margin: 0; } }
      </style>
    </head><body><div class="inv-print">${content}</div></body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 500);
  }

  // Close on Escape
  useEffect(() => {
    function h(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const statusColor = invoice.status === "Paid" ? "#16a34a" : invoice.status === "Unpaid" ? "#dc2626" : invoice.status === "Partially Paid" ? "#d97706" : "#6b7280";

  return (
    <div className="ivm-overlay" onClick={onClose}>
      <div className="ivm-shell" onClick={e => e.stopPropagation()}>

        {/* ── Top Bar ── */}
        <div className="ivm-topbar">
          <div className="ivm-topbar-left">
            <button className="ivm-back-btn" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="ivm-title">Sales Invoice #{invoice.invoiceNo}</span>
            <span className="ivm-status-badge" style={{ background: statusColor + "18", color: statusColor, border: `1px solid ${statusColor}40` }}>
              {invoice.status}
            </span>
          </div>
          <div className="ivm-topbar-right">
            <button className="ivm-top-btn" title="Profit Details">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Profit Details
            </button>
            <button className="ivm-top-btn ivm-top-btn--dots">
              <svg viewBox="0 0 24 24" fill="currentColor" style={{width:16,height:16}}><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
            </button>
            <button className="ivm-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* ── Action Bar ── */}
        <div className="ivm-actionbar">
          <div className="ivm-actionbar-left">
            <div className="ivm-action-group">
              <button className="ivm-action-btn" onClick={handlePrint}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Print PDF
              </button>
              <button className="ivm-action-split">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>
            <div className="ivm-action-group">
              <button className="ivm-action-btn" onClick={onDownload}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download PDF
              </button>
              <button className="ivm-action-split">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>
            <div className="ivm-action-group">
              <button className="ivm-action-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Share
              </button>
              <button className="ivm-action-split">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>
          </div>
          <div className="ivm-actionbar-right">
            <button className="ivm-eway-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              Generate E-way Bill
            </button>
            <button className="ivm-einvoice-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Generate e-Invoice
            </button>
            <button className="ivm-record-btn" onClick={onEdit}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Record Payment In
            </button>
          </div>
        </div>

        {/* ── Main Body ── */}
        <div className="ivm-body">

          {/* Invoice Preview */}
          <div className="ivm-preview-area">
            <div className="ivm-preview-label">TAX INVOICE <span className="ivm-original-tag">ORIGINAL FOR RECIPIENT</span></div>

            <div
              ref={printRef}
              className="ivm-invoice-paper"
              style={{ fontFamily: font, fontSize, position: "relative", overflow: "hidden" }}
            >
              {/* Background image */}
              {bgUrl && (
                <div style={{
                  position: "absolute", inset: 0,
                  backgroundImage: `url(${bgUrl})`,
                  backgroundSize: "cover", backgroundPosition: "center",
                  opacity: bgOpacity / 100, pointerEvents: "none", zIndex: 0,
                }}/>
              )}

              <div style={{ position: "relative", zIndex: 1 }}>
                {/* Header */}
                <div className="ivm-inv-header">
                  {showLogo && <img src={logoUrl} alt="logo" className="ivm-inv-logo"/>}
                  <div style={{ flex: 1 }}>
                    {vis.companyName && <div className="ivm-inv-company" style={{ color: tc }}>{companyName}</div>}
                    {vis.address && <div className="ivm-inv-meta">{address}</div>}
                    <div className="ivm-inv-meta">
                      {[vis.gstin && `GSTIN: ${gstin}`, vis.phone && `Mobile: ${phone}`, vis.email && `Email: ${email}`].filter(Boolean).join("  |  ")}
                    </div>
                    {vis.pan && <div className="ivm-inv-meta">PAN: {pan}</div>}
                  </div>
                  <div className="ivm-inv-meta-box">
                    <div className="ivm-inv-meta-row"><span>Invoice No.</span><strong>{invoice.invoiceNo}</strong></div>
                    <div className="ivm-inv-meta-row"><span>Invoice Date</span><strong>{fmtDate(invoice.invoiceDate)}</strong></div>
                    {invoice.financedBy && <div className="ivm-inv-meta-row"><span>Financed By</span><strong>{invoice.financedBy}</strong></div>}
                  </div>
                </div>

                <hr style={{ borderColor: tc, borderWidth: "1.5px", margin: "8px 0" }}/>

                {/* Bill To */}
                <div className="ivm-party-grid">
                  <div className="ivm-party-box" style={{ border: bw }}>
                    <div className="ivm-party-label" style={{ color: tc }}>BILL TO</div>
                    {invoice.party ? (
                      <>
                        <div className="ivm-party-name">{invoice.party.name}</div>
                        {invoice.party.mobile && <div className="ivm-party-detail">Mobile: {invoice.party.mobile}</div>}
                        {invoice.party.billingAddress && <div className="ivm-party-detail">{invoice.party.billingAddress}</div>}
                        {invoice.party.gstin && <div className="ivm-party-detail">GSTIN: {invoice.party.gstin}</div>}
                      </>
                    ) : <div className="ivm-party-detail">–</div>}
                  </div>
                  {invoice.eWayBillNo && (
                    <div className="ivm-party-box" style={{ border: bw }}>
                      <div className="ivm-party-label" style={{ color: tc }}>E-WAY BILL</div>
                      <div className="ivm-party-detail">{invoice.eWayBillNo}</div>
                    </div>
                  )}
                </div>

                {/* Items Table */}
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
                      const base = item.qty * item.price - (item.qty * item.price * item.discountPct / 100) - item.discountAmt;
                      const tax = base * item.taxRate / 100;
                      return (
                        <tr key={i} style={{ background: i % 2 === 0 ? "#fafafa" : "#fff" }}>
                          {showSerial && <td className="center">{i + 1}</td>}
                          <td>
                            <div>{ts.capitalize ? (item.name || "Item").toUpperCase() : (item.name || "Item")}</div>
                            {ts.showDesc && item.description && <div style={{ fontSize: "11px", color: "#6b7280" }}>{item.description}</div>}
                          </td>
                          {showHSN && <td className="center">{item.hsn || "–"}</td>}
                          {showQty && <td className="center">{item.qty} {item.unit || ""}</td>}
                          {showRate && <td className="center">₹{item.price.toLocaleString("en-IN")}</td>}
                          <td className="center">
                            {item.taxRate > 0 ? (
                              <>₹{tax.toFixed(2)}<div style={{fontSize:"11px",color:"#6b7280"}}>({item.taxRate}%)</div></>
                            ) : "–"}
                          </td>
                          {showAmt && <td className="right">₹{item.amount.toLocaleString("en-IN")}</td>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="ivm-totals-row">
                  <div style={{ flex: 1 }}>
                    {/* Bank details */}
                    <div className="ivm-bank-box" style={{ border: bw }}>
                      <div style={{ fontWeight: 700, marginBottom: 4, fontSize: "12px" }}>Bank Details</div>
                      <div>{bankInfo}</div>
                      {ifsc && <div>IFSC: {ifsc}</div>}
                    </div>
                  </div>
                  <table className="ivm-totals-table">
                    <tbody>
                      <tr><td>TOTAL</td><td>{invoice.billItems.reduce((s,i) => s+i.qty,0)}</td><td className="right">₹{totalTax.toFixed(2)}</td><td className="right">₹{grandTotal.toLocaleString("en-IN")}</td></tr>
                      <tr><td colSpan={2}>RECEIVED AMOUNT</td><td colSpan={2} className="right">₹{invoice.amountReceived.toLocaleString("en-IN")}</td></tr>
                      <tr><td colSpan={2}>BALANCE AMOUNT</td><td colSpan={2} className="right" style={{ color: balance > 0 ? "#dc2626" : "#16a34a", fontWeight: 700 }}>₹{balance.toLocaleString("en-IN")}</td></tr>
                    </tbody>
                  </table>
                </div>

                {/* HSN Summary */}
                {ts.hsnSummary && Object.keys(hsnGroups).length > 0 && (
                  <div className="ivm-hsn-summary">
                    <div style={{ fontWeight: 700, color: tc, marginBottom: 6, fontSize: "12px" }}>HSN-wise Tax Summary</div>
                    <table className="ivm-items-table">
                      <thead>
                        <tr style={{ background: tc, color: "#fff" }}>
                          <th>HSN/SAC</th><th>Taxable Value</th>
                          <th>CGST Rate</th><th>CGST Amount</th>
                          <th>SGST Rate</th><th>SGST Amount</th>
                          <th>Total Tax Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(hsnGroups).map(([hsn, { taxable, cgst, sgst }]) => (
                          <tr key={hsn}>
                            <td className="center">{hsn}</td>
                            <td className="right">₹{taxable.toFixed(2)}</td>
                            <td className="center">9%</td><td className="right">₹{cgst.toFixed(2)}</td>
                            <td className="center">9%</td><td className="right">₹{sgst.toFixed(2)}</td>
                            <td className="right">₹{(cgst+sgst).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Amount in words */}
                {misc.amountWords && (
                  <div className="ivm-words-row">
                    <strong>Total Amount (in words)</strong><br/>
                    {numToWords(grandTotal)}
                  </div>
                )}

                {/* Terms */}
                {misc.showTerms && (
                  <div className="ivm-terms-box">
                    <div style={{ fontWeight: 700, marginBottom: 4, fontSize: "12px" }}>Terms and Conditions</div>
                    <div style={{ color: "#6b7280" }}>{invoice.termsConditions || defaultTerms}</div>
                  </div>
                )}

                {/* Notes */}
                {misc.showNotes && invoice.notes && (
                  <div className="ivm-notes-box">
                    <strong>Notes:</strong> {invoice.notes}
                  </div>
                )}

                {/* Footer / Signature */}
                <div className="ivm-signature-row">
                  {misc.receiverSig && (
                    <div className="ivm-sig-box">
                      <div className="ivm-sig-line"/>
                      <div className="ivm-sig-label">Receiver's Signature</div>
                    </div>
                  )}
                  <div className="ivm-sig-box" style={{ marginLeft: "auto" }}>
                    {misc.signatureUrl && (
                      <img src={misc.signatureUrl} alt="Signature" style={{ height: 50, maxWidth: 140, objectFit: "contain", display: "block", margin: "0 auto 4px" }}/>
                    )}
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
                <div className="ivm-ph-entry-top">
                  <span>Payment Received</span>
                  <strong style={{ color: "#16a34a" }}>₹{invoice.amountReceived.toLocaleString("en-IN")}</strong>
                </div>
                <div className="ivm-ph-entry-date">{fmtDate(invoice.createdAt)}</div>
              </div>
            )}
            <div style={{ flex: 1 }}/>
            <div className="ivm-ph-total-row">
              <span>Total Amount Received</span>
              <strong>₹{invoice.amountReceived.toLocaleString("en-IN")}</strong>
            </div>
            <div className="ivm-ph-balance-row">
              <span>Balance Amount</span>
              <strong style={{ color: balance > 0 ? "#dc2626" : "#16a34a" }}>₹{balance.toLocaleString("en-IN")}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}