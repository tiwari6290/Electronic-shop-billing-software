// src/api/salesreturnapi.ts
// ─────────────────────────────────────────────────────────────────────────────
// All Sales Return API calls.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:4000";

function getAuthHeaders(): HeadersInit {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: { ...getAuthHeaders(), ...(opts?.headers ?? {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as any).message || `HTTP ${res.status}`);
  return body as T;
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type SalesReturnStatus = "Refunded" | "Partially Refunded" | "Unpaid";

export interface SalesReturnItemPayload {
  productId: number;
  quantity:  number;
  price:     number;
  godownId?: number;
}

export interface CreateSalesReturnPayload {
  invoiceId: number;
  partyId:   number;
  items:     SalesReturnItemPayload[];
  reason?:   string;
  notes?:    string;
}

export interface SalesReturnRecord {
  id:           number;
  invoiceId:    number;
  partyId:      number;
  totalAmount:  number;
  returnStatus: SalesReturnStatus;
  reason:       string | null;
  notes:        string | null;
  createdAt:    string;
  party:        { id: number; partyName: string };
  invoice: {
    id:          number;
    invoiceNo:   string;
    status:      string;
    invoiceDate: string;
  };
  items: {
    id:        number;
    productId: number;
    quantity:  number;
    price:     number;
    godownId:  number | null;
    product:   { id: number; name: string; unit: string | null };
  }[];
}

/**
 * AvailableInvoice now includes every meta field stored on the Invoice
 * so the Sales Return form can auto-populate challan, salesman, custom
 * fields (e.g. WWW=90), etc. when the user selects an invoice.
 */
export interface AvailableInvoice {
  id:                number;
  invoiceNo:         string;
  invoiceDate:       string;
  totalAmount:       number;
  outstandingAmount: number;
  status:            string;

  // ── Standard meta fields ─────────────────────────────────────────────────
  challanNo:         string;
  financedBy:        string;
  salesman:          string;
  emailId:           string;
  warrantyPeriod:    string;
  ewayBillNo:        string;
  poNumber:          string;
  vehicleNo:         string;
  dispatchedThrough: string;
  transportName:     string;
  notes:             string;
  termsConditions:   string;

  /** Custom fields stored as a JSON map, e.g. { "WWW": "90", "MyField": "abc" } */
  customFieldValues: Record<string, string>;

  items: {
    id:        number;
    productId: number;
    quantity:  number;
    price:     number;
    godownId:  number | null;
    product: {
      id:         number;
      name:       string;
      unit:       string | null;
      hsnCode:    string | null;
      salesPrice: number | null;
    };
  }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all sales returns (with optional filters + pagination).
 */
export async function getSalesReturns(params?: {
  partyId?:   number;
  invoiceId?: number;
  page?:      number;
  limit?:     number;
}): Promise<{ data: SalesReturnRecord[]; total: number; page: number; pages: number }> {
  const qs = new URLSearchParams();
  if (params?.partyId)   qs.set("partyId",   String(params.partyId));
  if (params?.invoiceId) qs.set("invoiceId", String(params.invoiceId));
  if (params?.page)      qs.set("page",      String(params.page));
  if (params?.limit)     qs.set("limit",     String(params.limit));

  return apiFetch<any>(`/api/sales-return/sales-return?${qs}`);
}

/**
 * Fetch a single sales return by ID.
 */
export async function getSalesReturnById(id: number): Promise<SalesReturnRecord> {
  const res = await apiFetch<{ success: boolean; data: SalesReturnRecord }>(
    `/api/sales-return/sales-return/${id}`
  );
  return res.data;
}

/**
 * Fetch invoices that can be linked to a new sales return for a party.
 * The backend:
 *   • Only returns invoices for the given party
 *   • Excludes CANCELLED invoices
 *   • Excludes invoices that already have a SalesReturn
 *   • Returns all meta fields + customFieldValues
 */
export async function getAvailableInvoicesForReturn(
  partyId: number
): Promise<AvailableInvoice[]> {
  const res = await apiFetch<{ success: boolean; data: AvailableInvoice[] }>(
    `/api/sales-return/available-invoices?partyId=${partyId}`
  );
  return res.data ?? [];
}

/**
 * Create a new sales return.
 * Stock is automatically restored on the backend.
 */
export async function createSalesReturn(
  payload: CreateSalesReturnPayload
): Promise<{ id: number; returnStatus: SalesReturnStatus; invoiceNo: string }> {
  const res = await apiFetch<{ success: boolean; data: any }>(
    "/api/sales-return/sales-return",
    { method: "POST", body: JSON.stringify(payload) }
  );
  return res.data;
}

/**
 * Delete a sales return.
 * Stock is automatically reversed on the backend.
 */
export async function deleteSalesReturn(id: number): Promise<void> {
  await apiFetch(`/api/sales-return/sales-return/${id}`, { method: "DELETE" });
}