import "./AccountantDashboard.css";
import AccountantSidebar from "../AccountantSidebar/AccountantSidebar";
import AccountantTopbar from "../AccountantTopbar/AccountantTopbar";

export default function AccountantDashboard() {
  return (
    <div className="accountant-layout">

      {/* LEFT SIDEBAR */}
      <AccountantSidebar />

      {/* RIGHT CONTENT */}
      <div className="accountant-main">

        {/* TOP BAR */}
        <AccountantTopbar />

        {/* PAGE CONTENT */}
        <div className="accountant-content">
          {/* These sections will be added next */}
          <div className="placeholder-card">Stat Cards Section</div>
          <div className="placeholder-card">GST Summary Section</div>
          <div className="placeholder-grid">
            <div className="placeholder-card">Receivables Table</div>
            <div className="placeholder-card">Expenses Table</div>
          </div>
        </div>

      </div>
    </div>
  );
}
