import React, { useState } from "react";
import { ChevronDown, Calendar } from "lucide-react";
import BillForm from "../../Cashier/Billform"; // adjust path as per your project structure
import "./Bills.css";

// ── SVG Illustrations ──────────────────────────────────────────────────────

const IllustrationTired = () => (
  <svg viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="ab-illustration">
    <rect x="30" y="110" width="160" height="8" rx="2" fill="#e5e7eb"/>
    <rect x="50" y="118" width="8" height="30" rx="2" fill="#d1d5db"/>
    <rect x="162" y="118" width="8" height="30" rx="2" fill="#d1d5db"/>
    <rect x="110" y="60" width="60" height="45" rx="4" fill="#374151"/>
    <rect x="114" y="64" width="52" height="37" rx="2" fill="#6366f1" opacity="0.15"/>
    <rect x="118" y="70" width="30" height="3" rx="1" fill="#6366f1" opacity="0.5"/>
    <rect x="118" y="76" width="22" height="2" rx="1" fill="#9ca3af" opacity="0.6"/>
    <rect x="118" y="81" width="26" height="2" rx="1" fill="#9ca3af" opacity="0.6"/>
    <rect x="118" y="86" width="18" height="2" rx="1" fill="#9ca3af" opacity="0.6"/>
    <rect x="134" y="105" width="12" height="8" rx="1" fill="#6b7280"/>
    <rect x="126" y="112" width="28" height="4" rx="2" fill="#6b7280"/>
    <circle cx="75" cy="72" r="14" fill="#fbbf24" opacity="0.8"/>
    <line x1="70" y1="70" x2="73" y2="73" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="73" y1="70" x2="70" y2="73" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="77" y1="70" x2="80" y2="73" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="80" y1="70" x2="77" y2="73" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M70 79 Q75 76 80 79" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <rect x="62" y="86" width="26" height="26" rx="6" fill="#6366f1" opacity="0.7"/>
    <rect x="20" y="42" width="110" height="28" rx="8" fill="#fff" stroke="#e5e7eb" strokeWidth="1.5"/>
    <polygon points="60,70 70,70 65,80" fill="#fff" stroke="#e5e7eb" strokeWidth="1"/>
    <polygon points="61,70 69,70 65,78" fill="#fff"/>
    <text x="75" y="57" textAnchor="middle" fontSize="9" fill="#374151" fontWeight="600">Tired of creating</text>
    <text x="75" y="68" textAnchor="middle" fontSize="9" fill="#374151" fontWeight="600">repeated bills !!!</text>
    <rect x="94" y="98" width="28" height="14" rx="2" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" transform="rotate(-5 94 98)"/>
    <rect x="96" y="96" width="28" height="14" rx="2" fill="#f9fafb" stroke="#d1d5db" strokeWidth="1" transform="rotate(-2 96 96)"/>
    <rect x="98" y="94" width="28" height="14" rx="2" fill="#fff" stroke="#d1d5db" strokeWidth="1"/>
  </svg>
);

const IllustrationAutoSend = () => (
  <svg viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="ab-illustration">
    <rect x="20" y="30" width="50" height="60" rx="4" fill="#fff" stroke="#e5e7eb" strokeWidth="1.5"/>
    <rect x="26" y="38" width="30" height="3" rx="1" fill="#6366f1" opacity="0.5"/>
    <rect x="26" y="44" width="22" height="2" rx="1" fill="#d1d5db"/>
    <rect x="26" y="49" width="26" height="2" rx="1" fill="#d1d5db"/>
    <rect x="26" y="54" width="18" height="2" rx="1" fill="#d1d5db"/>
    <text x="45" y="26" fontSize="8" fill="#6b7280" fontWeight="600">INVOICE 1</text>
    <rect x="155" y="20" width="50" height="60" rx="4" fill="#fff" stroke="#e5e7eb" strokeWidth="1.5"/>
    <rect x="161" y="28" width="30" height="3" rx="1" fill="#6366f1" opacity="0.5"/>
    <rect x="161" y="34" width="22" height="2" rx="1" fill="#d1d5db"/>
    <text x="175" y="16" fontSize="8" fill="#6b7280" fontWeight="600">INVOICE 2</text>
    <rect x="140" y="90" width="50" height="60" rx="4" fill="#fff" stroke="#e5e7eb" strokeWidth="1.5"/>
    <rect x="146" y="98" width="30" height="3" rx="1" fill="#6366f1" opacity="0.5"/>
    <text x="153" y="87" fontSize="8" fill="#6b7280" fontWeight="600">INVOICE 3</text>
    <rect x="88" y="70" width="44" height="40" rx="6" fill="#6366f1" opacity="0.15" stroke="#6366f1" strokeWidth="1.5"/>
    <rect x="96" y="56" width="28" height="22" rx="5" fill="#6366f1" opacity="0.2" stroke="#6366f1" strokeWidth="1.5"/>
    <circle cx="103" cy="65" r="4" fill="#6366f1"/>
    <circle cx="117" cy="65" r="4" fill="#6366f1"/>
    <circle cx="104" cy="64" r="1.5" fill="#fff"/>
    <circle cx="118" cy="64" r="1.5" fill="#fff"/>
    <line x1="110" y1="56" x2="110" y2="48" stroke="#6366f1" strokeWidth="2"/>
    <circle cx="110" cy="46" r="3" fill="#6366f1"/>
    <rect x="72" y="42" width="56" height="16" rx="8" fill="#10b981"/>
    <text x="100" y="53" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="700">Auto Send</text>
    <rect x="72" y="116" width="56" height="16" rx="8" fill="#6366f1"/>
    <text x="100" y="127" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="700">Schedule Bill</text>
    <rect x="78" y="136" width="44" height="16" rx="3" fill="#fff" stroke="#e5e7eb" strokeWidth="1"/>
    <text x="100" y="147" textAnchor="middle" fontSize="9" fill="#374151" fontWeight="700">31</text>
  </svg>
);

const IllustrationReminder = () => (
  <svg viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="ab-illustration">
    <rect x="130" y="30" width="70" height="110" rx="10" fill="#374151"/>
    <rect x="134" y="40" width="62" height="90" rx="4" fill="#f9fafb"/>
    <rect x="138" y="48" width="54" height="32" rx="4" fill="#fff" stroke="#e5e7eb" strokeWidth="1"/>
    <circle cx="146" cy="58" r="5" fill="#6366f1" opacity="0.3"/>
    <rect x="154" y="53" width="30" height="3" rx="1" fill="#374151" opacity="0.7"/>
    <text x="154" y="63" fontSize="7" fill="#6366f1" fontWeight="600">Payment Link</text>
    <rect x="162" y="35" width="44" height="14" rx="7" fill="#ef4444"/>
    <text x="184" y="45" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="700">Reminders</text>
    <rect x="138" y="90" width="54" height="34" rx="4" fill="#fff" stroke="#e5e7eb" strokeWidth="1"/>
    <text x="142" y="107" fontSize="7" fill="#10b981" fontWeight="600">Automated Bill sent</text>
    <text x="142" y="116" fontSize="6" fill="#6b7280">Invoice Amount: ₹500</text>
    <text x="142" y="123" fontSize="6" fill="#6b7280">Sent successfully!</text>
    <circle cx="55" cy="80" r="22" fill="#fbbf24" opacity="0.7"/>
    <rect x="38" y="100" width="34" height="40" rx="8" fill="#6366f1" opacity="0.6"/>
    <rect x="10" y="55" width="68" height="14" rx="7" fill="#fff" stroke="#e5e7eb" strokeWidth="1"/>
    <text x="44" y="65" textAnchor="middle" fontSize="7" fill="#374151" fontWeight="600">Notifications</text>
  </svg>
);

// ── Main Component ─────────────────────────────────────────────────────────

const CreateAutomatedBill: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  const [startDate, setStartDate]               = useState("26 Feb 2026");
  const [endDate, setEndDate]                   = useState("26 Feb 2027");
  const [repeatEvery, setRepeatEvery]           = useState("1");
  const [repeatUnit, setRepeatUnit]             = useState("Weeks");
  const [paymentTerms, setPaymentTerms]         = useState("30");
  const [paymentTermsUnit, setPaymentTermsUnit] = useState("Days");

  // ── Landing Page ──
  if (!showForm) {
    return (
      <div className="ab-page">
        <div className="ab-header">
          <h2 className="ab-title">Automated Bills</h2>
          <button className="ab-what-btn">
            <span className="ab-play-icon">▶</span>
            What is Automated Bills
          </button>
        </div>

        <div className="ab-cards">
          <div className="ab-card">
            <IllustrationTired />
            <p className="ab-card-title">Creating repeated bills?</p>
            <p className="ab-card-desc">Automate sending of repeat bills based on a schedule of your choice</p>
          </div>

          <div className="ab-card ab-card-center">
            <IllustrationAutoSend />
            <p className="ab-card-title">Automated Billing</p>
            <p className="ab-card-desc">Send SMS reminders to customers daily/weekly/monthly</p>
            <p className="ab-tagline">Schedule your repeated bills hassle-free</p>
            <button className="ab-create-btn" onClick={() => setShowForm(true)}>
              Create Automated Bill
            </button>
          </div>

          <div className="ab-card">
            <IllustrationReminder />
            <p className="ab-card-title">Easy Reminders & Payment</p>
            <p className="ab-card-desc">Automatically receive notifications and collect payments</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Create Form ──
  return (
    <div className="cab-page">
      {/* ── Header ── */}
      <div className="cab-header">
        <button className="cab-back-btn" onClick={() => setShowForm(false)}>
          <span className="cab-back-arrow">←</span>
          Create Automated Sales Invoice
        </button>
        <button className="cab-save-btn">Save</button>
      </div>

      {/* ── Schedule Details ── */}
      <div className="cab-schedule-wrapper">
        <div className="cab-card">
          <h3 className="cab-section-title">Schedule Details</h3>
          <div className="cab-schedule-outer">

            {/* Left: 4 fields grid */}
            <div className="cab-schedule-grid">

              {/* Start Date */}
              <div className="cab-field">
                <label className="cab-label">Start Date:</label>
                <div className="cab-date-input">
                  <Calendar size={15} className="cab-cal-icon" />
                  <input
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="cab-input"
                  />
                  <ChevronDown size={14} className="cab-chevron" />
                </div>
              </div>

              {/* End Date */}
              <div className="cab-field">
                <label className="cab-label">End Date:</label>
                <div className="cab-date-input">
                  <Calendar size={15} className="cab-cal-icon" />
                  <input
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="cab-input"
                  />
                  <ChevronDown size={14} className="cab-chevron" />
                </div>
              </div>

              {/* Repeat Every */}
              <div className="cab-field">
                <label className="cab-label">Repeat Every:</label>
                <div className="cab-split-input">
                  <input
                    value={repeatEvery}
                    onChange={(e) => setRepeatEvery(e.target.value)}
                    className="cab-input cab-input-sm"
                  />
                  <select
                    value={repeatUnit}
                    onChange={(e) => setRepeatUnit(e.target.value)}
                    className="cab-select"
                  >
                    <option>Days</option>
                    <option>Weeks</option>
                    <option>Months</option>
                  </select>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="cab-field">
                <label className="cab-label">Payment Terms:</label>
                <div className="cab-split-input">
                  <input
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="cab-input cab-input-sm"
                  />
                  <select
                    value={paymentTermsUnit}
                    onChange={(e) => setPaymentTermsUnit(e.target.value)}
                    className="cab-select"
                  >
                    <option>Days</option>
                    <option>Weeks</option>
                    <option>Months</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Right: Scan Barcode box */}
            <div className="cab-barcode-box">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" rx="1" stroke="#374151" strokeWidth="1"/>
                <line x1="5" y1="5" x2="5" y2="19" stroke="#374151" strokeWidth="2"/>
                <line x1="9" y1="5" x2="9" y2="19" stroke="#374151" strokeWidth="1.5"/>
                <line x1="12" y1="5" x2="12" y2="19" stroke="#374151" strokeWidth="2.5"/>
                <line x1="16" y1="5" x2="16" y2="19" stroke="#374151" strokeWidth="1"/>
                <line x1="19" y1="5" x2="19" y2="19" stroke="#374151" strokeWidth="1.5"/>
              </svg>
              <p className="cab-barcode-label">Scan Barcode</p>
            </div>

          </div>
        </div>
      </div>

      {/* ── BillForm — sidebar hidden via isAutomated={true} ── */}
      <BillForm mode="sale" isAutomated={true} />
    </div>
  );
};

export default CreateAutomatedBill;