import Navbar from "../Navbar";
import BillForm from "../Billform";

export default function CreateDebitNote() {
  return (
    <>
      <Navbar
        title="Create Debit Note"
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

      <BillForm mode="debit" />
    </>
  );
}
