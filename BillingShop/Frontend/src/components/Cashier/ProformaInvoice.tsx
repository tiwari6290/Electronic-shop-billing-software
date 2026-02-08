import { useEffect } from "react";
import Navbar from "./Navbar";
import BillForm from "./Billform";

export default function ProformaInvoice() {

  useEffect(() => {
    // Change Invoice Prefix
    const prefixInput = document.querySelector(
      'input[value="ME/QO/26-27/"]'
    ) as HTMLInputElement;

    if (prefixInput) {
      prefixInput.value = "ME/PF/26-27/";
      prefixInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Change Quotation Date label text
    const labels = document.querySelectorAll("label");
    labels.forEach(label => {
      if (label.textContent?.includes("Quotation Date")) {
        label.textContent = "Proforma Invoice Date";
      }
    });
  }, []);
  return (
    <>
      <Navbar
  title="Create Proforma Invoice"
  showBackButton={true}
  backPath="/dashboard"
  showSettings={true}
  primaryAction={{
    label: "Save",
    onClick: () => console.log("Save clicked"),
  }}
  secondaryAction={{
    label: "Save & New",
    onClick: () => console.log("Save & New clicked"),
  }}
/>
      <BillForm mode="sale"/>
    </>
  );
}