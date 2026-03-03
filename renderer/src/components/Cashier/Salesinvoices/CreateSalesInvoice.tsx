import { useState, useEffect } from "react";
import {
  SalesInvoice, BillItem, AdditionalCharge,
  getNextInvoiceNo, saveSalesInvoice, getSalesInvoiceById,
  makeBlankInvoice, todayStr,
} from "./SalesInvoiceTypes";
import SIPartySelector from "./SIPartySelector";
import SIMetaFields from "./SIMetaFields";
import SIItemsTable from "./SIItemsTable";
import SIAddItemsModal from "./SIAddItemsModal";
import SISummary from "./SISummary";
import SIFooter from "./SIFooter";
import "./CreateSalesInvoice.css";

// Quick Invoice Settings Modal (from screenshots 14-15)
function QuickSettingsModal({ onClose }: { onClose: () => void }) {
  const [prefixOn, setPrefixOn] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [seqNo, setSeqNo] = useState(getNextInvoiceNo());
  const [showPurchasePrice, setShowPurchasePrice] = useState(true);
  const [showItemImage, setShowItemImage] = useState(true);
  const [priceHistory, setPriceHistory] = useState(true);
  const [theme, setTheme] = useState("Advanced GST");
  function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
    return (
      <button className={`csi-toggle${on?" csi-toggle--on":""}`} onClick={()=>set(!on)}>
        <span className="csi-toggle-th"/>
      </button>
    );
  }
  return (
    <div className="csi-overlay" onClick={onClose}>
      <div className="csi-modal" onClick={e=>e.stopPropagation()}>
        <div className="csi-modal-hdr"><span>Quick Invoice Settings</span><button onClick={onClose}>✕</button></div>
        <div className="csi-settings-body">
          {[
            { label:"Invoice Prefix & Sequence Number", sub:"Add your custom prefix & sequence for Invoice Numbering", on:prefixOn, set:setPrefixOn, extra: prefixOn && (
              <div className="csi-prefix-row">
                <div><label>Prefix</label><input value={prefix} onChange={e=>setPrefix(e.target.value)} placeholder="Prefix" className="csi-si-inp"/></div>
                <div><label>Sequence Number</label><input type="number" value={seqNo} onChange={e=>setSeqNo(Number(e.target.value))} className="csi-si-inp"/></div>
              </div>
            )},
            { label:"Show Purchase Price while adding Items", sub:"Add purchase price while adding items", on:showPurchasePrice, set:setShowPurchasePrice },
            { label:"Show Item Image on Invoice", sub:"This will apply to all vouchers except for Payment In and Payment Out", on:showItemImage, set:setShowItemImage },
            { label:<><span>Price History</span> <span className="csi-badge-new">New</span></>, sub:"Show last 5 sales / purchase prices of the item for the selected party in invoice", on:priceHistory, set:setPriceHistory },
          ].map((item: any, i) => (
            <div key={i} className="csi-settings-section">
              <div className="csi-settings-row">
                <div>
                  <div className="csi-s-label">{item.label}</div>
                  <div className="csi-s-sub">{item.sub}</div>
                </div>
                <Toggle on={item.on} set={item.set}/>
              </div>
              {item.extra}
              {prefixOn && i===0 && <div className="csi-inv-preview">Invoice Number: {seqNo}</div>}
            </div>
          ))}
          <div className="csi-settings-section">
            <div className="csi-s-label" style={{marginBottom:8}}>Choose Invoice Theme</div>
            <select value={theme} onChange={e=>setTheme(e.target.value)} className="csi-theme-sel">
              <option>Advanced GST</option><option>Simple GST</option><option>Basic</option><option>Professional</option>
            </select>
          </div>
          <div className="csi-customize-banner">
            <div>
              <div style={{fontWeight:600,marginBottom:6}}>Now <span style={{color:"#4f46e5"}}>customise Invoice</span> with ease</div>
              <button className="csi-full-settings">Full Invoice Settings →</button>
            </div>
            <div className="csi-invoice-thumb">
              <div style={{fontSize:11,fontWeight:700,color:"#6b7280",textAlign:"center"}}>INVOICE</div>
            </div>
          </div>
        </div>
        <div className="csi-modal-ftr">
          <button className="csi-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="csi-btn-primary" onClick={onClose}>Save</button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  editId?: string;
  onBack: () => void;
  onSaveAndNew?: () => void;
  /** Pre-fill form from a converted quotation */
  fromQuotation?: any | null;
}

export default function CreateSalesInvoice({ editId, onBack, onSaveAndNew, fromQuotation }: Props) {

  // ── Convert quotation data → SalesInvoice shape ────────────────────────────
  function quotationToInvoice(q: any): import("./SalesInvoiceTypes").SalesInvoice {
    const blank = makeBlankInvoice(getNextInvoiceNo());
    // Map bill items: quotation BillItem shape matches SalesInvoice BillItem shape
    const billItems = (q.billItems || []).map((item: any) => ({
      rowId: `row-${Date.now()}-${item.rowId || item.itemId}`,
      itemId: item.itemId,
      name: item.name,
      description: item.description || "",
      hsn: item.hsn || "",
      qty: item.qty,
      unit: item.unit || "PCS",
      price: item.price,
      discountPct: item.discountPct || 0,
      discountAmt: item.discountAmt || 0,
      taxLabel: item.taxLabel || "None",
      taxRate: item.taxRate || 0,
      amount: item.amount,
    }));
    return {
      ...blank,
      party: q.party || null,
      billItems,
      additionalCharges: q.additionalCharges || [],
      discountType: q.discountType || blank.discountType,
      discountPct: q.discountPct || 0,
      discountAmt: q.discountAmt || 0,
      roundOff: q.roundOff || "none",
      roundOffAmt: q.roundOffAmt || 0,
      notes: q.notes || "",
      termsConditions: q.termsConditions || blank.termsConditions,
    };
  }

  const [form, setForm] = useState<import("./SalesInvoiceTypes").SalesInvoice>(() => {
    if (editId) return getSalesInvoiceById(editId) ?? makeBlankInvoice(getNextInvoiceNo());
    if (fromQuotation) return quotationToInvoice(fromQuotation);
    return makeBlankInvoice(getNextInvoiceNo());
  });
  const [showAddItems, setShowAddItems] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);

  useEffect(() => {
    if (editId) {
      const ex = getSalesInvoiceById(editId);
      if (ex) {
        setForm(ex);
        setShowDiscount(ex.discountPct > 0 || ex.discountAmt > 0);
      }
    }
  }, [editId]);

  function set(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    const status: SalesInvoice["status"] =
      form.amountReceived >= calcTotal() && calcTotal() > 0 ? "Paid"
      : form.amountReceived > 0 ? "Partially Paid" : "Unpaid";
    const final = { ...form, status };
    saveSalesInvoice(final);
    onBack();
  }

  function handleSaveAndNew() {
    handleSave();
    const next = makeBlankInvoice(getNextInvoiceNo());
    setForm(next);
    setShowDiscount(false);
    if (onSaveAndNew) onSaveAndNew();
  }

  // Calculations for summary
  const subtotal = form.billItems.reduce((s, i) => s + i.price * i.qty, 0);
  const totalTax = form.billItems.reduce((s, i) => {
    const base = i.qty * i.price - (i.qty * i.price * i.discountPct / 100) - i.discountAmt;
    return s + base * i.taxRate / 100;
  }, 0);
  function calcTotal(): number {
    const chargesTotal = form.additionalCharges.reduce((s, c) => s + c.amount, 0);
    const taxable = subtotal + chargesTotal;
    const discVal = taxable * form.discountPct / 100 || form.discountAmt;
    const afterDisc = taxable - discVal;
    const tcs = afterDisc * form.tcsRate / 100;
    return afterDisc + tcs + form.roundOffAmt;
  }

  return (
    <div className="csi-page">
      {/* ── Top Nav ──────────────────────────────────────────────── */}
      <div className="csi-topbar">
        <button className="csi-back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Create Sales Invoice
        </button>
        <div className="csi-topbar-right">
          <button className="csi-keyboard-btn" title="Keyboard Shortcuts">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/></svg>
          </button>
          <button className="csi-settings-btn" onClick={()=>setShowSettings(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Settings
            <span className="csi-notif-dot"/>
          </button>
          <button className="csi-save-new-btn" onClick={handleSaveAndNew}>Save & New</button>
          <button className="csi-save-btn" onClick={handleSave}>Save</button>
        </div>
      </div>

      {/* ── Main Body ────────────────────────────────────────────── */}
      <div className="csi-body">
        {/* Top Panel: Party (left) + Meta (right) */}
        <div className="csi-top-panel">
          <div className="csi-party-col">
            <SIPartySelector
              selectedParty={form.party}
              shipTo={form.shipTo}
              onSelectParty={p => set("party", p)}
            />
          </div>
          <div className="csi-meta-col">
            <SIMetaFields
              invoiceNo={form.invoiceNo}
              invoiceDate={form.invoiceDate}
              showDueDate={form.showDueDate}
              paymentTermsDays={form.paymentTermsDays}
              dueDate={form.dueDate}
              eWayBillNo={form.eWayBillNo}
              challanNo={form.challanNo}
              financedBy={form.financedBy}
              salesman={form.salesman}
              emailId={form.emailId}
              warrantyPeriod={form.warrantyPeriod}
              showColumns={form.showColumns}
              onChange={(field, value) => set(field, value)}
              onShowColumnsChange={cols => set("showColumns", cols)}
            />
          </div>
        </div>

        {/* Items Table */}
        <SIItemsTable
          items={form.billItems}
          showColumns={form.showColumns}
          onChange={items => set("billItems", items)}
          onAddItem={() => setShowAddItems(true)}
        />

        {/* Bottom Panel: Footer (left) + Summary (right) */}
        <div className="csi-bottom-panel">
          <div className="csi-footer-col">
            <SIFooter
              notes={form.notes}
              termsConditions={form.termsConditions}
              onNotesChange={v => set("notes", v)}
              onTermsChange={v => set("termsConditions", v)}
            />
          </div>
          <div className="csi-summary-col">
            <SISummary
              subtotal={subtotal}
              totalTax={totalTax}
              additionalCharges={form.additionalCharges}
              discountType={form.discountType}
              discountPct={form.discountPct}
              discountAmt={form.discountAmt}
              showDiscount={showDiscount}
              applyTCS={form.applyTCS}
              tcsRate={form.tcsRate}
              tcsLabel={form.tcsLabel}
              tcsBase={form.tcsBase}
              roundOff={form.roundOff}
              roundOffAmt={form.roundOffAmt}
              amountReceived={form.amountReceived}
              paymentMethod={form.paymentMethod}
              onChargesChange={c => set("additionalCharges", c)}
              onDiscountTypeChange={t => set("discountType", t)}
              onDiscountPctChange={v => set("discountPct", v)}
              onDiscountAmtChange={v => set("discountAmt", v)}
              onToggleDiscount={show => {
                setShowDiscount(show);
                if (!show) { set("discountPct", 0); set("discountAmt", 0); }
              }}
              onTCSChange={(apply, rate, label, base) => {
                set("applyTCS", apply);
                set("tcsRate", rate);
                set("tcsLabel", label);
                set("tcsBase", base);
              }}
              onRoundOffChange={(mode, amt) => { set("roundOff", mode); set("roundOffAmt", amt); }}
              onAmountReceivedChange={v => set("amountReceived", v)}
              onPaymentMethodChange={v => set("paymentMethod", v)}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddItems && (
        <SIAddItemsModal
          onClose={() => setShowAddItems(false)}
          onAddToBill={items => {
            set("billItems", [...form.billItems, ...items]);
          }}
        />
      )}
      {showSettings && <QuickSettingsModal onClose={() => setShowSettings(false)}/>}
    </div>
  );
}