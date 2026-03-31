import { useState, useRef, useEffect, useCallback } from "react";
import { addDays, fmtDate } from "./Quotationtypes";
import "./QuotationMetaFields.css";

interface InvoiceBuilderDet {
  industryType:           string;
  layout:                 string;
  showPO:                 boolean;
  showEwayBill:           boolean;
  ewayBillNo:             string;
  showVehicle:            boolean;
  vehicleNo:              string;
  showChallan:            boolean;
  challanNo:              string;
  showFinancedBy:         boolean;
  financedBy:             string;
  showSalesman:           boolean;
  salesman:               string;
  showWarranty:           boolean;
  warrantyPeriod:         string;
  showDispatchedThrough?: boolean;
  dispatchedThrough?:     string;
  showTransportName?:     boolean;
  transportName?:         string;
  showEmailId?:           boolean;
  customFields:           { label: string; value: string }[];
}

const DEFAULT_DET: InvoiceBuilderDet = {
  industryType:          "Electronics",
  layout:                "Advanced GST (Tally)",
  showPO:                false,
  showEwayBill:          false,
  ewayBillNo:            "",
  showVehicle:           false,
  vehicleNo:             "",
  showChallan:           false,
  challanNo:             "",
  showFinancedBy:        false,
  financedBy:            "",
  showSalesman:          false,
  salesman:              "",
  showWarranty:          false,
  warrantyPeriod:        "",
  showDispatchedThrough: false,
  dispatchedThrough:     "",
  showTransportName:     false,
  transportName:         "",
  showEmailId:           false,
  customFields:          [],
};

function loadBuilderDet(): InvoiceBuilderDet {
  try {
    const raw = localStorage.getItem("activeInvoiceTemplate");
    if (!raw) return DEFAULT_DET;
    const t = JSON.parse(raw);
    if (!t?.det) return DEFAULT_DET;
    return {
      ...DEFAULT_DET,
      ...t.det,
      customFields: Array.isArray(t.det.customFields) ? t.det.customFields : [],
    };
  } catch {
    return DEFAULT_DET;
  }
}

// ─────────────────────────────────────────────────────────────────────────────

const MONTHS     = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

interface CalendarPickerProps { value: string; onChange: (date: string) => void; onClose: () => void; }

function CalendarPicker({ value, onChange, onClose }: CalendarPickerProps) {
  const selected = value ? new Date(value + "T00:00:00") : new Date();
  const [viewMonth, setViewMonth] = useState(selected.getMonth());
  const [viewYear,  setViewYear]  = useState(selected.getFullYear());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startDay  = new Date(viewYear, viewMonth, 1).getDay();
  const cells: (number | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const today    = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  function ds(day: number) {
    return `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  }

  return (
    <div ref={ref} className="qmf-cal-popup">
      <div className="qmf-cal-title">{value ? fmtDate(value) : "Select Date"}</div>
      <div className="qmf-cal-nav">
        <div className="qmf-cal-nav-group">
          <button className="qmf-cal-nav-btn" onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); } else setViewMonth(m => m-1); }}>‹</button>
          <span className="qmf-cal-month-label">{MONTHS[viewMonth]}</span>
          <button className="qmf-cal-nav-btn" onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); } else setViewMonth(m => m+1); }}>›</button>
        </div>
        <div className="qmf-cal-nav-group">
          <button className="qmf-cal-nav-btn" onClick={() => setViewYear(y => y-1)}>‹</button>
          <span className="qmf-cal-month-label">{viewYear}</span>
          <button className="qmf-cal-nav-btn" onClick={() => setViewYear(y => y+1)}>›</button>
        </div>
      </div>
      <div className="qmf-cal-grid">
        {DAYS_SHORT.map(d => <div key={d} className="qmf-cal-day-header">{d}</div>)}
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const s = ds(day); const isSel = s === value; const isTod = s === todayStr;
          return (
            <button key={idx}
              className={`qmf-cal-day${isSel ? " qmf-cal-day--selected" : ""}${isTod && !isSel ? " qmf-cal-day--today" : ""}`}
              onClick={() => { onChange(s); onClose(); }}>
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

// ─────────────────────────────────────────────────────────────────────────────

interface QuotationMetaFieldsProps {
  quotationNo:        string;
  quotationDate:      string;
  showDueDate:        boolean;
  validFor:           number;
  validityDate:       string;
  eWayBillNo:         string;
  challanNo:          string;
  financedBy:         string;
  salesman:           string;
  emailId:            string;
  warrantyPeriod:     string;
  poNumber?:          string;
  vehicleNo?:         string;
  dispatchedThrough?: string;
  transportName?:     string;
  customFieldValues?: Record<string, string>;
  onChange: (field: string, value: string | number | boolean) => void;
}

export default function QuotationMetaFields({
  quotationNo, quotationDate, showDueDate, validFor, validityDate,
  eWayBillNo, challanNo, financedBy, salesman, emailId, warrantyPeriod,
  poNumber = "", vehicleNo = "", dispatchedThrough = "", transportName = "",
  customFieldValues = {},
  onChange,
}: QuotationMetaFieldsProps) {

  const [det, setDet] = useState<InvoiceBuilderDet>(loadBuilderDet);

  const syncDet = useCallback(() => {
    const next = loadBuilderDet();
    setDet(prev => (JSON.stringify(prev) !== JSON.stringify(next) ? next : prev));
  }, []);

  useEffect(() => {
    syncDet();
    const interval = setInterval(syncDet, 400);
    function onStorageEvent(e: StorageEvent) {
      if (e.key === "activeInvoiceTemplate") syncDet();
    }
    window.addEventListener("storage", onStorageEvent);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", onStorageEvent);
    };
  }, [syncDet]);

  // Seed default values for new custom fields that aren't yet in the form
  useEffect(() => {
    if (!det.customFields?.length) return;
    det.customFields.forEach(cf => {
      if (!cf.label?.trim()) return;
      if (customFieldValues[cf.label] !== undefined) return; // already set
      if (!cf.value) return; // no default to seed
      onChange(`customField_${cf.label}`, cf.value);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(det.customFields)]);

  const [showDatePicker,     setShowDatePicker]     = useState(false);
  const [showValidityPicker, setShowValidityPicker] = useState(false);

  function handleValidForChange(days: number) {
    onChange("validFor", days);
    onChange("validityDate", addDays(quotationDate, days));
  }

  // Standard optional fields driven by det toggles
  type StandardField = { key: string; label: string; val: string };
  const standardFields: StandardField[] = [
    { key: "eWayBillNo",        label: "E-Way Bill No.",     val: eWayBillNo        },
    { key: "challanNo",         label: "Challan No.",        val: challanNo         },
    { key: "financedBy",        label: "Financed By",        val: financedBy        },
    { key: "salesman",          label: "Salesman",           val: salesman          },
    { key: "warrantyPeriod",    label: "Warranty Period",    val: warrantyPeriod    },
    { key: "emailId",           label: "Email ID",           val: emailId           },
    { key: "poNumber",          label: "PO Number",          val: poNumber          },
    { key: "vehicleNo",         label: "Vehicle Number",     val: vehicleNo         },
    { key: "dispatchedThrough", label: "Dispatched Through", val: dispatchedThrough },
    { key: "transportName",     label: "Transport Name",     val: transportName     },
  ];

  const detShowMap: Record<string, boolean> = {
    eWayBillNo:        !!det.showEwayBill,
    challanNo:         !!det.showChallan,
    financedBy:        !!det.showFinancedBy,
    salesman:          !!det.showSalesman,
    warrantyPeriod:    !!det.showWarranty,
    emailId:           !!(det.showEmailId),
    poNumber:          !!det.showPO,
    vehicleNo:         !!(det.showVehicle),
    dispatchedThrough: !!(det.showDispatchedThrough),
    transportName:     !!(det.showTransportName),
  };

  const visibleStandard = standardFields.filter(f => detShowMap[f.key]);

  // Custom fields from Invoice Builder — always show ALL of them
  const visibleCustom = (det.customFields ?? []).filter(cf => cf.label?.trim() !== "");

  // Combine into a single flat list then chunk into rows of 4
  type Cell =
    | { kind: "standard"; key: string; label: string; val: string }
    | { kind: "custom";   label: string; defaultVal: string };

  const allCells: Cell[] = [
    ...visibleStandard.map(f => ({ kind: "standard" as const, key: f.key, label: f.label, val: f.val })),
    ...visibleCustom.map(cf => ({
      kind: "custom" as const,
      label: cf.label,
      defaultVal: cf.value ?? "",
    })),
  ];

  const rows: Cell[][] = [];
  for (let i = 0; i < allCells.length; i += 4) rows.push(allCells.slice(i, i + 4));

  return (
    <div className="qmf-wrap">

      {/* Row 1 — Quotation No + Date */}
      <div className="qmf-row">
        <div className="qmf-field">
          <label className="qmf-label">Quotation No:</label>
          <input className="qmf-input qmf-input--no" type="number" value={quotationNo}
            onChange={e => onChange("quotationNo", Number(e.target.value))} />
        </div>
        <div className="qmf-field" style={{ position: "relative" }}>
          <label className="qmf-label">Quotation Date:</label>
          <div className="qmf-date-btn-wrap">
            <button className="qmf-date-btn"
              onClick={() => { setShowDatePicker(!showDatePicker); setShowValidityPicker(false); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3"  y1="10" x2="21" y2="10"/>
              </svg>
              <span>{fmtDate(quotationDate)}</span>
              <svg className="qmf-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {showDatePicker && (
              <CalendarPicker value={quotationDate}
                onChange={d => onChange("quotationDate", d)}
                onClose={() => setShowDatePicker(false)} />
            )}
          </div>
        </div>
      </div>

      {/* Due Date / Validity */}
      {!showDueDate ? (
        <div className="qmf-duedate-add-row">
          <button className="qmf-duedate-btn" onClick={() => onChange("showDueDate", true)}>+ Add Due Date</button>
        </div>
      ) : (
        <div className="qmf-duedate-box">
          <button className="qmf-duedate-close" onClick={() => onChange("showDueDate", false)}>✕</button>
          <div className="qmf-duedate-fields">
            <div className="qmf-field">
              <label className="qmf-label">Valid For:</label>
              <div className="qmf-valid-row">
                <input className="qmf-input qmf-input--small" type="number" value={validFor}
                  onChange={e => handleValidForChange(Number(e.target.value))} />
                <span className="qmf-unit">days</span>
              </div>
            </div>
            <div className="qmf-field" style={{ position: "relative" }}>
              <label className="qmf-label">Validity Date:</label>
              <div className="qmf-date-btn-wrap">
                <button className="qmf-date-btn"
                  onClick={() => { setShowValidityPicker(!showValidityPicker); setShowDatePicker(false); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3"  y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>{fmtDate(validityDate)}</span>
                  <svg className="qmf-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {showValidityPicker && (
                  <CalendarPicker value={validityDate}
                    onChange={d => {
                      onChange("validityDate", d);
                      const diff = Math.round((new Date(d).getTime() - new Date(quotationDate).getTime()) / 86400000);
                      onChange("validFor", diff > 0 ? diff : 0);
                    }}
                    onClose={() => setShowValidityPicker(false)} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic extras grid — standard toggles + ALL custom fields */}
      {rows.map((row, ri) => (
        <div key={ri} className="qmf-extras-grid">
          {row.map(cell =>
            cell.kind === "standard" ? (
              <div key={cell.key} className="qmf-field">
                <label className="qmf-label">{cell.label}:</label>
                <input
                  className="qmf-input"
                  value={cell.val}
                  onChange={e => onChange(cell.key, e.target.value)}
                />
              </div>
            ) : (
              /* Custom field — fully controlled via customFieldValues prop */
              <div key={`custom_${cell.label}`} className="qmf-field">
                <label className="qmf-label">{cell.label}:</label>
                <input
                  className="qmf-input"
                  placeholder={cell.defaultVal ? `Default: ${cell.defaultVal}` : `Enter ${cell.label}`}
                  value={
                    customFieldValues[cell.label] !== undefined
                      ? customFieldValues[cell.label]
                      : cell.defaultVal
                  }
                  onChange={e => onChange(`customField_${cell.label}`, e.target.value)}
                />
              </div>
            )
          )}
          {/* Pad incomplete rows */}
          {Array.from({ length: (4 - row.length) % 4 }).map((_, i) => (
            <div key={`pad-${ri}-${i}`} className="qmf-field" />
          ))}
        </div>
      ))}

    </div>
  );
}