import { useState, useEffect } from "react";
import {
  QuotationData, BillItem, AdditionalCharge, Party,
  getNextQuotationNo, saveQuotation, getQuotationById,
  todayStr, addDays,
} from "./Quotationtypes";
import QuotationHeader from "./Quotationheader";
import PartySelector from "./Partyselector";
import QuotationMetaFields from "./Quotationmetafields";
import ItemsTable from "./Itemstable";
import AddItemsModal from "./Additemsmodal";
import QuotationSummary from "./Quotationsummary";
import QuotationFooter from "./Quotationfooter";
import QuickSettingsModal from "./Quicksettingsmodal";
import "./CreateQuotation.css";

const DEFAULT_TERMS = `1. Goods once sold will not be taken back or exchanged
2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only`;

interface CreateQuotationProps {
  /** Pass an existing quotation id to edit; omit for create */
  editId?: string;
  /** Called after save (navigate away) */
  onBack: () => void;
  /** Called after Save & New (reset form) */
  onSaveAndNew?: () => void;
}

function makeBlank(nextNo: number): QuotationData {
  const today = todayStr();
  return {
    id: `q-${Date.now()}`,
    quotationNo: nextNo,
    quotationDate: today,
    party: null,
    billItems: [],
    additionalCharges: [],
    discountType: "Discount After Tax",
    discountPct: 0,
    discountAmt: 0,
    roundOff: "none",
    roundOffAmt: 0,
    notes: "",
    termsConditions: DEFAULT_TERMS,
    eWayBillNo: "",
    challanNo: "",
    financedBy: "",
    salesman: "",
    emailId: "",
    warrantyPeriod: "",
    validFor: 30,
    validityDate: addDays(today, 30),
    showDueDate: false,
    status: "Open",
    createdAt: today,
  };
}

export default function CreateQuotation({
  editId,
  onBack,
  onSaveAndNew,
}: CreateQuotationProps) {
  const [form, setForm] = useState<QuotationData>(() =>
    editId ? (getQuotationById(editId) ?? makeBlank(getNextQuotationNo())) : makeBlank(getNextQuotationNo())
  );
  const [showAddItems, setShowAddItems] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);

  // Load existing quotation for edit
  useEffect(() => {
    if (editId) {
      const existing = getQuotationById(editId);
      if (existing) {
        setForm(existing);
        setShowDiscount(existing.discountPct > 0 || existing.discountAmt > 0);
      }
    }
  }, [editId]);

  // ── Meta field updater ─────────────────────────────────────────────
  function handleMetaChange(field: string, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // ── Items ──────────────────────────────────────────────────────────
  function handleItemsChange(items: BillItem[]) {
    setForm((prev) => ({ ...prev, billItems: items }));
  }

  function handleAddItemsToBill(newItems: BillItem[]) {
    setForm((prev) => ({
      ...prev,
      billItems: [...prev.billItems, ...newItems],
    }));
  }

  // ── Summary ────────────────────────────────────────────────────────
  const subtotal = form.billItems.reduce((s, i) => s + i.amount, 0);

  // ── Save ───────────────────────────────────────────────────────────
  function handleSave() {
    saveQuotation(form);
    alert(`Quotation #${form.quotationNo} saved!`);
    onBack();
  }

  function handleSaveAndNew() {
    saveQuotation(form);
    const nextNo = getNextQuotationNo();
    setForm(makeBlank(nextNo));
    setShowDiscount(false);
    if (onSaveAndNew) onSaveAndNew();
  }

  return (
    <div className="cq-page">
      {/* ── Top Bar ──────────────────────────────────────────────── */}
      <QuotationHeader
        onBack={onBack}
        onSave={handleSave}
        onSaveAndNew={handleSaveAndNew}
        onSettings={() => setShowSettings(true)}
      />

      <div className="cq-body">
        {/* ── TOP PANEL: Party | Meta ───────────────────────────── */}
        <div className="cq-top-panel">
          <div className="cq-party-col">
            <PartySelector
              selectedParty={form.party}
              onSelectParty={(p) => setForm((prev) => ({ ...prev, party: p }))}
            />
          </div>
          <div className="cq-meta-col">
            <QuotationMetaFields
              quotationNo={form.quotationNo}
              quotationDate={form.quotationDate}
              showDueDate={form.showDueDate}
              validFor={form.validFor}
              validityDate={form.validityDate}
              eWayBillNo={form.eWayBillNo}
              challanNo={form.challanNo}
              financedBy={form.financedBy}
              salesman={form.salesman}
              emailId={form.emailId}
              warrantyPeriod={form.warrantyPeriod}
              onChange={handleMetaChange}
            />
          </div>
        </div>

        {/* ── Items Table ───────────────────────────────────────── */}
        <div className="cq-items-section">
          <ItemsTable
            items={form.billItems}
            onChange={handleItemsChange}
            onAddItem={() => setShowAddItems(true)}
          />
        </div>

        {/* ── Bottom Panel: Footer | Summary ────────────────────── */}
        <div className="cq-bottom-panel">
          <div className="cq-footer-col">
            <QuotationFooter
              notes={form.notes}
              termsConditions={form.termsConditions}
              onNotesChange={(v) => setForm((prev) => ({ ...prev, notes: v }))}
              onTermsChange={(v) => setForm((prev) => ({ ...prev, termsConditions: v }))}
            />
          </div>
          <div className="cq-summary-col">
            <QuotationSummary
              subtotal={subtotal}
              additionalCharges={form.additionalCharges}
              discountType={form.discountType}
              discountPct={form.discountPct}
              discountAmt={form.discountAmt}
              roundOff={form.roundOff}
              roundOffAmt={form.roundOffAmt}
              showDiscount={showDiscount}
              onChargesChange={(c) => setForm((prev) => ({ ...prev, additionalCharges: c }))}
              onDiscountTypeChange={(t) => setForm((prev) => ({ ...prev, discountType: t }))}
              onDiscountPctChange={(v) => setForm((prev) => ({ ...prev, discountPct: v }))}
              onDiscountAmtChange={(v) => setForm((prev) => ({ ...prev, discountAmt: v }))}
              onRoundOffChange={(mode, amt) => setForm((prev) => ({ ...prev, roundOff: mode, roundOffAmt: amt }))}
              onToggleDiscount={(show) => {
                setShowDiscount(show);
                if (!show) setForm((prev) => ({ ...prev, discountPct: 0, discountAmt: 0 }));
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────── */}
      {showAddItems && (
        <AddItemsModal
          onClose={() => setShowAddItems(false)}
          onAddToBill={handleAddItemsToBill}
        />
      )}

      {showSettings && (
        <QuickSettingsModal
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}