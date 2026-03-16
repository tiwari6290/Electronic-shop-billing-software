import "./PaymentOut.css";
import { Calendar, ChevronDown, X, ArrowLeft, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import emptyImg from "../../../assets/5.png";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";

/* ══════════════════════════════════════════
   SETTINGS — localStorage helpers
══════════════════════════════════════════ */
const SETTINGS_KEY = "paymentOutSettings";

function loadSettings(): { prefix: string; sequenceNumber: number } {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { prefix: "ME/PT/26-27/", sequenceNumber: 1 };
}

function persistSettings(prefix: string, sequenceNumber: number) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ prefix, sequenceNumber }));
}

/* ══════════════════════════════════════════
   INLINE SETTINGS MODAL
══════════════════════════════════════════ */
interface SettingsModalProps {
  onClose: (saved: boolean, prefix: string, sequenceNumber: number) => void;
}

function PaymentOutSettingsModal({ onClose }: SettingsModalProps) {
  const current = loadSettings();
  const [prefix, setPrefix] = useState(current.prefix);
  const [seqNum, setSeqNum] = useState(String(current.sequenceNumber));

  const handleSave = () => {
    const num = parseInt(seqNum) || 1;
    persistSettings(prefix, num);
    onClose(true, prefix, num);
  };

  const handleCancel = () => onClose(false, current.prefix, current.sequenceNumber);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={handleCancel}
    >
      <div
        style={{
          background: "#fff", borderRadius: 12, width: 420,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid #e4e7ec",
        }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#1d2939" }}>
            Payment Out Settings
          </span>
          <button
            onClick={handleCancel}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#667085", display: "flex" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }}>
          <p style={{ fontSize: 13, color: "#667085", marginBottom: 16, margin: "0 0 16px" }}>
            Set the prefix and starting sequence number for Payment Out vouchers.
          </p>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{
                display: "block", fontSize: 12, fontWeight: 600,
                color: "#344054", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em",
              }}>
                Prefix
              </label>
              <input
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px", border: "1px solid #d0d5dd",
                  borderRadius: 6, fontSize: 13, color: "#1d2939",
                  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{
                display: "block", fontSize: 12, fontWeight: 600,
                color: "#344054", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em",
              }}>
                Sequence Number
              </label>
              <input
                type="number"
                min={1}
                value={seqNum}
                onChange={(e) => setSeqNum(e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px", border: "1px solid #d0d5dd",
                  borderRadius: 6, fontSize: 13, color: "#1d2939",
                  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                }}
              />
            </div>
          </div>

          {/* Preview */}
          <div style={{
            marginTop: 14, padding: "10px 14px", background: "#f9fafb",
            borderRadius: 6, border: "1px solid #e4e7ec",
          }}>
            <span style={{ fontSize: 12, color: "#667085" }}>Payment Out Number Preview: </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#4361ee" }}>
              {prefix}{parseInt(seqNum) || 1}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", justifyContent: "flex-end", gap: 10,
          padding: "14px 20px", borderTop: "1px solid #e4e7ec",
        }}>
          <button
            onClick={handleCancel}
            style={{
              padding: "8px 20px", border: "1px solid #d0d5dd", borderRadius: 6,
              background: "#fff", color: "#344054", fontSize: 13,
              fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "8px 20px", border: "none", borderRadius: 6,
              background: "#4361ee", color: "#fff", fontSize: 13,
              fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function PaymentOut() {
  const navigate = useNavigate();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [openSettings, setOpenSettings] = useState(false);

  /* ================= EDIT MODE ================= */
  const [editingId, setEditingId] = useState<number | null>(null);
  const editingIdRef = useRef<number | null>(null);

  /* ================= PARTY DROPDOWN ================= */
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);
  const [partySearch, setPartySearch] = useState("");
  const partyDropdownRef = useRef<HTMLDivElement>(null);
  const partySearchRef = useRef<HTMLInputElement>(null);

  const parties = [
    { id: 1, name: "Party A" },
    { id: 2, name: "Party B" },
    { id: 3, name: "Party C" },
  ];

  const filteredParties = parties.filter((p) =>
    p.name.toLowerCase().includes(partySearch.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        partyDropdownRef.current &&
        !partyDropdownRef.current.contains(e.target as Node)
      ) {
        setShowPartyDropdown(false);
        setPartySearch("");
      }
    };
    if (showPartyDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPartyDropdown]);

  useEffect(() => {
    if (showPartyDropdown) {
      setTimeout(() => partySearchRef.current?.focus(), 0);
    }
  }, [showPartyDropdown]);

  /* ================= FORM DATA ================= */
  const [formData, setFormData] = useState(() => {
    const s = loadSettings();
    return {
      partyName: "",
      amountPaid: "",
      discount: "",
      paymentDate: "08 Feb 2026",
      paymentMode: "Cash",
      prefix: s.prefix,
      number: String(s.sequenceNumber),
      notes: "",
    };
  });

  /* ================= LOAD EDITING DATA ================= */
  useEffect(() => {
    const editing = localStorage.getItem("editingPayment");
    if (editing) {
      const payment = JSON.parse(editing);
      setEditingId(payment.id);
      editingIdRef.current = payment.id;

      const lastSlash = payment.paymentNumber?.lastIndexOf("/");
      const prefix =
        lastSlash !== -1
          ? payment.paymentNumber.substring(0, lastSlash + 1)
          : loadSettings().prefix;
      const number =
        lastSlash !== -1
          ? payment.paymentNumber.substring(lastSlash + 1)
          : payment.paymentNumber;

      setFormData((prev) => ({
        ...prev,
        partyName: payment.partyName || "",
        amountPaid: payment.amountReceived || "",
        discount: payment.discount || "",
        paymentDate: payment.date || "08 Feb 2026",
        paymentMode: payment.paymentMode || "Cash",
        prefix,
        number,
        notes: payment.notes || "",
      }));

      localStorage.removeItem("editingPayment");
    }
  }, []);

  /* ================= HANDLERS ================= */
  const openPartyDropdown = () => setShowPartyDropdown(true);

  const togglePartyDropdown = () => {
    setShowPartyDropdown((prev) => !prev);
    if (showPartyDropdown) setPartySearch("");
  };

  const selectParty = (partyName: string) => {
    setFormData({ ...formData, partyName });
    setShowPartyDropdown(false);
    setPartySearch("");
  };

  const clearParty = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData({ ...formData, partyName: "" });
    setShowPartyDropdown(false);
    setPartySearch("");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /* Settings modal closed — if saved, update prefix + number in form */
  const handleSettingsClose = (
    saved: boolean,
    prefix: string,
    sequenceNumber: number
  ) => {
    setOpenSettings(false);
    if (saved && editingIdRef.current === null) {
      setFormData((prev) => ({
        ...prev,
        prefix,
        number: String(sequenceNumber),
      }));
    }
  };

  /* ================= SAVE ================= */
  const handleSave = () => {
    if (!formData.partyName || !formData.amountPaid) {
      alert("Please fill required fields");
      return;
    }

    const existing: any[] = JSON.parse(
      localStorage.getItem("paymentOutList") || "[]"
    );

    const currentEditingId = editingIdRef.current;

    if (currentEditingId !== null) {
      const updated = existing.map((p) =>
        p.id === currentEditingId
          ? {
              ...p,
              date: formData.paymentDate,
              paymentNumber: `${formData.prefix}${formData.number}`,
              partyName: formData.partyName,
              totalAmountSettled: formData.amountPaid,
              amountReceived: formData.amountPaid,
              paymentMode: formData.paymentMode,
              notes: formData.notes,
              discount: formData.discount,
            }
          : p
      );
      localStorage.setItem("paymentOutList", JSON.stringify(updated));
    } else {
      const newPayment = {
        id: Date.now(),
        date: formData.paymentDate,
        paymentNumber: `${formData.prefix}${formData.number}`,
        partyName: formData.partyName,
        totalAmountSettled: formData.amountPaid,
        amountReceived: formData.amountPaid,
        paymentMode: formData.paymentMode,
        notes: formData.notes,
        discount: formData.discount,
      };
      localStorage.setItem(
        "paymentOutList",
        JSON.stringify([...existing, newPayment])
      );
      // Auto-increment sequence number after each new save
      persistSettings(formData.prefix, (parseInt(formData.number) || 1) + 1);
    }

    navigate("/cashier/payment-out-list");
  };

  /* ================= UI ================= */
  return (
    <>
      <div className="navbar-wrapper">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <Navbar
          title={editingId ? "Edit Payment Out" : "Payment Out"}
          showSettings
          onSettingsClick={() => setOpenSettings(true)}
          cancelAction={{
            label: "Cancel",
            onClick: () => navigate(-1),
          }}
          primaryAction={{
            label: editingId ? "Save Changes" : "Save",
            onClick: handleSave,
          }}
        />
      </div>

      <div className="paymentout-page">
        <div className="paymentout-top">
          {/* ================= LEFT CARD ================= */}
          <div className="card">
            <div className="field">
              <label>Party Name</label>
              <div className="custom-select-wrapper" ref={partyDropdownRef}>
                <div className="custom-select" onClick={togglePartyDropdown}>
                  <span className={formData.partyName ? "" : "placeholder"}>
                    {formData.partyName || "Search party by name or number"}
                  </span>
                  <div className="custom-select-icons">
                    {formData.partyName && (
                      <span
                        className="clear-btn"
                        onMouseDown={clearParty}
                        title="Deselect party"
                      >
                        <X size={14} />
                      </span>
                    )}
                    <ChevronDown
                      size={16}
                      style={{
                        transform: showPartyDropdown
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                        flexShrink: 0,
                      }}
                    />
                  </div>
                </div>

                {showPartyDropdown && (
                  <div className="custom-dropdown">
                    <div className="dropdown-search">
                      <input
                        ref={partySearchRef}
                        type="text"
                        placeholder="Search party by name or number"
                        value={partySearch}
                        onChange={(e) => setPartySearch(e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    {filteredParties.length > 0 ? (
                      filteredParties.map((party) => (
                        <div
                          key={party.id}
                          className={`dropdown-item${
                            formData.partyName === party.name
                              ? " dropdown-item--selected"
                              : ""
                          }`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectParty(party.name);
                          }}
                        >
                          {party.name}
                        </div>
                      ))
                    ) : (
                      <div className="dropdown-empty">No party found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label>Amount Paid</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    setFormData({ ...formData, amountPaid: val });
                  }}
                  placeholder="0"
                />
              </div>

              <div className="field">
                <label>Payment Out Discount</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="discount"
                  value={formData.discount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    setFormData({ ...formData, discount: val });
                  }}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* ================= RIGHT CARD ================= */}
          <div className="card">
            <div className="row">
              <div className="field">
                <label>Payment Date</label>
                <div className="date-input">
                  <input
                    value={formData.paymentDate}
                    readOnly
                    onClick={() => dateInputRef.current?.showPicker()}
                  />
                  <Calendar
                    size={16}
                    onClick={() => dateInputRef.current?.showPicker()}
                    style={{ cursor: "pointer" }}
                  />
                  <input
                    type="date"
                    ref={dateInputRef}
                    style={{ position: "absolute", opacity: 0 }}
                    onChange={(e) => {
                      const formattedDate = new Date(
                        e.target.value
                      ).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      });
                      setFormData({ ...formData, paymentDate: formattedDate });
                    }}
                  />
                </div>
              </div>

              <div className="field">
                <label>Payment Mode</label>
                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                >
                  <option>Cash</option>
                  <option>Bank</option>
                  <option>UPI</option>
                </select>
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label>Payment Out Prefix</label>
                <input
                  name="prefix"
                  value={formData.prefix}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Payment Out Number</label>
                <input
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Enter Notes"
              />
            </div>
          </div>
        </div>

        {/* ================= EMPTY STATE ================= */}
        <div className="paymentout-empty">
          <img src={emptyImg} alt="No transactions" />
          <h3>No Transactions yet!</h3>
          <p>Select Party Name to view transactions</p>
          <button onClick={openPartyDropdown}>Select Party</button>
        </div>
      </div>

      {/* Inline settings modal — no external dependency */}
      {openSettings && (
        <PaymentOutSettingsModal onClose={handleSettingsClose} />
      )}
    </>
  );
}