import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, ChevronDown, Settings, Plus, Trash2, X, Search, Barcode,
} from "lucide-react";
import { ChallanItem, BillItem, AdditionalCharge, SettingsState } from "./DeliveryChallanmodel";
import {
  createChallan,
  updateChallan,
  saveChallanSettings,
  type CreateChallanPayload,
} from "../../../api/deliverychallanapi";
import {
  fetchParties,
  fetchProducts,
  createParty,
  type PartyRecord,
  type ProductRecord,
} from "../../../api/partiesAndProductsApi";
import "./Createdeliverychallan.css";

// ─── Local Types ───────────────────────────────────────────────────────────────
interface Party {
  id: number;
  name: string;
  mobile: string;
  balance?: number;
  billingAddress?: string;
  shippingAddress?: string;
  email?: string;
  gstin?: string;
}

interface ItemData {
  id: number;
  name: string;
  itemCode?: string;
  currentStock?: number | null;
  salesPrice: number;
  baseSalesPrice?: number | null;   // pre-tax base price (preferred)
  purchasePrice?: number;
  unit?: string;
  hsn?: string;
  category?: string;
  taxRate?: number;                  // default GST rate from product
}

interface BankAccount {
  id: number;
  accountNumber: string;
  reEnter: string;
  ifscCode: string;
  bankBranchName: string;
  accountHolderName: string;
  upiId: string;
}

interface Props {
  challan: ChallanItem | null;
  nextNumber: string;
  settings: SettingsState;
  onSave: (c: ChallanItem) => void;
  onBack: () => void;
  isEditMode: boolean;
}

// ─── Invoice Builder Det Type ──────────────────────────────────────────────────
interface InvoiceBuilderDet {
  showPO: boolean; showEwayBill: boolean; showVehicle: boolean;
  showChallan: boolean; showFinancedBy: boolean; showSalesman: boolean;
  showWarranty: boolean; showDispatchedThrough?: boolean;
  showTransportName?: boolean; showEmailId?: boolean;
  customFields: { label: string; value: string }[];
}

const BUILDER_DET_DEFAULT: InvoiceBuilderDet = {
  showPO: false, showEwayBill: true, showVehicle: false,
  showChallan: true, showFinancedBy: true, showSalesman: true,
  showWarranty: true, showDispatchedThrough: false,
  showTransportName: false, showEmailId: true, customFields: [],
};

function loadBuilderDet(): InvoiceBuilderDet {
  try {
    const raw = localStorage.getItem("activeInvoiceTemplate");
    if (!raw) return BUILDER_DET_DEFAULT;
    const t = JSON.parse(raw);
    if (!t?.det) return BUILDER_DET_DEFAULT;
    return { ...BUILDER_DET_DEFAULT, ...t.det, customFields: Array.isArray(t.det.customFields) ? t.det.customFields : [] };
  } catch { return BUILDER_DET_DEFAULT; }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split("T")[0];
const fmtDate = (s: string) => {
  const d = new Date(s);
  return `${String(d.getDate()).padStart(2,"0")} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]} ${d.getFullYear()}`;
};

function mapPartyRecord(p: PartyRecord): Party {
  return {
    id: p.id,
    name: p.name || p.partyName,
    mobile: p.mobileNumber || "",
    balance: p.openingBalance ? Number(p.openingBalance) : 0,
    billingAddress: p.billingAddress || "",
    shippingAddress: p.shippingAddress || "",
    email: p.email || "",
    gstin: p.gstin || "",
  };
}

function mapProductRecord(p: ProductRecord): ItemData {
  // Prefer baseSalesPrice (always pre-tax), fall back to salesPrice
  const base = p.baseSalesPrice != null ? Number(p.baseSalesPrice) : (p.salesPrice ? Number(p.salesPrice) : 0);
  const gstRate = p.gstRate ? Number(String(p.gstRate).replace("%", "")) : 0;
  return {
    id: p.id,
    name: p.name,
    itemCode: p.itemCode || "",
    salesPrice: base,           // always store pre-tax base price here
    baseSalesPrice: base,
    purchasePrice: p.purchasePrice ? Number(p.purchasePrice) : 0,
    unit: p.unit || "PCS",
    hsn: p.hsnCode || p.sacCode || "",
    category: p.category || "",
    currentStock: p.currentStock ?? null,
    taxRate: gstRate,
  };
}

// ════════════════════════════════════════════════════════════════════════════
//  CORE PRICING HELPER — mirrors Sales Invoice calcBillItemAmount exactly
//  GST standard order: lineGross → discount → taxable → tax → total
// ════════════════════════════════════════════════════════════════════════════
interface CalcResult {
  taxable: number;
  taxAmount: number;
  total: number;
}

/**
 * calcBillItemAmount
 *
 * Rules (same as Sales Invoice):
 *  1. Use base (pre-tax) price only — NEVER treat price as GST-inclusive here.
 *  2. lineGross = qty × price
 *  3. discount: if discountPct > 0 → use percentage, ignore flat amount.
 *               if discountPct === 0 → use flat discountAmt.
 *  4. taxable = lineGross − discount
 *  5. taxAmount = taxable × (taxRate / 100)
 *  6. total = taxable + taxAmount
 */
function calcBillItemAmount(
  qty: number,
  price: number,
  discountPct: number,
  discountAmt: number,
  taxRate: number
): CalcResult {
  const lineGross  = qty * price;
  // Only one discount mode at a time (pct wins over flat)
  const discValue  = discountPct > 0 ? (lineGross * discountPct) / 100 : discountAmt;
  const taxable    = Math.max(0, lineGross - discValue);
  const taxAmount  = (taxable * taxRate) / 100;
  const total      = taxable + taxAmount;
  return { taxable, taxAmount, total: Math.max(0, total) };
}

// Convenience wrapper that reads from a BillItem (partial or full) + an override object
function recalcItem(base: BillItem, overrides: Partial<BillItem> = {}): number {
  const qty        = overrides.qty         ?? base.qty;
  const price      = overrides.pricePerItem ?? base.pricePerItem;
  const discPct    = overrides.discount?.percent ?? base.discount.percent;
  const discAmt    = overrides.discount?.amount  ?? base.discount.amount;
  const taxRate    = overrides.taxRate     ?? base.taxRate;
  return calcBillItemAmount(qty, price, discPct, discAmt, taxRate).total;
}

// ─── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button className={`cdc-toggle${value ? " cdc-toggle--on" : ""}`} onClick={() => onChange(!value)} role="switch" type="button">
      <span className="cdc-toggle-thumb" />
    </button>
  );
}

// ─── Mini Date Picker ──────────────────────────────────────────────────────────
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function InlineDatePicker({ value, onChange, onClose }: { value: string; onChange: (s: string) => void; onClose: () => void }) {
  const d = new Date(value);
  const [viewDate, setViewDate] = useState(new Date(d.getFullYear(), d.getMonth(), 1));
  const year = viewDate.getFullYear(), month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let dd = 1; dd <= daysInMonth; dd++) cells.push(dd);
  const curDay = d.getDate(), curMon = d.getMonth(), curYr = d.getFullYear();
  return (
    <div className="inline-datepicker">
      <div className="idp-nav">
        <button onClick={() => { const n = new Date(viewDate); n.setMonth(n.getMonth()-1); setViewDate(n); }}>‹</button>
        <span>{MONTHS[month]} {year}</span>
        <button onClick={() => { const n = new Date(viewDate); n.setMonth(n.getMonth()+1); setViewDate(n); }}>›</button>
      </div>
      <div className="idp-grid">
        {DAYS_SHORT.map(d => <div key={d} className="idp-header">{d}</div>)}
        {cells.map((dd, i) => (
          <div key={i}
            className={`idp-cell${dd===null?" empty":""}${dd!==null&&dd===curDay&&month===curMon&&year===curYr?" selected":""}`}
            onClick={() => { if (dd !== null) { onChange(new Date(year,month,dd).toISOString().split("T")[0]); onClose(); } }}
          >{dd}</div>
        ))}
      </div>
    </div>
  );
}

// ─── Party Selector ────────────────────────────────────────────────────────────
function PartySelector({ parties, loading, onSelect, onCreateParty }: {
  parties: Party[]; loading: boolean;
  onSelect: (p: Party) => void; onCreateParty: () => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = parties.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.mobile || "").includes(search)
  );
  return (
    <div className="party-selector-dropdown">
      <div className="party-search-box">
        <input autoFocus placeholder="Search party by name or mobile" value={search} onChange={e => setSearch(e.target.value)} />
        <ChevronDown size={14} />
      </div>
      <div className="party-list-header"><span>Party Name</span><span>Balance</span></div>
      <div className="party-list">
        {loading ? (
          <div style={{ padding: 16, textAlign: "center", color: "#6b7280", fontSize: 13 }}>Loading parties…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 16, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
            {search ? "No parties match your search" : "No parties found"}
          </div>
        ) : filtered.map(p => (
          <div key={p.id} className="party-list-item" onClick={() => onSelect(p)}>
            <span>{p.name}</span>
            <span className="party-balance">₹ {Math.abs(p.balance || 0).toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div className="party-create-btn" onClick={onCreateParty}>+ Create Party</div>
    </div>
  );
}

// ─── Create New Party Modal ────────────────────────────────────────────────────
function CreatePartyModal({ onSave, onClose }: { onSave: (p: Party) => void; onClose: () => void }) {
  const [name, setName] = useState(""); const [mobile, setMobile] = useState("");
  const [showAddress, setShowAddress] = useState(false);
  const [address, setAddress] = useState(""); const [state, setState] = useState("");
  const [pincode, setPincode] = useState(""); const [city, setCity] = useState("");
  const [nameErr, setNameErr] = useState(false);
  const [saving, setSaving] = useState(false); const [apiErr, setApiErr] = useState("");

  const handleSave = async () => {
    if (!name.trim()) { setNameErr(true); return; }
    setSaving(true); setApiErr("");
    try {
      const billingAddress = showAddress ? [address, city, state, pincode].filter(Boolean).join(", ") : "";
      const record = await createParty({ name: name.trim(), partyName: name.trim(), mobileNumber: mobile || undefined, billingAddress: billingAddress || undefined, partyType: "Customer" });
      onSave(mapPartyRecord(record));
    } catch (err: any) {
      setApiErr("Server error — party added for this session only.");
      onSave({ id: Date.now(), name: name.trim(), mobile, balance: 0, billingAddress: "" });
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cdc-modal" style={{ maxWidth: 500 }}>
        <div className="cdc-modal-header"><h2>Create New Party</h2><button onClick={onClose}><X size={18} /></button></div>
        <div className="cdc-modal-body">
          {apiErr && <div style={{ background: "#fef9c3", color: "#b45309", padding: "8px 12px", borderRadius: 6, fontSize: 12, marginBottom: 12 }}>{apiErr}</div>}
          <div className="cdc-field"><label>Party Name <span className="req">*</span></label><input className={`cdc-input${nameErr?" error":""}`} placeholder="Enter name" value={name} onChange={e => { setName(e.target.value); setNameErr(false); }} />{nameErr && <span className="field-err">This field is mandatory</span>}</div>
          <div className="cdc-field"><label>Mobile Number</label><input className="cdc-input" placeholder="Enter Mobile Number" value={mobile} onChange={e => setMobile(e.target.value)} /></div>
          {!showAddress ? <button className="link-btn" onClick={() => setShowAddress(true)}>+ Add Address (Optional)</button> : (
            <div className="optional-section">
              <div className="optional-section-header"><span>Address (Optional)</span><button className="link-btn-sm" onClick={() => setShowAddress(false)}>Remove</button></div>
              <div className="cdc-field"><label>BILLING ADDRESS</label><textarea className="cdc-textarea" value={address} onChange={e => setAddress(e.target.value)} rows={3} /></div>
              <div className="cdc-row-2">
                <div className="cdc-field"><label>STATE</label><input className="cdc-input" value={state} onChange={e => setState(e.target.value)} /></div>
                <div className="cdc-field"><label>PINCODE</label><input className="cdc-input" value={pincode} onChange={e => setPincode(e.target.value)} /></div>
              </div>
              <div className="cdc-field"><label>CITY</label><input className="cdc-input" value={city} onChange={e => setCity(e.target.value)} /></div>
            </div>
          )}
        </div>
        <div className="cdc-modal-footer"><button className="btn-secondary-sm" onClick={onClose}>Cancel</button><button className="btn-primary-sm" onClick={handleSave} disabled={saving}>{saving?"Saving…":"Save"}</button></div>
      </div>
    </div>
  );
}

// ─── Change Shipping Address Modal ────────────────────────────────────────────
function ChangeShippingModal({ partyName, addresses, onDone, onClose }: { partyName: string; addresses: string[]; onDone: (addr: string) => void; onClose: () => void }) {
  const [selected, setSelected] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState(partyName); const [newStreet, setNewStreet] = useState("");
  const [newState, setNewState] = useState(""); const [newPin, setNewPin] = useState(""); const [newCity, setNewCity] = useState("");

  if (showAddForm) return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cdc-modal" style={{ maxWidth: 480 }}>
        <div className="cdc-modal-header"><h2>Add Shipping Address</h2><button onClick={onClose}><X size={18} /></button></div>
        <div className="cdc-modal-body">
          <div className="cdc-field"><label>Shipping Name <span className="req">*</span></label><input className="cdc-input" value={newName} onChange={e => setNewName(e.target.value)} /></div>
          <div className="cdc-field"><label>Street Address <span className="req">*</span></label><textarea className="cdc-textarea" value={newStreet} onChange={e => setNewStreet(e.target.value)} rows={3} /></div>
          <div className="cdc-row-2">
            <div className="cdc-field"><label>State</label><input className="cdc-input" value={newState} onChange={e => setNewState(e.target.value)} /></div>
            <div className="cdc-field"><label>Pincode</label><input className="cdc-input" value={newPin} onChange={e => setNewPin(e.target.value)} /></div>
          </div>
          <div className="cdc-field"><label>City</label><input className="cdc-input" value={newCity} onChange={e => setNewCity(e.target.value)} /></div>
        </div>
        <div className="cdc-modal-footer"><button className="btn-secondary-sm" onClick={() => setShowAddForm(false)}>Cancel</button><button className="btn-primary-sm" onClick={() => onDone(`${newName}, ${newStreet}, ${newCity}, ${newState} - ${newPin}`)}>Save</button></div>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cdc-modal" style={{ maxWidth: 480 }}>
        <div className="cdc-modal-header"><h2>Change Shipping Address</h2><button onClick={onClose}><X size={18} /></button></div>
        <div className="cdc-modal-body" style={{ padding: 0 }}>
          <div className="ship-addr-table-header"><span>Address</span><span>Edit</span><span>Select</span></div>
          {addresses.filter(Boolean).map((addr, i) => (
            <div key={i} className="ship-addr-row">
              <div><div className="ship-addr-name">{partyName}</div><div className="ship-addr-text">{addr}</div></div>
              <button className="ship-edit-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
              <input type="radio" checked={selected===i} onChange={() => setSelected(i)} />
            </div>
          ))}
          <button className="link-btn" style={{ margin: "12px 16px" }} onClick={() => setShowAddForm(true)}>+ Add New Shipping Address</button>
        </div>
        <div className="cdc-modal-footer"><button className="btn-secondary-sm" onClick={onClose}>Cancel</button><button className="btn-primary-sm" onClick={() => { onDone(addresses[selected]||""); onClose(); }}>Done</button></div>
      </div>
    </div>
  );
}

// ─── Add Items Modal ──────────────────────────────────────────────────────────
function AddItemsModal({ onAddItems, onClose }: { onAddItems: (items: { item: ItemData; qty: number }[]) => void; onClose: () => void }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [items, setItems] = useState<ItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError("");
    fetchProducts()
      .then(records => { if (!cancelled) { setItems(records.map(mapProductRecord)); setLoading(false); } })
      .catch(err => { if (!cancelled) { setError("Failed to load items: " + err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const categories = Array.from(new Set(items.map(i => i.category).filter(Boolean))) as string[];
  const filtered = items.filter(i => {
    const matchSearch = !search ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.itemCode||"").toLowerCase().includes(search.toLowerCase()) ||
      (i.hsn||"").includes(search);
    const matchCat = !category || i.category === category;
    return matchSearch && matchCat;
  });
  const totalSelected = Object.values(quantities).filter(q => q > 0).length;
  const handleAdd = () => { const sel = filtered.filter(item => (quantities[item.id]||0)>0).map(item => ({ item, qty: quantities[item.id] })); onAddItems(sel); };
  const setQty = (id: number, qty: number) => setQuantities(prev => ({ ...prev, [id]: Math.max(0, qty) }));

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="add-items-modal">
        <div className="aim-header"><h2>Add Items to Bill</h2><button onClick={onClose}><X size={18} /></button></div>
        <div className="aim-toolbar">
          <div className="aim-search">
            <Search size={14}/>
            <input autoFocus placeholder="Search by Item / HSN / SKU / Item Code" value={search} onChange={e => setSearch(e.target.value)} />
            <Barcode size={18} className="barcode-icon"/>
          </div>
          <div className="aim-category">
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button className="btn-primary-sm aim-create" onClick={() => navigate("/cashier/create-item")}>Create New Item</button>
        </div>
        <div className="aim-table-wrapper">
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>Loading items…</div>
          ) : error ? (
            <div style={{ padding: 24, textAlign: "center", color: "#dc2626", fontSize: 13 }}>{error}</div>
          ) : (
            <table className="aim-table">
              <thead><tr><th>Item Name</th><th>Item Code</th><th>Stock</th><th>Sales Price (Base)</th><th>Purchase Price</th><th>Quantity</th></tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="aim-empty">No items found</td></tr>
                ) : filtered.map(item => (
                  <tr key={item.id}>
                    <td className="aim-item-name">{item.name}</td>
                    <td>{item.itemCode || "-"}</td>
                    <td>{item.currentStock!=null ? `${item.currentStock} ${item.unit||"PCS"}` : "-"}</td>
                    {/* Show the pre-tax base price in the modal */}
                    <td>₹ {Number(item.salesPrice).toLocaleString()}</td>
                    <td>{item.purchasePrice ? `₹ ${Number(item.purchasePrice).toLocaleString()}` : "-"}</td>
                    <td>
                      {(quantities[item.id]||0) > 0 ? (
                        <div className="qty-control">
                          <button onClick={() => setQty(item.id, (quantities[item.id]||0)-1)}>−</button>
                          <span>{quantities[item.id]}</span>
                          <button onClick={() => setQty(item.id, (quantities[item.id]||0)+1)}>+</button>
                          <span className="qty-unit">{item.unit||"PCS"}</span>
                        </div>
                      ) : (
                        <button className="aim-add-btn" onClick={() => setQty(item.id, 1)}>+ Add</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="aim-footer">
          <div className="aim-shortcuts"><span>Keyboard Shortcuts:</span><span>Change Quantity <kbd>Enter</kbd></span><span>Move <kbd>↑</kbd><kbd>↓</kbd></span></div>
          <div className="aim-footer-right">
            <span className="aim-selected">{totalSelected} Item(s) Selected</span>
            <button className="btn-secondary-sm" onClick={onClose}>Cancel [ESC]</button>
            <button className={`btn-primary-sm${totalSelected===0?" disabled":""}`} onClick={handleAdd} disabled={totalSelected===0}>Add to Bill [F7]</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Show/Hide Columns Modal ───────────────────────────────────────────────────
function ShowHideColumnsModal({ showPrice, showQty, onSave, onClose }: { showPrice: boolean; showQty: boolean; onSave: (price: boolean, qty: boolean) => void; onClose: () => void }) {
  const navigate = useNavigate();
  const [price, setPrice] = useState(showPrice); const [qty, setQty] = useState(showQty);
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cdc-modal" style={{ maxWidth: 460 }}>
        <div className="cdc-modal-header"><h2>Show/Hide Columns in Invoice</h2><button onClick={onClose}><X size={18} /></button></div>
        <div className="cdc-modal-body">
          <div className="shc-row"><span>Price/Item (₹)</span><Toggle value={price} onChange={setPrice} /></div>
          <div className="shc-row"><span>Quantity</span><Toggle value={qty} onChange={setQty} /></div>
          <div className="shc-divider">CUSTOM COLUMN</div>
          <div className="shc-empty-custom"><p>No Custom Columns added</p></div>
          <div className="shc-note">To add Custom Item Columns - <span className="link-text" onClick={() => { onClose(); navigate("/cashier/create-item/inventory"); }}>Items page (click here)</span></div>
        </div>
        <div className="cdc-modal-footer"><button className="btn-secondary-sm" onClick={onClose}>Cancel</button><button className="btn-primary-sm" onClick={() => { onSave(price,qty); onClose(); }}>Save</button></div>
      </div>
    </div>
  );
}

// ─── Select Bank / Add Bank Modals ─────────────────────────────────────────────
function SelectBankModal({ onClose, onAdd, onSelect }: { onClose: () => void; onAdd: () => void; onSelect: (b: BankAccount) => void }) {
  const [banks] = useState<BankAccount[]>(() => { try { return JSON.parse(localStorage.getItem("bankAccounts")||"[]"); } catch { return []; } });
  const [selected, setSelected] = useState<number|null>(null);
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&onClose()}>
      <div className="cdc-modal" style={{ maxWidth: 420 }}>
        <div className="cdc-modal-header"><h2>Select Bank Accounts</h2><button onClick={onClose}><X size={18} /></button></div>
        <div className="cdc-modal-body">
          {banks.length===0 ? <p style={{textAlign:"center",color:"#6b7280",padding:"16px 0"}}>No bank accounts added yet.<br/><button className="link-btn" style={{marginTop:8}} onClick={onAdd}>+ Add Bank Account</button></p>
          : banks.map((b,i) => (
            <div key={i} className={`bank-select-row${selected===i?" selected":""}`} onClick={() => setSelected(i)}>
              <div className="bank-logo-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="9" width="18" height="11" rx="2"/><path d="M3 9l9-5 9 5"/><line x1="12" y1="9" x2="12" y2="20"/></svg></div>
              <div className="bank-info"><div className="bank-name">{b.bankBranchName||"Bank"}</div><div className="bank-acc">ACC No: {b.accountNumber}</div></div>
              <div className="bank-right"><div className="bank-ifsc">IFSC: {b.ifscCode||"-"}</div></div>
              <input type="radio" checked={selected===i} onChange={() => setSelected(i)} />
            </div>
          ))}
          {banks.length>0 && <button className="link-btn" style={{marginTop:12}} onClick={onAdd}>+ Add Bank Account</button>}
        </div>
        <div className="cdc-modal-footer"><button className="btn-secondary-sm" onClick={onClose}>Cancel</button><button className="btn-primary-sm" onClick={() => { if(selected!==null) onSelect(banks[selected]); onClose(); }}>DONE</button></div>
      </div>
    </div>
  );
}

function AddBankModal({ onClose, onSaved }: { onClose: () => void; onSaved: (b: BankAccount) => void }) {
  const [form, setForm] = useState({ accountNumber:"", reEnter:"", ifscCode:"", bankBranchName:"", accountHolderName:"", upiId:"" });
  const [err, setErr] = useState("");
  const upd = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));
  const handleSubmit = () => {
    if (!form.accountNumber) { setErr("Account number is required"); return; }
    if (form.accountNumber!==form.reEnter) { setErr("Account numbers don't match"); return; }
    const bank: BankAccount = { id: Date.now(), ...form };
    const stored = JSON.parse(localStorage.getItem("bankAccounts")||"[]"); stored.push(bank);
    localStorage.setItem("bankAccounts", JSON.stringify(stored)); onSaved(bank);
  };
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&onClose()}>
      <div className="cdc-modal" style={{ maxWidth: 460 }}>
        <div className="cdc-modal-header"><h2>Add Bank Account</h2><button onClick={onClose}><X size={18} /></button></div>
        <div className="cdc-modal-body">
          {err && <div style={{color:"#dc2626",fontSize:13,marginBottom:8}}>{err}</div>}
          <div className="cdc-field"><label>Account Number <span className="req">*</span></label><input className="cdc-input" value={form.accountNumber} onChange={e => upd("accountNumber",e.target.value)} /></div>
          <div className="cdc-field"><label>Re-enter Account Number <span className="req">*</span></label><input className="cdc-input" value={form.reEnter} onChange={e => upd("reEnter",e.target.value)} /></div>
          <div className="cdc-field"><label>IFSC Code</label><input className="cdc-input" value={form.ifscCode} onChange={e => upd("ifscCode",e.target.value)} /></div>
          <div className="cdc-field"><label>Bank &amp; Branch Name</label><input className="cdc-input" value={form.bankBranchName} onChange={e => upd("bankBranchName",e.target.value)} /></div>
          <div className="cdc-field"><label>Account Holder Name</label><input className="cdc-input" value={form.accountHolderName} onChange={e => upd("accountHolderName",e.target.value)} /></div>
          <div className="cdc-field"><label>UPI ID</label><input className="cdc-input" value={form.upiId} onChange={e => upd("upiId",e.target.value)} /></div>
        </div>
        <div className="cdc-modal-footer"><button className="btn-secondary-sm" onClick={onClose}>Cancel</button><button className="btn-primary-sm" onClick={handleSubmit}>Save</button></div>
      </div>
    </div>
  );
}

// ─── Quick Settings Modal ──────────────────────────────────────────────────────
function QuickSettingsModal({ settings, onSave, onClose }: { settings: SettingsState; onSave: (s: SettingsState) => void; onClose: () => void }) {
  const [local, setLocal] = useState({ ...settings }); const [saving, setSaving] = useState(false);
  const upd = <K extends keyof SettingsState>(k: K, v: SettingsState[K]) => setLocal(p => ({ ...p, [k]: v }));
  const num = local.prefixEnabled ? `${local.prefix}${String(local.sequenceNumber).padStart(5,"0")}` : `DC-${String(local.sequenceNumber).padStart(5,"0")}`;
  const handleSave = async () => {
    setSaving(true);
    try { await saveChallanSettings({ prefix: local.prefix||null, sequenceNumber: local.sequenceNumber, enablePrefix: local.prefixEnabled, showItemImage: local.showItemImage, priceHistory: local.priceHistory }); onSave(local); onClose(); }
    catch (e: any) { alert("Failed to save settings: "+e.message); }
    finally { setSaving(false); }
  };
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&onClose()}>
      <div className="cdc-modal" style={{ maxWidth: 520 }}>
        <div className="cdc-modal-header"><h2>Quick Delivery Challan Settings</h2><button onClick={onClose}><X size={18} /></button></div>
        <div className="cdc-modal-body">
          <div className="settings-card"><div className="settings-card-header"><div><div className="settings-title">Delivery Challan Prefix &amp; Sequence Number</div><div className="settings-desc">Add your custom prefix &amp; sequence for numbering</div></div><Toggle value={local.prefixEnabled} onChange={v => upd("prefixEnabled",v)}/></div>
            {local.prefixEnabled && (<div className="settings-fields"><div className="cdc-field"><label>Prefix</label><input className="cdc-input" value={local.prefix} onChange={e => upd("prefix",e.target.value)}/></div><div className="cdc-field"><label>Sequence Number</label><input className="cdc-input" type="number" value={local.sequenceNumber} onChange={e => upd("sequenceNumber",Number(e.target.value))}/></div></div>)}
            {local.prefixEnabled && <div className="challan-num-preview">Delivery Challan Number: {num}</div>}
          </div>
          <div className="settings-card"><div className="settings-card-header"><div><div className="settings-title">Show Item Image on Invoice</div><div className="settings-desc">Applies to all vouchers except Payment In/Out</div></div><Toggle value={local.showItemImage} onChange={v => upd("showItemImage",v)}/></div></div>
          <div className="settings-card"><div className="settings-card-header"><div><div className="settings-title">Price History <span className="badge-new">New</span></div><div className="settings-desc">Show last 5 sales/purchase prices for the party</div></div><Toggle value={local.priceHistory} onChange={v => upd("priceHistory",v)}/></div></div>
        </div>
        <div className="cdc-modal-footer"><button className="btn-secondary-sm" onClick={onClose}>Cancel</button><button className="btn-primary-sm" onClick={handleSave} disabled={saving}>{saving?"Saving…":"Save"}</button></div>
      </div>
    </div>
  );
}

// ─── Signature ─────────────────────────────────────────────────────────────────
function SignatureModal({ onClose, onUpload, onShowEmpty }: { onClose: () => void; onUpload: (url: string) => void; onShowEmpty: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { const r = ev.target?.result as string; if (r) { onUpload(r); onClose(); } };
    reader.readAsDataURL(file); e.target.value = "";
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="cdc-sig-modal" onClick={e => e.stopPropagation()}>
        <div className="cdc-sig-modal-header"><h2 className="cdc-sig-modal-title">Signature</h2><button className="cdc-sig-modal-close" onClick={onClose}><X size={16}/></button></div>
        <div className="cdc-sig-modal-body">
          <button className="cdc-sig-option-card" onClick={() => fileRef.current?.click()}>
            <div className="cdc-sig-option-icon"><svg width="40" height="40" viewBox="0 0 48 48" fill="none"><rect x="4" y="10" width="36" height="28" rx="3" stroke="#5b50d6" strokeWidth="2.2" fill="none"/><path d="M4 32 L15 20 L22 28 L30 18 L44 32" stroke="#5b50d6" strokeWidth="2" fill="none" strokeLinejoin="round"/><circle cx="38" cy="12" r="8" fill="#eef2ff"/><path d="M38 9 L38 15 M35 12 L38 9 L41 12" stroke="#5b50d6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
            <span className="cdc-sig-option-label">Upload Signature from Desktop</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile} />
          <button className="cdc-sig-option-card" onClick={() => { onShowEmpty(); onClose(); }}>
            <div className="cdc-sig-option-icon"><svg width="44" height="36" viewBox="0 0 44 36" fill="none"><rect x="2" y="2" width="40" height="32" rx="3" stroke="#5b50d6" strokeWidth="2.2" fill="none"/></svg></div>
            <span className="cdc-sig-option-label">Show Empty Signature Box on Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SignatorySection({ businessName }: { businessName: string }) {
  const [sigState, setSigState] = useState<"none"|"empty"|"uploaded">("none");
  const [sigImage, setSigImage] = useState<string|null>(null);
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <div className="cdc-signatory">
        <span className="cdc-signatory-label">Authorized signatory</span>
        {sigState==="none" && <button className="cdc-sig-add-btn" onClick={() => setShowModal(true)} type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Signature</button>}
        {sigState==="empty" && <div className="cdc-sig-box-wrap"><div className="cdc-sig-display-box cdc-sig-display-box--empty" onClick={() => setShowModal(true)}/><button className="cdc-sig-remove-btn" onClick={e => { e.stopPropagation(); setSigState("none"); setSigImage(null); }} type="button"><X size={10}/></button></div>}
        {sigState==="uploaded" && sigImage && <div className="cdc-sig-box-wrap"><div className="cdc-sig-display-box cdc-sig-display-box--uploaded" onClick={() => setShowModal(true)}><img src={sigImage} alt="Signature" className="cdc-sig-img"/></div><button className="cdc-sig-remove-btn" onClick={e => { e.stopPropagation(); setSigState("none"); setSigImage(null); }} type="button"><X size={10}/></button></div>}
      </div>
      {showModal && <SignatureModal onClose={() => setShowModal(false)} onUpload={url => { setSigImage(url); setSigState("uploaded"); }} onShowEmpty={() => { setSigImage(null); setSigState("empty"); }}/>}
    </>
  );
}

// ─── Bill Item Row ─────────────────────────────────────────────────────────────
// Uses calcBillItemAmount for all recalculations — matches Sales Invoice exactly
function BillItemRow({ item, index, onChange, onDelete, showPrice, showQty }: {
  item: BillItem; index: number;
  onChange: (id: number, updates: Partial<BillItem>) => void;
  onDelete: (id: number) => void;
  showPrice: boolean; showQty: boolean;
}) {
  const [editingAmount, setEditingAmount] = useState(false);

  // ── TAX DISPLAY: show tax on taxable value (after discount), not on lineGross ──
  const lineGross = item.qty * item.pricePerItem;
  const discPct   = item.discount.percent;
  const discAmt   = item.discount.amount;
  const discValue = discPct > 0 ? (lineGross * discPct) / 100 : discAmt;
  const taxable   = Math.max(0, lineGross - discValue);
  const taxDisplayAmt = (taxable * item.taxRate) / 100;

  // ── DISCOUNT HANDLERS ──────────────────────────────────────────────────────
  // When pct changes → pct wins, zero out flat amount
  const handleDiscPct = (percent: number) => {
    const disc = { percent, amount: 0 };
    const amount = recalcItem(item, { discount: disc });
    onChange(item.id, { discount: disc, amount });
  };
  // When flat amount changes → flat wins, zero out pct
  const handleDiscAmt = (amount: number) => {
    const disc = { percent: 0, amount };
    const newAmt = recalcItem(item, { discount: disc });
    onChange(item.id, { discount: disc, amount: newAmt });
  };

  // ── QTY CHANGE ─────────────────────────────────────────────────────────────
  const handleQtyChange = (qty: number) => {
    const amount = recalcItem(item, { qty });
    onChange(item.id, { qty, amount });
  };

  // ── PRICE CHANGE ───────────────────────────────────────────────────────────
  const handlePriceChange = (pricePerItem: number) => {
    const amount = recalcItem(item, { pricePerItem });
    onChange(item.id, { pricePerItem, amount });
  };

  // ── TAX CHANGE ─────────────────────────────────────────────────────────────
  const handleTaxChange = (tax: string) => {
    const taxRate = tax === "None" ? 0 : tax === "GST 5%" ? 5 : tax === "GST 12%" ? 12 : tax === "GST 18%" ? 18 : 28;
    const amount  = recalcItem(item, { taxRate });
    onChange(item.id, { tax, taxRate, amount });
  };

  return (
    <tr className="bill-item-row">
      <td className="td-no">{index + 1}</td>
      <td className="td-name">
        <div className="bill-item-name">{item.name}</div>
        <input className="bill-item-desc" placeholder="Enter Description (optional)" value={item.description||""} onChange={e => onChange(item.id, { description: e.target.value })} />
      </td>
      <td>
        <input className="bill-mini-input bill-hsn-input" placeholder="—" value={item.hsnSac||""} onChange={e => onChange(item.id, { hsnSac: e.target.value })} />
      </td>
      {showQty && (
        <td>
          <div className="qty-display">
            <input className="bill-mini-input qty-in" type="number" min="0"
              value={item.qty}
              onChange={e => handleQtyChange(Number(e.target.value))} />
            <span className="qty-unit-badge">{item.unit}</span>
          </div>
        </td>
      )}
      {showPrice && (
        <td>
          <input className="bill-mini-input bill-price-input" type="number" min="0"
            value={item.pricePerItem}
            onChange={e => handlePriceChange(Number(e.target.value))} />
        </td>
      )}
      <td>
        {/* Two-row discount: pct and flat are mutually exclusive */}
        <div className="discount-inputs">
          <div className="disc-row">
            <span className="disc-label">%</span>
            <input className="bill-mini-input" type="number" min="0" max="100"
              value={item.discount.percent}
              onChange={e => handleDiscPct(Number(e.target.value))} />
          </div>
          <div className="disc-row">
            <span className="disc-label">₹</span>
            <input className="bill-mini-input" type="number" min="0"
              value={item.discount.amount}
              onChange={e => handleDiscAmt(Number(e.target.value))} />
          </div>
        </div>
      </td>
      <td>
        <div className="tax-cell">
          <select className="tax-select" value={item.tax} onChange={e => handleTaxChange(e.target.value)}>
            <option>None</option>
            <option>GST 5%</option>
            <option>GST 12%</option>
            <option>GST 18%</option>
            <option>GST 28%</option>
          </select>
          {/* Tax amount shown on taxable (post-discount) value */}
          <span className="tax-sub">(₹ {taxDisplayAmt.toFixed(2)})</span>
        </div>
      </td>
      <td onClick={() => setEditingAmount(true)} className="td-amount-cell">
        {editingAmount
          ? <div className="amount-cell"><span className="amount-currency">₹</span><input className="bill-mini-input amount-edit-input" type="number" autoFocus value={item.amount} onChange={e => onChange(item.id, { amount: Number(e.target.value) })} onBlur={() => setEditingAmount(false)}/></div>
          : <div className="amount-cell amount-cell--clickable"><span className="amount-currency">₹</span><span className="amount-val">{item.amount.toFixed(2)}</span></div>
        }
      </td>
      <td>
        <button className="delete-row-btn" onClick={() => onDelete(item.id)} type="button"><Trash2 size={14}/></button>
      </td>
    </tr>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function CreateDeliveryChallan({ challan, nextNumber, settings, onSave, onBack, isEditMode }: Props) {

  // ── Parties from API ──────────────────────────────────────────────────────
  const [parties, setParties] = useState<Party[]>([]);
  const [partiesLoading, setPartiesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchParties()
      .then(records => { if (!cancelled) { setParties(records.map(mapPartyRecord)); setPartiesLoading(false); } })
      .catch(() => { if (!cancelled) setPartiesLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Seed selected party from challan, upgrade once parties load
  const [selectedParty, setSelectedParty] = useState<Party | null>(() => {
    if (!challan?.partyId) return null;
    return { id: challan.partyId, name: challan.partyName, mobile: "", balance: 0, shippingAddress: challan.shippingAddress || "" };
  });

  useEffect(() => {
    if (challan?.partyId && parties.length > 0) {
      const found = parties.find(p => p.id === challan.partyId);
      if (found) setSelectedParty(found);
    }
  }, [parties, challan?.partyId]);

  const [showPartySelector, setShowPartySelector] = useState(false);
  const [showCreateParty, setShowCreateParty] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(challan?.shippingAddress || "");
  const [showShippingModal, setShowShippingModal] = useState(false);

  const [challanNo] = useState<string>(challan?.challanNumber?.toString() || nextNumber);
  const [challanDate, setChallanDate] = useState(challan?.date ? challan.date.split("T")[0] : todayStr());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Invoice builder det
  const [det, setDet] = useState<InvoiceBuilderDet>(loadBuilderDet);
  useEffect(() => {
    const sync = () => { const next = loadBuilderDet(); setDet(prev => JSON.stringify(prev)!==JSON.stringify(next)?next:prev); };
    sync(); const timer = setInterval(sync, 500);
    const onStorage = (e: StorageEvent) => { if (e.key==="activeInvoiceTemplate") sync(); };
    window.addEventListener("storage", onStorage);
    return () => { clearInterval(timer); window.removeEventListener("storage", onStorage); };
  }, []);

  const [eWayBillNo, setEWayBillNo]             = useState(challan?.eWayBillNo||"");
  const [challanNoRef, setChallanNoRef]         = useState(challan?.challanNoRef||"");
  const [financedBy, setFinancedBy]             = useState(challan?.financedBy||"");
  const [salesman, setSalesman]                 = useState(challan?.salesman||"");
  const [emailId, setEmailId]                   = useState(challan?.emailId||"");
  const [warrantyPeriod, setWarrantyPeriod]     = useState(challan?.warrantyPeriod||"");
  const [poNumber, setPoNumber]                 = useState((challan as any)?.poNumber||"");
  const [vehicleNo, setVehicleNo]               = useState((challan as any)?.vehicleNo||"");
  const [dispatchedThrough, setDispatchedThrough] = useState((challan as any)?.dispatchedThrough||"");
  const [transportName, setTransportName]       = useState((challan as any)?.transportName||"");
  const [customFieldValues, setCustomFieldValues] = useState<Record<string,string>>((challan as any)?.customFieldValues||{});

  useEffect(() => {
    if (!det.customFields?.length) return;
    setCustomFieldValues(prev => {
      const next = {...prev};
      det.customFields.forEach(cf => { if (!cf.label?.trim()) return; if (!Object.prototype.hasOwnProperty.call(next,cf.label)&&cf.value) next[cf.label]=cf.value; });
      return JSON.stringify(next)===JSON.stringify(prev)?prev:next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(det.customFields)]);

  const [billItems, setBillItems] = useState<BillItem[]>(challan?.items||[]);
  const [showAddItems, setShowAddItems] = useState(false);
  const [showHideColumns, setShowHideColumns] = useState(false);
  const [showPrice, setShowPrice] = useState(true);
  const [showQty, setShowQty] = useState(true);

  const [notes, setNotes] = useState(challan?.notes||"");
  const [termsAndConditions, setTermsAndConditions] = useState(challan?.termsAndConditions||"1. Goods once sold will not be taken back or exchanged\n2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only");
  const [showNotes, setShowNotes] = useState(!!challan?.notes);
  const [showTerms, setShowTerms] = useState(true);

  const [additionalCharges, setAdditionalCharges] = useState<AdditionalCharge[]>(challan?.additionalCharges||[]);
  const [showAdditionalCharges, setShowAdditionalCharges] = useState((challan?.additionalCharges?.length||0)>0);

  const [discountType, setDiscountType] = useState<"After Tax"|"Before Tax">(challan?.discountType||"After Tax");
  const [discountPct, setDiscountPct]   = useState(challan?.discountPct||0);
  const [discountAmt, setDiscountAmt]   = useState(challan?.discountAmt||0);
  const [showDiscount, setShowDiscount] = useState(!!(challan?.discountPct||challan?.discountAmt));
  const [showDiscountMenu, setShowDiscountMenu] = useState(false);

  const [autoRoundOff, setAutoRoundOff]         = useState(challan?.autoRoundOff||false);
  const [roundOffAmt, setRoundOffAmt]           = useState(challan?.roundOffAmt||0);
  const [roundOffType, setRoundOffType]         = useState<"+ Add"|"Reduce">("+ Add");
  const [showRoundOffMenu, setShowRoundOffMenu] = useState(false);

  const [selectedBank, setSelectedBank]         = useState<BankAccount|null>(null);
  const [showBankModal, setShowBankModal]       = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showSettings, setShowSettings]         = useState(false);
  const [saving, setSaving]                     = useState(false);
  const [saveError, setSaveError]               = useState<string|null>(null);

  const dateRef          = useRef<HTMLDivElement>(null);
  const partySelectorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dateRef.current&&!dateRef.current.contains(e.target as Node)) setShowDatePicker(false);
      if (partySelectorRef.current&&!partySelectorRef.current.contains(e.target as Node)) setShowPartySelector(false);
    };
    document.addEventListener("mousedown",h); return () => document.removeEventListener("mousedown",h);
  }, []);

  // ════════════════════════════════════════════════════════════════════════
  //  SUMMARY CALCULATIONS  — mirrors Sales Invoice exactly
  //
  //  • itemSubtotal  = sum of (qty × base price) for all items (before discount/tax)
  //  • totalItemDisc = sum of each item's discount value
  //  • totalItemTax  = sum of each item's tax (on post-discount taxable)
  //  • Each item's `amount` already includes its own tax (set by recalcItem)
  //  • chargesSum    = additional charges (no tax applied at this level in DC)
  //  • taxableAmount = itemSubtotal − totalItemDisc + chargesSum
  //  • effectiveDiscount = invoice-level discount (pct or flat, After/Before Tax)
  //  • totalAmount   = sum of item amounts + chargesSum − invoiceDiscount ± roundOff
  // ════════════════════════════════════════════════════════════════════════

  // Per-item values derived from the canonical calcBillItemAmount
  const itemCalcs = billItems.map(item => {
    const lineGross = item.qty * item.pricePerItem;
    const discPct   = item.discount.percent;
    const discAmt_  = item.discount.amount;
    const discValue = discPct > 0 ? (lineGross * discPct) / 100 : discAmt_;
    const taxable   = Math.max(0, lineGross - discValue);
    const taxAmt    = (taxable * item.taxRate) / 100;
    return { lineGross, discValue, taxable, taxAmt };
  });

  // Subtotal = sum of all line grosses (before item discounts/tax)
  const itemSubtotal  = itemCalcs.reduce((s, c) => s + c.lineGross, 0);
  // Total discount from items
  const totalItemDisc = itemCalcs.reduce((s, c) => s + c.discValue, 0);
  // Total tax from items
  const totalItemTax  = itemCalcs.reduce((s, c) => s + c.taxAmt,   0);

  // Additional charges (flat, no tax calc here)
  const chargesSum = additionalCharges.reduce((s, c) => s + c.amount, 0);

  // Taxable amount shown in summary  = subtotal − item discounts + charges
  const taxableAmount = itemSubtotal - totalItemDisc + chargesSum;

  // Invoice-level discount (After Tax or Before Tax)
  const discValueFromPct = taxableAmount * discountPct / 100;
  const effectiveDiscount = showDiscount ? (discountPct > 0 ? discValueFromPct : discountAmt) : 0;

  // SUBTOTAL row in the table header (shown as "SUBTOTAL" row)
  // = sum of all item `amount` fields (each already includes item-level tax)
  const subtotal = billItems.reduce((s, i) => s + i.amount, 0);

  // Round-off
  const roundOffValue = autoRoundOff
    ? (roundOffType === "Reduce" ? -roundOffAmt : roundOffAmt)
    : 0;

  // Grand total
  const totalAmount = subtotal + chargesSum - effectiveDiscount + roundOffValue;

  // ── Discount sync helpers ─────────────────────────────────────────────────
  const handleDiscountPctChange = (v: number) => {
    setDiscountPct(v);
    setDiscountAmt(v > 0 ? parseFloat((taxableAmount * v / 100).toFixed(2)) : 0);
  };
  const handleDiscountAmtChange = (v: number) => {
    setDiscountAmt(v);
    setDiscountPct(v > 0 && taxableAmount > 0 ? parseFloat(((v / taxableAmount) * 100).toFixed(2)) : 0);
  };

  const handleAddCharge = () => {
    setAdditionalCharges(prev => [...prev, { id: Date.now(), label: "", amount: 0, tax: "No Tax Applicable" }]);
    setShowAdditionalCharges(true);
  };

  // ── When items are added from the modal, use base price + product taxRate ──
  const handleAddItemsFromModal = (selected: { item: ItemData; qty: number }[]) => {
    const newItems: BillItem[] = selected.map(({ item, qty }) => {
      const price    = item.baseSalesPrice ?? item.salesPrice; // always pre-tax base
      const taxRate  = item.taxRate ?? 0;
      const { total } = calcBillItemAmount(qty, price, 0, 0, taxRate);
      return {
        id:          Date.now() + Math.random(),
        name:        item.name,
        hsnSac:      item.hsn || "",
        qty,
        unit:        item.unit || "PCS",
        pricePerItem: price,
        discount:    { percent: 0, amount: 0 },
        tax:         taxRate === 0 ? "None" : taxRate === 5 ? "GST 5%" : taxRate === 12 ? "GST 12%" : taxRate === 18 ? "GST 18%" : "GST 28%",
        taxRate,
        amount:      total,
      };
    });
    setBillItems(prev => [...prev, ...newItems]);
    setShowAddItems(false);
  };

  const handleItemChange = (id: number, updates: Partial<BillItem>) =>
    setBillItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  const handleDeleteItem = (id: number) =>
    setBillItems(prev => prev.filter(i => i.id !== id));

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedParty && !challan?.partyId) { setSaveError("Please select a party before saving."); return; }
    if (billItems.length === 0) { setSaveError("Please add at least one item before saving."); return; }
    setSaving(true); setSaveError(null);
    const payload: CreateChallanPayload = {
      partyId:         selectedParty?.id || challan?.partyId || 0,
      challanDate,
      eWayBillNo:      eWayBillNo        || undefined,
      challanNoRef:    challanNoRef      || undefined,
      financedBy:      financedBy        || undefined,
      salesman:        salesman          || undefined,
      emailId:         emailId           || undefined,
      warrantyPeriod:  warrantyPeriod    || undefined,
      poNumber:        poNumber          || undefined,
      vehicleNo:       vehicleNo         || undefined,
      dispatchedThrough: dispatchedThrough || undefined,
      transportName:   transportName     || undefined,
      shippingAddress: shippingAddress   || undefined,
      discountType,
      discountPct:     showDiscount ? discountPct : 0,
      discountAmt:     showDiscount ? discountAmt : 0,
      autoRoundOff,
      roundOffAmt:     autoRoundOff ? roundOffAmt : 0,
      customFieldValues: Object.keys(customFieldValues).length > 0 ? customFieldValues : undefined,
      notes:           notes              || undefined,
      termsConditions: termsAndConditions || undefined,
      // Send price as pre-tax base price so backend stores the correct value
      items: billItems.map(i => ({
        productName: i.name,
        hsnSac:      i.hsnSac    || undefined,
        description: i.description || undefined,
        quantity:    i.qty,
        unit:        i.unit,
        price:       i.pricePerItem,   // already the pre-tax base price
        discountPct: i.discount.percent,
        discountAmt: i.discount.amount,
        taxLabel:    i.tax,
        taxRate:     i.taxRate,
      })),
      additionalCharges: additionalCharges.map(c => ({ label: c.label, amount: c.amount, taxLabel: c.tax })),
    };
    try {
      const result: any = isEditMode && challan?.id
        ? await updateChallan(challan.id, payload)
        : await createChallan(payload);
      const saved: ChallanItem = {
        id:            result.id,
        date:          result.challanDate,
        challanNumber: result.challanNo,
        partyName:     result.party?.name || selectedParty?.name || "",
        partyId:       result.partyId,
        amount:        Number(result.totalAmount),
        status:        result.status,
        items:         billItems,
        notes,
        termsAndConditions,
        additionalCharges,
        discountPct,
        discountAmt,
        discountType,
        autoRoundOff,
        roundOffAmt,
        eWayBillNo, challanNoRef, financedBy, salesman, emailId, warrantyPeriod,
        shippingAddress, poNumber, vehicleNo, dispatchedThrough, transportName, customFieldValues,
      };
      onSave(saved);
    } catch (err: any) {
      setSaveError(err.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePartySelect = (p: Party) => {
    setSelectedParty(p);
    if (!shippingAddress) setShippingAddress(`${p.name}\nPhone Number: ${p.mobile}`);
    setShowPartySelector(false);
  };
  const handleCreateNewParty = (p: Party) => { setParties(prev => [...prev, p]); handlePartySelect(p); setShowCreateParty(false); };

  type ExtraField = { kind: "standard"; key: string; label: string; value: string; setter: (v: string) => void }
                 | { kind: "custom"; label: string; defaultVal: string };
  const standardFields: ExtraField[] = [
    ...(det.showEwayBill?[{kind:"standard"as const,key:"eWayBillNo",label:"E-Way Bill No.",value:eWayBillNo,setter:setEWayBillNo}]:[]),
    ...(det.showChallan?[{kind:"standard"as const,key:"challanNoRef",label:"Challan No.",value:challanNoRef,setter:setChallanNoRef}]:[]),
    ...(det.showFinancedBy?[{kind:"standard"as const,key:"financedBy",label:"Financed By",value:financedBy,setter:setFinancedBy}]:[]),
    ...(det.showSalesman?[{kind:"standard"as const,key:"salesman",label:"Salesman",value:salesman,setter:setSalesman}]:[]),
    ...(det.showEmailId?[{kind:"standard"as const,key:"emailId",label:"Email ID",value:emailId,setter:setEmailId}]:[]),
    ...(det.showWarranty?[{kind:"standard"as const,key:"warrantyPeriod",label:"Warranty Period",value:warrantyPeriod,setter:setWarrantyPeriod}]:[]),
    ...(det.showPO?[{kind:"standard"as const,key:"poNumber",label:"PO Number",value:poNumber,setter:setPoNumber}]:[]),
    ...(det.showVehicle?[{kind:"standard"as const,key:"vehicleNo",label:"Vehicle No.",value:vehicleNo,setter:setVehicleNo}]:[]),
    ...(det.showDispatchedThrough?[{kind:"standard"as const,key:"dispatchedThrough",label:"Dispatched Through",value:dispatchedThrough,setter:setDispatchedThrough}]:[]),
    ...(det.showTransportName?[{kind:"standard"as const,key:"transportName",label:"Transport Name",value:transportName,setter:setTransportName}]:[]),
  ];
  const customFieldsList: ExtraField[] = (det.customFields??[]).filter(cf=>cf.label?.trim()!=="").map(cf=>({kind:"custom"as const,label:cf.label,defaultVal:cf.value??""}));
  const allExtraFields: ExtraField[] = [...standardFields,...customFieldsList];
  const extraRows: ExtraField[][] = [];
  for (let i=0;i<allExtraFields.length;i+=4) extraRows.push(allExtraFields.slice(i,i+4));

  const businessName = (() => { try { return JSON.parse(localStorage.getItem("businessInfo")||"{}").name||""; } catch { return ""; } })();

  return (
    <div className="cdc-page">
      <div className="cdc-topnav">
        <div className="cdc-topnav-left">
          <button className="back-btn" onClick={onBack} type="button">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div className="topnav-divider"/>
          <span className="cdc-page-title">{isEditMode ? "Edit Delivery Challan" : "Create Delivery Challan"}</span>
        </div>
        <div className="cdc-topnav-right">
          <button className="cdc-icon-btn" title="Keyboard Shortcuts">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/></svg>
          </button>
          <button className="cdc-settings-btn" onClick={() => setShowSettings(true)}><Settings size={14}/> Settings <span className="notif-dot-sm"/></button>
          <button className="btn-save-new" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save & New"}</button>
          <button className="btn-save-main" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        </div>
      </div>

      {saveError && (
        <div style={{background:"#fee2e2",color:"#dc2626",padding:"10px 20px",fontSize:13,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>⚠ {saveError}</span>
          <button onClick={() => setSaveError(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#dc2626",fontSize:16}}>✕</button>
        </div>
      )}

      <div className="cdc-body">
        <div className={"cdc-top-split" + (selectedParty ? " has-party" : "")}>
          {/* Bill To */}
          <div className="cdc-bill-section">
            <div className="bill-to-header">
              <span>Bill To</span>
              {selectedParty && <button className="change-party-btn" onClick={() => setShowPartySelector(true)}>Change Party</button>}
            </div>
            {!selectedParty ? (
              <div className="party-select-area" ref={partySelectorRef}>
                <div className="add-party-box" onClick={() => setShowPartySelector(true)}><Plus size={14}/> Add Party</div>
                {showPartySelector && <PartySelector parties={parties} loading={partiesLoading} onSelect={handlePartySelect} onCreateParty={() => { setShowPartySelector(false); setShowCreateParty(true); }}/>}
              </div>
            ) : (
              <div className="party-info-box" ref={partySelectorRef}>
                <div className="party-info-name">{selectedParty.name}</div>
                {selectedParty.mobile && <div className="party-info-detail">Phone Number: {selectedParty.mobile}</div>}
                {selectedParty.gstin && <div className="party-info-detail">GSTIN: {selectedParty.gstin}</div>}
                {showPartySelector && <PartySelector parties={parties} loading={partiesLoading} onSelect={handlePartySelect} onCreateParty={() => { setShowPartySelector(false); setShowCreateParty(true); }}/>}
              </div>
            )}
          </div>

          {/* Ship To */}
          {selectedParty && (
            <div className="cdc-ship-section">
              <div className="bill-to-header">
                <span>Ship To</span>
                <button className="change-party-btn" onClick={() => setShowShippingModal(true)}>Change Shipping Address</button>
              </div>
              <div className="party-info-box">
                {shippingAddress
                  ? shippingAddress.split("\n").map((line, i) => <div key={i} className={i === 0 ? "party-info-name" : "party-info-detail"}>{line}</div>)
                  : <div className="party-info-detail" style={{color:"#9ca3af"}}>No shipping address</div>}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="cdc-meta-section">
            <div className="meta-row">
              <div className="meta-field">
                <label>Challan No:</label>
                <input className="meta-input" value={challanNo} readOnly style={{background:"#f9fafb",color:"#6b7280",cursor:"default"}}/>
              </div>
              <div className="meta-field" ref={dateRef}>
                <label>Challan Date:</label>
                <div className="date-trigger" onClick={() => setShowDatePicker(!showDatePicker)}>
                  <Calendar size={13}/><span>{fmtDate(challanDate)}</span><ChevronDown size={12}/>
                </div>
                {showDatePicker && <InlineDatePicker value={challanDate} onChange={setChallanDate} onClose={() => setShowDatePicker(false)}/>}
              </div>
            </div>
            {allExtraFields.length > 0 && (
              <div className="cdc-extra-fields-wrap">
                {extraRows.map((row, ri) => (
                  <div key={ri} className="meta-row-4" style={{gridTemplateColumns:`repeat(${Math.min(row.length,4)},1fr)`}}>
                    {row.map(field => field.kind === "standard" ? (
                      <div className="meta-field" key={field.key}><label>{field.label}:</label><input className="meta-input" value={field.value} onChange={e => field.setter(e.target.value)}/></div>
                    ) : (
                      <div className="meta-field" key={`custom_${field.label}`}><label>{field.label}:</label><input className="meta-input" placeholder={field.defaultVal ? `e.g. ${field.defaultVal}` : `Enter ${field.label}`} value={customFieldValues[field.label]!==undefined?customFieldValues[field.label]:field.defaultVal} onChange={e => setCustomFieldValues(prev=>({...prev,[field.label]:e.target.value}))}/></div>
                    ))}
                    {Array.from({length:(4-row.length)%4}).map((_,i) => <div key={`pad-${ri}-${i}`} className="meta-field"/>)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="cdc-items-section">
          <table className="cdc-items-table">
            <thead>
              <tr>
                <th>NO</th><th>ITEMS / SERVICES</th><th>HSN / SAC</th>
                {showQty && <th>QTY</th>}
                {showPrice && <th>PRICE/ITEM (₹)</th>}
                <th>DISCOUNT</th><th>TAX</th><th>AMOUNT (₹)</th>
                <th><button className="add-col-btn" onClick={() => setShowHideColumns(true)} type="button"><Plus size={14}/></button></th>
              </tr>
            </thead>
            <tbody>
              {billItems.map((item, idx) => (
                <BillItemRow
                  key={item.id} item={item} index={idx}
                  onChange={handleItemChange} onDelete={handleDeleteItem}
                  showPrice={showPrice} showQty={showQty}
                />
              ))}
            </tbody>
          </table>
          <div className="add-item-row">
            <div className="add-item-dashed" onClick={() => setShowAddItems(true)}>+ Add Item</div>
            <div className="scan-barcode-btn" onClick={() => setShowAddItems(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20"><path d="M3 9V5a2 2 0 0 1 2-2h4M3 15v4a2 2 0 0 0 2 2h4M21 9V5a2 2 0 0-2-2h-4M21 15v4a2 2 0 0 1-2 2h-4"/><line x1="7" y1="8" x2="7" y2="16"/><line x1="10" y1="8" x2="10" y2="16"/><line x1="14" y1="8" x2="14" y2="16"/><line x1="17" y1="8" x2="17" y2="16"/></svg>
              Scan Barcode
            </div>
          </div>
          {/* SUBTOTAL row: discount | (unused) | item amounts total */}
          <div className="subtotal-row">
            <span className="subtotal-label">SUBTOTAL</span>
            <span className="subtotal-val">- ₹ {totalItemDisc.toFixed(2)}</span>
            <span className="subtotal-val">₹ {totalItemTax.toFixed(2)}</span>
            <span className="subtotal-val">₹ {subtotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Bottom Split */}
        <div className="cdc-bottom-split">
          <div className="cdc-bottom-left">
            {!showNotes ? <button className="link-action-btn" onClick={() => setShowNotes(true)}>+ Add Notes</button> : (
              <div className="bottom-text-section"><div className="bts-header"><span>Notes</span><button className="bts-close" onClick={() => setShowNotes(false)}>⊗</button></div><textarea className="bts-textarea" value={notes} onChange={e => setNotes(e.target.value)} rows={3}/></div>
            )}
            {!showTerms ? <button className="link-action-btn" onClick={() => setShowTerms(true)}>+ Add Terms and Conditions</button> : (
              <div className="bottom-text-section"><div className="bts-header"><span>Terms and Conditions</span><button className="bts-close" onClick={() => setShowTerms(false)}>⊗</button></div><textarea className="bts-textarea" value={termsAndConditions} onChange={e => setTermsAndConditions(e.target.value)} rows={4}/></div>
            )}
            {selectedBank ? (
              <div className="bank-selected-display">
                <div className="bank-details-title">Bank Details</div>
                <div className="bank-detail-row"><span className="bank-detail-label">Account Number:</span> <strong>{selectedBank.accountNumber}</strong></div>
                {selectedBank.ifscCode && <div className="bank-detail-row"><span className="bank-detail-label">IFSC Code:</span> <strong>{selectedBank.ifscCode}</strong></div>}
                {selectedBank.bankBranchName && <div className="bank-detail-row"><span className="bank-detail-label">Bank &amp; Branch:</span> <strong>{selectedBank.bankBranchName}</strong></div>}
                <div className="bank-selected-actions">
                  <button className="link-action-btn" onClick={() => setShowBankModal(true)}>Change Bank Account</button>
                  <button className="link-action-btn link-action-btn--danger" onClick={() => setSelectedBank(null)}>Remove Bank Account</button>
                </div>
              </div>
            ) : <button className="link-action-btn" onClick={() => setShowAddBankModal(true)}>+ Add Bank Account</button>}
          </div>

          {/* Summary panel */}
          <div className="cdc-summary">
            {showAdditionalCharges && additionalCharges.map((charge, i) => (
              <div key={charge.id} className="charge-row">
                <input className="charge-label-input" placeholder="Enter charge (ex. Transport Charge)" value={charge.label} onChange={e => setAdditionalCharges(prev=>prev.map((c,ci)=>ci===i?{...c,label:e.target.value}:c))}/>
                <div className="charge-amount-area">
                  <span>₹</span>
                  <input className="charge-amount-input" type="number" value={charge.amount} onChange={e => setAdditionalCharges(prev=>prev.map((c,ci)=>ci===i?{...c,amount:Number(e.target.value)}:c))}/>
                  <div className="charge-tax-wrapper">
                    <select className="charge-tax-select" value={charge.tax} onChange={e => setAdditionalCharges(prev=>prev.map((c,ci)=>ci===i?{...c,tax:e.target.value}:c))}>
                      <option>No Tax Applicable</option><option>GST 5%</option><option>GST 12%</option><option>GST 18%</option>
                    </select>
                  </div>
                  <button className="charge-remove" onClick={() => setAdditionalCharges(prev=>prev.filter((_,ci)=>ci!==i))}>⊗</button>
                </div>
              </div>
            ))}
            <div className="summary-line">
              <button className="link-action-btn summary-link" onClick={handleAddCharge}>
                {showAdditionalCharges && additionalCharges.length > 0 ? "+ Add Another Charge" : "+ Add Additional Charges"}
              </button>
              <span className="summary-val">₹ {chargesSum.toFixed(2)}</span>
            </div>
            <div className="summary-line"><span>Taxable Amount</span><span className="summary-val">₹ {taxableAmount.toFixed(2)}</span></div>
            {showDiscount ? (
              <div className="discount-row">
                <div className="discount-type-wrapper">
                  <button className="discount-type-btn" onClick={() => setShowDiscountMenu(!showDiscountMenu)}>
                    Discount {discountType} <ChevronDown size={12}/>
                  </button>
                  {showDiscountMenu && (
                    <div className="discount-menu">
                      <div className={discountType==="Before Tax"?"discount-menu-active":""} onClick={() => { setDiscountType("Before Tax"); setShowDiscountMenu(false); }}>Discount Before Tax</div>
                      <div className={discountType==="After Tax"?"discount-menu-active":""} onClick={() => { setDiscountType("After Tax"); setShowDiscountMenu(false); }}>Discount After Tax</div>
                    </div>
                  )}
                </div>
                <div className="discount-inputs-summary">
                  <span className="disc-pct-label">%</span>
                  <input type="number" min="0" max="100" className="disc-pct-input" value={discountPct} onChange={e => handleDiscountPctChange(Number(e.target.value))}/>
                  <span className="disc-sep">/</span>
                  <span className="disc-cur">₹</span>
                  <input type="number" min="0" className="disc-amt-input" value={discountAmt} onChange={e => handleDiscountAmtChange(Number(e.target.value))}/>
                  <button className="disc-remove" onClick={() => { setShowDiscount(false); setDiscountPct(0); setDiscountAmt(0); }}>⊗</button>
                </div>
              </div>
            ) : (
              <div className="summary-line">
                <button className="link-action-btn summary-link" onClick={() => setShowDiscount(true)}>+ Add Discount</button>
                <span className="summary-val summary-discount-val">- ₹ {effectiveDiscount.toFixed(2)}</span>
              </div>
            )}
            {showDiscount && effectiveDiscount > 0 && (
              <div className="summary-line discount-val"><span></span><span>- ₹ {effectiveDiscount.toFixed(2)}</span></div>
            )}
            <div className="roundoff-section">
              <div className="roundoff-row">
                <label className="check-label">
                  <input type="checkbox" checked={autoRoundOff} onChange={e => setAutoRoundOff(e.target.checked)}/> Auto Round Off
                </label>
                <div className="roundoff-right">
                  <div className="roundoff-type-wrap">
                    <button className="roundoff-add-btn" onClick={() => setShowRoundOffMenu(!showRoundOffMenu)}>
                      {roundOffType} <ChevronDown size={12}/>
                    </button>
                    {showRoundOffMenu && (
                      <div className="roundoff-menu">
                        <div onClick={() => { setRoundOffType("+ Add"); setShowRoundOffMenu(false); }}>+ Add</div>
                        <div onClick={() => { setRoundOffType("Reduce"); setShowRoundOffMenu(false); }}>− Reduce</div>
                      </div>
                    )}
                  </div>
                  <span className="roundoff-currency">₹</span>
                  <input className="roundoff-input" type="number" value={roundOffAmt} onChange={e => setRoundOffAmt(Number(e.target.value))}/>
                </div>
              </div>
            </div>
            <div className="summary-total-row">
              <span className="total-label">Total Amount</span>
              <span className="total-value">₹ {totalAmount.toFixed(2)}</span>
            </div>
            <SignatorySection businessName={businessName}/>
          </div>
        </div>
      </div>

      {showCreateParty   && <CreatePartyModal onSave={handleCreateNewParty} onClose={() => setShowCreateParty(false)}/>}
      {showShippingModal && selectedParty && <ChangeShippingModal partyName={selectedParty.name} addresses={[selectedParty.billingAddress||"",selectedParty.shippingAddress||""].filter(Boolean)} onDone={addr => { setShippingAddress(addr); setShowShippingModal(false); }} onClose={() => setShowShippingModal(false)}/>}
      {showAddItems      && <AddItemsModal onAddItems={handleAddItemsFromModal} onClose={() => setShowAddItems(false)}/>}
      {showHideColumns   && <ShowHideColumnsModal showPrice={showPrice} showQty={showQty} onSave={(p,q) => { setShowPrice(p); setShowQty(q); }} onClose={() => setShowHideColumns(false)}/>}
      {showBankModal     && <SelectBankModal onClose={() => setShowBankModal(false)} onAdd={() => { setShowBankModal(false); setShowAddBankModal(true); }} onSelect={b => setSelectedBank(b)}/>}
      {showAddBankModal  && <AddBankModal onClose={() => setShowAddBankModal(false)} onSaved={b => { setSelectedBank(b); setShowAddBankModal(false); }}/>}
      {showSettings      && <QuickSettingsModal settings={settings} onSave={() => {}} onClose={() => setShowSettings(false)}/>}
    </div>
  );
}