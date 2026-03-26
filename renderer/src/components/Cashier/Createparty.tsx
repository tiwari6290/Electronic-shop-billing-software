import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { X, MessageSquare, FileText, Building2, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import api from "@/lib/axios";
import { createParty } from "../../services/partyService";

// ── Types ────────────────────────────────────────────────────────────────────
interface BankAccount {
  id: number;
  accountNumber: string;
  reEnterAccountNumber: string;  // form-only field, not sent to backend
  accountHolder: string;         // backend: accountHolder
  bankName: string;              // backend: bankName — stores "Bank & Branch Name" combined
  ifscCode: string;
  branchName: string;            // backend: branchName (optional, parsed from bankName if needed)
  accountType: string;           // backend: Savings | Current | OD
  isPrimary?: boolean;
  upiId?: string;                // form-only, for display/reference
}

interface CustomField {
  id: number;
  fieldName: string;
  fieldValue: string;  // backend field name (was 'value')
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const maskAccount = (acc: string) => acc.length > 4 ? `x${acc.slice(-4)}` : acc;
const INP_STYLE: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box', background: '#fff' };
const LBL_STYLE: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 400, color: '#6b7280', marginBottom: '6px' };

// ── Component ────────────────────────────────────────────────────────────────
const CreateParty: React.FC = () => {
  const navigate  = useNavigate();
  const { id }    = useParams<{ id: string }>();

  // ── category
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName]           = useState('');
  const [categories, setCategories]                     = useState<string[]>([]);

  // ── main form
  const [formData, setFormData] = useState({
    partyName: '', mobileNumber: '', email: '',
    openingBalance: '0', openingBalanceType: 'To_Collect' as 'To_Collect' | 'To_Pay',
    gstin: '', panNumber: '',
    partyType: 'Customer' as 'Customer' | 'Supplier',
    partyCategory: '',
    billingAddress: '', shippingAddress: '', sameAsBilling: false,
    creditPeriod: '0', creditLimit: '0',
    contactPersonName: '', dateOfBirth: '',
  });

  // ── bank accounts
  const [bankAccounts, setBankAccounts]     = useState<BankAccount[]>([]);
  const [showBankModal, setShowBankModal]   = useState(false);
  const [editingBank, setEditingBank]       = useState<BankAccount | null>(null);
  const [bankForm, setBankForm]             = useState<BankAccount>({
    id: 0, accountNumber: '', reEnterAccountNumber: '',
    accountHolder: '', bankName: '', ifscCode: '', branchName: '',
    accountType: 'Savings', isPrimary: false, upiId: '',
  });

  // ── custom fields
  const [customFields, setCustomFields]                   = useState<CustomField[]>([]);
  const [showPartySettingsModal, setShowPartySettingsModal] = useState(false);
  const [showCustomFieldsView, setShowCustomFieldsView]   = useState(false);
  const [showCreateCfModal, setShowCreateCfModal]         = useState(false);
  const [cfName, setCfName]   = useState('');
  const [cfType, setCfType]   = useState('Text');
  const [cfReq,  setCfReq]    = useState(false);

  // ── smart greetings
  const [invoiceMilestone, setInvoiceMilestone] = useState(true);
  const [birthdayWishes,   setBirthdayWishes]   = useState(true);
  const [invoiceMessage,   setInvoiceMessage]   = useState("Hey, [[MilestoneMessage]] with [[YourBusinessName]] — thank you, [[PartyName]]! 🎉 <View Invoice>");
  const [birthdayMessage,  setBirthdayMessage]  = useState("Happy Birthday, [[Party Name]]! 🎂 Wishing you success & smiles.");

  // ── Load categories
  useEffect(() => {
    const saved = localStorage.getItem('categories');
    if (saved) setCategories(JSON.parse(saved));
  }, []);

  // ── Load party + banks + custom fields when editing
  useEffect(() => {
    if (!id) return;
    const fetchParty = async () => {
      try {
        const res = await api.get(`/parties/${id}`);
        const p   = res.data.data;
        setFormData(prev => ({
          ...prev,
          partyName: p.partyName || '',
          mobileNumber: p.mobileNumber || '',
          email: p.email || '',
          gstin: p.gstin || '',
          panNumber: p.panNumber || '',
          partyType: p.partyType || 'Customer',
          partyCategory: p.partyCategory || '',
          billingAddress: p.billingAddress || '',
          shippingAddress: p.shippingAddress || '',
          openingBalance: p.openingBalance?.toString() || '0',
          openingBalanceType: p.openingBalanceType || 'To_Collect',
          creditPeriod: p.creditPeriod?.toString() || '0',
          creditLimit: p.creditLimit?.toString() || '0',
          contactPersonName: p.contactPersonName || '',
          dateOfBirth: p.dateOfBirth || '',
        }));
      } catch (err) { console.error('Error fetching party:', err); }
    };
    fetchParty();
    // Load bank accounts and custom fields from backend
    api.get(`/parties/${id}/bank-accounts`).then(r => {
      setBankAccounts((r.data.data || []).map((b: any) => ({
        id: b.id, accountNumber: b.accountNumber, reEnterAccountNumber: b.accountNumber,
        accountHolder: b.accountHolder, bankName: b.bankName, ifscCode: b.ifscCode,
        branchName: b.branchName || '', accountType: b.accountType, isPrimary: b.isPrimary,
      })));
    }).catch(() => setBankAccounts([]));
    api.get(`/parties/${id}/custom-fields`).then(r => {
      setCustomFields((r.data.data || []).map((f: any) => ({
        id: f.id, fieldName: f.fieldName, fieldValue: f.fieldValue || '',
      })));
    }).catch(() => setCustomFields([]));
  }, [id]);

  // ── Helpers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked, ...(name === 'sameAsBilling' && checked ? { shippingAddress: prev.billingAddress } : {}) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // ── Save party
  const handleSave = async () => {
    if (!formData.partyName.trim()) { alert('Party Name is required'); return; }

    // Core party payload — no banks/CF here to avoid backend validation blocking creation
    const payload: any = {
      partyName: formData.partyName, mobileNumber: formData.mobileNumber,
      email: formData.email, gstin: formData.gstin, panNumber: formData.panNumber,
      partyType: formData.partyType, partyCategory: formData.partyCategory,
      billingAddress: formData.billingAddress, shippingAddress: formData.shippingAddress,
      creditPeriod: Number(formData.creditPeriod), creditLimit: Number(formData.creditLimit),
      openingBalance: Number(formData.openingBalance), openingBalanceType: formData.openingBalanceType,
      contactPersonName: formData.contactPersonName, dateOfBirth: formData.dateOfBirth,
    };

    try {
      if (id) {
        // ── UPDATE existing party ───────────────────────────────
        await api.put(`/parties/${id}`, payload);
        alert('Party updated successfully');
      } else {
        // ── CREATE new party ────────────────────────────────────
        const res = await createParty(payload) as any;
        const newId = res?.data?.id || res?.id;

        if (newId) {
          // Save bank accounts one by one (skip invalid ones silently)
          for (const b of bankAccounts) {
            try {
              await api.post(`/parties/${newId}/bank-accounts`, {
                accountHolder: b.accountHolder || 'N/A',
                accountNumber: b.accountNumber,
                bankName:      b.bankName      || 'N/A',
                ifscCode:      b.ifscCode      || 'XXXX0000000',
                branchName:    b.branchName    || '',
                accountType:   b.accountType   || 'Savings',
                isPrimary:     b.isPrimary     || false,
              });
            } catch {}
          }
          // Save custom fields one by one
          for (const f of customFields) {
            try {
              await api.post(`/parties/${newId}/custom-fields`, {
                fieldName:  f.fieldName,
                fieldValue: f.fieldValue || '',
              });
            } catch {}
          }
        }
        alert('Party created successfully');
      }
      navigate('/cashier/parties');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  // ── Bank account handlers
  const openAddBank = () => {
    setEditingBank(null);
    setBankForm({ id: 0, accountNumber: '', reEnterAccountNumber: '', accountHolder: '', bankName: '', ifscCode: '', branchName: '', accountType: 'Savings', isPrimary: false, upiId: '' });
    setShowBankModal(true);
  };

  const openEditBank = (bank: BankAccount) => {
    setEditingBank(bank);
    setBankForm({ ...bank, reEnterAccountNumber: bank.accountNumber });
    setShowBankModal(true);
  };

  const handleSaveBank = async () => {
    if (!bankForm.accountNumber.trim()) { alert('Account number is required'); return; }
    if (!editingBank && bankForm.accountNumber !== bankForm.reEnterAccountNumber) { alert('Account numbers do not match'); return; }
    if (!bankForm.accountHolder.trim()) { alert('Account holder name is required'); return; }

    const payload = {
      accountHolder: bankForm.accountHolder,
      accountNumber: bankForm.accountNumber,
      bankName: bankForm.bankName,
      ifscCode: bankForm.ifscCode,
      branchName: bankForm.branchName,
      accountType: bankForm.accountType,
      isPrimary: bankForm.isPrimary || false,
    };

    try {
      if (editingBank && id) {
        // Update existing
        const res = await api.put(`/parties/${id}/bank-accounts/${editingBank.id}`, payload);
        setBankAccounts(prev => prev.map(b => b.id === editingBank.id ? { ...b, ...res.data.data } : b));
      } else if (id) {
        // Add to existing party
        const res = await api.post(`/parties/${id}/bank-accounts`, payload);
        setBankAccounts(prev => [...prev, { ...res.data.data, reEnterAccountNumber: res.data.data.accountNumber, branchName: res.data.data.branchName || '' }]);
      } else {
        // New party — keep in state, will be sent on Save
        if (editingBank) {
          setBankAccounts(prev => prev.map(b => b.id === editingBank.id ? { ...bankForm, id: editingBank.id } : b));
        } else {
          setBankAccounts(prev => [...prev, { ...bankForm, id: Date.now() }]);
        }
      }
      setShowBankModal(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save bank account');
    }
  };

  const handleDeleteBank = async (bankId: number) => {
    if (!window.confirm('Delete this bank account?')) return;
    try {
      if (id) await api.delete(`/parties/${id}/bank-accounts/${bankId}`);
    } catch {}
    setBankAccounts(prev => prev.filter(b => b.id !== bankId));
  };

  // ── Custom field handlers
  const handleCreateCf = async () => {
    if (!cfName.trim()) { alert('Field name is required'); return; }
    const payload = { fieldName: cfName, fieldValue: '' };
    try {
      if (id) {
        const res = await api.post(`/parties/${id}/custom-fields`, payload);
        const created = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
        setCustomFields(prev => [...prev, { id: created.id, fieldName: created.fieldName, fieldValue: created.fieldValue || '' }]);
      } else {
        // New party — keep in local state, sent on Save
        setCustomFields(prev => [...prev, { id: Date.now(), fieldName: cfName, fieldValue: '' }]);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create field');
      return;
    }
    setCfName(''); setCfType('Text'); setCfReq(false);
    setShowCreateCfModal(false);
  };

  const handleDeleteCf = async (cfId: number) => {
    if (!window.confirm('Delete this custom field?')) return;
    try {
      if (id) await api.delete(`/parties/${id}/custom-fields/${cfId}`);
    } catch {}
    setCustomFields(prev => prev.filter(f => f.id !== cfId));
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f9fafb' }}>
      <Navbar
        title={id ? 'Edit Party' : 'Create Party'}
        showBackButton={true} backPath="/cashier/parties"
        showSettings={true} settingsLabel="Party Settings"
        onSettingsClick={() => setShowPartySettingsModal(true)}
        primaryAction={{ label: 'Save', onClick: handleSave }}
        secondaryAction={{ label: 'Save & New', onClick: () => {} }}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

          {/* ── General Details ─────────────────────────── */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 500, color: '#374151', marginBottom: '16px' }}>General Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={LBL_STYLE}>Party Name<span style={{ color: '#ef4444' }}>*</span></label>
                <input style={INP_STYLE} type="text" name="partyName" value={formData.partyName} onChange={handleInputChange} placeholder="Enter name" />
              </div>
              <div>
                <label style={LBL_STYLE}>Mobile Number</label>
                <input style={INP_STYLE} type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} placeholder="Enter mobile number" />
              </div>
              <div>
                <label style={LBL_STYLE}>Email</label>
                <input style={INP_STYLE} type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter email" />
              </div>
              <div>
                <label style={LBL_STYLE}>Opening Balance</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: '12px', top: '9px', fontSize: '14px', color: '#6b7280' }}>&#8377;</span>
                    <input className="aab" type="number" name="openingBalance" value={formData.openingBalance} onChange={handleInputChange}
                      style={{ width: '100px', paddingLeft: '28px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <select name="openingBalanceType" value={formData.openingBalanceType} onChange={handleInputChange}
                    style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', color: '#111827', outline: 'none', backgroundColor: '#ffffff', minWidth: '120px' }}>
                    <option value="To_Collect">To Collect</option>
                    <option value="To_Pay">To Pay</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={LBL_STYLE}>GSTIN</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input style={{ ...INP_STYLE, flex: 1 }} type="text" name="gstin" value={formData.gstin} onChange={handleInputChange} placeholder="ex: 29XXXXX9438X1XX" />
                  <button onClick={() => {}} style={{ padding: '8px 20px', background: '#c4b5fd', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#fff', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap' }}>Get Details</button>
                </div>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px', marginBottom: 0 }}>Note: You can auto populate party details from GSTIN</p>
              </div>
              <div>
                <label style={LBL_STYLE}>PAN Number</label>
                <input style={INP_STYLE} type="text" name="panNumber" value={formData.panNumber} onChange={handleInputChange} placeholder="Enter party PAN Number" />
              </div>
              <div />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '16px' }}>
              <div>
                <label style={LBL_STYLE}>Party Type<span style={{ color: '#ef4444' }}>*</span></label>
                <select name="partyType" value={formData.partyType} onChange={handleInputChange} style={{ ...INP_STYLE, backgroundColor: '#fff' }}>
                  <option>Customer</option><option>Supplier</option><option>Both</option>
                </select>
              </div>
              <div>
                <label style={LBL_STYLE}>Party Category</label>
                <select value={formData.partyCategory}
                  onChange={e => { if (e.target.value === '__add_new__') { setShowAddCategoryInput(true); return; } setFormData(p => ({ ...p, partyCategory: e.target.value })); }}
                  style={{ ...INP_STYLE, backgroundColor: '#fff' }}>
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  <option value="__add_new__">+ Add New Category</option>
                </select>
                {showAddCategoryInput && (
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                    <input type="text" placeholder="Enter new category" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)}
                      style={{ flex: 1, padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none' }} />
                    <button type="button" style={{ padding: '6px 12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      onClick={() => {
                        if (!newCategoryName.trim()) return;
                        const existing = JSON.parse(localStorage.getItem('categories') || '[]');
                        const updated  = existing.includes(newCategoryName) ? existing : [...existing, newCategoryName];
                        localStorage.setItem('categories', JSON.stringify(updated));
                        setCategories(updated);
                        setFormData(p => ({ ...p, partyCategory: newCategoryName }));
                        setNewCategoryName(''); setShowAddCategoryInput(false);
                      }}>Add</button>
                  </div>
                )}
              </div>
              <div />
            </div>
          </div>

          {/* ── Address ─────────────────────────────────── */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 500, color: '#374151', marginBottom: '16px' }}>Address</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={LBL_STYLE}>Billing Address</label>
                <textarea name="billingAddress" value={formData.billingAddress} onChange={handleInputChange} placeholder="Enter billing address" rows={5}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', color: '#111827', outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', color: '#6b7280' }}>Shipping Address</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" name="sameAsBilling" checked={formData.sameAsBilling} onChange={handleInputChange} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Same as Billing address</span>
                  </label>
                </div>
                <textarea name="shippingAddress" value={formData.shippingAddress} onChange={handleInputChange} placeholder="Enter shipping address" rows={5} disabled={formData.sameAsBilling}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', color: '#111827', outline: 'none', resize: 'none', fontFamily: 'inherit', backgroundColor: formData.sameAsBilling ? '#e5e7eb' : '#fff', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>

          {/* ── Credit ──────────────────────────────────── */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
              <div>
                <label style={LBL_STYLE}>Credit Period</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="number" name="creditPeriod" value={formData.creditPeriod} onChange={handleInputChange}
                    style={{ width: '80px', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Days</span>
                </div>
              </div>
              <div>
                <label style={LBL_STYLE}>Credit Limit</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '9px', fontSize: '14px', color: '#6b7280' }}>&#8377;</span>
                  <input type="number" name="creditLimit" value={formData.creditLimit} onChange={handleInputChange}
                    style={{ width: '100%', paddingLeft: '28px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div /><div />
            </div>
          </div>

          {/* ── Contact Person ───────────────────────────── */}
          <div style={{ marginTop: '30px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>Contact Person Details</h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={LBL_STYLE}>Contact Person Name</label>
                <input style={INP_STYLE} type="text" name="contactPersonName" value={formData.contactPersonName} onChange={handleInputChange} placeholder="Ex: Ankit Mishra" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={LBL_STYLE}>Date of Birth</label>
                <input style={INP_STYLE} type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          {/* ── Party Bank Account ───────────────────────── */}
          <div style={{ marginTop: '40px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>Party Bank Account</h3>

            {bankAccounts.length === 0 ? (
              <div style={{ border: '1px dashed #d1d5db', borderRadius: '8px', padding: '40px', textAlign: 'center' }}>
                <p style={{ color: '#6b7280', marginBottom: '10px', marginTop: 0 }}>Add party bank information to manage transactions</p>
                <button onClick={openAddBank} style={{ background: 'transparent', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>
                  + Add Bank Account
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {bankAccounts.map(bank => (
                  <div key={bank.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                        <Building2 size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{maskAccount(bank.accountNumber)}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>{bank.accountNumber}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => openEditBank(bank)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#4f46e5', fontSize: '13px', fontWeight: 500, cursor: 'pointer', padding: '4px 10px', borderRadius: '6px' }}>
                        <Edit2 size={12} /> Edit
                      </button>
                      <button onClick={() => handleDeleteBank(bank.id)}
                        style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={openAddBank}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'none', border: '1px dashed #d0d5dd', color: '#4f46e5', fontSize: '13px', fontWeight: 500, cursor: 'pointer', padding: '10px', borderRadius: '8px', width: '100%' }}>
                  + Add Another Account
                </button>
              </div>
            )}
          </div>

          {/* ── Custom Fields ────────────────────────────── */}
          <div style={{ marginTop: '40px', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>Custom Field</h3>

            {customFields.length === 0 ? (
              <div style={{ textAlign: 'center', border: '1px dashed #d1d5db', borderRadius: '8px', padding: '32px' }}>
                <p style={{ color: '#6b7280', marginTop: 0, marginBottom: '12px' }}>Store more information about your parties by adding custom fields</p>
                <button onClick={() => { setShowPartySettingsModal(true); setShowCustomFieldsView(true); }}
                  style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                  Add Custom Fields
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  {customFields.map(cf => (
                    <div key={cf.id}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>{cf.fieldName}</label>
                        <button onClick={() => handleDeleteCf(cf.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px 4px', borderRadius: '4px' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Enter value"
                        value={cf.fieldValue}
                        onChange={async e => {
                          const newVal = e.target.value;
                          setCustomFields(prev => prev.map(f => f.id === cf.id ? { ...f, fieldValue: newVal } : f));
                          if (id) {
                            try { await api.put(`/parties/${id}/custom-fields/${cf.id}`, { fieldName: cf.fieldName, fieldValue: newVal }); } catch {}
                          }
                        }}
                        style={INP_STYLE}
                      />
                    </div>
                  ))}
                </div>
                <button onClick={() => { setShowPartySettingsModal(true); setShowCustomFieldsView(true); }}
                  style={{ background: 'none', border: '1px dashed #d0d5dd', color: '#4f46e5', fontSize: '13px', fontWeight: 500, cursor: 'pointer', padding: '8px 16px', borderRadius: '8px' }}>
                  + Add More Fields
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ═══ Bank Account Modal ═══════════════════════════ */}
      {showBankModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', width: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>{editingBank ? 'Edit Bank Account' : 'Add Bank Account'}</h3>
              <button onClick={() => setShowBankModal(false)} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Bank Account Number <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" placeholder="ex: 123456789" value={bankForm.accountNumber} onChange={e => setBankForm(p => ({ ...p, accountNumber: e.target.value }))} style={{ ...INP_STYLE }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Re-Enter Account Number <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" placeholder="ex: 123456789" value={bankForm.reEnterAccountNumber} onChange={e => setBankForm(p => ({ ...p, reEnterAccountNumber: e.target.value }))} style={{ ...INP_STYLE }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>IFSC Code</label>
                  <input type="text" placeholder="ex: SBIN000234" value={bankForm.ifscCode} onChange={e => setBankForm(p => ({ ...p, ifscCode: e.target.value }))} style={{ ...INP_STYLE }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Bank &amp; Branch Name</label>
                  <input type="text" placeholder="ex: SBI, AGRA" value={bankForm.bankName} onChange={e => setBankForm(p => ({ ...p, bankName: e.target.value }))} style={{ ...INP_STYLE }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Account Holder's Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="text" placeholder="ex: Babu Lal" value={bankForm.accountHolder} onChange={e => setBankForm(p => ({ ...p, accountHolder: e.target.value }))} style={{ ...INP_STYLE }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>UPI ID</label>
                  <input type="text" placeholder="ex: babulal@upi" value={bankForm.upiId || ''} onChange={e => setBankForm(p => ({ ...p, upiId: e.target.value }))} style={{ ...INP_STYLE }} />
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowBankModal(false)} style={{ padding: '8px 16px', border: '1px solid #d1d5db', color: '#374151', fontSize: '14px', fontWeight: 500, borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveBank} style={{ padding: '8px 20px', background: '#6366f1', color: '#fff', fontSize: '14px', fontWeight: 500, borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                {editingBank ? 'Update' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Party Settings Modal ════════════════════════ */}
      {showPartySettingsModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', width: '700px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>Party Settings</h3>
              <button onClick={() => setShowPartySettingsModal(false)} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Sidebar */}
              <div style={{ width: '200px', borderRight: '1px solid #e5e7eb', padding: '16px' }}>
                <button onClick={() => setShowCustomFieldsView(false)}
                  style={{ width: '100%', padding: '10px 12px', textAlign: 'left', backgroundColor: !showCustomFieldsView ? '#eef2ff' : 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: !showCustomFieldsView ? '#6366f1' : '#374151', fontSize: '14px' }}>
                  <MessageSquare size={18} /> Send Smart Greetings
                </button>
                <button onClick={() => setShowCustomFieldsView(true)}
                  style={{ width: '100%', padding: '10px 12px', textAlign: 'left', backgroundColor: showCustomFieldsView ? '#eef2ff' : 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: showCustomFieldsView ? '#6366f1' : '#374151', fontSize: '14px' }}>
                  <FileText size={18} /> Custom Fields
                </button>
              </div>
              {/* Content */}
              <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                {!showCustomFieldsView ? (
                  <>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '16px', marginTop: 0 }}>Select Templates to Share Automated Smart Greetings with Parties on WhatsApp</h4>
                    {/* Invoice Milestones */}
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div>
                          <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>Invoice Milestones</h5>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>Make every 10th, 25th, 50th or 100th invoice feel special.</p>
                        </div>
                        <div onClick={() => setInvoiceMilestone(!invoiceMilestone)} style={{ width: '48px', height: '24px', borderRadius: '9999px', backgroundColor: invoiceMilestone ? '#6366f1' : '#d1d5db', transition: 'background-color 0.2s', position: 'relative', cursor: 'pointer' }}>
                          <div style={{ width: '20px', height: '20px', backgroundColor: '#fff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transform: invoiceMilestone ? 'translateX(24px)' : 'translateX(2px)', transition: 'transform 0.2s', marginTop: '2px' }} />
                        </div>
                      </div>
                      <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '6px', marginTop: '12px' }}>
                        <input type="text" value={invoiceMessage} onChange={e => setInvoiceMessage(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box', marginBottom: '8px' }} />
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Hey, Half-century! 50 invoices with Aashika Traders — thank you, Shubhi Trading! <span style={{ color: '#6366f1' }}>&lt;View Invoice&gt;</span></p>
                      </div>
                    </div>
                    {/* Birthday Wishes */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div>
                          <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>Birthday Wishes</h5>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>Send a warm greeting on your party's birthday automatically.</p>
                        </div>
                        <div onClick={() => setBirthdayWishes(!birthdayWishes)} style={{ width: '48px', height: '24px', borderRadius: '9999px', backgroundColor: birthdayWishes ? '#6366f1' : '#d1d5db', transition: 'background-color 0.2s', position: 'relative', cursor: 'pointer' }}>
                          <div style={{ width: '20px', height: '20px', backgroundColor: '#fff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transform: birthdayWishes ? 'translateX(24px)' : 'translateX(2px)', transition: 'transform 0.2s', marginTop: '2px' }} />
                        </div>
                      </div>
                      <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '6px', marginTop: '12px' }}>
                        <input type="text" value={birthdayMessage} onChange={e => setBirthdayMessage(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box', marginBottom: '8px' }} />
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Happy Birthday, Shubhi Traders! Wishing you success &amp; smiles.</p>
                      </div>
                    </div>
                  </>
                ) : (
                  /* ── Custom Fields panel ─────────────── */
                  <>
                    {customFields.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                          {[{ bg: '#dbeafe', label: 'License Number', ico: '📄' }, { bg: '#fef3c7', label: 'Birthday', ico: '🎂' }, { bg: '#fce7f3', label: 'Website Link', ico: '🔗' }].map(item => (
                            <div key={item.label} style={{ backgroundColor: item.bg, borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                              <span style={{ fontSize: '24px' }}>{item.ico}</span>
                              <div style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#10b981', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '12px', color: '#fff' }}>✓</span>
                              </div>
                              <div style={{ position: 'absolute', bottom: '-20px', fontSize: '11px', color: '#6b7280', whiteSpace: 'nowrap' }}>{item.label}</div>
                            </div>
                          ))}
                        </div>
                        <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '40px', marginBottom: '20px' }}>You don't have any custom fields created yet</p>
                        <button onClick={() => setShowCreateCfModal(true)} style={{ background: 'transparent', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>
                          + Create custom field
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827' }}>Custom Fields ({customFields.length})</h4>
                          <button onClick={() => setShowCreateCfModal(true)} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', padding: '7px 14px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>+ Add Field</button>
                        </div>
                        {customFields.map(cf => (
                          <div key={cf.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '8px', background: '#f9fafb' }}>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>{cf.fieldName}</div>
                              <div style={{ fontSize: '12px', color: '#9ca3af' }}>Custom Field</div>
                            </div>
                            <button onClick={() => handleDeleteCf(cf.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowPartySettingsModal(false)} style={{ padding: '8px 16px', border: '1px solid #d1d5db', color: '#374151', fontSize: '14px', fontWeight: 500, borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => setShowPartySettingsModal(false)} style={{ padding: '8px 20px', background: '#6366f1', color: '#fff', fontSize: '14px', fontWeight: 500, borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Create Custom Field Modal ═══════════════════ */}
      {showCreateCfModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', width: '460px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>Create Custom Field</h3>
              <button onClick={() => setShowCreateCfModal(false)} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Field Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" placeholder="Enter field name" value={cfName} onChange={e => setCfName(e.target.value)} style={{ ...INP_STYLE }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Field Type <span style={{ color: '#ef4444' }}>*</span></label>
                <select value={cfType} onChange={e => setCfType(e.target.value)} style={{ ...INP_STYLE, backgroundColor: '#fff' }}>
                  <option>Text</option><option>Number</option><option>Date</option><option>Dropdown</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={cfReq} onChange={e => setCfReq(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#6366f1' }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>Required field</span>
                </label>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowCreateCfModal(false)} style={{ padding: '8px 16px', border: '1px solid #d1d5db', color: '#374151', fontSize: '14px', fontWeight: 500, borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreateCf} style={{ padding: '8px 20px', background: '#6366f1', color: '#fff', fontSize: '14px', fontWeight: 500, borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Create Field</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateParty;