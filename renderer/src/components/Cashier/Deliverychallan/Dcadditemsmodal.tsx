import { useState } from "react";
import { BillItem, calcItemAmount } from "./Deliverychallantype";
import "./Createdeliverychallan.css";

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
    { id: "1", name: "BILLING SOFTWARE MOBILE APP", itemCode: "-", stock: "-", salesPrice: 256, purchasePrice: 0 },
    { id: "2", name: "BILLING SOFTWARE WITH GST", itemCode: "-", stock: "-", salesPrice: 369875, purchasePrice: 0 },
    { id: "3", name: "BILLING SOFTWARE WITHOUT GST", itemCode: "-", stock: "-", salesPrice: 3556, purchasePrice: 0 },
    { id: "4", name: "GODREJ FRIDGE", itemCode: "34567", stock: "144 ACS", salesPrice: 42000, purchasePrice: 0 },
    { id: "5", name: "HERIER AC", itemCode: "1234", stock: "94 PCS", salesPrice: 45000, purchasePrice: 38000 },
    { id: "6", name: "HISENSE 32 INCH", itemCode: "-", stock: "39 PCS", salesPrice: 21000, purchasePrice: 18000 },
  ];
}

function saveStockItem(item: StockItem) {
  const items = getStockItems();
  items.push(item);
  localStorage.setItem("items", JSON.stringify(items));
}

function CreateNewItemModal({ onClose, onSave }: { onClose: () => void; onSave: (item: StockItem) => void }) {
  const [name, setName] = useState("");
  const [salesPrice, setSalesPrice] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [unit, setUnit] = useState("PCS");
  const [itemCode, setItemCode] = useState("");
  const [hsn, setHsn] = useState("");

  const handleSave = () => {
    if (!name.trim()) { alert("Item name is required"); return; }
    const item: StockItem = {
      id: `item-${Date.now()}`,
      name: name.trim(),
      itemCode: itemCode || "-",
      stock: "-",
      salesPrice,
      purchasePrice,
      hsn,
      unit,
    };
    saveStockItem(item);
    onSave(item);
  };

  return (
    <div className="dc-overlay dc-overlay--top2" onClick={onClose}>
      <div className="dc-modal" onClick={e => e.stopPropagation()}>
        <div className="dc-modal-hdr">
          <span>Create New Item</span>
          <button className="dc-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="dc-modal-body">
          <div className="dc-field">
            <label>Item Name <span className="dc-req">*</span></label>
            <input className="dc-input" value={name} onChange={e => setName(e.target.value)} placeholder="Enter item name" />
          </div>
          <div className="dc-two-col">
            <div className="dc-field">
              <label>Sales Price</label>
              <input className="dc-input" type="number" value={salesPrice} onChange={e => setSalesPrice(Number(e.target.value))} />
            </div>
            <div className="dc-field">
              <label>Purchase Price</label>
              <input className="dc-input" type="number" value={purchasePrice} onChange={e => setPurchasePrice(Number(e.target.value))} />
            </div>
          </div>
          <div className="dc-two-col">
            <div className="dc-field">
              <label>Unit</label>
              <select className="dc-input" value={unit} onChange={e => setUnit(e.target.value)}>
                {["PCS","KG","MTR","LTR","BOX","BAG","SET","PAIR","NOS","UNIT"].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="dc-field">
              <label>Item Code / SKU</label>
              <input className="dc-input" value={itemCode} onChange={e => setItemCode(e.target.value)} placeholder="-" />
            </div>
          </div>
          <div className="dc-field">
            <label>HSN / SAC Code</label>
            <input className="dc-input" value={hsn} onChange={e => setHsn(e.target.value)} placeholder="Enter HSN code" />
          </div>
        </div>
        <div className="dc-modal-footer">
          <button className="dc-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="dc-btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

interface AddItemsModalProps {
  onClose: () => void;
  onAddToBill: (items: BillItem[]) => void;
}

export default function DCAddItemsModal({ onClose, onAddToBill }: AddItemsModalProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [stockItems, setStockItems] = useState<StockItem[]>(getStockItems);
  const [showCreateItem, setShowCreateItem] = useState(false);

  const categories = [...new Set(stockItems.map(i => i.category).filter(Boolean))] as string[];

  const filtered = stockItems.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !search || item.name.toLowerCase().includes(q) || item.itemCode.toLowerCase().includes(q) || (item.hsn || "").includes(q);
    const matchCat = !categoryFilter || item.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const selectedCount = Object.values(quantities).filter(q => q > 0).length;

  const handleAdd = (itemId: string) => setQuantities(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  const handleQtyChange = (itemId: string, qty: number) => setQuantities(prev => ({ ...prev, [itemId]: Math.max(0, qty) }));

  const handleAddToBill = () => {
    const billItems: BillItem[] = [];
    Object.entries(quantities).forEach(([itemId, qty]) => {
      if (qty <= 0) return;
      const si = stockItems.find(i => i.id === itemId);
      if (!si) return;
      const item: BillItem = {
        rowId: `row-${Date.now()}-${itemId}`,
        itemId: Number(si.id),
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

  return (
    <div className="dc-overlay" onClick={onClose}>
      <div className="dc-add-items-modal" onClick={e => e.stopPropagation()}>
        <div className="dc-add-items-hdr">
          <span className="dc-add-items-title">Add Items to Bill</span>
          <button className="dc-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="dc-add-items-toolbar">
          <div className="dc-add-items-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              autoFocus
              className="dc-add-items-search-input"
              placeholder="Search by Item/ Serial no./ HSN code/ SKU/ Custom Field / Category"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="dc-barcode-btn" title="Scan barcode">
              <svg width="20" height="18" viewBox="0 0 30 22" fill="none">
                <rect x="1" y="1" width="4" height="20" rx="1" fill="#374151"/>
                <rect x="7" y="1" width="2" height="20" rx="0.5" fill="#374151"/>
                <rect x="11" y="1" width="3" height="20" rx="0.5" fill="#374151"/>
                <rect x="16" y="1" width="1.5" height="20" rx="0.5" fill="#374151"/>
                <rect x="19" y="1" width="3" height="20" rx="0.5" fill="#374151"/>
                <rect x="24" y="1" width="2" height="20" rx="0.5" fill="#374151"/>
              </svg>
            </button>
          </div>
          <div className="dc-add-items-cat-wrap">
            <button className="dc-add-items-cat-btn" onClick={() => setCatOpen(!catOpen)}>
              {categoryFilter || "Select Category"}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {catOpen && (
              <div className="dc-add-items-cat-drop">
                <button className="dc-cat-opt" onClick={() => { setCategoryFilter(""); setCatOpen(false); }}>All Categories</button>
                {categories.map(c => (
                  <button key={c} className="dc-cat-opt" onClick={() => { setCategoryFilter(c); setCatOpen(false); }}>{c}</button>
                ))}
              </div>
            )}
          </div>
          <button className="dc-create-item-btn" onClick={() => setShowCreateItem(true)}>Create New Item</button>
        </div>

        <div className="dc-add-items-table-wrap">
          <table className="dc-add-items-table">
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
                  <td colSpan={6} className="dc-add-items-empty">
                    {search ? "No items found" : "Scan items to add them to your invoice"}
                  </td>
                </tr>
              ) : filtered.map(item => {
                const qty = quantities[item.id] || 0;
                return (
                  <tr key={item.id} className={`dc-add-items-row${qty > 0 ? " dc-add-items-row--sel" : ""}`}>
                    <td>{item.name}</td>
                    <td>{item.itemCode}</td>
                    <td>{item.stock}</td>
                    <td>{item.salesPrice > 0 ? `₹${item.salesPrice.toLocaleString("en-IN")}` : "-"}</td>
                    <td>{item.purchasePrice > 0 ? `₹${item.purchasePrice.toLocaleString("en-IN")}` : "-"}</td>
                    <td>
                      {qty === 0 ? (
                        <button className="dc-add-qty-btn" onClick={() => handleAdd(item.id)}>+ Add</button>
                      ) : (
                        <div className="dc-qty-control">
                          <button onClick={() => handleQtyChange(item.id, qty - 1)}>−</button>
                          <input
                            type="number"
                            value={qty}
                            onChange={e => handleQtyChange(item.id, Number(e.target.value))}
                            className="dc-qty-input"
                          />
                          <button onClick={() => handleQtyChange(item.id, qty + 1)}>+</button>
                          <span className="dc-qty-unit">{item.unit || "PCS"}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="dc-add-items-shortcuts">
          <span className="dc-shortcut-label">Keyboard Shortcuts :</span>
          <span>Change Quantity</span>
          <kbd>Enter</kbd>
          <span>Move between items</span>
          <kbd>↑</kbd>
          <kbd>↓</kbd>
        </div>

        <div className="dc-add-items-footer">
          <button className="dc-items-show-selected" onClick={() => {}}>
            {selectedCount > 0 ? `Show ${selectedCount} Item(s) Selected` : "0 Item(s) Selected"}
          </button>
          <div className="dc-add-items-footer-btns">
            <button className="dc-btn-cancel" onClick={onClose}>Cancel [ESC]</button>
            <button
              className={`dc-btn-primary${selectedCount === 0 ? " dc-btn-primary--disabled" : ""}`}
              onClick={handleAddToBill}
              disabled={selectedCount === 0}
            >Add to Bill [F7]</button>
          </div>
        </div>
      </div>

      {showCreateItem && (
        <CreateNewItemModal
          onClose={() => setShowCreateItem(false)}
          onSave={item => { setStockItems(prev => [...prev, item]); setShowCreateItem(false); }}
        />
      )}
    </div>
  );
}