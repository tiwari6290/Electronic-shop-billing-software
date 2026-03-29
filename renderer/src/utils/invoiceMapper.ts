/**
 * invoiceMapper.ts
 *
 * Maps a raw backend invoice response (from getInvoiceById) to the
 * SalesInvoice shape used by the CreateSalesInvoice form.
 *
 * Centralising this here means:
 *  - The edit-mode load path (CreateSalesInvoice useEffect) is clean.
 *  - New fields (like snapshotMetaFields, customFieldValues) only need
 *    to be added in one place.
 */

import type { SalesInvoice } from "../components/Cashier/Salesinvoices/SalesInvoiceTypes";

// ─── Shape returned by getInvoiceById (backend + enriched items) ─────────────
// This is a loose "any-like" interface so the mapper is resilient to
// backend schema evolution without requiring synchronised frontend changes.
interface BackendInvoice {
  id: number | string;
  invoiceNo: string;
  invoiceDate?: string | null;
  dueDate?: string | null;
  ewayBillNo?: string | null;
  challanNo?: string | null;
  financedBy?: string | null;
  salesman?: string | null;
  emailId?: string | null;
  warrantyPeriod?: string | null;
  notes?: string | null;
  termsConditions?: string | null;
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
  paymentMode?: string | null;
  paymentDetails?: Record<string, any> | null;
  financeDetails?: Record<string, any> | null;
  receivedAmount?: number | null;
  discountAmount?: number | null;
  roundOff?: number | null;
  applyTcs?: boolean;
  tcsRate?: number | null;
  autoRoundOff?: boolean;
  signatureUrl?: string | null;
  showEmptySignatureBox?: boolean;
  status?: string;
  createdAt?: string;
  party?: {
    id: number;
    name?: string;
    partyName?: string;
    mobileNumber?: string | null;
    email?: string | null;
    gstin?: string | null;
    billingAddress?: string | null;
    shippingAddress?: string | null;
  } | null;
  items?: Array<{
    id?: number;
    productId?: number | null;
    productName?: string | null;
    quantity?: number;
    price?: number;
    taxRate?: number | null;
    taxLabel?: string | null;
    discount?: number | null;
    discountPct?: number | null;
    total?: number;
    description?: string | null;
    product?: {
      id?: number;
      name?: string;
      itemCode?: string | null;
      hsnCode?: string | null;
      unit?: string | null;
      gstRate?: string | null;
    } | null;
  }>;
  additionalCharges?: Array<{
    id?: number;
    name?: string;
    amount?: number;
    taxLabel?: string | null;
  }>;
}

/**
 * Map a raw backend invoice to the SalesInvoice form shape.
 *
 * Key guarantees:
 *  - customFieldValues is always a Record<string, string> (never null/undefined)
 *  - snapshotMetaFields is preserved as-is from the backend (may be null for
 *    older invoices — the view modal handles this gracefully via its fallback)
 *  - billItems always have a valid rowId (never collide on re-renders)
 */
export function mapBackendInvoice(inv: BackendInvoice): SalesInvoice {
  const statusMap: Record<string, SalesInvoice["status"]> = {
    PAID:      "Paid",
    OPEN:      "Unpaid",
    PARTIAL:   "Partially Paid",
    CANCELLED: "Unpaid",  // cancelled invoices fall back to Unpaid for edit purposes
  };

  const party = inv.party
    ? {
        id:              inv.party.id,
        name:            inv.party.partyName || inv.party.name || "",
        mobile:          inv.party.mobileNumber ?? "",
        balance:         0,
        email:           inv.party.email          ?? undefined,
        gstin:           inv.party.gstin          ?? undefined,
        billingAddress:  inv.party.billingAddress  ?? undefined,
        shippingAddress: inv.party.shippingAddress ?? undefined,
      }
    : null;

  const billItems: SalesInvoice["billItems"] = (inv.items ?? []).map((item, idx) => {
    const resolvedTaxRate = Number(item.taxRate ?? item.product?.gstRate ?? 0) || 0;
    const resolvedTaxLabel =
      item.taxLabel ||
      (resolvedTaxRate > 0 ? `GST ${resolvedTaxRate}%` : "None");

    return {
      rowId:       `row-${inv.id}-${item.id ?? idx}`,
      itemId:      item.productId ?? undefined,
      name:        item.productName || item.product?.name || "",
      description: item.description ?? "",
      hsn:         item.product?.hsnCode ?? "",
      qty:         Number(item.quantity ?? 1),
      unit:        item.product?.unit ?? "PCS",
      price:       Number(item.price ?? 0),
      discountPct: Number(item.discountPct ?? 0),
      discountAmt: Number(item.discount ?? 0),
      taxLabel:    resolvedTaxLabel,
      taxRate:     resolvedTaxRate,
      amount:      Number(item.total ?? 0),
    };
  });

  const additionalCharges: SalesInvoice["additionalCharges"] = (
    inv.additionalCharges ?? []
  ).map((c, idx) => ({
    id:       `charge-${c.id ?? idx}`,
    label:    c.name ?? "",
    amount:   Number(c.amount ?? 0),
    taxLabel: c.taxLabel ?? "No Tax Applicable",
  }));

  return {
    id:               String(inv.id),
    invoiceNo:        inv.invoiceNo ?? "",
    invoiceDate:      inv.invoiceDate?.split("T")[0] ?? "",
    dueDate:          inv.dueDate?.split("T")[0]     ?? "",
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
    poNumber:         inv.poNumber         ?? "",
    vehicleNo:        inv.vehicleNo        ?? "",
    dispatchedThrough: inv.dispatchedThrough ?? "",
    transportName:    inv.transportName    ?? "",

    // ── Custom fields — always an object, never null ─────────────────────
    customFieldValues:  (inv.customFieldValues  as Record<string, string>) ?? {},

    // ── Snapshot — preserved exactly as stored; view modal handles null ──
    snapshotMetaFields: inv.snapshotMetaFields ?? null,

    paymentDetails: (inv.paymentDetails as SalesInvoice["paymentDetails"]) ?? undefined,
    financeDetails: (inv.financeDetails as SalesInvoice["financeDetails"]) ?? undefined,

    party,
    shipTo: null,

    billItems,
    additionalCharges,

    discountType:  "Discount After Tax",
    discountPct:   0,
    discountAmt:   Number(inv.discountAmount ?? 0),
    applyTCS:      inv.applyTcs ?? false,
    tcsRate:       Number(inv.tcsRate ?? 0),
    tcsLabel:      inv.tcsRate ? `TCS ${inv.tcsRate}%` : "",
    tcsBase:       "Taxable Amount",
    roundOff:      inv.autoRoundOff ? "+Add" : "none",
    roundOffAmt:   Number(inv.roundOff ?? 0),
    amountReceived: Number(inv.receivedAmount ?? 0),
    paymentMethod: inv.paymentMode ?? "Cash",

    showColumns: { pricePerItem: true, quantity: true },
    status:      statusMap[inv.status ?? "OPEN"] ?? "Unpaid",
    createdAt:   inv.createdAt?.split("T")[0] ?? "",
  };
}