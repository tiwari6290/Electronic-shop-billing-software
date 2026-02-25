import { useState } from "react";
import "./Navbar.css";

// ─── Transfer Balance Modal ───────────────────────────────────────────────────
const TransferModal = ({ onClose }: { onClose: () => void }) => {
  const [from, setFrom] = useState("Cash");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [remarks, setRemarks] = useState("");
  const [showRemarks, setShowRemarks] = useState(false);

  return (
    <div className="cb-modal-overlay" onClick={onClose}>
      <div className="cb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cb-modal__header">
          <span className="cb-modal__title">Transfer Balance</span>
          <button className="cb-modal__close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="cb-form-group">
          <label className="cb-form-label">Transfer money from</label>
          <select className="cb-form-select" value={from} onChange={(e) => setFrom(e.target.value)}>
            <option>Cash</option>
            <option>Bank Account 1</option>
            <option>Bank Account 2</option>
          </select>
        </div>

        <div className="cb-form-group">
          <label className="cb-form-label">Transfer money to</label>
          <select className="cb-form-select" value={to} onChange={(e) => setTo(e.target.value)}>
            <option value="">Select account</option>
            <option>Cash</option>
            <option>Bank Account 1</option>
            <option>Bank Account 2</option>
          </select>
        </div>

        <div className="cb-form-row">
          <div>
            <label className="cb-form-label">Current Balance</label>
            <div className="cb-balance-info">₹ 0</div>
          </div>
          <div>
            <label className="cb-form-label">Date</label>
            <input type="date" className="cb-form-input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div className="cb-form-group">
          <label className="cb-form-label" style={{ color: "#4169e1" }}>Enter Amount</label>
          <div className="cb-amount-wrapper">
            <span className="cb-amount-prefix">₹</span>
            <input type="number" className="cb-amount-input" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
        </div>

        {!showRemarks ? (
          <button className="cb-link-btn" onClick={() => setShowRemarks(true)}>+ Add Remarks</button>
        ) : (
          <div className="cb-form-group">
            <label className="cb-form-label">Remarks</label>
            <textarea className="cb-form-textarea" placeholder="Add a note..." value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </div>
        )}

        <div className="cb-modal__footer">
          <button className="cb-btn cb-btn--cancel" onClick={onClose}>Cancel</button>
          <button className="cb-btn cb-btn--save" onClick={onClose}>Save</button>
        </div>
      </div>
    </div>
  );
};

// ─── Adjust Balance Modal ─────────────────────────────────────────────────────
const AdjustModal = ({ onClose }: { onClose: () => void }) => {
  const [account, setAccount] = useState("Cash");
  const [mode, setMode] = useState<"add" | "reduce">("add");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [remarks, setRemarks] = useState("");

  const currentBalance = 0;
  const newBalance = mode === "add"
    ? currentBalance + (parseFloat(amount) || 0)
    : currentBalance - (parseFloat(amount) || 0);

  return (
    <div className="cb-modal-overlay" onClick={onClose}>
      <div className="cb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cb-modal__header">
          <span className="cb-modal__title">Adjust Balance</span>
          <button className="cb-modal__close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="cb-form-group">
          <label className="cb-form-label">Adjust money in</label>
          <select className="cb-form-select" value={account} onChange={(e) => setAccount(e.target.value)}>
            <option>Cash</option>
            <option>Bank Account 1</option>
            <option>Bank Account 2</option>
          </select>
        </div>

        <div className="cb-form-group">
          <label className="cb-form-label">Add or Reduce</label>
          <div className="cb-toggle-group">
            <button className={`cb-toggle-btn add ${mode === "add" ? "active" : ""}`} onClick={() => setMode("add")}>+ Add Money</button>
            <button className={`cb-toggle-btn reduce ${mode === "reduce" ? "active" : ""}`} onClick={() => setMode("reduce")}>- Reduce Money</button>
          </div>
        </div>

        <div className="cb-form-row">
          <div>
            <label className="cb-form-label">Current Balance</label>
            <div className="cb-balance-info">₹ {currentBalance}</div>
          </div>
          <div>
            <label className="cb-form-label">Date</label>
            <input type="date" className="cb-form-input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div className="cb-form-group">
          <label className="cb-form-label" style={{ color: "#4169e1" }}>Enter Amount</label>
          <div className="cb-amount-wrapper">
            <span className="cb-amount-prefix" style={{ color: mode === "add" ? "#4169e1" : "#ef4444" }}>
              {mode === "add" ? "+ ₹" : "- ₹"}
            </span>
            <input type="number" className="cb-amount-input" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          {amount && (
            <div className="cb-new-balance">New balance: <span>₹ {newBalance}</span></div>
          )}
        </div>

        <div className="cb-form-group">
          <label className="cb-form-label">Remarks</label>
          <textarea className="cb-form-textarea" placeholder="Add a note..." value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        </div>

        <div className="cb-modal__footer">
          <button className="cb-btn cb-btn--cancel" onClick={onClose}>Cancel</button>
          <button className="cb-btn cb-btn--save" onClick={onClose}>Save</button>
        </div>
      </div>
    </div>
  );
};

// ─── Add Bank Account Modal ───────────────────────────────────────────────────
const AddBankAccountModal = ({ onClose }: { onClose: () => void }) => {
  const [accountName, setAccountName] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split("T")[0]);
  const [addBankDetails, setAddBankDetails] = useState(false);
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [reEnterBankAccountNumber, setReEnterBankAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankBranchName, setBankBranchName] = useState("");
  const [accountHoldersName, setAccountHoldersName] = useState("");
  const [upiId, setUpiId] = useState("");

  const handleSubmit = () => {
    // Validate & submit logic goes here
    onClose();
  };

  return (
    <div className="cb-modal-overlay" onClick={onClose}>
      <div
        className="cb-modal cb-modal--wide"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 540, width: "100%" }}
      >
        {/* Header */}
        <div className="cb-modal__header">
          <span className="cb-modal__title">Add Bank Account</span>
          <button className="cb-modal__close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Account Name */}
        <div className="cb-form-group">
          <label className="cb-form-label">
            Account Name <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="text"
            className="cb-form-input"
            placeholder="ex: Personal Account"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
          />
        </div>

        {/* Opening Balance + As of Date */}
        <div className="cb-form-row">
          <div style={{ flex: 1 }}>
            <label className="cb-form-label">Opening Balance</label>
            <div className="cb-amount-wrapper">
              <span className="cb-amount-prefix" style={{ color: "#666", fontWeight: 500 }}>₹</span>
              <input
                type="number"
                className="cb-amount-input"
                placeholder="ex: ₹10,000"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label className="cb-form-label">As of Date</label>
            <div className="cb-date-wrapper">
              <svg className="cb-date-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                type="date"
                className="cb-form-input cb-date-input"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Add Bank Details Toggle */}
        <div className="cb-toggle-row">
          <span className="cb-form-label" style={{ marginBottom: 0 }}>Add Bank Details</span>
          <label className="cb-switch">
            <input
              type="checkbox"
              checked={addBankDetails}
              onChange={(e) => setAddBankDetails(e.target.checked)}
            />
            <span className="cb-switch__slider" />
          </label>
        </div>

        {/* Bank Details Section */}
        {addBankDetails && (
          <div className="cb-bank-details-section">
            {/* Bank Account Number + Re-Enter */}
            <div className="cb-form-row">
              <div style={{ flex: 1 }}>
                <label className="cb-form-label">
                  Bank Account Number <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  className="cb-form-input"
                  placeholder="ex: 123456789157950"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="cb-form-label">
                  Re-Enter Bank Account Number <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  className="cb-form-input"
                  placeholder="ex: 123456789157950"
                  value={reEnterBankAccountNumber}
                  onChange={(e) => setReEnterBankAccountNumber(e.target.value)}
                />
              </div>
            </div>

            {/* IFSC Code + Bank & Branch Name */}
            <div className="cb-form-row">
              <div style={{ flex: 1 }}>
                <label className="cb-form-label">
                  IFSC Code <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  className="cb-form-input"
                  placeholder="ex: HDFC000075"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="cb-form-label">
                  Bank &amp; Branch Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  className="cb-form-input"
                  placeholder="ex: HDFC, Old Madras"
                  value={bankBranchName}
                  onChange={(e) => setBankBranchName(e.target.value)}
                />
              </div>
            </div>

            {/* Account Holders Name + UPI ID */}
            <div className="cb-form-row">
              <div style={{ flex: 1 }}>
                <label className="cb-form-label">
                  Account Holders Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  className="cb-form-input"
                  placeholder="ex: Elisa wolf"
                  value={accountHoldersName}
                  onChange={(e) => setAccountHoldersName(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="cb-form-label">UPI ID</label>
                <input
                  type="text"
                  className="cb-form-input"
                  placeholder="ex: elisa@okhdfc"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="cb-modal__footer">
          <button className="cb-btn cb-btn--cancel" onClick={onClose}>Cancel</button>
          <button className="cb-btn cb-btn--save" onClick={handleSubmit}>Submit</button>
        </div>
      </div>
    </div>
  );
};

// ─── Navbar ───────────────────────────────────────────────────────────────────
interface CashBankNavbarProps {
  title: string;
  onAddAccount?: () => void;
}

const CashBankNavbar = ({ title, onAddAccount }: CashBankNavbarProps) => {
  const [showTransfer, setShowTransfer] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);

  const handleAddAccount = () => {
    setShowAddAccount(true);
    onAddAccount?.();
  };

  return (
    <>
      <div className="cb-navbar">
        <span className="cb-navbar__title">{title}</span>
        <div className="cb-navbar__actions">
          <button className="cb-btn cb-btn--outline" onClick={() => setShowAdjust(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add/Reduce Money
          </button>

          <button className="cb-btn cb-btn--outline" onClick={() => setShowTransfer(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            Transfer Money
          </button>

          <button className="cb-btn cb-btn--primary" onClick={handleAddAccount}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
             Add New Account
          </button>
        </div>
      </div>

      {showTransfer    && <TransferModal        onClose={() => setShowTransfer(false)}    />}
      {showAdjust      && <AdjustModal          onClose={() => setShowAdjust(false)}      />}
      {showAddAccount  && <AddBankAccountModal  onClose={() => setShowAddAccount(false)}  />}
    </>
  );
};

export default CashBankNavbar;