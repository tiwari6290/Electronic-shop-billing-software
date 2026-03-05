import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate, useParams, useLocation } from "react-router-dom";
import Login from "@/components/Login/Login";
import Sidebar from "./components/Cashier/Sidebar";
import AdminSidebar from "./components/Admin/AdminSidebar/AdminSidebar";
import Navbar from "./components/Cashier/Navbar";
import Createparty from "./components/Cashier/Createparty";
import CreateItem from "./components/Cashier/CreateItem/CreateItem";
import ProformaInvoice from "./components/Cashier/ProformaInvoice";
import Purchases from "./components/Cashier/Purchases/Purchases";
import CreateDebitNote from "./components/Cashier/CreateDebitNote/CreateDebitNote";
import CreatePurchaseReturn from "./components/Cashier/CreatePurchaseReturn/CreatePurchaseReturn";
import PaymentOut from "./components/Cashier/PaymentOut/PaymentOut";
import PaymentIn from "./components/Cashier/PaymentIn/PaymentIn";
import PaymentInView from "./components/Cashier/PaymentIn/Paymentinview";
// import CreateCreditNote from "./components/Cashier/CreateCreditNote/CreateCreditNote";
import DeliveryChallan from "./components/Cashier/DeliveryChallan/DeliveryChallan";
import PurchaseOrder from "./components/Cashier/PurchaseOrder/PurchaseOrder";
import Createexpense from "./components/Cashier/Createexpense";
import AdminSettingSidebar from "./components/Admin/AdminSettingSidebar";
import ManageBusiness from "./components/Admin/ManageBuisness";
import Account from "./components/Admin/Account/Account";
import Pricing from "./components/Admin/Pricing/Pricing";
import PrintSetting from "./components/Admin/PrintSetting/Printsetting";
import ReminderSetting from "./components/Admin/ReminderSetting/Remindersetting";
import Reportsharing from "./components/Admin/ReportSharing/Reportsharing";
import ReferralPage from "./components/Admin/Referralpage/Referralpage";
import ManageUsers from "./components/Admin/Manageusers/Manageusers";
import InvoiceBuilder from "./components/Admin/Invoicebuilder/Invoicebuilder";
import StaffAttendance from "./components/Admin/StaffAttendance/StaffAttendance";
import Onlineorders from "./components/Admin/Onlineorders/Onlineorders";
import SMSPromotion from "./components/Admin/Smspromotion/Smspromotion";
import AccountantSidebar from "./components/Accountant/Sidebar";
import CashBank from "./components/Accountant/Cashbank/Cashbank";
import Expenses from "./components/Accountant/Expenses/Expenses";
import Billing from "./components/Cashier/POS Billing/Billing";
import PaymentInList from "./components/Cashier/PaymentIn/PaymentInList";
import PaymentOutList from "./components/Cashier/PaymentOut/PaymentOutList";
import Reports from "./components/Admin/Reports/Reports";
import ReceivableAgeingReport from "./components/Admin/Reports/ReceivableAgeingReport";
import PurchaseOrdersPage from "./components/Cashier/PurchaseOrder/Purchaseorderspage";
import Parties from "./components/Cashier/Parties/Parties";
import PartyDetails from "./components/Cashier/Parties/PartyDetails";
import PartyLedger from "./components/Cashier/Parties/PartyLedger";
import QuotationEstimate from "./components/Cashier/Quotationestimate/Quotationestimate";

// Sales Return list + form + view
/*import SalesReturn from "./components/Cashier/Salesreturn/Salesreturn";
import CreateSalesReturn from "./components/Cashier/Salesreturn/Createsalesreturn";
import SalesReturnViewModel from "./components/Cashier/Salesreturn/Salesreturnviewmodel";
import CreditNote from "./components/Cashier/Creditnote/Creditnote";*/

// Sales Invoice components
import SalesInvoiceList   from "./components/Cashier/Salesinvoices/SalesInvoiceList";
import CreateSalesInvoice from "./components/Cashier/Salesinvoices/CreateSalesInvoice";
import Inventory from "./components/Cashier/Inventory/Inventory";
import Godown from "./components/Cashier/Godown/Godown";

const Page = ({ title }: { title: string }) => (
  <div style={{ padding: 30, fontSize: 22, fontWeight: 600 }}>{title}</div>
);
const AdminDashboard = () => (
  <div style={{ padding: 30 }}>
    <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 20 }}>Admin Dashboard</h1>
    <p style={{ fontSize: 16, color: "#6b7280" }}>Welcome to Admin Panel</p>
  </div>
);
const AccountantDashboard = () => (
  <div style={{ padding: 30 }}>
    <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 20 }}>Accountant Dashboard</h1>
    <p style={{ fontSize: 16, color: "#6b7280" }}>Welcome to Accountant Panel</p>
  </div>
);

// Sales Invoice wrappers
function CreateSalesInvoiceNew() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromQuotation = location.state?.fromQuotation ?? null;
  return (
    <CreateSalesInvoice
      fromQuotation={fromQuotation}
      onBack={() => navigate("/cashier/sales-invoicses-list")}
      onSaveAndNew={() => navigate("/cashier/sales-invoice")}
    />
  );
}

function EditSalesInvoice() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  return (
    <CreateSalesInvoice
      editId={id}
      onBack={() => navigate("/cashier/sales-invoicses-list")}
      onSaveAndNew={() => navigate("/cashier/sales-invoice")}
    />
  );
}

// // Sales Return wrappers
// function CreateSalesReturnNew() {
//   const navigate = useNavigate();
//   return (
//     <CreateSalesReturn
//       onBack={() => navigate("/cashier/sales-return")}
//     />
//   );
// }

// function EditSalesReturn() {
//   const navigate = useNavigate();
//   const { id } = useParams<{ id: string }>();
//   return (
//     <CreateSalesReturn
//       editId={id}
//       onBack={() => navigate("/cashier/sales-return")}
//     />
//   );
// }

// // SalesReturnViewModel uses useParams/useNavigate internally — no props needed
// function ViewSalesReturnPage() {
//   return <SalesReturnViewModel />;
// }

// Layouts
const CashierLayout = () => (
  <div style={{ display: "flex", height: "100vh" }}>
    <Sidebar />
    <div style={{ flex: 1, overflow: "auto", background: "#f5f7fb" }}>
      <Outlet />
    </div>
  </div>
);

const AdminMainLayout = () => (
  <div style={{ display: "flex", height: "100vh" }}>
    <AdminSidebar userName="mondal electronic" userPhone="9142581382" />
    <div style={{ flex: 1, overflow: "auto", background: "#f5f7fb" }}>
      <Outlet />
    </div>
  </div>
);

const AdminSettingsLayout = () => (
  <div style={{ display: "flex", height: "100vh" }}>
    <AdminSettingSidebar />
    <div style={{ flex: 1, overflow: "auto", background: "#f5f7fb" }}>
      <Outlet />
    </div>
  </div>
);

const AccountantLayout = () => (
  <div style={{ display: "flex", height: "100vh" }}>
    <AccountantSidebar userName="mondal electronic" userPhone="9142581382" />
    <div style={{ flex: 1, overflow: "auto", background: "#f5f7fb" }}>
      <Outlet />
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Cashier */}
        <Route path="/cashier" element={<CashierLayout />}>
          <Route index element={<Navigate to="/cashier/create-party" replace />} />
          <Route path="navbar"              element={<Navbar title="Dashboard" />} />
          <Route path="create-party"        element={<Createparty />} />
          <Route path="create-party/:id"    element={<Createparty />} />
          <Route path="create-item"         element={<CreateItem />} />
          <Route path="POS-billing"         element={<Billing />} />
          <Route path="parties"             element={<Parties />} />
          <Route path="party/:id"           element={<PartyDetails />} />
          <Route path="party-ledger/:id"    element={<PartyLedger />} />
          <Route path="payment-in"          element={<PaymentIn />} />
          <Route path="payment-in-list"     element={<PaymentInList />} />
          <Route path="payment-in-view/:id" element={<PaymentInView />} />
          <Route path="create-item/inventory" element={<Inventory />} />
          <Route path="create-item/godown"    element={<Godown />} />

          {/* Sales Return - 4 routes */}
          {/* <Route path="sales-return"            element={<SalesReturn />} />
          <Route path="sales-return-create"     element={<CreateSalesReturnNew />} />
          <Route path="sales-return-edit/:id"   element={<EditSalesReturn />} />
          <Route path="sales-return-view/:id"   element={<ViewSalesReturnPage />} />

          <Route path="credit-note"           element={<CreditNote />} /> */}
          <Route path="delivery-challan"      element={<DeliveryChallan />} />
          <Route path="proforma-invoice"      element={<ProformaInvoice />} />
          <Route path="purchase"              element={<Purchases />} />
          <Route path="payment-out"           element={<PaymentOut />} />
          <Route path="payment-out-list"      element={<PaymentOutList />} />
          <Route path="purchase-return"       element={<CreatePurchaseReturn />} />
          <Route path="debit-note"            element={<CreateDebitNote />} />
          <Route path="purchase-orders-form"  element={<PurchaseOrder />} />
          <Route path="purchase-orders"       element={<PurchaseOrdersPage />} />
          <Route path="quotation-estimate"    element={<QuotationEstimate />} />
          <Route path="create-expense"        element={<Createexpense />} />

          {/* Sales Invoice - 3 routes */}
          <Route path="sales-invoicses-list"   element={<SalesInvoiceList />} />
          <Route path="sales-invoice"          element={<CreateSalesInvoiceNew />} />
          <Route path="sales-invoice/edit/:id" element={<EditSalesInvoice />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<Outlet />}>
          <Route element={<AdminMainLayout />}>
            <Route index element={<Navigate to="/cashier/dashboard" replace />} />
            <Route path="dashboard"         element={<AdminDashboard />} />
            <Route path="manage-users"      element={<ManageUsers />} />
            <Route path="staff-attendence"  element={<StaffAttendance />} />
            <Route path="online-orders"     element={<Onlineorders />} />
            <Route path="sms-marketing"     element={<SMSPromotion />} />
            <Route path="reports"           element={<Reports />} />
            <Route path="receivable-ageing" element={<ReceivableAgeingReport />} />
          </Route>
          <Route path="settings" element={<AdminSettingsLayout />}>
            <Route index element={<Navigate to="account" replace />} />
            <Route path="account"           element={<Account />} />
            <Route path="manage-business"   element={<ManageBusiness />} />
            <Route path="invoice-settings"  element={<InvoiceBuilder />} />
            <Route path="print-settings"    element={<PrintSetting />} />
            <Route path="manage-users"      element={<ManageUsers />} />
            <Route path="reminders"         element={<ReminderSetting />} />
            <Route path="ca-reports"        element={<Reportsharing />} />
            <Route path="pricing"           element={<Pricing />} />
            <Route path="refer-earn"        element={<ReferralPage />} />
          </Route>
        </Route>

        {/* Accountant */}
        <Route path="/accountant" element={<AccountantLayout />}>
          <Route index element={<Navigate to="/accountant/dashboard" replace />} />
          <Route path="dashboard"       element={<AccountantDashboard />} />
          <Route path="cash-bank"       element={<CashBank />} />
          <Route path="e-invoicing"     element={<Page title="E-Invoicing" />} />
          <Route path="automated-bills" element={<Page title="Automated Bills" />} />
          <Route path="expenses"        element={<Expenses />} />
        </Route>

        {/* Legacy redirects */}
        <Route path="/dashboard"    element={<Navigate to="/cashier/dashboard" replace />} />
        <Route path="/create-party" element={<Navigate to="/cashier/create-party" replace />} />
        <Route path="/create-item"  element={<Navigate to="/cashier/create-item" replace />} />

        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;