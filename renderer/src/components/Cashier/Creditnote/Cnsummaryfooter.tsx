import { useState } from "react";
import {
  AdditionalCharge, InvoiceItem, PAYMENT_METHODS, TAX_OPTIONS,
} from "./Creditnotetypes";
import "./Createcreditnote.css";

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

export function CNSummary({
  items, additionalCharges, discountType, discountPct, discountAmt,
  showDiscount, autoRoundOff, roundOffAmt, amountPaid, paymentMethod, markFullyPaid,
  onChargesChange, onDiscountChange, onToggleDiscount,
  onRoundOffChange, onAmountPaidChange, onPaymentMethodChange, onMarkFullyPaid,
}: SummaryProps) {
  const [discTypeOpen, setDiscTypeOpen] = useState(false);

  const chargesTotal = additionalCharges.reduce((s, c) => s + c.amount * (1 + c.taxRate / 100), 0);
  const itemsTotal = items.reduce((s, i) => {
    const base = i.qty * i.price - (i.qty * i.price * i.discountPct / 100) - i.discountAmt;
    return s + base + base * i.taxRate / 100;
  }, 0);
  const taxableAmount = itemsTotal + chargesTotal;
  const discountValue = taxableAmount * discountPct / 100 + discountAmt;
  const afterDisc = taxableAmount - discountValue;
  const ro = autoRoundOff ? Math.round(afterDisc) - afterDisc : roundOffAmt;
  const totalAmount = afterDisc + ro;
  const balanceAmount = totalAmount - amountPaid;

  const addCharge = () => {
    const nc: AdditionalCharge = { id: `charge-${Date.now()}`, label: "", amount: 0, taxLabel: "No Tax Applicable", taxRate: 0 };
    onChargesChange([...additionalCharges, nc]);
  };

  const updateCharge = (id: string, field: string, value: any) =>
    onChargesChange(additionalCharges.map(c => c.id === id ? { ...c, [field]: value } : c));

  const removeCharge = (id: string) => onChargesChange(additionalCharges.filter(c => c.id !== id));

  return (
    <div className="cn-summary">
      {/* Additional Charges */}
      {additionalCharges.map(charge => (
        <div key={charge.id} className="cn-charge-row">
          <input
            className="cn-charge-label-input"
            value={charge.label}
            onChange={e => updateCharge(charge.id, "label", e.target.value)}
            placeholder="Enter charge (ex. Transport Charge)"
          />
          <div className="cn-charge-amt-wrap">
            <span className="cn-charge-rs">₹</span>
            <input
              className="cn-charge-amt-input"
              type="number"
              value={charge.amount}
              onChange={e => updateCharge(charge.id, "amount", Number(e.target.value))}
            />
          </div>
          <div className="cn-charge-tax-wrap">
            <select
              className="cn-charge-tax-sel"
              value={charge.taxLabel}
              onChange={e => {
                const opt = TAX_OPTIONS.find(t => t.label === e.target.value);
                updateCharge(charge.id, "taxLabel", e.target.value);
                if (opt) updateCharge(charge.id, "taxRate", opt.rate);
              }}
            >
              <option value="No Tax Applicable">No Tax Applicable</option>
              {TAX_OPTIONS.filter(t => t.label !== "None").map(t => <option key={t.label}>{t.label}</option>)}
            </select>
          </div>
          <button className="cn-charge-remove" onClick={() => removeCharge(charge.id)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </button>
        </div>
      ))}
      {additionalCharges.length > 0 && (
        <button className="cn-link-btn cn-link-btn--sm" onClick={addCharge}>+ Add Another Charge</button>
      )}
      {additionalCharges.length === 0 && (
        <button className="cn-summary-link-btn" onClick={addCharge}>+ Add Additional Charges</button>
      )}

      <div className="cn-summary-row">
        <span>Taxable Amount</span>
        <span>₹ {taxableAmount.toFixed(0)}</span>
      </div>

      {/* Discount */}
      {showDiscount ? (
        <div className="cn-discount-row">
          <div className="cn-discount-type-wrap" style={{position:"relative"}}>
            <button
              className="cn-discount-type-sel"
              onClick={() => setDiscTypeOpen(o => !o)}
            >
              {discountType === "after-tax" ? "Discount After Tax" : "Discount Before Tax"}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {discTypeOpen && (
              <div className="cn-discount-type-drop">
                <button onClick={() => { onDiscountChange(discountPct, discountAmt, "before-tax"); setDiscTypeOpen(false); }}>Discount Before Tax</button>
                <button className={discountType==="after-tax"?"cn-disc-opt--active":""} onClick={() => { onDiscountChange(discountPct, discountAmt, "after-tax"); setDiscTypeOpen(false); }}>Discount After Tax</button>
              </div>
            )}
          </div>
          <div className="cn-discount-inputs">
            <div className="cn-discount-pct-wrap">
              <span>%</span>
              <input
                className="cn-discount-input"
                type="number" min={0} max={100}
                value={discountPct}
                onChange={e => onDiscountChange(Number(e.target.value), discountAmt, discountType)}
              />
            </div>
            <span className="cn-discount-slash">/</span>
            <div className="cn-discount-amt-wrap">
              <span>₹</span>
              <input
                className="cn-discount-input"
                type="number" min={0}
                value={discountAmt}
                onChange={e => onDiscountChange(discountPct, Number(e.target.value), discountType)}
              />
            </div>
            <button className="cn-charge-remove" onClick={() => onToggleDiscount(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="cn-summary-row cn-summary-row--link">
          <button className="cn-summary-link-btn" onClick={() => onToggleDiscount(true)}>+ Add Discount</button>
          <span className="cn-summary-neg">- ₹ 0</span>
        </div>
      )}

      {/* Apply TCS */}
      <div className="cn-tcs-row">
        <label className="cn-checkbox-label">
          <input type="checkbox" />
          <span>Apply TCS</span>
        </label>
      </div>

      {/* Round Off */}
      <div className="cn-roundoff-row">
        <label className="cn-checkbox-label">
          <input
            type="checkbox"
            checked={autoRoundOff}
            onChange={e => onRoundOffChange(e.target.checked, roundOffAmt)}
          />
          <span>Auto Round Off</span>
        </label>
        <div className="cn-roundoff-right">
          <button className="cn-roundoff-type-btn">+ Add</button>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          <span className="cn-roundoff-rs">₹</span>
          <input
            className="cn-roundoff-input"
            type="number"
            value={autoRoundOff ? ro.toFixed(2) : roundOffAmt}
            onChange={e => onRoundOffChange(autoRoundOff, Number(e.target.value))}
            readOnly={autoRoundOff}
          />
        </div>
      </div>

      {/* Total */}
      <div className="cn-summary-total-row">
        <span className="cn-total-label">Total Amount</span>
        <input
          className="cn-total-input"
          placeholder="Enter Payment amount"
          value={totalAmount > 0 ? totalAmount.toFixed(2) : ""}
          readOnly
        />
      </div>

      <div className="cn-summary-divider" />

      {/* Mark Fully Paid */}
      <div className="cn-fully-paid-row">
        <span />
        <label className="cn-checkbox-label">
          <span>Mark as fully paid</span>
          <input
            type="checkbox"
            checked={markFullyPaid}
            onChange={e => {
              onMarkFullyPaid(e.target.checked);
              if (e.target.checked) onAmountPaidChange(totalAmount);
              else onAmountPaidChange(0);
            }}
          />
        </label>
      </div>

      {/* Amount Paid */}
      <div className="cn-amount-paid-row">
        <span>Amount Received</span>
        <div className="cn-amount-paid-inputs">
          <div className="cn-paid-rs-wrap">
            <span>₹</span>
            <input
              className="cn-paid-input"
              type="number"
              value={amountPaid}
              onChange={e => onAmountPaidChange(Number(e.target.value))}
              min={0}
            />
          </div>
          <select
            className="cn-payment-method-sel"
            value={paymentMethod}
            onChange={e => onPaymentMethodChange(e.target.value)}
          >
            {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="cn-summary-divider" />

      {/* Balance */}
      <div className="cn-balance-row">
        <span className="cn-balance-label">Balance Amount</span>
        <span className={`cn-balance-value${balanceAmount === 0 ? " cn-balance-value--zero" : ""}`}>
          ₹ {balanceAmount.toFixed(0)}
        </span>
      </div>

      {/* Signatory */}
      <div className="cn-signatory">
        <div className="cn-signatory-text">
          Authorized signatory for <strong>scratchweb.solutions</strong>
        </div>
        <div className="cn-signatory-box" />
      </div>
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

export function CNFooter({ notes, termsConditions, onNotesChange, onTermsChange }: FooterProps) {
  const [showNotes, setShowNotes] = useState(!!notes);
  const [showTerms, setShowTerms] = useState(!!termsConditions);

  const handleShowTerms = () => {
    if (!termsConditions.trim()) onTermsChange(DEFAULT_TERMS);
    setShowTerms(true);
  };

  return (
    <div className="cn-footer-panel">
      {!showNotes ? (
        <button className="cn-link-btn" onClick={() => setShowNotes(true)}>+ Add Notes</button>
      ) : (
        <div className="cn-footer-section">
          <div className="cn-footer-section-hdr">
            <span>Notes</span>
            <button className="cn-footer-remove" onClick={() => setShowNotes(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </button>
          </div>
          <div className="cn-notes-input-wrap">
            <textarea
              className="cn-notes-input"
              value={notes}
              onChange={e => onNotesChange(e.target.value)}
              placeholder="Enter your notes"
              rows={2}
            />
          </div>
        </div>
      )}

      {!showTerms ? (
        <button className="cn-link-btn" onClick={handleShowTerms}>+ Add Terms and Conditions</button>
      ) : (
        <div className="cn-footer-section">
          <div className="cn-footer-section-hdr">
            <span>Terms and Conditions</span>
            <button className="cn-footer-remove" onClick={() => setShowTerms(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </button>
          </div>
          <div className="cn-terms-box">
            <textarea
              className="cn-terms-input"
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
  currentPrefix: string;
  onClose: () => void;
  onSave: (prefix: string, seq: number, showImage: boolean) => void;
}

export function CNQuickSettings({ nextNo, currentPrefix, onClose, onSave }: SettingsModalProps) {
  const [prefixOn, setPrefixOn] = useState(true);
  const [prefix, setPrefix] = useState(currentPrefix);
  const [seqNo, setSeqNo] = useState(nextNo);
  const [showImage, setShowImage] = useState(true);

  function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
    return (
      <button className={`cn-toggle${on ? " cn-toggle--on" : ""}`} onClick={() => set(!on)}>
        <span className="cn-toggle-knob" />
      </button>
    );
  }

  return (
    <div className="cn-overlay" onClick={onClose}>
      <div className="cn-modal cn-settings-modal" onClick={e => e.stopPropagation()}>
        <div className="cn-modal-hdr">
          <span>Quick Credit Note Settings</span>
          <button className="cn-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="cn-modal-body">
          <div className="cn-settings-section">
            <div className="cn-settings-row">
              <div>
                <div className="cn-settings-label">Credit Note Prefix &amp; Sequence Number</div>
                <div className="cn-settings-sub">Add your custom prefix &amp; sequence for Credit Note Numbering</div>
              </div>
              <Toggle on={prefixOn} set={setPrefixOn} />
            </div>
            {prefixOn && (
              <div className="cn-prefix-grid">
                <div className="cn-field">
                  <label>Prefix</label>
                  <input className="cn-input" value={prefix} onChange={e => setPrefix(e.target.value)} placeholder="Prefix" />
                </div>
                <div className="cn-field">
                  <label>Sequence Number</label>
                  <input className="cn-input" type="number" value={seqNo} onChange={e => setSeqNo(Number(e.target.value))} />
                </div>
                <div className="cn-settings-preview">Credit Note Number: {prefix}{seqNo}</div>
              </div>
            )}
          </div>
          <div className="cn-settings-section">
            <div className="cn-settings-row">
              <div>
                <div className="cn-settings-label">Show Item Image on Invoice</div>
                <div className="cn-settings-sub">This will apply to all vouchers except for Payment In and Payment Out</div>
              </div>
              <Toggle on={showImage} set={setShowImage} />
            </div>
          </div>
        </div>
        <div className="cn-modal-footer">
          <button className="cn-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="cn-btn-primary" onClick={() => { onSave(prefix, seqNo, showImage); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
}