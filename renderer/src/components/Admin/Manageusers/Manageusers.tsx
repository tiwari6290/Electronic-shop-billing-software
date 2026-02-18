import React, { useState, useRef, useEffect } from "react";
import "./ManageUsers.css";
import AddUserModal, { UserData } from "../Addusermodal/Addusermodal";
import UserRolesModal from "../Userrolesmodal/Userrolesmodal";

/* ── Types ── */
type Status = "Invitation Sent" | "Deleted" | "Active" | "";
type View = "users" | "activities";

interface User {
  id: number;
  name: string;
  mobile: string;
  role: string;
  status: Status;
}

const INITIAL_USERS: User[] = [
  { id: 1, name: "Ramesh",    mobile: "8474106002", role: "CA",           status: "Invitation Sent" },
  { id: 2, name: "Rohan Jha", mobile: "6207941416", role: "CA",           status: "Deleted" },
  { id: 3, name: "Rohit",     mobile: "6207491417", role: "Delivery Boy", status: "Deleted" },
  { id: 4, name: "You",       mobile: "9142581382", role: "Admin",         status: "" },
];

/* ── Date range helper ── */
const fmt = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const getDateRange = (label: string): string => {
  const d = new Date();
  switch (label) {
    case "Today": return `${fmt(d)} to ${fmt(d)}`;
    case "Yesterday": { const y = new Date(d); y.setDate(d.getDate()-1); return `${fmt(y)} to ${fmt(y)}`; }
    case "This Week": {
      const mon = new Date(d); mon.setDate(d.getDate() - d.getDay() + 1);
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      return `${fmt(mon)} to ${fmt(sun)}`;
    }
    case "Last Week": {
      const lmon = new Date(d); lmon.setDate(d.getDate() - d.getDay() - 6);
      const lsun = new Date(lmon); lsun.setDate(lmon.getDate() + 6);
      return `${fmt(lmon)} to ${fmt(lsun)}`;
    }
    case "Last 7 days": { const s = new Date(d); s.setDate(d.getDate()-6); return `${fmt(s)} to ${fmt(d)}`; }
    case "This Month": {
      const ms = new Date(d.getFullYear(), d.getMonth(), 1);
      const me = new Date(d.getFullYear(), d.getMonth()+1, 0);
      return `${fmt(ms)} to ${fmt(me)}`;
    }
    case "Previous Month": {
      const ps = new Date(d.getFullYear(), d.getMonth()-1, 1);
      const pe = new Date(d.getFullYear(), d.getMonth(), 0);
      return `${fmt(ps)} to ${fmt(pe)}`;
    }
    case "Last 30 Days": { const s = new Date(d); s.setDate(d.getDate()-29); return `${fmt(s)} to ${fmt(d)}`; }
    case "This Quarter": {
      const q = Math.floor(d.getMonth()/3);
      const qs = new Date(d.getFullYear(), q*3, 1);
      const qe = new Date(d.getFullYear(), q*3+3, 0);
      return `${fmt(qs)} to ${fmt(qe)}`;
    }
    case "Previous Quarter": {
      const q = Math.floor(d.getMonth()/3) - 1;
      const yr = q < 0 ? d.getFullYear()-1 : d.getFullYear();
      const qq = (q+4)%4;
      const qs = new Date(yr, qq*3, 1);
      const qe = new Date(yr, qq*3+3, 0);
      return `${fmt(qs)} to ${fmt(qe)}`;
    }
    case "Current Fiscal Year": {
      const fy = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear()-1;
      return `${fmt(new Date(fy, 3, 1))} to ${fmt(new Date(fy+1, 2, 31))}`;
    }
    case "Last 365 Days": { const s = new Date(d); s.setDate(d.getDate()-364); return `${fmt(s)} to ${fmt(d)}`; }
    default: return "";
  }
};

const DATE_OPTIONS = [
  "Today","Yesterday","This Week","Last Week","Last 7 days",
  "This Month","Previous Month","Last 30 Days","This Quarter",
  "Previous Quarter","Current Fiscal Year","Last 365 Days","Custom Date Range",
];

const TRANSACTION_OPTIONS = [
  { label: "All Transactions", sub: "" },
  { label: "Edited Old Transaction", sub: "Transactions edited 1 day after they were created" },
  { label: "Edited Any Transaction", sub: "" },
  { label: "Deleted Transaction", sub: "" },
  { label: "Created Transaction", sub: "" },
];

/* ── Generic Filter Dropdown ── */
interface DropdownProps {
  value: string;
  options: { label: string; sub?: string }[];
  onChange: (v: string) => void;
  prefix?: React.ReactNode;
  className?: string;
  highlighted?: boolean;
}

const FilterDropdown: React.FC<DropdownProps> = ({ value, options, onChange, prefix, className = "", highlighted }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className={`fd ${className} ${highlighted ? "fd--highlighted" : ""}`} ref={ref}>
      <div className="fd__trigger" onClick={() => setOpen((p) => !p)}>
        {prefix && <span className="fd__prefix">{prefix}</span>}
        <span className="fd__value">{value}</span>
        <svg className={`fd__arrow ${open ? "fd__arrow--up" : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && (
        <div className="fd__menu">
          {options.map((opt) => {
            const dr = opt.label !== "Custom Date Range" ? getDateRange(opt.label) : "";
            return (
              <div key={opt.label} className={`fd__item ${value === opt.label ? "fd__item--active" : ""}`}
                onClick={() => { onChange(opt.label); setOpen(false); }}>
                <div className="fd__item-row">
                  <span className="fd__item-label">{opt.label}</span>
                  {dr && <span className="fd__item-date">{dr}</span>}
                </div>
                {opt.sub && <div className="fd__item-sub">{opt.sub}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ── 3-dot Action Menu ── */
const ActionMenu: React.FC<{ userId: number; onDelete: (id: number) => void }> = ({ userId, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="action-menu" ref={ref}>
      <button className="action-menu__trigger" onClick={() => setOpen((p) => !p)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
      {open && (
        <div className="action-menu__popup">
          <button className="action-menu__item action-menu__item--danger"
            onClick={() => { onDelete(userId); setOpen(false); }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Delete User
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Main ── */
const ManageUsers: React.FC = () => {
  const [users, setUsers]           = useState<User[]>(INITIAL_USERS);
  const [view, setView]             = useState<View>("users");
  const [search, setSearch]         = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [modalMode, setModalMode]   = useState<"newUser" | "addCA" | null>(null);
  const [showRoles, setShowRoles]   = useState(false);
  const [sortAsc, setSortAsc]       = useState(true);
  const [userFilter, setUserFilter] = useState("All Users");
  const [txFilter, setTxFilter]     = useState("All Transactions");
  const [dateFilter, setDateFilter] = useState("Last 30 Days");
  const searchRef = useRef<HTMLInputElement>(null);

  const activeUsers = users.filter((u) => u.status !== "Deleted").length;
  const userOptions = [{ label: "All Users" }, ...users.map((u) => ({ label: u.name || "You" }))];

  const filtered = users.filter((u) => {
    if (!search) return true;
    return u.name.toLowerCase().includes(search.toLowerCase()) || u.mobile.includes(search);
  });
  const sorted = [...filtered].sort((a, b) => {
    const c = a.name.localeCompare(b.name); return sortAsc ? c : -c;
  });

  const handleSave = (data: UserData) => {
    setUsers((prev) => [{ id: Date.now(), name: data.name, mobile: data.mobile, role: data.role, status: "Invitation Sent" }, ...prev]);
  };
  const handleDelete = (id: number) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: "Deleted" } : u));
  };
  const toggleSearch = () => {
    setSearchOpen((p) => { if (!p) setTimeout(() => searchRef.current?.focus(), 50); else setSearch(""); return !p; });
  };

  const activitiesActive = view === "activities";

  return (
    <div className="mu-page">
      {/* Header */}
      <div className="mu-header">
        <h2 className="mu-header__title">Manage Users</h2>
        {/* ? icon opens UserRoles modal */}
        <button className="mu-header__help" onClick={() => setShowRoles(true)} title="View User Roles">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="mu-stats">
        <div className={`mu-stat-card ${view === "users" ? "mu-stat-card--active" : ""}`}
          onClick={() => setView("users")} style={{ cursor: "pointer" }}>
          <div className="mu-stat-card__label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b5fcf" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Number of Users</span>
          </div>
          <div className="mu-stat-card__value">{activeUsers}</div>
        </div>

        <div className={`mu-stat-card ${activitiesActive ? "mu-stat-card--active" : ""}`}
          onClick={() => setView("activities")} style={{ cursor: "pointer" }}>
          <div className="mu-stat-card__label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0ea5b0" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span>Activities Performed</span>
          </div>
          <div className="mu-stat-card__row">
            <span className="mu-stat-card__value">0</span>
            <span className={`mu-stat-card__badge ${activitiesActive ? "mu-stat-card__badge--active" : ""}`}>
              {activitiesActive ? dateFilter : "Last 30 Days"}
            </span>
          </div>
        </div>
      </div>

      {/* ── USERS VIEW ── */}
      {view === "users" && (
        <>
          <div className="mu-toolbar">
            <div className="mu-toolbar__left">
              <div className={`mu-search ${searchOpen ? "mu-search--open" : ""}`}>
                <button className="mu-search__icon-btn" onClick={toggleSearch}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
                {searchOpen && (
                  <input ref={searchRef} className="mu-search__input" type="text"
                    placeholder="Search by User Name or Mobile Number"
                    value={search} onChange={(e) => setSearch(e.target.value)} />
                )}
              </div>
            </div>
            <div className="mu-toolbar__right">
              <button className="mu-btn mu-btn--outline" onClick={() => setModalMode("addCA")}>Add Your CA</button>
              <button className="mu-btn mu-btn--primary" onClick={() => setModalMode("newUser")}>Add New User</button>
            </div>
          </div>

          <div className="mu-table-wrap">
            <table className="mu-table">
              <thead>
                <tr>
                  <th className="mu-table__th mu-table__th--name" onClick={() => setSortAsc((p) => !p)}>
                    User Name
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ marginLeft: 4, verticalAlign: "middle" }}>
                      <polyline points="12 4 6 10 18 10" /><polyline points="12 20 6 14 18 14" />
                    </svg>
                  </th>
                  <th className="mu-table__th">Mobile Number</th>
                  <th className="mu-table__th">Role Type</th>
                  <th className="mu-table__th">Status</th>
                  <th className="mu-table__th mu-table__th--action" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((user) => (
                  <tr key={user.id} className="mu-table__row">
                    <td className="mu-table__td">{user.name}</td>
                    <td className="mu-table__td">{user.mobile}</td>
                    <td className="mu-table__td">{user.role}</td>
                    <td className="mu-table__td">
                      {user.status === "Invitation Sent" && <span className="mu-badge mu-badge--blue">Invitation Sent</span>}
                      {user.status === "Deleted" && <span className="mu-badge mu-badge--red">Deleted</span>}
                    </td>
                    <td className="mu-table__td mu-table__td--action">
                      {user.status !== "Deleted" && user.role !== "Admin" && (
                        <ActionMenu userId={user.id} onDelete={handleDelete} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── ACTIVITIES VIEW ── */}
      {view === "activities" && (
        <>
          <div className="mu-toolbar mu-toolbar--activities">
            <div className={`mu-search ${searchOpen ? "mu-search--open" : ""}`}>
              <button className="mu-search__icon-btn" onClick={toggleSearch}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
              {searchOpen && (
                <input ref={searchRef} className="mu-search__input" type="text"
                  placeholder="Search activities..." value={search} onChange={(e) => setSearch(e.target.value)} />
              )}
            </div>

            <FilterDropdown value={userFilter} options={userOptions} onChange={setUserFilter}
              className="fd--users" highlighted={userFilter !== "All Users"} />

            <FilterDropdown value={txFilter} options={TRANSACTION_OPTIONS} onChange={setTxFilter}
              className="fd--tx" highlighted={txFilter !== "All Transactions"} />

            <FilterDropdown
              value={dateFilter}
              options={DATE_OPTIONS.map((l) => ({ label: l }))}
              onChange={setDateFilter}
              className="fd--date"
              highlighted
              prefix={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              }
            />
          </div>

          <div className="mu-table-wrap">
            <table className="mu-table">
              <thead>
                <tr>
                  <th className="mu-table__th mu-table__th--name">
                    Time of Activity
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ marginLeft: 4, verticalAlign: "middle" }}>
                      <polyline points="12 4 6 10 18 10" /><polyline points="12 20 6 14 18 14" />
                    </svg>
                  </th>
                  <th className="mu-table__th">Activity</th>
                  <th className="mu-table__th">Transaction Details</th>
                  <th className="mu-table__th">Performed By</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4}>
                    <div className="mu-empty">
                      <div className="mu-empty__icon">
                        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                          <circle cx="28" cy="28" r="26" stroke="#d1d5db" strokeWidth="2" />
                          <polyline points="14,28 22,36 42,16" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="38" y1="14" x2="44" y2="20" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" />
                          <line x1="44" y1="14" x2="38" y2="20" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p className="mu-empty__text">No activity found with the applied filters</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modals */}
      {modalMode && (
        <AddUserModal mode={modalMode} onClose={() => setModalMode(null)} onSave={handleSave} />
      )}
      {showRoles && <UserRolesModal onClose={() => setShowRoles(false)} />}
    </div>
  );
};

export default ManageUsers;