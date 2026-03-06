import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Proformainvoice.css";
import CreateProformaInvoice from "./Createproformainvoice";
import ProformaInvoiceViewModal from "./Proformainvoiceviewmodal";

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
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
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

const IconHistory = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
    <polyline points="12 7 12 12 15 14"/>
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
    <path d="M10 11v6"/>
    <path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
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

// ─── Types ───────────────────────────────────────────────────────────────────

// Full invoice data stored per-row so Edit/Duplicate can pre-fill the form
interface FullInvoiceData {
  party: any | null;
  invoiceDate: string;
  paymentTerms: number | "";
  expiryDate: string;
  showPaymentTerms: boolean;
  eWayBill: string;
  challanNo: string;
  financedBy: string;
  salesman: string;
  emailId: string;
  warrantyPeriod: string;
  lineItems: any[];
  notes: string;
  terms: string;
  showNotes: boolean;
  showTerms: boolean;
  charges: any[];
  showCharges: boolean;
  discountType: "Discount After Tax" | "Discount Before Tax";
  discountPct: number;
  discountAmt: number;
  showDiscount: boolean;
  adjustType: "+ Add" | "- Reduce";
  adjustAmt: number;
  autoRound: boolean;
  totalAmount: number;
}

interface Invoice {
  id: number;
  date: string;
  proformaNumber: number;
  partyName: string;
  dueIn: string;
  amount: number;
  status: "Open" | "Closed";
  fullData?: FullInvoiceData; // stored on save so Edit/Duplicate can restore all fields
}

type DateFilterOption =
  | "Today"
  | "Yesterday"
  | "This Week"
  | "Last Week"
  | "Last 7 Days"
  | "This Month"
  | "Previous Month"
  | "This Quarter"
  | "Previous Quarter"
  | "Current Fiscal Year"
  | "Previous Fiscal Year"
  | "Last 365 Days"
  | "Custom";

type StatusFilter = "Show All Invoices" | "Show Open Invoices" | "Show Closed Invoices";

interface CustomDateRange {
  start: Date | null;
  end: Date | null;
}

interface QuickSettings {
  prefixEnabled: boolean;
  prefix: string;
  sequenceNumber: number;
  showItemImage: boolean;
  priceHistory: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatDate = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const formatAmount = (n: number) => `₹ ${n.toLocaleString("en-IN")}`;

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

function getDateRange(option: DateFilterOption): { start: Date; end: Date } | null {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  switch (option) {
    case "Today":
      return { start: todayStart, end: today };
    case "Yesterday": {
      const y = new Date(todayStart); y.setDate(y.getDate() - 1);
      const ye = new Date(y); ye.setHours(23, 59, 59, 999);
      return { start: y, end: ye };
    }
    case "This Week": {
      const day = todayStart.getDay();
      const start = new Date(todayStart); start.setDate(start.getDate() - day);
      return { start, end: today };
    }
    case "Last Week": {
      const day = todayStart.getDay();
      const end = new Date(todayStart); end.setDate(end.getDate() - day - 1); end.setHours(23,59,59,999);
      const start = new Date(end); start.setDate(start.getDate() - 6); start.setHours(0,0,0,0);
      return { start, end };
    }
    case "Last 7 Days": {
      const start = new Date(todayStart); start.setDate(start.getDate() - 6);
      return { start, end: today };
    }
    case "This Month": {
      const start = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
      return { start, end: today };
    }
    case "Previous Month": {
      const start = new Date(todayStart.getFullYear(), todayStart.getMonth() - 1, 1);
      const end = new Date(todayStart.getFullYear(), todayStart.getMonth(), 0); end.setHours(23,59,59,999);
      return { start, end };
    }
    case "This Quarter": {
      const q = Math.floor(todayStart.getMonth() / 3);
      return { start: new Date(todayStart.getFullYear(), q * 3, 1), end: today };
    }
    case "Previous Quarter": {
      const q = Math.floor(todayStart.getMonth() / 3);
      const start = new Date(todayStart.getFullYear(), (q - 1) * 3, 1);
      const end = new Date(todayStart.getFullYear(), q * 3, 0); end.setHours(23,59,59,999);
      return { start, end };
    }
    case "Current Fiscal Year": {
      const fy = todayStart.getMonth() >= 3 ? todayStart.getFullYear() : todayStart.getFullYear() - 1;
      return { start: new Date(fy, 3, 1), end: today };
    }
    case "Previous Fiscal Year": {
      const fy = (todayStart.getMonth() >= 3 ? todayStart.getFullYear() : todayStart.getFullYear() - 1) - 1;
      const end = new Date(fy + 1, 2, 31); end.setHours(23,59,59,999);
      return { start: new Date(fy, 3, 1), end };
    }
    case "Last 365 Days": {
      const start = new Date(todayStart); start.setDate(start.getDate() - 364);
      return { start, end: today };
    }
    default: return null;
  }
}

function formatDateRangeLabel(option: DateFilterOption, custom: CustomDateRange): string {
  if (option === "Custom") {
    if (custom.start && custom.end) return `${formatDate(custom.start)} - ${formatDate(custom.end)}`;
    return "";
  }
  const range = getDateRange(option);
  if (!range) return "";
  return `${formatDate(range.start)} - ${formatDate(range.end)}`;
}

// ─── Initial Data ─────────────────────────────────────────────────────────────
const INITIAL_INVOICES: Invoice[] = [
  { id: 1, date: "2026-03-06", proformaNumber: 3, partyName: "Aditiya",   dueIn: "30 Days", amount: 512, status: "Closed" },
  { id: 2, date: "2026-03-02", proformaNumber: 2, partyName: "Cash Sale", dueIn: "-",       amount: 256, status: "Open"   },
  { id: 3, date: "2026-03-02", proformaNumber: 1, partyName: "anando",    dueIn: "26 Days", amount: 256, status: "Open"   },
];

// ─── Calendar Picker ──────────────────────────────────────────────────────────
const CalendarPicker: React.FC<{
  value: Date | null;
  onChange: (d: Date) => void;
  label: string;
}> = ({ value, onChange, label }) => {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(value ? value.getMonth() : today.getMonth());
  const [viewYear,  setViewYear]  = useState(value ? value.getFullYear() : today.getFullYear());

  const daysInMonth = getDaysInMonth(viewMonth, viewYear);
  const firstDay    = getFirstDayOfMonth(viewMonth, viewYear);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const isSelected = (day: number) =>
    !!value && value.getDate() === day && value.getMonth() === viewMonth && value.getFullYear() === viewYear;

  return (
    <div className="pi-calendar">
      <div className="pi-calendar-label">{label}</div>
      <div className="pi-calendar-nav">
        <button onClick={() => { const d = new Date(viewYear, viewMonth - 1); setViewMonth(d.getMonth()); setViewYear(d.getFullYear()); }}>‹</button>
        <span>{MONTH_NAMES[viewMonth]}</span>
        <button onClick={() => { const d = new Date(viewYear, viewMonth + 1); setViewMonth(d.getMonth()); setViewYear(d.getFullYear()); }}>›</button>
        <button onClick={() => setViewYear(v => v - 1)}>‹</button>
        <span>{viewYear}</span>
        <button onClick={() => setViewYear(v => v + 1)}>›</button>
      </div>
      <div className="pi-calendar-grid">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={d} className="pi-cal-header">{d}</div>
        ))}
        {cells.map((day, i) =>
          day === null ? (
            <div key={`e-${i}`} className="pi-cal-cell empty" />
          ) : (
            <button key={day} className={`pi-cal-cell${isSelected(day) ? " selected" : ""}`}
              onClick={() => onChange(new Date(viewYear, viewMonth, day))}>
              {day}
            </button>
          )
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ProformaInvoice: React.FC = () => {
  const navigate = useNavigate();

  // Persist invoices to localStorage so status changes (e.g. "Closed" after Convert)
  // survive navigation away from this page and back.
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem("proformaInvoices");
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  useEffect(() => {
    localStorage.setItem("proformaInvoices", JSON.stringify(invoices));
  }, [invoices]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Date filter
  const [dateFilter, setDateFilter]         = useState<DateFilterOption>("Last 365 Days");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [customRange, setCustomRange]       = useState<CustomDateRange>({ start: null, end: null });
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [pickingStage, setPickingStage]     = useState<"start" | "end">("start");
  const [tempCustom, setTempCustom]         = useState<CustomDateRange>({ start: null, end: null });
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  // Status filter — default to "Show All Invoices" so both Open and Closed rows
  // are always visible, including rows that were just converted via handleConvertToInvoice.
  const [statusFilter, setStatusFilter]       = useState<StatusFilter>("Show Open Invoices");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Row menu
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Quick settings
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<QuickSettings>({
    prefixEnabled: true, prefix: "", sequenceNumber: 4, showItemImage: true, priceHistory: false,
  });
  const [tempSettings, setTempSettings] = useState<QuickSettings>({ ...settings });

  // Page mode: null = list, "create" = new, "edit" = edit existing, "duplicate" = copy
  const [pageMode, setPageMode] = useState<null | "create" | "edit" | "duplicate">(null);
  const [activeInvoiceId, setActiveInvoiceId] = useState<number | null>(null);

  // View modal — opens when clicking a table row
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  // Edit History modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyInvoiceId, setHistoryInvoiceId] = useState<number | null>(null);

  // Outside click handler
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target as Node))
        setShowDateDropdown(false);
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node))
        setShowStatusDropdown(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filteredInvoices = invoices.filter(inv => {
    let inRange = true;
    if (dateFilter !== "Custom") {
      const range = getDateRange(dateFilter);
      if (range) { const d = new Date(inv.date); inRange = d >= range.start && d <= range.end; }
    } else if (customRange.start && customRange.end) {
      const d = new Date(inv.date); inRange = d >= customRange.start && d <= customRange.end;
    }
    const statusOk =
      statusFilter === "Show All Invoices" ||
      (statusFilter === "Show Open Invoices"   && inv.status === "Open") ||
      (statusFilter === "Show Closed Invoices" && inv.status === "Closed");
    const searchOk =
      !searchQuery ||
      inv.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(inv.proformaNumber).includes(searchQuery);
    return inRange && statusOk && searchOk;
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleDeleteInvoice = (id: number) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
    setOpenMenuId(null);
    setViewInvoice(null); // close view modal if open
  };

  // Convert to Sales Invoice: mark proforma as Closed, navigate to CreateSalesInvoice with data
  const handleConvertToInvoice = (inv: Invoice) => {
    // 1. Mark the row as Closed — it stays in the invoices array, only status changes
    setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: "Closed" as const } : i));

    // 2. ── THE FIX ──────────────────────────────────────────────────────────
    //    Reset the status filter to "Show All Invoices" so the newly-Closed row
    //    is NOT hidden when the user navigates back to this table.
    //    Without this line, a filter of "Show Open Invoices" causes the row to
    //    vanish because its status is now "Closed" and the filter excludes it.
    setStatusFilter("Show All Invoices");
    // ────────────────────────────────────────────────────────────────────────

    // 3. Close the view modal
    setViewInvoice(null);

    // 4. Build fromQuotation-style payload that CreateSalesInvoice understands
    const fd = inv.fullData;
    const fromProforma = {
      party: fd?.party || null,
      billItems: (fd?.lineItems || []).map((li: any) => ({
        rowId: `row-${Date.now()}-${Math.random()}`,
        itemId: li.item?.id || li.itemId || li.id || String(Math.random()),
        name: li.item?.name || li.name || li.itemName || "Item",
        description: li.description || "",
        hsn: li.item?.hsn || li.hsn || "",
        qty: li.qty || 1,
        unit: li.unit || li.item?.unit || "PCS",
        price: li.pricePerItem || li.price || li.rate || 0,
        discountPct: li.discountPct || 0,
        discountAmt: li.discountAmt || 0,
        taxLabel: li.taxLabel || "None",
        taxRate: li.taxRate ?? li.item?.taxRate ?? 0,
        amount: li.amount || 0,
      })),
      additionalCharges: fd?.charges || [],
      discountType: fd?.discountType || "Discount After Tax",
      discountPct: fd?.discountPct || 0,
      discountAmt: fd?.discountAmt || 0,
      notes: fd?.notes || "",
      termsConditions: fd?.terms || "",
      roundOff: "none",
      roundOffAmt: 0,
    };

    // 5. Navigate to the Sales Invoice create page with proforma data pre-filled
    navigate("/cashier/sales-invoice", { state: { fromQuotation: fromProforma } });
  };

  // Edit: open form pre-filled; Save updates same row
  const handleEdit = (id: number) => {
    setViewInvoice(null);
    setActiveInvoiceId(id);
    setPageMode("edit");
    setOpenMenuId(null);
  };

  // Duplicate: open form pre-filled; Save adds new row
  const handleDuplicate = (id: number) => {
    setViewInvoice(null);
    setActiveInvoiceId(id);
    setPageMode("duplicate");
    setOpenMenuId(null);
  };

  // Build FullInvoiceData from what CreateProformaInvoice passes back via invoiceData
  const extractFullData = (invoiceData: any): FullInvoiceData => ({
    party:            invoiceData.party            ?? null,
    invoiceDate:      invoiceData.date             ?? new Date().toISOString().split("T")[0],
    paymentTerms:     invoiceData.paymentTerms     ?? "",
    expiryDate:       invoiceData.expiryDate       ?? "",
    showPaymentTerms: invoiceData.showPaymentTerms ?? false,
    eWayBill:         invoiceData.eWayBill         ?? "",
    challanNo:        invoiceData.challanNo        ?? "",
    financedBy:       invoiceData.financedBy       ?? "",
    salesman:         invoiceData.salesman         ?? "",
    emailId:          invoiceData.emailId          ?? "",
    warrantyPeriod:   invoiceData.warrantyPeriod   ?? "",
    lineItems:        invoiceData.lineItems        ?? [],
    notes:            invoiceData.notes            ?? "",
    terms:            invoiceData.terms            ?? "",
    showNotes:        invoiceData.showNotes        ?? false,
    showTerms:        invoiceData.showTerms        ?? false,
    charges:          invoiceData.charges          ?? [],
    showCharges:      invoiceData.showCharges      ?? false,
    discountType:     invoiceData.discountType     ?? "Discount After Tax",
    discountPct:      invoiceData.discountPct      ?? 0,
    discountAmt:      invoiceData.discountAmt      ?? 0,
    showDiscount:     invoiceData.showDiscount     ?? false,
    adjustType:       invoiceData.adjustType       ?? "+ Add",
    adjustAmt:        invoiceData.adjustAmt        ?? 0,
    autoRound:        invoiceData.autoRound        ?? false,
    totalAmount:      invoiceData.totalAmount      ?? 0,
  });

  // Edit save → update existing row in-place
  const handleEditSave = (invoiceData: any) => {
    if (activeInvoiceId == null) return;
    setInvoices(prev => prev.map(inv =>
      inv.id === activeInvoiceId
        ? {
            ...inv,
            date:      invoiceData.date ?? inv.date,
            partyName: invoiceData.party?.name ?? inv.partyName,
            amount:    invoiceData.totalAmount ?? 0,
            fullData:  extractFullData(invoiceData),
          }
        : inv
    ));
    setPageMode(null);
    setActiveInvoiceId(null);
  };

  // Duplicate save → add brand new row
  const handleDuplicateSave = (invoiceData: any) => {
    const maxNum = invoices.length ? Math.max(...invoices.map(i => i.proformaNumber)) : 0;
    setInvoices(prev => [
      {
        id:             Date.now(),
        date:           invoiceData.date ?? new Date().toISOString().split("T")[0],
        proformaNumber: maxNum + 1,
        partyName:      invoiceData.party?.name ?? "Cash Sale",
        dueIn:          "-",
        amount:         invoiceData.totalAmount ?? 0,
        status:         "Open" as const,
        fullData:       extractFullData(invoiceData),
      },
      ...prev,
    ]);
    setSettings(prev => ({ ...prev, sequenceNumber: prev.sequenceNumber + 1 }));
    setPageMode(null);
    setActiveInvoiceId(null);
  };

  // Create save → add new row
  const handleCreateSave = (invoiceData: any) => {
    const maxNum = invoices.length ? Math.max(...invoices.map(i => i.proformaNumber)) : 0;
    setInvoices(prev => [
      {
        id:             Date.now(),
        date:           invoiceData.date ?? new Date().toISOString().split("T")[0],
        proformaNumber: maxNum + 1,
        partyName:      invoiceData.party?.name ?? "Cash Sale",
        dueIn:          "-",
        amount:         invoiceData.totalAmount ?? 0,
        status:         "Open" as const,
        fullData:       extractFullData(invoiceData),
      },
      ...prev,
    ]);
    setSettings(prev => ({ ...prev, sequenceNumber: prev.sequenceNumber + 1 }));
    setPageMode(null);
  };

  const handleCreateSaveNew = (invoiceData: any) => {
    handleCreateSave(invoiceData);
    setPageMode("create");
  };

  const handleSettingsSave = () => { setSettings({ ...tempSettings }); setShowSettings(false); };

  const handleCustomDateOk = () => {
    if (tempCustom.start && tempCustom.end) { setCustomRange(tempCustom); setDateFilter("Custom"); }
    setShowCustomPicker(false);
    setShowDateDropdown(false);
  };

  const dateOptions: DateFilterOption[] = [
    "Today","Yesterday","This Week","Last Week","Last 7 Days",
    "This Month","Previous Month","This Quarter","Previous Quarter",
    "Current Fiscal Year","Previous Fiscal Year","Last 365 Days","Custom",
  ];

  // Resolve active invoice for edit/duplicate
  const activeInvoice = activeInvoiceId != null
    ? invoices.find(i => i.id === activeInvoiceId) ?? null
    : null;

  return (
    <>
      {/* ── Create page ── */}
      {pageMode === "create" && (
        <CreateProformaInvoice
          nextNumber={settings.sequenceNumber}
          settings={settings}
          isEdit={false}
          onSave={handleCreateSave}
          onSaveNew={handleCreateSaveNew}
          onBack={() => setPageMode(null)}
        />
      )}

      {/* ── Edit page — pre-filled, Update button, updates same row ── */}
      {pageMode === "edit" && activeInvoice && (
        <CreateProformaInvoice
          nextNumber={activeInvoice.proformaNumber}
          settings={settings}
          editData={activeInvoice.fullData ?? null}
          isEdit={true}
          onSave={handleEditSave}
          onSaveNew={handleEditSave}
          onBack={() => { setPageMode(null); setActiveInvoiceId(null); }}
        />
      )}

      {/* ── Duplicate page — pre-filled, Save adds new row ── */}
      {pageMode === "duplicate" && activeInvoice && (
        <CreateProformaInvoice
          nextNumber={settings.sequenceNumber}
          settings={settings}
          editData={activeInvoice.fullData ?? null}
          isEdit={false}
          onSave={handleDuplicateSave}
          onSaveNew={handleDuplicateSave}
          onBack={() => { setPageMode(null); setActiveInvoiceId(null); }}
        />
      )}

      {/* ── List (hidden while form is open) ── */}
      {pageMode === null && (
        <div className="pi-root">
          {/* ── Header ── */}
          <div className="pi-header">
            <h1 className="pi-title">Proforma Invoice</h1>
            <div className="pi-header-actions">
              <button className="pi-icon-btn" onClick={() => { setTempSettings({ ...settings }); setShowSettings(true); }} title="Settings">
                <IconSettings />
                <span className="pi-notification-dot" />
              </button>
              <button className="pi-icon-btn pi-msg-btn" title="Messages">
                <IconMail />
              </button>
            </div>
          </div>

          {/* ── Toolbar ── */}
          <div className="pi-toolbar">
            <div className="pi-toolbar-left">
              {/* Search */}
              <div className={`pi-search-wrap${showSearch ? " open" : ""}`}>
                <button className="pi-search-btn" onClick={() => setShowSearch(s => !s)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </button>
                {showSearch && (
                  <input autoFocus className="pi-search-input" placeholder="Search party, invoice…"
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    onBlur={() => { if (!searchQuery) setShowSearch(false); }} />
                )}
              </div>

              {/* Date filter */}
              <div className="pi-dropdown-wrap" ref={dateDropdownRef}>
                <button className={`pi-dropdown-btn${showDateDropdown ? " open" : ""}`}
                  onClick={() => setShowDateDropdown(s => !s)}>
                  <span className="pi-dropdown-icon"><IconCalendar /></span>
                  <span>{dateFilter}</span>
                  <span className="pi-caret"><IconChevronDown /></span>
                </button>
                {showDateDropdown && !showCustomPicker && (
                  <div className="pi-dropdown-menu pi-date-menu">
                    {dateOptions.map(opt => (
                      <button key={opt} className={`pi-dropdown-item${dateFilter === opt ? " active" : ""}`}
                        onClick={() => {
                          if (opt === "Custom") { setTempCustom({ start: null, end: null }); setPickingStage("start"); setShowCustomPicker(true); }
                          else { setDateFilter(opt); setShowDateDropdown(false); }
                        }}>
                        <span>{opt}</span>
                        {opt === dateFilter && opt !== "Custom" && (
                          <span className="pi-date-range-label">{formatDateRangeLabel(opt, customRange)}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {showDateDropdown && showCustomPicker && (
                  <div className="pi-custom-picker">
                    <div className="pi-custom-calendars">
                      <CalendarPicker label="Select Start Date" value={tempCustom.start}
                        onChange={d => { setTempCustom(prev => ({ ...prev, start: d })); setPickingStage("end"); }} />
                      <CalendarPicker label="Select End Date" value={tempCustom.end}
                        onChange={d => setTempCustom(prev => ({ ...prev, end: d }))} />
                    </div>
                    <div className="pi-custom-actions">
                      <button className="pi-btn-ghost" onClick={() => setShowCustomPicker(false)}>CANCEL</button>
                      <button className="pi-btn-primary-text" onClick={handleCustomDateOk}>OK</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Status filter */}
              <div className="pi-dropdown-wrap" ref={statusDropdownRef}>
                <button className={`pi-dropdown-btn${showStatusDropdown ? " open" : ""}`}
                  onClick={() => setShowStatusDropdown(s => !s)}>
                  <span>{statusFilter}</span>
                  <span className="pi-caret"><IconChevronDown /></span>
                </button>
                {showStatusDropdown && (
                  <div className="pi-dropdown-menu pi-status-menu">
                    {(["Show All Invoices","Show Open Invoices","Show Closed Invoices"] as StatusFilter[]).map(opt => (
                      <button key={opt} className={`pi-dropdown-item${statusFilter === opt ? " active bold" : ""}`}
                        onClick={() => { setStatusFilter(opt); setShowStatusDropdown(false); }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button className="pi-create-btn" onClick={() => setPageMode("create")}>
              + Create Proforma Invoice
            </button>
          </div>

          {/* ── Table ── */}
          <div className="pi-table-wrap">
            <table className="pi-table">
              <thead>
                <tr>
                  <th>Date <span className="pi-sort-icon"><IconSort /></span></th>
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
                  <tr><td colSpan={7} className="pi-empty">No invoices found</td></tr>
                ) : (
                  filteredInvoices.map(inv => (
                    <tr
                      key={inv.id}
                      className="pi-tr-clickable"
                      onClick={() => setViewInvoice(inv)}
                    >
                      <td>{formatDate(new Date(inv.date))}</td>
                      <td>{settings.prefixEnabled ? `${settings.prefix}${inv.proformaNumber}` : inv.proformaNumber}</td>
                      <td>{inv.partyName}</td>
                      <td>{inv.dueIn}</td>
                      <td>{formatAmount(inv.amount)}</td>
                      <td>
                        <span className={`pi-status-badge ${inv.status.toLowerCase()}`}>{inv.status}</span>
                      </td>
                      <td className="pi-actions-cell" onClick={e => e.stopPropagation()}>
                        <div className="pi-menu-wrap">
                          <button className="pi-kebab-btn"
                            onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === inv.id ? null : inv.id); }}>
                            ⋮
                          </button>
                          {openMenuId === inv.id && (
                            <div className="pi-row-menu" ref={menuRef}>
                              <button onClick={() => handleEdit(inv.id)}>
                                <span className="pi-menu-icon"><IconEdit /></span> Edit
                              </button>
                              <button onClick={() => { setHistoryInvoiceId(inv.id); setShowHistoryModal(true); setOpenMenuId(null); }}>
                                <span className="pi-menu-icon"><IconHistory /></span> Edit History
                              </button>
                              <button onClick={() => handleDuplicate(inv.id)}>
                                <span className="pi-menu-icon"><IconDuplicate /></span> Duplicate
                              </button>
                              <button className="pi-delete-item" onClick={() => handleDeleteInvoice(inv.id)}>
                                <span className="pi-menu-icon"><IconTrash /></span> Delete
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
          </div>

          {/* ── Quick Settings Modal ── */}
          {showSettings && (
            <div className="pi-modal-overlay" onClick={() => setShowSettings(false)}>
              <div className="pi-modal" onClick={e => e.stopPropagation()}>
                <div className="pi-modal-header">
                  <h2>Quick Proforma Settings</h2>
                  <button className="pi-modal-close" onClick={() => setShowSettings(false)}><IconClose /></button>
                </div>
                <div className="pi-modal-body">
                  <div className={`pi-settings-card${tempSettings.prefixEnabled ? " enabled" : ""}`}>
                    <div className="pi-settings-row">
                      <div>
                        <div className="pi-settings-title">Proforma Prefix &amp; Sequence Number</div>
                        <div className="pi-settings-desc">Add your custom prefix &amp; sequence for Proforma Numbering</div>
                      </div>
                      <label className="pi-toggle">
                        <input type="checkbox" checked={tempSettings.prefixEnabled}
                          onChange={e => setTempSettings(prev => ({ ...prev, prefixEnabled: e.target.checked }))} />
                        <span className="pi-toggle-slider" />
                      </label>
                    </div>
                    {tempSettings.prefixEnabled && (
                      <div className="pi-settings-fields">
                        <div className="pi-field">
                          <label>Prefix</label>
                          <input type="text" placeholder="Prefix" value={tempSettings.prefix}
                            onChange={e => setTempSettings(prev => ({ ...prev, prefix: e.target.value }))} />
                        </div>
                        <div className="pi-field">
                          <label>Sequence Number</label>
                          <input type="number" value={tempSettings.sequenceNumber}
                            onChange={e => setTempSettings(prev => ({ ...prev, sequenceNumber: Number(e.target.value) }))} />
                        </div>
                        <div className="pi-proforma-preview">
                          Proforma Number: {tempSettings.prefix}{tempSettings.sequenceNumber}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="pi-settings-card">
                    <div className="pi-settings-row">
                      <div>
                        <div className="pi-settings-title">Show Item Image on Invoice</div>
                        <div className="pi-settings-desc">This will apply to all vouchers except for Payment In and Payment Out</div>
                      </div>
                      <label className="pi-toggle">
                        <input type="checkbox" checked={tempSettings.showItemImage}
                          onChange={e => setTempSettings(prev => ({ ...prev, showItemImage: e.target.checked }))} />
                        <span className="pi-toggle-slider" />
                      </label>
                    </div>
                  </div>
                  <div className="pi-settings-card">
                    <div className="pi-settings-row">
                      <div>
                        <div className="pi-settings-title">
                          Price History <span className="pi-new-badge">New</span>
                        </div>
                        <div className="pi-settings-desc">Show last 5 sales / purchase prices of the item for the selected party in invoice</div>
                      </div>
                      <label className="pi-toggle">
                        <input type="checkbox" checked={tempSettings.priceHistory}
                          onChange={e => setTempSettings(prev => ({ ...prev, priceHistory: e.target.checked }))} />
                        <span className="pi-toggle-slider" />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="pi-modal-footer">
                  <button className="pi-btn-cancel" onClick={() => setShowSettings(false)}>Cancel</button>
                  <button className="pi-btn-save" onClick={handleSettingsSave}>Save</button>
                </div>
              </div>
            </div>
          )}

          {/* ── Edit History Modal ── */}
          {showHistoryModal && (
            <div className="pi-modal-overlay" onClick={() => setShowHistoryModal(false)}>
              <div className="pi-modal" onClick={e => e.stopPropagation()}>
                <div className="pi-modal-header">
                  <h2>Edit History</h2>
                  <button className="pi-modal-close" onClick={() => setShowHistoryModal(false)}><IconClose /></button>
                </div>
                <div className="pi-modal-body">
                  <div className="pi-history-entry">
                    <span className="pi-history-dot" />
                    <div>
                      <div className="pi-history-action">Invoice Created</div>
                      <div className="pi-history-time">{formatDate(new Date())}, System</div>
                    </div>
                  </div>
                  <div className="pi-history-entry">
                    <span className="pi-history-dot" />
                    <div>
                      <div className="pi-history-action">Invoice Viewed</div>
                      <div className="pi-history-time">{formatDate(new Date())}, System</div>
                    </div>
                  </div>
                </div>
                <div className="pi-modal-footer">
                  <button className="pi-btn-save" onClick={() => setShowHistoryModal(false)}>Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── View Modal — opens when row is clicked ── */}
      {viewInvoice && (
        <ProformaInvoiceViewModal
          invoice={viewInvoice}
          onClose={() => setViewInvoice(null)}
          onEdit={inv => { setViewInvoice(null); handleEdit(inv.id); }}
          onDuplicate={inv => { setViewInvoice(null); handleDuplicate(inv.id); }}
          onDelete={id => { handleDeleteInvoice(id); setViewInvoice(null); }}
          onConvertToInvoice={handleConvertToInvoice}
          prefix={settings.prefix}
          prefixEnabled={settings.prefixEnabled}
        />
      )}
    </>
  );
};

export default ProformaInvoice;