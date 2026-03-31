import api from "../../../lib/axios";
import { useState, useRef, useEffect } from "react";
import "./Godown.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GodownStock {
  godownName: string;
  stockAvailable: string;
  address: string;
}

interface Item {
  id: string;
  itemName: string;
  itemCode: string;
  stockQty: number;         // ✅ number, not string (backend returns number)
  sellingPrice: number | null;
  purchasePrice: number | null;
  godownStock: GodownStock[];
}

interface Godown {
  id: string;
  name: string;
  isMain: boolean;
  streetAddress: string;
  state: string;
  pincode: string;
  city: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtPrice = (n: number | null | undefined) => {
  if (n === null || n === undefined) return "₹0";
  return `₹${n.toLocaleString("en-IN")}`;
};

// ✅ Stock value uses purchasePrice (falls back to sellingPrice if null)
const calcStockValue = (item: Item): string => {
  const qty = item.stockQty ?? 0;
  const price = item.purchasePrice ?? item.sellingPrice ?? 0;
  const val = qty * price;
  if (val === 0) return "₹0";
  return `₹${val.toLocaleString("en-IN")}`;
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const IcChevDown = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IcEdit = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IcTrash = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);
const IcX = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <line x1={18} y1={6} x2={6} y2={18} />
    <line x1={6} y1={6} x2={18} y2={18} />
  </svg>
);
const IcTransfer = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M17 1l4 4-4 4" />
    <path d="M3 11V9a4 4 0 014-4h14" />
    <path d="M7 23l-4-4 4-4" />
    <path d="M21 13v2a4 4 0 01-4 4H3" />
  </svg>
);
const IcPlus = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <line x1={12} y1={5} x2={12} y2={19} />
    <line x1={5} y1={12} x2={19} y2={12} />
  </svg>
);
const IcWarehouse = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IcSearch = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx={11} cy={11} r={8} />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

// ─── Indian States ────────────────────────────────────────────────────────────

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Delhi","Jammu and Kashmir",
  "Ladakh","Lakshadweep","Puducherry",
];

// ─── Edit Godown Modal ────────────────────────────────────────────────────────

interface EditModalProps {
  godown: Godown;
  onClose: () => void;
  onSave: (updated: Godown) => void;
}

const EditGodownModal = ({ godown, onClose, onSave }: EditModalProps) => {
  const [form, setForm] = useState({ ...godown });
  const [stateSearch, setStateSearch] = useState(godown.state);
  const [stateOpen, setStateOpen] = useState(false);
  const stateRef = useRef<HTMLDivElement>(null);

  const filteredStates = INDIAN_STATES.filter(s =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (stateRef.current && !stateRef.current.contains(e.target as Node))
        setStateOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { alert("Godown name is required"); return; }
    try {
      await api.put(`/godowns/${form.id}`, {
        godownName: form.name,
        streetAddress: form.streetAddress,
        stateName: form.state,
        cityName: form.city,
        pincode: form.pincode,
      });
      onSave(form);
      onClose();
    } catch (error) {
      console.error("Edit godown failed", error);
    }
  };

  return (
    <div className="gd-overlay" onClick={onClose}>
      <div className="gd-modal" onClick={e => e.stopPropagation()}>
        <div className="gd-modal-header">
          <span className="gd-modal-title">Edit Godown</span>
          <button className="gd-modal-close" onClick={onClose}><IcX /></button>
        </div>
        <div className="gd-modal-body">
          <div className="gd-field">
            <label className="gd-label">Godown Name <span className="gd-required">*</span></label>
            <input className="gd-input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Enter godown name" />
          </div>
          <div className="gd-field">
            <label className="gd-label">Street Address</label>
            <textarea className="gd-textarea" value={form.streetAddress} onChange={e => set("streetAddress", e.target.value)} placeholder="Enter Street Address" rows={2} />
          </div>
          <div className="gd-row-2">
            <div className="gd-field">
              <label className="gd-label">State</label>
              <div className="gd-state-wrap" ref={stateRef}>
                <div className={`gd-state-trigger${stateOpen ? " open" : ""}`} onClick={() => setStateOpen(v => !v)}>
                  <IcSearch />
                  <input
                    className="gd-state-input"
                    value={stateSearch}
                    onChange={e => { setStateSearch(e.target.value); setStateOpen(true); }}
                    placeholder="Enter State"
                    onClick={e => { e.stopPropagation(); setStateOpen(true); }}
                  />
                  <IcChevDown />
                </div>
                {stateOpen && (
                  <div className="gd-state-dropdown">
                    {filteredStates.length > 0
                      ? filteredStates.map(s => (
                          <div key={s} className={`gd-state-option${form.state === s ? " selected" : ""}`}
                            onClick={() => { set("state", s); setStateSearch(s); setStateOpen(false); }}>
                            {s}
                          </div>
                        ))
                      : <div className="gd-state-empty">No results</div>
                    }
                  </div>
                )}
              </div>
            </div>
            <div className="gd-field">
              <label className="gd-label">Pincode</label>
              <input className="gd-input" value={form.pincode} onChange={e => set("pincode", e.target.value)} placeholder="ex: 560029" maxLength={6} />
            </div>
          </div>
          <div className="gd-field">
            <label className="gd-label">City</label>
            <input className="gd-input" value={form.city} onChange={e => set("city", e.target.value)} placeholder="ex: Bangalore" />
          </div>
        </div>
        <div className="gd-modal-footer">
          <button className="gd-btn-secondary" onClick={onClose}>Close</button>
          <button className="gd-btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

// ─── Delete Godown Confirm Modal ──────────────────────────────────────────────

const DeleteGodownModal = ({ godownName, onCancel, onConfirm }: {
  godownName: string; onCancel: () => void; onConfirm: () => void;
}) => (
  <div className="gd-overlay" onClick={onCancel}>
    <div className="gd-confirm-modal" onClick={e => e.stopPropagation()}>
      <div className="gd-confirm-header">
        <span className="gd-confirm-title">Delete Godown?</span>
        <button className="gd-modal-close" onClick={onCancel}><IcX /></button>
      </div>
      <div className="gd-confirm-body">
        This godown will be deleted permanently. Are you sure you want to proceed?
      </div>
      <div className="gd-confirm-footer">
        <button className="gd-btn-leave" onClick={onCancel}>Leave</button>
        <button className="gd-btn-delete-confirm" onClick={onConfirm}>Yes, Delete</button>
      </div>
    </div>
  </div>
);

// ─── Create Godown Modal ──────────────────────────────────────────────────────

const CreateGodownModal = ({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (godown: Godown) => void;
}) => {
  const [form, setForm] = useState({ name: "", streetAddress: "", state: "", pincode: "", city: "" });
  const [stateSearch, setStateSearch] = useState("");
  const [stateOpen, setStateOpen] = useState(false);
  const stateRef = useRef<HTMLDivElement>(null);

  const filteredStates = INDIAN_STATES.filter(s =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (stateRef.current && !stateRef.current.contains(e.target as Node)) setStateOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.name.trim()) { alert("Godown name is required"); return; }
    try {
      const res = await api.post("/godowns/create", {
        godownName: form.name,
        streetAddress: form.streetAddress,
        stateName: form.state,
        cityName: form.city,
        pincode: form.pincode,
      });
      const g = res.data.data;
      onCreate({
        id: String(g.godown_id),
        name: g.godown_name,
        isMain: false,
        streetAddress: g.street_address || "",
        state: g.state_name || "",
        pincode: g.pincode || "",
        city: g.city_name || "",
      });
      onClose();
    } catch (error) {
      console.error("Create godown failed", error);
    }
  };

  return (
    <div className="gd-overlay" onClick={onClose}>
      <div className="gd-modal" onClick={e => e.stopPropagation()}>
        <div className="gd-modal-header">
          <span className="gd-modal-title">Create Godown</span>
          <button className="gd-modal-close" onClick={onClose}><IcX /></button>
        </div>
        <div className="gd-modal-body">
          <div className="gd-field">
            <label className="gd-label">Godown Name <span className="gd-required">*</span></label>
            <input className="gd-input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Enter godown name" />
          </div>
          <div className="gd-field">
            <label className="gd-label">Street Address</label>
            <textarea className="gd-textarea" value={form.streetAddress} onChange={e => set("streetAddress", e.target.value)} placeholder="Enter Street Address" rows={2} />
          </div>
          <div className="gd-row-2">
            <div className="gd-field">
              <label className="gd-label">State</label>
              <div className="gd-state-wrap" ref={stateRef}>
                <div className={`gd-state-trigger${stateOpen ? " open" : ""}`} onClick={() => setStateOpen(v => !v)}>
                  <IcSearch />
                  <input
                    className="gd-state-input"
                    value={stateSearch}
                    onChange={e => { setStateSearch(e.target.value); setStateOpen(true); }}
                    placeholder="Enter State"
                    onClick={e => { e.stopPropagation(); setStateOpen(true); }}
                  />
                  <IcChevDown />
                </div>
                {stateOpen && (
                  <div className="gd-state-dropdown">
                    {filteredStates.length > 0
                      ? filteredStates.map(s => (
                          <div key={s} className={`gd-state-option${form.state === s ? " selected" : ""}`}
                            onClick={() => { set("state", s); setStateSearch(s); setStateOpen(false); }}>
                            {s}
                          </div>
                        ))
                      : <div className="gd-state-empty">No results</div>
                    }
                  </div>
                )}
              </div>
            </div>
            <div className="gd-field">
              <label className="gd-label">Pincode</label>
              <input className="gd-input" value={form.pincode} onChange={e => set("pincode", e.target.value)} placeholder="ex: 560029" maxLength={6} />
            </div>
          </div>
          <div className="gd-field">
            <label className="gd-label">City</label>
            <input className="gd-input" value={form.city} onChange={e => set("city", e.target.value)} placeholder="ex: Bangalore" />
          </div>
        </div>
        <div className="gd-modal-footer">
          <button className="gd-btn-secondary" onClick={onClose}>Close</button>
          <button className="gd-btn-primary" onClick={handleCreate}>Save</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Godown Page ─────────────────────────────────────────────────────────

export default function GodownPage() {
  const [items, setItems]                   = useState<Item[]>([]);
  const [godowns, setGodowns]               = useState<Godown[]>([]);
  const [selectedGodownId, setSelectedGodownId] = useState<string>("");
  const [dropdownOpen, setDropdownOpen]     = useState(false);
  const [editingGodown, setEditingGodown]   = useState<Godown | null>(null);
  const [deletingGodown, setDeletingGodown] = useState<Godown | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Fetch all godowns ──────────────────────────────────────────────────────
  const fetchGodowns = async () => {
    try {
      const res = await api.get("/godowns");
      const mapped: Godown[] = res.data.data.map((g: any) => ({
        id: String(g.godown_id),
        name: g.godown_name,
        isMain: false,
        streetAddress: g.street_address || "",
        state: g.state_name || "",
        pincode: g.pincode || "",
        city: g.city_name || "",
      }));
      setGodowns(mapped);
      // Auto-select first godown
      if (mapped.length > 0 && !selectedGodownId) {
        setSelectedGodownId(mapped[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch godowns", error);
    }
  };

  // ── Fetch items for selected godown ───────────────────────────────────────
  // Uses GET /items/godown/:godownId → getItemsByGodown controller
  // Backend returns: { id, name, itemCode, salesPrice, purchasePrice, stockQty }
  const fetchItemsByGodown = async (godownId: string) => {
    if (!godownId) return;
    try {
      const res = await api.get(`/items/godown/${godownId}`);

      // ✅ Map backend fields exactly to Item interface
      const mappedItems: Item[] = res.data.data.map((item: any) => ({
        id: String(item.id),
        itemName: item.name ?? "",
        itemCode: item.itemCode ?? "",
        stockQty: Number(item.stockQty ?? 0),    // backend returns number
        sellingPrice: item.salesPrice != null ? Number(item.salesPrice) : null,
        purchasePrice: item.purchasePrice != null ? Number(item.purchasePrice) : null,
        godownStock: [],
      }));

      setItems(mappedItems);
    } catch (error) {
      console.error("Failed to fetch items for godown", error);
      setItems([]);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load godowns on mount
  useEffect(() => {
    fetchGodowns();
  }, []);

  // Reload items whenever selected godown changes
  useEffect(() => {
    if (selectedGodownId) {
      fetchItemsByGodown(selectedGodownId);
    }
  }, [selectedGodownId]);

  const selectedGodown = godowns.find(g => g.id === selectedGodownId);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleEditSave = (updated: Godown) => {
    setGodowns(prev => prev.map(g => g.id === updated.id ? updated : g));
    setEditingGodown(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGodown) return;
    try {
      // If there are items in this godown, warn the user and stop
      if (items.length > 0) {
        alert(
          `Cannot delete godown "${deletingGodown.name}" because it contains ${items.length} item(s).\n` +
          `Please transfer or remove all items from this godown before deleting it.`
        );
        setDeletingGodown(null);
        return;
      }
      await api.delete(`/godowns/${deletingGodown.id}`);
      const remaining = godowns.filter(g => g.id !== deletingGodown.id);
      setGodowns(remaining);
      if (remaining.length > 0) {
        setSelectedGodownId(remaining[0].id);
      } else {
        setSelectedGodownId("");
        setItems([]);
      }
    } catch (error: any) {
      // Backend may reject delete if godown has stock (FK constraint)
      const msg = error?.response?.data?.message ?? "Delete godown failed";
      alert(`Could not delete godown: ${msg}`);
      console.error("Delete godown failed", error);
    }
    setDeletingGodown(null);
  };

  const handleCreateGodown = (g: Godown) => {
    setGodowns(prev => [...prev, g]);
    setSelectedGodownId(g.id);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="gd-page">
      <h1 className="gd-page-title">Godown Management</h1>

      {/* ── Top Bar ── */}
      <div className="gd-topbar">
        {/* Godown Dropdown */}
        <div className="gd-dropdown-wrap" ref={dropdownRef}>
          <button
            className={`gd-dropdown-trigger${dropdownOpen ? " open" : ""}`}
            onClick={() => setDropdownOpen(v => !v)}
          >
            <IcWarehouse />
            <span>{selectedGodown?.name ?? "Select Godown"}</span>
            <IcChevDown />
          </button>
          {dropdownOpen && (
            <div className="gd-dropdown-menu">
              <div className="gd-dropdown-section-label">Active Godown</div>
              {godowns.map(g => (
                <div
                  key={g.id}
                  className={`gd-dropdown-option${g.id === selectedGodownId ? " active" : ""}`}
                  onClick={() => { setSelectedGodownId(g.id); setDropdownOpen(false); }}
                >
                  {g.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="gd-topbar-right">
          <button className="gd-btn-transfer">
            <IcTransfer /> Transfer Stock
          </button>
          <button className="gd-btn-create-godown" onClick={() => setShowCreateModal(true)}>
            <IcPlus /> Create Godown
          </button>
        </div>
      </div>

      {/* ── Godown Name Row ── */}
      {selectedGodown && (
        <div className="gd-name-row">
          <div className="gd-name-left">
            <span className="gd-name-text">{selectedGodown.name}</span>
            {selectedGodown.isMain && <span className="gd-main-badge">Main Godown</span>}
          </div>
          <div className="gd-name-actions">
            <button className="gd-icon-btn edit" title="Edit Godown" onClick={() => setEditingGodown(selectedGodown)}>
              <IcEdit />
            </button>
            <button className="gd-icon-btn delete" title="Delete Godown" onClick={() => setDeletingGodown(selectedGodown)}>
              <IcTrash />
            </button>
          </div>
        </div>
      )}

      {/* ── Items Table ── */}
      <div className="gd-table-card">
        <table className="gd-table">
          <thead>
            <tr>
              <th className="gd-th-check"><input type="checkbox" /></th>
              <th>Item Name</th>
              <th>Item Code</th>
              <th>Item Batch</th>
              <th>Stock QTY</th>
              <th>Stock Value</th>
              <th>Selling Price</th>
              <th>Purchase Price</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map(item => {
                const isNeg = item.stockQty < 0;
                return (
                  <tr key={item.id} className="gd-row">
                    <td><input type="checkbox" /></td>
                    <td className="gd-td-name">{item.itemName}</td>
                    <td className="gd-td-secondary">{item.itemCode || "—"}</td>
                    <td className="gd-td-secondary">—</td>
                    {/* ✅ stockQty is already a number, display directly */}
                    <td className={isNeg ? "gd-qty-neg" : "gd-td-secondary"}>
                      {item.stockQty}
                    </td>
                    {/* ✅ Stock value calculated properly */}
                    <td className="gd-td-secondary">{calcStockValue(item)}</td>
                    <td className="gd-td-secondary">{fmtPrice(item.sellingPrice)}</td>
                    <td className="gd-td-secondary">{fmtPrice(item.purchasePrice)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="gd-empty">
                  No items found in this godown.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modals ── */}
      {editingGodown && (
        <EditGodownModal
          godown={editingGodown}
          onClose={() => setEditingGodown(null)}
          onSave={handleEditSave}
        />
      )}
      {deletingGodown && (
        <DeleteGodownModal
          godownName={deletingGodown.name}
          onCancel={() => setDeletingGodown(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
      {showCreateModal && (
        <CreateGodownModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateGodown}
        />
      )}
    </div>
  );
}