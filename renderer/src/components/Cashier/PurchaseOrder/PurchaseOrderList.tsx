import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Calendar,
  ChevronDown,
  Settings,
} from "lucide-react";
import "./PurchaseOrderList.css";
import { useNavigate } from "react-router-dom";

type DateFilter =
  | "Today"
  | "Yesterday"
  | "This Week"
  | "Last Week"
  | "Last 7 Days"
  | "This Month"
  | "Previous Month"
  | "Last 30 Days"
  | "This Quarter"
  | "Previous Quarter"
  | "Current Fiscal Year"
  | "Previous Fiscal Year"
  | "Last 365 Days"
  | "Custom";

type StatusFilter =
  | "Show All Orders"
  | "Show Open Orders"
  | "Show Closed Orders";

const DATE_OPTIONS: DateFilter[] = [
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
  "Custom",
];

const STATUS_OPTIONS: StatusFilter[] = [
  "Show All Orders",
  "Show Open Orders",
  "Show Closed Orders",
];

const PurchaseOrderList: React.FC = () => {
    const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState<DateFilter>("Last 365 Days");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("Show Open Orders");

  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const dateRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  /* -------- Close dropdown on outside click -------- */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setShowDateDropdown(false);
      }
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="po-container">
      {/* Header */}
      <div className="po-header">
        <h1>Purchase Orders</h1>

        <div className="po-header-right">
          <button
            className="icon-btn"
            onClick={() => setShowSettings(true)}
          >
            <Settings size={18} />
            <span className="dot" />
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="po-filters">
        <button className="icon-btn">
          <Search size={16} />
        </button>

        {/* Date Dropdown */}
        <div className="dropdown" ref={dateRef}>
          <button
            className="filter-btn"
            onClick={() => setShowDateDropdown(!showDateDropdown)}
          >
            <Calendar size={16} />
            {dateFilter}
            <ChevronDown size={14} />
          </button>

          {showDateDropdown && (
            <div className="dropdown-menu">
              {DATE_OPTIONS.map((option) => (
                <div
                  key={option}
                  className={`dropdown-item ${
                    option === dateFilter ? "active" : ""
                  }`}
                  onClick={() => {
                    setDateFilter(option);
                    setShowDateDropdown(false);
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="dropdown" ref={statusRef}>
          <button
            className="filter-btn"
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
          >
            {statusFilter}
            <ChevronDown size={14} />
          </button>

          {showStatusDropdown && (
            <div className="dropdown-menu">
              {STATUS_OPTIONS.map((option) => (
                <div
                  key={option}
                  className={`dropdown-item ${
                    option === statusFilter ? "active" : ""
                  }`}
                  onClick={() => {
                    setStatusFilter(option);
                    setShowStatusDropdown(false);
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
  className="create-btn"
  onClick={() => navigate("/cashier/purchase-orders")}
>
  Create Purchase Order
</button>
      </div>

      {/* Table */}
      <div className="po-table-wrapper">
        <table className="po-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Purchase Order Number</th>
              <th>Party Name</th>
              <th>Valid Till</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="empty">
                No Transactions Matching the current filter
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Quick Purchase Order Settings</h3>

            <div className="modal-section">
              <p className="modal-title">
                Purchase Order Prefix & Sequence Number
              </p>
              <div className="modal-row">
                <input placeholder="Prefix" />
                <input placeholder="Sequence Number" defaultValue="1" />
              </div>
            </div>

            <div className="modal-section">
              <label>
                <input type="checkbox" defaultChecked />
                Show Item Image on Invoice
              </label>
            </div>

            <div className="modal-section">
              <label>
                <input type="checkbox" defaultChecked />
                Price History
              </label>
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowSettings(false)}>
                Cancel
              </button>
              <button className="primary">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderList;