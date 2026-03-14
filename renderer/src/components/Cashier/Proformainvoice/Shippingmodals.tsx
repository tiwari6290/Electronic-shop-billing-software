import React, { useState } from "react";
import { ShippingAddress } from "./Types";
import "./Shippingmodals.css";

// ── Inline SVG Icons ──────────────────────────────────────────────────────────
const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconPencil = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
  </svg>
);

// ── Change Shipping Address ───────────────────────────────────────────────────
interface ChangeShippingProps {
  addresses: ShippingAddress[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onDone: () => void;
  onClose: () => void;
  onAddNew: () => void;
  onEdit: (addr: ShippingAddress) => void;
}
export const ChangeShippingModal: React.FC<ChangeShippingProps> = ({
  addresses, selectedId, onSelect, onDone, onClose, onAddNew, onEdit
}) => {
  const [sel, setSel] = useState<number | null>(selectedId ?? (addresses[0]?.id ?? null));

  return (
    <div className="aa-sm-overlay" onClick={onClose}>
      <div className="aa-sm-modal" onClick={e => e.stopPropagation()}>
        <div className="aa-sm-header">
          <h2>Change Shipping Address</h2>
          <button className="aa-sm-close" onClick={onClose}><IconClose /></button>
        </div>
        <div className="aa-sm-body">
          <div className="aa-sm-table-header">
            <span>Address</span><span>Edit</span><span>Select</span>
          </div>
          {addresses.map(addr => (
            <div key={addr.id} className="aa-sm-addr-row">
              <div className="aa-sm-addr-info">
                <div className="aa-sm-addr-name">{addr.name}</div>
                <div className="aa-sm-addr-detail">
                  {addr.street}{addr.city ? `, ${addr.city}` : ""}{addr.state ? `, ${addr.state}` : ""}{addr.pincode ? ` ${addr.pincode}` : ""}
                </div>
              </div>
              <button className="aa-sm-edit-btn" onClick={() => onEdit(addr)}><IconPencil /></button>
              <div className={`aa-sm-radio${sel === addr.id ? " checked" : ""}`} onClick={() => setSel(addr.id)} />
            </div>
          ))}
          <button className="aa-sm-add-new" onClick={onAddNew}>+ Add New Shipping Address</button>
        </div>
        <div className="aa-sm-footer">
          <button className="aa-sm-cancel" onClick={onClose}>Cancel</button>
          <button className="aa-sm-done" onClick={() => { if (sel != null) onSelect(sel); onDone(); }}>Done</button>
        </div>
      </div>
    </div>
  );
};

// ── Add / Edit Shipping Address ───────────────────────────────────────────────
const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
  "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

interface AddShippingProps {
  initial?: ShippingAddress | null;
  defaultName?: string;
  onSave: (addr: Omit<ShippingAddress, "id">) => void;
  onClose: () => void;
}
export const AddShippingAddressModal: React.FC<AddShippingProps> = ({ initial, defaultName, onSave, onClose }) => {
  const [form, setForm] = useState({
    name:    initial?.name    ?? defaultName ?? "",
    street:  initial?.street  ?? "",
    state:   initial?.state   ?? "",
    pincode: initial?.pincode ?? "",
    city:    initial?.city    ?? "",
  });
  const [stateSearch, setStateSearch] = useState(form.state);
  const [showStates, setShowStates]   = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const filteredStates = INDIAN_STATES.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase()));
  const valid = form.name.trim() !== "" && form.street.trim() !== "";

  return (
    <div className="aa-sm-overlay" onClick={onClose}>
      <div className="aa-sm-modal sm-add-modal" onClick={e => e.stopPropagation()}>
        <div className="aa-sm-header">
          <h2>{initial ? "Edit" : "Add"} Shipping Address</h2>
          <button className="aa-sm-close" onClick={onClose}><IconClose /></button>
        </div>
        <div className="aa-sm-body sm-form-body">
          <div className="aa-sm-field sm-full">
            <label>Shipping Name <span className="aa-sm-req">*</span></label>
            <input value={form.name} onChange={set("name")} placeholder="Enter shipping name" />
          </div>
          <div className="aa-sm-field sm-full">
            <label>Street Address <span className="aa-sm-req">*</span></label>
            <textarea value={form.street} onChange={set("street")} placeholder="Enter Street Address" rows={2} />
          </div>
          <div className="aa-sm-field-row">
            <div className="aa-sm-field">
              <label>State</label>
              <div className="aa-sm-state-wrap">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  value={stateSearch}
                  onChange={e => { setStateSearch(e.target.value); setShowStates(true); }}
                  onFocus={() => setShowStates(true)}
                  onBlur={() => setTimeout(() => setShowStates(false), 150)}
                  placeholder="Enter State"
                />
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                {showStates && filteredStates.length > 0 && (
                  <div className="aa-sm-state-dropdown">
                    {filteredStates.map(s => (
                      <div key={s} className="aa-sm-state-option"
                        onMouseDown={() => { setForm(p => ({...p, state: s})); setStateSearch(s); setShowStates(false); }}>
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="aa-sm-field">
              <label>Pincode</label>
              <input value={form.pincode} onChange={set("pincode")} placeholder="Enter pin code" maxLength={6} />
            </div>
          </div>
          <div className="aa-sm-field sm-full">
            <label>City</label>
            <input value={form.city} onChange={set("city")} placeholder="Enter City" />
          </div>
        </div>
        <div className="aa-sm-footer">
          <button className="aa-sm-cancel" onClick={onClose}>Cancel</button>
          <button
            className={`aa-sm-done sm-save${!valid ? " disabled" : ""}`}
            disabled={!valid}
            onClick={() => valid && onSave({ name: form.name, street: form.street, state: form.state, pincode: form.pincode, city: form.city })}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};