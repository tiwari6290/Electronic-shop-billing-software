import Navbar from "../Navbar";
import BillForm from "../Billform";

export default function DeliveryChallan(){
    return(
        <>
        <Navbar
        title="Create Delivery Challan"
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
      <BillForm mode="deliveryChallan" />
        </>
    );
}