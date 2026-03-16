import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  getCreditNotes, saveCreditNote,
  CreditNote as CreditNoteType,
  getCreditNotePrefix, saveCreditNotePrefix,
  calcTotal,
} from "./Creditnotetypes";
import CreateCreditNote from "./Createcreditnote";
import CreditNoteViewModel from "./Creditnoteviewmodel";
import "./CreditNote.css";

// ── Icons ──────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const ChevronLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const ChevronUpDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 3 18 9"/><polyline points="6 15 12 21 18 15"/>
  </svg>
);
const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const PrinterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
);
const DotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const HistoryIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-4.99"/>
  </svg>
);
const DuplicateIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ── Types ──────────────────────────────────────────────────────────────────
type DatePreset =
  | "Today" | "Yesterday" | "This Week" | "Last Week"
  | "Last 7 Days" | "This Month" | "Previous Month"
  | "Last 30 Days" | "This Quarter" | "Previous Quarter"
  | "Current Fiscal Year" | "Previous Fiscal Year"
  | "Last 365 Days" | "Custom";

const PRESETS: DatePreset[] = [
  "Today","Yesterday","This Week","Last Week",
  "Last 7 Days","This Month","Previous Month",
  "Last 30 Days","This Quarter","Previous Quarter",
  "Current Fiscal Year","Previous Fiscal Year",
  "Last 365 Days","Custom",
];

const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

// ── Helpers ────────────────────────────────────────────────────────────────
function formatShort(d: Date) {
  return `${String(d.getDate()).padStart(2,"0")} ${MONTHS[d.getMonth()].slice(0,3)} ${d.getFullYear()}`;
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}
function getPresetRange(preset: DatePreset): [Date,Date] {
  const today = new Date(); today.setHours(0,0,0,0);
  const t = new Date(today);
  switch(preset){
    case "Today": return [t,t];
    case "Yesterday": { const y=new Date(t); y.setDate(t.getDate()-1); return [y,y]; }
    case "This Week": { const s=new Date(t); s.setDate(t.getDate()-t.getDay()); const e=new Date(s); e.setDate(s.getDate()+6); return [s,e]; }
    case "Last Week": { const s=new Date(t); s.setDate(t.getDate()-t.getDay()-7); const e=new Date(s); e.setDate(s.getDate()+6); return [s,e]; }
    case "Last 7 Days": { const s=new Date(t); s.setDate(t.getDate()-6); return [s,t]; }
    case "This Month": { const s=new Date(t.getFullYear(),t.getMonth(),1); const e=new Date(t.getFullYear(),t.getMonth()+1,0); return [s,e]; }
    case "Previous Month": { const s=new Date(t.getFullYear(),t.getMonth()-1,1); const e=new Date(t.getFullYear(),t.getMonth(),0); return [s,e]; }
    case "Last 30 Days": { const s=new Date(t); s.setDate(t.getDate()-29); return [s,t]; }
    case "This Quarter": { const q=Math.floor(t.getMonth()/3); const s=new Date(t.getFullYear(),q*3,1); const e=new Date(t.getFullYear(),q*3+3,0); return [s,e]; }
    case "Previous Quarter": { const q=Math.floor(t.getMonth()/3); const s=new Date(t.getFullYear(),(q-1)*3,1); const e=new Date(t.getFullYear(),q*3,0); return [s,e]; }
    case "Current Fiscal Year": { const fy=t.getMonth()>=3?t.getFullYear():t.getFullYear()-1; return [new Date(fy,3,1),new Date(fy+1,2,31)]; }
    case "Previous Fiscal Year": { const fy=(t.getMonth()>=3?t.getFullYear():t.getFullYear()-1)-1; return [new Date(fy,3,1),new Date(fy+1,2,31)]; }
    case "Last 365 Days": default: { const s=new Date(t); s.setDate(t.getDate()-364); return [s,t]; }
  }
}

function fmtDate(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2,"0")} ${MONTHS[d.getMonth()].slice(0,3)} ${d.getFullYear()}`;
}

// ── Calendar ───────────────────────────────────────────────────────────────
function Calendar({ year, month, onPrevMonth, onNextMonth, onPrevYear, onNextYear, startDate, endDate, onDateClick }: {
  year:number; month:number;
  onPrevMonth:()=>void; onNextMonth:()=>void;
  onPrevYear:()=>void; onNextYear:()=>void;
  startDate:Date|null; endDate:Date|null;
  onDateClick:(d:Date)=>void;
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells: {date:Date; isCurrentMonth:boolean}[] = [];
  for(let i=firstDay-1;i>=0;i--) cells.push({date:new Date(year,month-1,prevDays-i),isCurrentMonth:false});
  for(let i=1;i<=daysInMonth;i++) cells.push({date:new Date(year,month,i),isCurrentMonth:true});
  const rem=7-(cells.length%7); if(rem<7) for(let i=1;i<=rem;i++) cells.push({date:new Date(year,month+1,i),isCurrentMonth:false});

  return (
    <div className="cn-calendar">
      <div className="cn-cal-header">
        <div className="cn-cal-nav">
          <button className="cn-cal-nav-btn" onClick={onPrevMonth}><ChevronLeftIcon/></button>
          <span className="cn-cal-label">{MONTHS[month]}</span>
          <button className="cn-cal-nav-btn" onClick={onNextMonth}><ChevronRightIcon/></button>
        </div>
        <div className="cn-cal-nav">
          <button className="cn-cal-nav-btn" onClick={onPrevYear}><ChevronLeftIcon/></button>
          <span className="cn-cal-label">{year}</span>
          <button className="cn-cal-nav-btn" onClick={onNextYear}><ChevronRightIcon/></button>
        </div>
      </div>
      <div className="cn-cal-grid">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
          <div key={d} className="cn-cal-dow">{d}</div>
        ))}
        {cells.map((c,i)=>{
          const isStart=startDate&&sameDay(c.date,startDate);
          const isEnd=endDate&&sameDay(c.date,endDate);
          const inRange=startDate&&endDate&&c.date>startDate&&c.date<endDate;
          return (
            <button key={i} className={["cn-cal-day",!c.isCurrentMonth?"cn-cal-day--other":"",isStart||isEnd?"cn-cal-day--selected":"",inRange?"cn-cal-day--in-range":""].filter(Boolean).join(" ")}
              onClick={()=>onDateClick(c.date)}>{c.date.getDate()}</button>
          );
        })}
      </div>
    </div>
  );
}

// ── Date Filter ────────────────────────────────────────────────────────────
function DateFilter({ selected, startDate, endDate, onSelect }: {
  selected:DatePreset; startDate:Date; endDate:Date;
  onSelect:(p:DatePreset,s:Date,e:Date)=>void;
}) {
  const [open,setOpen]=useState(false);
  const [showCustom,setShowCustom]=useState(false);
  const [calStart,setCalStart]=useState<Date|null>(null);
  const [calEnd,setCalEnd]=useState<Date|null>(null);
  const [calYear,setCalYear]=useState(new Date().getFullYear());
  const [calMonth,setCalMonth]=useState(new Date().getMonth());
  const ref=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const h=(e:MouseEvent)=>{ if(ref.current&&!ref.current.contains(e.target as Node)){setOpen(false);setShowCustom(false);} };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);

  function handlePreset(p:DatePreset){
    if(p==="Custom"){setShowCustom(true);setCalStart(null);setCalEnd(null);return;}
    const [s,e]=getPresetRange(p);
    onSelect(p,s,e);setOpen(false);setShowCustom(false);
  }
  function handleDateClick(d:Date){
    if(!calStart||calEnd){setCalStart(d);setCalEnd(null);}
    else{if(d<calStart){setCalStart(d);}else{setCalEnd(d);}}
  }
  function handleOk(){
    if(calStart&&calEnd){onSelect("Custom",calStart,calEnd);setOpen(false);setShowCustom(false);}
  }

  const btnLabel = selected==="Last 365 Days"
    ? `${formatShort(startDate)} - ${formatShort(endDate)}`
    : selected==="Custom"&&calStart&&calEnd
    ? `${formatShort(calStart)} - ${formatShort(calEnd)}`
    : selected;

  return (
    <div className="cn-date-filter" ref={ref}>
      <button className="cn-date-btn" onClick={()=>{setOpen(o=>!o);setShowCustom(false);}}>
        <CalendarIcon/><span>{btnLabel}</span><ChevronDownIcon/>
      </button>
      {open&&(
        <div className="cn-dropdown">
          {!showCustom?(
            <div className="cn-preset-list">
              {PRESETS.map(p=>(
                <button key={p} className={["cn-preset-item",p===selected?"cn-preset-item--active":""].join(" ")} onClick={()=>handlePreset(p)}>
                  <span>{p}</span>
                  {p==="Last 365 Days"&&<span className="cn-preset-range">{formatShort(getPresetRange("Last 365 Days")[0])} - {formatShort(getPresetRange("Last 365 Days")[1])}</span>}
                </button>
              ))}
            </div>
          ):(
            <div className="cn-custom-picker">
              <div className="cn-custom-dates">
                <span className={calStart?"cn-custom-date--set":"cn-custom-date--placeholder"}>{calStart?formatShort(calStart):"Select Start Date"}</span>
                <span className={calEnd?"cn-custom-date--set":"cn-custom-date--placeholder"}>{calEnd?formatShort(calEnd):"Select End Date"}</span>
              </div>
              <Calendar year={calYear} month={calMonth}
                onPrevMonth={()=>{if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1);}}
                onNextMonth={()=>{if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1);}}
                onPrevYear={()=>setCalYear(y=>y-1)} onNextYear={()=>setCalYear(y=>y+1)}
                startDate={calStart} endDate={calEnd} onDateClick={handleDateClick}/>
              <div className="cn-custom-actions">
                <button className="cn-btn-ghost" onClick={()=>setShowCustom(false)}>CANCEL</button>
                <button className="cn-btn-primary-text" onClick={handleOk} disabled={!calStart||!calEnd}>OK</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Settings Modal ─────────────────────────────────────────────────────────
function SettingsModal({ onClose, prefix, sequence, showImage, onSave }: {
  onClose:()=>void; prefix:string; sequence:number; showImage:boolean;
  onSave:(prefix:string,seq:number,showImg:boolean)=>void;
}) {
  const [pfx,setPfx]=useState(prefix);
  const [seq,setSeq]=useState(sequence);
  const [img,setImg]=useState(showImage);
  const [prefixEnabled,setPrefixEnabled]=useState(true);
  const displayNumber=prefixEnabled?`${pfx}${seq}`:`${seq}`;

  return (
    <div className="cn-modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="cn-modal">
        <div className="cn-modal-header">
          <h3>Quick Credit Note Settings</h3>
          <button className="cn-icon-btn" onClick={onClose}><CloseIcon/></button>
        </div>
        <div className="cn-modal-body">
          <div className="cn-settings-card">
            <div className="cn-settings-row">
              <div>
                <div className="cn-settings-title">Credit Note Prefix &amp; Sequence Number</div>
                <div className="cn-settings-desc">Add your custom prefix &amp; sequence for Credit Note Numbering</div>
              </div>
              <label className="cn-toggle">
                <input type="checkbox" checked={prefixEnabled} onChange={e=>setPrefixEnabled(e.target.checked)}/>
                <span className="cn-toggle-slider"/>
              </label>
            </div>
            {prefixEnabled&&(
              <div className="cn-settings-fields">
                <div className="cn-field-group">
                  <label>Prefix</label>
                  <input className="cn-input" placeholder="Prefix" value={pfx} onChange={e=>setPfx(e.target.value)}/>
                </div>
                <div className="cn-field-group">
                  <label>Sequence Number</label>
                  <input className="cn-input" type="number" min={1} value={seq} onChange={e=>setSeq(Number(e.target.value))}/>
                </div>
                <div className="cn-settings-preview">Credit Note Number: {displayNumber}</div>
              </div>
            )}
          </div>
          <div className="cn-settings-card">
            <div className="cn-settings-row">
              <div>
                <div className="cn-settings-title">Show Item Image on Invoice</div>
                <div className="cn-settings-desc">This will apply to all vouchers except for Payment In and Payment Out</div>
              </div>
              <label className="cn-toggle">
                <input type="checkbox" checked={img} onChange={e=>setImg(e.target.checked)}/>
                <span className="cn-toggle-slider"/>
              </label>
            </div>
          </div>
        </div>
        <div className="cn-modal-footer">
          <button className="cn-btn-outline" onClick={onClose}>Cancel</button>
          <button className="cn-btn-primary" onClick={()=>onSave(pfx,seq,img)}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm ─────────────────────────────────────────────────────────
function DeleteModal({ onCancel, onConfirm }: { onCancel:()=>void; onConfirm:()=>void }) {
  return (
    <div className="cn-modal-overlay">
      <div className="cn-modal cn-modal--sm">
        <div className="cn-delete-body">
          <h3>Are you sure you want to delete this Credit Note?</h3>
          <p>Once deleted, it cannot be recovered</p>
        </div>
        <div className="cn-modal-footer cn-modal-footer--center">
          <button className="cn-btn-outline" onClick={onCancel}>Cancel</button>
          <button className="cn-btn-danger-outline" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Row Action Menu ────────────────────────────────────────────────────────
function RowMenu({ onEdit, onDuplicate, onDelete }: {
  onEdit:()=>void; onDuplicate:()=>void; onDelete:()=>void;
}) {
  const [open,setOpen]=useState(false);
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const h=(e:MouseEvent)=>{ if(ref.current&&!ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);
  return (
    <div className="cn-row-menu" ref={ref}>
      <button className="cn-dots-btn" onClick={e=>{e.stopPropagation();setOpen(o=>!o);}}><DotsIcon/></button>
      {open&&(
        <div className="cn-row-dropdown">
          <button onClick={()=>{onEdit();setOpen(false);}}><EditIcon/> Edit</button>
          <button onClick={()=>{setOpen(false);}}><HistoryIcon/> Edit History</button>
          <button onClick={()=>{onDuplicate();setOpen(false);}}><DuplicateIcon/> Duplicate</button>
          <button className="cn-row-dropdown--danger" onClick={()=>{onDelete();setOpen(false);}}><TrashIcon/> Delete</button>
        </div>
      )}
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────
type View = "list" | "create" | "edit" | "view";

export default function CreditNoteModule() {
  const location = useLocation();
  const prefillInvoice = (location.state as any)?.fromInvoice ?? null;

  const [view,setView]         = useState<View>(prefillInvoice ? "create" : "list");
  const [editId,setEditId]     = useState<string|undefined>(undefined);
  const [notes,setNotes]       = useState<CreditNoteType[]>([]);
  const [search,setSearch]     = useState("");
  const [datePreset,setDatePreset] = useState<DatePreset>("Last 365 Days");
  const [startDate,setStartDate]   = useState<Date>(getPresetRange("Last 365 Days")[0]);
  const [endDate,setEndDate]       = useState<Date>(getPresetRange("Last 365 Days")[1]);
  const [showSettings,setShowSettings] = useState(false);
  const [deleteId,setDeleteId]         = useState<string|null>(null);
  const [prefix,setPrefix]   = useState(()=>getCreditNotePrefix());
  const [showImage,setShowImage] = useState(true);
  const [sortDir,setSortDir] = useState<"asc"|"desc">("desc");

  // ── Load from localStorage ───────────────────────────────────────────────
  const loadNotes = () => setNotes(getCreditNotes());
  useEffect(()=>{ loadNotes(); },[]);

  // ── Navigate back from form → reload list ────────────────────────────────
  const handleBack = (savedCreditNote?: CreditNoteType) => {
    // If a credit note was saved from an invoice, mark that invoice as Paid
    const srcInvoiceId = savedCreditNote?.linkedInvoiceId ?? prefillInvoice?.id;
    if (srcInvoiceId) {
      try {
        const invs: any[] = JSON.parse(localStorage.getItem("salesInvoices") || "[]");
        const updated = invs.map(i => i.id === srcInvoiceId ? { ...i, status: "Paid" } : i);
        localStorage.setItem("salesInvoices", JSON.stringify(updated));
      } catch {}
    }
    setView("list");
    setEditId(undefined);
    loadNotes();           // ← refresh list after save
  };

  // ── Next sequence number ─────────────────────────────────────────────────
  const nextSeq = notes.length ? Math.max(...notes.map(n=>n.creditNoteNo))+1 : 1;

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleSaveSettings(pfx:string,seq:number,img:boolean){
    saveCreditNotePrefix(pfx);
    setPrefix(pfx); setShowImage(img); setShowSettings(false);
  }

  function handleDelete(id:string){
    const all = getCreditNotes().filter(n=>n.id!==id);
    localStorage.setItem("creditNotes",JSON.stringify(all));
    setNotes(all); setDeleteId(null);
  }

  function handleDuplicate(note:CreditNoteType){
    const newNo = notes.length ? Math.max(...notes.map(n=>n.creditNoteNo))+1 : 1;
    const dup:CreditNoteType = {
      ...note,
      id:`cn-${Date.now()}`,
      creditNoteNo: newNo,
      creditNoteDate: new Date().toISOString().split("T")[0],
      linkedInvoiceId: null,   // don't re-link same invoice
      status: "Unpaid",
    };
    saveCreditNote(dup);
    loadNotes();
  }

  // ── Filter + sort ─────────────────────────────────────────────────────────
  const filtered = notes
    .filter(n=>{
      if(search){
        const q=search.toLowerCase();
        const partyOk = n.party?.name?.toLowerCase().includes(q);
        const noOk    = String(n.creditNoteNo).includes(q);
        if(!partyOk&&!noOk) return false;
      }
      const d=new Date(n.creditNoteDate); d.setHours(0,0,0,0);
      return d>=startDate && d<=endDate;
    })
    .sort((a,b)=>
      sortDir==="asc"
        ? new Date(a.creditNoteDate).getTime()-new Date(b.creditNoteDate).getTime()
        : new Date(b.creditNoteDate).getTime()-new Date(a.creditNoteDate).getTime()
    );

  // ── Show view modal ──────────────────────────────────────────────────────
  if(view==="view" && editId){
    const viewNote = notes.find(n=>n.id===editId);
    if(viewNote){
      return (
        <CreditNoteViewModel
          creditNote={viewNote}
          onClose={()=>{ setView("list"); setEditId(undefined); }}
          onEdit={(id)=>{ setEditId(id); setView("edit"); }}
          onDelete={(id)=>{ setDeleteId(id); setView("list"); setEditId(undefined); }}
          onDuplicate={(note)=>{ handleDuplicate(note); setView("list"); setEditId(undefined); }}
        />
      );
    }
  }

  // ── Show create / edit form ───────────────────────────────────────────────
  if(view==="create"||view==="edit"){
    return (
      <CreateCreditNote
        editId={view==="edit"?editId:undefined}
        prefillInvoice={view==="create" ? prefillInvoice : undefined}
        onBack={handleBack}
      />
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────
  return (
    <div className="cn-page">
      {/* Topbar */}
      <div className="cn-topbar">
        <h1 className="cn-title">Credit Note</h1>
        <div className="cn-topbar-actions">
          <button className="cn-icon-btn" title="Settings" onClick={()=>setShowSettings(true)}><SettingsIcon/></button>
          <button className="cn-icon-btn" title="Print"><PrinterIcon/></button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="cn-toolbar">
        <div className="cn-toolbar-left">
          <div className="cn-search-box">
            <SearchIcon/>
            <input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <DateFilter selected={datePreset} startDate={startDate} endDate={endDate} onSelect={(p,s,e)=>{setDatePreset(p);setStartDate(s);setEndDate(e);}}/>
        </div>
        <button className="cn-btn-primary" onClick={()=>setView("create")}>
          + Create Credit Note
        </button>
      </div>

      {/* Table */}
      <div className="cn-table-wrap">
        <table className="cn-table">
          <thead>
            <tr>
              <th>
                <button className="cn-th-sort" onClick={()=>setSortDir(d=>d==="asc"?"desc":"asc")}>
                  Date <ChevronUpDownIcon/>
                </button>
              </th>
              <th>Credit Note Number</th>
              <th>Party Name</th>
              <th>Invoice No</th>
              <th>Amount</th>
              <th>Status</th>
              <th/>
            </tr>
          </thead>
          <tbody>
            {filtered.length===0?(
              <tr>
                <td colSpan={7} className="cn-empty">
                  {notes.length===0
                    ? 'No credit notes yet. Click "+ Create Credit Note" to get started.'
                    : "No records match your search / date filter."}
                </td>
              </tr>
            ):filtered.map(note=>{
              // compute amount from items
              const total = calcTotal(note);

              // resolve linked invoice display
              let invDisplay="-";
              if(note.linkedInvoiceId){
                try{
                  const invs=JSON.parse(localStorage.getItem("salesInvoices")||"[]");
                  const inv=invs.find((x:any)=>x.id===note.linkedInvoiceId);
                  if(inv) invDisplay=`#${inv.invoiceNo}`;
                }catch{}
              }

              return (
                <tr key={note.id} className="cn-table-row" onClick={()=>{setEditId(note.id);setView("view");}}>
                  <td>{fmtDate(note.creditNoteDate)}</td>
                  <td>
                    <span className="cn-note-no">{note.prefix}{note.creditNoteNo}</span>
                  </td>
                  <td>{note.party?.name||"-"}</td>
                  <td>{invDisplay}</td>
                  <td>₹ {total.toLocaleString("en-IN")}</td>
                  <td>
                    <span className={`cn-badge cn-badge--${note.status.toLowerCase().replace(/ /g,"-")}`}>
                      {note.status}
                    </span>
                  </td>
                  <td onClick={e=>e.stopPropagation()}>
                    <RowMenu
                      onEdit={()=>{setEditId(note.id);setView("edit");}}
                      onDuplicate={()=>handleDuplicate(note)}
                      onDelete={()=>setDeleteId(note.id)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showSettings&&(
        <SettingsModal onClose={()=>setShowSettings(false)} prefix={prefix} sequence={nextSeq} showImage={showImage} onSave={handleSaveSettings}/>
      )}
      {deleteId!==null&&(
        <DeleteModal onCancel={()=>setDeleteId(null)} onConfirm={()=>handleDelete(deleteId!)}/>
      )}
    </div>
  );
}