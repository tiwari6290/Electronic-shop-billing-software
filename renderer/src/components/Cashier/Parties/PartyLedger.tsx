import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PartyLedger.css";

interface LedgerEntry {
  date: string;
  voucher: string;
  srNo: string | number;
  credit: number | null;
  debit: number | null;
  balance: number;
}

const dummyLedger: LedgerEntry[] = [
  { date: "27 Feb 2026", voucher: "Sales Invoice", srNo: 3, credit: 40000, debit: 42000, balance: 2000 },
  { date: "27 Feb 2026", voucher: "Sales Invoice", srNo: 4, credit: 30000, debit: 30000, balance: 2000 },
  { date: "28 Feb 2026", voucher: "Sales Invoice", srNo: 12, credit: 100000, debit: 180000, balance: 82000 },
  { date: "01 Mar 2026", voucher: "Sales Invoice", srNo: 18, credit: null, debit: 42000, balance: 124000 },
];

const PartyLedger: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const party = JSON.parse(localStorage.getItem("parties") || "[]")
    .find((p: any) => p.id === Number(id));

  if (!party) return <div>Party Not Found</div>;

  return (
    <div className="ledger-container">
      {/* Header */}
      <div className="ledger-top">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h2>{party.name}</h2>
      </div>

      {/* Summary Box */}
      <div className="ledger-summary">
        <div>
          <p className="ledger-company">scratchweb.solutions</p>
          <p className="ledger-phone">Phone: 06289909521</p>
        </div>

        <div className="ledger-total-box">
          <p>Total Receivable</p>
          <h3>₹ {party.balance.toLocaleString()}</h3>
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
              <th>Balance</th>
            </tr>
          </thead>

          <tbody>
            {dummyLedger.map((entry, index) => (
              <tr key={index}>
                <td>{entry.date}</td>
                <td>{entry.voucher}</td>
                <td>{entry.srNo}</td>
                <td>{entry.credit ? `₹ ${entry.credit}` : "-"}</td>
                <td>{entry.debit ? `₹ ${entry.debit}` : "-"}</td>
                <td>₹ {entry.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartyLedger;