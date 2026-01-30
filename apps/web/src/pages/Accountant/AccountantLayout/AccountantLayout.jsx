import AccountantSidebar from "../AccountantSidebar/AccountantSidebar";
import AccountantTopbar from "../AccountantTopbar/AccountantTopbar";
import AccountantRoutes from "../AccountantRoutes/AccountantRoutes";
import "./AccountantLayout.css";

export default function AccountantLayout() {
  return (
    <div className="accountant-layout">
      <AccountantSidebar />

      <div className="accountant-main">
        <AccountantTopbar />

        <div className="accountant-content">
          <AccountantRoutes />
        </div>
      </div>
    </div>
  );
}
    