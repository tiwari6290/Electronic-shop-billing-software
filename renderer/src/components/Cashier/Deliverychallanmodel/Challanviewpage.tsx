import React, { useRef, useState, useEffect } from "react";
import { ChallanItem } from "./DeliveryChallanmodel";
import "./Challanviewpage.css";

// ─── Static assets ────────────────────────────────────────────────────────────
import BILL_LOGO      from "../../../assets/bill_logo.jpeg";
import BILL_SIGNATURE from "../../../assets/bill_signature.png";
import BILL_QR        from "../../../assets/qr_code.jpeg";

// ─── Convert image to base64 for print/download ───────────────────────────────
async function toBase64DataUrl(src: string): Promise<string> {
  try {
    const res  = await fetch(src);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror  = reject;
      reader.readAsDataURL(blob);
    });
  } catch { return src; }
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  challan: ChallanItem;
  onBack: () => void;
  onEdit: () => void;
  onConvertToInvoice: () => void;
  onDelete?: (id: number) => void;
  onDuplicate?: (id: number) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDateSlash(s: string) {
  if (!s) return "";
  const d = new Date(s);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}
function fmtDateGB(s: string) {
  if (!s) return "";
  return new Date(s).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
}
function fmtN(n: number) {
  const safe = isNaN(n)||!isFinite(n) ? 0 : n;
  return safe.toLocaleString("en-IN", { minimumFractionDigits:2, maximumFractionDigits:2 });
}

function numToWords(n: number): string {
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten",
    "Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  if (n === 0) return "Zero";
  function h(num: number): string {
    if (num === 0) return "";
    if (num < 20) return ones[num] + " ";
    if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? " "+ones[num%10] : "") + " ";
    if (num < 1000) return ones[Math.floor(num/100)] + " Hundred " + h(num%100);
    if (num < 100000) return h(Math.floor(num/1000)) + "Thousand " + h(num%1000);
    if (num < 10000000) return h(Math.floor(num/100000)) + "Lakh " + h(num%100000);
    return h(Math.floor(num/10000000)) + "Crore " + h(num%10000000);
  }
  const intPart = Math.floor(n);
  const decPart = Math.round((n - intPart) * 100);
  let result = h(intPart).trim() + " Rupees";
  if (decPart > 0) result += " and " + h(decPart).trim() + " Paise";
  return result + " Only";
}

function statusLabel(s: string) {
  if (s === "OPEN") return "Open";
  if (s === "CLOSED") return "Closed";
  if (s === "CANCELLED") return "Cancelled";
  return s;
}
function statusColor(s: string) {
  if (s === "OPEN") return "#d97706";
  if (s === "CLOSED") return "#16a34a";
  if (s === "CANCELLED") return "#dc2626";
  return "#6b7280";
}

// ─── Challan Paper — pixel-faithful to the PDF ───────────────────────────────
function ChallanPaper({ challan, printRef }: { challan: ChallanItem; printRef: React.RefObject<HTMLDivElement> }) {

  const businessInfo = (() => { try { return JSON.parse(localStorage.getItem("businessInfo") || "{}"); } catch { return {}; } })();
  const business     = (() => { try { return JSON.parse(localStorage.getItem("business") || localStorage.getItem("businessInfo") || "{}"); } catch { return {}; } })();

  const companyName = business.companyName || businessInfo.name       || "Your Company";
  const address     = business.address     || businessInfo.address    || "";
  const gstin       = business.gstin       || businessInfo.gstin      || "";
  const bankName    = business.bankName    || "";
  const accountNo   = business.accountNo  || "";
  const ifsc        = business.ifsc        || "";
  const branch      = business.branch      || "";
  const bankHolder  = business.bank        || "";

  const items = challan.items || [];

  // ── Per-item computed values ──────────────────────────────────────────────
  const itemCalcs = items.map(item => {
    const lineGross = item.qty * item.pricePerItem;
    const discPct   = item.discount?.percent || 0;
    const discAmt   = item.discount?.amount  || 0;
    const totalDisc = Math.round((lineGross * discPct / 100 + discAmt) * 100) / 100;
    const taxable   = Math.max(0, lineGross - totalDisc);
    const taxRate   = Number(item.taxRate) || 0;
    const cgstPct   = taxRate / 2;
    const cgstAmt   = Math.round(taxable * cgstPct / 100 * 100) / 100;
    const sgstAmt   = cgstAmt;
    return { lineGross, totalDisc, taxable, taxRate, cgstPct, cgstAmt, sgstAmt, discPct, discAmt };
  });

  // ── Grand total straight from challan.amount (already computed by backend) ─
  const grandTotal = challan.amount;

  // ── Total row aggregates ──────────────────────────────────────────────────
  const totalQty      = items.reduce((s, i) => s + i.qty, 0);
  const totalDisc     = itemCalcs.reduce((s, c) => s + c.totalDisc, 0);
  const totalTaxable  = itemCalcs.reduce((s, c) => s + c.taxable, 0);
  const totalCgst     = itemCalcs.reduce((s, c) => s + c.cgstAmt, 0);
  const totalSgst     = itemCalcs.reduce((s, c) => s + c.sgstAmt, 0);

  // ── Payment / Finance ─────────────────────────────────────────────────────
  // ChallanItem carries paymentDetails & financeDetails via optional fields
  // we cast to any for now since the type may not expose them yet
  const pd  = (challan as any).paymentDetails  as any | undefined;
  const fin = (challan as any).financeDetails  as any | undefined;
  const hasFin = !!(fin && (fin.financerName || fin.loanRefNo || fin.loanAmount || fin.emi));

  const receivedAmt = Number((challan as any).amountReceived ?? (challan as any).receivedAmount ?? 0);
  const balanceAmt  = (challan as any).outstandingAmount != null
    ? Number((challan as any).outstandingAmount)
    : Math.max(0, grandTotal - receivedAmt);

  // ── HSN Map ───────────────────────────────────────────────────────────────
  const hsnMap: Record<string, { taxable:number; cgst:number; sgst:number; rate:number }> = {};
  items.forEach((item, i) => {
    const c   = itemCalcs[i];
    const key = `${item.hsnSac||"-"}__${c.taxRate}`;
    if (!hsnMap[key]) hsnMap[key] = { taxable:0, cgst:0, sgst:0, rate:c.taxRate };
    hsnMap[key].taxable += c.taxable;
    hsnMap[key].cgst    += c.cgstAmt;
    hsnMap[key].sgst    += c.sgstAmt;
  });
  const hsnRows = Object.entries(hsnMap).map(([key, v]) => ({ hsn: key.split("__")[0], ...v }));

  const defaultTerms = "Diclamer:-\n*Delivery received after full Satisfaction. Goods once sold cannot be taken back or exchanged.\n*For any type of complaint, please contact the Manufacturer.\n*Dealer is not liable for any complaint after delivery.\n*Warranty is given by manufacturer only.\n*Cheque return charge Rs.200/- besides legal liability.\n*All disputes subject to local Jurisdiction.";

  // ── Filler rows ───────────────────────────────────────────────────────────
  const MIN_ROWS    = 8;
  const NCOLS       = 12;
  const fillerCount = Math.max(0, MIN_ROWS - items.length);

  // ── Style constants ───────────────────────────────────────────────────────
  const B  = "1px solid #888";
  const BL = "1px solid #bbb";
  const TH: React.CSSProperties = {
    border: B, padding: "5px 6px", fontSize: 10, fontWeight: 700,
    background: "#f0f0f0", color: "#111", textAlign: "center" as const,
    whiteSpace: "nowrap" as const, lineHeight: 1.3,
  };
  const TD: React.CSSProperties = {
    border: BL, padding: "5px 6px", fontSize: 10, color: "#1a1a1a",
    verticalAlign: "top" as const,
  };

  // ── Payment table column logic (mirrors InvoiceViewModal exactly) ─────────
  const isCash         = pd?.method === "Cash";
  const isUPI          = pd?.method === "UPI";
  const isCard         = pd?.method === "Card";
  const isNetbanking   = pd?.method === "Netbanking";
  const isBankTransfer = pd?.method === "Bank Transfer";
  const isCheque       = pd?.method === "Cheque";
  const showRef    = !isCash && (isUPI || isNetbanking || isBankTransfer || isCheque) && !!pd?.refNo;
  const showAuth   = isCard  && !!pd?.authNo;
  const showBank   = !isCash && !isUPI && (isCard || isNetbanking || isBankTransfer || isCheque) && !!pd?.bankName;
  const showUPIApp = isUPI   && !!pd?.bankName;
  const showCard   = isCard  && !!pd?.cardType;
  const showCheque = isCheque && !!pd?.chequeDate;
  const showBranch = (isCheque || isBankTransfer) && !!pd?.branchName;
  const refLabel   = isUPI ? "UPI / Txn ID" : isBankTransfer ? "UTR Number" : isNetbanking ? "Transaction ID" : isCheque ? "Cheque No." : "Ref. No";

  const MetaRow = ({ label, value, minW = 120 }: { label: string; value: string | undefined | null; minW?: number }) => {
    if (!value) return null;
    return (
      <div style={{ display:"flex", gap:4, marginBottom:2 }}>
        <span style={{ fontWeight:700, minWidth:minW }}>{label}</span>
        <span>: {value}</span>
      </div>
    );
  };

  return (
    <div
      ref={printRef}
      className="cvp-paper"
      style={{
        fontFamily: "'Times New Roman', Georgia, serif",
        fontSize: "10px",
        color: "#1a1a1a",
        background: "#fff",
        padding: 0,
        width: "100%",
        maxWidth: "100%",
        margin: 0,
        position: "relative",
        border: "2px solid #333",
        boxSizing: "border-box",
      }}
    >
      {/* ══ HEADER ══ */}
      <div style={{ display:"grid", gridTemplateColumns:"120px 1fr 100px", alignItems:"center", padding:"10px 14px 8px", borderBottom:B, gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-start" }}>
          <img src={BILL_LOGO} alt="Logo" style={{ height:56, maxWidth:110, objectFit:"contain" }}/>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:13, fontWeight:800, letterSpacing:"0.12em", color:"#111", marginBottom:2 }}>
            TAX INVOICE CUM DELIVERY CHALLAN
          </div>
          <div style={{ fontSize:20, fontWeight:900, color:"#111", fontFamily:"'Georgia','Times New Roman',serif", letterSpacing:"0.02em", lineHeight:1.1, marginBottom:3 }}>
            {companyName}
          </div>
          {address && <div style={{ fontSize:9.5, color:"#333", lineHeight:1.5 }}>{address}</div>}
          <div style={{ fontSize:9.5, color:"#333" }}>
            Phone: 2646 1320{"  "}Mobile: 9831789022{"  "}PAN No.: AFTPM0665H
          </div>
          {gstin && <div style={{ fontSize:9.5, fontWeight:700, color:"#111", marginTop:1 }}>GSTIN NO : {gstin}</div>}
        </div>
        <div style={{ width:90, height:90, flexShrink:0, marginLeft:"auto", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <img src={BILL_QR} alt="QR Code" style={{ width:88, height:88, objectFit:"contain", display:"block" }}/>
        </div>
      </div>

      {/* ══ Row 2: Transport LEFT | Invoice Meta RIGHT ══ */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", borderBottom:B }}>

        {/* LEFT */}
        <div style={{ borderRight:B, padding:"5px 10px", fontSize:9.5 }}>
          <MetaRow label="Transportation Mode" value={challan.dispatchedThrough} />
          <MetaRow label="Vehicle No."         value={challan.vehicleNo} />
          <MetaRow label="Transport Name"      value={challan.transportName} />
          <MetaRow label="Financer's Name"     value={challan.financedBy} />
        </div>

        {/* RIGHT */}
        <div style={{ padding:"5px 10px", fontSize:9.5 }}>
          <MetaRow label="Type of Invoice"  value={hasFin ? "FINANCE" : "TAX"} minW={100} />
          <MetaRow label="Challan No."      value={challan.challanNumber}            minW={100} />
          <MetaRow label="Challan Date"     value={fmtDateSlash(challan.date)}       minW={100} />
          {challan.salesman       && <MetaRow label="Salesman"       value={challan.salesman}       minW={100} />}
          {(challan as any).challanNoRef && <MetaRow label="Ref. No."  value={(challan as any).challanNoRef} minW={100} />}
          {challan.warrantyPeriod && <MetaRow label="Warranty Period" value={challan.warrantyPeriod} minW={100} />}
          {challan.eWayBillNo    && <MetaRow label="E-Way Bill No."  value={challan.eWayBillNo}     minW={100} />}
          {challan.poNumber      && <MetaRow label="Order No."       value={challan.poNumber}       minW={100} />}
          {challan.emailId       && <MetaRow label="Email ID"        value={challan.emailId}        minW={100} />}
          {/* Custom fields */}
          {challan.customFieldValues && Object.entries(challan.customFieldValues).map(([lbl, val]) =>
            val ? <MetaRow key={lbl} label={lbl} value={val} minW={100} /> : null
          )}
          {(challan as any).dueDate && <MetaRow label="Due Date" value={fmtDateSlash((challan as any).dueDate)} minW={100} />}
        </div>
      </div>

      {/* ══ Row 3: Billing / Shipping ══ */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", borderBottom:B }}>
        <div style={{ borderRight:B, padding:"7px 10px", fontSize:9.5 }}>
          <div style={{ fontSize:9, fontWeight:700, color:"#333", marginBottom:3, textTransform:"uppercase" as const }}>Details of Receiver (Billing Address)</div>
          <div style={{ display:"grid", gridTemplateColumns:"65px 1fr", rowGap:2 }}>
            <span style={{ fontWeight:700 }}>Name</span>
            <span>: <strong>{challan.partyName}</strong></span>
            {challan.shippingAddress && <>
              <span style={{ fontWeight:700 }}>Address</span>
              <span>: {challan.shippingAddress}</span>
            </>}
            {(challan as any).partyMobile && <>
              <span style={{ fontWeight:700 }}>Contact No</span>
              <span>: {(challan as any).partyMobile}</span>
            </>}
            <span style={{ fontWeight:700 }}>GSTIN</span>
            <span>: {(challan as any).partyGstin || "Un-Registered"}</span>
          </div>
        </div>
        <div style={{ padding:"7px 10px", fontSize:9.5 }}>
          <div style={{ fontSize:9, fontWeight:700, color:"#333", marginBottom:3, textTransform:"uppercase" as const }}>Details of Consignee (Shipping Address)</div>
          <div style={{ display:"grid", gridTemplateColumns:"65px 1fr", rowGap:2 }}>
            <span style={{ fontWeight:700 }}>Name</span>
            <span>: <strong>{(challan as any).shipToName || challan.partyName}</strong></span>
            {((challan as any).shipToAddress || challan.shippingAddress) && <>
              <span style={{ fontWeight:700 }}>Address</span>
              <span>: {(challan as any).shipToAddress || challan.shippingAddress}</span>
            </>}
            {((challan as any).shipToMobile || (challan as any).partyMobile) && <>
              <span style={{ fontWeight:700 }}>Contact No</span>
              <span>: {(challan as any).shipToMobile || (challan as any).partyMobile}</span>
            </>}
            <span style={{ fontWeight:700 }}>GSTIN</span>
            <span>: {(challan as any).shipToGstin || (challan as any).partyGstin || "-"}</span>
          </div>
        </div>
      </div>

      {/* ══ Items Table — 12 columns matching the invoice PDF exactly ══ */}
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <colgroup>
          <col style={{ width:"4%" }}/>
          <col style={{ width:"20%" }}/>
          <col style={{ width:"7%" }}/>
          <col style={{ width:"6%" }}/>
          <col style={{ width:"8%" }}/>
          <col style={{ width:"8%" }}/>
          <col style={{ width:"9%" }}/>
          <col style={{ width:"5%" }}/>
          <col style={{ width:"7%" }}/>
          <col style={{ width:"5%" }}/>
          <col style={{ width:"7%" }}/>
          <col style={{ width:"10%" }}/>
        </colgroup>
        <thead>
          <tr>
            <th style={TH}>Sl.</th>
            <th style={{ ...TH, textAlign:"left" as const }}>Description</th>
            <th style={TH}>HSN</th>
            <th style={TH}>Qty</th>
            <th style={TH}>Basic Price</th>
            <th style={TH}>Disc.</th>
            <th style={TH}>Taxable Value</th>
            <th style={TH}>CGST %</th>
            <th style={TH}>CGST Amt</th>
            <th style={TH}>SGST %</th>
            <th style={TH}>SGST Amt</th>
            <th style={TH}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const c = itemCalcs[idx];
            const discDisplay = c.discPct > 0
              ? `${c.discPct}%\n(${fmtN(c.totalDisc)})`
              : c.discAmt > 0 ? fmtN(c.discAmt) : "-";
            return (
              <tr key={item.id}>
                <td style={{ ...TD, textAlign:"center" as const }}>{idx + 1}</td>
                <td style={TD}>
                  <div style={{ fontWeight:600 }}>{item.name}</div>
                  {item.description && <div style={{ fontSize:8.5, color:"#555", marginTop:1 }}>{item.description}</div>}
                </td>
                <td style={{ ...TD, textAlign:"center" as const }}>{item.hsnSac || "-"}</td>
                <td style={{ ...TD, textAlign:"center" as const }}>{item.qty}<br/>{item.unit || "PCS"}</td>
                <td style={{ ...TD, textAlign:"right" as const }}>{fmtN(item.pricePerItem)}</td>
                <td style={{ ...TD, textAlign:"right" as const, whiteSpace:"pre-line" as const }}>{discDisplay}</td>
                <td style={{ ...TD, textAlign:"right" as const }}>{fmtN(c.taxable)}</td>
                <td style={{ ...TD, textAlign:"center" as const }}>{c.taxRate > 0 ? c.cgstPct : "-"}</td>
                <td style={{ ...TD, textAlign:"right" as const }}>{c.taxRate > 0 ? fmtN(c.cgstAmt) : "-"}</td>
                <td style={{ ...TD, textAlign:"center" as const }}>{c.taxRate > 0 ? c.cgstPct : "-"}</td>
                <td style={{ ...TD, textAlign:"right" as const }}>{c.taxRate > 0 ? fmtN(c.sgstAmt) : "-"}</td>
                <td style={{ ...TD, textAlign:"right" as const, fontWeight:600 }}>{fmtN(item.amount)}</td>
              </tr>
            );
          })}
          {/* Filler rows */}
          {Array.from({ length: fillerCount }).map((_, i) => (
            <tr key={`fill${i}`} style={{ height:18 }}>
              {Array.from({ length: NCOLS }).map((__, j) => (
                <td key={j} style={{ ...TD, borderTop:"none", borderBottom:"none" }}/>
              ))}
            </tr>
          ))}
          {/* Total row */}
          <tr>
            <td colSpan={3} style={{ ...TD, fontWeight:700, textAlign:"right" as const, background:"#f0f0f0" }}>Total</td>
            <td style={{ ...TD, textAlign:"center" as const, fontWeight:700, background:"#f0f0f0" }}>{totalQty}</td>
            <td style={{ ...TD, background:"#f0f0f0" }}></td>
            <td style={{ ...TD, textAlign:"right" as const, fontWeight:700, background:"#f0f0f0" }}>{fmtN(totalDisc)}</td>
            <td style={{ ...TD, textAlign:"right" as const, fontWeight:700, background:"#f0f0f0" }}>{fmtN(totalTaxable)}</td>
            <td style={{ ...TD, background:"#f0f0f0" }}></td>
            <td style={{ ...TD, textAlign:"right" as const, fontWeight:700, background:"#f0f0f0" }}>{fmtN(totalCgst)}</td>
            <td style={{ ...TD, background:"#f0f0f0" }}></td>
            <td style={{ ...TD, textAlign:"right" as const, fontWeight:700, background:"#f0f0f0" }}>{fmtN(totalSgst)}</td>
            <td style={{ ...TD, textAlign:"right" as const, fontWeight:700, background:"#f0f0f0" }}>{fmtN(grandTotal)}</td>
          </tr>
        </tbody>
      </table>

      {/* ══ Total in words ══ */}
      <div style={{ padding:"6px 12px", borderTop:B, borderBottom:B, fontSize:10 }}>
        <strong>Total: Rupees </strong>{numToWords(grandTotal)}
        <span style={{ float:"right", fontWeight:700, fontSize:11 }}>₹ {fmtN(grandTotal)}</span>
      </div>

      {/* ══ Additional Charges ══ */}
      {challan.additionalCharges && challan.additionalCharges.length > 0 && (
        <div style={{ borderBottom:B }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:9.5 }}>
            <thead>
              <tr>
                <th style={{ ...TD, textAlign:"left" as const, fontWeight:700, background:"#f5f5f5", border:B }}>Additional Charges</th>
                <th style={{ ...TD, textAlign:"center" as const, fontWeight:700, background:"#f5f5f5", border:B }}>Tax</th>
                <th style={{ ...TD, textAlign:"right" as const, fontWeight:700, background:"#f5f5f5", border:B }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {challan.additionalCharges.map((charge, idx) => (
                <tr key={idx}>
                  <td style={TD}>{charge.label || `Charge ${idx + 1}`}</td>
                  <td style={{ ...TD, textAlign:"center" as const }}>{charge.tax || "No Tax"}</td>
                  <td style={{ ...TD, textAlign:"right" as const }}>{fmtN(Number(charge.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ══ Payment Table (mirrors invoice modal) ══ */}
      {pd?.method && (
        <div style={{ borderBottom:B }}>
          <div style={{ padding:"5px 12px", fontWeight:800, fontSize:11.5, letterSpacing:"0.22em", borderBottom:B, fontFamily:"'Times New Roman',serif" }}>
            P A Y M E N T
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:9.5 }}>
            <thead>
              <tr>
                <th style={{ ...TD, fontWeight:700, textAlign:"center" as const, background:"#f5f5f5", border:B }}>Payment<br/>Type</th>
                {showRef    && <th style={{ ...TD, fontWeight:700, textAlign:"center" as const, background:"#f5f5f5", border:B }}>{refLabel}</th>}
                {showAuth   && <th style={{ ...TD, fontWeight:700, textAlign:"center" as const, background:"#f5f5f5", border:B }}>Auth No.</th>}
                {showUPIApp && <th style={{ ...TD, fontWeight:700, textAlign:"center" as const, background:"#f5f5f5", border:B }}>UPI App</th>}
                {showBank   && <th style={{ ...TD, fontWeight:700, textAlign:"center" as const, background:"#f5f5f5", border:B }}>Bank Name</th>}
                {showCard   && <th style={{ ...TD, fontWeight:700, textAlign:"center" as const, background:"#f5f5f5", border:B }}>Card Type</th>}
                {showCheque && <th style={{ ...TD, fontWeight:700, textAlign:"center" as const, background:"#f5f5f5", border:B }}>Cheque<br/>Date</th>}
                {showBranch && <th style={{ ...TD, fontWeight:700, textAlign:"center" as const, background:"#f5f5f5", border:B }}>Branch Name</th>}
                <th style={{ ...TD, fontWeight:700, textAlign:"right" as const, background:"#f5f5f5", border:B }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...TD, textAlign:"center" as const }}>{pd.method}</td>
                {showRef    && <td style={{ ...TD, textAlign:"center" as const }}>{pd.refNo}</td>}
                {showAuth   && <td style={{ ...TD, textAlign:"center" as const }}>{pd.authNo}</td>}
                {showUPIApp && <td style={{ ...TD, textAlign:"center" as const }}>{pd.bankName}</td>}
                {showBank   && <td style={{ ...TD, textAlign:"center" as const }}>{pd.bankName}</td>}
                {showCard   && <td style={{ ...TD, textAlign:"center" as const }}>{pd.cardType}</td>}
                {showCheque && <td style={{ ...TD, textAlign:"center" as const }}>{fmtDateSlash(pd.chequeDate!)}</td>}
                {showBranch && <td style={{ ...TD, textAlign:"center" as const }}>{pd.branchName}</td>}
                <td style={{ ...TD, textAlign:"right" as const, fontWeight:600 }}>
                  {fmtN(Number(pd.amount) || receivedAmt)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ══ Amount Received & Balance ══ */}
      {receivedAmt > 0 && (
        <div style={{ borderBottom:B, fontSize:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 12px", borderBottom:"1px solid #e0e0e0" }}>
            <span style={{ fontWeight:700 }}>Amount Received</span>
            <span style={{ fontWeight:700, color:"#16a34a" }}>₹ {fmtN(receivedAmt)}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 12px" }}>
            <span style={{ fontWeight:700 }}>Balance Amount</span>
            <span style={{ fontWeight:700, color:balanceAmt > 0 ? "#dc2626" : "#16a34a" }}>₹ {fmtN(balanceAmt)}</span>
          </div>
        </div>
      )}

      {/* ══ Finance Details ══ */}
      {hasFin && fin && (
        <div style={{ borderBottom:B }}>
          <div style={{ padding:"5px 12px", textAlign:"center" as const, fontWeight:800, fontSize:11, letterSpacing:"0.12em", borderBottom:B, background:"#fafafa", fontFamily:"'Times New Roman',serif" }}>
            FINANCE DETAILS
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"130px 1fr 80px 80px 160px", borderBottom:B, fontSize:9.5 }}>
            <div style={{ padding:"6px 10px", borderRight:B }}>
              {fin.loanRefNo && <>
                <div style={{ fontSize:8.5, color:"#555", fontWeight:700, marginBottom:2 }}>SF CODE / LOAN REF:</div>
                <div style={{ fontWeight:700 }}>{fin.loanRefNo}</div>
              </>}
              {fin.emi && <>
                <div style={{ fontSize:8.5, color:"#555", fontWeight:700, marginTop:4, marginBottom:2 }}>EMI DETAILS:</div>
                <div style={{ fontWeight:600, fontSize:9.5 }}>
                  {fin.emi}×{fin.emiCount || 1}{fin.extraEmi ? ` + ${fin.extraEmi}×${fin.extraEmiCount || 1}` : ""}
                </div>
              </>}
              {fin.financerName && <>
                <div style={{ fontSize:8.5, color:"#555", fontWeight:700, marginTop:4, marginBottom:2 }}>FINANCER:</div>
                <div style={{ fontWeight:600 }}>{fin.financerName}</div>
              </>}
            </div>
            <div style={{ padding:"6px 10px", borderRight:B }}>
              {fin.agentName    && <div style={{ marginBottom:3 }}><span style={{ fontSize:8.5, color:"#555", fontWeight:700 }}>ISD Name: </span><span>{fin.agentName}</span></div>}
              {fin.agentContact && <div style={{ marginBottom:3 }}><span style={{ fontSize:8.5, color:"#555", fontWeight:700 }}>Contact: </span><span>{fin.agentContact}</span></div>}
              {fin.reference    && <div><span style={{ fontSize:8.5, color:"#555", fontWeight:700 }}>Reference: </span><span>{fin.reference}</span></div>}
            </div>
            <div style={{ padding:"6px 10px", borderRight:B }}>
              <div style={{ fontSize:8.5, color:"#555", fontWeight:700, marginBottom:2 }}>DBD:</div>
              <div style={{ fontWeight:600 }}>{fin.dbdCharges != null ? Number(fin.dbdCharges).toFixed(2) : "0.00"}</div>
            </div>
            <div style={{ padding:"6px 10px", borderRight:B }}>
              <div style={{ fontSize:8.5, color:"#555", fontWeight:700, marginBottom:2 }}>PF:</div>
              <div style={{ fontWeight:600 }}>{fin.processingFee != null ? Number(fin.processingFee).toFixed(2) : "0.00"}</div>
            </div>
            <div style={{ padding:"6px 10px", background:"#f5f5f5" }}>
              <div style={{ fontSize:8.5, color:"#555", fontWeight:700, marginBottom:2, lineHeight:1.4 }}>FINANCE DUE<br/>FROM FINANCER :</div>
              <div style={{ fontWeight:700, fontSize:12, color:"#111" }}>
                {fin.loanAmount != null ? Number(fin.loanAmount).toLocaleString("en-IN", { minimumFractionDigits:2 }) : "-"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ Banking Details + Signature ══ */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr auto", borderBottom:B, alignItems:"stretch" }}>
        <div style={{ padding:"7px 12px", borderRight:B }}>
          <div style={{ fontSize:10, fontWeight:700, color:"#222", marginBottom:3 }}>Banking Details:</div>
          <div style={{ fontSize:9.5, color:"#333", lineHeight:1.8 }}>
            {bankHolder && <span>Account Name: <strong>{bankHolder}</strong>{"  "}</span>}
            {bankName   && <span>Bank: <strong>{bankName}</strong>{"  "}</span>}
            {accountNo  && <span>A/c No.: <strong>{accountNo}</strong>{"  "}</span>}
            {ifsc       && <span>IFSC: <strong>{ifsc}</strong>{"  "}</span>}
            {branch     && <span>Branch: <strong>{branch}</strong></span>}
          </div>
        </div>
        <div style={{ padding:"7px 14px", display:"flex", flexDirection:"column" as const, alignItems:"flex-end", justifyContent:"space-between", minWidth:180 }}>
          <div style={{ fontSize:9.5, fontWeight:700, color:"#333", alignSelf:"flex-end" }}>E &amp; O.E.</div>
          <div style={{ textAlign:"center" as const, marginTop:8 }}>
            <img src={BILL_SIGNATURE} alt="Signature" style={{ maxHeight:50, maxWidth:150, objectFit:"contain", display:"block", margin:"0 auto 4px" }}/>
            <div style={{ fontSize:9, color:"#333" }}>For <strong>{companyName}</strong></div>
          </div>
        </div>
      </div>

      {/* ══ Terms & Notes ══ */}
      <div style={{ padding:"7px 12px", fontSize:9.5, lineHeight:1.6 }}>
        <div style={{ whiteSpace:"pre-line" as const, color:"#333" }}>
          {challan.termsAndConditions || defaultTerms}
        </div>
        {challan.notes && (
          <div style={{ marginTop:4 }}><strong>Notes: </strong>{challan.notes}</div>
        )}
        <div style={{ marginTop:4, fontStyle:"italic", color:"#555" }}>No Tax Payable on Reverse Charge</div>
      </div>
    </div>
  );
}

// ─── Main ChallanViewPage ─────────────────────────────────────────────────────
export default function ChallanViewPage({ challan, onBack, onEdit, onConvertToInvoice, onDelete, onDuplicate }: Props) {
  const printRef  = useRef<HTMLDivElement>(null);
  const dotsRef   = useRef<HTMLDivElement>(null);
  const [dotsOpen, setDotsOpen] = useState(false);
  const [converting, setConverting] = useState(false);
  const [showPrintMenu, setShowPrintMenu] = useState(false);

  // close dots on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dotsRef.current && !dotsRef.current.contains(e.target as Node)) setDotsOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const businessInfo = (() => {
    try { return JSON.parse(localStorage.getItem("businessInfo") || "{}"); } catch { return {}; }
  })();
  const companyName = businessInfo.companyName || businessInfo.name || "Your Company";

  // ── Print/Download helpers ──────────────────────────────────────────────────
  function buildHtml(content: string) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
    <title>Challan-${challan.challanNumber}</title>
    <style>
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      body{font-family:'Times New Roman',Georgia,serif;font-size:10px;color:#1a1a1a;background:#f0f0f0;-webkit-print-color-adjust:exact;print-color-adjust:exact;padding:24px;}
      .cvp-paper-wrapper{max-width:860px;margin:0 auto;}
      table{width:100%;border-collapse:collapse;}
      th,td{padding:5px 6px;}
      .cvp-paper{border:2px solid #333 !important;background:#fff;}
      *{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;color-adjust:exact !important;}
      @media print{body{margin:0;padding:12px;background:#fff;}.cvp-paper-wrapper{max-width:none;}.cvp-paper{border:2px solid #333 !important;}}
    </style></head>
    <body><div class="cvp-paper-wrapper">${content}</div></body></html>`;
  }

  async function embedImages(html: string): Promise<string> {
    const pattern = /(<img[^>]+src=")([^"]+)(")/g;
    const matches: { src: string }[] = [];
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(html)) !== null) matches.push({ src: m[2] });
    const cache: Record<string, string> = {};
    for (const { src } of matches) {
      if (!cache[src] && !src.startsWith("data:")) cache[src] = await toBase64DataUrl(src);
    }
    return html.replace(pattern, (_full, pre, src, post) => `${pre}${cache[src] || src}${post}`);
  }

  async function handlePrint() {
    const rawContent = printRef.current?.outerHTML ?? "";
    const content    = await embedImages(rawContent);
    const w = window.open("", "_blank");
    if (!w) { alert("Please allow popups to print."); return; }
    w.document.write(buildHtml(content));
    w.document.close(); w.focus();
    setTimeout(() => { w.print(); }, 800);
  }

  async function handleDownload() {
    const rawContent = printRef.current?.outerHTML ?? "";
    const content    = await embedImages(rawContent);
    const html       = buildHtml(content);
    const blob       = new Blob([html], { type:"text/html;charset=utf-8" });
    const url        = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    if (!w) {
      const a = document.createElement("a");
      a.href = url; a.download = `Challan-${challan.challanNumber}.html`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      return;
    }
    w.addEventListener("load", () => {
      w.document.title = `Challan-${challan.challanNumber}`;
      setTimeout(() => { w.print(); setTimeout(() => URL.revokeObjectURL(url), 60000); }, 800);
    });
  }

  const handleConvert = async () => {
    if (challan.status === "CLOSED" || challan.status === "CANCELLED") {
      alert("This challan has already been converted or closed.");
      return;
    }
    setConverting(true);
    try { await onConvertToInvoice(); } finally { setConverting(false); }
  };

  const sc = statusColor(challan.status);
  const isClosed = challan.status === "CLOSED" || challan.status === "CANCELLED";

  const grandTotal = challan.amount;

  return (
    <div className="cvp-shell">

      {/* ── Top Bar ── */}
      <div className="cvp-topbar">
        <div className="cvp-topbar-left">
          <button className="cvp-back-btn" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="cvp-title-text">Delivery Challan #{challan.challanNumber}</span>
          <span className="cvp-status-badge" style={{ background:sc+"18", color:sc, border:`1px solid ${sc}40` }}>
            {statusLabel(challan.status)}
          </span>
        </div>
        <div className="cvp-topbar-right">
          {/* Dots menu */}
          <div ref={dotsRef} style={{ position:"relative" }}>
            <button className="cvp-top-btn cvp-top-btn--dots" onClick={() => setDotsOpen(v => !v)}>
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width:16, height:16 }}>
                <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
              </svg>
            </button>
            {dotsOpen && (
              <div className="cvp-dots-dropdown" onClick={() => setDotsOpen(false)}>
                {!isClosed && (
                  <button className="cvp-dot-item" onClick={onEdit}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:14,height:14 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </button>
                )}
                <button className="cvp-dot-item" onClick={() => alert("Edit History coming soon")}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:14,height:14 }}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.99"/></svg>
                  Edit History
                </button>
                {onDuplicate && (
                  <button className="cvp-dot-item" onClick={() => onDuplicate(challan.id)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:14,height:14 }}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    Duplicate
                  </button>
                )}
                <div className="cvp-dot-sep"/>
                {onDelete && (
                  <button className="cvp-dot-item cvp-dot-danger" onClick={() => onDelete(challan.id)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:14,height:14 }}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Convert button */}
          {challan.status === "OPEN" && (
            <button className="cvp-convert-btn" onClick={handleConvert} disabled={converting}>
              {converting ? "Converting…" : "Convert to Invoice"}
            </button>
          )}
          {challan.status === "CLOSED" && (
            <span className="cvp-converted-badge">✓ Converted to Invoice</span>
          )}

          <button className="cvp-close-btn" onClick={onBack}>✕</button>
        </div>
      </div>

      {/* ── Action Bar ── */}
      <div className="cvp-actionbar">
        <div className="cvp-actionbar-left">
          {/* Print */}
          <div className="cvp-action-group">
            <button className="cvp-action-btn" onClick={handlePrint}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print PDF
            </button>
            <div style={{ position:"relative" }}>
              <button className="cvp-action-split" onClick={() => setShowPrintMenu(v=>!v)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {showPrintMenu && (
                <div className="cvp-split-drop">
                  <div onClick={() => { handlePrint(); setShowPrintMenu(false); }}>Print PDF</div>
                  <div onClick={() => { setShowPrintMenu(false); }}>Thermal Print Settings</div>
                </div>
              )}
            </div>
          </div>
          {/* Download */}
          <div className="cvp-action-group">
            <button className="cvp-action-btn" onClick={handleDownload}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download PDF
            </button>
            <button className="cvp-action-split">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
          {/* Share */}
          <div className="cvp-action-group">
            <button className="cvp-action-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Share
            </button>
            <button className="cvp-action-split">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Body: Paper + Sidebar ── */}
      <div className="cvp-body">
        {/* Paper preview */}
        <div className="cvp-preview-area">
          <div className="cvp-preview-label">
            DELIVERY CHALLAN <span className="cvp-original-tag">ORIGINAL FOR RECIPIENT</span>
          </div>
          <ChallanPaper challan={challan} printRef={printRef}/>
        </div>

        {/* Sidebar */}
        <div className="cvp-sidebar">
          <div className="cvp-sidebar-title">Challan Details</div>

          <div className="cvp-ph-row"><span>Challan Amount</span><strong>₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits:2 })}</strong></div>
          <div className="cvp-ph-row"><span>Status</span>
            <strong style={{ color:sc }}>{statusLabel(challan.status)}</strong>
          </div>
          <div className="cvp-ph-row"><span>Date</span><strong>{fmtDateGB(challan.date)}</strong></div>
          <div className="cvp-ph-row"><span>Party</span><strong>{challan.partyName}</strong></div>

          {challan.salesman && <div className="cvp-ph-row"><span>Salesman</span><strong>{challan.salesman}</strong></div>}
          {challan.vehicleNo && <div className="cvp-ph-row"><span>Vehicle No.</span><strong>{challan.vehicleNo}</strong></div>}
          {challan.dispatchedThrough && <div className="cvp-ph-row"><span>Transport Mode</span><strong>{challan.dispatchedThrough}</strong></div>}
          {challan.transportName && <div className="cvp-ph-row"><span>Transporter</span><strong>{challan.transportName}</strong></div>}
          {challan.eWayBillNo && <div className="cvp-ph-row"><span>E-Way Bill</span><strong>{challan.eWayBillNo}</strong></div>}
          {challan.poNumber && <div className="cvp-ph-row"><span>PO Number</span><strong>{challan.poNumber}</strong></div>}
          {challan.warrantyPeriod && <div className="cvp-ph-row"><span>Warranty</span><strong>{challan.warrantyPeriod}</strong></div>}
          {challan.financedBy && <div className="cvp-ph-row"><span>Financed By</span><strong>{challan.financedBy}</strong></div>}

          {/* Items summary */}
          <div className="cvp-sidebar-section-title">Items ({(challan.items||[]).length})</div>
          {(challan.items||[]).map((item, i) => (
            <div key={i} className="cvp-ph-entry">
              <div className="cvp-ph-entry-top">
                <span style={{ fontWeight:500 }}>{item.name}</span>
                <strong>₹{item.amount.toFixed(2)}</strong>
              </div>
              <div className="cvp-ph-entry-date">Qty: {item.qty} {item.unit} × ₹{item.pricePerItem.toFixed(2)}</div>
            </div>
          ))}

          <div style={{ flex:1 }}/>

          <div className="cvp-ph-total-row">
            <span>Total Amount</span>
            <strong>₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits:2 })}</strong>
          </div>
          {challan.status === "OPEN" && (
            <button className="cvp-convert-sidebar-btn" onClick={handleConvert} disabled={converting}>
              {converting ? "Converting…" : "Convert to Invoice"}
            </button>
          )}
        </div>
      </div>

      {/* close dots backdrop */}
      {dotsOpen && <div style={{ position:"fixed", inset:0, zIndex:499 }} onClick={() => setDotsOpen(false)}/>}
    </div>
  );
}