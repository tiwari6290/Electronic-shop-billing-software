import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, Calendar, ChevronDown, Settings, MessageSquare, Edit, Clock, Copy, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Deliverychallanmodel.css";
import CreateDeliveryChallan from "./Createdeliverychallan";
import ChallanViewPage from "./Challanviewpage";
import {
  listChallans,
  deleteChallan as apiDeleteChallan,
  getChallanSettings,
  saveChallanSettings,
  getNextChallanNumber,
  getChallanForConversion,   // ← FIX: use the non-destructive fetcher
  duplicateChallan as apiDuplicateChallan,
  mapBackendChallan,
} from "../../../api/deliverychallanapi";

// ─── Types ────────────────────────────────────────────────────────────────────
export type ChallanStatus = "OPEN" | "CLOSED" | "CANCELLED";

export interface ChallanItem {
  id: number;
  date: string;
  challanNumber: string;
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
  poNumber?: string;
  vehicleNo?: string;
  dispatchedThrough?: string;
  transportName?: string;
  customFieldValues?: Record<string, string>;
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
      <button className="filter-btn" onClick={()=>setOpen(o=>!o)}>
        <Calendar size={13}/> {label} <ChevronDown size={12}/>
      </button>
      {open && (
        <div className="date-filter-popup">
          {phase==="preset" ? (
            <ul className="preset-list">
              {PRESETS.map(p=>(
                <li key={p} className={selected===p?"active":""} onClick={()=>{
                  if(p==="Custom"){setPhase("custom");setTempFrom(null);setTempTo(null);}
                  else{const[f,t]=getPresetRange(p);onSelect(p,f,t);setOpen(false);}
                }}>{p}</li>
              ))}
            </ul>
          ) : (
            <div className="custom-range-picker">
              <div className="crp-header">
                <button onClick={()=>setPhase("preset")}>‹ Back</button>
                <span>{pickingEnd?"Select End Date":"Select Start Date"}</span>
              </div>
              <div className="crp-cals">
                <MiniCal value={tempFrom} onChange={handlePick} highlight={[tempFrom,tempTo]}/>
                <MiniCal value={tempTo||tempFrom} onChange={handlePick} highlight={[tempFrom,tempTo]}/>
              </div>
              {tempFrom&&tempTo&&(
                <div className="crp-footer">
                  <button className="btn-primary-sm" onClick={()=>{onSelect("Custom",tempFrom,tempTo);setOpen(false);setPhase("preset");}}>Apply</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Status Filter ─────────────────────────────────────────────────────────────
function StatusFilter({ value, onChange }: { value: ChallanFilter; onChange: (v: ChallanFilter) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  const options: ChallanFilter[] = ["Show All Challans","Show Open Challans","Show Closed Challans"];
  return (
    <div className="status-filter-wrapper" ref={ref}>
      <button className="filter-btn" onClick={() => setOpen(o => !o)}>{value} <ChevronDown size={12}/></button>
      {open && (
        <ul className="status-filter-dropdown">
          {options.map(o => (
            <li key={o} className={value===o?"active":""} onClick={() => { onChange(o); setOpen(false); }}>{o}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Row Menu ──────────────────────────────────────────────────────────────────
function RowMenu({ challanId, onEdit, onEditHistory, onDuplicate, onDelete }: {
  challanId: number;
  onEdit: (id: number) => void;
  onEditHistory: (id: number) => void;
  onDuplicate: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="row-menu-wrapper" ref={ref}>
      <button className="row-menu-btn" onClick={() => setOpen(o => !o)}>⋮</button>
      {open && (
        <ul className="row-menu-dropdown">
          <li onClick={() => { onEdit(challanId); setOpen(false); }}><Edit size={13}/> Edit</li>
          <li onClick={() => { onEditHistory(challanId); setOpen(false); }}><Clock size={13}/> Edit History</li>
          <li onClick={() => { onDuplicate(challanId); setOpen(false); }}><Copy size={13}/> Duplicate</li>
          <li className="danger" onClick={() => { onDelete(challanId); setOpen(false); }}><Trash2 size={13}/> Delete</li>
        </ul>
      )}
    </div>
  );
}

// ─── Settings Modal ────────────────────────────────────────────────────────────
function SettingsModal({ settings, onSave, onClose }: { settings: SettingsState; onSave: (s: SettingsState) => void; onClose: () => void }) {
  const [local, setLocal] = useState(settings);
  const handleSave = async () => {
    try {
      await saveChallanSettings({ prefix: local.prefix, sequenceNumber: local.sequenceNumber, enablePrefix: local.prefixEnabled, showItemImage: local.showItemImage, priceHistory: local.priceHistory });
    } catch {}
    onSave(local); onClose();
  };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="settings-modal">
        <div className="sm-header"><h2>Delivery Challan Settings</h2><button onClick={onClose}>✕</button></div>
        <div className="sm-body">
          <div className="sm-row"><div><b>Prefix & Sequence</b><p>Customise your challan numbering</p></div>
            <label className="toggle-label"><input type="checkbox" checked={local.prefixEnabled} onChange={e=>setLocal({...local,prefixEnabled:e.target.checked})}/><span/></label>
          </div>
          {local.prefixEnabled && (
            <div className="sm-prefix-row">
              <div><label>Prefix</label><input className="sm-input" value={local.prefix} onChange={e=>setLocal({...local,prefix:e.target.value})} placeholder="e.g. DC-"/></div>
              <div><label>Sequence Number</label><input type="number" className="sm-input" value={local.sequenceNumber} min={1} onChange={e=>setLocal({...local,sequenceNumber:Number(e.target.value)})}/></div>
            </div>
          )}
          <div className="sm-row"><div><b>Show Item Image</b><p>Display item images on challan</p></div>
            <label className="toggle-label"><input type="checkbox" checked={local.showItemImage} onChange={e=>setLocal({...local,showItemImage:e.target.checked})}/><span/></label>
          </div>
          <div className="sm-row"><div><b>Price History</b><p>Show last 5 sale prices</p></div>
            <label className="toggle-label"><input type="checkbox" checked={local.priceHistory} onChange={e=>setLocal({...local,priceHistory:e.target.checked})}/><span/></label>
          </div>
        </div>
        <div className="sm-footer"><button onClick={onClose}>Cancel</button><button className="btn-primary" onClick={handleSave}>Save</button></div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function DeliveryChallanModel() {
  const navigate = useNavigate();

  const [view, setView] = useState<"list"|"create"|"edit"|"view"|"duplicate">("list");
  const [challans, setChallans] = useState<ChallanItem[]>([]);
  const [activeChallan, setActiveChallan] = useState<ChallanItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const [datePreset, setDatePreset] = useState<DatePreset>("This Month");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<ChallanFilter>("Show All Challans");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [sortDir, setSortDir] = useState<"asc"|"desc">("desc");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({ prefixEnabled: false, prefix: "DC-", sequenceNumber: 1, showItemImage: true, priceHistory: true });
  const [nextChallanNo, setNextChallanNo] = useState("DC-00001");

  const loadSettings = useCallback(async () => {
    try {
      const s = await getChallanSettings();
      setSettings({ prefixEnabled: s.enablePrefix, prefix: s.prefix || "DC-", sequenceNumber: s.sequenceNumber, showItemImage: s.showItemImage, priceHistory: s.priceHistory });
    } catch {}
  }, []);

  const loadNextNumber = useCallback(async () => {
    try { const { challanNo } = await getNextChallanNumber(); setNextChallanNo(challanNo); } catch {}
  }, []);

  const fetchChallans = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const statusMap: Record<ChallanFilter, "ALL"|"OPEN"|"CLOSED"> = {
        "Show All Challans": "ALL", "Show Open Challans": "OPEN", "Show Closed Challans": "CLOSED",
      };
      const params: any = { status: statusMap[statusFilter], search: searchQuery || undefined };
      if (dateFrom) params.from = dateFrom.toISOString().split("T")[0];
      if (dateTo)   params.to   = dateTo.toISOString().split("T")[0];
      const { challans: raw, total } = await listChallans(params);
      setChallans(raw.map(mapBackendChallan));
      setTotalCount(total);
    } catch (e: any) {
      setError(e.message || "Failed to load challans");
    } finally { setLoading(false); }
  }, [statusFilter, dateFrom, dateTo, searchQuery]);

  useEffect(() => { loadSettings(); loadNextNumber(); }, [loadSettings, loadNextNumber]);
  useEffect(() => { if (view === "list") fetchChallans(); }, [fetchChallans, view]);

  // ── Sorted list (already filtered server-side) ────────────────────────────
  const filtered = [...challans].sort((a, b) =>
    sortDir === "asc"
      ? new Date(a.date).getTime() - new Date(b.date).getTime()
      : new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // ── Save: after create/edit, refresh list and number ─────────────────────
  const handleSaveChallan = async (_challan: ChallanItem) => {
    await Promise.all([fetchChallans(), loadNextNumber()]);
    setView("list");
    setActiveChallan(null);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this challan?")) return;
    try {
      await apiDeleteChallan(id);
      setChallans(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  // ── Duplicate ─────────────────────────────────────────────────────────────
  const handleDuplicate = async (id: number) => {
    try {
      await apiDuplicateChallan(id);
      await Promise.all([fetchChallans(), loadNextNumber()]);
    } catch (err: any) {
      alert("Duplicate failed: " + err.message);
    }
  };

  // ── Convert to Invoice ────────────────────────────────────────────────────
  // FIX: We no longer call the backend convert endpoint here (that would
  // prematurely change the status to CLOSED before the invoice is saved).
  // Instead we just fetch the challan data and navigate to CreateSalesInvoice.
  // CreateSalesInvoice will call updateChallanStatus(id, "CLOSED") only after
  // a successful save — see CreateSalesInvoice.tsx handleSave().
  const handleConvertToInvoice = async (challan: ChallanItem) => {
    try {
      const { fromChallan } = await getChallanForConversion(challan.id);
      setView("list");
      setActiveChallan(null);
      // Navigate with both the pre-fill data AND the source challan ID.
      // The status flip to CLOSED happens inside CreateSalesInvoice on save.
      navigate("/cashier/sales-invoice", {
        state: {
          fromChallan,
          fromChallanId: challan.id,   // ← NEW: used by CreateSalesInvoice to close challan after save
        },
      });
    } catch (err: any) {
      alert("Failed to load challan data: " + err.message);
    }
  };

  if (view === "create") {
    return <CreateDeliveryChallan
      challan={null} nextNumber={nextChallanNo} settings={settings}
      onSave={handleSaveChallan} onBack={() => { setView("list"); setActiveChallan(null); }}
      isEditMode={false}
    />;
  }

  if ((view === "edit" || view === "duplicate") && activeChallan) {
    return <CreateDeliveryChallan
      challan={activeChallan} nextNumber={nextChallanNo} settings={settings}
      onSave={handleSaveChallan} onBack={() => { setView("list"); setActiveChallan(null); }}
      isEditMode={view === "edit"}
    />;
  }

  if (view === "view" && activeChallan) {
    return <ChallanViewPage
      challan={activeChallan}
      onBack={() => { setView("list"); setActiveChallan(null); fetchChallans(); }}
      onEdit={() => setView("edit")}
      onConvertToInvoice={() => handleConvertToInvoice(activeChallan)}
      onDelete={async (id) => {
        if (!window.confirm("Delete this challan?")) return;
        try {
          await apiDeleteChallan(id);
          setView("list");
          setActiveChallan(null);
          await fetchChallans();
        } catch (err: any) {
          alert("Delete failed: " + err.message);
        }
      }}
      onDuplicate={async (id) => {
        try {
          await apiDuplicateChallan(id);
          await Promise.all([fetchChallans(), loadNextNumber()]);
          setView("list");
          setActiveChallan(null);
        } catch (err: any) {
          alert("Duplicate failed: " + err.message);
        }
      }}
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

      {error && (
        <div style={{ background: "#fee2e2", color: "#dc2626", padding: "12px 16px", borderRadius: 8, margin: "0 0 12px", fontSize: 14 }}>
          {error} — <button style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", textDecoration: "underline" }} onClick={fetchChallans}>Retry</button>
        </div>
      )}

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
            {loading ? (
              <tr><td colSpan={6} className="empty-state">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="empty-state">No challans found</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} onClick={() => { setActiveChallan(c); setView("view"); }}>
                <td>{fmt(new Date(c.date))}</td>
                <td>{c.challanNumber}</td>
                <td>{c.partyName}</td>
                <td>₹ {c.amount.toFixed(2)}</td>
                <td>
                  <span className={`status-badge status-${c.status.toLowerCase()}`}>
                    {c.status === "OPEN" ? "Open" : c.status === "CLOSED" ? "Closed" : "Cancelled"}
                  </span>
                </td>
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
      {totalCount > 0 && (
        <div style={{ padding: "8px 16px", fontSize: 12, color: "#6b7280" }}>
          Showing {filtered.length} of {totalCount} challans
        </div>
      )}
      {showSettings && <SettingsModal settings={settings} onSave={setSettings} onClose={() => setShowSettings(false)}/>}
    </div>
  );
}