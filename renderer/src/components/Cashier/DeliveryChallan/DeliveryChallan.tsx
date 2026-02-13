import { useState } from "react";
import Navbar from "../Navbar";
import BillForm from "../Billform";
import QuickVoucherSettingsModal from "../QuickQuotationSettingsModal/QuickVoucherSettingsModal";

export default function DeliveryChallan() {
  const [openSettings, setOpenSettings] = useState(false);

  return (
    <>
      <Navbar
        title="Create Delivery Challan"
        showBackButton
        backPath="/dashboard"
        showSettings
        onSettingsClick={() => setOpenSettings(true)}   // 🔥 IMPORTANT
        primaryAction={{
          label: "Save",
          onClick: () => {
            console.log("Save Delivery Challan");
          },
        }}
        secondaryAction={{
          label: "Save & New",
          onClick: () => {
            console.log("Save & New Delivery Challan");
          },
        }}
      />

      <BillForm mode="deliveryChallan" />

      {openSettings && (
        <QuickVoucherSettingsModal
          type="deliveryChallan"   // 🔥 IMPORTANT
          onClose={() => setOpenSettings(false)}
        />
      )}
    </>
  );
}
