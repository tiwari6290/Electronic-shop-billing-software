import { useState } from "react";
import BillForm from "../Billform";
import Navbar from "../Navbar";
import QuickVoucherSettingsModal from "../QuickQuotationSettingsModal/QuickVoucherSettingsModal";

export default function PurchaseOrder() {
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  return (
    <>
      <Navbar
        title="Create Purchase Order"
        showBackButton={true}
        backPath="/dashboard"
        showSettings={true}
        onSettingsClick={() => setShowSettingsModal(true)}
        primaryAction={{
          label: "Save",
          onClick: () => console.log("Save Purchase Order"),
        }}
        secondaryAction={{
          label: "Save & New",
          onClick: () => console.log("Save & New Purchase Order"),
        }}
      />

      <BillForm mode="purchaseOrder" />

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <QuickVoucherSettingsModal
          type="purchaseOrder"
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </>
  );
}
