import { useState, useEffect } from "react";

import {
  SalesInvoice,
  makeBlankInvoice,
} from "./SalesInvoiceTypes";

import {
  createInvoice,
  updateInvoice,
  getInvoiceById,
  toCreatePayload,
  getInvoiceSettings,
  saveInvoiceSettings,
  buildInvoiceNo,
  type InvoiceSettings,
} from "../../../api/salesInvoiceApi";

import { mapBackendInvoice } from "../../../utils/invoiceMapper";

import SIPartySelector from "./SIPartySelector";
import SIMetaFields    from "./SIMetaFields";
import SIItemsTable    from "./SIItemsTable";
import SIAddItemsModal from "./SIAddItemsModal";
import SISummary       from "./SISummary";
import SIFooter        from "./SIFooter";
import "./CreateSalesInvoice.css";


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
        prefix:            prefix.trim(),
        sequenceNumber:    seqNo,
        showPurchasePrice,
        showItemImage,
        enablePriceHistory: priceHistory,
        invoiceTheme:      theme,
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
  /** Pre-fill form from a converted quotation */
  fromQuotation?: any | null;
  /**
   * When converting from a quotation, pass the source quotation's id here.
   * The quotation's status will be set to "Closed" in localStorage only
   * after the invoice is successfully saved to the backend.
   */
  fromQuotationId?: string | null;
  /** Pre-fill form from a converted delivery challan */
  fromChallan?: any | null;
}

export default function CreateSalesInvoice({
  editId,
  onBack,
  onSaveAndNew,
  fromQuotation,
  fromQuotationId,
  fromChallan,
}: Props) {

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
    if (fromChallan)   return challanToInvoice(fromChallan);
    if (fromQuotation) return quotationToInvoice(fromQuotation);
    return makeBlankInvoice("…");   // placeholder — real number loaded below
  });

  const [showAddItems, setShowAddItems] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [saveError,    setSaveError]    = useState<string | null>(null);

  /*────────────────────────────
   ON MOUNT: load invoice number from backend settings.
   Applies to new invoices AND converted docs (quotation/challan)
   since we used "…" as a placeholder in both cases.
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
    setForm(prev => ({ ...prev, [field]: value }));
  }

  /*────────────────────────────
   SAVE INVOICE TO BACKEND
  ────────────────────────────*/
  async function handleSave(): Promise<boolean> {
    if (!form.party) {
      setSaveError("Please select a party before saving.");
      return false;
    }
    if (form.billItems.length === 0) {
      setSaveError("Please add at least one item before saving.");
      return false;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const payload = toCreatePayload(form as any);

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

      if (editId) {
        await updateInvoice(editId, {
          dueDate:         payload.dueDate,
          ewayBillNo:      payload.ewayBillNo,
          challanNo:       payload.challanNo,
          financedBy:      payload.financedBy,
          salesman:        payload.salesman,
          emailId:         payload.emailId,
          warrantyPeriod:  payload.warrantyPeriod,
          notes:           payload.notes,
          termsConditions: payload.termsConditions,
        } as any);
      } else {
        await createInvoice(payload);
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
      setSaving(false);
    }
  }

  async function handleSaveAndNew() {
    const ok = await handleSave();
    if (!ok) return;

    // After saving, reload settings to get the next sequence number
    const settings = await getInvoiceSettings().catch(() => null);
    const nextNo   = settings ? buildInvoiceNo(settings) : "INV-00001";

    setForm(makeBlankInvoice(nextNo));
    setShowDiscount(false);
    if (onSaveAndNew) onSaveAndNew();
  }

  /*────────────────────────────
   CALCULATIONS
   All values mirror SISummary exactly so the payload sent to the
   backend matches what the user sees on screen.
  ────────────────────────────*/
  const subtotal = form.billItems.reduce((s, i) => {
    const lineTotal = (Number(i.qty) || 0) * (Number(i.price) || 0);
    const lineDisc  = lineTotal * ((Number(i.discountPct) || 0) / 100)
                    + (Number(i.discountAmt) || 0);
    return s + Math.max(0, lineTotal - lineDisc);
  }, 0);

  const totalTax = form.billItems.reduce((s, i) => {
    const lineTotal = (Number(i.qty) || 0) * (Number(i.price) || 0);
    const lineDisc  = lineTotal * ((Number(i.discountPct) || 0) / 100)
                    + (Number(i.discountAmt) || 0);
    const taxBase   = Math.max(0, lineTotal - lineDisc);
    return s + taxBase * ((Number(i.taxRate) || 0) / 100);
  }, 0);

  const chargesTotal   = form.additionalCharges.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const taxableBase    = subtotal + chargesTotal;
  const discValue      = form.discountPct > 0
    ? taxableBase * (form.discountPct / 100)
    : (Number(form.discountAmt) || 0);
  const afterDisc      = Math.max(0, taxableBase - discValue);
  const taxScaleFactor = taxableBase > 0 ? afterDisc / taxableBase : 1;
  const effectiveTax   = Math.round(totalTax * taxScaleFactor * 100) / 100;
  const afterTax       = afterDisc + effectiveTax;
  const tcsBaseAmt     = form.tcsBase === "Total Amount" ? afterTax : afterDisc;
  const tcsValue       = form.applyTCS
    ? Math.round(tcsBaseAmt * (form.tcsRate / 100) * 100) / 100
    : 0;
  const preRound       = Math.round((afterTax + tcsValue) * 100) / 100;
  const roundOffAmt    = form.roundOff === "+Add"
    ? Math.round((Math.ceil(preRound)  - preRound) * 100) / 100
    : form.roundOff === "-Reduce"
    ? Math.round((Math.floor(preRound) - preRound) * 100) / 100
    : (Number(form.roundOffAmt) || 0);
  const computedTotal       = Math.round((preRound + roundOffAmt) * 100) / 100;
  const computedOutstanding = Math.max(
    0,
    Math.round((computedTotal - (Number(form.amountReceived) || 0)) * 100) / 100
  );

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
            disabled={saving}
          >
            {saving ? "Saving…" : "Save & New"}
          </button>

          <button
            className="csi-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>


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