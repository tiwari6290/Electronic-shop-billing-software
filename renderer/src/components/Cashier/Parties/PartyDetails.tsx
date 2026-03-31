import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, FileText, Edit, Trash2, ChevronDown,
  Search, MessageSquare, Calendar,
} from "lucide-react";
import "./PartyDetails.css";
import PartyProfile from "./PartyProfile";
import PartyItemWiseReport from "./PartyItemWiseReport";
import PartyLedger from "./PartyLedger";
import api from "@/lib/axios";

interface Party {
  id: number;
  name: string;
  category: string;
  mobile: string;
  type: "Customer" | "Supplier";
  balance: number;
}

interface Transaction {
  id: number;
  date: string;
  type: string;
  number: number;
  amount: number;
  status: "Paid" | "Partial Paid" | "Unpaid";
}

// ── Calendar Picker ────────────────────────────────────────────────────────
const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
const DAYS = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

interface CalendarPickerProps {
  fromDate: string;
  toDate: string;
  onApply: (from: string, to: string) => void;
  onCancel: () => void;
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({ fromDate, toDate, onApply, onCancel }) => {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [selFrom,   setSelFrom]   = useState<Date | null>(fromDate ? new Date(fromDate) : null);
  const [selTo,     setSelTo]     = useState<Date | null>(toDate   ? new Date(toDate)   : null);
  const [hovering,  setHovering]  = useState<Date | null>(null);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

  const fmtDisplay = (d: Date | null) =>
    d ? `${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)} ${d.getFullYear()}` : null;

  const getDays = () => {
    const first = new Date(viewYear, viewMonth, 1).getDay();
    const total = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prev  = new Date(viewYear, viewMonth, 0).getDate();
    const cells: { date: Date; curr: boolean }[] = [];
    for (let i = first - 1; i >= 0; i--)
      cells.push({ date: new Date(viewYear, viewMonth - 1, prev - i), curr: false });
    for (let d = 1; d <= total; d++)
      cells.push({ date: new Date(viewYear, viewMonth, d), curr: true });
    while (cells.length < 42)
      cells.push({ date: new Date(viewYear, viewMonth + 1, cells.length - first - total + 1), curr: false });
    return cells;
  };

  const handleDayClick = (d: Date) => {
    if (!selFrom || (selFrom && selTo)) { setSelFrom(d); setSelTo(null); }
    else { if (d < selFrom) { setSelFrom(d); setSelTo(null); } else setSelTo(d); }
  };

  const inRange = (d: Date) => {
    const end = selTo || hovering;
    if (!selFrom || !end) return false;
    const [a, b] = selFrom < end ? [selFrom, end] : [end, selFrom];
    return d > a && d < b;
  };
  const isFrom = (d: Date) => selFrom ? fmt(d) === fmt(selFrom) : false;
  const isTo   = (d: Date) => selTo   ? fmt(d) === fmt(selTo)   : false;
  const cells  = getDays();

  return (
    <div className="cal-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="cal-header">
        <span className="cal-header-label">{selFrom ? fmtDisplay(selFrom) : "Select Start Date"}</span>
        <span className="cal-header-dash">—</span>
        <span className="cal-header-label cal-header-right">{selTo ? fmtDisplay(selTo) : "End Date"}</span>
      </div>
      <div className="cal-nav-row">
        <div className="cal-nav-block">
          <button className="cal-nav-btn" onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); } else setViewMonth(m => m-1); }}>&#8249;</button>
          <span className="cal-nav-label">{MONTHS[viewMonth]}</span>
          <button className="cal-nav-btn" onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); } else setViewMonth(m => m+1); }}>&#8250;</button>
        </div>
        <div className="cal-nav-block">
          <button className="cal-nav-btn" onClick={() => setViewYear(y => y-1)}>&#8249;</button>
          <span className="cal-nav-label">{viewYear}</span>
          <button className="cal-nav-btn" onClick={() => setViewYear(y => y+1)}>&#8250;</button>
        </div>
      </div>
      <div className="cal-grid">
        {DAYS.map(d => <div key={d} className="cal-day-label">{d}</div>)}
        {cells.map((cell, i) => (
          <div key={i}
            className={["cal-day", !cell.curr ? "cal-day-out" : "", isFrom(cell.date) ? "cal-day-from" : "", isTo(cell.date) ? "cal-day-to" : "", inRange(cell.date) ? "cal-day-range" : ""].join(" ")}
            onClick={() => cell.curr && handleDayClick(cell.date)}
            onMouseEnter={() => { if (selFrom && !selTo) setHovering(cell.date); }}
            onMouseLeave={() => setHovering(null)}
          >{cell.date.getDate()}</div>
        ))}
      </div>
      <div className="cal-footer">
        <button className="cal-cancel" onClick={onCancel}>CANCEL</button>
        <button className="cal-ok" onClick={() => { if (selFrom && selTo) onApply(fmt(selFrom), fmt(selTo)); else if (selFrom) onApply(fmt(selFrom), fmt(selFrom)); }}>OK</button>
      </div>
    </div>
  );
};
// ───────────────────────────────────────────────────────────────────────────

const fmtDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const PartyDetails: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Transactions");
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const [dateFilter, setDateFilter] = useState("Last 365 Days");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [typeFilter, setTypeFilter] = useState("All Transactions");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const [statusFilter, setStatusFilter] = useState("All");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const [parties, setParties] = useState<Party[]>([]);
  const [party, setParty] = useState<Party | null>(null);
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const res = await api.get("/parties");
        const formatted = res.data.data.map((p: any) => ({
          id: p.id,
          name: p.partyName,
          category: p.partyCategory || "-",
          mobile: p.mobileNumber || "-",
          type: p.partyType,
          balance: p.openingBalanceType === "To_Collect" ? Number(p.openingBalance) : -Number(p.openingBalance),
        }));
        setParties(formatted);
      } catch (error) {
        console.error("Error fetching parties:", error);
      }
    };
    fetchParties();
  }, []);

  useEffect(() => {
    const selected = parties.find((p) => p.id === Number(id));
    if (selected) setParty(selected);
  }, [id, parties]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get(`/transactions/party/${id}`);
        const formatted = res.data.data?.map((t: any) => ({
          id: t.id,
          date: t.date,
          type: t.type,
          number: t.number || t.id,
          amount: t.amount,
          status: t.status || "Unpaid",
        })) || [];
        setTransactions(formatted);
      } catch {
        setTransactions([]);
      }
    };
    if (id) fetchTransactions();
  }, [id]);

  const filteredParties = useMemo(() =>
    parties.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [search, parties]);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    const now = new Date(); now.setHours(23,59,59,999);

    filtered = filtered.filter((t) => {
      if (!t.date) return true;
      const d = new Date(t.date);
      switch (dateFilter) {
        case "Today": { const s = new Date(); s.setHours(0,0,0,0); return d >= s && d <= now; }
        case "Yesterday": { const s = new Date(); s.setDate(s.getDate()-1); s.setHours(0,0,0,0); const e = new Date(); e.setDate(e.getDate()-1); e.setHours(23,59,59,999); return d >= s && d <= e; }
        case "This Week": { const s = new Date(); s.setDate(s.getDate()-s.getDay()); s.setHours(0,0,0,0); return d >= s && d <= now; }
        case "Last Week": { const s = new Date(); s.setDate(s.getDate()-s.getDay()-7); s.setHours(0,0,0,0); const e = new Date(); e.setDate(e.getDate()-e.getDay()-1); e.setHours(23,59,59,999); return d >= s && d <= e; }
        case "Last 7 Days": { const s = new Date(); s.setDate(s.getDate()-7); s.setHours(0,0,0,0); return d >= s && d <= now; }
        case "This Month": { const s = new Date(now.getFullYear(), now.getMonth(), 1); return d >= s && d <= now; }
        case "Previous Month": { const s = new Date(now.getFullYear(), now.getMonth()-1, 1); const e = new Date(now.getFullYear(), now.getMonth(), 0); e.setHours(23,59,59,999); return d >= s && d <= e; }
        case "Last 30 Days": { const s = new Date(); s.setDate(s.getDate()-30); s.setHours(0,0,0,0); return d >= s && d <= now; }
        case "This Quarter": { const q = Math.floor(now.getMonth()/3); const s = new Date(now.getFullYear(), q*3, 1); return d >= s && d <= now; }
        case "Previous Quarter": { const q = Math.floor(now.getMonth()/3); const s = new Date(now.getFullYear(),(q-1)*3,1); const e = new Date(now.getFullYear(),q*3,0); e.setHours(23,59,59,999); return d >= s && d <= e; }
        case "Current Fiscal Year": { const fy = now.getMonth()>=3 ? now.getFullYear() : now.getFullYear()-1; return d >= new Date(fy,3,1) && d <= now; }
        case "Previous Fiscal Year": { const fy = now.getMonth()>=3 ? now.getFullYear()-1 : now.getFullYear()-2; const s = new Date(fy,3,1); const e = new Date(fy+1,2,31); e.setHours(23,59,59,999); return d >= s && d <= e; }
        case "Last 365 Days": { const s = new Date(); s.setDate(s.getDate()-365); s.setHours(0,0,0,0); return d >= s && d <= now; }
        case "Custom": {
          if (!customFrom && !customTo) return true;
          const from = customFrom ? new Date(customFrom) : new Date(0);
          const to   = customTo   ? new Date(customTo)   : now;
          to.setHours(23,59,59,999);
          return d >= from && d <= to;
        }
        default: return true;
      }
    });

    if (typeFilter !== "All Transactions") filtered = filtered.filter((t) => t.type === typeFilter);
    if (statusFilter !== "All")            filtered = filtered.filter((t) => t.status === statusFilter);
    return filtered;
  }, [transactions, typeFilter, statusFilter, dateFilter, customFrom, customTo]);

  if (!party) return <div style={{ padding: "20px" }}>Loading party...</div>;

  const dateLabel =
    dateFilter === "Custom" && customFrom && customTo
      ? `${customFrom} to ${customTo}`
      : dateFilter === "Custom"
      ? "Custom Date Range"
      : dateFilter;

  return (
    <div className="party-details-layout">
      {/* LEFT SIDEBAR */}
      <div className="party-sidebar">
        <div className="search-box">
          <Search size={15} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search Party"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="party-list">
          {filteredParties.map((p) => (
            <div key={p.id} className={`party-card ${p.id === party.id ? "active" : ""}`}
              onClick={() => navigate(`/cashier/party/${p.id}`)}>
              <div>
                <h4>{p.name}</h4>
                <p>&#8377;{p.balance.toLocaleString("en-IN")}</p>
              </div>
              {p.balance > 0 && <span className="arrow up">&#8593;</span>}
              {p.balance < 0 && <span className="arrow down">&#8595;</span>}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="party-content">
        {/* Header */}
        <div className="details-header">
          <div className="left">
            <ArrowLeft size={20} className="back-icon" onClick={() => navigate("/cashier/parties")} />
            <h2>{party.name}</h2>
          </div>
          <div className="right">
            <div className="create-dropdown-wrapper">
              <button className="create-invoice-btn" onClick={() => setShowCreateMenu(!showCreateMenu)}>
                <FileText size={15} /> Create Sales Invoice <ChevronDown size={14} />
              </button>
              {showCreateMenu && (
                <div className="create-dropdown">
                  <div onClick={() => navigate("/cashier/sales-invoice")}><FileText size={13} /> Sales Invoice</div>
                  <div onClick={() => navigate("/cashier/payment-in")}><span className="dd-icon">&#8377;</span> Payment In</div>
                  <div onClick={() => navigate("/cashier/quotation")}><span className="dd-icon">&#8377;</span> Quotation</div>
                  <div onClick={() => navigate("/cashier/proforma-invoice")}><FileText size={13} /> Proforma Invoice</div>
                  <div onClick={() => navigate("/cashier/sales-return")}><span className="dd-icon">&#8377;</span> Sales Return</div>
                  <div onClick={() => navigate("/cashier/delivery-challan")}><FileText size={13} /> Delivery Challan</div>
                  <div onClick={() => navigate("/cashier/purchase-orders-form")}><FileText size={13} /> Purchase Order</div>
                </div>
              )}
            </div>
            <button className="hdr-icon-btn" onClick={() => navigate(`/cashier/create-party/${party.id}`)}>
              <Edit size={15} /> Edit
            </button>
            <button className="hdr-icon-btn danger"><Trash2 size={15} /></button>
            <button className="hdr-icon-btn"><MessageSquare size={15} /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {["Transactions","Profile","Ledger","ItemWise"].map((tab) => (
            <div key={tab} className={`tab-item ${activeTab === tab ? "active-tab" : ""}`}
              onClick={() => setActiveTab(tab)}>
              {tab === "Ledger" ? "Ledger (Statement)" : tab === "ItemWise" ? "Item Wise Report" : tab}
            </div>
          ))}
        </div>

        {/* Filters */}
        {activeTab === "Transactions" && (
          <div className="filter-row">
            {/* Date Filter */}
            <div className="filter-dropdown" style={{ position: "relative" }}>
              <button className="filter-btn" onClick={() => { setShowDateDropdown(!showDateDropdown); setShowCalendar(false); setShowTypeDropdown(false); setShowStatusDropdown(false); }}>
                <Calendar size={14} className="filter-calendar" />
                {dateLabel}
                <ChevronDown size={14} />
              </button>

              {showDateDropdown && !showCalendar && (
                <div className="dropdown-menu">
                  {["Today","Yesterday","This Week","Last Week","Last 7 Days","This Month","Previous Month",
                    "Last 30 Days","This Quarter","Previous Quarter","Current Fiscal Year","Previous Fiscal Year","Last 365 Days","Custom"
                  ].map((item) => (
                    <div key={item} className={dateFilter === item ? "selected" : ""}
                      onClick={() => {
                        if (item === "Custom") { setShowCalendar(true); setShowDateDropdown(false); setDateFilter("Custom"); }
                        else { setDateFilter(item); setCustomFrom(""); setCustomTo(""); setShowDateDropdown(false); }
                      }}>
                      {item}
                    </div>
                  ))}
                </div>
              )}

              {showCalendar && (
                <CalendarPicker
                  fromDate={customFrom}
                  toDate={customTo}
                  onApply={(from, to) => { setCustomFrom(from); setCustomTo(to); setShowCalendar(false); }}
                  onCancel={() => { setShowCalendar(false); setDateFilter("Last 365 Days"); setCustomFrom(""); setCustomTo(""); }}
                />
              )}
            </div>

            {/* Type Filter */}
            <div className="filter-dropdown">
              <button className="filter-btn" onClick={() => { setShowTypeDropdown(!showTypeDropdown); setShowDateDropdown(false); setShowStatusDropdown(false); }}>
                {typeFilter} <ChevronDown size={14} />
              </button>
              {showTypeDropdown && (
                <div className="dropdown-menu">
                  {["All Transactions","Sales Invoice","Sales Return","Payment In","Payment Out","Quotation","Purchase Return","Credit Note","Debit Note"].map((item) => (
                    <div key={item} className={typeFilter === item ? "selected" : ""} onClick={() => { setTypeFilter(item); setShowTypeDropdown(false); }}>{item}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div className="filter-dropdown">
              <button className="filter-btn" onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowDateDropdown(false); setShowTypeDropdown(false); }}>
                {statusFilter === "All" ? "Select Status" : statusFilter} <ChevronDown size={14} />
              </button>
              {showStatusDropdown && (
                <div className="dropdown-menu">
                  {["All","Paid","Unpaid","Overdue","Cancelled"].map((item) => (
                    <div key={item} className={statusFilter === item ? "selected" : ""} onClick={() => { setStatusFilter(item); setShowStatusDropdown(false); }}>{item}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transactions Table */}
        {activeTab === "Transactions" && (
          <div className="content-table-wrapper">
            <table className="content-table">
              <thead>
                <tr>
                  <th>Date &#8693;</th>
                  <th>Transaction Type</th>
                  <th>Transaction Number</th>
                  <th>Amount &#8693;</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr><td colSpan={5} className="no-txn">No transactions for the selected time period</td></tr>
                ) : (
                  filteredTransactions.map((txn) => (
                    <tr key={`${txn.type}-${txn.id}`}>
                      <td>{fmtDate(txn.date)}</td>
                      <td>{txn.type}</td>
                      <td>{txn.number}</td>
                      <td>&#8377; {txn.amount.toLocaleString("en-IN")}</td>
                      <td>
                        <span className={`status-badge ${txn.status === "Paid" ? "paid" : txn.status === "Partial Paid" ? "partial" : "unpaid"}`}>
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "Profile"   && <PartyProfile />}
        {activeTab === "Ledger"    && <PartyLedger />}
        {activeTab === "ItemWise"  && <PartyItemWiseReport />}
      </div>
    </div>
  );
};

export default PartyDetails;