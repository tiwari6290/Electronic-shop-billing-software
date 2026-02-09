import BillForm from "../Billform";
import Navbar from "../Navbar";
export default function CreateCreditNote(){
    return(
        <>
        <Navbar
        title="Create Credit Note"
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
        <BillForm mode="credit" />
        </>
    );
}