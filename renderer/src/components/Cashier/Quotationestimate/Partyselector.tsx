import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Party, getParties } from "./Quotationtypes";
import "./PartySelector.css";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ShippingAddress {
  id: string;
  name: string;
  street: string;
  state: string;
  pincode: string;
  city: string;
}

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli",
  "Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

// ─── Add / Edit Shipping Address Modal ───────────────────────────────────────
interface AddShippingModalProps {
  partyName: string;
  initial?: ShippingAddress | null;
  onSave: (addr: ShippingAddress) => void;
  onCancel: () => void;
}

function AddShippingModal({ partyName, initial, onSave, onCancel }: AddShippingModalProps) {
  const [form, setForm] = useState<ShippingAddress>(
    initial ?? { id: `sa-${Date.now()}`, name: partyName, street: "", state: "", pincode: "", city: "" }
  );

  function set(field: keyof ShippingAddress, val: string) {
    setForm((prev) => ({ ...prev, [field]: val }));
  }

  function handleSave() {
    if (!form.name.trim() || !form.street.trim()) return;
    onSave(form);
  }

  return (
    <div className="ps-modal-overlay" onClick={onCancel}>
      <div className="ps-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ps-modal-header">
          <h2 className="ps-modal-title">{initial ? "Edit" : "Add"} Shipping Address</h2>
          <button className="ps-modal-close" onClick={onCancel}>✕</button>
        </div>

        <div className="ps-modal-body">
          <div className="ps-modal-field">
            <label className="ps-modal-label">Shipping Name <span className="ps-required">*</span></label>
            <input
              className="ps-modal-input"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              autoFocus
            />
          </div>

          <div className="ps-modal-field">
            <label className="ps-modal-label">Street Address <span className="ps-required">*</span></label>
            <textarea
              className="ps-modal-textarea"
              placeholder="Enter Street Address"
              value={form.street}
              onChange={(e) => set("street", e.target.value)}
              rows={3}
            />
          </div>

          <div className="ps-modal-grid-2">
            <div className="ps-modal-field">
              <label className="ps-modal-label">State</label>
              <div className="ps-modal-select-wrap">
                <svg className="ps-modal-select-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <select
                  className="ps-modal-select"
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                >
                  <option value="">Enter State</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <svg className="ps-modal-select-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

            <div className="ps-modal-field">
              <label className="ps-modal-label">Pincode</label>
              <input
                className="ps-modal-input"
                placeholder="Enter pin code"
                value={form.pincode}
                onChange={(e) => set("pincode", e.target.value)}
                maxLength={6}
              />
            </div>
          </div>

          <div className="ps-modal-field">
            <label className="ps-modal-label">City</label>
            <input
              className="ps-modal-input"
              placeholder="Enter City"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
            />
          </div>
        </div>

        <div className="ps-modal-footer">
          <button className="ps-modal-cancel" onClick={onCancel}>Cancel</button>
          <button
            className={`ps-modal-save ${(!form.name.trim() || !form.street.trim()) ? "ps-modal-save--disabled" : ""}`}
            onClick={handleSave}
            disabled={!form.name.trim() || !form.street.trim()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Change Shipping Address Modal ────────────────────────────────────────────
interface ChangeShippingModalProps {
  partyName: string;
  addresses: ShippingAddress[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddNew: () => void;
  onEdit: (addr: ShippingAddress) => void;
  onDone: () => void;
  onCancel: () => void;
}

function ChangeShippingModal({
  partyName, addresses, selectedId,
  onSelect, onAddNew, onEdit, onDone, onCancel,
}: ChangeShippingModalProps) {
  return (
    <div className="ps-modal-overlay" onClick={onCancel}>
      <div className="ps-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ps-modal-header">
          <h2 className="ps-modal-title">Change Shipping Address</h2>
          <button className="ps-modal-close" onClick={onCancel}>✕</button>
        </div>

        <div className="ps-shipping-list-header">
          <span>Address</span>
          <span className="ps-shipping-list-actions-label">
            <span>Edit</span>
            <span>Select</span>
          </span>
        </div>

        <div className="ps-shipping-list">
          {addresses.map((addr) => (
            <div key={addr.id} className={`ps-shipping-item ${selectedId === addr.id ? "ps-shipping-item--selected" : ""}`}>
              <div className="ps-shipping-item-info">
                <div className="ps-shipping-item-name">{addr.name}</div>
                <div className="ps-shipping-item-addr">
                  {[addr.street, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
                </div>
              </div>
              <div className="ps-shipping-item-actions">
                <button className="ps-shipping-edit-btn" onClick={() => onEdit(addr)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  className={`ps-shipping-radio ${selectedId === addr.id ? "ps-shipping-radio--selected" : ""}`}
                  onClick={() => onSelect(addr.id)}
                >
                  {selectedId === addr.id && <span className="ps-shipping-radio-dot" />}
                </button>
              </div>
            </div>
          ))}

          <button className="ps-shipping-add-new" onClick={onAddNew}>
            + Add New Shipping Address
          </button>
        </div>

        <div className="ps-modal-footer">
          <button className="ps-modal-cancel" onClick={onCancel}>Cancel</button>
          <button className="ps-modal-save" onClick={onDone}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main PartySelector ───────────────────────────────────────────────────────
interface PartySelectorProps {
  selectedParty: Party | null;
  onSelectParty: (party: Party | null) => void;
}

export default function PartySelector({ selectedParty, onSelectParty }: PartySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const parties = getParties();

  // Shipping address state
  const [shippingAddresses, setShippingAddresses] = useState<ShippingAddress[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string>("");
  const [showChangeShipping, setShowChangeShipping] = useState(false);
  const [showAddShipping, setShowAddShipping] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);

  // Track which party we've seeded so new addresses don't trigger re-seed
  const seededPartyRef = useRef<number | null>(null);

  useEffect(() => {
    if (selectedParty) {
      if (seededPartyRef.current !== selectedParty.id) {
        seededPartyRef.current = selectedParty.id;
        const street = selectedParty.shippingAddress || selectedParty.billingAddress || "";
        const defaultAddr: ShippingAddress = {
          id: `sa-default-${selectedParty.id}`,
          name: selectedParty.name,
          street,
          state: "",
          pincode: "",
          city: "",
        };
        setShippingAddresses([defaultAddr]);
        setSelectedShippingId(defaultAddr.id);
      }
    } else {
      seededPartyRef.current = null;
      setShippingAddresses([]);
      setSelectedShippingId("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedParty?.id]);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = parties.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeShipping = shippingAddresses.find((a) => a.id === selectedShippingId);

  function handleSaveShipping(addr: ShippingAddress) {
    if (editingAddress) {
      setShippingAddresses((prev) => prev.map((a) => a.id === addr.id ? addr : a));
    } else {
      setShippingAddresses((prev) => [...prev, addr]);
      setSelectedShippingId(addr.id);
    }
    setShowAddShipping(false);
    setEditingAddress(null);
    // Go back to change shipping list
    setShowChangeShipping(true);
  }

  function handleEditAddress(addr: ShippingAddress) {
    setEditingAddress(addr);
    setShowChangeShipping(false);
    setShowAddShipping(true);
  }

  function handleAddNew() {
    setEditingAddress(null);
    setShowChangeShipping(false);
    setShowAddShipping(true);
  }

  function handleDone() {
    setShowChangeShipping(false);
  }

  // ── Selected state view ───────────────────────────────────────────────────
  if (selectedParty) {
    return (
      <>
        <div className="ps-selected-wrap">
          {/* Bill To */}
          <div className="ps-address-col">
            <div className="ps-address-header">
              <span className="ps-address-title">Bill To</span>
              <button className="ps-change-btn" onClick={() => onSelectParty(null)}>
                Change Party
              </button>
            </div>
            <div className="ps-address-body">
              <div className="ps-party-name">{selectedParty.name}</div>
              {selectedParty.mobile && selectedParty.mobile !== "-" && (
                <div className="ps-party-info">
                  Phone Number: <span>{selectedParty.mobile}</span>
                </div>
              )}
              {selectedParty.billingAddress && (
                <div className="ps-party-info">{selectedParty.billingAddress}</div>
              )}
            </div>
          </div>

          {/* Ship To */}
          <div className="ps-address-col">
            <div className="ps-address-header">
              <span className="ps-address-title">Ship To</span>
              <button className="ps-change-btn" onClick={() => setShowChangeShipping(true)}>
                Change Shipping Address
              </button>
            </div>
            <div className="ps-address-body">
              <div className="ps-party-name">{selectedParty.name}</div>
              {selectedParty.mobile && selectedParty.mobile !== "-" && (
                <div className="ps-party-info">
                  Phone Number: <span>{selectedParty.mobile}</span>
                </div>
              )}
              {/* Show active shipping street — which is seeded from party's shippingAddress on select */}
              {activeShipping?.street && (
                <div className="ps-party-info">{activeShipping.street}</div>
              )}
              {activeShipping && (activeShipping.city || activeShipping.state || activeShipping.pincode) && (
                <div className="ps-party-info">
                  {[activeShipping.city, activeShipping.state, activeShipping.pincode].filter(Boolean).join(", ")}
                </div>
              )}
              {/* Fallback: if no active shipping set yet but party has a shippingAddress string */}
              {!activeShipping && selectedParty.shippingAddress && (
                <div className="ps-party-info">{selectedParty.shippingAddress}</div>
              )}
              {!activeShipping && !selectedParty.shippingAddress && selectedParty.billingAddress && (
                <div className="ps-party-info">{selectedParty.billingAddress}</div>
              )}
            </div>
          </div>
        </div>

        {/* Change Shipping Modal */}
        {showChangeShipping && (
          <ChangeShippingModal
            partyName={selectedParty.name}
            addresses={shippingAddresses}
            selectedId={selectedShippingId}
            onSelect={setSelectedShippingId}
            onAddNew={handleAddNew}
            onEdit={handleEditAddress}
            onDone={handleDone}
            onCancel={() => setShowChangeShipping(false)}
          />
        )}

        {/* Add / Edit Shipping Modal */}
        {showAddShipping && (
          <AddShippingModal
            partyName={selectedParty.name}
            initial={editingAddress}
            onSave={handleSaveShipping}
            onCancel={() => {
              setShowAddShipping(false);
              setEditingAddress(null);
              setShowChangeShipping(true);
            }}
          />
        )}
      </>
    );
  }

  // ── No party selected view ─────────────────────────────────────────────────
  return (
    <div className="ps-wrap" ref={ref}>
      <div className="ps-label">Bill To</div>
      {!open ? (
        <button className="ps-add-btn" onClick={() => setOpen(true)}>
          + Add Party
        </button>
      ) : (
        <div className="ps-dropdown">
          <div className="ps-search-row">
            <input
              autoFocus
              className="ps-search-input"
              placeholder="Search party by name or number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg className="ps-search-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <div className="ps-list-header">
            <span>Party Name</span>
            <span>Balance</span>
          </div>
          <div className="ps-list">
            {filtered.length === 0 && (
              <div className="ps-no-results">No parties found</div>
            )}
            {filtered.map((p) => (
              <div
                key={p.id}
                className="ps-list-item"
                onClick={() => {
                  onSelectParty(p);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <span className="ps-item-name">{p.name}</span>
                <span className="ps-item-balance">
                  ₹ {Math.abs(p.balance).toLocaleString("en-IN")}
                  {p.balance < 0 && (
                    <svg className="ps-balance-arrow ps-balance-arrow--down" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <polyline points="5 12 12 19 19 12" />
                    </svg>
                  )}
                </span>
              </div>
            ))}
          </div>
          <button className="ps-create-btn" onClick={() => navigate("/cashier/create-party")}>
            + Create Party
          </button>
        </div>
      )}
    </div>
  );
}