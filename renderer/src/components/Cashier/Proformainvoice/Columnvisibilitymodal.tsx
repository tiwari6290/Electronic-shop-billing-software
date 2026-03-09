import React, { useState } from "react";
import "./ColumnVisibilityModal.css";

// ── Inline SVG Icons ──────────────────────────────────────────────────────────
const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

interface ColumnConfig {
  showPricePerItem: boolean;
  showQuantity: boolean;
}

interface Props {
  config: ColumnConfig;
  onSave: (cfg: ColumnConfig) => void;
  onClose: () => void;
}

const ColumnVisibilityModal: React.FC<Props> = ({ config, onSave, onClose }) => {
  const [cfg, setCfg] = useState<ColumnConfig>({ ...config });

  return (
    <div className="cvm-overlay" onClick={onClose}>
      <div className="cvm-modal" onClick={e => e.stopPropagation()}>
        <div className="cvm-header">
          <h2>Show/Hide Columns in Invoice</h2>
          <button className="cvm-close" onClick={onClose}><IconClose /></button>
        </div>
        <div className="cvm-body">
          <div className="cvm-row">
            <span>Price/Item (₹)</span>
            <label className="cvm-toggle">
              <input type="checkbox" checked={cfg.showPricePerItem}
                onChange={e => setCfg(p => ({ ...p, showPricePerItem: e.target.checked }))} />
              <span className="cvm-slider" />
            </label>
          </div>
          <div className="cvm-row">
            <span>Quantity</span>
            <label className="cvm-toggle">
              <input type="checkbox" checked={cfg.showQuantity}
                onChange={e => setCfg(p => ({ ...p, showQuantity: e.target.checked }))} />
              <span className="cvm-slider" />
            </label>
          </div>
          <div className="cvm-section-title">CUSTOM COLUMN</div>
          <div className="cvm-empty-custom">
            <div className="cvm-empty-text">No Custom Columns added</div>
            <div className="cvm-empty-sub">Any custom column such as Batch # &amp; Expiry Date can be added</div>
          </div>
          <div className="cvm-info-box">
            To add Custom Item Columns - Go to <strong>Item settings</strong> from{" "}
            <a href="#" className="cvm-link">Items page (click here)</a>
          </div>
        </div>
        <div className="cvm-footer">
          <button className="cvm-cancel" onClick={onClose}>Cancel</button>
          <button className="cvm-save" onClick={() => onSave(cfg)}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default ColumnVisibilityModal;