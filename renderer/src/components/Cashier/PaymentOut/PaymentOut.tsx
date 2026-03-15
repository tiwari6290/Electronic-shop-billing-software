import "./PaymentOut.css";
import { Calendar, ChevronDown, X, ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import emptyImg from "../../../assets/5.png";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";
import {
  createPaymentOut,
  getPaymentOutSettings,
  updatePaymentOutSettings,
} from "@/services/paymentOutService";
import { getAllParties } from "@/services/partyService";
import api from "@/lib/axios";

/* ══════════════════════════════════════════
   INLINE SETTINGS MODAL
══════════════════════════════════════════ */
interface SettingsModalProps {
  onClose: (saved: boolean, prefix: string, sequenceNumber: number) => void;
}

function PaymentOutSettingsModal({ onClose }: SettingsModalProps) {
  const [prefix, setPrefix] = useState("");
  const [seqNum, setSeqNum] = useState("1");

  useEffect(() => {
    getPaymentOutSettings()
      .then((res) => {
        setPrefix(res.data.prefix || "");
        setSeqNum(String(res.data.sequenceNumber || 1));
      })
      .catch((err) => console.error("Failed to load settings", err));
  }, []);

  const handleSave = async () => {
    const num = parseInt(seqNum) || 1;
    await updatePaymentOutSettings({ prefix });
    onClose(true, prefix, num);
  };

  const handleCancel = () => onClose(false, prefix, parseInt(seqNum) || 1);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={handleCancel}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          width: 420,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #e4e7ec",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 15, color: "#1d2939" }}>
            Payment Out Settings
          </span>
          <button
            onClick={handleCancel}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#667085",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "20px" }}>
          <p style={{ fontSize: 13, color: "#667085", margin: "0 0 16px" }}>
            Set the prefix for Payment Out vouchers. The sequence number is
            managed automatically by the server.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#344054",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Prefix
              </label>
              <input
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d0d5dd",
                  borderRadius: 6,
                  fontSize: 13,
                  color: "#1d2939",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#344054",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Sequence Number
              </label>
              <input
                type="number"
                min={1}
                value={seqNum}
                readOnly
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d0d5dd",
                  borderRadius: 6,
                  fontSize: 13,
                  color: "#667085",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  background: "#f9fafb",
                  cursor: "not-allowed",
                }}
              />
            </div>
          </div>
          <div
            style={{
              marginTop: 14,
              padding: "10px 14px",
              background: "#f9fafb",
              borderRadius: 6,
              border: "1px solid #e4e7ec",
            }}
          >
            <span style={{ fontSize: 12, color: "#667085" }}>Preview: </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#4361ee" }}>
              {prefix}
              {parseInt(seqNum) || 1}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: "14px 20px",
            borderTop: "1px solid #e4e7ec",
          }}
        >
          <button
            onClick={handleCancel}
            style={{
              padding: "8px 20px",
              border: "1px solid #d0d5dd",
              borderRadius: 6,
              background: "#fff",
              color: "#344054",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "8px 20px",
              border: "none",
              borderRadius: 6,
              background: "#4361ee",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
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

  /* ── PARTY DROPDOWN ── */
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);
  const [partySearch, setPartySearch] = useState("");
  const partyDropdownRef = useRef<HTMLDivElement>(null);
  const partySearchRef = useRef<HTMLInputElement>(null);
  const [parties, setParties] = useState<any[]>([]);

  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  /* ── FORM DATA ── */
  const [formData, setFormData] = useState({
    partyId: "",
    partyName: "",
    amountPaid: "",
    discount: "",
    paymentDate: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    paymentMode: "Cash",
    prefix: "",
    number: "",
    notes: "",
  });

  /* ── LOAD PARTIES ── */
  useEffect(() => {
    getAllParties()
      .then((res) => setParties(res.data))
      .catch((err) => console.error("Failed to load parties", err));
  }, []);

  /* ── LOAD SETTINGS FROM BACKEND ── */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await getPaymentOutSettings();
        const settings = res.data;

        setFormData((prev) => ({
          ...prev,
          prefix: settings.prefix || "",
          number: String(settings.sequenceNumber || 1),
        }));
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    };

    loadSettings();
  }, []);

  const filteredParties = parties.filter((p) =>
    p.name.toLowerCase().includes(partySearch.toLowerCase()),
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
    if (showPartyDropdown)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPartyDropdown]);

  useEffect(() => {
    if (showPartyDropdown) setTimeout(() => partySearchRef.current?.focus(), 0);
  }, [showPartyDropdown]);

  /* ── HANDLERS ── */
  const openPartyDropdown = () => setShowPartyDropdown(true);

  const togglePartyDropdown = () => {
    setShowPartyDropdown((prev) => !prev);
    if (showPartyDropdown) setPartySearch("");
  };

  const selectParty = async (party: any) => {
    setFormData((prev) => ({
      ...prev,
      partyId: String(party.id),
      partyName: party.name,
    }));
    setShowPartyDropdown(false);
    setPartySearch("");

    try {
      setInvoicesLoading(true);
      const res = await api.get(`/purchase-invoices/party/${party.id}/pending`);

      let invoiceData = [];

      if (Array.isArray(res.data)) {
        invoiceData = res.data;
      } else if (Array.isArray(res.data.data)) {
        invoiceData = res.data.data;
      }

      setInvoices(invoiceData);
    } catch (err) {
      console.error("Failed to load invoices", err);
      setInvoices([]);
    } finally {
      setInvoicesLoading(false);
    }
  };

  const clearParty = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData((prev) => ({ ...prev, partyId: "", partyName: "" }));
    setShowPartyDropdown(false);
    setPartySearch("");
    setInvoices([]);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSettingsClose = (
    saved: boolean,
    prefix: string,
    sequenceNumber: number,
  ) => {
    setOpenSettings(false);
    if (saved)
      setFormData((prev) => ({
        ...prev,
        prefix,
        number: String(sequenceNumber),
      }));
  };

  /* ── SAVE ── */
  const handleSave = async () => {
    if (!formData.partyId || !formData.amountPaid) {
      alert("Please select a party and enter amount paid");
      return;
    }

    try {
      const payload = {
        partyId: Number(formData.partyId),
        date: new Date(formData.paymentDate),
        amountPaid: Number(formData.amountPaid),
        discount: Number(formData.discount || 0),
        paymentMode: formData.paymentMode,
        notes: formData.notes || null,
      };

      await createPaymentOut(payload);
      navigate("/cashier/payment-out-list");
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || "Failed to create payment";
      alert(msg);
    }
  };

  /* ── UI ── */
  return (
    <>
      <div className="navbar-wrapper">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <Navbar
          title="Payment Out"
          showSettings
          onSettingsClick={() => setOpenSettings(true)}
          cancelAction={{ label: "Cancel", onClick: () => navigate(-1) }}
          primaryAction={{ label: "Save", onClick: handleSave }}
        />
      </div>

      <div className="paymentout-page">
        <div className="paymentout-top">
          {/* ── LEFT CARD ── */}
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
                          className={`dropdown-item${formData.partyName === party.name ? " dropdown-item--selected" : ""}`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectParty(party);
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
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      amountPaid: e.target.value.replace(/[^0-9.]/g, ""),
                    }))
                  }
                  placeholder="0"
                />
              </div>

              <div className="field">
                <label>Payment Out Discount</label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="discount"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discount: e.target.value.replace(/[^0-9.]/g, ""),
                    }))
                  }
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT CARD ── */}
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
                      const formatted = new Date(
                        e.target.value,
                      ).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      });
                      setFormData((prev) => ({
                        ...prev,
                        paymentDate: formatted,
                      }));
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
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Bank">Bank</option>
                  <option value="EMI">EMI</option>
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
                {/* Read-only — sequence is managed by the backend */}
                <input
                  name="number"
                  value={formData.number}
                  readOnly
                  style={{ background: "#f9fafb", cursor: "not-allowed", color: "#667085" }}
                />
              </div>
            </div>

            {/* Voucher preview */}
            {formData.prefix && formData.number && (
              <div
                style={{
                  marginTop: 4,
                  padding: "8px 12px",
                  background: "#f0f4ff",
                  borderRadius: 6,
                  border: "1px solid #c7d2fe",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "#667085" }}>Voucher Preview: </span>
                <span style={{ fontWeight: 700, color: "#4361ee" }}>
                  {formData.prefix}
                  {formData.number}
                </span>
              </div>
            )}

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

        {/* INVOICE TABLE / EMPTY STATE */}
        {!formData.partyId ? (
          <div className="paymentout-empty">
            <img src={emptyImg} alt="No transactions" />
            <h3>No Transactions yet!</h3>
            <p>Select Party Name to view transactions</p>
            <button onClick={openPartyDropdown}>Select Party</button>
          </div>
        ) : invoicesLoading ? (
          <div className="paymentout-empty">
            <p style={{ color: "#667085" }}>Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="paymentout-empty">
            <h3>No Pending Invoices</h3>
            <p>This party has no outstanding purchase invoices</p>
          </div>
        ) : (
          <div className="paymentout-invoice-table-wrapper">
            <table className="paymentout-invoice-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Invoice Number</th>
                  <th>Invoice Amount</th>
                  <th>Balance Due</th>
                </tr>
              </thead>

              <tbody>
                {invoices.map((inv: any) => (
                  <tr key={inv.id}>
                    <td>
                      {new Date(inv.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>{inv.invoiceNumber}</td>
                    <td>₹ {Number(inv.totalAmount).toLocaleString("en-IN")}</td>
                    <td>
                      ₹ {Number(inv.balanceAmount ?? 0).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              style={{
                marginTop: "12px",
                textAlign: "right",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Outstanding Balance: ₹{" "}
              {invoices
                .reduce((sum, inv) => sum + Number(inv.balanceAmount || 0), 0)
                .toLocaleString("en-IN")}
            </div>
          </div>
        )}
      </div>

      {openSettings && (
        <PaymentOutSettingsModal onClose={handleSettingsClose} />
      )}
    </>
  );
}