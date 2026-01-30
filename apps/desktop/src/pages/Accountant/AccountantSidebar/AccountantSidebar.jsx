import "./AccountantSidebar.css"
import { NavLink } from "react-router-dom";
import {
  FaThLarge,
  FaChartLine,
  FaShoppingCart,
  FaWallet,
  FaFileInvoice,
  FaBook,
  FaChartBar,
  FaSignOutAlt,
} from "react-icons/fa";
import { MdCurrencyRupee } from "react-icons/md";

export default function AccountantSidebar() {
  return (
    <aside className="accountant-sidebar">

      {/* BRAND */}
      <div className="sidebar-brand">
        <div className="brand-icon">⚡</div>
        <div>
          <h3>ElectroShop</h3>
          <span>Accountant Panel</span>
        </div>
      </div>

      {/* MENU */}
      <nav className="sidebar-menu">

        {/* Dashboard */}
        <NavLink to="/accountant" end className="menu-item">
          <FaThLarge />
          <span>Dashboard</span>
        </NavLink>

        {/* Sales Overview */}
        <NavLink to="/accountant/sales" className="menu-item">
          <FaChartLine />
          <span>Sales Overview</span>
        </NavLink>

        {/* Purchases */}
        <NavLink to="/accountant/purchases" className="menu-item">
          <FaShoppingCart />
          <span>Purchases</span>
        </NavLink>

        {/* Settlements */}
        <NavLink to="/accountant/settlements" className="menu-item">
          <FaWallet />
          <span>Settlements</span>
        </NavLink>

        {/* Expenses */}
        <NavLink to="/accountant/expenses" className="menu-item">
          <MdCurrencyRupee />
          <span>Expenses</span>
        </NavLink>

        {/* GST Dashboard */}
        <NavLink to="/accountant/gst" className="menu-item">
          <FaFileInvoice />
          <span>GST Dashboard</span>
        </NavLink>

        {/* Ledgers */}
        <NavLink to="/accountant/ledgers" className="menu-item">
          <FaBook />
          <span>Ledgers</span>
        </NavLink>

        {/* Reports */}
        <NavLink to="/accountant/reports" className="menu-item">
          <FaChartBar />
          <span>Reports</span>
        </NavLink>

      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="avatar">AP</div>
          <div>
            <strong>Amit Patel</strong>
            <span>Main Store</span>
          </div>
        </div>

        <button className="logout-btn">
          <FaSignOutAlt />
          Logout
        </button>
      </div>

    </aside>
  );
}
