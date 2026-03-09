import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  SalesReturn,
  getSalesReturns,
  saveSalesReturn,
  calcItemAmount,
} from "./Salesreturntypes";
import "./SalesReturnViewModel.css";

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmtDate(s: string) {
  try {
    const d = new Date(s);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return s;
  }
}

function fmtShortDate(s: string) {
  try {
    const d = new Date(s);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return s;
  }
}

function numToWords(n: number): string {
  if (n === 0) return "Zero";
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten",
    "Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  function convert(num: number): string {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
    if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + convert(num % 100) : "");
    if (num < 100000) return convert(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + convert(num % 1000) : "");
    if (num < 10000000) return convert(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + convert(num % 100000) : "");
    return convert(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + convert(num % 10000000) : "");
  }
  const rupees = Math.floor(n);
  return convert(rupees) + " Rupees";
}

interface VersionEntry {
  version: string;
  timestamp: string;
  label: string;
}

// ─── Invoice Print Preview ────────────────────────────────────────────────────

interface PreviewProps {
  sr: SalesReturn;
}

function SRInvoicePreview({ sr }: PreviewProps) {
  const items = sr.billItems || [];
  const subtotal = items.reduce((s, i) => s + calcItemAmount(i), 0);
  const totalTax = items.reduce((s, i) => {
    const base = calcItemAmount(i);
    return s + base * (i.taxRate / 100);
  }, 0);
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const grandTotal = subtotal + totalTax + (sr.autoRoundOff ? sr.roundOffAmt : 0);
  const balance = grandTotal - sr.amountPaid;

  // Active invoice template from localStorage (InvoiceBuilder)
  let bgUrl = "";
  let themeColor = "#374151";
  try {
    const tpl = JSON.parse(localStorage.getItem("activeInvoiceTemplate") || "{}");
    bgUrl = tpl?.ts?.backgroundUrl || "";
    themeColor = tpl?.style?.themeColor || "#374151";
  } catch {}

  // HSN tax summary
  const hsnMap: Record<string, { taxable: number; cgst: number; sgst: number }> = {};
  items.forEach(item => {
    const hsn = item.hsn || "-";
    const base = calcItemAmount(item);
    const tax = base * (item.taxRate / 100);
    if (!hsnMap[hsn]) hsnMap[hsn] = { taxable: 0, cgst: 0, sgst: 0 };
    hsnMap[hsn].taxable += base;
    hsnMap[hsn].cgst += tax / 2;
    hsnMap[hsn].sgst += tax / 2;
  });

  // Business info from localStorage
  let bizName = "Your Business";
  let bizAddress = "";
  let bizPhone = "";
  let bizEmail = "";
  let bizLogo = "";
  try {
    const biz = JSON.parse(localStorage.getItem("businessInfo") || "{}");
    bizName = biz.companyName || bizName;
    bizAddress = [biz.address, biz.city, biz.state, biz.pincode].filter(Boolean).join(", ");
    bizPhone = biz.phone || "";
    bizEmail = biz.email || "";
    bizLogo = biz.logoUrl || "";
  } catch {}

  return (
    <div className="srvm-preview" id="sr-print-area">
      {bgUrl && (
        <div
          className="srvm-preview-bg"
          style={{ backgroundImage: `url(${bgUrl})` }}
        />
      )}
      <div className="srvm-preview-inner">

        {/* Header */}
        <div className="srvm-ph-title">SALES RETURN</div>
        <div className="srvm-ph-grid">
          <div className="srvm-ph-biz">
            {bizLogo && <img src={bizLogo} alt="logo" className="srvm-ph-logo" />}
            <div className="srvm-ph-biz-info">
              <div className="srvm-ph-biz-name" style={{ color: themeColor }}>{bizName}</div>
              {bizAddress && <div className="srvm-ph-biz-addr">{bizAddress}</div>}
              {bizPhone && <div className="srvm-ph-biz-addr">Mobile: {bizPhone}</div>}
              {bizEmail && <div className="srvm-ph-biz-addr">Email: {bizEmail}</div>}
            </div>
          </div>
          <div className="srvm-ph-meta">
            <div className="srvm-ph-meta-item">
              <div className="srvm-ph-meta-label">Return No.</div>
              <div className="srvm-ph-meta-value">{sr.salesReturnNo}</div>
            </div>
            <div className="srvm-ph-meta-item">
              <div className="srvm-ph-meta-label">Return Date</div>
              <div className="srvm-ph-meta-value">{fmtDate(sr.salesReturnDate)}</div>
            </div>
          </div>
        </div>

        {/* Party */}
        {sr.party && (
          <div className="srvm-party-box">
            <div className="srvm-party-label">PARTY NAME</div>
            <div className="srvm-party-name">{sr.party.name}</div>
            {sr.party.billingAddress && (
              <div className="srvm-party-addr">Address: {sr.party.billingAddress}</div>
            )}
            {sr.party.mobile && (
              <div className="srvm-party-addr">Mobile: {sr.party.mobile}</div>
            )}
          </div>
        )}

        {/* Items Table */}
        <table className="srvm-table">
          <thead>
            <tr style={{ background: themeColor }}>
              <th>S.NO.</th>
              <th>ITEMS</th>
              <th>HSN</th>
              <th>QTY.</th>
              <th>RATE</th>
              <th>TAX</th>
              <th>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={7} className="srvm-table-empty">No items</td></tr>
            )}
            {items.map((item, i) => {
              const base = calcItemAmount(item);
              const tax = base * (item.taxRate / 100);
              return (
                <tr key={item.rowId} className={i % 2 === 0 ? "srvm-tr-even" : ""}>
                  <td className="srvm-td-center">{i + 1}</td>
                  <td>{item.name}</td>
                  <td className="srvm-td-center">{item.hsn || "-"}</td>
                  <td className="srvm-td-center">{item.qty} {item.unit}</td>
                  <td className="srvm-td-right">{item.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  <td className="srvm-td-right">
                    {tax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    <div className="srvm-tax-pct">({item.taxRate}%)</div>
                  </td>
                  <td className="srvm-td-right">{base.toLocaleString("en-IN", { minimumFractionDigits: 0 })}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="srvm-tfoot-total">
              <td colSpan={2} className="srvm-tfoot-label">TOTAL</td>
              <td />
              <td className="srvm-td-center">{totalQty}</td>
              <td />
              <td className="srvm-td-right">₹ {totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              <td className="srvm-td-right">₹ {grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 0 })}</td>
            </tr>
            <tr className="srvm-tfoot-paid">
              <td colSpan={2} className="srvm-tfoot-label">PAID AMOUNT</td>
              <td colSpan={4} />
              <td className="srvm-td-right">₹ {sr.amountPaid.toLocaleString("en-IN", { minimumFractionDigits: 0 })}</td>
            </tr>
          </tfoot>
        </table>

        {/* HSN Summary */}
        {Object.keys(hsnMap).length > 0 && (
          <table className="srvm-hsn-table">
            <thead>
              <tr>
                <th>HSN/SAC</th>
                <th>Taxable Value</th>
                <th colSpan={2} className="srvm-td-center">CGST</th>
                <th colSpan={2} className="srvm-td-center">SGST</th>
                <th>Total Tax Amount</th>
              </tr>
              <tr className="srvm-hsn-subheader">
                <th /><th />
                <th>Rate</th><th>Amount</th>
                <th>Rate</th><th>Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {Object.entries(hsnMap).map(([hsn, { taxable, cgst, sgst }]) => (
                <tr key={hsn}>
                  <td>{hsn}</td>
                  <td>{taxable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  <td className="srvm-td-center">9%</td>
                  <td>{cgst.toLocaleString("en-IN", { minimumFractionDigits: 1 })}</td>
                  <td className="srvm-td-center">9%</td>
                  <td>{sgst.toLocaleString("en-IN", { minimumFractionDigits: 1 })}</td>
                  <td className="srvm-hsn-total">₹ {(cgst + sgst).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Amount in Words */}
        <div className="srvm-words-box">
          <div className="srvm-words-label">Total Amount (in words)</div>
          <div className="srvm-words-value">{numToWords(Math.round(grandTotal))}</div>
        </div>

        {/* Terms */}
        {sr.termsConditions && (
          <div className="srvm-terms-box">
            <div className="srvm-terms-label">Terms and Conditions</div>
            <div className="srvm-terms-text">{sr.termsConditions}</div>
          </div>
        )}

        {/* Footer sig */}
        <div className="srvm-sig-row">
          <div />
          <div className="srvm-sig-col">
            <div className="srvm-sig-label">Authorised Signatory For</div>
            <div className="srvm-sig-name" style={{ color: themeColor }}>{bizName}</div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

function DeleteModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="srvm-overlay" onClick={onCancel}>
      <div className="srvm-delete-modal" onClick={e => e.stopPropagation()}>
        <div className="srvm-delete-title">Are you sure you want to delete this Sales Return?</div>
        <div className="srvm-delete-sub">Once deleted, it cannot be recovered</div>
        <div className="srvm-delete-actions">
          <button className="srvm-del-cancel" onClick={onCancel}>Cancel</button>
          <button className="srvm-del-confirm" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Three-dot Menu ───────────────────────────────────────────────────────────

function ActionsMenu({
  onEdit,
  onEditHistory,
  onDuplicate,
  onDelete,
  onClose,
}: {
  onEdit: () => void;
  onEditHistory: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div className="srvm-actions-menu" ref={ref}>
      <button className="srvm-menu-item" onClick={onEdit}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Edit
      </button>
      <button className="srvm-menu-item" onClick={onEditHistory}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
        </svg>
        Edit History
      </button>
      <button className="srvm-menu-item srvm-menu-item--disabled" disabled>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        Duplicate
      </button>
      <div className="srvm-menu-divider" />
      <button className="srvm-menu-item srvm-menu-item--delete" onClick={onDelete}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/>
          <path d="M9 6V4h6v2"/>
        </svg>
        Delete
      </button>
    </div>
  );
}

// ─── Main View Model ──────────────────────────────────────────────────────────

export default function SalesReturnViewModel() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sr, setSr] = useState<SalesReturn | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Version history — stored per SR in localStorage
  const [versions, setVersions] = useState<VersionEntry[]>([]);

  useEffect(() => {
    const all = getSalesReturns();
    const found = all.find(x => x.id === id);
    setSr(found || null);

    // Load or seed version history
    const vKey = `sr-versions-${id}`;
    try {
      const raw = localStorage.getItem(vKey);
      if (raw) {
        setVersions(JSON.parse(raw));
      } else if (found) {
        const initial: VersionEntry[] = [{
          version: "1.0",
          timestamp: found.salesReturnDate,
          label: "Created By",
        }];
        localStorage.setItem(vKey, JSON.stringify(initial));
        setVersions(initial);
      }
    } catch {
      setVersions([]);
    }
  }, [id]);

  const handleDelete = () => {
    const all = getSalesReturns().filter(x => x.id !== id);
    localStorage.setItem("salesReturns", JSON.stringify(all));
    navigate("/cashier/sales-return");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print(); // In production, use html2pdf or similar
  };

  if (!sr) {
    return (
      <div className="srvm-not-found">
        <div className="srvm-nf-icon">📄</div>
        <div className="srvm-nf-title">Sales Return not found</div>
        <button className="srvm-nf-back" onClick={() => navigate("/cashier/sales-return")}>
          ← Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="srvm-root">
      {/* ── Top Bar ── */}
      <div className="srvm-topbar">
        <div className="srvm-topbar-left">
          <button className="srvm-back-btn" onClick={() => navigate("/cashier/sales-return")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Sales Return #{sr.salesReturnNo}
          </button>
          <span className={`srvm-status-badge srvm-status--${sr.status.toLowerCase().replace(" ", "-")}`}>
            {sr.status}
          </span>
        </div>
        <div className="srvm-topbar-right">
          <button className="srvm-action-btn" onClick={handleDownloadPDF}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download PDF
          </button>
          <button className="srvm-action-btn" onClick={handlePrint}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print PDF
          </button>
          <button className="srvm-action-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share
          </button>

          {/* 3-dot menu */}
          <div style={{ position: "relative" }}>
            <button
              className={`srvm-dots-btn${showMenu ? " active" : ""}`}
              onClick={() => setShowMenu(v => !v)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
              </svg>
            </button>
            {showMenu && (
              <ActionsMenu
                onEdit={() => { setShowMenu(false); navigate(`/cashier/sales-return-edit/${sr.id}`); }}
                onEditHistory={() => setShowMenu(false)}
                onDuplicate={() => setShowMenu(false)}
                onDelete={() => { setShowMenu(false); setShowDelete(true); }}
                onClose={() => setShowMenu(false)}
              />
            )}
          </div>

          {/* Fullscreen toggle */}
          <button className="srvm-action-btn srvm-action-btn--icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
              <path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="srvm-body">

        {/* Invoice Preview */}
        <div className="srvm-preview-wrap" ref={printRef}>
          <SRInvoicePreview sr={sr} />
        </div>

        {/* Version History Sidebar */}
        <div className="srvm-sidebar">
          <div className="srvm-sidebar-title">Version History</div>
          <div className="srvm-version-list">
            {versions.map((v, i) => (
              <div key={i} className={`srvm-version-item${i === 0 ? " srvm-version-item--active" : ""}`}>
                <div className="srvm-version-badge">{v.version}</div>
                <div className="srvm-version-info">
                  <div className="srvm-version-ts">{fmtDate(v.timestamp)}</div>
                  <div className="srvm-version-label">{v.label}</div>
                </div>
                {i === 0 && (
                  <div className="srvm-version-dot-active">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <circle cx="5" cy="5" r="5" fill="#4f46e5"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation ── */}
      {showDelete && (
        <DeleteModal
          onCancel={() => setShowDelete(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}