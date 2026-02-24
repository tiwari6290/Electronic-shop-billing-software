import { useState } from "react";
import CashBankNavbar from "../Navbar";
import "./CashBank.css";

const CashBank = () => {
  const [activeTab, setActiveTab] = useState("Transactions");

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
            <span className="cashbank-add-bank">
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
    </div>
  );
};

export default CashBank;