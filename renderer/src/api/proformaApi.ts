// ── proformaApi.ts ────────────────────────────────────────────────────────────
// Centralised API calls for Proforma Invoice module.
// Import this wherever you need to talk to the backend.

const BASE = "http://localhost:4000/api/proforma-invoices";// adjust if your router is mounted differently

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? `HTTP ${res.status}`);
  return data as T;
}

// ── Types mirroring the backend ───────────────────────────────────────────────

export interface ProformaListItem {
  id: number;
  proformaNo: string;
  proformaDate: string;
  validTill: string | null;
  totalAmount: number;
  status: "DRAFT" | "SENT" | "CONVERTED" | "CANCELLED";
  convertedToInvoiceId: number | null;
  party: { id: number; name: string; mobileNumber: string | null };
}

export interface ProformaItemPayload {
  productId?: number | null;
  productName: string;
  description?: string;
  hsnSac?: string;
  quantity: number;
  unit?: string;
  price: number;
  discountPct?: number;
  discountAmt?: number;
  taxLabel?: string;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  godownId?: number | null;
}

export interface ProformaChargePayload {
  name: string;
  amount: number;
  taxLabel?: string;
  taxAmount?: number;
}

export interface CreateProformaPayload {
  partyId: number;
  branchCode?: string;
  proformaDate?: string;
  paymentTermsDays?: number;
  validTill?: string;
  ewayBillNo?: string;
  challanNo?: string;
  financedBy?: string;
  salesman?: string;
  emailId?: string;
  warrantyPeriod?: string;
  poNumber?: string;
  vehicleNo?: string;
  dispatchedThrough?: string;
  transportName?: string;
  shippingAddress?: string;
  subTotal?: number;
  taxableAmount?: number;
  discountAmount?: number;
  additionalChargesTotal?: number;
  taxAmount?: number;
  roundOff?: number;
  totalAmount: number;
  discountType?: string;
  discountPct?: number;
  discountAmt?: number;
  adjustType?: string;
  adjustAmt?: number;
  autoRoundOff?: boolean;
  notes?: string;
  termsConditions?: string;
  customFieldValues?: Record<string, string>;
  showEmptySignatureBox?: boolean;
  signatureUrl?: string;
  bankAccountId?: number;
  items: ProformaItemPayload[];
  additionalCharges?: ProformaChargePayload[];
}

export interface ProformaSettings {
  id: number;
  prefix: string | null;
  sequenceNumber: number;
  enablePrefix: boolean;
  showItemImage: boolean;
  priceHistory: boolean;
  branchCode: string | null;
}

export interface ConvertResult {
    proformaId: number; 
  message: string;
  invoiceId: number;
  invoiceNo: string;
  invoice: any;
}

// ── API functions ─────────────────────────────────────────────────────────────

export const proformaApi = {
  /** List all proformas (optionally filter) */
  list(params?: {
    branchCode?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<ProformaListItem[]> {
    const qs = params
      ? "?" + new URLSearchParams(Object.entries(params).filter(([, v]) => v != null) as [string, string][]).toString()
      : "";
    return request<ProformaListItem[]>("GET", `${BASE}${qs}`);
  },

  /** Get single proforma with all nested data */
  getById(id: number): Promise<any> {
    return request<any>("GET", `${BASE}/${id}`);
  },

  /** Create new proforma */
  create(payload: CreateProformaPayload): Promise<any> {
    return request<any>("POST", BASE, payload);
  },

  /** Update existing proforma (full replace of items/charges) */
  update(id: number, payload: Partial<CreateProformaPayload>): Promise<any> {
    return request<any>("PUT", `${BASE}/${id}`, payload);
  },

  /** Delete proforma */
  delete(id: number): Promise<{ message: string }> {
    return request<{ message: string }>("DELETE", `${BASE}/${id}`);
  },

  /** Convert proforma to sales invoice (backend creates the Invoice) */
  convert(id: number): Promise<ConvertResult> {
    return request<ConvertResult>("POST", `${BASE}/${id}/convert`);
  },

  /** Get settings (sequence number, prefix, etc.) */
  getSettings(branchCode?: string): Promise<ProformaSettings> {
    const qs = branchCode ? `?branchCode=${branchCode}` : "";
    return request<ProformaSettings>("GET", `${BASE}/settings${qs}`);
  },

  /** Save settings */
  updateSettings(id: number, payload: Partial<ProformaSettings>): Promise<ProformaSettings> {
    return request<ProformaSettings>("PUT", `${BASE}/settings/${id}`, payload);
  },
};