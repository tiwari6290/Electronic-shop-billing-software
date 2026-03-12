import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Item, getItems, BillItem } from "./Quotationtypes";
import "./AddItemsModal.css";

const SAMPLE_ITEMS: Item[] = [
  { id: 1, name: "BILLING SOFTWARE MOBILE APP", itemCode: "-", stock: "-", salesPrice: 256, purchasePrice: 0, unit: "PCS", category: "" },
  { id: 2, name: "BILLING SOFTWARE WITH GST", itemCode: "-", stock: "-", salesPrice: 369875, purchasePrice: 0, unit: "PCS", category: "" },
  { id: 3, name: "BILLING SOFTWARE WITHOUT GST", itemCode: "-", stock: "-", salesPrice: 3556, purchasePrice: 0, unit: "PCS", category: "" },
  { id: 4, name: "GODREJ FRIDGE", itemCode: "34567", stock: "143 ACS", salesPrice: 42000, purchasePrice: 0, unit: "ACS", category: "Electronics" },
  { id: 5, name: "HERIER AC", itemCode: "1234", stock: "93 PCS", salesPrice: 45000, purchasePrice: 38000, unit: "PCS", category: "Electronics" },
  { id: 6, name: "HISENSE 32 INCH", itemCode: "-", stock: "39 PCS", salesPrice: 21000, purchasePrice: 18000, unit: "PCS", category: "Electronics" },
];

interface AddItemsModalProps {
  onClose: () => void;
  onAddToBill: (items: BillItem[]) => void;
}

export default function AddItemsModal({ onClose, onAddToBill }: AddItemsModalProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selections, setSelections] = useState<Record<number, number>>({});
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);
  const barcodeRef = useRef<HTMLInputElement>(null);

  const storedItems = getItems();
  const allItems = storedItems.length > 0 ? storedItems : SAMPLE_ITEMS;

  // Derive categories from items
  const categories: string[] = Array.from(
    new Set(allItems.map((i) => i.category || "").filter(Boolean))
  );

  const filtered = allItems.filter((item) => {
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.itemCode && item.itemCode.toLowerCase().includes(search.toLowerCase())) ||
      (item.hsn && item.hsn.toLowerCase().includes(search.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = !category || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const selectedCount = Object.values(selections).filter((q) => q > 0).length;

  function setQty(id: number, qty: number) {
    setSelections((prev) => ({ ...prev, [id]: Math.max(0, qty) }));
  }

  function handleAddToBill() {
    const billItems: BillItem[] = [];
    Object.entries(selections).forEach(([id, qty]) => {
      if (qty <= 0) return;
      const item = allItems.find((i) => i.id === Number(id));
      if (!item) return;
      billItems.push({
        rowId: `row-${Date.now()}-${id}`,
        itemId: item.id,
        name: item.name,
        description: "",
        hsn: item.hsn || "",
        qty,
        unit: item.unit,
        price: item.salesPrice,
        discountPct: 0,
        discountAmt: 0,
        taxLabel: "None",
        taxRate: 0,
        amount: item.salesPrice * qty,
      });
    });
    onAddToBill(billItems);
    onClose();
  }

  // Handle barcode scan — match by itemCode
  function handleBarcodeSearch() {
    const val = barcodeInput.trim();
    if (!val) return;
    const match = allItems.find(
      (i) => i.itemCode.toLowerCase() === val.toLowerCase()
    );
    if (match) {
      setQty(match.id, (selections[match.id] || 0) + 1);
      setBarcodeInput("");
      setShowBarcodeModal(false);
    } else {
      setBarcodeInput("");
      alert(`No item found with barcode: ${val}`);
    }
  }

  useEffect(() => {
    if (showBarcodeModal) {
      setTimeout(() => barcodeRef.current?.focus(), 50);
    }
  }, [showBarcodeModal]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (showBarcodeModal) { setShowBarcodeModal(false); return; }
        onClose();
      }
      if (e.key === "F7" && selectedCount > 0) handleAddToBill();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [selectedCount, selections, showBarcodeModal]);

  return (
    <>
      <div className="aim-overlay" onClick={onClose}>
        <div className="aim-modal" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="aim-header">
            <h2 className="aim-title">Add Items to Bill</h2>
            <button className="aim-close" onClick={onClose}>✕</button>
          </div>

          {/* Toolbar */}
          <div className="aim-toolbar">
            <div className="aim-search-wrap">
              <svg className="aim-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                ref={searchRef}
                className="aim-search"
                autoFocus
                placeholder="Search by Item/ Serial no./ HSN code/ SKU/ Custom Field / Category"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="aim-barcode-btn"
                title="Scan barcode"
                onClick={() => setShowBarcodeModal(true)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 9V5a2 2 0 0 1 2-2h4M3 15v4a2 2 0 0 0 2 2h4M21 9V5a2 2 0 0 0-2-2h-4M21 15v4a2 2 0 0 1-2 2h-4" />
                  <line x1="7" y1="8" x2="7" y2="16" />
                  <line x1="10" y1="8" x2="10" y2="16" />
                  <line x1="14" y1="8" x2="14" y2="16" />
                  <line x1="17" y1="8" x2="17" y2="16" />
                </svg>
              </button>
            </div>

            <select
              className="aim-cat-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <button
              className="aim-create-btn"
              onClick={() => { onClose(); navigate("/cashier/create-item"); }}
            >
              Create New Item
            </button>
          </div>

          {/* Table */}
          <div className="aim-table-wrap">
            <table className="aim-table">
              <thead>
                <tr>
                  <th className="aim-th">Item Name</th>
                  <th className="aim-th aim-th--center">Item Code</th>
                  <th className="aim-th aim-th--center">Stock</th>
                  <th className="aim-th aim-th--right">Sales Price</th>
                  <th className="aim-th aim-th--right">Purchase Price</th>
                  <th className="aim-th aim-th--center">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="aim-empty">
                      No items found
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    const qty = selections[item.id] || 0;
                    const isSelected = qty > 0;
                    return (
                      <tr key={item.id} className={`aim-tr ${isSelected ? "aim-tr--selected" : ""}`}>
                        <td className="aim-td">{item.name}</td>
                        <td className="aim-td aim-td--center">{item.itemCode || "-"}</td>
                        <td className="aim-td aim-td--center">{item.stock || "-"}</td>
                        <td className="aim-td aim-td--right">
                          ₹{item.salesPrice.toLocaleString("en-IN")}
                        </td>
                        <td className="aim-td aim-td--right">
                          {item.purchasePrice > 0
                            ? `₹${item.purchasePrice.toLocaleString("en-IN")}`
                            : "-"}
                        </td>
                        <td className="aim-td aim-td--center">
                          {!isSelected ? (
                            <button className="aim-add-btn" onClick={() => setQty(item.id, 1)}>
                              + Add
                            </button>
                          ) : (
                            <div className="aim-qty-row">
                              <button className="aim-qty-btn" onClick={() => setQty(item.id, qty - 1)}>−</button>
                              <input
                                className="aim-qty-input"
                                type="number"
                                value={qty}
                                onChange={(e) => setQty(item.id, Number(e.target.value))}
                              />
                              <button className="aim-qty-btn" onClick={() => setQty(item.id, qty + 1)}>+</button>
                              <span className="aim-qty-unit">{item.unit}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="aim-footer">
            <div className="aim-shortcuts">
              <span className="aim-shortcut-label">Keyboard Shortcuts :</span>
              <span>Change Quantity</span>
              <kbd className="aim-kbd">Enter</kbd>
              <span>Move between items</span>
              <kbd className="aim-kbd">↑</kbd>
              <kbd className="aim-kbd">↓</kbd>
            </div>
            <div className="aim-footer-right">
              <span className="aim-selected-count">Show {selectedCount} Item(s) Selected</span>
              <button className="aim-cancel-btn" onClick={onClose}>Cancel [ESC]</button>
              <button
                className={`aim-confirm-btn ${selectedCount === 0 ? "aim-confirm-btn--disabled" : ""}`}
                onClick={handleAddToBill}
                disabled={selectedCount === 0}
              >
                Add to Bill [F7]
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      {showBarcodeModal && (
        <div className="aim-overlay aim-barcode-overlay" onClick={() => setShowBarcodeModal(false)}>
          <div className="aim-barcode-modal" onClick={(e) => e.stopPropagation()}>
            <div className="aim-header">
              <h2 className="aim-title">Scan Barcode</h2>
              <button className="aim-close" onClick={() => setShowBarcodeModal(false)}>✕</button>
            </div>
            <div className="aim-barcode-body">
              <div className="aim-barcode-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#4338ca" strokeWidth="1.5" width="48" height="48">
                  <path d="M3 9V5a2 2 0 0 1 2-2h4M3 15v4a2 2 0 0 0 2 2h4M21 9V5a2 2 0 0 0-2-2h-4M21 15v4a2 2 0 0 1-2 2h-4" />
                  <line x1="7" y1="8" x2="7" y2="16" />
                  <line x1="10" y1="8" x2="10" y2="16" />
                  <line x1="14" y1="8" x2="14" y2="16" />
                  <line x1="17" y1="8" x2="17" y2="16" />
                </svg>
              </div>
              <p className="aim-barcode-hint">Scan or type the barcode / item code below</p>
              <input
                ref={barcodeRef}
                className="aim-barcode-input"
                type="text"
                placeholder="Barcode / Item Code"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleBarcodeSearch(); }}
              />
            </div>
            <div className="aim-footer" style={{ justifyContent: "flex-end" }}>
              <button className="aim-cancel-btn" onClick={() => setShowBarcodeModal(false)}>Cancel</button>
              <button className="aim-confirm-btn" onClick={handleBarcodeSearch}>Add Item</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}