import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Reports.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterTag = "Party" | "Category" | "Payment Collection" | "Item" | "Invoice Details" | "Summary";

interface ReportItem {
  name: string;
  path: string;
  tags: FilterTag[];
  defaultFav?: boolean;
}

// ─── Report Data ──────────────────────────────────────────────────────────────

const FAVOURITE_REPORTS: ReportItem[] = [
  { name: "Balance Sheet",       path: "/reports/balance-sheet",        tags: [],                         defaultFav: true },
  { name: "GSTR-1 (Sales)",      path: "/reports/gstr1-sales",          tags: [],                         defaultFav: true },
  { name: "Profit And Loss Report", path: "/reports/profit-loss",       tags: ["Summary"],                defaultFav: true },
];

const GST_REPORTS: ReportItem[] = [
  { name: "GSTR-2 (Purchase)",       path: "/reports/gstr2-purchase",       tags: [] },
  { name: "GSTR-3b",                 path: "/reports/gstr3b",               tags: [] },
  { name: "GST Purchase (With HSN)", path: "/reports/gst-purchase-hsn",     tags: [] },
  { name: "GST Sales (With HSN)",    path: "/reports/gst-sales-hsn",        tags: [] },
  { name: "HSN Wise Sales Summary",  path: "/reports/hsn-sales-summary",    tags: [] },
  { name: "TDS Payable",             path: "/reports/tds-payable",          tags: [] },
  { name: "TDS Receivable",          path: "/reports/tds-receivable",       tags: [] },
  { name: "TCS Payable",             path: "/reports/tcs-payable",          tags: [] },
  { name: "TCS Receivable",          path: "/reports/tcs-receivable",       tags: [] },
];

const TRANSACTION_REPORTS: ReportItem[] = [
  { name: "Audit Trail",                        path: "/reports/audit-trail",              tags: [] },
  { name: "Bill Wise Profit",                   path: "/reports/bill-wise-profit",         tags: ["Invoice Details"] },
  { name: "Cash and Bank Report (All Payments)", path: "/reports/cash-bank-report",        tags: ["Invoice Details"] },
  { name: "Daybook",                            path: "/reports/daybook",                  tags: ["Invoice Details"] },
  { name: "Expense Category Report",            path: "/reports/expense-category",         tags: ["Category"] },
  { name: "Expense Transaction Report",         path: "/reports/expense-transaction",      tags: ["Category", "Invoice Details"] },
  { name: "Purchase Summary",                   path: "/reports/purchase-summary",         tags: ["Summary"] },
  { name: "Sales Summary",                      path: "/reports/sales-summary",            tags: ["Summary", "Invoice Details"] },
];

const ITEM_REPORTS: ReportItem[] = [
  { name: "Item Report By Party",            path: "/reports/item-report-party",         tags: ["Party", "Item"] },
  { name: "Item Sales and Purchase Summary", path: "/reports/item-sales-purchase",       tags: ["Item", "Category", "Summary"] },
  { name: "Low Stock Summary",               path: "/reports/low-stock-summary",         tags: ["Item"] },
  { name: "Rate List",                       path: "/reports/rate-list",                 tags: ["Item"] },
  { name: "Stock Detail Report",             path: "/reports/stock-detail",              tags: ["Item", "Invoice Details"] },
  { name: "Stock Summary",                   path: "/reports/stock-summary",             tags: ["Item", "Summary"] },
  { name: "Stock Summary - Godown wise",     path: "/reports/stock-summary-godown",      tags: ["Item", "Summary"] },
];

const PARTY_REPORTS: ReportItem[] = [
  { name: "Receivable Ageing Report",    path: "/admin/receivable-ageing",        tags: ["Party", "Payment Collection"] },
  { name: "Party Report By Item",        path: "/reports/party-report-item",        tags: ["Party", "Item"] },
  { name: "Party Statement (Ledger)",    path: "/reports/party-statement",          tags: ["Party"] },
  { name: "Party Wise Outstanding",      path: "/reports/party-wise-outstanding",   tags: ["Party", "Category", "Payment Collection", "Summary"] },
  { name: "Sales Summary - Category Wise", path: "/reports/sales-summary-category", tags: ["Party", "Category", "Summary"] },
];

const ALL_REPORTS = [
  ...FAVOURITE_REPORTS,
  ...GST_REPORTS,
  ...TRANSACTION_REPORTS,
  ...ITEM_REPORTS,
  ...PARTY_REPORTS,
];

const INITIAL_FAVOURITES = new Set(
  FAVOURITE_REPORTS.filter((r) => r.defaultFav).map((r) => r.name)
);

const COLLAPSED_LIMIT = 5;

// ─── Icons (SVG inline) ───────────────────────────────────────────────────────

const SparkleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);

const GSTIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 9h6M9 12h6M9 15h4" />
  </svg>
);

const TxnIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const ItemIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 8 12 12 15 15" />
  </svg>
);

const PartyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const CAIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
  </svg>
);

// ─── ReportRow ────────────────────────────────────────────────────────────────

interface ReportRowProps {
  report: ReportItem;
  isFav: boolean;
  onToggleFav: (name: string) => void;
  onClick: (path: string) => void;
}

const ReportRow: React.FC<ReportRowProps> = ({ report, isFav, onToggleFav, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`report-row ${hovered ? "report-row--hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(report.path)}
    >
      <span className="report-row__name">{report.name}</span>
      <button
        className={`report-row__star ${isFav ? "report-row__star--active" : ""} ${hovered || isFav ? "report-row__star--visible" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFav(report.name);
        }}
        title={isFav ? "Remove from favourites" : "Add to favourites"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={isFav ? "#f59e0b" : "none"}
          stroke={isFav ? "#f59e0b" : "#9ca3af"}
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </button>
    </div>
  );
};

// ─── SectionPanel ─────────────────────────────────────────────────────────────

interface SectionPanelProps {
  title: string;
  icon: React.ReactNode;
  reports: ReportItem[];
  favourites: Set<string>;
  onToggleFav: (name: string) => void;
  onNavigate: (path: string) => void;
  activeFilter: FilterTag | null;
}

const SectionPanel: React.FC<SectionPanelProps> = ({
  title,
  icon,
  reports,
  favourites,
  onToggleFav,
  onNavigate,
  activeFilter,
}) => {
  const [expanded, setExpanded] = useState(false);

  const filtered = activeFilter
    ? reports.filter((r) => r.tags.includes(activeFilter))
    : reports;

  const showToggle = filtered.length > COLLAPSED_LIMIT;
  const visible = expanded ? filtered : filtered.slice(0, COLLAPSED_LIMIT);

  return (
    <div className="section-panel">
      <div className="section-panel__header">
        <span className="section-panel__icon">{icon}</span>
        <span className="section-panel__title">{title}</span>
      </div>
      <div className="section-panel__body">
        {filtered.length === 0 ? (
          <span className="section-panel__empty">No Reports Found</span>
        ) : (
          <>
            {visible.map((r) => (
              <ReportRow
                key={r.name}
                report={r}
                isFav={favourites.has(r.name)}
                onToggleFav={onToggleFav}
                onClick={onNavigate}
              />
            ))}
            {showToggle && (
              <button
                className="section-panel__toggle"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "See less" : `See more`}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                >
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─── Main Reports Component ───────────────────────────────────────────────────

const FILTER_TAGS: FilterTag[] = ["Party", "Category", "Payment Collection", "Item", "Invoice Details", "Summary"];

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterTag | null>(null);
  const FAV_KEY = "report_favourites";

const getStoredFavourites = (): Set<string> => {
  const stored = localStorage.getItem(FAV_KEY);

  if (stored) {
    const parsed: string[] = JSON.parse(stored);
    return new Set<string>(parsed);
  }

  return new Set<string>(INITIAL_FAVOURITES);
};

const [favourites, setFavourites] = useState<Set<string>>(getStoredFavourites);

const toggleFav = (name: string) => {
  setFavourites((prev) => {
    const next = new Set<string>(prev);

    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }

    localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(next)));

    return next;
  });
};

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const toggleFilter = (tag: FilterTag) => {
    setActiveFilter((prev) => (prev === tag ? null : tag));
  };

  // Build favourite report items from current favourites set
  const favReportItems: ReportItem[] = ALL_REPORTS.filter((r) => favourites.has(r.name));
  const filteredFavs = activeFilter
    ? favReportItems.filter((r) => r.tags.includes(activeFilter) || !activeFilter)
    : favReportItems;

  // For favourites section when a filter is active, show only matching
  const visibleFavs = activeFilter
    ? favReportItems.filter((r) => r.tags.includes(activeFilter))
    : favReportItems;

  return (
    <div className="reports-page">
      {/* ── Header ── */}
      <div className="reports-header">
        <h1 className="reports-title">Reports</h1>
        <button 
          className="reports-ca-btn"
          onClick={() => navigate("/admin/settings/ca-reports")}
        >
          <CAIcon />
          CA Reports Sharing
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="reports-filter-bar">
        <span className="reports-filter-label">Filter By</span>
        {FILTER_TAGS.map((tag) => (
          <button
            key={tag}
            className={`reports-filter-chip ${activeFilter === tag ? "reports-filter-chip--active" : ""}`}
            onClick={() => toggleFilter(tag)}
          >
            {tag}
            {activeFilter === tag && (
              <span className="reports-filter-chip__close">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Top Row: Favourite | GST | Transaction ── */}
      <div className="reports-grid reports-grid--top">
        {/* Favourite */}
        <div className="section-panel">
          <div className="section-panel__header">
            <span className="section-panel__icon section-panel__icon--sparkle">
              <SparkleIcon />
            </span>
            <span className="section-panel__title">Favourite</span>
          </div>
          <div className="section-panel__body">
            {visibleFavs.length === 0 ? (
              <span className="section-panel__empty">No Reports Found</span>
            ) : (
              visibleFavs.map((r) => (
                <ReportRow
                  key={r.name}
                  report={r}
                  isFav={true}
                  onToggleFav={toggleFav}
                  onClick={handleNavigate}
                />
              ))
            )}
          </div>
        </div>

        {/* GST */}
        <SectionPanel
          title="GST"
          icon={<GSTIcon />}
          reports={GST_REPORTS}
          favourites={favourites}
          onToggleFav={toggleFav}
          onNavigate={handleNavigate}
          activeFilter={activeFilter}
        />

        {/* Transaction */}
        <SectionPanel
          title="Transaction"
          icon={<TxnIcon />}
          reports={TRANSACTION_REPORTS}
          favourites={favourites}
          onToggleFav={toggleFav}
          onNavigate={handleNavigate}
          activeFilter={activeFilter}
        />
      </div>

      {/* ── Bottom Row: Item | Party | (empty) ── */}
      <div className="reports-grid reports-grid--bottom">
        {/* Item */}
        <SectionPanel
          title="Item"
          icon={<ItemIcon />}
          reports={ITEM_REPORTS}
          favourites={favourites}
          onToggleFav={toggleFav}
          onNavigate={handleNavigate}
          activeFilter={activeFilter}
        />

        {/* Party */}
        <SectionPanel
          title="Party"
          icon={<PartyIcon />}
          reports={PARTY_REPORTS}
          favourites={favourites}
          onToggleFav={toggleFav}
          onNavigate={handleNavigate}
          activeFilter={activeFilter}
        />

        {/* Empty column for grid alignment */}
        <div />
      </div>
    </div>
  );
};

export default Reports;