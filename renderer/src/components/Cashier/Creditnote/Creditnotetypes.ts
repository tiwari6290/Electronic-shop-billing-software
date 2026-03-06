// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface ShippingAddress {
  id: string;
  name: string;
  street: string;
  state: string;
  pincode: string;
  city: string;
}

export interface Party {
  id: number;
  name: string;
  category: string;
  mobile: string;
  type: "Customer" | "Supplier" | "Both";
  balance: number;
  email?: string;
  gstin?: string;
  billingAddress?: string;
  shippingAddresses?: ShippingAddress[];
}

export interface InvoiceItem {
  rowId: string;
  itemId?: string;
  name: string;
  description?: string;
  hsn?: string;
  qty: number;
  unit: string;
  price: number;
  discountPct: number;
  discountAmt: number;
  taxLabel: string;
  taxRate: number;
  amount: number;
}

export interface LinkedSalesInvoice {
  id: string;
  invoiceNo: number | string;
  invoiceDate: string;
  party: { name: string } | null;
  billItems: InvoiceItem[];
  additionalCharges: AdditionalCharge[];
  discountPct: number;
  discountAmt: number;
  notes?: string;
  termsConditions?: string;
  amountReceived: number;
  status: string;
}

export interface AdditionalCharge {
  id: string;
  label: string;
  amount: number;
  taxLabel: string;
  taxRate: number;
}

export interface CreditNote {
  id: string;
  creditNoteNo: number;
  creditNoteDate: string;
  party: Party | null;
  shipFrom: ShippingAddress | null;
  linkedInvoiceId: string | null;
  billItems: InvoiceItem[];
  additionalCharges: AdditionalCharge[];
  discountType: "after-tax" | "before-tax";
  discountPct: number;
  discountAmt: number;
  autoRoundOff: boolean;
  roundOffAmt: number;
  amountPaid: number;
  paymentMethod: string;
  markFullyPaid: boolean;
  notes: string;
  termsConditions: string;
  eWayBillNo: string;
  challanNo: string;
  financedBy: string;
  salesman: string;
  emailId: string;
  warrantyPeriod: string;
  status: "Paid" | "Unpaid" | "Partially Paid" | "Refunded";
  prefix: string;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

export function getParties(): Party[] {
  try {
    const raw = localStorage.getItem("parties");
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveParty(party: Party) {
  const parties = getParties();
  const idx = parties.findIndex(p => p.id === party.id);
  if (idx >= 0) parties[idx] = party;
  else parties.push(party);
  localStorage.setItem("parties", JSON.stringify(parties));
}

export function getSalesInvoices(): LinkedSalesInvoice[] {
  try {
    const raw = localStorage.getItem("salesInvoices");
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function getCreditNotes(): CreditNote[] {
  try {
    const raw = localStorage.getItem("creditNotes");
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveCreditNote(cn: CreditNote) {
  const all = getCreditNotes();
  const idx = all.findIndex(x => x.id === cn.id);
  if (idx >= 0) all[idx] = cn;
  else all.unshift(cn);
  localStorage.setItem("creditNotes", JSON.stringify(all));
}

export function getNextCreditNoteNo(): number {
  const all = getCreditNotes();
  if (all.length === 0) return 1;
  return Math.max(...all.map(x => x.creditNoteNo)) + 1;
}

export function getCreditNotePrefix(): string {
  return localStorage.getItem("creditNotePrefix") || "";
}

export function saveCreditNotePrefix(prefix: string) {
  localStorage.setItem("creditNotePrefix", prefix);
}

export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function fmtDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function newBlankCreditNote(): CreditNote {
  return {
    id: `cn-${Date.now()}`,
    creditNoteNo: getNextCreditNoteNo(),
    creditNoteDate: todayStr(),
    party: null,
    shipFrom: null,
    linkedInvoiceId: null,
    billItems: [],
    additionalCharges: [],
    discountType: "after-tax",
    discountPct: 0,
    discountAmt: 0,
    autoRoundOff: false,
    roundOffAmt: 0,
    amountPaid: 0,
    paymentMethod: "Cash",
    markFullyPaid: false,
    notes: "",
    termsConditions: "1. Goods once sold will not be taken back or exchanged\n2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only",
    eWayBillNo: "",
    challanNo: "",
    financedBy: "",
    salesman: "",
    emailId: "",
    warrantyPeriod: "",
    status: "Unpaid",
    prefix: getCreditNotePrefix(),
  };
}

export const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra & Nagar Haveli and Daman & Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

export const TAX_OPTIONS = [
  { label: "None", rate: 0 },
  { label: "GST 0%", rate: 0 },
  { label: "GST 5%", rate: 5 },
  { label: "GST 12%", rate: 12 },
  { label: "GST 18%", rate: 18 },
  { label: "GST 28%", rate: 28 },
];

export const PAYMENT_METHODS = ["Cash", "UPI", "Bank Transfer", "Cheque", "Card", "Net Banking"];

export function calcItemAmount(item: InvoiceItem): number {
  const base = item.qty * item.price;
  const afterDiscount = base - (base * item.discountPct / 100) - item.discountAmt;
  return Math.round((afterDiscount + afterDiscount * item.taxRate / 100) * 100) / 100;
}

export function calcTotal(cn: Partial<CreditNote>): number {
  const items = cn.billItems || [];
  const charges = cn.additionalCharges || [];
  const subtotal = items.reduce((s, i) => s + calcItemAmount(i), 0);
  const chargesTotal = charges.reduce((s, c) => s + c.amount * (1 + c.taxRate / 100), 0);
  const taxable = subtotal + chargesTotal;
  const discVal = taxable * (cn.discountPct || 0) / 100 + (cn.discountAmt || 0);
  const afterDisc = taxable - discVal;
  const rounded = afterDisc + (cn.roundOffAmt || 0);
  return Math.round(rounded * 100) / 100;
}

// Get invoices NOT already linked to another credit note (excluding current one)
export function getAvailableInvoicesForParty(
  partyName: string,
  currentCreditNoteId: string
): LinkedSalesInvoice[] {
  const allInvoices = getSalesInvoices();
  const allCreditNotes = getCreditNotes();
  // IDs already used by OTHER credit notes
  const usedIds = allCreditNotes
    .filter(cn => cn.id !== currentCreditNoteId && cn.linkedInvoiceId)
    .map(cn => cn.linkedInvoiceId as string);

  return allInvoices.filter(inv => {
    const matchParty = inv.party?.name?.toLowerCase() === partyName.toLowerCase();
    const notUsed = !usedIds.includes(inv.id);
    return matchParty && notUsed;
  });
}