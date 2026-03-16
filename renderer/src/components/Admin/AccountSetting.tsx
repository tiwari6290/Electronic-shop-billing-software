import React from "react";
import AdminNavbar from "./AdminNavbar/AdminNavbar";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  border: "1px solid #E5E7EB",
  borderRadius: "8px",
  marginTop: "6px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
};

export default function AccountSettings() {
  return (
    <>
     <AdminNavbar />
     
      <div style={{ padding: "32px", maxWidth: "900px" }}>

        <h3 style={{ marginBottom: "20px" }}>General Information</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "24px",
          }}
        >
          <div>
            <label style={labelStyle}>Name *</label>
            <input style={inputStyle} placeholder="Enter name" />
          </div>

          <div>
            <label style={labelStyle}>Mobile Number</label>
            <input style={inputStyle} defaultValue="7003025622" />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} placeholder="Enter email" />
          </div>
        </div>

        <div style={{ marginTop: "30px" }}>
          <label style={labelStyle}>Referral Code</label>

          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            <input style={{ ...inputStyle, flex: 1 }} />

            <button
              style={{
                padding: "12px 24px",
                background: "#5B5FED",
                color: "white",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Apply
            </button>
          </div>
        </div>

      </div>
    </>
  );
}