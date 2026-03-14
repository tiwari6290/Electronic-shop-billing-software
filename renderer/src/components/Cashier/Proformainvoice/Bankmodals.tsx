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
    <div className="aa-bm-overlay" onClick={onClose}>
      <div className="aa-bm-modal" onClick={e => e.stopPropagation()}>
        <div className="aa-bm-header">
          <h2>Add Bank Account</h2>
          <button className="aa-bm-close" onClick={onClose}><IconClose /></button>
        </div>
        <div className="aa-bm-body">
          <div className="aa-bm-grid">
            <div className="aa-bm-field">
              <label>Bank Account Number <span className="aa-bm-req">*</span></label>
              <input placeholder="ex: 123456789" value={form.accountNumber} onChange={set("accountNumber")} />
            </div>
            <div className="aa-bm-field">
              <label>Re-Enter Bank Account Number <span className="aa-bm-req">*</span></label>
              <input placeholder="ex: 123456789" value={form.reEnter} onChange={set("reEnter")} />
            </div>
            <div className="aa-bm-field">
              <label>IFSC Code</label>
              <input placeholder="ex: ICIC0001234" value={form.ifsc} onChange={set("ifsc")} />
            </div>
            <div className="aa-bm-field">
              <label>Bank &amp; Branch Name</label>
              <input placeholder="ex: ICICI Bank, Mumbai" value={form.bankName} onChange={set("bankName")} />
            </div>
            <div className="aa-bm-field">
              <label>Account Holder's Name</label>
              <input placeholder="ex: Babu Lal" value={form.holderName} onChange={set("holderName")} />
            </div>
            <div className="aa-bm-field">
              <label>UPI ID</label>
              <input placeholder="ex: babulal@upi" value={form.upiId} onChange={set("upiId")} />
            </div>
          </div>
        </div>
        <div className="aa-bm-footer">
          <button className="aa-bm-cancel" onClick={onClose}>Cancel</button>
          <button
            className={`aa-bm-submit${!valid ? " disabled" : ""}`}
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
    <div className="aa-bm-overlay" onClick={onClose}>
      <div className="aa-bm-modal bm-select-modal" onClick={e => e.stopPropagation()}>
        <div className="aa-bm-header">
          <h2>Select Bank Accounts</h2>
          <button className="aa-bm-close" onClick={onClose}><IconClose /></button>
        </div>
        <div className="aa-bm-body">
          {accounts.map(acc => (
            <div
              key={acc.id}
              className={`aa-bm-account-row${sel === acc.id ? " selected" : ""}`}
              onClick={() => setSel(acc.id)}
            >
              <div className="aa-bm-acc-icon">
                <div className="aa-bm-bank-icon-wrap">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="22" x2="21" y2="22"/>
                    <line x1="6" y1="18" x2="6" y2="11"/>
                    <line x1="10" y1="18" x2="10" y2="11"/>
                    <line x1="14" y1="18" x2="14" y2="11"/>
                    <line x1="18" y1="18" x2="18" y2="11"/>
                    <polygon points="12 2 20 7 4 7"/>
                  </svg>
                </div>
              </div>
              <div className="aa-bm-acc-info">
                <div className="aa-bm-acc-name">{acc.holderName || acc.bankName}</div>
                <div className="aa-bm-acc-number">ACC No: {acc.accountNumber}</div>
              </div>
              <div className="aa-bm-acc-right">
                {acc.balance != null && <div className="aa-bm-acc-balance">₹{acc.balance.toLocaleString("en-IN")}</div>}
                <div className="aa-bm-acc-ifsc">IFSC: {acc.ifsc}</div>
              </div>
              <div className={`aa-bm-radio${sel === acc.id ? " checked" : ""}`} />
            </div>
          ))}
        </div>
        <div className="aa-bm-footer bm-footer-center">
          <button className="aa-bm-done" onClick={() => { if (sel != null) onSelect(sel); onDone(); }}>DONE</button>
        </div>
      </div>
    </div>
  );
};