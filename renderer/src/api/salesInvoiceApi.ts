// ─── salesInvoiceApi.ts ───────────────────────────────────────────────────────
// Full API layer for Sales Invoice module. No localStorage used anywhere.

import api from "@/lib/axios";

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
  // ── NEW extended fields ──────────────────────────────────────────────────
  poNumber?: string | null;
  vehicleNo?: string | null;
  dispatchedThrough?: string | null;
  transportName?: string | null;
  customFieldValues?: Record<string, string> | null;
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
  paymentDetails?: Record<string, any> | null;
  financeDetails?: Record<string, any> | null;
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
    productId:   number | null;    // null for free-text items
    productName?: string | null;   // always present for free-text items
    quantity: number;
    price: number;
    discount?: number | null;
    discountPct?: number | null;
    taxRate?: number | null;
    taxAmount?: number | null;
    total: number;
    product?: {                    // optional — absent for free-text items
      id: number;
      name: string;
      itemCode?: string | null;
      hsnCode?: string | null;
      unit?: string | null;
      gstRate?: string | null;
    } | null;
  }>;
  additionalCharges: Array<{
    id: number;
    name: string;
    amount: number;
    taxLabel?: string | null;
    taxAmount?: number | null;
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
  // ── NEW extended meta fields ─────────────────────────────────────────────
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
  paymentDetails?: Record<string, any>;
  financeDetails?: Record<string, any>;
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
    // FIX: itemId is number | undefined because free-text items have no linked product.
    // The mapper produces `item.productId ?? undefined` which is correctly typed here.
    itemId: number | undefined;
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
    eWayBillNo:       inv.ewayBillNo     ?? "",
    challanNo:        inv.challanNo      ?? "",
    financedBy:       inv.financedBy     ?? "",
    salesman:         inv.salesman       ?? "",
    emailId:          inv.emailId        ?? "",
    warrantyPeriod:   inv.warrantyPeriod ?? "",
    notes:            inv.notes          ?? "",
    termsConditions:  inv.termsConditions ?? "",
    // ── Map new extended fields back to frontend ──────────────────────────
    poNumber:          inv.poNumber          ?? "",
    vehicleNo:         inv.vehicleNo         ?? "",
    dispatchedThrough: inv.dispatchedThrough ?? "",
    transportName:     inv.transportName     ?? "",
    customFieldValues: (inv.customFieldValues as Record<string, string>) ?? {},
    snapshotMetaFields: (inv.snapshotMetaFields as FeSalesInvoice["snapshotMetaFields"]) ?? null,
    paymentDetails:    (inv.paymentDetails   as Record<string, any>)    ?? undefined,
    financeDetails:    (inv.financeDetails   as Record<string, any>)    ?? undefined,
    party: inv.party
      ? {
          id:              inv.party.id,
          name:            inv.party.partyName || inv.party.name,
          mobile:          inv.party.mobileNumber ?? "",
          balance:         0,
          email:           inv.party.email           ?? undefined,
          gstin:           inv.party.gstin           ?? undefined,
          billingAddress:  inv.party.billingAddress  ?? undefined,
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
      const resolvedTaxRate = Number(
        item.taxRate != null && item.taxRate !== 0
          ? item.taxRate
          : item.product?.gstRate ?? 0
      ) || 0;

      const resolvedTaxLabel = resolvedTaxRate > 0
        ? `GST ${resolvedTaxRate}%`
        : "";

      return {
        rowId:       `row-${item.id}-${idx}`,
        // FIX: productId is null for free-text items; undefined is the correct
        // sentinel value here — downstream code checks `itemId != null` to detect
        // whether a real product is linked (see toCreatePayload below).
        itemId:      item.productId ?? undefined,
        name:        item.product?.name ?? item.productName ?? "",
        description: (item as any).description ?? "",
        hsn:         item.product?.hsnCode ?? "",
        qty:         item.quantity,
        unit:        item.product?.unit ?? "PCS",
        price:       Number(item.price),
        discountPct: Number(item.discountPct ?? 0),
        discountAmt: Number(item.discount ?? 0),
        taxRate:     resolvedTaxRate,
        taxLabel:    resolvedTaxLabel,
        amount:      Number(item.total),
      };
    }),
    // ── Map additionalCharges — now include taxLabel from backend ──────────
    additionalCharges: (inv.additionalCharges ?? []).map((c) => ({
      id:       String(c.id),
      label:    c.name,
      amount:   Number(c.amount),
      taxLabel: c.taxLabel ?? "No Tax Applicable",
    })),
    discountType:          "Discount After Tax",
    discountPct:           0,
    discountAmt:           Number(inv.discountAmount ?? 0),
    applyTCS:              inv.applyTcs,
    tcsRate:               0,
    tcsLabel:              "",
    tcsBase:               "Taxable Amount",
    roundOff:              inv.autoRoundOff ? "+Add" : "none",
    roundOffAmt:           Number(inv.roundOff ?? 0),
    amountReceived:        Number(inv.receivedAmount ?? 0),
    paymentMethod:         inv.paymentMode ?? "Cash",
    showColumns:           { pricePerItem: true, quantity: true },
    signatureUrl:          inv.signatureUrl ?? "",
    showEmptySignatureBox: inv.showEmptySignatureBox ?? false,
    status:                statusMap[inv.status] ?? "Unpaid",
    createdAt:             inv.createdAt?.split("T")[0] ?? "",
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
    productId?:   number;        // optional — omitted for free-text items
    productName?: string;        // always sent so backend can display the name
    description?: string;        // item description / notes
    quantity:     number;
    price:        number;
    taxRate:      number;
    discountPct:  number;
    discount:     number;
  }>;
  // ── additionalCharges now includes taxLabel ──────────────────────────────
  additionalCharges: Array<{ name: string; amount: number; taxLabel?: string }>;
  subTotal?:               number;
  taxAmount?:              number;
  tcsAmount?:              number;
  tcsRate?:                number;
  totalAmount?:            number;
  outstandingAmount?:      number;
  additionalChargesTotal?: number;
  signatureUrl?:           string | null;
  showEmptySignatureBox?:  boolean;
  // ── NEW extended fields ──────────────────────────────────────────────────
  poNumber?:          string | null;
  vehicleNo?:         string | null;
  dispatchedThrough?: string | null;
  transportName?:     string | null;
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
  paymentDetails?:    Record<string, any> | null;
  financeDetails?:    Record<string, any> | null;
}

export function toCreatePayload(form: FeSalesInvoice): CreateInvoicePayload {
  return {
    partyId:         form.party!.id,
    invoiceDate:     form.invoiceDate,
    dueDate:         form.showDueDate ? form.dueDate : undefined,
    ewayBillNo:      form.eWayBillNo      || undefined,
    challanNo:       form.challanNo       || undefined,
    financedBy:      form.financedBy      || undefined,
    salesman:        form.salesman        || undefined,
    emailId:         form.emailId         || undefined,
    warrantyPeriod:  form.warrantyPeriod  || undefined,
    notes:           form.notes           || undefined,
    termsConditions: form.termsConditions || undefined,
    paymentMode:     form.paymentMethod   || undefined,
    receivedAmount:  Number(form.amountReceived) || 0,
    discountAmount:  Number(form.discountAmt)    || 0,
    roundOff:        Number(form.roundOffAmt)    || 0,
    applyTcs:        form.applyTCS,
    tcsRate:         form.tcsRate,
    autoRoundOff:    form.roundOff !== "none",
    items: form.billItems.map((i) => ({
      // Only send productId when it's a real linked product (not free-text)
      ...(i.itemId != null ? { productId: Number(i.itemId) } : {}),
      // Always send productName so free-text items are preserved on the backend
      productName: i.name || "Item",
      description: i.description || undefined,
      quantity:    Number(i.qty)         || 0,
      price:       Number(i.price)       || 0,
      taxRate:     Number(i.taxRate)     || 0,
      discountPct: Number(i.discountPct) || 0,
      discount:    Number(i.discountAmt) || 0,
    })),
    // ── additionalCharges — now sends taxLabel to backend ─────────────────
    additionalCharges: form.additionalCharges.map((c) => ({
      name:     c.label,
      amount:   Number(c.amount) || 0,
      taxLabel: c.taxLabel || "No Tax Applicable",
    })),
    signatureUrl:          form.signatureUrl          || undefined,
    showEmptySignatureBox: form.showEmptySignatureBox ?? false,
    // ── NEW extended fields ───────────────────────────────────────────────
    poNumber:          form.poNumber          || null,
    vehicleNo:         form.vehicleNo         || null,
    dispatchedThrough: form.dispatchedThrough || null,
    transportName:     form.transportName     || null,
    customFieldValues: form.customFieldValues || {},
    snapshotMetaFields: form.snapshotMetaFields ?? null,
    paymentDetails:    form.paymentDetails    || null,
    financeDetails:    (form.financeDetails as any)?.enabled === true
                         ? form.financeDetails
                         : null,
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

  const res = await api.get(`/invoices?${qs}`);
  const json = res.data;
  if (Array.isArray(json.data)) {
    return { invoices: json.data, total: json.data.length, page: 1, pages: 1 };
  }
  return json.data;
}

/** GET /api/invoices/:id */
export async function getInvoiceById(id: string | number): Promise<SaleInvoice> {
  const res = await api.get(`/invoices/${id}`);
  return res.data.data;
}

/** POST /api/invoices */
export async function createInvoice(payload: CreateInvoicePayload): Promise<SaleInvoice> {
  const res = await api.post(`/invoices`, payload);
  return res.data.data;
}

/** PUT /api/invoices/:id */
export async function updateInvoice(
  id: string | number,
  payload: Partial<CreateInvoicePayload>
): Promise<SaleInvoice> {
  const res = await api.put(`/invoices/${id}`, payload);
  return res.data.data;
}

/** PATCH /api/invoices/:id/cancel */
export async function cancelInvoice(id: string | number): Promise<void> {
  await api.patch(`/invoices/${id}/cancel`);
}

/** DELETE /api/invoices/:id */
export async function deleteInvoice(id: string | number): Promise<void> {
  await api.delete(`/invoices/${id}`);
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
  const res = await api.patch(`/invoices/${numericId}/payment`, payload);
  return res.data.data;
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
  const res = await api.get(`/invoices/summary`);
  const data = res.data.data;
  return {
    totalSales:       Number(data.totalInvoiced    ?? data.totalSales    ?? 0),
    totalReceived:    Number(data.totalReceived    ?? data.totalPaid     ?? 0),
    totalOutstanding: Number(data.totalOutstanding ?? data.totalUnpaid   ?? 0),
    totalCancelled:   Number(data.totalCancelled   ?? 0),
    openCount:        data.openCount      ?? 0,
    partialCount:     data.partialCount   ?? 0,
    paidCount:        data.paidCount      ?? 0,
    cancelledCount:   data.cancelledCount ?? 0,
  };
}

// ─── Invoice Details Settings ─────────────────────────────────────────────────

export interface InvoiceDetailsSettings {
  id: number;
  showChallan:           boolean;
  showDispatchedThrough: boolean;
  showEmailId:           boolean;
  showFinancedBy:        boolean;
  showSalesman:          boolean;
  showTransportName:     boolean;
  showWarranty:          boolean;
  showPO:                boolean;
  showEwayBill:          boolean;
  showVehicle:           boolean;
  customFields: Array<{ label: string; value: string }>;
}

const DETAILS_SETTINGS_DEFAULTS: InvoiceDetailsSettings = {
  id:                    0,
  showChallan:           true,
  showDispatchedThrough: false,
  showEmailId:           true,
  showFinancedBy:        true,
  showSalesman:          true,
  showTransportName:     false,
  showWarranty:          true,
  showPO:                false,
  showEwayBill:          true,
  showVehicle:           false,
  customFields:          [],
};

/** GET /api/invoice-details-settings */
export async function getInvoiceDetailsSettings(): Promise<InvoiceDetailsSettings> {
  try {
    const res  = await fetch("/invoice-details-settings");
    const body = await res.json().catch(() => ({}));
    return { ...DETAILS_SETTINGS_DEFAULTS, ...(body.data ?? {}) };
  } catch {
    return DETAILS_SETTINGS_DEFAULTS;
  }
}

/** PUT /api/invoice-details-settings */
export async function saveInvoiceDetailsSettings(
  payload: Omit<InvoiceDetailsSettings, "id">
): Promise<InvoiceDetailsSettings> {
  const res  = await fetch("/invoice-details-settings", {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!body.success) throw new Error(body.message ?? "Failed to save invoice details settings");
  return { ...DETAILS_SETTINGS_DEFAULTS, ...(body.data ?? {}) };
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
  const res = await api.get(`/parties`);
  return res.data.data;
}

export async function createParty(payload: {
  partyName: string;
  mobileNumber?: string;
  billingAddress?: string;
  shippingAddress?: string;
  gstin?: string;
  partyType: "Customer" | "Supplier";
}): Promise<BackendParty> {
  const res = await api.post(`/parties`, payload);
  return res.data.data;
}

// ─── Item / Product endpoints ─────────────────────────────────────────────────

export interface BackendItem {
  id: number;
  name: string;
  itemCode?: string | null;
  hsnCode?: string | null;
  unit?: string | null;
  /** Original price as typed by the user (may be with-tax or without-tax) */
  salesPrice?: number | null;
  /**
   * Pre-tax base price — ALWAYS use this on invoices so tax is calculated
   * on top of it correctly. Falls back to salesPrice for legacy items.
   */
  baseSalesPrice?: number | null;
  /** true when the stored salesPrice was entered inclusive of GST */
  salesPriceInclTax?: boolean;
  /** Default discount % set on the item — pre-filled into invoice rows */
  salesDiscountPercent?: number | null;
  purchasePrice?: number | null;
  category?: string | null;
  /** GST rate string: "18", "5", "28+cess5", "Exempted", or null */
  gstRate?: string | null;
  /** Item description / short notes set on the item master */
  description?: string | null;
  itemType: string;
  ProductStock?: Array<{
    openingStock: number;
    currentStock?: number;
  }>;
}

export async function getItems(): Promise<BackendItem[]> {
  const res = await api.get(`/items`);
  return res.data.data;
}

// ─── Party Shipping Addresses ─────────────────────────────────────────────────

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
  const res = await api.get(`/parties/${partyId}/addresses`);
  return res.data.data;
}

export async function createPartyAddress(
  partyId: number,
  payload: { addressType: string; addressLine: string; city: string; state: string; pincode: string }
): Promise<BackendShippingAddress> {
  const res = await api.post(`/parties/${partyId}/addresses`, payload);
  return res.data.data;
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
  const res = await api.get(`/parties/${partyId}/bank-accounts`);
  return res.data.data;
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
  const res = await api.post(`/parties/${partyId}/bank-accounts`, payload);
  return res.data.data;
}

// ─── Invoice Settings (prefix / sequence) ────────────────────────────────────

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
    const res = await api.get(`/invoice-settings`);
    return { ...SETTINGS_DEFAULTS, ...(res.data.data ?? {}) };
  } catch {
    return SETTINGS_DEFAULTS;
  }
}

export async function saveInvoiceSettings(
  payload: Omit<InvoiceSettings, "id">
): Promise<InvoiceSettings> {
  const res = await api.post(`/invoice-settings`, payload);
  if (!res.data.success) throw new Error(res.data.message ?? "Failed to save settings");
  return { ...SETTINGS_DEFAULTS, ...(res.data.data ?? {}) };
}

/**
 * Builds the invoice number preview from saved settings.
 * Must match the backend logic in invoice_controller.ts:
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