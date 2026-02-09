import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "@/components/Login/Login";
import Sidebar from "./components/Cashier/Sidebar";
import Navbar from "./components/Cashier/Navbar";
import CashierDashboard from "./components/CashierDashboard/CashierDashboard";
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
          <Route path="/create-item" element={<CreateItem />} />

          <Route path="/quotation" element={<CreateQuotation />} />
          <Route path="/payment-in" element={<PaymentIn />} />
           <Route path="/sales-return" element={<SalesReturn/>} /> 
          <Route path="/credit-note" element={<CreateCreditNote />} />
          <Route path="/delivery-challan" element={<DeliveryChallan />} />
          <Route path="/proforma-invoice" element={<ProformaInvoice />} />

          <Route path="/purchase" element={<Purchases />} />
          <Route path="/payment-out" element={<PaymentOut />} />
          <Route path="/purchase-return" element={<CreatePurchaseReturn/>} />
          <Route path="/debit-note" element={<CreateDebitNote />} />
          <Route path="/purchase-orders" element={<PurchaseOrder />} />
          <Route path="/create-expense" element={<Page title="Create Expense" />} />

        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;