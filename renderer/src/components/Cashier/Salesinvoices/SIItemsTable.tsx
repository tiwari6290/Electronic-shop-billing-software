import { BillItem, TAX_OPTIONS, calcBillItemAmount, calcBillItemTax } from "./SalesInvoiceTypes";
import "./SIItemsTable.css";

interface Props {
  items: BillItem[];
  showColumns: { pricePerItem: boolean; quantity: boolean };
  onChange: (items: BillItem[]) => void;
  onAddItem: () => void;
}

export default function SIItemsTable({ items, showColumns, onChange, onAddItem }: Props) {

  /**
   * Update a single field on a row and recompute the line amount.
   *
   * GST Invoice Calculation Order (mandatory per GST Act):
   *   Step 1 — lineGross  = qty × price           (price is ALWAYS pre-tax base)
   *   Step 2 — discAmt    = lineGross × discPct%   OR flat ₹ discountAmt (not both)
   *   Step 3 — taxable    = lineGross − discAmt    ← GST computed ON THIS
   *   Step 4 — taxAmt     = taxable × taxRate%
   *   Step 5 — lineTotal  = taxable + taxAmt
   *
   * The invoice-level "Add Discount" (in SISummary) is SEPARATE — it only
   * reduces the final total AFTER all per-line taxes have been computed.
   * It does NOT affect per-line taxable or tax values.
   */
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

  // ── Subtotal footer values ─────────────────────────────────────────────────
  const totalDiscount = items.reduce((s, i) => {
    const lineGross = i.qty * i.price;
    const byPct     = lineGross * (i.discountPct / 100);
    const flat      = i.discountPct > 0 ? 0 : i.discountAmt;
    return s + byPct + flat;
  }, 0);

  const totalTax = items.reduce((s, i) => s + calcBillItemTax(i), 0);
  const totalAmt = items.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="si-items">
      <div className="si-items-scroll">
        <table className="si-items-table">
          <thead>
            <tr>
              <th className="si-th si-th--no">NO</th>
              <th className="si-th si-th--item">ITEMS / SERVICES</th>
              <th className="si-th">HSN / SAC</th>
              {showColumns.quantity     && <th className="si-th">QTY</th>}
              {showColumns.pricePerItem && <th className="si-th">PRICE/ITEM (₹)</th>}
              <th className="si-th">DISCOUNT</th>
              <th className="si-th">TAX</th>
              <th className="si-th si-th--amt">AMOUNT (₹)</th>
              <th className="si-th si-th--del" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              // Per-row display values (mirrors calcBillItemAmount logic)
              const lineGross  = item.qty * item.price;
              const discByPct  = lineGross * (item.discountPct / 100);
              const discFlat   = item.discountPct > 0 ? 0 : item.discountAmt;
              const taxableAmt = Math.max(0, lineGross - discByPct - discFlat);
              const taxAmt     = Math.round(taxableAmt * item.taxRate / 100 * 100) / 100;

              return (
                <tr key={item.rowId} className="si-items-row">

                  <td className="si-td si-td--no">{idx + 1}</td>

                  <td className="si-td si-td--item">
                    <div className="si-item-name">{item.name}</div>
                    <textarea
                      className="si-desc-input"
                      value={item.description}
                      onChange={e => update(item.rowId, { description: e.target.value })}
                      placeholder="Enter Description (optional)"
                    />
                  </td>

                  <td className="si-td">
                    <input
                      className="si-cell-input"
                      value={item.hsn}
                      onChange={e => update(item.rowId, { hsn: e.target.value })}
                    />
                  </td>

                  {showColumns.quantity && (
                    <td className="si-td">
                      <div className="si-qty-wrap">
                        <input
                          type="number"
                          className="si-qty-input"
                          value={item.qty}
                          min={1}
                          onChange={e => update(item.rowId, { qty: Math.max(1, Number(e.target.value)) })}
                        />
                        <span className="si-unit">{item.unit}</span>
                      </div>
                    </td>
                  )}

                  {/*
                   * Price per item — ALWAYS the PRE-TAX base price.
                   * Tax is computed on top of this value (after any per-line discount).
                   */}
                  {showColumns.pricePerItem && (
                    <td className="si-td">
                      <input
                        type="number"
                        className="si-price-input"
                        value={item.price}
                        min={0}
                        onChange={e => update(item.rowId, { price: Number(e.target.value) })}
                      />
                    </td>
                  )}

                  {/*
                   * Per-line discount — % and ₹ are bidirectionally linked.
                   *
                   * When user types %  → ₹ field auto-computes and shows as read-only.
                   * When user types ₹  → % field auto-computes and shows as read-only.
                   *
                   * Only one mode is "active" at a time:
                   *   discountPct > 0  → % is the active mode, ₹ is computed display
                   *   discountAmt > 0  → ₹ is the active mode, % is computed display
                   *
                   * Clearing the active field (setting it to 0) resets both fields.
                   */}
                  <td className="si-td">
                    <div className="si-disc-wrap">

                      {/*
                       * % input:
                       *   - Editable when discountPct is the active mode (discountAmt === 0)
                       *   - Read-only (computed) when discountAmt is the active mode
                       */}
                      <div className="si-disc-row">
                        <span className="si-disc-pct-label">%</span>
                        <input
                          type="number"
                          className="si-disc-input"
                          placeholder="0"
                          min={0}
                          max={100}
                          // When ₹ is active: show computed % equivalent
                          // When % is active: show the actual % value
                          value={
                            item.discountPct > 0
                              ? item.discountPct
                              : item.discountAmt > 0 && lineGross > 0
                                ? Math.round(item.discountAmt / lineGross * 100 * 100) / 100
                                : ""
                          }
                          // Read-only when ₹ is the active mode
                          readOnly={item.discountPct === 0 && item.discountAmt > 0}
                          style={
                            item.discountPct === 0 && item.discountAmt > 0
                              ? { background: "#f3f4f6", color: "#6b7280" }
                              : {}
                          }
                          onChange={e => {
                            const pct = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                            // Typing % activates % mode — clears any flat ₹ discount
                            update(item.rowId, { discountPct: pct, discountAmt: 0 });
                          }}
                        />
                      </div>

                      {/*
                       * ₹ input:
                       *   - Editable when discountAmt is the active mode (discountPct === 0)
                       *   - Read-only (computed) when discountPct is the active mode
                       */}
                      <div className="si-disc-row">
                        <span className="si-disc-rs-label">&#8377;</span>
                        <input
                          type="number"
                          className="si-disc-input"
                          placeholder="0"
                          min={0}
                          // When % is active: show computed ₹ equivalent (read-only)
                          // When ₹ is active: show the actual ₹ value
                          value={
                            item.discountPct > 0
                              ? Math.round(lineGross * item.discountPct / 100 * 100) / 100
                              : (item.discountAmt || "")
                          }
                          // Read-only when % is the active mode
                          readOnly={item.discountPct > 0}
                          style={
                            item.discountPct > 0
                              ? { background: "#f3f4f6", color: "#6b7280" }
                              : {}
                          }
                          onChange={e => {
                            const amt = Math.max(0, Number(e.target.value) || 0);
                            // Typing ₹ activates ₹ mode — clears any % discount
                            update(item.rowId, { discountAmt: amt, discountPct: 0 });
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/*
                   * Tax selector — user can change the tax rate per line.
                   * Tax is computed on the taxable amount (after per-line discount).
                   */}
                  <td className="si-td">
                    <select
                      className="si-tax-select"
                      value={item.taxLabel}
                      onChange={e => {
                        const opt = TAX_OPTIONS.find(t => t.label === e.target.value);
                        update(item.rowId, {
                          taxLabel: e.target.value,
                          taxRate:  opt?.rate ?? 0,
                        });
                      }}
                    >
                      {TAX_OPTIONS.map(t => <option key={t.label}>{t.label}</option>)}
                    </select>
                    <div
                      className="si-tax-amt"
                      title={`Taxable: ₹${taxableAmt.toFixed(2)} | Tax: ₹${taxAmt.toFixed(2)}`}
                    >
                      (₹ {taxAmt.toLocaleString("en-IN", { maximumFractionDigits: 2 })})
                    </div>
                  </td>

                  {/* Line total = taxable + tax */}
                  <td className="si-td si-td--amt">
                    <span className="si-rs">₹</span>
                    <span>{item.amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                  </td>

                  <td className="si-td si-td--del">
                    <button className="si-del-btn" onClick={() => remove(item.rowId)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Add Item row ── */}
      <div className="si-add-row">
        <button className="si-add-item-btn" onClick={onAddItem}>
          + Add Item
          <span className="si-shortcut-tip">
            <kbd>Shift</kbd><span>+</span><kbd>M</kbd>
          </span>
        </button>
        <button className="si-scan-btn" onClick={onAddItem}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 26, height: 26 }}>
            <rect x="2"  y="6" width="4" height="12"/>
            <rect x="7"  y="6" width="2" height="12"/>
            <rect x="10" y="6" width="3" height="12"/>
            <rect x="14" y="6" width="2" height="12"/>
            <rect x="17" y="6" width="4" height="12"/>
          </svg>
          Scan Barcode
        </button>
      </div>

      {/* ── Subtotal footer row ── */}
      <div className="si-subtotal-row">
        <span className="si-subtotal-label">SUBTOTAL</span>
        {showColumns.pricePerItem && <span />}
        <span className="si-subtotal-val si-subtotal-disc">
          {totalDiscount > 0
            ? `- ₹ ${totalDiscount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
            : "₹ 0"}
        </span>
        <span className="si-subtotal-val">
          ₹ {totalTax > 0
            ? totalTax.toLocaleString("en-IN", { maximumFractionDigits: 2 })
            : "0"}
        </span>
        <span className="si-subtotal-val">
          ₹ {totalAmt.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}