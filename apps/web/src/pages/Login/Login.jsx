import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const roles = [
  { id: "admin", label: "Admin", icon: "🛡️" },
  { id: "cashier", label: "Cashier", icon: "💵" },
  { id: "accountant", label: "Accountant", icon: "📊" },
];

export default function Login() {
  const [role, setRole] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = () => {
    // frontend-only routing (no auth yet)
    if (role === "admin") navigate("/admin");
    if (role === "cashier") navigate("/cashier");
    if (role === "accountant") navigate("/accountant");
  };

  return (
    <div className="login-container">
      {/* LEFT SECTION */}
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
          Complete POS solution with GST compliance, inventory tracking, and
          multi-branch management.
        </p>

        <div className="features">
          <div className="feature">
            <span>&lt; 10 sec</span>
            <p>Fast Billing</p>
          </div>
          <div className="feature">
            <span>100%</span>
            <p>GST Ready</p>
          </div>
          <div className="feature">
            <span>Auto</span>
            <p>Daily Reports</p>
          </div>
          <div className="feature">
            <span>Multi</span>
            <p>Store Supported</p>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="login-right">
        <h2>Welcome Back</h2>
        <p className="right-subtitle">
          Sign in to access your dashboard
        </p>

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

        <label className="label">Branch / Store</label>
        <select className="input">
          <option>Main Store</option>
          <option>Branch 1</option>
          <option>Branch 2</option>
        </select>

        <label className="label">Email / Mobile / Username</label>
        <input
          className="input"
          type="text"
          placeholder="Enter your email or mobile"
        />

        <div className="password-row">
          <label className="label">Password</label>
          <span className="forgot">Forgot Password?</span>
        </div>

        <div className="password-box">
          <input
            className="input"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
          />
          <span
            className="eye"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide password" : "Show password"}
          >
            👁
          </span>
        </div>

        <button className="login-btn" onClick={handleLogin}>
          ⚡ Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
        </button>

        <p className="demo">
          Demo: Use any email and password (min 4 chars) to login
        </p>
      </div>
    </div>
  );
}
