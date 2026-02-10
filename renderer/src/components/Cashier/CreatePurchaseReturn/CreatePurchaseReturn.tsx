import Navbar from "../Navbar";
import BillForm from "../Billform";

export default function CreatePurchaseReturn() {
  return (
    <>
      <Navbar
  title="Create Purchase Return"
  showBackButton={true}
  backPath="/dashboard"
  showSettings={true}
  settingsLabel="Settings"
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
    </>
  );
}
