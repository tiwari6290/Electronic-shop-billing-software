import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BillItem, parseGstRate, buildTaxLabel, calcBillItemAmount } from "./SalesInvoiceTypes";
import { getItems, BackendItem } from "@/api/salesInvoiceApi";
import "./SIAddItemsModal.css";

interface Props {
  onClose: () => void;
  onAddToBill: (items: BillItem[]) => void;
}

export default function SIAddItemsModal({ onClose, onAddToBill }: Props) {
  const navigate = useNavigate();
  const [items,    setItems]    = useState<BackendItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<Map<number, number>>(new Map());
  const searchRef = useRef<HTMLInputElement>(null);

  // ── Load items from backend on mount ───────────────────────────────────────
  useEffect(() => {
    let active = true;
    setLoading(true);
    getItems()
      .then((data) => { if (active) setItems(data); })
      .catch(console.error)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    searchRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "F7")    handleAdd();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    return (
      i.name.toLowerCase().includes(q) ||
      (i.itemCode  ?? "").toLowerCase().includes(q) ||
      (i.hsnCode   ?? "").includes(search) ||
      (i.category  ?? "").toLowerCase().includes(q)
    );
  }).filter(i => !category || i.category === category);

  function setQty(id: number, qty: number) {
    if (qty <= 0) {
      const m = new Map(selected);
      m.delete(id);
      setSelected(m);
      return;
    }
    setSelected(new Map(selected).set(id, qty));
  }

  /**
   * ════════════════════════════════════════════════════════════════
   * CORE FIX — "Add to Bill" builds BillItem with correct values:
   *
   * 1. price       → item.baseSalesPrice  (the PRE-TAX base, always)
   *                  Falls back to item.salesPrice only if baseSalesPrice
   *                  is not available (legacy items).
   *
   * 2. discountPct → item.salesDiscountPercent  (default % set on item)
   *                  The user can still change this in SIItemsTable.
   *
   * 3. taxRate     → parsed from item.gstRate  (e.g. "18" → 18)
   *                  Tax is always computed AFTER applying the discount:
   *                    taxable = (qty × price) − discount
   *                    tax     = taxable × taxRate%
   *                    amount  = taxable + tax
   *
   * Example from your requirement:
   *   Item: base price ₹84.75, 5% default discount, 18% GST
   *   lineGross  = 1 × 84.75 = 84.75
   *   discAmt    = 84.75 × 5% = 4.24
   *   taxable    = 84.75 − 4.24 = 80.51
   *   taxAmt     = 80.51 × 18% = 14.49
   *   amount     = 80.51 + 14.49 = 95.00  ✓
   * ════════════════════════════════════════════════════════════════
   */
  function handleAdd() {
    if (selected.size === 0) return;

    const billItems: BillItem[] = [];

    selected.forEach((qty, itemId) => {
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      // ── 1. Base price — ALWAYS pre-tax ─────────────────────────────────────
      // baseSalesPrice is the correct field (set by backend when item was created
      // with a tax rate). Fall back to salesPrice for legacy items.
      const rawBase = item.baseSalesPrice != null && Number(item.baseSalesPrice) > 0
        ? item.baseSalesPrice
        : item.salesPrice ?? 0;
      const price = Number(rawBase);

      // ── priceMode ───────────────────────────────────────────────────────────
      // "auto"   → item has a known base price → normal price-drives-amount flow.
      // "manual" → no price available → user will enter amount; price is back-calculated.
      const priceMode: "auto" | "manual" = price > 0 ? "auto" : "manual";

      // ── 2. Default discount % from item master ──────────────────────────────
      // This pre-fills the discount column in the invoice table.
      // The user can still change it per-line in SIItemsTable.
      const discountPct = Number(item.salesDiscountPercent ?? 0);

      // ── 3. GST rate ─────────────────────────────────────────────────────────
      // gstRate comes as a string from backend: "18", "5", "Exempted", etc.
      const taxRate  = parseGstRate(item.gstRate);
      const taxLabel = buildTaxLabel(taxRate);

      // ── 4. Build the BillItem and calculate amount using shared formula ─────
      const billItem: BillItem = {
        rowId:       `row-${Date.now()}-${itemId}`,
        itemId,
        name:        item.name,
        description: item.description?.trim() || "",
        hsn:         item.hsnCode ?? "",
        qty,
        unit:        item.unit ?? "PCS",
        price,
        discountPct,
        discountAmt: 0,          // flat ₹ discount — always 0 at add time (% takes priority)
        taxLabel,
        taxRate,
        amount:      0,          // will be recalculated below using shared formula
        priceMode,               // "auto" when price > 0, "manual" when no price known
      };

      // Calculate amount using the shared utility so the formula is identical
      // everywhere (SIItemsTable, SISummary, here).
      billItem.amount = calcBillItemAmount(billItem);

      billItems.push(billItem);
    });

    onAddToBill(billItems);
    onClose();
  }

  const categories    = [...new Set(items.map(i => i.category).filter(Boolean))] as string[];
  const totalSelected = Array.from(selected.values()).reduce((s, v) => s + v, 0);

  /**
   * Show live (currentStock) not opening stock.
   * Falls back to openingStock for legacy items that don't have currentStock yet.
   */
  function getStock(item: BackendItem): string {
    if (!item.ProductStock || item.ProductStock.length === 0) return "–";
    const total = item.ProductStock.reduce(
      (s, ps) => s + (ps.currentStock ?? ps.openingStock),
      0
    );
    return String(total);
  }

  /**
   * Display the base price in the modal table.
   * Shows baseSalesPrice when available (with a "(base)" label for clarity),
   * otherwise shows salesPrice.
   */
  function displayPrice(item: BackendItem): string {
    const base = Number(
      item.baseSalesPrice != null && Number(item.baseSalesPrice) > 0
        ? item.baseSalesPrice
        : item.salesPrice ?? 0
    );
    return `₹${base.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  }

  return (
    <div className="si-aim-overlay" onClick={onClose}>
      <div className="si-aim-modal" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="si-aim-hdr">
          <span>Add Items to Bill</span>
          <button onClick={onClose}>✕</button>
        </div>

        {/* ── Toolbar ── */}
        <div className="si-aim-toolbar">
          <div className="si-aim-search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              ref={searchRef}
              className="si-aim-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Item / Serial no. / HSN code / SKU / Custom Field / Category"
            />
            <button className="si-aim-barcode" title="Scan barcode">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 20, height: 20 }}>
                <rect x="2"    y="6" width="3"   height="12"/>
                <rect x="6"    y="6" width="1.5" height="12"/>
                <rect x="8.5"  y="6" width="2.5" height="12"/>
                <rect x="12"   y="6" width="1.5" height="12"/>
                <rect x="14.5" y="6" width="3"   height="12"/>
              </svg>
            </button>
          </div>

          <select
            className="si-aim-cat"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>

          <button
            className="si-aim-create"
            onClick={() => { onClose(); navigate("/cashier/create-item"); }}
          >
            Create New Item
          </button>
        </div>

        {/* ── Table ── */}
        <div className="si-aim-table-wrap">
          <table className="si-aim-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Item Code</th>
                <th>Stock</th>
                {/* FIX: renamed "Sales Price" → "Base Price" for clarity */}
                <th>Base Price</th>
                <th>GST Rate</th>
                <th>Default Disc%</th>
                <th>Purchase Price</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="si-aim-empty">Loading items…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="si-aim-empty">
                    {search ? "No items found" : "No items available. Create items first."}
                  </td>
                </tr>
              ) : filtered.map(item => {
                const qty      = selected.get(item.id) || 0;
                const taxRate  = parseGstRate(item.gstRate);
                const discPct  = Number(item.salesDiscountPercent ?? 0);

                return (
                  <tr
                    key={item.id}
                    className={`si-aim-row${selected.has(item.id) ? " si-aim-row--sel" : ""}`}
                  >
                    <td className="si-aim-name">{item.name}</td>
                    <td className="si-aim-code">{item.itemCode || "–"}</td>
                    <td className="si-aim-stock">{getStock(item)}</td>

                    {/* Base price — the pre-tax value that will be used on the invoice */}
                    <td className="si-aim-price">{displayPrice(item)}</td>

                    {/* GST rate */}
                    <td className="si-aim-price">
                      {taxRate > 0 ? `${taxRate}%` : "–"}
                    </td>

                    {/* Default discount % */}
                    <td className="si-aim-price">
                      {discPct > 0 ? `${discPct}%` : "–"}
                    </td>

                    <td className="si-aim-price">
                      {item.purchasePrice != null && Number(item.purchasePrice) > 0
                        ? `₹${Number(item.purchasePrice).toLocaleString("en-IN")}`
                        : "–"}
                    </td>

                    <td className="si-aim-qty-cell">
                      {qty === 0 ? (
                        <button className="si-aim-add-btn" onClick={() => setQty(item.id, 1)}>
                          + Add
                        </button>
                      ) : (
                        <div className="si-aim-qty-ctrl">
                          <button onClick={() => setQty(item.id, qty - 1)}>−</button>
                          <input
                            type="number"
                            value={qty}
                            onChange={e => setQty(item.id, Number(e.target.value))}
                            className="si-aim-qty-inp"
                          />
                          <button onClick={() => setQty(item.id, qty + 1)}>+</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Footer ── */}
        <div className="si-aim-ftr">
          <div className="si-aim-shortcuts">
            <span className="si-aim-sh-lbl">Keyboard Shortcuts :</span>
            <span>Change Quantity</span><kbd>Enter</kbd>
            <span>Move between items</span><kbd>↑</kbd><kbd>↓</kbd>
          </div>
          <div className="si-aim-bottom">
            <span className="si-aim-sel-count">
              {totalSelected > 0
                ? `${totalSelected} Item(s) Selected`
                : "0 Item(s) Selected"}
            </span>
            <div className="si-aim-actions">
              <button className="si-aim-cancel" onClick={onClose}>Cancel [ESC]</button>
              <button
                className={`si-aim-add-bill${selected.size === 0 ? " si-aim-disabled" : ""}`}
                disabled={selected.size === 0}
                onClick={handleAdd}
              >
                Add to Bill [F7]
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}