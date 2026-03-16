import { useState } from "react";
import { BillItem, TAX_OPTIONS } from "./Quotationtypes";
import "./ItemsTable.css";

// ─── Show/Hide Columns Modal ─────────────────────────────────────────────────
interface ColumnSettings {
  showPrice: boolean;
  showQty: boolean;
}

interface ColumnModalProps {
  settings: ColumnSettings;
  onSave: (s: ColumnSettings) => void;
  onClose: () => void;
}

function ColumnModal({ settings, onSave, onClose }: ColumnModalProps) {
  const [local, setLocal] = useState<ColumnSettings>({ ...settings });

  function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
      <button
        onClick={onChange}
        role="switch"
        aria-checked={checked}
        style={{
          width: 44, height: 24, borderRadius: 9999, border: "none",
          background: checked ? "#6366f1" : "#d1d5db",
          position: "relative", cursor: "pointer", transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <span style={{
          position: "absolute", top: 2, left: checked ? 22 : 2,
          width: 20, height: 20, borderRadius: "50%", background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s",
        }} />
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300,
    }}>
      <div style={{
        background: "#fff", borderRadius: 12, width: 480, maxWidth: "95vw",
        fontFamily: "'DM Sans', sans-serif", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", borderBottom: "1px solid #f3f4f6",
        }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
            Show/Hide Columns in Invoice
          </span>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer", color: "#6b7280",
            fontSize: 20, lineHeight: 1, padding: 2,
          }}>✕</button>
        </div>

        {/* Toggle rows */}
        <div style={{ padding: "8px 0" }}>
          {/* Price/Item */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 24px", borderBottom: "1px solid #f9fafb",
          }}>
            <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>
              Price/Item (₹)
            </span>
            <Toggle checked={local.showPrice} onChange={() => setLocal(p => ({ ...p, showPrice: !p.showPrice }))} />
          </div>

          {/* Quantity */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 24px",
          }}>
            <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>
              Quantity
            </span>
            <Toggle checked={local.showQty} onChange={() => setLocal(p => ({ ...p, showQty: !p.showQty }))} />
          </div>
        </div>

        {/* Custom column section */}
        <div style={{ borderTop: "1px solid #f3f4f6", padding: "0" }}>
          <div style={{
            padding: "10px 24px 6px",
            fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            Custom Column
          </div>
          <div style={{ padding: "20px 24px", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#6366f1", margin: "0 0 4px", fontWeight: 500 }}>
              No Custom Columns added
            </p>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
              Any custom column such as Batch # & Expiry Date can be added
            </p>
          </div>
          <div style={{
            margin: "0 24px 16px",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 6,
            padding: "10px 14px",
            fontSize: 13,
            color: "#374151",
          }}>
            To add Custom Item Columns - Go to{" "}
            <strong>Item settings</strong> from{" "}
            <span style={{ color: "#6366f1", cursor: "pointer", textDecoration: "underline" }}>
              Items page (click here)
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", gap: 12, padding: "16px 24px",
          borderTop: "1px solid #f3f4f6", justifyContent: "flex-end",
        }}>
          <button onClick={onClose} style={{
            padding: "9px 24px", border: "1px solid #d1d5db", borderRadius: 7,
            background: "#fff", fontSize: 14, color: "#374151", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
          }}>
            Cancel
          </button>
          <button onClick={() => { onSave(local); onClose(); }} style={{
            padding: "9px 28px", border: "none", borderRadius: 7,
            background: "#6366f1", color: "#fff", fontSize: 14, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
          }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface ItemsTableProps {
  items: BillItem[];
  onChange: (items: BillItem[]) => void;
  onAddItem: () => void;
}

export default function ItemsTable({ items, onChange, onAddItem }: ItemsTableProps) {
  const [showColModal, setShowColModal] = useState(false);
  const [colSettings, setColSettings] = useState<ColumnSettings>({
    showPrice: true,
    showQty: true,
  });

  function updateItem(rowId: string, field: keyof BillItem, value: any) {
    const updated = items.map((item) => {
      if (item.rowId !== rowId) return item;
      const next = { ...item, [field]: value };
      const base = next.price * next.qty;
      const discountVal =
        next.discountPct > 0
          ? (base * next.discountPct) / 100
          : next.discountAmt;
      const afterDiscount = base - discountVal;
      const taxAmt = (afterDiscount * next.taxRate) / 100;
      next.amount = afterDiscount + taxAmt;
      return next;
    });
    onChange(updated);
  }

  function removeItem(rowId: string) {
    onChange(items.filter((i) => i.rowId !== rowId));
  }

  const subtotalQty = items.reduce((s, i) => s + i.qty, 0);
  const subtotalDiscount = items.reduce(
    (s, i) =>
      s + (i.discountPct > 0 ? (i.price * i.qty * i.discountPct) / 100 : i.discountAmt),
    0
  );
  const subtotalAmount = items.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="it-wrap">
      <div className="it-table-scroll">
        <table className="it-table">
          <thead>
            <tr>
              <th className="it-th it-th--no">NO</th>
              <th className="it-th">ITEMS / SERVICES</th>
              <th className="it-th it-th--center">HSN / SAC</th>
              {colSettings.showQty && <th className="it-th it-th--center">QTY</th>}
              {colSettings.showPrice && <th className="it-th it-th--right">PRICE / ITEM (₹)</th>}
              <th className="it-th it-th--right">DISCOUNT</th>
              <th className="it-th it-th--center">TAX</th>
              <th className="it-th it-th--right">AMOUNT (₹)</th>
              <th className="it-th it-th--add">
                {/* + button opens Show/Hide Columns modal */}
                <button
                  className="it-add-col-btn"
                  onClick={() => setShowColModal(true)}
                  title="Show/Hide columns"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.rowId} className="it-tr">
                <td className="it-td it-td--no">{idx + 1}</td>
                <td className="it-td it-td--name">
                  <div className="it-name">{item.name}</div>
                  <input
                    className="it-desc"
                    placeholder="Enter Description (optional)"
                    value={item.description}
                    onChange={(e) => updateItem(item.rowId, "description", e.target.value)}
                  />
                </td>
                <td className="it-td it-td--center">
                  <input
                    className="it-cell-input"
                    value={item.hsn}
                    onChange={(e) => updateItem(item.rowId, "hsn", e.target.value)}
                    placeholder="—"
                  />
                </td>
                {colSettings.showQty && (
                  <td className="it-td it-td--center">
                    <div className="it-qty-row">
                      <input
                        className="it-qty-input"
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateItem(item.rowId, "qty", Number(e.target.value))}
                      />
                      <span className="it-unit">{item.unit}</span>
                    </div>
                  </td>
                )}
                {colSettings.showPrice && (
                  <td className="it-td it-td--right">
                    <input
                      className="it-cell-input it-cell-input--right"
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(item.rowId, "price", Number(e.target.value))}
                    />
                  </td>
                )}
                <td className="it-td it-td--discount">
                  <div className="it-discount-col">
                    <div className="it-discount-row">
                      <span className="it-pct-symbol">%</span>
                      <input
                        className="it-disc-input"
                        type="number"
                        value={item.discountPct}
                        onChange={(e) => {
                          updateItem(item.rowId, "discountPct", Number(e.target.value));
                          updateItem(item.rowId, "discountAmt", 0);
                        }}
                      />
                    </div>
                    <div className="it-discount-row">
                      <span className="it-rs-symbol">₹</span>
                      <input
                        className="it-disc-input"
                        type="number"
                        value={item.discountAmt}
                        onChange={(e) => {
                          updateItem(item.rowId, "discountAmt", Number(e.target.value));
                          updateItem(item.rowId, "discountPct", 0);
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="it-td it-td--tax">
                  <div className="it-tax-col">
                    <select
                      className="it-tax-select"
                      value={item.taxLabel}
                      onChange={(e) => {
                        const opt = TAX_OPTIONS.find((t) => t.label === e.target.value);
                        updateItem(item.rowId, "taxLabel", e.target.value);
                        updateItem(item.rowId, "taxRate", opt?.rate || 0);
                      }}
                    >
                      {TAX_OPTIONS.map((t) => (
                        <option key={t.label} value={t.label}>{t.label}</option>
                      ))}
                    </select>
                    <span className="it-tax-amt">
                      (₹ {(((item.price * item.qty) - (item.discountPct > 0 ? (item.price * item.qty * item.discountPct) / 100 : item.discountAmt)) * item.taxRate / 100).toFixed(0)})
                    </span>
                  </div>
                </td>
                <td className="it-td it-td--right it-td--amount">
                  ₹ {item.amount.toLocaleString("en-IN")}
                </td>
                <td className="it-td it-td--del">
                  <button className="it-del-btn" onClick={() => removeItem(item.rowId)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}

            {/* Add Item row */}
            <tr>
              <td colSpan={colSettings.showQty && colSettings.showPrice ? 7 : colSettings.showQty || colSettings.showPrice ? 6 : 5}>
                <button className="it-add-item-btn" onClick={onAddItem}>
                  + Add Item
                </button>
              </td>
              <td colSpan={2}>
                <button className="it-barcode-btn" onClick={onAddItem}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 9V5a2 2 0 0 1 2-2h4M3 15v4a2 2 0 0 0 2 2h4M21 9V5a2 2 0 0 0-2-2h-4M21 15v4a2 2 0 0 1-2 2h-4" />
                    <line x1="7" y1="8" x2="7" y2="16" /><line x1="10" y1="8" x2="10" y2="16" />
                    <line x1="14" y1="8" x2="14" y2="16" /><line x1="17" y1="8" x2="17" y2="16" />
                  </svg>
                  Scan Barcode
                </button>
              </td>
            </tr>

            {/* Subtotal */}
            <tr className="it-subtotal-row">
              <td colSpan={3} className="it-subtotal-label">SUBTOTAL</td>
              {colSettings.showQty && <td className="it-subtotal-val it-td--center">₹ {subtotalQty}</td>}
              {colSettings.showPrice && <td />}
              <td className="it-subtotal-val it-td--right">₹ {subtotalDiscount.toFixed(0)}</td>
              <td />
              <td className="it-subtotal-val it-td--right">₹ {subtotalAmount.toLocaleString("en-IN")}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Show/Hide Columns Modal */}
      {showColModal && (
        <ColumnModal
          settings={colSettings}
          onSave={(s) => setColSettings(s)}
          onClose={() => setShowColModal(false)}
        />
      )}
    </div>
  );
}