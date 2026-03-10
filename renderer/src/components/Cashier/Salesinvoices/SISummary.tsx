import { useState, useRef, useEffect } from "react";
import { AdditionalCharge, CHARGE_TAX_OPTIONS, TCS_RATES, PAYMENT_METHODS } from "./SalesInvoiceTypes";
import "./SISummary.css";

// ─── TCS Rate helpers ─────────────────────────────────────────────────────────
function loadAllTcsRates(): { label: string; rate: number }[] {
  const defaults = TCS_RATES;
  try {
    const custom: { label: string; rate: number }[] = JSON.parse(localStorage.getItem("customTcsRates") || "[]");
    return [...defaults, ...custom];
  } catch { return defaults; }
}

function saveCustomTcsRate(r: { label: string; rate: number }) {
  try {
    const existing: { label: string; rate: number }[] = JSON.parse(localStorage.getItem("customTcsRates") || "[]");
    localStorage.setItem("customTcsRates", JSON.stringify([...existing, r]));
  } catch {}
}

// ─── Add TCS Rate Modal ───────────────────────────────────────────────────────
function AddTcsRateModal({ onClose, onSaved }: { onClose: () => void; onSaved: (r: { label: string; rate: number }) => void }) {
  const [taxName, setTaxName] = useState("");
  const [section, setSection] = useState("");
  const [rate, setRate] = useState(0);
  const canSave = taxName.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    const label = `${rate}% ${section.trim() ? section.trim() + " " : ""}${taxName.trim()}`;
    const r = { label, rate };
    saveCustomTcsRate(r);
    onSaved(r);
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb",
    borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 14, width: 500, maxWidth: "95vw", boxShadow: "0 24px 60px rgba(0,0,0,.2)", fontFamily: "Segoe UI, sans-serif" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #f3f4f6" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Add Tcs Rate</span>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "#374151", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        {/* Body */}
        <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={{ fontSize: 13, color: "#374151", fontWeight: 500, display: "block", marginBottom: 6 }}>Tax name</label>
            <input value={taxName} onChange={e => setTaxName(e.target.value)} placeholder="Enter Tax Name" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "#374151", fontWeight: 500, display: "block", marginBottom: 6 }}>Enter Section Name</label>
            <input value={section} onChange={e => setSection(e.target.value)} placeholder="Enter Section Name" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "#374151", fontWeight: 500, display: "block", marginBottom: 6 }}>Enter Rate (in %)</label>
            <input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} style={inp} />
          </div>
        </div>
        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: "1px solid #f3f4f6" }}>
          <button onClick={onClose} style={{ padding: "9px 22px", border: "1px solid #e5e7eb", background: "#fff", borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#374151", fontWeight: 500 }}>Close</button>
          <button onClick={handleSave} disabled={!canSave} style={{ padding: "9px 22px", background: canSave ? "#4f46e5" : "#c7d2fe", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: canSave ? "pointer" : "not-allowed" }}>Save</button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  subtotal: number;
  totalTax: number;
  additionalCharges: AdditionalCharge[];
  discountType: "Discount After Tax" | "Discount Before Tax";
  discountPct: number;
  discountAmt: number;
  showDiscount: boolean;
  applyTCS: boolean;
  tcsRate: number;
  tcsLabel: string;
  tcsBase: "Total Amount" | "Taxable Amount";
  roundOff: "none" | "+Add" | "-Reduce";
  roundOffAmt: number;
  amountReceived: number;
  paymentMethod: string;
  onChargesChange: (c: AdditionalCharge[]) => void;
  onDiscountTypeChange: (t: "Discount After Tax" | "Discount Before Tax") => void;
  onDiscountPctChange: (v: number) => void;
  onDiscountAmtChange: (v: number) => void;
  onToggleDiscount: (show: boolean) => void;
  onTCSChange: (apply: boolean, rate: number, label: string, base: "Total Amount" | "Taxable Amount") => void;
  onRoundOffChange: (mode: "none" | "+Add" | "-Reduce", amt: number) => void;
  onAmountReceivedChange: (v: number) => void;
  onPaymentMethodChange: (v: string) => void;
}

export default function SISummary(p: Props) {
  const [showTCSDropdown, setShowTCSDropdown] = useState(false);
  const [showPayDrop, setShowPayDrop] = useState(false);
  const [showDiscTypeDrop, setShowDiscTypeDrop] = useState(false);
  const [showRoundDrop, setShowRoundDrop] = useState(false);
  const [showAddTcsModal, setShowAddTcsModal] = useState(false);
  const [allTcsRates, setAllTcsRates] = useState<{ label: string; rate: number }[]>(loadAllTcsRates);
  const tcsRef = useRef<HTMLDivElement>(null);
  const payRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (tcsRef.current && !tcsRef.current.contains(e.target as Node)) setShowTCSDropdown(false);
      if (payRef.current && !payRef.current.contains(e.target as Node)) setShowPayDrop(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Calculations
  const chargesTotal = p.additionalCharges.reduce((s, c) => s + c.amount, 0);
  const taxableAmount = p.subtotal + chargesTotal;
  const discValue = taxableAmount * p.discountPct / 100 || p.discountAmt;
  const afterDisc = taxableAmount - discValue;
  const tcsBase = p.tcsBase === "Total Amount" ? afterDisc : p.subtotal;
  const tcsValue = afterDisc * p.tcsRate / 100;
  const roundOffVal = p.roundOff === "none" ? 0 : p.roundOff === "+Add" ? Math.ceil(afterDisc + tcsValue) - (afterDisc + tcsValue) : Math.floor(afterDisc + tcsValue) - (afterDisc + tcsValue);
  const totalAmount = afterDisc + tcsValue + (p.roundOff !== "none" ? roundOffVal : p.roundOffAmt);
  const balanceAmount = totalAmount - p.amountReceived;

  function addCharge() {
    const nc: AdditionalCharge = { id: `c-${Date.now()}`, label: "", amount: 0, taxLabel: "No Tax Applicable" };
    p.onChargesChange([...p.additionalCharges, nc]);
  }
  function updateCharge(id: string, field: Partial<AdditionalCharge>) {
    p.onChargesChange(p.additionalCharges.map(c => c.id === id ? { ...c, ...field } : c));
  }
  function removeCharge(id: string) {
    p.onChargesChange(p.additionalCharges.filter(c => c.id !== id));
  }

  return (
    <div className="si-summary">
      {/* Additional Charges */}
      <div className="si-sum-section">
        <button className="si-sum-link" onClick={addCharge}>+ Add Additional Charges</button>
        {p.additionalCharges.map(c => (
          <div key={c.id} className="si-charge-row">
            <input className="si-charge-input" value={c.label} onChange={e=>updateCharge(c.id,{label:e.target.value})} placeholder="Enter charge (ex. Transport Charge)"/>
            <span className="si-rs-sm">₹</span>
            <input type="number" className="si-charge-amt" value={c.amount} onChange={e=>updateCharge(c.id,{amount:Number(e.target.value)})}/>
            <select className="si-charge-tax" value={c.taxLabel} onChange={e=>updateCharge(c.id,{taxLabel:e.target.value})}>
              {CHARGE_TAX_OPTIONS.map(o=><option key={o}>{o}</option>)}
            </select>
            <button className="si-charge-del" onClick={()=>removeCharge(c.id)}>✕</button>
          </div>
        ))}
        {p.additionalCharges.length > 0 && (
          <button className="si-sum-link" style={{marginTop:6}} onClick={addCharge}>+ Add Another Charge</button>
        )}
      </div>

      {/* Taxable Amount */}
      <div className="si-sum-row">
        <span className="si-sum-lbl">Taxable Amount</span>
        <span className="si-sum-val">₹ {taxableAmount.toLocaleString("en-IN", {maximumFractionDigits:1})}</span>
      </div>

      {/* Discount */}
      {!p.showDiscount ? (
        <div className="si-sum-row">
          <button className="si-sum-link" onClick={()=>p.onToggleDiscount(true)}>+ Add Discount</button>
          <span className="si-sum-val si-sum-neg">- ₹ {discValue > 0 ? discValue.toLocaleString("en-IN",{maximumFractionDigits:1}) : 0}</span>
        </div>
      ) : (
        <div className="si-disc-section">
          <div className="si-disc-type-row">
            <div ref={undefined} className="si-disc-type-wrap">
              <button className="si-disc-type-btn" onClick={()=>setShowDiscTypeDrop(!showDiscTypeDrop)}>
                {p.discountType} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:12,height:12}}><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {showDiscTypeDrop && (
                <div className="si-disc-type-drop">
                  {["Discount After Tax","Discount Before Tax"].map(t=>(
                    <button key={t} className="si-disc-type-opt" onClick={()=>{p.onDiscountTypeChange(t as any);setShowDiscTypeDrop(false);}}>{t}</button>
                  ))}
                </div>
              )}
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <span className="si-rs-sm">%</span>
              <input type="number" className="si-disc-pct" value={p.discountPct} onChange={e=>p.onDiscountPctChange(Number(e.target.value))}/>
              <span className="si-disc-sep">/</span>
              <span className="si-rs-sm">₹</span>
              <input type="number" className="si-disc-pct" value={p.discountAmt} onChange={e=>p.onDiscountAmtChange(Number(e.target.value))}/>
              <button className="si-disc-rm" onClick={()=>p.onToggleDiscount(false)}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* TCS */}
      <div className="si-sum-row">
        <label className="si-tcs-label">
          <input type="checkbox" checked={p.applyTCS} onChange={e=>p.onTCSChange(e.target.checked,p.tcsRate,p.tcsLabel,p.tcsBase)}/>
          Apply TCS
        </label>
        {p.applyTCS && (
          <div ref={tcsRef} className="si-tcs-right">
            <span className="si-tcs-val">₹ {tcsValue.toLocaleString("en-IN",{maximumFractionDigits:1})}</span>
            <div className="si-tcs-sel-wrap">
              <button className="si-tcs-sel-btn" onClick={()=>setShowTCSDropdown(!showTCSDropdown)}>
                {p.tcsLabel || "Select Tcs Rate"} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:12,height:12}}><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {showTCSDropdown && (
                <div className="si-tcs-dropdown">
                  {allTcsRates.map(r=>(
                    <button key={r.label} className="si-tcs-opt" onClick={()=>{p.onTCSChange(true,r.rate,r.label,p.tcsBase);setShowTCSDropdown(false);}}>
                      <span className="si-tcs-rate">{r.rate.toFixed(1)}%</span>
                      <span className="si-tcs-desc">{r.label.replace(/^\d+\.?\d*%\s*/,"")}</span>
                    </button>
                  ))}
                  <button className="si-tcs-add" onClick={()=>{setShowTCSDropdown(false);setShowAddTcsModal(true);}}>+ Add New Tcs Rate</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* TCS base radio (only when TCS selected) */}
      {p.applyTCS && p.tcsLabel && (
        <div className="si-tcs-base-row">
          <label className="si-radio-lbl">
            <input type="radio" name="tcsBase" checked={p.tcsBase==="Total Amount"} onChange={()=>p.onTCSChange(p.applyTCS,p.tcsRate,p.tcsLabel,"Total Amount")}/>
            Total Amount
          </label>
          <label className="si-radio-lbl">
            <input type="radio" name="tcsBase" checked={p.tcsBase==="Taxable Amount"} onChange={()=>p.onTCSChange(p.applyTCS,p.tcsRate,p.tcsLabel,"Taxable Amount")}/>
            Taxable Amount
          </label>
        </div>
      )}

      {/* Round Off */}
      <div className="si-sum-row">
        <label className="si-tcs-label">
          <input type="checkbox" checked={p.roundOff!=="none"} onChange={e=>p.onRoundOffChange(e.target.checked?"+Add":"none",0)}/>
          Auto Round Off
        </label>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {p.roundOff !== "none" && (
            <div className="si-round-wrap">
              <button className="si-round-btn" onClick={()=>setShowRoundDrop(!showRoundDrop)}>
                {p.roundOff} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:10,height:10}}><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {showRoundDrop && (
                <div className="si-round-drop">
                  {["+Add","-Reduce"].map(o=>(
                    <button key={o} className="si-round-opt" onClick={()=>{p.onRoundOffChange(o as any,p.roundOffAmt);setShowRoundDrop(false);}}>{o}</button>
                  ))}
                </div>
              )}
            </div>
          )}
          <span className="si-rs-sm">₹</span>
          <input type="number" className="si-round-input" value={p.roundOffAmt} onChange={e=>p.onRoundOffChange(p.roundOff,Number(e.target.value))} disabled={p.roundOff==="none"}/>
        </div>
      </div>

      {/* Total Amount */}
      <div className="si-total-row">
        <span className="si-total-lbl">Total Amount</span>
        {totalAmount > 0
          ? <span className="si-total-val">₹ {totalAmount.toLocaleString("en-IN",{maximumFractionDigits:1})}</span>
          : <button className="si-enter-payment">Enter Payment amount</button>
        }
      </div>

      {/* Separator */}
      <div className="si-sum-sep"/>

      {/* Mark as fully paid */}
      <div className="si-fully-paid-row">
        <span/>
        <label className="si-tcs-label">
          Mark as fully paid
          <input type="checkbox" checked={p.amountReceived === totalAmount && totalAmount > 0}
            onChange={e => p.onAmountReceivedChange(e.target.checked ? totalAmount : 0)}/>
        </label>
      </div>

      {/* Amount Received */}
      <div className="si-amt-recv-row">
        <span className="si-sum-lbl">Amount Received</span>
        <div className="si-recv-right">
          <span className="si-rs-sm">₹</span>
          <input type="number" className="si-recv-input" value={p.amountReceived} onChange={e=>p.onAmountReceivedChange(Number(e.target.value))}/>
          <div ref={payRef} className="si-pay-wrap">
            <button className="si-pay-btn" onClick={()=>setShowPayDrop(!showPayDrop)}>
              {p.paymentMethod} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:12,height:12}}><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showPayDrop && (
              <div className="si-pay-drop">
                {PAYMENT_METHODS.map(m=>(
                  <button key={m} className={`si-pay-opt${p.paymentMethod===m?" si-pay-opt--active":""}`} onClick={()=>{p.onPaymentMethodChange(m);setShowPayDrop(false);}}>{m}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Balance Amount */}
      <div className="si-balance-row">
        <span className="si-balance-lbl">Balance Amount</span>
        <span className={`si-balance-val${balanceAmount===0?" si-balance-zero":""}`}>
          ₹ {balanceAmount.toLocaleString("en-IN",{maximumFractionDigits:1})}
        </span>
      </div>

      {/* Authorized Signatory */}
      <div className="si-signatory">
        <div className="si-signatory-text">Authorized signatory for <strong>scratchweb.solutions</strong></div>
        <div className="si-signatory-box"/>
      </div>

      {/* Add TCS Rate Modal */}
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
  );
}