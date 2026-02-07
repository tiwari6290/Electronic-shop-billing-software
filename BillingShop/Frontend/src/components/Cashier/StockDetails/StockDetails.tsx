import { useState } from "react";
<<<<<<< Updated upstream
import hsnEmptyImg from "../../../assets/1.png"; // 🔁 adjust path if needed
=======
>>>>>>> Stashed changes

const StockDetails = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [showAltUnit, setShowAltUnit] = useState(false);
<<<<<<< Updated upstream
  const [showLowStock, setShowLowStock] = useState(false);
  const [showHSNDrawer, setShowHSNDrawer] = useState(false);
=======
>>>>>>> Stashed changes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
    setFiles(selectedFiles);
  };

  return (
<<<<<<< Updated upstream
    <>
      {/* ================= OVERLAY ================= */}
      {showHSNDrawer && (
        <div
          onClick={() => setShowHSNDrawer(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 1000,
          }}
        />
      )}

      {/* ================= HSN DRAWER ================= */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: showHSNDrawer ? 0 : "-420px",
          width: "420px",
          height: "100vh",
          background: "#fff",
          zIndex: 1001,
          transition: "right 0.3s ease",
          boxShadow: "-2px 0 8px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <strong>HSN Code</strong>
          <span
            onClick={() => setShowHSNDrawer(false)}
            style={{ cursor: "pointer", fontSize: "18px" }}
          >
            ✕
          </span>
        </div>

        {/* SEARCH */}
        <div style={{ padding: "16px 20px" }}>
          <input
            className="input"
            placeholder="Search by HSN Code or Item Name"
          />
        </div>

        {/* EMPTY STATE IMAGE */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          <img
            src={hsnEmptyImg}
            alt="HSN Search"
            style={{ width: "150px", marginBottom: "16px" }}
          />
          Search by HSN Code or Item Name
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div style={{ maxWidth: "900px" }}>
        {/* ================= TOP SECTION ================= */}
        <div style={{ marginBottom: "28px" }}>
          {/* ITEM CODE + HSN */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              marginBottom: "20px",
            }}
          >
            {/* ITEM CODE */}
            <div>
              <label>Item Code</label>
              <div style={{ display: "flex" }}>
                <input
                  className="input"
                  placeholder="ex: ITM12549"
                  style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                />
                <button
                  style={{
                    border: "1px solid #d9d9d9",
                    borderLeft: "none",
                    background: "#e6f4ff",
                    color: "#1677ff",
                    padding: "0 14px",
                    cursor: "pointer",
                    borderTopRightRadius: "6px",
                    borderBottomRightRadius: "6px",
                  }}
                >
                  Generate Barcode
                </button>
              </div>
            </div>

            {/* HSN */}
            <div>
              <label>HSN code</label>
              <input className="input" placeholder="ex: 4010" />
              <div
                onClick={() => setShowHSNDrawer(true)}
                style={{
                  color: "#1677ff",
                  fontSize: "13px",
                  marginTop: "6px",
                  cursor: "pointer",
                }}
              >
                Find HSN Code
              </div>
            </div>
          </div>

          {/* MEASURING UNIT */}
          <div style={{ marginBottom: "10px" }}>
            <label>Measuring Unit</label>
            <select className="input">
              <option>Pieces (PCS)</option>
              <option>Box (BOX)</option>
              <option>Kg (KGS)</option>
            </select>
          </div>

          {/* ALTERNATIVE UNIT */}
          {!showAltUnit && (
            <div
              onClick={() => setShowAltUnit(true)}
              style={{ color: "#1677ff", cursor: "pointer", fontSize: "14px" }}
            >
              + Alternative Unit
            </div>
          )}

          {showAltUnit && (
            <div
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: "8px",
                padding: "16px",
                background: "#fafafa",
                marginTop: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <strong>Alternative Unit</strong>
                <span
                  onClick={() => setShowAltUnit(false)}
                  style={{ color: "#ff4d4f", cursor: "pointer" }}
                >
                  ✕ Remove Alternative Unit
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "16px",
                }}
              >
                <select className="input">
                  <option>Box (BOX)</option>
                  <option>Kg (KGS)</option>
                </select>
=======
    <div style={{ maxWidth: "900px" }}>
      {/* ================= TOP SECTION ================= */}
      <div style={{ marginBottom: "28px" }}>
        {/* ITEM CODE + HSN */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginBottom: "20px",
          }}
        >
          {/* ITEM CODE */}
          <div>
            <label>Item Code</label>
            <div style={{ display: "flex" }}>
              <input
                className="input"
                placeholder="ex: ITM12549"
                style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
              />
              <button
                style={{
                  border: "1px solid #d9d9d9",
                  borderLeft: "none",
                  background: "#e6f4ff",
                  color: "#1677ff",
                  padding: "0 14px",
                  cursor: "pointer",
                  borderTopRightRadius: "6px",
                  borderBottomRightRadius: "6px",
                }}
              >
                Generate Barcode
              </button>
            </div>
          </div>

          {/* HSN */}
          <div>
            <label>HSN code</label>
            <input className="input" placeholder="ex: 4010" />
            <div
              style={{
                color: "#1677ff",
                fontSize: "13px",
                marginTop: "6px",
                cursor: "pointer",
              }}
            >
              Find HSN Code
            </div>
          </div>
        </div>

        {/* MEASURING UNIT */}
        <div style={{ marginBottom: "10px" }}>
          <label>Measuring Unit</label>
          <select className="input">
            <option>Pieces (PCS)</option>
            <option>Box (BOX)</option>
            <option>Kg (KGS)</option>
          </select>
        </div>

        {/* ADD ALTERNATIVE UNIT */}
        {!showAltUnit && (
          <div
            onClick={() => setShowAltUnit(true)}
            style={{
              color: "#1677ff",
              cursor: "pointer",
              fontSize: "14px",
              marginBottom: "12px",
              userSelect: "none",
            }}
          >
            + Alternative Unit
          </div>
        )}

        {/* ================= ALTERNATIVE UNIT UI ================= */}
        {showAltUnit && (
          <div
            style={{
              border: "1px solid #d9d9d9",
              borderRadius: "8px",
              padding: "16px",
              background: "#fafafa",
              marginBottom: "20px",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <strong style={{ fontSize: "14px" }}>
                Alternative Unit
              </strong>
              <span
                onClick={() => setShowAltUnit(false)}
                style={{
                  color: "#ff4d4f",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                ✕ Remove Alternative Unit
              </span>
            </div>

            {/* BODY */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <label>Alternate Unit</label>
                <select className="input">
                  <option>Box (BOX)</option>
                  <option>Kg (KGS)</option>
                  <option>Dozen (DOZ)</option>
                </select>
              </div>

              <div>
                <label>Conversion</label>
>>>>>>> Stashed changes
                <input
                  className="input"
                  placeholder="ex: 1 BOX = 10 PCS"
                />
<<<<<<< Updated upstream
                <button
                  style={{
=======
              </div>

              <div>
                <label>&nbsp;</label>
                <button
                  style={{
                    width: "100%",
                    padding: "8px",
>>>>>>> Stashed changes
                    background: "#1677ff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
<<<<<<< Updated upstream
=======
                    cursor: "pointer",
>>>>>>> Stashed changes
                  }}
                >
                  Add Unit
                </button>
              </div>
            </div>
<<<<<<< Updated upstream
          )}
        </div>

        {/* ================= STOCK DETAILS ================= */}
        <div
          style={{
            background: "#f7f8fa",
            padding: "24px",
            borderRadius: "10px",
          }}
        >
          {/* GODOWN + OPENING STOCK */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "24px",
              marginBottom: "20px",
            }}
          >
            <div>
              <label>Godowns</label>
              <select className="input">
                <option>Select Godown</option>
                <option>Main Godown</option>
              </select>
            </div>

            <div>
              <label>Opening Stock</label>
              <div style={{ display: "flex" }}>
                <input
                  className="input"
                  placeholder="ex: 150"
                  style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                />
                <span
                  style={{
                    padding: "8px 14px",
                    background: "#eee",
                    border: "1px solid #ccc",
                    borderLeft: "none",
                    borderTopRightRadius: "6px",
                    borderBottomRightRadius: "6px",
                  }}
                >
                  PCS
                </span>
              </div>
            </div>

            <div>
              <label>As of Date</label>
              <input type="date" className="input" />
            </div>
          </div>

          {/* LOW STOCK */}
          {!showLowStock && (
            <div
              onClick={() => setShowLowStock(true)}
              style={{
                color: "#1677ff",
                cursor: "pointer",
                marginBottom: "16px",
              }}
            >
              + Enable Low stock quantity warning
            </div>
          )}

          {showLowStock && (
            <div
              style={{
                background: "#fff",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              <label>Low Stock Quantity</label>
              <div style={{ display: "flex", marginTop: "6px" }}>
                <input
                  className="input"
                  placeholder="Enter Low Stock Quantity"
                  style={{
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                  }}
                />
                <span
                  style={{
                    padding: "8px 14px",
                    background: "#eee",
                    border: "1px solid #ccc",
                    borderLeft: "none",
                    borderTopRightRadius: "6px",
                    borderBottomRightRadius: "6px",
                  }}
                >
                  PCS
                </span>
              </div>

              <div
                onClick={() => setShowLowStock(false)}
                style={{
                  color: "#1677ff",
                  cursor: "pointer",
                  marginTop: "10px",
                  fontSize: "13px",
                }}
              >
                ✕ Remove Low stock quantity warning
              </div>
            </div>
          )}

          {/* DESCRIPTION */}
          <div style={{ marginBottom: "20px" }}>
            <label>Description</label>
            <textarea
              className="input"
              placeholder="Enter Description"
              rows={4}
            />
          </div>

          {/* FILE UPLOAD */}
          <div
            style={{
              border: "2px dashed #d9d9d9",
              padding: "20px",
              borderRadius: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong>Please select or drag and drop 5 files.</strong>
              <p style={{ fontSize: "13px", color: "#666" }}>
                Maximum of 5 images in PNG or JPEG, file size no more than 5 MB
              </p>
            </div>

            <label
              style={{
                background: "#e6f4ff",
                color: "#1677ff",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Select File
              <input
                type="file"
                multiple
                accept="image/png, image/jpeg"
                hidden
                onChange={handleFileChange}
              />
            </label>
          </div>

          {files.length > 0 && (
            <p style={{ marginTop: "10px", fontSize: "13px" }}>
              {files.length} file(s) selected
            </p>
          )}
        </div>
      </div>
    </>
=======
          </div>
        )}
      </div>

      {/* ================= STOCK DETAILS ================= */}
      <div
        style={{
          background: "#f7f8fa",
          padding: "24px",
          borderRadius: "10px",
        }}
      >
        {/* GODOWN + OPENING STOCK */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "24px",
            marginBottom: "20px",
          }}
        >
          <div>
            <label>Godowns</label>
            <select className="input">
              <option>Select Godown</option>
              <option>Main Godown</option>
              <option>Secondary Godown</option>
            </select>
          </div>

          <div>
            <label>Opening Stock</label>
            <div style={{ display: "flex" }}>
              <input
                className="input"
                placeholder="ex: 150"
                style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
              />
              <span
                style={{
                  padding: "8px 14px",
                  background: "#eee",
                  border: "1px solid #ccc",
                  borderLeft: "none",
                  borderTopRightRadius: "6px",
                  borderBottomRightRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "14px",
                }}
              >
                PCS
              </span>
            </div>
          </div>

          <div>
            <label>As of Date</label>
            <input type="date" className="input" />
          </div>
        </div>

        {/* LOW STOCK */}
        <button
          style={{
            background: "none",
            border: "none",
            color: "#1677ff",
            cursor: "pointer",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          + Enable Low stock quantity warning
        </button>

        {/* DESCRIPTION */}
        <div style={{ marginBottom: "20px" }}>
          <label>Description</label>
          <textarea
            className="input"
            placeholder="Enter Description"
            rows={4}
            style={{ width:"860px" }}
          />
        </div>

        {/* FILE UPLOAD */}
        <div
          style={{
            border: "2px dashed #d9d9d9",
            padding: "20px",
            borderRadius: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <strong>Please select or drag and drop 5 files.</strong>
            <p style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
              Maximum of 5 images in PNG or JPEG, file size no more than 5 MB
            </p>
          </div>

          <label
            style={{
              background: "#e6f4ff",
              color: "#1677ff",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Select File
            <input
              type="file"
              multiple
              accept="image/png, image/jpeg"
              hidden
              onChange={handleFileChange}
            />
          </label>
        </div>

        {files.length > 0 && (
          <p style={{ marginTop: "10px", fontSize: "13px" }}>
            {files.length} file(s) selected
          </p>
        )}
      </div>
    </div>
>>>>>>> Stashed changes
  );
};

export default StockDetails;
