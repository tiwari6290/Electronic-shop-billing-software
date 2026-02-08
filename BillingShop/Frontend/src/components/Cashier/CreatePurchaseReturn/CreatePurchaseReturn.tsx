import Navbar from "../Navbar";
import BillForm from "../Billform";

export default function CreatePurchaseReturn() {
  return (
    <>
      <Navbar
        title="Create Purchase Return"
        showBackButton={true}
        backPath="/dashboard"
      />

      <BillForm mode="purchaseReturn" />
    </>
  );
}
