import React, { useState } from 'react';
import Navbar from './Navbar';
import { X, MessageSquare, FileText } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { createParty } from "../../services/partyService";
import type { CreatePartyPayload } from "../../services/partyService";

const CreateParty: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);
const [newCategoryName, setNewCategoryName] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    partyName: '',
    mobileNumber: '',
    email: '',
    openingBalance: '0',
    openingBalanceType: 'To_Collect' as "To_Collect" | "To_Pay",
    gstin: '',
    panNumber: '',
     partyType: 'Customer' as "Customer" | "Supplier",
    partyCategory: '',
    billingAddress: '',
    shippingAddress: '',
    sameAsBilling: false,
    creditPeriod: '0',
    creditLimit: '0',
    contactPersonName: '',
    dateOfBirth: ''
  });

  // Modal states
  const [showBankAccountModal, setShowBankAccountModal] = useState(false);
  const [showPartySettingsModal, setShowPartySettingsModal] = useState(false);
  const [showCustomFieldsView, setShowCustomFieldsView] = useState(false);
  const [showCreateCustomFieldModal, setShowCreateCustomFieldModal] = useState(false);

  // Bank account data
  const [bankAccount, setBankAccount] = useState({
    accountNumber: '',
    reEnterAccountNumber: '',
    ifscCode: '',
    bankBranchName: '',
    accountHolderName: '',
    upiId: ''
  });

  // Smart greetings data
  const [invoiceMilestone, setInvoiceMilestone] = useState(true);
  const [birthdayWishes, setBirthdayWishes] = useState(true);
  const [invoiceMessage, setInvoiceMessage] = useState("Hey, [[MilestoneMessage]] with [[YourBusinessName]] — thank you, [[PartyName]]! 🎉 <View Invoice>");
  const [birthdayMessage, setBirthdayMessage] = useState("Happy Birthday, [[Party Name]]! 🎂 Wishing you success & smiles.");

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


useEffect(() => {
  if (!id) return;

  const storedParties =
    JSON.parse(localStorage.getItem("parties") || "[]");

  const partyToEdit = storedParties.find(
    (p: any) => p.id === Number(id)
  );

  if (partyToEdit) {
    setFormData((prev) => ({
      ...prev,
      partyName: partyToEdit.name,
      mobileNumber: partyToEdit.mobile,
      partyCategory: partyToEdit.category,
      partyType: partyToEdit.type,
      openingBalance: Math.abs(partyToEdit.balance).toString(),
      balanceType:
        partyToEdit.balance >= 0 ? "To Collect" : "To Pay",
    }));
  }
}, [id]);




  const handleGetDetails = () => {
    console.log('Fetching GSTIN details...');
  };

const handleSave = async () => {
  try {
    if (!formData.partyName.trim()) {
      alert("Party Name is required");
      return;
    }

    const payload = {
      partyName: formData.partyName,
      mobileNumber: formData.mobileNumber,
      email: formData.email,
      gstin: formData.gstin,
      panNumber: formData.panNumber,
      partyType: formData.partyType,
      partyCategory: formData.partyCategory,
      billingAddress: formData.billingAddress,
      shippingAddress: formData.shippingAddress,
      creditPeriod: Number(formData.creditPeriod),
      creditLimit: Number(formData.creditLimit),
      openingBalance: Number(formData.openingBalance),
      openingBalanceType: formData.openingBalanceType
    };

    console.log("Sending to backend:", payload);

    await createParty(payload);

    alert("Party created successfully ✅");

    navigate("/cashier/parties");

  } catch (error: any) {
    console.error("Save error:", error);
    alert(error.response?.data?.message || "Something went wrong ❌");
  }
};

  const handleSaveAndNew = () => {
    console.log('Saving party and creating new:', formData);
  };

  const handleSettingsClick = () => {
  setShowPartySettingsModal(true);
};

  const handleSubmitBankAccount = () => {
    console.log('Bank account submitted:', bankAccount);
    setShowBankAccountModal(false);
    alert('Bank account added successfully!');
  };

  const handleSavePartySettings = () => {
    console.log('Party settings saved');
    setShowPartySettingsModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f9fafb' }}>
      <Navbar 
        title="Create Party"
        showBackButton={true}
        backPath="/dashboard"
        showSettings={true}
        settingsLabel="Party Settings"
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
                    className='aab'
                      type="number"
                      name="openingBalance"
                      value={formData.openingBalance}
                      onChange={handleInputChange}
                      style={{
                        width: '100px',
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
                    value={formData.openingBalanceType}
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
                    <option value="To_Collect">To Collect</option>
                  <option value="To_Pay">To Pay</option>
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
    value={formData.partyCategory}
    onChange={(e) => {
      if (e.target.value === "__add_new__") {
        setShowAddCategoryInput(true);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        partyCategory: e.target.value,
      }));
    }}
    style={{
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box'
    }}
  >
    <option value="">Select Category</option>

    {categories.map((cat) => (
      <option key={cat} value={cat}>
        {cat}
      </option>
    ))}

    <option value="__add_new__">+ Add New Category</option>
  </select>

  {/* 🔥 Show input when adding new category */}
  {showAddCategoryInput && (
    <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
      <input
        type="text"
        placeholder="Enter new category"
        value={newCategoryName}
        onChange={(e) => setNewCategoryName(e.target.value)}
        style={{
          flex: 1,
          padding: '6px 10px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px'
        }}
      />

      <button
        type="button"
        onClick={() => {
          if (!newCategoryName.trim()) return;

          const existingCategories =
            JSON.parse(localStorage.getItem("categories") || "[]");

          if (!existingCategories.includes(newCategoryName)) {
            const updatedCategories = [
              ...existingCategories,
              newCategoryName,
            ];

            localStorage.setItem(
              "categories",
              JSON.stringify(updatedCategories)
            );

            setCategories(updatedCategories);
          }

          setFormData((prev) => ({
            ...prev,
            partyCategory: newCategoryName,
          }));

          setNewCategoryName("");
          setShowAddCategoryInput(false);
        }}
        style={{
          padding: '6px 12px',
          background: '#6366f1',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Add
      </button>
    </div>
  )}
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

          {/* Contact Person Details */}
          <div style={{ marginTop: '30px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Contact Person Details</h3>

            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '400', color: '#6b7280', marginBottom: '6px' }}>
                  Contact Person Name
                </label>
                <input
                  type="text"
                  name="contactPersonName"
                  value={formData.contactPersonName}
                  onChange={handleInputChange}
                  placeholder="Ex: Ankit Mishra"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '400', color: '#6b7280', marginBottom: '6px' }}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Party Bank Account */}
          <div style={{ marginTop: '40px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Party Bank Account</h3>

            <div style={{
              border: '1px dashed #d1d5db',
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#6b7280', marginBottom: '10px', marginTop: 0 }}>
                Add party bank information to manage transactions
              </p>

              <button
                onClick={() => setShowBankAccountModal(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#6366f1',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px'
                }}
              >
                + Add Bank Account
              </button>
            </div>
          </div>

          {/* Custom Field */}
          <div style={{ marginTop: '40px', textAlign: 'center', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>Custom Field</h3>

            <p style={{ color: '#6b7280', marginTop: '10px', marginBottom: '12px' }}>
              Store more information about your parties by adding custom fields from Party Settings
            </p>

            <button
              onClick={() => setShowPartySettingsModal(true)}
              style={{
                background: '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 24px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Add Custom Fields
            </button>
          </div>
        </div>
      </div>

      {/* Add Bank Account Modal */}
      {showBankAccountModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>Add Bank Account</h3>
              <button onClick={() => setShowBankAccountModal(false)} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
              {/* Bank Account Number */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Bank Account Number <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="ex: 123456789"
                    value={bankAccount.accountNumber}
                    onChange={(e) => setBankAccount({ ...bankAccount, accountNumber: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Re-Enter Bank Account Number <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="ex: 123456789"
                    value={bankAccount.reEnterAccountNumber}
                    onChange={(e) => setBankAccount({ ...bankAccount, reEnterAccountNumber: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* IFSC Code and Bank Branch Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    placeholder="ex: ICIC0001234"
                    value={bankAccount.ifscCode}
                    onChange={(e) => setBankAccount({ ...bankAccount, ifscCode: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Bank & Branch Name
                  </label>
                  <input
                    type="text"
                    placeholder="ex: ICICI Bank, Mumbai"
                    value={bankAccount.bankBranchName}
                    onChange={(e) => setBankAccount({ ...bankAccount, bankBranchName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Account Holder Name and UPI ID */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Account Holder's Name
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Babu Lal"
                    value={bankAccount.accountHolderName}
                    onChange={(e) => setBankAccount({ ...bankAccount, accountHolderName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    UPI ID
                  </label>
                  <input
                    type="text"
                    placeholder="ex: babulal@upi"
                    value={bankAccount.upiId}
                    onChange={(e) => setBankAccount({ ...bankAccount, upiId: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setShowBankAccountModal(false)}
                style={{ padding: '8px 16px', border: '1px solid #d1d5db', color: '#374151', fontSize: '14px', fontWeight: '500', borderRadius: '6px', backgroundColor: '#ffffff', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitBankAccount}
                style={{ padding: '8px 20px', backgroundColor: '#6366f1', color: '#ffffff', fontSize: '14px', fontWeight: '500', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Party Settings Modal */}
      {showPartySettingsModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', width: '700px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>Party Settings</h3>
              <button onClick={() => setShowPartySettingsModal(false)} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Sidebar */}
              <div style={{ width: '200px', borderRight: '1px solid #e5e7eb', padding: '16px' }}>
                <button
                  onClick={() => setShowCustomFieldsView(false)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    textAlign: 'left',
                    backgroundColor: !showCustomFieldsView ? '#eef2ff' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: !showCustomFieldsView ? '#6366f1' : '#374151',
                    fontSize: '14px'
                  }}
                >
                  <MessageSquare size={18} />
                  Send Smart Greetings
                </button>
                <button
                  onClick={() => setShowCustomFieldsView(true)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    textAlign: 'left',
                    backgroundColor: showCustomFieldsView ? '#eef2ff' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: showCustomFieldsView ? '#6366f1' : '#374151',
                    fontSize: '14px'
                  }}
                >
                  <FileText size={18} />
                  Custom Fields
                </button>
              </div>

              {/* Content Area */}
              <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                {!showCustomFieldsView ? (
                  <>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '16px', marginTop: 0 }}>
                      Select Templates to Share Automated Smart Greetings with Parties on WhatsApp
                    </h4>

                    {/* Invoice Milestones */}
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div>
                          <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>Invoice Milestones</h5>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                            Make every 10th, 25th, 50th or 100th invoice feel special.
                          </p>
                        </div>
                        <div 
                          onClick={() => setInvoiceMilestone(!invoiceMilestone)}
                          style={{
                            width: '48px',
                            height: '24px',
                            borderRadius: '9999px',
                            backgroundColor: invoiceMilestone ? '#6366f1' : '#d1d5db',
                            transition: 'background-color 0.2s',
                            position: 'relative',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: '#ffffff',
                            borderRadius: '50%',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            transform: invoiceMilestone ? 'translateX(24px)' : 'translateX(2px)',
                            transition: 'transform 0.2s',
                            marginTop: '2px'
                          }} />
                        </div>
                      </div>
                      <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '6px', marginTop: '12px' }}>
                        <input
                          type="text"
                          value={invoiceMessage}
                          onChange={(e) => setInvoiceMessage(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            fontSize: '13px',
                            boxSizing: 'border-box',
                            marginBottom: '8px'
                          }}
                        />
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                          Hey, Half-century! 50 invoices with Aashika Traders — thank you, Shubhi Trading! 🎉 <span style={{ color: '#6366f1' }}>&lt;View Invoice&gt;</span>
                        </p>
                      </div>
                    </div>

                    {/* Birthday Wishes */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div>
                          <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>Birthday Wishes</h5>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                            Send a warm greeting on your party's birthday automatically.
                          </p>
                        </div>
                        <div 
                          onClick={() => setBirthdayWishes(!birthdayWishes)}
                          style={{
                            width: '48px',
                            height: '24px',
                            borderRadius: '9999px',
                            backgroundColor: birthdayWishes ? '#6366f1' : '#d1d5db',
                            transition: 'background-color 0.2s',
                            position: 'relative',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: '#ffffff',
                            borderRadius: '50%',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            transform: birthdayWishes ? 'translateX(24px)' : 'translateX(2px)',
                            transition: 'transform 0.2s',
                            marginTop: '2px'
                          }} />
                        </div>
                      </div>
                      <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '6px', marginTop: '12px' }}>
                        <input
                          type="text"
                          value={birthdayMessage}
                          onChange={(e) => setBirthdayMessage(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            fontSize: '13px',
                            boxSizing: 'border-box',
                            marginBottom: '8px'
                          }}
                        />
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                          Happy Birthday, Shubhi Traders! 🎂 Wishing you success & smiles.
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                        <div style={{ 
                          backgroundColor: '#dbeafe', 
                          borderRadius: '50%', 
                          width: '60px', 
                          height: '60px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          position: 'relative'
                        }}>
                          <span style={{ fontSize: '24px' }}>📄</span>
                          <div style={{ 
                            position: 'absolute', 
                            top: '-4px', 
                            right: '-4px', 
                            backgroundColor: '#10b981', 
                            borderRadius: '50%', 
                            width: '20px', 
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <span style={{ fontSize: '12px', color: '#ffffff' }}>✓</span>
                          </div>
                          <div style={{ 
                            position: 'absolute', 
                            bottom: '-20px', 
                            fontSize: '11px', 
                            color: '#6b7280',
                            whiteSpace: 'nowrap'
                          }}>License Number</div>
                        </div>

                        <div style={{ 
                          backgroundColor: '#fef3c7', 
                          borderRadius: '50%', 
                          width: '60px', 
                          height: '60px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          position: 'relative'
                        }}>
                          <span style={{ fontSize: '24px' }}>🎂</span>
                          <div style={{ 
                            position: 'absolute', 
                            top: '-4px', 
                            right: '-4px', 
                            backgroundColor: '#10b981', 
                            borderRadius: '50%', 
                            width: '20px', 
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <span style={{ fontSize: '12px', color: '#ffffff' }}>✓</span>
                          </div>
                          <div style={{ 
                            position: 'absolute', 
                            bottom: '-20px', 
                            fontSize: '11px', 
                            color: '#6b7280',
                            whiteSpace: 'nowrap'
                          }}>Birthday</div>
                        </div>

                        <div style={{ 
                          backgroundColor: '#fce7f3', 
                          borderRadius: '50%', 
                          width: '60px', 
                          height: '60px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          position: 'relative'
                        }}>
                          <span style={{ fontSize: '24px' }}>🔗</span>
                          <div style={{ 
                            position: 'absolute', 
                            top: '-4px', 
                            right: '-4px', 
                            backgroundColor: '#10b981', 
                            borderRadius: '50%', 
                            width: '20px', 
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <span style={{ fontSize: '12px', color: '#ffffff' }}>✓</span>
                          </div>
                          <div style={{ 
                            position: 'absolute', 
                            bottom: '-20px', 
                            fontSize: '11px', 
                            color: '#6b7280',
                            whiteSpace: 'nowrap'
                          }}>Website Link</div>
                        </div>
                      </div>

                      <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '40px', marginBottom: '20px' }}>
                        You don't have any custom fields created yet
                      </p>

                      <button
                        onClick={() => setShowCreateCustomFieldModal(true)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#6366f1',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '14px'
                        }}
                      >
                        + Create custom field
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setShowPartySettingsModal(false)}
                style={{ padding: '8px 16px', border: '1px solid #d1d5db', color: '#374151', fontSize: '14px', fontWeight: '500', borderRadius: '6px', backgroundColor: '#ffffff', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSavePartySettings}
                style={{ padding: '8px 20px', backgroundColor: '#6366f1', color: '#ffffff', fontSize: '14px', fontWeight: '500', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Field Modal */}
      {showCreateCustomFieldModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>Create Custom Field</h3>
              <button onClick={() => setShowCreateCustomFieldModal(false)} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Field Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter field name"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Field Type <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                >
                  <option>Text</option>
                  <option>Number</option>
                  <option>Date</option>
                  <option>Dropdown</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>Required field</span>
                </label>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setShowCreateCustomFieldModal(false)}
                style={{ padding: '8px 16px', border: '1px solid #d1d5db', color: '#374151', fontSize: '14px', fontWeight: '500', borderRadius: '6px', backgroundColor: '#ffffff', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert('Custom field created!');
                  setShowCreateCustomFieldModal(false);
                }}
                style={{ padding: '8px 20px', backgroundColor: '#6366f1', color: '#ffffff', fontSize: '14px', fontWeight: '500', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
              >
                Create Field
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateParty;