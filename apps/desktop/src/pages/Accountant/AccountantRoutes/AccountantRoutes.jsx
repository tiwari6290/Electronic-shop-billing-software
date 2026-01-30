import { Routes, Route } from "react-router-dom";

import AccountantDashboard from "../AccountantDashboard/AccountantDashboard";
import AccountantSalesOverview from "../AccountantSalesOverview/AccountantSalesOverview";
import AccountantPurchases from "../AccountantPurchases/AccountantPurchases";
import AccountantSettlements from "../AccountantSettlements/AccountantSettlements";
import AccountantExpenses from "../AccountantExpenses/AccountantExpenses";
import AccountantGstDashboard from "../AccountantGstDashboard/AccountantGstDashboard";
import AccountantLedgers from "../AccountantLedgers/AccountantLedgers";
import AccountantReports from "../AccountantReports/AccountantReports";

export default function AccountantRoutes() {
  return (
    <Routes>
      <Route index element={<AccountantDashboard />} />
      <Route path="sales" element={<AccountantSalesOverview />} />
      <Route path="purchases" element={<AccountantPurchases />} />
      <Route path="settlements" element={<AccountantSettlements />} />
      <Route path="expenses" element={<AccountantExpenses />} />
      <Route path="gst" element={<AccountantGstDashboard />} />
      <Route path="ledgers" element={<AccountantLedgers />} />
      <Route path="reports" element={<AccountantReports />} />
    </Routes>
  );
}
