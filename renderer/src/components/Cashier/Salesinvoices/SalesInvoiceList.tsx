import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SalesInvoiceList.css";
import InvoiceViewModal from "./Invoiceviewmodal";

// ─── Import the real SalesInvoice shape from SalesInvoiceTypes ────────────────
// The full SalesInvoice object is stored in localStorage("salesInvoices")
// Fields we care about for the list view:
//   id, invoiceNo, invoiceDate, party?.name, dueDate, paymentTermsDays,
//   amountReceived, billItems (to compute total), status, createdAt
interface SalesInvoice {
  id: string;
  invoiceNo: number;
  invoiceDate: string;
  party: { name: string; mobile?: string } | null;
  dueDate: string;
  paymentTermsDays: number;
  showDueDate: boolean;
  billItems: { qty: number; price: number; discountPct: number; discountAmt: number; taxRate: number; amount: number }[];
  additionalCharges: { amount: number }[];
  discountPct: number;
  discountAmt: number;
  applyTCS: boolean;
  tcsRate: number;
  tcsBase: "Total Amount" | "Taxable Amount";
  roundOffAmt: number;
  amountReceived: number;
  status: "Paid" | "Unpaid" | "Partially Paid" | "Cancelled";
  createdAt: string;
}

type StatusFilter = "Total Sales" | "Paid" | "Unpaid" | "Cancelled";
type DateFilterOption =
  | "Today" | "Yesterday" | "This Week" | "Last Week" | "Last 7 Days"
  | "This Month" | "Previous Month" | "Last 30 Days" | "This Quarter"
  | "Previous Quarter" | "Current Fiscal Year" | "Previous Fiscal Year"
  | "Last 365 Days" | "Custom";

// ─── Sample fallback data (matches SalesInvoice shape) ───────────────────────
const SAMPLE_INVOICES: SalesInvoice[] = [
  {
    id: "i18", invoiceNo: 18, invoiceDate: "2026-03-01",
    party: { name: "anando" }, dueDate: "2026-03-01", showDueDate: false,
    paymentTermsDays: 0, billItems: [{ qty:1, price:42000, discountPct:0, discountAmt:0, taxRate:0, amount:42000 }],
    additionalCharges: [], discountPct:0, discountAmt:0, applyTCS:false, tcsRate:0,
    tcsBase:"Taxable Amount", roundOffAmt:0, amountReceived:0, status:"Unpaid", createdAt:"2026-03-01",
  },
  {
    id: "i17", invoiceNo: 17, invoiceDate: "2026-02-28",
    party: { name: "ranjan" }, dueDate: "2026-02-28", showDueDate: false,
    paymentTermsDays: 0, billItems: [{ qty:1, price:369875, discountPct:0, discountAmt:0, taxRate:0, amount:369875 }],
    additionalCharges: [], discountPct:0, discountAmt:0, applyTCS:false, tcsRate:0,
    tcsBase:"Taxable Amount", roundOffAmt:0, amountReceived:369875, status:"Paid", createdAt:"2026-02-28",
  },
  {
    id: "i16", invoiceNo: 16, invoiceDate: "2026-02-28",
    party: { name: "anando" }, dueDate: "2026-02-28", showDueDate: false,
    paymentTermsDays: 0, billItems: [{ qty:1, price:336318.3, discountPct:0, discountAmt:0, taxRate:0, amount:336318.3 }],
    additionalCharges: [], discountPct:0, discountAmt:0, applyTCS:false, tcsRate:0,
    tcsBase:"Taxable Amount", roundOffAmt:0, amountReceived:336318.3, status:"Paid", createdAt:"2026-02-28",
  },
  {
    id: "i15", invoiceNo: 15, invoiceDate: "2026-02-28",
    party: { name: "sumon" }, dueDate: "2026-03-27", showDueDate: true,
    paymentTermsDays: 28, billItems: [{ qty:1, price:21000, discountPct:0, discountAmt:0, taxRate:0, amount:21000 }],
    additionalCharges: [], discountPct:0, discountAmt:0, applyTCS:false, tcsRate:0,
    tcsBase:"Taxable Amount", roundOffAmt:0, amountReceived:0, status:"Unpaid", createdAt:"2026-02-28",
  },
  {
    id: "i14", invoiceNo: 14, invoiceDate: "2026-02-28",
    party: { name: "ranjan" }, dueDate: "2026-02-28", showDueDate: false,
    paymentTermsDays: 0, billItems: [{ qty:1, price:45000, discountPct:0, discountAmt:0, taxRate:0, amount:45000 }],
    additionalCharges: [], discountPct:0, discountAmt:0, applyTCS:false, tcsRate:0,
    tcsBase:"Taxable Amount", roundOffAmt:0, amountReceived:45000, status:"Paid", createdAt:"2026-02-28",
  },
  {
    id: "i13", invoiceNo: 13, invoiceDate: "2026-02-28",
    party: { name: "ranjan" }, dueDate: "2026-03-01", showDueDate: true,
    paymentTermsDays: 2, billItems: [{ qty:1, price:90000, discountPct:0, discountAmt:0, taxRate:0, amount:90000 }],
    additionalCharges: [], discountPct:0, discountAmt:0, applyTCS:false, tcsRate:0,
    tcsBase:"Taxable Amount", roundOffAmt:0, amountReceived:60000, status:"Partially Paid", createdAt:"2026-02-28",
  },
  {
    id: "i12", invoiceNo: 12, invoiceDate: "2026-02-28",
    party: { name: "anando" }, dueDate: "2026-03-27", showDueDate: true,
    paymentTermsDays: 28, billItems: [{ qty:1, price:180000, discountPct:0, discountAmt:0, taxRate:0, amount:180000 }],
    additionalCharges: [], discountPct:0, discountAmt:0, applyTCS:false, tcsRate:0,
    tcsBase:"Taxable Amount", roundOffAmt:0, amountReceived:100000, status:"Partially Paid", createdAt:"2026-02-28",
  },
  {
    id: "i4", invoiceNo: 4, invoiceDate: "2026-02-27",
    party: { name: "anando" }, dueDate: "2026-02-27", showDueDate: false,
    paymentTermsDays: 0, billItems: [{ qty:1, price:30000, discountPct:0, discountAmt:0, taxRate:0, amount:30000 }],
    additionalCharges: [], discountPct:0, discountAmt:0, applyTCS:false, tcsRate:0,
    tcsBase:"Taxable Amount", roundOffAmt:0, amountReceived:30000, status:"Paid", createdAt:"2026-02-27",
  },
  {
    id: "i3", invoiceNo: 3, invoiceDate: "2026-02-27",
    party: { name: "anando" }, dueDate: "2026-03-26", showDueDate: true,
    paymentTermsDays: 27, billItems: [{ qty:1, price:42000, discountPct:0, discountAmt:0, taxRate:0, amount:42000 }],
    additionalCharges: [], discountPct:0, discountAmt:0, applyTCS:false, tcsRate:0,
    tcsBase:"Taxable Amount", roundOffAmt:0, amountReceived:40000, status:"Partially Paid", createdAt:"2026-02-27",
  },
];

// ─── Derived helpers ──────────────────────────────────────────────────────────
/** Compute invoice total from billItems + charges + discount + TCS + roundOff */
function calcTotal(inv: SalesInvoice): number {
  const itemsTotal = inv.billItems.reduce((s, i) => s + i.amount, 0);
  const chargesTotal = inv.additionalCharges.reduce((s, c) => s + c.amount, 0);
  const taxable = itemsTotal + chargesTotal;
  const discVal = taxable * (inv.discountPct / 100) + inv.discountAmt;
  const afterDisc = taxable - discVal;
  const tcsBase = inv.tcsBase === "Total Amount" ? afterDisc : taxable;
  const tcs = inv.applyTCS ? tcsBase * (inv.tcsRate / 100) : 0;
  return Math.round((afterDisc + tcs + inv.roundOffAmt) * 100) / 100;
}

/** Unpaid amount = total - amountReceived */
function calcUnpaid(inv: SalesInvoice): number {
  return Math.max(0, calcTotal(inv) - inv.amountReceived);
}

/** How many days until due, shown as "X Days" */
function dueInLabel(inv: SalesInvoice): string | null {
  if (!inv.showDueDate || !inv.dueDate) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(inv.dueDate); due.setHours(0,0,0,0);
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return `${Math.abs(diff)} Days overdue`;
  if (diff === 0) return "Due Today";
  return `${diff} Days`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtCurrency(n: number) {
  return "₹ " + n.toLocaleString("en-IN", { maximumFractionDigits: 1 });
}
function todayStr() { return new Date().toISOString().split("T")[0]; }

function getDateRange(filter: DateFilterOption): { start: Date; end: Date } {
  const today = new Date(); today.setHours(0,0,0,0);
  const end = new Date(today); end.setHours(23,59,59,999);
  switch (filter) {
    case "Today": return { start: today, end };
    case "Yesterday": { const y=new Date(today); y.setDate(y.getDate()-1); const ye=new Date(y); ye.setHours(23,59,59,999); return { start:y, end:ye }; }
    case "This Week": { const s=new Date(today); s.setDate(s.getDate()-s.getDay()); return { start:s, end }; }
    case "Last Week": { const s=new Date(today); s.setDate(s.getDate()-s.getDay()-7); const e=new Date(s); e.setDate(e.getDate()+6); e.setHours(23,59,59,999); return { start:s, end:e }; }
    case "Last 7 Days": { const s=new Date(today); s.setDate(s.getDate()-6); return { start:s, end }; }
    case "This Month": return { start:new Date(today.getFullYear(),today.getMonth(),1), end };
    case "Previous Month": { const s=new Date(today.getFullYear(),today.getMonth()-1,1); const e=new Date(today.getFullYear(),today.getMonth(),0); e.setHours(23,59,59,999); return { start:s, end:e }; }
    case "Last 30 Days": { const s=new Date(today); s.setDate(s.getDate()-29); return { start:s, end }; }
    case "This Quarter": { const qs=Math.floor(today.getMonth()/3)*3; return { start:new Date(today.getFullYear(),qs,1), end }; }
    case "Previous Quarter": { const qs=Math.floor(today.getMonth()/3)*3-3; const s=new Date(today.getFullYear(),qs,1); const e=new Date(today.getFullYear(),qs+3,0); e.setHours(23,59,59,999); return { start:s, end:e }; }
    case "Current Fiscal Year": { const fy=today.getMonth()>=3?today.getFullYear():today.getFullYear()-1; return { start:new Date(fy,3,1), end }; }
    case "Previous Fiscal Year": { const fy=today.getMonth()>=3?today.getFullYear()-1:today.getFullYear()-2; const s=new Date(fy,3,1); const e=new Date(fy+1,2,31); e.setHours(23,59,59,999); return { start:s, end:e }; }
    case "Last 365 Days": { const s=new Date(today); s.setDate(s.getDate()-364); return { start:s, end }; }
    default: return { start:new Date(0), end };
  }
}

const DATE_OPTIONS: DateFilterOption[] = [
  "Today","Yesterday","This Week","Last Week","Last 7 Days",
  "This Month","Previous Month","Last 30 Days","This Quarter",
  "Previous Quarter","Current Fiscal Year","Previous Fiscal Year",
  "Last 365 Days","Custom",
];

// ─── Calendar ─────────────────────────────────────────────────────────────────
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function CalPicker({ startDate, endDate, onSelect, onClose }: { startDate:string; endDate:string; onSelect:(s:string,e:string)=>void; onClose:()=>void }) {
  const today = new Date();
  const [vm,setVm] = useState(today.getMonth());
  const [vy,setVy] = useState(today.getFullYear());
  const [picking,setPicking] = useState<"start"|"end">("start");
  const [ls,setLs] = useState(startDate);
  const [le,setLe] = useState(endDate);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{ function h(e:MouseEvent){if(ref.current&&!ref.current.contains(e.target as Node))onClose();} document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);
  const dim=(m:number,y:number)=>new Date(y,m+1,0).getDate();
  const fdo=(m:number,y:number)=>new Date(y,m,1).getDay();
  const cells=[...Array(fdo(vm,vy)).fill(null),...Array.from({length:dim(vm,vy)},(_,i)=>i+1)];
  while(cells.length%7!==0) cells.push(null);
  function ds(d:number){return `${vy}-${String(vm+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;}
  function clickDay(d:number){const s=ds(d); if(picking==="start"){setLs(s);setLe("");setPicking("end");}else{if(s<ls){setLe(ls);setLs(s);}else setLe(s);setPicking("start");}}
  function inRange(d:number){const s=ds(d);return ls&&le&&s>ls&&s<le;}
  return (
    <div ref={ref} className="sil-cal-popup">
      <div className="sil-cal-header-row">
        <span className={`sil-cal-tab${picking==="start"?" sil-cal-tab--active":""}`} onClick={()=>setPicking("start")}>Select Start Date</span>
        <span className={`sil-cal-tab${picking==="end"?" sil-cal-tab--active":""}`} onClick={()=>setPicking("end")}>Select End Date</span>
      </div>
      <div className="sil-cal-nav">
        <div className="sil-cal-nav-group">
          <button onClick={()=>{if(vm===0){setVm(11);setVy(y=>y-1);}else setVm(m=>m-1);}}>‹</button>
          <span>{MONTHS[vm]}</span>
          <button onClick={()=>{if(vm===11){setVm(0);setVy(y=>y+1);}else setVm(m=>m+1);}}>›</button>
        </div>
        <div className="sil-cal-nav-group">
          <button onClick={()=>setVy(y=>y-1)}>‹</button><span>{vy}</span><button onClick={()=>setVy(y=>y+1)}>›</button>
        </div>
      </div>
      <div className="sil-cal-grid">
        {DAYS.map(d=><div key={d} className="sil-cal-dh">{d}</div>)}
        {cells.map((day,i)=>{if(!day)return<div key={i}/>;const s=ds(day);return(
          <button key={i} className={`sil-cal-day${s===ls||s===le?" sil-cal-day--sel":""}${inRange(day)?" sil-cal-day--range":""}`} onClick={()=>clickDay(day)}>{day}</button>
        );})}
      </div>
      <div className="sil-cal-footer">
        <button className="sil-cal-cancel" onClick={onClose}>CANCEL</button>
        <button className="sil-cal-ok" onClick={()=>{if(ls&&le){onSelect(ls,le);onClose();}}}>OK</button>
      </div>
    </div>
  );
}

// ─── Quick Settings Modal ─────────────────────────────────────────────────────
function QuickSettingsModal({ onClose }: { onClose: () => void }) {
  const [prefixEnabled, setPrefixEnabled] = useState(true);
  const [prefix, setPrefix] = useState("");
  const [seqNo, setSeqNo] = useState(() => {
    const inv: SalesInvoice[] = JSON.parse(localStorage.getItem("salesInvoices") || "[]");
    return inv.length > 0 ? Math.max(...inv.map(i=>i.invoiceNo)) + 1 : 1;
  });
  const [showPurchasePrice, setShowPurchasePrice] = useState(true);
  const [showItemImage, setShowItemImage] = useState(true);
  const [priceHistory, setPriceHistory] = useState(true);
  const [theme, setTheme] = useState("Advanced GST");
  function Toggle({ on, set }: { on:boolean; set:(v:boolean)=>void }) {
    return <button className={`sil-toggle${on?" sil-toggle--on":""}`} onClick={()=>set(!on)}><span className="sil-toggle-thumb"/></button>;
  }
  return (
    <div className="sil-overlay" onClick={onClose}>
      <div className="sil-modal sil-settings-modal" onClick={e=>e.stopPropagation()}>
        <div className="sil-modal-hdr"><span>Quick Invoice Settings</span><button onClick={onClose}>✕</button></div>
        <div className="sil-settings-body">
          <div className="sil-settings-section">
            <div className="sil-settings-row">
              <div><div className="sil-settings-label">Invoice Prefix & Sequence Number</div><div className="sil-settings-sub">Add your custom prefix & sequence for Invoice Numbering</div></div>
              <Toggle on={prefixEnabled} set={setPrefixEnabled}/>
            </div>
            {prefixEnabled && (
              <div className="sil-prefix-row">
                <div><label>Prefix</label><input value={prefix} onChange={e=>setPrefix(e.target.value)} placeholder="Prefix"/></div>
                <div><label>Sequence Number</label><input type="number" value={seqNo} onChange={e=>setSeqNo(Number(e.target.value))}/></div>
              </div>
            )}
            <div className="sil-invoice-no-preview">Invoice Number: {(prefix||"")+seqNo}</div>
          </div>
          {[
            {label:"Show Purchase Price while adding Items", sub:"Add purchase price while adding items", on:showPurchasePrice, set:setShowPurchasePrice},
            {label:"Show Item Image on Invoice", sub:"This will apply to all vouchers except for Payment In and Payment Out", on:showItemImage, set:setShowItemImage},
          ].map((s,i)=>(
            <div key={i} className="sil-settings-section">
              <div className="sil-settings-row">
                <div><div className="sil-settings-label">{s.label}</div><div className="sil-settings-sub">{s.sub}</div></div>
                <Toggle on={s.on} set={s.set}/>
              </div>
            </div>
          ))}
          <div className="sil-settings-section">
            <div className="sil-settings-row">
              <div>
                <div className="sil-settings-label">Price History <span className="sil-badge-new">New</span></div>
                <div className="sil-settings-sub">Show last 5 sales / purchase prices of the item for the selected party in invoice</div>
              </div>
              <Toggle on={priceHistory} set={setPriceHistory}/>
            </div>
          </div>
          <div className="sil-settings-section">
            <div className="sil-settings-label" style={{marginBottom:8}}>Choose Invoice Theme</div>
            <select value={theme} onChange={e=>setTheme(e.target.value)} className="sil-theme-select">
              <option>Advanced GST</option><option>Simple GST</option><option>Basic</option><option>Professional</option>
            </select>
          </div>
          <div className="sil-customize-banner">
            <div>
              <div style={{fontWeight:600,marginBottom:4}}>Now <span style={{color:"#4f46e5"}}>customise Invoice</span> with ease</div>
              <button className="sil-full-settings-btn">Full Invoice Settings →</button>
            </div>
            <div className="sil-invoice-thumb">
              <div style={{background:"#e5e7eb",borderRadius:4,width:48,height:60,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#6b7280",fontWeight:600}}>INVOICE</div>
            </div>
          </div>
        </div>
        <div className="sil-modal-footer">
          <button className="sil-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="sil-btn-primary" onClick={onClose}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Bulk Download Modal ──────────────────────────────────────────────────────
function BulkDownloadModal({ invoiceCount, parties, onClose }: { invoiceCount:number; parties:string[]; onClose:()=>void }) {
  const [dateRange,setDateRange] = useState("Last 365 Days");
  const [party,setParty] = useState("All Parties");
  const [email,setEmail] = useState("");
  const [sendCA,setSendCA] = useState(false);
  const [caEmail,setCaEmail] = useState("");
  return (
    <div className="sil-overlay" onClick={onClose}>
      <div className="sil-modal sil-bulk-modal" onClick={e=>e.stopPropagation()}>
        <div className="sil-modal-hdr"><span>Invoice Bulk Download</span><button onClick={onClose}>✕</button></div>
        <div className="sil-bulk-body">
          <div className="sil-bulk-selectors">
            <div>
              <label>Select Date Range</label>
              <select value={dateRange} onChange={e=>setDateRange(e.target.value)} className="sil-bulk-select">
                {DATE_OPTIONS.filter(d=>d!=="Custom").map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label>Select Party (Optional)</label>
              <select value={party} onChange={e=>setParty(e.target.value)} className="sil-bulk-select">
                <option>All Parties</option>
                {parties.map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="sil-bulk-email-section">
            <label>Email</label>
            <input className="sil-bulk-email-input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter Your Email"/>
          </div>
          <div className="sil-bulk-ca-row">
            <input className="bx" type="checkbox" checked={sendCA} onChange={e=>setSendCA(e.target.checked)} id="sendca"/>
            <label className="ax" htmlFor="sendca">Send to CA</label>
          </div>
          {sendCA && <input className="sil-bulk-email-input" value={caEmail} onChange={e=>setCaEmail(e.target.value)} placeholder="CA Email" style={{marginTop:8}}/>}
        </div>
        <div className="sil-bulk-footer">
          <span>{invoiceCount} Invoice(s) Selected</span>
          <div style={{display:"flex",gap:12}}>
            <button className="sil-btn-cancel" onClick={onClose}>Cancel</button>
            <button className={`sil-btn-primary${!email?" sil-btn-disabled":""}`} disabled={!email}>Email</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Row Action Menu ──────────────────────────────────────────────────────────
// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Icons = {
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  History: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
      <polyline points="12 7 12 12 15 15"/>
    </svg>
  ),
  Duplicate: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  CreditNote: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="12" y1="18" x2="12" y2="12"/>
      <line x1="9" y1="15" x2="15" y2="15"/>
    </svg>
  ),
  Download: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Share: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  ),
  Cancel: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
    </svg>
  ),
  Delete: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4h6v2"/>
    </svg>
  ),
};

function RowMenu({ onEdit, onEditHistory, onDuplicate, onCreditNote, onCancel, onDelete }: {
  onEdit:()=>void; onEditHistory:()=>void; onDuplicate:()=>void;
  onCreditNote:()=>void; onCancel:()=>void; onDelete:()=>void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const items = [
    { Icon: Icons.Edit,       label: "Edit",              action: onEdit },
    { Icon: Icons.History,    label: "Edit History",      action: onEditHistory },
    { Icon: Icons.Duplicate,  label: "Duplicate",         action: onDuplicate },
    { Icon: Icons.CreditNote, label: "Issue Credit Note", action: onCreditNote, badge: true },
    { Icon: Icons.Cancel,     label: "Cancel Invoice",    action: onCancel, warning: true },
    { Icon: Icons.Delete,     label: "Delete",            action: onDelete, danger: true },
  ];

  return (
    <div ref={ref} className="sil-row-menu">
      <button className="sil-row-menu-btn" onClick={e => { e.stopPropagation(); setOpen(!open); }}>
        <svg viewBox="0 0 24 24" fill="currentColor" style={{width:16,height:16}}>
          <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
        </svg>
      </button>
      {open && (
        <div className="sil-row-dropdown">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            const isCancelIdx = items.findIndex(x => x.label === "Cancel Invoice");
            const showSep = i === isCancelIdx - 1;
            return (
              <div key={item.label}>
                {showSep && <div className="sil-row-sep"/>}
                <button
                  className={`sil-row-item${(item as any).danger ? " sil-row-item--danger" : ""}${(item as any).warning ? " sil-row-item--warning" : ""}`}
                  onClick={() => { item.action(); setOpen(false); }}>
                  <span className="sil-row-icon"><item.Icon/></span>
                  <span>{item.label}</span>
                  {(item as any).badge && <span className="sil-badge-new" style={{marginLeft:"auto"}}>New</span>}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SalesInvoiceList() {
  const navigate = useNavigate();

  // ── Load from localStorage — supports BOTH old flat Invoice shape AND new SalesInvoice shape
  const [invoices, setInvoices] = useState<SalesInvoice[]>(() => {
    const raw: any[] = JSON.parse(localStorage.getItem("salesInvoices") || "[]");
    if (raw.length === 0) return SAMPLE_INVOICES;

    // Normalise: if old flat format (has "invoiceNumber"), convert to SalesInvoice shape
    return raw.map((r): SalesInvoice => {
      if (r.invoiceNo !== undefined) return r as SalesInvoice; // already new format
      // Old flat format: { id, date, invoiceNumber, partyName, amount, unpaidAmount, status }
      return {
        id: r.id,
        invoiceNo: r.invoiceNumber ?? 0,
        invoiceDate: r.date ?? todayStr(),
        party: r.partyName ? { name: r.partyName } : null,
        dueDate: r.dueDate || r.date || todayStr(),
        showDueDate: !!r.dueIn,
        paymentTermsDays: 0,
        billItems: [{ qty:1, price:r.amount??0, discountPct:0, discountAmt:0, taxRate:0, amount:r.amount??0 }],
        additionalCharges: [],
        discountPct: 0, discountAmt: 0, applyTCS: false, tcsRate: 0,
        tcsBase: "Taxable Amount", roundOffAmt: 0,
        amountReceived: r.amount - (r.unpaidAmount ?? 0),
        status: r.status ?? "Unpaid",
        createdAt: r.date ?? todayStr(),
      };
    });
  });

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Total Sales");
  const [dateFilter, setDateFilter] = useState<DateFilterOption>("Last 365 Days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showDateDrop, setShowDateDrop] = useState(false);
  const [showCal, setShowCal] = useState(false);
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState("Invoice No. & Pa...");
  const [showSearch, setShowSearch] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [showBulkDownload, setShowBulkDownload] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortDir, setSortDir] = useState<"asc"|"desc">("desc");
  const [sortField, setSortField] = useState<"date"|"amount">("date");
  const [deleteTarget, setDeleteTarget] = useState<string|null>(null);
  const [cancelTarget, setCancelTarget] = useState<string|null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelReasonDrop, setShowCancelReasonDrop] = useState(false);
  const [profitInvoice, setProfitInvoice] = useState<SalesInvoice|null>(null);
  const [creditNoteInvoice, setCreditNoteInvoice] = useState<SalesInvoice|null>(null);
  const [viewInvoice, setViewInvoice] = useState<SalesInvoice|null>(null);

  // Load the active invoice template saved by InvoiceBuilder
  const [activeTemplate, setActiveTemplate] = useState<any|null>(() => {
    try { return JSON.parse(localStorage.getItem("activeInvoiceTemplate") || "null"); }
    catch { return null; }
  });

  // Default business info (fallback if no template)
  const defaultBusiness = {
    companyName: "Mondal Electronic",
    address: "West Shantinagar Anandnagar Bally, Howrah Saree House, Howrah, 711227",
    gstin: "19AABCM1234R1ZX",
    phone: "06289909521",
    email: "rakeshranjantiwari11@gmail.com",
    pan: "AABCM1234R",
    bank: "SBI - 1234567890",
    ifsc: "SBIN0001234",
  };

  const reportsRef = useRef<HTMLDivElement>(null);
  const bulkRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  // Reload from localStorage whenever we navigate back here (SPA navigation or tab focus)
  useEffect(() => {
    function reload() {
      const raw: any[] = JSON.parse(localStorage.getItem("salesInvoices") || "[]");
      if (raw.length > 0) {
        setInvoices(raw.map((r: any): SalesInvoice => {
          if (r.invoiceNo !== undefined) return r as SalesInvoice;
          return {
            id: r.id, invoiceNo: r.invoiceNumber ?? 0,
            invoiceDate: r.date ?? todayStr(), party: r.partyName ? { name: r.partyName } : null,
            dueDate: r.dueDate || r.date || todayStr(), showDueDate: !!r.dueIn, paymentTermsDays: 0,
            billItems: [{ qty:1, price:r.amount??0, discountPct:0, discountAmt:0, taxRate:0, amount:r.amount??0 }],
            additionalCharges: [], discountPct:0, discountAmt:0, applyTCS:false, tcsRate:0,
            tcsBase: "Taxable Amount", roundOffAmt:0,
            amountReceived: r.amount - (r.unpaidAmount ?? 0),
            status: r.status ?? "Unpaid", createdAt: r.date ?? todayStr(),
          };
        }));
      }
    }
    reload(); // run on mount (catches navigation within SPA)
    window.addEventListener("focus", reload);
    document.addEventListener("visibilitychange", reload);
    return () => {
      window.removeEventListener("focus", reload);
      document.removeEventListener("visibilitychange", reload);
    };
  }, []);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (reportsRef.current && !reportsRef.current.contains(e.target as Node)) setShowReports(false);
      if (bulkRef.current && !bulkRef.current.contains(e.target as Node)) setShowBulkMenu(false);
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) setShowDateDrop(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Stats — computed from real totals ─────────────────────────────
  const totalSales = invoices.reduce((s, i) => s + calcTotal(i), 0);
  const totalPaid = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + calcTotal(i), 0)
    + invoices.filter(i => i.status === "Partially Paid").reduce((s, i) => s + i.amountReceived, 0);
  const totalUnpaid = invoices.filter(i => i.status === "Unpaid" || i.status === "Partially Paid").reduce((s, i) => s + calcUnpaid(i), 0);
  const totalCancelled = invoices.filter(i => i.status === "Cancelled").reduce((s, i) => s + calcTotal(i), 0);

  // ── Filter ────────────────────────────────────────────────────────
  const filtered = invoices.filter(inv => {
    if (statusFilter === "Paid" && inv.status !== "Paid") return false;
    if (statusFilter === "Unpaid" && inv.status !== "Unpaid") return false;
    if (statusFilter === "Cancelled" && inv.status !== "Cancelled") return false;
    if (dateFilter === "Custom") {
      if (customStart && customEnd) {
        const d = new Date(inv.invoiceDate); d.setHours(0,0,0,0);
        const s = new Date(customStart); s.setHours(0,0,0,0);
        const e = new Date(customEnd); e.setHours(23,59,59,999);
        if (d < s || d > e) return false;
      }
    } else {
      const { start, end } = getDateRange(dateFilter);
      const d = new Date(inv.invoiceDate);
      if (d < start || d > end) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const pname = (inv.party?.name || "").toLowerCase();
      if (!pname.includes(q) && !String(inv.invoiceNo).includes(q)) return false;
    }
    return true;
  }).sort((a, b) => {
    const mul = sortDir === "asc" ? 1 : -1;
    if (sortField === "date") return mul * (new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime());
    return mul * (calcTotal(a) - calcTotal(b));
  });

  // ── Select all ────────────────────────────────────────────────────
  const allSelected = filtered.length > 0 && filtered.every(i => selected.has(i.id));
  function toggleAll() { allSelected ? setSelected(new Set()) : setSelected(new Set(filtered.map(i => i.id))); }
  function toggleOne(id: string) { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s); }

  // ── Mutating actions ──────────────────────────────────────────────
  function persist(updated: SalesInvoice[]) {
    setInvoices(updated);
    localStorage.setItem("salesInvoices", JSON.stringify(updated));
  }
  function handleDelete(id: string) {
    persist(invoices.filter(i => i.id !== id));
    setDeleteTarget(null);
  }
  function handleDuplicate(inv: SalesInvoice) {
    const maxNo = Math.max(...invoices.map(i => i.invoiceNo));
    const dup: SalesInvoice = { ...inv, id: `si-${Date.now()}`, invoiceNo: maxNo + 1, invoiceDate: todayStr(), createdAt: todayStr(), amountReceived: 0, status: "Unpaid" };
    persist([dup, ...invoices]);
  }
  function handleCancel(id: string) {
    persist(invoices.map(i => i.id === id ? { ...i, status: "Cancelled" as const } : i));
    setCancelTarget(null);
    setCancelReason("");
  }
  function handleIssueCreditNote(inv: SalesInvoice) {
    setCreditNoteInvoice(inv);
    navigate("/cashier/credit-note", { state: { fromInvoice: inv } });
  }

  const dateLabel = dateFilter === "Custom" && customStart && customEnd
    ? `${fmtDate(customStart)} – ${fmtDate(customEnd)}`
    : dateFilter;

  const uniqueParties = [...new Set(invoices.map(i => i.party?.name).filter(Boolean))] as string[];

  return (
    <div className="sil-page">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="sil-header">
        <h1 className="sil-title">Sales Invoices</h1>
        <div className="sil-header-actions">
          {/* <div ref={reportsRef} className="sil-reports-wrap">
            <button className="sil-reports-btn" onClick={()=>setShowReports(!showReports)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              Reports
              <svg className="sil-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showReports && (
              <div className="sil-dropdown">
                {["Sales Summary","GSTR-1 (Sales)","DayBook","Bill Wise Profit"].map(r=>(
                  <button key={r} className="sil-drop-item" onClick={()=>setShowReports(false)}>{r}</button>
                ))}
              </div>
            )}
          </div> */}
          <button className="sil-icon-btn" onClick={()=>setShowSettings(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span className="sil-notif-dot"/>
          </button>
          {/* <button className="sil-icon-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="3 9 12 15 21 9"/></svg>
          </button> */}
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────── */}
      <div className="sil-stats">
        {([
          {label:"Total Sales", value:totalSales,    key:"Total Sales", color:"#4f46e5"},
          {label:"Paid",        value:totalPaid,     key:"Paid",        color:"#16a34a"},
          {label:"Unpaid",      value:totalUnpaid,   key:"Unpaid",      color:"#dc2626"},
          {label:"Cancelled",   value:totalCancelled,key:"Cancelled",   color:"#6b7280"},
        ] as {label:string;value:number;key:StatusFilter;color:string}[]).map(card=>(
          <button key={card.key}
            className={`sil-stat-card${statusFilter===card.key?" sil-stat-card--active":""}`}
            onClick={()=>setStatusFilter(card.key)}>
            <div className="sil-stat-label" style={{color:card.color}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:16,height:16}}>
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              {card.label}
            </div>
            <div className="sil-stat-value">{card.value > 0 ? fmtCurrency(card.value) : "₹ –"}</div>
          </button>
        ))}
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div className="sil-toolbar">
        <div className="sil-toolbar-left">
          {!showSearch ? (
            <button className="sil-icon-btn" onClick={()=>setShowSearch(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </button>
          ) : (
            <div className="sil-search-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sil-search-icon"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input autoFocus className="sil-search-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..."/>
              <select className="sil-search-type" value={searchType} onChange={e=>setSearchType(e.target.value)}>
                <option>Invoice No. & Pa...</option><option>Party Name</option><option>Invoice Number</option>
              </select>
              <button className="sil-search-clear" onClick={()=>{setSearch("");setShowSearch(false);}}>✕</button>
            </div>
          )}
          <div ref={dateRef} className="sil-date-wrap">
            <button className="sil-date-btn" onClick={()=>setShowDateDrop(!showDateDrop)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {dateLabel}
              <svg className="sil-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showDateDrop && (
              <div className="sil-date-dropdown">
                {DATE_OPTIONS.map(opt=>(
                  <button key={opt} className={`sil-date-item${dateFilter===opt?" sil-date-item--active":""}`}
                    onClick={()=>{setDateFilter(opt); if(opt==="Custom"){setShowCal(true);setShowDateDrop(false);}else setShowDateDrop(false);}}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
            {showCal && <CalPicker startDate={customStart} endDate={customEnd} onSelect={(s,e)=>{setCustomStart(s);setCustomEnd(e);}} onClose={()=>setShowCal(false)}/>}
          </div>
        </div>
        <div className="sil-toolbar-right">
          {selected.size > 0 && (
            <>
              <span className="sil-selected-tag">
                {selected.size} Invoice{selected.size > 1 ? "s" : ""} Selected
                <button onClick={()=>setSelected(new Set())}>✕</button>
              </span>
              <button className="sil-icon-btn" title="Print Selected" onClick={()=>{
                const ids = Array.from(selected);
                const toprint = invoices.filter(inv => ids.includes(inv.id));
                const w = window.open("","_blank");
                if(w){
                  w.document.write(`<!DOCTYPE html><html><head><title>Print Invoices</title>
                  <style>body{font-family:sans-serif;font-size:13px;} .page{page-break-after:always;padding:24px;border:1px solid #e5e7eb;margin-bottom:20px;} table{width:100%;border-collapse:collapse;} th,td{padding:6px 8px;border:1px solid #e5e7eb;} h2{color:#4f46e5;} @media print{.page{border:none;}}</style>
                  </head><body>${toprint.map(inv=>`<div class="page"><h2>Invoice #${inv.invoiceNo}</h2><p>Party: ${inv.party?.name||"–"} | Date: ${inv.invoiceDate} | Status: ${inv.status}</p><table><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>${inv.billItems.map(i=>`<tr><td>${(i as any).name||"Item"}</td><td>${i.qty}</td><td>₹${i.price}</td><td>₹${i.amount}</td></tr>`).join("")}<tr><td colspan="3"><b>Total</b></td><td><b>₹${inv.billItems.reduce((s,i)=>s+i.amount,0).toLocaleString("en-IN")}</b></td></tr></table></div>`).join("")}</body></html>`);
                  w.document.close(); w.focus(); setTimeout(()=>{w.print();w.close();},500);
                }
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              </button>
              <button className="sil-icon-btn" title="Download Selected" onClick={()=>{
                const ids = Array.from(selected);
                const todown = invoices.filter(inv => ids.includes(inv.id));
                const csv = ["Invoice No,Party,Date,Status,Amount",
                  ...todown.map(inv=>`${inv.invoiceNo},${inv.party?.name||""},${inv.invoiceDate},${inv.status},${inv.billItems.reduce((s,i)=>s+i.amount,0)}`)
                ].join("\n");
                const blob = new Blob([csv], {type:"text/csv"});
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href=url; a.download=`invoices_${Date.now()}.csv`; a.click();
                URL.revokeObjectURL(url);
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
            </>
          )}
          <div ref={bulkRef} className="sil-bulk-wrap">
            <button className="sil-bulk-btn" onClick={()=>setShowBulkMenu(!showBulkMenu)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              Bulk Actions
              <svg className="sil-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showBulkMenu && (
              <div className="sil-dropdown">
                <button className="sil-drop-item" onClick={()=>{setShowBulkDownload(true);setShowBulkMenu(false);}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Bulk Download
                </button>
              </div>
            )}
          </div>
          <button className="sil-create-btn" onClick={()=>navigate("/cashier/sales-invoice")}>
            Create Sales Invoice
          </button>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────── */}
      <div className="sil-table-wrap">
        <table className="sil-table">
          <thead>
            <tr>
              <th className="sil-th sil-th--cb"><input type="checkbox" checked={allSelected} onChange={toggleAll}/></th>
              <th className="sil-th sil-th--sortable" onClick={()=>{setSortField("date");setSortDir(d=>d==="asc"?"desc":"asc");}}>
                Date <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="8 9 12 5 16 9"/><polyline points="16 15 12 19 8 15"/></svg>
              </th>
              <th className="sil-th">Invoice Number</th>
              <th className="sil-th">Party Name</th>
              <th className="sil-th">Due In</th>
              <th className="sil-th sil-th--sortable" onClick={()=>{setSortField("amount");setSortDir(d=>d==="asc"?"desc":"asc");}}>
                Amount <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="8 9 12 5 16 9"/><polyline points="16 15 12 19 8 15"/></svg>
              </th>
              <th className="sil-th">Status</th>
              <th className="sil-th"/>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="sil-empty">
                <svg viewBox="0 0 80 80" fill="none" style={{width:64,height:64,marginBottom:12}}>
                  <rect x="10" y="15" width="50" height="50" rx="4" stroke="#d1d5db" strokeWidth="2"/>
                  <line x1="18" y1="30" x2="52" y2="30" stroke="#d1d5db" strokeWidth="1.5"/>
                  <line x1="18" y1="40" x2="40" y2="40" stroke="#d1d5db" strokeWidth="1.5"/>
                  <line x1="18" y1="50" x2="45" y2="50" stroke="#d1d5db" strokeWidth="1.5"/>
                  <line x1="48" y1="54" x2="60" y2="66" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1="60" y1="54" x2="48" y2="66" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                <span>No Transactions Matching the current filter</span>
              </td></tr>
            ) : filtered.map(inv => {
              const total = calcTotal(inv);
              const unpaid = calcUnpaid(inv);
              const dueLabel = dueInLabel(inv);
              return (
                <tr key={inv.id} className="sil-tr"
                  onClick={()=>setViewInvoice(inv)}>
                  <td className="sil-td sil-td--cb" onClick={e=>e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(inv.id)} onChange={()=>toggleOne(inv.id)}/>
                  </td>
                  <td className="sil-td">{fmtDate(inv.invoiceDate)}</td>
                  <td className="sil-td">{inv.invoiceNo}</td>
                  <td className="sil-td">{inv.party?.name ?? "–"}</td>
                  <td className="sil-td">{dueLabel ?? "–"}</td>
                  <td className="sil-td">
                    <div>{fmtCurrency(total)}</div>
                    {unpaid > 0 && <div className="sil-unpaid-sub">(₹ {unpaid.toLocaleString("en-IN",{maximumFractionDigits:1})} unpaid)</div>}
                  </td>
                  <td className="sil-td">
                    <span className={`sil-status sil-status--${inv.status.toLowerCase().replace(" ","-")}`}>{inv.status}</span>
                  </td>
                  <td className="sil-td sil-td--menu" onClick={e=>e.stopPropagation()}>
                    <RowMenu
                      onEdit={()=>navigate(`/cashier/sales-invoice/edit/${inv.id}`)}
                      onEditHistory={()=>alert("Edit History — connect to audit log")}
                      onDuplicate={()=>handleDuplicate(inv)}
                      onCreditNote={()=>handleIssueCreditNote(inv)}
                      onCancel={()=>{ setCancelTarget(inv.id); setCancelReason(""); }}
                      onDelete={()=>setDeleteTarget(inv.id)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Modals ───────────────────────────────────────────────── */}
      {showSettings && <QuickSettingsModal onClose={()=>setShowSettings(false)}/>}
      {showBulkDownload && <BulkDownloadModal invoiceCount={selected.size||filtered.length} parties={uniqueParties} onClose={()=>setShowBulkDownload(false)}/>}

      {deleteTarget && (
        <div className="sil-overlay" onClick={()=>setDeleteTarget(null)}>
          <div style={{ background:"#fff", borderRadius:16, width:500, maxWidth:"95vw", padding:"32px 32px 24px", boxShadow:"0 20px 60px rgba(0,0,0,.18)", position:"relative", fontFamily:"Segoe UI,sans-serif" }} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setDeleteTarget(null)} style={{ position:"absolute", top:18, right:18, background:"none", border:"none", fontSize:18, cursor:"pointer", color:"#6b7280", lineHeight:1 }}>✕</button>
            <h3 style={{ fontSize:18, fontWeight:700, color:"#111827", margin:"0 0 8px" }}>Are you sure you want to delete this Sales Invoice?</h3>
            <p style={{ fontSize:14, color:"#6b7280", margin:"0 0 28px" }}>Once deleted, it cannot be recovered</p>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:12 }}>
              <button onClick={()=>setDeleteTarget(null)} style={{ padding:"10px 28px", border:"1px solid #e5e7eb", background:"#fff", borderRadius:8, fontSize:14, cursor:"pointer", fontWeight:500, color:"#374151" }}>Cancel Invoice</button>
              <button onClick={()=>handleDelete(deleteTarget)} style={{ padding:"10px 28px", border:"1.5px solid #dc2626", background:"#fff", borderRadius:8, fontSize:14, cursor:"pointer", fontWeight:600, color:"#dc2626" }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Invoice Modal ──────────────────────────────────────── */}
      {cancelTarget && (
        <div className="sil-overlay" onClick={()=>{ setCancelTarget(null); setShowCancelReasonDrop(false); }}>
          <div style={{ background:"#fff", borderRadius:16, width:500, maxWidth:"95vw", padding:"28px 28px 24px", boxShadow:"0 20px 60px rgba(0,0,0,.18)", position:"relative", fontFamily:"Segoe UI,sans-serif" }} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>{ setCancelTarget(null); setShowCancelReasonDrop(false); }} style={{ position:"absolute", top:18, right:18, background:"none", border:"1px solid #e5e7eb", borderRadius:6, width:28, height:28, cursor:"pointer", color:"#6b7280", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            <h3 style={{ fontSize:17, fontWeight:700, color:"#111827", margin:"0 0 8px" }}>Are you sure you want to cancel this?</h3>
            <p style={{ fontSize:13, color:"#9ca3af", margin:"0 0 20px" }}>Cancellation of invoice is irreversible action.</p>
            <label style={{ fontSize:13, color:"#374151", fontWeight:500, display:"block", marginBottom:6 }}>Reason for cancellation<span style={{color:"#ef4444"}}>*</span></label>
            <div style={{ position:"relative", marginBottom:16 }}>
              <div onClick={()=>setShowCancelReasonDrop(v=>!v)}
                style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 14px", border:`1px solid ${showCancelReasonDrop ? "#6366f1" : "#e5e7eb"}`, borderRadius:8, cursor:"pointer", fontSize:14, color: cancelReason ? "#111827" : "#9ca3af", background:"#fff", userSelect:"none" }}>
                <span>{cancelReason || "Select"}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:16,height:16,color:"#9ca3af"}}><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              {showCancelReasonDrop && (
                <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:100, background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, boxShadow:"0 8px 24px rgba(0,0,0,.1)", overflow:"hidden" }}>
                  {["Order Cancelled","Duplicate entry","Wrong entry","Other"].map(r=>(
                    <div key={r} onClick={()=>{ setCancelReason(r); setShowCancelReasonDrop(false); }}
                      style={{ padding:"11px 14px", fontSize:14, color:"#374151", cursor:"pointer", borderBottom:"1px solid #f9fafb", background: cancelReason===r ? "#ede9fe" : "" }}
                      onMouseEnter={e=>{ if(cancelReason!==r)(e.currentTarget as HTMLDivElement).style.background="#f5f3ff"; }}
                      onMouseLeave={e=>{ if(cancelReason!==r)(e.currentTarget as HTMLDivElement).style.background=""; }}>
                      {r}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:8, padding:"10px 14px", display:"flex", gap:8, alignItems:"flex-start", marginBottom:24 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" style={{width:16,height:16,flexShrink:0,marginTop:1}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ fontSize:13, color:"#92400e", lineHeight:1.4 }}>For Partially-Paid/Paid invoice, Linked payments will be removed and party balance may change.</span>
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:12 }}>
              <button onClick={()=>{ setCancelTarget(null); setShowCancelReasonDrop(false); }} style={{ padding:"10px 24px", border:"1px solid #e5e7eb", background:"#fff", borderRadius:8, fontSize:14, cursor:"pointer", fontWeight:500, color:"#374151" }}>Close</button>
              <button disabled={!cancelReason} onClick={()=>handleCancel(cancelTarget)} style={{ padding:"10px 24px", background: cancelReason ? "#c7d2fe" : "#e5e7eb", border:"none", borderRadius:8, fontSize:14, cursor: cancelReason ? "pointer" : "not-allowed", fontWeight:600, color: cancelReason ? "#4f46e5" : "#9ca3af" }}>Cancel invoice</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Profit Details Modal ──────────────────────────────────────── */}
      {profitInvoice && (
        <div className="sil-overlay" onClick={()=>setProfitInvoice(null)}>
          <div style={{ background:"#fff", borderRadius:16, width:600, maxWidth:"95vw", boxShadow:"0 20px 60px rgba(0,0,0,.18)", fontFamily:"Segoe UI,sans-serif" }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 24px", borderBottom:"1px solid #f3f4f6" }}>
              <span style={{ fontSize:16, fontWeight:700, color:"#111827" }}>Profit Calculation</span>
              <button onClick={()=>setProfitInvoice(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"#6b7280", fontSize:20, lineHeight:1 }}>✕</button>
            </div>
            <div style={{ padding:"0 24px 24px" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", marginTop:16 }}>
                <thead>
                  <tr style={{ borderBottom:"2px solid #f3f4f6" }}>
                    <th style={{ textAlign:"left", fontSize:11, fontWeight:700, color:"#6b7280", padding:"8px 0", textTransform:"uppercase", letterSpacing:"0.5px" }}>Item Name</th>
                    <th style={{ textAlign:"center", fontSize:11, fontWeight:700, color:"#6b7280", padding:"8px 0", textTransform:"uppercase", letterSpacing:"0.5px" }}>QTY</th>
                    <th style={{ textAlign:"center", fontSize:11, fontWeight:700, color:"#4f46e5", padding:"8px 0", textTransform:"uppercase", letterSpacing:"0.5px" }}>Purchase Price<br/><span style={{fontWeight:400}}>(Excl. Taxes)</span></th>
                    <th style={{ textAlign:"right", fontSize:11, fontWeight:700, color:"#6b7280", padding:"8px 0", textTransform:"uppercase", letterSpacing:"0.5px" }}>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {(profitInvoice.billItems || []).map((item: any, i: number) => (
                    <tr key={i} style={{ borderBottom:"1px solid #f9fafb" }}>
                      <td style={{ padding:"10px 0", fontSize:14, color:"#374151", fontWeight:600 }}>{item.name || "Item"}</td>
                      <td style={{ textAlign:"center", padding:"10px 0", fontSize:14, color:"#374151" }}>{item.qty} {item.unit || "PCS"}</td>
                      <td style={{ textAlign:"center", padding:"10px 0", fontSize:14, color:"#9ca3af" }}>-</td>
                      <td style={{ textAlign:"right", padding:"10px 0", fontSize:14, color:"#9ca3af" }}>-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ borderTop:"1px solid #f3f4f6", marginTop:8 }}>
                {[
                  { label:"Sales Amount(Exl. Addn. Charges):", value:`₹ ${profitInvoice.billItems.reduce((s:number,i:any)=>s+(i.amount||0),0).toLocaleString("en-IN")}` },
                  { label:"Total Cost:", value:"₹ 0" },
                  { label:"Tax Payable:", value:"₹ 0" },
                ].map(r=>(
                  <div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #f9fafb", fontSize:14, color:"#374151" }}>
                    <span>{r.label}</span><span>{r.value}</span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", fontSize:14, color:"#374151", fontWeight:600 }}>
                  <div>
                    <div>Profit:</div>
                    <div style={{ fontSize:12, color:"#4f46e5", fontWeight:400 }}>(Sales Amount - Total Cost - Tax Payable)</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, color:"#9ca3af" }}>
                    <span>-</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" style={{width:16,height:16}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Invoice View Modal (reads active template from InvoiceBuilder) ── */}
      {viewInvoice && (
        <InvoiceViewModal
          invoice={viewInvoice as any}
          template={activeTemplate}
          business={defaultBusiness}
          onClose={()=>setViewInvoice(null)}
          onEdit={()=>{ setViewInvoice(null); navigate(`/cashier/sales-invoice/edit/${viewInvoice.id}`); }}
          onPrint={()=>{}}
          onDownload={()=>{
            const csv = `Invoice No,Party,Date,Status,Amount\n${viewInvoice.invoiceNo},${viewInvoice.party?.name||""},${viewInvoice.invoiceDate},${viewInvoice.status},${viewInvoice.billItems.reduce((s:number,i:any)=>s+i.amount,0)}`;
            const blob = new Blob([csv],{type:"text/csv"});
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href=url; a.download=`invoice_${viewInvoice.invoiceNo}.csv`; a.click(); URL.revokeObjectURL(url);
          }}
          onPaymentSaved={()=>{
            const raw: any[] = JSON.parse(localStorage.getItem("salesInvoices") || "[]");
            const refreshed = raw.map((r: any): SalesInvoice => ({
              id: r.id, invoiceNo: r.invoiceNo, invoiceDate: r.invoiceDate,
              party: r.party ?? null,
              showDueDate: r.showDueDate ?? false, paymentTermsDays: r.paymentTermsDays ?? 0,
              dueDate: r.dueDate ?? "", billItems: r.billItems ?? [],
              additionalCharges: r.additionalCharges ?? [],
              discountPct: r.discountPct ?? 0, discountAmt: r.discountAmt ?? 0,
              applyTCS: r.applyTCS ?? false, tcsRate: r.tcsRate ?? 0,
              tcsBase: r.tcsBase ?? "Total Amount",
              roundOffAmt: r.roundOffAmt ?? 0,
              amountReceived: r.amountReceived ?? 0,
              status: r.status ?? "Unpaid",
              createdAt: r.createdAt ?? r.invoiceDate,
            }));
            setInvoices(refreshed);
            const updated = refreshed.find(i => i.id === viewInvoice.id);
            if (updated) setViewInvoice(updated);
          }}
          onDuplicate={()=>{ handleDuplicate(viewInvoice); setViewInvoice(null); }}
          onDelete={()=>{ setViewInvoice(null); setDeleteTarget(viewInvoice.id); }}
          onCancel={()=>{ setViewInvoice(null); setCancelTarget(viewInvoice.id); setCancelReason(""); }}
          onCreditNote={()=>{ setViewInvoice(null); handleIssueCreditNote(viewInvoice); }}
          onProfitDetails={()=>setProfitInvoice(viewInvoice)}
        />
      )}
    </div>
  );
}