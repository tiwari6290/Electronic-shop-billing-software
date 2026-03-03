import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Purchase.css";

/* ══════════════════════════════════════════
   ICONS
══════════════════════════════════════════ */
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
};

/* ══════════════════════════════════════════
   SHARED TYPES & DATA
══════════════════════════════════════════ */
type InvoiceStatus = "paid"|"unpaid"|"";
interface Invoice { id:number; date:string; invoiceNumber:number; partyName:string; dueIn:string; amount:number; status:InvoiceStatus; }
interface AppSettings { prefixEnabled:boolean; prefix:string; sequenceNumber:number; showItemImage:boolean; priceHistory:boolean; }
type DateFilter = "Today"|"Yesterday"|"This Week"|"Last Week"|"Last 7 Days"|"This Month"|"Previous Month"|"Last 30 Days"|"Last 365 Days"|"Custom";
type SearchType = "Invoice No. & Party name"|"Mobile Number";
interface Party { id:number; name:string; phone:string; pan:string; balance:number; }
interface InvoiceItem { id:number; name:string; hsn:string; qty:number; price:number; discount:number; tax:number; }
interface CatalogItem { id:number; name:string; code:string; stock:string; salesPrice:number; purchasePrice:number; }

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const fmtDate  = (d:Date) => d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
const fmtShort = (d:Date) => `${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)} ${d.getFullYear()}`;
const fmtMoney = (n:number) => n===0?"₹0":`₹${Math.abs(n).toLocaleString("en-IN")}`;

function getRange(f:DateFilter, from?:Date, to?:Date):[Date,Date] {
  const t=new Date(), s=new Date(t), e=new Date(t);
  switch(f){
    case "Today": break;
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

const SEED_INVOICES:Invoice[] = [
  {id:1,date:"2026-03-03",invoiceNumber:2,partyName:"Cash Sale",dueIn:"-",amount:0,status:""},
  {id:2,date:"2026-03-02",invoiceNumber:1,partyName:"anando",dueIn:"-",amount:38000,status:"unpaid"},
];

const PARTIES:Party[] = [
  {id:1,name:"Aditya",phone:"",pan:"",balance:0},
  {id:2,name:"anando",phone:"0987643211",pan:"ljjjmkpmp",balance:-65744},
  {id:3,name:"Cash Sale",phone:"",pan:"",balance:0},
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

/* ══════════════════════════════════════════
   CALENDAR PICKER
══════════════════════════════════════════ */
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
  const inR=(d:Date)=>{
    const e2=end||hov; if(!start||!e2)return false;
    const mn=start<e2?start:e2,mx=start<e2?e2:start; return d>mn&&d<mx;
  };
  const pick=(d:Date)=>{
    if(!start||(start&&end)){setStart(d);setEnd(null);}
    else{if(d<start){setEnd(start);setStart(d);}else setEnd(d);}
  };
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
        <tbody>
          {Array.from({length:cs.length/7},(_,r)=>(
            <tr key={r}>{cs.slice(r*7,r*7+7).map((d,i)=>{
              if(!d)return<td key={i}/>;
              const isSel=!!(start&&same(d,start))||!!(end&&same(d,end));
              const isStart=!!(start&&same(d,start));
              const isEnd=!!(end&&same(d,end));
              let cls="pi-cal-day";
              if(isStart&&end)cls+=" range-start";
              else if(isEnd)cls+=" range-end";
              else if(isSel)cls+=" selected";
              if(!isSel&&inR(d))cls+=" in-range";
              if(same(d,today)&&!isSel)cls+=" today";
              return<td key={i}><button className={cls} onClick={()=>pick(d)} onMouseEnter={()=>setHov(d)} onMouseLeave={()=>setHov(null)}>{d.getDate()}</button></td>;
            })}</tr>
          ))}
        </tbody>
      </table>
      <div className="pi-cal-footer">
        <button className="pi-cal-cancel" onClick={onCancel}>CANCEL</button>
        <button className="pi-cal-ok" onClick={()=>{if(start&&end)onApply(start,end);}}>OK</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   CREATE PURCHASE INVOICE PAGE
══════════════════════════════════════════ */
function CreatePurchaseInvoicePage({onBack,seqNo,onSaved}:{onBack:()=>void;seqNo:number;onSaved:(inv:Invoice)=>void}) {
  const [partyState,setPartyState]=useState<"empty"|"searching"|"selected">("empty");
  const [partySearch,setPartySearch]=useState("");
  const [allParties,setAllParties]=useState<Party[]>(PARTIES);
  const [selectedParty,setSelectedParty]=useState<Party|null>(null);
  const [invoiceItems,setInvoiceItems]=useState<InvoiceItem[]>([]);
  const [invNo]=useState(String(seqNo));
  const [invDate]=useState("03 Mar 2026");
  const [showDueDate,setShowDueDate]=useState(false);
  const [payTerms,setPayTerms]=useState("30");
  const [dueDate,setDueDate]=useState("03 Mar 2026");
  const [amtPaid,setAmtPaid]=useState(0);
  const [roundOff,setRoundOff]=useState(false);
  const [applyTCS,setApplyTCS]=useState(false);
  const [applyTDS,setApplyTDS]=useState(false);
  const [markPaid,setMarkPaid]=useState(false);
  const [showNotes,setShowNotes]=useState(false);
  const [notes,setNotes]=useState("");
  const [showCreateParty,setShowCreateParty]=useState(false);
  const [showAddItems,setShowAddItems]=useState(false);
  const [toast,setToast]=useState<string|null>(null);
  // Create Party form
  const [cpName,setCpName]=useState(""); const [cpPhone,setCpPhone]=useState("");
  const [cpShowAddr,setCpShowAddr]=useState(false); const [cpShowGST,setCpShowGST]=useState(false);
  const [cpAddr,setCpAddr]=useState(""); const [cpState,setCpState]=useState("");
  const [cpPin,setCpPin]=useState(""); const [cpCity,setCpCity]=useState("");
  const [cpSameShip,setCpSameShip]=useState(true); const [cpGSTIN,setCpGSTIN]=useState("");
  const [cpErr,setCpErr]=useState(false);
  // Add items
  const [itemSearch,setItemSearch]=useState("");
  const [addedIds,setAddedIds]=useState<number[]>([]);
  const partyRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const h=(e:MouseEvent)=>{
      if(partyRef.current&&!partyRef.current.contains(e.target as Node))
        if(partyState==="searching")setPartyState("empty");
    };
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[partyState]);
  const showT=(m:string)=>{setToast(m);setTimeout(()=>setToast(null),2400);};
  const subtotal=invoiceItems.reduce((s,i)=>s+(i.qty*i.price-i.discount),0);
  const totalTax=invoiceItems.reduce((s,i)=>s+(i.qty*i.price*i.tax/100),0);
  const totalAmt=subtotal+totalTax;
  const balance=totalAmt-amtPaid;
  const selectParty=(p:Party)=>{setSelectedParty(p);setPartyState("selected");setPartySearch("");};
  const filtParties=allParties.filter(p=>p.name.toLowerCase().includes(partySearch.toLowerCase()));
  const filtCatalog=CATALOG.filter(c=>c.name.toLowerCase().includes(itemSearch.toLowerCase())||c.code.toLowerCase().includes(itemSearch.toLowerCase()));
  const saveParty=()=>{
    if(!cpName.trim()){setCpErr(true);return;}
    const np:Party={id:Date.now(),name:cpName,phone:cpPhone,pan:"",balance:0};
    setAllParties(p=>[...p,np]); selectParty(np); setShowCreateParty(false);
    setCpName("");setCpPhone("");setCpShowAddr(false);setCpShowGST(false);setCpErr(false);setCpAddr("");setCpState("");setCpPin("");setCpCity("");setCpGSTIN("");
    showT(`Party "${cpName}" created`);
  };
  const addItem=(cat:CatalogItem)=>{
    if(addedIds.includes(cat.id))return;
    setAddedIds(p=>[...p,cat.id]);
    setInvoiceItems(p=>[...p,{id:cat.id,name:cat.name,hsn:"",qty:1,price:cat.purchasePrice||cat.salesPrice,discount:0,tax:0}]);
  };
  const addToBill=()=>{
    setShowAddItems(false);setItemSearch("");
    if(addedIds.length>0)showT(`${addedIds.length} item(s) added to bill`);
    setAddedIds([]);
  };
  const removeItem=(id:number)=>{ setInvoiceItems(p=>p.filter(i=>i.id!==id)); setAddedIds(p=>p.filter(x=>x!==id)); };
  const updItem=(id:number,f:keyof InvoiceItem,v:string)=>setInvoiceItems(p=>p.map(i=>i.id===id?{...i,[f]:isNaN(Number(v))?v:Number(v)}:i));
  const handleSave=()=>{
    if(!selectedParty){showT("Please select a party first");return;}
    const newInv:Invoice={id:Date.now(),date:new Date().toISOString().slice(0,10),invoiceNumber:Number(invNo),partyName:selectedParty.name,dueIn:showDueDate?`${payTerms} days`:"-",amount:totalAmt,status:markPaid?"paid":totalAmt>0&&amtPaid<totalAmt?"unpaid":""};
    onSaved(newInv);
  };
  return (
    <div className="cpi-page">
      {/* Topbar */}
      <div className="cpi-topbar">
        <button className="cpi-back-btn" onClick={onBack}><IC.Back/> Create Purchase Invoice</button>
        <div className="cpi-topbar-right">
          <button className="btn-upload"><IC.Upload/> Upload using Phone</button>
          <button className="btn-topbar-settings"><IC.Settings/> Settings<span className="red-dot"/></button>
          <button className="btn-save-new" onClick={()=>showT("Saved & new invoice")}>Save &amp; New</button>
          <button className="btn-save-top" onClick={handleSave}>Save</button>
        </div>
      </div>

      <div className="cpi-body">
        {/* LEFT */}
        <div className="cpi-left">
          {/* Bill From */}
          <div style={{marginBottom:16}}>
            <div className="section-label">Bill From</div>
            {partyState==="empty"&&(
              <div ref={partyRef} className="party-add-box" onClick={()=>setPartyState("searching")}>
                <div className="party-add-inner"><IC.Plus/> + Add Party</div>
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
                      <span className={`party-dd-bal ${p.balance<0?"neg":""}`}>
                        {fmtMoney(p.balance)}{p.balance<0&&<IC.ArrowUp/>}
                      </span>
                    </div>
                  ))}
                  <div className="party-dd-create" onClick={()=>{setShowCreateParty(true);setPartyState("empty");}}><IC.Plus/> + Create Party</div>
                </div>
              </div>
            )}
          </div>

          {/* Party info */}
          {partyState==="selected"&&selectedParty&&(
            <div className="party-info-section">
              <div className="party-info-pane">
                <div className="party-info-pane-header"><span className="pane-label">Bill From</span><button className="btn-change" onClick={()=>setPartyState("searching")}>Change Party</button></div>
                <div className="party-info-name">{selectedParty.name}</div>
                {selectedParty.phone&&<div className="party-info-line">Phone Number: {selectedParty.phone}</div>}
                {selectedParty.pan&&<div className="party-info-line">PAN Number: {selectedParty.pan}</div>}
              </div>
              <div className="party-info-pane">
                <div className="party-info-pane-header"><span className="pane-label">Ship From</span><button className="btn-change" onClick={()=>showT("Change shipping address")}>Change Shipping Address</button></div>
                <div className="party-info-name">{selectedParty.name}</div>
                {selectedParty.phone&&<div className="party-info-line">Phone Number: {selectedParty.phone}</div>}
              </div>
            </div>
          )}

          {/* Items table */}
          <div className="items-table-wrap">
            <table className="items-table">
              <thead><tr>
                <th style={{width:36}}>No</th>
                <th>Items / Services</th>
                <th style={{width:90}}>HSN / SAC</th>
                <th style={{width:65}}>Qty</th>
                <th style={{width:110}}>Price/Item (₹)</th>
                <th style={{width:90}}>Discount</th>
                <th style={{width:70}}>Tax</th>
                <th style={{width:100}}>Amount (₹)</th>
                <th style={{width:34}}></th>
              </tr></thead>
              <tbody>
                {invoiceItems.map((item,idx)=>(
                  <tr key={item.id}>
                    <td>{idx+1}</td>
                    <td style={{fontWeight:600,color:"#1a2332"}}>{item.name}</td>
                    <td><input className="qty-input" style={{width:78}} value={item.hsn} onChange={e=>updItem(item.id,"hsn",e.target.value)}/></td>
                    <td><input className="qty-input" type="number" value={item.qty} onChange={e=>updItem(item.id,"qty",e.target.value)}/></td>
                    <td><input className="qty-input" style={{width:90}} type="number" value={item.price} onChange={e=>updItem(item.id,"price",e.target.value)}/></td>
                    <td><input className="qty-input" style={{width:78}} type="number" value={item.discount} onChange={e=>updItem(item.id,"discount",e.target.value)}/></td>
                    <td><input className="qty-input" type="number" value={item.tax} onChange={e=>updItem(item.id,"tax",e.target.value)}/></td>
                    <td style={{fontWeight:700}}>₹{(item.qty*item.price-item.discount).toLocaleString("en-IN")}</td>
                    <td><button className="item-row-delete" onClick={()=>removeItem(item.id)}><IC.Trash/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="add-item-row">
              <button className="btn-add-item" onClick={()=>setShowAddItems(true)}><IC.Plus/> + Add Item</button>
              <div style={{marginLeft:"auto"}}>
                <div className="scan-barcode-area" onClick={()=>showT("Scan barcode")}><IC.Barcode/> Scan Barcode</div>
              </div>
            </div>
            <div className="subtotal-row">
              <span className="sub-label">SUBTOTAL</span>
              <span className="sub-cell">{fmtMoney(subtotal)}</span>
              <span className="sub-cell">{fmtMoney(totalTax)}</span>
              <span className="sub-cell">{fmtMoney(totalAmt)}</span>
            </div>
          </div>

          {/* Bottom */}
          <div className="bottom-section">
            <div className="notes-box">
              {!showNotes
                ?<button className="btn-add-notes" onClick={()=>setShowNotes(true)}><IC.Plus/> + Add Notes</button>
                :<div style={{marginBottom:10}}><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Add notes..." style={{width:"100%",border:"1.5px solid #dde1e9",borderRadius:7,padding:"7px 10px",fontSize:12,outline:"none",resize:"vertical",minHeight:50,fontFamily:"inherit"}}/></div>
              }
              <div className="tc-label">Terms and Conditions<IC.Gear/></div>
              <div className="tc-list">1. Goods once sold will not be taken back or exchanged<br/>2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only</div>
            </div>
            <div className="summary-box">
              <button className="btn-add-charges" onClick={()=>showT("Additional charges")}>+ Add Additional Charges</button>
              <div className="summary-row"><span className="summary-label">Taxable Amount</span><span className="summary-value">{fmtMoney(subtotal)}</span></div>
              <button className="btn-add-discount" onClick={()=>showT("Add discount")}>+ Add Discount</button>
              <div className="summary-row"><span/><span className="summary-value" style={{color:"#ef4444"}}>{totalTax>0?`-₹${totalTax.toLocaleString("en-IN")}`:"-₹0"}</span></div>
              <label className="checkbox-row"><input type="checkbox" checked={applyTCS} onChange={e=>setApplyTCS(e.target.checked)}/>Apply TCS</label>
              <div className="round-off-row">
                <label><input type="checkbox" checked={roundOff} onChange={e=>setRoundOff(e.target.checked)} style={{cursor:"pointer",accentColor:"#4361ee"}}/><span style={{marginLeft:7,fontSize:12,color:"#556070"}}>Auto Round Off</span></label>
                <div className="round-off-right"><select><option>+ Add</option><option>- Sub</option></select><input type="number" defaultValue={0} readOnly style={{color:"#7c8fa6"}}/></div>
              </div>
              <div className="summary-row" style={{fontWeight:800,fontSize:14,color:"#1a2332"}}>
                <span>Total Amount</span>
                <button className="enter-payment-btn">Enter Payment amount</button>
              </div>
              <div className="mark-paid-row">
                <label>Mark as fully paid<input type="checkbox" checked={markPaid} onChange={e=>{setMarkPaid(e.target.checked);if(e.target.checked)setAmtPaid(totalAmt);}} style={{marginLeft:6}}/></label>
              </div>
              <div className="payment-input-row">
                <label>Amount Paid</label>
                <div className="payment-input-wrap">
                  <div className="rupee-input"><span>₹</span><input type="number" value={amtPaid} onChange={e=>setAmtPaid(Number(e.target.value))}/></div>
                  <select><option>Cash</option><option>Bank</option><option>UPI</option></select>
                </div>
              </div>
              <label className="checkbox-row"><input type="checkbox" checked={applyTDS} onChange={e=>setApplyTDS(e.target.checked)}/>Apply TDS</label>
              <div className="summary-row balance-row"><span>Balance Amount</span><span>{fmtMoney(balance)}</span></div>
              <div className="authorized-row">Authorized signatory for <strong>scratchweb.solutions</strong></div>
              <div className="sig-box"/>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="cpi-right">
          <div className="right-row">
            <div className="right-field" style={{flex:"0 0 80px"}}><label>Purchase Inv No.</label><input value={invNo} readOnly/></div>
            <div className="right-field"><label>Purchase Inv Date:</label><div className="date-input-wrap"><input value={invDate} readOnly/><span className="cal-icon"><IC.Calendar/></span></div></div>
            <div className="right-field"><label>Original Inv No.</label><input placeholder=""/></div>
          </div>
          {!showDueDate
            ?<button className="add-due-date-btn" onClick={()=>setShowDueDate(true)}><IC.Plus/> + Add Due Date</button>
            :<div className="due-date-row">
                <div className="right-field" style={{flex:"0 0 120px"}}>
                  <label>Payment Terms:</label>
                  <div className="date-input-wrap"><input value={payTerms} onChange={e=>setPayTerms(e.target.value)} style={{width:46}}/><span className="days-tag">days</span></div>
                </div>
                <div className="right-field"><label>Due Date:</label><div className="date-input-wrap"><input value={dueDate} onChange={e=>setDueDate(e.target.value)}/><span className="cal-icon"><IC.Calendar/></span></div></div>
                <button className="due-date-remove" onClick={()=>setShowDueDate(false)} style={{marginTop:18}}><IC.X/></button>
              </div>
          }
          <div className="extra-fields-row">
            {[["E-Way Bill No.",true],["Challan No.:",false],["Financed By:",false],["Salesman:",false],["Email ID:",false]].map(([lbl,info])=>(
              <div key={lbl as string} className="extra-field">
                <label>{lbl as string}{info&&<IC.Info/>}</label>
                <input/>
              </div>
            ))}
          </div>
          <div className="extra-fields-row" style={{gridTemplateColumns:"1fr"}}>
            <div className="extra-field"><label>Warranty Period:</label><input/></div>
          </div>
        </div>
      </div>

      {/* Create Party Modal */}
      {showCreateParty&&(
        <div className="modal-overlay" onClick={()=>setShowCreateParty(false)}>
          <div className="modal create-party-modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-head"><span className="modal-title">Create New Party</span><button className="modal-close" onClick={()=>setShowCreateParty(false)}><IC.X/></button></div>
            <div className="modal-body">
              <div className="form-group">
                <label>Party Name <span className="req">*</span></label>
                <input placeholder="Enter name" value={cpName} className={cpErr?"error":""} onChange={e=>{setCpName(e.target.value);setCpErr(false);}}/>
                {cpErr&&<div className="error-msg">This field is mandatory</div>}
              </div>
              <div className="form-group"><label>Mobile Number</label><input placeholder="Enter Mobile Number" value={cpPhone} onChange={e=>setCpPhone(e.target.value)}/></div>
              {!cpShowAddr
                ?<button className="btn-optional" onClick={()=>setCpShowAddr(true)}><IC.Plus/> + Add Address (Optional)</button>
                :<div className="optional-section">
                  <div className="optional-section-header"><span className="optional-section-label">Address (Optional)</span><button className="btn-remove-section" onClick={()=>setCpShowAddr(false)}>Remove</button></div>
                  <div className="form-group"><label>BILLING ADDRESS <span className="req">*</span></label><textarea placeholder="Enter billing address" value={cpAddr} onChange={e=>setCpAddr(e.target.value)}/></div>
                  <div className="form-row">
                    <div className="form-group"><label>STATE</label><input placeholder="Enter State" value={cpState} onChange={e=>setCpState(e.target.value)}/></div>
                    <div className="form-group"><label>PINCODE</label><input placeholder="Enter Pincode" value={cpPin} onChange={e=>setCpPin(e.target.value)}/></div>
                  </div>
                  <div className="form-group"><label>CITY</label><input placeholder="Enter City" value={cpCity} onChange={e=>setCpCity(e.target.value)}/></div>
                  <label className="ship-checkbox"><input type="checkbox" checked={cpSameShip} onChange={e=>setCpSameShip(e.target.checked)}/>Shipping address same as billing address</label>
                </div>
              }
              {!cpShowGST
                ?<button className="btn-optional" onClick={()=>setCpShowGST(true)}><IC.Plus/> + Add GSTIN (Optional)</button>
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

      {/* Add Items Modal */}
      {showAddItems&&(
        <div className="modal-overlay" onClick={()=>{setShowAddItems(false);setItemSearch("");setAddedIds([]);}}>
          <div className="modal add-items-modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-head"><span className="modal-title">Add Items to Bill</span><button className="modal-close" onClick={()=>{setShowAddItems(false);setItemSearch("");setAddedIds([]);}}><IC.X/></button></div>
            <div className="modal-body">
              <div className="items-search-bar">
                <div className="items-search-input-wrap"><IC.Search/><input placeholder="Search by Item / Serial no./ HSN code/ SKU/ Custom Field / Category" value={itemSearch} onChange={e=>setItemSearch(e.target.value)} autoFocus/></div>
                <button className="items-barcode-btn" onClick={()=>showT("Scan barcode")}><IC.Barcode/></button>
                <select className="items-cat-select"><option>Select Category</option><option>Electronics</option><option>Software</option></select>
                <button className="btn-create-item" onClick={()=>showT("Create new item")}>Create New Item</button>
              </div>
              <div className="items-table-scroll">
                <table className="items-list-table">
                  <thead><tr><th>Item Name</th><th style={{width:80}}>Item Code</th><th style={{width:90}}>Stock</th><th style={{width:100}}>Sales Price</th><th style={{width:120}}>Purchase Price</th><th style={{width:90}}>Quantity</th></tr></thead>
                  <tbody>
                    {filtCatalog.map(c=>(
                      <tr key={c.id}>
                        <td className="item-name-cell">{c.name}</td>
                        <td>{c.code}</td>
                        <td>{c.stock}</td>
                        <td>{c.salesPrice>0?`₹${c.salesPrice.toLocaleString("en-IN")}`:""}</td>
                        <td>{c.purchasePrice>0?`₹${c.purchasePrice.toLocaleString("en-IN")}`:""}</td>
                        <td><button className={`btn-item-add ${addedIds.includes(c.id)?"added":""}`} onClick={()=>addItem(c)}>{addedIds.includes(c.id)?"✓ Added":"+ Add"}</button></td>
                      </tr>
                    ))}
                    {filtCatalog.length===0&&<tr><td colSpan={6} style={{textAlign:"center",padding:"28px",color:"#9aabbd"}}>No items found</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="items-modal-footer">
                <div>{addedIds.length>0&&<span className="items-selected-label">{addedIds.length} item(s) selected</span>}</div>
                <div className="items-modal-footer-right">
                  <button className="modal-btn-cancel" onClick={()=>{setShowAddItems(false);setItemSearch("");setAddedIds([]);}}>Cancel (ESC)</button>
                  <button className="modal-btn-save" onClick={addToBill}>Add to Bill (F7)</button>
                </div>
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
function PurchaseInvoicesPage({invoices,setInvoices,settings,setSettings,onCreateNew}:{invoices:Invoice[];setInvoices:React.Dispatch<React.SetStateAction<Invoice[]>>;settings:AppSettings;setSettings:React.Dispatch<React.SetStateAction<AppSettings>>;onCreateNew:()=>void}) {
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
  const rows=useCallback(()=>{
    const [from,to]=getRange(dateFilter,customFrom||undefined,customTo||undefined);
    return invoices.filter(inv=>{
      const d=new Date(inv.date);d.setHours(12);
      if(d<from||d>to)return false;
      if(activeCard==="paid"&&inv.status!=="paid")return false;
      if(activeCard==="unpaid"&&inv.status!=="unpaid")return false;
      if(query.trim()){const q=query.toLowerCase();return inv.partyName.toLowerCase().includes(q)||inv.invoiceNumber.toString().includes(q);}
      return true;
    });
  },[invoices,activeCard,dateFilter,customFrom,customTo,query]);
  const displayed=rows();
  const totalAll=invoices.reduce((s,i)=>s+i.amount,0);
  const totalPaid=invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+i.amount,0);
  const totalUnpaid=invoices.filter(i=>i.status==="unpaid").reduce((s,i)=>s+i.amount,0);
  const handleDot=(e:React.MouseEvent,id:number)=>{e.stopPropagation();const r=(e.currentTarget as HTMLElement).getBoundingClientRect();setCtx({id,x:r.right-173,y:r.bottom+5});};
  const doCtx=(action:string)=>{
    const inv=invoices.find(i=>i.id===ctx?.id);setCtx(null);if(!inv)return;
    if(action==="edit")showT(`Editing Invoice #${inv.invoiceNumber}`);
    if(action==="history")showT(`Edit history for Invoice #${inv.invoiceNumber}`);
    if(action==="duplicate"){const n:Invoice={...inv,id:Date.now(),invoiceNumber:settings.sequenceNumber,date:new Date().toISOString().slice(0,10)};setInvoices(p=>[n,...p]);setSettings(s=>({...s,sequenceNumber:s.sequenceNumber+1}));showT(`Invoice #${inv.invoiceNumber} duplicated`);}
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
            {showReports&&(
              <div className="pi-dd pi-reports-dd">
                <div className="pi-dd-item" onClick={()=>{showT("Opening GSTR 2 (Purchase)…");setShowReports(false);}}><IC.Report/> GSTR 2 (Purchase)</div>
                <div className="pi-dd-item" onClick={()=>{showT("Opening DayBook…");setShowReports(false);}}><IC.Note/> DayBook</div>
              </div>
            )}
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
            {showSType&&(
              <div className="pi-dd pi-stype-dd">
                {(["Invoice No. & Party name","Mobile Number"] as SearchType[]).map(t=>(
                  <div key={t} className={`pi-dd-item ${searchType===t?"sel":""}`} onClick={()=>{setSearchType(t);setShowSType(false);}}>{t}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pi-date-wrap" ref={dateRef}>
          <button className="pi-date-btn" onClick={()=>{setShowCalendar(false);setShowDateList(v=>!v);}}><IC.Calendar/> {dateBtnLabel()} <span className="arr">▾</span></button>
          {showDateList&&!showCalendar&&(
            <div className="pi-dd pi-date-list-dd">
              {DATE_OPTS.map(opt=>(
                <div key={opt} className={`pi-dd-item ${dateFilter===opt?"sel":""}`} onClick={()=>{if(opt==="Custom"){setShowCalendar(true);setShowDateList(false);}else{setDateFilter(opt);setShowDateList(false);}}}>{opt}</div>
              ))}
            </div>
          )}
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

      {ctx&&(
        <div ref={ctxRef} className="pi-ctx" style={{top:ctx.y,left:ctx.x}}>
          <div className="pi-dd-item" onClick={()=>doCtx("edit")}><IC.Edit/>Edit</div>
          <div className="pi-dd-item" onClick={()=>doCtx("history")}><IC.History/>Edit History</div>
          <div className="pi-dd-item" onClick={()=>doCtx("duplicate")}><IC.Copy/>Duplicate</div>
          <div className="pi-dd-item" onClick={()=>doCtx("debit")}><IC.Note/>Issue Debit Note</div>
          <div className="pi-dd-divider"/>
          <div className="pi-dd-item danger" onClick={()=>doCtx("delete")}><IC.Trash/>Delete</div>
        </div>
      )}

      {showSettings&&(
        <div className="pi-overlay" onClick={()=>setShowSettings(false)}>
          <div className="pi-modal" onClick={e=>e.stopPropagation()}>
            <div className="pi-modal-head"><span className="pi-modal-title">Quick Purchase Invoice Settings</span><button className="pi-modal-close" onClick={()=>setShowSettings(false)}><IC.X/></button></div>
            {[{key:"prefixEnabled",label:"Purchase Invoice Prefix & Sequence Number",desc:"Add your custom prefix & sequence for Purchase Invoice Numbering"},{key:"showItemImage",label:"Show Item Image on Invoice",desc:"This will apply to all vouchers except for Payment In and Payment Out"},{key:"priceHistory",label:"Price History",desc:"Show last 5 sales / purchase prices of the item for the selected party in invoice",badge:true}].map(s=>(
              <div key={s.key} className="pi-s-block">
                <div className="pi-s-top">
                  <span className="pi-s-name">{s.label}{s.badge&&<span className="badge-new">New</span>}</span>
                  <label className="toggle"><input type="checkbox" checked={(settings as any)[s.key]} onChange={e=>setSettings(p=>({...p,[s.key]:e.target.checked}))}/><span className="toggle-slider"/></label>
                </div>
                <p className="pi-s-desc">{s.desc}</p>
                {s.key==="prefixEnabled"&&settings.prefixEnabled&&(
                  <>
                    <div className="pi-s-fields">
                      <div><label>Prefix</label><input placeholder="Prefix" value={settings.prefix} onChange={e=>setSettings(p=>({...p,prefix:e.target.value}))}/></div>
                      <div><label>Sequence Number</label><input type="number" value={settings.sequenceNumber} onChange={e=>setSettings(p=>({...p,sequenceNumber:Number(e.target.value)}))}/></div>
                    </div>
                    <p className="pi-s-note">Purchase Invoice Number: {settings.prefix}{settings.sequenceNumber}</p>
                  </>
                )}
              </div>
            ))}
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

/* ══════════════════════════════════════════
   ROOT — manages navigation between pages
══════════════════════════════════════════ */
export default function PurchaseModule() {
  const [page, setPage] = useState<"list"|"create">("list");
  const [invoices, setInvoices] = useState<Invoice[]>(SEED_INVOICES);
  const [settings, setSettings] = useState<AppSettings>({
    prefixEnabled:true, prefix:"", sequenceNumber:3, showItemImage:true, priceHistory:true,
  });

  const handleSaved = (inv: Invoice) => {
    setInvoices(p => [inv, ...p]);
    setSettings(s => ({...s, sequenceNumber: s.sequenceNumber + 1}));
    setPage("list");
  };

  if (page === "create") {
    return (
      <CreatePurchaseInvoicePage
        seqNo={settings.sequenceNumber}
        onBack={() => setPage("list")}
        onSaved={handleSaved}
      />
    );
  }

  return (
    <PurchaseInvoicesPage
      invoices={invoices}
      setInvoices={setInvoices}
      settings={settings}
      setSettings={setSettings}
      onCreateNew={() => setPage("create")}
    />
  );
}