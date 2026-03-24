import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Salesreturn.css";

// ─── Types ───────────────────────────────────────────────────────────────────
interface SalesReturnRecord {
  id: string;
  date: string;
  salesReturnNumber: number;
  partyName: string;
  invoiceNo: number;
  amount: number;
  status: "Unpaid" | "Paid";
}

type DatePreset =
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

interface DateRange {
  start: Date | null;
  end: Date | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtShort = (d: Date) =>
  `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString("en-IN", { month: "short" })} ${d.getFullYear()}`;

function getPresetRange(preset: DatePreset): DateRange {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const t = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d;
  };
  switch (preset) {
    case "Today": return { start: today, end: today };
    case "Yesterday": return { start: t(-1), end: t(-1) };
    case "This Week": {
      const day = today.getDay();
      return { start: t(-day), end: t(6 - day) };
    }
    case "Last Week": {
      const day = today.getDay();
      return { start: t(-day - 7), end: t(-day - 1) };
    }
    case "Last 7 Days": return { start: t(-6), end: today };
    case "This Month": {
      const s = new Date(today.getFullYear(), today.getMonth(), 1);
      const e = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { start: s, end: e };
    }
    case "Previous Month": {
      const s = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const e = new Date(today.getFullYear(), today.getMonth(), 0);
      return { start: s, end: e };
    }
    case "Last 30 Days": return { start: t(-29), end: today };
    case "This Quarter": {
      const q = Math.floor(today.getMonth() / 3);
      return {
        start: new Date(today.getFullYear(), q * 3, 1),
        end: new Date(today.getFullYear(), q * 3 + 3, 0),
      };
    }
    case "Previous Quarter": {
      const q = Math.floor(today.getMonth() / 3);
      return {
        start: new Date(today.getFullYear(), (q - 1) * 3, 1),
        end: new Date(today.getFullYear(), q * 3, 0),
      };
    }
    case "Current Fiscal Year": {
      const fy = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
      return { start: new Date(fy, 3, 1), end: new Date(fy + 1, 2, 31) };
    }
    case "Previous Fiscal Year": {
      const fy = (today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1) - 1;
      return { start: new Date(fy, 3, 1), end: new Date(fy + 1, 2, 31) };
    }
    case "Last 365 Days": return { start: t(-364), end: today };
    default: return { start: null, end: null };
  }
}

const PRESETS: DatePreset[] = [
  "Today", "Yesterday", "This Week", "Last Week", "Last 7 Days",
  "This Month", "Previous Month", "Last 30 Days", "This Quarter",
  "Previous Quarter", "Current Fiscal Year", "Previous Fiscal Year",
  "Last 365 Days", "Custom",
];

const PRESETS_WITH_DATE: DatePreset[] = [
  "This Quarter", "Previous Quarter", "Current Fiscal Year",
  "Previous Fiscal Year", "Last 365 Days",
];

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ─── Load from localStorage ───────────────────────────────────────────────────
const FALLBACK_DATA: SalesReturnRecord[] = [
  { id: "1", date: "03 Mar 2026", salesReturnNumber: 2, partyName: "Ramakant Pandit", invoiceNo: 21, amount: 45000, status: "Unpaid" },
  { id: "2", date: "03 Mar 2026", salesReturnNumber: 1, partyName: "Ramakant Pandit", invoiceNo: 22, amount: 21000, status: "Unpaid" },
];

function loadFromStorage(): SalesReturnRecord[] {
  try {
    const raw = localStorage.getItem("salesReturns");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((r: any) => ({
          id: String(r.id ?? Date.now()),
          date: r.salesReturnDate
            ? new Date(r.salesReturnDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : r.date ?? "—",
          salesReturnNumber: r.salesReturnNo ?? r.salesReturnNumber ?? 0,
          partyName: r.party?.name ?? r.partyName ?? "—",
          invoiceNo: r.linkedInvoiceId ?? r.invoiceNo ?? 0,
          amount: r.amountPaid ?? r.amount ?? 0,
          status: r.status ?? "Unpaid",
        }));
      }
    }
  } catch {}
  // No real data in localStorage — seed it with fallback so viewmodel can find records
  const seeded = [
    {
      id: "1",
      salesReturnNo: 2,
      salesReturnDate: "2026-03-03",
      party: { id: 1, name: "Ramakant Pandit", category: "-", mobile: "-", type: "Customer", balance: 0 },
      shipFrom: null,
      linkedInvoiceId: "21",
      billItems: [],
      additionalCharges: [],
      discountType: "after-tax",
      discountPct: 0,
      discountAmt: 0,
      autoRoundOff: false,
      roundOffAmt: 0,
      amountPaid: 45000,
      paymentMethod: "Cash",
      markFullyPaid: false,
      notes: "",
      termsConditions: "",
      eWayBillNo: "",
      challanNo: "",
      financedBy: "",
      salesman: "",
      emailId: "",
      warrantyPeriod: "",
      status: "Unpaid",
    },
    {
      id: "2",
      salesReturnNo: 1,
      salesReturnDate: "2026-03-03",
      party: { id: 1, name: "Ramakant Pandit", category: "-", mobile: "-", type: "Customer", balance: 0 },
      shipFrom: null,
      linkedInvoiceId: "22",
      billItems: [],
      additionalCharges: [],
      discountType: "after-tax",
      discountPct: 0,
      discountAmt: 0,
      autoRoundOff: false,
      roundOffAmt: 0,
      amountPaid: 21000,
      paymentMethod: "Cash",
      markFullyPaid: false,
      notes: "",
      termsConditions: "",
      eWayBillNo: "",
      challanNo: "",
      financedBy: "",
      salesman: "",
      emailId: "",
      warrantyPeriod: "",
      status: "Unpaid",
    },
  ];
  try {
    localStorage.setItem("salesReturns", JSON.stringify(seeded));
  } catch {}
  return FALLBACK_DATA;
}

// ─── Icons ───────────────────────────────────────────────────────────────────
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const IconChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IconUpDown = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="12 4 12 8"/><polyline points="12 16 12 20"/>
    <polyline points="8 8 12 4 16 8"/><polyline points="8 16 12 20 16 16"/>
  </svg>
);
const IconDotsVertical = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/>
  </svg>
);
const IconSettings = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const IconTable = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/>
  </svg>
);
const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconHistory = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
  </svg>
);
const IconCopy = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const IconDelete = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ─── Mini Calendar ────────────────────────────────────────────────────────────
interface MiniCalProps {
  label: string;
  selectedDate: Date | null;
  onSelect: (d: Date) => void;
  viewMonth: number;
  viewYear: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onPrevYear: () => void;
  onNextYear: () => void;
  rangeStart: Date | null;
  rangeEnd: Date | null;
}

const MiniCal = ({
  label, selectedDate, onSelect,
  viewMonth, viewYear, onPrevMonth, onNextMonth,
  onPrevYear, onNextYear,
  rangeStart, rangeEnd,
}: MiniCalProps) => {
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { day: number; type: "prev" | "curr" | "next" }[] = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: prevMonthDays - i, type: "prev" });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, type: "curr" });
  while (cells.length % 7 !== 0)
    cells.push({ day: cells.length - firstDay - daysInMonth + 1, type: "next" });

  const isSelected = (d: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === d &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getFullYear() === viewYear
    );
  };
  const isInRange = (d: number) => {
    if (!rangeStart || !rangeEnd) return false;
    const curr = new Date(viewYear, viewMonth, d);
    return curr > rangeStart && curr < rangeEnd;
  };
  const isRangeStart = (d: number) => {
    if (!rangeStart) return false;
    return (
      rangeStart.getDate() === d &&
      rangeStart.getMonth() === viewMonth &&
      rangeStart.getFullYear() === viewYear
    );
  };
  const isRangeEnd = (d: number) => {
    if (!rangeEnd) return false;
    return (
      rangeEnd.getDate() === d &&
      rangeEnd.getMonth() === viewMonth &&
      rangeEnd.getFullYear() === viewYear
    );
  };

  return (
    <div className="sr-mini-cal">
      <div className="sr-mini-cal-label">{label}</div>
      <div className="sr-mini-cal-nav-row">
        <div className="sr-mini-cal-nav-group">
          <button className="sr-mini-cal-nav-btn" onClick={onPrevMonth}><IconChevronLeft /></button>
          <span className="sr-mini-cal-nav-text">{MONTH_NAMES[viewMonth]}</span>
          <button className="sr-mini-cal-nav-btn" onClick={onNextMonth}><IconChevronRight /></button>
        </div>
        <div className="sr-mini-cal-nav-group">
          <button className="sr-mini-cal-nav-btn" onClick={onPrevYear}><IconChevronLeft /></button>
          <span className="sr-mini-cal-nav-text">{viewYear}</span>
          <button className="sr-mini-cal-nav-btn" onClick={onNextYear}><IconChevronRight /></button>
        </div>
      </div>
      <div className="sr-mini-cal-weekdays">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={d} className="sr-mini-cal-weekday">{d}</div>
        ))}
      </div>
      <div className="sr-mini-cal-grid">
        {cells.map((cell, i) => {
          const sel = cell.type === "curr" && isSelected(cell.day);
          const inRange = cell.type === "curr" && isInRange(cell.day);
          const rStart = cell.type === "curr" && isRangeStart(cell.day);
          const rEnd = cell.type === "curr" && isRangeEnd(cell.day);
          return (
            <button
              key={i}
              className={[
                "sr-mini-cal-day",
                cell.type !== "curr" ? "sr-mini-cal-day--other" : "",
                sel ? "sr-mini-cal-day--selected" : "",
                inRange ? "sr-mini-cal-day--in-range" : "",
                rStart ? "sr-mini-cal-day--range-start" : "",
                rEnd ? "sr-mini-cal-day--range-end" : "",
              ].join(" ")}
              onClick={() => {
                if (cell.type === "curr")
                  onSelect(new Date(viewYear, viewMonth, cell.day));
              }}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Date Dropdown ────────────────────────────────────────────────────────────
interface DateDropdownProps {
  selected: DatePreset;
  onChange: (p: DatePreset, range?: DateRange) => void;
}

const DateDropdown = ({ selected, onChange }: DateDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [customStep, setCustomStep] = useState<"start" | "end">("start");
  const [customStart, setCustomStart] = useState<Date | null>(null);
  const [customEnd, setCustomEnd] = useState<Date | null>(null);
  const [showCustom, setShowCustom] = useState(false);

  const today = new Date();
  const [startViewMonth, setStartViewMonth] = useState(today.getMonth());
  const [startViewYear, setStartViewYear] = useState(today.getFullYear());

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowCustom(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handlePreset = (p: DatePreset) => {
    if (p === "Custom") {
      setShowCustom(true);
      setCustomStart(null);
      setCustomEnd(null);
      setCustomStep("start");
    } else {
      onChange(p);
      setOpen(false);
    }
  };

  const handleDaySelect = (d: Date) => {
    if (customStep === "start") {
      setCustomStart(d);
      setCustomStep("end");
    } else {
      if (customStart && d < customStart) {
        setCustomEnd(customStart);
        setCustomStart(d);
      } else {
        setCustomEnd(d);
      }
    }
  };

  const handleCustomOk = () => {
    if (customStart && customEnd) {
      onChange("Custom", { start: customStart, end: customEnd });
      setOpen(false);
      setShowCustom(false);
    }
  };

  const handleCustomCancel = () => {
    setShowCustom(false);
  };

  const displayLabel = () => {
    if (selected === "Custom") return "Custom";
    return selected;
  };

  const getPresetDate = (p: DatePreset) => {
    if (!PRESETS_WITH_DATE.includes(p)) return null;
    const r = getPresetRange(p);
    if (!r.start || !r.end) return null;
    return `${fmtShort(r.start)} - ${fmtShort(r.end)}`;
  };

  return (
    <div className="sr-date-dropdown" ref={ref}>
      <button
        className={`sr-date-btn${open ? " sr-date-btn--open" : ""}`}
        onClick={() => setOpen(o => !o)}
      >
        <IconCalendar />
        <span>{displayLabel()}</span>
        <IconChevronDown />
      </button>

      {open && !showCustom && (
        <div className="sr-date-menu">
          {PRESETS.map(p => {
            const dateStr = getPresetDate(p);
            return (
              <button
                key={p}
                className={`sr-date-menu-item${selected === p ? " sr-date-menu-item--active" : ""}`}
                onClick={() => handlePreset(p)}
              >
                <span className="sr-date-menu-item-label">{p}</span>
                {dateStr && <span className="sr-date-menu-item-range">{dateStr}</span>}
              </button>
            );
          })}
        </div>
      )}

      {open && showCustom && (
        <div className="sr-custom-picker">
          <MiniCal
            label="Select Start Date"
            selectedDate={customStart}
            onSelect={handleDaySelect}
            viewMonth={startViewMonth}
            viewYear={startViewYear}
            onPrevMonth={() => {
              if (startViewMonth === 0) { setStartViewMonth(11); setStartViewYear(y => y - 1); }
              else setStartViewMonth(m => m - 1);
            }}
            onNextMonth={() => {
              if (startViewMonth === 11) { setStartViewMonth(0); setStartViewYear(y => y + 1); }
              else setStartViewMonth(m => m + 1);
            }}
            onPrevYear={() => setStartViewYear(y => y - 1)}
            onNextYear={() => setStartViewYear(y => y + 1)}
            rangeStart={customStart}
            rangeEnd={customEnd}
          />
          <div className="sr-custom-picker-divider" />
          <div className="sr-custom-picker-actions">
            <button className="sr-custom-picker-cancel" onClick={handleCustomCancel}>CANCEL</button>
            <button
              className={`sr-custom-picker-ok${customStart && customEnd ? "" : " sr-custom-picker-ok--disabled"}`}
              onClick={handleCustomOk}
            >OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Settings Modal ───────────────────────────────────────────────────────────
interface SettingsModalProps {
  onClose: () => void;
  nextSeqNumber: number;
  onSave: (prefix: string, seq: number, showImage: boolean) => void;
  initPrefix: string;
  initShowImage: boolean;
}

const SettingsModal = ({ onClose, nextSeqNumber, onSave, initPrefix, initShowImage }: SettingsModalProps) => {
  const [prefixEnabled, setPrefixEnabled] = useState(true);
  const [prefix, setPrefix] = useState(initPrefix);
  const [seqNum, setSeqNum] = useState(nextSeqNumber);
  const [showImage, setShowImage] = useState(initShowImage);

  const salesReturnNumber = prefix ? `${prefix}${seqNum}` : `${seqNum}`;

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
              <button
                className={`sr-toggle${prefixEnabled ? " sr-toggle--on" : ""}`}
                onClick={() => setPrefixEnabled(v => !v)}
              >
                <span className="sr-toggle-knob" />
              </button>
            </div>
            {prefixEnabled && (
              <div className="sr-modal-fields">
                <div className="sr-modal-field">
                  <label className="sr-modal-field-label">Prefix</label>
                  <input
                    className="sr-modal-input"
                    placeholder="Prefix"
                    value={prefix}
                    onChange={e => setPrefix(e.target.value)}
                  />
                </div>
                <div className="sr-modal-field">
                  <label className="sr-modal-field-label">Sequence Number</label>
                  <input
                    className="sr-modal-input"
                    type="number"
                    value={seqNum}
                    onChange={e => setSeqNum(Number(e.target.value))}
                    min={1}
                  />
                </div>
                <div className="sr-modal-sr-preview">
                  Sales Return Number: {salesReturnNumber}
                </div>
              </div>
            )}
          </div>

          <div className="sr-modal-section">
            <div className="sr-modal-section-header">
              <div>
                <div className="sr-modal-section-title">Show Item Image on Invoice</div>
                <div className="sr-modal-section-desc">This will apply to all vouchers except for Payment In and Payment Out</div>
              </div>
              <button
                className={`sr-toggle${showImage ? " sr-toggle--on" : ""}`}
                onClick={() => setShowImage(v => !v)}
              >
                <span className="sr-toggle-knob" />
              </button>
            </div>
          </div>
        </div>
        <div className="sr-modal-footer">
          <button className="sr-modal-btn-cancel" onClick={onClose}>Cancel</button>
          <button
            className="sr-modal-btn-save"
            onClick={() => { onSave(prefix, seqNum, showImage); onClose(); }}
          >Save</button>
        </div>
      </div>
    </div>
  );
};

// ─── Row Action Menu ──────────────────────────────────────────────────────────
interface RowMenuProps {
  onEdit: (e: React.MouseEvent) => void;
  onEditHistory: (e: React.MouseEvent) => void;
  onDuplicate: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onClose: () => void;
}

const RowMenu = ({ onEdit, onEditHistory, onDuplicate, onDelete, onClose }: RowMenuProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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

  const [data, setData] = useState<SalesReturnRecord[]>(loadFromStorage);
  const [selectedPreset, setSelectedPreset] = useState<DatePreset>("Last 365 Days");
  const [customRange, setCustomRange] = useState<DateRange>({ start: null, end: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [sortAmountDir, setSortAmountDir] = useState<"asc" | "desc">("desc");
  const [prefix, setPrefix] = useState("");
  const [showImage, setShowImage] = useState(true);
  const [showSearchTooltip, setShowSearchTooltip] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Reload from localStorage whenever the page gains focus
  // (e.g. user comes back from the Create form)
  useEffect(() => {
    const handleFocus = () => setData(loadFromStorage());
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const nextSeq = data.length > 0 ? Math.max(...data.map(d => d.salesReturnNumber)) + 1 : 1;

  const handleDateChange = (p: DatePreset, range?: DateRange) => {
    setSelectedPreset(p);
    if (p === "Custom" && range) setCustomRange(range);
  };

  const filterByDate = (record: SalesReturnRecord) => {
    const range: DateRange =
      selectedPreset === "Custom" ? customRange : getPresetRange(selectedPreset);
    if (!range.start || !range.end) return true;
    const parts = record.date.split(" ");
    const rDate = new Date(`${parts[1]} ${parts[0]}, ${parts[2]}`);
    return rDate >= range.start && rDate <= range.end;
  };

  const filtered = data
    .filter(filterByDate)
    .filter(r => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.partyName.toLowerCase().includes(q) ||
        r.invoiceNo.toString().includes(q) ||
        r.salesReturnNumber.toString().includes(q)
      );
    });

  const handleDelete = (id: string) => {
    const updated = data.filter(r => r.id !== id);
    setData(updated);
    try {
      const raw = localStorage.getItem("salesReturns");
      if (raw) {
        const all = JSON.parse(raw);
        const filteredAll = all.filter((r: any) => String(r.id) !== String(id));
        localStorage.setItem("salesReturns", JSON.stringify(filteredAll));
      }
    } catch {}
    setOpenMenuId(null);
    setDeleteId(null);
  };

  const handleDuplicate = (id: string) => {
    try {
      const raw = localStorage.getItem("salesReturns");
      if (raw) {
        const all = JSON.parse(raw);
        const found = all.find((r: any) => String(r.id) === String(id));
        if (found) {
          const dup = {
            ...found,
            id: `sr-dup-${Date.now()}`,
            salesReturnNo: nextSeq,
            salesReturnDate: new Date().toISOString().split("T")[0],
            status: "Unpaid",
            amountPaid: 0,
            markFullyPaid: false,
          };
          localStorage.setItem("sr-duplicate-draft", JSON.stringify(dup));
          setOpenMenuId(null);
          navigate("/cashier/sales-return-create?mode=duplicate");
          return;
        }
      }
    } catch {}
    setOpenMenuId(null);
  };

  const handleSortDate = () => {
    const dir = sortDir === "asc" ? "desc" : "asc";
    setSortDir(dir);
    setData(prev => [...prev].sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return dir === "asc" ? da - db : db - da;
    }));
  };

  const handleSortAmount = () => {
    const dir = sortAmountDir === "asc" ? "desc" : "asc";
    setSortAmountDir(dir);
    setData(prev => [...prev].sort((a, b) =>
      dir === "asc" ? a.amount - b.amount : b.amount - a.amount
    ));
  };

  return (
    <div className="sr-page">
      {/* Header */}
      <div className="sr-header">
        <h1 className="sr-title">Sales Return</h1>
        <div className="sr-header-actions">
          <button className="sr-icon-btn" onClick={() => setShowSettings(true)}>
            <IconSettings />
          </button>
          <button className="sr-icon-btn">
            <IconTable />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="sr-toolbar">
        <div className="sr-toolbar-left">
          {/* Search */}
          <div className="sr-search-wrapper">
            <div className="sr-search-box">
              <span className="sr-search-icon"><IconSearch /></span>
              <input
                className="sr-search-input"
                placeholder="Search Sales Return"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchTooltip(true)}
                onBlur={() => setTimeout(() => setShowSearchTooltip(false), 200)}
              />
              <div className="sr-search-filter-select">
                <span>Invoice No. &amp; Pa...</span>
                <IconChevronDown />
              </div>
            </div>
            {showSearchTooltip && (
              <div className="sr-search-tooltip">
                Search by Invoice No. &amp; Party name or Mobile Number
              </div>
            )}
          </div>

          {/* Date Filter */}
          <DateDropdown selected={selectedPreset} onChange={handleDateChange} />
        </div>

        {/* ── Create button now navigates to the form ── */}
        <button
          className="sr-create-btn"
          onClick={() => navigate("/cashier/sales-return-create")}
        >
          Create Sales Return
        </button>
      </div>

      {/* Table */}
      <div className="sr-table-wrapper">
        <table className="sr-table">
          <thead>
            <tr>
              <th className="sr-th sr-th--date" onClick={handleSortDate}>
                <span>Date</span>
                <span className="sr-th-sort"><IconUpDown /></span>
              </th>
              <th className="sr-th">Sales Return Number</th>
              <th className="sr-th">Party Name</th>
              <th className="sr-th">Invoice No</th>
              <th className="sr-th sr-th--amount" onClick={handleSortAmount}>
                <span>Amount</span>
                <span className="sr-th-sort"><IconUpDown /></span>
              </th>
              <th className="sr-th">Status</th>
              <th className="sr-th sr-th--action" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="sr-empty">No records found</td>
              </tr>
            ) : (
              filtered.map((row, idx) => (
                <tr key={row.id} className={`sr-tr sr-tr--clickable${idx % 2 === 1 ? " sr-tr--alt" : ""}`} onClick={() => navigate(`/cashier/sales-return-view/${row.id}`)}>
                  <td className="sr-td">{row.date}</td>
                  <td className="sr-td">{row.salesReturnNumber}</td>
                  <td className="sr-td">{row.partyName}</td>
                  <td className="sr-td">{row.invoiceNo}</td>
                  <td className="sr-td">₹ {row.amount.toLocaleString("en-IN")}</td>
                  <td className="sr-td">
                    <span className={`sr-status sr-status--${row.status.toLowerCase()}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="sr-td sr-td--action">
                    <div className="sr-action-cell">
                      <button
                        className="sr-dots-btn"
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === row.id ? null : row.id); }}
                      >
                        <IconDotsVertical />
                      </button>
                      {openMenuId === row.id && (
                        <RowMenu
                          onEdit={(e) => {
                            e.stopPropagation();
                            navigate(`/cashier/sales-return-edit/${row.id}`);
                            setOpenMenuId(null);
                          }}
                          onEditHistory={(e) => { e.stopPropagation(); setOpenMenuId(null); }}
                          onDuplicate={(e) => { e.stopPropagation(); handleDuplicate(row.id); }}
                          onDelete={(e) => { e.stopPropagation(); setDeleteId(row.id); setOpenMenuId(null); }}
                          onClose={() => setOpenMenuId(null)}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="sr-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="sr-delete-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="sr-delete-confirm-title">Are you sure you want to delete this Sales Return?</div>
            <div className="sr-delete-confirm-sub">Once deleted, it cannot be recovered</div>
            <div className="sr-delete-confirm-btns">
              <button className="sr-delete-cancel-btn" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="sr-delete-ok-btn" onClick={() => handleDelete(deleteId)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          nextSeqNumber={nextSeq}
          onSave={(p, seq, img) => { setPrefix(p); setShowImage(img); }}
          initPrefix={prefix}
          initShowImage={showImage}
        />
      )}
    </div>
  );
}