import React, { useState } from "react";
import { BankAccount, SAMPLE_BANK_ACCOUNTS } from "./Types";
import "./Bankmodals.css";

// ── Inline SVG Icons ──────────────────────────────────────────────────────────
const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ── Add Bank Account ──────────────────────────────────────────────────────────
interface AddBankProps {
  onSubmit: (acc: Omit<BankAccount, "id">) => void;
  onClose: () => void;
}
export const AddBankAccountModal: React.FC<AddBankProps> = ({ onSubmit, onClose }) => {
  const [form, setForm] = useState({ accountNumber:"", reEnter:"", ifsc:"", bankName:"", holderName:"", upiId:"" });
  const valid = form.accountNumber.trim() !== "" && form.accountNumber === form.reEnter;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="bm-overlay" onClick={onClose}>
      <div className="bm-modal" onClick={e => e.stopPropagation()}>
        <div className="bm-header">
          <h2>Add Bank Account</h2>
          <button className="bm-close" onClick={onClose}><IconClose /></button>
        </div>
        <div className="bm-body">
          <div className="bm-grid">
            <div className="bm-field">
              <label>Bank Account Number <span className="bm-req">*</span></label>
              <input placeholder="ex: 123456789" value={form.accountNumber} onChange={set("accountNumber")} />
            </div>
            <div className="bm-field">
              <label>Re-Enter Bank Account Number <span className="bm-req">*</span></label>
              <input placeholder="ex: 123456789" value={form.reEnter} onChange={set("reEnter")} />
            </div>
            <div className="bm-field">
              <label>IFSC Code</label>
              <input placeholder="ex: ICIC0001234" value={form.ifsc} onChange={set("ifsc")} />
            </div>
            <div className="bm-field">
              <label>Bank &amp; Branch Name</label>
              <input placeholder="ex: ICICI Bank, Mumbai" value={form.bankName} onChange={set("bankName")} />
            </div>
            <div className="bm-field">
              <label>Account Holder's Name</label>
              <input placeholder="ex: Babu Lal" value={form.holderName} onChange={set("holderName")} />
            </div>
            <div className="bm-field">
              <label>UPI ID</label>
              <input placeholder="ex: babulal@upi" value={form.upiId} onChange={set("upiId")} />
            </div>
          </div>
        </div>
        <div className="bm-footer">
          <button className="bm-cancel" onClick={onClose}>Cancel</button>
          <button
            className={`bm-submit${!valid ? " disabled" : ""}`}
            disabled={!valid}
            onClick={() => valid && onSubmit({ accountNumber: form.accountNumber, ifsc: form.ifsc, bankName: form.bankName, holderName: form.holderName, upiId: form.upiId })}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Select Bank Account ───────────────────────────────────────────────────────
interface SelectBankProps {
  accounts: BankAccount[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onDone: () => void;
  onClose: () => void;
}
export const SelectBankAccountModal: React.FC<SelectBankProps> = ({ accounts, selectedId, onSelect, onDone, onClose }) => {
  const [sel, setSel] = useState<number | null>(selectedId);

  return (
    <div className="bm-overlay" onClick={onClose}>
      <div className="bm-modal bm-select-modal" onClick={e => e.stopPropagation()}>
        <div className="bm-header">
          <h2>Select Bank Accounts</h2>
          <button className="bm-close" onClick={onClose}><IconClose /></button>
        </div>
        <div className="bm-body">
          {accounts.map(acc => (
            <div
              key={acc.id}
              className={`bm-account-row${sel === acc.id ? " selected" : ""}`}
              onClick={() => setSel(acc.id)}
            >
              <div className="bm-acc-icon">
                <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="6" fill="#e8f0fe"/>
                  <path d="M8 20h24M20 8v24" stroke="#d93025" strokeWidth="3"/>
                  <rect x="8" y="8" width="10" height="10" fill="#4285f4" rx="1"/>
                  <rect x="22" y="22" width="10" height="10" fill="#34a853" rx="1"/>
                </svg>
              </div>
              <div className="bm-acc-info">
                <div className="bm-acc-name">{acc.holderName || acc.bankName}</div>
                <div className="bm-acc-number">ACC No: {acc.accountNumber}</div>
              </div>
              <div className="bm-acc-right">
                {acc.balance != null && <div className="bm-acc-balance">₹{acc.balance.toLocaleString("en-IN")}</div>}
                <div className="bm-acc-ifsc">IFSC: {acc.ifsc}</div>
              </div>
              <div className={`bm-radio${sel === acc.id ? " checked" : ""}`} />
            </div>
          ))}
        </div>
        <div className="bm-footer bm-footer-center">
          <button className="bm-done" onClick={() => { if (sel != null) onSelect(sel); onDone(); }}>DONE</button>
        </div>
      </div>
    </div>
  );
};