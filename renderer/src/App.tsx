import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "@/components/Login/Login";

/* --- Your existing imports remain SAME --- */
import Sidebar from "./components/Cashier/Sidebar";
import AdminSidebar from "./components/Admin/AdminSidebar/AdminSidebar";
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
import Invoicing from "./components/Accountant/E-Invoicing/Invoicing";
import Billing from "./components/Cashier/POS Billing/Billing";
import Bills from "./components/Accountant/Automatedbills/Bills";
/*import Bills from "./components/Accountant/Automatedbills/Bills";*/
import PaymentInList from "./components/Cashier/PaymentIn/PaymentInList";
import PaymentOutList from "./components/Cashier/PaymentOut/PaymentOutList";
import Reports from "./components/Admin/Reports/Reports";
import ReceivableAgeingReport from "./components/Admin/Reports/ReceivableAgeingReport";
import PurchaseOrderList from "./components/Cashier/PurchaseOrder/PurchaseOrderList";
/*import PurchaseOrderList from "./components/Cashier/PurchaseOrder/PurchaseOrderList";*/
import PurchaseOrdersPage from "./components/Cashier/PurchaseOrder/Purchaseorderspage";
import Parties from "./components/Cashier/Parties/Parties";
import PartyDetails from "./components/Cashier/Parties/PartyDetails";
import PartyLedger from "./components/Cashier/Parties/PartyLedger";
import QuotationEstimate from "./components/Cashier/Quotationestimate/Quotationestimate";
import Purchase from "./components/Cashier/Createpurchase/Purchase";



/* Dummy pages (replace later with real pages) */

import AutomatedBills from "./components/Accountant/Automatedbills/automatedbills";
/* Dummy Pages */
const Page = ({ title }: { title: string }) => (
  <div style={{ padding: 30, fontSize: 22, fontWeight: 600 }}>{title}</div>
);

const AdminDashboard = () => (
  <div style={{ padding: 30 }}>
    <h1>Admin Dashboard</h1>
  </div>
);

const AccountantDashboard = () => (
  <div style={{ padding: 30 }}>
    <h1>Accountant Dashboard</h1>
  </div>
);

/* Layouts */

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

        {/* 🔒 CASHIER */}
        <Route
          path="/cashier"
          element={
            <ProtectedRoute allowedRole="Cashier">
              <CashierLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="create-party" replace />} />
          <Route path="create-party" element={<Createparty />} />
          <Route path="create-item" element={<CreateItem />} />
          <Route path="POS-billing" element ={<Billing />}/>
          <Route path="parties" element ={<Parties/>}/>
          <Route path="party/:id" element={<PartyDetails />} />

          <Route path="quotation" element={<CreateQuotation />} />
          <Route path="payment-in" element={<PaymentIn />} />
          <Route path="payment-in-list" element={<PaymentInList/>}/>
        
          <Route path="sales-return" element={<SalesReturn />} />
          <Route path="credit-note" element={<CreateCreditNote />} />
          <Route path="delivery-challan" element={<DeliveryChallan />} />
          <Route path="proforma-invoice" element={<ProformaInvoice />} />
          <Route path="purchase" element={<Purchases />} />
          <Route path="payment-out" element={<PaymentOut />} />
          <Route path="payment-out-list" element={<PaymentOutList/>}/>
          <Route path="purchase-return" element={<CreatePurchaseReturn/>} />
          <Route path="purchase-return" element={<CreatePurchaseReturn />} />
          <Route path="debit-note" element={<CreateDebitNote />} />
           <Route path="purchase-orders-form" element={<PurchaseOrder />} />
          {/*<Route path="purchase-orders-list" element={<PurchaseOrderList />} /> */}
          <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
          <Route path="sales-return"        element={<SalesReturn />} />
          <Route path="credit-note"         element={<CreateCreditNote />} />
          <Route path="delivery-challan"    element={<DeliveryChallan />} />
          <Route path="proforma-invoice"    element={<ProformaInvoice />} />
         {/*  <Route path="purchase"            element={<Purchases />} /> */}
         <Route path ="/cashier/purchase"   element={<Purchase/>} />
          <Route path="payment-out"         element={<PaymentOut />} />
          <Route path="payment-out-list"    element={<PaymentOutList />} />
          <Route path="purchase-return"     element={<CreatePurchaseReturn />} />
          <Route path="debit-note"          element={<CreateDebitNote />} />
          <Route path="purchase-orders-form" element={<PurchaseOrder />} />
          <Route path="purchase-orders"     element={<PurchaseOrdersPage />} />
          <Route path="quotation-estimate"  element={<QuotationEstimate />} />
          <Route path="create-expense"      element={<Createexpense />} />

          {/* ── Sales Invoice — 3 routes ─────────────────────────── */}
          <Route path="sales-invoicses-list"    element={<SalesInvoiceList />} />
          <Route path="sales-invoice"           element={<CreateSalesInvoiceNew />} />
          <Route path="sales-invoice/edit/:id"  element={<EditSalesInvoice />} />

          <Route path="create-expense" element={<Createexpense />} />
          <Route path="sales-invoice" element={<Salesinvoice />} />
        </Route>

        {/* Admin Routes with Admin Sidebar and Navbar */}
        {/* ADMIN ROUTES */}
            <Route path="/admin" element={<Outlet />}>

              {/* 🔹 Normal Admin Section */}
              <Route element={<AdminMainLayout />}>
                <Route index element={<Navigate to="/cashier/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="manage-users" element={<ManageUsers />} /> 
                <Route path="staff-attendence" element={<StaffAttendance />} /> 
                <Route path="online-orders" element={<Onlineorders />} /> 
                <Route path="sms-marketing" element={<SMSPromotion />} /> 
                <Route path="reports" element={<Reports />} />
                <Route path="receivable-ageing" element={<ReceivableAgeingReport />} />
              </Route>

              {/* 🔹 Settings Section */}
              <Route path="settings" element={<AdminSettingsLayout />}>
                <Route index element={<Navigate to="account" replace />} />
                <Route path="account" element={<Account />} />
                <Route path="manage-business" element={<ManageBusiness />} />
                <Route path="invoice-settings" element={<InvoiceBuilder />} />
                <Route path="print-settings" element={<PrintSetting />} />
                <Route path="manage-users" element={<ManageUsers />} />
                <Route path="reminders" element={<ReminderSetting />} />
                <Route path="ca-reports" element={<Reportsharing />} />
                <Route path="pricing" element={<Pricing />} />
                <Route path="refer-earn" element={<ReferralPage />} />
              </Route>

          </Route>

          

          

        {/* 🔒 ACCOUNTANT */}
        <Route
          path="/accountant"
          element={
            <ProtectedRoute allowedRole="Accountant">
              <AccountantLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AccountantDashboard />} />
          <Route path="cash-bank" element={<CashBank />} />
          <Route path="e-invoicing" element={<Invoicing />} />
          <Route path="automated-bills" element={<Bills />} />
          <Route path="expenses" element={<Expenses />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;