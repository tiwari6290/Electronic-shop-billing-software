import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Item, BillItem, getItems } from "./SalesInvoiceTypes";
import "./SIAddItemsModal.css";

interface Props {
  onClose: () => void;
  onAddToBill: (items: BillItem[]) => void;
}

export default function SIAddItemsModal({ onClose, onAddToBill }: Props) {
  const navigate = useNavigate();
  const [items] = useState<Item[]>(getItems());
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<Map<number, number>>(new Map());
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "F7") handleAdd();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.itemCode.includes(search) ||
    (i.hsn || "").includes(search) ||
    (i.category || "").toLowerCase().includes(search.toLowerCase())
  );

  function setQty(id: number, qty: number) {
    if (qty <= 0) { const m = new Map(selected); m.delete(id); setSelected(m); return; }
    setSelected(new Map(selected).set(id, qty));
  }

  function handleAdd() {
    if (selected.size === 0) return;
    const billItems: BillItem[] = [];
    selected.forEach((qty, itemId) => {
      const item = items.find(i => i.id === itemId);
      if (!item) return;
      const amount = qty * item.salesPrice;
      billItems.push({
        rowId: `row-${Date.now()}-${itemId}`,
        itemId,
        name: item.name,
        description: "",
        hsn: item.hsn || "",
        qty,
        unit: item.unit,
        price: item.salesPrice,
        discountPct: 0,
        discountAmt: 0,
        taxLabel: "None",
        taxRate: 0,
        amount,
      });
    });
    onAddToBill(billItems);
    onClose();
  }

  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];
  const totalSelected = Array.from(selected.values()).reduce((s, v) => s + v, 0);

  return (
    <div className="si-aim-overlay" onClick={onClose}>
      <div className="si-aim-modal" onClick={e => e.stopPropagation()}>
        <div className="si-aim-hdr">
          <span>Add Items to Bill</span>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="si-aim-toolbar">
          <div className="si-aim-search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input ref={searchRef} className="si-aim-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by Item/ Serial no./ HSN code/ SKU/ Custom Field / Category"/>
            <button className="si-aim-barcode">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:20,height:20}}>
                <rect x="2" y="6" width="3" height="12"/><rect x="6" y="6" width="1.5" height="12"/>
                <rect x="8.5" y="6" width="2.5" height="12"/><rect x="12" y="6" width="1.5" height="12"/>
                <rect x="14.5" y="6" width="3" height="12"/>
              </svg>
            </button>
          </div>
          <select className="si-aim-cat" value={category} onChange={e=>setCategory(e.target.value)}>
            <option value="">Select Category</option>
            {categories.map(c=><option key={c}>{c}</option>)}
          </select>
          <button className="si-aim-create" onClick={() => { onClose(); navigate("/cashier/create-item"); }}>Create New Item</button>
        </div>

        <div className="si-aim-table-wrap">
          <table className="si-aim-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Item Code</th>
                <th>Stock</th>
                <th>Sales Price</th>
                <th>Purchase Price</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="si-aim-empty">
                  {search ? "No items found" : "Scan items to add them to your invoice"}
                </td></tr>
              ) : filtered.map(item => {
                const qty = selected.get(item.id) || 0;
                return (
                  <tr key={item.id} className={`si-aim-row${selected.has(item.id)?" si-aim-row--sel":""}`}>
                    <td className="si-aim-name">{item.name}</td>
                    <td className="si-aim-code">{item.itemCode || "–"}</td>
                    <td className="si-aim-stock">{item.stock || "–"}</td>
                    <td className="si-aim-price">₹{item.salesPrice.toLocaleString("en-IN")}</td>
                    <td className="si-aim-price">{item.purchasePrice > 0 ? `₹${item.purchasePrice.toLocaleString("en-IN")}` : "–"}</td>
                    <td className="si-aim-qty-cell">
                      {qty === 0 ? (
                        <button className="si-aim-add-btn" onClick={()=>setQty(item.id,1)}>+ Add</button>
                      ) : (
                        <div className="si-aim-qty-ctrl">
                          <button onClick={()=>setQty(item.id,qty-1)}>−</button>
                          <input type="number" value={qty} onChange={e=>setQty(item.id,Number(e.target.value))} className="si-aim-qty-inp"/>
                          <button onClick={()=>setQty(item.id,qty+1)}>+</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="si-aim-ftr">
          <div className="si-aim-shortcuts">
            <span className="si-aim-sh-lbl">Keyboard Shortcuts :</span>
            <span>Change Quantity</span><kbd>Enter</kbd>
            <span>Move between items</span><kbd>↑</kbd><kbd>↓</kbd>
          </div>
          <div className="si-aim-bottom">
            <span className="si-aim-sel-count">{totalSelected > 0 ? `Show ${totalSelected} Item(s) Selected` : "0 Item(s) Selected"}</span>
            <div className="si-aim-actions">
              <button className="si-aim-cancel" onClick={onClose}>Cancel [ESC]</button>
              <button className={`si-aim-add-bill${selected.size===0?" si-aim-disabled":""}`} disabled={selected.size===0} onClick={handleAdd}>Add to Bill [F7]</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}