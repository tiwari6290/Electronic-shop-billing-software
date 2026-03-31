import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Proformainvoice.css";
import CreateProformaInvoice from "./Createproformainvoice";
import ProformaInvoiceViewModal from "./Proformainvoiceviewmodal";
import { proformaApi, ProformaListItem, ProformaSettings } from "../../../api/proformaApi";

// ─── SVG Icon Components ──────────────────────────────────────────────────────
const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconDuplicate = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const IconHistory = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
    <polyline points="12 7 12 12 15 14"/>
  </svg>
);
const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconSort = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="3" x2="12" y2="21"/>
    <polyline points="8 8 12 3 16 8"/>
    <polyline points="8 16 12 21 16 16"/>
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

/** Local display row — derived from API ProformaListItem */
interface InvoiceRow {
  id: number;
  dbId: number;              // the real DB id
  date: string;
  proformaNumber: number;
  proformaNo: string;        // full string including prefix from DB
  partyName: string;
  dueIn: string;
  amount: number;
  status: "Open" | "Closed" | "Cancelled";
  fullData?: any;            // cached detail payload from GET /:id
}

type DateFilterOption =
  | "Today" | "Yesterday" | "This Week" | "Last Week" | "Last 7 Days"
  | "This Month" | "Previous Month" | "This Quarter" | "Previous Quarter"
  | "Current Fiscal Year" | "Previous Fiscal Year" | "Last 365 Days" | "Custom";

type StatusFilter = "Show All Invoices" | "Show Open Invoices" | "Show Closed Invoices";

interface CustomDateRange { start: Date | null; end: Date | null; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const formatAmount = (n: number) => `₹ ${n.toLocaleString("en-IN")}`;
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
const getFirstDayOfMonth = (m: number, y: number) => new Date(y, m, 1).getDay();

function getDateRange(option: DateFilterOption): { start: Date; end: Date } | null {
  const today = new Date(); today.setHours(23,59,59,999);
  const s = new Date(); s.setHours(0,0,0,0);
  switch (option) {
    case "Today": return { start: s, end: today };
    case "Yesterday": { const y = new Date(s); y.setDate(y.getDate()-1); const ye = new Date(y); ye.setHours(23,59,59,999); return { start: y, end: ye }; }
    case "This Week": { const d = s.getDay(); const st = new Date(s); st.setDate(st.getDate()-d); return { start: st, end: today }; }
    case "Last Week": { const d = s.getDay(); const en = new Date(s); en.setDate(en.getDate()-d-1); en.setHours(23,59,59,999); const st = new Date(en); st.setDate(st.getDate()-6); st.setHours(0,0,0,0); return { start: st, end: en }; }
    case "Last 7 Days": { const st = new Date(s); st.setDate(st.getDate()-6); return { start: st, end: today }; }
    case "This Month": return { start: new Date(s.getFullYear(), s.getMonth(), 1), end: today };
    case "Previous Month": { const st = new Date(s.getFullYear(), s.getMonth()-1, 1); const en = new Date(s.getFullYear(), s.getMonth(), 0); en.setHours(23,59,59,999); return { start: st, end: en }; }
    case "This Quarter": { const q = Math.floor(s.getMonth()/3); return { start: new Date(s.getFullYear(), q*3, 1), end: today }; }
    case "Previous Quarter": { const q = Math.floor(s.getMonth()/3); const st = new Date(s.getFullYear(),(q-1)*3,1); const en = new Date(s.getFullYear(),q*3,0); en.setHours(23,59,59,999); return { start: st, end: en }; }
    case "Current Fiscal Year": { const fy = s.getMonth()>=3?s.getFullYear():s.getFullYear()-1; return { start: new Date(fy,3,1), end: today }; }
    case "Previous Fiscal Year": { const fy = (s.getMonth()>=3?s.getFullYear():s.getFullYear()-1)-1; const en = new Date(fy+1,2,31); en.setHours(23,59,59,999); return { start: new Date(fy,3,1), end: en }; }
    case "Last 365 Days": { const st = new Date(s); st.setDate(st.getDate()-364); return { start: st, end: today }; }
    default: return null;
  }
}

function formatDateRangeLabel(option: DateFilterOption, custom: CustomDateRange): string {
  if (option === "Custom") {
    if (custom.start && custom.end) return `${formatDate(custom.start)} - ${formatDate(custom.end)}`;
    return "";
  }
  const range = getDateRange(option);
  return range ? `${formatDate(range.start)} - ${formatDate(range.end)}` : "";
}

/** Convert API status to display status */
function apiStatusToDisplay(s: string): InvoiceRow["status"] {
  switch (s) {
    case "CONVERTED": return "Closed";
    case "CANCELLED": return "Cancelled";
    case "SENT":      return "Open";
    case "DRAFT":     return "Open";
    default:          return "Open";
  }
}

// ─── Calendar Picker ──────────────────────────────────────────────────────────
const CalendarPicker: React.FC<{ value: Date|null; onChange: (d: Date) => void; label: string }> = ({ value, onChange, label }) => {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(value ? value.getMonth() : today.getMonth());
  const [viewYear, setViewYear]   = useState(value ? value.getFullYear() : today.getFullYear());
  const daysInMonth = getDaysInMonth(viewMonth, viewYear);
  const firstDay    = getFirstDayOfMonth(viewMonth, viewYear);
  const cells: (number|null)[] = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth}, (_,i)=>i+1)];
  const isSelected = (day: number) => !!value && value.getDate()===day && value.getMonth()===viewMonth && value.getFullYear()===viewYear;
  return (
    <div className="aa-pi-calendar">
      <div className="aa-pi-calendar-label">{label}</div>
      <div className="aa-pi-calendar-nav">
        <button onClick={() => { const d = new Date(viewYear,viewMonth-1); setViewMonth(d.getMonth()); setViewYear(d.getFullYear()); }}>‹</button>
        <span>{MONTH_NAMES[viewMonth]}</span>
        <button onClick={() => { const d = new Date(viewYear,viewMonth+1); setViewMonth(d.getMonth()); setViewYear(d.getFullYear()); }}>›</button>
        <button onClick={() => setViewYear(v=>v-1)}>‹</button>
        <span>{viewYear}</span>
        <button onClick={() => setViewYear(v=>v+1)}>›</button>
      </div>
      <div className="aa-pi-calendar-grid">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d} className="aa-pi-cal-header">{d}</div>)}
        {cells.map((day,i) => day===null
          ? <div key={`e-${i}`} className="aa-pi-cal-cell empty"/>
          : <button key={day} className={`aa-pi-cal-cell${isSelected(day)?" selected":""}`} onClick={() => onChange(new Date(viewYear,viewMonth,day))}>{day}</button>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ProformaInvoice: React.FC = () => {
  const navigate = useNavigate();

  // ── Data ────────────────────────────────────────────────────────────────────
  const [invoices, setInvoices]       = useState<InvoiceRow[]>([]);
  const [loading,  setLoading]        = useState(false);
  const [error,    setError]          = useState<string | null>(null);
  const [settings, setSettings]       = useState<ProformaSettings | null>(null);
  const [tempSettings, setTempSettings] = useState<ProformaSettings | null>(null);

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery]         = useState("");
  const [showSearch, setShowSearch]           = useState(false);
  const [dateFilter, setDateFilter]           = useState<DateFilterOption>("Last 365 Days");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [customRange, setCustomRange]         = useState<CustomDateRange>({ start: null, end: null });
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [tempCustom, setTempCustom]           = useState<CustomDateRange>({ start: null, end: null });
  const [statusFilter, setStatusFilter]       = useState<StatusFilter>("Show Open Invoices");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [openMenuId,  setOpenMenuId]  = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [pageMode, setPageMode]       = useState<null | "create" | "edit" | "duplicate">(null);
  const [activeRow, setActiveRow]     = useState<InvoiceRow | null>(null);
  const [viewRow, setViewRow]         = useState<InvoiceRow | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const dateDropdownRef   = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const menuRef           = useRef<HTMLDivElement>(null);

  // ── Load list ────────────────────────────────────────────────────────────────
  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const range = dateFilter !== "Custom" ? getDateRange(dateFilter) : { start: customRange.start!, end: customRange.end! };
      const apiStatus =
        statusFilter === "Show Open Invoices"   ? "draft,sent"  :
        statusFilter === "Show Closed Invoices" ? "converted,cancelled" : undefined;

      const data = await proformaApi.list({
        ...(range ? { startDate: range.start.toISOString(), endDate: range.end.toISOString() } : {}),
        ...(searchQuery ? { search: searchQuery } : {}),
        ...(apiStatus ? { status: apiStatus } : {}),
      });

      setInvoices(data.map((p, idx): InvoiceRow => ({
        id:            idx + 1,          // display index
        dbId:          p.id,
        date:          p.proformaDate,
        proformaNumber:idx + 1,
        proformaNo:    p.proformaNo,
        partyName:     p.party.name,
        dueIn:         p.validTill ? `${Math.max(0, Math.ceil((new Date(p.validTill).getTime() - Date.now()) / 86400000))} Days` : "-",
        amount:        Number(p.totalAmount),
        status:        p.status === "CONVERTED" ? "Closed" : p.status === "CANCELLED" ? "Cancelled" : "Open",
      })));
    } catch (e: any) {
      setError(e.message ?? "Failed to load proforma invoices");
    } finally {
      setLoading(false);
    }
  }, [dateFilter, customRange, statusFilter, searchQuery]);

  // ── Load settings ─────────────────────────────────────────────────────────
  const fetchSettings = useCallback(async () => {
    try {
      const s = await proformaApi.getSettings();
      setSettings(s);
      setTempSettings(s);
    } catch { /* fallback to defaults */ }
  }, []);

  useEffect(() => { fetchList(); fetchSettings(); }, [fetchList, fetchSettings]);

  // ── Outside-click handler ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target as Node)) setShowDateDropdown(false);
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) setShowStatusDropdown(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleDeleteInvoice = async (dbId: number) => {
    try {
      await proformaApi.delete(dbId);
      setViewRow(null);
      await fetchList();
    } catch (e: any) {
      alert(e.message ?? "Failed to delete");
    }
  };

  /** Fetch proforma data and navigate to CreateSalesInvoice for conversion.
   *  Status is set to CONVERTED only AFTER the invoice is saved (by CreateSalesInvoice). */
  const handleConvertToInvoice = async (row: InvoiceRow) => {
    try {
      // Fetch fresh full data from the backend convert endpoint (data-only, no status change)
      const result = await proformaApi.convert(row.dbId);

      // Navigate to CreateSalesInvoice with the pre-filled data + proformaId.
      // CreateSalesInvoice will call PATCH /api/proforma-invoices/:id/status { status: "CONVERTED" }
      // only AFTER the invoice is successfully saved.
      navigate("/cashier/sales-invoice", {
        state: {
          fromProforma:   result,       // full pre-fill payload from backend
          fromProformaId: result.proformaId ?? row.dbId, // used by CreateSalesInvoice to mark CONVERTED
        },
      });
    } catch (e: any) {
      // If already converted the backend returns 400 "Already converted"
      if (e.message?.toLowerCase().includes("already converted")) {
        alert("This proforma invoice has already been converted to a sales invoice.");
        await fetchList(); // Refresh so UI shows updated status
      } else {
        alert(e.message ?? "Conversion failed");
      }
    }
  };

  const handleEdit = async (row: InvoiceRow) => {
    // Fetch full detail
    try {
      const full = await proformaApi.getById(row.dbId);
      setActiveRow({ ...row, fullData: full });
      setViewRow(null);
      setPageMode("edit");
      setOpenMenuId(null);
    } catch (e: any) {
      alert(e.message ?? "Failed to load invoice");
    }
  };

  const handleDuplicate = async (row: InvoiceRow) => {
    try {
      const full = await proformaApi.getById(row.dbId);
      setActiveRow({ ...row, fullData: full });
      setViewRow(null);
      setPageMode("duplicate");
      setOpenMenuId(null);
    } catch (e: any) {
      alert(e.message ?? "Failed to load invoice");
    }
  };

  /** Build the payload that CreateProformaInvoice will pass to onSave */
  const buildApiPayload = (invoiceData: any) => {
    const fd = invoiceData.fullData || invoiceData;
    const party = invoiceData.party ?? fd.party;
    return {
      partyId: Number(party?.id),
      branchCode:     invoiceData.branchCode,
      proformaDate:   invoiceData.date,
      paymentTermsDays: typeof fd.paymentTerms === "number" ? fd.paymentTerms : undefined,
     dueDate: fd.expiryDate || undefined,
      ewayBillNo:     fd.eWayBill,
      challanNo:      fd.challanNo,
      financedBy:     fd.financedBy,
      salesman:       fd.salesman,
      emailId:        fd.emailId,
      warrantyPeriod: fd.warrantyPeriod,
      shippingAddress: fd.shippingAddress ? JSON.stringify(fd.shippingAddress) : undefined,
      subTotal:    (fd.lineItems || []).reduce((s: number, li: any) => s + (li.amount || 0), 0),
      taxableAmount: invoiceData.totalAmount,
      discountAmount: fd.discountAmt || 0,
      totalAmount:   invoiceData.totalAmount,
      discountType:  fd.discountType,
      discountPct:   fd.discountPct || 0,
      discountAmt:   fd.discountAmt || 0,
      adjustType:    fd.adjustType,
      adjustAmt:     fd.adjustAmt || 0,
      autoRoundOff:  fd.autoRound || false,
      notes:         fd.notes,
      termsConditions: fd.terms,
      customFieldValues: fd.customFieldValues || {},
      items: (fd.lineItems || []).map((li: any) => ({
        productId:   li.item?.id || null,
        productName: li.item?.name || li.name || "Item",
        description: li.description || "",
        hsnSac:      li.item?.hsn || li.hsn || "",
        quantity: Number(li.qty || 1),
        unit:        li.unit || "PCS",
        price: Number(li.pricePerItem || li.price || li.salesPrice || 0),
        discountPct: li.discountPct || 0,
        discountAmt: li.discountAmt || 0,
        taxLabel:    li.taxRate > 0 ? `GST ${li.taxRate}%` : "None",
        taxRate:     li.taxRate || 0,
        taxAmount: Number(((li.amount || li.total || 0) * (li.taxRate || 0)) / 100),
        total: Number(li.amount || li.total || 0),
      })),
     additionalCharges: (fd.charges || [])
  .filter((c: any) => (c.label || c.name)) // ✅ ADD THIS LINE
  .map((c: any) => ({
    name: c.label || c.name,
    amount: c.amount || 0,
    taxLabel: c.taxType || "No Tax Applicable",
  })),
  
    };
  };

  const handleCreateSave = async (invoiceData: any) => {
    try {
      const payload = buildApiPayload(invoiceData);
      if (!payload.partyId) {
        alert("Please select a party before saving");
        return;
      }
      await proformaApi.create(payload);
      await fetchList();
      setPageMode(null);
    } catch (e: any) {
      alert(e.message ?? "Failed to save");
    }
  };

  const handleCreateSaveNew = async (invoiceData: any) => {
    // FIX: Do NOT delegate to handleCreateSave — that sets pageMode(null) last,
    // overwriting the setPageMode("create") we need here. Call the API directly.
    try {
      const payload = buildApiPayload(invoiceData);
      if (!payload.partyId) {
        alert("Please select a party before saving");
        return;
      }
      await proformaApi.create(payload);
      await fetchList();
      // Stay on create page — reset by re-mounting with a fresh "create" mode
      setPageMode(null);
      setTimeout(() => setPageMode("create"), 0);
    } catch (e: any) {
      alert(e.message ?? "Failed to save");
    }
  };

  const handleEditSave = async (invoiceData: any) => {
    if (!activeRow) return;
    try {
      const payload = buildApiPayload(invoiceData);
      await proformaApi.update(activeRow.dbId, payload);
      await fetchList();
      setPageMode(null);
      setActiveRow(null);
    } catch (e: any) {
      alert(e.message ?? "Failed to update");
    }
  };

  const handleSettingsSave = async () => {
    if (!tempSettings) return;
    try {
      const updated = await proformaApi.updateSettings(tempSettings.id, tempSettings);
      setSettings(updated);
      setTempSettings(updated);
      setShowSettings(false);
    } catch (e: any) {
      alert(e.message ?? "Failed to save settings");
    }
  };

  const handleCustomDateOk = () => {
    if (tempCustom.start && tempCustom.end) { setCustomRange(tempCustom); setDateFilter("Custom"); }
    setShowCustomPicker(false);
    setShowDateDropdown(false);
  };

  // ── Filtering (client-side after fetch) ───────────────────────────────────
  const filteredInvoices = invoices.filter(inv => {
    const searchOk = !searchQuery ||
      inv.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.proformaNo.toLowerCase().includes(searchQuery.toLowerCase());
    return searchOk;
  });

  const dateOptions: DateFilterOption[] = [
    "Today","Yesterday","This Week","Last Week","Last 7 Days",
    "This Month","Previous Month","This Quarter","Previous Quarter",
    "Current Fiscal Year","Previous Fiscal Year","Last 365 Days","Custom",
  ];

  const quickSettings = {
    prefixEnabled:  settings?.enablePrefix  ?? false,
    prefix:         settings?.prefix        ?? "",
    sequenceNumber: settings?.sequenceNumber ?? 1,
    showItemImage:  settings?.showItemImage  ?? false,
    priceHistory:   settings?.priceHistory   ?? false,
  };

  return (
    <>
      {/* ── Create page ── */}
      {pageMode === "create" && (
        <CreateProformaInvoice
          nextNumber={settings?.sequenceNumber ?? 1}
          settings={quickSettings}
          isEdit={false}
          onSave={handleCreateSave}
          onSaveNew={handleCreateSaveNew}
          onBack={() => setPageMode(null)}
        />
      )}

      {/* ── Edit page ── */}
      {pageMode === "edit" && activeRow && (
        <CreateProformaInvoice
          nextNumber={activeRow.proformaNumber}
          settings={quickSettings}
          editData={activeRow.fullData ?? null}
          isEdit={true}
          onSave={handleEditSave}
          onSaveNew={handleEditSave}
          onBack={() => { setPageMode(null); setActiveRow(null); }}
        />
      )}

      {/* ── Duplicate page ── */}
      {pageMode === "duplicate" && activeRow && (
        <CreateProformaInvoice
          nextNumber={settings?.sequenceNumber ?? 1}
          settings={quickSettings}
          editData={activeRow.fullData ?? null}
          isEdit={false}
          onSave={handleCreateSave}
          onSaveNew={handleCreateSaveNew}
          onBack={() => { setPageMode(null); setActiveRow(null); }}
        />
      )}

      {/* ── List ── */}
      {pageMode === null && (
        <div className="aa-pi-root">
          {/* ── Header ── */}
          <div className="aa-pi-header">
            <h1 className="aa-pi-title">Proforma Invoice</h1>
            <div className="aa-pi-header-actions">
              <button className="aa-pi-icon-btn" onClick={() => { setTempSettings(settings ? { ...settings } : null); setShowSettings(true); }} title="Settings">
                <IconSettings />
                <span className="aa-pi-notification-dot" />
              </button>
              <button className="aa-pi-icon-btn pi-msg-btn" title="Messages"><IconMail /></button>
            </div>
          </div>

          {/* ── Toolbar ── */}
          <div className="aa-pi-toolbar">
            <div className="aa-pi-toolbar-left">
              {/* Search */}
              <div className={`aa-pi-search-wrap${showSearch ? " open" : ""}`}>
                <button className="aa-pi-search-btn" onClick={() => setShowSearch(s => !s)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </button>
                {showSearch && (
                  <input autoFocus className="aa-pi-search-input" placeholder="Search party, invoice…"
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    onBlur={() => { if (!searchQuery) setShowSearch(false); }} />
                )}
              </div>

              {/* Date filter */}
              <div className="aa-pi-dropdown-wrap" ref={dateDropdownRef}>
                <button className={`aa-pi-dropdown-btn${showDateDropdown ? " open" : ""}`} onClick={() => setShowDateDropdown(s => !s)}>
                  <span className="aa-pi-dropdown-icon"><IconCalendar /></span>
                  <span>{dateFilter}</span>
                  <span className="aa-pi-caret"><IconChevronDown /></span>
                </button>
                {showDateDropdown && !showCustomPicker && (
                  <div className="aa-pi-dropdown-menu pi-date-menu">
                    {dateOptions.map(opt => (
                      <button key={opt} className={`aa-pi-dropdown-item${dateFilter===opt?" active":""}`}
                        onClick={() => {
                          if (opt === "Custom") { setTempCustom({start:null,end:null}); setShowCustomPicker(true); }
                          else { setDateFilter(opt); setShowDateDropdown(false); fetchList(); }
                        }}>
                        <span>{opt}</span>
                        {opt === dateFilter && opt !== "Custom" && (
                          <span className="aa-pi-date-range-label">{formatDateRangeLabel(opt, customRange)}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {showDateDropdown && showCustomPicker && (
                  <div className="aa-pi-custom-picker">
                    <div className="aa-pi-custom-calendars">
                      <CalendarPicker label="Select Start Date" value={tempCustom.start} onChange={d => setTempCustom(p => ({...p, start: d}))} />
                      <CalendarPicker label="Select End Date"   value={tempCustom.end}   onChange={d => setTempCustom(p => ({...p, end:   d}))} />
                    </div>
                    <div className="aa-pi-custom-actions">
                      <button className="aa-pi-btn-ghost" onClick={() => setShowCustomPicker(false)}>CANCEL</button>
                      <button className="aa-pi-btn-primary-text" onClick={handleCustomDateOk}>OK</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Status filter */}
              <div className="aa-pi-dropdown-wrap" ref={statusDropdownRef}>
                <button className={`aa-pi-dropdown-btn${showStatusDropdown?" open":""}`} onClick={() => setShowStatusDropdown(s => !s)}>
                  <span>{statusFilter}</span>
                  <span className="aa-pi-caret"><IconChevronDown /></span>
                </button>
                {showStatusDropdown && (
                  <div className="aa-pi-dropdown-menu pi-status-menu">
                    {(["Show All Invoices","Show Open Invoices","Show Closed Invoices"] as StatusFilter[]).map(opt => (
                      <button key={opt} className={`aa-pi-dropdown-item${statusFilter===opt?" active bold":""}`}
                        onClick={() => { setStatusFilter(opt); setShowStatusDropdown(false); fetchList(); }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button className="aa-pi-create-btn" onClick={() => setPageMode("create")}>
              + Create Proforma Invoice
            </button>
          </div>

          {/* ── Error / loading ── */}
          {error && <div style={{ color: "#ef4444", padding: "12px 20px", fontSize: 13 }}>{error}</div>}

          {/* ── Table ── */}
          <div className="aa-pi-table-wrap">
            {loading ? (
              <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Loading…</div>
            ) : (
              <table className="aa-pi-table">
                <thead>
                  <tr>
                    <th>Date <span className="aa-pi-sort-icon"><IconSort /></span></th>
                    <th>Proforma Invoice Number</th>
                    <th>Party Name</th>
                    <th>Due In</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.length === 0 ? (
                    <tr><td colSpan={7} className="aa-pi-empty">No invoices found</td></tr>
                  ) : (
                    filteredInvoices.map(inv => (
                      <tr key={inv.dbId} className="aa-pi-tr-clickable" onClick={() => setViewRow(inv)}>
                        <td>{formatDate(new Date(inv.date))}</td>
                        <td>{inv.proformaNo}</td>
                        <td>{inv.partyName}</td>
                        <td>{inv.dueIn}</td>
                        <td>{formatAmount(inv.amount)}</td>
                        <td>
                          <span className={`aa-pi-status-badge ${inv.status.toLowerCase()}`}>{inv.status}</span>
                        </td>
                        <td className="aa-pi-actions-cell" onClick={e => e.stopPropagation()}>
                          <div className="aa-pi-menu-wrap">
                            <button className="aa-pi-kebab-btn"
                              onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === inv.dbId ? null : inv.dbId); }}>
                              ⋮
                            </button>
                            {openMenuId === inv.dbId && (
                              <div className="aa-pi-row-menu" ref={menuRef}>
                                <button onClick={() => handleEdit(inv)}>
                                  <span className="aa-pi-menu-icon"><IconEdit /></span> Edit
                                </button>
                                <button onClick={() => { setViewRow(inv); setShowHistoryModal(true); setOpenMenuId(null); }}>
                                  <span className="aa-pi-menu-icon"><IconHistory /></span> Edit History
                                </button>
                                <button onClick={() => handleDuplicate(inv)}>
                                  <span className="aa-pi-menu-icon"><IconDuplicate /></span> Duplicate
                                </button>
                                <button className="aa-pi-delete-item" onClick={() => handleDeleteInvoice(inv.dbId)}>
                                  <span className="aa-pi-menu-icon"><IconTrash /></span> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* ── Quick Settings Modal ── */}
          {showSettings && tempSettings && (
            <div className="aa-pi-modal-overlay" onClick={() => setShowSettings(false)}>
              <div className="aa-pi-modal" onClick={e => e.stopPropagation()}>
                <div className="aa-pi-modal-header">
                  <h2>Quick Proforma Settings</h2>
                  <button className="aa-pi-modal-close" onClick={() => setShowSettings(false)}><IconClose /></button>
                </div>
                <div className="aa-pi-modal-body">
                  <div className={`aa-pi-settings-card${tempSettings.enablePrefix ? " enabled" : ""}`}>
                    <div className="aa-pi-settings-row">
                      <div>
                        <div className="aa-pi-settings-title">Proforma Prefix &amp; Sequence Number</div>
                        <div className="aa-pi-settings-desc">Add your custom prefix &amp; sequence for Proforma Numbering</div>
                      </div>
                      <label className="aa-pi-toggle">
                        <input type="checkbox" checked={tempSettings.enablePrefix}
                          onChange={e => setTempSettings(p => p ? {...p, enablePrefix: e.target.checked} : p)} />
                        <span className="aa-pi-toggle-slider" />
                      </label>
                    </div>
                    {tempSettings.enablePrefix && (
                      <div className="aa-pi-settings-fields">
                        <div className="aa-pi-field">
                          <label>Prefix</label>
                          <input type="text" placeholder="e.g. PI-" value={tempSettings.prefix ?? ""}
                            onChange={e => setTempSettings(p => p ? {...p, prefix: e.target.value} : p)} />
                        </div>
                        <div className="aa-pi-field">
                          <label>Sequence Number</label>
                          <input type="number" value={tempSettings.sequenceNumber}
                            onChange={e => setTempSettings(p => p ? {...p, sequenceNumber: Number(e.target.value)} : p)} />
                        </div>
                        <div className="aa-pi-proforma-preview">
                          Proforma Number: {tempSettings.prefix}{tempSettings.sequenceNumber}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="aa-pi-settings-card">
                    <div className="aa-pi-settings-row">
                      <div>
                        <div className="aa-pi-settings-title">Show Item Image on Invoice</div>
                        <div className="aa-pi-settings-desc">This will apply to all vouchers except Payment In/Out</div>
                      </div>
                      <label className="aa-pi-toggle">
                        <input type="checkbox" checked={tempSettings.showItemImage}
                          onChange={e => setTempSettings(p => p ? {...p, showItemImage: e.target.checked} : p)} />
                        <span className="aa-pi-toggle-slider" />
                      </label>
                    </div>
                  </div>
                  <div className="aa-pi-settings-card">
                    <div className="aa-pi-settings-row">
                      <div>
                        <div className="aa-pi-settings-title">Price History <span className="aa-pi-new-badge">New</span></div>
                        <div className="aa-pi-settings-desc">Show last 5 sales/purchase prices for the selected party</div>
                      </div>
                      <label className="aa-pi-toggle">
                        <input type="checkbox" checked={tempSettings.priceHistory}
                          onChange={e => setTempSettings(p => p ? {...p, priceHistory: e.target.checked} : p)} />
                        <span className="aa-pi-toggle-slider" />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="aa-pi-modal-footer">
                  <button className="aa-pi-btn-cancel" onClick={() => setShowSettings(false)}>Cancel</button>
                  <button className="aa-pi-btn-save" onClick={handleSettingsSave}>Save</button>
                </div>
              </div>
            </div>
          )}

          {/* ── Edit History Modal ── */}
          {showHistoryModal && (
            <div className="aa-pi-modal-overlay" onClick={() => setShowHistoryModal(false)}>
              <div className="aa-pi-modal" onClick={e => e.stopPropagation()}>
                <div className="aa-pi-modal-header">
                  <h2>Edit History</h2>
                  <button className="aa-pi-modal-close" onClick={() => setShowHistoryModal(false)}><IconClose /></button>
                </div>
                <div className="aa-pi-modal-body">
                  <div className="aa-pi-history-entry">
                    <span className="aa-pi-history-dot" />
                    <div>
                      <div className="aa-pi-history-action">Invoice Created</div>
                      <div className="aa-pi-history-time">{formatDate(new Date())}, System</div>
                    </div>
                  </div>
                </div>
                <div className="aa-pi-modal-footer">
                  <button className="aa-pi-btn-save" onClick={() => setShowHistoryModal(false)}>Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── View Modal ── */}
      {viewRow && (
        <ProformaInvoiceViewModal
          invoice={viewRow as any}
          onClose={() => setViewRow(null)}
          onEdit={inv => { setViewRow(null); handleEdit(inv as any); }}
          onDuplicate={inv => { setViewRow(null); handleDuplicate(inv as any); }}
          onDelete={id => { handleDeleteInvoice((viewRow as any).dbId); setViewRow(null); }}
          onConvertToInvoice={inv => handleConvertToInvoice(viewRow)}
          prefix={settings?.prefix ?? ""}
          prefixEnabled={settings?.enablePrefix ?? false}
        />
      )}
    </>
  );
};

export default ProformaInvoice;