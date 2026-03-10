import React, { useState } from "react";
import { ArrowLeft, Download, Printer, Share2, ChevronDown } from "lucide-react";
import { ChallanItem } from "./DeliveryChallan";
import "./Challanviewpage.css";

interface Props {
  challan: ChallanItem;
  onBack: () => void;
  onEdit: () => void;
  onConvertToInvoice: () => void;
}

const fmtDate = (s: string) => {
  const d = new Date(s);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
};

// ─── Thermal Print Settings Modal ─────────────────────────────────────────────
function ThermalPrintModal({ onClose }: { onClose: () => void }) {
  const [left, setLeft] = useState("1000");
  const [right, setRight] = useState("10000");
  return (
    <div className="cvp-overlay" onClick={e => { if(e.target===e.currentTarget) onClose(); }}>
      <div className="cvp-modal">
        <div className="cvp-modal-header">
          <span>Thermal Print Margin Settings</span>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="cvp-modal-body">
          <p className="cvp-modal-section">Spacing</p>
          <div className="cvp-margin-row">
            <div className="cvp-margin-field">
              <label>Left</label>
              <div className="cvp-unit-input">
                <input type="number" value={left} onChange={e => setLeft(e.target.value)} />
                <span className="cvp-unit">mm</span>
              </div>
            </div>
            <div className="cvp-margin-field">
              <label>Right</label>
              <div className="cvp-unit-input">
                <input type="number" value={right} onChange={e => setRight(e.target.value)} />
                <span className="cvp-unit">mm</span>
              </div>
            </div>
          </div>
        </div>
        <div className="cvp-modal-footer">
          <button className="cvp-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="cvp-btn-save" onClick={onClose}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Three-dot Menu (view page) ────────────────────────────────────────────────
function ViewMenu({ onEdit }: { onEdit: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="cvp-menu-wrapper">
      <button className="cvp-menu-btn" onClick={() => setOpen(!open)}>⋮</button>
      {open && (
        <ul className="cvp-menu-dropdown">
          <li onClick={() => { onEdit(); setOpen(false); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </li>
          <li onClick={() => setOpen(false)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Edit History
          </li>
          <li onClick={() => setOpen(false)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Duplicate
          </li>
          <li className="cvp-menu-danger" onClick={() => setOpen(false)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            Delete
          </li>
        </ul>
      )}
    </div>
  );
}

export default function ChallanViewPage({ challan, onBack, onEdit, onConvertToInvoice }: Props) {
  const [showThermal, setShowThermal] = useState(false);
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const items = challan.items || [];
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const totalTax = items.reduce((s, i) => {
    const base = i.qty * i.pricePerItem;
    return s + base * (i.taxRate || 0) / 100;
  }, 0);
  const totalDiscount = items.reduce((s, i) => s + i.discount.amount + (i.qty * i.pricePerItem * i.discount.percent / 100), 0);
  const grandTotal = challan.amount;

  // Get business info from localStorage
  const businessInfo = (() => {
    try { return JSON.parse(localStorage.getItem("businessInfo") || "{}"); } catch { return {}; }
  })();

  return (
    <div className="cvp-page">
      {/* Top Nav */}
      <div className="cvp-topnav">
        <div className="cvp-topnav-left">
          <button className="cvp-back-btn" onClick={onBack}><ArrowLeft size={16}/></button>
          <span className="cvp-title">Delivery Challan #{challan.challanNumber}</span>
          <span className={`cvp-status-badge cvp-status-${challan.status.toLowerCase()}`}>{challan.status}</span>
        </div>
        <div className="cvp-topnav-right">
          <ViewMenu onEdit={onEdit} />
          <div className="cvp-btn-icon-wrapper">
            <button className="cvp-icon-btn" title="Info">ⓘ</button>
          </div>
          <button className="cvp-convert-btn" onClick={onConvertToInvoice}>Convert to Invoice</button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="cvp-actionbar">
        <button className="cvp-action-btn" onClick={() => window.print()}>
          <Download size={15}/> Download PDF
        </button>
        <div className="cvp-split-btn-wrapper">
          <button className="cvp-action-btn cvp-split-main" onClick={() => window.print()}>
            <Printer size={15}/> Print PDF
          </button>
          <button className="cvp-action-btn cvp-split-arrow" onClick={() => setShowPrintMenu(!showPrintMenu)}>
            <ChevronDown size={13}/>
          </button>
          {showPrintMenu && (
            <div className="cvp-split-dropdown">
              <div onClick={() => { window.print(); setShowPrintMenu(false); }}>Print PDF</div>
              <div onClick={() => { setShowThermal(true); setShowPrintMenu(false); }}>Thermal Print Settings</div>
            </div>
          )}
        </div>
        <div className="cvp-split-btn-wrapper">
          <button className="cvp-action-btn cvp-split-main">
            <Share2 size={15}/> Share
          </button>
          <button className="cvp-action-btn cvp-split-arrow" onClick={() => setShowShareMenu(!showShareMenu)}>
            <ChevronDown size={13}/>
          </button>
          {showShareMenu && (
            <div className="cvp-split-dropdown">
              <div onClick={() => setShowShareMenu(false)}>Share via WhatsApp</div>
              <div onClick={() => setShowShareMenu(false)}>Share via Email</div>
              <div onClick={() => setShowShareMenu(false)}>Copy Link</div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Document */}
      <div className="cvp-doc-wrapper">
        <div className="cvp-doc">
          {/* Header */}
          <div className="cvp-doc-header">
            <div className="cvp-company-block">
              <div className="cvp-company-logo">
                <div className="cvp-logo-placeholder">S</div>
              </div>
              <div className="cvp-company-info">
                <div className="cvp-company-name" style={{ color: "#c07000" }}>
                  {businessInfo.name || "scratchweb.solutions"}
                </div>
                <div className="cvp-company-addr">
                  {businessInfo.address || "WEST SHANTINAGAR ANANDNAGAR BALLY HOWRAH SAREE HOUSE, HOWRAH, 711227"}
                </div>
                <div className="cvp-company-detail">Mobile: {businessInfo.mobile || "06299909521"}</div>
                <div className="cvp-company-detail">Email: {businessInfo.email || "rakeshranjantiwar i11@gmail.com"}</div>
              </div>
            </div>
            <div className="cvp-challan-meta">
              <div className="cvp-meta-row">
                <span className="cvp-meta-label">Challan No.</span>
                <span className="cvp-meta-value">{challan.challanNumber}</span>
              </div>
              <div className="cvp-meta-row">
                <span className="cvp-meta-label">Challan Date</span>
                <span className="cvp-meta-value">{fmtDate(challan.date)}</span>
              </div>
            </div>
          </div>

          {/* Document Title */}
          <div className="cvp-doc-title">DELIVERY CHALLAN</div>

          {/* Bill To */}
          <div className="cvp-bill-section">
            <div className="cvp-bill-label">BILL TO</div>
            <div className="cvp-bill-name">{challan.partyName}</div>
            {challan.shippingAddress && <div className="cvp-bill-addr">Address: {challan.shippingAddress}</div>}
          </div>

          {/* Items Table */}
          <table className="cvp-items-table">
            <thead>
              <tr>
                <th>S.NO.</th>
                <th>SERVICES</th>
                <th>QTY.</th>
                <th>RATE</th>
                <th>TAX</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={6} className="cvp-empty-row">No items</td></tr>
              ) : items.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>{item.name}{item.description && <div className="cvp-item-desc">{item.description}</div>}</td>
                  <td>{item.qty} {item.unit}</td>
                  <td>{item.pricePerItem}</td>
                  <td>{item.taxRate || 0}<br/>({item.taxRate || 0}%)</td>
                  <td>{item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="cvp-subtotal-row">
                <td colSpan={2} className="cvp-subtotal-labels">
                  <span>abc</span>
                </td>
                <td>-</td>
                <td>{items.reduce((s,i)=>s+i.pricePerItem,0).toLocaleString()}</td>
                <td>0<br/>(0%)</td>
                <td>₹ {subtotal.toFixed(2)}</td>
              </tr>
              {totalDiscount > 0 && (
                <tr className="cvp-discount-row">
                  <td colSpan={5} style={{ textAlign: "right" }}>Discount</td>
                  <td>-₹ {totalDiscount.toFixed(2)}</td>
                </tr>
              )}
              <tr className="cvp-total-row">
                <td colSpan={2}><strong>TOTAL</strong></td>
                <td>{items.reduce((s,i)=>s+i.qty,0)}</td>
                <td></td>
                <td>₹ 0</td>
                <td><strong>₹ {grandTotal.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>

          {/* HSN Summary */}
          {items.length > 0 && (
            <table className="cvp-hsn-table">
              <thead>
                <tr>
                  <th>HSN/SAC</th>
                  <th>Taxable Value</th>
                  <th colSpan={2}>CGST</th>
                  <th colSpan={2}>SGST</th>
                  <th>Total Tax Amount</th>
                </tr>
                <tr className="cvp-hsn-subhead">
                  <th></th><th></th>
                  <th>Rate</th><th>Amount</th>
                  <th>Rate</th><th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>-</td>
                  <td>{subtotal.toFixed(0)}</td>
                  <td>0%</td><td>0</td>
                  <td>0%</td><td>0</td>
                  <td>₹ 0</td>
                </tr>
              </tbody>
            </table>
          )}

          {/* Amount in Words */}
          <div className="cvp-amount-words">
            <strong>Total Amount (in words)</strong>
            <div>{numberToWords(grandTotal)}</div>
          </div>

          {/* Terms */}
          {challan.termsAndConditions && (
            <div className="cvp-terms">
              <strong>Terms and Conditions</strong>
              <div>{challan.termsAndConditions}</div>
            </div>
          )}

          {/* Footer */}
          <div className="cvp-doc-footer">
            <div className="cvp-auth-sig">
              <div>Authorised Signatory For</div>
              <div className="cvp-auth-name">{businessInfo.name || "scratchweb.solutions"}</div>
              <div className="cvp-sig-line"></div>
            </div>
          </div>
        </div>
      </div>

      {showThermal && <ThermalPrintModal onClose={() => setShowThermal(false)} />}
    </div>
  );
}

// ─── Number to words helper ────────────────────────────────────────────────────
function numberToWords(num: number): string {
  if (num === 0) return "Zero Rupees Only";
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  function helper(n: number): string {
    if (n === 0) return "";
    if (n < 20) return ones[n] + " ";
    if (n < 100) return tens[Math.floor(n/10)] + " " + helper(n%10);
    if (n < 1000) return ones[Math.floor(n/100)] + " Hundred " + helper(n%100);
    if (n < 100000) return helper(Math.floor(n/1000)) + "Thousand " + helper(n%1000);
    if (n < 10000000) return helper(Math.floor(n/100000)) + "Lakh " + helper(n%100000);
    return helper(Math.floor(n/10000000)) + "Crore " + helper(n%10000000);
  }
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = helper(rupees).trim() + " Rupees";
  if (paise > 0) result += " and " + helper(paise).trim() + " Paise";
  return result + " Only";
}