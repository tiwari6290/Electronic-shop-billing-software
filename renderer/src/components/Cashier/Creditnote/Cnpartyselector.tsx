import { useState, useRef, useEffect } from "react";
import {
  Party, ShippingAddress, getParties, saveParty, INDIAN_STATES,
} from "./Creditnotetypes";
import "./Createcreditnote.css";

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
    const parties = getParties();
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
    <div className="cn-overlay" onClick={onClose}>
      <div className="cn-modal cn-create-party-modal" onClick={e => e.stopPropagation()}>
        <div className="cn-modal-hdr">
          <span>Create New Party</span>
          <button className="cn-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="cn-modal-body">
          <div className="cn-field">
            <label>Party Name <span className="cn-req">*</span></label>
            <input
              className={`cn-input${nameError ? " cn-input--error" : ""}`}
              value={name}
              onChange={e => { setName(e.target.value); setNameError(false); }}
              placeholder="Enter name"
            />
            {nameError && <span className="cn-error-text">This field is mandatory</span>}
          </div>
          <div className="cn-field">
            <label>Mobile Number</label>
            <input className="cn-input" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="Enter Mobile Number" />
          </div>

          <div className="cn-address-section">
            <div className="cn-address-section-hdr">
              <span>Address (Optional)</span>
              <button className="cn-link-btn cn-link-btn--red" onClick={() => setShowAddress(!showAddress)}>Remove</button>
            </div>
            {showAddress && (
              <>
                <div className="cn-field">
                  <label>BILLING ADDRESS <span className="cn-req">*</span></label>
                  <textarea className="cn-textarea" value={billingAddress} onChange={e => setBillingAddress(e.target.value)} placeholder="Enter billing address" rows={3} />
                </div>
                <div className="cn-two-col">
                  <div className="cn-field">
                    <label>STATE</label>
                    <div ref={stateRef} className="cn-state-wrap">
                      <div className="cn-state-input" onClick={() => setStateOpen(!stateOpen)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                        <input
                          className="cn-state-search"
                          placeholder="Enter State"
                          value={stateSearch || state}
                          onChange={e => { setStateSearch(e.target.value); setStateOpen(true); }}
                          onFocus={() => setStateOpen(true)}
                        />
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                      {stateOpen && (
                        <div className="cn-state-dropdown">
                          {filteredStates.map(s => (
                            <button key={s} className="cn-state-option" onClick={() => { setState(s); setStateSearch(""); setStateOpen(false); }}>{s}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="cn-field">
                    <label>PINCODE</label>
                    <input className="cn-input" value={pincode} onChange={e => setPincode(e.target.value)} placeholder="Enter Pincode" />
                  </div>
                </div>
                <div className="cn-field">
                  <label>CITY</label>
                  <input className="cn-input" value={city} onChange={e => setCity(e.target.value)} placeholder="Enter City" />
                </div>
                <label className="cn-checkbox-label">
                  <input type="checkbox" checked={sameAsBilling} onChange={e => setSameAsBilling(e.target.checked)} />
                  <span>Shipping address same as billing address</span>
                </label>
              </>
            )}
          </div>

          <div className="cn-address-section">
            <div className="cn-address-section-hdr">
              <span>GSTIN (Optional)</span>
              <button className="cn-link-btn cn-link-btn--red" onClick={() => setShowGstin(!showGstin)}>Remove</button>
            </div>
            {showGstin && (
              <div className="cn-field">
                <label>GSTIN</label>
                <input className="cn-input" value={gstin} onChange={e => setGstin(e.target.value)} placeholder="ex: 29XXXXX9438X1XX" />
              </div>
            )}
          </div>

          <div className="cn-notice">
            You can add Custom Fields from <span className="cn-link-text">Party Settings</span>
          </div>
        </div>
        <div className="cn-modal-footer">
          <button className="cn-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="cn-btn-primary" onClick={handleSave}>Save</button>
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
    if (!name.trim()) { alert("Shipping Name is required"); return; }
    onSave({ id: address?.id || `addr-${Date.now()}`, name: name.trim(), street, state, pincode, city });
  };

  return (
    <div className="cn-overlay cn-overlay--top" onClick={onClose}>
      <div className="cn-modal cn-shipping-edit-modal" onClick={e => e.stopPropagation()}>
        <div className="cn-modal-hdr">
          <span>{address ? "Edit Shipping Address" : "Add Shipping Address"}</span>
          <button className="cn-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="cn-modal-body">
          <div className="cn-field">
            <label className="cn-field-label--blue">Shipping Name <span className="cn-req">*</span></label>
            <input className="cn-input cn-input--focused" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="cn-field">
            <label className="cn-field-label--blue">Street Address <span className="cn-req">*</span></label>
            <textarea className="cn-textarea" value={street} onChange={e => setStreet(e.target.value)} placeholder="Enter Street Address" rows={3} />
          </div>
          <div className="cn-two-col">
            <div className="cn-field">
              <label>State</label>
              <div ref={stateRef} className="cn-state-wrap">
                <div className="cn-state-input" onClick={() => setStateOpen(!stateOpen)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                  <input
                    className="cn-state-search"
                    placeholder="Enter State"
                    value={stateSearch || state}
                    onChange={e => { setStateSearch(e.target.value); setStateOpen(true); }}
                    onFocus={() => setStateOpen(true)}
                  />
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                {stateOpen && (
                  <div className="cn-state-dropdown">
                    {filteredStates.map(s => (
                      <button key={s} className="cn-state-option" onClick={() => { setState(s); setStateSearch(""); setStateOpen(false); }}>{s}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="cn-field">
              <label>Pincode</label>
              <input className="cn-input" value={pincode} onChange={e => setPincode(e.target.value)} placeholder="Enter pin code" />
            </div>
          </div>
          <div className="cn-field">
            <label>City</label>
            <input className="cn-input" value={city} onChange={e => setCity(e.target.value)} placeholder="Enter City" />
          </div>
        </div>
        <div className="cn-modal-footer">
          <button className="cn-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="cn-btn-primary" onClick={handleSave}>Save</button>
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
    <div className="cn-overlay" onClick={onClose}>
      <div className="cn-modal cn-shipping-modal" onClick={e => e.stopPropagation()}>
        <div className="cn-modal-hdr">
          <span>Change Shipping Address</span>
          <button className="cn-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="cn-shipping-list-hdr">
          <span>Address</span>
          <span>Edit</span>
          <span>Select</span>
        </div>
        <div className="cn-shipping-list">
          {allAddrs.map(addr => (
            <div key={addr.id} className={`cn-shipping-row${localSelected === addr.id ? " cn-shipping-row--sel" : ""}`}>
              <div className="cn-shipping-addr-info">
                <div className="cn-shipping-addr-name">{addr.name}</div>
                <div className="cn-shipping-addr-detail">{addr.street || "No Address"}</div>
              </div>
              <button className="cn-shipping-edit-btn" onClick={() => setEditAddr(addr)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button
                className={`cn-radio-btn${localSelected === addr.id ? " cn-radio-btn--on" : ""}`}
                onClick={() => setLocalSelected(addr.id)}
              >
                <span className="cn-radio-inner" />
              </button>
            </div>
          ))}
        </div>
        <button className="cn-link-btn cn-link-btn--padded" onClick={() => setEditAddr("new")}>+ Add New Shipping Address</button>
        <div className="cn-modal-footer">
          <button className="cn-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="cn-btn-primary" onClick={handleDone}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ─── Party Selector Panel ─────────────────────────────────────────────────────
interface PartySelectorProps {
  selectedParty: Party | null;
  shipFrom: ShippingAddress | null;
  onSelectParty: (p: Party | null) => void;
  onShipFromChange: (addr: ShippingAddress | null) => void;
}

export default function CNPartySelector({ selectedParty, shipFrom, onSelectParty, onShipFromChange }: PartySelectorProps) {
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
        <div className="cn-bill-to-label">Bill To</div>
        <div ref={searchRef} className="cn-party-area">
          {!searchOpen ? (
            <div className="cn-add-party-box" onClick={() => setSearchOpen(true)}>
              <span className="cn-add-party-text">+ Add Party</span>
            </div>
          ) : (
            <div className="cn-party-search-wrap">
              <div className="cn-party-search-input-row">
                <input
                  autoFocus
                  className="cn-party-search-input"
                  placeholder="Search party by name or number"
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div className="cn-party-dropdown">
                <div className="cn-party-dropdown-hdr">
                  <span>Party Name</span>
                  <span>Balance</span>
                </div>
                {filtered.map(p => (
                  <div key={p.id} className="cn-party-option" onClick={() => handleSelect(p)}>
                    <span>{p.name}</span>
                    <span className="cn-party-balance">
                      ₹ {Math.abs(p.balance).toLocaleString("en-IN")}
                      {p.balance > 0 && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" style={{marginLeft:4}}><polyline points="12 19 12 5"/><polyline points="5 12 12 19 19 12"/></svg>}
                      {p.balance < 0 && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" style={{marginLeft:4}}><polyline points="12 5 12 19"/><polyline points="19 12 12 5 5 12"/></svg>}
                    </span>
                  </div>
                ))}
                <div className="cn-party-create" onClick={() => { setShowCreateParty(true); setSearchOpen(false); }}>
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
      <div className="cn-party-selected-grid">
        <div className="cn-party-col-box">
          <div className="cn-party-col-hdr">
            <span>Party Name</span>
            <button className="cn-change-btn" onClick={() => { setLocalParty(null); onSelectParty(null); }}>Change Party</button>
          </div>
          <div className="cn-party-col-body">
            <div className="cn-party-name-big">{localParty.name}</div>
            {localParty.mobile && localParty.mobile !== "-" && (
              <div className="cn-party-detail">Phone Number: <strong>{localParty.mobile}</strong></div>
            )}
          </div>
        </div>
        <div className="cn-party-col-box">
          <div className="cn-party-col-hdr">
            <span>Ship From</span>
            <button className="cn-change-btn" onClick={() => setShowShipping(true)}>Change Shipping Address</button>
          </div>
          <div className="cn-party-col-body">
            <div className="cn-party-name-big">{shipFrom?.name || localParty.name}</div>
            {localParty.mobile && localParty.mobile !== "-" && (
              <div className="cn-party-detail">Phone Number: <strong>{localParty.mobile}</strong></div>
            )}
            {shipFrom?.street && <div className="cn-party-detail">Address: {shipFrom.street}</div>}
          </div>
        </div>
      </div>

      {showShipping && (
        <ChangeShippingAddressModal
          party={localParty}
          selected={shipFrom}
          onClose={() => setShowShipping(false)}
          onSelect={addr => { onShipFromChange(addr); }}
          onPartyUpdate={handlePartyUpdate}
        />
      )}
    </>
  );
}