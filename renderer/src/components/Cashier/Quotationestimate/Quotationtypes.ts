// ─── Shared Types for Quotation Module ────────────────────────────────────────

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

export interface QuotationData {
  id: string;
  quotationNo: number;
  quotationDate: string;
  party: Party | null;
  billItems: BillItem[];
  additionalCharges: AdditionalCharge[];
  discountType: "Discount After Tax" | "Discount Before Tax";
  discountPct: number;
  discountAmt: number;
  roundOff: "none" | "+Add" | "-Reduce";
  roundOffAmt: number;
  notes: string;
  termsConditions: string;
  eWayBillNo: string;
  challanNo: string;
  financedBy: string;
  salesman: string;
  emailId: string;
  warrantyPeriod: string;
  validFor: number;
  validityDate: string;
  showDueDate: boolean;
  status: "Open" | "Closed";
  createdAt: string;
}

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

// localStorage helpers
export function getNextQuotationNo(): number {
  const quotations: QuotationData[] = JSON.parse(localStorage.getItem("quotations") || "[]");
  if (quotations.length === 0) return 1;
  return Math.max(...quotations.map((q) => q.quotationNo)) + 1;
}

export function saveQuotation(data: QuotationData): void {
  const quotations: QuotationData[] = JSON.parse(localStorage.getItem("quotations") || "[]");
  const idx = quotations.findIndex((q) => q.id === data.id);
  if (idx >= 0) {
    quotations[idx] = data;
  } else {
    quotations.unshift(data);
  }
  localStorage.setItem("quotations", JSON.stringify(quotations));
}

export function getQuotationById(id: string): QuotationData | null {
  const quotations: QuotationData[] = JSON.parse(localStorage.getItem("quotations") || "[]");
  return quotations.find((q) => q.id === id) || null;
}

export function getParties(): Party[] {
  return JSON.parse(localStorage.getItem("parties") || "[]");
}

export function getItems(): Item[] {
  return JSON.parse(localStorage.getItem("items") || "[]");
}

export function formatCurrency(n: number): string {
  return "₹ " + n.toLocaleString("en-IN");
}

export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function fmtDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}