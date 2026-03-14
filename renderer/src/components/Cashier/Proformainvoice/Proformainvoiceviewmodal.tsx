import React, { useState, useRef, useEffect } from "react";
import "./Proformainvoiceviewmodal.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FullInvoiceData {
  party: any | null;
  invoiceDate: string;
  paymentTerms: number | "";
  expiryDate: string;
  showPaymentTerms: boolean;
  eWayBill: string;
  challanNo: string;
  financedBy: string;
  salesman: string;
  emailId: string;
  warrantyPeriod: string;
  lineItems: any[];
  notes: string;
  terms: string;
  showNotes: boolean;
  showTerms: boolean;
  charges: any[];
  showCharges: boolean;
  discountType: "Discount After Tax" | "Discount Before Tax";
  discountPct: number;
  discountAmt: number;
  showDiscount: boolean;
  adjustType: "+ Add" | "- Reduce";
  adjustAmt: number;
  autoRound: boolean;
  totalAmount: number;
}

interface ProformaInvoice {
  id: number;
  date: string;
  proformaNumber: number;
  partyName: string;
  dueIn: string;
  amount: number;
  status: "Open" | "Closed";
  fullData?: FullInvoiceData;
}

interface InvoiceTemplate {
  style?: {
    themeColor?: string;
    font?: string;
    textSize?: string;
    borderColor?: string;
    borderWidth?: string;
    showLogo?: boolean;
    logoUrl?: string;
  };
  vis?: {
    companyName?: boolean;
    address?: boolean;
    gstin?: boolean;
    phone?: boolean;
    email?: boolean;
    pan?: boolean;
  };
  misc?: {
    showNotes?: boolean;
    amountWords?: boolean;
    showTerms?: boolean;
    signatureUrl?: string;
  };
  inv?: {
    companyName?: string;
    address?: string;
    gstin?: string;
    phone?: string;
    email?: string;
    terms?: string;
    notes?: string;
    bank?: string;
    ifsc?: string;
  };
}

interface Props {
  invoice: ProformaInvoice;
  onClose: () => void;
  onEdit: (invoice: ProformaInvoice) => void;
  onDuplicate: (invoice: ProformaInvoice) => void;
  onDelete: (id: number) => void;
  onConvertToInvoice: (invoice: ProformaInvoice) => void;
  prefix?: string;
  prefixEnabled?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function numberToWords(n: number): string {
  if (n === 0) return "Zero";
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
    "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  function helper(num: number): string {
    if (num === 0) return "";
    if (num < 20) return ones[num] + " ";
    if (num < 100) return tens[Math.floor(num/10)] + " " + ones[num%10] + " ";
    if (num < 1000) return ones[Math.floor(num/100)] + " Hundred " + helper(num%100);
    if (num < 100000) return helper(Math.floor(num/1000)) + "Thousand " + helper(num%1000);
    if (num < 10000000) return helper(Math.floor(num/100000)) + "Lakh " + helper(num%100000);
    return helper(Math.floor(num/10000000)) + "Crore " + helper(num%10000000);
  }
  const intPart = Math.floor(Math.abs(n));
  const result = helper(intPart).trim();
  return result + " Rupees Only";
}

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
  } catch { return d; }
}

function fmtDateShort(d: string) {
  try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }); }
  catch { return d; }
}

function loadTemplate(): InvoiceTemplate | null {
  try { return JSON.parse(localStorage.getItem("activeInvoiceTemplate") || "null"); }
  catch { return null; }
}

// Default business details (fallback)
const DEFAULT_BUSINESS = {
  companyName: "scratchweb.solutions",
  address: "WEST SHANTINAGAR ANANDNAGAR BALLY HOWRAH SAREE HOUSE, HOWRAH, 711227",
  phone: "06289909521",
  email: "rakeshranjantiwari11@gmail.com",
  gstin: "19AABCM1234R1ZX",
  terms: "1. Goods once sold will not be taken back or exchanged\n2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only",
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const IconPrint = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
);

const IconShare = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const IconDots = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
  </svg>
);

const IconChat = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const IconBack = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const IconHistory = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
    <polyline points="12 7 12 12 15 14"/>
  </svg>
);

const IconDuplicate = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ProformaInvoiceViewModal: React.FC<Props> = ({
  invoice, onClose, onEdit, onDuplicate, onDelete, onConvertToInvoice,
  prefix = "", prefixEnabled = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load active template from InvoiceBuilder
  const template = loadTemplate();

  const tc = template?.style?.themeColor || "#3b5bdb";
  const font = template?.style?.font || "Inter, sans-serif";
  const borderColor = template?.style?.borderColor || "#dee2e6";
  const showLogo = template?.style?.showLogo || false;
  const logoUrl = template?.style?.logoUrl || "";

  // Business info from template or defaults
  const business = {
    companyName: template?.inv?.companyName || DEFAULT_BUSINESS.companyName,
    address: template?.inv?.address || DEFAULT_BUSINESS.address,
    phone: template?.inv?.phone || DEFAULT_BUSINESS.phone,
    email: template?.inv?.email || DEFAULT_BUSINESS.email,
    gstin: template?.inv?.gstin || DEFAULT_BUSINESS.gstin,
    bank: template?.inv?.bank || "SBI - 1234567890",
    ifsc: template?.inv?.ifsc || "SBIN0001234",
    terms: template?.inv?.terms || DEFAULT_BUSINESS.terms,
    notes: template?.inv?.notes || "",
  };

  // Visibility from template
  const vis = {
    companyName: template?.vis?.companyName !== false,
    address: template?.vis?.address !== false,
    gstin: template?.vis?.gstin !== false,
    phone: template?.vis?.phone !== false,
    email: template?.vis?.email !== false,
  };

  const misc = {
    showTerms: template?.misc?.showTerms !== false,
    showNotes: template?.misc?.showNotes ?? false,
    amountWords: template?.misc?.amountWords !== false,
    signatureUrl: template?.misc?.signatureUrl || "",
  };

  const fd = invoice.fullData;

  // Compute totals from line items
  const lineItems: any[] = fd?.lineItems || [];
  const subtotal = lineItems.reduce((s: number, li: any) => s + (li.amount || 0), 0);
  const totalTax = lineItems.reduce((s: number, li: any) => {
    const base = (li.price || 0) * (li.qty || 0) - (li.discountAmt || 0);
    return s + base * ((li.taxRate || 0) / 100);
  }, 0);

  const chargesTotal = (fd?.charges || []).reduce((s: number, c: any) => s + (Number(c.amount) || 0), 0);
  const discountVal = fd?.showDiscount ? ((fd?.discountAmt || 0) + subtotal * (fd?.discountPct || 0) / 100) : 0;
  const adjustVal = fd?.adjustAmt
    ? (fd.adjustType === "+ Add" ? fd.adjustAmt : -fd.adjustAmt)
    : 0;
  const grandTotal = subtotal + totalTax + chargesTotal - discountVal + adjustVal;

  const proformaDisplay = prefixEnabled ? `${prefix}${invoice.proformaNumber}` : String(invoice.proformaNumber);

  // Close menu on outside click
  useEffect(() => {
    function h(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Group items by HSN for tax summary
  interface HsnGroup { taxable: number; cgst: number; sgst: number; }
  const hsnGroups: Record<string, HsnGroup> = {};
  lineItems.forEach((li: any) => {
    const hsn = li.item?.hsn || li.hsn || "-";
    if (!hsnGroups[hsn]) hsnGroups[hsn] = { taxable: 0, cgst: 0, sgst: 0 };
    const base = (li.amount || 0);
    const rate = li.taxRate ?? li.item?.taxRate ?? 0;
    const taxHalf = base * (rate / 100) / 2;
    hsnGroups[hsn].taxable += base;
    hsnGroups[hsn].cgst += taxHalf;
    hsnGroups[hsn].sgst += taxHalf;
  });

  function handlePrint() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const content = document.getElementById("pfi-print-area")?.innerHTML || "";
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Proforma Invoice #${proformaDisplay}</title>
      <style>
        body { font-family: ${font}; font-size: 12px; margin: 0; padding: 20px; color: #333; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid ${borderColor}; padding: 6px 8px; font-size: 11px; }
        th { background: ${tc}; color: #fff; }
        .pfi-biz-name { color: ${tc}; font-size: 15px; font-weight: 700; }
        .pfi-section-title { font-weight: 700; font-size: 11px; background: #f5f5f5; padding: 4px 8px; }
        @media print { body { padding: 0; } }
      </style></head><body>${content}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  }

  return (
    <div className="aa-pfi-overlay" onClick={onClose}>
      <div className="aa-pfi-modal" onClick={e => e.stopPropagation()}>

        {/* ── Top Bar ── */}
        <div className="aa-pfi-topbar">
          <div className="aa-pfi-topbar-left">
            <button className="aa-pfi-back-btn" onClick={onClose} title="Back">
              <IconBack />
            </button>
            <span className="aa-pfi-title">
              Proforma Invoice #{proformaDisplay}
            </span>
            <span className={`aa-pfi-status-badge pfi-status--${invoice.status.toLowerCase()}`}>
              {invoice.status}
            </span>
          </div>

          <div className="aa-pfi-topbar-right">
            {/* 3-dot menu */}
            <div className="aa-pfi-menu-wrap" ref={menuRef}>
              <button
                className={`aa-pfi-dot-btn${showMenu ? " active" : ""}`}
                onClick={e => { e.stopPropagation(); setShowMenu(s => !s); }}
                title="More options"
              >
                <IconDots />
              </button>
              {showMenu && (
                <div className="aa-pfi-dropdown">
                  <button className="aa-pfi-drop-item" onClick={() => { setShowMenu(false); onEdit(invoice); }}>
                    <span className="aa-pfi-drop-icon"><IconEdit /></span>
                    Edit
                  </button>
                  <button className="aa-pfi-drop-item" onClick={() => { setShowMenu(false); setShowHistoryModal(true); }}>
                    <span className="aa-pfi-drop-icon"><IconHistory /></span>
                    Edit History
                  </button>
                  <button className="aa-pfi-drop-item" onClick={() => { setShowMenu(false); onDuplicate(invoice); }}>
                    <span className="aa-pfi-drop-icon"><IconDuplicate /></span>
                    Duplicate
                  </button>
                  <div className="aa-pfi-drop-sep" />
                  <button className="aa-pfi-drop-item pfi-drop-item--danger" onClick={() => { setShowMenu(false); setShowDeleteConfirm(true); }}>
                    <span className="aa-pfi-drop-icon"><IconTrash /></span>
                    Delete
                  </button>
                </div>
              )}
            </div>

            <button className="aa-pfi-chat-btn" title="Chat">
              <IconChat />
            </button>
          </div>
        </div>

        {/* ── Action Bar ── */}
        <div className="aa-pfi-actionbar">
          <div className="aa-pfi-actionbar-left">
            <button className="aa-pfi-action-btn" onClick={handlePrint}>
              <IconDownload />
              <span>Download PDF</span>
              <span className="aa-pfi-action-chevron">▾</span>
            </button>
            <button className="aa-pfi-action-btn" onClick={handlePrint}>
              <IconPrint />
              <span>Print PDF</span>
              <span className="aa-pfi-action-chevron">▾</span>
            </button>
            <button className="aa-pfi-action-btn pfi-action-btn--round">
              <IconShare />
            </button>
            <button className="aa-pfi-action-btn pfi-action-btn--round">
              {/* clock / reminder icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </button>
            <button className="aa-pfi-action-btn pfi-action-btn--share">
              <IconShare />
              <span>Share</span>
              <span className="aa-pfi-action-chevron">▾</span>
            </button>
          </div>

          <button
            className="aa-pfi-convert-btn"
            onClick={() => onConvertToInvoice(invoice)}
            disabled={invoice.status === "Closed"}
          >
            Convert to Invoice
          </button>
        </div>

        {/* ── Invoice Content Area ── */}
        <div className="aa-pfi-content-wrap">
          <div className="aa-pfi-paper" id="pfi-print-area" style={{ fontFamily: font }}>

            {/* Company Header */}
            <div className="aa-pfi-paper-header" style={{ borderBottom: `2px solid ${tc}` }}>
              <div className="aa-pfi-biz-left">
                {showLogo && logoUrl && (
                  <img src={logoUrl} alt="Logo" className="aa-pfi-logo" />
                )}
                {!showLogo && (
                  <div className="aa-pfi-logo-placeholder" style={{ borderColor: tc }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={tc} strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <path d="M9 9h6M9 12h6M9 15h4"/>
                    </svg>
                  </div>
                )}
                <div className="aa-pfi-biz-info">
                  {vis.companyName && (
                    <div className="aa-pfi-biz-name" style={{ color: tc }}>{business.companyName}</div>
                  )}
                  {vis.address && (
                    <div className="aa-pfi-biz-addr">{business.address}</div>
                  )}
                  <div className="aa-pfi-biz-contact">
                    {vis.phone && <span>Mobile: {business.phone}</span>}
                    {vis.email && <span>Email: {business.email}</span>}
                  </div>
                </div>
              </div>

              <div className="aa-pfi-inv-meta">
                <div className="aa-pfi-inv-meta-row">
                  <span className="aa-pfi-inv-meta-label">Proforma Invoice No.</span>
                  <span className="aa-pfi-inv-meta-val">{proformaDisplay}</span>
                </div>
                <div className="aa-pfi-inv-meta-row">
                  <span className="aa-pfi-inv-meta-label">Proforma Date</span>
                  <span className="aa-pfi-inv-meta-val" style={{ fontSize: 11 }}>
                    {fmtDate(fd?.invoiceDate || invoice.date)}
                  </span>
                </div>
              </div>
            </div>

            {/* PROFORMA INVOICE title */}
            <div className="aa-pfi-doc-title" style={{ color: tc }}>PROFORMA INVOICE</div>

            {/* Bill To */}
            <div className="aa-pfi-bill-section" style={{ borderBottom: `1px solid ${borderColor}` }}>
              <div className="aa-pfi-bill-label">BILL TO</div>
              <div className="aa-pfi-bill-name">
                {fd?.party?.name || invoice.partyName || "Cash Sale"}
              </div>
              {fd?.party?.mobile && (
                <div className="aa-pfi-bill-contact">Mobile &nbsp; {fd.party.mobile}</div>
              )}
              {fd?.party?.billingAddress && (
                <div className="aa-pfi-bill-addr">{fd.party.billingAddress}</div>
              )}
            </div>

            {/* Items Table */}
            <table className="aa-pfi-items-table">
              <thead>
                <tr style={{ background: tc, color: "#fff" }}>
                  <th className="aa-pfi-th pfi-th--sno">S.NO.</th>
                  <th className="aa-pfi-th pfi-th--services">SERVICES</th>
                  <th className="aa-pfi-th pfi-th--qty">QTY.</th>
                  <th className="aa-pfi-th pfi-th--rate">RATE</th>
                  <th className="aa-pfi-th pfi-th--tax">TAX</th>
                  <th className="aa-pfi-th pfi-th--amount">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.length > 0 ? lineItems.map((li: any, idx: number) => (
                  <tr key={idx} className={idx % 2 === 0 ? "aa-pfi-tr-even" : "aa-pfi-tr-odd"}>
                    <td className="aa-pfi-td pfi-td--sno">{idx + 1}</td>
                    <td className="aa-pfi-td pfi-td--services">
                      {li.item?.name || li.name || li.itemName || "Item"}
                    </td>
                    <td className="aa-pfi-td pfi-td--qty">{li.qty || 1} {li.unit || li.item?.unit || "PCS"}</td>
                    <td className="aa-pfi-td pfi-td--rate">{li.pricePerItem || li.price || li.rate || 0}</td>
                    <td className="aa-pfi-td pfi-td--tax">
                      {li.taxRate ?? li.item?.taxRate ?? 0}<br/>
                      <span className="aa-pfi-tax-pct">({li.taxRate ?? li.item?.taxRate ?? 0}%)</span>
                    </td>
                    <td className="aa-pfi-td pfi-td--amount">{li.amount || 0}</td>
                  </tr>
                )) : (
                  // Empty rows to stretch table (matching screenshot)
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className={i % 2 === 0 ? "aa-pfi-tr-even" : "aa-pfi-tr-odd"}>
                      <td className="aa-pfi-td pfi-td--sno">&nbsp;</td>
                      <td className="aa-pfi-td pfi-td--services">&nbsp;</td>
                      <td className="aa-pfi-td pfi-td--qty">&nbsp;</td>
                      <td className="aa-pfi-td pfi-td--rate">&nbsp;</td>
                      <td className="aa-pfi-td pfi-td--tax">&nbsp;</td>
                      <td className="aa-pfi-td pfi-td--amount">&nbsp;</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="aa-pfi-tfoot-total">
                  <td colSpan={2} className="aa-pfi-td pfi-tfoot-label">TOTAL</td>
                  <td className="aa-pfi-td pfi-td--qty">
                    {lineItems.reduce((s: number, li: any) => s + (Number(li.qty) || 0), 0)}
                  </td>
                  <td className="aa-pfi-td pfi-td--rate"></td>
                  <td className="aa-pfi-td pfi-td--tax">₹ {totalTax.toFixed(0)}</td>
                  <td className="aa-pfi-td pfi-td--amount">₹ {subtotal.toFixed(0)}</td>
                </tr>
              </tfoot>
            </table>

            {/* HSN Tax Summary */}
            <table className="aa-pfi-hsn-table">
              <thead>
                <tr style={{ background: "#f5f5f0" }}>
                  <th className="aa-pfi-hsn-th">HSN/SAC</th>
                  <th className="aa-pfi-hsn-th">Taxable Value</th>
                  <th className="aa-pfi-hsn-th pfi-hsn-th--group" colSpan={2}>
                    CGST
                    <div className="aa-pfi-hsn-subrow">
                      <span>Rate</span><span>Amount</span>
                    </div>
                  </th>
                  <th className="aa-pfi-hsn-th pfi-hsn-th--group" colSpan={2}>
                    SGST
                    <div className="aa-pfi-hsn-subrow">
                      <span>Rate</span><span>Amount</span>
                    </div>
                  </th>
                  <th className="aa-pfi-hsn-th">Total Tax Amount</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(hsnGroups).length > 0 ? Object.entries(hsnGroups).map(([hsn, g], i) => (
                  <tr key={i}>
                    <td className="aa-pfi-hsn-td">{hsn}</td>
                    <td className="aa-pfi-hsn-td">{g.taxable.toFixed(0)}</td>
                    <td className="aa-pfi-hsn-td">0%</td>
                    <td className="aa-pfi-hsn-td">{g.cgst.toFixed(0)}</td>
                    <td className="aa-pfi-hsn-td">0%</td>
                    <td className="aa-pfi-hsn-td">{g.sgst.toFixed(0)}</td>
                    <td className="aa-pfi-hsn-td">₹ {(g.cgst + g.sgst).toFixed(0)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td className="aa-pfi-hsn-td">-</td>
                    <td className="aa-pfi-hsn-td">{subtotal.toFixed(0)}</td>
                    <td className="aa-pfi-hsn-td">0%</td>
                    <td className="aa-pfi-hsn-td">0</td>
                    <td className="aa-pfi-hsn-td">0%</td>
                    <td className="aa-pfi-hsn-td">0</td>
                    <td className="aa-pfi-hsn-td">₹ 0</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Amount in Words */}
            {misc.amountWords && (
              <div className="aa-pfi-words-box" style={{ border: `1px solid ${borderColor}` }}>
                <div className="aa-pfi-words-label">Total Amount (in words)</div>
                <div className="aa-pfi-words-val">{numberToWords(Math.round(grandTotal))}</div>
              </div>
            )}

            {/* Terms & Conditions + Signature */}
            {misc.showTerms && (
              <div className="aa-pfi-terms-row" style={{ border: `1px solid ${borderColor}` }}>
                <div className="aa-pfi-terms-left">
                  <div className="aa-pfi-terms-title">Terms and Conditions</div>
                  <div className="aa-pfi-terms-text">
                    {(fd?.terms || business.terms).split("\n").map((line: string, i: number) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </div>
                <div className="aa-pfi-sig-box">
                  {misc.signatureUrl && (
                    <img src={misc.signatureUrl} alt="Signature" className="aa-pfi-sig-img" />
                  )}
                  <div className="aa-pfi-sig-label">
                    Authorised Signatory For<br />
                    <strong>{business.companyName}</strong>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Edit History Modal ── */}
      {showHistoryModal && (
        <div className="aa-pfi-inner-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="aa-pfi-inner-modal" onClick={e => e.stopPropagation()}>
            <div className="aa-pfi-inner-header">
              <span>Edit History</span>
              <button onClick={() => setShowHistoryModal(false)}>✕</button>
            </div>
            <div className="aa-pfi-inner-body">
              <div className="aa-pfi-hist-item">
                <span className="aa-pfi-hist-dot" />
                <div>
                  <div className="aa-pfi-hist-action">Invoice Created</div>
                  <div className="aa-pfi-hist-time">{fmtDateShort(invoice.date)}, System</div>
                </div>
              </div>
              <div className="aa-pfi-hist-item">
                <span className="aa-pfi-hist-dot" />
                <div>
                  <div className="aa-pfi-hist-action">Invoice Viewed</div>
                  <div className="aa-pfi-hist-time">{fmtDateShort(new Date().toISOString())}, System</div>
                </div>
              </div>
            </div>
            <div className="aa-pfi-inner-footer">
              <button className="aa-pfi-btn-primary" onClick={() => setShowHistoryModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {showDeleteConfirm && (
        <div className="aa-pfi-inner-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="aa-pfi-inner-modal" onClick={e => e.stopPropagation()}>
            <div className="aa-pfi-inner-header">
              <span>Delete Invoice</span>
              <button onClick={() => setShowDeleteConfirm(false)}>✕</button>
            </div>
            <div className="aa-pfi-inner-body">
              <p style={{ fontSize: 14, color: "#374151" }}>
                Are you sure you want to delete Proforma Invoice #{proformaDisplay}? This action cannot be undone.
              </p>
            </div>
            <div className="aa-pfi-inner-footer">
              <button className="aa-pfi-btn-cancel" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="aa-pfi-btn-danger" onClick={() => { onDelete(invoice.id); setShowDeleteConfirm(false); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProformaInvoiceViewModal;