import { useState, useRef, useEffect } from "react";
import "./QuotationEstimate.css";
import { useNavigate } from "react-router-dom";
import QuotationViewModal from "./Quotationviewmodal";

// ─── VIEW STATE ───────────────────────────────────────────────────────────────
// This controls which "page" is shown without needing a router.
// Replace with useNavigate() + <Route> when backend is attached.
type AppView =
  | { screen: "list" }
  | { screen: "create" }
  | { screen: "edit"; id: string }
  | { screen: "duplicate"; sourceId: string };

// ─── Types ───────────────────────────────────────────────────────────────────
interface Quotation {
  id: string;
  date: string;
  quotationNumber: number;
  partyName: string;
  dueIn: string | null;
  amount: number;
  status: "Open" | "Closed";
}

// Full data stored in localStorage (matches CreateQuotation's QuotationData shape)
interface StoredQuotation {
  id: string;
  quotationNo: number;
  quotationDate: string;
  party: { id: number; name: string; mobile: string; balance: number } | null;
  billItems: any[];
  additionalCharges: any[];
  discountType: string;
  discountPct: number;
  discountAmt: number;
  roundOff: string;
  roundOffAmt: number;
  notes: string;
  termsConditions: string;
  eWayBillNo: string;
  challanNo: string;
  financedBy: string;
  salesman: string;
  emailId: string;
  warrantyPeriod: string;
  validFor: number;
  validityDate: string;
  showDueDate: boolean;
  status: "Open" | "Closed";
  createdAt: string;
}

interface QuickSettings {
  prefixEnabled: boolean;
  prefix: string;
  sequenceNumber: number;
  showItemImage: boolean;
  priceHistory: boolean;
  showPricePerItem: boolean;
  showQuantity: boolean;
}

type DateFilterOption =
  | "Today"
  | "Yesterday"
  | "This Week"
  | "Last Week"
  | "Last 7 Days"
  | "This Month"
  | "Previous Month"
  | "Last 30 Days"
  | "This Quarter"
  | "Previous Quarter"
  | "Current Fiscal Year"
  | "Previous Fiscal Year"
  | "Last 365 Days"
  | "Custom";

type StatusFilter = "Show All Quotation" | "Show Open Quotation" | "Show Closed Quotation";

// ─── Sample Data ─────────────────────────────────────────────────────────────
const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: "q4",
    date: "2026-02-28",
    quotationNumber: 4,
    partyName: "MONDAL ELECTRONIC",
    dueIn: null,
    amount: 38540,
    status: "Open",
  },
  {
    id: "q3",
    date: "2026-02-27",
    quotationNumber: 3,
    partyName: "Cash Sale",
    dueIn: null,
    amount: 0,
    status: "Open",
  },
];

// ─── localStorage Helpers ─────────────────────────────────────────────────────
function getStoredQuotations(): StoredQuotation[] {
  try {
    return JSON.parse(localStorage.getItem("quotations") || "[]");
  } catch {
    return [];
  }
}

function saveStoredQuotation(data: StoredQuotation): void {
  const all = getStoredQuotations();
  const idx = all.findIndex((q) => q.id === data.id);
  if (idx >= 0) all[idx] = data;
  else all.unshift(data);
  localStorage.setItem("quotations", JSON.stringify(all));
}

function deleteStoredQuotation(id: string): void {
  const all = getStoredQuotations().filter((q) => q.id !== id);
  localStorage.setItem("quotations", JSON.stringify(all));
}

function getNextQuotationNo(): number {
  const all = getStoredQuotations();
  if (all.length === 0) return 1;
  return Math.max(...all.map((q) => q.quotationNo)) + 1;
}

function storedToListItem(s: StoredQuotation): Quotation {
  const subtotal = s.billItems?.reduce((sum: number, i: any) => sum + (i.amount || 0), 0) || 0;
  const chargesTotal = s.additionalCharges?.reduce((sum: number, c: any) => sum + (c.amount || 0), 0) || 0;
  const discountVal = s.discountPct > 0
    ? ((subtotal + chargesTotal) * s.discountPct) / 100
    : (s.discountAmt || 0);
  const roundVal = s.roundOff === "+Add" ? (s.roundOffAmt || 0) : s.roundOff === "-Reduce" ? -(s.roundOffAmt || 0) : 0;
  const total = subtotal + chargesTotal - discountVal + roundVal;
  return {
    id: s.id,
    date: s.quotationDate,
    quotationNumber: s.quotationNo,
    partyName: s.party?.name || "Cash Sale",
    dueIn: s.showDueDate && s.validityDate ? s.validityDate : null,
    amount: Math.max(0, total),
    status: s.status,
  };
}

function mergeQuotations(initial: Quotation[], stored: StoredQuotation[]): Quotation[] {
  const storedList = stored.map(storedToListItem);
  // Stored ones go first (newest), then initial samples that don't conflict
  const storedIds = new Set(storedList.map((q) => q.id));
  const filteredInitial = initial.filter((q) => !storedIds.has(q.id));
  return [...storedList, ...filteredInitial];
}

// ─── Default Blank QuotationData ──────────────────────────────────────────────
function makeBlanKData(nextNo: number): StoredQuotation {
  const today = new Date().toISOString().split("T")[0];
  const validity = new Date();
  validity.setDate(validity.getDate() + 30);
  const validStr = validity.toISOString().split("T")[0];
  return {
    id: `q-${Date.now()}`,
    quotationNo: nextNo,
    quotationDate: today,
    party: null,
    billItems: [],
    additionalCharges: [],
    discountType: "Discount After Tax",
    discountPct: 0,
    discountAmt: 0,
    roundOff: "none",
    roundOffAmt: 0,
    notes: "",
    termsConditions: "1. Goods once sold will not be taken back or exchanged\n2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only",
    eWayBillNo: "",
    challanNo: "",
    financedBy: "",
    salesman: "",
    emailId: "",
    warrantyPeriod: "",
    validFor: 30,
    validityDate: validStr,
    showDueDate: false,
    status: "Open",
    createdAt: today,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(amount: number) {
  return `₹ ${amount.toLocaleString("en-IN")}`;
}

function getDateRange(filter: DateFilterOption): { start: Date; end: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setHours(23, 59, 59, 999);

  switch (filter) {
    case "Today":
      return { start: today, end };
    case "Yesterday": {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      const ye = new Date(y);
      ye.setHours(23, 59, 59, 999);
      return { start: y, end: ye };
    }
    case "This Week": {
      const s = new Date(today);
      s.setDate(s.getDate() - s.getDay());
      return { start: s, end };
    }
    case "Last Week": {
      const s = new Date(today);
      s.setDate(s.getDate() - s.getDay() - 7);
      const e = new Date(s);
      e.setDate(e.getDate() + 6);
      e.setHours(23, 59, 59, 999);
      return { start: s, end: e };
    }
    case "Last 7 Days": {
      const s = new Date(today);
      s.setDate(s.getDate() - 6);
      return { start: s, end };
    }
    case "This Month": {
      const s = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start: s, end };
    }
    case "Previous Month": {
      const s = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const e = new Date(today.getFullYear(), today.getMonth(), 0);
      e.setHours(23, 59, 59, 999);
      return { start: s, end: e };
    }
    case "Last 30 Days": {
      const s = new Date(today);
      s.setDate(s.getDate() - 29);
      return { start: s, end };
    }
    case "This Quarter": {
      const qStart = Math.floor(today.getMonth() / 3) * 3;
      const s = new Date(today.getFullYear(), qStart, 1);
      return { start: s, end };
    }
    case "Previous Quarter": {
      const qStart = Math.floor(today.getMonth() / 3) * 3 - 3;
      const s = new Date(today.getFullYear(), qStart, 1);
      const e = new Date(today.getFullYear(), qStart + 3, 0);
      e.setHours(23, 59, 59, 999);
      return { start: s, end: e };
    }
    case "Current Fiscal Year": {
      const fyStart = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
      const s = new Date(fyStart, 3, 1);
      return { start: s, end };
    }
    case "Previous Fiscal Year": {
      const fyStart = today.getMonth() >= 3 ? today.getFullYear() - 1 : today.getFullYear() - 2;
      const s = new Date(fyStart, 3, 1);
      const e = new Date(fyStart + 1, 2, 31);
      e.setHours(23, 59, 59, 999);
      return { start: s, end: e };
    }
    case "Last 365 Days": {
      const s = new Date(today);
      s.setDate(s.getDate() - 364);
      return { start: s, end };
    }
    default:
      return { start: new Date(0), end };
  }
}

function formatRangeLabel(filter: DateFilterOption): string {
  if (filter === "Custom") return "Custom";
  const { start, end } = getDateRange(filter);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return `${fmt(start)} - ${fmt(end)}`;
}

const DATE_FILTER_OPTIONS: DateFilterOption[] = [
  "Today",
  "Yesterday",
  "This Week",
  "Last Week",
  "Last 7 Days",
  "This Month",
  "Previous Month",
  "Last 30 Days",
  "This Quarter",
  "Previous Quarter",
  "Current Fiscal Year",
  "Previous Fiscal Year",
  "Last 365 Days",
  "Custom",
];

const RANGE_LABELS: Partial<Record<DateFilterOption, string>> = {
  Today: "01 Mar 2026 - 01 Mar 2026",
  "Previous Quarter": "01 Oct 2025 - 31 Dec 2025",
  "Last 365 Days": "02 Mar 2025 - 01 Mar 2026",
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`qe-toggle ${checked ? "qe-toggle--on" : ""}`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
    >
      <span className="qe-toggle-thumb" />
    </button>
  );
}

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="qe-search-wrapper">
      <svg className="qe-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        className="qe-search-input"
        placeholder="Search quotations..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// ─── Single-Day Calendar Picker ──────────────────────────────────────────────
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function SingleDayPicker({
  value,
  onSelect,
  onClose,
}: {
  value: Date | null;
  onSelect: (d: Date) => void;
  onClose: () => void;
}) {
  const today = new Date(); today.setHours(0,0,0,0);
  const init = value ?? today;
  const [month, setMonth] = useState(init.getMonth());
  const [year, setYear]   = useState(init.getFullYear());
  const [viewMode, setViewMode] = useState<"day" | "month" | "year">("day");

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  // Year grid: show 12 years around current
  const yearBase = Math.floor(year / 12) * 12;
  const yearGrid = Array.from({ length: 12 }, (_, i) => yearBase + i);

  return (
    <div className="qe-single-picker" onClick={e => e.stopPropagation()}>
      {/* Nav header */}
      <div className="qe-cal-nav">
        <button className="qe-cal-nav-btn" onClick={viewMode === "year" ? () => setYear(y => y - 12) : prevMonth}>‹</button>
        <div className="qe-cal-header-btns">
          <button className="qe-cal-hdr-btn" onClick={() => setViewMode(v => v === "month" ? "day" : "month")}>
            {MONTHS[month]}
          </button>
          <button className="qe-cal-hdr-btn" onClick={() => setViewMode(v => v === "year" ? "day" : "year")}>
            {year}
          </button>
        </div>
        <button className="qe-cal-nav-btn" onClick={viewMode === "year" ? () => setYear(y => y + 12) : nextMonth}>›</button>
      </div>

      {/* Day grid */}
      {viewMode === "day" && (
        <>
          <div className="qe-cal-grid-days">
            {DAYS_SHORT.map(d => <div key={d} className="qe-cal-day-label">{d}</div>)}
          </div>
          <div className="qe-cal-grid-cells">
            {cells.map((d, i) => {
              if (d === null) return <div key={`e${i}`} className="qe-cal-cell qe-cal-cell--empty" />;
              const thisDate = new Date(year, month, d);
              const isToday    = thisDate.toDateString() === today.toDateString();
              const isSelected = value ? thisDate.toDateString() === value.toDateString() : false;
              return (
                <div
                  key={i}
                  className={[
                    "qe-cal-cell",
                    isToday    ? "qe-cal-cell--today"    : "",
                    isSelected ? "qe-cal-cell--selected"  : "",
                  ].join(" ").trim()}
                  onClick={() => { onSelect(thisDate); }}
                >
                  {d}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Month grid */}
      {viewMode === "month" && (
        <div className="qe-cal-month-grid">
          {MONTHS.map((m, i) => (
            <button
              key={m}
              className={`qe-cal-month-cell ${i === month ? "qe-cal-month-cell--active" : ""}`}
              onClick={() => { setMonth(i); setViewMode("day"); }}
            >
              {m.slice(0, 3)}
            </button>
          ))}
        </div>
      )}

      {/* Year grid */}
      {viewMode === "year" && (
        <div className="qe-cal-month-grid">
          {yearGrid.map(y => (
            <button
              key={y}
              className={`qe-cal-month-cell ${y === year ? "qe-cal-month-cell--active" : ""}`}
              onClick={() => { setYear(y); setViewMode("day"); }}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="qe-picker-footer">
        <button className="qe-btn-cancel" onClick={onClose}>Cancel</button>
        {value && (
          <span className="qe-picker-selected-label">
            {value.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Date Filter Dropdown ────────────────────────────────────────────────────
function DateFilterDropdown({
  value,
  onChange,
  customDate,
  onCustomDate,
}: {
  value: DateFilterOption;
  onChange: (v: DateFilterOption) => void;
  customDate: Date | null;
  onCustomDate: (d: Date) => void;
}) {
  const [open, setOpen] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowPicker(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function getLabel() {
    if (value === "Custom" && customDate) {
      return customDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    }
    return value;
  }

  return (
    <div className="qe-dropdown-wrap" ref={ref}>
      <button className="qe-dropdown-btn" onClick={() => { setOpen(!open); setShowPicker(false); }}>
        <svg className="qe-cal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="qe-dropdown-btn-label">{getLabel()}</span>
        <svg className="qe-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && !showPicker && (
        <div className="qe-dropdown-menu qe-date-menu">
          {DATE_FILTER_OPTIONS.map((opt) => (
            <div
              key={opt}
              className={`qe-dropdown-item ${opt === value ? "qe-dropdown-item--active" : ""}`}
              onClick={() => {
                if (opt === "Custom") {
                  setShowPicker(true);
                  setOpen(false);
                  onChange(opt);
                } else {
                  onChange(opt);
                  setOpen(false);
                }
              }}
            >
              <span>{opt}</span>
              {RANGE_LABELS[opt] && <span className="qe-range-label">{RANGE_LABELS[opt]}</span>}
            </div>
          ))}
        </div>
      )}

      {showPicker && (
        <div className="qe-picker-dropdown">
          <SingleDayPicker
            value={customDate}
            onSelect={(d) => {
              onCustomDate(d);
              setShowPicker(false);
            }}
            onClose={() => setShowPicker(false)}
          />
        </div>
      )}
    </div>
  );
}

// ─── Status Filter Dropdown ──────────────────────────────────────────────────
function StatusFilterDropdown({
  value,
  onChange,
}: {
  value: StatusFilter;
  onChange: (v: StatusFilter) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const options: StatusFilter[] = ["Show All Quotation", "Show Open Quotation", "Show Closed Quotation"];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="qe-dropdown-wrap" ref={ref}>
      <button className="qe-dropdown-btn" onClick={() => setOpen(!open)}>
        <span>{value}</span>
        <svg className="qe-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="qe-dropdown-menu">
          {options.map((opt) => (
            <div
              key={opt}
              className={`qe-dropdown-item ${opt === value ? "qe-dropdown-item--active" : ""}`}
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Quick Settings Modal ────────────────────────────────────────────────────
// ─── Show/Hide Columns Modal ─────────────────────────────────────────────────
function ShowHideColumnsModal({
  settings,
  onSave,
  onClose,
}: {
  settings: QuickSettings;
  onSave: (s: QuickSettings) => void;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [local, setLocal] = useState({ ...settings });

  function Toggle2({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 12,
          background: checked ? "#4338ca" : "#d1d5db",
          cursor: "pointer", position: "relative",
          transition: "background 0.2s", flexShrink: 0,
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: "50%",
          background: "#fff", position: "absolute",
          top: 3, left: checked ? 23 : 3,
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }} />
      </div>
    );
  }

  return (
    <div className="qe-modal-overlay" onClick={onClose}>
      <div className="qe-shcol-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="qe-shcol-header">
          <h2 className="qe-shcol-title">Show/Hide Columns in Invoice</h2>
          <button className="qe-shcol-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="qe-shcol-body">
          {/* Price per item toggle */}
          <div className="qe-shcol-row">
            <span className="qe-shcol-label">Price/Item (₹)</span>
            <Toggle2 checked={local.showPricePerItem} onChange={(v) => setLocal({ ...local, showPricePerItem: v })} />
          </div>
          {/* Quantity toggle */}
          <div className="qe-shcol-row">
            <span className="qe-shcol-label">Quantity</span>
            <Toggle2 checked={local.showQuantity} onChange={(v) => setLocal({ ...local, showQuantity: v })} />
          </div>

          {/* Custom Column section */}
          <div className="qe-shcol-section-label">CUSTOM COLUMN</div>
          <div className="qe-shcol-empty-box">
            <div className="qe-shcol-empty-title">No Custom Columns added</div>
            <div className="qe-shcol-empty-desc">
              Any custom column such as Batch # &amp; Expiry Date can be added
            </div>
          </div>
          <div className="qe-shcol-hint-box">
            <span>To add Custom Item Columns - Go to <strong>Item settings</strong> from </span>
            <button
              className="qe-shcol-link"
              onClick={() => { onSave(local); onClose(); navigate("/cashier/inventory"); }}
            >
              Items page (click here)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="qe-shcol-footer">
          <button className="qe-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="qe-btn-save" onClick={() => { onSave(local); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

function QuickSettingsModal({
  settings,
  onSave,
  onClose,
}: {
  settings: QuickSettings;
  onSave: (s: QuickSettings) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState({ ...settings });

  return (
    <div className="qe-modal-overlay" onClick={onClose}>
      <div className="qe-modal" onClick={(e) => e.stopPropagation()}>
        <div className="qe-modal-header">
          <h2 className="qe-modal-title">Quick Quotation Settings</h2>
          <button className="qe-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Prefix & Sequence */}
        <div className="qe-settings-card">
          <div className="qe-settings-row">
            <div>
              <div className="qe-settings-label">Quotation Prefix &amp; Sequence Number</div>
              <div className="qe-settings-desc">Add your custom prefix &amp; sequence for Quotation Numbering</div>
            </div>
            <Toggle checked={local.prefixEnabled} onChange={(v) => setLocal({ ...local, prefixEnabled: v })} />
          </div>
          {local.prefixEnabled && (
            <div className="qe-settings-fields">
              <div className="qe-field-group">
                <label className="qe-field-label">Prefix</label>
                <input
                  className="qe-field-input"
                  placeholder="Prefix"
                  value={local.prefix}
                  onChange={(e) => setLocal({ ...local, prefix: e.target.value })}
                />
              </div>
              <div className="qe-field-group">
                <label className="qe-field-label">Sequence Number</label>
                <input
                  className="qe-field-input"
                  type="number"
                  value={local.sequenceNumber}
                  onChange={(e) => setLocal({ ...local, sequenceNumber: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="qe-settings-preview">
                Quotation Number: {local.prefix}{local.sequenceNumber}
              </div>
            </div>
          )}
        </div>

        {/* Show Item Image */}
        <div className="qe-settings-card">
          <div className="qe-settings-row">
            <div>
              <div className="qe-settings-label">Show Item Image on Invoice</div>
              <div className="qe-settings-desc">This will apply to all vouchers except for Payment In and Payment Out</div>
            </div>
            <Toggle checked={local.showItemImage} onChange={(v) => setLocal({ ...local, showItemImage: v })} />
          </div>
        </div>

        {/* Price History */}
        <div className="qe-settings-card">
          <div className="qe-settings-row">
            <div>
              <div className="qe-settings-label">
                Price History <span className="qe-badge-new">New</span>
              </div>
              <div className="qe-settings-desc">Show last 5 sales / purchase prices of the item for the selected party in invoice</div>
            </div>
            <Toggle checked={local.priceHistory} onChange={(v) => setLocal({ ...local, priceHistory: v })} />
          </div>
        </div>

        <div className="qe-modal-actions">
          <button className="qe-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="qe-btn-save" onClick={() => { onSave(local); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────────
function DeleteConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="qe-modal-overlay" onClick={onCancel}>
      <div className="qe-modal qe-modal--sm" onClick={(e) => e.stopPropagation()}>
        <h2 className="qe-delete-title">Are you sure you want to delete this Quotation?</h2>
        <p className="qe-delete-desc">Once deleted, it cannot be recovered</p>
        <div className="qe-modal-actions">
          <button className="qe-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="qe-btn-delete" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Row Action Menu ─────────────────────────────────────────────────────────
function RowActionMenu({
  onEdit,
  onEditHistory,
  onDuplicate,
  onDelete,
}: {
  onEdit: () => void;
  onEditHistory: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="qe-action-wrap" ref={ref}>
      <button className="qe-action-btn" onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
        <span>⋮</span>
      </button>
      {open && (
        <div className="qe-action-menu">
          <button className="qe-action-item" onClick={() => { onEdit(); setOpen(false); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="qe-action-icon">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
          <button className="qe-action-item" onClick={() => { onEditHistory(); setOpen(false); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="qe-action-icon">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Edit History
          </button>
          <button className="qe-action-item" onClick={() => { onDuplicate(); setOpen(false); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="qe-action-icon">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Duplicate
          </button>
          <button className="qe-action-item qe-action-item--danger" onClick={() => { onDelete(); setOpen(false); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="qe-action-icon">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── CreateQuotation Inline (embedded, no router needed) ─────────────────────
// This is a self-contained form. Replace with <Route path="/quotation/create"> when ready.
function CreateQuotationPage({
  editId,
  duplicateSourceId,
  onBack,
  onSaved,
}: {
  editId?: string;
  duplicateSourceId?: string;
  onBack: () => void;
  onSaved: () => void;
}) {
  const navigate = useNavigate();
  const stored = getStoredQuotations();
  const sourceId = editId || duplicateSourceId;
  const source = sourceId ? stored.find((q) => q.id === sourceId) : null;

  const nextNo = getNextQuotationNo();
  const [form, setForm] = useState<StoredQuotation>(() => {
    if (editId && source) return { ...source };
    if (duplicateSourceId && source) {
      // Duplicate: new id + new number + today's date, keep everything else
      const today = new Date().toISOString().split("T")[0];
      return { ...source, id: `q-${Date.now()}`, quotationNo: nextNo, quotationDate: today, status: "Open" as const };
    }
    return makeBlanKData(nextNo);
  });

  // ── Party Selector state ───────────────────────────────────────────────────
  const [showPartyDrop, setShowPartyDrop] = useState(false);
  const [partySearch, setPartySearch] = useState("");
  const partyRef = useRef<HTMLDivElement>(null);
  const parties: any[] = JSON.parse(localStorage.getItem("parties") || "[]");

  // ── Items modal state ──────────────────────────────────────────────────────
  const [showAddItems, setShowAddItems] = useState(false);
  const [itemSelections, setItemSelections] = useState<Record<number, number>>({});
  const [itemSearch, setItemSearch] = useState("");
  const [itemCategory, setItemCategory] = useState("");

  // ── Settings modal ─────────────────────────────────────────────────────────
  const [showSettings, setShowSettings] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [settings, setSettings] = useState<QuickSettings>({
    prefixEnabled: true, prefix: "", sequenceNumber: nextNo, showItemImage: true, priceHistory: true,
    showPricePerItem: true, showQuantity: true,
  });

  // ── Shipping Address state ─────────────────────────────────────────────────
  interface ShippingAddress {
    id: string;
    name: string;
    street: string;
    state: string;
    pincode: string;
    city: string;
  }
  const INDIAN_STATES = [
    "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
    "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
    "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
    "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
    "Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh","Puducherry",
  ];

  const [shippingAddresses, setShippingAddresses] = useState<ShippingAddress[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string>("");
  const [showChangeShipping, setShowChangeShipping] = useState(false);
  const [showAddShipping, setShowAddShipping] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);
  const [shippingForm, setShippingForm] = useState<ShippingAddress>({ id: "", name: "", street: "", state: "", pincode: "", city: "" });

  // Seed default shipping once per party using useEffect — never overwrites manually added addresses
  useEffect(() => {
    if (form.party) {
      const street = (form.party as any).shippingAddress || (form.party as any).billingAddress || "";
      const defaultAddr: ShippingAddress = {
        id: `sa-default-${form.party.id}`,
        name: form.party.name,
        street,
        state: "", pincode: "", city: "",
      };
      setShippingAddresses([defaultAddr]);
      setSelectedShippingId(defaultAddr.id);
    } else {
      setShippingAddresses([]);
      setSelectedShippingId("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.party?.id]);

  const activeShipping = shippingAddresses.find((a) => a.id === selectedShippingId);

  function openAddShipping() {
    const blank: ShippingAddress = { id: `sa-${Date.now()}`, name: form.party?.name || "", street: "", state: "", pincode: "", city: "" };
    setShippingForm(blank);
    setEditingAddress(null);
    setShowChangeShipping(false);
    setShowAddShipping(true);
  }

  function openEditShipping(addr: ShippingAddress) {
    setShippingForm({ ...addr });
    setEditingAddress(addr);
    setShowChangeShipping(false);
    setShowAddShipping(true);
  }

  function handleSaveShipping() {
    if (!shippingForm.name.trim() || !shippingForm.street.trim()) return;
    if (editingAddress) {
      setShippingAddresses((prev) => prev.map((a) => a.id === shippingForm.id ? shippingForm : a));
    } else {
      setShippingAddresses((prev) => [...prev, shippingForm]);
      setSelectedShippingId(shippingForm.id);
    }
    setShowAddShipping(false);
    setEditingAddress(null);
    setShowChangeShipping(true);
  }

  // ── Notes/Terms expand ─────────────────────────────────────────────────────
  const [showNotes, setShowNotes] = useState(!!form.notes);
  const [showDiscount, setShowDiscount] = useState(form.discountPct > 0 || form.discountAmt > 0);
  const [paymentAmount, setPaymentAmount] = useState<number | "">("");

  // ── Bank Account Modal ────────────────────────────────────────────────────
  const [showBankModal, setShowBankModal] = useState(false);
  const [showSelectBankModal, setShowSelectBankModal] = useState(false);
  const [savedBankAccounts, setSavedBankAccounts] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem("bankAccounts") || "[]"); } catch { return []; }
  });
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [bankForm, setBankForm] = useState({
    accountNumber: "", reEnterAccountNumber: "", ifscCode: "",
    bankBranchName: "", accountHolderName: "", upiId: "",
  });

  useEffect(() => {
    function h(e: MouseEvent) {
      if (partyRef.current && !partyRef.current.contains(e.target as Node)) setShowPartyDrop(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Calculations ──────────────────────────────────────────────────────────
  const subtotal = form.billItems.reduce((s: number, i: any) => s + (i.amount || 0), 0);
  const chargesTotal = form.additionalCharges.reduce((s: number, c: any) => s + (c.amount || 0), 0);
  const taxableAmount = subtotal + chargesTotal;
  const discountValue = form.discountPct > 0 ? (taxableAmount * form.discountPct) / 100 : form.discountAmt;
  const afterDiscount = taxableAmount - discountValue;
  const roundVal = form.roundOff === "+Add" ? form.roundOffAmt : form.roundOff === "-Reduce" ? -form.roundOffAmt : 0;
  const total = afterDiscount + roundVal;

  // ── Meta field change ─────────────────────────────────────────────────────
  function setField(field: keyof StoredQuotation, value: any) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  // ── Item helpers ──────────────────────────────────────────────────────────
  const SAMPLE_ITEMS = [
    { id: 1, name: "BILLING SOFTWARE MOBILE APP", itemCode: "-", stock: "-", salesPrice: 256, purchasePrice: 0, unit: "PCS", category: "" },
    { id: 2, name: "BILLING SOFTWARE WITH GST", itemCode: "-", stock: "-", salesPrice: 369875, purchasePrice: 0, unit: "PCS", category: "" },
    { id: 3, name: "BILLING SOFTWARE WITHOUT GST", itemCode: "-", stock: "-", salesPrice: 3556, purchasePrice: 0, unit: "PCS", category: "" },
    { id: 4, name: "GODREJ FRIDGE", itemCode: "34567", stock: "143 ACS", salesPrice: 42000, purchasePrice: 0, unit: "ACS", category: "Electronics" },
    { id: 5, name: "HERIER AC", itemCode: "1234", stock: "93 PCS", salesPrice: 45000, purchasePrice: 38000, unit: "PCS", category: "Electronics" },
    { id: 6, name: "HISENSE 32 INCH", itemCode: "-", stock: "39 PCS", salesPrice: 21000, purchasePrice: 18000, unit: "PCS", category: "Electronics" },
  ];
  const storedItems: any[] = JSON.parse(localStorage.getItem("items") || "[]");
  const allItems = storedItems.length > 0 ? storedItems : SAMPLE_ITEMS;
  const itemCategories: string[] = Array.from(new Set(allItems.map((i: any) => i.category || "").filter(Boolean)));
  const filteredItems = allItems.filter((item: any) => {
    const s = itemSearch.toLowerCase();
    const matchSearch = !s || item.name.toLowerCase().includes(s) || (item.itemCode || "").toLowerCase().includes(s) || (item.hsn || "").toLowerCase().includes(s) || (item.category || "").toLowerCase().includes(s);
    const matchCat = !itemCategory || item.category === itemCategory;
    return matchSearch && matchCat;
  });
  const selectedItemCount = Object.values(itemSelections).filter((q) => q > 0).length;

  function handleAddToBill() {
    const newRows: any[] = [];
    Object.entries(itemSelections).forEach(([id, qty]) => {
      if (qty <= 0) return;
      const item = allItems.find((i: any) => i.id === Number(id));
      if (!item) return;
      newRows.push({
        rowId: `row-${Date.now()}-${id}`,
        itemId: item.id, name: item.name, description: "", hsn: "",
        qty, unit: item.unit, price: item.salesPrice,
        discountPct: 0, discountAmt: 0, taxLabel: "None", taxRate: 0,
        amount: item.salesPrice * qty,
      });
    });
    setForm((p) => ({ ...p, billItems: [...p.billItems, ...newRows] }));
    setItemSelections({});
    setShowAddItems(false);
  }

  function updateBillItem(rowId: string, field: string, value: any) {
    setForm((p) => ({
      ...p,
      billItems: p.billItems.map((item: any) => {
        if (item.rowId !== rowId) return item;
        const next = { ...item, [field]: value };
        const base = next.price * next.qty;
        const discountVal = next.discountPct > 0 ? (base * next.discountPct) / 100 : next.discountAmt;
        next.amount = (base - discountVal) * (1 + next.taxRate / 100);
        return next;
      }),
    }));
  }

  function removeItem(rowId: string) {
    setForm((p) => ({ ...p, billItems: p.billItems.filter((i: any) => i.rowId !== rowId) }));
  }

  // ── Charge helpers ────────────────────────────────────────────────────────
  function addCharge() {
    setForm((p) => ({
      ...p,
      additionalCharges: [...p.additionalCharges, { id: `c-${Date.now()}`, label: "", amount: 0, taxLabel: "No Tax Applicable" }],
    }));
  }
  function updateCharge(id: string, field: string, value: any) {
    setForm((p) => ({ ...p, additionalCharges: p.additionalCharges.map((c: any) => c.id === id ? { ...c, [field]: value } : c) }));
  }
  function removeCharge(id: string) {
    setForm((p) => ({ ...p, additionalCharges: p.additionalCharges.filter((c: any) => c.id !== id) }));
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  function handleSave() {
    saveStoredQuotation(form);
    onSaved();
  }

  function handleSaveAndNew() {
    saveStoredQuotation(form);
    const newNo = getNextQuotationNo();
    setForm(makeBlanKData(newNo));
    setShowNotes(false);
    setShowDiscount(false);
    setItemSelections({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const fmtDate = (s: string) => {
    if (!s) return "";
    const d = new Date(s);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const [discountMenu, setDiscountMenu] = useState(false);
  const [roundMenu, setRoundMenu] = useState(false);

  return (
    <div className="qe-page qe-create-page">
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="qe-create-bar">
        <div className="qe-create-bar-left">
          <button className="qe-back-btn" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <span className="qe-create-title">{editId ? "Edit Quotation" : "Create Quotation"}</span>
        </div>
        <div className="qe-create-bar-right">
          <button className="qe-settings-bar-btn" onClick={() => setShowSettings(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
            <span className="qe-notif-dot qe-notif-dot--inline" />
          </button>
          <button className="qe-btn-secondary" onClick={handleSaveAndNew}>Save &amp; New</button>
          <button className="qe-btn-create" onClick={handleSave}>Save</button>
        </div>
      </div>

      <div className="qe-create-body">
        {/* ── TOP SECTION: Party | Meta ────────────────────────────────── */}
        <div className="qe-create-top">
          {/* Bill To */}
          <div className="qe-bill-to-col">
            {!form.party ? (
              <div ref={partyRef}>
                <div className="qe-field-label-sm">Bill To</div>
                {!showPartyDrop ? (
                  <button className="qe-add-party-btn" onClick={() => setShowPartyDrop(true)}>+ Add Party</button>
                ) : (
                  <div className="qe-party-dropdown">
                    <div className="qe-party-search-row">
                      <input autoFocus className="qe-party-search" placeholder="Search party by name or number"
                        value={partySearch} onChange={(e) => setPartySearch(e.target.value)} />
                      <svg className="qe-party-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                    </div>
                    <div className="qe-party-list-hdr"><span>Party Name</span><span>Balance</span></div>
                    <div className="qe-party-list">
                      {parties.filter((p) => p.name?.toLowerCase().includes(partySearch.toLowerCase())).map((p) => (
                        <div key={p.id} className="qe-party-list-item" onClick={() => { setField("party", p); setShowPartyDrop(false); }}>
                          <span>{p.name}</span>
                          <span className="qe-party-balance">
                            ₹ {Math.abs(p.balance || 0).toLocaleString("en-IN")}
                            {p.balance < 0 && <svg style={{width:13,height:13,color:"#16a34a",marginLeft:3}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="5 12 12 19 19 12"/></svg>}
                          </span>
                        </div>
                      ))}
                      {parties.filter((p) => p.name?.toLowerCase().includes(partySearch.toLowerCase())).length === 0 && (
                        <div className="qe-party-empty">No parties found</div>
                      )}
                    </div>
                  <button
  className="qe-party-create-btn"
  onClick={() => navigate("/cashier/create-party")}
>
  + Create Party
</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="qe-party-selected-wrap">
                <div className="qe-party-selected-col">
                  <div className="qe-party-selected-hdr">
                    <span className="qe-party-selected-title">Bill To</span>
                    <button className="qe-party-change-btn" onClick={() => setField("party", null)}>Change Party</button>
                  </div>
                  <div className="qe-party-selected-body">
                    <div className="qe-party-selected-name">{form.party.name}</div>
                    {form.party.mobile && form.party.mobile !== "-" && (
                      <div className="qe-party-selected-info">Phone: <span>{form.party.mobile}</span></div>
                    )}
                  </div>
                </div>
                <div className="qe-party-selected-col">
                  <div className="qe-party-selected-hdr">
                    <span className="qe-party-selected-title">Ship To</span>
                    <button className="qe-party-change-btn" onClick={() => setShowChangeShipping(true)}>Change Shipping Address</button>
                  </div>
                  <div className="qe-party-selected-body">
                    <div className="qe-party-selected-name">{form.party.name}</div>
                    {form.party.mobile && form.party.mobile !== "-" && (
                      <div className="qe-party-selected-info">Phone: <span>{form.party.mobile}</span></div>
                    )}
                    {activeShipping?.street && (
                      <div className="qe-party-selected-info">{activeShipping.street}</div>
                    )}
                    {activeShipping && (activeShipping.city || activeShipping.state || activeShipping.pincode) && (
                      <div className="qe-party-selected-info">
                        {[activeShipping.city, activeShipping.state, activeShipping.pincode].filter(Boolean).join(", ")}
                      </div>
                    )}
                    {/* Fallback to raw party address if no active shipping seeded */}
                    {!activeShipping && (form.party as any).shippingAddress && (
                      <div className="qe-party-selected-info">{(form.party as any).shippingAddress}</div>
                    )}
                    {!activeShipping && !(form.party as any).shippingAddress && (form.party as any).billingAddress && (
                      <div className="qe-party-selected-info">{(form.party as any).billingAddress}</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Meta fields */}
          <div className="qe-meta-col">
            <div className="qe-meta-row">
              <div className="qe-meta-field">
                <label className="qe-field-label-sm">Quotation No:</label>
                <input className="qe-meta-input qe-meta-input--no" type="number" value={form.quotationNo}
                  onChange={(e) => setField("quotationNo", Number(e.target.value))} />
              </div>
              <div className="qe-meta-field">
                <label className="qe-field-label-sm">Quotation Date:</label>
                <div className="qe-date-wrap">
                  <button className="qe-date-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {fmtDate(form.quotationDate)}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:13,height:13}}><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <input type="date" className="qe-date-native" value={form.quotationDate}
                    onChange={(e) => {
                      setField("quotationDate", e.target.value);
                      const v = new Date(e.target.value); v.setDate(v.getDate() + form.validFor);
                      setField("validityDate", v.toISOString().split("T")[0]);
                    }} />
                </div>
              </div>
            </div>

            {/* Due Date */}
            {!form.showDueDate ? (
              <button className="qe-due-add-btn" onClick={() => setField("showDueDate", true)}>+ Add Due Date</button>
            ) : (
              <div className="qe-due-box">
                <button className="qe-due-close" onClick={() => setField("showDueDate", false)}>✕</button>
                <div className="qe-meta-row">
                  <div className="qe-meta-field">
                    <label className="qe-field-label-sm">Valid For:</label>
                    <div className="qe-valid-row">
                      <input className="qe-meta-input qe-meta-input--small" type="number" value={form.validFor}
                        onChange={(e) => {
                          const days = Number(e.target.value);
                          setField("validFor", days);
                          const v = new Date(form.quotationDate); v.setDate(v.getDate() + days);
                          setField("validityDate", v.toISOString().split("T")[0]);
                        }} />
                      <span className="qe-unit-text">days</span>
                    </div>
                  </div>
                  <div className="qe-meta-field">
                    <label className="qe-field-label-sm">Validity Date:</label>
                    <button className="qe-date-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {fmtDate(form.validityDate)}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:13,height:13}}><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Extra fields */}
            <div className="qe-extras-grid">
              {[
                ["E-Way Bill No:", "eWayBillNo"],
                ["Challan No.:", "challanNo"],
                ["Financed By:", "financedBy"],
                ["Salesman:", "salesman"],
                ["Email ID:", "emailId"],
                ["Warranty Period:", "warrantyPeriod"],
              ].map(([label, key]) => (
                <div className="qe-meta-field" key={key}>
                  <label className="qe-field-label-sm">{label}</label>
                  <input className="qe-meta-input" value={(form as any)[key]}
                    onChange={(e) => setField(key as keyof StoredQuotation, e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Items Table ──────────────────────────────────────────────── */}
        <div className="qe-items-section">
          <table className="qe-items-table">
            <thead>
              <tr>
                <th className="qe-it-th qe-it-th--no">NO</th>
                <th className="qe-it-th">ITEMS / SERVICES</th>
                <th className="qe-it-th qe-it-th--c">HSN / SAC</th>
                {settings.showQuantity && <th className="qe-it-th qe-it-th--c">QTY</th>}
                {settings.showPricePerItem && <th className="qe-it-th qe-it-th--r">PRICE / ITEM (₹)</th>}
                <th className="qe-it-th qe-it-th--r">DISCOUNT</th>
                <th className="qe-it-th qe-it-th--c">TAX</th>
                <th className="qe-it-th qe-it-th--r">AMOUNT (₹)</th>
                <th className="qe-it-th qe-it-th--add">
                  <button className="qe-it-add-col" onClick={() => setShowColumnModal(true)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {form.billItems.map((item: any, idx: number) => (
                <tr key={item.rowId} className="qe-it-tr">
                  <td className="qe-it-td qe-it-td--no">{idx + 1}</td>
                  <td className="qe-it-td">
                    <div className="qe-it-name">{item.name}</div>
                    <input className="qe-it-desc" placeholder="Enter Description (optional)"
                      value={item.description} onChange={(e) => updateBillItem(item.rowId, "description", e.target.value)} />
                  </td>
                  <td className="qe-it-td qe-it-td--c">
                    <input className="qe-it-cell" value={item.hsn} placeholder="—"
                      onChange={(e) => updateBillItem(item.rowId, "hsn", e.target.value)} />
                  </td>
                  {settings.showQuantity && (
                  <td className="qe-it-td qe-it-td--c">
                    <div className="qe-it-qty-row">
                      <input className="qe-it-qty" type="number" value={item.qty}
                        onChange={(e) => updateBillItem(item.rowId, "qty", Number(e.target.value))} />
                      <span className="qe-it-unit">{item.unit}</span>
                    </div>
                  </td>
                  )}
                  {settings.showPricePerItem && (
                  <td className="qe-it-td qe-it-td--r">
                    <input className="qe-it-cell qe-it-cell--r" type="number" value={item.price}
                      onChange={(e) => updateBillItem(item.rowId, "price", Number(e.target.value))} />
                  </td>
                  )}
                  <td className="qe-it-td">
                    <div className="qe-it-disc-col">
                      <div className="qe-it-disc-row"><span className="qe-it-sym">%</span>
                        <input className="qe-it-disc" type="number" value={item.discountPct}
                          onChange={(e) => updateBillItem(item.rowId, "discountPct", Number(e.target.value))} /></div>
                      <div className="qe-it-disc-row"><span className="qe-it-sym">₹</span>
                        <input className="qe-it-disc" type="number" value={item.discountAmt}
                          onChange={(e) => updateBillItem(item.rowId, "discountAmt", Number(e.target.value))} /></div>
                    </div>
                  </td>
                  <td className="qe-it-td">
                    <div className="qe-it-tax-col">
                      <select className="qe-it-tax" value={item.taxLabel}
                        onChange={(e) => {
                          const rates: Record<string,number> = {"None":0,"GST 5%":5,"GST 12%":12,"GST 18%":18,"GST 28%":28};
                          updateBillItem(item.rowId, "taxLabel", e.target.value);
                          updateBillItem(item.rowId, "taxRate", rates[e.target.value] || 0);
                        }}>
                        {["None","GST 5%","GST 12%","GST 18%","GST 28%","IGST 5%","IGST 12%","IGST 18%","IGST 28%"].map(t => <option key={t}>{t}</option>)}
                      </select>
                      <span className="qe-it-tax-amt">(₹ {(((item.price * item.qty) - (item.discountPct > 0 ? (item.price * item.qty * item.discountPct) / 100 : item.discountAmt)) * item.taxRate / 100).toFixed(0)})</span>
                    </div>
                  </td>
                  <td className="qe-it-td qe-it-td--r qe-it-td--amt">₹ {item.amount.toLocaleString("en-IN")}</td>
                  <td className="qe-it-td qe-it-td--del">
                    <button className="qe-it-del" onClick={() => removeItem(item.rowId)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {/* Add Item row */}
              <tr><td colSpan={7}>
                <button className="qe-add-item-btn" onClick={() => setShowAddItems(true)}>+ Add Item</button>
              </td><td colSpan={2}>
                <button className="qe-scan-btn" onClick={() => setShowAddItems(true)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:22,height:22}}>
                    <path d="M3 9V5a2 2 0 0 1 2-2h4M3 15v4a2 2 0 0 0 2 2h4M21 9V5a2 2 0 0 0-2-2h-4M21 15v4a2 2 0 0 1-2 2h-4"/>
                    <line x1="7" y1="8" x2="7" y2="16"/><line x1="10" y1="8" x2="10" y2="16"/>
                    <line x1="14" y1="8" x2="14" y2="16"/><line x1="17" y1="8" x2="17" y2="16"/>
                  </svg>
                  Scan Barcode
                </button>
              </td></tr>
              {/* Subtotal */}
              {form.billItems.length > 0 && (
                <tr className="qe-subtotal-row">
                  <td colSpan={3} className="qe-subtotal-label">SUBTOTAL</td>
                  <td className="qe-subtotal-val" style={{textAlign:"center"}}>
                    ₹ {form.billItems.reduce((s: number, i: any) => s + i.qty, 0)}
                  </td>
                  <td />
                  <td className="qe-subtotal-val" style={{textAlign:"right"}}>
                    ₹ {form.billItems.reduce((s: number, i: any) => s + (i.discountPct > 0 ? i.price * i.qty * i.discountPct / 100 : i.discountAmt), 0).toFixed(0)}
                  </td>
                  <td />
                  <td className="qe-subtotal-val" style={{textAlign:"right"}}>₹ {subtotal.toLocaleString("en-IN")}</td>
                  <td />
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Bottom: Notes | Summary ──────────────────────────────────── */}
        <div className="qe-create-bottom">
          {/* Left: Notes + Terms + Bank */}
          <div className="qe-bottom-left">
            {!showNotes ? (
              <button className="qe-link-btn" onClick={() => setShowNotes(true)}>+ Add Notes</button>
            ) : (
              <div className="qe-notes-box">
                <div className="qe-notes-hdr"><span>Notes</span><button className="qe-remove-btn" onClick={() => setShowNotes(false)}>⊗</button></div>
                <textarea className="qe-notes-ta" placeholder="Enter your notes" rows={3}
                  value={form.notes} onChange={(e) => setField("notes", e.target.value)} />
              </div>
            )}
            <div className="qe-terms-box">
              <div className="qe-notes-hdr"><span>Terms and Conditions</span><button className="qe-remove-btn">⊗</button></div>
              <div className="qe-terms-inner">
                <textarea className="qe-terms-ta" rows={4}
                  value={form.termsConditions} onChange={(e) => setField("termsConditions", e.target.value)} />
              </div>
            </div>
            <button className="qe-link-btn" onClick={() => savedBankAccounts.length > 0 ? setShowSelectBankModal(true) : setShowBankModal(true)}>+ Add New Account</button>
          </div>

          {/* Right: Summary */}
          <div className="qe-summary-box">
            {/* Additional charges */}
            {form.additionalCharges.map((c: any) => (
              <div key={c.id} className="qe-charge-row">
                <input className="qe-charge-lbl" placeholder="Enter charge (ex. Transport Charge)"
                  value={c.label} onChange={(e) => updateCharge(c.id, "label", e.target.value)} />
                <div className="qe-charge-amt-wrap"><span className="qe-rs">₹</span>
                  <input className="qe-charge-amt" type="number" value={c.amount}
                    onChange={(e) => updateCharge(c.id, "amount", Number(e.target.value))} /></div>
                <select className="qe-charge-tax" value={c.taxLabel}
                  onChange={(e) => updateCharge(c.id, "taxLabel", e.target.value)}>
                  {["No Tax Applicable","GST 5%","GST 12%","GST 18%","GST 28%"].map(o => <option key={o}>{o}</option>)}
                </select>
                <button className="qe-remove-btn" onClick={() => removeCharge(c.id)}>⊗</button>
              </div>
            ))}
            <button className="qe-link-btn" onClick={addCharge}>+ Add Additional Charges</button>

            <div className="qe-sum-row"><span>Taxable Amount</span><span>₹ {taxableAmount.toLocaleString("en-IN")}</span></div>

            {/* Discount */}
            {!showDiscount ? (
              <button className="qe-link-btn" onClick={() => setShowDiscount(true)}>+ Add Discount</button>
            ) : (
              <div className="qe-discount-row">
                <div className="qe-disc-type-wrap">
                  <button className="qe-disc-type-btn" onClick={() => setDiscountMenu(!discountMenu)}>
                    {form.discountType}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:13,height:13}}><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {discountMenu && (
                    <div className="qe-disc-menu">
                      {["Discount Before Tax","Discount After Tax"].map(t => (
                        <div key={t} className={`qe-dropdown-item ${form.discountType === t ? "qe-dropdown-item--active" : ""}`}
                          onClick={() => { setField("discountType", t); setDiscountMenu(false); }}>{t}</div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="qe-disc-fields">
                  <div className="qe-disc-field"><span className="qe-rs">%</span>
                    <input className="qe-disc-inp" type="number" value={form.discountPct}
                      onChange={(e) => { setField("discountPct", Number(e.target.value)); setField("discountAmt", 0); }} /></div>
                  <span className="qe-slash">/</span>
                  <div className="qe-disc-field"><span className="qe-rs">₹</span>
                    <input className="qe-disc-inp" type="number" value={form.discountAmt}
                      onChange={(e) => { setField("discountAmt", Number(e.target.value)); setField("discountPct", 0); }} /></div>
                </div>
                <button className="qe-remove-btn" onClick={() => { setShowDiscount(false); setField("discountPct", 0); setField("discountAmt", 0); }}>⊗</button>
              </div>
            )}
            {showDiscount && discountValue > 0 && (
              <div className="qe-sum-row" style={{color:"#16a34a"}}>
                <span />
                <span>- ₹ {discountValue.toFixed(0)}</span>
              </div>
            )}

            {/* Round Off */}
            <div className="qe-round-row">
              <label className="qe-round-label">
                <input type="checkbox" checked={form.roundOff !== "none"}
                  onChange={(e) => setField("roundOff", e.target.checked ? "+Add" : "none")} />
                Auto Round Off
              </label>
              <div className="qe-round-right">
                <div className="qe-round-mode-wrap">
                  <button className="qe-round-mode-btn" onClick={() => setRoundMenu(!roundMenu)}>
                    {form.roundOff === "-Reduce" ? "- Reduce" : "+ Add"}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:12,height:12}}><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {roundMenu && (
                    <div className="qe-dropdown-menu" style={{right:0,left:"auto",minWidth:120}}>
                      {["+Add","-Reduce"].map(m => (
                        <div key={m} className={`qe-dropdown-item ${form.roundOff === m ? "qe-dropdown-item--active" : ""}`}
                          onClick={() => { setField("roundOff", m); setRoundMenu(false); }}>
                          {m === "+Add" ? "+ Add" : "- Reduce"}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="qe-rs">₹</span>
                <input className="qe-round-inp" type="number" value={form.roundOffAmt}
                  onChange={(e) => setField("roundOffAmt", Number(e.target.value))} />
              </div>
            </div>

            <div className="qe-total-row">
              <span>Total Amount</span>
              <span>₹ {total.toLocaleString("en-IN", { minimumFractionDigits: 0 })}</span>
            </div>

            {/* Payment amount — disabled placeholder always */}
            <div className="qe-payment-placeholder">Enter Payment amount</div>
            <div className="qe-signatory">Authorized signatory for <strong>scratchweb.solutions</strong><div className="qe-sign-box" /></div>
          </div>
        </div>
      </div>

      {/* ── Add Items Modal ──────────────────────────────────────────────── */}
      {showAddItems && (
        <div className="qe-modal-overlay" onClick={() => { setShowAddItems(false); setItemSearch(""); setItemCategory(""); setItemSelections({}); }}>
          <div className="qe-aim-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="qe-aim-header">
              <h2 className="qe-aim-title">Add Items to Bill</h2>
              <button className="qe-aim-close" onClick={() => { setShowAddItems(false); setItemSearch(""); setItemCategory(""); setItemSelections({}); }}>✕</button>
            </div>

            {/* Toolbar */}
            <div className="qe-aim-toolbar">
              <div className="qe-aim-search-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:15,height:15,color:"#9ca3af",flexShrink:0,marginLeft:12}}>
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  className="qe-aim-search"
                  autoFocus
                  placeholder="Search by Item/ Serial no./ HSN code/ SKU/ Custom Field / Category"
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                />
                <button className="qe-aim-barcode-btn" title="Scan barcode — use search to filter by item code">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:18,height:18}}>
                    <path d="M3 9V5a2 2 0 0 1 2-2h4M3 15v4a2 2 0 0 0 2 2h4M21 9V5a2 2 0 0 0-2-2h-4M21 15v4a2 2 0 0 1-2 2h-4"/>
                    <line x1="7" y1="8" x2="7" y2="16"/><line x1="10" y1="8" x2="10" y2="16"/>
                    <line x1="14" y1="8" x2="14" y2="16"/><line x1="17" y1="8" x2="17" y2="16"/>
                  </svg>
                </button>
              </div>
              <select className="qe-aim-cat" value={itemCategory} onChange={(e) => setItemCategory(e.target.value)}>
                <option value="">Select Category</option>
                {itemCategories.map((cat: string) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button className="qe-aim-create-btn" onClick={() => { setShowAddItems(false); navigate("/cashier/create-item"); }}>
                Create New Item
              </button>
            </div>

            {/* Table */}
            <div className="qe-aim-table-wrap">
              <table className="qe-aim-table">
                <thead><tr>
                  <th className="qe-aim-th">Item Name</th>
                  <th className="qe-aim-th qe-aim-th--c">Item Code</th>
                  <th className="qe-aim-th qe-aim-th--c">Stock</th>
                  <th className="qe-aim-th qe-aim-th--r">Sales Price</th>
                  <th className="qe-aim-th qe-aim-th--r">Purchase Price</th>
                  <th className="qe-aim-th qe-aim-th--c">Quantity</th>
                </tr></thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr><td colSpan={6} className="qe-aim-empty">No items found</td></tr>
                  ) : filteredItems.map((item: any) => {
                    const qty = itemSelections[item.id] || 0;
                    return (
                      <tr key={item.id} className={`qe-aim-tr ${qty > 0 ? "qe-aim-tr--sel" : ""}`}>
                        <td className="qe-aim-td">{item.name}</td>
                        <td className="qe-aim-td qe-aim-td--c">{item.itemCode || "-"}</td>
                        <td className="qe-aim-td qe-aim-td--c">{item.stock || "-"}</td>
                        <td className="qe-aim-td qe-aim-td--r">₹{item.salesPrice?.toLocaleString("en-IN")}</td>
                        <td className="qe-aim-td qe-aim-td--r">{item.purchasePrice > 0 ? `₹${item.purchasePrice?.toLocaleString("en-IN")}` : "-"}</td>
                        <td className="qe-aim-td qe-aim-td--c">
                          {qty === 0 ? (
                            <button className="qe-aim-add-btn" onClick={() => setItemSelections((p: any) => ({ ...p, [item.id]: 1 }))}>+ Add</button>
                          ) : (
                            <div className="qe-aim-qty-row">
                              <button className="qe-aim-qty-btn" onClick={() => setItemSelections((p: any) => ({ ...p, [item.id]: Math.max(0, qty - 1) }))}>−</button>
                              <input className="qe-aim-qty-inp" type="number" value={qty}
                                onChange={(e) => setItemSelections((p: any) => ({ ...p, [item.id]: Number(e.target.value) }))} />
                              <button className="qe-aim-qty-btn" onClick={() => setItemSelections((p: any) => ({ ...p, [item.id]: qty + 1 }))}>+</button>
                              <span style={{fontSize:12,color:"#6b7280"}}>{item.unit}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="qe-aim-footer">
              <div className="qe-aim-shortcuts">
                <strong className="qe-aim-shortcut-label">Keyboard Shortcuts :</strong>
                <span>Change Quantity</span><kbd className="qe-kbd">Enter</kbd>
                <span>Move between items</span><kbd className="qe-kbd">↑</kbd><kbd className="qe-kbd">↓</kbd>
              </div>
              <div className="qe-aim-footer-right">
                <span className="qe-aim-sel-count">Show {selectedItemCount} Item(s) Selected</span>
                <button className="qe-aim-cancel-btn" onClick={() => { setItemSelections({}); setItemSearch(""); setItemCategory(""); setShowAddItems(false); }}>Cancel [ESC]</button>
                <button className={`qe-aim-confirm-btn${selectedItemCount === 0 ? " qe-aim-confirm-btn--disabled" : ""}`}
                  onClick={handleAddToBill} disabled={selectedItemCount === 0}>Add to Bill [F7]</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Bank Account Modal (Image 1 style) ───────────────────── */}
      {showBankModal && (
        <div className="qe-modal-overlay" onClick={() => setShowBankModal(false)}>
          <div className="qe-bank-modal" onClick={(e) => e.stopPropagation()}>
            <div className="qe-bank-header">
              <h2 className="qe-bank-title">Add Bank Account</h2>
              <button className="qe-bank-close" onClick={() => setShowBankModal(false)}>✕</button>
            </div>
            <div className="qe-bank-body">
              {/* Row 1: Account Number + Re-Enter */}
              <div className="qe-bank-grid">
                <div className="qe-bank-field">
                  <label className="qe-bank-label">Bank Account Number <span className="qe-req">*</span></label>
                  <input className="qe-bank-input" placeholder="ex: 123456789"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm(p => ({ ...p, accountNumber: e.target.value }))} />
                </div>
                <div className="qe-bank-field">
                  <label className="qe-bank-label">Re-Enter Bank Account Number <span className="qe-req">*</span></label>
                  <input className="qe-bank-input" placeholder="ex: 123456789"
                    value={bankForm.reEnterAccountNumber}
                    onChange={(e) => setBankForm(p => ({ ...p, reEnterAccountNumber: e.target.value }))} />
                </div>
              </div>
              {/* Row 2: IFSC + Bank Branch */}
              <div className="qe-bank-grid">
                <div className="qe-bank-field">
                  <label className="qe-bank-label">IFSC Code</label>
                  <input className="qe-bank-input" placeholder="ex: ICIC0001234"
                    value={bankForm.ifscCode}
                    onChange={(e) => setBankForm(p => ({ ...p, ifscCode: e.target.value }))} />
                </div>
                <div className="qe-bank-field">
                  <label className="qe-bank-label">Bank &amp; Branch Name</label>
                  <input className="qe-bank-input" placeholder="ex: ICICI Bank, Mumbai"
                    value={bankForm.bankBranchName}
                    onChange={(e) => setBankForm(p => ({ ...p, bankBranchName: e.target.value }))} />
                </div>
              </div>
              {/* Row 3: Account Holder + UPI */}
              <div className="qe-bank-grid">
                <div className="qe-bank-field">
                  <label className="qe-bank-label">Account Holder's Name</label>
                  <input className="qe-bank-input" placeholder="ex: Babu Lal"
                    value={bankForm.accountHolderName}
                    onChange={(e) => setBankForm(p => ({ ...p, accountHolderName: e.target.value }))} />
                </div>
                <div className="qe-bank-field">
                  <label className="qe-bank-label">UPI ID</label>
                  <input className="qe-bank-input" placeholder="ex: babulal@upi"
                    value={bankForm.upiId}
                    onChange={(e) => setBankForm(p => ({ ...p, upiId: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="qe-bank-footer">
              <button className="qe-btn-cancel" onClick={() => { setShowBankModal(false); setBankForm({ accountNumber:"", reEnterAccountNumber:"", ifscCode:"", bankBranchName:"", accountHolderName:"", upiId:"" }); }}>Cancel</button>
              <button
                className={`qe-bank-submit${!bankForm.accountNumber || !bankForm.reEnterAccountNumber ? " qe-bank-submit--disabled" : ""}`}
                disabled={!bankForm.accountNumber || !bankForm.reEnterAccountNumber}
                onClick={() => {
                  if (bankForm.accountNumber !== bankForm.reEnterAccountNumber) {
                    alert("Account numbers do not match"); return;
                  }
                  const newAcc = { id: Date.now(), ...bankForm };
                  const updated = [...savedBankAccounts, newAcc];
                  setSavedBankAccounts(updated);
                  localStorage.setItem("bankAccounts", JSON.stringify(updated));
                  setBankForm({ accountNumber:"", reEnterAccountNumber:"", ifscCode:"", bankBranchName:"", accountHolderName:"", upiId:"" });
                  setShowBankModal(false);
                  setShowSelectBankModal(true);
                }}
              >Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Select Bank Accounts Modal (Image 2 style) ───────────────── */}
      {showSelectBankModal && (
        <div className="qe-modal-overlay" onClick={() => setShowSelectBankModal(false)}>
          <div className="qe-bank-select-modal" onClick={(e) => e.stopPropagation()}>
            <div className="qe-bank-header">
              <h2 className="qe-bank-title">Select Bank Accounts</h2>
              <button className="qe-bank-close" onClick={() => setShowSelectBankModal(false)}>✕</button>
            </div>
            <div className="qe-bank-select-body">
              {savedBankAccounts.length === 0 ? (
                <div className="qe-bank-empty">No bank accounts saved yet.</div>
              ) : savedBankAccounts.map((acc: any) => (
                <div key={acc.id} className={`qe-bank-acc-row${selectedBankId === acc.id ? " qe-bank-acc-row--selected" : ""}`}
                  onClick={() => setSelectedBankId(acc.id)}>
                  <div className="qe-bank-acc-icon">
                    <svg viewBox="0 0 48 48" width="36" height="36">
                      <rect x="4" y="4" width="40" height="40" rx="6" fill="#fee2e2" />
                      <rect x="10" y="10" width="28" height="28" rx="4" fill="none" stroke="#dc2626" strokeWidth="3"/>
                      <rect x="18" y="18" width="12" height="12" rx="2" fill="#dc2626"/>
                    </svg>
                  </div>
                  <div className="qe-bank-acc-info">
                    <div className="qe-bank-acc-name">{acc.accountHolderName || acc.bankBranchName || "Account"}</div>
                    <div className="qe-bank-acc-num">ACC No: {acc.accountNumber}</div>
                  </div>
                  <div className="qe-bank-acc-right">
                    {acc.upiId && <div className="qe-bank-acc-upi">₹ {acc.upiId}</div>}
                    {acc.ifscCode && <div className="qe-bank-acc-ifsc">IFSC: {acc.ifscCode}</div>}
                  </div>
                  <div className={`qe-bank-radio${selectedBankId === acc.id ? " qe-bank-radio--on" : ""}`}>
                    {selectedBankId === acc.id && <div className="qe-bank-radio-dot" />}
                  </div>
                </div>
              ))}
            </div>
            <div className="qe-bank-select-footer">
              <button className="qe-bank-done-btn" onClick={() => setShowSelectBankModal(false)}>DONE</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Settings Modal ─────────────────────────────────────── */}
      {showColumnModal && (
        <ShowHideColumnsModal
          settings={settings}
          onSave={setSettings}
          onClose={() => setShowColumnModal(false)}
        />
      )}

      {showSettings && (
        <QuickSettingsModal
          settings={settings}
          onSave={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* ── Change Shipping Address Modal ────────────────────────────── */}
      {showChangeShipping && (
        <div className="qe-modal-overlay" onClick={() => setShowChangeShipping(false)}>
          <div className="qe-modal" onClick={(e) => e.stopPropagation()}>
            <div className="qe-modal-header">
              <h2 className="qe-modal-title">Change Shipping Address</h2>
              <button className="qe-modal-close" onClick={() => setShowChangeShipping(false)}>✕</button>
            </div>
            {/* List header */}
            <div className="qe-shipping-list-hdr">
              <span>Address</span>
              <span className="qe-shipping-list-actions-label">
                <span>Edit</span>
                <span>Select</span>
              </span>
            </div>
            {/* Address list */}
            <div className="qe-shipping-list">
              {shippingAddresses.map((addr) => (
                <div key={addr.id} className={`qe-shipping-item ${selectedShippingId === addr.id ? "qe-shipping-item--selected" : ""}`}>
                  <div className="qe-shipping-item-info">
                    <div className="qe-shipping-item-name">{addr.name}</div>
                    <div className="qe-shipping-item-addr">
                      {[addr.street, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
                    </div>
                  </div>
                  <div className="qe-shipping-item-actions">
                    <button className="qe-shipping-edit-btn" onClick={() => openEditShipping(addr)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:16,height:16}}>
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      className={`qe-shipping-radio ${selectedShippingId === addr.id ? "qe-shipping-radio--selected" : ""}`}
                      onClick={() => setSelectedShippingId(addr.id)}
                    >
                      {selectedShippingId === addr.id && <span className="qe-shipping-radio-dot" />}
                    </button>
                  </div>
                </div>
              ))}
              <button className="qe-shipping-add-new" onClick={openAddShipping}>
                + Add New Shipping Address
              </button>
            </div>
            <div className="qe-modal-actions">
              <button className="qe-btn-cancel" onClick={() => setShowChangeShipping(false)}>Cancel</button>
              <button className="qe-btn-save" onClick={() => setShowChangeShipping(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Shipping Address Modal ───────────────────────── */}
      {showAddShipping && (
        <div className="qe-modal-overlay" onClick={() => { setShowAddShipping(false); setShowChangeShipping(true); }}>
          <div className="qe-modal" onClick={(e) => e.stopPropagation()}>
            <div className="qe-modal-header">
              <h2 className="qe-modal-title">{editingAddress ? "Edit" : "Add"} Shipping Address</h2>
              <button className="qe-modal-close" onClick={() => { setShowAddShipping(false); setShowChangeShipping(true); }}>✕</button>
            </div>
            <div style={{padding:"20px",display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <label className="qe-shipping-field-label">Shipping Name <span style={{color:"#ef4444"}}>*</span></label>
                <input
                  className="qe-meta-input"
                  style={{width:"100%",marginTop:5,padding:"10px 12px",fontSize:13.5}}
                  autoFocus
                  value={shippingForm.name}
                  onChange={(e) => setShippingForm(f => ({...f, name: e.target.value}))}
                />
              </div>
              <div>
                <label className="qe-shipping-field-label">Street Address <span style={{color:"#ef4444"}}>*</span></label>
                <textarea
                  className="qe-meta-input"
                  style={{width:"100%",marginTop:5,padding:"10px 12px",fontSize:13.5,resize:"vertical",fontFamily:"inherit",boxSizing:"border-box"}}
                  placeholder="Enter Street Address"
                  rows={3}
                  value={shippingForm.street}
                  onChange={(e) => setShippingForm(f => ({...f, street: e.target.value}))}
                />
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <label className="qe-shipping-field-label">State</label>
                  <div className="qe-shipping-select-wrap" style={{marginTop:5}}>
                    <svg style={{width:13,height:13,color:"#9ca3af",marginLeft:10,flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <select
                      className="qe-shipping-select"
                      value={shippingForm.state}
                      onChange={(e) => setShippingForm(f => ({...f, state: e.target.value}))}
                    >
                      <option value="">Enter State</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <svg style={{width:13,height:13,color:"#9ca3af",marginRight:10,flexShrink:0,pointerEvents:"none"}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <label className="qe-shipping-field-label">Pincode</label>
                  <input
                    className="qe-meta-input"
                    style={{width:"100%",marginTop:5,padding:"10px 12px",fontSize:13.5}}
                    placeholder="Enter pin code"
                    maxLength={6}
                    value={shippingForm.pincode}
                    onChange={(e) => setShippingForm(f => ({...f, pincode: e.target.value}))}
                  />
                </div>
              </div>
              <div>
                <label className="qe-shipping-field-label">City</label>
                <input
                  className="qe-meta-input"
                  style={{width:"100%",marginTop:5,padding:"10px 12px",fontSize:13.5}}
                  placeholder="Enter City"
                  value={shippingForm.city}
                  onChange={(e) => setShippingForm(f => ({...f, city: e.target.value}))}
                />
              </div>
            </div>
            <div className="qe-modal-actions">
              <button className="qe-btn-cancel" onClick={() => { setShowAddShipping(false); setShowChangeShipping(true); }}>Cancel</button>
              <button
                className={`qe-btn-save ${(!shippingForm.name.trim() || !shippingForm.street.trim()) ? "qe-btn-save--disabled" : ""}`}
                onClick={handleSaveShipping}
                disabled={!shippingForm.name.trim() || !shippingForm.street.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function QuotationEstimate() {
  const [view, setView] = useState<AppView>({ screen: "list" });
  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const stored = getStoredQuotations();
    return mergeQuotations(INITIAL_QUOTATIONS, stored);
  });
  const [dateFilter, setDateFilter] = useState<DateFilterOption>("Last 365 Days");
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Show Open Quotation");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [viewQuotation, setViewQuotation] = useState<StoredQuotation | null>(null);
  const navigate = useNavigate();
  const [settings, setSettings] = useState<QuickSettings>({
    prefixEnabled: true,
    prefix: "",
    sequenceNumber: 5,
    showItemImage: true,
    priceHistory: true,
    showPricePerItem: true,
    showQuantity: true,
  });

  // Refresh list from localStorage whenever returning to list
  function refreshList() {
    const stored = getStoredQuotations();
    setQuotations(mergeQuotations(INITIAL_QUOTATIONS, stored));
  }

  function handleBack() {
    setView({ screen: "list" });
    refreshList();
  }

  function handleSaved() {
    setView({ screen: "list" });
    refreshList();
  }

  // ── Render Create/Edit screen ─────────────────────────────────────
  if (view.screen === "create" || view.screen === "edit" || view.screen === "duplicate") {
    return (
      <CreateQuotationPage
        editId={view.screen === "edit" ? view.id : undefined}
        duplicateSourceId={view.screen === "duplicate" ? view.sourceId : undefined}
        onBack={handleBack}
        onSaved={handleSaved}
      />
    );
  }

  // ── Filter logic ────────────────────────────────────────────────
  const filtered = quotations.filter((q) => {
    if (statusFilter === "Show Open Quotation" && q.status !== "Open") return false;
    if (statusFilter === "Show Closed Quotation" && q.status !== "Closed") return false;

    if (dateFilter === "Custom") {
      if (customDate) {
        const qDate = new Date(q.date); qDate.setHours(0,0,0,0);
        const sel = new Date(customDate); sel.setHours(0,0,0,0);
        if (qDate.toDateString() !== sel.toDateString()) return false;
      }
    } else {
      const { start, end } = getDateRange(dateFilter);
      const qDate = new Date(q.date);
      if (qDate < start || qDate > end) return false;
    }

    if (searchQuery) {
      const s = searchQuery.toLowerCase();
      if (!q.partyName.toLowerCase().includes(s) && !String(q.quotationNumber).includes(s) && !q.amount.toString().includes(s))
        return false;
    }
    return true;
  });

  // ── Handlers ─────────────────────────────────────────────────────
  function handleDelete(id: string) {
    deleteStoredQuotation(id);
    setQuotations((prev) => prev.filter((q) => q.id !== id));
    setDeleteTarget(null);
  }

  function handleDuplicate(q: Quotation) {
    // Navigate to duplicate screen — CreateQuotationPage will handle cloning
    setView({ screen: "duplicate", sourceId: q.id });
  }

  function handleEdit(id: string) {
    setView({ screen: "edit", id });
  }

  function handleEditHistory(id: string) {
    alert(`Edit history for quotation ${id}.`);
  }

  function handleCreateQuotation() {
    setView({ screen: "create" });
  }

  // ── Render list ───────────────────────────────────────────────────
  return (
    <div className="qe-page">
      {/* Header */}
      <div className="qe-header">
        <h1 className="qe-title">Quotation / Estimate</h1>
        <div className="qe-header-actions">
          <button className="qe-icon-btn" onClick={() => setShowSettings(true)} title="Settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span className="qe-notif-dot" />
          </button>
          <button className="qe-icon-btn" title="Send">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <polyline points="3 9 12 15 21 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="qe-toolbar">
        <div className="qe-toolbar-left">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <DateFilterDropdown value={dateFilter} onChange={setDateFilter} customDate={customDate} onCustomDate={setCustomDate} />
          <StatusFilterDropdown value={statusFilter} onChange={setStatusFilter} />
        </div>
        <button className="qe-btn-create" onClick={handleCreateQuotation}>
          Create Quotation
        </button>
      </div>

      {/* Table */}
      <div className="qe-table-wrap">
        <table className="qe-table">
          <thead>
            <tr>
              <th className="qe-th">
                Date
                <button className="qe-sort-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="8 9 12 5 16 9" /><polyline points="16 15 12 19 8 15" />
                  </svg>
                </button>
              </th>
              <th className="qe-th">Quotation Number</th>
              <th className="qe-th">Party Name</th>
              <th className="qe-th">Due In</th>
              <th className="qe-th">Amount</th>
              <th className="qe-th">Status</th>
              <th className="qe-th qe-th--actions" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="qe-empty">
                  <div className="qe-empty-inner">
                    <svg viewBox="0 0 80 80" fill="none" className="qe-empty-icon">
                      <rect x="10" y="15" width="60" height="50" rx="4" stroke="#d1d5db" strokeWidth="3" />
                      <line x1="20" y1="30" x2="60" y2="30" stroke="#d1d5db" strokeWidth="2" />
                      <line x1="20" y1="40" x2="45" y2="40" stroke="#d1d5db" strokeWidth="2" />
                      <line x1="20" y1="50" x2="50" y2="50" stroke="#d1d5db" strokeWidth="2" />
                      <line x1="55" y1="55" x2="70" y2="70" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                      <line x1="70" y1="55" x2="55" y2="70" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    <p className="qe-empty-text">No quotations found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((q) => (
                <tr key={q.id} className="qe-tr" onClick={() => {
                    const stored = getStoredQuotations().find(s => s.id === q.id);
                    if (stored) setViewQuotation(stored);
                  }}>
                  <td className="qe-td">{formatDate(q.date)}</td>
                  <td className="qe-td">{q.quotationNumber}</td>
                  <td className="qe-td">{q.partyName}</td>
                  <td className="qe-td">{q.dueIn ? formatDate(q.dueIn) : "–"}</td>
                  <td className="qe-td">{formatCurrency(q.amount)}</td>
                  <td className="qe-td">
                    <span className={`qe-status-badge qe-status-badge--${q.status.toLowerCase()}`}>{q.status}</span>
                  </td>
                  <td className="qe-td qe-td--actions" onClick={(e) => e.stopPropagation()}>
                    <RowActionMenu
                      onEdit={() => handleEdit(q.id)}
                      onEditHistory={() => handleEditHistory(q.id)}
                      onDuplicate={() => handleDuplicate(q)}
                      onDelete={() => setDeleteTarget(q.id)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showSettings && (
        <QuickSettingsModal settings={settings} onSave={setSettings} onClose={() => setShowSettings(false)} />
      )}
      {deleteTarget && (
        <DeleteConfirmModal onConfirm={() => handleDelete(deleteTarget)} onCancel={() => setDeleteTarget(null)} />
      )}

      {/* ── Quotation View Modal ─────────────────────────────────────── */}
      {viewQuotation && (
        <QuotationViewModal
          quotation={viewQuotation as any}
          onClose={() => setViewQuotation(null)}
          onEdit={() => {
            setViewQuotation(null);
            handleEdit(viewQuotation.id);
          }}
        />
      )}
    </div>
  );
}