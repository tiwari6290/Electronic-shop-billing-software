import { useState, useRef, useEffect } from "react";
import {
  LinkedSalesInvoice, Party, fmtDisplayDate,
  getAvailableInvoicesForParty,
} from "./Creditnotetypes";
import "./Createcreditnote.css";

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
    <div ref={ref} className="cn-datepick-wrap">
      <button className="cn-date-btn" onClick={() => setOpen(!open)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span>{displayVal}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div className="cn-cal-popup">
          <div className="cn-cal-selected-display">{value ? fmtDisplayDate(value) : "—"}</div>
          <div className="cn-cal-nav">
            <div className="cn-cal-nav-group">
              <button onClick={() => { if (vm === 0) { setVm(11); setVy(y => y - 1); } else setVm(m => m - 1); }}>‹</button>
              <span>{MONTHS[vm]}</span>
              <button onClick={() => { if (vm === 11) { setVm(0); setVy(y => y + 1); } else setVm(m => m + 1); }}>›</button>
            </div>
            <div className="cn-cal-nav-group">
              <button onClick={() => setVy(y => y - 1)}>‹</button>
              <span>{vy}</span>
              <button onClick={() => setVy(y => y + 1)}>›</button>
            </div>
          </div>
          <div className="cn-cal-grid">
            {DAYS.map(d => <div key={d} className="cn-cal-dh">{d}</div>)}
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              return (
                <button
                  key={i}
                  className={`cn-cal-day${isSelected(day) ? " cn-cal-day--sel" : ""}${isToday(day) && !isSelected(day) ? " cn-cal-day--today" : ""}`}
                  onClick={() => { onChange(ds(day)); setOpen(false); }}
                >{day}</button>
              );
            })}
          </div>
          <div className="cn-cal-footer">
            <button className="cn-cal-cancel" onClick={() => setOpen(false)}>CANCEL</button>
            <button className="cn-cal-ok" onClick={() => setOpen(false)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Meta Fields ──────────────────────────────────────────────────────────────
interface MetaFieldsProps {
  creditNoteNo: number;
  creditNoteDate: string;
  prefix: string;
  party: Party | null;
  currentCreditNoteId: string;
  linkedInvoiceId: string | null;
  eWayBillNo: string;
  challanNo: string;
  financedBy: string;
  salesman: string;
  emailId: string;
  warrantyPeriod: string;
  onChange: (field: string, value: any) => void;
  onInvoiceLink: (invoice: LinkedSalesInvoice | null) => void;
}

export default function CNMetaFields({
  creditNoteNo, creditNoteDate, prefix, party, currentCreditNoteId,
  linkedInvoiceId, eWayBillNo, challanNo, financedBy,
  salesman, emailId, warrantyPeriod, onChange, onInvoiceLink,
}: MetaFieldsProps) {
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [editNo, setEditNo] = useState(false);
  const [tempNo, setTempNo] = useState(String(creditNoteNo));
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (invoiceRef.current && !invoiceRef.current.contains(e.target as Node)) setInvoiceOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => { setTempNo(String(creditNoteNo)); }, [creditNoteNo]);

  // Get available invoices for this party (not already linked to another CN)
  const availableInvoices = party
    ? getAvailableInvoicesForParty(party.name, currentCreditNoteId)
    : [];

  const filteredInvoices = availableInvoices.filter(inv => {
    if (!invoiceSearch.trim()) return true;
    return (
      String(inv.invoiceNo).includes(invoiceSearch) ||
      fmtDisplayDate(inv.invoiceDate).toLowerCase().includes(invoiceSearch.toLowerCase())
    );
  });

  const linkedInvoice = linkedInvoiceId
    ? availableInvoices.find(i => i.id === linkedInvoiceId) ||
      getAvailableInvoicesForParty("", "").find(i => i.id === linkedInvoiceId)
    : null;

  const handleSelectInvoice = (inv: LinkedSalesInvoice) => {
    onChange("linkedInvoiceId", inv.id);
    onInvoiceLink(inv);
    setInvoiceOpen(false);
    setInvoiceSearch("");
  };

  const calcInvoiceAmount = (inv: LinkedSalesInvoice): number =>
    inv.billItems.reduce((s, i) => s + (i.amount || i.qty * i.price), 0);

  const formatInvDate = (d: string) => {
    const dt = new Date(d);
    return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${String(dt.getFullYear()).slice(-2)}`;
  };

  return (
    <div className="cn-meta-panel">
      {/* Credit Note No + Date */}
      <div className="cn-meta-row">
        <div className="cn-meta-field">
          <label className="cn-meta-label">Credit Note No:</label>
          {editNo ? (
            <input
              autoFocus
              className="cn-meta-input"
              value={tempNo}
              onChange={e => setTempNo(e.target.value)}
              onBlur={() => { onChange("creditNoteNo", Number(tempNo) || creditNoteNo); setEditNo(false); }}
              onKeyDown={e => { if (e.key === "Enter") { onChange("creditNoteNo", Number(tempNo) || creditNoteNo); setEditNo(false); } }}
            />
          ) : (
            <div className="cn-meta-value-box" onClick={() => { setTempNo(String(creditNoteNo)); setEditNo(true); }}>
              {prefix}{creditNoteNo}
            </div>
          )}
        </div>
        <div className="cn-meta-field">
          <label className="cn-meta-label">Credit Note Date:</label>
          <DatePicker value={creditNoteDate} onChange={v => onChange("creditNoteDate", v)} />
        </div>
      </div>

      {/* Link to Invoice */}
      <div className="cn-meta-field cn-meta-field--full">
        <label className="cn-meta-label">Link to Invoice :</label>
        <div ref={invoiceRef} className="cn-invoice-link-wrap">
          <div
            className={`cn-invoice-search-box${invoiceOpen ? " cn-invoice-search-box--open" : ""}`}
            onClick={() => { if (party) setInvoiceOpen(true); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              className="cn-invoice-search-input"
              placeholder={party ? "Search invoices" : "Select a party first"}
              value={invoiceSearch}
              onChange={e => setInvoiceSearch(e.target.value)}
              onFocus={() => { if (party) setInvoiceOpen(true); }}
              disabled={!party}
            />
            {invoiceSearch && (
              <button className="cn-invoice-clear" onClick={() => { setInvoiceSearch(""); onChange("linkedInvoiceId", null); onInvoiceLink(null); }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>

          {invoiceOpen && party && (
            <div className="cn-invoice-dropdown">
              {filteredInvoices.length === 0 ? (
                <div className="cn-invoice-empty">
                  {invoiceSearch ? "No invoices match your search" : "No available invoices for this party"}
                </div>
              ) : (
                <>
                  <div className="cn-invoice-dropdown-hdr">
                    <span>Date</span>
                    <span>Invoice No.</span>
                    <span>Amount (₹)</span>
                  </div>
                  {filteredInvoices.map(inv => (
                    <div
                      key={inv.id}
                      className={`cn-invoice-option${inv.id === linkedInvoiceId ? " cn-invoice-option--sel" : ""}`}
                      onClick={() => handleSelectInvoice(inv)}
                    >
                      <span>{formatInvDate(inv.invoiceDate)}</span>
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
          <div className="cn-linked-badge">
            Linked to Invoice #{linkedInvoice.invoiceNo}
            <button className="cn-linked-clear" onClick={() => { onChange("linkedInvoiceId", null); onInvoiceLink(null); setInvoiceSearch(""); }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}
      </div>

      {/* Extra fields grid */}
      <div className="cn-meta-extras">
        <div className="cn-meta-extra-field">
          <label>
            E-Way Bill No:
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft:3,verticalAlign:"middle"}}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          </label>
          <input className="cn-meta-extra-input" value={eWayBillNo} onChange={e => onChange("eWayBillNo", e.target.value)} />
        </div>
        <div className="cn-meta-extra-field">
          <label>Challan No.:</label>
          <input className="cn-meta-extra-input" value={challanNo} onChange={e => onChange("challanNo", e.target.value)} />
        </div>
        <div className="cn-meta-extra-field">
          <label>Financed By:</label>
          <input className="cn-meta-extra-input" value={financedBy} onChange={e => onChange("financedBy", e.target.value)} />
        </div>
        <div className="cn-meta-extra-field">
          <label>Salesman:</label>
          <input className="cn-meta-extra-input" value={salesman} onChange={e => onChange("salesman", e.target.value)} />
        </div>
        <div className="cn-meta-extra-field">
          <label>Email ID:</label>
          <input className="cn-meta-extra-input" value={emailId} onChange={e => onChange("emailId", e.target.value)} />
        </div>
        <div className="cn-meta-extra-field">
          <label>Warranty Period:</label>
          <input className="cn-meta-extra-input" value={warrantyPeriod} onChange={e => onChange("warrantyPeriod", e.target.value)} />
        </div>
      </div>
    </div>
  );
}