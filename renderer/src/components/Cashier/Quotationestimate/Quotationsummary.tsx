import { useState } from "react";
import { AdditionalCharge, CHARGE_TAX_OPTIONS } from "./Quotationtypes";
import "./QuotationSummary.css";

interface QuotationSummaryProps {
  subtotal: number;
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
  const [showRoundOffMenu, setShowRoundOffMenu] = useState(false);

  // ── Calculations ──────────────────────────────────────────────────
  const chargesTotal = additionalCharges.reduce((s, c) => s + c.amount, 0);
  const taxableAmount = subtotal + chargesTotal;

  const discountValue =
    discountPct > 0
      ? (taxableAmount * discountPct) / 100
      : discountAmt;

  const afterDiscount = taxableAmount - discountValue;
  const roundOffValue = roundOff === "none" ? 0 : roundOff === "+Add" ? roundOffAmt : -roundOffAmt;
  const total = afterDiscount + roundOffValue;

  // ── Charge helpers ────────────────────────────────────────────────
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
      {/* Additional charges */}
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
              value={charge.amount}
              onChange={(e) => updateCharge(charge.id, "amount", Number(e.target.value))}
            />
          </div>
          <div className="qs-charge-tax-wrap">
            <select
              className="qs-charge-tax"
              value={charge.taxLabel}
              onChange={(e) => updateCharge(charge.id, "taxLabel", e.target.value)}
            >
              {CHARGE_TAX_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <button className="qs-charge-remove" onClick={() => removeCharge(charge.id)}>⊗</button>
        </div>
      ))}

      <button className="qs-add-charge-btn" onClick={addCharge}>
        + Add Additional Charges
      </button>

      {/* Taxable Amount */}
      <div className="qs-summary-row">
        <span className="qs-summary-label">Taxable Amount</span>
        <span className="qs-summary-val">₹ {taxableAmount.toLocaleString("en-IN")}</span>
      </div>

      {/* Discount */}
      {!showDiscount ? (
        <button className="qs-add-discount-btn" onClick={() => onToggleDiscount(true)}>
          + Add Discount
        </button>
      ) : (
        <div className="qs-discount-row">
          {/* Type dropdown */}
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
                {(["Discount Before Tax", "Discount After Tax"] as const).map((t) => (
                  <div
                    key={t}
                    className={`qs-discount-menu-item ${discountType === t ? "qs-discount-menu-item--active" : ""}`}
                    onClick={() => {
                      onDiscountTypeChange(t);
                      setShowDiscountTypeMenu(false);
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="qs-discount-fields">
            <div className="qs-discount-field-wrap">
              <span className="qs-pct-symbol">%</span>
              <input
                className="qs-discount-input"
                type="number"
                value={discountPct}
                onChange={(e) => {
                  onDiscountPctChange(Number(e.target.value));
                  onDiscountAmtChange(0);
                }}
              />
            </div>
            <span className="qs-slash">/</span>
            <div className="qs-discount-field-wrap">
              <span className="qs-rs-sym">₹</span>
              <input
                className="qs-discount-input"
                type="number"
                value={discountAmt}
                onChange={(e) => {
                  onDiscountAmtChange(Number(e.target.value));
                  onDiscountPctChange(0);
                }}
              />
            </div>
          </div>
          <button className="qs-discount-remove" onClick={() => onToggleDiscount(false)}>⊗</button>
        </div>
      )}

      {/* Discount shown as line */}
      {showDiscount && discountValue > 0 && (
        <div className="qs-summary-row">
          <span className="qs-summary-label" />
          <span className="qs-discount-line">- ₹ {discountValue.toFixed(0)}</span>
        </div>
      )}

      {/* Auto Round Off */}
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
          {/* Mode dropdown */}
          <div className="qs-round-mode-wrap">
            <button
              className="qs-round-mode-btn"
              onClick={() => setShowRoundOffMenu(!showRoundOffMenu)}
            >
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
                    onClick={() => {
                      onRoundOffChange(m, roundOffAmt);
                      setShowRoundOffMenu(false);
                    }}
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
            value={roundOffAmt}
            onChange={(e) => onRoundOffChange(roundOff === "none" ? "+Add" : roundOff, Number(e.target.value))}
          />
        </div>
      </div>

      {/* Total */}
      <div className="qs-total-row">
        <span className="qs-total-label">Total Amount</span>
        <span className="qs-total-val">
          ₹ {total.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
        </span>
      </div>

      {/* Payment amount placeholder */}
      <div className="qs-payment-row">
        <div className="qs-payment-placeholder">Enter Payment amount</div>
      </div>

      {/* Authorized signatory */}
      <div className="qs-signatory">
        <span>Authorized signatory for <strong>scratchweb.solutions</strong></span>
        <div className="qs-sign-box" />
      </div>
    </div>
  );
}