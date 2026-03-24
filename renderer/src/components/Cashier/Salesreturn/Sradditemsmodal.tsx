import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InvoiceItem, calcItemAmount } from "./Salesreturntypes";
import "./Createsalesreturn.css";

interface StockItem {
  id: string;
  name: string;
  itemCode: string;
  stock: string;
  salesPrice: number;
  purchasePrice: number;
  category?: string;
  hsn?: string;
  unit?: string;
}

function getStockItems(): StockItem[] {
  try {
    const raw = localStorage.getItem("items");
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    { id: "1", name: "BILLING SOFTWARE MOBILE APP", itemCode: "-", stock: "-", salesPrice: 256, purchasePrice: 0, category: "" },
    { id: "2", name: "BILLING SOFTWARE WITH GST", itemCode: "-", stock: "-", salesPrice: 369875, purchasePrice: 0, category: "" },
    { id: "3", name: "BILLING SOFTWARE WITHOUT GST", itemCode: "-", stock: "-", salesPrice: 3556, purchasePrice: 0, category: "" },
    { id: "4", name: "GODREJ FRIDGE", itemCode: "34567", stock: "144 ACS", salesPrice: 42000, purchasePrice: 0, category: "" },
    { id: "5", name: "HERIER AC", itemCode: "1234", stock: "94 PCS", salesPrice: 45000, purchasePrice: 38000, category: "" },
    { id: "6", name: "HISENSE 32 INCH", itemCode: "-", stock: "39 PCS", salesPrice: 21000, purchasePrice: 18000, category: "" },
  ];
}

interface AddItemsModalProps {
  onClose: () => void;
  onAddToBill: (items: InvoiceItem[]) => void;
}

export default function SRAddItemsModal({ onClose, onAddToBill }: AddItemsModalProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [stockItems] = useState<StockItem[]>(() => getStockItems());

  const categories = [...new Set(stockItems.map(i => i.category).filter(Boolean))] as string[];

  const filtered = stockItems.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !search
      || item.name.toLowerCase().includes(q)
      || item.itemCode.toLowerCase().includes(q)
      || (item.hsn || "").includes(q);
    const matchCat = !categoryFilter || item.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const selectedCount = Object.values(quantities).filter(q => q > 0).length;

  const handleAdd = (itemId: string) => {
    setQuantities(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const handleQtyChange = (itemId: string, qty: number) => {
    setQuantities(prev => ({ ...prev, [itemId]: Math.max(0, qty) }));
  };

  const handleAddToBill = () => {
    const billItems: InvoiceItem[] = [];
    Object.entries(quantities).forEach(([itemId, qty]) => {
      if (qty <= 0) return;
      const si = stockItems.find(i => i.id === itemId);
      if (!si) return;
      const item: InvoiceItem = {
        rowId: `row-${Date.now()}-${itemId}`,
        itemId: si.id,
        name: si.name,
        description: "",
        hsn: si.hsn || "",
        qty,
        unit: si.unit || "PCS",
        price: si.salesPrice,
        discountPct: 0,
        discountAmt: 0,
        taxLabel: "None",
        taxRate: 0,
        amount: qty * si.salesPrice,
      };
      item.amount = calcItemAmount(item);
      billItems.push(item);
    });
    onAddToBill(billItems);
    onClose();
  };

  const handleCreateNewItem = () => {
    // Navigate to the CreateItem page
    navigate("/cashier/create-item");
  };

  return (
    <div className="csr-overlay" onClick={onClose}>
      <div className="csr-add-items-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="csr-add-items-hdr">
          <span className="csr-add-items-title">Add Items to Bill</span>
          <button className="csr-modal-close" onClick={onClose}>×</button>
        </div>

        {/* Toolbar */}
        <div className="csr-add-items-toolbar">
          <div className="csr-add-items-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              autoFocus
              className="csr-add-items-search-input"
              placeholder="Search by Item / Serial no. / HSN code / SKU / Custom Field / Category"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="csr-barcode-btn" title="Scan barcode">
              <svg width="20" height="18" viewBox="0 0 30 22" fill="none">
                <rect x="1"  y="1" width="4"   height="20" rx="1"   fill="#374151"/>
                <rect x="7"  y="1" width="2"   height="20" rx="0.5" fill="#374151"/>
                <rect x="11" y="1" width="3"   height="20" rx="0.5" fill="#374151"/>
                <rect x="16" y="1" width="1.5" height="20" rx="0.5" fill="#374151"/>
                <rect x="19" y="1" width="3"   height="20" rx="0.5" fill="#374151"/>
                <rect x="24" y="1" width="2"   height="20" rx="0.5" fill="#374151"/>
              </svg>
            </button>
          </div>

          {/* Category filter */}
          <div className="csr-add-items-cat-wrap">
            <button className="csr-add-items-cat-btn" onClick={() => setCatOpen(!catOpen)}>
              {categoryFilter || "Select Category"}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {catOpen && (
              <div className="csr-add-items-cat-drop">
                <button className="csr-cat-opt" onClick={() => { setCategoryFilter(""); setCatOpen(false); }}>
                  All Categories
                </button>
                {categories.map(c => (
                  <button key={c} className="csr-cat-opt" onClick={() => { setCategoryFilter(c); setCatOpen(false); }}>
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Create New Item → navigates to CreateItem page */}
          <button className="csr-create-item-btn" onClick={handleCreateNewItem}>
            Create New Item
          </button>
        </div>

        {/* Table */}
        <div className="csr-add-items-table-wrap">
          <table className="csr-add-items-table">
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
                  <td colSpan={6} className="csr-add-items-empty">
                    {search ? "No items found" : "Scan items to add them to your invoice"}
                  </td>
                </tr>
              ) : filtered.map(item => {
                const qty = quantities[item.id] || 0;
                return (
                  <tr key={item.id} className={`csr-add-items-row${qty > 0 ? " csr-add-items-row--sel" : ""}`}>
                    <td>{item.name}</td>
                    <td>{item.itemCode}</td>
                    <td>{item.stock}</td>
                    <td>{item.salesPrice > 0 ? `₹${item.salesPrice.toLocaleString("en-IN")}` : "-"}</td>
                    <td>{item.purchasePrice > 0 ? `₹${item.purchasePrice.toLocaleString("en-IN")}` : "-"}</td>
                    <td>
                      {qty === 0 ? (
                        <button className="csr-add-qty-btn" onClick={() => handleAdd(item.id)}>+ Add</button>
                      ) : (
                        <div className="csr-qty-control">
                          <button onClick={() => handleQtyChange(item.id, qty - 1)}>−</button>
                          <input
                            type="number"
                            value={qty}
                            onChange={e => handleQtyChange(item.id, Number(e.target.value))}
                            className="csr-qty-input"
                          />
                          <button onClick={() => handleQtyChange(item.id, qty + 1)}>+</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Keyboard shortcuts */}
        <div className="csr-add-items-shortcuts">
          <span className="csr-shortcut-label">Keyboard Shortcuts :</span>
          <span>Change Quantity</span><kbd>Enter</kbd>
          <span>Move between items</span><kbd>↑</kbd><kbd>↓</kbd>
        </div>

        {/* Footer */}
        <div className="csr-add-items-footer">
          <button className="csr-items-show-selected" onClick={() => {}}>
            {selectedCount > 0 ? `Show ${selectedCount} Item(s) Selected` : "0 Item(s) Selected"}
          </button>
          <div className="csr-add-items-footer-btns">
            <button className="csr-btn-cancel" onClick={onClose}>Cancel [ESC]</button>
            <button
              className={`csr-btn-primary${selectedCount === 0 ? " csr-btn-primary--disabled" : ""}`}
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
}