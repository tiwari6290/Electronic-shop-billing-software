import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  DeliveryChallan as DC, getChallans, deleteChallan,
  fmtDisplayDate, saveChallan,
} from "./Deliverychallantype";
import "./DeliveryChallan.css";

type StatusFilter = "Show All Challans" | "Show Open Challans" | "Show Closed Challans";
type DateFilter = "Today" | "Yesterday" | "This Week" | "Last Week" | "Last 7 Days" |
  "This Month" | "Previous Month" | "Current Fiscal Year" | "Previous Fiscal Year" | "Last 365 Days" | "Custom";

function todayRange(): [Date, Date] {
  const t = new Date(); t.setHours(0,0,0,0);
  const t2 = new Date(); t2.setHours(23,59,59,999);
  return [t, t2];
}

function getDateRange(f: DateFilter, custom?: [string,string]): [Date, Date] | null {
  const now = new Date();
  const d = (dt: Date) => { dt.setHours(0,0,0,0); return dt; };
  const e = (dt: Date) => { dt.setHours(23,59,59,999); return dt; };
  if (f === "Today") return [d(new Date()), e(new Date())];
  if (f === "Yesterday") { const y = new Date(now); y.setDate(y.getDate()-1); return [d(new Date(y)), e(new Date(y))]; }
  if (f === "This Week") { const s = new Date(now); s.setDate(now.getDate()-now.getDay()); return [d(s), e(new Date())]; }
  if (f === "Last Week") { const s = new Date(now); s.setDate(now.getDate()-now.getDay()-7); const e2 = new Date(s); e2.setDate(s.getDate()+6); return [d(s), e(e2)]; }
  if (f === "Last 7 Days") { const s = new Date(now); s.setDate(s.getDate()-6); return [d(s), e(new Date())]; }
  if (f === "This Month") { const s = new Date(now.getFullYear(), now.getMonth(), 1); return [s, e(new Date())]; }
  if (f === "Previous Month") { const s = new Date(now.getFullYear(), now.getMonth()-1, 1); const en = new Date(now.getFullYear(), now.getMonth(), 0); return [d(s), e(en)]; }
  if (f === "Current Fiscal Year") { const fy = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear()-1; return [d(new Date(fy,3,1)), e(new Date(fy+1,2,31))]; }
  if (f === "Previous Fiscal Year") { const fy = (now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear()-1)-1; return [d(new Date(fy,3,1)), e(new Date(fy+1,2,31))]; }
  if (f === "Last 365 Days") { const s = new Date(now); s.setDate(s.getDate()-364); return [d(s), e(new Date())]; }
  if (f === "Custom" && custom) return [d(new Date(custom[0])), e(new Date(custom[1]))];
  return null;
}

function fmtShortRange(f: DateFilter, custom?: [string,string]): string {
  const r = getDateRange(f, custom);
  if (!r) return "";
  const fmt = (dt: Date) => dt.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
  return `${fmt(r[0])} - ${fmt(r[1])}`;
}

interface ConfirmDeleteProps { onConfirm: () => void; onCancel: () => void; }
function ConfirmDelete({ onConfirm, onCancel }: ConfirmDeleteProps) {
  return (
    <div className="dc-overlay" onClick={onCancel}>
      <div className="dc-confirm-modal" onClick={e => e.stopPropagation()}>
        <h3>Delete Delivery Challan?</h3>
        <p>This action cannot be undone.</p>
        <div className="dc-confirm-btns">
          <button className="dc-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="dc-btn-delete" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

interface QuickSettingsProps { onClose: () => void; nextNo: number; }
function QuickSettings({ onClose, nextNo }: QuickSettingsProps) {
  const [prefixOn, setPrefixOn] = useState(true);
  const [prefix, setPrefix] = useState("");
  const [seqNo, setSeqNo] = useState(nextNo);
  const [showItemImage, setShowItemImage] = useState(true);
  const [priceHistory, setPriceHistory] = useState(true);
  const Toggle = ({ on, set }: { on: boolean; set: (v: boolean) => void }) => (
    <button className={`dc-toggle${on?" dc-toggle--on":""}`} onClick={() => set(!on)}>
      <span className="dc-toggle-th"/>
    </button>
  );
  return (
    <div className="dc-overlay" onClick={onClose}>
      <div className="dc-settings-modal" onClick={e => e.stopPropagation()}>
        <div className="dc-modal-hdr">
          <span>Quick Delivery Challan Settings</span>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="dc-settings-body">
          <div className="dc-settings-section">
            <div className="dc-settings-row">
              <div>
                <div className="dc-s-label">Delivery Challan Prefix &amp; Sequence Number</div>
                <div className="dc-s-sub">Add your custom prefix &amp; sequence for Delivery Challan Numbering</div>
              </div>
              <Toggle on={prefixOn} set={setPrefixOn}/>
            </div>
            {prefixOn && (
              <div className="dc-prefix-row">
                <div>
                  <label>Prefix</label>
                  <input value={prefix} onChange={e => setPrefix(e.target.value)} placeholder="Prefix" className="dc-si-inp"/>
                </div>
                <div>
                  <label>Sequence Number</label>
                  <input type="number" value={seqNo} onChange={e => setSeqNo(Number(e.target.value))} className="dc-si-inp"/>
                </div>
              </div>
            )}
            {prefixOn && <div className="dc-inv-preview">Delivery Challan Number: {seqNo}</div>}
          </div>
          <div className="dc-settings-section">
            <div className="dc-settings-row">
              <div>
                <div className="dc-s-label">Show Item Image on Invoice</div>
                <div className="dc-s-sub">This will apply to all vouchers except for Payment In and Payment Out</div>
              </div>
              <Toggle on={showItemImage} set={setShowItemImage}/>
            </div>
          </div>
          <div className="dc-settings-section">
            <div className="dc-settings-row">
              <div>
                <div className="dc-s-label">Price History <span className="dc-badge-new">New</span></div>
                <div className="dc-s-sub">Show last 5 sales / purchase prices of the item for the selected party in invoice</div>
              </div>
              <Toggle on={priceHistory} set={setPriceHistory}/>
            </div>
          </div>
        </div>
        <div className="dc-modal-ftr">
          <button className="dc-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="dc-btn-primary" onClick={onClose}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default function DeliveryChallanList() {
  const navigate = useNavigate();
  const [challans, setChallans] = useState<DC[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Show Open Challans");
  const [dateFilter, setDateFilter] = useState<DateFilter>("Last 365 Days");
  const [customRange, setCustomRange] = useState<[string,string]>(["",""] );
  const [showStatusDrop, setShowStatusDrop] = useState(false);
  const [showDateDrop, setShowDateDrop] = useState(false);
  const [showCustomCal, setShowCustomCal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [search, setSearch] = useState("");
  const statusRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChallans(getChallans());
    const handler = () => setChallans(getChallans());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setShowStatusDrop(false);
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) setShowDateDrop(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Filter
  const filtered = challans.filter(c => {
    if (statusFilter === "Show Open Challans" && c.status !== "Open") return false;
    if (statusFilter === "Show Closed Challans" && c.status !== "Closed") return false;
    const range = getDateRange(dateFilter, customRange);
    if (range) {
      const dt = new Date(c.challanDate);
      if (dt < range[0] || dt > range[1]) return false;
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      if (!c.party?.name.toLowerCase().includes(s) && !String(c.challanNo).includes(s)) return false;
    }
    return true;
  });

  function handleDelete(id: string) {
    deleteChallan(id);
    setChallans(getChallans());
    setDeleteId(null);
  }

  function handleDuplicate(c: DC) {
    const dupe: DC = {
      ...c,
      id: `dc-${Date.now()}`,
      challanNo: Math.max(...getChallans().map(x => x.challanNo), 0) + 1,
      createdAt: new Date().toISOString(),
    };
    saveChallan(dupe);
    setChallans(getChallans());
  }

  const dateOptions: DateFilter[] = ["Today","Yesterday","This Week","Last Week","Last 7 Days","This Month","Previous Month","Current Fiscal Year","Previous Fiscal Year","Last 365 Days","Custom"];
  const nextNo = challans.length > 0 ? Math.max(...challans.map(c => c.challanNo)) + 1 : 1;

  function calcTotal(c: DC): number {
    const sub = c.billItems.reduce((s, i) => s + i.price * i.qty, 0);
    const charges = c.additionalCharges.reduce((s, ch) => s + ch.amount, 0);
    const taxable = sub + charges;
    const disc = taxable * c.discountPct / 100 || c.discountAmt;
    return taxable - disc + c.roundOffAmt;
  }

  return (
    <div className="dc-page">
      {/* Header */}
      <div className="dc-header">
        <h2 className="dc-title">Delivery Challan</h2>
        <div className="dc-header-right">
          <button className="dc-icon-btn" onClick={() => setShowSettings(true)} title="Settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span className="dc-notif-dot"/>
          </button>
          <button className="dc-icon-btn" title="Keyboard">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/></svg>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="dc-toolbar">
        <div className="dc-toolbar-left">
          {/* Search */}
          <div className="dc-search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="dc-search-inp"/>
          </div>

          {/* Date filter */}
          <div ref={dateRef} className="dc-filter-wrap">
            <button className="dc-filter-btn" onClick={() => setShowDateDrop(!showDateDrop)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {dateFilter}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:13,height:13}}><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showDateDrop && (
              <div className="dc-drop">
                {dateOptions.map(opt => {
                  const rangeStr = ["Last 7 Days","Last 365 Days","Current Fiscal Year","Previous Fiscal Year"].includes(opt) ? fmtShortRange(opt) : "";
                  return (
                    <button key={opt} className={`dc-drop-item${dateFilter===opt?" dc-drop-item--active":""}`}
                      onClick={() => {
                        setDateFilter(opt);
                        setShowDateDrop(false);
                        if (opt === "Custom") setShowCustomCal(true);
                      }}>
                      <span>{opt}</span>
                      {rangeStr && <span className="dc-drop-range">{rangeStr}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Status filter */}
          <div ref={statusRef} className="dc-filter-wrap">
            <button className="dc-filter-btn" onClick={() => setShowStatusDrop(!showStatusDrop)}>
              {statusFilter}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:13,height:13}}><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showStatusDrop && (
              <div className="dc-drop">
                {(["Show All Challans","Show Open Challans","Show Closed Challans"] as StatusFilter[]).map(opt => (
                  <button key={opt} className={`dc-drop-item${statusFilter===opt?" dc-drop-item--active":""}`}
                    onClick={() => { setStatusFilter(opt); setShowStatusDrop(false); }}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button className="dc-create-btn" onClick={() => navigate("/cashier/delivery-challan-create")}>
          Create Delivery Challan
        </button>
      </div>

      {/* Custom Date Picker */}
      {showCustomCal && (
        <div className="dc-overlay" onClick={() => setShowCustomCal(false)}>
          <div className="dc-cal-modal" onClick={e => e.stopPropagation()}>
            <div className="dc-cal-hdr">
              <span>{customRange[0] ? fmtDisplayDate(customRange[0]) : "Start Date"}</span>
              <span>{customRange[1] ? fmtDisplayDate(customRange[1]) : "End Date"}</span>
            </div>
            <div className="dc-cal-inputs">
              <div>
                <label>From</label>
                <input type="date" value={customRange[0]} onChange={e => setCustomRange([e.target.value, customRange[1]])} className="dc-cal-inp"/>
              </div>
              <div>
                <label>To</label>
                <input type="date" value={customRange[1]} onChange={e => setCustomRange([customRange[0], e.target.value])} className="dc-cal-inp"/>
              </div>
            </div>
            <div className="dc-cal-ftr">
              <button className="dc-btn-cancel" onClick={() => setShowCustomCal(false)}>CANCEL</button>
              <button className="dc-btn-primary" onClick={() => setShowCustomCal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="dc-table-wrap">
        <table className="dc-table">
          <thead>
            <tr>
              <th>Date <span className="dc-sort-icon">⇅</span></th>
              <th>Delivery Challan Number</th>
              <th>Party Name</th>
              <th>Amount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="dc-empty">No delivery challans found</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} className="dc-row" onClick={() => navigate(`/cashier/delivery-challan-view/${c.id}`)}>
                <td>{fmtDisplayDate(c.challanDate)}</td>
                <td>{c.challanNo}</td>
                <td>{c.party?.name ?? "–"}</td>
                <td>₹ {calcTotal(c).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                <td>
                  <span className={`dc-status dc-status--${c.status.toLowerCase()}`}>{c.status}</span>
                </td>
                <td className="dc-menu-cell" onClick={e => e.stopPropagation()}>
                  <button className="dc-menu-btn" onClick={() => setActiveMenu(activeMenu === c.id ? null : c.id)}>
                    <svg viewBox="0 0 24 24" fill="currentColor" style={{width:16,height:16}}><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                  </button>
                  {activeMenu === c.id && (
                    <div className="dc-action-menu">
                      <button className="dc-action-item" onClick={() => { navigate(`/cashier/delivery-challan-edit/${c.id}`); setActiveMenu(null); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                      </button>
                      <button className="dc-action-item" onClick={() => setActiveMenu(null)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></svg>
                        Edit History
                      </button>
                      <button className="dc-action-item" onClick={() => { handleDuplicate(c); setActiveMenu(null); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        Duplicate
                      </button>
                      <button className="dc-action-item dc-action-item--delete" onClick={() => { setDeleteId(c.id); setActiveMenu(null); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteId && <ConfirmDelete onConfirm={() => handleDelete(deleteId)} onCancel={() => setDeleteId(null)}/>}
      {showSettings && <QuickSettings onClose={() => setShowSettings(false)} nextNo={nextNo}/>}
    </div>
  );
}