import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Settings, Keyboard, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─── Shortcut types ───────────────────────────────────────────────────────────
interface ShortcutDef {
  label: string;
  keys: string[];
  action?: () => void;
}

interface ShortcutGroup {
  heading: string;
  shortcuts: ShortcutDef[];
}

// ─── KeyBadge ────────────────────────────────────────────────────────────────
function KeyBadge({ k }: { k: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 28,
        height: 24,
        padding: "0 6px",
        background: "#f3f4f6",
        border: "1px solid #d1d5db",
        borderRadius: 5,
        fontSize: 11,
        fontWeight: 600,
        color: "#374151",
        fontFamily: "monospace",
        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
      }}
    >
      {k}
    </span>
  );
}

// ─── Shortcuts Panel ──────────────────────────────────────────────────────────
function ShortcutsPanel({ groups, onClose }: { groups: ShortcutGroup[]; onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: 340,
        background: "#fff",
        borderLeft: "1px solid #e5e7eb",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.10)",
        zIndex: 1000,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: "#fff",
          zIndex: 1,
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>
            Keyboard shortcuts
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
            Press <KeyBadge k="Alt" /> to open or close the shortcuts panel
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#6b7280",
            padding: 4,
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Groups */}
      <div style={{ padding: "8px 0 24px" }}>
        {groups.map((group) => (
          <div key={group.heading}>
            <div
              style={{
                padding: "14px 20px 6px",
                fontSize: 12,
                fontWeight: 700,
                color: "#374151",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {group.heading}
            </div>
            {group.shortcuts.map((sc) => (
              <div
                key={sc.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 20px",
                  fontSize: 13.5,
                  color: "#374151",
                  borderBottom: "1px solid #f3f4f6",
                  transition: "background 0.12s",
                  cursor: sc.action ? "pointer" : "default",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background = "#f9fafb")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background = "")
                }
                onClick={sc.action}
              >
                <span>{sc.label}</span>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {sc.keys.map((k, i) => (
                    <React.Fragment key={i}>
                      <KeyBadge k={k} />
                      {i < sc.keys.length - 1 && (
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Navbar Props ─────────────────────────────────────────────────────────────
interface NavbarProps {
  title: string;
  showBackButton?: boolean;
  backPath?: string;

  showSettings?: boolean;
  settingsLabel?: string;
  onSettingsClick?: () => void;

  uploadAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  primaryAction?: { label: string; onClick: () => void };
  cancelAction?: { label: string; onClick: () => void };

  // Callback props for global shortcuts
  onSave?: () => void;
  onSaveAndNew?: () => void;
  onCancel?: () => void;
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar: React.FC<NavbarProps> = ({
  title,
  showBackButton = true,
  backPath = "/dashboard",

  showSettings = false,
  settingsLabel = "Settings",
  onSettingsClick,

  uploadAction,
  secondaryAction,
  primaryAction,
  cancelAction,

  onSave,
  onSaveAndNew,
  onCancel,
}) => {
  const navigate = useNavigate();
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleBack = () => {
    if (backPath) navigate(backPath);
    else navigate(-1);
  };

  // ── Build shortcut groups (actions wired where applicable) ──
  const groups: ShortcutGroup[] = [
    {
      heading: "Party Form Actions",
      shortcuts: [
        {
          label: "Save",
          keys: ["Alt", "Enter"],
          action: onSave,
        },
        {
          label: "Save & Create New",
          keys: ["Shift", "Enter"],
          action: onSaveAndNew,
        },
        {
          label: "Cancel",
          keys: ["Escape"],
          action: onCancel ?? (() => navigate(-1)),
        },
        {
          label: "Go to next field",
          keys: ["Tab"],
        },
        {
          label: "Go to previous field",
          keys: ["Shift", "Tab"],
        },
      ],
    },
    {
      heading: "Create",
      shortcuts: [
        { label: "Sales Invoice",    keys: ["Alt", "S"], action: () => navigate("/cashier/sales-invoice") },
        { label: "POS Billing",      keys: ["Alt", "B"], action: () => navigate("/cashier/POS-billing") },
        { label: "Purchase Invoice", keys: ["Alt", "P"], action: () => navigate("/cashier/purchase") },
        { label: "Payment In",       keys: ["Alt", "I"], action: () => navigate("/cashier/payment-in") },
        { label: "Payment Out",      keys: ["Alt", "O"], action: () => navigate("/cashier/payment-out") },
        { label: "Sales Return",     keys: ["Alt", "C"], action: () => navigate("/cashier/sales-return") },
        { label: "Purchase Return",  keys: ["Alt", "R"], action: () => navigate("/cashier/purchase-return") },
        { label: "Quotation",        keys: ["Alt", "Q"], action: () => navigate("/cashier/quotation") },
        { label: "Expense",          keys: ["Alt", "E"], action: () => navigate("/cashier/create-expense") },
        { label: "Party",            keys: ["Alt", "Y"], action: () => navigate("/cashier/create-party") },
        { label: "Item",             keys: ["Alt", "M"], action: () => navigate("/cashier/create-item") },
      ],
    },
    {
      heading: "Customer Support",
      shortcuts: [
        { label: "Chat Support", keys: ["Alt", "H"] },
      ],
    },
  ];

  // ── Global keyboard handler ──
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(tag);

      // Alt alone → toggle shortcuts panel
      // (keyup for Alt alone, not combined)
      if (e.key === "Alt" && !e.shiftKey && !e.ctrlKey) {
        // We handle on keyup below
        return;
      }

      // Escape → cancel / close shortcuts
      if (e.key === "Escape") {
        if (showShortcuts) {
          setShowShortcuts(false);
          return;
        }
        if (onCancel) onCancel();
        else navigate(-1);
        return;
      }

      // Alt + Enter → Save
      if (e.altKey && e.key === "Enter") {
        e.preventDefault();
        if (onSave) onSave();
        return;
      }

      // Shift + Enter → Save & Create New
      if (e.shiftKey && e.key === "Enter" && !isTyping) {
        e.preventDefault();
        if (onSaveAndNew) onSaveAndNew();
        return;
      }

      if (!e.altKey) return;

      // Alt + key shortcuts
      const altMap: Record<string, () => void> = {
        s: () => navigate("/cashier/sales-invoice"),
        b: () => navigate("/cashier/POS-billing"),
        p: () => navigate("/cashier/purchase"),
        i: () => navigate("/cashier/payment-in"),
        o: () => navigate("/cashier/payment-out"),
        c: () => navigate("/cashier/sales-return"),
        r: () => navigate("/cashier/purchase-return"),
        q: () => navigate("/cashier/quotation"),
        e: () => navigate("/cashier/create-expense"),
        y: () => navigate("/cashier/create-party"),
        m: () => navigate("/cashier/create-item"),
        h: () => window.open("/support", "_blank"),
      };

      const key = e.key.toLowerCase();
      if (altMap[key]) {
        e.preventDefault();
        altMap[key]();
      }
    },
    [navigate, onSave, onSaveAndNew, onCancel, showShortcuts]
  );

  // Alt keyup → toggle panel (only if Alt was pressed alone)
  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Alt" && !e.shiftKey && !e.ctrlKey) {
        setShowShortcuts((prev) => !prev);
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <>
      <div
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        {/* LEFT */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {showBackButton && (
            <button
              onClick={handleBack}
              style={{
                padding: "8px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "#374151",
              }}
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h1
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#111827",
              margin: 0,
            }}
          >
            {title}
          </h1>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Keyboard Shortcut toggle button */}
          <button
            onClick={() => setShowShortcuts((p) => !p)}
            title="Keyboard Shortcuts (Alt)"
            style={{
              padding: "8px 12px",
              background: showShortcuts ? "#ede9fe" : "transparent",
              border: `1px solid ${showShortcuts ? "#818cf8" : "#d1d5db"}`,
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              color: showShortcuts ? "#4f46e5" : "#6b7280",
              transition: "all 0.15s",
            }}
          >
            <Keyboard size={18} />
          </button>

          {/* Upload Action */}
          {uploadAction && (
            <button
              onClick={uploadAction.onClick}
              style={{
                padding: "8px 16px",
                background: "#fff7ed",
                border: "1px solid #fb923c",
                borderRadius: "6px",
                cursor: "pointer",
                color: "#ea580c",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {uploadAction.label}
            </button>
          )}

          {/* Settings */}
          {showSettings && (
            <button
              onClick={onSettingsClick}
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#374151",
                fontSize: "14px",
              }}
            >
              <span>{settingsLabel}</span>
              <Settings size={16} />
            </button>
          )}

          {/* Cancel or Save & New */}
          {cancelAction ? (
            <button
              onClick={cancelAction.onClick}
              style={{
                padding: "8px 20px",
                background: "transparent",
                border: "1px solid #ef4444",
                borderRadius: "6px",
                cursor: "pointer",
                color: "#ef4444",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {cancelAction.label}
            </button>
          ) : (
            secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                style={{
                  padding: "8px 20px",
                  background: "transparent",
                  border: "1px solid #6366f1",
                  borderRadius: "6px",
                  cursor: "pointer",
                  color: "#6366f1",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {secondaryAction.label}
              </button>
            )
          )}

          {/* Primary / Save */}
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              style={{
                padding: "8px 32px",
                background: "#6366f1",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {primaryAction.label}
            </button>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {showShortcuts && (
        <div
          onClick={() => setShowShortcuts(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.15)",
            zIndex: 999,
          }}
        />
      )}

      {/* Shortcuts Panel */}
      {showShortcuts && (
        <ShortcutsPanel groups={groups} onClose={() => setShowShortcuts(false)} />
      )}
    </>
  );
};

export default Navbar;