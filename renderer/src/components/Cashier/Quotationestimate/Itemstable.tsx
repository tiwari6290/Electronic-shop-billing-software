import { useState } from "react";
import { BillItem, TAX_OPTIONS } from "./Quotationtypes";
import "./ItemsTable.css";

function recalcItem(item: BillItem): BillItem {
  const base = parseFloat((item.price * item.qty).toFixed(2));
  const discountVal =
  item.discountPct > 0
    ? parseFloat(((base * item.discountPct) / 100).toFixed(2))
    : parseFloat(item.discountAmt.toFixed(2));
    const afterDiscount = parseFloat((base - discountVal).toFixed(2));

  const taxAmt = parseFloat(
    ((afterDiscount * item.taxRate) / 100).toFixed(2)
  );
  return { ...item, amount: afterDiscount + taxAmt };
}

function fmtNum(n: number, dec = 2): string {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
}

interface ColumnSettings { showPrice: boolean; showQty: boolean; }

interface ColumnModalProps {
  settings: ColumnSettings;
  onSave: (s: ColumnSettings) => void;
  onClose: () => void;
}

function ColumnModal({ settings, onSave, onClose }: ColumnModalProps) {
  const [local, setLocal] = useState<ColumnSettings>({ ...settings });
  function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
      <button onClick={onChange} role="switch" aria-checked={checked} style={{
        width: 44, height: 24, borderRadius: 9999, border: "none",
        background: checked ? "#6366f1" : "#d1d5db",
        position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
      }}>
        <span style={{
          position: "absolute", top: 2, left: checked ? 22 : 2,
          width: 20, height: 20, borderRadius: "50%", background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s",
        }} />
      </button>
    );
  }
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
      <div style={{ background: "#fff", borderRadius: 12, width: 480, maxWidth: "95vw", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f3f4f6" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>Show/Hide Columns in Invoice</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 20, lineHeight: 1, padding: 2 }}>✕</button>
        </div>
        <div style={{ padding: "8px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid #f9fafb" }}>
            <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>Price/Item (₹)</span>
            <Toggle checked={local.showPrice} onChange={() => setLocal(p => ({ ...p, showPrice: !p.showPrice }))} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px" }}>
            <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>Quantity</span>
            <Toggle checked={local.showQty} onChange={() => setLocal(p => ({ ...p, showQty: !p.showQty }))} />
          </div>
        </div>
        <div style={{ borderTop: "1px solid #f3f4f6" }}>
          <div style={{ padding: "10px 24px 6px", fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase" }}>Custom Column</div>
          <div style={{ padding: "20px 24px", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#6366f1", margin: "0 0 4px", fontWeight: 500 }}>No Custom Columns added</p>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Any custom column such as Batch # &amp; Expiry Date can be added</p>
          </div>
          <div style={{ margin: "0 24px 16px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "#374151" }}>
            To add Custom Item Columns - Go to <strong>Item settings</strong> from{" "}
            <span style={{ color: "#6366f1", cursor: "pointer", textDecoration: "underline" }}>Items page (click here)</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, padding: "16px 24px", borderTop: "1px solid #f3f4f6", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 24px", border: "1px solid #d1d5db", borderRadius: 7, background: "#fff", fontSize: 14, color: "#374151", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>Cancel</button>
          <button onClick={() => { onSave(local); onClose(); }} style={{ padding: "9px 28px", border: "none", borderRadius: 7, background: "#6366f1", color: "#fff", fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Save</button>
        </div>
      </div>
    </div>
  );
}

interface ItemsTableProps { items: BillItem[]; onChange: (items: BillItem[]) => void; onAddItem: () => void; }

export default function ItemsTable({ items, onChange, onAddItem }: ItemsTableProps) {
  const [showColModal, setShowColModal] = useState(false);
  const [colSettings, setColSettings] = useState<ColumnSettings>({ showPrice: true, showQty: true });

  // Atomic patch: apply multiple fields at once then recalc
  function updateItem(rowId: string, patches: Partial<BillItem>) {
    onChange(items.map((item) => item.rowId !== rowId ? item : recalcItem({ ...item, ...patches })));
  }

  function removeItem(rowId: string) { onChange(items.filter((i) => i.rowId !== rowId)); }

  const subtotalQty = items.reduce((s, i) => s + i.qty, 0);
  const subtotalDiscount = items.reduce((s, i) => {
    const base = parseFloat((i.price * i.qty).toFixed(2));
const discount =
  i.discountPct > 0
    ? parseFloat(((base * i.discountPct) / 100).toFixed(2))
    : parseFloat(i.discountAmt.toFixed(2));
return s + discount;
  }, 0);
  const subtotalTax = items.reduce((s, i) => {
  const base = parseFloat((i.price * i.qty).toFixed(2));

  const discount =
    i.discountPct > 0
      ? parseFloat(((base * i.discountPct) / 100).toFixed(2))
      : parseFloat(i.discountAmt.toFixed(2));

  const afterDiscount = parseFloat((base - discount).toFixed(2));

  const tax = parseFloat(
    ((afterDiscount * i.taxRate) / 100).toFixed(2)
  );

  return s + tax;
}, 0);
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
                <button className="it-add-col-btn" onClick={() => setShowColModal(true)} title="Show/Hide columns">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const base = parseFloat((item.price * item.qty).toFixed(2));
             const discountVal =
  item.discountPct > 0
    ? parseFloat(((base * item.discountPct) / 100).toFixed(2))
    : parseFloat(item.discountAmt.toFixed(2));
              const afterDiscount = parseFloat((base - discountVal).toFixed(2));
              const taxAmt = parseFloat(((afterDiscount * item.taxRate) / 100).toFixed(2));
              // Derived values for the mirror field
              const derivedDiscountRs =
  item.discountPct > 0
    ? parseFloat(((base * item.discountPct) / 100).toFixed(2))
    : parseFloat(item.discountAmt.toFixed(2));
              return (
                <tr key={item.rowId} className="it-tr">
                  <td className="it-td it-td--no">{idx + 1}</td>
                  <td className="it-td it-td--name">
                    <div className="it-name">{item.name}</div>
                    <input className="it-desc" placeholder="Enter Description (optional)" value={item.description}
                      onChange={(e) => updateItem(item.rowId, { description: e.target.value })} />
                  </td>
                  <td className="it-td it-td--center">
                    <input className="it-cell-input" value={item.hsn} placeholder="—"
                      onChange={(e) => updateItem(item.rowId, { hsn: e.target.value })} />
                  </td>
                  {colSettings.showQty && (
                    <td className="it-td it-td--center">
                      <div className="it-qty-row">
                        <input className="it-qty-input" type="number" min={0} value={item.qty}
                          onChange={(e) => updateItem(item.rowId, { qty: parseFloat(e.target.value) || 0 })} />
                        <span className="it-unit">{item.unit}</span>
                      </div>
                    </td>
                  )}
                  {colSettings.showPrice && (
                    <td className="it-td it-td--right">
                      <input className="it-cell-input it-cell-input--right" type="number" step="0.01" min={0} value={item.price}
                        onChange={(e) => updateItem(item.rowId, { price: parseFloat(e.target.value) || 0 })} />
                    </td>
                  )}
                  <td className="it-td it-td--discount">
                    <div className="it-discount-col">
                      {/* % input — when % is set, ₹ is derived (read-only) */}
                      <div className="it-discount-row">
                        <span className="it-pct-symbol">%</span>
                        <input className="it-disc-input" type="number" min={0} max={100}
                          value={item.discountPct === 0 && item.discountAmt > 0 ? "" : item.discountPct}
                          placeholder="0"
                          onChange={(e) => updateItem(item.rowId, { discountPct: parseFloat(e.target.value) || 0, discountAmt: 0 })}
                        />
                      </div>
                      {/* ₹ input — when % is active, show derived value read-only */}
                      <div className="it-discount-row">
                        <span className="it-rs-symbol">₹</span>
                        <input className="it-disc-input" type="number" min={0}
                          value={item.discountPct > 0 ? parseFloat(derivedDiscountRs.toFixed(2)) : (item.discountAmt === 0 ? "" : item.discountAmt)}
                          placeholder="0"
                          readOnly={item.discountPct > 0}
                          style={item.discountPct > 0 ? { background: "#f0f0f0", color: "#9ca3af", cursor: "not-allowed" } : {}}
                          onChange={(e) => updateItem(item.rowId, { discountAmt: parseFloat(e.target.value) || 0, discountPct: 0 })}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="it-td it-td--tax">
                    <div className="it-tax-col">
                      <select className="it-tax-select" value={item.taxLabel}
                        onChange={(e) => {
                          const opt = TAX_OPTIONS.find((t) => t.label === e.target.value);
                          updateItem(item.rowId, { taxLabel: e.target.value, taxRate: opt?.rate ?? 0 });
                        }}
                      >
                        {TAX_OPTIONS.map((t) => (<option key={t.label} value={t.label}>{t.label}</option>))}
                      </select>
                      {item.taxRate > 0 && (
                        <span className="it-tax-amt">(₹ {fmtNum(taxAmt)})</span>
                      )}
                    </div>
                  </td>
                  <td className="it-td it-td--right it-td--amount">
                    ₹ {fmtNum(item.amount)}
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
              );
            })}
            <tr>
              <td colSpan={(3 + (colSettings.showQty ? 1 : 0) + (colSettings.showPrice ? 1 : 0))}>
                <button className="it-add-item-btn" onClick={onAddItem}>+ Add Item</button>
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
            <tr className="it-subtotal-row">
              <td colSpan={3} className="it-subtotal-label">SUBTOTAL</td>
              {colSettings.showQty && (
                <td className="it-subtotal-val it-td--center">
                  {subtotalQty.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
                </td>
              )}
              {colSettings.showPrice && <td />}
              <td className="it-subtotal-val it-td--right">₹ {fmtNum(subtotalDiscount)}</td>
              <td className="it-subtotal-val it-td--center" style={{ fontSize: 12, color: "#9ca3af" }}>
                {subtotalTax > 0 ? `₹ ${fmtNum(subtotalTax)}` : ""}
              </td>
              <td className="it-subtotal-val it-td--right">₹ {fmtNum(subtotalAmount)}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
      {showColModal && (
        <ColumnModal settings={colSettings} onSave={(s) => setColSettings(s)} onClose={() => setShowColModal(false)} />
      )}
    </div>
  );
}