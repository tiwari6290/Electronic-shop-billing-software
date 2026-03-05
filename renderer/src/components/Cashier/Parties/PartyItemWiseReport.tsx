import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronDown, Download, Printer, Calendar } from "lucide-react";
import "./PartyItemWiseReport.css";
import axios from "axios";

interface TransactionItem {
  partyId: number;
  itemName: string;
  itemCode?: string;
  quantity: number;
  unit?: string;
  amount: number;
  type: "Sale" | "Purchase";
  date: string;
}

interface GroupedItem {
  itemName: string;
  itemCode: string;
  salesQty: number;
  salesUnit: string;
  salesAmt: number;
  purchaseQty: number;
  purchaseUnit: string;
  purchaseAmt: number;
}

const DATE_OPTIONS = [
  "Today","Last 7 Days","Last 30 Days","Last 365 Days","Custom",
];

const PartyItemWiseReport: React.FC = () => {
  const { id } = useParams();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [dateFilter, setDateFilter] = useState("Last 365 Days");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/transactions/party/${id}`);
        const formatted = res.data.data.map((t: any) => ({
          partyId: t.partyId,
          itemName: t.itemName,
          itemCode: t.itemCode,
          quantity: t.quantity,
          unit: t.unit || "PCS",
          amount: t.amount,
          type: t.type,
          date: t.date,
        }));
        setTransactions(formatted);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };
    if (id) fetchTransactions();
  }, [id]);

  const filteredByDate = useMemo(() => {
    const now = new Date();
    return transactions.filter((txn) => {
      const d = new Date(txn.date);
      switch (dateFilter) {
        case "Today": return d.toDateString() === now.toDateString();
        case "Last 7 Days":  { const s = new Date(); s.setDate(now.getDate()-7);   return d >= s && d <= now; }
        case "Last 30 Days": { const s = new Date(); s.setDate(now.getDate()-30);  return d >= s && d <= now; }
        case "Last 365 Days":{ const s = new Date(); s.setDate(now.getDate()-365); return d >= s && d <= now; }
        case "Custom":
          if (!customFrom || !customTo) return true;
          return d >= new Date(customFrom) && d <= new Date(customTo);
        default: return true;
      }
    });
  }, [transactions, dateFilter, customFrom, customTo]);

  const groupedItems = useMemo<GroupedItem[]>(() => {
    const map: Record<string, GroupedItem> = {};
    filteredByDate.forEach((txn) => {
      const key = txn.itemName;
      if (!map[key]) {
        map[key] = {
          itemName: txn.itemName,
          itemCode: txn.itemCode || "-",
          salesQty: 0, salesUnit: txn.unit || "PCS", salesAmt: 0,
          purchaseQty: 0, purchaseUnit: txn.unit || "PCS", purchaseAmt: 0,
        };
      }
      if (txn.type === "Sale") {
        map[key].salesQty += txn.quantity;
        map[key].salesAmt += txn.amount;
        map[key].salesUnit = txn.unit || "PCS";
      } else {
        map[key].purchaseQty += txn.quantity;
        map[key].purchaseAmt += txn.amount;
        map[key].purchaseUnit = txn.unit || "PCS";
      }
    });
    return Object.values(map);
  }, [filteredByDate]);

  const totals = useMemo(() =>
    groupedItems.reduce((acc, item) => ({
      salesQty: acc.salesQty + item.salesQty,
      salesAmt: acc.salesAmt + item.salesAmt,
      purchaseQty: acc.purchaseQty + item.purchaseQty,
      purchaseAmt: acc.purchaseAmt + item.purchaseAmt,
    }), { salesQty: 0, salesAmt: 0, purchaseQty: 0, purchaseAmt: 0 }),
    [groupedItems]);

  const handleDownloadCSV = () => {
    const header = "Item Name,Item Code,Sales Qty,Sales Amount,Purchase Qty,Purchase Amount\n";
    const rows = groupedItems.map((item) =>
      `${item.itemName},${item.itemCode},${item.salesQty},${item.salesAmt},${item.purchaseQty},${item.purchaseAmt}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ItemWiseReport.csv";
    link.click();
  };

  return (
    <div className="report-wrapper">
      {/* Top Bar */}
      <div className="report-topbar">
        <div className="left-controls">
          {/* Date Filter */}
          <div style={{ position: "relative" }}>
            <button className="report-date-btn" onClick={() => setShowDateDropdown(!showDateDropdown)}>
              <Calendar size={14} />
              {dateFilter}
              <ChevronDown size={14} />
            </button>
            {showDateDropdown && (
              <div className="report-dropdown">
                {DATE_OPTIONS.map((item) => (
                  <div key={item} className={dateFilter === item ? "selected" : ""}
                    onClick={() => { setDateFilter(item); setShowDateDropdown(false); }}>
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {dateFilter === "Custom" && (
            <div className="custom-date-range">
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
              <span>to</span>
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
            </div>
          )}
        </div>

        <div className="right-controls">
          <div style={{ position: "relative" }}>
            <button className="report-action-btn download" onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}>
              <Download size={14} /> Download <ChevronDown size={13} />
            </button>
            {showDownloadDropdown && (
              <div className="report-dropdown right-align">
                <div onClick={() => { handleDownloadCSV(); setShowDownloadDropdown(false); }}>Download as CSV</div>
                <div onClick={() => { window.print(); setShowDownloadDropdown(false); }}>Download as PDF</div>
              </div>
            )}
          </div>
          <button className="report-action-btn" onClick={() => window.print()}>
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="report-card">
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Item Code</th>
              <th>Sales Quantity</th>
              <th>Sales Amount</th>
              <th>Purchase Quantity</th>
              <th>Purchase Amount</th>
            </tr>
          </thead>
          <tbody>
            {groupedItems.length === 0 ? (
              <tr><td colSpan={6} className="no-data">No data available</td></tr>
            ) : (
              <>
                {groupedItems.map((item, i) => (
                  <tr key={i}>
                    <td>{item.itemName}</td>
                    <td>{item.itemCode}</td>
                    <td>{item.salesQty.toFixed(1)} {item.salesUnit}</td>
                    <td>&#8377; {item.salesAmt.toLocaleString("en-IN")}</td>
                    <td>{item.purchaseQty.toFixed(1)} {item.purchaseUnit}</td>
                    <td>{item.purchaseAmt > 0 ? `&#8377; ${item.purchaseAmt.toLocaleString("en-IN")}` : "-"}</td>
                  </tr>
                ))}
                <tr className="totals-row">
                  <td colSpan={2}><strong>Total</strong></td>
                  <td><strong>{totals.salesQty.toFixed(1)} PCS</strong></td>
                  <td><strong>&#8377; {totals.salesAmt.toLocaleString("en-IN")}</strong></td>
                  <td><strong>{totals.purchaseQty.toFixed(1)} PCS</strong></td>
                  <td><strong>{totals.purchaseAmt > 0 ? `&#8377; ${totals.purchaseAmt.toLocaleString("en-IN")}` : "-"}</strong></td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartyItemWiseReport;