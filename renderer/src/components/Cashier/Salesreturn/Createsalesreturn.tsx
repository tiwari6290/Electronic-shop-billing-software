import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  SalesReturn, InvoiceItem, AdditionalCharge, LinkedInvoice,
  newBlankReturn, calcTotal, todayStr,
} from "./Salesreturntypes";
import {
  createSalesReturn as apiCreateSalesReturn,
  getSalesReturnById,
  CreateSalesReturnPayload,
} from "../../../api/salesreturnapi";
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
  const [searchParams] = useSearchParams();
  const isDuplicateMode = searchParams.get("mode") === "duplicate";

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState<SalesReturn>(() => {
    // Try loading a duplicate draft from localStorage
    if (!editId) {
      try {
        const draft = localStorage.getItem("sr-duplicate-draft");
        if (draft) {
          const parsed = JSON.parse(draft);
          localStorage.removeItem("sr-duplicate-draft");
          return parsed;
        }
      } catch {}
    }
    return newBlankReturn();
  });

  const [showAddItems, setShowAddItems] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [saving, setSaving]             = useState(false);
  const [saveError, setSaveError]       = useState<string | null>(null);
  const [loadingEdit, setLoadingEdit]   = useState(false);

  // ── Load existing return for editing (from backend) ────────────────────────
  useEffect(() => {
    if (!editId) return;
    setLoadingEdit(true);
    getSalesReturnById(Number(editId))
      .then(record => {
        // Map backend record → frontend SalesReturn form shape
        const mapped: SalesReturn = {
          ...newBlankReturn(),
          id:              String(record.id),
          salesReturnNo:   record.id,
          salesReturnDate: record.createdAt.split("T")[0],
          party: record.party
            ? { id: record.party.id, name: record.party.partyName, category: "", mobile: "", type: "Customer", balance: 0 }
            : null,
          linkedInvoiceId: String(record.invoiceId),
          notes:           record.notes ?? "",
          billItems: record.items.map(i => ({
            rowId:       `row-${i.id}`,
            itemId:      String(i.productId),
            name:        i.product?.name ?? "—",
            description: "",
            hsn:         "",
            qty:         Number(i.quantity),
            unit:        i.product?.unit ?? "PCS",
            price:       Number(i.price),
            discountPct: 0,
            discountAmt: 0,
            taxLabel:    "None",
            taxRate:     0,
            amount:      Number(i.quantity) * Number(i.price),
          })),
        };
        setForm(mapped);
      })
      .catch(() => {
        setSaveError("Failed to load sales return for editing.");
      })
      .finally(() => setLoadingEdit(false));
  }, [editId]);

  // ── Generic field setter ───────────────────────────────────────────────────
  function set(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  // ── When an invoice is linked: auto-populate items ─────────────────────────
  const handleInvoiceLink = (inv: LinkedInvoice | null) => {
    if (!inv) {
      setForm(prev => ({
        ...prev,
        linkedInvoiceId:   null,
        billItems:         [],
        additionalCharges: [],
        discountPct:       0,
        discountAmt:       0,
        notes:             prev.notes,
        termsConditions:   prev.termsConditions,
        eWayBillNo:        "",
        challanNo:         "",
        financedBy:        "",
        salesman:          "",
        emailId:           "",
        warrantyPeriod:    "",
      }));
      setShowDiscount(false);
      return;
    }

    const billItems: InvoiceItem[] = (inv.billItems || []).map(i => ({
      rowId:       `row-${Date.now()}-${i.rowId || i.itemId || Math.random()}`,
      itemId:      i.itemId,
      name:        i.name,
      description: i.description || "",
      hsn:         i.hsn || "",
      qty:         i.qty,
      unit:        i.unit || "PCS",
      price:       i.price,
      discountPct: i.discountPct || 0,
      discountAmt: i.discountAmt || 0,
      taxLabel:    i.taxLabel || "None",
      taxRate:     i.taxRate || 0,
      amount:      i.amount || i.qty * i.price,
    }));

    const discPct = inv.discountPct || 0;
    const discAmt = inv.discountAmt || 0;

    setForm(prev => ({
      ...prev,
      billItems,
      additionalCharges: (inv.additionalCharges || []).map(c => ({
        id:       `charge-${Date.now()}-${Math.random()}`,
        label:    (c as any).label || "",
        amount:   c.amount,
        taxLabel: (c as any).taxLabel || "No Tax Applicable",
        taxRate:  (c as any).taxRate || 0,
      })),
      discountPct:     discPct,
      discountAmt:     discAmt,
      notes:           inv.notes || prev.notes,
      termsConditions: inv.termsConditions || prev.termsConditions,
    }));

    if (discPct > 0 || discAmt > 0) setShowDiscount(true);
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async (): Promise<boolean> => {
    setSaveError(null);

    if (!form.party) {
      setSaveError("Please select a party.");
      return false;
    }
    if (!form.linkedInvoiceId) {
      setSaveError("Please link to an invoice.");
      return false;
    }
    if (form.billItems.length === 0) {
      setSaveError("Please add at least one item.");
      return false;
    }

    // Check all items have a valid productId (items must come from linked invoice or add-items modal)
    const missingProductId = form.billItems.some(i => !i.itemId);
    if (missingProductId) {
      setSaveError("One or more items are missing a product ID. Please re-add them from the invoice.");
      return false;
    }

    setSaving(true);
    try {
      const payload: CreateSalesReturnPayload = {
        invoiceId: Number(form.linkedInvoiceId),
        partyId:   form.party.id,
        reason:    form.notes || undefined,
        notes:     form.notes || undefined,
        items:     form.billItems.map(i => ({
          productId: Number(i.itemId),
          quantity:  i.qty,
          price:     i.price,
        })),
      };

      await apiCreateSalesReturn(payload);
      return true;
    } catch (err: any) {
      setSaveError(err.message || "Failed to save sales return. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClick = async () => {
    const ok = await handleSave();
    if (ok) onBack();
  };

  const handleSaveAndNew = async () => {
    const ok = await handleSave();
    if (ok) {
      setForm(newBlankReturn());
      setShowDiscount(false);
      setSaveError(null);
    }
  };

  if (loadingEdit) {
    return (
      <div className="csr-page">
        <div className="csr-topbar">
          <button className="csr-back-btn" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Create Sales Return
          </button>
        </div>
        <div style={{ padding: "60px", textAlign: "center", color: "#6b7280" }}>Loading…</div>
      </div>
    );
  }

  return (
    <div className="csr-page">
      {/* Top bar */}
      <div className="csr-topbar">
        <button className="csr-back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          {editId ? "Edit Sales Return" : "Create Sales Return"}
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
          <button className="csr-save-new-btn" onClick={handleSaveAndNew} disabled={saving}>
            {saving ? "Saving…" : "Save & New"}
          </button>
          <button className="csr-save-btn" onClick={handleSaveClick} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {saveError && (
        <div className="csr-error-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {saveError}
          <button className="csr-error-close" onClick={() => setSaveError(null)}>×</button>
        </div>
      )}

      {/* Body */}
      <div className="csr-body">
        {/* Party (left) + Meta (right) */}
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

        {/* Footer + Summary */}
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
                set("discountPct", pct); set("discountAmt", amt); set("discountType", type);
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