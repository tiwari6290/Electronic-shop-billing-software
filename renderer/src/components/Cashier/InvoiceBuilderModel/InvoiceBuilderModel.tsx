import React, { useState } from "react";
import "./InvoiceBuilderModel.css";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type View = "home" | "builder";

interface SavedTemplate {
  id: string;
  name: string;
  themeColor: string;
  themeLayout: string;
  bgImageUrl: string;
  bgOpacity: number;
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
  showChallan: boolean;
  challanNo: string;
  showFinancedBy: boolean;
  financedBy: string;
  showSalesman: boolean;
  salesman: string;
  showWarranty: boolean;
  warrantyPeriod: string;
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
  discPct: number | null;
  tax: number;
  taxPct: number;
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
  receivedAmount: number;
  balanceAmount: number;
  bank: string;
  ifsc: string;
  bankName: string;
  accountNo: string;
  branch: string;
  notes: string;
  terms: string;
}

interface HomeThemeSettings {
  showPartyBalance: boolean;
  enableFreeItemQty: boolean;
  showItemDesc: boolean;
  showAlternateUnit: boolean;
  showPhoneOnInvoice: boolean;
  showTime: boolean;
  priceHistory: boolean;
  autoLuxury: boolean;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const THEME_PRESETS: Record<string, string> = {
  Classic: "#3b5bdb", Modern: "#2f9e44", Warm: "#e8590c", Forest: "#2b8a3e", Slate: "#495057",
};
const FONTS = ["Arial", "Inter", "Georgia", "Times New Roman", "Courier New", "Verdana", "Trebuchet MS"];
const TEXT_SIZES = ["11px", "12px", "13px", "14px", "15px"];
const TABLE_COLUMNS = ["Serial Number", "Item Name", "HSN", "MRP", "Quantity", "Rate/Item", "Discount", "Amount"];

const DEFAULT_INVOICE: InvoiceData = {
  companyName: "Mondal Electronics Concern",
  slogan: "",
  address: "Kumillapara, P.O.: Sauipara, Bally, Howrah - 711227",
  state: "West Bengal", city: "Howrah",
  gstin: "19AFTPM0665H1ZY", phone: "2646 1320, Mobile: 9831789022",
  email: "mondal@electronics.in", pan: "AFTPM0665H",
  invoiceNo: "MONDAL/2026/00013", date: "19/03/2026",
  dueDate: "18/04/2026", placeOfSupply: "West Bengal", poNo: "",
  billTo: { name: "Rohit Kumar Jha", address: "1/2 Mankundu", mobile: "6207941417", gstin: "" },
  shipTo: { name: "Rohit Kumar Jha", address: "1/2 Mankundu", mobile: "6207941417", gstin: "" },
  items: [
    { id: 1, name: "SOFA CUM BED", desc: "", hsn: "-", qty: "2\nPieces(PCS)", mrp: 20000, rate: 20000, disc: 4000, discPct: 10, tax: 6480, taxPct: 18, amount: 42480 },
    { id: 2, name: "HISEN 1.5 TON", desc: "", hsn: "5672", qty: "2\nPieces(PCS)", mrp: 45000, rate: 45000, disc: 9000, discPct: 10, tax: 14580, taxPct: 18, amount: 95580 },
  ],
  subtotal: 117000, cgst: 10530, sgst: 10530, grandTotal: 138060,
  receivedAmount: 100000, balanceAmount: 38060,
  bank: "Mondal Electronics Concern",
  ifsc: "KVBL0003112",
  bankName: "Karur Vysya Bank (KVB)",
  accountNo: "3112135000002364",
  branch: "Ghoshpara, Howrah - 711227",
  notes: "",
  terms: "1. Goods once sold will not be taken back or exchanged after 7 days",
};

const DEFAULT_STYLE: StyleState = {
  font: "Arial", textSize: "12px", themeColor: "#000000",
  borderColor: "#000000", borderWidth: "1", showLogo: false, logoUrl: "",
};

const DEFAULT_PRINT: PrintState = {
  spacing: "Medium", top: "20", bottom: "20", left: "20", right: "20",
  showHeader: true, showFooter: true, showWatermark: false, watermarkOpacity: 10,
};

const DEFAULT_VIS: BusinessVisibility = {
  companyName: true, slogan: false, address: true,
  gstin: true, phone: true, pan: true, email: false,
};

const DEFAULT_DET: InvoiceDetailsState = {
  industryType: "Electronics", layout: "Advanced GST (Tally)",
  showPO: false, showEwayBill: true, ewayBillNo: "77",
  showVehicle: false, vehicleNo: "",
  showChallan: true, challanNo: "159",
  showFinancedBy: true, financedBy: "HDFC BANK",
  showSalesman: true, salesman: "Tiwari",
  showWarranty: true, warrantyPeriod: "19/10/2027",
  customFields: [],
};

const DEFAULT_PV: PartyVisibility = {
  billCompany: true, billAddress: true, billMobile: true, billGstin: false,
  shipCompany: true, shipAddress: true, shipMobile: true, shipGstin: false,
  billCustomFields: [], shipCustomFields: [],
};

const DEFAULT_TS: TableSettings = {
  hsnSummary: true, showDesc: false, capitalize: false, stretch: true,
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

const THEME_CARDS = [
  { id: "advanced-gst",       name: "Advanced GST",        color: "#1a1d23" },
  { id: "luxury",             name: "Luxury",              color: "#c8a94f", isNew: true },
  { id: "stylish",            name: "Stylish",             color: "#4a90d9" },
  { id: "advanced-gst-tally", name: "Advanced GST (Tally)", color: "#2c5282" },
  { id: "billbook",           name: "Billbook",            color: "#2f9e44" },
  { id: "advanced-gst-a5",    name: "Advanced GST(A5)",    color: "#495057" },
  { id: "billbook-a5",        name: "Billbook(A5)",        color: "#7950f2" },
  { id: "modern",             name: "Modern",              color: "#e8590c" },
  { id: "simple",             name: "Simple",              color: "#868e96" },
];

const COLOR_SWATCHES = ["#1a1d23", "#2d6a2d", "#0e7490", "#7c3aed", "#b91c1c", "#4c51bf", "#b45309", "#d97706"];

// ─── LOCALSTORAGE HELPERS ─────────────────────────────────────────────────────

const LS_TEMPLATES = "savedInvoiceTemplates";
const LS_ACTIVE    = "activeInvoiceTemplate";

function loadTemplates(): SavedTemplate[] {
  try { return JSON.parse(localStorage.getItem(LS_TEMPLATES) || "[]"); }
  catch { return []; }
}

function persistTemplates(list: SavedTemplate[], active: SavedTemplate) {
  try {
    localStorage.setItem(LS_TEMPLATES, JSON.stringify(list));
    localStorage.setItem(LS_ACTIVE,    JSON.stringify(active));
  } catch { /* quota exceeded */ }
}

function removeFromStorage(list: SavedTemplate[]) {
  try {
    localStorage.setItem(LS_TEMPLATES, JSON.stringify(list));
    if (list.length === 0) localStorage.removeItem(LS_ACTIVE);
    else localStorage.setItem(LS_ACTIVE, JSON.stringify(list[0]));
  } catch { /* ignore */ }
}

// ─── SVG ICONS ────────────────────────────────────────────────────────────────

const IconStyle: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r="2.5"/><circle cx="6.5" cy="14.5" r="2.5"/><circle cx="17.5" cy="16.5" r="2.5"/>
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
    <path d="M12 12h.01"/><path d="M2 12a20.3 20.3 0 0 0 20 0"/>
  </svg>
);
const IconInvoice: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
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
    <path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/>
  </svg>
);
const IconMisc: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
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
  style: IconStyle, print: IconPrint, business: IconBusiness,
  invoice: IconInvoice, party: IconParty, items: IconItems, misc: IconMisc,
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
  defaultName: string; themeColor: string;
  onSave: (name: string) => void; onCancel: () => void;
}> = ({ defaultName, onSave, onCancel }) => {
  const [name, setName] = useState(defaultName);
  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-title">Save Template</div>
        <div className="dialog-desc">Give your invoice template a name so you can find it later.</div>
        <IBInput value={name} onChange={setName} placeholder="e.g. Mondal Electronics Template" />
        <div className="dialog-actions">
          <button className="dialog-cancel" onClick={onCancel} type="button">Cancel</button>
          <button className="dialog-save" onClick={() => name.trim() && onSave(name.trim())} type="button">Save Template</button>
        </div>
      </div>
    </div>
  );
};

// ─── ADVANCED GST TALLY INVOICE PREVIEW ───────────────────────────────────────

interface AGSTPreviewProps {
  inv: InvoiceData;
  det: InvoiceDetailsState;
  pv: PartyVisibility;
  vis: BusinessVisibility;
  ts: TableSettings;
  misc: MiscState;
  themeColor?: string;
  bgImageUrl?: string;
  bgOpacity?: number;
  logoUrl?: string;
  showLogo?: boolean;
}

const AdvancedGSTPreview: React.FC<AGSTPreviewProps> = ({ inv, det, pv, vis, ts, misc, themeColor = "#1a1d23", bgImageUrl = "", bgOpacity = 15, logoUrl = "", showLogo = false }) => {
  const hsnGroups = inv.items.reduce<Record<string, { taxable: number; cgst: number; sgst: number }>>((acc, item) => {
    const key = item.hsn || "-";
    if (!acc[key]) acc[key] = { taxable: 0, cgst: 0, sgst: 0 };
    const taxable = item.amount - (item.tax || 0);
    acc[key].taxable += taxable;
    acc[key].cgst += (item.tax || 0) / 2;
    acc[key].sgst += (item.tax || 0) / 2;
    return acc;
  }, {});

  const totalTaxable = Object.values(hsnGroups).reduce((s, v) => s + v.taxable, 0);
  const totalCgst = Object.values(hsnGroups).reduce((s, v) => s + v.cgst, 0);
  const totalSgst = Object.values(hsnGroups).reduce((s, v) => s + v.sgst, 0);
  const totalTax = totalCgst + totalSgst;

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const bankFields = [
    ["Name", inv.bank], ["Bank", inv.bankName], ["A/C No.", inv.accountNo],
    ["Branch", inv.branch], ["IFSC Code", inv.ifsc]
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div className="agst-preview" style={{ position: "relative", overflow: "hidden" }}>
      {bgImageUrl && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `url(${bgImageUrl})`,
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: bgOpacity / 100, pointerEvents: "none",
        }} />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header badges */}
        <div className="agst-badges">
          <span className="agst-badge-main">TAX INVOICE</span>
          <span className="agst-badge-copy">ORIGINAL FOR RECIPIENT</span>
        </div>

        {/* Company + Invoice info */}
        <div className="agst-header-grid">
          <div className="agst-company-cell">
            {/* LOGO — shows when enabled */}
            {showLogo && logoUrl && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 4 }}>
                <img src={logoUrl} alt="Logo"
                  style={{ height: 52, width: 52, objectFit: "contain", borderRadius: 4, border: "1px solid #eee", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  {vis.companyName && <div className="agst-company-name" style={{ color: themeColor }}>{inv.companyName}</div>}
                  {vis.address && <div className="agst-company-sub">{inv.address}</div>}
                  {vis.phone && <div className="agst-company-sub">Phone: {inv.phone}</div>}
                  {vis.gstin && <div className="agst-company-sub">G.S.T. No.: {inv.gstin}</div>}
                  {vis.pan && <div className="agst-company-sub">PAN No.: {inv.pan}</div>}
                </div>
              </div>
            )}
            {/* No logo */}
            {(!showLogo || !logoUrl) && (
              <>
                {vis.companyName && <div className="agst-company-name" style={{ color: themeColor }}>{inv.companyName}</div>}
                {vis.address && <div className="agst-company-sub">{inv.address}</div>}
                {vis.phone && <div className="agst-company-sub">Phone: {inv.phone}</div>}
                {vis.gstin && <div className="agst-company-sub">G.S.T. No.: {inv.gstin}</div>}
                {vis.pan && <div className="agst-company-sub">PAN No.: {inv.pan}</div>}
              </>
            )}
          </div>
          <div className="agst-info-cell">
            <div className="agst-info-row3">
              <div className="agst-info-block bd-right bd-bottom">
                <div className="agst-info-label">INVOICE NO.</div>
                <div className="agst-info-val">{inv.invoiceNo}</div>
              </div>
              <div className="agst-info-block bd-right bd-bottom">
                <div className="agst-info-label">INVOICE DATE</div>
                <div className="agst-info-val">{inv.date}</div>
              </div>
              <div className="agst-info-block bd-bottom">
                <div className="agst-info-label">DUE DATE</div>
                <div className="agst-info-val">{inv.dueDate}</div>
              </div>
            </div>
            {(det.showFinancedBy || det.showSalesman || det.showChallan) && (
              <div className="agst-info-row3">
                <div className="agst-info-block bd-right bd-bottom">
                  <div className="agst-info-label">FINANCED BY</div>
                  <div className="agst-info-val">{det.showFinancedBy ? det.financedBy : "-"}</div>
                </div>
                <div className="agst-info-block bd-right bd-bottom">
                  <div className="agst-info-label">SALESMAN</div>
                  <div className="agst-info-val">{det.showSalesman ? det.salesman : "-"}</div>
                </div>
                <div className="agst-info-block bd-bottom">
                  <div className="agst-info-label">CHALLAN NO.</div>
                  <div className="agst-info-val">{det.showChallan ? det.challanNo : "-"}</div>
                </div>
              </div>
            )}
            {(det.showWarranty || det.showEwayBill) && (
              <div className="agst-info-row2">
                <div className="agst-info-block bd-right">
                  <div className="agst-info-label">WARRANTY PERIOD</div>
                  <div className="agst-info-val">{det.showWarranty ? det.warrantyPeriod : "-"}</div>
                </div>
                <div className="agst-info-block">
                  <div className="agst-info-label">E-WAY BILL NO.</div>
                  <div className="agst-info-val">{det.showEwayBill ? det.ewayBillNo : "-"}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bill To / Ship To */}
        <div className="agst-party-grid">
          <div className="agst-party-cell bd-right">
            <div className="agst-party-label">BILL TO</div>
            {pv.billCompany && <div className="agst-party-name">{inv.billTo.name}</div>}
            {pv.billAddress && <div className="agst-party-detail">Address: {inv.billTo.address}</div>}
            {pv.billMobile && <div className="agst-party-detail">Mobile: {inv.billTo.mobile}</div>}
            {pv.billGstin && inv.billTo.gstin && <div className="agst-party-detail">GSTIN: {inv.billTo.gstin}</div>}
            {pv.billCustomFields.map((f, i) => f.label && <div key={i} className="agst-party-detail"><strong>{f.label}:</strong> {f.value}</div>)}
          </div>
          <div className="agst-party-cell">
            <div className="agst-party-label">SHIP TO</div>
            {pv.shipCompany && <div className="agst-party-name">{inv.shipTo.name}</div>}
            {pv.shipAddress && <div className="agst-party-detail">Address: {inv.shipTo.address}</div>}
            {pv.shipMobile && <div className="agst-party-detail">Mobile: {inv.shipTo.mobile}</div>}
            {pv.shipGstin && inv.shipTo.gstin && <div className="agst-party-detail">GSTIN: {inv.shipTo.gstin}</div>}
            {pv.shipCustomFields.map((f, i) => f.label && <div key={i} className="agst-party-detail"><strong>{f.label}:</strong> {f.value}</div>)}
          </div>
        </div>

        {/* Items Table */}
        <table className="agst-table">
          <thead>
            <tr style={{ background: themeColor }}>
              <th style={{ color: "#fff" }}>S.NO.</th>
              <th style={{ color: "#fff" }}>ITEMS</th>
              <th style={{ color: "#fff" }}>HSN</th>
              <th style={{ color: "#fff" }}>QTY.</th>
              <th style={{ color: "#fff" }}>RATE</th>
              <th style={{ color: "#fff" }}>DISCOUNT</th>
              <th style={{ color: "#fff" }}>TAX</th>
              <th style={{ color: "#fff" }}>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((item) => (
              <tr key={item.id}>
                <td className="agst-td-center">{item.id}</td>
                <td>{ts.capitalize ? item.name.toUpperCase() : item.name}</td>
                <td className="agst-td-center">{item.hsn}</td>
                <td className="agst-td-center" style={{ whiteSpace: "pre-line" }}>{item.qty}</td>
                <td className="agst-td-right">{fmt(item.rate)}</td>
                <td className="agst-td-center">
                  {item.discPct != null ? `${item.discPct}%` : ""}
                  {item.disc != null && <div className="agst-sub">({fmt(item.disc)})</div>}
                </td>
                <td className="agst-td-center">
                  GST<br />{item.taxPct}%
                </td>
                <td className="agst-td-right">{fmt(item.amount)}</td>
              </tr>
            ))}
            <tr className="agst-tax-row">
              <td colSpan={6} className="agst-td-right agst-italic"><em>CGST @9%</em></td>
              <td className="agst-td-center">-</td>
              <td className="agst-td-right">₹ {fmt(inv.cgst)}</td>
            </tr>
            <tr className="agst-tax-row">
              <td colSpan={6} className="agst-td-right agst-italic"><em>SGST @9%</em></td>
              <td className="agst-td-center">-</td>
              <td className="agst-td-right">₹ {fmt(inv.sgst)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="agst-total-row">
              <td colSpan={6} className="agst-td-center"><strong>TOTAL</strong></td>
              <td className="agst-td-center">-</td>
              <td className="agst-td-right"><strong>₹ {fmt(inv.grandTotal)}</strong></td>
            </tr>
            <tr className="agst-received-row">
              <td colSpan={7} className="agst-td-right">RECEIVED AMOUNT</td>
              <td className="agst-td-right">₹ {fmt(inv.receivedAmount)}</td>
            </tr>
            <tr className="agst-balance-row">
              <td colSpan={7} className="agst-td-right">BALANCE AMOUNT</td>
              <td className="agst-td-right agst-balance-val">₹ {fmt(inv.balanceAmount)}</td>
            </tr>
          </tfoot>
        </table>

        {/* HSN Summary */}
        {ts.hsnSummary && (
          <table className="agst-hsn-table">
            <thead>
              <tr>
                <th rowSpan={2}>HSN/SAC</th>
                <th rowSpan={2} className="agst-td-right">Taxable Value</th>
                <th colSpan={2} className="agst-td-center">CGST</th>
                <th colSpan={2} className="agst-td-center">SGST</th>
                <th rowSpan={2} className="agst-td-right">Total Tax Amount</th>
              </tr>
              <tr>
                <th className="agst-td-center agst-sub-th">Rate</th>
                <th className="agst-td-center agst-sub-th">Amount</th>
                <th className="agst-td-center agst-sub-th">Rate</th>
                <th className="agst-td-center agst-sub-th">Amount</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(hsnGroups).map(([hsn, { taxable, cgst, sgst }]) => (
                <tr key={hsn}>
                  <td className="agst-td-right">{hsn}</td>
                  <td className="agst-td-right">{fmt(taxable)}</td>
                  <td className="agst-td-center">9%</td>
                  <td className="agst-td-right">{fmt(cgst)}</td>
                  <td className="agst-td-center">9%</td>
                  <td className="agst-td-right">{fmt(sgst)}</td>
                  <td className="agst-td-right">₹ {fmt(cgst + sgst)}</td>
                </tr>
              ))}
              <tr className="agst-hsn-total">
                <td><strong>Total</strong></td>
                <td className="agst-td-right"><strong>{fmt(totalTaxable)}</strong></td>
                <td></td>
                <td className="agst-td-right"><strong>{fmt(totalCgst)}</strong></td>
                <td></td>
                <td className="agst-td-right"><strong>{fmt(totalSgst)}</strong></td>
                <td className="agst-td-right"><strong>₹ {fmt(totalTax)}</strong></td>
              </tr>
            </tbody>
          </table>
        )}

        {/* Amount in Words */}
        {misc.amountWords && (
          <div className="agst-words-box">
            <strong>Total Amount (in words):</strong> One Lakh Thirty Eight Thousand Sixty Rupees Only
          </div>
        )}

        {/* Notes + Bank */}
        <div className="agst-bottom-grid">
          <div className="agst-notes-cell">
            {misc.showNotes && (
              <>
                <div className="agst-bottom-label">Notes</div>
                {inv.notes && <div className="agst-bottom-text">{inv.notes}</div>}
              </>
            )}
          </div>
          <div className="agst-bank-cell">
            <div className="agst-bottom-label">Bank Details</div>
            {bankFields.map(([k, v]) => (
              <div key={k} className="agst-bottom-text">
                <span style={{ display: "inline-block", minWidth: 80, fontWeight: 600 }}>{k}:</span>{v}
              </div>
            ))}
          </div>
        </div>

        {misc.showTerms && (
          <div className="agst-terms-box">
            <div className="agst-bottom-label">Terms and Conditions</div>
            <div className="agst-bottom-text">{inv.terms}</div>
          </div>
        )}

        {/* Signature footer — enlarged */}
        <div className={`agst-footer${misc.receiverSig ? " dual" : ""}`} style={{ minHeight: 100 }}>
          {misc.receiverSig && (
            <div className="agst-sig-cell agst-sig-left">
              <div className="agst-sig-space" style={{ minHeight: 60 }} />
              <div>Receiver's Signature</div>
            </div>
          )}
          <div className="agst-sig-cell agst-sig-right">
            {misc.signatureUrl && (
              <img src={misc.signatureUrl} alt="sig" className="agst-sig-img"
                style={{ maxHeight: 60, maxWidth: 160, objectFit: "contain", display: "block", margin: "0 auto 6px" }} />
            )}
            {!misc.signatureUrl && <div style={{ minHeight: 60 }} />}
            <div>Authorised Signatory For</div>
            <div><strong>{inv.companyName}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── LUXURY INVOICE PREVIEW ───────────────────────────────────────────────────

const LuxuryPreview: React.FC<{ themeColor?: string; bgImageUrl?: string; bgOpacity?: number; logoUrl?: string; showLogo?: boolean; signatureUrl?: string }> = ({
  themeColor = "#c8a94f", bgImageUrl = "", bgOpacity = 15, logoUrl = "", showLogo = false, signatureUrl = ""
}) => {
  const inv = DEFAULT_INVOICE;
  const det = DEFAULT_DET;
  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const border = `1px solid ${themeColor}`;

  const bankFields = [
    ["Name", inv.bank], ["Bank", inv.bankName], ["A/C No.", inv.accountNo],
    ["Branch", inv.branch], ["IFSC", inv.ifsc]
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div style={{ fontFamily: "Georgia, serif", fontSize: 11, background: "#fff", position: "relative", overflow: "hidden" }}>
      {bgImageUrl && <div style={{ position: "absolute", inset: 0, zIndex: 0, backgroundImage: `url(${bgImageUrl})`, backgroundSize: "cover", backgroundPosition: "center", opacity: bgOpacity / 100, pointerEvents: "none" }} />}
      <div style={{ position: "relative", zIndex: 1, border: `2px solid ${themeColor}`, margin: 8, padding: "0 0 10px" }}>
        {/* Ornamental corners */}
        {[{top:2,left:2},{top:2,right:2},{bottom:2,left:2},{bottom:2,right:2}].map((pos,i) => (
          <div key={i} style={{ position: "absolute", ...pos, width: 16, height: 16, border: `2px solid ${themeColor}`, borderRadius: "50%", background: "#fff" }} />
        ))}

        {/* Header with logo */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "14px 20px 10px", borderBottom: border }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            {showLogo && logoUrl && (
              <img src={logoUrl} alt="Logo"
                style={{ height: 60, width: 60, objectFit: "contain", borderRadius: 4, border: `1px solid ${themeColor}30`, flexShrink: 0 }} />
            )}
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a", letterSpacing: "0.5px" }}>{inv.companyName}</div>
              <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>{inv.address}</div>
              <div style={{ fontSize: 10, color: "#555" }}>GSTIN: {inv.gstin}</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", letterSpacing: "1px" }}>TAX INVOICE</div>
          </div>
        </div>

        {/* Invoice meta */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", borderBottom: border, fontSize: 10 }}>
          {[
            { label: "Invoice No.", val: inv.invoiceNo },
            { label: "Invoice Date", val: inv.date },
            { label: "Due Date", val: inv.dueDate },
            { label: "Financed By", val: det.showFinancedBy ? det.financedBy : "-" },
            { label: "Salesman", val: det.showSalesman ? det.salesman : "-" },
            { label: "Challan No.", val: det.showChallan ? det.challanNo : "-" },
          ].map((f, i) => (
            <div key={i} style={{ padding: "6px 10px", borderRight: i < 5 ? border : "none" }}>
              <div style={{ fontWeight: 700, color: "#444", marginBottom: 2, fontSize: 9 }}>{f.label}</div>
              <div style={{ color: "#1a1a1a" }}>{f.val}</div>
            </div>
          ))}
        </div>
        {(det.showChallan || det.showWarranty) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: border, fontSize: 10 }}>
            <div style={{ padding: "5px 10px", borderRight: border }}>
              <span style={{ fontWeight: 700, color: "#444" }}>Challan No. </span>{det.showChallan ? det.challanNo : "-"}
            </div>
            <div style={{ padding: "5px 10px" }}>
              <span style={{ fontWeight: 700, color: "#444" }}>Warranty Period </span>{det.showWarranty ? det.warrantyPeriod : "-"}
            </div>
          </div>
        )}

        {/* Bill To */}
        <div style={{ padding: "8px 20px", borderBottom: border }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: themeColor, marginBottom: 3 }}>Bill To</div>
          <div style={{ fontWeight: 700, fontSize: 12 }}>{inv.billTo.name}</div>
          {inv.billTo.address && <div style={{ color: "#444", fontSize: 10 }}>{inv.billTo.address}</div>}
          <div style={{ color: "#444", fontSize: 10 }}><strong>Mobile</strong> {inv.billTo.mobile}</div>
        </div>

        {/* Items table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
          <thead>
            <tr style={{ background: `${themeColor}15` }}>
              {["No", "Items", "Qty.", "Rate", "Disc.", "Tax", "Total"].map((h, i) => (
                <th key={h} style={{ padding: "6px 8px", fontWeight: 700, color: "#333", borderBottom: border, borderTop: "none", textAlign: i >= 2 ? "right" : "left", fontSize: 10 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inv.items.map((item) => (
              <tr key={item.id} style={{ borderBottom: `1px solid ${themeColor}30` }}>
                <td style={{ padding: "6px 8px" }}>{item.id}</td>
                <td style={{ padding: "6px 8px" }}>{item.name}</td>
                <td style={{ padding: "6px 8px", textAlign: "right" }}>{item.qty}</td>
                <td style={{ padding: "6px 8px", textAlign: "right" }}>{fmt(item.rate)}</td>
                <td style={{ padding: "6px 8px", textAlign: "right" }}>
                  {fmt(item.disc ?? 0)}<br /><span style={{ fontSize: 9, color: "#777" }}>({item.discPct}%)</span>
                </td>
                <td style={{ padding: "6px 8px", textAlign: "right" }}>
                  {fmt(item.tax)}<br /><span style={{ fontSize: 9, color: "#777" }}>({item.taxPct}%)</span>
                </td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600 }}>{fmt(item.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: `${themeColor}15`, borderTop: border }}>
              <td style={{ padding: "6px 8px", fontWeight: 700, fontSize: 11, color: themeColor }}>SUBTOTAL</td>
              <td></td>
              <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>{inv.items.reduce((s,i)=>s+parseInt(i.qty),0)}</td>
              <td></td>
              <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>₹ {fmt(inv.items.reduce((s,i)=>s+(i.disc??0),0))}</td>
              <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>₹ {fmt(inv.cgst + inv.sgst)}</td>
              <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>₹ {fmt(inv.grandTotal)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Footer two-column — full bank details + enlarged signature */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: border, marginTop: 0 }}>
          <div style={{ padding: "10px 16px", borderRight: border, fontSize: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Terms & Conditions</div>
            <div style={{ color: "#444", marginBottom: 12, lineHeight: 1.6 }}>{inv.terms}</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Bank Details</div>
            {bankFields.map(([k,v]) => (
              <div key={k} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
                <span style={{ color: themeColor, fontWeight: 700, minWidth: 60, flexShrink: 0 }}>{k}</span>
                <span style={{ color: "#333" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: "10px 16px", fontSize: 10 }}>
            {[
              ["Taxable Amount", inv.subtotal - (inv.cgst + inv.sgst)],
              ["CGST @9%", inv.cgst],
              ["SGST @9%", inv.sgst],
            ].map(([k,v]) => (
              <div key={String(k)} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ color: "#444" }}>{k}</span>
                <span>₹ {fmt(Number(v))}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 12, borderTop: border, paddingTop: 4, marginTop: 4 }}>
              <span>Total Amount</span><span>₹ {fmt(inv.grandTotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, color: "#555" }}>
              <span>Received Amount</span><span>₹ {fmt(inv.receivedAmount)}</span>
            </div>
            <div style={{ marginTop: 6, fontSize: 10 }}>
              <div style={{ fontWeight: 700 }}>Total Amount (in words)</div>
              <div style={{ color: "#444" }}>One Lakh Thirty Eight Thousand Sixty Rupees Only</div>
            </div>
            {/* Signature box — enlarged */}
            <div style={{ border: `1px solid ${themeColor}60`, borderRadius: 4, marginTop: 12, minHeight: 130, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "12px 8px 10px" }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%", minHeight: 80 }}>
                {signatureUrl && <img src={signatureUrl} alt="sig" style={{ maxHeight: 80, maxWidth: 160, objectFit: "contain", display: "block" }} />}
              </div>
              <div style={{ textAlign: "center", fontSize: 9, marginTop: 8 }}>
                <div style={{ color: "#555" }}>Authorised Signatory</div>
                <div style={{ fontWeight: 600, color: themeColor }}>{inv.companyName}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── STYLISH INVOICE PREVIEW ──────────────────────────────────────────────────

const StylishPreview: React.FC<{ themeColor?: string; bgImageUrl?: string; bgOpacity?: number; logoUrl?: string; showLogo?: boolean; signatureUrl?: string }> = ({
  themeColor = "#000000", bgImageUrl = "", bgOpacity = 15, logoUrl = "", showLogo = false, signatureUrl = ""
}) => {
  const inv = DEFAULT_INVOICE;
  const det = DEFAULT_DET;
  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const accent = themeColor === "#000000" ? "#1a1a1a" : themeColor;

  const bankFields = [
    ["Name:", inv.bank], ["Bank:", inv.bankName], ["A/C No:", inv.accountNo],
    ["Branch:", inv.branch], ["IFSC Code:", inv.ifsc]
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, background: "#fff", padding: "14px 18px 16px", position: "relative", overflow: "hidden" }}>
      {bgImageUrl && <div style={{ position: "absolute", inset: 0, zIndex: 0, backgroundImage: `url(${bgImageUrl})`, backgroundSize: "cover", backgroundPosition: "center", opacity: bgOpacity / 100, pointerEvents: "none" }} />}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Badges */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10, fontSize: 10 }}>
          <span style={{ border: "1px solid #333", padding: "2px 8px", fontWeight: 700 }}>TAX INVOICE</span>
          <span style={{ border: "1px solid #aaa", padding: "2px 8px", color: "#555" }}>ORIGINAL FOR RECIPIENT</span>
        </div>

        {/* Logo + company name */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
          {showLogo && logoUrl && (
            <img src={logoUrl} alt="Logo"
              style={{ height: 56, width: 56, objectFit: "contain", borderRadius: 4, border: "1px solid #eee", flexShrink: 0 }} />
          )}
          <div style={{ fontSize: 22, fontWeight: 700, color: accent, letterSpacing: "0.3px" }}>{inv.companyName}</div>
        </div>

        {/* Thick separator */}
        <div style={{ height: 3, background: accent, marginBottom: 0 }} />

        {/* Invoice meta */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#f5f5f5", padding: "8px 12px", borderBottom: "1px solid #ddd", fontSize: 10 }}>
          <div><strong>Invoice No.:</strong> {inv.invoiceNo}</div>
          <div><strong>Invoice Date:</strong> {inv.date}</div>
          <div><strong>Due Date:</strong> {inv.dueDate}</div>
        </div>

        {/* Bill To + details */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "8px 12px", borderBottom: "1px solid #ddd", gap: 16, fontSize: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 2 }}>BILL TO</div>
            <div style={{ fontWeight: 700, fontSize: 12 }}>{inv.billTo.name}</div>
            <div style={{ color: "#555" }}>{inv.billTo.address}</div>
            <div style={{ color: "#555" }}>Mobile: {inv.billTo.mobile}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 3 }}>
            {det.showFinancedBy && <><div style={{ fontWeight: 700 }}>Financed By</div><div style={{ textAlign: "right" }}>{det.financedBy}</div></>}
            {det.showSalesman && <><div style={{ fontWeight: 700 }}>Salesman</div><div style={{ textAlign: "right" }}>{det.salesman}</div></>}
            {det.showChallan && <><div style={{ fontWeight: 700 }}>Challan No.</div><div style={{ textAlign: "right" }}>{det.challanNo}</div></>}
            {det.showWarranty && <><div style={{ fontWeight: 700 }}>Warranty Period</div><div style={{ textAlign: "right" }}>{det.warrantyPeriod}</div></>}
          </div>
        </div>

        {/* Items table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${accent}` }}>
              {["ITEMS", "QTY.", "RATE", "DISC.", "TAX", "AMOUNT"].map((h, i) => (
                <th key={h} style={{ padding: "7px 8px", fontWeight: 700, textAlign: i > 0 ? "right" : "left", background: "none", border: "none", fontSize: 10 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inv.items.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #e5e5e5" }}>
                <td style={{ padding: "6px 8px" }}>{item.name}</td>
                <td style={{ padding: "6px 8px", textAlign: "right" }}>{item.qty}</td>
                <td style={{ padding: "6px 8px", textAlign: "right" }}>{fmt(item.rate)}</td>
                <td style={{ padding: "6px 8px", textAlign: "right" }}>
                  {fmt(item.disc ?? 0)}<br /><span style={{ fontSize: 9, color: "#777" }}>({item.discPct}%)</span>
                </td>
                <td style={{ padding: "6px 8px", textAlign: "right" }}>
                  {fmt(item.tax)}<br /><span style={{ fontSize: 9, color: "#777" }}>({item.taxPct}%)</span>
                </td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600 }}>{fmt(item.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: `2px solid ${accent}`, borderBottom: "1px solid #ccc" }}>
              <td style={{ padding: "6px 8px", fontWeight: 700 }}>SUBTOTAL</td>
              <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>{inv.items.reduce((s,i)=>s+parseInt(i.qty),0)}</td>
              <td></td>
              <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>₹ {fmt(inv.items.reduce((s,i)=>s+(i.disc??0),0))}</td>
              <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>₹ {fmt(inv.cgst + inv.sgst)}</td>
              <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>₹ {fmt(inv.grandTotal)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Footer two columns — full bank details + enlarged signature */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginTop: 8, gap: 16, fontSize: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 6 }}>BANK DETAILS</div>
            {bankFields.map(([k,v]) => (
              <div key={k} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
                <span style={{ minWidth: 72, color: "#555", flexShrink: 0 }}>{k}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
            <div style={{ fontWeight: 700, fontSize: 11, marginTop: 10, marginBottom: 4 }}>TERMS AND CONDITIONS</div>
            <div style={{ color: "#555", lineHeight: 1.6 }}>{inv.terms}</div>
          </div>
          <div>
            {[
              ["Taxable Amount", inv.subtotal - (inv.cgst + inv.sgst)],
              ["CGST @9%", inv.cgst],
              ["SGST @9%", inv.sgst],
            ].map(([k,v]) => (
              <div key={String(k)} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ color: "#444" }}>{k}</span>
                <span>₹ {fmt(Number(v))}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 12, borderTop: "1px solid #333", paddingTop: 4, marginTop: 4 }}>
              <span>Total Amount</span><span>₹ {fmt(inv.grandTotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, color: "#555" }}>
              <span>Received Amount</span><span>₹ {fmt(inv.receivedAmount)}</span>
            </div>
            <div style={{ textAlign: "right", marginTop: 4 }}>
              <div style={{ fontSize: 10, color: "#555" }}>Total Amount (in words)</div>
              <div style={{ fontWeight: 500 }}>One Lakh Thirty Eight Thousand Sixty Rupees</div>
            </div>
            {/* Signature box — enlarged */}
            <div style={{ border: "1px solid #ccc", borderRadius: 2, marginTop: 12, minHeight: 100, display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", padding: "10px 8px 6px" }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", width: "100%" }}>
                {signatureUrl && <img src={signatureUrl} alt="sig" style={{ maxHeight: 60, maxWidth: 140, objectFit: "contain", display: "block" }} />}
                {!signatureUrl && <div style={{ minHeight: 50 }} />}
              </div>
              <div style={{ textAlign: "right", fontSize: 9, marginTop: 8 }}>
                <div style={{ fontWeight: 700 }}>AUTHORISED SIGNATORY FOR</div>
                <div style={{ color: accent }}>{inv.companyName}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── SIMPLE INVOICE PREVIEW ──────────────────────────────────────────────────

const SimplePreview: React.FC<{ themeColor?: string; bgImageUrl?: string; bgOpacity?: number; logoUrl?: string; showLogo?: boolean; signatureUrl?: string }> = ({
  themeColor = "#868e96", bgImageUrl = "", bgOpacity = 15, logoUrl = "", showLogo = false, signatureUrl = ""
}) => {
  const inv = DEFAULT_INVOICE;
  const det = DEFAULT_DET;
  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const accent = themeColor === "#000000" ? "#868e96" : themeColor;

  const bankFields = [
    ["Name:", inv.bank], ["Bank:", inv.bankName], ["A/C No:", inv.accountNo],
    ["Branch:", inv.branch], ["IFSC Code:", inv.ifsc]
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, background: "#fff", padding: "18px 20px 20px", position: "relative", overflow: "hidden" }}>
      {bgImageUrl && <div style={{ position: "absolute", inset: 0, zIndex: 0, backgroundImage: `url(${bgImageUrl})`, backgroundSize: "cover", backgroundPosition: "center", opacity: bgOpacity / 100, pointerEvents: "none" }} />}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Badges */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10, fontSize: 10 }}>
          <span style={{ border: "1px solid #333", padding: "2px 8px", fontWeight: 700 }}>TAX INVOICE</span>
          <span style={{ border: "1px solid #aaa", padding: "2px 8px", color: "#555" }}>ORIGINAL FOR RECIPIENT</span>
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, paddingBottom: 10, borderBottom: `2px solid ${accent}`, marginBottom: 10 }}>
          {showLogo && logoUrl && (
            <img src={logoUrl} alt="Logo" style={{ height: 52, width: 52, objectFit: "contain", borderRadius: 4, border: "1px solid #eee", flexShrink: 0 }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: accent }}>{inv.companyName}</div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>{inv.address}</div>
            <div style={{ fontSize: 10, color: "#555" }}>GSTIN: {inv.gstin}</div>
          </div>
          <div style={{ textAlign: "right", fontSize: 10, flexShrink: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#111", marginBottom: 4 }}>Invoice #{inv.invoiceNo}</div>
            <div style={{ color: "#555" }}>Date: {inv.date}</div>
            <div style={{ color: "#555" }}>Due: {inv.dueDate}</div>
          </div>
        </div>

        {/* Meta */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 18px", fontSize: 10, paddingBottom: 8, borderBottom: "1px solid #eee", marginBottom: 10 }}>
          {det.showFinancedBy && <span><strong>Financed By:</strong> {det.financedBy}</span>}
          {det.showSalesman && <span><strong>Salesman:</strong> {det.salesman}</span>}
          {det.showChallan && <span><strong>Challan No.:</strong> {det.challanNo}</span>}
          {det.showWarranty && <span><strong>Warranty:</strong> {det.warrantyPeriod}</span>}
        </div>

        {/* Bill To */}
        <div style={{ fontSize: 10, marginBottom: 12, padding: "8px 10px", background: "#f9f9f9", borderRadius: 4, borderLeft: `3px solid ${accent}` }}>
          <div style={{ fontWeight: 700, color: accent, marginBottom: 3, textTransform: "uppercase" as const, fontSize: 9, letterSpacing: "0.5px" }}>Bill To</div>
          <div style={{ fontWeight: 700, fontSize: 12 }}>{inv.billTo.name}</div>
          <div style={{ color: "#555" }}>{inv.billTo.address}</div>
          <div style={{ color: "#555" }}>Mobile: {inv.billTo.mobile}</div>
        </div>

        {/* Items table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10, marginBottom: 10 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${accent}`, borderTop: `1px solid ${accent}` }}>
              {["Items", "Qty.", "Rate", "Disc.", "Tax", "Amount"].map((h, i) => (
                <th key={h} style={{ padding: "6px 8px", fontWeight: 700, textAlign: i >= 1 ? "right" : "left", fontSize: 10 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inv.items.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "5px 8px", fontWeight: 600 }}>{item.name}</td>
                <td style={{ padding: "5px 8px", textAlign: "right" }}>{item.qty}</td>
                <td style={{ padding: "5px 8px", textAlign: "right" }}>{fmt(item.rate)}</td>
                <td style={{ padding: "5px 8px", textAlign: "right" }}>{fmt(item.disc ?? 0)}<br/><span style={{ fontSize:9, color:"#777" }}>({item.discPct}%)</span></td>
                <td style={{ padding: "5px 8px", textAlign: "right" }}>{fmt(item.tax)}<br/><span style={{ fontSize:9, color:"#777" }}>({item.taxPct}%)</span></td>
                <td style={{ padding: "5px 8px", textAlign: "right", fontWeight: 600 }}>{fmt(item.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: `2px solid ${accent}` }}>
              <td colSpan={5} style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>Grand Total</td>
              <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, color: accent }}>₹ {fmt(inv.grandTotal)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Footer */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 11, color: accent, marginBottom: 5 }}>BANK DETAILS</div>
            {bankFields.map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 6, marginBottom: 2 }}>
                <span style={{ minWidth: 72, color: "#777", flexShrink: 0 }}>{k}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
            <div style={{ fontWeight: 700, fontSize: 11, color: accent, marginTop: 10, marginBottom: 4 }}>TERMS AND CONDITIONS</div>
            <div style={{ color: "#555", lineHeight: 1.6 }}>{inv.terms}</div>
          </div>
          <div>
            {[["CGST @9%", inv.cgst], ["SGST @9%", inv.sgst]].map(([k, v]) => (
              <div key={String(k)} style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ color: "#555" }}>{k}</span><span>₹ {fmt(Number(v))}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 11, borderTop: `1px solid ${accent}`, paddingTop: 4, marginTop: 4 }}>
              <span>Total Amount</span><span style={{ color: accent }}>₹ {fmt(inv.grandTotal)}</span>
            </div>
            <div style={{ fontSize: 10, marginTop: 6 }}>
              <div style={{ fontWeight: 700 }}>Amount in words</div>
              <div style={{ color: "#555" }}>One Lakh Thirty Eight Thousand Sixty Rupees Only</div>
            </div>
            {/* Signature box */}
            <div style={{ marginTop: 14, minHeight: 100, display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", borderTop: "1px dashed #ccc", paddingTop: 10 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", width: "100%" }}>
                {signatureUrl && <img src={signatureUrl} alt="sig" style={{ maxHeight: 60, maxWidth: 140, objectFit: "contain", display: "block" }} />}
              </div>
              <div style={{ textAlign: "right", fontSize: 9, marginTop: 8 }}>
                <div style={{ fontWeight: 700 }}>Authorised Signatory For</div>
                <div style={{ color: accent }}>{inv.companyName}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MODERN INVOICE PREVIEW ───────────────────────────────────────────────────

const ModernPreview: React.FC<{ themeColor?: string; bgImageUrl?: string; bgOpacity?: number; logoUrl?: string; showLogo?: boolean; signatureUrl?: string }> = ({
  themeColor = "#e8590c", bgImageUrl = "", bgOpacity = 15, logoUrl = "", showLogo = false, signatureUrl = ""
}) => {
  const inv = DEFAULT_INVOICE;
  const det = DEFAULT_DET;
  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const accent = themeColor === "#000000" ? "#e8590c" : themeColor;

  const bankFields = [
    ["Name:", inv.bank], ["Bank:", inv.bankName], ["A/C No:", inv.accountNo],
    ["Branch:", inv.branch], ["IFSC Code:", inv.ifsc]
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, background: "#fff", position: "relative", overflow: "hidden" }}>
      {bgImageUrl && <div style={{ position: "absolute", inset: 0, zIndex: 0, backgroundImage: `url(${bgImageUrl})`, backgroundSize: "cover", backgroundPosition: "center", opacity: bgOpacity / 100, pointerEvents: "none" }} />}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Colored banner header */}
        <div style={{ background: accent, padding: "16px 22px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {showLogo && logoUrl && (
              <img src={logoUrl} alt="Logo" style={{ height: 56, width: 56, objectFit: "contain", borderRadius: 4, border: "2px solid rgba(255,255,255,0.4)", flexShrink: 0, background: "rgba(255,255,255,0.15)" }} />
            )}
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "0.3px" }}>{inv.companyName}</div>
              <div style={{ fontSize: 10, opacity: 0.85, marginTop: 3 }}>{inv.address}</div>
              <div style={{ fontSize: 10, opacity: 0.85 }}>GSTIN: {inv.gstin}</div>
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "1px", opacity: 0.9 }}>TAX INVOICE</div>
            <div style={{ fontSize: 10, marginTop: 4 }}>
              <div><strong>Invoice No.:</strong> {inv.invoiceNo}</div>
              <div><strong>Date:</strong> {inv.date}</div>
              <div><strong>Due Date:</strong> {inv.dueDate}</div>
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div style={{ background: `${accent}18`, padding: "6px 22px", fontSize: 10, display: "flex", flexWrap: "wrap", gap: "4px 20px", borderBottom: `1px solid ${accent}30` }}>
          {det.showFinancedBy && <span><strong>Financed By:</strong> {det.financedBy}</span>}
          {det.showSalesman && <span><strong>Salesman:</strong> {det.salesman}</span>}
          {det.showChallan && <span><strong>Challan No.:</strong> {det.challanNo}</span>}
          {det.showWarranty && <span><strong>Warranty:</strong> {det.warrantyPeriod}</span>}
        </div>

        {/* Bill To */}
        <div style={{ padding: "10px 22px", borderBottom: "1px solid #eee", fontSize: 10 }}>
          <div style={{ fontWeight: 700, color: accent, fontSize: 9, textTransform: "uppercase" as const, letterSpacing: "0.5px", marginBottom: 3 }}>Bill To</div>
          <div style={{ fontWeight: 700, fontSize: 12 }}>{inv.billTo.name}</div>
          <div style={{ color: "#555" }}>{inv.billTo.address}</div>
          <div style={{ color: "#555" }}>Mobile: {inv.billTo.mobile}</div>
        </div>

        {/* Items table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
          <thead>
            <tr style={{ background: accent, color: "#fff" }}>
              {["Items", "Qty.", "Rate", "Disc.", "Tax", "Amount"].map((h, i) => (
                <th key={h} style={{ padding: "7px 8px", fontWeight: 700, textAlign: i >= 1 ? "right" : "left", color: "#fff", fontSize: 10 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inv.items.map((item, i) => (
              <tr key={item.id} style={{ background: i % 2 === 0 ? "#fff" : `${accent}08`, borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "6px 8px", fontWeight: 600 }}>{item.name}</td>
                <td style={{ padding: "6px 8px", textAlign: "right" }}>{item.qty}</td>
                <td style={{ padding: "6px 8px", textAlign: "right" }}>{fmt(item.rate)}</td>
                <td style={{ padding: "6px 8px", textAlign: "right" }}>{fmt(item.disc ?? 0)}<br/><span style={{ fontSize:9, color:"#777" }}>({item.discPct}%)</span></td>
                <td style={{ padding: "6px 8px", textAlign: "right" }}>{fmt(item.tax)}<br/><span style={{ fontSize:9, color:"#777" }}>({item.taxPct}%)</span></td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600 }}>{fmt(item.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: `${accent}18`, borderTop: `2px solid ${accent}` }}>
              <td colSpan={5} style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>Grand Total</td>
              <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, color: accent }}>₹ {fmt(inv.grandTotal)}</td>
            </tr>
            <tr>
              <td colSpan={5} style={{ padding: "4px 8px", textAlign: "right", color: "#555" }}>Received Amount</td>
              <td style={{ padding: "4px 8px", textAlign: "right" }}>₹ {fmt(inv.receivedAmount)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Footer */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: "12px 22px", fontSize: 10, borderTop: `2px solid ${accent}` }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 11, color: accent, marginBottom: 5 }}>BANK DETAILS</div>
            {bankFields.map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
                <span style={{ minWidth: 72, color: "#777", flexShrink: 0 }}>{k}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
            <div style={{ fontWeight: 700, fontSize: 11, color: accent, marginTop: 10, marginBottom: 4 }}>TERMS AND CONDITIONS</div>
            <div style={{ color: "#555", lineHeight: 1.6 }}>{inv.terms}</div>
          </div>
          <div>
            {[["Taxable Amount", inv.subtotal - (inv.cgst + inv.sgst)], ["CGST @9%", inv.cgst], ["SGST @9%", inv.sgst]].map(([k, v]) => (
              <div key={String(k)} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ color: "#444" }}>{k}</span><span>₹ {fmt(Number(v))}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 12, borderTop: `1px solid ${accent}`, paddingTop: 4, marginTop: 4 }}>
              <span>Total Amount</span><span style={{ color: accent }}>₹ {fmt(inv.grandTotal)}</span>
            </div>
            <div style={{ fontSize: 10, marginTop: 6 }}>
              <div style={{ fontWeight: 700 }}>Amount in words</div>
              <div style={{ color: "#555" }}>One Lakh Thirty Eight Thousand Sixty Rupees Only</div>
            </div>
            {/* Signature box */}
            <div style={{ marginTop: 14, minHeight: 100, display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", borderTop: "1px dashed #ccc", paddingTop: 10 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", width: "100%" }}>
                {signatureUrl && <img src={signatureUrl} alt="sig" style={{ maxHeight: 60, maxWidth: 140, objectFit: "contain", display: "block" }} />}
              </div>
              <div style={{ textAlign: "right", fontSize: 9, marginTop: 8 }}>
                <div style={{ fontWeight: 700 }}>Authorised Signature for</div>
                <div style={{ color: accent }}>{inv.companyName}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── THEME THUMBNAIL ──────────────────────────────────────────────────────────

const ThemeThumbnail: React.FC<{ name: string; color: string; isNew?: boolean; selected: boolean; onClick: () => void }> = ({ name, color, isNew, selected, onClick }) => (
  <div className={`ht-card${selected ? " selected" : ""}`} onClick={onClick}>
    {isNew && <span className="ht-new-badge">NEW</span>}
    <div className="ht-preview">
      <div className="ht-preview-header" style={{ background: color }} />
      <div className="ht-preview-body">
        <div className="ht-line long" />
        <div className="ht-line med" />
        <div className="ht-row2">
          <div className="ht-col" /><div className="ht-col" />
        </div>
        <div className="ht-table-head" style={{ background: color, opacity: 0.7 }} />
        {[0,1,2].map(i => <div key={i} className="ht-table-row"><div className="ht-line" style={{ width: `${40+i*15}%` }} /><div className="ht-line short" /></div>)}
        <div className="ht-total-line"><div className="ht-total-val" style={{ background: color, opacity: 0.5 }} /></div>
      </div>
    </div>
    <div className="ht-label">{name}</div>
  </div>
);

// ─── HOME PAGE ────────────────────────────────────────────────────────────────

interface HomePageProps {
  savedTemplates: SavedTemplate[];
  onCreateOwn: () => void;
  onUse: (t: SavedTemplate) => void;
  onDelete: (id: string) => void;
  onSaved: (t: SavedTemplate) => void;
}

const HomePage: React.FC<HomePageProps> = ({ savedTemplates, onCreateOwn, onUse, onDelete, onSaved }) => {
  const [selectedTheme, setSelectedTheme] = useState("advanced-gst");
  const [showAllThemes, setShowAllThemes] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLOR_SWATCHES[0]);
  const [bgImageUrl, setBgImageUrl] = useState("");
  const [bgOpacity, setBgOpacity] = useState(15);
  const bgInputRef = React.useRef<HTMLInputElement>(null);
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [showLogo, setShowLogo] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState("");
  const sigInputRef = React.useRef<HTMLInputElement>(null);

  const [themeSettings, setThemeSettings] = useState<HomeThemeSettings>({
    showPartyBalance: false, enableFreeItemQty: false, showItemDesc: false,
    showAlternateUnit: false, showPhoneOnInvoice: false, showTime: false,
    priceHistory: false, autoLuxury: false,
  });
  const [invDetOpen, setInvDetOpen] = useState(false);
  const [partyDetOpen, setPartyDetOpen] = useState(false);
  const [itemColOpen, setItemColOpen] = useState(false);
  const [miscOpen, setMiscOpen] = useState(false);

  const [invDet, setInvDet] = useState({
    challan: true, dispatched: false, email: false, financed: true,
    salesman: true, transport: false, warranty: true, po: false, eway: true, vehicle: false,
  });
  type InvDetKey = keyof typeof invDet;

  const [partyCustomFields, setPartyCustomFields] = useState<{ label: string; value: string }[]>([]);
  const [addingPartyField, setAddingPartyField] = useState(false);
  const [newPartyField, setNewPartyField] = useState({ label: "", value: "" });

  const [itemCols, setItemCols] = useState({ priceItem: true, quantity: true, batchNo: false, expDate: false, mfgDate: false });
  type ItemColKey = keyof typeof itemCols;
  const [addingItemCol, setAddingItemCol] = useState(false);
  const [newItemCol, setNewItemCol] = useState("");

  const [termsText, setTermsText] = useState("1. Goods once sold will not be taken back or exchanged after 7 days");
  const [enableReceiverSig, setEnableReceiverSig] = useState(false);

  const toggleTS = (k: keyof HomeThemeSettings) => setThemeSettings(s => ({ ...s, [k]: !s[k] }));
  const visibleThemes = showAllThemes ? THEME_CARDS : THEME_CARDS.slice(0, 4);

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setBgImageUrl(URL.createObjectURL(file));
  };
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setLogoUrl(URL.createObjectURL(file)); setShowLogo(true); }
  };
  const handleSigUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSignatureUrl(URL.createObjectURL(file));
  };

  const renderPreview = () => {
    const previewProps = { themeColor: selectedColor, bgImageUrl, bgOpacity, logoUrl, showLogo, signatureUrl };
    if (selectedTheme === "luxury")  return <LuxuryPreview {...previewProps} />;
    if (selectedTheme === "stylish") return <StylishPreview {...previewProps} />;
    if (selectedTheme === "simple")  return <SimplePreview {...previewProps} />;
    if (selectedTheme === "modern")  return <ModernPreview {...previewProps} />;
    return <AdvancedGSTPreview inv={DEFAULT_INVOICE} det={DEFAULT_DET} pv={DEFAULT_PV} vis={DEFAULT_VIS} ts={DEFAULT_TS} misc={{ ...DEFAULT_MISC, signatureUrl }} themeColor={selectedColor} bgImageUrl={bgImageUrl} bgOpacity={bgOpacity} logoUrl={logoUrl} showLogo={showLogo} />;
  };

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveChanges = () => {
    const t: SavedTemplate = {
      id: "active-home-settings",
      name: "Active Invoice Settings",
      themeColor: selectedColor,
      themeLayout: selectedTheme,
      bgImageUrl: bgImageUrl,
      bgOpacity: bgOpacity,
      createdAt: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      inv: DEFAULT_INVOICE,
      style: { ...DEFAULT_STYLE, themeColor: selectedColor, logoUrl, showLogo },
      vis: DEFAULT_VIS,
      det: DEFAULT_DET,
      pv: DEFAULT_PV,
      ts: { ...DEFAULT_TS, backgroundUrl: bgImageUrl, backgroundOpacity: bgOpacity },
      misc: { ...DEFAULT_MISC, signatureUrl },
    };
    onSaved(t);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="hp-root">
      {/* LEFT: invoice preview */}
      <div className="hp-left">
        <div className="hp-preview-scroll">
          {renderPreview()}
        </div>
        {savedTemplates.length > 0 && (
          <div className="hp-saved">
            <div className="hp-saved-title">Your Saved Templates</div>
            {savedTemplates.map(t => (
              <div key={t.id} className="hp-saved-item" onClick={() => onUse(t)}>
                <span className="hp-saved-dot" style={{ background: t.themeColor }} />
                <div className="hp-saved-info">
                  <div className="hp-saved-name">{t.name}</div>
                  <div className="hp-saved-date">{t.createdAt}</div>
                </div>
                <div className="hp-saved-actions">
                  <button className="hp-saved-edit" type="button" onClick={e => { e.stopPropagation(); onUse(t); }}>Edit</button>
                  <button className="hp-saved-del" type="button" onClick={e => { e.stopPropagation(); onDelete(t.id); }}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: settings */}
      <div className="hp-right">
        <div className="hp-right-topbar">
          <div className="hp-right-title">Invoice Settings</div>
          <button
            className={`hp-save-btn${saveSuccess ? " hp-save-btn--success" : ""}`}
            type="button"
            onClick={handleSaveChanges}
          >
            {saveSuccess ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>

        <div className="hp-right-scroll">
          {/* Themes */}
          <div className="hp-section">
            <div className="hp-section-header">
              <span className="hp-radio-dot">⊙</span>
              <span className="hp-section-title">Themes</span>
            </div>
            <div className="ht-grid">
              {visibleThemes.map(t => (
                <ThemeThumbnail key={t.id} name={t.name} color={t.color} isNew={t.isNew} selected={selectedTheme === t.id} onClick={() => setSelectedTheme(t.id)} />
              ))}
            </div>
            <button className="hp-see-all-btn" type="button" onClick={() => setShowAllThemes(v => !v)}>
              {showAllThemes ? "Show Less" : "See All"}
            </button>
          </div>

          {/* Logo Upload — active, shows in preview */}
          <div className="hp-section">
            <div className="hp-ts2-header">
              <span className="hp-ts2-title">Company Logo</span>
              {showLogo && logoUrl && (
                <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600, background: "#dcfce7", padding: "2px 8px", borderRadius: 20 }}>Active</span>
              )}
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoUpload} />
            {logoUrl ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 10, background: "#fafafa" }}>
                <img src={logoUrl} alt="logo" style={{ height: 52, width: 52, objectFit: "contain", borderRadius: 6, border: "1px solid #e5e7eb" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 4 }}>Logo uploaded</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={() => logoInputRef.current?.click()}
                      style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "pointer", color: "#374151" }}>
                      Change
                    </button>
                    <button type="button" onClick={() => { setLogoUrl(""); setShowLogo(false); }}
                      style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #fca5a5", borderRadius: 6, background: "#fff", cursor: "pointer", color: "#dc2626" }}>
                      Remove
                    </button>
                  </div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer", userSelect: "none" }}>
                  <input type="checkbox" checked={showLogo} onChange={e => setShowLogo(e.target.checked)}
                    style={{ width: 14, height: 14, accentColor: "#4f46e5" }} />
                  Show on invoice
                </label>
              </div>
            ) : (
              <button className="hp-bg-upload-btn" type="button" onClick={() => logoInputRef.current?.click()}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "12px 16px", border: "2px dashed #d1d5db", borderRadius: 10, background: "#fafafa", cursor: "pointer", fontSize: 13, color: "#6b7280", fontWeight: 500 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Upload Company Logo
              </button>
            )}
            {logoUrl && (
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 6, lineHeight: 1.4 }}>
                PNG, JPEG supported. Logo appears next to company name on all invoice themes.
              </div>
            )}
          </div>

          {/* Background Image */}
          <div className="hp-section">
            <div className="hp-ts2-header">
              <span className="hp-ts2-title">Background Image</span>
            </div>
            <input ref={bgInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleBgUpload} />
            <button className="hp-bg-upload-btn" type="button" onClick={() => bgInputRef.current?.click()}>
              {bgImageUrl ? "🖼 Change Background Image" : "🖼 Upload Background Image"}
            </button>
            {bgImageUrl && (
              <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <img src={bgImageUrl} alt="bg" style={{ height: 36, width: 56, objectFit: "cover", borderRadius: 4, border: "1px solid #ddd" }} />
                <button type="button" className="hp-del-icon" onClick={() => setBgImageUrl("")} style={{ fontSize: 20 }}>×</button>
              </div>
            )}
            {bgImageUrl && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#333", marginBottom: 6 }}>Opacity: {bgOpacity}%</div>
                <input type="range" min={5} max={80} value={bgOpacity} style={{ width: "100%", accentColor: "#5b5fc7" }} onChange={e => setBgOpacity(Number(e.target.value))} />
              </div>
            )}
          </div>

          {/* Create Custom Theme */}
          <div className="hp-section">
            <div className="hp-custom-theme-row">
              <input type="radio" className="hp-radio" id="custom-radio" />
              <label htmlFor="custom-radio" className="hp-custom-theme-label">Create Custom Theme</label>
              <span className="hp-info-icon" title="Create your own custom theme">ⓘ</span>
            </div>
            <button className="hp-create-own-btn" type="button" onClick={onCreateOwn}>
              Create your own theme
            </button>
            <div className="hp-color-section-label">Select Color</div>
            <div className="hp-color-row">
              {COLOR_SWATCHES.map(c => (
                <button key={c} type="button" className={`hp-color-swatch${selectedColor === c ? " selected" : ""}`} style={{ background: c }} onClick={() => setSelectedColor(c)}>
                  {selectedColor === c && <span className="hp-swatch-check">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Settings */}
          <div className="hp-section">
            <div className="hp-ts2-header">
              <span className="hp-ts2-title">Theme Settings</span>
              <span className="hp-new-badge">New</span>
            </div>
            {([
              { key: "showPartyBalance",    label: "Show party balance in invoice" },
              { key: "enableFreeItemQty",   label: "Enable free item quantity" },
              { key: "showItemDesc",        label: "Show item description in invoice" },
              { key: "showAlternateUnit",   label: "Show Alternate Unit in Invoice" },
              { key: "showPhoneOnInvoice",  label: "Show phone number on Invoice" },
              { key: "showTime",            label: "Show time on Invoices" },
              { key: "priceHistory",        label: "Price History" },
              { key: "autoLuxury",          label: "Auto-apply luxury theme for sharing" },
            ] as { key: keyof HomeThemeSettings; label: string }[]).map(({ key, label }) => (
              <label key={key} className="hp-check-row">
                <input type="checkbox" checked={themeSettings[key]} onChange={() => toggleTS(key)} className="hp-check-box" />
                <span className="hp-check-label">{label}</span>
              </label>
            ))}
          </div>

          {/* Invoice Details */}
          <div className="hp-collapse-wrap">
            <button className="hp-collapse-btn" type="button" onClick={() => setInvDetOpen(o => !o)}>
              <span className="hp-collapse-title">Invoice Details</span>
              <span className={`hp-collapse-chevron${invDetOpen ? " open" : ""}`}>∨</span>
            </button>
            {invDetOpen && (
              <div className="hp-collapse-body">
                <div className="hp-field-group">
                  <label className="hp-field-label">Industry Type</label>
                  <select className="hp-field-select">
                    <option>Electronics</option><option>General</option><option>Retail</option><option>Services</option>
                  </select>
                </div>
                {([
                  { key: "challan", label: "Challan No." },
                  { key: "dispatched", label: "Dispatched Through" },
                  { key: "email", label: "Email ID" },
                  { key: "financed", label: "Financed By" },
                  { key: "salesman", label: "Salesman" },
                  { key: "transport", label: "Transport Name" },
                  { key: "warranty", label: "Warranty Period" },
                  { key: "po", label: "PO Number" },
                  { key: "eway", label: "E-way Bill Number" },
                  { key: "vehicle", label: "Vehicle Number" },
                ] as { key: InvDetKey; label: string }[]).map(({ key, label }) => (
                  <label key={key} className="hp-check-row hp-check-sq-row">
                    <input type="checkbox" checked={invDet[key]} onChange={() => setInvDet(s => ({ ...s, [key]: !s[key] }))} className="hp-check-sq" />
                    <span className="hp-check-label">{label}</span>
                  </label>
                ))}
                <button className="hp-add-field-btn" type="button">+ Add Custom Field</button>
              </div>
            )}
          </div>

          {/* Party Details */}
          <div className="hp-collapse-wrap">
            <button className="hp-collapse-btn" type="button" onClick={() => setPartyDetOpen(o => !o)}>
              <span className="hp-collapse-title">Party Details</span>
              <span className={`hp-collapse-chevron${partyDetOpen ? " open" : ""}`}>∨</span>
            </button>
            {partyDetOpen && (
              <div className="hp-collapse-body">
                {partyCustomFields.map((f, i) => (
                  <div key={i} className="hp-cf-item">
                    {f.label}{f.value ? `: ${f.value}` : ""}
                    <button className="hp-del-icon" type="button" onClick={() => setPartyCustomFields(p => p.filter((_, j) => j !== i))}>🗑</button>
                  </div>
                ))}
                {addingPartyField && (
                  <div className="hp-add-form">
                    <input className="hp-add-input" placeholder="Custom Field" value={newPartyField.label} onChange={e => setNewPartyField(p => ({ ...p, label: e.target.value }))} />
                    <div className="hp-add-form-row">
                      <input className="hp-add-input" placeholder="Default value (optional)" value={newPartyField.value} onChange={e => setNewPartyField(p => ({ ...p, value: e.target.value }))} />
                      <button className="hp-add-sm-btn" type="button" onClick={() => { if (newPartyField.label.trim()) { setPartyCustomFields(p => [...p, newPartyField]); setNewPartyField({ label: "", value: "" }); setAddingPartyField(false); } }}>Add</button>
                      <button className="hp-cancel-sm-btn" type="button" onClick={() => setAddingPartyField(false)}>✕</button>
                    </div>
                  </div>
                )}
                <button className="hp-add-field-btn" type="button" onClick={() => setAddingPartyField(true)}>+ Add Custom Field</button>
              </div>
            )}
          </div>

          {/* Item Table Columns */}
          <div className="hp-collapse-wrap">
            <button className="hp-collapse-btn" type="button" onClick={() => setItemColOpen(o => !o)}>
              <span className="hp-collapse-title">Item Table Columns</span>
              <span className={`hp-collapse-chevron${itemColOpen ? " open" : ""}`}>∨</span>
            </button>
            {itemColOpen && (
              <div className="hp-collapse-body">
                {([
                  { key: "priceItem", label: "Price/Item (₹)" },
                  { key: "quantity", label: "Quantity" },
                  { key: "batchNo", label: "Batch No." },
                  { key: "expDate", label: "Exp. Date" },
                  { key: "mfgDate", label: "Mfg Date" },
                ] as { key: ItemColKey; label: string }[]).map(({ key, label }) => (
                  <label key={key} className="hp-check-row hp-check-sq-row">
                    <input type="checkbox" checked={itemCols[key]} onChange={() => setItemCols(s => ({ ...s, [key]: !s[key] }))} className="hp-check-sq" />
                    <span className="hp-check-label">{label}</span>
                  </label>
                ))}
                {addingItemCol && (
                  <div className="hp-add-form">
                    <div className="hp-add-form-row">
                      <input className="hp-add-input" placeholder="Custom Field" value={newItemCol} onChange={e => setNewItemCol(e.target.value)} />
                      <button className="hp-add-sm-btn" type="button" onClick={() => { if (newItemCol.trim()) { setNewItemCol(""); setAddingItemCol(false); } }}>Add</button>
                      <button className="hp-cancel-sm-btn" type="button" onClick={() => setAddingItemCol(false)}>✕</button>
                    </div>
                  </div>
                )}
                <button className="hp-add-field-btn" type="button" onClick={() => setAddingItemCol(true)}>+ Add Custom Column</button>
              </div>
            )}
          </div>

          {/* Miscellaneous Details */}
          <div className="hp-collapse-wrap">
            <button className="hp-collapse-btn" type="button" onClick={() => setMiscOpen(o => !o)}>
              <span className="hp-collapse-title">Miscellaneous Details</span>
              <span className="hp-new-badge" style={{ marginLeft: 6, fontSize: 10 }}>New</span>
              <span className={`hp-collapse-chevron${miscOpen ? " open" : ""}`} style={{ marginLeft: "auto" }}>∨</span>
            </button>
            {miscOpen && (
              <div className="hp-collapse-body">
                <div className="hp-field-group">
                  <label className="hp-field-label">Bank Account</label>
                  <select className="hp-field-select">
                    <option>Mondal Electronics Concern(3112135000002364)</option>
                    <option>+ Create Bank Account</option>
                  </select>
                </div>
                <div className="hp-field-group" style={{ marginTop: 14 }}>
                  <label className="hp-field-label">Terms and Conditions</label>
                  <select className="hp-field-select" style={{ marginBottom: 8 }}>
                    <option>Sales Invoices</option>
                  </select>
                  <textarea className="hp-terms-area" value={termsText} onChange={e => setTermsText(e.target.value)} />
                  <button className="hp-terms-save-btn" type="button">Save</button>
                </div>
                <div className="hp-field-group" style={{ marginTop: 14 }}>
                  <label className="hp-field-label">Signature</label>
                  <input ref={sigInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleSigUpload} />
                  {signatureUrl ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fafafa" }}>
                      <img src={signatureUrl} alt="sig" style={{ height: 40, maxWidth: 100, objectFit: "contain", borderRadius: 4 }} />
                      <div style={{ flex: 1 }}>
                        <button type="button" onClick={() => sigInputRef.current?.click()}
                          style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "pointer", color: "#374151", marginRight: 6 }}>
                          Change
                        </button>
                        <button type="button" onClick={() => setSignatureUrl("")}
                          style={{ fontSize: 12, padding: "4px 10px", border: "1px solid #fca5a5", borderRadius: 6, background: "#fff", cursor: "pointer", color: "#dc2626" }}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button className="hp-sig-upload-btn" type="button" onClick={() => sigInputRef.current?.click()}>Choose an Image</button>
                      <div className="hp-sig-hint">PNG, JPEG supported, upto 3 MB and dimensions over 300 X 300</div>
                    </>
                  )}
                </div>
                <label className="hp-check-row hp-check-sq-row" style={{ marginTop: 12 }}>
                  <input type="checkbox" checked={enableReceiverSig} onChange={() => setEnableReceiverSig(v => !v)} className="hp-check-sq" />
                  <span className="hp-check-label">Enable receiver's signature field on invoice</span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── SETTINGS PANELS (Builder) ────────────────────────────────────────────────

const StylePanel: React.FC<{ style: StyleState; setStyle: React.Dispatch<React.SetStateAction<StyleState>> }> = ({ style, setStyle }) => (
  <div>
    <SL>FONT FAMILY</SL>
    <IBSelect value={style.font} onChange={(v) => setStyle((s) => ({ ...s, font: v }))} options={FONTS} />
    <SL>TEXT SIZE</SL>
    <IBSelect value={style.textSize} onChange={(v) => setStyle((s) => ({ ...s, textSize: v }))} options={TEXT_SIZES} />
    <SL>THEME COLOR</SL>
    <div className="color-row">
      <input type="color" className="color-swatch" value={style.themeColor} onChange={(e) => setStyle((s) => ({ ...s, themeColor: e.target.value }))} />
      <IBInput value={style.themeColor} onChange={(v) => setStyle((s) => ({ ...s, themeColor: v }))} />
    </div>
    <SL>THEME PRESETS</SL>
    <div className="preset-grid">
      {Object.entries(THEME_PRESETS).map(([name, color]) => (
        <button key={name} className={`preset-btn${style.themeColor === color ? " active" : ""}`} onClick={() => setStyle((s) => ({ ...s, themeColor: color }))} type="button">{name}</button>
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
    <SettingRow label="Show Logo on Invoice" checked={style.showLogo} onChange={(v) => setStyle((s) => ({ ...s, showLogo: v }))}>
      <input type="file" className="file-input" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const url = URL.createObjectURL(file); setStyle((s) => ({ ...s, logoUrl: url, showLogo: true })); } }} />
      {style.logoUrl && (
        <div className="logo-preview-row">
          <img src={style.logoUrl} alt="Logo" className="logo-thumb" style={{ height: 52, width: 52, objectFit: "contain", borderRadius: 6, border: "1px solid #eee" }} />
          <button className="remove-btn" type="button" onClick={() => setStyle((s) => ({ ...s, logoUrl: "", showLogo: false }))}>× Remove</button>
        </div>
      )}
    </SettingRow>
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
        <SL>WATERMARK IMAGE</SL>
        <input type="file" className="file-input" />
        <SL>OPACITY ({print.watermarkOpacity}%)</SL>
        <input type="range" min={5} max={80} value={print.watermarkOpacity} style={{ width: "100%" }} onChange={(e) => setPrint((p) => ({ ...p, watermarkOpacity: Number(e.target.value) }))} />
      </>
    )}
  </div>
);

const BusinessPanel: React.FC<{ inv: InvoiceData; setInv: React.Dispatch<React.SetStateAction<InvoiceData>>; vis: BusinessVisibility; setVis: React.Dispatch<React.SetStateAction<BusinessVisibility>> }> = ({ inv, setInv, vis, setVis }) => (
  <div>
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

const InvoiceDetPanel: React.FC<{ inv: InvoiceData; setInv: React.Dispatch<React.SetStateAction<InvoiceData>>; det: InvoiceDetailsState; setDet: React.Dispatch<React.SetStateAction<InvoiceDetailsState>> }> = ({ inv, setInv, det, setDet }) => (
  <div>
    <SL>INDUSTRY TYPE</SL>
    <IBSelect value={det.industryType} onChange={(v) => setDet((d) => ({ ...d, industryType: v }))} options={["Electronics", "General", "Manufacturing", "Retail", "Services", "Construction"]} />
    <SL>LAYOUT</SL>
    <IBSelect value={det.layout} onChange={(v) => setDet((d) => ({ ...d, layout: v }))} options={["Advanced GST (Tally)", "Advanced GST", "Billbook", "Modern", "Simple"]} />
    <SettingRow label="Financed By" checked={det.showFinancedBy} onChange={(v) => setDet((d) => ({ ...d, showFinancedBy: v }))}>
      {det.showFinancedBy && <IBInput value={det.financedBy} onChange={(v) => setDet((d) => ({ ...d, financedBy: v }))} placeholder="Financed By" />}
    </SettingRow>
    <SettingRow label="Salesman" checked={det.showSalesman} onChange={(v) => setDet((d) => ({ ...d, showSalesman: v }))}>
      {det.showSalesman && <IBInput value={det.salesman} onChange={(v) => setDet((d) => ({ ...d, salesman: v }))} placeholder="Salesman name" />}
    </SettingRow>
    <SettingRow label="Challan No." checked={det.showChallan} onChange={(v) => setDet((d) => ({ ...d, showChallan: v }))}>
      {det.showChallan && <IBInput value={det.challanNo} onChange={(v) => setDet((d) => ({ ...d, challanNo: v }))} placeholder="Challan No." />}
    </SettingRow>
    <SettingRow label="Warranty Period" checked={det.showWarranty} onChange={(v) => setDet((d) => ({ ...d, showWarranty: v }))}>
      {det.showWarranty && <IBInput value={det.warrantyPeriod} onChange={(v) => setDet((d) => ({ ...d, warrantyPeriod: v }))} placeholder="Warranty Period" />}
    </SettingRow>
    <SettingRow label="E-way Bill" checked={det.showEwayBill} onChange={(v) => setDet((d) => ({ ...d, showEwayBill: v }))}>
      {det.showEwayBill && <IBInput value={det.ewayBillNo} onChange={(v) => setDet((d) => ({ ...d, ewayBillNo: v }))} placeholder="E-way Bill No." />}
    </SettingRow>
    <SettingRow label="Vehicle Number" checked={det.showVehicle} onChange={(v) => setDet((d) => ({ ...d, showVehicle: v }))}>
      {det.showVehicle && <IBInput value={det.vehicleNo} onChange={(v) => setDet((d) => ({ ...d, vehicleNo: v }))} placeholder="Vehicle No." />}
    </SettingRow>
    <SettingRow label="PO Number" checked={det.showPO} onChange={(v) => setDet((d) => ({ ...d, showPO: v }))}>
      {det.showPO && <IBInput value={inv.poNo} onChange={(v) => setInv((i) => ({ ...i, poNo: v }))} />}
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

const PartyPanel: React.FC<{ inv: InvoiceData; setInv: React.Dispatch<React.SetStateAction<InvoiceData>>; pv: PartyVisibility; setPv: React.Dispatch<React.SetStateAction<PartyVisibility>> }> = ({ inv, setInv, pv, setPv }) => (
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
    <button className="add-btn" style={{ marginBottom: 20 }} type="button" onClick={() => setPv((p) => ({ ...p, billCustomFields: [...p.billCustomFields, { label: "Field", value: "" }] }))}>+ Add Field</button>
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
    <button className="add-btn" type="button" onClick={() => setPv((p) => ({ ...p, shipCustomFields: [...p.shipCustomFields, { label: "Field", value: "" }] }))}>+ Add Field</button>
  </div>
);

const ItemPanel: React.FC<{ ts: TableSettings; setTs: React.Dispatch<React.SetStateAction<TableSettings>> }> = ({ ts, setTs }) => {
  const toggleCol = (col: string) => setTs((t) => ({ ...t, cols: { ...t.cols, [col]: !t.cols[col] } }));
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
      {TABLE_COLUMNS.map((col) => (<SettingRow key={col} label={col} checked={ts.cols[col] !== false} onChange={() => toggleCol(col)} />))}
      <SL>CUSTOM COLUMNS</SL>
      {ts.customCols.map((col, i) => (
        <div className="custom-col-row" key={i}>
          <IBInput value={col} onChange={(v) => setTs((t) => ({ ...t, customCols: t.customCols.map((c, j) => j === i ? v : c) }))} placeholder="Column name" />
          <button className="remove-btn" onClick={() => setTs((t) => ({ ...t, customCols: t.customCols.filter((_, j) => j !== i) }))} type="button">×</button>
        </div>
      ))}
      <button className="add-btn" onClick={() => setTs((t) => ({ ...t, customCols: [...t.customCols, ""] }))} type="button">+ Add Column</button>
    </div>
  );
};

const MiscPanel: React.FC<{ inv: InvoiceData; setInv: React.Dispatch<React.SetStateAction<InvoiceData>>; misc: MiscState; setMisc: React.Dispatch<React.SetStateAction<MiscState>> }> = ({ inv, setInv, misc, setMisc }) => (
  <div>
    <SettingRow label="Notes" checked={misc.showNotes} onChange={(v) => setMisc((m) => ({ ...m, showNotes: v }))}>
      {misc.showNotes && <textarea className="ib-textarea" value={inv.notes} onChange={(e) => setInv((i) => ({ ...i, notes: e.target.value }))} />}
    </SettingRow>
    <SettingRow label="Total Amount in Words" checked={misc.amountWords} onChange={(v) => setMisc((m) => ({ ...m, amountWords: v }))} />
    <SettingRow label="Terms & Conditions" checked={misc.showTerms} onChange={(v) => setMisc((m) => ({ ...m, showTerms: v }))}>
      {misc.showTerms && <textarea className="ib-textarea" value={inv.terms} onChange={(e) => setInv((i) => ({ ...i, terms: e.target.value }))} />}
    </SettingRow>
    <SL>BANK DETAILS</SL>
    <IBInput value={inv.bank} onChange={(v) => setInv((i) => ({ ...i, bank: v }))} placeholder="Account Holder Name" />
    <div style={{ marginTop: 8 }}><IBInput value={inv.bankName} onChange={(v) => setInv((i) => ({ ...i, bankName: v }))} placeholder="Bank Name" /></div>
    <div style={{ marginTop: 8 }}><IBInput value={inv.accountNo} onChange={(v) => setInv((i) => ({ ...i, accountNo: v }))} placeholder="Account Number" /></div>
    <div style={{ marginTop: 8 }}><IBInput value={inv.branch} onChange={(v) => setInv((i) => ({ ...i, branch: v }))} placeholder="Branch" /></div>
    <div style={{ marginTop: 8 }}><IBInput value={inv.ifsc} onChange={(v) => setInv((i) => ({ ...i, ifsc: v }))} placeholder="IFSC Code" /></div>
    <div style={{ marginTop: 16 }}>
      <SL>UPLOAD SIGNATURE</SL>
      <input type="file" className="file-input" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const url = URL.createObjectURL(file); setMisc((m) => ({ ...m, signatureUrl: url })); } }} />
      {misc.signatureUrl && (
        <div className="logo-preview-row">
          <img src={misc.signatureUrl} alt="Signature" className="logo-thumb" style={{ maxHeight: 60 }} />
          <button className="remove-btn" type="button" onClick={() => setMisc((m) => ({ ...m, signatureUrl: "" }))}>× Remove</button>
        </div>
      )}
    </div>
    <SettingRow label="Receiver Signature" checked={misc.receiverSig} onChange={(v) => setMisc((m) => ({ ...m, receiverSig: v }))} />
  </div>
);

// ─── BUILDER VIEW ─────────────────────────────────────────────────────────────

interface BuilderProps {
  initialTemplate?: SavedTemplate | null;
  onBack: () => void;
  onSaved: (t: SavedTemplate) => void;
}

const BuilderView: React.FC<BuilderProps> = ({ initialTemplate, onBack, onSaved }) => {
  const [activeTab, setActiveTab] = useState<NavId>("style");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const [inv, setInv]     = useState<InvoiceData>(initialTemplate?.inv ?? DEFAULT_INVOICE);
  const [style, setStyle] = useState<StyleState>(initialTemplate?.style ?? DEFAULT_STYLE);
  const [print, setPrint] = useState<PrintState>(DEFAULT_PRINT);
  const [vis, setVis]     = useState<BusinessVisibility>(initialTemplate?.vis ?? DEFAULT_VIS);
  const [det, setDet]     = useState<InvoiceDetailsState>(initialTemplate?.det ?? DEFAULT_DET);
  const [pv, setPv]       = useState<PartyVisibility>(initialTemplate?.pv ?? DEFAULT_PV);
  const [ts, setTs]       = useState<TableSettings>(initialTemplate?.ts ?? DEFAULT_TS);
  const [misc, setMisc]   = useState<MiscState>(initialTemplate?.misc ?? DEFAULT_MISC);

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
      themeLayout: initialTemplate?.themeLayout ?? "advanced-gst",
      bgImageUrl: initialTemplate?.bgImageUrl ?? "",
      bgOpacity: initialTemplate?.bgOpacity ?? 15,
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
                <button key={item.id} className={`nav-item${activeTab === item.id ? " active" : ""}`} onClick={() => setActiveTab(item.id)} type="button">
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
          <div style={{ fontFamily: style.font, fontSize: style.textSize, padding: `${print.top}px ${print.right}px ${print.bottom}px ${print.left}px`, background: "#fff", minWidth: 560, maxWidth: 700, width: "100%", boxShadow: "0 2px 24px rgba(0,0,0,0.12)", borderRadius: 4 }}>
            <AdvancedGSTPreview inv={inv} det={det} pv={pv} vis={vis} ts={ts} misc={misc} logoUrl={style.logoUrl} showLogo={style.showLogo} />
          </div>
        </main>
        <aside className="settings-panel">
          <h2 className="settings-panel-title">{activeLabel}</h2>
          {panels[activeTab]}
        </aside>
      </div>
      {showSaveDialog && (
        <SaveDialog defaultName={initialTemplate?.name ?? `${inv.companyName} Template`} themeColor={style.themeColor} onSave={handleSave} onCancel={() => setShowSaveDialog(false)} />
      )}
    </>
  );
};

// ─── ROOT APP ─────────────────────────────────────────────────────────────────

const InvoiceBuilderApp: React.FC = () => {
  const [view, setView] = useState<View>("home");
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>(loadTemplates);
  const [editingTemplate, setEditingTemplate] = useState<SavedTemplate | null>(null);

  const handleCreateOwn = () => {
    setEditingTemplate(null);
    setView("builder");
  };

  const handleUse = (t: SavedTemplate) => {
    setEditingTemplate(t);
    setView("builder");
  };

  const handleDelete = (id: string) => {
    setSavedTemplates((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      removeFromStorage(updated);
      return updated;
    });
  };

  const handleSaved = (t: SavedTemplate) => {
    setSavedTemplates((prev) => {
      const exists = prev.find((x) => x.id === t.id);
      const updated = exists ? prev.map((x) => (x.id === t.id ? t : x)) : [t, ...prev];
      persistTemplates(updated, t);
      return updated;
    });
    setView("home");
  };

  if (view === "builder") {
    return (
      <BuilderView
        initialTemplate={editingTemplate}
        onBack={() => setView("home")}
        onSaved={handleSaved}
      />
    );
  }

  return (
    <HomePage
      savedTemplates={savedTemplates}
      onCreateOwn={handleCreateOwn}
      onUse={handleUse}
      onDelete={handleDelete}
      onSaved={handleSaved}
    />
  );
};

export default InvoiceBuilderApp;