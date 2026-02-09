import BillForm from "../Billform";
import Navbar from "../Navbar";

export default function PurchaseOrder(){
    return (
        <>
        <Navbar
        title=" Create Purchase Order"
        showBackButton={true}
        backPath="/dashboard"

        showSettings={true}

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
      <BillForm mode="purchaseOrder" />
        </>
    );
}