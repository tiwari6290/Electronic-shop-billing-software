import { useState, useEffect } from "react";
import {
  SalesReturn, InvoiceItem, AdditionalCharge, LinkedInvoice,
  newBlankReturn, saveSalesReturn, getNextSalesReturnNo, calcTotal,
  todayStr,
} from "./Salesreturntypes";
import SRPartySelector from "./Srpartyselector";
import SRMetaFields from "./Srmetafields";
import SRItemsTable from "./Sritemstable";
import SRAddItemsModal from "./Sradditemsmodal";
import { SRSummary, SRFooter, SRQuickSettings } from "./Srsummaryandfooter";
import "./CreateSalesReturn.css";

interface Props {
  editId?: string;
  onBack: () => void;
}

export default function CreateSalesReturn({ editId, onBack }: Props) {
  const [form, setForm] = useState<SalesReturn>(() => newBlankReturn());
  const [showAddItems, setShowAddItems] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);

  useEffect(() => {
    if (editId) {
      const raw = localStorage.getItem("salesReturns");
      if (raw) {
        const all: SalesReturn[] = JSON.parse(raw);
        const found = all.find(x => x.id === editId);
        if (found) {
          setForm(found);
          setShowDiscount(found.discountPct > 0 || found.discountAmt > 0);
        }
      }
    }
  }, [editId]);

  function set(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  // When an invoice is linked, auto-populate form fields from the invoice
  const handleInvoiceLink = (inv: LinkedInvoice | null) => {
    if (!inv) {
      // Clear linked invoice data
      setForm(prev => ({
        ...prev,
        linkedInvoiceId: null,
        billItems: [],
        additionalCharges: [],
        discountPct: 0,
        discountAmt: 0,
        notes: prev.notes,
        termsConditions: prev.termsConditions,
        eWayBillNo: "",
        challanNo: "",
        financedBy: "",
        salesman: "",
        emailId: "",
        warrantyPeriod: "",
      }));
      setShowDiscount(false);
      return;
    }

    // Map invoice items to bill items
    const billItems: InvoiceItem[] = (inv.billItems || []).map(i => ({
      rowId: `row-${Date.now()}-${i.rowId || i.itemId || Math.random()}`,
      itemId: i.itemId,
      name: i.name,
      description: i.description || "",
      hsn: i.hsn || "",
      qty: i.qty,
      unit: i.unit || "PCS",
      price: i.price,
      discountPct: i.discountPct || 0,
      discountAmt: i.discountAmt || 0,
      taxLabel: i.taxLabel || "None",
      taxRate: i.taxRate || 0,
      amount: i.amount || i.qty * i.price,
    }));

    const discPct = inv.discountPct || 0;
    const discAmt = inv.discountAmt || 0;

    setForm(prev => ({
      ...prev,
      billItems,
      additionalCharges: (inv.additionalCharges || []).map(c => ({
        id: `charge-${Date.now()}-${Math.random()}`,
        label: (c as any).label || "",
        amount: c.amount,
        taxLabel: (c as any).taxLabel || "No Tax Applicable",
        taxRate: (c as any).taxRate || 0,
      })),
      discountPct: discPct,
      discountAmt: discAmt,
      notes: inv.notes || prev.notes,
      termsConditions: inv.termsConditions || prev.termsConditions,
    }));

    if (discPct > 0 || discAmt > 0) setShowDiscount(true);
  };

  const handleSave = () => {
    const total = calcTotal(form);
    const status: SalesReturn["status"] =
      form.amountPaid >= total && total > 0 ? "Paid"
        : form.amountPaid > 0 ? "Partially Paid" : "Unpaid";
    const final = { ...form, status };
    saveSalesReturn(final);
    onBack();
  };

  const handleSaveAndNew = () => {
    handleSave();
    setForm(newBlankReturn());
    setShowDiscount(false);
  };

  const total = calcTotal(form);

  return (
    <div className="csr-page">
      {/* Top bar */}
      <div className="csr-topbar">
        <button className="csr-back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Create Sales Return
        </button>
        <div className="csr-topbar-right">
          <button className="csr-kbd-btn" title="Keyboard Shortcuts">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/>
            </svg>
          </button>
          <button className="csr-settings-topbtn" onClick={() => setShowSettings(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Settings
          </button>
          <button className="csr-save-new-btn" onClick={handleSaveAndNew}>Save &amp; New</button>
          <button className="csr-save-btn" onClick={handleSave}>Save</button>
        </div>
      </div>

      {/* Body */}
      <div className="csr-body">
        {/* Top section: Party (left) + Meta (right) */}
        <div className="csr-top-grid">
          <div className="csr-party-panel">
            <SRPartySelector
              selectedParty={form.party}
              shipFrom={form.shipFrom}
              onSelectParty={p => set("party", p)}
              onShipFromChange={addr => set("shipFrom", addr)}
            />
          </div>
          <div className="csr-meta-panel-wrap">
            <SRMetaFields
              salesReturnNo={form.salesReturnNo}
              salesReturnDate={form.salesReturnDate}
              party={form.party}
              currentReturnId={form.id}
              linkedInvoiceId={form.linkedInvoiceId}
              eWayBillNo={form.eWayBillNo}
              challanNo={form.challanNo}
              financedBy={form.financedBy}
              salesman={form.salesman}
              emailId={form.emailId}
              warrantyPeriod={form.warrantyPeriod}
              onChange={set}
              onInvoiceLink={handleInvoiceLink}
            />
          </div>
        </div>

        {/* Items table */}
        <SRItemsTable
          items={form.billItems}
          onChange={items => set("billItems", items)}
          onAddItem={() => setShowAddItems(true)}
        />

        {/* Bottom: footer (left) + summary (right) */}
        <div className="csr-bottom-grid">
          <div className="csr-footer-col">
            <SRFooter
              notes={form.notes}
              termsConditions={form.termsConditions}
              onNotesChange={v => set("notes", v)}
              onTermsChange={v => set("termsConditions", v)}
            />
          </div>
          <div className="csr-summary-col">
            <SRSummary
              items={form.billItems}
              additionalCharges={form.additionalCharges}
              discountType={form.discountType}
              discountPct={form.discountPct}
              discountAmt={form.discountAmt}
              showDiscount={showDiscount}
              autoRoundOff={form.autoRoundOff}
              roundOffAmt={form.roundOffAmt}
              amountPaid={form.amountPaid}
              paymentMethod={form.paymentMethod}
              markFullyPaid={form.markFullyPaid}
              onChargesChange={c => set("additionalCharges", c)}
              onDiscountChange={(pct, amt, type) => {
                set("discountPct", pct);
                set("discountAmt", amt);
                set("discountType", type);
              }}
              onToggleDiscount={show => {
                setShowDiscount(show);
                if (!show) { set("discountPct", 0); set("discountAmt", 0); }
              }}
              onRoundOffChange={(auto, amt) => { set("autoRoundOff", auto); set("roundOffAmt", amt); }}
              onAmountPaidChange={v => set("amountPaid", v)}
              onPaymentMethodChange={v => set("paymentMethod", v)}
              onMarkFullyPaid={v => set("markFullyPaid", v)}
            />
          </div>
        </div>
      </div>

      {showAddItems && (
        <SRAddItemsModal
          onClose={() => setShowAddItems(false)}
          onAddToBill={items => set("billItems", [...form.billItems, ...items])}
        />
      )}

      {showSettings && (
        <SRQuickSettings
          nextNo={form.salesReturnNo + 1}
          onClose={() => setShowSettings(false)}
          onSave={(prefix, seq, showImage) => {
            set("salesReturnNo", seq);
          }}
        />
      )}
    </div>
  );
}