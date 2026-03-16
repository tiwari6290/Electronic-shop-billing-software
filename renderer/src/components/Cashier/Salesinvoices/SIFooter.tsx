import { useState, useRef, useEffect } from "react";
import "./SIFooter.css";

interface BankAccount {
  id: number;
  accountName: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  branch: string;
  upi: string;
}

interface Props {
  notes: string;
  termsConditions: string;
  onNotesChange: (v: string) => void;
  onTermsChange: (v: string) => void;
}

const EMPTY_BANK: Omit<BankAccount, "id"> = {
  accountName: "", bankName: "", accountNo: "", ifsc: "", branch: "", upi: "",
};

function loadBankAccounts(): BankAccount[] {
  try { return JSON.parse(localStorage.getItem("bankAccounts") || "[]"); }
  catch { return []; }
}
function saveBankAccounts(accs: BankAccount[]) {
  localStorage.setItem("bankAccounts", JSON.stringify(accs));
}

// ── Add Bank Account Modal ────────────────────────────────────────────────────
function AddBankModal({
  onSaved,
  onClose,
}: {
  onSaved: (acc: BankAccount) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<BankAccount, "id">>(EMPTY_BANK);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY_BANK, string>>>({});
  const [confirmNo, setConfirmNo] = useState("");

  function validate() {
    const e: typeof errors = {};
    if (!form.accountName.trim()) e.accountName = "Required";
    if (!form.bankName.trim()) e.bankName = "Required";
    if (!form.accountNo.trim()) e.accountNo = "Required";
    else if (confirmNo && confirmNo !== form.accountNo) e.accountNo = "Account numbers do not match";
    if (!form.ifsc.trim()) e.ifsc = "Required";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const all = loadBankAccounts();
    const newAcc: BankAccount = { ...form, id: Date.now() };
    const updated = [...all, newAcc];
    saveBankAccounts(updated);
    onSaved(newAcc);
  }

  function field(key: keyof typeof EMPTY_BANK) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(f => ({ ...f, [key]: e.target.value }));
      if (errors[key]) setErrors(er => ({ ...er, [key]: undefined }));
    };
  }

  return (
    <div className="si-overlay" onClick={onClose}>
      <div className="si-cmodal si-cmodal--sm" onClick={e => e.stopPropagation()}>
        <div className="si-cmodal-hdr">
          <span>Add Bank Account</span>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="si-cmodal-body">
          <div className="si-bank-form-grid">
            <div className="si-bank-form-field">
              <label>Account Holder Name <span className="si-req">*</span></label>
              <input
                className={`si-inp si-inp--full${errors.accountName ? " si-inp--err" : ""}`}
                value={form.accountName}
                onChange={field("accountName")}
                placeholder="e.g. Mondal Electronic"
              />
              {errors.accountName && <span className="si-errmsg">{errors.accountName}</span>}
            </div>
            <div className="si-bank-form-field">
              <label>Bank Name <span className="si-req">*</span></label>
              <input
                className={`si-inp si-inp--full${errors.bankName ? " si-inp--err" : ""}`}
                value={form.bankName}
                onChange={field("bankName")}
                placeholder="e.g. State Bank of India"
              />
              {errors.bankName && <span className="si-errmsg">{errors.bankName}</span>}
            </div>
            <div className="si-bank-form-field">
              <label>Account Number <span className="si-req">*</span></label>
              <input
                className={`si-inp si-inp--full${errors.accountNo ? " si-inp--err" : ""}`}
                value={form.accountNo}
                onChange={field("accountNo")}
                placeholder="Enter account number"
                type="password"
              />
              {errors.accountNo && <span className="si-errmsg">{errors.accountNo}</span>}
            </div>
            <div className="si-bank-form-field">
              <label>Confirm Account Number</label>
              <input
                className="si-inp si-inp--full"
                value={confirmNo}
                onChange={e => setConfirmNo(e.target.value)}
                placeholder="Re-enter account number"
              />
            </div>
            <div className="si-bank-form-field">
              <label>IFSC Code <span className="si-req">*</span></label>
              <input
                className={`si-inp si-inp--full${errors.ifsc ? " si-inp--err" : ""}`}
                value={form.ifsc}
                onChange={field("ifsc")}
                placeholder="e.g. SBIN0001234"
              />
              {errors.ifsc && <span className="si-errmsg">{errors.ifsc}</span>}
            </div>
            <div className="si-bank-form-field">
              <label>Branch Name</label>
              <input
                className="si-inp si-inp--full"
                value={form.branch}
                onChange={field("branch")}
                placeholder="e.g. Howrah Main Branch"
              />
            </div>
            <div className="si-bank-form-field si-bank-form-field--full">
              <label>UPI ID (Optional)</label>
              <input
                className="si-inp si-inp--full"
                value={form.upi}
                onChange={field("upi")}
                placeholder="e.g. name@upi"
              />
            </div>
          </div>
        </div>
        <div className="si-cmodal-ftr">
          <button className="si-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="si-btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Select Bank Account Modal ─────────────────────────────────────────────────
function SelectBankModal({
  accounts,
  selectedId,
  onSelect,
  onAddNew,
  onClose,
}: {
  accounts: BankAccount[];
  selectedId?: number;
  onSelect: (acc: BankAccount) => void;
  onAddNew: () => void;
  onClose: () => void;
}) {
  const [hoverId, setHoverId] = useState<number | undefined>();

  return (
    <div className="si-overlay" onClick={onClose}>
      <div className="si-cmodal si-cmodal--sm" onClick={e => e.stopPropagation()}>
        <div className="si-cmodal-hdr">
          <span>Select Bank Account</span>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="si-bank-list">
          {accounts.length === 0 ? (
            <div className="si-bank-list-empty">No bank accounts saved yet.</div>
          ) : accounts.map(acc => (
            <button
              key={acc.id}
              className={`si-bank-list-row${selectedId === acc.id ? " si-bank-list-row--sel" : ""}`}
              onClick={() => onSelect(acc)}
              onMouseEnter={() => setHoverId(acc.id)}
              onMouseLeave={() => setHoverId(undefined)}
            >
              <div className="si-bank-list-info">
                <div className="si-bank-list-name">{acc.accountName}</div>
                <div className="si-bank-list-meta">{acc.bankName} · {acc.accountNo.replace(/.(?=.{4})/g, "•")}</div>
                <div className="si-bank-list-meta">IFSC: {acc.ifsc}{acc.branch ? ` · ${acc.branch}` : ""}</div>
              </div>
              <svg viewBox="0 0 24 24" width="18" height="18">
                <circle cx="12" cy="12" r="10" fill="none" stroke={selectedId === acc.id ? "#6366f1" : "#d1d5db"} strokeWidth="2"/>
                {selectedId === acc.id && <circle cx="12" cy="12" r="5" fill="#6366f1"/>}
              </svg>
            </button>
          ))}
        </div>
        <div className="si-ship-add-link" style={{ borderTop: "1.5px dashed #93c5fd" }}>
          <button onClick={onAddNew}>+ Add Bank Account</button>
        </div>
        <div className="si-cmodal-ftr">
          <button className="si-btn-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Main SIFooter ─────────────────────────────────────────────────────────────
export default function SIFooter({ notes, termsConditions, onNotesChange, onTermsChange }: Props) {
  const [showNotes, setShowNotes] = useState(!!notes);
  const [showBankSection, setShowBankSection] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const [showSelectBank, setShowSelectBank] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(loadBankAccounts);
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);

  function handleBankSaved(acc: BankAccount) {
    const updated = loadBankAccounts(); // re-read after save
    setBankAccounts(updated);
    setSelectedBank(acc);
    setShowAddBank(false);
    setShowSelectBank(false);
    setShowBankSection(true);
  }

  return (
    <div className="si-footer">
      {/* Notes */}
      {!showNotes ? (
        <button className="si-footer-link" onClick={() => setShowNotes(true)}>+ Add Notes</button>
      ) : (
        <div className="si-notes-section">
          <div className="si-notes-hdr">
            <span>Notes</span>
            <button className="si-section-close" onClick={() => { setShowNotes(false); onNotesChange(""); }}>✕</button>
          </div>
          <textarea
            className="si-notes-ta"
            value={notes}
            onChange={e => onNotesChange(e.target.value)}
            placeholder="Enter your notes"
            rows={3}
          />
        </div>
      )}

      {/* Terms and Conditions */}
      <div className="si-terms-section">
        <div className="si-terms-hdr">
          <span>Terms and Conditions</span>
        </div>
        <textarea
          className="si-terms-ta"
          value={termsConditions}
          onChange={e => onTermsChange(e.target.value)}
          rows={4}
        />
      </div>

      {/* Bank Account */}
      {!showBankSection ? (
        <button
          className="si-footer-link"
          onClick={() => {
            const accounts = loadBankAccounts();
            setBankAccounts(accounts);
            if (accounts.length === 0) {
              setShowAddBank(true);
            } else {
              setShowSelectBank(true);
            }
            setShowBankSection(true);
          }}
        >
          + Add Bank Account
        </button>
      ) : (
        <div className="si-bank-section">
          <div className="si-notes-hdr">
            <span>Bank Account</span>
            <button className="si-section-close" onClick={() => { setShowBankSection(false); setSelectedBank(null); }}>✕</button>
          </div>

          {selectedBank ? (
            /* ── Selected bank card ── */
            <div className="si-bank-card">
              <div className="si-bank-card-info">
                <div className="si-bank-card-name">{selectedBank.accountName}</div>
                <div className="si-bank-card-meta">{selectedBank.bankName}</div>
                <div className="si-bank-card-meta">
                  Acc: {selectedBank.accountNo.replace(/.(?=.{4})/g, "•")} · IFSC: {selectedBank.ifsc}
                </div>
                {selectedBank.branch && <div className="si-bank-card-meta">Branch: {selectedBank.branch}</div>}
              </div>
              <button
                className="si-bank-change-btn"
                onClick={() => { setBankAccounts(loadBankAccounts()); setShowSelectBank(true); }}
              >
                Change
              </button>
            </div>
          ) : (
            /* ── No bank selected yet ── */
            <button
              className="si-bank-add-placeholder"
              onClick={() => { setBankAccounts(loadBankAccounts()); setShowSelectBank(true); }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><rect x="3" y="10" width="18" height="11" rx="2"/><path d="M7 10V7a5 5 0 0 1 10 0v3"/></svg>
              Select a bank account to display on invoice
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {showAddBank && (
        <AddBankModal
          onSaved={handleBankSaved}
          onClose={() => { setShowAddBank(false); if (!selectedBank) setShowBankSection(false); }}
        />
      )}
      {showSelectBank && (
        <SelectBankModal
          accounts={bankAccounts}
          selectedId={selectedBank?.id}
          onSelect={acc => { setSelectedBank(acc); setShowSelectBank(false); }}
          onAddNew={() => { setShowSelectBank(false); setShowAddBank(true); }}
          onClose={() => setShowSelectBank(false)}
        />
      )}
    </div>
  );
}