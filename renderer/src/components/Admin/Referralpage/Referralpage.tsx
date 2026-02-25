import React, { useState, useRef, useEffect } from "react";
import "./ReferralPage.css";

interface ReferredUser {
  phone: string;
}

/* ── Success Screen ── */
const SuccessModal: React.FC<{
  count: number;
  onDone: () => void;
}> = ({ count, onDone }) => (
  <div className="modal-overlay" onClick={onDone}>
    <div className="modal modal--success" onClick={(e) => e.stopPropagation()}>
      <div className="success__icon-wrap">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#4CAF50" />
          <polyline
            points="5,12 10,17 19,8"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 className="success__title">Referral Invitation Sent!</h2>
      <p className="success__subtitle">
        Sent to {count} friend{count !== 1 ? "s" : ""} on Whatsapp
      </p>
      <button className="success__done-btn" onClick={onDone}>
        Done
      </button>
    </div>
  </div>
);

/* ── Refer Now Modal ── */
const ReferNowModal: React.FC<{
  onClose: () => void;
  onRefer: (users: ReferredUser[]) => void;
}> = ({ onClose, onRefer }) => {
  const [tags, setTags] = useState<ReferredUser[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sent, setSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addTag = () => {
    const val = inputValue.trim();
    if (val && !tags.find((t) => t.phone === val)) {
      setTags((prev) => [...prev, { phone: val }]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const removeTag = (phone: string) =>
    setTags((prev) => prev.filter((t) => t.phone !== phone));

  const handleRefer = () => {
    const val = inputValue.trim();
    const finalTags =
      val && !tags.find((t) => t.phone === val)
        ? [...tags, { phone: val }]
        : tags;
    if (finalTags.length === 0) return;
    onRefer(finalTags);
    setSent(true);
  };

  const hasNumbers = tags.length > 0 || inputValue.trim().length > 0;
  const sentCount = tags.length + (inputValue.trim() ? 1 : 0);

  if (sent) {
    return (
      <SuccessModal
        count={sentCount || tags.length}
        onDone={onClose}
      />
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Refer Now</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__body">
          <div
            className="modal__input-box"
            onClick={() => inputRef.current?.focus()}
          >
            <div className="modal__tags-row">
              {tags.map((tag) => (
                <span key={tag.phone} className="modal__tag">
                  {tag.phone}
                  <button
                    className="modal__tag-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(tag.phone);
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                ref={inputRef}
                className="modal__input"
                type="text"
                placeholder={
                  tags.length === 0 ? "Search Party Name / Phone Number" : ""
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            {tags.length > 0 ? (
              <button
                className="modal__clear-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setTags([]);
                  setInputValue("");
                }}
              >
                ✕
              </button>
            ) : (
              <span className="modal__dropdown-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            )}
          </div>
        </div>

        <div className="modal__footer">
          <button className="modal__btn modal__btn--copy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy Code
          </button>
          <button
            className={`modal__btn modal__btn--refer ${hasNumbers ? "modal__btn--refer-active" : ""}`}
            onClick={handleRefer}
            disabled={!hasNumbers}
          >
            Refer Now
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ── */
const ReferralPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"signedUp" | "planPurchased">("signedUp");
  const [showModal, setShowModal] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <div className="referral-page">
      {/* Banner */}
      <div className="referral-banner">
        <div className="referral-banner__content">
          <h1 className="referral-banner__title">
            Earn <span className="referral-banner__amount">₹501</span> for each Referral
          </h1>
          <p className="referral-banner__subtitle">
            When your friend buys a plan, they'll get{" "}
            <span className="referral-banner__highlight">flat 15%</span> off on the plan purchase
          </p>
          <div className="referral-banner__actions">
            <button className="btn btn--refer" onClick={openModal}>Refer Now</button>
            <button className="btn btn--send">
              <span className="btn__icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12" y2="18" />
                </svg>
              </span>
              Send Code to my device
            </button>
          </div>
        </div>
      </div>

      {/* Rewards Earned */}
      <div className="rewards-section">
        <h2 className="rewards-section__title">Rewards Earned</h2>
        <div className="rewards-cards">
          <div className="rewards-card">
            <div className="rewards-card__label">
              <span className="rewards-card__icon rewards-card__icon--blue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </span>
              Total Claimed
            </div>
            <div className="rewards-card__amount">₹ 0.0</div>
          </div>
          <div className="rewards-card">
            <div className="rewards-card__label">
              <span className="rewards-card__icon rewards-card__icon--green">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              </span>
              Ready to Withdraw
            </div>
            <div className="rewards-card__amount">₹ 0.0</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="referral-tabs-section">
        <div className="referral-tabs">
          <button
            className={`referral-tab ${activeTab === "signedUp" ? "referral-tab--active" : ""}`}
            onClick={() => setActiveTab("signedUp")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Signed Up
          </button>
          <button
            className={`referral-tab ${activeTab === "planPurchased" ? "referral-tab--active" : ""}`}
            onClick={() => setActiveTab("planPurchased")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
              <polyline points="16 11 18 13 22 9" />
            </svg>
            Plan Purchased
          </button>
        </div>

        <div className="referral-tab-content">
          {/* Always show empty state — no list after referring */}
          <div className="empty-state">
            <div className="empty-state__icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
                <polyline points="12 14 12 18" />
                <polyline points="10 17 12 19 14 17" />
              </svg>
            </div>
            <p className="empty-state__text">
              {activeTab === "signedUp" ? "No signed up users yet!" : "No plan purchased users yet!"}
            </p>
            <button className="btn btn--refer-primary" onClick={openModal}>
              Refer Now
            </button>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="how-it-works">
        <h2 className="how-it-works__title">How it works?</h2>
        <div className="how-it-works__steps">
          <div className="step-card">
            <div className="step-card__icon step-card__icon--blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </div>
            <p className="step-card__text">1. Share the referral link with your friends</p>
          </div>
          <div className="step-card">
            <div className="step-card__icon step-card__icon--green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <p className="step-card__text">2. Your friend download myBillBook and subscribe the plan</p>
          </div>
          <div className="step-card">
            <div className="step-card__icon step-card__icon--yellow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <polyline points="20 12 20 22 4 22 4 12" />
                <rect x="2" y="7" width="20" height="5" />
                <line x1="12" y1="22" x2="12" y2="7" />
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
              </svg>
            </div>
            <p className="step-card__text">3. You earn ₹501, they get 15% discount</p>
          </div>
        </div>
      </div>

      {showModal && <ReferNowModal onClose={closeModal} onRefer={() => {}} />}
    </div>
  );
};

export default ReferralPage;