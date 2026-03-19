import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, ChevronDown, Settings, Plus, Trash2, X, Search, Barcode } from "lucide-react";
import { ChallanItem, BillItem, AdditionalCharge, SettingsState } from "./DeliveryChallanmodel";
import "./Createdeliverychallan.css";

// ─── Types ─────────────────────────────────────────────────────────────────────
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
  stock?: string;
  salesPrice: number;
  purchasePrice?: number;
  unit?: string;
  hsn?: string;
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
  nextNumber: number;
  settings: SettingsState;
  onSave: (c: ChallanItem) => void;
  onBack: () => void;
  isEditMode: boolean;
}

// ─── Sample Items DB ───────────────────────────────────────────────────────────
const SAMPLE_ITEMS: ItemData[] = [
  { id: 1, name: "BILLING SOFTWARE MOBILE APP", salesPrice: 256, unit: "PCS" },
  { id: 2, name: "BILLING SOFTWARE WITH GST", salesPrice: 369875, unit: "PCS" },
  { id: 3, name: "BILLING SOFTWARE WITHOUT GST", salesPrice: 3556, unit: "PCS" },
  { id: 4, name: "GODREJ FRIDGE", itemCode: "34567", stock: "144 ACS", salesPrice: 42000, purchasePrice: 0, unit: "ACS" },
  { id: 5, name: "HERIER AC", itemCode: "1234", stock: "94 PCS", salesPrice: 45000, purchasePrice: 38000, unit: "PCS" },
  { id: 6, name: "HISENSE 32 INCH", stock: "39 PCS", salesPrice: 21000, purchasePrice: 18000, unit: "PCS" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split("T")[0];
const fmtDate = (s: string) => {
  const d = new Date(s);
  return `${String(d.getDate()).padStart(2,"0")} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]} ${d.getFullYear()}`;
};

// ─── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`cdc-toggle${value ? " cdc-toggle--on" : ""}`}
      onClick={() => onChange(!value)}
      role="switch"
      type="button"
    >
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
function PartySelector({ parties, onSelect, onCreateParty }: { parties: Party[]; onSelect: (p: Party) => void; onCreateParty: () => void }) {
  const [search, setSearch] = useState("");
  const filtered = parties.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="party-selector-dropdown">
      <div className="party-search-box">
        <input autoFocus placeholder="Search party by name or number" value={search} onChange={e => setSearch(e.target.value)} />
        <ChevronDown size={14} />
      </div>
      <div className="party-list-header"><span>Party Name</span><span>Balance</span></div>
      <div className="party-list">
        {filtered.map(p => (
          <div key={p.id} className="party-list-item" onClick={() => onSelect(p)}>
            <span>{p.name}</span>
            <span className="party-balance">
              ₹ {Math.abs(p.balance || 0).toLocaleString()}
              {(p.balance || 0) < 0 && <span className="bal-up">↑</span>}
              {(p.balance || 0) > 0 && <span className="bal-down">↓</span>}
            </span>
          </div>
        ))}
      </div>
      <div className="party-create-btn" onClick={onCreateParty}>+ Create Party</div>
    </div>
  );
}

// ─── Create New Party Modal ────────────────────────────────────────────────────
function CreatePartyModal({ onSave, onClose }: { onSave: (p: Party) => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [showAddress, setShowAddress] = useState(false);
  const [showGstin, setShowGstin] = useState(false);
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [gstin, setGstin] = useState("");
  const [nameErr, setNameErr] = useState(false);

  const handleSave = () => {
    if (!name.trim()) { setNameErr(true); return; }
    const newParty: Party = { id: Date.now(), name: name.trim(), mobile, balance: 0, billingAddress: showAddress ? `${address}, ${city}, ${state} - ${pincode}` : "", gstin: showGstin ? gstin : "" };
    const stored = JSON.parse(localStorage.getItem("parties") || "[]");
    stored.push({ ...newParty, type: "Customer", category: "-" });
    localStorage.setItem("parties", JSON.stringify(stored));
    onSave(newParty);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cdc-modal" style={{ maxWidth: 500 }}>
        <div className="cdc-modal-header"><h2>Create New Party</h2><button onClick={onClose}><X size={18} /></button></div>
        <div className="cdc-modal-body">
          <div className="cdc-field"><label>Party Name <span className="req">*</span></label><input className={`cdc-input${nameErr?" error":""}`} placeholder="Enter name" value={name} onChange={e => { setName(e.target.value); setNameErr(false); }} />{nameErr && <span className="field-err">This field is mandatory</span>}</div>
          <div className="cdc-field"><label>Mobile Number</label><input className="cdc-input" placeholder="Enter Mobile Number" value={mobile} onChange={e => setMobile(e.target.value)} /></div>
          {!showAddress ? <button className="link-btn" onClick={() => setShowAddress(true)}>+ Add Address (Optional)</button> : (
            <div className="optional-section">
              <div className="optional-section-header"><span>Address (Optional)</span><button className="link-btn-sm" onClick={() => setShowAddress(false)}>Remove</button></div>
              <div className="cdc-field"><label>BILLING ADDRESS <span className="req">*</span></label><textarea className="cdc-textarea" placeholder="Enter billing address" value={address} onChange={e => setAddress(e.target.value)} rows={3} /></div>
              <div className="cdc-row-2">
                <div className="cdc-field"><label>STATE</label><input className="cdc-input" placeholder="Enter State" value={state} onChange={e => setState(e.target.value)} /></div>
                <div className="cdc-field"><label>PINCODE</label><input className="cdc-input" placeholder="Enter Pincode" value={pincode} onChange={e => setPincode(e.target.value)} /></div>
              </div>
              <div className="cdc-field"><label>CITY</label><input className="cdc-input" placeholder="Enter City" value={city} onChange={e => setCity(e.target.value)} /></div>
              <label className="check-label"><input type="checkbox" checked={sameAsBilling} onChange={e => setSameAsBilling(e.target.checked)} /> Shipping address same as billing address</label>
            </div>
          )}
          {!showGstin ? <button className="link-btn" onClick={() => setShowGstin(true)}>+ Add GSTIN (Optional)</button> : (
            <div className="optional-section">
              <div className="optional-section-header"><span>GSTIN (Optional)</span><button className="link-btn-sm" onClick={() => setShowGstin(false)}>Remove</button></div>
              <div className="cdc-field"><label>GSTIN</label><input className="cdc-input" placeholder="ex: 29XXXXX9438X1XX" value={gstin} onChange={e => setGstin(e.target.value)} /></div>
            </div>
          )}
          <div className="party-settings-note">You can add Custom Fields from <span className="link-text">Party Settings</span></div>
        </div>
        <div className="cdc-modal-footer"><button className="btn-secondary-sm" onClick={onClose}>Cancel</button><button className="btn-primary-sm" onClick={handleSave}>Save</button></div>
      </div>
    </div>
  );
}

// ─── Change Shipping Address Modal ────────────────────────────────────────────
function ChangeShippingModal({ partyName, addresses, onDone, onClose }: { partyName: string; addresses: string[]; onDone: (addr: string) => void; onClose: () => void }) {
  const [selected, setSelected] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState(partyName);
  const [newStreet, setNewStreet] = useState("");
  const [newState, setNewState] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newCity, setNewCity] = useState("");

  if (showAddForm) {
    return (
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="cdc-modal" style={{ maxWidth: 480 }}>
          <div className="cdc-modal-header"><h2>Add Shipping Address</h2><button onClick={onClose}><X size={18} /></button></div>
          <div className="cdc-modal-body">
            <div className="cdc-field"><label>Shipping Name <span className="req">*</span></label><input className="cdc-input" value={newName} onChange={e => setNewName(e.target.value)} /></div>
            <div className="cdc-field"><label>Street Address <span className="req">*</span></label><textarea className="cdc-textarea" placeholder="Enter Street Address" value={newStreet} onChange={e => setNewStreet(e.target.value)} rows={3} /></div>
            <div className="cdc-row-2"><div className="cdc-field"><label>State</label><input className="cdc-input" placeholder="Enter State" value={newState} onChange={e => setNewState(e.target.value)} /></div><div className="cdc-field"><label>Pincode</label><input className="cdc-input" placeholder="Enter pin code" value={newPin} onChange={e => setNewPin(e.target.value)} /></div></div>
            <div className="cdc-field"><label>City</label><input className="cdc-input" placeholder="Enter City" value={newCity} onChange={e => setNewCity(e.target.value)} /></div>
          </div>
          <div className="cdc-modal-footer"><button className="btn-secondary-sm" onClick={() => setShowAddForm(false)}>Cancel</button><button className="btn-primary-sm" onClick={() => onDone(`${newName}, ${newStreet}, ${newCity}, ${newState} - ${newPin}`)}>Save</button></div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cdc-modal" style={{ maxWidth: 480 }}>
        <div className="cdc-modal-header"><h2>Change Shipping Address</h2><button onClick={onClose}><X size={18} /></button></div>
        <div className="cdc-modal-body" style={{ padding: 0 }}>
          <div className="ship-addr-table-header"><span>Address</span><span>Edit</span><span>Select</span></div>
          {addresses.map((addr, i) => (
            <div key={i} className="ship-addr-row">
              <div><div className="ship-addr-name">{partyName}</div><div className="ship-addr-text">{addr || "No Address"}</div></div>
              <button className="ship-edit-btn">✏</button>
              <input type="radio" checked={selected === i} onChange={() => setSelected(i)} />
            </div>
          ))}
          <div className="ship-add-new" onClick={() => setShowAddForm(true)}>+ Add New Shipping Address</div>
        </div>
        <div className="cdc-modal-footer"><button className="btn-secondary-sm" onClick={onClose}>Cancel</button><button className="btn-primary-sm" onClick={() => onDone(addresses[selected] || "")}>Done</button></div>
      </div>
    </div>
  );
}

// ─── Add Items Modal ───────────────────────────────────────────────────────────
function AddItemsModal({ onAddItems, onClose, onCreateItem }: { onAddItems: (items: { item: ItemData; qty: number }[]) => void; onClose: () => void; onCreateItem: () => void }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [category, setCategory] = useState("");
  const filtered = SAMPLE_ITEMS.filter(item => item.name.toLowerCase().includes(search.toLowerCase()) || (item.itemCode || "").includes(search));
  const totalSelected = Object.values(quantities).filter(q => q > 0).length;
  const handleAdd = () => { const sel = filtered.filter(item => (quantities[item.id] || 0) > 0).map(item => ({ item, qty: quantities[item.id] })); onAddItems(sel); };
  const setQty = (id: number, qty: number) => setQuantities(prev => ({ ...prev, [id]: Math.max(0, qty) }));
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="add-items-modal">
        <div className="aim-header"><h2>Add Items to Bill</h2><button onClick={onClose}><X size={18} /></button></div>
        <div className="aim-toolbar">
          <div className="aim-search"><Search size={14}/><input placeholder="Search by Item/ Serial no./ HSN code/ SKU/ Custom Field / Category" value={search} onChange={e => setSearch(e.target.value)} /><Barcode size={18} className="barcode-icon"/></div>
          <div className="aim-category"><select value={category} onChange={e => setCategory(e.target.value)}><option value="">Select Category</option></select></div>
          <button className="btn-primary-sm aim-create" onClick={() => navigate("/cashier/create-item")}>Create New Item</button>
        </div>
        <div className="aim-table-wrapper">
          <table className="aim-table">
            <thead><tr><th>Item Name</th><th>Item Code</th><th>Stock</th><th>Sales Price</th><th>Purchase Price</th><th>Quantity</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (<tr><td colSpan={6} className="aim-empty">Scan items to add them to your invoice</td></tr>) : filtered.map(item => (
                <tr key={item.id}>
                  <td className="aim-item-name">{item.name}</td>
                  <td>{item.itemCode || "-"}</td>
                  <td>{item.stock || "-"}</td>
                  <td>₹{item.salesPrice.toLocaleString()}</td>
                  <td>{item.purchasePrice !== undefined ? `₹${item.purchasePrice.toLocaleString()}` : "-"}</td>
                  <td>
                    {(quantities[item.id] || 0) > 0 ? (
                      <div className="qty-control">
                        <button onClick={() => setQty(item.id, (quantities[item.id] || 0) - 1)}>−</button>
                        <span>{quantities[item.id]}</span>
                        <button onClick={() => setQty(item.id, (quantities[item.id] || 0) + 1)}>+</button>
                        <span className="qty-unit">{item.unit || "PCS"}</span>
                      </div>
                    ) : (
                      <button className="aim-add-btn" onClick={() => setQty(item.id, 1)}>+ Add</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="aim-footer">
          <div className="aim-shortcuts"><span>Keyboard Shortcuts :</span><span>Change Quantity <kbd>Enter</kbd></span><span>Move between items <kbd>↑</kbd><kbd>↓</kbd></span></div>
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
  const [price, setPrice] = useState(showPrice);
  const [qty, setQty] = useState(showQty);
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cdc-modal" style={{ maxWidth: 460 }}>
        <div className="cdc-modal-header"><h2>Show/Hide Columns in Invoice</h2><button onClick={onClose}><X size={18} /></button></div>
        <div className="cdc-modal-body">
          <div className="shc-row"><span>Price/Item (₹)</span><Toggle value={price} onChange={setPrice} /></div>
          <div className="shc-row"><span>Quantity</span><Toggle value={qty} onChange={setQty} /></div>
          <div className="shc-divider">CUSTOM COLUMN</div>
          <div className="shc-empty-custom"><p>No Custom Columns added</p><p>Any custom column such as Batch # &amp; Expiry Date can be added</p></div>
          <div className="shc-note">To add Custom Item Columns - Go to <strong >Item settings</strong> from <span className="link-text" onClick={() => { onClose(); navigate("/cashier/create-item/inventory"); }}>Items page (click here)</span></div>
        </div>
        <div className="cdc-modal-footer"><button className="btn-secondary-sm" onClick={onClose}>Cancel</button><button className="btn-primary-sm" onClick={() => { onSave(price, qty); onClose(); }}>Save</button></div>
      </div>
    </div>
  );
}

// ─── Select Bank Account Modal ─────────────────────────────────────────────────
function SelectBankModal({ onClose, onAdd, onSelect }: { onClose: () => void; onAdd: () => void; onSelect: (b: BankAccount) => void }) {
  const [banks, setBanks] = useState<BankAccount[]>(() => { try { return JSON.parse(localStorage.getItem("bankAccounts") || "[]"); } catch { return []; } });
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cdc-modal" style={{ maxWidth: 420 }}>
        <div className="cdc-modal-header"><h2>Select Bank Accounts</h2><button onClick={onClose}><X size={18} /></button></div>
        <div className="cdc-modal-body">
          {banks.length === 0 ? (
            <p style={{ textAlign: "center", color: "#6b7280", padding: "16px 0" }}>No bank accounts added yet.<br/><button className="link-btn" style={{ marginTop: 8 }} onClick={onAdd}>+ Add Bank Account</button></p>
          ) : banks.map((b, i) => (
            <div key={i} className={`bank-select-row${selected===i?" selected":""}`} onClick={() => setSelected(i)}>
              <div className="bank-logo-icon">🏦</div>
              <div className="bank-info">
                <div className="bank-name">{b.bankBranchName || "Bank"}</div>
                <div className="bank-acc">ACC No: {b.accountNumber}</div>
              </div>
              <div className="bank-right">
                <div className="bank-ifsc">IFSC: {b.ifscCode || "-"}</div>
              </div>
              <input type="radio" checked={selected === i} onChange={() => setSelected(i)} />
            </div>
          ))}
          {banks.length > 0 && (
            <button className="link-btn" style={{ marginTop: 12 }} onClick={onAdd}>+ Add Bank Account</button>
          )}
        </div>
        <div className="cdc-modal-footer">
          <button className="btn-secondary-sm" onClick={onClose}>Cancel</button>
          <button className="btn-primary-sm" onClick={() => { if (selected !== null) onSelect(banks[selected]); onClose(); }}>DONE</button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Bank Account Modal ────────────────────────────────────────────────────
function AddBankModal({ onClose, onSaved }: { onClose: () => void; onSaved: (b: BankAccount) => void }) {
  const [form, setForm] = useState({ accountNumber: "", reEnter: "", ifscCode: "", bankBranchName: "", accountHolderName: "", upiId: "" });
  const [err, setErr] = useState("");
  const handleSubmit = () => {
    if (!form.accountNumber) { setErr("Account number is required"); return; }
    if (form.accountNumber !== form.reEnter) { setErr("Account numbers don't match"); return; }
    const newBank: BankAccount = { id: Date.now(), ...form };
    const stored = JSON.parse(localStorage.getItem("bankAccounts") || "[]");
    stored.push(newBank);
    localStorage.setItem("bankAccounts", JSON.stringify(stored));
    onSaved(newBank);
  };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cdc-modal" style={{ maxWidth: 480 }}>
        <div className="cdc-modal-header"><h2>Add Bank Account</h2><button onClick={onClose}><X size={18} /></button></div>
        <div className="cdc-modal-body">
          {err && <div className="field-err" style={{ marginBottom: 12 }}>{err}</div>}
          <div className="cdc-row-2">
            <div className="cdc-field"><label>Bank Account Number <span className="req">*</span></label><input className="cdc-input" placeholder="ex: 123456789" value={form.accountNumber} onChange={e => setForm(p => ({ ...p, accountNumber: e.target.value }))} /></div>
            <div className="cdc-field"><label>Re-Enter Bank Account Number <span className="req">*</span></label><input className="cdc-input" placeholder="ex: 123456789" value={form.reEnter} onChange={e => setForm(p => ({ ...p, reEnter: e.target.value }))} /></div>
          </div>
          <div className="cdc-row-2">
            <div className="cdc-field"><label>IFSC Code</label><input className="cdc-input" placeholder="ex: ICIC0001234" value={form.ifscCode} onChange={e => setForm(p => ({ ...p, ifscCode: e.target.value }))} /></div>
            <div className="cdc-field"><label>Bank &amp; Branch Name</label><input className="cdc-input" placeholder="ex: ICICI Bank, Mumbai" value={form.bankBranchName} onChange={e => setForm(p => ({ ...p, bankBranchName: e.target.value }))} /></div>
          </div>
          <div className="cdc-row-2">
            <div className="cdc-field"><label>Account Holder's Name</label><input className="cdc-input" placeholder="ex: Babu Lal" value={form.accountHolderName} onChange={e => setForm(p => ({ ...p, accountHolderName: e.target.value }))} /></div>
            <div className="cdc-field"><label>UPI ID</label><input className="cdc-input" placeholder="ex: babulal@upi" value={form.upiId} onChange={e => setForm(p => ({ ...p, upiId: e.target.value }))} /></div>
          </div>
        </div>
        <div className="cdc-modal-footer"><button className="btn-secondary-sm" onClick={onClose}>Cancel</button><button className="btn-primary-sm" onClick={handleSubmit}>Submit</button></div>
      </div>
    </div>
  );
}

// ─── Quick Settings Modal ──────────────────────────────────────────────────────
function QuickSettingsModal({ settings, onSave, onClose }: { settings: SettingsState; onSave: (s: SettingsState) => void; onClose: () => void }) {
  const [local, setLocal] = useState({ ...settings });
  const upd = <K extends keyof SettingsState>(k: K, v: SettingsState[K]) => setLocal(p => ({ ...p, [k]: v }));
  const num = local.prefixEnabled ? `${local.prefix}${local.sequenceNumber}` : `${local.sequenceNumber}`;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cdc-modal" style={{ maxWidth: 520 }}>
        <div className="cdc-modal-header"><h2>Quick Delivery Challan Settings</h2><button onClick={onClose}><X size={18} /></button></div>
        <div className="cdc-modal-body">
          <div className="settings-card"><div className="settings-card-header"><div><div className="settings-title">Delivery Challan Prefix &amp; Sequence Number</div><div className="settings-desc">Add your custom prefix &amp; sequence for Delivery Challan Numbering</div></div><Toggle value={local.prefixEnabled} onChange={v => upd("prefixEnabled", v)}/></div>
            {local.prefixEnabled && (<div className="settings-fields"><div className="cdc-field"><label>Prefix</label><input className="cdc-input" placeholder="Prefix" value={local.prefix} onChange={e => upd("prefix", e.target.value)}/></div><div className="cdc-field"><label>Sequence Number</label><input className="cdc-input" type="number" value={local.sequenceNumber} onChange={e => upd("sequenceNumber", Number(e.target.value))}/></div></div>)}
            {local.prefixEnabled && <div className="challan-num-preview">Delivery Challan Number: {num}</div>}
          </div>
          <div className="settings-card"><div className="settings-card-header"><div><div className="settings-title">Show Item Image on Invoice</div><div className="settings-desc">This will apply to all vouchers except for Payment In and Payment Out</div></div><Toggle value={local.showItemImage} onChange={v => upd("showItemImage", v)}/></div></div>
          <div className="settings-card"><div className="settings-card-header"><div><div className="settings-title">Price History <span className="badge-new">New</span></div><div className="settings-desc">Show last 5 sales / purchase prices of the item for the selected party in invoice</div></div><Toggle value={local.priceHistory} onChange={v => upd("priceHistory", v)}/></div></div>
        </div>
        <div className="cdc-modal-footer"><button className="btn-secondary-sm" onClick={onClose}>Cancel</button><button className="btn-primary-sm" onClick={() => { onSave(local); onClose(); }}>Save</button></div>
      </div>
    </div>
  );
}

// ─── Bill Item Row ─────────────────────────────────────────────────────────────
function BillItemRow({ item, index, onChange, onDelete, showPrice, showQty }: {
  item: BillItem; index: number;
  onChange: (id: number, updates: Partial<BillItem>) => void;
  onDelete: (id: number) => void;
  showPrice: boolean; showQty: boolean;
}) {
  const [editingAmount, setEditingAmount] = useState(false);

  const recalcAmount = (updates: Partial<BillItem>, base: BillItem): number => {
    const qty = updates.qty !== undefined ? updates.qty : base.qty;
    const price = updates.pricePerItem !== undefined ? updates.pricePerItem : base.pricePerItem;
    const discPct = updates.discount?.percent !== undefined ? updates.discount.percent : base.discount.percent;
    const discAmt = updates.discount?.amount !== undefined ? updates.discount.amount : base.discount.amount;
    const raw = qty * price;
    const afterDisc = raw - (raw * discPct / 100) - discAmt;
    const taxRate = updates.taxRate !== undefined ? updates.taxRate : base.taxRate;
    return Math.max(0, afterDisc + afterDisc * taxRate / 100);
  };

  const raw = item.qty * item.pricePerItem;

  // % → auto ₹
  const handleDiscPct = (percent: number) => {
    const amount = parseFloat((raw * percent / 100).toFixed(2));
    const disc = { percent, amount };
    onChange(item.id, { discount: disc, amount: recalcAmount({ discount: disc }, item) });
  };

  // ₹ → auto %
  const handleDiscAmt = (amount: number) => {
    const percent = raw > 0 ? parseFloat(((amount / raw) * 100).toFixed(2)) : 0;
    const disc = { percent, amount };
    onChange(item.id, { discount: disc, amount: recalcAmount({ discount: disc }, item) });
  };

  return (
    <tr className="bill-item-row">
      <td className="td-no">{index + 1}</td>
      <td className="td-name">
        <div className="bill-item-name">{item.name}</div>
        <input className="bill-item-desc" placeholder="Enter Description (optional)" value={item.description || ""} onChange={e => onChange(item.id, { description: e.target.value })} />
      </td>
      <td><input className="bill-mini-input bill-hsn-input" placeholder="—" value={item.hsnSac || ""} onChange={e => onChange(item.id, { hsnSac: e.target.value })} /></td>
      {showQty && (
        <td>
          <div className="qty-display">
            <input className="bill-mini-input qty-in" type="number" min="0" value={item.qty}
              onChange={e => { const qty = Number(e.target.value); onChange(item.id, { qty, amount: recalcAmount({ qty }, item) }); }} />
            <span className="qty-unit-badge">{item.unit}</span>
          </div>
        </td>
      )}
      {showPrice && (
        <td>
          <input className="bill-mini-input bill-price-input" type="number" min="0" value={item.pricePerItem}
            onChange={e => { const pricePerItem = Number(e.target.value); onChange(item.id, { pricePerItem, amount: recalcAmount({ pricePerItem }, item) }); }} />
        </td>
      )}
      <td>
        <div className="discount-inputs">
          <div className="disc-row">
            <span className="disc-label">%</span>
            <input className="bill-mini-input" type="number" min="0" max="100" value={item.discount.percent}
              onChange={e => handleDiscPct(Number(e.target.value))} />
          </div>
          <div className="disc-row">
            <span className="disc-label">₹</span>
            <input className="bill-mini-input" type="number" min="0" value={item.discount.amount}
              onChange={e => handleDiscAmt(Number(e.target.value))} />
          </div>
        </div>
      </td>
      <td>
        <div className="tax-cell">
          <select className="tax-select" value={item.tax}
            onChange={e => {
              const tax = e.target.value;
              const taxRate = tax === "None" ? 0 : tax === "GST 5%" ? 5 : tax === "GST 12%" ? 12 : tax === "GST 18%" ? 18 : 28;
              onChange(item.id, { tax, taxRate, amount: recalcAmount({ taxRate }, item) });
            }}>
            <option>None</option><option>GST 5%</option><option>GST 12%</option><option>GST 18%</option><option>GST 28%</option>
          </select>
          <span className="tax-sub">(₹ {(item.qty * item.pricePerItem * item.taxRate / 100).toFixed(0)})</span>
        </div>
      </td>
      <td onClick={() => setEditingAmount(true)} className="td-amount-cell">
        {editingAmount ? (
          <div className="amount-cell">
            <span className="amount-currency">₹</span>
            <input
              className="bill-mini-input amount-edit-input"
              type="number"
              autoFocus
              value={item.amount}
              onChange={e => onChange(item.id, { amount: Number(e.target.value) })}
              onBlur={() => setEditingAmount(false)}
            />
          </div>
        ) : (
          <div className="amount-cell amount-cell--clickable">
            <span className="amount-currency">₹</span>
            <span className="amount-val">{item.amount.toFixed(0)}</span>
          </div>
        )}
      </td>
      <td><button className="delete-row-btn" onClick={() => onDelete(item.id)}><Trash2 size={14} /></button></td>
    </tr>
  );
}

// ─── Main Create Delivery Challan ──────────────────────────────────────────────
export default function CreateDeliveryChallan({ challan, nextNumber, settings, onSave, onBack, isEditMode }: Props) {
  const loadParties = (): Party[] => {
    try {
      const stored = JSON.parse(localStorage.getItem("parties") || "[]");
      return stored.map((p: any) => ({ id: p.id, name: p.name, mobile: p.mobile || "-", balance: p.balance || 0, billingAddress: p.billingAddress || "", shippingAddress: p.shippingAddress || "" }));
    } catch { return []; }
  };

  const [parties, setParties] = useState<Party[]>(loadParties);
  const [selectedParty, setSelectedParty] = useState<Party | null>(() => {
    if (challan?.partyId) { const p = loadParties().find(x => x.id === challan.partyId); return p || null; }
    return null;
  });
  const [showPartySelector, setShowPartySelector] = useState(false);
  const [showCreateParty, setShowCreateParty] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(challan?.shippingAddress || "");
  const [showShippingModal, setShowShippingModal] = useState(false);

  const [challanNo, setChallanNo] = useState(challan?.challanNumber || nextNumber);
  const [challanDate, setChallanDate] = useState(challan?.date || todayStr());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [eWayBillNo, setEWayBillNo] = useState(challan?.eWayBillNo || "");
  const [challanNoRef, setChallanNoRef] = useState(challan?.challanNoRef || "");
  const [financedBy, setFinancedBy] = useState(challan?.financedBy || "");
  const [salesman, setSalesman] = useState(challan?.salesman || "");
  const [emailId, setEmailId] = useState(challan?.emailId || "");
  const [warrantyPeriod, setWarrantyPeriod] = useState(challan?.warrantyPeriod || "");

  const [billItems, setBillItems] = useState<BillItem[]>(challan?.items || []);
  const [showAddItems, setShowAddItems] = useState(false);
  const [showHideColumns, setShowHideColumns] = useState(false);
  const [showPrice, setShowPrice] = useState(true);
  const [showQty, setShowQty] = useState(true);

  const [notes, setNotes] = useState(challan?.notes || "");
  const [termsAndConditions, setTermsAndConditions] = useState(challan?.termsAndConditions || "1. Goods once sold will not be taken back or exchanged\n2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only");
  const [showNotes, setShowNotes] = useState(!!challan?.notes);
  const [showTerms, setShowTerms] = useState(true);

  const [additionalCharges, setAdditionalCharges] = useState<AdditionalCharge[]>(challan?.additionalCharges || []);
  const [showAdditionalCharges, setShowAdditionalCharges] = useState((challan?.additionalCharges?.length || 0) > 0);

  // Discount state: both % and ₹ amount, plus type
  const [discountType, setDiscountType] = useState<"After Tax" | "Before Tax">(challan?.discountType || "After Tax");
  const [discountPct, setDiscountPct] = useState(challan?.discountPct || 0);
  const [discountAmt, setDiscountAmt] = useState(challan?.discountAmt || 0);
  const [showDiscount, setShowDiscount] = useState(!!(challan?.discountPct || challan?.discountAmt));
  const [showDiscountMenu, setShowDiscountMenu] = useState(false);

  const [autoRoundOff, setAutoRoundOff] = useState(challan?.autoRoundOff || false);
  const [roundOffAmt, setRoundOffAmt] = useState(challan?.roundOffAmt || 0);
  const [roundOffType, setRoundOffType] = useState<"+ Add" | "Reduce">("+ Add");
  const [showRoundOffMenu, setShowRoundOffMenu] = useState(false);

  // Bank account
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [showPaymentInput, setShowPaymentInput] = useState(false);

  const dateRef = useRef<HTMLDivElement>(null);
  const partySelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) setShowDatePicker(false);
      if (partySelectorRef.current && !partySelectorRef.current.contains(e.target as Node)) setShowPartySelector(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Calculations
  const subtotal = billItems.reduce((s, i) => s + i.qty * i.pricePerItem, 0);
  const totalDiscountItems = billItems.reduce((s, i) => s + (i.qty * i.pricePerItem * i.discount.percent / 100) + i.discount.amount, 0);
  const taxableBase = subtotal - totalDiscountItems + additionalCharges.reduce((s, c) => s + c.amount, 0);
  const taxableAmount = taxableBase;

  // Discount value
  const discValueFromPct = taxableAmount * discountPct / 100;
  const effectiveDiscount = showDiscount ? (discountPct > 0 ? discValueFromPct : discountAmt) : 0;

  const totalAmount = taxableAmount - effectiveDiscount + (autoRoundOff ? (roundOffType === "Reduce" ? -roundOffAmt : roundOffAmt) : 0);

  // Summary discount: % → auto ₹, ₹ → auto %
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

  const handleAddItemsFromModal = (selected: { item: ItemData; qty: number }[]) => {
    const newItems: BillItem[] = selected.map(({ item, qty }) => ({
      id: Date.now() + Math.random(),
      name: item.name,
      hsnSac: item.hsn || "",
      qty,
      unit: item.unit || "PCS",
      pricePerItem: item.salesPrice,
      discount: { percent: 0, amount: 0 },
      tax: "None",
      taxRate: 0,
      amount: qty * item.salesPrice,
    }));
    setBillItems(prev => [...prev, ...newItems]);
    setShowAddItems(false);
  };

  const handleItemChange = (id: number, updates: Partial<BillItem>) => {
    setBillItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const handleDeleteItem = (id: number) => setBillItems(prev => prev.filter(i => i.id !== id));

  const handleSave = () => {
    const newChallan: ChallanItem = {
      id: isEditMode ? (challan?.id || Date.now()) : (challan?.id || Date.now()),
      date: challanDate,
      challanNumber: challanNo,
      partyName: selectedParty?.name || challan?.partyName || "Unknown",
      partyId: selectedParty?.id || challan?.partyId,
      amount: totalAmount,
      status: isEditMode ? (challan?.status || "Open") : "Open",
      items: billItems,
      notes,
      termsAndConditions,
      additionalCharges,
      discountPct,
      discountAmt,
      discountType,
      autoRoundOff,
      roundOffAmt,
      eWayBillNo,
      challanNoRef,
      financedBy,
      salesman,
      emailId,
      warrantyPeriod,
      shippingAddress,
      selectedBankId: selectedBank?.id,
    };
    onSave(newChallan);
  };

  const handlePartySelect = (p: Party) => {
    setSelectedParty(p);
    if (!shippingAddress) setShippingAddress(`${p.name}\nPhone Number: ${p.mobile}`);
    setShowPartySelector(false);
  };

  const handleCreateNewParty = (p: Party) => {
    setParties(prev => [...prev, p]);
    handlePartySelect(p);
    setShowCreateParty(false);
  };

  return (
    <div className="cdc-page">
      {/* Top Nav */}
      <div className="cdc-topnav">
        <div className="cdc-topnav-left">
          <button className="back-btn" onClick={onBack}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div className="topnav-divider" />
          <span className="cdc-page-title">{isEditMode ? "Edit Delivery Challan" : "Create Delivery Challan"}</span>
        </div>
        <div className="cdc-topnav-right">
          <button className="cdc-icon-btn" title="Keyboard Shortcuts">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/></svg>
          </button>
          <button className="cdc-settings-btn" onClick={() => setShowSettings(true)}>
            <Settings size={14} /> Settings <span className="notif-dot-sm" />
          </button>
          <button className="btn-save-new" onClick={handleSave}>Save &amp; New</button>
          <button className="btn-save-main" onClick={handleSave}>Save</button>
        </div>
      </div>

      <div className="cdc-body">
        {/* Top Split */}
        <div className={"cdc-top-split" + (selectedParty ? " has-party" : "")}>
          {/* Bill To */}
          <div className="cdc-bill-section">
            <div className="bill-to-header">
              <span>Bill To</span>
              {selectedParty && <button className="change-party-btn" onClick={() => setShowPartySelector(true)}>Change Party</button>}
            </div>
            {!selectedParty ? (
              <div className="party-select-area" ref={partySelectorRef}>
                <div className="add-party-box" onClick={() => setShowPartySelector(true)}>
                  <Plus size={14} /> Add Party
                </div>
                {showPartySelector && (
                  <PartySelector parties={parties} onSelect={handlePartySelect} onCreateParty={() => { setShowPartySelector(false); setShowCreateParty(true); }} />
                )}
              </div>
            ) : (
              <div className="party-info-box" ref={partySelectorRef}>
                <div className="party-info-name">{selectedParty.name}</div>
                <div className="party-info-detail">Phone Number: {selectedParty.mobile}</div>
                {showPartySelector && (
                  <PartySelector parties={parties} onSelect={handlePartySelect} onCreateParty={() => { setShowPartySelector(false); setShowCreateParty(true); }} />
                )}
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
                {shippingAddress.split("\n").map((line, i) => (
                  <div key={i} className={i === 0 ? "party-info-name" : "party-info-detail"}>{line}</div>
                ))}
              </div>
            </div>
          )}

          {/* Challan Meta */}
          <div className="cdc-meta-section">
            <div className="meta-row">
              <div className="meta-field">
                <label>Challan No:</label>
                <input className="meta-input" type="number" value={challanNo} onChange={e => setChallanNo(Number(e.target.value))} />
              </div>
              <div className="meta-field" ref={dateRef}>
                <label>Challan Date:</label>
                <div className="date-trigger" onClick={() => setShowDatePicker(!showDatePicker)}>
                  <Calendar size={13} />
                  <span>{fmtDate(challanDate)}</span>
                  <ChevronDown size={12} />
                </div>
                {showDatePicker && (
                  <InlineDatePicker value={challanDate} onChange={setChallanDate} onClose={() => setShowDatePicker(false)} />
                )}
              </div>
            </div>
            <div className="meta-row-4">
              <div className="meta-field"><label>E-Way Bill No: <span className="info-icon">ⓘ</span></label><input className="meta-input" value={eWayBillNo} onChange={e => setEWayBillNo(e.target.value)} /></div>
              <div className="meta-field"><label>Challan No.:</label><input className="meta-input" value={challanNoRef} onChange={e => setChallanNoRef(e.target.value)} /></div>
              <div className="meta-field"><label>Financed By:</label><input className="meta-input" value={financedBy} onChange={e => setFinancedBy(e.target.value)} /></div>
              <div className="meta-field"><label>Salesman:</label><input className="meta-input" value={salesman} onChange={e => setSalesman(e.target.value)} /></div>
            </div>
            <div className="meta-row-2">
              <div className="meta-field"><label>Email ID:</label><input className="meta-input" value={emailId} onChange={e => setEmailId(e.target.value)} /></div>
              <div className="meta-field"><label>Warranty Period:</label><input className="meta-input" value={warrantyPeriod} onChange={e => setWarrantyPeriod(e.target.value)} /></div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="cdc-items-section">
          <table className="cdc-items-table">
            <thead>
              <tr>
                <th>NO</th>
                <th>ITEMS/ SERVICES</th>
                <th>HSN/ SAC</th>
                {showQty && <th>QTY</th>}
                {showPrice && <th>PRICE/ITEM (₹)</th>}
                <th>DISCOUNT</th>
                <th>TAX</th>
                <th>AMOUNT (₹)</th>
                <th><button className="add-col-btn" onClick={() => setShowHideColumns(true)}><Plus size={14} /></button></th>
              </tr>
            </thead>
            <tbody>
              {billItems.map((item, idx) => (
                <BillItemRow key={item.id} item={item} index={idx} onChange={handleItemChange} onDelete={handleDeleteItem} showPrice={showPrice} showQty={showQty} />
              ))}
            </tbody>
          </table>

          <div className="add-item-row">
            <div className="add-item-dashed" onClick={() => setShowAddItems(true)}>+ Add Item</div>
            <div className="scan-barcode-btn" onClick={() => setShowAddItems(true)}><Barcode size={20} /> Scan Barcode</div>
          </div>

          <div className="subtotal-row">
            <span className="subtotal-label">SUBTOTAL</span>
            <span className="subtotal-val">₹ {totalDiscountItems.toFixed(0)}</span>
            <span className="subtotal-val">₹ 0</span>
            <span className="subtotal-val">₹ {subtotal.toFixed(0)}</span>
          </div>
        </div>

        {/* Bottom Split */}
        <div className="cdc-bottom-split">
          {/* Left */}
          <div className="cdc-bottom-left">
            {!showNotes ? (
              <button className="link-action-btn" onClick={() => setShowNotes(true)}>+ Add Notes</button>
            ) : (
              <div className="bottom-text-section">
                <div className="bts-header"><span>Notes</span><button className="bts-close" onClick={() => setShowNotes(false)}>⊗</button></div>
                <textarea className="bts-textarea" placeholder="Enter your notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
              </div>
            )}

            {!showTerms ? (
              <button className="link-action-btn" onClick={() => setShowTerms(true)}>+ Add Terms and Conditions</button>
            ) : (
              <div className="bottom-text-section">
                <div className="bts-header"><span>Terms and Conditions</span><button className="bts-close" onClick={() => setShowTerms(false)}>⊗</button></div>
                <textarea className="bts-textarea" placeholder="Enter your terms and conditions" value={termsAndConditions} onChange={e => setTermsAndConditions(e.target.value)} rows={4} />
              </div>
            )}

            {selectedBank ? (
              <div className="bank-selected-display">
                <div className="bank-details-title">Bank Details</div>
                <div className="bank-detail-row"><span className="bank-detail-label">Account Number:</span> <strong>{selectedBank.accountNumber}</strong></div>
                {selectedBank.ifscCode && <div className="bank-detail-row"><span className="bank-detail-label">IFSC Code:</span> <strong>{selectedBank.ifscCode}</strong></div>}
                {selectedBank.bankBranchName && <div className="bank-detail-row"><span className="bank-detail-label">Bank &amp; Branch Name:</span> <strong>{selectedBank.bankBranchName}</strong></div>}
                {selectedBank.accountHolderName && <div className="bank-detail-row"><span className="bank-detail-label">Account Holder's Name:</span> <strong>{selectedBank.accountHolderName}</strong></div>}
                <div className="bank-selected-actions">
                  <button className="link-action-btn" onClick={() => setShowBankModal(true)}>Change Bank Account</button>
                  <button className="link-action-btn link-action-btn--danger" onClick={() => setSelectedBank(null)}>Remove Bank Account</button>
                </div>
              </div>
            ) : (
              <button className="link-action-btn" onClick={() => setShowAddBankModal(true)}>+ Add Bank Account</button>
            )}
          </div>

          {/* Right: Summary */}
          <div className="cdc-summary">
            {/* Additional Charges */}
            {showAdditionalCharges && additionalCharges.map((charge, i) => (
              <div key={charge.id} className="charge-row">
                <input className="charge-label-input" placeholder="Enter charge (ex. Transport Charge)" value={charge.label}
                  onChange={e => setAdditionalCharges(prev => prev.map((c, ci) => ci === i ? { ...c, label: e.target.value } : c))} />
                <div className="charge-amount-area">
                  <span>₹</span>
                  <input className="charge-amount-input" type="number" value={charge.amount}
                    onChange={e => setAdditionalCharges(prev => prev.map((c, ci) => ci === i ? { ...c, amount: Number(e.target.value) } : c))} />
                  <div className="charge-tax-wrapper">
                    <select className="charge-tax-select" value={charge.tax}
                      onChange={e => setAdditionalCharges(prev => prev.map((c, ci) => ci === i ? { ...c, tax: e.target.value } : c))}>
                      <option>No Tax Applicable</option><option>GST 5%</option><option>GST 12%</option><option>GST 18%</option>
                    </select>
                  </div>
                  <button className="charge-remove" onClick={() => setAdditionalCharges(prev => prev.filter((_, ci) => ci !== i))}>⊗</button>
                </div>
              </div>
            ))}
            <div className="summary-line">
              <button className="link-action-btn summary-link" onClick={handleAddCharge}>
                {showAdditionalCharges && additionalCharges.length > 0 ? "+ Add Another Charge" : "+ Add Additional Charges"}
              </button>
              <span className="summary-val">₹ {additionalCharges.reduce((s, c) => s + c.amount, 0).toFixed(0)}</span>
            </div>

            <div className="summary-line"><span>Taxable Amount</span><span className="summary-val">₹ {taxableAmount.toFixed(0)}</span></div>

            {/* Discount */}
            {showDiscount ? (
              <div className="discount-row">
                <div className="discount-type-wrapper">
                  <button className="discount-type-btn" onClick={() => setShowDiscountMenu(!showDiscountMenu)}>
                    Discount {discountType} <ChevronDown size={12} />
                  </button>
                  {showDiscountMenu && (
                    <div className="discount-menu">
                      <div className={discountType === "Before Tax" ? "discount-menu-active" : ""} onClick={() => { setDiscountType("Before Tax"); setShowDiscountMenu(false); }}>Discount Before Tax</div>
                      <div className={discountType === "After Tax" ? "discount-menu-active" : ""} onClick={() => { setDiscountType("After Tax"); setShowDiscountMenu(false); }}>Discount After Tax</div>
                    </div>
                  )}
                </div>
                <div className="discount-inputs-summary">
                  <span className="disc-pct-label">%</span>
                  <input type="number" min="0" max="100" className="disc-pct-input" value={discountPct}
                    onChange={e => handleDiscountPctChange(Number(e.target.value))} />
                  <span className="disc-sep">/</span>
                  <span className="disc-cur">₹</span>
                  <input type="number" min="0" className="disc-amt-input" value={discountAmt}
                    onChange={e => handleDiscountAmtChange(Number(e.target.value))} />
                  <button className="disc-remove" onClick={() => { setShowDiscount(false); setDiscountPct(0); setDiscountAmt(0); }}>⊗</button>
                </div>
              </div>
            ) : (
              <div className="summary-line">
                <button className="link-action-btn summary-link" onClick={() => setShowDiscount(true)}>+ Add Discount</button>
                <span className="summary-val summary-discount-val">- ₹ {effectiveDiscount.toFixed(0)}</span>
              </div>
            )}
            {showDiscount && effectiveDiscount > 0 && (
              <div className="summary-line discount-val"><span></span><span>- ₹ {effectiveDiscount.toFixed(2)}</span></div>
            )}

            {/* Round Off */}
            <div className="roundoff-section">
              <div className="roundoff-row">
                <label className="check-label">
                  <input type="checkbox" checked={autoRoundOff} onChange={e => setAutoRoundOff(e.target.checked)} />
                  Auto Round Off
                </label>
                <div className="roundoff-right">
                  <div className="roundoff-type-wrap">
                    <button className="roundoff-add-btn" onClick={() => setShowRoundOffMenu(!showRoundOffMenu)}>
                      {roundOffType} <ChevronDown size={12} />
                    </button>
                    {showRoundOffMenu && (
                      <div className="roundoff-menu">
                        <div onClick={() => { setRoundOffType("+ Add"); setShowRoundOffMenu(false); }}>+ Add</div>
                        <div onClick={() => { setRoundOffType("Reduce"); setShowRoundOffMenu(false); }}>− Reduce</div>
                      </div>
                    )}
                  </div>
                  <span className="roundoff-currency">₹</span>
                  <input className="roundoff-input" type="number" value={roundOffAmt} onChange={e => setRoundOffAmt(Number(e.target.value))} />
                </div>
              </div>
            </div>

            {/* Total Amount */}
            <div className="summary-total-row">
              <span className="total-label">Total Amount</span>
              <span className="total-value">₹ {totalAmount.toFixed(2)}</span>
            </div>

            <div className="authorized-sig">Authorized signatory for <strong>scratchweb.solutions</strong></div>
            <div className="sig-box"></div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateParty && <CreatePartyModal onSave={handleCreateNewParty} onClose={() => setShowCreateParty(false)} />}
      {showShippingModal && selectedParty && (
        <ChangeShippingModal
          partyName={selectedParty.name}
          addresses={[selectedParty.billingAddress || "", selectedParty.shippingAddress || ""]}
          onDone={addr => { setShippingAddress(addr); setShowShippingModal(false); }}
          onClose={() => setShowShippingModal(false)}
        />
      )}
      {showAddItems && <AddItemsModal onAddItems={handleAddItemsFromModal} onClose={() => setShowAddItems(false)} onCreateItem={() => setShowAddItems(false)} />}
      {showHideColumns && <ShowHideColumnsModal showPrice={showPrice} showQty={showQty} onSave={(p, q) => { setShowPrice(p); setShowQty(q); }} onClose={() => setShowHideColumns(false)} />}
      {showBankModal && (
        <SelectBankModal
          onClose={() => setShowBankModal(false)}
          onAdd={() => { setShowBankModal(false); setShowAddBankModal(true); }}
          onSelect={b => setSelectedBank(b)}
        />
      )}
      {showAddBankModal && (
        <AddBankModal
          onClose={() => setShowAddBankModal(false)}
          onSaved={b => { setSelectedBank(b); setShowAddBankModal(false); }}
        />
      )}
      {showSettings && <QuickSettingsModal settings={settings} onSave={() => {}} onClose={() => setShowSettings(false)} />}
    </div>
  );
}