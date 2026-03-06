import React, { useState, useRef, useEffect } from "react";
import {
  Party, ShippingAddress, ItemProduct, InvoiceLineItem,
  AdditionalCharge, BankAccount, QuickSettings, FullInvoiceData,
  SAMPLE_ITEMS, SAMPLE_BANK_ACCOUNTS
} from "./Types";
import AddPartyModal from "./Addpartymodal";
import AddItemsModal from "./Additemsmodal";
import ColumnVisibilityModal from "./Columnvisibilitymodal";
import { AddBankAccountModal, SelectBankAccountModal } from "./Bankmodals";
import { ChangeShippingModal, AddShippingAddressModal } from "./Shippingmodals";
import "./Createproformainvoice.css";

// ── Inline SVG Icons ──────────────────────────────────────────────────────────
const IconArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const IconKeyboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2"/>
    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const IconInfo = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IconBarcode = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5v14M7 5v14M11 5v14M15 5v14M19 5v14M21 5v3M21 16v3M3 5H6M3 16v3"/>
  </svg>
);
const IconColumns = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
  </svg>
);
const IconWhatsApp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
const IconGoogle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866.549 3.921 1.453l2.814-2.814C17.503 2.988 15.139 2 12.545 2 7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748L12.545 10.239z"/>
  </svg>
);
const IconXCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);
const IconMinusCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split("T")[0];
const fmtDate = (d: string) => {
  const dt = new Date(d);
  return dt.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
};
const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};
const formatINR = (n: number) => `₹ ${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

interface ColumnConfig { showPricePerItem: boolean; showQuantity: boolean; }

interface Props {
  nextNumber: number;
  settings: QuickSettings;
  editData?: FullInvoiceData | null;   // provided → Edit/Duplicate mode
  isEdit?: boolean;                    // true = update same row, false = new row (duplicate)
  onSave: (invoiceData: any) => void;
  onSaveNew: (invoiceData: any) => void;
  onBack: () => void;
}

const CreateProformaInvoice: React.FC<Props> = ({ nextNumber, settings, editData, isEdit, onSave, onSaveNew, onBack }) => {
  const ed = editData ?? null;

  // ── Invoice meta ──────────────────────────────────────────────────────────
  const [invoiceDate, setInvoiceDate] = useState(ed?.invoiceDate ?? todayStr());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState<number | "">(ed?.paymentTerms ?? 30);
  const [showPaymentTerms, setShowPaymentTerms] = useState(ed?.showPaymentTerms ?? false);
  const [expiryDate, setExpiryDate] = useState(ed?.expiryDate ?? addDays(todayStr(), 30));

  // ── Party ─────────────────────────────────────────────────────────────────
  const [party, setParty] = useState<Party | null>(ed?.party ?? null);
  const [showAddParty, setShowAddParty] = useState(false);

  // ── Shipping ──────────────────────────────────────────────────────────────
  const initShipping: ShippingAddress[] = ed?.party?.billingAddress
    ? [{ id: 1, name: ed.party.name, street: ed.party.billingAddress, city: "", state: "", pincode: "" }]
    : [];
  const [shippingAddresses, setShippingAddresses] = useState<ShippingAddress[]>(initShipping);
  const [selectedShippingId, setSelectedShippingId] = useState<number | null>(initShipping.length > 0 ? 1 : null);
  const [showChangeShipping, setShowChangeShipping] = useState(false);
  const [showAddShipping, setShowAddShipping] = useState(false);
  const [editingShipping, setEditingShipping] = useState<ShippingAddress | null>(null);

  // ── Fields ────────────────────────────────────────────────────────────────
  const [eWayBill, setEWayBill]           = useState(ed?.eWayBill ?? "");
  const [challanNo, setChallanNo]         = useState(ed?.challanNo ?? "");
  const [financedBy, setFinancedBy]       = useState(ed?.financedBy ?? "");
  const [salesman, setSalesman]           = useState(ed?.salesman ?? "");
  const [emailId, setEmailId]             = useState(ed?.emailId ?? "");
  const [warrantyPeriod, setWarrantyPeriod] = useState(ed?.warrantyPeriod ?? "");

  // ── Items ─────────────────────────────────────────────────────────────────
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(ed?.lineItems ?? []);
  const [showAddItems, setShowAddItems] = useState(false);
  const [colConfig, setColConfig] = useState<ColumnConfig>({ showPricePerItem: true, showQuantity: true });
  const [showColModal, setShowColModal] = useState(false);

  // ── Notes / Terms ─────────────────────────────────────────────────────────
  const [showNotes, setShowNotes] = useState(ed?.showNotes ?? false);
  const [notes, setNotes]         = useState(ed?.notes ?? "");
  const [showTerms, setShowTerms] = useState(ed?.showTerms ?? false);
  const [terms, setTerms]         = useState(ed?.terms ?? "");

  // ── Additional Charges ────────────────────────────────────────────────────
  const [showCharges, setShowCharges] = useState(ed?.showCharges ?? false);
  const [charges, setCharges] = useState<AdditionalCharge[]>(
    ed?.charges ?? [{ id: 1, label: "", amount: 0, taxType: "No Tax Applicable" }]
  );

  // ── Discount ──────────────────────────────────────────────────────────────
  const [showDiscount, setShowDiscount]       = useState(ed?.showDiscount ?? false);
  const [discountType, setDiscountType]       = useState<"Discount After Tax" | "Discount Before Tax">(ed?.discountType ?? "Discount After Tax");
  const [showDiscountTypeDropdown, setShowDiscountTypeDropdown] = useState(false);
  const [discountPct, setDiscountPct]         = useState(ed?.discountPct ?? 0);
  const [discountAmt, setDiscountAmt]         = useState(ed?.discountAmt ?? 0);

  // ── Adjustment ───────────────────────────────────────────────────────────
  const [adjustType, setAdjustType]           = useState<"+ Add" | "- Reduce">(ed?.adjustType ?? "+ Add");
  const [showAdjustDropdown, setShowAdjustDropdown] = useState(false);
  const [adjustAmt, setAdjustAmt]             = useState(ed?.adjustAmt ?? 0);
  const [autoRound, setAutoRound]             = useState(ed?.autoRound ?? false);

  // ── Bank Account ─────────────────────────────────────────────────────────
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(SAMPLE_BANK_ACCOUNTS);
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [showAddBank, setShowAddBank] = useState(false);
  const [showSelectBank, setShowSelectBank] = useState(false);

  // ── Settings ──────────────────────────────────────────────────────────────
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [localSettings, setLocalSettings] = useState<QuickSettings>({ ...settings });
  const [tempSettings, setTempSettings] = useState<QuickSettings>({ ...settings });

  // ── Calculations ──────────────────────────────────────────────────────────
  const subtotalQty = lineItems.reduce((s, li) => s + li.qty, 0);
  const subtotalDisc = lineItems.reduce((s, li) => s + li.discountAmt, 0);
  const subtotalAmt = lineItems.reduce((s, li) => s + li.amount, 0);
  const taxableAmount = subtotalAmt;
  const chargesTotal = charges.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const discountValue = discountPct > 0 ? (taxableAmount * discountPct / 100) : discountAmt;
  const adjustValue = adjustType === "+ Add" ? adjustAmt : -adjustAmt;
  const totalAmount = taxableAmount + chargesTotal - discountValue + adjustValue;

  // ── Party select ──────────────────────────────────────────────────────────
  const handleSelectParty = (p: Party) => {
    setParty(p);
    setShowAddParty(false);
    // Set shipping from party billing address if available
    if (p.billingAddress) {
      const addr: ShippingAddress = {
        id: 1, name: p.name, street: p.billingAddress,
        city: "", state: "", pincode: ""
      };
      setShippingAddresses([addr]);
      setSelectedShippingId(1);
    }
  };

  // ── Payment terms ─────────────────────────────────────────────────────────
  const handlePaymentTermsChange = (val: string) => {
    const n = parseInt(val);
    if (!isNaN(n) && n >= 0) {
      setPaymentTerms(n);
      setExpiryDate(addDays(invoiceDate, n));
    } else if (val === "") {
      setPaymentTerms("");
    }
  };

  // ── Line Items ────────────────────────────────────────────────────────────
  const handleAddItems = (selected: { item: ItemProduct; qty: number }[]) => {
    const newItems: InvoiceLineItem[] = selected.map(({ item, qty }) => {
      const amount = item.salesPrice * qty;
      return {
        id: Date.now() + item.id,
        item,
        description: "",
        qty,
        unit: item.unit || "PCS",
        pricePerItem: item.salesPrice,
        discountPct: 0,
        discountAmt: 0,
        taxRate: item.taxRate,
        amount,
      };
    });
    setLineItems(prev => [...prev, ...newItems]);
    setShowAddItems(false);
  };

  const updateLineItem = (id: number, field: string, value: any) => {
    setLineItems(prev => prev.map(li => {
      if (li.id !== id) return li;
      const updated = { ...li, [field]: value };
      // Recalculate amount
      const base = updated.pricePerItem * updated.qty;
      const discAmt = updated.discountPct > 0 ? (base * updated.discountPct / 100) : updated.discountAmt;
      updated.discountAmt = discAmt;
      updated.amount = base - discAmt;
      return updated;
    }));
  };

  const removeLineItem = (id: number) => {
    setLineItems(prev => prev.filter(li => li.id !== id));
  };

  // ── Additional Charges ────────────────────────────────────────────────────
  const addCharge = () => {
    setCharges(prev => [...prev, { id: Date.now(), label: "", amount: 0, taxType: "No Tax Applicable" }]);
  };
  const removeCharge = (id: number) => setCharges(prev => prev.filter(c => c.id !== id));

  // ── Shipping ──────────────────────────────────────────────────────────────
  const handleSaveShipping = (addr: Omit<ShippingAddress, "id">) => {
    if (editingShipping) {
      setShippingAddresses(prev => prev.map(a => a.id === editingShipping.id ? { ...addr, id: a.id } : a));
    } else {
      const newAddr = { ...addr, id: Date.now() };
      setShippingAddresses(prev => [...prev, newAddr]);
      setSelectedShippingId(newAddr.id);
    }
    setShowAddShipping(false);
    setEditingShipping(null);
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const buildInvoice = () => {
    const fullData: FullInvoiceData = {
      party,
      invoiceDate,
      paymentTerms,
      expiryDate,
      showPaymentTerms,
      eWayBill, challanNo, financedBy, salesman, emailId, warrantyPeriod,
      lineItems,
      notes, terms, showNotes, showTerms,
      charges, showCharges,
      discountType, discountPct, discountAmt, showDiscount,
      adjustType, adjustAmt, autoRound,
      totalAmount,
    };
    return {
      proformaNumber: nextNumber,
      date: invoiceDate,
      party,
      lineItems,
      totalAmount,
      notes,
      terms,
      status: "Open" as const,
      fullData,
    };
  };

  const selectedShipping = shippingAddresses.find(a => a.id === selectedShippingId);

  const proformaDisplay = localSettings.prefixEnabled
    ? `${localSettings.prefix}${nextNumber}`
    : String(nextNumber);

  return (
    <div className="cpi-root">
      {/* ── Top Bar ── */}
      <div className="cpi-topbar">
        <div className="cpi-topbar-left">
          <button className="cpi-back-btn" onClick={onBack}>
            <IconArrowLeft />
          </button>
          <h1 className="cpi-page-title">
            {isEdit ? "Update Proforma Invoice" : "Create Proforma Invoice"}
          </h1>
        </div>
        <div className="cpi-topbar-right">
          <button className="cpi-keyboard-btn" title="Keyboard shortcuts">
            <IconKeyboard />
          </button>
          <button className="cpi-settings-btn" onClick={() => { setTempSettings({ ...localSettings }); setShowSettingsModal(true); }}>
            <IconSettings />
            <span>Settings</span>
            <span className="cpi-settings-dot" />
          </button>
          {!isEdit && (
            <button className="cpi-save-new-btn" onClick={() => onSaveNew(buildInvoice())}>
              Save &amp; New
            </button>
          )}
          <button className={isEdit ? "cpi-update-btn" : "cpi-save-btn"} onClick={() => onSave(buildInvoice())}>
            {isEdit ? "Update Proforma Invoice" : "Save"}
          </button>
        </div>
      </div>

      <div className="cpi-body">
        {/* ── Left: Bill To / Ship To ── */}
        <div className="cpi-left">
          {/* Bill To */}
          <div className="cpi-section-label">Bill To</div>
          {party ? (
            <div className="cpi-party-sections">
              <div className="cpi-party-card">
                <div className="cpi-party-card-header">
                  <span className="cpi-party-section-title">Bill To</span>
                  <button className="cpi-change-btn" onClick={() => setShowAddParty(true)}>Change Party</button>
                </div>
                <div className="cpi-party-name">{party.name}</div>
                {party.mobile && party.mobile !== "-" && (
                  <div className="cpi-party-detail">Phone Number: {party.mobile}</div>
                )}
                {party.billingAddress && (
                  <div className="cpi-party-detail">{party.billingAddress}</div>
                )}
              </div>
              <div className="cpi-party-card">
                <div className="cpi-party-card-header">
                  <span className="cpi-party-section-title">Ship To</span>
                  <button className="cpi-change-btn" onClick={() => setShowChangeShipping(true)}>Change Shipping Address</button>
                </div>
                {selectedShipping ? (
                  <>
                    <div className="cpi-party-name">{selectedShipping.name}</div>
                    <div className="cpi-party-detail">
                      Address: {selectedShipping.street}
                      {selectedShipping.city ? `, ${selectedShipping.city}` : ""}
                      {selectedShipping.state ? `, ${selectedShipping.state}` : ""}
                      {selectedShipping.pincode ? ` ${selectedShipping.pincode}` : ""}
                    </div>
                    {party.mobile && party.mobile !== "-" && (
                      <div className="cpi-party-detail">Phone Number: {party.mobile}</div>
                    )}
                  </>
                ) : (
                  <button className="cpi-add-shipping-btn" onClick={() => setShowAddShipping(true)}>
                    + Add Shipping Address
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="cpi-add-party-box" onClick={() => setShowAddParty(true)}>
              <span className="cpi-add-party-text">+ Add Party</span>
            </div>
          )}
        </div>

        {/* ── Right: Invoice Meta ── */}
        <div className="cpi-right">
          <div className="cpi-meta-grid">
            <div className="cpi-meta-field">
              <label>Proforma Invoice No:</label>
              <input className="cpi-meta-input cpi-num-input" value={proformaDisplay} readOnly />
            </div>
            <div className="cpi-meta-field">
              <label>Proforma Invoice Date:</label>
              <div className="cpi-date-btn">
                {/* <IconCalendar /> */}
                <input
                  type="date"
                  className="cpi-date-input"
                  value={invoiceDate}
                  onChange={e => {
                    setInvoiceDate(e.target.value);
                    if (paymentTerms !== "") setExpiryDate(addDays(e.target.value, Number(paymentTerms)));
                  }}
                />
                {/* <IconChevronDown /> */}
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          {!showPaymentTerms ? (
            <div className="cpi-due-box" onClick={() => setShowPaymentTerms(true)}>
              + Add Due Date
            </div>
          ) : (
            <div className="cpi-payment-row">
              <button className="cpi-remove-terms" onClick={() => setShowPaymentTerms(false)}><IconXCircle /></button>
              <div className="cpi-terms-field">
                <label>Payment Terms:</label>
                <div className="cpi-terms-input-wrap">
                  <input
                    type="number"
                    className="cpi-terms-input"
                    value={paymentTerms}
                    min={0}
                    onChange={e => handlePaymentTermsChange(e.target.value)}
                  />
                  <span className="cpi-days-label">days</span>
                </div>
              </div>
              <div className="cpi-expiry-field">
                <label>Expiry Date:</label>
                <div className="cpi-date-btn">
                  {/* <IconCalendar /> */}
                  <input
                    type="date"
                    className="cpi-date-input"
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                  />
                  {/* <IconChevronDown /> */}
                </div>
              </div>
            </div>
          )}

          {/* Extra Fields */}
          <div className="cpi-extra-grid">
            <div className="cpi-extra-field">
              <label>E-Way Bill No: <span className="cpi-info-icon"><IconInfo /></span></label>
              <input className="cpi-extra-input" value={eWayBill} onChange={e => setEWayBill(e.target.value)} />
            </div>
            <div className="cpi-extra-field">
              <label>Challan No.:</label>
              <input className="cpi-extra-input" value={challanNo} onChange={e => setChallanNo(e.target.value)} />
            </div>
            <div className="cpi-extra-field">
              <label>Financed By:</label>
              <input className="cpi-extra-input" value={financedBy} onChange={e => setFinancedBy(e.target.value)} />
            </div>
            <div className="cpi-extra-field">
              <label>Salesman:</label>
              <input className="cpi-extra-input" value={salesman} onChange={e => setSalesman(e.target.value)} />
            </div>
            <div className="cpi-extra-field">
              <label>Email ID:</label>
              <input className="cpi-extra-input" value={emailId} onChange={e => setEmailId(e.target.value)} />
            </div>
            <div className="cpi-extra-field">
              <label>Warranty Period:</label>
              <input className="cpi-extra-input" value={warrantyPeriod} onChange={e => setWarrantyPeriod(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Items Table ── */}
      <div className="cpi-items-section">
        <table className="cpi-items-table">
          <thead>
            <tr>
              <th className="cpi-th-no">NO</th>
              <th className="cpi-th-item">ITEMS/ SERVICES</th>
              <th>HSN/ SAC</th>
              {colConfig.showQuantity && <th>QTY</th>}
              {colConfig.showPricePerItem && <th>PRICE/ITEM (₹)</th>}
              <th>DISCOUNT</th>
              <th>TAX</th>
              <th>AMOUNT (₹)</th>
              <th className="cpi-th-add">
                <button className="cpi-add-col-btn" onClick={() => setShowColModal(true)} title="Show/Hide columns">
                  <IconColumns />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((li, idx) => (
              <tr key={li.id} className="cpi-item-row">
                <td className="cpi-td-no">{idx + 1}</td>
                <td className="cpi-td-item">
                  <div className="cpi-item-name-cell">
                    <span className="cpi-item-name">{li.item.name}</span>
                    <input
                      className="cpi-desc-input"
                      placeholder="Enter Description (optional)"
                      value={li.description}
                      onChange={e => updateLineItem(li.id, "description", e.target.value)}
                    />
                  </div>
                </td>
                <td>
                  <input className="cpi-cell-input" value={li.item.hsn} readOnly />
                </td>
                {colConfig.showQuantity && (
                  <td>
                    <div className="cpi-qty-cell">
                      <input
                        className="cpi-cell-input cpi-qty-input"
                        type="number"
                        min={1}
                        value={li.qty}
                        onChange={e => updateLineItem(li.id, "qty", Number(e.target.value) || 1)}
                      />
                      <span className="cpi-unit">{li.unit}</span>
                    </div>
                  </td>
                )}
                {colConfig.showPricePerItem && (
                  <td>
                    <input
                      className="cpi-cell-input"
                      type="number"
                      value={li.pricePerItem}
                      onChange={e => updateLineItem(li.id, "pricePerItem", Number(e.target.value) || 0)}
                    />
                  </td>
                )}
                <td>
                  <div className="cpi-disc-cell">
                    <div className="cpi-disc-row">
                      <span className="cpi-disc-label">%</span>
                      <input
                        className="cpi-cell-input"
                        type="number"
                        min={0} max={100}
                        value={li.discountPct}
                        onChange={e => updateLineItem(li.id, "discountPct", Number(e.target.value))}
                      />
                    </div>
                    <div className="cpi-disc-row">
                      <span className="cpi-disc-label">₹</span>
                      <input
                        className="cpi-cell-input"
                        type="number"
                        min={0}
                        value={li.discountAmt.toFixed(0)}
                        readOnly={li.discountPct > 0}
                        onChange={e => li.discountPct === 0 && updateLineItem(li.id, "discountAmt", Number(e.target.value))}
                      />
                    </div>
                  </div>
                </td>
                <td>
                  <div className="cpi-tax-cell">
                    <span className="cpi-tax-name">{li.taxRate > 0 ? `GST ${li.taxRate}%` : "None"}</span>
                    <span className="cpi-tax-amt">(₹ {((li.amount * li.taxRate) / 100).toFixed(0)})</span>
                  </div>
                </td>
                <td>
                  <div className="cpi-amount-cell">
                    <span className="cpi-amt-currency">₹</span>
                    <input
                      className="cpi-cell-input"
                      type="number"
                      value={li.amount.toFixed(0)}
                      readOnly
                    />
                  </div>
                </td>
                <td>
                  <button className="cpi-remove-item" onClick={() => removeLineItem(li.id)}>
                    <IconTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add Item Row */}
        <div className="cpi-add-item-row">
          <div className="cpi-add-item-btn-wrap">
            <button className="cpi-add-item-btn" onClick={() => setShowAddItems(true)}>
              + Add Item
            </button>
          </div>
          <div className="cpi-scan-wrap">
            <IconBarcode />
            <span>Scan Barcode</span>
          </div>
        </div>

        {/* Subtotal */}
        <div className="cpi-subtotal-row">
          <span className="cpi-subtotal-label">SUBTOTAL</span>
          <span className="cpi-subtotal-qty">{subtotalQty > 0 ? `₹ ${subtotalQty}` : "₹ 0"}</span>
          <span className="cpi-subtotal-disc">₹ {subtotalDisc.toFixed(0)}</span>
          <span className="cpi-subtotal-amt">₹ {subtotalAmt.toFixed(0)}</span>
        </div>
      </div>

      {/* ── Bottom Section ── */}
      <div className="cpi-bottom">
        {/* Left: Notes / Terms / Bank */}
        <div className="cpi-bottom-left">
          {!showNotes ? (
            <button className="cpi-add-link" onClick={() => setShowNotes(true)}>+ Add Notes</button>
          ) : (
            <div className="cpi-expandable">
              <div className="cpi-expandable-header">
                <span>Notes</span>
                <button className="cpi-expand-close" onClick={() => setShowNotes(false)}><IconMinusCircle /></button>
              </div>
              <textarea
                className="cpi-textarea"
                placeholder="Enter your notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
              />
              <div className="cpi-textarea-actions">
                <button className="cpi-tx-btn"><IconGoogle /> <span className="cpi-tx-label">G</span></button>
                <button className="cpi-tx-btn cpi-wa-btn"><IconWhatsApp /></button>
              </div>
            </div>
          )}

          {!showTerms ? (
            <button className="cpi-add-link" onClick={() => setShowTerms(true)}>+ Add Terms and Conditions</button>
          ) : (
            <div className="cpi-expandable">
              <div className="cpi-expandable-header">
                <span>Terms and Conditions</span>
                <button className="cpi-expand-close" onClick={() => setShowTerms(false)}><IconMinusCircle /></button>
              </div>
              <textarea
                className="cpi-textarea"
                placeholder="Enter your terms and conditions"
                value={terms}
                onChange={e => setTerms(e.target.value)}
                rows={3}
              />
              <div className="cpi-textarea-actions">
                <button className="cpi-tx-btn"><IconGoogle /> <span className="cpi-tx-label">G</span></button>
                <button className="cpi-tx-btn cpi-wa-btn"><IconWhatsApp /></button>
              </div>
            </div>
          )}

          {!showCharges && (
            <button className="cpi-add-link cpi-bank-link" onClick={() => {
              const acc = bankAccounts[0];
              if (acc) setShowSelectBank(true);
              else setShowAddBank(true);
            }}>
              + Add Bank Account
            </button>
          )}
        </div>

        {/* Right: Charges / Discount / Total */}
        <div className="cpi-bottom-right">
          {/* Additional Charges */}
          {!showCharges ? (
            <button className="cpi-add-link" onClick={() => setShowCharges(true)}>+ Add Additional Charges</button>
          ) : (
            <>
              {charges.map((charge, i) => (
                <div key={charge.id} className="cpi-charge-row">
                  <input
                    className="cpi-charge-label-input"
                    placeholder="Enter charge (ex. Transport Charge)"
                    value={charge.label}
                    onChange={e => setCharges(prev => prev.map(c => c.id === charge.id ? { ...c, label: e.target.value } : c))}
                  />
                  <span className="cpi-charge-currency">₹</span>
                  <input
                    className="cpi-charge-amt-input"
                    type="number"
                    min={0}
                    value={charge.amount}
                    onChange={e => setCharges(prev => prev.map(c => c.id === charge.id ? { ...c, amount: Number(e.target.value) } : c))}
                  />
                  <TaxDropdown
                    value={charge.taxType}
                    onChange={v => setCharges(prev => prev.map(c => c.id === charge.id ? { ...c, taxType: v } : c))}
                  />
                  <button className="cpi-charge-remove" onClick={() => removeCharge(charge.id)}><IconXCircle /></button>
                </div>
              ))}
              <button className="cpi-add-link" onClick={addCharge}>+ Add Another Charge</button>
            </>
          )}

          {/* Taxable Amount */}
          <div className="cpi-taxable-row">
            <span>Taxable Amount</span>
            <span>₹ {taxableAmount.toFixed(0)}</span>
          </div>

          {/* Discount */}
          {!showDiscount ? (
            <button className="cpi-add-link" onClick={() => setShowDiscount(true)}>+ Add Discount</button>
          ) : (
            <div className="cpi-discount-row">
              <div className="cpi-discount-type-wrap">
                <button
                  className="cpi-discount-type-btn"
                  onClick={() => setShowDiscountTypeDropdown(s => !s)}
                >
                  {discountType} <IconChevronDown />
                </button>
                {showDiscountTypeDropdown && (
                  <div className="cpi-discount-type-menu">
                    {(["Discount Before Tax", "Discount After Tax"] as const).map(opt => (
                      <button key={opt} className={`cpi-disc-opt${discountType === opt ? " active" : ""}`}
                        onClick={() => { setDiscountType(opt); setShowDiscountTypeDropdown(false); }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                className="cpi-disc-pct-input"
                placeholder="% 0"
                type="number" min={0} max={100}
                value={discountPct || ""}
                onChange={e => {
                  const v = Number(e.target.value);
                  setDiscountPct(v);
                  setDiscountAmt(v > 0 ? taxableAmount * v / 100 : 0);
                }}
              />
              <span className="cpi-disc-slash">/</span>
              <input
                className="cpi-disc-amt-input"
                placeholder="₹ 0"
                type="number" min={0}
                value={discountAmt || ""}
                onChange={e => {
                  const v = Number(e.target.value);
                  setDiscountAmt(v);
                  setDiscountPct(taxableAmount > 0 ? v / taxableAmount * 100 : 0);
                }}
              />
              <button className="cpi-charge-remove" onClick={() => { setShowDiscount(false); setDiscountPct(0); setDiscountAmt(0); }}><IconXCircle /></button>
            </div>
          )}

          {/* Auto Round Off */}
          <div className="cpi-round-row">
            <label className="cpi-checkbox-wrap">
              <input type="checkbox" checked={autoRound} onChange={e => setAutoRound(e.target.checked)} />
              <span className="cpi-checkbox-label">Auto Round Off</span>
            </label>
            <div className="cpi-adjust-wrap">
              <div className="cpi-adjust-type-wrap">
                <button className="cpi-adjust-btn" onClick={() => setShowAdjustDropdown(s => !s)}>
                  {adjustType} <IconChevronDown />
                </button>
                {showAdjustDropdown && (
                  <div className="cpi-adjust-menu">
                    {(["+Add", "- Reduce"] as const).map(opt => (
                      <button key={opt} className={`cpi-adj-opt${adjustType === opt ? " active" : ""}`}
                        onClick={() => { setAdjustType(opt as any); setShowAdjustDropdown(false); }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="cpi-adjust-currency">₹</span>
              <input
                className="cpi-adjust-input"
                type="number"
                min={0}
                value={adjustAmt || 0}
                onChange={e => setAdjustAmt(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Total Amount */}
          <div className="cpi-total-row">
            <span className="cpi-total-label">Total Amount</span>
            <div className="cpi-payment-input-wrap">
              <input className="cpi-payment-input" placeholder="Enter Payment amount" readOnly />
            </div>
          </div>
          {totalAmount > 0 && (
            <div className="cpi-total-value-row">
              <span />
              <span className="cpi-total-value">{formatINR(totalAmount)}</span>
            </div>
          )}

          {/* Signature */}
          <div className="cpi-signature-section">
            <div className="cpi-signature-label">
              Authorized signatory for <strong>scratchweb.solutions</strong>
            </div>
            <div className="cpi-signature-box" />
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {showAddParty && (
        <AddPartyModal
          onSelect={handleSelectParty}
          onClose={() => setShowAddParty(false)}
        />
      )}

      {showAddItems && (
        <AddItemsModal
          onAdd={handleAddItems}
          onClose={() => setShowAddItems(false)}
        />
      )}

      {showColModal && (
        <ColumnVisibilityModal
          config={colConfig}
          onSave={cfg => { setColConfig(cfg); setShowColModal(false); }}
          onClose={() => setShowColModal(false)}
        />
      )}

      {showAddBank && (
        <AddBankAccountModal
          onSubmit={acc => {
            const newAcc = { ...acc, id: Date.now() };
            setBankAccounts(prev => [...prev, newAcc]);
            setSelectedBankId(newAcc.id);
            setShowAddBank(false);
          }}
          onClose={() => setShowAddBank(false)}
        />
      )}

      {showSelectBank && (
        <SelectBankAccountModal
          accounts={bankAccounts}
          selectedId={selectedBankId}
          onSelect={id => setSelectedBankId(id)}
          onDone={() => setShowSelectBank(false)}
          onClose={() => setShowSelectBank(false)}
        />
      )}

      {showChangeShipping && (
        <ChangeShippingModal
          addresses={shippingAddresses}
          selectedId={selectedShippingId}
          onSelect={id => setSelectedShippingId(id)}
          onDone={() => setShowChangeShipping(false)}
          onClose={() => setShowChangeShipping(false)}
          onAddNew={() => { setEditingShipping(null); setShowAddShipping(true); setShowChangeShipping(false); }}
          onEdit={addr => { setEditingShipping(addr); setShowAddShipping(true); setShowChangeShipping(false); }}
        />
      )}

      {showAddShipping && (
        <AddShippingAddressModal
          initial={editingShipping}
          defaultName={party?.name}
          onSave={handleSaveShipping}
          onClose={() => { setShowAddShipping(false); setEditingShipping(null); }}
        />
      )}

      {/* Quick Settings Modal */}
      {showSettingsModal && (
        <div className="cpi-modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="cpi-modal" onClick={e => e.stopPropagation()}>
            <div className="cpi-modal-header">
              <h2>Quick Proforma Settings</h2>
              <button className="cpi-modal-close" onClick={() => setShowSettingsModal(false)}><IconClose /></button>
            </div>
            <div className="cpi-modal-body">
              <div className={`cpi-settings-card${tempSettings.prefixEnabled ? " enabled" : ""}`}>
                <div className="cpi-settings-row">
                  <div>
                    <div className="cpi-settings-title">Proforma Prefix &amp; Sequence Number</div>
                    <div className="cpi-settings-desc">Add your custom prefix &amp; sequence for Proforma Numbering</div>
                  </div>
                  <label className="cpi-toggle">
                    <input type="checkbox" checked={tempSettings.prefixEnabled}
                      onChange={e => setTempSettings(p => ({...p, prefixEnabled: e.target.checked}))} />
                    <span className="cpi-toggle-slider" />
                  </label>
                </div>
                {tempSettings.prefixEnabled && (
                  <div className="cpi-settings-fields">
                    <div className="cpi-s-field">
                      <label>Prefix</label>
                      <input type="text" placeholder="Prefix" value={tempSettings.prefix}
                        onChange={e => setTempSettings(p => ({...p, prefix: e.target.value}))} />
                    </div>
                    <div className="cpi-s-field">
                      <label>Sequence Number</label>
                      <input type="number" value={tempSettings.sequenceNumber}
                        onChange={e => setTempSettings(p => ({...p, sequenceNumber: Number(e.target.value)}))} />
                    </div>
                    <div className="cpi-s-preview">Proforma Number: {tempSettings.prefix}{tempSettings.sequenceNumber}</div>
                  </div>
                )}
              </div>
              <div className="cpi-settings-card">
                <div className="cpi-settings-row">
                  <div>
                    <div className="cpi-settings-title">Show Item Image on Invoice</div>
                    <div className="cpi-settings-desc">This will apply to all vouchers except for Payment In and Payment Out</div>
                  </div>
                  <label className="cpi-toggle">
                    <input type="checkbox" checked={tempSettings.showItemImage}
                      onChange={e => setTempSettings(p => ({...p, showItemImage: e.target.checked}))} />
                    <span className="cpi-toggle-slider" />
                  </label>
                </div>
              </div>
              <div className="cpi-settings-card">
                <div className="cpi-settings-row">
                  <div>
                    <div className="cpi-settings-title">Price History <span className="cpi-new-badge">New</span></div>
                    <div className="cpi-settings-desc">Show last 5 sales / purchase prices of the item for the selected party in invoice</div>
                  </div>
                  <label className="cpi-toggle">
                    <input type="checkbox" checked={tempSettings.priceHistory}
                      onChange={e => setTempSettings(p => ({...p, priceHistory: e.target.checked}))} />
                    <span className="cpi-toggle-slider" />
                  </label>
                </div>
              </div>
            </div>
            <div className="cpi-modal-footer">
              <button className="cpi-btn-cancel" onClick={() => setShowSettingsModal(false)}>Cancel</button>
              <button className="cpi-btn-save" onClick={() => { setLocalSettings({...tempSettings}); setShowSettingsModal(false); }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Tax Dropdown helper ───────────────────────────────────────────────────────
const TAX_OPTIONS = ["No Tax Applicable", "GST 5%", "GST 12%", "GST 18%", "GST 28%"];

const TaxDropdown: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="cpi-tax-dropdown">
      <button className="cpi-tax-btn" onClick={() => setOpen(s => !s)}>
        {value} <IconChevronDown />
      </button>
      {open && (
        <div className="cpi-tax-menu">
          {TAX_OPTIONS.map(opt => (
            <button key={opt} className={`cpi-tax-opt${value === opt ? " active" : ""}`}
              onClick={() => { onChange(opt); setOpen(false); }}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreateProformaInvoice;