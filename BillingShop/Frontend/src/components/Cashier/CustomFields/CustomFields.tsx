import { useState } from "react";
import emptyImg from "../../../assets/3.png";   // EMPTY STATE IMAGE
import addFieldImg from "../../../assets/4.png"; // ADD FIELD MODAL IMAGE
import "./CustomFields.css";

const CustomFields = () => {
  const [openSettings, setOpenSettings] = useState(false);
  const [openAddField, setOpenAddField] = useState(false);

  const [batching, setBatching] = useState(false);
  const [alertExpiry, setAlertExpiry] = useState(false);
  const [serialEnabled, setSerialEnabled] = useState(false);

  const [fields, setFields] = useState<string[]>([""]);

  return (
    <>
      {/* ================= EMPTY STATE ================= */}
      <div className="cf-wrapper">
        <div className="cf-card">
          <img src={emptyImg} className="cf-image" />

          <p className="cf-text">
            You don’t have any custom fields <br />
            created yet
          </p>

          <button
            className="cf-btn"
            onClick={() => setOpenSettings(true)}
          >
            + Create Custom fields
          </button>
        </div>
      </div>

      {/* ================= ITEM SETTINGS MODAL ================= */}
      {openSettings && (
        <div className="cf-modal-backdrop">
          <div className="cf-modal">
            {/* HEADER */}
            <div className="cf-modal-header">
              <h3>Item Settings</h3>
              <button onClick={() => setOpenSettings(false)}>×</button>
            </div>

            {/* BODY */}
            <div className="cf-modal-body">
              {/* STOCK VALUE */}
              <div className="cf-row">
                <span>Stock Value Calculation</span>
                <select>
                  <option>Purchase Price with Tax</option>
                  <option>Purchase Price without Tax</option>
                </select>
              </div>

              {/* BATCHING */}
              <div className="cf-toggle-row">
                <div>
                  <strong>Enable Item Batching & Expiry</strong>
                  <p>
                    Keep track of multiple prices, expiry and
                    manufacturing dates
                  </p>
                </div>
                <label className="cf-switch">
                  <input
                    type="checkbox"
                    checked={batching}
                    onChange={() => {
                      setBatching(!batching);
                      if (batching) setAlertExpiry(false);
                    }}
                  />
                  <span className="cf-slider"></span>
                </label>
              </div>

              {/* ALERT BEFORE EXPIRY */}
              {batching && (
                <div className="cf-toggle-row">
                  <div>
                    <strong>Alert Before Expiry</strong>
                    <p>
                      We will notify you the below selected days
                      before your batch expires
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      style={{ width: "60px" }}
                      disabled={!alertExpiry}
                    />
                    <select disabled={!alertExpiry}>
                      <option>Select</option>
                      <option>Days</option>
                      <option>Weeks</option>
                      <option>Months</option>
                    </select>

                    <label className="cf-switch">
                      <input
                        type="checkbox"
                        checked={alertExpiry}
                        onChange={() =>
                          setAlertExpiry(!alertExpiry)
                        }
                      />
                      <span className="cf-slider"></span>
                    </label>
                  </div>
                </div>
              )}

              {/* SERIAL / IMEI */}
              <div className="cf-toggle-row">
                <div>
                  <strong>Enable Serial Number / IMEI</strong>
                  <p>
                    Manage your items by Serial Number or IMEI and
                    track them easily
                  </p>
                </div>
                <label className="cf-switch">
                  <input
                    type="checkbox"
                    checked={serialEnabled}
                    onChange={() =>
                      setSerialEnabled(!serialEnabled)
                    }
                  />
                  <span className="cf-slider"></span>
                </label>
              </div>

              {serialEnabled && (
                <div style={{ marginBottom: "16px" }}>
                  <label>Field Name</label>
                  <input
                    className="input"
                    defaultValue="IMEI / Serial No"
                  />
                  <p className="cf-hint">
                    Choose a custom field name like IMEI Number,
                    Model Number, Part Number etc.
                  </p>
                </div>
              )}

              {/* MRP */}
              <div className="cf-toggle-row">
                <strong>MRP</strong>
                <label className="cf-switch">
                  <input type="checkbox" />
                  <span className="cf-slider"></span>
                </label>
              </div>

              {/* WHOLESALE */}
              <div className="cf-toggle-row">
                <strong>Wholesale Price</strong>
                <label className="cf-switch">
                  <input type="checkbox" />
                  <span className="cf-slider"></span>
                </label>
              </div>

              {/* PARTY WISE */}
              <div className="cf-toggle-row">
                <div>
                  <strong>
                    Party Wise Item Price{" "}
                    <span className="cf-new">New</span>
                  </strong>
                  <p>
                    Set custom Sales Prices for individual Parties
                  </p>
                </div>
                <label className="cf-switch">
                  <input type="checkbox" />
                  <span className="cf-slider"></span>
                </label>
              </div>

              {/* ADD CUSTOM FIELD */}
              <button
                className="cf-add-field"
                onClick={() => setOpenAddField(true)}
              >
                + Add Custom Field
              </button>
            </div>

            {/* FOOTER */}
            <div className="cf-modal-footer">
              <button
                className="cf-cancel"
                onClick={() => setOpenSettings(false)}
              >
                Cancel
              </button>
              <button className="cf-save">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD ITEM CUSTOM FIELD MODAL ================= */}
      {openAddField && (
        <div className="cf-modal-backdrop">
          <div className="cf-modal" style={{ width: "650px" }}>
            {/* HEADER */}
            <div className="cf-modal-header">
              <h3>Add Item Custom Fields</h3>
              <button onClick={() => setOpenAddField(false)}>
                ×
              </button>
            </div>

            {/* TOP IMAGE (4.png) */}
            <div style={{ textAlign: "center", padding: "16px" }}>
              <img
                src={addFieldImg}
                style={{ width: "180px" }}
              />
            </div>

            {/* BODY */}
            <div className="cf-modal-body">
              {fields.map((field, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "12px",
                  }}
                >
                  <input
                    className="input"
                    placeholder="Enter Custom Field Name"
                    value={field}
                    onChange={(e) => {
                      const updated = [...fields];
                      updated[index] = e.target.value;
                      setFields(updated);
                    }}
                    style={{ flex: 1 }}
                  />

                  <button className="cf-eye">👁</button>

                  <button
                    className="cf-delete"
                    onClick={() =>
                      setFields(fields.filter((_, i) => i !== index))
                    }
                  >
                    🗑
                  </button>
                </div>
              ))}

              <button
                className="cf-dashed"
                onClick={() => setFields([...fields, ""])}
              >
                + Add New Field
              </button>
            </div>

            {/* FOOTER */}
            <div className="cf-modal-footer">
              <button
                className="cf-cancel"
                onClick={() => setOpenAddField(false)}
              >
                Close
              </button>
              <button className="cf-save">Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomFields;
