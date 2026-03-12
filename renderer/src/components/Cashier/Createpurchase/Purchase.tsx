import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Purchase.css";

/* ══════════════════════════════════════════ ICONS ══ */
const IC = {
  Report:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
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
  History:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>,
  Copy:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Note:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Trash:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  Cart:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  Check:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Alert:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Plus:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Upload:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  Back:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  Barcode:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M3 5v14M7 5v14M11 5v14M15 5v14M19 5v14M21 5v4M21 15v4M21 9v2"/></svg>,
  Info:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Gear:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
  ArrowUp:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>,
  AddCircle:()=><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="12" fill="#4361ee"/><line x1="12" y1="7" x2="12" y2="17" stroke="white" strokeWidth={2.5} strokeLinecap="round"/><line x1="7" y1="12" x2="17" y2="12" stroke="white" strokeWidth={2.5} strokeLinecap="round"/></svg>,
  Mail:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Download: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Print:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  Star:     ()=><svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={1.5}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
};

/* ══════════════════════════════════════════ TYPES ══ */
type InvoiceStatus = "paid"|"unpaid"|"";
type PageMode = "list"|"create"|"edit"|"duplicate"|"gstr2"|"daybook";

interface InvoiceItem { id:number; name:string; hsn:string; qty:number; price:number; discount:number; tax:number; }
interface AdditionalCharge { id:number; label:string; amount:number; taxRate:string; }
interface ShippingAddr { name:string; phone:string; addr:string; city:string; state:string; pin:string; isSame:boolean; }

interface Invoice {
  id:number; date:string; invoiceNumber:number; partyName:string; partyId:number;
  partyPhone:string; partyPan:string;
  dueIn:string; amount:number; status:InvoiceStatus;
  items:InvoiceItem[];
  additionalCharges:AdditionalCharge[];
  shipping:ShippingAddr;
  discountEnabled:boolean; discountType:"%"|"₹"; discountVal:number;
  roundOff:boolean; roundOffDir:string; roundOffVal:number;
  amtPaid:number; payMethod:string;
}

interface AppSettings { prefixEnabled:boolean; prefix:string; sequenceNumber:number; showItemImage:boolean; priceHistory:boolean; }
type DateFilter = "Today"|"Yesterday"|"This Week"|"Last Week"|"Last 7 Days"|"This Month"|"Previous Month"|"Last 30 Days"|"Last 365 Days"|"Custom";
type SearchType = "Invoice No. & Party name"|"Mobile Number";
interface Party { id:number; name:string; phone:string; pan:string; balance:number; }
interface CatalogItem { id:number; name:string; code:string; stock:string; salesPrice:number; purchasePrice:number; }

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const fmtDate  = (d:Date) => d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
const fmtShort = (d:Date) => `${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)} ${d.getFullYear()}`;
const fmtMoney = (n:number) => n===0?"₹0":`₹${Math.abs(n).toLocaleString("en-IN")}`;
const fmtAmt   = (n:number) => `₹ ${n.toLocaleString("en-IN")}`;
const todayStr = () => { const d=new Date(); return `${d.getDate().toString().padStart(2,"0")} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]} ${d.getFullYear()}`; };
const fmtDateDDMM = (dateStr:string) => {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2,"0")}-${(d.getMonth()+1).toString().padStart(2,"0")}-${d.getFullYear()}`;
};

function getRange(f:DateFilter, from?:Date, to?:Date):[Date,Date] {
  const t=new Date(), s=new Date(t), e=new Date(t);
  switch(f){
    case "Yesterday": s.setDate(t.getDate()-1); e.setDate(t.getDate()-1); break;
    case "This Week": s.setDate(t.getDate()-t.getDay()); break;
    case "Last Week": { const d=t.getDay(); s.setDate(t.getDate()-d-7); e.setDate(t.getDate()-d-1); break; }
    case "Last 7 Days": s.setDate(t.getDate()-6); break;
    case "This Month": s.setDate(1); break;
    case "Previous Month": s.setMonth(t.getMonth()-1,1); e.setDate(0); break;
    case "Last 30 Days": s.setDate(t.getDate()-29); break;
    case "Last 365 Days": s.setFullYear(t.getFullYear()-1); break;
    case "Custom": if(from&&to) return [from,to]; break;
  }
  s.setHours(0,0,0,0); e.setHours(23,59,59,999); return [s,e];
}

const DATE_OPTS:DateFilter[] = ["Today","Yesterday","This Week","Last Week","Last 7 Days","This Month","Previous Month","Last 30 Days","Last 365 Days","Custom"];

let ALL_PARTIES:Party[] = [
  {id:1,name:"Aditya",phone:"",pan:"",balance:0},
  {id:2,name:"anando",phone:"0987643211",pan:"ljjjmkpmp",balance:-65744},
  {id:3,name:"Cash Sale",phone:"9555780835",pan:"",balance:0},
  {id:4,name:"cgfwh",phone:"",pan:"",balance:0},
  {id:5,name:"MONDIAL ELECTRONIC",phone:"",pan:"",balance:0},
  {id:6,name:"Ramakant Pandit",phone:"",pan:"",balance:0},
  {id:7,name:"rniijni",phone:"",pan:"",balance:-77600},
];

const CATALOG:CatalogItem[] = [
  {id:1,name:"BILLING SOFTWARE MOBILE APP",code:"",stock:"",salesPrice:256,purchasePrice:0},
  {id:2,name:"BILLING SOFTWARE WITH GST",code:"",stock:"",salesPrice:169875,purchasePrice:0},
  {id:3,name:"BILLING SOFTWARE WITHOUT GST",code:"",stock:"",salesPrice:3556,purchasePrice:0},
  {id:4,name:"GODREJ FRIDGE",code:"34567",stock:"144 ACS",salesPrice:42000,purchasePrice:0},
  {id:5,name:"HEKER AC",code:"1234",stock:"93 PCS",salesPrice:45000,purchasePrice:38000},
  {id:6,name:"HISENSE 32 INCH",code:"",stock:"38 PCS",salesPrice:21000,purchasePrice:18000},
  {id:7,name:"HISENSE 43INCG TV",code:"00974",stock:"119 PCS",salesPrice:30000,purchasePrice:0},
];

const defaultShipping = (name:string,phone:string):ShippingAddr =>
  ({name,phone,addr:"",city:"",state:"",pin:"",isSame:true});

const SEED_INVOICES:Invoice[] = [
  {id:1,date:"2026-03-03",invoiceNumber:2,partyName:"Cash Sale",partyId:3,partyPhone:"9555780835",partyPan:"",
   dueIn:"-",amount:0,status:"",items:[
     {id:2,name:"BILLING SOFTWARE WITH GST",hsn:"",qty:1,price:0,discount:0,tax:0},
     {id:3,name:"BILLING SOFTWARE WITHOUT GST",hsn:"",qty:1,price:0,discount:0,tax:0},
   ],additionalCharges:[],shipping:defaultShipping("Cash Sale","9555780835"),
   discountEnabled:false,discountType:"%",discountVal:0,roundOff:false,roundOffDir:"+Add",roundOffVal:0,amtPaid:0,payMethod:"Cash"},
  {id:2,date:"2026-03-02",invoiceNumber:1,partyName:"anando",partyId:2,partyPhone:"0987643211",partyPan:"ljjjmkpmp",
   dueIn:"-",amount:38000,status:"unpaid",items:[
     {id:4,name:"GODREJ FRIDGE",hsn:"",qty:1,price:0,discount:0,tax:18},
     {id:5,name:"HEKER AC",hsn:"84151010",qty:1,price:32203.39,discount:0,tax:18},
   ],additionalCharges:[],shipping:defaultShipping("anando","0987643211"),
   discountEnabled:false,discountType:"%",discountVal:0,roundOff:false,roundOffDir:"+Add",roundOffVal:0,amtPaid:0,payMethod:"Cash"},
];

/* ══════════════════════════════════════════ CALENDAR ══ */
function CalendarPicker({onApply,onCancel}:{onApply:(f:Date,t:Date)=>void;onCancel:()=>void}) {
  const today=new Date();
  const [vy,setVy]=useState(today.getFullYear());
  const [vm,setVm]=useState(today.getMonth());
  const [start,setStart]=useState<Date|null>(null);
  const [end,setEnd]=useState<Date|null>(null);
  const [hov,setHov]=useState<Date|null>(null);
  const prev=()=>{ if(vm===0){setVm(11);setVy(y=>y-1);}else setVm(m=>m-1); };
  const next=()=>{ if(vm===11){setVm(0);setVy(y=>y+1);}else setVm(m=>m+1); };
  const cells=()=>{
    const f=new Date(vy,vm,1),l=new Date(vy,vm+1,0),a:(Date|null)[]=[];
    for(let i=0;i<f.getDay();i++)a.push(null);
    for(let d=1;d<=l.getDate();d++)a.push(new Date(vy,vm,d));
    while(a.length%7!==0)a.push(null); return a;
  };
  const same=(a:Date,b:Date)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
  const inR=(d:Date)=>{ const e2=end||hov; if(!start||!e2)return false; const mn=start<e2?start:e2,mx=start<e2?e2:start; return d>mn&&d<mx; };
  const pick=(d:Date)=>{ if(!start||(start&&end)){setStart(d);setEnd(null);}else{if(d<start){setEnd(start);setStart(d);}else setEnd(d);} };
  const cs=cells();
  return (
    <div className="pi-cal-overlay">
      <div className="pi-cal-header-row">
        <div className="pi-cal-section"><div className="pi-cal-section-label">Select Start Date</div><div className="pi-cal-section-value">{start?fmtShort(start):""}</div></div>
        <div className="pi-cal-sep"/>
        <div className="pi-cal-section"><div className="pi-cal-section-label">Select End Date</div><div className="pi-cal-section-value">{end?fmtShort(end):""}</div></div>
      </div>
      <div className="pi-cal-nav">
        <button className="pi-cal-nav-btn" onClick={prev}><IC.ChevronL/></button>
        <span className="pi-cal-month-label">{MONTHS[vm]} {vy}</span>
        <button className="pi-cal-nav-btn" onClick={next}><IC.ChevronR/></button>
      </div>
      <table className="pi-cal-grid">
        <thead><tr>{DAYS.map(d=><th key={d}>{d}</th>)}</tr></thead>
        <tbody>{Array.from({length:cs.length/7},(_,r)=>(
          <tr key={r}>{cs.slice(r*7,r*7+7).map((d,i)=>{
            if(!d)return<td key={i}/>;
            const isSel=!!(start&&same(d,start))||!!(end&&same(d,end));
            const isStart=!!(start&&same(d,start)); const isEnd=!!(end&&same(d,end));
            let cls="pi-cal-day";
            if(isStart&&end)cls+=" range-start"; else if(isEnd)cls+=" range-end"; else if(isSel)cls+=" selected";
            if(!isSel&&inR(d))cls+=" in-range";
            if(same(d,today)&&!isSel)cls+=" today";
            return<td key={i}><button className={cls} onClick={()=>pick(d)} onMouseEnter={()=>setHov(d)} onMouseLeave={()=>setHov(null)}>{d.getDate()}</button></td>;
          })}</tr>
        ))}</tbody>
      </table>
      <div className="pi-cal-footer">
        <button className="pi-cal-cancel" onClick={onCancel}>CANCEL</button>
        <button className="pi-cal-ok" onClick={()=>{if(start&&end)onApply(start,end);}}>OK</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   GSTR-2 REPORT PAGE
══════════════════════════════════════════════════════════ */
interface GSTR2Props {
  invoices: Invoice[];
  onBack: () => void;
}

function GSTR2Page({ invoices, onBack }: GSTR2Props) {
  const [activeTab, setActiveTab] = useState<"purchase"|"purchaseReturn">("purchase");
  const [dateFilter, setDateFilter] = useState<DateFilter>("This Week");
  const [showDateList, setShowDateList] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [customFrom, setCustomFrom] = useState<Date|null>(null);
  const [customTo, setCustomTo] = useState<Date|null>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setShowDateList(false); setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const [from, to] = getRange(dateFilter, customFrom||undefined, customTo||undefined);

  const filteredInvoices = invoices.filter(inv => {
    const d = new Date(inv.date); d.setHours(12);
    return d >= from && d <= to;
  });

  const dateBtnLabel = () => dateFilter === "Custom" && customFrom && customTo
    ? `${fmtShort(customFrom)} - ${fmtShort(customTo)}`
    : dateFilter;

  const gstr2Rows = filteredInvoices.map(inv => {
    const totalTax = inv.items.reduce((s, i) => s + (i.qty * i.price * i.tax / 100), 0);
    const taxableVal = inv.items.reduce((s, i) => s + (i.qty * i.price - i.discount), 0);
    const taxPct = inv.items.length > 0
      ? inv.items.find(i => i.tax > 0)?.tax ?? 0
      : 0;
    const party = ALL_PARTIES.find(p => p.id === inv.partyId);
    const gstin = party?.pan || "-";
    return {
      gstin,
      customerName: inv.partyName,
      stateCode: "-",
      stateName: "-",
      invoiceNo: inv.invoiceNumber,
      originalNo: "-",
      invoiceDate: fmtDateDDMM(inv.date),
      invoiceValue: inv.amount,
      totalTaxPct: taxPct > 0 ? `${taxPct}%` : "0%",
      taxableValue: taxableVal,
      sgst: totalTax > 0 ? totalTax / 2 : 0,
      cgst: totalTax > 0 ? totalTax / 2 : 0,
      igst: 0,
      cess: 0,
      totalTax,
    };
  });

  return (
    <div className="report-page">
      <div className="report-header">
        <div className="report-header-left">
          <button className="report-back-btn" onClick={onBack}>
            <IC.Back />
          </button>
          <span className="report-title">GSTR-2 (Purchase)</span>
          <button className="report-fav-btn">
            <IC.Star /> Favourite
          </button>
        </div>
      </div>

      <div className="report-toolbar">
        <div ref={dateRef} style={{ position: "relative" }}>
          <button className="report-date-btn" onClick={() => { setShowCalendar(false); setShowDateList(v => !v); }}>
            <IC.Calendar /> {dateBtnLabel()} <span className="arr">▾</span>
          </button>
          {showDateList && !showCalendar && (
            <div className="pi-dd pi-date-list-dd" style={{ zIndex: 200 }}>
              {DATE_OPTS.map(opt => (
                <div key={opt} className={`pi-dd-item ${dateFilter === opt ? "sel" : ""}`}
                  onClick={() => {
                    if (opt === "Custom") { setShowCalendar(true); setShowDateList(false); }
                    else { setDateFilter(opt); setShowDateList(false); }
                  }}>{opt}</div>
              ))}
            </div>
          )}
          {showCalendar && (
            <CalendarPicker
              onApply={(f, t) => { setCustomFrom(f); setCustomTo(t); setDateFilter("Custom"); setShowCalendar(false); }}
              onCancel={() => setShowCalendar(false)} />
          )}
        </div>
        <div className="report-toolbar-right">
          <button className="report-action-btn"><IC.Mail /> Email Excel</button>
          <div className="report-action-split">
            <button className="report-action-btn"><IC.Download /> Download Excel</button>
            <button className="report-action-btn-arr"><IC.Chevron /></button>
          </div>
          <button className="report-action-btn"><IC.Print /> Print PDF</button>
        </div>
      </div>

      <div className="report-tabs">
        <button
          className={`report-tab ${activeTab === "purchase" ? "active" : ""}`}
          onClick={() => setActiveTab("purchase")}>
          Purchase
        </button>
        <button
          className={`report-tab ${activeTab === "purchaseReturn" ? "active" : ""}`}
          onClick={() => setActiveTab("purchaseReturn")}>
          Purchase Return
        </button>
      </div>

      <div className="report-table-wrap">
        {activeTab === "purchase" ? (
          <table className="report-table">
            <thead>
              <tr>
                <th rowSpan={2} className="rth-group-none">GSTIN</th>
                <th rowSpan={2} className="rth-group-none">CUSTOMER NAME</th>
                <th colSpan={2} className="rth-group-center">PLACE OF SUPPLY</th>
                <th colSpan={3} className="rth-group-center">INVOICE DETAILS</th>
                <th rowSpan={2} className="rth-group-none">TOTAL TAX %</th>
                <th rowSpan={2} className="rth-group-none">TAXABLE VALUE</th>
                <th colSpan={5} className="rth-group-center">AMOUNT OF TAX</th>
              </tr>
              <tr>
                <th>STATE CODE</th>
                <th>STATE NAME</th>
                <th>INVOICE NO<br/>ORIGINAL NO</th>
                <th>INVOICE DATE</th>
                <th>INVOICE VALUE</th>
                <th>SGST</th>
                <th>CGST</th>
                <th>IGST</th>
                <th>CESS</th>
                <th>TOTAL TAX</th>
              </tr>
            </thead>
            <tbody>
              {gstr2Rows.length === 0 ? (
                <tr><td colSpan={14}>
                  <div className="report-empty">
                    <div className="report-empty-icon">📄</div>
                    No transactions available to generate report
                  </div>
                </td></tr>
              ) : gstr2Rows.map((row, i) => (
                <tr key={i}>
                  <td className="rtd-muted">{row.gstin}</td>
                  <td className="rtd-bold">{row.customerName}</td>
                  <td className="rtd-muted">{row.stateCode}</td>
                  <td className="rtd-muted">{row.stateName}</td>
                  <td className="rtd-muted" style={{ whiteSpace: "pre-line" }}>{row.invoiceNo}{"\n"}{row.originalNo}</td>
                  <td className="rtd-muted">{row.invoiceDate}</td>
                  <td className="rtd-num">₹ {row.invoiceValue.toLocaleString("en-IN")}</td>
                  <td className="rtd-muted">{row.totalTaxPct}</td>
                  <td className="rtd-num">{row.taxableValue > 0 ? `₹ ${row.taxableValue.toLocaleString("en-IN")}` : "-"}</td>
                  <td className="rtd-num">{row.sgst > 0 ? `₹ ${row.sgst.toLocaleString("en-IN")}` : "-"}</td>
                  <td className="rtd-num">{row.cgst > 0 ? `₹ ${row.cgst.toLocaleString("en-IN")}` : "-"}</td>
                  <td className="rtd-num">{row.igst > 0 ? `₹ ${row.igst.toLocaleString("en-IN")}` : "-"}</td>
                  <td className="rtd-num">-</td>
                  <td className="rtd-num">{row.totalTax > 0 ? `₹ ${row.totalTax.toLocaleString("en-IN")}` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="report-table">
            <thead>
              <tr>
                <th rowSpan={2} className="rth-group-none">GSTIN</th>
                <th rowSpan={2} className="rth-group-none">CUSTOMER NAME</th>
                <th colSpan={2} className="rth-group-center">PLACE OF SUPPLY</th>
                <th colSpan={4} className="rth-group-center">INVOICE DETAILS</th>
                <th rowSpan={2} className="rth-group-none">TOTAL TAX %</th>
                <th rowSpan={2} className="rth-group-none">TAXABLE VALUE</th>
                <th colSpan={5} className="rth-group-center">AMOUNT OF TAX</th>
              </tr>
              <tr>
                <th>STATE CODE</th>
                <th>STATE NAME</th>
                <th>INVOICE NO<br/>ORIGINAL NO</th>
                <th>INVOICE DATE</th>
                <th>INVOICE VALUE</th>
                <th>INVOICE TYPE</th>
                <th>SGST</th>
                <th>CGST</th>
                <th>IGST</th>
                <th>CESS</th>
                <th>TOTAL TAX</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan={15}>
                <div className="report-empty">
                  <div className="report-empty-icon">📄</div>
                  No transactions available to generate report
                </div>
              </td></tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DAYBOOK REPORT PAGE
══════════════════════════════════════════════════════════ */
interface DaybookProps {
  invoices: Invoice[];
  onBack: () => void;
}

function DaybookPage({ invoices, onBack }: DaybookProps) {
  const [dateFilter, setDateFilter] = useState<DateFilter>("This Week");
  const [showDateList, setShowDateList] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [customFrom, setCustomFrom] = useState<Date|null>(null);
  const [customTo, setCustomTo] = useState<Date|null>(null);
  const [staffFilter, setStaffFilter] = useState("All Staff");
  const [txnFilter, setTxnFilter] = useState("All Transactions");
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setShowDateList(false); setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const [from, to] = getRange(dateFilter, customFrom||undefined, customTo||undefined);

  const filteredInvoices = invoices.filter(inv => {
    const d = new Date(inv.date); d.setHours(12);
    return d >= from && d <= to;
  });

  const daybookRows = filteredInvoices.map(inv => ({
    date: fmtDateDDMM(inv.date),
    partyName: inv.partyName,
    transactionType: "Expenses",
    transactionNo: inv.invoiceNumber,
    totalAmount: inv.amount > 0 ? `₹ ${inv.amount.toLocaleString("en-IN")}` : "-",
    moneyIn: "-",
    moneyOut: "-",
    balanceAmount: "-",
    createdBy: "-",
  }));

  const netAmount = filteredInvoices.reduce((s, inv) => s + inv.amount, 0);

  const dateBtnLabel = () => dateFilter === "Custom" && customFrom && customTo
    ? `${fmtShort(customFrom)} - ${fmtShort(customTo)}`
    : dateFilter;

  return (
    <div className="report-page">
      <div className="report-header">
        <div className="report-header-left">
          <button className="report-back-btn" onClick={onBack}>
            <IC.Back />
          </button>
          <span className="report-title">Daybook</span>
          <button className="report-fav-btn">
            <IC.Star /> Favourite
          </button>
        </div>
      </div>

      <div className="report-toolbar">
        <div className="report-select-wrap">
          <select className="report-select" value={staffFilter} onChange={e => setStaffFilter(e.target.value)}>
            <option>All Staff</option>
          </select>
          <span className="report-select-arr">▾</span>
        </div>

        <div ref={dateRef} style={{ position: "relative" }}>
          <button className="report-date-btn" onClick={() => { setShowCalendar(false); setShowDateList(v => !v); }}>
            <IC.Calendar /> {dateBtnLabel()} <span className="arr">▾</span>
          </button>
          {showDateList && !showCalendar && (
            <div className="pi-dd pi-date-list-dd" style={{ zIndex: 200 }}>
              {DATE_OPTS.map(opt => (
                <div key={opt} className={`pi-dd-item ${dateFilter === opt ? "sel" : ""}`}
                  onClick={() => {
                    if (opt === "Custom") { setShowCalendar(true); setShowDateList(false); }
                    else { setDateFilter(opt); setShowDateList(false); }
                  }}>{opt}</div>
              ))}
            </div>
          )}
          {showCalendar && (
            <CalendarPicker
              onApply={(f, t) => { setCustomFrom(f); setCustomTo(t); setDateFilter("Custom"); setShowCalendar(false); }}
              onCancel={() => setShowCalendar(false)} />
          )}
        </div>

        <div className="report-select-wrap">
          <select className="report-select" value={txnFilter} onChange={e => setTxnFilter(e.target.value)}>
            <option>All Transactions</option>
            <option>Expenses</option>
            <option>Purchase Invoice</option>
          </select>
          <span className="report-select-arr">▾</span>
        </div>

        <div className="report-toolbar-right">
          <button className="report-action-btn"><IC.Mail /> Email Excel</button>
          <div className="report-action-split">
            <button className="report-action-btn"><IC.Download /> Download Excel</button>
            <button className="report-action-btn-arr"><IC.Chevron /></button>
          </div>
          <button className="report-action-btn"><IC.Print /> Print PDF</button>
        </div>
      </div>

      <div className="daybook-net-bar">
        Net Amount: <span className="daybook-net-val">₹ {netAmount.toLocaleString("en-IN")}</span>
      </div>

      <div className="report-table-wrap">
        <table className="report-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>PARTY NAME</th>
              <th>TRANSACTION TYPE</th>
              <th>TRANSACTION NO.</th>
              <th>TOTAL AMOUNT</th>
              <th>MONEY IN</th>
              <th>MONEY OUT</th>
              <th>BALANCE AMOUNT</th>
              <th>CREATED BY</th>
            </tr>
          </thead>
          <tbody>
            {daybookRows.length === 0 ? (
              <tr><td colSpan={9}>
                <div className="report-empty">
                  <div className="report-empty-icon">📄</div>
                  No transactions available to generate report
                </div>
              </td></tr>
            ) : daybookRows.map((row, i) => (
              <tr key={i}>
                <td>{row.date}</td>
                <td className="rtd-bold">{row.partyName}</td>
                <td className="rtd-muted">{row.transactionType}</td>
                <td className="rtd-muted">{row.transactionNo}</td>
                <td className="rtd-num">{row.totalAmount}</td>
                <td className="rtd-muted">{row.moneyIn}</td>
                <td className="rtd-muted">{row.moneyOut}</td>
                <td className="rtd-muted">{row.balanceAmount}</td>
                <td className="rtd-muted">{row.createdBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CREATE / EDIT / DUPLICATE PURCHASE INVOICE PAGE
══════════════════════════════════════════════════════════ */
interface CPIProps {
  mode: "create"|"edit"|"duplicate";
  editData?: Invoice;
  seqNo: number;
  onBack: ()=>void;
  onSaved: (inv:Invoice, isEdit:boolean)=>void;
  allParties: Party[];
  setAllParties: React.Dispatch<React.SetStateAction<Party[]>>;
  settings: AppSettings;
}

function CreatePurchaseInvoicePage({mode,editData,seqNo,onBack,onSaved,allParties,setAllParties,settings}:CPIProps) {
  const isEdit = mode==="edit";
  const isDup  = mode==="duplicate";
  const isNew  = mode==="create";

  const initParty = editData ? allParties.find(p=>p.id===editData.partyId)||null : null;

  const [partyState,setPartyState]=useState<"empty"|"searching"|"selected">(initParty?"selected":"empty");
  const [partySearch,setPartySearch]=useState("");
  const [selectedParty,setSelectedParty]=useState<Party|null>(initParty);
  const [invoiceItems,setInvoiceItems]=useState<InvoiceItem[]>(editData?[...editData.items]:[]);

  const [invNo]=useState(isEdit?(editData!.invoiceNumber.toString()):String(seqNo));
  const [invDate]=useState(isEdit ? fmtDate(new Date(editData!.date)) : todayStr());

  const [showDueDate,setShowDueDate]=useState(editData?editData.dueIn!=="-":false);
  const [payTerms,setPayTerms]=useState("30");
  const [dueDate]=useState(todayStr());
  const [amtPaid,setAmtPaid]=useState(editData?editData.amtPaid:0);
  const [payMethod,setPayMethod]=useState(editData?editData.payMethod:"Cash");
  const [roundOff,setRoundOff]=useState(editData?editData.roundOff:false);
  const [roundOffDir,setRoundOffDir]=useState(editData?editData.roundOffDir:"+Add");
  const [roundOffVal,setRoundOffVal]=useState(editData?editData.roundOffVal:0);
  const [applyTCS,setApplyTCS]=useState(false);
  const [applyTDS,setApplyTDS]=useState(false);
  const [markPaid,setMarkPaid]=useState(false);
  const [showNotes,setShowNotes]=useState(false);
  const [notes,setNotes]=useState("");
  const [showCreateParty,setShowCreateParty]=useState(false);
  const [showAddItems,setShowAddItems]=useState(false);
  const [toast,setToast]=useState<string|null>(null);
  const [additionalCharges,setAdditionalCharges]=useState<AdditionalCharge[]>(editData?[...editData.additionalCharges]:[]);
  const [showDiscount,setShowDiscount]=useState(editData?editData.discountEnabled:false);
  const [discountType,setDiscountType]=useState<"%"|"₹">(editData?editData.discountType:"%");
  const [discountVal,setDiscountVal]=useState(editData?editData.discountVal:0);

  const [showShipModal,setShowShipModal]=useState(false);
  const [shipName,setShipName]=useState(editData?editData.shipping.name:(initParty?.name||""));
  const [shipPhone,setShipPhone]=useState(editData?editData.shipping.phone:(initParty?.phone||""));
  const [shipAddr,setShipAddr]=useState(editData?editData.shipping.addr:"");
  const [shipState,setShipState]=useState(editData?editData.shipping.state:"");
  const [shipPin,setShipPin]=useState(editData?editData.shipping.pin:"");
  const [shipCity,setShipCity]=useState(editData?editData.shipping.city:"");
  const [shipSaved,setShipSaved]=useState(editData?!editData.shipping.isSame:false);

  const [cpName,setCpName]=useState(""); const [cpPhone,setCpPhone]=useState("");
  const [cpShowAddr,setCpShowAddr]=useState(false); const [cpShowGST,setCpShowGST]=useState(false);
  const [cpAddr,setCpAddr]=useState(""); const [cpState,setCpState]=useState("");
  const [cpPin,setCpPin]=useState(""); const [cpCity,setCpCity]=useState("");
  const [cpSameShip,setCpSameShip]=useState(true); const [cpGSTIN,setCpGSTIN]=useState("");
  const [cpErr,setCpErr]=useState(false);

  const [itemSearch,setItemSearch]=useState("");
  const [pendingQtys,setPendingQtys]=useState<Record<number,number>>({});
  const [addedIds,setAddedIds]=useState<number[]>([]);

  const partyRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const h=(e:MouseEvent)=>{
      if(partyRef.current&&!partyRef.current.contains(e.target as Node))
        if(partyState==="searching")setPartyState(selectedParty?"selected":"empty");
    };
    document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h);
  },[partyState,selectedParty]);

  const showT=(m:string)=>{setToast(m);setTimeout(()=>setToast(null),2400);};

  const subtotal      = invoiceItems.reduce((s,i)=>s+(i.qty*i.price-i.discount),0);
  const totalTax      = invoiceItems.reduce((s,i)=>s+(i.qty*i.price*i.tax/100),0);
  const chargesTotal  = additionalCharges.reduce((s,c)=>s+c.amount,0);
  const taxableAmount = subtotal+chargesTotal;
  const discountAmt   = showDiscount?(discountType==="%"?taxableAmount*discountVal/100:discountVal):0;
  const roundOffAmt   = roundOff?(roundOffDir==="+Add"?roundOffVal:-roundOffVal):0;
  const totalAmt      = taxableAmount-discountAmt+totalTax+roundOffAmt;
  const balance       = totalAmt-amtPaid;

  const selectParty=(p:Party)=>{
    setSelectedParty(p); setPartyState("selected"); setPartySearch("");
    setShipName(p.name); setShipPhone(p.phone); setShipSaved(false);
    setShipAddr(""); setShipState(""); setShipPin(""); setShipCity("");
  };
  const filtParties=allParties.filter(p=>p.name.toLowerCase().includes(partySearch.toLowerCase()));
  const filtCatalog=CATALOG.filter(c=>c.name.toLowerCase().includes(itemSearch.toLowerCase())||c.code.toLowerCase().includes(itemSearch.toLowerCase()));

  const saveParty=()=>{
    if(!cpName.trim()){setCpErr(true);return;}
    const np:Party={id:Date.now(),name:cpName,phone:cpPhone,pan:"",balance:0};
    setAllParties(p=>[...p,np]); selectParty(np); setShowCreateParty(false);
    setCpName("");setCpPhone("");setCpShowAddr(false);setCpShowGST(false);setCpErr(false);
    showT(`Party "${cpName}" created`);
  };

  const openAddItems=()=>{
    const init:Record<number,number>={};
    invoiceItems.forEach(i=>{init[i.id]=i.qty;});
    setPendingQtys(init);
    setAddedIds(invoiceItems.map(i=>i.id));
    setShowAddItems(true);
  };
  const toggleItem=(cat:CatalogItem)=>{
    if(addedIds.includes(cat.id)){
      setAddedIds(p=>p.filter(x=>x!==cat.id));
      setPendingQtys(p=>{const n={...p};delete n[cat.id];return n;});
    } else {
      setAddedIds(p=>[...p,cat.id]);
      setPendingQtys(p=>({...p,[cat.id]:1}));
    }
  };
  const setPendingQty=(id:number,v:number)=>setPendingQtys(p=>({...p,[id]:Math.max(1,v)}));
  const addToBill=()=>{
    const newItems:InvoiceItem[]=addedIds.map(id=>{
      const existing=invoiceItems.find(i=>i.id===id);
      const cat=CATALOG.find(c=>c.id===id)!;
      return existing
        ?{...existing,qty:pendingQtys[id]??existing.qty}
        :{id:cat.id,name:cat.name,hsn:"",qty:pendingQtys[id]??1,price:cat.purchasePrice||cat.salesPrice,discount:0,tax:0};
    });
    setInvoiceItems(newItems);
    setShowAddItems(false); setItemSearch("");
  };
  const removeItem=(id:number)=>setInvoiceItems(p=>p.filter(i=>i.id!==id));
  const updItem=(id:number,f:keyof InvoiceItem,v:string)=>
    setInvoiceItems(p=>p.map(i=>i.id===id?{...i,[f]:isNaN(Number(v))?v:Number(v)}:i));

  const addCharge=()=>setAdditionalCharges(p=>[...p,{id:Date.now(),label:"",amount:0,taxRate:"No Tax Applicable"}]);
  const updCharge=(id:number,f:keyof AdditionalCharge,v:string|number)=>setAdditionalCharges(p=>p.map(c=>c.id===id?{...c,[f]:v}:c));
  const removeCharge=(id:number)=>setAdditionalCharges(p=>p.filter(c=>c.id!==id));

  const handleSave=()=>{
    if(!selectedParty){showT("Please select a party first");return;}
    const inv:Invoice={
      id:isEdit?editData!.id:Date.now(),
      date:isEdit?editData!.date:new Date().toISOString().slice(0,10),
      invoiceNumber:Number(invNo),
      partyName:selectedParty.name, partyId:selectedParty.id,
      partyPhone:selectedParty.phone, partyPan:selectedParty.pan,
      dueIn:showDueDate?`${payTerms} days`:"-",
      amount:totalAmt,
      status:markPaid?"paid":totalAmt>0&&amtPaid<totalAmt?"unpaid":"",
      items:invoiceItems,
      additionalCharges,
      shipping:{name:shipName,phone:shipPhone,addr:shipAddr,city:shipCity,state:shipState,pin:shipPin,isSame:!shipSaved},
      discountEnabled:showDiscount, discountType, discountVal,
      roundOff, roundOffDir, roundOffVal, amtPaid, payMethod,
    };
    onSaved(inv, isEdit);
  };

  return (
    <div className="cpi-page">
      {/* ── TOP BAR ── FIXED: back arrow and title are now separate elements */}
      <div className="cpi-topbar">
        <div className="cpi-title-wrap">
          <button className="cpi-back-btn" onClick={onBack}>
            <IC.Back/>
          </button>
          <span className="cpi-page-title">
            {isEdit ? "Update Purchase Invoice" : "Create Purchase Invoice"}
          </span>
        </div>
        <div className="cpi-topbar-right">
          <button className="btn-upload"><IC.Upload/> Upload using Phone</button>
          <button className="btn-topbar-settings"><IC.Settings/> Settings<span className="red-dot"/></button>
          {!isEdit&&<button className="btn-save-new" onClick={()=>showT("Saved & new invoice")}>Save &amp; New</button>}
          <button className={isEdit?"btn-save-update":"btn-save-top"} onClick={handleSave}>
            {isEdit?"Update Purchase Invoice":"Save"}
          </button>
        </div>
      </div>

      <div className="cpi-body">
        <div className={`cpi-top-card ${isEdit?"edit-mode":""}`}>
          {isEdit ? (
            <div className="edit-party-row">
              <div className="edit-party-col">
                <div className="edit-party-col-header">
                  <span className="edit-col-label">Bill From</span>
                  <div ref={partyRef} style={{position:"relative"}}>
                    <button className="btn-change-inline" onClick={()=>setPartyState(partyState==="searching"?"selected":"searching")}>Change Party</button>
                    {partyState==="searching"&&(
                      <div className="party-search-wrap" style={{position:"absolute",top:"100%",left:0,minWidth:300,zIndex:300}}>
                        <input className="party-search-input" placeholder="Search party" value={partySearch} onChange={e=>setPartySearch(e.target.value)} autoFocus/>
                        <span className="party-search-arrow"><IC.Chevron/></span>
                        <div className="party-dropdown">
                          <div className="party-dd-header"><span>Party Name</span><span>Balance</span></div>
                          {filtParties.map(p=>(
                            <div key={p.id} className="party-dd-item" onClick={()=>selectParty(p)}>
                              <span className="party-dd-name">{p.name}</span>
                              <span className={`party-dd-bal ${p.balance<0?"neg":""}`}>{fmtMoney(p.balance)}</span>
                            </div>
                          ))}
                          <div className="party-dd-create" onClick={()=>{setShowCreateParty(true);setPartyState("selected");}}><IC.Plus/> + Create Party</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="edit-party-info">
                  <div className="edit-party-name">{selectedParty?.name||"—"}</div>
                  {selectedParty?.phone&&<div className="edit-party-detail">Phone Number: {selectedParty.phone}</div>}
                  {selectedParty?.pan&&<div className="edit-party-detail">PAN Number: {selectedParty.pan}</div>}
                </div>
              </div>
              <div className="edit-party-col">
                <div className="edit-party-col-header">
                  <span className="edit-col-label">Ship From</span>
                  <button className="btn-change-inline" onClick={()=>setShowShipModal(true)}>Change Shipping Address</button>
                </div>
                <div className="edit-party-info">
                  <div className="edit-party-name">{shipSaved?shipName:(selectedParty?.name||"—")}</div>
                  {(shipSaved?shipPhone:selectedParty?.phone)&&<div className="edit-party-detail">Phone Number: {shipSaved?shipPhone:selectedParty?.phone}</div>}
                  {shipSaved&&shipAddr&&<div className="edit-party-detail">{shipAddr}{shipCity?`, ${shipCity}`:""}{shipState?`, ${shipState}`:""}{shipPin?` - ${shipPin}`:""}</div>}
                </div>
              </div>
            </div>
          ) : (
            <div className="cpi-bill-panel">
              <div className="section-label">Bill From</div>
              {partyState==="empty"&&(
                <div ref={partyRef} className="party-add-box" onClick={()=>setPartyState("searching")}>
                  <div className="party-add-inner"><IC.Plus/>  Add Party</div>
                </div>
              )}
              {partyState==="searching"&&(
                <div ref={partyRef} className="party-search-wrap">
                  <input className="party-search-input" placeholder="Search party by name or number" value={partySearch} onChange={e=>setPartySearch(e.target.value)} autoFocus/>
                  <span className="party-search-arrow"><IC.Chevron/></span>
                  <div className="party-dropdown">
                    <div className="party-dd-header"><span>Party Name</span><span>Balance</span></div>
                    {filtParties.map(p=>(
                      <div key={p.id} className="party-dd-item" onClick={()=>selectParty(p)}>
                        <span className="party-dd-name">{p.name}</span>
                        <span className={`party-dd-bal ${p.balance<0?"neg":""}`}>{fmtMoney(p.balance)}{p.balance<0&&<IC.ArrowUp/>}</span>
                      </div>
                    ))}
                    <div className="party-dd-create" onClick={()=>{setShowCreateParty(true);setPartyState("empty");}}><IC.Plus/> + Create Party</div>
                  </div>
                </div>
              )}
              {partyState==="selected"&&selectedParty&&(
                <div className="party-info-section">
                  <div className="party-info-pane">
                    <div className="party-info-pane-header"><span className="pane-label">Bill From</span><button className="btn-change" onClick={()=>setPartyState("searching")}>Change Party</button></div>
                    <div className="party-info-name">{selectedParty.name}</div>
                    {selectedParty.phone&&<div className="party-info-line">Phone: {selectedParty.phone}</div>}
                  </div>
                  <div className="party-info-pane">
                    <div className="party-info-pane-header"><span className="pane-label">Ship From</span><button className="btn-change" onClick={()=>setShowShipModal(true)}>Change Address</button></div>
                    <div className="party-info-name">{shipSaved?shipName:selectedParty.name}</div>
                    {(shipSaved?shipPhone:selectedParty.phone)&&<div className="party-info-line">Phone: {shipSaved?shipPhone:selectedParty.phone}</div>}
                    {shipSaved&&shipAddr&&<div className="party-info-line">{shipAddr}{shipCity?`, ${shipCity}`:""}{shipState?`, ${shipState}`:""}{shipPin?` - ${shipPin}`:""}</div>}
                    {!shipSaved&&<div className="party-info-line ship-same-tag">Same as Bill From</div>}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="cpi-invoice-fields">
            <div className="inv-fields-top-row">
              <div className="inv-field-group" style={{flex:"0 0 80px"}}><label>Purchase Inv No:</label><input value={invNo} readOnly/></div>
              <div className="inv-field-group" style={{flex:1}}><label>Purchase Inv Date:</label>
                <div className="date-field-wrap"><span className="cal-icon"><IC.Calendar/></span><span className="date-val">{invDate}</span><span className="caret">▾</span></div>
              </div>
              <div className="inv-field-group" style={{flex:1}}><label>Original Inv No.</label><input placeholder=""/></div>
            </div>
            {!showDueDate
              ?<button className="add-due-date-btn" onClick={()=>setShowDueDate(true)}><IC.Plus/> + Add Due Date</button>
              :<div className="due-date-row">
                  <div className="inv-field-group" style={{flex:"0 0 auto"}}><label>Payment Terms:</label>
                    <div style={{display:"flex",alignItems:"center",border:"1px solid #d0d5dd",borderRadius:6,overflow:"hidden",background:"#fff"}}>
                      <input value={payTerms} onChange={e=>setPayTerms(e.target.value)} style={{border:"none",width:46,padding:"7px 8px",outline:"none",fontFamily:"inherit",fontSize:12}}/>
                      <span className="days-tag">days</span>
                    </div>
                  </div>
                  <div className="inv-field-group" style={{flex:1}}><label>Due Date:</label>
                    <div className="date-field-wrap"><span className="cal-icon"><IC.Calendar/></span><span className="date-val">{dueDate}</span></div>
                  </div>
                  <button className="due-date-remove" onClick={()=>setShowDueDate(false)} style={{marginTop:18}}><IC.X/></button>
                </div>
            }
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
              {invoiceItems.map((item,idx)=>(
                <tr key={item.id}>
                  <td style={{color:"#667085",textAlign:"center"}}>{idx+1}</td>
                  <td>
                    <div style={{fontWeight:600,color:"#1a2332"}}>{item.name}</div>
                    <input className="item-desc-input" placeholder="Enter Description (optional)"/>
                  </td>
                  <td><input className="qty-input" style={{width:92}} value={item.hsn} onChange={e=>updItem(item.id,"hsn",e.target.value)}/></td>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:3}}>
                      <input className="qty-input" type="number" value={item.qty} onChange={e=>updItem(item.id,"qty",e.target.value)}/>
                      <span style={{fontSize:10,color:"#98a2b3",whiteSpace:"nowrap"}}>PCS</span>
                    </div>
                  </td>
                  <td><input className="qty-input" style={{width:108}} type="number" value={item.price||""} placeholder="0" onChange={e=>updItem(item.id,"price",e.target.value)}/></td>
                  <td>
                    <div style={{display:"flex",flexDirection:"column",gap:3}}>
                      <div style={{display:"flex",alignItems:"center",gap:3}}>
                        <span style={{fontSize:11,color:"#667085"}}>%</span>
                        <input className="qty-input" style={{width:60}} type="number" value={item.discount||""} placeholder="0" onChange={e=>updItem(item.id,"discount",e.target.value)}/>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:3}}>
                        <span style={{fontSize:11,color:"#667085"}}>₹</span>
                        <input className="qty-input" style={{width:60}} type="number" value={item.discount||""} placeholder="0" onChange={e=>updItem(item.id,"discount",e.target.value)}/>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{display:"flex",flexDirection:"column",gap:3}}>
                      <div style={{fontSize:11,color:"#667085"}}>{item.tax}%</div>
                      <div style={{fontSize:11,color:"#667085"}}>(₹ {(item.qty*item.price*item.tax/100).toLocaleString("en-IN")})</div>
                    </div>
                  </td>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{fontSize:11,color:"#98a2b3"}}>₹</span>
                      <span style={{fontWeight:700,color:"#1d2939"}}>{(item.qty*item.price-item.discount).toLocaleString("en-IN")}</span>
                    </div>
                  </td>
                  <td><button className="item-row-delete" onClick={()=>removeItem(item.id)}><IC.Trash/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="add-item-area">
            <button className="add-item-dashed-btn" onClick={openAddItems}><IC.Plus/>  Add Item</button>
            <div className="scan-barcode-area" onClick={()=>showT("Scan barcode")}><IC.Barcode/> Scan Barcode</div>
          </div>
          <div className="subtotal-row">
            <span className="sub-label">SUBTOTAL</span>
            <span className="sub-cell">₹ {subtotal.toLocaleString("en-IN")}</span>
            <span className="sub-cell">₹ {totalTax.toLocaleString("en-IN")}</span>
            <span className="sub-cell">₹ {(subtotal+totalTax).toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="cpi-bottom-section">
          <div className="notes-panel">
            {!showNotes
              ?<button className="btn-add-notes" onClick={()=>setShowNotes(true)}>+ Add Notes</button>
              :<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Add notes..."
                  style={{width:"100%",border:"1.5px solid #dde1e9",borderRadius:6,padding:"7px 10px",
                  fontSize:12,outline:"none",resize:"vertical",minHeight:50,fontFamily:"inherit",marginBottom:10}}/>
            }
            <div className="tc-label-row">
              <span className="tc-heading">Terms and Conditions</span>
              <button className="tc-gear-btn" onClick={()=>showT("T&C settings")}><IC.Gear/></button>
            </div>
            <div className="tc-list">
              1. Goods once sold will not be taken back or exchanged<br/>
              2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only
            </div>
          </div>

          <div className="summary-panel">
            {additionalCharges.map(c=>(
              <div key={c.id} className="charge-row">
                <input className="charge-label-input" placeholder="Enter charge (ex. Transport Charge)"
                  value={c.label} onChange={e=>updCharge(c.id,"label",e.target.value)}/>
                <div className="charge-right">
                  <div className="charge-amount-wrap">
                    <span className="charge-rupee">₹</span>
                    <input type="number" className="charge-amt-input" value={c.amount===0?"":c.amount}
                      onChange={e=>updCharge(c.id,"amount",Number(e.target.value))} placeholder="0"/>
                  </div>
                  <select className="charge-tax-select" value={c.taxRate} onChange={e=>updCharge(c.id,"taxRate",e.target.value)}>
                    <option>No Tax Applicable</option><option>5%</option><option>12%</option><option>18%</option><option>28%</option>
                  </select>
                  <button className="charge-remove-btn" onClick={()=>removeCharge(c.id)}><IC.X/></button>
                </div>
              </div>
            ))}
            <button className="btn-add-charge-link" onClick={addCharge}>
              {additionalCharges.length===0?"+ Add Additional Charges":"+ Add Another Charge"}
            </button>

            <div className="summary-line">
              <span className="summary-line-label">Taxable Amount</span>
              <span className="summary-line-value">{fmtAmt(taxableAmount)}</span>
            </div>

            {totalTax>0&&(
              <>
                <div className="summary-line tax-sub-line">
                  <span className="summary-line-label">SGST@9</span>
                  <span className="summary-line-value">{fmtAmt(totalTax/2)}</span>
                </div>
                <div className="summary-line tax-sub-line">
                  <span className="summary-line-label">CGST@9</span>
                  <span className="summary-line-value">{fmtAmt(totalTax/2)}</span>
                </div>
              </>
            )}

            {!showDiscount
              ?<button className="btn-add-discount-link" onClick={()=>setShowDiscount(true)}>+ Add Discount</button>
              :<div className="discount-row">
                  <span className="discount-label">Discount</span>
                  <div className="discount-inputs">
                    <select className="discount-type-select" value={discountType} onChange={e=>setDiscountType(e.target.value as any)}>
                      <option value="%">%</option><option value="₹">₹</option>
                    </select>
                    <input type="number" className="discount-val-input" value={discountVal} onChange={e=>setDiscountVal(Number(e.target.value))}/>
                    <span className="discount-computed">- {fmtAmt(discountAmt)}</span>
                    <button className="charge-remove-btn" onClick={()=>{setShowDiscount(false);setDiscountVal(0);}}><IC.X/></button>
                  </div>
                </div>
            }

            <div className="summary-checkbox-row">
              <label className="summary-checkbox-label"><input type="checkbox" checked={applyTCS} onChange={e=>setApplyTCS(e.target.checked)}/>Apply TCS</label>
            </div>
            <div className="round-off-line">
              <label className="summary-checkbox-label"><input type="checkbox" checked={roundOff} onChange={e=>setRoundOff(e.target.checked)}/>Auto Round Off</label>
              {roundOff&&(
                <div className="round-off-controls">
                  <select value={roundOffDir} onChange={e=>setRoundOffDir(e.target.value)} className="round-dir-select">
                    <option value="+Add">+Add</option><option value="-Sub">-Sub</option>
                  </select>
                  <span className="round-rupee">₹</span>
                  <input type="number" className="round-val-input" value={roundOffVal} onChange={e=>setRoundOffVal(Number(e.target.value))}/>
                </div>
              )}
            </div>

            <div className="total-amount-line">
              <span className="total-amount-label">Total Amount</span>
              <div className="enter-payment-wrap">
                {totalAmt>0&&<span className="total-amount-value-big">{fmtAmt(totalAmt)}</span>}
                {totalAmt===0&&<span className="total-amount-value">₹ 0</span>}
                {!isEdit&&<button className="enter-payment-btn">Enter Payment amount</button>}
              </div>
            </div>
            <div className="mark-paid-line">
              <label className="mark-paid-label">Mark as fully paid<input type="checkbox" checked={markPaid} onChange={e=>{setMarkPaid(e.target.checked);if(e.target.checked)setAmtPaid(totalAmt);else setAmtPaid(0);}}/></label>
            </div>
            <div className="amount-paid-line">
              <span className="amount-paid-label">Amount Paid</span>
              <div className="amount-paid-inputs">
                <div className="rupee-input-wrap"><span className="rupee-prefix">₹</span><input type="number" className="rupee-num-input" value={amtPaid} onChange={e=>setAmtPaid(Number(e.target.value))}/></div>
                <select className="payment-method-select" value={payMethod} onChange={e=>setPayMethod(e.target.value)}><option>Cash</option><option>Bank</option><option>UPI</option></select>
              </div>
            </div>
            <div className="summary-checkbox-row">
              <label className="summary-checkbox-label"><input type="checkbox" checked={applyTDS} onChange={e=>setApplyTDS(e.target.checked)}/>Apply TDS</label>
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

      {showCreateParty&&(
        <div className="modal-overlay" onClick={()=>setShowCreateParty(false)}>
          <div className="modal create-party-modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-head"><span className="modal-title">Create New Party</span><button className="modal-close" onClick={()=>setShowCreateParty(false)}><IC.X/></button></div>
            <div className="modal-body">
              <div className="form-group"><label>Party Name <span className="req">*</span></label><input placeholder="Enter name" value={cpName} className={cpErr?"error":""} onChange={e=>{setCpName(e.target.value);setCpErr(false);}}/>{cpErr&&<div className="error-msg">This field is mandatory</div>}</div>
              <div className="form-group"><label>Mobile Number</label><input placeholder="Enter Mobile Number" value={cpPhone} onChange={e=>setCpPhone(e.target.value)}/></div>
              {!cpShowAddr?<button className="btn-optional" onClick={()=>setCpShowAddr(true)}><IC.Plus/> + Add Address (Optional)</button>
                :<div className="optional-section">
                  <div className="optional-section-header"><span className="optional-section-label">Address (Optional)</span><button className="btn-remove-section" onClick={()=>setCpShowAddr(false)}>Remove</button></div>
                  <div className="form-group"><label>BILLING ADDRESS <span className="req">*</span></label><textarea placeholder="Enter billing address" value={cpAddr} onChange={e=>setCpAddr(e.target.value)}/></div>
                  <div className="form-row"><div className="form-group"><label>STATE</label><input placeholder="Enter State" value={cpState} onChange={e=>setCpState(e.target.value)}/></div><div className="form-group"><label>PINCODE</label><input placeholder="Enter Pincode" value={cpPin} onChange={e=>setCpPin(e.target.value)}/></div></div>
                  <div className="form-group"><label>CITY</label><input placeholder="Enter City" value={cpCity} onChange={e=>setCpCity(e.target.value)}/></div>
                  <label className="ship-checkbox"><input type="checkbox" checked={cpSameShip} onChange={e=>setCpSameShip(e.target.checked)}/>Shipping address same as billing address</label>
                </div>
              }
              {!cpShowGST?<button className="btn-optional" onClick={()=>setCpShowGST(true)}><IC.Plus/> + Add GSTIN (Optional)</button>
                :<div className="optional-section">
                  <div className="optional-section-header"><span className="optional-section-label">GSTIN (Optional)</span><button className="btn-remove-section" onClick={()=>setCpShowGST(false)}>Remove</button></div>
                  <div className="form-group"><label>GSTIN</label><input placeholder="ex: 29XXXXX9438X1XX" value={cpGSTIN} onChange={e=>setCpGSTIN(e.target.value)}/></div>
                </div>
              }
              <div className="custom-fields-note">You can add Custom Fields from <a href="#" onClick={e=>e.preventDefault()}>Party Settings</a>.</div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={()=>setShowCreateParty(false)}>Cancel</button>
              <button className="modal-btn-save" onClick={saveParty} disabled={!cpName.trim()}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showShipModal&&(
        <div className="modal-overlay" onClick={()=>setShowShipModal(false)}>
          <div className="modal ship-addr-modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-head"><span className="modal-title">Change Shipping Address</span><button className="modal-close" onClick={()=>setShowShipModal(false)}><IC.X/></button></div>
            <div className="modal-body">
              <div className="ship-same-checkbox-row">
                <label className="ship-checkbox"><input type="checkbox" checked={!shipSaved} onChange={e=>{ if(e.target.checked){setShipSaved(false);setShowShipModal(false);}}}/>Same as Bill From address</label>
              </div>
              <div className="ship-divider-label">— or enter a different shipping address —</div>
              <div className="form-group"><label>Name <span className="req">*</span></label><input placeholder="Enter name" value={shipName} onChange={e=>setShipName(e.target.value)}/></div>
              <div className="form-group"><label>Phone Number</label><input placeholder="Enter phone number" value={shipPhone} onChange={e=>setShipPhone(e.target.value)}/></div>
              <div className="form-group"><label>Address</label><textarea placeholder="Enter shipping address" value={shipAddr} onChange={e=>setShipAddr(e.target.value)}/></div>
              <div className="form-row">
                <div className="form-group"><label>City</label><input placeholder="Enter city" value={shipCity} onChange={e=>setShipCity(e.target.value)}/></div>
                <div className="form-group"><label>State</label><input placeholder="Enter state" value={shipState} onChange={e=>setShipState(e.target.value)}/></div>
              </div>
              <div className="form-group"><label>Pincode</label><input placeholder="Enter pincode" value={shipPin} onChange={e=>setShipPin(e.target.value)} style={{width:"50%"}}/></div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={()=>setShowShipModal(false)}>Cancel</button>
              <button className="modal-btn-save" onClick={()=>{setShipSaved(true);setShowShipModal(false);showT("Shipping address updated");}}>Save Address</button>
            </div>
          </div>
        </div>
      )}

      {showAddItems&&(
        <div className="modal-overlay" onClick={()=>{setShowAddItems(false);setItemSearch("");}}>
          <div className="aim-modal" onClick={e=>e.stopPropagation()}>
            <div className="aim-header"><span className="aim-title">Add Items to Bill</span><button className="aim-close" onClick={()=>{setShowAddItems(false);setItemSearch("");}}><IC.X/></button></div>
            <div className="aim-search-row">
              <div className="aim-search-box">
                <span className="aim-search-icon"><IC.Search/></span>
                <input className="aim-search-input" placeholder="Search by Item / Serial no./ HSN code/ SKU/ Custom Field / Category" value={itemSearch} onChange={e=>setItemSearch(e.target.value)} autoFocus/>
                <button className="aim-barcode-btn"><IC.Barcode/></button>
              </div>
              <div className="aim-cat-wrap"><select className="aim-cat-select"><option>Select Category</option><option>Electronics</option><option>Software</option></select></div>
              <button className="aim-create-btn" onClick={()=>showT("Create new item")}>Create New Item</button>
            </div>
            <div className="aim-table-wrap">
              <table className="aim-table">
                <thead><tr><th>Item Name</th><th style={{width:100}}>Item Code</th><th style={{width:90}}>Stock</th><th style={{width:110}}>Sales Price</th><th style={{width:120}}>Purchase Price</th><th style={{width:110,textAlign:"center"}}>Quantity</th></tr></thead>
                <tbody>
                  {filtCatalog.map(c=>{
                    const isAdded=addedIds.includes(c.id); const qty=pendingQtys[c.id]??1;
                    return (
                      <tr key={c.id} className={isAdded?"aim-row-added":""}>
                        <td className="aim-item-name">{c.name}</td>
                        <td className="aim-td-muted">{c.code}</td>
                        <td className="aim-td-muted">{c.stock}</td>
                        <td className="aim-td-muted">{c.salesPrice>0?`₹${c.salesPrice.toLocaleString("en-IN")}`:""}</td>
                        <td className="aim-td-muted">{c.purchasePrice>0?`₹${c.purchasePrice.toLocaleString("en-IN")}`:""}</td>
                        <td style={{textAlign:"center"}}>
                          {isAdded
                            ?<div className="aim-qty-controls">
                                <button className="aim-qty-btn" onClick={()=>setPendingQty(c.id,qty-1)}>−</button>
                                <input className="aim-qty-input" type="number" value={qty} onChange={e=>setPendingQty(c.id,Number(e.target.value))}/>
                                <button className="aim-qty-btn" onClick={()=>setPendingQty(c.id,qty+1)}>+</button>
                              </div>
                            :<button className="aim-add-btn" onClick={()=>toggleItem(c)}>+ Add</button>
                          }
                        </td>
                      </tr>
                    );
                  })}
                  {filtCatalog.length===0&&<tr><td colSpan={6} style={{textAlign:"center",padding:28,color:"#9aabbd"}}>No items found</td></tr>}
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
                <button className="aim-cancel-btn" onClick={()=>{setShowAddItems(false);setItemSearch("");}}>Cancel (ESC)</button>
                <button className="aim-confirm-btn" onClick={addToBill}>Add to Bill (F7)</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast&&<div className="pi-toast">{toast}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════
   PURCHASE INVOICES LIST PAGE
══════════════════════════════════════════ */
function PurchaseInvoicesPage({invoices,setInvoices,settings,setSettings,
  onCreateNew,onEdit,onDuplicate,onGSTR2,onDaybook}:{
  invoices:Invoice[];setInvoices:React.Dispatch<React.SetStateAction<Invoice[]>>;
  settings:AppSettings;setSettings:React.Dispatch<React.SetStateAction<AppSettings>>;
  onCreateNew:()=>void; onEdit:(inv:Invoice)=>void; onDuplicate:(inv:Invoice)=>void;
  onGSTR2:()=>void; onDaybook:()=>void;
}) {
  const [activeCard,setActiveCard]=useState<"all"|"paid"|"unpaid">("all");
  const [dateFilter,setDateFilter]=useState<DateFilter>("Last 365 Days");
  const [customFrom,setCustomFrom]=useState<Date|null>(null);
  const [customTo,setCustomTo]=useState<Date|null>(null);
  const [showDateList,setShowDateList]=useState(false);
  const [showCalendar,setShowCalendar]=useState(false);
  const [showReports,setShowReports]=useState(false);
  const [showSType,setShowSType]=useState(false);
  const [searchType,setSearchType]=useState<SearchType>("Invoice No. & Party name");
  const [query,setQuery]=useState("");
  const [showSettings,setShowSettings]=useState(false);
  const [ctx,setCtx]=useState<{id:number;x:number;y:number}|null>(null);
  const [toast,setToast]=useState<string|null>(null);
  const dateRef=useRef<HTMLDivElement>(null),reportsRef=useRef<HTMLDivElement>(null),stypeRef=useRef<HTMLDivElement>(null),ctxRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const h=(e:MouseEvent)=>{
      if(dateRef.current&&!dateRef.current.contains(e.target as Node)){setShowDateList(false);setShowCalendar(false);}
      if(reportsRef.current&&!reportsRef.current.contains(e.target as Node))setShowReports(false);
      if(stypeRef.current&&!stypeRef.current.contains(e.target as Node))setShowSType(false);
      if(ctxRef.current&&!ctxRef.current.contains(e.target as Node))setCtx(null);
    };
    document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h);
  },[]);

  const showT=(m:string)=>{setToast(m);setTimeout(()=>setToast(null),2400);};

  const displayed=useCallback(()=>{
    const [from,to]=getRange(dateFilter,customFrom||undefined,customTo||undefined);
    return invoices.filter(inv=>{
      const d=new Date(inv.date);d.setHours(12);
      if(d<from||d>to)return false;
      if(activeCard==="paid"&&inv.status!=="paid")return false;
      if(activeCard==="unpaid"&&inv.status!=="unpaid")return false;
      if(query.trim()){const q=query.toLowerCase();return inv.partyName.toLowerCase().includes(q)||inv.invoiceNumber.toString().includes(q);}
      return true;
    });
  },[invoices,activeCard,dateFilter,customFrom,customTo,query])();

  const totalAll=invoices.reduce((s,i)=>s+i.amount,0);
  const totalPaid=invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+i.amount,0);
  const totalUnpaid=invoices.filter(i=>i.status==="unpaid").reduce((s,i)=>s+i.amount,0);

  const handleDot=(e:React.MouseEvent,id:number)=>{
    e.stopPropagation();
    const r=(e.currentTarget as HTMLElement).getBoundingClientRect();
    setCtx({id,x:r.right-173,y:r.bottom+5});
  };

  const doCtx=(action:string)=>{
    const inv=invoices.find(i=>i.id===ctx?.id); setCtx(null); if(!inv)return;
    if(action==="edit") onEdit(inv);
    if(action==="duplicate") onDuplicate(inv);
    if(action==="history")showT(`Edit history for Invoice #${inv.invoiceNumber}`);
    if(action==="debit")showT(`Debit note issued for Invoice #${inv.invoiceNumber}`);
    if(action==="delete"){setInvoices(p=>p.filter(i=>i.id!==inv.id));showT(`Invoice #${inv.invoiceNumber} deleted`);}
  };

  const dateBtnLabel=()=>dateFilter==="Custom"&&customFrom&&customTo?`${fmtShort(customFrom)} - ${fmtShort(customTo)}`:dateFilter;

  return (
    <div className="pi-page">
      <div className="pi-header">
        <h1 className="pi-title">Purchase Invoices</h1>
        <div className="pi-header-right">
          <div ref={reportsRef} style={{position:"relative"}}>
            <button className="btn-reports" onClick={()=>setShowReports(v=>!v)}><IC.Report/> Reports <IC.Chevron/></button>
            {showReports&&(<div className="pi-dd pi-reports-dd">
              <div className="pi-dd-item" onClick={()=>{ onGSTR2(); setShowReports(false); }}><IC.Report/> GSTR 2 (Purchase)</div>
              <div className="pi-dd-item" onClick={()=>{ onDaybook(); setShowReports(false); }}><IC.Note/> DayBook</div>
            </div>)}
          </div>
          <button className="btn-icon" onClick={()=>setShowSettings(true)}><IC.Settings/></button>
          <button className="btn-icon" onClick={()=>showT("View mode")}><IC.Monitor/></button>
        </div>
      </div>

      <div className="pi-cards">
        {([["all","active-total",<IC.Cart/>,"Total Purchases",totalAll,"c-blue"],["paid","active-paid",<IC.Check/>,"Paid",totalPaid,"c-green"],["unpaid","active-unpaid",<IC.Alert/>,"Unpaid",totalUnpaid,"c-red"]] as any[]).map(([key,cls,icon,lbl,val,icls])=>(
          <div key={key} className={`pi-card ${activeCard===key?cls:""}`} onClick={()=>setActiveCard(key)}>
            <div className="pi-card-label"><span className={icls}>{icon}</span>{lbl}</div>
            <div className="pi-card-amount">₹ {val.toLocaleString("en-IN")}</div>
          </div>
        ))}
      </div>

      <div className="pi-toolbar">
        <div className="pi-search-group">
          <span className="pi-search-icon"><IC.Search/></span>
          <input className="pi-search-input" placeholder="Search Purchase Invoice" value={query} onChange={e=>setQuery(e.target.value)}/>
          <div className="pi-stype-wrap" ref={stypeRef}>
            <button className="pi-stype-btn" onClick={()=>setShowSType(v=>!v)}>
              {searchType==="Invoice No. & Party name"?"Invoice No. & Party na...":"Mobile Number"}<IC.Chevron/>
            </button>
            {showSType&&(<div className="pi-dd pi-stype-dd">
              {(["Invoice No. & Party name","Mobile Number"] as SearchType[]).map(t=>(
                <div key={t} className={`pi-dd-item ${searchType===t?"sel":""}`} onClick={()=>{setSearchType(t);setShowSType(false);}}>{t}</div>
              ))}
            </div>)}
          </div>
        </div>
        <div className="pi-date-wrap" ref={dateRef}>
          <button className="pi-date-btn" onClick={()=>{setShowCalendar(false);setShowDateList(v=>!v);}}><IC.Calendar/> {dateBtnLabel()} <span className="arr">▾</span></button>
          {showDateList&&!showCalendar&&(<div className="pi-dd pi-date-list-dd">
            {DATE_OPTS.map(opt=>(
              <div key={opt} className={`pi-dd-item ${dateFilter===opt?"sel":""}`} onClick={()=>{if(opt==="Custom"){setShowCalendar(true);setShowDateList(false);}else{setDateFilter(opt);setShowDateList(false);}}}>{opt}</div>
            ))}
          </div>)}
          {showCalendar&&<CalendarPicker onApply={(f,t)=>{setCustomFrom(f);setCustomTo(t);setDateFilter("Custom");setShowCalendar(false);}} onCancel={()=>setShowCalendar(false)}/>}
        </div>
        <button className="btn-create" onClick={onCreateNew}>Create Purchase Invoice</button>
      </div>

      <div className="pi-table-wrap">
        <table>
          <thead><tr>
            <th className="sortable">Date ↕</th><th>Purchase Invoice Number</th><th>Party Name</th><th>Due In</th><th>Amount</th><th>Status</th><th style={{width:44}}></th>
          </tr></thead>
          <tbody>
            {displayed.length===0
              ?<tr><td colSpan={7}><div className="pi-empty">No purchase invoices found.</div></td></tr>
              :displayed.map(inv=>(
                <tr key={inv.id}>
                  <td>{fmtDate(new Date(inv.date))}</td>
                  <td>{inv.invoiceNumber}</td>
                  <td>{inv.partyName}</td>
                  <td>{inv.dueIn}</td>
                  <td className="td-amt">₹ {inv.amount.toLocaleString("en-IN")}{inv.status==="unpaid"&&inv.amount>0&&<div className="td-amt-sub">(₹ {inv.amount.toLocaleString("en-IN")} unpaid)</div>}</td>
                  <td>{inv.status==="paid"&&<span className="s-badge s-paid">Paid</span>}{inv.status==="unpaid"&&<span className="s-badge s-unpaid">Unpaid</span>}</td>
                  <td><button className="tdot-btn" onClick={e=>handleDot(e,inv.id)}><IC.Dots/></button></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {ctx&&(<div ref={ctxRef} className="pi-ctx" style={{top:ctx.y,left:ctx.x}}>
        <div className="pi-dd-item" onClick={()=>doCtx("edit")}><IC.Edit/>Edit</div>
        <div className="pi-dd-item" onClick={()=>doCtx("history")}><IC.History/>Edit History</div>
        <div className="pi-dd-item" onClick={()=>doCtx("duplicate")}><IC.Copy/>Duplicate</div>
        <div className="pi-dd-item" onClick={()=>doCtx("debit")}><IC.Note/>Issue Debit Note</div>
        <div className="pi-dd-divider"/>
        <div className="pi-dd-item danger" onClick={()=>doCtx("delete")}><IC.Trash/>Delete</div>
      </div>)}

      {showSettings&&(<div className="pi-overlay" onClick={()=>setShowSettings(false)}>
        <div className="pi-modal" onClick={e=>e.stopPropagation()}>
          <div className="pi-modal-head"><span className="pi-modal-title">Quick Purchase Invoice Settings</span><button className="pi-modal-close" onClick={()=>setShowSettings(false)}><IC.X/></button></div>
          {[{key:"prefixEnabled",label:"Purchase Invoice Prefix & Sequence Number",desc:"Add your custom prefix & sequence for Purchase Invoice Numbering"},{key:"showItemImage",label:"Show Item Image on Invoice",desc:"This will apply to all vouchers except for Payment In and Payment Out"},{key:"priceHistory",label:"Price History",desc:"Show last 5 sales / purchase prices of the item for the selected party in invoice",badge:true}].map(s=>(
            <div key={s.key} className="pi-s-block">
              <div className="pi-s-top"><span className="pi-s-name">{s.label}{s.badge&&<span className="badge-new">New</span>}</span><label className="toggle"><input type="checkbox" checked={(settings as any)[s.key]} onChange={e=>setSettings(p=>({...p,[s.key]:e.target.checked}))}/><span className="toggle-slider"/></label></div>
              <p className="pi-s-desc">{s.desc}</p>
              {s.key==="prefixEnabled"&&settings.prefixEnabled&&(<>
                <div className="pi-s-fields"><div><label>Prefix</label><input placeholder="Prefix" value={settings.prefix} onChange={e=>setSettings(p=>({...p,prefix:e.target.value}))}/></div><div><label>Sequence Number</label><input type="number" value={settings.sequenceNumber} onChange={e=>setSettings(p=>({...p,sequenceNumber:Number(e.target.value)}))}/></div></div>
                <p className="pi-s-note">Purchase Invoice Number: {settings.prefix}{settings.sequenceNumber}</p>
              </>)}
            </div>
          ))}
          <div className="pi-modal-foot"><button className="btn-cancel" onClick={()=>setShowSettings(false)}>Cancel</button><button className="btn-save" onClick={()=>{setShowSettings(false);showT("Settings saved");}}>Save</button></div>
        </div>
      </div>)}

      {toast&&<div className="pi-toast">{toast}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════ ROOT ══ */
export default function PurchaseModule() {
  const [page,setPage]=useState<PageMode>("list");
  const [editTarget,setEditTarget]=useState<Invoice|null>(null);
  const [invoices,setInvoices]=useState<Invoice[]>(SEED_INVOICES);
  const [allParties,setAllParties]=useState<Party[]>(ALL_PARTIES);
  const [settings,setSettings]=useState<AppSettings>({prefixEnabled:true,prefix:"",sequenceNumber:3,showItemImage:true,priceHistory:true});

  const handleSaved=(inv:Invoice, isEdit:boolean)=>{
    if(isEdit){
      setInvoices(p=>p.map(i=>i.id===inv.id?inv:i));
    } else {
      setInvoices(p=>[inv,...p]);
      setSettings(s=>({...s,sequenceNumber:s.sequenceNumber+1}));
    }
    setEditTarget(null);
    setPage("list");
  };

  const handleEdit=(inv:Invoice)=>{ setEditTarget(inv); setPage("edit"); };
  const handleDuplicate=(inv:Invoice)=>{ setEditTarget(inv); setPage("duplicate"); };

  if(page==="gstr2"){
    return <GSTR2Page invoices={invoices} onBack={()=>setPage("list")} />;
  }
  if(page==="daybook"){
    return <DaybookPage invoices={invoices} onBack={()=>setPage("list")} />;
  }
  if(page==="edit"&&editTarget){
    return <CreatePurchaseInvoicePage
      mode="edit" editData={editTarget} seqNo={settings.sequenceNumber}
      onBack={()=>{setEditTarget(null);setPage("list");}}
      onSaved={handleSaved}
      allParties={allParties} setAllParties={setAllParties} settings={settings}/>;
  }
  if(page==="duplicate"&&editTarget){
    return <CreatePurchaseInvoicePage
      mode="duplicate" editData={editTarget} seqNo={settings.sequenceNumber}
      onBack={()=>{setEditTarget(null);setPage("list");}}
      onSaved={handleSaved}
      allParties={allParties} setAllParties={setAllParties} settings={settings}/>;
  }
  if(page==="create"){
    return <CreatePurchaseInvoicePage
      mode="create" seqNo={settings.sequenceNumber}
      onBack={()=>setPage("list")}
      onSaved={handleSaved}
      allParties={allParties} setAllParties={setAllParties} settings={settings}/>;
  }
  return <PurchaseInvoicesPage
    invoices={invoices} setInvoices={setInvoices}
    settings={settings} setSettings={setSettings}
    onCreateNew={()=>setPage("create")}
    onEdit={handleEdit}
    onDuplicate={handleDuplicate}
    onGSTR2={()=>setPage("gstr2")}
    onDaybook={()=>setPage("daybook")}
  />;
}