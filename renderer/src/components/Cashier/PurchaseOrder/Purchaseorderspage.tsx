import React, { useState, useRef, useEffect, useCallback } from "react";
import "./Purchaseorderspage.css";
import api from "@/lib/axios";
import { getAllParties } from "@/services/partyService";
import { useNavigate } from "react-router-dom";

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
  History:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>,
  Copy:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Trash:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  Plus:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Back:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  Barcode:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M3 5v14M7 5v14M11 5v14M15 5v14M19 5v14M21 5v4M21 15v4M21 9v2"/></svg>,
  Info:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Gear:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
  ArrowUp:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>,
  AddCircle:()=><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="12" fill="#4361ee"/><line x1="12" y1="7" x2="12" y2="17" stroke="white" strokeWidth={2.5} strokeLinecap="round"/><line x1="7" y1="12" x2="17" y2="12" stroke="white" strokeWidth={2.5} strokeLinecap="round"/></svg>,
  Grid:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  Download: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Print:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  Share:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  Refresh:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
};

/* ══════════════════════════════════════════ TYPES ══ */
type POStatus = "Open" | "Closed" | "Cancelled";
type POPage   = "list" | "create" | "edit" | "duplicate" | "create-party" | "view";
type DateFilter = "Today"|"Yesterday"|"This Week"|"Last Week"|"Last 7 Days"|"This Month"|"Previous Month"|"Last 30 Days"|"This Quarter"|"Previous Quarter"|"Current Fiscal Year"|"Previous Fiscal Year"|"Last 365 Days"|"Custom";
type StatusFilter = "Show All Orders"|"Show Open Orders"|"Show Closed Orders";

interface POItem { id:number; name:string; hsn:string; qty:number; price:number; discount:number; tax:number; }
interface POCharge { id:number; label:string; amount:number; taxRate:string; }
interface PurchaseOrder {
  id:number; date:string; poNumber:number; partyName:string; partyId:number;
  partyPhone:string; validTill:string; amount:number; status:POStatus;
  items:POItem[]; charges:POCharge[];
  discountEnabled:boolean; discountType:"%"|"₹"; discountVal:number;
  roundOff:boolean; roundOffDir:string; roundOffVal:number;
}
interface POSettings { prefixEnabled:boolean; prefix:string; sequenceNumber:number; showItemImage:boolean; priceHistory:boolean; }
interface Party { id:number; name:string; phone:string; pan:string; balance:number; }
interface CatalogItem { id:number; name:string; code:string; stock:string; salesPrice:number; purchasePrice:number; }

const DATE_OPTS:DateFilter[] = ["Today","Yesterday","This Week","Last Week","Last 7 Days","This Month","Previous Month","Last 30 Days","This Quarter","Previous Quarter","Current Fiscal Year","Previous Fiscal Year","Last 365 Days","Custom"];
const STATUS_OPTS:StatusFilter[] = ["Show All Orders","Show Open Orders","Show Closed Orders"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const fmtDate  = (d:Date) => d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
const fmtShort = (d:Date) => `${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)} ${d.getFullYear()}`;
const fmtMoney = (n:number) => n===0?"₹0":`₹${Math.abs(n).toLocaleString("en-IN")}`;
const fmtAmt   = (n:number) => `₹ ${n.toLocaleString("en-IN")}`;
const todayStr = () => { const d=new Date(); return `${d.getDate().toString().padStart(2,"0")} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]} ${d.getFullYear()}`; };
const fmtDateTime = (dateStr:string) => {
  const d = new Date(dateStr);
  const h = d.getHours(), m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = (h % 12 || 12).toString().padStart(2,"0");
  return `${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getFullYear()} ${hh}:${m.toString().padStart(2,"0")} ${ampm}`;
};


/* ══════════════════════════════════════════ CALENDAR ══ */
function CalendarPicker({onApply,onCancel}:{onApply:(f:Date,t:Date)=>void;onCancel:()=>void}) {
  const today=new Date();
  const [vy,setVy]=useState(today.getFullYear());
  const [vm,setVm]=useState(today.getMonth());
  const [start,setStart]=useState<Date|null>(null);
  const [end,setEnd]=useState<Date|null>(null);
  const [hov,setHov]=useState<Date|null>(null);
  const prev=()=>{if(vm===0){setVm(11);setVy(y=>y-1);}else setVm(m=>m-1);};
  const next=()=>{if(vm===11){setVm(0);setVy(y=>y+1);}else setVm(m=>m+1);};
  const cells=()=>{
    const f=new Date(vy,vm,1),l=new Date(vy,vm+1,0),a:(Date|null)[]=[];
    for(let i=0;i<f.getDay();i++)a.push(null);
    for(let d=1;d<=l.getDate();d++)a.push(new Date(vy,vm,d));
    while(a.length%7!==0)a.push(null);return a;
  };
  const same=(a:Date,b:Date)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
  const inR=(d:Date)=>{const e2=end||hov;if(!start||!e2)return false;const mn=start<e2?start:e2,mx=start<e2?e2:start;return d>mn&&d<mx;};
  const pick=(d:Date)=>{if(!start||(start&&end)){setStart(d);setEnd(null);}else{if(d<start){setEnd(start);setStart(d);}else setEnd(d);}};
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
            const isStart=!!(start&&same(d,start));const isEnd=!!(end&&same(d,end));
            let cls="pi-cal-day";
            if(isStart&&end)cls+=" range-start";else if(isEnd)cls+=" range-end";else if(isSel)cls+=" selected";
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
   SETTINGS MODAL
══════════════════════════════════════════════════════════ */
function POSettingsModal({settings,setSettings,onClose}:{
  settings:POSettings;
  setSettings:React.Dispatch<React.SetStateAction<POSettings>>;
  onClose:()=>void;
}) {
  const [local,setLocal]=useState({...settings});
  return (
    <div className="pi-overlay" onClick={onClose}>
      <div className="pi-modal po-settings-modal" onClick={e=>e.stopPropagation()}>
        <div className="pi-modal-head">
          <span className="pi-modal-title">Quick Purchase Order Settings</span>
          <button className="pi-modal-close" onClick={onClose}><IC.X/></button>
        </div>
        <div className="pi-s-block">
          <div className="pi-s-top">
            <div>
              <span className="pi-s-name">Purchase Order Prefix &amp; Sequence Number</span>
              <p className="pi-s-desc">Add your custom prefix &amp; sequence for Purchase Order Numbering</p>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={local.prefixEnabled} onChange={e=>setLocal(p=>({...p,prefixEnabled:e.target.checked}))}/>
              <span className="toggle-slider"/>
            </label>
          </div>
          {local.prefixEnabled&&(
            <>
              <div className="pi-s-fields">
                <div><label>Prefix</label><input placeholder="Prefix" value={local.prefix} onChange={e=>setLocal(p=>({...p,prefix:e.target.value}))}/></div>
                <div><label>Sequence Number</label><input type="number" value={local.sequenceNumber} onChange={e=>setLocal(p=>({...p,sequenceNumber:Number(e.target.value)}))}/></div>
              </div>
              <p className="pi-s-note">Purchase Order Number: {local.prefix}{local.sequenceNumber}</p>
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
              <input type="checkbox" checked={local.showItemImage} onChange={e=>setLocal(p=>({...p,showItemImage:e.target.checked}))}/>
              <span className="toggle-slider"/>
            </label>
          </div>
        </div>
        <div className="pi-s-block">
          <div className="pi-s-top">
            <div>
              <span className="pi-s-name">Price History <span className="badge-new">New</span></span>
              <p className="pi-s-desc">Show last 5 sales / purchase prices of the item for the selected party in invoice</p>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={local.priceHistory} onChange={e=>setLocal(p=>({...p,priceHistory:e.target.checked}))}/>
              <span className="toggle-slider"/>
            </label>
          </div>
        </div>
        <div className="pi-modal-foot">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={()=>{setSettings(local);onClose();}}>Save</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PURCHASE ORDER BILL VIEW
══════════════════════════════════════════════════════════ */
interface POBillViewProps {
  po: PurchaseOrder;
  orders: PurchaseOrder[];
  onBack: ()=>void;
  onEdit: (po:PurchaseOrder)=>void;
  onHistory: (po:PurchaseOrder)=>void;
  onDuplicate: (po:PurchaseOrder)=>void;
  onDelete: (po:PurchaseOrder)=>void;
}

function POBillView({po, orders, onBack, onEdit, onHistory, onDuplicate, onDelete}:POBillViewProps) {
  const [showDots, setShowDots]  = useState(false);
  const [showShareDD, setShowShareDD] = useState(false);
  const [showPrintDD, setShowPrintDD] = useState(false);
  const [toast, setToast] = useState<string|null>(null);
  const dotsRef  = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const showT = (m:string) => { setToast(m); setTimeout(()=>setToast(null), 2400); };

  useEffect(()=>{
    const h=(e:MouseEvent)=>{
      if(dotsRef.current  && !dotsRef.current.contains(e.target as Node))  setShowDots(false);
      if(shareRef.current && !shareRef.current.contains(e.target as Node)) setShowShareDD(false);
      if(printRef.current && !printRef.current.contains(e.target as Node)) setShowPrintDD(false);
    };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);

  /* ── Calculations ── */
  const subtotal     = po.items.reduce((s,i)=>s+(i.qty*i.price - i.discount),0);
  const totalTax     = po.items.reduce((s,i)=>s+(i.qty*i.price*i.tax/100),0);
  const chargesTotal = po.charges.reduce((s,c)=>s+c.amount,0);
  const discountAmt  = po.discountEnabled
    ? (po.discountType==="%"?(subtotal+chargesTotal)*po.discountVal/100 : po.discountVal)
    : 0;
  const roundOffAmt  = po.roundOff ? (po.roundOffDir==="+Add" ? po.roundOffVal : -po.roundOffVal) : 0;
  const total = subtotal + chargesTotal - discountAmt + totalTax + roundOffAmt;

  /* ── Number to words ── */
  const numToWords = (n:number):string => {
    if(n===0) return "Zero Rupees";
    const ones=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
    const tens=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
    const conv=(num:number):string=>{
      if(num<20)  return ones[num];
      if(num<100) return tens[Math.floor(num/10)]+(num%10?" "+ones[num%10]:"");
      if(num<1000)return ones[Math.floor(num/100)]+" Hundred"+(num%100?" "+conv(num%100):"");
      if(num<100000)  return conv(Math.floor(num/1000))+" Thousand"+(num%1000?" "+conv(num%1000):"");
      if(num<10000000)return conv(Math.floor(num/100000))+" Lakh"+(num%100000?" "+conv(num%100000):"");
      return conv(Math.floor(num/10000000))+" Crore"+(num%10000000?" "+conv(num%10000000):"");
    };
    return conv(Math.round(n))+" Rupees";
  };

  return (
    <div className="bill-view-page">

      {/* ── Top bar ── */}
      <div className="bill-view-topbar">
        <div className="bill-view-topbar-left">
          <button className="report-back-btn" onClick={onBack}>
            <IC.Back/>
          </button>
          <span className="bill-view-title">Purchase Order #{po.poNumber}</span>
          <span className={`bv-badge bv-status--${po.status.toLowerCase()}`}>{po.status}</span>
        </div>

        <div className="bill-view-topbar-right">
          {/* Download PDF */}
          <button className="report-action-btn" onClick={()=>showT("Downloading PDF...")}>
            <IC.Download/> Download PDF
          </button>

          {/* Print PDF split btn */}
          <div className="report-action-split" ref={printRef} style={{position:"relative",display:"flex"}}>
            <button className="report-action-btn" onClick={()=>showT("Printing PDF...")}>
              <IC.Print/> Print PDF
            </button>
            <button className="report-action-btn-arr" onClick={()=>{setShowPrintDD(v=>!v);setShowShareDD(false);}}>▾</button>
            {showPrintDD&&(
              <div className="bv-dropdown">
                <div className="bv-dd-item" onClick={()=>{setShowPrintDD(false);showT("Print Thermal");}}>Print Thermal</div>
              </div>
            )}
          </div>

          {/* Refresh */}
          <button className="report-action-btn" onClick={()=>showT("Refreshed")}>
            <IC.Refresh/>
          </button>

          {/* Share split btn */}
          <div className="report-action-split" ref={shareRef} style={{position:"relative",display:"flex"}}>
            <button className="report-action-btn" onClick={()=>showT("Opening share...")}>
              <IC.Share/> Share
            </button>
            <button className="report-action-btn-arr" onClick={()=>{setShowShareDD(v=>!v);setShowPrintDD(false);}}>▾</button>
            {showShareDD&&(
              <div className="bv-dropdown">
                <div className="bv-dd-item" onClick={()=>{setShowShareDD(false);showT("Sharing via WhatsApp");}}>
                  <span className="bv-dd-icon bv-wa-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor" style={{width:14,height:14}}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </span>
                  Whatsapp
                </div>
                <div className="bv-dd-item" onClick={()=>{setShowShareDD(false);showT("Sharing via SMS");}}>
                  <span className="bv-dd-icon bv-sms-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </span>
                  SMS
                </div>
              </div>
            )}
          </div>

          {/* 3-dot menu */}
          <div ref={dotsRef} style={{position:"relative"}}>
            <button className="report-action-btn bv-dots-btn" onClick={()=>setShowDots(v=>!v)}>
              <IC.Dots/>
            </button>
            {showDots&&(
              <div className="bv-dropdown bv-dots-dd">
                <div className="bv-dd-item" onClick={()=>{setShowDots(false);onEdit(po);}}>
                  <IC.Edit/> Edit
                </div>
                <div className="bv-dd-item" onClick={()=>{setShowDots(false);onHistory(po);}}>
                  <IC.History/> Edit History
                </div>
                <div className="bv-dd-item" onClick={()=>{setShowDots(false);onDuplicate(po);}}>
                  <IC.Copy/> Duplicate
                </div>
                <div className="bv-dd-divider"/>
                <div className="bv-dd-item bv-dd-danger" onClick={()=>{setShowDots(false);onDelete(po);}}>
                  <IC.Trash/> Delete
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bill paper ── */}
      <div className="bill-paper-wrap">
        <div className="bill-paper">

          {/* Purchase label + logo */}
          <div className="bill-paper-top-row">
            <div className="bill-purchase-label">PURCHASE ORDER</div>
            <div className="bill-logo-area">
              <span style={{fontWeight:900,fontSize:13,color:"#1a2332",letterSpacing:0.5}}>✦ myBillBook</span>
            </div>
          </div>

          {/* Company info + PO meta */}
          <div className="bill-header-row">
            <div className="bill-company-info">
              <div className="bill-company-logo-box">
                <div style={{width:44,height:44,background:"#e8f0fe",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:9,fontWeight:700,color:"#4361ee",textAlign:"center",lineHeight:1.2}}>SCRATCH<br/>WEB</span>
                </div>
              </div>
              <div>
                <div className="bill-company-name">scratchweb.solutions</div>
                <div className="bill-company-addr">
                  WEST SHANTINAGAR ANANDNAGAR BALLY<br/>
                  HOWRAH SAREE HOUSE, HOWRAH, 711227<br/>
                  Mobile: 06289909521<br/>
                  Email: rakeshranjantiwan11@gmail.com
                </div>
              </div>
            </div>
            <table className="bill-meta-table">
              <tbody>
                <tr>
                  <td className="bill-meta-label">Purchase Order No.</td>
                  <td className="bill-meta-val">{po.poNumber}</td>
                </tr>
                <tr>
                  <td className="bill-meta-label">Purchase Order Date</td>
                  <td className="bill-meta-val">{fmtDateTime(po.date)}</td>
                </tr>
                {po.validTill && po.validTill!=="-" && (
                  <tr>
                    <td className="bill-meta-label">Valid Till</td>
                    <td className="bill-meta-val" style={{color:"#e53935"}}>{po.validTill}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Bill From */}
          <div className="bill-from-row">
            <div>
              <div className="bill-from-label">BILL FROM</div>
              <div className="bill-from-name">{po.partyName.toUpperCase()}</div>
              {po.partyPhone && <div className="bill-from-detail">Mobile: {po.partyPhone}</div>}
            </div>
          </div>

          {/* Items table */}
          <table className="bill-items-table">
            <thead>
              <tr>
                <th style={{width:44,textAlign:"center"}}>S.NO.</th>
                <th>SERVICES</th>
                <th style={{width:80,textAlign:"center"}}>QTY</th>
                <th style={{width:90,textAlign:"center"}}>RATE</th>
                <th style={{width:90,textAlign:"center"}}>TAX</th>
                <th style={{width:100,textAlign:"right"}}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {po.items.length === 0
                ? <tr><td colSpan={6} style={{textAlign:"center",padding:"40px 16px",color:"#b0bec5",fontSize:13}}>No items added</td></tr>
                : po.items.map((item,idx)=>{
                    const amt   = item.qty * item.price - item.discount;
                    const taxAmt= item.qty * item.price * item.tax / 100;
                    return (
                      <tr key={item.id}>
                        <td style={{textAlign:"center",color:"#667085",fontSize:13}}>{idx+1}</td>
                        <td style={{fontWeight:500,color:"#1a2332",fontSize:13}}>{item.name}</td>
                        <td style={{textAlign:"center",color:"#344054",fontSize:13}}>{item.qty} PCS</td>
                        <td style={{textAlign:"center",color:"#344054",fontSize:13}}>{item.price > 0 ? item.price.toLocaleString("en-IN") : 0}</td>
                        <td style={{textAlign:"center",color:"#667085",fontSize:13}}>
                          {item.price > 0 ? taxAmt.toLocaleString("en-IN") : 0}
                          <div style={{fontSize:10,color:"#9aabbd"}}>({item.tax}%)</div>
                        </td>
                        <td style={{textAlign:"right",fontWeight:600,color:"#1a2332",fontSize:13}}>{amt.toLocaleString("en-IN")}</td>
                      </tr>
                    );
                  })
              }
            </tbody>
            <tfoot>
              <tr className="bill-tfoot-total">
                <td colSpan={2}/>
                <td style={{textAlign:"center",fontWeight:700,fontSize:13}}>
                  {po.items.reduce((s,i)=>s+i.qty,0)||""}
                </td>
                <td style={{textAlign:"right",fontWeight:700,fontSize:12,color:"#667085",paddingRight:8}}>TOTAL</td>
                <td style={{textAlign:"center",fontWeight:700,fontSize:13}}>₹{totalTax.toLocaleString("en-IN")}</td>
                <td style={{textAlign:"right",fontWeight:700,fontSize:13}}>₹{total.toLocaleString("en-IN")}</td>
              </tr>
              {po.amount > 0 && (
                <tr style={{background:"#f9fafb"}}>
                  <td colSpan={5} style={{textAlign:"right",fontWeight:500,fontSize:12,color:"#667085",paddingRight:8}}>PAID AMOUNT</td>
                  <td style={{textAlign:"right",fontWeight:600,fontSize:13,color:"#22c55e"}}>₹{po.amount.toLocaleString("en-IN")}</td>
                </tr>
              )}
            </tfoot>
          </table>

          {/* HSN / Tax breakdown */}
          <div className="bill-tax-section">
            <table className="bill-tax-table">
              <thead>
                <tr>
                  <th>HSN/SAC</th>
                  <th style={{textAlign:"right"}}>Taxable Value</th>
                  <th colSpan={2} style={{textAlign:"center"}}>CGST</th>
                  <th colSpan={2} style={{textAlign:"center"}}>SGST</th>
                  <th style={{textAlign:"right"}}>Total Tax Amount</th>
                </tr>
                <tr style={{background:"#f9fafb"}}>
                  <th/><th/>
                  <th style={{textAlign:"center",fontSize:10,color:"#667085",fontWeight:500}}>Rate</th>
                  <th style={{textAlign:"center",fontSize:10,color:"#667085",fontWeight:500}}>Amount</th>
                  <th style={{textAlign:"center",fontSize:10,color:"#667085",fontWeight:500}}>Rate</th>
                  <th style={{textAlign:"center",fontSize:10,color:"#667085",fontWeight:500}}>Amount</th>
                  <th/>
                </tr>
              </thead>
              <tbody>
                {po.items.length === 0
                  ? <tr><td colSpan={7} style={{textAlign:"center",padding:"10px",color:"#b0bec5",fontSize:12}}>—</td></tr>
                  : po.items.map((item,i)=>{
                      const tv = item.qty * item.price;
                      const it = tv * item.tax / 100;
                      return (
                        <tr key={i}>
                          <td style={{color:"#667085",fontSize:12}}>{item.hsn||"-"}</td>
                          <td style={{textAlign:"right",fontSize:12}}>{tv.toLocaleString("en-IN")}</td>
                          <td style={{textAlign:"center",color:"#667085",fontSize:12}}>{item.tax/2}%</td>
                          <td style={{textAlign:"center",fontSize:12}}>{(it/2).toLocaleString("en-IN")}</td>
                          <td style={{textAlign:"center",color:"#667085",fontSize:12}}>{item.tax/2}%</td>
                          <td style={{textAlign:"center",fontSize:12}}>{(it/2).toLocaleString("en-IN")}</td>
                          <td style={{textAlign:"right",fontWeight:600,fontSize:12}}>₹{it.toLocaleString("en-IN")}</td>
                        </tr>
                      );
                    })
                }
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="bill-footer-row">
            <div className="bill-footer-left">
              <div className="bill-words-label">Total Amount (in words)</div>
              <div className="bill-words-val">{numToWords(total)}</div>
              <div style={{marginTop:16}}>
                <div className="bill-tc-label">Terms and Conditions</div>
                <div className="bill-tc-text">
                  1. Goods once sold will not be taken back or exchanged<br/>
                  2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only
                </div>
              </div>
            </div>
            <div className="bill-footer-right">
              <div className="bill-auth-label">Authorised Signatory For</div>
              <div className="bill-auth-company">scratchweb.solutions</div>
              <div className="bill-sig-box"/>
            </div>
          </div>

          <div className="bill-bottom-footer">
            Invoice created using <strong style={{color:"#4361ee"}}>myBillBook</strong> · Download now
          </div>
        </div>
      </div>

      {toast&&<div className="pi-toast">{toast}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CREATE / EDIT PURCHASE ORDER PAGE
══════════════════════════════════════════════════════════ */
interface CreatePOProps {
  mode: "create"|"edit";
  editData?: PurchaseOrder;
  seqNo: number;
  onBack: ()=>void;
  onSaved: (po:PurchaseOrder, isEdit:boolean)=>void;
  onSaveAndNew: (po:PurchaseOrder)=>void;
  allParties: Party[];
  setAllParties: React.Dispatch<React.SetStateAction<Party[]>>;
  settings: POSettings;
  onOpenSettings: ()=>void;
  onCreateParty: ()=>void;
}

function CreatePurchaseOrderPage({mode,editData,seqNo,onBack,onSaved,onSaveAndNew,allParties,setAllParties,settings,onOpenSettings,onCreateParty}:CreatePOProps) {
    const navigate = useNavigate();
  const isEdit = mode==="edit";
  const initParty = editData ? allParties.find(p=>p.id===editData.partyId)||null : null;

  const [partyState,setPartyState]=useState<"empty"|"searching"|"selected">(initParty?"selected":"empty");
  const [partySearch,setPartySearch]=useState("");
  const [selectedParty,setSelectedParty]=useState<Party|null>(initParty);
  const [items,setItems]=useState<POItem[]>(editData?[...editData.items]:[]);
  const [charges,setCharges]=useState<POCharge[]>(editData?[...editData.charges]:[]);
  const [showDiscount,setShowDiscount]=useState(editData?editData.discountEnabled:false);
  const [discountType,setDiscountType]=useState<"%"|"₹">(editData?editData.discountType:"%");
  const [discountVal,setDiscountVal]=useState(editData?editData.discountVal:0);
  const [roundOff,setRoundOff]=useState(editData?editData.roundOff:false);
  const [roundOffDir,setRoundOffDir]=useState(editData?editData.roundOffDir:"+Add");
  const [roundOffVal,setRoundOffVal]=useState(editData?editData.roundOffVal:0);
  const [showNotes,setShowNotes]=useState(false);
  const [notes,setNotes]=useState("");
  const [showCreateParty,setShowCreateParty]=useState(false);
  const [showAddItems,setShowAddItems]=useState(false);
  const [toast,setToast]=useState<string|null>(null);
  const [itemSearch,setItemSearch]=useState("");
  const [pendingQtys,setPendingQtys]=useState<Record<number,number>>({});
  const [addedIds,setAddedIds]=useState<number[]>([]);
  const [cpName,setCpName]=useState(""); const [cpPhone,setCpPhone]=useState("");
  const [cpShowAddr,setCpShowAddr]=useState(false); const [cpShowGST,setCpShowGST]=useState(false);
  const [cpAddr,setCpAddr]=useState(""); const [cpStateF,setCpStateF]=useState("");
  const [cpPin,setCpPin]=useState(""); const [cpCity,setCpCity]=useState("");
  const [cpGSTIN,setCpGSTIN]=useState(""); const [cpErr,setCpErr]=useState(false);

  const [showShipModal,setShowShipModal]=useState(false);
  const [shipName,setShipName]=useState(initParty?.name||"");
  const [shipPhone,setShipPhone]=useState(initParty?.phone||"");
  const [shipAddr,setShipAddr]=useState("");
  const [shipCity,setShipCity]=useState("");
  const [shipState,setShipState]=useState("");
  const [shipPin,setShipPin]=useState("");
  const [shipSaved,setShipSaved]=useState(false);

  const partyRef        = useRef<HTMLDivElement>(null);
  const partyBoxRef     = useRef<HTMLDivElement>(null);
  const [ddPos, setDdPos] = useState<{top:number;left:number;width:number}>({top:0,left:0,width:320});

  const openPartySearch = useCallback(() => {
    if (partyBoxRef.current) {
      const r = partyBoxRef.current.getBoundingClientRect();
      setDdPos({ top: r.bottom, left: r.left, width: Math.max(r.width, 320) });
    }
    setPartyState("searching");
    setPartySearch("");
  }, []);

  useEffect(()=>{
    const h=(e:MouseEvent)=>{
      const clickedInsideAnchor = partyBoxRef.current?.contains(e.target as Node);
      const clickedInsideDropdown = (e.target as HTMLElement).closest(".party-dropdown-portal");
      if (!clickedInsideAnchor && !clickedInsideDropdown) {
        if (partyState==="searching") setPartyState(selectedParty?"selected":"empty");
      }
    };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[partyState,selectedParty]);

  useEffect(()=>{
    if (partyState !== "searching") return;
    const reCalc = () => {
      if (partyBoxRef.current) {
        const r = partyBoxRef.current.getBoundingClientRect();
        setDdPos({ top: r.bottom, left: r.left, width: Math.max(r.width, 320) });
      }
    };
    window.addEventListener("scroll", reCalc, true);
    window.addEventListener("resize", reCalc);
    return () => {
      window.removeEventListener("scroll", reCalc, true);
      window.removeEventListener("resize", reCalc);
    };
  },[partyState]);

  const showT=(m:string)=>{setToast(m);setTimeout(()=>setToast(null),2400);};

  const subtotal      = items.reduce((s,i)=>s+(i.qty*i.price-i.discount),0);
  const totalTax      = items.reduce((s,i)=>{
    const taxable = (i.qty * i.price) - i.discount;
    return s + (taxable * i.tax / 100);
  },0);
  const chargesTotal  = charges.reduce((s,c)=>s+c.amount,0);
  const taxableAmount = subtotal+chargesTotal;
  const discountAmt   = showDiscount?(discountType==="%"?taxableAmount*discountVal/100:discountVal):0;
  const roundOffAmt   = roundOff?(roundOffDir==="+Add"?roundOffVal:-roundOffVal):0;
  const totalAmt      = taxableAmount-discountAmt+totalTax+roundOffAmt;

  const poNo = isEdit ? String(editData!.poNumber) : String(seqNo);
  const poDate = isEdit ? fmtDate(new Date(editData!.date)) : todayStr();

  const selectParty=(p:Party)=>{
    setSelectedParty(p);setPartyState("selected");setPartySearch("");
    setShipName(p.name);setShipPhone(p.phone);setShipSaved(false);
    setShipAddr("");setShipCity("");setShipState("");setShipPin("");
  };
  const filtParties=allParties.filter(p=>p.name.toLowerCase().includes(partySearch.toLowerCase()));

  /* ── Live catalog from backend ── */
  const [catalog,setCatalog]=useState<CatalogItem[]>([]);
  useEffect(()=>{
    api.get("/items")
      .then((res:any)=>{
        const list:any[] = res.data?.data ?? res.data;
        setCatalog(
          list.map((i:any)=>({
            id: i.id,
            name: i.name,
            code: i.itemCode ?? "",
            stock: i.ProductStock?.length
              ? `${i.ProductStock.reduce((s:any,x:any)=>s+(Number(x.openingStock)||0),0)} ${i.unit ?? ""}`.trim()
              : i.currentStock != null
                ? `${i.currentStock} ${i.unit ?? ""}`.trim()
                : "",
            salesPrice:    Number(i.salesPrice    ?? 0),
            purchasePrice: Number(i.purchasePrice ?? 0),
          }))
        );
      })
      .catch((err)=>{
        console.error("Failed to fetch items:", err);
      });
  },[]);

  const filtCatalog=catalog.filter(c=>c.name.toLowerCase().includes(itemSearch.toLowerCase())||c.code.toLowerCase().includes(itemSearch.toLowerCase()));

  const saveParty=()=>{
    if(!cpName.trim()){setCpErr(true);return;}
    const np:Party={id:Date.now(),name:cpName,phone:cpPhone,pan:"",balance:0};
    setAllParties(p=>[...p,np]);selectParty(np);setShowCreateParty(false);
    setCpName("");setCpPhone("");setCpShowAddr(false);setCpShowGST(false);setCpErr(false);
    showT(`Party "${cpName}" created`);
  };

  const openAddItems=()=>{
    const init:Record<number,number>={};
    items.forEach(i=>{init[i.id]=i.qty;});
    setPendingQtys(init);setAddedIds(items.map(i=>i.id));setShowAddItems(true);
  };
  const toggleItem=(cat:CatalogItem)=>{
    if(addedIds.includes(cat.id)){setAddedIds(p=>p.filter(x=>x!==cat.id));setPendingQtys(p=>{const n={...p};delete n[cat.id];return n;});}
    else{setAddedIds(p=>[...p,cat.id]);setPendingQtys(p=>({...p,[cat.id]:1}));}
  };
  const setPendingQty=(id:number,v:number)=>setPendingQtys(p=>({...p,[id]:Math.max(1,v)}));
  const addToBill=()=>{
    const newItems:POItem[]=addedIds.map(id=>{
      const ex=items.find(i=>i.id===id);const cat=catalog.find(c=>c.id===id)!;
      return ex
        ? {...ex,qty:pendingQtys[id]??ex.qty}
        : {
            id: cat.id,
            name: cat.name,
            hsn: "",
            qty: pendingQtys[id] ?? 1,
            price: cat.purchasePrice > 0 ? cat.purchasePrice : cat.salesPrice,
            discount: 0,
            tax: 0,
          };
    });
    setItems(newItems);setShowAddItems(false);setItemSearch("");
  };
  const removeItem=(id:number)=>setItems(p=>p.filter(i=>i.id!==id));
  const updItem=(id:number,f:keyof POItem,v:string)=>setItems(p=>p.map(i=>i.id===id?{...i,[f]:isNaN(Number(v))?v:Number(v)}:i));
  const addCharge=()=>setCharges(p=>[...p,{id:Date.now(),label:"",amount:0,taxRate:"No Tax Applicable"}]);
  const updCharge=(id:number,f:keyof POCharge,v:string|number)=>setCharges(p=>p.map(c=>c.id===id?{...c,[f]:v}:c));
  const removeCharge=(id:number)=>setCharges(p=>p.filter(c=>c.id!==id));

  const buildPO = (): PurchaseOrder => ({
    id: isEdit ? editData!.id : 0, // backend will assign real id
    date: isEdit ? editData!.date : new Date().toISOString().slice(0, 10),
    poNumber: Number(poNo),
    partyName: selectedParty!.name,
    partyId: selectedParty!.id,
    partyPhone: selectedParty!.phone,
    validTill: "-",
    amount: totalAmt,
    status: "Open",
    items,
    charges,
    discountEnabled: showDiscount,
    discountType,
    discountVal,
    roundOff,
    roundOffDir,
    roundOffVal,
  });

  const handleSave=()=>{
    if(!selectedParty){showT("Please select a party first");return;}
    onSaved(buildPO(), isEdit);
  };

  const handleSaveAndNew=()=>{
    if(!selectedParty){showT("Please select a party first");return;}
    onSaveAndNew(buildPO());
    /* Reset form state */
    setPartyState("empty");
    setPartySearch("");
    setSelectedParty(null);
    setItems([]);
    setCharges([]);
    setShowDiscount(false);
    setDiscountType("%");
    setDiscountVal(0);
    setRoundOff(false);
    setRoundOffDir("+Add");
    setRoundOffVal(0);
    setShowNotes(false);
    setNotes("");
    setShipName("");setShipPhone("");setShipAddr("");setShipCity("");setShipState("");setShipPin("");setShipSaved(false);
    showT("Saved! New purchase order ready.");
  };

  const PartyDropdownPortal = () => {
    if (partyState !== "searching") return null;
    return (
      <div className="party-dropdown-portal" style={{position:"fixed",top:ddPos.top,left:ddPos.left,width:ddPos.width,zIndex:99999,background:"#fff",border:"1px solid #e4e7ec",borderRadius:8,boxShadow:"0 8px 28px rgba(0,0,0,0.13)",overflow:"hidden"}}>
        <div className="party-dd-header"><span>Party Name</span><span>Balance</span></div>
        {filtParties.map(p=>(
          <div key={p.id} className="party-dd-item" onMouseDown={()=>selectParty(p)}>
            <span className="party-dd-name">{p.name}</span>
            <span className={`party-dd-bal ${p.balance<0?"neg":""}`}>{fmtMoney(p.balance)}{p.balance<0&&<IC.ArrowUp/>}</span>
          </div>
        ))}
        <div className="party-dd-create" onMouseDown={()=>{setPartyState("empty");setShowCreateParty(true);onCreateParty();}}>
          <IC.Plus/> + Create Party
        </div>
      </div>
    );
  };

  return (
    <div className="cpi-page">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",height:56,background:"#fff",borderBottom:"1px solid #e4e7ec",position:"sticky",top:0,zIndex:100,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",padding:4,display:"flex",alignItems:"center",color:"#344054",flexShrink:0}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h2 style={{margin:0,fontSize:18,fontWeight:700,color:"#1d2939",whiteSpace:"nowrap",fontFamily:"inherit"}}>
            {isEdit ? "Update Purchase Order" : editData ? "Duplicate Purchase Order" : "Create Purchase Order"}
          </h2>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <button className="po-grid-btn"><IC.Grid/></button>
          <button className="btn-topbar-settings" onClick={onOpenSettings}><IC.Settings/> Settings<span className="red-dot"/></button>
          {!isEdit&&<button className="btn-save-new" onClick={handleSaveAndNew}>Save &amp; New</button>}
          <button className={isEdit?"btn-save-update":"btn-save-top po-save-disabled"} onClick={handleSave}>
            {isEdit?"Update Purchase Order":"Save"}
          </button>
        </div>
      </div>

      <div className="cpi-body">
        <div className="cpi-top-card">
          <div className="cpi-bill-panel" ref={partyBoxRef}>
            {partyState==="empty"&&(<div className="party-add-box" onClick={openPartySearch}><div className="party-add-inner"><IC.Plus/>  Add Party</div></div>)}
            {partyState==="searching"&&(
              <div ref={partyRef} className="party-search-wrap">
                <input className="party-search-input" placeholder="Search party by name or number" value={partySearch} onChange={e=>setPartySearch(e.target.value)} autoFocus/>
                <span className="party-search-arrow"><IC.Chevron/></span>
              </div>
            )}
            {partyState==="selected"&&selectedParty&&(
              <div className="party-info-section">
                <div className="party-info-pane">
                  <div className="party-info-pane-header"><span className="pane-label">Bill From</span><button className="btn-change" onClick={openPartySearch}>Change Party</button></div>
                  <div className="party-info-name">{selectedParty.name}</div>
                  {selectedParty.phone&&<div className="party-info-line">Phone Number: {selectedParty.phone}</div>}
                  {selectedParty.pan&&<div className="party-info-line">PAN Number: {selectedParty.pan}</div>}
                </div>
                <div className="party-info-pane">
                  <div className="party-info-pane-header"><span className="pane-label">Ship From</span><button className="btn-change" onClick={()=>setShowShipModal(true)}>Change Shipping Address</button></div>
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
              <div className="inv-field-group" style={{flex:"0 0 80px"}}><label>PO No:</label><input value={poNo} readOnly/></div>
              <div className="inv-field-group" style={{flex:1}}><label>PO Date:</label><div className="date-field-wrap"><span className="cal-icon"><IC.Calendar/></span><span className="date-val">{poDate}</span><span className="caret">▾</span></div></div>
            </div>
            <div className="extra-fields-grid po-extra-grid">
              <div className="extra-field"><label>Challan No.:</label><input/></div>
              <div className="extra-field"><label>Financed By:</label><input/></div>
              <div className="extra-field"><label>Salesman:</label><input/></div>
              <div className="extra-field"><label>Email ID:</label><input/></div>
            </div>
            <div className="extra-fields-grid-2"><div className="extra-field"><label>Warranty Period:</label><input/></div></div>
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
                  <td><div style={{fontWeight:600,color:"#1a2332"}}>{item.name}</div><input className="item-desc-input" placeholder="Enter Description (optional)"/></td>
                  <td><input className="qty-input" style={{width:92}} value={item.hsn} onChange={e=>updItem(item.id,"hsn",e.target.value)}/></td>
                  <td><div style={{display:"flex",alignItems:"center",gap:3}}><input className="qty-input" type="number" value={item.qty} onChange={e=>updItem(item.id,"qty",e.target.value)}/><span style={{fontSize:10,color:"#98a2b3",whiteSpace:"nowrap"}}>PCS</span></div></td>
                  <td><input className="qty-input" style={{width:108}} type="number" value={item.price||""} placeholder="0" onChange={e=>updItem(item.id,"price",e.target.value)}/></td>
                  <td>
                    <div style={{display:"flex",flexDirection:"column",gap:3}}>
                      <div style={{display:"flex",alignItems:"center",gap:3}}><span style={{fontSize:11,color:"#667085"}}>%</span><input className="qty-input" style={{width:60}} type="number" value={item.discount||""} placeholder="0" onChange={e=>updItem(item.id,"discount",e.target.value)}/></div>
                      <div style={{display:"flex",alignItems:"center",gap:3}}><span style={{fontSize:11,color:"#667085"}}>₹</span><input className="qty-input" style={{width:60}} type="number" value={item.discount||""} placeholder="0" onChange={e=>updItem(item.id,"discount",e.target.value)}/></div>
                    </div>
                  </td>
                  <td><div style={{display:"flex",flexDirection:"column",gap:3}}><div style={{fontSize:11,color:"#667085"}}>{item.tax}%</div><div style={{fontSize:11,color:"#667085"}}>(₹ {(item.qty*item.price*item.tax/100).toLocaleString("en-IN")})</div></div></td>
                  <td><div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:11,color:"#98a2b3"}}>₹</span><span style={{fontWeight:700,color:"#1d2939"}}>{(item.qty*item.price-item.discount).toLocaleString("en-IN")}</span></div></td>
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
            {!showNotes?<button className="btn-add-notes" onClick={()=>setShowNotes(true)}>+ Add Notes</button>
              :<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Add notes..." style={{width:"100%",border:"1.5px solid #dde1e9",borderRadius:6,padding:"7px 10px",fontSize:12,outline:"none",resize:"vertical",minHeight:50,fontFamily:"inherit",marginBottom:10}}/>}
            <div className="tc-label-row"><span className="tc-heading">Terms and Conditions</span><button className="tc-gear-btn" onClick={()=>showT("T&C settings")}><IC.Gear/></button></div>
            <div className="tc-list">1. Goods once sold will not be taken back or exchanged<br/>2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only</div>
          </div>
          <div className="summary-panel">
            {charges.map(c=>(
              <div key={c.id} className="charge-row">
                <input className="charge-label-input" placeholder="Enter charge (ex. Transport Charge)" value={c.label} onChange={e=>updCharge(c.id,"label",e.target.value)}/>
                <div className="charge-right">
                  <div className="charge-amount-wrap"><span className="charge-rupee">₹</span><input type="number" className="charge-amt-input" value={c.amount===0?"":c.amount} onChange={e=>updCharge(c.id,"amount",Number(e.target.value))} placeholder="0"/></div>
                  <select className="charge-tax-select" value={c.taxRate} onChange={e=>updCharge(c.id,"taxRate",e.target.value)}><option>No Tax Applicable</option><option>5%</option><option>12%</option><option>18%</option><option>28%</option></select>
                  <button className="charge-remove-btn" onClick={()=>removeCharge(c.id)}><IC.X/></button>
                </div>
              </div>
            ))}
            <button className="btn-add-charge-link" onClick={addCharge}>{charges.length===0?"+ Add Additional Charges":"+ Add Another Charge"}</button>
            <div className="summary-line"><span className="summary-line-label">Taxable Amount</span><span className="summary-line-value">{fmtAmt(taxableAmount)}</span></div>
            {!showDiscount
              ?<button className="btn-add-discount-link" onClick={()=>setShowDiscount(true)}> Add Discount</button>
              :<div className="discount-row">
                  <span className="discount-label">Discount</span>
                  <div className="discount-inputs">
                    <select className="discount-type-select" value={discountType} onChange={e=>setDiscountType(e.target.value as any)}><option value="%">%</option><option value="₹">₹</option></select>
                    <input type="number" className="discount-val-input" value={discountVal} onChange={e=>setDiscountVal(Number(e.target.value))}/>
                    <span className="discount-computed">- {fmtAmt(discountAmt)}</span>
                    <button className="charge-remove-btn" onClick={()=>{setShowDiscount(false);setDiscountVal(0);}}><IC.X/></button>
                  </div>
                </div>
            }
            <div className="round-off-line">
              <label className="summary-checkbox-label"><input type="checkbox" checked={roundOff} onChange={e=>setRoundOff(e.target.checked)}/>Auto Round Off</label>
              {roundOff&&(<div className="round-off-controls"><select value={roundOffDir} onChange={e=>setRoundOffDir(e.target.value)} className="round-dir-select"><option value="+Add">+Add</option><option value="-Sub">-Sub</option></select><span className="round-rupee">₹</span><input type="number" className="round-val-input" value={roundOffVal} onChange={e=>setRoundOffVal(Number(e.target.value))}/></div>)}
            </div>
            <div className="total-amount-line">
              <span className="total-amount-label">Total Amount</span>
              <div className="enter-payment-wrap">
                {totalAmt>0&&<span className="total-amount-value-big">{fmtAmt(totalAmt)}</span>}
                {totalAmt===0&&<span className="total-amount-value">₹ 0</span>}
                <button className="enter-payment-btn po-enter-payment">Enter Payment amount</button>
              </div>
            </div>
            <div className="authorized-row">Authorized signatory for <strong>scratchweb.solutions</strong></div>
            <div className="sig-box"/>
          </div>
        </div>
      </div>

      <PartyDropdownPortal/>

      {showCreateParty&&(
        <div className="modal-overlay" onClick={()=>setShowCreateParty(false)}>
          <div className="modal create-party-modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-head"><span className="modal-title">Create New Party</span><button className="modal-close" onClick={()=>setShowCreateParty(false)}><IC.X/></button></div>
            <div className="modal-body">
              <div className="form-group"><label>Party Name <span className="req">*</span></label><input placeholder="Enter name" value={cpName} className={cpErr?"error":""} onChange={e=>{setCpName(e.target.value);setCpErr(false);}}/>{cpErr&&<div className="error-msg">This field is mandatory</div>}</div>
              <div className="form-group"><label>Mobile Number</label><input placeholder="Enter Mobile Number" value={cpPhone} onChange={e=>setCpPhone(e.target.value)}/></div>
              {!cpShowAddr?<button className="btn-optional" onClick={()=>setCpShowAddr(true)}><IC.Plus/> + Add Address (Optional)</button>
                :<div className="optional-section"><div className="optional-section-header"><span className="optional-section-label">Address (Optional)</span><button className="btn-remove-section" onClick={()=>setCpShowAddr(false)}>Remove</button></div><div className="form-group"><label>BILLING ADDRESS</label><textarea placeholder="Enter billing address" value={cpAddr} onChange={e=>setCpAddr(e.target.value)}/></div><div className="form-row"><div className="form-group"><label>STATE</label><input placeholder="Enter State" value={cpStateF} onChange={e=>setCpStateF(e.target.value)}/></div><div className="form-group"><label>PINCODE</label><input placeholder="Enter Pincode" value={cpPin} onChange={e=>setCpPin(e.target.value)}/></div></div><div className="form-group"><label>CITY</label><input placeholder="Enter City" value={cpCity} onChange={e=>setCpCity(e.target.value)}/></div></div>}
              {!cpShowGST?<button className="btn-optional" onClick={()=>setCpShowGST(true)}><IC.Plus/> + Add GSTIN (Optional)</button>
                :<div className="optional-section"><div className="optional-section-header"><span className="optional-section-label">GSTIN (Optional)</span><button className="btn-remove-section" onClick={()=>setCpShowGST(false)}>Remove</button></div><div className="form-group"><label>GSTIN</label><input placeholder="ex: 29XXXXX9438X1XX" value={cpGSTIN} onChange={e=>setCpGSTIN(e.target.value)}/></div></div>}
              <div className="custom-fields-note">You can add Custom Fields from <a href="#" onClick={e=>e.preventDefault()}>Party Settings</a>.</div>
            </div>
            <div className="modal-footer"><button className="modal-btn-cancel" onClick={()=>setShowCreateParty(false)}>Cancel</button><button className="modal-btn-save" onClick={saveParty} disabled={!cpName.trim()}>Save</button></div>
          </div>
        </div>
      )}

      {showShipModal&&(
        <div className="modal-overlay" onClick={()=>setShowShipModal(false)}>
          <div className="modal" style={{maxWidth:480}} onClick={e=>e.stopPropagation()}>
            <div className="modal-head"><span className="modal-title">Change Shipping Address</span><button className="modal-close" onClick={()=>setShowShipModal(false)}><IC.X/></button></div>
            <div className="modal-body">
              <div className="form-group"><label>Name</label><input placeholder="Shipping name" value={shipName} onChange={e=>setShipName(e.target.value)}/></div>
              <div className="form-group"><label>Phone</label><input placeholder="Phone number" value={shipPhone} onChange={e=>setShipPhone(e.target.value)}/></div>
              <div className="form-group"><label>Address</label><textarea placeholder="Shipping address" value={shipAddr} onChange={e=>setShipAddr(e.target.value)} rows={2}/></div>
              <div className="form-row"><div className="form-group"><label>City</label><input placeholder="City" value={shipCity} onChange={e=>setShipCity(e.target.value)}/></div><div className="form-group"><label>State</label><input placeholder="State" value={shipState} onChange={e=>setShipState(e.target.value)}/></div></div>
              <div className="form-group"><label>Pincode</label><input placeholder="Pincode" value={shipPin} onChange={e=>setShipPin(e.target.value)}/></div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={()=>{setShipName(selectedParty?.name||"");setShipPhone(selectedParty?.phone||"");setShipAddr("");setShipCity("");setShipState("");setShipPin("");setShipSaved(false);setShowShipModal(false);}}>Reset to Bill From</button>
              <button className="modal-btn-save" onClick={()=>{setShipSaved(true);setShowShipModal(false);}}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showAddItems&&(
        <div className="modal-overlay" onClick={()=>{setShowAddItems(false);setItemSearch("");}}>
          <div className="aim-modal" onClick={e=>e.stopPropagation()}>
            <div className="aim-header"><span className="aim-title">Add Items to Bill</span><button className="aim-close" onClick={()=>{setShowAddItems(false);setItemSearch("");}}><IC.X/></button></div>
            <div className="aim-search-row">
              <div className="aim-search-box"><span className="aim-search-icon"><IC.Search/></span><input className="aim-search-input" placeholder="Search by Item / HSN code / SKU" value={itemSearch} onChange={e=>setItemSearch(e.target.value)} autoFocus/><button className="aim-barcode-btn"><IC.Barcode/></button></div>
              <div className="aim-cat-wrap"><select className="aim-cat-select"><option>Select Category</option><option>Electronics</option><option>Software</option></select></div>
             <button
  className="aim-create-btn"
  onClick={() => navigate("/cashier/createitem")}
>
  Create New Item
</button>
            </div>
            <div className="aim-table-wrap">
              <table className="aim-table">
                <thead><tr><th>Item Name</th><th style={{width:100}}>Item Code</th><th style={{width:90}}>Stock</th><th style={{width:110}}>Sales Price</th><th style={{width:120}}>Purchase Price</th><th style={{width:110,textAlign:"center"}}>Quantity</th></tr></thead>
                <tbody>
                  {filtCatalog.map(c=>{
                    const isAdded=addedIds.includes(c.id);const qty=pendingQtys[c.id]??1;
                    return(
                      <tr key={c.id} className={isAdded?"aim-row-added":""}>
                        <td className="aim-item-name">{c.name}</td>
                        <td className="aim-td-muted">{c.code}</td>
                        <td className="aim-td-muted">{c.stock}</td>
                        <td className="aim-td-muted">{c.salesPrice>0?`₹${c.salesPrice.toLocaleString("en-IN")}`:""}</td>
                        <td className="aim-td-muted">{c.purchasePrice>0?`₹${c.purchasePrice.toLocaleString("en-IN")}`:""}</td>
                        <td style={{textAlign:"center"}}>
                          {isAdded?<div className="aim-qty-controls"><button className="aim-qty-btn" onClick={()=>setPendingQty(c.id,qty-1)}>−</button><input className="aim-qty-input" type="number" value={qty} onChange={e=>setPendingQty(c.id,Number(e.target.value))}/><button className="aim-qty-btn" onClick={()=>setPendingQty(c.id,qty+1)}>+</button></div>:<button className="aim-add-btn" onClick={()=>toggleItem(c)}>+ Add</button>}
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
              <div className="aim-footer-btns"><button className="aim-cancel-btn" onClick={()=>{setShowAddItems(false);setItemSearch("");}}>Cancel (ESC)</button><button className="aim-confirm-btn" onClick={addToBill}>Add to Bill (F7)</button></div>
            </div>
          </div>
        </div>
      )}

      {toast&&<div className="pi-toast">{toast}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PURCHASE ORDERS LIST PAGE
══════════════════════════════════════════════════════════ */
function PurchaseOrdersListPage({orders,setOrders,settings,setSettings,onCreateNew,onEdit,onView,onDuplicate}:{
  orders:PurchaseOrder[];setOrders:React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
  settings:POSettings;setSettings:React.Dispatch<React.SetStateAction<POSettings>>;
  onCreateNew:()=>void; onEdit:(po:PurchaseOrder)=>void; onView:(po:PurchaseOrder)=>void; onDuplicate:(po:PurchaseOrder)=>void;
}) {
  const [dateFilter,setDateFilter]=useState<DateFilter>("Last 365 Days");
  const [statusFilter,setStatusFilter]=useState<StatusFilter>("Show Open Orders");
  const [customFrom,setCustomFrom]=useState<Date|null>(null);
  const [customTo,setCustomTo]=useState<Date|null>(null);
  const [showDateList,setShowDateList]=useState(false);
  const [showStatusList,setShowStatusList]=useState(false);
  const [showCalendar,setShowCalendar]=useState(false);
  const [showSettings,setShowSettings]=useState(false);
  const [query,setQuery]=useState("");
  const [showSearch,setShowSearch]=useState(false);
  const [ctx,setCtx]=useState<{id:number;x:number;y:number}|null>(null);
  const [toast,setToast]=useState<string|null>(null);
  const dateRef=useRef<HTMLDivElement>(null);
  const statusRef=useRef<HTMLDivElement>(null);
  const ctxRef=useRef<HTMLDivElement>(null);
  const searchRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const h=(e:MouseEvent)=>{
      if(dateRef.current&&!dateRef.current.contains(e.target as Node)){setShowDateList(false);setShowCalendar(false);}
      if(statusRef.current&&!statusRef.current.contains(e.target as Node))setShowStatusList(false);
      if(ctxRef.current&&!ctxRef.current.contains(e.target as Node))setCtx(null);
      if(searchRef.current&&!searchRef.current.contains(e.target as Node))setShowSearch(false);
    };
    document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);
  },[]);

  const showT=(m:string)=>{setToast(m);setTimeout(()=>setToast(null),2400);};

  const displayed=useCallback(()=>{
    return orders.filter(o=>{
      if(statusFilter==="Show Open Orders"&&o.status!=="Open")return false;
      if(statusFilter==="Show Closed Orders"&&o.status!=="Closed")return false;
      if(query.trim()){const q=query.toLowerCase();return o.partyName.toLowerCase().includes(q)||o.poNumber.toString().includes(q);}
      return true;
    });
  },[orders,statusFilter,query])();

  const handleDot=(e:React.MouseEvent,id:number)=>{
    e.stopPropagation();
    const r=(e.currentTarget as HTMLElement).getBoundingClientRect();
    setCtx({id,x:r.right-165,y:r.bottom+5});
  };

  const doCtx=(action:string)=>{
    const po=orders.find(o=>o.id===ctx?.id);setCtx(null);if(!po)return;
    if(action==="edit")onEdit(po);
    if(action==="history")showT(`Edit history for PO #${po.poNumber}`);
    if(action==="duplicate"){
      onDuplicate(po);
      return;
    }
    if(action==="delete"){setOrders(p=>p.filter(o=>o.id!==po.id));showT(`PO #${po.poNumber} deleted`);}
  };

  const dateBtnLabel=()=>dateFilter==="Custom"&&customFrom&&customTo?`${fmtShort(customFrom)} - ${fmtShort(customTo)}`:dateFilter;

  return (
    <div className="pi-page po-list-page">
      <div className="po-list-header">
        <h1 className="pi-title">Purchase Orders</h1>
        <div className="po-list-header-right">
          <div className="po-settings-btn-wrap" style={{position:"relative"}}>
            <button className="btn-icon po-settings-icon" onClick={()=>setShowSettings(true)}><IC.Settings/><span className="red-dot"/></button>
          </div>
          <button className="btn-icon"><IC.Monitor/></button>
        </div>
      </div>

      <div className="po-toolbar">
        <div ref={searchRef} style={{position:"relative"}}>
          {showSearch
            ?<div className="po-search-expanded"><span className="po-search-icon-inner"><IC.Search/></span><input className="po-search-input" placeholder="Search by party or PO number..." value={query} onChange={e=>setQuery(e.target.value)} autoFocus/><button className="po-search-clear" onClick={()=>{setShowSearch(false);setQuery("");}}><IC.X/></button></div>
            :<button className="btn-icon" onClick={()=>setShowSearch(true)}><IC.Search/></button>
          }
        </div>

        <div className="po-filter-pill-wrap" ref={dateRef}>
          <button className="po-filter-pill" onClick={()=>{setShowCalendar(false);setShowDateList(v=>!v);}}>
            <IC.Calendar/> <span>{dateBtnLabel()}</span> <IC.Chevron/>
          </button>
          {showDateList&&!showCalendar&&(
            <div className="pi-dd po-dd">
              {DATE_OPTS.map(opt=>(
                <div key={opt} className={`pi-dd-item ${dateFilter===opt?"sel":""}`}
                  onClick={()=>{if(opt==="Custom"){setShowCalendar(true);setShowDateList(false);}else{setDateFilter(opt);setShowDateList(false);}}}>
                  {opt}
                </div>
              ))}
            </div>
          )}
          {showCalendar&&<CalendarPicker onApply={(f,t)=>{setCustomFrom(f);setCustomTo(t);setDateFilter("Custom");setShowCalendar(false);}} onCancel={()=>setShowCalendar(false)}/>}
        </div>

        <div className="po-filter-pill-wrap" ref={statusRef}>
          <button className="po-filter-pill" onClick={()=>setShowStatusList(v=>!v)}>
            <span>{statusFilter}</span> <IC.Chevron/>
          </button>
          {showStatusList&&(
            <div className="pi-dd po-dd">
              {STATUS_OPTS.map(opt=>(
                <div key={opt} className={`pi-dd-item ${statusFilter===opt?"sel":""}`} onClick={()=>{setStatusFilter(opt);setShowStatusList(false);}}>
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="btn-create-po" onClick={onCreateNew}>Create Purchase Order</button>
      </div>

      <div className="po-table-wrap">
        <table>
          <thead><tr>
            <th className="sortable">Date ↕</th>
            <th>Purchase Order Number</th>
            <th>Party Name</th>
            <th>Valid Till</th>
            <th>Amount</th>
            <th>Status</th>
            <th style={{width:44}}></th>
          </tr></thead>
          <tbody>
            {displayed.length===0
              ?<tr><td colSpan={7}><div className="pi-empty">No purchase orders found.</div></td></tr>
              :displayed.map(po=>(
                <tr key={po.id} className="pi-table-row" style={{cursor:"pointer"}} onClick={()=>onView(po)}>
                  <td>{fmtDate(new Date(po.date))}</td>
                  <td>{po.poNumber}</td>
                  <td>{po.partyName}</td>
                  <td>{po.validTill}</td>
                  <td className="td-amt">₹ {po.amount.toLocaleString("en-IN")}</td>
                  <td><span className={`po-status po-status--${po.status.toLowerCase()}`}>{po.status}</span></td>
                  <td onClick={e=>e.stopPropagation()}>
                    <button className="tdot-btn" onClick={e=>handleDot(e,po.id)}><IC.Dots/></button>
                    {ctx?.id===po.id&&(
                      <div ref={ctxRef} className="pi-ctx po-ctx" style={{top:ctx.y,left:ctx.x}}>
                        <div className="pi-dd-item" onClick={()=>doCtx("edit")}><IC.Edit/>Edit</div>
                        <div className="pi-dd-item" onClick={()=>doCtx("history")}><IC.History/>Edit History</div>
                        <div className="pi-dd-item" onClick={()=>doCtx("duplicate")}><IC.Copy/>Duplicate</div>
                        <div className="pi-dd-divider"/>
                        <div className="pi-dd-item danger" onClick={()=>doCtx("delete")}><IC.Trash/>Delete</div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {showSettings&&<POSettingsModal settings={settings} setSettings={setSettings} onClose={()=>setShowSettings(false)}/>}
      {toast&&<div className="pi-toast">{toast}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════ ROOT ══ */
export default function PurchaseOrdersModule() {
  const [page,setPage]=useState<POPage>("list");
  const [prevPage,setPrevPage]=useState<"create"|"edit">("create");
  const [editTarget,setEditTarget]=useState<PurchaseOrder|null>(null);
  const [viewTarget,setViewTarget]=useState<PurchaseOrder|null>(null);
  const [duplicateTarget,setDuplicateTarget]=useState<PurchaseOrder|null>(null);

  /* ── FIX 2: Start with empty array, load from backend ── */
  const [orders,setOrders]=useState<PurchaseOrder[]>([]);

  const [allParties,setAllParties]=useState<Party[]>([]);
  const [settings,setSettings]=useState<POSettings>({prefixEnabled:true,prefix:"",sequenceNumber:4,showItemImage:true,priceHistory:true});
  const [showSettings,setShowSettings]=useState(false);
  const [saveAndNewKey,setSaveAndNewKey]=useState(0);

  /* ── FIX 2: Fetch purchase orders on mount ── */
 useEffect(() => {
  api.get("/purchase-orders")
    .then((res: any) => {

      const list = res.data?.data ?? res.data;

     const mapped = list.map((po: any) => ({
  id: po.id,
  date: po.poDate,
  poNumber: po.poNumber,

  partyName: po.party?.partyName || "",
  partyId: po.partyId,
  partyPhone: po.party?.mobileNumber || "",

  validTill: po.validTill ?? "-",
  amount: Number(po.totalAmount || 0),

  status:
    po.status === "OPEN"
      ? "Open"
      : po.status === "CLOSED"
      ? "Closed"
      : "Cancelled",

  items: (po.items || []).map((it:any)=>({
    id: it.productId,
    name: it.product?.name || "",
    hsn: it.hsnSac || "",
    qty: Number(it.quantity || 0),
    price: Number(it.price || 0),
    discount: Number(it.discount || 0),
    tax: Number(it.taxRate || 0)
  })),

  charges: (po.additionalCharges || []).map((c:any)=>({
    id: c.id,
    label: c.name,
    amount: Number(c.amount || 0),
    taxRate: "No Tax Applicable"
  })),

  discountEnabled:false,
  discountType:"%",
  discountVal:0,
  roundOff:false,
  roundOffDir:"+Add",
  roundOffVal:0
}));

      setOrders(mapped);

    })
    .catch((err) => {
      console.error("Failed to fetch purchase orders", err);
    });
}, []);

  /* ── Load parties from backend on mount ── */
  useEffect(()=>{
    getAllParties().then((res:any)=>{
      const list:any[]=res.data??res;
      setAllParties(list.map((p:any)=>({
        id:      p.id,
        name:    p.partyName??p.name??"",
        phone:   p.mobileNumber??p.phone??"",
        pan:     p.gstin??p.pan??"",
        balance: Number(p.balance??0),
      })));
    }).catch((err:any)=>console.error("Failed to load parties:",err));
  },[]);

  /* ── FIX 1: handleSaved — correct payload shape + re-fetch ── */
  const handleSaved = async (po: PurchaseOrder, isEdit: boolean) => {
    try {
      const payload = {
        partyId: po.partyId,
        poDate: po.date,
        validTill: po.validTill === "-" ? null : po.validTill,

        items: po.items.map(i => ({
          productId: i.id,
          quantity: i.qty,
          price: i.price,
          discount: i.discount,
          taxRate: i.tax,
          taxAmount: (i.qty * i.price * i.tax) / 100,
          total: (i.qty * i.price) - i.discount,
          hsnSac: i.hsn,
        })),

        additionalCharges: po.charges.map(c => ({
          name: c.label,
          amount: c.amount,
        })),

        totalAmount: po.amount,
        subTotal: po.items.reduce((s, i) => s + (i.qty * i.price - i.discount), 0),
        taxAmount: po.items.reduce((s, i) => s + (i.qty * i.price * i.tax / 100), 0),
        discountAmount: po.discountEnabled ? po.discountVal : 0,
        taxableAmount: po.amount,
        roundOff: po.roundOffVal,
      };

      if (isEdit) {
        await api.put(`/purchase-orders/${po.id}`, payload);
      } else {
        await api.post("/purchase-orders", payload);
      }

      /* Re-fetch full list so UI always matches DB */
      const res = await api.get("/purchase-orders");

const list = res.data?.data ?? res.data;

const mapped = list.map((po:any)=>({
  id: po.id,
  date: po.poDate,
  poNumber: po.poNumber,

  partyName: po.party?.partyName || "",
  partyId: po.partyId,
  partyPhone: po.party?.mobileNumber || "",

  validTill: po.validTill ?? "-",
  amount: Number(po.totalAmount || 0),

  status:
    po.status === "OPEN"
      ? "Open"
      : po.status === "CLOSED"
      ? "Closed"
      : "Cancelled",

  items: (po.items || []).map((it:any)=>({
    id: it.productId,
    name: it.product?.name || "",
    hsn: it.hsnSac || "",
    qty: Number(it.quantity || 0),
    price: Number(it.price || 0),
    discount: Number(it.discount || 0),
    tax: Number(it.taxRate || 0)
  })),

  charges: (po.additionalCharges || []).map((c:any)=>({
    id: c.id,
    label: c.name,
    amount: Number(c.amount || 0),
    taxRate: "No Tax Applicable"
  })),

  discountEnabled:false,
  discountType:"%",
  discountVal:0,
  roundOff:false,
  roundOffDir:"+Add",
  roundOffVal:0
}));

setOrders(mapped);

      if (!isEdit) {
        setSettings(s => ({ ...s, sequenceNumber: s.sequenceNumber + 1 }));
      }

      setEditTarget(null);
      setPage("list");
    } catch (err) {
      console.error("PO save failed", err);
    }
  };

  const handleSaveAndNew = async (po: PurchaseOrder) => {
    try {
      await handleSaved(po, false);
      setSaveAndNewKey(k => k + 1);
    } catch (err) {
      console.error(err);
    }
  };

  /* ── FIX 3: handleBillDelete — connect to backend ── */
  const handleBillDelete = async (po: PurchaseOrder) => {
    try {
      await api.delete(`/purchase-orders/${po.id}`);

      const res = await api.get("/purchase-orders");

const list = res.data?.data ?? res.data;

const mapped = list.map((po:any)=>({
  id: po.id,
  date: po.poDate,
  poNumber: po.poNumber,

  partyName: po.party?.partyName || "",
  partyId: po.partyId,
  partyPhone: po.party?.mobileNumber || "",

  validTill: po.validTill ?? "-",
  amount: Number(po.totalAmount || 0),

  status:
    po.status === "OPEN"
      ? "Open"
      : po.status === "CLOSED"
      ? "Closed"
      : "Cancelled",

  items: (po.items || []).map((it:any)=>({
    id: it.productId,
    name: it.product?.name || "",
    hsn: it.hsnSac || "",
    qty: Number(it.quantity || 0),
    price: Number(it.price || 0),
    discount: Number(it.discount || 0),
    tax: Number(it.taxRate || 0)
  })),

  charges: (po.additionalCharges || []).map((c:any)=>({
    id: c.id,
    label: c.name,
    amount: Number(c.amount || 0),
    taxRate: "No Tax Applicable"
  })),

  discountEnabled:false,
  discountType:"%",
  discountVal:0,
  roundOff:false,
  roundOffDir:"+Add",
  roundOffVal:0
}));
setOrders(mapped);

      setViewTarget(null);
      setPage("list");
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  /* ── FIX 2: handleBillDuplicate — local duplicate (Tally/Vyapar style) ── */
  const handleBillDuplicate = (po: PurchaseOrder) => {
    const dup: PurchaseOrder = {
      ...po,
      id: 0,
      poNumber: settings.sequenceNumber,
      date: new Date().toISOString().slice(0, 10),
    };
    setDuplicateTarget(dup);
    setViewTarget(null);
    setPage("duplicate");
  };

  /* Bill view edit action */
  const handleBillEdit = (po: PurchaseOrder) => {
    setEditTarget(po);
    setViewTarget(null);
    setPage("edit");
  };

  /* Bill view history action — toast shown inside POBillView */
  const handleBillHistory = (_po: PurchaseOrder) => {};

  /* Bill view page */
  if(page==="view" && viewTarget){
    const latest = orders.find(o=>o.id===viewTarget.id) || viewTarget;
    return <POBillView
      po={latest}
      orders={orders}
      onBack={()=>{ setViewTarget(null); setPage("list"); }}
      onEdit={handleBillEdit}
      onHistory={handleBillHistory}
      onDuplicate={handleBillDuplicate}
      onDelete={handleBillDelete}
    />;
  }

  if(page==="create"||page==="edit"||page==="duplicate"||page==="create-party"){
    const poMode = (page==="create-party" ? prevPage : page==="duplicate" ? "create" : page) as "create"|"edit";
    const dupData = page==="duplicate" ? duplicateTarget||undefined : undefined;
    const editData = poMode==="edit" ? editTarget||undefined : dupData;
    return <>
      <CreatePurchaseOrderPage
        key={page==="create" ? `create-${saveAndNewKey}` : page==="duplicate" ? `dup-${duplicateTarget?.id}` : "edit"}
        mode={poMode}
        editData={editData}
        seqNo={settings.sequenceNumber}
        onBack={()=>{setEditTarget(null);setDuplicateTarget(null);setPage("list");}}
        onSaved={handleSaved}
        onSaveAndNew={handleSaveAndNew}
        allParties={allParties}
        setAllParties={setAllParties}
        settings={settings}
        onOpenSettings={()=>setShowSettings(true)}
        onCreateParty={()=>{
          if(page!=="create-party") setPrevPage(poMode);
          setPage("create-party");
        }}
      />
      {showSettings&&<POSettingsModal settings={settings} setSettings={setSettings} onClose={()=>setShowSettings(false)}/>}
    </>;
  }

  return <PurchaseOrdersListPage
    orders={orders} setOrders={setOrders}
    settings={settings} setSettings={setSettings}
    onCreateNew={()=>setPage("create")}
    onEdit={po=>{setEditTarget(po);setPage("edit");}}
    onView={po=>{setViewTarget(po);setPage("view");}}
    onDuplicate={po=>{
      const dup:PurchaseOrder={...po,id:0,poNumber:settings.sequenceNumber,date:new Date().toISOString().slice(0,10)};
      setDuplicateTarget(dup);
      setPage("duplicate");
    }}/>;
}