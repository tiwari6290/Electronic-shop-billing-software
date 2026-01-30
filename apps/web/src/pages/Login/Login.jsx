import "./Login.css";
import { useState } from "react";
import { FaBolt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [role, setRole] = useState("Admin");
  const navigate = useNavigate();

  // ✅ ONLY NEW LOGIC ADDED
  const handleLogin = () => {
    if (role === "Admin") navigate("/admin");
    if (role === "Cashier") navigate("/cashier");
    if (role === "Accountant") navigate("/accountant");
  };

  return (
    <div className="login-wrapper">

      {/* LEFT SIDE */}
      <div className="login-left">
        <div className="brand">
          <div className="brand-icon">
            <div className="logo-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M13 2L3 14H11L9 22L21 10H13L15 2Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div>
            <h3>ElectroShop</h3>
            <span>Billing & Inventory System</span>
          </div>
        </div>

        <h1>
          Smart Billing <br /> for Modern Stores
        </h1>

        <p>
          Complete POS solution with GST compliance,
          inventory tracking, and multi-branch management.
        </p>

        <div className="features">
          <div className="feature-card">
            <small>Fast Billing</small><strong>&lt; 10 sec</strong>
          </div>
          <div className="feature-card">
            <small>GST Ready</small><strong>100%</strong>
          </div>
          <div className="feature-card">
            <small>Daily Reports</small><strong>Auto</strong>
          </div>
          <div className="feature-card">
            <small>Multi-Store</small><strong>Supported</strong>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="login-right">
        <div className="login-card">

          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to access your dashboard</p>

          <label>Login As</label>

          <div className="role-box">
            <div
              className={`role ${role === "Admin" ? "active admin-active" : ""}`}
              onClick={() => setRole("Admin")}
            >
              <div className="icon-circle admin-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2L19 5V11C19 15.5 15.8 19.7 12 21C8.2 19.7 5 15.5 5 11V5L12 2Z" />
                </svg>
              </div>
              <span>Admin</span>
            </div>

            <div
              className={`role ${role === "Cashier" ? "active cashier-active" : ""}`}
              onClick={() => setRole("Cashier")}
            >
              <div className="icon-circle cashier-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M6 3H18V21L15 19L12 21L9 19L6 21V3Z" />
                  <path d="M9 7H15" />
                  <path d="M9 11H15" />
                </svg>
              </div>
              <span>Cashier</span>
            </div>

            <div
              className={`role ${role === "Accountant" ? "active accountant-active" : ""}`}
              onClick={() => setRole("Accountant")}
            >
              <div className="icon-circle accountant-icon">
                <svg viewBox="0 0 24 24">
                  <rect x="6" y="3" width="12" height="18" rx="2" />
                  <path d="M9 7H15" />
                  <path d="M9 11H15" />
                  <path d="M10 15H10.01" />
                  <path d="M12 15H12.01" />
                  <path d="M14 15H14.01" />
                </svg>
              </div>
              <span>Accountant</span>
            </div>
          </div>

          <label>Branch / Store</label>
          <select>
            <option>Main Store</option>
          </select>

          <label>Email / Mobile / Username</label>
          <input placeholder="Enter your email or mobile" />

          <div className="password-row">
            <label>Password</label>
            <span>Forgot Password?</span>
          </div>

          <input type="password" placeholder="Enter your password" />

          {/* ✅ BUTTON NOW NAVIGATES */}
          <button onClick={handleLogin}>
            <FaBolt /> Sign In as {role}
          </button>

        </div>
      </div>
    </div>
  );
}
