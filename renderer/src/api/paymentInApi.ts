import api from "@/lib/axios";

// ─────────────────────────────────────────────────────────────────────────────

export interface AllocationRow {
  invoiceId: number;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  amountReceived: number;
  balanceAmount: number;
  tds: number;
  discount: number;
}

export interface PaymentInRecord {
  id: number;
  paymentNo: string;
  partyId: number;
  partyName: string;
  date: string;
  mode: string;
  amount: number;
  notes: string;
  accountId: number | null;
  accountName: string | null;
  totalAmountSettled: number;
  allocations: AllocationRow[];
}

export interface CreatePaymentInPayload {
  partyId: number;
  date: string;
  mode: string;
  amount: number;
  notes?: string;
  accountId?: number;
  allocations: { invoiceId: number; amount: number }[];
}

export interface GetPaymentsInParams {
  page?: number;
  limit?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  partyId?: number;
}

// ── API calls ────────────────────────────────────────────────────────────────

export async function getPaymentsIn(params: GetPaymentsInParams = {}) {
  const q = new URLSearchParams();
  if (params.page)     q.set("page",     String(params.page));
  if (params.limit)    q.set("limit",    String(params.limit));
  if (params.search)   q.set("search",   params.search);
  if (params.dateFrom) q.set("dateFrom", params.dateFrom);
  if (params.dateTo)   q.set("dateTo",   params.dateTo);
  if (params.partyId)  q.set("partyId",  String(params.partyId));

  const res = await api.get(`/payments-in?${q}`);
  return res.data;
}

export async function getPaymentInById(id: number) {
  const res = await api.get(`/payments-in/${id}`);
  return res.data;
}

export async function getPaymentInSettings() {
  const res = await api.get(`/payments-in/settings`);
  return res.data;
}

export async function createPaymentIn(payload: CreatePaymentInPayload) {
  const res = await api.post(`/payments-in`, payload);
  return res.data;
}

export async function updatePaymentIn(
  id: number,
  payload: Omit<CreatePaymentInPayload, "partyId">
) {
  const res = await api.put(`/payments-in/${id}`, payload);
  return res.data;
}

export async function deletePaymentIn(id: number) {
  const res = await api.delete(`/payments-in/${id}`);
  return res.data;
}

// ── Pending invoices ─────────────────────────────────────────────────────────

export interface PendingInvoice {
  id: number;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  outstanding: number;
}

export async function getPendingInvoicesForParty(
  partyId: number
): Promise<PendingInvoice[]> {
  try {
    const res = await api.get(
      `/invoices?partyId=${partyId}&status=OPEN,PARTIAL&limit=200`
    );

    const list: any[] =
      res.data.data ??
      res.data.invoices ??
      (Array.isArray(res.data) ? res.data : []);

    return list.map((inv: any) => ({
      id:          inv.id,
      invoiceNo:   inv.invoiceNo ?? String(inv.id),
      invoiceDate: inv.invoiceDate ? String(inv.invoiceDate).split("T")[0] : "",
      dueDate:     inv.dueDate    ? String(inv.dueDate).split("T")[0]    : "",
      totalAmount: Number(inv.totalAmount ?? inv.total ?? 0),
      outstanding: Number(inv.outstandingAmount ?? inv.outstanding ?? 0),
    }));
  } catch {
    return [];
  }
}

// ── Party helpers ────────────────────────────────────────────────────────────

export interface PartyBasic {
  id: number;
  partyName: string;
  balance?: number;
}

export async function getPartiesBasic(): Promise<PartyBasic[]> {
  try {
    const res = await api.get(`/parties`);

    const list: any[] =
      res.data.data ??
      res.data.parties ??
      (Array.isArray(res.data) ? res.data : []);

    return list.map((p: any) => ({
      id:        Number(p.id),
      partyName: p.partyName ?? p.name ?? "",
      balance:   p.balance != null ? Number(p.balance) : undefined,
    }));
  } catch {
    return [];
  }
}

// ── Party Ledger Balance ─────────────────────────────────────────────────────

export async function getPartyLedgerBalance(
  partyId: number
): Promise<number> {
  try {
    const res = await api.get(`/party-ledger/party/${partyId}/balance`);
    return Number(res.data.balance ?? res.data.data?.balance ?? 0);
  } catch {
    return 0;
  }
}