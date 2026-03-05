import "./PaymentOutList.css";
import { Search, Calendar, Settings2, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

export default function PaymentOutList() {
  const navigate = useNavigate();

  /* ================= NEW: LOAD PAYMENTS ================= */
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const storedPayments =
      JSON.parse(localStorage.getItem("paymentOutList") || "[]");
    setPayments(storedPayments);
  }, []);

  /* ================= DATE DROPDOWN ================= */
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("Today");
  const [selectedRange, setSelectedRange] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const today = new Date();

  const getRange = (label: string) => {
    const start = new Date();
    const end = new Date();

    switch (label) {
      case "Today":
        break;
      case "Yesterday":
        start.setDate(today.getDate() - 1);
        end.setDate(today.getDate() - 1);
        break;
      case "Last 7 Days":
        start.setDate(today.getDate() - 6);
        break;
      case "Last 30 Days":
        start.setDate(today.getDate() - 29);
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
      case "Last 365 Days":
        start.setDate(today.getDate() - 364);
        break;
      default:
        break;
    }

    return `${formatDate(start)} to ${formatDate(end)}`;
  };

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
    setSelectedRange(getRange("Today"));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDateDropdown(false);
      }
    };

    if (showDateDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDateDropdown]);

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
              <div
                className="search-icon-box"
                onClick={() => setShowSearch(true)}
              >
                <Search size={16} />
              </div>
            ) : (
              <input
                type="text"
                className="search-input"
                placeholder="Search by party name or invoice number"
                autoFocus
                onBlur={() => setShowSearch(false)}
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
                  {dateOptions.map((option) => {
                    const range = getRange(option);

                    return (
                      <div
                        key={option}
                        className={`date-dropdown-row ${
                          selectedLabel === option ? "active-date" : ""
                        }`}
                        onClick={() => {
                          setSelectedLabel(option);
                          setSelectedRange(range);
                          setShowDateDropdown(false);
                        }}
                      >
                        <span className="date-label">{option}</span>
                        <span className="date-range">{range}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          className="create-btn"
          onClick={() => navigate("/cashier/payment-out")}
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
  {payments.length > 0 ? (
    payments.map((payment) => (
      <tr key={payment.id}>
        <td>{payment.date}</td>
        <td>{payment.paymentNumber}</td>
        <td>{payment.partyName}</td>
        <td>₹ {payment.totalAmountSettled}</td>
        <td>₹ {payment.amountReceived}</td>
        <td>{payment.paymentMode}</td>
        <td style={{ display: "flex", gap: "8px" }}>
          {/* EDIT */}
          <button
            className="edit-btn"
            onClick={() => {
              localStorage.setItem(
                "editingPayment",
                JSON.stringify(payment)
              );
              navigate("/cashier/payment-out");
            }}
          >
            Edit
          </button>

          {/* DELETE */}
          <button
            className="delete-btn"
            onClick={() => {
              const updated = payments.filter(
                (p) => p.id !== payment.id
              );
              setPayments(updated);
              localStorage.setItem(
                "paymentInList",
                JSON.stringify(updated)
              );
            }}
          >
            Delete
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
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