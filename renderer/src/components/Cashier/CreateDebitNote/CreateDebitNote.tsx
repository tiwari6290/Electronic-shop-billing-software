import { useState } from "react";
import Navbar from "../Navbar";
import BillForm from "../Billform";
import QuickVoucherSettingsModal from "../QuickQuotationSettingsModal/QuickVoucherSettingsModal";

export default function CreateDebitNote() {
  const [openSettings, setOpenSettings] = useState(false);

  return (
    <>
      <Navbar
        title="Create Debit Note"
        showBackButton
        backPath="/dashboard"
        showSettings
        onSettingsClick={() => setOpenSettings(true)}   
        primaryAction={{
          label: "Save",
          onClick: () => {
            console.log("Save Debit Note");
          },
        }}
        secondaryAction={{
          label: "Save & New",
          onClick: () => {
            console.log("Save & New Debit Note");
          },
        }}
      />

      <BillForm mode="debit" />

      {openSettings && (
        <QuickVoucherSettingsModal
          type="debitNote"  
          onClose={() => setOpenSettings(false)}
        />
      )}
    </>
  );
}
