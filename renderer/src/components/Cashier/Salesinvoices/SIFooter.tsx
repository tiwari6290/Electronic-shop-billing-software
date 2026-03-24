import { useState, useEffect, useCallback } from "react";
import {
  getPartyBankAccounts,
  createPartyBankAccount,
  BackendBankAccount,
} from "@/api/salesInvoiceApi";
import "./SIFooter.css";

interface Props {
  partyId?: number | null;   // pass selectedParty.id so we can scope bank accounts to the party
  notes: string;
  termsConditions: string;
  onNotesChange: (v: string) => void;
  onTermsChange: (v: string) => void;
}

interface BankAccountForm {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  branchName: string;
  upiId: string;
}

const EMPTY_FORM: BankAccountForm = {
  accountHolder: "", bankName: "", accountNumber: "",
  confirmAccountNumber: "", ifscCode: "", branchName: "", upiId: "",
};

// ── Add Bank Account Modal ────────────────────────────────────────────────────
function AddBankModal({
  partyId,
  onSaved,
  onClose,
}: {
  partyId: number;
  onSaved: (acc: BackendBankAccount) => void;
  onClose: () => void;
}) {
  const [form,   setForm]   = useState<BankAccountForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof BankAccountForm, string>>>({});
  const [saving, setSaving] = useState(false);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.accountHolder.trim()) e.accountHolder = "Required";
    if (!form.bankName.trim())      e.bankName      = "Required";
    if (!form.accountNumber.trim()) e.accountNumber = "Required";
    else if (form.confirmAccountNumber && form.confirmAccountNumber !== form.accountNumber)
      e.accountNumber = "Account numbers do not match";
    if (!form.ifscCode.trim())      e.ifscCode = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const acc = await createPartyBankAccount(partyId, {
        accountHolder: form.accountHolder.trim(),
        accountNumber: form.accountNumber.trim(),
        bankName:      form.bankName.trim(),
        ifscCode:      form.ifscCode.trim().toUpperCase(),
        branchName:    form.branchName.trim() || undefined,
        upiId:         form.upiId.trim()      || undefined,
      });
      onSaved(acc);
    } catch (err: any) {
      setErrors({ accountHolder: err.message ?? "Failed to save bank account" });
    } finally {
      setSaving(false);
    }
  }

  function field(key: keyof BankAccountForm) {
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
                className={`si-inp si-inp--full${errors.accountHolder ? " si-inp--err" : ""}`}
                value={form.accountHolder}
                onChange={field("accountHolder")}
                placeholder="e.g. Mondal Electronic"
              />
              {errors.accountHolder && <span className="si-errmsg">{errors.accountHolder}</span>}
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
                className={`si-inp si-inp--full${errors.accountNumber ? " si-inp--err" : ""}`}
                value={form.accountNumber}
                onChange={field("accountNumber")}
                placeholder="Enter account number"
                type="password"
              />
              {errors.accountNumber && <span className="si-errmsg">{errors.accountNumber}</span>}
            </div>
            <div className="si-bank-form-field">
              <label>Confirm Account Number</label>
              <input
                className="si-inp si-inp--full"
                value={form.confirmAccountNumber}
                onChange={field("confirmAccountNumber")}
                placeholder="Re-enter account number"
              />
            </div>
            <div className="si-bank-form-field">
              <label>IFSC Code <span className="si-req">*</span></label>
              <input
                className={`si-inp si-inp--full${errors.ifscCode ? " si-inp--err" : ""}`}
                value={form.ifscCode}
                onChange={field("ifscCode")}
                placeholder="e.g. SBIN0001234"
              />
              {errors.ifscCode && <span className="si-errmsg">{errors.ifscCode}</span>}
            </div>
            <div className="si-bank-form-field">
              <label>Branch Name</label>
              <input
                className="si-inp si-inp--full"
                value={form.branchName}
                onChange={field("branchName")}
                placeholder="e.g. Howrah Main Branch"
              />
            </div>
            <div className="si-bank-form-field si-bank-form-field--full">
              <label>UPI ID (Optional)</label>
              <input
                className="si-inp si-inp--full"
                value={form.upiId}
                onChange={field("upiId")}
                placeholder="e.g. name@upi"
              />
            </div>
          </div>
        </div>
        <div className="si-cmodal-ftr">
          <button className="si-btn-cancel" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="si-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Select Bank Account Modal ─────────────────────────────────────────────────
function SelectBankModal({
  partyId,
  accounts,
  selectedId,
  onSelect,
  onAddNew,
  onClose,
}: {
  partyId: number;
  accounts: BackendBankAccount[];
  selectedId?: number;
  onSelect: (acc: BackendBankAccount) => void;
  onAddNew: () => void;
  onClose: () => void;
}) {
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
            >
              <div className="si-bank-list-info">
                <div className="si-bank-list-name">{acc.accountHolder}</div>
                <div className="si-bank-list-meta">
                  {acc.bankName} · {acc.accountNumber.replace(/.(?=.{4})/g, "•")}
                </div>
                <div className="si-bank-list-meta">
                  IFSC: {acc.ifscCode}{acc.branchName ? ` · ${acc.branchName}` : ""}
                </div>
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
export default function SIFooter({
  partyId,
  notes,
  termsConditions,
  onNotesChange,
  onTermsChange,
}: Props) {
  const [showNotes,       setShowNotes]       = useState(!!notes);
  const [showBankSection, setShowBankSection] = useState(false);
  const [showAddBank,     setShowAddBank]     = useState(false);
  const [showSelectBank,  setShowSelectBank]  = useState(false);
  const [bankAccounts,    setBankAccounts]    = useState<BackendBankAccount[]>([]);
  const [selectedBank,    setSelectedBank]    = useState<BackendBankAccount | null>(null);
  const [loadingBanks,    setLoadingBanks]    = useState(false);

  const loadBankAccounts = useCallback(async () => {
    if (!partyId) return;
    setLoadingBanks(true);
    try {
      const accounts = await getPartyBankAccounts(partyId);
      setBankAccounts(accounts);
    } catch (err) {
      console.error("Failed to load bank accounts", err);
    } finally {
      setLoadingBanks(false);
    }
  }, [partyId]);

  // Reset bank section whenever party changes
  useEffect(() => {
    setSelectedBank(null);
    setShowBankSection(false);
    setBankAccounts([]);
  }, [partyId]);

  function handleBankSaved(acc: BackendBankAccount) {
    setBankAccounts(prev => [...prev, acc]);
    setSelectedBank(acc);
    setShowAddBank(false);
    setShowSelectBank(false);
    setShowBankSection(true);
  }

  async function handleShowBankSection() {
    await loadBankAccounts();
    setShowBankSection(true);
    if (bankAccounts.length === 0) {
      setShowAddBank(true);
    } else {
      setShowSelectBank(true);
    }
  }

  async function handleOpenSelectBank() {
    await loadBankAccounts();
    setShowSelectBank(true);
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
          onClick={handleShowBankSection}
          disabled={!partyId}
          title={!partyId ? "Select a party first" : undefined}
        >
          + Add Bank Account
        </button>
      ) : (
        <div className="si-bank-section">
          <div className="si-notes-hdr">
            <span>Bank Account</span>
            <button className="si-section-close" onClick={() => { setShowBankSection(false); setSelectedBank(null); }}>✕</button>
          </div>

          {loadingBanks ? (
            <div style={{ fontSize: 13, color: "#6b7280", padding: "8px 0" }}>Loading…</div>
          ) : selectedBank ? (
            <div className="si-bank-card">
              <div className="si-bank-card-info">
                <div className="si-bank-card-name">{selectedBank.accountHolder}</div>
                <div className="si-bank-card-meta">{selectedBank.bankName}</div>
                <div className="si-bank-card-meta">
                  Acc: {selectedBank.accountNumber.replace(/.(?=.{4})/g, "•")} · IFSC: {selectedBank.ifscCode}
                </div>
                {selectedBank.branchName && (
                  <div className="si-bank-card-meta">Branch: {selectedBank.branchName}</div>
                )}
              </div>
              <button className="si-bank-change-btn" onClick={handleOpenSelectBank}>
                Change
              </button>
            </div>
          ) : (
            <button className="si-bank-add-placeholder" onClick={handleOpenSelectBank}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <rect x="3" y="10" width="18" height="11" rx="2"/>
                <path d="M7 10V7a5 5 0 0 1 10 0v3"/>
              </svg>
              Select a bank account to display on invoice
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {showAddBank && partyId && (
        <AddBankModal
          partyId={partyId}
          onSaved={handleBankSaved}
          onClose={() => {
            setShowAddBank(false);
            if (!selectedBank) setShowBankSection(false);
          }}
        />
      )}

      {showSelectBank && partyId && (
        <SelectBankModal
          partyId={partyId}
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