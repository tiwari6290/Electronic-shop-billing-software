// ─── Tax Options ──────────────────────────────────────────────────────────────

export const TAX_OPTIONS: { label: string; rate: number }[] = [
  { label: "None",    rate: 0  },
  { label: "GST 5%",  rate: 5  },
  { label: "GST 12%", rate: 12 },
  { label: "GST 18%", rate: 18 },
  { label: "GST 28%", rate: 28 },
];

export const DC_CHARGE_TAX_OPTIONS = [
  "No Tax Applicable", "GST 5%", "GST 12%", "GST 18%", "GST 28%",
];

export const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

// ─── Party / Shipping ─────────────────────────────────────────────────────────

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
  type: string;
  balance: number;
  gstin?: string;
  billingAddress?: string;
  shippingAddresses?: ShippingAddress[];
}

export type DCParty = Party;

// ─── Item / Bill Item ─────────────────────────────────────────────────────────

export interface DCItem {
  id: number;
  name: string;
  itemCode: string;
  hsn?: string;
  stock?: string;
  salesPrice: number;
  purchasePrice: number;
  unit: string;
  category?: string;
}

export interface BillItem {
  rowId: string;
  itemId: number;
  name: string;
  description: string;
  hsn: string;
  qty: number;
  unit: string;
  price: number;
  discountPct: number;
  discountAmt: number;
  taxLabel: string;
  taxRate: number;
  amount: number;
}

export type DCBillItem = BillItem;

export function calcItemAmount(item: BillItem): number {
  const base = item.qty * item.price
    - (item.qty * item.price * item.discountPct / 100)
    - item.discountAmt;
  return base + base * item.taxRate / 100;
}

// ─── Additional Charge ────────────────────────────────────────────────────────

export interface AdditionalCharge {
  id: string;
  label: string;
  amount: number;
  taxLabel: string;
  taxRate: number;
}

export type DCAdditionalCharge = AdditionalCharge;

// ─── Bank Account ─────────────────────────────────────────────────────────────

export interface DCBankAccount {
  accountNumber: string;
  reEnterAccountNumber: string;
  ifscCode: string;
  bankBranchName: string;
  accountHolderName: string;
  upiId: string;
}

// ─── Delivery Challan ─────────────────────────────────────────────────────────

export type DCStatus = "Open" | "Closed" | "Cancelled";

export interface DeliveryChallan {
  id: string;
  challanNo: number;
  prefix: string;
  challanDate: string;
  party: Party | null;
  shipTo: ShippingAddress | null;
  billItems: BillItem[];
  additionalCharges: AdditionalCharge[];
  discountType: "Discount After Tax" | "Discount Before Tax";
  discountPct: number;
  discountAmt: number;
  roundOff: "none" | "+Add" | "-Reduce";
  roundOffAmt: number;
  notes: string;
  termsConditions: string;
  bankAccount: DCBankAccount | null;
  eWayBillNo: string;
  challanRef: string;
  financedBy: string;
  salesman: string;
  emailId: string;
  warrantyPeriod: string;
  status: DCStatus;
  createdAt: string;
  showColumns: { pricePerItem: boolean; quantity: boolean };
}

export function calcTotal(challan: DeliveryChallan): number {
  const itemsTotal = challan.billItems.reduce((s, i) => {
    const base = i.qty * i.price - (i.qty * i.price * i.discountPct / 100) - i.discountAmt;
    return s + base + base * i.taxRate / 100;
  }, 0);
  const chargesTotal = challan.additionalCharges.reduce((s, c) => {
    return s + c.amount * (1 + (c.taxRate || 0) / 100);
  }, 0);
  const taxable = itemsTotal + chargesTotal;
  const disc = taxable * challan.discountPct / 100 + challan.discountAmt;
  return taxable - disc + challan.roundOffAmt;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const DC_KEY = "delivery_challans";
const PARTIES_KEY = "parties";
const ITEMS_KEY = "items";

export function getChallans(): DeliveryChallan[] {
  try { return JSON.parse(localStorage.getItem(DC_KEY) || "[]"); }
  catch { return []; }
}

export function saveChallan(c: DeliveryChallan): void {
  const all = getChallans();
  const idx = all.findIndex(x => x.id === c.id);
  if (idx >= 0) all[idx] = c; else all.unshift(c);
  localStorage.setItem(DC_KEY, JSON.stringify(all));
}

export function deleteChallan(id: string): void {
  localStorage.setItem(DC_KEY, JSON.stringify(getChallans().filter(c => c.id !== id)));
}

export function getChallanById(id: string): DeliveryChallan | null {
  return getChallans().find(c => c.id === id) ?? null;
}

export function getNextChallanNo(): number {
  const all = getChallans();
  return all.length === 0 ? 1 : Math.max(...all.map(c => c.challanNo)) + 1;
}

// ─── Party helpers ────────────────────────────────────────────────────────────

export function getParties(): Party[] {
  try { return JSON.parse(localStorage.getItem(PARTIES_KEY) || "[]"); }
  catch { return []; }
}

export const getDCParties = getParties;

export function saveParty(party: Party): void {
  const all = getParties();
  const idx = all.findIndex(p => p.id === party.id);
  if (idx >= 0) all[idx] = party; else all.push(party);
  localStorage.setItem(PARTIES_KEY, JSON.stringify(all));
}

// ─── Item helpers ─────────────────────────────────────────────────────────────

export function getDCItems(): DCItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(ITEMS_KEY) || "[]");
    if (raw.length > 0) return raw;
  } catch {}
  return [
    { id: 1, name: "BILLING SOFTWARE MOBILE APP",  itemCode: "",      stock: "",        salesPrice: 256,    purchasePrice: 0,     unit: "PCS" },
    { id: 2, name: "BILLING SOFTWARE WITH GST",    itemCode: "",      stock: "",        salesPrice: 369875, purchasePrice: 0,     unit: "PCS" },
    { id: 3, name: "BILLING SOFTWARE WITHOUT GST", itemCode: "",      stock: "",        salesPrice: 3556,   purchasePrice: 0,     unit: "PCS" },
    { id: 4, name: "GODREJ FRIDGE",                itemCode: "34567", stock: "144 ACS", salesPrice: 42000,  purchasePrice: 0,     unit: "ACS" },
    { id: 5, name: "HERIER AC",                    itemCode: "1234",  stock: "94 PCS",  salesPrice: 45000,  purchasePrice: 38000, unit: "PCS" },
    { id: 6, name: "HISENSE 32 INCH",              itemCode: "",      stock: "39 PCS",  salesPrice: 21000,  purchasePrice: 18000, unit: "PCS" },
  ];
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function fmtDisplayDate(d: string): string {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Blank Challan factory ────────────────────────────────────────────────────

export function makeBlankChallan(no: number): DeliveryChallan {
  return {
    id: `dc-${Date.now()}`,
    challanNo: no,
    prefix: "",
    challanDate: todayStr(),
    party: null,
    shipTo: null,
    billItems: [],
    additionalCharges: [],
    discountType: "Discount After Tax",
    discountPct: 0,
    discountAmt: 0,
    roundOff: "none",
    roundOffAmt: 0,
    notes: "",
    termsConditions:
      "1. Goods once sold will not be taken back or exchanged\n2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only",
    bankAccount: null,
    eWayBillNo: "",
    challanRef: "",
    financedBy: "",
    salesman: "",
    emailId: "",
    warrantyPeriod: "",
    status: "Open",
    createdAt: new Date().toISOString(),
    showColumns: { pricePerItem: true, quantity: true },
  };
}