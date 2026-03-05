import { useState, useRef, useEffect } from "react";
import { addDays, fmtDate } from "./Quotationtypes";
import "./QuotationMetaFields.css";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

interface CalendarPickerProps {
  value: string;
  onChange: (date: string) => void;
  onClose: () => void;
}

function CalendarPicker({ value, onChange, onClose }: CalendarPickerProps) {
  const selected = value ? new Date(value + "T00:00:00") : new Date();
  const [viewMonth, setViewMonth] = useState(selected.getMonth());
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  function daysInMonth(m: number, y: number) {
    return new Date(y, m + 1, 0).getDate();
  }
  function firstDayOfMonth(m: number, y: number) {
    return new Date(y, m, 1).getDay();
  }

  const totalDays = daysInMonth(viewMonth, viewYear);
  const startDay = firstDayOfMonth(viewMonth, viewYear);
  const cells: (number | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  function cellDateStr(day: number) {
    return `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  }

  return (
    <div ref={ref} className="qmf-cal-popup">
      <div className="qmf-cal-title">
        {value ? fmtDate(value) : "Select Date"}
      </div>
      <div className="qmf-cal-nav">
        <div className="qmf-cal-nav-group">
          <button className="qmf-cal-nav-btn" onClick={() => {
            if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
            else setViewMonth(m => m - 1);
          }}>‹</button>
          <span className="qmf-cal-month-label">{MONTHS[viewMonth]}</span>
          <button className="qmf-cal-nav-btn" onClick={() => {
            if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
            else setViewMonth(m => m + 1);
          }}>›</button>
        </div>
        <div className="qmf-cal-nav-group">
          <button className="qmf-cal-nav-btn" onClick={() => setViewYear(y => y - 1)}>‹</button>
          <span className="qmf-cal-month-label">{viewYear}</span>
          <button className="qmf-cal-nav-btn" onClick={() => setViewYear(y => y + 1)}>›</button>
        </div>
      </div>
      <div className="qmf-cal-grid">
        {DAYS_SHORT.map(d => (
          <div key={d} className="qmf-cal-day-header">{d}</div>
        ))}
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const ds = cellDateStr(day);
          const isSelected = ds === value;
          const isToday = ds === todayStr;
          return (
            <button
              key={idx}
              className={`qmf-cal-day${isSelected ? " qmf-cal-day--selected" : ""}${isToday && !isSelected ? " qmf-cal-day--today" : ""}`}
              onClick={() => { onChange(ds); onClose(); }}
            >
              {day}
            </button>
          );
        })}
      </div>
      <div className="qmf-cal-footer">
        <button className="qmf-cal-cancel" onClick={onClose}>CANCEL</button>
        <button className="qmf-cal-ok" onClick={() => { if (value) onClose(); }}>OK</button>
      </div>
    </div>
  );
}

interface QuotationMetaFieldsProps {
  quotationNo: number;
  quotationDate: string;
  showDueDate: boolean;
  validFor: number;
  validityDate: string;
  eWayBillNo: string;
  challanNo: string;
  financedBy: string;
  salesman: string;
  emailId: string;
  warrantyPeriod: string;
  onChange: (field: string, value: string | number | boolean) => void;
}

export default function QuotationMetaFields({
  quotationNo,
  quotationDate,
  showDueDate,
  validFor,
  validityDate,
  eWayBillNo,
  challanNo,
  financedBy,
  salesman,
  emailId,
  warrantyPeriod,
  onChange,
}: QuotationMetaFieldsProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showValidityPicker, setShowValidityPicker] = useState(false);

  function handleValidForChange(days: number) {
    onChange("validFor", days);
    onChange("validityDate", addDays(quotationDate, days));
  }

  return (
    <div className="qmf-wrap">
      {/* Row 1: Quotation No + Date */}
      <div className="qmf-row">
        <div className="qmf-field">
          <label className="qmf-label">Quotation No:</label>
          <input
            className="qmf-input qmf-input--no"
            type="number"
            value={quotationNo}
            onChange={(e) => onChange("quotationNo", Number(e.target.value))}
          />
        </div>
        <div className="qmf-field" style={{ position: "relative" }}>
          <label className="qmf-label">Quotation Date:</label>
          <div className="qmf-date-btn-wrap">
            <button
              className="qmf-date-btn"
              onClick={() => { setShowDatePicker(!showDatePicker); setShowValidityPicker(false); }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{fmtDate(quotationDate)}</span>
              <svg className="qmf-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {showDatePicker && (
              <CalendarPicker
                value={quotationDate}
                onChange={(d) => onChange("quotationDate", d)}
                onClose={() => setShowDatePicker(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Due Date / Validity Row */}
      {!showDueDate ? (
        <div className="qmf-duedate-add-row">
          <button
            className="qmf-duedate-btn"
            onClick={() => onChange("showDueDate", true)}
          >
            + Add Due Date
          </button>
        </div>
      ) : (
        <div className="qmf-duedate-box">
          <button
            className="qmf-duedate-close"
            onClick={() => onChange("showDueDate", false)}
          >
            ✕
          </button>
          <div className="qmf-duedate-fields">
            <div className="qmf-field">
              <label className="qmf-label">Valid For:</label>
              <div className="qmf-valid-row">
                <input
                  className="qmf-input qmf-input--small"
                  type="number"
                  value={validFor}
                  onChange={(e) => handleValidForChange(Number(e.target.value))}
                />
                <span className="qmf-unit">days</span>
              </div>
            </div>
            <div className="qmf-field" style={{ position: "relative" }}>
              <label className="qmf-label">Validity Date:</label>
              <div className="qmf-date-btn-wrap">
                <button
                  className="qmf-date-btn"
                  onClick={() => { setShowValidityPicker(!showValidityPicker); setShowDatePicker(false); }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{fmtDate(validityDate)}</span>
                  <svg className="qmf-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {showValidityPicker && (
                  <CalendarPicker
                    value={validityDate}
                    onChange={(d) => {
                      onChange("validityDate", d);
                      const diff = Math.round(
                        (new Date(d).getTime() - new Date(quotationDate).getTime()) / 86400000
                      );
                      onChange("validFor", diff > 0 ? diff : 0);
                    }}
                    onClose={() => setShowValidityPicker(false)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extra fields grid */}
      <div className="qmf-extras-grid">
        <div className="qmf-field">
          <label className="qmf-label">
            E-Way Bill No:
            <span className="qmf-info-icon" title="E-Way Bill number">ⓘ</span>
          </label>
          <input
            className="qmf-input"
            value={eWayBillNo}
            onChange={(e) => onChange("eWayBillNo", e.target.value)}
          />
        </div>
        <div className="qmf-field">
          <label className="qmf-label">Challan No.:</label>
          <input
            className="qmf-input"
            value={challanNo}
            onChange={(e) => onChange("challanNo", e.target.value)}
          />
        </div>
        <div className="qmf-field">
          <label className="qmf-label">Financed By:</label>
          <input
            className="qmf-input"
            value={financedBy}
            onChange={(e) => onChange("financedBy", e.target.value)}
          />
        </div>
        <div className="qmf-field">
          <label className="qmf-label">Salesman:</label>
          <input
            className="qmf-input"
            value={salesman}
            onChange={(e) => onChange("salesman", e.target.value)}
          />
        </div>
        <div className="qmf-field">
          <label className="qmf-label">Email ID:</label>
          <input
            className="qmf-input"
            value={emailId}
            onChange={(e) => onChange("emailId", e.target.value)}
          />
        </div>
        <div className="qmf-field">
          <label className="qmf-label">Warranty Period:</label>
          <input
            className="qmf-input"
            value={warrantyPeriod}
            onChange={(e) => onChange("warrantyPeriod", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}