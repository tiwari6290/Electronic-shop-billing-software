import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "@/components/Login/Login";
import Sidebar from "./components/Cashier/Sidebar";
import Navbar from "./components/Cashier/Navbar";
import CashierDashboard from "./components/CashierDashboard/CashierDashboard";
import Createparty from "./components/Cashier/Createparty";
 
/* Dummy pages (replace later with real pages) */
const Page = ({ title }: { title: string }) => (
  <div style={{ padding: 30, fontSize: 22, fontWeight: 600 }}>{title}</div>
);

/* Layout with Sidebar */
const DashboardLayout = () => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1, overflow: "auto", background: "#f5f7fb" }}>
        <Outlet />
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Sidebar Layout */}
        <Route element={<DashboardLayout />}>

          <Route path="/dashboard" element={<CashierDashboard />} />
         <Route path="/navbar" element={<Navbar title="Dashboard" />} />

          <Route path="/create-party" element={<Createparty />} />
          <Route path="/create-item" element={<Page title="Create Item" />} />

          <Route path="/quotation" element={<Page title="Quotation" />} />
          <Route path="/payment-in" element={<Page title="Payment In" />} />
          <Route path="/sales-return" element={<Page title="Sales Return" />} />
          <Route path="/credit-note" element={<Page title="Credit Note" />} />
          <Route path="/delivery-challan" element={<Page title="Delivery Challan" />} />
          <Route path="/proforma-invoice" element={<Page title="Proforma Invoice" />} />

          <Route path="/purchase" element={<Page title="Purchase" />} />
          <Route path="/payment-out" element={<Page title="Payment Out" />} />
          <Route path="/purchase-return" element={<Page title="Purchase Return" />} />
          <Route path="/debit-note" element={<Page title="Debit Note" />} />
          <Route path="/purchase-orders" element={<Page title="Purchase Orders" />} />
          <Route path="/create-expense" element={<Page title="Create Expense" />} />

        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;