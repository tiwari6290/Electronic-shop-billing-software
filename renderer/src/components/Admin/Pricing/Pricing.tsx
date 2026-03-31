import React, { useState } from "react";
import "./Pricing.css";
import PlanCheckout from "../Plancheckout/Plancheckout";

const CheckIcon = () => (
  <svg className="feature-icon check" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="10" fill="#22c55e" opacity="0.15" />
    <path d="M6 10l3 3 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CrossIcon = () => (
  <svg className="feature-icon cross" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="10" fill="#ef4444" opacity="0.12" />
    <path d="M7 7l6 6M13 7l-6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const StarIcon = ({ filled = true, half = false }) => (
  <svg viewBox="0 0 20 20" className={`star ${half ? "half" : ""}`} fill={filled ? "#f59e0b" : "#e5e7eb"}>
    <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.62l5.34-.78z" />
  </svg>
);

const plans = [
  {
    name: "Diamond Plan",
    tagline: "Essential plan for small business owners",
    tagClass: "diamond-tag",
    originalMonthly: "₹301",
    price: "₹217",
    period: "/month",
    originalYearly: "₹3,610",
    yearly: "₹2,599/year",
    discount: "28% Off",
    discountClass: "badge-orange",
    btnLabel: "Buy Diamond Plan",
    btnClass: "btn-diamond",
    badge: null,
    features: {
      manage: "Manage 1 Business",
      users: "Access for 1 User + 1 CA",
      sync: "Auto sync data across unlimited devices",
      access: "Access on Android, iOS & Web",
      exclusiveTitle: "Features Exclusive to Diamond Plan",
      exclusiveTitleClass: "diamond-exclusive",
      exclusive: [
        "Custom Invoice Themes",
        "Generate and print barcodes (A4 only)",
        "Create your Online Store",
        "Add your CA",
      ],
      unavailable: [
        "Desktop App for Fast and Convenient Use",
        "E-way Bills",
        "Generate e-Invoices",
        "POS Billing",
        "Staff Attendance & Payroll",
        "Create Unlimited Godowns",
        "User Activity Tracker",
        "Automated Billing",
        "WhatsApp & SMS Marketing",
        "Loyalty and Rewards",
        "Bulk Download & Bulk Print Invoices",
        "Data Export to Tally",
      ],
    },
  },
  {
    name: "Platinum Plan",
    tagline: "More users, more flexibility, and a Desktop app",
    tagClass: "platinum-tag",
    originalMonthly: "₹417",
    price: "₹250",
    period: "/month",
    originalYearly: "₹4,990",
    yearly: "₹2,999/year",
    discount: "40% Off",
    discountClass: "badge-green",
    btnLabel: "Buy Platinum Plan",
    btnClass: "btn-platinum",
    badge: "Most Popular",
    features: {
      manage: "Manage 2 Businesses",
      users: "Access for 3 Users + 1 CA",
      sync: "Auto sync data across unlimited devices",
      access: "Access on Android, iOS, Web & Desktop",
      exclusiveTitle: "Features Exclusive to Platinum Plan",
      exclusiveTitleClass: "platinum-exclusive",
      exclusive: [
        "Desktop App for Fast and Convenient Use",
        "Custom Invoice Themes",
        "E-way Bills (50/year)",
        "Staff Attendance & Payroll",
        "Create Unlimited Godowns",
        "Generate and print barcodes (A4 only)",
        "Create your Online Store",
        "WhatsApp & SMS Marketing (500 SMS/Year)",
        "Bulk Download & Bulk Print Invoices",
        "Add your CA",
      ],
      unavailable: [
        "Generate e-Invoices",
        "POS Billing",
        "User Activity Tracker",
        "Automated Billing",
        "Loyalty and Rewards",
        "Data Export to Tally",
      ],
    },
  },
  {
    name: "Enterprise Plan",
    tagline: "Fully customizable for bigger businesses",
    tagClass: "enterprise-tag",
    originalMonthly: "₹718",
    price: "₹417",
    period: "/month",
    originalYearly: "₹8,619",
    yearly: "₹4,999/year",
    discount: "42% Off",
    discountClass: "badge-green",
    btnLabel: "Buy Enterprise Plan",
    btnClass: "btn-enterprise",
    badge: null,
    startingAt: true,
    features: {
      manage: "Manage 2 Businesses (Upgrade to add more)",
      users: "Access for 3 Users (Upgrade to add more) + 1 CA",
      sync: "Auto sync data across unlimited devices",
      access: "Access on Android, iOS, Web & Desktop",
      exclusiveTitle: "Features Exclusive to Enterprise Plan",
      exclusiveTitleClass: "enterprise-exclusive",
      exclusive: [
        "Desktop App for Fast and Convenient Use",
        "Custom Invoice Themes",
        "E-way Bills (Unlimited)",
        "Generate e-Invoices",
        "POS Billing (Desktop App, Web app)",
        "Staff Attendance & Payroll",
        "Create Unlimited Godowns",
        "Generate and print barcodes (A4 only)",
        "Data Export to Tally (On request)",
        "User Activity Tracker",
        "Automated Billing",
        "Create your Online Store",
        "WhatsApp & SMS Marketing (1000 SMS/Year)",
        "Loyalty and Rewards",
        "Bulk Download & Bulk Print Invoices",
        "Add your CA",
      ],
      unavailable: [],
    },
  },
];

const commonFeatures = [
  { label: "Unlimited Reports", icon: "📄" },
  { label: "Customer Relation Management (CRM)", icon: "🤝" },
  { label: "Foreign Currency", icon: "💰" },
  { label: "Create Unlimited Invoices", icon: "🧾" },
  { label: "Manage Multiple Bank Accounts", icon: "🏦" },
  { label: "Manage Inventory easily with Stock Adjustments", icon: "📦" },
  { label: "GSTR in JSON Format", icon: "📋" },
  { label: "Remove myBillBook Branding from Invoice & Online store", icon: "🏷️" },
  { label: "Use Advanced GST themes for Bills", icon: "🎨" },
  { label: "Recover Deleted Invoices", icon: "🗑️" },
  { label: "Take Thermal Printouts", icon: "🖨️" },
  { label: "Create Invoices by scanning barcodes", icon: "📷" },
  { label: "Create unlimited Proforma Invoices", icon: "📝" },
  { label: "Get priority support from our team", icon: "🎧" },
  { label: "Bulk Edit your items on myBillBook Desktop", icon: "✏️" },
];

const reviews = [
  {
    name: "Rohi",
    initial: "R",
    color: "#2d6a4f",
    text: "Best app for handling multiple business. Thank you myBillBook for making my business very smooth.",
    stars: 5,
  },
  {
    name: "Kasim",
    initial: "K",
    color: "#4a3728",
    text: "I was damn tired of bills and manual stuff. Really wanna appreciate BillBook app for making business grow seemlessly. It really has best features to support businesses to grow further.",
    stars: 5,
  },
  {
    name: "Raj",
    initial: "R",
    color: "#2d6a4f",
    text: "I am using this software since a year now. It helped me in timely payment collection through reminder option. Money rotation became very convenient for me to purchase new stocks. I can now keep a track of all the fast moving items very easily in this app. Amazing app",
    stars: 5,
  },
  {
    name: "Vignesh",
    initial: "V",
    color: "#1e3a5f",
    text: "Excellent Product. I am using this for the past 2 years. Really useful for small businesses.",
    stars: 4,
  },
];

const checkoutPlans: Record<string, {
  name: string; price: number; originalPrice: number;
  monthlyPrice: number; discount: number;
  defaultBusinesses: number; defaultUsers: number;
  color: string; badgeClass: string;
}> = {
  "Diamond Plan": {
    name: "Diamond Plan", price: 2599, originalPrice: 3610,
    monthlyPrice: 217, discount: 28,
    defaultBusinesses: 1, defaultUsers: 1,
    color: "#e05a2b", badgeClass: "diamond-badge",
  },
  "Platinum Plan": {
    name: "Platinum Plan", price: 2999, originalPrice: 4990,
    monthlyPrice: 250, discount: 40,
    defaultBusinesses: 2, defaultUsers: 3,
    color: "#6366f1", badgeClass: "platinum-badge",
  },
  "Enterprise Plan": {
    name: "Enterprise Plan", price: 4999, originalPrice: 8619,
    monthlyPrice: 417, discount: 42,
    defaultBusinesses: 2, defaultUsers: 3,
    color: "#059669", badgeClass: "enterprise-badge",
  },
};

export default function Pricing() {
  const [commonOpen, setCommonOpen] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  if (selectedPlan) {
    return (
      <PlanCheckout
        plan={checkoutPlans[selectedPlan]}
        onBack={() => setSelectedPlan(null)}
      />
    );
  }

  const visibleReviews = reviews.slice(reviewIndex, reviewIndex + 3);

  return (
    <div className="pricing-root">
      {/* Trial Banner */}
      <div className="trial-banner">
        <div className="trial-banner-content">
          <p className="trial-title">
            Your trial will expire on 26 Feb. You have{" "}
            <span className="trial-days">8 Days left</span>
          </p>
          <p className="trial-subtitle">
            Choose the best plan to continue using myBillBook without any interruption
          </p>
          <div className="trial-guarantee">
            <span className="guarantee-badge">100%</span>
            <span className="guarantee-text">
              <strong>7 days</strong> moneyback guarantee
            </span>
          </div>
        </div>
        <span className="current-plan-label">Current Plan</span>
      </div>

      {/* Plan Cards */}
      <div className="plans-container">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`plan-card ${plan.badge ? "plan-card--popular" : ""}`}
          >
            {plan.badge && (
              <div className="popular-badge">
                <span className="popular-badge-icon">👑</span> {plan.badge}
              </div>
            )}
            <h2 className="plan-name">{plan.name}</h2>
            <p className={`plan-tagline ${plan.tagClass}`}>{plan.tagline}</p>

            <div className="plan-pricing">
              <span className="plan-original">
                {plan.startingAt ? "Starting @" : ""}
                <s>{plan.originalMonthly}</s>
              </span>
              <span className="plan-price">
                {plan.price}
                <span className="plan-period">{plan.period}</span>
              </span>
            </div>
            <div className="plan-yearly">
              Billed Annually <s className="yearly-original">{plan.originalYearly}</s>{" "}
              <strong>{plan.yearly}</strong>{" "}
              <span className={`discount-badge ${plan.discountClass}`}>
                {plan.discount}
              </span>
            </div>

            <button className={`plan-btn ${plan.btnClass}`} onClick={() => setSelectedPlan(plan.name)}>{plan.btnLabel}</button>
            {(plan.name === "Platinum Plan" || plan.name === "Enterprise Plan") && (
              <p className="talk-to-sales">
                🔵 Up to 60% off · Talk to Sales
              </p>
            )}

            <div className="plan-meta">
              <p>{plan.features.manage}</p>
              <p>{plan.features.users}</p>
              <p>
                Auto sync <strong>data across unlimited devices</strong>
              </p>
              <p>Access on {plan.features.access.replace("Access on ", "")}</p>
            </div>

            <p className={`exclusive-title ${plan.features.exclusiveTitleClass}`}>
              {plan.features.exclusiveTitle}
            </p>

            <ul className="exclusive-list">
              {plan.features.exclusive.map((f) => (
                <li key={f} className="feature-item">
                  <CheckIcon />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {plan.features.unavailable.length > 0 && (
              <ul className="unavailable-list">
                {plan.features.unavailable.map((f) => (
                  <li key={f} className="feature-item feature-item--unavailable">
                    <CrossIcon />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Common Features Accordion */}
      <div className="common-features-accordion">
        <button
          className="accordion-header"
          onClick={() => setCommonOpen((o) => !o)}
        >
          <span>Common features available for all plans</span>
          <span className="accordion-chevron">{commonOpen ? "∧" : "∨"}</span>
        </button>
        {commonOpen && (
          <div className="accordion-body">
            <div className="common-grid">
              {commonFeatures.slice(0, Math.ceil(commonFeatures.length / 2)).map((f) => (
                <div key={f.label} className="common-item">
                  <span className="common-icon">{f.icon}</span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
            <div className="common-grid">
              {commonFeatures.slice(Math.ceil(commonFeatures.length / 2)).map((f) => (
                <div key={f.label} className="common-item">
                  <span className="common-icon">{f.icon}</span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="reviews-section">
        <div className="reviews-rating">
          <div className="stars-row">
            {[1, 2, 3, 4].map((i) => <StarIcon key={i} />)}
            <StarIcon half />
          </div>
          <p className="rating-text">4.5 Rating on Google Play</p>
          <div className="review-avatars">
            <div className="avatar-stack">
              {["#e07b39", "#5e8b3e", "#3a6ea8"].map((c, i) => (
                <div key={i} className="avatar-dot" style={{ background: c }} />
              ))}
            </div>
            <span className="review-count">1.1L Reviews</span>
          </div>
        </div>

        <div className="review-cards-wrapper">
          <button
            className="review-nav-btn"
            onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))}
            disabled={reviewIndex === 0}
          >
            ←
          </button>
          <div className="review-cards">
            {visibleReviews.map((r) => (
              <div key={r.name} className="review-card">
                <div className="review-header">
                  <div
                    className="reviewer-avatar"
                    style={{ background: r.color }}
                  >
                    {r.initial}
                  </div>
                  <span className="reviewer-name">{r.name}</span>
                </div>
                <p className="review-text">{r.text}</p>
                <div className="review-stars">
                  {Array.from({ length: r.stars }).map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                  {Array.from({ length: 5 - r.stars }).map((_, i) => (
                    <StarIcon key={i} filled={false} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            className="review-nav-btn"
            onClick={() =>
              setReviewIndex(Math.min(reviews.length - 3, reviewIndex + 1))
            }
            disabled={reviewIndex >= reviews.length - 3}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}