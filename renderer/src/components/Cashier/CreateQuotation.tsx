import { useState } from "react";
import Navbar from "./Navbar";
import BillForm from "./Billform";
import QuickQuotationSettingsModal from "./QuickQuotationSettingsModal/QuickQuotationSettingsModal";

export default function CreateQuotation() {
  const [openSettings, setOpenSettings] = useState(false);

  return (
    <>
      <Navbar
        title="Create Quotation"
        showBackButton={true}
        backPath="/dashboard"
        showSettings={true}
        settingsLabel="Settings"
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

      <BillForm mode="sale" />

      {openSettings && (
        <QuickQuotationSettingsModal
          onClose={() => setOpenSettings(false)}
        />
      )}
    </>
  );
}
