import "./CashierPurchase.css";
import CashierNavbar from "../CashierNavbar/CashierNavbar";
import { Plus } from "lucide-react";

export default function CashierPurchase() {
  return (
    <>
      <CashierNavbar title="Create Purchase" showMobileUpload />

      <div className="purchase-container">

        {/* TOP SECTION */}
        <div className="purchase-top">

          {/* LEFT : BILL FROM */}
          <div className="bill-from">
            <h4>Bill From</h4>

            <div className="add-party-box">
              + Add Party
            </div>
          </div>

          {/* RIGHT : INVOICE DETAILS */}
          <div className="invoice-details">

            <div className="invoice-row">
              <div>
                <label>Purchase Inv No:</label>
                <input value="1" disabled />
              </div>

              <div>
                <label>Purchase Inv Date:</label>
                <input type="date" />
              </div>

              <div>
                <label>Original Inv No.</label>
                <input />
              </div>
            </div>

            <div className="due-date-box">
              + Add Due Date
            </div>

          </div>
        </div>

        {/* ITEMS TABLE HEADER */}
        <div className="items-header">
          <div>NO</div>
          <div>ITEMS / SERVICES</div>
          <div>HSN / SAC</div>
          <div>QTY</div>
          <div>PRICE / ITEM (₹)</div>
          <div>DISCOUNT</div>
          <div>TAX</div>
          <div>AMOUNT (₹)</div>

          <button className="add-item-btn">
            <Plus />
          </button>
        </div>

      </div>
    </>
  );
}
