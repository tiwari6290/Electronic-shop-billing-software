import { useState, useRef, useEffect, useCallback } from "react";
import { LinkedInvoice, fmtDisplayDate } from "./Salesreturntypes";
import { Party } from "./Salesreturntypes";
import { getAvailableInvoicesForReturn, AvailableInvoice } from "../../../api/salesreturnapi";
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

// ─── Convert backend AvailableInvoice → frontend LinkedInvoice ────────────────
function toLinkedInvoice(inv: AvailableInvoice, partyName: string): LinkedInvoice {
  return {
    id:         String(inv.id),
    invoiceNo:  inv.invoiceNo,
    invoiceDate: inv.invoiceDate.split("T")[0],
    party:      { name: partyName },
    billItems:  inv.items.map((item) => ({
      rowId:       `row-${item.id}`,
      itemId:      String(item.productId),
      name:        item.product.name,
      description: "",
      hsn:         item.product.hsnCode || "",
      qty:         item.quantity,
      unit:        item.product.unit || "PCS",
      price:       item.price,
      discountPct: 0,
      discountAmt: 0,
      taxLabel:    "None",
      taxRate:     0,
      amount:      item.quantity * item.price,
    })),
    additionalCharges: [],
    discountPct:       0,
    discountAmt:       0,
    notes:             "",
    termsConditions:   "",
    amountReceived:    Number(inv.totalAmount) - Number(inv.outstandingAmount),
    status:            inv.status,
  };
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
  salesReturnNo:   number;
  salesReturnDate: string;
  party:           Party | null;
  currentReturnId: string;
  linkedInvoiceId: string | null;
  eWayBillNo:      string;
  challanNo:       string;
  financedBy:      string;
  salesman:        string;
  emailId:         string;
  warrantyPeriod:  string;
  onChange:        (field: string, value: any) => void;
  onInvoiceLink:   (invoice: LinkedInvoice | null) => void;
}

export default function SRMetaFields({
  salesReturnNo, salesReturnDate, party, currentReturnId,
  linkedInvoiceId, eWayBillNo, challanNo, financedBy,
  salesman, emailId, warrantyPeriod, onChange, onInvoiceLink,
}: MetaFieldsProps) {
  const [invoiceOpen, setInvoiceOpen]         = useState(false);
  const [invoiceSearch, setInvoiceSearch]     = useState("");
  const [editNo, setEditNo]                   = useState(false);
  const [tempNo, setTempNo]                   = useState(String(salesReturnNo));
  const [availableInvoices, setAvailableInvoices] = useState<AvailableInvoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [invoiceError, setInvoiceError]       = useState<string | null>(null);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [builderDet, setBuilderDet]           = useState<BuilderDetSettings>(() => getBuilderDetSettings());

  const invoiceRef = useRef<HTMLDivElement>(null);

  // Read builder settings once
  useEffect(() => {
    const det = getBuilderDetSettings();
    setBuilderDet(det);
    const initial: Record<string, string> = {};
    det.customFields.forEach(f => { if (f.label) initial[f.label] = f.value || ""; });
    setCustomFieldValues(initial);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (invoiceRef.current && !invoiceRef.current.contains(e.target as Node)) setInvoiceOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => { setTempNo(String(salesReturnNo)); }, [salesReturnNo]);

  // ── Fetch available invoices from backend when a party is selected ──────────
  const fetchAvailableInvoices = useCallback(async () => {
    if (!party?.id) {
      setAvailableInvoices([]);
      return;
    }
    setLoadingInvoices(true);
    setInvoiceError(null);
    try {
      const invoices = await getAvailableInvoicesForReturn(party.id);
      setAvailableInvoices(invoices);
    } catch (err: any) {
      setInvoiceError("Failed to load invoices");
      setAvailableInvoices([]);
    } finally {
      setLoadingInvoices(false);
    }
  }, [party?.id]);

  // Re-fetch whenever party changes
  useEffect(() => {
    fetchAvailableInvoices();
    // Clear linked invoice if party changes
    if (!party) {
      onChange("linkedInvoiceId", null);
      onInvoiceLink(null);
    }
  }, [party?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter by search term
  const filteredInvoices = availableInvoices.filter(inv => {
    if (!invoiceSearch.trim()) return true;
    const q = invoiceSearch.toLowerCase();
    return (
      String(inv.invoiceNo).toLowerCase().includes(q) ||
      inv.invoiceDate.includes(q)
    );
  });

  // Find the currently linked invoice for display
  const linkedInvoice = linkedInvoiceId
    ? availableInvoices.find(i => String(i.id) === String(linkedInvoiceId))
    : null;

  const handleSelectInvoice = (inv: AvailableInvoice) => {
    const linked = toLinkedInvoice(inv, party?.name ?? "");
    onChange("linkedInvoiceId", String(inv.id));
    onInvoiceLink(linked);
    setInvoiceOpen(false);
    setInvoiceSearch("");
  };

  const handleClearInvoice = () => {
    onChange("linkedInvoiceId", null);
    onInvoiceLink(null);
    setInvoiceSearch("");
  };

  const formatInvoiceDate = (d: string) => {
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${String(dt.getFullYear()).slice(-2)}`;
  };

  // Extra fields from Invoice Builder settings
  const extraFields: { key: string; label: string; value: string; fieldProp: string }[] = [];
  if (builderDet.showEwayBill)   extraFields.push({ key: "eWayBillNo",     label: "E-Way Bill No:",   value: eWayBillNo,     fieldProp: "eWayBillNo" });
  if (builderDet.showChallan)    extraFields.push({ key: "challanNo",      label: "Challan No.:",     value: challanNo,      fieldProp: "challanNo" });
  if (builderDet.showFinancedBy) extraFields.push({ key: "financedBy",     label: "Financed By:",     value: financedBy,     fieldProp: "financedBy" });
  if (builderDet.showSalesman)   extraFields.push({ key: "salesman",       label: "Salesman:",        value: salesman,       fieldProp: "salesman" });
  if (builderDet.showEmailId)    extraFields.push({ key: "emailId",        label: "Email ID:",        value: emailId,        fieldProp: "emailId" });
  if (builderDet.showWarranty)   extraFields.push({ key: "warrantyPeriod", label: "Warranty Period:", value: warrantyPeriod, fieldProp: "warrantyPeriod" });

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

      {/* ── Link to Invoice (backend-powered) ── */}
      <div className="csr-meta-field csr-meta-field--full">
        <label className="csr-meta-label">Link to Invoice :</label>
        <div ref={invoiceRef} className="csr-invoice-link-wrap">
          <div
            className={`csr-invoice-search-box${invoiceOpen ? " csr-invoice-search-box--open" : ""}`}
            onClick={() => { if (party?.id) setInvoiceOpen(true); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="csr-invoice-search-input"
              placeholder={party ? "Search invoices" : "Select a party first"}
              value={invoiceSearch}
              disabled={!party?.id}
              onChange={e => setInvoiceSearch(e.target.value)}
              onFocus={() => { if (party?.id) { setInvoiceOpen(true); fetchAvailableInvoices(); } }}
            />
            {loadingInvoices && (
              <span className="csr-invoice-loading">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              </span>
            )}
          </div>

          {invoiceOpen && (
            <div className="csr-invoice-dropdown">
              {loadingInvoices ? (
                <div className="csr-invoice-empty">Loading invoices…</div>
              ) : invoiceError ? (
                <div className="csr-invoice-empty csr-invoice-error">
                  {invoiceError}
                  <button className="csr-invoice-retry" onClick={fetchAvailableInvoices}>Retry</button>
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="csr-invoice-empty">
                  {invoiceSearch
                    ? "No invoices match your search"
                    : party
                    ? "No available invoices — all invoices for this party already have a return"
                    : "Select a party to see invoices"}
                </div>
              ) : (
                <>
                  <div className="csr-invoice-dropdown-hdr">
                    <span>Date</span>
                    <span>Invoice No.</span>
                    <span>Amount (₹)</span>
                    <span>Status</span>
                  </div>
                  {filteredInvoices.map(inv => (
                    <div
                      key={inv.id}
                      className={`csr-invoice-option${String(inv.id) === String(linkedInvoiceId) ? " csr-invoice-option--sel" : ""}`}
                      onClick={() => handleSelectInvoice(inv)}
                    >
                      <span>{formatInvoiceDate(inv.invoiceDate)}</span>
                      <span>#{inv.invoiceNo}</span>
                      <span>₹{Number(inv.totalAmount).toLocaleString("en-IN")}</span>
                      <span className={`csr-inv-status csr-inv-status--${inv.status.toLowerCase()}`}>
                        {inv.status === "OPEN" ? "Unpaid" : inv.status === "PARTIAL" ? "Partial" : inv.status === "PAID" ? "Paid" : inv.status}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Linked invoice badge */}
        {linkedInvoice && (
          <div className="csr-linked-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            &nbsp;Linked to Invoice #{linkedInvoice.invoiceNo}
            &nbsp;
            <span className="csr-linked-status">
              ({linkedInvoice.status === "OPEN" ? "Unpaid" : linkedInvoice.status === "PARTIAL" ? "Partially Paid" : "Paid"})
            </span>
            <button className="csr-linked-clear" onClick={handleClearInvoice} title="Remove link">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ── Extra fields from Invoice Builder ── */}
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