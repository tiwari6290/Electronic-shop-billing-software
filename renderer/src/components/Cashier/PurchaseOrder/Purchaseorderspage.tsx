import React, { useState, useRef, useEffect } from "react";
import {
  Settings,
  Monitor,
  Search,
  Calendar,
  ChevronDown,
  MoreVertical,
  Edit2,
  Clock,
  Copy,
  Trash2,
  X,
  ArrowLeft,
  Grid3x3,
} from "lucide-react";
import BillForm from "../Billform";
import QuickVoucherSettingsModal from "../QuickQuotationSettingsModal/QuickVoucherSettingsModal";
import "./PurchaseOrdersPage.css";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PurchaseOrder {
  id: string;
  date: string;
  poNumber: number;
  partyName: string;
  validTill: string;
  amount: number;
  status: "Open" | "Closed" | "Cancelled";
}

interface HistEntry {
  timestamp: string;
  action: string;
  user: string;
}

type View = "list" | "create" | "edit";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const todayStr = () =>
  new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const timeStr = () =>
  new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

// ═══════════════════════════════════════════════════════════════════════════════
// INTERNAL NAVBAR  — no react-router, back button calls our handler
// ═══════════════════════════════════════════════════════════════════════════════
interface NavbarProps {
  title: string;
  onBack: () => void;
  onSettings: () => void;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

const FormNavbar: React.FC<NavbarProps> = ({
  title, onBack, onSettings,
  primaryLabel, onPrimary,
  secondaryLabel, onSecondary,
}) => (
  <div className="fnav">
    <div className="fnav__left">
      <button className="fnav__back" onClick={onBack} title="Go back">
        <ArrowLeft size={20} />
      </button>
      <span className="fnav__title">{title}</span>
    </div>
    <div className="fnav__right">
      <button className="fnav__grid-btn">
        <Grid3x3 size={16} />
      </button>
      <button className="fnav__settings-btn" onClick={onSettings}>
        Settings
        <span className="fnav__settings-dot" />
        <Settings size={14} />
      </button>
      {secondaryLabel && onSecondary && (
        <button className="fnav__secondary-btn" onClick={onSecondary}>
          {secondaryLabel}
        </button>
      )}
      <button className="fnav__primary-btn" onClick={onPrimary}>
        {primaryLabel}
      </button>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// QUICK SETTINGS MODAL
// ═══════════════════════════════════════════════════════════════════════════════
const QuickSettingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [pfxOn, setPfxOn] = useState(true);
  const [imgOn, setImgOn] = useState(true);
  const [phOn,  setPhOn]  = useState(true);
  const [pfx,   setPfx]   = useState("");
  const [seq,   setSeq]   = useState("2");

  return (
    <div className="overlay">
      <div className="qs-modal">
        <div className="qs-hdr">
          <span>Quick Purchase Order Settings</span>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="qs-body">
          {/* Card 1 */}
          <div className="qs-card">
            <div className="qs-card-row">
              <div>
                <p className="qs-card-title">Purchase Order Prefix &amp; Sequence Number</p>
                <p className="qs-card-sub">Add your custom prefix &amp; sequence for Purchase Order Numbering</p>
              </div>
              <Toggle checked={pfxOn} onChange={setPfxOn} />
            </div>
            {pfxOn && (
              <div className="qs-fields">
                <Field label="Prefix">
                  <input placeholder="Prefix" value={pfx} onChange={e => setPfx(e.target.value)} />
                </Field>
                <Field label="Sequence Number">
                  <input value={seq} onChange={e => setSeq(e.target.value)} />
                </Field>
                <p className="qs-hint" style={{ gridColumn: "1/-1" }}>Purchase Order Number: {seq}</p>
              </div>
            )}
          </div>

          {/* Card 2 */}
          <div className="qs-card">
            <div className="qs-card-row">
              <div>
                <p className="qs-card-title">Show Item Image on Invoice</p>
                <p className="qs-card-sub">This will apply to all vouchers except for Payment In and Payment Out</p>
              </div>
              <Toggle checked={imgOn} onChange={setImgOn} />
            </div>
          </div>

          {/* Card 3 */}
          <div className="qs-card">
            <div className="qs-card-row">
              <div>
                <p className="qs-card-title">
                  Price History <span className="new-badge">New</span>
                </p>
                <p className="qs-card-sub">Show last 5 sales / purchase prices of the item for the selected party in invoice</p>
              </div>
              <Toggle checked={phOn} onChange={setPhOn} />
            </div>
          </div>
        </div>

        <div className="qs-ftr">
          <button className="btn btn--outline" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={onClose}>Save</button>
        </div>
      </div>
    </div>
  );
};

// ─── Small helpers ────────────────────────────────────────────────────────────
const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <label className="toggle">
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
    <span className="toggle__track" />
  </label>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="qs-field">
    <label>{label}</label>
    {children}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE MODAL
// ═══════════════════════════════════════════════════════════════════════════════
const DeleteModal: React.FC<{ onCancel: () => void; onConfirm: () => void }> = ({ onCancel, onConfirm }) => (
  <div className="overlay">
    <div className="del-modal">
      <p className="del-title">Are you sure you want to delete this Purchase Order?</p>
      <p className="del-sub">Once deleted, it cannot be recovered.</p>
      <div className="del-ftr">
        <button className="btn btn--outline" onClick={onCancel}>Cancel</button>
        <button className="btn btn--danger"  onClick={onConfirm}>Yes, Delete</button>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// HISTORY MODAL
// ═══════════════════════════════════════════════════════════════════════════════
const HistoryModal: React.FC<{ order: PurchaseOrder; hist: HistEntry[]; onClose: () => void }> = ({ order, hist, onClose }) => (
  <div className="overlay">
    <div className="hist-modal">
      <div className="hist-hdr">
        <span>Edit History — PO #{order.poNumber}</span>
        <button className="icon-btn" onClick={onClose}><X size={18} /></button>
      </div>
      <div className="hist-body">
        {hist.length === 0
          ? <p className="hist-empty">No edit history yet.</p>
          : hist.map((h, i) => (
              <div key={i} className="hist-item">
                <span className="hist-dot" />
                <div>
                  <p className="hist-action">{h.action}</p>
                  <p className="hist-meta">{h.user} · {h.timestamp}</p>
                </div>
              </div>
            ))}
      </div>
      <div className="hist-ftr">
        <button className="btn btn--primary" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// ROW CONTEXT MENU
// Key fix: we track which action was clicked with a ref so the outside-click
// listener can check whether an action was already handled before calling onClose.
// ═══════════════════════════════════════════════════════════════════════════════
interface RowMenuProps {
  onEdit: () => void;
  onHistory: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const RowMenu: React.FC<RowMenuProps> = ({ onEdit, onHistory, onDuplicate, onDelete, onClose }) => {
  const menuRef   = useRef<HTMLDivElement>(null);
  const actionFired = useRef(false); // prevents close racing with action

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (actionFired.current) return; // action already handled, skip close
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // attach after a tick so the same click that opened the menu doesn't close it
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [onClose]);

  // Wrapper: marks action as fired → runs action → done
  const fire = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    actionFired.current = true;
    action(); // this changes view/state immediately
  };

  return (
    <div className="row-menu" ref={menuRef}>
      <button className="row-menu__item" onClick={fire(onEdit)}>
        <Edit2 size={14} /><span>Edit</span>
      </button>
      <button className="row-menu__item" onClick={fire(onHistory)}>
        <Clock size={14} /><span>Edit History</span>
      </button>
      <button className="row-menu__item" onClick={fire(onDuplicate)}>
        <Copy size={14} /><span>Duplicate</span>
      </button>
      <button className="row-menu__item row-menu__item--del" onClick={fire(onDelete)}>
        <Trash2 size={14} /><span>Delete</span>
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════════════════════════════
const SEED_ORDERS: PurchaseOrder[] = [
  { id: "1", date: "27 Feb 2026", poNumber: 1, partyName: "Cash Sale",   validTill: "-", amount: 0,     status: "Open"   },
  { id: "2", date: "20 Feb 2026", poNumber: 2, partyName: "akash pandey",validTill: "-", amount: 15000, status: "Closed" },
];

const SEED_HIST: Record<string, HistEntry[]> = {
  "1": [{ timestamp: "27 Feb 2026, 10:00 AM", action: "Purchase Order Created", user: "Admin" }],
  "2": [
    { timestamp: "20 Feb 2026, 09:00 AM", action: "Purchase Order Created", user: "Admin" },
    { timestamp: "21 Feb 2026, 11:00 AM", action: "Purchase Order Updated", user: "Admin" },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function PurchaseOrdersPage() {
  const [orders,  setOrders]  = useState<PurchaseOrder[]>(SEED_ORDERS);
  const [hist,    setHist]    = useState<Record<string, HistEntry[]>>(SEED_HIST);
  const [view,    setView]    = useState<View>("list");
  const [selected,setSelected]= useState<PurchaseOrder | null>(null);

  // UI state
  const [openMenuId,  setOpenMenuId]  = useState<string | null>(null);
  const [delId,       setDelId]       = useState<string | null>(null);
  const [histOrder,   setHistOrder]   = useState<PurchaseOrder | null>(null);
  const [showSettings,setShowSettings]= useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [query,       setQuery]       = useState("");

  // ── NAVIGATION ─────────────────────────────────────────────────────────────

  /** Go back to list from any form */
  const goList = () => {
    setView("list");
    setSelected(null);
    setShowSettings(false);
    setOpenMenuId(null);
  };

  /** Open create form */
  const goCreate = () => {
    setSelected(null);
    setOpenMenuId(null);
    setView("create");          // <- triggers re-render to show create form
  };

  /**
   * THE KEY FIX:
   * We set both `selected` and `view` synchronously inside one function.
   * React batches these into a single re-render, so the edit form always
   * receives the correct order AND the view switches reliably.
   */
  const goEdit = (order: PurchaseOrder) => {
    setSelected(order);         // store the order first
    setOpenMenuId(null);        // close the dropdown
    setView("edit");            // switch view — React batches all 3 together
  };

  // ── SAVE ───────────────────────────────────────────────────────────────────
  const doSave = () => {
    const ts = `${todayStr()}, ${timeStr()}`;

    if (view === "create") {
      const newO: PurchaseOrder = {
        id: Date.now().toString(),
        date: todayStr(),
        poNumber: orders.length + 1,
        partyName: "New Party",
        validTill: "-",
        amount: 0,
        status: "Open",
      };
      setOrders(p => [newO, ...p]);
      setHist(p => ({
        ...p,
        [newO.id]: [{ timestamp: ts, action: "Purchase Order Created", user: "Admin" }],
      }));
    } else if (view === "edit" && selected) {
      setHist(p => ({
        ...p,
        [selected.id]: [
          ...(p[selected.id] || []),
          { timestamp: ts, action: "Purchase Order Updated", user: "Admin" },
        ],
      }));
    }
    goList();
  };

  const doSaveAndNew = () => {
    doSave();
    setTimeout(() => setView("create"), 0);
  };

  // ── DELETE ─────────────────────────────────────────────────────────────────
  const confirmDelete = () => {
    if (delId) setOrders(p => p.filter(o => o.id !== delId));
    setDelId(null);
  };

  // ── DUPLICATE ──────────────────────────────────────────────────────────────
  const doDuplicate = (order: PurchaseOrder) => {
    const dup: PurchaseOrder = {
      ...order,
      id: Date.now().toString(),
      poNumber: orders.length + 1,
      date: todayStr(),
    };
    setOrders(p => [dup, ...p]);
    setOpenMenuId(null);
  };

  // ── FILTER ─────────────────────────────────────────────────────────────────
  const filtered = orders.filter(o =>
    o.partyName.toLowerCase().includes(query.toLowerCase()) ||
    String(o.poNumber).includes(query)
  );

  // ══════════════════════════════════════════════════════════════════════════
  // CREATE FORM VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (view === "create") {
    return (
      <div className="form-page">
        <FormNavbar
          title="Create Purchase Order"
          onBack={goList}
          onSettings={() => setShowSettings(true)}
          primaryLabel="Save"
          onPrimary={doSave}
          secondaryLabel="Save & New"
          onSecondary={doSaveAndNew}
        />
        <BillForm mode="purchaseOrder" />
        {showSettings && (
          <QuickVoucherSettingsModal
            type="purchaseOrder"
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // EDIT FORM VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (view === "edit" && selected) {
    return (
      <div className="form-page">
        <FormNavbar
          title="Update Purchase Order"
          onBack={goList}
          onSettings={() => setShowSettings(true)}
          primaryLabel="Update Purchase Order"
          onPrimary={doSave}
        />
        <BillForm mode="purchaseOrder" />
        {showSettings && (
          <QuickVoucherSettingsModal
            type="purchaseOrder"
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // LIST VIEW
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="po-page">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="po-hdr">
        <h1 className="po-hdr__title">Purchase Orders</h1>
        <div className="po-hdr__actions">
          <button className="hdr-icon-btn" onClick={() => setShowSettings(true)}>
            <Settings size={17} />
            <span className="red-dot" />
          </button>
          <button className="hdr-icon-btn">
            <Monitor size={17} />
          </button>
        </div>
      </div>

      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <div className="po-toolbar">
        <div className="po-toolbar__left">

          {/* Search */}
          {searchOpen ? (
            <div className="search-box">
              <Search size={14} className="search-box__icon" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by party or PO number..."
              />
              <button className="search-box__clear" onClick={() => { setSearchOpen(false); setQuery(""); }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <button className="hdr-icon-btn" onClick={() => setSearchOpen(true)}>
              <Search size={17} />
            </button>
          )}

          <div className="filter-pill">
            <Calendar size={13} />
            <span>Last 365 Days</span>
            <ChevronDown size={13} />
          </div>

          <div className="filter-pill">
            <span>Show Open Orders</span>
            <ChevronDown size={13} />
          </div>
        </div>

        <button className="create-btn" onClick={goCreate}>
          Create Purchase Order
        </button>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <div className="po-table-wrap">
        <table className="po-table">
          <thead>
            <tr>
              <th>Date <span className="sort-arrows">⇅</span></th>
              <th>Purchase Order Number</th>
              <th>Party Name</th>
              <th>Valid Till</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="po-table__action-col" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="po-table__empty">
                  No purchase orders found.
                </td>
              </tr>
            ) : (
              filtered.map(order => (
                <tr key={order.id} className="po-table__row">
                  <td>{order.date}</td>
                  <td>{order.poNumber}</td>
                  <td>{order.partyName}</td>
                  <td>{order.validTill}</td>
                  <td>₹ {order.amount.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge status-badge--${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>

                  {/* ── Kebab menu cell ────────────────────────────────── */}
                  <td
                    className="po-table__menu-cell"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      className="kebab-btn"
                      onClick={e => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === order.id ? null : order.id);
                      }}
                    >
                      <MoreVertical size={17} />
                    </button>

                    {openMenuId === order.id && (
                      <RowMenu
                        onEdit={()      => goEdit(order)}
                        onHistory={()   => { setHistOrder(order); setOpenMenuId(null); }}
                        onDuplicate={() => doDuplicate(order)}
                        onDelete={()    => { setDelId(order.id);  setOpenMenuId(null); }}
                        onClose={()     => setOpenMenuId(null)}
                      />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      {showSettings && (
        <QuickVoucherSettingsModal
          type="purchaseOrder"
          onClose={() => setShowSettings(false)}
        />
      )}

      {delId && (
        <DeleteModal
          onCancel={() => setDelId(null)}
          onConfirm={confirmDelete}
        />
      )}

      {histOrder && (
        <HistoryModal
          order={histOrder}
          hist={hist[histOrder.id] || []}
          onClose={() => setHistOrder(null)}
        />
      )}
    </div>
  );
}