// ─── salesInvoiceApi.ts ───────────────────────────────────────────────────────
// Full API layer for Sales Invoice module. No localStorage used anywhere.

const BASE = "/api";

// ─── Raw backend shape (as returned by the server) ───────────────────────────

export interface SaleInvoice {
  id: number;
  invoiceNo: string;
  invoiceDate: string;
  dueDate?: string | null;
  ewayBillNo?: string | null;
  challanNo?: string | null;
  financedBy?: string | null;
  salesman?: string | null;
  emailId?: string | null;
  warrantyPeriod?: string | null;
  notes?: string | null;
  termsConditions?: string | null;
  subTotal?: number | null;
  taxAmount?: number | null;
  taxableAmount?: number | null;
  discountAmount?: number | null;
  additionalChargesTotal?: number | null;
  roundOff?: number | null;
  totalAmount: number;
  receivedAmount?: number | null;
  outstandingAmount: number;
  paymentMode?: string | null;
  applyTcs: boolean;
  autoRoundOff: boolean;
  signatureUrl?: string | null;
  showEmptySignatureBox?: boolean;
  status: "OPEN" | "PARTIAL" | "PAID" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  party: {
    id: number;
    name: string;
    partyName: string;
    mobileNumber?: string | null;
    email?: string | null;
    gstin?: string | null;
    billingAddress?: string | null;
    shippingAddress?: string | null;
  };
  items: Array<{
    id: number;
    productId: number;
    quantity: number;
    price: number;
    discount?: number | null;
    discountPct?: number | null;
    taxRate?: number | null;
    taxAmount?: number | null;
    total: number;
    product: {
      id: number;
      name: string;
      itemCode?: string | null;
      hsnCode?: string | null;
      unit?: string | null;
      gstRate?: string | null;
    };
  }>;
  additionalCharges: Array<{
    id: number;
    name: string;
    amount: number;
  }>;
}

// ─── Frontend SalesInvoice shape (matches CreateSalesInvoice state) ───────────

export interface FeSalesInvoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  showDueDate: boolean;
  paymentTermsDays: number;
  eWayBillNo: string;
  challanNo: string;
  financedBy: string;
  salesman: string;
  emailId: string;
  warrantyPeriod: string;
  notes: string;
  termsConditions: string;
  party: {
    id: number;
    name: string;
    mobile: string;
    balance: number;
    email?: string;
    gstin?: string;
    billingAddress?: string;
    shippingAddress?: string;
  } | null;
  shipTo: { name: string; mobile?: string; billingAddress?: string } | null;
  billItems: Array<{
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
  }>;
  additionalCharges: Array<{
    id: string;
    label: string;
    amount: number;
    taxLabel: string;
  }>;
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
  showColumns: { pricePerItem: boolean; quantity: boolean };
  signatureUrl: string;
  showEmptySignatureBox: boolean;
  status: "Paid" | "Unpaid" | "Partially Paid" | "Cancelled";
  createdAt: string;
}

// ─── Map backend → frontend ───────────────────────────────────────────────────

export function fromSaleInvoice(inv: SaleInvoice): FeSalesInvoice {
  const statusMap: Record<string, FeSalesInvoice["status"]> = {
    PAID:      "Paid",
    OPEN:      "Unpaid",
    PARTIAL:   "Partially Paid",
    CANCELLED: "Cancelled",
  };

  return {
    id:               String(inv.id),
    invoiceNo:        inv.invoiceNo,
    invoiceDate:      inv.invoiceDate?.split("T")[0] ?? "",
    dueDate:          inv.dueDate?.split("T")[0] ?? "",
    showDueDate:      !!inv.dueDate,
    paymentTermsDays: 30,
    eWayBillNo:       inv.ewayBillNo    ?? "",
    challanNo:        inv.challanNo     ?? "",
    financedBy:       inv.financedBy    ?? "",
    salesman:         inv.salesman      ?? "",
    emailId:          inv.emailId       ?? "",
    warrantyPeriod:   inv.warrantyPeriod ?? "",
    notes:            inv.notes         ?? "",
    termsConditions:  inv.termsConditions ?? "",
    party: inv.party
      ? {
          id:             inv.party.id,
          name:           inv.party.partyName || inv.party.name,
          mobile:         inv.party.mobileNumber ?? "",
          balance:        0,
          email:          inv.party.email          ?? undefined,
          gstin:          inv.party.gstin          ?? undefined,
          billingAddress: inv.party.billingAddress ?? undefined,
          shippingAddress: inv.party.shippingAddress ?? undefined,
        }
      : null,
    shipTo: inv.party?.shippingAddress
      ? {
          name:           inv.party.partyName || inv.party.name,
          mobile:         inv.party.mobileNumber ?? "",
          billingAddress: inv.party.shippingAddress,
        }
      : null,
    billItems: (inv.items ?? []).map((item, idx) => {
      // FIX: resolve taxRate from line item first, then fall back to product.gstRate
      // This ensures the TAX column in InvoiceViewModal always shows the correct rate
      const resolvedTaxRate = Number(
        item.taxRate != null && item.taxRate !== 0
          ? item.taxRate
          : item.product?.gstRate ?? 0
      ) || 0;

      // FIX: taxLabel must never be "None" — leave empty so InvoiceViewModal
      // derives it from resolvedTaxRate (shows "GST 18%" or "-" automatically)
      const resolvedTaxLabel = resolvedTaxRate > 0
        ? `GST ${resolvedTaxRate}%`
        : "";

      return {
        rowId:       `row-${item.id}-${idx}`,
        itemId:      item.productId,
        name:        item.product?.name ?? "",
        description: "",
        hsn:         item.product?.hsnCode ?? "",
        qty:         item.quantity,
        unit:        item.product?.unit ?? "PCS",
        price:       Number(item.price),
        discountPct: Number(item.discountPct ?? 0),
        discountAmt: Number(item.discount ?? 0),
        taxRate:     resolvedTaxRate,     // ← line item taxRate OR product gstRate
        taxLabel:    resolvedTaxLabel,    // ← "GST 18%" or "" (never "None")
        amount:      Number(item.total),
      };
    }),
    additionalCharges: (inv.additionalCharges ?? []).map((c) => ({
      id:       String(c.id),
      label:    c.name,
      amount:   Number(c.amount),
      taxLabel: "No Tax Applicable",
    })),
    discountType:    "Discount After Tax",
    discountPct:     0,
    discountAmt:     Number(inv.discountAmount ?? 0),
    applyTCS:        inv.applyTcs,
    tcsRate:         0,
    tcsLabel:        "",
    tcsBase:         "Taxable Amount",
    roundOff:        inv.autoRoundOff ? "+Add" : "none",
    roundOffAmt:     Number(inv.roundOff ?? 0),
    amountReceived:  Number(inv.receivedAmount ?? 0),
    paymentMethod:   inv.paymentMode ?? "Cash",
    showColumns:     { pricePerItem: true, quantity: true },
    signatureUrl:    inv.signatureUrl ?? "",
    showEmptySignatureBox: inv.showEmptySignatureBox ?? false,
    status:          statusMap[inv.status] ?? "Unpaid",
    createdAt:       inv.createdAt?.split("T")[0] ?? "",
  };
}

// ─── Map frontend form → create payload ──────────────────────────────────────

export interface CreateInvoicePayload {
  partyId: number;
  invoiceDate: string;
  dueDate?: string;
  ewayBillNo?: string;
  challanNo?: string;
  financedBy?: string;
  salesman?: string;
  emailId?: string;
  warrantyPeriod?: string;
  notes?: string;
  termsConditions?: string;
  paymentMode?: string;
  receivedAmount: number;
  discountAmount: number;
  roundOff: number;
  applyTcs: boolean;
  autoRoundOff: boolean;
  items: Array<{
    productId:   number;
    quantity:    number;
    price:       number;
    taxRate:     number;
    discountPct: number;
    discount:    number;
  }>;
  additionalCharges: Array<{ name: string; amount: number }>;
  subTotal?:               number;
  taxAmount?:              number;
  tcsAmount?:              number;
  tcsRate?:                number;
  totalAmount?:            number;
  outstandingAmount?:      number;
  additionalChargesTotal?: number;
  signatureUrl?:           string | null;
  showEmptySignatureBox?:  boolean;
}

export function toCreatePayload(form: FeSalesInvoice): CreateInvoicePayload {
  return {
    partyId:        form.party!.id,
    invoiceDate:    form.invoiceDate,
    dueDate:        form.showDueDate ? form.dueDate : undefined,
    ewayBillNo:     form.eWayBillNo    || undefined,
    challanNo:      form.challanNo     || undefined,
    financedBy:     form.financedBy    || undefined,
    salesman:       form.salesman      || undefined,
    emailId:        form.emailId       || undefined,
    warrantyPeriod: form.warrantyPeriod || undefined,
    notes:          form.notes         || undefined,
    termsConditions: form.termsConditions || undefined,
    paymentMode:    form.paymentMethod || undefined,
    receivedAmount: Number(form.amountReceived) || 0,
    discountAmount: Number(form.discountAmt)    || 0,
    roundOff:       Number(form.roundOffAmt)    || 0,
    applyTcs:       form.applyTCS,
    tcsRate:        form.tcsRate,
    autoRoundOff:   form.roundOff !== "none",
    items: form.billItems.map((i) => ({
      productId:   i.itemId,
      quantity:    Number(i.qty)         || 0,
      price:       Number(i.price)       || 0,
      taxRate:     Number(i.taxRate)     || 0,
      discountPct: Number(i.discountPct) || 0,
      discount:    Number(i.discountAmt) || 0,
    })),
    additionalCharges: form.additionalCharges.map((c) => ({
      name:   c.label,
      amount: Number(c.amount) || 0,
    })),
    signatureUrl:          form.signatureUrl          || undefined,
    showEmptySignatureBox: form.showEmptySignatureBox ?? false,
  };
}

// ─── API params for GET /invoices ─────────────────────────────────────────────

export interface GetInvoicesParams {
  page?:      number;
  limit?:     number;
  search?:    string;
  status?:    string;
  from?:      string;
  to?:        string;
  sortField?: string;
  sortDir?:   "asc" | "desc";
}

// ─── Generic fetch helper ─────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message ?? `Request failed: ${res.status}`);
  }
  return json;
}

// ─── Invoice endpoints ────────────────────────────────────────────────────────

/** GET /api/invoices  (with pagination / filters) */
export async function getInvoices(params: GetInvoicesParams = {}): Promise<{
  invoices: SaleInvoice[];
  total: number;
  page: number;
  pages: number;
}> {
  const qs = new URLSearchParams();
  if (params.page)      qs.set("page",      String(params.page));
  if (params.limit)     qs.set("limit",     String(params.limit));
  if (params.search)    qs.set("search",    params.search);
  if (params.status)    qs.set("status",    params.status);
  if (params.from)      qs.set("from",      params.from);
  if (params.to)        qs.set("to",        params.to);
  if (params.sortField) qs.set("sortField", params.sortField);
  if (params.sortDir)   qs.set("sortDir",   params.sortDir);

  const json = await apiFetch<{ success: boolean; data: any }>(`/invoices?${qs}`);
  if (Array.isArray(json.data)) {
    return { invoices: json.data, total: json.data.length, page: 1, pages: 1 };
  }
  return json.data;
}

/** GET /api/invoices/:id */
export async function getInvoiceById(id: string | number): Promise<SaleInvoice> {
  const json = await apiFetch<{ success: boolean; data: SaleInvoice }>(`/invoices/${id}`);
  return json.data;
}

/** POST /api/invoices */
export async function createInvoice(payload: CreateInvoicePayload): Promise<SaleInvoice> {
  const json = await apiFetch<{ success: boolean; data: SaleInvoice }>("/invoices", {
    method: "POST",
    body:   JSON.stringify(payload),
  });
  return json.data;
}

/** PUT /api/invoices/:id  (meta-field update) */
export async function updateInvoice(
  id: string | number,
  payload: Partial<CreateInvoicePayload>
): Promise<SaleInvoice> {
  const json = await apiFetch<{ success: boolean; data: SaleInvoice }>(`/invoices/${id}`, {
    method: "PUT",
    body:   JSON.stringify(payload),
  });
  return json.data;
}

/** PATCH /api/invoices/:id/cancel */
export async function cancelInvoice(id: string | number): Promise<void> {
  await apiFetch(`/invoices/${id}/cancel`, { method: "PATCH" });
}

/** DELETE /api/invoices/:id */
export async function deleteInvoice(id: string | number): Promise<void> {
  await apiFetch(`/invoices/${id}`, { method: "DELETE" });
}

/** PATCH /api/invoices/:id/payment */
export async function recordPayment(
  id: string | number,
  payload: {
    amount:       number;
    paymentMode:  string;
    paymentDate?: string;
    discount?:    number;
    notes?:       string;
    applyTds?:    boolean;
    tdsAmount?:   number;
  }
): Promise<SaleInvoice> {
  const numericId = typeof id === "string" ? id.replace(/\D/g, "") || id : id;
  const json = await apiFetch<{ success: boolean; data: SaleInvoice }>(
    `/invoices/${numericId}/payment`,
    { method: "PATCH", body: JSON.stringify(payload) }
  );
  return json.data;
}

/** GET /api/invoices/summary */
export async function getInvoiceSummary(): Promise<{
  totalSales:       number;
  totalReceived:    number;
  totalOutstanding: number;
  totalCancelled:   number;
  openCount:        number;
  partialCount:     number;
  paidCount:        number;
  cancelledCount:   number;
}> {
  const json = await apiFetch<{ success: boolean; data: any }>("/invoices/summary");
  return {
    totalSales:       Number(json.data.totalInvoiced    ?? json.data.totalSales    ?? 0),
    totalReceived:    Number(json.data.totalReceived    ?? json.data.totalPaid     ?? 0),
    totalOutstanding: Number(json.data.totalOutstanding ?? json.data.totalUnpaid   ?? 0),
    totalCancelled:   Number(json.data.totalCancelled   ?? 0),
    openCount:        json.data.openCount      ?? 0,
    partialCount:     json.data.partialCount   ?? 0,
    paidCount:        json.data.paidCount      ?? 0,
    cancelledCount:   json.data.cancelledCount ?? 0,
  };
}

// ─── Party endpoints ──────────────────────────────────────────────────────────

export interface BackendParty {
  id: number;
  name: string;
  partyName: string;
  mobileNumber?: string | null;
  email?: string | null;
  gstin?: string | null;
  billingAddress?: string | null;
  shippingAddress?: string | null;
  partyType: string;
  partyCategory?: string | null;
}

export async function getParties(): Promise<BackendParty[]> {
  const json = await apiFetch<{ success: boolean; data: BackendParty[] }>("/parties");
  return json.data;
}

export async function createParty(payload: {
  partyName: string;
  mobileNumber?: string;
  billingAddress?: string;
  shippingAddress?: string;
  gstin?: string;
  partyType: "Customer" | "Supplier";
}): Promise<BackendParty> {
  const json = await apiFetch<{ success: boolean; data: BackendParty }>("/parties", {
    method: "POST",
    body:   JSON.stringify(payload),
  });
  return json.data;
}

// ─── Item / Product endpoints ─────────────────────────────────────────────────

export interface BackendItem {
  id: number;
  name: string;
  itemCode?: string | null;
  hsnCode?: string | null;
  unit?: string | null;
  salesPrice?: number | null;
  purchasePrice?: number | null;
  category?: string | null;
  gstRate?: string | null;
  itemType: string;
  ProductStock?: Array<{
    openingStock: number;
    currentStock?: number;
  }>;
}

export async function getItems(): Promise<BackendItem[]> {
  const json = await apiFetch<{ success: boolean; data: BackendItem[] }>("/items");
  return json.data;
}

// ─── Party Shipping Addresses ─────────────────────────────────────────────────

export interface ShippingAddressPayload {
  partyId: number;
  name: string;
  street: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface BackendShippingAddress {
  id: number;
  partyId: number;
  addressType: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export async function getPartyAddresses(partyId: number): Promise<BackendShippingAddress[]> {
  const json = await apiFetch<{ success: boolean; data: BackendShippingAddress[] }>(
    `/parties/${partyId}/addresses`
  );
  return json.data;
}

export async function createPartyAddress(
  partyId: number,
  payload: { addressType: string; addressLine: string; city: string; state: string; pincode: string }
): Promise<BackendShippingAddress> {
  const json = await apiFetch<{ success: boolean; data: BackendShippingAddress }>(
    `/parties/${partyId}/addresses`,
    { method: "POST", body: JSON.stringify(payload) }
  );
  return json.data;
}

// ─── Party Bank Accounts ──────────────────────────────────────────────────────

export interface BackendBankAccount {
  id: number;
  partyId: number;
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  branchName?: string | null;
  upiId?: string | null;
}

export async function getPartyBankAccounts(partyId: number): Promise<BackendBankAccount[]> {
  const json = await apiFetch<{ success: boolean; data: BackendBankAccount[] }>(
    `/parties/${partyId}/bank-accounts`
  );
  return json.data;
}

export async function createPartyBankAccount(
  partyId: number,
  payload: {
    accountHolder: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    branchName?: string;
    upiId?: string;
  }
): Promise<BackendBankAccount> {
  const json = await apiFetch<{ success: boolean; data: BackendBankAccount }>(
    `/parties/${partyId}/bank-accounts`,
    { method: "POST", body: JSON.stringify(payload) }
  );
  return json.data;
}

// ─── Invoice Settings ─────────────────────────────────────────────────────────

export interface InvoiceSettings {
  id:                 number | null;
  enablePrefix:       boolean;
  prefix:             string;
  sequenceNumber:     number;
  showPurchasePrice:  boolean;
  showItemImage:      boolean;
  enablePriceHistory: boolean;
  invoiceTheme:       string;
}

const SETTINGS_DEFAULTS: InvoiceSettings = {
  id:                 null,
  enablePrefix:       false,
  prefix:             "",
  sequenceNumber:     1,
  showPurchasePrice:  true,
  showItemImage:      true,
  enablePriceHistory: true,
  invoiceTheme:       "Advanced GST",
};

export async function getInvoiceSettings(): Promise<InvoiceSettings> {
  try {
    const res  = await fetch("/api/invoice-settings");
    const body = await res.json().catch(() => ({}));
    return { ...SETTINGS_DEFAULTS, ...(body.data ?? {}) };
  } catch {
    return SETTINGS_DEFAULTS;
  }
}

export async function saveInvoiceSettings(
  payload: Omit<InvoiceSettings, "id">
): Promise<InvoiceSettings> {
  const res  = await fetch("/api/invoice-settings", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!body.success) throw new Error(body.message ?? "Failed to save settings");
  return { ...SETTINGS_DEFAULTS, ...(body.data ?? {}) };
}

/**
 * Builds the invoice number preview from saved settings.
 * Must match the backend logic in invoice_controller.ts exactly:
 *   prefix = enablePrefix && prefix.trim() ? prefix.trim() : "INV-"
 *   invoiceNo = `${prefix}${sequenceNumber.padStart(5, "0")}`
 */
export function buildInvoiceNo(s: InvoiceSettings): string {
  const prefix = s.enablePrefix && s.prefix?.trim()
    ? s.prefix.trim()
    : "INV-";
  const seq = String(s.sequenceNumber ?? 1).padStart(5, "0");
  return `${prefix}${seq}`;
}