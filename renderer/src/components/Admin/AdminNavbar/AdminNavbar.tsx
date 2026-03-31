import React, { useState } from "react";
import "./AdminNavbar.css";

interface AdminNavbarProps {
  type?: "business" | "account";
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ type = "business" }) => {
  const [showChatSupport, setShowChatSupport] = useState(false);

  return (
    <>
      <nav className="admin-navbar">
        <div className="admin-navbar-left">
          <h1>
            {type === "account"
              ? "Account Settings"
              : "Business Settings"}
          </h1>

          <p>
            {type === "account"
              ? "Manage Your Account And Subscription"
              : "Edit Your Company Settings And Information"}
          </p>
        </div>

        <div className="admin-navbar-right">
          {type === "business" && (
            <>
              <button className="btn btn-primary">
                Create new business
              </button>

              <button className="btn btn-warning">
                Close Financial Year
              </button>
            </>
          )}

          <button
            className="btn btn-secondary"
            onClick={() => setShowChatSupport(true)}
          >
            Chat Support
          </button>

          {type === "account" && (
            <button className="btn btn-secondary">
              Cancel
            </button>
          )}

          <button className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </nav>

      {/* Your Modals Here */}
    </>
  );
};

export default AdminNavbar;
