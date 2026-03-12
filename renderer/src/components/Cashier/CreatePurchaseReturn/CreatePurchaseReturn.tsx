import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Purchase.css";

/* ══════════════════════════════════════════ ICONS ══ */
const IC = {
  Chevron:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevronL: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronR: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Settings: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Monitor:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  Search:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Calendar: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Dots:     ()=><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>,
  X:        ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Edit:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  Plus:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Back:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  Barcode:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M3 5v14M7 5v14M11 5v14M15 5v14M19 5v14M21 5v4M21 15v4M21 9v2"/></svg>,
  Info:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  ArrowUp:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>,
  AddCircle:()=><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="12" fill="#4361ee"/><line x1="12" y1="7" x2="12" y2="17" stroke="white" strokeWidth={2.5} strokeLinecap="round"/><line x1="7" y1="12" x2="17" y2="12" stroke="white" strokeWidth={2.5} strokeLinecap="round"/></svg>,
  Bank:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>,
  History:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/><polyline points="12 7 12 12 15 15"/></svg>,
  Copy:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Download: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Print:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  Share:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  Refresh:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
};

/* ══════════════════════════════════════════ TYPES ══ */
type PRStatus = "credited" | "pending" | "";
type PRPage   = "list" | "create" | "edit" | "duplicate" | "view";

interface PRItem    { id: number; name: string; hsn: string; qty: number; price: number; discount: number; tax: number; }
interface PRCharge  { id: number; label: string; amount: number; taxRate: string; }
interface PurchaseReturn {
  id: number; date: string; returnNumber: number; partyName: string; partyId: number;
  partyPhone: string; purchaseNo: string; amount: number; status: PRStatus;
  items: PRItem[]; charges: PRCharge[];
  discountEnabled: boolean; discountType: "%" | "₹"; discountVal: number;
  roundOff: boolean; roundOffDir: string; roundOffVal: number;
  amtReceived: number; payMethod: string; linkedInvoice: string;
}
interface PRSettings { prefixEnabled: boolean; prefix: string; sequenceNumber: number; showItemImage: boolean; }
interface Party      { id: number; name: string; phone: string; pan: string; balance: number; }
interface CatalogItem { id: number; name: string; code: string; stock: string; salesPrice: number; purchasePrice: number; }

type DateFilter = "Today"|"Yesterday"|"This Week"|"Last Week"|"Last 7 Days"|"This Month"|"Previous Month"|"Last 30 Days"|"Last 365 Days"|"Custom";
const DATE_OPTS: DateFilter[] = ["Today","Yesterday","This Week","Last Week","Last 7 Days","This Month","Previous Month","Last 30 Days","Last 365 Days","Custom"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const fmtDate  = (d: Date): string => d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
const fmtShort = (d: Date): string => `${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)} ${d.getFullYear()}`;
const fmtMoney = (n: number): string => n===0 ? "₹0" : `₹${Math.abs(n).toLocaleString("en-IN")}`;
const fmtAmt   = (n: number): string => `₹ ${n.toLocaleString("en-IN")}`;
const todayStr = (): string => {
  const d = new Date();
  return `${d.getDate().toString().padStart(2,"0")} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]} ${d.getFullYear()}`;
};
const dateToStr = (iso: string): string => {
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2,"0")} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]} ${d.getFullYear()}`;
};

function numToWords(n: number): string {
  if (n === 0) return "Zero Rupees";
  const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  function words(num: number): string {
    if (num < 20) return a[num];
    if (num < 100) return b[Math.floor(num/10)] + (num%10 ? " "+a[num%10] : "");
    if (num < 1000) return a[Math.floor(num/100)] + " Hundred" + (num%100 ? " "+words(num%100) : "");
    if (num < 100000) return words(Math.floor(num/1000)) + " Thousand" + (num%1000 ? " "+words(num%1000) : "");
    if (num < 10000000) return words(Math.floor(num/100000)) + " Lakh" + (num%100000 ? " "+words(num%100000) : "");
    return words(Math.floor(num/10000000)) + " Crore" + (num%10000000 ? " "+words(num%10000000) : "");
  }
  return words(Math.floor(n)) + " Rupees";
}

function getRange(f: DateFilter, from?: Date, to?: Date): [Date, Date] {
  const t = new Date(), s = new Date(t), e = new Date(t);
  switch (f) {
    case "Yesterday":      s.setDate(t.getDate()-1); e.setDate(t.getDate()-1); break;
    case "This Week":      s.setDate(t.getDate()-t.getDay()); break;
    case "Last Week":      { const d=t.getDay(); s.setDate(t.getDate()-d-7); e.setDate(t.getDate()-d-1); break; }
    case "Last 7 Days":    s.setDate(t.getDate()-6); break;
    case "This Month":     s.setDate(1); break;
    case "Previous Month": s.setMonth(t.getMonth()-1,1); e.setDate(0); break;
    case "Last 30 Days":   s.setDate(t.getDate()-29); break;
    case "Last 365 Days":  s.setFullYear(t.getFullYear()-1); break;
    case "Custom":         if (from && to) return [from, to]; break;
  }
  s.setHours(0,0,0,0); e.setHours(23,59,59,999); return [s, e];
}

const PARTIES: Party[] = [
  {id:1,name:"Aditya",phone:"",pan:"",balance:0},
  {id:2,name:"anando",phone:"0987643211",pan:"ljjjmkpmp",balance:-65744},
  {id:3,name:"Cash Sale",phone:"9555780835",pan:"",balance:0},
  {id:4,name:"cgfwh",phone:"",pan:"",balance:0},
  {id:5,name:"MONDIAL ELECTRONIC",phone:"",pan:"",balance:0},
  {id:6,name:"Ramakant Pandit",phone:"",pan:"",balance:0},
  {id:7,name:"rniijni",phone:"",pan:"",balance:-77600},
];

const CATALOG: CatalogItem[] = [
  {id:1,name:"BILLING SOFTWARE MOBILE APP",code:"",stock:"",salesPrice:256,purchasePrice:0},
  {id:2,name:"BILLING SOFTWARE WITH GST",code:"",stock:"",salesPrice:169875,purchasePrice:0},
  {id:3,name:"BILLING SOFTWARE WITHOUT GST",code:"",stock:"",salesPrice:3556,purchasePrice:0},
  {id:4,name:"GODREJ FRIDGE",code:"34567",stock:"144 ACS",salesPrice:42000,purchasePrice:0},
  {id:5,name:"HEKER AC",code:"1234",stock:"93 PCS",salesPrice:45000,purchasePrice:38000},
  {id:6,name:"HISENSE 32 INCH",code:"",stock:"38 PCS",salesPrice:21000,purchasePrice:18000},
  {id:7,name:"HISENSE 43INCG TV",code:"00974",stock:"119 PCS",salesPrice:30000,purchasePrice:0},
];

const PURCHASE_INVOICES = ["INV-001 (Cash Sale)", "INV-002 (anando)", "INV-003 (MONDIAL)"];

const SEED_RETURNS: PurchaseReturn[] = [
  {id:1,date:"2026-03-05",returnNumber:1,partyName:"Cash Sale",partyId:3,partyPhone:"9555780835",
   purchaseNo:"-",amount:0,status:"credited",
   items:[
     {id:2,name:"BILLING SOFTWARE WITH GST",hsn:"",qty:1,price:0,discount:0,tax:0},
     {id:3,name:"BILLING SOFTWARE WITHOUT GST",hsn:"",qty:1,price:0,discount:0,tax:0},
   ],
   charges:[],discountEnabled:false,discountType:"%",discountVal:0,
   roundOff:false,roundOffDir:"+Add",roundOffVal:0,
   amtReceived:0,payMethod:"Cash",linkedInvoice:""},
];

/* ══════════════════════════════════════════ SETTINGS MODAL ══ */
function PRSettingsModal({ prSettings, setPrSettings, onClose, onSave }: {
  prSettings: PRSettings;
  setPrSettings: React.Dispatch<React.SetStateAction<PRSettings>>;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="pi-overlay" onClick={onClose}>
      <div className="pi-modal pr-settings-modal" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <div className="pi-modal-head">
          <span className="pi-modal-title">Quick Purchase Return Settings</span>
          <button className="pi-modal-close" onClick={onClose}><IC.X/></button>
        </div>
        <div className="pi-s-block">
          <div className="pi-s-top">
            <span className="pi-s-name">Purchase Return Prefix &amp; Sequence Number</span>
            <label className="toggle">
              <input type="checkbox" checked={prSettings.prefixEnabled} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrSettings(p => ({...p, prefixEnabled: e.target.checked}))}/>
              <span className="toggle-slider"/>
            </label>
          </div>
          <p className="pi-s-desc">Add your custom prefix &amp; sequence for Purchase Return Numbering.</p>
          {prSettings.prefixEnabled && (
            <>
              <div className="pi-s-fields">
                <div>
                  <label>Prefix</label>
                  <input placeholder="Prefix" value={prSettings.prefix} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrSettings(p => ({...p, prefix: e.target.value}))}/>
                </div>
                <div>
                  <label>Sequence Number</label>
                  <input type="number" value={prSettings.sequenceNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrSettings(p => ({...p, sequenceNumber: Number(e.target.value)}))}/>
                </div>
              </div>
              <p className="pi-s-note">Purchase Return Number: {prSettings.prefix}{prSettings.sequenceNumber}</p>
            </>
          )}
        </div>
        <div className="pi-s-block">
          <div className="pi-s-top">
            <span className="pi-s-name">Show Item Image on Invoice</span>
            <label className="toggle">
              <input type="checkbox" checked={prSettings.showItemImage} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrSettings(p => ({...p, showItemImage: e.target.checked}))}/>
              <span className="toggle-slider"/>
            </label>
          </div>
          <p className="pi-s-desc">This will apply to all vouchers except for Payment In and Payment Out</p>
        </div>
        <div className="pi-modal-foot">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════ CALENDAR ══ */
function CalendarPicker({ onApply, onCancel }: { onApply: (f: Date, t: Date) => void; onCancel: () => void; }) {
  const today = new Date();
  const [vy, setVy] = useState<number>(today.getFullYear());
  const [vm, setVm] = useState<number>(today.getMonth());
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [hov, setHov] = useState<Date | null>(null);

  const prev = () => { if (vm === 0) { setVm(11); setVy(y => y-1); } else setVm(m => m-1); };
  const next = () => { if (vm === 11) { setVm(0); setVy(y => y+1); } else setVm(m => m+1); };

  const cells = (): (Date | null)[] => {
    const f = new Date(vy, vm, 1), l = new Date(vy, vm+1, 0), a: (Date|null)[] = [];
    for (let i = 0; i < f.getDay(); i++) a.push(null);
    for (let d = 1; d <= l.getDate(); d++) a.push(new Date(vy, vm, d));
    while (a.length % 7 !== 0) a.push(null);
    return a;
  };

  const same = (a: Date, b: Date): boolean =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const inR = (d: Date): boolean => {
    const e2 = end || hov;
    if (!start || !e2) return false;
    const mn = start < e2 ? start : e2, mx = start < e2 ? e2 : start;
    return d > mn && d < mx;
  };

  const pick = (d: Date): void => {
    if (!start || (start && end)) { setStart(d); setEnd(null); }
    else { if (d < start) { setEnd(start); setStart(d); } else setEnd(d); }
  };

  const cs = cells();

  return (
    <div className="pi-cal-overlay">
      <div className="pi-cal-header-row">
        <div className="pi-cal-section"><div className="pi-cal-section-label">Select Start Date</div><div className="pi-cal-section-value">{start ? fmtShort(start) : ""}</div></div>
        <div className="pi-cal-sep"/>
        <div className="pi-cal-section"><div className="pi-cal-section-label">Select End Date</div><div className="pi-cal-section-value">{end ? fmtShort(end) : ""}</div></div>
      </div>
      <div className="pi-cal-nav">
        <button className="pi-cal-nav-btn" onClick={prev}><IC.ChevronL/></button>
        <span className="pi-cal-month-label">{MONTHS[vm]} {vy}</span>
        <button className="pi-cal-nav-btn" onClick={next}><IC.ChevronR/></button>
      </div>
      <table className="pi-cal-grid">
        <thead><tr>{DAYS.map(d => <th key={d}>{d}</th>)}</tr></thead>
        <tbody>
          {Array.from({length: cs.length/7}, (_, r) => (
            <tr key={r}>
              {cs.slice(r*7, r*7+7).map((d, i) => {
                if (!d) return <td key={i}/>;
                const isSel = !!(start && same(d, start)) || !!(end && same(d, end));
                const isStart = !!(start && same(d, start)) && !!end;
                const isEnd = !!(end && same(d, end));
                let cls = "pi-cal-day";
                if (isStart) cls += " range-start";
                else if (isEnd) cls += " range-end";
                else if (isSel) cls += " selected";
                if (!isSel && inR(d)) cls += " in-range";
                if (same(d, today) && !isSel) cls += " today";
                return (
                  <td key={i}>
                    <button className={cls} onClick={() => pick(d)}
                      onMouseEnter={() => setHov(d)} onMouseLeave={() => setHov(null)}>
                      {d.getDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pi-cal-footer">
        <button className="pi-cal-cancel" onClick={onCancel}>CANCEL</button>
        <button className="pi-cal-ok" onClick={() => { if (start && end) onApply(start, end); }}>OK</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════ BILL VIEW PAGE ══ */
function BillViewPage({ record, onBack, onEdit, onDuplicate, onDelete }: {
  record: PurchaseReturn;
  onBack: () => void;
  onEdit: (r: PurchaseReturn) => void;
  onDuplicate: (r: PurchaseReturn) => void;
  onDelete: (id: number) => void;
}) {
  const [showCtx, setShowCtx] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const ctxRef  = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (
        ctxRef.current && !ctxRef.current.contains(e.target as Node) &&
        dotsRef.current && !dotsRef.current.contains(e.target as Node)
      ) setShowCtx(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const showT = (m: string): void => { setToast(m); setTimeout(() => setToast(null), 2400); };

  const subtotal      = record.items.reduce((s, i) => s + (i.qty * i.price - i.discount), 0);
  const totalTax      = record.items.reduce((s, i) => s + (i.qty * i.price * i.tax / 100), 0);
  const chargesTotal  = (record.charges || []).reduce((s, c) => s + c.amount, 0);
  const taxableAmount = subtotal + chargesTotal;
  const discountAmt   = record.discountEnabled
    ? (record.discountType === "%" ? taxableAmount * record.discountVal / 100 : record.discountVal)
    : 0;
  const roundOffAmt   = record.roundOff ? (record.roundOffDir === "+Add" ? record.roundOffVal : -record.roundOffVal) : 0;
  const totalAmt      = taxableAmount - discountAmt + totalTax + roundOffAmt;

  const dateObj = new Date(record.date + "T12:00:00");
  const returnDateDisplay = `${dateObj.getDate().toString().padStart(2,"0")}/${(dateObj.getMonth()+1).toString().padStart(2,"0")}/${dateObj.getFullYear()} ${dateObj.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true}).toUpperCase()}`;

  const doCtxAction = (action: string): void => {
    setShowCtx(false);
    if (action === "edit")      onEdit(record);
    if (action === "history")   showT(`Edit history for Return #${record.returnNumber}`);
    if (action === "duplicate") onDuplicate(record);
    if (action === "delete")    onDelete(record.id);
  };

  /* inline styles kept minimal — reuse Purchase.css classes where possible */
  const hoverStyle = (e: React.MouseEvent<HTMLDivElement>, hover: boolean, danger?: boolean): void => {
    (e.currentTarget as HTMLDivElement).style.background = hover ? (danger ? "#fff5f5" : "#f5f6fa") : "transparent";
  };

  return (
    <div className="bv-page">
      {/* ── Top bar ── */}
      <div className="bv-topbar">
        <div className="bv-title-wrap">
          <button className="bv-back-btn" onClick={onBack}><IC.Back/></button>
          <span className="bv-page-title">Purchase Return #{record.returnNumber}</span>
          {record.status === "credited" && <span className="pr-status-credited">Credited</span>}
          {record.status === "pending"  && <span className="s-badge s-unpaid">Pending</span>}
        </div>
        <div className="bv-topbar-actions">
          <button className="bv-action-btn"><IC.Download/> Download PDF</button>
          <button className="bv-action-btn"><IC.Print/> Print PDF</button>
          <button className="bv-action-btn bv-icon-btn"><IC.Refresh/></button>
          <button className="bv-action-btn"><IC.Share/> Share <span style={{fontSize:11}}>▾</span></button>
          {/* 3-dot */}
          <div style={{position:"relative"}}>
            <button ref={dotsRef} className={`bv-action-btn bv-dots-btn${showCtx?" active":""}`}
              onClick={() => setShowCtx(v => !v)}><IC.Dots/></button>
            {showCtx && (
              <div ref={ctxRef} className="pi-ctx bv-ctx">
                <div className="pi-dd-item" onMouseEnter={e=>hoverStyle(e,true)} onMouseLeave={e=>hoverStyle(e,false)} onClick={() => doCtxAction("edit")}><IC.Edit/>Edit</div>
                <div className="pi-dd-divider"/>
                <div className="pi-dd-item" onMouseEnter={e=>hoverStyle(e,true)} onMouseLeave={e=>hoverStyle(e,false)} onClick={() => doCtxAction("history")}><IC.History/>Edit History</div>
                <div className="pi-dd-divider"/>
                <div className="pi-dd-item" onMouseEnter={e=>hoverStyle(e,true)} onMouseLeave={e=>hoverStyle(e,false)} onClick={() => doCtxAction("duplicate")}><IC.Copy/>Duplicate</div>
                <div className="pi-dd-divider"/>
                <div className="pi-dd-item danger" onMouseEnter={e=>hoverStyle(e,true,true)} onMouseLeave={e=>hoverStyle(e,false,true)} onClick={() => doCtxAction("delete")}><IC.Trash/>Delete</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bill paper ── */}
      <div className="bv-body">
        <div className="bv-paper">

          {/* Company header */}
          <div className="bv-header">
            <div className="bv-company-block">
              <div className="bv-logo">
                <span>SCRATCH</span>
              </div>
              <div>
                <div className="bv-company-name">scratchweb.solutions</div>
                <div className="bv-company-details">
                  WEST SHANTINAGAR ANANDNAGAR BALLY<br/>
                  HOWRAH SAREE HOUSE, HOWRAH, 711227<br/>
                  Mobile: 06289909521<br/>
                  Email: rakeshranjantiwar11@gmail.com
                </div>
              </div>
            </div>
            <div className="bv-header-right">
              <div className="bv-doc-type">PURCHASE RETURN</div>
              <div className="bv-meta-row">
                <div className="bv-meta-block">
                  <div className="bv-meta-label">Return No.</div>
                  <div className="bv-meta-value">{record.returnNumber}</div>
                </div>
                <div className="bv-meta-block">
                  <div className="bv-meta-label">Return Date</div>
                  <div className="bv-meta-value">{returnDateDisplay}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="bv-bill-to-row">
            <div>
              <div className="bv-section-label">BILL TO</div>
              <div className="bv-party-name">{record.partyName}</div>
              {record.partyPhone && <div className="bv-party-detail">Mobile: {record.partyPhone}</div>}
            </div>
          </div>

          {/* Items table */}
          <table className="bv-items-table">
            <thead>
              <tr>
                <th style={{width:46,textAlign:"center"}}>S.NO.</th>
                <th>SERVICES</th>
                <th style={{width:80,textAlign:"center"}}>QTY</th>
                <th style={{width:80,textAlign:"right"}}>RATE</th>
                <th style={{width:100,textAlign:"center"}}>TAX</th>
                <th style={{width:100,textAlign:"right"}}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {record.items.length === 0 ? (
                <tr><td colSpan={6} style={{padding:32,textAlign:"center",color:"#98a2b3",fontSize:13}}>No items</td></tr>
              ) : record.items.map((item, idx) => {
                const amt    = item.qty * item.price - item.discount;
                const taxAmt = item.qty * item.price * item.tax / 100;
                return (
                  <tr key={item.id}>
                    <td style={{textAlign:"center",color:"#667085"}}>{idx + 1}</td>
                    <td>
                      <div style={{fontWeight:600,color:"#1a2332"}}>{item.name}</div>
                      {item.hsn && <div style={{fontSize:11,color:"#98a2b3",marginTop:2}}>HSN: {item.hsn}</div>}
                    </td>
                    <td style={{textAlign:"center"}}>{item.qty} PCS</td>
                    <td style={{textAlign:"right"}}>{item.price}</td>
                    <td style={{textAlign:"center"}}>
                      <div>{item.tax > 0 ? `₹ ${taxAmt.toLocaleString("en-IN")}` : 0}</div>
                      <div style={{fontSize:11,color:"#98a2b3"}}>({item.tax}%)</div>
                    </td>
                    <td style={{textAlign:"right",fontWeight:600}}>{amt}</td>
                  </tr>
                );
              })}
              {/* padding rows */}
              {record.items.length < 6 && Array.from({length: Math.max(0, 4 - record.items.length)}).map((_, i) => (
                <tr key={`pad-${i}`}><td colSpan={6} style={{height:34}}></td></tr>
              ))}
            </tbody>
          </table>

          {/* Totals row */}
          <div className="bv-totals-row">
            <div className="bv-totals-label">TOTAL</div>
            <div className="bv-totals-qty">{record.items.reduce((s, i) => s + i.qty, 0)}</div>
            <div className="bv-totals-tax">{totalTax > 0 ? `₹ ${totalTax.toLocaleString("en-IN")}` : "₹ 0"}</div>
            <div className="bv-totals-amt">₹ {totalAmt.toLocaleString("en-IN")}</div>
          </div>
          <div className="bv-received-row">
            <div className="bv-received-label">RECEIVED AMOUNT</div>
            <div className="bv-received-amt">₹ {(record.amtReceived || 0).toLocaleString("en-IN")}</div>
          </div>

          {/* Tax breakdown */}
          <table className="bv-tax-table">
            <thead>
              <tr>
                <th>HSN/SAC</th>
                <th style={{textAlign:"right"}}>Taxable Value</th>
                <th colSpan={2} style={{textAlign:"center",borderLeft:"1px solid #eaecf0"}}>CGST</th>
                <th colSpan={2} style={{textAlign:"center",borderLeft:"1px solid #eaecf0"}}>SGST</th>
                <th style={{textAlign:"right",borderLeft:"1px solid #eaecf0"}}>Total Tax Amount</th>
              </tr>
              <tr className="bv-tax-sub-head">
                <th/><th/>
                <th style={{borderLeft:"1px solid #eaecf0"}}>Rate</th><th>Amount</th>
                <th style={{borderLeft:"1px solid #eaecf0"}}>Rate</th><th>Amount</th>
                <th/>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>-</td>
                <td style={{textAlign:"right"}}>{taxableAmount}</td>
                <td style={{textAlign:"center",borderLeft:"1px solid #eaecf0"}}>0%</td>
                <td style={{textAlign:"center"}}>{totalTax > 0 ? (totalTax/2).toLocaleString("en-IN") : 0}</td>
                <td style={{textAlign:"center",borderLeft:"1px solid #eaecf0"}}>0%</td>
                <td style={{textAlign:"center"}}>{totalTax > 0 ? (totalTax/2).toLocaleString("en-IN") : 0}</td>
                <td style={{textAlign:"right",fontWeight:600,borderLeft:"1px solid #eaecf0"}}>₹ {totalTax.toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>

          {/* Amount in words */}
          <div className="bv-words-row">
            <div className="bv-words-label">Total Amount (in words)</div>
            <div className="bv-words-value">{numToWords(totalAmt)}</div>
          </div>

          {/* T&C + Signature */}
          <div className="bv-footer-row">
            <div className="bv-tc-block">
              <div className="bv-tc-title">Terms and Conditions</div>
              <div className="bv-tc-text">
                1. Goods once sold will not be taken back or exchanged<br/>
                2. All disputes are subject to jurisdiction only
              </div>
            </div>
            <div className="bv-sig-block">
              <div className="bv-sig-label">Authorized signatory for <strong>scratchweb.solutions</strong></div>
              <div className="bv-sig-box"/>
            </div>
          </div>

        </div>{/* end bv-paper */}
      </div>

      {toast && <div className="pi-toast">{toast}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PURCHASE RETURN FORM  (Create / Edit / Duplicate)
══════════════════════════════════════════════════════════ */
function PurchaseReturnForm({
  mode, seqNo, initialData, onBack, onSaved, onUpdated, onSavedAndNew,
  allParties, setAllParties, prSettings, setPrSettings,
}: {
  mode: "create" | "edit" | "duplicate";
  seqNo: number;
  initialData?: PurchaseReturn;
  onBack: () => void;
  onSaved?: (r: PurchaseReturn) => void;
  onUpdated?: (r: PurchaseReturn) => void;
  onSavedAndNew?: (r: PurchaseReturn) => void;
  allParties: Party[];
  setAllParties: React.Dispatch<React.SetStateAction<Party[]>>;
  prSettings: PRSettings;
  setPrSettings: React.Dispatch<React.SetStateAction<PRSettings>>;
}) {
  const navigate = useNavigate();
  const isEdit = mode === "edit";
  const initParty = initialData ? allParties.find(p => p.id === initialData.partyId) || null : null;

  const [partyState, setPartyState] = useState<"empty"|"searching"|"selected">(initParty ? "selected" : "empty");
  const [partySearch, setPartySearch] = useState<string>("");
  const [selectedParty, setSelectedParty] = useState<Party | null>(initParty);
  const [items, setItems] = useState<PRItem[]>(initialData?.items ?? []);
  const [returnNo] = useState<string>(isEdit ? String(initialData!.returnNumber) : String(seqNo));
  const [returnDate] = useState<string>(isEdit ? dateToStr(initialData!.date) : todayStr());
  const [linkedInvoice, setLinkedInvoice] = useState<string>(initialData?.linkedInvoice ?? "");
  const [invSearch, setInvSearch] = useState<string>("");
  const [showInvDrop, setShowInvDrop] = useState<boolean>(false);
  const [amtReceived, setAmtReceived] = useState<number>(initialData?.amtReceived ?? 0);
  const [payMethod, setPayMethod] = useState<string>(initialData?.payMethod ?? "Cash");
  const [roundOff, setRoundOff] = useState<boolean>(initialData?.roundOff ?? false);
  const [roundOffDir, setRoundOffDir] = useState<string>(initialData?.roundOffDir ?? "+Add");
  const [roundOffVal, setRoundOffVal] = useState<number>(initialData?.roundOffVal ?? 0);
  const [markPaid, setMarkPaid] = useState<boolean>(false);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");
  const [showBankAccount, setShowBankAccount] = useState<boolean>(false);
  const [showCreateParty, setShowCreateParty] = useState<boolean>(false);
  const [showAddItems, setShowAddItems] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [charges, setCharges] = useState<PRCharge[]>(initialData?.charges ?? []);
  const [showDiscount, setShowDiscount] = useState<boolean>(initialData?.discountEnabled ?? false);
  const [showShipModal, setShowShipModal] = useState<boolean>(false);
  const [shipSameAsBill, setShipSameAsBill] = useState<boolean>(true);
  const [shipName, setShipName] = useState<string>("");
  const [shipPhone, setShipPhone] = useState<string>("");
  const [shipAddr, setShipAddr] = useState<string>("");
  const [shipCity, setShipCity] = useState<string>("");
  const [shipState, setShipState] = useState<string>("");
  const [shipPin, setShipPin] = useState<string>("");
  const [discountType, setDiscountType] = useState<"%"|"₹">(initialData?.discountType ?? "%");
  const [discountVal, setDiscountVal] = useState<number>(initialData?.discountVal ?? 0);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [cpName, setCpName] = useState<string>("");
  const [cpPhone, setCpPhone] = useState<string>("");
  const [cpShowAddr, setCpShowAddr] = useState<boolean>(false);
  const [cpShowGST, setCpShowGST] = useState<boolean>(false);
  const [cpAddr, setCpAddr] = useState<string>("");
  const [cpState, setCpState] = useState<string>("");
  const [cpPin, setCpPin] = useState<string>("");
  const [cpCity, setCpCity] = useState<string>("");
  const [cpSameShip, setCpSameShip] = useState<boolean>(true);
  const [cpGSTIN, setCpGSTIN] = useState<string>("");
  const [cpErr, setCpErr] = useState<boolean>(false);
  const [itemSearch, setItemSearch] = useState<string>("");
  const [pendingQtys, setPendingQtys] = useState<Record<number, number>>({});
  const [addedIds, setAddedIds] = useState<number[]>([]);

  const partyRef = useRef<HTMLDivElement>(null);
  const invRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (partyRef.current && !partyRef.current.contains(e.target as Node))
        if (partyState === "searching") setPartyState(selectedParty ? "selected" : "empty");
      if (invRef.current && !invRef.current.contains(e.target as Node)) setShowInvDrop(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [partyState, selectedParty]);

  const showT = (m: string): void => { setToast(m); setTimeout(() => setToast(null), 2400); };

  const subtotal      = items.reduce((s, i) => s + (i.qty * i.price - i.discount), 0);
  const totalTax      = items.reduce((s, i) => s + (i.qty * i.price * i.tax / 100), 0);
  const chargesTotal  = charges.reduce((s, c) => s + c.amount, 0);
  const taxableAmount = subtotal + chargesTotal;
  const discountAmt   = showDiscount ? (discountType === "%" ? taxableAmount * discountVal / 100 : discountVal) : 0;
  const roundOffAmt   = roundOff ? (roundOffDir === "+Add" ? roundOffVal : -roundOffVal) : 0;
  const totalAmt      = taxableAmount - discountAmt + totalTax + roundOffAmt;
  const balance       = totalAmt - amtReceived;

  const selectParty = (p: Party): void => { setSelectedParty(p); setPartyState("selected"); setPartySearch(""); };
  const filtParties  = allParties.filter(p => p.name.toLowerCase().includes(partySearch.toLowerCase()));
  const filtCatalog  = CATALOG.filter(c => c.name.toLowerCase().includes(itemSearch.toLowerCase()) || c.code.toLowerCase().includes(itemSearch.toLowerCase()));
  const filtInvoices = PURCHASE_INVOICES.filter(i => i.toLowerCase().includes(invSearch.toLowerCase()));

  const saveParty = (): void => {
    if (!cpName.trim()) { setCpErr(true); return; }
    const np: Party = {id: Date.now(), name: cpName, phone: cpPhone, pan: "", balance: 0};
    setAllParties(p => [...p, np]);
    selectParty(np);
    setShowCreateParty(false);
    setCpName(""); setCpPhone(""); setCpShowAddr(false); setCpShowGST(false); setCpErr(false);
    showT(`Party "${cpName}" created`);
  };

  const openAddItems = (): void => {
    const init: Record<number, number> = {};
    items.forEach(i => { init[i.id] = i.qty; });
    setPendingQtys(init);
    setAddedIds(items.map(i => i.id));
    setShowAddItems(true);
  };

  const toggleItem = (cat: CatalogItem): void => {
    if (addedIds.includes(cat.id)) {
      setAddedIds(p => p.filter(x => x !== cat.id));
      setPendingQtys(p => { const n = {...p}; delete n[cat.id]; return n; });
    } else {
      setAddedIds(p => [...p, cat.id]);
      setPendingQtys(p => ({...p, [cat.id]: 1}));
    }
  };

  const setPendingQty = (id: number, v: number): void => setPendingQtys(p => ({...p, [id]: Math.max(1, v)}));

  const addToBill = (): void => {
    const newItems: PRItem[] = addedIds.map(id => {
      const ex  = items.find(i => i.id === id);
      const cat = CATALOG.find(c => c.id === id)!;
      return ex
        ? {...ex, qty: pendingQtys[id] ?? ex.qty}
        : {id: cat.id, name: cat.name, hsn: "", qty: pendingQtys[id] ?? 1, price: cat.purchasePrice || cat.salesPrice, discount: 0, tax: 0};
    });
    setItems(newItems);
    setShowAddItems(false);
    setItemSearch("");
  };

  const removeItem  = (id: number): void => setItems(p => p.filter(i => i.id !== id));
  const updItem     = (id: number, f: keyof PRItem, v: string): void =>
    setItems(p => p.map(i => i.id === id ? {...i, [f]: isNaN(Number(v)) ? v : Number(v)} : i));
  const addCharge   = (): void => setCharges(p => [...p, {id: Date.now(), label: "", amount: 0, taxRate: "No Tax Applicable"}]);
  const updCharge   = (id: number, f: keyof PRCharge, v: string | number): void =>
    setCharges(p => p.map(c => c.id === id ? {...c, [f]: v} : c));
  const removeCharge = (id: number): void => setCharges(p => p.filter(c => c.id !== id));

  const buildReturn = (id: number, date: string, returnNumber: number): PurchaseReturn => ({
    id, date, returnNumber,
    partyName: selectedParty!.name, partyId: selectedParty!.id, partyPhone: selectedParty!.phone,
    purchaseNo: linkedInvoice || "-", amount: totalAmt,
    status: markPaid || amtReceived >= totalAmt ? "credited" : totalAmt > 0 ? "pending" : "",
    items, charges, discountEnabled: showDiscount, discountType, discountVal,
    roundOff, roundOffDir, roundOffVal, amtReceived, payMethod, linkedInvoice,
  });

  const handleSave = (): void => {
    if (!selectedParty) { showT("Please select a party first"); return; }
    if (isEdit) {
      onUpdated?.(buildReturn(initialData!.id, initialData!.date, initialData!.returnNumber));
    } else {
      onSaved?.(buildReturn(Date.now(), new Date().toISOString().slice(0, 10), seqNo));
    }
  };

  const handleSaveAndNew = (): void => {
    if (!selectedParty) { showT("Please select a party first"); return; }
    onSavedAndNew?.(buildReturn(Date.now(), new Date().toISOString().slice(0, 10), seqNo));
  };

  return (
    <div className="cpi-page">
      <div className="cpi-topbar">
        <div className="cpi-title-wrap">
          <button className="cpi-back-btn" onClick={onBack}><IC.Back/></button>
          <span className="cpi-page-title">
            {isEdit ? "Update Purchase Return" : "Create Purchase Return"}
          </span>
        </div>
        <div className="cpi-topbar-right">
          {isEdit && <button className="btn-icon btn-grid-icon" onClick={() => showT("Grid view")}><IC.Monitor/></button>}
          <button className="btn-topbar-settings" onClick={() => setShowSettings(true)}><IC.Settings/> Settings</button>
          {!isEdit && <button className="btn-save-new" onClick={handleSaveAndNew}>Save &amp; New</button>}
          <button className="btn-save-top" onClick={handleSave}>{isEdit ? "Update Purchase Return" : "Save"}</button>
        </div>
      </div>

      <div className="cpi-body">
        <div className="cpi-top-card">
          {/* ── Party panel ── */}
          <div className="cpi-bill-panel">
            <div className="bill-from-label">BILL FROM</div>
            {partyState === "empty" && (
              <div ref={partyRef} className="party-add-box" onClick={() => setPartyState("searching")}>
                <div className="party-add-inner"><IC.Plus/>  Add Party</div>
              </div>
            )}
            {partyState === "searching" && (
              <div ref={partyRef} className="party-search-wrap">
                <input className="party-search-input" placeholder="Search party by name or number"
                  value={partySearch} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPartySearch(e.target.value)} autoFocus/>
                <span className="party-search-arrow"><IC.Chevron/></span>
                <div className="party-dropdown">
                  <div className="party-dd-header"><span>Party Name</span><span>Balance</span></div>
                  {filtParties.map(p => (
                    <div key={p.id} className="party-dd-item" onClick={() => selectParty(p)}>
                      <span className="party-dd-name">{p.name}</span>
                      <span className={`party-dd-bal ${p.balance < 0 ? "neg" : ""}`}>{fmtMoney(p.balance)}{p.balance < 0 && <IC.ArrowUp/>}</span>
                    </div>
                  ))}
                  <div className="party-dd-create" onClick={() => { setShowCreateParty(true); setPartyState("empty"); }}><IC.Plus/> + Create Party</div>
                </div>
              </div>
            )}
            {partyState === "selected" && selectedParty && (
              <div className="bill-ship-split">
                <div className="bill-ship-pane">
                  <div className="bill-ship-header">
                    <span className="bill-ship-label">BILL FROM</span>
                    <button className="btn-change" onClick={() => setPartyState("searching")}>Change Party</button>
                  </div>
                  <div className="party-info-name">{selectedParty.name}</div>
                  {selectedParty.phone && <div className="party-info-line">Phone Number: {selectedParty.phone}</div>}
                  {selectedParty.pan   && <div className="party-info-line">PAN Number: {selectedParty.pan}</div>}
                </div>
                <div className="bill-ship-divider"/>
                <div className="bill-ship-pane">
                  <div className="bill-ship-header">
                    <span className="bill-ship-label">SHIP FROM</span>
                    <button className="btn-change" onClick={() => setShowShipModal(true)}>Change Address</button>
                  </div>
                  {shipSameAsBill ? (
                    <>
                      <div className="party-info-name">{selectedParty.name}</div>
                      <div className="party-info-line ship-same-label">Same as Bill From</div>
                    </>
                  ) : (
                    <>
                      <div className="party-info-name">{shipName || selectedParty.name}</div>
                      {shipPhone && <div className="party-info-line">Phone: {shipPhone}</div>}
                      {shipAddr  && <div className="party-info-line">{shipAddr}{shipCity ? `, ${shipCity}` : ""}{shipState ? `, ${shipState}` : ""}{shipPin ? ` - ${shipPin}` : ""}</div>}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Invoice fields ── */}
          <div className="cpi-invoice-fields">
            <div className="inv-fields-top-row">
              <div className="inv-field-group" style={{flex:"0 0 90px"}}>
                <label>Purchase Return No:</label>
                <input value={returnNo} readOnly/>
              </div>
              <div className="inv-field-group" style={{flex:1}}>
                <label>Purchase Return Date:</label>
                <div className="date-field-wrap">
                  <span className="cal-icon"><IC.Calendar/></span>
                  <span className="date-val">{returnDate}</span>
                  <span className="caret">▾</span>
                </div>
              </div>
            </div>

            {!isEdit && (
              <div className="pr-link-section" ref={invRef}>
                <div className="pr-link-label">Link to Purchase Invoice</div>
                <div className="pr-link-search" onClick={() => setShowInvDrop(true)}>
                  <span className="pr-link-icon"><IC.Search/></span>
                  <input className="pr-link-input" placeholder="Search purchase invoices"
                    value={linkedInvoice || invSearch}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setInvSearch(e.target.value); setLinkedInvoice(""); setShowInvDrop(true); }}/>
                </div>
                {showInvDrop && (
                  <div className="pr-inv-dropdown">
                    {filtInvoices.length > 0
                      ? filtInvoices.map((inv, i) => (
                          <div key={i} className="pr-inv-item" onClick={() => { setLinkedInvoice(inv); setInvSearch(""); setShowInvDrop(false); }}>{inv}</div>
                        ))
                      : <div style={{padding:"10px 14px",color:"#98a2b3",fontSize:12}}>No invoices found</div>
                    }
                  </div>
                )}
              </div>
            )}

            <div className="extra-fields-grid">
              <div className="extra-field"><label>E-Way Bill No. <IC.Info/></label><input/></div>
              <div className="extra-field"><label>Challan No.:</label><input/></div>
              <div className="extra-field"><label>Financed By:</label><input/></div>
              <div className="extra-field"><label>Salesman:</label><input/></div>
              <div className="extra-field"><label>Email ID:</label><input/></div>
            </div>
            <div className="extra-fields-grid-2">
              <div className="extra-field"><label>Warranty Period:</label><input/></div>
            </div>
          </div>
        </div>

        {/* ── Items ── */}
        <div className="cpi-items-section">
          <table className="items-table">
            <thead><tr>
              <th style={{width:40,textAlign:"center"}}>NO</th>
              <th>ITEMS/ SERVICES</th>
              <th style={{width:110}}>HSN/ SAC</th>
              <th style={{width:72}}>QTY</th>
              <th style={{width:130}}>PRICE/ITEM (₹)</th>
              <th style={{width:110}}>DISCOUNT</th>
              <th style={{width:80}}>TAX</th>
              <th style={{width:120}}>AMOUNT (₹)</th>
              <th style={{width:40}}><div style={{display:"flex",alignItems:"center",justifyContent:"center"}}><IC.AddCircle/></div></th>
            </tr></thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id}>
                  <td style={{color:"#667085",textAlign:"center"}}>{idx + 1}</td>
                  <td>
                    <div style={{fontWeight:600,color:"#1a2332"}}>{item.name}</div>
                    <input className="item-desc-input" placeholder="Enter Description (optional)"/>
                  </td>
                  <td><input className="qty-input" style={{width:92}} value={item.hsn} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updItem(item.id, "hsn", e.target.value)}/></td>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:3}}>
                      <input className="qty-input" type="number" value={item.qty} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updItem(item.id, "qty", e.target.value)}/>
                      <span style={{fontSize:10,color:"#98a2b3",whiteSpace:"nowrap"}}>PCS</span>
                    </div>
                  </td>
                  <td><input className="qty-input" style={{width:108}} type="number" value={item.price || ""} placeholder="0" onChange={(e: React.ChangeEvent<HTMLInputElement>) => updItem(item.id, "price", e.target.value)}/></td>
                  <td>
                    <div style={{display:"flex",flexDirection:"column",gap:3}}>
                      <div style={{display:"flex",alignItems:"center",gap:3}}>
                        <span style={{fontSize:11,color:"#667085"}}>%</span>
                        <input className="qty-input" style={{width:60}} type="number" value={item.discount || ""} placeholder="0" onChange={(e: React.ChangeEvent<HTMLInputElement>) => updItem(item.id, "discount", e.target.value)}/>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:3}}>
                        <span style={{fontSize:11,color:"#667085"}}>₹</span>
                        <input className="qty-input" style={{width:60}} type="number" value={item.discount || ""} placeholder="0" onChange={(e: React.ChangeEvent<HTMLInputElement>) => updItem(item.id, "discount", e.target.value)}/>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{fontSize:11,color:"#667085"}}>{item.tax}%</div>
                    <div style={{fontSize:11,color:"#667085"}}>(₹ {(item.qty * item.price * item.tax / 100).toLocaleString("en-IN")})</div>
                  </td>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{fontSize:11,color:"#98a2b3"}}>₹</span>
                      <span style={{fontWeight:700,color:"#1d2939"}}>{(item.qty * item.price - item.discount).toLocaleString("en-IN")}</span>
                    </div>
                  </td>
                  <td><button className="item-row-delete" onClick={() => removeItem(item.id)}><IC.Trash/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="add-item-area">
            <button className="add-item-dashed-btn" onClick={openAddItems}><IC.Plus/>  Add Item</button>
            <div className="scan-barcode-area" onClick={openAddItems}><IC.Barcode/> Scan Barcode</div>
          </div>
          <div className="subtotal-row">
            <span className="sub-label">SUBTOTAL</span>
            <span className="sub-cell">₹ {subtotal.toLocaleString("en-IN")}</span>
            <span className="sub-cell">₹ {totalTax.toLocaleString("en-IN")}</span>
            <span className="sub-cell">₹ {(subtotal + totalTax).toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* ── Bottom ── */}
        <div className="cpi-bottom-section">
          {/* Notes */}
          <div className="notes-panel">
            {!showNotes
              ? <button className="btn-add-notes" onClick={() => setShowNotes(true)}>+ Add Notes</button>
              : <textarea value={notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)} placeholder="Add notes..."
                  style={{width:"100%",border:"1.5px solid #dde1e9",borderRadius:6,padding:"7px 10px",
                  fontSize:12,outline:"none",resize:"vertical",minHeight:50,fontFamily:"inherit",marginBottom:10}}/>
            }
            <div className="tc-label-row">
              <span className="tc-heading">Terms and Conditions</span>
              <button className="tc-gear-btn" onClick={() => showT("T&C settings")}/>
            </div>
            <div className="tc-list">
              1. Goods once sold will not be taken back or exchanged<br/>
              2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only
            </div>
            {!showBankAccount
              ? <button className="btn-add-bank" onClick={() => setShowBankAccount(true)}> + Add Bank Account</button>
              : <div className="bank-account-box">
                  <div className="bank-account-header">
                    <span className="bank-account-label">Bank Account</span>
                    <button className="btn-remove-section" onClick={() => setShowBankAccount(false)}>Remove</button>
                  </div>
                  <div className="form-group" style={{marginBottom:8}}><label>Bank Name</label><input placeholder="Enter bank name"/></div>
                  <div className="form-row">
                    <div className="form-group"><label>Account Number</label><input placeholder="Enter account number"/></div>
                    <div className="form-group"><label>IFSC Code</label><input placeholder="Enter IFSC code"/></div>
                  </div>
                </div>
            }
          </div>

          {/* Summary */}
          <div className="summary-panel">
            {charges.map(c => (
              <div key={c.id} className="charge-row">
                <input className="charge-label-input" placeholder="Enter charge (ex. Transport Charge)"
                  value={c.label} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updCharge(c.id, "label", e.target.value)}/>
                <div className="charge-right">
                  <div className="charge-amount-wrap">
                    <span className="charge-rupee">₹</span>
                    <input type="number" className="charge-amt-input" value={c.amount === 0 ? "" : c.amount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updCharge(c.id, "amount", Number(e.target.value))} placeholder="0"/>
                  </div>
                  <select className="charge-tax-select" value={c.taxRate} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updCharge(c.id, "taxRate", e.target.value)}>
                    <option>No Tax Applicable</option><option>5%</option><option>12%</option><option>18%</option><option>28%</option>
                  </select>
                  <button className="charge-remove-btn" onClick={() => removeCharge(c.id)}><IC.X/></button>
                </div>
              </div>
            ))}
            <button className="btn-add-charge-link" onClick={addCharge}>
              {charges.length === 0 ? "+ Add Additional Charges" : "+ Add Another Charge"}
            </button>
            <div className="summary-line">
              <span className="summary-line-label">Taxable Amount</span>
              <span className="summary-line-value">{fmtAmt(taxableAmount)}</span>
            </div>
            {totalTax > 0 && (
              <>
                <div className="summary-line tax-sub-line"><span className="summary-line-label">SGST@9</span><span className="summary-line-value">{fmtAmt(totalTax/2)}</span></div>
                <div className="summary-line tax-sub-line"><span className="summary-line-label">CGST@9</span><span className="summary-line-value">{fmtAmt(totalTax/2)}</span></div>
              </>
            )}
            {!showDiscount
              ? <button className="btn-add-discount-link" onClick={() => setShowDiscount(true)}>+ Add Discount</button>
              : <div className="discount-row">
                  <span className="discount-label">Discount</span>
                  <div className="discount-inputs">
                    <select className="discount-type-select" value={discountType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDiscountType(e.target.value as "%"|"₹")}><option value="%">%</option><option value="₹">₹</option></select>
                    <input type="number" className="discount-val-input" value={discountVal} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDiscountVal(Number(e.target.value))}/>
                    <span className="discount-computed">- {fmtAmt(discountAmt)}</span>
                    <button className="charge-remove-btn" onClick={() => { setShowDiscount(false); setDiscountVal(0); }}><IC.X/></button>
                  </div>
                </div>
            }
            <div className="round-off-line">
              <label className="summary-checkbox-label">
                <input type="checkbox" checked={roundOff} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoundOff(e.target.checked)}/>Auto Round Off
              </label>
              {roundOff && (
                <div className="round-off-controls">
                  <select value={roundOffDir} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRoundOffDir(e.target.value)} className="round-dir-select"><option value="+Add">+Add</option><option value="-Sub">-Sub</option></select>
                  <span className="round-rupee">₹</span>
                  <input type="number" className="round-val-input" value={roundOffVal} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoundOffVal(Number(e.target.value))}/>
                </div>
              )}
            </div>
            <div className="total-amount-line">
              <span className="total-amount-label">Total Amount</span>
              <div className="enter-payment-wrap">
                {totalAmt > 0 && <span className="total-amount-value-big">{fmtAmt(totalAmt)}</span>}
                {totalAmt === 0 && <span className="total-amount-value">₹ 0</span>}
                <button className="enter-payment-btn">Enter Payment amount</button>
              </div>
            </div>
            <div className="mark-paid-line">
              <label className="mark-paid-label">Mark as fully paid
                <input type="checkbox" checked={markPaid} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setMarkPaid(e.target.checked); if (e.target.checked) setAmtReceived(totalAmt); else setAmtReceived(0); }}/>
              </label>
            </div>
            <div className="amount-paid-line">
              <span className="amount-paid-label">Amount Received</span>
              <div className="amount-paid-inputs">
                <div className="rupee-input-wrap">
                  <span className="rupee-prefix">₹</span>
                  <input type="number" className="rupee-num-input" value={amtReceived} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmtReceived(Number(e.target.value))}/>
                </div>
                <select className="payment-method-select" value={payMethod} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPayMethod(e.target.value)}>
                  <option>Cash</option><option>Bank</option><option>UPI</option>
                </select>
              </div>
            </div>
            <div className="balance-line">
              <span className="balance-label">Balance Amount</span>
              <span className="balance-value">{fmtAmt(balance)}</span>
            </div>
            <div className="authorized-row">Authorized signatory for <strong>scratchweb.solutions</strong></div>
            <div className="sig-box"/>
          </div>
        </div>
      </div>

      {/* ── Create Party Modal ── */}
      {showCreateParty && (
        <div className="modal-overlay" onClick={() => setShowCreateParty(false)}>
          <div className="modal create-party-modal" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="modal-head"><span className="modal-title">Create New Party</span><button className="modal-close" onClick={() => setShowCreateParty(false)}><IC.X/></button></div>
            <div className="modal-body">
              <div className="form-group">
                <label>Party Name <span className="req">*</span></label>
                <input placeholder="Enter name" value={cpName} className={cpErr ? "error" : ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setCpName(e.target.value); setCpErr(false); }}/>
                {cpErr && <div className="error-msg">This field is mandatory</div>}
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input placeholder="Enter Mobile Number" value={cpPhone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCpPhone(e.target.value)}/>
              </div>
              {!cpShowAddr
                ? <button className="btn-optional" onClick={() => setCpShowAddr(true)}><IC.Plus/> + Add Address (Optional)</button>
                : <div className="optional-section">
                    <div className="optional-section-header"><span className="optional-section-label">Address (Optional)</span><button className="btn-remove-section" onClick={() => setCpShowAddr(false)}>Remove</button></div>
                    <div className="form-group"><label>BILLING ADDRESS</label><textarea placeholder="Enter billing address" value={cpAddr} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCpAddr(e.target.value)}/></div>
                    <div className="form-row">
                      <div className="form-group"><label>STATE</label><input placeholder="Enter State" value={cpState} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCpState(e.target.value)}/></div>
                      <div className="form-group"><label>PINCODE</label><input placeholder="Enter Pincode" value={cpPin} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCpPin(e.target.value)}/></div>
                    </div>
                    <div className="form-group"><label>CITY</label><input placeholder="Enter City" value={cpCity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCpCity(e.target.value)}/></div>
                    <label className="ship-checkbox"><input type="checkbox" checked={cpSameShip} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCpSameShip(e.target.checked)}/>Shipping address same as billing address</label>
                  </div>
              }
              {!cpShowGST
                ? <button className="btn-optional" onClick={() => setCpShowGST(true)}><IC.Plus/> + Add GSTIN (Optional)</button>
                : <div className="optional-section">
                    <div className="optional-section-header"><span className="optional-section-label">GSTIN (Optional)</span><button className="btn-remove-section" onClick={() => setCpShowGST(false)}>Remove</button></div>
                    <div className="form-group"><label>GSTIN</label><input placeholder="ex: 29XXXXX9438X1XX" value={cpGSTIN} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCpGSTIN(e.target.value)}/></div>
                  </div>
              }
              <div className="custom-fields-note">You can add Custom Fields from <a href="#" onClick={(e: React.MouseEvent) => e.preventDefault()}>Party Settings</a>.</div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={() => setShowCreateParty(false)}>Cancel</button>
              <button className="modal-btn-save" onClick={saveParty} disabled={!cpName.trim()}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Items Modal ── */}
      {showAddItems && (
        <div className="modal-overlay" onClick={() => { setShowAddItems(false); setItemSearch(""); }}>
          <div className="aim-modal" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="aim-header"><span className="aim-title">Add Items to Bill</span><button className="aim-close" onClick={() => { setShowAddItems(false); setItemSearch(""); }}><IC.X/></button></div>
            <div className="aim-search-row">
              <div className="aim-search-box">
                <span className="aim-search-icon"><IC.Search/></span>
                <input className="aim-search-input" placeholder="Search by Item / Serial no./ HSN code/ SKU/ Custom Field / Category"
                  value={itemSearch} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setItemSearch(e.target.value)} autoFocus/>
                <button className="aim-barcode-btn"><IC.Barcode/></button>
              </div>
              <div className="aim-cat-wrap"><select className="aim-cat-select"><option>Select Category</option><option>Electronics</option><option>Software</option></select></div>
              <button className="aim-create-btn" onClick={() => navigate("/create-item")}>Create New Item</button>
            </div>
            <div className="aim-table-wrap">
              <table className="aim-table">
                <thead><tr>
                  <th>Item Name</th><th style={{width:100}}>Item Code</th><th style={{width:90}}>Stock</th>
                  <th style={{width:110}}>Sales Price</th><th style={{width:120}}>Purchase Price</th><th style={{width:110,textAlign:"center"}}>Quantity</th>
                </tr></thead>
                <tbody>
                  {filtCatalog.map(c => {
                    const isAdded = addedIds.includes(c.id);
                    const qty = pendingQtys[c.id] ?? 1;
                    return (
                      <tr key={c.id} className={isAdded ? "aim-row-added" : ""}>
                        <td className="aim-item-name">{c.name}</td>
                        <td className="aim-td-muted">{c.code}</td>
                        <td className="aim-td-muted">{c.stock}</td>
                        <td className="aim-td-muted">{c.salesPrice > 0 ? `₹${c.salesPrice.toLocaleString("en-IN")}` : ""}</td>
                        <td className="aim-td-muted">{c.purchasePrice > 0 ? `₹${c.purchasePrice.toLocaleString("en-IN")}` : ""}</td>
                        <td style={{textAlign:"center"}}>
                          {isAdded
                            ? <div className="aim-qty-controls">
                                <button className="aim-qty-btn" onClick={() => setPendingQty(c.id, qty - 1)}>−</button>
                                <input className="aim-qty-input" type="number" value={qty} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPendingQty(c.id, Number(e.target.value))}/>
                                <button className="aim-qty-btn" onClick={() => setPendingQty(c.id, qty + 1)}>+</button>
                              </div>
                            : <button className="aim-add-btn" onClick={() => toggleItem(c)}>+ Add</button>
                          }
                        </td>
                      </tr>
                    );
                  })}
                  {filtCatalog.length === 0 && <tr><td colSpan={6} style={{textAlign:"center",padding:28,color:"#9aabbd"}}>No items found</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="aim-shortcuts-bar">
              <span className="aim-shortcuts-label">Keyboard Shortcuts:</span>
              <span className="aim-shortcut-item">Change Quantity <kbd>Enter</kbd></span>
              <span className="aim-shortcut-sep"/>
              <span className="aim-shortcut-item">Move Between Items <kbd>+</kbd> <kbd>/</kbd></span>
            </div>
            <div className="aim-footer">
              <span className="aim-selected-count">{addedIds.length} Item(s) Selected</span>
              <div className="aim-footer-btns">
                <button className="aim-cancel-btn" onClick={() => { setShowAddItems(false); setItemSearch(""); }}>Cancel (ESC)</button>
                <button className="aim-confirm-btn" onClick={addToBill}>Add to Bill (F7)</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Shipping Modal ── */}
      {showShipModal && (
        <div className="modal-overlay" onClick={() => setShowShipModal(false)}>
          <div className="modal ship-modal" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">Shipping Address</span>
              <button className="modal-close" onClick={() => setShowShipModal(false)}><IC.X/></button>
            </div>
            <div className="modal-body">
              <label className="ship-checkbox" style={{marginBottom:16,display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                <input type="checkbox" checked={shipSameAsBill} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShipSameAsBill(e.target.checked)}/>
                Same as Bill From
              </label>
              {!shipSameAsBill && (
                <>
                  <div className="form-group"><label>Name</label><input placeholder="Enter name" value={shipName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShipName(e.target.value)}/></div>
                  <div className="form-group"><label>Phone Number</label><input placeholder="Enter phone number" value={shipPhone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShipPhone(e.target.value)}/></div>
                  <div className="form-group"><label>Address</label><textarea placeholder="Enter shipping address" value={shipAddr} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setShipAddr(e.target.value)} rows={2}/></div>
                  <div className="form-row">
                    <div className="form-group"><label>City</label><input placeholder="Enter city" value={shipCity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShipCity(e.target.value)}/></div>
                    <div className="form-group"><label>State</label><input placeholder="Enter state" value={shipState} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShipState(e.target.value)}/></div>
                  </div>
                  <div className="form-group"><label>Pincode</label><input placeholder="Enter pincode" value={shipPin} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShipPin(e.target.value)}/></div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={() => setShowShipModal(false)}>Cancel</button>
              <button className="modal-btn-save" onClick={() => setShowShipModal(false)}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <PRSettingsModal prSettings={prSettings} setPrSettings={setPrSettings}
          onClose={() => setShowSettings(false)}
          onSave={() => { setShowSettings(false); showT("Settings saved"); }}/>
      )}

      {toast && <div className="pi-toast">{toast}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PURCHASE RETURN LIST PAGE
══════════════════════════════════════════════════════════ */
function PurchaseReturnListPage({
  returns, setReturns, onCreateNew, onEdit, onDuplicate, onView, prSettings, setPrSettings,
}: {
  returns: PurchaseReturn[];
  setReturns: React.Dispatch<React.SetStateAction<PurchaseReturn[]>>;
  onCreateNew: () => void;
  onEdit: (r: PurchaseReturn) => void;
  onDuplicate: (r: PurchaseReturn) => void;
  onView: (r: PurchaseReturn) => void;
  prSettings: PRSettings;
  setPrSettings: React.Dispatch<React.SetStateAction<PRSettings>>;
}) {
  const [dateFilter, setDateFilter] = useState<DateFilter>("Last 365 Days");
  const [customFrom, setCustomFrom] = useState<Date | null>(null);
  const [customTo,   setCustomTo]   = useState<Date | null>(null);
  const [showDateList, setShowDateList] = useState<boolean>(false);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [query,        setQuery]        = useState<string>("");
  const [ctx,          setCtx]          = useState<{id: number; x: number; y: number} | null>(null);
  const [toast,        setToast]        = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showSearch,   setShowSearch]   = useState<boolean>(false);

  const dateRef   = useRef<HTMLDivElement>(null);
  const ctxRef    = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dateRef.current   && !dateRef.current.contains(e.target as Node))   { setShowDateList(false); setShowCalendar(false); }
      if (ctxRef.current    && !ctxRef.current.contains(e.target as Node))    setCtx(null);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const showT = (m: string): void => { setToast(m); setTimeout(() => setToast(null), 2400); };

  const displayed = useCallback((): PurchaseReturn[] => {
    const [from, to] = getRange(dateFilter, customFrom ?? undefined, customTo ?? undefined);
    return returns.filter(r => {
      const d = new Date(r.date); d.setHours(12);
      if (d < from || d > to) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return r.partyName.toLowerCase().includes(q) || r.returnNumber.toString().includes(q);
      }
      return true;
    });
  }, [returns, dateFilter, customFrom, customTo, query])();

  const handleDot = (e: React.MouseEvent<HTMLButtonElement>, id: number): void => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setCtx({id, x: rect.right - 170, y: rect.bottom + 5});
  };

  const doCtx = (action: string): void => {
    const r = returns.find(i => i.id === ctx?.id);
    setCtx(null);
    if (!r) return;
    if (action === "edit")      onEdit(r);
    if (action === "duplicate") onDuplicate(r);
    if (action === "history")   showT(`Edit history for Return #${r.returnNumber}`);
    if (action === "delete")    { setReturns(p => p.filter(i => i.id !== r.id)); showT(`Return #${r.returnNumber} deleted`); }
  };

  const dateBtnLabel = (): string =>
    dateFilter === "Custom" && customFrom && customTo
      ? `${fmtShort(customFrom)} - ${fmtShort(customTo)}`
      : dateFilter;

  return (
    <div className="pi-page pr-list-page">
      <div className="pr-list-header">
        <h1 className="pi-title">Purchase Return</h1>
        <div className="pr-list-header-right">
          <button className="btn-icon" onClick={() => setShowSettings(true)}><IC.Settings/></button>
          <button className="btn-icon" onClick={() => showT("View mode")}><IC.Monitor/></button>
        </div>
      </div>

      <div className="pr-toolbar">
        <div ref={searchRef} style={{position:"relative"}}>
          <button className="pr-search-icon-btn" onClick={() => setShowSearch(v => !v)}><IC.Search/></button>
          {showSearch && (
            <div className="pr-search-popup">
              <span className="pi-search-icon"><IC.Search/></span>
              <input className="pi-search-input" placeholder="Search by party name or return number"
                value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} autoFocus style={{width:240}}/>
            </div>
          )}
        </div>
        <div className="pi-date-wrap" ref={dateRef}>
          <button className="pi-date-btn pr-date-btn" onClick={() => { setShowCalendar(false); setShowDateList(v => !v); }}>
            <IC.Calendar/> {dateBtnLabel()} <span className="arr">▾</span>
          </button>
          {showDateList && !showCalendar && (
            <div className="pi-dd pi-date-list-dd">
              {DATE_OPTS.map(opt => (
                <div key={opt} className={`pi-dd-item ${dateFilter === opt ? "sel" : ""}`}
                  onClick={() => { if (opt === "Custom") { setShowCalendar(true); setShowDateList(false); } else { setDateFilter(opt); setShowDateList(false); } }}>
                  {opt}
                </div>
              ))}
            </div>
          )}
          {showCalendar && (
            <CalendarPicker
              onApply={(f: Date, t: Date) => { setCustomFrom(f); setCustomTo(t); setDateFilter("Custom"); setShowCalendar(false); }}
              onCancel={() => setShowCalendar(false)}/>
          )}
        </div>
        <button className="btn-create-pr" onClick={onCreateNew}>Create Purchase Return</button>
      </div>

      <div className="pi-table-wrap pr-table-wrap">
        <table>
          <thead><tr>
            <th className="sortable">Date ↕</th>
            <th>Purchase Return Number</th>
            <th>Party Name</th>
            <th>Purchase No</th>
            <th>Amount</th>
            <th>Status</th>
            <th style={{width:44}}></th>
          </tr></thead>
          <tbody>
            {displayed.length === 0
              ? <tr><td colSpan={7}><div className="pi-empty">No purchase returns found.</div></td></tr>
              : displayed.map(r => (
                <tr key={r.id} onClick={() => onView(r)} style={{cursor:"pointer"}}>
                  <td>{fmtDate(new Date(r.date + "T12:00:00"))}</td>
                  <td>{r.returnNumber}</td>
                  <td>{r.partyName}</td>
                  <td>{r.purchaseNo}</td>
                  <td className="td-amt">₹ {r.amount.toLocaleString("en-IN")}</td>
                  <td>
                    {r.status === "credited" && <span className="pr-status-credited">Credited</span>}
                    {r.status === "pending"  && <span className="s-badge s-unpaid">Pending</span>}
                  </td>
                  <td>
                    <button className="tdot-btn" onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleDot(e, r.id)}><IC.Dots/></button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {ctx && (
        <div ref={ctxRef} className="pi-ctx" style={{top: ctx.y, left: ctx.x}}>
          <div className="pi-dd-item" onClick={() => doCtx("edit")}><IC.Edit/>Edit</div>
          <div className="pi-dd-divider"/>
          <div className="pi-dd-item" onClick={() => doCtx("history")}><IC.History/>Edit History</div>
          <div className="pi-dd-divider"/>
          <div className="pi-dd-item" onClick={() => doCtx("duplicate")}><IC.Copy/>Duplicate</div>
          <div className="pi-dd-divider"/>
          <div className="pi-dd-item danger" onClick={() => doCtx("delete")}><IC.Trash/>Delete</div>
        </div>
      )}

      {showSettings && (
        <PRSettingsModal prSettings={prSettings} setPrSettings={setPrSettings}
          onClose={() => setShowSettings(false)}
          onSave={() => { setShowSettings(false); showT("Settings saved"); }}/>
      )}

      {toast && <div className="pi-toast">{toast}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════ ROOT ══ */
export default function PurchaseReturnModule() {
  const [page,    setPage]    = useState<PRPage>("list");
  const [returns, setReturns] = useState<PurchaseReturn[]>(SEED_RETURNS);
  const [allParties, setAllParties] = useState<Party[]>(PARTIES);
  const [prSettings, setPrSettings] = useState<PRSettings>({
    prefixEnabled: true, prefix: "", sequenceNumber: 2, showItemImage: true,
  });
  const [activeRecord, setActiveRecord] = useState<PurchaseReturn | null>(null);
  const [formKey, setFormKey] = useState<number>(0);

  const handleSaved = (r: PurchaseReturn): void => {
    setReturns(p => [r, ...p]);
    setPrSettings(s => ({...s, sequenceNumber: s.sequenceNumber + 1}));
    setPage("list");
  };
  const handleSavedAndNew = (r: PurchaseReturn): void => {
    setReturns(p => [r, ...p]);
    setPrSettings(s => ({...s, sequenceNumber: s.sequenceNumber + 1}));
    setFormKey(k => k + 1);
  };
  const handleUpdated = (r: PurchaseReturn): void => {
    setReturns(p => p.map(x => x.id === r.id ? r : x));
    setPage("list");
  };
  const handleEdit      = (r: PurchaseReturn): void => { setActiveRecord(r); setPage("edit"); };
  const handleDuplicate = (r: PurchaseReturn): void => { setActiveRecord(r); setPage("duplicate"); };
  const handleView      = (r: PurchaseReturn): void => { setActiveRecord(r); setPage("view"); };
  const handleDeleteFromView = (id: number): void => {
    setReturns(p => p.filter(x => x.id !== id));
    setPage("list");
  };

  const commonProps = { allParties, setAllParties, prSettings, setPrSettings, onBack: () => setPage("list") };

  if (page === "view" && activeRecord)
    return (
      <BillViewPage
        record={activeRecord}
        onBack={() => setPage("list")}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDelete={handleDeleteFromView}
      />
    );

  if (page === "edit" && activeRecord)
    return <PurchaseReturnForm key="edit" {...commonProps}
      mode="edit" seqNo={activeRecord.returnNumber} initialData={activeRecord}
      onUpdated={handleUpdated}/>;

  if (page === "duplicate" && activeRecord)
    return <PurchaseReturnForm key="duplicate" {...commonProps}
      mode="duplicate" seqNo={prSettings.sequenceNumber} initialData={activeRecord}
      onSaved={handleSaved} onSavedAndNew={handleSavedAndNew}/>;

  if (page === "create")
    return <PurchaseReturnForm key={`create-${formKey}`} {...commonProps}
      mode="create" seqNo={prSettings.sequenceNumber}
      onSaved={handleSaved} onSavedAndNew={handleSavedAndNew}/>;

  return (
    <PurchaseReturnListPage
      returns={returns} setReturns={setReturns}
      onCreateNew={() => setPage("create")}
      onEdit={handleEdit} onDuplicate={handleDuplicate} onView={handleView}
      prSettings={prSettings} setPrSettings={setPrSettings}
    />
  );
}