import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login/Login";

import AdminDashboard from "./pages/Admin/AdminDashboard/AdminDashboard";
import CashierDashboard from "./pages/Cashier/CashierDashboard/CashierDashboard";
import AccountantLayout from "./pages/Accountant/AccountantLayout/AccountantLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Admin & Cashier */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/cashier" element={<CashierDashboard />} />

        {/* ✅ ACCOUNTANT (IMPORTANT) */}
        <Route path="/accountant/*" element={<AccountantLayout />} />

        {/* 404 */}
        <Route path="*" element={<h1>404 Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
