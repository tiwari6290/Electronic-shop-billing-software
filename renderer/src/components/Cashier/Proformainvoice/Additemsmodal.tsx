import React, { useState, useEffect } from "react";
import { ItemProduct, SAMPLE_ITEMS } from "./Types";
import "./Additemsmodal.css";

// ── Inline SVG Icons ──────────────────────────────────────────────────────────
const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconBarcode = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5v14M7 5v14M11 5v14M15 5v14M19 5v14M21 5v3M21 16v3M3 5H6M3 16v3"/>
  </svg>
);

interface SelectedItem { item: ItemProduct; qty: number; }

interface Props {
  onAdd: (items: SelectedItem[]) => void;
  onClose: () => void;
}

const CATEGORIES = ["Electronics", "Software", "Appliances", "Services"];

const AddItemsModal: React.FC<Props> = ({ onAdd, onClose }) => {
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("");
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [items, setItems]         = useState<ItemProduct[]>(SAMPLE_ITEMS);

  // In future: load from localStorage("items") if managed dynamically
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("items") || "[]");
      if (stored.length > 0) setItems(stored);
    } catch { /* use defaults */ }
  }, []);

  const filtered = items.filter(item => {
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.itemCode.toLowerCase().includes(q) ||
      item.hsn.toLowerCase().includes(q)
    );
  });

  const selectedCount = Object.values(quantities).filter(v => v > 0).length;

  const handleAdd        = (id: number) => setQuantities(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const handleQtyChange  = (id: number, val: string) => setQuantities(prev => ({ ...prev, [id]: parseInt(val) || 0 }));

  const handleAddToBill = () => {
    const result: SelectedItem[] = [];
    Object.entries(quantities).forEach(([id, qty]) => {
      if (qty > 0) {
        const item = items.find(i => i.id === Number(id));
        if (item) result.push({ item, qty });
      }
    });
    onAdd(result);
  };

  return (
    <div className="aim-overlay" onClick={onClose}>
      <div className="aim-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="aim-header">
          <h2>Add Items to Bill</h2>
          <button className="aim-close" onClick={onClose}><IconClose /></button>
        </div>

        {/* Toolbar */}
        <div className="aim-toolbar">
          <div className="aim-search-wrap">
            <IconSearch />
            <input
              autoFocus
              className="aim-search"
              placeholder="Search by Item/ Serial no./ HSN code/ SKU/ Custom Field / Category"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="aim-barcode-btn" title="Scan Barcode"><IconBarcode /></button>
          </div>
          <div className="aim-cat-wrap">
            <select className="aim-cat-select" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Select Category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button className="aim-create-btn">Create New Item</button>
        </div>

        {/* Table */}
        <div className="aim-table-wrap">
          <table className="aim-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Item Code</th>
                <th>Stock</th>
                <th>Sales Price</th>
                <th>Purchase Price</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="aim-empty">
                    {search ? "No items match your search" : "Scan items to add them to your invoice"}
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className={quantities[item.id] > 0 ? "aim-row-selected" : ""}>
                    <td className="aim-item-name">{item.name}</td>
                    <td>{item.itemCode}</td>
                    <td>{item.stock}</td>
                    <td>₹{item.salesPrice.toLocaleString("en-IN")}</td>
                    <td>{item.purchasePrice > 0 ? `₹${item.purchasePrice.toLocaleString("en-IN")}` : "-"}</td>
                    <td>
                      {quantities[item.id] > 0 ? (
                        <input
                          className="aim-qty-input"
                          type="number" min="0"
                          value={quantities[item.id]}
                          onChange={e => handleQtyChange(item.id, e.target.value)}
                          autoFocus
                        />
                      ) : (
                        <button className="aim-add-btn" onClick={() => handleAdd(item.id)}>+ Add</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="aim-footer">
          <div className="aim-shortcuts">
            <span className="aim-shortcuts-label">Keyboard Shortcuts :</span>
            <span>Change Quantity</span><kbd>Enter</kbd>
            <span>Move between items</span><kbd>↑</kbd><kbd>↓</kbd>
          </div>
          <div className="aim-footer-actions">
            <span className="aim-selected-count">{selectedCount} Item(s) Selected</span>
            <button className="aim-cancel-btn" onClick={onClose}>Cancel [ESC]</button>
            <button
              className={`aim-confirm-btn${selectedCount === 0 ? " disabled" : ""}`}
              onClick={handleAddToBill}
              disabled={selectedCount === 0}
            >
              Add to Bill [F7]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddItemsModal;