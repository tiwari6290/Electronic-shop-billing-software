import { useState } from "react";
import Navbar from "../Navbar";
import BillForm from "../Billform";
import QuickVoucherSettingsModal from "../QuickQuotationSettingsModal/QuickVoucherSettingsModal";

export default function CreatePurchaseReturn() {
  const [openSettings, setOpenSettings] = useState(false);

  return (
    <>
      <Navbar
        title="Create Purchase Return"
        showBackButton
        backPath="/dashboard"
        showSettings
        onSettingsClick={() => setOpenSettings(true)}   
        primaryAction={{
          label: "Save",
          onClick: () => console.log("Save clicked"),
        }}
        secondaryAction={{
          label: "Save & New",
          onClick: () => console.log("Save & New clicked"),
        }}
      />

      <BillForm mode="purchaseReturn" />

      {openSettings && (
        <QuickVoucherSettingsModal
          type="purchaseReturn"   
          onClose={() => setOpenSettings(false)}
        />
      )}
    </>
  );
}
