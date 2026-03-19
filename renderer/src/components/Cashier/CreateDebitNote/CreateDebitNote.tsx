import React, { useState, useEffect, useRef, useCallback } from "react";
import "./DebitNote.css";

/* ══════════════════════════════════════════ ICONS ══ */
const IC = {
  Chevron:   (): JSX.Element => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevronL:  (): JSX.Element => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronR:  (): JSX.Element => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Settings:  (): JSX.Element => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Monitor:   (): JSX.Element => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  Search:    (): JSX.Element => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Calendar:  (): JSX.Element => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Dots:      (): JSX.Element => <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>,
  X:         (): JSX.Element => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Edit:      (): JSX.Element => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:     (): JSX.Element => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  Plus:      (): JSX.Element => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Back:      (): JSX.Element => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  Barcode:   (): JSX.Element => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M3 5v14M7 5v14M11 5v14M15 5v14M19 5v14M21 5v4M21 15v4M21 9v2"/></svg>,
  Info:      (): JSX.Element => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Gear:      (): JSX.Element => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
  ArrowUp:   (): JSX.Element => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>,
  AddCircle: (): JSX.Element => <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="12" fill="#4361ee"/><line x1="12" y1="7" x2="12" y2="17" stroke="white" strokeWidth={2.5} strokeLinecap="round"/><line x1="7" y1="12" x2="17" y2="12" stroke="white" strokeWidth={2.5} strokeLinecap="round"/></svg>,
  Bank:      (): JSX.Element => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>,
  History:   (): JSX.Element => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/><polyline points="12 7 12 12 15 15"/></svg>,
  Copy:      (): JSX.Element => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Download:  (): JSX.Element => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Print:     (): JSX.Element => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  Share:     (): JSX.Element => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  Refresh:   (): JSX.Element => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
};

/* ══════════════════════════════════════════ TYPES ══ */
type DNStatus = "credited" | "pending" | "";
type DNPage   = "list" | "create" | "view";

interface DNItem {
  id: number; name: string; hsn: string;
  qty: number; price: number; discount: number; tax: number;
}
interface DNCharge {
  id: number; label: string; amount: number; taxRate: string;
}
interface DebitNote {
  id: number; date: string; noteNumber: number; partyName: string; partyId: number;
  partyPhone: string; purchaseNo: string; amount: number; status: DNStatus;
  items: DNItem[]; charges: DNCharge[];
  discountEnabled: boolean; discountType: "%" | "₹"; discountVal: number;
  roundOff: boolean; roundOffDir: string; roundOffVal: number;
  amtReceived: number; payMethod: string; linkedInvoice: string;
}
interface DNSettings {
  prefixEnabled: boolean; prefix: string; sequenceNumber: number; showItemImage: boolean;
}
interface Party {
  id: number; name: string; phone: string; pan: string; balance: number;
}
interface CatalogItem {
  id: number; name: string; code: string; stock: string; salesPrice: number; purchasePrice: number;
}

type DateFilter =
  | "Today" | "Yesterday" | "This Week" | "Last Week" | "Last 7 Days"
  | "This Month" | "Previous Month" | "Last 30 Days" | "Last 365 Days" | "Custom";

const DATE_OPTS: DateFilter[] = [
  "Today","Yesterday","This Week","Last Week","Last 7 Days",
  "This Month","Previous Month","Last 30 Days","Last 365 Days","Custom",
];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const fmtDate  = (d: Date): string => d.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
const fmtShort = (d: Date): string => `${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)} ${d.getFullYear()}`;
const fmtMoney = (n: number): string => n===0 ? "₹0" : `₹${Math.abs(n).toLocaleString("en-IN")}`;
const fmtAmt   = (n: number): string => `₹ ${n.toLocaleString("en-IN")}`;
const todayStr = (): string => {
  const d = new Date();
  return `${d.getDate().toString().padStart(2,"0")} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]} ${d.getFullYear()}`;
};

function numToWords(n: number): string {
  if (n===0) return "Zero Rupees";
  const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  function words(num: number): string {
    if (num<20) return a[num];
    if (num<100) return b[Math.floor(num/10)]+(num%10?" "+a[num%10]:"");
    if (num<1000) return a[Math.floor(num/100)]+" Hundred"+(num%100?" "+words(num%100):"");
    if (num<100000) return words(Math.floor(num/1000))+" Thousand"+(num%1000?" "+words(num%1000):"");
    if (num<10000000) return words(Math.floor(num/100000))+" Lakh"+(num%100000?" "+words(num%100000):"");
    return words(Math.floor(num/10000000))+" Crore"+(num%10000000?" "+words(num%10000000):"");
  }
  return words(Math.floor(n))+" Rupees";
}

function getRange(f: DateFilter, from?: Date, to?: Date): [Date,Date] {
  const t=new Date(), s=new Date(t), e=new Date(t);
  switch (f) {
    case "Yesterday":      s.setDate(t.getDate()-1); e.setDate(t.getDate()-1); break;
    case "This Week":      s.setDate(t.getDate()-t.getDay()); break;
    case "Last Week":      { const d=t.getDay(); s.setDate(t.getDate()-d-7); e.setDate(t.getDate()-d-1); break; }
    case "Last 7 Days":    s.setDate(t.getDate()-6); break;
    case "This Month":     s.setDate(1); break;
    case "Previous Month": s.setMonth(t.getMonth()-1,1); e.setDate(0); break;
    case "Last 30 Days":   s.setDate(t.getDate()-29); break;
    case "Last 365 Days":  s.setFullYear(t.getFullYear()-1); break;
    case "Custom":         if (from&&to) return [from,to]; break;
  }
  s.setHours(0,0,0,0); e.setHours(23,59,59,999); return [s,e];
}

const PARTIES: Party[] = [
  {id:1,name:"Aditya",             phone:"",           pan:"",          balance:0      },
  {id:2,name:"anando",             phone:"0987643211", pan:"ljjjmkpmp", balance:-65744 },
  {id:3,name:"Cash Sale",          phone:"9555780835", pan:"",          balance:0      },
  {id:4,name:"cgfwh",              phone:"",           pan:"",          balance:0      },
  {id:5,name:"MONDIAL ELECTRONIC", phone:"",           pan:"",          balance:0      },
  {id:6,name:"Ramakant Pandit",    phone:"",           pan:"",          balance:0      },
  {id:7,name:"rniijni",            phone:"",           pan:"",          balance:-77600 },
];

const CATALOG: CatalogItem[] = [
  {id:1,name:"BILLING SOFTWARE MOBILE APP",  code:"",      stock:"",        salesPrice:256,    purchasePrice:0    },
  {id:2,name:"BILLING SOFTWARE WITH GST",    code:"",      stock:"",        salesPrice:169875, purchasePrice:0    },
  {id:3,name:"BILLING SOFTWARE WITHOUT GST", code:"",      stock:"",        salesPrice:3556,   purchasePrice:0    },
  {id:4,name:"GODREJ FRIDGE",                code:"34567", stock:"144 ACS", salesPrice:42000,  purchasePrice:0    },
  {id:5,name:"HEKER AC",                     code:"1234",  stock:"93 PCS",  salesPrice:45000,  purchasePrice:38000},
  {id:6,name:"HISENSE 32 INCH",              code:"",      stock:"38 PCS",  salesPrice:21000,  purchasePrice:18000},
  {id:7,name:"HISENSE 43INCG TV",            code:"00974", stock:"119 PCS", salesPrice:30000,  purchasePrice:0    },
];

const PURCHASE_INVOICES = ["INV-001 (Cash Sale)","INV-002 (anando)","INV-003 (MONDIAL)"];

const SEED_NOTES: DebitNote[] = [
  {
    id:1, date:"2026-03-02", noteNumber:1, partyName:"anando", partyId:2, partyPhone:"0987643211",
    purchaseNo:"1", amount:0, status:"credited", items:[], charges:[],
    discountEnabled:false, discountType:"%", discountVal:0,
    roundOff:false, roundOffDir:"+Add", roundOffVal:0,
    amtReceived:0, payMethod:"Cash", linkedInvoice:"",
  },
];

/* ══════════════════════════════════════════ CALENDAR ══ */
function CalendarPicker({ onApply, onCancel }: {
  onApply: (f: Date, t: Date) => void;
  onCancel: () => void;
}) {
  const today = new Date();
  const [vy, setVy] = useState<number>(today.getFullYear());
  const [vm, setVm] = useState<number>(today.getMonth());
  const [start, setStart] = useState<Date|null>(null);
  const [end,   setEnd]   = useState<Date|null>(null);
  const [hov,   setHov]   = useState<Date|null>(null);

  const prev = (): void => { if (vm===0){setVm(11);setVy(y=>y-1);}else setVm(m=>m-1); };
  const next = (): void => { if (vm===11){setVm(0);setVy(y=>y+1);}else setVm(m=>m+1); };

  const cells = (): (Date|null)[] => {
    const f=new Date(vy,vm,1), l=new Date(vy,vm+1,0), a:(Date|null)[]=[];
    for (let i=0;i<f.getDay();i++) a.push(null);
    for (let d=1;d<=l.getDate();d++) a.push(new Date(vy,vm,d));
    while (a.length%7!==0) a.push(null);
    return a;
  };

  const same = (a: Date, b: Date): boolean =>
    a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();

  const inR = (d: Date): boolean => {
    const e2=end||hov; if (!start||!e2) return false;
    const mn=start<e2?start:e2, mx=start<e2?e2:start;
    return d>mn && d<mx;
  };

  const pick = (d: Date): void => {
    if (!start||(start&&end)){setStart(d);setEnd(null);}
    else { if (d<start){setEnd(start);setStart(d);}else setEnd(d); }
  };

  const cs = cells();
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
        <tbody>
          {Array.from({length:cs.length/7},(_,r)=>(
            <tr key={r}>
              {cs.slice(r*7,r*7+7).map((d,i)=>{
                if (!d) return <td key={i}/>;
                const isSel   = !!(start&&same(d,start))||!!(end&&same(d,end));
                const isStart = !!(start&&same(d,start));
                const isEnd   = !!(end&&same(d,end));
                let cls = "pi-cal-day";
                if (isStart&&end) cls+=" range-start"; else if (isEnd) cls+=" range-end"; else if (isSel) cls+=" selected";
                if (!isSel&&inR(d)) cls+=" in-range";
                if (same(d,today)&&!isSel) cls+=" today";
                return (
                  <td key={i}>
                    <button className={cls} onClick={()=>pick(d)}
                      onMouseEnter={()=>setHov(d)} onMouseLeave={()=>setHov(null)}>
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
        <button className="pi-cal-ok" onClick={()=>{if (start&&end) onApply(start,end);}}>OK</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════ BILL VIEW PAGE ══ */
function BillViewPage({ record, onBack, onEdit, onDuplicate, onDelete }: {
  record: DebitNote;
  onBack: () => void;
  onEdit: (n: DebitNote) => void;
  onDuplicate: (n: DebitNote) => void;
  onDelete: (id: number) => void;
}) {
  const [showCtx, setShowCtx] = useState<boolean>(false);
  const [toast,   setToast]   = useState<string|null>(null);
  const ctxRef  = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLButtonElement>(null);

  useEffect(()=>{
    const h=(e: MouseEvent): void=>{
      if (ctxRef.current&&!ctxRef.current.contains(e.target as Node)&&
          dotsRef.current&&!dotsRef.current.contains(e.target as Node))
        setShowCtx(false);
    };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);

  const showT = (m: string): void => { setToast(m); setTimeout(()=>setToast(null),2400); };

  const subtotal      = record.items.reduce((s,i)=>s+(i.qty*i.price-i.discount),0);
  const totalTax      = record.items.reduce((s,i)=>s+(i.qty*i.price*i.tax/100),0);
  const chargesTotal  = (record.charges||[]).reduce((s,c)=>s+c.amount,0);
  const taxableAmount = subtotal+chargesTotal;
  const discountAmt   = record.discountEnabled
    ? (record.discountType==="%"?taxableAmount*record.discountVal/100:record.discountVal) : 0;
  const roundOffAmt   = record.roundOff?(record.roundOffDir==="+Add"?record.roundOffVal:-record.roundOffVal):0;
  const totalAmt      = taxableAmount-discountAmt+totalTax+roundOffAmt;

  const dateObj = new Date(record.date+"T12:00:00");
  const noteDateDisplay = `${dateObj.getDate().toString().padStart(2,"0")}/${(dateObj.getMonth()+1).toString().padStart(2,"0")}/${dateObj.getFullYear()} ${dateObj.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true}).toUpperCase()}`;

  const hoverStyle = (e: React.MouseEvent<HTMLDivElement>, hover: boolean, danger?: boolean): void => {
    (e.currentTarget as HTMLDivElement).style.background = hover?(danger?"#fff5f5":"#f5f6fa"):"transparent";
  };

  const doCtxAction = (action: string): void => {
    setShowCtx(false);
    if (action==="edit")      onEdit(record);
    if (action==="history")   showT(`Edit history for Debit Note #${record.noteNumber}`);
    if (action==="duplicate") onDuplicate(record);
    if (action==="delete")    onDelete(record.id);
  };

  return (
    <div className="bv-page">
      <div className="bv-topbar">
        <div className="bv-title-wrap">
          <button className="bv-back-btn" onClick={onBack}><IC.Back/></button>
          <span className="bv-page-title">Debit Note #{record.noteNumber}</span>
          {record.status==="credited"&&<span className="dn-status-credited">Credited</span>}
          {record.status==="pending" &&<span className="s-badge s-unpaid">Pending</span>}
        </div>
        <div className="bv-topbar-actions">
          <button className="bv-action-btn"><IC.Download/> Download PDF</button>
          <button className="bv-action-btn"><IC.Print/> Print PDF</button>
          <button className="bv-action-btn bv-icon-btn"><IC.Refresh/></button>
          <button className="bv-action-btn"><IC.Share/> Share <span style={{fontSize:11}}>▾</span></button>
          <div style={{position:"relative"}}>
            <button ref={dotsRef} className={`bv-action-btn bv-dots-btn${showCtx?" active":""}`}
              onClick={()=>setShowCtx(v=>!v)}><IC.Dots/></button>
            {showCtx&&(
              <div ref={ctxRef} className="pi-ctx bv-ctx">
                <div className="pi-dd-item" onMouseEnter={e=>hoverStyle(e,true)} onMouseLeave={e=>hoverStyle(e,false)} onClick={()=>doCtxAction("edit")}><IC.Edit/>Edit</div>
                <div className="pi-dd-divider"/>
                <div className="pi-dd-item" onMouseEnter={e=>hoverStyle(e,true)} onMouseLeave={e=>hoverStyle(e,false)} onClick={()=>doCtxAction("history")}><IC.History/>Edit History</div>
                <div className="pi-dd-divider"/>
                <div className="pi-dd-item" onMouseEnter={e=>hoverStyle(e,true)} onMouseLeave={e=>hoverStyle(e,false)} onClick={()=>doCtxAction("duplicate")}><IC.Copy/>Duplicate</div>
                <div className="pi-dd-divider"/>
                <div className="pi-dd-item danger" onMouseEnter={e=>hoverStyle(e,true,true)} onMouseLeave={e=>hoverStyle(e,false,true)} onClick={()=>doCtxAction("delete")}><IC.Trash/>Delete</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bv-body">
        <div className="bv-paper">
          <div className="bv-header">
            <div className="bv-company-block">
              <div className="bv-logo"><span>SCRATCH</span></div>
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
              <div className="bv-doc-type">DEBIT NOTE</div>
              <div className="bv-meta-row">
                <div className="bv-meta-block"><div className="bv-meta-label">Note No.</div><div className="bv-meta-value">{record.noteNumber}</div></div>
                <div className="bv-meta-block"><div className="bv-meta-label">Note Date</div><div className="bv-meta-value">{noteDateDisplay}</div></div>
              </div>
            </div>
          </div>

          <div className="bv-bill-to-row">
            <div>
              <div className="bv-section-label">BILL TO</div>
              <div className="bv-party-name">{record.partyName}</div>
              {record.partyPhone&&<div className="bv-party-detail">Mobile: {record.partyPhone}</div>}
            </div>
          </div>

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
              {record.items.length===0
                ?<tr><td colSpan={6} style={{padding:32,textAlign:"center",color:"#98a2b3",fontSize:13}}>No items</td></tr>
                :record.items.map((item,idx)=>{
                  const amt=item.qty*item.price-item.discount;
                  const taxAmt=item.qty*item.price*item.tax/100;
                  return (
                    <tr key={item.id}>
                      <td style={{textAlign:"center",color:"#667085"}}>{idx+1}</td>
                      <td>
                        <div style={{fontWeight:600,color:"#1a2332"}}>{item.name}</div>
                        {item.hsn&&<div style={{fontSize:11,color:"#98a2b3",marginTop:2}}>HSN: {item.hsn}</div>}
                      </td>
                      <td style={{textAlign:"center"}}>{item.qty} PCS</td>
                      <td style={{textAlign:"right"}}>{item.price}</td>
                      <td style={{textAlign:"center"}}>
                        <div>{item.tax>0?`₹ ${taxAmt.toLocaleString("en-IN")}`:0}</div>
                        <div style={{fontSize:11,color:"#98a2b3"}}>({item.tax}%)</div>
                      </td>
                      <td style={{textAlign:"right",fontWeight:600}}>{amt}</td>
                    </tr>
                  );
                })
              }
              {record.items.length<6&&Array.from({length:Math.max(0,4-record.items.length)}).map((_,i)=>(
                <tr key={`pad-${i}`}><td colSpan={6} style={{height:34}}/></tr>
              ))}
            </tbody>
          </table>

          <div className="bv-totals-row">
            <div className="bv-totals-label">TOTAL</div>
            <div className="bv-totals-qty">{record.items.reduce((s,i)=>s+i.qty,0)}</div>
            <div className="bv-totals-tax">{totalTax>0?`₹ ${totalTax.toLocaleString("en-IN")}`:"₹ 0"}</div>
            <div className="bv-totals-amt">₹ {totalAmt.toLocaleString("en-IN")}</div>
          </div>
          <div className="bv-received-row">
            <div className="bv-received-label">RECEIVED AMOUNT</div>
            <div className="bv-received-amt">₹ {(record.amtReceived||0).toLocaleString("en-IN")}</div>
          </div>

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
                <td style={{textAlign:"center"}}>{totalTax>0?(totalTax/2).toLocaleString("en-IN"):0}</td>
                <td style={{textAlign:"center",borderLeft:"1px solid #eaecf0"}}>0%</td>
                <td style={{textAlign:"center"}}>{totalTax>0?(totalTax/2).toLocaleString("en-IN"):0}</td>
                <td style={{textAlign:"right",fontWeight:600,borderLeft:"1px solid #eaecf0"}}>₹ {totalTax.toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>

          <div className="bv-words-row">
            <div className="bv-words-label">Total Amount (in words)</div>
            <div className="bv-words-value">{numToWords(totalAmt)}</div>
          </div>

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
        </div>
      </div>

      {toast&&<div className="pi-toast">{toast}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CREATE DEBIT NOTE PAGE
══════════════════════════════════════════════════════════ */
function CreateDebitNotePage({
  seqNo, dnSettings, setDnSettings,
  onBack, onSaved, onSavedAndNew,
  allParties, setAllParties,
}: {
  seqNo: number;
  dnSettings: DNSettings;
  setDnSettings: React.Dispatch<React.SetStateAction<DNSettings>>;
  onBack: () => void;
  onSaved: (n: DebitNote) => void;
  onSavedAndNew: (n: DebitNote) => void;
  allParties: Party[];
  setAllParties: React.Dispatch<React.SetStateAction<Party[]>>;
}) {
  const [partyState,    setPartyState]    = useState<"empty"|"searching"|"selected">("empty");
  const [partySearch,   setPartySearch]   = useState<string>("");
  const [selectedParty, setSelectedParty] = useState<Party|null>(null);
  const [items,         setItems]         = useState<DNItem[]>([]);
  const [noteNo]                          = useState<string>(String(seqNo));
  const [noteDate]                        = useState<string>(todayStr());
  const [linkedInvoice, setLinkedInvoice] = useState<string>("");
  const [invSearch,     setInvSearch]     = useState<string>("");
  const [showInvDrop,   setShowInvDrop]   = useState<boolean>(false);
  const [amtReceived,   setAmtReceived]   = useState<number>(0);
  const [payMethod,     setPayMethod]     = useState<string>("Cash");
  const [roundOff,      setRoundOff]      = useState<boolean>(false);
  const [roundOffDir,   setRoundOffDir]   = useState<string>("+Add");
  const [roundOffVal,   setRoundOffVal]   = useState<number>(0);
  const [applyTCS,      setApplyTCS]      = useState<boolean>(false);
  const [showNotes,     setShowNotes]     = useState<boolean>(false);
  const [notes,         setNotes]         = useState<string>("");
  const [showBankAccount, setShowBankAccount] = useState<boolean>(false);
  const [showCreateParty, setShowCreateParty] = useState<boolean>(false);
  const [showAddItems,    setShowAddItems]    = useState<boolean>(false);
  const [toast,           setToast]           = useState<string|null>(null);
  const [charges,         setCharges]         = useState<DNCharge[]>([]);
  const [showDiscount,    setShowDiscount]    = useState<boolean>(false);
  const [discountType,    setDiscountType]    = useState<"%"|"₹">("%");
  const [discountVal,     setDiscountVal]     = useState<number>(0);
  const [showSettings,    setShowSettings]    = useState<boolean>(false);

  const [showShipModal, setShowShipModal] = useState<boolean>(false);
  const [shipName,      setShipName]      = useState<string>("");
  const [shipPhone,     setShipPhone]     = useState<string>("");
  const [shipAddr,      setShipAddr]      = useState<string>("");
  const [shipCity,      setShipCity]      = useState<string>("");
  const [shipState,     setShipState]     = useState<string>("");
  const [shipPin,       setShipPin]       = useState<string>("");
  const [shipSaved,     setShipSaved]     = useState<boolean>(false);

  const [cpName,     setCpName]     = useState<string>("");
  const [cpPhone,    setCpPhone]    = useState<string>("");
  const [cpShowAddr, setCpShowAddr] = useState<boolean>(false);
  const [cpShowGST,  setCpShowGST]  = useState<boolean>(false);
  const [cpAddr,     setCpAddr]     = useState<string>("");
  const [cpStateF,   setCpStateF]   = useState<string>("");
  const [cpPin,      setCpPin]      = useState<string>("");
  const [cpCity,     setCpCity]     = useState<string>("");
  const [cpSameShip, setCpSameShip] = useState<boolean>(true);
  const [cpGSTIN,    setCpGSTIN]    = useState<string>("");
  const [cpErr,      setCpErr]      = useState<boolean>(false);

  const [itemSearch,  setItemSearch]  = useState<string>("");
  const [pendingQtys, setPendingQtys] = useState<Record<number,number>>({});
  const [addedIds,    setAddedIds]    = useState<number[]>([]);

  const partyRef = useRef<HTMLDivElement>(null);
  const invRef   = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const h=(e: MouseEvent): void=>{
      if (partyRef.current&&!partyRef.current.contains(e.target as Node))
        if (partyState==="searching") setPartyState(selectedParty?"selected":"empty");
      if (invRef.current&&!invRef.current.contains(e.target as Node)) setShowInvDrop(false);
    };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[partyState,selectedParty]);

  const showT = (m: string): void => { setToast(m); setTimeout(()=>setToast(null),2400); };

  const subtotal      = items.reduce((s,i)=>s+(i.qty*i.price-i.discount),0);
  const totalTax      = items.reduce((s,i)=>s+(i.qty*i.price*i.tax/100),0);
  const chargesTotal  = charges.reduce((s,c)=>s+c.amount,0);
  const taxableAmount = subtotal+chargesTotal;
  const discountAmt   = showDiscount?(discountType==="%"?taxableAmount*discountVal/100:discountVal):0;
  const roundOffAmt   = roundOff?(roundOffDir==="+Add"?roundOffVal:-roundOffVal):0;
  const totalAmt      = taxableAmount-discountAmt+totalTax+roundOffAmt;

  const selectParty = (p: Party): void => {
    setSelectedParty(p); setPartyState("selected"); setPartySearch("");
    setShipName(p.name); setShipPhone(p.phone); setShipSaved(false);
    setShipAddr(""); setShipCity(""); setShipState(""); setShipPin("");
  };

  const filtParties  = allParties.filter(p=>p.name.toLowerCase().includes(partySearch.toLowerCase()));
  const filtCatalog  = CATALOG.filter(c=>c.name.toLowerCase().includes(itemSearch.toLowerCase())||c.code.toLowerCase().includes(itemSearch.toLowerCase()));
  const filtInvoices = PURCHASE_INVOICES.filter(i=>i.toLowerCase().includes(invSearch.toLowerCase()));

  const saveParty = (): void => {
    if (!cpName.trim()){setCpErr(true);return;}
    const np: Party={id:Date.now(),name:cpName,phone:cpPhone,pan:"",balance:0};
    setAllParties(p=>[...p,np]); selectParty(np); setShowCreateParty(false);
    setCpName(""); setCpPhone(""); setCpShowAddr(false); setCpShowGST(false); setCpErr(false);
    showT(`Party "${cpName}" created`);
  };

  const openAddItems = (): void => {
    const init: Record<number,number>={};
    items.forEach(i=>{init[i.id]=i.qty;});
    setPendingQtys(init); setAddedIds(items.map(i=>i.id)); setShowAddItems(true);
  };

  const toggleItem = (cat: CatalogItem): void => {
    if (addedIds.includes(cat.id)){
      setAddedIds(p=>p.filter(x=>x!==cat.id));
      setPendingQtys(p=>{const n={...p};delete n[cat.id];return n;});
    } else {
      setAddedIds(p=>[...p,cat.id]);
      setPendingQtys(p=>({...p,[cat.id]:1}));
    }
  };

  const setPendingQty = (id: number, v: number): void => setPendingQtys(p=>({...p,[id]:Math.max(1,v)}));

  const addToBill = (): void => {
    const newItems: DNItem[]=addedIds.map(id=>{
      const ex=items.find(i=>i.id===id);
      const cat=CATALOG.find(c=>c.id===id)!;
      return ex
        ?{...ex,qty:pendingQtys[id]??ex.qty}
        :{id:cat.id,name:cat.name,hsn:"",qty:pendingQtys[id]??1,price:cat.purchasePrice||cat.salesPrice,discount:0,tax:0};
    });
    setItems(newItems); setShowAddItems(false); setItemSearch("");
  };

  const removeItem   = (id: number): void => setItems(p=>p.filter(i=>i.id!==id));
  const updItem      = (id: number, f: keyof DNItem, v: string): void =>
    setItems(p=>p.map(i=>i.id===id?{...i,[f]:isNaN(Number(v))?v:Number(v)}:i));
  const addCharge    = (): void => setCharges(p=>[...p,{id:Date.now(),label:"",amount:0,taxRate:"No Tax Applicable"}]);
  const updCharge    = (id: number, f: keyof DNCharge, v: string|number): void =>
    setCharges(p=>p.map(c=>c.id===id?{...c,[f]:v}:c));
  const removeCharge = (id: number): void => setCharges(p=>p.filter(c=>c.id!==id));

  const buildNote = (): DebitNote => ({
    id:Date.now(), date:new Date().toISOString().slice(0,10),
    noteNumber:Number(noteNo),
    partyName:selectedParty!.name, partyId:selectedParty!.id, partyPhone:selectedParty!.phone,
    purchaseNo:linkedInvoice||"-", amount:totalAmt,
    status:totalAmt>0&&amtReceived>=totalAmt?"credited":totalAmt>0?"pending":"credited",
    items, charges, discountEnabled:showDiscount, discountType, discountVal,
    roundOff, roundOffDir, roundOffVal, amtReceived, payMethod, linkedInvoice,
  });

  const handleSave       = (): void => { if (!selectedParty){showT("Please select a party first");return;} onSaved(buildNote()); };
  const handleSaveAndNew = (): void => { if (!selectedParty){showT("Please select a party first");return;} onSavedAndNew(buildNote()); };

  return (
    <div className="cpi-page">
      <div className="cpi-topbar">
        <div className="cpi-title-wrap">
          <button className="cpi-back-btn" onClick={onBack}><IC.Back/></button>
          <span className="cpi-page-title">Create Debit Note</span>
        </div>
        <div className="cpi-topbar-right">
          <button className="btn-topbar-settings" onClick={()=>setShowSettings(true)}><IC.Settings/> Settings</button>
          <button className="btn-save-new" onClick={handleSaveAndNew}>Save &amp; New</button>
          <button className="btn-save-top" onClick={handleSave}>Save</button>
        </div>
      </div>

      <div className="cpi-body">
        <div className="cpi-top-card">
          <div className="cpi-bill-panel">
            {partyState==="empty"&&(
              <div ref={partyRef} className="party-add-box" onClick={()=>setPartyState("searching")}>
                <div className="party-add-inner"><IC.Plus/>  Add Party</div>
              </div>
            )}
            {partyState==="searching"&&(
              <div ref={partyRef} className="party-search-wrap">
                <input className="party-search-input" placeholder="Search party by name or number"
                  value={partySearch} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setPartySearch(e.target.value)} autoFocus/>
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
                  <div className="party-info-pane-header">
                    <span className="pane-label">Bill From</span>
                    <button className="btn-change" onClick={()=>setPartyState("searching")}>Change Party</button>
                  </div>
                  <div className="party-info-name">{selectedParty.name}</div>
                  {selectedParty.phone&&<div className="party-info-line">Phone Number: {selectedParty.phone}</div>}
                  {selectedParty.pan&&<div className="party-info-line">PAN Number: {selectedParty.pan}</div>}
                </div>
                <div className="party-info-pane">
                  <div className="party-info-pane-header">
                    <span className="pane-label">Ship From</span>
                    <button className="btn-change" onClick={()=>setShowShipModal(true)}>Change Address</button>
                  </div>
                  <div className="party-info-name">{shipSaved?shipName:selectedParty.name}</div>
                  {(shipSaved?shipPhone:selectedParty.phone)&&<div className="party-info-line">Phone Number: {shipSaved?shipPhone:selectedParty.phone}</div>}
                  {shipSaved&&shipAddr&&<div className="party-info-line">{shipAddr}{shipCity?`, ${shipCity}`:""}{shipState?`, ${shipState}`:""}{shipPin?` - ${shipPin}`:""}</div>}
                  {!shipSaved&&<div className="party-info-line ship-same-tag">Same as Bill From</div>}
                </div>
              </div>
            )}
          </div>

          <div className="cpi-invoice-fields">
            <div className="inv-fields-top-row">
              <div className="inv-field-group" style={{flex:"0 0 90px"}}>
                <label>Debit Note No:</label>
                <input value={noteNo} readOnly/>
              </div>
              <div className="inv-field-group" style={{flex:1}}>
                <label>Debit Note Date:</label>
                <div className="date-field-wrap">
                  <span className="cal-icon"><IC.Calendar/></span>
                  <span className="date-val">{noteDate}</span>
                  <span className="caret">▾</span>
                </div>
              </div>
            </div>
            <div className="pr-link-section" ref={invRef}>
              <div className="pr-link-label">Link to Purchase Invoice</div>
              <div className="pr-link-search" onClick={()=>setShowInvDrop(true)}>
                <span className="pr-link-icon"><IC.Search/></span>
                <input className="pr-link-input" placeholder="Search purchase invoices"
                  value={linkedInvoice||invSearch}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{setInvSearch(e.target.value);setLinkedInvoice("");setShowInvDrop(true);}}/>
              </div>
              {showInvDrop&&(
                <div className="pr-inv-dropdown">
                  {filtInvoices.length>0
                    ?filtInvoices.map((inv,i)=>(
                        <div key={i} className="pr-inv-item" onClick={()=>{setLinkedInvoice(inv);setInvSearch("");setShowInvDrop(false);}}>{inv}</div>
                      ))
                    :<div style={{padding:"10px 14px",color:"#98a2b3",fontSize:12}}>No invoices found</div>
                  }
                </div>
              )}
            </div>
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
              {items.map((item,idx)=>(
                <tr key={item.id}>
                  <td style={{color:"#667085",textAlign:"center"}}>{idx+1}</td>
                  <td>
                    <div style={{fontWeight:600,color:"#1a2332"}}>{item.name}</div>
                    <input className="item-desc-input" placeholder="Enter Description (optional)"/>
                  </td>
                  <td><input className="qty-input" style={{width:92}} value={item.hsn} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>updItem(item.id,"hsn",e.target.value)}/></td>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:3}}>
                      <input className="qty-input" type="number" value={item.qty} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>updItem(item.id,"qty",e.target.value)}/>
                      <span style={{fontSize:10,color:"#98a2b3",whiteSpace:"nowrap"}}>PCS</span>
                    </div>
                  </td>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:3}}>
                      <span style={{fontSize:11,color:"#98a2b3"}}>₹</span>
                      <input className="qty-input" style={{flex:1}} type="number" value={item.price} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>updItem(item.id,"price",e.target.value)}/>
                    </div>
                  </td>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:3}}>
                      <span style={{fontSize:11,color:"#98a2b3"}}>₹</span>
                      <input className="qty-input" style={{flex:1}} type="number" value={item.discount} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>updItem(item.id,"discount",e.target.value)}/>
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
            <div className="scan-barcode-area" onClick={openAddItems}><IC.Barcode/> Scan Barcode</div>
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
              :<textarea value={notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)=>setNotes(e.target.value)} placeholder="Add notes..."
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
            {!showBankAccount
              ?<button className="btn-add-bank" onClick={()=>setShowBankAccount(true)}><IC.Bank/> + Add Bank Account</button>
              :<div className="bank-account-box">
                  <div className="bank-account-header">
                    <span className="bank-account-label">Bank Account</span>
                    <button className="btn-remove-section" onClick={()=>setShowBankAccount(false)}>Remove</button>
                  </div>
                  <div className="form-group" style={{marginBottom:8}}><label>Bank Name</label><input placeholder="Enter bank name"/></div>
                  <div className="form-row">
                    <div className="form-group"><label>Account Number</label><input placeholder="Enter account number"/></div>
                    <div className="form-group"><label>IFSC Code</label><input placeholder="Enter IFSC code"/></div>
                  </div>
                </div>
            }
          </div>

          <div className="summary-panel">
            {charges.map(c=>(
              <div key={c.id} className="charge-row">
                <input className="charge-label-input" placeholder="Enter charge (ex. Transport Charge)"
                  value={c.label} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>updCharge(c.id,"label",e.target.value)}/>
                <div className="charge-right">
                  <div className="charge-amount-wrap">
                    <span className="charge-rupee">₹</span>
                    <input type="number" className="charge-amt-input" value={c.amount===0?"":c.amount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>)=>updCharge(c.id,"amount",Number(e.target.value))} placeholder="0"/>
                  </div>
                  <select className="charge-tax-select" value={c.taxRate}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>updCharge(c.id,"taxRate",e.target.value)}>
                    <option>No Tax Applicable</option><option>5%</option><option>12%</option><option>18%</option><option>28%</option>
                  </select>
                  <button className="charge-remove-btn" onClick={()=>removeCharge(c.id)}><IC.X/></button>
                </div>
              </div>
            ))}
            <button className="btn-add-charge-link" onClick={addCharge}>
              {charges.length===0?"+ Add Additional Charges":"+ Add Another Charge"}
            </button>
            <div className="summary-line">
              <span className="summary-line-label">Taxable Amount</span>
              <span className="summary-line-value">{fmtAmt(taxableAmount)}</span>
            </div>
            {!showDiscount
              ?<button className="btn-add-discount-link" onClick={()=>setShowDiscount(true)}>+ Add Discount</button>
              :<div className="discount-row">
                  <span className="discount-label">Discount</span>
                  <div className="discount-controls">
                    <div className="discount-type-toggle">
                      <button className={discountType==="%"?"active":""} onClick={()=>setDiscountType("%")}>%</button>
                      <button className={discountType==="₹"?"active":""} onClick={()=>setDiscountType("₹")}>₹</button>
                    </div>
                    <input type="number" className="discount-input" value={discountVal===0?"":discountVal}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setDiscountVal(Number(e.target.value))} placeholder="0"/>
                    <button className="discount-remove" onClick={()=>{setShowDiscount(false);setDiscountVal(0);}}><IC.X/></button>
                  </div>
                  <span className="summary-line-value">- {fmtAmt(discountAmt)}</span>
                </div>
            }
            <div className="tcs-row">
              <label className="tcs-label">
                <input type="checkbox" checked={applyTCS} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setApplyTCS(e.target.checked)} style={{marginRight:6}}/>
                Apply TCS
              </label>
            </div>
            <div className="round-off-row">
              <label className="round-label">
                <input type="checkbox" checked={roundOff} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setRoundOff(e.target.checked)} style={{marginRight:6}}/>
                Auto Round Off
              </label>
              {roundOff&&(
                <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:"auto"}}>
                  <select className="charge-tax-select" value={roundOffDir}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>setRoundOffDir(e.target.value)} style={{width:80}}>
                    <option>+Add</option><option>-Reduce</option>
                  </select>
                  <span style={{fontSize:12,color:"#667085"}}>₹</span>
                  <input type="number" className="charge-amt-input" value={roundOffVal===0?"":roundOffVal}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setRoundOffVal(Number(e.target.value))} placeholder="0" style={{width:64}}/>
                </div>
              )}
            </div>
            <div className="summary-line total-line">
              <span className="summary-line-label" style={{fontWeight:700,fontSize:15,color:"#1d2939"}}>Total Amount</span>
              <span className="summary-line-value" style={{fontWeight:800,fontSize:16,color:"#1d2939"}}>{fmtAmt(totalAmt)}</span>
            </div>
            <div className="enter-payment-row">
              <button className="btn-enter-payment" style={{background:"#f2f4f7",color:"#98a2b3",cursor:"default",border:"none"}}>
                Enter Payment amount
              </button>
            </div>
            <div className="authorized-row">Authorized signatory for <strong>scratchweb.solutions</strong></div>
            <div className="sig-box"/>
          </div>
        </div>
      </div>

      {/* Create Party Modal */}
      {showCreateParty&&(
        <div className="modal-overlay" onClick={()=>setShowCreateParty(false)}>
          <div className="modal create-party-modal" onClick={(e: React.MouseEvent)=>e.stopPropagation()}>
            <div className="modal-head"><span className="modal-title">Create New Party</span><button className="modal-close" onClick={()=>setShowCreateParty(false)}><IC.X/></button></div>
            <div className="modal-body">
              <div className="form-group">
                <label>Party Name <span className="req">*</span></label>
                <input placeholder="Enter name" value={cpName} className={cpErr?"error":""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{setCpName(e.target.value);setCpErr(false);}}/>
                {cpErr&&<div className="error-msg">This field is mandatory</div>}
              </div>
              <div className="form-group"><label>Mobile Number</label><input placeholder="Enter Mobile Number" value={cpPhone} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setCpPhone(e.target.value)}/></div>
              {!cpShowAddr
                ?<button className="btn-optional" onClick={()=>setCpShowAddr(true)}><IC.Plus/> + Add Address (Optional)</button>
                :<div className="optional-section">
                  <div className="optional-section-header"><span className="optional-section-label">Address (Optional)</span><button className="btn-remove-section" onClick={()=>setCpShowAddr(false)}>Remove</button></div>
                  <div className="form-group"><label>BILLING ADDRESS</label><textarea placeholder="Enter billing address" value={cpAddr} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)=>setCpAddr(e.target.value)}/></div>
                  <div className="form-row">
                    <div className="form-group"><label>STATE</label><input placeholder="Enter State" value={cpStateF} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setCpStateF(e.target.value)}/></div>
                    <div className="form-group"><label>PINCODE</label><input placeholder="Enter Pincode" value={cpPin} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setCpPin(e.target.value)}/></div>
                  </div>
                  <div className="form-group"><label>CITY</label><input placeholder="Enter City" value={cpCity} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setCpCity(e.target.value)}/></div>
                  <label className="ship-checkbox"><input type="checkbox" checked={cpSameShip} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setCpSameShip(e.target.checked)}/>Shipping address same as billing address</label>
                </div>
              }
              {!cpShowGST
                ?<button className="btn-optional" onClick={()=>setCpShowGST(true)}><IC.Plus/> + Add GSTIN (Optional)</button>
                :<div className="optional-section">
                  <div className="optional-section-header"><span className="optional-section-label">GSTIN (Optional)</span><button className="btn-remove-section" onClick={()=>setCpShowGST(false)}>Remove</button></div>
                  <div className="form-group"><label>GSTIN</label><input placeholder="ex: 29XXXXX9438X1XX" value={cpGSTIN} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setCpGSTIN(e.target.value)}/></div>
                </div>
              }
              <div className="custom-fields-note">You can add Custom Fields from <a href="#" onClick={(e: React.MouseEvent)=>e.preventDefault()}>Party Settings</a>.</div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={()=>setShowCreateParty(false)}>Cancel</button>
              <button className="modal-btn-save" onClick={saveParty} disabled={!cpName.trim()}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Modal */}
      {showShipModal&&(
        <div className="modal-overlay" onClick={()=>setShowShipModal(false)}>
          <div className="modal" style={{maxWidth:480}} onClick={(e: React.MouseEvent)=>e.stopPropagation()}>
            <div className="modal-head"><span className="modal-title">Change Shipping Address</span><button className="modal-close" onClick={()=>setShowShipModal(false)}><IC.X/></button></div>
            <div className="modal-body">
              <div className="form-group"><label>Name</label><input placeholder="Shipping name" value={shipName} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setShipName(e.target.value)}/></div>
              <div className="form-group"><label>Phone</label><input placeholder="Phone number" value={shipPhone} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setShipPhone(e.target.value)}/></div>
              <div className="form-group"><label>Address</label><textarea placeholder="Shipping address" value={shipAddr} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)=>setShipAddr(e.target.value)} rows={2}/></div>
              <div className="form-row">
                <div className="form-group"><label>City</label><input placeholder="City" value={shipCity} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setShipCity(e.target.value)}/></div>
                <div className="form-group"><label>State</label><input placeholder="State" value={shipState} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setShipState(e.target.value)}/></div>
              </div>
              <div className="form-group"><label>Pincode</label><input placeholder="Pincode" value={shipPin} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setShipPin(e.target.value)}/></div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={()=>{setShipName(selectedParty?.name||"");setShipPhone(selectedParty?.phone||"");setShipAddr("");setShipCity("");setShipState("");setShipPin("");setShipSaved(false);setShowShipModal(false);}}>Reset to Bill From</button>
              <button className="modal-btn-save" onClick={()=>{setShipSaved(true);setShowShipModal(false);}}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Items Modal */}
      {showAddItems&&(
        <div className="modal-overlay" onClick={()=>{setShowAddItems(false);setItemSearch("");}}>
          <div className="aim-modal" onClick={(e: React.MouseEvent)=>e.stopPropagation()}>
            <div className="aim-header"><span className="aim-title">Add Items to Bill</span><button className="aim-close" onClick={()=>{setShowAddItems(false);setItemSearch("");}}><IC.X/></button></div>
            <div className="aim-search-row">
              <div className="aim-search-box">
                <span className="aim-search-icon"><IC.Search/></span>
                <input className="aim-search-input" placeholder="Search by Item / HSN code / SKU"
                  value={itemSearch} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setItemSearch(e.target.value)} autoFocus/>
                <button className="aim-barcode-btn"><IC.Barcode/></button>
              </div>
              <div className="aim-cat-wrap"><select className="aim-cat-select"><option>Select Category</option><option>Electronics</option><option>Software</option></select></div>
              <button className="aim-create-btn" onClick={()=>showT("Create new item")}>Create New Item</button>
            </div>
            <div className="aim-table-wrap">
              <table className="aim-table">
                <thead><tr>
                  <th>Item Name</th><th style={{width:100}}>Item Code</th><th style={{width:90}}>Stock</th>
                  <th style={{width:110}}>Sales Price</th><th style={{width:120}}>Purchase Price</th><th style={{width:110,textAlign:"center"}}>Quantity</th>
                </tr></thead>
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
                                <input className="aim-qty-input" type="number" value={qty} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setPendingQty(c.id,Number(e.target.value))}/>
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

      {/* Settings Modal */}
      {showSettings&&(
        <div className="pi-overlay" onClick={()=>setShowSettings(false)}>
          <div className="pi-modal dn-settings-modal" onClick={(e: React.MouseEvent)=>e.stopPropagation()}>
            <div className="pi-modal-head">
              <span className="pi-modal-title">Quick Debit Note Settings</span>
              <button className="pi-modal-close" onClick={()=>setShowSettings(false)}><IC.X/></button>
            </div>
            <div className="pi-s-block">
              <div className="pi-s-top">
                <div>
                  <span className="pi-s-name">Debit Note Prefix &amp; Sequence Number</span>
                  <p className="pi-s-desc">Add your custom prefix &amp; sequence for Debit Note Numbering</p>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={dnSettings.prefixEnabled} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setDnSettings(p=>({...p,prefixEnabled:e.target.checked}))}/>
                  <span className="toggle-slider"/>
                </label>
              </div>
              {dnSettings.prefixEnabled&&(
                <>
                  <div className="pi-s-fields">
                    <div><label>Prefix</label><input placeholder="Prefix" value={dnSettings.prefix} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setDnSettings(p=>({...p,prefix:e.target.value}))}/></div>
                    <div><label>Sequence Number</label><input type="number" value={dnSettings.sequenceNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setDnSettings(p=>({...p,sequenceNumber:Number(e.target.value)}))}/></div>
                  </div>
                  <p className="pi-s-note">Debit Note Number: {dnSettings.prefix}{dnSettings.sequenceNumber}</p>
                </>
              )}
            </div>
            <div className="pi-s-block">
              <div className="pi-s-top">
                <div>
                  <span className="pi-s-name">Show Item Image on Invoice</span>
                  <p className="pi-s-desc">This will apply to all vouchers except for Payment In and Payment Out</p>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={dnSettings.showItemImage} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setDnSettings(p=>({...p,showItemImage:e.target.checked}))}/>
                  <span className="toggle-slider"/>
                </label>
              </div>
            </div>
            <div className="pi-modal-foot">
              <button className="btn-cancel" onClick={()=>setShowSettings(false)}>Cancel</button>
              <button className="btn-save" onClick={()=>{setShowSettings(false);showT("Settings saved");}}>Save</button>
            </div>
          </div>
        </div>
      )}

      {toast&&<div className="pi-toast">{toast}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DEBIT NOTE LIST PAGE
══════════════════════════════════════════════════════════ */
function DebitNoteListPage({ notes, setNotes, onCreateNew, onView, dnSettings, setDnSettings }: {
  notes: DebitNote[];
  setNotes: React.Dispatch<React.SetStateAction<DebitNote[]>>;
  onCreateNew: () => void;
  onView: (n: DebitNote) => void;
  dnSettings: DNSettings;
  setDnSettings: React.Dispatch<React.SetStateAction<DNSettings>>;
}) {
  const [dateFilter,   setDateFilter]   = useState<DateFilter>("Last 365 Days");
  const [customFrom,   setCustomFrom]   = useState<Date|null>(null);
  const [customTo,     setCustomTo]     = useState<Date|null>(null);
  const [showDateList, setShowDateList] = useState<boolean>(false);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [query,        setQuery]        = useState<string>("");
  const [showSearch,   setShowSearch]   = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [ctx,          setCtx]          = useState<{id:number;x:number;y:number}|null>(null);
  const [toast,        setToast]        = useState<string|null>(null);

  const dateRef   = useRef<HTMLDivElement>(null);
  const ctxRef    = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const h=(e: MouseEvent): void=>{
      if (dateRef.current&&!dateRef.current.contains(e.target as Node)){setShowDateList(false);setShowCalendar(false);}
      if (ctxRef.current&&!ctxRef.current.contains(e.target as Node)) setCtx(null);
      if (searchRef.current&&!searchRef.current.contains(e.target as Node)) setShowSearch(false);
    };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);

  const showT = (m: string): void => { setToast(m); setTimeout(()=>setToast(null),2400); };

  const displayed = useCallback((): DebitNote[] => {
    const [from,to]=getRange(dateFilter,customFrom||undefined,customTo||undefined);
    return notes.filter(n=>{
      const d=new Date(n.date); d.setHours(12);
      if (d<from||d>to) return false;
      if (query.trim()){const q=query.toLowerCase();return n.partyName.toLowerCase().includes(q)||n.noteNumber.toString().includes(q);}
      return true;
    });
  },[notes,dateFilter,customFrom,customTo,query])();

  const handleDot = (e: React.MouseEvent<HTMLButtonElement>, id: number): void => {
    e.stopPropagation();
    const r=(e.currentTarget as HTMLElement).getBoundingClientRect();
    setCtx({id,x:r.right-145,y:r.bottom+5});
  };

  const doCtx = (action: string): void => {
    const n=notes.find(i=>i.id===ctx?.id); setCtx(null); if (!n) return;
    if (action==="edit")   showT(`Editing Debit Note #${n.noteNumber}`);
    if (action==="delete") {setNotes(p=>p.filter(i=>i.id!==n.id));showT(`Debit Note #${n.noteNumber} deleted`);}
  };

  const dateBtnLabel = (): string =>
    dateFilter==="Custom"&&customFrom&&customTo
      ?`${fmtShort(customFrom)} - ${fmtShort(customTo)}`
      :dateFilter;

  return (
    <div className="dn-list-page">
      <div className="dn-list-header">
        <h1 className="pi-title">Debit Note</h1>
        <div className="dn-list-header-right">
          <button className="btn-icon" onClick={()=>setShowSettings(true)}><IC.Settings/></button>
          <button className="btn-icon" onClick={()=>showT("View mode")}><IC.Monitor/></button>
        </div>
      </div>

      <div className="dn-toolbar">
        <div ref={searchRef} style={{position:"relative"}}>
          <button className="pr-search-icon-btn" onClick={()=>setShowSearch(v=>!v)}><IC.Search/></button>
          {showSearch&&(
            <div className="pr-search-popup">
              <span className="pi-search-icon"><IC.Search/></span>
              <input className="pi-search-input" placeholder="Search by party name or debit note number"
                value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setQuery(e.target.value)} autoFocus style={{width:260}}/>
            </div>
          )}
        </div>
        <div className="pi-date-wrap" ref={dateRef}>
          <button className="pi-date-btn pr-date-btn" onClick={()=>{setShowCalendar(false);setShowDateList(v=>!v);}}>
            <IC.Calendar/> {dateBtnLabel()} <span className="arr">▾</span>
          </button>
          {showDateList&&!showCalendar&&(
            <div className="pi-dd pi-date-list-dd">
              {DATE_OPTS.map(opt=>(
                <div key={opt} className={`pi-dd-item ${dateFilter===opt?"sel":""}`}
                  onClick={()=>{if(opt==="Custom"){setShowCalendar(true);setShowDateList(false);}else{setDateFilter(opt);setShowDateList(false);}}}>
                  {opt}
                </div>
              ))}
            </div>
          )}
          {showCalendar&&(
            <CalendarPicker
              onApply={(f: Date,t: Date)=>{setCustomFrom(f);setCustomTo(t);setDateFilter("Custom");setShowCalendar(false);}}
              onCancel={()=>setShowCalendar(false)}/>
          )}
        </div>
        <button className="btn-create-dn" onClick={onCreateNew}>Create Debit Note</button>
      </div>

      <div className="dn-table-wrap">
        <table>
          <thead><tr>
            <th className="sortable">Date ↕</th>
            <th>Debit Note Number</th>
            <th>Party Name</th>
            <th>Purchase No</th>
            <th>Amount</th>
            <th>Status</th>
            <th style={{width:44}}></th>
          </tr></thead>
          <tbody>
            {displayed.length===0
              ?<tr><td colSpan={7}><div className="pi-empty">No debit notes found.</div></td></tr>
              :displayed.map(n=>(
                <tr key={n.id} onClick={()=>onView(n)} style={{cursor:"pointer"}}>
                  <td>{fmtDate(new Date(n.date))}</td>
                  <td>{n.noteNumber}</td>
                  <td>{n.partyName}</td>
                  <td>{n.purchaseNo}</td>
                  <td className="td-amt">₹ {n.amount.toLocaleString("en-IN")}</td>
                  <td>
                    {n.status==="credited"&&<span className="dn-status-credited">Credited</span>}
                    {n.status==="pending" &&<span className="s-badge s-unpaid">Pending</span>}
                  </td>
                  <td>
                    <button className="tdot-btn" onClick={(e: React.MouseEvent<HTMLButtonElement>)=>handleDot(e,n.id)}><IC.Dots/></button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {ctx&&(
        <div ref={ctxRef} className="pi-ctx" style={{top:ctx.y,left:ctx.x}}>
          <div className="pi-dd-item" onClick={()=>doCtx("edit")}><IC.Edit/>Edit</div>
          <div className="pi-dd-divider"/>
          <div className="pi-dd-item danger" onClick={()=>doCtx("delete")}><IC.Trash/>Delete</div>
        </div>
      )}

      {showSettings&&(
        <div className="pi-overlay" onClick={()=>setShowSettings(false)}>
          <div className="pi-modal dn-settings-modal" onClick={(e: React.MouseEvent)=>e.stopPropagation()}>
            <div className="pi-modal-head">
              <span className="pi-modal-title">Quick Debit Note Settings</span>
              <button className="pi-modal-close" onClick={()=>setShowSettings(false)}><IC.X/></button>
            </div>
            <div className="pi-s-block">
              <div className="pi-s-top">
                <div>
                  <span className="pi-s-name">Debit Note Prefix &amp; Sequence Number</span>
                  <p className="pi-s-desc">Add your custom prefix &amp; sequence for Debit Note Numbering</p>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={dnSettings.prefixEnabled} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setDnSettings(p=>({...p,prefixEnabled:e.target.checked}))}/>
                  <span className="toggle-slider"/>
                </label>
              </div>
              {dnSettings.prefixEnabled&&(
                <>
                  <div className="pi-s-fields">
                    <div><label>Prefix</label><input placeholder="Prefix" value={dnSettings.prefix} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setDnSettings(p=>({...p,prefix:e.target.value}))}/></div>
                    <div><label>Sequence Number</label><input type="number" value={dnSettings.sequenceNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setDnSettings(p=>({...p,sequenceNumber:Number(e.target.value)}))}/></div>
                  </div>
                  <p className="pi-s-note">Debit Note Number: {dnSettings.prefix}{dnSettings.sequenceNumber}</p>
                </>
              )}
            </div>
            <div className="pi-s-block">
              <div className="pi-s-top">
                <div>
                  <span className="pi-s-name">Show Item Image on Invoice</span>
                  <p className="pi-s-desc">This will apply to all vouchers except for Payment In and Payment Out</p>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={dnSettings.showItemImage} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setDnSettings(p=>({...p,showItemImage:e.target.checked}))}/>
                  <span className="toggle-slider"/>
                </label>
              </div>
            </div>
            <div className="pi-modal-foot">
              <button className="btn-cancel" onClick={()=>setShowSettings(false)}>Cancel</button>
              <button className="btn-save" onClick={()=>{setShowSettings(false);showT("Settings saved");}}>Save</button>
            </div>
          </div>
        </div>
      )}

      {toast&&<div className="pi-toast">{toast}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════ ROOT ══ */
export default function DebitNoteModule() {
  const [page,         setPage]         = useState<DNPage>("list");
  const [notes,        setNotes]        = useState<DebitNote[]>(SEED_NOTES);
  const [allParties,   setAllParties]   = useState<Party[]>(PARTIES);
  const [activeRecord, setActiveRecord] = useState<DebitNote|null>(null);

  const [dnSettings, setDnSettings] = useState<DNSettings>({
    prefixEnabled:true, prefix:"", sequenceNumber:2, showItemImage:true,
  });

  const [formKey, setFormKey] = useState<number>(0);

  const handleSaved = (n: DebitNote): void => {
    setNotes(p=>[n,...p]);
    setDnSettings(s=>({...s,sequenceNumber:s.sequenceNumber+1}));
    setPage("list");
  };

  const handleSavedAndNew = (n: DebitNote): void => {
    setNotes(p=>[n,...p]);
    setDnSettings(s=>({...s,sequenceNumber:s.sequenceNumber+1}));
    setFormKey(k=>k+1);
  };

  const handleView = (n: DebitNote): void => { setActiveRecord(n); setPage("view"); };

  const handleDeleteFromView = (id: number): void => {
    setNotes(p=>p.filter(x=>x.id!==id));
    setPage("list");
  };

  if (page==="view"&&activeRecord)
    return (
      <BillViewPage
        record={activeRecord}
        onBack={()=>setPage("list")}
        onEdit={()=>setPage("list")}
        onDuplicate={()=>setPage("list")}
        onDelete={handleDeleteFromView}
      />
    );

  if (page==="create")
    return (
      <CreateDebitNotePage
        key={`create-${formKey}`}
        seqNo={dnSettings.sequenceNumber}
        dnSettings={dnSettings}
        setDnSettings={setDnSettings}
        onBack={()=>setPage("list")}
        onSaved={handleSaved}
        onSavedAndNew={handleSavedAndNew}
        allParties={allParties}
        setAllParties={setAllParties}
      />
    );

  return (
    <DebitNoteListPage
      notes={notes}
      setNotes={setNotes}
      onCreateNew={()=>setPage("create")}
      onView={handleView}
      dnSettings={dnSettings}
      setDnSettings={setDnSettings}
    />
  );
}