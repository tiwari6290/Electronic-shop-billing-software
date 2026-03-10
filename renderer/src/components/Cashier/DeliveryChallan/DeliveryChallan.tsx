import React, { useState, useRef, useEffect } from "react";
import { Search, Calendar, ChevronDown, Settings, MessageSquare, Edit, Clock, Copy, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./DeliveryChallan.css";
import CreateDeliveryChallan from "./Createdeliverychallan";
import ChallanViewPage from "./Challanviewpage";

// ─── Types ────────────────────────────────────────────────────────────────────
export type ChallanStatus = "Open" | "Closed";

export interface ChallanItem {
  id: number;
  date: string;
  challanNumber: number;
  partyName: string;
  partyId?: number;
  amount: number;
  status: ChallanStatus;
  items?: BillItem[];
  notes?: string;
  termsAndConditions?: string;
  additionalCharges?: AdditionalCharge[];
  discountPct?: number;
  discountAmt?: number;
  discountType?: "After Tax" | "Before Tax";
  autoRoundOff?: boolean;
  roundOffAmt?: number;
  eWayBillNo?: string;
  challanNoRef?: string;
  financedBy?: string;
  salesman?: string;
  emailId?: string;
  warrantyPeriod?: string;
  shippingAddress?: string;
  selectedBankId?: number;
}

export interface BillItem {
  id: number;
  name: string;
  hsnSac?: string;
  qty: number;
  unit: string;
  pricePerItem: number;
  discount: { percent: number; amount: number };
  tax: string;
  taxRate: number;
  amount: number;
  description?: string;
}

export interface AdditionalCharge {
  id: number;
  label: string;
  amount: number;
  tax: string;
}

export interface SettingsState {
  prefixEnabled: boolean;
  prefix: string;
  sequenceNumber: number;
  showItemImage: boolean;
  priceHistory: boolean;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const fmt = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const fmtShort = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]} ${d.getFullYear()}`;

type DatePreset = "Today"|"Yesterday"|"This Week"|"Last Week"|"Last 7 Days"|"This Month"|"Previous Month"|"This Quarter"|"Previous Quarter"|"Current Fiscal Year"|"Previous Fiscal Year"|"Last 365 Days"|"Custom";
type ChallanFilter = "Show All Challans"|"Show Open Challans"|"Show Closed Challans";

function getPresetRange(preset: DatePreset): [Date, Date] {
  const today = startOfDay(new Date());
  const dow = today.getDay();
  switch (preset) {
    case "Today": return [today, today];
    case "Yesterday": { const y = new Date(today); y.setDate(y.getDate()-1); return [y,y]; }
    case "This Week": { const s = new Date(today); s.setDate(today.getDate()-dow); const e = new Date(s); e.setDate(s.getDate()+6); return [s,e]; }
    case "Last Week": { const s = new Date(today); s.setDate(today.getDate()-dow-7); const e = new Date(s); e.setDate(s.getDate()+6); return [s,e]; }
    case "Last 7 Days": { const s = new Date(today); s.setDate(today.getDate()-6); return [s,today]; }
    case "This Month": { const s = new Date(today.getFullYear(),today.getMonth(),1); const e = new Date(today.getFullYear(),today.getMonth()+1,0); return [s,e]; }
    case "Previous Month": { const s = new Date(today.getFullYear(),today.getMonth()-1,1); const e = new Date(today.getFullYear(),today.getMonth(),0); return [s,e]; }
    case "This Quarter": { const q=Math.floor(today.getMonth()/3); const s=new Date(today.getFullYear(),q*3,1); const e=new Date(today.getFullYear(),q*3+3,0); return [s,e]; }
    case "Previous Quarter": { const q=Math.floor(today.getMonth()/3)-1; const yr=q<0?today.getFullYear()-1:today.getFullYear(); const qq=((q%4)+4)%4; const s=new Date(yr,qq*3,1); const e=new Date(yr,qq*3+3,0); return [s,e]; }
    case "Current Fiscal Year": { const fy=today.getMonth()>=3?today.getFullYear():today.getFullYear()-1; return [new Date(fy,3,1),new Date(fy+1,2,31)]; }
    case "Previous Fiscal Year": { const fy=(today.getMonth()>=3?today.getFullYear():today.getFullYear()-1)-1; return [new Date(fy,3,1),new Date(fy+1,2,31)]; }
    default: { const s=new Date(today); s.setDate(today.getDate()-364); return [s,today]; }
  }
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const PRESETS: DatePreset[] = ["Today","Yesterday","This Week","Last Week","Last 7 Days","This Month","Previous Month","This Quarter","Previous Quarter","Current Fiscal Year","Previous Fiscal Year","Last 365 Days","Custom"];

// ─── Mini Calendar ─────────────────────────────────────────────────────────────
function MiniCal({ value, onChange, highlight }: { value: Date|null; onChange:(d:Date)=>void; highlight?: [Date|null,Date|null] }) {
  const [viewDate, setViewDate] = useState(value || new Date());
  const year = viewDate.getFullYear(), month = viewDate.getMonth();
  const firstDay = new Date(year,month,1).getDay();
  const daysInMonth = new Date(year,month+1,0).getDate();
  const cells: (number|null)[] = [];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);
  const isSel = (d:number) => value?.getFullYear()===year && value?.getMonth()===month && value?.getDate()===d;
  const isInRange = (d:number) => { const [from,to]=highlight||[null,null]; if(!from||!to) return false; const cur=new Date(year,month,d); return cur>=from&&cur<=to; };
  const isStart = (d:number) => { const [from]=highlight||[null,null]; return from?.getFullYear()===year&&from?.getMonth()===month&&from?.getDate()===d; };
  const isEnd = (d:number) => { const [,to]=highlight||[null,null]; return to?.getFullYear()===year&&to?.getMonth()===month&&to?.getDate()===d; };
  return (
    <div className="mini-cal">
      <div className="mini-cal-header">
        <button className="cal-nav" onClick={()=>{const d=new Date(viewDate);d.setMonth(d.getMonth()-1);setViewDate(d);}}>‹</button>
        <span>{MONTHS[month]}</span>
        <button className="cal-nav" onClick={()=>{const d=new Date(viewDate);d.setMonth(d.getMonth()+1);setViewDate(d);}}>›</button>
      </div>
      <div className="mini-cal-year-nav">
        <button className="cal-nav" onClick={()=>{const d=new Date(viewDate);d.setFullYear(d.getFullYear()-1);setViewDate(d);}}>‹</button>
        <span>{year}</span>
        <button className="cal-nav" onClick={()=>{const d=new Date(viewDate);d.setFullYear(d.getFullYear()+1);setViewDate(d);}}>›</button>
      </div>
      <div className="cal-grid">
        {DAYS.map(d=><div key={d} className="cal-day-header">{d}</div>)}
        {cells.map((d,i)=>(
          <div key={i} className={["cal-cell",d===null?"cal-empty":"",d!==null&&isSel(d)?"cal-selected":"",d!==null&&isInRange(d)?"cal-in-range":"",d!==null&&isStart(d)?"cal-range-start":"",d!==null&&isEnd(d)?"cal-range-end":""].join(" ")} onClick={()=>d!==null&&onChange(new Date(year,month,d))}>{d}</div>
        ))}
      </div>
    </div>
  );
}

// ─── Date Filter ───────────────────────────────────────────────────────────────
function DateFilter({ selected, customFrom, customTo, onSelect }: { selected:DatePreset; customFrom:Date|null; customTo:Date|null; onSelect:(p:DatePreset,from?:Date,to?:Date)=>void }) {
  const [open,setOpen]=useState(false);
  const [phase,setPhase]=useState<"preset"|"custom">("preset");
  const [tempFrom,setTempFrom]=useState<Date|null>(customFrom);
  const [tempTo,setTempTo]=useState<Date|null>(customTo);
  const [pickingEnd,setPickingEnd]=useState(false);
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{ const h=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false);}; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);
  const label = selected==="Custom"&&customFrom&&customTo ? `${fmtShort(customFrom)} - ${fmtShort(customTo)}` : selected;
  const handlePick=(d:Date)=>{ if(!pickingEnd){setTempFrom(d);setTempTo(null);setPickingEnd(true);}else{if(tempFrom&&d<tempFrom){setTempTo(tempFrom);setTempFrom(d);}else{setTempTo(d);}setPickingEnd(false);}};
  return (
    <div className="date-filter-wrapper" ref={ref}>
      <button className={`filter-btn${open?" active":""}`} onClick={()=>{setOpen(!open);setPhase("preset");}}><Calendar size={14}/><span>{label}</span><ChevronDown size={12}/></button>
      {open&&(<div className="date-dropdown">
        {phase==="preset"?(<ul className="preset-list">{PRESETS.map(p=>{const range=p!=="Custom"?getPresetRange(p):null;return(<li key={p} className={`preset-item${selected===p?" preset-active":""}`} onClick={()=>{if(p==="Custom"){setPhase("custom");setTempFrom(null);setTempTo(null);setPickingEnd(false);}else{const[from,to]=getPresetRange(p);onSelect(p,from,to);setOpen(false);}}}><span>{p}</span>{range&&<span className="preset-range">{fmt(range[0])} – {fmt(range[1])}</span>}</li>);})}</ul>
        ):(<div className="custom-picker">
          <div className="custom-picker-header"><span className={`date-badge${tempFrom?" active":""}`}>{tempFrom?fmtShort(tempFrom):"From Date"}</span><span className="date-badge-sep">→</span><span className={`date-badge${tempTo?" active":""}`}>{tempTo?fmtShort(tempTo):"To Date"}</span></div>
          <MiniCal value={tempFrom} onChange={handlePick} highlight={[tempFrom,tempTo]}/>
          <div className="custom-picker-actions"><button className="btn-cancel-sm" onClick={()=>setPhase("preset")}>Back</button><button className="btn-ok-sm" disabled={!tempFrom||!tempTo} onClick={()=>{if(tempFrom&&tempTo){onSelect("Custom",tempFrom,tempTo);setOpen(false);}}}>Apply</button></div>
        </div>)}
      </div>)}
    </div>
  );
}

// ─── Status Filter ─────────────────────────────────────────────────────────────
function StatusFilter({ value, onChange }: { value:ChallanFilter; onChange:(v:ChallanFilter)=>void }) {
  const [open,setOpen]=useState(false);
  const ref=useRef<HTMLDivElement>(null);
  const opts:ChallanFilter[]=["Show All Challans","Show Open Challans","Show Closed Challans"];
  useEffect(()=>{ const h=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false);}; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);
  return (
    <div className="status-filter-wrapper" ref={ref}>
      <button className={`filter-btn${open?" active":""}`} onClick={()=>setOpen(!open)}><span>{value}</span><ChevronDown size={12}/></button>
      {open&&(<ul className="status-dropdown">{opts.map(o=><li key={o} className={`status-item${value===o?" status-active":""}`} onClick={()=>{onChange(o);setOpen(false);}}>{o}</li>)}</ul>)}
    </div>
  );
}

// ─── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button className={`dc-toggle${checked?" dc-toggle--on":""}`} onClick={()=>onChange(!checked)} role="switch" aria-checked={checked} type="button">
      <span className="dc-toggle-thumb"/>
    </button>
  );
}

// ─── Settings Modal ─────────────────────────────────────────────────────────────
function SettingsModal({ settings, onSave, onClose }: { settings: SettingsState; onSave: (s: SettingsState) => void; onClose: () => void }) {
  const [local, setLocal] = useState({ ...settings });
  const upd = <K extends keyof SettingsState>(k: K, v: SettingsState[K]) => setLocal(p => ({ ...p, [k]: v }));
  const num = local.prefixEnabled ? `${local.prefix}${local.sequenceNumber}` : `${local.sequenceNumber}`;
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header"><h2>Quick Delivery Challan Settings</h2><button className="modal-close" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div className="settings-card">
            <div className="settings-card-header">
              <div><div className="settings-title">Delivery Challan Prefix &amp; Sequence Number</div><div className="settings-desc">Add your custom prefix &amp; sequence for Delivery Challan Numbering</div></div>
              <Toggle checked={local.prefixEnabled} onChange={v => upd("prefixEnabled", v)} />
            </div>
            {local.prefixEnabled && (<div className="settings-fields"><div className="field-group"><label>Prefix</label><input className="settings-input" value={local.prefix} onChange={e => upd("prefix", e.target.value)}/></div><div className="field-group"><label>Sequence Number</label><input className="settings-input" type="number" value={local.sequenceNumber} onChange={e => upd("sequenceNumber", Number(e.target.value))}/></div></div>)}
            {local.prefixEnabled && <div className="challan-num-preview">Delivery Challan Number: {num}</div>}
          </div>
          <div className="settings-card"><div className="settings-card-header"><div><div className="settings-title">Show Item Image on Invoice</div><div className="settings-desc">This will apply to all vouchers except for Payment In and Payment Out</div></div><Toggle checked={local.showItemImage} onChange={v => upd("showItemImage", v)}/></div></div>
          <div className="settings-card"><div className="settings-card-header"><div><div className="settings-title">Price History <span className="badge-new">New</span></div><div className="settings-desc">Show last 5 sales / purchase prices of the item for the selected party in invoice</div></div><Toggle checked={local.priceHistory} onChange={v => upd("priceHistory", v)}/></div></div>
        </div>
        <div className="modal-footer"><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={()=>{onSave(local);onClose();}}>Save</button></div>
      </div>
    </div>
  );
}

// ─── Row Menu ──────────────────────────────────────────────────────────────────
function RowMenu({ challanId, onEdit, onEditHistory, onDuplicate, onDelete }: { challanId:number; onEdit:(id:number)=>void; onEditHistory:(id:number)=>void; onDuplicate:(id:number)=>void; onDelete:(id:number)=>void }) {
  const [open,setOpen]=useState(false);
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{ const h=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false);}; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);
  return (
    <div className="row-menu-wrapper" ref={ref}>
      <button className="row-menu-btn" onClick={e=>{e.stopPropagation();setOpen(!open);}}>⋮</button>
      {open&&(<ul className="row-menu-dropdown">
        <li onClick={e=>{e.stopPropagation();onEdit(challanId);setOpen(false);}}><Edit size={14}/> Edit</li>
        <li onClick={e=>{e.stopPropagation();onEditHistory(challanId);setOpen(false);}}><Clock size={14}/> Edit History</li>
        <li onClick={e=>{e.stopPropagation();onDuplicate(challanId);setOpen(false);}}><Copy size={14}/> Duplicate</li>
        <li className="menu-danger" onClick={e=>{e.stopPropagation();onDelete(challanId);setOpen(false);}}><Trash2 size={14}/> Delete</li>
      </ul>)}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
const INITIAL_DATA: ChallanItem[] = [
  { id: 1, date: "2026-03-01", challanNumber: 19, partyName: "Ramakant Pandit", amount: 410.96, status: "Open", items: [] },
];

type AppView = "list" | "create" | "edit" | "duplicate" | "view";

export default function DeliveryChallan() {
  const navigate = useNavigate();
  const [challans, setChallans] = useState<ChallanItem[]>(() => {
    try { const s = localStorage.getItem("challans"); return s ? JSON.parse(s) : INITIAL_DATA; } catch { return INITIAL_DATA; }
  });
  const [datePreset, setDatePreset] = useState<DatePreset>("Last 365 Days");
  const [dateFrom, setDateFrom] = useState<Date|null>(() => getPresetRange("Last 365 Days")[0]);
  const [dateTo, setDateTo] = useState<Date|null>(() => getPresetRange("Last 365 Days")[1]);
  const [statusFilter, setStatusFilter] = useState<ChallanFilter>("Show Open Challans");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [view, setView] = useState<AppView>("list");
  const [activeChallan, setActiveChallan] = useState<ChallanItem | null>(null);
  const [sortDir, setSortDir] = useState<"asc"|"desc">("desc");
  const [settings, setSettings] = useState<SettingsState>({ prefixEnabled: true, prefix: "", sequenceNumber: 21, showItemImage: true, priceHistory: true });

  useEffect(() => { localStorage.setItem("challans", JSON.stringify(challans)); }, [challans]);

  const nextNumber = Math.max(...challans.map(c => c.challanNumber), settings.sequenceNumber - 1) + 1;

  const filtered = challans
    .filter(c => { const d = startOfDay(new Date(c.date)); if (dateFrom && d < dateFrom) return false; if (dateTo && d > dateTo) return false; return true; })
    .filter(c => statusFilter === "Show Open Challans" ? c.status === "Open" : statusFilter === "Show Closed Challans" ? c.status === "Closed" : true)
    .filter(c => !searchQuery || c.partyName.toLowerCase().includes(searchQuery.toLowerCase()) || c.challanNumber.toString().includes(searchQuery))
    .sort((a, b) => sortDir === "asc" ? new Date(a.date).getTime() - new Date(b.date).getTime() : new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSaveChallan = (challan: ChallanItem) => {
    setChallans(prev => {
      const exists = prev.find(c => c.id === challan.id);
      if (exists) return prev.map(c => c.id === challan.id ? challan : c);
      return [...prev, challan];
    });
    setView("list");
    setActiveChallan(null);
  };

  const handleDelete = (id: number) => setChallans(prev => prev.filter(c => c.id !== id));

  const handleDuplicate = (id: number) => {
    const orig = challans.find(c => c.id === id);
    if (!orig) return;
    // New id → will be inserted as a brand-new record when saved
    const duped: ChallanItem = {
      ...orig,
      id: Date.now(),
      challanNumber: Math.max(...challans.map(c => c.challanNumber)) + 1,
      status: "Open",
    };
    setActiveChallan(duped);
    setView("duplicate");
  };

  const handleConvertToInvoice = (challan: ChallanItem) => {
    // 1. Mark challan as Closed and persist to localStorage immediately
    const updatedChallans = challans.map(c =>
      c.id === challan.id ? { ...c, status: "Closed" as ChallanStatus } : c
    );
    setChallans(updatedChallans);
    localStorage.setItem("challans", JSON.stringify(updatedChallans));

    // 2. Build the fromChallan payload that CreateSalesInvoice expects
    const fromChallan = {
      party: { id: challan.partyId || 0, name: challan.partyName, mobile: "", balance: 0 },
      billItems: (challan.items || []).map(i => ({
        rowId: `row-${Date.now()}-${i.id}`,
        itemId: i.id,
        name: i.name,
        description: i.description || "",
        hsn: i.hsnSac || "",
        qty: i.qty,
        unit: i.unit,
        price: i.pricePerItem,
        discountPct: i.discount.percent,
        discountAmt: i.discount.amount,
        taxLabel: i.tax || "None",
        taxRate: i.taxRate || 0,
        amount: i.amount,
      })),
      additionalCharges: (challan.additionalCharges || []).map(c => ({
        id: `c-${c.id}`,
        label: c.label,
        amount: c.amount,
        taxLabel: c.tax || "No Tax Applicable",
      })),
      discountType: challan.discountType === "Before Tax"
        ? "Discount Before Tax"
        : "Discount After Tax",
      discountPct: challan.discountPct || 0,
      discountAmt: challan.discountAmt || 0,
      roundOff: challan.autoRoundOff ? "+Add" : "none",
      roundOffAmt: challan.roundOffAmt || 0,
      notes: challan.notes || "",
      termsConditions: challan.termsAndConditions || "",
      challanNo: String(challan.challanNumber),
    };

    // 3. Navigate to Create Sales Invoice with all pre-filled data
    setView("list");
    setActiveChallan(null);
    navigate("/cashier/sales-invoice", { state: { fromChallan } });
  };

  if (view === "create") {
    return <CreateDeliveryChallan
      challan={null} nextNumber={nextNumber} settings={settings}
      onSave={handleSaveChallan} onBack={() => { setView("list"); setActiveChallan(null); }}
      isEditMode={false}
    />;
  }

  if ((view === "edit" || view === "duplicate") && activeChallan) {
    return <CreateDeliveryChallan
      challan={activeChallan} nextNumber={nextNumber} settings={settings}
      onSave={handleSaveChallan} onBack={() => { setView("list"); setActiveChallan(null); }}
      isEditMode={view === "edit"}
    />;
  }

  if (view === "view" && activeChallan) {
    return <ChallanViewPage
      challan={activeChallan}
      onBack={() => { setView("list"); setActiveChallan(null); }}
      onEdit={() => setView("edit")}
      onConvertToInvoice={() => handleConvertToInvoice(activeChallan)}
    />;
  }

  return (
    <div className="dc-container">
      <div className="dc-header">
        <h1 className="dc-title">Delivery Challan</h1>
        <div className="dc-header-actions">
          <button className="icon-btn notify" onClick={() => setShowSettings(true)} title="Settings"><Settings size={16}/><span className="notif-dot"/></button>
          <button className="icon-btn" title="Messages"><MessageSquare size={16}/></button>
        </div>
      </div>
      <div className="dc-toolbar">
        <div className="toolbar-left">
          {showSearch ? (
            <div className="search-box-wrapper">
              <Search size={14} className="search-icon-inner"/>
              <input autoFocus className="search-input" placeholder="Search challans..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onBlur={() => { if (!searchQuery) setShowSearch(false); }}/>
              <button className="search-clear" onClick={() => { setSearchQuery(""); setShowSearch(false); }}>✕</button>
            </div>
          ) : (
            <button className="filter-btn icon-only" onClick={() => setShowSearch(true)}><Search size={15}/></button>
          )}
          <DateFilter selected={datePreset} customFrom={dateFrom} customTo={dateTo} onSelect={(p,f,t) => { setDatePreset(p); if(f)setDateFrom(f); if(t)setDateTo(t); }}/>
          <StatusFilter value={statusFilter} onChange={setStatusFilter}/>
        </div>
        <button className="btn-create" onClick={() => { setActiveChallan(null); setView("create"); }}>Create Delivery Challan</button>
      </div>
      <div className="dc-table-wrapper">
        <table className="dc-table">
          <thead>
            <tr>
              <th className="col-date" onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}>Date <span className="sort-icon">{sortDir === "asc" ? "↑" : "↓"}</span></th>
              <th>Delivery Challan Number</th>
              <th>Party Name</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="col-action"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="empty-state">No challans found</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} onClick={() => { setActiveChallan(c); setView("view"); }}>
                <td>{fmt(new Date(c.date))}</td>
                <td>{c.challanNumber}</td>
                <td>{c.partyName}</td>
                <td>₹ {c.amount.toFixed(2)}</td>
                <td><span className={`status-badge status-${c.status.toLowerCase()}`}>{c.status}</span></td>
                <td onClick={e => e.stopPropagation()}>
                  <RowMenu challanId={c.id}
                    onEdit={id => { const item = challans.find(ch => ch.id === id); if (item) { setActiveChallan(item); setView("edit"); } }}
                    onEditHistory={id => alert(`Edit History for challan #${challans.find(ch => ch.id === id)?.challanNumber}`)}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showSettings && <SettingsModal settings={settings} onSave={setSettings} onClose={() => setShowSettings(false)}/>}
    </div>
  );
}