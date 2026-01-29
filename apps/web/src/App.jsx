import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login/Login";

import AdminDashboard from "./pages/Admin/AdminDashboard/AdminDashboard";
import AccountantDashboard from "./pages/Accountant/AccountantDashboard/AccountantDashboard";
import CashierDashboard from "./pages/Cashier/CashierDashboard/CashierDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/accountant" element={<AccountantDashboard />} />
        <Route path="/cashier" element={<CashierDashboard />} />

        <Route path="*" element={<h1>404 Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
