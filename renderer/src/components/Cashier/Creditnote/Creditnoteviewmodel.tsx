import { useRef, useState } from "react";
import { CreditNote, calcTotal, calcItemAmount } from "./Creditnotetypes";
import "./CreditNoteViewModel.css";

// ─── Read active theme color from InvoiceBuilder localStorage ─────────────────
function getThemeColor(): string {
  try {
    const active = localStorage.getItem("activeInvoiceTemplate");
    if (active) {
      const parsed = JSON.parse(active);
      if (parsed?.style?.themeColor) return parsed.style.themeColor;
    }
  } catch {}
  return "#4f46e5"; // fallback
}

function getThemeFont(): string {
  try {
    const active = localStorage.getItem("activeInvoiceTemplate");
    if (active) {
      const parsed = JSON.parse(active);
      if (parsed?.style?.font) return parsed.style.font;
    }
  } catch {}
  return "Arial";
}

// ─── Number to Words ──────────────────────────────────────────────────────────
function numberToWords(n: number): string {
  if (n === 0) return "Zero Rupees Only";
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
    "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  function conv(num: number): string {
    if (num < 20)       return ones[num];
    if (num < 100)      return tens[Math.floor(num/10)] + (num%10 ? " "+ones[num%10] : "");
    if (num < 1000)     return ones[Math.floor(num/100)]+" Hundred"+(num%100?" "+conv(num%100):"");
    if (num < 100000)   return conv(Math.floor(num/1000))+" Thousand"+(num%1000?" "+conv(num%1000):"");
    if (num < 10000000) return conv(Math.floor(num/100000))+" Lakh"+(num%100000?" "+conv(num%100000):"");
    return conv(Math.floor(num/10000000))+" Crore"+(num%10000000?" "+conv(num%10000000):"");
  }
  const rupees = Math.floor(Math.abs(n));
  const paise  = Math.round((Math.abs(n) - rupees) * 100);
  let result = conv(rupees) + " Rupees";
  if (paise > 0) result += " and " + conv(paise) + " Paise";
  return result + " Only";
}

function fmtDocDate(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2,"0");
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const yy = d.getFullYear();
  const hh = d.getHours() % 12 || 12;
  const mi = String(d.getMinutes()).padStart(2,"0");
  const ap = d.getHours() >= 12 ? "PM" : "AM";
  return `${dd}/${mm}/${yy} ${hh}:${mi} ${ap}`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const DotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
  </svg>
);
const PrinterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
);
const EInvoiceIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const ShareIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const HistoryIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-4.99"/>
  </svg>
);
const DuplicateIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

// ─── Company info ─────────────────────────────────────────────────────────────
function getCompanyInfo() {
  try {
    const active = localStorage.getItem("activeInvoiceTemplate");
    if (active) {
      const parsed = JSON.parse(active);
      if (parsed?.inv) {
        return {
          name:    parsed.inv.companyName  || "Your Company",
          address: parsed.inv.companyAddress || "",
          mobile:  parsed.inv.companyPhone  || "",
          email:   parsed.inv.companyEmail  || "",
          gstin:   parsed.inv.gstin         || "",
          logo:    (parsed.style?.showLogo && parsed.style?.logoUrl) ? parsed.style.logoUrl : null as string | null,
        };
      }
    }
  } catch {}
  return {
    name: "scratchweb.solutions",
    address: "WEST SHANTINAGAR ANANDNAGAR BALLY\nHOWRAH SAREE HOUSE, HOWRAH, 711227",
    mobile: "06269909521",
    email: "rakeshranjantiwaril1@gmail.com",
    gstin: "",
    logo: null as string | null,
  };
}

// ─── HSN builder ─────────────────────────────────────────────────────────────
interface HsnRow { hsn: string; taxable: number; cgstR: number; cgstA: number; sgstR: number; sgstA: number; total: number; }
function buildHsn(cn: CreditNote): HsnRow[] {
  const map: Record<string, HsnRow> = {};
  for (const it of cn.billItems) {
    const key  = it.hsn || "-";
    const base = it.qty * it.price - (it.qty * it.price * it.discountPct / 100) - it.discountAmt;
    const tax  = base * it.taxRate / 100;
    if (!map[key]) map[key] = { hsn: key, taxable: 0, cgstR: it.taxRate/2, cgstA: 0, sgstR: it.taxRate/2, sgstA: 0, total: 0 };
    map[key].taxable += base;
    map[key].cgstA   += tax / 2;
    map[key].sgstA   += tax / 2;
    map[key].total   += tax;
  }
  return Object.values(map);
}

// ─── Props ───────────────────────────────────────────────────────────────────
export interface CreditNoteViewModelProps {
  creditNote: CreditNote;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (cn: CreditNote) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function CreditNoteViewModel({ creditNote: cn, onClose, onEdit, onDelete, onDuplicate }: CreditNoteViewModelProps) {
  const [dlOpen, setDlOpen]       = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [dotsOpen, setDotsOpen]   = useState(false);

  // Read theme from InvoiceBuilder settings
  const tc      = getThemeColor();
  const tfont   = getThemeFont();
  const company = getCompanyInfo();

  /* Calculations */
  const total    = calcTotal(cn);
  const balance  = Math.max(0, total - cn.amountPaid);
  const hsnRows  = buildHsn(cn);
  const totalTax = hsnRows.reduce((s, r) => s + r.total, 0);
  const totalQty = cn.billItems.reduce((s, i) => s + i.qty, 0);

  /* Linked invoice */
  let linkedInvNo = "-";
  if (cn.linkedInvoiceId) {
    try {
      const invs = JSON.parse(localStorage.getItem("salesInvoices") || "[]");
      const inv  = invs.find((x: any) => x.id === cn.linkedInvoiceId);
      if (inv) linkedInvNo = `#${inv.invoiceNo}`;
    } catch {}
  }

  const statusCls = `cnvm-badge cnvm-badge--${cn.status.toLowerCase().replace(/ /g, "-")}`;

  const handlePrint    = () => { setDlOpen(false); setPrintOpen(false); window.print(); };
  const handleDownload = () => { setDlOpen(false); window.print(); };

  return (
    <div className="cnvm-overlay">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="cnvm-topbar">
        <div className="cnvm-topbar-left">
          <button className="cnvm-back-btn" onClick={onClose} title="Back"><BackIcon /></button>
          <span className="cnvm-title">Credit Note #{cn.prefix}{cn.creditNoteNo}</span>
          <span className={statusCls}>{cn.status}</span>
        </div>
        <div className="cnvm-topbar-right">

          {/* ── Three-dot menu ── */}
          <div className="cnvm-dots-wrap">
            <button
              className="cnvm-icon-btn"
              title="More options"
              onClick={() => setDotsOpen(o => !o)}
            >
              <DotsIcon />
            </button>
            {dotsOpen && (
              <div className="cnvm-dots-dropdown" onClick={() => setDotsOpen(false)}>
                <button onClick={() => onEdit(cn.id)}>
                  <EditIcon /> Edit
                </button>
                <button>
                  <HistoryIcon /> Edit History
                </button>
                <button onClick={() => onDuplicate && onDuplicate(cn)}>
                  <DuplicateIcon /> Duplicate
                </button>
                <div className="cnvm-dots-divider" />
                <button
                  className="cnvm-dots-danger"
                  onClick={() => onDelete && onDelete(cn.id)}
                >
                  <TrashIcon /> Delete
                </button>
              </div>
            )}
          </div>

          <button className="cnvm-icon-btn" title="Print" onClick={handlePrint}>
            <PrinterIcon />
          </button>
          <button className="cnvm-generate-btn" style={{ background: tc }}>
            <EInvoiceIcon /> Generate e-Invoice
          </button>
        </div>
      </div>

      {/* ── Action bar ──────────────────────────────────────────────────── */}
      <div className="cnvm-actionbar">

        {/* Download PDF */}
        <div className="cnvm-split-wrap">
          <div className="cnvm-split-btn">
            <button className="cnvm-split-main" onClick={handleDownload}>
              <DownloadIcon /> Download PDF
            </button>
            <button className="cnvm-split-caret" onClick={() => { setDlOpen(o => !o); setPrintOpen(false); }}>
              <ChevronDown />
            </button>
          </div>
          {dlOpen && (
            <div className="cnvm-split-dropdown">
              <button onClick={handleDownload}>Download PDF</button>
              <button onClick={handlePrint}>Print &amp; Save</button>
            </div>
          )}
        </div>

        {/* Print PDF */}
        <div className="cnvm-split-wrap">
          <div className="cnvm-split-btn">
            <button className="cnvm-split-main" onClick={handlePrint}>
              <PrinterIcon /> Print PDF
            </button>
            <button className="cnvm-split-caret" onClick={() => { setPrintOpen(o => !o); setDlOpen(false); }}>
              <ChevronDown />
            </button>
          </div>
          {printOpen && (
            <div className="cnvm-split-dropdown">
              <button onClick={handlePrint}>Print PDF</button>
              <button onClick={handleDownload}>Save as PDF</button>
            </div>
          )}
        </div>

        {/* Refresh */}
        <button className="cnvm-action-btn" title="Refresh"><RefreshIcon /></button>

        {/* Share */}
        <button className="cnvm-action-btn"><ShareIcon /> Share <ChevronDown /></button>
      </div>

      {/* ── Document ────────────────────────────────────────────────────── */}
      <div className="cnvm-body">
        <div className="cnvm-doc" id="cnvm-printable" style={{ fontFamily: tfont }}>

          {/* Header */}
          <div className="cnvm-doc-header">
            <div className="cnvm-doc-company">
              <div className="cnvm-company-logo">
                {company.logo
                  ? <img src={company.logo} alt="logo" />
                  : <span className="cnvm-logo-placeholder">LOGO</span>
                }
              </div>
              <div>
                <div className="cnvm-company-name" style={{ color: tc }}>{company.name}</div>
                <div className="cnvm-company-addr" style={{ whiteSpace: "pre-line" }}>{company.address}</div>
                {company.mobile && <div className="cnvm-company-addr">Mobile: {company.mobile}</div>}
                {company.email  && <div className="cnvm-company-addr">Email: {company.email}</div>}
                {company.gstin  && <div className="cnvm-company-addr">GSTIN: {company.gstin}</div>}
              </div>
            </div>
            <div className="cnvm-doc-meta">
              <div className="cnvm-doc-title" style={{ color: tc, borderBottom: `2px solid ${tc}` }}>
                CREDIT NOTE
              </div>
              <div className="cnvm-meta-row">
                <div className="cnvm-meta-field">
                  <label>Credit Note No.</label>
                  <span>{cn.prefix}{cn.creditNoteNo}</span>
                </div>
                <div className="cnvm-meta-field">
                  <label>Credit Note Date</label>
                  <span>{fmtDocDate(cn.creditNoteDate)}</span>
                </div>
              </div>
              {linkedInvNo !== "-" && (
                <div className="cnvm-meta-row">
                  <div className="cnvm-meta-field">
                    <label>Against Invoice</label>
                    <span>{linkedInvNo}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Party */}
          <div className="cnvm-doc-party">
            <div className="cnvm-party-label" style={{ color: tc }}>PARTY NAME</div>
            <div className="cnvm-party-name">{cn.party?.name || "-"}</div>
            {cn.party?.mobile && <div className="cnvm-party-detail">Mobile: {cn.party.mobile}</div>}
            {cn.party?.billingAddress && <div className="cnvm-party-detail">{cn.party.billingAddress}</div>}
          </div>

          {/* Items table */}
          <table className="cnvm-items-table">
            <thead>
              <tr style={{ background: tc }}>
                <th className="ta-c" style={{ width: 38, color: "#fff" }}>S.NO.</th>
                <th style={{ color: "#fff" }}>SERVICES</th>
                <th className="ta-c" style={{ width: 80, color: "#fff" }}>QTY.</th>
                <th className="ta-r" style={{ width: 72, color: "#fff" }}>RATE</th>
                <th className="ta-r" style={{ width: 76, color: "#fff" }}>TAX</th>
                <th className="ta-r" style={{ width: 80, color: "#fff" }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {cn.billItems.map((it, idx) => {
                const base = it.qty * it.price - (it.qty * it.price * it.discountPct / 100) - it.discountAmt;
                const tax  = base * it.taxRate / 100;
                return (
                  <tr key={it.rowId}>
                    <td className="ta-c">{idx + 1}</td>
                    <td>
                      <div>{it.name}</div>
                      {it.description && <div className="cnvm-item-desc">{it.description}</div>}
                    </td>
                    <td className="ta-c">{it.qty} {it.unit}</td>
                    <td className="ta-r">{it.price.toLocaleString("en-IN")}</td>
                    <td className="ta-r">
                      <div>{tax > 0 ? Math.round(tax) : 0}</div>
                      <div className="cnvm-tax-note">({it.taxRate}%)</div>
                    </td>
                    <td className="ta-r">{calcItemAmount(it).toLocaleString("en-IN")}</td>
                  </tr>
                );
              })}
              <tr className="cnvm-empty-row"><td colSpan={6} /></tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="cnvm-totals-wrap">
            <table className="cnvm-totals-table">
              <tr className="totals-head-row" style={{ background: tc }}>
                <td colSpan={4} />
                <td className="ta-c" style={{ color: "#fff", fontWeight: 700, textTransform: "uppercase", fontSize: "10px", letterSpacing: "0.3px" }}>TOTAL</td>
                <td className="ta-r" style={{ color: "#fff", fontWeight: 700 }}>{totalQty}</td>
                <td className="ta-r" style={{ color: "#fff", fontWeight: 700 }}>₹ {Math.round(totalTax).toLocaleString("en-IN")}</td>
                <td className="ta-r" style={{ color: "#fff", fontWeight: 700 }}>₹ {total.toLocaleString("en-IN")}</td>
              </tr>
              <tr className="totals-row">
                <td colSpan={6} />
                <td className="cnvm-total-label">PAID AMOUNT</td>
                <td className="cnvm-total-val">₹ {cn.amountPaid.toLocaleString("en-IN")}</td>
              </tr>
              <tr className="totals-row">
                <td colSpan={6} />
                <td className="cnvm-total-label">BALANCE AMOUNT</td>
                <td className="cnvm-total-val">₹ {balance.toLocaleString("en-IN")}</td>
              </tr>
            </table>
          </div>

          {/* HSN Summary */}
          <div className="cnvm-hsn-wrap">
            <table className="cnvm-hsn-table">
              <thead>
                <tr style={{ background: tc }}>
                  <th rowSpan={2} style={{ color: "#fff" }}>HSN/SAC</th>
                  <th rowSpan={2} style={{ color: "#fff" }}>Taxable Value</th>
                  <th colSpan={2} style={{ color: "#fff" }}>CGST</th>
                  <th colSpan={2} style={{ color: "#fff" }}>SGST</th>
                  <th rowSpan={2} style={{ color: "#fff" }}>Total Tax Amount</th>
                </tr>
                <tr style={{ background: tc }}>
                  <th style={{ color: "#fff" }}>Rate</th><th style={{ color: "#fff" }}>Amount</th>
                  <th style={{ color: "#fff" }}>Rate</th><th style={{ color: "#fff" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {hsnRows.length > 0 ? hsnRows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.hsn}</td>
                    <td className="ta-r">{Math.round(r.taxable)}</td>
                    <td className="ta-c">{r.cgstR}%</td>
                    <td className="ta-r">{Math.round(r.cgstA)}</td>
                    <td className="ta-c">{r.sgstR}%</td>
                    <td className="ta-r">{Math.round(r.sgstA)}</td>
                    <td className="ta-r">₹ {Math.round(r.total)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td>-</td>
                    <td className="ta-r">{Math.round(total)}</td>
                    <td className="ta-c">0%</td><td>0</td>
                    <td className="ta-c">0%</td><td>0</td>
                    <td className="ta-r">₹ 0</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Amount in words */}
          <div className="cnvm-words-wrap">
            <div className="cnvm-words-label">Total Amount (in words)</div>
            <div className="cnvm-words-value">{numberToWords(total)}</div>
          </div>

          {/* Footer */}
          <div className="cnvm-doc-footer">
            <div className="cnvm-terms-wrap">
              {cn.termsConditions && (
                <>
                  <div className="cnvm-terms-label">Terms and Conditions</div>
                  <div className="cnvm-terms-text">{cn.termsConditions}</div>
                </>
              )}
              {cn.notes && (
                <div className="cnvm-terms-text" style={{ marginTop: 8, color: "#6b7280", fontStyle: "italic" }}>
                  {cn.notes}
                </div>
              )}
            </div>
            <div className="cnvm-signatory-wrap">
              <div className="cnvm-signatory-text">
                Authorised Signatory For<br />
                <strong style={{ color: tc }}>{company.name}</strong>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Click-outside for dots menu */}
      {dotsOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 99 }}
          onClick={() => setDotsOpen(false)}
        />
      )}
    </div>
  );
}