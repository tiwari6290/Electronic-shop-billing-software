import { useState, useRef, useEffect } from "react";
import { Party, getParties } from "./SalesInvoiceTypes";
import "./SIPartySelector.css";

interface Props {
  selectedParty: Party | null;
  shipTo: Party | null;
  onSelectParty: (p: Party) => void;
  onSelectShipTo?: (p: Party | null) => void;
}

interface CreateForm {
  partyName: string; mobileNumber: string; billingAddress: string;
  shippingAddress: string; sameAsBilling: boolean; gstin: string;
}

export interface ShippingAddress {
  id: number;
  name: string;
  street: string;
  state: string;
  pincode: string;
  city: string;
  fromParty?: boolean; // true = seeded from party data (not manually added)
}

export function formatShipAddress(addr: ShippingAddress): string {
  return [addr.street, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ");
}

const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh",
  "Dadra and Nagar Haveli","Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

// ─── localStorage helpers ─────────────────────────────────────────────────────
function loadShippingAddresses(partyId: number): ShippingAddress[] {
  try {
    const all = JSON.parse(localStorage.getItem("shippingAddresses") || "{}");
    return all[String(partyId)] || [];
  } catch { return []; }
}

function saveShippingAddresses(partyId: number, addrs: ShippingAddress[]) {
  try {
    const all = JSON.parse(localStorage.getItem("shippingAddresses") || "{}");
    all[String(partyId)] = addrs;
    localStorage.setItem("shippingAddresses", JSON.stringify(all));
  } catch {}
}

/**
 * Build the initial address list for a party:
 * 1. Load saved addresses from localStorage
 * 2. If party has a shippingAddress and no entry is already seeded/saved for it,
 *    prepend it and immediately persist so it survives re-opens without duplication.
 */
function buildAddressList(party: Party): ShippingAddress[] {
  const saved = loadShippingAddresses(party.id);

  if (party.shippingAddress && party.shippingAddress.trim()) {
    // Already seeded (fromParty flag) or already saved from a previous edit
    const alreadyPresent = saved.some(a => a.fromParty);
    if (!alreadyPresent) {
      const seeded: ShippingAddress = {
        id: -(party.id), // stable negative id tied to party — won't change on re-open
        name: party.name,
        street: party.shippingAddress.trim(),
        state: "", pincode: "", city: "",
        fromParty: true,
      };
      const merged = [seeded, ...saved];
      // Persist immediately so next open loads it and won't duplicate
      saveShippingAddresses(party.id, merged);
      return merged;
    }
  }
  return saved;
}

// ─── Add / Edit Shipping Address Form ─────────────────────────────────────────
function ShippingAddressForm({
  initial,
  partyName,
  onSave,
  onClose,
}: {
  initial?: ShippingAddress;
  partyName: string;
  onSave: (addr: ShippingAddress) => void;
  onClose: () => void;
}) {
  const [name,    setName]    = useState(initial?.name    ?? partyName);
  const [street,  setStreet]  = useState(initial?.street  ?? "");
  const [state,   setState]   = useState(initial?.state   ?? "");
  const [pincode, setPincode] = useState(initial?.pincode ?? "");
  const [city,    setCity]    = useState(initial?.city    ?? "");
  const [nameErr,   setNameErr]   = useState(false);
  const [streetErr, setStreetErr] = useState(false);

  function handleSave() {
    let ok = true;
    if (!name.trim())   { setNameErr(true);   ok = false; }
    if (!street.trim()) { setStreetErr(true);  ok = false; }
    if (!ok) return;
    onSave({
      id: initial?.id ?? Date.now(),
      name: name.trim(), street: street.trim(),
      state, pincode, city,
      fromParty: false,
    });
  }

  return (
    <div className="si-overlay" onClick={onClose}>
      <div className="si-ship-form-modal" onClick={e => e.stopPropagation()}>
        <div className="si-ship-form-hdr">
          <span>{initial ? "Edit Shipping Address" : "Add Shipping Address"}</span>
          <button className="si-ship-form-close" onClick={onClose}>✕</button>
        </div>
        <div className="si-ship-form-body">

          {/* Shipping Name */}
          <div className="si-ship-field">
            <label className="si-ship-label">Shipping Name <span className="si-req">*</span></label>
            <input
              autoFocus
              className={`si-ship-input${nameErr ? " si-ship-input--err" : ""}`}
              value={name}
              onChange={e => { setName(e.target.value); setNameErr(false); }}
              placeholder="e.g. MONDAL ELECTRONIC"
            />
            {nameErr && <span className="si-ship-errmsg">This field is required</span>}
          </div>

          {/* Street Address */}
          <div className="si-ship-field">
            <label className="si-ship-label">Street Address <span className="si-req">*</span></label>
            <textarea
              className={`si-ship-ta${streetErr ? " si-ship-ta--err" : ""}`}
              value={street}
              onChange={e => { setStreet(e.target.value); setStreetErr(false); }}
              placeholder="Enter Street Address"
              rows={3}
            />
            {streetErr && <span className="si-ship-errmsg">This field is required</span>}
          </div>

          {/* State + Pincode */}
          <div className="si-ship-row2">
            <div className="si-ship-field">
              <label className="si-ship-label">State</label>
              <div className="si-ship-sel-wrap">
                <svg className="si-ship-sel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <select className="si-ship-select" value={state} onChange={e => setState(e.target.value)}>
                  <option value="">Enter State</option>
                  {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <svg className="si-ship-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
            <div className="si-ship-field">
              <label className="si-ship-label">Pincode</label>
              <input
                className="si-ship-input"
                value={pincode}
                onChange={e => setPincode(e.target.value)}
                placeholder="Enter pin code"
              />
            </div>
          </div>

          {/* City */}
          <div className="si-ship-field">
            <label className="si-ship-label">City</label>
            <input
              className="si-ship-input"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Enter City"
            />
          </div>

        </div>
        <div className="si-ship-form-ftr">
          <button className="si-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="si-btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Change Shipping Address List Modal ───────────────────────────────────────
function ShippingListModal({
  party,
  currentId,
  onSelect,
  onClose,
}: {
  party: Party;
  currentId?: number;
  onSelect: (addr: ShippingAddress) => void;
  onClose: () => void;
}) {
  // Build initial list: party address first, then saved
  const [addresses, setAddresses] = useState<ShippingAddress[]>(() => buildAddressList(party));
  const [selectedId, setSelectedId] = useState<number | undefined>(
    currentId ?? addresses[0]?.id
  );
  const [formMode,   setFormMode]   = useState<"none" | "add" | "edit">("none");
  const [editTarget, setEditTarget] = useState<ShippingAddress | undefined>();

  function handleFormSave(addr: ShippingAddress) {
    let updated: ShippingAddress[];
    if (formMode === "edit" && editTarget) {
      // When editing the seeded (fromParty) entry, keep it but clear the flag
      const saved = { ...addr, fromParty: false };
      updated = addresses.map(a => a.id === editTarget.id ? saved : a);
    } else {
      updated = [...addresses, { ...addr, fromParty: false }];
    }
    // Always save full list — seeded entries (fromParty) are already there from buildAddressList
    saveShippingAddresses(party.id, updated);
    setAddresses(updated);
    setSelectedId(addr.id);
    setFormMode("none");
    setEditTarget(undefined);
  }

  function handleDone() {
    const sel = addresses.find(a => a.id === selectedId);
    if (sel) onSelect(sel);
    else onClose();
  }

  // Show form overlay on top
  if (formMode !== "none") {
    return (
      <ShippingAddressForm
        initial={editTarget}
        partyName={party.name}
        onSave={handleFormSave}
        onClose={() => { setFormMode("none"); setEditTarget(undefined); }}
      />
    );
  }

  return (
    <div className="si-overlay" onClick={onClose}>
      <div className="si-ship-list-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="si-ship-list-hdr">
          <span className="si-ship-list-title">Change Shipping Address</span>
          <button className="si-ship-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Column labels */}
        <div className="si-ship-col-labels">
          <span>Address</span>
          <div className="si-ship-col-right-labels">
            <span>Edit</span>
            <span>Select</span>
          </div>
        </div>

        {/* Address rows */}
        <div className="si-ship-list-body">
          {addresses.length === 0 ? (
            <div className="si-ship-empty">No shipping addresses yet. Add one below.</div>
          ) : (
            addresses.map(addr => {
              const isSel = selectedId === addr.id;
              return (
                <div
                  key={addr.id}
                  className={`si-ship-addr-row${isSel ? " si-ship-addr-row--sel" : ""}`}
                >
                  <div className="si-ship-addr-info">
                    <div className="si-ship-addr-name">{addr.name}</div>
                    <div className="si-ship-addr-line">{formatShipAddress(addr)}</div>
                  </div>
                  <div className="si-ship-addr-actions">
                    {/* Edit pencil */}
                    <button
                      className="si-ship-edit-btn"
                      title="Edit"
                      onClick={() => { setEditTarget(addr); setFormMode("edit"); }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    {/* Radio */}
                    <button
                      className="si-ship-radio-btn"
                      title="Select"
                      onClick={() => setSelectedId(addr.id)}
                    >
                      <svg viewBox="0 0 24 24" width="22" height="22">
                        <circle cx="12" cy="12" r="9" fill="none"
                          stroke={isSel ? "#6366f1" : "#d1d5db"} strokeWidth="2"/>
                        {isSel && <circle cx="12" cy="12" r="5" fill="#6366f1"/>}
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add New link */}
        <div className="si-ship-add-link">
          <button onClick={() => { setEditTarget(undefined); setFormMode("add"); }}>
            + Add New Shipping Address
          </button>
        </div>

        {/* Footer */}
        <div className="si-ship-list-ftr">
          <button className="si-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="si-btn-primary" onClick={handleDone}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Party Modal ───────────────────────────────────────────────────────
function CreatePartyModal({
  parties, setParties, onCreated, onClose,
}: {
  parties: Party[]; setParties: (p: Party[]) => void;
  onCreated: (p: Party) => void; onClose: () => void;
}) {
  const [nameErr, setNameErr] = useState(false);
  const [form, setForm] = useState<CreateForm>({
    partyName: "", mobileNumber: "", billingAddress: "", shippingAddress: "",
    sameAsBilling: false, gstin: "",
  });

  function handleCreate() {
    if (!form.partyName.trim()) { setNameErr(true); return; }
    const np: Party = {
      id: Date.now(), name: form.partyName, mobile: form.mobileNumber,
      balance: 0, billingAddress: form.billingAddress,
      shippingAddress: form.sameAsBilling ? form.billingAddress : form.shippingAddress,
      gstin: form.gstin,
    };
    const all = [...parties, np];
    localStorage.setItem("parties", JSON.stringify(all));
    setParties(all);
    onCreated(np);
  }

  return (
    <div className="si-overlay" onClick={onClose}>
      <div className="si-cmodal" onClick={e => e.stopPropagation()}>
        <div className="si-cmodal-hdr">
          <span>Create New Party</span>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="si-cmodal-body">
          <div className="si-crow2">
            <div>
              <label>Party Name <span className="si-req">*</span></label>
              <input value={form.partyName}
                onChange={e => { setForm(f => ({ ...f, partyName: e.target.value })); setNameErr(false); }}
                placeholder="Enter name" className={`si-inp${nameErr ? " si-inp--err" : ""}`}/>
              {nameErr && <span className="si-errmsg">This field is mandatory</span>}
            </div>
            <div>
              <label>Mobile Number</label>
              <input value={form.mobileNumber}
                onChange={e => setForm(f => ({ ...f, mobileNumber: e.target.value }))}
                placeholder="Enter Mobile Number" className="si-inp"/>
            </div>
          </div>
          <div className="si-caddr-section">
            <div className="si-caddr-hdr"><span>Address (Optional)</span></div>
            <div className="si-crow2">
              <div>
                <label className="si-alabel">BILLING ADDRESS</label>
                <textarea value={form.billingAddress}
                  onChange={e => setForm(f => ({ ...f, billingAddress: e.target.value }))}
                  placeholder="Enter billing address" className="si-ta"/>
              </div>
              <div>
                <label className="si-alabel">SHIPPING ADDRESS</label>
                <textarea value={form.sameAsBilling ? form.billingAddress : form.shippingAddress}
                  onChange={e => setForm(f => ({ ...f, shippingAddress: e.target.value }))}
                  placeholder="Enter shipping address" className="si-ta" disabled={form.sameAsBilling}/>
                <label className="si-same-chk">
                  <input type="checkbox" checked={form.sameAsBilling}
                    onChange={e => setForm(f => ({ ...f, sameAsBilling: e.target.checked }))}/>
                  Same as billing
                </label>
              </div>
            </div>
          </div>
          <div className="si-cgstin-section">
            <div className="si-caddr-hdr"><span>GSTIN (Optional)</span></div>
            <input value={form.gstin}
              onChange={e => setForm(f => ({ ...f, gstin: e.target.value }))}
              placeholder="ex: 29XXXXX9438X1XX" className="si-inp si-inp--full"/>
          </div>
          <div className="si-chint">
            You can add Custom Fields from <span className="si-link">Party Settings</span>
          </div>
        </div>
        <div className="si-cmodal-ftr">
          <button onClick={onClose} className="si-btn-cancel">Cancel</button>
          <button onClick={handleCreate} className="si-btn-primary">Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SIPartySelector({ selectedParty, shipTo, onSelectParty, onSelectShipTo }: Props) {
  const [parties, setParties]                   = useState<Party[]>(getParties);
  const [search, setSearch]                     = useState("");
  const [showAddDrop, setShowAddDrop]           = useState(false);
  const [showChangeDrop, setShowChangeDrop]     = useState(false);
  const [showCreateParty, setShowCreateParty]   = useState(false);
  const [showShippingList, setShowShippingList] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<ShippingAddress | null>(null);

  const addDropRef    = useRef<HTMLDivElement>(null);
  const changeWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (addDropRef.current && !addDropRef.current.contains(e.target as Node)) setShowAddDrop(false);
      if (changeWrapRef.current && !changeWrapRef.current.contains(e.target as Node)) setShowChangeDrop(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filteredParties = parties.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || (p.mobile || "").includes(search)
  );

  // Reusable party dropdown list
  function PartyDropdownContent({ onPick }: { onPick: (p: Party) => void }) {
    return (
      <div className="si-pdropdown">
        <div className="si-pdrop-search-wrap">
          <input
            autoFocus
            className="si-pdrop-search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search party by name or number"
          />
          <svg className="si-pdrop-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        <div className="si-plist-hdr">
          <span>Party Name</span>
          <span>Balance</span>
        </div>
        <div className="si-plist">
          {filteredParties.map(p => {
            const bal = p.balance ?? 0;
            return (
              <button key={p.id} className="si-prow" onClick={() => { onPick(p); setSearch(""); }}>
                <span>{p.name}</span>
                <span className="si-pbal">
                  ₹ {Math.abs(bal).toLocaleString("en-IN")}
                  {bal < 0 && <span className="si-bal-up">↑</span>}
                  {bal > 0 && <span className="si-bal-down">↓</span>}
                </span>
              </button>
            );
          })}
        </div>
        <button className="si-create-party" onClick={() => {
          setShowAddDrop(false); setShowChangeDrop(false); setShowCreateParty(true);
        }}>
          + Create Party
        </button>
      </div>
    );
  }

  // ── SELECTED state ──────────────────────────────────────────────────────────
  if (selectedParty) {
    return (
      <div className="si-party-selected">

        {/* Bill To */}
        <div className="si-pcol">
          <div className="si-pcard-hdr">
            <span>Bill To</span>
            <div ref={changeWrapRef} className="si-change-btn-wrap">
              <button className="si-pcard-btn" onClick={() => { setSearch(""); setShowChangeDrop(v => !v); }}>
                Change Party
              </button>
              {showChangeDrop && (
                <PartyDropdownContent onPick={p => {
                  onSelectParty(p);
                  setSelectedShipping(null);
                  setShowChangeDrop(false);
                }}/>
              )}
            </div>
          </div>
          <div className="si-pcard-body">
            <div className="si-pname">{selectedParty.name}</div>
            {selectedParty.mobile && (
              <div className="si-pdetail">Phone Number: {selectedParty.mobile}</div>
            )}
            {selectedParty.billingAddress && (
              <div className="si-pdetail">{selectedParty.billingAddress}</div>
            )}
            {selectedParty.gstin && (
              <div className="si-pdetail">GSTIN: {selectedParty.gstin}</div>
            )}
          </div>
        </div>

        {/* Ship To */}
        <div className="si-pcol si-pcol--last">
          <div className="si-pcard-hdr">
            <span>Ship To</span>
            <button className="si-pcard-btn" onClick={() => setShowShippingList(true)}>
              Change Shipping Address
            </button>
          </div>
          <div className="si-pcard-body">
            {selectedShipping ? (
              <>
                <div className="si-pname">{selectedShipping.name}</div>
                <div className="si-pdetail">Address: {formatShipAddress(selectedShipping)}</div>
              </>
            ) : (
              <>
                <div className="si-pname">{selectedParty.name}</div>
                {selectedParty.shippingAddress && (
                  <div className="si-pdetail">Address: {selectedParty.shippingAddress}</div>
                )}
                {selectedParty.mobile && (
                  <div className="si-pdetail">Phone Number: {selectedParty.mobile}</div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Shipping Address List Modal */}
        {showShippingList && (
          <ShippingListModal
            party={selectedParty}
            currentId={selectedShipping?.id}
            onSelect={addr => {
              setSelectedShipping(addr);
              if (onSelectShipTo) onSelectShipTo({
                id: addr.id, name: addr.name, mobile: "", balance: 0,
                billingAddress: formatShipAddress(addr),
                shippingAddress: formatShipAddress(addr),
              });
              setShowShippingList(false);
            }}
            onClose={() => setShowShippingList(false)}
          />
        )}

        {/* Create Party modal */}
        {showCreateParty && (
          <CreatePartyModal parties={parties} setParties={setParties}
            onCreated={p => { onSelectParty(p); setSelectedShipping(null); setShowCreateParty(false); }}
            onClose={() => setShowCreateParty(false)}
          />
        )}
      </div>
    );
  }

  // ── UNSELECTED state ────────────────────────────────────────────────────────
  return (
    <div className="si-party-wrap">
      <div className="si-plabel">Bill To</div>
      <div ref={addDropRef} className="si-pdash-wrap">
        <div className="si-pdashed" onClick={() => { setSearch(""); setShowAddDrop(v => !v); }}>
          + Add Party
        </div>
        {showAddDrop && (
          <PartyDropdownContent onPick={p => { onSelectParty(p); setShowAddDrop(false); }}/>
        )}
      </div>

      {showCreateParty && (
        <CreatePartyModal parties={parties} setParties={setParties}
          onCreated={p => { onSelectParty(p); setShowCreateParty(false); }}
          onClose={() => setShowCreateParty(false)}
        />
      )}
    </div>
  );
}