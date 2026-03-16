// src/api/paymentInApi.ts
// ─────────────────────────────────────────────────────────────────────────────
// All PaymentIn API calls. Zero localStorage. Backend: /api/payments-in
// ─────────────────────────────────────────────────────────────────────────────

export interface AllocationRow {
  invoiceId:      number;
  invoiceNo:      string;
  invoiceDate:    string;
  dueDate:        string;
  totalAmount:    number;
  amountReceived: number;
  balanceAmount:  number;
  tds:            number;
  discount:       number;
}

export interface PaymentInRecord {
  id:                 number;
  paymentNo:          string;   // canonical ID shown in UI
  partyId:            number;
  partyName:          string;
  date:               string;   // "YYYY-MM-DD"
  mode:               string;
  amount:             number;
  notes:              string;
  totalAmountSettled: number;
  allocations:        AllocationRow[];
}

export interface CreatePaymentInPayload {
  partyId:     number;
  date:        string;
  mode:        string;
  amount:      number;
  notes?:      string;
  allocations: { invoiceId: number; amount: number }[];
}

export interface GetPaymentsInParams {
  page?:     number;
  limit?:    number;
  search?:   string;
  dateFrom?: string;
  dateTo?:   string;
  partyId?:  number;   // ← filter by party
}

// ── Generic fetch helper ──────────────────────────────────────────────────────
async function apiFetch<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.message ?? `API error ${res.status}`);
  return body as T;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function getPaymentsIn(params: GetPaymentsInParams = {}) {
  const q = new URLSearchParams();
  if (params.page)     q.set("page",     String(params.page));
  if (params.limit)    q.set("limit",    String(params.limit));
  if (params.search)   q.set("search",   params.search);
  if (params.dateFrom) q.set("dateFrom", params.dateFrom);
  if (params.dateTo)   q.set("dateTo",   params.dateTo);
  if (params.partyId)  q.set("partyId",  String(params.partyId));
  return apiFetch<{ payments: PaymentInRecord[]; total: number; page: number; pages: number }>(
    `/api/payments-in?${q}`
  );
}

export async function getPaymentInById(id: number) {
  return apiFetch<PaymentInRecord>(`/api/payments-in/${id}`);
}

/** Returns next suggested payment number */
export async function getPaymentInSettings() {
  return apiFetch<{ nextPaymentNo: string }>("/api/payments-in/settings");
}

export async function createPaymentIn(payload: CreatePaymentInPayload) {
  return apiFetch<{ message: string; data: { id: number; paymentNo: string } }>(
    "/api/payments-in",
    { method: "POST", body: JSON.stringify(payload) }
  );
}

export async function updatePaymentIn(id: number, payload: Omit<CreatePaymentInPayload, "partyId">) {
  return apiFetch<{ message: string }>(
    `/api/payments-in/${id}`,
    { method: "PUT", body: JSON.stringify(payload) }
  );
}

export async function deletePaymentIn(id: number) {
  return apiFetch<{ message: string }>(
    `/api/payments-in/${id}`,
    { method: "DELETE" }
  );
}

// ── Pending invoices for a party (reused from salesInvoiceApi) ────────────────
export interface PendingInvoice {
  id:          number;
  invoiceNo:   string;
  invoiceDate: string;
  dueDate:     string;
  totalAmount: number;
  outstanding: number;
}

export async function getPendingInvoicesForParty(partyId: number): Promise<PendingInvoice[]> {
  // Backend returns { success: true, data: Invoice[] }
  // We use raw fetch (not apiFetch) to handle the { success, data } wrapper ourselves
  const res = await fetch(
    `/api/invoices?partyId=${partyId}&status=OPEN,PARTIAL&limit=200`
  );
  const body = await res.json().catch(() => ({}));

  // Unwrap: backend returns { success, data: [...] }
  const list: any[] = body.data ?? body.invoices ?? (Array.isArray(body) ? body : []);

  return list.map((inv: any) => ({
    id:          inv.id,
    invoiceNo:   inv.invoiceNo ?? String(inv.id),
    invoiceDate: inv.invoiceDate ?? "",
    dueDate:     inv.dueDate    ?? "",
    totalAmount: Number(inv.totalAmount ?? inv.total ?? 0),
    outstanding: Number(inv.outstandingAmount ?? inv.outstanding ?? 0),
  }));
}

// ── Party helpers for PaymentInList filter ───────────────────────────────────
export interface PartyBasic {
  id:        number;
  partyName: string;
  balance?:  number;
}

export async function getPartiesBasic(): Promise<PartyBasic[]> {
  const res = await fetch("/api/parties?limit=500");
  const body = await res.json().catch(() => ({}));
  const list: any[] = body.parties ?? body.data ?? (Array.isArray(body) ? body : []);
  return list.map((p: any) => ({
    id:        p.id,
    partyName: p.partyName ?? p.name ?? "",
    balance:   p.balance != null ? Number(p.balance) : undefined,
  }));
}

export async function getPartyLedgerBalance(partyId: number): Promise<number> {
  const res = await fetch(`/api/party-ledger/${partyId}/balance`);
  const body = await res.json().catch(() => ({}));
  return Number(body.balance ?? body.data?.balance ?? 0);
}