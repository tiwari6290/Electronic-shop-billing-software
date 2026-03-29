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
  baseSalesPrice?: number;           // ← PRE-TAX base price (always use this on invoice rows)
  salesPriceInclTax?: boolean;       // ← true if salesPrice was entered incl. GST
  salesDiscountPercent?: number;     // ← default discount % set on the item
  purchasePrice?: number;
  unit?: string;
  hsnCode?: string;
  category?: string;
  gstRate?: string;                  // ← GST rate stored as string: "18", "5", etc.
  ProductStock?: {
    openingStock: number;
    currentStock: number;
  }[];
}

export interface BillItem {
  rowId: string;
  itemId: number | undefined;
  name: string;
  description: string;
  hsn: string;
  qty: number;
  unit: string;
  /**
   * ALWAYS the PRE-TAX base price per unit.
   * GST invoice law: price is the base, tax is computed ON TOP of it.
   * This value comes from item.baseSalesPrice (preferred) or item.salesPrice.
   */
  price: number;
  discountPct: number;
  discountAmt: number;
  taxLabel: string;
  taxRate: number;
  /**
   * Final line total = taxable + tax
   * Where: taxable = (qty × price) − discount
   *        tax     = taxable × taxRate%
   */
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
  poNumber?: string;
  vehicleNo?: string;
  dispatchedThrough?: string;
  transportName?: string;
  customFieldValues?: Record<string, string>;
  snapshotMetaFields?: {
    showSalesman?: boolean;
    showVehicle?: boolean;
    showChallan?: boolean;
    showFinancedBy?: boolean;
    showWarranty?: boolean;
    showEwayBill?: boolean;
    showPO?: boolean;
    showDispatchedThrough?: boolean;
    showTransportName?: boolean;
    showEmailId?: boolean;
    customFieldLabels?: string[];
  } | null;
  paymentDetails?: {
    method: string; amount: number;
    refNo?: string; chequeDate?: string; authNo?: string;
    bankName?: string; cardType?: string; branchName?: string;
  };
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
  { label: "GST 5%",   rate: 5  },
  { label: "GST 12%",  rate: 12 },
  { label: "GST 18%",  rate: 18 },
  { label: "GST 28%",  rate: 28 },
  { label: "IGST 5%",  rate: 5  },
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

/**
 * ════════════════════════════════════════════════════════════════
 * LINE-ITEM AMOUNT CALCULATION (Mandatory GST Invoice Order)
 * ════════════════════════════════════════════════════════════════
 *
 * This is the calculation for the PER-LINE discount in SIItemsTable.
 * The base price on the invoice row is ALWAYS the pre-tax base price.
 *
 * Step 1 — lineGross   = qty × price          (price is ALWAYS pre-tax base)
 * Step 2 — discAmt     = lineGross × discPct% OR flat discountAmt (not both)
 * Step 3 — taxableAmt  = lineGross − discAmt  ← GST is ALWAYS on this
 * Step 4 — taxAmt      = taxableAmt × taxRate%
 * Step 5 — lineTotal   = taxableAmt + taxAmt
 *
 * Example: 1 unit × ₹84.75 base price, 5% per-line discount, 18% GST
 *   lineGross  = 84.75
 *   discAmt    = 84.75 × 5%  = 4.24
 *   taxable    = 84.75 − 4.24 = 80.51
 *   taxAmt     = 80.51 × 18% = 14.49
 *   lineTotal  = 80.51 + 14.49 = 95.00
 *
 * NOTE — Invoice-level "Add Discount" is SEPARATE:
 *   It applies on the GST-inclusive preTotalAmount (sum of all lineTotals).
 *   That reduction is then reverse-calculated to split into taxable + GST.
 *   Example: total=100, disc=₹10 → afterDisc=90
 *     Reverse: taxable = 90/1.18 = 76.27, GST = 90−76.27 = 13.73
 *   The base price shown in the table (84.75) does NOT change.
 */
export function calcBillItemAmount(item: BillItem): number {
  const lineGross = item.qty * item.price;
  const discByPct = lineGross * (item.discountPct / 100);
  // Flat ₹ discount only applies when no % discount is set
  const discFlat  = item.discountPct > 0 ? 0 : item.discountAmt;
  const taxable   = Math.max(0, lineGross - discByPct - discFlat);
  const taxAmt    = taxable * (item.taxRate / 100);
  return Math.round((taxable + taxAmt) * 100) / 100;
}

/**
 * Return the taxable portion of a bill item (pre-tax, post-line-discount).
 */
export function calcBillItemTaxable(item: BillItem): number {
  const lineGross = item.qty * item.price;
  const discByPct = lineGross * (item.discountPct / 100);
  const discFlat  = item.discountPct > 0 ? 0 : item.discountAmt;
  return Math.max(0, lineGross - discByPct - discFlat);
}

/**
 * Return the tax amount for a single bill item.
 * Tax is always computed on the taxable amount (post-discount), not on gross.
 */
export function calcBillItemTax(item: BillItem): number {
  return Math.round(calcBillItemTaxable(item) * (item.taxRate / 100) * 100) / 100;
}

/**
 * Parse GST rate string from backend ("18", "18%", "GST 18%", "Exempted", null)
 * Returns a numeric rate (0 if exempted/null/unrecognised).
 */
export function parseGstRate(gstRate?: string | null): number {
  if (!gstRate) return 0;
  const match = String(gstRate).match(/(\d+(\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

/**
 * Build the tax label string displayed in the Tax dropdown.
 * e.g. rate=18 → "GST 18%"
 */
export function buildTaxLabel(rate: number): string {
  if (rate <= 0) return "None";
  return `GST ${rate}%`;
}

/**
 * ════════════════════════════════════════════════════════════════
 * INVOICE-LEVEL DISCOUNT — REVERSE CALCULATION
 * ════════════════════════════════════════════════════════════════
 *
 * When an invoice-level discount is applied on the GST-inclusive total,
 * the reduced total must be reverse-split into taxable and GST components.
 *
 * For a single tax rate R%:
 *   gstInclusiveTotal = taxable × (1 + R/100)
 *   → taxable = gstInclusiveTotal / (1 + R/100)
 *   → gstAmt  = gstInclusiveTotal − taxable
 *
 * For mixed rates (multiple items at different rates), we scale each
 * group's taxable and tax proportionally using a discount scale factor:
 *   discountScaleFactor = afterDiscTotal / preTotalAmount
 *   adjustedGroupTaxable = groupTaxable × discountScaleFactor
 *   adjustedGroupTax     = groupTax     × discountScaleFactor
 *
 * Result: adjustedTaxableSum + adjustedTaxSum = afterDiscTotal  ✓
 *
 * @param preTotalAmount  - GST-inclusive total before invoice discount
 * @param afterDiscTotal  - GST-inclusive total after invoice discount
 * @param itemsTaxableSum - sum of per-line taxable amounts (before invoice disc)
 * @param itemsTaxSum     - sum of per-line tax amounts (before invoice disc)
 * @returns { adjustedTaxable, adjustedTax }
 */
export function reverseCalcAfterDiscount(
  preTotalAmount: number,
  afterDiscTotal: number,
  itemsTaxableSum: number,
  itemsTaxSum: number,
): { adjustedTaxable: number; adjustedTax: number } {
  if (preTotalAmount <= 0) return { adjustedTaxable: 0, adjustedTax: 0 };
  const scaleFactor       = afterDiscTotal / preTotalAmount;
  const adjustedTaxable   = Math.round(itemsTaxableSum * scaleFactor * 100) / 100;
  const adjustedTax       = Math.round(itemsTaxSum     * scaleFactor * 100) / 100;
  return { adjustedTaxable, adjustedTax };
}
const DEFAULT_TERMS = `
Diclamer:-
1. Delivery has been received in full satisfaction and in good condition.
2. Goods once sold will not be taken back or exchanged under any circumstances.
3. For any type of manufacturing defect or complaint, please contact the respective manufacturer directly.
4. The dealer shall not be responsible for any complaints or issues after the delivery of goods.
5. Warranty, if applicable, is strictly provided by the manufacturer as per their terms and conditions.
6. No guarantee or warranty is provided by the seller unless explicitly mentioned.
7. Cheque return charges of Rs. 200/- will be applicable along with any legal liabilities.
8. Interest may be charged on overdue payments as per applicable norms.
9. All payments once made are non-refundable.
10. Goods are dispatched at the buyer’s risk unless otherwise specified.
11. Any damage or shortage must be reported within 24 hours of delivery.
12. Disputes, if any, shall be subject to Kolkata jurisdiction only.
13. By purchasing, the buyer agrees to all the above terms and conditions.
`;

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
    snapshotMetaFields: null,
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