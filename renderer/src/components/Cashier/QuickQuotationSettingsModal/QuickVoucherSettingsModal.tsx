import React, { useState } from "react";
import { X } from "lucide-react";
import "./QuickQuotationSettingsModal.css";

interface Props {
  type:
  | "quotation"
  | "paymentIn"
  | "salesReturn"
  | "creditNote"
  | "deliveryChallan"
  | "proforma"
  | "purchaseInvoice"
  | "paymentOut"
  | "purchaseReturn"
  | "debitNote"
  | "purchaseOrder"
| "expense";

  onClose: () => void;
}


const QuickVoucherSettingsModal: React.FC<Props> = ({
  type,
  onClose,
}) => {
  const [enablePrefix, setEnablePrefix] = useState(true);
  const [prefix, setPrefix] = useState("");
  const [sequence, setSequence] = useState("1");
  const [showImage, setShowImage] = useState(true);
const [priceHistory, setPriceHistory] = useState(true);



  const voucherConfig = {
    quotation: {
      title: "Quick Quotation Settings",
      prefixLabel: "Quotation Prefix & Sequence Number",
      description:
        "Add your custom prefix & sequence for Quotation Numbering",
      preview: "Quotation Number:",
    },

    paymentIn: {
      title: "Quick Payment In Settings",
      prefixLabel: "Payment In Prefix & Sequence Number",
      description:
        "Add your custom prefix & sequence for Payment In Numbering",
      preview: "Payment In Number:",
    },

    salesReturn: {
      title: "Quick Sales Return Settings",
      prefixLabel: "Sales Return Prefix & Sequence Number",
      description:
        "Add your custom prefix & sequence for Sales Return Numbering",
      preview: "Sales Return Number:",
    },
    creditNote: {
  title: "Quick Credit Note Settings",
  prefixLabel: "Credit Note Prefix & Sequence Number",
  description:
    "Add your custom prefix & sequence for Credit Note Numbering",
  preview: "Credit Note Number:",
},

deliveryChallan: {
  title: "Quick Delivery Challan Settings",
  prefixLabel: "Delivery Challan Prefix & Sequence Number",
  description:
    "Add your custom prefix & sequence for Delivery Challan Numbering",
  preview: "Delivery Challan Number:",
},
proforma: {
  title: "Quick Proforma Settings",
  prefixLabel: "Proforma Prefix & Sequence Number",
  description:
    "Add your custom prefix & sequence for Proforma Numbering",
  preview: "Proforma Number:",
},
purchaseInvoice: {
  title: "Quick Purchase Invoice Settings",
  prefixLabel: "Purchase Invoice Prefix & Sequence Number",
  description:
    "Add your custom prefix & sequence for Purchase Invoice Numbering",
  preview: "Purchase Invoice Number:",
},
paymentOut: {
  title: "Quick Payment Out Settings",
  prefixLabel: "Payment Out Prefix & Sequence Number",
  description:
    "Add your custom prefix & sequence for Payment Out Numbering",
  preview: "Payment Out Number:",
},

purchaseReturn: {
  title: "Quick Purchase Return Settings",
  prefixLabel: "Purchase Return Prefix & Sequence Number",
  description:
    "Add your custom prefix & sequence for Purchase Return Numbering",
  preview: "Purchase Return Number:",
},

debitNote: {
  title: "Quick Debit Note Settings",
  prefixLabel: "Debit Note Prefix & Sequence Number",
  description:
    "Add your custom prefix & sequence for Debit Note Numbering",
  preview: "Debit Note Number:",
},
purchaseOrder: {
  title: "Quick Purchase Order Settings",
  prefixLabel: "Purchase Order Prefix & Sequence Number",
  description:
    "Add your custom prefix & sequence for Purchase Order Numbering",
  preview: "Purchase Order Number:",
},

expense: {
  title: "Quick Expense Settings",
  prefixLabel: "Expense Prefix & Sequence Number",
  description:
    "Add your custom prefix & sequence for Expense Numbering",
  preview: "Expense Number:",
},



  };

  const config = voucherConfig[type];

  return (
    <div className="qq-overlay">
      <div className="qq-modal">
        <div className="qq-header">
          <h2>{config.title}</h2>
          <X size={20} onClick={onClose} className="qq-close" />
        </div>

        <div className="qq-body">
          <div className="qq-card">
            <div className="qq-card-header">
              <div>
                <h3>{config.prefixLabel}</h3>
                <p>{config.description}</p>
              </div>

              <div
                className={`qq-toggle ${enablePrefix ? "active" : ""}`}
                onClick={() => setEnablePrefix(!enablePrefix)}
              >
                <div className="qq-toggle-circle" />
              </div>
            </div>

            {enablePrefix && (
              <div className="qq-expand">
                <div className="qq-input-row">
                  <div>
                    <label>Prefix</label>
                    <input
                      type="text"
                      placeholder="Prefix"
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                    />
                  </div>

                  <div>
                    <label>Sequence Number</label>
                    <input
                      type="number"
                      value={sequence}
                      onChange={(e) => setSequence(e.target.value)}
                    />
                  </div>
                </div>

                <p className="qq-preview">
                  {config.preview} {prefix}
                  {sequence}
                </p>
              </div>
            )}
          </div>
{(
  type === "quotation" ||
  type === "salesReturn" ||
  type === "creditNote" ||
  type === "deliveryChallan" ||
  type === "proforma" ||
  type === "purchaseInvoice" ||
  type === "purchaseReturn" ||
  type === "debitNote" ||
  type === "purchaseOrder" ||
  type === "expense"
) && (

  <div className="qq-card">
    <div className="qq-card-header">
      <div>
        <h3>Show Item Image on Invoice</h3>
        <p>
          This will apply to all vouchers except for Payment In and
          Payment Out
        </p>
      </div>

      <div
        className={`qq-toggle ${showImage ? "active" : ""}`}
        onClick={() => setShowImage(!showImage)}
      >
        <div className="qq-toggle-circle" />
      </div>
    </div>
  </div>
)}

{(
  type === "quotation" ||
  type === "deliveryChallan" ||
  type === "proforma" ||
  type === "purchaseInvoice" ||
  type === "purchaseOrder"
) && (
  <div className="qq-card">
    <div className="qq-card-header">
      <div>
        <h3>
          Price History <span className="qq-new">New</span>
        </h3>
        <p>
          Show last 5 sales / purchase prices of the item
          for the selected party in invoice
        </p>
      </div>

      <div
        className={`qq-toggle ${priceHistory ? "active" : ""}`}
        onClick={() => setPriceHistory(!priceHistory)}
      >
        <div className="qq-toggle-circle" />
      </div>
    </div>
  </div>
)}


        </div>

        <div className="qq-footer">
          <button className="qq-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="qq-save">Save</button>
        </div>
      </div>
    </div>
  );
};

export default QuickVoucherSettingsModal;
