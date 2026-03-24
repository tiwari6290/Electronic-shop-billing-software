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
 quotationNo: string,
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
  // ── Extra optional meta fields (controlled by InvoiceBuilder toggles) ───────
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

// ─── API Base ──────────────────────────────────────────────────────────────────
const BASE = "/api";

// ─── API Response Types ────────────────────────────────────────────────────────
export interface ApiQuotation {
  id: number;
  quotationNo: string;
  partyId: number;
  party?: {
    id: number;
    name: string;           // may or may not be present
    partyName: string;      // actual field from Prisma Party model
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
  ewayBillNo?: string;      // Prisma schema field name (lowercase w)
  eWayBillNo?: string;      // kept for backwards compat
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
  product?: { id: number; name: string; unit?: string; hsnCode?: string; itemCode?: string };
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

// ─── API Helpers ───────────────────────────────────────────────────────────────
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Quotation API ─────────────────────────────────────────────────────────────
export async function apiGetQuotations(params?: {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ApiQuotation[]> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.status) qs.set("status", params.status);
  if (params?.startDate) qs.set("startDate", params.startDate);
  if (params?.endDate) qs.set("endDate", params.endDate);
  const query = qs.toString() ? `?${qs}` : "";
  return apiFetch<ApiQuotation[]>(`/quotations/${query}`);
}

export async function apiGetQuotationById(id: number): Promise<ApiQuotation> {
  return apiFetch<ApiQuotation>(`/quotations/${id}`);
}

export async function apiCreateQuotation(data: object): Promise<ApiQuotation> {
  return apiFetch<ApiQuotation>("/quotations/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiUpdateQuotation(id: number, data: object): Promise<ApiQuotation> {
  return apiFetch<ApiQuotation>(`/quotations/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function apiDeleteQuotation(id: number): Promise<void> {
  return apiFetch<void>(`/quotations/${id}`, { method: "DELETE" });
}

export async function apiDuplicateQuotation(id: number): Promise<ApiQuotation> {
  return apiFetch<ApiQuotation>(`/quotations/${id}/duplicate`, { method: "POST" });
}

export async function apiConvertQuotationToInvoice(id: number): Promise<unknown> {
  return apiFetch(`/quotations/${id}/convert`, { method: "POST" });
}

/**
 * Marks a quotation as CONVERTED/Closed without creating a full invoice.
 * Call this after the linked sales invoice has been saved successfully.
 */
export async function apiCloseQuotation(id: number): Promise<ApiQuotation> {
  return apiFetch<ApiQuotation>(`/quotations/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status: "CONVERTED" }),
  });
}

// ─── Settings API ──────────────────────────────────────────────────────────────
export async function apiGetQuotationSettings(): Promise<QuotationSettings> {
  return apiFetch<QuotationSettings>("/quotations/settings/");
}

export async function apiSaveQuotationSettings(data: Partial<QuotationSettings>): Promise<QuotationSettings> {
  return apiFetch<QuotationSettings>("/quotations/settings/", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ─── Party & Product API ───────────────────────────────────────────────────────
export async function apiGetParties(): Promise<Party[]> {
  const res = await apiFetch<{ success: boolean; data: any[] }>("/parties/");
  const raw = res.data ?? [];
  return raw.map((p) => ({
    id: p.id,
    name: p.partyName ?? p.name,
    mobile: p.mobileNumber ?? p.mobile ?? "",
    balance: p.openingBalance ?? p.balance ?? 0,
    email: p.email,
    gstin: p.gstin,
    billingAddress: p.billingAddress,
    shippingAddress: p.shippingAddress,
    category: p.partyCategory ?? p.category,
    type: p.partyType ?? p.type,
  }));
}

export async function apiGetItems(): Promise<Item[]> {
  const res = await apiFetch<{ success: boolean; data: any[] }>("/items/");
  const raw = res.data ?? [];
  return raw.map((p) => {
    // currentStock is the live balance, sum across all godowns
    const totalStock = (p.ProductStock ?? []).reduce(
      (s: number, ps: any) => s + (ps.currentStock ?? ps.openingStock ?? 0),
      0
    );
    return {
      id: p.id,
      name: p.name,
      itemCode: p.itemCode ?? "",
      stock: totalStock.toString(),
      salesPrice: p.salesPrice ? Number(p.salesPrice) : 0,
      purchasePrice: p.purchasePrice ? Number(p.purchasePrice) : 0,
      unit: p.unit ?? "",
      hsn: p.hsnCode ?? "",
      category: p.category ?? "",
    };
  });
}

// ─── Mapper: ApiQuotation → QuotationData (for edit/view) ─────────────────────
export function apiToFormData(q: ApiQuotation): QuotationData {
  const roundOff = Number(q.roundOff ?? 0);

  return {
    id: String(q.id),

    // keep full quotation number
    quotationNo: q.quotationNo ?? String(q.id),

    quotationDate: q.quotationDate?.split("T")[0] ?? todayStr(),

    party: q.party
      ? {
          id: q.party.id,
          name: q.party.partyName ?? (q.party as any).name ?? "",
          mobile: q.party.mobileNumber ?? "",
          balance: Number(q.party.openingBalance ?? 0),
          email: q.party.email,
          gstin: q.party.gstin,
          billingAddress: q.party.billingAddress,
          shippingAddress: q.party.shippingAddress,
        }
      : null,

    billItems: (q.items ?? []).map((item): BillItem => {
      const price = Number(item.price ?? 0);
      const qty = Number(item.quantity ?? 0);
      const discountPct = Number(item.discount ?? 0);
      const taxRate = Number(item.taxRate ?? 0);
      const total = Number(item.total ?? 0);

      const amount =
        total > 0
          ? total
          : price * qty * (1 - discountPct / 100) * (1 + taxRate / 100);

      return {
        rowId: String(item.id),
        itemId: item.productId,
        name: item.product?.name ?? "",
        description: "",
        hsn: item.product?.hsnCode ?? "",
        qty,
        unit: item.product?.unit ?? "",
        price,
        discountPct,
        discountAmt: 0,
        taxLabel: taxRate > 0 ? `GST ${taxRate}%` : "None",
        taxRate,
        amount,
      };
    }),

    additionalCharges: (q.additionalCharges ?? []).map((c): AdditionalCharge => ({
      id: String(c.id),
      label: c.name,
      amount: Number(c.amount ?? 0),
      taxLabel: "No Tax Applicable",
    })),

    discountType: "Discount After Tax",
    discountPct: 0,
    discountAmt: Number(q.discountAmount ?? 0),

    roundOff: roundOff > 0 ? "+Add" : roundOff < 0 ? "-Reduce" : "none",
    roundOffAmt: Math.abs(roundOff),

    notes: q.notes ?? "",
    termsConditions: q.termsConditions ?? "",
    eWayBillNo: (q as any).ewayBillNo ?? (q as any).eWayBillNo ?? "",
    challanNo: q.challanNo ?? "",
    financedBy: q.financedBy ?? "",
    salesman: q.salesman ?? "",
    emailId: q.emailId ?? "",
    warrantyPeriod: q.warrantyPeriod ?? "",
    poNumber:          (q as any).poNumber          ?? "",
    vehicleNo:         (q as any).vehicleNo         ?? "",
    dispatchedThrough: (q as any).dispatchedThrough ?? "",
    transportName:     (q as any).transportName     ?? "",
    customFieldValues: (q as any).customFieldValues ?? {},

    validFor: 30,
    validityDate: q.validTill?.split("T")[0] ?? addDays(todayStr(), 30),
    showDueDate: !!q.validTill,

    status: q.status === "OPEN" ? "Open" : "Closed",
    createdAt: q.createdAt?.split("T")[0] ?? todayStr(),
  };
}

// ─── Mapper: QuotationData → API payload ──────────────────────────────────────
export function formDataToApiPayload(form: QuotationData, settings?: QuotationSettings) {
  const subtotal = form.billItems.reduce((s, i) => s + i.amount, 0);
  const chargesTotal = form.additionalCharges.reduce((s, c) => s + c.amount, 0);
  const taxAmount = form.billItems.reduce((s, i) => s + (i.amount * i.taxRate) / (100 + i.taxRate), 0);
  const taxableAmount = subtotal - taxAmount;
  const discountAmount = form.discountPct > 0
    ? (subtotal * form.discountPct) / 100
    : form.discountAmt;
  const roundOffVal = form.roundOff === "+Add" ? form.roundOffAmt : form.roundOff === "-Reduce" ? -form.roundOffAmt : 0;
  const totalAmount = subtotal + chargesTotal - discountAmount + roundOffVal;

  // Use form.quotationNo as the numeric part — backend already bumped the sequence.
  // Only apply prefix from settings if prefix is enabled and non-empty.
 const quotationNo = form.quotationNo;


  return {
    quotationNo,
    partyId: form.party?.id ?? null,
    branchCode: settings?.branchCode ?? null,
    quotationDate: form.quotationDate,
    validTill: form.showDueDate ? form.validityDate : null,
    notes: form.notes,
    termsConditions: form.termsConditions,
    ewayBillNo: form.eWayBillNo,
    challanNo: form.challanNo,
    financedBy: form.financedBy,
    salesman: form.salesman,
    emailId: form.emailId,
    warrantyPeriod: form.warrantyPeriod,
    poNumber:          (form as any).poNumber          ?? "",
    vehicleNo:         (form as any).vehicleNo         ?? "",
    dispatchedThrough: (form as any).dispatchedThrough ?? "",
    transportName:     (form as any).transportName     ?? "",
    customFieldValues: (form as any).customFieldValues ?? {},
    subTotal: subtotal,
    taxableAmount,
    discountAmount,
    additionalChargesTotal: chargesTotal,
    taxAmount,
    roundOff: roundOffVal,
    totalAmount,
    items: form.billItems.map((item) => ({
      productId: item.itemId,
      quantity: item.qty,
      price: item.price,
      discount: item.discountPct,
      taxRate: item.taxRate,
      taxAmount: (item.amount * item.taxRate) / (100 + item.taxRate),
      total: item.amount,
    })),
    additionalCharges: form.additionalCharges.map((c) => ({
      name: c.label,
      amount: c.amount,
    })),
  };
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