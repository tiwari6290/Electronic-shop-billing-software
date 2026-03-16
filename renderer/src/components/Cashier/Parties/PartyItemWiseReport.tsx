import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronDown, Download, Printer, Calendar } from "lucide-react";
import "./PartyItemWiseReport.css";
import axios from "axios";

interface TransactionItem {
  partyId:  number;
  itemName: string;
  itemCode: string | null;
  quantity: number;
  unit:     string;
  amount:   number;
  price:    number;
  type:     "Sale" | "Purchase";
  date:     string;
}

interface GroupedItem {
  itemName:    string;
  itemCode:    string;
  salesQty:    number;
  salesUnit:   string;
  salesAmt:    number;
  avgPrice:    number;
  txnCount:    number;
}

const DATE_OPTIONS = [
  "Today", "Last 7 Days", "Last 30 Days", "Last 365 Days", "Custom",
];

const fmtQty = (n: number, unit: string) => {
  const q = Number.isInteger(n) ? n.toString() : n.toFixed(2).replace(/\.?0+$/, "");
  return `${q} ${unit}`;
};

const fmtAmt = (n: number) =>
  `₹ ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PartyItemWiseReport: React.FC = () => {
  const { id } = useParams();
  const [transactions,         setTransactions]         = useState<TransactionItem[]>([]);
  const [dateFilter,           setDateFilter]           = useState("Last 365 Days");
  const [showDateDropdown,     setShowDateDropdown]     = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [customFrom,           setCustomFrom]           = useState("");
  const [customTo,             setCustomTo]             = useState("");

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/invoices/party-item-wise/${id}`);
        const formatted = res.data.data.map((t: any) => ({
          partyId:  t.partyId,
          itemName: t.itemName,
          itemCode: t.itemCode || null,
          quantity: Number(t.quantity),
          unit:     t.unit || "PCS",
          amount:   Number(t.amount),
          price:    Number(t.price),
          type:     t.type as "Sale" | "Purchase",
          date:     t.date,
        }));
        setTransactions(formatted);
      } catch (error) {
        console.error("Error fetching item-wise report:", error);
      }
    };
    fetch();
  }, [id]);

  // ── Date filtering ────────────────────────────────────────────────────────
  const filteredByDate = useMemo(() => {
    const now = new Date(); now.setHours(23, 59, 59, 999);
    return transactions.filter(txn => {
      const d = new Date(txn.date);
      switch (dateFilter) {
        case "Today":        { const s = new Date(); s.setHours(0,0,0,0); return d >= s && d <= now; }
        case "Last 7 Days":  { const s = new Date(); s.setDate(s.getDate()-7);   s.setHours(0,0,0,0); return d >= s && d <= now; }
        case "Last 30 Days": { const s = new Date(); s.setDate(s.getDate()-30);  s.setHours(0,0,0,0); return d >= s && d <= now; }
        case "Last 365 Days":{ const s = new Date(); s.setDate(s.getDate()-365); s.setHours(0,0,0,0); return d >= s && d <= now; }
        case "Custom":
          if (!customFrom || !customTo) return true;
          return d >= new Date(customFrom) && d <= new Date(customTo + "T23:59:59");
        default: return true;
      }
    });
  }, [transactions, dateFilter, customFrom, customTo]);

  // ── Group by itemName + itemCode ──────────────────────────────────────────
  const groupedItems = useMemo<GroupedItem[]>(() => {
    const map: Record<string, GroupedItem> = {};
    filteredByDate
      .filter(txn => txn.type === "Sale")   // only sales for customer party page
      .forEach(txn => {
        const key = `${txn.itemName}__${txn.itemCode || ""}`;
        if (!map[key]) {
          map[key] = {
            itemName:  txn.itemName,
            itemCode:  txn.itemCode || "-",
            salesQty:  0,
            salesUnit: txn.unit || "PCS",
            salesAmt:  0,
            avgPrice:  0,
            txnCount:  0,
          };
        }
        map[key].salesQty += txn.quantity;
        map[key].salesAmt += txn.amount;
        map[key].avgPrice += txn.price;
        map[key].txnCount += 1;
        map[key].salesUnit = txn.unit || "PCS";
      });

    // Compute average price
    return Object.values(map).map(item => ({
      ...item,
      avgPrice: item.txnCount > 0 ? item.avgPrice / item.txnCount : 0,
    }));
  }, [filteredByDate]);

  const totals = useMemo(() => groupedItems.reduce(
    (acc, item) => ({ salesQty: acc.salesQty + item.salesQty, salesAmt: acc.salesAmt + item.salesAmt }),
    { salesQty: 0, salesAmt: 0 }
  ), [groupedItems]);

  const handleDownloadCSV = () => {
    const header = "Item Name,Item Code,Sales Quantity,Avg Price,Sales Amount\n";
    const rows   = groupedItems.map(item =>
      `${item.itemName},${item.itemCode},${item.salesQty} ${item.salesUnit},${item.avgPrice.toFixed(2)},${item.salesAmt.toFixed(2)}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ItemWiseReport.csv";
    link.click();
  };

  return (
    <div className="report-wrapper">
      {/* ── Top Bar ─────────────────────────────────────── */}
      <div className="report-topbar">
        <div className="left-controls">
          <div style={{ position: "relative" }}>
            <button className="report-date-btn" onClick={() => setShowDateDropdown(!showDateDropdown)}>
              <Calendar size={14} />
              {dateFilter}
              <ChevronDown size={14} />
            </button>
            {showDateDropdown && (
              <div className="report-dropdown">
                {DATE_OPTIONS.map(item => (
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
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
              <span>to</span>
              <input type="date" value={customTo}   onChange={e => setCustomTo(e.target.value)} />
            </div>
          )}
        </div>

        <div className="right-controls">
          <div style={{ position: "relative" }}>
            <button className="report-action-btn download"
              onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}>
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

      {/* ── Table ────────────────────────────────────────── */}
      <div className="report-card">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item Name</th>
              <th>Item Code</th>
              <th>Qty Sold</th>
              <th>Avg Price</th>
              <th>Sales Amount</th>
            </tr>
          </thead>
          <tbody>
            {groupedItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-data">No items found for the selected period</td>
              </tr>
            ) : (
              <>
                {groupedItems.map((item, i) => (
                  <tr key={`${item.itemName}-${item.itemCode}-${i}`}>
                    <td style={{ color: "#9ca3af" }}>{i + 1}</td>
                    <td style={{ fontWeight: 500, color: "#111827" }}>{item.itemName}</td>
                    <td style={{ color: "#6b7280" }}>{item.itemCode}</td>
                    <td>{fmtQty(item.salesQty, item.salesUnit)}</td>
                    <td>{fmtAmt(item.avgPrice)}</td>
                    <td style={{ fontWeight: 600 }}>{fmtAmt(item.salesAmt)}</td>
                  </tr>
                ))}
                <tr className="totals-row">
                  <td colSpan={3}><strong>Total</strong></td>
                  <td><strong>{fmtQty(totals.salesQty, groupedItems[0]?.salesUnit || "PCS")}</strong></td>
                  <td>-</td>
                  <td><strong>{fmtAmt(totals.salesAmt)}</strong></td>
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