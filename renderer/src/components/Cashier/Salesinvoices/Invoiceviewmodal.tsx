// import { useEffect, useRef, useState } from "react";
// import "./InvoiceViewModal.css";

// // ─── Static assets — always shown on every invoice ────────────────────────────
// import BILL_LOGO      from "../../../assets/bill_logo.jpeg";
// import BILL_SIGNATURE from "../../../assets/bill_signature.png";

// // ─── Active Template Reader ───────────────────────────────────────────────────
// const LS_ACTIVE = "activeInvoiceTemplate";

// interface ActiveTemplateSettings {
//   themeLayout: string;
//   themeColor: string;
//   bgImageUrl: string;
//   bgOpacity: number;
//   misc?: { signatureUrl?: string };
// }

// function loadActiveTemplate(): ActiveTemplateSettings {
//   try {
//     const raw = localStorage.getItem(LS_ACTIVE);
//     if (!raw) return { themeLayout: "advanced-gst", themeColor: "#1a1d23", bgImageUrl: "", bgOpacity: 15 };
//     const t = JSON.parse(raw);
//     return {
//       themeLayout: t.themeLayout ?? "advanced-gst",
//       themeColor:  t.themeColor  ?? t.style?.themeColor ?? "#1a1d23",
//       bgImageUrl:  t.bgImageUrl  ?? t.ts?.backgroundUrl ?? "",
//       bgOpacity:   t.bgOpacity   ?? t.ts?.backgroundOpacity ?? 15,
//       misc:        t.misc,
//     };
//   } catch {
//     return { themeLayout: "advanced-gst", themeColor: "#1a1d23", bgImageUrl: "", bgOpacity: 15 };
//   }
// }

// // ─── TDS Rate data ────────────────────────────────────────────────────────────
// const DEFAULT_TDS_RATES = [
//   { label: "0.75% - 194C Payment to Contractor (individuals/ HUF) (Reduced)", rate: 0.75 },
//   { label: "1.0% - 194C Payment to Contractor (individuals/ HUF)", rate: 1.0 },
//   { label: "1.5% - 194C Payment to Contractor (others) (reduced)", rate: 1.5 },
//   { label: "2.0% - 194C Payment to Contractor (others)", rate: 2.0 },
//   { label: "2.0% - 194I Rent (Plant / Machinery / Equipment)", rate: 2.0 },
//   { label: "2.0% - 194J Professional Fees / Technical Services / Royalty (technical services)", rate: 2.0 },
//   { label: "3.75% - 194H Commission or Brokerage (Reduced)", rate: 3.75 },
//   { label: "5.0% - 194D Insurance Commission", rate: 5.0 },
//   { label: "7.5% - 194 Dividend (Reduced)", rate: 7.5 },
//   { label: "7.5% - 194J Professional Fees / Technical Services / Royalty (others) (reduced)", rate: 7.5 },
//   { label: "10.0% - 193 Interest on Securities", rate: 10.0 },
//   { label: "10.0% - 194 Dividend", rate: 10.0 },
//   { label: "10.0% - 194A Interest other than Interest on Securities (by banks)", rate: 10.0 },
//   { label: "10.0% - 194I Rent (Land & Building)", rate: 10.0 },
//   { label: "10.0% - 194J Professional Fees / Technical Services / Royalty (others)", rate: 10.0 },
//   { label: "10.0% - 194K Payment to resident units", rate: 10.0 },
//   { label: "30.0% - 194B Lottery / Crossword Puzzle", rate: 30.0 },
//   { label: "0.1% - 194Q Purchase of goods", rate: 0.1 },
//   { label: "2.0% - 194H Commission or Brokerage", rate: 2.0 },
// ];

// function loadTdsRates(): { label: string; rate: number }[] {
//   try {
//     const custom = JSON.parse(localStorage.getItem("customTdsRates") || "[]");
//     return [...DEFAULT_TDS_RATES, ...custom];
//   } catch { return DEFAULT_TDS_RATES; }
// }
// function persistCustomTdsRate(r: { label: string; rate: number }) {
//   try {
//     const custom = JSON.parse(localStorage.getItem("customTdsRates") || "[]");
//     localStorage.setItem("customTdsRates", JSON.stringify([...custom, r]));
//   } catch {}
// }

// // ─── Types ────────────────────────────────────────────────────────────────────
// interface BillItem {
//   name?: string;
//   description?: string;
//   hsn?: string;
//   qty: number;
//   unit?: string;
//   price: number;
//   discountPct?: number;
//   discountAmt?: number;
//   taxRate?: number;
//   taxLabel?: string;
//   discount_pct?: number;
//   discount_amt?: number;
//   tax_rate?: number;
//   amount: number;
// }

// interface SalesInvoice {
//   id: string;
//   invoiceNo: number;
//   invoiceDate: string;
//   amountReceived: number;
//   receivedAmount?: number;
//   outstandingAmount?: number;
//   totalAmount?: number;
//   party: { id?: number; name: string; mobile?: string; billingAddress?: string; gstin?: string } | null;
//   shipTo?: { name: string; mobile?: string; billingAddress?: string } | null;
//   billItems: BillItem[];
//   additionalCharges: { label?: string; amount: number }[];
//   discountPct: number;
//   discountAmt: number;
//   applyTCS: boolean;
//   tcsRate: number;
//   tcsLabel?: string;
//   tcsBase?: string;
//   roundOffAmt: number;
//   notes?: string;
//   termsConditions?: string;
//   eWayBillNo?: string;
//   challanNo?: string;
//   financedBy?: string;
//   salesman?: string;
//   warrantyPeriod?: string;
//   dueDate?: string;
//   showDueDate?: boolean;
//   status: string;
//   createdAt: string;
//   signatureUrl?: string;
//   showEmptySignatureBox?: boolean;
// }

// interface SavedTemplate {
//   id: string; name: string; themeColor: string;
//   style: { font: string; textSize: string; themeColor: string; borderColor: string; borderWidth: string; showLogo: boolean; logoUrl: string };
//   vis: { companyName: boolean; slogan: boolean; address: boolean; gstin: boolean; phone: boolean; pan: boolean; email: boolean };
//   misc: { showNotes: boolean; amountWords: boolean; showTerms: boolean; receiverSig: boolean; signatureUrl: string };
//   ts: { hsnSummary: boolean; showDesc: boolean; capitalize: boolean; cols: Record<string, boolean>; backgroundUrl: string; backgroundOpacity: number };
//   inv: { companyName: string; slogan: string; address: string; gstin: string; phone: string; email: string; pan: string; bank: string; ifsc: string; terms: string; bankName?: string; accountNo?: string; branch?: string };
// }
// interface Business {
//   companyName: string; address: string; gstin: string;
//   phone: string; email: string; pan: string; bank: string; ifsc: string;
//   bankName?: string; accountNo?: string; branch?: string;
// }
// interface Props {
//   invoice: SalesInvoice;
//   template: SavedTemplate | null;
//   business: Business;
//   onClose: () => void;
//   onEdit: () => void;
//   onPaymentSaved?: () => void;
//   onDuplicate?: () => void;
//   onDelete?: () => void;
//   onCancel?: () => void;
//   onCreditNote?: () => void;
//   onProfitDetails?: () => void;
//   onPrint?: () => void;
//   onDownload?: () => void;
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// function fmtDate(d: string) {
//   if (!d) return "";
//   return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
// }
// function fmtDateSlash(d: string) {
//   if (!d) return "";
//   const dt = new Date(d);
//   return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${dt.getFullYear()}`;
// }
// function fmtDateGB(iso: string) {
//   if (!iso) return "";
//   return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
// }
// function fmtC(n: number) {
//   return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
// }
// function fmtN(n: number) {
//   const safe = isNaN(n) || !isFinite(n) ? 0 : n;
//   return safe.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// }

// function getItemTaxable(item: BillItem): number {
//   const raw = item as any;
//   const rate = Number(raw.taxRate ?? raw.tax_rate ?? 0) || 0;
//   const amount = Number(item.amount) || 0;
//   if (rate > 0) return amount / (1 + rate / 100);
//   return amount;
// }
// function getItemTaxAmt(item: BillItem): number {
//   const amount = Number(item.amount) || 0;
//   const taxable = getItemTaxable(item);
//   const result = amount - taxable;
//   return isNaN(result) ? 0 : result;
// }
// function safeN(n: number): number {
//   return isNaN(n) || !isFinite(n) ? 0 : n;
// }

// function calcTotal(inv: Pick<SalesInvoice, "billItems"|"additionalCharges"|"discountPct"|"discountAmt"|"applyTCS"|"tcsRate"|"tcsBase"|"roundOffAmt">): number {
//   const items   = inv.billItems.reduce((s, i) => s + Number(i.amount), 0);
//   const charges = inv.additionalCharges.reduce((s, c) => s + Number(c.amount), 0);
//   const subtotal = items + charges;
//   const invDiscPct = Number(inv.discountPct) || 0;
//   const invDiscAmt = Number(inv.discountAmt) || 0;
//   const disc  = subtotal * (invDiscPct / 100) + invDiscAmt;
//   const after = subtotal - disc;
//   const tcsBase = inv.tcsBase === "Taxable Amount" ? subtotal : after;
//   const tcs     = inv.applyTCS ? tcsBase * ((Number(inv.tcsRate) || 0) / 100) : 0;
//   return Math.round((after + tcs + (Number(inv.roundOffAmt) || 0)) * 100) / 100;
// }
// function getAlreadyReceived(inv: SalesInvoice): number {
//   if (inv.receivedAmount != null) return Number(inv.receivedAmount);
//   return Number(inv.amountReceived ?? 0);
// }
// function numToWords(n: number): string {
//   const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten",
//     "Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
//   const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
//   if (n === 0) return "Zero";
//   function h(num: number): string {
//     if (num === 0) return "";
//     if (num < 20) return ones[num] + " ";
//     if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? " "+ones[num%10] : "") + " ";
//     if (num < 1000) return ones[Math.floor(num/100)] + " Hundred " + h(num%100);
//     if (num < 100000) return h(Math.floor(num/1000)) + "Thousand " + h(num%1000);
//     if (num < 10000000) return h(Math.floor(num/100000)) + "Lakh " + h(num%100000);
//     return h(Math.floor(num/10000000)) + "Crore " + h(num%10000000);
//   }
//   const intPart = Math.floor(n);
//   const decPart = Math.round((n - intPart) * 100);
//   let result = h(intPart).trim() + " Rupees";
//   if (decPart > 0) result += " and " + h(decPart).trim() + " Paise";
//   return result + " Only";
// }

// // ─── Add TDS Rate Modal ───────────────────────────────────────────────────────
// function AddTdsRateModal({ onClose, onSaved }: { onClose: () => void; onSaved: (r:{label:string;rate:number})=>void }) {
//   const [taxName, setTaxName] = useState("");
//   const [section, setSection] = useState("");
//   const [rate, setRate] = useState(0);
//   const canSave = taxName.trim().length > 0;
//   function handleSave() {
//     if (!canSave) return;
//     const label = `${rate}% - ${section.trim() ? section.trim()+" " : ""}${taxName.trim()}`;
//     const r = { label, rate };
//     persistCustomTdsRate(r);
//     onSaved(r);
//   }
//   const inp: React.CSSProperties = { width:"100%", padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box" };
//   return (
//     <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:4000,display:"flex",alignItems:"center",justifyContent:"center" }} onClick={onClose}>
//       <div style={{ background:"#fff",borderRadius:14,width:500,maxWidth:"95vw",boxShadow:"0 24px 60px rgba(0,0,0,.22)",fontFamily:"Segoe UI,sans-serif" }} onClick={e=>e.stopPropagation()}>
//         <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 24px",borderBottom:"1px solid #f3f4f6" }}>
//           <span style={{ fontSize:16,fontWeight:700,color:"#111827" }}>Add Tds Rate</span>
//           <button onClick={onClose} style={{ background:"none",border:"1px solid #e5e7eb",borderRadius:8,width:30,height:30,cursor:"pointer",color:"#374151",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
//         </div>
//         <div style={{ padding:"22px 24px",display:"flex",flexDirection:"column",gap:18 }}>
//           <div><label style={{ fontSize:13,color:"#374151",fontWeight:500,display:"block",marginBottom:6 }}>Tax name</label><input value={taxName} onChange={e=>setTaxName(e.target.value)} placeholder="Enter Tax Name" style={inp}/></div>
//           <div><label style={{ fontSize:13,color:"#374151",fontWeight:500,display:"block",marginBottom:6 }}>Enter Section Name</label><input value={section} onChange={e=>setSection(e.target.value)} placeholder="Enter Section Name" style={inp}/></div>
//           <div><label style={{ fontSize:13,color:"#374151",fontWeight:500,display:"block",marginBottom:6 }}>Enter Rate (in %)</label><input type="number" value={rate} onChange={e=>setRate(Number(e.target.value))} style={inp}/></div>
//         </div>
//         <div style={{ display:"flex",justifyContent:"flex-end",gap:10,padding:"16px 24px",borderTop:"1px solid #f3f4f6" }}>
//           <button onClick={onClose} style={{ padding:"9px 22px",border:"1px solid #e5e7eb",background:"#fff",borderRadius:8,fontSize:14,cursor:"pointer",color:"#374151",fontWeight:500 }}>Close</button>
//           <button onClick={handleSave} disabled={!canSave} style={{ padding:"9px 22px",background:canSave?"#4f46e5":"#c7d2fe",color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:canSave?"pointer":"not-allowed" }}>Save</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Record Payment Modal ─────────────────────────────────────────────────────
// const PM_LIST = ["Cash","UPI","Card","Netbanking","Bank Transfer","Cheque"] as const;

// function RecordPaymentModal({ invoice, onClose, onSaved }: { invoice:SalesInvoice; onClose:()=>void; onSaved:(updated:SalesInvoice)=>void }) {
//   const grandTotal = calcTotal(invoice);
//   const alreadyReceived = getAlreadyReceived(invoice);
//   const pending = invoice.outstandingAmount != null ? Number(invoice.outstandingAmount) : Math.max(0, grandTotal - alreadyReceived);
//   const [amount, setAmount] = useState(String(Math.round(pending*100)/100));
//   const [discount, setDiscount] = useState("0");
//   const [applyTds, setApplyTds] = useState(false);
//   const [tdsRates, setTdsRates] = useState<{label:string;rate:number}[]>(loadTdsRates);
//   const [selTds, setSelTds] = useState<{label:string;rate:number}|null>(null);
//   const [showTdsDrop, setShowTdsDrop] = useState(false);
//   const [showAddTds, setShowAddTds] = useState(false);
//   const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
//   const [payMode, setPayMode] = useState<typeof PM_LIST[number]>("Cash");
//   const [showModeDrop, setShowModeDrop] = useState(false);
//   const [notes, setNotes] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [saveError, setSaveError] = useState("");
//   const tdsRef = useRef<HTMLDivElement>(null);
//   const modeRef = useRef<HTMLDivElement>(null);
//   const dateRef = useRef<HTMLInputElement>(null);
//   useEffect(() => {
//     function h(e:MouseEvent) {
//       if (tdsRef.current && !tdsRef.current.contains(e.target as Node)) setShowTdsDrop(false);
//       if (modeRef.current && !modeRef.current.contains(e.target as Node)) setShowModeDrop(false);
//     }
//     document.addEventListener("mousedown",h);
//     return () => document.removeEventListener("mousedown",h);
//   },[]);
//   const amt = parseFloat(amount)||0;
//   const disc = parseFloat(discount)||0;
//   const tdsAmt = applyTds&&selTds ? pending*selTds.rate/100 : 0;
//   const balance = Math.max(0, pending-amt-disc-tdsAmt);
//   async function handleSave() {
//     if (amt<=0) { setSaveError("Please enter a valid amount."); return; }
//     const invoiceNumericId = Number(invoice.id);
//     if (isNaN(invoiceNumericId)||invoiceNumericId<=0) { setSaveError("Invalid invoice ID — cannot record payment."); return; }
//     const partyId: number|undefined = invoice.party?.id ?? (invoice as any).partyId ?? undefined;
//     if (!partyId) { setSaveError("Invoice has no party — cannot record payment."); return; }
//     setSaving(true); setSaveError("");
//     try {
//       // ✅ NEW
// const result = await api.post("/payments-in", data);
//       if (!res.ok) throw new Error(data.message??`Server error ${res.status}`);
//       const totalSettled = amt+disc+tdsAmt;
//       const newReceived = Math.min(alreadyReceived+amt,grandTotal);
//       const newOutstanding = Math.max(0,pending-totalSettled);
//       onSaved({...invoice,amountReceived:newReceived,receivedAmount:newReceived,outstandingAmount:newOutstanding,
//         status:newOutstanding<=0?"Paid":newReceived>0?"Partially Paid":"Unpaid"});
//     } catch(e:any) { setSaveError(e.message??"Something went wrong."); }
//     finally { setSaving(false); }
//   }
//   const dropItem = (label:string,active:boolean): React.CSSProperties => ({padding:"9px 14px",fontSize:13,color:active?"#4f46e5":"#374151",cursor:"pointer",background:active?"#ede9fe":"transparent",fontWeight:active?600:400,borderBottom:"1px solid #f9fafb"});
//   const inp: React.CSSProperties = {width:"100%",padding:"10px 12px",border:"1px solid #e5e7eb",borderRadius:8,fontSize:14,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"inherit"};
//   const dropBox: React.CSSProperties = {position:"absolute",top:"calc(100% + 4px)",left:0,right:0,zIndex:200,background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,boxShadow:"0 10px 28px rgba(0,0,0,.13)",maxHeight:250,overflowY:"auto"};
//   return (
//     <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center" }} onClick={onClose}>
//       <div style={{ background:"#fff",borderRadius:16,width:860,maxWidth:"97vw",maxHeight:"93vh",overflowY:"auto",boxShadow:"0 24px 70px rgba(0,0,0,.22)",fontFamily:"Segoe UI,sans-serif",display:"flex",flexDirection:"column" }} onClick={e=>e.stopPropagation()}>
//         <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 26px",borderBottom:"1px solid #f3f4f6",flexShrink:0 }}>
//           <span style={{ fontSize:16,fontWeight:700,color:"#111827" }}>Record Payment For Invoice #{invoice.invoiceNo}</span>
//           <button onClick={onClose} style={{ background:"none",border:"1px solid #e5e7eb",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16,color:"#374151",display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
//         </div>
//         <div style={{ display:"grid",gridTemplateColumns:"1fr 290px",gap:20,padding:"22px 26px",flex:1 }}>
//           <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
//             <div style={{ background:"#f9fafb",borderRadius:12,padding:"18px 18px 16px",border:"1px solid #e5e7eb" }}>
//               <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:14 }}>
//                 <div><label style={{ fontSize:12,color:"#6b7280",fontWeight:500,display:"block",marginBottom:5 }}>Amount Received</label><input type="number" value={amount} onChange={e=>setAmount(e.target.value)} style={inp}/></div>
//                 <div><label style={{ fontSize:12,color:"#6b7280",fontWeight:500,display:"block",marginBottom:5 }}>Payment In Discount</label><input type="number" value={discount} onChange={e=>setDiscount(e.target.value)} style={inp}/></div>
//               </div>
//               <label style={{ display:"flex",alignItems:"center",gap:8,fontSize:13.5,color:"#374151",cursor:"pointer",userSelect:"none",marginBottom:applyTds?12:0 }}>
//                 <input type="checkbox" checked={applyTds} onChange={e=>{setApplyTds(e.target.checked);if(!e.target.checked)setSelTds(null);}} style={{ width:16,height:16,accentColor:"#4f46e5",cursor:"pointer" }}/>Apply TDS
//               </label>
//               {applyTds && (
//                 <div ref={tdsRef} style={{ position:"relative" }}>
//                   <div onClick={()=>setShowTdsDrop(v=>!v)} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",border:"1px solid #e5e7eb",borderRadius:8,background:"#fff",cursor:"pointer",fontSize:13,color:selTds?"#111827":"#9ca3af",userSelect:"none" }}>
//                     <span style={{ flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:8 }}>{selTds?selTds.label:"Select Tds Rate"}</span>
//                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:14,height:14,flexShrink:0 }}><polyline points="6 9 12 15 18 9"/></svg>
//                   </div>
//                   {showTdsDrop && (
//                     <div style={dropBox}>
//                       {tdsRates.map((r,i)=>(
//                         <div key={i} style={dropItem(r.label,selTds?.label===r.label)} onMouseDown={e=>{e.preventDefault();setSelTds(r);setShowTdsDrop(false);}} onMouseEnter={e=>{if(selTds?.label!==r.label)(e.currentTarget as HTMLDivElement).style.background="#f5f3ff";}} onMouseLeave={e=>{if(selTds?.label!==r.label)(e.currentTarget as HTMLDivElement).style.background="";}}>
//                           {r.label}
//                         </div>
//                       ))}
//                       <div onMouseDown={e=>{e.preventDefault();setShowTdsDrop(false);setShowAddTds(true);}} style={{ padding:"10px 14px",fontSize:13,color:"#4f46e5",cursor:"pointer",fontWeight:600,borderTop:"1px solid #f3f4f6",background:"#fafafe" }}>+ Add New Tds Rate</div>
//                     </div>
//                   )}
//                   <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,color:"#6b7280",marginTop:10,padding:"0 2px" }}>
//                     <span>TDS Applicable on bill</span><span style={{ color:"#374151",fontWeight:500 }}>- {fmtC(tdsAmt)}</span>
//                   </div>
//                 </div>
//               )}
//             </div>
//             <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
//               <div>
//                 <label style={{ fontSize:12,color:"#6b7280",fontWeight:500,display:"block",marginBottom:5 }}>Payment Date</label>
//                 <div onClick={()=>dateRef.current?.showPicker?.()} style={{ display:"flex",alignItems:"center",gap:8,padding:"0 12px",border:"1px solid #e5e7eb",borderRadius:8,height:40,cursor:"pointer",background:"#fff",position:"relative" }}>
//                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:15,height:15,color:"#6b7280",flexShrink:0 }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
//                   <span style={{ flex:1,fontSize:13,color:"#111827" }}>{fmtDateGB(payDate)}</span>
//                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:13,height:13,color:"#9ca3af" }}><polyline points="6 9 12 15 18 9"/></svg>
//                   <input ref={dateRef} type="date" value={payDate} onChange={e=>setPayDate(e.target.value)} style={{ position:"absolute",opacity:0,width:0,height:0,pointerEvents:"none" }}/>
//                 </div>
//               </div>
//               <div ref={modeRef} style={{ position:"relative" }}>
//                 <label style={{ fontSize:12,color:"#6b7280",fontWeight:500,display:"block",marginBottom:5 }}>Payment Mode</label>
//                 <div onClick={()=>setShowModeDrop(v=>!v)} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 12px",border:`1px solid ${showModeDrop?"#4f46e5":"#e5e7eb"}`,borderRadius:8,height:40,cursor:"pointer",fontSize:13,color:"#111827",background:"#fff",userSelect:"none" }}>
//                   <span>{payMode}</span>
//                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:14,height:14,color:"#9ca3af" }}><polyline points="6 9 12 15 18 9"/></svg>
//                 </div>
//                 {showModeDrop && (
//                   <div style={{ ...dropBox,maxHeight:"none" }}>
//                     {PM_LIST.map(m=><div key={m} style={dropItem(m,payMode===m)} onMouseDown={e=>{e.preventDefault();setPayMode(m);setShowModeDrop(false);}} onMouseEnter={e=>{if(payMode!==m)(e.currentTarget as HTMLDivElement).style.background="#f5f3ff";}} onMouseLeave={e=>{if(payMode!==m)(e.currentTarget as HTMLDivElement).style.background=payMode===m?"#ede9fe":"";}}>{m}</div>)}
//                   </div>
//                 )}
//               </div>
//             </div>
//             <div>
//               <label style={{ fontSize:12,color:"#6b7280",fontWeight:500,display:"block",marginBottom:5 }}>Notes</label>
//               <textarea value={notes} onChange={e=>setNotes(e.target.value)} style={{ width:"100%",padding:"10px 12px",border:"1px solid #e5e7eb",borderRadius:8,fontSize:13,resize:"vertical",minHeight:90,outline:"none",fontFamily:"inherit",boxSizing:"border-box",background:"#fff" }}/>
//             </div>
//           </div>
//           <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
//             <div style={{ background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:16 }}>
//               <div style={{ fontSize:14,fontWeight:700,color:"#111827",marginBottom:8 }}>Invoice #{invoice.invoiceNo}</div>
//               <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,color:"#374151",marginBottom:4 }}><span>Invoice Amount</span><span style={{ fontWeight:600 }}>{fmtC(grandTotal)}</span></div>
//               {invoice.party?.name && <div style={{ fontSize:12,color:"#6b7280",marginBottom:3 }}>{invoice.party.name}</div>}
//               {invoice.dueDate && <div style={{ fontSize:12,color:"#6b7280" }}>Due Date: {fmtDateGB(invoice.dueDate)}</div>}
//             </div>
//             <div style={{ background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:16 }}>
//               <div style={{ fontSize:14,fontWeight:700,color:"#111827",marginBottom:12 }}>Record Payment Calculation</div>
//               <div style={{ border:"1px solid #f3f4f6",borderRadius:10,overflow:"hidden" }}>
//                 <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:600,padding:"10px 12px",borderBottom:"1px solid #f3f4f6",color:"#ef4444" }}><span>Invoice Pending Amt.</span><span>{fmtC(pending)}</span></div>
//                 <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,color:"#374151",padding:"10px 12px",borderBottom:"1px solid #f3f4f6" }}><span>Amount Received</span><span>{fmtC(amt)}</span></div>
//                 <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,color:"#374151",padding:"10px 12px",borderBottom:applyTds&&tdsAmt>0?"1px solid #f3f4f6":"none" }}><span>Payment In Discount</span><span>{fmtC(disc)}</span></div>
//                 {applyTds&&tdsAmt>0&&<div style={{ display:"flex",justifyContent:"space-between",fontSize:13,color:"#374151",padding:"10px 12px" }}><span>TDS Deducted</span><span>- {fmtC(tdsAmt)}</span></div>}
//                 <div style={{ display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:700,padding:"12px 12px",borderTop:"1px solid #f3f4f6" }}><span style={{ color:"#6b7280" }}>Balance Amount</span><span style={{ color:balance===0?"#16a34a":"#374151" }}>{fmtC(balance)}</span></div>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div style={{ borderTop:"1px solid #f3f4f6",flexShrink:0 }}>
//           {saveError&&<div style={{ margin:"10px 26px 0",padding:"9px 14px",background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:8,color:"#dc2626",fontSize:13 }}>{saveError}</div>}
//           <div style={{ display:"flex",justifyContent:"flex-end",gap:12,padding:"16px 26px" }}>
//             <button onClick={onClose} disabled={saving} style={{ padding:"9px 26px",border:"1px solid #e5e7eb",background:"#fff",borderRadius:8,fontSize:14,cursor:"pointer",color:"#374151",fontWeight:500 }}>Close</button>
//             <button onClick={handleSave} disabled={saving||amt<=0} style={{ padding:"9px 28px",background:saving||amt<=0?"#a5b4fc":"#4f46e5",color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:700,cursor:saving||amt<=0?"not-allowed":"pointer" }}>{saving?"Saving…":"Save"}</button>
//           </div>
//         </div>
//       </div>
//       {showAddTds&&<AddTdsRateModal onClose={()=>setShowAddTds(false)} onSaved={r=>{setTdsRates(prev=>[...prev,r]);setSelTds(r);setShowAddTds(false);}}/>}
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════════
// // INVOICE PAPER
// // ═══════════════════════════════════════════════════════════════════════════════

// interface InvoicePaperProps {
//   invoice: SalesInvoice;
//   business: Business;
//   template: SavedTemplate | null;
//   printRef: React.RefObject<HTMLDivElement>;
//   themeLayout: string;
//   themeColor: string;
//   bgImageUrl: string;
//   bgOpacity: number;
// }

// // ── Shared data preparation ──────────────────────────────────────────────────
// function useInvoiceData(invoice: SalesInvoice, business: Business, template: SavedTemplate | null) {
//   const companyName = template?.inv.companyName || business.companyName;
//   const address     = template?.inv.address     || business.address;
//   const gstin       = template?.inv.gstin       || business.gstin;
//   const phone       = business.phone;
//   const bank        = template?.inv.bank        || business.bank || "";
//   const ifsc        = template?.inv.ifsc        || business.ifsc || "";
//   const bankName    = template?.inv.bankName    || business.bankName || "";
//   const accountNo   = template?.inv.accountNo   || business.accountNo || "";
//   const branch      = template?.inv.branch      || business.branch || "";
//   const logoUrl     = template?.style?.logoUrl  || BILL_LOGO;
//   const showLogo    = true; // always show logo (static asset as fallback)
//   const sigUrl      = template?.misc?.signatureUrl || invoice.signatureUrl || BILL_SIGNATURE;
//   const defaultTerms = "1. Goods once sold will not be taken back or exchanged\n2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only";

//   const itemsSubtotal   = invoice.billItems.reduce((s, i) => s + (Number(i.amount) || 0), 0);
//   const chargesTotal    = invoice.additionalCharges.reduce((s, c) => s + (Number(c.amount) || 0), 0);
//   const discountAmt     = Number(invoice.discountAmt) || 0;
//   const roundOff        = Number(invoice.roundOffAmt) || 0;
//   const grandTotal      = safeN(itemsSubtotal + chargesTotal - discountAmt + roundOff);
//   const alreadyReceived = getAlreadyReceived(invoice);

//   const hsnMap: Record<string, { taxable:number; cgst:number; sgst:number; rate:number }> = {};
//   invoice.billItems.forEach(item => {
//     const raw = item as any;
//     const itemRate = Number(raw.taxRate ?? raw.tax_rate ?? 0) || 0;
//     const key = `${item.hsn||"-"}__${itemRate}`;
//     if (!hsnMap[key]) hsnMap[key] = { taxable:0, cgst:0, sgst:0, rate:itemRate };
//     const tx  = safeN(getItemTaxable(item));
//     const tax = safeN(getItemTaxAmt(item));
//     hsnMap[key].taxable += tx;
//     hsnMap[key].cgst    += safeN(tax / 2);
//     hsnMap[key].sgst    += safeN(tax / 2);
//   });
//   const hsnRows = Object.entries(hsnMap).map(([key, v]) => ({ hsn: key.split("__")[0], ...v }));

//   const taxRateGroups: Record<number, { cgst:number; sgst:number }> = {};
//   invoice.billItems.forEach(item => {
//     const raw = item as any;
//     const rate = Number(raw.taxRate ?? raw.tax_rate ?? 0) || 0;
//     if (!rate) return;
//     if (!taxRateGroups[rate]) taxRateGroups[rate] = { cgst:0, sgst:0 };
//     const tax = safeN(getItemTaxAmt(item));
//     taxRateGroups[rate].cgst += safeN(tax / 2);
//     taxRateGroups[rate].sgst += safeN(tax / 2);
//   });
//   const taxRows = Object.entries(taxRateGroups).map(([r, v]) => ({ rate:Number(r), ...v }));

//   return { companyName, address, gstin, phone, bank, ifsc, bankName, accountNo, branch,
//     logoUrl, showLogo, sigUrl, defaultTerms,
//     itemsSubtotal, chargesTotal, discountAmt, roundOff, grandTotal, alreadyReceived,
//     hsnRows, taxRows };
// }

// // ── Background overlay helper ────────────────────────────────────────────────
// function BgOverlay({ url, opacity }: { url: string; opacity: number }) {
//   if (!url) return null;
//   return (
//     <div style={{
//       position: "absolute", inset: 0, zIndex: 0,
//       backgroundImage: `url(${url})`,
//       backgroundSize: "cover", backgroundPosition: "center",
//       opacity: opacity / 100, pointerEvents: "none",
//     }} />
//   );
// }

// // ── Advanced GST (Tally) layout ──────────────────────────────────────────────
// function AdvancedGSTLayout({ invoice, business, template, printRef, themeColor, bgImageUrl, bgOpacity }: Omit<InvoicePaperProps,"themeLayout">) {
//   const { companyName, address, gstin, phone, bank, ifsc, bankName, accountNo, branch,
//     logoUrl, showLogo, sigUrl, defaultTerms,
//     discountAmt, roundOff, grandTotal, alreadyReceived, hsnRows, taxRows } = useInvoiceData(invoice, business, template);

//   const MIN_ROWS = 5;
//   const fillerCount = Math.max(0, MIN_ROWS - invoice.billItems.length);
//   const B = "1px solid #bbb";
//   const NCOLS = 8;

//   const TH: React.CSSProperties = { border: B, padding: "5px 8px", fontSize: 11, fontWeight: 700,
//     background: themeColor, color: "#fff", textAlign: "center" as const, whiteSpace: "nowrap" as const };
//   const TD: React.CSSProperties = { border: B, padding: "5px 8px", fontSize: 11, color: "#1a1a1a", verticalAlign: "top" as const };
//   const metaLabel: React.CSSProperties = { fontSize: 8.5, color: "#666", fontWeight: 700, textTransform: "uppercase" as const, marginBottom: 1 };
//   const metaValue: React.CSSProperties = { fontSize: 10.5, fontWeight: 700 };
//   const metaValueNormal: React.CSSProperties = { fontSize: 10.5 };

//   return (
//     <div ref={printRef} className="ivm-invoice-paper"
//       style={{ fontFamily: "Arial, sans-serif", fontSize: "11px", color: "#1a1a1a",
//         border: "1px solid #bbb", background: "#fff", padding: 0, overflow: "hidden",
//         width: "100%", maxWidth: "100%", margin: 0, position: "relative" }}>
//       <BgOverlay url={bgImageUrl} opacity={bgOpacity} />
//       <div style={{ position: "relative", zIndex: 1 }}>
//         {/* Row 1: TAX INVOICE badge */}
//         <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 12px", borderBottom: B }}>
//           <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.03em" }}>TAX INVOICE</span>
//           <span style={{ fontSize: 9.5, border: "1px solid #999", padding: "1px 7px", borderRadius: 2, color: "#444" }}>ORIGINAL FOR RECIPIENT</span>
//         </div>

//         {/* Row 2: Company | Invoice meta */}
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: B }}>
//           <div style={{ padding: "8px 12px", borderRight: B, display: "flex", alignItems: "flex-start", gap: 10 }}>
//             {/* LOGO */}
//             {showLogo && logoUrl && (
//               <img src={logoUrl} alt="Logo"
//                 style={{ height: 52, width: 52, objectFit: "contain", borderRadius: 4, flexShrink: 0, border: "1px solid #eee" }} />
//             )}
//             <div style={{ flex: 1 }}>
//               <div style={{ fontSize: 13, fontWeight: 800, color: themeColor, marginBottom: 2 }}>{companyName}</div>
//               <div style={{ fontSize: 10.5, color: "#333", marginBottom: 1 }}>{address}</div>
//               {phone && <div style={{ fontSize: 10.5, color: "#333", marginBottom: 1 }}>Phone: {phone}</div>}
//               <div style={{ fontSize: 10.5, color: "#333", marginBottom: 1 }}>G.S.T. No.: {gstin}</div>
//             </div>
//           </div>
//           <div>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: B }}>
//               <div style={{ padding: "4px 8px", borderRight: B }}><div style={metaLabel}>Invoice No.</div><div style={metaValue}>{invoice.invoiceNo}</div></div>
//               <div style={{ padding: "4px 8px", borderRight: B }}><div style={metaLabel}>Invoice Date</div><div style={metaValueNormal}>{fmtDateSlash(invoice.invoiceDate)}</div></div>
//               <div style={{ padding: "4px 8px" }}><div style={metaLabel}>Due Date</div><div style={metaValueNormal}>{invoice.dueDate ? fmtDateSlash(invoice.dueDate) : "-"}</div></div>
//             </div>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: B }}>
//               <div style={{ padding: "4px 8px", borderRight: B }}><div style={metaLabel}>Financed By</div><div style={metaValueNormal}>{invoice.financedBy || "-"}</div></div>
//               <div style={{ padding: "4px 8px", borderRight: B }}><div style={metaLabel}>Salesman</div><div style={metaValueNormal}>{invoice.salesman || "-"}</div></div>
//               <div style={{ padding: "4px 8px" }}><div style={metaLabel}>Challan No.</div><div style={metaValueNormal}>{invoice.challanNo || "-"}</div></div>
//             </div>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
//               <div style={{ padding: "4px 8px", borderRight: B }}><div style={metaLabel}>E-Way Bill No.</div><div style={metaValueNormal}>{invoice.eWayBillNo || "-"}</div></div>
//               <div style={{ padding: "4px 8px" }}><div style={metaLabel}>Warranty Period</div><div style={metaValueNormal}>{invoice.warrantyPeriod || "-"}</div></div>
//             </div>
//           </div>
//         </div>

//         {/* Row 3: Bill To / Ship To */}
//         <div style={{ display: "grid", gridTemplateColumns: invoice.shipTo ? "1fr 1fr" : "1fr", borderBottom: B }}>
//           <div style={{ padding: "7px 12px", borderRight: invoice.shipTo ? B : "none" }}>
//             <div style={{ fontSize: 9, fontWeight: 700, color: "#444", textTransform: "uppercase" as const, marginBottom: 4 }}>BILL TO</div>
//             {invoice.party ? (
//               <>
//                 <div style={{ fontSize: 11.5, fontWeight: 700, color: "#111", marginBottom: 2 }}>{invoice.party.name}</div>
//                 {invoice.party.billingAddress && <div style={{ fontSize: 10.5, color: "#333", lineHeight: 1.5, marginBottom: 1 }}>Address: {invoice.party.billingAddress}</div>}
//                 {invoice.party.gstin && <div style={{ fontSize: 10.5, color: "#333", marginBottom: 1 }}>GSTIN: {invoice.party.gstin}</div>}
//                 {invoice.party.mobile && <div style={{ fontSize: 10.5, color: "#333" }}>Mobile: {invoice.party.mobile}</div>}
//               </>
//             ) : <div style={{ fontSize: 10.5, color: "#aaa" }}>–</div>}
//           </div>
//           {invoice.shipTo && (
//             <div style={{ padding: "7px 12px" }}>
//               <div style={{ fontSize: 9, fontWeight: 700, color: "#444", textTransform: "uppercase" as const, marginBottom: 4 }}>SHIP TO</div>
//               <div style={{ fontSize: 11.5, fontWeight: 700, color: "#111", marginBottom: 2 }}>{invoice.shipTo.name}</div>
//               {invoice.shipTo.billingAddress && <div style={{ fontSize: 10.5, color: "#333", lineHeight: 1.5, marginBottom: 1 }}>Address: {invoice.shipTo.billingAddress}</div>}
//               {invoice.shipTo.mobile && <div style={{ fontSize: 10.5, color: "#333" }}>Mobile: {invoice.shipTo.mobile}</div>}
//             </div>
//           )}
//         </div>

//         {/* Items Table */}
//         <table style={{ width: "100%", borderCollapse: "collapse" }}>
//           <colgroup>
//             <col style={{ width: "5%" }}/><col style={{ width: "27%" }}/><col style={{ width: "9%" }}/>
//             <col style={{ width: "9%" }}/><col style={{ width: "11%" }}/><col style={{ width: "13%" }}/>
//             <col style={{ width: "9%" }}/><col style={{ width: "17%" }}/>
//           </colgroup>
//           <thead>
//             <tr>
//               {["S.NO.","ITEMS","HSN","QTY.","RATE","DISCOUNT","TAX","AMOUNT"].map((h,i) => (
//                 <th key={h} style={{ ...TH, textAlign: (i===1 ? "left" : "center") as any }}>{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {invoice.billItems.map((item, idx) => {
//               const raw = item as any;
//               const unitLabel = item.unit || "PCS";
//               const pct = Number(raw.discountPct ?? raw.discount_pct ?? 0) || 0;
//               const amt = Number(raw.discountAmt ?? raw.discount_amt ?? 0) || 0;
//               const base = Number(item.qty) * Number(item.price);
//               const taxRate = Number(raw.taxRate ?? raw.tax_rate ?? 0) || 0;
//               const taxLabel = taxRate > 0 ? (raw.taxLabel || `GST ${taxRate}%`) : "-";
//               return (
//                 <tr key={idx}>
//                   <td style={{ ...TD, textAlign: "center" as const }}>{idx + 1}</td>
//                   <td style={{ ...TD }}>
//                     <div style={{ fontWeight: 600 }}>{item.name || "Item"}</div>
//                     {item.description && <div style={{ fontSize: 9.5, color: "#555", marginTop: 1 }}>{item.description}</div>}
//                   </td>
//                   <td style={{ ...TD, textAlign: "center" as const }}>{item.hsn || "-"}</td>
//                   <td style={{ ...TD, textAlign: "center" as const }}>{item.qty} {unitLabel}</td>
//                   <td style={{ ...TD, textAlign: "right" as const }}>{Number(item.price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
//                   <td style={{ ...TD, textAlign: "center" as const }}>
//                     {pct > 0 ? <span>{pct}%<br/><span style={{ fontSize:10,color:"#555" }}>({fmtN(Math.round(base*(pct/100)*100)/100)})</span></span>
//                       : amt > 0 ? <span>{fmtN(amt)}</span> : <span>-</span>}
//                   </td>
//                   <td style={{ ...TD, textAlign: "center" as const }}>{taxRate > 0 ? taxLabel : "-"}</td>
//                   <td style={{ ...TD, textAlign: "right" as const, fontWeight: 600 }}>{fmtN(Number(item.amount))}</td>
//                 </tr>
//               );
//             })}
//             {Array.from({ length: fillerCount }).map((_,i) => (
//               <tr key={`filler${i}`} style={{ height: 22 }}>
//                 {Array.from({ length: NCOLS }).map((__,j) => <td key={j} style={{ ...TD, borderTop:"none",borderBottom:"none" }}/>)}
//               </tr>
//             ))}
//             <tr style={{ height:0 }}>
//               {Array.from({ length: NCOLS }).map((_,j) => <td key={j} style={{ ...TD,padding:0,height:0,borderTop:B,borderBottom:"none" }}/>)}
//             </tr>
//             {taxRows.map((row,i) => [
//               <tr key={`cgst-${i}`}>
//                 <td colSpan={5} style={{ border:"none",borderRight:B,padding:"4px 8px",fontSize:10.5,fontStyle:"italic" as const,color:"#333",textAlign:"right" as const }}>CGST @{row.rate/2}%</td>
//                 <td style={{ ...TD,textAlign:"center" as const,color:"#555",fontSize:10.5 }}>-</td>
//                 <td style={{ ...TD,textAlign:"center" as const,color:"#555",fontSize:10.5 }}>-</td>
//                 <td style={{ ...TD,textAlign:"right" as const,fontWeight:600 }}>₹ {fmtN(row.cgst)}</td>
//               </tr>,
//               <tr key={`sgst-${i}`}>
//                 <td colSpan={5} style={{ border:"none",borderRight:B,padding:"4px 8px",fontSize:10.5,fontStyle:"italic" as const,color:"#333",textAlign:"right" as const }}>SGST @{row.rate/2}%</td>
//                 <td style={{ ...TD,textAlign:"center" as const,color:"#555",fontSize:10.5 }}>-</td>
//                 <td style={{ ...TD,textAlign:"center" as const,color:"#555",fontSize:10.5 }}>-</td>
//                 <td style={{ ...TD,textAlign:"right" as const,fontWeight:600 }}>₹ {fmtN(row.sgst)}</td>
//               </tr>,
//             ])}
//             {invoice.additionalCharges.map((c,i) => (
//               <tr key={`charge-${i}`}>
//                 <td colSpan={NCOLS-1} style={{ ...TD,textAlign:"right" as const,fontSize:10.5 }}>{c.label||"Additional Charge"}</td>
//                 <td style={{ ...TD,textAlign:"right" as const,fontWeight:600 }}>₹ {fmtN(Number(c.amount))}</td>
//               </tr>
//             ))}
//             {discountAmt > 0 && (
//               <tr>
//                 <td colSpan={NCOLS-1} style={{ ...TD,textAlign:"right" as const,fontSize:10.5 }}>Discount</td>
//                 <td style={{ ...TD,textAlign:"right" as const,fontWeight:600,color:"#16a34a" }}>- ₹ {fmtN(discountAmt)}</td>
//               </tr>
//             )}
//             {roundOff !== 0 && (
//               <tr>
//                 <td colSpan={NCOLS-1} style={{ ...TD,textAlign:"right" as const,fontSize:10.5 }}>Round Off</td>
//                 <td style={{ ...TD,textAlign:"right" as const,fontWeight:600 }}>{roundOff>0?"+":""}₹ {fmtN(Math.abs(roundOff))}</td>
//               </tr>
//             )}
//             <tr>
//               <td colSpan={6} style={{ ...TD,fontWeight:700,textAlign:"center" as const,fontSize:11,letterSpacing:"0.06em",background:"#f0f0f0",textTransform:"uppercase" as const }}>TOTAL</td>
//               <td style={{ ...TD,textAlign:"center" as const,fontWeight:600,background:"#f0f0f0",color:"#555" }}>-</td>
//               <td style={{ ...TD,textAlign:"right" as const,fontWeight:700,fontSize:11,background:"#f0f0f0" }}>₹ {fmtN(grandTotal)}</td>
//             </tr>
//             <tr>
//               <td colSpan={NCOLS-1} style={{ ...TD,fontWeight:700,textAlign:"right" as const,fontSize:11,textTransform:"uppercase" as const }}>RECEIVED AMOUNT</td>
//               <td style={{ ...TD,textAlign:"right" as const,fontWeight:700,fontSize:11 }}>₹ {fmtN(alreadyReceived)}</td>
//             </tr>
//             <tr>
//               <td colSpan={NCOLS-1} style={{ ...TD,fontWeight:700,textAlign:"right" as const,fontSize:11,textTransform:"uppercase" as const }}>BALANCE AMOUNT</td>
//               <td style={{ ...TD,textAlign:"right" as const,fontWeight:700,fontSize:11,color:safeN(grandTotal-alreadyReceived)>0?"#dc2626":"#16a34a" }}>₹ {fmtN(safeN(grandTotal-alreadyReceived))}</td>
//             </tr>
//           </tbody>
//         </table>

//         {/* HSN Summary */}
//         {hsnRows.length > 0 && (
//           <table style={{ width:"100%",borderCollapse:"collapse" }}>
//             <thead>
//               <tr>
//                 <th style={{ ...TD,fontWeight:700,background:"#f0f0f0",textAlign:"left" as const,width:"12%" }} rowSpan={2}>HSN/SAC</th>
//                 <th style={{ ...TD,fontWeight:700,background:"#f0f0f0",width:"16%",textAlign:"right" as const }} rowSpan={2}>Taxable Value</th>
//                 <th style={{ ...TD,fontWeight:700,background:"#f0f0f0",textAlign:"center" as const }} colSpan={2}>CGST</th>
//                 <th style={{ ...TD,fontWeight:700,background:"#f0f0f0",textAlign:"center" as const }} colSpan={2}>SGST</th>
//                 <th style={{ ...TD,fontWeight:700,background:"#f0f0f0",width:"16%",textAlign:"right" as const }} rowSpan={2}>Total Tax Amount</th>
//               </tr>
//               <tr>
//                 {["Rate","Amount","Rate","Amount"].map(h => <th key={h} style={{ ...TD,fontWeight:700,background:"#f0f0f0",fontSize:10,textAlign:"center" as const }}>{h}</th>)}
//               </tr>
//             </thead>
//             <tbody>
//               {hsnRows.map((row,i) => (
//                 <tr key={i}>
//                   <td style={{ ...TD }}>{row.hsn}</td>
//                   <td style={{ ...TD,textAlign:"right" as const }}>{fmtN(row.taxable)}</td>
//                   <td style={{ ...TD,textAlign:"center" as const }}>{row.rate/2}%</td>
//                   <td style={{ ...TD,textAlign:"right" as const }}>{fmtN(row.cgst)}</td>
//                   <td style={{ ...TD,textAlign:"center" as const }}>{row.rate/2}%</td>
//                   <td style={{ ...TD,textAlign:"right" as const }}>{fmtN(row.sgst)}</td>
//                   <td style={{ ...TD,textAlign:"right" as const,fontWeight:600 }}>₹ {fmtN(row.cgst+row.sgst)}</td>
//                 </tr>
//               ))}
//               <tr style={{ background:"#f0f0f0" }}>
//                 <td style={{ ...TD,fontWeight:700 }}>Total</td>
//                 <td style={{ ...TD,textAlign:"right" as const,fontWeight:600 }}>{fmtN(hsnRows.reduce((s,r)=>s+r.taxable,0))}</td>
//                 <td style={{ ...TD }}/>
//                 <td style={{ ...TD,textAlign:"right" as const,fontWeight:600 }}>{fmtN(hsnRows.reduce((s,r)=>s+r.cgst,0))}</td>
//                 <td style={{ ...TD }}/>
//                 <td style={{ ...TD,textAlign:"right" as const,fontWeight:600 }}>{fmtN(hsnRows.reduce((s,r)=>s+r.sgst,0))}</td>
//                 <td style={{ ...TD,textAlign:"right" as const,fontWeight:700 }}>₹ {fmtN(hsnRows.reduce((s,r)=>s+r.cgst+r.sgst,0))}</td>
//               </tr>
//             </tbody>
//           </table>
//         )}

//         {/* Total in words */}
//         <div style={{ padding:"6px 12px",borderTop:B,borderBottom:B,fontSize:11 }}>
//           <strong>Total Amount (in words): </strong>{numToWords(grandTotal)}
//         </div>

//         {/* Notes | Bank */}
//         <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",borderBottom:B }}>
//           <div style={{ borderRight:B,padding:"8px 12px",minHeight:64 }}>
//             <div style={{ fontSize:10.5,fontWeight:700,color:"#222",marginBottom:4 }}>Notes</div>
//             <div style={{ fontSize:10.5,color:"#333",lineHeight:1.6,whiteSpace:"pre-line" as const }}>{invoice.notes||""}</div>
//           </div>
//           <div style={{ padding:"8px 12px",minHeight:64 }}>
//             <div style={{ fontSize:10.5,fontWeight:700,color:"#222",marginBottom:4 }}>Bank Details</div>
//             <div style={{ fontSize:10.5,color:"#333",lineHeight:1.9 }}>
//               {bank && <div><span style={{ display:"inline-block",minWidth:90 }}>Name:</span>{bank}</div>}
//               {bankName && <div><span style={{ display:"inline-block",minWidth:90 }}>Bank:</span>{bankName}</div>}
//               {accountNo && <div><span style={{ display:"inline-block",minWidth:90 }}>A/C No.:</span>{accountNo}</div>}
//               {branch && <div><span style={{ display:"inline-block",minWidth:90 }}>Branch:</span>{branch}</div>}
//               {ifsc && <div><span style={{ display:"inline-block",minWidth:90 }}>IFSC:</span>{ifsc}</div>}
//             </div>
//           </div>
//         </div>

//         {/* Terms */}
//         <div style={{ padding:"8px 12px",borderBottom:B }}>
//           <div style={{ fontSize:10.5,fontWeight:700,color:"#222",marginBottom:4 }}>Terms and Conditions</div>
//           <div style={{ fontSize:10.5,color:"#333",lineHeight:1.7,whiteSpace:"pre-line" as const }}>{invoice.termsConditions||defaultTerms}</div>
//         </div>

//         {/* Signature — larger box */}
//         <div style={{ display:"flex",justifyContent:"flex-end",padding:"10px 14px 12px",minHeight:100 }}>
//           <div style={{ textAlign:"center",minWidth:160 }}>
//             {sigUrl
//               ? <img src={sigUrl} alt="Signature" style={{ height:54,maxWidth:160,objectFit:"contain",marginBottom:4,display:"block",margin:"0 auto 4px" }}/>
//               : invoice.showEmptySignatureBox
//                 ? <div style={{ height:48,width:140,border:"1px dashed #bbb",marginBottom:4,margin:"0 auto 4px" }}/>
//                 : <div style={{ height:48,marginBottom:4 }}/>
//             }
//             <div style={{ fontSize:10,color:"#333",marginTop:4 }}>Authorised Signatory For<br/><strong style={{ color:themeColor }}>{companyName}</strong></div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Luxury layout (matches PDF 5 exactly) ────────────────────────────────────
// function LuxuryLayout({ invoice, business, template, printRef, themeColor, bgImageUrl, bgOpacity }: Omit<InvoicePaperProps,"themeLayout">) {
//   const { companyName, address, gstin, bank, ifsc, bankName, accountNo, branch,
//     logoUrl, showLogo, sigUrl, defaultTerms,
//     grandTotal, alreadyReceived, hsnRows } = useInvoiceData(invoice, business, template);
//   const fmt = fmtN;
//   const BD = "1px solid #ccc";

//   // Bank fields — label left, value right (no colon, plain text)
//   const bankPairs = [
//     ["Name",       bank],
//     ["IFSC",       ifsc],
//     ["Account No", accountNo],
//     ["Bank Name",  bankName],
//     ["Branch",     branch],
//   ].filter(([,v]) => v) as [string,string][];

//   return (
//     <div ref={printRef} className="ivm-invoice-paper"
//       style={{ fontFamily:"Arial,sans-serif",fontSize:"11px",color:"#1a1a1a",background:"#fff",position:"relative",overflow:"hidden",width:"100%",maxWidth:"100%" }}>
//       <BgOverlay url={bgImageUrl} opacity={bgOpacity} />
//       <div style={{ position:"relative",zIndex:1 }}>

//         {/* ── Row 1: Company name left | TAX INVOICE right ── */}
//         <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"14px 18px 10px",borderBottom:BD }}>
//           <div style={{ display:"flex",alignItems:"flex-start",gap:10 }}>
//             {showLogo && logoUrl && (
//               <img src={logoUrl} alt="Logo" style={{ height:52,width:52,objectFit:"contain",borderRadius:4,border:"1px solid #eee",flexShrink:0 }}/>
//             )}
//             <div>
//               <div style={{ fontSize:18,fontWeight:800,color:"#111",marginBottom:2 }}>{companyName}</div>
//               {address && <div style={{ fontSize:10,color:"#555" }}>{address}</div>}
//               {gstin && <div style={{ fontSize:10,color:"#555" }}>GSTIN: {gstin}</div>}
//             </div>
//           </div>
//           <div style={{ textAlign:"right",flexShrink:0 }}>
//             <div style={{ fontSize:15,fontWeight:700,color:"#111",letterSpacing:"0.8px" }}>TAX INVOICE</div>
//           </div>
//         </div>

//         {/* ── Row 2: Invoice meta — each field in its own bordered box ── */}
//         <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",borderBottom:BD,fontSize:10 }}>
//           {[
//             {label:"Invoice No.",    val: String(invoice.invoiceNo)},
//             {label:"Invoice Date",   val: fmtDateSlash(invoice.invoiceDate)},
//             {label:"Due Date",       val: invoice.dueDate ? fmtDateSlash(invoice.dueDate) : "-"},
//           ].map((f,i) => (
//             <div key={i} style={{ padding:"6px 12px",borderRight:i<2?BD:"none" }}>
//               <div style={{ fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase" as const,marginBottom:2 }}>{f.label}</div>
//               <div style={{ fontWeight:600,color:"#111" }}>{f.val}</div>
//             </div>
//           ))}
//         </div>
//         {/* second meta row: Financed By, Salesman, Challan, Warranty */}
//         {(invoice.financedBy||invoice.salesman||invoice.challanNo||invoice.warrantyPeriod) && (
//           <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderBottom:BD,fontSize:10 }}>
//             {[
//               {label:"Financed By",    val: invoice.financedBy||"-"},
//               {label:"Salesman",       val: invoice.salesman||"-"},
//               {label:"Challan No.",    val: invoice.challanNo||"-"},
//               {label:"Warranty Period",val: invoice.warrantyPeriod||"-"},
//             ].map((f,i) => (
//               <div key={i} style={{ padding:"6px 12px",borderRight:i<3?BD:"none" }}>
//                 <div style={{ fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase" as const,marginBottom:2 }}>{f.label}</div>
//                 <div style={{ fontWeight:600,color:"#111" }}>{f.val}</div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* ── Row 3: Bill To ── */}
//         <div style={{ padding:"8px 18px",borderBottom:BD,fontSize:10 }}>
//           <div style={{ fontSize:10,fontWeight:700,color:"#555",textTransform:"uppercase" as const,marginBottom:4,letterSpacing:"0.5px" }}>Bill To</div>
//           <div style={{ fontWeight:700,fontSize:12,color:"#111" }}>{invoice.party?.name||"-"}</div>
//           {invoice.party?.billingAddress && <div style={{ color:"#444" }}>{invoice.party.billingAddress}</div>}
//           {invoice.party?.mobile && <div style={{ color:"#444" }}>Mobile {invoice.party.mobile}</div>}
//           {invoice.party?.gstin && <div style={{ color:"#444" }}>GSTIN: {invoice.party.gstin}</div>}
//         </div>

//         {/* ── Items table ── */}
//         <table style={{ width:"100%",borderCollapse:"collapse",fontSize:10 }}>
//           <thead>
//             <tr style={{ borderBottom:BD,borderTop:BD }}>
//               {["No","Items","Qty.","Rate","Disc.","Tax","Total"].map((h,i) => (
//                 <th key={h} style={{ padding:"7px 10px",fontWeight:700,color:"#333",textAlign:i>=2?"right" as const:"left" as const,fontSize:10,background:"#f8f8f8" }}>{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {invoice.billItems.map((item,i) => {
//               const raw=item as any;
//               const pct=Number(raw.discountPct??raw.discount_pct??0)||0;
//               const disc=Number(raw.discountAmt??raw.discount_amt??0)||0;
//               const taxRate=Number(raw.taxRate??raw.tax_rate??0)||0;
//               return (
//                 <tr key={i} style={{ borderBottom:"1px solid #eee" }}>
//                   <td style={{ padding:"7px 10px" }}>{i+1}</td>
//                   <td style={{ padding:"7px 10px" }}>{item.name||"Item"}</td>
//                   <td style={{ padding:"7px 10px",textAlign:"right" }}>{item.qty} {item.unit||"PCS"}</td>
//                   <td style={{ padding:"7px 10px",textAlign:"right" }}>{fmt(Number(item.price))}</td>
//                   <td style={{ padding:"7px 10px",textAlign:"right" }}>
//                     {pct>0 ? <span>{pct}%<br/><span style={{fontSize:9,color:"#777"}}>({fmt(Math.round(Number(item.qty)*Number(item.price)*(pct/100)*100)/100)})</span></span>
//                       : disc>0 ? fmt(disc) : "-"}
//                   </td>
//                   <td style={{ padding:"7px 10px",textAlign:"right" }}>{taxRate>0?`GST ${taxRate}%`:"-"}</td>
//                   <td style={{ padding:"7px 10px",textAlign:"right",fontWeight:600 }}>{fmt(Number(item.amount))}</td>
//                 </tr>
//               );
//             })}
//           </tbody>
//           <tfoot>
//             <tr style={{ borderTop:BD,borderBottom:BD,background:"#f8f8f8" }}>
//               <td style={{ padding:"7px 10px",fontWeight:700 }}>SUBTOTAL</td>
//               <td></td>
//               <td style={{ padding:"7px 10px",textAlign:"right",fontWeight:700 }}>{invoice.billItems.reduce((s,i)=>s+Number(i.qty),0)}</td>
//               <td></td>
//               <td style={{ padding:"7px 10px",textAlign:"right",fontWeight:700 }}>₹ {fmt(invoice.billItems.reduce((s,i)=>{const r=i as any;return s+(Number(r.discountAmt??r.discount_amt??0)||0)},0))}</td>
//               <td style={{ padding:"7px 10px",textAlign:"right",fontWeight:700 }}>₹ {fmt(hsnRows.reduce((s,r)=>s+r.cgst+r.sgst,0))}</td>
//               <td style={{ padding:"7px 10px",textAlign:"right",fontWeight:700 }}>₹ {fmt(grandTotal)}</td>
//             </tr>
//           </tfoot>
//         </table>

//         {/* ── Footer: Terms+Bank LEFT | Totals+Signature RIGHT ── */}
//         <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",borderTop:BD }}>
//           {/* LEFT */}
//           <div style={{ padding:"12px 18px",borderRight:BD,fontSize:10 }}>
//             <div style={{ fontWeight:700,fontSize:11,marginBottom:6 }}>Terms & Conditions</div>
//             <div style={{ color:"#555",lineHeight:1.7,marginBottom:14,whiteSpace:"pre-line" as const }}>{invoice.termsConditions||defaultTerms}</div>
//             <div style={{ fontWeight:700,fontSize:11,marginBottom:6 }}>Bank Details</div>
//             {bankPairs.map(([k,v]) => (
//               <div key={k} style={{ display:"flex",marginBottom:3 }}>
//                 <span style={{ minWidth:80,color:"#444",flexShrink:0 }}>{k}</span>
//                 <span style={{ color:"#111",fontWeight:500 }}>{v}</span>
//               </div>
//             ))}
//           </div>
//           {/* RIGHT */}
//           <div style={{ padding:"12px 18px",fontSize:10 }}>
//             {/* Tax breakdown */}
//             {hsnRows.length>0 && hsnRows.map((r,i) => (
//               <div key={i} style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
//                 <span style={{ color:"#555" }}>CGST @{r.rate/2}% + SGST @{r.rate/2}%</span>
//                 <span>₹ {fmt(r.cgst+r.sgst)}</span>
//               </div>
//             ))}
//             <div style={{ display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:11,borderTop:BD,paddingTop:5,marginTop:5 }}>
//               <span>Total Amount</span><span>₹ {fmt(grandTotal)}</span>
//             </div>
//             <div style={{ display:"flex",justifyContent:"space-between",marginTop:3,color:"#555" }}>
//               <span>Received Amount</span><span>₹ {fmt(alreadyReceived)}</span>
//             </div>
//             <div style={{ display:"flex",justifyContent:"space-between",fontWeight:700,marginTop:3,color:safeN(grandTotal-alreadyReceived)>0?"#dc2626":"#16a34a" }}>
//               <span>Balance</span><span>₹ {fmt(safeN(grandTotal-alreadyReceived))}</span>
//             </div>
//             <div style={{ marginTop:8,fontSize:10 }}>
//               <div style={{ fontWeight:700,marginBottom:2 }}>Total Amount (in words)</div>
//               <div style={{ color:"#555" }}>{numToWords(grandTotal)}</div>
//             </div>
//             {/* Signature */}
//             <div style={{ marginTop:16,minHeight:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",borderTop:"1px dashed #ccc",paddingTop:12 }}>
//               <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",width:"100%" }}>
//                 {sigUrl && <img src={sigUrl} alt="sig" style={{ maxHeight:70,maxWidth:160,objectFit:"contain",display:"block" }}/>}
//               </div>
//               <div style={{ textAlign:"center",fontSize:10,marginTop:10 }}>
//                 <div style={{ color:"#555",marginBottom:2 }}>Signature</div>
//                 <div style={{ fontWeight:700,color:"#111" }}>{companyName}</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Stylish layout ────────────────────────────────────────────────────────────
// function StylishLayout({ invoice, business, template, printRef, themeColor, bgImageUrl, bgOpacity }: Omit<InvoicePaperProps,"themeLayout">) {
//   const { companyName, address, gstin, bank, ifsc, bankName, accountNo, branch,
//     logoUrl, showLogo, sigUrl, defaultTerms,
//     discountAmt, roundOff, grandTotal, alreadyReceived, hsnRows } = useInvoiceData(invoice, business, template);
//   const accent = themeColor === "#000000" ? "#1a1a1a" : themeColor;
//   const fmt = fmtN;

//   const bankFields = [
//     ["Name:", bank], ["Bank:", bankName], ["A/C No:", accountNo], ["Branch:", branch], ["IFSC Code:", ifsc]
//   ].filter(([, v]) => v) as [string, string][];

//   return (
//     <div ref={printRef} className="ivm-invoice-paper"
//       style={{ fontFamily:"Arial,sans-serif",fontSize:"11px",background:"#fff",position:"relative",overflow:"hidden",width:"100%",maxWidth:"100%",padding:"14px 18px 16px" }}>
//       <BgOverlay url={bgImageUrl} opacity={bgOpacity} />
//       <div style={{ position:"relative",zIndex:1 }}>
//         {/* Badges */}
//         <div style={{ display:"flex",gap:8,marginBottom:10,fontSize:10 }}>
//           <span style={{ border:"1px solid #333",padding:"2px 8px",fontWeight:700 }}>TAX INVOICE</span>
//           <span style={{ border:"1px solid #aaa",padding:"2px 8px",color:"#555" }}>ORIGINAL FOR RECIPIENT</span>
//         </div>

//         {/* Logo + company name */}
//         <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:10 }}>
//           {showLogo && logoUrl && (
//             <img src={logoUrl} alt="Logo"
//               style={{ height:56,width:56,objectFit:"contain",borderRadius:4,border:"1px solid #eee",flexShrink:0 }} />
//           )}
//           <div style={{ fontSize:22,fontWeight:700,color:accent,letterSpacing:"0.3px" }}>{companyName}</div>
//         </div>
//         <div style={{ height:3,background:accent,marginBottom:0 }}/>

//         {/* Invoice meta */}
//         <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",background:"#f5f5f5",padding:"8px 12px",borderBottom:"1px solid #ddd",fontSize:10 }}>
//           <div><strong>Invoice No.:</strong> {invoice.invoiceNo}</div>
//           <div><strong>Invoice Date:</strong> {fmtDateSlash(invoice.invoiceDate)}</div>
//           <div><strong>Due Date:</strong> {invoice.dueDate?fmtDateSlash(invoice.dueDate):"-"}</div>
//         </div>

//         {/* Bill To + details */}
//         <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",padding:"8px 12px",borderBottom:"1px solid #ddd",gap:16,fontSize:10 }}>
//           <div>
//             <div style={{ fontWeight:700,fontSize:11,marginBottom:2 }}>BILL TO</div>
//             <div style={{ fontWeight:700,fontSize:12 }}>{invoice.party?.name||"-"}</div>
//             {invoice.party?.billingAddress && <div style={{ color:"#555" }}>{invoice.party.billingAddress}</div>}
//             {invoice.party?.mobile && <div style={{ color:"#555" }}>Mobile: {invoice.party.mobile}</div>}
//           </div>
//           <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",rowGap:3 }}>
//             {invoice.financedBy && <><div style={{ fontWeight:700 }}>Financed By</div><div style={{ textAlign:"right" }}>{invoice.financedBy}</div></>}
//             {invoice.salesman && <><div style={{ fontWeight:700 }}>Salesman</div><div style={{ textAlign:"right" }}>{invoice.salesman}</div></>}
//             {invoice.challanNo && <><div style={{ fontWeight:700 }}>Challan No.</div><div style={{ textAlign:"right" }}>{invoice.challanNo}</div></>}
//             {invoice.warrantyPeriod && <><div style={{ fontWeight:700 }}>Warranty</div><div style={{ textAlign:"right" }}>{invoice.warrantyPeriod}</div></>}
//           </div>
//         </div>

//         {/* Items table */}
//         <table style={{ width:"100%",borderCollapse:"collapse",fontSize:10 }}>
//           <thead>
//             <tr style={{ borderBottom:`2px solid ${accent}` }}>
//               {["ITEMS","QTY.","RATE","DISC.","TAX","AMOUNT"].map((h,i) => (
//                 <th key={h} style={{ padding:"7px 8px",fontWeight:700,textAlign:i>0?"right":"left",background:"none",border:"none",fontSize:10 }}>{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {invoice.billItems.map((item,i) => {
//               const raw=item as any;
//               const pct=Number(raw.discountPct??raw.discount_pct??0)||0;
//               const disc=Number(raw.discountAmt??raw.discount_amt??0)||0;
//               const taxRate=Number(raw.taxRate??raw.tax_rate??0)||0;
//               return (
//                 <tr key={i} style={{ borderBottom:"1px solid #e5e5e5" }}>
//                   <td style={{ padding:"6px 8px" }}>{item.name||"Item"}{item.description&&<div style={{ fontSize:9,color:"#777",marginTop:1 }}>{item.description}</div>}</td>
//                   <td style={{ padding:"6px 8px",textAlign:"right" }}>{item.qty} {item.unit||"PCS"}</td>
//                   <td style={{ padding:"6px 8px",textAlign:"right" }}>{fmt(Number(item.price))}</td>
//                   <td style={{ padding:"6px 8px",textAlign:"right" }}>{pct>0?<span>{pct}%<br/><span style={{ fontSize:9,color:"#777" }}>({fmt(Math.round(Number(item.qty)*Number(item.price)*(pct/100)*100)/100)})</span></span>:disc>0?fmt(disc):"-"}</td>
//                   <td style={{ padding:"6px 8px",textAlign:"right" }}>{taxRate>0?`GST ${taxRate}%`:"-"}</td>
//                   <td style={{ padding:"6px 8px",textAlign:"right",fontWeight:600 }}>{fmt(Number(item.amount))}</td>
//                 </tr>
//               );
//             })}
//           </tbody>
//           <tfoot>
//             <tr style={{ borderTop:`2px solid ${accent}`,borderBottom:"1px solid #ccc" }}>
//               <td style={{ padding:"6px 8px",fontWeight:700 }}>SUBTOTAL</td>
//               <td style={{ padding:"6px 8px",textAlign:"right",fontWeight:700 }}>{invoice.billItems.reduce((s,i)=>s+Number(i.qty),0)}</td>
//               <td></td>
//               <td style={{ padding:"6px 8px",textAlign:"right",fontWeight:700 }}>₹ {fmt(invoice.billItems.reduce((s,i)=>{const r=i as any;return s+(Number(r.discountAmt??r.discount_amt??0)||0)},0))}</td>
//               <td style={{ padding:"6px 8px",textAlign:"right",fontWeight:700 }}>₹ {fmt(hsnRows.reduce((s,r)=>s+r.cgst+r.sgst,0))}</td>
//               <td style={{ padding:"6px 8px",textAlign:"right",fontWeight:700 }}>₹ {fmt(grandTotal)}</td>
//             </tr>
//           </tfoot>
//         </table>

//         {/* Footer */}
//         <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",marginTop:8,gap:16,fontSize:10 }}>
//           <div>
//             <div style={{ fontWeight:700,fontSize:11,marginBottom:6 }}>BANK DETAILS</div>
//             {bankFields.map(([k,v]) => (
//               <div key={k} style={{ display:"flex",gap:6,marginBottom:3 }}>
//                 <span style={{ minWidth:72,color:"#555",flexShrink:0 }}>{k}</span>
//                 <span style={{ fontWeight:500 }}>{v}</span>
//               </div>
//             ))}
//             <div style={{ fontWeight:700,fontSize:11,marginTop:10,marginBottom:4 }}>TERMS AND CONDITIONS</div>
//             <div style={{ color:"#555",lineHeight:1.6 }}>{invoice.termsConditions||defaultTerms}</div>
//           </div>
//           <div>
//             {hsnRows.map((r,i) => (
//               <div key={i} style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
//                 <span>CGST+SGST @{r.rate/2}%+{r.rate/2}%</span><span>₹ {fmt(r.cgst+r.sgst)}</span>
//               </div>
//             ))}
//             {discountAmt>0 && <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}><span>Discount</span><span style={{ color:"#16a34a" }}>- ₹ {fmt(discountAmt)}</span></div>}
//             {roundOff!==0 && <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}><span>Round Off</span><span>{roundOff>0?"+":""}₹ {fmt(Math.abs(roundOff))}</span></div>}
//             <div style={{ display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:12,borderTop:"1px solid #333",paddingTop:4,marginTop:4 }}>
//               <span>Total Amount</span><span>₹ {fmt(grandTotal)}</span>
//             </div>
//             <div style={{ display:"flex",justifyContent:"space-between",marginTop:3,color:"#555" }}>
//               <span>Received Amount</span><span>₹ {fmt(alreadyReceived)}</span>
//             </div>
//             <div style={{ textAlign:"right",marginTop:4 }}>
//               <div style={{ fontSize:10,color:"#555" }}>Total Amount (in words)</div>
//               <div style={{ fontWeight:500 }}>{numToWords(grandTotal)}</div>
//             </div>
//             {/* Signature box — enlarged */}
//             <div style={{ border:"1px solid #ccc",borderRadius:2,marginTop:12,minHeight:100,display:"flex",flexDirection:"column",alignItems:"flex-end",justifyContent:"space-between",padding:"10px 8px 6px" }}>
//               <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"flex-end",width:"100%" }}>
//                 {sigUrl && <img src={sigUrl} alt="sig" style={{ maxHeight:60,maxWidth:140,objectFit:"contain",display:"block" }}/>}
//               </div>
//               <div style={{ textAlign:"right",fontSize:9,marginTop:8 }}>
//                 <div style={{ fontWeight:700 }}>AUTHORISED SIGNATORY FOR</div>
//                 <div style={{ color:accent }}>{companyName}</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Simple layout ─────────────────────────────────────────────────────────────
// function SimpleLayout({ invoice, business, template, printRef, themeColor, bgImageUrl, bgOpacity }: Omit<InvoicePaperProps,"themeLayout">) {
//   const { companyName, address, gstin, bank, ifsc, bankName, accountNo, branch,
//     logoUrl, showLogo, sigUrl, defaultTerms,
//     discountAmt, roundOff, grandTotal, alreadyReceived, hsnRows } = useInvoiceData(invoice, business, template);
//   const fmt = fmtN;
//   const accent = themeColor && themeColor !== "#000000" ? themeColor : "#868e96";

//   const bankFields = [
//     ["Name", bank], ["Bank", bankName], ["A/C No.", accountNo], ["Branch", branch], ["IFSC Code", ifsc]
//   ].filter(([, v]) => v) as [string, string][];

//   return (
//     <div ref={printRef} className="ivm-invoice-paper"
//       style={{ fontFamily:"Arial,sans-serif", fontSize:"11px", background:"#fff", position:"relative", overflow:"hidden", width:"100%", maxWidth:"100%", padding:"18px 20px 20px" }}>
//       <BgOverlay url={bgImageUrl} opacity={bgOpacity} />
//       <div style={{ position:"relative", zIndex:1 }}>

//         {/* Header badges */}
//         <div style={{ display:"flex", gap:8, marginBottom:10, fontSize:10 }}>
//           <span style={{ border:"1px solid #333", padding:"2px 8px", fontWeight:700 }}>TAX INVOICE</span>
//           <span style={{ border:"1px solid #aaa", padding:"2px 8px", color:"#555" }}>ORIGINAL FOR RECIPIENT</span>
//         </div>

//         {/* Company block */}
//         <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:10, paddingBottom:10, borderBottom:`2px solid ${accent}` }}>
//           {showLogo && logoUrl && (
//             <img src={logoUrl} alt="Logo" style={{ height:52, width:52, objectFit:"contain", borderRadius:4, border:"1px solid #eee", flexShrink:0 }} />
//           )}
//           <div style={{ flex:1 }}>
//             <div style={{ fontSize:18, fontWeight:800, color:accent }}>{companyName}</div>
//             <div style={{ fontSize:10, color:"#555", marginTop:3 }}>{address}</div>
//             <div style={{ fontSize:10, color:"#555" }}>GSTIN: {gstin}</div>
//           </div>
//           {/* Invoice meta top-right */}
//           <div style={{ textAlign:"right", fontSize:10, flexShrink:0 }}>
//             <div style={{ fontWeight:700, fontSize:13, color:"#111", marginBottom:4 }}>Invoice #{invoice.invoiceNo}</div>
//             <div style={{ color:"#555" }}>Date: {fmtDateSlash(invoice.invoiceDate)}</div>
//             {invoice.dueDate && <div style={{ color:"#555" }}>Due: {fmtDateSlash(invoice.dueDate)}</div>}
//           </div>
//         </div>

//         {/* Meta row */}
//         {(invoice.financedBy || invoice.salesman || invoice.challanNo || invoice.warrantyPeriod) && (
//           <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 20px", fontSize:10, padding:"6px 0", borderBottom:"1px solid #e5e5e5", marginBottom:10 }}>
//             {invoice.financedBy && <span><strong>Financed By:</strong> {invoice.financedBy}</span>}
//             {invoice.salesman && <span><strong>Salesman:</strong> {invoice.salesman}</span>}
//             {invoice.challanNo && <span><strong>Challan No.:</strong> {invoice.challanNo}</span>}
//             {invoice.warrantyPeriod && <span><strong>Warranty:</strong> {invoice.warrantyPeriod}</span>}
//           </div>
//         )}

//         {/* Bill To */}
//         <div style={{ fontSize:10, marginBottom:12, padding:"8px 10px", background:"#f9f9f9", borderRadius:4, borderLeft:`3px solid ${accent}` }}>
//           <div style={{ fontWeight:700, color:accent, marginBottom:3, textTransform:"uppercase" as const, fontSize:9, letterSpacing:"0.5px" }}>Bill To</div>
//           <div style={{ fontWeight:700, fontSize:12, color:"#111" }}>{invoice.party?.name || "-"}</div>
//           {invoice.party?.billingAddress && <div style={{ color:"#555" }}>{invoice.party.billingAddress}</div>}
//           {invoice.party?.mobile && <div style={{ color:"#555" }}>Mobile: {invoice.party.mobile}</div>}
//           {invoice.party?.gstin && <div style={{ color:"#555" }}>GSTIN: {invoice.party.gstin}</div>}
//         </div>

//         {/* Items table */}
//         <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10, marginBottom:10 }}>
//           <thead>
//             <tr style={{ borderBottom:`2px solid ${accent}`, borderTop:`1px solid ${accent}` }}>
//               {["S.No", "Item", "Qty", "Rate", "Disc.", "Tax", "Amount"].map((h,i) => (
//                 <th key={h} style={{ padding:"6px 8px", fontWeight:700, textAlign: i>=2 ? "right" : "left", fontSize:10 }}>{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {invoice.billItems.map((item, idx) => {
//               const raw = item as any;
//               const pct = Number(raw.discountPct ?? raw.discount_pct ?? 0) || 0;
//               const disc = Number(raw.discountAmt ?? raw.discount_amt ?? 0) || 0;
//               const taxRate = Number(raw.taxRate ?? raw.tax_rate ?? 0) || 0;
//               return (
//                 <tr key={idx} style={{ borderBottom:"1px solid #eee" }}>
//                   <td style={{ padding:"5px 8px" }}>{idx+1}</td>
//                   <td style={{ padding:"5px 8px" }}>
//                     <div style={{ fontWeight:600 }}>{item.name || "Item"}</div>
//                     {item.description && <div style={{ fontSize:9, color:"#777" }}>{item.description}</div>}
//                   </td>
//                   <td style={{ padding:"5px 8px", textAlign:"right" }}>{item.qty} {item.unit || "PCS"}</td>
//                   <td style={{ padding:"5px 8px", textAlign:"right" }}>{fmt(Number(item.price))}</td>
//                   <td style={{ padding:"5px 8px", textAlign:"right" }}>{pct>0?<span>{pct}%<br/><span style={{fontSize:9,color:"#777"}}>({fmt(Math.round(Number(item.qty)*Number(item.price)*(pct/100)*100)/100)})</span></span>:disc>0?fmt(disc):"-"}</td>
//                   <td style={{ padding:"5px 8px", textAlign:"right" }}>{taxRate>0?`${taxRate}%`:"-"}</td>
//                   <td style={{ padding:"5px 8px", textAlign:"right", fontWeight:600 }}>{fmt(Number(item.amount))}</td>
//                 </tr>
//               );
//             })}
//           </tbody>
//           <tfoot>
//             <tr style={{ borderTop:`2px solid ${accent}` }}>
//               <td colSpan={6} style={{ padding:"6px 8px", textAlign:"right", fontWeight:700, fontSize:11 }}>Grand Total</td>
//               <td style={{ padding:"6px 8px", textAlign:"right", fontWeight:700, fontSize:11 }}>₹ {fmt(grandTotal)}</td>
//             </tr>
//             <tr>
//               <td colSpan={6} style={{ padding:"4px 8px", textAlign:"right", fontSize:10, color:"#555" }}>Amount Received</td>
//               <td style={{ padding:"4px 8px", textAlign:"right", fontSize:10 }}>₹ {fmt(alreadyReceived)}</td>
//             </tr>
//             <tr>
//               <td colSpan={6} style={{ padding:"4px 8px", textAlign:"right", fontSize:10, fontWeight:700 }}>Balance</td>
//               <td style={{ padding:"4px 8px", textAlign:"right", fontSize:10, fontWeight:700, color:safeN(grandTotal-alreadyReceived)>0?"#dc2626":"#16a34a" }}>₹ {fmt(safeN(grandTotal-alreadyReceived))}</td>
//             </tr>
//           </tfoot>
//         </table>

//         {/* Footer: Bank + Terms + Summary + Signature */}
//         <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, fontSize:10 }}>
//           <div>
//             <div style={{ fontWeight:700, fontSize:11, marginBottom:5, color:accent }}>BANK DETAILS</div>
//             {bankFields.map(([k,v]) => (
//               <div key={k} style={{ display:"flex", gap:6, marginBottom:2 }}>
//                 <span style={{ minWidth:72, color:"#777", flexShrink:0 }}>{k}</span>
//                 <span style={{ fontWeight:500, color:"#222" }}>{v}</span>
//               </div>
//             ))}
//             <div style={{ fontWeight:700, fontSize:11, marginTop:10, marginBottom:4, color:accent }}>TERMS AND CONDITIONS</div>
//             <div style={{ color:"#555", lineHeight:1.6, whiteSpace:"pre-line" as const }}>{invoice.termsConditions||defaultTerms}</div>
//           </div>
//           <div>
//             {hsnRows.map((r,i) => (
//               <div key={i} style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
//                 <span style={{ color:"#555" }}>CGST+SGST @{r.rate/2}%+{r.rate/2}%</span>
//                 <span>₹ {fmt(r.cgst+r.sgst)}</span>
//               </div>
//             ))}
//             {discountAmt>0 && <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}><span style={{ color:"#555" }}>Discount</span><span style={{ color:"#16a34a" }}>- ₹ {fmt(discountAmt)}</span></div>}
//             {roundOff!==0 && <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}><span style={{ color:"#555" }}>Round Off</span><span>{roundOff>0?"+":""}₹ {fmt(Math.abs(roundOff))}</span></div>}
//             <div style={{ display:"flex", justifyContent:"space-between", fontWeight:700, fontSize:11, borderTop:`1px solid ${accent}`, paddingTop:4, marginTop:4 }}>
//               <span>Total Amount</span><span style={{ color:accent }}>₹ {fmt(grandTotal)}</span>
//             </div>
//             <div style={{ fontSize:10, marginTop:6 }}>
//               <div style={{ fontWeight:700, color:"#333" }}>Amount in words</div>
//               <div style={{ color:"#555" }}>{numToWords(grandTotal)}</div>
//             </div>
//             {/* Signature */}
//             <div style={{ marginTop:14, minHeight:100, display:"flex", flexDirection:"column", alignItems:"flex-end", justifyContent:"space-between", borderTop:"1px dashed #ccc", paddingTop:10 }}>
//               <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"flex-end", width:"100%" }}>
//                 {sigUrl && <img src={sigUrl} alt="sig" style={{ maxHeight:60, maxWidth:140, objectFit:"contain" }}/>}
//               </div>
//               <div style={{ textAlign:"right", fontSize:9, marginTop:8 }}>
//                 <div style={{ fontWeight:700 }}>Authorised Signatory For</div>
//                 <div style={{ color:accent }}>{companyName}</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Modern layout ─────────────────────────────────────────────────────────────
// function ModernLayout({ invoice, business, template, printRef, themeColor, bgImageUrl, bgOpacity }: Omit<InvoicePaperProps,"themeLayout">) {
//   const { companyName, address, gstin, bank, ifsc, bankName, accountNo, branch,
//     logoUrl, showLogo, sigUrl, defaultTerms,
//     discountAmt, roundOff, grandTotal, alreadyReceived, hsnRows } = useInvoiceData(invoice, business, template);
//   const fmt = fmtN;
//   const accent = themeColor && themeColor !== "#000000" ? themeColor : "#e8590c";

//   const bankFields = [
//     ["Name", bank], ["Bank", bankName], ["A/C No.", accountNo], ["Branch", branch], ["IFSC Code", ifsc]
//   ].filter(([, v]) => v) as [string, string][];

//   return (
//     <div ref={printRef} className="ivm-invoice-paper"
//       style={{ fontFamily:"Arial,sans-serif", fontSize:"11px", background:"#fff", position:"relative", overflow:"hidden", width:"100%", maxWidth:"100%" }}>
//       <BgOverlay url={bgImageUrl} opacity={bgOpacity} />
//       <div style={{ position:"relative", zIndex:1 }}>

//         {/* Colored top banner */}
//         <div style={{ background:accent, padding:"16px 22px", color:"#fff", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
//           <div style={{ display:"flex", alignItems:"center", gap:14 }}>
//             {showLogo && logoUrl && (
//               <img src={logoUrl} alt="Logo" style={{ height:56, width:56, objectFit:"contain", borderRadius:4, border:"2px solid rgba(255,255,255,0.4)", flexShrink:0, background:"rgba(255,255,255,0.15)" }} />
//             )}
//             <div>
//               <div style={{ fontSize:20, fontWeight:800, letterSpacing:"0.3px" }}>{companyName}</div>
//               <div style={{ fontSize:10, opacity:0.85, marginTop:3 }}>{address}</div>
//               <div style={{ fontSize:10, opacity:0.85 }}>GSTIN: {gstin}</div>
//             </div>
//           </div>
//           <div style={{ textAlign:"right", flexShrink:0 }}>
//             <div style={{ fontSize:16, fontWeight:700, letterSpacing:"1px", opacity:0.9 }}>TAX INVOICE</div>
//             <div style={{ fontSize:11, marginTop:4 }}>
//               <div><strong>Invoice No.:</strong> {invoice.invoiceNo}</div>
//               <div><strong>Date:</strong> {fmtDateSlash(invoice.invoiceDate)}</div>
//               {invoice.dueDate && <div><strong>Due Date:</strong> {fmtDateSlash(invoice.dueDate)}</div>}
//             </div>
//           </div>
//         </div>

//         {/* Meta info row */}
//         {(invoice.financedBy || invoice.salesman || invoice.challanNo || invoice.warrantyPeriod || invoice.eWayBillNo) && (
//           <div style={{ background:`${accent}18`, padding:"6px 22px", fontSize:10, display:"flex", flexWrap:"wrap", gap:"6px 22px", borderBottom:`1px solid ${accent}30` }}>
//             {invoice.financedBy && <span><strong>Financed By:</strong> {invoice.financedBy}</span>}
//             {invoice.salesman && <span><strong>Salesman:</strong> {invoice.salesman}</span>}
//             {invoice.challanNo && <span><strong>Challan No.:</strong> {invoice.challanNo}</span>}
//             {invoice.warrantyPeriod && <span><strong>Warranty:</strong> {invoice.warrantyPeriod}</span>}
//             {invoice.eWayBillNo && <span><strong>E-Way Bill:</strong> {invoice.eWayBillNo}</span>}
//           </div>
//         )}

//         {/* Bill To row */}
//         <div style={{ padding:"10px 22px", borderBottom:`1px solid #eee`, display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, fontSize:10 }}>
//           <div>
//             <div style={{ fontWeight:700, color:accent, fontSize:9, textTransform:"uppercase" as const, letterSpacing:"0.5px", marginBottom:4 }}>Bill To</div>
//             <div style={{ fontWeight:700, fontSize:12, color:"#111" }}>{invoice.party?.name || "-"}</div>
//             {invoice.party?.billingAddress && <div style={{ color:"#555" }}>{invoice.party.billingAddress}</div>}
//             {invoice.party?.mobile && <div style={{ color:"#555" }}>Mobile: {invoice.party.mobile}</div>}
//             {invoice.party?.gstin && <div style={{ color:"#555" }}>GSTIN: {invoice.party.gstin}</div>}
//           </div>
//           {invoice.shipTo && (
//             <div>
//               <div style={{ fontWeight:700, color:accent, fontSize:9, textTransform:"uppercase" as const, letterSpacing:"0.5px", marginBottom:4 }}>Ship To</div>
//               <div style={{ fontWeight:700, fontSize:12, color:"#111" }}>{invoice.shipTo.name}</div>
//               {invoice.shipTo.billingAddress && <div style={{ color:"#555" }}>{invoice.shipTo.billingAddress}</div>}
//               {invoice.shipTo.mobile && <div style={{ color:"#555" }}>Mobile: {invoice.shipTo.mobile}</div>}
//             </div>
//           )}
//         </div>

//         {/* Items table */}
//         <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10 }}>
//           <thead>
//             <tr style={{ background:accent, color:"#fff" }}>
//               {["S.No","Item","HSN","Qty","Rate","Disc.","Tax","Amount"].map((h,i) => (
//                 <th key={h} style={{ padding:"7px 8px", fontWeight:700, textAlign: i>=3?"right":"left", fontSize:10, color:"#fff" }}>{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {invoice.billItems.map((item, idx) => {
//               const raw = item as any;
//               const pct = Number(raw.discountPct ?? raw.discount_pct ?? 0) || 0;
//               const disc = Number(raw.discountAmt ?? raw.discount_amt ?? 0) || 0;
//               const taxRate = Number(raw.taxRate ?? raw.tax_rate ?? 0) || 0;
//               return (
//                 <tr key={idx} style={{ background: idx%2===0?"#fff":`${accent}08`, borderBottom:"1px solid #eee" }}>
//                   <td style={{ padding:"6px 8px" }}>{idx+1}</td>
//                   <td style={{ padding:"6px 8px" }}>
//                     <div style={{ fontWeight:600 }}>{item.name || "Item"}</div>
//                     {item.description && <div style={{ fontSize:9, color:"#777" }}>{item.description}</div>}
//                   </td>
//                   <td style={{ padding:"6px 8px" }}>{item.hsn||"-"}</td>
//                   <td style={{ padding:"6px 8px", textAlign:"right" }}>{item.qty} {item.unit||"PCS"}</td>
//                   <td style={{ padding:"6px 8px", textAlign:"right" }}>{fmt(Number(item.price))}</td>
//                   <td style={{ padding:"6px 8px", textAlign:"right" }}>{pct>0?<span>{pct}%<br/><span style={{fontSize:9,color:"#777"}}>({fmt(Math.round(Number(item.qty)*Number(item.price)*(pct/100)*100)/100)})</span></span>:disc>0?fmt(disc):"-"}</td>
//                   <td style={{ padding:"6px 8px", textAlign:"right" }}>{taxRate>0?`${taxRate}%`:"-"}</td>
//                   <td style={{ padding:"6px 8px", textAlign:"right", fontWeight:600 }}>{fmt(Number(item.amount))}</td>
//                 </tr>
//               );
//             })}
//           </tbody>
//           <tfoot>
//             <tr style={{ background:`${accent}18`, borderTop:`2px solid ${accent}` }}>
//               <td colSpan={7} style={{ padding:"6px 8px", textAlign:"right", fontWeight:700 }}>Grand Total</td>
//               <td style={{ padding:"6px 8px", textAlign:"right", fontWeight:700, color:accent }}>₹ {fmt(grandTotal)}</td>
//             </tr>
//             <tr>
//               <td colSpan={7} style={{ padding:"4px 8px", textAlign:"right", fontSize:10, color:"#555" }}>Amount Received</td>
//               <td style={{ padding:"4px 8px", textAlign:"right", fontSize:10 }}>₹ {fmt(alreadyReceived)}</td>
//             </tr>
//             <tr>
//               <td colSpan={7} style={{ padding:"4px 8px", textAlign:"right", fontSize:10, fontWeight:700 }}>Balance Due</td>
//               <td style={{ padding:"4px 8px", textAlign:"right", fontSize:10, fontWeight:700, color:safeN(grandTotal-alreadyReceived)>0?"#dc2626":"#16a34a" }}>₹ {fmt(safeN(grandTotal-alreadyReceived))}</td>
//             </tr>
//           </tfoot>
//         </table>

//         {/* Footer */}
//         <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, padding:"12px 22px", fontSize:10, borderTop:`2px solid ${accent}` }}>
//           <div>
//             <div style={{ fontWeight:700, fontSize:11, color:accent, marginBottom:5 }}>BANK DETAILS</div>
//             {bankFields.map(([k,v]) => (
//               <div key={k} style={{ display:"flex", gap:6, marginBottom:3 }}>
//                 <span style={{ minWidth:72, color:"#777", flexShrink:0 }}>{k}</span>
//                 <span style={{ fontWeight:500, color:"#222" }}>{v}</span>
//               </div>
//             ))}
//             <div style={{ fontWeight:700, fontSize:11, color:accent, marginTop:10, marginBottom:4 }}>TERMS AND CONDITIONS</div>
//             <div style={{ color:"#555", lineHeight:1.6, whiteSpace:"pre-line" as const }}>{invoice.termsConditions||defaultTerms}</div>
//           </div>
//           <div>
//             {hsnRows.map((r,i) => (
//               <div key={i} style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
//                 <span style={{ color:"#555" }}>CGST+SGST @{r.rate/2}%+{r.rate/2}%</span>
//                 <span>₹ {fmt(r.cgst+r.sgst)}</span>
//               </div>
//             ))}
//             {discountAmt>0 && <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}><span style={{ color:"#555" }}>Discount</span><span style={{ color:"#16a34a" }}>- ₹ {fmt(discountAmt)}</span></div>}
//             {roundOff!==0 && <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}><span style={{ color:"#555" }}>Round Off</span><span>{roundOff>0?"+":""}₹ {fmt(Math.abs(roundOff))}</span></div>}
//             <div style={{ display:"flex", justifyContent:"space-between", fontWeight:700, fontSize:12, borderTop:`1px solid ${accent}`, paddingTop:4, marginTop:4 }}>
//               <span>Total Amount</span><span style={{ color:accent }}>₹ {fmt(grandTotal)}</span>
//             </div>
//             <div style={{ fontSize:10, marginTop:6 }}>
//               <div style={{ fontWeight:700, color:"#333" }}>Amount in words</div>
//               <div style={{ color:"#555" }}>{numToWords(grandTotal)}</div>
//             </div>
//             {/* Signature */}
//             <div style={{ marginTop:14, minHeight:100, display:"flex", flexDirection:"column", alignItems:"flex-end", justifyContent:"space-between", borderTop:"1px dashed #ccc", paddingTop:10 }}>
//               <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"flex-end", width:"100%" }}>
//                 {sigUrl && <img src={sigUrl} alt="sig" style={{ maxHeight:60, maxWidth:140, objectFit:"contain" }}/>}
//               </div>
//               <div style={{ textAlign:"right", fontSize:9, marginTop:8 }}>
//                 <div style={{ fontWeight:700 }}>Authorised Signature for</div>
//                 <div style={{ color:accent }}>{companyName}</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Billbook A5 layout (matches PDF 4 exactly) ───────────────────────────────
// function BillbookA5Layout({ invoice, business, template, printRef, themeColor, bgImageUrl, bgOpacity }: Omit<InvoicePaperProps,"themeLayout">) {
//   const { companyName, address, gstin, bank, ifsc, bankName, accountNo, branch,
//     logoUrl, showLogo, sigUrl, defaultTerms,
//     grandTotal, alreadyReceived } = useInvoiceData(invoice, business, template);
//   const fmt = fmtN;
//   const BD = "1px solid #ccc";
//   const accent = themeColor && themeColor !== "#000000" ? themeColor : "#2c5282";

//   const bankPairs = [
//     ["Name",       bank],
//     ["IFSC Code",  ifsc],
//     ["Account No", accountNo],
//     ["Bank",       bankName || branch],
//   ].filter(([,v]) => v) as [string,string][];

//   return (
//     <div ref={printRef} className="ivm-invoice-paper"
//       style={{ fontFamily:"Arial,sans-serif",fontSize:"11px",color:"#1a1a1a",background:"#fff",position:"relative",overflow:"hidden",width:"100%",maxWidth:"100%" }}>
//       <BgOverlay url={bgImageUrl} opacity={bgOpacity} />
//       <div style={{ position:"relative",zIndex:1 }}>

//         {/* ── Row 1: Company name + Logo | Bill To ── */}
//         <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",borderBottom:BD }}>
//           {/* Company cell */}
//           <div style={{ padding:"10px 14px",borderRight:BD,display:"flex",alignItems:"flex-start",gap:10 }}>
//             {showLogo && logoUrl && (
//               <img src={logoUrl} alt="Logo" style={{ height:44,width:44,objectFit:"contain",borderRadius:4,border:"1px solid #eee",flexShrink:0 }}/>
//             )}
//             <div>
//               <div style={{ fontSize:14,fontWeight:800,color:accent,marginBottom:2 }}>{companyName}</div>
//               {address && <div style={{ fontSize:9.5,color:"#555" }}>{address}</div>}
//               {gstin && <div style={{ fontSize:9.5,color:"#555" }}>GSTIN: {gstin}</div>}
//             </div>
//           </div>
//           {/* Bill To cell */}
//           <div style={{ padding:"10px 14px" }}>
//             <div style={{ fontSize:9,fontWeight:700,color:"#888",textTransform:"uppercase" as const,marginBottom:4,letterSpacing:"0.5px" }}>Bill To</div>
//             <div style={{ fontSize:13,fontWeight:800,color:"#111",marginBottom:2 }}>{invoice.party?.name||"-"}</div>
//             {invoice.party?.billingAddress && <div style={{ fontSize:9.5,color:"#555" }}>{invoice.party.billingAddress}</div>}
//             {invoice.party?.mobile && <div style={{ fontSize:9.5,color:"#555" }}>Mobile: {invoice.party.mobile}</div>}
//             {invoice.party?.gstin && <div style={{ fontSize:9.5,color:"#555" }}>GSTIN: {invoice.party.gstin}</div>}
//           </div>
//         </div>

//         {/* ── Row 2: Invoice meta grid ── */}
//         <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderBottom:BD,fontSize:10 }}>
//           {[
//             {label:"Invoice No.",    val: String(invoice.invoiceNo)},
//             {label:"Invoice Date",   val: fmtDateSlash(invoice.invoiceDate)},
//             {label:"Due Date",       val: invoice.dueDate ? fmtDateSlash(invoice.dueDate) : "-"},
//             {label:"Financed By",    val: invoice.financedBy||"-"},
//           ].map((f,i) => (
//             <div key={i} style={{ padding:"5px 10px",borderRight:i<3?BD:"none" }}>
//               <div style={{ fontSize:8.5,fontWeight:700,color:"#888",textTransform:"uppercase" as const,marginBottom:1 }}>{f.label}</div>
//               <div style={{ fontWeight:600,color:"#111",fontSize:10 }}>{f.val}</div>
//             </div>
//           ))}
//         </div>
//         {(invoice.salesman||invoice.challanNo||invoice.warrantyPeriod||invoice.eWayBillNo) && (
//           <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderBottom:BD,fontSize:10 }}>
//             {[
//               {label:"Salesman",       val: invoice.salesman||"-"},
//               {label:"Challan No.",    val: invoice.challanNo||"-"},
//               {label:"Warranty Period",val: invoice.warrantyPeriod||"-"},
//               {label:"E-Way Bill",     val: invoice.eWayBillNo||"-"},
//             ].map((f,i) => (
//               <div key={i} style={{ padding:"5px 10px",borderRight:i<3?BD:"none" }}>
//                 <div style={{ fontSize:8.5,fontWeight:700,color:"#888",textTransform:"uppercase" as const,marginBottom:1 }}>{f.label}</div>
//                 <div style={{ fontWeight:600,color:"#111",fontSize:10 }}>{f.val}</div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* ── Items table — NO Tax column (Bill of Supply style) ── */}
//         <table style={{ width:"100%",borderCollapse:"collapse",fontSize:10 }}>
//           <thead>
//             <tr style={{ borderBottom:BD,background:"#f7f7f7" }}>
//               {["S.NO.","ITEMS","QTY.","RATE","DISC.","AMOUNT"].map((h,i) => (
//                 <th key={h} style={{ padding:"6px 10px",fontWeight:700,color:"#333",textAlign:i>=2?"right" as const:"left" as const,fontSize:10 }}>{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {invoice.billItems.map((item,i) => {
//               const raw=item as any;
//               const pct=Number(raw.discountPct??raw.discount_pct??0)||0;
//               const disc=Number(raw.discountAmt??raw.discount_amt??0)||0;
//               return (
//                 <tr key={i} style={{ borderBottom:"1px solid #eee" }}>
//                   <td style={{ padding:"6px 10px" }}>{i+1}</td>
//                   <td style={{ padding:"6px 10px" }}>{item.name||"Item"}</td>
//                   <td style={{ padding:"6px 10px",textAlign:"right" }}>{item.qty} {item.unit||"PCS"}</td>
//                   <td style={{ padding:"6px 10px",textAlign:"right" }}>{fmt(Number(item.price))}</td>
//                   <td style={{ padding:"6px 10px",textAlign:"right" }}>
//                     {pct>0?<span>{pct}%<br/><span style={{fontSize:9,color:"#777"}}>({fmt(Math.round(Number(item.qty)*Number(item.price)*(pct/100)*100)/100)})</span></span>:disc>0?fmt(disc):"-"}
//                   </td>
//                   <td style={{ padding:"6px 10px",textAlign:"right",fontWeight:600 }}>{fmt(Number(item.amount))}</td>
//                 </tr>
//               );
//             })}
//           </tbody>
//           <tfoot>
//             <tr style={{ borderTop:BD,background:"#f7f7f7" }}>
//               <td style={{ padding:"6px 10px",fontWeight:700 }}>TOTAL</td>
//               <td></td>
//               <td style={{ padding:"6px 10px",textAlign:"right",fontWeight:700 }}>{invoice.billItems.reduce((s,i)=>s+Number(i.qty),0)}</td>
//               <td></td>
//               <td style={{ padding:"6px 10px",textAlign:"right",fontWeight:700 }}>₹ {fmt(invoice.billItems.reduce((s,i)=>{const r=i as any;return s+(Number(r.discountAmt??r.discount_amt??0)||0)},0))}</td>
//               <td style={{ padding:"6px 10px",textAlign:"right",fontWeight:700 }}>₹ {fmt(grandTotal)}</td>
//             </tr>
//             <tr>
//               <td colSpan={5} style={{ padding:"5px 10px",textAlign:"right",fontSize:10,color:"#444" }}>Received Amount:</td>
//               <td style={{ padding:"5px 10px",textAlign:"right",fontSize:10 }}>₹ {fmt(alreadyReceived)}</td>
//             </tr>
//             <tr>
//               <td colSpan={5} style={{ padding:"5px 10px",textAlign:"right",fontWeight:700,fontSize:10 }}>Balance:</td>
//               <td style={{ padding:"5px 10px",textAlign:"right",fontWeight:700,fontSize:10,color:safeN(grandTotal-alreadyReceived)>0?"#dc2626":"#16a34a" }}>₹ {fmt(safeN(grandTotal-alreadyReceived))}</td>
//             </tr>
//           </tfoot>
//         </table>

//         {/* ── Footer: Bank Details | Terms | Signature ── */}
//         <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",borderTop:BD }}>
//           <div style={{ padding:"10px 14px",borderRight:BD,fontSize:10 }}>
//             <div style={{ fontWeight:700,marginBottom:5 }}>Bank Details</div>
//             {bankPairs.map(([k,v]) => (
//               <div key={k} style={{ display:"flex",marginBottom:2 }}>
//                 <span style={{ minWidth:76,color:"#555",flexShrink:0 }}>{k}:</span>
//                 <span style={{ fontWeight:500,color:"#111" }}>{v}</span>
//               </div>
//             ))}
//             <div style={{ fontWeight:700,marginTop:10,marginBottom:5 }}>Terms and Conditions</div>
//             <div style={{ color:"#555",lineHeight:1.6,whiteSpace:"pre-line" as const }}>{invoice.termsConditions||defaultTerms}</div>
//           </div>
//           <div style={{ padding:"10px 14px",fontSize:10,display:"flex",flexDirection:"column",justifyContent:"space-between" }}>
//             <div>
//               <div style={{ fontSize:10,color:"#555",marginBottom:4 }}>{numToWords(grandTotal)}</div>
//             </div>
//             {/* Signature */}
//             <div style={{ minHeight:80,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",gap:4,marginTop:12,borderTop:"1px dashed #ccc",paddingTop:10 }}>
//               {sigUrl && <img src={sigUrl} alt="sig" style={{ maxHeight:50,maxWidth:130,objectFit:"contain",display:"block",marginBottom:4 }}/>}
//               <div style={{ fontSize:10,fontWeight:700,color:"#111" }}>Authorised Signatory For</div>
//               <div style={{ fontSize:10,color:accent }}>{companyName}</div>
//             </div>
//           </div>
//         </div>

//         {/* ── Bottom badge: BILL OF SUPPLY | ORIGINAL FOR RECIPIENT ── */}
//         <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 14px",borderTop:BD,background:"#f7f7f7",fontSize:10 }}>
//           <span style={{ fontWeight:700,letterSpacing:"0.5px" }}>BILL OF SUPPLY</span>
//           <span style={{ color:"#555",border:"1px solid #aaa",padding:"1px 8px" }}>ORIGINAL FOR RECIPIENT</span>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── InvoicePaper router ───────────────────────────────────────────────────────
// function InvoicePaper({ invoice, business, template, printRef, themeLayout, themeColor, bgImageUrl, bgOpacity }: InvoicePaperProps) {
//   if (themeLayout === "luxury") {
//     return <LuxuryLayout invoice={invoice} business={business} template={template} printRef={printRef} themeColor={themeColor} bgImageUrl={bgImageUrl} bgOpacity={bgOpacity} />;
//   }
//   if (themeLayout === "stylish") {
//     return <StylishLayout invoice={invoice} business={business} template={template} printRef={printRef} themeColor={themeColor} bgImageUrl={bgImageUrl} bgOpacity={bgOpacity} />;
//   }
//   if (themeLayout === "simple") {
//     return <SimpleLayout invoice={invoice} business={business} template={template} printRef={printRef} themeColor={themeColor} bgImageUrl={bgImageUrl} bgOpacity={bgOpacity} />;
//   }
//   if (themeLayout === "modern") {
//     return <ModernLayout invoice={invoice} business={business} template={template} printRef={printRef} themeColor={themeColor} bgImageUrl={bgImageUrl} bgOpacity={bgOpacity} />;
//   }
//   if (themeLayout === "billbook-a5") {
//     return <BillbookA5Layout invoice={invoice} business={business} template={template} printRef={printRef} themeColor={themeColor} bgImageUrl={bgImageUrl} bgOpacity={bgOpacity} />;
//   }
//   return <AdvancedGSTLayout invoice={invoice} business={business} template={template} printRef={printRef} themeColor={themeColor} bgImageUrl={bgImageUrl} bgOpacity={bgOpacity} />;
// }

// // ─── Main InvoiceViewModal ────────────────────────────────────────────────────
// export default function InvoiceViewModal({
//   invoice: initialInvoice, template, business, onClose, onEdit,
//   onPaymentSaved, onDuplicate, onDelete, onCancel, onCreditNote, onProfitDetails,
// }: Props) {
//   const printRef = useRef<HTMLDivElement>(null);
//   const [invoice, setInvoice] = useState<SalesInvoice>(initialInvoice);
//   const [showRecordPayment, setShowRecordPayment] = useState(false);
//   const [dotsOpen, setDotsOpen] = useState(false);
//   const [showProfitModal, setShowProfitModal] = useState(false);
//   const dotsRef = useRef<HTMLDivElement>(null);

//   const [activeTheme] = useState<ActiveTemplateSettings>(loadActiveTemplate);
//   const themeLayout = activeTheme.themeLayout;
//   const themeColor  = activeTheme.themeColor;
//   const bgImageUrl  = activeTheme.bgImageUrl;
//   const bgOpacity   = activeTheme.bgOpacity;

//   const font     = template?.style?.font     ?? "Arial";
//   const fontSize = template?.style?.textSize ?? "11px";

//   function buildInvoiceHtml(content: string) {
//     const fontName = font.replace(/ /g, "+");
//     return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
//     <title>Invoice #${invoice.invoiceNo}</title>
//     <style>
//       @import url('https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700;800&display=swap');
//       *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
//       body{font-family:'${font}',Arial,sans-serif;font-size:${fontSize};color:#1a1a1a;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
//       .inv-print{padding:24px;max-width:860px;margin:0 auto;}
//       table{width:100%;border-collapse:collapse;}
//       th,td{padding:5px 8px;}
//       .ivm-invoice-paper{border:1px solid #bbb !important;background:#fff;}
//       table th, table td{border:1px solid #bbb !important;}
//       *{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;color-adjust:exact !important;}
//       @media print{body{margin:0;}.inv-print{padding:8px;}.ivm-invoice-paper{border:1px solid #bbb !important;}}
//     </style></head>
//     <body><div class="inv-print">${content}</div></body></html>`;
//   }

//   function handlePrint() {
//     const content = printRef.current?.innerHTML ?? "";
//     const w = window.open("", "_blank");
//     if (!w) { alert("Please allow popups to print."); return; }
//     w.document.write(buildInvoiceHtml(content));
//     w.document.close(); w.focus();
//     setTimeout(() => { w.print(); }, 800);
//   }

//   function handleDownload() {
//     const content = printRef.current?.innerHTML ?? "";
//     const html    = buildInvoiceHtml(content);
//     const blob    = new Blob([html], { type: "text/html;charset=utf-8" });
//     const url     = URL.createObjectURL(blob);
//     const w = window.open(url, "_blank");
//     if (!w) {
//       const a = document.createElement("a");
//       a.href = url; a.download = `Invoice-${invoice.invoiceNo}.html`; a.click();
//       setTimeout(() => URL.revokeObjectURL(url), 5000);
//       return;
//     }
//     w.addEventListener("load", () => {
//       setTimeout(() => { w.print(); setTimeout(() => URL.revokeObjectURL(url), 60000); }, 800);
//     });
//   }

//   useEffect(() => {
//     function h(e: KeyboardEvent) { if (e.key === "Escape" && !showRecordPayment) onClose(); }
//     document.addEventListener("keydown", h);
//     return () => document.removeEventListener("keydown", h);
//   }, [showRecordPayment]);

//   const grandTotal      = calcTotal(invoice);
//   const alreadyReceived = getAlreadyReceived(invoice);
//   const balance         = grandTotal - alreadyReceived;
//   const statusColor     = invoice.status === "Paid" ? "#16a34a"
//     : invoice.status === "Unpaid" ? "#dc2626"
//     : invoice.status === "Partially Paid" ? "#d97706"
//     : "#6b7280";

//   return (
//     <>
//       <div className="ivm-overlay" onClick={onClose}>
//         <div className="ivm-shell" onClick={e => e.stopPropagation()}>

//           {/* ── Top Bar ── */}
//           <div className="ivm-topbar">
//             <div className="ivm-topbar-left">
//               <button className="ivm-back-btn" onClick={onClose}>
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
//               </button>
//               <span className="ivm-title">Sales Invoice #{invoice.invoiceNo}</span>
//               <span className="ivm-status-badge" style={{ background:statusColor+"18", color:statusColor, border:`1px solid ${statusColor}40` }}>
//                 {invoice.status}
//               </span>
//             </div>
//             <div className="ivm-topbar-right">
//               <button className="ivm-top-btn" onClick={() => { setShowProfitModal(true); onProfitDetails?.(); }}>
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
//                 Profit Details
//               </button>
//               <div ref={dotsRef} style={{ position:"relative" }}>
//                 <button className="ivm-top-btn ivm-top-btn--dots" onClick={() => setDotsOpen(v => !v)}>
//                   <svg viewBox="0 0 24 24" fill="currentColor" style={{ width:16, height:16 }}>
//                     <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
//                   </svg>
//                 </button>
//                 {dotsOpen && (
//                   <div style={{ position:"absolute",top:"calc(100% + 6px)",right:0,zIndex:500,background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,boxShadow:"0 10px 28px rgba(0,0,0,.15)",minWidth:200,overflow:"hidden" }}
//                     onClick={() => setDotsOpen(false)}>
//                     {[
//                       { icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, label:"Edit", action:onEdit },
//                       { icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.99"/></svg>, label:"Edit History", action:()=>{} },
//                       { icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>, label:"Duplicate", action:onDuplicate },
//                       { icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, label:"Issue Credit Note", action:onCreditNote },
//                       null,
//                       { icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>, label:"Cancel Invoice", action:onCancel, warning:true },
//                       { icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>, label:"Delete", action:onDelete, danger:true },
//                     ].map((item, i) => item === null ? (
//                       <div key={i} style={{ height:1, background:"#f3f4f6", margin:"2px 0" }}/>
//                     ) : (
//                       <button key={i} onClick={item.action}
//                         style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 16px",background:"none",border:"none",cursor:"pointer",fontSize:14,
//                           color:(item as any).danger?"#dc2626":(item as any).warning?"#d97706":"#374151",fontWeight:500,textAlign:"left" }}
//                         onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
//                         onMouseLeave={e => (e.currentTarget.style.background = "none")}>
//                         {item.icon} {item.label}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//               <button className="ivm-close-btn" onClick={onClose}>✕</button>
//             </div>
//           </div>

//           {/* ── Action Bar ── */}
//           <div className="ivm-actionbar">
//             <div className="ivm-actionbar-left">
//               <div className="ivm-action-group">
//                 <button className="ivm-action-btn" onClick={handlePrint}>
//                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
//                   Print PDF
//                 </button>
//                 <button className="ivm-action-split"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></button>
//               </div>
//               <div className="ivm-action-group">
//                 <button className="ivm-action-btn" onClick={handleDownload}>
//                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
//                   Download PDF
//                 </button>
//                 <button className="ivm-action-split"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></button>
//               </div>
//               <div className="ivm-action-group">
//                 <button className="ivm-action-btn">
//                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
//                   Share
//                 </button>
//                 <button className="ivm-action-split"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></button>
//               </div>
//             </div>
//             <div className="ivm-actionbar-right">
//               <button className="ivm-record-btn" onClick={e => { e.stopPropagation(); setShowRecordPayment(true); }}>
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
//                 Record Payment In
//               </button>
//             </div>
//           </div>

//           {/* ── Main Body ── */}
//           <div className="ivm-body">
//             <div className="ivm-preview-area">
//               <div className="ivm-preview-label">
//                 TAX INVOICE <span className="ivm-original-tag">ORIGINAL FOR RECIPIENT</span>
//               </div>
//               <InvoicePaper
//                 invoice={invoice}
//                 business={business}
//                 template={template}
//                 printRef={printRef}
//                 themeLayout={themeLayout}
//                 themeColor={themeColor}
//                 bgImageUrl={bgImageUrl}
//                 bgOpacity={bgOpacity}
//               />
//             </div>

//             {/* ── Payment History Sidebar ── */}
//             <div className="ivm-sidebar">
//               <div className="ivm-sidebar-title">Payment History</div>
//               <div className="ivm-ph-row"><span>Invoice Amount</span><strong>₹{grandTotal.toLocaleString("en-IN")}</strong></div>
//               <div className="ivm-ph-row"><span>Total Amount Received</span><strong>₹{alreadyReceived.toLocaleString("en-IN")}</strong></div>
//               {alreadyReceived > 0 && (
//                 <div className="ivm-ph-entry">
//                   <div className="ivm-ph-entry-top"><span>Payment Received</span><strong style={{ color:"#16a34a" }}>₹{alreadyReceived.toLocaleString("en-IN")}</strong></div>
//                   <div className="ivm-ph-entry-date">{fmtDate(invoice.createdAt)}</div>
//                 </div>
//               )}
//               <div style={{ flex:1 }}/>
//               <div className="ivm-ph-total-row"><span>Total Amount Received</span><strong>₹{alreadyReceived.toLocaleString("en-IN")}</strong></div>
//               <div className="ivm-ph-balance-row">
//                 <span>Balance Amount</span>
//                 <strong style={{ color:balance > 0 ? "#dc2626" : "#16a34a" }}>₹{balance.toLocaleString("en-IN")}</strong>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {showRecordPayment && (
//         <RecordPaymentModal invoice={invoice} onClose={() => setShowRecordPayment(false)}
//           onSaved={updated => { setInvoice(updated); setShowRecordPayment(false); onPaymentSaved?.(); }}/>
//       )}

//       {dotsOpen && <div style={{ position:"fixed",inset:0,zIndex:499 }} onClick={() => setDotsOpen(false)}/>}

//       {showProfitModal && (
//         <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:4000,display:"flex",alignItems:"center",justifyContent:"center" }}
//           onClick={() => setShowProfitModal(false)}>
//           <div style={{ background:"#fff",borderRadius:16,width:580,maxWidth:"95vw",boxShadow:"0 24px 60px rgba(0,0,0,.2)",fontFamily:"Segoe UI,sans-serif" }}
//             onClick={e => e.stopPropagation()}>
//             <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 24px",borderBottom:"1px solid #f3f4f6" }}>
//               <span style={{ fontSize:16, fontWeight:700, color:"#111827" }}>Profit Calculation</span>
//               <button onClick={() => setShowProfitModal(false)} style={{ background:"none",border:"none",cursor:"pointer",color:"#6b7280",fontSize:20,lineHeight:1 }}>✕</button>
//             </div>
//             <div style={{ padding:"0 24px 24px" }}>
//               <table style={{ width:"100%", borderCollapse:"collapse", marginTop:16 }}>
//                 <thead>
//                   <tr style={{ borderBottom:"2px solid #f3f4f6" }}>
//                     <th style={{ textAlign:"left",fontSize:11,fontWeight:700,color:"#6b7280",padding:"8px 0",textTransform:"uppercase",letterSpacing:"0.5px" }}>Item Name</th>
//                     <th style={{ textAlign:"center",fontSize:11,fontWeight:700,color:"#6b7280",padding:"8px 0",textTransform:"uppercase",letterSpacing:"0.5px" }}>QTY</th>
//                     <th style={{ textAlign:"center",fontSize:11,fontWeight:700,color:"#4f46e5",padding:"8px 0",textTransform:"uppercase",letterSpacing:"0.5px" }}>Purchase Price<br/><span style={{ fontWeight:400,textTransform:"none" }}>(Excl. Taxes)</span></th>
//                     <th style={{ textAlign:"right",fontSize:11,fontWeight:700,color:"#6b7280",padding:"8px 0",textTransform:"uppercase",letterSpacing:"0.5px" }}>Total Cost</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {invoice.billItems.map((item: any, i: number) => (
//                     <tr key={i} style={{ borderBottom:"1px solid #f9fafb" }}>
//                       <td style={{ padding:"10px 0",fontSize:14,color:"#374151",fontWeight:600 }}>{item.name || "Item"}</td>
//                       <td style={{ textAlign:"center",padding:"10px 0",fontSize:14,color:"#374151" }}>{item.qty} {item.unit || "PCS"}</td>
//                       <td style={{ textAlign:"center",padding:"10px 0",fontSize:14,color:"#9ca3af" }}>-</td>
//                       <td style={{ textAlign:"right",padding:"10px 0",fontSize:14,color:"#9ca3af" }}>-</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//               <div style={{ borderTop:"1px solid #f3f4f6", marginTop:8 }}>
//                 {[
//                   { label:"Sales Amount(Exl. Addn. Charges):", value:`₹ ${invoice.billItems.reduce((s:number,i:any)=>s+(i.amount||0),0).toLocaleString("en-IN")}` },
//                   { label:"Total Cost:", value:"₹ 0" },
//                   { label:"Tax Payable:", value:"₹ 0" },
//                 ].map(r => (
//                   <div key={r.label} style={{ display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #f9fafb",fontSize:14,color:"#374151" }}>
//                     <span>{r.label}</span><span>{r.value}</span>
//                   </div>
//                 ))}
//                 <div style={{ display:"flex",justifyContent:"space-between",padding:"12px 0",fontSize:14,color:"#374151",fontWeight:600 }}>
//                   <div>
//                     <div>Profit:</div>
//                     <div style={{ fontSize:12,color:"#4f46e5",fontWeight:400,marginTop:2 }}>(Sales Amount - Total Cost - Tax Payable)</div>
//                   </div>
//                   <div style={{ display:"flex",alignItems:"center",gap:6,color:"#9ca3af" }}>
//                     <span>-</span>
//                     <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" style={{ width:16,height:16 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }






import { useEffect, useRef, useState } from "react";
import "./InvoiceViewModal.css";
import api from "@/lib/axios";

// ─── Static assets — always shown on every invoice ────────────────────────────
import BILL_LOGO      from "../../../assets/bill_logo.jpeg";
import BILL_SIGNATURE from "../../../assets/bill_signature.png";
import BILL_QR from "../../../assets/qr_code.jpeg"
// ─── Convert image URL to base64 so it survives PDF/download export ───────────
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
  } catch {
    return src;
  }
}

// ─── Active Template Reader ───────────────────────────────────────────────────
const LS_ACTIVE = "activeInvoiceTemplate";

interface ActiveTemplateSettings {
  themeLayout: string;
  themeColor: string;
  bgImageUrl: string;
  bgOpacity: number;
  misc?: { signatureUrl?: string };
}

function loadActiveTemplate(): ActiveTemplateSettings {
  try {
    const raw = localStorage.getItem(LS_ACTIVE);
    if (!raw) return { themeLayout: "advanced-gst", themeColor: "#1a1d23", bgImageUrl: "", bgOpacity: 15 };
    const t = JSON.parse(raw);
    return {
      themeLayout: t.themeLayout ?? "advanced-gst",
      themeColor:  t.themeColor  ?? t.style?.themeColor ?? "#1a1d23",
      bgImageUrl:  t.bgImageUrl  ?? t.ts?.backgroundUrl ?? "",
      bgOpacity:   t.bgOpacity   ?? t.ts?.backgroundOpacity ?? 15,
      misc:        t.misc,
    };
  } catch {
    return { themeLayout: "advanced-gst", themeColor: "#1a1d23", bgImageUrl: "", bgOpacity: 15 };
  }
}

// ─── TDS Rate data ────────────────────────────────────────────────────────────
const DEFAULT_TDS_RATES = [
  { label: "0.75% - 194C Payment to Contractor (individuals/ HUF) (Reduced)", rate: 0.75 },
  { label: "1.0% - 194C Payment to Contractor (individuals/ HUF)", rate: 1.0 },
  { label: "1.5% - 194C Payment to Contractor (others) (reduced)", rate: 1.5 },
  { label: "2.0% - 194C Payment to Contractor (others)", rate: 2.0 },
  { label: "2.0% - 194I Rent (Plant / Machinery / Equipment)", rate: 2.0 },
  { label: "2.0% - 194J Professional Fees / Technical Services / Royalty (technical services)", rate: 2.0 },
  { label: "3.75% - 194H Commission or Brokerage (Reduced)", rate: 3.75 },
  { label: "5.0% - 194D Insurance Commission", rate: 5.0 },
  { label: "7.5% - 194 Dividend (Reduced)", rate: 7.5 },
  { label: "7.5% - 194J Professional Fees / Technical Services / Royalty (others) (reduced)", rate: 7.5 },
  { label: "10.0% - 193 Interest on Securities", rate: 10.0 },
  { label: "10.0% - 194 Dividend", rate: 10.0 },
  { label: "10.0% - 194A Interest other than Interest on Securities (by banks)", rate: 10.0 },
  { label: "10.0% - 194I Rent (Land & Building)", rate: 10.0 },
  { label: "10.0% - 194J Professional Fees / Technical Services / Royalty (others)", rate: 10.0 },
  { label: "10.0% - 194K Payment to resident units", rate: 10.0 },
  { label: "30.0% - 194B Lottery / Crossword Puzzle", rate: 30.0 },
  { label: "0.1% - 194Q Purchase of goods", rate: 0.1 },
  { label: "2.0% - 194H Commission or Brokerage", rate: 2.0 },
];

function loadTdsRates(): { label: string; rate: number }[] {
  try {
    const custom = JSON.parse(localStorage.getItem("customTdsRates") || "[]");
    return [...DEFAULT_TDS_RATES, ...custom];
  } catch { return DEFAULT_TDS_RATES; }
}
function persistCustomTdsRate(r: { label: string; rate: number }) {
  try {
    const custom = JSON.parse(localStorage.getItem("customTdsRates") || "[]");
    localStorage.setItem("customTdsRates", JSON.stringify([...custom, r]));
  } catch {}
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface BillItem {
  name?: string;
  description?: string;
  hsn?: string;
  qty: number;
  unit?: string;
  price: number;
  discountPct?: number;
  discountAmt?: number;
  taxRate?: number;
  taxLabel?: string;
  discount_pct?: number;
  discount_amt?: number;
  tax_rate?: number;
  amount: number;
}

interface SalesInvoice {
  id: string;
  invoiceNo: number;
  invoiceDate: string;
  amountReceived: number;
  receivedAmount?: number;
  outstandingAmount?: number;
  totalAmount?: number;
  party: { id?: number; name: string; mobile?: string; billingAddress?: string; gstin?: string } | null;
  shipTo?: { name: string; mobile?: string; billingAddress?: string } | null;
  billItems: BillItem[];
  additionalCharges: { label?: string; amount: number; taxLabel?: string }[];
  discountPct: number;
  discountAmt: number;
  applyTCS: boolean;
  tcsRate: number;
  tcsLabel?: string;
  tcsBase?: string;
  roundOffAmt: number;
  notes?: string;
  termsConditions?: string;
  eWayBillNo?: string;
  challanNo?: string;
  financedBy?: string;
  salesman?: string;
  warrantyPeriod?: string;
  dueDate?: string;
  showDueDate?: boolean;
  status: string;
  createdAt: string;
  signatureUrl?: string;
  showEmptySignatureBox?: boolean;
  poNumber?: string;
  vehicleNo?: string;
  dispatchedThrough?: string;
  transportName?: string;
  emailId?: string;
  customFieldValues?: Record<string, string>;
  snapshotMetaFields?: {
    showSalesman?: boolean;
    showVehicle?: boolean;
    showChallan?: boolean;
    showFinancedBy?: boolean;
    showWarranty?: boolean;
    showEwayBill?: boolean;
    showPO?: boolean;
    showDispatchedThrough?: boolean;
    showTransportName?: boolean;
    showEmailId?: boolean;
    customFieldLabels?: string[];
  };
  paymentDetails?: {
    method: string; amount: number;
    refNo?: string; chequeDate?: string; authNo?: string;
    bankName?: string; cardType?: string; branchName?: string;
  };
  financeDetails?: {
    enabled?: boolean;
    financerName?: string; loanRefNo?: string; loanAmount?: number;
    emi?: number; emiCount?: number; extraEmi?: number; extraEmiCount?: number;
    dbdCharges?: number; processingFee?: number;
    agentName?: string; agentContact?: string; reference?: string;
  };
}

interface SavedTemplate {
  id: string; name: string; themeColor: string;
  style: { font: string; textSize: string; themeColor: string; borderColor: string; borderWidth: string; showLogo: boolean; logoUrl: string };
  vis: { companyName: boolean; slogan: boolean; address: boolean; gstin: boolean; phone: boolean; pan: boolean; email: boolean };
  misc: { showNotes: boolean; amountWords: boolean; showTerms: boolean; receiverSig: boolean; signatureUrl: string };
  ts: { hsnSummary: boolean; showDesc: boolean; capitalize: boolean; cols: Record<string, boolean>; backgroundUrl: string; backgroundOpacity: number };
  inv: { companyName: string; slogan: string; address: string; gstin: string; phone: string; email: string; pan: string; bank: string; ifsc: string; terms: string; bankName?: string; accountNo?: string; branch?: string };
}
interface Business {
  companyName: string; address: string; gstin: string;
  phone: string; email: string; pan: string; bank: string; ifsc: string;
  bankName?: string; accountNo?: string; branch?: string; AccountHolder?: string;
}
interface Props {
  invoice: SalesInvoice;
  template: SavedTemplate | null;
  business: Business;
  onClose: () => void;
  onEdit: () => void;
  onPaymentSaved?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onCancel?: () => void;
  onCreditNote?: () => void;
  onProfitDetails?: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtDateSlash(d: string) {
  if (!d) return "";
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${dt.getFullYear()}`;
}
function fmtDateGB(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtC(n: number) {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}
function fmtN(n: number) {
  const safe = isNaN(n) || !isFinite(n) ? 0 : n;
  return safe.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function safeN(n: number): number {
  return isNaN(n) || !isFinite(n) ? 0 : n;
}

function calcTotal(inv: Pick<SalesInvoice, "billItems"|"additionalCharges"|"discountPct"|"discountAmt"|"applyTCS"|"tcsRate"|"tcsBase"|"roundOffAmt">): number {
  const items   = inv.billItems.reduce((s, i) => s + Number(i.amount), 0);
  const charges = inv.additionalCharges.reduce((s, c) => s + Number(c.amount), 0);
  const subtotal = items + charges;
  const invDiscPct = Number(inv.discountPct) || 0;
  const invDiscAmt = Number(inv.discountAmt) || 0;
  const disc  = subtotal * (invDiscPct / 100) + invDiscAmt;
  const after = subtotal - disc;
  const tcsBase = inv.tcsBase === "Taxable Amount" ? subtotal : after;
  const tcs     = inv.applyTCS ? tcsBase * ((Number(inv.tcsRate) || 0) / 100) : 0;
  return Math.round((after + tcs + (Number(inv.roundOffAmt) || 0)) * 100) / 100;
}
function getAlreadyReceived(inv: SalesInvoice): number {
  if (inv.receivedAmount != null) return Number(inv.receivedAmount);
  return Number(inv.amountReceived ?? 0);
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

// ─── Add TDS Rate Modal ───────────────────────────────────────────────────────
function AddTdsRateModal({ onClose, onSaved }: { onClose: () => void; onSaved: (r:{label:string;rate:number})=>void }) {
  const [taxName, setTaxName] = useState("");
  const [section, setSection] = useState("");
  const [rate, setRate] = useState(0);
  const canSave = taxName.trim().length > 0;
  function handleSave() {
    if (!canSave) return;
    const label = `${rate}% - ${section.trim() ? section.trim()+" " : ""}${taxName.trim()}`;
    const r = { label, rate };
    persistCustomTdsRate(r);
    onSaved(r);
  }
  const inp: React.CSSProperties = { width:"100%", padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box" };
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:4000,display:"flex",alignItems:"center",justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:"#fff",borderRadius:14,width:500,maxWidth:"95vw",boxShadow:"0 24px 60px rgba(0,0,0,.22)",fontFamily:"Segoe UI,sans-serif" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 24px",borderBottom:"1px solid #f3f4f6" }}>
          <span style={{ fontSize:16,fontWeight:700,color:"#111827" }}>Add Tds Rate</span>
          <button onClick={onClose} style={{ background:"none",border:"1px solid #e5e7eb",borderRadius:8,width:30,height:30,cursor:"pointer",color:"#374151",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
        </div>
        <div style={{ padding:"22px 24px",display:"flex",flexDirection:"column",gap:18 }}>
          <div><label style={{ fontSize:13,color:"#374151",fontWeight:500,display:"block",marginBottom:6 }}>Tax name</label><input value={taxName} onChange={e=>setTaxName(e.target.value)} placeholder="Enter Tax Name" style={inp}/></div>
          <div><label style={{ fontSize:13,color:"#374151",fontWeight:500,display:"block",marginBottom:6 }}>Enter Section Name</label><input value={section} onChange={e=>setSection(e.target.value)} placeholder="Enter Section Name" style={inp}/></div>
          <div><label style={{ fontSize:13,color:"#374151",fontWeight:500,display:"block",marginBottom:6 }}>Enter Rate (in %)</label><input type="number" value={rate} onChange={e=>setRate(Number(e.target.value))} style={inp}/></div>
        </div>
        <div style={{ display:"flex",justifyContent:"flex-end",gap:10,padding:"16px 24px",borderTop:"1px solid #f3f4f6" }}>
          <button onClick={onClose} style={{ padding:"9px 22px",border:"1px solid #e5e7eb",background:"#fff",borderRadius:8,fontSize:14,cursor:"pointer",color:"#374151",fontWeight:500 }}>Close</button>
          <button onClick={handleSave} disabled={!canSave} style={{ padding:"9px 22px",background:canSave?"#4f46e5":"#c7d2fe",color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:canSave?"pointer":"not-allowed" }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Record Payment Modal ─────────────────────────────────────────────────────
const PM_LIST = ["Cash","UPI","Card","Netbanking","Bank Transfer","Cheque"] as const;

function RecordPaymentModal({ invoice, onClose, onSaved }: { invoice:SalesInvoice; onClose:()=>void; onSaved:(updated:SalesInvoice)=>void }) {
  const grandTotal = calcTotal(invoice);
  const alreadyReceived = getAlreadyReceived(invoice);
  const pending = invoice.outstandingAmount != null ? Number(invoice.outstandingAmount) : Math.max(0, grandTotal - alreadyReceived);
  const [amount, setAmount] = useState(String(Math.round(pending*100)/100));
  const [discount, setDiscount] = useState("0");
  const [applyTds, setApplyTds] = useState(false);
  const [tdsRates, setTdsRates] = useState<{label:string;rate:number}[]>(loadTdsRates);
  const [selTds, setSelTds] = useState<{label:string;rate:number}|null>(null);
  const [showTdsDrop, setShowTdsDrop] = useState(false);
  const [showAddTds, setShowAddTds] = useState(false);
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [payMode, setPayMode] = useState<typeof PM_LIST[number]>("Cash");
  const [showModeDrop, setShowModeDrop] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const tdsRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function h(e:MouseEvent) {
      if (tdsRef.current && !tdsRef.current.contains(e.target as Node)) setShowTdsDrop(false);
      if (modeRef.current && !modeRef.current.contains(e.target as Node)) setShowModeDrop(false);
    }
    document.addEventListener("mousedown",h);
    return () => document.removeEventListener("mousedown",h);
  },[]);

  const amt = parseFloat(amount)||0;
  const disc = parseFloat(discount)||0;
  const tdsAmt = applyTds&&selTds ? pending*selTds.rate/100 : 0;
  const balance = Math.max(0, pending-amt-disc-tdsAmt);

  async function handleSave() {
    if (amt<=0) { setSaveError("Please enter a valid amount."); return; }
    const invoiceNumericId = Number(invoice.id);
    if (isNaN(invoiceNumericId)||invoiceNumericId<=0) { setSaveError("Invalid invoice ID — cannot record payment."); return; }
    const partyId: number|undefined = invoice.party?.id ?? (invoice as any).partyId ?? undefined;
    if (!partyId) { setSaveError("Invoice has no party — cannot record payment."); return; }
    setSaving(true); setSaveError("");
    try {
      const payload = {
        partyId,
        date:        payDate,
        mode:        payMode,
        amount:      amt,
        notes:       notes || undefined,
        allocations: [{ invoiceId: invoiceNumericId, amount: amt }],
      };
      await api.post("/payments-in", payload);
      const totalSettled   = amt + disc + tdsAmt;
      const newReceived    = Math.min(alreadyReceived + amt, grandTotal);
      const newOutstanding = Math.max(0, pending - totalSettled);
      onSaved({
        ...invoice,
        amountReceived:    newReceived,
        receivedAmount:    newReceived,
        outstandingAmount: newOutstanding,
        status: newOutstanding <= 0 ? "Paid" : newReceived > 0 ? "Partially Paid" : "Unpaid",
      });
    } catch(e:any) {
      setSaveError(e.response?.data?.message ?? e.message ?? "Something went wrong.");
    } finally { setSaving(false); }
  }

  const dropItem = (label:string,active:boolean): React.CSSProperties => ({padding:"9px 14px",fontSize:13,color:active?"#4f46e5":"#374151",cursor:"pointer",background:active?"#ede9fe":"transparent",fontWeight:active?600:400,borderBottom:"1px solid #f9fafb"});
  const inp: React.CSSProperties = {width:"100%",padding:"10px 12px",border:"1px solid #e5e7eb",borderRadius:8,fontSize:14,outline:"none",boxSizing:"border-box",background:"#fff",fontFamily:"inherit"};
  const dropBox: React.CSSProperties = {position:"absolute",top:"calc(100% + 4px)",left:0,right:0,zIndex:200,background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,boxShadow:"0 10px 28px rgba(0,0,0,.13)",maxHeight:250,overflowY:"auto"};

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:"#fff",borderRadius:16,width:860,maxWidth:"97vw",maxHeight:"93vh",overflowY:"auto",boxShadow:"0 24px 70px rgba(0,0,0,.22)",fontFamily:"Segoe UI,sans-serif",display:"flex",flexDirection:"column" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 26px",borderBottom:"1px solid #f3f4f6",flexShrink:0 }}>
          <span style={{ fontSize:16,fontWeight:700,color:"#111827" }}>Record Payment For Invoice #{invoice.invoiceNo}</span>
          <button onClick={onClose} style={{ background:"none",border:"1px solid #e5e7eb",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16,color:"#374151",display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 290px",gap:20,padding:"22px 26px",flex:1 }}>
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            <div style={{ background:"#f9fafb",borderRadius:12,padding:"18px 18px 16px",border:"1px solid #e5e7eb" }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:14 }}>
                <div><label style={{ fontSize:12,color:"#6b7280",fontWeight:500,display:"block",marginBottom:5 }}>Amount Received</label><input type="number" value={amount} onChange={e=>setAmount(e.target.value)} style={inp}/></div>
                <div><label style={{ fontSize:12,color:"#6b7280",fontWeight:500,display:"block",marginBottom:5 }}>Payment In Discount</label><input type="number" value={discount} onChange={e=>setDiscount(e.target.value)} style={inp}/></div>
              </div>
              <label style={{ display:"flex",alignItems:"center",gap:8,fontSize:13.5,color:"#374151",cursor:"pointer",userSelect:"none",marginBottom:applyTds?12:0 }}>
                <input type="checkbox" checked={applyTds} onChange={e=>{setApplyTds(e.target.checked);if(!e.target.checked)setSelTds(null);}} style={{ width:16,height:16,accentColor:"#4f46e5",cursor:"pointer" }}/>Apply TDS
              </label>
              {applyTds && (
                <div ref={tdsRef} style={{ position:"relative" }}>
                  <div onClick={()=>setShowTdsDrop(v=>!v)} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",border:"1px solid #e5e7eb",borderRadius:8,background:"#fff",cursor:"pointer",fontSize:13,color:selTds?"#111827":"#9ca3af",userSelect:"none" }}>
                    <span style={{ flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:8 }}>{selTds?selTds.label:"Select Tds Rate"}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:14,height:14,flexShrink:0 }}><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                  {showTdsDrop && (
                    <div style={dropBox}>
                      {tdsRates.map((r,i)=>(
                        <div key={i} style={dropItem(r.label,selTds?.label===r.label)} onMouseDown={e=>{e.preventDefault();setSelTds(r);setShowTdsDrop(false);}}>
                          {r.label}
                        </div>
                      ))}
                      <div onMouseDown={e=>{e.preventDefault();setShowTdsDrop(false);setShowAddTds(true);}} style={{ padding:"10px 14px",fontSize:13,color:"#4f46e5",cursor:"pointer",fontWeight:600,borderTop:"1px solid #f3f4f6",background:"#fafafe" }}>+ Add New Tds Rate</div>
                    </div>
                  )}
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,color:"#6b7280",marginTop:10,padding:"0 2px" }}>
                    <span>TDS Applicable on bill</span><span style={{ color:"#374151",fontWeight:500 }}>- {fmtC(tdsAmt)}</span>
                  </div>
                </div>
              )}
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
              <div>
                <label style={{ fontSize:12,color:"#6b7280",fontWeight:500,display:"block",marginBottom:5 }}>Payment Date</label>
                <div onClick={()=>dateRef.current?.showPicker?.()} style={{ display:"flex",alignItems:"center",gap:8,padding:"0 12px",border:"1px solid #e5e7eb",borderRadius:8,height:40,cursor:"pointer",background:"#fff",position:"relative" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:15,height:15,color:"#6b7280",flexShrink:0 }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span style={{ flex:1,fontSize:13,color:"#111827" }}>{fmtDateGB(payDate)}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:13,height:13,color:"#9ca3af" }}><polyline points="6 9 12 15 18 9"/></svg>
                  <input ref={dateRef} type="date" value={payDate} onChange={e=>setPayDate(e.target.value)} style={{ position:"absolute",opacity:0,width:0,height:0,pointerEvents:"none" }}/>
                </div>
              </div>
              <div ref={modeRef} style={{ position:"relative" }}>
                <label style={{ fontSize:12,color:"#6b7280",fontWeight:500,display:"block",marginBottom:5 }}>Payment Mode</label>
                <div onClick={()=>setShowModeDrop(v=>!v)} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 12px",border:`1px solid ${showModeDrop?"#4f46e5":"#e5e7eb"}`,borderRadius:8,height:40,cursor:"pointer",fontSize:13,color:"#111827",background:"#fff",userSelect:"none" }}>
                  <span>{payMode}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:14,height:14,color:"#9ca3af" }}><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                {showModeDrop && (
                  <div style={{ ...dropBox,maxHeight:"none" }}>
                    {PM_LIST.map(m=><div key={m} style={dropItem(m,payMode===m)} onMouseDown={e=>{e.preventDefault();setPayMode(m);setShowModeDrop(false);}}>{m}</div>)}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label style={{ fontSize:12,color:"#6b7280",fontWeight:500,display:"block",marginBottom:5 }}>Notes</label>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} style={{ width:"100%",padding:"10px 12px",border:"1px solid #e5e7eb",borderRadius:8,fontSize:13,resize:"vertical",minHeight:90,outline:"none",fontFamily:"inherit",boxSizing:"border-box",background:"#fff" }}/>
            </div>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            <div style={{ background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:16 }}>
              <div style={{ fontSize:14,fontWeight:700,color:"#111827",marginBottom:8 }}>Invoice #{invoice.invoiceNo}</div>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,color:"#374151",marginBottom:4 }}><span>Invoice Amount</span><span style={{ fontWeight:600 }}>{fmtC(grandTotal)}</span></div>
              {invoice.party?.name && <div style={{ fontSize:12,color:"#6b7280",marginBottom:3 }}>{invoice.party.name}</div>}
              {invoice.dueDate && <div style={{ fontSize:12,color:"#6b7280" }}>Due Date: {fmtDateGB(invoice.dueDate)}</div>}
            </div>
            <div style={{ background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:16 }}>
              <div style={{ fontSize:14,fontWeight:700,color:"#111827",marginBottom:12 }}>Record Payment Calculation</div>
              <div style={{ border:"1px solid #f3f4f6",borderRadius:10,overflow:"hidden" }}>
                <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:600,padding:"10px 12px",borderBottom:"1px solid #f3f4f6",color:"#ef4444" }}><span>Invoice Pending Amt.</span><span>{fmtC(pending)}</span></div>
                <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,color:"#374151",padding:"10px 12px",borderBottom:"1px solid #f3f4f6" }}><span>Amount Received</span><span>{fmtC(amt)}</span></div>
                <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,color:"#374151",padding:"10px 12px",borderBottom:applyTds&&tdsAmt>0?"1px solid #f3f4f6":"none" }}><span>Payment In Discount</span><span>{fmtC(disc)}</span></div>
                {applyTds&&tdsAmt>0&&<div style={{ display:"flex",justifyContent:"space-between",fontSize:13,color:"#374151",padding:"10px 12px" }}><span>TDS Deducted</span><span>- {fmtC(tdsAmt)}</span></div>}
                <div style={{ display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:700,padding:"12px 12px",borderTop:"1px solid #f3f4f6" }}><span style={{ color:"#6b7280" }}>Balance Amount</span><span style={{ color:balance===0?"#16a34a":"#374151" }}>{fmtC(balance)}</span></div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop:"1px solid #f3f4f6",flexShrink:0 }}>
          {saveError&&<div style={{ margin:"10px 26px 0",padding:"9px 14px",background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:8,color:"#dc2626",fontSize:13 }}>{saveError}</div>}
          <div style={{ display:"flex",justifyContent:"flex-end",gap:12,padding:"16px 26px" }}>
            <button onClick={onClose} disabled={saving} style={{ padding:"9px 26px",border:"1px solid #e5e7eb",background:"#fff",borderRadius:8,fontSize:14,cursor:"pointer",color:"#374151",fontWeight:500 }}>Close</button>
            <button onClick={handleSave} disabled={saving||amt<=0} style={{ padding:"9px 28px",background:saving||amt<=0?"#a5b4fc":"#4f46e5",color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:700,cursor:saving||amt<=0?"not-allowed":"pointer" }}>{saving?"Saving…":"Save"}</button>
          </div>
        </div>
      </div>
      {showAddTds&&<AddTdsRateModal onClose={()=>setShowAddTds(false)} onSaved={r=>{setTdsRates(prev=>[...prev,r]);setSelTds(r);setShowAddTds(false);}}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GREAT EASTERN STYLE — TAX INVOICE CUM DELIVERY CHALLAN LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════

interface InvoicePaperProps {
  invoice: SalesInvoice;
  business: Business;
  template: SavedTemplate | null;
  printRef: React.RefObject<HTMLDivElement>;
  themeLayout: string;
  themeColor: string;
  bgImageUrl: string;
  bgOpacity: number;
}

function useInvoiceData(invoice: SalesInvoice, business: Business, template: SavedTemplate | null) {
  const companyName = template?.inv?.companyName || business.companyName;
  const address     = template?.inv?.address     || business.address;
  const gstin       = template?.inv?.gstin       || business.gstin;
  const phone       = business.phone;
  const email       = template?.inv?.email       || business.email || "";
  const bank        = template?.inv?.bank        || business.bank || "";
  const ifsc        = template?.inv?.ifsc        || business.ifsc || "";
  const bankName    = template?.inv?.bankName    || business.bankName || "";
  const accountHolder = business.AccountHolder || "";
  const accountNo   = template?.inv?.accountNo   || business.accountNo || "";
  const branch      = template?.inv?.branch      || business.branch || "";
  const logoUrl     = template?.style?.logoUrl  || BILL_LOGO;
  const showLogo    = true;
  const sigUrl      = template?.misc?.signatureUrl || invoice.signatureUrl || BILL_SIGNATURE;
  const defaultTerms = "Goods once sold cannot be taken back or exchanged. For any type of complaint, please contact the Manufacturer. Dealer is not liable for any complaint after delivery. Warranty is given by manufacturer only. Cheque return charge Rs.200/- besides legal liability. All disputes subject to local Jurisdiction.";

  const itemsSubtotal   = invoice.billItems.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const chargesTotal    = invoice.additionalCharges.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const discountAmt     = Number(invoice.discountAmt) || 0;
  const roundOff        = Number(invoice.roundOffAmt) || 0;
  const grandTotal      = safeN(itemsSubtotal + chargesTotal - discountAmt + roundOff);
  const alreadyReceived = getAlreadyReceived(invoice);

  const hsnMap: Record<string, { taxable:number; cgst:number; sgst:number; rate:number }> = {};
  invoice.billItems.forEach(item => {
    const raw = item as any;
    const itemRate = Number(raw.taxRate ?? raw.tax_rate ?? 0) || 0;
    const key = `${item.hsn||"-"}__${itemRate}`;
    if (!hsnMap[key]) hsnMap[key] = { taxable:0, cgst:0, sgst:0, rate:itemRate };
    const qty   = Number(item.qty) || 0;
    const price = Number(item.price) || 0;
    const pct   = Number(raw.discountPct ?? raw.discount_pct ?? 0) || 0;
    const dAmt  = Number(raw.discountAmt ?? raw.discount_amt ?? 0) || 0;
    const lineGross = qty * price;
    const totalDisc = Math.round((lineGross * pct / 100 + dAmt) * 100) / 100;
    const taxable   = Math.max(0, lineGross - totalDisc);
    const tax = taxable * itemRate / 100;
    hsnMap[key].taxable += taxable;
    hsnMap[key].cgst    += safeN(tax / 2);
    hsnMap[key].sgst    += safeN(tax / 2);
  });
  const hsnRows = Object.entries(hsnMap).map(([key, v]) => ({ hsn: key.split("__")[0], ...v }));

  return { companyName, address, gstin, phone, email, bank, ifsc, bankName, accountNo, branch,accountHolder,
    logoUrl, showLogo, sigUrl, defaultTerms,
    itemsSubtotal, chargesTotal, discountAmt, roundOff, grandTotal, alreadyReceived, hsnRows };
}

// ─── Helper: resolve snapshot meta fields ─────────────────────────────────────
// Uses the snapshot frozen at save time. For older invoices without a snapshot,
// falls back to showing any field that has a non-empty value.
// KEY FIX: showVehicle defaults to TRUE so vehicle always renders when present.
function getSnapshotMeta(invoice: SalesInvoice) {
  const snap = invoice.snapshotMetaFields;
  if (snap) return snap;

  // Fallback for older invoices without a snapshot
  return {
    showSalesman:          true,   // always show if field has value
    showVehicle:           true,   // KEY FIX: was missing, defaulted wrong
    showChallan:           true,
    showFinancedBy:        true,
    showWarranty:          true,
    showEwayBill:          true,
    showPO:                true,
    showDispatchedThrough: true,
    showTransportName:     true,
    showEmailId:           true,
    // For custom fields: show all that have values
    customFieldLabels: invoice.customFieldValues
      ? Object.keys(invoice.customFieldValues)
      : [],
  };
}

// ── Great Eastern Style Layout ────────────────────────────────────────────────
function GreatEasternLayout({ invoice, business, template, printRef, themeColor, bgImageUrl, bgOpacity }: Omit<InvoicePaperProps,"themeLayout">) {
  const {
    companyName, address, gstin, phone, email,
    bank, ifsc, bankName, accountNo, branch,accountHolder,
    logoUrl, showLogo, sigUrl, defaultTerms,
    grandTotal, alreadyReceived, hsnRows,
  } = useInvoiceData(invoice, business, template);

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

  // ── Snapshot-based field visibility (frozen at save time) ─────────────────
  const snap = getSnapshotMeta(invoice);

  // ── Custom fields: use snapshot labels if available, else all keys in customFieldValues
  // This is the KEY FIX: custom fields (abc, def, etc.) now always render when present.
  const customFieldLabels: string[] = snap.customFieldLabels && snap.customFieldLabels.length > 0
    ? snap.customFieldLabels
    : (invoice.customFieldValues ? Object.keys(invoice.customFieldValues) : []);
  const customFieldValues = invoice.customFieldValues ?? {};

  const pd    = invoice.paymentDetails;
  const fin   = invoice.financeDetails;
  const hasFin = !!(fin && (fin.financerName || fin.loanRefNo || fin.loanAmount || fin.emi));

  const invoiceType = fin ? "FINANCE" : "TAX";

  const MIN_ROWS = 8;
  const NCOLS = 12;
  const fillerCount = Math.max(0, MIN_ROWS - invoice.billItems.length);

  const computedGrandTotal = calcTotal(invoice);
  const receivedAmt        = getAlreadyReceived(invoice);
  const balanceAmt         = invoice.outstandingAmount != null
    ? Number(invoice.outstandingAmount)
    : Math.max(0, computedGrandTotal - receivedAmt);

  // ── Reusable meta row renderer ────────────────────────────────────────────
  const MetaRow = ({ label, value }: { label: string; value: string | undefined | null }) => {
    if (!value) return null;
    return (
      <div style={{ display: "flex", gap: 4, marginBottom: 2 }}>
        <span style={{ fontWeight: 700, minWidth: 100 }}>{label}</span>
        <span>: {value}</span>
      </div>
    );
  };

  return (
    <div
      ref={printRef}
      className="ivm-invoice-paper ge-invoice-paper"
      style={{
        fontFamily: "'Times New Roman', Georgia, serif",
        fontSize: "10px",
        color: "#1a1a1a",
        background: "#fff",
        padding: 0,
        overflow: "hidden",
        width: "100%",
        maxWidth: "100%",
        margin: 0,
        position: "relative",
        border: "2px solid #333",
        boxSizing: "border-box",
      }}
    >
      {/* ── HEADER ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "120px 1fr 100px",
        alignItems: "center",
        padding: "10px 14px 8px",
        borderBottom: B,
        gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
          {showLogo && logoUrl && (
            <img src={logoUrl} alt="Logo" style={{ height: 56, maxWidth: 110, objectFit: "contain" }} />
          )}
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.12em", color: "#111", marginBottom: 2, fontFamily: "'Times New Roman', Georgia, serif" }}>
            TAX INVOICE
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#111", fontFamily: "'Georgia', 'Times New Roman', serif", letterSpacing: "0.02em", lineHeight: 1.1, marginBottom: 3 }}>
            {companyName}
          </div>
          {address && <div style={{ fontSize: 9.5, color: "#333", lineHeight: 1.5 }}>{address}</div>}
          {/* ── STATIC contact details — Phone, Mobile, PAN (no email) ── */}
          <div style={{ fontSize: 9.5, color: "#333" }}>
            <span>Phone: 2646 1320</span>
            <span>{"  "}Mobile: 9831789022</span>
            <span>{"  "}PAN No.: AFTPM0665H</span>
          </div>
          {gstin && <div style={{ fontSize: 9.5, fontWeight: 700, color: "#111", marginTop: 1 }}>GSTIN NO : {gstin}</div>}
        </div>
        <div style={{ width: 90, height: 90, flexShrink: 0, marginLeft: "auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={BILL_QR} alt="QR Code" style={{ width: 88, height: 88, objectFit: "contain", display: "block" }} />
        </div>
      </div>

      {/* ── Row 2: Transport / Invoice Meta ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: B }}>

        {/* LEFT — transport info */}
        <div style={{ borderRight: B, padding: "5px 10px", fontSize: 9.5 }}>
          {/* Transportation Mode */}
{invoice.dispatchedThrough && (
  <div style={{ display: "flex", gap: 4, marginBottom: 2 }}>
    <span style={{ fontWeight: 700, minWidth: 120 }}>Transportation Mode</span>
    <span>: {invoice.dispatchedThrough}</span>
  </div>
)}

{/* Vehicle No */}
{invoice.vehicleNo && (
  <div style={{ display: "flex", gap: 4, marginBottom: 2 }}>
    <span style={{ fontWeight: 700, minWidth: 120 }}>Vehicle No.</span>
    <span>: {invoice.vehicleNo}</span>
  </div>
)}
          {/* <div style={{ display: "flex", gap: 4, marginBottom: 2 }}>
            <span style={{ fontWeight: 700, minWidth: 120 }}>Date &amp; Time of Supply</span>
            <span>: {fmtDateSlash(invoice.invoiceDate)}</span>
          </div> */}
          {/* <div style={{ display: "flex", gap: 4, marginBottom: 2 }}>
            <span style={{ fontWeight: 700, minWidth: 120 }}>Place of Supply</span>
            <span>: {invoice.party?.billingAddress?.split(",").pop()?.trim() || "-"}</span>
          </div> */}
          {snap.showFinancedBy && invoice.financedBy && (
            <div style={{ display: "flex", gap: 4 }}>
              <span style={{ fontWeight: 700, minWidth: 120 }}>Financer's Name</span>
              <span>: {invoice.financedBy}</span>
            </div>
          )}
        </div>

        {/* RIGHT — invoice meta + ALL custom fields */}
        <div style={{ padding: "5px 10px", fontSize: 9.5 }}>

          {/* Fixed meta fields */}
          <MetaRow label="Type of Invoice" value={invoiceType} />
          <MetaRow label="Invoice No."     value={String(invoice.invoiceNo)} />
          <MetaRow label="Invoice Date"    value={fmtDateSlash(invoice.invoiceDate)} />

          {/* Salesman */}
          {snap.showSalesman && invoice.salesman && (
            <MetaRow label="Salesman" value={invoice.salesman} />
          )}

          {/* Challan */}
          {snap.showChallan && invoice.challanNo && (
            <MetaRow label="Challan No." value={invoice.challanNo} />
          )}

          {/* Warranty */}
          {snap.showWarranty && invoice.warrantyPeriod && (
            <MetaRow label="Warranty Period" value={invoice.warrantyPeriod} />
          )}

          {/* E-Way Bill */}
          {snap.showEwayBill && invoice.eWayBillNo && (
            <MetaRow label="E-Way Bill No." value={invoice.eWayBillNo} />
          )}

          {/* PO Number */}
          {snap.showPO && invoice.poNumber && (
            <MetaRow label="Order No" value={invoice.poNumber} />
          )}

          {/* Email */}
          {snap.showEmailId && invoice.emailId && (
            <MetaRow label="Email ID" value={invoice.emailId} />
          )}

          {/* Transport Name */}
          {snap.showTransportName && invoice.transportName && (
            <MetaRow label="Transport" value={invoice.transportName} />
          )}

          {/* ── CUSTOM FIELDS (abc, def, Invoice Type, etc.) ──────────────
              KEY FIX: iterate ALL customFieldLabels from snapshot (or all keys
              if no snapshot). Each label with a non-empty value is rendered.
              This is why abc=100 and def=rohan were missing — they were never
              iterated here before. */}
          {customFieldLabels.map(label => {
            const val = customFieldValues[label];
            if (val == null || val === "") return null;
            return (
              <div key={label} style={{ display: "flex", gap: 4, marginBottom: 2 }}>
                <span style={{ fontWeight: 700, minWidth: 100 }}>{label}</span>
                <span>: {val}</span>
              </div>
            );
          })}

          {/* Due Date */}
          {invoice.dueDate && (
            <MetaRow label="Due Date" value={fmtDateSlash(invoice.dueDate)} />
          )}

        </div>
      </div>

      {/* ── Row 3: Billing / Shipping Address ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: B }}>
        <div style={{ borderRight: B, padding: "7px 10px", fontSize: 9.5 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#333", marginBottom: 3, textTransform: "uppercase" as const }}>
            Details of Receiver (Billing Address)
          </div>
          {invoice.party ? (
            <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", rowGap: 2 }}>
              <span style={{ fontWeight: 700 }}>Name</span>
              <span>: <strong>{invoice.party.name}</strong></span>
              {invoice.party.billingAddress && <>
                <span style={{ fontWeight: 700 }}>Address</span>
                <span>: {invoice.party.billingAddress}</span>
              </>}
              {invoice.party.mobile && <>
                <span style={{ fontWeight: 700 }}>Contact No</span>
                <span>: {invoice.party.mobile}</span>
              </>}
              {/* <span style={{ fontWeight: 700 }}>State</span>
              <span>: WEST BENGAL</span> */}
              <span style={{ fontWeight: 700 }}>GSTIN</span>
              <span>: {invoice.party.gstin || "Un-Registered"}</span>
            </div>
          ) : (
            <div style={{ color: "#aaa" }}>–</div>
          )}
        </div>
        <div style={{ padding: "7px 10px", fontSize: 9.5 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#333", marginBottom: 3, textTransform: "uppercase" as const }}>
            Details of Consignee (Shipping Address)
          </div>
          {(invoice.shipTo || invoice.party) ? (
            <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", rowGap: 2 }}>
              <span style={{ fontWeight: 700 }}>Name</span>
              <span>: <strong>{invoice.shipTo?.name || invoice.party?.name}</strong></span>
              {(invoice.shipTo?.billingAddress || invoice.party?.billingAddress) && <>
                <span style={{ fontWeight: 700 }}>Address</span>
                <span>: {invoice.shipTo?.billingAddress || invoice.party?.billingAddress}</span>
              </>}
              {(invoice.shipTo?.mobile || invoice.party?.mobile) && <>
                <span style={{ fontWeight: 700 }}>Contact No</span>
                <span>: {invoice.shipTo?.mobile || invoice.party?.mobile}</span>
              </>}
              {/* <span style={{ fontWeight: 700 }}>State</span>
              <span>: WEST BENGAL</span> */}
              {/* <span style={{ fontWeight: 700 }}>GSTIN</span> */}
              {/* <span>: {invoice.party?.billingAddress?.split(",").pop()?.trim() || "-"}</span> */}
            </div>
          ) : (
            <div style={{ color: "#aaa" }}>–</div>
          )}
        </div>
      </div>

      {/* ── Items Table ── */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <colgroup>
          <col style={{ width: "4%" }}/>
          <col style={{ width: "20%" }}/>
          <col style={{ width: "7%" }}/>
          <col style={{ width: "6%" }}/>
          <col style={{ width: "8%" }}/>
          <col style={{ width: "8%" }}/>
          <col style={{ width: "9%" }}/>
          <col style={{ width: "5%" }}/>
          <col style={{ width: "7%" }}/>
          <col style={{ width: "5%" }}/>
          <col style={{ width: "7%" }}/>
          <col style={{ width: "10%" }}/>
        </colgroup>
        <thead>
          <tr>
            <th style={TH}>Sl.</th>
            <th style={{ ...TH, textAlign: "left" as const }}>Description</th>
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
          {invoice.billItems.map((item, idx) => {
            const raw     = item as any;
            const taxRate = Number(raw.taxRate ?? raw.tax_rate ?? 0) || 0;
            const qty     = Number(item.qty) || 0;
            const price   = Number(item.price) || 0;
            const pct     = Number(raw.discountPct ?? raw.discount_pct ?? 0) || 0;
            const discAmt = Number(raw.discountAmt ?? raw.discount_amt ?? 0) || 0;
            const lineGross = qty * price;
            const totalDisc = Math.round((lineGross * pct / 100 + discAmt) * 100) / 100;
            const taxable   = Math.max(0, lineGross - totalDisc);
            const cgstPct   = taxRate / 2;
            const cgstAmt   = Math.round(taxable * cgstPct / 100 * 100) / 100;
            const sgstAmt   = cgstAmt;

            const discDisplay = pct > 0
              ? `${pct}%\n(${fmtN(totalDisc)})`
              : discAmt > 0
                ? fmtN(discAmt)
                : "-";

            return (
              <tr key={idx}>
                <td style={{ ...TD, textAlign: "center" as const }}>{idx + 1}</td>
                <td style={TD}>
                  <div style={{ fontWeight: 600 }}>{item.name || "Item"}</div>
                  {item.description && (
                    <div style={{ fontSize: 8.5, color: "#555", marginTop: 1,whiteSpace: "pre-line" }}>{item.description}</div>
                  )}
                </td>
                <td style={{ ...TD, textAlign: "center" as const }}>{item.hsn || "-"}</td>
                <td style={{ ...TD, textAlign: "center" as const }}>{qty}<br/>{item.unit || "PCS"}</td>
                <td style={{ ...TD, textAlign: "right" as const }}>{fmtN(price)}</td>
                <td style={{ ...TD, textAlign: "right" as const, whiteSpace: "pre-line" as const }}>
                  {discDisplay}
                </td>
                <td style={{ ...TD, textAlign: "right" as const }}>{fmtN(taxable)}</td>
                <td style={{ ...TD, textAlign: "center" as const }}>{taxRate > 0 ? cgstPct : "-"}</td>
                <td style={{ ...TD, textAlign: "right" as const }}>{taxRate > 0 ? fmtN(cgstAmt) : "-"}</td>
                <td style={{ ...TD, textAlign: "center" as const }}>{taxRate > 0 ? cgstPct : "-"}</td>
                <td style={{ ...TD, textAlign: "right" as const }}>{taxRate > 0 ? fmtN(sgstAmt) : "-"}</td>
                <td style={{ ...TD, textAlign: "right" as const, fontWeight: 600 }}>{fmtN(Number(item.amount))}</td>
              </tr>
            );
          })}
          {Array.from({ length: fillerCount }).map((_, i) => (
            <tr key={`fill${i}`} style={{ height: 18 }}>
              {Array.from({ length: NCOLS }).map((__, j) => (
                <td key={j} style={{ ...TD, borderTop: "none", borderBottom: "none" }} />
              ))}
            </tr>
          ))}
          <tr>
            <td colSpan={3} style={{ ...TD, fontWeight: 700, textAlign: "right" as const, background: "#f0f0f0" }}>Total</td>
            <td style={{ ...TD, textAlign: "center" as const, fontWeight: 700, background: "#f0f0f0" }}>
              {invoice.billItems.reduce((s, i) => s + Number(i.qty), 0)}
            </td>
            <td style={{ ...TD, background: "#f0f0f0" }}></td>
            <td style={{ ...TD, textAlign: "right" as const, fontWeight: 700, background: "#f0f0f0" }}>
              {fmtN(invoice.billItems.reduce((s, item) => {
                const raw = item as any;
                const qty = Number(item.qty) || 0;
                const price = Number(item.price) || 0;
                const pct = Number(raw.discountPct ?? raw.discount_pct ?? 0) || 0;
                const dAmt = Number(raw.discountAmt ?? raw.discount_amt ?? 0) || 0;
                const lineGross = qty * price;
                return s + Math.round((lineGross * pct / 100 + dAmt) * 100) / 100;
              }, 0))}
            </td>
            <td style={{ ...TD, textAlign: "right" as const, fontWeight: 700, background: "#f0f0f0" }}>
              {fmtN(invoice.billItems.reduce((s, item) => {
                const raw = item as any;
                const qty = Number(item.qty) || 0;
                const price = Number(item.price) || 0;
                const pct = Number(raw.discountPct ?? raw.discount_pct ?? 0) || 0;
                const dAmt = Number(raw.discountAmt ?? raw.discount_amt ?? 0) || 0;
                const lineGross = qty * price;
                const totalDisc = Math.round((lineGross * pct / 100 + dAmt) * 100) / 100;
                return s + Math.max(0, lineGross - totalDisc);
              }, 0))}
            </td>
            <td style={{ ...TD, background: "#f0f0f0" }}></td>
            <td style={{ ...TD, textAlign: "right" as const, fontWeight: 700, background: "#f0f0f0" }}>
              {fmtN(hsnRows.reduce((s, r) => s + r.cgst, 0))}
            </td>
            <td style={{ ...TD, background: "#f0f0f0" }}></td>
            <td style={{ ...TD, textAlign: "right" as const, fontWeight: 700, background: "#f0f0f0" }}>
              {fmtN(hsnRows.reduce((s, r) => s + r.sgst, 0))}
            </td>
            <td style={{ ...TD, textAlign: "right" as const, fontWeight: 700, background: "#f0f0f0" }}>
              {fmtN(computedGrandTotal)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Total in words ── */}
      <div style={{ padding: "6px 12px", borderTop: B, borderBottom: B, fontSize: 10 }}>
        <strong>Total: Rupees </strong>{numToWords(computedGrandTotal)}
        <span style={{ float: "right", fontWeight: 700, fontSize: 11 }}>₹ {fmtN(computedGrandTotal)}</span>
      </div>

      {/* ── Additional Charges ── */}
      {invoice.additionalCharges && invoice.additionalCharges.length > 0 && (
        <div style={{ borderBottom: B }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9.5 }}>
            <thead>
              <tr>
                <th style={{ ...TD, textAlign: "left" as const, fontWeight: 700, background: "#f5f5f5", border: B }}>Additional Charges</th>
                <th style={{ ...TD, textAlign: "center" as const, fontWeight: 700, background: "#f5f5f5", border: B }}>Tax</th>
                <th style={{ ...TD, textAlign: "right" as const, fontWeight: 700, background: "#f5f5f5", border: B }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.additionalCharges.map((charge, idx) => (
                <tr key={idx}>
                  <td style={{ ...TD }}>{charge.label || `Charge ${idx + 1}`}</td>
                  <td style={{ ...TD, textAlign: "center" as const }}>{charge.taxLabel || "No Tax"}</td>
                  <td style={{ ...TD, textAlign: "right" as const }}>{fmtN(Number(charge.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Payment Table ── */}
      {pd?.method && (() => {
        // ── Build the column list dynamically based on:
        //    1. Which payment method is selected
        //    2. Which optional fields the user actually filled in
        // For Cash: only Payment Type + Amount are shown.
        // For every other method: show all fields that are relevant to that
        //    method AND have a non-empty value.

        const isCash        = pd.method === "Cash";
        const isUPI         = pd.method === "UPI";
        const isCard        = pd.method === "Card";
        const isNetbanking  = pd.method === "Netbanking";
        const isBankTransfer= pd.method === "Bank Transfer";
        const isCheque      = pd.method === "Cheque";

        // Determine which columns to show (only when the field is relevant AND filled)
        const showRef    = !isCash && (isUPI || isNetbanking || isBankTransfer || isCheque) && !!pd.refNo;
        const showAuth   = isCard  && !!pd.authNo;
        const showBank   = !isCash && !isUPI && (isCard || isNetbanking || isBankTransfer || isCheque) && !!pd.bankName;
        const showUPIApp = isUPI   && !!pd.bankName;   // UPI "bank" field is labelled "UPI App"
        const showCard   = isCard  && !!pd.cardType;
        const showCheque = isCheque && !!pd.chequeDate;
        const showBranch = (isCheque || isBankTransfer) && !!pd.branchName;

        // Ref column label changes per method
        const refLabel =
          isUPI         ? "UPI / Txn ID"   :
          isBankTransfer? "UTR Number"      :
          isNetbanking  ? "Transaction ID"  :
          isCheque      ? "Cheque No."      : "Ref. No";

        const TH9 = {
          ...TD, fontWeight: 700, fontSize: 9,
          textAlign: "center" as const,
          background: "#f5f5f5", border: B,
        };

        return (
          <div style={{ borderBottom: B }}>
            <div style={{ padding: "5px 12px", fontWeight: 800, fontSize: 11.5, letterSpacing: "0.22em", borderBottom: B, fontFamily: "'Times New Roman', serif" }}>
              P A Y M E N T
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9.5 }}>
              <thead>
                <tr>
                  <th style={TH9}>Payment<br />Type</th>
                  {showRef    && <th style={TH9}>{refLabel}</th>}
                  {showAuth   && <th style={TH9}>Auth No.</th>}
                  {showUPIApp && <th style={TH9}>UPI App</th>}
                  {showBank   && <th style={TH9}>Bank Name</th>}
                  {showCard   && <th style={TH9}>Card Type</th>}
                  {showCheque && <th style={TH9}>Cheque<br />Date</th>}
                  {showBranch && <th style={TH9}>Branch Name</th>}
                  <th style={{ ...TH9, textAlign: "right" as const }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...TD, textAlign: "center" as const }}>{pd.method}</td>
                  {showRef    && <td style={{ ...TD, textAlign: "center" as const }}>{pd.refNo}</td>}
                  {showAuth   && <td style={{ ...TD, textAlign: "center" as const }}>{pd.authNo}</td>}
                  {showUPIApp && <td style={{ ...TD, textAlign: "center" as const }}>{pd.bankName}</td>}
                  {showBank   && <td style={{ ...TD, textAlign: "center" as const }}>{pd.bankName}</td>}
                  {showCard   && <td style={{ ...TD, textAlign: "center" as const }}>{pd.cardType}</td>}
                  {showCheque && <td style={{ ...TD, textAlign: "center" as const }}>{fmtDateSlash(pd.chequeDate!)}</td>}
                  {showBranch && <td style={{ ...TD, textAlign: "center" as const }}>{pd.branchName}</td>}
                  <td style={{ ...TD, textAlign: "right" as const, fontWeight: 600 }}>
                    {fmtN(Number(pd.amount) || receivedAmt)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })()}

      {/* ── Amount Received & Balance ── */}
      {receivedAmt > 0 && (
        <div style={{ borderBottom: B, fontSize: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 12px", borderBottom: "1px solid #e0e0e0" }}>
            <span style={{ fontWeight: 700 }}>Amount Received</span>
            <span style={{ fontWeight: 700, color: "#16a34a" }}>₹ {fmtN(receivedAmt)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 12px" }}>
            <span style={{ fontWeight: 700 }}>Balance Amount</span>
            <span style={{ fontWeight: 700, color: balanceAmt > 0 ? "#dc2626" : "#16a34a" }}>₹ {fmtN(balanceAmt)}</span>
          </div>
        </div>
      )}

      {/* ── Finance Details ── */}
      {hasFin && fin && (
        <div style={{ borderBottom: B }}>
          <div style={{ padding: "5px 12px", textAlign: "center" as const, fontWeight: 800, fontSize: 11, letterSpacing: "0.12em", borderBottom: B, background: "#fafafa", fontFamily: "'Times New Roman', serif" }}>
            FINANCE DETAILS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "130px 1fr 80px 80px 160px", borderBottom: B, fontSize: 9.5 }}>
            <div style={{ padding: "6px 10px", borderRight: B }}>
              {fin.loanRefNo && <>
                <div style={{ fontSize: 8.5, color: "#555", fontWeight: 700, marginBottom: 2 }}>SF CODE / LOAN REF:</div>
                <div style={{ fontWeight: 700 }}>{fin.loanRefNo}</div>
              </>}
              {fin.emi && <>
                <div style={{ fontSize: 8.5, color: "#555", fontWeight: 700, marginTop: 4, marginBottom: 2 }}>EMI DETAILS:</div>
                <div style={{ fontWeight: 600, fontSize: 9.5 }}>
                  {fin.emi}×{fin.emiCount || 1}{fin.extraEmi ? ` + ${fin.extraEmi}×${fin.extraEmiCount || 1}` : ""}
                </div>
              </>}
              {fin.financerName && <>
                <div style={{ fontSize: 8.5, color: "#555", fontWeight: 700, marginTop: 4, marginBottom: 2 }}>FINANCER:</div>
                <div style={{ fontWeight: 600 }}>{fin.financerName}</div>
              </>}
            </div>
            <div style={{ padding: "6px 10px", borderRight: B }}>
              {fin.agentName && <div style={{ marginBottom: 3 }}><span style={{ fontSize: 8.5, color: "#555", fontWeight: 700 }}>ISD Name: </span><span>{fin.agentName}</span></div>}
              {fin.agentContact && <div style={{ marginBottom: 3 }}><span style={{ fontSize: 8.5, color: "#555", fontWeight: 700 }}>Contact: </span><span>{fin.agentContact}</span></div>}
              {fin.reference && <div><span style={{ fontSize: 8.5, color: "#555", fontWeight: 700 }}>Reference: </span><span>{fin.reference}</span></div>}
            </div>
            <div style={{ padding: "6px 10px", borderRight: B }}>
              <div style={{ fontSize: 8.5, color: "#555", fontWeight: 700, marginBottom: 2 }}>DBD:</div>
              <div style={{ fontWeight: 600 }}>{fin.dbdCharges != null ? fin.dbdCharges.toFixed(2) : "0.00"}</div>
            </div>
            <div style={{ padding: "6px 10px", borderRight: B }}>
              <div style={{ fontSize: 8.5, color: "#555", fontWeight: 700, marginBottom: 2 }}>PF:</div>
              <div style={{ fontWeight: 600 }}>{fin.processingFee != null ? fin.processingFee.toFixed(2) : "0.00"}</div>
            </div>
            <div style={{ padding: "6px 10px", background: "#f5f5f5" }}>
              <div style={{ fontSize: 8.5, color: "#555", fontWeight: 700, marginBottom: 2, lineHeight: 1.4 }}>FINANCE DUE<br />FROM FINANCER :</div>
              <div style={{ fontWeight: 700, fontSize: 12, color: "#111" }}>
                {fin.loanAmount != null ? Number(fin.loanAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "-"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Banking Details + Signature ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", borderBottom: B, alignItems: "stretch" }}>
        <div style={{ padding: "7px 12px", borderRight: B }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#222", marginBottom: 3 }}>Banking Details:</div>
          <div style={{ fontSize: 9.5, color: "#333", lineHeight: 1.8 }}>
            {bank && <span>Account Name: <strong>{bank}</strong>{"  "}</span>}
             {accountHolder && <span>Account Holder: <strong>{accountHolder}</strong>{"  "}</span>}
            {bankName && <span>Bank: <strong>{bankName}</strong>{"  "}</span>}
            {accountNo && <span>A/c No.: <strong>{accountNo}</strong>{"  "}</span>}
            {ifsc && <span>IFSC: <strong>{ifsc}</strong>{"  "}</span>}
            {branch && <span>Branch: <strong>{branch}</strong></span>}
          </div>
        </div>
        <div style={{ padding: "7px 14px", display: "flex", flexDirection: "column" as const, alignItems: "flex-end", justifyContent: "space-between", minWidth: 180 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#333", alignSelf: "flex-end" }}>E &amp; O.E.</div>
          <div style={{ textAlign: "center" as const, marginTop: 8 }}>
            {sigUrl
              ? <img src={sigUrl} alt="Signature" style={{ maxHeight: 50, maxWidth: 150, objectFit: "contain", display: "block", margin: "0 auto 4px" }} />
              : invoice.showEmptySignatureBox
                ? <div style={{ height: 44, width: 140, border: "1px dashed #bbb", margin: "0 auto 4px" }} />
                : <div style={{ height: 44 }} />
            }
            <div style={{ fontSize: 9, color: "#333" }}>For <strong>{companyName}</strong></div>
          </div>
        </div>
      </div>

      {/* ── Terms & Conditions ── */}
      <div style={{ padding: "7px 12px", borderBottom: B, fontSize: 9.5, lineHeight: 1.6 }}>
        <div style={{ whiteSpace: "pre-line" as const, color: "#333" }}>
          {invoice.termsConditions || defaultTerms}
        </div>
        {invoice.notes && (
          <div style={{ marginTop: 4 }}>
            <strong>Notes: </strong>{invoice.notes}
          </div>
        )}
        <div style={{ marginTop: 4, fontStyle: "italic", color: "#555" }}>
          No Tax Payable on Reverse Charge
        </div>
      </div>
    </div>
  );
}

// ── InvoicePaper router ──────────────────────────────────────────────────────
function InvoicePaper({ invoice, business, template, printRef, themeLayout, themeColor, bgImageUrl, bgOpacity }: InvoicePaperProps) {
  return (
    <GreatEasternLayout
      invoice={invoice}
      business={business}
      template={template}
      printRef={printRef}
      themeColor={themeColor}
      bgImageUrl={bgImageUrl}
      bgOpacity={bgOpacity}
    />
  );
}

// ─── Main InvoiceViewModal ────────────────────────────────────────────────────
export default function InvoiceViewModal({
  invoice: initialInvoice, template, business, onClose, onEdit,
  onPaymentSaved, onDuplicate, onDelete, onCancel, onCreditNote, onProfitDetails,
}: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const [invoice, setInvoice] = useState<SalesInvoice>(initialInvoice);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [dotsOpen, setDotsOpen] = useState(false);
  const [showProfitModal, setShowProfitModal] = useState(false);
  const dotsRef = useRef<HTMLDivElement>(null);

  const [activeTheme] = useState<ActiveTemplateSettings>(loadActiveTemplate);
  const themeLayout = activeTheme.themeLayout;
  const themeColor  = activeTheme.themeColor;
  const bgImageUrl  = activeTheme.bgImageUrl;
  const bgOpacity   = activeTheme.bgOpacity;

  const font     = template?.style?.font     ?? "Times New Roman";
  const fontSize = template?.style?.textSize ?? "10px";

  const pdfFileName = invoice.party?.name
    ? `${invoice.party.name.replace(/[^a-zA-Z0-9\s]/g, "").trim()}-Invoice-${invoice.invoiceNo}`
    : `Invoice-${invoice.invoiceNo}`;

  function buildInvoiceHtml(content: string) {
    const fontName = font.replace(/ /g, "+");
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
    <title>${pdfFileName}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700;800&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      body{font-family:'${font}',Georgia,'Times New Roman',serif;font-size:${fontSize};color:#1a1a1a;background:#f0f0f0;-webkit-print-color-adjust:exact;print-color-adjust:exact;padding:24px;}
      .ge-invoice-wrapper{max-width:860px;margin:0 auto;}
      table{width:100%;border-collapse:collapse;}
      th,td{padding:5px 6px;}
      .ivm-invoice-paper,.ge-invoice-paper{border:2px solid #333 !important;background:#fff;}
      *{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;color-adjust:exact !important;}
      @media print{body{margin:0;padding:12px;background:#fff;}.ge-invoice-wrapper{max-width:none;}.ge-invoice-paper{border:2px solid #333 !important;}}
    </style></head>
    <body>
      <div class="ge-invoice-wrapper">
        ${content}
      </div>
    </body></html>`;
  }

  async function embedImages(html: string): Promise<string> {
    const srcPattern = /(<img[^>]+src=")([^"]+)(")/g;
    const matches: { full: string; pre: string; src: string; post: string }[] = [];
    let m: RegExpExecArray | null;
    while ((m = srcPattern.exec(html)) !== null) {
      matches.push({ full: m[0], pre: m[1], src: m[2], post: m[3] });
    }
    const cache: Record<string, string> = {};
    for (const { src } of matches) {
      if (!cache[src] && !src.startsWith("data:")) {
        cache[src] = await toBase64DataUrl(src);
      }
    }
    return html.replace(srcPattern, (_full, pre, src, post) => {
      const b64 = cache[src];
      return b64 ? `${pre}${b64}${post}` : `${pre}${src}${post}`;
    });
  }

  async function handlePrint() {
    const rawContent = printRef.current?.outerHTML ?? "";
    const content    = await embedImages(rawContent);
    const w = window.open("", "_blank");
    if (!w) { alert("Please allow popups to print."); return; }
    w.document.write(buildInvoiceHtml(content));
    w.document.close(); w.focus();
    setTimeout(() => { w.print(); }, 800);
  }

  async function handleDownload() {
    const rawContent = printRef.current?.outerHTML ?? "";
    const content    = await embedImages(rawContent);
    const html       = buildInvoiceHtml(content);
    const blob       = new Blob([html], { type: "text/html;charset=utf-8" });
    const url        = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    if (!w) {
      const a = document.createElement("a");
      a.href = url;
      a.download = `${pdfFileName}.html`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      return;
    }
    w.addEventListener("load", () => {
      w.document.title = pdfFileName;
      setTimeout(() => { w.print(); setTimeout(() => URL.revokeObjectURL(url), 60000); }, 800);
    });
  }

  useEffect(() => {
    function h(e: KeyboardEvent) { if (e.key === "Escape" && !showRecordPayment) onClose(); }
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [showRecordPayment]);

  const grandTotal      = calcTotal(invoice);
  const alreadyReceived = getAlreadyReceived(invoice);
  const balance         = grandTotal - alreadyReceived;
  const statusColor     = invoice.status === "Paid" ? "#16a34a" : invoice.status === "Unpaid" ? "#dc2626" : invoice.status === "Partially Paid" ? "#d97706" : "#6b7280";

  return (
    <>
      <div className="ivm-overlay" onClick={onClose}>
        <div className="ivm-shell" onClick={e => e.stopPropagation()}>
          <div className="ivm-topbar">
            <div className="ivm-topbar-left">
              <button className="ivm-back-btn" onClick={onClose}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
              <span className="ivm-title">Sales Invoice #{invoice.invoiceNo}</span>
              <span className="ivm-status-badge" style={{ background:statusColor+"18", color:statusColor, border:`1px solid ${statusColor}40` }}>{invoice.status}</span>
            </div>
            <div className="ivm-topbar-right">
              <button className="ivm-top-btn" onClick={() => { setShowProfitModal(true); onProfitDetails?.(); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>Profit Details
              </button>
              <div ref={dotsRef} style={{ position:"relative" }}>
                <button className="ivm-top-btn ivm-top-btn--dots" onClick={() => setDotsOpen(v => !v)}>
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width:16, height:16 }}><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                </button>
                {dotsOpen && (
                  <div style={{ position:"absolute",top:"calc(100% + 6px)",right:0,zIndex:500,background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,boxShadow:"0 10px 28px rgba(0,0,0,.15)",minWidth:200,overflow:"hidden" }} onClick={() => setDotsOpen(false)}>
                    {[
                      { icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, label:"Edit", action:onEdit },
                      { icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.99"/></svg>, label:"Edit History", action:()=>{} },
                      { icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>, label:"Duplicate", action:onDuplicate },
                      { icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, label:"Issue Credit Note", action:onCreditNote },
                      null,
                      { icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>, label:"Cancel Invoice", action:onCancel, warning:true },
                      { icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>, label:"Delete", action:onDelete, danger:true },
                    ].map((item, i) => item === null ? (
                      <div key={i} style={{ height:1, background:"#f3f4f6", margin:"2px 0" }}/>
                    ) : (
                      <button key={i} onClick={item.action} style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 16px",background:"none",border:"none",cursor:"pointer",fontSize:14,color:(item as any).danger?"#dc2626":(item as any).warning?"#d97706":"#374151",fontWeight:500,textAlign:"left" }} onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")} onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                        {item.icon} {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="ivm-close-btn" onClick={onClose}>✕</button>
            </div>
          </div>

          <div className="ivm-actionbar">
            <div className="ivm-actionbar-left">
              <div className="ivm-action-group">
                <button className="ivm-action-btn" onClick={() => { handlePrint(); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Print PDF
                </button>
                <button className="ivm-action-split"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></button>
              </div>
              <div className="ivm-action-group">
                <button className="ivm-action-btn" onClick={() => { handleDownload(); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download PDF
                </button>
                <button className="ivm-action-split"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></button>
              </div>
              <div className="ivm-action-group">
                <button className="ivm-action-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  Share
                </button>
                <button className="ivm-action-split"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></button>
              </div>
            </div>
            <div className="ivm-actionbar-right">
              <button className="ivm-record-btn" onClick={e => { e.stopPropagation(); setShowRecordPayment(true); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Record Payment In
              </button>
            </div>
          </div>

          <div className="ivm-body">
            <div className="ivm-preview-area">
              <div className="ivm-preview-label">
                TAX INVOICE<span className="ivm-original-tag">ORIGINAL FOR RECIPIENT</span>
              </div>
              <InvoicePaper
                invoice={invoice}
                business={business}
                template={template}
                printRef={printRef}
                themeLayout={themeLayout}
                themeColor={themeColor}
                bgImageUrl={bgImageUrl}
                bgOpacity={bgOpacity}
              />
            </div>

            <div className="ivm-sidebar">
              <div className="ivm-sidebar-title">Payment History</div>
              <div className="ivm-ph-row"><span>Invoice Amount</span><strong>₹{grandTotal.toLocaleString("en-IN")}</strong></div>
              <div className="ivm-ph-row"><span>Total Amount Received</span><strong>₹{alreadyReceived.toLocaleString("en-IN")}</strong></div>
              {alreadyReceived > 0 && (
                <div className="ivm-ph-entry">
                  <div className="ivm-ph-entry-top"><span>Payment Received</span><strong style={{ color:"#16a34a" }}>₹{alreadyReceived.toLocaleString("en-IN")}</strong></div>
                  <div className="ivm-ph-entry-date">{fmtDate(invoice.createdAt)}</div>
                </div>
              )}

              {/* ── FIX 5: Show paymentDetails in sidebar if present ── */}
              {invoice.paymentDetails && invoice.paymentDetails.method && invoice.paymentDetails.method !== "Cash" && (
                <div style={{ marginTop: 10, padding: "8px 10px", background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}>
                  <div style={{ fontWeight: 700, color: "#374151", marginBottom: 4, fontSize: 12 }}>Payment Details</div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", marginBottom: 2 }}>
                    <span>Method</span><span style={{ color: "#111827", fontWeight: 500 }}>{invoice.paymentDetails.method}</span>
                  </div>
                  {invoice.paymentDetails.refNo && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", marginBottom: 2 }}>
                      <span>Ref No.</span><span style={{ color: "#111827", fontWeight: 500 }}>{invoice.paymentDetails.refNo}</span>
                    </div>
                  )}
                  {invoice.paymentDetails.bankName && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", marginBottom: 2 }}>
                      <span>Bank</span><span style={{ color: "#111827", fontWeight: 500 }}>{invoice.paymentDetails.bankName}</span>
                    </div>
                  )}
                  {invoice.paymentDetails.authNo && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", marginBottom: 2 }}>
                      <span>Auth No.</span><span style={{ color: "#111827", fontWeight: 500 }}>{invoice.paymentDetails.authNo}</span>
                    </div>
                  )}
                  {invoice.paymentDetails.cardType && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", marginBottom: 2 }}>
                      <span>Card Type</span><span style={{ color: "#111827", fontWeight: 500 }}>{invoice.paymentDetails.cardType}</span>
                    </div>
                  )}
                  {invoice.paymentDetails.chequeDate && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", marginBottom: 2 }}>
                      <span>Cheque Date</span><span style={{ color: "#111827", fontWeight: 500 }}>{invoice.paymentDetails.chequeDate}</span>
                    </div>
                  )}
                  {invoice.paymentDetails.branchName && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280" }}>
                      <span>Branch</span><span style={{ color: "#111827", fontWeight: 500 }}>{invoice.paymentDetails.branchName}</span>
                    </div>
                  )}
                </div>
              )}

              {/* ── FIX 5b: Show financeDetails in sidebar if present ── */}
              {invoice.financeDetails && (invoice.financeDetails.financerName || invoice.financeDetails.loanRefNo) && (
                <div style={{ marginTop: 10, padding: "8px 10px", background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe", fontSize: 12 }}>
                  <div style={{ fontWeight: 700, color: "#1d4ed8", marginBottom: 4, fontSize: 12 }}>Finance Details</div>
                  {invoice.financeDetails.financerName && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", marginBottom: 2 }}>
                      <span>Financer</span><span style={{ color: "#111827", fontWeight: 500 }}>{invoice.financeDetails.financerName}</span>
                    </div>
                  )}
                  {invoice.financeDetails.loanRefNo && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", marginBottom: 2 }}>
                      <span>Loan Ref</span><span style={{ color: "#111827", fontWeight: 500 }}>{invoice.financeDetails.loanRefNo}</span>
                    </div>
                  )}
                  {invoice.financeDetails.loanAmount != null && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", marginBottom: 2 }}>
                      <span>Loan Amt</span><span style={{ color: "#111827", fontWeight: 500 }}>₹{Number(invoice.financeDetails.loanAmount).toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {invoice.financeDetails.emi != null && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", marginBottom: 2 }}>
                      <span>EMI</span><span style={{ color: "#111827", fontWeight: 500 }}>₹{invoice.financeDetails.emi} × {invoice.financeDetails.emiCount ?? 1}</span>
                    </div>
                  )}
                  {invoice.financeDetails.agentName && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280" }}>
                      <span>Agent</span><span style={{ color: "#111827", fontWeight: 500 }}>{invoice.financeDetails.agentName}</span>
                    </div>
                  )}
                </div>
              )}
              <div style={{ flex:1 }}/>
              <div className="ivm-ph-total-row"><span>Total Amount Received</span><strong>₹{alreadyReceived.toLocaleString("en-IN")}</strong></div>
              <div className="ivm-ph-balance-row"><span>Balance Amount</span><strong style={{ color:balance > 0 ? "#dc2626" : "#16a34a" }}>₹{balance.toLocaleString("en-IN")}</strong></div>
            </div>
          </div>
        </div>
      </div>

      {showRecordPayment && (<RecordPaymentModal invoice={invoice} onClose={() => setShowRecordPayment(false)} onSaved={updated => { setInvoice(updated); setShowRecordPayment(false); onPaymentSaved?.(); }}/>)}
      {dotsOpen && <div style={{ position:"fixed",inset:0,zIndex:499 }} onClick={() => setDotsOpen(false)}/>}

      {showProfitModal && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:4000,display:"flex",alignItems:"center",justifyContent:"center" }} onClick={() => setShowProfitModal(false)}>
          <div style={{ background:"#fff",borderRadius:16,width:580,maxWidth:"95vw",boxShadow:"0 24px 60px rgba(0,0,0,.2)",fontFamily:"Segoe UI,sans-serif" }} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 24px",borderBottom:"1px solid #f3f4f6" }}><span style={{ fontSize:16,fontWeight:700,color:"#111827" }}>Profit Calculation</span><button onClick={() => setShowProfitModal(false)} style={{ background:"none",border:"none",cursor:"pointer",color:"#6b7280",fontSize:20,lineHeight:1 }}>✕</button></div>
            <div style={{ padding:"0 24px 24px" }}>
              <table style={{ width:"100%",borderCollapse:"collapse",marginTop:16 }}>
                <thead><tr style={{ borderBottom:"2px solid #f3f4f6" }}><th style={{ textAlign:"left",fontSize:11,fontWeight:700,color:"#6b7280",padding:"8px 0",textTransform:"uppercase",letterSpacing:"0.5px" }}>Item Name</th><th style={{ textAlign:"center",fontSize:11,fontWeight:700,color:"#6b7280",padding:"8px 0",textTransform:"uppercase",letterSpacing:"0.5px" }}>QTY</th><th style={{ textAlign:"center",fontSize:11,fontWeight:700,color:"#4f46e5",padding:"8px 0",textTransform:"uppercase",letterSpacing:"0.5px" }}>Purchase Price<br/><span style={{ fontWeight:400,textTransform:"none" }}>(Excl. Taxes)</span></th><th style={{ textAlign:"right",fontSize:11,fontWeight:700,color:"#6b7280",padding:"8px 0",textTransform:"uppercase",letterSpacing:"0.5px" }}>Total Cost</th></tr></thead>
                <tbody>{invoice.billItems.map((item:any,i:number)=>(<tr key={i} style={{ borderBottom:"1px solid #f9fafb" }}><td style={{ padding:"10px 0",fontSize:14,color:"#374151",fontWeight:600 }}>{item.name||"Item"}</td><td style={{ textAlign:"center",padding:"10px 0",fontSize:14,color:"#374151" }}>{item.qty} {item.unit||"PCS"}</td><td style={{ textAlign:"center",padding:"10px 0",fontSize:14,color:"#9ca3af" }}>-</td><td style={{ textAlign:"right",padding:"10px 0",fontSize:14,color:"#9ca3af" }}>-</td></tr>))}</tbody>
              </table>
              <div style={{ borderTop:"1px solid #f3f4f6",marginTop:8 }}>
                {[{label:"Sales Amount(Exl. Addn. Charges):",value:`₹ ${invoice.billItems.reduce((s:number,i:any)=>s+(i.amount||0),0).toLocaleString("en-IN")}`},{label:"Total Cost:",value:"₹ 0"},{label:"Tax Payable:",value:"₹ 0"}].map(r=>(<div key={r.label} style={{ display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #f9fafb",fontSize:14,color:"#374151" }}><span>{r.label}</span><span>{r.value}</span></div>))}
                <div style={{ display:"flex",justifyContent:"space-between",padding:"12px 0",fontSize:14,color:"#374151",fontWeight:600 }}><div><div>Profit:</div><div style={{ fontSize:12,color:"#4f46e5",fontWeight:400,marginTop:2 }}>(Sales Amount - Total Cost - Tax Payable)</div></div><div style={{ display:"flex",alignItems:"center",gap:6,color:"#9ca3af" }}><span>-</span><svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" style={{ width:16,height:16 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}