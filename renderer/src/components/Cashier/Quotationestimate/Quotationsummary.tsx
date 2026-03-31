import { useState, useRef } from "react";
import { AdditionalCharge, CHARGE_TAX_OPTIONS, BillItem, calcBillItemAmount } from "./Quotationtypes";
import "./QuotationSummary.css";

// ─── Formatting helper ────────────────────────────────────────────────────────
function fmt(n: number, dec = 2): string {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
}

// ─── Signature Modal ──────────────────────────────────────────────────────────
interface SignatureModalProps {
  onClose: () => void;
  onUpload: (dataUrl: string) => void;
  onShowEmpty: () => void;
}

function SignatureModal({ onClose, onUpload, onShowEmpty }: SignatureModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) { onUpload(ev.target.result as string); onClose(); }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="qs-sig-overlay" onClick={onClose}>
      <div className="qs-sig-modal" onClick={(e) => e.stopPropagation()}>
        <div className="qs-sig-header">
          <span className="qs-sig-title">Signature</span>
          <button className="qs-sig-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6"  y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="qs-sig-options">
          <button className="qs-sig-option" onClick={() => fileRef.current?.click()}>
            <div className="qs-sig-option-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" width="42" height="42">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <span className="qs-sig-option-label">Upload Signature from Desktop</span>
          </button>
          <button className="qs-sig-option" onClick={() => { onShowEmpty(); onClose(); }}>
            <div className="qs-sig-option-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" width="42" height="42">
                <rect x="3" y="6" width="18" height="12" rx="2" />
              </svg>
            </div>
            <span className="qs-sig-option-label">Show Empty Signature Box on Invoice</span>
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface QuotationSummaryProps {
  subtotal: number;
  billItems?: BillItem[];
  additionalCharges: AdditionalCharge[];
  discountType: "Discount After Tax" | "Discount Before Tax";
  discountPct: number;
  discountAmt: number;
  roundOff: "none" | "+Add" | "-Reduce";
  roundOffAmt: number;
  showDiscount: boolean;
  onChargesChange: (charges: AdditionalCharge[]) => void;
  onDiscountTypeChange: (t: "Discount After Tax" | "Discount Before Tax") => void;
  onDiscountPctChange: (v: number) => void;
  onDiscountAmtChange: (v: number) => void;
  onRoundOffChange: (mode: "none" | "+Add" | "-Reduce", amt: number) => void;
  onToggleDiscount: (show: boolean) => void;
}

export default function QuotationSummary({
  subtotal,
  billItems = [],
  additionalCharges,
  discountType,
  discountPct,
  discountAmt,
  roundOff,
  roundOffAmt,
  showDiscount,
  onChargesChange,
  onDiscountTypeChange,
  onDiscountPctChange,
  onDiscountAmtChange,
  onRoundOffChange,
  onToggleDiscount,
}: QuotationSummaryProps) {
  const [showDiscountTypeMenu, setShowDiscountTypeMenu] = useState(false);
  const [showRoundOffMenu,     setShowRoundOffMenu]     = useState(false);
  const [showSigModal,         setShowSigModal]         = useState(false);
  const [signatureDataUrl,     setSignatureDataUrl]     = useState<string | null>(null);
  const [showEmptyBox,         setShowEmptyBox]         = useState(false);

  // ── Calculations (canonical formula — same as ItemsTable) ───────────────────
  // Re-derive from billItems so summary always matches line items exactly.
  const itemTotals      = billItems.map((i) => calcBillItemAmount(i));
  const itemsSubtotal   = parseFloat(itemTotals.reduce((s, c) => s + c.amount,     0).toFixed(2));
  const itemsTaxTotal   = parseFloat(itemTotals.reduce((s, c) => s + c.taxAmt,     0).toFixed(2));
  const itemsTaxable    = parseFloat(itemTotals.reduce((s, c) => s + c.taxable,    0).toFixed(2));
  const chargesTotal    = parseFloat(additionalCharges.reduce((s, c) => s + c.amount, 0).toFixed(2));

  // Taxable Amount = sum of post-discount, pre-tax line values + additional charges
  const taxableAmount   = parseFloat((itemsTaxable + chargesTotal).toFixed(2));

  // Quotation-level discount
  const discountValue   = parseFloat(
    (discountPct > 0
      ? (itemsSubtotal * discountPct) / 100
      : (discountAmt ?? 0)
    ).toFixed(2)
  );
  const derivedDiscountRs = discountValue;

  const afterDiscount   = parseFloat((itemsSubtotal + chargesTotal - discountValue).toFixed(2));
  const roundOffValue   = roundOff === "none" ? 0 : roundOff === "+Add" ? roundOffAmt : -roundOffAmt;
  const total           = parseFloat((afterDiscount + roundOffValue).toFixed(2));

  // ── Charge helpers ──────────────────────────────────────────────────────────
  function addCharge() {
    onChargesChange([
      ...additionalCharges,
      { id: `c-${Date.now()}`, label: "", amount: 0, taxLabel: "No Tax Applicable" },
    ]);
  }
  function updateCharge(id: string, field: keyof AdditionalCharge, value: any) {
    onChargesChange(additionalCharges.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  }
  function removeCharge(id: string) {
    onChargesChange(additionalCharges.filter((c) => c.id !== id));
  }

  return (
    <div className="qs-wrap">

      {/* ── Additional Charges ──────────────────────────────────────────────── */}
      {additionalCharges.map((charge) => (
        <div key={charge.id} className="qs-charge-row">
          <input
            className="qs-charge-input"
            placeholder="Enter charge (ex. Transport Charge)"
            value={charge.label}
            onChange={(e) => updateCharge(charge.id, "label", e.target.value)}
          />
          <div className="qs-charge-amt-wrap">
            <span className="qs-rs">₹</span>
            <input
              className="qs-charge-amt"
              type="number"
              min={0}
              value={charge.amount === 0 ? "" : charge.amount}
              placeholder="0"
              onChange={(e) => updateCharge(charge.id, "amount", parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="qs-charge-tax-wrap">
            <select
              className="qs-charge-tax"
              value={charge.taxLabel}
              onChange={(e) => updateCharge(charge.id, "taxLabel", e.target.value)}
            >
              {CHARGE_TAX_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <button className="qs-charge-remove" onClick={() => removeCharge(charge.id)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9"  x2="9"  y2="15" />
              <line x1="9"  y1="9"  x2="15" y2="15" />
            </svg>
          </button>
        </div>
      ))}

      <button className="qs-add-charge-btn" onClick={addCharge}>
        + Add Additional Charges
      </button>

      {/* ── Summary rows — order matches Image 2 ────────────────────────────── */}

      {/* Taxable Amount (post-discount pre-tax, shown first like Image 2) */}
      <div className="qs-summary-row">
        <span className="qs-summary-label">Taxable Amount</span>
        <span className="qs-summary-val">₹ {fmt(taxableAmount)}</span>
      </div>

      {/* GST breakdown — split into CGST + SGST, each = total GST / 2
           Label shows rate e.g. "CGST@9" when GST is 18% (9+9) */}
      {itemsTaxTotal > 0 && (() => {
        // Derive the GST rate from billItems (use first item with tax > 0)
        const taxedItem = billItems.find((i) => i.taxRate > 0);
        const halfRate  = taxedItem ? taxedItem.taxRate / 2 : 0;
        const halfLabel = halfRate > 0 ? `@${halfRate}` : "";
        const half      = parseFloat((itemsTaxTotal / 2).toFixed(2));
        return (
          <>
            <div className="qs-summary-row">
              <span className="qs-summary-label">SGST{halfLabel}</span>
              <span className="qs-summary-val">₹ {fmt(half)}</span>
            </div>
            <div className="qs-summary-row">
              <span className="qs-summary-label">CGST{halfLabel}</span>
              <span className="qs-summary-val">₹ {fmt(half)}</span>
            </div>
          </>
        );
      })()}

      {/* Sub Total */}
      <div className="qs-summary-row qs-summary-row--bold">
        <span className="qs-summary-label">Sub Total</span>
        <span className="qs-summary-val">₹ {fmt(itemsSubtotal + chargesTotal)}</span>
      </div>

      {/* ── Quotation-level Discount ─────────────────────────────────────────── */}
      {!showDiscount ? (
        <button className="qs-add-discount-btn" onClick={() => onToggleDiscount(true)}>
          + Add Discount
        </button>
      ) : (
        <>
          <div className="qs-discount-row">
            {/* Discount type selector */}
            <div className="qs-discount-type-wrap">
              <button
                className="qs-discount-type-btn"
                onClick={() => setShowDiscountTypeMenu(!showDiscountTypeMenu)}
              >
                {discountType}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {showDiscountTypeMenu && (
                <div className="qs-discount-menu">
                  {(["Discount After Tax", "Discount Before Tax"] as const).map((t) => (
                    <div
                      key={t}
                      className={`qs-discount-menu-item ${discountType === t ? "qs-discount-menu-item--active" : ""}`}
                      onClick={() => { onDiscountTypeChange(t); setShowDiscountTypeMenu(false); }}
                    >
                      {t}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* % input */}
            <div className="qs-discount-field-wrap">
              <span className="qs-pct-sym">%</span>
              <input
                className="qs-discount-input"
                type="number"
                min={0}
                max={100}
                value={discountPct === 0 && discountAmt > 0 ? "" : discountPct}
                placeholder="0"
                onChange={(e) => {
                  onDiscountPctChange(parseFloat(e.target.value) || 0);
                  onDiscountAmtChange(0);
                }}
              />
            </div>

            <span className="qs-slash">/</span>

            {/* ₹ input (read-only mirror when % > 0) */}
            <div className="qs-discount-field-wrap">
              <span className="qs-rs-sym">₹</span>
              <input
                className="qs-discount-input"
                type="number"
                min={0}
                value={discountPct > 0 ? parseFloat(fmt(derivedDiscountRs, 2)) : (discountAmt === 0 ? "" : discountAmt)}
                placeholder="0"
                readOnly={discountPct > 0}
                style={discountPct > 0 ? { background: "#f3f4f6", color: "#9ca3af", cursor: "not-allowed" } : {}}
                onChange={(e) => {
                  onDiscountAmtChange(parseFloat(e.target.value) || 0);
                  onDiscountPctChange(0);
                }}
              />
            </div>

            <button className="qs-discount-remove" onClick={() => onToggleDiscount(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9"  x2="9"  y2="15" />
                <line x1="9"  y1="9"  x2="15" y2="15" />
              </svg>
            </button>
          </div>

          {discountValue > 0 && (
            <div className="qs-summary-row">
              <span className="qs-summary-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span>Discount</span>
                {discountPct > 0 && <span className="qs-discount-badge">{discountPct}%</span>}
              </span>
              <span className="qs-discount-line">- ₹ {fmt(discountValue)}</span>
            </div>
          )}
        </>
      )}

      {/* ── Round Off ────────────────────────────────────────────────────────── */}
      <div className="qs-round-row">
        <label className="qs-round-check-label">
          <input
            type="checkbox"
            checked={roundOff !== "none"}
            onChange={(e) => {
              if (!e.target.checked) onRoundOffChange("none", 0);
              else onRoundOffChange("+Add", 0);
            }}
          />
          <span>Auto Round Off</span>
        </label>

        <div className="qs-round-right">
          <div className="qs-round-mode-wrap">
            <button className="qs-round-mode-btn" onClick={() => setShowRoundOffMenu(!showRoundOffMenu)}>
              {roundOff === "none" ? "+ Add" : roundOff === "+Add" ? "+ Add" : "- Reduce"}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {showRoundOffMenu && (
              <div className="qs-round-menu">
                {(["+Add", "-Reduce"] as const).map((m) => (
                  <div
                    key={m}
                    className={`qs-round-menu-item ${roundOff === m ? "qs-round-menu-item--active" : ""}`}
                    onClick={() => { onRoundOffChange(m, roundOffAmt); setShowRoundOffMenu(false); }}
                  >
                    {m === "+Add" ? "+ Add" : "- Reduce"}
                  </div>
                ))}
              </div>
            )}
          </div>
          <span className="qs-rs-sym">₹</span>
          <input
            className="qs-round-input"
            type="number"
            min={0}
            value={roundOffAmt === 0 ? "" : roundOffAmt}
            placeholder="0"
            onChange={(e) =>
              onRoundOffChange(
                roundOff === "none" ? "+Add" : roundOff,
                parseFloat(e.target.value) || 0
              )
            }
          />
        </div>
      </div>

      {/* ── Total Amount ─────────────────────────────────────────────────────── */}
      <div className="qs-total-row">
        <span className="qs-total-label">Total Amount</span>
        <span className="qs-total-val">₹ {fmt(total)}</span>
      </div>

      {/* ── Signature Section ─────────────────────────────────────────────────── */}
      <div className="qs-signatory">
        <span className="qs-signatory-text">
          Authorized signatory for <strong>Your Business</strong>
        </span>

        {!signatureDataUrl && !showEmptyBox && (
          <button className="qs-add-sig-btn" onClick={() => setShowSigModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5"  y1="12" x2="19" y2="12" />
            </svg>
            Add Signature
          </button>
        )}

        {signatureDataUrl && (
          <div className="qs-sig-preview-wrap">
            <img src={signatureDataUrl} alt="Signature" className="qs-sig-preview-img" />
            <div className="qs-sig-preview-actions">
              <button className="qs-sig-action-btn" onClick={() => setShowSigModal(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Change
              </button>
              <button className="qs-sig-action-btn qs-sig-action-btn--danger" onClick={() => setSignatureDataUrl(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
                Remove
              </button>
            </div>
          </div>
        )}

        {showEmptyBox && !signatureDataUrl && (
          <div className="qs-sig-empty-wrap">
            <div className="qs-sig-empty-box">
              <button className="qs-sig-upload-in-box" onClick={() => setShowSigModal(true)} title="Upload signature">
                <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" width="24" height="24">
                  <polyline points="16 16 12 12 8 16" />
                  <line x1="12" y1="12" x2="12" y2="21" />
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                </svg>
              </button>
            </div>
            <button
              className="qs-sig-action-btn qs-sig-action-btn--danger"
              style={{ marginTop: 6, alignSelf: "flex-end" }}
              onClick={() => setShowEmptyBox(false)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6"  y1="6" x2="18" y2="18" />
              </svg>
              Remove box
            </button>
          </div>
        )}
      </div>

      {showSigModal && (
        <SignatureModal
          onClose={() => setShowSigModal(false)}
          onUpload={(url) => { setSignatureDataUrl(url); setShowEmptyBox(false); }}
          onShowEmpty={() => setShowEmptyBox(true)}
        />
      )}
    </div>
  );
}