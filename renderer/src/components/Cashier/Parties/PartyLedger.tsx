import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { ChevronDown, Download, Printer, Share2, Calendar } from "lucide-react";
import "./PartyLedger.css";
import axios from "axios";

interface LedgerEntry {
  date: string;
  voucher: string;
  srNo: string | number;
  credit: number | null;
  debit: number | null;
  tdsParty?: number | null;
  tdsSelf?: number | null;
  balance: number;
}

const DATE_OPTIONS = [
  "Today","Yesterday","This Week","Last Week","Last 7 Days",
  "This Month","Previous Month","Last 30 Days","This Quarter",
  "Previous Quarter","Current Fiscal Year","Previous Fiscal Year","Last 365 Days",
];

const PartyLedger: React.FC = () => {
  const { id } = useParams();

  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>([]);
  const [partyName, setPartyName] = useState<string>("");
  const [partyPhone, setPartyPhone] = useState<string>("");
  const [partyBalance, setPartyBalance] = useState<number>(0);
  const [dateFilter, setDateFilter] = useState("Last 365 Days");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [businessName] = useState("scratchweb.solutions");
  const [businessPhone] = useState("06289909521");

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/ledger/party/${id}`);
        const data = res.data;
        setLedgerData(data.entries || []);
        setPartyName(data.partyName || "");
        setPartyPhone(data.partyPhone || "");
        setPartyBalance(data.totalPayable || 0);
      } catch {
        try {
          const partiesRes = await axios.get("http://localhost:4000/api/parties");
          const found = partiesRes.data.data?.find((p: any) => String(p.id) === String(id));
          if (found) {
            setPartyName(found.partyName);
            setPartyPhone(found.mobileNumber || "");
            setPartyBalance(
              found.openingBalanceType === "To_Collect"
                ? Number(found.openingBalance)
                : -Number(found.openingBalance)
            );
          }
        } catch {}
        setLedgerData([]);
      }
    };
    if (id) fetchLedger();
  }, [id]);

  const dateRange = useMemo(() => {
    const now = new Date();
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    switch (dateFilter) {
      case "Today": return `${fmt(now)} - ${fmt(now)}`;
      case "Last 7 Days":  { const s = new Date(now); s.setDate(now.getDate()-7);   return `${fmt(s)} - ${fmt(now)}`; }
      case "Last 30 Days": { const s = new Date(now); s.setDate(now.getDate()-30);  return `${fmt(s)} - ${fmt(now)}`; }
      case "Last 365 Days":{ const s = new Date(now); s.setFullYear(now.getFullYear()-1); return `${fmt(s)} - ${fmt(now)}`; }
      default:             { const s = new Date(now); s.setFullYear(now.getFullYear()-1); return `${fmt(s)} - ${fmt(now)}`; }
    }
  }, [dateFilter]);

  const handleDownload = () => {
    const rows = [
      ["Date","Voucher","Sr No","Credit","Debit","TDS by Party","TDS by Self","Balance"],
      ...ledgerData.map((e) => [e.date, e.voucher, e.srNo, e.credit ?? "-", e.debit ?? "-", e.tdsParty ?? "-", e.tdsSelf ?? "-", e.balance]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Ledger_${partyName}.csv`;
    link.click();
  };

  const totalCredit = ledgerData.reduce((a, e) => a + (e.credit || 0), 0);

  return (
    <div className="ledger-container">
      {/* Top Bar */}
      <div className="ledger-top">
        <div className="ledger-left-controls">
          <div className="ledger-date-wrap">
            <button className="ledger-date-btn" onClick={() => setShowDateDropdown(!showDateDropdown)}>
              <Calendar size={14} />
              {dateFilter}
              <ChevronDown size={14} />
            </button>
            {showDateDropdown && (
              <div className="ledger-dropdown">
                {DATE_OPTIONS.map((item) => (
                  <div key={item} className={dateFilter === item ? "selected" : ""}
                    onClick={() => { setDateFilter(item); setShowDateDropdown(false); }}>
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="ledger-right-controls">
          <button className="ledger-action-btn" onClick={handleDownload}>
            <Download size={14} /> Download
          </button>
          <button className="ledger-action-btn" onClick={() => window.print()}>
            <Printer size={14} /> Print
          </button>
          <div style={{ position: "relative" }}>
            <button className="ledger-action-btn" onClick={() => setShowShareDropdown(!showShareDropdown)}>
              <Share2 size={14} /> Share <ChevronDown size={13} />
            </button>
            {showShareDropdown && (
              <div className="ledger-dropdown share-dropdown">
                <div onClick={() => setShowShareDropdown(false)}>Share via WhatsApp</div>
                <div onClick={() => setShowShareDropdown(false)}>Share via Email</div>
                <div onClick={() => setShowShareDropdown(false)}>Copy Link</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ledger Document */}
      <div className="ledger-card">
        <div className="ledger-doc-header">
          <div className="ledger-company-info">
            <p className="company-name">{businessName}</p>
            <p className="company-phone">Phone no: {businessPhone}</p>
          </div>
          <div className="ledger-title-box">Party Ledger</div>
        </div>

        <div className="ledger-party-row">
          <div className="ledger-to">
            <p className="to-label">To,</p>
            <p className="to-name">{partyName}</p>
            <p className="to-phone">{partyPhone}</p>
          </div>
          <div className="ledger-summary-box">
            <div className="summary-date-range">{dateRange}</div>
            <div className="summary-divider" />
            <div className="summary-total-row">
              <span>Total Payable</span>
              <span className="summary-total-value">{partyBalance}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="ledger-table-wrapper">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Voucher</th>
                <th>Sr No</th>
                <th>Credit</th>
                <th>Debit</th>
                <th>TDS deducted by party</th>
                <th>TDS deducted by self</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr className="opening-row">
                <td></td>
                <td>Opening Balance</td>
                <td></td><td>-</td><td>-</td><td>-</td><td>-</td>
                <td>0.0</td>
              </tr>
              {ledgerData.length === 0 ? (
                <tr><td colSpan={8} className="no-ledger">No ledger entries found.</td></tr>
              ) : (
                ledgerData.map((entry, i) => (
                  <tr key={i}>
                    <td>{entry.date}</td>
                    <td>{entry.voucher}</td>
                    <td>{entry.srNo}</td>
                    <td>{entry.credit != null ? `${entry.credit}.0` : "-"}</td>
                    <td>{entry.debit  != null ? `${entry.debit}.0`  : "-"}</td>
                    <td>{entry.tdsParty != null ? entry.tdsParty : "-"}</td>
                    <td>{entry.tdsSelf  != null ? entry.tdsSelf  : "-"}</td>
                    <td>{entry.balance}</td>
                  </tr>
                ))
              )}
              <tr className="closing-row">
                <td></td>
                <td>Closing Balance</td>
                <td></td>
                <td>{totalCredit > 0 ? `${totalCredit}.0` : "-"}</td>
                <td>-</td><td>-</td><td>-</td>
                <td>{partyBalance}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PartyLedger;