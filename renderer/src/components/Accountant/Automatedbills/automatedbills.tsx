import React from "react";
import { Info, RefreshCcw, BellRing, Send } from "lucide-react";
import "./AutomatedBills.css";

const AutomatedBills = () => {
  return (
    <div className="automated-container">

      {/* Header */}
      <div className="automated-header">
        <h1>Automated Bills</h1>
        <button className="info-btn">
          <Info size={16} />
          What is Automated Bills
        </button>
      </div>

      {/* Cards Section */}
      <div className="card-wrapper">

        <div className="auto-card">
          <div className="icon-box blue">
            <RefreshCcw size={40} />
          </div>
          <h3>Creating repeated bills?</h3>
          <p>
            Automate sending of repeat bills based on a schedule of your choice.
          </p>
        </div>

        <div className="auto-card">
          <div className="icon-box purple">
            <Send size={40} />
          </div>
          <h3>Automated Billing</h3>
          <p>
            Send SMS reminders to customers daily/weekly/monthly.
          </p>
        </div>

        <div className="auto-card">
          <div className="icon-box green">
            <BellRing size={40} />
          </div>
          <h3>Easy Reminders & Payment</h3>
          <p>
            Automatically receive notifications and collect payments.
          </p>
        </div>

      </div>

      {/* Center Create Button */}
      <div className="create-btn-wrapper">
        <button className="create-btn">
          Create Automated Bill
        </button>
      </div>

    </div>
  );
};

export default AutomatedBills;