import React, { useState } from 'react';
import Navbar from './Navbar';

const CreateParty: React.FC = () => {
  const [formData, setFormData] = useState({
    partyName: '',
    mobileNumber: '',
    email: '',
    openingBalance: '0',
    balanceType: 'To Collect',
    gstin: '',
    panNumber: '',
    partyType: 'Customer',
    partyCategory: '',
    billingAddress: '',
    shippingAddress: '',
    sameAsBilling: false,
    creditPeriod: '30',
    creditLimit: '0'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        ...(name === 'sameAsBilling' && checked ? { shippingAddress: prev.billingAddress } : {})
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleGetDetails = () => {
    console.log('Fetching GSTIN details...');
  };

  const handleSave = () => {
    console.log('Saving party:', formData);
  };

  const handleSaveAndNew = () => {
    console.log('Saving party and creating new:', formData);
  };

  const handleSettingsClick = () => {
    console.log('Opening party settings...');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f9fafb' }}>
      <Navbar 
        title="Create Party"
        showBackButton={true}
        backPath="/dashboard"
        showSettings={true}
        onSettingsClick={handleSettingsClick}
        primaryAction={{
          label: 'Save',
          onClick: handleSave
        }}
        secondaryAction={{
          label: 'Save & New',
          onClick: handleSaveAndNew
        }}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* General Details Section */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '16px' }}>
              General Details
            </h2>
            
            {/* Row 1: Party Name, Mobile Number, Email, Opening Balance */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
              {/* Party Name */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '400', color: '#6b7280', marginBottom: '6px' }}>
                  Party Name<span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="partyName"
                  value={formData.partyName}
                  onChange={handleInputChange}
                  placeholder="Enter name"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#111827',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '400', color: '#6b7280', marginBottom: '6px' }}>
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="Enter mobile number"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#111827',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '400', color: '#6b7280', marginBottom: '6px' }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#111827',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Opening Balance */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '400', color: '#6b7280', marginBottom: '6px' }}>
                  Opening Balance
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: '12px', top: '9px', fontSize: '14px', color: '#6b7280' }}>
                      ₹
                    </span>
                    <input
                      type="number"
                      name="openingBalance"
                      value={formData.openingBalance}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        paddingLeft: '28px',
                        paddingRight: '12px',
                        paddingTop: '8px',
                        paddingBottom: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: '#111827',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <select
                    name="balanceType"
                    value={formData.balanceType}
                    onChange={handleInputChange}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#111827',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      minWidth: '120px'
                    }}
                  >
                    <option>To Collect</option>
                    <option>To Pay</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 2: GSTIN, PAN Number */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '16px', marginBottom: '16px' }}>
              {/* GSTIN */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '400', color: '#6b7280', marginBottom: '6px' }}>
                  GSTIN
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleInputChange}
                    placeholder="ex: 29XXXXX9438X1XX"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#111827',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    onClick={handleGetDetails}
                    style={{
                      padding: '8px 20px',
                      background: '#c4b5fd',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: '500',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Get Details
                  </button>
                </div>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px', marginBottom: 0 }}>
                  Note: You can auto populate party details from GSTIN
                </p>
              </div>

              {/* PAN Number */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '400', color: '#6b7280', marginBottom: '6px' }}>
                  PAN Number
                </label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleInputChange}
                  placeholder="Enter party PAN Number"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#111827',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div></div>
            </div>

            {/* Row 3: Party Type, Party Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '16px' }}>
              {/* Party Type */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '400', color: '#6b7280', marginBottom: '6px' }}>
                  Party Type<span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  name="partyType"
                  value={formData.partyType}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#111827',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                >
                  <option>Customer</option>
                  <option>Supplier</option>
                  <option>Both</option>
                </select>
              </div>

              {/* Party Category */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '400', color: '#6b7280', marginBottom: '6px' }}>
                  Party Category
                </label>
                <select
                  name="partyCategory"
                  value={formData.partyCategory}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: formData.partyCategory ? '#111827' : '#9ca3af',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select Category</option>
                  <option>Retail</option>
                  <option>Wholesale</option>
                  <option>Distributor</option>
                </select>
              </div>

              <div></div>
            </div>
          </div>

          {/* Address Section */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '500', color: '#374151', marginBottom: '16px' }}>
              Address
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Billing Address */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '400', color: '#6b7280', marginBottom: '6px' }}>
                  Billing Address
                </label>
                <textarea
                  name="billingAddress"
                  value={formData.billingAddress}
                  onChange={handleInputChange}
                  placeholder="Enter billing address"
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#111827',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Shipping Address */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '400', color: '#6b7280' }}>
                    Shipping Address
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="sameAsBilling"
                      checked={formData.sameAsBilling}
                      onChange={handleInputChange}
                      style={{ 
                        width: '16px', 
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>
                      Same as Billing address
                    </span>
                  </label>
                </div>
                <textarea
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  placeholder="Enter shipping address"
                  rows={5}
                  disabled={formData.sameAsBilling}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#111827',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit',
                    backgroundColor: formData.sameAsBilling ? '#e5e7eb' : '#ffffff',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Credit Period and Credit Limit */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {/* Credit Period */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '400', color: '#6b7280', marginBottom: '6px' }}>
                  Credit Period
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number"
                    name="creditPeriod"
                    value={formData.creditPeriod}
                    onChange={handleInputChange}
                    style={{
                      width: '80px',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#111827',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Days</span>
                </div>
              </div>

              {/* Credit Limit */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '400', color: '#6b7280', marginBottom: '6px' }}>
                  Credit Limit
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '9px', fontSize: '14px', color: '#6b7280' }}>
                    ₹
                  </span>
                  <input
                    type="number"
                    name="creditLimit"
                    value={formData.creditLimit}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      paddingLeft: '28px',
                      paddingRight: '12px',
                      paddingTop: '8px',
                      paddingBottom: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#111827',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div></div>
              <div></div>
            </div>
          </div>

          {/* Contact Person Details Section */}
          {/* Contact Person Details */}
<div style={{ marginTop: "30px" }}>
  <h3 style={{ fontSize: "16px", fontWeight: 600 }}>Contact Person Details</h3>

  <div style={{ display: "flex", gap: "20px", marginTop: "12px" }}>
    <div style={{ flex: 1 }}>
      <label>Contact Person Name</label>
      <input
        placeholder="Ex: Ankit Mishra"
        style={{
          width: "100%",
          padding: "8px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          marginTop: "4px"
        }}
      />
    </div>

    <div style={{ flex: 1 }}>
      <label>Date of Birth</label>
      <input
        type="date"
        style={{
          width: "100%",
          padding: "8px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          marginTop: "4px"
        }}
      />
    </div>
  </div>
</div>

{/* Party Bank Account */}
<div style={{ marginTop: "40px" }}>
  <h3 style={{ fontSize: "16px", fontWeight: 600 }}>Party Bank Account</h3>

  <div style={{
    border: "1px dashed #d1d5db",
    borderRadius: "8px",
    padding: "40px",
    textAlign: "center",
    marginTop: "12px"
  }}>
    <p style={{ color: "#6b7280" }}>
      Add party bank information to manage transactions
    </p>

    <button
      style={{
        marginTop: "10px",
        background: "transparent",
        border: "none",
        color: "#6366f1",
        cursor: "pointer",
        fontWeight: 500
      }}
    >
      + Add Bank Account
    </button>
  </div>
</div>

{/* Custom Field */}
<div style={{ marginTop: "40px", textAlign: "center" }}>
  <h3 style={{ fontSize: "16px", fontWeight: 600 }}>Custom Field</h3>

  <p style={{ color: "#6b7280", marginTop: "10px" }}>
    Store more information about your parties by adding custom fields from Party Settings
  </p>

  <button
    style={{
      marginTop: "12px",
      background: "#6366f1",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      padding: "8px 24px",
      cursor: "pointer"
    }}
  >
    Add Custom Fields
  </button>
</div>
        </div>
      </div>
    </div>
  );
};

export default CreateParty;