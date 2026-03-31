// ─── Shared Types for Quotation Module ────────────────────────────────────────

import api from "@/lib/axios";

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
  /** Price as entered by the user (may be inclusive of GST if salesPriceInclTax=true) */
  salesPrice: number;
  /** Always the pre-tax base price — never null after apiGetItems mapping */
  baseSalesPrice: number;
  purchasePrice: number;
  unit: string;
  hsn?: string;
  category?: string;
  /** GST rate as a number, e.g. 18 for 18% */
  gstRate: number;
  taxLabel: string;
  /** Default discount % stored on the product — pre-filled when item is added to bill */
  salesDiscountPercent: number;
}

// ─── Core calculation helper ──────────────────────────────────────────────────
/**
 * GST-standard line calculation:
 *   lineGross  = qty × price  (price must be the pre-tax base price)
 *   discountVal = discountPct > 0 ? lineGross × pct/100 : discountAmt
 *   taxable    = lineGross − discountVal
 *   tax        = taxable × taxRate/100
 *   amount     = taxable + tax
 *
 * Rule: discountPct wins if > 0; otherwise discountAmt is used.
 * GST is ALWAYS applied after discount.
 */
export interface CalcResult {
  lineGross: number;
  discountVal: number;
  taxable: number;
  taxAmt: number;
  amount: number;
}

export function calcBillItemAmount(item: {
  qty: number;
  price: number;
  discountPct: number;
  discountAmt: number;
  taxRate: number;
}): CalcResult {
  const lineGross  = parseFloat((item.qty * item.price).toFixed(2));
  const discountVal =
    item.discountPct > 0
      ? parseFloat(((lineGross * item.discountPct) / 100).toFixed(2))
      : parseFloat((item.discountAmt ?? 0).toFixed(2));
  const taxable  = parseFloat((lineGross - discountVal).toFixed(2));
  const taxAmt   = parseFloat(((taxable * item.taxRate) / 100).toFixed(2));
  const amount   = parseFloat((taxable + taxAmt).toFixed(2));
  return { lineGross, discountVal, taxable, taxAmt, amount };
}

export interface BillItem {
  rowId: string;
  itemId: number;
  name: string;
  description: string;
  hsn: string;
  qty: number;
  unit: string;
  /** Always the pre-tax base price — never GST-inclusive */
  price: number;
  discountPct: number;
  discountAmt: number;
  taxLabel: string;
  taxRate: number;
  /** Final line total = taxable + tax (after discount, inclusive of GST) */
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
  quotationNo: string;
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
  poNumber?:          string;
  vehicleNo?:         string;
  dispatchedThrough?: string;
  transportName?:     string;
  /** key→value map for custom fields defined in InvoiceBuilder, e.g. { "Job No": "123" } */
  customFieldValues?: Record<string, string>;
  validFor: number;
  validityDate: string;
  showDueDate: boolean;
  status: "Open" | "Closed";
  createdAt: string;
}

export const TAX_OPTIONS = [
  { label: "None",     rate: 0  },
  { label: "GST 5%",  rate: 5  },
  { label: "GST 12%", rate: 12 },
  { label: "GST 18%", rate: 18 },
  { label: "GST 28%", rate: 28 },
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

// ─── API Response Types ────────────────────────────────────────────────────────
export interface ApiQuotation {
  id: number;
  quotationNo: string;
  partyId: number;
  party?: {
    id: number;
    name: string;
    partyName: string;
    mobileNumber?: string;
    billingAddress?: string;
    shippingAddress?: string;
    gstin?: string;
    email?: string;
    openingBalance?: number;
  };
  quotationDate: string;
  validTill?: string | null;
  notes?: string;
  termsConditions?: string;
  ewayBillNo?: string;
  eWayBillNo?: string;
  challanNo?: string;
  financedBy?: string;
  salesman?: string;
  emailId?: string;
  warrantyPeriod?: string;
  subTotal: number;
  taxableAmount: number;
  discountAmount: number;
  additionalChargesTotal: number;
  taxAmount: number;
  roundOff: number;
  totalAmount: number;
  status: "OPEN" | "CONVERTED" | "CANCELLED";
  items: ApiQuotationItem[];
  additionalCharges?: ApiAdditionalCharge[];
  createdAt: string;
}

export interface ApiQuotationItem {
  id: number;
  quotationId: number;
  productId: number;
  product?: {
    id: number;
    name: string;
    unit?: string;
    hsnCode?: string;
    itemCode?: string;
    gstRate?: string | null;
    baseSalesPrice?: number | null;
    salesPriceInclTax?: boolean;
  };
  quantity: number;
  price: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export interface ApiAdditionalCharge {
  id: number;
  quotationId: number;
  name: string;
  amount: number;
}

export interface QuotationSettings {
  id?: number;
  prefix: string;
  sequenceNumber: number;
  branchCode?: string;
}

// ─── Quotation API ─────────────────────────────────────────────────────────────
export async function apiGetQuotations(params?: {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ApiQuotation[]> {
  const qs = new URLSearchParams();
  if (params?.search)    qs.set("search",    params.search);
  if (params?.status)    qs.set("status",    params.status);
  if (params?.startDate) qs.set("startDate", params.startDate);
  if (params?.endDate)   qs.set("endDate",   params.endDate);
  const query = qs.toString() ? `?${qs}` : "";
  const res = await api.get(`/quotations/${query}`);
  return res.data;
}

export async function apiGetQuotationById(id: number): Promise<ApiQuotation> {
  const res = await api.get(`/quotations/${id}`);
  return res.data;
}

export async function apiCreateQuotation(data: object): Promise<ApiQuotation> {
  const res = await api.post(`/quotations/`, data);
  return res.data;
}

export async function apiUpdateQuotation(id: number, data: object): Promise<ApiQuotation> {
  const res = await api.put(`/quotations/${id}`, data);
  return res.data;
}

export async function apiDeleteQuotation(id: number): Promise<void> {
  await api.delete(`/quotations/${id}`);
}

export async function apiDuplicateQuotation(id: number): Promise<ApiQuotation> {
  const res = await api.post(`/quotations/${id}/duplicate`);
  return res.data;
}

export async function apiConvertQuotationToInvoice(id: number): Promise<unknown> {
  const res = await api.post(`/quotations/${id}/convert`);
  return res.data;
}

export async function apiCloseQuotation(id: number): Promise<ApiQuotation> {
  const res = await api.put(`/quotations/${id}`, { status: "CONVERTED" });
  return res.data;
}

// ─── Settings API ──────────────────────────────────────────────────────────────
export async function apiGetQuotationSettings(): Promise<QuotationSettings> {
  const res = await api.get(`/quotations/settings/`);
  return res.data;
}

export async function apiSaveQuotationSettings(data: Partial<QuotationSettings>): Promise<QuotationSettings> {
  const res = await api.put(`/quotations/settings/`, data);
  return res.data;
}

// ─── Party & Product API ───────────────────────────────────────────────────────
export async function apiGetParties(): Promise<Party[]> {
  const res = await api.get(`/parties/`);
  const raw = res.data?.data ?? [];
  return raw.map((p: any) => ({
    id:              p.id,
    name:            p.partyName ?? p.name,
    mobile:          p.mobileNumber ?? p.mobile ?? "",
    balance:         p.openingBalance ?? p.balance ?? 0,
    email:           p.email,
    gstin:           p.gstin,
    billingAddress:  p.billingAddress,
    shippingAddress: p.shippingAddress,
    category:        p.partyCategory ?? p.category,
    type:            p.partyType ?? p.type,
  }));
}

export async function apiGetItems(): Promise<Item[]> {
  const res = await api.get(`/items/`);
  const raw = res.data?.data ?? [];
  return raw.map((p: any) => {
    const totalStock = (p.ProductStock ?? []).reduce(
      (s: number, ps: any) => s + (ps.currentStock ?? ps.openingStock ?? 0),
      0
    );

    // ── GST rate ────────────────────────────────────────────────────────────
    // DB stores gstRate as a string — may be "18" or "GST 18%" depending on
    // how the product was created. Strip all non-numeric chars before parsing
    // so both formats produce the correct number (e.g. 18).
    const gstRate = p.gstRate
      ? parseFloat(String(p.gstRate).replace(/[^0-9.]/g, "")) || 0
      : 0;

    // ── Base (pre-tax) price ─────────────────────────────────────────────────
    // Priority 1: baseSalesPrice column — backend stores this explicitly when
    //             the product was saved with salesPriceInclTax = true.
    // Priority 2: back-calculate from salesPrice by stripping GST:
    //             basePrice = salesPrice / (1 + gstRate / 100)
    // This guarantees baseSalesPrice is NEVER null in the frontend.
    const salesPrice = p.salesPrice ? Number(p.salesPrice) : 0;
    const baseSalesPrice =
      p.baseSalesPrice != null
        ? Number(p.baseSalesPrice)
        : gstRate > 0
          ? parseFloat((salesPrice / (1 + gstRate / 100)).toFixed(2))
          : salesPrice;

    // ── Default discount % ───────────────────────────────────────────────────
    // product.salesDiscountPercent is set in the product master.
    // Pre-fill this on the bill row so users don't have to type it every time.
    const salesDiscountPercent =
      p.salesDiscountPercent
        ? parseFloat(String(p.salesDiscountPercent)) || 0
        : 0;

    // Tax label shown in the TAX dropdown on the bill row
    const taxLabel = gstRate > 0 ? `GST ${gstRate}%` : "None";

    return {
      id:                   p.id,
      name:                 p.name,
      itemCode:             p.itemCode ?? "",
      stock:                totalStock.toString(),
      salesPrice,           // original price as stored (may be incl-tax)
      baseSalesPrice,       // always pre-tax — use this for calculations
      purchasePrice:        p.purchasePrice ? Number(p.purchasePrice) : 0,
      unit:                 p.unit ?? "",
      hsn:                  p.hsnCode ?? "",
      category:             p.category ?? "",
      gstRate,
      taxLabel,
      salesDiscountPercent,
    };
  });
}

// ─── Mapper: ApiQuotation → QuotationData (for edit/view) ─────────────────────
export function apiToFormData(q: ApiQuotation): QuotationData {
  const roundOff = Number(q.roundOff ?? 0);

  return {
    id:           String(q.id),
    quotationNo:  q.quotationNo ?? String(q.id),
    quotationDate: q.quotationDate?.split("T")[0] ?? todayStr(),

    party: q.party
      ? {
          id:              q.party.id,
          name:            q.party.partyName ?? (q.party as any).name ?? "",
          mobile:          q.party.mobileNumber ?? "",
          balance:         Number(q.party.openingBalance ?? 0),
          email:           q.party.email,
          gstin:           q.party.gstin,
          billingAddress:  q.party.billingAddress,
          shippingAddress: q.party.shippingAddress,
        }
      : null,

    billItems: (q.items ?? []).map((item): BillItem => {
      const qty         = Number(item.quantity ?? 0);
      const discountPct = Number(item.discount  ?? 0);
      const taxRate     = Number(item.taxRate    ?? 0);

      // Resolve base price — prefer product.baseSalesPrice if available
      const baseSalesPrice = item.product?.baseSalesPrice != null
        ? Number(item.product.baseSalesPrice)
        : null;
      const price = baseSalesPrice != null ? baseSalesPrice : Number(item.price ?? 0);

      // Recalculate from scratch using the canonical formula so stored `total`
      // is never blindly trusted (avoids GST-inclusive bugs from old data).
      const { discountVal, taxAmt, amount } = calcBillItemAmount({
        qty,
        price,
        discountPct,
        discountAmt: 0,   // API stores only discount% — flat amt always 0 on reload
        taxRate,
      });

      // Build tax label
      const taxLabel = taxRate > 0 ? `GST ${taxRate}%` : "None";

      return {
        rowId:       String(item.id),
        itemId:      item.productId,
        name:        item.product?.name ?? "",
        description: "",
        hsn:         item.product?.hsnCode ?? "",
        qty,
        unit:        item.product?.unit ?? "",
        price,
        discountPct,
        discountAmt: 0,
        taxLabel,
        taxRate,
        amount,
      };
    }),

    additionalCharges: (q.additionalCharges ?? []).map((c): AdditionalCharge => ({
      id:       String(c.id),
      label:    c.name,
      amount:   Number(c.amount ?? 0),
      taxLabel: "No Tax Applicable",
    })),

    discountType: "Discount After Tax",
    discountPct:  0,
    discountAmt:  Number(q.discountAmount ?? 0),

    roundOff:    roundOff > 0 ? "+Add" : roundOff < 0 ? "-Reduce" : "none",
    roundOffAmt: Math.abs(roundOff),

    notes:           q.notes           ?? "",
    termsConditions: q.termsConditions ?? "",
    eWayBillNo:      (q as any).ewayBillNo ?? (q as any).eWayBillNo ?? "",
    challanNo:       q.challanNo        ?? "",
    financedBy:      q.financedBy       ?? "",
    salesman:        q.salesman         ?? "",
    emailId:         q.emailId          ?? "",
    warrantyPeriod:  q.warrantyPeriod   ?? "",
    poNumber:          (q as any).poNumber          ?? "",
    vehicleNo:         (q as any).vehicleNo         ?? "",
    dispatchedThrough: (q as any).dispatchedThrough ?? "",
    transportName:     (q as any).transportName     ?? "",
    customFieldValues: (q as any).customFieldValues ?? {},

    validFor:     30,
    validityDate: q.validTill?.split("T")[0] ?? addDays(todayStr(), 30),
    showDueDate:  !!q.validTill,

    status:    q.status === "OPEN" ? "Open" : "Closed",
    createdAt: q.createdAt?.split("T")[0] ?? todayStr(),
  };
}

// ─── Mapper: QuotationData → API payload ──────────────────────────────────────
/**
 * All monetary values are derived fresh using calcBillItemAmount so the
 * payload is always consistent with the GST-standard formula — never stale.
 */
export function formDataToApiPayload(form: QuotationData, settings?: QuotationSettings) {
  // Per-item recalc (canonical formula)
  const itemsWithCalc = form.billItems.map((item) => {
    const calc = calcBillItemAmount(item);
    return { item, calc };
  });

  // Subtotal = sum of final line amounts (taxable + tax, after discount)
  const subtotal     = parseFloat(itemsWithCalc.reduce((s, { calc }) => s + calc.amount,    0).toFixed(2));
  const totalTaxAmt  = parseFloat(itemsWithCalc.reduce((s, { calc }) => s + calc.taxAmt,    0).toFixed(2));
  const totalDisc    = parseFloat(itemsWithCalc.reduce((s, { calc }) => s + calc.discountVal,0).toFixed(2));
  // taxableAmount = subtotal − tax (i.e. sum of all post-discount, pre-tax values)
  const taxableAmount = parseFloat((subtotal - totalTaxAmt).toFixed(2));

  const chargesTotal = parseFloat(form.additionalCharges.reduce((s, c) => s + c.amount, 0).toFixed(2));

  // Quotation-level discount (applied on top of item discounts)
  const discountAmount = form.discountPct > 0
    ? parseFloat(((subtotal * form.discountPct) / 100).toFixed(2))
    : parseFloat((form.discountAmt ?? 0).toFixed(2));

  const roundOffVal =
    form.roundOff === "+Add"    ?  form.roundOffAmt :
    form.roundOff === "-Reduce" ? -form.roundOffAmt : 0;

  const totalAmount = parseFloat((subtotal + chargesTotal - discountAmount + roundOffVal).toFixed(2));

  return {
    quotationNo:   form.quotationNo,
    partyId:       form.party?.id ?? null,
    branchCode:    settings?.branchCode ?? null,
    quotationDate: form.quotationDate,
    validTill:     form.showDueDate ? form.validityDate : null,
    notes:           form.notes,
    termsConditions: form.termsConditions,
    ewayBillNo:      form.eWayBillNo,
    challanNo:       form.challanNo,
    financedBy:      form.financedBy,
    salesman:        form.salesman,
    emailId:         form.emailId,
    warrantyPeriod:  form.warrantyPeriod,
    poNumber:          (form as any).poNumber          ?? "",
    vehicleNo:         (form as any).vehicleNo         ?? "",
    dispatchedThrough: (form as any).dispatchedThrough ?? "",
    transportName:     (form as any).transportName     ?? "",
    customFieldValues: (form as any).customFieldValues ?? {},
    subTotal:              subtotal,
    taxableAmount,
    discountAmount,
    additionalChargesTotal: chargesTotal,
    taxAmount:             totalTaxAmt,
    roundOff:              roundOffVal,
    totalAmount,
    items: itemsWithCalc.map(({ item, calc }) => ({
      productId: item.itemId,
      quantity:  item.qty,
      // Always send the base (pre-tax) price — backend stores this in QuotationItem.price
      price:     item.price,
      // discount stored as % in DB (consistent with how backend reads it back)
      discount:  item.discountPct,
      taxRate:   item.taxRate,
      taxAmount: calc.taxAmt,
      total:     calc.amount,
    })),
    additionalCharges: form.additionalCharges.map((c) => ({
      name:   c.label,
      amount: c.amount,
    })),
  };
}

// ─── Utilities ────────────────────────────────────────────────────────────────
// ─── Utility ───────────────────────────────────────────────────────────────────
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