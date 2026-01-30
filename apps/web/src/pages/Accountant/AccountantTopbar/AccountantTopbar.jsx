import "./AccountantTopbar.css";
import { FaBell, FaSearch } from "react-icons/fa";
import { useLocation } from "react-router-dom";

export default function AccountantTopbar() {
  const location = useLocation();

  const pageConfig = {
    "/accountant": {
      title: "Accountant Dashboard",
      subtitle: "Finance & Compliance Overview",
    },
    "/accountant/sales": {
      title: "Sales Overview",
      subtitle: "Comprehensive sales analytics & trends",
    },
    "/accountant/purchases": {
      title: "Purchases",
      subtitle: "Purchase order & supplier payments",
    },
    "/accountant/settlements": {
      title: "Settlements",
      subtitle: "Bank & payment reconciliation",
    },
    "/accountant/expenses": {
      title: "Expenses",
      subtitle: "Track & manage business expenses",
    },
    "/accountant/gst": {
      title: "GST Dashboard",
      subtitle: "GST compliance & tax management",
    },
    "/accountant/ledgers": {
      title: "Ledgers",
      subtitle: "Customer & supplier account management",
    },
    "/accountant/reports": {
      title: "Reports",
      subtitle: "Generate & download business reports",
    },
  };

  const currentPage =
    pageConfig[location.pathname] || {
      title: "Accountant",
      subtitle: "Overview",
    };

  return (
    <div className="accountant-topbar">

      {/* LEFT TITLE */}
      <div className="topbar-left">
        <h1>{currentPage.title}</h1>
        <span>{currentPage.subtitle}</span>
      </div>

      {/* RIGHT ACTIONS */}
      <div className="topbar-right">
        <div className="search-box">
          <FaSearch />
          <input placeholder="Search sales, bills..." />
        </div>

        <div className="icon-btn">
          <FaBell />
          <span className="badge">3</span>
        </div>

        <div className="role-badge">Accountant</div>
      </div>

    </div>
  );
}
