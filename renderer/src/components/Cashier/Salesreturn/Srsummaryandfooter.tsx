import { useState, useRef, useEffect } from "react";
import {
  AdditionalCharge, InvoiceItem, PAYMENT_METHODS, TAX_OPTIONS,
} from "./Salesreturntypes";
import "./Createsalesreturn.css";

// ─── Read signature / company from InvoiceBuilder localStorage ───────────────
function getBuilderSignature(): string {
  try {
    const raw = localStorage.getItem("activeInvoiceTemplate");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.misc?.signatureUrl) return parsed.misc.signatureUrl;
    }
  } catch {}
  return "";
}

function getBuilderCompanyName(): string {
  try {
    const raw = localStorage.getItem("activeInvoiceTemplate");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.inv?.companyName) return parsed.inv.companyName;
    }
  } catch {}
  return "Your Business";
}

// ─── Signature Modal ──────────────────────────────────────────────────────────
interface SignatureModalProps {
  onClose: () => void;
  onUpload: (url: string) => void;
  onShowEmpty: () => void;
}

function SignatureModal({ onClose, onUpload, onShowEmpty }: SignatureModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onUpload(url);
    onClose();
  };

  return (
    <div className="csr-overlay" onClick={onClose}>
      <div className="csr-sig-modal" onClick={e => e.stopPropagation()}>
        <div className="csr-sig-modal-hdr">
          <span className="csr-sig-modal-title">Signature</span>
          <button className="csr-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="csr-sig-modal-body">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFile}
          />
          {/* Upload from Desktop */}
          <button className="csr-sig-option-card" onClick={() => fileRef.current?.click()}>
            <div className="csr-sig-option-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
                <line x1="12" y1="1" x2="12" y2="5"/>
                <polyline points="9 4 12 1 15 4"/>
              </svg>
            </div>
            <span className="csr-sig-option-label">Upload Signature from Desktop</span>
          </button>

          {/* Show Empty Signature Box */}
          <button className="csr-sig-option-card" onClick={() => { onShowEmpty(); onClose(); }}>
            <div className="csr-sig-option-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2"/>
              </svg>
            </div>
            <span className="csr-sig-option-label">Show Empty Signature Box on Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Summary Panel ────────────────────────────────────────────────────────────
interface SummaryProps {
  items: InvoiceItem[];
  additionalCharges: AdditionalCharge[];
  discountType: "after-tax" | "before-tax";
  discountPct: number;
  discountAmt: number;
  showDiscount: boolean;
  autoRoundOff: boolean;
  roundOffAmt: number;
  amountPaid: number;
  paymentMethod: string;
  markFullyPaid: boolean;
  onChargesChange: (c: AdditionalCharge[]) => void;
  onDiscountChange: (pct: number, amt: number, type: string) => void;
  onToggleDiscount: (show: boolean) => void;
  onRoundOffChange: (auto: boolean, amt: number) => void;
  onAmountPaidChange: (v: number) => void;
  onPaymentMethodChange: (v: string) => void;
  onMarkFullyPaid: (v: boolean) => void;
}

export function SRSummary({
  items, additionalCharges, discountType, discountPct, discountAmt,
  showDiscount, autoRoundOff, roundOffAmt, amountPaid, paymentMethod,
  markFullyPaid,
  onChargesChange, onDiscountChange, onToggleDiscount,
  onRoundOffChange, onAmountPaidChange, onPaymentMethodChange, onMarkFullyPaid,
}: SummaryProps) {
  const [roundOffSign, setRoundOffSign] = useState<"add" | "reduce">("add");
  const [roundOffDropOpen, setRoundOffDropOpen] = useState(false);
  const [manualTotal, setManualTotal] = useState<string>("");

  // Signature state — read from Invoice Builder on mount
  const [showSigModal, setShowSigModal] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string>(() => getBuilderSignature());
  const [showEmptyBox, setShowEmptyBox] = useState(false);
  const companyName = getBuilderCompanyName();

  useEffect(() => {
    const url = getBuilderSignature();
    if (url) { setSignatureUrl(url); setShowEmptyBox(false); }
  }, []);

  const roundOffRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (roundOffRef.current && !roundOffRef.current.contains(e.target as Node)) setRoundOffDropOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const hasItems = items.length > 0;

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const chargesTotal = additionalCharges.reduce((s, c) => s + c.amount * (1 + c.taxRate / 100), 0);
  const taxableAmount = subtotal + chargesTotal;
  const discountValue = taxableAmount * discountPct / 100 + discountAmt;
  const afterDisc = taxableAmount - discountValue;
  const ro = autoRoundOff
    ? Math.round(afterDisc) - afterDisc
    : (roundOffSign === "add" ? 1 : -1) * Math.abs(roundOffAmt);
  const totalAmount = afterDisc + ro;
  const balanceAmount = totalAmount - amountPaid;

  const addCharge = () => {
    const nc: AdditionalCharge = {
      id: `charge-${Date.now()}`,
      label: "",
      amount: 0,
      taxLabel: "No Tax Applicable",
      taxRate: 0,
    };
    onChargesChange([...additionalCharges, nc]);
  };

  const updateCharge = (id: string, field: string, value: any) => {
    onChargesChange(additionalCharges.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCharge = (id: string) => {
    onChargesChange(additionalCharges.filter(c => c.id !== id));
  };

  const XCircleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  );

  const hasSignature = signatureUrl || showEmptyBox;

  return (
    <div className="csr-summary">

      {/* ── Additional Charges ── */}
      {additionalCharges.map(charge => (
        <div key={charge.id} className="csr-charge-row">
          <input
            className="csr-charge-label-input"
            value={charge.label}
            onChange={e => updateCharge(charge.id, "label", e.target.value)}
            placeholder="Enter charge (ex. Transport Charge)"
          />
          <div className="csr-charge-inline-row">
            <div className="csr-charge-amt-wrap">
              <span className="csr-charge-rs">₹</span>
              <input
                className="csr-charge-amt-input"
                type="number"
                value={charge.amount}
                onChange={e => updateCharge(charge.id, "amount", Number(e.target.value))}
              />
            </div>
            <select
              className="csr-charge-tax-sel"
              value={charge.taxLabel}
              onChange={e => {
                const opt = TAX_OPTIONS.find(t => t.label === e.target.value);
                updateCharge(charge.id, "taxLabel", e.target.value);
                if (opt) updateCharge(charge.id, "taxRate", opt.rate);
              }}
            >
              <option value="No Tax Applicable">No Tax Applicable</option>
              {TAX_OPTIONS.filter(t => t.label !== "None").map(t => (
                <option key={t.label}>{t.label}</option>
              ))}
            </select>
            <button className="csr-charge-remove" onClick={() => removeCharge(charge.id)}>
              <XCircleIcon />
            </button>
          </div>
        </div>
      ))}

      {additionalCharges.length > 0 ? (
        <button className="csr-link-btn csr-link-btn--sm" onClick={addCharge}>
          + Add Another Charge
        </button>
      ) : (
        <button className="csr-summary-link-btn" onClick={addCharge}>
          + Add Additional Charges
        </button>
      )}

      {/* ── Taxable Amount ── */}
      <div className="csr-summary-row">
        <span>Taxable Amount</span>
        <span>₹ {taxableAmount.toFixed(0)}</span>
      </div>

      {/* ── Discount ── */}
      {showDiscount ? (
        <div className="csr-discount-row">
          <select
            className="csr-discount-type-sel"
            value={discountType}
            onChange={e => onDiscountChange(discountPct, discountAmt, e.target.value)}
          >
            <option value="after-tax">Discount After Tax</option>
            <option value="before-tax">Discount Before Tax</option>
          </select>
          <div className="csr-discount-inputs">
            <div className="csr-discount-pct-wrap">
              <span>%</span>
              <input
                className="csr-discount-input"
                type="number" min={0} max={100}
                value={discountPct}
                onChange={e => {
                  const pct = Number(e.target.value);
                  const amt = taxableAmount > 0 ? parseFloat((taxableAmount * pct / 100).toFixed(2)) : 0;
                  onDiscountChange(pct, amt, discountType);
                }}
              />
            </div>
            <span className="csr-discount-slash">/</span>
            <div className="csr-discount-amt-wrap">
              <span>₹</span>
              <input
                className="csr-discount-input"
                type="number" min={0}
                value={discountAmt}
                onChange={e => {
                  const amt = Number(e.target.value);
                  const pct = taxableAmount > 0 ? parseFloat(((amt / taxableAmount) * 100).toFixed(2)) : 0;
                  onDiscountChange(pct, amt, discountType);
                }}
              />
            </div>
            <button className="csr-charge-remove" onClick={() => onToggleDiscount(false)}>
              <XCircleIcon />
            </button>
          </div>
        </div>
      ) : (
        <div className="csr-summary-row csr-summary-row--link">
          <button className="csr-summary-link-btn" onClick={() => onToggleDiscount(true)}>
            + Add Discount
          </button>
          <span className="csr-summary-neg">- ₹ {discountValue.toFixed(0)}</span>
        </div>
      )}

      {/* ── Round Off ── */}
      <div className="csr-roundoff-row">
        <label className="csr-checkbox-label">
          <input
            type="checkbox"
            checked={autoRoundOff}
            onChange={e => onRoundOffChange(e.target.checked, roundOffAmt)}
          />
          <span>Auto Round Off</span>
        </label>
        <div className="csr-roundoff-right">
          <div className="csr-roundoff-sign-wrap" ref={roundOffRef}>
            <button
              className="csr-roundoff-type-btn"
              onClick={() => setRoundOffDropOpen(o => !o)}
            >
              {roundOffSign === "add" ? "+ Add" : "- Reduce"}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {roundOffDropOpen && (
              <div className="csr-roundoff-dropdown">
                <button className="csr-roundoff-opt" onClick={() => { setRoundOffSign("add"); setRoundOffDropOpen(false); }}>+ Add</button>
                <button className="csr-roundoff-opt" onClick={() => { setRoundOffSign("reduce"); setRoundOffDropOpen(false); }}>- Reduce</button>
              </div>
            )}
          </div>
          <span className="csr-roundoff-rs">₹</span>
          <input
            className="csr-roundoff-input"
            type="number"
            value={autoRoundOff ? Math.abs(ro).toFixed(2) : roundOffAmt}
            onChange={e => onRoundOffChange(autoRoundOff, Number(e.target.value))}
            readOnly={autoRoundOff}
          />
        </div>
      </div>

      {/* ── Total Amount ── */}
      <div className="csr-summary-total-row">
        <span className="csr-total-label">Total Amount</span>
        {hasItems ? (
          <span className="csr-total-computed">
            {totalAmount > 0 ? `₹ ${totalAmount.toFixed(2)}` : "₹ 0"}
          </span>
        ) : (
          <input
            className="csr-total-input csr-total-input--editable"
            placeholder="Enter Payment amount"
            type="number"
            min={0}
            value={manualTotal}
            onChange={e => {
              setManualTotal(e.target.value);
              onAmountPaidChange(Number(e.target.value));
            }}
          />
        )}
      </div>

      <div className="csr-summary-divider" />

      {/* ── Mark as fully paid ── */}
      <div className="csr-fully-paid-row">
        <span />
        <label className="csr-checkbox-label">
          <span>Mark as fully paid</span>
          <input
            type="checkbox"
            checked={markFullyPaid}
            onChange={e => {
              onMarkFullyPaid(e.target.checked);
              if (e.target.checked) onAmountPaidChange(hasItems ? totalAmount : Number(manualTotal));
              else onAmountPaidChange(0);
            }}
          />
        </label>
      </div>

      {/* ── Amount Paid ── */}
      <div className="csr-amount-paid-row">
        <span>Amount Paid</span>
        <div className="csr-amount-paid-inputs">
          <div className="csr-paid-rs-wrap">
            <span>₹</span>
            <input
              className="csr-paid-input"
              type="number"
              value={amountPaid}
              onChange={e => onAmountPaidChange(Number(e.target.value))}
              min={0}
            />
          </div>
          <select
            className="csr-payment-method-sel"
            value={paymentMethod}
            onChange={e => onPaymentMethodChange(e.target.value)}
          >
            {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="csr-summary-divider" />

      {/* ── Balance ── */}
      <div className="csr-balance-row">
        <span className="csr-balance-label">Balance Amount</span>
        <span className={`csr-balance-value${balanceAmount === 0 ? " csr-balance-value--zero" : ""}`}>
          ₹ {balanceAmount.toFixed(0)}
        </span>
      </div>

      {/* ── Authorized Signatory ── */}
      <div className="csr-signatory">
        <div className="csr-signatory-text">
          Authorized signatory for <strong>{companyName}</strong>
        </div>

        {!hasSignature ? (
          /* ── Add Signature dashed button ── */
          <button className="csr-add-signature-btn" onClick={() => setShowSigModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Signature
          </button>
        ) : signatureUrl ? (
          /* ── Uploaded signature preview ── */
          <div className="csr-signature-preview-wrap">
            <img src={signatureUrl} alt="Signature" className="csr-signature-preview-img" />
            <button
              className="csr-sig-change-btn"
              onClick={() => setShowSigModal(true)}
              title="Change signature"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Change
            </button>
          </div>
        ) : (
          /* ── Empty signature box ── */
          <div className="csr-signatory-empty-box" onClick={() => setShowSigModal(true)} title="Click to change">
            <span className="csr-signatory-empty-hint">Signature</span>
          </div>
        )}
      </div>

      {/* ── Signature Modal ── */}
      {showSigModal && (
        <SignatureModal
          onClose={() => setShowSigModal(false)}
          onUpload={url => { setSignatureUrl(url); setShowEmptyBox(false); }}
          onShowEmpty={() => { setShowEmptyBox(true); setSignatureUrl(""); }}
        />
      )}
    </div>
  );
}

// ─── Footer Notes ─────────────────────────────────────────────────────────────
interface FooterProps {
  notes: string;
  termsConditions: string;
  onNotesChange: (v: string) => void;
  onTermsChange: (v: string) => void;
}

const DEFAULT_TERMS = `1. Goods once sold will not be taken back or exchanged\n2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only`;

export function SRFooter({ notes, termsConditions, onNotesChange, onTermsChange }: FooterProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleShowTerms = () => {
    if (!termsConditions.trim()) onTermsChange(DEFAULT_TERMS);
    setShowTerms(true);
  };

  return (
    <div className="csr-footer-panel">
      {!showNotes ? (
        <button className="csr-link-btn" onClick={() => setShowNotes(true)}>+ Add Notes</button>
      ) : (
        <div className="csr-footer-section">
          <div className="csr-footer-section-hdr">
            <span>Notes</span>
            <button className="csr-footer-remove" onClick={() => setShowNotes(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </button>
          </div>
          <div className="csr-notes-input-wrap">
            <textarea
              className="csr-notes-input"
              value={notes}
              onChange={e => onNotesChange(e.target.value)}
              placeholder="Enter your notes"
              rows={2}
            />
          </div>
        </div>
      )}

      {!showTerms ? (
        <button className="csr-link-btn" onClick={handleShowTerms}>+ Add Terms and Conditions</button>
      ) : (
        <div className="csr-footer-section">
          <div className="csr-footer-section-hdr">
            <span>Terms and Conditions</span>
            <button className="csr-footer-remove" onClick={() => setShowTerms(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </button>
          </div>
          <div className="csr-terms-box">
            <textarea
              className="csr-terms-input"
              value={termsConditions}
              onChange={e => onTermsChange(e.target.value)}
              rows={4}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Quick Settings Modal ─────────────────────────────────────────────────────
interface SettingsModalProps {
  nextNo: number;
  onClose: () => void;
  onSave: (prefix: string, seq: number, showImage: boolean) => void;
}

export function SRQuickSettings({ nextNo, onClose, onSave }: SettingsModalProps) {
  const [prefixOn, setPrefixOn] = useState(true);
  const [prefix, setPrefix] = useState("");
  const [seqNo, setSeqNo] = useState(nextNo);
  const [showImage, setShowImage] = useState(true);

  function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
    return (
      <button className={`csr-toggle${on ? " csr-toggle--on" : ""}`} onClick={() => set(!on)}>
        <span className="csr-toggle-knob" />
      </button>
    );
  }

  return (
    <div className="csr-overlay" onClick={onClose}>
      <div className="csr-modal csr-settings-modal" onClick={e => e.stopPropagation()}>
        <div className="csr-modal-hdr">
          <span>Quick Sales Return Settings</span>
          <button className="csr-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="csr-modal-body">
          <div className="csr-settings-section">
            <div className="csr-settings-row">
              <div>
                <div className="csr-settings-label">Sales Return Prefix &amp; Sequence Number</div>
                <div className="csr-settings-sub">Add your custom prefix &amp; sequence for Sales Return Numbering</div>
              </div>
              <Toggle on={prefixOn} set={setPrefixOn} />
            </div>
            {prefixOn && (
              <div className="csr-prefix-grid">
                <div className="csr-field">
                  <label>Prefix</label>
                  <input className="csr-input" value={prefix} onChange={e => setPrefix(e.target.value)} placeholder="Prefix" />
                </div>
                <div className="csr-field">
                  <label>Sequence Number</label>
                  <input className="csr-input" type="number" value={seqNo} onChange={e => setSeqNo(Number(e.target.value))} />
                </div>
                <div className="csr-settings-preview">Sales Return Number: {seqNo}</div>
              </div>
            )}
          </div>
          <div className="csr-settings-section">
            <div className="csr-settings-row">
              <div>
                <div className="csr-settings-label">Show Item Image on Invoice</div>
                <div className="csr-settings-sub">This will apply to all vouchers except for Payment In and Payment Out</div>
              </div>
              <Toggle on={showImage} set={setShowImage} />
            </div>
          </div>
        </div>
        <div className="csr-modal-footer">
          <button className="csr-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="csr-btn-primary" onClick={() => { onSave(prefix, seqNo, showImage); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
}