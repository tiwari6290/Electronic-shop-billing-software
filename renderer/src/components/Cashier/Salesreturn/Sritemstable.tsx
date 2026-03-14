import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InvoiceItem, calcItemAmount, TAX_OPTIONS } from "./Salesreturntypes";
import "./Createsalesreturn.css";

// ─── Show/Hide Columns Modal ──────────────────────────────────────────────────
interface ColumnConfig { pricePerItem: boolean; quantity: boolean; }

function ShowHideColumnsModal({ columns, onClose, onSave }: {
  columns: ColumnConfig; onClose: () => void; onSave: (c: ColumnConfig) => void;
}) {
  const navigate = useNavigate();
  const [local, setLocal] = useState<ColumnConfig>({ ...columns });
  return (
    <div className="csr-overlay" onClick={onClose}>
      <div className="csr-col-modal" onClick={e => e.stopPropagation()}>
        <div className="csr-col-modal-hdr">
          <span className="csr-col-modal-title">Show/Hide Columns in Invoice</span>
          <button className="csr-col-modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="csr-col-modal-body">
          <div className="csr-col-toggle-row">
            <span className="csr-col-toggle-label">Price/Item (₹)</span>
            <button className={`csr-toggle${local.pricePerItem ? " csr-toggle--on" : ""}`}
              onClick={() => setLocal(p => ({ ...p, pricePerItem: !p.pricePerItem }))}>
              <span className="csr-toggle-knob" />
            </button>
          </div>
          <div className="csr-col-toggle-row">
            <span className="csr-col-toggle-label">Quantity</span>
            <button className={`csr-toggle${local.quantity ? " csr-toggle--on" : ""}`}
              onClick={() => setLocal(p => ({ ...p, quantity: !p.quantity }))}>
              <span className="csr-toggle-knob" />
            </button>
          </div>
          <div className="csr-col-custom-hdr">CUSTOM COLUMN</div>
          <div className="csr-col-empty-area">
            <p className="csr-col-empty-title">No Custom Columns added</p>
            <p className="csr-col-empty-sub">Any custom column such as Batch # &amp; Expiry Date can be added</p>
          </div>
          <div className="csr-col-notice">
            To add Custom Item Columns — Go to <strong>Item settings</strong> from{" "}
            <span className="csr-col-notice-link" onClick={() => { onClose(); navigate("/cashier/create-item/inventory"); }}>
              Items page (click here)
            </span>
          </div>
        </div>
        <div className="csr-col-modal-footer">
          <button className="csr-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="csr-btn-primary" onClick={() => { onSave(local); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Item Row ─────────────────────────────────────────────────────────────────
function ItemRow({ item, idx, columns, onChange, onRemove }: {
  item: InvoiceItem; idx: number; columns: ColumnConfig;
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
    <tr className="csr-items-row">
      <td className="csr-items-td csr-items-td--no">{idx + 1}</td>

      <td className="csr-items-td csr-items-td--name">
        <input className="csr-items-input csr-items-input--name"
          value={item.name} onChange={e => onChange(item.rowId, "name", e.target.value)} />
        <input className="csr-items-input csr-items-input--desc"
          value={item.description || ""}
          onChange={e => onChange(item.rowId, "description", e.target.value)}
          placeholder="Description (optional)" />
      </td>

      <td className="csr-items-td">
        <input className="csr-items-input csr-items-input--sm"
          value={item.hsn || ""} placeholder="—"
          onChange={e => onChange(item.rowId, "hsn", e.target.value)} />
      </td>

      {columns.quantity && (
        <td className="csr-items-td">
          <div className="csr-items-qty-row">
            <input className="csr-items-input csr-items-input--num" type="number" min={0}
              value={item.qty}
              onChange={e => {
                const qty = Number(e.target.value);
                const updated = { ...item, qty };
                if (item.discountPct > 0) updated.discountAmt = parseFloat(((qty * item.price) * item.discountPct / 100).toFixed(2));
                updated.amount = calcItemAmount(updated);
                onChange(item.rowId, "__batch__", updated);
              }} />
            {item.unit && <span className="csr-items-unit-badge">{item.unit}</span>}
          </div>
        </td>
      )}

      {columns.pricePerItem && (
        <td className="csr-items-td">
          <input className="csr-items-input csr-items-input--num" type="number" min={0}
            value={item.price}
            onChange={e => {
              const price = Number(e.target.value);
              const updated = { ...item, price };
              if (item.discountPct > 0) updated.discountAmt = parseFloat(((item.qty * price) * item.discountPct / 100).toFixed(2));
              updated.amount = calcItemAmount(updated);
              onChange(item.rowId, "__batch__", updated);
            }} />
        </td>
      )}

      <td className="csr-items-td">
        <div className="csr-items-disc-col">
          <div className="csr-items-disc-row">
            <span className="csr-items-disc-symbol">%</span>
            <input className="csr-items-input csr-items-input--num" type="number" min={0} max={100}
              value={item.discountPct} onChange={e => handleDiscPct(Number(e.target.value))} />
          </div>
          <div className="csr-items-disc-row">
            <span className="csr-items-disc-symbol">₹</span>
            <input className="csr-items-input csr-items-input--num" type="number" min={0}
              value={item.discountAmt} onChange={e => handleDiscAmt(Number(e.target.value))} />
          </div>
        </div>
      </td>

      <td className="csr-items-td csr-items-td--tax">
        <select className="csr-items-tax-sel" value={item.taxLabel}
          onChange={e => onChange(item.rowId, "taxLabel", e.target.value)}>
          {TAX_OPTIONS.map(t => <option key={t.label} value={t.label}>{t.label}</option>)}
        </select>
        <div className="csr-items-tax-sub">(₹ {taxAmt.toFixed(0)})</div>
      </td>

      {/* AMOUNT — clickable to edit */}
      <td className="csr-items-td csr-items-td--amount csr-amount-cell-td"
        onClick={() => !editingAmount && setEditingAmount(true)}>
        {editingAmount ? (
          <div className="csr-items-amount-cell">
            <span className="csr-items-amount-rs">₹</span>
            <input className="csr-items-input csr-items-input--num csr-amount-edit"
              type="number" autoFocus value={item.amount}
              onChange={e => onChange(item.rowId, "amount", Number(e.target.value))}
              onBlur={() => setEditingAmount(false)}
              onClick={e => e.stopPropagation()} />
          </div>
        ) : (
          <div className="csr-items-amount-cell csr-items-amount-cell--hover">
            <span className="csr-items-amount-rs">₹</span>
            <span className="csr-items-amount-val">{item.amount.toFixed(0)}</span>
          </div>
        )}
      </td>

      <td className="csr-items-td csr-items-td--del">
        <button className="csr-items-del-btn" onClick={() => onRemove(item.rowId)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  items: InvoiceItem[]; onChange: (items: InvoiceItem[]) => void; onAddItem: () => void;
}

export default function SRItemsTable({ items, onChange, onAddItem }: ItemsTableProps) {
  const [showColModal, setShowColModal] = useState(false);
  const [columns, setColumns] = useState<ColumnConfig>({ pricePerItem: true, quantity: true });

  const updateItem = (rowId: string, field: string, value: any) => {
    onChange(items.map(item => {
      if (item.rowId !== rowId) return item;
      if (field === "__batch__") return value as InvoiceItem;
      const updated = { ...item, [field]: value };
      if (field === "taxLabel") {
        const opt = TAX_OPTIONS.find(t => t.label === value);
        updated.taxRate = opt ? opt.rate : 0;
      }
      if (field !== "amount") updated.amount = calcItemAmount(updated);
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
  const colCount = 4 + (columns.quantity ? 1 : 0) + (columns.pricePerItem ? 1 : 0);

  return (
    <div className="csr-items-section">
      <table className="csr-items-table">
        <thead>
          <tr>
            <th className="csr-items-th csr-items-th--no">NO</th>
            <th className="csr-items-th csr-items-th--name">ITEMS / SERVICES</th>
            <th className="csr-items-th">HSN / SAC</th>
            {columns.quantity    && <th className="csr-items-th">QTY</th>}
            {columns.pricePerItem && <th className="csr-items-th">PRICE/ITEM (₹)</th>}
            <th className="csr-items-th">DISCOUNT</th>
            <th className="csr-items-th">TAX</th>
            <th className="csr-items-th">AMOUNT (₹)</th>
            <th className="csr-items-th csr-items-th--add">
              <button className="csr-add-col-btn" onClick={() => setShowColModal(true)} title="Show/Hide Columns">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <ItemRow key={item.rowId} item={item} idx={idx} columns={columns}
              onChange={updateItem} onRemove={removeItem} />
          ))}
          <tr className="csr-items-add-row">
            <td colSpan={colCount + 1} className="csr-items-add-cell">
              <div className="csr-add-item-dashed-wrap">
                <button className="csr-add-item-btn" onClick={onAddItem}>+ Add Item</button>
              </div>
            </td>
            <td className="csr-items-scan-cell">
              <button className="csr-scan-btn" onClick={onAddItem}>
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
          <tr className="csr-items-subtotal">
            <td className="csr-items-td" />
            <td className="csr-items-td" />
            <td className="csr-items-td csr-items-td--subtotal-label">SUBTOTAL</td>
            {columns.quantity     && <td className="csr-items-td csr-items-td--num">{subtotalQty}</td>}
            {columns.pricePerItem && <td className="csr-items-td" />}
            <td className="csr-items-td csr-items-td--num">₹ {subtotalDiscount.toFixed(0)}</td>
            <td className="csr-items-td csr-items-td--num">₹ {subtotalTax.toFixed(0)}</td>
            <td className="csr-items-td csr-items-td--num">₹ {subtotalAmount.toFixed(0)}</td>
            <td className="csr-items-td" />
          </tr>
        </tfoot>
      </table>
      {showColModal && (
        <ShowHideColumnsModal columns={columns} onClose={() => setShowColModal(false)} onSave={cols => setColumns(cols)} />
      )}
    </div>
  );
}

