import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "./PartyItemWiseReport.css";

interface TransactionItem {
  partyId: number;
  itemName: string;
  itemCode?: string;
  quantity: number;
  amount: number;
  type: "Sale" | "Purchase";
  date: string; // ISO format preferred
}

interface GroupedItem {
  itemName: string;
  itemCode: string;
  salesQty: number;
  salesAmt: number;
  purchaseQty: number;
  purchaseAmt: number;
}

const PartyItemWiseReport: React.FC = () => {
  const { id } = useParams();

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [dateFilter, setDateFilter] = useState("Last 365 Days");
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // Load transactions
  useEffect(() => {
    const allTransactions =
      JSON.parse(localStorage.getItem("transactions") || "[]");

    const partyTransactions = allTransactions.filter(
      (t: TransactionItem) => t.partyId === Number(id)
    );

    setTransactions(partyTransactions);
  }, [id]);

  // 🔹 Date Filtering Logic
  const filteredByDate = useMemo(() => {
    const now = new Date();

    return transactions.filter((txn) => {
      const txnDate = new Date(txn.date);

      switch (dateFilter) {
        case "Today":
          return txnDate.toDateString() === now.toDateString();

        case "Last 7 Days":
          const last7 = new Date();
          last7.setDate(now.getDate() - 7);
          return txnDate >= last7 && txnDate <= now;

        case "Last 30 Days":
          const last30 = new Date();
          last30.setDate(now.getDate() - 30);
          return txnDate >= last30 && txnDate <= now;

        case "Last 365 Days":
          const last365 = new Date();
          last365.setDate(now.getDate() - 365);
          return txnDate >= last365 && txnDate <= now;

        case "Custom":
          if (!customFrom || !customTo) return true;
          return (
            txnDate >= new Date(customFrom) &&
            txnDate <= new Date(customTo)
          );

        default:
          return true;
      }
    });
  }, [transactions, dateFilter, customFrom, customTo]);

  // 🔹 Group Items
  const groupedItems = useMemo<GroupedItem[]>(() => {
    const map: Record<string, GroupedItem> = {};

    filteredByDate.forEach((txn) => {
      if (!map[txn.itemName]) {
        map[txn.itemName] = {
          itemName: txn.itemName,
          itemCode: txn.itemCode || "-",
          salesQty: 0,
          salesAmt: 0,
          purchaseQty: 0,
          purchaseAmt: 0,
        };
      }

      if (txn.type === "Sale") {
        map[txn.itemName].salesQty += txn.quantity;
        map[txn.itemName].salesAmt += txn.amount;
      } else {
        map[txn.itemName].purchaseQty += txn.quantity;
        map[txn.itemName].purchaseAmt += txn.amount;
      }
    });

    return Object.values(map);
  }, [filteredByDate]);

  // 🔹 Totals
  const totals = useMemo(() => {
    return groupedItems.reduce(
      (acc, item) => {
        acc.salesQty += item.salesQty;
        acc.salesAmt += item.salesAmt;
        acc.purchaseQty += item.purchaseQty;
        acc.purchaseAmt += item.purchaseAmt;
        return acc;
      },
      {
        salesQty: 0,
        salesAmt: 0,
        purchaseQty: 0,
        purchaseAmt: 0,
      }
    );
  }, [groupedItems]);

  // 🔹 Download CSV
  const handleDownload = () => {
    const header =
      "Item Name,Item Code,Sales Qty,Sales Amount,Purchase Qty,Purchase Amount\n";

    const rows = groupedItems
      .map(
        (item) =>
          `${item.itemName},${item.itemCode},${item.salesQty},${item.salesAmt},${item.purchaseQty},${item.purchaseAmt}`
      )
      .join("\n");

    const blob = new Blob([header + rows], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ItemWiseReport.csv";
    link.click();
  };

  return (
    <div className="report-wrapper">

      {/* 🔹 Top Bar */}
      <div className="report-topbar">
        <div className="left-controls">
          <button
            className="date-btn"
            onClick={() => setShowDateDropdown(!showDateDropdown)}
          >
            {dateFilter} ▼
          </button>

          {showDateDropdown && (
            <div className="date-dropdown">
              {[
                "Today",
                "Last 7 Days",
                "Last 30 Days",
                "Last 365 Days",
                "Custom",
              ].map((item) => (
                <div
                  key={item}
                  onClick={() => {
                    setDateFilter(item);
                    setShowDateDropdown(false);
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          )}

          {/* Custom Date Picker */}
          {dateFilter === "Custom" && (
            <div className="custom-date-range">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
              <span>to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="right-controls">
          <button onClick={handleDownload}>Download</button>
          <button onClick={() => window.print()}>Print</button>
        </div>
      </div>

      {/* 🔹 Table */}
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
              <tr>
                <td colSpan={6} className="no-data">
                  No data available
                </td>
              </tr>
            ) : (
              <>
                {groupedItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.itemName}</td>
                    <td>{item.itemCode}</td>
                    <td>{item.salesQty} PCS</td>
                    <td>₹ {item.salesAmt.toLocaleString()}</td>
                    <td>{item.purchaseQty} PCS</td>
                    <td>
                      {item.purchaseAmt > 0
                        ? `₹ ${item.purchaseAmt.toLocaleString()}`
                        : "-"}
                    </td>
                  </tr>
                ))}

                <tr className="totals-row">
                  <td colSpan={2}><strong>Total</strong></td>
                  <td><strong>{totals.salesQty} PCS</strong></td>
                  <td><strong>₹ {totals.salesAmt.toLocaleString()}</strong></td>
                  <td><strong>{totals.purchaseQty} PCS</strong></td>
                  <td>
                    <strong>
                      {totals.purchaseAmt > 0
                        ? `₹ ${totals.purchaseAmt.toLocaleString()}`
                        : "-"}
                    </strong>
                  </td>
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