import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

interface NavItem {
  label: string;
  path: string;
  icon: JSX.Element;
}

const navItems: NavItem[] = [
  {
    label: "Cash & Bank",
    path: "/accountant/cash-bank",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    label: "E-Invoicing",
    path: "/accountant/e-invoicing",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
  {
    label: "Automated Bills",
    path: "/accountant/automated-bills",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    label: "Expenses",
    path: "/accountant/expenses",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

interface AccountantSidebarProps {
  userName?: string;
  userPhone?: string;
}

const AccountantSidebar = ({
  userName = "mondal electronics",
  userPhone = "9142581382",
}: AccountantSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="accountant-sidebar">
      {/* Header */}
     <div className="accountant-sidebar__header">
  <div className="accountant-sidebar__brand">
    <div className="accountant-sidebar__avatar">
      {userName.charAt(0).toUpperCase()}
    </div>
    <div className="accountant-sidebar__user-info">
      <div className="accountant-sidebar__username">{userName}</div>
      <div className="accountant-sidebar__phone">{userPhone}</div>
    </div>
  </div>
</div>

      {/* Section Label */}
      <div className="accountant-sidebar__section-label">Accounting Solutions</div>

      {/* Nav Items */}
      <nav className="accountant-sidebar__nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div
              key={item.path}
              className={`accountant-sidebar__nav-item${isActive ? " active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="accountant-sidebar__footer">
  <div className="accountant-sidebar__role-tag">Accountant</div>
  <div
    className="accountant-sidebar__logout"
    onClick={() => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("branch");
      navigate("/login");
    }}
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
    Logout
  </div>
</div>
    </div>
  );
};

export default AccountantSidebar;