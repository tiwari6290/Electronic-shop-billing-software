// api/partiesAndProductsApi.ts
// ─────────────────────────────────────────────────────────────────────────────
// Fetches Parties and Products from the backend for use in the
// Delivery Challan module (party selector + add-items modal).
// ─────────────────────────────────────────────────────────────────────────────

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
const BASE_URL =import.meta.env.VITE_API_URL || "http://localhost:4000";
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options?.headers ?? {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as any).error || `HTTP ${res.status}`);
  return body as T;
}

// ─── Party ────────────────────────────────────────────────────────────────────

export interface PartyRecord {
  id: number;
  name: string;
  partyName: string;
  mobileNumber?: string | null;
  email?: string | null;
  gstin?: string | null;
  billingAddress?: string | null;
  shippingAddress?: string | null;
  openingBalance?: string | number | null;
  partyType: string;
  status: string;
}

export interface PartyListResponse {
  parties: PartyRecord[];
  total: number;
}

/**
 * GET /api/parties
 * Returns all active parties (customers & suppliers).
 */
export async function fetchParties(search?: string): Promise<PartyRecord[]> {
  const qs = new URLSearchParams();
  qs.set("limit", "500");
  qs.set("status", "active");
  if (search) qs.set("search", search);

  const endpoints = [
    `${BASE_URL}/parties?${qs}`,
    `${BASE_URL}/party?${qs}`,
    `${BASE_URL}/cashier/parties?${qs}`,
  ];

  for (const url of endpoints) {
    try {
      const data = await request<any>(url);
      const list: PartyRecord[] = Array.isArray(data)
        ? data
        : data.parties ?? data.data ?? [];
      return list;
    } catch {
      // try next endpoint
    }
  }

  return [];
}

/**
 * POST /api/parties  – create a new party on the fly
 */
export async function createParty(payload: {
  name: string;
  partyName: string;
  mobileNumber?: string;
  billingAddress?: string;
  partyType?: string;
}): Promise<PartyRecord> {
  return request<PartyRecord>(`${BASE_URL}/parties`, {
    method: "POST",
    body: JSON.stringify({
      partyType: "Customer",
      status: "active",
      ...payload,
    }),
  });
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface ProductRecord {
  id: number;
  name: string;
  itemCode?: string | null;
  salesPrice?: string | number | null;
  baseSalesPrice?: number | null; 
  purchasePrice?: string | number | null;
  unit?: string | null;
  hsnCode?: string | null;
  gstRate?: string | null; 
  sacCode?: string | null;
  category?: string | null;
  status: string;
  itemType: string;
  // stock is computed from ProductStock relation
  currentStock?: number | null;
}

export interface ProductListResponse {
  products: ProductRecord[];
  total: number;
}

/**
 * GET /api/products  (or /api/items)
 * Returns all active products/services.
 *
 * FIX: Added `includeStock=true` query param so the backend includes
 * the `currentStock` field from the ProductStock relation.
 * The Stock column in the Add Items modal was showing "-" because
 * currentStock was null — the backend was not computing it without this flag.
 */
export async function fetchProducts(search?: string): Promise<ProductRecord[]> {
  const qs = new URLSearchParams();
  qs.set("limit", "500");
  qs.set("status", "active");
  qs.set("includeStock", "true");   // ← FIX: request stock data from backend
  if (search) qs.set("search", search);

  const endpoints = [
    `${BASE_URL}/products?${qs}`,
    `${BASE_URL}/items?${qs}`,
    `${BASE_URL}/cashier/products?${qs}`,
  ];

  for (const url of endpoints) {
    try {
      const data = await request<any>(url);
      const list: ProductRecord[] = Array.isArray(data)
        ? data
        : data.products ?? data.items ?? data.data ?? [];

      // Normalise stock field — backends may return it under different keys
      return list.map((p: any) => ({
        ...p,
        currentStock:
          p.currentStock            ??   // standard field
          p.stock                   ??   // some backends use "stock"
          p.availableStock          ??   // or "availableStock"
          p.ProductStock?.[0]?.quantity ?? // Prisma include shape
          null,
      }));
    } catch {
      // try next
    }
  }

  return [];
}