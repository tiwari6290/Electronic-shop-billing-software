import React from "react";
import { ArrowLeft, Settings, Grid3x3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  title: string;
  showBackButton?: boolean;
  backPath?: string;

  showSettings?: boolean;
  settingsLabel?: string; // ✅ NEW (Party Settings / Settings)
  onSettingsClick?: () => void;

  uploadAction?: {
    label: string;
    onClick: () => void;
  };

  secondaryAction?: {
    label: string;
    onClick: () => void;
  };

  primaryAction?: {
    label: string;
    onClick: () => void;
  };

  cancelAction?: {
    label: string;
    onClick: () => void;
  };
}

const Navbar: React.FC<NavbarProps> = ({
  title,
  showBackButton = true,
  backPath = "/dashboard",

  showSettings = false,
  settingsLabel = "Settings", // ✅ DEFAULT
  onSettingsClick,

  uploadAction,
  secondaryAction,
  primaryAction,
  cancelAction,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* LEFT SECTION */}
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

      {/* RIGHT SECTION */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Grid Icon */}
        <button
          style={{
            padding: "8px 12px",
            background: "transparent",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: "#6b7280",
          }}
        >
          <Grid3x3 size={18} />
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

        {/* SETTINGS BUTTON (Dynamic Label) */}
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

        {/* Cancel OR Save & New */}
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

        {/* Save */}
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
  );
};

export default Navbar;
