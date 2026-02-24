import React, { useState, useEffect } from "react";
import AdminNavbar from "../AdminNavbar/AdminNavbar";
import "./Reportsharing.css";

const CAReportsSharing: React.FC = () => {
  const [enableSharing, setEnableSharing] = useState(false);
  const [showCAModal, setShowCAModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // CA Details form
  const [caName, setCaName] = useState("");
  const [caWhatsApp, setCaWhatsApp] = useState("");
  const [caEmail, setCaEmail] = useState("");

  // Add User form
  const [userName, setUserName] = useState("");
  const [userMobile, setUserMobile] = useState("");
  const [userRole, setUserRole] = useState("CA");
  const [userEmail, setUserEmail] = useState("");
  const [userBusiness, setUserBusiness] = useState("Business Name");

  useEffect(() => {
    const h1 = document.querySelector(".admin-navbar h1");
    if (h1) h1.textContent = "CA Reports Sharing";
    const p = document.querySelector(".admin-navbar p");
    if (p) p.textContent = "Automatically share reports to your CA every month";
  }, []);

  const handleToggle = () => {
    const next = !enableSharing;
    setEnableSharing(next);
    if (next) setShowCAModal(true);
  };

  const handleAddYourCA = () => {
    setShowCAModal(false);
    setShowAddUserModal(true);
  };

  const closeAll = () => {
    setShowCAModal(false);
    setShowAddUserModal(false);
  };

  return (
    <div className="ca-page">
      <AdminNavbar type="account" />

      <div className="ca-body">
        <div className="ca-settings-label">Settings</div>

        {/* Enable Sharing row */}
        <div className="ca-settings-card">
          <div className="ca-settings-row">
            <div>
              <div className="ca-setting-title">Enable Sharing</div>
              <div className="ca-setting-sub">Control the business reports sharing with your CA</div>
            </div>
            <div
              className={`toggle-switch ${enableSharing ? "on" : ""}`}
              onClick={handleToggle}
            >
              <div className="toggle-knob" />
            </div>
          </div>
        </div>

        {/* Info notice */}
        <div className="ca-notice">
          <span className="ca-notice-icon">ℹ️</span>
          Automatic report sending will be scheduled for the 1st of every month starting from March 1, 2026
        </div>

        {/* Footer note */}
        <div className="ca-footer-note">
          Note: The use of this logo does not imply any endorsement, affiliation, or association with the ICAI. The logo is the intellectual property of ICAI, and all rights to the logo remain with them
        </div>
      </div>

      {/* ── Modal 1: CA Reports Sharing ── */}
      {showCAModal && (
        <div className="modal-overlay" onClick={() => setShowCAModal(false)}>
          <div className="modal ca-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">CA Reports Sharing</span>
              <button className="modal-close" onClick={() => setShowCAModal(false)}>×</button>
            </div>

            {/* Illustration */}
            <div className="ca-illustration">
              <div className="ca-illus-inner">
                <div className="illus-doc">
                  <div className="illus-doc-label">GSTR 1</div>
                  <div className="illus-doc-label small">GSTR 2</div>
                  <div className="illus-doc-icon">📄</div>
                </div>
                <div className="illus-arrows">➝➝</div>
                <div className="illus-person">👨‍💼</div>
                <div className="illus-computer">🖥️</div>
              </div>
            </div>

            <div className="modal-section-title">CA Details</div>

            <div className="modal-field">
              <label>CA Name <span className="req">*</span></label>
              <input
                type="text"
                placeholder="Ex: Ankit Mishra"
                value={caName}
                onChange={e => setCaName(e.target.value)}
              />
            </div>

            <div className="modal-field">
              <label>CA WhatsApp Number <span className="req">*</span></label>
              <input
                type="text"
                placeholder="Ex : 9876543210"
                value={caWhatsApp}
                onChange={e => setCaWhatsApp(e.target.value)}
              />
            </div>

            <div className="modal-field">
              <label>CA Email ID (optional)</label>
              <input
                type="email"
                placeholder="Ex: abc@gmail.com"
                value={caEmail}
                onChange={e => setCaEmail(e.target.value)}
              />
            </div>

            <div className="ca-note-box">
              <strong>Note:</strong> GSTR Reports will be automatically sent to CA on 1st of every month
            </div>

            <div className="ca-add-bar">
              <div className="ca-add-bar-left">
                <div className="ca-badge">CA</div>
                <div className="ca-add-bar-text">
                  <div className="ca-add-bar-title">Add Your CA and forget about</div>
                  <div className="ca-add-bar-sub">the hassle of report sharing</div>
                </div>
              </div>
              <button className="btn-add-ca" onClick={handleAddYourCA}>Add Your CA</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 2: Add User ── */}
      {showAddUserModal && (
        <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
          <div className="modal add-user-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add User</span>
              <button className="modal-close" onClick={() => setShowAddUserModal(false)}>×</button>
            </div>

            <div className="add-user-grid">
              <div className="modal-field">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Enter user's name"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                />
              </div>
              <div className="modal-field">
                <label>Mobile Number</label>
                <input
                  type="text"
                  placeholder="Enter user's mobile number"
                  value={userMobile}
                  onChange={e => setUserMobile(e.target.value)}
                />
              </div>
              <div className="modal-field">
                <label>User Role</label>
                <select value={userRole} onChange={e => setUserRole(e.target.value)}>
                  <option>CA</option>
                  <option>Manager</option>
                  <option>Staff</option>
                </select>
              </div>
              <div className="modal-field">
                <label>Email ID (Optional)</label>
                <input
                  type="email"
                  placeholder="Ex. name@gmail.com"
                  value={userEmail}
                  onChange={e => setUserEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-field">
              <label>Business</label>
              <select value={userBusiness} onChange={e => setUserBusiness(e.target.value)}>
                <option>Business Name</option>
              </select>
            </div>

            <div className="permissions-box">
              <div className="permission-row">
                <span>Access to all features (except changing Settings)</span>
                <span className="perm-check">✓</span>
              </div>
              <div className="permission-row">
                <span>Send automatic reports to your CA's email and WhatsApp</span>
                <span className="perm-check">✓</span>
              </div>
            </div>

            <div className="add-user-actions">
              <button className="btn-cancel-modal" onClick={() => setShowAddUserModal(false)}>Cancel</button>
              <button className="btn-save-modal" onClick={closeAll}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CAReportsSharing;