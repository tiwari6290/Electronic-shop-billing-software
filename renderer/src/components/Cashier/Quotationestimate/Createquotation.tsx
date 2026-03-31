import { useState, useEffect } from "react";
import {
  QuotationData, BillItem, AdditionalCharge,
  apiGetQuotationById, apiCreateQuotation, apiUpdateQuotation,
  apiGetQuotationSettings, formDataToApiPayload, apiToFormData,
  todayStr, addDays, QuotationSettings, calcBillItemAmount,
} from "./Quotationtypes";
import QuotationHeader     from "./Quotationheader";
import PartySelector       from "./Partyselector";
import QuotationMetaFields from "./Quotationmetafields";
import ItemsTable          from "./Itemstable";
import AddItemsModal       from "./Additemsmodal";
import QuotationSummary    from "./Quotationsummary";
import QuotationFooter     from "./Quotationfooter";
import QuickSettingsModal  from "./Quicksettingsmodal";
import "./CreateQuotation.css";

const DEFAULT_TERMS = `1. Goods once sold will not be taken back or exchanged
2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only`;

interface CreateQuotationProps {
  editId?: string;
  onBack: () => void;
  onSaveAndNew?: () => void;
}

function makeBlank(nextNo: number, prefix = ""): QuotationData {
  const today = todayStr();
  return {
    id:                "",
    quotationNo:       `${prefix}${String(nextNo).padStart(5, "0")}`,
    quotationDate:     today,
    party:             null,
    billItems:         [],
    additionalCharges: [],
    discountType:      "Discount After Tax",
    discountPct:       0,
    discountAmt:       0,
    roundOff:          "none",
    roundOffAmt:       0,
    notes:             "",
    termsConditions:   DEFAULT_TERMS,
    eWayBillNo:        "",
    challanNo:         "",
    financedBy:        "",
    salesman:          "",
    emailId:           "",
    warrantyPeriod:    "",
    poNumber:          "",
    vehicleNo:         "",
    dispatchedThrough: "",
    transportName:     "",
    customFieldValues: {},
    validFor:          30,
    validityDate:      addDays(today, 30),
    showDueDate:       false,
    status:            "Open",
    createdAt:         today,
  };
}

export default function CreateQuotation({ editId, onBack, onSaveAndNew }: CreateQuotationProps) {
  const [form,         setForm]         = useState<QuotationData>(() => makeBlank(1));
  const [settings,     setSettings]     = useState<QuotationSettings | null>(null);
  const [showAddItems, setShowAddItems] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [loading,      setLoading]      = useState(!!editId);

  useEffect(() => {
    apiGetQuotationSettings()
      .then(s => {
        setSettings(s);
        if (!editId) {
          setForm(prev => ({
            ...prev,
            quotationNo: `${s.prefix}${String(s.sequenceNumber).padStart(5, "0")}`,
          }));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (editId) {
      setLoading(true);
      apiGetQuotationById(Number(editId))
        .then(q => {
          const formData = apiToFormData(q);
          setForm({
            ...formData,
            customFieldValues: formData.customFieldValues ?? {},
          });
          setShowDiscount(formData.discountPct > 0 || formData.discountAmt > 0);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [editId]);

  // ── Central field change handler ──────────────────────────────────────────
  function handleMetaChange(field: string, value: string | number | boolean) {
    if (field.startsWith("customField_")) {
      const label = field.replace("customField_", "");
      setForm(prev => ({
        ...prev,
        customFieldValues: { ...(prev.customFieldValues ?? {}), [label]: String(value) },
      }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  }

  function handleItemsChange(items: BillItem[]) {
    setForm(prev => ({ ...prev, billItems: items }));
  }

  function handleAddItemsToBill(newItems: BillItem[]) {
    // newItems already have price=baseSalesPrice and amount computed via
    // calcBillItemAmount inside AddItemsModal — just append them.
    setForm(prev => ({ ...prev, billItems: [...prev.billItems, ...newItems] }));
  }

  // subtotal = sum of all line amounts (post-discount, inclusive of item GST)
  // This is the single source of truth passed into QuotationSummary.
  const subtotal = parseFloat(
    form.billItems.reduce((s, i) => s + calcBillItemAmount(i).amount, 0).toFixed(2)
  );

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      const payload = formDataToApiPayload(form, settings ?? undefined);
      if (editId) {
        await apiUpdateQuotation(Number(editId), payload);
      } else {
        await apiCreateQuotation(payload);
        if (settings) setSettings(s => s ? { ...s, sequenceNumber: s.sequenceNumber + 1 } : s);
      }
      onBack();
    } catch (err: any) {
      alert(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAndNew() {
    if (saving) return;
    setSaving(true);
    try {
      const payload = formDataToApiPayload(form, settings ?? undefined);
      if (editId) {
        await apiUpdateQuotation(Number(editId), payload);
      } else {
        await apiCreateQuotation(payload);
      }
      const currentNo = settings?.sequenceNumber ?? Number(String(form.quotationNo).replace(/\D/g, ""));
      const nextNo    = currentNo + 1;
      if (settings) setSettings(s => s ? { ...s, sequenceNumber: nextNo } : s);
      setForm(makeBlank(nextNo, settings?.prefix ?? ""));
      setShowDiscount(false);
      if (onSaveAndNew) onSaveAndNew();
    } catch (err: any) {
      alert(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="cq-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <span style={{ color: "#6b7280", fontSize: 15 }}>Loading quotation...</span>
      </div>
    );
  }

  return (
    <div className="cq-page">
      <QuotationHeader
        onBack={onBack}
        onSave={handleSave}
        onSaveAndNew={handleSaveAndNew}
        onSettings={() => setShowSettings(true)}
      />

      <div className="cq-body">
        <div className="cq-top-panel">
          <div className="cq-party-col">
            <PartySelector
              selectedParty={form.party}
              onSelectParty={p => setForm(prev => ({ ...prev, party: p }))}
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
              poNumber={(form as any).poNumber ?? ""}
              vehicleNo={(form as any).vehicleNo ?? ""}
              dispatchedThrough={(form as any).dispatchedThrough ?? ""}
              transportName={(form as any).transportName ?? ""}
              customFieldValues={form.customFieldValues ?? {}}
              onChange={handleMetaChange}
            />
          </div>
        </div>

        <div className="cq-items-section">
          <ItemsTable
            items={form.billItems}
            onChange={handleItemsChange}
            onAddItem={() => setShowAddItems(true)}
          />
        </div>

        <div className="cq-bottom-panel">
          <div className="cq-footer-col">
            <QuotationFooter
              notes={form.notes}
              termsConditions={form.termsConditions}
              onNotesChange={v => setForm(prev => ({ ...prev, notes: v }))}
              onTermsChange={v => setForm(prev => ({ ...prev, termsConditions: v }))}
            />
          </div>
          <div className="cq-summary-col">
            <QuotationSummary
              subtotal={subtotal}
              billItems={form.billItems}
              additionalCharges={form.additionalCharges}
              discountType={form.discountType}
              discountPct={form.discountPct}
              discountAmt={form.discountAmt}
              roundOff={form.roundOff}
              roundOffAmt={form.roundOffAmt}
              showDiscount={showDiscount}
              onChargesChange={c => setForm(prev => ({ ...prev, additionalCharges: c }))}
              onDiscountTypeChange={t => setForm(prev => ({ ...prev, discountType: t }))}
              onDiscountPctChange={v => setForm(prev => ({ ...prev, discountPct: v }))}
              onDiscountAmtChange={v => setForm(prev => ({ ...prev, discountAmt: v }))}
              onRoundOffChange={(mode, amt) => setForm(prev => ({ ...prev, roundOff: mode, roundOffAmt: amt }))}
              onToggleDiscount={show => {
                setShowDiscount(show);
                if (!show) setForm(prev => ({ ...prev, discountPct: 0, discountAmt: 0 }));
              }}
            />
          </div>
        </div>
      </div>

      {showAddItems && (
        <AddItemsModal
          onClose={() => setShowAddItems(false)}
          onAddToBill={handleAddItemsToBill}
        />
      )}
      {showSettings && <QuickSettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}