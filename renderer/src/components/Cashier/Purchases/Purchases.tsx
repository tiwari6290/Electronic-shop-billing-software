import { useState } from "react";
import Navbar from "../Navbar";
import BillForm from "../Billform";
import QuickVoucherSettingsModal from "../QuickQuotationSettingsModal/QuickVoucherSettingsModal";

const Purchases = () => {
  const [openSettings, setOpenSettings] = useState(false);

  return (
    <>
      <Navbar
        title="Create Purchase Invoice"
        backPath="/purchases"
        showSettings
        onSettingsClick={() => setOpenSettings(true)}  
        uploadAction={{
          label: "Upload using Phone",
          onClick: () => console.log("Upload from phone"),
        }}
        secondaryAction={{
          label: "Save & New",
          onClick: () => console.log("Save & New"),
        }}
        primaryAction={{
          label: "Save",
          onClick: () => console.log("Save"),
        }}
      />

      <BillForm mode="purchase" />

      {openSettings && (
        <QuickVoucherSettingsModal
          type="purchaseInvoice"  
          onClose={() => setOpenSettings(false)}
        />
      )}
    </>
  );
};

export default Purchases;
