import { Routes, Route, Navigate } from "react-router-dom";

import CashierCreateParty from "../CashierCreateParty/CashierCreateParty";
import CashierCreateItem from "../CashierCreateItem/CashierCreateItem";

import CashierQuotation from "../CashierQuotation/CashierQuotation";
import CashierPaymentIn from "../CashierPaymentIn/CashierPaymentIn";
import CashierSalesReturn from "../CashierSalesReturn/CashierSalesReturn";
import CashierCreditNote from "../CashierCreditNote/CashierCreditNote";
import CashierDeliveryChallan from "../CashierDeliveryChallan/CashierDeliveryChallan";
import CashierProformaInvoice from "../CashierProformaInvoice/CashierProformaInvoice";

import CashierPurchase from "../CashierPurchase/CashierPurchase";
import CashierPaymentOut from "../CashierPaymentOut/CashierPaymentOut";
import CashierPurchaseReturn from "../CashierPurchaseReturn/CashierPurchaseReturn";
import CashierDebitNote from "../CashierDebitNote/CashierDebitNote";
import CashierPurchaseOrders from "../CashierPurchaseOrders/CashierPurchaseOrders";

export default function CashierRoutes() {
  return (
    <Routes>

      {/* DEFAULT → CREATE PARTY */}
      <Route index element={<Navigate to="create-party" replace />} />

      {/* GENERAL */}
      <Route path="create-party" element={<CashierCreateParty />} />
      <Route path="create-item" element={<CashierCreateItem />} />

      {/* SALES */}
      <Route path="quotation" element={<CashierQuotation />} />
      <Route path="payment-in" element={<CashierPaymentIn />} />
      <Route path="sales-return" element={<CashierSalesReturn />} />
      <Route path="credit-note" element={<CashierCreditNote />} />
      <Route path="delivery-challan" element={<CashierDeliveryChallan />} />
      <Route path="proforma-invoice" element={<CashierProformaInvoice />} />

      {/* PURCHASE */}
      <Route path="purchase" element={<CashierPurchase />} />
      <Route path="payment-out" element={<CashierPaymentOut />} />
      <Route path="purchase-return" element={<CashierPurchaseReturn />} />
      <Route path="debit-note" element={<CashierDebitNote />} />
      <Route path="purchase-orders" element={<CashierPurchaseOrders />} />

    </Routes>
  );
}
