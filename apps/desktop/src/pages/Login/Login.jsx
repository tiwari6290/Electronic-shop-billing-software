import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const roles = [
  { id: "admin", label: "Admin", icon: "🛡️" },
  { id: "cashier", label: "Cashier", icon: "💵" },
  { id: "accountant", label: "Accountant", icon: "📊" },
];

export default function Login() {
  const [role, setRole] = useState("cashier");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = () => {
    if (role === "cashier") navigate("/cashier");
    if (role === "admin") navigate("/admin");
    if (role === "accountant") navigate("/accountant");
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="brand">
          <div className="logo">⚡</div>
          <div>
            <h3>ElectroShop</h3>
            <p>Billing & Inventory System</p>
          </div>
        </div>

        <h1>
          Smart Billing <br /> for Modern Stores
        </h1>

        <p className="subtitle">
          Desktop POS system with offline billing and fast checkout.
        </p>
      </div>

      <div className="login-right">
        <h2>Cash Counter Login</h2>

        <label className="label">Login As</label>
        <div className="role-box">
          {roles.map((r) => (
            <div
              key={r.id}
              className={`role-card ${role === r.id ? "active" : ""}`}
              onClick={() => setRole(r.id)}
            >
              <div className="role-icon">{r.icon}</div>
              <p>{r.label}</p>
            </div>
          ))}
        </div>

        <label className="label">Username</label>
        <input className="input" placeholder="Enter username" />

        <label className="label">Password</label>
        <input
          className="input"
          type={showPassword ? "text" : "password"}
          placeholder="Enter password"
        />

        <button className="login-btn" onClick={handleLogin}>
          ⚡ Login
        </button>
      </div>
    </div>
  );
}
