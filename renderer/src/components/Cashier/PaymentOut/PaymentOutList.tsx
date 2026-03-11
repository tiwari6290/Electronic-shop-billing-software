import "./PaymentOutList.css";
import { Search, Calendar, Settings2, ChevronDown, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

export default function PaymentOutList() {
  const navigate = useNavigate();

  /* ================= LOAD PAYMENTS ================= */
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const storedPayments = JSON.parse(localStorage.getItem("paymentOutList") || "[]");
    setPayments(storedPayments);
  }, []);

  /* ================= ACTION DROPDOWN (3-dot menu) ================= */
  const [openActionId, setOpenActionId] = useState<number | null>(null);
  const actionRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openActionId !== null) {
        const ref = actionRefs.current[openActionId];
        if (ref && !ref.contains(e.target as Node)) {
          setOpenActionId(null);
        }
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
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const getRange = (label: string): { start: Date; end: Date } => {
    const start = new Date(today);
    const end = new Date(today);

    switch (label) {
      case "Today":
        break;
      case "Yesterday":
        start.setDate(today.getDate() - 1);
        end.setDate(today.getDate() - 1);
        break;
      case "This Week": {
        const day = today.getDay();
        start.setDate(today.getDate() - day);
        break;
      }
      case "Last Week": {
        const day = today.getDay();
        start.setDate(today.getDate() - day - 7);
        end.setDate(today.getDate() - day - 1);
        break;
      }
      case "Last 7 Days":
        start.setDate(today.getDate() - 6);
        break;
      case "This Month":
        start.setDate(1);
        break;
      case "Previous Month":
        start.setMonth(today.getMonth() - 1);
        start.setDate(1);
        end.setMonth(today.getMonth());
        end.setDate(0);
        break;
      case "Last 30 Days":
        start.setDate(today.getDate() - 29);
        break;
      case "This Quarter": {
        const q = Math.floor(today.getMonth() / 3);
        start.setMonth(q * 3);
        start.setDate(1);
        end.setMonth(q * 3 + 3);
        end.setDate(0);
        break;
      }
      case "Previous Quarter": {
        const q = Math.floor(today.getMonth() / 3) - 1;
        const adjustedQ = q < 0 ? 3 : q;
        const yearOffset = q < 0 ? -1 : 0;
        start.setFullYear(today.getFullYear() + yearOffset);
        start.setMonth(adjustedQ * 3);
        start.setDate(1);
        end.setFullYear(today.getFullYear() + yearOffset);
        end.setMonth(adjustedQ * 3 + 3);
        end.setDate(0);
        break;
      }
      case "Current Fiscal Year": {
        const fiscalStart = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
        start.setFullYear(fiscalStart);
        start.setMonth(3);
        start.setDate(1);
        end.setFullYear(fiscalStart + 1);
        end.setMonth(2);
        end.setDate(31);
        break;
      }
      case "Previous Fiscal Year": {
        const fiscalStart = (today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1) - 1;
        start.setFullYear(fiscalStart);
        start.setMonth(3);
        start.setDate(1);
        end.setFullYear(fiscalStart + 1);
        end.setMonth(2);
        end.setDate(31);
        break;
      }
      case "Last 365 Days":
        start.setDate(today.getDate() - 364);
        break;
      default:
        break;
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const getRangeDisplay = (label: string) => {
    const { start, end } = getRange(label);
    return `${formatDisplay(start)} to ${formatDisplay(end)}`;
  };

  useEffect(() => {
    setSelectedRange(getRange("Today"));
  }, []);

  const dateOptions = [
    "Today",
    "Yesterday",
    "This Week",
    "Last Week",
    "Last 7 Days",
    "This Month",
    "Previous Month",
    "Last 30 Days",
    "This Quarter",
    "Previous Quarter",
    "Current Fiscal Year",
    "Previous Fiscal Year",
    "Last 365 Days",
    "Custom Date Range",
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDateDropdown(false);
      }
    };
    if (showDateDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDateDropdown]);

  /* ================= PARSE DATE FROM STORED STRING ================= */
  const parsePaymentDate = (dateStr: string): Date => {
    // Handles "08 Feb 2026" or "08/02/2026" or ISO strings
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed;
    // Try "DD MMM YYYY"
    const parts = dateStr.split(" ");
    if (parts.length === 3) {
      const months: Record<string, number> = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
      };
      const d = new Date(parseInt(parts[2]), months[parts[1]], parseInt(parts[0]));
      return d;
    }
    return new Date();
  };

  /* ================= FILTERED PAYMENTS ================= */
  const filteredPayments = payments.filter((payment) => {
    // Date filter
    const paymentDate = parsePaymentDate(payment.date);
    paymentDate.setHours(12, 0, 0, 0);
    const inRange =
      paymentDate >= selectedRange.start && paymentDate <= selectedRange.end;

    // Search filter
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
  };

  /* ================= EDIT ================= */
  const handleEdit = (payment: any) => {
    localStorage.setItem("editingPayment", JSON.stringify(payment));
    navigate("/cashier/payment-out");
    setOpenActionId(null);
  };

  return (
    <div className="paymentoutlist-page">
      <div className="paymentoutlist-header">
        <div>
          <h2>Payment Out</h2>
        </div>
        <div className="header-actions">
          <button className="icon-btn">
            <Settings2 size={18} />
          </button>
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
                onBlur={() => {
                  if (!searchQuery) setShowSearch(false);
                }}
              />
            )}
          </div>

          <div className="date-filter-wrapper" ref={dropdownRef}>
            <div
              className="date-filter"
              onClick={() => setShowDateDropdown((prev) => !prev)}
            >
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

        <button
          className="create-btn"
          onClick={() => {
            localStorage.removeItem("editingPayment");
            navigate("/cashier/payment-out");
          }}
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
                <tr key={payment.id}>
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
                    >
                      <button
                        className="three-dot-btn"
                        onClick={() =>
                          setOpenActionId(
                            openActionId === payment.id ? null : payment.id
                          )
                        }
                      >
                        <MoreVertical size={16} />
                      </button>

                      {openActionId === payment.id && (
                        <div className="action-dropdown">
                          <button
                            className="action-dropdown-item edit"
                            onClick={() => handleEdit(payment)}
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            className="action-dropdown-item delete"
                            onClick={() => handleDelete(payment.id)}
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