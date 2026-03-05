import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
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

// ─── MODALS ───────────────────────────────────────────────────────────────────
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff", borderRadius: 12, padding: 28, minWidth: 340,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── POS PAGE ─────────────────────────────────────────────────────────────────
function POSPage() {
  const [searchVal, setSearchVal] = useState("");
  const navigate = useNavigate();
  const [bills, setBills] = useState<{ id: number; items: BillItem[] }[]>([
    { id: 1, items: [] }
  ]);
  const [activeBillId, setActiveBillId] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null); // tracks selected item index

  // Modal states
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showChargeModal, setShowChargeModal] = useState(false);

  // Modal input values
  const [newPrice, setNewPrice] = useState("");
  const [newQty, setNewQty] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState<"flat" | "percent">("flat");
  const [additionalCharge, setAdditionalCharge] = useState("");
  const [additionalChargeLabel, setAdditionalChargeLabel] = useState("Packaging");

  const searchRef = useRef<HTMLInputElement>(null);
  const receivedRef = useRef<HTMLInputElement>(null);

  const inventory: string[] = [];
  const filtered = inventory.filter((i) =>
    i.toLowerCase().includes(searchVal.toLowerCase())
  );

  const activeBill = bills.find((b) => b.id === activeBillId);
  const items = activeBill?.items || [];

  // ── helpers to mutate active bill's items ──
  const setItems = (updater: (prev: BillItem[]) => BillItem[]) => {
    setBills((prev) =>
      prev.map((b) =>
        b.id === activeBillId ? { ...b, items: updater(b.items) } : b
      )
    );
  };

  const selectedItem = selectedRow !== null ? items[selectedRow] : null;

  // ── discount & charge state (per bill, stored simply here) ──
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedCharge, setAppliedCharge] = useState(0);

  const subTotal = items.reduce((a, i) => a + i.amount, 0);
  const totalAmount = subTotal - appliedDiscount + appliedCharge;

  // ── SHORTCUT HANDLER ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      // Always-active shortcuts
      if (e.ctrlKey && e.key === "i") {
        e.preventDefault();
        navigate("/cashier/create-item");
        return;
      }

      if (e.key === "F1") {
        e.preventDefault();
        searchRef.current?.focus();
        setShowDropdown(true);
        return;
      }

      if (e.key === "Escape") {
        setShowDropdown(false);
        setShowPriceModal(false);
        setShowQtyModal(false);
        setShowDiscountModal(false);
        setShowChargeModal(false);
        return;
      }

      // Shortcuts that should not fire when typing in an input (except F-keys)
      if (e.key === "F2") {
        e.preventDefault();
        setShowDiscountModal(true);
        return;
      }

      if (e.key === "F3") {
        e.preventDefault();
        setShowChargeModal(true);
        return;
      }

      if (e.key === "F4") {
        e.preventDefault();
        receivedRef.current?.focus();
        return;
      }

      if (e.key === "F6") {
        e.preventDefault();
        handleSavePrint();
        return;
      }

      if (e.key === "F7") {
        e.preventDefault();
        handleSaveBill();
        return;
      }

      // These fire only when NOT typing in an input
      if (isTyping) return;

      if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        if (selectedItem) setShowPriceModal(true);
        else alert("Please select an item row first.");
        return;
      }

      if (e.key === "q" || e.key === "Q") {
        e.preventDefault();
        if (selectedItem) setShowQtyModal(true);
        else alert("Please select an item row first.");
        return;
      }

      if (e.key === "Delete") {
        e.preventDefault();
        if (selectedItem !== null && selectedRow !== null) {
          setItems((prev) =>
            prev
              .filter((_, idx) => idx !== selectedRow)
              .map((item, idx) => ({ ...item, no: idx + 1 }))
          );
          setSelectedRow(null);
        }
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, selectedItem, selectedRow]);

  // ── Modal action handlers ──
  const applyPriceChange = () => {
    if (selectedRow === null) return;
    const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0) return;
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === selectedRow
          ? { ...item, sp: price, amount: price * item.quantity }
          : item
      )
    );
    setNewPrice("");
    setShowPriceModal(false);
  };

  const applyQtyChange = () => {
    if (selectedRow === null) return;
    const qty = parseFloat(newQty);
    if (isNaN(qty) || qty <= 0) return;
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === selectedRow
          ? { ...item, quantity: qty, amount: item.sp * qty }
          : item
      )
    );
    setNewQty("");
    setShowQtyModal(false);
  };

  const applyDiscount = () => {
    const val = parseFloat(discount);
    if (isNaN(val) || val < 0) return;
    if (discountType === "flat") {
      setAppliedDiscount(val);
    } else {
      setAppliedDiscount((subTotal * val) / 100);
    }
    setDiscount("");
    setShowDiscountModal(false);
  };

  const applyCharge = () => {
    const val = parseFloat(additionalCharge);
    if (isNaN(val) || val < 0) return;
    setAppliedCharge(val);
    setAdditionalCharge("");
    setShowChargeModal(false);
  };

  const handleSavePrint = () => {
    alert("Bill saved & sent to printer! 🖨️");
  };

  const handleSaveBill = () => {
    alert("Bill saved successfully! ✅");
  };

  return (
    <div className="page">
      {/* ── Modals ── */}
      {showPriceModal && (
        <Modal title={`Change Price — ${selectedItem?.name}`} onClose={() => setShowPriceModal(false)}>
          <p style={{ color: "#6b7280", marginBottom: 12, fontSize: 14 }}>
            Current SP: ₹{selectedItem?.sp}
          </p>
          <input
            autoFocus
            className="form-input"
            type="number"
            placeholder="Enter new selling price"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyPriceChange()}
            style={{ width: "100%", marginBottom: 16 }}
          />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn--cancel" onClick={() => setShowPriceModal(false)}>Cancel</button>
            <button className="btn--save" onClick={applyPriceChange}>Apply [Enter]</button>
          </div>
        </Modal>
      )}

      {showQtyModal && (
        <Modal title={`Change Quantity — ${selectedItem?.name}`} onClose={() => setShowQtyModal(false)}>
          <p style={{ color: "#6b7280", marginBottom: 12, fontSize: 14 }}>
            Current Qty: {selectedItem?.quantity}
          </p>
          <input
            autoFocus
            className="form-input"
            type="number"
            placeholder="Enter new quantity"
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyQtyChange()}
            style={{ width: "100%", marginBottom: 16 }}
          />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn--cancel" onClick={() => setShowQtyModal(false)}>Cancel</button>
            <button className="btn--save" onClick={applyQtyChange}>Apply [Enter]</button>
          </div>
        </Modal>
      )}

      {showDiscountModal && (
        <Modal title="Add Discount" onClose={() => setShowDiscountModal(false)}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button
              onClick={() => setDiscountType("flat")}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 8, border: "1.5px solid",
                borderColor: discountType === "flat" ? "#6366f1" : "#e5e7eb",
                background: discountType === "flat" ? "#ede9fe" : "#fff",
                color: discountType === "flat" ? "#4f46e5" : "#374151",
                cursor: "pointer", fontWeight: 600,
              }}
            >
              Flat (₹)
            </button>
            <button
              onClick={() => setDiscountType("percent")}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 8, border: "1.5px solid",
                borderColor: discountType === "percent" ? "#6366f1" : "#e5e7eb",
                background: discountType === "percent" ? "#ede9fe" : "#fff",
                color: discountType === "percent" ? "#4f46e5" : "#374151",
                cursor: "pointer", fontWeight: 600,
              }}
            >
              Percent (%)
            </button>
          </div>
          <input
            autoFocus
            className="form-input"
            type="number"
            placeholder={discountType === "flat" ? "Enter discount in ₹" : "Enter discount %"}
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyDiscount()}
            style={{ width: "100%", marginBottom: 16 }}
          />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn--cancel" onClick={() => setShowDiscountModal(false)}>Cancel</button>
            <button className="btn--save" onClick={applyDiscount}>Apply [Enter]</button>
          </div>
        </Modal>
      )}

      {showChargeModal && (
        <Modal title="Add Additional Charge" onClose={() => setShowChargeModal(false)}>
          <div style={{ marginBottom: 12 }}>
            <label className="form-label">Charge Label</label>
            <input
              className="form-input"
              type="text"
              value={additionalChargeLabel}
              onChange={(e) => setAdditionalChargeLabel(e.target.value)}
              style={{ width: "100%", marginBottom: 10 }}
            />
            <label className="form-label">Amount (₹)</label>
            <input
              autoFocus
              className="form-input"
              type="number"
              placeholder="Enter charge amount"
              value={additionalCharge}
              onChange={(e) => setAdditionalCharge(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyCharge()}
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn--cancel" onClick={() => setShowChargeModal(false)}>Cancel</button>
            <button className="btn--save" onClick={applyCharge}>Apply [Enter]</button>
          </div>
        </Modal>
      )}

      {/* Top Bar */}
      <div className="top-bar">
        <button className="btn btn--ghost">← Exit POS</button>
        <h2 className="page-title">POS Billing</h2>
        <div className="top-bar__right">
          <button className="btn btn--outline-primary">▶ Watch how to use POS Billing</button>
          <button className="btn btn--ghost">Settings</button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="tab-bar">
        {bills.map((bill) => (
          <div
            key={bill.id}
            className={bill.id === activeBillId ? "tab--active" : "tab"}
            onClick={() => setActiveBillId(bill.id)}
          >
            Billing Screen {bill.id}
          </div>
        ))}
        <div
          className="tab tab--add"
          onClick={() => {
            const newId = bills.length + 1;
            setBills([...bills, { id: newId, items: [] }]);
            setActiveBillId(newId);
          }}
        >
          + Hold Bill &amp; Create Another
        </div>
      </div>

      <div className="main-layout">
        {/* Left Panel */}
        <div className="left-panel">
          {/* Action Buttons */}
          <div className="action-row">
            <button className="action-btn" onClick={() => navigate("/create-item")}>
              + New Item [CTRL+I]
            </button>
            <button
              className="action-btn"
              onClick={() => {
                if (selectedItem) setShowPriceModal(true);
                else alert("Please select an item row first.");
              }}
            >
              Change Price [P]
            </button>
            <button
              className="action-btn"
              onClick={() => {
                if (selectedItem) setShowQtyModal(true);
                else alert("Please select an item row first.");
              }}
            >
              Change QTY [Q]
            </button>
            <button
              className="action-btn action-btn--danger"
              onClick={() => {
                if (selectedRow !== null) {
                  setItems((prev) =>
                    prev
                      .filter((_, idx) => idx !== selectedRow)
                      .map((item, idx) => ({ ...item, no: idx + 1 }))
                  );
                  setSelectedRow(null);
                } else {
                  alert("Please select an item row first.");
                }
              }}
            >
              Delete Item [DEL]
            </button>
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
                placeholder="Search by Item / Serial no. / HSN code / SKU / Custom Field / Category or Scan Barcode"
                value={searchVal}
                onChange={(e) => {
                  setSearchVal(e.target.value);
                  setShowDropdown(true);
                }}
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
                        <p className="empty-text empty-text--with-icon">
                          <Search size={18} className="empty-icon-search" />
                          Add items by searching item name or item code
                        </p>
                        <p className="empty-subtext">Or</p>
                        <p className="empty-text">⬡ Simply scan barcode to add items</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr
                      key={item.no}
                      onClick={() => setSelectedRow(idx === selectedRow ? null : idx)}
                      style={{
                        cursor: "pointer",
                        background: idx === selectedRow ? "#ede9fe" : undefined,
                        outline: idx === selectedRow ? "2px solid #6366f1" : undefined,
                      }}
                    >
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
            <span
              className="discount-btn"
              style={{ cursor: "pointer" }}
              onClick={() => setShowDiscountModal(true)}
            >
              Add Discount [F2]
            </span>
            <span
              className="discount-btn"
              style={{ cursor: "pointer" }}
              onClick={() => setShowChargeModal(true)}
            >
              Add Additional Charge [F3]
            </span>
          </div>

          <div className="bill-details">
            <p className="bill-title">Bill details</p>
            <div className="bill-row">
              <span className="bill-label">Sub Total</span>
              <span className="bill-val">₹ {subTotal.toFixed(0)}</span>
            </div>
            {appliedDiscount > 0 && (
              <div className="bill-row" style={{ color: "#16a34a" }}>
                <span className="bill-label">Discount</span>
                <span className="bill-val">− ₹ {appliedDiscount.toFixed(0)}</span>
              </div>
            )}
            {appliedCharge > 0 && (
              <div className="bill-row">
                <span className="bill-label">{additionalChargeLabel}</span>
                <span className="bill-val">+ ₹ {appliedCharge.toFixed(0)}</span>
              </div>
            )}
            <div className="bill-row">
              <span className="bill-label">Tax</span>
              <span className="bill-val">₹ 0</span>
            </div>
            <div className="bill-row bill-row--total">
              <span className="bill-label">Total Amount</span>
              <span className="bill-val">₹ {totalAmount.toFixed(0)}</span>
            </div>
          </div>

          <div className="received-section">
            <span className="bill-label">Received Amount [F4]</span>
            <div className="received-row">
              <input
                ref={receivedRef}
                className="received-input"
                placeholder="₹ 0"
                type="number"
              />
              <select className="pay-select">
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
              </select>
            </div>
          </div>

          <div className="save-btns">
            <button className="btn--save-print" onClick={handleSavePrint}>
              Save &amp; Print [F6]
            </button>
            <button className="btn--save-bill" onClick={handleSaveBill}>
              Save Bill [F7]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default POSPage;