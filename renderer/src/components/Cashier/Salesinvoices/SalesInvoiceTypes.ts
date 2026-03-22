// ─── Sales Invoice Types ──────────────────────────────────────────────────────

export interface Party {
  id: number;
  name: string;
  mobile: string;
  balance: number;
  email?: string;
  gstin?: string;
  billingAddress?: string;
  shippingAddress?: string;
  category?: string;
  type?: string;
}

export interface Item {
  id: number;
  name: string;
  itemCode?: string;
  salesPrice: number;
  purchasePrice?: number;
  unit?: string;
  hsnCode?: string;
  category?: string;
  ProductStock?: {
    openingStock: number;
    currentStock: number;   // ← live balance after all transactions
  }[];
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

export interface AdditionalCharge {
  id: string;
  label: string;
  amount: number;
  taxLabel: string;
}

export interface SalesInvoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  party: Party | null;
  shipTo: Party | null;
  showDueDate: boolean;
  paymentTermsDays: number;
  dueDate: string;
  eWayBillNo: string;
  challanNo: string;
  financedBy: string;
  salesman: string;
  emailId: string;
  warrantyPeriod: string;
  // ── Extra optional meta fields (controlled by InvoiceBuilder) ──────────────
  poNumber?: string;
  vehicleNo?: string;
  dispatchedThrough?: string;
  transportName?: string;
  /** key→value map for custom fields defined in InvoiceBuilder, e.g. { "abc": "some value" } */
  customFieldValues?: Record<string, string>;
  /** Payment details (ref no, bank, card type etc.) based on payment mode */
  paymentDetails?: {
    method: string; amount: number;
    refNo?: string; chequeDate?: string; authNo?: string;
    bankName?: string; cardType?: string; branchName?: string;
  };
  /** Finance/EMI details */
  financeDetails?: {
    enabled: boolean;
    financerName?: string; loanRefNo?: string; loanAmount?: number;
    emi?: number; emiCount?: number; extraEmi?: number; extraEmiCount?: number;
    dbdCharges?: number; processingFee?: number;
    agentName?: string; agentContact?: string; reference?: string;
  };
  billItems: BillItem[];
  additionalCharges: AdditionalCharge[];
  discountType: "Discount After Tax" | "Discount Before Tax";
  discountPct: number;
  discountAmt: number;
  applyTCS: boolean;
  tcsRate: number;
  tcsLabel: string;
  tcsBase: "Total Amount" | "Taxable Amount";
  roundOff: "none" | "+Add" | "-Reduce";
  roundOffAmt: number;
  amountReceived: number;
  paymentMethod: string;
  notes: string;
  termsConditions: string;
  showColumns: { pricePerItem: boolean; quantity: boolean };
  status: "Paid" | "Unpaid" | "Partially Paid";
  createdAt: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const TCS_RATES = [
  { label: "1.0% Liquor of alcoholic nature, made for consumption by humans", rate: 1.0 },
  { label: "1.0% Scrap", rate: 1.0 },
  { label: "1.0% Minerals like lignite, coal and iron ore", rate: 1.0 },
  { label: "1.0% Purchase of Motor vehicle exceeding Rs.10 lakh", rate: 1.0 },
  { label: "2.0% Parking lot, Toll Plaza and Mining and Quarrying", rate: 2.0 },
  { label: "2.5% Timber wood under a forest leased", rate: 2.5 },
  { label: "2.5% Forest produce other than Tendu leaves and timber", rate: 2.5 },
  { label: "5.0% Tendu leaves", rate: 5.0 },
  { label: "0.1% 206C(IH) turnover > 1Cr", rate: 0.1 },
  { label: "1.0% 206C(IH) turnover > 1Cr (Without PAN)", rate: 1.0 },
];

export const TAX_OPTIONS = [
  { label: "None", rate: 0 },
  { label: "GST 5%", rate: 5 },
  { label: "GST 12%", rate: 12 },
  { label: "GST 18%", rate: 18 },
  { label: "GST 28%", rate: 28 },
  { label: "IGST 5%", rate: 5 },
  { label: "IGST 12%", rate: 12 },
  { label: "IGST 18%", rate: 18 },
  { label: "IGST 28%", rate: 28 },
];

export const CHARGE_TAX_OPTIONS = [
  "No Tax Applicable",
  "GST 5%",
  "GST 12%",
  "GST 18%",
  "GST 28%",
];

export const PAYMENT_METHODS = [
  "Cash",
  "UPI",
  "Card",
  "Netbanking",
  "Bank Transfer",
  "Cheque",
];

// ─── Utility Functions ────────────────────────────────────────────────────────

export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function fmtDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function calcBillItemAmount(item: BillItem): number {
  const base = item.qty * item.price;
  const discPct = base * (item.discountPct / 100);
  const discAmt = item.discountAmt;
  const afterDisc = base - discPct - discAmt;
  const tax = afterDisc * (item.taxRate / 100);
  return Math.round((afterDisc + tax) * 100) / 100;
}

const DEFAULT_TERMS = `1. Goods once sold will not be taken back or exchanged after 7 days`;

export function makeBlankInvoice(nextNo: string): SalesInvoice {
  const today = todayStr();

  return {
    id: `si-${Date.now()}`,
    invoiceNo: nextNo,
    invoiceDate: today,
    party: null,
    shipTo: null,
    showDueDate: false,
    paymentTermsDays: 30,
    dueDate: addDays(today, 30),
    eWayBillNo: "",
    challanNo: "",
    financedBy: "",
    salesman: "",
    emailId: "",
    warrantyPeriod: "",
    poNumber: "",
    vehicleNo: "",
    dispatchedThrough: "",
    transportName: "",
    customFieldValues: {},
    billItems: [],
    additionalCharges: [],
    discountType: "Discount After Tax",
    discountPct: 0,
    discountAmt: 0,
    applyTCS: false,
    tcsRate: 0,
    tcsLabel: "",
    tcsBase: "Taxable Amount",
    roundOff: "none",
    roundOffAmt: 0,
    amountReceived: 0,
    paymentMethod: "Cash",
    notes: "",
    termsConditions: DEFAULT_TERMS,
    showColumns: { pricePerItem: true, quantity: true },
    status: "Unpaid",
    createdAt: today,
  };
}