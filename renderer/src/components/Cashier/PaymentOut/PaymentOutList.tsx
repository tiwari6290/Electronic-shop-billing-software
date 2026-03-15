import "./PaymentOutList.css";
import { Search, Calendar, Settings2, ChevronDown, MoreVertical, Trash2, ArrowLeft, Download, Printer, Info, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { getAllPaymentOut, getPaymentOutById, deletePaymentOut } from "@/services/paymentOutService";

/* ══════════════════════════════════════════
   PAYMENT OUT VIEW (detail page)
   Uses PaymentOut schema:
     paymentNumber  String
     date           DateTime
     amountPaid     Decimal
     discount       Decimal?
     paymentMode    PaymentMode
     notes          String?
     party          Party { name }
     invoices       PaymentOutInvoice[] {
       invoiceAmount  Decimal
       discount       Decimal?
       amountPaid     Decimal
       balanceAmount  Decimal
       purchaseInvoice PurchaseInvoice { purchaseInvNo, invoiceDate, totalAmount }
     }
══════════════════════════════════════════ */
function PaymentOutView({ payment, onBack, onDelete }: {
  payment: any;
  onBack: () => void;
  onDelete: (id: number) => void;
}) {
  const [showShareDD, setShowShareDD] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShowShareDD(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  // PaymentOut.invoices → PaymentOutInvoice[]
  const settledInvoices: any[] = payment.invoices || [];

  return (
    <div className="pov-page">
      {/* ── TOP BAR ── */}
      <div className="pov-topbar">
        <div className="pov-topbar-left">
          <button className="pov-back-btn" onClick={onBack}><ArrowLeft size={18} /></button>
          <h2 className="pov-title">Payment Out #{payment.paymentNumber || payment.id}</h2>
        </div>

        <div className="pov-topbar-right">
          <button className="pov-action-btn"><Download size={15} /> Download PDF</button>
          <button className="pov-action-btn"><Printer size={15} /> Print PDF</button>
          <button className="pov-action-btn pov-info-btn"><Info size={15} /></button>

          <div className="pov-split-btn" ref={shareRef}>
            <button className="pov-action-btn pov-share-main"><Share2 size={15} /> Share</button>
            <button className="pov-action-btn pov-split-arr" onClick={() => setShowShareDD((v) => !v)}>
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
            {/* PaymentOut.party.name — nested relation */}
            <div className="pov-detail-value">{payment.party?.name || "—"}</div>
          </div>
          <div className="pov-detail-col">
            <div className="pov-detail-label">Payment Date</div>
            {/* PaymentOut.date DateTime */}
            <div className="pov-detail-value">{payment.date ? formatDate(payment.date) : "—"}</div>
          </div>
          <div className="pov-detail-col">
            <div className="pov-detail-label">Amount Paid</div>
            {/* PaymentOut.amountPaid Decimal */}
            <div className="pov-detail-value">₹ {Number(payment.amountPaid || 0).toLocaleString("en-IN")}</div>
          </div>
          <div className="pov-detail-col">
            <div className="pov-detail-label">Discount</div>
            {/* PaymentOut.discount Decimal? */}
            <div className="pov-detail-value">₹ {Number(payment.discount || 0).toLocaleString("en-IN")}</div>
          </div>
          <div className="pov-detail-col">
            <div className="pov-detail-label">Payment Mode</div>
            {/* PaymentOut.paymentMode PaymentMode enum */}
            <div className="pov-detail-value">{payment.paymentMode || "—"}</div>
          </div>
        </div>
        <div className="pov-notes-row">
          <div className="pov-detail-label">Notes</div>
          {/* PaymentOut.notes String? */}
          {payment.notes
            ? <div className="pov-notes-val">{payment.notes}</div>
            : <div className="pov-notes-empty">--</div>
          }
        </div>
      </div>

      {/* ── SETTLED INVOICES CARD ──
          PaymentOutInvoice fields:
            invoiceAmount  Decimal
            discount       Decimal?
            amountPaid     Decimal
            balanceAmount  Decimal
            purchaseInvoice.purchaseInvNo  String
            purchaseInvoice.invoiceDate    DateTime
      */}
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
              settledInvoices.map((inv: any) => (
                <tr key={inv.id}>
                  <td>{inv.purchaseInvoice?.invoiceDate ? formatDate(inv.purchaseInvoice.invoiceDate) : "—"}</td>
                  <td>{inv.purchaseInvoice?.purchaseInvNo || "—"}</td>
                  <td>₹ {Number(inv.invoiceAmount || 0).toLocaleString("en-IN")}</td>
                  <td>₹ {Number(inv.discount || 0).toLocaleString("en-IN")}</td>
                  <td>₹ {Number(inv.amountPaid || 0).toLocaleString("en-IN")}</td>
                  <td>₹ {Number(inv.balanceAmount || 0).toLocaleString("en-IN")}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="pov-empty-row">No invoices settled with this payment</td>
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
  const [viewingPayment, setViewingPayment] = useState<any | null>(null);

  /* ── LOAD PAYMENTS ──
   * GET /payment-out → PaymentOut[] with party relation
   * Fields: id, paymentNumber, date, amountPaid, paymentMode, party.name
   */
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const res = await getAllPaymentOut();
        setPayments(res.data);
      } catch (err) {
        console.error("Failed to load payments", err);
      }
    };
    loadPayments();
  }, []);

  /* ── ACTION DROPDOWN ── */
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

  /* ── DATE FILTER ── */
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("This Month");
  const [selectedRange, setSelectedRange] = useState(() => getRange("This Month"));
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  function getRange(label: string): { start: Date; end: Date } {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    switch (label) {
      case "Today": return { start: now, end };
      case "Yesterday": {
        const s = new Date(now); s.setDate(s.getDate() - 1);
        const e = new Date(s); e.setHours(23, 59, 59, 999);
        return { start: s, end: e };
      }
      case "This Week": {
        const s = new Date(now); s.setDate(s.getDate() - s.getDay());
        return { start: s, end };
      }
      case "Last Week": {
        const s = new Date(now); s.setDate(s.getDate() - s.getDay() - 7);
        const e = new Date(s); e.setDate(e.getDate() + 6); e.setHours(23, 59, 59, 999);
        return { start: s, end: e };
      }
      case "Last 7 Days": {
        const s = new Date(now); s.setDate(s.getDate() - 6);
        return { start: s, end };
      }
      case "This Month": {
        const s = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: s, end };
      }
      case "Previous Month": {
        const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const e = new Date(now.getFullYear(), now.getMonth(), 0); e.setHours(23, 59, 59, 999);
        return { start: s, end: e };
      }
      case "Last 30 Days": {
        const s = new Date(now); s.setDate(s.getDate() - 29);
        return { start: s, end };
      }
      case "This Quarter": {
        const q = Math.floor(now.getMonth() / 3);
        const s = new Date(now.getFullYear(), q * 3, 1);
        return { start: s, end };
      }
      case "Previous Quarter": {
        const q = Math.floor(now.getMonth() / 3);
        const s = new Date(now.getFullYear(), (q - 1) * 3, 1);
        const e = new Date(now.getFullYear(), q * 3, 0); e.setHours(23, 59, 59, 999);
        return { start: s, end: e };
      }
      case "Current Fiscal Year": {
        const fy = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
        return { start: new Date(fy, 3, 1), end };
      }
      case "Previous Fiscal Year": {
        const fy = now.getMonth() >= 3 ? now.getFullYear() - 1 : now.getFullYear() - 2;
        const e = new Date(fy + 1, 2, 31); e.setHours(23, 59, 59, 999);
        return { start: new Date(fy, 3, 1), end: e };
      }
      case "Last 365 Days": {
        const s = new Date(now); s.setDate(s.getDate() - 364);
        return { start: s, end };
      }
      default: return { start: new Date(0), end };
    }
  }

  const formatDisplay = (date: Date) =>
    date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const getRangeDisplay = (label: string) => {
    const r = getRange(label);
    return `${formatDisplay(r.start)} – ${formatDisplay(r.end)}`;
  };

  const dateOptions = [
    "Today", "Yesterday", "This Week", "Last Week", "Last 7 Days",
    "This Month", "Previous Month", "Last 30 Days", "This Quarter",
    "Previous Quarter", "Current Fiscal Year", "Previous Fiscal Year",
    "Last 365 Days",
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowDateDropdown(false);
    };
    if (showDateDropdown) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDateDropdown]);

  /* ── FORMAT DATE ── */
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  /* ── FILTER ──
   * payment.date         → PaymentOut.date DateTime (ISO string from DB)
   * payment.party.name   → PaymentOut.party.name (nested relation)
   * payment.paymentNumber → PaymentOut.paymentNumber String
   */
  const filteredPayments = payments.filter((payment) => {
    const paymentDate = new Date(payment.date);
    paymentDate.setHours(12, 0, 0, 0);
    const inRange = paymentDate >= selectedRange.start && paymentDate <= selectedRange.end;
    const partyName = payment.party?.name || "";
    const matchesSearch =
      !searchQuery ||
      partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.paymentNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    return inRange && matchesSearch;
  });

  /* ── DELETE ── */
  const handleDelete = async (id: number) => {
    try {
      await deletePaymentOut(id);
      setPayments((prev) => prev.filter((p) => p.id !== id));
      setOpenActionId(null);
      setViewingPayment(null);
    } catch (err) {
      console.error(err);
    }
  };

  /* ── VIEW DETAIL ──
   * Fetches full PaymentOut with:
   *   party relation
   *   invoices → PaymentOutInvoice[] with purchaseInvoice relation
   */
  const handleViewPayment = async (payment: any) => {
    try {
      const res = await getPaymentOutById(payment.id);
      setViewingPayment(res.data);
    } catch (err) {
      console.error("Failed to load payment details", err);
      setViewingPayment(payment); // fallback to list data
    }
  };

  /* ── DETAIL VIEW ── */
  if (viewingPayment) {
    return (
      <PaymentOutView
        payment={viewingPayment}
        onBack={() => setViewingPayment(null)}
        onDelete={(id) => handleDelete(id)}
      />
    );
  }

  /* ── LIST VIEW ── */
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
                      onClick={() => {
                        setSelectedLabel(option);
                        setSelectedRange(getRange(option));
                        setShowDateDropdown(false);
                      }}
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

        <button className="create-btn" onClick={() => navigate("/cashier/payment-out")}>
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
              <th>Amount Paid</th>
              <th>Discount</th>
              <th>Payment Mode</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <tr key={payment.id} className="pol-clickable-row" onClick={() => handleViewPayment(payment)}>
                  {/* PaymentOut.date DateTime */}
                  <td>{formatDate(payment.date)}</td>
                  {/* PaymentOut.paymentNumber String */}
                  <td>{payment.paymentNumber}</td>
                  {/* PaymentOut.party.name — nested relation */}
                  <td>{payment.partyName || "—"}</td>
                  {/* PaymentOut.amountPaid Decimal */}
                  <td>₹ {Number(payment.amountPaid || 0).toLocaleString("en-IN")}</td>
                  {/* PaymentOut.discount Decimal? */}
                  <td>₹ {Number(payment.discount || 0).toLocaleString("en-IN")}</td>
                  {/* PaymentOut.paymentMode PaymentMode enum */}
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
                          <button
                            className="action-dropdown-item delete"
                            onClick={(e) => { e.stopPropagation(); handleDelete(payment.id); }}
                          >
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