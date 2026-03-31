import { useState, useEffect } from "react";
import {
  CreditNote, InvoiceItem, AdditionalCharge, LinkedSalesInvoice,
  newBlankCreditNote, saveCreditNote, calcTotal,
  getCreditNotePrefix, saveCreditNotePrefix, getNextCreditNoteNo,
} from "./Creditnotetypes";
import CNPartySelector from "./Cnpartyselector";
import CNMetaFields from "./Cnmetafields";
import CNItemsTable from "./Cnitemstable";
import CNAddItemsModal from "./Cnadditemsmodal";
import { CNSummary, CNFooter, CNQuickSettings } from "./Cnsummaryfooter";
import "./CreateCreditNote.css";

interface Props {
  editId?: string;
  onBack: (savedCreditNote?: any) => void;
  prefillInvoice?: any;
}

export default function CreateCreditNote({ editId, onBack, prefillInvoice }: Props) {
  const [form, setForm] = useState<CreditNote>(() => newBlankCreditNote());
  const [showAddItems, setShowAddItems] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);

  useEffect(() => {
    if (editId) {
      try {
        const raw = localStorage.getItem("creditNotes");
        if (raw) {
          const all: CreditNote[] = JSON.parse(raw);
          const found = all.find(x => x.id === editId);
          if (found) {
            setForm(found);
            setShowDiscount(found.discountPct > 0 || found.discountAmt > 0);
          }
        }
      } catch {}
    } else if (prefillInvoice) {
      // Pre-populate from the sales invoice
      const inv = prefillInvoice;
      const billItems: InvoiceItem[] = (inv.billItems || []).map((i: any) => ({
        rowId: `row-${Date.now()}-${Math.random()}`,
        itemId: i.itemId || "",
        name: i.name || "",
        description: i.description || "",
        hsn: i.hsn || "",
        qty: i.qty,
        unit: i.unit || "PCS",
        price: i.price,
        discountPct: i.discountPct || 0,
        discountAmt: i.discountAmt || 0,
        taxLabel: i.taxLabel || "None",
        taxRate: i.taxRate || 0,
        amount: i.amount,
      }));
      setForm(prev => ({
        ...prev,
        party: inv.party ? {
          id: Number(inv.party.id) || Date.now(),
          name: inv.party.name || "",
          mobile: inv.party.mobile || "",
          category: inv.party.category || "Customer",
          type: (inv.party.type as "Customer" | "Supplier" | "Both") || "Customer",
          balance: inv.party.balance || 0,
          email: inv.party.email,
          gstin: inv.party.gstin,
          billingAddress: inv.party.billingAddress,
        } : null,
        linkedInvoiceId: inv.id,
        billItems,
        additionalCharges: (inv.additionalCharges || []).map((c: any) => ({
          id: `c-${Date.now()}-${Math.random()}`,
          label: c.label || "",
          amount: c.amount || 0,
          taxLabel: c.taxLabel || "No Tax Applicable",
        })),
        discountPct: inv.discountPct || 0,
        discountAmt: inv.discountAmt || 0,
        eWayBillNo: inv.eWayBillNo || "",
        challanNo: inv.challanNo || "",
        financedBy: inv.financedBy || "",
        salesman: inv.salesman || "",
        notes: inv.notes || "",
        termsConditions: inv.termsConditions || "",
      }));
      setShowDiscount((inv.discountPct || 0) > 0 || (inv.discountAmt || 0) > 0);
    }
  }, [editId, prefillInvoice]);

  function set(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  // When an invoice is linked, auto-populate form fields
  const handleInvoiceLink = (inv: LinkedSalesInvoice | null) => {
    if (!inv) {
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

  const doSave = (cn = form) => {
    const total = calcTotal(cn);
    // If created from an invoice, mark as Refunded; otherwise normal status
    const status: CreditNote["status"] =
      cn.linkedInvoiceId && prefillInvoice
        ? "Refunded"
        : cn.amountPaid >= total && total > 0 ? "Paid"
        : cn.amountPaid > 0 ? "Partially Paid" : "Unpaid";
    const saved = { ...cn, status };
    saveCreditNote(saved);
    return saved;
  };

  const handleSave = () => {
    const saved = doSave();
    onBack(saved);
  };

  const handleSaveAndNew = () => {
    // Save current, then start fresh — stay on create page
    doSave();
    const fresh = newBlankCreditNote();
    setForm(fresh);
    setShowDiscount(false);
  };

  const handleSaveSettings = (prefix: string, seq: number, _showImage: boolean) => {
    saveCreditNotePrefix(prefix);
    setForm(prev => ({ ...prev, creditNoteNo: seq, prefix }));
  };

  return (
    <div className="cn-page">
      {/* Top bar */}
      <div className="cn-topbar">
        <button className="cn-back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Create Credit Note
        </button>
        <div className="cn-topbar-right">
          <button className="cn-kbd-btn" title="Keyboard Shortcuts">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/>
            </svg>
          </button>
          <button className="cn-settings-topbtn" onClick={() => setShowSettings(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Settings
          </button>
          <button className="cn-save-new-btn" onClick={handleSaveAndNew}>Save &amp; New</button>
          <button className="cn-save-btn" onClick={handleSave}>Save</button>
        </div>
      </div>

      {/* Body */}
      <div className="cn-body">
        {/* Party panel (left) + Meta (right) */}
        <div className="cn-top-grid">
          <div className="cn-party-panel">
            <CNPartySelector
              selectedParty={form.party}
              shipFrom={form.shipFrom}
              onSelectParty={p => set("party", p)}
              onShipFromChange={addr => set("shipFrom", addr)}
            />
          </div>
          <div className="cn-meta-panel-wrap">
            <CNMetaFields
              creditNoteNo={form.creditNoteNo}
              creditNoteDate={form.creditNoteDate}
              prefix={form.prefix}
              party={form.party}
              currentCreditNoteId={form.id}
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
        <CNItemsTable
          items={form.billItems}
          onChange={items => set("billItems", items)}
          onAddItem={() => setShowAddItems(true)}
        />

        {/* Bottom: footer (left) + summary (right) */}
        <div className="cn-bottom-grid">
          <div className="cn-footer-col">
            <CNFooter
              notes={form.notes}
              termsConditions={form.termsConditions}
              onNotesChange={v => set("notes", v)}
              onTermsChange={v => set("termsConditions", v)}
            />
          </div>
          <div className="cn-summary-col">
            <CNSummary
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
        <CNAddItemsModal
          onClose={() => setShowAddItems(false)}
          onAddToBill={items => set("billItems", [...form.billItems, ...items])}
        />
      )}

      {showSettings && (
        <CNQuickSettings
          nextNo={form.creditNoteNo}
          currentPrefix={form.prefix}
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
}