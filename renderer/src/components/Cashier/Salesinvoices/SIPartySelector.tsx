import { useState, useRef, useEffect, useCallback } from "react";
import { Party } from "./SalesInvoiceTypes";
import {
  getParties,
  createParty as apiCreateParty,
  getPartyAddresses,
  createPartyAddress,
  BackendParty,
} from "../../../api/salesInvoiceApi";
import "./SIPartySelector.css";

interface Props {
  selectedParty: Party | null;
  shipTo: Party | null;
  onSelectParty: (p: Party) => void;
  onSelectShipTo?: (p: Party | null) => void;
}

interface CreateForm {
  partyName: string;
  mobileNumber: string;
  billingAddress: string;
  shippingAddress: string;
  sameAsBilling: boolean;
  gstin: string;
}

export interface ShippingAddress {
  id: number;
  name: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

export function formatShipAddress(addr: ShippingAddress): string {
  return [addr.addressLine, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ");
}

const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh",
  "Dadra and Nagar Haveli","Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

function mapBpToParty(bp: BackendParty): Party {
  return {
    id:              bp.id,
    name:            bp.partyName || bp.name,
    mobile:          bp.mobileNumber ?? "",
    balance:         0,
    email:           bp.email ?? undefined,
    gstin:           bp.gstin ?? undefined,
    billingAddress:  bp.billingAddress ?? undefined,
    shippingAddress: bp.shippingAddress ?? undefined,
    category:        bp.partyCategory ?? undefined,
    type:            bp.partyType,
  };
}

// ─── Add / Edit Shipping Address Form ─────────────────────────────────────────
function ShippingAddressForm({
  partyName,
  onSave,
  onClose,
}: {
  partyName: string;
  onSave: (data: { name: string; addressLine: string; city: string; state: string; pincode: string }) => void;
  onClose: () => void;
}) {
  const [name,     setName]     = useState(partyName);
  const [address,  setAddress]  = useState("");
  const [state,    setState]    = useState("");
  const [pincode,  setPincode]  = useState("");
  const [city,     setCity]     = useState("");
  const [nameErr,  setNameErr]  = useState(false);
  const [addrErr,  setAddrErr]  = useState(false);

  function handleSave() {
    let ok = true;
    if (!name.trim())    { setNameErr(true); ok = false; }
    if (!address.trim()) { setAddrErr(true); ok = false; }
    if (!ok) return;
    onSave({ name: name.trim(), addressLine: address.trim(), city, state, pincode });
  }

  return (
    <div className="si-overlay" onClick={onClose}>
      <div className="si-ship-form-modal" onClick={e => e.stopPropagation()}>
        <div className="si-ship-form-hdr">
          <span>Add Shipping Address</span>
          <button className="si-ship-form-close" onClick={onClose}>✕</button>
        </div>
        <div className="si-ship-form-body">
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
          <div className="si-ship-field">
            <label className="si-ship-label">Street Address <span className="si-req">*</span></label>
            <textarea
              className={`si-ship-ta${addrErr ? " si-ship-ta--err" : ""}`}
              value={address}
              onChange={e => { setAddress(e.target.value); setAddrErr(false); }}
              placeholder="Enter Street Address"
              rows={3}
            />
            {addrErr && <span className="si-ship-errmsg">This field is required</span>}
          </div>
          <div className="si-ship-row2">
            <div className="si-ship-field">
              <label className="si-ship-label">State</label>
              <div className="si-ship-sel-wrap">
                <select className="si-ship-select" value={state} onChange={e => setState(e.target.value)}>
                  <option value="">Select State</option>
                  {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
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

// ─── Shipping Address List Modal ───────────────────────────────────────────────
function ShippingListModal({
  partyId,
  currentId,
  partyName,
  onSelect,
  onClose,
}: {
  partyId: number;
  currentId?: number;
  partyName: string;
  onSelect: (addr: ShippingAddress) => void;
  onClose: () => void;
}) {
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState(false);
  const [saving, setSaving]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPartyAddresses(partyId);
      setAddresses(
        data.map(a => ({
          id:          a.id,
          name:        partyName,
          addressLine: a.addressLine,
          city:        a.city,
          state:       a.state,
          pincode:     a.pincode,
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [partyId, partyName]);

  useEffect(() => { load(); }, [load]);

  async function handleSaveNew(data: {
    name: string; addressLine: string; city: string; state: string; pincode: string;
  }) {
    setSaving(true);
    try {
      await createPartyAddress(partyId, {
        addressType: "Shipping",
        addressLine: data.addressLine,
        city:        data.city,
        state:       data.state,
        pincode:     data.pincode,
      });
      await load();
      setShowAdd(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="si-overlay" onClick={onClose}>
      <div className="si-cmodal si-cmodal--sm" onClick={e => e.stopPropagation()}>
        <div className="si-cmodal-hdr">
          <span>Select Shipping Address</span>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="si-bank-list">
          {loading ? (
            <div className="si-bank-list-empty">Loading addresses…</div>
          ) : addresses.length === 0 ? (
            <div className="si-bank-list-empty">No shipping addresses saved yet.</div>
          ) : addresses.map(addr => (
            <button
              key={addr.id}
              className={`si-bank-list-row${currentId === addr.id ? " si-bank-list-row--sel" : ""}`}
              onClick={() => onSelect(addr)}
            >
              <div className="si-bank-list-info">
                <div className="si-bank-list-name">{addr.name}</div>
                <div className="si-bank-list-meta">{formatShipAddress(addr)}</div>
              </div>
              <svg viewBox="0 0 24 24" width="18" height="18">
                <circle cx="12" cy="12" r="10" fill="none" stroke={currentId === addr.id ? "#6366f1" : "#d1d5db"} strokeWidth="2"/>
                {currentId === addr.id && <circle cx="12" cy="12" r="5" fill="#6366f1"/>}
              </svg>
            </button>
          ))}
        </div>
        <div className="si-ship-add-link" style={{ borderTop: "1.5px dashed #93c5fd" }}>
          <button onClick={() => setShowAdd(true)}>+ Add Shipping Address</button>
        </div>
        <div className="si-cmodal-ftr">
          <button className="si-btn-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>

      {showAdd && (
        <ShippingAddressForm
          partyName={partyName}
          onSave={handleSaveNew}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}

// ─── Create Party Modal ────────────────────────────────────────────────────────
function CreatePartyModal({
  onCreated,
  onClose,
}: {
  onCreated: (p: Party) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CreateForm>({
    partyName: "", mobileNumber: "", billingAddress: "",
    shippingAddress: "", sameAsBilling: false, gstin: "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  async function handleCreate() {
    if (!form.partyName.trim()) { setError("Party name is required"); return; }
    setSaving(true);
    setError("");
    try {
      const bp = await apiCreateParty({
        partyName:       form.partyName.trim(),
        mobileNumber:    form.mobileNumber || undefined,
        billingAddress:  form.billingAddress || undefined,
        shippingAddress: form.sameAsBilling ? form.billingAddress : (form.shippingAddress || undefined),
        gstin:           form.gstin || undefined,
        partyType:       "Customer",
      });
      onCreated(mapBpToParty(bp));
    } catch (err: any) {
      setError(err.message ?? "Failed to create party");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="si-overlay" onClick={onClose}>
      <div className="si-cmodal" onClick={e => e.stopPropagation()}>
        <div className="si-cmodal-hdr">
          <span>Create Party</span>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="si-cmodal-body">
          {error && (
            <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 8, padding: "8px 12px", background: "#fef2f2", borderRadius: 6 }}>
              {error}
            </div>
          )}
          <div className="si-cname-section">
            <div className="si-caddr-hdr"><span>Party Details</span></div>
            <div className="si-cname-row">
              <div>
                <label>Party Name <span className="si-req">*</span></label>
                <input
                  autoFocus
                  value={form.partyName}
                  onChange={e => setForm(f => ({ ...f, partyName: e.target.value }))}
                  placeholder="ex: Ram Kumar"
                  className="si-inp si-inp--full"
                />
              </div>
              <div>
                <label>Mobile Number</label>
                <input
                  value={form.mobileNumber}
                  onChange={e => setForm(f => ({ ...f, mobileNumber: e.target.value }))}
                  placeholder="ex: 98765 43210"
                  className="si-inp si-inp--full"
                />
              </div>
            </div>
          </div>
          <div className="si-caddr-section">
            <div className="si-caddr-hdr"><span>Billing Address (Optional)</span></div>
            <textarea
              value={form.billingAddress}
              onChange={e => setForm(f => ({ ...f, billingAddress: e.target.value }))}
              placeholder="Enter billing address"
              className="si-ta si-ta--full"
              rows={3}
            />
          </div>
          <div className="si-caddr-section">
            <div className="si-caddr-hdr">
              <span>Shipping Address (Optional)</span>
              <label className="si-same-label">
                <input
                  type="checkbox"
                  checked={form.sameAsBilling}
                  onChange={e => setForm(f => ({ ...f, sameAsBilling: e.target.checked }))}
                />
                Same as billing
              </label>
            </div>
            {!form.sameAsBilling && (
              <textarea
                value={form.shippingAddress}
                onChange={e => setForm(f => ({ ...f, shippingAddress: e.target.value }))}
                placeholder="Enter shipping address"
                className="si-ta si-ta--full"
                rows={3}
              />
            )}
          </div>
          <div className="si-cgstin-section">
            <div className="si-caddr-hdr"><span>GSTIN (Optional)</span></div>
            <input
              value={form.gstin}
              onChange={e => setForm(f => ({ ...f, gstin: e.target.value }))}
              placeholder="ex: 29XXXXX9438X1XX"
              className="si-inp si-inp--full"
            />
          </div>
        </div>
        <div className="si-cmodal-ftr">
          <button onClick={onClose} className="si-btn-cancel" disabled={saving}>Cancel</button>
          <button onClick={handleCreate} className="si-btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SIPartySelector({ selectedParty, shipTo, onSelectParty, onSelectShipTo }: Props) {
  const [parties,            setParties]            = useState<Party[]>([]);
  const [partiesLoading,     setPartiesLoading]     = useState(false);
  const [search,             setSearch]             = useState("");
  const [showAddDrop,        setShowAddDrop]        = useState(false);
  const [showChangeDrop,     setShowChangeDrop]     = useState(false);
  const [showCreateParty,    setShowCreateParty]    = useState(false);
  const [showShippingList,   setShowShippingList]   = useState(false);
  const [selectedShipping,   setSelectedShipping]   = useState<ShippingAddress | null>(null);

  const addDropRef    = useRef<HTMLDivElement>(null);
  const changeWrapRef = useRef<HTMLDivElement>(null);

  // Load parties from backend whenever a dropdown opens
  const loadParties = useCallback(async () => {
    setPartiesLoading(true);
    try {
      const data = await getParties();
      setParties(data.map(mapBpToParty));
    } catch (err) {
      console.error(err);
    } finally {
      setPartiesLoading(false);
    }
  }, []);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (addDropRef.current    && !addDropRef.current.contains(e.target as Node))    setShowAddDrop(false);
      if (changeWrapRef.current && !changeWrapRef.current.contains(e.target as Node)) setShowChangeDrop(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filteredParties = parties.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.mobile || "").includes(search)
  );

  function openAddDrop() {
    setSearch("");
    setShowAddDrop(v => !v);
    if (!showAddDrop) loadParties();
  }

  function openChangeDrop() {
    setSearch("");
    setShowChangeDrop(v => !v);
    if (!showChangeDrop) loadParties();
  }

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
          {partiesLoading ? (
            <div style={{ padding: "12px 16px", color: "#6b7280", fontSize: 13 }}>Loading…</div>
          ) : filteredParties.length === 0 ? (
            <div style={{ padding: "12px 16px", color: "#6b7280", fontSize: 13 }}>No parties found</div>
          ) : filteredParties.map(p => {
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
              <button className="si-pcard-btn" onClick={openChangeDrop}>
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

        {showShippingList && (
          <ShippingListModal
            partyId={selectedParty.id}
            currentId={selectedShipping?.id}
            partyName={selectedParty.name}
            onSelect={addr => {
              setSelectedShipping(addr);
              if (onSelectShipTo) onSelectShipTo({
                id:              addr.id,
                name:            addr.name,
                mobile:          "",
                balance:         0,
                billingAddress:  formatShipAddress(addr),
                shippingAddress: formatShipAddress(addr),
              });
              setShowShippingList(false);
            }}
            onClose={() => setShowShippingList(false)}
          />
        )}

        {showCreateParty && (
          <CreatePartyModal
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
        <div className="si-pdashed" onClick={openAddDrop}>
          + Add Party
        </div>
        {showAddDrop && (
          <PartyDropdownContent onPick={p => { onSelectParty(p); setShowAddDrop(false); }}/>
        )}
      </div>

      {showCreateParty && (
        <CreatePartyModal
          onCreated={p => { onSelectParty(p); setShowCreateParty(false); }}
          onClose={() => setShowCreateParty(false)}
        />
      )}
    </div>
  );
}