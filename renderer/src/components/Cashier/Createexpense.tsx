import React, { useState } from 'react';
import { X, Search, MoreVertical, Settings } from 'lucide-react';
import Navbar from './Navbar';
import QuickVoucherSettingsModal from "./QuickQuotationSettingsModal/QuickVoucherSettingsModal";

// Types
interface ExpenseItem {
  id: string;
  name: string;
  hsn: string;
  price: number;
  itemType: 'product' | 'service';
  measuringUnit: string;
  gstRate: string;
  itcApplicable: string;
}

interface Expense {
  id: string;
  prefix: string;
  number: number;
  category: string;
  items: ExpenseItem[];
  originalInvoiceNumber: string;
  date: string;
  paymentMode: string;
  note: string;
  withGst: boolean;
}

const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showCreateItemModal, setShowCreateItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ExpenseItem | null>(null);
  const [showItemMenu, setShowItemMenu] = useState<string | null>(null);
  
  // Form states
  const [expensePrefix, setExpensePrefix] = useState('ME/EX/26-27/');
  const [expenseNumber, setExpenseNumber] = useState(1);
  const [sequenceNumber, setSequenceNumber] = useState('');
  const [prefix, setPrefix] = useState('');
  const [showItemImage, setShowItemImage] = useState(false);
  const [expenseWithGst, setExpenseWithGst] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItems, setSelectedItems] = useState<ExpenseItem[]>([]);
  const [originalInvoiceNumber, setOriginalInvoiceNumber] = useState('');
  const [date, setDate] = useState('10 Feb 2026');
  const [paymentMode, setPaymentMode] = useState('');
  const [note, setNote] = useState('');
  
  // New item form states
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<'product' | 'service'>('product');
  const [newItemPrice, setNewItemPrice] = useState('0');
  const [newItemMeasuringUnit, setNewItemMeasuringUnit] = useState('');
  const [newItemHsn, setNewItemHsn] = useState('');
  const [newItemGstRate, setNewItemGstRate] = useState('None');
  const [newItemItc, setNewItemItc] = useState('Eligible');

  // Sample items
  const [availableItems, setAvailableItems] = useState<ExpenseItem[]>([
    {
      id: '1',
      name: 'abc',
      hsn: '2341',
      price: 13221.0,
      itemType: 'product',
      measuringUnit: 'Ampoule(AMP)',
      gstRate: 'None',
      itcApplicable: 'Eligible'
    }
  ]);

  const handleCreateNewItem = () => {
    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      name: newItemName,
      hsn: newItemHsn,
      price: parseFloat(newItemPrice),
      itemType: newItemType,
      measuringUnit: newItemMeasuringUnit,
      gstRate: newItemGstRate,
      itcApplicable: newItemItc
    };
    
    setAvailableItems([...availableItems, newItem]);
    resetNewItemForm();
    setShowCreateItemModal(false);
  };

  const handleUpdateItem = () => {
    if (selectedItem) {
      const updatedItems = availableItems.map(item =>
        item.id === selectedItem.id
          ? {
              ...item,
              name: newItemName,
              hsn: newItemHsn,
              price: parseFloat(newItemPrice),
              itemType: newItemType,
              measuringUnit: newItemMeasuringUnit,
              gstRate: newItemGstRate,
              itcApplicable: newItemItc
            }
          : item
      );
      setAvailableItems(updatedItems);
      setShowEditItemModal(false);
      resetNewItemForm();
      setSelectedItem(null);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setAvailableItems(availableItems.filter(item => item.id !== itemId));
    setShowItemMenu(null);
  };

  const handleEditItem = (item: ExpenseItem) => {
    setSelectedItem(item);
    setNewItemName(item.name);
    setNewItemHsn(item.hsn);
    setNewItemPrice(item.price.toString());
    setNewItemType(item.itemType);
    setNewItemMeasuringUnit(item.measuringUnit);
    setNewItemGstRate(item.gstRate);
    setNewItemItc(item.itcApplicable);
    setShowItemMenu(null);
    setShowEditItemModal(true);
  };

  const resetNewItemForm = () => {
    setNewItemName('');
    setNewItemHsn('');
    setNewItemPrice('0');
    setNewItemType('product');
    setNewItemMeasuringUnit('');
    setNewItemGstRate('None');
    setNewItemItc('Eligible');
  };

  const handleAddSelectedItems = () => {
    setShowAddItemModal(false);
  };

  const toggleItemSelection = (item: ExpenseItem) => {
    const isSelected = selectedItems.some(i => i.id === item.id);
    if (isSelected) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => sum + item.price, 0);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Navbar 
  title="Create Expense"
  showBackButton={true}
  backPath="/expenses"
  showSettings={true}
  onSettingsClick={() => setShowSettingsModal(true)}
/>

      {/* Page Header Actions */}
<div
  style={{
    position: "absolute",
    top: "12px",
    right: "24px",
    display: "flex",
    gap: "10px",
    alignItems: "center",
    zIndex: 100,
    background: "#fff",
    padding: "4px",
    borderRadius: "8px"
  }}
>
  {/* Settings */}
  <button
    onClick={() => setShowSettingsModal(true)}
    style={{
      border: "1px solid #e5e7eb",
      padding: "8px",
      borderRadius: "6px",
      background: "#fff",
      cursor: "pointer"
    }}
  >
    <Settings size={18} />
  </button>

  {/* Cancel */}
  <button
    onClick={() => window.history.back()}
    style={{
      border: "1px solid #e5e7eb",
      padding: "6px 16px",
      borderRadius: "6px",
      background: "#fff",
      fontSize: "14px"
    }}
  >
    Cancel
  </button>

  {/* Save */}
  <button
  style={{
    background: "#6366f1",
    color: "#fff",
    padding: "6px 20px",
    borderRadius: "6px",
    fontSize: "14px",
    border: "none",
    outline: "none",
    boxShadow: "none"
  }}
>
    Save
  </button>
</div>
      
      
      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
              {/* Left Column */}
              <div>
                {/* GST Toggle */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#374151' }}>Expense With GST</span>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="checkbox"
                        checked={expenseWithGst}
                        onChange={(e) => setExpenseWithGst(e.target.checked)}
                        style={{
                          width: '44px',
                          height: '24px',
                          appearance: 'none',
                          backgroundColor: expenseWithGst ? '#6366f1' : '#d1d5db',
                          borderRadius: '12px',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          outline: 'none'
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: '2px',
                        left: expenseWithGst ? '22px' : '2px',
                        width: '20px',
                        height: '20px',
                        backgroundColor: '#ffffff',
                        borderRadius: '50%',
                        transition: 'left 0.2s',
                        pointerEvents: 'none'
                      }} />
                    </div>
                  </label>
                </div>

                {/* Expense Category & Number */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                      Expense Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: '#6b7280',
                        backgroundColor: '#ffffff',
                        outline: 'none'
                      }}
                    >
                      <option value="">Select Category</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                        Expense Prefix
                      </label>
                      <input
                        type="text"
                        value={expensePrefix}
                        onChange={(e) => setExpensePrefix(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontFamily: 'monospace',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                        Expense Number
                      </label>
                      <input
                        type="number"
                        value={expenseNumber}
                        onChange={(e) => setExpenseNumber(parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Add Items Section */}
                <div style={{
                  border: '2px dashed #6366f1',
                  borderRadius: '8px',
                  padding: '32px',
                  textAlign: 'center',
                  marginBottom: '20px',
                  cursor: 'pointer'
                }}
                onClick={() => setShowAddItemModal(true)}
                >
                  <span style={{ color: '#6366f1', fontSize: '16px', fontWeight: '500' }}>+ Add Item</span>
                </div>

                {/* Selected Items Display */}
                {selectedItems.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    {selectedItems.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          padding: '12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          marginBottom: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <p style={{ margin: '0', fontSize: '14px', fontWeight: '500', color: '#111827' }}>{item.name}</p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>HSN: {item.hsn}</p>
                        </div>
                        <div>
                          <p style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: '#111827' }}>₹ {item.price.toFixed(1)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>Total Expense Amount</span>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>₹ {calculateTotal()}</span>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Original Invoice Number
                  </label>
                  <input
                    type="text"
                    value={originalInvoiceNumber}
                    onChange={(e) => setOriginalInvoiceNumber(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Date
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#6b7280',
                      backgroundColor: '#ffffff',
                      outline: 'none'
                    }}
                  >
                    <option value="">Select</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Note
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Enter Notes"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      minHeight: '100px',
                      resize: 'vertical',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '500px',
            margin: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                Quick Expense Settings
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                style={{
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{
                padding: '16px',
                backgroundColor: '#f0f9ff',
                borderRadius: '8px',
                border: '1px solid #bae6fd',
                marginBottom: '20px'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#6366f1', borderRadius: '50%' }} />
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                      Expense Prefix & Sequence Number
                    </h4>
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#6b7280' }}>
                    Add your custom prefix & sequence for Expense Numbering
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '6px' }}>
                      Prefix
                    </label>
                    <input
                      type="text"
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                      placeholder="Prefix"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '6px' }}>
                      Sequence Number
                    </label>
                    <input
                      type="text"
                      value={sequenceNumber}
                      onChange={(e) => setSequenceNumber(e.target.value)}
                      placeholder="Sequence No"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
                <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>Expense Number:</p>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                      Show Item Image on Invoice
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                      This will apply to all vouchers except for Payment In and Payment Out
                    </p>
                  </div>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <input
                      type="checkbox"
                      checked={showItemImage}
                      onChange={(e) => setShowItemImage(e.target.checked)}
                      style={{
                        width: '44px',
                        height: '24px',
                        appearance: 'none',
                        backgroundColor: showItemImage ? '#6366f1' : '#d1d5db',
                        borderRadius: '12px',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        outline: 'none'
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: '2px',
                      left: showItemImage ? '22px' : '2px',
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#ffffff',
                      borderRadius: '50%',
                      transition: 'left 0.2s',
                      pointerEvents: 'none'
                    }} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              padding: '20px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                onClick={() => setShowSettingsModal(false)}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettingsModal(false)}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '700px',
            margin: '16px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                Add Expense Items
              </h3>
              <button
                onClick={() => setShowAddItemModal(false)}
                style={{
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={18} />
                  <input
                    type="text"
                    placeholder="Search"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 40px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <button
                  onClick={() => setShowCreateItemModal(true)}
                  style={{
                    padding: '10px 16px',
                    border: '2px solid #6366f1',
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    color: '#6366f1',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  +Create New Item
                </button>
              </div>

              <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Item Name</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>HSN/SAC</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Price</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableItems.map((item) => (
                      <tr key={item.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                              type="checkbox"
                              checked={selectedItems.some(i => i.id === item.id)}
                              onChange={() => toggleItemSelection(item)}
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{item.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>{item.hsn}</td>
                        <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#111827' }}>{item.price.toFixed(1)}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => toggleItemSelection(item)}
                              style={{
                                padding: '6px 14px',
                                border: 'none',
                                borderRadius: '6px',
                                backgroundColor: '#6366f1',
                                color: '#ffffff',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: 'pointer'
                              }}
                            >
                              + Add
                            </button>
                            <div style={{ position: 'relative' }}>
                              <button
                                onClick={() => setShowItemMenu(showItemMenu === item.id ? null : item.id)}
                                style={{
                                  padding: '6px',
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#6b7280'
                                }}
                              >
                                <MoreVertical size={18} />
                              </button>
                              
                              {showItemMenu === item.id && (
                                <div style={{
                                  position: 'absolute',
                                  right: 0,
                                  top: '100%',
                                  marginTop: '4px',
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '6px',
                                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                  zIndex: 10,
                                  minWidth: '120px',
                                  overflow: 'hidden'
                                }}>
                                  <button
                                    onClick={() => handleEditItem(item)}
                                    style={{
                                      width: '100%',
                                      padding: '10px 16px',
                                      border: 'none',
                                      background: 'transparent',
                                      textAlign: 'left',
                                      fontSize: '14px',
                                      color: '#374151',
                                      cursor: 'pointer'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    style={{
                                      width: '100%',
                                      padding: '10px 16px',
                                      border: 'none',
                                      background: 'transparent',
                                      textAlign: 'left',
                                      fontSize: '14px',
                                      color: '#ef4444',
                                      cursor: 'pointer'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              padding: '20px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                onClick={() => setShowAddItemModal(false)}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddSelectedItems}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Item Modal */}
      {(showCreateItemModal || showEditItemModal) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '600px',
            margin: '16px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                {showEditItemModal ? 'Edit Expense Item' : 'Create New Expense Item'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateItemModal(false);
                  setShowEditItemModal(false);
                  resetNewItemForm();
                  setSelectedItem(null);
                }}
                style={{
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Item Type
                  </label>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="itemType"
                        value="product"
                        checked={newItemType === 'product'}
                        onChange={(e) => setNewItemType(e.target.value as 'product' | 'service')}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Product</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="itemType"
                        value="service"
                        checked={newItemType === 'service'}
                        onChange={(e) => setNewItemType(e.target.value as 'product' | 'service')}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Service</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Purchase Price
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select style={{
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}>
                      <option>Without Tax</option>
                      <option>With Tax</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Measuring Unit
                  </label>
                  <select
                    value={newItemMeasuringUnit}
                    onChange={(e) => setNewItemMeasuringUnit(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    <option value="">Select Measuring Unit</option>
                    <option value="Ampoule(AMP)">Ampoule(AMP)</option>
                    <option value="Pieces">Pieces</option>
                    <option value="Kg">Kg</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    HSN
                  </label>
                  <input
                    type="text"
                    value={newItemHsn}
                    onChange={(e) => setNewItemHsn(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    GST Tax rate %
                  </label>
                  <select
                    value={newItemGstRate}
                    onChange={(e) => setNewItemGstRate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    <option value="None">None</option>
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    ITC Applicable
                  </label>
                  <select
                    value={newItemItc}
                    onChange={(e) => setNewItemItc(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    <option value="Eligible">Eligible</option>
                    <option value="Not Eligible">Not Eligible</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              padding: '20px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                onClick={() => {
                  setShowCreateItemModal(false);
                  setShowEditItemModal(false);
                  resetNewItemForm();
                  setSelectedItem(null);
                }}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={showEditItemModal ? handleUpdateItem : handleCreateNewItem}
                style={{
                  flex: 1,
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
{showSettingsModal && (
  <QuickVoucherSettingsModal
    type="expense"
    onClose={() => setShowSettingsModal(false)}
  />
)}



};

export default ExpensesPage;