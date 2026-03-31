import React, { useState, useRef, useEffect } from "react";
import AdminNavbar from "../AdminNavbar/AdminNavbar";
import "./Printsetting.css";

type PrintTab = "thermal" | "barcode";
type ThermalSize = "2inch" | "3inch";
type BarcodeType = "label" | "a4";

const PrintSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PrintTab>("thermal");
  const [thermalSize, setThermalSize] = useState<ThermalSize | null>(null);
  const [barcodeType, setBarcodeType] = useState<BarcodeType | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h1 = document.querySelector(".admin-navbar h1");
    if (h1) h1.textContent = "Print Settings";
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith(".bmp")) {
      const reader = new FileReader();
      reader.onload = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    } else if (file) {
      alert("Please upload a .bmp (Monochrome) file only.");
    }
  };

  return (
    <div className="print-settings-page">
      {/* AdminNavbar imported exactly as provided — no changes made */}
      <AdminNavbar type="account" />

      <div className="print-settings-body">
        {/* Sidebar */}
        <div className="print-settings-sidebar">
          <div className="print-tabs">
            <button
              className={`print-tab ${activeTab === "thermal" ? "active" : ""}`}
              onClick={() => setActiveTab("thermal")}
            >
              Thermal Printer
            </button>
            <button
              className={`print-tab ${activeTab === "barcode" ? "active" : ""}`}
              onClick={() => setActiveTab("barcode")}
            >
              Barcode Printer
            </button>
          </div>

          <div className="print-tab-content">
            {activeTab === "thermal" && (
              <>
                <div className="section-label">Select your Invoice theme</div>

                <div className="option-list">
                  <div
                    className={`option-item ${thermalSize === "2inch" ? "selected" : ""}`}
                    onClick={() => setThermalSize("2inch")}
                  >
                    <span>2 Inch</span>
                    {thermalSize === "2inch" && <span className="check-icon">✓</span>}
                  </div>
                  <div
                    className={`option-item ${thermalSize === "3inch" ? "selected" : ""}`}
                    onClick={() => setThermalSize("3inch")}
                  >
                    <span>3 Inch</span>
                    {thermalSize === "3inch" && <span className="check-icon">✓</span>}
                  </div>
                </div>

                <div className="section-label logo-label">Business Logo</div>

                <div className="logo-upload-area">
                  <div
                    className="logo-placeholder"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {logo ? (
                      <img src={logo} alt="Business Logo" className="logo-preview" />
                    ) : (
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#aaa"
                        strokeWidth="1.5"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    )}
                  </div>

                  <button
                    className="upload-logo-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Monochrome Logo
                  </button>

                  <input
                    type="file"
                    accept=".bmp"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleLogoUpload}
                  />
                </div>

                <div className="logo-info">
                  You can only upload your logo in Monochrome, *.bmp extension and
                  210px (max width) x 70px (max height) dimensions. To learn how to
                  resize and covert your logo to Monochrome{" "}
                  <a href="#" className="info-link">
                    click here.
                  </a>
                </div>
              </>
            )}

            {activeTab === "barcode" && (
              <div className="option-list">
                <div
                  className={`option-item ${barcodeType === "label" ? "selected" : ""}`}
                  onClick={() => setBarcodeType("label")}
                >
                  <span>Label Print</span>
                  {barcodeType === "label" && <span className="check-icon">✓</span>}
                </div>
                <div
                  className={`option-item ${barcodeType === "a4" ? "selected" : ""}`}
                  onClick={() => setBarcodeType("a4")}
                >
                  <span>A4 Print</span>
                  {barcodeType === "a4" && <span className="check-icon">✓</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="print-preview-panel">
          <div className="preview-notice">
            {activeTab === "thermal" ? (
              <>
                This is a preview of the Thermal print of your invoice. Some columns
                might not appear if they don't have the required information.{" "}
                <a href="#" className="info-link">
                  Click here to learn more
                </a>
              </>
            ) : (
              <>
                This is a preview of the Barcode print settings. Select a print type
                on the left to configure.
              </>
            )}
          </div>

          <div className="preview-content">
            {activeTab === "thermal" && thermalSize && (
              <div className="thermal-receipt">
                {logo && <img src={logo} alt="Logo" className="receipt-logo" />}
                <div className="receipt-business">Business Name</div>
                <div className="receipt-sub">7003025622</div>
                <div className="receipt-divider" />
                <div className="receipt-row">
                  <span>Item</span>
                  <span>Amount</span>
                </div>
                <div className="receipt-divider dashed" />
                <div className="receipt-row">
                  <span>Sample Product</span>
                  <span>₹100</span>
                </div>
                <div className="receipt-divider" />
                <div className="receipt-row total">
                  <span>Total</span>
                  <span>₹100</span>
                </div>
                <div className="receipt-size-badge">
                  {thermalSize === "2inch" ? "2 Inch" : "3 Inch"}
                </div>
              </div>
            )}

            {activeTab === "barcode" && barcodeType && (
              <div className="barcode-card">
                <div className="barcode-bars">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={i}
                      className="barcode-bar"
                      style={{ width: i % 3 === 0 ? 3 : 1.5 }}
                    />
                  ))}
                </div>
                <div className="barcode-number">1234567890</div>
                <div className="receipt-size-badge">
                  {barcodeType === "label" ? "Label Print" : "A4 Print"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintSettings;