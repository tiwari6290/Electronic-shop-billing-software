import { useState, useRef, useEffect } from "react";
import "./SMSPromotion.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type CampaignStep = 1 | 2 | 3;

interface SmsTemplate {
  id: string;
  category: "Festival" | "Discount" | "Stock Update" | "Business Promotion";
  text: string;
  variables: Array<"event" | "discount" | "store" | "phone">;
}

interface Party {
  id: string;
  name: string;
  mobile: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SMS_TEMPLATES: SmsTemplate[] = [
  {
    id: "f1",
    category: "Festival",
    text: 'This {{event}}, get upto {{discount}} off on your orders at {{store}} Contact {{phone}} to know more - myBillBook"',
    variables: ["event", "discount", "store", "phone"],
  },
  {
    id: "f2",
    category: "Festival",
    text: "Contact {{phone}} for {{event}} offers at {{store}}! Hurry up and order now - myBillBook",
    variables: ["phone", "event", "store"],
  },
  {
    id: "f3",
    category: "Festival",
    text: "Contact {{phone}} for {{event}} sale at {{store}}! Shop now to get amazing discounts - myBillBook",
    variables: ["phone", "event", "store"],
  },
  {
    id: "f4",
    category: "Festival",
    text: "Amazing {{event}} offers at {{store}}! Hurry up and order now Call {{phone}} to know more - myBillBook",
    variables: ["event", "store", "phone"],
  },
  {
    id: "d1",
    category: "Discount",
    text: "Get {{discount}} off at {{store}}! Limited time offer. Contact {{phone}} - myBillBook",
    variables: ["discount", "store", "phone"],
  },
  {
    id: "d2",
    category: "Discount",
    text: "Exclusive {{discount}} discount for you at {{store}}! Shop now, Call {{phone}} - myBillBook",
    variables: ["discount", "store", "phone"],
  },
  {
    id: "d3",
    category: "Discount",
    text: "Flash Sale! {{discount}} off on all items at {{store}}. Order now, contact {{phone}} - myBillBook",
    variables: ["discount", "store", "phone"],
  },
  {
    id: "s1",
    category: "Stock Update",
    text: "New stock arrived at {{store}}! Visit us or call {{phone}} to know more - myBillBook",
    variables: ["store", "phone"],
  },
  {
    id: "s2",
    category: "Stock Update",
    text: "Fresh arrivals at {{store}}! Hurry, limited stock available. Contact {{phone}} - myBillBook",
    variables: ["store", "phone"],
  },
  {
    id: "b1",
    category: "Business Promotion",
    text: "Visit {{store}} for the best deals! Call {{phone}} to know more - myBillBook",
    variables: ["store", "phone"],
  },
  {
    id: "b2",
    category: "Business Promotion",
    text: "{{store}} is now open! Check out our latest collection. Contact {{phone}} - myBillBook",
    variables: ["store", "phone"],
  },
];

const FESTIVAL_OPTIONS = [
  "Christmas", "Diwali", "Holi", "New Year", "Eid", "Navratri",
  "Durga Puja", "Pongal", "Onam", "Baisakhi", "Independence Day", "Republic Day",
];

const SAMPLE_PARTIES: Party[] = [
  { id: "p1", name: "Rahul Sharma", mobile: "9876543210" },
  { id: "p2", name: "Priya Patel", mobile: "8765432109" },
  { id: "p3", name: "Amit Kumar", mobile: "7654321098" },
  { id: "p4", name: "Sunita Devi", mobile: "9543210987" },
  { id: "p5", name: "Ravi Gupta", mobile: "8432109876" },
  { id: "p6", name: "Meena Joshi", mobile: "7321098765" },
  { id: "p7", name: "Deepak Singh", mobile: "9210987654" },
  { id: "p8", name: "Kavita Rao", mobile: "8109876543" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderSms(template: string, values: Record<string, string>): React.ReactNode[] {
  const parts = template.split(/({{[^}]+}})/g);
  return parts.map((part, i) => {
    const match = part.match(/^{{(.+)}}$/);
    if (match) {
      const key = match[1];
      const val = values[key] || part;
      return <strong key={i}>{val}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function useClickOutside(ref: React.RefObject<HTMLElement>, callback: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) callback();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, callback]);
}

// ─── ChooseSmsModal ───────────────────────────────────────────────────────────

function ChooseSmsModal({
  onClose,
  onSelect,
  initialCategory = "Festival",
}: {
  onClose: () => void;
  onSelect: (t: SmsTemplate) => void;
  initialCategory?: SmsTemplate["category"];
}) {
  const CATEGORIES: SmsTemplate["category"][] = [
    "Festival", "Discount", "Stock Update", "Business Promotion",
  ];
  const [category, setCategory] = useState<SmsTemplate["category"]>(initialCategory);
  const [selected, setSelected] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null!);
  const listRef = useRef<HTMLDivElement>(null!);
  useClickOutside(catRef, () => setCatOpen(false));

  const filtered = SMS_TEMPLATES.filter((t) => t.category === category);
  const PREVIEW_VALUES = { event: "Christmas", discount: "5%", store: "mondal electronic", phone: "9142581382" };

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).classList.contains("sms-modal-backdrop")) onClose();
  }

  return (
    <div className="sms-modal-backdrop" onClick={handleBackdrop}>
      <div className="choose-modal">
        {/* Header */}
        <div className="choose-modal__header">
          <h2 className="choose-modal__title">Choose SMS Templates</h2>
          <button className="choose-modal__close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l10 10M12 2L2 12"/>
            </svg>
          </button>
        </div>

        {/* Category row */}
        <div className="choose-modal__cat-row">
          <span className="choose-modal__cat-label">Select SMS Category</span>
          <div className="choose-modal__cat-dropdown" ref={catRef}>
            <button
              className={`choose-modal__cat-btn ${catOpen ? "choose-modal__cat-btn--open" : ""}`}
              onClick={() => setCatOpen((o) => !o)}
            >
              <span>{category}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M2 4l4 4 4-4"/>
              </svg>
            </button>
            {catOpen && (
              <div className="choose-modal__cat-options">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    className={`choose-modal__cat-option ${c === category ? "choose-modal__cat-option--active" : ""}`}
                    onClick={() => { setCategory(c); setCatOpen(false); setSelected(""); }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Note */}
        <div className="choose-modal__note">
          <strong>Note:</strong> All <strong>bold</strong> text in SMS can be changed as needed
        </div>

        {/* Template list */}
        <div className="choose-modal__list" ref={listRef}>
          {filtered.map((tmpl) => (
            <label
              key={tmpl.id}
              className={`tmpl-card ${selected === tmpl.id ? "tmpl-card--selected" : ""}`}
            >
              <span className="tmpl-card__text">
                {renderSms(tmpl.text, PREVIEW_VALUES)}
              </span>
              <input
                type="radio"
                name="sms_pick"
                value={tmpl.id}
                checked={selected === tmpl.id}
                onChange={() => setSelected(tmpl.id)}
                className="tmpl-card__radio"
              />
            </label>
          ))}
        </div>

        {/* Scroll indicator bar */}
        <div className="choose-modal__scroll-track">
          <div className="choose-modal__scroll-bar" />
        </div>

        {/* Footer */}
        <div className="choose-modal__footer">
          <button className="btn-modal-cancel" onClick={onClose}>Cancel</button>
          <button
            className={`btn-modal-confirm ${!selected ? "btn-modal-confirm--disabled" : ""}`}
            disabled={!selected}
            onClick={() => {
              const t = SMS_TEMPLATES.find((t) => t.id === selected);
              if (t) onSelect(t);
            }}
          >
            Select &amp; Edit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: CampaignStep }) {
  const steps = [
    { n: 1, label: "Edit SMS" },
    { n: 2, label: "Select Parties" },
    { n: 3, label: "Confirmation" },
  ];

  return (
    <div className="step-indicator">
      {steps.map((s, i) => {
        const done = step > s.n;
        const active = step === s.n;
        return (
          <div key={s.n} className="step-indicator__item">
            {i > 0 && (
              <div className={`step-indicator__line ${done ? "step-indicator__line--done" : ""}`} />
            )}
            <div className="step-slot">
              <div className={`step-indicator__circle ${done ? "step-indicator__circle--done" : active ? "step-indicator__circle--active" : ""}`}>
                {done ? (
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 7l3.5 3.5 6-7"/>
                  </svg>
                ) : s.n}
              </div>
              <span className={`step-indicator__label ${active ? "step-indicator__label--active" : done ? "step-indicator__label--done" : ""}`}>
                {s.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── SMS Preview Panel ────────────────────────────────────────────────────────

function SmsPreview({ template, values, onChooseDiff }: {
  template: SmsTemplate;
  values: Record<string, string>;
  onChooseDiff: () => void;
}) {
  return (
    <div className="sms-preview">
      <div className="sms-preview__bubble">
        <p className="sms-preview__text">{renderSms(template.text, values)}</p>
      </div>
      <button className="sms-preview__diff-btn" onClick={onChooseDiff}>
        Choose a Different SMS
      </button>
    </div>
  );
}

// ─── Step 1: Edit SMS ─────────────────────────────────────────────────────────

function EditSmsStep({ template, values, onChange }: {
  template: SmsTemplate;
  values: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
}) {
  const [eventOpen, setEventOpen] = useState(false);
  const eventRef = useRef<HTMLDivElement>(null!);
  useClickOutside(eventRef, () => setEventOpen(false));
  const set = (k: string, v: string) => onChange({ ...values, [k]: v });

  // Determine layout: if all 4 vars present → 2x2 grid; otherwise adapt
  const hasEvent = template.variables.includes("event");
  const hasDiscount = template.variables.includes("discount");

  // Build rows based on template variables
  const rows: React.ReactNode[] = [];

  // Row 1: Event + Discount (if both exist) OR Event alone OR Discount alone
  if (hasEvent || hasDiscount) {
    rows.push(
      <div key="row1" className={`tpl-row ${hasEvent && hasDiscount ? "tpl-row--2col" : "tpl-row--1col"}`}>
        {hasEvent && (
          <div className="tpl-field">
            <label className="tpl-field__label">Enter Event</label>
            <div className="tpl-field__dropdown" ref={eventRef}>
              <button
                className={`tpl-field__select ${eventOpen ? "tpl-field__select--open" : ""}`}
                onClick={() => setEventOpen((o) => !o)}
              >
                <span>{values.event || "Select"}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M2 4l4 4 4-4"/>
                </svg>
              </button>
              {eventOpen && (
                <div className="tpl-field__options">
                  {FESTIVAL_OPTIONS.map((f) => (
                    <button
                      key={f}
                      className={`tpl-field__option ${values.event === f ? "tpl-field__option--active" : ""}`}
                      onClick={() => { set("event", f); setEventOpen(false); }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {hasDiscount && (
          <div className="tpl-field">
            <label className="tpl-field__label">Enter Discount</label>
            <input
              className="tpl-field__input"
              placeholder="Ex: 15% discount"
              value={values.discount || ""}
              onChange={(e) => set("discount", e.target.value)}
            />
          </div>
        )}
      </div>
    );
  }

  // Row 2: Store + Phone
  rows.push(
    <div key="row2" className="tpl-row tpl-row--2col">
      <div className="tpl-field">
        <label className="tpl-field__label">Store name</label>
        <input
          className="tpl-field__input"
          value={values.store || ""}
          onChange={(e) => set("store", e.target.value)}
        />
      </div>
      <div className="tpl-field">
        <label className="tpl-field__label">Phone number</label>
        <input
          className="tpl-field__input"
          value={values.phone || ""}
          onChange={(e) => set("phone", e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <div className="step-panel">
      <div className="step-panel__head">
        <h3 className="step-panel__title">Change Template Values</h3>
        <button className="step-panel__help">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#9ca3af" strokeWidth="1.5">
            <circle cx="8" cy="8" r="6.5"/>
            <path d="M6.2 6c0-1 .8-1.8 1.8-1.8s1.8.8 1.8 1.8c0 .9-.9 1.4-1.4 1.9S8 9 8 9.5M8 11.5v.3"/>
          </svg>
        </button>
      </div>
      <div className="tpl-fields">
        {rows}
      </div>
    </div>
  );
}

// ─── Step 2: Select Parties ───────────────────────────────────────────────────

function SelectPartiesStep({ selected, onToggle }: {
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = SAMPLE_PARTIES.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.mobile.includes(search)
  );
  const allSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id));

  function toggleAll() {
    if (allSelected) {
      filtered.forEach((p) => { if (selected.has(p.id)) onToggle(p.id); });
    } else {
      filtered.forEach((p) => { if (!selected.has(p.id)) onToggle(p.id); });
    }
  }

  return (
    <div className="step-panel">
      <div className="step-panel__head">
        <h3 className="step-panel__title">Select Parties to Send SMS</h3>
        <button className="step-panel__help">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#9ca3af" strokeWidth="1.5">
            <circle cx="8" cy="8" r="6.5"/>
            <path d="M6.2 6c0-1 .8-1.8 1.8-1.8s1.8.8 1.8 1.8c0 .9-.9 1.4-1.4 1.9S8 9 8 9.5M8 11.5v.3"/>
          </svg>
        </button>
      </div>

      <div className="parties-toolbar">
        <div className="parties-search">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#9ca3af" strokeWidth="1.5">
            <circle cx="6.5" cy="6.5" r="4.5"/>
            <path d="M10.5 10.5L14 14" strokeLinecap="round"/>
          </svg>
          <input
            className="parties-search__input"
            placeholder="Search party by name or number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="parties-note">
          Note: SMS cannot be sent to parties whose numbers haven't been saved
        </div>
      </div>

      <div className="parties-table">
        <div className="parties-table__head">
          <div className="parties-table__cell parties-table__cell--check">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="pcheck"
            />
          </div>
          <div className="parties-table__cell parties-table__cell--name">
            PARTY NAME
            <button className="sort-btn">
              <svg width="9" height="11" viewBox="0 0 10 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 1v12M1 4l4-4 4 4M1 10l4 4 4-4"/>
              </svg>
            </button>
          </div>
          <div className="parties-table__cell parties-table__cell--mobile">MOBILE NUMBER</div>
        </div>

        <div className="parties-table__body">
          {filtered.length === 0 ? (
            <div className="parties-table__empty">No parties found</div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                className={`parties-table__row ${selected.has(p.id) ? "parties-table__row--checked" : ""}`}
                onClick={() => onToggle(p.id)}
              >
                <div className="parties-table__cell parties-table__cell--check">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => onToggle(p.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="pcheck"
                  />
                </div>
                <div className="parties-table__cell parties-table__cell--name">{p.name}</div>
                <div className="parties-table__cell parties-table__cell--mobile">{p.mobile}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="parties-count">
          {selected.size} {selected.size === 1 ? "party" : "parties"} selected
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Confirmation ─────────────────────────────────────────────────────

function ConfirmationStep({ template, values, parties, onDone }: {
  template: SmsTemplate;
  values: Record<string, string>;
  parties: Party[];
  onDone: () => void;
}) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function handleSend() {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(onDone, 1600);
    }, 1200);
  }

  return (
    <div className="step-panel">
      <h3 className="step-panel__title">Confirm &amp; Send</h3>

      <div className="confirm-summary">
        <div className="confirm-row">
          <span className="confirm-row__key">SMS Preview</span>
          <div className="confirm-row__val">
            <p>{renderSms(template.text, values)}</p>
          </div>
        </div>
        <div className="confirm-row">
          <span className="confirm-row__key">Recipients</span>
          <div className="confirm-row__val">
            <div className="confirm-chips">
              {parties.map((p) => (
                <span key={p.id} className="confirm-chip">{p.name}</span>
              ))}
            </div>
            <p className="confirm-count">{parties.length} {parties.length === 1 ? "recipient" : "recipients"}</p>
          </div>
        </div>
      </div>

      {sent ? (
        <div className="confirm-success">
          <div className="confirm-success__icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="19" fill="#dcfce7" stroke="#16a34a" strokeWidth="2"/>
              <path d="M12 20l6 6 10-12" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="confirm-success__msg">SMS Campaign sent successfully!</p>
        </div>
      ) : (
        <button
          className={`btn-send-campaign ${sending ? "btn-send-campaign--sending" : ""}`}
          onClick={handleSend}
          disabled={sending}
        >
          {sending ? (<><span className="spinner" />Sending...</>) : "Send Campaign"}
        </button>
      )}
    </div>
  );
}

// ─── Campaign Flow ────────────────────────────────────────────────────────────

function CampaignFlow({ initialTemplate, onBack }: {
  initialTemplate: SmsTemplate;
  onBack: () => void;
}) {
  const [step, setStep] = useState<CampaignStep>(1);
  const [template, setTemplate] = useState(initialTemplate);
  const [values, setValues] = useState<Record<string, string>>({
    event: "Christmas",
    discount: "5%",
    store: "mondal electronic",
    phone: "9142581382",
  });
  const [selectedParties, setSelectedParties] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);

  function toggleParty(id: string) {
    setSelectedParties((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  const canContinue =
    step === 1 ? !!(values.store && values.phone) :
    step === 2 ? selectedParties.size > 0 : true;

  const parties = SAMPLE_PARTIES.filter((p) => selectedParties.has(p.id));

  return (
    <>
      {showModal && (
        <ChooseSmsModal
          onClose={() => setShowModal(false)}
          onSelect={(t) => { setTemplate(t); setShowModal(false); }}
          initialCategory={template.category}
        />
      )}

      <div className="campaign-page">
        {/* Header */}
        <div className="cp-header">
          <div className="cp-header__left">
            <button className="cp-back-btn" onClick={onBack} aria-label="Back">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 12L6 8l4-4"/>
              </svg>
            </button>
            <span className="cp-header__title">SMS Promotion</span>
            <button className="cp-watch-btn">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#4f6ef7" strokeWidth="1.5"/>
                <path d="M6.5 5.5l5 2.5-5 2.5V5.5z" fill="#4f6ef7"/>
              </svg>
              Watch how to create campaign
            </button>
          </div>
          <div className="cp-header__right">
            <button className="cp-icon-btn">
              <svg width="18" height="16" viewBox="0 0 18 16" fill="none" stroke="currentColor" strokeWidth="1.3">
                <rect x="0.5" y="0.5" width="17" height="15" rx="2"/>
                <rect x="3" y="5" width="12" height="1.5" rx="0.5" fill="currentColor" stroke="none"/>
                <rect x="3" y="8" width="8" height="1.5" rx="0.5" fill="currentColor" stroke="none"/>
                <rect x="3" y="11" width="5" height="1.5" rx="0.5" fill="currentColor" stroke="none"/>
              </svg>
            </button>
            <button className="cp-support-btn">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 10a2 2 0 01-2 2H5l-3 2V4a2 2 0 012-2h8a2 2 0 012 2v6z"/>
              </svg>
              Chat Support
            </button>
          </div>
        </div>

        {/* 2-col body */}
        <div className="cp-body">
          {/* Left: preview */}
          <div className="cp-left">
            <SmsPreview template={template} values={values} onChooseDiff={() => setShowModal(true)} />
          </div>

          {/* Right: steps */}
          <div className="cp-right">
            <StepIndicator step={step} />

            <div className="cp-right__content">
              {step === 1 && <EditSmsStep template={template} values={values} onChange={setValues} />}
              {step === 2 && <SelectPartiesStep selected={selectedParties} onToggle={toggleParty} />}
              {step === 3 && (
                <ConfirmationStep
                  template={template}
                  values={values}
                  parties={parties}
                  onDone={() => setTimeout(onBack, 800)}
                />
              )}
            </div>

            <div className="cp-note">
              <strong>Note:</strong> <strong>Bold</strong> text in SMS preview can be changed on the right section
            </div>

            <div className="cp-actions">
              {step > 1 && step < 3 && (
                <button className="btn-back-step" onClick={() => setStep((s) => (s - 1) as CampaignStep)}>
                  Back
                </button>
              )}
              {step < 3 && (
                <button
                  className={`btn-continue ${!canContinue ? "btn-continue--disabled" : ""}`}
                  disabled={!canContinue}
                  onClick={() => setStep((s) => (s + 1) as CampaignStep)}
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

function LandingPage({
  onCreateCampaign,
  onSelectTemplate,
}: {
  onCreateCampaign: () => void;
  onSelectTemplate: (cat: SmsTemplate["category"]) => void;
}) {
  return (
    <div className="landing">
      {/* Header */}
      <div className="landing__header">
        <h1 className="landing__title">SMS Promotion</h1>
        <div className="landing__header-right">
          <button className="landing__icon-btn">
            <svg width="18" height="16" viewBox="0 0 18 16" fill="none" stroke="currentColor" strokeWidth="1.3">
              <rect x="0.5" y="0.5" width="17" height="15" rx="2"/>
              <rect x="3" y="5" width="12" height="1.5" rx="0.5" fill="currentColor" stroke="none"/>
              <rect x="3" y="8" width="8" height="1.5" rx="0.5" fill="currentColor" stroke="none"/>
              <rect x="3" y="11" width="5" height="1.5" rx="0.5" fill="currentColor" stroke="none"/>
            </svg>
          </button>
          <button className="btn-create-campaign" onClick={onCreateCampaign}>
            Create Campaign
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="landing__hero">
        <div className="hero-illustration" aria-hidden="true">
          <svg width="360" height="250" viewBox="0 0 360 250" fill="none">
            {/* Bar chart */}
            <rect x="30" y="165" width="38" height="65" rx="5" fill="#dbeafe" opacity="0.8"/>
            <rect x="83" y="138" width="38" height="92" rx="5" fill="#bfdbfe" opacity="0.85"/>
            <rect x="136" y="108" width="38" height="122" rx="5" fill="#93c5fd" opacity="0.9"/>
            <rect x="189" y="75" width="38" height="155" rx="5" fill="#60a5fa"/>
            {/* Trend line */}
            <polyline points="49,160 102,133 155,103 208,70 252,28" stroke="#3b82f6" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M245 23l7 5-6 5" stroke="#3b82f6" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            {/* Phone */}
            <rect x="210" y="88" width="96" height="140" rx="12" fill="white" stroke="#e5e7eb" strokeWidth="1.5"/>
            <text x="218" y="101" fontSize="8" fill="#9ca3af">←</text>
            <rect x="218" y="108" width="80" height="58" rx="8" fill="#eff6ff"/>
            <text x="224" y="124" fontSize="7.5" fontWeight="600" fill="#374151">New Year Sale is Live</text>
            <text x="224" y="136" fontSize="7" fill="#374151">Flat 50% off on all</text>
            <text x="224" y="148" fontSize="7" fill="#374151">items. Hurry Now!!</text>
            <circle cx="258" cy="208" r="12" fill="#e5e7eb"/>
            {/* Floating tags */}
            <rect x="258" y="76" width="68" height="24" rx="7" fill="#fed7aa"/>
            <text x="292" y="92" fontSize="10" fill="#92400e" textAnchor="middle" fontWeight="600">Holi Sale</text>
            <rect x="272" y="115" width="76" height="24" rx="7" fill="#fde8c8"/>
            <text x="310" y="131" fontSize="10" fill="#92400e" textAnchor="middle" fontWeight="600">Diwali Sale</text>
            <rect x="272" y="155" width="84" height="24" rx="7" fill="#fed7aa"/>
            <text x="314" y="171" fontSize="10" fill="#92400e" textAnchor="middle" fontWeight="600">50% Discount</text>
          </svg>
        </div>

        <h2 className="landing__heading">Grow Your Business through SMS Promotions</h2>
        <p className="landing__sub">
          Want to share festival sale and discount offer with your customer? Start an SMS campaign today
          with myBillBook and make your sale a success
        </p>
      </div>

      {/* Cards */}
      <div className="landing__cards">
        {/* Festival card */}
        <div className="promo-card promo-card--festival">
          <div className="promo-card__content">
            <h3 className="promo-card__title">Share festival offer with Your customer</h3>
            <p className="promo-card__desc">Increase your sale this festival season with our Festival SMS Campaign</p>
            <button className="btn-promo-white" onClick={() => onSelectTemplate("Festival")}>
              Select Template
            </button>
          </div>
          <div className="promo-card__art">
            <div className="festival-thumbnails">
              <div className="festival-thumb festival-thumb--holi">
                <span style={{ fontSize: 28 }}>🎨</span>
                <small>HOLI</small>
              </div>
              <div className="festival-thumb festival-thumb--ny">
                <span style={{ fontSize: 22 }}>🎆</span>
                <small>HAPPY NEW YEAR</small>
              </div>
              <div className="festival-thumb festival-thumb--diwali">
                <span style={{ fontSize: 28 }}>🪔</span>
              </div>
            </div>
          </div>
        </div>

        {/* Discount card */}
        <div className="promo-card promo-card--discount">
          <div className="promo-card__content">
            <h3 className="promo-card__title">Share discount Your customer will love</h3>
            <p className="promo-card__desc">Share discount offers with your customers and watch your business grow</p>
            <button className="btn-promo-outline" onClick={() => onSelectTemplate("Discount")}>
              Select Template
            </button>
          </div>
          <div className="promo-card__art">
            <div className="discount-tag-art">
              <div className="discount-tag-art__hole" />
              <div className="discount-tag-art__body">
                <span className="discount-tag-art__pct">50%</span>
                <span className="discount-tag-art__off">OFF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function SMSPromotion() {
  const [view, setView] = useState<"landing" | "campaign">("landing");
  const [showModal, setShowModal] = useState(false);
  const [initialCat, setInitialCat] = useState<SmsTemplate["category"]>("Festival");
  const [selectedTemplate, setSelectedTemplate] = useState<SmsTemplate | null>(null);

  function openModalForCat(cat: SmsTemplate["category"]) {
    setInitialCat(cat);
    setShowModal(true);
  }

  function handleTemplateChosen(t: SmsTemplate) {
    setSelectedTemplate(t);
    setShowModal(false);
    setView("campaign");
  }

  return (
    <div className="sms-app">
      {showModal && (
        <ChooseSmsModal
          onClose={() => setShowModal(false)}
          onSelect={handleTemplateChosen}
          initialCategory={initialCat}
        />
      )}

      {view === "landing" ? (
        <LandingPage
          onCreateCampaign={() => openModalForCat("Festival")}
          onSelectTemplate={openModalForCat}
        />
      ) : (
        selectedTemplate && (
          <CampaignFlow
            initialTemplate={selectedTemplate}
            onBack={() => setView("landing")}
          />
        )
      )}
    </div>
  );
}