import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  DeliveryChallan, BillItem, AdditionalCharge, DCBankAccount,
  getChallans, saveChallan, getChallanById, makeBlankChallan, getNextChallanNo,
  getDCItems, DCItem, DC_CHARGE_TAX_OPTIONS, fmtDisplayDate, todayStr,
} from "./Deliverychallantype";
import DCPartySelector from "./Dcpartyselector";
import "./Createdeliverychallan.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function CalPicker({ value, onChange, onClose }: { value: string; onChange:(v:string)=>void; onClose:()=>void }) {
  const today = new Date();
  const [vm, setVm] = useState(value ? new Date(value).getMonth() : today.getMonth());
  const [vy, setVy] = useState(value ? new Date(value).getFullYear() : today.getFullYear());
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{ function h(e:MouseEvent){if(ref.current&&!ref.current.contains(e.target as Node))onClose();} document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);
  const dim=(m:number,y:number)=>new Date(y,m+1,0).getDate();
  const fdo=(m:number,y:number)=>new Date(y,m,1).getDay();
  const cells=[...Array(fdo(vm,vy)).fill(null),...Array.from({length:dim(vm,vy)},(_,i)=>i+1)];
  while(cells.length%7!==0) cells.push(null);
  const ds=(d:number)=>`${vy}-${String(vm+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  return (
    <div ref={ref} className="cdc-cal-pop">
      <div className="cdc-cal-sel">{value ? fmtDisplayDate(value) : "Select Date"}</div>
      <div className="cdc-cal-nav">
        <div className="cdc-cal-ngrp">
          <button onClick={()=>{if(vm===0){setVm(11);setVy(y=>y-1);}else setVm(m=>m-1);}}>‹</button>
          <span>{MONTHS[vm]}</span>
          <button onClick={()=>{if(vm===11){setVm(0);setVy(y=>y+1);}else setVm(m=>m+1);}}>›</button>
        </div>
        <div className="cdc-cal-ngrp">
          <button onClick={()=>setVy(y=>y-1)}>‹</button>
          <span>{vy}</span>
          <button onClick={()=>setVy(y=>y+1)}>›</button>
        </div>
      </div>
      <div className="cdc-cal-grid">
        {WDAYS.map(d=><div key={d} className="cdc-cal-dh">{d}</div>)}
        {cells.map((day,i)=>{
          if(!day) return <div key={i}/>;
          const s=ds(day); const isSel=s===value;
          return <button key={i} className={`cdc-cal-day${isSel?" cdc-cal-day--sel":""}`} onClick={()=>{onChange(s);onClose();}}>{day}</button>;
        })}
      </div>
      <div className="cdc-cal-ftr">
        <button className="cdc-btn-cancel" onClick={onClose}>CANCEL</button>
        <button className="cdc-btn-primary" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

// ─── Add Items Modal ──────────────────────────────────────────────────────────
function AddItemsModal({ onClose, onAdd }: { onClose: () => void; onAdd: (items: BillItem[]) => void }) {
  const [items] = useState<DCItem[]>(getDCItems());
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Map<number, number>>(new Map());
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => { searchRef.current?.focus(); }, []);
  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) || (i.itemCode||"").includes(search)
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
      billItems.push({
        rowId: `row-${Date.now()}-${itemId}`,
        itemId, name: item.name, description: "", hsn: item.hsn || "",
        qty, unit: item.unit, price: item.salesPrice,
        discountPct: 0, discountAmt: 0, taxLabel: "None", taxRate: 0,
        amount: qty * item.salesPrice,
      });
    });
    onAdd(billItems);
    onClose();
  }
  const total = Array.from(selected.values()).reduce((s, v) => s + v, 0);
  return (
    <div className="cdc-overlay" onClick={onClose}>
      <div className="cdc-aim-modal" onClick={e => e.stopPropagation()}>
        <div className="cdc-aim-hdr">
          <span>Add Items to Bill</span>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="cdc-aim-toolbar">
          <div className="cdc-aim-search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input ref={searchRef} className="cdc-aim-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Item / Serial no. / HSN code / SKU / Category"/>
          </div>
          <button className="cdc-aim-create">Create New Item</button>
        </div>
        <div className="cdc-aim-table-wrap">
          <table className="cdc-aim-table">
            <thead>
              <tr>
                <th>Item Name</th><th>Item Code</th><th>Stock</th>
                <th>Sales Price</th><th>Purchase Price</th><th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="cdc-aim-empty">Scan items to add them to your invoice</td></tr>
              ) : filtered.map(item => {
                const qty = selected.get(item.id) || 0;
                return (
                  <tr key={item.id} className={`cdc-aim-row${selected.has(item.id) ? " cdc-aim-row--sel" : ""}`}>
                    <td className="cdc-aim-name">{item.name}</td>
                    <td className="cdc-aim-code">{item.itemCode || "–"}</td>
                    <td>{item.stock || "–"}</td>
                    <td>₹{item.salesPrice.toLocaleString("en-IN")}</td>
                    <td>{item.purchasePrice > 0 ? `₹${item.purchasePrice.toLocaleString("en-IN")}` : "–"}</td>
                    <td className="cdc-aim-qty-cell">
                      {qty === 0 ? (
                        <button className="cdc-aim-add-btn" onClick={() => setQty(item.id, 1)}>+ Add</button>
                      ) : (
                        <div className="cdc-aim-qty-ctrl">
                          <button onClick={() => setQty(item.id, qty-1)}>−</button>
                          <input type="number" value={qty} onChange={e => setQty(item.id, Number(e.target.value))} className="cdc-aim-qty-inp"/>
                          <button onClick={() => setQty(item.id, qty+1)}>+</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="cdc-aim-ftr">
          <div className="cdc-aim-shortcuts">
            <span>Keyboard Shortcuts:</span><span>Change Quantity</span><kbd>Enter</kbd>
            <span>Move between items</span><kbd>↑</kbd><kbd>↓</kbd>
          </div>
          <div className="cdc-aim-bottom">
            <span>{total > 0 ? `Show ${total} Item(s) Selected` : "0 Item(s) Selected"}</span>
            <div className="cdc-aim-actions">
              <button className="cdc-btn-cancel" onClick={onClose}>Cancel [ESC]</button>
              <button className={`cdc-btn-add-bill${selected.size === 0 ? " cdc-disabled" : ""}`} disabled={selected.size === 0} onClick={handleAdd}>Add to Bill [F7]</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Bank Account Modal ───────────────────────────────────────────────────────
function BankAccountModal({ existing, onClose, onSave }: { existing: DCBankAccount | null; onClose: () => void; onSave: (b: DCBankAccount) => void }) {
  const [form, setForm] = useState<DCBankAccount>(existing ?? { accountNumber:"", reEnterAccountNumber:"", ifscCode:"", bankBranchName:"", accountHolderName:"", upiId:"" });
  const [err, setErr] = useState("");
  function handleSubmit() {
    if (!form.accountNumber.trim()) { setErr("Account number is required"); return; }
    if (form.accountNumber !== form.reEnterAccountNumber) { setErr("Account numbers don't match"); return; }
    onSave(form); onClose();
  }
  return (
    <div className="cdc-overlay" onClick={onClose}>
      <div className="cdc-bank-modal" onClick={e => e.stopPropagation()}>
        <div className="cdc-cmodal-hdr">
          <span>Add Bank Account</span>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="cdc-bank-body">
          <div className="cdc-bank-grid">
            <div>
              <label>Bank Account Number <span className="cdc-req">*</span></label>
              <input className="cdc-inp" placeholder="ex: 123456789" value={form.accountNumber} onChange={e=>setForm(f=>({...f,accountNumber:e.target.value}))}/>
            </div>
            <div>
              <label>Re-Enter Bank Account Number <span className="cdc-req">*</span></label>
              <input className="cdc-inp" placeholder="ex: 123456789" value={form.reEnterAccountNumber} onChange={e=>setForm(f=>({...f,reEnterAccountNumber:e.target.value}))}/>
            </div>
            <div>
              <label>IFSC Code</label>
              <input className="cdc-inp" placeholder="ex: ICIC0001234" value={form.ifscCode} onChange={e=>setForm(f=>({...f,ifscCode:e.target.value}))}/>
            </div>
            <div>
              <label>Bank &amp; Branch Name</label>
              <input className="cdc-inp" placeholder="ex: ICICI Bank, Mumbai" value={form.bankBranchName} onChange={e=>setForm(f=>({...f,bankBranchName:e.target.value}))}/>
            </div>
            <div>
              <label>Account Holder's Name</label>
              <input className="cdc-inp" placeholder="ex: Babu Lal" value={form.accountHolderName} onChange={e=>setForm(f=>({...f,accountHolderName:e.target.value}))}/>
            </div>
            <div>
              <label>UPI ID</label>
              <input className="cdc-inp" placeholder="ex: babulal@upi" value={form.upiId} onChange={e=>setForm(f=>({...f,upiId:e.target.value}))}/>
            </div>
          </div>
          {err && <div className="cdc-errmsg" style={{marginTop:8}}>{err}</div>}
        </div>
        <div className="cdc-modal-ftr">
          <button className="cdc-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="cdc-btn-primary" onClick={handleSubmit}>Submit</button>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Settings Modal ─────────────────────────────────────────────────────
function QuickSettings({ onClose, nextNo }: { onClose: () => void; nextNo: number }) {
  const [prefixOn, setPrefixOn] = useState(true);
  const [prefix, setPrefix] = useState(""); const [seqNo, setSeqNo] = useState(nextNo);
  const [showItemImage, setShowItemImage] = useState(true); const [priceHistory, setPriceHistory] = useState(true);
  const Toggle = ({ on, set }: { on: boolean; set: (v: boolean) => void }) => (
    <button className={`cdc-toggle${on?" cdc-toggle--on":""}`} onClick={() => set(!on)}><span className="cdc-toggle-th"/></button>
  );
  return (
    <div className="cdc-overlay" onClick={onClose}>
      <div className="cdc-settings-modal" onClick={e => e.stopPropagation()}>
        <div className="cdc-cmodal-hdr"><span>Quick Delivery Challan Settings</span><button onClick={onClose}>✕</button></div>
        <div className="cdc-settings-body">
          <div className="cdc-settings-section">
            <div className="cdc-settings-row">
              <div><div className="cdc-s-label">Delivery Challan Prefix &amp; Sequence Number</div><div className="cdc-s-sub">Add your custom prefix &amp; sequence for Delivery Challan Numbering</div></div>
              <Toggle on={prefixOn} set={setPrefixOn}/>
            </div>
            {prefixOn && (
              <div className="cdc-prefix-row">
                <div><label>Prefix</label><input value={prefix} onChange={e=>setPrefix(e.target.value)} placeholder="Prefix" className="cdc-inp"/></div>
                <div><label>Sequence Number</label><input type="number" value={seqNo} onChange={e=>setSeqNo(Number(e.target.value))} className="cdc-inp"/></div>
              </div>
            )}
            {prefixOn && <div className="cdc-inv-preview">Delivery Challan Number: {prefix}{seqNo}</div>}
          </div>
          <div className="cdc-settings-section">
            <div className="cdc-settings-row">
              <div><div className="cdc-s-label">Show Item Image on Invoice</div><div className="cdc-s-sub">This will apply to all vouchers except for Payment In and Payment Out</div></div>
              <Toggle on={showItemImage} set={setShowItemImage}/>
            </div>
          </div>
          <div className="cdc-settings-section">
            <div className="cdc-settings-row">
              <div><div className="cdc-s-label">Price History <span className="cdc-badge-new">New</span></div><div className="cdc-s-sub">Show last 5 sales / purchase prices of the item for the selected party in invoice</div></div>
              <Toggle on={priceHistory} set={setPriceHistory}/>
            </div>
          </div>
        </div>
        <div className="cdc-modal-ftr">
          <button className="cdc-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="cdc-btn-primary" onClick={onClose}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Show/Hide Columns Modal ──────────────────────────────────────────────────
function ShowHideColsModal({ cols, onChange, onClose }: { cols: { pricePerItem: boolean; quantity: boolean }; onChange: (c: any) => void; onClose: () => void }) {
  const [local, setLocal] = useState(cols);
  const Toggle = ({ on, set }: { on: boolean; set: (v: boolean) => void }) => (
    <button className={`cdc-toggle${on?" cdc-toggle--on":""}`} onClick={() => set(!on)}><span className="cdc-toggle-th"/></button>
  );
  return (
    <div className="cdc-overlay" onClick={onClose}>
      <div className="cdc-col-modal" onClick={e => e.stopPropagation()}>
        <div className="cdc-cmodal-hdr"><span>Show/Hide Columns in Invoice</span><button onClick={onClose}>✕</button></div>
        <div className="cdc-col-body">
          <div className="cdc-col-row"><span>Price/Item (₹)</span><Toggle on={local.pricePerItem} set={v => setLocal(c => ({...c,pricePerItem:v}))}/></div>
          <div className="cdc-col-row"><span>Quantity</span><Toggle on={local.quantity} set={v => setLocal(c => ({...c,quantity:v}))}/></div>
          <div className="cdc-col-custom-hdr">CUSTOM COLUMN</div>
          <div className="cdc-col-empty">
            <div>No Custom Columns added</div>
            <div style={{fontSize:12,color:"#9ca3af"}}>Any custom column such as Batch # &amp; Expiry Date can be added</div>
            <div style={{fontSize:12,color:"#6b7280",marginTop:8,padding:"8px",background:"#fef9c3",borderRadius:6}}>To add Custom Item Columns - Go to <strong>Item settings</strong> from <span className="cdc-link">Items page (click here)</span></div>
          </div>
        </div>
        <div className="cdc-modal-ftr">
          <button className="cdc-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="cdc-btn-primary" onClick={() => { onChange(local); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Items Table Row ──────────────────────────────────────────────────────────
function ItemRow({ item, idx, showCols, onChange, onDelete }: {
  item: BillItem; idx: number;
  showCols: { pricePerItem: boolean; quantity: boolean };
  onChange: (i: BillItem) => void; onDelete: () => void;
}) {
  const [showTaxDrop, setShowTaxDrop] = useState(false);
  const taxOptions = ["None", "GST 5%", "GST 12%", "GST 18%", "GST 28%"];
  function getTaxRate(label: string) {
    const m: Record<string,number> = {"None":0,"GST 5%":5,"GST 12%":12,"GST 18%":18,"GST 28%":28};
    return m[label] ?? 0;
  }
  const base = item.qty * item.price - (item.qty * item.price * item.discountPct / 100) - item.discountAmt;
  const taxAmt = base * item.taxRate / 100;
  const amount = base + taxAmt;

  return (
    <tr className="cdc-item-row">
      <td className="cdc-td-no">{idx + 1}</td>
      <td className="cdc-td-name">
        <input className="cdc-item-inp" value={item.name} onChange={e => onChange({...item, name: e.target.value})} placeholder="Item name"/>
      </td>
      <td className="cdc-td-hsn">
        <input className="cdc-item-inp" value={item.hsn} onChange={e => onChange({...item, hsn: e.target.value})} placeholder="HSN"/>
      </td>
      {showCols.quantity && (
        <td className="cdc-td-qty">
          <input type="number" className="cdc-item-inp cdc-inp-num" value={item.qty} onChange={e => onChange({...item, qty: Number(e.target.value), amount: Number(e.target.value) * item.price})}/>
        </td>
      )}
      {showCols.pricePerItem && (
        <td className="cdc-td-price">
          <input type="number" className="cdc-item-inp cdc-inp-num" value={item.price} onChange={e => onChange({...item, price: Number(e.target.value), amount: item.qty * Number(e.target.value)})}/>
        </td>
      )}
      <td className="cdc-td-disc">
        <input type="number" className="cdc-item-inp cdc-inp-num" value={item.discountPct} onChange={e => onChange({...item, discountPct: Number(e.target.value)})} placeholder="0"/>
      </td>
      <td className="cdc-td-tax" style={{position:"relative"}}>
        <button className="cdc-tax-btn" onClick={() => setShowTaxDrop(!showTaxDrop)}>
          {item.taxLabel} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:10,height:10}}><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        {showTaxDrop && (
          <div className="cdc-tax-drop">
            {taxOptions.map(t => (
              <button key={t} className="cdc-tax-opt" onClick={() => { onChange({...item, taxLabel: t, taxRate: getTaxRate(t)}); setShowTaxDrop(false); }}>{t}</button>
            ))}
          </div>
        )}
      </td>
      <td className="cdc-td-amount">₹{amount.toLocaleString("en-IN", {maximumFractionDigits:2})}</td>
      <td><button className="cdc-del-row-btn" onClick={onDelete}>✕</button></td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props { editId?: string; onBack: () => void; onSaveAndNew?: () => void; }

export default function CreateDeliveryChallan({ editId, onBack, onSaveAndNew }: Props) {
  const [form, setForm] = useState<DeliveryChallan>(() => {
    if (editId) return getChallanById(editId) ?? makeBlankChallan(getNextChallanNo());
    return makeBlankChallan(getNextChallanNo());
  });
  const [showAddItems, setShowAddItems] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showColModal, setShowColModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showDateCal, setShowDateCal] = useState(false);
  const [showNotes, setShowNotes] = useState(!!form.notes);
  const [showDiscount, setShowDiscount] = useState(form.discountPct > 0 || form.discountAmt > 0);
  const [showChargeTaxDrop, setShowChargeTaxDrop] = useState<string|null>(null);

  useEffect(() => {
    if (editId) {
      const ex = getChallanById(editId);
      if (ex) { setForm(ex); setShowNotes(!!ex.notes); setShowDiscount(ex.discountPct > 0 || ex.discountAmt > 0); }
    }
  }, [editId]);

  function set<K extends keyof DeliveryChallan>(field: K, value: DeliveryChallan[K]) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  // Calculations
  const subtotal = form.billItems.reduce((s, i) => s + i.price * i.qty, 0);
  const chargesTotal = form.additionalCharges.reduce((s, c) => s + c.amount, 0);
  const taxableAmount = subtotal + chargesTotal;
  const discValue = taxableAmount * form.discountPct / 100 || form.discountAmt;
  const total = taxableAmount - discValue + form.roundOffAmt;

  function handleSave() { saveChallan({ ...form }); onBack(); }
  function handleSaveAndNew() {
    saveChallan({ ...form });
    const next = makeBlankChallan(getNextChallanNo());
    setForm(next);
    setShowNotes(false); setShowDiscount(false);
    if (onSaveAndNew) onSaveAndNew();
  }
  function updateItem(rowId: string, updated: BillItem) {
    set("billItems", form.billItems.map(i => i.rowId === rowId ? updated : i));
  }
  function deleteItem(rowId: string) { set("billItems", form.billItems.filter(i => i.rowId !== rowId)); }
  function addCharge() {
    set("additionalCharges", [...form.additionalCharges, { id: `c-${Date.now()}`, label: "", amount: 0, taxLabel: "No Tax Applicable", taxRate: 0 }]);
  }
  function updateCharge(id: string, f: Partial<AdditionalCharge>) {
    set("additionalCharges", form.additionalCharges.map(c => c.id === id ? {...c,...f} : c));
  }
  function removeCharge(id: string) { set("additionalCharges", form.additionalCharges.filter(c => c.id !== id)); }

  const nextNo = getNextChallanNo();

  return (
    <div className="cdc-page">
      {/* Top Bar */}
      <div className="cdc-topbar">
        <button className="cdc-back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Create Delivery Challan
        </button>
        <div className="cdc-topbar-right">
          <button className="cdc-keyboard-btn" title="Keyboard Shortcuts">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/></svg>
          </button>
          <button className="cdc-settings-btn" onClick={() => setShowSettings(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Settings
            <span className="cdc-notif-dot"/>
          </button>
          <button className="cdc-save-new-btn" onClick={handleSaveAndNew}>Save &amp; New</button>
          <button className="cdc-save-btn" onClick={handleSave}>Save</button>
        </div>
      </div>

      {/* Body */}
      <div className="cdc-body">
        {/* Top Panel */}
        <div className="cdc-top-panel">
          {/* Party */}
          <div className="cdc-party-col">
            <DCPartySelector
              selectedParty={form.party}
              shipTo={form.shipTo}
              onSelectParty={p => set("party", p)}
              onShipToChange={addr => set("shipTo", addr)}
            />
          </div>

          {/* Meta Fields */}
          <div className="cdc-meta-col">
            <div className="cdc-meta">
              <div className="cdc-meta-row1">
                <div className="cdc-meta-field">
                  <label>Challan No:</label>
                  <input className="cdc-meta-input cdc-meta-input--no" value={`${form.prefix}${form.challanNo}`} readOnly/>
                </div>
                <div className="cdc-meta-field">
                  <label>Challan Date:</label>
                  <div style={{position:"relative"}}>
                    <button className="cdc-date-btn" onClick={() => setShowDateCal(!showDateCal)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {fmtDisplayDate(form.challanDate)}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:11,height:11}}><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    {showDateCal && <CalPicker value={form.challanDate} onChange={v => { set("challanDate", v); setShowDateCal(false); }} onClose={() => setShowDateCal(false)}/>}
                  </div>
                </div>
              </div>
              <div className="cdc-meta-grid4">
                {[
                  {label:"E-Way Bill No:", field:"eWayBillNo", val:form.eWayBillNo, info:true},
                  {label:"Challan No.:", field:"challanRef", val:form.challanRef},
                  {label:"Financed By:", field:"financedBy", val:form.financedBy},
                  {label:"Salesman:", field:"salesman", val:form.salesman},
                ].map(f => (
                  <div key={f.field} className="cdc-meta-field">
                    <label>{f.label}{f.info&&<span className="cdc-info-icon" title="E-Way Bill Number">ⓘ</span>}</label>
                    <input className="cdc-meta-input" value={f.val as string} onChange={e => set(f.field as any, e.target.value)}/>
                  </div>
                ))}
              </div>
              <div className="cdc-meta-grid2">
                <div className="cdc-meta-field"><label>Email ID:</label><input className="cdc-meta-input" value={form.emailId} onChange={e => set("emailId", e.target.value)}/></div>
                <div className="cdc-meta-field"><label>Warranty Period:</label><input className="cdc-meta-input" value={form.warrantyPeriod} onChange={e => set("warrantyPeriod", e.target.value)}/></div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="cdc-items-section">
          <div className="cdc-items-table-wrap">
            <table className="cdc-items-table">
              <thead>
                <tr>
                  <th className="cdc-th-no">NO</th>
                  <th>ITEMS / SERVICES</th>
                  <th>HSN/SAC</th>
                  {form.showColumns.quantity && <th>QTY</th>}
                  {form.showColumns.pricePerItem && <th>PRICE/ITEM (₹)</th>}
                  <th>DISCOUNT</th>
                  <th>TAX</th>
                  <th>AMOUNT (₹)</th>
                  <th>
                    <button className="cdc-col-plus-btn" onClick={() => setShowColModal(true)} title="Show/Hide Columns">+</button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {form.billItems.map((item, idx) => (
                  <ItemRow key={item.rowId} item={item} idx={idx} showCols={form.showColumns}
                    onChange={updated => updateItem(item.rowId, updated)}
                    onDelete={() => deleteItem(item.rowId)}
                  />
                ))}
              </tbody>
            </table>
            <div className="cdc-add-item-row">
              <button className="cdc-add-item-btn" onClick={() => setShowAddItems(true)}>+ Add Item</button>
              <button className="cdc-barcode-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:20,height:20}}>
                  <rect x="2" y="6" width="3" height="12"/><rect x="6" y="6" width="1.5" height="12"/>
                  <rect x="8.5" y="6" width="2.5" height="12"/><rect x="12" y="6" width="1.5" height="12"/>
                  <rect x="14.5" y="6" width="3" height="12"/>
                </svg>
                Scan Barcode
              </button>
            </div>
            <div className="cdc-subtotal-row">
              <span className="cdc-sub-label">SUBTOTAL</span>
              <span>₹ {subtotal.toLocaleString("en-IN", {maximumFractionDigits:2})}</span>
              <span>₹ 0</span>
              <span>₹ {subtotal.toLocaleString("en-IN", {maximumFractionDigits:2})}</span>
            </div>
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="cdc-bottom-panel">
          {/* Footer left */}
          <div className="cdc-footer-col">
            {!showNotes ? (
              <button className="cdc-footer-link" onClick={() => setShowNotes(true)}>+ Add Notes</button>
            ) : (
              <div className="cdc-notes-section">
                <div className="cdc-notes-hdr"><span>Notes</span><button onClick={() => { setShowNotes(false); set("notes", ""); }}>✕</button></div>
                <textarea className="cdc-notes-ta" value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Enter your notes" rows={3}/>
              </div>
            )}
            <div className="cdc-terms-section">
              <div className="cdc-notes-hdr">
                <span>Terms and Conditions</span>
                <button onClick={() => set("termsConditions", "")}>✕</button>
              </div>
              <textarea className="cdc-notes-ta" value={form.termsConditions} onChange={e => set("termsConditions", e.target.value)} rows={4} placeholder="Enter terms and conditions"/>
            </div>
            {!form.bankAccount ? (
              <button className="cdc-footer-link" onClick={() => setShowBankModal(true)}>+ Add Bank Account</button>
            ) : (
              <div className="cdc-bank-display">
                <div className="cdc-notes-hdr">
                  <span>Bank Account</span>
                  <button onClick={() => set("bankAccount", null)}>✕</button>
                </div>
                <div className="cdc-bank-info">
                  <div>A/C: {form.bankAccount.accountNumber}</div>
                  {form.bankAccount.ifscCode && <div>IFSC: {form.bankAccount.ifscCode}</div>}
                  {form.bankAccount.bankBranchName && <div>{form.bankAccount.bankBranchName}</div>}
                  {form.bankAccount.accountHolderName && <div>{form.bankAccount.accountHolderName}</div>}
                  {form.bankAccount.upiId && <div>UPI: {form.bankAccount.upiId}</div>}
                  <button className="cdc-link" style={{marginTop:4}} onClick={() => setShowBankModal(true)}>Edit</button>
                </div>
              </div>
            )}
          </div>

          {/* Summary right */}
          <div className="cdc-summary-col">
            <button className="cdc-sum-link" onClick={addCharge}>+ Add Additional Charges</button>
            {form.additionalCharges.map(c => (
              <div key={c.id} className="cdc-charge-row">
                <input className="cdc-charge-input" value={c.label} onChange={e => updateCharge(c.id, {label:e.target.value})} placeholder="Enter charge (ex. Transport Charge)"/>
                <span className="cdc-rs-sm">₹</span>
                <input type="number" className="cdc-charge-amt" value={c.amount} onChange={e => updateCharge(c.id, {amount:Number(e.target.value)})}/>
                <div style={{position:"relative"}}>
                  <button className="cdc-charge-tax-btn" onClick={() => setShowChargeTaxDrop(showChargeTaxDrop===c.id?null:c.id)}>
                    {c.taxLabel} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:10,height:10}}><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {showChargeTaxDrop === c.id && (
                    <div className="cdc-charge-tax-drop">
                      {DC_CHARGE_TAX_OPTIONS.map(t => <button key={t} className="cdc-tax-opt" onClick={() => { updateCharge(c.id,{taxLabel:t, taxRate: t==="No Tax Applicable"?0:parseInt(t.replace(/\D/g,""))||0}); setShowChargeTaxDrop(null); }}>{t}</button>)}
                    </div>
                  )}
                </div>
                <button className="cdc-charge-del" onClick={() => removeCharge(c.id)}>✕</button>
              </div>
            ))}
            {form.additionalCharges.length > 0 && <button className="cdc-sum-link" onClick={addCharge}>+ Add Another Charge</button>}
            <div className="cdc-sum-row">
              <span>Taxable Amount</span>
              <span>₹ {taxableAmount.toLocaleString("en-IN", {maximumFractionDigits:2})}</span>
            </div>
            {!showDiscount ? (
              <div className="cdc-sum-row">
                <button className="cdc-sum-link" onClick={() => setShowDiscount(true)}>+ Add Discount</button>
                <span className="cdc-neg">- ₹ 0</span>
              </div>
            ) : (
              <div className="cdc-disc-row">
                <select className="cdc-disc-type" value={form.discountType} onChange={e => set("discountType", e.target.value as any)}>
                  <option>Discount After Tax</option>
                  <option>Discount Before Tax</option>
                </select>
                <span>%</span>
                <input type="number" className="cdc-disc-inp" value={form.discountPct} onChange={e => set("discountPct", Number(e.target.value))}/>
                <span>/</span><span>₹</span>
                <input type="number" className="cdc-disc-inp" value={form.discountAmt} onChange={e => set("discountAmt", Number(e.target.value))}/>
                <button className="cdc-charge-del" onClick={() => { setShowDiscount(false); set("discountPct",0); set("discountAmt",0); }}>✕</button>
              </div>
            )}
            <div className="cdc-sum-row">
              <label className="cdc-check-label">
                <input type="checkbox" checked={form.roundOff !== "none"} onChange={e => set("roundOff", e.target.checked ? "+Add" : "none")}/>
                Auto Round Off
              </label>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span className="cdc-rs-sm">+ Add</span>
                <span>₹</span>
                <input type="number" className="cdc-disc-inp" value={form.roundOffAmt} onChange={e => set("roundOffAmt", Number(e.target.value))} disabled={form.roundOff === "none"}/>
              </div>
            </div>
            <div className="cdc-total-row">
              <span>Total Amount</span>
              {total > 0
                ? <span className="cdc-total-val">₹ {total.toLocaleString("en-IN", {maximumFractionDigits:2})}</span>
                : <button className="cdc-enter-payment">Enter Payment amount</button>
              }
            </div>
            <div className="cdc-signatory">
              Authorized signatory for <strong>scratchweb.solutions</strong>
              <div className="cdc-sig-box"/>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddItems && <AddItemsModal onClose={() => setShowAddItems(false)} onAdd={items => set("billItems", [...form.billItems, ...items])}/>}
      {showSettings && <QuickSettings onClose={() => setShowSettings(false)} nextNo={nextNo}/>}
      {showColModal && <ShowHideColsModal cols={form.showColumns} onChange={c => set("showColumns", c)} onClose={() => setShowColModal(false)}/>}
      {showBankModal && <BankAccountModal existing={form.bankAccount} onClose={() => setShowBankModal(false)} onSave={b => set("bankAccount", b)}/>}
    </div>
  );
}