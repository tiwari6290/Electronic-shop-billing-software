import React, { useState, useEffect } from 'react';
import { Trash2, X, Search, Calendar } from 'lucide-react';

interface Item {
  id: string;
  name: string;
  hsn: string;
  qty: number;
  price: number;
  discount: number;
  tax: number;
  amount: number;
}

interface AdditionalCharge {
  id: string;
  name: string;
  amount: number;
}

interface Party {
  id: string;
  name: string;
  balance: number;
}

interface InventoryItem {
  id: string;
  name: string;
  code: string;
  stock: number;
  salesPrice: number;
  purchasePrice: number;
}

interface BankAccount {
  accountName: string;
  openingBalance: number;
  asOfDate: string;
  accountNumber: string;
  reEnterAccountNumber: string;
  ifscCode: string;
  bankBranchName: string;
  accountHolderName: string;
  upiId: string;
}

const CreateQuotation: React.FC = () => {
  const [formData, setFormData] = useState({
    partyName: '',
    invoicePrefix: 'ME/QO/26-27/',
    invoiceNumber: '1',
    quotationDate: '06 Feb 2026',
    dueDate: '',
    eWayBillNo: '',
    challanNo: '',
    financedBy: '',
    salesman: '',
    warrantyPeriod: '',
    notes: '',
    termsAndConditions: '1. Goods once sold will not be taken back or exchanged\n2. All disputes are subject to [ENTER_YOUR_CITY_NAME] jurisdiction only'
  });

  const [items, setItems] = useState<Item[]>([]);
  const [showAddParty, setShowAddParty] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [showTerms, setShowTerms] = useState(true);
  const [showDueDate, setShowDueDate] = useState(false);
  const [additionalCharges, setAdditionalCharges] = useState<AdditionalCharge[]>([]);
  const [showAddCharges, setShowAddCharges] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [showDiscount, setShowDiscount] = useState(false);
  const [autoRoundOff, setAutoRoundOff] = useState(false);
  const [roundOffAmount, setRoundOffAmount] = useState(0);
  const [signature, setSignature] = useState<string | null>(null);

  // Modal states
  const [showBankAccountModal, setShowBankAccountModal] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [showAddItemsModal, setShowAddItemsModal] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);

  // Bank account form
  const [bankAccount, setBankAccount] = useState<BankAccount>({
    accountName: '',
    openingBalance: 0,
    asOfDate: '7 Feb 2026',
    accountNumber: '',
    reEnterAccountNumber: '',
    ifscCode: '',
    bankBranchName: '',
    accountHolderName: '',
    upiId: ''
  });

  // Sample parties data
  const [parties] = useState<Party[]>([
    { id: '1', name: 'akash pandey', balance: 71300 },
    { id: '2', name: 'Cash Sale', balance: 0 },
    { id: '3', name: 'hhwhs', balance: 0 }
  ]);

  // Sample inventory items
  const [inventoryItems] = useState<InventoryItem[]>([
    { id: '1', name: 'GODREJ FRIDGE', code: 'T=ITM9089', stock: 22, salesPrice: 34220, purchasePrice: 0 },
    { id: '2', name: 'Samsung Galaxy A10', code: '-', stock: -2, salesPrice: 7990, purchasePrice: 0 },
    { id: '3', name: 'xyzq', code: '-', stock: -1, salesPrice: 34500, purchasePrice: 0 }
  ]);

  const [selectedInventoryItems, setSelectedInventoryItems] = useState<string[]>([]);
  const [partySearch, setPartySearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');

  // Calculate item amount whenever qty, price, discount, or tax changes
  const calculateItemAmount = (item: Item): number => {
    const subtotal = item.qty * item.price;
    const discountAmount = (subtotal * item.discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * item.tax) / 100;
    return afterDiscount + taxAmount;
  };

  // Update item and recalculate amount
  const updateItem = (id: string, field: keyof Item, value: any) => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          updatedItem.amount = calculateItemAmount(updatedItem);
          return updatedItem;
        }
        return item;
      })
    );
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const additionalChargesTotal = additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
  const taxableAmount = subtotal + additionalChargesTotal;
  const afterDiscount = taxableAmount - discountAmount;
  const totalBeforeRound = afterDiscount;
  
  // Auto round off calculation
  useEffect(() => {
    if (autoRoundOff) {
      const rounded = Math.round(totalBeforeRound);
      setRoundOffAmount(rounded - totalBeforeRound);
    } else {
      setRoundOffAmount(0);
    }
  }, [autoRoundOff, totalBeforeRound]);

  const totalAmount = totalBeforeRound + roundOffAmount;

  const handleSave = () => {
    const quotationData = {
      ...formData,
      items,
      additionalCharges,
      discount: discountAmount,
      roundOff: roundOffAmount,
      subtotal,
      taxableAmount,
      totalAmount,
      signature
    };
    console.log('Saving quotation:', quotationData);
    alert('Quotation saved successfully!');
  };

  const handleSaveAndNew = () => {
    handleSave();
    // Reset form
    setItems([]);
    setShowAddParty(true);
    setAdditionalCharges([]);
    setDiscountAmount(0);
    setShowDiscount(false);
    setShowAddCharges(false);
    setShowNotes(false);
    setSignature(null);
    setFormData({
      ...formData,
      partyName: '',
      invoiceNumber: (parseInt(formData.invoiceNumber) + 1).toString(),
      notes: '',
      dueDate: ''
    });
  };

  /* const handleSettingsClick = () => {
    console.log('Opening settings');
    alert('Settings menu would open here');
  };
 */
  const addItem = () => {
    const newItem: Item = {
      id: Date.now().toString(),
      name: '',
      hsn: '',
      qty: 1,
      price: 0,
      discount: 0,
      tax: 0,
      amount: 0
    };
    setItems([...items, newItem]);
    setShowAddParty(false);
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const addAdditionalCharge = () => {
    const newCharge: AdditionalCharge = {
      id: Date.now().toString(),
      name: '',
      amount: 0
    };
    setAdditionalCharges([...additionalCharges, newCharge]);
  };

  const updateAdditionalCharge = (id: string, field: keyof AdditionalCharge, value: any) => {
    setAdditionalCharges(prevCharges =>
      prevCharges.map(charge =>
        charge.id === id ? { ...charge, [field]: value } : charge
      )
    );
  };

  const deleteAdditionalCharge = (id: string) => {
    setAdditionalCharges(additionalCharges.filter(charge => charge.id !== id));
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignature(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectParty = (party: Party) => {
    setFormData({ ...formData, partyName: party.name });
    setShowPartyModal(false);
    setShowAddParty(false);
  };

  const handleAddItemsToBill = () => {
    selectedInventoryItems.forEach(itemId => {
      const inventoryItem = inventoryItems.find(i => i.id === itemId);
      if (inventoryItem) {
        const newItem: Item = {
          id: Date.now().toString() + itemId,
          name: inventoryItem.name,
          hsn: inventoryItem.code,
          qty: 1,
          price: inventoryItem.salesPrice,
          discount: 0,
          tax: 0,
          amount: inventoryItem.salesPrice
        };
        setItems(prev => [...prev, newItem]);
      }
    });
    setSelectedInventoryItems([]);
    setShowAddItemsModal(false);
  };

  const handleSubmitBankAccount = () => {
    console.log('Bank account data:', bankAccount);
    setShowBankAccountModal(false);
    alert('Bank account added successfully!');
  };

  const filteredParties = parties.filter(party =>
    party.name.toLowerCase().includes(partySearch.toLowerCase())
  );

  const filteredInventoryItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
    item.code.toLowerCase().includes(itemSearch.toLowerCase())
  );

 return (
  <div className="w-full bg-gray-50">
      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* <Navbar 
          title="Create Quotation"
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
        /> */}

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', gap: '24px' }}>
            {/* Left Column - Main Form */}
            <div style={{ flex: 1 }}>
              {/* Bill To Section */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px', marginTop: 0 }}>
                  Bill To
                </h3>
                {showAddParty ? (
                  <div 
                    style={{
                      border: '2px dashed #d1d5db',
                      borderRadius: '6px',
                      padding: '40px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => setShowPartyModal(true)}
                  >
                    <span style={{ color: '#6366f1', fontSize: '14px', fontWeight: '500' }}>
                      + Add Party
                    </span>
                  </div>
                ) : (
                  <div style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Enter party name"
                      value={formData.partyName}
                      onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                      style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        fontSize: '14px',
                        color: '#111827'
                      }}
                    />
                    {formData.partyName && (
                      <button
                        onClick={() => {
                          setFormData({ ...formData, partyName: '' });
                          setShowAddParty(true);
                        }}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#6b7280'
                        }}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textAlign: 'left', padding: '8px 4px', width: '40px' }}>NO</th>
                      <th style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textAlign: 'left', padding: '8px 4px' }}>ITEMS / SERVICES</th>
                      <th style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textAlign: 'left', padding: '8px 4px', width: '100px' }}>HSN / SAC</th>
                      <th style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textAlign: 'center', padding: '8px 4px', width: '80px' }}>QTY</th>
                      <th style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textAlign: 'right', padding: '8px 4px', width: '100px' }}>PRICE/ITEM (₹)</th>
                      <th style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textAlign: 'right', padding: '8px 4px', width: '100px' }}>DISCOUNT</th>
                      <th style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textAlign: 'right', padding: '8px 4px', width: '80px' }}>TAX</th>
                      <th style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textAlign: 'right', padding: '8px 4px', width: '120px' }}>AMOUNT (₹)</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={9}>
                          <div 
                            style={{
                              border: '2px dashed #d1d5db',
                              borderRadius: '6px',
                              padding: '40px',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              cursor: 'pointer',
                              marginTop: '12px'
                            }}
                            onClick={() => setShowAddItemsModal(true)}
                          >
                            <span style={{ color: '#6366f1', fontSize: '14px', fontWeight: '500' }}>
                              + Add Item
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '8px 4px' }}>{index + 1}</td>
                          <td style={{ padding: '8px 4px' }}>
                            <input 
                              type="text" 
                              placeholder="Item name" 
                              value={item.name}
                              onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                              style={{ width: '100%', border: 'none', outline: 'none', fontSize: '14px' }} 
                            />
                          </td>
                          <td style={{ padding: '8px 4px' }}>
                            <input 
                              type="text" 
                              placeholder="HSN" 
                              value={item.hsn}
                              onChange={(e) => updateItem(item.id, 'hsn', e.target.value)}
                              style={{ width: '100%', border: 'none', outline: 'none', fontSize: '14px' }} 
                            />
                          </td>
                          <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                            <input 
                              type="number" 
                              value={item.qty}
                              onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              style={{ width: '60px', border: 'none', outline: 'none', fontSize: '14px', textAlign: 'center' }} 
                            />
                          </td>
                          <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                            <input 
                              type="number" 
                              value={item.price}
                              onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              style={{ width: '80px', border: 'none', outline: 'none', fontSize: '14px', textAlign: 'right' }} 
                            />
                          </td>
                          <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                            <input 
                              type="number" 
                              value={item.discount}
                              onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                              min="0"
                              max="100"
                              step="0.01"
                              placeholder="0%"
                              style={{ width: '80px', border: 'none', outline: 'none', fontSize: '14px', textAlign: 'right' }} 
                            />
                          </td>
                          <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                            <select 
                              value={item.tax}
                              onChange={(e) => updateItem(item.id, 'tax', parseFloat(e.target.value))}
                              style={{ width: '70px', border: 'none', outline: 'none', fontSize: '14px', backgroundColor: 'transparent' }}
                            >
                              <option value={0}>0%</option>
                              <option value={5}>5%</option>
                              <option value={12}>12%</option>
                              <option value={18}>18%</option>
                              <option value={28}>28%</option>
                            </select>
                          </td>
                          <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: '500' }}>
                            ₹ {item.amount.toFixed(2)}
                          </td>
                          <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                            <button 
                              onClick={() => deleteItem(item.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                
                {items.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <button
                      onClick={() => setShowAddItemsModal(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6366f1',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        padding: '8px 0'
                      }}
                    >
                      + Add Item
                    </button>
                  </div>
                )}

                {/* Subtotal */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ width: '300px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>SUBTOTAL</span>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>₹ {subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes and Terms Section */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Left: Notes and Terms */}
                <div>
                  {!showNotes && (
                    <button
                      onClick={() => setShowNotes(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6366f1',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        padding: 0,
                        marginBottom: '12px'
                      }}
                    >
                      + Add Notes
                    </button>
                  )}

                  {showNotes && (
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#374151', margin: 0 }}>
                          Notes
                        </h4>
                        <button 
                          onClick={() => {
                            setShowNotes(false);
                            setFormData({ ...formData, notes: '' });
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Add any additional notes here..."
                        style={{ 
                          width: '100%', 
                          minHeight: '80px', 
                          padding: '12px', 
                          border: '1px solid #d1d5db', 
                          borderRadius: '6px', 
                          fontSize: '13px', 
                          color: '#4b5563', 
                          lineHeight: '1.6',
                          resize: 'vertical',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                  )}

                  {showTerms && (
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#374151', margin: 0 }}>
                          Terms and Conditions
                        </h4>
                        <button 
                          onClick={() => setShowTerms(false)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <textarea
                        value={formData.termsAndConditions}
                        onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                        style={{ 
                          width: '100%', 
                          minHeight: '80px', 
                          padding: '12px', 
                          backgroundColor: '#f3f4f6', 
                          border: '1px solid #e5e7eb', 
                          borderRadius: '6px', 
                          fontSize: '13px', 
                          color: '#4b5563', 
                          lineHeight: '1.6',
                          resize: 'vertical',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                  )}

                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6366f1',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      padding: 0,
                      marginTop: '16px'
                    }}
                    onClick={() => setShowBankAccountModal(true)}
                  >
                    + Add New Account
                  </button>
                </div>

                {/* Right: Amount Summary */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '16px' }}>
                  {/* Additional Charges */}
                  <div style={{ marginBottom: '12px' }}>
                    {!showAddCharges && additionalCharges.length === 0 && (
                      <button
                        onClick={() => {
                          setShowAddCharges(true);
                          addAdditionalCharge();
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6366f1',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        + Add Additional Charges
                      </button>
                    )}
                    
                    {additionalCharges.map((charge) => (
                      <div key={charge.id} style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            placeholder="Charge name"
                            value={charge.name}
                            onChange={(e) => updateAdditionalCharge(charge.id, 'name', e.target.value)}
                            style={{
                              flex: 1,
                              padding: '6px 8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '13px'
                            }}
                          />
                          <input
                            type="number"
                            placeholder="Amount"
                            value={charge.amount}
                            onChange={(e) => updateAdditionalCharge(charge.id, 'amount', parseFloat(e.target.value) || 0)}
                            style={{
                              width: '80px',
                              padding: '6px 8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '13px',
                              textAlign: 'right'
                            }}
                          />
                          <button
                            onClick={() => deleteAdditionalCharge(charge.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#ef4444'
                            }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {additionalCharges.length > 0 && (
                      <>
                        <button
                          onClick={addAdditionalCharge}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#6366f1',
                            fontSize: '13px',
                            cursor: 'pointer',
                            padding: '4px 0',
                            marginTop: '4px'
                          }}
                        >
                          + Add another
                        </button>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>Additional Charges</span>
                          <span style={{ fontSize: '14px', fontWeight: '500' }}>₹ {additionalChargesTotal.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingTop: '8px', borderTop: '1px solid #f3f4f6' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Taxable Amount</span>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>₹ {taxableAmount.toFixed(2)}</span>
                  </div>

                  {/* Discount */}
                  <div style={{ marginBottom: '12px' }}>
                    {!showDiscount && (
                      <button
                        onClick={() => setShowDiscount(true)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6366f1',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        + Add Discount
                      </button>
                    )}
                    
                    {showDiscount && (
                      <>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                          <input
                            type="number"
                            placeholder="Discount amount"
                            value={discountAmount}
                            onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            style={{
                              flex: 1,
                              padding: '6px 8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '13px',
                              textAlign: 'right'
                            }}
                          />
                          <button
                            onClick={() => {
                              setShowDiscount(false);
                              setDiscountAmount(0);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#ef4444'
                            }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>Discount</span>
                          <span style={{ fontSize: '14px', color: '#ef4444' }}>- ₹ {discountAmount.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Round Off */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={autoRoundOff}
                        onChange={(e) => setAutoRoundOff(e.target.checked)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }} 
                      />
                      Auto Round Off
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        {roundOffAmount >= 0 ? '+ Add' : '- Subtract'}
                      </span>
                      <input 
                        type="number" 
                        value={Math.abs(roundOffAmount).toFixed(2)}
                        readOnly={autoRoundOff}
                        onChange={(e) => !autoRoundOff && setRoundOffAmount(parseFloat(e.target.value) || 0)}
                        step="0.01"
                        style={{ 
                          width: '80px', 
                          border: '1px solid #d1d5db', 
                          borderRadius: '4px', 
                          padding: '4px 8px', 
                          fontSize: '14px', 
                          textAlign: 'right',
                          backgroundColor: autoRoundOff ? '#f9fafb' : '#ffffff'
                        }} 
                      />
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '2px solid #e5e7eb' }}>
                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>Total Amount</span>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                      ₹ {totalAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* Signature */}
                  <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                      Authorized signatory for <strong>Santosh cycle van reparing shop</strong>
                    </p>
                    
                    {!signature ? (
                      <label
                        style={{
                          border: '2px dashed #d1d5db',
                          borderRadius: '6px',
                          padding: '40px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSignatureUpload}
                          style={{ display: 'none' }}
                        />
                        <span style={{ color: '#6366f1', fontSize: '14px', fontWeight: '500' }}>
                          + Add Signature
                        </span>
                      </label>
                    ) : (
                      <div style={{ position: 'relative', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px' }}>
                        <img 
                          src={signature} 
                          alt="Signature" 
                          style={{ width: '100%', maxHeight: '100px', objectFit: 'contain' }}
                        />
                        <button
                          onClick={() => setSignature(null)}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: '#ffffff',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            padding: '4px',
                            cursor: 'pointer',
                            color: '#ef4444'
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Invoice Details */}
            <div style={{ width: '320px' }}>
              <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '20px' }}>
                {/* Invoice Prefix */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                    Invoice Prefix:
                  </label>
                  <input
                    type="text"
                    value={formData.invoicePrefix}
                    onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#f9fafb',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Invoice Number and Date */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                      Invoice Number:
                    </label>
                    <input
                      type="text"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                      Quotation Date:
                    </label>
                    <input
                      type="text"
                      value={formData.quotationDate}
                      onChange={(e) => setFormData({ ...formData, quotationDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Add Due Date */}
                {!showDueDate ? (
                  <div 
                    onClick={() => setShowDueDate(true)}
                    style={{
                      border: '2px dashed #d1d5db',
                      borderRadius: '6px',
                      padding: '12px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      marginBottom: '16px'
                    }}
                  >
                    <span style={{ color: '#6366f1', fontSize: '13px', fontWeight: '500' }}>
                      + Add Due Date
                    </span>
                  </div>
                ) : (
                  <div style={{ marginBottom: '16px', position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                      Due Date:
                    </label>
                    <input
                      type="text"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      placeholder="DD MMM YYYY"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      onClick={() => {
                        setShowDueDate(false);
                        setFormData({ ...formData, dueDate: '' });
                      }}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '32px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280'
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Other Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                      E-Way Bill No: (?)
                    </label>
                    <input
                      type="text"
                      value={formData.eWayBillNo}
                      onChange={(e) => setFormData({ ...formData, eWayBillNo: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: '#f9fafb',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                      Challan No.:
                    </label>
                    <input
                      type="text"
                      value={formData.challanNo}
                      onChange={(e) => setFormData({ ...formData, challanNo: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: '#f9fafb',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                      Financed By:
                    </label>
                    <input
                      type="text"
                      value={formData.financedBy}
                      onChange={(e) => setFormData({ ...formData, financedBy: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: '#f9fafb',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                      Salesman:
                    </label>
                    <input
                      type="text"
                      value={formData.salesman}
                      onChange={(e) => setFormData({ ...formData, salesman: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: '#f9fafb',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Warranty Period */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                    Warranty Period:
                  </label>
                  <input
                    type="text"
                    value={formData.warrantyPeriod}
                    onChange={(e) => setFormData({ ...formData, warrantyPeriod: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#f9fafb',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Scan Barcode Section */}
              <div 
                style={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '8px', 
                  padding: '20px', 
                  marginTop: '16px', 
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => alert('Barcode scanner would open here')}
              >
                <div style={{ fontSize: '40px', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="20" height="20" rx="1" stroke="#374151" strokeWidth="1"/>
                    <line x1="5" y1="5" x2="5" y2="19" stroke="#374151" strokeWidth="2"/>
                    <line x1="9" y1="5" x2="9" y2="19" stroke="#374151" strokeWidth="1.5"/>
                    <line x1="12" y1="5" x2="12" y2="19" stroke="#374151" strokeWidth="2.5"/>
                    <line x1="16" y1="5" x2="16" y2="19" stroke="#374151" strokeWidth="1"/>
                    <line x1="19" y1="5" x2="19" y2="19" stroke="#374151" strokeWidth="1.5"/>
                  </svg>
                </div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#374151', margin: 0 }}>
                  Scan Barcode
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Party Selection Modal */}
      {showPartyModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', width: '500px', maxHeight: '600px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>Select Party</h3>
              <button onClick={() => setShowPartyModal(false)} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '16px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search party by name or number"
                  value={partySearch}
                  onChange={(e) => setPartySearch(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', paddingRight: '40px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                />
                <Search style={{ position: 'absolute', right: '12px', top: '10px', color: '#9ca3af' }} size={18} />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '500', color: '#6b7280', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                <span>Party Name</span>
                <span>Balance</span>
              </div>
              {filteredParties.map(party => (
                <div 
                  key={party.id}
                  onClick={() => handleSelectParty(party)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ fontSize: '14px', color: '#111827' }}>{party.name}</span>
                  <span style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>₹ {party.balance.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
              <button style={{ color: '#6366f1', fontSize: '14px', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                + Create Party
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Items to Bill Modal */}
      {showAddItemsModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', width: '900px', maxHeight: '600px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>Add Items to Bill</h3>
              <button onClick={() => setShowAddItemsModal(false)} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search by Item/ Serial no./ HSN code/ SKU/ Custom Field / Category"
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', paddingRight: '40px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                />
                <Search style={{ position: 'absolute', right: '12px', top: '10px', color: '#9ca3af' }} size={18} />
              </div>
              <select style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}>
                <option>Select Category</option>
              </select>
              <button style={{ padding: '8px 16px', backgroundColor: '#6366f1', color: '#ffffff', fontSize: '14px', fontWeight: '500', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                Create New Item
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f9fafb', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textAlign: 'left', padding: '12px 16px' }}>Item Name</th>
                    <th style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textAlign: 'left', padding: '12px 16px' }}>Item Code</th>
                    <th style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textAlign: 'left', padding: '12px 16px' }}>Stock</th>
                    <th style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textAlign: 'left', padding: '12px 16px' }}>Sales Price</th>
                    <th style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textAlign: 'left', padding: '12px 16px' }}>Purchase Price</th>
                    <th style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textAlign: 'center', padding: '12px 16px' }}>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventoryItems.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>{item.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>{item.code}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>{item.stock} {item.stock > 0 ? 'PCS' : 'BAG'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>₹{item.salesPrice.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>₹{item.purchasePrice}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button 
                          onClick={() => {
                            if (selectedInventoryItems.includes(item.id)) {
                              setSelectedInventoryItems(selectedInventoryItems.filter(id => id !== item.id));
                            } else {
                              setSelectedInventoryItems([...selectedInventoryItems, item.id]);
                            }
                          }}
                          style={{
                            padding: '4px 12px',
                            fontSize: '14px',
                            fontWeight: '500',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: selectedInventoryItems.includes(item.id) ? '#e5e7eb' : '#eef2ff',
                            color: selectedInventoryItems.includes(item.id) ? '#374151' : '#6366f1'
                          }}
                        >
                          {selectedInventoryItems.includes(item.id) ? '- Remove' : '+ Add'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                <span style={{ color: '#6366f1', fontWeight: '500' }}>{selectedInventoryItems.length} Item(s) Selected</span>
                <span style={{ marginLeft: '16px', color: '#6b7280' }}>
                  Keyboard Shortcuts: <span style={{ fontWeight: '500' }}>Q</span> Change Quantity | 
                  <span style={{ fontWeight: '500', marginLeft: '4px' }}>↑ ↓</span> Move between items
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setShowAddItemsModal(false)}
                  style={{ padding: '8px 16px', border: '1px solid #d1d5db', color: '#374151', fontSize: '14px', fontWeight: '500', borderRadius: '6px', backgroundColor: '#ffffff', cursor: 'pointer' }}
                >
                  Cancel [ESC]
                </button>
                <button 
                  onClick={handleAddItemsToBill}
                  style={{ padding: '8px 16px', backgroundColor: '#6366f1', color: '#ffffff', fontSize: '14px', fontWeight: '500', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                >
                  Add to Bill [F7]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Bank Account Modal */}
      {showBankAccountModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: '#ffffff', zIndex: 1 }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>Add Bank Account</h3>
              <button onClick={() => setShowBankAccountModal(false)} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
              {/* Account Name */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Account Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="ex: Personal Account"
                  value={bankAccount.accountName}
                  onChange={(e) => setBankAccount({ ...bankAccount, accountName: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Opening Balance and As of Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Opening Balance
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#6b7280' }}>₹</span>
                    <input
                      type="number"
                      placeholder="ex: 10,000"
                      value={bankAccount.openingBalance}
                      onChange={(e) => setBankAccount({ ...bankAccount, openingBalance: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '8px 12px', paddingLeft: '28px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    As of Date
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={bankAccount.asOfDate}
                      onChange={(e) => setBankAccount({ ...bankAccount, asOfDate: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                    <Calendar style={{ position: 'absolute', right: '12px', top: '10px', color: '#9ca3af' }} size={18} />
                  </div>
                </div>
              </div>

              {/* Add Bank Details Toggle */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Add Bank Details</span>
                  <div 
                    onClick={() => setShowBankDetails(!showBankDetails)}
                    style={{
                      width: '48px',
                      height: '24px',
                      borderRadius: '9999px',
                      backgroundColor: showBankDetails ? '#6366f1' : '#d1d5db',
                      transition: 'background-color 0.2s',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#ffffff',
                      borderRadius: '50%',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      transform: showBankDetails ? 'translateX(24px)' : 'translateX(2px)',
                      transition: 'transform 0.2s',
                      marginTop: '2px'
                    }} />
                  </div>
                </label>
              </div>

              {showBankDetails && (
                <>
                  {/* Bank Account Number */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                        Bank Account Number <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="ex: 12345678915950"
                        value={bankAccount.accountNumber}
                        onChange={(e) => setBankAccount({ ...bankAccount, accountNumber: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                        Re-Enter Bank Account Number <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="ex: 12345678915950"
                        value={bankAccount.reEnterAccountNumber}
                        onChange={(e) => setBankAccount({ ...bankAccount, reEnterAccountNumber: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  {/* IFSC Code and Bank Branch Name */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                        IFSC Code <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="ex: HDFC000075"
                        value={bankAccount.ifscCode}
                        onChange={(e) => setBankAccount({ ...bankAccount, ifscCode: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                        Bank & Branch Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="ex: HDFC, Old Madras"
                        value={bankAccount.bankBranchName}
                        onChange={(e) => setBankAccount({ ...bankAccount, bankBranchName: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  {/* Account Holder Name and UPI ID */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                        Account Holders Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="ex: Elisa wolf"
                        value={bankAccount.accountHolderName}
                        onChange={(e) => setBankAccount({ ...bankAccount, accountHolderName: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                        UPI ID
                      </label>
                      <input
                        type="text"
                        placeholder="ex: elisa@okhdfic"
                        value={bankAccount.upiId}
                        onChange={(e) => setBankAccount({ ...bankAccount, upiId: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px', position: 'sticky', bottom: 0, backgroundColor: '#ffffff' }}>
              <button 
                onClick={() => setShowBankAccountModal(false)}
                style={{ padding: '8px 16px', border: '1px solid #d1d5db', color: '#374151', fontSize: '14px', fontWeight: '500', borderRadius: '6px', backgroundColor: '#ffffff', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitBankAccount}
                style={{ padding: '8px 24px', backgroundColor: '#6366f1', color: '#ffffff', fontSize: '14px', fontWeight: '500', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CreateQuotation;