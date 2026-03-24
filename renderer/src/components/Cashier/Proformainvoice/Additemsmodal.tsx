import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ItemProduct, SAMPLE_ITEMS } from "./Types";
import "./Additemsmodal.css";

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
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5v14M7 5v14M11 5v14M15 5v14M19 5v14M21 5v3M21 16v3M3 5H6M3 16v3"/>
  </svg>
);

interface SelectedItem { item: ItemProduct; qty: number; }
interface Props { onAdd: (items: SelectedItem[]) => void; onClose: () => void; }

const AddItemsModal: React.FC<Props> = ({ onAdd, onClose }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [items, setItems] = useState<ItemProduct[]>(SAMPLE_ITEMS);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("items") || "[]");
      if (stored.length > 0) setItems(stored);
    } catch {}
  }, []);

  // Get unique categories
  const categories: string[] = [...new Set(items.map(i => (i as any).category).filter(Boolean))] as string[];

  const filtered = items.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !search || item.name.toLowerCase().includes(q) || item.itemCode.toLowerCase().includes(q) || item.hsn.toLowerCase().includes(q);
    const matchCat = !category || (item as any).category === category;
    return matchSearch && matchCat;
  });

  const selectedCount = Object.values(quantities).filter(v => v > 0).length;
  const totalSelected = Object.entries(quantities).filter(([,v]) => v > 0).length;

  const handleAdd    = (id: number) => setQuantities(prev => ({ ...prev, [id]: 1 }));
  const handleDec    = (id: number) => setQuantities(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
  const handleInc    = (id: number) => setQuantities(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const handleQtyInput = (id: number, val: string) => setQuantities(prev => ({ ...prev, [id]: Math.max(0, parseInt(val) || 0) }));

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
    <div className="aa-aim-overlay" onClick={onClose}>
      <div className="aa-aim-modal" onClick={e => e.stopPropagation()}>
        <div className="aa-aim-header">
          <h2>Add Items to Bill</h2>
          <button className="aa-aim-close" onClick={onClose}><IconClose /></button>
        </div>

        <div className="aa-aim-toolbar">
          <div className="aa-aim-search-wrap">
            <IconSearch />
            <input
              autoFocus
              className="aa-aim-search"
              placeholder="Search by Item/ Serial no./ HSN code/ SKU/ Custom Field / Category"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="aa-aim-barcode-btn" title="Scan Barcode"><IconBarcode /></button>
          </div>
          <div className="aa-aim-cat-wrap">
            <button className="aa-aim-cat-btn" onClick={() => setCatOpen(s => !s)}>
              {category || "Select Category"}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {catOpen && (
              <div className="aa-aim-cat-dropdown">
                <div className="aa-aim-cat-opt" onClick={() => { setCategory(""); setCatOpen(false); }}>All Categories</div>
                {categories.map(c => (
                  <div key={c} className="aa-aim-cat-opt" onClick={() => { setCategory(c); setCatOpen(false); }}>{c}</div>
                ))}
              </div>
            )}
          </div>
          <button className="aa-aim-create-btn" onClick={() => { onClose(); navigate("/cashier/create-item"); }}>Create New Item</button>
        </div>

        <div className="aa-aim-table-wrap">
          <table className="aa-aim-table">
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
                <tr><td colSpan={6} className="aa-aim-empty">Scan items to add them to your invoice</td></tr>
              ) : filtered.map(item => {
                const qty = quantities[item.id] || 0;
                return (
                  <tr key={item.id} className={qty > 0 ? "aa-aim-row-selected" : ""}>
                    <td className="aa-aim-item-name">{item.name}</td>
                    <td>{item.itemCode || "-"}</td>
                    <td>{item.stock || "-"}</td>
                    <td>₹{item.salesPrice.toLocaleString("en-IN")}</td>
                    <td>{item.purchasePrice > 0 ? `₹${item.purchasePrice.toLocaleString("en-IN")}` : "-"}</td>
                    <td>
                      {qty === 0 ? (
                        <button className="aa-aim-add-btn" onClick={() => handleAdd(item.id)}>+ Add</button>
                      ) : (
                        <div className="aa-aim-qty-control">
                          <button className="aa-aim-qty-dec" onClick={() => handleDec(item.id)}>−</button>
                          <input
                            className="aa-aim-qty-num"
                            type="number" min={0}
                            value={qty}
                            onChange={e => handleQtyInput(item.id, e.target.value)}
                          />
                          <button className="aa-aim-qty-inc" onClick={() => handleInc(item.id)}>+</button>
                          <span className="aa-aim-qty-unit">{item.unit || "PCS"}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="aa-aim-footer">
          <div className="aa-aim-shortcuts">
            <span className="aa-aim-shortcuts-label">Keyboard Shortcuts :</span>
            <span>Change Quantity</span><kbd>Enter</kbd>
            <span>Move between items</span><kbd>↑</kbd><kbd>↓</kbd>
          </div>
          <div className="aa-aim-footer-actions">
            <button className="aa-aim-show-selected" onClick={() => {}}>
              Show {totalSelected} Item(s) Selected
            </button>
            <button className="aa-aim-cancel-btn" onClick={onClose}>Cancel [ESC]</button>
            <button
              className={`aa-aim-confirm-btn${selectedCount === 0 ? " disabled" : ""}`}
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