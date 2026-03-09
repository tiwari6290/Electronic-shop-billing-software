import { useState, useEffect } from "react";
import hsnEmptyImg from "../../../assets/1.png";
import api from "../../../lib/axios";
import "./StockDetails.css";

interface StockDetailsProps {
  godownId: string;
  setGodownId: React.Dispatch<React.SetStateAction<string>>;

  openingStock: string;
  setOpeningStock: React.Dispatch<React.SetStateAction<string>>;

  asOfDate: string;
  setAsOfDate: React.Dispatch<React.SetStateAction<string>>;

  itemCode: string;
  setItemCode: React.Dispatch<React.SetStateAction<string>>;

  hsnCode: string;
  setHsnCode: React.Dispatch<React.SetStateAction<string>>;

  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;

  lowStockQty: string;
  setLowStockQty: React.Dispatch<React.SetStateAction<string>>;

  lowStockAlert: boolean;
  setLowStockAlert: React.Dispatch<React.SetStateAction<boolean>>;
}

const StockDetails = ({
  godownId,
  setGodownId,
  openingStock,
  setOpeningStock,
  asOfDate,
  setAsOfDate,
  itemCode,
  setItemCode,
  hsnCode,
  setHsnCode,
  description,
  setDescription,
  lowStockQty,
  setLowStockQty,
  lowStockAlert,
  setLowStockAlert
}: StockDetailsProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [showAltUnit, setShowAltUnit] = useState(false);
  const [showLowStock, setShowLowStock] = useState(false);
  const [showHSNDrawer, setShowHSNDrawer] = useState(false);
  const [godowns, setGodowns] = useState<any[]>([]);

  useEffect(() => {
    const fetchGodowns = async () => {
      try {
        const res = await api.get("/godowns");
        setGodowns(res.data.data);
      } catch (err) {
        console.error("Failed to fetch godowns");
      }
    };
    fetchGodowns();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }
    setFiles(selectedFiles);
  };

  return (
    <>
      {/* ── HSN DRAWER OVERLAY ── */}
      {showHSNDrawer && (
        <div
          onClick={() => setShowHSNDrawer(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000 }}
        />
      )}

      {/* ── HSN DRAWER ── */}
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
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong>HSN Code</strong>
          <span onClick={() => setShowHSNDrawer(false)} style={{ cursor: "pointer", fontSize: "18px" }}>✕</span>
        </div>
        <div style={{ padding: "16px 20px" }}>
          <input className="input" placeholder="Search by HSN Code or Item Name" />
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", color: "#6b7280" }}>
          <img src={hsnEmptyImg} alt="HSN Search" style={{ width: "150px", marginBottom: "16px" }} />
          Search by HSN Code or Item Name
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: "900px" }}>

        {/* ITEM CODE + HSN */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "20px" }}>
          <div>
            <label>Item Code</label>
            <div style={{ display: "flex" }}>
              <input
                className="input"
                placeholder="ex: ITM12549"
                value={itemCode}
  onChange={(e) => setItemCode(e.target.value)}
                style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
              />
              <button className="sd-barcode-btn">Generate Barcode</button>
            </div>
          </div>

          <div>
            <label>HSN code</label>
            <input className="input" placeholder="ex: 4010" value={hsnCode}
  onChange={(e) => setHsnCode(e.target.value)} />
            <button className="sd-link" onClick={() => setShowHSNDrawer(true)}>
              Find HSN Code
            </button>
          </div>
        </div>

        {/* MEASURING UNIT */}
        <div style={{ marginBottom: "10px" }}>
          <label>Measuring Unit</label>
          <select className="input" style={{ maxWidth: "300px" }}>
            <option>Pieces (PCS)</option>
            <option>Box (BOX)</option>
            <option>Kg (KGS)</option>
          </select>
        </div>

        {/* ALTERNATIVE UNIT */}
        {!showAltUnit ? (
          <button className="sd-add-link" style={{ marginBottom: "20px" }} onClick={() => setShowAltUnit(true)}>
            + Alternative Unit
          </button>
        ) : (
          <div className="sd-alt-box">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "10px" }}>
              <div>
                <label>Secondary Unit</label>
                <select className="input">
                  <option>Select Secondary Unit</option>
                  <option>Box (BOX)</option>
                  <option>Kg (KGS)</option>
                </select>
              </div>
              <div>
                <label>Conversion Rate *</label>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ padding: "9px 12px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRight: "none", borderRadius: "6px 0 0 6px", fontSize: "13px", color: "#6b7280", whiteSpace: "nowrap" }}>
                    1 PCS =
                  </span>
                  <input className="input" placeholder="Enter Conversion Rate" style={{ borderRadius: 0 }} />
                  <span style={{ padding: "9px 12px", background: "#f3f4f6", border: "1px solid #d1d5db", borderLeft: "none", borderRadius: "0 6px 6px 0", fontSize: "13px", color: "#6b7280" }}>
                    Unit
                  </span>
                </div>
              </div>
            </div>
            <button className="sd-remove-link" onClick={() => setShowAltUnit(false)}>
              ✕ Remove Alternative Unit
            </button>
          </div>
        )}

        {/* GODOWN + OPENING STOCK + AS OF DATE */}
        <div className="sd-stock-box">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", marginBottom: "16px" }}>
            <div>
              <label>Godowns</label>
              <select className="input" value={godownId} onChange={(e) => setGodownId(e.target.value)}>
                <option value="">Select Godown</option>
                {Array.isArray(godowns) && godowns.map((g) => (
                  <option key={g.godown_id} value={g.godown_id}>{g.godown_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Opening Stock</label>
              <div style={{ display: "flex" }}>
                <input
                  type="number"
                  className="input"
                  placeholder="ex: 150 PCS"
                  value={openingStock}
                  onChange={(e) => setOpeningStock(e.target.value)}
                  style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                />
                <span className="sd-unit-suffix">PCS</span>
              </div>
            </div>

            <div>
              <label>As of Date</label>
              <input
                type="date"
                className="input"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
              />
            </div>
          </div>

          {/* LOW STOCK */}
          {!showLowStock ? (
            <button
  className="sd-add-link"
  onClick={() => {
    setShowLowStock(true);
    setLowStockAlert(true);
  }}
>
              + Enable Low stock quantity warning
            </button>
          ) : (
            <div className="sd-lowstock-box">
              <label>Low Stock Quantity</label>
              <div style={{ display: "flex", marginTop: "6px" }}>
                <input
                  className="input"
                  placeholder="Enter Low Stock Quantity"
                  value={lowStockQty}
  onChange={(e) => setLowStockQty(e.target.value)}
                  style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                />
                <span className="sd-unit-suffix">PCS</span>
              </div>
              <button
  className="sd-remove-link"
  onClick={() => {
    setShowLowStock(false);
    setLowStockAlert(false);
  }}
>
                ✕ Remove Low stock quantity warning
              </button>
            </div>
          )}
        </div>

        {/* DESCRIPTION */}
        <div style={{ marginBottom: "20px" }}>
          <label>Description</label>
          <textarea
  className="sd-textarea"
  placeholder="Enter Description"
  rows={4}
  value={description}
  onChange={(e) => setDescription(e.target.value)}
/>
        </div>

        {/* FILE UPLOAD */}
        <div className="sd-upload">
          <div className="sd-upload-text">
            <strong>Please select or drag and drop 5 files.</strong>
            <p>Maximum of 5 images in PNG or JPEG, file size no more than 5 MB</p>
          </div>
          <label className="sd-select-file-label">
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
          <p style={{ marginTop: "10px", fontSize: "13px", color: "#6b7280" }}>
            {files.length} file(s) selected
          </p>
        )}
      </div>
    </>
  );
};

export default StockDetails;