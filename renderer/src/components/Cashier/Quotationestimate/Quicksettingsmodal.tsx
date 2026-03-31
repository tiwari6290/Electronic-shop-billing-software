import { useState, useEffect } from "react";
import { apiGetQuotationSettings, apiSaveQuotationSettings } from "./Quotationtypes";
import "./QuickSettingsModal.css";

interface Settings {
  prefixEnabled: boolean;
  prefix: string;
  sequenceNumber: number;
  showItemImage: boolean;
  priceHistory: boolean;
}

interface QuickSettingsModalProps {
  onClose: () => void;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`qsm-toggle ${checked ? "qsm-toggle--on" : ""}`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
    >
      <span className="qsm-toggle-thumb" />
    </button>
  );
}

export default function QuickSettingsModal({ onClose }: QuickSettingsModalProps) {
  const [settings, setSettings] = useState<Settings>({
    prefixEnabled: false,
    prefix: "",
    sequenceNumber: 1,
    showItemImage: true,
    priceHistory: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings from backend on open
  useEffect(() => {
    apiGetQuotationSettings()
      .then((s) => {
        setSettings({
          prefixEnabled: !!(s.prefix && s.prefix.trim().length > 0),
          prefix: s.prefix ?? "",
          sequenceNumber: s.sequenceNumber ?? 1,
          showItemImage: true,
          priceHistory: true,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      await apiSaveQuotationSettings({
        prefix: settings.prefixEnabled ? settings.prefix : "",
        sequenceNumber: settings.sequenceNumber,
      });
      onClose();
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="qsm-overlay" onClick={onClose}>
        <div className="qsm-modal" onClick={(e) => e.stopPropagation()}>
          <div className="qsm-header">
            <h2 className="qsm-title">Quick Quotation Settings</h2>
            <button className="qsm-close" onClick={onClose}>✕</button>
          </div>
          <div style={{ padding: "32px", textAlign: "center", color: "#6b7280" }}>
            Loading settings...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="qsm-overlay" onClick={onClose}>
      <div className="qsm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="qsm-header">
          <h2 className="qsm-title">Quick Quotation Settings</h2>
          <button className="qsm-close" onClick={onClose}>✕</button>
        </div>

        {/* Prefix & Sequence */}
        <div className="qsm-card">
          <div className="qsm-row">
            <div>
              <div className="qsm-card-title">Quotation Prefix &amp; Sequence Number</div>
              <div className="qsm-card-desc">Add your custom prefix &amp; sequence for Quotation Numbering</div>
            </div>
            <Toggle
              checked={settings.prefixEnabled}
              onChange={(v) => setSettings({ ...settings, prefixEnabled: v })}
            />
          </div>
          {settings.prefixEnabled && (
            <div className="qsm-fields">
              <div className="qsm-field-group">
                <label className="qsm-field-label">Prefix</label>
                <input
                  className="qsm-field-input"
                  placeholder="e.g. QT"
                  value={settings.prefix}
                  onChange={(e) => setSettings({ ...settings, prefix: e.target.value })}
                />
              </div>
              <div className="qsm-field-group">
                <label className="qsm-field-label">Sequence Number</label>
                <input
                  className="qsm-field-input"
                  type="number"
                  min={1}
                  value={settings.sequenceNumber}
                  onChange={(e) =>
                    setSettings({ ...settings, sequenceNumber: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
              <div className="qsm-preview">
                Preview: <strong>
                  {settings.prefix
                    ? `${settings.prefix}-${settings.sequenceNumber}`
                    : settings.sequenceNumber}
                </strong>
              </div>
            </div>
          )}
          {!settings.prefixEnabled && (
            <div className="qsm-fields">
              <div className="qsm-field-group">
                <label className="qsm-field-label">Sequence Number</label>
                <input
                  className="qsm-field-input"
                  type="number"
                  min={1}
                  value={settings.sequenceNumber}
                  onChange={(e) =>
                    setSettings({ ...settings, sequenceNumber: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
              <div className="qsm-preview">
                Preview: <strong>{settings.sequenceNumber}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Show Item Image */}
        <div className="qsm-card">
          <div className="qsm-row">
            <div>
              <div className="qsm-card-title">Show Item Image on Invoice</div>
              <div className="qsm-card-desc">
                This will apply to all vouchers except for Payment In and Payment Out
              </div>
            </div>
            <Toggle
              checked={settings.showItemImage}
              onChange={(v) => setSettings({ ...settings, showItemImage: v })}
            />
          </div>
        </div>

        {/* Price History */}
        <div className="qsm-card">
          <div className="qsm-row">
            <div>
              <div className="qsm-card-title">
                Price History
                <span className="qsm-badge-new">New</span>
              </div>
              <div className="qsm-card-desc">
                Show last 5 sales / purchase prices of the item for the selected party in invoice
              </div>
            </div>
            <Toggle
              checked={settings.priceHistory}
              onChange={(v) => setSettings({ ...settings, priceHistory: v })}
            />
          </div>
        </div>

        <div className="qsm-footer">
          <button className="qsm-btn-cancel" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="qsm-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}