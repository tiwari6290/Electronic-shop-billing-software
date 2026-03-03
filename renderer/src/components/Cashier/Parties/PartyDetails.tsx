import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Edit,
  Trash2,
  ChevronDown,
  Search,
} from "lucide-react";
import "./PartyDetails.css";
import PartyProfile from "./PartyProfile";
import PartyItemWiseReport from "./PartyItemWiseReport";

//import PartyLedger from "./PartyLedger";
import axios from "axios";
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

const PartyDetails: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Transactions");
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState("Last 365 Days");
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const [typeFilter, setTypeFilter] = useState("All Transactions");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const [statusFilter, setStatusFilter] = useState("All");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const [parties, setParties] = useState<Party[]>([]);
  const [party, setParty] = useState<Party | null>(null);
  const [search, setSearch] = useState("");

  const [transactions] = useState<Transaction[]>([

  ]);

  // Load all parties
useEffect(() => {
  const fetchParties = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/parties");

      const formatted = res.data.data.map((p: any) => ({
        id: p.id,
        name: p.partyName,
        category: p.partyCategory || "-",
        mobile: p.mobileNumber || "-",
        type: p.partyType,
        balance:
          p.openingBalanceType === "To_Collect"
            ? Number(p.openingBalance)
            : -Number(p.openingBalance),
      }));

      setParties(formatted);
    } catch (error) {
      console.error("Error fetching parties:", error);
    }
  };

  fetchParties();
}, []);

  // Set selected party
  useEffect(() => {
    const selectedParty = parties.find((p) => p.id === Number(id));
    if (selectedParty) setParty(selectedParty);
  }, [id, parties]);

  const filteredParties = useMemo(() => {
    return parties.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, parties]);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by Transaction Type
    if (typeFilter !== "All Transactions") {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    // Filter by Status
    if (statusFilter !== "All") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    return filtered;
  }, [transactions, typeFilter, statusFilter]);

 if (!party) return <div style={{ padding: "20px" }}>Loading party...</div>;

  return (
    <div className="party-details-layout">
      {/* LEFT SIDEBAR */}
      <div className="party-sidebar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search Party"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="party-list">
          {filteredParties.map((p) => (
            <div
              key={p.id}
              className={`party-card ${p.id === party.id ? "active" : ""}`}
              onClick={() => navigate(`/cashier/party/${p.id}`)}
            >
              <div>
                <h4>{p.name}</h4>
                <p>₹ {p.balance.toLocaleString()}</p>
              </div>

              {p.balance > 0 && <span className="arrow down">↓</span>}
              {p.balance < 0 && <span className="arrow up">↑</span>}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="party-content">
        {/* Header */}
        <div className="details-header">
          <div className="left">
            <ArrowLeft
              onClick={() => navigate("/cashier/parties")}
              className="back-icon"
            />
            <h2>{party.name}</h2>
          </div>

          <div className="right">
            <div className="create-dropdown-wrapper">
              <button
                className="outline-btn"
                onClick={() => setShowCreateMenu(!showCreateMenu)}
              >
                <FileText size={16} />
                Create Sales Invoice
                <ChevronDown size={16} />
              </button>

              {showCreateMenu && (
                <div className="create-dropdown">
                  <div onClick={() => navigate("/cashier/sales-invoice")}>
                    Sales Invoice
                  </div>

                  <div onClick={() => navigate("/cashier/payment-in")}>
                    Payment In
                  </div>

                  <div onClick={() => navigate("/cashier/quotation")}>
                    Quotation
                  </div>

                  <div onClick={() => navigate("/cashier/proforma-invoice")}>
                    Proforma Invoice
                  </div>

                  <div onClick={() => navigate("/cashier/sales-return")}>
                    Sales Return
                  </div>

                  <div onClick={() => navigate("/cashier/delivery-challan")}>
                    Delivery Challan
                  </div>

                  <div
                    onClick={() => navigate("/cashier/purchase-orders-form")}
                  >
                    Purchase Order
                  </div>
                </div>
              )}
            </div>

            <button className="icon-btn">
              <Edit size={16} />
            </button>

            <button className="icon-btn delete">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <div
            className={activeTab === "Transactions" ? "active-tab" : ""}
            onClick={() => setActiveTab("Transactions")}
          >
            Transactions
          </div>

          <div
            className={activeTab === "Profile" ? "active-tab" : ""}
            onClick={() => setActiveTab("Profile")}
          >
            Profile
          </div>

          <div>Ledger (Statement)</div>
          <div
  className={activeTab === "ItemWise" ? "active-tab" : ""}
  onClick={() => setActiveTab("ItemWise")}
>
  Item Wise Report
</div>
        </div>

        {/* Filters */}
        {/* Filters - ONLY for Transactions */}
{activeTab === "Transactions" && (
  <div className="filter-row">
    {/* DATE FILTER */}
    <div className="filter-dropdown">
      <button onClick={() => setShowDateDropdown(!showDateDropdown)}>
        {dateFilter} <ChevronDown size={16} />
      </button>

      {showDateDropdown && (
        <div className="dropdown-menu">
          {[
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
          ].map((item) => (
            <div
              key={item}
              onClick={() => {
                setDateFilter(item);
                setShowDateDropdown(false);
              }}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* TYPE FILTER */}
    <div className="filter-dropdown">
      <button onClick={() => setShowTypeDropdown(!showTypeDropdown)}>
        {typeFilter} <ChevronDown size={16} />
      </button>

      {showTypeDropdown && (
        <div className="dropdown-menu">
          {[
            "All Transactions",
            "Purchase",
            "Payment In",
            "Payment Out",
            "Quotation",
            "Sales Return",
            "Purchase Return",
            "Credit Note",
            "Debit Note",
          ].map((item) => (
            <div
              key={item}
              onClick={() => {
                setTypeFilter(item);
                setShowTypeDropdown(false);
              }}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* STATUS FILTER */}
    <div className="filter-dropdown">
      <button onClick={() => setShowStatusDropdown(!showStatusDropdown)}>
        {statusFilter} <ChevronDown size={16} />
      </button>

      {showStatusDropdown && (
        <div className="dropdown-menu">
          {["All", "Paid", "Unpaid", "Overdue", "Cancelled"].map((item) => (
            <div
              key={item}
              onClick={() => {
                setStatusFilter(item);
                setShowStatusDropdown(false);
              }}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}

        {/* Table */}
        {activeTab === "Transactions" && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Transaction Type</th>
                <th>Transaction Number</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.map((txn) => (
                <tr key={txn.id}>
                  <td>{txn.date}</td>
                  <td>{txn.type}</td>
                  <td>{txn.number}</td>
                  <td>₹ {txn.amount.toLocaleString()}</td>
                  <td>
                    <span
                      className={
                        txn.status === "Paid"
                          ? "status-paid"
                          : txn.status === "Partial Paid"
                            ? "status-partial"
                            : "status-unpaid"
                      }
                    >
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
        {activeTab === "Profile" && <PartyProfile />}
        {activeTab === "ItemWise" && <PartyItemWiseReport />}
      </div>
    </div>
  );
};

export default PartyDetails;

