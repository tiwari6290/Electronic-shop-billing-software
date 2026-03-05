import { useState, useRef, useEffect } from "react";
import { Party, ShippingAddress, getParties, saveParty, INDIAN_STATES } from "./Salesreturntypes";
import "./Createsalesreturn.css";

// ─── Create New Party Modal ───────────────────────────────────────────────────
interface CreatePartyModalProps {
  initialName?: string;
  onClose: () => void;
  onSave: (party: Party) => void;
}

export function CreatePartyModal({ initialName = "", onClose, onSave }: CreatePartyModalProps) {
  const [name, setName] = useState(initialName);
  const [mobile, setMobile] = useState("");
  const [showAddress, setShowAddress] = useState(false);
  const [billingAddress, setBillingAddress] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [showGstin, setShowGstin] = useState(false);
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
    if (!name.trim()) { alert("Party Name is required"); return; }
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
    <div className="csr-overlay" onClick={onClose}>
      <div className="csr-modal csr-create-party-modal" onClick={e => e.stopPropagation()}>
        <div className="csr-modal-hdr">
          <span>Create New Party</span>
          <button className="csr-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="csr-modal-body">
          <div className="csr-field">
            <label>Party Name <span className="csr-req">*</span></label>
            <input className="csr-input" value={name} onChange={e => setName(e.target.value)} placeholder="Enter party name" />
          </div>
          <div className="csr-field">
            <label>Mobile Number</label>
            <input className="csr-input" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="Enter mobile number" />
          </div>

          {!showAddress ? (
            <button className="csr-link-btn" onClick={() => setShowAddress(true)}>+ Address (Optional)</button>
          ) : (
            <div className="csr-address-section">
              <div className="csr-address-section-hdr">
                <span>Address (Optional)</span>
                <button className="csr-link-btn csr-link-btn--red" onClick={() => setShowAddress(false)}>Remove</button>
              </div>
              <div className="csr-field">
                <label>BILLING ADDRESS <span className="csr-req">*</span></label>
                <textarea className="csr-textarea" value={billingAddress} onChange={e => setBillingAddress(e.target.value)} placeholder="Enter billing address" rows={3} />
              </div>
              <div className="csr-two-col">
                <div className="csr-field">
                  <label>STATE</label>
                  <div ref={stateRef} className="csr-state-wrap">
                    <div className="csr-state-input" onClick={() => setStateOpen(!stateOpen)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                      <input
                        className="csr-state-search"
                        placeholder="Enter State"
                        value={stateSearch || state}
                        onChange={e => { setStateSearch(e.target.value); setStateOpen(true); }}
                        onFocus={() => setStateOpen(true)}
                      />
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                    {stateOpen && (
                      <div className="csr-state-dropdown">
                        {filteredStates.map(s => (
                          <button key={s} className="csr-state-option" onClick={() => { setState(s); setStateSearch(""); setStateOpen(false); }}>{s}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="csr-field">
                  <label>PINCODE</label>
                  <input className="csr-input" value={pincode} onChange={e => setPincode(e.target.value)} placeholder="Enter Pincode" />
                </div>
              </div>
              <div className="csr-field">
                <label>CITY</label>
                <input className="csr-input" value={city} onChange={e => setCity(e.target.value)} placeholder="Enter City" />
              </div>
              <label className="csr-checkbox-label">
                <input type="checkbox" checked={sameAsBilling} onChange={e => setSameAsBilling(e.target.checked)} />
                <span>Shipping address same as billing address</span>
              </label>
            </div>
          )}

          {!showGstin ? (
            <button className="csr-link-btn" onClick={() => setShowGstin(true)}>+ GSTIN (Optional)</button>
          ) : (
            <div className="csr-address-section">
              <div className="csr-address-section-hdr">
                <span>GSTIN (Optional)</span>
                <button className="csr-link-btn csr-link-btn--red" onClick={() => setShowGstin(false)}>Remove</button>
              </div>
              <div className="csr-field">
                <label>GSTIN</label>
                <input className="csr-input" value={gstin} onChange={e => setGstin(e.target.value)} placeholder="ex: 29XXXXX9438X1XX" />
              </div>
            </div>
          )}

          <div className="csr-notice">
            You can add Custom Fields from <span className="csr-link-text">Party Settings</span>
          </div>
        </div>
        <div className="csr-modal-footer">
          <button className="csr-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="csr-btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Change Shipping Address Modal ───────────────────────────────────────────
interface ShippingAddressModalProps {
  party: Party;
  selected: ShippingAddress | null;
  onClose: () => void;
  onSelect: (addr: ShippingAddress | null) => void;
  onPartyUpdate: (p: Party) => void;
}

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
    onSave({
      id: address?.id || `addr-${Date.now()}`,
      name: name.trim(),
      street,
      state,
      pincode,
      city,
    });
  };

  return (
    <div className="csr-overlay csr-overlay--top" onClick={onClose}>
      <div className="csr-modal csr-shipping-edit-modal" onClick={e => e.stopPropagation()}>
        <div className="csr-modal-hdr">
          <span>{address ? "Edit Shipping Address" : "Add Shipping Address"}</span>
          <button className="csr-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="csr-modal-body">
          <div className="csr-field">
            <label className="csr-field-label--blue">Shipping Name <span className="csr-req">*</span></label>
            <input className="csr-input csr-input--focused" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="csr-field">
            <label className="csr-field-label--blue">Street Address <span className="csr-req">*</span></label>
            <textarea className="csr-textarea" value={street} onChange={e => setStreet(e.target.value)} placeholder="Enter Street Address" rows={3} />
          </div>
          <div className="csr-two-col">
            <div className="csr-field">
              <label>State</label>
              <div ref={stateRef} className="csr-state-wrap">
                <div className="csr-state-input" onClick={() => setStateOpen(!stateOpen)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                  <input
                    className="csr-state-search"
                    placeholder="Enter State"
                    value={stateSearch || state}
                    onChange={e => { setStateSearch(e.target.value); setStateOpen(true); }}
                    onFocus={() => setStateOpen(true)}
                  />
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                {stateOpen && (
                  <div className="csr-state-dropdown">
                    {filteredStates.map(s => (
                      <button key={s} className="csr-state-option" onClick={() => { setState(s); setStateSearch(""); setStateOpen(false); }}>{s}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="csr-field">
              <label>Pincode</label>
              <input className="csr-input" value={pincode} onChange={e => setPincode(e.target.value)} placeholder="Enter pin code" />
            </div>
          </div>
          <div className="csr-field">
            <label>City</label>
            <input className="csr-input" value={city} onChange={e => setCity(e.target.value)} placeholder="Enter City" />
          </div>
        </div>
        <div className="csr-modal-footer">
          <button className="csr-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="csr-btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

export function ChangeShippingAddressModal({ party, selected, onClose, onSelect, onPartyUpdate }: ShippingAddressModalProps) {
  const [editAddr, setEditAddr] = useState<ShippingAddress | null | "new">(null);
  const [localSelected, setLocalSelected] = useState<string | null>(selected?.id || null);

  const addresses: ShippingAddress[] = party.shippingAddresses || [];
  // Always show at least a "default" entry from party name
  const defaultAddr: ShippingAddress = {
    id: "default",
    name: party.name,
    street: party.billingAddress || "",
    state: "",
    pincode: "",
    city: "",
  };
  const allAddrs = addresses.length > 0 ? addresses : [defaultAddr];

  const handleSaveAddr = (addr: ShippingAddress) => {
    const existing = party.shippingAddresses || [];
    const idx = existing.findIndex(a => a.id === addr.id);
    let updated: ShippingAddress[];
    if (idx >= 0) { updated = existing.map(a => a.id === addr.id ? addr : a); }
    else { updated = [...existing, addr]; }
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
    <div className="csr-overlay" onClick={onClose}>
      <div className="csr-modal csr-shipping-modal" onClick={e => e.stopPropagation()}>
        <div className="csr-modal-hdr">
          <span>Change Shipping Address</span>
          <button className="csr-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="csr-shipping-list-hdr">
          <span>Address</span>
          <span>Edit</span>
          <span>Select</span>
        </div>
        <div className="csr-shipping-list">
          {allAddrs.map(addr => (
            <div key={addr.id} className={`csr-shipping-row${localSelected === addr.id ? " csr-shipping-row--sel" : ""}`}>
              <div className="csr-shipping-addr-info">
                <div className="csr-shipping-addr-name">{addr.name}</div>
                <div className="csr-shipping-addr-detail">{addr.street || "No Address"}</div>
              </div>
              <button className="csr-shipping-edit-btn" onClick={() => setEditAddr(addr)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button
                className={`csr-radio-btn${localSelected === addr.id ? " csr-radio-btn--on" : ""}`}
                onClick={() => setLocalSelected(addr.id)}
              >
                <span className="csr-radio-inner" />
              </button>
            </div>
          ))}
        </div>
        <button className="csr-link-btn csr-link-btn--padded" onClick={() => setEditAddr("new")}>+ Add New Shipping Address</button>
        <div className="csr-modal-footer">
          <button className="csr-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="csr-btn-primary" onClick={handleDone}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ─── Party Selector Panel ─────────────────────────────────────────────────────
interface PartySelectorProps {
  selectedParty: Party | null;
  shipFrom: ShippingAddress | null;
  onSelectParty: (p: Party) => void;
  onShipFromChange: (addr: ShippingAddress | null) => void;
}

export default function SRPartySelector({ selectedParty, shipFrom, onSelectParty, onShipFromChange }: PartySelectorProps) {
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
  const filtered = parties.filter(p => p.name.toLowerCase().includes(searchVal.toLowerCase()) || p.mobile.includes(searchVal));

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
        <div className="csr-bill-to-label">Bill To</div>
        <div ref={searchRef} className="csr-party-area">
          {!searchOpen ? (
            <div className="csr-add-party-box" onClick={() => setSearchOpen(true)}>
              <span className="csr-add-party-text">+ Add Party</span>
            </div>
          ) : (
            <div className="csr-party-search-wrap">
              <div className="csr-party-search-input-row">
                <input
                  autoFocus
                  className="csr-party-search-input"
                  placeholder="Search party by name or number"
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div className="csr-party-dropdown">
                <div className="csr-party-dropdown-hdr">
                  <span>Party Name</span>
                  <span>Balance</span>
                </div>
                {filtered.map(p => (
                  <div key={p.id} className="csr-party-option" onClick={() => handleSelect(p)}>
                    <span>{p.name}</span>
                    <span className="csr-party-balance">
                      ₹ {Math.abs(p.balance).toLocaleString("en-IN")}
                      {p.balance > 0 && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" style={{marginLeft:4}}><polyline points="12 19 12 5"/><polyline points="5 12 12 19 19 12"/></svg>}
                      {p.balance < 0 && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" style={{marginLeft:4}}><polyline points="12 5 12 19"/><polyline points="19 12 12 5 5 12"/></svg>}
                    </span>
                  </div>
                ))}
                <div className="csr-party-create" onClick={() => { setShowCreateParty(true); setSearchOpen(false); }}>
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
      <div className="csr-party-selected-grid">
        <div className="csr-party-col-box">
          <div className="csr-party-col-hdr">
            <span>Party Name</span>
            <button className="csr-change-btn" onClick={() => { setLocalParty(null); onSelectParty(null as any); }}>Change Party</button>
          </div>
          <div className="csr-party-col-body">
            <div className="csr-party-name-big">{localParty.name}</div>
            {localParty.mobile && localParty.mobile !== "-" && (
              <div className="csr-party-detail">Phone Number: <strong>{localParty.mobile}</strong></div>
            )}
          </div>
        </div>
        <div className="csr-party-col-box">
          <div className="csr-party-col-hdr">
            <span>Ship From</span>
            <button className="csr-change-btn" onClick={() => setShowShipping(true)}>Change Shipping Address</button>
          </div>
          <div className="csr-party-col-body">
            <div className="csr-party-name-big">{shipFrom?.name || localParty.name}</div>
            {localParty.mobile && localParty.mobile !== "-" && (
              <div className="csr-party-detail">Phone Number: <strong>{localParty.mobile}</strong></div>
            )}
            {shipFrom?.street && <div className="csr-party-detail">{shipFrom.street}</div>}
          </div>
        </div>
      </div>

      {showShipping && localParty && (
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