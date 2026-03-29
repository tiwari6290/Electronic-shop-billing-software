import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";   // ← FIX: read convert state from router

import {
  SalesInvoice,
  makeBlankInvoice,
  reverseCalcAfterDiscount,
} from "./SalesInvoiceTypes";

import {
  createInvoice,
  updateInvoice,
  getInvoiceById,
  toCreatePayload,
  getInvoiceSettings,
  saveInvoiceSettings,
  getInvoiceDetailsSettings,
  buildInvoiceNo,
  type InvoiceSettings,
} from "../../../api/salesInvoiceApi";

import { mapBackendInvoice } from "../../../utils/invoiceMapper";

// FIX: import the status-update helpers so we can close the source docs
// ONLY after the invoice has been successfully saved to the backend.
import { updateChallanStatus } from "../../../api/deliverychallanapi";

// FIX: proformaApi may not exist. Use a direct fetch to the dedicated
// PATCH /api/proforma-invoices/:id/status endpoint added in proforma_routes.ts.
async function updateProformaStatus(id: number, status: string): Promise<void> {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
  const res = await fetch(`http://localhost:4000/api/proforma-invoices/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).message || `HTTP ${res.status}`);
  }
}

import SIPartySelector from "./SIPartySelector";
import SIMetaFields    from "./SIMetaFields";
import SIItemsTable    from "./SIItemsTable";
import SIAddItemsModal from "./SIAddItemsModal";
import SISummary       from "./SISummary";
import SIFooter        from "./SIFooter";
import "./CreateSalesInvoice.css";


// ─── Read builder custom-field defaults from localStorage ────────────────────
function loadBuilderCustomFieldDefaults(): Record<string, string> {
  try {
    const raw = localStorage.getItem("activeInvoiceTemplate");
    if (!raw) return {};
    const t = JSON.parse(raw);
    const customFields: { label: string; value: string }[] = t?.det?.customFields ?? [];
    const defaults: Record<string, string> = {};
    customFields.forEach(cf => {
      if (cf.label) defaults[cf.label] = cf.value ?? "";
    });
    return defaults;
  } catch {
    return {};
  }
}

/*────────────────────────────────────────────
 QUICK SETTINGS MODAL
 - Loads current settings from backend on open
 - Saves to backend on Save
 - After save, parent receives the updated invoiceNo preview
────────────────────────────────────────────*/

interface QuickSettingsModalProps {
  onClose: () => void;
  onSaved: (newInvoiceNo: string) => void;
}

function QuickSettingsModal({ onClose, onSaved }: QuickSettingsModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // Settings state — mirrors InvoiceSettings shape
  const [enablePrefix,      setEnablePrefix]      = useState(false);
  const [prefix,            setPrefix]            = useState("");
  const [seqNo,             setSeqNo]             = useState(1);
  const [showPurchasePrice, setShowPurchasePrice] = useState(true);
  const [showItemImage,     setShowItemImage]     = useState(true);
  const [priceHistory,      setPriceHistory]      = useState(true);
  const [theme,             setTheme]             = useState("Advanced GST");

  // Load from backend when modal opens
  useEffect(() => {
    let active = true;
    setLoading(true);
    getInvoiceSettings()
      .then(s => {
        if (!active) return;
        setEnablePrefix(s.enablePrefix);
        setPrefix(s.prefix ?? "");
        setSeqNo(s.sequenceNumber ?? 1);
        setShowPurchasePrice(s.showPurchasePrice ?? true);
        setShowItemImage(s.showItemImage ?? true);
        setPriceHistory(s.enablePriceHistory ?? true);
        setTheme(s.invoiceTheme ?? "Advanced GST");
      })
      .catch(() => {/* use defaults already set */})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  // Live preview of what the next invoice number will look like
  const previewNo = (() => {
    const seq = String(seqNo).padStart(5, "0");
    if (enablePrefix && prefix.trim()) return `${prefix.trim()}${seq}`;
    return `INV-${seq}`;
  })();

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const payload: Omit<InvoiceSettings, "id"> = {
        enablePrefix,
        prefix:             prefix.trim(),
        sequenceNumber:     seqNo,
        showPurchasePrice,
        showItemImage,
        enablePriceHistory: priceHistory,
        invoiceTheme:       theme,
      };
      const saved = await saveInvoiceSettings(payload);
      onSaved(buildInvoiceNo(saved));
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
    return (
      <button
        className={`csi-toggle${on ? " csi-toggle--on" : ""}`}
        onClick={() => set(!on)}
      >
        <span className="csi-toggle-th" />
      </button>
    );
  }

  return (
    <div className="csi-overlay" onClick={onClose}>
      <div className="csi-modal" onClick={e => e.stopPropagation()}>

        <div className="csi-modal-hdr">
          <span>Quick Invoice Settings</span>
          <button onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div style={{ padding: "40px 24px", textAlign: "center", color: "#6b7280", fontSize: 14 }}>
            Loading settings…
          </div>
        ) : (
          <div className="csi-settings-body">

            {/* ── Prefix & Sequence ── */}
            <div className="csi-settings-section">
              <div className="csi-settings-row">
                <div>
                  <div className="csi-s-label">Invoice Prefix &amp; Sequence Number</div>
                  <div className="csi-s-sub">Add your custom prefix &amp; sequence for Invoice Numbering</div>
                </div>
                <Toggle on={enablePrefix} set={setEnablePrefix} />
              </div>

              {enablePrefix && (
                <div className="csi-prefix-row">
                  <div>
                    <label>Prefix</label>
                    <input
                      value={prefix}
                      onChange={e => setPrefix(e.target.value)}
                      className="csi-si-inp"
                      placeholder="e.g. INV- or SI-"
                    />
                  </div>
                  <div>
                    <label>Sequence Number</label>
                    <input
                      type="number"
                      min={1}
                      value={seqNo}
                      onChange={e => setSeqNo(Math.max(1, Number(e.target.value)))}
                      className="csi-si-inp"
                    />
                  </div>
                </div>
              )}

              {/* Always show preview */}
              <div className="csi-inv-preview">
                Invoice Number Preview: <strong>{previewNo}</strong>
              </div>
            </div>

            {/* ── Show Purchase Price ── */}
            <div className="csi-settings-section">
              <div className="csi-settings-row">
                <div>
                  <div className="csi-s-label">Show Purchase Price while adding Items</div>
                  <div className="csi-s-sub">Add purchase price while adding items</div>
                </div>
                <Toggle on={showPurchasePrice} set={setShowPurchasePrice} />
              </div>
            </div>

            {/* ── Show Item Image ── */}
            <div className="csi-settings-section">
              <div className="csi-settings-row">
                <div>
                  <div className="csi-s-label">Show Item Image on Invoice</div>
                  <div className="csi-s-sub">
                    This will apply to all vouchers except Payment In and Payment Out
                  </div>
                </div>
                <Toggle on={showItemImage} set={setShowItemImage} />
              </div>
            </div>

            {/* ── Price History ── */}
            <div className="csi-settings-section">
              <div className="csi-settings-row">
                <div>
                  <div className="csi-s-label">
                    Price History
                    <span className="csi-badge-new">New</span>
                  </div>
                  <div className="csi-s-sub">Show last 5 sales / purchase prices</div>
                </div>
                <Toggle on={priceHistory} set={setPriceHistory} />
              </div>
            </div>

            {/* ── Invoice Theme ── */}
            <div className="csi-settings-section">
              <div className="csi-s-label">Choose Invoice Theme</div>
              <select
                value={theme}
                onChange={e => setTheme(e.target.value)}
                className="csi-theme-sel"
              >
                <option>Advanced GST</option>
                <option>Simple GST</option>
                <option>Basic</option>
                <option>Professional</option>
              </select>
            </div>

            {/* Error */}
            {error && (
              <div style={{ color: "#dc2626", fontSize: 13, padding: "4px 0" }}>
                ⚠ {error}
              </div>
            )}
          </div>
        )}

        <div className="csi-modal-ftr">
          <button onClick={onClose} disabled={saving}>Cancel</button>
          <button onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

      </div>
    </div>
  );
}


/*────────────────────────────────────────────
 MAIN COMPONENT
────────────────────────────────────────────*/

interface Props {
  editId?: string;
  onBack: () => void;
  onSaveAndNew?: () => void;
  /** Pre-fill form from a converted quotation (passed via props) */
  fromQuotation?: any | null;
  /**
   * When converting from a quotation, pass the source quotation's id here.
   * The quotation's status will be set to "Closed" in localStorage only
   * after the invoice is successfully saved to the backend.
   */
  fromQuotationId?: string | null;
  /**
   * Pre-fill form from a converted delivery challan (passed via props).
   * If the component is rendered via React Router navigate() with
   * location.state, these values are read from the router state instead.
   */
  fromChallan?: any | null;
  /**
   * FIX: Source challan ID — used to mark the challan CLOSED only after
   * the invoice is successfully saved. May come from props OR router state.
   */
  fromChallanId?: number | null;
  /**
   * FIX: Source proforma invoice ID — used to mark the proforma CLOSED only
   * after the invoice is successfully saved. Comes from router state.
   */
  fromProformaId?: number | null;
}

export default function CreateSalesInvoice({
  editId,
  onBack,
  onSaveAndNew,
  fromQuotation,
  fromQuotationId,
  fromChallan:    fromChallanProp,
  fromChallanId:  fromChallanIdProp,
  fromProformaId: fromProformaIdProp,
}: Props) {

  // ── Read any convert-payload injected by navigate() state ────────────────
  // DeliveryChallanModel and the Proforma list both call:
  //   navigate("/cashier/sales-invoice", { state: { fromChallan, fromChallanId } })
  //   navigate("/cashier/sales-invoice", { state: { fromProforma, fromProformaId } })
  const location = useLocation();
  const routeState = (location.state ?? {}) as {
    fromChallan?:    any;
    fromChallanId?:  number;
    fromProforma?:   any;
    fromProformaId?: number;
  };

  // Merge props + router-state so both call styles work
  const fromChallan    = fromChallanProp    ?? routeState.fromChallan    ?? null;
  const fromChallanId  = fromChallanIdProp  ?? routeState.fromChallanId  ?? null;
  const fromProforma   =                       routeState.fromProforma   ?? null;
  const fromProformaId = fromProformaIdProp ?? routeState.fromProformaId ?? null;

  // ── Convert challan data → SalesInvoice shape ────────────────────────────
  function challanToInvoice(c: any): SalesInvoice {
    const blank = makeBlankInvoice("…");
    const billItems = (c.billItems || []).map((item: any) => ({
      rowId:        `row-${Date.now()}-${item.rowId || item.itemId}`,
      itemId:       item.itemId,
      name:         item.name,
      description:  item.description  || "",
      hsn:          item.hsn          || "",
      qty:          item.qty,
      unit:         item.unit         || "PCS",
      price:        item.price,
      discountPct:  item.discountPct  || 0,
      discountAmt:  item.discountAmt  || 0,
      taxLabel:     item.taxLabel     || "None",
      taxRate:      item.taxRate      || 0,
      amount:       item.amount,
    }));
    return {
      ...blank,
      party:             c.party             || null,
      billItems,
      additionalCharges: c.additionalCharges || [],
      discountType:      c.discountType      || blank.discountType,
      discountPct:       c.discountPct       || 0,
      discountAmt:       c.discountAmt       || 0,
      roundOff:          c.roundOff          || "none",
      roundOffAmt:       c.roundOffAmt       || 0,
      notes:             c.notes             || "",
      termsConditions:   c.termsConditions   || blank.termsConditions,
      challanNo:         c.challanNo         || "",
    };
  }

  // ── Convert proforma data → SalesInvoice shape ───────────────────────────
  function proformaToInvoice(p: any): SalesInvoice {
    const blank = makeBlankInvoice("…");
    const fd = p.fullData ?? p;
    const billItems = (fd.lineItems || fd.billItems || []).map((item: any) => ({
      rowId:        `row-${Date.now()}-${item.rowId || item.id || Math.random()}`,
      itemId:       item.productId ?? item.itemId ?? null,
      name:         item.item?.name || item.name || item.itemName || "",
      description:  item.description  || "",
      hsn:          item.hsnSac || item.hsn || item.item?.hsnCode || "",
      qty:          Number(item.qty || item.quantity || 1),
      unit:         item.unit || item.item?.unit || "PCS",
      price:        Number(item.pricePerItem || item.price || 0),
      discountPct:  Number(item.discountPct  || 0),
      discountAmt:  Number(item.discountAmt  || 0),
      taxLabel:     item.taxLabel || item.taxName || "None",
      taxRate:      Number(item.taxRate || 0),
      amount:       Number(item.amount || 0),
    }));
    return {
      ...blank,
      party:             fd.party || null,
      billItems,
      additionalCharges: fd.charges || fd.additionalCharges || [],
      discountType:      fd.discountType  || blank.discountType,
      discountPct:       fd.discountPct   || 0,
      discountAmt:       fd.discountAmt   || 0,
      roundOff:          fd.autoRound     ? "+Add" : "none",
      roundOffAmt:       fd.adjustAmt     || 0,
      notes:             fd.notes         || "",
      termsConditions:   fd.terms         || blank.termsConditions,
    };
  }

  // ── Convert quotation data → SalesInvoice shape ──────────────────────────
  function quotationToInvoice(q: any): SalesInvoice {
    const blank = makeBlankInvoice("…");
    const billItems = (q.billItems || []).map((item: any) => ({
      rowId:        `row-${Date.now()}-${item.rowId || item.itemId}`,
      itemId:       item.itemId,
      name:         item.name,
      description:  item.description  || "",
      hsn:          item.hsn          || "",
      qty:          item.qty,
      unit:         item.unit         || "PCS",
      price:        item.price,
      discountPct:  item.discountPct  || 0,
      discountAmt:  item.discountAmt  || 0,
      taxLabel:     item.taxLabel     || "None",
      taxRate:      item.taxRate      || 0,
      amount:       item.amount,
    }));
    return {
      ...blank,
      party:             q.party             || null,
      billItems,
      additionalCharges: q.additionalCharges || [],
      discountType:      q.discountType      || blank.discountType,
      discountPct:       q.discountPct       || 0,
      discountAmt:       q.discountAmt       || 0,
      roundOff:          q.roundOff          || "none",
      roundOffAmt:       q.roundOffAmt       || 0,
      notes:             q.notes             || "",
      termsConditions:   q.termsConditions   || blank.termsConditions,
    };
  }

  const [form, setForm] = useState<SalesInvoice>(() => {
    // Pre-load builder custom field defaults so they show immediately on new invoice
    const cfDefaults = loadBuilderCustomFieldDefaults();
    if (fromChallan)   return { ...challanToInvoice(fromChallan),   customFieldValues: cfDefaults };
    if (fromProforma)  return { ...proformaToInvoice(fromProforma),  customFieldValues: cfDefaults };
    if (fromQuotation) return { ...quotationToInvoice(fromQuotation), customFieldValues: cfDefaults };
    return { ...makeBlankInvoice("…"), customFieldValues: cfDefaults };
  });

  const [showAddItems, setShowAddItems] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [savingMain,    setSavingMain]    = useState(false);  // "Save" button
  const [savingNew,     setSavingNew]     = useState(false);  // "Save & New" button
  const [saveError,    setSaveError]    = useState<string | null>(null);

  // ── Invoice details settings (for snapshotMetaFields at save time) ─────────
  // Holds the current builder settings fetched from the DB. Used to freeze
  // field visibility into snapshotMetaFields when the invoice is saved.
  const [detSettings, setDetSettings] = useState<{
    showChallan: boolean;
    showDispatchedThrough: boolean;
    showEmailId: boolean;
    showFinancedBy: boolean;
    showSalesman: boolean;
    showTransportName: boolean;
    showWarranty: boolean;
    showPO: boolean;
    showEwayBill: boolean;
    showVehicle: boolean;
    customFields: { label: string; value: string }[];
  } | null>(null);

  useEffect(() => {
    getInvoiceDetailsSettings()
      .then(data => setDetSettings(data))
      .catch(() => {/* non-critical — snapshot will fall back to customFieldValues keys */});
  }, []);

  /*────────────────────────────
   ON MOUNT: load invoice number from backend settings.
   Applies to new invoices AND converted docs (quotation/challan/proforma)
   since we used "…" as a placeholder in all cases.
  ────────────────────────────*/
  useEffect(() => {
    if (editId) return; // editing existing — don't override
    getInvoiceSettings()
      .then(s => {
        setForm(prev => ({ ...prev, invoiceNo: buildInvoiceNo(s) }));
      })
      .catch(() => {
        setForm(prev => ({ ...prev, invoiceNo: "INV-00001" }));
      });
  }, []);

  /*────────────────────────────
   LOAD INVOICE FOR EDIT
  ────────────────────────────*/
  useEffect(() => {
    if (!editId) return;
    let active = true;

    async function loadInvoice() {
      try {
        const res = await getInvoiceById(editId!);
        if (active) setForm(mapBackendInvoice(res));
      } catch (err) {
        console.error("Failed to load invoice for edit:", err);
      }
    }

    loadInvoice();
    return () => { active = false; };
  }, [editId]);

  function set(field: string, value: any) {
    // Custom fields from InvoiceBuilder stored under customFieldValues map
    if (field.startsWith('customField_')) {
      const label = field.replace('customField_', '');
      setForm(prev => ({
        ...prev,
        customFieldValues: { ...(prev.customFieldValues ?? {}), [label]: value },
      }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  }

  /*────────────────────────────────────────────────────────────
   SAVE INVOICE TO BACKEND

   FIX: After a successful save, if this invoice was converted from
   a delivery challan or a proforma invoice, we NOW mark the source
   document as CLOSED. This way the status in those tables only
   changes once the invoice is actually saved — not the moment the
   user clicks "Convert to Invoice".
  ────────────────────────────────────────────────────────────*/
  async function handleSave(calledFromSaveAndNew = false): Promise<boolean> {
    if (!form.party) {
      setSaveError("Please select a party before saving.");
      return false;
    }
    if (form.billItems.length === 0) {
      setSaveError("Please add at least one item before saving.");
      return false;
    }

    if (calledFromSaveAndNew) setSavingNew(true);
    else setSavingMain(true);
    setSaveError(null);

    try {
      const payload = toCreatePayload(form as any);

      // ── Build snapshotMetaFields: freeze field visibility at save time ──────
      // This ensures the invoice view always shows the fields that were visible
      // when the invoice was created, even if builder settings change later.
      const customFieldLabels = Object.keys(form.customFieldValues ?? {});
      const snapshot = detSettings
        ? {
            showSalesman:          detSettings.showSalesman,
            showVehicle:           detSettings.showVehicle,
            showChallan:           detSettings.showChallan,
            showFinancedBy:        detSettings.showFinancedBy,
            showWarranty:          detSettings.showWarranty,
            showEwayBill:          detSettings.showEwayBill,
            showPO:                detSettings.showPO,
            showDispatchedThrough: detSettings.showDispatchedThrough,
            showTransportName:     detSettings.showTransportName,
            showEmailId:           detSettings.showEmailId,
            customFieldLabels,
          }
        : { customFieldLabels };   // fallback when settings fetch failed

      payload.snapshotMetaFields = snapshot;

      // Inject server-side-matching computed totals so the DB row
      // exactly matches what the user sees on screen.
      payload.subTotal               = subtotal;
      payload.taxAmount              = effectiveTax;
      payload.discountAmount         = discValue;
      payload.additionalChargesTotal = chargesTotal;
      payload.tcsAmount              = tcsValue;
      payload.tcsRate                = form.applyTCS ? form.tcsRate : 0;
      payload.roundOff               = roundOffAmt;
      payload.autoRoundOff           = form.roundOff !== "none";
      payload.totalAmount            = computedTotal;
      payload.receivedAmount         = Number(form.amountReceived) || 0;
      payload.outstandingAmount      = computedOutstanding;
      payload.signatureUrl           = (form as any).signatureUrl           ?? null;
      payload.showEmptySignatureBox  = (form as any).showEmptySignatureBox  ?? false;

      if (editId) {
        await updateInvoice(editId, {
          dueDate:              payload.dueDate,
          ewayBillNo:           payload.ewayBillNo,
          challanNo:            payload.challanNo,
          financedBy:           payload.financedBy,
          salesman:             payload.salesman,
          emailId:              payload.emailId,
          warrantyPeriod:       payload.warrantyPeriod,
          notes:                payload.notes,
          termsConditions:      payload.termsConditions,
          signatureUrl:         payload.signatureUrl,
          showEmptySignatureBox: payload.showEmptySignatureBox,
          poNumber:             payload.poNumber,
          vehicleNo:            payload.vehicleNo,
          dispatchedThrough:    payload.dispatchedThrough,
          transportName:        payload.transportName,
          customFieldValues:    payload.customFieldValues,
          snapshotMetaFields:   payload.snapshotMetaFields,
        } as any);
      } else {
        await createInvoice(payload);
      }

      // ── FIX: Close the source delivery challan AFTER successful save ──────
      // The challan status was NOT changed when the user clicked
      // "Convert to Invoice". We close it here instead.
      if (fromChallanId) {
        try {
          await updateChallanStatus(fromChallanId, "CLOSED");
        } catch (err) {
          // Non-critical: log but don't block navigation. The invoice was saved.
          console.warn("Could not close source challan:", err);
        }
      }

      // ── FIX: Mark the source proforma as CONVERTED AFTER successful save ────
      // Uses the dedicated PATCH /:id/status endpoint so the status changes
      // only once the invoice is confirmed — not when the user clicks Convert.
      if (fromProformaId) {
        try {
          await updateProformaStatus(fromProformaId, "CONVERTED");
        } catch (err) {
          console.warn("Could not mark source proforma as converted:", err);
        }
      }

      // ── Close the source quotation in localStorage now that the
      //    invoice has been successfully saved to the backend. ────────────
      if (fromQuotationId) {
        try {
          const quotations = JSON.parse(localStorage.getItem("quotations") || "[]");
          const updated = quotations.map((q: any) =>
            q.id === fromQuotationId ? { ...q, status: "Closed" } : q
          );
          localStorage.setItem("quotations", JSON.stringify(updated));
        } catch {
          // Non-critical — don't block navigation if localStorage fails
        }
      }

      onBack();
      return true;
    } catch (error: any) {
      setSaveError(error.message ?? "Failed to save invoice");
      return false;
    } finally {
      setSavingMain(false);
      setSavingNew(false);
    }
  }

  async function handleSaveAndNew() {
    const ok = await handleSave(true);  // true = called from Save & New
    if (!ok) return;

    // After saving, reload settings to get the next sequence number
    const settings = await getInvoiceSettings().catch(() => null);
    const nextNo   = settings ? buildInvoiceNo(settings) : "INV-00001";

    // Re-populate builder custom field defaults for the fresh invoice
    const cfDefaults = loadBuilderCustomFieldDefaults();
    setForm({ ...makeBlankInvoice(nextNo), customFieldValues: cfDefaults });
    setShowDiscount(false);
    if (onSaveAndNew) onSaveAndNew();
  }

  /*════════════════════════════════════════════════════════════════
   CALCULATIONS — mirrors SISummary exactly.
   Must be kept in sync with SISummary's engine.

   NEW MODEL — "Discount on GST-inclusive total, then reverse-calculate":
     Per line item (unchanged in SIItemsTable):
       lineGross  = qty × price         (price = pre-tax base, NEVER changes)
       lineDisc   = lineGross × discPct%  (or flat)
       taxable    = lineGross − lineDisc
       lineTax    = taxable × taxRate%
       lineTotal  = taxable + lineTax

     Invoice-level discount (Discount After Tax):
       preTotalAmount  = Σ lineTotal + chargesTotal   (GST-inclusive)
       invoiceDiscAmt  = preTotalAmount × discPct%    (or flat ₹)
       afterDiscTotal  = preTotalAmount − invoiceDiscAmt

     Reverse-calculation for stored taxable / tax:
       discountScaleFactor = afterDiscTotal / preTotalAmount
       storedTaxable = itemsTaxableSum × scaleFactor
       storedTax     = itemsTaxSum     × scaleFactor

     This is what we send to the backend so the DB matches the display.
     The base price in the table rows DOES NOT change.
  ════════════════════════════════════════════════════════════════*/

  // ── Per-line taxable and tax (before invoice-level discount) ───────────────
  const itemsTaxableSum = form.billItems.reduce((s, i) => {
    const lineGross = (Number(i.qty) || 0) * (Number(i.price) || 0);
    const discByPct = lineGross * ((Number(i.discountPct) || 0) / 100);
    const discFlat  = (Number(i.discountPct) || 0) > 0 ? 0 : (Number(i.discountAmt) || 0);
    return s + Math.max(0, lineGross - discByPct - discFlat);
  }, 0);

  const itemsTaxSum = form.billItems.reduce((s, i) => {
    const lineGross = (Number(i.qty) || 0) * (Number(i.price) || 0);
    const discByPct = lineGross * ((Number(i.discountPct) || 0) / 100);
    const discFlat  = (Number(i.discountPct) || 0) > 0 ? 0 : (Number(i.discountAmt) || 0);
    const taxable   = Math.max(0, lineGross - discByPct - discFlat);
    return s + Math.round(taxable * ((Number(i.taxRate) || 0) / 100) * 100) / 100;
  }, 0);

  // ── Additional charges ──────────────────────────────────────────────────────
  function chargeRate(taxLabel: string): number {
    const m = (taxLabel ?? "").match(/(\d+)%/);
    return m ? Number(m[1]) : 0;
  }
  const chargesBase  = form.additionalCharges.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const chargesTax   = form.additionalCharges.reduce((s, c) => {
    const rate = chargeRate(c.taxLabel);
    return s + (Number(c.amount) || 0) * rate / 100;
  }, 0);
  const chargesTotal = chargesBase + chargesTax;

  // ── GST-inclusive pre-discount total ──────────────────────────────────────
  const preTotalAmount = Math.round((itemsTaxableSum + itemsTaxSum + chargesTotal) * 100) / 100;

  // ── Invoice-level discount on GST-inclusive total ─────────────────────────
  const invoiceDiscAmt = showDiscount
    ? (form.discountPct > 0
        ? Math.round(preTotalAmount * (form.discountPct / 100) * 100) / 100
        : (Number(form.discountAmt) || 0))
    : 0;

  const afterInvoiceDisc = Math.max(0, Math.round((preTotalAmount - invoiceDiscAmt) * 100) / 100);

  // ── REVERSE-CALCULATE: get adjusted taxable and tax to store in DB ─────────
  // Mirrors SISummary exactly. When no discount, values are unchanged.
  const { adjustedTaxable, adjustedTax } = reverseCalcAfterDiscount(
    preTotalAmount,
    afterInvoiceDisc,
    itemsTaxableSum,
    itemsTaxSum,
  );

  // ── TCS (applied on adjusted taxable or total) ─────────────────────────────
  const tcsBaseAmt = form.tcsBase === "Total Amount" ? afterInvoiceDisc : adjustedTaxable;
  const tcsValue   = form.applyTCS
    ? Math.round(tcsBaseAmt * (form.tcsRate / 100) * 100) / 100
    : 0;

  // ── Round off ────────────────────────────────────────────────────────────────
  const preRound    = Math.round((afterInvoiceDisc + tcsValue) * 100) / 100;
  const roundOffAmt = form.roundOff === "none"
    ? (Number(form.roundOffAmt) || 0)
    : form.roundOff === "+Add"
    ? Math.round((Math.ceil(preRound)  - preRound) * 100) / 100
    : Math.round((Math.floor(preRound) - preRound) * 100) / 100;

  const computedTotal       = Math.round((preRound + roundOffAmt) * 100) / 100;
  const computedOutstanding = Math.max(
    0,
    Math.round((computedTotal - (Number(form.amountReceived) || 0)) * 100) / 100
  );

  // ── Payload aliases — use ADJUSTED values so DB stores correct taxable/tax ─
  const subtotal     = adjustedTaxable;   // reverse-calculated taxable after discount
  const totalTax     = adjustedTax;       // reverse-calculated tax after discount
  const discValue    = invoiceDiscAmt;    // invoice-level discount ₹
  const effectiveTax = adjustedTax;
  const afterTax     = afterInvoiceDisc;

  /*────────────────────────────
   BANNER: shown when this invoice was pre-filled from a challan/proforma
  ────────────────────────────*/
  const showConvertBanner = !editId && (fromChallanId || fromProformaId);

  /*────────────────────────────
   UI
  ────────────────────────────*/
  return (
    <div className="csi-page">

      <div className="csi-topbar">
        <button className="csi-back-btn" onClick={onBack}>
          ← {editId ? "Edit Sales Invoice" : "Create Sales Invoice"}
        </button>

        <div className="csi-topbar-right">
          {saveError && (
            <span style={{ color: "#dc2626", fontSize: 13, marginRight: 12 }}>
              ⚠ {saveError}
            </span>
          )}

          <button
            className="csi-settings-btn"
            onClick={() => setShowSettings(true)}
          >
            Settings
          </button>

          <button
            className="csi-save-new-btn"
            onClick={handleSaveAndNew}
            disabled={savingNew || savingMain}
          >
            {savingNew ? "Saving…" : "Save & New"}
          </button>

          <button
            className="csi-save-btn"
            onClick={() => handleSave(false)}
            disabled={savingMain || savingNew}
          >
            {savingMain ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* ── FIX: Info banner when invoice is pre-filled from a source document ── */}
      {showConvertBanner && (
        <div style={{
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: 8,
          padding: "10px 16px",
          margin: "0 0 12px",
          fontSize: 13,
          color: "#1e40af",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <span>ℹ</span>
          <span>
            {fromChallanId
              ? "Pre-filled from Delivery Challan."
              : "Pre-filled from Proforma Invoice."}
            {" "}The source document will be marked as{" "}
            <strong>Closed / Converted</strong> only after you save this invoice.
          </span>
        </div>
      )}

      <div className="csi-body">

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
              poNumber={form.poNumber ?? ""}
              vehicleNo={form.vehicleNo ?? ""}
              dispatchedThrough={form.dispatchedThrough ?? ""}
              transportName={form.transportName ?? ""}
              customFieldValues={form.customFieldValues ?? {}}
              showColumns={form.showColumns}
              onChange={(field, value) => set(field, value)}
              onShowColumnsChange={cols => set("showColumns", cols)}
            />
          </div>

        </div>


        <SIItemsTable
          items={form.billItems}
          showColumns={form.showColumns}
          onChange={items => set("billItems", items)}
          onAddItem={() => setShowAddItems(true)}
        />


        <div className="csi-bottom-panel">

          <div className="csi-footer-col">
            <SIFooter
              partyId={form.party?.id ?? null}
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
              billItems={form.billItems}
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
                if (!show) {
                  set("discountPct", 0);
                  set("discountAmt", 0);
                }
              }}

              onTCSChange={(apply, rate, label, base) => {
                set("applyTCS",  apply);
                set("tcsRate",   rate);
                set("tcsLabel",  label);
                set("tcsBase",   base);
              }}

              onRoundOffChange={(mode, amt) => {
                set("roundOff",    mode);
                set("roundOffAmt", amt);
              }}

              onAmountReceivedChange={v => set("amountReceived", v)}
              onPaymentMethodChange={v => set("paymentMethod",   v)}

              signatureUrl={(form as any).signatureUrl ?? ""}
              showEmptySignatureBox={(form as any).showEmptySignatureBox ?? false}
              onSignatureChange={(url, showEmpty) => {
                set("signatureUrl", url);
                set("showEmptySignatureBox", showEmpty);
              }}

              paymentDetails={(form as any).paymentDetails}
              financeDetails={(form as any).financeDetails}
              onPaymentDetailsChange={d => set("paymentDetails", d)}
              onFinanceDetailsChange={d => set("financeDetails", d)}
            />
          </div>

        </div>

      </div>


      {showAddItems && (
        <SIAddItemsModal
          onClose={() => setShowAddItems(false)}
          onAddToBill={items => set("billItems", [...form.billItems, ...items])}
        />
      )}

      {showSettings && (
        <QuickSettingsModal
          onClose={() => setShowSettings(false)}
          onSaved={(newInvoiceNo) => {
            // Update the displayed invoice number to match what backend will assign
            if (!editId) set("invoiceNo", newInvoiceNo);
          }}
        />
      )}

    </div>
  );
}