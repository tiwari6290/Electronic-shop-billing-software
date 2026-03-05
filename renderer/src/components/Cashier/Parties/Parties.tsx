import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  Search,
  ChevronDown,
  Settings,
  MoreVertical,
  FileText,
  Layers,
} from "lucide-react";
import "./Parties.css";
import axios from "axios";

interface Party {
  id: number;
  name: string;
  category: string;
  mobile: string;
  type: "Customer" | "Supplier";
  balance: number;
}

/*const partyData: Party[] = [
  {
    id: 1,
    name: "anando",
    category: "-",
    mobile: "0987643211",
    type: "Customer",
    balance: 82000,
  },
  {
    id: 2,
    name: "Cash Sale",
    category: "-",
    mobile: "9555780835",
    type: "Customer",
    balance: 0,
  },
  {
    id: 3,
    name: "eghwh",
    category: "Appliance",
    mobile: "7621583903",
    type: "Supplier",
    balance: -15000,
  },
  {
    id: 4,
    name: "MONDAL ELECTRONIC",
    category: "-",
    mobile: "7003236738",
    type: "Customer",
    balance: 0,
  },
  {
    id: 5,
    name: "ranjan",
    category: "-",
    mobile: "-",
    type: "Customer",
    balance: 22400,
  },
];*/

const Parties: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "collect" | "pay">("all");
  const [parties, setParties] = useState<Party[]>([]);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [deletePartyId, setDeletePartyId] = useState<number | null>(null);
  const [categories, setCategories] = useState<string[]>(["Appliance"]);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const [showDropdown, setShowDropdown] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [newCategory, setNewCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const categoryCount = (cat: string) =>
    parties.filter((p) => p.category === cat).length;
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;

    if (!categories.includes(newCategory)) {
      const updated = [...categories, newCategory];

      setCategories(updated);
      localStorage.setItem("categories", JSON.stringify(updated));
    }

    setNewCategory("");
    setShowModal(false);
  };

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
  // Filter Logic
  const filteredParties = useMemo(() => {
    let filtered = parties;

    // Balance Filter
    if (filter === "collect") {
      filtered = filtered.filter((p) => p.balance > 0);
    } else if (filter === "pay") {
      filtered = filtered.filter((p) => p.balance < 0);
    }

    // Category Filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    // Search by Name
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered;
  }, [filter, selectedCategory, searchTerm, parties]);

  // Calculate Totals
  const totalCollect = parties
    .filter((p) => p.balance > 0)
    .reduce((acc, curr) => acc + curr.balance, 0);

  const totalPay = parties
    .filter((p) => p.balance < 0)
    .reduce((acc, curr) => acc + Math.abs(curr.balance), 0);

  return (
    <div className="parties-container">
      {/* Header */}
      <div className="parties-header">
        <h2>Parties</h2>

        <div className="header-right">
          <button className="outline-btn">
            <FileText size={16} />
            Reports
            <ChevronDown size={16} />
          </button>

          <button className="icon-btn">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div
          className={`card ${filter === "all" ? "active-card" : ""}`}
          onClick={() => setFilter("all")}
        >
          <p>All Parties</p>
          <h3>{parties.length}</h3>
        </div>

        <div
          className={`card ${filter === "collect" ? "active-card" : ""}`}
          onClick={() => setFilter("collect")}
        >
          <p className="green-text">To Collect</p>
          <h3>₹ {totalCollect.toLocaleString()}</h3>
        </div>

        <div
          className={`card ${filter === "pay" ? "active-card" : ""}`}
          onClick={() => setFilter("pay")}
        >
          <p className="red-text">To Pay</p>
          <h3>₹ {totalPay.toLocaleString()}</h3>
        </div>
      </div>

      {/* Search + Actions */}
      <div className="actions-bar">
        <div className="left-actions">
          {/* 🔎 Search Party */}
          <div className="search-partyy">
            <input
              type="text"
              placeholder="Search Party"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="aa" size={16} />
          </div>
          <div className="category-wrapper">
            <div
              className="search-box"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span>
                {selectedCategory === "All"
                  ? "Search Categories"
                  : selectedCategory}
              </span>
              <ChevronDown size={16} />
            </div>

            {showDropdown && (
              <div className="dropdown">
                <div
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedCategory("All");
                    setShowDropdown(false);
                  }}
                >
                  All ({parties.length})
                </div>

                {categories.map((cat) => (
                  <div
                    key={cat}
                    className="dropdown-item"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setShowDropdown(false);
                    }}
                  >
                    {cat} ({categoryCount(cat)})
                  </div>
                ))}

                <div
                  className="create-category"
                  onClick={() => {
                    setShowModal(true);
                    setShowDropdown(false);
                  }}
                >
                  + Create Category
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="right-actions">
          <button className="outline-btn">
            <Layers size={16} />
            Bulk Action
            <ChevronDown size={16} />
          </button>

          <button
            className="primary-btn"
            onClick={() => navigate("/cashier/create-party")}
          >
            Create Party
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="party-table">
          <thead>
            <tr>
              <th>Party Name</th>
              <th>Category</th>
              <th>Mobile Number</th>
              <th>Party Type</th>
              <th>Balance</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filteredParties.map((party) => (
              <tr
                key={party.id}
                onClick={() => navigate(`/cashier/party/${party.id}`)}
                style={{ cursor: "pointer" }}
              >
                <td
  style={{ color: "#4f46e5", fontWeight: 500 }}
  onClick={(e) => {
    e.stopPropagation(); // 👈 THIS WAS MISSING
    navigate(`/cashier/party-ledger/${party.id}`);
  }}
>
  {party.name}
</td>
                <td>{party.category}</td>
                <td>{party.mobile}</td>
                <td>{party.type}</td>
                <td>
                  {party.balance > 0 && (
                    <span className="balance-positive">
                      ↓ ₹ {party.balance.toLocaleString()}
                    </span>
                  )}
                  {party.balance < 0 && (
                    <span className="balance-negative">
                      ↑ ₹ {Math.abs(party.balance).toLocaleString()}
                    </span>
                  )}
                  {party.balance === 0 && "₹ 0"}
                </td>
                <td style={{ position: "relative" }}>
                  <MoreVertical
                    size={18}
                    className="menu-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === party.id ? null : party.id);
                    }}
                  />

                  {activeMenu === party.id && (
                    <div className="action-menu">
                      <div
                        className="action-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/cashier/create-party/${party.id}`);
                        }}
                      >
                        Edit
                      </div>

                      <div
                        className="action-item delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletePartyId(party.id);
                          setActiveMenu(null);
                        }}
                      >
                        Delete
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Category</h3>
              <button className="abcd" onClick={() => setShowModal(false)}>
                X
              </button>
            </div>

            <div className="modal-body">
              <label>Category Name</label>
              <input
                type="text"
                placeholder="Ex: Snacks"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <button className="abc" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button
                className="abc delete-btn"
                onClick={async () => {
                try {
               await axios.delete(
                `http://localhost:5000/api/parties/${deletePartyId}`
               );

              setParties((prev) =>
              prev.filter((p) => p.id !== deletePartyId)
                  );

                  setDeletePartyId(null);
                } catch (error) {
                  console.error("Error deleting party:", error);
                }
              }}    
              >
                Delete
              </button>
              <button className="abc" onClick={handleAddCategory}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parties;
