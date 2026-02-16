import { useEffect } from "react";
import Navbar from "./Navbar";
import BillForm from "./Billform";
import { useState } from "react";
import QuickVoucherSettingsModal from "./QuickQuotationSettingsModal/QuickVoucherSettingsModal";
export default function SalesReturn() {
  const [openSettings, setOpenSettings] = useState(false);

  useEffect(() => {
    // Change Invoice Prefix
    const prefixInput = document.querySelector(
      'input[value="ME/QO/26-27/"]'
    ) as HTMLInputElement;

    if (prefixInput) {
      prefixInput.value = "ME/SR/26-27/";
      prefixInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Change Quotation Date label text
    const labels = document.querySelectorAll("label");
    labels.forEach(label => {
      if (label.textContent?.includes("Quotation Date")) {
        label.textContent = "Sales Return Date";
      }
    });
  }, []);
  return (
    <>
     <Navbar
  title="Create Sales Return"
  showBackButton
  backPath="/dashboard"
  showSettings
  onSettingsClick={() => setOpenSettings(true)}   // 👈 IMPORTANT
  primaryAction={{
    label: "Save",
    onClick: () => console.log("Save clicked"),
  }}
  secondaryAction={{
    label: "Save & New",
    onClick: () => console.log("Save & New clicked"),
  }}
/>

      <BillForm />
      {openSettings && (
  <QuickVoucherSettingsModal
    type="salesReturn"
    onClose={() => setOpenSettings(false)}
  />
)}

    </>
  );
}