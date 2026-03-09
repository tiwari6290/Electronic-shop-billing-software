import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
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
  "Today", "Yesterday", "This Week", "Last Week", "Last 7 Days",
  "This Month", "Previous Month", "Last 30 Days", "This Quarter",
  "Previous Quarter", "Current Fiscal Year", "Previous Fiscal Year", "Last 365 Days",
];

const PartyLedger: React.FC = () => {
  const { id } = useParams();

  const [ledgerData, setLedgerData]     = useState<LedgerEntry[]>([]);
  const [partyName, setPartyName]       = useState<string>("");
  const [partyPhone, setPartyPhone]     = useState<string>("");
  const [partyBalance, setPartyBalance] = useState<number>(0);
  const [balanceLabel, setBalanceLabel] = useState<string>("Total Payable");
  const [dateFilter, setDateFilter]     = useState("Last 365 Days");
  const [showDateDropdown, setShowDateDropdown]   = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [businessName]  = useState("scratchweb.solutions");
  const [businessPhone] = useState("06289909521");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/party/${id}/ledger`);
        setLedgerData(res.data.data || []);
      } catch {
        setLedgerData([]);
      }
      try {
        const r = await axios.get("http://localhost:4000/api/parties");
        const found = r.data.data?.find((p: any) => String(p.id) === String(id));
        if (found) {
          setPartyName(found.partyName);
          setPartyPhone(found.mobileNumber || "");
          const raw =
            found.openingBalanceType === "To_Collect"
              ? Number(found.openingBalance)
              : -Number(found.openingBalance);
          setPartyBalance(Math.abs(raw));
          setBalanceLabel(raw >= 0 ? "Total Receivable" : "Total Payable");
        }
      } catch {}
    };
    if (id) fetchAll();
  }, [id]);

  const dateRange = useMemo(() => {
    const now = new Date();
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    switch (dateFilter) {
      case "Today":        return `${fmt(now)} - ${fmt(now)}`;
      case "Last 7 Days":  { const s = new Date(now); s.setDate(now.getDate() - 7);  return `${fmt(s)} - ${fmt(now)}`; }
      case "Last 30 Days": { const s = new Date(now); s.setDate(now.getDate() - 30); return `${fmt(s)} - ${fmt(now)}`; }
      default:             { const s = new Date(now); s.setFullYear(now.getFullYear() - 1); return `${fmt(s)} - ${fmt(now)}`; }
    }
  }, [dateFilter]);

  const handleDownload = () => {
    const rows = [
      ["Date","Voucher","Sr No","Credit","Debit","TDS by Party","TDS by Self","Balance"],
      ...ledgerData.map(e => [
        e.date, e.voucher, e.srNo,
        e.credit   ?? "-", e.debit    ?? "-",
        e.tdsParty ?? "-", e.tdsSelf  ?? "-",
        e.balance,
      ]),
    ];
    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Ledger_${partyName}.csv`;
    a.click();
  };

  const closingCredit = ledgerData.reduce((a, e) => a + (e.credit || 0), 0);

  const closeAll = () => { setShowDateDropdown(false); setShowShareDropdown(false); };

  return (
    <div className="pl-wrap" onClick={closeAll}>

      {/* ── Controls Row ──────────────────────────── */}
      <div className="pl-controls" onClick={e => e.stopPropagation()}>

        {/* Date filter — left */}
        <div className="pl-date-wrap">
          <button
            className="pl-date-btn"
            onClick={() => { setShowDateDropdown(v => !v); setShowShareDropdown(false); }}
          >
            <span className="pl-cal-icon">
              {/* calendar svg — tiny, no lucide */}
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="2" width="12" height="11" rx="1.5" stroke="#667085" strokeWidth="1.3"/>
                <path d="M1 5.5h12" stroke="#667085" strokeWidth="1.3"/>
                <path d="M4.5 1v2M9.5 1v2" stroke="#667085" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </span>
            {dateFilter}
            <span className="pl-arrow">&#8964;</span>
          </button>

          {showDateDropdown && (
            <div className="pl-dropdown">
              {DATE_OPTIONS.map(opt => (
                <div
                  key={opt}
                  className={`pl-dd-row${dateFilter === opt ? " active" : ""}`}
                  onClick={() => { setDateFilter(opt); setShowDateDropdown(false); }}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons — right */}
        <div className="pl-action-group">
          <button className="pl-btn" onClick={handleDownload}>Download</button>
          <button className="pl-btn" onClick={() => window.print()}>Print</button>
          <div className="pl-share-wrap">
            <button
              className="pl-btn pl-btn-share"
              onClick={() => { setShowShareDropdown(v => !v); setShowDateDropdown(false); }}
            >
              Share <span className="pl-arrow">&#8964;</span>
            </button>
            {showShareDropdown && (
              <div className="pl-dropdown pl-share-dd">
                <div className="pl-dd-row" onClick={() => setShowShareDropdown(false)}>Share via WhatsApp</div>
                <div className="pl-dd-row" onClick={() => setShowShareDropdown(false)}>Share via Email</div>
                <div className="pl-dd-row" onClick={() => setShowShareDropdown(false)}>Copy Link</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Ledger Document ───────────────────────── */}
      <div className="pl-doc">

        {/* Top: business name + "Party Ledger" label */}
        <div className="pl-doc-head">
          <div>
            <p className="pl-biz-name">{businessName}</p>
            <p className="pl-biz-phone">Phone no: {businessPhone}</p>
          </div>
          <div className="pl-doc-title">Party Ledger</div>
        </div>

        {/* Party info + summary box */}
        <div className="pl-party-row">
          <div className="pl-to">
            <span className="pl-to-prefix">To,</span>
            {partyName  && <p className="pl-to-name">{partyName}</p>}
            {partyPhone && <p className="pl-to-phone">{partyPhone}</p>}
          </div>
          <div className="pl-sum-box">
            <p className="pl-sum-date">{dateRange}</p>
            <div className="pl-sum-sep" />
            <div className="pl-sum-row">
              <span className="pl-sum-label">{balanceLabel}</span>
              <span className="pl-sum-value">{partyBalance}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="pl-table-outer">
          <table className="pl-table">
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
              {/* Opening Balance */}
              <tr className="pl-special">
                <td></td>
                <td className="pl-special-label">Opening Balance</td>
                <td></td>
                <td>-</td><td>-</td><td>-</td><td>-</td>
                <td>0.0</td>
              </tr>

              {/* Entries */}
              {ledgerData.map((e, i) => (
                <tr key={i}>
                  <td>{e.date ? String(e.date).slice(0, 10) : ""}</td>
                  <td>{e.voucher || ""}</td>
                  <td>{e.srNo ?? ""}</td>
                  <td>{e.credit   != null ? e.credit   : "-"}</td>
                  <td>{e.debit    != null ? e.debit    : "-"}</td>
                  <td>{e.tdsParty != null ? e.tdsParty : "-"}</td>
                  <td>{e.tdsSelf  != null ? e.tdsSelf  : "-"}</td>
                  <td>{e.balance}</td>
                </tr>
              ))}

              {/* Closing Balance */}
              <tr className="pl-special">
                <td></td>
                <td className="pl-special-label">Closing Balance</td>
                <td></td>
                <td>{closingCredit > 0 ? `0${closingCredit}` : "-"}</td>
                <td>-</td><td>-</td><td>-</td>
                <td>{partyBalance || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default PartyLedger;