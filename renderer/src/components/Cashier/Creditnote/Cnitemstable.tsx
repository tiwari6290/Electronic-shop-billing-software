import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InvoiceItem, calcItemAmount, TAX_OPTIONS } from "./Creditnotetypes";
import "./Createcreditnote.css";

// ─── Show/Hide Columns Modal ──────────────────────────────────────────────────
interface ColumnConfig { pricePerItem: boolean; quantity: boolean; }

function ShowHideColumnsModal({ columns, onClose, onSave }: {
  columns: ColumnConfig;
  onClose: () => void;
  onSave: (c: ColumnConfig) => void;
}) {
  const navigate = useNavigate();
  const [local, setLocal] = useState<ColumnConfig>({ ...columns });

  function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
    return (
      <button className={`cn-toggle${on ? " cn-toggle--on" : ""}`} onClick={() => set(!on)}>
        <span className="cn-toggle-knob" />
      </button>
    );
  }

  return (
    <div className="cn-overlay" onClick={onClose}>
      <div className="cn-col-modal" onClick={e => e.stopPropagation()}>
        <div className="cn-col-modal-hdr">
          <span className="cn-col-modal-title">Show/Hide Columns in Invoice</span>
          <button className="cn-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="cn-col-modal-body">
          <div className="cn-col-toggle-row">
            <span>Price/Item (₹)</span>
            <Toggle on={local.pricePerItem} set={v => setLocal(p => ({ ...p, pricePerItem: v }))} />
          </div>
          <div className="cn-col-toggle-row">
            <span>Quantity</span>
            <Toggle on={local.quantity} set={v => setLocal(p => ({ ...p, quantity: v }))} />
          </div>
          <div className="cn-col-custom-hdr">CUSTOM COLUMN</div>
          <div className="cn-col-empty-area">
            <p className="cn-col-empty-title">No Custom Columns added</p>
            <p className="cn-col-empty-sub">Any custom column such as Batch # &amp; Expiry Date can be added</p>
          </div>
          <div className="cn-col-notice">
            To add Custom Item Columns - Go to <strong>Item settings</strong> from{" "}
            <span
              className="cn-col-notice-link"
              onClick={() => { onClose(); navigate("/cashier/items"); }}
            >
              Items page (click here)
            </span>
          </div>
        </div>
        <div className="cn-col-modal-footer">
          <button className="cn-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="cn-btn-primary" onClick={() => { onSave(local); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Item Row ─────────────────────────────────────────────────────────────────
function ItemRow({ item, idx, columns, onChange, onRemove }: {
  item: InvoiceItem;
  idx: number;
  columns: ColumnConfig;
  onChange: (rowId: string, field: string, value: any) => void;
  onRemove: (rowId: string) => void;
}) {
  const [editingAmount, setEditingAmount] = useState(false);

  const raw = item.qty * item.price;

  // % → auto ₹
  const handleDiscPct = (pct: number) => {
    const amt = parseFloat((raw * pct / 100).toFixed(2));
    const updated = { ...item, discountPct: pct, discountAmt: amt };
    updated.amount = calcItemAmount(updated);
    onChange(item.rowId, "__batch__", updated);
  };

  // ₹ → auto %
  const handleDiscAmt = (amt: number) => {
    const pct = raw > 0 ? parseFloat(((amt / raw) * 100).toFixed(2)) : 0;
    const updated = { ...item, discountAmt: amt, discountPct: pct };
    updated.amount = calcItemAmount(updated);
    onChange(item.rowId, "__batch__", updated);
  };

  const taxAmt = (() => {
    const base = item.qty * item.price - (item.qty * item.price * item.discountPct / 100) - item.discountAmt;
    return base * item.taxRate / 100;
  })();

  return (
    <tr className="cn-items-row">
      <td className="cn-items-td cn-items-td--no">{idx + 1}</td>

      {/* Name + Description */}
      <td className="cn-items-td cn-items-td--name">
        <input
          className="cn-items-input cn-items-input--name cn-editable"
          value={item.name}
          onChange={e => onChange(item.rowId, "name", e.target.value)}
        />
        <input
          className="cn-items-input cn-items-input--desc"
          value={item.description || ""}
          onChange={e => onChange(item.rowId, "description", e.target.value)}
          placeholder="Enter Description (optional)"
        />
      </td>

      {/* HSN */}
      <td className="cn-items-td">
        <input
          className="cn-items-input cn-items-input--sm cn-editable"
          value={item.hsn || ""}
          placeholder="—"
          onChange={e => onChange(item.rowId, "hsn", e.target.value)}
        />
      </td>

      {/* QTY */}
      {columns.quantity && (
        <td className="cn-items-td">
          <div className="cn-items-qty-row">
            <input
              className="cn-items-input cn-items-input--num cn-editable"
              type="number" min={0}
              value={item.qty}
              onChange={e => {
                const qty = Number(e.target.value);
                const updated = { ...item, qty };
                // recalc discount ₹ from existing %
                if (item.discountPct > 0) {
                  updated.discountAmt = parseFloat(((qty * item.price) * item.discountPct / 100).toFixed(2));
                }
                updated.amount = calcItemAmount(updated);
                onChange(item.rowId, "__batch__", updated);
              }}
            />
            {item.unit && <span className="cn-items-unit-badge">{item.unit}</span>}
          </div>
        </td>
      )}

      {/* PRICE/ITEM */}
      {columns.pricePerItem && (
        <td className="cn-items-td">
          <input
            className="cn-items-input cn-items-input--num cn-editable"
            type="number" min={0}
            value={item.price}
            onChange={e => {
              const price = Number(e.target.value);
              const updated = { ...item, price };
              // recalc discount ₹ from existing %
              if (item.discountPct > 0) {
                updated.discountAmt = parseFloat(((item.qty * price) * item.discountPct / 100).toFixed(2));
              }
              updated.amount = calcItemAmount(updated);
              onChange(item.rowId, "__batch__", updated);
            }}
          />
        </td>
      )}

      {/* DISCOUNT */}
      <td className="cn-items-td">
        <div className="cn-items-disc-col">
          <div className="cn-items-disc-row">
            <span className="cn-items-disc-symbol">%</span>
            <input
              className="cn-items-input cn-items-input--num cn-editable"
              type="number" min={0} max={100}
              value={item.discountPct}
              onChange={e => handleDiscPct(Number(e.target.value))}
            />
          </div>
          <div className="cn-items-disc-row">
            <span className="cn-items-disc-symbol">₹</span>
            <input
              className="cn-items-input cn-items-input--num cn-editable"
              type="number" min={0}
              value={item.discountAmt}
              onChange={e => handleDiscAmt(Number(e.target.value))}
            />
          </div>
        </div>
      </td>

      {/* TAX */}
      <td className="cn-items-td cn-items-td--tax">
        <select
          className="cn-items-tax-sel"
          value={item.taxLabel}
          onChange={e => onChange(item.rowId, "taxLabel", e.target.value)}
        >
          {TAX_OPTIONS.map(t => <option key={t.label} value={t.label}>{t.label}</option>)}
        </select>
        <div className="cn-items-tax-sub">(₹ {taxAmt.toFixed(0)})</div>
      </td>

      {/* AMOUNT — clickable to edit */}
      <td
        className="cn-items-td cn-items-td--amount cn-amount-cell-td"
        onClick={() => !editingAmount && setEditingAmount(true)}
      >
        {editingAmount ? (
          <div className="cn-items-amount-cell">
            <span className="cn-items-amount-rs">₹</span>
            <input
              className="cn-items-input cn-items-input--num cn-amount-edit"
              type="number"
              autoFocus
              value={item.amount}
              onChange={e => onChange(item.rowId, "amount", Number(e.target.value))}
              onBlur={() => setEditingAmount(false)}
              onClick={e => e.stopPropagation()}
            />
          </div>
        ) : (
          <div className="cn-items-amount-cell cn-items-amount-cell--hover">
            <span className="cn-items-amount-rs">₹</span>
            <span className="cn-items-amount-val">{item.amount.toFixed(0)}</span>
          </div>
        )}
      </td>

      <td className="cn-items-td cn-items-td--del">
        <button className="cn-items-del-btn" onClick={() => onRemove(item.rowId)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </td>
    </tr>
  );
}

// ─── Items Table ──────────────────────────────────────────────────────────────
interface ItemsTableProps {
  items: InvoiceItem[];
  onChange: (items: InvoiceItem[]) => void;
  onAddItem: () => void;
}

export default function CNItemsTable({ items, onChange, onAddItem }: ItemsTableProps) {
  const [showColModal, setShowColModal] = useState(false);
  const [columns, setColumns] = useState<ColumnConfig>({ pricePerItem: true, quantity: true });

  const updateItem = (rowId: string, field: string, value: any) => {
    onChange(items.map(item => {
      if (item.rowId !== rowId) return item;
      // batch update (pre-computed object)
      if (field === "__batch__") return value as InvoiceItem;
      const updated = { ...item, [field]: value };
      if (field === "taxLabel") {
        const opt = TAX_OPTIONS.find(t => t.label === value);
        updated.taxRate = opt ? opt.rate : 0;
      }
      // only recalc if not directly editing amount
      if (field !== "amount") {
        updated.amount = calcItemAmount(updated);
      }
      return updated;
    }));
  };

  const removeItem = (rowId: string) => onChange(items.filter(i => i.rowId !== rowId));

  const subtotalQty      = items.reduce((s, i) => s + i.qty, 0);
  const subtotalDiscount = items.reduce((s, i) => s + (i.discountAmt + i.qty * i.price * i.discountPct / 100), 0);
  const subtotalTax      = items.reduce((s, i) => {
    const base = i.qty * i.price - (i.qty * i.price * i.discountPct / 100) - i.discountAmt;
    return s + base * i.taxRate / 100;
  }, 0);
  const subtotalAmount = items.reduce((s, i) => s + i.amount, 0);

  const extraCols = (columns.quantity ? 1 : 0) + (columns.pricePerItem ? 1 : 0);
  const totalCols = 6 + extraCols;

  return (
    <div className="cn-items-section">
      <table className="cn-items-table">
        <thead>
          <tr>
            <th className="cn-items-th cn-items-th--no">NO</th>
            <th className="cn-items-th cn-items-th--name">ITEMS / SERVICES</th>
            <th className="cn-items-th">HSN / SAC</th>
            {columns.quantity    && <th className="cn-items-th">QTY</th>}
            {columns.pricePerItem && <th className="cn-items-th">PRICE/ITEM (₹)</th>}
            <th className="cn-items-th">DISCOUNT</th>
            <th className="cn-items-th">TAX</th>
            <th className="cn-items-th">AMOUNT (₹)</th>
            <th className="cn-items-th cn-items-th--add">
              <button className="cn-add-col-btn" onClick={() => setShowColModal(true)} title="Show/Hide Columns">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <ItemRow
              key={item.rowId}
              item={item}
              idx={idx}
              columns={columns}
              onChange={updateItem}
              onRemove={removeItem}
            />
          ))}

          {/* Add Item row */}
          <tr className="cn-items-add-row">
            <td colSpan={totalCols} className="cn-items-add-cell">
              <div className="cn-add-item-dashed-wrap">
                <button className="cn-add-item-btn" onClick={onAddItem}>+ Add Item</button>
              </div>
            </td>
            <td className="cn-items-scan-cell">
              <button className="cn-scan-btn" onClick={onAddItem}>
                <svg width="28" height="24" viewBox="0 0 32 24" fill="none">
                  <rect x="1"  y="1" width="4"   height="22" rx="1.5" fill="#374151"/>
                  <rect x="7"  y="1" width="2"   height="22" rx="0.5" fill="#374151"/>
                  <rect x="11" y="1" width="3"   height="22" rx="0.5" fill="#374151"/>
                  <rect x="16" y="1" width="1.5" height="22" rx="0.5" fill="#374151"/>
                  <rect x="19" y="1" width="3"   height="22" rx="0.5" fill="#374151"/>
                  <rect x="24" y="1" width="2"   height="22" rx="0.5" fill="#374151"/>
                </svg>
                Scan Barcode
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="cn-items-subtotal">
            <td />
            <td />
            <td className="cn-items-td cn-items-td--subtotal-label">SUBTOTAL</td>
            {columns.quantity    && <td className="cn-items-td cn-items-td--num">{subtotalQty}</td>}
            {columns.pricePerItem && <td />}
            <td className="cn-items-td cn-items-td--num">₹ {subtotalDiscount.toFixed(0)}</td>
            <td className="cn-items-td cn-items-td--num">₹ {subtotalTax.toFixed(0)}</td>
            <td className="cn-items-td cn-items-td--num">₹ {subtotalAmount.toFixed(0)}</td>
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