import React, { useState } from "react";
import { X } from "lucide-react";
import "./QuickQuotationSettingsModal.css"

interface Props {
  onClose: () => void;
}

const QuickQuotationSettingsModal: React.FC<Props> = ({ onClose }) => {
  const [enablePrefix, setEnablePrefix] = useState(true);
  const [showImage, setShowImage] = useState(true);
  const [priceHistory, setPriceHistory] = useState(true);

  const [prefix, setPrefix] = useState("");
  const [sequence, setSequence] = useState("1");

  return (
    <div className="qq-overlay">
      <div className="qq-modal">
        {/* HEADER */}
        <div className="qq-header">
          <h2>Quick Quotation Settings</h2>
          <X size={20} onClick={onClose} className="qq-close" />
        </div>

        <div className="qq-body">
          {/* PREFIX SECTION */}
          <div className="qq-card">
            <div className="qq-card-header">
              <div>
                <h3>Quotation Prefix & Sequence Number</h3>
                <p>Add your custom prefix & sequence for Quotation Numbering</p>
              </div>

              <Toggle
                checked={enablePrefix}
                onChange={() => setEnablePrefix(!enablePrefix)}
              />
            </div>

            {enablePrefix && (
              <div className="qq-expand">
                <div className="qq-input-row">
                  <div>
                    <label>Prefix</label>
                    <input
                      type="text"
                      placeholder="Prefix"
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                    />
                  </div>

                  <div>
                    <label>Sequence Number</label>
                    <input
                      type="number"
                      value={sequence}
                      onChange={(e) => setSequence(e.target.value)}
                    />
                  </div>
                </div>

                <p className="qq-preview">
                  Quotation Number: {prefix}
                  {sequence}
                </p>
              </div>
            )}
          </div>

          {/* SHOW IMAGE */}
          <div className="qq-card">
            <div className="qq-card-header">
              <div>
                <h3>Show Item Image on Invoice</h3>
                <p>
                  This will apply to all vouchers except for Payment In and
                  Payment Out
                </p>
              </div>

              <Toggle
                checked={showImage}
                onChange={() => setShowImage(!showImage)}
              />
            </div>
          </div>

          {/* PRICE HISTORY */}
          <div className="qq-card">
            <div className="qq-card-header">
              <div>
                <h3>
                  Price History <span className="qq-new">New</span>
                </h3>
                <p>
                  Show last 5 sales / purchase prices of the item for the
                  selected party in invoice
                </p>
              </div>

              <Toggle
                checked={priceHistory}
                onChange={() => setPriceHistory(!priceHistory)}
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="qq-footer">
          <button className="qq-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="qq-save">Save</button>
        </div>
      </div>
    </div>
  );
};

export default QuickQuotationSettingsModal;

/* ================= TOGGLE COMPONENT ================= */

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) => {
  return (
    <div
      className={`qq-toggle ${checked ? "active" : ""}`}
      onClick={onChange}
    >
      <div className="qq-toggle-circle" />
    </div>
  );
};
