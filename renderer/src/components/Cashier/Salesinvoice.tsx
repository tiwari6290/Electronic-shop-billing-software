import { useState, useEffect, useRef } from "react";
import {
  BarChart2, Settings, AlignJustify, Search, ChevronDown, Zap, Plus,
  MoreVertical, Edit2, Clock, Copy, FileText, XCircle, Trash2,
  TrendingUp, CheckCircle, AlertCircle, Ban, ArrowLeft, Download,
  Printer, Star, Calendar, X,
} from "lucide-react";
import Navbar from "./Navbar";
import BillForm from "./Billform";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Invoice {
  id: number;
  date: string;
  invoiceNumber: string;
  party: string;
  dueIn: string;
  amount: number;
  unpaid: number;
  status: "Paid" | "Unpaid" | "Partially Paid" | "Cancelled";
  invoiceType: "cash" | "credit";
  dueDate: string;
}

type ViewType = "landing" | "create" | "sales-summary" | "gstr1" | "daybook" | "billwise";

// ─── Shared Data ──────────────────────────────────────────────────────────────
const initialInvoices: Invoice[] = [
  { id: 1,  date: "27-02-2026", invoiceNumber: "1",  party: "ranjan", dueIn: "-",       amount: 168000, unpaid: 0,     status: "Paid",           invoiceType: "cash",   dueDate: "2026-03-29" },
  { id: 2,  date: "27-02-2026", invoiceNumber: "2",  party: "sumon",  dueIn: "-",       amount: 42000,  unpaid: 0,     status: "Paid",           invoiceType: "cash",   dueDate: "2026-03-29" },
  { id: 3,  date: "27-02-2026", invoiceNumber: "3",  party: "anando", dueIn: "29 Days", amount: 42000,  unpaid: 2000,  status: "Partially Paid", invoiceType: "credit", dueDate: "2026-03-29" },
  { id: 4,  date: "27-02-2026", invoiceNumber: "4",  party: "anando", dueIn: "-",       amount: 30000,  unpaid: 0,     status: "Paid",           invoiceType: "cash",   dueDate: "2026-03-29" },
  { id: 12, date: "28-02-2026", invoiceNumber: "12", party: "anando", dueIn: "-",       amount: 180000, unpaid: 80000, status: "Partially Paid", invoiceType: "credit", dueDate: "2026-03-30" },
  { id: 13, date: "28-02-2026", invoiceNumber: "13", party: "ranjan", dueIn: "-",       amount: 90000,  unpaid: 30000, status: "Partially Paid", invoiceType: "credit", dueDate: "2026-03-04" },
];

const daybookRows = [
  { date: "27-02-2026", party: "ranjan",    txType: "Sales Invoices",       txNo: "1",  total: 168000, moneyIn: 168000, moneyOut: 0 },
  { date: "27-02-2026", party: "sumon",     txType: "Sales Invoices",       txNo: "2",  total: 42000,  moneyIn: 42000,  moneyOut: 0 },
  { date: "27-02-2026", party: "anando",    txType: "Sales Invoices",       txNo: "3",  total: 42000,  moneyIn: 40000,  moneyOut: 2000 },
  { date: "27-02-2026", party: "anando",    txType: "Sales Invoices",       txNo: "4",  total: 30000,  moneyIn: 30000,  moneyOut: 0 },
  { date: "27-02-2026", party: "Cash Sale", txType: "Quotation / Estimate", txNo: "3",  total: 0,      moneyIn: 0,      moneyOut: 0 },
  { date: "27-02-2026", party: "Cash Sale", txType: "Purchase Orders",      txNo: "1",  total: 0,      moneyIn: 0,      moneyOut: 0 },
  { date: "28-02-2026", party: "anando",    txType: "Sales Invoices",       txNo: "12", total: 180000, moneyIn: 100000, moneyOut: 80000 },
  { date: "28-02-2026", party: "ranjan",    txType: "Sales Invoices",       txNo: "13", total: 90000,  moneyIn: 60000,  moneyOut: 30000 },
  { date: "28-02-2026", party: "ranjan",    txType: "Payment In",           txNo: "2",  total: 7600,   moneyIn: 7600,   moneyOut: 0 },
];

const billwiseRows = [
  { date: "28-02-2026", invoiceNo: "13", party: "ranjan", invoiceAmt: 90000,  salesAmt: 90000,  purchaseAmt: 64406.78,  profit: 11864.41, profitPct: 18.42 },
  { date: "28-02-2026", invoiceNo: "12", party: "anando", invoiceAmt: 180000, salesAmt: 180000, purchaseAmt: 128813.56, profit: 23728.81, profitPct: 18.42 },
  { date: "27-02-2026", invoiceNo: "4",  party: "anando", invoiceAmt: 30000,  salesAmt: 30000,  purchaseAmt: 0,         profit: 0,        profitPct: 0 },
  { date: "27-02-2026", invoiceNo: "3",  party: "anando", invoiceAmt: 42000,  salesAmt: 42000,  purchaseAmt: 0,         profit: 0,        profitPct: 0 },
  { date: "27-02-2026", invoiceNo: "2",  party: "sumon",  invoiceAmt: 42000,  salesAmt: 42000,  purchaseAmt: 0,         profit: 0,        profitPct: 0 },
  { date: "27-02-2026", invoiceNo: "1",  party: "ranjan", invoiceAmt: 168000, salesAmt: 168000, purchaseAmt: 0,         profit: 0,        profitPct: 0 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatINR = (n: number) => "₹ " + Number(n).toLocaleString("en-IN");
const statusColor = (s: string) => s === "Paid" ? "#16a34a" : s === "Partially Paid" ? "#d97706" : s === "Unpaid" ? "#dc2626" : "#6b7280";
const statusBg   = (s: string) => s === "Paid" ? "#dcfce7" : s === "Partially Paid" ? "#fef3c7" : s === "Unpaid" ? "#fee2e2" : "#f3f4f6";
const calcTax    = (amount: number) => {
  const taxable = amount / 1.18;
  const tax = amount - taxable;
  return { taxable, cgst: tax / 2, sgst: tax / 2, totalTax: tax };
};

const DATE_FILTERS = ["Today","Yesterday","This Week","Last Week","Last 7 Days","This Month","Previous Month","Last 30 Days","This Quarter","Last 365 Days","This Financial Year","Last Financial Year","Custom Range"];
const ROW_ACTIONS = [
  { label: "Edit",              icon: Edit2 },
  { label: "Edit History",      icon: Clock },
  { label: "Duplicate",         icon: Copy },
  { label: "Issue Credit Note", icon: FileText, badge: "New" },
  { label: "Cancel Invoice",    icon: XCircle },
  { label: "Delete",            icon: Trash2,  danger: true },
];

// ─── useOutsideClick ──────────────────────────────────────────────────────────
function useOutsideClick<T extends HTMLElement = HTMLDivElement>(cb: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) cb(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [cb]);
  return ref;
}

// ─── Shared Styles ────────────────────────────────────────────────────────────
const thStyle: React.CSSProperties = {
  padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700,
  color: "#64748b", background: "#f8fafc", borderBottom: "2px solid #e2e8f0",
  whiteSpace: "nowrap", letterSpacing: "0.04em",
};
const tdStyle: React.CSSProperties = {
  padding: "11px 14px", fontSize: 13, color: "#374151",
  borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap",
};
const reportHeaderStyle: React.CSSProperties = {
  background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "14px 28px",
  display: "flex", alignItems: "center", justifyContent: "space-between",
};
const btnOutline: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
  border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff",
  cursor: "pointer", fontSize: 13, color: "#475569", fontFamily: "inherit",
};
const filterBarStyle: React.CSSProperties = {
  background: "#fff", borderBottom: "1px solid #e2e8f0",
  padding: "10px 24px", display: "flex", gap: 10, flexWrap: "wrap",
};

// ─── ReportHeader ─────────────────────────────────────────────────────────────
function ReportHeader({ title, onBack, extra, actions }: { title: string; onBack: () => void; extra?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div style={reportHeaderStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ border: "none", background: "none", cursor: "pointer", display: "flex", color: "#64748b" }}>
          <ArrowLeft size={18} />
        </button>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>{title}</h2>
        <button style={{ ...btnOutline, padding: "5px 10px", fontSize: 12 }}>
          <Star size={13} /> Favourite
        </button>
        {extra}
      </div>
      <div style={{ display: "flex", gap: 10 }}>{actions}</div>
    </div>
  );
}

// ─── SALES SUMMARY ────────────────────────────────────────────────────────────
function SalesSummaryPage({ onBack, invoices }: { onBack: () => void; invoices: Invoice[] }) {
  const total = invoices.reduce((s, i) => s + i.amount, 0);
  return (
    <div style={{ flex: 1, background: "#f8fafc", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif" }}>
      <ReportHeader title="Sales Summary - Staff wise" onBack={onBack} actions={
        <>
          <button style={btnOutline}><Download size={14} /> Download Excel</button>
          <button style={btnOutline}><Printer size={14} /> Print PDF</button>
        </>
      } />
      <div style={filterBarStyle}>
        <button style={btnOutline}><Search size={13} color="#94a3b8" /> Search Party <ChevronDown size={13} /></button>
        <button style={btnOutline}>All Staff <ChevronDown size={13} /></button>
        <button style={btnOutline}><Calendar size={13} /> This Week <ChevronDown size={13} /></button>
        <button style={btnOutline}>Invoice Type <ChevronDown size={13} /></button>
        <button style={btnOutline}>Invoice Status <ChevronDown size={13} /></button>
      </div>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px", maxWidth: 280 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4f46e5" }} />
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Total Sales</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#1e293b" }}>₹ {total.toLocaleString("en-IN")}</div>
        </div>
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["Date","Invoice No","Party Name","Due Date","Amount","Balance Amount","Invoice Type","Invoice Status","Created By"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => (
                <tr key={inv.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafbff" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0f4ff")}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafbff")}
                >
                  <td style={tdStyle}>{inv.date}</td>
                  <td style={{ ...tdStyle, color: "#4f46e5", fontWeight: 600 }}>{inv.invoiceNumber}</td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{inv.party}</td>
                  <td style={tdStyle}>{inv.dueDate}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>₹{inv.amount.toLocaleString("en-IN")}</td>
                  <td style={tdStyle}>₹{inv.unpaid.toLocaleString("en-IN")}</td>
                  <td style={tdStyle}>{inv.invoiceType}</td>
                  <td style={tdStyle}>
                    <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700, background: statusBg(inv.status), color: statusColor(inv.status) }}>
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: "#94a3b8" }}>-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── GSTR-1 ───────────────────────────────────────────────────────────────────
function GSTR1Page({ onBack, invoices }: { onBack: () => void; invoices: Invoice[] }) {
  const [activeTab, setActiveTab] = useState<"sales" | "return" | "purchase">("sales");
  const rows = invoices.flatMap(inv => {
    const c = calcTax(inv.amount);
    return [
      { ...inv, taxRate: 0,  taxable: inv.amount, cgst: 0,      sgst: 0,      totalTax: 0 },
      { ...inv, taxRate: 18, taxable: c.taxable,  cgst: c.cgst, sgst: c.sgst, totalTax: c.totalTax },
    ];
  });
  const thG: React.CSSProperties = { ...thStyle, position: "sticky", top: 0, zIndex: 2 };
  const thGrp: React.CSSProperties = {
    padding: "8px 12px", textAlign: "center", fontSize: 11, fontWeight: 700,
    color: "#374151", background: "#f1f5f9", borderBottom: "1px solid #e2e8f0",
    borderRight: "1px solid #e2e8f0", whiteSpace: "nowrap",
  };
  return (
    <div style={{ flex: 1, background: "#f8fafc", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif" }}>
      <ReportHeader title="GSTR-1 (Sales)" onBack={onBack} actions={
        <button style={{ ...btnOutline, fontSize: 12 }}>How to use JSON file</button>
      } />
      <div style={filterBarStyle}>
        <button style={btnOutline}>Last 30 Days <ChevronDown size={13} /></button>
        <button style={btnOutline}>Download JSON <ChevronDown size={13} /></button>
        <button style={btnOutline}>Email Excel <ChevronDown size={13} /></button>
        <button style={btnOutline}><Printer size={13} /> Print Pdf</button>
        <button style={{ ...btnOutline, border: "1px solid #4f46e5", background: "#eef2ff", color: "#4f46e5", fontWeight: 600 }}>
          Invoice View <ChevronDown size={13} />
        </button>
      </div>
      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 24px", display: "flex", gap: 4 }}>
        {(["sales","return","purchase"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "10px 16px", fontSize: 13, fontWeight: activeTab === tab ? 700 : 400,
            color: activeTab === tab ? "#4f46e5" : "#64748b", cursor: "pointer",
            background: "none", border: "none",
            borderBottom: activeTab === tab ? "2px solid #4f46e5" : "2px solid transparent",
            fontFamily: "inherit",
          }}>
            {tab === "sales" ? "Sales" : tab === "return" ? "Sales Return/ Credit Note" : "Purchase Return/ Debit Note"}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, padding: 24, display: "flex", flexDirection: "column", gap: 16, overflow: "hidden" }}>
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "auto", flex: 1 }}>
          <table style={{ borderCollapse: "collapse", minWidth: 1500 }}>
            <thead>
              <tr>
                <th colSpan={4} style={thGrp}>&nbsp;</th>
                <th colSpan={2} style={thGrp}>Place of Supply</th>
                <th colSpan={4} style={{ ...thGrp, borderLeft: "1px solid #e2e8f0" }}>Invoice Details</th>
                <th colSpan={5} style={{ ...thGrp, borderLeft: "1px solid #e2e8f0" }}>Amount of Tax</th>
              </tr>
              <tr>
                {["GSTIN","Customer Name","State Code","State Name","Invoice Number","Invoice Date","Invoice Value","Total Tax(%)","Taxable Value","CGST","SGST/UTGST","IGST","CESS","Total Tax"].map(h => (
                  <th key={h} style={thG}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeTab === "sales" && rows.map((row, i) => (
                <tr key={`${row.id}-${row.taxRate}-${i}`} style={{ background: i % 4 < 2 ? "#fff" : "#fafbff" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0f4ff")}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 4 < 2 ? "#fff" : "#fafbff")}
                >
                  <td style={tdStyle}></td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{row.party}</td>
                  <td style={tdStyle}></td>
                  <td style={tdStyle}></td>
                  <td style={{ ...tdStyle, color: "#4f46e5", fontWeight: 600 }}>{row.invoiceNumber}</td>
                  <td style={tdStyle}>{row.date}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>₹{row.amount.toLocaleString("en-IN")}</td>
                  <td style={tdStyle}>{row.taxRate}</td>
                  <td style={tdStyle}>₹{row.taxable.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                  <td style={tdStyle}>₹{row.cgst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                  <td style={tdStyle}>₹{row.sgst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                  <td style={tdStyle}>₹0</td>
                  <td style={tdStyle}>₹0</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>₹{row.totalTax.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                </tr>
              ))}
              {activeTab !== "sales" && (
                <tr><td colSpan={14} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>No data available for this section.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 16px", fontSize: 12, color: "#92400e" }}>
          Invoices <strong>pushed to IRN</strong> will be autopopulated on govt GST portal. However, the tax payer should still verify all the data in this report at the time of filing to avoid any errors
        </div>
      </div>
    </div>
  );
}

// ─── DAYBOOK ──────────────────────────────────────────────────────────────────
function DayBookPage({ onBack }: { onBack: () => void }) {
  const netAmount = daybookRows.reduce((s, r) => s + r.moneyIn - r.moneyOut, 0);
  return (
    <div style={{ flex: 1, background: "#f8fafc", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif" }}>
      <ReportHeader title="Daybook" onBack={onBack} actions={
        <>
          <button style={btnOutline}><Download size={14} /> Download Excel <ChevronDown size={12} /></button>
          <button style={btnOutline}><Printer size={14} /> Print PDF</button>
        </>
      } />
      <div style={filterBarStyle}>
        <button style={btnOutline}>All Staff <ChevronDown size={13} /></button>
        <button style={btnOutline}><Calendar size={13} /> This Week <ChevronDown size={13} /></button>
        <button style={btnOutline}>All Transactions <ChevronDown size={13} /></button>
      </div>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
          Net Amount: <span style={{ color: "#4f46e5", fontSize: 16, fontWeight: 700 }}>₹ {netAmount.toLocaleString("en-IN")}</span>
        </div>
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["DATE","PARTY NAME","TRANSACTION TYPE","TRANSACTION NO.","TOTAL AMOUNT","MONEY IN","MONEY OUT","BALANCE AMOUNT","CREATED BY"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {daybookRows.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafbff" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0f4ff")}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafbff")}
                >
                  <td style={tdStyle}>{row.date}</td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{row.party}</td>
                  <td style={tdStyle}>{row.txType}</td>
                  <td style={{ ...tdStyle, color: "#4f46e5", fontWeight: 600 }}>{row.txNo}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{row.total > 0 ? `₹ ${row.total.toLocaleString("en-IN")}` : "-"}</td>
                  <td style={{ ...tdStyle, color: "#16a34a", fontWeight: 500 }}>{row.moneyIn > 0 ? `₹ ${row.moneyIn.toLocaleString("en-IN")}` : "-"}</td>
                  <td style={{ ...tdStyle, color: row.moneyOut > 0 ? "#dc2626" : "#374151" }}>{row.moneyOut > 0 ? `₹ ${row.moneyOut.toLocaleString("en-IN")}` : "-"}</td>
                  <td style={{ ...tdStyle, color: "#94a3b8" }}>-</td>
                  <td style={{ ...tdStyle, color: "#94a3b8" }}>-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── BILL WISE PROFIT ─────────────────────────────────────────────────────────
function BillWiseProfitPage({ onBack }: { onBack: () => void }) {
  const netProfit = billwiseRows.reduce((s, r) => s + r.profit, 0);
  return (
    <div style={{ flex: 1, background: "#f8fafc", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif" }}>
      <ReportHeader title="Bill Wise Profit" onBack={onBack} actions={
        <>
          <button style={btnOutline}><Download size={14} /> Download Excel <ChevronDown size={12} /></button>
          <button style={btnOutline}><Printer size={14} /> Print PDF</button>
        </>
      } />
      <div style={filterBarStyle}>
        <div style={{ ...btnOutline, cursor: "pointer" }}>All Parties <X size={13} color="#94a3b8" /></div>
        <button style={btnOutline}><Calendar size={13} /> This Week <ChevronDown size={13} /></button>
      </div>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
          Net Profit: <span style={{ color: "#16a34a", fontSize: 16, fontWeight: 700 }}>₹ {netProfit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
        </div>
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["DATE","INVOICE NO.","PARTY NAME","INVOICE AMOUNT","SALES AMOUNT","PURCHASE AMOUNT","PROFIT"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {billwiseRows.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafbff" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0f4ff")}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafbff")}
                >
                  <td style={tdStyle}>{row.date}</td>
                  <td style={{ ...tdStyle, color: "#4f46e5", fontWeight: 600 }}>{row.invoiceNo}</td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{row.party}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>₹ {row.invoiceAmt.toLocaleString("en-IN")}</td>
                  <td style={tdStyle}>₹ {row.salesAmt.toLocaleString("en-IN")}</td>
                  <td style={tdStyle}>{row.purchaseAmt > 0 ? `₹ ${row.purchaseAmt.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "-"}</td>
                  <td style={tdStyle}>
                    {row.profit > 0
                      ? <span style={{ color: "#16a34a", fontWeight: 700 }}>₹ {row.profit.toLocaleString("en-IN", { maximumFractionDigits: 2 })} ({row.profitPct}%)</span>
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function SalesInvoice() {
  const [view, setView]               = useState<ViewType>("landing");
  const [invoices, setInvoices]       = useState<Invoice[]>(initialInvoices);
  const [openMenu, setOpenMenu]       = useState<number | null>(null);
  const [dateOpen, setDateOpen]       = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("Last 365 Days");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Bulk dropdown + modal states
  const [bulkOpen, setBulkOpen]             = useState(false);
  const [bulkModalOpen, setBulkModalOpen]   = useState(false);
  const [modalDateRange, setModalDateRange] = useState("Last 365 Days");
  const [modalParty, setModalParty]         = useState("All Parties");
  const [modalEmail, setModalEmail]         = useState("");
  const [sendToCa, setSendToCa]             = useState(true);
  const [modalCaEmail, setModalCaEmail]     = useState("");
  const [modalDateOpen, setModalDateOpen]   = useState(false);
  const [modalPartyOpen, setModalPartyOpen] = useState(false);

  const menuRef    = useOutsideClick<HTMLDivElement>(() => setOpenMenu(null));
  const dateRef    = useOutsideClick<HTMLDivElement>(() => setDateOpen(false));
  const reportsRef = useOutsideClick<HTMLDivElement>(() => setReportsOpen(false));
  const bulkRef    = useOutsideClick<HTMLDivElement>(() => setBulkOpen(false));

  const totalSales   = invoices.reduce((s, i) => s + i.amount, 0);
  const paidAmt      = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const unpaidAmt    = invoices.reduce((s, i) => s + i.unpaid, 0);
  const cancelledAmt = invoices.filter(i => i.status === "Cancelled").reduce((s, i) => s + i.amount, 0);

  // Date-range filter for main table (from top toolbar dropdown)
  const filterByDateRange = (inv: Invoice[], range: string): Invoice[] => {
    const today = new Date("2026-02-28");
    const invDate = (inv: Invoice) => {
      const [d, m, y] = inv.date.split("-").map(Number);
      return new Date(y, m - 1, d);
    };
    if (range === "Today") return inv.filter(i => invDate(i).toDateString() === today.toDateString());
    if (range === "Yesterday") { const y = new Date(today); y.setDate(y.getDate()-1); return inv.filter(i => invDate(i).toDateString() === y.toDateString()); }
    if (range === "This Week") { const mon = new Date(today); mon.setDate(today.getDate() - today.getDay() + 1); return inv.filter(i => invDate(i) >= mon && invDate(i) <= today); }
    if (range === "Last 7 Days") { const s = new Date(today); s.setDate(s.getDate()-6); return inv.filter(i => invDate(i) >= s); }
    if (range === "This Month") return inv.filter(i => invDate(i).getMonth() === today.getMonth() && invDate(i).getFullYear() === today.getFullYear());
    if (range === "Last 30 Days") { const s = new Date(today); s.setDate(s.getDate()-29); return inv.filter(i => invDate(i) >= s); }
    if (range === "Last 365 Days") { const s = new Date(today); s.setDate(s.getDate()-364); return inv.filter(i => invDate(i) >= s); }
    return inv; // Default: show all
  };

  // Filter table rows: status card + date range
  const dateFiltered   = filterByDateRange(invoices, selectedDate);
  const filteredInvoices = statusFilter === null
    ? dateFiltered
    : statusFilter === "Unpaid"
      ? dateFiltered.filter(i => i.status === "Unpaid" || i.status === "Partially Paid")
      : dateFiltered.filter(i => i.status === statusFilter);

  // Modal: filter invoices for selected date range & party
  const modalFiltered = filterByDateRange(invoices, modalDateRange)
    .filter(i => modalParty === "All Parties" || i.party === modalParty);
  const uniqueParties = ["All Parties", ...Array.from(new Set(invoices.map(i => i.party)))];

  const handleCardClick = (label: string) => {
    if (label === "Total Sales") { setStatusFilter(null); return; }
    const map: Record<string, string> = { Paid: "Paid", Unpaid: "Unpaid", Cancelled: "Cancelled" };
    const key = map[label];
    if (key) setStatusFilter(sf => sf === key ? null : key);
  };

  useEffect(() => {
    if (view !== "create") return;
    const inp = document.querySelector('input[value="ME/QO/26-27/"]') as HTMLInputElement;
    if (inp) { inp.value = "ME/SI/26-27/"; inp.dispatchEvent(new Event("input", { bubbles: true })); }
    document.querySelectorAll("label").forEach(l => {
      if (l.textContent?.includes("Quotation Date")) l.textContent = "Sales Invoice Date";
    });
  }, [view]);

  const handleRowAction = (action: string, id: number) => {
    setOpenMenu(null);
    if (action === "Delete") setInvoices(p => p.filter(i => i.id !== id));
    if (action === "Cancel Invoice") setInvoices(p => p.map(i => i.id === id ? { ...i, status: "Cancelled" as const } : i));
  };

  const dropdownStyle: React.CSSProperties = {
    position: "absolute", background: "#fff", border: "1px solid #e2e8f0",
    borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", zIndex: 100, overflow: "hidden",
  };

  // ── Report views ─────────────────────────────────────────────────────────
  if (view === "sales-summary") return <SalesSummaryPage onBack={() => setView("landing")} invoices={invoices} />;
  if (view === "gstr1")         return <GSTR1Page        onBack={() => setView("landing")} invoices={invoices} />;
  if (view === "daybook")       return <DayBookPage      onBack={() => setView("landing")} />;
  if (view === "billwise")      return <BillWiseProfitPage onBack={() => setView("landing")} />;

  // ── Create view ───────────────────────────────────────────────────────────
  if (view === "create") return (
    <>
      <Navbar
        title="Create Sales Invoice" showBackButton={true} backPath="/dashboard" showSettings={true}
        primaryAction={{ label: "Save", onClick: () => setView("landing") }}
        secondaryAction={{ label: "Save & New", onClick: () => console.log("Save & New") }}
      />
      <BillForm />
    </>
  );

  // ── Landing view ──────────────────────────────────────────────────────────
  const cards = [
    { label: "Total Sales", value: formatINR(totalSales), Icon: TrendingUp, iconColor: "#4f46e5", activeColor: "#4f46e5", activeBg: "#eef2ff", activeBorder: "#c7d2fe", key: null as string | null },
    { label: "Paid",        value: formatINR(paidAmt),    Icon: CheckCircle, iconColor: "#16a34a", activeColor: "#16a34a", activeBg: "#dcfce7", activeBorder: "#86efac", key: "Paid" },
    { label: "Unpaid",      value: formatINR(unpaidAmt),  Icon: AlertCircle, iconColor: "#dc2626", activeColor: "#dc2626", activeBg: "#fee2e2", activeBorder: "#fca5a5", key: "Unpaid" },
    { label: "Cancelled",   value: cancelledAmt > 0 ? formatINR(cancelledAmt) : "₹ —", Icon: Ban, iconColor: "#6b7280", activeColor: "#6b7280", activeBg: "#f3f4f6", activeBorder: "#d1d5db", key: "Cancelled" },
  ];

  return (
    <div
      style={{ flex: 1, background: "#f8fafc", padding: 28, display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans', sans-serif" }}
      onClick={() => { setOpenMenu(null); setDateOpen(false); setReportsOpen(false); setBulkOpen(false); }}
    >
      {/* ── Bulk Download Modal ── */}
      {bulkModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => { setBulkModalOpen(false); setModalDateOpen(false); setModalPartyOpen(false); }}
        >
          <div style={{ background: "#fff", borderRadius: 14, width: 500, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "visible" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Invoice Bulk Download</span>
              <button onClick={() => setBulkModalOpen(false)} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Date Range + Party Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {/* Select Date Range */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Select Date Range</label>
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={e => { e.stopPropagation(); setModalDateOpen(o => !o); setModalPartyOpen(false); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", fontSize: 13, color: "#374151", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Calendar size={13} color="#64748b" /> {modalDateRange}
                      </div>
                      <ChevronDown size={13} />
                    </button>
                    {modalDateOpen && (
                      <div style={{ ...dropdownStyle, top: "calc(100% + 4px)", left: 0, right: 0, maxHeight: 260, overflowY: "auto", zIndex: 300 }}>
                        {DATE_FILTERS.map(f => (
                          <div key={f}
                            onClick={e => { e.stopPropagation(); setModalDateRange(f); setModalDateOpen(false); }}
                            style={{ padding: "9px 14px", fontSize: 13, cursor: "pointer", background: modalDateRange === f ? "#f0f4ff" : "#fff", color: modalDateRange === f ? "#4f46e5" : "#1e293b" }}
                            onMouseEnter={e => { if (modalDateRange !== f) e.currentTarget.style.background = "#f8fafc"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = modalDateRange === f ? "#f0f4ff" : "#fff"; }}
                          >{f}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Select Party */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Select Party (Optional)</label>
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={e => { e.stopPropagation(); setModalPartyOpen(o => !o); setModalDateOpen(false); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", fontSize: 13, color: "#374151", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      {modalParty} <ChevronDown size={13} />
                    </button>
                    {modalPartyOpen && (
                      <div style={{ ...dropdownStyle, top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 300 }}>
                        {uniqueParties.map(p => (
                          <div key={p}
                            onClick={e => { e.stopPropagation(); setModalParty(p); setModalPartyOpen(false); }}
                            style={{ padding: "9px 14px", fontSize: 13, cursor: "pointer", background: modalParty === p ? "#f0f4ff" : "#fff", color: modalParty === p ? "#4f46e5" : "#1e293b" }}
                            onMouseEnter={e => { if (modalParty !== p) e.currentTarget.style.background = "#f8fafc"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = modalParty === p ? "#f0f4ff" : "#fff"; }}
                          >{p}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Email field */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>Email</label>
                <input
                  type="email"
                  value={modalEmail}
                  onChange={e => setModalEmail(e.target.value)}
                  placeholder="Enter Your Email"
                  style={{ padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#374151", fontFamily: "inherit", outline: "none" }}
                  onFocus={e => (e.target.style.borderColor = "#4f46e5")}
                  onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>

              {/* Send to CA toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  onClick={() => setSendToCa(v => !v)}
                  style={{ width: 18, height: 18, borderRadius: 4, border: sendToCa ? "none" : "2px solid #cbd5e1", background: sendToCa ? "#4f46e5" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}
                >
                  {sendToCa && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{ fontSize: 13, color: "#374151", fontWeight: 500, cursor: "pointer" }} onClick={() => setSendToCa(v => !v)}>
                  Send to CA
                </span>
              </div>

              {/* CA Email — only if sendToCa is true */}
              {sendToCa && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <input
                    type="email"
                    value={modalCaEmail}
                    onChange={e => setModalCaEmail(e.target.value)}
                    placeholder="Enter your CA's Email"
                    style={{ padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#374151", fontFamily: "inherit", outline: "none", transition: "border-color 0.15s" }}
                    onFocus={e => (e.target.style.borderColor = "#4f46e5")}
                    onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>
              )}

              {/* Filtered invoices preview in modal */}
              <div style={{ background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "auto", maxHeight: 180 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#f1f5f9" }}>
                      {["Date","Invoice No","Party","Amount","Status"].map(h => (
                        <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modalFiltered.length === 0 ? (
                      <tr><td colSpan={5} style={{ padding: 16, textAlign: "center", color: "#94a3b8" }}>No invoices for selected range</td></tr>
                    ) : modalFiltered.map((inv, i) => (
                      <tr key={inv.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafbff" }}>
                        <td style={{ padding: "7px 10px", color: "#475569" }}>{inv.date}</td>
                        <td style={{ padding: "7px 10px", color: "#4f46e5", fontWeight: 600 }}>{inv.invoiceNumber}</td>
                        <td style={{ padding: "7px 10px" }}>{inv.party}</td>
                        <td style={{ padding: "7px 10px", fontWeight: 600 }}>₹{inv.amount.toLocaleString("en-IN")}</td>
                        <td style={{ padding: "7px 10px" }}>
                          <span style={{ padding: "2px 7px", borderRadius: 10, fontSize: 10, fontWeight: 700, background: statusBg(inv.status), color: statusColor(inv.status) }}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderTop: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: 13, color: "#64748b" }}>
                <strong style={{ color: "#1e293b" }}>{modalFiltered.length}</strong> Invoice(s) Selected
              </span>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setBulkModalOpen(false)}
                  style={{ padding: "8px 20px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, color: "#475569", fontFamily: "inherit" }}
                >
                  Cancel
                </button>
                <button
                  style={{ padding: "8px 20px", border: "none", borderRadius: 8, background: "#c7d2fe", cursor: "pointer", fontSize: 13, color: "#6366f1", fontWeight: 700, fontFamily: "inherit" }}
                >
                  Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", margin: 0 }}>Sales Invoices</h1>
          {statusFilter && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 20, padding: "3px 10px 3px 12px", fontSize: 12, color: "#4f46e5", fontWeight: 600 }}>
              {statusFilter}
              <button onClick={() => setStatusFilter(null)} style={{ border: "none", background: "none", cursor: "pointer", display: "flex", padding: 0, color: "#4f46e5" }}>
                <X size={13} />
              </button>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div ref={reportsRef} style={{ position: "relative" }}>
            <button
              onClick={e => { e.stopPropagation(); setReportsOpen(o => !o); setDateOpen(false); setBulkOpen(false); }}
              style={{ padding: "8px 14px", border: "1px solid #e2e8f0", borderRadius: 8, background: reportsOpen ? "#f0f4ff" : "#fff", cursor: "pointer", fontSize: 13, color: "#475569", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}
            >
              <BarChart2 size={15} color="#4f46e5" /> Reports <ChevronDown size={13} />
            </button>
            {reportsOpen && (
              <div style={{ ...dropdownStyle, top: "calc(100% + 6px)", right: 0, minWidth: 180 }}>
                {([["Sales Summary","sales-summary"],["GSTR-1 (Sales)","gstr1"],["DayBook","daybook"],["Bill Wise Profit","billwise"]] as [string, ViewType][]).map(([label, key]) => (
                  <div key={key}
                    onClick={e => { e.stopPropagation(); setView(key); setReportsOpen(false); }}
                    style={{ padding: "10px 16px", fontSize: 13, color: "#1e293b", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                  >{label}</div>
                ))}
              </div>
            )}
          </div>
          <button style={{ padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer", display: "flex" }}>
            <Settings size={16} color="#64748b" />
          </button>
          <button style={{ padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer", display: "flex" }}>
            <AlignJustify size={16} color="#64748b" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {cards.map(card => {
          const isActive = statusFilter === card.key || (card.key === null && statusFilter === null);
          return (
            <div key={card.label}
              onClick={e => { e.stopPropagation(); handleCardClick(card.label); }}
              style={{ background: isActive ? card.activeBg : "#fff", border: isActive ? `2px solid ${card.activeBorder}` : "1px solid #e2e8f0", borderRadius: 12, padding: "16px 20px", cursor: "pointer", transition: "all 0.15s", boxShadow: isActive ? `0 4px 14px ${card.activeBorder}55` : "none" }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#f8fafc"; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "#fff"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <card.Icon size={16} color={isActive ? card.activeColor : card.iconColor} />
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{card.label}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: isActive ? card.activeColor : "#1e293b" }}>{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 12px", background: "#fff" }}>
            <Search size={15} color="#94a3b8" />
          </div>
          <div ref={dateRef} style={{ position: "relative" }}>
            <button
              onClick={e => { e.stopPropagation(); setDateOpen(o => !o); setReportsOpen(false); setBulkOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 14px", background: dateOpen ? "#f0f4ff" : "#fff", fontSize: 13, color: "#475569", cursor: "pointer", fontFamily: "inherit" }}
            >
              <Calendar size={13} color="#64748b" /> {selectedDate} <ChevronDown size={13} />
            </button>
            {dateOpen && (
              <div style={{ ...dropdownStyle, top: "calc(100% + 6px)", left: 0, minWidth: 240, maxHeight: 320, overflowY: "auto" }}>
                {DATE_FILTERS.map(f => (
                  <div key={f}
                    onClick={e => { e.stopPropagation(); setSelectedDate(f); setDateOpen(false); }}
                    style={{ padding: "10px 16px", fontSize: 13, cursor: "pointer", background: selectedDate === f ? "#f0f4ff" : "#fff", color: selectedDate === f ? "#4f46e5" : "#1e293b" }}
                    onMouseEnter={e => { if (selectedDate !== f) e.currentTarget.style.background = "#f8fafc"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = selectedDate === f ? "#f0f4ff" : "#fff"; }}
                  >{f}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {/* Bulk Actions dropdown */}
          <div ref={bulkRef} style={{ position: "relative" }}>
            <button
              onClick={e => { e.stopPropagation(); setBulkOpen(o => !o); setReportsOpen(false); setDateOpen(false); }}
              style={{ padding: "9px 16px", border: "1px solid #e2e8f0", borderRadius: 8, background: bulkOpen ? "#f0f4ff" : "#fff", cursor: "pointer", fontSize: 13, color: "#475569", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}
            >
              <Zap size={14} color="#64748b" /> Bulk Actions <ChevronDown size={13} />
            </button>
            {bulkOpen && (
              <div style={{ ...dropdownStyle, top: "calc(100% + 6px)", left: 0, minWidth: 180 }}>
                <div
                  onClick={e => { e.stopPropagation(); setBulkOpen(false); setBulkModalOpen(true); }}
                  style={{ padding: "10px 16px", fontSize: 13, color: "#1e293b", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                >
                  <Download size={14} color="#64748b" /> Bulk Download
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setView("create")}
            style={{ padding: "9px 18px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit", boxShadow: "0 4px 14px rgba(79,70,229,.35)", display: "flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={15} /> Create Sales Invoice
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "visible" }}>
        {statusFilter && (
          <div style={{ padding: "10px 16px", borderBottom: "1px solid #f1f5f9", fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
            Showing <strong style={{ color: "#1e293b" }}>{filteredInvoices.length}</strong> invoice{filteredInvoices.length !== 1 ? "s" : ""} for
            <span style={{ color: statusFilter === "Paid" ? "#16a34a" : statusFilter === "Unpaid" ? "#dc2626" : "#6b7280", fontWeight: 700 }}>
              {statusFilter === "Unpaid" ? "Unpaid / Partially Paid" : statusFilter}
            </span>
            <button onClick={() => setStatusFilter(null)} style={{ marginLeft: 4, border: "none", background: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}>
              <X size={13} />
            </button>
          </div>
        )}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
              <th style={{ width: 36, padding: "12px 14px" }}><input type="checkbox" /></th>
              {["Date ⇅","Invoice Number","Party Name","Due In","Amount ⇅","Status",""].map(h => (
                <th key={h} style={{ padding: "12px 14px", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
                  No invoices found for <strong>{statusFilter || selectedDate}</strong>.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv, i) => (
                <tr key={inv.id} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafbff" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0f4ff")}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafbff")}
                >
                  <td style={{ padding: "12px 14px" }}><input type="checkbox" /></td>
                  <td style={{ padding: "12px 14px", color: "#475569" }}>{inv.date}</td>
                  <td style={{ padding: "12px 14px", color: "#4f46e5", fontWeight: 600 }}>{inv.invoiceNumber}</td>
                  <td style={{ padding: "12px 14px", fontWeight: 500 }}>{inv.party}</td>
                  <td style={{ padding: "12px 14px", color: "#64748b" }}>{inv.dueIn}</td>
                  <td style={{ padding: "12px 14px", fontWeight: 600 }}>
                    {formatINR(inv.amount)}
                    {inv.unpaid > 0 && <div style={{ fontSize: 11, color: "#dc2626", fontWeight: 400 }}>(₹{inv.unpaid.toLocaleString("en-IN")} unpaid)</div>}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ background: statusBg(inv.status), color: statusColor(inv.status), padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", position: "relative" }}>
                    <button
                      onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === inv.id ? null : inv.id); }}
                      style={{ border: "none", background: "none", cursor: "pointer", padding: "4px 6px", borderRadius: 6, display: "flex", color: "#94a3b8" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f1f5f9")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openMenu === inv.id && (
                      <div ref={menuRef} style={{ ...dropdownStyle, top: "100%", right: 0, minWidth: 200 }} onClick={e => e.stopPropagation()}>
                        {ROW_ACTIONS.map(action => (
                          <div key={action.label}
                            onClick={() => handleRowAction(action.label, inv.id)}
                            style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: action.danger ? "#dc2626" : "#1e293b", borderTop: action.danger ? "1px solid #f1f5f9" : "none" }}
                            onMouseEnter={e => (e.currentTarget.style.background = action.danger ? "#fef2f2" : "#f8fafc")}
                            onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                          >
                            <action.icon size={14} color={action.danger ? "#dc2626" : "#64748b"} />
                            {action.label}
                            {action.badge && <span style={{ marginLeft: "auto", background: "#4f46e5", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4 }}>{action.badge}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}