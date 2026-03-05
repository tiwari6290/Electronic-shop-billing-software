import { useState } from "react";
import "./QuotationFooter.css";

interface AddBankAccountData {
  accountName: string;
  openingBalance: string;
  asOfDate: string;
  addBankDetails: boolean;
  accountNumber: string;
  reEnterAccountNumber: string;
  ifscCode: string;
  bankBranchName: string;
  accountHolderName: string;
  upiId: string;
}

interface QuotationFooterProps {
  notes: string;
  termsConditions: string;
  onNotesChange: (v: string) => void;
  onTermsChange: (v: string) => void;
}

export default function QuotationFooter({
  notes,
  termsConditions,
  onNotesChange,
  onTermsChange,
}: QuotationFooterProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankData, setBankData] = useState<AddBankAccountData>({
    accountName: "",
    openingBalance: "",
    asOfDate: new Date().toISOString().split("T")[0],
    addBankDetails: true,
    accountNumber: "",
    reEnterAccountNumber: "",
    ifscCode: "",
    bankBranchName: "",
    accountHolderName: "",
    upiId: "",
  });

  return (
    <>
      <div className="qf-wrap">
        {/* Notes */}
        {!showNotes ? (
          <button className="qf-add-link" onClick={() => setShowNotes(true)}>
            + Add Notes
          </button>
        ) : (
          <div className="qf-section">
            <div className="qf-section-header">
              <span className="qf-section-title">Notes</span>
              <button className="qf-section-close" onClick={() => setShowNotes(false)}>⊗</button>
            </div>
            <div className="qf-notes-wrap">
              <textarea
                className="qf-notes-input"
                placeholder="Enter your notes"
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Terms & Conditions */}
        <div className="qf-section">
          <div className="qf-section-header">
            <span className="qf-section-title">Terms and Conditions</span>
            <button className="qf-section-close">⊗</button>
          </div>
          <div className="qf-terms-box">
            <textarea
              className="qf-terms-input"
              value={termsConditions}
              onChange={(e) => onTermsChange(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        {/* Add New Account */}
        <button
          className="qf-add-link qf-add-link--spaced"
          onClick={() => setShowBankModal(true)}
        >
          + Add New Account
        </button>
      </div>

      {/* Add Bank Account Modal */}
      {showBankModal && (
        <div className="qf-overlay" onClick={() => setShowBankModal(false)}>
          <div className="qf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="qf-modal-header">
              <h2 className="qf-modal-title">Add Bank Account</h2>
              <button className="qf-modal-close" onClick={() => setShowBankModal(false)}>✕</button>
            </div>
            <div className="qf-modal-body">
              {/* Account Name */}
              <div className="qf-field">
                <label className="qf-label">Account Name*</label>
                <input
                  className="qf-input"
                  placeholder="ex: Personal Account"
                  value={bankData.accountName}
                  onChange={(e) => setBankData({ ...bankData, accountName: e.target.value })}
                />
              </div>

              {/* Opening Balance + As of Date */}
              <div className="qf-grid-2">
                <div className="qf-field">
                  <label className="qf-label">Opening Balance</label>
                  <div className="qf-amount-row">
                    <span className="qf-rs">₹</span>
                    <input
                      className="qf-input qf-input--amount"
                      placeholder="ex: ₹10,000"
                      type="number"
                      value={bankData.openingBalance}
                      onChange={(e) => setBankData({ ...bankData, openingBalance: e.target.value })}
                    />
                  </div>
                </div>
                <div className="qf-field">
                  <label className="qf-label">As of Date</label>
                  <input
                    className="qf-input"
                    type="date"
                    value={bankData.asOfDate}
                    onChange={(e) => setBankData({ ...bankData, asOfDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Toggle Add Bank Details */}
              <div className="qf-toggle-row">
                <span className="qf-toggle-label">Add Bank Details</span>
                <button
                  className={`qf-toggle ${bankData.addBankDetails ? "qf-toggle--on" : ""}`}
                  onClick={() => setBankData({ ...bankData, addBankDetails: !bankData.addBankDetails })}
                >
                  <span className="qf-toggle-thumb" />
                </button>
              </div>

              {bankData.addBankDetails && (
                <>
                  <div className="qf-grid-2">
                    <div className="qf-field">
                      <label className="qf-label">Bank Account Number*</label>
                      <input className="qf-input" placeholder="ex: 123456789157950"
                        value={bankData.accountNumber}
                        onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })} />
                    </div>
                    <div className="qf-field">
                      <label className="qf-label">Re-Enter Bank Account Number*</label>
                      <input className="qf-input" placeholder="ex: 123456789157950"
                        value={bankData.reEnterAccountNumber}
                        onChange={(e) => setBankData({ ...bankData, reEnterAccountNumber: e.target.value })} />
                    </div>
                  </div>
                  <div className="qf-grid-2">
                    <div className="qf-field">
                      <label className="qf-label">IFSC Code*</label>
                      <input className="qf-input" placeholder="ex: HDFC000075"
                        value={bankData.ifscCode}
                        onChange={(e) => setBankData({ ...bankData, ifscCode: e.target.value })} />
                    </div>
                    <div className="qf-field">
                      <label className="qf-label">Bank & Branch Name*</label>
                      <input className="qf-input" placeholder="ex: HDFC, Old Madras"
                        value={bankData.bankBranchName}
                        onChange={(e) => setBankData({ ...bankData, bankBranchName: e.target.value })} />
                    </div>
                  </div>
                  <div className="qf-grid-2">
                    <div className="qf-field">
                      <label className="qf-label">Account Holders Name*</label>
                      <input className="qf-input" placeholder="ex: Elisa wolf"
                        value={bankData.accountHolderName}
                        onChange={(e) => setBankData({ ...bankData, accountHolderName: e.target.value })} />
                    </div>
                    <div className="qf-field">
                      <label className="qf-label">UPI ID</label>
                      <input className="qf-input" placeholder="ex: elisa@okhdfc"
                        value={bankData.upiId}
                        onChange={(e) => setBankData({ ...bankData, upiId: e.target.value })} />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="qf-modal-footer">
              <button className="qf-btn-cancel" onClick={() => setShowBankModal(false)}>Cancel</button>
              <button
                className="qf-btn-submit"
                onClick={() => {
                  alert("Bank account added!");
                  setShowBankModal(false);
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}