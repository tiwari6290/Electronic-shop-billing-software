// ─── invoiceMapper.ts ─────────────────────────────────────────────────────────
// Maps raw backend Invoice → frontend SalesInvoice form state

import { SaleInvoice, fromSaleInvoice } from "@/api/salesInvoiceApi";
import { SalesInvoice } from "../components/Cashier/Salesinvoices/SalesInvoiceTypes";

export function mapBackendInvoice(inv: SaleInvoice): SalesInvoice {
  const fe = fromSaleInvoice(inv);
  // Cast is safe because fromSaleInvoice returns a structurally identical shape
  return fe as unknown as SalesInvoice;
}