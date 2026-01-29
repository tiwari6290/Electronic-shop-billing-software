import "./AccountantTopbar.css";
import { FaBell, FaSearch } from "react-icons/fa";

export default function AccountantTopbar() {
  return (
    <div className="accountant-topbar">

      {/* LEFT TITLE */}
      <div className="topbar-left">
        <h1>Accountant Dashboard</h1>
        <span>Finance & Compliance Overview</span>
      </div>

      {/* RIGHT ACTIONS */}
      <div className="topbar-right">

        {/* SEARCH */}
        <div className="search-box">
          <FaSearch />
          <input placeholder="Search products, bills..." />
        </div>

        {/* NOTIFICATION */}
        <div className="icon-btn">
          <FaBell />
          <span className="badge">3</span>
        </div>

        {/* ROLE BADGE */}
        <div className="role-badge">Accountant</div>
      </div>

    </div>
  );
}
