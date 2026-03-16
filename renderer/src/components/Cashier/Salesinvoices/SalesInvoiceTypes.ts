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
  itemCode: string;
  stock: string;
  salesPrice: number;
  purchasePrice: number;
  unit: string;
  hsn?: string;
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

export interface AdditionalCharge {
  id: string;
  label: string;
  amount: number;
  taxLabel: string;
}

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
  "No Tax Applicable", "GST 5%", "GST 12%", "GST 18%", "GST 28%",
];

export const PAYMENT_METHODS = ["Cash", "UPI", "Card", "Netbanking", "Bank Transfer", "Cheque"];

export interface SalesInvoice {
  id: string;
  invoiceNo: number;
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

// ── localStorage helpers ──────────────────────────────────────────────────────
export function getNextInvoiceNo(): number {
  const invoices: SalesInvoice[] = JSON.parse(localStorage.getItem("salesInvoices") || "[]");
  if (invoices.length === 0) return 1;
  return Math.max(...invoices.map((i) => i.invoiceNo)) + 1;
}

export function saveSalesInvoice(data: SalesInvoice): void {
  const invoices: SalesInvoice[] = JSON.parse(localStorage.getItem("salesInvoices") || "[]");
  const idx = invoices.findIndex((i) => i.id === data.id);
  if (idx >= 0) invoices[idx] = data;
  else invoices.unshift(data);
  localStorage.setItem("salesInvoices", JSON.stringify(invoices));
}

export function getSalesInvoiceById(id: string): SalesInvoice | null {
  const invoices: SalesInvoice[] = JSON.parse(localStorage.getItem("salesInvoices") || "[]");
  return invoices.find((i) => i.id === id) || null;
}

export function getParties(): Party[] {
  return JSON.parse(localStorage.getItem("parties") || "[]");
}

export function getItems(): Item[] {
  const defaults: Item[] = [
    { id: 1, name: "BILLING SOFTWARE MOBILE APP", itemCode: "-", stock: "-", salesPrice: 256, purchasePrice: 0, unit: "PCS", hsn: "" },
    { id: 2, name: "BILLING SOFTWARE WITH GST", itemCode: "-", stock: "-", salesPrice: 369875, purchasePrice: 0, unit: "PCS", hsn: "" },
    { id: 3, name: "BILLING SOFTWARE WITHOUT GST", itemCode: "-", stock: "-", salesPrice: 3556, purchasePrice: 0, unit: "PCS", hsn: "" },
    { id: 4, name: "GODREJ FRIDGE", itemCode: "34567", stock: "143 ACS", salesPrice: 42000, purchasePrice: 0, unit: "ACS", hsn: "" },
    { id: 5, name: "HERIER AC", itemCode: "1234", stock: "93 PCS", salesPrice: 45000, purchasePrice: 38000, unit: "PCS", hsn: "" },
    { id: 6, name: "HISENSE 32 INCH", itemCode: "-", stock: "39 PCS", salesPrice: 21000, purchasePrice: 18000, unit: "PCS", hsn: "" },
  ];
  const stored = JSON.parse(localStorage.getItem("items") || "[]");
  return stored.length > 0 ? stored : defaults;
}

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
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function calcBillItemAmount(item: BillItem): number {
  const base = item.qty * item.price;
  const discPct = base * (item.discountPct / 100);
  const discAmt = item.discountAmt;
  const afterDisc = base - discPct - discAmt;
  const tax = afterDisc * (item.taxRate / 100);
  return Math.round((afterDisc + tax) * 100) / 100;
}

const DEFAULT_TERMS = `1. Goods once sold will not be taken back or exchanged
2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only`;

export function makeBlankInvoice(nextNo: number): SalesInvoice {
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
