import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DeliveryChallan, calcTotal, saveChallan, deleteChallan,
  getChallanById, getChallans, makeBlankChallan, getNextChallanNo,
  fmtDisplayDate,
} from "./Deliverychallantype";
import "./Deliverychallanviewmodel.css";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function fmtDate(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2,"0")} ${MONTHS[d.getMonth()].slice(0,3)} ${d.getFullYear()}`;
}

function numberToWords(n: number): string {
  if (n === 0) return "Zero";
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  function toWords(num: number): string {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? " " + ones[num%10] : "");
    if (num < 1000) return ones[Math.floor(num/100)] + " Hundred" + (num%100 ? " " + toWords(num%100) : "");
    if (num < 100000) return toWords(Math.floor(num/1000)) + " Thousand" + (num%1000 ? " " + toWords(num%1000) : "");
    if (num < 10000000) return toWords(Math.floor(num/100000)) + " Lakh" + (num%100000 ? " " + toWords(num%100000) : "");
    return toWords(Math.floor(num/10000000)) + " Crore" + (num%10000000 ? " " + toWords(num%10000000) : "");
  }
  const intPart = Math.floor(n);
  const decPart = Math.round((n - intPart) * 100);
  let words = toWords(intPart) + " Rupees";
  if (decPart > 0) words += " and " + toWords(decPart) + " Paise";
  return words + " Only";
}

function ConfirmDeleteModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="dcv-overlay" onClick={onCancel}>
      <div className="dcv-confirm-modal" onClick={e => e.stopPropagation()}>
        <h3>Delete Delivery Challan?</h3>
        <p>This action cannot be undone.</p>
        <div className="dcv-confirm-btns">
          <button className="dcv-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="dcv-btn-delete" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function DeliveryChallanViewModel() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [challan, setChallan] = useState<DeliveryChallan | null>(null);
  const [dotsOpen, setDotsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const dotsRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      const c = getChallanById(id);
      setChallan(c);
    }
  }, [id]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (dotsRef.current && !dotsRef.current.contains(e.target as Node)) setDotsOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (!challan) {
    return (
      <div className="dcv-page" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}>
        <div style={{textAlign:"center",color:"#9ca3af"}}>
          <div style={{fontSize:18,marginBottom:8}}>Delivery Challan not found</div>
          <button className="dcv-convert-btn" onClick={() => navigate("/cashier/delivery-challan")}>← Back to List</button>
        </div>
      </div>
    );
  }

  const total = calcTotal(challan);
  const items = challan.billItems || [];

  // HSN summary
  const hsnMap: Record<string, { taxableVal: number; igst: number; cgst: number; sgst: number }> = {};
  items.forEach(item => {
    const hsn = item.hsn || "-";
    const base = item.qty * item.price - (item.qty * item.price * item.discountPct / 100) - item.discountAmt;
    const tax = base * item.taxRate / 100;
    if (!hsnMap[hsn]) hsnMap[hsn] = { taxableVal: 0, igst: 0, cgst: 0, sgst: 0 };
    hsnMap[hsn].taxableVal += base;
    hsnMap[hsn].igst += tax;
    hsnMap[hsn].cgst += tax / 2;
    hsnMap[hsn].sgst += tax / 2;
  });
  const hsnRows = Object.entries(hsnMap);

  const statusClass = challan.status === "Open" ? "dcv-status--open" : challan.status === "Closed" ? "dcv-status--closed" : "dcv-status--open";

  const handleStatusChange = (status: DeliveryChallan["status"]) => {
    const updated = { ...challan, status };
    saveChallan(updated);
    setChallan(updated);
    setDotsOpen(false);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Delivery Challan #${challan.prefix}${challan.challanNo}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'DM Sans', Arial, sans-serif; font-size: 12px; color: #111827; }
      .paper { max-width: 720px; margin: 0 auto; padding: 24px; }
      h2 { text-align: center; font-size: 16px; letter-spacing: 1px; margin-bottom: 16px; }
      .hdr-grid { display: grid; grid-template-columns: 1fr auto; gap: 16px; margin-bottom: 12px; }
      .company-name { font-size: 14px; font-weight: 700; }
      .company-detail { font-size: 11px; color: #6b7280; line-height: 1.6; }
      .meta-right { text-align: right; font-size: 11px; }
      hr { border: none; border-top: 1px solid #e5e7eb; margin: 10px 0; }
      .billto { border: 1px solid #e5e7eb; border-radius: 4px; padding: 8px 12px; margin-bottom: 14px; }
      .billto-label { font-size: 10px; font-weight: 700; color: #9ca3af; margin-bottom: 3px; }
      .billto-name { font-size: 13px; font-weight: 700; }
      .billto-detail { font-size: 11px; color: #6b7280; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 8px; }
      th { padding: 7px 8px; background: #f3f4f6; border: 1px solid #e5e7eb; text-align: left; font-size: 10px; font-weight: 700; }
      td { padding: 7px 8px; border-bottom: 1px solid #f3f4f6; }
      .ta-r { text-align: right; }
      .ta-c { text-align: center; }
      .totals-table td { border: 1px solid #e5e7eb; }
      .total-row td { font-weight: 700; background: #f9fafb; }
      .words-box { border: 1px solid #e5e7eb; padding: 8px 12px; margin-top: 10px; font-size: 11px; }
      .words-label { font-weight: 700; font-size: 10px; margin-bottom: 3px; }
      .sig-row { display: flex; justify-content: flex-end; margin-top: 20px; }
      .sig-box { text-align: center; min-width: 140px; }
      .sig-line { border-bottom: 1.5px solid #374151; height: 36px; margin-bottom: 5px; }
      .sig-label { font-size: 10px; color: #6b7280; }
      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style></head><body><div class="paper">${printRef.current.innerHTML}</div></body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 300);
  };

  const handleConvertToInvoice = () => {
    const fromChallan = {
      challanNo: challan.challanNo,
      prefix: challan.prefix,
      party: challan.party,
      shipTo: challan.shipTo,
      billItems: challan.billItems,
      additionalCharges: challan.additionalCharges,
      discountType: challan.discountType,
      discountPct: challan.discountPct,
      discountAmt: challan.discountAmt,
      notes: challan.notes,
      termsConditions: challan.termsConditions,
      bankAccount: challan.bankAccount,
    };
    navigate("/cashier/sales-invoice", { state: { fromChallan } });
  };

  const handleDuplicate = () => {
    const all = getChallans();
    const nextNo = all.length === 0 ? 1 : Math.max(...all.map(c => c.challanNo)) + 1;
    const dupe: DeliveryChallan = { ...challan, id: `dc-${Date.now()}`, challanNo: nextNo, createdAt: new Date().toISOString() };
    saveChallan(dupe);
    setDotsOpen(false);
    navigate(`/cashier/delivery-challan-view/${dupe.id}`);
  };

  const handleDelete = () => {
    deleteChallan(challan.id);
    navigate("/cashier/delivery-challan");
  };

  return (
    <div className="dcv-page">
      {/* Top Bar */}
      <div className="dcv-topbar">
        <div className="dcv-topbar-left">
          <button className="dcv-back-btn" onClick={() => navigate("/cashier/delivery-challan")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="dcv-title">Delivery Challan #{challan.prefix}{challan.challanNo}</span>
          <span className={`dcv-status ${statusClass}`}>{challan.status}</span>
        </div>
        <div className="dcv-topbar-right">
          <button className="dcv-icon-btn" title="Keyboard Shortcuts">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/></svg>
          </button>
          <div className="dcv-menu-wrap" ref={dotsRef}>
            <button className="dcv-icon-btn" onClick={() => setDotsOpen(o => !o)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
            </button>
            {dotsOpen && (
              <div className="dcv-menu-drop">
                <button className="dcv-menu-item" onClick={() => { navigate(`/cashier/delivery-challan-edit/${challan.id}`); setDotsOpen(false); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit
                </button>
                <button className="dcv-menu-item" onClick={() => setDotsOpen(false)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></svg>
                  Edit History
                </button>
                <button className="dcv-menu-item" onClick={handleDuplicate}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  Duplicate
                </button>
                <button className="dcv-menu-item" onClick={() => handleStatusChange("Open")}>Mark as Open</button>
                <button className="dcv-menu-item" onClick={() => handleStatusChange("Closed")}>Mark as Closed</button>
                <button className="dcv-menu-item dcv-menu-item--delete" onClick={() => { setShowDeleteModal(true); setDotsOpen(false); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="dcv-actionbar">
        <div className="dcv-actionbar-left">
          <div className="dcv-action-group">
            <button className="dcv-action-btn" onClick={handlePrint}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download PDF
            </button>
            <button className="dcv-action-split"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg></button>
          </div>
          <div className="dcv-action-group">
            <button className="dcv-action-btn" onClick={handlePrint}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print PDF
            </button>
            <button className="dcv-action-split"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg></button>
          </div>
          <div className="dcv-action-group">
            <button className="dcv-action-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Share
            </button>
            <button className="dcv-action-split"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg></button>
          </div>
        </div>
        <button className="dcv-convert-btn" onClick={handleConvertToInvoice}>Convert to Invoice</button>
      </div>

      {/* Document Body */}
      <div className="dcv-body">
        <div className="dcv-paper">
          {/* Printable content */}
          <div ref={printRef}>
            <h2 className="dcv-paper-title">DELIVERY CHALLAN</h2>
            <div className="dcv-header-grid">
              <div>
                <div className="dcv-company-name">scratchweb.solutions</div>
                <div className="dcv-company-detail">
                  Your Company Address Here<br/>
                  State, Pincode<br/>
                  GSTIN: XXXXXXXXXXXXXXXXX
                </div>
              </div>
              <div className="dcv-challan-meta">
                <div className="dcv-meta-row2"><span>Challan No.:</span><strong>{challan.prefix}{challan.challanNo}</strong></div>
                <div className="dcv-meta-row2"><span>Date:</span><strong>{fmtDate(challan.challanDate)}</strong></div>
                {challan.eWayBillNo && <div className="dcv-meta-row2"><span>E-Way Bill:</span><strong>{challan.eWayBillNo}</strong></div>}
              </div>
            </div>
            <hr className="dcv-divider"/>

            {challan.party && (
              <div className="dcv-billto-box">
                <div className="dcv-billto-label">BILL TO</div>
                <div className="dcv-billto-name">{challan.party.name}</div>
                {challan.party.mobile && challan.party.mobile !== "-" && (
                  <div className="dcv-billto-detail">Phone: {challan.party.mobile}</div>
                )}
                {challan.party.billingAddress && <div className="dcv-billto-detail">{challan.party.billingAddress}</div>}
                {challan.party.gstin && <div className="dcv-billto-detail">GSTIN: {challan.party.gstin}</div>}
              </div>
            )}

            <table className="dcv-items-table">
              <thead>
                <tr>
                  <th style={{width:30}}>#</th>
                  <th>Item Name</th>
                  <th className="dcv-center">HSN/SAC</th>
                  <th className="dcv-center">Qty</th>
                  <th className="dcv-right">Rate (₹)</th>
                  <th className="dcv-right">Disc</th>
                  <th className="dcv-center">Tax</th>
                  <th className="dcv-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={8} style={{padding:"16px",textAlign:"center",color:"#9ca3af"}}>No items</td></tr>
                ) : items.map((item, idx) => {
                  const base = item.qty * item.price - (item.qty * item.price * item.discountPct / 100) - item.discountAmt;
                  const taxAmt = base * item.taxRate / 100;
                  return (
                    <tr key={item.rowId}>
                      <td className="dcv-center">{idx + 1}</td>
                      <td>{item.name}{item.description && <div style={{fontSize:11,color:"#6b7280"}}>{item.description}</div>}</td>
                      <td className="dcv-center">{item.hsn || "-"}</td>
                      <td className="dcv-center">{item.qty} {item.unit}</td>
                      <td className="dcv-right">{item.price.toLocaleString("en-IN")}</td>
                      <td className="dcv-right">{item.discountPct > 0 ? `${item.discountPct}%` : item.discountAmt > 0 ? `₹${item.discountAmt}` : "-"}</td>
                      <td className="dcv-center">{item.taxLabel !== "None" ? item.taxLabel : "-"}{item.taxRate > 0 && <div style={{fontSize:10,color:"#6b7280"}}>₹{taxAmt.toFixed(0)}</div>}</td>
                      <td className="dcv-right">{item.amount.toLocaleString("en-IN")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <table className="dcv-totals-table">
              <tbody>
                {challan.additionalCharges.map(c => (
                  <tr key={c.id}>
                    <td>{c.label || "Additional Charge"}</td>
                    <td className="dcv-right">₹ {(c.amount * (1 + (c.taxRate||0) / 100)).toFixed(0)}</td>
                  </tr>
                ))}
                {(challan.discountPct > 0 || challan.discountAmt > 0) && (
                  <tr>
                    <td>Discount</td>
                    <td className="dcv-right" style={{color:"#dc2626"}}>- ₹ {(items.reduce((s,i) => s + i.amount, 0) * challan.discountPct / 100 + challan.discountAmt).toFixed(0)}</td>
                  </tr>
                )}
                {challan.roundOffAmt !== 0 && (
                  <tr>
                    <td>Round Off</td>
                    <td className="dcv-right">{challan.roundOffAmt > 0 ? "+" : ""}₹ {challan.roundOffAmt.toFixed(2)}</td>
                  </tr>
                )}
                <tr style={{fontWeight:700,background:"#f9fafb"}}>
                  <td>Total Amount</td>
                  <td className="dcv-right">₹ {total.toLocaleString("en-IN")}</td>
                </tr>
              </tbody>
            </table>

            {hsnRows.length > 0 && (
              <table className="dcv-hsn-table">
                <thead>
                  <tr>
                    <th>HSN/SAC</th>
                    <th>Taxable Value</th>
                    <th>IGST</th>
                    <th>CGST</th>
                    <th>SGST</th>
                    <th>Total Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {hsnRows.map(([hsn, data]) => (
                    <tr key={hsn}>
                      <td>{hsn}</td>
                      <td>₹ {data.taxableVal.toFixed(0)}</td>
                      <td>₹ {data.igst.toFixed(0)}</td>
                      <td>₹ {data.cgst.toFixed(0)}</td>
                      <td>₹ {data.sgst.toFixed(0)}</td>
                      <td>₹ {data.igst.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="dcv-words-box">
              <div className="dcv-words-label">Amount in Words</div>
              <div>{numberToWords(Math.round(total))}</div>
            </div>

            {(challan.notes || challan.termsConditions) && (
              <div className="dcv-terms-box">
                {challan.notes && (
                  <>
                    <div className="dcv-terms-label">Notes</div>
                    <div style={{fontSize:12,color:"#374151",whiteSpace:"pre-line",marginBottom:8}}>{challan.notes}</div>
                  </>
                )}
                {challan.termsConditions && (
                  <>
                    <div className="dcv-terms-label">Terms &amp; Conditions</div>
                    <div style={{fontSize:12,color:"#374151",whiteSpace:"pre-line"}}>{challan.termsConditions}</div>
                  </>
                )}
              </div>
            )}

            <div className="dcv-sig-row">
              <div className="dcv-sig-box">
                <div className="dcv-sig-line"/>
                <div className="dcv-sig-label">Authorized Signatory<br/>for scratchweb.solutions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <ConfirmDeleteModal
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}