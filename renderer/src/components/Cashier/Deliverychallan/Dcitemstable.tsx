import { useState } from "react";
import { BillItem, calcItemAmount, TAX_OPTIONS } from "./Deliverychallantype";
import "./Createdeliverychallan.css";

// ─── Show/Hide Columns Modal ──────────────────────────────────────────────────
interface ColumnConfig { pricePerItem: boolean; quantity: boolean; }

function ShowHideColumnsModal({ columns, onClose, onSave }: {
  columns: ColumnConfig;
  onClose: () => void;
  onSave: (c: ColumnConfig) => void;
}) {
  const [local, setLocal] = useState<ColumnConfig>({ ...columns });

  function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
    return (
      <button className={`dc-toggle${on ? " dc-toggle--on" : ""}`} onClick={() => set(!on)}>
        <span className="dc-toggle-knob" />
      </button>
    );
  }

  return (
    <div className="dc-overlay" onClick={onClose}>
      <div className="dc-col-modal" onClick={e => e.stopPropagation()}>
        <div className="dc-col-modal-hdr">
          <span className="dc-col-modal-title">Show/Hide Columns in Invoice</span>
          <button className="dc-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="dc-col-modal-body">
          <div className="dc-col-toggle-row">
            <span>Price/Item (₹)</span>
            <Toggle on={local.pricePerItem} set={v => setLocal(p => ({ ...p, pricePerItem: v }))} />
          </div>
          <div className="dc-col-toggle-row">
            <span>Quantity</span>
            <Toggle on={local.quantity} set={v => setLocal(p => ({ ...p, quantity: v }))} />
          </div>
          <div className="dc-col-custom-hdr">CUSTOM COLUMN</div>
          <div className="dc-col-empty-area">
            <p className="dc-col-empty-title">No Custom Columns added</p>
            <p className="dc-col-empty-sub">Any custom column such as Batch # &amp; Expiry Date can be added</p>
          </div>
          <div className="dc-col-notice">
            To add Custom Item Columns - Go to <strong>Item settings</strong> from{" "}
            <span className="dc-col-notice-link">Items page (click here)</span>
          </div>
        </div>
        <div className="dc-col-modal-footer">
          <button className="dc-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="dc-btn-primary" onClick={() => { onSave(local); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Items Table ──────────────────────────────────────────────────────────────
interface ItemsTableProps {
  items: BillItem[];
  onChange: (items: BillItem[]) => void;
  onAddItem: () => void;
}

export default function DCItemsTable({ items, onChange, onAddItem }: ItemsTableProps) {
  const [showColModal, setShowColModal] = useState(false);
  const [columns, setColumns] = useState<ColumnConfig>({ pricePerItem: true, quantity: true });

  const updateItem = (rowId: string, field: string, value: any) => {
    onChange(items.map(item => {
      if (item.rowId !== rowId) return item;
      const updated = { ...item, [field]: value };
      if (field === "taxLabel") {
        const opt = TAX_OPTIONS.find(t => t.label === value);
        updated.taxRate = opt ? opt.rate : 0;
      }
      updated.amount = calcItemAmount(updated);
      return updated;
    }));
  };

  const removeItem = (rowId: string) => onChange(items.filter(i => i.rowId !== rowId));

  const subtotalQty = items.reduce((s, i) => s + i.qty, 0);
  const subtotalDiscount = items.reduce((s, i) => s + (i.discountAmt + i.qty * i.price * i.discountPct / 100), 0);
  const subtotalTax = items.reduce((s, i) => {
    const base = i.qty * i.price - (i.qty * i.price * i.discountPct / 100) - i.discountAmt;
    return s + base * i.taxRate / 100;
  }, 0);
  const subtotalAmount = items.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="dc-items-section">
      <table className="dc-items-table">
        <thead>
          <tr>
            <th className="dc-items-th dc-items-th--no">NO</th>
            <th className="dc-items-th dc-items-th--name">ITEMS / SERVICES</th>
            <th className="dc-items-th">HSN / SAC</th>
            {columns.quantity    && <th className="dc-items-th">QTY</th>}
            {columns.pricePerItem && <th className="dc-items-th">PRICE/ITEM (₹)</th>}
            <th className="dc-items-th">DISCOUNT</th>
            <th className="dc-items-th">TAX</th>
            <th className="dc-items-th">AMOUNT (₹)</th>
            <th className="dc-items-th dc-items-th--add">
              <button className="dc-add-col-btn" onClick={() => setShowColModal(true)} title="Show/Hide Columns">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const taxAmt = (() => {
              const base = item.qty * item.price - (item.qty * item.price * item.discountPct / 100) - item.discountAmt;
              return base * item.taxRate / 100;
            })();
            return (
              <tr key={item.rowId} className="dc-items-row">
                <td className="dc-items-td dc-items-td--no">{idx + 1}</td>
                <td className="dc-items-td dc-items-td--name">
                  <input
                    className="dc-items-input dc-items-input--name"
                    value={item.name}
                    onChange={e => updateItem(item.rowId, "name", e.target.value)}
                  />
                  <input
                    className="dc-items-input dc-items-input--desc"
                    value={item.description || ""}
                    onChange={e => updateItem(item.rowId, "description", e.target.value)}
                    placeholder="Enter Description (optional)"
                  />
                </td>
                <td className="dc-items-td">
                  <input
                    className="dc-items-input dc-items-input--sm"
                    value={item.hsn || ""}
                    onChange={e => updateItem(item.rowId, "hsn", e.target.value)}
                  />
                </td>
                {columns.quantity && (
                  <td className="dc-items-td">
                    <div className="dc-items-qty-row">
                      <input
                        className="dc-items-input dc-items-input--num"
                        type="number" min={0}
                        value={item.qty}
                        onChange={e => updateItem(item.rowId, "qty", Number(e.target.value))}
                      />
                      {item.unit && <span className="dc-items-unit-badge">{item.unit}</span>}
                    </div>
                  </td>
                )}
                {columns.pricePerItem && (
                  <td className="dc-items-td">
                    <input
                      className="dc-items-input dc-items-input--num"
                      type="number" min={0}
                      value={item.price}
                      onChange={e => updateItem(item.rowId, "price", Number(e.target.value))}
                    />
                  </td>
                )}
                <td className="dc-items-td">
                  <div className="dc-items-disc-col">
                    <div className="dc-items-disc-row">
                      <span className="dc-items-disc-symbol">%</span>
                      <input className="dc-items-input dc-items-input--num" type="number" min={0} max={100}
                        value={item.discountPct} onChange={e => updateItem(item.rowId, "discountPct", Number(e.target.value))} />
                    </div>
                    <div className="dc-items-disc-row">
                      <span className="dc-items-disc-symbol">₹</span>
                      <input className="dc-items-input dc-items-input--num" type="number" min={0}
                        value={item.discountAmt} onChange={e => updateItem(item.rowId, "discountAmt", Number(e.target.value))} />
                    </div>
                  </div>
                </td>
                <td className="dc-items-td dc-items-td--tax">
                  <select className="dc-items-tax-sel" value={item.taxLabel}
                    onChange={e => updateItem(item.rowId, "taxLabel", e.target.value)}>
                    {TAX_OPTIONS.map(t => <option key={t.label} value={t.label}>{t.label}</option>)}
                  </select>
                  <div className="dc-items-tax-sub">(₹ {taxAmt.toFixed(0)})</div>
                </td>
                <td className="dc-items-td dc-items-td--amount">
                  <div className="dc-items-amount-cell">
                    <span className="dc-items-amount-rs">₹</span>
                    <span className="dc-items-amount-val">{item.amount.toFixed(0)}</span>
                  </div>
                </td>
                <td className="dc-items-td dc-items-td--del">
                  <button className="dc-items-del-btn" onClick={() => removeItem(item.rowId)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}

          {/* Add Item row */}
          <tr className="dc-items-add-row">
            <td colSpan={6 + (columns.quantity ? 1 : 0) + (columns.pricePerItem ? 1 : 0)} className="dc-items-add-cell">
              <button className="dc-add-item-btn" onClick={onAddItem}>+ Add Item</button>
            </td>
            <td className="dc-items-scan-cell">
              <button className="dc-scan-btn" onClick={onAddItem}>
                <svg width="22" height="18" viewBox="0 0 32 22" fill="none">
                  <rect x="1"  y="1" width="4"   height="20" rx="1"   fill="#374151"/>
                  <rect x="7"  y="1" width="2"   height="20" rx="0.5" fill="#374151"/>
                  <rect x="11" y="1" width="3"   height="20" rx="0.5" fill="#374151"/>
                  <rect x="16" y="1" width="1.5" height="20" rx="0.5" fill="#374151"/>
                  <rect x="19" y="1" width="3"   height="20" rx="0.5" fill="#374151"/>
                  <rect x="24" y="1" width="2"   height="20" rx="0.5" fill="#374151"/>
                </svg>
                Scan Barcode
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="dc-items-subtotal">
            <td />
            <td className="dc-items-td dc-items-td--subtotal-label">SUBTOTAL</td>
            <td />
            {columns.quantity    && <td className="dc-items-td dc-items-td--num">{subtotalQty}</td>}
            {columns.pricePerItem && <td />}
            <td className="dc-items-td dc-items-td--num">₹ {subtotalDiscount.toFixed(0)}</td>
            <td className="dc-items-td dc-items-td--num">₹ {subtotalTax.toFixed(0)}</td>
            <td className="dc-items-td dc-items-td--num">₹ {subtotalAmount.toFixed(0)}</td>
            <td />
          </tr>
        </tfoot>
      </table>

      {showColModal && (
        <ShowHideColumnsModal
          columns={columns}
          onClose={() => setShowColModal(false)}
          onSave={cols => setColumns(cols)}
        />
      )}
    </div>
  );
}