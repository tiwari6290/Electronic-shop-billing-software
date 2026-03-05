import { useState, useRef, useEffect } from "react";
import "./Godown.css";

// ─── Types (must match ItemsPage) ────────────────────────────────────────────

interface GodownStock {
  godownName: string;
  stockAvailable: string;
  address: string;
}

interface Item {
  id: string;
  itemName: string;
  itemCode: string;
  stockQty: string;
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

// ─── Shared items data — import from your store / context in real app ─────────
// This mirrors ITEMS_INIT from ItemsPage.tsx so both pages stay in sync.
// In production, replace with a shared Zustand / Context store.

const ITEMS_INIT: Item[] = [
  { id: "1", itemName: "BILLING SOFTWARE MOBILE APP", itemCode: "", stockQty: "-", sellingPrice: 256, purchasePrice: null, godownStock: [] },
  { id: "2", itemName: "BILLING SOFTWARE WITH GST",   itemCode: "", stockQty: "-", sellingPrice: 369875, purchasePrice: null, godownStock: [] },
  { id: "3", itemName: "BILLING SOFTWARE WITHOUT GST",itemCode: "", stockQty: "-", sellingPrice: 3556,   purchasePrice: null, godownStock: [] },
  { id: "4", itemName: "GODREJ FRIDGE",   itemCode: "34567", stockQty: "143 ACS", sellingPrice: 42000, purchasePrice: 0,     godownStock: [{ godownName: "mondal electronic", stockAvailable: "143 ACS", address: "" }] },
  { id: "5", itemName: "HERIER AC",       itemCode: "1234",  stockQty: "93 PCS",  sellingPrice: 45000, purchasePrice: 38000, godownStock: [{ godownName: "mondal electronic", stockAvailable: "93 PCS",  address: "" }] },
  { id: "6", itemName: "HISENSE 32 INCH", itemCode: "",      stockQty: "39 PCS",  sellingPrice: 21000, purchasePrice: 18000, godownStock: [{ godownName: "mondal electronic", stockAvailable: "39 PCS",  address: "" }] },
  { id: "7", itemName: "HISENSE 43INCG TV", itemCode: "00974", stockQty: "119 PCS", sellingPrice: 30000, purchasePrice: null, godownStock: [{ godownName: "mondal electronic", stockAvailable: "119 PCS", address: "" }] },
  { id: "8", itemName: "maggi",   itemCode: "", stockQty: "-9 PCS", sellingPrice: null, purchasePrice: null, godownStock: [{ godownName: "mondal electronic", stockAvailable: "-9 PCS", address: "" }] },
  { id: "9", itemName: "uayufuy", itemCode: "", stockQty: "0 PCS",  sellingPrice: 5547, purchasePrice: null, godownStock: [] },
];

const GODOWNS_INIT: Godown[] = [
  { id: "g1", name: "mondal electronic", isMain: true,  streetAddress: "", state: "", pincode: "", city: "" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtPrice = (n: number | null | undefined) => {
  if (n === null || n === undefined) return "₹0";
  return `₹${n.toLocaleString("en-IN")}.0`;
};

const calcStockValue = (item: Item, godownName: string): string => {
  const gs = item.godownStock.find(g => g.godownName === godownName);
  if (!gs || !item.sellingPrice) return "₹0";
  const qty = parseInt(gs.stockAvailable) || 0;
  const val = qty * item.sellingPrice;
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

// ─── Edit Godown Modal ────────────────────────────────────────────────────────

interface EditModalProps {
  godown: Godown;
  onClose: () => void;
  onSave: (updated: Godown) => void;
}

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Delhi","Jammu and Kashmir",
  "Ladakh","Lakshadweep","Puducherry",
];

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
      if (stateRef.current && !stateRef.current.contains(e.target as Node)) {
        setStateOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) { alert("Godown name is required"); return; }
    onSave(form);
    onClose();
  };

  return (
    <div className="gd-overlay" onClick={onClose}>
      <div className="gd-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="gd-modal-header">
          <span className="gd-modal-title">Edit Godown</span>
          <button className="gd-modal-close" onClick={onClose}><IcX /></button>
        </div>

        {/* Body */}
        <div className="gd-modal-body">
          {/* Godown Name */}
          <div className="gd-field">
            <label className="gd-label">Godown Name <span className="gd-required">*</span></label>
            <input
              className="gd-input"
              value={form.name}
              onChange={e => set("name", e.target.value)}
              placeholder="Enter godown name"
            />
          </div>

          {/* Street Address */}
          <div className="gd-field">
            <label className="gd-label">Street Address</label>
            <textarea
              className="gd-textarea"
              value={form.streetAddress}
              onChange={e => set("streetAddress", e.target.value)}
              placeholder="Enter Street Address"
              rows={2}
            />
          </div>

          {/* State + Pincode */}
          <div className="gd-row-2">
            <div className="gd-field">
              <label className="gd-label">State</label>
              <div className="gd-state-wrap" ref={stateRef}>
                <div
                  className={`gd-state-trigger${stateOpen ? " open" : ""}`}
                  onClick={() => setStateOpen(v => !v)}
                >
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
                          <div
                            key={s}
                            className={`gd-state-option${form.state === s ? " selected" : ""}`}
                            onClick={() => {
                              set("state", s);
                              setStateSearch(s);
                              setStateOpen(false);
                            }}
                          >
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
              <input
                className="gd-input"
                value={form.pincode}
                onChange={e => set("pincode", e.target.value)}
                placeholder="ex: 560029"
                maxLength={6}
              />
            </div>
          </div>

          {/* City */}
          <div className="gd-field">
            <label className="gd-label">City</label>
            <input
              className="gd-input"
              value={form.city}
              onChange={e => set("city", e.target.value)}
              placeholder="ex: Bangalore"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="gd-modal-footer">
          <button className="gd-btn-secondary" onClick={onClose}>Close</button>
          <button className="gd-btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

// ─── Delete Godown Confirm Modal ──────────────────────────────────────────────

interface DeleteModalProps {
  godownName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteGodownModal = ({ godownName, onCancel, onConfirm }: DeleteModalProps) => (
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

interface CreateGodownModalProps {
  onClose: () => void;
  onCreate: (godown: Godown) => void;
}

const CreateGodownModal = ({ onClose, onCreate }: CreateGodownModalProps) => {
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

  const handleCreate = () => {
    if (!form.name.trim()) { alert("Godown name is required"); return; }
    onCreate({
      id: `g${Date.now()}`,
      name: form.name,
      isMain: false,
      streetAddress: form.streetAddress,
      state: form.state,
      pincode: form.pincode,
      city: form.city,
    });
    onClose();
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
  const [items, setItems] = useState<Item[]>(ITEMS_INIT);
  const [godowns, setGodowns] = useState<Godown[]>(GODOWNS_INIT);
  const [selectedGodownId, setSelectedGodownId] = useState<string>(GODOWNS_INIT[0].id);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editingGodown, setEditingGodown] = useState<Godown | null>(null);
  const [deletingGodown, setDeletingGodown] = useState<Godown | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedGodown = godowns.find(g => g.id === selectedGodownId) ?? godowns[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Items visible in selected godown
  const godownItems = items.filter(item =>
    item.godownStock.some(gs => gs.godownName === selectedGodown?.name)
  );

  const handleEditSave = (updated: Godown) => {
    // Also update godownStock references if name changed
    const oldName = editingGodown?.name ?? "";
    if (updated.name !== oldName) {
      setItems(prev => prev.map(item => ({
        ...item,
        godownStock: item.godownStock.map(gs =>
          gs.godownName === oldName ? { ...gs, godownName: updated.name } : gs
        ),
      })));
    }
    setGodowns(prev => prev.map(g => g.id === updated.id ? updated : g));
    setEditingGodown(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingGodown) return;
    setGodowns(prev => prev.filter(g => g.id !== deletingGodown.id));
    // Switch to first remaining godown
    const remaining = godowns.filter(g => g.id !== deletingGodown.id);
    if (remaining.length > 0) setSelectedGodownId(remaining[0].id);
    setDeletingGodown(null);
  };

  const handleCreateGodown = (g: Godown) => {
    setGodowns(prev => [...prev, g]);
    setSelectedGodownId(g.id);
  };

  return (
    <div className="gd-page">
      {/* ── Page Title ── */}
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
            <button
              className="gd-icon-btn edit"
              title="Edit Godown"
              onClick={() => setEditingGodown(selectedGodown)}
            >
              <IcEdit />
            </button>
            <button
              className="gd-icon-btn delete"
              title="Delete Godown"
              onClick={() => setDeletingGodown(selectedGodown)}
            >
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
              <th>Item name</th>
              <th>Item Code</th>
              <th>Item Batch</th>
              <th>Stock QTY</th>
              <th>Stock Value</th>
              <th>Selling Price</th>
              <th>Purchase Price</th>
            </tr>
          </thead>
          <tbody>
            {godownItems.length > 0 ? (
              godownItems.map(item => {
                const gs = item.godownStock.find(g => g.godownName === selectedGodown?.name);
                const stockQty = gs?.stockAvailable ?? "-";
                const isNeg = parseInt(stockQty) < 0;
                return (
                  <tr key={item.id} className="gd-row">
                    <td><input type="checkbox" /></td>
                    <td className="gd-td-name">{item.itemName}</td>
                    <td className="gd-td-secondary">{item.itemCode || ""}</td>
                    <td className="gd-td-secondary">—</td>
                    <td className={isNeg ? "gd-qty-neg" : "gd-td-secondary"}>{stockQty}</td>
                    <td className="gd-td-secondary">{calcStockValue(item, selectedGodown?.name ?? "")}</td>
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