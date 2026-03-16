import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentInList.css";
import { getPaymentsIn, deletePaymentIn, getPartiesBasic, getPartyLedgerBalance, type PaymentInRecord, type PartyBasic } from "../../../api/paymentInApi";

// ─── Date helpers ─────────────────────────────────────────────────────────────
type DateOption =
  | "Today" | "Yesterday" | "This Week" | "Last Week" | "Last 7 Days"
  | "This Month" | "Previous Month" | "Last 30 Days" | "This Quarter"
  | "Previous Quarter" | "Current Fiscal Year" | "Previous Fiscal Year"
  | "Last 365 Days" | "Custom Date Range";

const DATE_OPTIONS: DateOption[] = [
  "Today","Yesterday","This Week","Last Week","Last 7 Days","This Month",
  "Previous Month","Last 30 Days","This Quarter","Previous Quarter",
  "Current Fiscal Year","Previous Fiscal Year","Last 365 Days","Custom Date Range",
];

function getDateRange(opt: DateOption): { start: Date; end: Date } {
  const today = new Date(); today.setHours(0,0,0,0);
  const end = new Date(today); end.setHours(23,59,59,999);
  switch(opt) {
    case "Today": return { start: today, end };
    case "Yesterday": { const y=new Date(today); y.setDate(y.getDate()-1); const ye=new Date(y); ye.setHours(23,59,59,999); return {start:y,end:ye}; }
    case "This Week": { const s=new Date(today); s.setDate(s.getDate()-s.getDay()); return {start:s,end}; }
    case "Last Week": { const s=new Date(today); s.setDate(s.getDate()-s.getDay()-7); const e=new Date(s); e.setDate(e.getDate()+6); e.setHours(23,59,59,999); return {start:s,end:e}; }
    case "Last 7 Days": { const s=new Date(today); s.setDate(s.getDate()-6); return {start:s,end}; }
    case "This Month": return {start:new Date(today.getFullYear(),today.getMonth(),1),end};
    case "Previous Month": { const s=new Date(today.getFullYear(),today.getMonth()-1,1); const e=new Date(today.getFullYear(),today.getMonth(),0); e.setHours(23,59,59,999); return {start:s,end:e}; }
    case "Last 30 Days": { const s=new Date(today); s.setDate(s.getDate()-29); return {start:s,end}; }
    case "This Quarter": { const qs=Math.floor(today.getMonth()/3)*3; return {start:new Date(today.getFullYear(),qs,1),end}; }
    case "Previous Quarter": { const qs=Math.floor(today.getMonth()/3)*3-3; const s=new Date(today.getFullYear(),qs,1); const e=new Date(today.getFullYear(),qs+3,0); e.setHours(23,59,59,999); return {start:s,end:e}; }
    case "Current Fiscal Year": { const fy=today.getMonth()>=3?today.getFullYear():today.getFullYear()-1; return {start:new Date(fy,3,1),end}; }
    case "Previous Fiscal Year": { const fy=today.getMonth()>=3?today.getFullYear()-1:today.getFullYear()-2; const s=new Date(fy,3,1); const e=new Date(fy+1,2,31); e.setHours(23,59,59,999); return {start:s,end:e}; }
    case "Last 365 Days": { const s=new Date(today); s.setDate(s.getDate()-364); return {start:s,end}; }
    default: return {start:new Date(0),end};
  }
}

function getRangeLabel(opt: DateOption): string {
  if (opt === "Custom Date Range") return "";
  const {start,end} = getDateRange(opt);
  const fmt = (d: Date) => d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
  if (start.toDateString()===end.toDateString()) return fmt(start);
  return `${fmt(start)} to ${fmt(end)}`;
}
function fmtDateDisplay(iso: string) {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
}
function fmtCurrency(n: number) { return "₹ " + n.toLocaleString("en-IN",{maximumFractionDigits:2}); }

// ─── Calendar Picker ──────────────────────────────────────────────────────────
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS=["SUN","MON","TUE","WED","THU","FRI","SAT"];
function CalPicker({startDate,endDate,onSelect,onClose}:{startDate:string;endDate:string;onSelect:(s:string,e:string)=>void;onClose:()=>void}) {
  const today=new Date();
  const [vm,setVm]=useState(today.getMonth());
  const [vy,setVy]=useState(today.getFullYear());
  const [picking,setPicking]=useState<"start"|"end">("start");
  const [ls,setLs]=useState(startDate);
  const [le,setLe]=useState(endDate);
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{function h(e:MouseEvent){if(ref.current&&!ref.current.contains(e.target as Node))onClose();}document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const dim=(m:number,y:number)=>new Date(y,m+1,0).getDate();
  const fdo=(m:number,y:number)=>new Date(y,m,1).getDay();
  const cells=[...Array(fdo(vm,vy)).fill(null),...Array.from({length:dim(vm,vy)},(_,i)=>i+1)];
  while(cells.length%7!==0)cells.push(null);
  function ds(d:number){return `${vy}-${String(vm+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;}
  function clickDay(d:number){const s=ds(d);if(picking==="start"){setLs(s);setLe("");setPicking("end");}else{if(s<ls){setLe(ls);setLs(s);}else setLe(s);setPicking("start");}}
  function inRange(d:number){const s=ds(d);return !!(ls&&le&&s>ls&&s<le);}
  return (
    <div ref={ref} className="pil-cal-popup">
      <div className="pil-cal-tabs">
        <button className={`pil-cal-tab${picking==="start"?" pil-cal-tab--active":""}`} onClick={()=>setPicking("start")}>Select Start Date</button>
        <button className={`pil-cal-tab${picking==="end"?" pil-cal-tab--active":""}`} onClick={()=>setPicking("end")}>Select End Date</button>
      </div>
      <div className="pil-cal-nav">
        <div className="pil-cal-nav-group">
          <button onClick={()=>{if(vm===0){setVm(11);setVy(y=>y-1);}else setVm(m=>m-1);}}>‹</button>
          <span>{MONTHS[vm]}</span>
          <button onClick={()=>{if(vm===11){setVm(0);setVy(y=>y+1);}else setVm(m=>m+1);}}>›</button>
        </div>
        <div className="pil-cal-nav-group">
          <button onClick={()=>setVy(y=>y-1)}>‹</button><span>{vy}</span><button onClick={()=>setVy(y=>y+1)}>›</button>
        </div>
      </div>
      <div className="pil-cal-grid">
        {DAYS.map(d=><div key={d} className="pil-cal-dh">{d}</div>)}
        {cells.map((day,i)=>{
          if(!day)return<div key={i}/>;
          const s=ds(day);
          return(<button key={i} className={`pil-cal-day${s===ls||s===le?" pil-cal-day--sel":""}${inRange(day)?" pil-cal-day--range":""}`} onClick={()=>clickDay(day)}>{day}</button>);
        })}
      </div>
      <div className="pil-cal-footer">
        <button className="pil-cal-cancel" onClick={onClose}>CANCEL</button>
        <button className="pil-cal-ok" onClick={()=>{if(ls&&le){onSelect(ls,le);onClose();}}}>OK</button>
      </div>
    </div>
  );
}

// ─── Row Menu ─────────────────────────────────────────────────────────────────
function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="pil-row-menu">
      <button className="pil-row-menu-btn" onClick={e => { e.stopPropagation(); setOpen(!open); }}>
        <svg viewBox="0 0 24 24" fill="currentColor" style={{width:16,height:16}}><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
      </button>
      {open && (
        <div className="pil-row-dropdown">
          <button className="pil-row-item" onClick={() => { onEdit(); setOpen(false); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
          <button className="pil-row-item pil-row-item--danger" onClick={() => { onDelete(); setOpen(false); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PaymentInList() {
  const navigate = useNavigate();
  const [payments,      setPayments]      = useState<PaymentInRecord[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [dateFilter,    setDateFilter]    = useState<DateOption>("Last 365 Days");
  const [customStart,   setCustomStart]   = useState("");
  const [customEnd,     setCustomEnd]     = useState("");
  const [showDateDrop,  setShowDateDrop]  = useState(false);
  const [showCal,       setShowCal]       = useState(false);
  const [search,        setSearch]        = useState("");
  const [showSearch,    setShowSearch]    = useState(false);
  const [deleteTarget,  setDeleteTarget]  = useState<number | null>(null);
  const [sortDir,       setSortDir]       = useState<"asc"|"desc">("desc");
  const [deleting,      setDeleting]      = useState(false);
  // Party filter
  const [parties,       setParties]       = useState<PartyBasic[]>([]);
  const [partyFilter,   setPartyFilter]   = useState<number | null>(null);
  const [partySearch,   setPartySearch]   = useState("");
  const [partyBalance,  setPartyBalance]  = useState<number | null>(null);
  const [showPartyDrop, setShowPartyDrop] = useState(false);
  const partyRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const dateRange = dateFilter !== "Custom Date Range" ? getDateRange(dateFilter) : null;
      const result = await getPaymentsIn({
        limit:    200,
        search:   search || undefined,
        dateFrom: dateFilter === "Custom Date Range" ? customStart : dateRange?.start.toISOString().split("T")[0],
        dateTo:   dateFilter === "Custom Date Range" ? customEnd   : dateRange?.end.toISOString().split("T")[0],
        partyId:  partyFilter ?? undefined,
      });
      setPayments(result.payments);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [dateFilter, customStart, customEnd, search, partyFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    function h(e: MouseEvent) { if (dateRef.current && !dateRef.current.contains(e.target as Node)) setShowDateDrop(false); }
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    function h(e: MouseEvent) { if (partyRef.current && !partyRef.current.contains(e.target as Node)) setShowPartyDrop(false); }
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  // Load parties for filter dropdown
  useEffect(() => {
    getPartiesBasic().then(setParties).catch(() => {});
  }, []);

  // Fetch balance when party filter changes
  useEffect(() => {
    if (!partyFilter) { setPartyBalance(null); return; }
    getPartyLedgerBalance(partyFilter).then(setPartyBalance).catch(() => setPartyBalance(null));
  }, [partyFilter]);

  const sorted = [...payments].sort((a, b) => {
    const mul = sortDir === "asc" ? 1 : -1;
    return mul * (new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  async function handleDelete(id: number) {
    setDeleting(true);
    try {
      await deletePaymentIn(id);
      setPayments(prev => prev.filter(p => p.id !== id));
    } catch { /* ignore */ }
    finally { setDeleting(false); setDeleteTarget(null); }
  }

  const dateLabel = dateFilter === "Custom Date Range" && customStart && customEnd
    ? `${fmtDateDisplay(customStart)} – ${fmtDateDisplay(customEnd)}`
    : dateFilter;

  return (
    <div className="pil-page">
      <div className="pil-header">
        <h2>Payment In</h2>
        <div className="pil-header-actions">
          <button className="pil-icon-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="3 9 12 15 21 9"/></svg>
          </button>
        </div>
      </div>

      <div className="pil-tabs">
        <button className="pil-tab pil-tab--active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><polyline points="12 6 12 12 16 14"/></svg>
          Payment Received
        </button>
      </div>

      <div className="pil-toolbar">
        <div className="pil-toolbar-left">
          {!showSearch ? (
            <button className="pil-icon-btn" onClick={() => setShowSearch(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </button>
          ) : (
            <div className="pil-search-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input autoFocus className="pil-search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by party name or payment number" />
              <button className="pil-search-clear" onClick={() => { setSearch(""); setShowSearch(false); }}>✕</button>
            </div>
          )}
          <div ref={dateRef} className="pil-date-wrap">
            <button className="pil-date-btn" onClick={() => setShowDateDrop(!showDateDrop)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {dateLabel}
              <svg className="pil-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showDateDrop && (
              <div className="pil-date-dropdown">
                <div className="pil-date-dropdown-hdr"><span>Date Filter</span><span>Range</span></div>
                <div className="pil-date-dropdown-body">
                  {DATE_OPTIONS.map(opt => (
                    <div key={opt} className={`pil-date-row${dateFilter===opt?" pil-date-row--active":""}`} onClick={() => { setDateFilter(opt); if(opt==="Custom Date Range")setShowCal(true); setShowDateDrop(false); }}>
                      <span>{opt}</span><span className="pil-date-range-txt">{getRangeLabel(opt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {showCal && <CalPicker startDate={customStart} endDate={customEnd} onSelect={(s,e)=>{setCustomStart(s);setCustomEnd(e);}} onClose={()=>setShowCal(false)} />}
          </div>
        </div>
        {/* ── Party Filter ─────────────────────────────────────────── */}
        <div ref={partyRef} style={{ position: "relative" }}>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "0 12px", height: 36,
              border: `1px solid ${partyFilter ? "#4f46e5" : "#e5e7eb"}`, borderRadius: 8,
              background: "#fff", cursor: "pointer", fontSize: 13, minWidth: 190,
              color: partyFilter ? "#111827" : "#9ca3af", userSelect: "none",
            }}
            onClick={() => { setShowPartyDrop(v => !v); setPartySearch(""); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, color: "#6b7280", flexShrink: 0 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {partyFilter ? (parties.find(p => p.id === partyFilter)?.partyName ?? "Party") : "Filter by Party"}
            </span>
            {partyFilter && (
              <button onClick={e => { e.stopPropagation(); setPartyFilter(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, display: "flex" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 13, height: 13 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13, color: "#9ca3af", flexShrink: 0 }}><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          {/* Balance badge under the dropdown */}
          {partyFilter && partyBalance !== null && (
            <div style={{ position: "absolute", left: 0, top: "calc(100% + 2px)", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", color: partyBalance > 0 ? "#dc2626" : "#16a34a" }}>
              Balance: ₹{Math.abs(partyBalance).toLocaleString("en-IN")} {partyBalance > 0 ? "Due" : "Advance"}
            </div>
          )}

          {/* Dropdown list */}
          {showPartyDrop && (
            <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 300, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,.1)", minWidth: 220, overflow: "hidden" }}>
              <div style={{ padding: 8, borderBottom: "1px solid #f3f4f6" }}>
                <input autoFocus placeholder="Search party…" value={partySearch} onChange={e => setPartySearch(e.target.value)}
                  style={{ width: "100%", padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13, outline: "none" }} />
              </div>
              <div style={{ maxHeight: 240, overflowY: "auto" }}>
                {/* All Parties option */}
                <div onMouseDown={() => { setPartyFilter(null); setShowPartyDrop(false); }}
                  style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer", color: !partyFilter ? "#4f46e5" : "#374151", background: !partyFilter ? "#ede9fe" : "transparent", fontWeight: !partyFilter ? 600 : 400, borderBottom: "1px solid #f3f4f6" }}>
                  All Parties
                </div>
                {parties
                  .filter(p => p.partyName.toLowerCase().includes(partySearch.toLowerCase()))
                  .map(p => (
                    <div key={p.id} onMouseDown={() => { setPartyFilter(p.id); setShowPartyDrop(false); setPartySearch(""); }}
                      style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer", color: partyFilter === p.id ? "#4f46e5" : "#374151", background: partyFilter === p.id ? "#ede9fe" : "transparent", fontWeight: partyFilter === p.id ? 600 : 400, borderBottom: "1px solid #f9fafb" }}>
                      {p.partyName}
                    </div>
                  ))}
                {parties.filter(p => p.partyName.toLowerCase().includes(partySearch.toLowerCase())).length === 0 && (
                  <div style={{ padding: "14px", textAlign: "center", fontSize: 13, color: "#9ca3af" }}>No party found</div>
                )}
              </div>
            </div>
          )}
        </div>

        <button className="pil-create-btn" onClick={() => navigate("/cashier/payment-in")}>Create Payment In</button>
      </div>

      <div className="pil-table-wrap">
        <table className="pil-table">
          <thead>
            <tr>
              <th className="pil-th pil-th--sortable" onClick={() => setSortDir(d => d==="asc"?"desc":"asc")}>
                Date <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="8 9 12 5 16 9"/><polyline points="16 15 12 19 8 15"/></svg>
              </th>
              <th className="pil-th">Payment Number</th>
              <th className="pil-th">Party Name</th>
              <th className="pil-th">Total Amount Settled</th>
              <th className="pil-th">Amount Received</th>
              <th className="pil-th">Payment Mode</th>
              <th className="pil-th" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="pil-empty"><span>Loading…</span></td></tr>
            ) : sorted.length === 0 ? (
              <tr><td colSpan={7} className="pil-empty">
                <svg viewBox="0 0 80 80" fill="none" style={{width:64,height:64}}><rect x="10" y="15" width="50" height="50" rx="4" stroke="#d1d5db" strokeWidth="2"/><line x1="18" y1="30" x2="52" y2="30" stroke="#d1d5db" strokeWidth="1.5"/><line x1="18" y1="40" x2="40" y2="40" stroke="#d1d5db" strokeWidth="1.5"/><line x1="18" y1="50" x2="45" y2="50" stroke="#d1d5db" strokeWidth="1.5"/><line x1="48" y1="54" x2="60" y2="66" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/><line x1="60" y1="54" x2="48" y2="66" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/></svg>
                <span>No Transactions Matching the current filter</span>
              </td></tr>
            ) : sorted.map(p => (
              <tr key={p.id} className="pil-tr" onClick={() => navigate(`/cashier/payment-in-view/${p.id}`)}>
                <td className="pil-td">{fmtDateDisplay(p.date)}</td>
                <td className="pil-td">{p.paymentNo}</td>
                <td className="pil-td">{p.partyName}</td>
                <td className="pil-td">{fmtCurrency(p.totalAmountSettled)}</td>
                <td className="pil-td">{fmtCurrency(p.amount)}</td>
                <td className="pil-td">{p.mode}</td>
                <td className="pil-td" onClick={e => e.stopPropagation()}>
                  <RowMenu
                    onEdit={() => navigate(`/cashier/payment-in?editId=${p.id}`)}
                    onDelete={() => setDeleteTarget(p.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteTarget !== null && (
        <div className="pil-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="pil-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="pil-confirm-icon">
              <svg viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="#ef4444"/><line x1="12" y1="9" x2="12" y2="13" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <div className="pil-confirm-title">Delete this Payment-In?</div>
            <div className="pil-confirm-sub">This will unlink all associated invoices and restore their outstanding balance.</div>
            <div className="pil-confirm-btns">
              <button className="pil-btn-cancel" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
              <button className="pil-btn-danger" onClick={() => handleDelete(deleteTarget)} disabled={deleting}>{deleting ? "Deleting…" : "Yes, Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}