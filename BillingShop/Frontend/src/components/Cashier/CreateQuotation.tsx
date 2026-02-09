import Navbar from "./Navbar";
import BillForm from "./Billform";

export default function CreateQuotation() {
  return (
    <>
      <Navbar
  title="Create Quotation"
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

      <BillForm mode="sale"  />
    </>
  );
}