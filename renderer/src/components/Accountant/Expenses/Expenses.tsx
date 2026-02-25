import React, { useState, useMemo, useRef, useEffect } from "react";
import "./Expenses.css";

/* ============================================================
   TYPES
   ============================================================ */
export interface ExpenseItem {
  id: number;
  name: string;
  qty: number;
  pricePerItem: number;
  discount: number;
  amount: number;
}

export interface ExpenseEntry {
  id: number;
  date: string;
  expenseNumber: number;
  partyName: string;
  placeOfSupply?: string;
  category: string;
  paymentMode: string;
  originalInvoiceNumber?: string;
  note?: string;
  items: ExpenseItem[];
  amount: number;
  expenseWithGST?: boolean;
  source?: "manual" | "salary";
}

export interface ExpenseItemTemplate {
  id: number;
  name: string;
  hsn: string;
  price: number;
  itemType: "Product" | "Service";
  measuringUnit: string;
  gstTaxRate: string;
  itcApplicable: string;
}

interface ExpensesProps {
  externalExpenses?: ExpenseEntry[];
}

type ViewMode = "list" | "create" | "edit" | "view";

/* ============================================================
   INITIAL DATA
   ============================================================ */
const DEFAULT_CATEGORIES = [
  "Employee Salaries & Advances",
  "Bank Fee and Charges",
  "Printing and Stationery",
  "Raw Material",
  "Rent Expense",
  "Repair & Maintenance",
  "Telephone & Internet Expense",
  "Transportation & Travel Expense",
];

const STATIC_EXPENSES: ExpenseEntry[] = [
  {
    id: 1001,
    date: "2026-02-25",
    expenseNumber: 1,
    partyName: "-",
    placeOfSupply: "-",
    category: "Employee Salaries & Advances",
    paymentMode: "Cash",
    originalInvoiceNumber: "",
    note: "",
    items: [{ id: 1, name: "rohit Salary", qty: 1, pricePerItem: 20000, discount: 0, amount: 20000 }],
    amount: 20000,
    expenseWithGST: false,
    source: "manual",
  },
  {
    id: 1002,
    date: "2026-02-20",
    expenseNumber: 2,
    partyName: "Office Depot",
    placeOfSupply: "Maharashtra",
    category: "Printing and Stationery",
    paymentMode: "Bank Transfer",
    originalInvoiceNumber: "INV-5521",
    note: "Monthly stationery order",
    items: [{ id: 1, name: "A4 Paper Reams", qty: 5, pricePerItem: 400, discount: 0, amount: 2000 }],
    amount: 2000,
    expenseWithGST: false,
    source: "manual",
  },
];

const DATE_RANGE_OPTIONS = [
  "Today",
  "Yesterday",
  "This Week",
  "Last Week",
  "Last 7 Days",
  "This Month",
  "Previous Month",
  "Last 30 Days",
  "Last 90 Days",
  "Last 365 Days",
  "This Year",
  "Custom",
];

const PAYMENT_MODES = ["Cash", "Bank Transfer", "UPI", "Cheque", "Credit Card", "Debit Card"];
const MEASURING_UNITS = ["Nos", "Kg", "Gm", "Ltr", "Ml", "Mtr", "Cm", "Box", "Pack", "Piece"];
const GST_RATES = ["None", "0%", "5%", "12%", "18%", "28%"];

/* ============================================================
   HELPERS
   ============================================================ */
const toDateKey = (d: Date) => d.toISOString().split("T")[0];

const formatDisplay = (dateStr: string) => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const getWeekStart = (d: Date) => {
  const s = new Date(d);
  s.setDate(d.getDate() - d.getDay());
  s.setHours(0, 0, 0, 0);
  return s;
};

const isInRange = (dateStr: string, range: string, cf?: string, ct?: string): boolean => {
  const date = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  switch (range) {
    case "Today": return date >= today;
    case "Yesterday": return date >= yesterday && date < today;
    case "This Week": return date >= getWeekStart(today);
    case "Last Week": { const ws = getWeekStart(today); const lws = new Date(ws); lws.setDate(ws.getDate() - 7); return date >= lws && date < ws; }
    case "Last 7 Days": { const t = new Date(today); t.setDate(t.getDate() - 7); return date >= t; }
    case "This Month": return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    case "Previous Month": { const pm = new Date(today.getFullYear(), today.getMonth() - 1, 1); const pmEnd = new Date(today.getFullYear(), today.getMonth(), 1); return date >= pm && date < pmEnd; }
    case "Last 30 Days": { const t = new Date(today); t.setDate(t.getDate() - 30); return date >= t; }
    case "Last 90 Days": { const t = new Date(today); t.setDate(t.getDate() - 90); return date >= t; }
    case "Last 365 Days": { const t = new Date(today); t.setDate(t.getDate() - 365); return date >= t; }
    case "This Year": return date.getFullYear() === today.getFullYear();
    case "Custom": { const from = cf ? new Date(cf + "T00:00:00") : new Date(0); const to = ct ? new Date(ct + "T23:59:59") : new Date(); return date >= from && date <= to; }
    default: return true;
  }
};

/* ============================================================
   MINI CALENDAR
   ============================================================ */
const MiniCalendar: React.FC<{
  label: string;
  selected: string;
  onSelect: (d: string) => void;
}> = ({ label, selected, onSelect }) => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(() => selected ? new Date(selected + "T00:00:00") : new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div className="mini-cal">
      <div className="mini-cal-label">{label}</div>
      <div className="mini-cal-nav">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))}>&#8249;</button>
        <span>{new Date(year, month).toLocaleDateString("en-IN", { month: "long" })}</span>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))}>&#8250;</button>
      </div>
      <div className="mini-cal-year-nav">
        <button onClick={() => setViewDate(new Date(year - 1, month, 1))}>&#8249;</button>
        <span>{year}</span>
        <button onClick={() => setViewDate(new Date(year + 1, month, 1))}>&#8250;</button>
      </div>
      <div className="mini-cal-grid">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d} className="mini-cal-dow">{d}</div>)}
        {Array(firstDay).fill(null).map((_, i) => <div key={`e-${i}`}/>)}
        {Array(daysInMonth).fill(null).map((_, i) => {
          const day = i + 1;
          const dk = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const isSelected = dk === selected;
          const isToday = dk === toDateKey(today);
          return (
            <div
              key={day}
              className={`mini-cal-day${isSelected ? " selected" : ""}${isToday && !isSelected ? " today" : ""}`}
              onClick={() => onSelect(dk)}
            >{day}</div>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
const Expenses: React.FC<ExpensesProps> = ({ externalExpenses = [] }) => {
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(STATIC_EXPENSES);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [itemTemplates, setItemTemplates] = useState<ExpenseItemTemplate[]>([
    { id: 1, name: "rohit Salary", hsn: "-", price: 0, itemType: "Product", measuringUnit: "", gstTaxRate: "None", itcApplicable: "Eligible" },
  ]);

  /* Settings */
  const [settings, setSettings] = useState({ prefixEnabled: true, prefix: "Prefix", sequence: 2, showItemImage: false });
  const [settingsDraft, setSettingsDraft] = useState({ ...settings });
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  /* View mode */
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingExpense, setEditingExpense] = useState<ExpenseEntry | null>(null);
  const [viewingExpense, setViewingExpense] = useState<ExpenseEntry | null>(null);

  /* List filters */
  const [dateRange, setDateRange] = useState("Last 365 Days");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showCustomCal, setShowCustomCal] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Expenses Categories");
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [actionMenuId, setActionMenuId] = useState<number | null>(null);
  const [actionMenuPos, setActionMenuPos] = useState({ top: 0, left: 0 });
  const [showReportsDropdown, setShowReportsDropdown] = useState(false);

  /* Delete confirm */
  const [showDeleteExpense, setShowDeleteExpense] = useState<number | null>(null);

  /* Category management */
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [showCatCreateModal, setShowCatCreateModal] = useState(false);
  const [showCatEditModal, setShowCatEditModal] = useState<string | null>(null);
  const [showCatDeleteModal, setShowCatDeleteModal] = useState<string | null>(null);
  const [catFormName, setCatFormName] = useState("");
  const [catEditName, setCatEditName] = useState("");

  /* Create/Edit form state */
  const nextExpNum = useMemo(() => {
    const all = [...expenses, ...externalExpenses];
    return all.length > 0 ? Math.max(...all.map(e => e.expenseNumber)) + 1 : 1;
  }, [expenses, externalExpenses]);

  const blankForm = (): Omit<ExpenseEntry, "id" | "expenseNumber" | "amount"> => ({
    date: toDateKey(new Date()),
    partyName: "",
    placeOfSupply: "",
    category: "",
    paymentMode: "",
    originalInvoiceNumber: "",
    note: "",
    items: [],
    expenseWithGST: false,
    source: "manual",
  });

  const [form, setForm] = useState(blankForm());
  const [formItems, setFormItems] = useState<ExpenseItem[]>([]);

  /* Add Item modal */
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [itemSearch, setItemSearch] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [showCreateItemModal, setShowCreateItemModal] = useState(false);
  const [newItemForm, setNewItemForm] = useState<Omit<ExpenseItemTemplate, "id">>({
    name: "", hsn: "", price: 0, itemType: "Product",
    measuringUnit: "", gstTaxRate: "None", itcApplicable: "Eligible",
  });

  /* Date picker in form */
  const [showFormDatePicker, setShowFormDatePicker] = useState(false);

  /* Computed */
  const allExpenses = useMemo(() => {
    const ext = externalExpenses.map((e, i) => ({ ...e, source: "salary" as const }));
    const combined = [...expenses, ...ext];
    const sorted = combined.sort((a, b) => a.date.localeCompare(b.date));
    return sorted.map((e, i) => ({ ...e, expenseNumber: i + 1 }));
  }, [expenses, externalExpenses]);

  const filteredExpenses = useMemo(() => {
    let list = allExpenses.filter(e => {
      const inRange = isInRange(e.date, dateRange, customFrom, customTo);
      const inCat = categoryFilter === "All Expenses Categories" || e.category === categoryFilter;
      const q = searchQuery.toLowerCase();
      const inSearch = !q || e.partyName.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || String(e.expenseNumber).includes(q);
      return inRange && inCat && inSearch;
    });
    list = list.sort((a, b) => sortField === "date"
      ? (sortDir === "desc" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date))
      : (sortDir === "desc" ? b.amount - a.amount : a.amount - b.amount)
    );
    return list;
  }, [allExpenses, dateRange, categoryFilter, searchQuery, sortField, sortDir, customFrom, customTo]);

  const totalAmount = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const formTotal = formItems.reduce((s, i) => s + i.amount, 0);

  const toggleSort = (field: "date" | "amount") => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  /* ---- Save Expense ---- */
  const handleSaveExpense = () => {
    const amount = formTotal;
    if (!form.category && formItems.length === 0) return;
    if (editingExpense) {
      setExpenses(prev => prev.map(e => e.id === editingExpense.id
        ? { ...e, ...form, items: formItems, amount, expenseNumber: e.expenseNumber }
        : e
      ));
    } else {
      const newExp: ExpenseEntry = {
        id: Date.now(),
        expenseNumber: nextExpNum,
        ...form,
        items: formItems,
        amount,
        source: "manual",
      };
      setExpenses(prev => [...prev, newExp]);
    }
    setViewMode("list");
    setEditingExpense(null);
  };

  const openCreate = () => {
    setForm(blankForm());
    setFormItems([]);
    setEditingExpense(null);
    setViewMode("create");
  };

  const openEdit = (exp: ExpenseEntry) => {
    setForm({
      date: exp.date, partyName: exp.partyName, placeOfSupply: exp.placeOfSupply || "",
      category: exp.category, paymentMode: exp.paymentMode,
      originalInvoiceNumber: exp.originalInvoiceNumber || "", note: exp.note || "",
      items: exp.items, expenseWithGST: exp.expenseWithGST || false, source: exp.source || "manual",
    });
    setFormItems(exp.items);
    setEditingExpense(exp);
    setViewMode("edit");
    setActionMenuId(null);
  };

  const openView = (exp: ExpenseEntry) => {
    setViewingExpense(exp);
    setViewMode("view");
  };

  /* ---- Delete ---- */
  const handleDeleteExpense = (id: number) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    setShowDeleteExpense(null);
    setActionMenuId(null);
    if (viewMode === "view") setViewMode("list");
  };

  /* ---- Items in form ---- */
  const filteredItemTemplates = itemTemplates.filter(t => t.name.toLowerCase().includes(itemSearch.toLowerCase()));

  const handleAddSelectedItems = () => {
    const toAdd = itemTemplates.filter(t => selectedItemIds.includes(t.id));
    const newItems: ExpenseItem[] = toAdd.map(t => ({
      id: Date.now() + Math.random(),
      name: t.name,
      qty: 1,
      pricePerItem: t.price,
      discount: 0,
      amount: t.price,
    }));
    setFormItems(prev => [...prev, ...newItems]);
    setSelectedItemIds([]);
    setShowAddItemModal(false);
    setItemSearch("");
  };

  const updateFormItem = (id: number, field: keyof ExpenseItem, val: string | number) => {
    setFormItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: val };
      updated.amount = updated.qty * updated.pricePerItem - updated.discount;
      return updated;
    }));
  };

  const removeFormItem = (id: number) => setFormItems(prev => prev.filter(i => i.id !== id));

  /* ---- Create Item Template ---- */
  const handleSaveNewItem = () => {
    if (!newItemForm.name) return;
    const newItem: ExpenseItemTemplate = { id: Date.now(), ...newItemForm };
    setItemTemplates(prev => [...prev, newItem]);
    setShowCreateItemModal(false);
    setNewItemForm({ name: "", hsn: "", price: 0, itemType: "Product", measuringUnit: "", gstTaxRate: "None", itcApplicable: "Eligible" });
  };

  /* ---- Category CRUD ---- */
  const handleAddCategory = () => {
    if (!catFormName.trim()) return;
    setCategories(prev => [...prev, catFormName.trim()]);
    setCatFormName("");
    setShowCatCreateModal(false);
  };
  const handleEditCategory = () => {
    if (!catEditName.trim() || !showCatEditModal) return;
    setCategories(prev => prev.map(c => c === showCatEditModal ? catEditName.trim() : c));
    setShowCatEditModal(null);
    setCatEditName("");
  };
  const handleDeleteCategory = () => {
    if (!showCatDeleteModal) return;
    setCategories(prev => prev.filter(c => c !== showCatDeleteModal));
    setShowCatDeleteModal(null);
  };

  /* ---- Settings ---- */
  const handleSaveSettings = () => {
    setSettings({ ...settingsDraft });
    setShowSettingsModal(false);
  };

  /* Close all dropdowns on outside click */
  const containerRef = useRef<HTMLDivElement>(null);

  /* ============================================================
     RENDER: VIEW DETAIL
     ============================================================ */
  if (viewMode === "view" && viewingExpense) {
    const exp = allExpenses.find(e => e.id === viewingExpense.id) || viewingExpense;
    return (
      <div className="exp-page">
        <div className="exp-form-topbar">
          <div className="exp-form-topbar-left">
            <button className="exp-back-btn" onClick={() => setViewMode("list")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><path d="M19 12H5M5 12l7-7M5 12l7 7"/></svg>
            </button>
            <h2 className="exp-form-title">Expense #{exp.expenseNumber}</h2>
          </div>
          <div className="exp-form-topbar-right">
            <button className="exp-outline-btn icon-left" onClick={() => openEdit(exp)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </button>
            <button className="exp-delete-icon-btn" onClick={() => setShowDeleteExpense(exp.id)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
        </div>

        <div className="exp-view-body">
          <div className="exp-view-info-card">
            <div className="exp-view-info-grid">
              <div><span className="exp-view-label">Party Name</span><span className="exp-view-val">{exp.partyName || "-"}</span></div>
              <div><span className="exp-view-label">Place of Supply</span><span className="exp-view-val">{exp.placeOfSupply || "-"}</span></div>
              <div><span className="exp-view-label">Expense category</span><span className="exp-view-val bold">{exp.category}</span></div>
              <div><span className="exp-view-label">Payment Mode</span><span className="exp-view-val bold">{exp.paymentMode || "-"}</span></div>
              <div><span className="exp-view-label">Date</span><span className="exp-view-val">{exp.date}</span></div>
              <div><span className="exp-view-label">Notes</span><span className="exp-view-val">{exp.note || "-"}</span></div>
            </div>
          </div>

          <table className="exp-view-items-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>QTY</th>
                <th>PRICE/ITEM(₹)</th>
                <th>DISCOUNT(₹)</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {exp.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.qty}</td>
                  <td>{item.pricePerItem.toLocaleString("en-IN")}</td>
                  <td>{item.discount}</td>
                  <td>{item.amount.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="exp-view-totals">
            <div className="exp-view-total-row"><span>Total Discount</span><span>{exp.items.reduce((s, i) => s + i.discount, 0)}</span></div>
            <div className="exp-view-total-row bold"><span>Total Expense Amount</span><span>{exp.amount.toLocaleString("en-IN")}</span></div>
          </div>
        </div>

        {showDeleteExpense !== null && renderDeleteExpenseModal()}
      </div>
    );
  }

  /* ============================================================
     RENDER: CREATE / EDIT FORM
     ============================================================ */
  if (viewMode === "create" || viewMode === "edit") {
    return (
      <div className="exp-page" onClick={() => setShowFormDatePicker(false)}>
        <div className="exp-form-topbar">
          <div className="exp-form-topbar-left">
            <button className="exp-back-btn" onClick={() => { setViewMode("list"); setEditingExpense(null); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><path d="M19 12H5M5 12l7-7M5 12l7 7"/></svg>
            </button>
            <h2 className="exp-form-title">{viewMode === "edit" ? "Edit Expense" : "Create Expense"}</h2>
          </div>
          <div className="exp-form-topbar-right">
            <button className="exp-icon-btn" onClick={(e) => { e.stopPropagation(); setSettingsDraft({ ...settings }); setShowSettingsModal(true); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
            <button className="exp-outline-btn" onClick={() => { setViewMode("list"); setEditingExpense(null); }}>Cancel</button>
            <button className="exp-primary-btn" onClick={handleSaveExpense}>Save</button>
          </div>
        </div>

        <div className="exp-form-body">
          {/* Left panel */}
          <div className="exp-form-left-panel">
            <div className="exp-form-card">
              {/* GST Toggle */}
              <div className="exp-gst-row">
                <span className="exp-gst-label">Expense With GST</span>
                <label className="exp-toggle-switch">
                  <input type="checkbox" checked={form.expenseWithGST}
                    onChange={e => setForm(p => ({ ...p, expenseWithGST: e.target.checked }))}/>
                  <span className="exp-toggle-slider"/>
                </label>
              </div>

              {/* Category */}
              <div className="exp-form-field">
                <label>Expense Category</label>
                <div className="exp-select-with-clear">
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                  {form.category && (
                    <button className="exp-clear-btn" onClick={() => setForm(p => ({ ...p, category: "" }))}>✕</button>
                  )}
                </div>
              </div>

              {/* Expense Number */}
              <div className="exp-form-field">
                <label>Expense Number</label>
                <input
                  type="text"
                  value={editingExpense ? String(editingExpense.expenseNumber) : String(nextExpNum)}
                  readOnly
                />
              </div>

              {/* Party Name */}
              <div className="exp-form-field">
                <label>Party Name</label>
                <input type="text" placeholder="Enter party name" value={form.partyName}
                  onChange={e => setForm(p => ({ ...p, partyName: e.target.value }))}/>
              </div>

              {/* Place of Supply */}
              <div className="exp-form-field">
                <label>Place of Supply</label>
                <input type="text" placeholder="Enter place of supply" value={form.placeOfSupply}
                  onChange={e => setForm(p => ({ ...p, placeOfSupply: e.target.value }))}/>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="exp-form-right-panel">
            <div className="exp-form-card">
              {/* Original Invoice Number */}
              <div className="exp-form-field">
                <label>Original Invoice Number</label>
                <input type="text" placeholder="" value={form.originalInvoiceNumber}
                  onChange={e => setForm(p => ({ ...p, originalInvoiceNumber: e.target.value }))}/>
              </div>

              {/* Date picker */}
              <div className="exp-form-field">
                <label>Date</label>
                <div className="exp-date-input-wrapper" onClick={e => { e.stopPropagation(); setShowFormDatePicker(v => !v); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#5b5ff0" strokeWidth="2" width="15" height="15">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                  <span>{formatDisplay(form.date)}</span>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M7 10l5 5 5-5z"/></svg>
                </div>
                {showFormDatePicker && (
                  <div className="exp-form-datepicker-popup" onClick={e => e.stopPropagation()}>
                    <MiniCalendar label="" selected={form.date} onSelect={d => { setForm(p => ({ ...p, date: d })); setShowFormDatePicker(false); }}/>
                  </div>
                )}
              </div>

              {/* Payment Mode */}
              <div className="exp-form-field">
                <label>Payment Mode</label>
                <select value={form.paymentMode} onChange={e => setForm(p => ({ ...p, paymentMode: e.target.value }))}>
                  <option value="">Select</option>
                  {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>

              {/* Note */}
              <div className="exp-form-field">
                <label>Note</label>
                <textarea placeholder="Enter Notes" value={form.note}
                  onChange={e => setForm(p => ({ ...p, note: e.target.value }))}/>
              </div>
            </div>
          </div>
        </div>

        {/* Items section */}
        <div className="exp-form-items-section">
          {formItems.length > 0 && (
            <table className="exp-form-items-table">
              <thead>
                <tr>
                  <th>NO</th>
                  <th>ITEMS</th>
                  <th>QTY</th>
                  <th>PRICE/ITEM</th>
                  <th>AMOUNT</th>
                  <th>
                    <button className="exp-remove-all-btn" onClick={() => setFormItems([])}>✕</button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {formItems.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="exp-item-no">{idx + 1}</td>
                    <td className="exp-item-name">{item.name}</td>
                    <td>
                      <input type="number" className="exp-item-input" value={item.qty} min={1}
                        onChange={e => updateFormItem(item.id, "qty", parseFloat(e.target.value) || 1)}/>
                    </td>
                    <td>
                      <input type="number" className="exp-item-input" value={item.pricePerItem}
                        onChange={e => updateFormItem(item.id, "pricePerItem", parseFloat(e.target.value) || 0)}/>
                    </td>
                    <td>
                      <div className="exp-item-amount-cell">
                        <span>₹</span>
                        <input type="number" className="exp-item-input" value={item.amount}
                          onChange={e => updateFormItem(item.id, "amount", parseFloat(e.target.value) || 0)}/>
                      </div>
                    </td>
                    <td>
                      <button className="exp-remove-item-btn" onClick={() => removeFormItem(item.id)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <button className="exp-add-item-btn" onClick={() => setShowAddItemModal(true)}>
            + Add Item
          </button>

          <div className="exp-form-total-row">
            <span>Total Expense Amount</span>
            <div className="exp-form-total-val">
              <span className="exp-rupee-sym">₹</span>
              <span>{formTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* ---- Add Item Modal ---- */}
        {showAddItemModal && (
          <div className="exp-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddItemModal(false); }}>
            <div className="exp-modal exp-add-item-modal" onClick={e => e.stopPropagation()}>
              <div className="exp-modal-header">
                <h3>Add Expense Items</h3>
                <button className="exp-modal-close" onClick={() => setShowAddItemModal(false)}>✕</button>
              </div>
              <div className="exp-modal-body">
                <div className="exp-add-item-top">
                  <div className="exp-search-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <input type="text" placeholder="Search" value={itemSearch}
                      onChange={e => setItemSearch(e.target.value)}/>
                  </div>
                  <button className="exp-outline-btn blue" onClick={() => { setShowAddItemModal(false); setShowCreateItemModal(true); }}>
                    + Create New Item
                  </button>
                </div>
                <table className="exp-add-item-table">
                  <thead>
                    <tr><th>Item Name</th><th>HSN/SAC</th><th>Price</th><th></th><th></th></tr>
                  </thead>
                  <tbody>
                    {filteredItemTemplates.map(t => (
                      <tr key={t.id}>
                        <td>
                          <label className="exp-item-check-label">
                            <input type="checkbox" checked={selectedItemIds.includes(t.id)}
                              onChange={e => setSelectedItemIds(prev => e.target.checked ? [...prev, t.id] : prev.filter(id => id !== t.id))}/>
                            {t.name}
                          </label>
                        </td>
                        <td>{t.hsn || "-"}</td>
                        <td>{t.price.toFixed(1)}</td>
                        <td>
                          <button className="exp-add-single-btn" onClick={() => {
                            const newItem: ExpenseItem = { id: Date.now(), name: t.name, qty: 1, pricePerItem: t.price, discount: 0, amount: t.price };
                            setFormItems(prev => [...prev, newItem]);
                          }}>+ Add</button>
                        </td>
                        <td>
                          <button className="exp-row-action-btn small">⋮</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="exp-modal-footer">
                <button className="exp-outline-btn" onClick={() => setShowAddItemModal(false)}>Cancel</button>
                <button className="exp-primary-btn" onClick={handleAddSelectedItems}>Add</button>
              </div>
            </div>
          </div>
        )}

        {/* ---- Create New Item Modal ---- */}
        {showCreateItemModal && (
          <div className="exp-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowCreateItemModal(false); }}>
            <div className="exp-modal" onClick={e => e.stopPropagation()}>
              <div className="exp-modal-header">
                <h3>Create New Expense Item</h3>
                <button className="exp-modal-close" onClick={() => setShowCreateItemModal(false)}>✕</button>
              </div>
              <div className="exp-modal-body">
                <div className="exp-create-item-grid">
                  <div className="exp-form-field">
                    <label>Item Name</label>
                    <input type="text" value={newItemForm.name} onChange={e => setNewItemForm(p => ({ ...p, name: e.target.value }))}/>
                  </div>
                  <div className="exp-form-field">
                    <label>Item Type</label>
                    <div className="exp-radio-group">
                      {["Product", "Service"].map(t => (
                        <label key={t} className="exp-radio-label">
                          <input type="radio" checked={newItemForm.itemType === t}
                            onChange={() => setNewItemForm(p => ({ ...p, itemType: t as "Product"|"Service" }))}/>
                          {t}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="exp-form-field">
                    <label>Purchase Price</label>
                    <div className="exp-price-row">
                      <input type="number" value={newItemForm.price} onChange={e => setNewItemForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}/>
                      <select><option>Without Tax</option><option>With Tax</option></select>
                    </div>
                  </div>
                  <div className="exp-form-field">
                    <label>Measuring Unit</label>
                    <select value={newItemForm.measuringUnit} onChange={e => setNewItemForm(p => ({ ...p, measuringUnit: e.target.value }))}>
                      <option value="">Select Measuring Unit</option>
                      {MEASURING_UNITS.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="exp-form-field">
                    <label>HSN</label>
                    <input type="text" value={newItemForm.hsn} onChange={e => setNewItemForm(p => ({ ...p, hsn: e.target.value }))}/>
                  </div>
                  <div className="exp-form-field">
                    <label>GST Tax rate %</label>
                    <select value={newItemForm.gstTaxRate} onChange={e => setNewItemForm(p => ({ ...p, gstTaxRate: e.target.value }))}>
                      {GST_RATES.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="exp-form-field" style={{ gridColumn: "1 / -1" }}>
                    <label>ITC Applicable</label>
                    <select value={newItemForm.itcApplicable} onChange={e => setNewItemForm(p => ({ ...p, itcApplicable: e.target.value }))}>
                      <option>Eligible</option><option>Ineligible</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="exp-modal-footer">
                <button className="exp-outline-btn" onClick={() => setShowCreateItemModal(false)}>Cancel</button>
                <button className="exp-primary-btn" onClick={handleSaveNewItem}>Save Item</button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettingsModal && renderSettingsModal()}
        {showDeleteExpense !== null && renderDeleteExpenseModal()}
      </div>
    );
  }

  /* ============================================================
     RENDER: LIST VIEW
     ============================================================ */
  function renderDeleteExpenseModal() {
    return (
      <div className="exp-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowDeleteExpense(null); }}>
        <div className="exp-modal exp-confirm-modal" onClick={e => e.stopPropagation()}>
          <div className="exp-modal-body exp-confirm-body">
            <p className="exp-confirm-title">Are you sure you want to delete this Expense?</p>
            <p className="exp-confirm-sub">Once deleted, it cannot be recovered</p>
          </div>
          <div className="exp-modal-footer exp-confirm-footer">
            <button className="exp-outline-btn" onClick={() => setShowDeleteExpense(null)}>Cancel</button>
            <button className="exp-delete-confirm-btn" onClick={() => handleDeleteExpense(showDeleteExpense!)}>Yes, Delete</button>
          </div>
        </div>
      </div>
    );
  }

  function renderSettingsModal() {
    return (
      <div className="exp-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowSettingsModal(false); }}>
        <div className="exp-modal exp-settings-modal" onClick={e => e.stopPropagation()}>
          <div className="exp-modal-header">
            <h3>Quick Expense Settings</h3>
            <button className="exp-modal-close" onClick={() => setShowSettingsModal(false)}>✕</button>
          </div>
          <div className="exp-modal-body">
            {/* Prefix & Sequence */}
            <div className="exp-settings-section">
              <div className="exp-settings-row-top">
                <div>
                  <div className="exp-settings-title">Expense Prefix &amp; Sequence Number</div>
                  <div className="exp-settings-sub">Add your custom prefix &amp; sequence for Expense Numbering</div>
                </div>
                <label className="exp-toggle-switch">
                  <input type="checkbox" checked={settingsDraft.prefixEnabled}
                    onChange={e => setSettingsDraft(p => ({ ...p, prefixEnabled: e.target.checked }))}/>
                  <span className="exp-toggle-slider"/>
                </label>
              </div>
              {settingsDraft.prefixEnabled && (
                <div className="exp-settings-fields">
                  <div className="exp-form-field">
                    <label>Prefix</label>
                    <input type="text" value={settingsDraft.prefix}
                      onChange={e => setSettingsDraft(p => ({ ...p, prefix: e.target.value }))}/>
                  </div>
                  <div className="exp-form-field">
                    <label>Sequence Number</label>
                    <input type="number" value={settingsDraft.sequence}
                      onChange={e => setSettingsDraft(p => ({ ...p, sequence: parseInt(e.target.value) || 1 }))}/>
                  </div>
                  <div className="exp-settings-preview">Expense Number: {settingsDraft.sequence}</div>
                </div>
              )}
            </div>
            {/* Show Item Image */}
            <div className="exp-settings-section">
              <div className="exp-settings-row-top">
                <div>
                  <div className="exp-settings-title">Show Item Image on Invoice</div>
                  <div className="exp-settings-sub">This will apply to all vouchers except for Payment In and Payment Out</div>
                </div>
                <label className="exp-toggle-switch">
                  <input type="checkbox" checked={settingsDraft.showItemImage}
                    onChange={e => setSettingsDraft(p => ({ ...p, showItemImage: e.target.checked }))}/>
                  <span className="exp-toggle-slider"/>
                </label>
              </div>
            </div>
          </div>
          <div className="exp-modal-footer">
            <button className="exp-outline-btn" onClick={() => setShowSettingsModal(false)}>Cancel</button>
            <button className="exp-primary-btn" onClick={handleSaveSettings}>Save</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="exp-page" ref={containerRef} onClick={() => {
      setShowDateDropdown(false); setShowCatDropdown(false);
      setActionMenuId(null); setShowReportsDropdown(false);
      setShowCustomCal(false);
    }}>
      {/* ---- Header ---- */}
      <div className="exp-header">
        <h1 className="exp-title">Expenses</h1>
        <div className="exp-header-actions">
          {/* Reports */}
          <div className="exp-reports-wrapper" onClick={e => e.stopPropagation()}>
            <div
              className={`exp-reports-btn${showReportsDropdown ? " active" : ""}`}
              onClick={() => setShowReportsDropdown(v => !v)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#5b5ff0" strokeWidth="1.8" width="16" height="16">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
              </svg>
              Reports
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M7 10l5 5 5-5z"/></svg>
            </div>
            {showReportsDropdown && (
              <div className="exp-reports-dropdown">
                <div className="exp-reports-item">Expense Transactions</div>
                <div className="exp-reports-item">Expense Category</div>
              </div>
            )}
          </div>

          <button className="exp-icon-btn" onClick={e => { e.stopPropagation(); setSettingsDraft({ ...settings }); setShowSettingsModal(true); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
          <button className="exp-icon-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ---- Filter Bar ---- */}
      <div className="exp-filter-bar" onClick={e => e.stopPropagation()}>
        <div className="exp-filter-left">
          {/* Search */}
          <button className={`exp-search-icon-btn${showSearch ? " active" : ""}`}
            onClick={() => setShowSearch(v => !v)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>
          {showSearch && (
            <input className="exp-search-input" autoFocus placeholder="Search expenses..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}/>
          )}

          {/* Date Range */}
          <div className={`exp-filter-pill${showDateDropdown ? " open" : ""}`}
            onClick={() => { setShowDateDropdown(v => !v); setShowCatDropdown(false); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            <span>{dateRange}</span>
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M7 10l5 5 5-5z"/></svg>

            {showDateDropdown && (
              <div className="exp-dropdown-panel" onClick={e => e.stopPropagation()}>
                <div className="exp-dropdown-scroll">
                  {DATE_RANGE_OPTIONS.map(opt => (
                    <div
                      key={opt}
                      className={`exp-dropdown-item${dateRange === opt ? " active" : ""}`}
                      onClick={() => {
                        setDateRange(opt);
                        if (opt === "Custom") { setShowCustomCal(true); setShowDateDropdown(false); }
                        else { setShowDateDropdown(false); setShowCustomCal(false); }
                      }}
                    >
                      <span>{opt}</span>
                      {opt === "This Week" && (
                        <span className="exp-range-hint">
                          {(() => {
                            const today = new Date();
                            const ws = getWeekStart(today);
                            const we = new Date(ws); we.setDate(ws.getDate() + 6);
                            return `${formatDisplay(toDateKey(ws))} - ${formatDisplay(toDateKey(we))}`;
                          })()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Custom Date Calendar */}
          {showCustomCal && (
            <div className="exp-custom-cal-panel" onClick={e => e.stopPropagation()}>
              <div className="exp-custom-cal-grid">
                <MiniCalendar label="Select Start Date" selected={customFrom} onSelect={setCustomFrom}/>
                <div className="exp-custom-cal-divider"/>
                <MiniCalendar label="Select End Date" selected={customTo} onSelect={setCustomTo}/>
              </div>
              <div className="exp-custom-cal-footer">
                <button className="exp-outline-btn" onClick={() => { setShowCustomCal(false); setDateRange("Last 365 Days"); }}>CANCEL</button>
                <button className="exp-text-btn blue" onClick={() => setShowCustomCal(false)}>OK</button>
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className={`exp-filter-pill${showCatDropdown ? " open" : ""}`}
            onClick={() => { setShowCatDropdown(v => !v); setShowDateDropdown(false); }}>
            <span>{categoryFilter}</span>
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M7 10l5 5 5-5z"/></svg>

            {showCatDropdown && (
              <div className="exp-dropdown-panel cat-panel" onClick={e => e.stopPropagation()}>
                <div className="exp-dropdown-scroll">
                  <div className={`exp-dropdown-item${categoryFilter === "All Expenses Categories" ? " active" : ""}`}
                    onClick={() => { setCategoryFilter("All Expenses Categories"); setShowCatDropdown(false); }}>
                    All Expenses Categories
                  </div>
                  {categories.map(c => (
                    <div key={c} className={`exp-dropdown-item${categoryFilter === c ? " active" : ""}`}
                      onClick={() => { setCategoryFilter(c); setShowCatDropdown(false); }}>
                      {c}
                    </div>
                  ))}
                  <div className="exp-dropdown-add-cat" onClick={e => { e.stopPropagation(); setShowCatDropdown(false); setShowManageCategories(true); }}>
                    <span className="exp-dashed-btn">+ Add/Manage Category</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <button className="exp-primary-btn" onClick={openCreate}>Create Expense</button>
      </div>

      {/* ---- Table ---- */}
      <div className="exp-table-wrapper">
        <table className="exp-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => toggleSort("date")}>
                Date <span className="sort-icon">{sortField === "date" ? (sortDir === "desc" ? "↓" : "↑") : "⇅"}</span>
              </th>
              <th>Expense Number</th>
              <th>Party Name</th>
              <th>Category</th>
              <th className="sortable" onClick={() => toggleSort("amount")}>
                Amount <span className="sort-icon">{sortField === "amount" ? (sortDir === "desc" ? "↓" : "↑") : "⇅"}</span>
              </th>
              <th style={{ width: 48 }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="exp-empty-cell">
                  <div className="exp-empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" width="48" height="48">
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                      <rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>
                    </svg>
                    <p>No expenses found</p>
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {filteredExpenses.map(exp => (
                  <tr key={exp.id} className="exp-row clickable" onClick={() => openView(exp)}>
                    <td>{formatDisplay(exp.date)}</td>
                    <td>{exp.expenseNumber}</td>
                    <td>{exp.partyName || "-"}</td>
                    <td>{exp.category}</td>
                    <td>₹ {exp.amount.toLocaleString("en-IN")}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="exp-row-more-btn"
                        onClick={e => {
                          e.stopPropagation();
                          if (actionMenuId === exp.id) { setActionMenuId(null); return; }
                          const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                          setActionMenuPos({ top: rect.bottom + 4, left: rect.right - 140 });
                          setActionMenuId(exp.id);
                        }}>⋮</button>
                      {actionMenuId === exp.id && (
                        <div className="exp-row-menu" style={{ top: actionMenuPos.top, left: actionMenuPos.left }}>
                          <div className="exp-row-menu-item" onClick={() => openEdit(exp)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Edit
                          </div>
                          <div className="exp-row-menu-item delete" onClick={() => { setShowDeleteExpense(exp.id); setActionMenuId(null); }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                              <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                            </svg>
                            Delete
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="exp-total-row">
                  <td colSpan={4}><strong>Total</strong></td>
                  <td><strong>₹ {totalAmount.toLocaleString("en-IN")}</strong></td>
                  <td/>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* ---- Manage Categories Modal ---- */}
      {showManageCategories && (
        <div className="exp-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowManageCategories(false); }}>
          <div className="exp-modal exp-cat-modal" onClick={e => e.stopPropagation()}>
            <div className="exp-modal-header">
              <h3>Add/Manage Category</h3>
              <button className="exp-modal-close" onClick={() => setShowManageCategories(false)}>✕</button>
            </div>
            <div className="exp-modal-body exp-cat-body">
              <button className="exp-dashed-full-btn" onClick={() => { setCatFormName(""); setShowCatCreateModal(true); }}>
                + New Expense Category
              </button>
              <div className="exp-cat-list">
                {categories.map(cat => (
                  <div key={cat} className="exp-cat-item">
                    <span className="exp-cat-name">{cat}</span>
                    <div className="exp-cat-actions">
                      <button className="exp-cat-edit-btn" onClick={() => { setCatEditName(cat); setShowCatEditModal(cat); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                      </button>
                      <button className="exp-cat-del-btn" onClick={() => setShowCatDeleteModal(cat)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                          <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- Create Category Modal ---- */}
      {showCatCreateModal && (
        <div className="exp-modal-overlay">
          <div className="exp-modal exp-cat-form-modal" onClick={e => e.stopPropagation()}>
            <div className="exp-modal-header">
              <h3>Create Expense Category</h3>
              <button className="exp-modal-close" onClick={() => setShowCatCreateModal(false)}>✕</button>
            </div>
            <div className="exp-modal-body">
              <div className="exp-form-field">
                <label>Category Name</label>
                <input type="text" placeholder="Ex: Snacks" value={catFormName} onChange={e => setCatFormName(e.target.value)}/>
              </div>
            </div>
            <div className="exp-modal-footer">
              <button className="exp-outline-btn" onClick={() => setShowCatCreateModal(false)}>Cancel</button>
              <button className="exp-primary-btn" style={{ opacity: catFormName ? 1 : 0.5 }} onClick={handleAddCategory}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Edit Category Modal ---- */}
      {showCatEditModal && (
        <div className="exp-modal-overlay">
          <div className="exp-modal exp-cat-form-modal" onClick={e => e.stopPropagation()}>
            <div className="exp-modal-header">
              <h3>Edit {showCatEditModal}</h3>
              <button className="exp-modal-close" onClick={() => setShowCatEditModal(null)}>✕</button>
            </div>
            <div className="exp-modal-body">
              <div className="exp-form-field">
                <label>Category Name</label>
                <input type="text" value={catEditName} onChange={e => setCatEditName(e.target.value)}/>
              </div>
            </div>
            <div className="exp-modal-footer">
              <button className="exp-outline-btn" onClick={() => setShowCatEditModal(null)}>Cancel</button>
              <button className="exp-primary-btn" onClick={handleEditCategory}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Delete Category Modal ---- */}
      {showCatDeleteModal && (
        <div className="exp-modal-overlay">
          <div className="exp-modal exp-cat-delete-modal" onClick={e => e.stopPropagation()}>
            <div className="exp-modal-body exp-cat-delete-body">
              <div className="exp-cat-delete-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#e53935" strokeWidth="1.8" width="48" height="48">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </div>
              <p className="exp-confirm-title">Delete Expense Category?</p>
              <p className="exp-confirm-sub">Are you sure you want to delete this expense category? Deleted category cannot be retrieved</p>
            </div>
            <div className="exp-modal-footer exp-confirm-footer">
              <button className="exp-outline-btn" onClick={() => setShowCatDeleteModal(null)}>Cancel</button>
              <button className="exp-delete-confirm-btn" onClick={handleDeleteCategory}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && renderSettingsModal()}

      {/* Delete Expense Modal */}
      {showDeleteExpense !== null && renderDeleteExpenseModal()}
    </div>
  );
};

export default Expenses;