import { useState, useRef, useEffect } from "react";
import "./OnlineOrders.css";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Order {
  date: string;
  quotationNumber: string;
  partyName: string;
  amount: number;
  status: "Pending" | "Accepted" | "Rejected" | "Delivered";
  modeOfPayment: "Cash on Delivery" | "UPI";
}

interface BankAccount {
  id: string;
  accountName: string;
  openingBalance: string;
  asOfDate: string;
  bankAccountNumber: string;
  ifscCode: string;
  bankBranchName: string;
  accountHoldersName: string;
  upiId: string;
}

interface StoreSettings {
  enableStore: boolean;
  storeSlug: string;
  companyPhone: string;
  removePhone: boolean;
  businessTagline: string;
  orderPolicy: string;
  cashOnDelivery: boolean;
  upiPayments: boolean;
  selectedBankId: string;
  myBillBookBranding: boolean;
  enableMRP: boolean;
  enableWholesale: boolean;
  minOrderValue: number;
  deliveryCharge: number;
  minFreeDelivery: number;
  enableFreeDelivery: boolean;
  allowOrderByStock: boolean;
  hideOutOfStock: boolean;
  bankAccounts: BankAccount[];
}

// ─── Date Filter Options ──────────────────────────────────────────────────────

const DATE_FILTER_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "this_week" },
  { label: "Last Week", value: "last_week" },
  { label: "Last 7 Days", value: "last_7" },
  { label: "This Month", value: "this_month" },
  { label: "Previous Month", value: "prev_month" },
  { label: "Last 30 Days", value: "last_30" },
  { label: "This Quarter", value: "this_quarter" },
  { label: "Previous Quarter", value: "prev_quarter" },
  { label: "Current Fiscal Year", value: "fiscal_current", range: "01 Apr 2025 - 31 Mar 2026" },
  { label: "Previous Fiscal Year", value: "fiscal_prev" },
  { label: "Last 365 Days", value: "last_365", range: "26 Feb 2025 - 25 Feb 2026" },
  { label: "Custom", value: "custom" },
];

const SAMPLE_ORDERS: Order[] = [];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function maskAccountNumber(num: string) {
  if (num.length <= 4) return num;
  return "*".repeat(num.length - 4) + num.slice(-4);
}

function todayStr() {
  const d = new Date();
  return `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
}

// ─── Toggle ──────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`toggle ${checked ? "toggle--on" : "toggle--off"}`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
    >
      <span className="toggle__knob" />
    </button>
  );
}

// ─── Add Bank Account Modal ───────────────────────────────────────────────────

function AddBankModal({ onClose, onAdd }: { onClose: () => void; onAdd: (bank: BankAccount) => void }) {
  const [form, setForm] = useState({
    accountName: "",
    openingBalance: "",
    asOfDate: todayStr(),
    addBankDetails: true,
    bankAccountNumber: "",
    reEnterBankAccountNumber: "",
    ifscCode: "",
    bankBranchName: "",
    accountHoldersName: "",
    upiId: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const setField = (k: string, v: string | boolean) => {
    const updated = { ...form, [k]: v };
    setForm(updated);
    if (submitted) runValidate(updated);
  };

  function runValidate(f: typeof form) {
    const e: Record<string, string> = {};
    if (!f.accountName.trim()) e.accountName = "Account Name is required";
    if (f.addBankDetails) {
      if (!f.bankAccountNumber.trim() || f.bankAccountNumber.replace(/\s/g, "").length < 9)
        e.bankAccountNumber = "Bank Account Number is required and must be atleast 9 characters.";
      if (f.reEnterBankAccountNumber !== f.bankAccountNumber)
        e.reEnterBankAccountNumber = "Entered value should be same as account number characters.";
      const ifscClean = f.ifscCode.trim().toUpperCase();
      if (!ifscClean || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscClean))
        e.ifscCode = "Invalid IFSC code";
      if (!f.bankBranchName.trim()) e.bankBranchName = "Bank & Branch Name is required";
      if (!f.accountHoldersName.trim()) e.accountHoldersName = "Account Holders Name is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    setSubmitted(true);
    if (!runValidate(form)) return;
    onAdd({
      id: Date.now().toString(),
      accountName: form.accountName,
      openingBalance: form.openingBalance,
      asOfDate: form.asOfDate,
      bankAccountNumber: form.bankAccountNumber,
      ifscCode: form.ifscCode,
      bankBranchName: form.bankBranchName,
      accountHoldersName: form.accountHoldersName,
      upiId: form.upiId,
    });
  }

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).classList.contains("modal-backdrop")) onClose();
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal__header">
          <h2 className="modal__title">Add Bank Account</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="modal__body">
          {/* Account Name */}
          <div className="modal-field">
            <label className="modal-field__label">Account Name <span className="modal-field__req">*</span></label>
            <input
              className={`modal-field__input ${errors.accountName ? "modal-field__input--error" : ""}`}
              placeholder="ex: Personal Account"
              value={form.accountName}
              onChange={(e) => setField("accountName", e.target.value)}
            />
            {errors.accountName && <span className="modal-field__error">{errors.accountName}</span>}
          </div>

          {/* Opening Balance + As of Date */}
          <div className="modal-row">
            <div className="modal-field modal-field--flex">
              <label className="modal-field__label">Opening Balance</label>
              <div className="modal-field__prefix-wrap">
                <span className="modal-field__prefix">₹</span>
                <input
                  className="modal-field__input modal-field__input--prefixed"
                  placeholder="ex: ₹10,000"
                  value={form.openingBalance}
                  onChange={(e) => setField("openingBalance", e.target.value)}
                />
              </div>
            </div>
            <div className="modal-field modal-field--flex">
              <label className="modal-field__label">As of Date</label>
              <div className="modal-field__date-wrap">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#6b7280" strokeWidth="1.5">
                  <rect x="2" y="3" width="12" height="11" rx="2"/>
                  <path d="M5 1v2M11 1v2M2 7h12"/>
                </svg>
                <input
                  className="modal-field__input modal-field__input--date"
                  value={form.asOfDate}
                  onChange={(e) => setField("asOfDate", e.target.value)}
                />
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#6b7280" strokeWidth="1.5">
                  <path d="M2 3.5L5 6.5L8 3.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Add Bank Details Toggle */}
          <div className="modal-toggle-row">
            <span className="modal-field__label">Add Bank Details</span>
            <Toggle checked={form.addBankDetails} onChange={(v) => setField("addBankDetails", v)} />
          </div>

          {form.addBankDetails && (
            <>
              {/* Bank Account Number + Re-enter */}
              <div className="modal-row">
                <div className="modal-field modal-field--flex">
                  <label className="modal-field__label">Bank Account Number <span className="modal-field__req">*</span></label>
                  <input
                    className={`modal-field__input ${errors.bankAccountNumber ? "modal-field__input--error" : ""}`}
                    placeholder="ex: 12345678915 7950"
                    value={form.bankAccountNumber}
                    onChange={(e) => setField("bankAccountNumber", e.target.value)}
                  />
                  {errors.bankAccountNumber && <span className="modal-field__error">{errors.bankAccountNumber}</span>}
                </div>
                <div className="modal-field modal-field--flex">
                  <label className="modal-field__label">Re-Enter Bank Account Number <span className="modal-field__req">*</span></label>
                  <input
                    className={`modal-field__input ${errors.reEnterBankAccountNumber ? "modal-field__input--error" : ""}`}
                    placeholder="ex: 12345678915 7950"
                    value={form.reEnterBankAccountNumber}
                    onChange={(e) => setField("reEnterBankAccountNumber", e.target.value)}
                  />
                  {errors.reEnterBankAccountNumber && <span className="modal-field__error">{errors.reEnterBankAccountNumber}</span>}
                </div>
              </div>

              {/* IFSC + Bank Branch */}
              <div className="modal-row">
                <div className="modal-field modal-field--flex">
                  <label className="modal-field__label">IFSC Code <span className="modal-field__req">*</span></label>
                  <input
                    className={`modal-field__input ${errors.ifscCode ? "modal-field__input--error" : ""}`}
                    placeholder="ex: HDFC000075"
                    value={form.ifscCode}
                    onChange={(e) => setField("ifscCode", e.target.value.toUpperCase())}
                  />
                  {errors.ifscCode && <span className="modal-field__error">{errors.ifscCode}</span>}
                </div>
                <div className="modal-field modal-field--flex">
                  <label className="modal-field__label">Bank & Branch Name <span className="modal-field__req">*</span></label>
                  <input
                    className={`modal-field__input ${errors.bankBranchName ? "modal-field__input--error" : ""}`}
                    placeholder="ex: HDFC, Old Madras"
                    value={form.bankBranchName}
                    onChange={(e) => setField("bankBranchName", e.target.value)}
                  />
                  {errors.bankBranchName && <span className="modal-field__error">{errors.bankBranchName}</span>}
                </div>
              </div>

              {/* Account Holder + UPI ID */}
              <div className="modal-row">
                <div className="modal-field modal-field--flex">
                  <label className="modal-field__label">Account Holders Name <span className="modal-field__req">*</span></label>
                  <input
                    className={`modal-field__input ${errors.accountHoldersName ? "modal-field__input--error" : ""}`}
                    placeholder="ex: Elisa wolf"
                    value={form.accountHoldersName}
                    onChange={(e) => setField("accountHoldersName", e.target.value)}
                  />
                  {errors.accountHoldersName && <span className="modal-field__error">{errors.accountHoldersName}</span>}
                </div>
                <div className="modal-field modal-field--flex">
                  <label className="modal-field__label">UPI ID</label>
                  <input
                    className="modal-field__input"
                    placeholder="ex: elisa@okhdfc"
                    value={form.upiId}
                    onChange={(e) => setField("upiId", e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal__footer">
          <button className="btn btn--outline" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSubmit}>Submit</button>
        </div>
      </div>
    </div>
  );
}

// ─── Link UPI Modal ───────────────────────────────────────────────────────────

function LinkUpiModal({ bankName, onClose, onSave }: { bankName: string; onClose: () => void; onSave: (upiId: string) => void }) {
  const [upiId, setUpiId] = useState("");
  const [error, setError] = useState("");

  function handleSave() {
    if (!upiId.trim()) { setError("UPI ID is required"); return; }
    if (!upiId.includes("@")) { setError("Enter a valid UPI ID (e.g. name@bank)"); return; }
    onSave(upiId.trim());
    onClose();
  }

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).classList.contains("modal-backdrop")) onClose();
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal modal--sm" role="dialog" aria-modal="true">
        <div className="modal__header">
          <h2 className="modal__title">Link / Add UPI Id</h2>
          <button className="modal__close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="modal__body">
          <p className="modal__subtitle">Adding UPI for <strong>{bankName}</strong></p>
          <div className="modal-field">
            <label className="modal-field__label">UPI ID <span className="modal-field__req">*</span></label>
            <input
              className={`modal-field__input ${error ? "modal-field__input--error" : ""}`}
              placeholder="ex: name@okhdfc"
              value={upiId}
              onChange={(e) => { setUpiId(e.target.value); setError(""); }}
              autoFocus
            />
            {error && <span className="modal-field__error">{error}</span>}
          </div>
        </div>
        <div className="modal__footer">
          <button className="btn btn--outline" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Bank Selector ────────────────────────────────────────────────────────────

interface BankSelectorProps {
  banks: BankAccount[];
  selectedBankId: string;
  onSelectBank: (id: string) => void;
  onAddBank: () => void;
  onLinkUpi: (bankId: string, upiId: string) => void;
}

function BankSelector({ banks, selectedBankId, onSelectBank, onAddBank, onLinkUpi }: BankSelectorProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [linkUpiForBank, setLinkUpiForBank] = useState<BankAccount | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedBank = banks.find((b) => b.id === selectedBankId);

  if (banks.length === 0) {
    return (
      <button className="btn btn--dashed" onClick={onAddBank}>
        + Add Bank Account
      </button>
    );
  }

  return (
    <>
      {linkUpiForBank && (
        <LinkUpiModal
          bankName={linkUpiForBank.accountName}
          onClose={() => setLinkUpiForBank(null)}
          onSave={(upiId) => onLinkUpi(linkUpiForBank.id, upiId)}
        />
      )}

      <div className="bank-selector">
        <p className="bank-selector__label">Select Bank Account to receive UPI Payments</p>
        <div className="bank-selector__dropdown-wrap" ref={ref}>
          <button
            className="bank-selector__select"
            onClick={() => setDropdownOpen((o) => !o)}
          >
            <span>{selectedBank ? selectedBank.accountName.toUpperCase() : "Select Account"}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 4l4 4 4-4" strokeLinecap="round"/>
            </svg>
          </button>
          {dropdownOpen && (
            <div className="bank-selector__options">
              {banks.map((b) => (
                <button
                  key={b.id}
                  className={`bank-selector__option ${b.id === selectedBankId ? "bank-selector__option--active" : ""}`}
                  onClick={() => { onSelectBank(b.id); setDropdownOpen(false); }}
                >
                  {b.accountName.toUpperCase()}
                </button>
              ))}
              <button
                className="bank-selector__option bank-selector__option--add"
                onClick={() => { onAddBank(); setDropdownOpen(false); }}
              >
                + Add Bank Account
              </button>
            </div>
          )}
        </div>

        {selectedBank && (
          <div className="bank-card">
            <div className="bank-card__icon">
              <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="6" fill="#f1f5f9"/>
                <path d="M10 22l8-10 6 7.5 4-5 2 2.5" stroke="#e53e3e" strokeWidth="0" fill="none"/>
                <polygon points="10,28 18,18 24,25.5 28,20.5 30,23 30,28" fill="#e53e3e" opacity="0.15"/>
                <path d="M10 20l8-10 8 10-8 10z" fill="#e53e3e"/>
                <path d="M22 10l8 10-8 10 8-10z" fill="#1a56db"/>
              </svg>
            </div>
            <div className="bank-card__info">
              <p className="bank-card__name">{selectedBank.accountName.toUpperCase()}</p>
              {selectedBank.bankAccountNumber && (
                <p className="bank-card__acno">{maskAccountNumber(selectedBank.bankAccountNumber)}</p>
              )}
              {selectedBank.upiId && <p className="bank-card__upi-id">{selectedBank.upiId}</p>}
            </div>
            {!selectedBank.upiId && (
              <div className="bank-card__actions">
                <span className="bank-card__no-upi-msg">No linked UPI Id found</span>
                <button
                  className="bank-card__link-btn"
                  onClick={() => setLinkUpiForBank(selectedBank)}
                >
                  + Link / Add UPI Id
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Date Filter Dropdown ─────────────────────────────────────────────────────

function DateFilterDropdown({ selected, onSelect }: { selected: string; onSelect: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedOption = DATE_FILTER_OPTIONS.find((o) => o.value === selected) || DATE_FILTER_OPTIONS[12];

  return (
    <div className="date-filter" ref={ref}>
      <button className="date-filter__btn" onClick={() => setOpen((o) => !o)}>
        <span className="date-filter__icon">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="12" height="11" rx="2"/>
            <path d="M5 1v2M11 1v2M2 7h12"/>
          </svg>
        </span>
        <span>{selectedOption.label}</span>
        <span className="date-filter__caret">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 3.5L5 6.5L8 3.5" strokeLinecap="round"/>
          </svg>
        </span>
      </button>
      {open && (
        <div className="date-filter__dropdown">
          {DATE_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`date-filter__option ${opt.value === selected ? "date-filter__option--active" : ""}`}
              onClick={() => { onSelect(opt.value); setOpen(false); }}
            >
              <span className="date-filter__option-label">{opt.label}</span>
              {(opt as any).range && <span className="date-filter__option-range">{(opt as any).range}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Orders Page ──────────────────────────────────────────────────────────────

function OrdersPage({ onOpenSettings }: { onOpenSettings: () => void }) {
  const [dateFilter, setDateFilter] = useState("last_365");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const storeUrl = "https://mybillbook.in/store/12O0ILX...";

  const filtered = SAMPLE_ORDERS.filter(
    (o) => !searchTerm ||
      o.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page page--orders">
      <div className="page__header">
        <h1 className="page__title">Online Orders</h1>
      </div>

      <div className="store-card">
        <p className="store-card__label">Your <span className="store-card__label--accent">Online Store</span></p>
        <div className="store-card__actions">
          <div className="store-card__url-row">
            <div className="store-card__url">
              <span className="store-card__url-text">{storeUrl}</span>
              <button className="icon-btn" title="Copy URL" onClick={() => navigator.clipboard.writeText(storeUrl)}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="5" y="5" width="9" height="9" rx="1.5"/>
                  <path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2"/>
                </svg>
              </button>
            </div>
            <button className="btn btn--primary btn--badge" onClick={() => window.open(storeUrl, "_blank")}>
              <span className="badge badge--new">New</span>
              View
            </button>
          </div>
          <div className="store-card__extras">
            <button className="btn btn--outline btn--badge" onClick={onOpenSettings}>
              <span className="badge badge--new">New</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="2.5"/>
                <path d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.95 3.05l-1.06 1.06M4.11 11.89l-1.06 1.06M12.95 12.95l-1.06-1.06M4.11 4.11L3.05 3.05"/>
              </svg>
              Store Settings
            </button>
            <button className="icon-btn icon-btn--whatsapp" title="Share on WhatsApp">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </button>
            <button className="icon-btn icon-btn--facebook" title="Share on Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            <button className="btn btn--youtube">
              <svg width="16" height="12" viewBox="0 0 24 18" fill="#FF0000">
                <path d="M23.495 2.34A3.016 3.016 0 0021.37.21C19.505 0 12 0 12 0S4.495 0 2.63.21A3.016 3.016 0 00.505 2.34C0 4.21 0 9 0 9s0 4.79.505 6.66a3.016 3.016 0 002.125 2.13C4.495 18 12 18 12 18s7.505 0 9.37-.21a3.016 3.016 0 002.125-2.13C24 13.79 24 9 24 9s0-4.79-.505-6.66zM9.545 12.854V5.146L15.818 9l-6.273 3.854z"/>
              </svg>
              Learn how to promote your store
            </button>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar__search">
          <button className={`icon-btn ${searchOpen ? "icon-btn--active" : ""}`} onClick={() => setSearchOpen((o) => !o)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6.5" cy="6.5" r="4.5"/>
              <path d="M10.5 10.5L14 14" strokeLinecap="round"/>
            </svg>
          </button>
          {searchOpen && (
            <input
              className="toolbar__search-input"
              placeholder="Search by name or quotation #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          )}
        </div>
        <DateFilterDropdown selected={dateFilter} onSelect={setDateFilter} />
      </div>

      <div className="orders-table-wrap">
        <table className="orders-table">
          <thead>
            <tr>
              <th>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  Date
                  <button className="sort-btn">
                    <svg width="10" height="12" viewBox="0 0 10 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 1v12M1 4l4-4 4 4M1 10l4 4 4-4"/>
                    </svg>
                  </button>
                </span>
              </th>
              <th>Quotation Number</th>
              <th>Party Name</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Mode of Payment</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="orders-table__empty">
                  <div className="empty-state">
                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                      <rect x="8" y="14" width="32" height="36" rx="3" stroke="#CBD5E1" strokeWidth="2"/>
                      <path d="M14 22h20M14 29h20M14 36h12" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="42" cy="42" r="10" fill="#F1F5F9"/>
                      <path d="M38 42h8M42 38v8" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" transform="rotate(45 42 42)"/>
                    </svg>
                    <p>No Transactions Matching the current filter</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((order, i) => (
                <tr key={i}>
                  <td>{order.date}</td>
                  <td>{order.quotationNumber}</td>
                  <td>{order.partyName}</td>
                  <td>₹{order.amount.toLocaleString("en-IN")}</td>
                  <td>
                    <span className={`status-badge status-badge--${order.status.toLowerCase()}`}>{order.status}</span>
                  </td>
                  <td>{order.modeOfPayment}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── General Store Settings ───────────────────────────────────────────────────

function GeneralStoreSettings({ settings, onChange }: { settings: StoreSettings; onChange: (s: StoreSettings) => void }) {
  const set = (k: keyof StoreSettings, v: any) => onChange({ ...settings, [k]: v });
  const [showAddBank, setShowAddBank] = useState(false);

  function handleAddBank(bank: BankAccount) {
    onChange({ ...settings, bankAccounts: [...settings.bankAccounts, bank], selectedBankId: bank.id });
  }

  function handleLinkUpi(bankId: string, upiId: string) {
    onChange({
      ...settings,
      bankAccounts: settings.bankAccounts.map((b) => b.id === bankId ? { ...b, upiId } : b),
    });
  }

  return (
    <>
      {showAddBank && <AddBankModal onClose={() => setShowAddBank(false)} onAdd={handleAddBank} />}

      <div className="settings-content">
        <section className="settings-section">
          <div className="settings-row settings-row--spaced">
            <span className="settings-label">Enable Online Store</span>
            <Toggle checked={settings.enableStore} onChange={(v) => set("enableStore", v)} />
          </div>
        </section>

        <section className="settings-section">
          <h3 className="settings-section__title">Your Store Link (URL)</h3>
          <p className="settings-section__desc">Help users easily find your store by customizing the keyword for your store URL</p>
          <div className="settings-url-field">
            <span className="settings-url-field__prefix">www.mybillbook.in/store/</span>
            <input
              className="settings-url-field__input"
              value={settings.storeSlug}
              onChange={(e) => set("storeSlug", e.target.value)}
            />
            <button className="icon-btn" title="Language">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="6"/>
                <path d="M8 2a10 6 0 010 12M8 2a10 6 0 000 12M2 8h12"/>
              </svg>
            </button>
          </div>
          <span className="settings-url-field__preview">www.mybillbook.in/store/{settings.storeSlug}</span>
        </section>

        <section className="settings-section">
          <h3 className="settings-section__title">Business Details</h3>
          <div className="settings-form">
            <div className="settings-form__row">
              <div className="settings-form__group">
                <label className="settings-form__label">Company Phone Number</label>
                <input className="settings-form__input" value={settings.companyPhone} onChange={(e) => set("companyPhone", e.target.value)} />
              </div>
              <div className="settings-row settings-row--spaced settings-row--compact">
                <span className="settings-label">Remove Phone Number from Online Store</span>
                <Toggle checked={settings.removePhone} onChange={(v) => set("removePhone", v)} />
              </div>
            </div>
            <div className="settings-form__group">
              <label className="settings-form__label">Business Tagline <span className="settings-form__hint">ⓘ</span></label>
              <input className="settings-form__input" placeholder="Enter business tagline here" value={settings.businessTagline} onChange={(e) => set("businessTagline", e.target.value)} />
            </div>
            <div className="settings-form__group">
              <label className="settings-form__label">Order Online Policy <span className="settings-form__hint">ⓘ</span></label>
              <textarea className="settings-form__textarea" placeholder="Enter details" value={settings.orderPolicy} onChange={(e) => set("orderPolicy", e.target.value)} />
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h3 className="settings-section__title">Payment Options</h3>
          <div className="settings-row settings-row--spaced settings-row--bordered">
            <div className="settings-row__icon-group">
              <span className="settings-row__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4l2 2"/>
                  <path d="M9 12h6M12 7v1M12 16v1"/>
                </svg>
              </span>
              <div>
                <p className="settings-label">Cash on Delivery</p>
                <p className="settings-sublabel">Let customers pay when their order is delivered</p>
              </div>
            </div>
            <Toggle checked={settings.cashOnDelivery} onChange={(v) => set("cashOnDelivery", v)} />
          </div>
          <div className="settings-row settings-row--spaced settings-row--bordered">
            <div className="settings-row__icon-group">
              <span className="settings-row__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="17" y="17" width="1" height="1" fill="#6b7280"/>
                  <path d="M14 17h3M17 14v3"/>
                </svg>
              </span>
              <div>
                <p className="settings-label">UPI Payments</p>
                <p className="settings-sublabel">Let customers pay online via UPI apps</p>
              </div>
            </div>
            <Toggle checked={settings.upiPayments} onChange={(v) => set("upiPayments", v)} />
          </div>

          {settings.upiPayments && (
            <div className="upi-bank-section">
              <BankSelector
                banks={settings.bankAccounts}
                selectedBankId={settings.selectedBankId}
                onSelectBank={(id) => set("selectedBankId", id)}
                onAddBank={() => setShowAddBank(true)}
                onLinkUpi={handleLinkUpi}
              />
            </div>
          )}

          <p className="settings-note">
            <strong>Note :</strong> UPI payments go directly to your bank, myBillBook does not process them
          </p>
        </section>

        <section className="settings-section">
          <div className="settings-row settings-row--spaced">
            <span className="settings-label">Enable myBillBook Branding on Online Store</span>
            <Toggle checked={settings.myBillBookBranding} onChange={(v) => set("myBillBookBranding", v)} />
          </div>
        </section>
      </div>
    </>
  );
}

// ─── Price Settings ───────────────────────────────────────────────────────────

function PriceSettings({ settings, onChange }: { settings: StoreSettings; onChange: (s: StoreSettings) => void }) {
  const set = (k: keyof StoreSettings, v: any) => onChange({ ...settings, [k]: v });
  const [minFreeDeliveryError, setMinFreeDeliveryError] = useState(false);

  return (
    <div className="settings-content">
      <section className="settings-section">
        <h3 className="settings-section__title">Show or Hide from Online Store</h3>
        <div className="settings-row settings-row--spaced">
          <div>
            <p className="settings-label">Enable MRP</p>
            <p className="settings-sublabel">Shown as original price along with discounted Selling Price</p>
          </div>
          <Toggle checked={settings.enableMRP} onChange={(v) => set("enableMRP", v)} />
        </div>
        <div className="settings-row settings-row--spaced" style={{ marginTop: 12 }}>
          <span className="settings-label">Enable Wholesale Pricing</span>
          <Toggle checked={settings.enableWholesale} onChange={(v) => set("enableWholesale", v)} />
        </div>
      </section>

      <section className="settings-section">
        <h3 className="settings-section__title">Minimum Order Value</h3>
        <div className="settings-form__group">
          <label className="settings-form__label">Set Minimum Order Amount</label>
          <input className="settings-form__input settings-form__input--narrow" type="number" value={settings.minOrderValue} onChange={(e) => set("minOrderValue", Number(e.target.value))} />
        </div>
        <p className="settings-note">Customers won't be allowed to place orders less than this amount</p>
      </section>

      <section className="settings-section">
        <h3 className="settings-section__title">Delivery Charges</h3>
        <div className="settings-form__row settings-form__row--2col">
          <div className="settings-form__group">
            <label className="settings-form__label">Set Delivery charge</label>
            <input className="settings-form__input" type="number" value={settings.deliveryCharge} onChange={(e) => set("deliveryCharge", Number(e.target.value))} />
          </div>
          <div className="settings-form__group">
            <label className="settings-form__label">Minimum Free Delivery Amount</label>
            <input
              className={`settings-form__input ${minFreeDeliveryError ? "settings-form__input--error" : ""}`}
              type="number"
              value={settings.minFreeDelivery}
              onChange={(e) => {
                const v = Number(e.target.value);
                set("minFreeDelivery", v);
                setMinFreeDeliveryError(v <= 0 && settings.enableFreeDelivery);
              }}
            />
            {minFreeDeliveryError && <span className="settings-form__error">Please enter a valid amount</span>}
          </div>
        </div>
        <div className="settings-row settings-row--spaced" style={{ marginTop: 12 }}>
          <span className="settings-label">Enable Free Delivery over a minimum amount</span>
          <Toggle
            checked={settings.enableFreeDelivery}
            onChange={(v) => { set("enableFreeDelivery", v); setMinFreeDeliveryError(v && settings.minFreeDelivery <= 0); }}
          />
        </div>
      </section>
    </div>
  );
}

// ─── Item Stock Settings ──────────────────────────────────────────────────────

function ItemStockSettings({ settings, onChange }: { settings: StoreSettings; onChange: (s: StoreSettings) => void }) {
  const set = (k: keyof StoreSettings, v: any) => onChange({ ...settings, [k]: v });

  return (
    <div className="settings-content">
      <section className="settings-section">
        <h3 className="settings-section__title">Item Stock Settings</h3>
        <div className="settings-row settings-row--spaced settings-row--bordered">
          <div>
            <p className="settings-label">Allow ordering as per current Inventory stock only</p>
            <p className="settings-sublabel">Let user order only up to in stock quantity</p>
          </div>
          <Toggle checked={settings.allowOrderByStock} onChange={(v) => set("allowOrderByStock", v)} />
        </div>
        <div className="settings-row settings-row--spaced settings-row--bordered">
          <span className="settings-label">Hide "Out of Stock" items</span>
          <Toggle checked={settings.hideOutOfStock} onChange={(v) => set("hideOutOfStock", v)} />
        </div>
      </section>
    </div>
  );
}

// ─── Settings Layout ──────────────────────────────────────────────────────────

function SettingsLayout({ onBack, settings, onChange }: { onBack: () => void; settings: StoreSettings; onChange: (s: StoreSettings) => void }) {
  const [activeTab, setActiveTab] = useState<"general" | "price" | "stock">("general");
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: "general" as const, label: "General Store Details", icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 8h6M5 11h4"/></svg> },
    { id: "price" as const, label: "Price Settings", icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 2v12M5 5h4.5a2 2 0 010 4H5m0 0h5a2 2 0 010 4H5"/></svg> },
    { id: "stock" as const, label: "Item Stock Settings", icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 4h12M2 8h8M2 12h5"/></svg> },
  ];

  return (
    <div className="settings-layout">
      <div className="settings-layout__header">
        <button className="btn btn--back" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Online Store Settings
        </button>
        <div className="settings-layout__header-actions">
          <button className="btn btn--outline" onClick={() => window.open(`https://mybillbook.in/store/${settings.storeSlug}`, "_blank")}>
            View Online Store
          </button>
          <button className={`btn btn--primary ${saved ? "btn--saved" : ""}`} onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
            {saved ? "✓ Saved" : "Save"}
          </button>
        </div>
      </div>
      <div className="settings-layout__body">
        <nav className="settings-nav">
          {tabs.map((tab) => (
            <button key={tab.id} className={`settings-nav__item ${activeTab === tab.id ? "settings-nav__item--active" : ""}`} onClick={() => setActiveTab(tab.id)}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </nav>
        <div className="settings-panel">
          {activeTab === "general" && <GeneralStoreSettings settings={settings} onChange={onChange} />}
          {activeTab === "price" && <PriceSettings settings={settings} onChange={onChange} />}
          {activeTab === "stock" && <ItemStockSettings settings={settings} onChange={onChange} />}
        </div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<"orders" | "settings">("orders");
  const [settings, setSettings] = useState<StoreSettings>({
    enableStore: true,
    storeSlug: "12o6ilx",
    companyPhone: "9142581382",
    removePhone: true,
    businessTagline: "",
    orderPolicy: "",
    cashOnDelivery: true,
    upiPayments: true,
    selectedBankId: "",
    myBillBookBranding: true,
    enableMRP: true,
    enableWholesale: true,
    minOrderValue: 0,
    deliveryCharge: 0,
    minFreeDelivery: 0,
    enableFreeDelivery: true,
    allowOrderByStock: true,
    hideOutOfStock: true,
    bankAccounts: [],
  });

  return (
    <div className="app">
      {view === "orders" ? (
        <OrdersPage onOpenSettings={() => setView("settings")} />
      ) : (
        <SettingsLayout onBack={() => setView("orders")} settings={settings} onChange={setSettings} />
      )}
    </div>
  );
}