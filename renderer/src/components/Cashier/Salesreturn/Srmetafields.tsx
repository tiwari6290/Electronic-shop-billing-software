import { useState, useRef, useEffect } from "react";
import { LinkedInvoice, getSalesInvoices, getSalesReturns, fmtDisplayDate } from "./Salesreturntypes";
import { Party } from "./Salesreturntypes";
import "./Createsalesreturn.css";

// ─── Read field visibility + custom fields from InvoiceBuilder localStorage ───
interface BuilderDetSettings {
  showEwayBill:          boolean;
  showChallan:           boolean;
  showFinancedBy:        boolean;
  showSalesman:          boolean;
  showEmailId:           boolean;
  showWarranty:          boolean;
  showVehicle:           boolean;
  showPO:                boolean;
  showDispatchedThrough: boolean;
  showTransportName:     boolean;
  customFields:          { label: string; value: string }[];
}

function getBuilderDetSettings(): BuilderDetSettings {
  const defaults: BuilderDetSettings = {
    showEwayBill:          true,
    showChallan:           true,
    showFinancedBy:        true,
    showSalesman:          true,
    showEmailId:           true,
    showWarranty:          true,
    showVehicle:           false,
    showPO:                false,
    showDispatchedThrough: false,
    showTransportName:     false,
    customFields:          [],
  };
  try {
    const raw = localStorage.getItem("activeInvoiceTemplate");
    if (raw) {
      const parsed = JSON.parse(raw);
      const d = parsed?.det;
      if (d) {
        return {
          showEwayBill:          d.showEwayBill          ?? defaults.showEwayBill,
          showChallan:           d.showChallan           ?? defaults.showChallan,
          showFinancedBy:        d.showFinancedBy        ?? defaults.showFinancedBy,
          showSalesman:          d.showSalesman          ?? defaults.showSalesman,
          showEmailId:           d.showEmailId           ?? defaults.showEmailId,
          showWarranty:          d.showWarranty          ?? defaults.showWarranty,
          showVehicle:           d.showVehicle           ?? defaults.showVehicle,
          showPO:                d.showPO                ?? defaults.showPO,
          showDispatchedThrough: d.showDispatchedThrough ?? defaults.showDispatchedThrough,
          showTransportName:     d.showTransportName     ?? defaults.showTransportName,
          customFields:          Array.isArray(d.customFields) ? d.customFields : [],
        };
      }
    }
  } catch {}
  return defaults;
}

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

  const cells: (number | null)[] = [
    ...Array(fdo(vm, vy)).fill(null),
    ...Array.from({ length: dim(vm, vy) }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const ds = (d: number) => `${vy}-${String(vm + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const isSelected = (d: number) => ds(d) === value;
  const isToday = (d: number) => ds(d) === new Date().toISOString().split("T")[0];

  return (
    <div ref={ref} className="csr-datepick-wrap">
      <button className="csr-date-btn" onClick={() => setOpen(!open)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span>{value ? fmtDisplayDate(value) : "Select date"}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="csr-cal-popup">
          <div className="csr-cal-selected-display">{value ? fmtDisplayDate(value) : "—"}</div>
          <div className="csr-cal-nav">
            <div className="csr-cal-nav-group">
              <button onClick={() => { if (vm === 0) { setVm(11); setVy(y => y - 1); } else setVm(m => m - 1); }}>‹</button>
              <span>{MONTHS[vm]}</span>
              <button onClick={() => { if (vm === 11) { setVm(0); setVy(y => y + 1); } else setVm(m => m + 1); }}>›</button>
            </div>
            <div className="csr-cal-nav-group">
              <button onClick={() => setVy(y => y - 1)}>‹</button>
              <span>{vy}</span>
              <button onClick={() => setVy(y => y + 1)}>›</button>
            </div>
          </div>
          <div className="csr-cal-grid">
            {DAYS.map(d => <div key={d} className="csr-cal-dh">{d}</div>)}
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              return (
                <button
                  key={i}
                  className={[
                    "csr-cal-day",
                    isSelected(day) ? "csr-cal-day--sel" : "",
                    isToday(day) && !isSelected(day) ? "csr-cal-day--today" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => { onChange(ds(day)); setOpen(false); }}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="csr-cal-footer">
            <button className="csr-cal-cancel" onClick={() => setOpen(false)}>CANCEL</button>
            <button className="csr-cal-ok" onClick={() => setOpen(false)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Meta Fields Component ────────────────────────────────────────────────────
interface MetaFieldsProps {
  salesReturnNo: number;
  salesReturnDate: string;
  party: Party | null;
  currentReturnId: string;
  linkedInvoiceId: string | null;
  eWayBillNo: string;
  challanNo: string;
  financedBy: string;
  salesman: string;
  emailId: string;
  warrantyPeriod: string;
  onChange: (field: string, value: any) => void;
  onInvoiceLink: (invoice: LinkedInvoice | null) => void;
}

export default function SRMetaFields({
  salesReturnNo, salesReturnDate, party, currentReturnId,
  linkedInvoiceId, eWayBillNo, challanNo, financedBy,
  salesman, emailId, warrantyPeriod, onChange, onInvoiceLink,
}: MetaFieldsProps) {
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [editNo, setEditNo] = useState(false);
  const [tempNo, setTempNo] = useState(String(salesReturnNo));
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Custom field values keyed by label
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});

  // Read builder settings once on mount
  const [builderDet, setBuilderDet] = useState<BuilderDetSettings>(() => getBuilderDetSettings());

  useEffect(() => {
    const det = getBuilderDetSettings();
    setBuilderDet(det);
    // Seed custom field defaults
    const initial: Record<string, string> = {};
    det.customFields.forEach(f => { if (f.label) initial[f.label] = f.value || ""; });
    setCustomFieldValues(initial);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (invoiceRef.current && !invoiceRef.current.contains(e.target as Node)) setInvoiceOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => { setTempNo(String(salesReturnNo)); }, [salesReturnNo]);

  // Get invoices for this party, excluding those already used in other returns
  const allInvoices = getSalesInvoices();
  const allReturns = getSalesReturns();
  const usedInvoiceIds = allReturns
    .filter(r => r.id !== currentReturnId && r.linkedInvoiceId)
    .map(r => r.linkedInvoiceId);

  const partyInvoices = allInvoices.filter(inv => {
    if (party && inv.party?.name !== party.name) return false;
    if (usedInvoiceIds.includes(inv.id)) return false;
    return true;
  }).filter(inv => {
    if (!invoiceSearch.trim()) return true;
    return (
      String(inv.invoiceNo).includes(invoiceSearch) ||
      fmtDisplayDate(inv.invoiceDate).toLowerCase().includes(invoiceSearch.toLowerCase())
    );
  });

  const linkedInvoice = linkedInvoiceId ? allInvoices.find(i => i.id === linkedInvoiceId) : null;

  const handleSelectInvoice = (inv: LinkedInvoice) => {
    onChange("linkedInvoiceId", inv.id);
    onInvoiceLink(inv);
    setInvoiceOpen(false);
    setInvoiceSearch("");
  };

  const formatInvoiceDate = (d: string) => {
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${String(dt.getFullYear()).slice(-2)}`;
  };

  const calcInvoiceAmount = (inv: LinkedInvoice): number =>
    inv.billItems.reduce((s, i) => s + (i.amount || i.qty * i.price), 0);

  // Build list of visible extra fields from builder settings
  const extraFields: { key: string; label: string; value: string; fieldProp: string }[] = [];
  if (builderDet.showEwayBill)  extraFields.push({ key: "eWayBillNo",      label: "E-Way Bill No:",    value: eWayBillNo,      fieldProp: "eWayBillNo" });
  if (builderDet.showChallan)   extraFields.push({ key: "challanNo",       label: "Challan No.:",      value: challanNo,       fieldProp: "challanNo" });
  if (builderDet.showFinancedBy) extraFields.push({ key: "financedBy",     label: "Financed By:",      value: financedBy,      fieldProp: "financedBy" });
  if (builderDet.showSalesman)  extraFields.push({ key: "salesman",        label: "Salesman:",         value: salesman,        fieldProp: "salesman" });
  if (builderDet.showEmailId)   extraFields.push({ key: "emailId",         label: "Email ID:",         value: emailId,         fieldProp: "emailId" });
  if (builderDet.showWarranty)  extraFields.push({ key: "warrantyPeriod",  label: "Warranty Period:",  value: warrantyPeriod,  fieldProp: "warrantyPeriod" });

  const visibleCustomFields = builderDet.customFields.filter(cf => cf.label.trim());

  return (
    <div className="csr-meta-panel">
      {/* ── Sales Return No + Date ── */}
      <div className="csr-meta-row">
        <div className="csr-meta-field">
          <label className="csr-meta-label">Sales Return No:</label>
          {editNo ? (
            <input
              autoFocus
              className="csr-meta-input"
              value={tempNo}
              onChange={e => setTempNo(e.target.value)}
              onBlur={() => { onChange("salesReturnNo", Number(tempNo) || salesReturnNo); setEditNo(false); }}
              onKeyDown={e => { if (e.key === "Enter") { onChange("salesReturnNo", Number(tempNo) || salesReturnNo); setEditNo(false); } }}
            />
          ) : (
            <div className="csr-meta-value-box" onClick={() => { setTempNo(String(salesReturnNo)); setEditNo(true); }}>
              {salesReturnNo}
            </div>
          )}
        </div>
        <div className="csr-meta-field">
          <label className="csr-meta-label">Sales Return Date:</label>
          <DatePicker value={salesReturnDate} onChange={v => onChange("salesReturnDate", v)} />
        </div>
      </div>

      {/* ── Link to Invoice ── */}
      <div className="csr-meta-field csr-meta-field--full">
        <label className="csr-meta-label">Link to Invoice :</label>
        <div ref={invoiceRef} className="csr-invoice-link-wrap">
          <div
            className={`csr-invoice-search-box${invoiceOpen ? " csr-invoice-search-box--open" : ""}`}
            onClick={() => setInvoiceOpen(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="csr-invoice-search-input"
              placeholder="Search invoices"
              value={invoiceSearch}
              onChange={e => setInvoiceSearch(e.target.value)}
              onFocus={() => setInvoiceOpen(true)}
            />
          </div>
          {invoiceOpen && (
            <div className="csr-invoice-dropdown">
              {partyInvoices.length === 0 ? (
                <div className="csr-invoice-empty">
                  {party ? "No available invoices for this party" : "Select a party to see invoices"}
                </div>
              ) : (
                <>
                  <div className="csr-invoice-dropdown-hdr">
                    <span>Date</span>
                    <span>Invoice No.</span>
                    <span>Amount (₹)</span>
                  </div>
                  {partyInvoices.map(inv => (
                    <div
                      key={inv.id}
                      className={`csr-invoice-option${inv.id === linkedInvoiceId ? " csr-invoice-option--sel" : ""}`}
                      onClick={() => handleSelectInvoice(inv)}
                    >
                      <span>{formatInvoiceDate(inv.invoiceDate)}</span>
                      <span>#{inv.invoiceNo}</span>
                      <span>₹{calcInvoiceAmount(inv).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
        {linkedInvoice && (
          <div className="csr-linked-badge">
            Linked to Invoice #{linkedInvoice.invoiceNo}
            <button className="csr-linked-clear" onClick={() => { onChange("linkedInvoiceId", null); onInvoiceLink(null); setInvoiceSearch(""); }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ── Extra fields controlled by Invoice Builder ── */}
      {(extraFields.length > 0 || visibleCustomFields.length > 0) && (
        <div className="csr-meta-extras">
          {extraFields.map(f => (
            <div key={f.key} className="csr-meta-extra-field">
              <label>
                {f.label}
                {f.key === "eWayBillNo" && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 3, verticalAlign: "middle" }}>
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4M12 16h.01"/>
                  </svg>
                )}
              </label>
              <input
                className="csr-meta-extra-input"
                value={f.value}
                onChange={e => onChange(f.fieldProp, e.target.value)}
              />
            </div>
          ))}

          {/* Custom fields from Invoice Builder */}
          {visibleCustomFields.map((cf, idx) => (
            <div key={`custom-${idx}`} className="csr-meta-extra-field">
              <label>{cf.label}:</label>
              <input
                className="csr-meta-extra-input"
                value={customFieldValues[cf.label] ?? cf.value ?? ""}
                onChange={e => setCustomFieldValues(prev => ({ ...prev, [cf.label]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}