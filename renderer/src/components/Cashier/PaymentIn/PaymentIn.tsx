import "./PaymentIn.css"; // reuse same CSS
import { Calendar, ChevronDown, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import emptyImg from "../../../assets/5.png";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";
import QuickQuotationSettingsModal from "../QuickQuotationSettingsModal/QuickVoucherSettingsModal";


export default function PaymentIn() {
  const navigate = useNavigate();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [openSettings, setOpenSettings] = useState(false);


  /* ================= PARTY DROPDOWN ================= */
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);
  const [partySearch, setPartySearch] = useState("");
  const partyDropdownRef = useRef<HTMLDivElement>(null);
  const partySearchRef = useRef<HTMLInputElement>(null);

  const parties = [
    { id: 1, name: "Customer A" },
    { id: 2, name: "Customer B" },
    { id: 3, name: "Customer C" },
  ];

  const filteredParties = parties.filter((p) =>
    p.name.toLowerCase().includes(partySearch.toLowerCase())
  );

  /* ================= CLICK OUTSIDE TO CLOSE DROPDOWN ================= */
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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPartyDropdown]);

  /* Auto-focus search input when dropdown opens */
  useEffect(() => {
    if (showPartyDropdown) {
      setTimeout(() => partySearchRef.current?.focus(), 0);
    }
  }, [showPartyDropdown]);

  /* ================= FORM DATA ================= */
  const [formData, setFormData] = useState({
    partyName: "",
    amountReceived: "",
    discount: "",
    paymentDate: "08 Feb 2026",
    paymentMode: "Cash",
    prefix: "ME/PR/26-27/",
    number: "1",
    notes: "",
  });

  /* ================= HANDLERS ================= */
  const openPartyDropdown = () => {
    setShowPartyDropdown(true);
  };

  const togglePartyDropdown = () => {
    setShowPartyDropdown((prev) => !prev);
    if (showPartyDropdown) setPartySearch("");
  };

  const selectParty = (partyName: string) => {
    setFormData({ ...formData, partyName });
    setShowPartyDropdown(false);
    setPartySearch("");
  };

  /* Clears selection — stops propagation so dropdown doesn't open */
  const clearParty = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData({ ...formData, partyName: "" });
    setShowPartyDropdown(false);
    setPartySearch("");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /* ================= UI ================= */
  return (
    <>
      {/* ================= NAVBAR ================= */}
      <Navbar
  title="Payment In"
  showSettings={true}
  onSettingsClick={() => setOpenSettings(true)}
  cancelAction={{
    label: "Cancel",
    onClick: () => navigate(-1),
  }}
  primaryAction={{
    label: "Save",
    onClick: () => console.log("Saving Payment In", formData),
  }}
/>


      {/* ================= PAGE BODY ================= */}
      <div className="paymentout-page">
        <div className="paymentout-top">
          {/* ================= LEFT CARD ================= */}
          <div className="card">
            {/* -------- PARTY FIELD -------- */}
            <div className="field">
              <label>Party Name</label>

              <div className="custom-select-wrapper" ref={partyDropdownRef}>
                {/* ---- TRIGGER ROW ---- */}
                <div
                  className="custom-select"
                  onClick={togglePartyDropdown}
                >
                  <span className={formData.partyName ? "" : "placeholder"}>
                    {formData.partyName || "Search party by name or number"}
                  </span>

                  <div className="custom-select-icons">
                    {/* ✕ clear button — only shows when a party is selected */}
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

                {/* ---- DROPDOWN ---- */}
                {showPartyDropdown && (
                  <div className="custom-dropdown">
                    {/* Search input */}
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

                    {/* Filtered list */}
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
                <label>Amount Received</label>
                <input
                  type="number"
                  name="amountReceived"
                  value={formData.amountReceived}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="field">
                <label>
                  Payment In Discount <span className="info">i</span>
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
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

                      setFormData({
                        ...formData,
                        paymentDate: formattedDate,
                      });
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
                <label>Payment In Prefix</label>
                <input
                  name="prefix"
                  value={formData.prefix}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Payment In Number</label>
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
      {openSettings && (
  <QuickQuotationSettingsModal
    type="paymentIn"
    onClose={() => setOpenSettings(false)}
  />
)}

    </>
  );
}