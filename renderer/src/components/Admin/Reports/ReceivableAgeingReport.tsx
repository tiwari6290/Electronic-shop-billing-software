import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Download, ChevronDown, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./ReceivableAgeingReport.css";

const REPORT_NAME = "Receivable Ageing Report";
const FAV_KEY = "report_favourites";

const ReceivableAgeingReport: React.FC = () => {
  const navigate = useNavigate();

  /* -------------------- Favourite Logic -------------------- */

  const getInitialFav = (): boolean => {
    const stored = localStorage.getItem(FAV_KEY);
    if (!stored) return false;

    const parsed: string[] = JSON.parse(stored);
    return parsed.includes(REPORT_NAME);
  };

  const [isFavourite, setIsFavourite] = useState<boolean>(getInitialFav);

  const toggleFavourite = () => {
    const stored = localStorage.getItem(FAV_KEY);
    const favs: Set<string> = stored
      ? new Set<string>(JSON.parse(stored))
      : new Set<string>();

    if (favs.has(REPORT_NAME)) {
      favs.delete(REPORT_NAME);
    } else {
      favs.add(REPORT_NAME);
    }

    localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(favs)));
    setIsFavourite(!isFavourite);
  };

  /* -------------------- Download Dropdown -------------------- */

  const [downloadOpen, setDownloadOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDownloadOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* -------------------- Print Functionality -------------------- */

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="ageing-container">
      {/* ---------------- Header ---------------- */}
      <div className="ageing-header">
        <div className="ageing-header-left">
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
          </button>

          <h1>Ageing Report</h1>

          <button
            className={`fav-btn ${isFavourite ? "fav-active" : ""}`}
            onClick={toggleFavourite}
          >
            ★ {isFavourite ? "Favourited" : "Favourite"}
          </button>
        </div>

        <div className="ageing-header-actions">
          {/* Download Dropdown */}
          <div className="download-wrapper" ref={dropdownRef}>
            <button
              className="action-btn"
              onClick={() => setDownloadOpen(!downloadOpen)}
            >
              <Download size={16} />
              Download
              <ChevronDown size={14} />
            </button>

            {downloadOpen && (
              <div className="download-dropdown">
                <div
                  className="download-item"
                  onClick={() => {
                    setDownloadOpen(false);
                    console.log("Download Excel clicked");
                  }}
                >
                  Download Excel
                </div>

                <div
                  className="download-item"
                  onClick={() => {
                    setDownloadOpen(false);
                    console.log("Download PDF clicked");
                  }}
                >
                  Download PDF
                </div>
              </div>
            )}
          </div>

          {/* Print Button */}
          <button className="action-btn" onClick={handlePrint}>
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>

      {/* ---------------- Search ---------------- */}
      <div className="ageing-search">
        <input placeholder="Search by party name" />
      </div>

      {/* ---------------- Table ---------------- */}
      <div className="ageing-table-wrapper">
        <table className="ageing-table">
          <thead>
            <tr>
              <th>Party Name</th>
              <th colSpan={3} className="not-due">
                Not yet due
              </th>
              <th colSpan={4} className="overdue">
                Overdue
              </th>
              <th>Total Amount</th>
            </tr>
            <tr>
              <th></th>
              <th>By Tomorrow</th>
              <th>Upcoming</th>
              <th>T. Due</th>
              <th>1-15 Days</th>
              <th>16-30 Days</th>
              <th>30+ Days</th>
              <th>T. Overdue</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colSpan={9} className="empty-state">
                No transactions available for selected party.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReceivableAgeingReport;