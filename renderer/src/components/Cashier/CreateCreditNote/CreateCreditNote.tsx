import { useState } from "react";
import BillForm from "../Billform";
import Navbar from "../Navbar";
import QuickVoucherSettingsModal from "../QuickQuotationSettingsModal/QuickVoucherSettingsModal";

export default function CreateCreditNote() {
  const [openSettings, setOpenSettings] = useState(false);

  return (
    <>
      <Navbar
        title="Create Credit Note"
        showBackButton
        backPath="/dashboard"
        showSettings
        onSettingsClick={() => setOpenSettings(true)}   // 🔥 IMPORTANT
        primaryAction={{
          label: "Save",
          onClick: () => {
            console.log("Save Credit Note");
          },
        }}
        secondaryAction={{
          label: "Save & New",
          onClick: () => {
            console.log("Save & New Credit Note");
          },
        }}
      />

      <BillForm mode="credit" />

      {openSettings && (
        <QuickVoucherSettingsModal
          type="creditNote"
          onClose={() => setOpenSettings(false)}
        />
      )}
    </>
  );
}
