import "./PaymentOutList.css";
import { Search, Calendar, Settings2, ChevronDown, MoreVertical, Pencil, Trash2, ArrowLeft, Download, Printer, Info, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

/* ══════════════════════════════════════════
   PAYMENT OUT VIEW (detail page)
══════════════════════════════════════════ */
function PaymentOutView({ payment, onBack, onEdit, onDelete }: {
  payment: any;
  onBack: () => void;
  onEdit: (payment: any) => void;
  onDelete: (id: number) => void;
}) {
  const [showShareDD, setShowShareDD] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node))
        setShowShareDD(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const settledInvoices: any[] = payment.settledInvoices || [];

  return (
    <div className="pov-page">
      {/* ── TOP BAR ── */}
      <div className="pov-topbar">
        <div className="pov-topbar-left">
          <button className="pov-back-btn" onClick={onBack}>
            <ArrowLeft size={18} />
          </button>
          <h2 className="pov-title">
            Payment Out #{payment.paymentNumber || payment.id}
          </h2>
        </div>

        <div className="pov-topbar-right">
          <button className="pov-action-btn">
            <Download size={15} /> Download PDF
          </button>
          <button className="pov-action-btn">
            <Printer size={15} /> Print PDF
          </button>
          <button className="pov-action-btn pov-info-btn">
            <Info size={15} />
          </button>

          <div className="pov-split-btn" ref={shareRef}>
            <button className="pov-action-btn pov-share-main">
              <Share2 size={15} /> Share
            </button>
            <button
              className="pov-action-btn pov-split-arr"
              onClick={() => setShowShareDD((v) => !v)}
            >
              <ChevronDown size={14} />
            </button>
            {showShareDD && (
              <div className="pov-share-dd">
                <div className="pov-share-dd-item" onClick={() => setShowShareDD(false)}>WhatsApp</div>
                <div className="pov-share-dd-item" onClick={() => setShowShareDD(false)}>SMS</div>
                <div className="pov-share-dd-item" onClick={() => setShowShareDD(false)}>Email</div>
              </div>
            )}
          </div>

          <button className="pov-edit-btn" onClick={() => onEdit(payment)}>
            <Pencil size={14} /> Edit
          </button>
          <button className="pov-delete-btn" onClick={() => onDelete(payment.id)}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* ── PAYMENT DETAILS CARD ── */}
      <div className="pov-card">
        <div className="pov-card-heading">Payment Details</div>
        <div className="pov-details-grid">
          <div className="pov-detail-col">
            <div className="pov-detail-label">Party Name</div>
            <div className="pov-detail-value">{payment.partyName || "—"}</div>
          </div>
          <div className="pov-detail-col">
            <div className="pov-detail-label">Payment Date</div>
            <div className="pov-detail-value">{payment.date || "—"}</div>
          </div>
          <div className="pov-detail-col">
            <div className="pov-detail-label">Amount Paid</div>
            <div className="pov-detail-value">
              ₹ {Number(payment.amountReceived || 0).toLocaleString("en-IN")}
            </div>
          </div>
          <div className="pov-detail-col">
            <div className="pov-detail-label">Payment Out Discount</div>
            <div className="pov-detail-value">
              ₹ {Number(payment.discount || 0).toLocaleString("en-IN")}
            </div>
          </div>
          <div className="pov-detail-col">
            <div className="pov-detail-label">Payment Mode</div>
            <div className="pov-detail-value">{payment.paymentMode || "—"}</div>
          </div>
        </div>
        <div className="pov-notes-row">
          <div className="pov-detail-label">Notes</div>
          {payment.notes
            ? <div className="pov-notes-val">{payment.notes}</div>
            : <div className="pov-notes-empty">--</div>
          }
        </div>
      </div>

      {/* ── SETTLED INVOICES CARD ── */}
      <div className="pov-card">
        <div className="pov-card-heading">Invoices settled with this payment</div>
        <table className="pov-invoices-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Invoice Number</th>
              <th>Invoice Amount</th>
              <th>Discount</th>
              <th>Amount Paid</th>
              <th>Balance Amount</th>
            </tr>
          </thead>
          <tbody>
            {settledInvoices.length > 0 ? (
              settledInvoices.map((inv: any, i: number) => (
                <tr key={i}>
                  <td>{inv.date}</td>
                  <td>{inv.invoiceNumber}</td>
                  <td>₹ {Number(inv.invoiceAmount || 0).toLocaleString("en-IN")}</td>
                  <td>₹ {Number(inv.discount || 0).toLocaleString("en-IN")}</td>
                  <td>₹ {Number(inv.amountPaid || 0).toLocaleString("en-IN")}</td>
                  <td>₹ {Number(inv.balanceAmount || 0).toLocaleString("en-IN")}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="pov-empty-row">
                  No invoices have been settled with this payment
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PAYMENT OUT LIST (main page)
══════════════════════════════════════════ */
export default function PaymentOutList() {
  const navigate = useNavigate();

  // null = list view, object = detail view
  const [viewingPayment, setViewingPayment] = useState<any | null>(null);

  /* ================= LOAD PAYMENTS ================= */
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const storedPayments = JSON.parse(localStorage.getItem("paymentOutList") || "[]");
    setPayments(storedPayments);
  }, []);

  /* ================= ACTION DROPDOWN ================= */
  const [openActionId, setOpenActionId] = useState<number | null>(null);
  const actionRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openActionId !== null) {
        const ref = actionRefs.current[openActionId];
        if (ref && !ref.contains(e.target as Node)) setOpenActionId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openActionId]);

  /* ================= DATE DROPDOWN ================= */
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("Today");
  const [selectedRange, setSelectedRange] = useState({ start: new Date(), end: new Date() });
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDisplay = (date: Date) =>
    date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const getRange = (label: string): { start: Date; end: Date } => {
    const start = new Date(today);
    const end = new Date(today);
    switch (label) {
      case "Today": break;
      case "Yesterday":
        start.setDate(today.getDate() - 1); end.setDate(today.getDate() - 1); break;
      case "This Week": { const day = today.getDay(); start.setDate(today.getDate() - day); break; }
      case "Last Week": { const day = today.getDay(); start.setDate(today.getDate() - day - 7); end.setDate(today.getDate() - day - 1); break; }
      case "Last 7 Days": start.setDate(today.getDate() - 6); break;
      case "This Month": start.setDate(1); break;
      case "Previous Month": start.setMonth(today.getMonth() - 1); start.setDate(1); end.setMonth(today.getMonth()); end.setDate(0); break;
      case "Last 30 Days": start.setDate(today.getDate() - 29); break;
      case "This Quarter": { const q = Math.floor(today.getMonth() / 3); start.setMonth(q * 3); start.setDate(1); end.setMonth(q * 3 + 3); end.setDate(0); break; }
      case "Previous Quarter": { const q = Math.floor(today.getMonth() / 3) - 1; const aq = q < 0 ? 3 : q; const yo = q < 0 ? -1 : 0; start.setFullYear(today.getFullYear() + yo); start.setMonth(aq * 3); start.setDate(1); end.setFullYear(today.getFullYear() + yo); end.setMonth(aq * 3 + 3); end.setDate(0); break; }
      case "Current Fiscal Year": { const fs = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1; start.setFullYear(fs); start.setMonth(3); start.setDate(1); end.setFullYear(fs + 1); end.setMonth(2); end.setDate(31); break; }
      case "Previous Fiscal Year": { const fs = (today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1) - 1; start.setFullYear(fs); start.setMonth(3); start.setDate(1); end.setFullYear(fs + 1); end.setMonth(2); end.setDate(31); break; }
      case "Last 365 Days": start.setDate(today.getDate() - 364); break;
      default: break;
    }
    start.setHours(0, 0, 0, 0); end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const getRangeDisplay = (label: string) => {
    const { start, end } = getRange(label);
    return `${formatDisplay(start)} to ${formatDisplay(end)}`;
  };

  useEffect(() => { setSelectedRange(getRange("Today")); }, []);

  const dateOptions = [
    "Today", "Yesterday", "This Week", "Last Week", "Last 7 Days",
    "This Month", "Previous Month", "Last 30 Days", "This Quarter",
    "Previous Quarter", "Current Fiscal Year", "Previous Fiscal Year",
    "Last 365 Days", "Custom Date Range",
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowDateDropdown(false);
    };
    if (showDateDropdown) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDateDropdown]);

  /* ================= PARSE DATE ================= */
  const parsePaymentDate = (dateStr: string): Date => {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed;
    const parts = dateStr.split(" ");
    if (parts.length === 3) {
      const months: Record<string, number> = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
      return new Date(parseInt(parts[2]), months[parts[1]], parseInt(parts[0]));
    }
    return new Date();
  };

  /* ================= FILTERED PAYMENTS ================= */
  const filteredPayments = payments.filter((payment) => {
    const paymentDate = parsePaymentDate(payment.date);
    paymentDate.setHours(12, 0, 0, 0);
    const inRange = paymentDate >= selectedRange.start && paymentDate <= selectedRange.end;
    const matchesSearch =
      !searchQuery ||
      payment.partyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.paymentNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    return inRange && matchesSearch;
  });

  /* ================= DELETE ================= */
  const handleDelete = (id: number) => {
    const updated = payments.filter((p) => p.id !== id);
    setPayments(updated);
    localStorage.setItem("paymentOutList", JSON.stringify(updated));
    setOpenActionId(null);
    setViewingPayment(null);
  };

  /* ================= EDIT ================= */
  const handleEdit = (payment: any) => {
    localStorage.setItem("editingPayment", JSON.stringify(payment));
    navigate("/cashier/payment-out");
    setOpenActionId(null);
  };

  /* ================= DETAIL VIEW ================= */
  if (viewingPayment) {
    return (
      <PaymentOutView
        payment={viewingPayment}
        onBack={() => setViewingPayment(null)}
        onEdit={(p) => handleEdit(p)}
        onDelete={(id) => handleDelete(id)}
      />
    );
  }

  /* ================= LIST VIEW ================= */
  return (
    <div className="paymentoutlist-page">
      <div className="paymentoutlist-header">
        <div><h2>Payment Out</h2></div>
        <div className="header-actions">
          <button className="icon-btn"><Settings2 size={18} /></button>
        </div>
      </div>

      <div className="paymentoutlist-toolbar">
        <div className="toolbar-left">
          <div className="search-wrapper">
            {!showSearch ? (
              <div className="search-icon-box" onClick={() => setShowSearch(true)}>
                <Search size={16} />
              </div>
            ) : (
              <input
                type="text"
                className="search-input"
                placeholder="Search by party name or payment number"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => { if (!searchQuery) setShowSearch(false); }}
              />
            )}
          </div>

          <div className="date-filter-wrapper" ref={dropdownRef}>
            <div className="date-filter" onClick={() => setShowDateDropdown((prev) => !prev)}>
              <Calendar size={16} />
              <span>{selectedLabel}</span>
              <ChevronDown size={16} />
            </div>
            {showDateDropdown && (
              <div className="date-dropdown-table">
                <div className="date-dropdown-header">
                  <span>Date Filter</span>
                  <span>Range</span>
                </div>
                <div className="date-dropdown-body">
                  {dateOptions.map((option) => (
                    <div
                      key={option}
                      className={`date-dropdown-row ${selectedLabel === option ? "active-date" : ""}`}
                      onClick={() => { setSelectedLabel(option); setSelectedRange(getRange(option)); setShowDateDropdown(false); }}
                    >
                      <span className="date-label">{option}</span>
                      <span className="date-range">{getRangeDisplay(option)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          className="create-btn"
          onClick={() => { localStorage.removeItem("editingPayment"); navigate("/cashier/payment-out"); }}
        >
          Create Payment Out
        </button>
      </div>

      <div className="paymentoutlist-table-wrapper">
        <table className="paymentoutlist-table">
          <thead>
            <tr>
              <th>Date ⇅</th>
              <th>Payment Number</th>
              <th>Party Name</th>
              <th>Total Amount Settled</th>
              <th>Amount Received</th>
              <th>Payment Mode</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="pol-clickable-row"
                  onClick={() => setViewingPayment(payment)}
                >
                  <td>{payment.date}</td>
                  <td>{payment.paymentNumber}</td>
                  <td>{payment.partyName}</td>
                  <td>₹ {payment.totalAmountSettled}</td>
                  <td>₹ {payment.amountReceived}</td>
                  <td>{payment.paymentMode}</td>
                  <td>
                    <div
                      className="action-menu-wrapper"
                      ref={(el) => (actionRefs.current[payment.id] = el)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="three-dot-btn"
                        onClick={(e) => { e.stopPropagation(); setOpenActionId(openActionId === payment.id ? null : payment.id); }}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openActionId === payment.id && (
                        <div className="action-dropdown">
                          <button className="action-dropdown-item edit" onClick={(e) => { e.stopPropagation(); handleEdit(payment); }}>
                            <Pencil size={14} /> Edit
                          </button>
                          <button className="action-dropdown-item delete" onClick={(e) => { e.stopPropagation(); handleDelete(payment.id); }}>
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                  No Transactions Matching the current filter
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}