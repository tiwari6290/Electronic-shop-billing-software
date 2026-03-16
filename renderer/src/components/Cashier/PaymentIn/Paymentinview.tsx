import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./PaymentInView.css";
import { getPaymentInById, deletePaymentIn, type PaymentInRecord } from "../../../api/paymentInApi";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  if (!iso) return "–";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}
function fmtDateLong(iso: string) {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
}
function fmtCurr(n: number) { return "₹ " + n.toLocaleString("en-IN",{maximumFractionDigits:2}); }
function numToWords(num: number): string {
  const a=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const b=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  function h(n:number):string{if(n<20)return a[n];if(n<100)return b[Math.floor(n/10)]+(n%10?" "+a[n%10]:"");if(n<1000)return a[Math.floor(n/100)]+" Hundred"+(n%100?" "+h(n%100):"");if(n<100000)return h(Math.floor(n/1000))+" Thousand"+(n%1000?" "+h(n%1000):"");if(n<10000000)return h(Math.floor(n/100000))+" Lakh"+(n%100000?" "+h(n%100000):"");return h(Math.floor(n/10000000))+" Crore"+(n%10000000?" "+h(n%10000000):"");}
  return h(Math.floor(num))+" Rupees";
}

// ─── Receipt HTML builder ─────────────────────────────────────────────────────
function buildReceiptHTML(payment: PaymentInRecord): string {
  const business = { name: "Your Business", address: "Your Business Address" };
  const totalPayment = payment.allocations.reduce((s,r)=>s+r.amountReceived,0);
  const invoiceRows = payment.allocations.map((inv,i)=>`
    <tr>
      <td style="padding:8px 10px;text-align:center;border-bottom:1px solid #f3f4f6;">${i+1}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;">${inv.invoiceNo}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;">${inv.invoiceDate}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;">${inv.totalAmount.toFixed(2)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;">${inv.amountReceived.toFixed(2)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;">${inv.tds.toFixed(2)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;">${inv.discount.toFixed(2)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f3f4f6;">${inv.balanceAmount.toFixed(2)}</td>
    </tr>`).join("");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Receipt Voucher - ${payment.paymentNo}</title>
  <style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;font-size:13px;color:#222;background:#fff;}.page{padding:40px;max-width:800px;margin:0 auto;}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;}.biz-name{font-size:16px;font-weight:700;margin-bottom:4px;}.biz-addr{color:#6b7280;font-size:11px;max-width:280px;line-height:1.6;}.voucher-title{font-size:18px;font-weight:700;text-align:right;margin-bottom:14px;}.meta-table td{padding:3px 0 3px 16px;font-size:12px;}.meta-label{color:#6b7280;padding-left:0!important;}.party-name{font-size:15px;font-weight:700;margin-bottom:20px;}.tag{display:inline-block;border:1px solid #d1d5db;border-radius:4px;padding:3px 10px;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;}table.inv-table{width:100%;border-collapse:collapse;margin-bottom:24px;font-size:11px;}table.inv-table th{background:#f3f4f6;padding:8px 10px;text-align:left;border-bottom:1px solid #e5e7eb;font-weight:600;color:#374151;}table.inv-table .total-row td{background:#f9fafb;padding:8px 10px;font-weight:700;border-top:2px solid #e5e7eb;}.footer{display:flex;justify-content:space-between;align-items:flex-end;margin-top:8px;}.total-words{font-size:12px;}.total-amt{font-size:14px;font-weight:700;margin-bottom:4px;}.sig-box{text-align:right;}.sig-label{color:#6b7280;font-size:11px;margin-bottom:52px;}.sig-name{font-weight:700;font-size:13px;}.sig-line{border:1px solid #d1d5db;width:180px;height:64px;margin-top:8px;margin-left:auto;}.divider{border:none;border-top:1px solid #e5e7eb;margin:20px 0;}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}.page{padding:20px;}}</style>
  </head><body><div class="page">
    <div class="header"><div><div class="biz-name">${business.name}</div><div class="biz-addr">${business.address}</div></div>
    <div><div class="voucher-title">Receipt Voucher</div><table class="meta-table"><tr><td class="meta-label">Payment Number:</td><td>${payment.paymentNo}</td></tr><tr><td class="meta-label">Payment Date:</td><td>${fmtDate(payment.date)}</td></tr><tr><td class="meta-label">Payment Mode:</td><td>${payment.mode}</td></tr></table></div></div>
    <hr class="divider"/>
    <div class="tag">PAYMENT FROM</div><div class="party-name">${payment.partyName}</div><div class="tag" style="margin-bottom:14px;">RECEIPT FOR</div>
    <table class="inv-table"><thead><tr><th>#</th><th>INVOICE NO</th><th>DATE</th><th>INVOICE AMOUNT (₹)</th><th>PAYMENT (₹)</th><th>TDS (₹)</th><th>DISCOUNT (₹)</th><th>BALANCE (₹)</th></tr></thead>
    <tbody>${invoiceRows}<tr class="total-row"><td colspan="4" style="text-align:right;">TOTAL</td><td>${totalPayment.toFixed(2)}</td><td>${payment.allocations.reduce((s,r)=>s+r.tds,0).toFixed(2)}</td><td>${payment.allocations.reduce((s,r)=>s+r.discount,0).toFixed(2)}</td><td></td></tr></tbody></table>
    <div class="footer"><div class="total-words"><div class="total-amt">Total: ₹ ${payment.amount.toFixed(2)}</div><div style="color:#6b7280;font-size:11px;margin-bottom:2px;">Amount Paid in Words</div><div>${numToWords(payment.amount)}</div></div>
    <div class="sig-box"><div class="sig-label">Authorized signatory for</div><div class="sig-name">${business.name}</div><div class="sig-line"></div></div></div>
  </div></body></html>`;
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteConfirmModal({ onCancel, onConfirm, deleting }: { onCancel: () => void; onConfirm: () => void; deleting: boolean }) {
  return (
    <div className="piv-overlay" onClick={onCancel}>
      <div className="piv-confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="piv-confirm-icon">
          <svg viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="#ef4444"/><line x1="12" y1="9" x2="12" y2="13" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
        </div>
        <div className="piv-confirm-title">Delete this Payment-In?</div>
        <div className="piv-confirm-sub">This will unlink all invoices and restore their outstanding balance.</div>
        <div className="piv-confirm-btns">
          <button className="piv-btn-cancel" onClick={onCancel} disabled={deleting}>Cancel</button>
          <button className="piv-btn-delete" onClick={onConfirm} disabled={deleting}>{deleting ? "Deleting…" : "Yes, Delete"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Inner View ───────────────────────────────────────────────────────────────
function PaymentInViewInner({ payment }: { payment: PaymentInRecord }) {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareDrop,   setShowShareDrop]   = useState(false);
  const [isPrinting,      setIsPrinting]      = useState(false);
  const [isDownloading,   setIsDownloading]   = useState(false);
  const [deleting,        setDeleting]        = useState(false);

  const settled = payment.allocations ?? [];

  async function handleDelete() {
    setDeleting(true);
    try {
      await deletePaymentIn(payment.id);
      navigate("/cashier/payment-in-list");
    } catch { setDeleting(false); setShowDeleteModal(false); }
  }

  function handlePrint() {
    setIsPrinting(true);
    try {
      const html = buildReceiptHTML(payment);
      const w = window.open("", "_blank", "width=900,height=700");
      if (!w) { alert("Please allow pop-ups for printing."); setIsPrinting(false); return; }
      w.document.open(); w.document.write(html); w.document.close();
      w.onload = () => { w.focus(); w.print(); setIsPrinting(false); };
      setTimeout(() => { try { if (!w.closed) { w.focus(); w.print(); } } catch {} setIsPrinting(false); }, 1200);
    } catch { setIsPrinting(false); }
  }

  function handleDownload() {
    setIsDownloading(true);
    try {
      const html = buildReceiptHTML(payment);
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `payment-in-${payment.paymentNo}.html`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } finally { setIsDownloading(false); }
  }

  return (
    <div className="piv-page">
      <div className="piv-header">
        <div className="piv-header-left">
          <button className="piv-back-btn" onClick={() => navigate("/cashier/payment-in-list")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <span className="piv-title">Payment In #{payment.paymentNo}</span>
        </div>
        <div className="piv-header-right">
          <button className="piv-edit-btn" onClick={() => navigate(`/cashier/payment-in?editId=${payment.id}`)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
          <button className="piv-delete-btn" onClick={() => setShowDeleteModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </div>

      <div className="piv-action-bar">
        <button className={`piv-action-btn${isDownloading?" piv-action-btn--loading":""}`} onClick={handleDownload} disabled={isDownloading}>
          {isDownloading?<span className="piv-spinner"/>:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
          {isDownloading?"Preparing…":"Download PDF"}
        </button>
        <button className={`piv-action-btn${isPrinting?" piv-action-btn--loading":""}`} onClick={handlePrint} disabled={isPrinting}>
          {isPrinting?<span className="piv-spinner"/>:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>}
          {isPrinting?"Opening…":"Print PDF"}
        </button>
        <div className="piv-share-wrap">
          <button className="piv-action-btn" onClick={() => setShowShareDrop(v=>!v)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:13,height:13}}><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {showShareDrop && (
            <div className="piv-share-dropdown">
              {["WhatsApp","Email","Copy Link"].map(opt=>(
                <button key={opt} className="piv-share-item" onClick={()=>setShowShareDrop(false)}>{opt}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Details */}
      <div className="piv-card">
        <div className="piv-card-title">Payment Details</div>
        <div className="piv-details-grid">
          <div><div className="piv-detail-label">Party Name</div><div className="piv-detail-value">{payment.partyName}</div></div>
          <div><div className="piv-detail-label">Payment Date</div><div className="piv-detail-value">{fmtDate(payment.date)}</div></div>
          <div><div className="piv-detail-label">Amount Received</div><div className="piv-detail-value">{fmtCurr(payment.amount)}</div></div>
          <div><div className="piv-detail-label">Total Settled</div><div className="piv-detail-value">{fmtCurr(payment.totalAmountSettled)}</div></div>
          <div><div className="piv-detail-label">Payment Mode</div><div className="piv-detail-value">{payment.mode}</div></div>
          <div><div className="piv-detail-label">Notes</div><div className="piv-detail-value">{payment.notes || "--"}</div></div>
        </div>
      </div>

      {/* Settled Invoices */}
      {settled.length > 0 && (
        <div className="piv-card" style={{marginTop:16}}>
          <div className="piv-card-title">Invoices settled with this payment</div>
          <div className="piv-settled-table-wrap">
            <table className="piv-settled-table">
              <thead>
                <tr>
                  {["Date","Invoice Number","Invoice Amount","TDS","Discount","Amount Received","Balance Amount"].map(col=>(
                    <th key={col} className="piv-sth">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {settled.map(s=>(
                  <tr key={s.invoiceId}>
                    <td className="piv-std">{fmtDateLong(s.invoiceDate)}</td>
                    <td className="piv-std">{s.invoiceNo}</td>
                    <td className="piv-std">{fmtCurr(s.totalAmount)}</td>
                    <td className="piv-std">₹ {s.tds.toFixed(2)}</td>
                    <td className="piv-std">₹ {s.discount.toFixed(2)}</td>
                    <td className="piv-std">{fmtCurr(s.amountReceived)}</td>
                    <td className="piv-std">₹ {s.balanceAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <DeleteConfirmModal onCancel={() => setShowDeleteModal(false)} onConfirm={handleDelete} deleting={deleting} />
      )}
    </div>
  );
}

// ─── Route wrapper (fetches from backend) ────────────────────────────────────
export default function PaymentInView() {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();
  const [payment, setPayment] = useState<PaymentInRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getPaymentInById(parseInt(id)).then(p => { setPayment(p); setLoading(false); }).catch(err => { setError(err.message); setLoading(false); });
  }, [id]);

  if (loading) return <div style={{padding:40,textAlign:"center",color:"#6b7280"}}>Loading…</div>;
  if (error || !payment) return (
    <div style={{padding:40,textAlign:"center",color:"#9ca3af",fontFamily:"Segoe UI, sans-serif"}}>
      <div style={{fontSize:15,marginBottom:12}}>{error ?? "Payment record not found."}</div>
      <button style={{color:"#4f46e5",background:"none",border:"none",cursor:"pointer",fontSize:14,fontWeight:600}} onClick={()=>navigate("/cashier/payment-in-list")}>← Back to list</button>
    </div>
  );

  return <PaymentInViewInner payment={payment} />;
}