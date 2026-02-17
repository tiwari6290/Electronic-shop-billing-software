import React from "react";
import Navbar from "../AdminNavbar/AdminNavbar";
import "./Account.css";

/* Import Feature Icons */
import icon1 from "../../../assets/adminaccount1.png";
import icon2 from "../../../assets/adminaccount2.png";
import icon3 from "../../../assets/adminaccount3.png";
import icon4 from "../../../assets/adminaccount4.png";
import icon5 from "../../../assets/adminaccount5.png";
import icon6 from "../../../assets/adminaccount6.png";

const Account: React.FC = () => {
  return (
    <div className="account-page">
      <Navbar type="account" />

      <div className="account-container">

        {/* Suggestion Banner */}
        <div className="suggestion-banner">
          <h3>Help us make myBillBook better</h3>
          <button className="share-btn">Share Suggestion</button>
        </div>

        {/* General Information */}
        <div className="account-section">
          <h4 className="section-title">General Information</h4>

          <div className="form-row">
            <div className="form-group">
              <label>
                NAME <span className="required">*</span>
              </label>
              <input type="text" placeholder="Enter name" />
            </div>

            <div className="form-group">
              <label>MOBILE NUMBER</label>
              <input type="text" defaultValue="9142581382" />
            </div>

            <div className="form-group">
              <label>EMAIL</label>
              <input type="email" placeholder="Enter email" />
            </div>
          </div>
        </div>

        {/* Referral Code */}
        <div className="account-section">
          <h4 className="section-title">
            Referral code for subscription discount
          </h4>

          <div className="referral-row">
            <input type="text" placeholder="Referral Code" />
            <button className="apply-btn">Apply</button>
          </div>
        </div>

        {/* Subscription Plan */}
        <div className="account-section">
          <h4 className="section-title">Subscription Plan</h4>

          <div className="subscription-wrapper">

            {/* Left Side */}
            <div className="plan-left">
              <p className="current-plan-label">CURRENT PLAN</p>
              <h2 className="plan-name">Trial</h2>

              <button className="buy-btn">
                Buy Subscription Plan
              </button>

              <p className="users-text">
                10,00,000+ Vyaparis running their business on myBillBook premium
              </p>
            </div>

            {/* Right Side */}
            <div className="plan-right">
              <h4 className="upgrade-title">
                Upgrade your plan today and get access to premium features:
              </h4>

              <div className="features-grid">

                <div className="feature-item">
                  <img src={icon1} alt="Multi User" />
                  <span>Multi User and Staff Access</span>
                </div>

                <div className="feature-item">
                  <img src={icon2} alt="Multiple Businesses" />
                  <span>Multiple Businesses</span>
                </div>

                <div className="feature-item">
                  <img src={icon3} alt="EWay Bill" />
                  <span>EWay Bill Generation</span>
                </div>

                <div className="feature-item">
                  <img src={icon4} alt="Desktop App" />
                  <span>Desktop App</span>
                </div>

                <div className="feature-item">
                  <img src={icon5} alt="SMS Marketing" />
                  <span>SMS Marketing</span>
                </div>

                <div className="feature-item">
                  <img src={icon6} alt="Scan Barcode" />
                  <span>Scan & Print Barcode</span>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Account;
