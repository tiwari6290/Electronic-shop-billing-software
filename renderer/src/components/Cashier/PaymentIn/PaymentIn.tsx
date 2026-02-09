import "./PaymentIn.css"; // reuse same CSS
import { Calendar, ChevronDown } from "lucide-react";
import { useState, useRef } from "react";
import emptyImg from "../../../assets/5.png";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";

export default function PaymentIn() {
  const navigate = useNavigate();
  const dateInputRef = useRef<HTMLInputElement>(null);

  /* ================= PARTY DROPDOWN ================= */
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);

  const parties = [
    { id: 1, name: "Customer A" },
    { id: 2, name: "Customer B" },
    { id: 3, name: "Customer C" },
  ];

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

  const selectParty = (partyName: string) => {
    setFormData({ ...formData, partyName });
    setShowPartyDropdown(false);
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

              <div
                className="custom-select"
                onClick={openPartyDropdown}
              >
                <span>
                  {formData.partyName || "Search party by name or number"}
                </span>
                <ChevronDown size={16} />
              </div>

              {showPartyDropdown && (
                <div className="custom-dropdown">
                  {parties.map((party) => (
                    <div
                      key={party.id}
                      className="dropdown-item"
                      onClick={() => selectParty(party.name)}
                    >
                      {party.name}
                    </div>
                  ))}
                </div>
              )}
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
    </>
  );
}
