import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, ChevronDown, Settings, MoreVertical, FileText,
  Layers, Users, TrendingDown, TrendingUp, Edit2, Trash2,
  Link2, MessageSquare, X,
} from "lucide-react";
import "./Parties.css";
import api from "@/lib/axios";

interface Party {
  id: number;
  name: string;
  category: string;
  mobile: string;
  type: "Customer" | "Supplier";
  balance: number;
}

const Parties: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "collect" | "pay">("all");
  const [parties, setParties] = useState<Party[]>([]);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [deletePartyId, setDeletePartyId] = useState<number | null>(null);
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem("categories");
    return saved ? JSON.parse(saved) : ["Appliance"];
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = () => setActiveMenu(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const categoryCount = (cat: string) => parties.filter((p) => p.category === cat).length;

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    if (!categories.includes(newCategory)) {
      const updated = [...categories, newCategory];
      setCategories(updated);
      localStorage.setItem("categories", JSON.stringify(updated));
    }
    setNewCategory("");
    setShowCategoryModal(false);
  };

  const handleDeleteParty = async () => {
    if (!deletePartyId) return;
    try {
      await api.delete(`/parties/${deletePartyId}`);
      setParties((prev) => prev.filter((p) => p.id !== deletePartyId));
      setDeletePartyId(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting party:", error);
    }
  };

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

  const filteredParties = useMemo(() => {
    let f = parties;
    if (filter === "collect") f = f.filter((p) => p.balance > 0);
    else if (filter === "pay") f = f.filter((p) => p.balance < 0);
    if (selectedCategory !== "All") f = f.filter((p) => p.category === selectedCategory);
    if (searchTerm.trim()) f = f.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return f;
  }, [filter, selectedCategory, searchTerm, parties]);

  const totalCollect = parties.filter((p) => p.balance > 0).reduce((a, c) => a + c.balance, 0);
  const totalPay = parties.filter((p) => p.balance < 0).reduce((a, c) => a + Math.abs(c.balance), 0);

  return (
    <div className="parties-container">

      {/* Header */}
      <div className="parties-header">
        <h2>Parties</h2>
        <div className="header-right">
          <button className="outline-btn">
            <Link2 size={15} /> SharedLedger Portal
          </button>
          <button className="outline-btn">
            <FileText size={15} /> Reports <ChevronDown size={14} />
          </button>
          <button className="icon-btn"><Settings size={16} /></button>
          <button className="icon-btn"><MessageSquare size={16} /></button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className={`card ${filter === "all" ? "active-card" : ""}`} onClick={() => setFilter("all")}>
          <p><Users size={15} /> All Parties</p>
          <h3>{parties.length}</h3>
        </div>
        <div className={`card ${filter === "collect" ? "active-card" : ""}`} onClick={() => setFilter("collect")}>
          <p><TrendingDown size={15} className="green-text" /> To Collect</p>
          <h3 className="green-text">&#8377; {totalCollect.toLocaleString("en-IN")}</h3>
        </div>
        <div className={`card ${filter === "pay" ? "active-card" : ""}`} onClick={() => setFilter("pay")}>
          <p><TrendingUp size={15} className="red-text" /> To Pay</p>
          <h3 className="red-text">&#8377; {totalPay.toLocaleString("en-IN")}</h3>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="actions-bar">
        <div className="left-actions">
          <div className="search-box">
            <Search size={15} color="#9ca3af" />
            <input
              type="text"
              placeholder="Search Party"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-wrapper" ref={dropdownRef}>
            <div className="category-trigger" onClick={() => setShowDropdown(!showDropdown)}>
              <span>{selectedCategory === "All" ? "Search Categories" : selectedCategory}</span>
              <ChevronDown size={14} />
            </div>
            {showDropdown && (
              <div className="dropdown">
                <div className="dropdown-item" onClick={() => { setSelectedCategory("All"); setShowDropdown(false); }}>
                  All ({parties.length})
                </div>
                {categories.map((cat) => (
                  <div key={cat} className="dropdown-item" onClick={() => { setSelectedCategory(cat); setShowDropdown(false); }}>
                    <span>{cat} ({categoryCount(cat)})</span>
                    <Edit2 size={13} className="edit-cat-icon" />
                  </div>
                ))}
                <div className="create-category" onClick={() => { setShowCategoryModal(true); setShowDropdown(false); }}>
                  + Create Category
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="right-actions">
          <button className="outline-btn">
            <Layers size={15} /> Bulk Action <ChevronDown size={14} />
          </button>
          <button className="primary-btn" onClick={() => navigate("/cashier/create-party")}>
            Create Party
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="party-table">
          <thead>
            <tr>
              <th>Party Name &#8693;</th>
              <th>Category</th>
              <th>Mobile Number</th>
              <th>Party type</th>
              <th>Balance &#8693;</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredParties.length === 0 ? (
              <tr><td colSpan={6} className="no-data">No parties found</td></tr>
            ) : (
              filteredParties.map((party) => (
                <tr key={party.id} className="party-row" onClick={() => navigate(`/cashier/party/${party.id}`)}>
                  <td className="party-name-cell">{party.name}</td>
                  <td>{party.category}</td>
                  <td>{party.mobile}</td>
                  <td>{party.type}</td>
                  <td>
                    {party.balance > 0 && (
                      <span className="balance-positive">
                        <TrendingDown size={13} /> &#8377; {party.balance.toLocaleString("en-IN")}
                      </span>
                    )}
                    {party.balance < 0 && (
                      <span className="balance-negative">
                        <TrendingUp size={13} /> &#8377; {Math.abs(party.balance).toLocaleString("en-IN")}
                      </span>
                    )}
                    {party.balance === 0 && <span>&#8377; 0</span>}
                  </td>
                  <td className="action-cell" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical size={17} className="menu-icon"
                      onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === party.id ? null : party.id); }} />
                    {activeMenu === party.id && (
                      <div className="action-menu">
                        <div className="action-item" onClick={() => navigate(`/cashier/create-party/${party.id}`)}>
                          <Edit2 size={13} /> Edit
                        </div>
                        <div className="action-item delete" onClick={() => { setDeletePartyId(party.id); setShowDeleteModal(true); setActiveMenu(null); }}>
                          <Trash2 size={13} /> Delete
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Category</h3>
              <button className="modal-close" onClick={() => setShowCategoryModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <label>Category Name</label>
              <input type="text" placeholder="Ex: Snacks" value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()} autoFocus />
            </div>
            <div className="modal-footer">
              <button className="abcd" onClick={() => setShowCategoryModal(false)}>Cancel</button>
              <button className="abc" onClick={handleAddCategory}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Party</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this party? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="abcd" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="delete-btn" onClick={handleDeleteParty}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parties;