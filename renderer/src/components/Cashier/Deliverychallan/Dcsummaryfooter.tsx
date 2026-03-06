import { useState } from "react";
import {
  AdditionalCharge, BillItem, TAX_OPTIONS,
} from "./Deliverychallantype";
import "./Createdeliverychallan.css";

// ─── Summary Panel ────────────────────────────────────────────────────────────
interface SummaryProps {
  items: BillItem[];
  additionalCharges: AdditionalCharge[];
  discountType: "after-tax" | "before-tax";
  discountPct: number;
  discountAmt: number;
  showDiscount: boolean;
  autoRoundOff: boolean;
  roundOffAmt: number;
  onChargesChange: (c: AdditionalCharge[]) => void;
  onDiscountChange: (pct: number, amt: number, type: string) => void;
  onToggleDiscount: (show: boolean) => void;
  onRoundOffChange: (auto: boolean, amt: number) => void;
}

export function DCSummary({
  items, additionalCharges, discountType, discountPct, discountAmt,
  showDiscount, autoRoundOff, roundOffAmt,
  onChargesChange, onDiscountChange, onToggleDiscount, onRoundOffChange,
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

  const addCharge = () => {
    const nc: AdditionalCharge = { id: `charge-${Date.now()}`, label: "", amount: 0, taxLabel: "No Tax Applicable", taxRate: 0 };
    onChargesChange([...additionalCharges, nc]);
  };

  const updateCharge = (id: string, field: string, value: any) =>
    onChargesChange(additionalCharges.map(c => c.id === id ? { ...c, [field]: value } : c));

  const removeCharge = (id: string) => onChargesChange(additionalCharges.filter(c => c.id !== id));

  return (
    <div className="dc-summary">
      {/* Additional Charges */}
      {additionalCharges.map(charge => (
        <div key={charge.id} className="dc-charge-row">
          <input
            className="dc-charge-label-input"
            value={charge.label}
            onChange={e => updateCharge(charge.id, "label", e.target.value)}
            placeholder="Enter charge (ex. Transport Charge)"
          />
          <div className="dc-charge-amt-wrap">
            <span className="dc-charge-rs">₹</span>
            <input
              className="dc-charge-amt-input"
              type="number"
              value={charge.amount}
              onChange={e => updateCharge(charge.id, "amount", Number(e.target.value))}
            />
          </div>
          <div className="dc-charge-tax-wrap">
            <select
              className="dc-charge-tax-sel"
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
          <button className="dc-charge-remove" onClick={() => removeCharge(charge.id)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </button>
        </div>
      ))}
      {additionalCharges.length > 0 && (
        <button className="dc-link-btn dc-link-btn--sm" onClick={addCharge}>+ Add Another Charge</button>
      )}
      {additionalCharges.length === 0 && (
        <button className="dc-summary-link-btn" onClick={addCharge}>+ Add Additional Charges</button>
      )}

      <div className="dc-summary-row">
        <span>Taxable Amount</span>
        <span>₹ {taxableAmount.toFixed(0)}</span>
      </div>

      {/* Discount */}
      {showDiscount ? (
        <div className="dc-discount-row">
          <div className="dc-discount-type-wrap" style={{position:"relative"}}>
            <button
              className="dc-discount-type-sel"
              onClick={() => setDiscTypeOpen(o => !o)}
            >
              {discountType === "after-tax" ? "Discount After Tax" : "Discount Before Tax"}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {discTypeOpen && (
              <div className="dc-discount-type-drop">
                <button onClick={() => { onDiscountChange(discountPct, discountAmt, "before-tax"); setDiscTypeOpen(false); }}>Discount Before Tax</button>
                <button className={discountType==="after-tax"?"dc-disc-opt--active":""} onClick={() => { onDiscountChange(discountPct, discountAmt, "after-tax"); setDiscTypeOpen(false); }}>Discount After Tax</button>
              </div>
            )}
          </div>
          <div className="dc-discount-inputs">
            <div className="dc-discount-pct-wrap">
              <span>%</span>
              <input
                className="dc-discount-input"
                type="number" min={0} max={100}
                value={discountPct}
                onChange={e => onDiscountChange(Number(e.target.value), discountAmt, discountType)}
              />
            </div>
            <span className="dc-discount-slash">/</span>
            <div className="dc-discount-amt-wrap">
              <span>₹</span>
              <input
                className="dc-discount-input"
                type="number" min={0}
                value={discountAmt}
                onChange={e => onDiscountChange(discountPct, Number(e.target.value), discountType)}
              />
            </div>
            <button className="dc-charge-remove" onClick={() => onToggleDiscount(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="dc-summary-row dc-summary-row--link">
          <button className="dc-summary-link-btn" onClick={() => onToggleDiscount(true)}>+ Add Discount</button>
          <span className="dc-summary-neg">- ₹ 0</span>
        </div>
      )}

      {/* Round Off */}
      <div className="dc-roundoff-row">
        <label className="dc-checkbox-label">
          <input
            type="checkbox"
            checked={autoRoundOff}
            onChange={e => onRoundOffChange(e.target.checked, roundOffAmt)}
          />
          <span>Auto Round Off</span>
        </label>
        <div className="dc-roundoff-right">
          <button className="dc-roundoff-type-btn">+ Add</button>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          <span className="dc-roundoff-rs">₹</span>
          <input
            className="dc-roundoff-input"
            type="number"
            value={autoRoundOff ? ro.toFixed(2) : roundOffAmt}
            onChange={e => onRoundOffChange(autoRoundOff, Number(e.target.value))}
            readOnly={autoRoundOff}
          />
        </div>
      </div>

      {/* Total */}
      <div className="dc-summary-total-row">
        <span className="dc-total-label">Total Amount</span>
        <input
          className="dc-total-input"
          placeholder="Enter Payment amount"
          value={totalAmount > 0 ? totalAmount.toFixed(2) : ""}
          readOnly
        />
      </div>

      {/* Signatory */}
      <div className="dc-signatory">
        <div className="dc-signatory-text">
          Authorized signatory for <strong>scratchweb.solutions</strong>
        </div>
        <div className="dc-signatory-box" />
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

export function DCFooter({ notes, termsConditions, onNotesChange, onTermsChange }: FooterProps) {
  const [showNotes, setShowNotes] = useState(!!notes);
  const [showTerms, setShowTerms] = useState(!!termsConditions);

  const handleShowTerms = () => {
    if (!termsConditions.trim()) onTermsChange(DEFAULT_TERMS);
    setShowTerms(true);
  };

  return (
    <div className="dc-footer-panel">
      {!showNotes ? (
        <button className="dc-link-btn" onClick={() => setShowNotes(true)}>+ Add Notes</button>
      ) : (
        <div className="dc-footer-section">
          <div className="dc-footer-section-hdr">
            <span>Notes</span>
            <button className="dc-footer-remove" onClick={() => setShowNotes(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </button>
          </div>
          <textarea
            className="dc-notes-input"
            value={notes}
            onChange={e => onNotesChange(e.target.value)}
            placeholder="Enter your notes"
            rows={2}
          />
        </div>
      )}

      {!showTerms ? (
        <button className="dc-link-btn" onClick={handleShowTerms}>+ Add Terms and Conditions</button>
      ) : (
        <div className="dc-footer-section">
          <div className="dc-footer-section-hdr">
            <span>Terms and Conditions</span>
            <button className="dc-footer-remove" onClick={() => setShowTerms(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </button>
          </div>
          <textarea
            className="dc-terms-input"
            value={termsConditions}
            onChange={e => onTermsChange(e.target.value)}
            rows={4}
          />
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

export function DCQuickSettings({ nextNo, currentPrefix, onClose, onSave }: SettingsModalProps) {
  const [prefixOn, setPrefixOn] = useState(true);
  const [prefix, setPrefix] = useState(currentPrefix);
  const [seqNo, setSeqNo] = useState(nextNo);
  const [showImage, setShowImage] = useState(true);

  function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
    return (
      <button className={`dc-toggle${on ? " dc-toggle--on" : ""}`} onClick={() => set(!on)}>
        <span className="dc-toggle-knob" />
      </button>
    );
  }

  return (
    <div className="dc-overlay" onClick={onClose}>
      <div className="dc-modal dc-settings-modal" onClick={e => e.stopPropagation()}>
        <div className="dc-modal-hdr">
          <span>Quick Delivery Challan Settings</span>
          <button className="dc-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="dc-modal-body">
          <div className="dc-settings-section">
            <div className="dc-settings-row">
              <div>
                <div className="dc-settings-label">Challan Prefix &amp; Sequence Number</div>
                <div className="dc-settings-sub">Add your custom prefix &amp; sequence for Challan Numbering</div>
              </div>
              <Toggle on={prefixOn} set={setPrefixOn} />
            </div>
            {prefixOn && (
              <div className="dc-prefix-grid">
                <div className="dc-field">
                  <label>Prefix</label>
                  <input className="dc-input" value={prefix} onChange={e => setPrefix(e.target.value)} placeholder="Prefix" />
                </div>
                <div className="dc-field">
                  <label>Sequence Number</label>
                  <input className="dc-input" type="number" value={seqNo} onChange={e => setSeqNo(Number(e.target.value))} />
                </div>
                <div className="dc-settings-preview">Challan Number: {prefix}{seqNo}</div>
              </div>
            )}
          </div>
          <div className="dc-settings-section">
            <div className="dc-settings-row">
              <div>
                <div className="dc-settings-label">Show Item Image on Invoice</div>
                <div className="dc-settings-sub">This will apply to all vouchers except for Payment In and Payment Out</div>
              </div>
              <Toggle on={showImage} set={setShowImage} />
            </div>
          </div>
        </div>
        <div className="dc-modal-footer">
          <button className="dc-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="dc-btn-primary" onClick={() => { onSave(prefix, seqNo, showImage); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
}