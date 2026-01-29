import "./AccountantSidebar.css";
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
        <div className="menu-item active">
          <FaThLarge />
          <span>Dashboard</span>
        </div>

        <div className="menu-item">
          <FaChartLine />
          <span>Sales Overview</span>
        </div>

        <div className="menu-item">
          <FaShoppingCart />
          <span>Purchases</span>
        </div>

        <div className="menu-item">
          <FaWallet />
          <span>Settlements</span>
        </div>

        <div className="menu-item">
          <MdCurrencyRupee />
          <span>Expenses</span>
        </div>

        <div className="menu-item">
          <FaFileInvoice />
          <span>GST Dashboard</span>
        </div>

        <div className="menu-item">
          <FaBook />
          <span>Ledgers</span>
        </div>

        <div className="menu-item">
          <FaChartBar />
          <span>Reports</span>
        </div>
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
