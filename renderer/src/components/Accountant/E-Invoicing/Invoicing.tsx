import { useState } from "react";
import "./Invoicing.css";

// ─── Modal 1: Add GST Suvidha Provider ───────────────────────────────────────
const GSTModal = ({ onClose, onNext }: { onClose: () => void; onNext: () => void }) => (
  <div className="ei-modal-overlay" onClick={onClose}>
    <div className="ei-modal" onClick={(e) => e.stopPropagation()}>
      <div className="ei-modal__header">
        <span className="ei-modal__title">Add GST Suvidha Provider</span>
        <button className="ei-modal__close" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="ei-modal__body">
        {/* Left video */}
        <div className="ei-modal__video">
          <div className="ei-modal__video-title">How to generate e-invoices?</div>
          <div className="ei-modal__video-sub">Watch video on how to add API user on IRP to generate e-invoices</div>
          <button className="ei-modal__watch-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444">
              <path d="M19.615 3.184C16.011 2.938 7.984 2.938 4.38 3.184 0.49 3.45 0.029 5.804 0 12c.029 6.185.484 8.549 4.38 8.816 3.604.246 11.631.246 15.235 0C23.51 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 3.993L9 16z"/>
            </svg>
            Watch Now
          </button>
        </div>

        {/* Right steps */}
        <div className="ei-modal__right">
          <p>Add Masters India as your GST Suvidha Provider in order to generate e-Invoices on myBillBook.</p>
          <div className="ei-steps">
            <div className="ei-step">Log in to the e-invoice portal <strong>https://einvoice1.gst.gov.in/</strong></div>
            <div className="ei-step">From the main menu <strong>'API registration'</strong>.</div>
            <div className="ei-step">Click on the <strong>'Create API User'</strong> tab under User Credentials in the API registration menu.</div>
            <div className="ei-step">In the API registration form, select <strong>'through GSP'</strong> to integrate the APIs through GSP.</div>
            <div className="ei-step">Select <strong>Masters India</strong> from the drop-down list.</div>
            <div className="ei-step">Select the <strong>username and password for GSP</strong> and click submit.</div>
          </div>
          <button className="ei-modal__pdf-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            How to Add GSP on e-Invoice portal
          </button>
          <button className="ei-modal__main-btn" onClick={onNext}>
            Add GSP Username &amp; Password →
          </button>
        </div>
      </div>

      <div className="ei-modal__footer">
        Facing issue with e-Invoice? <a href="#">Chat with us</a> Or Call us at <a href="#">7400417400</a>
      </div>
    </div>
  </div>
);

// ─── Modal 2: Add GSP Details ─────────────────────────────────────────────────
const GSPDetailsModal = ({ onClose }: { onClose: () => void }) => {
  const [gstin, setGstin] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="ei-modal-overlay" onClick={onClose}>
      <div className="ei-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ei-modal__header">
          <span className="ei-modal__title">Add GSP details to generate e-Invoicing</span>
          <button className="ei-modal__close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="ei-modal__body">
          {/* Left video */}
          <div className="ei-modal__video">
            <div className="ei-modal__video-title">How to generate e-invoices?</div>
            <div className="ei-modal__video-sub">Watch video on how to add API user on IRP to generate e-invoices</div>
            <button className="ei-modal__watch-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444">
                <path d="M19.615 3.184C16.011 2.938 7.984 2.938 4.38 3.184 0.49 3.45 0.029 5.804 0 12c.029 6.185.484 8.549 4.38 8.816 3.604.246 11.631.246 15.235 0C23.51 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 3.993L9 16z"/>
              </svg>
              Watch Now
            </button>
          </div>

          {/* Right form */}
          <div className="ei-modal__right">
            <p style={{ fontWeight: 600, color: "#1e2640", fontSize: 14 }}>Enter your IRP details</p>

            <div className="ei-form-group">
              <label className="ei-form-label">GSTIN No</label>
              <input className="ei-form-input" placeholder="ex - GSTIN1234567890" value={gstin} onChange={(e) => setGstin(e.target.value)} />
            </div>

            <div className="ei-form-hint">
              Enter the GSP username and password from the e-Invoice Portal
            </div>

            <div className="ei-form-group">
              <label className="ei-form-label">GSP Username</label>
              <input className="ei-form-input" placeholder="Enter Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>

            <div className="ei-form-group">
              <label className="ei-form-label">GSP Password</label>
              <div className="ei-password-wrapper">
                <input
                  className="ei-form-input"
                  type={showPass ? "text" : "password"}
                  placeholder="Enter GSP password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button className="ei-password-toggle" onClick={() => setShowPass(!showPass)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showPass
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            <button className="ei-modal__main-btn" onClick={onClose}>
              Save GSP Details
            </button>
          </div>
        </div>

        <div className="ei-modal__footer">
          Facing issue with e-Invoice? <a href="#">Chat with us</a> Or Call us at <a href="#">7400417400</a>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const EInvoicing = () => {
  const [showGSTModal, setShowGSTModal] = useState(false);
  const [showGSPModal, setShowGSPModal] = useState(false);

  const handleNext = () => {
    setShowGSTModal(false);
    setShowGSPModal(true);
  };

  return (
    <div className="einvoice-page">
      {/* Navbar */}
      <div className="einvoice-navbar">
        <div className="einvoice-navbar__left">
          <span className="einvoice-navbar__title">e-Invoicing</span>
          <button className="einvoice-navbar__tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            What is e-Invoicing
          </button>
        </div>
        <button className="einvoice-navbar__support">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Chat Support
        </button>
      </div>

      {/* Body */}
      <div className="einvoice-body">
        <div className="einvoice-cards">
          {/* Card 1 */}
          <div className="einvoice-card">
            <div className="einvoice-card__img">
              <svg viewBox="0 0 120 120" fill="none">
                <rect x="20" y="10" width="80" height="100" rx="6" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="2"/>
                <rect x="30" y="25" width="60" height="8" rx="3" fill="#7dd3fc"/>
                <rect x="30" y="40" width="45" height="5" rx="2" fill="#bae6fd"/>
                <rect x="30" y="52" width="50" height="5" rx="2" fill="#bae6fd"/>
                <rect x="30" y="64" width="40" height="5" rx="2" fill="#bae6fd"/>
                <rect x="55" y="75" width="30" height="25" rx="3" fill="#fff" stroke="#7dd3fc" strokeWidth="1.5"/>
                <rect x="59" y="79" width="6" height="6" rx="1" fill="#0ea5e9"/>
                <rect x="67" y="79" width="6" height="6" rx="1" fill="#0ea5e9"/>
                <rect x="75" y="79" width="6" height="6" rx="1" fill="#0ea5e9"/>
                <rect x="59" y="87" width="6" height="6" rx="1" fill="#0ea5e9"/>
                <rect x="67" y="87" width="6" height="6" rx="1" fill="#0ea5e9"/>
                <rect x="75" y="87" width="6" height="6" rx="1" fill="#0ea5e9"/>
              </svg>
            </div>
            <div className="einvoice-card__label">Automatic e-invoice generation</div>
          </div>

          {/* Card 2 */}
          <div className="einvoice-card">
            <div className="einvoice-card__img">
              <svg viewBox="0 0 120 120" fill="none">
                <rect x="15" y="15" width="70" height="85" rx="6" fill="#fef9c3" stroke="#fde047" strokeWidth="2"/>
                <rect x="25" y="28" width="50" height="7" rx="3" fill="#fde047"/>
                <rect x="25" y="42" width="38" height="5" rx="2" fill="#fef08a"/>
                <rect x="25" y="54" width="45" height="5" rx="2" fill="#fef08a"/>
                <rect x="25" y="66" width="32" height="5" rx="2" fill="#fef08a"/>
                <ellipse cx="88" cy="82" rx="18" ry="14" fill="#f0fdf4" stroke="#86efac" strokeWidth="2"/>
                <path d="M76 82 Q88 68 100 82" stroke="#4ade80" strokeWidth="2" fill="none"/>
                <circle cx="80" cy="86" r="3" fill="#4ade80"/>
                <circle cx="88" cy="72" r="3" fill="#4ade80"/>
                <circle cx="96" cy="86" r="3" fill="#4ade80"/>
              </svg>
            </div>
            <div className="einvoice-card__label">Hassle e-way bill generation using IRN</div>
          </div>

          {/* Card 3 */}
          <div className="einvoice-card">
            <div className="einvoice-card__img">
              <svg viewBox="0 0 120 120" fill="none">
                <rect x="20" y="15" width="80" height="90" rx="6" fill="#fff7ed" stroke="#fed7aa" strokeWidth="2"/>
                <rect x="30" y="28" width="60" height="35" rx="4" fill="#ffedd5" stroke="#fdba74" strokeWidth="1.5"/>
                <polyline points="35,55 50,38 62,48 75,32 90,42" stroke="#f97316" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <rect x="30" y="72" width="25" height="22" rx="4" fill="#fecdd3"/>
                <rect x="62" y="80" width="25" height="14" rx="4" fill="#bbf7d0"/>
                <circle cx="42" cy="83" r="8" fill="#f43f5e" opacity="0.8"/>
                <circle cx="74" cy="83" r="6" fill="#4ade80" opacity="0.8"/>
              </svg>
            </div>
            <div className="einvoice-card__label">Easy GSTR1 reconciliation</div>
          </div>
        </div>

        {/* CTA */}
        <div className="einvoice-cta">
          <div className="einvoice-cta__text">Try India's easiest and fastest e-invoicing solution today</div>
          <button className="einvoice-cta__btn" onClick={() => setShowGSTModal(true)}>
            Start Generating e-Invoices
          </button>
        </div>
      </div>

      {/* Modals */}
      {showGSTModal && <GSTModal onClose={() => setShowGSTModal(false)} onNext={handleNext} />}
      {showGSPModal && <GSPDetailsModal onClose={() => setShowGSPModal(false)} />}
    </div>
  );
};

export default EInvoicing;