import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* AUTH */
import Login from "./pages/Login/Login";

/* ADMIN */
import AdminDashboard from "./pages/Admin/AdminDashboard/AdminDashboard";

/* CASHIER */
import CashierLayout from "./pages/Cashier/CashierLayout/CashierLayout";

/* ACCOUNTANT */
import AccountantLayout from "./pages/Accountant/AccountantLayout/AccountantLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= ROOT ================= */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* ================= LOGIN ================= */}
        <Route path="/login" element={<Login />} />

        {/* ================= ADMIN ================= */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* ================= CASHIER ================= */}
        <Route path="/cashier/*" element={<CashierLayout />} />

        {/* ================= ACCOUNTANT ================= */}
        <Route path="/accountant/*" element={<AccountantLayout />} />

        {/* ================= 404 ================= */}
        <Route path="*" element={<h1>404 Page Not Found</h1>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
