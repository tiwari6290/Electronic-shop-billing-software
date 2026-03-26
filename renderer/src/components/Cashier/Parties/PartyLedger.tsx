import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import "./PartyLedger.css";
import api from "@/lib/axios";

interface LedgerEntry {
  id: number;
  date: string;
  voucher: string;
  refType: string;
  debit:  number | null;
  credit: number | null;
  balance: number;
}

const DATE_OPTIONS = [
  "Today", "Yesterday", "This Week", "Last Week", "Last 7 Days",
  "This Month", "Previous Month", "Last 30 Days", "This Quarter",
  "Previous Quarter", "Current Fiscal Year", "Previous Fiscal Year", "Last 365 Days",
];

const fmtDate = (d: string) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtAmt = (n: number | null) => {
  if (n === null) return "-";
  return `₹ ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  Invoice: { bg: "#fef3c7", color: "#92400e" },
  Payment: { bg: "#d1fae5", color: "#065f46" },
  Return:  { bg: "#fee2e2", color: "#991b1b" },
};

const PartyLedger: React.FC = () => {
  const { id } = useParams();

  const [ledgerData,      setLedgerData]      = useState<LedgerEntry[]>([]);
  const [openingBalance,  setOpeningBalance]  = useState<number>(0);
  const [partyName,       setPartyName]       = useState<string>("");
  const [partyPhone,      setPartyPhone]      = useState<string>("");
  const [dateFilter,      setDateFilter]      = useState("Last 365 Days");
  const [showDateDrop,    setShowDateDrop]    = useState(false);
  const [showShareDrop,   setShowShareDrop]   = useState(false);
  const [businessName]  = useState("scratchweb.solutions");
  const [businessPhone] = useState("06289909521");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await api.get(`/party-ledger/party/${id}/ledger`);
        setLedgerData(res.data.data || []);
        setOpeningBalance(res.data.openingBalance ?? 0);
      } catch { setLedgerData([]); }

      try {
        const r = await api.get(`/parties/${id}`);
        const p = r.data.data;
        if (p) { setPartyName(p.partyName || ""); setPartyPhone(p.mobileNumber || ""); }
      } catch {}
    })();
  }, [id]);

  // ── Date filtering ──────────────────────────────────────────────────────
  const filteredEntries = useMemo(() => {
    const now = new Date(); now.setHours(23, 59, 59, 999);
    return ledgerData.filter(e => {
      if (!e.date) return true;
      const d = new Date(e.date);
      switch (dateFilter) {
        case "Today":        { const s = new Date(); s.setHours(0,0,0,0); return d >= s && d <= now; }
        case "Yesterday":    { const s = new Date(); s.setDate(s.getDate()-1); s.setHours(0,0,0,0); const en = new Date(s); en.setHours(23,59,59,999); return d >= s && d <= en; }
        case "This Week":    { const s = new Date(); s.setDate(s.getDate()-s.getDay()); s.setHours(0,0,0,0); return d >= s && d <= now; }
        case "Last Week":    { const s = new Date(); s.setDate(s.getDate()-s.getDay()-7); s.setHours(0,0,0,0); const en = new Date(); en.setDate(en.getDate()-en.getDay()-1); en.setHours(23,59,59,999); return d >= s && d <= en; }
        case "Last 7 Days":  { const s = new Date(); s.setDate(s.getDate()-7); s.setHours(0,0,0,0); return d >= s && d <= now; }
        case "This Month":   { const s = new Date(now.getFullYear(), now.getMonth(), 1); return d >= s && d <= now; }
        case "Previous Month":{ const s = new Date(now.getFullYear(), now.getMonth()-1, 1); const en = new Date(now.getFullYear(), now.getMonth(), 0); en.setHours(23,59,59,999); return d >= s && d <= en; }
        case "Last 30 Days": { const s = new Date(); s.setDate(s.getDate()-30); s.setHours(0,0,0,0); return d >= s && d <= now; }
        case "This Quarter": { const q = Math.floor(now.getMonth()/3); const s = new Date(now.getFullYear(), q*3, 1); return d >= s && d <= now; }
        case "Previous Quarter":{ const q = Math.floor(now.getMonth()/3); const s = new Date(now.getFullYear(),(q-1)*3,1); const en = new Date(now.getFullYear(),q*3,0); en.setHours(23,59,59,999); return d >= s && d <= en; }
        case "Current Fiscal Year": { const fy = now.getMonth()>=3 ? now.getFullYear() : now.getFullYear()-1; return d >= new Date(fy,3,1) && d <= now; }
        case "Previous Fiscal Year":{ const fy = now.getMonth()>=3 ? now.getFullYear()-1 : now.getFullYear()-2; return d >= new Date(fy,3,1) && d <= new Date(fy+1,2,31,23,59,59,999); }
        case "Last 365 Days":{ const s = new Date(); s.setDate(s.getDate()-365); s.setHours(0,0,0,0); return d >= s && d <= now; }
        default: return true;
      }
    });
  }, [ledgerData, dateFilter]);

  // Recompute running balance for filtered window
  const entriesWithBalance = useMemo(() => {
    let running = openingBalance;
    return filteredEntries.map(e => {
      if (e.debit  !== null) running += e.debit;
      if (e.credit !== null) running -= e.credit;
      return { ...e, runningBalance: Math.round(running * 100) / 100 };
    });
  }, [filteredEntries, openingBalance]);

  const closingBalance = entriesWithBalance.length > 0
    ? entriesWithBalance[entriesWithBalance.length - 1].runningBalance
    : openingBalance;

  // ── Date range display label ─────────────────────────────────────────────
  const dateRange = useMemo(() => {
    const now = new Date();
    const fmt = (d: Date) =>
      `${d.getDate().toString().padStart(2,"0")} ${d.toLocaleString("en-IN",{month:"short"})} ${d.getFullYear()}`;
    switch (dateFilter) {
      case "Today":         return `${fmt(now)} - ${fmt(now)}`;
      case "Last 7 Days":   { const s = new Date(now); s.setDate(now.getDate()-7);   return `${fmt(s)} - ${fmt(now)}`; }
      case "Last 30 Days":  { const s = new Date(now); s.setDate(now.getDate()-30);  return `${fmt(s)} - ${fmt(now)}`; }
      case "Last 365 Days": { const s = new Date(now); s.setFullYear(now.getFullYear()-1); return `${fmt(s)} - ${fmt(now)}`; }
      default:              { const s = new Date(now); s.setFullYear(now.getFullYear()-1); return `${fmt(s)} - ${fmt(now)}`; }
    }
  }, [dateFilter]);

  const balanceLabel = closingBalance >= 0 ? "Total Receivable" : "Total Payable";

  // ── Download CSV ─────────────────────────────────────────────────────────
  const handleDownload = () => {
    const rows = [
      ["Date", "Voucher", "Type", "Debit (Invoice)", "Credit (Payment)", "Balance"],
      ...entriesWithBalance.map(e => [
        e.date, e.voucher, e.refType,
        e.debit  != null ? e.debit  : "",
        e.credit != null ? e.credit : "",
        e.runningBalance,
      ]),
    ];
    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Ledger_${partyName}.csv`;
    a.click();
  };

  return (
    <div className="pl-wrap" onClick={() => { setShowDateDrop(false); setShowShareDrop(false); }}>

      {/* ── Controls Row ──────────────────────────────────── */}
      <div className="pl-controls" onClick={e => e.stopPropagation()}>
        <div className="pl-date-wrap">
          <button className="pl-date-btn" onClick={() => { setShowDateDrop(v => !v); setShowShareDrop(false); }}>
            <span className="pl-cal-icon">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="2" width="12" height="11" rx="1.5" stroke="#667085" strokeWidth="1.3"/>
                <path d="M1 5.5h12" stroke="#667085" strokeWidth="1.3"/>
                <path d="M4.5 1v2M9.5 1v2" stroke="#667085" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </span>
            {dateFilter}
            <span className="pl-arrow">&#8964;</span>
          </button>
          {showDateDrop && (
            <div className="pl-dropdown">
              {DATE_OPTIONS.map(opt => (
                <div key={opt} className={`pl-dd-row${dateFilter === opt ? " active" : ""}`}
                  onClick={() => { setDateFilter(opt); setShowDateDrop(false); }}>
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pl-action-group">
          <button className="pl-btn" onClick={handleDownload}>Download</button>
          <button className="pl-btn" onClick={() => window.print()}>Print</button>
          <div className="pl-share-wrap">
            <button className="pl-btn pl-btn-share"
              onClick={() => { setShowShareDrop(v => !v); setShowDateDrop(false); }}>
              Share <span className="pl-arrow">&#8964;</span>
            </button>
            {showShareDrop && (
              <div className="pl-dropdown pl-share-dd">
                <div className="pl-dd-row" onClick={() => setShowShareDrop(false)}>Share via WhatsApp</div>
                <div className="pl-dd-row" onClick={() => setShowShareDrop(false)}>Share via Email</div>
                <div className="pl-dd-row" onClick={() => setShowShareDrop(false)}>Copy Link</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Ledger Document ───────────────────────────────── */}
      <div className="pl-doc">

        {/* Header */}
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
              <span className="pl-sum-value" style={{ color: closingBalance >= 0 ? "#4f46e5" : "#ef4444" }}>
                ₹ {Math.abs(closingBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
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
                <th>Type</th>
                <th>Debit (Invoice)</th>
                <th>Credit (Payment)</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>

              {/* Opening Balance */}
              <tr className="pl-special">
                <td></td>
                <td className="pl-special-label">Opening Balance</td>
                <td></td>
                <td>-</td>
                <td>-</td>
                <td>
                  {openingBalance !== 0
                    ? `₹ ${Math.abs(openingBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                    : "₹ 0.00"}
                </td>
              </tr>

              {/* Entries */}
              {entriesWithBalance.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#9ca3af", fontSize: 14 }}>
                    No transactions for the selected period
                  </td>
                </tr>
              ) : (
                entriesWithBalance.map(e => {
                  const ts = TYPE_STYLE[e.refType] || { bg: "#f3f4f6", color: "#374151" };
                  return (
                    <tr key={e.id}>
                      <td>{fmtDate(e.date)}</td>
                      <td style={{ color: "#4f46e5", fontWeight: 500 }}>{e.voucher || "-"}</td>
                      <td>
                        <span style={{
                          display: "inline-block", padding: "2px 8px",
                          borderRadius: 12, fontSize: 12, fontWeight: 500,
                          background: ts.bg, color: ts.color,
                        }}>
                          {e.refType}
                        </span>
                      </td>
                      <td style={{ color: e.debit !== null ? "#dc2626" : "#9ca3af" }}>
                        {fmtAmt(e.debit)}
                      </td>
                      <td style={{ color: e.credit !== null ? "#16a34a" : "#9ca3af" }}>
                        {fmtAmt(e.credit)}
                      </td>
                      <td style={{ fontWeight: 600, color: "#111827" }}>
                        ₹ {Math.abs(e.runningBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Closing Balance */}
              <tr className="pl-special">
                <td></td>
                <td className="pl-special-label">Closing Balance</td>
                <td></td>
                <td>-</td>
                <td>-</td>
                <td style={{ fontWeight: 700, color: closingBalance >= 0 ? "#4f46e5" : "#ef4444" }}>
                  ₹ {Math.abs(closingBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PartyLedger;