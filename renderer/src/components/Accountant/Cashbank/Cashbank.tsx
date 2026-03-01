import { useState } from "react";
import CashBankNavbar from "../Navbar";
import "./Cashbank.css";

// ─── Add Bank Account Modal ───────────────────────────────────────────────────
const AddBankModal = ({ onClose }: { onClose: () => void }) => {
  const [accountName, setAccountName] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split("T")[0]);
  const [addBankDetails, setAddBankDetails] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [reAccountNumber, setReAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [branchName, setBranchName] = useState("");
  const [holderName, setHolderName] = useState("");
  const [upiId, setUpiId] = useState("");

  return (
    <div className="cb-modal-overlay" onClick={onClose}>
      <div className="cb-modal" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cb-modal__header">
          <span className="cb-modal__title">Add Bank Account</span>
          <button className="cb-modal__close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Account Name */}
          <div className="cb-form-group" style={{ marginBottom: 0 }}>
            <label className="cb-form-label">Account Name <span style={{ color: "#ef4444" }}>*</span></label>
            <input className="cb-form-input" placeholder="ex: Personal Account" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
          </div>

          {/* Opening Balance + As of Date */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="cb-form-group" style={{ marginBottom: 0 }}>
              <label className="cb-form-label">Opening Balance</label>
              <div className="cb-amount-wrapper">
                <span className="cb-amount-prefix">₹</span>
                <input type="number" className="cb-amount-input" placeholder="ex: ₹10,000" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} />
              </div>
            </div>
            <div className="cb-form-group" style={{ marginBottom: 0 }}>
              <label className="cb-form-label">As of Date</label>
              <input type="date" className="cb-form-input" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} />
            </div>
          </div>

          {/* Add Bank Details Toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#212529" }}>Add Bank Details</span>
            <div
              onClick={() => setAddBankDetails(!addBankDetails)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: addBankDetails ? "#4169e1" : "#dee2e6",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.2s",
              }}
            >
              <div style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#fff",
                position: "absolute",
                top: 3,
                left: addBankDetails ? 23 : 3,
                transition: "left 0.2s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              }} />
            </div>
          </div>

          {/* Bank Details Fields (shown when toggle ON) */}
          {addBankDetails && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="cb-form-group" style={{ marginBottom: 0 }}>
                  <label className="cb-form-label">Bank Account Number <span style={{ color: "#ef4444" }}>*</span></label>
                  <input className="cb-form-input" placeholder="ex: 123456789157950" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                </div>
                <div className="cb-form-group" style={{ marginBottom: 0 }}>
                  <label className="cb-form-label">Re-Enter Bank Account Number <span style={{ color: "#ef4444" }}>*</span></label>
                  <input className="cb-form-input" placeholder="ex: 123456789157950" value={reAccountNumber} onChange={(e) => setReAccountNumber(e.target.value)} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="cb-form-group" style={{ marginBottom: 0 }}>
                  <label className="cb-form-label">IFSC Code <span style={{ color: "#ef4444" }}>*</span></label>
                  <input className="cb-form-input" placeholder="ex: HDFC000075" value={ifsc} onChange={(e) => setIfsc(e.target.value)} />
                </div>
                <div className="cb-form-group" style={{ marginBottom: 0 }}>
                  <label className="cb-form-label">Bank & Branch Name <span style={{ color: "#ef4444" }}>*</span></label>
                  <input className="cb-form-input" placeholder="ex: HDFC, Old Madras" value={branchName} onChange={(e) => setBranchName(e.target.value)} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="cb-form-group" style={{ marginBottom: 0 }}>
                  <label className="cb-form-label">Account Holders Name <span style={{ color: "#ef4444" }}>*</span></label>
                  <input className="cb-form-input" placeholder="ex: Elisa wolf" value={holderName} onChange={(e) => setHolderName(e.target.value)} />
                </div>
                <div className="cb-form-group" style={{ marginBottom: 0 }}>
                  <label className="cb-form-label">UPI ID</label>
                  <input className="cb-form-input" placeholder="ex: elisa@okhdfc" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="cb-modal__footer">
          <button className="cb-btn cb-btn--cancel" onClick={onClose}>Cancel</button>
          <button className="cb-btn cb-btn--save" onClick={onClose}>Submit</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const CashBank = () => {
  const [activeTab, setActiveTab] = useState("Transactions");
  const [showAddBank, setShowAddBank] = useState(false);

  return (
    <div className="cashbank-page">
      <CashBankNavbar title="Cash and Bank" />

      <div className="cashbank-body">
        {/* Left Panel */}
        <div className="cashbank-left">
          <div className="cashbank-total">
            <span className="cashbank-total__label">Total Balance:</span>
            <span className="cashbank-total__amount">₹0</span>
          </div>

          <div className="cashbank-section-title">Cash</div>
          <div className="cashbank-row">
            <span className="cashbank-row__label">Cash in hand</span>
            <span className="cashbank-row__amount">₹0</span>
          </div>

          <div className="cashbank-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: 20 }}>
            <span>Bank Accounts</span>
            <span className="cashbank-add-bank" onClick={() => setShowAddBank(true)} style={{ cursor: "pointer" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add New Bank
            </span>
          </div>

          <div className="cashbank-row">
            <div className="cashbank-unlinked">
              <div className="cashbank-unlinked-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <span className="cashbank-row__label">Unlinked Transactions</span>
            </div>
            <span className="cashbank-row__amount">₹0</span>
          </div>
        </div>

        {/* Right Panel */}
        <div className="cashbank-right">
          <div className="cashbank-tabs">
            {["Transactions"].map((tab) => (
              <div
                key={tab}
                className={`cashbank-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </div>
            ))}
          </div>

          <div className="cashbank-filter-row">
            <div className="cashbank-date-filter">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Last 30 Days
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <div className="cashbank-empty">
            <svg className="cashbank-empty__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
              <line x1="6" y1="15" x2="10" y2="15" />
            </svg>
            <div className="cashbank-empty__text">No Transactions</div>
            <div className="cashbank-empty__sub">You don't have any transaction in selected period</div>
          </div>
        </div>
      </div>

      {showAddBank && <AddBankModal onClose={() => setShowAddBank(false)} />}
    </div>
  );
};

export default CashBank;