import { useState } from "react";
import emptyImg from "../../../assets/3.png";
import addFieldImg from "../../../assets/4.png";
import { EyeOff, Trash2 } from "lucide-react";
import "./CustomFields.css";

const CustomFields = () => {
  /* ── modal open states ── */
  const [openSettings, setOpenSettings] = useState(false);
  const [openAddField, setOpenAddField] = useState(false);

  /* ── Item Settings state ── */
  const [stockCalc, setStockCalc] = useState("Purchase Price with Tax");
  const [showStockDd, setShowStockDd] = useState(false);
  const [batching, setBatching] = useState(false);
  const [alertExpiry, setAlertExpiry] = useState(false);
  const [expiryDays, setExpiryDays] = useState("");
  const [expiryNumber, setExpiryNumber] = useState("");
  const [showDaysDd, setShowDaysDd] = useState(false);
  const [serialEnabled, setSerialEnabled] = useState(false);
  const [fieldName, setFieldName] = useState("IMEI/Serial No");
  const [mrp, setMrp] = useState(false);
  const [showMrpDiscount, setShowMrpDiscount] = useState(false);
  const [wholesale, setWholesale] = useState(false);
  const [partyWise, setPartyWise] = useState(false);

  /* ── saved custom fields (shown in panel after save) ── */
  const [savedFields, setSavedFields] = useState<string[]>([]);

  /* ── Add Field modal state ── */
  const [fields, setFields] = useState<string[]>([""]);

  const STOCK_OPTIONS = [
    "Purchase Price with Tax",
    "Purchase Price Without Tax",
    "Sales Price with Tax",
    "Sales Price Without Tax",
  ];

  const handleSettingsSave = () => {
    setOpenSettings(false);
  };

  const handleAddFieldSave = () => {
    const valid = fields.filter((f) => f.trim() !== "");
    setSavedFields(valid);
    setOpenAddField(false);
    setOpenSettings(false);
  };

  /* ════════════════════════════════════════════
     PANEL — empty state OR saved fields view
  ════════════════════════════════════════════ */
  return (
    <>
      {savedFields.length === 0 ? (
        /* ── EMPTY STATE ── */
        <div className="cf-wrapper">
          <div className="cf-card">
            <img src={emptyImg} className="cf-image" alt="" />
            <p className="cf-text">
              You don't have any custom fields <br />
              created yet
            </p>
            <button className="cf-btn" onClick={() => setOpenSettings(true)}>
              + Create Custom fields
            </button>
          </div>
        </div>
      ) : (
        /* ── FIELDS VIEW (Image 8) ── */
        <div className="cf-fields-panel">
          {savedFields.map((f, i) => (
            <div key={i} className="cf-field-entry">
              <label className="cf-field-label">{f}</label>
              <input placeholder="Enter Value" className="cf-field-input" />
            </div>
          ))}
          <button className="cf-add-item-link" onClick={() => setOpenSettings(true)}>
            + Add Item Custom Fields
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════
          ITEM SETTINGS MODAL
      ════════════════════════════════════════════ */}
      {openSettings && (
        <div className="cf-modal-backdrop">
          <div className="cf-modal">
            <div className="cf-modal-header">
              <h3>Item Settings</h3>
              <button onClick={() => setOpenSettings(false)}>×</button>
            </div>

            <div className="cf-modal-body">
              {/* STOCK VALUE CALCULATION */}
              <div className="cf-row">
                <span>Stock Value Calculation</span>
                <div className="cf-dd-wrapper">
                  <div
                    className="cf-dd-trigger"
                    onClick={() => setShowStockDd(!showStockDd)}
                  >
                    {stockCalc} <span className="cf-dd-arrow">▾</span>
                  </div>
                  {showStockDd && (
                    <div className="cf-dd-list">
                      {STOCK_OPTIONS.map((o) => (
                        <div
                          key={o}
                          className={`cf-dd-item ${stockCalc === o ? "cf-dd-selected" : ""}`}
                          onClick={() => { setStockCalc(o); setShowStockDd(false); }}
                        >
                          {o}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* BATCHING & EXPIRY */}
              <div className="cf-toggle-row">
                <div>
                  <strong>Enable Item Batching &amp; Expiry</strong>
                  <p>Keep track of multiple prices, expiry and manufacturing dates</p>
                </div>
                <label className="cf-switch">
                  <input
                    type="checkbox"
                    checked={batching}
                    onChange={() => { setBatching(!batching); if (batching) setAlertExpiry(false); }}
                  />
                  <span className="cf-slider"></span>
                </label>
              </div>

              {/* ALERT BEFORE EXPIRY */}
              {batching && (
                <div className="cf-toggle-row">
                  <div>
                    <strong>Alert Before Expiry</strong>
                    <p>We will notify you the below selected days before your batch expires</p>
                  </div>
                  <div className="cf-expiry-right">
                    <label className="cf-switch">
                      <input
                        type="checkbox"
                        checked={alertExpiry}
                        onChange={() => setAlertExpiry(!alertExpiry)}
                      />
                      <span className="cf-slider"></span>
                    </label>
                    <input
                      type="number"
                      className="cf-expiry-number"
                      placeholder=""
                      value={expiryNumber}
                      onChange={(e) => setExpiryNumber(e.target.value)}
                      min="1"
                    />
                    <div className="cf-dd-wrapper cf-days-dd">
                      <div
                        className="cf-dd-trigger cf-days-trigger"
                        onClick={() => setShowDaysDd(!showDaysDd)}
                      >
                        {expiryDays || "Select"} <span className="cf-dd-arrow">▾</span>
                      </div>
                      {showDaysDd && (
                        <div className="cf-dd-list">
                          {["30 Days", "60 Days", "90 Days"].map((d) => (
                            <div
                              key={d}
                              className={`cf-dd-item ${expiryDays === d ? "cf-dd-selected" : ""}`}
                              onClick={() => { setExpiryDays(d); setExpiryNumber(d.split(" ")[0]); setShowDaysDd(false); }}
                            >
                              {d}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SERIAL / IMEI */}
              <div className="cf-toggle-row">
                <div>
                  <strong>Enable Serial Number/IMEI</strong>
                  <p>Manage your items by Serial Number or IMEI and track them easily</p>
                </div>
                <label className="cf-switch">
                  <input
                    type="checkbox"
                    checked={serialEnabled}
                    onChange={() => setSerialEnabled(!serialEnabled)}
                  />
                  <span className="cf-slider"></span>
                </label>
              </div>

              {serialEnabled && (
                <div className="cf-serial-expand">
                  <label>Field Name</label>
                  <input
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    className="cf-serial-input"
                  />
                  <p className="cf-hint">
                    Choose a custom field name like IMEI Number, Model Number, Part Number etc. for adding the serial numbers.
                  </p>
                </div>
              )}

              {/* MRP */}
              <div className="cf-toggle-row">
                <strong>MRP</strong>
                <label className="cf-switch">
                  <input
                    type="checkbox"
                    checked={mrp}
                    onChange={(e) => { setMrp(e.target.checked); setShowMrpDiscount(e.target.checked); }}
                  />
                  <span className="cf-slider"></span>
                </label>
              </div>
              {mrp && (
                <div className="cf-mrp-check">
                  <label className="cf-checkbox-row">
                    <input
                      type="checkbox"
                      checked={showMrpDiscount}
                      onChange={(e) => setShowMrpDiscount(e.target.checked)}
                    />
                    Show Discount(%) on MRP on invoice preview
                  </label>
                </div>
              )}

              {/* WHOLESALE */}
              <div className="cf-toggle-row">
                <strong>Wholesale Price</strong>
                <label className="cf-switch">
                  <input type="checkbox" checked={wholesale} onChange={(e) => setWholesale(e.target.checked)} />
                  <span className="cf-slider"></span>
                </label>
              </div>

              {/* PARTY WISE */}
              <div className="cf-toggle-row">
                <div>
                  <strong>
                    Party Wise Item Price <span className="cf-new">New</span>
                  </strong>
                  <p>Set custom Sales Prices for individual Parties</p>
                </div>
                <label className="cf-switch">
                  <input type="checkbox" checked={partyWise} onChange={(e) => setPartyWise(e.target.checked)} />
                  <span className="cf-slider"></span>
                </label>
              </div>

              {/* SAVED CUSTOM FIELDS LIST */}
              {savedFields.map((f, i) => (
                <div key={i} className="cf-saved-field-row">
                  <span>{f}</span>
                  <button
                    className="cf-delete-link"
                    onClick={() => setSavedFields((prev) => prev.filter((_, j) => j !== i))}
                  >
                    Delete
                  </button>
                </div>
              ))}

              {/* ADD CUSTOM FIELD */}
              <button className="cf-add-field" onClick={() => setOpenAddField(true)}>
                + Add Custom Field
              </button>
            </div>

            <div className="cf-modal-footer">
              <button className="cf-cancel" onClick={() => setOpenSettings(false)}>Cancel</button>
              <button className="cf-save" onClick={handleSettingsSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          ADD ITEM CUSTOM FIELDS MODAL
      ════════════════════════════════════════════ */}
      {openAddField && (
        <div className="cf-modal-backdrop">
          <div className="cf-modal cf-modal-wide">
            <div className="cf-modal-header">
              <h3>Add Item Custom Fields</h3>
              <button onClick={() => setOpenAddField(false)}>×</button>
            </div>

            {/* TOP ILLUSTRATION */}
            <div className="cf-addfield-img-wrap">
              <img src={addFieldImg} alt="" className="cf-addfield-img" />
            </div>

            <div className="cf-modal-body">
              <label>Field Name</label>

              {fields.map((field, index) => (
                <div key={index} className="cf-field-row">
                  <input
                    placeholder="Enter Custom Field Name"
                    value={field}
                    onChange={(e) => {
                      const updated = [...fields];
                      updated[index] = e.target.value;
                      setFields(updated);
                    }}
                    className="cf-field-name-input"
                  />
                  <button className="cf-icon-btn">
                    <EyeOff size={16} />
                  </button>
                  <button
                    className="cf-icon-btn cf-icon-btn-del"
                    onClick={() => setFields(fields.filter((_, i) => i !== index))}
                  >
                    <Trash2 size={16} />
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

            <div className="cf-modal-footer">
              <button className="cf-cancel" onClick={() => setOpenAddField(false)}>Close</button>
              <button className="cf-save" onClick={handleAddFieldSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomFields;