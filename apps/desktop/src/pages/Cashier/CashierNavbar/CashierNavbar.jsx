import "./CashierNavbar.css";
import { ArrowLeft, Keyboard, Settings, Smartphone } from "lucide-react";

export default function CashierNavbar({ title, showMobileUpload }) {
  return (
    <div className="cashier-navbar">

      {/* LEFT */}
      <div className="cashier-navbar-left">
        <ArrowLeft className="nav-icon back-icon" />
        <h2 className="nav-title">{title}</h2>
      </div>

      {/* RIGHT */}
      <div className="cashier-navbar-right">
        <Keyboard size={100} className="nav-icon" />

        {/* 👇 EXTRA OPTION (ONLY WHEN TRUE) */}
        {showMobileUpload && (
          <button className="mobile-upload-btn">
            <Smartphone size={18} />
            <span>Upload using Mobile</span>
          </button>
        )}

        <button className="settings-btn">
          <Settings size={16} />
          <span>Settings</span>
        </button>

        <button className="save-new-btn">Save & New</button>
        <button className="save-btn">Save</button>
      </div>

    </div>
  );
}
