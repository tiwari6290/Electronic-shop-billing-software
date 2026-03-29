import React, { useState, useRef, useEffect } from "react";
import { AdditionalCharge, CHARGE_TAX_OPTIONS, TCS_RATES, PAYMENT_METHODS } from "./SalesInvoiceTypes";
import "./SISummary.css";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaymentDetails {
  method:      string;
  amount:      number;
  refNo?:      string;   // UPI: txnId | CARD: last4 | NETBANKING: txnId | BANK_TRANSFER: UTR | CHEQUE: chequeNo
  chequeDate?: string;   // CHEQUE only
  authNo?:     string;   // CARD only
  bankName?:   string;   // UPI:app | CARD | NETBANKING | BANK_TRANSFER | CHEQUE
  cardType?:   string;   // CARD: VISA / Mastercard / Rupay …
  branchName?: string;   // BANK_TRANSFER | CHEQUE
}

export interface FinanceDetails {
  enabled:       boolean;
  financerName?: string;
  loanRefNo?:    string;
  loanAmount?:   number;
  emi?:          number;
  emiCount?:     number;
  extraEmi?:     number;
  extraEmiCount?:number;
  dbdCharges?:   number;
  processingFee?:number;
  agentName?:    string;
  agentContact?: string;
  reference?:    string;
}

// ─── Field config per payment mode (from Image 2) ────────────────────────────
const MODE_FIELDS: Record<string, { refNo?: string; chequeDate?: boolean; authNo?: boolean; bankName?: string; cardType?: boolean; branchName?: boolean }> = {
  Cash:         {},
  UPI:          { refNo: "UPI / Transaction ID", bankName: "UPI App (e.g. PhonePe)" },
  Card:         { refNo: "Last 4 Digits",        authNo: true, bankName: "Bank Name", cardType: true },
  Netbanking:   { refNo: "Transaction ID",        bankName: "Bank Name" },
  "Bank Transfer": { refNo: "UTR Number",         bankName: "Bank Name", branchName: true },
  Cheque:       { refNo: "Cheque Number",         chequeDate: true, bankName: "Bank Name", branchName: true },
};

// ─── TCS Rate helpers ─────────────────────────────────────────────────────────
function getDefaultTcsRates() { return TCS_RATES; }

// ─── Add TCS Rate Modal ───────────────────────────────────────────────────────
function AddTcsRateModal({ onClose, onSaved }: { onClose: () => void; onSaved: (r: { label: string; rate: number }) => void }) {
  const [taxName, setTaxName] = useState("");
  const [section, setSection] = useState("");
  const [rate,    setRate]    = useState(0);
  const canSave = taxName.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    const label = `${rate}% ${section.trim() ? section.trim() + " " : ""}${taxName.trim()}`;
    onSaved({ label, rate });
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb",
    borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 14, width: 500, maxWidth: "95vw", boxShadow: "0 24px 60px rgba(0,0,0,.2)", fontFamily: "inherit" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #f3f4f6" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Add TCS Rate</span>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "#374151", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div><label style={{ fontSize: 13, color: "#374151", fontWeight: 500, display: "block", marginBottom: 6 }}>Tax name</label><input value={taxName} onChange={e => setTaxName(e.target.value)} placeholder="Enter Tax Name" style={inp} /></div>
          <div><label style={{ fontSize: 13, color: "#374151", fontWeight: 500, display: "block", marginBottom: 6 }}>Section Name</label><input value={section} onChange={e => setSection(e.target.value)} placeholder="Enter Section Name" style={inp} /></div>
          <div><label style={{ fontSize: 13, color: "#374151", fontWeight: 500, display: "block", marginBottom: 6 }}>Rate (%)</label><input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} style={inp} /></div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: "1px solid #f3f4f6" }}>
          <button onClick={onClose} style={{ padding: "9px 22px", border: "1px solid #e5e7eb", background: "#fff", borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#374151", fontWeight: 500 }}>Close</button>
          <button onClick={handleSave} disabled={!canSave} style={{ padding: "9px 22px", background: canSave ? "#4f46e5" : "#c7d2fe", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: canSave ? "pointer" : "not-allowed" }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Details Modal ────────────────────────────────────────────────────
function PaymentDetailsModal({
  method,
  amount,
  details,
  onSave,
  onClose,
}: {
  method:   string;
  amount:   number;
  details:  PaymentDetails;
  onSave:   (d: PaymentDetails) => void;
  onClose:  () => void;
}) {
  const fields = MODE_FIELDS[method] ?? {};
  const [form, setForm] = useState<PaymentDetails>({ ...details, method, amount });

  const f = (key: keyof PaymentDetails) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const inpSty: React.CSSProperties = {
    width: "100%", padding: "9px 11px", border: "1.5px solid #e5e7eb",
    borderRadius: 7, fontSize: 13, outline: "none", fontFamily: "inherit",
    boxSizing: "border-box",
  };
  const labelSty: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: "#374151",
    display: "block", marginBottom: 4,
  };

  const hasFields = Object.keys(fields).length > 0;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 14, width: 480, maxWidth: "95vw", boxShadow: "0 24px 60px rgba(0,0,0,.18)", fontFamily: "inherit" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f3f4f6" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{method} Payment Details</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Amount: ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "1.5px solid #e5e7eb", borderRadius: 7, width: 30, height: 30, cursor: "pointer", color: "#374151", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {!hasFields ? (
            <div style={{ textAlign: "center", color: "#6b7280", fontSize: 13, padding: "20px 0" }}>
              No additional details required for <strong>Cash</strong> payment.
            </div>
          ) : (
            <>
              {fields.refNo && (
                <div>
                  <label style={labelSty}>{fields.refNo} *</label>
                  <input value={form.refNo ?? ""} onChange={f("refNo")} style={inpSty} placeholder={`Enter ${fields.refNo}`} />
                </div>
              )}
              {fields.authNo && (
                <div>
                  <label style={labelSty}>Auth No.</label>
                  <input value={form.authNo ?? ""} onChange={f("authNo")} style={inpSty} placeholder="Enter Auth Number" />
                </div>
              )}
              {fields.bankName && (
                <div>
                  <label style={labelSty}>{fields.bankName}</label>
                  <input value={form.bankName ?? ""} onChange={f("bankName")} style={inpSty} placeholder={`Enter ${fields.bankName}`} />
                </div>
              )}
              {fields.cardType && (
                <div>
                  <label style={labelSty}>Card Type</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["VISA", "Mastercard", "Rupay", "Amex", "Other"].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, cardType: t }))}
                        style={{
                          padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                          border: `1.5px solid ${form.cardType === t ? "#6366f1" : "#e5e7eb"}`,
                          background: form.cardType === t ? "#ede9fe" : "#fff",
                          color: form.cardType === t ? "#4f46e5" : "#374151",
                          cursor: "pointer", fontFamily: "inherit",
                        }}
                      >{t}</button>
                    ))}
                  </div>
                </div>
              )}
              {fields.chequeDate && (
                <div>
                  <label style={labelSty}>Cheque Date</label>
                  <input type="date" value={form.chequeDate ?? ""} onChange={f("chequeDate")} style={inpSty} />
                </div>
              )}
              {fields.branchName && (
                <div>
                  <label style={labelSty}>Branch Name</label>
                  <input value={form.branchName ?? ""} onChange={f("branchName")} style={inpSty} placeholder="Enter Branch Name" />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 20px", borderTop: "1px solid #f3f4f6" }}>
          <button onClick={onClose} style={{ padding: "8px 20px", border: "1.5px solid #e5e7eb", background: "#fff", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#374151", fontWeight: 500, fontFamily: "inherit" }}>Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }} style={{ padding: "8px 22px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Finance Details Modal ────────────────────────────────────────────────────
function FinanceModal({
  details,
  onSave,
  onClose,
}: {
  details: FinanceDetails;
  onSave:  (d: FinanceDetails) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FinanceDetails>({ ...details, enabled: true });

  const f = (key: keyof FinanceDetails) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));
  const fNum = (key: keyof FinanceDetails) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [key]: Number(e.target.value) }));

  const inpSty: React.CSSProperties = {
    width: "100%", padding: "9px 11px", border: "1.5px solid #e5e7eb",
    borderRadius: 7, fontSize: 13, outline: "none", fontFamily: "inherit",
    boxSizing: "border-box",
  };
  const labelSty: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4,
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 14, width: 520, maxWidth: "96vw", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 60px rgba(0,0,0,.18)", fontFamily: "inherit" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f3f4f6", flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Finance Details</div>
          <button onClick={onClose} style={{ background: "none", border: "1.5px solid #e5e7eb", borderRadius: 7, width: 30, height: 30, cursor: "pointer", color: "#374151", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>✕</button>
        </div>

        {/* Body — scrollable */}
        <div style={{ padding: "18px 20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Row: Financer Name + Loan Ref No */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelSty}>Financer Name</label>
              <input value={form.financerName ?? ""} onChange={f("financerName")} style={inpSty} placeholder="e.g. Bajaj Finance" />
            </div>
            <div>
              <label style={labelSty}>Loan Ref No.</label>
              <input value={form.loanRefNo ?? ""} onChange={f("loanRefNo")} style={inpSty} placeholder="e.g. A4891306" />
            </div>
          </div>

          {/* Row: Loan Amount + Processing Fee */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelSty}>Loan Amount (₹)</label>
              <input type="number" value={form.loanAmount ?? ""} onChange={fNum("loanAmount")} style={inpSty} placeholder="e.g. 25996" />
            </div>
            <div>
              <label style={labelSty}>Processing Fee (₹)</label>
              <input type="number" value={form.processingFee ?? ""} onChange={fNum("processingFee")} style={inpSty} placeholder="e.g. 0" />
            </div>
          </div>

          {/* Row: EMI × count */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 80px", gap: 10, alignItems: "end" }}>
            <div>
              <label style={labelSty}>EMI Amount (₹)</label>
              <input type="number" value={form.emi ?? ""} onChange={fNum("emi")} style={inpSty} placeholder="e.g. 2219" />
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", paddingBottom: 10 }}>×</div>
            <div>
              <label style={labelSty}>No. of EMIs</label>
              <input type="number" value={form.emiCount ?? ""} onChange={fNum("emiCount")} style={inpSty} placeholder="e.g. 12" />
            </div>
          </div>

          {/* Row: Extra EMI × count */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 80px", gap: 10, alignItems: "end" }}>
            <div>
              <label style={labelSty}>Extra EMI (₹)</label>
              <input type="number" value={form.extraEmi ?? ""} onChange={fNum("extraEmi")} style={inpSty} placeholder="e.g. 236" />
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", paddingBottom: 10 }}>×</div>
            <div>
              <label style={labelSty}>Count</label>
              <input type="number" value={form.extraEmiCount ?? ""} onChange={fNum("extraEmiCount")} style={inpSty} placeholder="e.g. 1" />
            </div>
          </div>

          {/* Row: DBD Charges */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelSty}>DBD Charges (₹)</label>
              <input type="number" value={form.dbdCharges ?? ""} onChange={fNum("dbdCharges")} style={inpSty} placeholder="e.g. 628" />
            </div>
            <div>
              <label style={labelSty}>Reference</label>
              <input value={form.reference ?? ""} onChange={f("reference")} style={inpSty} placeholder="e.g. Sanjoy Da" />
            </div>
          </div>

          {/* Row: Agent Name + Agent Contact */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelSty}>Agent Name</label>
              <input value={form.agentName ?? ""} onChange={f("agentName")} style={inpSty} placeholder="e.g. Pankaj Singh" />
            </div>
            <div>
              <label style={labelSty}>Agent Contact</label>
              <input value={form.agentContact ?? ""} onChange={f("agentContact")} style={inpSty} placeholder="e.g. 9932555000" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 20px", borderTop: "1px solid #f3f4f6", flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: "8px 20px", border: "1.5px solid #e5e7eb", background: "#fff", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#374151", fontWeight: 500, fontFamily: "inherit" }}>Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }} style={{ padding: "8px 22px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Save Finance Details</button>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Summary Card (shows after details are filled) ────────────────────
function PaymentSummaryCard({ details, onEdit }: { details: PaymentDetails; onEdit: () => void }) {
  const fields = MODE_FIELDS[details.method] ?? {};
  const rows: { label: string; value: string }[] = [];

  if (fields.refNo    && details.refNo)      rows.push({ label: fields.refNo,      value: details.refNo });
  if (fields.authNo   && details.authNo)     rows.push({ label: "Auth No.",         value: details.authNo });
  if (fields.bankName && details.bankName)   rows.push({ label: fields.bankName,    value: details.bankName });
  if (fields.cardType && details.cardType)   rows.push({ label: "Card Type",        value: details.cardType });
  if (fields.chequeDate && details.chequeDate) rows.push({ label: "Cheque Date",   value: details.chequeDate });
  if (fields.branchName && details.branchName) rows.push({ label: "Branch",        value: details.branchName });

  if (rows.length === 0) return null;

  return (
    <div style={{ marginTop: 8, padding: "10px 12px", background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontWeight: 600, color: "#374151", fontSize: 12 }}>Payment Details</span>
        <button onClick={onEdit} style={{ background: "none", border: "none", color: "#6366f1", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: "inherit" }}>Edit</button>
      </div>
      {rows.map(r => (
        <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", color: "#6b7280" }}>
          <span>{r.label}</span><span style={{ color: "#111827", fontWeight: 500 }}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Finance Summary Card ─────────────────────────────────────────────────────
function FinanceSummaryCard({ details, onEdit }: { details: FinanceDetails; onEdit: () => void }) {
  const rows: { label: string; value: string }[] = [];
  if (details.financerName)  rows.push({ label: "Financer",      value: details.financerName });
  if (details.loanRefNo)     rows.push({ label: "Loan Ref",      value: details.loanRefNo });
  if (details.loanAmount)    rows.push({ label: "Loan Amount",   value: `₹${details.loanAmount.toLocaleString("en-IN")}` });
  if (details.emi)           rows.push({ label: "EMI",           value: `₹${details.emi} × ${details.emiCount ?? 1}` });
  if (details.extraEmi)      rows.push({ label: "Extra EMI",     value: `₹${details.extraEmi} × ${details.extraEmiCount ?? 1}` });
  if (details.agentName)     rows.push({ label: "Agent",         value: details.agentName });

  return (
    <div style={{ marginTop: 8, padding: "10px 12px", background: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe", fontSize: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontWeight: 600, color: "#1d4ed8", fontSize: 12 }}>🏦 Finance Details</span>
        <button onClick={onEdit} style={{ background: "none", border: "none", color: "#6366f1", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: "inherit" }}>Edit</button>
      </div>
      {rows.map(r => (
        <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", color: "#374151" }}>
          <span style={{ color: "#6b7280" }}>{r.label}</span><span style={{ fontWeight: 500 }}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}


// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  subtotal:    number;
  totalTax:    number;
  billItems: Array<{
    rowId:       string;
    itemId?:     number;
    name:        string;
    qty:         number;
    price:       number;
    discountPct: number;
    discountAmt: number;
    taxRate:     number;
    taxLabel:    string;
    amount:      number;
  }>;
  additionalCharges: AdditionalCharge[];
  onChargesChange:   (charges: AdditionalCharge[]) => void;
  discountType:         "Discount After Tax" | "Discount Before Tax";
  discountPct:          number;
  discountAmt:          number;
  showDiscount:         boolean;
  onDiscountTypeChange: (t: "Discount After Tax" | "Discount Before Tax") => void;
  onDiscountPctChange:  (v: number) => void;
  onDiscountAmtChange:  (v: number) => void;
  onToggleDiscount:     (show: boolean) => void;
  applyTCS:    boolean;
  tcsRate:     number;
  tcsLabel:    string;
  tcsBase:     "Total Amount" | "Taxable Amount";
  onTCSChange: (apply: boolean, rate: number, label: string, base: "Total Amount" | "Taxable Amount") => void;
  roundOff:         "none" | "+Add" | "-Reduce";
  roundOffAmt:      number;
  onRoundOffChange: (mode: "none" | "+Add" | "-Reduce", amt: number) => void;
  amountReceived:         number;
  paymentMethod:          string;
  onAmountReceivedChange: (v: number) => void;
  onPaymentMethodChange:  (v: string) => void;
  signatureUrl:          string;
  showEmptySignatureBox: boolean;
  onSignatureChange:     (url: string, showEmpty: boolean) => void;
  paymentDetails?:         PaymentDetails;
  financeDetails?:         FinanceDetails;
  onPaymentDetailsChange?: (d: PaymentDetails) => void;
  onFinanceDetailsChange?: (d: FinanceDetails) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SISummary(p: Props) {
  const [showTCSDropdown,   setShowTCSDropdown]   = useState(false);
  const [showPayDrop,       setShowPayDrop]       = useState(false);
  const [showRoundDrop,     setShowRoundDrop]     = useState(false);
  const [showAddTcsModal,   setShowAddTcsModal]   = useState(false);
  const [showSigModal,      setShowSigModal]      = useState(false);
  const [showPayModal,      setShowPayModal]      = useState(false);
  const [showFinanceModal,  setShowFinanceModal]  = useState(false);
  const [allTcsRates,       setAllTcsRates]       = useState<{ label: string; rate: number }[]>(getDefaultTcsRates);

  const [payDetails,  setPayDetails]  = useState<PaymentDetails>(
    p.paymentDetails ?? { method: p.paymentMethod, amount: p.amountReceived }
  );
  const [finDetails,  setFinDetails]  = useState<FinanceDetails>(
    p.financeDetails ?? { enabled: false }
  );
  const [finEnabled, setFinEnabled] = useState(p.financeDetails?.enabled ?? false);

  const tcsRef  = useRef<HTMLDivElement>(null);
  const payRef  = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (tcsRef.current && !tcsRef.current.contains(e.target as Node)) setShowTCSDropdown(false);
      if (payRef.current && !payRef.current.contains(e.target as Node)) setShowPayDrop(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    setPayDetails(prev => ({ ...prev, method: p.paymentMethod, amount: p.amountReceived }));
  }, [p.paymentMethod, p.amountReceived]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CALCULATION ENGINE
  //
  // Correct GST invoice flow (matches Image 2):
  //
  //   Per line item (done in SIItemsTable / calcBillItemAmount):
  //     lineGross  = qty × price         (price = pre-tax base)
  //     lineDisc   = lineGross × discPct% (or flat)
  //     taxable    = lineGross − lineDisc
  //     lineTax    = taxable × taxRate%
  //     lineTotal  = taxable + lineTax
  //
  //   In summary panel:
  //     itemsTaxableSum = Σ taxable per line   → shown as "Taxable Amount"
  //     itemsTaxSum     = Σ lineTax per line   → split into SGST/CGST rows
  //     chargesBase     = Σ additionalCharge amounts
  //     chargesTax      = Σ charge × chargeRate%
  //     preTotalAmount  = itemsTaxableSum + itemsTaxSum + chargesBase + chargesTax
  //                     = sum of all lineTotal + charge totals
  //
  //   "Add Discount" (Discount After Tax) — applied on preTotalAmount:
  //     invoiceDiscAmt  = preTotalAmount × discPct%   (or flat discAmt)
  //     totalAmount     = preTotalAmount − invoiceDiscAmt
  //
  // ═══════════════════════════════════════════════════════════════════════════

  function chargeRate(taxLabel: string): number {
    const m = taxLabel.match(/(\d+)%/);
    return m ? Number(m[1]) : 0;
  }

  // ── Per-item taxable and tax amounts ──────────────────────────────────────
  const billItems = p.billItems ?? [];

  // Sum of all per-line taxable amounts (pre-tax, post-item-discount)
  const itemsTaxableSum = billItems.reduce((s: number, item: typeof billItems[number]) => {
    const lineGross = item.qty * item.price;
    const discByPct = lineGross * (item.discountPct / 100);
    const discFlat  = item.discountPct > 0 ? 0 : item.discountAmt;
    return s + Math.max(0, lineGross - discByPct - discFlat);
  }, 0);

  // Sum of all per-line tax amounts
  const itemsTaxSum = billItems.reduce((s: number, item: typeof billItems[number]) => {
    const lineGross = item.qty * item.price;
    const discByPct = lineGross * (item.discountPct / 100);
    const discFlat  = item.discountPct > 0 ? 0 : item.discountAmt;
    const taxable   = Math.max(0, lineGross - discByPct - discFlat);
    return s + Math.round(taxable * item.taxRate / 100 * 100) / 100;
  }, 0);

  // ── Additional charges ────────────────────────────────────────────────────
  const chargesBase  = p.additionalCharges.reduce((s: number, c: AdditionalCharge) => s + (Number(c.amount) || 0), 0);
  const chargesTax   = p.additionalCharges.reduce((s: number, c: AdditionalCharge) => {
    const rate = chargeRate(c.taxLabel);
    return s + (Number(c.amount) || 0) * rate / 100;
  }, 0);
  const chargesTotal = chargesBase + chargesTax;

  // ── Pre-discount total (all items + charges, tax already included) ─────────
  //    = itemsTaxableSum + itemsTaxSum + chargesBase + chargesTax
  const preTotalAmount = Math.round((itemsTaxableSum + itemsTaxSum + chargesTotal) * 100) / 100;

  // ── Invoice-level discount (Discount After Tax = on preTotalAmount) ────────
  //    % → ₹: invoiceDiscAmt = preTotalAmount × discPct / 100
  //    ₹ → %: invoiceDiscPct = (discAmt / preTotalAmount) × 100
  const invoiceDiscAmt = p.showDiscount
    ? (p.discountPct > 0
        ? Math.round(preTotalAmount * (p.discountPct / 100) * 100) / 100
        : (Number(p.discountAmt) || 0))
    : 0;

  // ── Final total ────────────────────────────────────────────────────────────
  const afterInvoiceDisc = Math.max(0, Math.round((preTotalAmount - invoiceDiscAmt) * 100) / 100);

  // ── TCS ───────────────────────────────────────────────────────────────────
  const tcsBaseAmt = p.tcsBase === "Total Amount" ? afterInvoiceDisc : itemsTaxableSum;
  const tcsValue   = p.applyTCS ? Math.round(tcsBaseAmt * (p.tcsRate / 100) * 100) / 100 : 0;
  const preRound   = Math.round((afterInvoiceDisc + tcsValue) * 100) / 100;

  // ── Round off ─────────────────────────────────────────────────────────────
  let autoRoundAmt = 0;
  if (p.roundOff === "+Add")    autoRoundAmt = Math.round((Math.ceil(preRound)  - preRound) * 100) / 100;
  if (p.roundOff === "-Reduce") autoRoundAmt = Math.round((Math.floor(preRound) - preRound) * 100) / 100;
  const effectiveRoundOff = p.roundOff !== "none" ? autoRoundAmt : (Number(p.roundOffAmt) || 0);
  const totalAmount        = Math.round((preRound + effectiveRoundOff) * 100) / 100;
  const balanceAmount      = Math.max(0, Math.round((totalAmount - (Number(p.amountReceived) || 0)) * 100) / 100);

  // ── Sync auto round-off to parent ─────────────────────────────────────────
  const prevAutoRoundRef = useRef<number>(0);
  useEffect(() => {
    if (p.roundOff === "none") { prevAutoRoundRef.current = 0; return; }
    const rounded = p.roundOff === "+Add"
      ? Math.round((Math.ceil(preRound)  - preRound) * 100) / 100
      : Math.round((Math.floor(preRound) - preRound) * 100) / 100;
    if (Math.abs(rounded - prevAutoRoundRef.current) > 0.0001) {
      prevAutoRoundRef.current = rounded;
      p.onRoundOffChange(p.roundOff, rounded);
    }
  }, [preRound, p.roundOff]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── SGST / CGST / IGST breakdown ──────────────────────────────────────────
  interface TaxGroup { sgst: number; cgst: number; igst: number }
  const taxGroups: Record<string, TaxGroup> = {};

  billItems.forEach((item: typeof billItems[number]) => {
    const lineGross = item.qty * item.price;
    const discByPct = lineGross * (item.discountPct / 100);
    const discFlat  = item.discountPct > 0 ? 0 : item.discountAmt;
    const taxable   = Math.max(0, lineGross - discByPct - discFlat);
    const taxAmt    = taxable * item.taxRate / 100;
    if (taxAmt <= 0 || item.taxRate <= 0) return;
    const key = item.taxLabel;
    if (!taxGroups[key]) taxGroups[key] = { sgst: 0, cgst: 0, igst: 0 };
    if (item.taxLabel.startsWith("IGST")) {
      taxGroups[key].igst += taxAmt;
    } else {
      taxGroups[key].sgst += taxAmt / 2;
      taxGroups[key].cgst += taxAmt / 2;
    }
  });

  p.additionalCharges.forEach((c: AdditionalCharge) => {
    const rate = chargeRate(c.taxLabel);
    if (rate <= 0) return;
    const taxAmt = (Number(c.amount) || 0) * rate / 100;
    const key    = c.taxLabel;
    if (!taxGroups[key]) taxGroups[key] = { sgst: 0, cgst: 0, igst: 0 };
    taxGroups[key].sgst += taxAmt / 2;
    taxGroups[key].cgst += taxAmt / 2;
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  function addCharge() {
    const nc: AdditionalCharge = { id: `c-${Date.now()}`, label: "", amount: 0, taxLabel: "No Tax Applicable" };
    p.onChargesChange([...p.additionalCharges, nc]);
  }
  function updateCharge(id: string, field: Partial<AdditionalCharge>) {
    p.onChargesChange(p.additionalCharges.map((c: AdditionalCharge) => c.id === id ? { ...c, ...field } : c));
  }
  function removeCharge(id: string) {
    p.onChargesChange(p.additionalCharges.filter((c: AdditionalCharge) => c.id !== id));
  }

  function handlePaymentMethodChange(method: string) {
    p.onPaymentMethodChange(method);
    setShowPayDrop(false);
    setTimeout(() => setShowPayModal(true), 50);
  }
  function handlePayDetailsSave(d: PaymentDetails) {
    setPayDetails(d);
    p.onPaymentDetailsChange?.(d);
  }
  function handleFinanceSave(d: FinanceDetails) {
    setFinDetails(d);
    setFinEnabled(true);
    p.onFinanceDetailsChange?.(d);
  }
  function handleFinanceToggle(checked: boolean) {
    if (checked) {
      setShowFinanceModal(true);
    } else {
      setFinEnabled(false);
      const cleared: FinanceDetails = { enabled: false };
      setFinDetails(cleared);
      p.onFinanceDetailsChange?.(cleared);
    }
  }

  const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const hasPayDetails = Object.keys(MODE_FIELDS[p.paymentMethod] ?? {}).length > 0
    && (payDetails.refNo || payDetails.authNo || payDetails.bankName);

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="si-summary">

      {/* ── Additional Charges ── */}
      <div className="si-sum-section">
        <button className="si-sum-link" onClick={addCharge}>+ Add Additional Charges</button>
        {p.additionalCharges.map(c => (
          <div key={c.id} className="si-charge-row">
            <input className="si-charge-input" value={c.label}
              onChange={e => updateCharge(c.id, { label: e.target.value })}
              placeholder="Charge name (ex: Transport Charge)" />
            <span className="si-rs-sm">₹</span>
            <input type="number" className="si-charge-amt" value={c.amount} min={0}
              onChange={e => updateCharge(c.id, { amount: Number(e.target.value) })} />
            <select className="si-charge-tax" value={c.taxLabel}
              onChange={e => updateCharge(c.id, { taxLabel: e.target.value })}>
              {CHARGE_TAX_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
            <button className="si-charge-del" onClick={() => removeCharge(c.id)}>✕</button>
          </div>
        ))}
        {p.additionalCharges.length > 0 && (
          <button className="si-sum-link" style={{ marginTop: 6 }} onClick={addCharge}>+ Add Another Charge</button>
        )}
      </div>

      {/* ── Taxable Amount = sum of per-line taxables (pre-tax, post-item-discount) ── */}
      <div className="si-sum-row">
        <span className="si-sum-lbl">Taxable Amount</span>
        <span className="si-sum-val">₹ {fmt(itemsTaxableSum)}</span>
      </div>

      {/* ── Additional charges total (if any) ── */}
      {chargesTotal > 0 && (
        <div className="si-sum-row" style={{ fontSize: 12, color: "#6b7280" }}>
          <span className="si-sum-lbl">Additional Charges (incl. tax)</span>
          <span className="si-sum-val">₹ {fmt(chargesTotal)}</span>
        </div>
      )}

      {/* ── SGST / CGST / IGST breakdown ── */}
      {Object.entries(taxGroups).map(([label, grp]) => {
        const rate   = label.match(/(\d+)%/)?.[1] ?? "";
        const isIGST = label.startsWith("IGST");
        return (
          <React.Fragment key={label}>
            {isIGST ? (
              grp.igst > 0 && (
                <div className="si-sum-row">
                  <span className="si-sum-lbl">IGST@{rate}</span>
                  <span className="si-sum-val">₹ {fmt(Math.round(grp.igst * 100) / 100)}</span>
                </div>
              )
            ) : (
              <>
                {grp.sgst > 0 && (
                  <div className="si-sum-row">
                    <span className="si-sum-lbl">SGST@{Number(rate) / 2}</span>
                    <span className="si-sum-val">₹ {fmt(Math.round(grp.sgst * 100) / 100)}</span>
                  </div>
                )}
                {grp.cgst > 0 && (
                  <div className="si-sum-row">
                    <span className="si-sum-lbl">CGST@{Number(rate) / 2}</span>
                    <span className="si-sum-val">₹ {fmt(Math.round(grp.cgst * 100) / 100)}</span>
                  </div>
                )}
              </>
            )}
          </React.Fragment>
        );
      })}

      {/* ── Invoice-level Discount (Discount After Tax) ──────────────────────
           Applied on the total amount AFTER all item taxes.
           % ↔ ₹ are linked: editing one auto-updates the other.
      ── */}
      {!p.showDiscount ? (
        <div className="si-sum-row">
          <button className="si-sum-link" onClick={() => p.onToggleDiscount(true)}>
            + Add Discount
          </button>
          <span className="si-sum-val si-sum-neg">- ₹ 0</span>
        </div>
      ) : (
        <div className="si-disc-section">
          <div className="si-disc-type-row">
            {/* Label + remove */}
            <span className="si-sum-lbl" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              Discount After Tax
              <button
                className="si-disc-rm"
                title="Remove discount"
                onClick={() => {
                  p.onToggleDiscount(false);
                  p.onDiscountPctChange(0);
                  p.onDiscountAmtChange(0);
                }}
              >✕</button>
            </span>

            {/* % input and ₹ input — linked bidirectionally */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {/* Percentage input */}
              <span style={{ fontSize: 13, color: "#6b7280" }}>%</span>
              <input
                type="number"
                className="si-disc-pct"
                value={p.discountPct || ""}
                placeholder="0"
                min={0}
                max={100}
                onChange={e => {
                  const pct = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                  p.onDiscountPctChange(pct);
                  // auto-compute ₹ from % so the ₹ field stays in sync
                  if (pct > 0) {
                    p.onDiscountAmtChange(Math.round(preTotalAmount * pct / 100 * 100) / 100);
                  } else {
                    p.onDiscountAmtChange(0);
                  }
                }}
              />

              <span style={{ color: "#d1d5db", fontSize: 16 }}>/</span>

              {/* Rupee input */}
              <span style={{ fontSize: 13, color: "#6b7280" }}>₹</span>
              <input
                type="number"
                className="si-disc-pct"
                style={{ width: 72 }}
                value={
                  // When % is active, show the computed ₹ amount (read-only feel)
                  p.discountPct > 0
                    ? Math.round(preTotalAmount * p.discountPct / 100 * 100) / 100
                    : (p.discountAmt || "")
                }
                placeholder="0"
                min={0}
                onChange={e => {
                  const amt = Math.max(0, Number(e.target.value) || 0);
                  p.onDiscountAmtChange(amt);
                  // auto-compute % from ₹ so the % field stays in sync
                  if (preTotalAmount > 0) {
                    p.onDiscountPctChange(
                      Math.round(amt / preTotalAmount * 100 * 100) / 100
                    );
                  } else {
                    p.onDiscountPctChange(0);
                  }
                }}
              />

              {/* Effective discount in ₹ */}
              <span className="si-sum-neg" style={{ fontSize: 13, fontWeight: 600, minWidth: 60, textAlign: "right" }}>
                - ₹ {fmt(invoiceDiscAmt)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── TCS ── */}
      <div className="si-sum-row">
        <label className="si-tcs-label">
          <input type="checkbox" checked={p.applyTCS}
            onChange={e => p.onTCSChange(e.target.checked, p.tcsRate, p.tcsLabel, p.tcsBase)} />
          Apply TCS
        </label>
        {p.applyTCS && (
          <div ref={tcsRef} className="si-tcs-right">
            <span className="si-tcs-val">₹ {fmt(tcsValue)}</span>
            <div className="si-tcs-sel-wrap">
              <button className="si-tcs-sel-btn" onClick={() => setShowTCSDropdown(!showTCSDropdown)}>
                {p.tcsLabel || "Select TCS Rate"}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              {showTCSDropdown && (
                <div className="si-tcs-dropdown">
                  {allTcsRates.map(r => (
                    <button key={r.label} className="si-tcs-opt"
                      onClick={() => { p.onTCSChange(true, r.rate, r.label, p.tcsBase); setShowTCSDropdown(false); }}>
                      <span className="si-tcs-rate">{r.rate.toFixed(1)}%</span>
                      <span className="si-tcs-desc">{r.label.replace(/^\d+\.?\d*%\s*/, "")}</span>
                    </button>
                  ))}
                  <button className="si-tcs-add"
                    onClick={() => { setShowTCSDropdown(false); setShowAddTcsModal(true); }}>
                    + Add New TCS Rate
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {p.applyTCS && p.tcsLabel && (
        <div className="si-tcs-base-row">
          <label className="si-radio-lbl">
            <input type="radio" name="tcsBase" checked={p.tcsBase === "Total Amount"}
              onChange={() => p.onTCSChange(p.applyTCS, p.tcsRate, p.tcsLabel, "Total Amount")} />
            Total Amount
          </label>
          <label className="si-radio-lbl">
            <input type="radio" name="tcsBase" checked={p.tcsBase === "Taxable Amount"}
              onChange={() => p.onTCSChange(p.applyTCS, p.tcsRate, p.tcsLabel, "Taxable Amount")} />
            Taxable Amount
          </label>
        </div>
      )}

      {/* ── Round Off ── */}
      <div className="si-sum-row">
        <label className="si-tcs-label">
          <input
            type="checkbox"
            checked={p.roundOff !== "none"}
            onChange={e => {
              if (e.target.checked) {
                const rounded = Math.round((Math.ceil(preRound) - preRound) * 100) / 100;
                p.onRoundOffChange("+Add", rounded);
              } else {
                p.onRoundOffChange("none", 0);
              }
            }}
          />
          Round Off
        </label>
        {p.roundOff !== "none" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div className="si-round-wrap">
              <button className="si-round-btn" onClick={() => setShowRoundDrop(!showRoundDrop)}>
                {p.roundOff === "+Add" ? "Round Up" : "Round Down"}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 10, height: 10 }}><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {showRoundDrop && (
                <div className="si-round-drop">
                  {(["+Add", "-Reduce"] as const).map(o => {
                    const amt = o === "+Add"
                      ? Math.round((Math.ceil(preRound)  - preRound) * 100) / 100
                      : Math.round((Math.floor(preRound) - preRound) * 100) / 100;
                    return (
                      <button key={o} className="si-round-opt"
                        onClick={() => { p.onRoundOffChange(o, amt); setShowRoundDrop(false); }}>
                        <span>{o === "+Add" ? "Round Up" : "Round Down"}</span>
                        <span style={{ color: o === "+Add" ? "#16a34a" : "#dc2626", fontWeight: 600, marginLeft: 8 }}>
                          {o === "+Add" ? "+" : ""}{amt.toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 56, textAlign: "right", color: autoRoundAmt >= 0 ? "#16a34a" : "#dc2626" }}>
              {autoRoundAmt >= 0 ? "+" : ""}₹ {Math.abs(autoRoundAmt).toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* ── Total Amount ── */}
      <div className="si-total-row">
        <span className="si-total-lbl">Total Amount</span>
        {totalAmount > 0
          ? <span className="si-total-val">₹ {fmt(totalAmount)}</span>
          : <button className="si-enter-payment">Enter Payment amount</button>
        }
      </div>

      <div className="si-sum-sep" />

      {/* ── Mark as fully paid ── */}
      <div className="si-fully-paid-row">
        <span />
        <label className="si-tcs-label">
          Mark as fully paid
          <input
            type="checkbox"
            checked={p.amountReceived === totalAmount && totalAmount > 0}
            onChange={e => p.onAmountReceivedChange(e.target.checked ? totalAmount : 0)}
          />
        </label>
      </div>

      {/* ── Amount Received + Payment Method ── */}
      <div className="si-amt-recv-row">
        <span className="si-sum-lbl">Amount Received</span>
        <div className="si-recv-right">
          <span className="si-rs-sm">₹</span>
          <input
            type="number" className="si-recv-input"
            value={p.amountReceived || ""} min={0} max={totalAmount} placeholder="0"
            onChange={e => {
              const v = Math.min(totalAmount, Math.max(0, Number(e.target.value)));
              p.onAmountReceivedChange(v);
            }}
          />
          <div ref={payRef} className="si-pay-wrap">
            <button className="si-pay-btn" onClick={() => setShowPayDrop(!showPayDrop)}>
              {p.paymentMethod}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {showPayDrop && (
              <div className="si-pay-drop">
                {PAYMENT_METHODS.map(m => (
                  <button key={m}
                    className={`si-pay-opt${p.paymentMethod === m ? " si-pay-opt--active" : ""}`}
                    onClick={() => handlePaymentMethodChange(m)}>
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
          {p.paymentMethod !== "Cash" && (
            <button
              onClick={() => setShowPayModal(true)}
              style={{
                padding: "6px 10px", border: "1.5px solid #a5b4fc", borderRadius: 6,
                background: hasPayDetails ? "#ede9fe" : "#fff", color: "#4f46e5",
                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              {hasPayDetails ? "✓ Details" : "+ Details"}
            </button>
          )}
        </div>
      </div>

      {hasPayDetails && (
        <PaymentSummaryCard details={payDetails} onEdit={() => setShowPayModal(true)} />
      )}

      {/* ── Finance ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", borderTop: "1px solid #f3f4f6", marginTop: 4 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13.5, color: "#374151", fontWeight: 500 }}>
          <input type="checkbox" checked={finEnabled}
            onChange={e => handleFinanceToggle(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: "#6366f1", cursor: "pointer" }}
          />
          Finance / EMI Payment
        </label>
        {finEnabled && (
          <button onClick={() => setShowFinanceModal(true)}
            style={{ marginLeft: "auto", padding: "4px 10px", border: "1.5px solid #bfdbfe", borderRadius: 6, background: "#eff6ff", color: "#1d4ed8", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Edit
          </button>
        )}
      </div>
      {finEnabled && finDetails.financerName && (
        <FinanceSummaryCard details={finDetails} onEdit={() => setShowFinanceModal(true)} />
      )}

      {/* ── Balance Amount ── */}
      <div className="si-balance-row">
        <span className="si-balance-lbl">Balance Amount</span>
        <span className={`si-balance-val${balanceAmount === 0 ? " si-balance-zero" : ""}`}>
          ₹ {fmt(balanceAmount)}
        </span>
      </div>

      {/* ── Authorized Signatory ───────────────────────────── */}
      <div className="si-signatory">
        <div className="si-signatory-text">Authorized signatory</div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => p.onSignatureChange(ev.target?.result as string, false);
            reader.readAsDataURL(file);
            e.target.value = "";
          }}
        />
        {p.signatureUrl ? (
          <div className="si-sig-preview-wrap">
            <img src={p.signatureUrl} alt="Signature" className="si-sig-preview-img" />
            <button className="si-sig-remove-btn" onClick={() => p.onSignatureChange("", false)} title="Remove signature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        ) : p.showEmptySignatureBox ? (
          <div className="si-sig-empty-box-preview">
            <button className="si-sig-remove-btn" onClick={() => p.onSignatureChange("", false)} title="Remove" style={{ top: 4, right: 4 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        ) : (
          <button className="si-sig-add-btn" onClick={() => setShowSigModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}><path d="M12 5v14M5 12h14"/></svg>
            Add Signature
          </button>
        )}
      </div>

      {/* ── Signature Modal ────────────────────────────────── */}
      {showSigModal && (
        <div className="si-sig-modal-overlay" onClick={() => setShowSigModal(false)}>
          <div className="si-sig-modal" onClick={e => e.stopPropagation()}>
            <div className="si-sig-modal-header">
              <span className="si-sig-modal-title">Signature</span>
              <button className="si-sig-modal-close" onClick={() => setShowSigModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="si-sig-modal-body">
              <button className="si-sig-option-card" onClick={() => { setShowSigModal(false); fileRef.current?.click(); }}>
                <div className="si-sig-option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5" style={{ width: 48, height: 48 }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/><polyline points="12 8 15 5 18 8"/><line x1="15" y1="5" x2="15" y2="13"/>
                  </svg>
                </div>
                <span className="si-sig-option-label">Upload Signature from Desktop</span>
              </button>
              <button className="si-sig-option-card" onClick={() => { p.onSignatureChange("", true); setShowSigModal(false); }}>
                <div className="si-sig-option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5" style={{ width: 48, height: 48 }}><rect x="3" y="5" width="18" height="14" rx="2"/></svg>
                </div>
                <span className="si-sig-option-label">Show Empty Signature Box on Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment Details Modal ──────────────────────────── */}
      {showPayModal && (
        <PaymentDetailsModal
          method={p.paymentMethod}
          amount={p.amountReceived || totalAmount}
          details={payDetails}
          onSave={handlePayDetailsSave}
          onClose={() => setShowPayModal(false)}
        />
      )}

      {/* ── Finance Modal ──────────────────────────────────── */}
      {showFinanceModal && (
        <FinanceModal
          details={finDetails}
          onSave={handleFinanceSave}
          onClose={() => {
            setShowFinanceModal(false);
            // If modal closed without saving and finance was never enabled, uncheck
            if (!finDetails.financerName) setFinEnabled(false);
          }}
        />
      )}

      {/* ── Add TCS Rate Modal ─────────────────────────────── */}
      {showAddTcsModal && (
        <AddTcsRateModal
          onClose={() => setShowAddTcsModal(false)}
          onSaved={r => {
            setAllTcsRates(prev => [...prev, r]);
            p.onTCSChange(true, r.rate, r.label, p.tcsBase);
            setShowAddTcsModal(false);
          }}
        />
      )}
    </div>
  );}