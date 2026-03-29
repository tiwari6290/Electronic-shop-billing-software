import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getSalesReturns, deleteSalesReturn as apiDeleteSalesReturn, SalesReturnRecord as ApiRecord } from "../../../api/salesreturnapi";
import "./Salesreturn.css";

// ─── Display types ────────────────────────────────────────────────────────────
interface SalesReturnRow {
  id:                string;
  date:              string;
  salesReturnNumber: number;
  partyName:         string;
  invoiceNo:         string;
  amount:            number;
  status:            string;
}

type DatePreset =
  | "Today" | "Yesterday" | "This Week" | "Last Week" | "Last 7 Days"
  | "This Month" | "Previous Month" | "Last 30 Days" | "This Quarter"
  | "Previous Quarter" | "Current Fiscal Year" | "Previous Fiscal Year"
  | "Last 365 Days" | "Custom";

interface DateRange { start: Date | null; end: Date | null; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtShort = (d: Date) =>
  `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString("en-IN", { month: "short" })} ${d.getFullYear()}`;

function getPresetRange(preset: DatePreset): DateRange {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const t = (offset: number) => { const d = new Date(today); d.setDate(d.getDate() + offset); return d; };
  switch (preset) {
    case "Today":    return { start: today, end: today };
    case "Yesterday":return { start: t(-1), end: t(-1) };
    case "This Week":{ const day = today.getDay(); return { start: t(-day), end: t(6 - day) }; }
    case "Last Week":{ const day = today.getDay(); return { start: t(-day - 7), end: t(-day - 1) }; }
    case "Last 7 Days": return { start: t(-6), end: today };
    case "This Month":  return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: new Date(today.getFullYear(), today.getMonth() + 1, 0) };
    case "Previous Month": return { start: new Date(today.getFullYear(), today.getMonth() - 1, 1), end: new Date(today.getFullYear(), today.getMonth(), 0) };
    case "Last 30 Days": return { start: t(-29), end: today };
    case "This Quarter": { const q = Math.floor(today.getMonth() / 3); return { start: new Date(today.getFullYear(), q * 3, 1), end: new Date(today.getFullYear(), q * 3 + 3, 0) }; }
    case "Previous Quarter": { const q = Math.floor(today.getMonth() / 3); return { start: new Date(today.getFullYear(), (q - 1) * 3, 1), end: new Date(today.getFullYear(), q * 3, 0) }; }
    case "Current Fiscal Year": { const fy = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1; return { start: new Date(fy, 3, 1), end: new Date(fy + 1, 2, 31) }; }
    case "Previous Fiscal Year": { const fy = (today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1) - 1; return { start: new Date(fy, 3, 1), end: new Date(fy + 1, 2, 31) }; }
    case "Last 365 Days": return { start: t(-364), end: today };
    default: return { start: null, end: null };
  }
}

/** Map backend SalesReturnRecord → display row */
function toRow(r: ApiRecord): SalesReturnRow {
  return {
    id:                String(r.id),
    date:              new Date(r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    salesReturnNumber: r.id,
    partyName:         r.party?.partyName ?? "—",
    invoiceNo:         r.invoice?.invoiceNo ?? String(r.invoiceId),
    amount:            Number(r.totalAmount),
    status:            r.returnStatus === "Refunded" ? "Paid" : r.returnStatus === "Partially Refunded" ? "Partially Paid" : "Unpaid",
  };
}

const PRESETS: DatePreset[] = [
  "Today","Yesterday","This Week","Last Week","Last 7 Days",
  "This Month","Previous Month","Last 30 Days","This Quarter",
  "Previous Quarter","Current Fiscal Year","Previous Fiscal Year",
  "Last 365 Days","Custom",
];
const PRESETS_WITH_DATE: DatePreset[] = [
  "This Quarter","Previous Quarter","Current Fiscal Year","Previous Fiscal Year","Last 365 Days",
];

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconSearch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconCalendar = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconChevronDown = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>;
const IconUpDown = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="12 4 12 8"/><polyline points="12 16 12 20"/><polyline points="8 8 12 4 16 8"/><polyline points="8 16 12 20 16 16"/></svg>;
const IconDotsVertical = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>;
const IconSettings = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IconTable = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>;
const IconEdit = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconHistory = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>;
const IconCopy = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const IconDelete = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IconClose = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconRefresh = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;

// ─── Mini Calendar ────────────────────────────────────────────────────────────
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

interface MiniCalProps {
  label: string; selectedDate: Date | null; onSelect: (d: Date) => void;
  viewMonth: number; viewYear: number;
  onPrevMonth: () => void; onNextMonth: () => void;
  onPrevYear: () => void; onNextYear: () => void;
  rangeStart: Date | null; rangeEnd: Date | null;
}
const MiniCal = ({ label, selectedDate, onSelect, viewMonth, viewYear, onPrevMonth, onNextMonth, onPrevYear, onNextYear, rangeStart, rangeEnd }: MiniCalProps) => {
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const days: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (days.length % 7 !== 0) days.push(null);
  const isSelected = (d: number) => selectedDate && selectedDate.getDate() === d && selectedDate.getMonth() === viewMonth && selectedDate.getFullYear() === viewYear;
  const mkDate = (d: number) => new Date(viewYear, viewMonth, d);
  const inRange = (d: number) => {
    if (!rangeStart || !rangeEnd) return false;
    const dt = mkDate(d);
    return dt >= rangeStart && dt <= rangeEnd;
  };
  return (
    <div className="sr-mini-cal">
      <div className="sr-mini-cal-label">{label}</div>
      <div className="sr-mini-cal-nav">
        <button onClick={onPrevYear}>«</button><button onClick={onPrevMonth}>‹</button>
        <span>{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button onClick={onNextMonth}>›</button><button onClick={onNextYear}>»</button>
      </div>
      <div className="sr-mini-cal-grid">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d} className="sr-mini-cal-dh">{d}</div>)}
        {days.map((day, i) => !day ? <div key={i} /> : (
          <button key={i}
            className={[
              "sr-mini-cal-day",
              isSelected(day) ? "sr-mini-cal-day--sel" : "",
              inRange(day) ? "sr-mini-cal-day--range" : "",
            ].filter(Boolean).join(" ")}
            onClick={() => onSelect(mkDate(day))}>{day}</button>
        ))}
      </div>
    </div>
  );
};

// ─── Date Dropdown ────────────────────────────────────────────────────────────
interface DateDropdownProps { selected: DatePreset; onChange: (p: DatePreset, range?: DateRange) => void; }

const DateDropdown = ({ selected, onChange }: DateDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [customStep, setCustomStep] = useState<"start"|"end">("start");
  const [customStart, setCustomStart] = useState<Date|null>(null);
  const [customEnd, setCustomEnd]   = useState<Date|null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const today = new Date();
  const [svm, setSvm] = useState(today.getMonth());
  const [svy, setSvy] = useState(today.getFullYear());
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setShowCustom(false); }};
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="sr-date-dropdown" ref={ref}>
      <button className={`sr-date-btn${open ? " sr-date-btn--open" : ""}`} onClick={() => setOpen(o => !o)}>
        <IconCalendar /><span>{selected}</span><IconChevronDown />
      </button>
      {open && !showCustom && (
        <div className="sr-date-menu">
          {PRESETS.map(p => {
            const dtStr = PRESETS_WITH_DATE.includes(p) ? (() => { const r = getPresetRange(p); return r.start && r.end ? `${fmtShort(r.start)} - ${fmtShort(r.end)}` : null; })() : null;
            return (
              <button key={p} className={`sr-date-menu-item${selected === p ? " sr-date-menu-item--active" : ""}`}
                onClick={() => { if (p === "Custom") { setShowCustom(true); setCustomStart(null); setCustomEnd(null); setCustomStep("start"); } else { onChange(p); setOpen(false); } }}>
                <span className="sr-date-menu-item-label">{p}</span>
                {dtStr && <span className="sr-date-menu-item-range">{dtStr}</span>}
              </button>
            );
          })}
        </div>
      )}
      {open && showCustom && (
        <div className="sr-custom-picker">
          <MiniCal label={customStep === "start" ? "Select Start Date" : "Select End Date"} selectedDate={customStep === "start" ? customStart : customEnd}
            onSelect={d => {
              if (customStep === "start") { setCustomStart(d); setCustomStep("end"); }
              else { if (customStart && d < customStart) { setCustomEnd(customStart); setCustomStart(d); } else setCustomEnd(d); }
            }}
            viewMonth={svm} viewYear={svy} onPrevMonth={() => { if (svm === 0) { setSvm(11); setSvy(y => y-1); } else setSvm(m => m-1); }}
            onNextMonth={() => { if (svm === 11) { setSvm(0); setSvy(y => y+1); } else setSvm(m => m+1); }}
            onPrevYear={() => setSvy(y => y-1)} onNextYear={() => setSvy(y => y+1)}
            rangeStart={customStart} rangeEnd={customEnd} />
          <div className="sr-custom-picker-divider"/>
          <div className="sr-custom-picker-actions">
            <button className="sr-custom-picker-cancel" onClick={() => setShowCustom(false)}>CANCEL</button>
            <button className={`sr-custom-picker-ok${customStart && customEnd ? "" : " sr-custom-picker-ok--disabled"}`}
              onClick={() => { if (customStart && customEnd) { onChange("Custom", { start: customStart, end: customEnd }); setOpen(false); setShowCustom(false); } }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Settings Modal ───────────────────────────────────────────────────────────
const SettingsModal = ({ onClose, nextSeqNumber, onSave, initPrefix, initShowImage }: {
  onClose: () => void; nextSeqNumber: number;
  onSave: (prefix: string, seq: number, showImage: boolean) => void;
  initPrefix: string; initShowImage: boolean;
}) => {
  const [prefixEnabled, setPrefixEnabled] = useState(true);
  const [prefix, setPrefix] = useState(initPrefix);
  const [seqNum, setSeqNum] = useState(nextSeqNumber);
  const [showImage, setShowImage] = useState(initShowImage);
  return (
    <div className="sr-modal-overlay">
      <div className="sr-modal">
        <div className="sr-modal-header">
          <span className="sr-modal-title">Quick Sales Return Settings</span>
          <button className="sr-modal-close" onClick={onClose}><IconClose /></button>
        </div>
        <div className="sr-modal-body">
          <div className="sr-modal-section">
            <div className="sr-modal-section-header">
              <div>
                <div className="sr-modal-section-title">Sales Return Prefix &amp; Sequence Number</div>
                <div className="sr-modal-section-desc">Add your custom prefix &amp; sequence for Sales Return Numbering</div>
              </div>
              <button className={`sr-toggle${prefixEnabled ? " sr-toggle--on" : ""}`} onClick={() => setPrefixEnabled(v => !v)}>
                <span className="sr-toggle-knob" />
              </button>
            </div>
            {prefixEnabled && (
              <div className="sr-modal-fields">
                <div className="sr-modal-field">
                  <label className="sr-modal-field-label">Prefix</label>
                  <input className="sr-modal-input" value={prefix} onChange={e => setPrefix(e.target.value)} />
                </div>
                <div className="sr-modal-field">
                  <label className="sr-modal-field-label">Sequence Number</label>
                  <input className="sr-modal-input" type="number" value={seqNum} min={1} onChange={e => setSeqNum(Number(e.target.value))} />
                </div>
                <div className="sr-modal-sr-preview">Sales Return Number: {prefix}{seqNum}</div>
              </div>
            )}
          </div>
          <div className="sr-modal-section">
            <div className="sr-modal-section-header">
              <div>
                <div className="sr-modal-section-title">Show Item Image on Invoice</div>
                <div className="sr-modal-section-desc">Applies to all vouchers except Payment In/Out</div>
              </div>
              <button className={`sr-toggle${showImage ? " sr-toggle--on" : ""}`} onClick={() => setShowImage(v => !v)}>
                <span className="sr-toggle-knob" />
              </button>
            </div>
          </div>
        </div>
        <div className="sr-modal-footer">
          <button className="sr-modal-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="sr-modal-btn-save" onClick={() => { onSave(prefix, seqNum, showImage); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
};

// ─── Row Action Menu ──────────────────────────────────────────────────────────
const RowMenu = ({ onEdit, onEditHistory, onDuplicate, onDelete, onClose }: {
  onEdit: (e: React.MouseEvent) => void; onEditHistory: (e: React.MouseEvent) => void;
  onDuplicate: (e: React.MouseEvent) => void; onDelete: (e: React.MouseEvent) => void;
  onClose: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  return (
    <div className="sr-row-menu" ref={ref}>
      <button className="sr-row-menu-item" onClick={onEdit}><IconEdit /><span>Edit</span></button>
      <button className="sr-row-menu-item" onClick={onEditHistory}><IconHistory /><span>Edit History</span></button>
      <button className="sr-row-menu-item" onClick={onDuplicate}><IconCopy /><span>Duplicate</span></button>
      <button className="sr-row-menu-item sr-row-menu-item--delete" onClick={onDelete}><IconDelete /><span>Delete</span></button>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SalesReturn() {
  const navigate = useNavigate();

  const [rows, setRows]         = useState<SalesReturnRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [selectedPreset, setSelectedPreset] = useState<DatePreset>("Last 365 Days");
  const [customRange, setCustomRange]       = useState<DateRange>({ start: null, end: null });
  const [searchQuery, setSearchQuery]       = useState("");
  const [showSettings, setShowSettings]     = useState(false);
  const [openMenuId, setOpenMenuId]         = useState<string | null>(null);
  const [sortDir, setSortDir]               = useState<"asc"|"desc">("desc");
  const [sortAmountDir, setSortAmountDir]   = useState<"asc"|"desc">("desc");
  const [prefix, setPrefix]                 = useState("SR-");
  const [showImage, setShowImage]           = useState(true);
  const [showSearchTooltip, setShowSearchTooltip] = useState(false);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [deleting, setDeleting]   = useState(false);

  // ── Fetch list from backend ────────────────────────────────────────────────
  const fetchReturns = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const result = await getSalesReturns({ limit: 200 });
      setRows(result.data.map(toRow));
    } catch (err: any) {
      setApiError(err.message || "Failed to load sales returns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReturns(); }, [fetchReturns]);

  // Re-fetch when user navigates back to this page
  useEffect(() => {
    const handleFocus = () => fetchReturns();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchReturns]);

  const nextSeq = rows.length > 0 ? Math.max(...rows.map(r => r.salesReturnNumber)) + 1 : 1;

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filterByDate = (row: SalesReturnRow) => {
    const range = selectedPreset === "Custom" ? customRange : getPresetRange(selectedPreset);
    if (!range.start || !range.end) return true;
    const parts = row.date.split(" ");
    const rDate = new Date(`${parts[1]} ${parts[0]}, ${parts[2]}`);
    return rDate >= range.start && rDate <= range.end;
  };

  const filtered = rows
    .filter(filterByDate)
    .filter(r => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return r.partyName.toLowerCase().includes(q) ||
             r.invoiceNo.toLowerCase().includes(q) ||
             String(r.salesReturnNumber).includes(q);
    });

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await apiDeleteSalesReturn(Number(id));
      await fetchReturns();
    } catch (err: any) {
      alert(err.message || "Failed to delete sales return");
    } finally {
      setDeleting(false);
      setDeleteId(null);
      setOpenMenuId(null);
    }
  };

  // ── Duplicate ──────────────────────────────────────────────────────────────
  const handleDuplicate = (id: string) => {
    setOpenMenuId(null);
    navigate(`/cashier/sales-return-create?duplicateFrom=${id}`);
  };

  // ── Sort ───────────────────────────────────────────────────────────────────
  const handleSortDate = () => {
    const dir = sortDir === "asc" ? "desc" : "asc";
    setSortDir(dir);
    setRows(prev => [...prev].sort((a, b) => {
      const da = new Date(a.date).getTime(), db = new Date(b.date).getTime();
      return dir === "asc" ? da - db : db - da;
    }));
  };

  const handleSortAmount = () => {
    const dir = sortAmountDir === "asc" ? "desc" : "asc";
    setSortAmountDir(dir);
    setRows(prev => [...prev].sort((a, b) => dir === "asc" ? a.amount - b.amount : b.amount - a.amount));
  };

  return (
    <div className="sr-page">
      {/* Header */}
      <div className="sr-header">
        <h1 className="sr-title">Sales Return</h1>
        <div className="sr-header-actions">
          <button className="sr-icon-btn" title="Refresh" onClick={fetchReturns}><IconRefresh /></button>
          <button className="sr-icon-btn" onClick={() => setShowSettings(true)}><IconSettings /></button>
          <button className="sr-icon-btn"><IconTable /></button>
        </div>
      </div>

      {/* API error banner */}
      {apiError && (
        <div className="sr-api-error">
          <span>⚠ {apiError}</span>
          <button onClick={fetchReturns}>Retry</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="sr-toolbar">
        <div className="sr-toolbar-left">
          <div className="sr-search-wrapper">
            <div className="sr-search-box">
              <span className="sr-search-icon"><IconSearch /></span>
              <input className="sr-search-input" placeholder="Search Sales Return"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchTooltip(true)}
                onBlur={() => setTimeout(() => setShowSearchTooltip(false), 200)} />
              <div className="sr-search-filter-select">
                <span>Invoice No. &amp; Pa...</span><IconChevronDown />
              </div>
            </div>
            {showSearchTooltip && (
              <div className="sr-search-tooltip">Search by Invoice No. &amp; Party name or Mobile Number</div>
            )}
          </div>
          <DateDropdown selected={selectedPreset} onChange={(p, r) => { setSelectedPreset(p); if (p === "Custom" && r) setCustomRange(r); }} />
        </div>
        <button className="sr-create-btn" onClick={() => navigate("/cashier/sales-return-create")}>
          Create Sales Return
        </button>
      </div>

      {/* Table */}
      <div className="sr-table-wrapper">
        {loading ? (
          <div className="sr-loading">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            Loading sales returns…
          </div>
        ) : (
          <table className="sr-table">
            <thead>
              <tr>
                <th className="sr-th sr-th--date" onClick={handleSortDate}><span>Date</span><span className="sr-th-sort"><IconUpDown /></span></th>
                <th className="sr-th">Sales Return Number</th>
                <th className="sr-th">Party Name</th>
                <th className="sr-th">Invoice No</th>
                <th className="sr-th sr-th--amount" onClick={handleSortAmount}><span>Amount</span><span className="sr-th-sort"><IconUpDown /></span></th>
                <th className="sr-th">Status</th>
                <th className="sr-th sr-th--action" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="sr-empty">
                  {apiError ? "Could not load data" : "No sales returns found"}
                </td></tr>
              ) : filtered.map((row, idx) => (
                <tr key={row.id} className={`sr-tr sr-tr--clickable${idx % 2 === 1 ? " sr-tr--alt" : ""}`}
                  onClick={() => navigate(`/cashier/sales-return-view/${row.id}`)}>
                  <td className="sr-td">{row.date}</td>
                  <td className="sr-td">SR-{row.salesReturnNumber}</td>
                  <td className="sr-td">{row.partyName}</td>
                  <td className="sr-td">#{row.invoiceNo}</td>
                  <td className="sr-td">₹ {row.amount.toLocaleString("en-IN")}</td>
                  <td className="sr-td">
                    <span className={`sr-status sr-status--${row.status.toLowerCase().replace(" ", "")}`}>{row.status}</span>
                  </td>
                  <td className="sr-td sr-td--action">
                    <div className="sr-action-cell">
                      <button className="sr-dots-btn" onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === row.id ? null : row.id); }}>
                        <IconDotsVertical />
                      </button>
                      {openMenuId === row.id && (
                        <RowMenu
                          onEdit={e => { e.stopPropagation(); navigate(`/cashier/sales-return-edit/${row.id}`); setOpenMenuId(null); }}
                          onEditHistory={e => { e.stopPropagation(); setOpenMenuId(null); }}
                          onDuplicate={e => { e.stopPropagation(); handleDuplicate(row.id); }}
                          onDelete={e => { e.stopPropagation(); setDeleteId(row.id); setOpenMenuId(null); }}
                          onClose={() => setOpenMenuId(null)} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div className="sr-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="sr-delete-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="sr-delete-confirm-title">Delete this Sales Return?</div>
            <div className="sr-delete-confirm-sub">Stock will be restored. This cannot be undone.</div>
            <div className="sr-delete-confirm-btns">
              <button className="sr-delete-cancel-btn" onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</button>
              <button className="sr-delete-ok-btn" onClick={() => handleDelete(deleteId)} disabled={deleting}>
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} nextSeqNumber={nextSeq}
          onSave={(p, seq, img) => { setPrefix(p); setShowImage(img); }}
          initPrefix={prefix} initShowImage={showImage} />
      )}
    </div>
  );
}