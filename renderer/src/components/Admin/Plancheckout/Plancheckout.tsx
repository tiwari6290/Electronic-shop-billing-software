import React, { useState } from "react";
import "./PlanCheckout.css";

interface PlanCheckoutProps {
  plan: {
    name: string;
    price: number;
    originalPrice: number;
    monthlyPrice: number;
    discount: number;
    defaultBusinesses: number;
    defaultUsers: number;
    color: string;
    badgeClass: string;
  };
  onBack: () => void;
}

const planDurations = [
  { label: "1 Year", multiplier: 1, extraDiscount: 0 },
  { label: "2 Years", multiplier: 2, extraDiscount: 15 },
  { label: "3 Years", multiplier: 3, extraDiscount: 20 },
  { label: "5 Years", multiplier: 5, extraDiscount: 30 },
  { label: "10 Years", multiplier: 10, extraDiscount: 40 },
];

const coupons = [
  { code: "DISCOUNT15", desc: "Get 15% off on buying a 2 year plan." },
  { code: "DISCOUNT20", desc: "Get 20% off on buying a 3 year plan." },
  { code: "DISCOUNT30", desc: "Get 30% off on buying a 5 year plan." },
  { code: "DISCOUNT40", desc: "Get 40% off on buying a 10 year plan." },
];

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

// ─── Billing Modal ────────────────────────────────────────────────────────────
function BillingModal({ onClose }: { onClose: () => void }) {
  const [businessName, setBusinessName]     = useState("mondal electronic");
  const [state, setState]                   = useState("");
  const [pincode, setPincode]               = useState("");
  const [hasGSTIN, setHasGSTIN]             = useState(false);
  const [gstNumber, setGstNumber]           = useState("");
  const [streetAddress, setStreetAddress]   = useState("");
  const [city, setCity]                     = useState("");
  const [stateOpen, setStateOpen]           = useState(false);
  const [stateSearch, setStateSearch]       = useState("");

  const filteredStates = indianStates.filter(s =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-box">

        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">Confirm Billing Details</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="modal-body">

          {/* Business Name */}
          <div className="modal-field">
            <label className="modal-label">
              Business Name<span className="req">*</span>
            </label>
            <input
              className="modal-input"
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              placeholder="Enter business name"
            />
          </div>

          {/* State + Pincode row */}
          <div className="modal-row">
            <div className="modal-field modal-field--grow">
              <label className="modal-label">
                State<span className="req">*</span>
              </label>
              <div className="state-select-wrapper">
                <div className="state-select" onClick={() => setStateOpen(o => !o)}>
                  <span className={state ? "state-value" : "state-placeholder"}>
                    {state || "State"}
                  </span>
                  <div className="state-actions">
                    {state && (
                      <button
                        className="state-clear"
                        onClick={e => {
                          e.stopPropagation();
                          setState("");
                          setStateSearch("");
                        }}
                      >
                        ✕
                      </button>
                    )}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 5l4 4 4-4" stroke="#64748b" strokeWidth="1.5"
                            strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                {stateOpen && (
                  <div className="state-dropdown">
                    <input
                      className="state-search"
                      placeholder="Search state..."
                      value={stateSearch}
                      onChange={e => setStateSearch(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      autoFocus
                    />
                    <ul className="state-list">
                      {filteredStates.map(s => (
                        <li
                          key={s}
                          className={`state-option ${s === state ? "state-option--active" : ""}`}
                          onClick={() => {
                            setState(s);
                            setStateOpen(false);
                            setStateSearch("");
                          }}
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-field">
              <label className="modal-label">Pincode</label>
              <input
                className="modal-input"
                type="text"
                maxLength={6}
                value={pincode}
                onChange={e => setPincode(e.target.value.replace(/\D/g, ""))}
                placeholder="Eg. 400001"
              />
            </div>
          </div>

          {/* GSTIN Checkbox */}
          <label className="gstin-checkbox">
            <input
              type="checkbox"
              checked={hasGSTIN}
              onChange={e => setHasGSTIN(e.target.checked)}
            />
            <span>Have a GSTIN? Request a B2B invoice for this purchase</span>
          </label>

          {/* Conditional GSTIN Fields */}
          {hasGSTIN && (
            <>
              <div className="modal-field">
                <label className="modal-label">
                  GST Number<span className="req">*</span>
                </label>
                <input
                  className="modal-input"
                  type="text"
                  value={gstNumber}
                  onChange={e => setGstNumber(e.target.value.toUpperCase())}
                  placeholder="Eg. 24AABCS1234A1Z5"
                  maxLength={15}
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">
                  Street Address<span className="req">*</span>
                </label>
                <input
                  className="modal-input"
                  type="text"
                  value={streetAddress}
                  onChange={e => setStreetAddress(e.target.value)}
                  placeholder="Ex: 15, Hill View Apt, Lbsm Marg, Vikhroli, Mumbai"
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">
                  City<span className="req">*</span>
                </label>
                <input
                  className="modal-input"
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Eg. Mumbai"
                />
              </div>

              <div className="gstin-notice">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7.5" stroke="#64748b" />
                  <path d="M8 5v3M8 10v.5" stroke="#64748b" strokeWidth="1.5"
                        strokeLinecap="round" />
                </svg>
                <span>
                  Please ensure correct details are entered so that a valid
                  e-invoice can be generated.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="modal-submit">Submit</button>
        </div>

      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PlanCheckout({ plan, onBack }: PlanCheckoutProps) {
  const [durationIndex, setDurationIndex]     = useState(0);
  const [businesses, setBusinesses]           = useState(plan.defaultBusinesses);
  const [users, setUsers]                     = useState(plan.defaultUsers);
  const [couponCode, setCouponCode]           = useState("");
  const [appliedCoupon, setAppliedCoupon]     = useState<string | null>(null);
  const [durationOpen, setDurationOpen]       = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);   // ← NEW

  const selectedDuration = planDurations[durationIndex];

  // Compute expiry date
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + selectedDuration.multiplier);
  const expiryStr = expiryDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Price calculations
  const originalPrice  = plan.originalPrice * selectedDuration.multiplier;
  const discountAmount = Math.round((originalPrice * plan.discount) / 100);
  const afterDiscount  = originalPrice - discountAmount;
  const tax            = Math.round(afterDiscount * 0.18);
  const totalPrice     = afterDiscount + tax;

  const handleApplyCoupon = (code?: string) => {
    const c = code || couponCode;
    if (c) {
      setAppliedCoupon(c.toUpperCase());
      if (!code) setCouponCode(c.toUpperCase());
    }
  };

  return (
    <>
      <div className="checkout-root">
        {/* Left Panel */}
        <div className="checkout-left">

          {/* Step 1: Selected Plan */}
          <div className="checkout-card">
            <div className="checkout-card-header">
              <div className="step-info">
                <span className="step-check">
                  <svg viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="11" r="11" fill="#22c55e" />
                    <path d="M6.5 11l3 3 6-6" stroke="#fff" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="step-label">Selected Plan</span>
                <span className={`plan-chip ${plan.badgeClass}`}>
                  👑 {plan.name}
                </span>
              </div>
            </div>

            <div className="selected-plan-row">
              <div>
                <p className={`selected-plan-name ${plan.badgeClass}`}>
                  {plan.name}
                </p>
                <p className="selected-plan-expiry">plan expires by {expiryStr}</p>
              </div>
              <div className="selected-plan-price-col">
                <span className="selected-plan-price">
                  ₹{afterDiscount.toLocaleString("en-IN")}
                </span>
                <span className="selected-plan-monthly">
                  @₹{plan.monthlyPrice} / month
                </span>
              </div>
            </div>
          </div>

          {/* Step 2: Customise Plan */}
          <div className="checkout-card">
            <div className="checkout-card-header">
              <div className="step-info">
                <span className="step-number">2</span>
                <span className="step-label">Customise plan</span>
              </div>
            </div>

            {/* Plan Duration */}
            <div className="customise-row">
              <label className="customise-label">
                Plan Duration{" "}
                <span className="expiry-hint">(will expire on {expiryStr})</span>
              </label>
              <div className="custom-select-wrapper">
                <button
                  className="custom-select"
                  onClick={() => setDurationOpen((o) => !o)}
                >
                  {selectedDuration.label}
                </button>
                {durationOpen && (
                  <ul className="custom-select-dropdown">
                    {planDurations.map((d, i) => (
                      <li
                        key={d.label}
                        className={`custom-select-option ${i === durationIndex ? "selected" : ""}`}
                        onClick={() => {
                          setDurationIndex(i);
                          setDurationOpen(false);
                        }}
                      >
                        {d.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Promo Banner */}
            <div className="promo-banner">
              <span className="promo-icon">✅</span>
              Buy 2, 3, 5 or 10 year plan to get upto 40% off
              <span className="promo-arrow">↗</span>
            </div>

            {/* Number of Businesses */}
            <div className="customise-row stepper-row">
              <label className="customise-label">Number of Businesses</label>
              <div className="stepper">
                <button
                  className="stepper-btn"
                  onClick={() =>
                    setBusinesses((b) => Math.max(plan.defaultBusinesses, b - 1))
                  }
                >
                  −
                </button>
                <span className="stepper-value">
                  {businesses} {businesses === 1 ? "Business" : "Businesses"}
                </span>
                <button
                  className="stepper-btn"
                  onClick={() => setBusinesses((b) => b + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Number of Users */}
            <div className="customise-row stepper-row">
              <label className="customise-label">Number of Users</label>
              <div className="stepper">
                <button
                  className="stepper-btn"
                  onClick={() =>
                    setUsers((u) => Math.max(plan.defaultUsers, u - 1))
                  }
                >
                  −
                </button>
                <span className="stepper-value">
                  {users} {users === 1 ? "User" : "Users"}
                </span>
                <button
                  className="stepper-btn"
                  onClick={() => setUsers((u) => u + 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Price Details */}
        <div className="checkout-right">
          <h2 className="price-details-title">Price Details</h2>

          <div className="price-detail-card">
            <div className="price-row price-row--total-top">
              <span>Total Price</span>
              <span className="price-val-bold">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="price-divider" />
            <div className="price-row">
              <span>Original Price</span>
              <span>₹{originalPrice.toLocaleString("en-IN")}</span>
            </div>
            <div className="price-row discount-row">
              <span>Discount on MRP ({plan.discount}%)</span>
              <span className="discount-val">
                - ₹{discountAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="price-row">
              <span>After Discount Price</span>
              <span>₹{afterDiscount.toLocaleString("en-IN")}</span>
            </div>
            <div className="price-row">
              <span>Tax (18%)</span>
              <span>₹{tax.toLocaleString("en-IN")}</span>
            </div>
            <div className="price-row savings-row">
              <span>Total Savings</span>
              <span className="savings-val">
                ₹{discountAmount.toLocaleString("en-IN")}
              </span>
            </div>

            {/* ← UPDATED: opens billing modal */}
            <button
              className="make-payment-btn"
              onClick={() => setShowBillingModal(true)}
            >
              Make Payment
            </button>
          </div>

          {/* Coupon Section */}
          <div className="coupon-card">
            <div className="coupon-header">
              <span className="coupon-tag-icon">🏷️</span>
              <span className="coupon-title">Apply Coupon or Discount Code</span>
            </div>
            <div className="coupon-input-row">
              <input
                className="coupon-input"
                type="text"
                placeholder="Enter Coupon Code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button
                className="coupon-apply-btn"
                onClick={() => handleApplyCoupon()}
              >
                Apply
              </button>
            </div>

            <ul className="coupon-list">
              {coupons.map((c) => (
                <li key={c.code} className="coupon-item">
                  <div>
                    <span className="coupon-code">{c.code}</span>
                    <p className="coupon-desc">{c.desc}</p>
                  </div>
                  <button
                    className="coupon-apply-link"
                    onClick={() => handleApplyCoupon(c.code)}
                  >
                    Apply
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ─── Billing Modal (mounts when Make Payment is clicked) ─── */}
      {showBillingModal && (
        <BillingModal onClose={() => setShowBillingModal(false)} />
      )}
    </>
  );
}