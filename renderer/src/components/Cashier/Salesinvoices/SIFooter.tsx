import { useState } from "react";
import "./SIFooter.css";

interface Props {
  notes: string;
  termsConditions: string;
  onNotesChange: (v: string) => void;
  onTermsChange: (v: string) => void;
}

export default function SIFooter({ notes, termsConditions, onNotesChange, onTermsChange }: Props) {
  const [showNotes, setShowNotes] = useState(!!notes);
  const [showBankAccount, setShowBankAccount] = useState(false);

  return (
    <div className="si-footer">
      {/* Notes */}
      {!showNotes ? (
        <button className="si-footer-link" onClick={()=>setShowNotes(true)}>+ Add Notes</button>
      ) : (
        <div className="si-notes-section">
          <div className="si-notes-hdr">
            <span>Notes</span>
            <button className="si-section-close" onClick={()=>{setShowNotes(false);onNotesChange("");}}>✕</button>
          </div>
          <textarea
            className="si-notes-ta"
            value={notes}
            onChange={e=>onNotesChange(e.target.value)}
            placeholder="Enter your notes"
            rows={3}
          />
        </div>
      )}

      {/* Terms and Conditions */}
      <div className="si-terms-section">
        <div className="si-terms-hdr">
          <span>Terms and Conditions</span>
          <button className="si-section-close">✕</button>
        </div>
        <textarea
          className="si-terms-ta"
          value={termsConditions}
          onChange={e=>onTermsChange(e.target.value)}
          rows={4}
        />
      </div>

      {/* Add Bank Account */}
      {!showBankAccount ? (
        <button className="si-footer-link" onClick={()=>setShowBankAccount(true)}>+ Add Bank Account</button>
      ) : (
        <div className="si-bank-section">
          <div className="si-notes-hdr">
            <span>Bank Account</span>
            <button className="si-section-close" onClick={()=>setShowBankAccount(false)}>✕</button>
          </div>
          <div className="si-bank-grid">
            <div><label>Account Number</label><input className="si-bank-input" placeholder="Enter account number"/></div>
            <div><label>IFSC Code</label><input className="si-bank-input" placeholder="Enter IFSC code"/></div>
            <div><label>Bank Name</label><input className="si-bank-input" placeholder="Enter bank name"/></div>
            <div><label>Account Holder Name</label><input className="si-bank-input" placeholder="Enter name"/></div>
          </div>
        </div>
      )}
    </div>
  );
}
