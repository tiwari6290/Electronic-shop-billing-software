// ─── partyMapper.ts ───────────────────────────────────────────────────────────
// Maps backend Party shape → frontend Party shape used in SalesInvoice form

import { BackendParty } from "../api/salesInvoiceApi";
import { Party } from "../components/Cashier/Salesinvoices/SalesInvoiceTypes";

export function mapBackendParty(bp: BackendParty): Party {
  return {
    id:              bp.id,
    name:            bp.partyName || bp.name,
    mobile:          bp.mobileNumber ?? "",
    balance:         0, // balance is fetched via ledger separately if needed
    email:           bp.email ?? undefined,
    gstin:           bp.gstin ?? undefined,
    billingAddress:  bp.billingAddress ?? undefined,
    shippingAddress: bp.shippingAddress ?? undefined,
    category:        bp.partyCategory ?? undefined,
    type:            bp.partyType,
  };
}