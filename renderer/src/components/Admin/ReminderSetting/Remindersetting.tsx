import React, { useState, useEffect } from "react";
import AdminNavbar from "../AdminNavbar/AdminNavbar";
import "./Remindersetting.css";

const ReminderSettings: React.FC = () => {
  const [sendBilling, setSendBilling] = useState(true);
  const [getPayment, setGetPayment] = useState(false);
  const [toPartyOpen, setToPartyOpen] = useState(false);
  const [toYouOpen, setToYouOpen] = useState(false);

  // Checkboxes — TO PARTY
  const [party3Days, setParty3Days] = useState(true);
  const [partyOnDue, setPartyOnDue] = useState(true);

  // Checkboxes — TO YOU
  const [you3Days, setYou3Days] = useState(true);
  const [youOnDue, setYouOnDue] = useState(true);
  const [lowStock, setLowStock] = useState(true);
  const [purchase3Days, setPurchase3Days] = useState(true);
  const [purchaseOnDue, setPurchaseOnDue] = useState(true);
  const [outstanding, setOutstanding] = useState(true);
  const [yesterdaySales, setYesterdaySales] = useState(true);

  useEffect(() => {
    const h1 = document.querySelector(".admin-navbar h1");
    if (h1) h1.textContent = "Reminder Settings";
    const p = document.querySelector(".admin-navbar p");
    if (p) p.textContent = "Select Which Reminders Are Sent To You And Your Parties";
  }, []);

  return (
    <div className="reminder-page">
      <AdminNavbar type="account" />

      <div className="reminder-body">
        {/* Top toggle cards */}
        <div className="toggle-cards">
          <div className="toggle-card">
            <div className="toggle-card-text">
              <div className="toggle-card-title">Send billing Whatsapp/SMS to Party</div>
              <div className="toggle-card-sub">Send Whatsapp/SMS to your Party on creating any transaction</div>
            </div>
            <div
              className={`toggle-switch ${sendBilling ? "on" : ""}`}
              onClick={() => setSendBilling(!sendBilling)}
            >
              <div className="toggle-knob" />
            </div>
          </div>

          <div className="toggle-card">
            <div className="toggle-card-text">
              <div className="toggle-card-title">Get payment reminders on WhatsApp</div>
              <div className="toggle-card-sub">Get WhatsApp alerts when you have to collect payment from customers</div>
            </div>
            <div
              className={`toggle-switch ${getPayment ? "on" : ""}`}
              onClick={() => setGetPayment(!getPayment)}
            >
              <div className="toggle-knob" />
            </div>
          </div>
        </div>

        {/* TO PARTY accordion */}
        <div className="accordion-row" onClick={() => setToPartyOpen(!toPartyOpen)}>
          <span>
            <strong>TO PARTY</strong> (Reminders will be sent through sms)
          </span>
          <span className={`accordion-arrow ${toPartyOpen ? "open" : ""}`}>›</span>
        </div>

        {toPartyOpen && (
          <div className="accordion-content">
            <div className="reminder-card">
              <div className="reminder-card-title">Sales Invoice</div>
              <div className="reminder-card-sub">Get reminded to collect payments on time</div>

              <div className="check-row">
                <span>3 days before due date</span>
                <input type="checkbox" checked={party3Days} onChange={() => setParty3Days(!party3Days)} />
              </div>
              <div className="check-row">
                <span>On due date</span>
                <input type="checkbox" checked={partyOnDue} onChange={() => setPartyOnDue(!partyOnDue)} />
              </div>

              <div className="view-sample-row">
                <span>View sample SMS</span>
                <span className="chevron-right">›</span>
              </div>
            </div>
          </div>
        )}

        {/* TO YOU accordion */}
        <div className="accordion-row" onClick={() => setToYouOpen(!toYouOpen)}>
          <span>
            <strong>TO YOU</strong> (Reminders will be sent on mobile app and whatsapp)
          </span>
          <span className={`accordion-arrow ${toYouOpen ? "open" : ""}`}>›</span>
        </div>

        {toYouOpen && (
          <div className="accordion-content grid-2">
            {/* Sales Invoice */}
            <div className="reminder-card">
              <div className="reminder-card-title">Sales Invoice</div>
              <div className="reminder-card-sub">Get reminded to collect payments on time</div>
              <div className="check-row">
                <span>3 days before due date</span>
                <input type="checkbox" checked={you3Days} onChange={() => setYou3Days(!you3Days)} />
              </div>
              <div className="check-row">
                <span>On due date</span>
                <input type="checkbox" checked={youOnDue} onChange={() => setYouOnDue(!youOnDue)} />
              </div>
            </div>

            {/* Low Stock */}
            <div className="reminder-card">
              <div className="reminder-card-title">Low Stock</div>
              <div className="reminder-card-sub">Get reminded to buy stock</div>
              <div className="check-row">
                <span>When stock is below low stock level</span>
                <input type="checkbox" checked={lowStock} onChange={() => setLowStock(!lowStock)} />
              </div>
            </div>

            {/* Purchase Invoice */}
            <div className="reminder-card">
              <div className="reminder-card-title">Purchase Invoice</div>
              <div className="reminder-card-sub">Get reminded to send payments on time</div>
              <div className="check-row">
                <span>3 days before due date</span>
                <input type="checkbox" checked={purchase3Days} onChange={() => setPurchase3Days(!purchase3Days)} />
              </div>
              <div className="check-row">
                <span>On due date</span>
                <input type="checkbox" checked={purchaseOnDue} onChange={() => setPurchaseOnDue(!purchaseOnDue)} />
              </div>
            </div>

            {/* Daily Summary */}
            <div className="reminder-card">
              <div className="reminder-card-title">Daily Summary</div>
              <div className="reminder-card-sub">Get daily updates about</div>
              <div className="check-row">
                <span>Outstanding Collections and Payments</span>
                <input type="checkbox" checked={outstanding} onChange={() => setOutstanding(!outstanding)} />
              </div>
              <div className="check-row">
                <span>Yesterday's Sales</span>
                <input type="checkbox" checked={yesterdaySales} onChange={() => setYesterdaySales(!yesterdaySales)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReminderSettings;