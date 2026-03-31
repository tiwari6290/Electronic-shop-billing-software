import React, { useState, useRef, useEffect } from "react";
import "./AddUserModal.css";

/* ── Types ── */
type UserRole =
  | ""
  | "Salesman (With edit access)"
  | "Salesman (Without edit access)"
  | "Delivery Boy"
  | "Stock Manager"
  | "Partner"
  | "CA";

const NEW_USER_ROLES: UserRole[] = [
  "Salesman (With edit access)",
  "Salesman (Without edit access)",
  "Delivery Boy",
  "Stock Manager",
  "Partner",
];

const CA_ROLES: UserRole[] = ["CA"];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  "Salesman (With edit access)": [
    "Create Sales and Expense entries",
    "Can edit sales vouchers",
    "View item details and remaining stock",
    "Add new customers",
    "View party statement and expense report",
  ],
  "Salesman (Without edit access)": [
    "Create Sales and Expense entries",
    "View item details and remaining stock",
    "Add new customers",
  ],
  "Delivery Boy": ["View assigned deliveries", "Update delivery status"],
  "Stock Manager": [
    "View item details and remaining stock",
    "Add and edit stock entries",
    "View purchase orders",
  ],
  Partner: [
    "Create Sales and Expense entries",
    "Can edit sales vouchers",
    "View item details and remaining stock",
    "Add new customers",
    "View party statement and expense report",
    "View profit and loss report",
  ],
  CA: [
    "Access to all features (except changing Settings)",
    "Send automatic reports to your CA's email and WhatsApp",
  ],
};

export interface UserData {
  name: string;
  mobile: string;
  role: UserRole;
  email?: string;
}

interface AddUserModalProps {
  mode?: "newUser" | "addCA";
  onClose: () => void;
  onSave: (data: UserData) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  mode = "newUser",
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>(mode === "addCA" ? "CA" : "");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isCA = mode === "addCA";
  const roleOptions = isCA ? CA_ROLES : NEW_USER_ROLES;
  const title = isCA ? "Add User" : "Add User";
  const permissions = role ? (ROLE_PERMISSIONS[role] ?? []) : [];
  const canSave = !!name && !!mobile && !!role;

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleSave = () => {
    if (!canSave) return;
    onSave({ name, mobile, role, email: email || undefined });
    onClose();
  };

  return (
    <div className="au-overlay" onClick={onClose}>
      <div className="au-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="au-modal__header">
          <h2 className="au-modal__title">{title}</h2>
          <button className="au-modal__close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="au-modal__body">
          {/* Row 1: Name + Mobile */}
          <div className="au-form-row">
            <div className="au-field">
              <label className="au-label">Name</label>
              <input
                className="au-input"
                type="text"
                placeholder="Enter user's name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="au-field">
              <label className="au-label">Mobile Number</label>
              <input
                className="au-input"
                type="tel"
                placeholder="Enter user's mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
          </div>

          {/* Row 2: Role + Email (CA) or Role + Business (newUser) */}
          {isCA ? (
            <>
              <div className="au-form-row">
                {/* User Role */}
                <div className="au-field" ref={dropdownRef}>
                  <label className="au-label">User Role</label>
                  <div
                    className={`au-select ${dropdownOpen ? "au-select--open" : ""}`}
                    onClick={() => setDropdownOpen((p) => !p)}
                  >
                    <span className="au-select__value">{role || "Select Role"}</span>
                    <svg className={`au-select__arrow ${dropdownOpen ? "au-select__arrow--up" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                    {dropdownOpen && (
                      <div className="au-dropdown">
                        {roleOptions.map((opt) => (
                          <div
                            key={opt}
                            className={`au-dropdown__item ${role === opt ? "au-dropdown__item--active" : ""}`}
                            onClick={(e) => { e.stopPropagation(); setRole(opt); setDropdownOpen(false); }}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Email (CA only) */}
                <div className="au-field">
                  <label className="au-label">Email ID (Optional)</label>
                  <input
                    className="au-input"
                    type="email"
                    placeholder="Ex. name@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 3: Business (full width for CA) */}
              <div className="au-form-row au-form-row--half">
                <div className="au-field">
                  <label className="au-label">Business</label>
                  <div className="au-select au-select--disabled">
                    <span className="au-select__value">mondal electronic</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="au-form-row">
              {/* User Role */}
              <div className="au-field" ref={dropdownRef}>
                <label className="au-label">User Role</label>
                <div
                  className={`au-select ${dropdownOpen ? "au-select--open" : ""}`}
                  onClick={() => setDropdownOpen((p) => !p)}
                >
                  <span className={`au-select__value ${!role ? "au-select__value--placeholder" : ""}`}>
                    {role || "Select Role"}
                  </span>
                  <svg className={`au-select__arrow ${dropdownOpen ? "au-select__arrow--up" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                  {dropdownOpen && (
                    <div className="au-dropdown">
                      {roleOptions.map((opt) => (
                        <div
                          key={opt}
                          className={`au-dropdown__item ${role === opt ? "au-dropdown__item--active" : ""}`}
                          onClick={(e) => { e.stopPropagation(); setRole(opt); setDropdownOpen(false); }}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Business */}
              <div className="au-field">
                <label className="au-label">Business</label>
                <div className="au-select au-select--disabled">
                  <span className="au-select__value">mondal electronic</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Permissions */}
          {permissions.length > 0 && (
            <div className="au-permissions">
              {permissions.map((perm) => (
                <div key={perm} className="au-permission-item">
                  <span className="au-permission-item__text">{perm}</span>
                  <span className="au-permission-item__check">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="12" fill="#5b5fcf" />
                      <polyline points="5,12 10,17 19,8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Info Bar */}
          <div className="au-info-bar">
            To know more about Admin's permissions click{" "}
            <a href="#" className="au-info-bar__link">User Roles</a>
            <span className="au-info-bar__icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5b5fcf" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="au-modal__footer">
          <button className="au-btn au-btn--cancel" onClick={onClose}>Cancel</button>
          <button
            className={`au-btn au-btn--save ${canSave ? "au-btn--save-active" : ""}`}
            onClick={handleSave}
            disabled={!canSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;