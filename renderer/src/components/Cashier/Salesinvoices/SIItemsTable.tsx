import { useState } from "react";
import { BillItem, TAX_OPTIONS, calcBillItemAmount } from "./SalesInvoiceTypes";
import "./SIItemsTable.css";

interface Props {
  items: BillItem[];
  showColumns: { pricePerItem: boolean; quantity: boolean };
  onChange: (items: BillItem[]) => void;
  onAddItem: () => void;
}

export default function SIItemsTable({ items, showColumns, onChange, onAddItem }: Props) {
  function update(rowId: string, field: Partial<BillItem>) {
    const updated = items.map(i => {
      if (i.rowId !== rowId) return i;
      const next = { ...i, ...field };
      next.amount = calcBillItemAmount(next);
      return next;
    });
    onChange(updated);
  }

  function remove(rowId: string) {
    onChange(items.filter(i => i.rowId !== rowId));
  }

  const totalDiscount = items.reduce((s, i) => s + (i.qty * i.price * i.discountPct / 100) + i.discountAmt, 0);
  const totalTax = items.reduce((s, i) => {
    const base = i.qty * i.price - (i.qty * i.price * i.discountPct / 100) - i.discountAmt;
    return s + base * i.taxRate / 100;
  }, 0);
  const totalAmt = items.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="si-items">
      <div className="si-items-scroll">
        <table className="si-items-table">
          <thead>
            <tr>
              <th className="si-th si-th--no">NO</th>
              <th className="si-th si-th--item">ITEMS/ SERVICES</th>
              <th className="si-th">HSN/ SAC</th>
              {showColumns.quantity && <th className="si-th">QTY</th>}
              {showColumns.pricePerItem && <th className="si-th">PRICE/ITEM (₹)</th>}
              <th className="si-th">DISCOUNT</th>
              <th className="si-th">TAX</th>
              <th className="si-th si-th--amt">AMOUNT (₹)</th>
              <th className="si-th si-th--del"/>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.rowId} className="si-items-row">
                <td className="si-td si-td--no">{idx + 1}</td>
                <td className="si-td si-td--item">
                  <div className="si-item-name">{item.name}</div>
                  <input
                    className="si-desc-input"
                    value={item.description}
                    onChange={e => update(item.rowId, { description: e.target.value })}
                    placeholder="Enter Description (optional)"
                  />
                </td>
                <td className="si-td">
                  <input className="si-cell-input" value={item.hsn} onChange={e => update(item.rowId, { hsn: e.target.value })}/>
                </td>
                {showColumns.quantity && (
                  <td className="si-td">
                    <div className="si-qty-wrap">
                      <input type="number" className="si-qty-input" value={item.qty}
                        onChange={e => update(item.rowId, { qty: Number(e.target.value) })}/>
                      <span className="si-unit">{item.unit}</span>
                    </div>
                  </td>
                )}
                {showColumns.pricePerItem && (
                  <td className="si-td">
                    <input type="number" className="si-price-input" value={item.price}
                      onChange={e => update(item.rowId, { price: Number(e.target.value) })}/>
                  </td>
                )}
                <td className="si-td">
                  <div className="si-disc-wrap">
                    <div className="si-disc-row">
                      <span className="si-disc-pct-label">%</span>
                      <input type="number" className="si-disc-input" value={item.discountPct}
                        onChange={e => update(item.rowId, { discountPct: Number(e.target.value) })}/>
                    </div>
                    <div className="si-disc-row">
                      <span className="si-disc-rs-label">₹</span>
                      <input type="number" className="si-disc-input" value={item.discountAmt}
                        onChange={e => update(item.rowId, { discountAmt: Number(e.target.value) })}/>
                    </div>
                  </div>
                </td>
                <td className="si-td">
                  <select className="si-tax-select" value={item.taxLabel}
                    onChange={e => {
                      const opt = TAX_OPTIONS.find(t => t.label === e.target.value);
                      update(item.rowId, { taxLabel: e.target.value, taxRate: opt?.rate ?? 0 });
                    }}>
                    {TAX_OPTIONS.map(t => <option key={t.label}>{t.label}</option>)}
                  </select>
                  <div className="si-tax-amt">(₹ {Math.round(item.qty * item.price * item.taxRate / 100)})</div>
                </td>
                <td className="si-td si-td--amt">
                  <span className="si-rs">₹</span>
                  <span>{item.amount.toLocaleString("en-IN", { maximumFractionDigits: 1 })}</span>
                </td>
                <td className="si-td si-td--del">
                  <button className="si-del-btn" onClick={() => remove(item.rowId)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Item row */}
      <div className="si-add-row">
        <button className="si-add-item-btn" onClick={onAddItem}>
          + Add Item
          <span className="si-shortcut-tip"><kbd>Shift</kbd><span>+</span><kbd>M</kbd></span>
        </button>
        <button className="si-scan-btn" onClick={onAddItem}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:26,height:26}}>
            <rect x="2" y="6" width="4" height="12"/><rect x="7" y="6" width="2" height="12"/>
            <rect x="10" y="6" width="3" height="12"/><rect x="14" y="6" width="2" height="12"/>
            <rect x="17" y="6" width="4" height="12"/>
          </svg>
          Scan Barcode
        </button>
      </div>

      {/* Subtotal row */}
      <div className="si-subtotal-row">
        <span className="si-subtotal-label">SUBTOTAL</span>
        {showColumns.pricePerItem && <span/>}
        <span className="si-subtotal-val">₹ {totalDiscount > 0 ? totalDiscount.toLocaleString("en-IN", {maximumFractionDigits:1}) : 0}</span>
        <span className="si-subtotal-val">₹ {totalTax > 0 ? totalTax.toLocaleString("en-IN", {maximumFractionDigits:1}) : 0}</span>
        <span className="si-subtotal-val">₹ {totalAmt.toLocaleString("en-IN", {maximumFractionDigits:1})}</span>
      </div>
    </div>
  );
}
