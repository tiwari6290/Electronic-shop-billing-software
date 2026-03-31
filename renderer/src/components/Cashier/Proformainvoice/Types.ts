// ─── Shared Types ─────────────────────────────────────────────────────────────

// Matches the shape saved by Createparty.tsx into localStorage "parties"
export interface Party {
  id: number;
  name: string;
  mobile: string;
  category: string;
  type: "Customer" | "Supplier";
  balance: number;
  // optional extended fields from Createparty
  email?: string;
  gstin?: string;
  panNumber?: string;
  billingAddress?: string;
  shippingAddress?: string;
  creditPeriod?: string;
  creditLimit?: string;
}

export interface ShippingAddress {
  id: number;
  name: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface ItemProduct {
  id: number;
  name: string;
  itemCode: string;
  stock: string;
  salesPrice: number;
  category?: string;
  purchasePrice: number;
  unit: string;
  hsn: string;
  taxRate: number;
}

export interface InvoiceLineItem {
  id: number;
  item: ItemProduct;
  description: string;
  qty: number;
  unit: string;
  pricePerItem: number;
  discountPct: number;
  discountAmt: number;
  taxRate: number;
  amount: number;
}

export interface AdditionalCharge {
  id: number;
  label: string;
  amount: number;
  taxType: string;
}

export interface BankAccount {
  id: number;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  holderName: string;
  upiId: string;
  balance?: number;
}

export interface Invoice {
  id: number;
  date: string;
  proformaNumber: number;
  partyName: string;
  dueIn: string;
  amount: number;
  status: "Open" | "Closed";
  // Full data stored for edit/duplicate
  fullData?: FullInvoiceData;
}

// Complete invoice data shape — used for edit and duplicate
export interface FullInvoiceData {
  party: Party | null;
  invoiceDate: string;
  paymentTerms: number | "";
  expiryDate: string;
  showPaymentTerms: boolean;
  eWayBill: string;
  challanNo: string;
  financedBy: string;
  salesman: string;
  emailId: string;
  warrantyPeriod: string;
  lineItems: InvoiceLineItem[];
  notes: string;
  terms: string;
  showNotes: boolean;
  showTerms: boolean;
  charges: AdditionalCharge[];
  showCharges: boolean;
  discountType: "Discount After Tax" | "Discount Before Tax";
  discountPct: number;
  discountAmt: number;
  showDiscount: boolean;
  adjustType: "+ Add" | "- Reduce";
  adjustAmt: number;
  autoRound: boolean;
  totalAmount: number;
}

export interface QuickSettings {
  prefixEnabled: boolean;
  prefix: string;
  sequenceNumber: number;
  showItemImage: boolean;
  priceHistory: boolean;
}

// ── Helper: load parties from localStorage (mirrors Parties.tsx logic) ────────
const FALLBACK_PARTIES: Party[] = [
  { id: 1, name: "anando",            mobile: "0987643211", category: "-",        type: "Customer", balance: 82000 },
  { id: 2, name: "Cash Sale",         mobile: "9555780835", category: "-",        type: "Customer", balance: 0     },
  { id: 3, name: "eghwh",             mobile: "7621583903", category: "Appliance",type: "Supplier", balance: -15000},
  { id: 4, name: "MONDAL ELECTRONIC", mobile: "7003236738", category: "-",        type: "Customer", balance: 0     },
  { id: 5, name: "ranjan",            mobile: "-",          category: "-",        type: "Customer", balance: 22400 },
];

export function loadPartiesFromStorage(): Party[] {
  try {
    const stored = JSON.parse(localStorage.getItem("parties") || "[]");
    return stored.length > 0 ? stored : FALLBACK_PARTIES;
  } catch {
    return FALLBACK_PARTIES;
  }
}

// ── Items (still static — not managed in uploaded files) ──────────────────────
export const SAMPLE_ITEMS: ItemProduct[] = [
  { id: 1, name: "BILLING SOFTWARE MOBILE APP",  itemCode: "-",    stock: "-",      salesPrice: 256,    purchasePrice: 0,     unit: "PCS", hsn: "",     taxRate: 0  },
  { id: 2, name: "BILLING SOFTWARE WITH GST",    itemCode: "-",    stock: "-",      salesPrice: 369875, purchasePrice: 0,     unit: "PCS", hsn: "",     taxRate: 18 },
  { id: 3, name: "BILLING SOFTWARE WITHOUT GST", itemCode: "-",    stock: "-",      salesPrice: 3556,   purchasePrice: 0,     unit: "PCS", hsn: "",     taxRate: 0  },
  { id: 4, name: "GODREJ FRIDGE",                itemCode: "34567",stock: "144 ACS",salesPrice: 42000,  purchasePrice: 0,     unit: "ACS", hsn: "8418", taxRate: 12 },
  { id: 5, name: "HERIER AC",                    itemCode: "1234", stock: "94 PCS", salesPrice: 45000,  purchasePrice: 38000, unit: "PCS", hsn: "8415", taxRate: 28 },
  { id: 6, name: "HISENSE 32 INCH",              itemCode: "-",    stock: "39 PCS", salesPrice: 21000,  purchasePrice: 18000, unit: "PCS", hsn: "8528", taxRate: 18 },
];

export const SAMPLE_BANK_ACCOUNTS: BankAccount[] = [
  { id: 1, accountNumber: "4534534566663", ifsc: "HDFC0000008", bankName: "HDFC Bank", holderName: "4t4t", upiId: "", balance: 254780 },
];