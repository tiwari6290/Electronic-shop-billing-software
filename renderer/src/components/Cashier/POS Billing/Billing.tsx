import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Billing.css";

// ─── Types ───────────────────────────────────────────────────────────────────
interface BillItem {
  no: number;
  name: string;
  itemCode: string;
  mrp: number;
  sp: number;
  quantity: number;
  amount: number;
}

type Route = "pos" | "new-item" | "create-item";

// ─── NEW ITEM PAGE ────────────────────────────────────────────────────────────
function NewItemPage({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({
    name: "", itemCode: "", mrp: "", sp: "", unit: "pcs", tax: "0",
  });

  const handle = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const fields: [string, string, string, string][] = [
    ["Item Name *", "name", "text", "e.g. Coca Cola 500ml"],
    ["Item Code / SKU", "itemCode", "text", "e.g. CC500"],
    ["MRP (₹)", "mrp", "number", "0.00"],
    ["Selling Price (₹)", "sp", "number", "0.00"],
  ];

  return (
    <div className="page">
      <div className="top-bar">
        <button className="btn btn--ghost" onClick={onBack}>← Back to POS</button>
        <h2 className="page-title">New Item</h2>
        <div />
      </div>

      <div className="form-card">
        <h3 className="form-heading">Item Details</h3>
        <div className="form-grid">
          {fields.map(([label, key, type, placeholder]) => (
            <div className="form-field" key={key}>
              <label className="form-label">{label}</label>
              <input
                className="form-input"
                type={type}
                placeholder={placeholder}
                value={(form as Record<string, string>)[key]}
                onChange={(e) => handle(key, e.target.value)}
              />
            </div>
          ))}

          <div className="form-field">
            <label className="form-label">Unit</label>
            <select className="form-input" value={form.unit}
              onChange={(e) => handle("unit", e.target.value)}>
              {["pcs", "kg", "g", "litre", "ml", "box", "dozen"].map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">Tax (%)</label>
            <select className="form-input" value={form.tax}
              onChange={(e) => handle("tax", e.target.value)}>
              {["0", "5", "12", "18", "28"].map((t) => (
                <option key={t}>{t}%</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn--cancel" onClick={onBack}>Cancel</button>
          <button className="btn--save" onClick={onBack}>Save Item</button>
        </div>
      </div>
    </div>
  );
}

// ─── CREATE ITEM PAGE ─────────────────────────────────────────────────────────
function CreateItemPage({ prefillName, onBack }: { prefillName: string; onBack: () => void }) {
  const [form, setForm] = useState({
    name: prefillName, category: "", itemCode: "", mrp: "", sp: "", unit: "pcs", tax: "0",
  });

  const handle = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const fields: [string, string, string, string][] = [
    ["Item Name *", "name", "text", "Enter item name"],
    ["Category", "category", "text", "e.g. Beverages"],
    ["Item Code / SKU", "itemCode", "text", "e.g. CC500"],
    ["MRP (₹)", "mrp", "number", "0.00"],
    ["Selling Price (₹)", "sp", "number", "0.00"],
  ];

  return (
    <div className="page">
      <div className="top-bar">
        <button className="btn btn--ghost" onClick={onBack}>← Back to POS</button>
        <h2 className="page-title">Create Item</h2>
        <div />
      </div>

      <div className="form-card">
        <div className="create-badge">
          <span className="create-badge__icon">✦</span>
          <span>Quick Create — Item not found in inventory</span>
        </div>

        <h3 className="form-heading">Item Details</h3>
        <div className="form-grid">
          {fields.map(([label, key, type, placeholder]) => (
            <div className="form-field" key={key}>
              <label className="form-label">{label}</label>
              <input
                className="form-input"
                type={type}
                placeholder={placeholder}
                value={(form as Record<string, string>)[key]}
                onChange={(e) => handle(key, e.target.value)}
              />
            </div>
          ))}

          <div className="form-field">
            <label className="form-label">Unit</label>
            <select className="form-input" value={form.unit}
              onChange={(e) => handle("unit", e.target.value)}>
              {["pcs", "kg", "g", "litre", "ml", "box", "dozen"].map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">Tax (%)</label>
            <select className="form-input" value={form.tax}
              onChange={(e) => handle("tax", e.target.value)}>
              {["0", "5", "12", "18", "28"].map((t) => (
                <option key={t}>{t}%</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn--cancel" onClick={onBack}>Cancel</button>
          <button className="btn--save" onClick={onBack}>Create &amp; Add to Bill</button>
        </div>
      </div>
    </div>
  );
}

// ─── POS PAGE ─────────────────────────────────────────────────────────────────
function POSPage() {
  const [searchVal, setSearchVal] = useState("");
  const navigate = useNavigate();
  const [items, setItems] = useState<BillItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const inventory: string[] = []; // Add item names here to populate inventory
  const filtered = inventory.filter((i) =>
    i.toLowerCase().includes(searchVal.toLowerCase())
  );

 useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === "i") {
      navigate("/create-item");
    }

    if (e.key === "F1") {
      searchRef.current?.focus();
    }

    if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, [navigate]);

  const subTotal = items.reduce((a, i) => a + i.amount, 0);

  return (
    <div className="page">
      {/* Top Bar */}
      <div className="top-bar">
        <button className="btn btn--ghost">← Exit POS</button>
        <h2 className="page-title">POS Billing</h2>
        <div className="top-bar__right">
          <button className="btn btn--outline-primary">▶ Watch how to use POS Billing</button>
          <button className="btn btn--ghost">Settings [CTRL + S]</button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="tab-bar">
  <div className="tab--active">
    Billing Screen 1
  </div>

  <div
    className="tab--add"
    onClick={() => setItems([])}
  >
    + Hold Bill & Create Another
  </div>
</div>

      <div className="main-layout">
        {/* Left Panel */}
        <div className="left-panel">
          {/* Action Buttons */}
          <div className="action-row">
           <button className="action-btn" onClick={() => navigate("/create-item")}>+ New Item [CTRL+I]</button>
            <button className="action-btn">Change Price [P]</button>
            <button className="action-btn">Change QTY [Q]</button>
            <button className="action-btn action-btn--danger">Delete Item [DEL]</button>
          </div>

          {/* Search */}
          <div className="search-row">
            <select className="cat-select">
              <option>Category ▾</option>
            </select>

            <div className="search-wrap">
              <input
                ref={searchRef}
                className="search-input"
                placeholder="Search by Item/ Serial no./ HSN code/ SKU/ Custom Field / Category or Scan Barcode"
                value={searchVal}
                onChange={(e) => { setSearchVal(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
              />
              <span className="f1-badge">F1</span>

              {showDropdown && (
                <div className="dropdown">
                  <div className="dropdown__header">
                    <span className="dropdown__label">Item Name</span>
                    <div className="dropdown__header-right">
                      <span className="esc-badge">Esc</span>
                      <button className="drop-close" onClick={() => setShowDropdown(false)}>×</button>
                    </div>
                  </div>

                  {filtered.length > 0 ? (
                    filtered.map((it) => (
                      <div key={it} className="drop-item">{it}</div>
                    ))
                  ) : (
                    <div className="no-item">No Item Found</div>
                  )}

                  <button
                className="create-item-btn"
                onClick={() => navigate("/create-item", { state: { name: searchVal } })}
                >
                    + Create Item
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="table-wrap">
            <table className="bill-table">
              <thead>
                <tr>
                  {["NO", "ITEMS", "ITEM CODE", "MRP", "SP (₹)", "QUANTITY", "AMOUNT (₹)"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-cell">
                      <div className="empty-state">
                        <div className="empty-icon">
                          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                            <rect x="10" y="18" width="16" height="16" rx="2" stroke="#9ca3af" strokeWidth="2" />
                            <rect x="30" y="10" width="16" height="16" rx="2" stroke="#9ca3af" strokeWidth="2" />
                            <rect x="30" y="30" width="16" height="16" rx="2" stroke="#9ca3af" strokeWidth="2" />
                            <path d="M26 26 L30 26" stroke="#9ca3af" strokeWidth="2" />
                          </svg>
                        </div>
                        <p className="empty-text">🔍 Add items by searching item name or item code</p>
                        <p className="empty-subtext">Or</p>
                        <p className="empty-text">⬡ Simply scan barcode to add items</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.no}>
                      <td>{item.no}</td>
                      <td>{item.name}</td>
                      <td>{item.itemCode}</td>
                      <td>₹{item.mrp}</td>
                      <td>₹{item.sp}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.amount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <div className="discount-row">
            <span className="discount-btn">Add Discount [F2]</span>
            <span className="discount-btn">Add Additional Charge [F3]</span>
          </div>

          <div className="bill-details">
            <p className="bill-title">Bill details</p>
            <div className="bill-row">
              <span className="bill-label">Sub Total</span>
              <span className="bill-val">₹ {subTotal.toFixed(0)}</span>
            </div>
            <div className="bill-row">
              <span className="bill-label">Tax</span>
              <span className="bill-val">₹ 0</span>
            </div>
            <div className="bill-row bill-row--total">
              <span className="bill-label">Total Amount</span>
              <span className="bill-val">₹ {subTotal.toFixed(0)}</span>
            </div>
          </div>

          <div className="received-section">
            <span className="bill-label">Received Amount [F4]</span>
            <div className="received-row">
              <input className="received-input" placeholder="₹ 0" type="number" />
              <select className="pay-select">
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
              </select>
            </div>
          </div>

          <div className="save-btns">
            <button className="btn--save-print">Save &amp; Print [F6]</button>
            <button className="btn--save-bill">Save Bill [F7]</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default POSPage;