import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./SalesInvoiceList.css";
import InvoiceViewModal from "./Invoiceviewmodal";
import {
  getInvoices, cancelInvoice as apiCancelInvoice, deleteInvoice as apiDeleteInvoice,
  createInvoice, getInvoiceSummary,
  fromSaleInvoice, toCreatePayload,
  type SaleInvoice, type GetInvoicesParams,
} from "@/api/salesInvoiceApi";
function todayStr() { return new Date().toISOString().split("T")[0]; }

// ─── Types ────────────────────────────────────────────────────────────────────
interface SalesInvoice {
  id: string;
 invoiceNo: string;
  invoiceDate: string;
  party: { name: string; mobile?: string } | null;
  dueDate: string;
  showDueDate: boolean;
  paymentTermsDays: number;
  billItems: { qty: number; price: number; discountPct: number; discountAmt: number; taxRate: number; amount: number }[];
  additionalCharges: { amount: number }[];
  discountPct: number;
  discountAmt: number;
  applyTCS: boolean;
  tcsRate: number;
  tcsBase: "Total Amount" | "Taxable Amount";
  roundOffAmt: number;
  amountReceived: number;
  status: "Paid" | "Unpaid" | "Partially Paid" | "Cancelled";
  createdAt: string;
}

type StatusFilter = "Total Sales" | "Paid" | "Unpaid" | "Cancelled";
type DateFilterOption =
  | "Today" | "Yesterday" | "This Week" | "Last Week" | "Last 7 Days"
  | "This Month" | "Previous Month" | "Last 30 Days" | "This Quarter"
  | "Previous Quarter" | "Current Fiscal Year" | "Previous Fiscal Year"
  | "Last 365 Days" | "Custom";

// ─── Derived helpers ──────────────────────────────────────────────────────────
function calcTotal(inv: SalesInvoice): number {
  const itemsTotal = inv.billItems.reduce((s, i) => s + i.amount, 0);
  const chargesTotal = inv.additionalCharges.reduce((s, c) => s + c.amount, 0);
  const taxable = itemsTotal + chargesTotal;
  const discVal = taxable * (inv.discountPct / 100) + inv.discountAmt;
  const afterDisc = taxable - discVal;
  const tcsBase = inv.tcsBase === "Total Amount" ? afterDisc : taxable;
  const tcs = inv.applyTCS ? tcsBase * (inv.tcsRate / 100) : 0;
  return Math.round((afterDisc + tcs + inv.roundOffAmt) * 100) / 100;
}
function calcUnpaid(inv: SalesInvoice): number {
  return Math.max(0, calcTotal(inv) - inv.amountReceived);
}
function dueInLabel(inv: SalesInvoice): string | null {
  if (!inv.showDueDate || !inv.dueDate) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(inv.dueDate); due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return `${Math.abs(diff)} Days overdue`;
  if (diff === 0) return "Due Today";
  return `${diff} Days`;
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtCurrency(n: number) {
  return "₹ " + n.toLocaleString("en-IN", { maximumFractionDigits: 1 });
}

function getDateRange(filter: DateFilterOption): { start: Date; end: Date } {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const end = new Date(today); end.setHours(23, 59, 59, 999);
  switch (filter) {
    case "Today": return { start: today, end };
    case "Yesterday": { const y = new Date(today); y.setDate(y.getDate() - 1); const ye = new Date(y); ye.setHours(23, 59, 59, 999); return { start: y, end: ye }; }
    case "This Week": { const s = new Date(today); s.setDate(s.getDate() - s.getDay()); return { start: s, end }; }
    case "Last Week": { const s = new Date(today); s.setDate(s.getDate() - s.getDay() - 7); const e = new Date(s); e.setDate(e.getDate() + 6); e.setHours(23, 59, 59, 999); return { start: s, end: e }; }
    case "Last 7 Days": { const s = new Date(today); s.setDate(s.getDate() - 6); return { start: s, end }; }
    case "This Month": return { start: new Date(today.getFullYear(), today.getMonth(), 1), end };
    case "Previous Month": { const s = new Date(today.getFullYear(), today.getMonth() - 1, 1); const e = new Date(today.getFullYear(), today.getMonth(), 0); e.setHours(23, 59, 59, 999); return { start: s, end: e }; }
    case "Last 30 Days": { const s = new Date(today); s.setDate(s.getDate() - 29); return { start: s, end }; }
    case "This Quarter": { const qs = Math.floor(today.getMonth() / 3) * 3; return { start: new Date(today.getFullYear(), qs, 1), end }; }
    case "Previous Quarter": { const qs = Math.floor(today.getMonth() / 3) * 3 - 3; const s = new Date(today.getFullYear(), qs, 1); const e = new Date(today.getFullYear(), qs + 3, 0); e.setHours(23, 59, 59, 999); return { start: s, end: e }; }
    case "Current Fiscal Year": { const fy = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1; return { start: new Date(fy, 3, 1), end }; }
    case "Previous Fiscal Year": { const fy = today.getMonth() >= 3 ? today.getFullYear() - 1 : today.getFullYear() - 2; const s = new Date(fy, 3, 1); const e = new Date(fy + 1, 2, 31); e.setHours(23, 59, 59, 999); return { start: s, end: e }; }
    case "Last 365 Days": { const s = new Date(today); s.setDate(s.getDate() - 364); return { start: s, end }; }
    default: return { start: new Date(0), end };
  }
}

const DATE_OPTIONS: DateFilterOption[] = [
  "Today", "Yesterday", "This Week", "Last Week", "Last 7 Days",
  "This Month", "Previous Month", "Last 30 Days", "This Quarter",
  "Previous Quarter", "Current Fiscal Year", "Previous Fiscal Year",
  "Last 365 Days", "Custom",
];

// ─── Calendar ─────────────────────────────────────────────────────────────────
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalPicker({ startDate, endDate, onSelect, onClose }: {
  startDate: string; endDate: string;
  onSelect: (s: string, e: string) => void;
  onClose: () => void;
}) {
  const today = new Date();
  const [vm, setVm] = useState(today.getMonth());
  const [vy, setVy] = useState(today.getFullYear());
  const [picking, setPicking] = useState<"start" | "end">("start");
  const [ls, setLs] = useState(startDate);
  const [le, setLe] = useState(endDate);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const dim = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const fdo = (m: number, y: number) => new Date(y, m, 1).getDay();
  const cells = [...Array(fdo(vm, vy)).fill(null), ...Array.from({ length: dim(vm, vy) }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  function ds(d: number) { return `${vy}-${String(vm + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`; }
  function clickDay(d: number) {
    const s = ds(d);
    if (picking === "start") { setLs(s); setLe(""); setPicking("end"); }
    else { if (s < ls) { setLe(ls); setLs(s); } else setLe(s); setPicking("start"); }
  }
  function inRange(d: number) { const s = ds(d); return ls && le && s > ls && s < le; }
  return (
    <div ref={ref} className="sil-cal-popup">
      <div className="sil-cal-header-row">
        <span className={`sil-cal-tab${picking === "start" ? " sil-cal-tab--active" : ""}`} onClick={() => setPicking("start")}>Select Start Date</span>
        <span className={`sil-cal-tab${picking === "end" ? " sil-cal-tab--active" : ""}`} onClick={() => setPicking("end")}>Select End Date</span>
      </div>
      <div className="sil-cal-nav">
        <div className="sil-cal-nav-group">
          <button onClick={() => { if (vm === 0) { setVm(11); setVy(y => y - 1); } else setVm(m => m - 1); }}>‹</button>
          <span>{MONTHS[vm]}</span>
          <button onClick={() => { if (vm === 11) { setVm(0); setVy(y => y + 1); } else setVm(m => m + 1); }}>›</button>
        </div>
        <div className="sil-cal-nav-group">
          <button onClick={() => setVy(y => y - 1)}>‹</button><span>{vy}</span><button onClick={() => setVy(y => y + 1)}>›</button>
        </div>
      </div>
      <div className="sil-cal-grid">
        {DAYS_OF_WEEK.map(d => <div key={d} className="sil-cal-dh">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const s = ds(day);
          return (
            <button key={i}
              className={`sil-cal-day${s === ls || s === le ? " sil-cal-day--sel" : ""}${inRange(day) ? " sil-cal-day--range" : ""}`}
              onClick={() => clickDay(day)}>{day}</button>
          );
        })}
      </div>
      <div className="sil-cal-footer">
        <button className="sil-cal-cancel" onClick={onClose}>CANCEL</button>
        <button className="sil-cal-ok" onClick={() => { if (ls && le) { onSelect(ls, le); onClose(); } }}>OK</button>
      </div>
    </div>
  );
}

// ─── Row Action Menu ──────────────────────────────────────────────────────────
const Icons = {
  Edit: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>),
  History: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/><polyline points="12 7 12 12 15 15"/></svg>),
  Duplicate: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>),
  CreditNote: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>),
  Cancel: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>),
  Delete: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>),
};

function RowMenu({ onEdit, onDuplicate, onCreditNote, onCancel, onDelete }: {
  onEdit: () => void; onDuplicate: () => void;
  onCreditNote: () => void; onCancel: () => void; onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const items = [
    { Icon: Icons.Edit, label: "Edit", action: onEdit },
    { Icon: Icons.Duplicate, label: "Duplicate", action: onDuplicate },
    { Icon: Icons.CreditNote, label: "Issue Credit Note", action: onCreditNote, badge: true },
    { Icon: Icons.Cancel, label: "Cancel Invoice", action: onCancel, warning: true },
    { Icon: Icons.Delete, label: "Delete", action: onDelete, danger: true },
  ];
  return (
    <div ref={ref} className="sil-row-menu">
      <button className="sil-row-menu-btn" onClick={e => { e.stopPropagation(); setOpen(!open); }}>
        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}>
          <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
      {open && (
        <div className="sil-row-dropdown">
          {items.map((item, i) => (
            <div key={item.label}>
              {i === items.length - 1 && <div className="sil-row-sep" />}
              <button
                className={`sil-row-item${(item as any).warning ? " sil-row-item--warning" : ""}`}
                onClick={() => { item.action(); setOpen(false); }}>
                <span className="sil-row-icon"><item.Icon /></span>
                <span>{item.label}</span>
                {(item as any).badge && <span className="sil-badge-new" style={{ marginLeft: "auto" }}>New</span>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SalesInvoiceList() {
  const navigate = useNavigate();

  // ── Data state ────────────────────────────────────────────────────
  const [invoices, setInvoices]       = useState<SalesInvoice[]>([]);
  const [loading,  setLoading]        = useState(true);
  const [apiError, setApiError]       = useState<string | null>(null);
  const [totalCount, setTotalCount]   = useState(0);
  const [page, setPage]               = useState(1);
  const PAGE_SIZE = 50;

  // Summary stats (from /invoices/summary)
  const [summaryStats, setSummaryStats] = useState({
    totalSales: 0, totalPaid: 0, totalUnpaid: 0, totalCancelled: 0,
  });

  // ── Filter / sort state ───────────────────────────────────────────
  const [statusFilter,  setStatusFilter]  = useState<StatusFilter>("Total Sales");
  const [dateFilter,    setDateFilter]    = useState<DateFilterOption>("Last 365 Days");
  const [customStart,   setCustomStart]   = useState("");
  const [customEnd,     setCustomEnd]     = useState("");
  const [showDateDrop,  setShowDateDrop]  = useState(false);
  const [showCal,       setShowCal]       = useState(false);
  const [search,        setSearch]        = useState("");
  const [showSearch,    setShowSearch]    = useState(false);
  const [showReports,   setShowReports]   = useState(false);
  const [showSettings,  setShowSettings]  = useState(false);
  const [showBulkMenu,  setShowBulkMenu]  = useState(false);
  const [selected,      setSelected]      = useState<Set<string>>(new Set());
  const [sortDir,       setSortDir]       = useState<"asc" | "desc">("desc");

  // ── Modal state ───────────────────────────────────────────────────
  const [deleteTarget,            setDeleteTarget]            = useState<string | null>(null);
  const [cancelTarget,            setCancelTarget]            = useState<string | null>(null);
  const [cancelReason,            setCancelReason]            = useState("");
  const [showCancelReasonDrop,    setShowCancelReasonDrop]    = useState(false);
  const [cancelLoading,           setCancelLoading]           = useState(false);
  const [showBulkDownload,        setShowBulkDownload]        = useState(false);
  const [sortField,               setSortField]               = useState<"date" | "amount">("date");
  const [profitInvoice,           setProfitInvoice]           = useState<SalesInvoice | null>(null);
  const [viewInvoiceId,           setViewInvoiceId]           = useState<string | null>(null);
  const [viewInvoiceFull,         setViewInvoiceFull]         = useState<SalesInvoice | null>(null);

  const reportsRef = useRef<HTMLDivElement>(null);
  const bulkRef    = useRef<HTMLDivElement>(null);
  const dateRef    = useRef<HTMLDivElement>(null);

  // ── Active template (for InvoiceViewModal theming) ────────────────
  const [activeTemplate] = useState<any | null>(() => {
    try { return JSON.parse(localStorage.getItem("activeInvoiceTemplate") || "null"); } catch { return null; }
  });

  const defaultBusiness = {
    companyName: "Mondal Electronics Concern",
    address: " Kumillapara , P.O: Sapuipara, Bally, Howrah, 711227",
    gstin: "19AABCM1234R1ZX", phone: "06289909521",
    email: "rakeshranjantiwari11@gmail.com", pan: "AABCM1234R",
    bank: "SBI - 1234567890", ifsc: "SBIN0001234",
  };

  // ── Build API query params from current filter state ──────────────
  function buildParams(): GetInvoicesParams {
    const params: GetInvoicesParams = {
      page,
      limit:     PAGE_SIZE,
      search:    search || undefined,
      sortField,
      sortDir,
    };

    // Status filter → backend status
    if (statusFilter === "Paid")      params.status = "PAID";
    if (statusFilter === "Unpaid")    params.status = "OPEN,PARTIAL";
    if (statusFilter === "Cancelled") params.status = "CANCELLED";

    // Date range
    if (dateFilter === "Custom" && customStart && customEnd) {
      params.from = customStart;
      params.to   = customEnd;
    } else if (dateFilter !== "Custom") {
      const { start, end } = getDateRange(dateFilter);
      params.from = start.toISOString().split("T")[0];
      params.to   = end.toISOString().split("T")[0];
    }
    return params;
  }

  // ── Fetch invoices from backend ───────────────────────────────────
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await getInvoices(buildParams());
      const fe = (data.invoices as SaleInvoice[]).map((inv: SaleInvoice) => fromSaleInvoice(inv) as unknown as SalesInvoice);
      // Client-side filter: covers cases where backend does not filter by search
      const q = search.trim().toLowerCase();
      const filtered = q
        ? fe.filter(inv =>
            (inv.invoiceNo   ?? "").toLowerCase().includes(q) ||
            (inv.party?.name ?? "").toLowerCase().includes(q)
          )
        : fe;
      setInvoices(filtered);
      setTotalCount(q ? filtered.length : data.total);
    } catch (e: any) {
      setApiError(e.message ?? "Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter, customStart, customEnd, search, page, sortDir]);

  // ── Fetch summary stats ───────────────────────────────────────────
  const fetchSummary = useCallback(async () => {
    try {
      const res = await getInvoiceSummary() as any;
      // Backend returns { success: true, data: { totalInvoiced, ... } }
      // Unwrap .data if present, otherwise fall back to the root object
      const s = res?.data ?? res;
      setSummaryStats({
        totalSales:     s.totalInvoiced    ?? s.totalSales    ?? 0,
        totalPaid:      s.totalReceived    ?? s.totalPaid     ?? 0,
        totalUnpaid:    s.totalOutstanding ?? s.totalUnpaid   ?? 0,
        totalCancelled: s.totalCancelled   ?? 0,
      });
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);
  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  // Close dropdowns on outside click
  useEffect(() => {
    function h(e: MouseEvent) {
      if (reportsRef.current && !reportsRef.current.contains(e.target as Node)) setShowReports(false);
      if (bulkRef.current    && !bulkRef.current.contains(e.target as Node))    setShowBulkMenu(false);
      if (dateRef.current    && !dateRef.current.contains(e.target as Node))    setShowDateDrop(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Select helpers ────────────────────────────────────────────────
  const allSelected = invoices.length > 0 && invoices.every(i => selected.has(i.id));
  function toggleAll() { allSelected ? setSelected(new Set()) : setSelected(new Set(invoices.map(i => i.id))); }
  function toggleOne(id: string) { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s); }

  // ── Cancel invoice ────────────────────────────────────────────────
  async function handleCancel(id: string) {
    setCancelLoading(true);
    try {
      await apiCancelInvoice(id);
      setCancelTarget(null);
      setCancelReason("");
      await fetchInvoices();
      await fetchSummary();
    } catch (e: any) {
      setApiError(e.message ?? "Failed to cancel invoice.");
      setCancelTarget(null);
    } finally {
      setCancelLoading(false);
    }
  }

  // ── Delete invoice ───────────────────────────────────────────────
  async function handleDelete(id: string) {
    try {
      await apiDeleteInvoice(id);
      setDeleteTarget(null);
      await fetchInvoices();
      await fetchSummary();
    } catch (e: any) {
      setApiError(e.message ?? "Failed to delete invoice.");
      setDeleteTarget(null);
    }
  }

  // ── Duplicate invoice ─────────────────────────────────────────────
  async function handleDuplicate(inv: SalesInvoice) {
    try {
      // Build a create payload from the invoice, then post it
      const fullFe = inv as any;
      if (!fullFe.party) { setApiError("Cannot duplicate: party info missing."); return; }
      const payload = toCreatePayload(fullFe);
      payload.receivedAmount = 0; // reset payment
      await createInvoice(payload);
      await fetchInvoices();
      await fetchSummary();
    } catch (e: any) {
      setApiError(e.message ?? "Failed to duplicate invoice.");
    }
  }

  const dateLabel = dateFilter === "Custom" && customStart && customEnd
    ? `${fmtDate(customStart)} – ${fmtDate(customEnd)}`
    : dateFilter;

  const uniqueParties = [...new Set(invoices.map(i => i.party?.name).filter(Boolean))] as string[];

  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="sil-page">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="sil-header">
        <h1 className="sil-title">Sales Invoices</h1>
        <div className="sil-header-actions">
          {/* <div ref={reportsRef} className="sil-reports-wrap">
            <button className="sil-reports-btn" onClick={() => setShowReports(!showReports)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
              Reports
              <svg className="sil-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {showReports && (
              <div className="sil-dropdown">
                {["Sales Summary", "GSTR-1 (Sales)", "DayBook", "Bill Wise Profit"].map(r => (
                  <button key={r} className="sil-drop-item" onClick={() => setShowReports(false)}>{r}</button>
                ))}
              </div>
            )}
          </div>
          <button className="sil-icon-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><polyline points="3 9 12 15 21 9" /></svg>
          </button> */}
        </div>
      </div>

      {/* ── API Error banner ──────────────────────────────────────── */}
      {apiError && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", padding: "10px 20px", margin: "0 0 12px", borderRadius: 8, fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>⚠ {apiError}</span>
          <button onClick={() => setApiError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 16 }}>✕</button>
        </div>
      )}

      {/* ── Stat Cards ────────────────────────────────────────────── */}
      <div className="sil-stats">
        {([
          { label: "Total Sales", value: summaryStats.totalSales,     key: "Total Sales", color: "#4f46e5" },
          { label: "Paid",        value: summaryStats.totalPaid,      key: "Paid",        color: "#16a34a" },
          { label: "Unpaid",      value: summaryStats.totalUnpaid,    key: "Unpaid",      color: "#dc2626" },
          { label: "Cancelled",   value: summaryStats.totalCancelled, key: "Cancelled",   color: "#6b7280" },
        ] as { label: string; value: number; key: StatusFilter; color: string }[]).map(card => (
          <button key={card.key}
            className={`sil-stat-card${statusFilter === card.key ? " sil-stat-card--active" : ""}`}
            onClick={() => { setStatusFilter(card.key); setPage(1); }}>
            <div className="sil-stat-label" style={{ color: card.color }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              {card.label}
            </div>
            <div className="sil-stat-value">{card.value > 0 ? fmtCurrency(card.value) : "₹ –"}</div>
          </button>
        ))}
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────── */}
      <div className="sil-toolbar">
        <div className="sil-toolbar-left">
          <div className="sil-search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sil-search-icon"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input className="sil-search-input" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by invoice no. or party…" />
            {search && (
              <button className="sil-search-clear" onClick={() => { setSearch(""); setPage(1); }}>✕</button>
            )}
          </div>
          <div ref={dateRef} className="sil-date-wrap">
            <button className="sil-date-btn" onClick={() => setShowDateDrop(!showDateDrop)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              {dateLabel}
              <svg className="sil-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {showDateDrop && (
              <div className="sil-date-dropdown">
                {DATE_OPTIONS.map(opt => (
                  <button key={opt} className={`sil-date-item${dateFilter === opt ? " sil-date-item--active" : ""}`}
                    onClick={() => {
                      setDateFilter(opt); setPage(1);
                      if (opt === "Custom") { setShowCal(true); setShowDateDrop(false); }
                      else setShowDateDrop(false);
                    }}>{opt}</button>
                ))}
              </div>
            )}
            {showCal && <CalPicker startDate={customStart} endDate={customEnd}
              onSelect={(s, e) => { setCustomStart(s); setCustomEnd(e); setPage(1); }}
              onClose={() => setShowCal(false)} />}
          </div>
        </div>
        <div className="sil-toolbar-right">
          {selected.size > 0 && (
            <span className="sil-selected-tag">
              {selected.size} Invoice{selected.size > 1 ? "s" : ""} Selected
              <button onClick={() => setSelected(new Set())}>✕</button>
            </span>
          )}
          <div ref={bulkRef} className="sil-bulk-wrap">
            <button className="sil-bulk-btn" onClick={() => setShowBulkMenu(!showBulkMenu)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
              Bulk Actions
              <svg className="sil-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {showBulkMenu && (
              <div className="sil-dropdown">
                <button className="sil-drop-item" onClick={() => {
                  const ids = Array.from(selected);
                  const todown = invoices.filter(inv => ids.includes(inv.id));
                  const csv = ["Invoice No,Party,Date,Status,Amount",
                    ...todown.map(inv => `${inv.invoiceNo},${inv.party?.name || ""},${inv.invoiceDate},${inv.status},${calcTotal(inv)}`)
                  ].join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url; a.download = `invoices_${Date.now()}.csv`; a.click();
                  URL.revokeObjectURL(url);
                  setShowBulkMenu(false);
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  Download CSV
                </button>
              </div>
            )}
          </div>
          <button className="sil-create-btn" onClick={() => navigate("/cashier/sales-invoice")}>
            Create Sales Invoice
          </button>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────── */}
      <div className="sil-table-wrap">
        {loading ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
            Loading invoices…
          </div>
        ) : (
          <table className="sil-table">
            <thead>
              <tr>
                <th className="sil-th sil-th--cb"><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
                <th className="sil-th sil-th--sortable" onClick={() => { setSortField("date"); setSortDir(d => d === "asc" ? "desc" : "asc"); setPage(1); }}>
                  Date {sortDir === "asc" ? "↑" : "↓"}
                </th>
                <th className="sil-th">Invoice Number</th>
                <th className="sil-th">Party Name</th>
                <th className="sil-th">Due In</th>
                <th className="sil-th sil-th--sortable" onClick={() => { setSortField("amount"); setSortDir(d => d === "asc" ? "desc" : "asc"); setPage(1); }}>
                  Amount {sortField === "amount" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                <th className="sil-th">Status</th>
                <th className="sil-th" />
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr><td colSpan={8} className="sil-empty">
                  <svg viewBox="0 0 80 80" fill="none" style={{ width: 64, height: 64, marginBottom: 12 }}>
                    <rect x="10" y="15" width="50" height="50" rx="4" stroke="#d1d5db" strokeWidth="2" />
                    <line x1="18" y1="30" x2="52" y2="30" stroke="#d1d5db" strokeWidth="1.5" />
                    <line x1="18" y1="40" x2="40" y2="40" stroke="#d1d5db" strokeWidth="1.5" />
                    <line x1="18" y1="50" x2="45" y2="50" stroke="#d1d5db" strokeWidth="1.5" />
                    <line x1="48" y1="54" x2="60" y2="66" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="60" y1="54" x2="48" y2="66" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <span>No invoices found for the current filter</span>
                </td></tr>
              ) : invoices.map(inv => {
                const total = calcTotal(inv);
                const unpaid = calcUnpaid(inv);
                const dueLabel = dueInLabel(inv);
                return (
                  <tr key={inv.id} className="sil-tr" onClick={() => { setViewInvoiceId(inv.id); setViewInvoiceFull(inv); }}>
                    <td className="sil-td sil-td--cb" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(inv.id)} onChange={() => toggleOne(inv.id)} />
                    </td>
                    <td className="sil-td">{fmtDate(inv.invoiceDate)}</td>
                    <td className="sil-td">{inv.invoiceNo}</td>
                    <td className="sil-td">{inv.party?.name ?? "–"}</td>
                    <td className="sil-td">{dueLabel ?? "–"}</td>
                    <td className="sil-td">
                      <div>{fmtCurrency(total)}</div>
                      {unpaid > 0 && <div className="sil-unpaid-sub">(₹ {unpaid.toLocaleString("en-IN", { maximumFractionDigits: 1 })} unpaid)</div>}
                    </td>
                    <td className="sil-td">
                      <span className={`sil-status sil-status--${inv.status.toLowerCase().replace(" ", "-")}`}>{inv.status}</span>
                    </td>
                    <td className="sil-td sil-td--menu" onClick={e => e.stopPropagation()}>
                      <RowMenu
                        onEdit={() => navigate(`/cashier/sales-invoice/edit/${inv.id}`)}
                        onDuplicate={() => handleDuplicate(inv)}
                        onCreditNote={() => navigate("/cashier/credit-note", { state: { fromInvoice: inv } })}
                        onCancel={() => { setCancelTarget(inv.id); setCancelReason(""); }}
                        onDelete={() => setDeleteTarget(inv.id)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ────────────────────────────────────────────── */}
      {totalCount > PAGE_SIZE && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, padding: "16px 0", fontSize: 13, color: "#374151" }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            style={{ padding: "6px 14px", border: "1px solid #e5e7eb", borderRadius: 6, background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer", color: page === 1 ? "#d1d5db" : "#374151" }}>
            ← Prev
          </button>
          <span>Page {page} of {Math.ceil(totalCount / PAGE_SIZE)}</span>
          <button disabled={page >= Math.ceil(totalCount / PAGE_SIZE)} onClick={() => setPage(p => p + 1)}
            style={{ padding: "6px 14px", border: "1px solid #e5e7eb", borderRadius: 6, background: "#fff", cursor: page >= Math.ceil(totalCount / PAGE_SIZE) ? "not-allowed" : "pointer", color: page >= Math.ceil(totalCount / PAGE_SIZE) ? "#d1d5db" : "#374151" }}>
            Next →
          </button>
        </div>
      )}

      {/* ── Delete Invoice Modal ────────────────────────────────────── */}
      {deleteTarget && (
        <div className="sil-overlay" onClick={() => setDeleteTarget(null)}>
          <div style={{ background:"#fff", borderRadius:16, width:500, maxWidth:"95vw", padding:"32px 32px 24px", boxShadow:"0 20px 60px rgba(0,0,0,.18)", position:"relative" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setDeleteTarget(null)} style={{ position:"absolute", top:18, right:18, background:"none", border:"none", fontSize:18, cursor:"pointer", color:"#6b7280" }}>✕</button>
            <h3 style={{ fontSize:18, fontWeight:700, color:"#111827", margin:"0 0 8px" }}>Delete this Sales Invoice?</h3>
            <p style={{ fontSize:14, color:"#6b7280", margin:"0 0 28px" }}>Once deleted, it cannot be recovered.</p>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:12 }}>
              <button onClick={() => setDeleteTarget(null)} style={{ padding:"10px 28px", border:"1px solid #e5e7eb", background:"#fff", borderRadius:8, fontSize:14, cursor:"pointer", fontWeight:500, color:"#374151" }}>Cancel</button>
              <button onClick={() => handleDelete(deleteTarget)} style={{ padding:"10px 28px", border:"1.5px solid #dc2626", background:"#fff", borderRadius:8, fontSize:14, cursor:"pointer", fontWeight:600, color:"#dc2626" }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Invoice Modal ───────────────────────────────────── */}
      {cancelTarget && (
        <div className="sil-overlay" onClick={() => { setCancelTarget(null); setShowCancelReasonDrop(false); }}>
          <div style={{ background: "#fff", borderRadius: 16, width: 500, maxWidth: "95vw", padding: "28px 28px 24px", boxShadow: "0 20px 60px rgba(0,0,0,.18)", position: "relative", fontFamily: "DM Sans, sans-serif" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => { setCancelTarget(null); setShowCancelReasonDrop(false); }} style={{ position: "absolute", top: 18, right: 18, background: "none", border: "1px solid #e5e7eb", borderRadius: 6, width: 28, height: 28, cursor: "pointer", color: "#6b7280", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>Cancel this invoice?</h3>
            <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 20px" }}>Cancellation is irreversible. Stock will be restored and ledger entries reversed.</p>
            <label style={{ fontSize: 13, color: "#374151", fontWeight: 500, display: "block", marginBottom: 6 }}>Reason <span style={{ color: "#ef4444" }}>*</span></label>
            <div style={{ position: "relative", marginBottom: 16 }}>
              <div onClick={() => setShowCancelReasonDrop(v => !v)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", border: `1px solid ${showCancelReasonDrop ? "#6366f1" : "#e5e7eb"}`, borderRadius: 8, cursor: "pointer", fontSize: 14, color: cancelReason ? "#111827" : "#9ca3af", background: "#fff", userSelect: "none" }}>
                <span>{cancelReason || "Select"}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, color: "#9ca3af" }}><polyline points="6 9 12 15 18 9" /></svg>
              </div>
              {showCancelReasonDrop && (
                <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 100, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,.1)", overflow: "hidden" }}>
                  {["Order Cancelled", "Duplicate entry", "Wrong entry", "Other"].map(r => (
                    <div key={r} onClick={() => { setCancelReason(r); setShowCancelReasonDrop(false); }}
                      style={{ padding: "11px 14px", fontSize: 14, color: "#374151", cursor: "pointer", borderBottom: "1px solid #f9fafb", background: cancelReason === r ? "#ede9fe" : "" }}>
                      {r}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button onClick={() => { setCancelTarget(null); setShowCancelReasonDrop(false); }}
                style={{ padding: "10px 24px", border: "1px solid #e5e7eb", background: "#fff", borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#374151" }}>
                Close
              </button>
              <button disabled={!cancelReason || cancelLoading} onClick={() => handleCancel(cancelTarget)}
                style={{ padding: "10px 24px", background: cancelReason && !cancelLoading ? "#6366f1" : "#e5e7eb", border: "none", borderRadius: 8, fontSize: 14, cursor: cancelReason && !cancelLoading ? "pointer" : "not-allowed", fontWeight: 600, color: cancelReason && !cancelLoading ? "#fff" : "#9ca3af" }}>
                {cancelLoading ? "Cancelling…" : "Cancel Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Invoice View Modal ─────────────────────────────────────── */}
      {viewInvoiceFull && (
        <InvoiceViewModal
          invoice={viewInvoiceFull as any}
          template={activeTemplate}
          business={defaultBusiness}
          onClose={() => { setViewInvoiceFull(null); setViewInvoiceId(null); }}
          onEdit={() => { setViewInvoiceFull(null); navigate(`/cashier/sales-invoice/edit/${viewInvoiceFull.id}`); }}
          onPrint={() => window.print()}
          onDownload={() => {
            const inv = viewInvoiceFull;
            const csv = `Invoice No,Party,Date,Status,Amount\n${inv.invoiceNo},${inv.party?.name || ""},${inv.invoiceDate},${inv.status},${calcTotal(inv)}`;
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = `invoice_${inv.invoiceNo}.csv`; a.click();
            URL.revokeObjectURL(url);
          }}
          onPaymentSaved={async () => {
            await fetchInvoices();
            await fetchSummary();
          }}
          onDuplicate={() => { handleDuplicate(viewInvoiceFull); setViewInvoiceFull(null); }}
          onCancel={() => { setViewInvoiceFull(null); setCancelTarget(viewInvoiceFull.id); setCancelReason(""); }}
          onCreditNote={() => { setViewInvoiceFull(null); navigate("/cashier/credit-note", { state: { fromInvoice: viewInvoiceFull } }); }}
          onProfitDetails={() => { }}
        />
      )}
    </div>
  );
}
