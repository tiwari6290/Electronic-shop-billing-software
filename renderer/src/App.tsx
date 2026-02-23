import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "@/components/Login/Login";
import Sidebar from "./components/Cashier/Sidebar";
import AdminSidebar from "./components/Admin/Sidebar";
import Navbar from "./components/Cashier/Navbar";
import Createparty from "./components/Cashier/Createparty";
import CreateQuotation from "./components/Cashier/CreateQuotation";
import CreateItem from "./components/Cashier/CreateItem/CreateItem";
import SalesReturn from "./components/Cashier/SalesReturn";
import ProformaInvoice from "./components/Cashier/ProformaInvoice";
import Purchases from "./components/Cashier/Purchases/Purchases";
import CreateDebitNote from "./components/Cashier/CreateDebitNote/CreateDebitNote";
import CreatePurchaseReturn from "./components/Cashier/CreatePurchaseReturn/CreatePurchaseReturn";
import PaymentOut from "./components/Cashier/PaymentOut/PaymentOut";
import PaymentIn from "./components/Cashier/PaymentIn/PaymentIn";
import CreateCreditNote from "./components/Cashier/CreateCreditNote/CreateCreditNote";
import DeliveryChallan from "./components/Cashier/DeliveryChallan/DeliveryChallan";
import PurchaseOrder from "./components/Cashier/PurchaseOrder/PurchaseOrder";
import Createexpense from "./components/Cashier/Createexpense";
import Salesinvoice from "./components/Cashier/Salesinvoice";
import ManageBusiness from "./components/Admin/ManageBuisness";
import Account from "./components/Admin/Account/Account";
import Pricing from "./components/Admin/Pricing/Pricing";
import PrintSetting from "./components/Admin/PrintSetting/Printsetting";
import ReminderSetting from "./components/Admin/ReminderSetting/Remindersetting";
import Reportsharing from "./components/Admin/ReportSharing/Reportsharing";
import ReferralPage from "./components/Admin/Referralpage/Referralpage";
import ManageUsers from "./components/Admin/Manageusers/Manageusers";
import InvoiceBuilder from "./components/Admin/Invoicebuilder/Invoicebuilder";

/* Dummy pages (replace later with real pages) */
const Page = ({ title }: { title: string }) => (
  <div style={{ padding: 30, fontSize: 22, fontWeight: 600 }}>{title}</div>
);

/* Admin Dashboard */
const AdminDashboard = () => (
  <div style={{ padding: 30 }}>
    <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 20 }}>Admin Dashboard</h1>
    <p style={{ fontSize: 16, color: '#6b7280' }}>Welcome to Admin Panel</p>
  </div>
);

/* Layout with Cashier Sidebar */
const CashierLayout = () => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1, overflow: "auto", background: "#f5f7fb" }}>
        <Outlet />
      </div>
    </div>
  );
};

/* Layout with Admin Sidebar */
const AdminLayout = () => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <AdminSidebar userName="mondal electronic" userPhone="9142581382" />

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

        {/* Cashier Routes with Cashier Sidebar */}
        <Route path="/cashier" element={<CashierLayout />}>

          <Route index element={<Navigate to="/cashier/create-party" replace />} />
          <Route path="navbar" element={<Navbar title="Dashboard" />} />

          <Route path="create-party" element={<Createparty />} />
          <Route path="create-item" element={<CreateItem />} />

          <Route path="quotation" element={<CreateQuotation />} />
          <Route path="payment-in" element={<PaymentIn />} />
          <Route path="sales-return" element={<SalesReturn/>} /> 
          <Route path="credit-note" element={<CreateCreditNote />} />
          <Route path="delivery-challan" element={<DeliveryChallan />} />
          <Route path="proforma-invoice" element={<ProformaInvoice />} />

          <Route path="purchase" element={<Purchases />} />
          <Route path="payment-out" element={<PaymentOut />} />
          <Route path="purchase-return" element={<CreatePurchaseReturn/>} />
          <Route path="debit-note" element={<CreateDebitNote />} />
          <Route path="purchase-orders" element={<PurchaseOrder />} />
          <Route path="create-expense" element={<Createexpense />} />
          <Route path="sales-invoice" element={<Salesinvoice/>} />

        </Route>

        {/* Admin Routes with Admin Sidebar and Navbar */}
        <Route path="/admin" element={<AdminLayout />}>
          
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="account" element={<Account />} />
          <Route path="manage-business" element={<ManageBusiness />} />
          <Route path="invoice-settings" element={<InvoiceBuilder/>} />
          <Route path="print-settings" element={< PrintSetting />} />
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="reminders" element={<ReminderSetting />} />
          <Route path="ca-reports" element={< Reportsharing />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="refer-earn" element={<ReferralPage />} />
          <Route path="help-support" element={<Page title="Help and Support" />} />

        </Route>

        {/* Legacy routes redirect - for backward compatibility */}
        <Route path="/dashboard" element={<Navigate to="/cashier/dashboard" replace />} />
        <Route path="/create-party" element={<Navigate to="/cashier/create-party" replace />} />
        <Route path="/create-item" element={<Navigate to="/cashier/create-item" replace />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;