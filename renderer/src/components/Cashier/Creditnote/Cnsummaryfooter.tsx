import { useState, useRef, useEffect } from "react";
import {
  AdditionalCharge, InvoiceItem, PAYMENT_METHODS, TAX_OPTIONS,
} from "./Creditnotetypes";
import "./Createcreditnote.css";

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

// ─── TCS Rate Data ─────────────────────────────────────────────────────────────
interface TcsRate {
  label: string;
  rate: number;
  section?: string;
}

const DEFAULT_TCS_RATES: TcsRate[] = [
  { label: "Scrap",                                                        rate: 1.0 },
  { label: "Other",                                                        rate: 1.0 },
  { label: "Liquor of alcoholic nature, made for consumption by humans",   rate: 1.0 },
  { label: "Minerals like lignite, coal and iron ore",                     rate: 1.0 },
  { label: "Purchase of Motor vehicle exceeding Rs.10 lakh",              rate: 2.0 },
  { label: "Parking lot, Toll Plaza and Mining and Quarrying",            rate: 2.5 },
  { label: "Timber wood under a forest leased",                           rate: 2.5 },
  { label: "Timber wood by any other mode than forest leased",            rate: 2.5 },
  { label: "Forest produce other than Tendu leaves and timber",           rate: 5.0 },
  { label: "Tendu leaves",                                                 rate: 5.0 },
  { label: "0.1% - 206C(IH) turnover > 1Cr",                             rate: 0.1 },
  { label: "1.0% - 206C(IH) turnover > 1Cr (Without PAN)",               rate: 1.0 },
];

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
    <div className="cn-overlay" onClick={onClose}>
      <div className="cn-sig-modal" onClick={e => e.stopPropagation()}>
        <div className="cn-sig-modal-hdr">
          <span className="cn-sig-modal-title">Signature</span>
          <button className="cn-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="cn-sig-modal-body">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFile}
          />
          <button className="cn-sig-option-card" onClick={() => fileRef.current?.click()}>
            <div className="cn-sig-option-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
                <line x1="12" y1="5" x2="12" y2="1"/>
                <polyline points="9 4 12 1 15 4"/>
              </svg>
            </div>
            <span className="cn-sig-option-label">Upload Signature from Desktop</span>
          </button>

          <button className="cn-sig-option-card" onClick={() => { onShowEmpty(); onClose(); }}>
            <div className="cn-sig-option-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2"/>
              </svg>
            </div>
            <span className="cn-sig-option-label">Show Empty Signature Box on Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add TCS Rate Modal ───────────────────────────────────────────────────────
function AddTcsRateModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (r: TcsRate) => void;
}) {
  const [taxName, setTaxName] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [rate, setRate] = useState(0);
  const valid = taxName.trim().length > 0;

  return (
    <div className="cn-overlay cn-overlay--top2" onClick={onClose}>
      <div className="cn-modal cn-tcs-modal" onClick={e => e.stopPropagation()}>
        <div className="cn-modal-hdr">
          <span className="cn-modal-title">Add Tcs Rate</span>
          <button className="cn-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="cn-tcs-modal-body">
          <div className="cn-field">
            <label>Tax name</label>
            <input className="cn-input cn-input--full" value={taxName}
              onChange={e => setTaxName(e.target.value)} placeholder="Enter Tax Name" />
          </div>
          <div className="cn-field">
            <label>Enter Section Name</label>
            <input className="cn-input cn-input--full" value={sectionName}
              onChange={e => setSectionName(e.target.value)} placeholder="Enter Section Name" />
          </div>
          <div className="cn-field">
            <label>Enter Rate (in %)</label>
            <input className="cn-input cn-input--full" type="number" value={rate}
              onChange={e => setRate(Number(e.target.value))} />
          </div>
        </div>
        <div className="cn-modal-footer">
          <button className="cn-btn-cancel" onClick={onClose}>Close</button>
          <button
            className={`cn-btn-primary${!valid ? " cn-btn-primary--disabled" : ""}`}
            disabled={!valid}
            onClick={() => { onSave({ label: taxName.trim(), rate, section: sectionName.trim() || undefined }); onClose(); }}
          >Save</button>
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

export function CNSummary({
  items, additionalCharges, discountType, discountPct, discountAmt,
  showDiscount, autoRoundOff, roundOffAmt, amountPaid, paymentMethod, markFullyPaid,
  onChargesChange, onDiscountChange, onToggleDiscount,
  onRoundOffChange, onAmountPaidChange, onPaymentMethodChange, onMarkFullyPaid,
}: SummaryProps) {

  const [discTypeOpen, setDiscTypeOpen] = useState(false);
  const [roundOffSign, setRoundOffSign] = useState<"add" | "reduce">("add");
  const [roundOffDropOpen, setRoundOffDropOpen] = useState(false);
  const [manualTotal, setManualTotal] = useState("");

  // TCS state
  const [applyTcs, setApplyTcs] = useState(false);
  const [tcsRates, setTcsRates] = useState<TcsRate[]>(DEFAULT_TCS_RATES);
  const [selectedTcs, setSelectedTcs] = useState<TcsRate | null>(null);
  const [tcsBase, setTcsBase] = useState<"total" | "taxable">("total");
  const [tcsOpen, setTcsOpen] = useState(false);
  const [showAddTcs, setShowAddTcs] = useState(false);

  // Signature state
  const [showSigModal, setShowSigModal] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string>(() => getBuilderSignature());
  const [showEmptyBox, setShowEmptyBox] = useState(false);
  const companyName = getBuilderCompanyName();

  // Re-read from builder on mount
  useEffect(() => {
    const url = getBuilderSignature();
    if (url) { setSignatureUrl(url); setShowEmptyBox(false); }
  }, []);

  const discTypeRef = useRef<HTMLDivElement>(null);
  const roundOffRef = useRef<HTMLDivElement>(null);
  const tcsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (discTypeRef.current && !discTypeRef.current.contains(e.target as Node)) setDiscTypeOpen(false);
      if (roundOffRef.current && !roundOffRef.current.contains(e.target as Node)) setRoundOffDropOpen(false);
      if (tcsRef.current && !tcsRef.current.contains(e.target as Node)) setTcsOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── calculations ──
  const hasItems = items.length > 0;
  const chargesTotal = additionalCharges.reduce((s, c) => s + c.amount * (1 + c.taxRate / 100), 0);
  const itemsTotal = items.reduce((s, i) => {
    const base = i.qty * i.price - (i.qty * i.price * i.discountPct / 100) - i.discountAmt;
    return s + base + base * i.taxRate / 100;
  }, 0);
  const taxableAmount = itemsTotal + chargesTotal;
  const discountValue = taxableAmount * discountPct / 100 + discountAmt;
  const afterDisc = taxableAmount - discountValue;
  const tcsBaseAmt = tcsBase === "total" ? afterDisc : taxableAmount;
  const tcsAmount = applyTcs && selectedTcs ? tcsBaseAmt * selectedTcs.rate / 100 : 0;
  const preRound = afterDisc + tcsAmount;
  const autoRo = autoRoundOff ? Math.round(preRound) - preRound : 0;
  const manualRo = roundOffSign === "reduce" ? -Math.abs(roundOffAmt) : Math.abs(roundOffAmt);
  const ro = autoRoundOff ? autoRo : manualRo;
  const totalAmount = preRound + ro;
  const balanceAmount = totalAmount - amountPaid;

  // ── charge helpers ──
  const addCharge = () => onChargesChange([...additionalCharges, {
    id: `charge-${Date.now()}`, label: "", amount: 0, taxLabel: "No Tax Applicable", taxRate: 0,
  }]);
  const updateCharge = (id: string, field: string, value: any) =>
    onChargesChange(additionalCharges.map(c => c.id === id ? { ...c, [field]: value } : c));
  const removeCharge = (id: string) => onChargesChange(additionalCharges.filter(c => c.id !== id));

  const XIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  );

  const recentTcsRates = DEFAULT_TCS_RATES.slice(0, 2);

  const hasSignature = signatureUrl || showEmptyBox;

  return (
    <div className="cn-summary">

      {/* ── Additional Charges ── */}
      {additionalCharges.map(charge => (
        <div key={charge.id} className="cn-charge-block">
          <input
            className="cn-charge-label-input"
            value={charge.label}
            onChange={e => updateCharge(charge.id, "label", e.target.value)}
            placeholder="Enter charge (ex. Transport Charge)"
          />
          <div className="cn-charge-inline">
            <div className="cn-charge-amt-wrap">
              <span className="cn-charge-rs">₹</span>
              <input
                className="cn-charge-amt-input"
                type="number"
                value={charge.amount}
                onChange={e => updateCharge(charge.id, "amount", Number(e.target.value))}
              />
            </div>
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
              {TAX_OPTIONS.filter(t => t.label !== "None").map(t => (
                <option key={t.label}>{t.label}</option>
              ))}
            </select>
            <button className="cn-charge-remove" onClick={() => removeCharge(charge.id)}>
              <XIcon />
            </button>
          </div>
        </div>
      ))}

      {additionalCharges.length > 0 ? (
        <div style={{ padding: "4px 0 4px" }}>
          <button className="cn-link-btn cn-link-btn--sm" onClick={addCharge}>+ Add Another Charge</button>
        </div>
      ) : (
        <div className="cn-summary-row cn-summary-row--link">
          <button className="cn-summary-link-btn" onClick={addCharge}>+ Add Additional Charges</button>
          <span className="cn-summary-neg">₹ 0</span>
        </div>
      )}

      {/* ── Taxable Amount ── */}
      <div className="cn-summary-row">
        <span>Taxable Amount</span>
        <span>₹ {taxableAmount.toFixed(0)}</span>
      </div>

      {/* ── Discount ── */}
      {showDiscount ? (
        <div className="cn-discount-row">
          <div ref={discTypeRef} className="cn-discount-type-wrap" style={{ position: "relative" }}>
            <button className="cn-discount-type-sel" onClick={() => setDiscTypeOpen(o => !o)}>
              {discountType === "after-tax" ? "Discount After Tax" : "Discount Before Tax"}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {discTypeOpen && (
              <div className="cn-discount-type-drop">
                {(["before-tax", "after-tax"] as const).map(t => (
                  <button key={t}
                    className={discountType === t ? "cn-disc-opt--active" : ""}
                    onClick={() => { onDiscountChange(discountPct, discountAmt, t); setDiscTypeOpen(false); }}>
                    {t === "after-tax" ? "Discount After Tax" : "Discount Before Tax"}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="cn-discount-inputs">
            <div className="cn-discount-pct-wrap">
              <span>%</span>
              <input className="cn-discount-input" type="number" min={0} max={100}
                value={discountPct}
                onChange={e => {
                  const pct = Number(e.target.value);
                  const amt = taxableAmount > 0 ? parseFloat((taxableAmount * pct / 100).toFixed(2)) : 0;
                  onDiscountChange(pct, amt, discountType);
                }} />
            </div>
            <span className="cn-discount-slash">/</span>
            <div className="cn-discount-amt-wrap">
              <span>₹</span>
              <input className="cn-discount-input" type="number" min={0}
                value={discountAmt}
                onChange={e => {
                  const amt = Number(e.target.value);
                  const pct = taxableAmount > 0 ? parseFloat(((amt / taxableAmount) * 100).toFixed(2)) : 0;
                  onDiscountChange(pct, amt, discountType);
                }} />
            </div>
            <button className="cn-charge-remove" onClick={() => onToggleDiscount(false)}>
              <XIcon />
            </button>
          </div>
        </div>
      ) : (
        <div className="cn-summary-row cn-summary-row--link">
          <button className="cn-summary-link-btn" onClick={() => onToggleDiscount(true)}>+ Add Discount</button>
          <span className="cn-summary-neg">- ₹ 0</span>
        </div>
      )}

      {/* ── Apply TCS ── */}
      <div className="cn-tcs-section">
        <div className="cn-tcs-row">
          <label className="cn-checkbox-label">
            <input type="checkbox" className="cn-checkbox" checked={applyTcs}
              onChange={e => { setApplyTcs(e.target.checked); if (!e.target.checked) { setSelectedTcs(null); setTcsOpen(false); } }} />
            <span>Apply TCS</span>
          </label>

          {applyTcs && (
            <div className="cn-tcs-controls">
              <div className="cn-tcs-amt-badge">₹ {tcsAmount.toFixed(2)}</div>
              <div ref={tcsRef} className="cn-tcs-rate-wrap">
                <button className="cn-tcs-rate-btn" onClick={() => setTcsOpen(o => !o)}>
                  <span>{selectedTcs ? `${selectedTcs.rate.toFixed(1)} %` : "Select Tcs Rate"}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {tcsOpen && (
                  <div className="cn-tcs-dropdown">
                    <div className="cn-tcs-section-hdr">Recently Used</div>
                    {recentTcsRates.map((r, i) => (
                      <button key={`r-${i}`}
                        className={`cn-tcs-option${selectedTcs?.label === r.label ? " cn-tcs-option--active" : ""}`}
                        onClick={() => { setSelectedTcs(r); setTcsOpen(false); }}>
                        <span className="cn-tcs-opt-label">{r.label}</span>
                        <span className="cn-tcs-opt-rate">{r.rate.toFixed(1)}%</span>
                      </button>
                    ))}
                    <div className="cn-tcs-divider" />
                    {tcsRates.map((r, i) => (
                      <button key={`a-${i}`}
                        className={`cn-tcs-option${selectedTcs?.label === r.label ? " cn-tcs-option--active" : ""}`}
                        onClick={() => { setSelectedTcs(r); setTcsOpen(false); }}>
                        <span className="cn-tcs-opt-label">{r.label}</span>
                        <span className="cn-tcs-opt-rate">{r.rate.toFixed(1)}%</span>
                      </button>
                    ))}
                    <div className="cn-tcs-divider" />
                    <button className="cn-tcs-add-btn" onClick={() => { setTcsOpen(false); setShowAddTcs(true); }}>
                      + Add Tcs Rate
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {applyTcs && selectedTcs && (
          <div className="cn-tcs-base-row">
            <label className="cn-radio-label">
              <input type="radio" name="cn-tcs-base" className="cn-radio"
                checked={tcsBase === "total"} onChange={() => setTcsBase("total")} />
              <span>Total<br />Amount</span>
            </label>
            <label className="cn-radio-label">
              <input type="radio" name="cn-tcs-base" className="cn-radio"
                checked={tcsBase === "taxable"} onChange={() => setTcsBase("taxable")} />
              <span>Taxable<br />Amount</span>
            </label>
          </div>
        )}
      </div>

      {/* ── Auto Round Off ── */}
      <div className="cn-roundoff-row">
        <label className="cn-checkbox-label">
          <input type="checkbox" className="cn-checkbox" checked={autoRoundOff}
            onChange={e => onRoundOffChange(e.target.checked, roundOffAmt)} />
          <span>Auto Round Off</span>
        </label>
        <div className="cn-roundoff-right">
          <div ref={roundOffRef} className="cn-roundoff-sign-wrap">
            <button className="cn-roundoff-type-btn" onClick={() => setRoundOffDropOpen(o => !o)}>
              {roundOffSign === "add" ? "+ Add" : "- Reduce"}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {roundOffDropOpen && (
              <div className="cn-roundoff-dropdown">
                <button className="cn-roundoff-opt" onClick={() => { setRoundOffSign("add"); setRoundOffDropOpen(false); }}>+ Add</button>
                <button className="cn-roundoff-opt" onClick={() => { setRoundOffSign("reduce"); setRoundOffDropOpen(false); }}>- Reduce</button>
              </div>
            )}
          </div>
          <span className="cn-roundoff-rs">₹</span>
          <input
            className="cn-roundoff-input"
            type="number"
            value={autoRoundOff ? Math.abs(autoRo).toFixed(2) : roundOffAmt}
            onChange={e => onRoundOffChange(autoRoundOff, Number(e.target.value))}
            readOnly={autoRoundOff}
          />
        </div>
      </div>

      {/* ── Total Amount ── */}
      <div className="cn-summary-total-row">
        <span className="cn-total-label">Total Amount</span>
        {hasItems ? (
          <span className="cn-total-computed">₹ {totalAmount.toFixed(2)}</span>
        ) : (
          <input
            className="cn-total-input cn-total-input--editable"
            type="number"
            min={0}
            placeholder="Enter Payment amount"
            value={manualTotal}
            onChange={e => { setManualTotal(e.target.value); onAmountPaidChange(Number(e.target.value)); }}
          />
        )}
      </div>

      <div className="cn-summary-divider" />

      {/* ── Mark as fully paid ── */}
      <div className="cn-fully-paid-row">
        <label className="cn-checkbox-label">
          <span>Mark as fully paid</span>
          <input type="checkbox" className="cn-checkbox" checked={markFullyPaid}
            onChange={e => {
              onMarkFullyPaid(e.target.checked);
              if (e.target.checked) onAmountPaidChange(hasItems ? totalAmount : Number(manualTotal));
              else onAmountPaidChange(0);
            }} />
        </label>
      </div>

      {/* ── Amount Received ── */}
      <div className="cn-amount-paid-row">
        <span>Amount Received</span>
        <div className="cn-amount-paid-inputs">
          <div className="cn-paid-rs-wrap">
            <span>₹</span>
            <input className="cn-paid-input" type="number" value={amountPaid} min={0}
              onChange={e => onAmountPaidChange(Number(e.target.value))} />
          </div>
          <select className="cn-payment-method-sel" value={paymentMethod}
            onChange={e => onPaymentMethodChange(e.target.value)}>
            {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="cn-summary-divider" />

      {/* ── Balance Amount ── */}
      <div className="cn-balance-row">
        <span className="cn-balance-label">Balance Amount</span>
        <span className={`cn-balance-value${balanceAmount === 0 ? " cn-balance-value--zero" : ""}`}>
          ₹ {balanceAmount.toFixed(0)}
        </span>
      </div>

      {/* ── Authorized Signatory ── */}
      <div className="cn-signatory">
        <div className="cn-signatory-text">
          Authorized signatory for <strong>{companyName}</strong>
        </div>

        {!hasSignature ? (
          /* ── Add Signature button ── */
          <button className="cn-add-signature-btn" onClick={() => setShowSigModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Signature
          </button>
        ) : signatureUrl ? (
          /* ── Uploaded signature preview ── */
          <div className="cn-signature-preview-wrap">
            <img src={signatureUrl} alt="Signature" className="cn-signature-preview-img" />
            <button
              className="cn-sig-change-btn"
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
          <div className="cn-signatory-empty-box" onClick={() => setShowSigModal(true)} title="Click to change">
            <span className="cn-signatory-empty-hint">Signature</span>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showSigModal && (
        <SignatureModal
          onClose={() => setShowSigModal(false)}
          onUpload={url => { setSignatureUrl(url); setShowEmptyBox(false); }}
          onShowEmpty={() => { setShowEmptyBox(true); setSignatureUrl(""); }}
        />
      )}

      {showAddTcs && (
        <AddTcsRateModal
          onClose={() => setShowAddTcs(false)}
          onSave={r => { setTcsRates(prev => [...prev, r]); setSelectedTcs(r); }}
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
            <textarea className="cn-notes-input" value={notes} onChange={e => onNotesChange(e.target.value)}
              placeholder="Enter your notes" rows={2} />
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
            <textarea className="cn-terms-input" value={termsConditions}
              onChange={e => onTermsChange(e.target.value)} rows={4} />
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
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