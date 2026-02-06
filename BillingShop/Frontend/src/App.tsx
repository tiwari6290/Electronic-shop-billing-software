import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/components/Login/Login";
import CashierDashboard from "./components/CashierDashboard/CashierDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route → login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login page */}
        <Route path="/login" element={<Login />} />

        {/* Cashier Dashboard */}
        <Route
          path="/dashboard"
          element={<CashierDashboard />}
        />

        {/* Catch all → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
