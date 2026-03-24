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

// ── Invoice Builder Det — mirrors InvoiceBuilderApp's InvoiceDetailsState ─────
interface InvoiceBuilderDet {
  showPO: boolean;
  showEwayBill: boolean;
  showVehicle: boolean;
  showChallan: boolean;
  showFinancedBy: boolean;
  showSalesman: boolean;
  showWarranty: boolean;
  showDispatchedThrough?: boolean;
  showTransportName?: boolean;
  showEmailId?: boolean;
  customFields: { label: string; value: string }[];
}

const BUILDER_DET_DEFAULT: InvoiceBuilderDet = {
  showPO: false, showEwayBill: true, showVehicle: false,
  showChallan: true, showFinancedBy: true, showSalesman: true,
  showWarranty: true, showDispatchedThrough: false,
  showTransportName: false, showEmailId: true,
  customFields: [],
};

function loadBuilderDetCPI(): InvoiceBuilderDet {
  try {
    const raw = localStorage.getItem("activeInvoiceTemplate");
    if (!raw) return BUILDER_DET_DEFAULT;
    const t = JSON.parse(raw);
    return t?.det ? { ...BUILDER_DET_DEFAULT, ...t.det } : BUILDER_DET_DEFAULT;
  } catch {
    return BUILDER_DET_DEFAULT;
  }
}

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

  // ── Invoice Builder det — controls which extra fields are visible ──────────
  const [det, setDet] = useState<InvoiceBuilderDet>(loadBuilderDetCPI);

  useEffect(() => {
    const sync = () => {
      const next = loadBuilderDetCPI();
      setDet(prev => JSON.stringify(prev) !== JSON.stringify(next) ? next : prev);
    };
    sync();
    const timer = setInterval(sync, 400);
    const onStorage = (e: StorageEvent) => { if (e.key === "activeInvoiceTemplate") sync(); };
    window.addEventListener("storage", onStorage);
    return () => { clearInterval(timer); window.removeEventListener("storage", onStorage); };
  }, []);

  // ── Custom field values (keyed by label) ────────────────────────────────────
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});

  // ── Signature ──────────────────────────────────────────────────────────────
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureMode, setSignatureMode] = useState<null | "image" | "empty">(null);
  const [signatureUrl, setSignatureUrl] = useState<string>("");
  const signatureFileRef = useRef<HTMLInputElement>(null);

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
      const base = updated.pricePerItem * updated.qty;
      if (field === "discountPct") {
        // % changed → auto-calc ₹
        const pct = Number(value);
        updated.discountPct = pct;
        updated.discountAmt = pct > 0 ? parseFloat((base * pct / 100).toFixed(2)) : updated.discountAmt;
      } else if (field === "discountAmt") {
        // ₹ changed → auto-calc %
        const amt = Number(value);
        updated.discountAmt = amt;
        updated.discountPct = base > 0 ? parseFloat(((amt / base) * 100).toFixed(2)) : 0;
      } else if (field === "qty" || field === "pricePerItem") {
        // Qty/price changed → recalc discount ₹ from existing %
        const newBase = (field === "qty" ? Number(value) : updated.qty) * (field === "pricePerItem" ? Number(value) : updated.pricePerItem);
        if (updated.discountPct > 0) {
          updated.discountAmt = parseFloat((newBase * updated.discountPct / 100).toFixed(2));
        }
      }
      const finalBase = updated.pricePerItem * updated.qty;
      updated.amount = Math.max(0, finalBase - updated.discountAmt);
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
    <div className="aa-cpi-root">
      {/* ── Top Bar ── */}
      <div className="aa-cpi-topbar">
        <div className="aa-cpi-topbar-left">
          <button className="aa-cpi-back-btn" onClick={onBack}>
            <IconArrowLeft />
          </button>
          <h1 className="aa-cpi-page-title">
            {isEdit ? "Update Proforma Invoice" : "Create Proforma Invoice"}
          </h1>
        </div>
        <div className="aa-cpi-topbar-right">
          <button className="aa-cpi-keyboard-btn" title="Keyboard shortcuts">
            <IconKeyboard />
          </button>
          <button className="aa-cpi-settings-btn" onClick={() => { setTempSettings({ ...localSettings }); setShowSettingsModal(true); }}>
            <IconSettings />
            <span>Settings</span>
            <span className="aa-cpi-settings-dot" />
          </button>
          {!isEdit && (
            <button className="aa-cpi-save-new-btn" onClick={() => onSaveNew(buildInvoice())}>
              Save &amp; New
            </button>
          )}
          <button className={isEdit ? "aa-cpi-update-btn" : "aa-cpi-save-btn"} onClick={() => onSave(buildInvoice())}>
            {isEdit ? "Update Proforma Invoice" : "Save"}
          </button>
        </div>
      </div>

      <div className="aa-cpi-body">
        {/* ── Left: Bill To / Ship To ── */}
        <div className="aa-cpi-left">
          {/* Bill To */}
          <div className="aa-cpi-section-label">Bill To</div>
          {party ? (
            <div className="aa-cpi-party-sections">
              <div className="aa-cpi-party-card">
                <div className="aa-cpi-party-card-header">
                  <span className="aa-cpi-party-section-title">Bill To</span>
                  <button className="aa-cpi-change-btn" onClick={() => setShowAddParty(true)}>Change Party</button>
                </div>
                <div className="aa-cpi-party-name">{party.name}</div>
                {party.mobile && party.mobile !== "-" && (
                  <div className="aa-cpi-party-detail">Phone Number: {party.mobile}</div>
                )}
                {party.billingAddress && (
                  <div className="aa-cpi-party-detail">{party.billingAddress}</div>
                )}
              </div>
              <div className="aa-cpi-party-card">
                <div className="aa-cpi-party-card-header">
                  <span className="aa-cpi-party-section-title">Ship To</span>
                  <button className="aa-cpi-change-btn" onClick={() => setShowChangeShipping(true)}>Change Shipping Address</button>
                </div>
                {selectedShipping ? (
                  <>
                    <div className="aa-cpi-party-name">{selectedShipping.name}</div>
                    <div className="aa-cpi-party-detail">
                      Address: {selectedShipping.street}
                      {selectedShipping.city ? `, ${selectedShipping.city}` : ""}
                      {selectedShipping.state ? `, ${selectedShipping.state}` : ""}
                      {selectedShipping.pincode ? ` ${selectedShipping.pincode}` : ""}
                    </div>
                    {party.mobile && party.mobile !== "-" && (
                      <div className="aa-cpi-party-detail">Phone Number: {party.mobile}</div>
                    )}
                  </>
                ) : (
                  <button className="aa-cpi-add-shipping-btn" onClick={() => setShowAddShipping(true)}>
                    + Add Shipping Address
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="aa-cpi-add-party-box" onClick={() => setShowAddParty(true)}>
              <span className="aa-cpi-add-party-text">+ Add Party</span>
            </div>
          )}
        </div>

        {/* ── Right: Invoice Meta ── */}
        <div className="aa-cpi-right">
          <div className="aa-cpi-meta-grid">
            <div className="aa-cpi-meta-field">
              <label>Proforma Invoice No:</label>
              <input className="aa-cpi-meta-input cpi-num-input" value={proformaDisplay} readOnly />
            </div>
            <div className="aa-cpi-meta-field">
              <label>Proforma Invoice Date:</label>
              <div className="aa-cpi-date-btn">
                {/* <IconCalendar /> */}
                <input
                  type="date"
                  className="aa-cpi-date-input"
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
            <div className="aa-cpi-due-box" onClick={() => setShowPaymentTerms(true)}>
              + Add Due Date
            </div>
          ) : (
            <div className="aa-cpi-payment-row">
              <button className="aa-cpi-remove-terms" onClick={() => setShowPaymentTerms(false)}><IconXCircle /></button>
              <div className="aa-cpi-terms-field">
                <label>Payment Terms:</label>
                <div className="aa-cpi-terms-input-wrap">
                  <input
                    type="number"
                    className="aa-cpi-terms-input"
                    value={paymentTerms}
                    min={0}
                    onChange={e => handlePaymentTermsChange(e.target.value)}
                  />
                  <span className="aa-cpi-days-label">days</span>
                </div>
              </div>
              <div className="aa-cpi-expiry-field">
                <label>Expiry Date:</label>
                <div className="aa-cpi-date-btn">
                  {/* <IconCalendar /> */}
                  <input
                    type="date"
                    className="aa-cpi-date-input"
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                  />
                  {/* <IconChevronDown /> */}
                </div>
              </div>
            </div>
          )}

          {/* Extra Fields — driven by Invoice Builder det */}
          {(() => {
            type FieldDef = { label: string; key: string; isCustom?: boolean };
            const visibleFields: FieldDef[] = [
              ...(det.showEwayBill             ? [{ label: "E-Way Bill No:",       key: "eWayBill"    }] : []),
              ...(det.showChallan              ? [{ label: "Challan No.:",         key: "challanNo"   }] : []),
              ...(det.showFinancedBy           ? [{ label: "Financed By:",         key: "financedBy"  }] : []),
              ...(det.showSalesman             ? [{ label: "Salesman:",            key: "salesman"    }] : []),
              ...(det.showEmailId === true      ? [{ label: "Email ID:",            key: "emailId"     }] : []),
              ...(det.showWarranty             ? [{ label: "Warranty Period:",      key: "warrantyPeriod" }] : []),
              ...(det.showPO                   ? [{ label: "PO Number:",           key: "poNumber"    }] : []),
              ...(det.showVehicle              ? [{ label: "Vehicle No:",          key: "vehicleNo"   }] : []),
              ...(det.showDispatchedThrough === true ? [{ label: "Dispatched Through:", key: "dispatchedThrough" }] : []),
              ...(det.showTransportName === true     ? [{ label: "Transport Name:",      key: "transportName"    }] : []),
              ...(det.customFields ?? []).map(cf => ({ label: cf.label + ":", key: `custom_${cf.label}`, isCustom: true, defaultValue: cf.value })),
            ];
            if (visibleFields.length === 0) return null;

            const getVal = (f: FieldDef & { defaultValue?: string }): string => {
              if (f.key === "eWayBill")    return eWayBill;
              if (f.key === "challanNo")   return challanNo;
              if (f.key === "financedBy")  return financedBy;
              if (f.key === "salesman")    return salesman;
              if (f.key === "emailId")     return emailId;
              if (f.key === "warrantyPeriod") return warrantyPeriod;
              if (f.isCustom) return customFieldValues[f.label] ?? (f.defaultValue ?? "");
              return customFieldValues[f.key] ?? "";
            };

            const setVal = (f: FieldDef, val: string) => {
              if (f.key === "eWayBill")    { setEWayBill(val); return; }
              if (f.key === "challanNo")   { setChallanNo(val); return; }
              if (f.key === "financedBy")  { setFinancedBy(val); return; }
              if (f.key === "salesman")    { setSalesman(val); return; }
              if (f.key === "emailId")     { setEmailId(val); return; }
              if (f.key === "warrantyPeriod") { setWarrantyPeriod(val); return; }
              setCustomFieldValues(prev => ({ ...prev, [f.isCustom ? f.label : f.key]: val }));
            };

            return (
              <div className="aa-cpi-extra-grid">
                {visibleFields.map(f => (
                  <div className="aa-cpi-extra-field" key={f.key}>
                    <label>
                      {f.label}
                      {f.key === "eWayBill" && <span className="aa-cpi-info-icon"><IconInfo /></span>}
                    </label>
                    <input
                      className="aa-cpi-extra-input"
                      value={getVal(f as any)}
                      onChange={e => setVal(f, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── Items Table ── */}
      <div className="aa-cpi-items-section">
        <table className="aa-cpi-items-table">
          <thead>
            <tr>
              <th className="aa-cpi-th-no">NO</th>
              <th className="aa-cpi-th-item">ITEMS/ SERVICES</th>
              <th>HSN/ SAC</th>
              {colConfig.showQuantity && <th>QTY</th>}
              {colConfig.showPricePerItem && <th>PRICE/ITEM (₹)</th>}
              <th>DISCOUNT</th>
              <th>TAX</th>
              <th>AMOUNT (₹)</th>
              <th className="aa-cpi-th-add">
                <button className="aa-cpi-add-col-btn" onClick={() => setShowColModal(true)} title="Show/Hide columns">
                  <IconColumns />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((li, idx) => {
              const taxAmt = (li.amount * li.taxRate) / 100;
              const taxLabel = li.taxRate > 0 ? `GST ${li.taxRate}%` : "None";
              return (
                <tr key={li.id} className="aa-cpi-item-row">
                  <td className="aa-cpi-td-no">{idx + 1}</td>
                  <td className="aa-cpi-td-item">
                    <div className="aa-cpi-item-name-cell">
                      <span className="aa-cpi-item-name">{li.item.name}</span>
                      <input
                        className="aa-cpi-desc-input"
                        placeholder="Enter Description (optional)"
                        value={li.description}
                        onChange={e => updateLineItem(li.id, "description", e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="aa-cpi-td-hsn">
                    <input className="aa-cpi-cell-input cpi-hsn-input" value={li.item.hsn} readOnly placeholder="—" />
                  </td>
                  {colConfig.showQuantity && (
                    <td className="aa-cpi-td-qty">
                      <div className="aa-cpi-qty-cell">
                        <input
                          className="aa-cpi-cell-input cpi-qty-num"
                          type="number" min={1}
                          value={li.qty}
                          onChange={e => updateLineItem(li.id, "qty", Number(e.target.value) || 1)}
                        />
                        <span className="aa-cpi-unit-badge">{li.unit}</span>
                      </div>
                    </td>
                  )}
                  {colConfig.showPricePerItem && (
                    <td className="aa-cpi-td-price">
                      <input
                        className="aa-cpi-cell-input cpi-price-input"
                        type="number" min={0}
                        value={li.pricePerItem}
                        onChange={e => updateLineItem(li.id, "pricePerItem", Number(e.target.value) || 0)}
                      />
                    </td>
                  )}
                  <td className="aa-cpi-td-disc">
                    <div className="aa-cpi-disc-cell">
                      <div className="aa-cpi-disc-row">
                        <span className="aa-cpi-disc-label">%</span>
                        <input
                          className="aa-cpi-cell-input cpi-disc-input"
                          type="number" min={0} max={100}
                          value={li.discountPct}
                          onChange={e => updateLineItem(li.id, "discountPct", Number(e.target.value))}
                        />
                      </div>
                      <div className="aa-cpi-disc-row">
                        <span className="aa-cpi-disc-label">₹</span>
                        <input
                          className="aa-cpi-cell-input cpi-disc-input"
                          type="number" min={0}
                          value={li.discountAmt}
                          onChange={e => updateLineItem(li.id, "discountAmt", Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="aa-cpi-td-tax">
                    <div className="aa-cpi-tax-cell">
                      <TaxSelectInline
                        value={taxLabel}
                        onChange={v => {
                          const rate = v === "None" ? 0 : parseInt(v.replace("GST ", "").replace("%", "")) || 0;
                          setLineItems(prev => prev.map(x => x.id === li.id ? { ...x, taxRate: rate } : x));
                        }}
                      />
                      <span className="aa-cpi-tax-amt">(₹ {taxAmt.toFixed(0)})</span>
                    </div>
                  </td>
                  <td className="aa-cpi-td-amount">
                    <div className="aa-cpi-amount-cell">
                      <span className="aa-cpi-amt-rs">₹</span>
                      <input
                        className="aa-cpi-cell-input cpi-amount-input"
                        type="number"
                        value={li.amount.toFixed(2)}
                        onChange={e => setLineItems(prev => prev.map(x => x.id === li.id ? { ...x, amount: Number(e.target.value) } : x))}
                      />
                    </div>
                  </td>
                  <td className="aa-cpi-td-del">
                    <button className="aa-cpi-remove-item" onClick={() => removeLineItem(li.id)}>
                      <IconTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Add Item Row */}
        <div className="aa-cpi-add-item-row">
          <div className="aa-cpi-add-item-btn-wrap">
            <button className="aa-cpi-add-item-btn" onClick={() => setShowAddItems(true)}>
              + Add Item
            </button>
          </div>
          <div className="aa-cpi-scan-wrap">
            <IconBarcode />
            <span>Scan Barcode</span>
          </div>
        </div>

        {/* Subtotal */}
        <div className="aa-cpi-subtotal-row">
          <span className="aa-cpi-subtotal-label">SUBTOTAL</span>
          <span className="aa-cpi-subtotal-qty">{subtotalQty > 0 ? `₹ ${subtotalQty}` : "₹ 0"}</span>
          <span className="aa-cpi-subtotal-disc">₹ {subtotalDisc.toFixed(0)}</span>
          <span className="aa-cpi-subtotal-amt">₹ {subtotalAmt.toFixed(0)}</span>
        </div>
      </div>

      {/* ── Bottom Section ── */}
      <div className="aa-cpi-bottom">
        {/* Left: Notes / Terms / Bank */}
        <div className="aa-cpi-bottom-left">
          {!showNotes ? (
            <button className="aa-cpi-add-link" onClick={() => setShowNotes(true)}>+ Add Notes</button>
          ) : (
            <div className="aa-cpi-expandable">
              <div className="aa-cpi-expandable-header">
                <span>Notes</span>
                <button className="aa-cpi-expand-close" onClick={() => setShowNotes(false)}><IconMinusCircle /></button>
              </div>
              <textarea
                className="aa-cpi-textarea"
                placeholder="Enter your notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
              />
              <div className="aa-cpi-textarea-actions">
                <button className="aa-cpi-tx-btn"><IconGoogle /> <span className="aa-cpi-tx-label">G</span></button>
                <button className="aa-cpi-tx-btn cpi-wa-btn"><IconWhatsApp /></button>
              </div>
            </div>
          )}

          {!showTerms ? (
            <button className="aa-cpi-add-link" onClick={() => setShowTerms(true)}>+ Add Terms and Conditions</button>
          ) : (
            <div className="aa-cpi-expandable">
              <div className="aa-cpi-expandable-header">
                <span>Terms and Conditions</span>
                <button className="aa-cpi-expand-close" onClick={() => setShowTerms(false)}><IconMinusCircle /></button>
              </div>
              <textarea
                className="aa-cpi-textarea"
                placeholder="Enter your terms and conditions"
                value={terms}
                onChange={e => setTerms(e.target.value)}
                rows={3}
              />
              <div className="aa-cpi-textarea-actions">
                <button className="aa-cpi-tx-btn"><IconGoogle /> <span className="aa-cpi-tx-label">G</span></button>
                <button className="aa-cpi-tx-btn cpi-wa-btn"><IconWhatsApp /></button>
              </div>
            </div>
          )}

          {!showCharges && (() => {
            const selectedBank = bankAccounts.find(b => b.id === selectedBankId) || null;
            return selectedBank ? (
              <div className="aa-bm-selected-card">
                <div className="aa-bm-selected-card-title">Bank Details</div>
                <div className="aa-bm-selected-detail-row">
                  <span>Account Number: </span><strong>{selectedBank.accountNumber}</strong>
                </div>
                {selectedBank.ifsc && (
                  <div className="aa-bm-selected-detail-row">
                    <span>IFSC Code: </span><strong>{selectedBank.ifsc}</strong>
                  </div>
                )}
                {selectedBank.bankName && (
                  <div className="aa-bm-selected-detail-row">
                    <span>Bank &amp; Branch: </span><strong>{selectedBank.bankName}</strong>
                  </div>
                )}
                {selectedBank.holderName && (
                  <div className="aa-bm-selected-detail-row">
                    <span>Account Holder: </span><strong>{selectedBank.holderName}</strong>
                  </div>
                )}
                <div className="aa-bm-selected-actions">
                  <button className="aa-cpi-add-link" onClick={() => setShowSelectBank(true)}>
                    Change Bank Account
                  </button>
                  <button className="aa-cpi-add-link" style={{ color: "#ef4444" }} onClick={() => setSelectedBankId(null)}>
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button className="aa-cpi-add-link" onClick={() => setShowAddBank(true)}>
                + Add Bank Account
              </button>
            );
          })()}
        </div>

        {/* Right: Charges / Discount / Total */}
        <div className="aa-cpi-bottom-right">
          {/* Additional Charges */}
          {!showCharges ? (
            <button className="aa-cpi-add-link" onClick={() => setShowCharges(true)}>+ Add Additional Charges</button>
          ) : (
            <>
              {charges.map((charge, i) => (
                <div key={charge.id} className="aa-cpi-charge-row">
                  <input
                    className="aa-cpi-charge-label-input"
                    placeholder="Enter charge (ex. Transport Charge)"
                    value={charge.label}
                    onChange={e => setCharges(prev => prev.map(c => c.id === charge.id ? { ...c, label: e.target.value } : c))}
                  />
                  <span className="aa-cpi-charge-currency">₹</span>
                  <input
                    className="aa-cpi-charge-amt-input"
                    type="number"
                    min={0}
                    value={charge.amount}
                    onChange={e => setCharges(prev => prev.map(c => c.id === charge.id ? { ...c, amount: Number(e.target.value) } : c))}
                  />
                  <TaxDropdown
                    value={charge.taxType}
                    onChange={v => setCharges(prev => prev.map(c => c.id === charge.id ? { ...c, taxType: v } : c))}
                  />
                  <button className="aa-cpi-charge-remove" onClick={() => removeCharge(charge.id)}><IconXCircle /></button>
                </div>
              ))}
              <button className="aa-cpi-add-link" onClick={addCharge}>+ Add Another Charge</button>
            </>
          )}

          {/* Taxable Amount */}
          <div className="aa-cpi-taxable-row">
            <span>Taxable Amount</span>
            <span>₹ {taxableAmount.toFixed(0)}</span>
          </div>

          {/* Discount */}
          {!showDiscount ? (
            <div className="aa-cpi-summary-row cpi-summary-row--link">
              <button className="aa-cpi-add-link" onClick={() => setShowDiscount(true)}>+ Add Discount</button>
              <span className="aa-cpi-summary-neg">- ₹ 0</span>
            </div>
          ) : (
            <div className="aa-cpi-discount-row">
              <div className="aa-cpi-discount-type-wrap">
                <button
                  className="aa-cpi-discount-type-btn"
                  onClick={() => setShowDiscountTypeDropdown(s => !s)}
                >
                  {discountType} <IconChevronDown />
                </button>
                {showDiscountTypeDropdown && (
                  <div className="aa-cpi-discount-type-menu">
                    {(["Discount Before Tax", "Discount After Tax"] as const).map(opt => (
                      <button key={opt} className={`aa-cpi-disc-opt${discountType === opt ? " active" : ""}`}
                        onClick={() => { setDiscountType(opt); setShowDiscountTypeDropdown(false); }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="aa-cpi-disc-inputs-wrap">
                <span className="aa-cpi-disc-pct-label">%</span>
                <input
                  className="aa-cpi-disc-pct-input"
                  type="number" min={0} max={100}
                  value={discountPct || ""}
                  placeholder="0"
                  onChange={e => {
                    const v = Number(e.target.value);
                    setDiscountPct(v);
                    setDiscountAmt(taxableAmount > 0 ? parseFloat((taxableAmount * v / 100).toFixed(2)) : 0);
                  }}
                />
                <span className="aa-cpi-disc-sep">/</span>
                <span className="aa-cpi-disc-rs-label">₹</span>
                <input
                  className="aa-cpi-disc-amt-input"
                  type="number" min={0}
                  value={discountAmt || ""}
                  placeholder="0"
                  onChange={e => {
                    const v = Number(e.target.value);
                    setDiscountAmt(v);
                    setDiscountPct(taxableAmount > 0 ? parseFloat((v / taxableAmount * 100).toFixed(2)) : 0);
                  }}
                />
                <button className="aa-cpi-charge-remove" onClick={() => { setShowDiscount(false); setDiscountPct(0); setDiscountAmt(0); }}><IconXCircle /></button>
              </div>
            </div>
          )}

          {/* Auto Round Off */}
          <div className="aa-cpi-round-row">
            <label className="aa-cpi-checkbox-wrap">
              <input type="checkbox" checked={autoRound} onChange={e => setAutoRound(e.target.checked)} />
              <span className="aa-cpi-checkbox-label">Auto Round Off</span>
            </label>
            <div className="aa-cpi-adjust-wrap">
              <div className="aa-cpi-adjust-type-wrap">
                <button className="aa-cpi-adjust-btn" onClick={() => setShowAdjustDropdown(s => !s)}>
                  {adjustType} <IconChevronDown />
                </button>
                {showAdjustDropdown && (
                  <div className="aa-cpi-adjust-menu">
                    {(["+Add", "- Reduce"] as const).map(opt => (
                      <button key={opt} className={`aa-cpi-adj-opt${adjustType === opt ? " active" : ""}`}
                        onClick={() => { setAdjustType(opt as any); setShowAdjustDropdown(false); }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="aa-cpi-adjust-currency">₹</span>
              <input
                className="aa-cpi-adjust-input"
                type="number"
                min={0}
                value={adjustAmt || 0}
                onChange={e => setAdjustAmt(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Total Amount */}
          <div className="aa-cpi-total-row">
            <span className="aa-cpi-total-label">Total Amount</span>
            <span className="aa-cpi-total-value">{totalAmount > 0 ? formatINR(totalAmount) : ""}</span>
          </div>
          <div className="aa-cpi-payment-row-wrap">
            <input className="aa-cpi-payment-input" placeholder="Enter Payment amount" />
          </div>

          {/* Signature */}
          <div className="aa-cpi-signature-section">
            <div className="aa-cpi-signature-label">
              Authorized signatory for <strong>scratchweb.solutions</strong>
            </div>

            {/* No signature chosen yet */}
            {signatureMode === null && (
              <button className="aa-cpi-sig-add-btn" onClick={() => setShowSignatureModal(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Signature
              </button>
            )}

            {/* Empty signature box chosen */}
            {signatureMode === "empty" && (
              <div className="aa-cpi-signature-empty-wrap">
                <div className="aa-cpi-signature-box" />
                <button className="aa-cpi-sig-change-btn" onClick={() => setShowSignatureModal(true)}>Change</button>
                <button className="aa-cpi-sig-remove-btn" onClick={() => { setSignatureMode(null); setSignatureUrl(""); }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            )}

            {/* Uploaded image signature */}
            {signatureMode === "image" && signatureUrl && (
              <div className="aa-cpi-signature-img-wrap">
                <img src={signatureUrl} alt="Signature" className="aa-cpi-signature-img" />
                <div className="aa-cpi-sig-img-actions">
                  <button className="aa-cpi-sig-change-btn" onClick={() => setShowSignatureModal(true)}>Change</button>
                  <button className="aa-cpi-sig-remove-btn" onClick={() => { setSignatureMode(null); setSignatureUrl(""); }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={signatureFileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  setSignatureUrl(URL.createObjectURL(file));
                  setSignatureMode("image");
                  setShowSignatureModal(false);
                }
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </div>

      {/* Signature Picker Modal */}
      {showSignatureModal && (
        <div className="aa-cpi-modal-overlay" onClick={() => setShowSignatureModal(false)}>
          <div className="aa-cpi-sig-modal" onClick={e => e.stopPropagation()}>
            <div className="aa-cpi-modal-header">
              <h2>Signature</h2>
              <button className="aa-cpi-modal-close" onClick={() => setShowSignatureModal(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="aa-cpi-sig-modal-body">
              {/* Option 1: Upload from Desktop */}
              <button
                className="aa-cpi-sig-option-card"
                onClick={() => { setShowSignatureModal(false); signatureFileRef.current?.click(); }}
              >
                <div className="aa-cpi-sig-option-icon">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#5b5fc7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                    <path d="M14 2v4h4"/>
                  </svg>
                </div>
                <span className="aa-cpi-sig-option-label">Upload Signature from Desktop</span>
              </button>

              {/* Option 2: Show empty box */}
              <button
                className="aa-cpi-sig-option-card"
                onClick={() => { setSignatureMode("empty"); setSignatureUrl(""); setShowSignatureModal(false); }}
              >
                <div className="aa-cpi-sig-option-icon">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#5b5fc7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="6" width="20" height="12" rx="2"/>
                  </svg>
                </div>
                <span className="aa-cpi-sig-option-label">Show Empty Signature Box on Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
        <div className="aa-cpi-modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="aa-cpi-modal" onClick={e => e.stopPropagation()}>
            <div className="aa-cpi-modal-header">
              <h2>Quick Proforma Settings</h2>
              <button className="aa-cpi-modal-close" onClick={() => setShowSettingsModal(false)}><IconClose /></button>
            </div>
            <div className="aa-cpi-modal-body">
              <div className={`aa-cpi-settings-card${tempSettings.prefixEnabled ? " enabled" : ""}`}>
                <div className="aa-cpi-settings-row">
                  <div>
                    <div className="aa-cpi-settings-title">Proforma Prefix &amp; Sequence Number</div>
                    <div className="aa-cpi-settings-desc">Add your custom prefix &amp; sequence for Proforma Numbering</div>
                  </div>
                  <label className="aa-cpi-toggle">
                    <input type="checkbox" checked={tempSettings.prefixEnabled}
                      onChange={e => setTempSettings(p => ({...p, prefixEnabled: e.target.checked}))} />
                    <span className="aa-cpi-toggle-slider" />
                  </label>
                </div>
                {tempSettings.prefixEnabled && (
                  <div className="aa-cpi-settings-fields">
                    <div className="aa-cpi-s-field">
                      <label>Prefix</label>
                      <input type="text" placeholder="Prefix" value={tempSettings.prefix}
                        onChange={e => setTempSettings(p => ({...p, prefix: e.target.value}))} />
                    </div>
                    <div className="aa-cpi-s-field">
                      <label>Sequence Number</label>
                      <input type="number" value={tempSettings.sequenceNumber}
                        onChange={e => setTempSettings(p => ({...p, sequenceNumber: Number(e.target.value)}))} />
                    </div>
                    <div className="aa-cpi-s-preview">Proforma Number: {tempSettings.prefix}{tempSettings.sequenceNumber}</div>
                  </div>
                )}
              </div>
              <div className="aa-cpi-settings-card">
                <div className="aa-cpi-settings-row">
                  <div>
                    <div className="aa-cpi-settings-title">Show Item Image on Invoice</div>
                    <div className="aa-cpi-settings-desc">This will apply to all vouchers except for Payment In and Payment Out</div>
                  </div>
                  <label className="aa-cpi-toggle">
                    <input type="checkbox" checked={tempSettings.showItemImage}
                      onChange={e => setTempSettings(p => ({...p, showItemImage: e.target.checked}))} />
                    <span className="aa-cpi-toggle-slider" />
                  </label>
                </div>
              </div>
              <div className="aa-cpi-settings-card">
                <div className="aa-cpi-settings-row">
                  <div>
                    <div className="aa-cpi-settings-title">Price History <span className="aa-cpi-new-badge">New</span></div>
                    <div className="aa-cpi-settings-desc">Show last 5 sales / purchase prices of the item for the selected party in invoice</div>
                  </div>
                  <label className="aa-cpi-toggle">
                    <input type="checkbox" checked={tempSettings.priceHistory}
                      onChange={e => setTempSettings(p => ({...p, priceHistory: e.target.checked}))} />
                    <span className="aa-cpi-toggle-slider" />
                  </label>
                </div>
              </div>
            </div>
            <div className="aa-cpi-modal-footer">
              <button className="aa-cpi-btn-cancel" onClick={() => setShowSettingsModal(false)}>Cancel</button>
              <button className="aa-cpi-btn-save" onClick={() => { setLocalSettings({...tempSettings}); setShowSettingsModal(false); }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Tax Select for line items (select element) ────────────────────────────────
const TAX_LINE_OPTIONS = ["None", "GST 5%", "GST 12%", "GST 18%", "GST 28%"];

const TaxSelectInline: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <select
    className="aa-cpi-tax-select"
    value={value}
    onChange={e => onChange(e.target.value)}
  >
    {TAX_LINE_OPTIONS.map(opt => (
      <option key={opt} value={opt}>{opt}</option>
    ))}
  </select>
);

// ── Tax Dropdown helper (for charges) ─────────────────────────────────────────
const TAX_OPTIONS = ["No Tax Applicable", "GST 5%", "GST 12%", "GST 18%", "GST 28%"];

const TaxDropdown: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="aa-cpi-tax-dropdown">
      <button className="aa-cpi-tax-btn" onClick={() => setOpen(s => !s)}>
        {value} <IconChevronDown />
      </button>
      {open && (
        <div className="aa-cpi-tax-menu">
          {TAX_OPTIONS.map(opt => (
            <button key={opt} className={`aa-cpi-tax-opt${value === opt ? " active" : ""}`}
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