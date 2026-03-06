import { useState, useRef, useEffect } from "react";
import { fmtDisplayDate } from "./Deliverychallantype";
import "./Createdeliverychallan.css";

// ─── Date Picker ──────────────────────────────────────────────────────────────
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [vm, setVm] = useState(() => new Date(value || new Date()).getMonth());
  const [vy, setVy] = useState(() => new Date(value || new Date()).getFullYear());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const dim = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const fdo = (m: number, y: number) => new Date(y, m, 1).getDay();
  const cells: (number | null)[] = [...Array(fdo(vm, vy)).fill(null), ...Array.from({ length: dim(vm, vy) }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const ds = (d: number) => `${vy}-${String(vm + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const isSelected = (d: number) => ds(d) === value;
  const isToday = (d: number) => ds(d) === new Date().toISOString().split("T")[0];

  const displayVal = value ? (() => {
    const d = new Date(value);
    return `${String(d.getDate()).padStart(2,"0")} ${MONTHS[d.getMonth()].slice(0,3)} ${d.getFullYear()}`;
  })() : "Select date";

  return (
    <div ref={ref} className="dc-datepick-wrap">
      <button className="dc-date-btn" onClick={() => setOpen(!open)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span>{displayVal}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div className="dc-cal-popup">
          <div className="dc-cal-selected-display">{value ? fmtDisplayDate(value) : "—"}</div>
          <div className="dc-cal-nav">
            <div className="dc-cal-nav-group">
              <button onClick={() => { if (vm === 0) { setVm(11); setVy(y => y - 1); } else setVm(m => m - 1); }}>‹</button>
              <span>{MONTHS[vm]}</span>
              <button onClick={() => { if (vm === 11) { setVm(0); setVy(y => y + 1); } else setVm(m => m + 1); }}>›</button>
            </div>
            <div className="dc-cal-nav-group">
              <button onClick={() => setVy(y => y - 1)}>‹</button>
              <span>{vy}</span>
              <button onClick={() => setVy(y => y + 1)}>›</button>
            </div>
          </div>
          <div className="dc-cal-grid">
            {DAYS.map(d => <div key={d} className="dc-cal-dh">{d}</div>)}
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              return (
                <button
                  key={i}
                  className={`dc-cal-day${isSelected(day) ? " dc-cal-day--sel" : ""}${isToday(day) && !isSelected(day) ? " dc-cal-day--today" : ""}`}
                  onClick={() => { onChange(ds(day)); setOpen(false); }}
                >{day}</button>
              );
            })}
          </div>
          <div className="dc-cal-footer">
            <button className="dc-cal-cancel" onClick={() => setOpen(false)}>CANCEL</button>
            <button className="dc-cal-ok" onClick={() => setOpen(false)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Meta Fields ──────────────────────────────────────────────────────────────
interface MetaFieldsProps {
  challanNo: number;
  challanDate: string;
  prefix: string;
  eWayBillNo: string;
  challanNoField: string;
  financedBy: string;
  salesman: string;
  emailId: string;
  warrantyPeriod: string;
  onChange: (field: string, value: any) => void;
}

export default function DCMetaFields({
  challanNo, challanDate, prefix,
  eWayBillNo, challanNoField, financedBy,
  salesman, emailId, warrantyPeriod, onChange,
}: MetaFieldsProps) {
  const [editNo, setEditNo] = useState(false);
  const [tempNo, setTempNo] = useState(String(challanNo));

  useEffect(() => { setTempNo(String(challanNo)); }, [challanNo]);

  return (
    <div className="dc-meta-panel">
      {/* Challan No + Date */}
      <div className="dc-meta-row">
        <div className="dc-meta-field">
          <label className="dc-meta-label">Challan No:</label>
          {editNo ? (
            <input
              autoFocus
              className="dc-meta-input"
              value={tempNo}
              onChange={e => setTempNo(e.target.value)}
              onBlur={() => { onChange("challanNo", Number(tempNo) || challanNo); setEditNo(false); }}
              onKeyDown={e => { if (e.key === "Enter") { onChange("challanNo", Number(tempNo) || challanNo); setEditNo(false); } }}
            />
          ) : (
            <div className="dc-meta-value-box" onClick={() => { setTempNo(String(challanNo)); setEditNo(true); }}>
              {prefix}{challanNo}
            </div>
          )}
        </div>
        <div className="dc-meta-field">
          <label className="dc-meta-label">Challan Date:</label>
          <DatePicker value={challanDate} onChange={v => onChange("challanDate", v)} />
        </div>
      </div>

      {/* Extra fields grid */}
      <div className="dc-meta-extras">
        <div className="dc-meta-extra-field">
          <label>
            E-Way Bill No:
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft:3,verticalAlign:"middle"}}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          </label>
          <input className="dc-meta-extra-input" value={eWayBillNo} onChange={e => onChange("eWayBillNo", e.target.value)} />
        </div>
        <div className="dc-meta-extra-field">
          <label>Challan No.:</label>
          <input className="dc-meta-extra-input" value={challanNoField} onChange={e => onChange("challanNoField", e.target.value)} />
        </div>
        <div className="dc-meta-extra-field">
          <label>Financed By:</label>
          <input className="dc-meta-extra-input" value={financedBy} onChange={e => onChange("financedBy", e.target.value)} />
        </div>
        <div className="dc-meta-extra-field">
          <label>Salesman:</label>
          <input className="dc-meta-extra-input" value={salesman} onChange={e => onChange("salesman", e.target.value)} />
        </div>
        <div className="dc-meta-extra-field">
          <label>Email ID:</label>
          <input className="dc-meta-extra-input" value={emailId} onChange={e => onChange("emailId", e.target.value)} />
        </div>
        <div className="dc-meta-extra-field">
          <label>Warranty Period:</label>
          <input className="dc-meta-extra-input" value={warrantyPeriod} onChange={e => onChange("warrantyPeriod", e.target.value)} />
        </div>
      </div>
    </div>
  );
}