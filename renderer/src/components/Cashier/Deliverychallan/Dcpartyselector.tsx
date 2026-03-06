import { useState, useRef, useEffect } from "react";
import {
  Party, ShippingAddress, getParties, saveParty, INDIAN_STATES,
} from "./Deliverychallantype";
import "./Createdeliverychallan.css";

// ─── Create New Party Modal ───────────────────────────────────────────────────
interface CreatePartyModalProps {
  initialName?: string;
  onClose: () => void;
  onSave: (party: Party) => void;
}

export function CreatePartyModal({ initialName = "", onClose, onSave }: CreatePartyModalProps) {
  const [name, setName] = useState(initialName);
  const [nameError, setNameError] = useState(false);
  const [mobile, setMobile] = useState("");
  const [showAddress, setShowAddress] = useState(true);
  const [billingAddress, setBillingAddress] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [showGstin, setShowGstin] = useState(true);
  const [gstin, setGstin] = useState("");
  const [stateOpen, setStateOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const stateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (stateRef.current && !stateRef.current.contains(e.target as Node)) setStateOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filteredStates = INDIAN_STATES.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase()));

  const handleSave = () => {
    if (!name.trim()) { setNameError(true); return; }
    const newParty: Party = {
      id: Date.now(),
      name: name.trim(),
      category: "-",
      mobile: mobile || "-",
      type: "Customer",
      balance: 0,
      gstin: gstin || undefined,
      billingAddress: billingAddress || undefined,
      shippingAddresses: [],
    };
    saveParty(newParty);
    onSave(newParty);
  };

  return (
    <div className="dc-overlay" onClick={onClose}>
      <div className="dc-modal dc-create-party-modal" onClick={e => e.stopPropagation()}>
        <div className="dc-modal-hdr">
          <span>Create New Party</span>
          <button className="dc-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="dc-modal-body">
          <div className="dc-field">
            <label>Party Name <span className="dc-req">*</span></label>
            <input
              className={`dc-input${nameError ? " dc-input--error" : ""}`}
              value={name}
              onChange={e => { setName(e.target.value); setNameError(false); }}
              placeholder="Enter name"
            />
            {nameError && <span className="dc-error-text">This field is mandatory</span>}
          </div>
          <div className="dc-field">
            <label>Mobile Number</label>
            <input className="dc-input" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="Enter Mobile Number" />
          </div>

          <div className="dc-address-section">
            <div className="dc-address-section-hdr">
              <span>Address (Optional)</span>
              <button className="dc-link-btn dc-link-btn--red" onClick={() => setShowAddress(!showAddress)}>Remove</button>
            </div>
            {showAddress && (
              <>
                <div className="dc-field">
                  <label>BILLING ADDRESS</label>
                  <textarea className="dc-textarea" value={billingAddress} onChange={e => setBillingAddress(e.target.value)} placeholder="Enter billing address" rows={3} />
                </div>
                <div className="dc-two-col">
                  <div className="dc-field">
                    <label>STATE</label>
                    <div ref={stateRef} className="dc-state-wrap">
                      <div className="dc-state-input" onClick={() => setStateOpen(!stateOpen)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                        <input
                          className="dc-state-search"
                          placeholder="Enter State"
                          value={stateSearch || state}
                          onChange={e => { setStateSearch(e.target.value); setStateOpen(true); }}
                          onFocus={() => setStateOpen(true)}
                        />
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                      {stateOpen && (
                        <div className="dc-state-dropdown">
                          {filteredStates.map(s => (
                            <button key={s} className="dc-state-option" onClick={() => { setState(s); setStateSearch(""); setStateOpen(false); }}>{s}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="dc-field">
                    <label>PINCODE</label>
                    <input className="dc-input" value={pincode} onChange={e => setPincode(e.target.value)} placeholder="Enter Pincode" />
                  </div>
                </div>
                <div className="dc-field">
                  <label>CITY</label>
                  <input className="dc-input" value={city} onChange={e => setCity(e.target.value)} placeholder="Enter City" />
                </div>
                <label className="dc-checkbox-label">
                  <input type="checkbox" checked={sameAsBilling} onChange={e => setSameAsBilling(e.target.checked)} />
                  <span>Shipping address same as billing address</span>
                </label>
              </>
            )}
          </div>

          <div className="dc-address-section">
            <div className="dc-address-section-hdr">
              <span>GSTIN (Optional)</span>
              <button className="dc-link-btn dc-link-btn--red" onClick={() => setShowGstin(!showGstin)}>Remove</button>
            </div>
            {showGstin && (
              <div className="dc-field">
                <label>GSTIN</label>
                <input className="dc-input" value={gstin} onChange={e => setGstin(e.target.value)} placeholder="ex: 29XXXXX9438X1XX" />
              </div>
            )}
          </div>

          <div className="dc-notice">
            You can add Custom Fields from <span className="dc-link-text">Party Settings</span>
          </div>
        </div>
        <div className="dc-modal-footer">
          <button className="dc-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="dc-btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit/Add Shipping Address Modal ─────────────────────────────────────────
function EditShippingAddressModal({ address, partyName, onClose, onSave }: {
  address: ShippingAddress | null;
  partyName: string;
  onClose: () => void;
  onSave: (addr: ShippingAddress) => void;
}) {
  const [name, setName] = useState(address?.name || partyName);
  const [street, setStreet] = useState(address?.street || "");
  const [state, setState] = useState(address?.state || "");
  const [pincode, setPincode] = useState(address?.pincode || "");
  const [city, setCity] = useState(address?.city || "");
  const [stateOpen, setStateOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const stateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (stateRef.current && !stateRef.current.contains(e.target as Node)) setStateOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filteredStates = INDIAN_STATES.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase()));

  const handleSave = () => {
    if (!name.trim()) { alert("Name is required"); return; }
    onSave({ id: address?.id || `addr-${Date.now()}`, name: name.trim(), street, state, pincode, city });
  };

  return (
    <div className="dc-overlay dc-overlay--top" onClick={onClose}>
      <div className="dc-modal dc-shipping-edit-modal" onClick={e => e.stopPropagation()}>
        <div className="dc-modal-hdr">
          <span>{address ? "Edit Shipping Address" : "Add Shipping Address"}</span>
          <button className="dc-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="dc-modal-body">
          <div className="dc-field">
            <label className="dc-field-label--blue">Shipping Name <span className="dc-req">*</span></label>
            <input className="dc-input dc-input--focused" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="dc-field">
            <label className="dc-field-label--blue">Street Address</label>
            <textarea className="dc-textarea" value={street} onChange={e => setStreet(e.target.value)} placeholder="Enter Street Address" rows={3} />
          </div>
          <div className="dc-two-col">
            <div className="dc-field">
              <label>State</label>
              <div ref={stateRef} className="dc-state-wrap">
                <div className="dc-state-input" onClick={() => setStateOpen(!stateOpen)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                  <input
                    className="dc-state-search"
                    placeholder="Enter State"
                    value={stateSearch || state}
                    onChange={e => { setStateSearch(e.target.value); setStateOpen(true); }}
                    onFocus={() => setStateOpen(true)}
                  />
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                {stateOpen && (
                  <div className="dc-state-dropdown">
                    {filteredStates.map(s => (
                      <button key={s} className="dc-state-option" onClick={() => { setState(s); setStateSearch(""); setStateOpen(false); }}>{s}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="dc-field">
              <label>Pincode</label>
              <input className="dc-input" value={pincode} onChange={e => setPincode(e.target.value)} placeholder="Enter pin code" />
            </div>
          </div>
          <div className="dc-field">
            <label>City</label>
            <input className="dc-input" value={city} onChange={e => setCity(e.target.value)} placeholder="Enter City" />
          </div>
        </div>
        <div className="dc-modal-footer">
          <button className="dc-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="dc-btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Change Shipping Address Modal ────────────────────────────────────────────
export function ChangeShippingAddressModal({ party, selected, onClose, onSelect, onPartyUpdate }: {
  party: Party;
  selected: ShippingAddress | null;
  onClose: () => void;
  onSelect: (addr: ShippingAddress | null) => void;
  onPartyUpdate: (p: Party) => void;
}) {
  const [editAddr, setEditAddr] = useState<ShippingAddress | null | "new">(null);
  const [localSelected, setLocalSelected] = useState<string | null>(selected?.id || "default");

  const addresses = party.shippingAddresses || [];
  const defaultAddr: ShippingAddress = {
    id: "default", name: party.name,
    street: party.billingAddress || "", state: "", pincode: "", city: "",
  };
  const allAddrs = addresses.length > 0 ? addresses : [defaultAddr];

  const handleSaveAddr = (addr: ShippingAddress) => {
    const existing = party.shippingAddresses || [];
    const idx = existing.findIndex(a => a.id === addr.id);
    const updated = idx >= 0 ? existing.map(a => a.id === addr.id ? addr : a) : [...existing, addr];
    const updatedParty = { ...party, shippingAddresses: updated };
    saveParty(updatedParty);
    onPartyUpdate(updatedParty);
    setEditAddr(null);
  };

  const handleDone = () => {
    const found = allAddrs.find(a => a.id === localSelected);
    onSelect(found || null);
    onClose();
  };

  if (editAddr !== null) {
    return (
      <EditShippingAddressModal
        address={editAddr === "new" ? null : editAddr}
        partyName={party.name}
        onClose={() => setEditAddr(null)}
        onSave={handleSaveAddr}
      />
    );
  }

  return (
    <div className="dc-overlay" onClick={onClose}>
      <div className="dc-modal dc-shipping-modal" onClick={e => e.stopPropagation()}>
        <div className="dc-modal-hdr">
          <span>Change Shipping Address</span>
          <button className="dc-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="dc-shipping-list-hdr">
          <span>Address</span>
          <span>Edit</span>
          <span>Select</span>
        </div>
        <div className="dc-shipping-list">
          {allAddrs.map(addr => (
            <div key={addr.id} className={`dc-shipping-row${localSelected === addr.id ? " dc-shipping-row--sel" : ""}`}>
              <div className="dc-shipping-addr-info">
                <div className="dc-shipping-addr-name">{addr.name}</div>
                <div className="dc-shipping-addr-detail">{addr.street || "No Address"}</div>
              </div>
              <button className="dc-shipping-edit-btn" onClick={() => setEditAddr(addr)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button
                className={`dc-radio-btn${localSelected === addr.id ? " dc-radio-btn--on" : ""}`}
                onClick={() => setLocalSelected(addr.id)}
              >
                <span className="dc-radio-inner" />
              </button>
            </div>
          ))}
        </div>
        <button className="dc-link-btn dc-link-btn--padded" onClick={() => setEditAddr("new")}>+ Add New Shipping Address</button>
        <div className="dc-modal-footer">
          <button className="dc-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="dc-btn-primary" onClick={handleDone}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ─── Party Selector Panel ─────────────────────────────────────────────────────
interface PartySelectorProps {
  selectedParty: Party | null;
  shipTo: ShippingAddress | null;
  onSelectParty: (p: Party | null) => void;
  onShipToChange: (addr: ShippingAddress | null) => void;
}

export default function DCPartySelector({ selectedParty, shipTo, onSelectParty, onShipToChange }: PartySelectorProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [showCreateParty, setShowCreateParty] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [localParty, setLocalParty] = useState<Party | null>(selectedParty);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setLocalParty(selectedParty); }, [selectedParty]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const parties = getParties();
  const filtered = parties.filter(p =>
    p.name.toLowerCase().includes(searchVal.toLowerCase()) || p.mobile.includes(searchVal)
  );

  const handleSelect = (p: Party) => {
    setLocalParty(p);
    onSelectParty(p);
    setSearchOpen(false);
    setSearchVal("");
  };

  const handlePartyUpdate = (updated: Party) => {
    saveParty(updated);
    setLocalParty(updated);
    onSelectParty(updated);
  };

  if (!localParty) {
    return (
      <>
        <div className="dc-bill-to-label">Bill To</div>
        <div ref={searchRef} className="dc-party-area">
          {!searchOpen ? (
            <div className="dc-add-party-box" onClick={() => setSearchOpen(true)}>
              <span className="dc-add-party-text">+ Add Party</span>
            </div>
          ) : (
            <div className="dc-party-search-wrap">
              <div className="dc-party-search-input-row">
                <input
                  autoFocus
                  className="dc-party-search-input"
                  placeholder="Search party by name or number"
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div className="dc-party-dropdown">
                <div className="dc-party-dropdown-hdr">
                  <span>Party Name</span>
                  <span>Balance</span>
                </div>
                {filtered.map(p => (
                  <div key={p.id} className="dc-party-option" onClick={() => handleSelect(p)}>
                    <span>{p.name}</span>
                    <span className="dc-party-balance">
                      ₹ {Math.abs(p.balance).toLocaleString("en-IN")}
                      {p.balance > 0 && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" style={{marginLeft:4}}><polyline points="12 19 12 5"/><polyline points="5 12 12 19 19 12"/></svg>}
                      {p.balance < 0 && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" style={{marginLeft:4}}><polyline points="12 5 12 19"/><polyline points="19 12 12 5 5 12"/></svg>}
                    </span>
                  </div>
                ))}
                <div className="dc-party-create" onClick={() => { setShowCreateParty(true); setSearchOpen(false); }}>
                  + Create Party
                </div>
              </div>
            </div>
          )}
        </div>

        {showCreateParty && (
          <CreatePartyModal
            initialName={searchVal}
            onClose={() => setShowCreateParty(false)}
            onSave={p => { handleSelect(p); setShowCreateParty(false); }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="dc-party-selected-grid">
        <div className="dc-party-col-box">
          <div className="dc-party-col-hdr">
            <span>Bill To</span>
            <button className="dc-change-btn" onClick={() => { setLocalParty(null); onSelectParty(null); }}>Change Party</button>
          </div>
          <div className="dc-party-col-body">
            <div className="dc-party-name-big">{localParty.name}</div>
            {localParty.mobile && localParty.mobile !== "-" && (
              <div className="dc-party-detail">Phone Number: <strong>{localParty.mobile}</strong></div>
            )}
          </div>
        </div>
        <div className="dc-party-col-box">
          <div className="dc-party-col-hdr">
            <span>Ship To</span>
            <button className="dc-change-btn" onClick={() => setShowShipping(true)}>Change Shipping Address</button>
          </div>
          <div className="dc-party-col-body">
            <div className="dc-party-name-big">{shipTo?.name || localParty.name}</div>
            {localParty.mobile && localParty.mobile !== "-" && (
              <div className="dc-party-detail">Phone Number: <strong>{localParty.mobile}</strong></div>
            )}
            {shipTo?.street && <div className="dc-party-detail">Address: {shipTo.street}</div>}
          </div>
        </div>
      </div>

      {showShipping && (
        <ChangeShippingAddressModal
          party={localParty}
          selected={shipTo}
          onClose={() => setShowShipping(false)}
          onSelect={addr => onShipToChange(addr)}
          onPartyUpdate={handlePartyUpdate}
        />
      )}
    </>
  );
}