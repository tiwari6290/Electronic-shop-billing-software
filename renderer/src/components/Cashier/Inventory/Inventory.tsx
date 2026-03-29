import api from "../../../lib/axios";
import { useState, useEffect, useRef } from "react";
import "./Inventory.css";


// ─── Types ────────────────────────────────────────────────────────────────────
interface StockDetail { date: string; transactionType: string; quantity: string; invoiceNumber: string | null; closingStock: string; }
interface PartyWiseReport { partyName: string; salesQuantity: number; salesAmount: number; purchaseQuantity: number; purchaseAmount: string; }
interface GodownStock { godownName: string; stockAvailable: string; address: string; }
interface PartyWisePrice { partyName: string; salesPrice: number; }
interface Item {
  id: string; itemName: string; itemCode: string; stockQty: string;
  sellingPrice: number | null; purchasePrice: number | null; category: string;
  gstTaxRate: string; hsnCode: string; secondaryUnit: string; lowStockQty: string;
  lowStockWarning: "Enabled" | "Disabled"; itemDescription: string;
  stockDetails: StockDetail[]; partyWiseReport: PartyWiseReport[];
  godownStock: GodownStock[]; partyWisePrices: PartyWisePrice[];
  stockNumber: number;
}
interface Godown { godown_id: number; godown_name: string; }

// ─── Settings types ───────────────────────────────────────────────────────────
type StockValCalc = "purchase_with_tax" | "purchase_without_tax" | "sales_with_tax" | "sales_without_tax";
interface ItemSettings {
  stockValCalc: StockValCalc;
  batchExpiry: boolean; alertBeforeExpiry: boolean; alertDays: string;
  serialImei: boolean; serialFieldName: string; mrp: boolean;
  showDiscount: boolean; wholesalePrice: boolean; partyWisePrice: boolean;
}
interface CustomField { id: string; name: string; hidden: boolean; }

const DEFAULT_SETTINGS: ItemSettings = {
  stockValCalc:"purchase_with_tax", batchExpiry:false, alertBeforeExpiry:false,
  alertDays:"", serialImei:false, serialFieldName:"IMEI/Serial No",
  mrp:false, showDiscount:false, wholesalePrice:false, partyWisePrice:false,
};

// ─── Date helpers ─────────────────────────────────────────────────────────────
const TODAY = new Date(); TODAY.setHours(0,0,0,0);
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate()+n); return r; };
const startOfWeek  = (d: Date) => { const r = new Date(d); r.setDate(r.getDate()-r.getDay()+1); r.setHours(0,0,0,0); return r; };
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfYear  = (d: Date) => new Date(d.getFullYear(), 0, 1);

type DateRange = "today"|"this_week"|"this_month"|"this_year"|"last_7"|"last_30"|"last_365"|"all";
const DATE_RANGE_LABELS: Record<DateRange, string> = {
  today:"Today", this_week:"This Week", this_month:"This Month",
  this_year:"This Year", last_7:"Last 7 Days", last_30:"Last 30 Days",
  last_365:"Last 365 Days", all:"All Time",
};
const getDateRange = (r: DateRange): [Date, Date] => {
  const end = new Date(); end.setHours(23,59,59,999);
  switch(r) {
    case "today":      return [TODAY, end];
    case "this_week":  return [startOfWeek(TODAY), end];
    case "this_month": return [startOfMonth(TODAY), end];
    case "this_year":  return [startOfYear(TODAY), end];
    case "last_7":     return [addDays(TODAY,-6), end];
    case "last_30":    return [addDays(TODAY,-29), end];
    case "last_365":   return [addDays(TODAY,-364), end];
    case "all":        return [new Date(2000,0,1), end];
  }
};
const parseDMY = (s: string): Date => { const [d,m,y] = s.split("-").map(Number); return new Date(y,m-1,d); };
const inRange = (dateStr: string, range: DateRange): boolean => {
  if (range === "all") return true;
  const [from, to] = getDateRange(range);
  const d = parseDMY(dateStr);
  return d >= from && d <= to;
};

// ─── Calc helpers ─────────────────────────────────────────────────────────────
const parseQty       = (q: string) => { if (!q||q==="-") return 0; return parseInt(q)||0; };
const hasStock       = (it: Item) => it.stockQty !== "-";
const itemStockValue = (it: Item) => { const q=it.stockNumber; if(q<=0||!it.sellingPrice) return 0; return q*it.sellingPrice; };
const calcTotalStockValue = (items: Item[]) => items.reduce((s,it)=>s+itemStockValue(it),0);
const calcTotalStockQty   = (items: Item[]) => items.filter(hasStock).reduce((s,it)=>s+Math.max(0,it.stockNumber),0);
const isLowStock = (it: Item): boolean => {
  const qty = it.stockNumber;
  if (qty < 0) return true;
  if (it.lowStockWarning === "Enabled" && it.lowStockQty !== "-") {
    const threshold = parseInt(it.lowStockQty);
    if (!isNaN(threshold)) return qty <= threshold;
  }
  return false;
};
const lowStockItems = (items: Item[]) => items.filter(isLowStock);
const fmtRs  = (n: number) => n===0?"₹ 0":"₹ "+n.toLocaleString("en-IN");
const fmt    = (n: number|null) => n===null?"-":`₹ ${n.toLocaleString("en-IN")}`;
const fmtAmt = (n: number) => `₹ ${n.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const IcBack     = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const IcTrash    = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const IcEdit     = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcPlus     = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1={12} y1={5} x2={12} y2={19}/><line x1={5} y1={12} x2={19} y2={12}/></svg>;
const IcSearch   = () => <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>;
const IcX        = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1={18} y1={6} x2={6} y2={18}/><line x1={6} y1={6} x2={18} y2={18}/></svg>;
const IcBarcode  = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 5v14M8 5v14M12 5v14M17 5v14M21 5v14"/></svg>;
const IcDownload = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1={12} y1={15} x2={12} y2={3}/></svg>;
const IcPrint    = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x={6} y={14} width={12} height={8}/></svg>;
const IcArrow    = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1={5} y1={12} x2={19} y2={12}/><polyline points="12 5 19 12 12 19"/></svg>;
const IcReports  = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1={18} y1={20} x2={18} y2={10}/><line x1={12} y1={20} x2={12} y2={4}/><line x1={6} y1={20} x2={6} y2={14}/></svg>;
const IcSettings = () => <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={3}/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
const IcChat     = () => <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const IcTrending = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IcAlert    = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1={12} y1={9} x2={12} y2={13}/><line x1={12} y1={17} x2={12.01} y2={17}/></svg>;
const IcLayers   = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
const IcCalendar = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x={3} y={4} width={18} height={18} rx={2} ry={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>;
const IcInfo     = () => <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={10}/><line x1={12} y1={8} x2={12} y2={12}/><line x1={12} y1={16} x2={12.01} y2={16}/></svg>;
const IcExtLink  = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1={10} y1={14} x2={21} y2={3}/></svg>;
const IcChevDown = () => <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="6 9 12 15 18 9"/></svg>;
const IcStar     = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcEyeOff   = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1={1} y1={1} x2={23} y2={23}/></svg>;
const IcBox      = () => <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke="#c0c5d0" strokeWidth={1.3}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1={12} y1={22.08} x2={12} y2={12}/></svg>;
const IcFile     = () => <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke="#c0c5d0" strokeWidth={1.3}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1={16} y1={13} x2={8} y2={13}/><line x1={16} y1={17} x2={8} y2={17}/></svg>;

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"60px 0" }}>
    <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth={2.5}
      style={{ animation:"spin 0.75s linear infinite" }}>
      <circle cx={12} cy={12} r={10} strokeOpacity={0.2}/>
      <path d="M12 2a10 10 0 0110 10" stroke="#6366f1"/>
    </svg>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ─── Toggle ───────────────────────────────────────────────────────────────────
const Toggle = ({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) => (
  <div className={`stg-toggle${on?" on":""}`} onClick={() => onChange(!on)}>
    <div className="stg-thumb"/>
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, onDone }: { msg: string; onDone: () => void }) => {
  useEffect(() => { const t = setTimeout(onDone, 2000); return () => clearTimeout(t); }, []);
  return <div className="toast">{msg}</div>;
};

// ─── Date Range Picker ────────────────────────────────────────────────────────
const DateRangePicker = ({ value, onChange }: { value: DateRange; onChange: (v: DateRange) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if(ref.current&&!ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h);
  },[]);
  const opts: DateRange[] = ["today","this_week","this_month","this_year","last_7","last_30","last_365","all"];
  return (
    <div className="date-picker-wrap" ref={ref}>
      <div className={`rpt-filter-pill${open?" open":""}`} onClick={() => setOpen(v=>!v)}>
        <IcCalendar /><span className="rpt-filter-text">{DATE_RANGE_LABELS[value]}</span><IcChevDown />
      </div>
      {open && (
        <div className="date-picker-menu">
          {opts.map(o => (
            <div key={o} className={`date-picker-opt${value===o?" active":""}`}
              onClick={() => { onChange(o); setOpen(false); }}>
              {DATE_RANGE_LABELS[o]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ITEM SETTINGS MODAL
// ═══════════════════════════════════════════════════════════════════════════════
const STOCK_CALC_OPTS: { value: StockValCalc; label: string }[] = [
  {value:"purchase_with_tax",   label:"Purchase Price with Tax"},
  {value:"purchase_without_tax",label:"Purchase Price Without Tax"},
  {value:"sales_with_tax",      label:"Sales Price with Tax"},
  {value:"sales_without_tax",   label:"Sales Price Without Tax"},
];

const CustomFieldModal = ({ fields, onClose, onSave }: {
  fields: CustomField[]; onClose: () => void; onSave: (f: CustomField[]) => void;
}) => {
  const [localFields, setLocalFields] = useState<CustomField[]>(
    fields.length > 0 ? [...fields] : [{id:"cf1",name:"",hidden:false},{id:"cf2",name:"",hidden:false}]
  );
  const addField    = () => setLocalFields(f => [...f, {id:`cf${Date.now()}`,name:"",hidden:false}]);
  const deleteField = (id: string) => setLocalFields(f => f.filter(x => x.id !== id));
  const updateName  = (id: string, name: string) => setLocalFields(f => f.map(x => x.id===id?{...x,name}:x));
  const toggleHide  = (id: string) => setLocalFields(f => f.map(x => x.id===id?{...x,hidden:!x.hidden}:x));
  return (
    <div className="modal-overlay" style={{zIndex:1100}} onClick={onClose}>
      <div className="cf-modal" onClick={e=>e.stopPropagation()}>
        <div className="cf-header"><span className="cf-title">Add Item Custom Fields</span><button className="modal-close" onClick={onClose}><IcX /></button></div>
        <div className="cf-bubbles">
          <div className="cf-bubble cf-bubble-green" style={{top:30,left:160}}><span className="cf-bubble-icon">⊞</span><span className="cf-bubble-label">Dimensions</span></div>
          <div className="cf-bubble cf-bubble-yellow" style={{top:60,left:60}}><span className="cf-bubble-icon">🎨</span><span className="cf-bubble-label">Color</span></div>
          <div className="cf-bubble cf-bubble-orange" style={{top:30,right:80}}><span className="cf-bubble-icon">⬡</span><span className="cf-bubble-label">Material</span></div>
        </div>
        <div className="cf-body">
          <label className="cf-label">Field Name</label>
          {localFields.map(f => (
            <div key={f.id} className="cf-field-row">
              <input className="cf-field-input" placeholder="Enter Custom Field Name" value={f.name} onChange={e => updateName(f.id, e.target.value)}/>
              <button className={`cf-field-btn${f.hidden?" active":""}`} title="Hide" onClick={() => toggleHide(f.id)}><IcEyeOff /></button>
              <button className="cf-field-btn danger" title="Delete" onClick={() => deleteField(f.id)}><IcTrash /></button>
            </div>
          ))}
          <button className="cf-add-btn" onClick={addField}><IcPlus /> Add New Field</button>
        </div>
        <div className="cf-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <button className="btn-primary" onClick={() => { onSave(localFields); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
};

const SettingsModal = ({ settings, customFields, onClose, onSave }: {
  settings: ItemSettings; customFields: CustomField[];
  onClose: () => void; onSave: (s: ItemSettings, cf: CustomField[]) => void;
}) => {
  const [s, setS] = useState<ItemSettings>({...settings});
  const [cf, setCf] = useState<CustomField[]>(customFields);
  const [calcOpen, setCalcOpen] = useState(false);
  const [showCfModal, setShowCfModal] = useState(false);
  const calcRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if(calcRef.current&&!calcRef.current.contains(e.target as Node)) setCalcOpen(false); };
    document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h);
  },[]);
  const set = (k: keyof ItemSettings, v: any) => setS(p=>({...p,[k]:v}));
  const selectedLabel = STOCK_CALC_OPTS.find(o=>o.value===s.stockValCalc)?.label ?? "";
  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="stg-modal" onClick={e=>e.stopPropagation()}>
          <div className="stg-header"><span className="stg-title">Item Settings</span><button className="modal-close" onClick={onClose}><IcX /></button></div>
          <div className="stg-body">
            <div className="stg-row">
              <span className="stg-row-label">Stock Value Calculation</span>
              <div className="stg-select-wrap" ref={calcRef}>
                <div className={`stg-select-trigger${calcOpen?" open":""}`} onClick={() => setCalcOpen(v=>!v)}>
                  <span>{selectedLabel}</span><IcChevDown />
                </div>
                {calcOpen && (
                  <div className="stg-select-menu">
                    {STOCK_CALC_OPTS.map(o => (
                      <div key={o.value} className={`stg-select-opt${s.stockValCalc===o.value?" active":""}`}
                        onClick={() => { set("stockValCalc",o.value); setCalcOpen(false); }}>{o.label}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="stg-row stg-row-with-desc">
              <div className="stg-row-text"><span className="stg-row-label">Enable Item Batching &amp; Expiry</span><span className="stg-row-desc">Keep track of multiple prices, expiry and manufacturing dates</span></div>
              <Toggle on={s.batchExpiry} onChange={v => set("batchExpiry",v)}/>
            </div>
            {s.batchExpiry && (
              <div className="stg-row stg-row-with-desc stg-indent">
                <div className="stg-row-text"><span className="stg-row-label">Alert Before Expiry</span><span className="stg-row-desc">We will notify you the below selected days before your batch expires</span></div>
                <div className="stg-alert-row">
                  <input className="stg-small-input" value={s.alertDays} onChange={e=>set("alertDays",e.target.value)} placeholder="days"/>
                  <div className="select-wrap"><select className="form-select stg-small-select"><option>Select</option><option>7 days</option><option>15 days</option><option>30 days</option></select></div>
                </div>
                <Toggle on={s.alertBeforeExpiry} onChange={v => set("alertBeforeExpiry",v)}/>
              </div>
            )}
            <div className="stg-row stg-row-with-desc">
              <div className="stg-row-text"><span className="stg-row-label">Enable Serial Number/IMEI</span><span className="stg-row-desc">Manage your items by Serial Number or IMEI and track them easily</span></div>
              <Toggle on={s.serialImei} onChange={v => set("serialImei",v)}/>
            </div>
            {s.serialImei && (
              <div className="stg-indent stg-indent-field">
                <label className="stg-sub-label">Field Name</label>
                <input className="stg-field-input" value={s.serialFieldName} onChange={e=>set("serialFieldName",e.target.value)}/>
                <p className="stg-hint">Choose a custom field name like IMEI Number, Model Number, Part Number etc.</p>
              </div>
            )}
            <div className="stg-row"><span className="stg-row-label">MRP</span><Toggle on={s.mrp} onChange={v=>set("mrp",v)}/></div>
            {s.mrp && (
              <div className="stg-indent">
                <label className="stg-checkbox-row">
                  <input type="checkbox" checked={s.showDiscount} onChange={e=>set("showDiscount",e.target.checked)}/>
                  <span>Show Discount(%) on MRP on invoice preview</span>
                </label>
              </div>
            )}
            <div className="stg-row"><span className="stg-row-label">Wholesale Price</span><Toggle on={s.wholesalePrice} onChange={v=>set("wholesalePrice",v)}/></div>
            <div className="stg-row stg-row-with-desc">
              <div className="stg-row-text"><span className="stg-row-label">Party Wise Item Price <span className="badge-new">New</span></span><span className="stg-row-desc">Set custom Sales Prices for individual Parties</span></div>
              <Toggle on={s.partyWisePrice} onChange={v=>set("partyWisePrice",v)}/>
            </div>
            <button className="stg-add-custom" onClick={() => setShowCfModal(true)}>+ Add Custom Field</button>
          </div>
          <div className="stg-footer">
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={() => { onSave(s, cf); onClose(); }}>Save</button>
          </div>
        </div>
      </div>
      {showCfModal && <CustomFieldModal fields={cf} onClose={() => setShowCfModal(false)} onSave={f => setCf(f)}/>}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADJUST STOCK MODAL  ← fully backend-integrated
// ═══════════════════════════════════════════════════════════════════════════════
const AdjustModal = ({ item, onClose, onSaved }: {
  item: Item;
  onClose: () => void;
  onSaved: (itemId: string) => void;   // called after successful save so parent can re-fetch
}) => {
  const [type,    setType]    = useState<"add"|"reduce">("add");
  const [qty,     setQty]     = useState(0);
  const [godown,  setGodown]  = useState("");
  const [remarks, setRemarks] = useState("");
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [saving,  setSaving]  = useState(false);

  const unit = item.stockQty.includes("ACS") ? "ACS" : "PCS";
  const cur  = item.stockNumber;
  const newQ = type === "add" ? cur + qty : cur - qty;

  // Fetch all godowns from backend when modal opens
  useEffect(() => {
    api.get("/godowns")
      .then(res => setGodowns(res.data.data || res.data))
      .catch(err => console.error("Failed to fetch godowns:", err));
  }, []);

  const save = async () => {
    if (!godown)  { alert("Please select a godown"); return; }
    if (qty <= 0) { alert("Please enter a quantity greater than 0"); return; }
    setSaving(true);
    try {
      await api.post(`/items/${item.id}/adjust-stock`, {
        godownId: Number(godown),
        type,
        qty,
        remarks,
      });
      onSaved(item.id);   // triggers fetchItemById + toast in parent
      onClose();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to adjust stock");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Adjust Stock Quantity</h2>
          <button className="modal-close" onClick={onClose}><IcX /></button>
        </div>
        <div className="modal-body">
          <div className="modal-left">
            {/* Date — always today */}
            <div className="form-group">
              <label>Date</label>
              <div className="input-icon-wrap">
                <IcCalendar />
                <input
                  className="form-input borderless"
                  readOnly
                  value={new Date().toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
                />
              </div>
            </div>

            {/* Godown — fetched from backend */}
            <div className="form-group">
              <label>Godown <span className="required">*</span></label>
              <div className="select-wrap">
                <select className="form-select" value={godown} onChange={e => setGodown(e.target.value)}>
                  <option value="">Select Godown</option>
                  {godowns.map(g => (
                    <option key={g.godown_id} value={g.godown_id}>{g.godown_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              {/* Add / Reduce */}
              <div className="form-group">
                <label>Add or Reduce Stock</label>
                <div className="select-wrap">
                  <select className="form-select" value={type} onChange={e => setType(e.target.value as "add"|"reduce")}>
                    <option value="add">Add (+)</option>
                    <option value="reduce">Reduce (-)</option>
                  </select>
                </div>
              </div>

              {/* Quantity — fixed editable input */}
              <div className="form-group">
                <label>Adjust quantity</label>
                <div className="qty-input-wrap">
                  <input
                    type="number"
                    min={0}
                    value={qty === 0 ? "" : qty}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === "") { setQty(0); return; }
                      const parsed = parseInt(val);
                      if (!isNaN(parsed) && parsed >= 0) setQty(parsed);
                    }}
                    onBlur={e => { if (e.target.value === "") setQty(0); }}
                    placeholder="0"
                  />
                  <span className="qty-unit">{unit}</span>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="form-group">
              <label>Remarks (Optional)</label>
              <textarea className="form-textarea" placeholder="Enter remarks" value={remarks} onChange={e => setRemarks(e.target.value)}/>
            </div>
          </div>

          {/* Right panel — stock calculation preview */}
          <div className="modal-right">
            <div>
              <p className="modal-label">Item Name</p>
              <p className="modal-item-name">{item.itemName}</p>
            </div>
            <div className="stock-calc">
              <div className="stock-calc-header"><IcReports /> Stock Calculation</div>
              {qty > 0 ? (
                <div className="stock-calc-body">
                  <div className="stock-row"><span>Current Stock</span><span>{cur} {unit}</span></div>
                  <div className="stock-row adjust-row">
                    <span>{type === "add" ? "Adding" : "Reducing"}</span>
                    <span className={type === "add" ? "positive" : "negative"}>
                      {type === "add" ? "+" : "-"}{qty} {unit}
                    </span>
                  </div>
                  <div className="stock-divider"/>
                  <div className="stock-row final-row"><span>New Stock</span><span className="new-stock">{newQ} {unit}</span></div>
                </div>
              ) : <p className="calc-placeholder">Adjustment will be shown here</p>}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT ITEM MODAL
// ═══════════════════════════════════════════════════════════════════════════════
const GST_RATES = ["0%","5%","12%","18%","28%"];

const EditItemModal = ({ item, onClose, onSave }: {
  item: Item; onClose:()=>void; onSave:(updated: Item)=>void;
}) => {
  const [form, setForm] = useState<Item>(item);
  const set = (k: keyof Item, v: any) => setForm(p => ({...p, [k]: v}));
  const handleSave = () => {
    if (!form.itemName.trim()) { alert("Item name is required"); return; }
    onSave(form); onClose();
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-item-modal" onClick={e=>e.stopPropagation()}>
        <div className="edit-modal-header"><span className="edit-modal-title">Edit Item</span><button className="modal-close" onClick={onClose}><IcX /></button></div>
        <div className="edit-modal-body">
          <div className="edit-section-title">General Details</div>
          <div className="edit-form-grid">
            <div className="edit-form-group"><label>Item Name <span className="required">*</span></label><input className="edit-input" value={form.itemName} onChange={e=>set("itemName",e.target.value)} placeholder="Item name"/></div>
            <div className="edit-form-group"><label>Item Code</label><input className="edit-input" value={form.itemCode} onChange={e=>set("itemCode",e.target.value)} placeholder="Item code"/></div>
            <div className="edit-form-group"><label>Category</label><input className="edit-input" value={form.category} onChange={e=>set("category",e.target.value)} placeholder="Category"/></div>
            <div className="edit-form-group"><label>HSN Code</label><input className="edit-input" value={form.hsnCode} onChange={e=>set("hsnCode",e.target.value)} placeholder="HSN code"/></div>
            <div className="edit-form-group span-full"><label>Description</label><textarea className="edit-textarea" value={form.itemDescription} onChange={e=>set("itemDescription",e.target.value)} placeholder="Item description" rows={2}/></div>
          </div>
          <div className="edit-section-title">Pricing Details</div>
          <div className="edit-form-grid">
            <div className="edit-form-group"><label>Selling Price (₹)</label><input className="edit-input" type="number" value={form.sellingPrice ?? ""} onChange={e=>set("sellingPrice", e.target.value===""?null:Number(e.target.value))} placeholder="0"/></div>
            <div className="edit-form-group"><label>Purchase Price (₹)</label><input className="edit-input" type="number" value={form.purchasePrice ?? ""} onChange={e=>set("purchasePrice", e.target.value===""?null:Number(e.target.value))} placeholder="0"/></div>
            <div className="edit-form-group"><label>GST Tax Rate</label><select className="edit-select" value={form.gstTaxRate} onChange={e=>set("gstTaxRate",e.target.value)}>{GST_RATES.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
            <div className="edit-form-group"><label>Secondary Unit</label><input className="edit-input" value={form.secondaryUnit} onChange={e=>set("secondaryUnit",e.target.value)} placeholder="-"/></div>
          </div>
          <div className="edit-section-title">Stock Settings</div>
          <div className="edit-form-grid">
            <div className="edit-form-group"><label>Low Stock Quantity</label><input className="edit-input" value={form.lowStockQty} onChange={e=>set("lowStockQty",e.target.value)} placeholder="-"/></div>
            <div className="edit-form-group"><label>Low Stock Warning</label><select className="edit-select" value={form.lowStockWarning} onChange={e=>set("lowStockWarning",e.target.value as "Enabled"|"Disabled")}><option value="Disabled">Disabled</option><option value="Enabled">Enabled</option></select></div>
          </div>
        </div>
        <div className="edit-modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ITEM DETAIL PAGE
// ═══════════════════════════════════════════════════════════════════════════════
type DetailTab = "itemDetails"|"stockDetails"|"partyWiseReport"|"godown"|"partyWisePrices";

const TabEmpty = ({ message }: { message: string }) => (
  <div className="tab-empty-state">
    <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth={1.2}>
      <rect x={3} y={3} width={18} height={18} rx={3}/><line x1={8} y1={9} x2={16} y2={9}/><line x1={8} y1={13} x2={14} y2={13}/><line x1={8} y1={17} x2={11} y2={17}/>
    </svg>
    <p>{message}</p>
  </div>
);

const ItemDetailPage = ({ item, onBack, onDelete, onAdjust, onEdit, loading }: {
  item: Item; onBack:()=>void; onDelete:(id:string)=>void;
  onAdjust:()=>void; onEdit:()=>void; loading: boolean;
}) => {
  const [tab, setTab] = useState<DetailTab>("itemDetails");
  const [partySearch, setPartySearch] = useState("");
  const isInStock = item.stockQty!=="-" && !item.stockQty.startsWith("-");
  const tabs: [DetailTab,string][] = [
    ["itemDetails","Item Details"],["stockDetails","Stock Details"],
    ["partyWiseReport","Party Wise Report"],["godown","Godown"],["partyWisePrices","Party Wise Prices"]
  ];
  const filteredPartyPrices = item.partyWisePrices.filter(p =>
    p.partyName.toLowerCase().includes(partySearch.toLowerCase())
  );
  return (
    <div className="detail-page">
      <div className="detail-topbar">
        <div className="detail-topbar-left">
          <button className="back-btn" onClick={onBack}><IcBack /></button>
          <h2 className="detail-title">{item.itemName}</h2>
          {isInStock&&<span className="badge-stock">In Stock</span>}
        </div>
        <div className="detail-topbar-right">
          <button className="btn-outline-sm"><IcBarcode /> View Barcode</button>
          <button className="btn-outline-sm" onClick={onAdjust}>Adjust Stock</button>
          <button className="btn-icon-action edit" title="Edit Item" onClick={e=>{e.stopPropagation();onEdit();}}><IcEdit /></button>
          <button className="btn-icon-action delete" title="Remove Item" onClick={()=>onDelete(item.id)}><IcTrash /></button>
        </div>
      </div>
      <div className="detail-tabbar">
        {tabs.map(([k,l])=><button key={k} className={`tab-btn${tab===k?" active":""}`} onClick={()=>setTab(k)}>{l}</button>)}
      </div>

      {loading ? <Spinner /> : (
        <div className="detail-body">
          {tab==="itemDetails"&&(
            <div className="tab-cards-grid">
              <div className="info-card">
                <div className="card-heading">General Details</div>
                <div className="info-grid">
                  <div className="info-item"><span className="info-label">Item Name</span><span className="info-value">{item.itemName||"-"}</span></div>
                  <div className="info-item"><span className="info-label">Item Code</span><span className="info-value">{item.itemCode||"-"}</span></div>
                  <div className="info-item"><span className="info-label">Category</span><span className="info-value">{item.category||"-"}</span></div>
                  <div className="info-item"><span className="info-label">Current Stock</span><span className="info-value">{item.stockQty}</span></div>
                  <div className="info-item"><span className="info-label">Stock Value</span><span className="info-value">{fmtRs(itemStockValue(item))}</span></div>
                  <div className="info-item"><span className="info-label">Low Stock Qty</span><span className="info-value">{item.lowStockQty}</span></div>
                  <div className="info-item"><span className="info-label">Low Stock Warning</span><span className={`info-value ${item.lowStockWarning==="Disabled"?"warn-dis":"warn-en"}`}>{item.lowStockWarning}</span></div>
                  <div className="info-item span-full"><span className="info-label">Description</span><span className="info-value">{item.itemDescription||"-"}</span></div>
                </div>
              </div>
              <div className="info-card">
                <div className="card-heading">Pricing Details</div>
                <div className="info-grid">
                  <div className="info-item"><span className="info-label">Sales Price</span><span className="info-value">{item.sellingPrice!==null?`₹ ${item.sellingPrice.toLocaleString("en-IN")}`:"-"}<span className="with-tax"> With Tax</span></span></div>
                  <div className="info-item"><span className="info-label">Purchase Price</span><span className="info-value">{item.purchasePrice!==null?`₹ ${item.purchasePrice.toLocaleString("en-IN")}`:"-"}<span className="with-tax"> With Tax</span></span></div>
                  <div className="info-item"><span className="info-label">GST Tax Rate</span><span className="info-value">{item.gstTaxRate}</span></div>
                  <div className="info-item"><span className="info-label">HSN Code</span><span className="info-value">{item.hsnCode}</span></div>
                  <div className="info-item"><span className="info-label">Secondary Unit</span><span className="info-value">{item.secondaryUnit}</span></div>
                </div>
              </div>
            </div>
          )}
          {tab==="stockDetails"&&(
            <div className="tab-section">
              <div className="tab-toolbar">
                <button className="date-filter-btn"><IcCalendar/> Last 365 Days <IcChevDown/></button>
                <div className="tab-toolbar-right">
                  <button className="btn-outline-sm"><IcDownload/> Download</button>
                  <button className="btn-outline-sm"><IcPrint/> Print PDF</button>
                </div>
              </div>
              {item.stockDetails.length>0 ? (
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Transaction Type</th><th>Quantity</th><th>Invoice Number</th><th>Closing Stock</th></tr></thead>
                  <tbody>
                    {item.stockDetails.map((s,i)=>(
                      <tr key={i}>
                        <td>{new Date(s.date).toLocaleDateString("en-GB")}</td>
                        <td><span className={`tx-badge tx-${s.transactionType.toLowerCase().includes("sales")?"sales":s.transactionType.toLowerCase().includes("purchase")?"purchase":s.transactionType.toLowerCase().includes("opening")?"opening":"adjust"}`}>{s.transactionType}</span></td>
                        <td className={s.quantity.startsWith("-")?"qty-neg":"qty-pos"}>{s.quantity}</td>
                        <td>{s.invoiceNumber||"-"}</td>
                        <td>{s.closingStock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <TabEmpty message="No stock transactions found for this item." />}
            </div>
          )}
          {tab==="partyWiseReport"&&(
            <div className="tab-section">
              <div className="tab-toolbar">
                <button className="date-filter-btn"><IcCalendar/> Last 365 Days <IcChevDown/></button>
                <div className="tab-toolbar-right">
                  <button className="btn-outline-sm"><IcDownload/> Download</button>
                  <button className="btn-outline-sm"><IcPrint/> Print PDF</button>
                </div>
              </div>
              {item.partyWiseReport.length>0 ? (
                <table className="data-table">
                  <thead><tr><th>Party Name</th><th>Sales Qty</th><th>Sales Amount</th><th>Purchase Qty</th><th>Purchase Amount</th></tr></thead>
                  <tbody>
                    {item.partyWiseReport.map((p,i)=>(
                      <tr key={i}>
                        <td className="td-party-name">{p.partyName}</td>
                        <td>{p.salesQuantity>0?<span className="qty-pos">+{p.salesQuantity}</span>:<span className="td-secondary">0</span>}</td>
                        <td>{p.salesAmount>0?fmtAmt(p.salesAmount):"-"}</td>
                        <td>{p.purchaseQuantity>0?<span className="qty-pos">+{p.purchaseQuantity}</span>:<span className="td-secondary">0</span>}</td>
                        <td>{p.purchaseAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <TabEmpty message="No party wise transactions found for this item." />}
            </div>
          )}
          {tab==="godown"&&(
            <div className="tab-section">
              <div className="tab-toolbar">
                <div className="tab-toolbar-right">
                  <button className="btn-accent-sm">Transfer Stock <IcArrow/></button>
                </div>
              </div>
              {item.godownStock.length>0 ? (
                <table className="data-table">
                  <thead><tr><th>Godown Name</th><th>Stock Available</th><th>Address</th></tr></thead>
                  <tbody>
                    {item.godownStock.map((g,i)=>(
                      <tr key={i}>
                        <td className="td-party-name">{g.godownName}</td>
                        <td><span className="qty-pos">{g.stockAvailable}</span></td>
                        <td className="td-secondary">{g.address||"-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <TabEmpty message="No godown stock found. Assign this item to a godown to see it here." />}
            </div>
          )}
          {tab==="partyWisePrices"&&(
            <div className="tab-section">
              <div className="tab-toolbar">
                <div className="search-party"><IcSearch/><input type="text" className="search-input-sm" placeholder="Search Party" value={partySearch} onChange={e=>setPartySearch(e.target.value)}/></div>
                <div className="tab-toolbar-right"><button className="btn-outline-sm"><IcEdit/> Edit Party Wise Prices</button></div>
              </div>
              {filteredPartyPrices.length>0 ? (
                <table className="data-table">
                  <thead><tr><th>Party Name</th><th>Sales Price</th></tr></thead>
                  <tbody>{filteredPartyPrices.map((p,i)=><tr key={i}><td className="td-party-name">{p.partyName}</td><td>₹ {p.salesPrice.toLocaleString("en-IN")}</td></tr>)}</tbody>
                </table>
              ) : <TabEmpty message={partySearch ? `No party found matching "${partySearch}".` : "No party wise prices set for this item."} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// REPORT PAGES
// ═══════════════════════════════════════════════════════════════════════════════
type ReportView = "rate_list"|"stock_summary"|"low_stock"|"item_sales";

const ReportShell = ({ title, onBack, topRight, children }: {
  title:string; onBack:()=>void; topRight?:React.ReactNode; children:React.ReactNode;
}) => (
  <div className="rpt-page">
    <div className="rpt-topbar">
      <div className="rpt-topbar-left">
        <button className="back-btn" onClick={onBack}><IcBack /></button>
        <span className="rpt-title">{title}</span>
        <button className="rpt-fav-btn"><IcStar /> Favourite</button>
      </div>
      {topRight&&<div className="rpt-topbar-right">{topRight}</div>}
    </div>
    <div className="rpt-body">{children}</div>
  </div>
);

const RateListPage = ({ items, onBack }: { items:Item[]; onBack:()=>void }) => {
  const listed = items.filter(it=>it.sellingPrice!==null);
  return (
    <ReportShell title="Rate List" onBack={onBack}
      topRight={<><button className="rpt-btn-dl"><IcDownload /> Download Excel <IcChevDown /></button><button className="rpt-btn-print"><IcPrint /> Print PDF</button></>}>
      <table className="rpt-table">
        <thead><tr><th>NAME</th><th>ITEM CODE</th><th>MRP</th><th>SELLING PRICE</th></tr></thead>
        <tbody>
          {listed.map(it=><tr key={it.id}><td className="rpt-td-name">{it.itemName}</td><td className="rpt-td-sec">{it.itemCode||"-"}</td><td className="rpt-td-sec">-</td><td className="rpt-td-sec">₹ {it.sellingPrice!.toLocaleString("en-IN")}</td></tr>)}
          {listed.length===0&&<tr><td colSpan={4} className="rpt-empty-cell">No items found</td></tr>}
        </tbody>
      </table>
    </ReportShell>
  );
};

const StockSummaryPage = ({ items, onBack }: { items:Item[]; onBack:()=>void }) => {
  const [dateRange, setDateRange] = useState<DateRange>("today");
  const stockItems = items.filter(hasStock);
  const filteredItems = dateRange==="all" ? stockItems : stockItems.filter(it =>
    it.stockDetails.length===0 || it.stockDetails.some(s=>inRange(s.date, dateRange))
  );
  const totalValue = calcTotalStockValue(filteredItems);
  const totalQty   = calcTotalStockQty(filteredItems);
  return (
    <ReportShell title="Stock Summary" onBack={onBack}
      topRight={<><button className="rpt-btn-dl"><IcDownload /> Download Excel</button><button className="rpt-btn-icon"><IcInfo /></button><button className="rpt-btn-print"><IcPrint /> Print PDF</button></>}>
      <div className="rpt-stat-row">
        <div className="rpt-stat-card"><div className="rpt-stat-label"><IcTrending /> Total Stock Value</div><div className="rpt-stat-value">₹ {totalValue.toLocaleString("en-IN")}</div></div>
        <div className="rpt-stat-card"><div className="rpt-stat-label"><IcBox /> Total Stock Quantity</div><div className="rpt-stat-value">{totalQty}</div></div>
      </div>
      <div className="rpt-filters">
        <div className="rpt-filter-pill"><IcSearch /><input className="rpt-filter-input" placeholder="Search Category"/><IcChevDown /></div>
        <DateRangePicker value={dateRange} onChange={setDateRange}/>
      </div>
      <table className="rpt-table">
        <thead><tr><th>Item Name</th><th>Batch Number</th><th>Item Code</th><th>Purchase Price</th><th>Selling Price</th><th>Stock Quantity</th><th>Stock Value</th></tr></thead>
        <tbody>
          {filteredItems.map(it=>{
            const qty=it.stockNumber; const unit=it.stockQty.includes("ACS")?"ACS":"PCS"; const val=itemStockValue(it);
            return <tr key={it.id}><td className="rpt-td-name">{it.itemName}</td><td className="rpt-td-sec">-</td><td className="rpt-td-sec">{it.itemCode||"-"}</td><td className="rpt-td-sec">{it.purchasePrice!==null?`₹${it.purchasePrice.toLocaleString("en-IN")}`:"₹0"}</td><td className="rpt-td-sec">{it.sellingPrice!==null?`₹${it.sellingPrice.toLocaleString("en-IN")}`:"₹0"}</td><td className="rpt-td-sec">{qty}.0 {unit}</td><td className="rpt-td-sec">{val>0?`₹${val.toLocaleString("en-IN")}`:"₹0"}</td></tr>;
          })}
          {filteredItems.length===0&&<tr><td colSpan={7} className="rpt-empty-cell">No items found for this period</td></tr>}
        </tbody>
      </table>
    </ReportShell>
  );
};

const LowStockSummaryPage = ({ items, onBack }: { items:Item[]; onBack:()=>void }) => {
  const low = lowStockItems(items);
  const totalVal = low.reduce((s,it)=>s+itemStockValue(it),0);
  return (
    <ReportShell title="Low Stock Summary" onBack={onBack}>
      <div className="rpt-low-header"><span>Total Stock Value: </span><span className="rpt-low-value">₹ {totalVal>0?totalVal.toLocaleString("en-IN"):0}</span></div>
      <table className="rpt-table">
        <thead><tr><th>ITEM NAME</th><th>ITEM CODE</th><th>STOCK QUANTITY</th><th>LOW STOCK LEVEL</th><th>STOCK VALUE</th></tr></thead>
        <tbody>{low.map(it=><tr key={it.id}><td className="rpt-td-name">{it.itemName}</td><td className="rpt-td-sec">{it.itemCode||"-"}</td><td className={it.stockNumber<0?"qty-neg":"rpt-td-sec"}>{it.stockQty}</td><td className="rpt-td-sec">{it.lowStockQty}</td><td className="rpt-td-sec">{fmtRs(itemStockValue(it))}</td></tr>)}</tbody>
      </table>
      {low.length===0&&<div className="rpt-empty-state"><IcBox /><p>No items available to generate report</p></div>}
    </ReportShell>
  );
};

const ItemSalesSummaryPage = ({ items, onBack }: { items:Item[]; onBack:()=>void }) => {
  const [dateRange, setDateRange] = useState<DateRange>("this_week");
  const withTx = items.filter(it=>it.partyWiseReport.length>0);
  const filteredWithTx = dateRange==="all" ? withTx : withTx.filter(it =>
    it.stockDetails.length===0 || it.stockDetails.some(s=>inRange(s.date,dateRange))
  );
  const totalSales    = filteredWithTx.reduce((s,it)=>s+it.partyWiseReport.reduce((a,p)=>a+p.salesQuantity,0),0);
  const totalPurchase = filteredWithTx.reduce((s,it)=>s+it.partyWiseReport.reduce((a,p)=>a+p.purchaseQuantity,0),0);
  return (
    <ReportShell title="Item Sales and Purchase Summary" onBack={onBack}>
      <div className="rpt-filters">
        <div className="rpt-filter-pill"><IcSearch /><input className="rpt-filter-input" placeholder="Search Category"/><IcChevDown /></div>
        <DateRangePicker value={dateRange} onChange={setDateRange}/>
      </div>
      <table className="rpt-table">
        <thead><tr><th>ITEM NAME</th><th>SALES QUANTITY</th><th>PURCHASE QUANTITY</th></tr></thead>
        <tbody>
          <tr className="rpt-total-row"><td className="rpt-td-bold">Total</td><td className="rpt-td-bold">{totalSales}</td><td className="rpt-td-bold">{totalPurchase}</td></tr>
          {filteredWithTx.map(it=>{
            const s=it.partyWiseReport.reduce((a,p)=>a+p.salesQuantity,0);
            const p=it.partyWiseReport.reduce((a,p)=>a+p.purchaseQuantity,0);
            return <tr key={it.id}><td className="rpt-td-name">{it.itemName}</td><td className="rpt-td-sec">{s}</td><td className="rpt-td-sec">{p}</td></tr>;
          })}
        </tbody>
      </table>
      {filteredWithTx.length===0&&<div className="rpt-empty-state"><IcFile /><p>No transactions available to generate report</p></div>}
    </ReportShell>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY DROPDOWN
// ═══════════════════════════════════════════════════════════════════════════════
const CreateCategoryModal = ({ onClose, onAdd }: { onClose:()=>void; onAdd:(name:string)=>void }) => {
  const [name, setName] = useState("");
  return (
    <div className="modal-overlay" style={{zIndex:1200}} onClick={onClose}>
      <div className="cat-modal" onClick={e=>e.stopPropagation()}>
        <div className="cat-header"><span className="cat-title">Create New Category</span><button className="modal-close" onClick={onClose}><IcX /></button></div>
        <div className="cat-body"><label className="cat-label">Category Name</label><input className="cat-input" placeholder="Ex: Snacks" value={name} onChange={e=>setName(e.target.value)} autoFocus/></div>
        <div className="cat-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!name.trim()} onClick={() => { if(name.trim()){onAdd(name.trim());onClose();} }}>Add</button>
        </div>
      </div>
    </div>
  );
};

const CategoryDropdown = ({ categories, selectedCat, onSelect, onAddCategory }: {
  categories: string[]; selectedCat: string;
  onSelect: (c: string) => void; onAddCategory: (c: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if(ref.current&&!ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h);
  },[]);
  return (
    <>
      <div className="cat-dropdown-wrap" ref={ref}>
        <div className={`cat-dropdown-trigger${open?" open":""}`} onClick={()=>setOpen(v=>!v)}>
          <IcSearch /><span className="cat-dropdown-label">{selectedCat||"Search Categories"}</span><IcChevDown />
        </div>
        {open&&(
          <div className="cat-dropdown-menu">
            {categories.length>0&&categories.map(c=>(
              <div key={c} className={`cat-dropdown-option${selectedCat===c?" active":""}`}
                onClick={()=>{onSelect(selectedCat===c?"":c);setOpen(false);}}>{c}</div>
            ))}
            <div className="cat-add-option" onClick={()=>{setOpen(false);setShowCreate(true);}}>
              <span className="cat-add-dashed">+ Add Category</span>
            </div>
          </div>
        )}
      </div>
      {showCreate&&<CreateCategoryModal onClose={()=>setShowCreate(false)} onAdd={c=>{onAddCategory(c);onSelect(c);}}/>}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ITEMS LIST PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const ItemsListPage = ({ items, onItemClick, onDelete, search, setSearch,
  lowStockFilter, setLowStockFilter, onReportNav, onOpenSettings,
  categories, selectedCat, onSelectCat, onAddCategory }: {
  items: Item[]; onItemClick:(id:string)=>void; onDelete:(id:string)=>void;
  search:string; setSearch:(v:string)=>void;
  lowStockFilter:boolean; setLowStockFilter:(v:boolean)=>void;
  onReportNav:(r:ReportView)=>void; onOpenSettings:()=>void;
  categories:string[]; selectedCat:string;
  onSelectCat:(c:string)=>void; onAddCategory:(c:string)=>void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const h=(e:MouseEvent)=>{if(menuRef.current&&!menuRef.current.contains(e.target as Node))setMenuOpen(false);};
    document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h);
  },[]);

  const totalStockValue = items.reduce((sum, it) => sum + itemStockValue(it), 0);
  const lowCount = lowStockItems(items).length;
  const filtered = items.filter(it => {
    const q = search.toLowerCase();
    const matchSearch = !q || it.itemName.toLowerCase().includes(q) || it.itemCode.toLowerCase().includes(q);
    const matchCat  = selectedCat ? it.category === selectedCat : true;
    const matchLow  = lowStockFilter ? isLowStock(it) : true;
    return matchSearch && matchCat && matchLow;
  });

  const REPORTS: {key:ReportView;label:string}[] = [
    {key:"rate_list",label:"Rate List"},{key:"stock_summary",label:"Stock Summary"},
    {key:"low_stock",label:"Low Stock Summary"},{key:"item_sales",label:"Item Sales Summary"},
  ];

  return (
    <div className="items-page">
      <div className="page-header">
        <h1 className="page-title">Items</h1>
        <div className="page-header-actions">
          <div className="reports-wrap" ref={menuRef}>
            <button className="btn-outline" onClick={()=>setMenuOpen(v=>!v)}><IcReports /> Reports <IcChevDown /></button>
            {menuOpen&&<div className="reports-menu">{REPORTS.map(r=><div key={r.key} className="reports-menu-item" onClick={()=>{onReportNav(r.key);setMenuOpen(false);}}>{r.label}</div>)}</div>}
          </div>
          <button className="btn-icon-sm" onClick={onOpenSettings}><IcSettings /></button>
          <button className="btn-icon-sm"><IcChat /></button>
        </div>
      </div>
      <div className="stats-row">
        <div className="stat-card stat-card-clickable" onClick={()=>onReportNav("stock_summary")}>
          <div className="stat-label"><IcTrending /> Stock Value <span className="info-icon"><IcInfo /></span></div>
          <div className="stat-value">{fmtRs(totalStockValue)}</div>
          <button className="stat-expand" onClick={e=>{e.stopPropagation();onReportNav("stock_summary");}}><IcExtLink /></button>
        </div>
        <div className="stat-card stat-card-clickable" onClick={()=>onReportNav("low_stock")}>
          <div className="stat-label"><IcAlert /> Low Stock</div>
          <div className="stat-value">{lowCount}</div>
          <button className="stat-expand" onClick={e=>{e.stopPropagation();onReportNav("low_stock");}}><IcExtLink /></button>
        </div>
      </div>
      <div className="table-card">
        <div className="list-toolbar">
          <div className="toolbar-left">
            <div className="search-box"><IcSearch /><input className="search-input" placeholder="Search by item name or code" value={search} onChange={e=>setSearch(e.target.value)}/></div>
            <CategoryDropdown categories={categories} selectedCat={selectedCat} onSelect={onSelectCat} onAddCategory={onAddCategory}/>
          </div>
          <div className="toolbar-right">
            <button className={`btn-filter${lowStockFilter?" active":""}`} onClick={()=>setLowStockFilter(!lowStockFilter)}>
              <IcAlert /> {lowStockFilter ? "Show All Stock" : "Low Stock"}
            </button>
            <button className="btn-bulk"><IcLayers /> Bulk Actions <IcChevDown /></button>
            <button className="btn-create" onClick={()=>{ window.location.href="/create-item"; }}><IcPlus /> Create Item</button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="items-table">
            <thead>
              <tr>
                <th className="th-check"><input type="checkbox"/></th>
                <th>Item Name <IcChevDown /></th>
                <th>Item Code</th>
                <th>Stock QTY <IcChevDown /></th>
                <th>Selling Price</th>
                <th>Purchase Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item=>(
                <tr key={item.id} className="item-row" onClick={()=>onItemClick(item.id)}>
                  <td className="td-check" onClick={e=>e.stopPropagation()}><input type="checkbox"/></td>
                  <td className="td-name">{item.itemName}</td>
                  <td className="td-secondary">{item.itemCode||"-"}</td>
                  <td className={parseQty(item.stockQty)<0?"qty-neg":"td-secondary"}>{item.stockQty}</td>
                  <td className="td-secondary">{fmt(item.sellingPrice)}</td>
                  <td className="td-secondary">{fmt(item.purchasePrice)}</td>
                  <td className="td-actions" onClick={e=>e.stopPropagation()}>
                    <button className="icon-btn-danger" title="Remove item" onClick={e=>{e.stopPropagation();onDelete(item.id);}}><IcTrash /></button>
                  </td>
                </tr>
              ))}
              {filtered.length===0&&<tr><td colSpan={7} className="empty-state">No items found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
type AppView = "list"|"detail"|"report";

export default function ItemsPage() {
  const [items,          setItems]          = useState<Item[]>([]);
  const [view,           setView]           = useState<AppView>("list");
  const [selectedId,     setSelectedId]     = useState<string|null>(null);
  const [detailLoading,  setDetailLoading]  = useState(false);
  const [adjustItem,     setAdjustItem]     = useState<Item|null>(null);
  const [editItem,       setEditItem]       = useState<Item|null>(null);
  const [search,         setSearch]         = useState("");
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [toast,          setToast]          = useState<string|null>(null);
  const [activeReport,   setActiveReport]   = useState<ReportView|null>(null);
  const [showSettings,   setShowSettings]   = useState(false);
  const [settings,       setSettings]       = useState<ItemSettings>(DEFAULT_SETTINGS);
  const [customFields,   setCustomFields]   = useState<CustomField[]>([]);
  const [categories,     setCategories]     = useState<string[]>([]);
  const [selectedCat,    setSelectedCat]    = useState("");

  // ─── Fetch All Items ──────────────────────────────────────────────────────
  const fetchItems = async (setter: typeof setItems) => {
    try {
      const res = await api.get("/items");
      const backendItems = res.data.data || res.data;
      const formatted = backendItems.map((item: any) => {
        const totalStock = item.ProductStock
          ? item.ProductStock.reduce((sum: number, s: any) => sum + (s.openingStock || 0), 0)
          : 0;
        return {
          id: String(item.id),
          itemName: item.name || "",
          itemCode: item.itemCode || "",
          stockQty: `${totalStock} PCS`,
          stockNumber: totalStock,
          sellingPrice: item.salesPrice ?? null,
          purchasePrice: item.purchasePrice ?? null,
          category: item.category || "",
          gstTaxRate: item.gstRate ? `${item.gstRate}%` : "18%",
          hsnCode: item.hsnCode || "",
          secondaryUnit: "-",
          lowStockQty: item.lowStockQty != null ? String(item.lowStockQty) : "-",
          lowStockWarning: item.lowStockAlert === true ? "Enabled" : "Disabled" as "Enabled"|"Disabled",
          itemDescription: item.description || "",
          stockDetails: [], partyWiseReport: [], godownStock: [], partyWisePrices: [],
        };
      });
      const cats: string[] = Array.from(
        new Set(backendItems.map((i: any): string => String(i.category || "").trim()).filter((c: string) => c !== ""))
      );
      setter(formatted);
      setCategories(cats);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  // ─── Fetch Single Item Detail ─────────────────────────────────────────────
  const fetchItemById = async (id: string): Promise<void> => {
  setDetailLoading(true);

  try {

   const [itemRes, ledgerRes, purchaseRes] = await Promise.all([
  api.get(`/items/${id}`),
  api.get(`/stock-ledger/product/${id}`),
  api.get(`/purchase-invoices`)
]);
const purchaseMap: Record<number, string> = {};

(purchaseRes.data.data || purchaseRes.data).forEach((p: any) => {
  purchaseMap[p.id] = p.purchaseInvNo;
});

    const d = itemRes.data.data;
    const ledger = (ledgerRes.data.data || []).map((l: any) => {

  let invoiceNo = "-";

  if (l.transactionType === "Purchase Invoice") {
    invoiceNo = purchaseMap[l.invoiceNumber] || l.invoiceNumber;
  }

  if (l.transactionType === "Sales Invoice") {
    invoiceNo = l.invoiceNumber;
  }

  // Stock adjustment should not have invoice number
  if (l.transactionType === "Stock Adjustment") {
    invoiceNo = "-";
  }

  return {
    ...l,
    invoiceNumber: invoiceNo
  };
});

    const fullItem: Item = {
      id: String(d.id),
      itemName: d.itemName,
      itemCode: d.itemCode,
      stockQty: d.stockQty,
      stockNumber: d.stockNumber,
      sellingPrice: d.sellingPrice,
      purchasePrice: d.purchasePrice,
      category: d.category,
      gstTaxRate: d.gstTaxRate,
      hsnCode: d.hsnCode,
      secondaryUnit: d.secondaryUnit,
      lowStockQty: d.lowStockQty,
      lowStockWarning: d.lowStockWarning,
      itemDescription: d.itemDescription,

      stockDetails: ledger,

      partyWiseReport: d.partyWiseReport ?? [],
      godownStock: d.godownStock ?? [],
      partyWisePrices: d.partyWisePrices ?? [],
    };

    setItems(prev =>
      prev.map(it => (it.id === id ? fullItem : it))
    );

  } catch (err) {
    console.error("fetchItemById error:", err);
  } finally {
    setDetailLoading(false);
  }
};

  useEffect(() => { fetchItems(setItems); }, []);

  const selectedItem = items.find(i => i.id === selectedId) ?? null;

  // ─── Navigation ───────────────────────────────────────────────────────────
  const goDetail = async (id: string) => {
    setSelectedId(id);
    setView("detail");
    await fetchItemById(id);
  };
  const goList     = ()              => { setView("list"); setSelectedId(null); };
  const goReport   = (r: ReportView) => { setActiveReport(r); setView("report"); };
  const backReport = ()              => { setView("list"); setActiveReport(null); };

  // ─── Soft-delete confirmation state ──────────────────────────────────────
  const [pendingDeleteId,   setPendingDeleteId]   = useState<string | null>(null);
  const [pendingDeleteName, setPendingDeleteName] = useState<string>("");

  // ─── CRUD ─────────────────────────────────────────────────────────────────
  // SOFT-DELETE: sets status → "disabled" on the backend (keeps DB record).
  // The item is hidden from the list immediately on the frontend.
  // To restore, update status → "active" via backend.
  const requestDelete = (id: string, name: string) => {
    setPendingDeleteId(id);
    setPendingDeleteName(name);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    try {
      // Soft-delete: PUT with status disabled (item stays in DB)
      await api.put(`/items/${id}`, { status: "disabled" });
      setItems(p => p.filter(i => i.id !== id));
      setSelectedId(null); setView("list");
      setToast("Item disabled (soft-deleted). It no longer appears in the list.");
    } catch (error) {
      console.error("Soft-delete failed:", error);
      setToast("Failed to remove item. Please try again.");
    }
  };

  const cancelDelete = () => setPendingDeleteId(null);

  // Legacy alias kept for any existing call-sites that pass a single id
  const deleteItem = (id: string) => {
    const item = items.find(i => i.id === id);
    requestDelete(id, item?.itemName ?? "this item");
  };

  const saveEditedItem = async (updated: Item) => {
    try {
      await api.put(`/items/${updated.id}`, {
        name: updated.itemName, itemCode: updated.itemCode,
        category: updated.category, salesPrice: updated.sellingPrice,
        purchasePrice: updated.purchasePrice,
        gstRate: updated.gstTaxRate ? Number(updated.gstTaxRate.replace("%","")) : null,
        hsnCode: updated.hsnCode, description: updated.itemDescription,
      });
      await fetchItemById(updated.id);
      setToast("Item updated successfully");
    } catch (error) { console.error("Update failed:", error); }
  };

  // ─── Called by AdjustModal after successful API save ─────────────────────
  const handleAdjustSaved = async (itemId: string) => {
    setToast("Stock adjusted successfully");
    await fetchItems(setItems);          // refresh list-level stock counts
    await fetchItemById(itemId);         // refresh all tabs for this item
  };

  const saveSettings = (s: ItemSettings, cf: CustomField[]) => {
    setSettings(s); setCustomFields(cf); setToast("Settings saved");
  };

  return (
    <>
      {view==="list"&&(
        <ItemsListPage items={items} onItemClick={goDetail} onDelete={deleteItem}
          search={search} setSearch={setSearch}
          lowStockFilter={lowStockFilter} setLowStockFilter={setLowStockFilter}
          onReportNav={goReport} onOpenSettings={()=>setShowSettings(true)}
          categories={categories} selectedCat={selectedCat}
          onSelectCat={setSelectedCat} onAddCategory={c=>setCategories(p=>[...p,c])}
        />
      )}
      {view==="detail"&&selectedItem&&(
        <ItemDetailPage
          item={items.find(i=>i.id===selectedItem.id) ?? selectedItem}
          onBack={goList}
          onDelete={deleteItem}
          onAdjust={()=>setAdjustItem(items.find(i=>i.id===selectedId) ?? null)}
          onEdit={()=>setEditItem(selectedItem)}
          loading={detailLoading}
        />
      )}
      {view==="report"&&activeReport==="rate_list"     &&<RateListPage         items={items} onBack={backReport}/>}
      {view==="report"&&activeReport==="stock_summary" &&<StockSummaryPage     items={items} onBack={backReport}/>}
      {view==="report"&&activeReport==="low_stock"     &&<LowStockSummaryPage  items={items} onBack={backReport}/>}
      {view==="report"&&activeReport==="item_sales"    &&<ItemSalesSummaryPage items={items} onBack={backReport}/>}

      {/* AdjustModal — now uses onSaved instead of onSave */}
      {adjustItem&&(
        <AdjustModal
          item={adjustItem}
          onClose={()=>setAdjustItem(null)}
          onSaved={handleAdjustSaved}
        />
      )}

      {editItem&&<EditItemModal item={editItem} onClose={()=>setEditItem(null)} onSave={saveEditedItem}/>}
      {showSettings&&<SettingsModal settings={settings} customFields={customFields} onClose={()=>setShowSettings(false)} onSave={saveSettings}/>}
      {toast&&<Toast msg={toast} onDone={()=>setToast(null)}/>}

      {/* ── Soft-Delete Confirmation Modal ── */}
      {pendingDeleteId && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:12, width:380, boxShadow:"0 20px 60px rgba(0,0,0,.18)", fontFamily:"inherit", overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid #f3f4f6" }}>
              <span style={{ fontSize:15, fontWeight:700, color:"#111827" }}>Remove Item</span>
              <button onClick={cancelDelete} style={{ background:"none", border:"1px solid #e5e7eb", borderRadius:6, width:28, height:28, cursor:"pointer", color:"#6b7280", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>✕</button>
            </div>
            <div style={{ padding:"20px", fontSize:13.5, color:"#374151", lineHeight:1.6 }}>
              <p>Are you sure you want to remove <strong>{pendingDeleteName}</strong>?</p>
              <p style={{ marginTop:8, color:"#6b7280", fontSize:12.5 }}>
                The item will be hidden from the inventory list but its history (stock ledger, invoices) will be preserved in the database.
              </p>
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:10, padding:"14px 20px", borderTop:"1px solid #f3f4f6" }}>
              <button onClick={cancelDelete} style={{ padding:"8px 22px", border:"1px solid #e5e7eb", background:"#fff", borderRadius:8, fontSize:13, cursor:"pointer", color:"#374151", fontWeight:500, fontFamily:"inherit" }}>Cancel</button>
              <button onClick={confirmDelete} style={{ padding:"8px 22px", background:"#fff", border:"1.5px solid #ef4444", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", color:"#ef4444", fontFamily:"inherit" }}>Yes, Remove</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}