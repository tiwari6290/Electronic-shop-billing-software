// api/deliveryChallanApi.ts
// ─────────────────────────────────────────────────────────────────────────────
// All HTTP calls for the Delivery Challan module.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:4000/api/delivery-challan";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options?.headers ?? {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as any).error || `HTTP ${res.status}`);
  return body as T;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ChallanSettings {
  id: number;
  prefix: string | null;
  sequenceNumber: number;
  enablePrefix: boolean;
  showItemImage: boolean;
  priceHistory: boolean;
  branchCode: string | null;
}

export interface ChallanItemPayload {
  productId?: number | null;
  productName: string;
  hsnSac?: string;
  description?: string;
  quantity: number;
  unit?: string;
  price: number;
  discountPct?: number;
  discountAmt?: number;
  taxLabel?: string;
  taxRate?: number;
  godownId?: number | null;
}

export interface AdditionalChargePayload {
  label: string;
  amount: number;
  taxLabel?: string;
}

export interface CreateChallanPayload {
  partyId: number;
  challanDate?: string;
  eWayBillNo?: string;
  challanNoRef?: string;
  financedBy?: string;
  salesman?: string;
  emailId?: string;
  warrantyPeriod?: string;
  poNumber?: string;
  vehicleNo?: string;
  dispatchedThrough?: string;
  transportName?: string;
  shippingAddress?: string;
  discountType?: "After Tax" | "Before Tax";
  discountPct?: number;
  discountAmt?: number;
  autoRoundOff?: boolean;
  roundOffAmt?: number;
  customFieldValues?: Record<string, string>;
  notes?: string;
  termsConditions?: string;
  showEmptySignatureBox?: boolean;
  signatureUrl?: string | null;
  items: ChallanItemPayload[];
  additionalCharges?: AdditionalChargePayload[];
}

// ── Settings API ──────────────────────────────────────────────────────────────

export async function getChallanSettings(): Promise<ChallanSettings> {
  return request<ChallanSettings>(`${BASE_URL}/settings`);
}

export async function saveChallanSettings(data: Partial<ChallanSettings>): Promise<ChallanSettings> {
  return request<ChallanSettings>(`${BASE_URL}/settings`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getNextChallanNumber(): Promise<{ challanNo: string }> {
  return request<{ challanNo: string }>(`${BASE_URL}/next-number`);
}

export function buildChallanNo(s: ChallanSettings): string {
  const seq = String(s.sequenceNumber).padStart(5, "0");
  if (s.enablePrefix && s.prefix?.trim()) return `${s.prefix.trim()}${seq}`;
  return `DC-${seq}`;
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export async function listChallans(params?: {
  status?: "OPEN" | "CLOSED" | "CANCELLED" | "ALL";
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.from)   qs.set("from",   params.from);
  if (params?.to)     qs.set("to",     params.to);
  if (params?.search) qs.set("search", params.search);
  if (params?.page)   qs.set("page",   String(params.page));
  if (params?.limit)  qs.set("limit",  String(params.limit));
  const url = `${BASE_URL}${qs.toString() ? `?${qs}` : ""}`;
  return request<{ total: number; challans: any[] }>(url);
}

export async function getChallanById(id: number | string) {
  return request<any>(`${BASE_URL}/${id}`);
}

export async function createChallan(data: CreateChallanPayload) {
  return request<any>(`${BASE_URL}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateChallan(id: number | string, data: Partial<CreateChallanPayload>) {
  return request<any>(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteChallan(id: number | string) {
  return request<{ success: boolean }>(`${BASE_URL}/${id}`, { method: "DELETE" });
}

export async function updateChallanStatus(id: number | string, status: "OPEN" | "CLOSED" | "CANCELLED") {
  return request<any>(`${BASE_URL}/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ── Convert to Invoice (NON-DESTRUCTIVE) ─────────────────────────────────────
//
// IMPORTANT: This function does NOT call the backend convert endpoint and does
// NOT change the challan status. It simply fetches the full challan data so the
// caller can pre-fill CreateSalesInvoice.
//
// The challan status is set to CLOSED only AFTER the invoice is successfully
// saved — see CreateSalesInvoice.tsx handleSave() which calls updateChallanStatus.

export async function getChallanForConversion(id: number | string): Promise<{ fromChallan: any }> {
  const challan = await getChallanById(id);

  // Build the same `fromChallan` shape that CreateSalesInvoice already understands
  const fromChallan = {
    party: challan.party
      ? {
          id:             challan.party.id,
          name:           challan.party.name ?? challan.party.partyName ?? "",
          partyName:      challan.party.partyName ?? challan.party.name ?? "",
          mobileNumber:   challan.party.mobileNumber ?? null,
          gstin:          challan.party.gstin ?? null,
          billingAddress: challan.party.billingAddress ?? null,
        }
      : null,
    billItems: (challan.items ?? []).map((i: any) => ({
      // FIX: Only include itemId when it's a real linked product (not null)
      // Sending itemId: null causes the invoice controller to crash with a Prisma error
      ...(i.productId != null ? { itemId: Number(i.productId) } : {}),
      name:        i.productName,
      description: i.description ?? "",
      hsn:         i.hsnSac ?? "",
      qty:         Number(i.quantity),
      unit:        i.unit ?? "PCS",
      price:       Number(i.price),
      discountPct: i.discountPct ?? 0,
      discountAmt: i.discountAmt ?? 0,
      taxLabel:    i.taxLabel ?? "None",
      taxRate:     i.taxRate ?? 0,
      amount:      Number(i.total ?? 0),
    })),
    additionalCharges: (challan.additionalCharges ?? []).map((ch: any) => ({
      label:  ch.name ?? ch.label ?? "",
      amount: Number(ch.amount),
      tax:    ch.taxLabel ?? "No Tax Applicable",
    })),
    notes:           challan.notes ?? "",
    termsConditions: challan.termsConditions ?? "",
    discountType:    challan.discountType ?? "After Tax",
    discountPct:     challan.discountPct ?? 0,
    discountAmt:     challan.discountAmt ?? 0,
    roundOff:        challan.autoRoundOff ? "+Add" : "none",
    roundOffAmt:     challan.roundOffAmt ?? 0,
    challanNo:       challan.challanNo ?? "",
    eWayBillNo:      challan.eWayBillNo ?? "",
    vehicleNo:       challan.vehicleNo ?? "",
    salesman:        challan.salesman ?? "",
    poNumber:        challan.poNumber ?? "",
  };
  return { fromChallan };
}

// Keep old name as alias so existing imports continue to work
export async function convertChallanToInvoice(id: number | string): Promise<{ fromChallan: any }> {
  return getChallanForConversion(id);
}

export async function duplicateChallan(id: number | string) {
  return request<any>(`${BASE_URL}/${id}/duplicate`, { method: "POST" });
}

// ── Mapper: backend challan → frontend ChallanItem shape ──────────────────────
export function mapBackendChallan(c: any) {
  return {
    id:               c.id,
    date:             c.challanDate,
    challanNumber:    c.challanNo,
    partyName:        c.party?.name ?? "",
    partyId:          c.partyId,
    amount:           Number(c.totalAmount),
    status: c.status as "OPEN" | "CLOSED" | "CANCELLED",
    items: (c.items ?? []).map((i: any) => ({
      id:           i.id,
      name:         i.productName,
      hsnSac:       i.hsnSac ?? "",
      description:  i.description ?? "",
      qty:          Number(i.quantity),
      unit:         i.unit ?? "PCS",
      pricePerItem: Number(i.price),
      discount: {
        percent: i.discountPct ?? 0,
        amount:  i.discountAmt ?? 0,
      },
      tax:     i.taxLabel ?? "None",
      taxRate: i.taxRate  ?? 0,
      amount:  Number(i.total),
      // ── FIX: map stock from the nested product relation ──────────────────
      // The backend now includes product.ProductStock[0].currentStock via
      // the `includeStock=true` flag handled in the controller.
      currentStock:
        i.product?.ProductStock?.[0]?.currentStock ??
        i.product?.currentStock ??
        i.currentStock ??
        null,
    })),
    additionalCharges: (c.additionalCharges ?? []).map((ch: any) => ({
      id:     ch.id,
      label:  ch.name,
      amount: Number(ch.amount),
      tax:    ch.taxLabel ?? "No Tax Applicable",
    })),
    notes:             c.notes ?? "",
    termsAndConditions: c.termsConditions ?? "",
    discountPct:       c.discountPct ?? 0,
    discountAmt:       c.discountAmt ?? 0,
    discountType:      c.discountType ?? "After Tax",
    autoRoundOff:      c.autoRoundOff ?? false,
    roundOffAmt:       c.roundOffAmt  ?? 0,
    eWayBillNo:        c.eWayBillNo   ?? "",
    challanNoRef:      c.challanNoRef ?? "",
    financedBy:        c.financedBy   ?? "",
    salesman:          c.salesman     ?? "",
    emailId:           c.emailId      ?? "",
    warrantyPeriod:    c.warrantyPeriod ?? "",
    shippingAddress:   c.shippingAddress ?? "",
    poNumber:          c.poNumber     ?? "",
    vehicleNo:         c.vehicleNo    ?? "",
    dispatchedThrough: c.dispatchedThrough ?? "",
    transportName:     c.transportName    ?? "",
    customFieldValues: c.customFieldValues ?? {},
    selectedBankId:    undefined,
  };
}