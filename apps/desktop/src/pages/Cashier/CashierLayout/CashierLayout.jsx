import CashierSidebar from "../CashierSidebar/CashierSidebar";
import CashierRoutes from "../CashierRoutes/CashierRoutes";
import "./CashierLayout.css";

export default function CashierLayout() {
  return (
    <div className="cashier-layout">
      <CashierSidebar />
      <div className="cashier-content">
        <CashierRoutes />
      </div>
    </div>
  );
}
