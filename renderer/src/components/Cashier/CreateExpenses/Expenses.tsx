import React, { useState, useEffect, useRef } from "react";
import "./Expenses.css";

const IC = {
  ChevronL:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronR:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Chevron: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Settings:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Monitor: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  Report:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Search:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Calendar:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Dots:    ()=><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>,
  X:       ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Edit:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  Plus:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Back:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  Star:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Mail:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Download:()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Print:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
};

/* ── shared topbar back-arrow style — matches reference UI ── */
const TopbarBackBtn = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      background: "none", border: "none", cursor: "pointer",
      padding: 4, display: "flex", alignItems: "center",
      color: "#344054", flexShrink: 0,
    }}
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  </button>
);

const TopbarTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{
    margin: 0, fontSize: 18, fontWeight: 700,
    color: "#1d2939", whiteSpace: "nowrap", fontFamily: "inherit",
  }}>
    {children}
  </h2>
);

const TopbarWrap = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 24px", height: 56, background: "#fff",
    borderBottom: "1px solid #e4e7ec",
    position: "sticky", top: 0, zIndex: 100, flexShrink: 0,
  }}>
    {children}
  </div>
);

type ExpPage = "list"|"create"|"edit"|"txn-report"|"cat-report"|"detail";
interface ExpenseItem { id:number;name:string;hsn:string;price:number;qty:number;discount:number;taxRate:number;itemType:"product"|"service";unit:string;gstRate:string;itc:string; }
interface Party       { id:number;name:string;phone:string;pan:string; }
interface Expense     { id:number;date:string;expNumber:number;category:string;partyName:string;amount:number;paymentMode:string;items:ExpenseItem[];note:string;withGst:boolean;originalInvoiceNumber:string; }
interface ExpSettings { prefixEnabled:boolean;prefix:string;sequenceNumber:number;showItemImage:boolean; }
interface AddlCharge  { id:number;label:string;amount:string;taxRate:string; }
type DateFilter="Today"|"Yesterday"|"This Week"|"Last Week"|"Last 7 Days"|"This Month"|"Previous Month"|"Last 30 Days"|"Last 365 Days"|"Custom";

const DATE_OPTS:DateFilter[]=["Today","Yesterday","This Week","Last Week","Last 7 Days","This Month","Previous Month","Last 30 Days","Last 365 Days","Custom"];
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const CATEGORIES=["Office Supplies","Travel","Food & Entertainment","Utilities","Rent","Salary","Marketing","Maintenance","Other"];
const PAYMENT_MODES=["Cash","Card","UPI","Bank Transfer","Cheque"];
const fmtDate=(d:Date)=>d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
const fmtShort=(d:Date)=>`${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)} ${d.getFullYear()}`;

function getRange(f:DateFilter,fr?:Date,to?:Date):[Date,Date]{
  const t=new Date(),s=new Date(t),e=new Date(t);
  switch(f){
    case "Yesterday":s.setDate(t.getDate()-1);e.setDate(t.getDate()-1);break;
    case "This Week":s.setDate(t.getDate()-t.getDay());break;
    case "Last Week":{const d=t.getDay();s.setDate(t.getDate()-d-7);e.setDate(t.getDate()-d-1);break;}
    case "Last 7 Days":s.setDate(t.getDate()-6);break;
    case "This Month":s.setDate(1);break;
    case "Previous Month":s.setMonth(t.getMonth()-1,1);e.setDate(0);break;
    case "Last 30 Days":s.setDate(t.getDate()-29);break;
    case "Last 365 Days":s.setFullYear(t.getFullYear()-1);break;
    case "Custom":if(fr&&to)return[fr,to];break;
  }
  s.setHours(0,0,0,0);e.setHours(23,59,59,999);return[s,e];
}

const SEED_CATALOG:ExpenseItem[]=[{id:1,name:"abc",hsn:"2341",price:13221,qty:1,discount:0,taxRate:0,itemType:"product",unit:"Ampoule(AMP)",gstRate:"None",itc:"Eligible"}];
const PARTIES:Party[]=[
  {id:1,name:"abv",phone:"",pan:""},{id:2,name:"Aditya",phone:"",pan:""},
  {id:3,name:"anando",phone:"0987643211",pan:"ljjjmkpmp"},{id:4,name:"Cash Sale",phone:"9555780835",pan:""},
  {id:5,name:"eghwh",phone:"",pan:""},{id:6,name:"MONDIAL ELECTRONIC",phone:"",pan:""},
  {id:7,name:"ram ram",phone:"",pan:""},{id:8,name:"Ramakant Pandit",phone:"",pan:""},
];

/* ── CalendarPicker ── */
function CalendarPicker({onSelect,onCancel}:{onSelect:(d:Date)=>void;onCancel:()=>void}){
  const today=new Date();
  const [vy,setVy]=useState(today.getFullYear());
  const [vm,setVm]=useState(today.getMonth());
  const prev=()=>{if(vm===0){setVm(11);setVy(y=>y-1);}else setVm(m=>m-1);};
  const next=()=>{if(vm===11){setVm(0);setVy(y=>y+1);}else setVm(m=>m+1);};
  const same=(a:Date,b:Date)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
  const cs=(()=>{const f=new Date(vy,vm,1),l=new Date(vy,vm+1,0),a:(Date|null)[]=[];for(let i=0;i<f.getDay();i++)a.push(null);for(let d=1;d<=l.getDate();d++)a.push(new Date(vy,vm,d));while(a.length%7!==0)a.push(null);return a;})();
  return (
    <div className="pi-cal-overlay" style={{width:260}}>
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
                if(!d) return <td key={i}/>;
                return <td key={i}><button className={`pi-cal-day${same(d,today)?" today":""}`} onClick={()=>onSelect(d)}>{d.getDate()}</button></td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pi-cal-footer"><button className="pi-cal-cancel" onClick={onCancel}>CANCEL</button></div>
    </div>
  );
}

/* ── SettingsModal ── */
function SettingsModal({settings,setSettings,onClose}:{settings:ExpSettings;setSettings:React.Dispatch<React.SetStateAction<ExpSettings>>;onClose:()=>void}){
  const [local,setLocal]=useState<ExpSettings>(settings);
  return (
    <div className="pi-overlay" onClick={onClose}>
      <div className="pi-modal exp-settings-modal" onClick={e=>e.stopPropagation()}>
        <div className="pi-modal-head">
          <span className="pi-modal-title">Quick Expense Settings</span>
          <button className="pi-modal-close" onClick={onClose}><IC.X/></button>
        </div>
        <div className="pi-s-block">
          <div className="pi-s-top">
            <div>
              <span className="pi-s-name">Expense Prefix &amp; Sequence Number</span>
              <p className="pi-s-desc">Add your custom prefix &amp; sequence for Expense Numbering</p>
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
              <p className="pi-s-note">Expense Number: {local.prefix}{local.sequenceNumber}</p>
            </>
          )}
        </div>
        <div className="pi-s-block">
          <div className="pi-s-top">
            <div>
              <span className="pi-s-name">Show Item Image on Invoice</span>
              <p className="pi-s-desc">This will apply to all vouchers except Payment In and Payment Out</p>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={local.showItemImage} onChange={e=>setLocal(p=>({...p,showItemImage:e.target.checked}))}/>
              <span className="toggle-slider"/>
            </label>
          </div>
        </div>
        <div className="pi-modal-foot">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          {/* FIX: Save updates sequenceNumber in parent settings immediately */}
          <button className="btn-save" onClick={()=>{setSettings(local);onClose();}}>Save</button>
        </div>
      </div>
    </div>
  );
}

/* ══ EXPENSE FORM PAGE (Create + Edit) ══ */
function ExpenseFormPage({seqNo,settings,setSettings,onBack,onSaved,isEdit=false,editData}:{
  seqNo:number;
  settings:ExpSettings;
  setSettings:React.Dispatch<React.SetStateAction<ExpSettings>>;
  onBack:()=>void;
  onSaved:(e:Expense)=>void;
  isEdit?:boolean;
  editData?:Expense;
}){
  const [withGst,  setWithGst  ]=useState(isEdit&&editData?editData.withGst:false);
  const [category, setCategory ]=useState(isEdit&&editData?editData.category:"");
  // FIX: expNo is always derived from seqNo (which comes from settings.sequenceNumber)
  // For edit mode it uses the existing expNumber; for create it uses the live seqNo.
  const expNo = isEdit && editData ? String(editData.expNumber) : String(seqNo);
  const [origInv,  setOrigInv  ]=useState(isEdit&&editData?editData.originalInvoiceNumber:"");
  const [selDate,  setSelDate  ]=useState<Date>(isEdit&&editData?new Date(editData.date):new Date());
  const [showCal,  setShowCal  ]=useState(false);
  const [payMode,  setPayMode  ]=useState(isEdit&&editData?editData.paymentMode:"");
  const [note,     setNote     ]=useState(isEdit&&editData?editData.note:"");

  const initParty=isEdit&&editData?PARTIES.find(p=>p.name===editData.partyName)||null:null;
  const [selParty,    setSelParty   ]=useState<Party|null>(initParty);
  const [partyQ,      setPartyQ     ]=useState("");
  const [showPartyDd, setShowPartyDd]=useState(false);
  const partyRef=useRef<HTMLDivElement>(null);

  const [items,   setItems  ]=useState<ExpenseItem[]>(isEdit&&editData?editData.items:[]);
  const [catalog, setCatalog]=useState<ExpenseItem[]>(SEED_CATALOG);

  const [charges,       setCharges      ]=useState<AddlCharge[]>([]);
  const [showAddCharge, setShowAddCharge]=useState(false);
  const [discountVal,   setDiscountVal  ]=useState("");
  const [showDiscRow,   setShowDiscRow  ]=useState(false);

  const [showSettings, setShowSettings]=useState(false);
  const [showAddModal, setShowAddModal]=useState(false);
  const [itemSearch,   setItemSearch  ]=useState("");
  const [pendingIds,   setPendingIds  ]=useState<number[]>([]);
  const [itemMenuId,   setItemMenuId  ]=useState<number|null>(null);
  const [showCiModal,  setShowCiModal ]=useState(false);
  const [editingItem,  setEditingItem ]=useState<ExpenseItem|null>(null);
  const [ciName,  setCiName ]=useState("");
  const [ciType,  setCiType ]=useState<"product"|"service">("product");
  const [ciPrice, setCiPrice]=useState("0");
  const [ciUnit,  setCiUnit ]=useState("");
  const [ciHsn,   setCiHsn  ]=useState("");
  const [ciGst,   setCiGst  ]=useState("None");
  const [ciItc,   setCiItc  ]=useState("Eligible");
  const [toast,   setToast  ]=useState<string|null>(null);

  const menuRef=useRef<HTMLDivElement>(null);
  const calRef =useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const h=(e:MouseEvent)=>{
      if(partyRef.current&&!partyRef.current.contains(e.target as Node))setShowPartyDd(false);
      if(menuRef.current&&!menuRef.current.contains(e.target as Node))setItemMenuId(null);
      if(calRef.current&&!calRef.current.contains(e.target as Node))setShowCal(false);
    };
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[]);

  const showT=(m:string)=>{setToast(m);setTimeout(()=>setToast(null),2400);};

  const subtotal    =items.reduce((s,i)=>s+i.price*i.qty,0);
  const totalTax    =withGst?items.reduce((s,i)=>s+(i.price*i.qty*(i.taxRate/100)),0):0;
  const chargesTotal=charges.reduce((s,c)=>s+(parseFloat(c.amount)||0),0);
  const discAmt     =parseFloat(discountVal)||0;
  const taxableAmt  =subtotal+chargesTotal;
  const grandTotal  =taxableAmt+totalTax-discAmt;

  const filtParties =PARTIES.filter(p=>p.name.toLowerCase().includes(partyQ.toLowerCase()));
  const filtCatalog =catalog.filter(c=>c.name.toLowerCase().includes(itemSearch.toLowerCase())||c.hsn.toLowerCase().includes(itemSearch.toLowerCase()));

  const resetCi=()=>{setCiName("");setCiType("product");setCiPrice("0");setCiUnit("");setCiHsn("");setCiGst("None");setCiItc("Eligible");setEditingItem(null);};
  const openAdd=()=>{setPendingIds(items.map(i=>i.id));setShowAddModal(true);};
  const togglePending=(id:number)=>setPendingIds(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const confirmAdd=()=>{setItems(catalog.filter(c=>pendingIds.includes(c.id)));setShowAddModal(false);setItemSearch("");};
  const updField=(id:number,f:string,v:number)=>setItems(p=>p.map(it=>it.id===id?{...it,[f]:v}:it));

  const openEditItem=(item:ExpenseItem)=>{
    setEditingItem(item);setCiName(item.name);setCiHsn(item.hsn);setCiPrice(String(item.price));
    setCiType(item.itemType);setCiUnit(item.unit);setCiGst(item.gstRate);setCiItc(item.itc);
    setItemMenuId(null);setShowCiModal(true);
  };
  const delFromCatalog=(id:number)=>{
    setCatalog(p=>p.filter(c=>c.id!==id));setItems(p=>p.filter(c=>c.id!==id));
    setPendingIds(p=>p.filter(x=>x!==id));setItemMenuId(null);
  };
  const handleSaveItem=()=>{
    if(!ciName.trim()){showT("Item name is required");return;}
    if(editingItem){
      const upd={name:ciName,hsn:ciHsn,price:parseFloat(ciPrice)||0,itemType:ciType,unit:ciUnit,gstRate:ciGst,itc:ciItc};
      setCatalog(p=>p.map(c=>c.id===editingItem.id?{...c,...upd}:c));
      setItems(p=>p.map(c=>c.id===editingItem.id?{...c,...upd}:c));
      showT("Item updated");
    } else {
      const ni:ExpenseItem={id:Date.now(),name:ciName,hsn:ciHsn,price:parseFloat(ciPrice)||0,qty:1,discount:0,taxRate:0,itemType:ciType,unit:ciUnit,gstRate:ciGst,itc:ciItc};
      setCatalog(p=>[...p,ni]);
      showT(`Item "${ciName}" created`);
    }
    resetCi();setShowCiModal(false);
  };

  const handleSave=()=>{
    const exp:Expense={
      id:editData?.id||Date.now(),
      date:selDate.toISOString().slice(0,10),
      expNumber:parseInt(expNo)||seqNo,
      category,
      partyName:selParty?.name||"",
      amount:isEdit?grandTotal:subtotal,
      paymentMode:payMode,
      items,note,withGst,
      originalInvoiceNumber:origInv,
    };
    onSaved(exp);
  };

  return (
    <div className="cpi-page">

      {/* ── Topbar — matches reference UI (← arrow + bold h2 title) ── */}
      <TopbarWrap>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <TopbarBackBtn onClick={onBack}/>
          <TopbarTitle>{isEdit ? "Edit Expense" : "Create Expense"}</TopbarTitle>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <button className="btn-icon" style={{width:36,height:36}} onClick={()=>setShowSettings(true)}>
            <IC.Settings/>
          </button>
          <button className="btn-save-new" onClick={onBack}>Cancel</button>
          <button className="btn-save-top" onClick={handleSave}>Save</button>
        </div>
      </TopbarWrap>

      {/* ── Body: always two-column grid ── */}
      <div className="exp-create-wrap">

        {/* LEFT PANEL */}
        <div className="exp-left-panel">

          {/* Fields card */}
          <div className="exp-card">

            {/* GST toggle */}
            <div className="exp-gst-row">
              <span className="exp-gst-label">Expense With GST</span>
              <label className="toggle">
                <input type="checkbox" checked={withGst} onChange={e=>setWithGst(e.target.checked)}/>
                <span className="toggle-slider"/>
              </label>
            </div>

            {/* GST section (expanded) */}
            {withGst && (
              <div className="exp-gst-section">
                <div className="exp-gst-section-inner">
                  <div className="exp-field-group">
                    <label className="exp-field-label">GSTIN</label>
                    <input className="exp-input" placeholder="Enter GSTIN"/>
                  </div>
                  <div className="exp-field-group">
                    <label className="exp-field-label">GST Registration Type</label>
                    <div className="exp-select-wrap">
                      <select className="exp-select">
                        <option>Regular</option>
                        <option>Composition</option>
                        <option>Unregistered</option>
                      </select>
                      <span className="exp-select-caret"><IC.Chevron/></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Select Party */}
            <div className="exp-field-group" ref={partyRef} style={{position:"relative"}}>
              <label className="exp-field-label">Select Party</label>
              {selParty ? (
                <div className="exp-party-selected">
                  <span className="exp-party-search-icon"><IC.Search/></span>
                  <span className="exp-party-sel-name">{selParty.name}</span>
                  <button className="exp-party-clear-btn" onClick={()=>setSelParty(null)}><IC.X/></button>
                </div>
              ) : (
                <div className={`exp-party-box${showPartyDd?" open":""}`} onClick={()=>{setShowPartyDd(v=>!v);if(!showPartyDd)setPartyQ("");}}>
                  <span className="exp-party-search-icon"><IC.Search/></span>
                  {showPartyDd
                    ? <input className="exp-party-input" autoFocus value={partyQ} onChange={e=>setPartyQ(e.target.value)} placeholder="Search Party" onClick={e=>e.stopPropagation()}/>
                    : <span className="exp-party-placeholder">Search Party</span>
                  }
                  <span className="exp-party-caret"><IC.Chevron/></span>
                </div>
              )}
              {showPartyDd && !selParty && (
                <div className="exp-party-drop">
                  {filtParties.length===0
                    ? <div className="exp-party-empty">No parties found</div>
                    : filtParties.map(p=>(
                        <div key={p.id} className="exp-party-item" onClick={()=>{setSelParty(p);setShowPartyDd(false);setPartyQ("");}}>
                          {p.name}
                        </div>
                      ))
                  }
                </div>
              )}
            </div>

            {/* Expense Category */}
            <div className="exp-field-group">
              <label className="exp-field-label">Expense Category</label>
              <div className="exp-select-wrap">
                <select className="exp-select" value={category} onChange={e=>setCategory(e.target.value)}>
                  <option value="">Select Category</option>
                  {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                <span className="exp-select-caret"><IC.Chevron/></span>
              </div>
            </div>

            {/* FIX: Expense Number shown as read-only, always reflects settings.sequenceNumber */}
            <div className="exp-field-group" style={{maxWidth:260}}>
              <label className="exp-field-label">Expense Number</label>
              <input className="exp-input" type="text" value={expNo} readOnly
                style={{background:"#f9fafb",cursor:"default"}}/>
            </div>

          </div>{/* end fields card */}

          {/* Items card */}
          <div className="exp-items-card">
            {items.length > 0 && (
              <div className="exp-items-table-wrap">
                <table className="exp-items-table">
                  <thead>
                    <tr>
                      <th style={{width:32}}>#</th>
                      <th>Items / Services</th>
                      <th style={{width:80}}>Qty</th>
                      <th style={{width:110}}>Price/Item</th>
                      {withGst && <th style={{width:80}}>Tax %</th>}
                      <th style={{width:110}}>Amount</th>
                      <th style={{width:36}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it,idx)=>{
                      const la=it.price*it.qty;
                      const ta=withGst?(la*it.taxRate/100):0;
                      return (
                        <tr key={it.id}>
                          <td className="exp-item-num">{idx+1}</td>
                          <td>
                            <div className="exp-item-name">{it.name}</div>
                            {it.hsn && <div className="exp-item-hsn">HSN: {it.hsn}</div>}
                          </td>
                          <td><input className="exp-cell-input" type="number" value={it.qty} onChange={e=>updField(it.id,"qty",parseFloat(e.target.value)||1)}/></td>
                          <td><input className="exp-cell-input" type="number" value={it.price} onChange={e=>updField(it.id,"price",parseFloat(e.target.value)||0)}/></td>
                          {withGst && <td><input className="exp-cell-input" type="number" value={it.taxRate} onChange={e=>updField(it.id,"taxRate",parseFloat(e.target.value)||0)}/></td>}
                          <td className="exp-cell-amt">₹ {(la+ta).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
                          <td><button className="exp-del-item-btn" onClick={()=>setItems(p=>p.filter(i=>i.id!==it.id))}><IC.X/></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="exp-items-total-row">
                      <td colSpan={withGst?4:3} className="exp-tfoot-label">Total</td>
                      <td className="exp-tfoot-col">₹ {subtotal.toLocaleString("en-IN")}</td>
                      {withGst && <td className="exp-tfoot-col">{totalTax.toLocaleString("en-IN")}</td>}
                      <td className="exp-tfoot-col exp-tfoot-total">₹ {(subtotal+totalTax).toLocaleString("en-IN")}</td>
                      <td/>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
            <button className="exp-add-item-btn" onClick={openAdd}><IC.Plus/> Add Item</button>
          </div>{/* end items card */}

        </div>{/* end LEFT PANEL */}

        {/* RIGHT PANEL */}
        <div className="exp-right-panel">

          {/* Right fields card */}
          <div className="exp-card">
            <div className="exp-field-group">
              <label className="exp-field-label">Original Invoice Number</label>
              <input className="exp-input" type="text" value={origInv} onChange={e=>setOrigInv(e.target.value)}/>
            </div>
            <div className="exp-field-group" ref={calRef} style={{position:"relative"}}>
              <label className="exp-field-label">Date</label>
              <div className="exp-date-wrap" onClick={()=>setShowCal(v=>!v)}>
                <span className="exp-date-icon"><IC.Calendar/></span>
                <span className="exp-date-val">{fmtShort(selDate)}</span>
                <span className="exp-date-caret"><IC.Chevron/></span>
              </div>
              {showCal && (
                <CalendarPicker
                  onSelect={d=>{setSelDate(d);setShowCal(false);}}
                  onCancel={()=>setShowCal(false)}
                />
              )}
            </div>
            <div className="exp-field-group">
              <label className="exp-field-label">Payment Mode</label>
              <div className="exp-select-wrap">
                <select className="exp-select" value={payMode} onChange={e=>setPayMode(e.target.value)}>
                  <option value="">Select</option>
                  {PAYMENT_MODES.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
                <span className="exp-select-caret"><IC.Chevron/></span>
              </div>
            </div>
            <div className="exp-field-group">
              <label className="exp-field-label">Note</label>
              <textarea className="exp-textarea" value={note} onChange={e=>setNote(e.target.value)} placeholder="Enter Notes"/>
            </div>
          </div>

          {/* Summary card — Edit mode only */}
          {isEdit && (
            <div className="exp-summary-card">
              <div className="exp-summary-row clickable" onClick={()=>setShowAddCharge(v=>!v)}>
                <span className="exp-summary-link">+ Add Additional Charges</span>
                <span className="exp-summary-val">₹ {chargesTotal.toLocaleString("en-IN",{minimumFractionDigits:0})}</span>
              </div>
              {showAddCharge && (
                <div className="exp-charges-section">
                  {charges.map(ch=>(
                    <div key={ch.id} className="exp-charge-row">
                      <input className="exp-input exp-charge-label-input" placeholder="Charge name" value={ch.label} onChange={e=>setCharges(p=>p.map(c=>c.id===ch.id?{...c,label:e.target.value}:c))}/>
                      <div className="exp-select-wrap" style={{width:86}}>
                        <select className="exp-select exp-charge-tax-sel" value={ch.taxRate} onChange={e=>setCharges(p=>p.map(c=>c.id===ch.id?{...c,taxRate:e.target.value}:c))}>
                          <option value="">Tax</option>
                          <option>0%</option><option>5%</option><option>12%</option><option>18%</option><option>28%</option>
                        </select>
                        <span className="exp-select-caret"><IC.Chevron/></span>
                      </div>
                      <input className="exp-input exp-charge-amt-input" type="number" placeholder="0" value={ch.amount} onChange={e=>setCharges(p=>p.map(c=>c.id===ch.id?{...c,amount:e.target.value}:c))}/>
                      <button className="exp-del-charge-btn" onClick={()=>setCharges(p=>p.filter(c=>c.id!==ch.id))}><IC.X/></button>
                    </div>
                  ))}
                  <button className="exp-add-charge-btn" onClick={()=>setCharges(p=>[...p,{id:Date.now(),label:"",amount:"",taxRate:""}])}><IC.Plus/> Add Charge</button>
                </div>
              )}
              <div className="exp-summary-row">
                <span className="exp-summary-label">Taxable Amount</span>
                <span className="exp-summary-val">₹ {taxableAmt.toLocaleString("en-IN",{minimumFractionDigits:0})}</span>
              </div>
              <div className="exp-summary-row clickable" onClick={()=>setShowDiscRow(v=>!v)}>
                <span className="exp-summary-link">+ Add Discount</span>
                <span className="exp-summary-val" style={{color:"#f04438"}}>- ₹ {discAmt.toLocaleString("en-IN",{minimumFractionDigits:0})}</span>
              </div>
              {showDiscRow && (
                <div className="exp-discount-row">
                  <span className="exp-discount-label">Discount (₹)</span>
                  <input className="exp-input exp-discount-input" type="number" placeholder="0" value={discountVal} onChange={e=>setDiscountVal(e.target.value)}/>
                </div>
              )}
              <div className="exp-summary-divider"/>
              <div className="exp-summary-total-row">
                <span className="exp-summary-total-label">Total Amount</span>
                <span className="exp-summary-total-val">₹ {grandTotal.toLocaleString("en-IN",{minimumFractionDigits:0})}</span>
              </div>
            </div>
          )}

          {/* Total Expense Amount — Create mode only */}
          {!isEdit && (
            <div className="exp-total-expense-row">
              <span className="exp-total-exp-label">Total Expense Amount</span>
              <div className="exp-total-exp-val">
                <span className="exp-total-exp-sym">₹</span>
                <input className="exp-total-exp-input" type="number" value={subtotal} readOnly/>
              </div>
            </div>
          )}

        </div>{/* end RIGHT PANEL */}

      </div>{/* end body grid */}

      {/* ── MODALS ── */}
      {showSettings && (
        <SettingsModal settings={settings} setSettings={setSettings} onClose={()=>setShowSettings(false)}/>
      )}

      {showAddModal && (
        <div className="pi-overlay" onClick={()=>{setShowAddModal(false);setItemSearch("");}}>
          <div className="exp-aim-modal" onClick={e=>e.stopPropagation()}>
            <div className="pi-modal-head">
              <span className="pi-modal-title">Add Expense Items</span>
              <button className="pi-modal-close" onClick={()=>{setShowAddModal(false);setItemSearch("");}}><IC.X/></button>
            </div>
            <div className="exp-aim-search-row">
              <div className="exp-aim-search-box">
                <span className="exp-aim-search-icon"><IC.Search/></span>
                <input className="exp-aim-input" placeholder="Search" value={itemSearch} onChange={e=>setItemSearch(e.target.value)} autoFocus/>
              </div>
              <button className="exp-aim-create-btn" onClick={()=>{setShowAddModal(false);setShowCiModal(true);}}>+ Create New Item</button>
            </div>
            <div className="exp-aim-table-wrap">
              <table className="exp-aim-table">
                <thead>
                  <tr><th>Item Name</th><th style={{width:110}}>HSN/SAC</th><th style={{width:110}}>Price</th><th style={{width:130}}></th></tr>
                </thead>
                <tbody>
                  {filtCatalog.map(item=>{
                    const isSel=pendingIds.includes(item.id);
                    return (
                      <tr key={item.id} className={isSel?"exp-aim-row-sel":""}>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <input type="checkbox" className="exp-aim-check" checked={isSel} onChange={()=>togglePending(item.id)}/>
                            <span className="exp-aim-item-name">{item.name}</span>
                          </div>
                        </td>
                        <td className="exp-aim-muted">{item.hsn}</td>
                        <td className="exp-aim-price">{item.price.toLocaleString("en-IN")}</td>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end"}}>
                            <button className={`exp-aim-add-btn${isSel?" added":""}`} onClick={()=>togglePending(item.id)}>
                              {isSel?"✓ Added":"+ Add"}
                            </button>
                            <div style={{position:"relative"}} ref={itemMenuId===item.id?menuRef:undefined}>
                              <button className="tdot-btn" onClick={()=>setItemMenuId(itemMenuId===item.id?null:item.id)}><IC.Dots/></button>
                              {itemMenuId===item.id && (
                                <div className="pi-ctx exp-item-ctx">
                                  <div className="pi-dd-item" onClick={()=>openEditItem(item)}><IC.Edit/>Edit</div>
                                  <div className="pi-dd-divider"/>
                                  <div className="pi-dd-item danger" onClick={()=>delFromCatalog(item.id)}><IC.Trash/>Delete</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtCatalog.length===0 && (
                    <tr><td colSpan={4}><div className="pi-empty">No items found</div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="pi-modal-foot">
              <button className="btn-cancel" onClick={()=>{setShowAddModal(false);setItemSearch("");}}>Cancel</button>
              <button className="btn-save" onClick={confirmAdd}>Add</button>
            </div>
          </div>
        </div>
      )}

      {showCiModal && (
        <div className="pi-overlay" onClick={()=>{setShowCiModal(false);resetCi();}}>
          <div className="exp-ci-modal" onClick={e=>e.stopPropagation()}>
            <div className="pi-modal-head">
              <span className="pi-modal-title">{editingItem?"Edit Expense Item":"Create New Expense Item"}</span>
              <button className="pi-modal-close" onClick={()=>{setShowCiModal(false);resetCi();}}><IC.X/></button>
            </div>
            <div className="exp-ci-grid">
              <div className="exp-field-group exp-ci-full">
                <label className="exp-field-label">Item Name</label>
                <input className="exp-input" value={ciName} onChange={e=>setCiName(e.target.value)} placeholder="Enter item name"/>
              </div>
              <div className="exp-field-group exp-ci-full">
                <label className="exp-field-label">Item Type</label>
                <div style={{display:"flex",gap:24,marginTop:4}}>
                  {(["product","service"] as const).map(t=>(
                    <label key={t} className="exp-radio-label">
                      <input type="radio" name="ciType" value={t} checked={ciType===t} onChange={()=>setCiType(t)}/>
                      <span>{t.charAt(0).toUpperCase()+t.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="exp-field-group">
                <label className="exp-field-label">Purchase Price</label>
                <input className="exp-input" type="number" value={ciPrice} onChange={e=>setCiPrice(e.target.value)}/>
              </div>
              <div className="exp-field-group">
                <label className="exp-field-label">Measuring Unit</label>
                <div className="exp-select-wrap">
                  <select className="exp-select" value={ciUnit} onChange={e=>setCiUnit(e.target.value)}>
                    <option value="">Select Unit</option>
                    <option>Ampoule(AMP)</option><option>Pieces</option><option>Kg</option><option>Litre</option><option>Box</option>
                  </select>
                  <span className="exp-select-caret"><IC.Chevron/></span>
                </div>
              </div>
              <div className="exp-field-group">
                <label className="exp-field-label">HSN</label>
                <input className="exp-input" value={ciHsn} onChange={e=>setCiHsn(e.target.value)} placeholder="HSN code"/>
              </div>
              <div className="exp-field-group">
                <label className="exp-field-label">GST Tax Rate %</label>
                <div className="exp-select-wrap">
                  <select className="exp-select" value={ciGst} onChange={e=>setCiGst(e.target.value)}>
                    <option>None</option><option>0%</option><option>5%</option><option>12%</option><option>18%</option><option>28%</option>
                  </select>
                  <span className="exp-select-caret"><IC.Chevron/></span>
                </div>
              </div>
              <div className="exp-field-group exp-ci-full">
                <label className="exp-field-label">ITC Applicable</label>
                <div className="exp-select-wrap">
                  <select className="exp-select" value={ciItc} onChange={e=>setCiItc(e.target.value)}>
                    <option>Eligible</option><option>Not Eligible</option>
                  </select>
                  <span className="exp-select-caret"><IC.Chevron/></span>
                </div>
              </div>
            </div>
            <div className="pi-modal-foot">
              <button className="btn-cancel" onClick={()=>{setShowCiModal(false);resetCi();}}>Cancel</button>
              <button className="btn-save" onClick={handleSaveItem}>Save Item</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="pi-toast">{toast}</div>}
    </div>
  );
}

/* ══ EXPENSE TRANSACTION REPORT ══ */
function ExpenseTxnReport({expenses,onBack}:{expenses:Expense[];onBack:()=>void}){
  const [catFilter,  setCatFilter ]=useState("");
  const [showCatDd,  setShowCatDd ]=useState(false);
  const [dateFilter, setDateFilter]=useState<DateFilter>("This Week");
  const [showDateDd, setShowDateDd]=useState(false);
  const catRef =useRef<HTMLDivElement>(null);
  const dateRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const h=(e:MouseEvent)=>{
      if(catRef.current&&!catRef.current.contains(e.target as Node))setShowCatDd(false);
      if(dateRef.current&&!dateRef.current.contains(e.target as Node))setShowDateDd(false);
    };
    document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);
  },[]);
  const [from,to]=getRange(dateFilter);
  const rows=expenses.filter(ex=>{
    const d=new Date(ex.date);d.setHours(12);
    if(d<from||d>to)return false;
    if(catFilter&&ex.category!==catFilter)return false;
    return true;
  });
  const allCats=Array.from(new Set(expenses.map(e=>e.category).filter(Boolean)));
  return(
    <div className="exp-report-page">
      {/* FIX: title uses same TopbarWrap pattern */}
      <TopbarWrap>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <TopbarBackBtn onClick={onBack}/>
          <TopbarTitle>Expense Transaction Report</TopbarTitle>
        </div>
        <button className="exp-fav-btn"><IC.Star/> Favourite</button>
      </TopbarWrap>
      <div className="exp-report-toolbar">
        <div ref={catRef} style={{position:"relative"}}>
          <button className="exp-report-filter-btn" onClick={()=>setShowCatDd(v=>!v)}>
            {catFilter||"All Expense Categories"} <IC.Chevron/>
          </button>
          {showCatDd&&(
            <div className="pi-dd" style={{minWidth:200,top:"calc(100% + 4px)"}}>
              <div className={`pi-dd-item${!catFilter?" sel":""}`} onClick={()=>{setCatFilter("");setShowCatDd(false);}}>All Expense Categories</div>
              {allCats.map(c=><div key={c} className={`pi-dd-item${catFilter===c?" sel":""}`} onClick={()=>{setCatFilter(c);setShowCatDd(false);}}>{c}</div>)}
            </div>
          )}
        </div>
        <div ref={dateRef} style={{position:"relative"}}>
          <button className="exp-report-filter-btn" onClick={()=>setShowDateDd(v=>!v)}>
            <IC.Calendar/> {dateFilter} <IC.Chevron/>
          </button>
          {showDateDd&&(
            <div className="pi-dd" style={{minWidth:160,top:"calc(100% + 4px)"}}>
              {DATE_OPTS.filter(o=>o!=="Custom").map(o=><div key={o} className={`pi-dd-item${dateFilter===o?" sel":""}`} onClick={()=>{setDateFilter(o);setShowDateDd(false);}}>{o}</div>)}
            </div>
          )}
        </div>
        <div style={{flex:1}}/>
        <button className="exp-report-action-btn"><IC.Mail/> Email Excel</button>
        <button className="exp-report-action-btn"><IC.Download/> Download Excel <IC.Chevron/></button>
        <button className="exp-report-action-btn"><IC.Print/> Print PDF</button>
      </div>
      <div className="exp-report-table-wrap">
        <table className="exp-report-table">
          <thead><tr><th>DATE</th><th>EXPENSE NUMBER</th><th>CATEGORY</th><th>PAYMENT MODE</th><th>TOTAL AMOUNT</th></tr></thead>
          <tbody>
            {rows.length===0?(
              <tr><td colSpan={5} style={{textAlign:"center",padding:"40px",color:"#98a2b3",fontSize:13}}>No records found</td></tr>
            ):rows.map(ex=>(
              <tr key={ex.id}>
                <td>{ex.date.replace(/-/g,"-")}</td>
                <td>{ex.expNumber}</td>
                <td>{ex.category||"—"}</td>
                <td>{ex.paymentMode||"—"}</td>
                <td>{ex.amount>0?`₹ ${ex.amount.toLocaleString("en-IN")}`:"-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══ EXPENSE CATEGORY REPORT ══ */
function ExpenseCatReport({expenses,onBack}:{expenses:Expense[];onBack:()=>void}){
  const [dateFilter,setDateFilter]=useState<DateFilter>("This Week");
  const [showDateDd,setShowDateDd]=useState(false);
  const dateRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const h=(e:MouseEvent)=>{if(dateRef.current&&!dateRef.current.contains(e.target as Node))setShowDateDd(false);};
    document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);
  },[]);
  const [from,to]=getRange(dateFilter);
  const filtered=expenses.filter(ex=>{const d=new Date(ex.date);d.setHours(12);return d>=from&&d<=to;});
  const catMap=new Map<string,number>();
  filtered.forEach(ex=>{const c=ex.category||"Uncategorised";catMap.set(c,(catMap.get(c)||0)+ex.amount);});
  const rows=Array.from(catMap.entries());
  return(
    <div className="exp-report-page">
      {/* FIX: title uses same TopbarWrap pattern */}
      <TopbarWrap>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <TopbarBackBtn onClick={onBack}/>
          <TopbarTitle>Expense Category Report</TopbarTitle>
        </div>
        <button className="exp-fav-btn"><IC.Star/> Favourite</button>
      </TopbarWrap>
      <div className="exp-report-toolbar">
        <div ref={dateRef} style={{position:"relative"}}>
          <button className="exp-report-filter-btn" onClick={()=>setShowDateDd(v=>!v)}>
            <IC.Calendar/> {dateFilter} <IC.Chevron/>
          </button>
          {showDateDd&&(
            <div className="pi-dd" style={{minWidth:160,top:"calc(100% + 4px)"}}>
              {DATE_OPTS.filter(o=>o!=="Custom").map(o=><div key={o} className={`pi-dd-item${dateFilter===o?" sel":""}`} onClick={()=>{setDateFilter(o);setShowDateDd(false);}}>{o}</div>)}
            </div>
          )}
        </div>
        <div style={{flex:1}}/>
        <button className="exp-report-action-btn"><IC.Mail/> Email Excel</button>
        <button className="exp-report-action-btn"><IC.Download/> Download Excel <IC.Chevron/></button>
        <button className="exp-report-action-btn"><IC.Print/> Print PDF</button>
      </div>
      <div className="exp-report-table-wrap">
        <table className="exp-report-table">
          <thead><tr><th>CATEGORY</th><th>TOTAL AMOUNT</th></tr></thead>
          <tbody>
            {rows.length===0?(
              <tr><td colSpan={2} style={{textAlign:"center",padding:"40px",color:"#98a2b3",fontSize:13}}>No records found</td></tr>
            ):rows.map(([cat,amt])=>(
              <tr key={cat}>
                <td>{cat}</td>
                <td>{amt>0?`₹ ${amt.toLocaleString("en-IN")}`:"-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══ EXPENSE DETAIL PAGE ══ */
function ExpenseDetailPage({expense,onBack,onEdit}:{expense:Expense;onBack:()=>void;onEdit:()=>void}){
  const totalDiscount=expense.items.reduce((s,i)=>s+i.discount,0);
  const totalAmt=expense.items.reduce((s,i)=>s+i.price*i.qty,0);
  return(
    <div className="exp-detail-page">
      {/* FIX: title uses same TopbarWrap pattern */}
      <TopbarWrap>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <TopbarBackBtn onClick={onBack}/>
          <TopbarTitle>Expense #{expense.expNumber}</TopbarTitle>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="exp-detail-edit-btn" onClick={onEdit}><IC.Edit/> Edit</button>
          <button className="exp-detail-del-btn" onClick={onBack}><IC.Trash/></button>
        </div>
      </TopbarWrap>
      <div className="exp-detail-card">
        <div className="exp-detail-meta-grid">
          <div className="exp-detail-meta-col">
            <div className="exp-detail-meta-label">Party Name</div>
            <div className="exp-detail-meta-val">{expense.partyName||"—"}</div>
          </div>
          <div className="exp-detail-meta-col">
            <div className="exp-detail-meta-label">Place of Supply</div>
            <div className="exp-detail-meta-val">—</div>
          </div>
          <div className="exp-detail-meta-col">
            <div className="exp-detail-meta-label">Expense category</div>
            <div className="exp-detail-meta-val">{expense.category||"—"}</div>
          </div>
          <div className="exp-detail-meta-col">
            <div className="exp-detail-meta-label">Payment Mode</div>
            <div className="exp-detail-meta-val">{expense.paymentMode||"—"}</div>
          </div>
          <div className="exp-detail-meta-col">
            <div className="exp-detail-meta-label">Date</div>
            <div className="exp-detail-meta-val">{expense.date}</div>
          </div>
          <div className="exp-detail-meta-col">
            <div className="exp-detail-meta-label">Notes</div>
            <div className="exp-detail-meta-val">{expense.note||"—"}</div>
          </div>
        </div>
        <div className="exp-detail-items-wrap">
          <table className="exp-detail-items-table">
            <thead>
              <tr>
                <th>Item Name</th><th>HSN</th><th>QTY</th>
                <th>PRICE/ITEM(₹)</th><th>DISCOUNT(₹)</th><th>TAX(₹)</th>
                <th>ITC Applicable</th><th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {expense.items.length===0?(
                <tr><td colSpan={8} style={{padding:"20px",textAlign:"center",color:"#98a2b3",fontSize:13}}>No items</td></tr>
              ):expense.items.map(it=>{
                const tax=it.price*it.qty*(it.taxRate/100);
                return(
                  <tr key={it.id}>
                    <td>{it.name}</td>
                    <td>{it.hsn||"—"}</td>
                    <td>{it.qty}</td>
                    <td>₹ {it.price.toLocaleString("en-IN")}</td>
                    <td>{it.discount>0?`₹ ${it.discount}`:"0"}</td>
                    <td>{tax>0?`₹ ${tax.toFixed(2)}`:"0"}</td>
                    <td>{it.itc}</td>
                    <td>₹ {(it.price*it.qty).toLocaleString("en-IN")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="exp-detail-summary">
          <div className="exp-detail-sum-row">
            <span>Total Discount</span>
            <span>{totalDiscount}</span>
          </div>
          <div className="exp-detail-sum-row total">
            <span>Total Expense Amount</span>
            <span>{totalAmt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══ EXPENSES LIST PAGE ══ */
function ExpensesListPage({expenses,setExpenses,settings,setSettings,onCreateNew,onEdit,onViewDetail,onReport}:{
  expenses:Expense[];
  setExpenses:React.Dispatch<React.SetStateAction<Expense[]>>;
  settings:ExpSettings;
  setSettings:React.Dispatch<React.SetStateAction<ExpSettings>>;
  onCreateNew:()=>void;
  onEdit:(e:Expense)=>void;
  onViewDetail:(e:Expense)=>void;
  onReport:(t:"txn"|"cat")=>void;
}){
  const [dateFilter,   setDateFilter  ]=useState<DateFilter>("Last 365 Days");
  const [customFrom,   setCustomFrom  ]=useState<Date|null>(null);
  const [customTo,     setCustomTo    ]=useState<Date|null>(null);
  const [showDateList, setShowDateList]=useState(false);
  const [showCalendar, setShowCalendar]=useState(false);
  const [catFilter,    setCatFilter   ]=useState("");
  const [showCatDrop,  setShowCatDrop ]=useState(false);
  const [showSearch,   setShowSearch  ]=useState(false);
  const [query,        setQuery       ]=useState("");
  const [ctx,          setCtx         ]=useState<{id:number;x:number;y:number}|null>(null);
  const [toast,        setToast       ]=useState<string|null>(null);
  const [showSettings, setShowSettings]=useState(false);
  const [showReportsDd,setShowReportsDd]=useState(false);

  const dateRef  =useRef<HTMLDivElement>(null);
  const catRef   =useRef<HTMLDivElement>(null);
  const ctxRef   =useRef<HTMLDivElement>(null);
  const searchRef=useRef<HTMLDivElement>(null);
  const reportsRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const h=(e:MouseEvent)=>{
      if(dateRef.current&&!dateRef.current.contains(e.target as Node)){setShowDateList(false);setShowCalendar(false);}
      if(catRef.current&&!catRef.current.contains(e.target as Node))setShowCatDrop(false);
      if(ctxRef.current&&!ctxRef.current.contains(e.target as Node))setCtx(null);
      if(searchRef.current&&!searchRef.current.contains(e.target as Node))setShowSearch(false);
      if(reportsRef.current&&!reportsRef.current.contains(e.target as Node))setShowReportsDd(false);
    };
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[]);

  const showT=(m:string)=>{setToast(m);setTimeout(()=>setToast(null),2400);};
  const [from,to]=getRange(dateFilter,customFrom||undefined,customTo||undefined);
  const displayed=expenses.filter(ex=>{
    const d=new Date(ex.date);d.setHours(12);
    if(d<from||d>to)return false;
    if(catFilter&&ex.category!==catFilter)return false;
    if(query.trim()){const q=query.toLowerCase();return ex.expNumber.toString().includes(q)||ex.category.toLowerCase().includes(q)||ex.partyName.toLowerCase().includes(q);}
    return true;
  });
  const handleDot=(e:React.MouseEvent,id:number)=>{
    e.stopPropagation();
    const r=(e.currentTarget as HTMLElement).getBoundingClientRect();
    setCtx({id,x:r.right-145,y:r.bottom+5});
  };
  const doCtx=(action:string)=>{
    const exp=expenses.find(i=>i.id===ctx?.id);
    setCtx(null);
    if(!exp)return;
    if(action==="edit")onEdit(exp);
    if(action==="delete"){setExpenses(p=>p.filter(i=>i.id!==exp.id));showT(`Expense #${exp.expNumber} deleted`);}
  };
  const dateLbl=()=>dateFilter==="Custom"&&customFrom&&customTo?`${fmtShort(customFrom)} – ${fmtShort(customTo)}`:dateFilter;

  return (
    <div className="exp-list-page">
      <div className="exp-list-header">
        <h1 className="pi-title">Expenses</h1>
        <div className="exp-list-header-right">
          <div ref={reportsRef} style={{position:"relative"}}>
            <button className="exp-reports-btn" onClick={()=>setShowReportsDd(v=>!v)}>
              <IC.Report/> Reports <IC.Chevron/>
            </button>
            {showReportsDd&&(
              <div className="exp-reports-dd">
                <div className="exp-reports-dd-item" onClick={()=>{setShowReportsDd(false);onReport("txn");}}>Expense Transactions</div>
                <div className="exp-reports-dd-item" onClick={()=>{setShowReportsDd(false);onReport("cat");}}>Expense Category</div>
              </div>
            )}
          </div>
          <button className="btn-icon" onClick={()=>setShowSettings(true)}><IC.Settings/></button>
          <button className="btn-icon" onClick={()=>showT("View mode")}><IC.Monitor/></button>
        </div>
      </div>

      <div className="exp-toolbar">
        <div ref={searchRef} style={{position:"relative"}}>
          <button className="pr-search-icon-btn" onClick={()=>setShowSearch(v=>!v)}><IC.Search/></button>
          {showSearch && (
            <div className="pr-search-popup">
              <span className="pi-search-icon"><IC.Search/></span>
              <input className="pi-search-input" placeholder="Search expenses..." value={query} onChange={e=>setQuery(e.target.value)} autoFocus style={{width:240}}/>
            </div>
          )}
        </div>
        <div className="pi-date-wrap" ref={dateRef}>
          <button className="pi-date-btn pr-date-btn" onClick={()=>{setShowCalendar(false);setShowDateList(v=>!v);}}>
            <IC.Calendar/> {dateLbl()} <span className="arr">▾</span>
          </button>
          {showDateList && !showCalendar && (
            <div className="pi-dd pi-date-list-dd">
              {DATE_OPTS.map(opt=>(
                <div key={opt} className={`pi-dd-item${dateFilter===opt?" sel":""}`} onClick={()=>{if(opt==="Custom"){setShowCalendar(true);setShowDateList(false);}else{setDateFilter(opt);setShowDateList(false);}}}>
                  {opt}
                </div>
              ))}
            </div>
          )}
          {showCalendar && (
            <CalendarPicker onSelect={d=>{setCustomFrom(d);setCustomTo(d);setDateFilter("Custom");setShowCalendar(false);}} onCancel={()=>setShowCalendar(false)}/>
          )}
        </div>
        <div className="pi-date-wrap" ref={catRef}>
          <button className="pi-date-btn exp-cat-btn" onClick={()=>setShowCatDrop(v=>!v)}>
            {catFilter||"All Expenses Categories"} <span className="arr">▾</span>
          </button>
          {showCatDrop && (
            <div className="pi-dd pi-date-list-dd exp-cat-dd">
              <div className={`pi-dd-item${!catFilter?" sel":""}`} onClick={()=>{setCatFilter("");setShowCatDrop(false);}}>All Expenses Categories</div>
              {CATEGORIES.map(c=>(
                <div key={c} className={`pi-dd-item${catFilter===c?" sel":""}`} onClick={()=>{setCatFilter(c);setShowCatDrop(false);}}>{c}</div>
              ))}
            </div>
          )}
        </div>
        <button className="btn-create-exp" onClick={onCreateNew}>Create Expense</button>
      </div>

      <div className="exp-table-wrap">
        <table>
          <thead>
            <tr>
              <th className="sortable">Date ↕</th>
              <th>Expense Number</th>
              <th>Party Name</th>
              <th>Category</th>
              <th className="sortable">Amount ↕</th>
              <th style={{width:44}}></th>
            </tr>
          </thead>
          <tbody>
            {displayed.length===0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="exp-empty-state">
                    <svg className="exp-empty-icon" viewBox="0 0 80 80" fill="none">
                      <rect x="10" y="8" width="44" height="56" rx="4" stroke="#c8d0dc" strokeWidth="2"/>
                      <line x1="20" y1="24" x2="44" y2="24" stroke="#c8d0dc" strokeWidth="2"/>
                      <line x1="20" y1="34" x2="44" y2="34" stroke="#c8d0dc" strokeWidth="2"/>
                      <line x1="20" y1="44" x2="34" y2="44" stroke="#c8d0dc" strokeWidth="2"/>
                      <circle cx="58" cy="22" r="12" fill="#f2f4f7" stroke="#c8d0dc" strokeWidth="1.5"/>
                      <line x1="54" y1="18" x2="62" y2="26" stroke="#f04438" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="62" y1="18" x2="54" y2="26" stroke="#f04438" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <p className="exp-empty-text">No Transactions Matching the current filter</p>
                  </div>
                </td>
              </tr>
            ) : displayed.map(ex=>(
              <tr key={ex.id} style={{cursor:"pointer"}} onClick={()=>onViewDetail(ex)}>
                <td>{fmtDate(new Date(ex.date))}</td>
                <td>{ex.expNumber}</td>
                <td>{ex.partyName||"—"}</td>
                <td>{ex.category||"—"}</td>
                <td className="td-amt">₹ {ex.amount.toLocaleString("en-IN")}</td>
                <td><button className="tdot-btn" onClick={e=>{e.stopPropagation();handleDot(e,ex.id);}}><IC.Dots/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ctx && (
        <div ref={ctxRef} className="pi-ctx" style={{top:ctx.y,left:ctx.x}}>
          <div className="pi-dd-item" onClick={()=>doCtx("edit")}><IC.Edit/>Edit</div>
          <div className="pi-dd-divider"/>
          <div className="pi-dd-item danger" onClick={()=>doCtx("delete")}><IC.Trash/>Delete</div>
        </div>
      )}

      {showSettings && (
        <SettingsModal settings={settings} setSettings={setSettings} onClose={()=>setShowSettings(false)}/>
      )}

      {toast && <div className="pi-toast">{toast}</div>}
    </div>
  );
}

/* ══ ROOT ══ */
export default function ExpensesModule(){
  const [page,           setPage          ]=useState<ExpPage>("list");
  const [expenses,       setExpenses      ]=useState<Expense[]>([]);
  const [editingExpense, setEditingExpense]=useState<Expense|null>(null);
  const [detailExpense,  setDetailExpense ]=useState<Expense|null>(null);
  // FIX: single source of truth — settings.sequenceNumber drives the expense number
  const [settings, setSettings]=useState<ExpSettings>({prefixEnabled:true,prefix:"",sequenceNumber:1,showItemImage:false});

  const handleSaved=(e:Expense)=>{
    if(page==="edit"&&editingExpense){
      setExpenses(p=>p.map(ex=>ex.id===editingExpense.id?{...e,id:editingExpense.id}:ex));
    } else {
      setExpenses(p=>[e,...p]);
      // FIX: increment settings.sequenceNumber after every new save
      setSettings(s=>({...s,sequenceNumber:s.sequenceNumber+1}));
    }
    setEditingExpense(null);
    setPage("list");
  };

  const handleEdit=(exp:Expense)=>{ setEditingExpense(exp); setPage("edit"); };
  const handleBack=()=>{ setEditingExpense(null); setDetailExpense(null); setPage("list"); };
  const handleViewDetail=(exp:Expense)=>{ setDetailExpense(exp); setPage("detail"); };

  // FIX: pass settings.sequenceNumber as seqNo (not a stale separate state)
  const seqNo = settings.sequenceNumber;

  if(page==="create"){
    return <ExpenseFormPage seqNo={seqNo} settings={settings} setSettings={setSettings} onBack={handleBack} onSaved={handleSaved} isEdit={false}/>;
  }
  if(page==="edit"&&editingExpense){
    return <ExpenseFormPage seqNo={seqNo} settings={settings} setSettings={setSettings} onBack={handleBack} onSaved={handleSaved} isEdit={true} editData={editingExpense}/>;
  }
  if(page==="txn-report"){
    return <ExpenseTxnReport expenses={expenses} onBack={()=>setPage("list")}/>;
  }
  if(page==="cat-report"){
    return <ExpenseCatReport expenses={expenses} onBack={()=>setPage("list")}/>;
  }
  if(page==="detail"&&detailExpense){
    return <ExpenseDetailPage expense={detailExpense} onBack={()=>setPage("list")} onEdit={()=>{setEditingExpense(detailExpense);setPage("edit");}}/>;
  }
  return <ExpensesListPage expenses={expenses} setExpenses={setExpenses} settings={settings} setSettings={setSettings} onCreateNew={()=>setPage("create")} onEdit={handleEdit} onViewDetail={handleViewDetail} onReport={t=>setPage(t==="txn"?"txn-report":"cat-report")}/>;
}