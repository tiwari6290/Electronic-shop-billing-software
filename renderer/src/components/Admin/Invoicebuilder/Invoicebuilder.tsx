import React, { useState } from "react";
import "./InvoiceBuilder.css";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type View = "home" | "builder";

interface SavedTemplate {
  id: string;
  name: string;
  themeColor: string;
  createdAt: string;
  inv: InvoiceData;
  style: StyleState;
  vis: BusinessVisibility;
  det: InvoiceDetailsState;
  pv: PartyVisibility;
  ts: TableSettings;
  misc: MiscState;
}

interface StyleState {
  font: string;
  textSize: string;
  themeColor: string;
  borderColor: string;
  borderWidth: string;
  showLogo: boolean;
  logoUrl: string;
}

interface PrintState {
  spacing: string;
  top: string;
  bottom: string;
  left: string;
  right: string;
  showHeader: boolean;
  showFooter: boolean;
  showWatermark: boolean;
  watermarkOpacity: number;
}

interface BusinessVisibility {
  companyName: boolean;
  slogan: boolean;
  address: boolean;
  gstin: boolean;
  phone: boolean;
  pan: boolean;
  email: boolean;
}

interface TableSettings {
  hsnSummary: boolean;
  showDesc: boolean;
  capitalize: boolean;
  stretch: boolean;
  quantityMode: string;
  cols: Record<string, boolean>;
  customCols: string[];
  backgroundUrl: string;
  backgroundOpacity: number;
}

interface MiscState {
  showNotes: boolean;
  amountWords: boolean;
  showTerms: boolean;
  receiverSig: boolean;
  signatureUrl: string;
}

interface InvoiceDetailsState {
  industryType: string;
  layout: string;
  showPO: boolean;
  showEwayBill: boolean;
  ewayBillNo: string;
  showVehicle: boolean;
  vehicleNo: string;
  customFields: { label: string; value: string }[];
}

interface PartyVisibility {
  billCompany: boolean;
  billAddress: boolean;
  billMobile: boolean;
  billGstin: boolean;
  shipCompany: boolean;
  shipAddress: boolean;
  shipMobile: boolean;
  shipGstin: boolean;
  billCustomFields: { label: string; value: string }[];
  shipCustomFields: { label: string; value: string }[];
}

interface InvoiceItem {
  id: number;
  name: string;
  desc: string;
  hsn: string;
  qty: string;
  mrp: number;
  rate: number;
  disc: number | null;
  amount: number;
}

interface InvoiceData {
  companyName: string;
  slogan: string;
  address: string;
  state: string;
  city: string;
  gstin: string;
  phone: string;
  email: string;
  pan: string;
  invoiceNo: string;
  date: string;
  dueDate: string;
  placeOfSupply: string;
  poNo: string;
  billTo: { name: string; address: string; mobile: string; gstin: string };
  shipTo: { name: string; address: string; mobile: string; gstin: string };
  items: InvoiceItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  bank: string;
  ifsc: string;
  notes: string;
  terms: string;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const THEME_PRESETS: Record<string, string> = {
  Classic: "#3b5bdb", Modern: "#2f9e44", Warm: "#e8590c", Forest: "#2b8a3e", Slate: "#495057",
};
const FONTS = ["Inter", "Arial", "Georgia", "Times New Roman", "Courier New", "Verdana", "Trebuchet MS"];
const TEXT_SIZES = ["12px", "13px", "14px", "15px", "16px"];
const TABLE_COLUMNS = ["Serial Number", "Item Name", "HSN", "MRP", "Quantity", "Rate/Item", "Discount", "Amount"];

const DEFAULT_INVOICE: InvoiceData = {
  companyName: "Mondal Electronic",
  slogan: "",
  address: "45 Electronics Market, College Street, Kolkata, West Bengal - 700073",
  state: "West Bengal", city: "Kolkata",
  gstin: "19AABCM1234R1ZX", phone: "+91 98765 43210",
  email: "billing@mondalelectronic.in", pan: "AABCM1234R",
  invoiceNo: "INV-2026-0042", date: "20 Feb 2026",
  dueDate: "22 Mar 2026", placeOfSupply: "West Bengal", poNo: "PO-7891",
  billTo: { name: "Beta Corp Pvt. Ltd.", address: "456 Trade Center, Delhi", mobile: "+91 91234 56789", gstin: "07AABCB1234R1Z5" },
  shipTo: { name: "Beta Corp Warehouse", address: "789 Industrial Area, Gurgaon", mobile: "+91 98000 11111", gstin: "06AABCB1234R1Z6" },
  items: [
    { id: 1, name: "Steel Rod 12mm TMT", desc: "High tensile steel rods", hsn: "7214", qty: "100 kg", mrp: 60, rate: 55, disc: 5, amount: 5495 },
    { id: 2, name: "Cement PPC 50kg", desc: "Portland pozzolana cement", hsn: "2523", qty: "20 bags", mrp: 400, rate: 380, disc: null, amount: 7600 },
    { id: 3, name: "River Sand Fine", desc: "Fine grade river sand", hsn: "2505", qty: "5 ton", mrp: 1200, rate: 1200, disc: 50, amount: 5950 },
  ],
  subtotal: 19045, cgst: 1714.05, sgst: 1714.05, grandTotal: 22473.10,
  bank: "SBI - 1234567890", ifsc: "SBIN0001234",
  notes: "Thank you for your business!",
  terms: "Goods once sold will not be taken back. Payment due within 30 days.",
};

const DEFAULT_STYLE: StyleState = {
  font: "Inter", textSize: "14px", themeColor: "#3b5bdb",
  borderColor: "#dee2e6", borderWidth: "1", showLogo: false, logoUrl: "",
};

const DEFAULT_PRINT: PrintState = {
  spacing: "Medium", top: "28", bottom: "20", left: "28", right: "28",
  showHeader: true, showFooter: true, showWatermark: false, watermarkOpacity: 10,
};

const DEFAULT_VIS: BusinessVisibility = {
  companyName: true, slogan: false, address: true,
  gstin: true, phone: true, pan: false, email: true,
};

const DEFAULT_DET: InvoiceDetailsState = {
  industryType: "General", layout: "Layout 1",
  showPO: true, showEwayBill: false, ewayBillNo: "",
  showVehicle: false, vehicleNo: "", customFields: [],
};

const DEFAULT_PV: PartyVisibility = {
  billCompany: true, billAddress: true, billMobile: true, billGstin: true,
  shipCompany: true, shipAddress: true, shipMobile: false, shipGstin: false,
  billCustomFields: [], shipCustomFields: [],
};

const DEFAULT_TS: TableSettings = {
  hsnSummary: false, showDesc: true, capitalize: false, stretch: true,
  quantityMode: "Total",
  cols: { "Serial Number": true, "Item Name": true, "HSN": true, "MRP": false, "Quantity": true, "Rate/Item": true, "Discount": true, "Amount": true },
  customCols: [],
  backgroundUrl: "",
  backgroundOpacity: 15,
};

const DEFAULT_MISC: MiscState = {
  showNotes: true,
  amountWords: true,
  showTerms: true,
  receiverSig: false,
  signatureUrl: "",
};

// ─── NAV SVG ICONS ───────────────────────────────────────────────────────────

const IconStyle: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r="2.5"/>
    <circle cx="6.5" cy="14.5" r="2.5"/>
    <circle cx="17.5" cy="16.5" r="2.5"/>
    <path d="M2 12a10 10 0 1 0 10-10"/>
  </svg>
);

const IconPrint: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
);

const IconBusiness: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    <line x1="12" y1="12" x2="12" y2="12"/>
    <path d="M12 12h.01"/>
    <path d="M2 12a20.3 20.3 0 0 0 20 0"/>
  </svg>
);

const IconInvoice: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const IconParty: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconItems: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M3 9h18"/>
    <path d="M3 15h18"/>
    <path d="M9 3v18"/>
  </svg>
);

const IconMisc: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
    <path d="m4.93 4.93 1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
  </svg>
);

const IconSave: React.FC = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);

const NAV_ICONS: Record<string, React.FC> = {
  style:    IconStyle,
  print:    IconPrint,
  business: IconBusiness,
  invoice:  IconInvoice,
  party:    IconParty,
  items:    IconItems,
  misc:     IconMisc,
};

const NAV_ITEMS = [
  { id: "style",    label: "Style Settings" },
  { id: "print",    label: "Print Settings" },
  { id: "business", label: "Business Details" },
  { id: "invoice",  label: "Invoice Details" },
  { id: "party",    label: "Party Details" },
  { id: "items",    label: "Item Table" },
  { id: "misc",     label: "Miscellaneous" },
] as const;

type NavId = (typeof NAV_ITEMS)[number]["id"];

// ─── HOME PAGE THEME DEFINITIONS ─────────────────────────────────────────────

interface HomeTheme {
  id: string;
  name: string;
  description: string;
  color: string;
  style: Partial<StyleState>;
}

const HOME_THEMES: HomeTheme[] = [
  {
    id: "modern-blue",
    name: "Modern Blue",
    description: "Clean professional look",
    color: "#3b5bdb",
    style: { themeColor: "#3b5bdb", font: "Inter", borderColor: "#dee2e6" },
  },
  {
    id: "classic-dark",
    name: "Classic Dark",
    description: "Bold authoritative style",
    color: "#1a1d23",
    style: { themeColor: "#1a1d23", font: "Georgia", borderColor: "#adb5bd" },
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean and understated",
    color: "#212529",
    style: { themeColor: "#212529", font: "Inter", borderColor: "#e9ecef" },
  },
  {
    id: "elegant-gold",
    name: "Elegant Gold",
    description: "Premium warm tones",
    color: "#c07000",
    style: { themeColor: "#c07000", font: "Georgia", borderColor: "#e9c46a" },
  },
];

// ─── SHARED UI ATOMS ──────────────────────────────────────────────────────────

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <button className={`toggle ${checked ? "on" : "off"}`} onClick={() => onChange(!checked)} type="button" aria-pressed={checked}>
    <span className="toggle-knob" />
  </button>
);

const SettingRow: React.FC<{
  label: string; checked?: boolean; onChange?: (v: boolean) => void; children?: React.ReactNode;
}> = ({ label, checked, onChange, children }) => (
  <div className="setting-row">
    <div className="setting-row-header">
      <span className="setting-row-label">{label}</span>
      {onChange !== undefined && checked !== undefined && <Toggle checked={checked} onChange={onChange} />}
    </div>
    {children}
  </div>
);

const SL: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="section-label">{children}</div>
);

const IBInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => (
  <input className="ib-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
);

const IBSelect: React.FC<{ value: string; onChange: (v: string) => void; options: string[] }> = ({ value, onChange, options }) => (
  <select className="ib-select" value={value} onChange={(e) => onChange(e.target.value)}>
    {options.map((o) => <option key={o}>{o}</option>)}
  </select>
);

// ─── SAVE DIALOG ─────────────────────────────────────────────────────────────

const SaveDialog: React.FC<{
  defaultName: string;
  themeColor: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}> = ({ defaultName, themeColor, onSave, onCancel }) => {
  const [name, setName] = useState(defaultName);
  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-title">Save Template</div>
        <div className="dialog-desc">Give your invoice template a name so you can find it later.</div>
        <IBInput value={name} onChange={setName} placeholder="e.g. Acme Standard Invoice" />
        <div className="dialog-actions">
          <button className="dialog-cancel" onClick={onCancel} type="button">Cancel</button>
          <button className="dialog-save" onClick={() => name.trim() && onSave(name.trim())} type="button">Save Template</button>
        </div>
      </div>
    </div>
  );
};

// ─── INVOICE PREVIEW (shared between home and builder) ───────────────────────

interface PreviewProps {
  inv: InvoiceData; style: StyleState; print: PrintState;
  ts: TableSettings; misc: MiscState; vis: BusinessVisibility;
  det: InvoiceDetailsState; pv: PartyVisibility;
}

const InvoicePreview: React.FC<PreviewProps> = ({ inv, style, print, ts, misc, vis, det, pv }) => {
  const tc = style.themeColor;
  const bw = `${style.borderWidth || 1}px solid ${style.borderColor}`;
  const showSerial = ts.cols["Serial Number"] !== false;
  const showHSN    = ts.cols["HSN"] !== false;
  const showMRP    = ts.cols["MRP"] !== false;
  const showQty    = ts.cols["Quantity"] !== false;
  const showRate   = ts.cols["Rate/Item"] !== false;
  const showDisc   = ts.cols["Discount"] !== false;
  const showAmt    = ts.cols["Amount"] !== false;
  const activeCols = ts.customCols.filter((c) => c.trim() !== "");

  const hsnGroups = inv.items.reduce<Record<string, { taxable: number; tax: number }>>((acc, item) => {
    if (!acc[item.hsn]) acc[item.hsn] = { taxable: 0, tax: 0 };
    acc[item.hsn].taxable += item.amount;
    acc[item.hsn].tax += item.amount * 0.09;
    return acc;
  }, {});

  return (
    <div
      className="invoice-preview"
      style={{
        fontFamily: style.font,
        fontSize: style.textSize,
        padding: `${print.top}px ${print.right}px ${print.bottom}px ${print.left}px`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {ts.backgroundUrl && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${ts.backgroundUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: ts.backgroundOpacity / 100,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
        {print.showHeader && (
          <div className="inv-header">
            {style.showLogo && style.logoUrl && <img src={style.logoUrl} alt="logo" className="inv-logo" />}
            <div style={{ flex: 1 }}>
              {vis.companyName && <p className="inv-company-name" style={{ color: tc }}>{inv.companyName}</p>}
              {vis.slogan && <p className="inv-slogan">{inv.slogan}</p>}
              {vis.address && <p className="inv-meta-small">{inv.address}</p>}
              <p className="inv-meta-small">
                {[vis.gstin && `GSTIN: ${inv.gstin}`, vis.phone && `Ph: ${inv.phone}`, vis.email && `Email: ${inv.email}`].filter(Boolean).join("  ")}
              </p>
              {vis.pan && <p className="inv-meta-small">PAN: {inv.pan}</p>}
            </div>
          </div>
        )}

        <hr className="inv-divider" style={{ borderColor: tc }} />
        <p className="inv-title" style={{ color: tc }}>TAX INVOICE</p>

        <div className="inv-info-grid">
          <span><b>Invoice No:</b> {inv.invoiceNo}</span>
          <span className="inv-info-right"><b>Due Date:</b> {inv.dueDate}</span>
          <span><b>Date:</b> {inv.date}</span>
          <span className="inv-info-right"><b>Place of Supply:</b> {inv.placeOfSupply}</span>
          {det.showPO && <span><b>PO No:</b> {inv.poNo}</span>}
          {det.showEwayBill && det.ewayBillNo && <span className="inv-info-right"><b>E-way Bill:</b> {det.ewayBillNo}</span>}
          {det.showVehicle && det.vehicleNo && <span><b>Vehicle No:</b> {det.vehicleNo}</span>}
          {det.customFields.map((f, i) => f.label && f.value && <span key={i}><b>{f.label}:</b> {f.value}</span>)}
        </div>

        <div className="inv-party-grid">
          <div className="inv-party-box" style={{ border: bw }}>
            <div className="inv-party-label" style={{ color: tc }}>BILL TO</div>
            {pv.billCompany  && <div className="inv-party-name">{inv.billTo.name}</div>}
            {pv.billAddress  && <div>{inv.billTo.address}</div>}
            {pv.billMobile   && <div>{inv.billTo.mobile}</div>}
            {pv.billGstin    && <div>GSTIN: {inv.billTo.gstin}</div>}
            {pv.billCustomFields.map((f, i) => f.label && <div key={i}><b>{f.label}:</b> {f.value}</div>)}
          </div>
          <div className="inv-party-box" style={{ border: bw }}>
            <div className="inv-party-label" style={{ color: tc }}>SHIP TO</div>
            {pv.shipCompany  && <div className="inv-party-name">{inv.shipTo.name}</div>}
            {pv.shipAddress  && <div>{inv.shipTo.address}</div>}
            {pv.shipMobile   && <div>{inv.shipTo.mobile}</div>}
            {pv.shipGstin    && <div>GSTIN: {inv.shipTo.gstin}</div>}
            {pv.shipCustomFields.map((f, i) => f.label && <div key={i}><b>{f.label}:</b> {f.value}</div>)}
          </div>
        </div>

        <table className="inv-table">
          <thead>
            <tr style={{ background: tc }}>
              {showSerial && <th>#</th>}
              <th>Item</th>
              {showHSN  && <th className="center">HSN</th>}
              {showMRP  && <th className="center">MRP</th>}
              {showQty  && <th className="center">Qty</th>}
              {showRate && <th className="center">Rate</th>}
              {showDisc && <th className="center">Disc</th>}
              {activeCols.map((col) => <th key={col} className="center">{col}</th>)}
              {showAmt  && <th className="right">Amount</th>}
            </tr>
          </thead>
          <tbody>
            {inv.items.map((item, i) => (
              <React.Fragment key={item.id}>
                <tr className={i % 2 === 0 ? "even" : "odd"}>
                  {showSerial && <td>{item.id}</td>}
                  <td>{ts.capitalize ? item.name.toUpperCase() : item.name}</td>
                  {showHSN  && <td className="center">{item.hsn}</td>}
                  {showMRP  && <td className="center">₹{item.mrp.toFixed(2)}</td>}
                  {showQty  && <td className="center">{item.qty}</td>}
                  {showRate && <td className="center">₹{item.rate.toFixed(2)}</td>}
                  {showDisc && <td className="center">{item.disc != null ? `₹${item.disc.toFixed(2)}` : "—"}</td>}
                  {activeCols.map((col) => <td key={col} className="center">—</td>)}
                  {showAmt  && <td className="right">₹{item.amount.toFixed(2)}</td>}
                </tr>
                {ts.showDesc && (
                  <tr className={`desc-row ${i % 2 === 0 ? "even" : "odd"}`}>
                    {showSerial && <td />}
                    <td colSpan={[showHSN, showMRP, showQty, showRate, showDisc, showAmt].filter(Boolean).length + activeCols.length}>{item.desc}</td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {ts.hsnSummary && (
          <div className="hsn-summary">
            <div className="hsn-summary-title" style={{ color: tc }}>HSN-wise Tax Summary</div>
            <table className="inv-table" style={{ marginTop: 6 }}>
              <thead>
                <tr style={{ background: tc }}>
                  <th>HSN</th><th className="right">Taxable Amt</th>
                  <th className="right">CGST 9%</th><th className="right">SGST 9%</th><th className="right">Total Tax</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(hsnGroups).map(([hsn, { taxable, tax }], i) => (
                  <tr key={hsn} className={i % 2 === 0 ? "even" : "odd"}>
                    <td>{hsn}</td>
                    <td className="right">₹{taxable.toFixed(2)}</td>
                    <td className="right">₹{tax.toFixed(2)}</td>
                    <td className="right">₹{tax.toFixed(2)}</td>
                    <td className="right">₹{(tax * 2).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="inv-totals">
          <table className="inv-totals-table">
            <tbody>
              {([["Subtotal", `₹${inv.subtotal.toFixed(2)}`], ["CGST (9%)", `₹${inv.cgst.toFixed(2)}`], ["SGST (9%)", `₹${inv.sgst.toFixed(2)}`]] as [string,string][]).map(([k,v]) => (
                <tr key={k}><td>{k}</td><td>{v}</td></tr>
              ))}
              <tr className="grand"><td>Grand Total</td><td style={{ color: tc }}>₹{inv.grandTotal.toFixed(2)}</td></tr>
            </tbody>
          </table>
        </div>

        {misc.amountWords && <p className="inv-amount-words"><b>Amount in Words:</b> Twenty Two Thousand Four Hundred Seventy Three Rupees Only</p>}

        <div className="inv-bank-box" style={{ border: bw }}>
          <div className="inv-bank-title">Bank Details</div>
          <div>Account: {inv.bank}</div>
          <div>IFSC: {inv.ifsc}</div>
        </div>

        {misc.showNotes && <div className="inv-section-text"><b>Notes</b><br />{inv.notes}</div>}
        {misc.showTerms && <div className="inv-section-text"><b>Terms &amp; Conditions</b><br />{inv.terms}</div>}

        {print.showFooter && (
          <div className={`inv-footer${misc.receiverSig ? " dual" : ""}`}>
            {misc.receiverSig && (
              <div style={{ textAlign: "center" }}>
                <span>Receiver's Signature</span>
              </div>
            )}
            <div style={{ textAlign: "center" }}>
              {misc.signatureUrl && (
                <img
                  src={misc.signatureUrl}
                  alt="Authorized Signature"
                  style={{
                    height: 60,
                    maxWidth: 160,
                    objectFit: "contain",
                    display: "block",
                    margin: "0 auto 4px",
                  }}
                />
              )}
              <span>Authorized Signatory</span>
            </div>
          </div>
        )}

        <div className="inv-generated">This is a computer generated invoice.</div>
      </div>
    </div>
  );
};

// ─── THEME MINI CARD ──────────────────────────────────────────────────────────

const ThemeMiniCard: React.FC<{ theme: HomeTheme; selected: boolean; onClick: () => void }> = ({ theme, selected, onClick }) => (
  <div
    className={`theme-mini-card${selected ? " selected" : ""}`}
    onClick={onClick}
  >
    {selected && (
      <div className="theme-check">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="7" fill="#3b5bdb" />
          <path d="M4 7l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    )}
    <div className="theme-mini-preview">
      <div className="theme-mini-header" style={{ background: theme.color }} />
      <div className="theme-mini-body">
        <div className="theme-mini-line long" />
        <div className="theme-mini-line med" />
        <div className="theme-mini-row">
          <div className="theme-mini-col" />
          <div className="theme-mini-col" />
        </div>
        <div className="theme-mini-table-head" style={{ background: theme.color }} />
        {[0,1,2].map(i => (
          <div key={i} className="theme-mini-table-row">
            <div className="theme-mini-line" style={{ width: `${35 + i * 10}%` }} />
            <div className="theme-mini-line short" />
          </div>
        ))}
        <div className="theme-mini-total">
          <div className="theme-mini-total-val" style={{ background: theme.color }} />
        </div>
      </div>
    </div>
    <div className="theme-mini-footer">
      <span className="theme-mini-dot" style={{ background: theme.color }} />
      <span className="theme-mini-name">{theme.name}</span>
    </div>
  </div>
);

// ─── HOME PAGE ────────────────────────────────────────────────────────────────

interface HomePageProps {
  savedTemplates: SavedTemplate[];
  onCustomize: (themeId: string) => void;
  onCreateOwn: () => void;
  onUse: (t: SavedTemplate) => void;
  onDelete: (id: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ savedTemplates, onCustomize, onCreateOwn, onUse, onDelete }) => {
  const [selectedThemeId, setSelectedThemeId] = useState("modern-blue");

  const selectedTheme = HOME_THEMES.find(t => t.id === selectedThemeId) ?? HOME_THEMES[0];

  // Build a full style/state based on selected theme for the live preview
  const previewStyle: StyleState = { ...DEFAULT_STYLE, ...selectedTheme.style };
  const previewPrint: PrintState = DEFAULT_PRINT;

  return (
    <div className="home-page-new">
      {/* ── LEFT: Live Preview ── */}
      <div className="home-left">
        <div className="home-left-inner">
          <div className="home-preview-wrapper">
            <InvoicePreview
              inv={DEFAULT_INVOICE}
              style={previewStyle}
              print={previewPrint}
              ts={DEFAULT_TS}
              misc={DEFAULT_MISC}
              vis={DEFAULT_VIS}
              det={DEFAULT_DET}
              pv={DEFAULT_PV}
            />
          </div>
          <div className="home-preview-label">
            <span className="home-preview-dot" style={{ background: selectedTheme.color }} />
            <span className="home-preview-name">{selectedTheme.name}</span>
            <span className="home-preview-desc">— {selectedTheme.description}</span>
          </div>
        </div>

        {/* Saved templates at the bottom of left panel */}
        {savedTemplates.length > 0 && (
          <div className="home-saved-section">
            <div className="home-saved-title">Your Saved Templates</div>
            <div className="home-saved-list">
              {savedTemplates.map((t) => (
                <div key={t.id} className="home-saved-item" onClick={() => onUse(t)}>
                  <span className="home-saved-dot" style={{ background: t.themeColor }} />
                  <div className="home-saved-info">
                    <div className="home-saved-name">{t.name}</div>
                    <div className="home-saved-date">{t.createdAt}</div>
                  </div>
                  <div className="home-saved-actions">
                    <button className="home-saved-edit" type="button" onClick={(e) => { e.stopPropagation(); onUse(t); }}>Edit</button>
                    <button className="home-saved-del" type="button" onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT: Theme Selector + Actions ── */}
      <div className="home-right">
        <div className="home-right-header">
          <h1 className="home-right-title">Invoice Builder</h1>
          <p className="home-right-subtitle">Choose a template to get started</p>
        </div>

        <div className="theme-card-grid">
          {HOME_THEMES.map(theme => (
            <ThemeMiniCard
              key={theme.id}
              theme={theme}
              selected={selectedThemeId === theme.id}
              onClick={() => setSelectedThemeId(theme.id)}
            />
          ))}
        </div>

        <div className="home-right-actions">
          <button
            className="home-customize-btn"
            type="button"
            onClick={() => onCustomize(selectedTheme.color)}
            style={{ background: selectedTheme.color }}
          >
            Customize "{selectedTheme.name}"
          </button>
          <button
            className="home-create-own-btn"
            type="button"
            onClick={onCreateOwn}
          >
            <span>+</span> Create Own Theme
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── SETTINGS PANELS ─────────────────────────────────────────────────────────

const StylePanel: React.FC<{ style: StyleState; setStyle: React.Dispatch<React.SetStateAction<StyleState>> }> = ({ style, setStyle }) => (
  <div>
    <SL>FONT FAMILY</SL>
    <IBSelect value={style.font} onChange={(v) => setStyle((s) => ({ ...s, font: v }))} options={FONTS} />
    <SL>TEXT SIZE</SL>
    <IBSelect value={style.textSize} onChange={(v) => setStyle((s) => ({ ...s, textSize: v }))} options={TEXT_SIZES} />
    <SL>THEME COLOR</SL>
    <div className="color-row">
      <input type="color" className="color-swatch" value={style.themeColor}
        onChange={(e) => setStyle((s) => ({ ...s, themeColor: e.target.value }))} />
      <IBInput value={style.themeColor} onChange={(v) => setStyle((s) => ({ ...s, themeColor: v }))} />
    </div>
    <SL>THEME PRESETS</SL>
    <div className="preset-grid">
      {Object.entries(THEME_PRESETS).map(([name, color]) => (
        <button key={name} className={`preset-btn${style.themeColor === color ? " active" : ""}`}
          onClick={() => setStyle((s) => ({ ...s, themeColor: color }))} type="button">{name}</button>
      ))}
    </div>
    <SL>BORDER COLOR</SL>
    <div className="color-row">
      <div className="color-preview-box" style={{ background: style.borderColor }} />
      <IBInput value={style.borderColor} onChange={(v) => setStyle((s) => ({ ...s, borderColor: v }))} />
    </div>
    <SL>BORDER WIDTH (PX)</SL>
    <IBInput value={style.borderWidth} onChange={(v) => setStyle((s) => ({ ...s, borderWidth: v }))} />
    <SL>UPLOAD LOGO</SL>
    <input type="file" className="file-input" accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) { const url = URL.createObjectURL(file); setStyle((s) => ({ ...s, logoUrl: url, showLogo: true })); }
      }} />
    {style.logoUrl && (
      <div className="logo-preview-row">
        <img src={style.logoUrl} alt="Logo" className="logo-thumb" />
        <button className="remove-btn" type="button" onClick={() => setStyle((s) => ({ ...s, logoUrl: "", showLogo: false }))}>× Remove</button>
      </div>
    )}
  </div>
);

const PrintPanel: React.FC<{ print: PrintState; setPrint: React.Dispatch<React.SetStateAction<PrintState>> }> = ({ print, setPrint }) => (
  <div>
    <SL>SPACING</SL>
    <IBSelect value={print.spacing} onChange={(v) => setPrint((p) => ({ ...p, spacing: v }))} options={["Compact", "Medium", "Large"]} />
    <SL>MARGINS (PX)</SL>
    <div className="input-grid-2">
      {(["top", "bottom", "left", "right"] as const).map((side) => (
        <div key={side}>
          <div className="input-grid-label">{side.toUpperCase()}</div>
          <IBInput value={print[side]} onChange={(v) => setPrint((p) => ({ ...p, [side]: v }))} />
        </div>
      ))}
    </div>
    <SettingRow label="Show Header" checked={print.showHeader} onChange={(v) => setPrint((p) => ({ ...p, showHeader: v }))} />
    <SettingRow label="Show Footer" checked={print.showFooter} onChange={(v) => setPrint((p) => ({ ...p, showFooter: v }))} />
    <SettingRow label="Show Watermark" checked={print.showWatermark} onChange={(v) => setPrint((p) => ({ ...p, showWatermark: v }))} />
    {print.showWatermark && (
      <>
        <SL>WATERMARK IMAGE</SL><input type="file" className="file-input" />
        <SL>OPACITY ({print.watermarkOpacity}%)</SL>
        <input type="range" min={5} max={80} value={print.watermarkOpacity} style={{ width: "100%" }}
          onChange={(e) => setPrint((p) => ({ ...p, watermarkOpacity: Number(e.target.value) }))} />
      </>
    )}
  </div>
);

const BusinessPanel: React.FC<{
  inv: InvoiceData; setInv: React.Dispatch<React.SetStateAction<InvoiceData>>;
  vis: BusinessVisibility; setVis: React.Dispatch<React.SetStateAction<BusinessVisibility>>;
}> = ({ inv, setInv, vis, setVis }) => (
  <div>
    <SL>LAYOUT</SL>
    <IBSelect value="Layout 1 - Standard" onChange={() => {}} options={["Layout 1 - Standard", "Layout 2 - Modern", "Layout 3 - Compact"]} />
    <SettingRow label="Company Name" checked={vis.companyName} onChange={(v) => setVis((s) => ({ ...s, companyName: v }))}>
      {vis.companyName && <IBInput value={inv.companyName} onChange={(v) => setInv((i) => ({ ...i, companyName: v }))} />}
    </SettingRow>
    <SettingRow label="Slogan" checked={vis.slogan} onChange={(v) => setVis((s) => ({ ...s, slogan: v }))}>
      {vis.slogan && <IBInput value={inv.slogan} onChange={(v) => setInv((i) => ({ ...i, slogan: v }))} />}
    </SettingRow>
    <SettingRow label="Address" checked={vis.address} onChange={(v) => setVis((s) => ({ ...s, address: v }))}>
      {vis.address && (
        <>
          <IBInput value={inv.address} onChange={(v) => setInv((i) => ({ ...i, address: v }))} />
          <div className="input-grid-2" style={{ marginTop: 8 }}>
            <div><div className="input-grid-label">STATE</div><IBInput value={inv.state} onChange={(v) => setInv((i) => ({ ...i, state: v }))} /></div>
            <div><div className="input-grid-label">CITY</div><IBInput value={inv.city} onChange={(v) => setInv((i) => ({ ...i, city: v }))} /></div>
          </div>
        </>
      )}
    </SettingRow>
    <SettingRow label="GSTIN" checked={vis.gstin} onChange={(v) => setVis((s) => ({ ...s, gstin: v }))}>
      {vis.gstin && <IBInput value={inv.gstin} onChange={(v) => setInv((i) => ({ ...i, gstin: v }))} />}
    </SettingRow>
    <SettingRow label="Phone" checked={vis.phone} onChange={(v) => setVis((s) => ({ ...s, phone: v }))}>
      {vis.phone && <IBInput value={inv.phone} onChange={(v) => setInv((i) => ({ ...i, phone: v }))} />}
    </SettingRow>
    <SettingRow label="PAN Number" checked={vis.pan} onChange={(v) => setVis((s) => ({ ...s, pan: v }))}>
      {vis.pan && <IBInput value={inv.pan} onChange={(v) => setInv((i) => ({ ...i, pan: v }))} />}
    </SettingRow>
    <SettingRow label="Email" checked={vis.email} onChange={(v) => setVis((s) => ({ ...s, email: v }))}>
      {vis.email && <IBInput value={inv.email} onChange={(v) => setInv((i) => ({ ...i, email: v }))} />}
    </SettingRow>
  </div>
);

const InvoiceDetPanel: React.FC<{
  inv: InvoiceData; setInv: React.Dispatch<React.SetStateAction<InvoiceData>>;
  det: InvoiceDetailsState; setDet: React.Dispatch<React.SetStateAction<InvoiceDetailsState>>;
}> = ({ inv, setInv, det, setDet }) => (
  <div>
    <SL>INDUSTRY TYPE</SL>
    <IBSelect value={det.industryType} onChange={(v) => setDet((d) => ({ ...d, industryType: v }))}
      options={["General", "Manufacturing", "Retail", "Services", "Construction"]} />
    <SL>LAYOUT</SL>
    <IBSelect value={det.layout} onChange={(v) => setDet((d) => ({ ...d, layout: v }))} options={["Layout 1", "Layout 2", "Layout 3"]} />
    <SettingRow label="PO Number" checked={det.showPO} onChange={(v) => setDet((d) => ({ ...d, showPO: v }))}>
      {det.showPO && <IBInput value={inv.poNo} onChange={(v) => setInv((i) => ({ ...i, poNo: v }))} />}
    </SettingRow>
    <SettingRow label="E-way Bill" checked={det.showEwayBill} onChange={(v) => setDet((d) => ({ ...d, showEwayBill: v }))}>
      {det.showEwayBill && <IBInput value={det.ewayBillNo} onChange={(v) => setDet((d) => ({ ...d, ewayBillNo: v }))} placeholder="E-way Bill No." />}
    </SettingRow>
    <SettingRow label="Vehicle Number" checked={det.showVehicle} onChange={(v) => setDet((d) => ({ ...d, showVehicle: v }))}>
      {det.showVehicle && <IBInput value={det.vehicleNo} onChange={(v) => setDet((d) => ({ ...d, vehicleNo: v }))} placeholder="Vehicle No." />}
    </SettingRow>
    <SL>CUSTOM FIELDS</SL>
    {det.customFields.map((f, i) => (
      <div className="custom-field-row" key={i}>
        <IBInput value={f.label} onChange={(v) => setDet((d) => ({ ...d, customFields: d.customFields.map((x, j) => j === i ? { ...x, label: v } : x) }))} placeholder="Label" />
        <IBInput value={f.value} onChange={(v) => setDet((d) => ({ ...d, customFields: d.customFields.map((x, j) => j === i ? { ...x, value: v } : x) }))} placeholder="Value" />
        <button className="remove-btn" onClick={() => setDet((d) => ({ ...d, customFields: d.customFields.filter((_, j) => j !== i) }))} type="button">×</button>
      </div>
    ))}
    <button className="add-btn" onClick={() => setDet((d) => ({ ...d, customFields: [...d.customFields, { label: "Field", value: "" }] }))} type="button">+ Add Field</button>
  </div>
);

const PartyPanel: React.FC<{
  inv: InvoiceData; setInv: React.Dispatch<React.SetStateAction<InvoiceData>>;
  pv: PartyVisibility; setPv: React.Dispatch<React.SetStateAction<PartyVisibility>>;
}> = ({ inv, setInv, pv, setPv }) => (
  <div>
    <SL>BILL TO</SL>
    <SettingRow label="Company Name" checked={pv.billCompany} onChange={(v) => setPv((p) => ({ ...p, billCompany: v }))}>
      {pv.billCompany && <IBInput value={inv.billTo.name} onChange={(v) => setInv((i) => ({ ...i, billTo: { ...i.billTo, name: v } }))} />}
    </SettingRow>
    <SettingRow label="Address" checked={pv.billAddress} onChange={(v) => setPv((p) => ({ ...p, billAddress: v }))}>
      {pv.billAddress && <IBInput value={inv.billTo.address} onChange={(v) => setInv((i) => ({ ...i, billTo: { ...i.billTo, address: v } }))} />}
    </SettingRow>
    <SettingRow label="Mobile" checked={pv.billMobile} onChange={(v) => setPv((p) => ({ ...p, billMobile: v }))}>
      {pv.billMobile && <IBInput value={inv.billTo.mobile} onChange={(v) => setInv((i) => ({ ...i, billTo: { ...i.billTo, mobile: v } }))} />}
    </SettingRow>
    <SettingRow label="GSTIN" checked={pv.billGstin} onChange={(v) => setPv((p) => ({ ...p, billGstin: v }))}>
      {pv.billGstin && <IBInput value={inv.billTo.gstin} onChange={(v) => setInv((i) => ({ ...i, billTo: { ...i.billTo, gstin: v } }))} />}
    </SettingRow>
    <SL>BILL TO – CUSTOM FIELDS</SL>
    {pv.billCustomFields.map((f, i) => (
      <div className="custom-field-row" key={i}>
        <IBInput value={f.label} onChange={(v) => setPv((p) => ({ ...p, billCustomFields: p.billCustomFields.map((x, j) => j === i ? { ...x, label: v } : x) }))} placeholder="Label" />
        <IBInput value={f.value} onChange={(v) => setPv((p) => ({ ...p, billCustomFields: p.billCustomFields.map((x, j) => j === i ? { ...x, value: v } : x) }))} placeholder="Value" />
        <button className="remove-btn" type="button" onClick={() => setPv((p) => ({ ...p, billCustomFields: p.billCustomFields.filter((_, j) => j !== i) }))}>×</button>
      </div>
    ))}
    <button className="add-btn" style={{ marginBottom: 20 }} type="button"
      onClick={() => setPv((p) => ({ ...p, billCustomFields: [...p.billCustomFields, { label: "Field", value: "" }] }))}>+ Add Field</button>

    <SL>SHIP TO</SL>
    <SettingRow label="Company Name" checked={pv.shipCompany} onChange={(v) => setPv((p) => ({ ...p, shipCompany: v }))}>
      {pv.shipCompany && <IBInput value={inv.shipTo.name} onChange={(v) => setInv((i) => ({ ...i, shipTo: { ...i.shipTo, name: v } }))} />}
    </SettingRow>
    <SettingRow label="Address" checked={pv.shipAddress} onChange={(v) => setPv((p) => ({ ...p, shipAddress: v }))}>
      {pv.shipAddress && <IBInput value={inv.shipTo.address} onChange={(v) => setInv((i) => ({ ...i, shipTo: { ...i.shipTo, address: v } }))} />}
    </SettingRow>
    <SettingRow label="Mobile" checked={pv.shipMobile} onChange={(v) => setPv((p) => ({ ...p, shipMobile: v }))}>
      {pv.shipMobile && <IBInput value={inv.shipTo.mobile} onChange={(v) => setInv((i) => ({ ...i, shipTo: { ...i.shipTo, mobile: v } }))} />}
    </SettingRow>
    <SettingRow label="GSTIN" checked={pv.shipGstin} onChange={(v) => setPv((p) => ({ ...p, shipGstin: v }))}>
      {pv.shipGstin && <IBInput value={inv.shipTo.gstin} onChange={(v) => setInv((i) => ({ ...i, shipTo: { ...i.shipTo, gstin: v } }))} />}
    </SettingRow>
    <SL>SHIP TO – CUSTOM FIELDS</SL>
    {pv.shipCustomFields.map((f, i) => (
      <div className="custom-field-row" key={i}>
        <IBInput value={f.label} onChange={(v) => setPv((p) => ({ ...p, shipCustomFields: p.shipCustomFields.map((x, j) => j === i ? { ...x, label: v } : x) }))} placeholder="Label" />
        <IBInput value={f.value} onChange={(v) => setPv((p) => ({ ...p, shipCustomFields: p.shipCustomFields.map((x, j) => j === i ? { ...x, value: v } : x) }))} placeholder="Value" />
        <button className="remove-btn" type="button" onClick={() => setPv((p) => ({ ...p, shipCustomFields: p.shipCustomFields.filter((_, j) => j !== i) }))}>×</button>
      </div>
    ))}
    <button className="add-btn" type="button"
      onClick={() => setPv((p) => ({ ...p, shipCustomFields: [...p.shipCustomFields, { label: "Field", value: "" }] }))}>+ Add Field</button>
  </div>
);

const ItemPanel: React.FC<{ ts: TableSettings; setTs: React.Dispatch<React.SetStateAction<TableSettings>> }> = ({ ts, setTs }) => {
  const toggleCol = (col: string) => setTs((t) => ({ ...t, cols: { ...t.cols, [col]: t.cols[col] === false } }));
  return (
    <div>
      <SL>GENERAL</SL>
      <SettingRow label="HSN-wise Tax Summary" checked={ts.hsnSummary} onChange={(v) => setTs((t) => ({ ...t, hsnSummary: v }))} />
      <SettingRow label="Show Item Description" checked={ts.showDesc} onChange={(v) => setTs((t) => ({ ...t, showDesc: v }))} />
      <SettingRow label="Capitalize Item Name" checked={ts.capitalize} onChange={(v) => setTs((t) => ({ ...t, capitalize: v }))} />
      <SettingRow label="Stretch Table Full Page" checked={ts.stretch} onChange={(v) => setTs((t) => ({ ...t, stretch: v }))} />
      <SL>SUMMARY QUANTITY MODE</SL>
      <IBSelect value={ts.quantityMode} onChange={(v) => setTs((t) => ({ ...t, quantityMode: v }))} options={["Total", "Net", "Gross"]} />
      <SL>TABLE COLUMNS</SL>
      {TABLE_COLUMNS.map((col) => (
        <SettingRow key={col} label={col} checked={ts.cols[col] !== false} onChange={() => toggleCol(col)} />
      ))}
      <SL>CUSTOM COLUMNS</SL>
      {ts.customCols.map((col, i) => (
        <div className="custom-col-row" key={i}>
          <IBInput value={col} onChange={(v) => setTs((t) => ({ ...t, customCols: t.customCols.map((c, j) => j === i ? v : c) }))} placeholder="Column name" />
          <button className="remove-btn" onClick={() => setTs((t) => ({ ...t, customCols: t.customCols.filter((_, j) => j !== i) }))} type="button">×</button>
        </div>
      ))}
      <button className="add-btn" onClick={() => setTs((t) => ({ ...t, customCols: [...t.customCols, ""] }))} type="button">+ Add Column</button>

      <SL>BACKGROUND IMAGE</SL>
      <p style={{ fontSize: 11, color: "#868e96", marginBottom: 8, lineHeight: 1.5 }}>
        Upload an image to use as the full-page background of the invoice bill.
      </p>
      <input
        type="file"
        className="file-input"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const url = URL.createObjectURL(file);
            setTs((t) => ({ ...t, backgroundUrl: url }));
          }
        }}
      />
      {ts.backgroundUrl && (
        <>
          <div
            style={{
              marginTop: 10,
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid #dee2e6",
              position: "relative",
              height: 90,
              background: `url(${ts.backgroundUrl}) center/cover no-repeat`,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              Background Preview
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <div className="section-label">OPACITY ({ts.backgroundOpacity}%)</div>
            <input
              type="range"
              min={5}
              max={60}
              value={ts.backgroundOpacity}
              style={{ width: "100%" }}
              onChange={(e) => setTs((t) => ({ ...t, backgroundOpacity: Number(e.target.value) }))}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#adb5bd", marginTop: 2 }}>
              <span>5% (Subtle)</span>
              <span>60% (Bold)</span>
            </div>
          </div>
          <button
            className="remove-btn"
            type="button"
            style={{ marginTop: 10 }}
            onClick={() => setTs((t) => ({ ...t, backgroundUrl: "", backgroundOpacity: 15 }))}
          >
            × Remove Background
          </button>
        </>
      )}
    </div>
  );
};

const MiscPanel: React.FC<{
  inv: InvoiceData; setInv: React.Dispatch<React.SetStateAction<InvoiceData>>;
  misc: MiscState; setMisc: React.Dispatch<React.SetStateAction<MiscState>>;
}> = ({ inv, setInv, misc, setMisc }) => (
  <div>
    <SettingRow label="Notes" checked={misc.showNotes} onChange={(v) => setMisc((m) => ({ ...m, showNotes: v }))}>
      {misc.showNotes && <textarea className="ib-textarea" value={inv.notes} onChange={(e) => setInv((i) => ({ ...i, notes: e.target.value }))} />}
    </SettingRow>
    <SettingRow label="Total Amount in Words" checked={misc.amountWords} onChange={(v) => setMisc((m) => ({ ...m, amountWords: v }))} />
    <SettingRow label="Terms & Conditions" checked={misc.showTerms} onChange={(v) => setMisc((m) => ({ ...m, showTerms: v }))}>
      {misc.showTerms && <textarea className="ib-textarea" value={inv.terms} onChange={(e) => setInv((i) => ({ ...i, terms: e.target.value }))} />}
    </SettingRow>
    <SL>BANK ACCOUNT</SL>
    <IBSelect value={inv.bank} onChange={(v) => setInv((i) => ({ ...i, bank: v }))} options={["SBI - 1234567890", "HDFC - 9876543210"]} />
    <div style={{ marginTop: 8 }}>
      <IBInput value={inv.ifsc} onChange={(v) => setInv((i) => ({ ...i, ifsc: v }))} placeholder="IFSC Code" />
    </div>
    <div style={{ marginTop: 16 }}>
      <SL>UPLOAD SIGNATURE</SL>
      <input
        type="file"
        className="file-input"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const url = URL.createObjectURL(file);
            setMisc((m) => ({ ...m, signatureUrl: url }));
          }
        }}
      />
      {misc.signatureUrl && (
        <div className="logo-preview-row">
          <img
            src={misc.signatureUrl}
            alt="Signature Preview"
            className="logo-thumb"
            style={{ maxHeight: 60, objectFit: "contain" }}
          />
          <button
            className="remove-btn"
            type="button"
            onClick={() => setMisc((m) => ({ ...m, signatureUrl: "" }))}
          >
            × Remove
          </button>
        </div>
      )}
    </div>
    <SettingRow label="Receiver Signature" checked={misc.receiverSig} onChange={(v) => setMisc((m) => ({ ...m, receiverSig: v }))} />
  </div>
);

// ─── BUILDER VIEW ─────────────────────────────────────────────────────────────

interface BuilderProps {
  initialStyle?: StyleState;
  initialTemplate?: SavedTemplate | null;
  onBack: () => void;
  onSaved: (t: SavedTemplate) => void;
}

const BuilderView: React.FC<BuilderProps> = ({ initialStyle, initialTemplate, onBack, onSaved }) => {
  const [activeTab, setActiveTab] = useState<NavId>("style");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const [inv, setInv]   = useState<InvoiceData>(initialTemplate?.inv ?? DEFAULT_INVOICE);
  const [style, setStyle] = useState<StyleState>(initialTemplate?.style ?? { ...DEFAULT_STYLE, ...(initialStyle ?? {}) });
  const [print, setPrint] = useState<PrintState>(DEFAULT_PRINT);
  const [vis, setVis]   = useState<BusinessVisibility>(initialTemplate?.vis ?? DEFAULT_VIS);
  const [det, setDet]   = useState<InvoiceDetailsState>(initialTemplate?.det ?? DEFAULT_DET);
  const [pv, setPv]     = useState<PartyVisibility>(initialTemplate?.pv ?? DEFAULT_PV);
  const [ts, setTs]     = useState<TableSettings>(initialTemplate?.ts ?? DEFAULT_TS);
  const [misc, setMisc] = useState<MiscState>(initialTemplate?.misc ?? DEFAULT_MISC);

  const activeLabel = NAV_ITEMS.find((n) => n.id === activeTab)?.label ?? "";

  const panels: Record<NavId, React.ReactNode> = {
    style:    <StylePanel style={style} setStyle={setStyle} />,
    print:    <PrintPanel print={print} setPrint={setPrint} />,
    business: <BusinessPanel inv={inv} setInv={setInv} vis={vis} setVis={setVis} />,
    invoice:  <InvoiceDetPanel inv={inv} setInv={setInv} det={det} setDet={setDet} />,
    party:    <PartyPanel inv={inv} setInv={setInv} pv={pv} setPv={setPv} />,
    items:    <ItemPanel ts={ts} setTs={setTs} />,
    misc:     <MiscPanel inv={inv} setInv={setInv} misc={misc} setMisc={setMisc} />,
  };

  const handleSave = (name: string) => {
    const saved: SavedTemplate = {
      id: initialTemplate?.id ?? Date.now().toString(),
      name,
      themeColor: style.themeColor,
      createdAt: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      inv, style, vis, det, pv, ts, misc,
    };
    onSaved(saved);
    setShowSaveDialog(false);
  };

  return (
    <>
      <div className="invoice-builder">
        <aside className="sidebar">
          <div className="sidebar-header">
            <button className="back-btn" onClick={onBack} type="button">← Back to Home</button>
            <div className="sidebar-title">Invoice Builder</div>
            <div className="sidebar-subtitle">Customize your template</div>
          </div>
          <nav className="sidebar-nav">
            {NAV_ITEMS.map((item) => {
              const Icon = NAV_ICONS[item.id];
              return (
                <button key={item.id} className={`nav-item${activeTab === item.id ? " active" : ""}`}
                  onClick={() => setActiveTab(item.id)} type="button">
                  <span className="nav-item-icon"><Icon /></span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="sidebar-footer">
            <button className="sidebar-save-btn" type="button" onClick={() => setShowSaveDialog(true)}>
              <IconSave /> Save Template
            </button>
          </div>
        </aside>

        <main className="preview-area">
          <InvoicePreview inv={inv} style={style} print={print} ts={ts} misc={misc} vis={vis} det={det} pv={pv} />
        </main>

        <aside className="settings-panel">
          <h2 className="settings-panel-title">{activeLabel}</h2>
          {panels[activeTab]}
        </aside>
      </div>

      {showSaveDialog && (
        <SaveDialog
          defaultName={initialTemplate?.name ?? `${inv.companyName} Template`}
          themeColor={style.themeColor}
          onSave={handleSave}
          onCancel={() => setShowSaveDialog(false)}
        />
      )}
    </>
  );
};

// ─── ROOT APP ─────────────────────────────────────────────────────────────────

const InvoiceBuilderApp: React.FC = () => {
  const [view, setView] = useState<View>("home");
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<SavedTemplate | null>(null);
  const [starterColor, setStarterColor] = useState<string | null>(null);

  const handleCustomize = (color: string) => {
    setEditingTemplate(null);
    setStarterColor(color);
    setView("builder");
  };

  const handleCreateOwn = () => {
    setEditingTemplate(null);
    setStarterColor(null);
    setView("builder");
  };

  const handleUse = (t: SavedTemplate) => {
    setEditingTemplate(t);
    setStarterColor(null);
    setView("builder");
  };

  const handleDelete = (id: string) => {
    setSavedTemplates((ts) => ts.filter((t) => t.id !== id));
  };

  const handleSaved = (t: SavedTemplate) => {
    setSavedTemplates((prev) => {
      const exists = prev.find((x) => x.id === t.id);
      return exists ? prev.map((x) => (x.id === t.id ? t : x)) : [t, ...prev];
    });
    setView("home");
  };

  if (view === "builder") {
    return (
      <BuilderView
        initialStyle={starterColor ? { ...DEFAULT_STYLE, themeColor: starterColor } : undefined}
        initialTemplate={editingTemplate}
        onBack={() => setView("home")}
        onSaved={handleSaved}
      />
    );
  }

  return (
    <HomePage
      savedTemplates={savedTemplates}
      onCustomize={handleCustomize}
      onCreateOwn={handleCreateOwn}
      onUse={handleUse}
      onDelete={handleDelete}
    />
  );
};

export default InvoiceBuilderApp;