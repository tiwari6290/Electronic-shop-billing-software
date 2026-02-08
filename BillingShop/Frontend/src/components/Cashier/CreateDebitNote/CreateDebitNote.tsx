import Navbar from "../Navbar";
import BillForm from "../Billform";

export default function CreateDebitNote() {
  return (
    <>
      <Navbar
        title="Create Debit Note"
        showBackButton={true}
        backPath="/dashboard"
      />

      <BillForm mode="debit" />
    </>
  );
}
