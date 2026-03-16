import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PartyProfile.css";
import axios from "axios";
import {
  FileText, CreditCard, Building2, User, AlignJustify,
  Plus, Trash2, Edit2, X, Landmark, MapPin, Check,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface PartyData {
  id: number;
  name: string;
  mobile: string;
  category: string;
  type: string;
  balance: number;
  email?: string;
  gstin?: string;
  panNumber?: string;
  billingAddress?: string;
  shippingAddress?: string;
  creditPeriod?: string;
  creditLimit?: string;
  contactPersonName?: string;
  dateOfBirth?: string;
}

interface BankAccount {
  id: number;
  accountNumber: string;
  accountHolder: string;
  bankName: string;
  ifscCode: string;
  branchName?: string;
  accountType: string;
  upiId?: string;
  isPrimary?: boolean;
}

interface CustomField {
  id: number;
  fieldName: string;
  fieldValue: string;
}

interface ShippingAddress {
  id: number;
  name: string;
  address: string;
  isDefault: boolean;
}

const API = 'http://localhost:4000/api';
const maskAccount = (acc: string) => acc.length > 4 ? `x${acc.slice(-4)}` : acc;

// ── Bank Add/Edit Modal ────────────────────────────────────────────────────────
const BankModal: React.FC<{
  bank: BankAccount | null;
  onClose: () => void;
  onSave: (b: BankAccount, isNew: boolean) => void;
}> = ({ bank, onClose, onSave }) => {
  const isNew = !bank || bank.id === 0;

  const [form, setForm] = useState<BankAccount & { reEnterAccountNumber: string }>({
    id: bank?.id || 0,
    accountNumber: bank?.accountNumber || '',
    reEnterAccountNumber: bank?.accountNumber || '',
    accountHolder: bank?.accountHolder || '',
    bankName: bank?.bankName || '',
    ifscCode: bank?.ifscCode || '',
    branchName: bank?.branchName || '',
    accountType: bank?.accountType || 'Savings',
    upiId: bank?.upiId || '',
    isPrimary: bank?.isPrimary || false,
  });

  // Single free-text field: "ICICI Bank, Mumbai"
  const [bankBranchDisplay, setBankBranchDisplay] = useState(
    bank?.bankName && bank?.branchName
      ? `${bank.bankName}, ${bank.branchName}`
      : bank?.bankName || ''
  );

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const INP: React.CSSProperties = {
    width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
    borderRadius: '8px', fontSize: '14px', color: '#111827', outline: 'none',
    boxSizing: 'border-box', background: '#fff',
  };
  const LBL: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: 500,
    color: '#374151', marginBottom: '6px',
  };

  const handleSubmit = () => {
    if (!form.accountNumber.trim()) { alert('Account number is required'); return; }
    if (isNew && form.accountNumber !== form.reEnterAccountNumber) { alert('Account numbers do not match'); return; }
    if (!form.accountHolder.trim()) { alert('Account holder name is required'); return; }
    if (!form.ifscCode.trim()) { alert('IFSC code is required'); return; }

    // Parse "ICICI Bank, Mumbai" → bankName + branchName
    const parts = bankBranchDisplay.split(',');
    const parsedBankName   = parts[0]?.trim() || '';
    const parsedBranchName = parts.slice(1).join(',').trim() || '';

    if (!parsedBankName) { alert('Bank name is required'); return; }

    onSave({ ...form, bankName: parsedBankName, branchName: parsedBranchName }, isNew);
    onClose();
  };

  return (
    <div className="pp-overlay" onClick={onClose}>
      <div className="pp-modal" onClick={e => e.stopPropagation()}>
        <div className="pp-modal-hdr">
          <span>{isNew ? 'Add Bank Account' : 'Edit Bank Account'}</span>
          <button className="pp-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="pp-modal-body">
          <div className="pp-grid2">
            <div className="pp-field">
              <label style={LBL}>Bank Account Number <span className="pp-req">*</span></label>
              <input style={INP} type="text" value={form.accountNumber} onChange={f("accountNumber")} placeholder="ex: 123456789" />
            </div>
            <div className="pp-field">
              <label style={LBL}>Re-Enter Bank Account Number <span className="pp-req">*</span></label>
              <input style={INP} type="text" value={form.reEnterAccountNumber} onChange={f("reEnterAccountNumber")} placeholder="ex: 123456789" />
            </div>
            <div className="pp-field">
              <label style={LBL}>IFSC Code</label>
              <input style={INP} type="text" value={form.ifscCode} onChange={f("ifscCode")} placeholder="ex: ICIC0001234" />
            </div>
            <div className="pp-field">
              <label style={LBL}>Bank &amp; Branch Name</label>
              <input
                style={INP}
                type="text"
                value={bankBranchDisplay}
                onChange={e => setBankBranchDisplay(e.target.value)}
                placeholder="ex: ICICI Bank, Mumbai"
              />
            </div>
            <div className="pp-field">
              <label style={LBL}>Account Holder's Name <span className="pp-req">*</span></label>
              <input style={INP} type="text" value={form.accountHolder} onChange={f("accountHolder")} placeholder="ex: Babu Lal" />
            </div>
            <div className="pp-field">
              <label style={LBL}>UPI ID</label>
              <input
                style={INP}
                type="text"
                placeholder="ex: babulal@upi"
                value={form.upiId || ''}
                onChange={e => setForm(p => ({ ...p, upiId: e.target.value }))}
              />
            </div>
          </div>
        </div>
        <div className="pp-modal-ftr">
          <button className="pp-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="pp-btn-primary" onClick={handleSubmit}>{isNew ? 'Submit' : 'Update'}</button>
        </div>
      </div>
    </div>
  );
};

// ── Shipping Address form fields type ─────────────────────────────────────────
interface ShippingFormFields {
  id: number;
  name: string;
  streetAddress: string;
  state: string;
  pincode: string;
  city: string;
  isDefault: boolean;
}

// ── Manage Shipping Addresses Modal ───────────────────────────────────────────
const ShippingModal: React.FC<{
  partyName: string;
  addresses: ShippingAddress[];
  onClose: () => void;
  onUpdate: (addresses: ShippingAddress[]) => void;
}> = ({ partyName, addresses, onClose, onUpdate }) => {
  const [list, setList] = useState<ShippingAddress[]>(addresses);
  // null = list view | 0 = add form | number = edit form (id)
  const [formMode, setFormMode] = useState<number | null>(null);
  const [form, setForm] = useState<ShippingFormFields>({
    id: 0, name: partyName, streetAddress: '', state: '', pincode: '', city: '', isDefault: false,
  });

  const setF = (k: keyof ShippingFormFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const openAdd = () => {
    setForm({ id: 0, name: partyName, streetAddress: '', state: '', pincode: '', city: '', isDefault: list.length === 0 });
    setFormMode(0);
  };

  const openEdit = (addr: ShippingAddress) => {
    // Split stored address back into parts so every field is pre-filled
    const parts = addr.address ? addr.address.split(',').map(s => s.trim()) : [];
    setForm({
      id: addr.id,
      name: addr.name,
      streetAddress: parts[0] || '',
      city: parts[1] || '',
      state: parts[2] || '',
      pincode: parts[3] || '',
      isDefault: addr.isDefault,
    });
    setFormMode(addr.id);
  };

  const handleSetDefault = (id: number) => {
    setList(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  };

  const buildAddress = () =>
    [form.streetAddress, form.city, form.state, form.pincode].filter(Boolean).join(', ');

  const handleSave = () => {
    if (!form.name.trim()) { alert('Shipping name is required'); return; }
    if (!form.streetAddress.trim()) { alert('Street address is required'); return; }

    if (formMode === 0) {
      // Add new
      const newAddr: ShippingAddress = {
        id: Date.now(),
        name: form.name,
        address: buildAddress(),
        isDefault: list.length === 0,
      };
      setList(prev => [...prev, newAddr]);
    } else {
      // Edit existing
      setList(prev => prev.map(a =>
        a.id === formMode
          ? { ...a, name: form.name, address: buildAddress(), isDefault: form.isDefault }
          : a
      ));
    }
    setFormMode(null);
  };

  const INP: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1px solid #d1d5db',
    borderRadius: '8px', fontSize: '14px', color: '#111827', outline: 'none',
    boxSizing: 'border-box', background: '#fff',
  };
  const LBL: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 500, color: '#6366f1', marginBottom: '6px' };

  if (formMode !== null) {
    const isAdding = formMode === 0;
    return (
      <div className="pp-overlay" onClick={() => setFormMode(null)}>
        <div className="pp-modal pp-modal-sm" style={{ width: '480px' }} onClick={e => e.stopPropagation()}>
          <div className="pp-modal-hdr">
            <span>{isAdding ? 'Add Shipping Address' : 'Edit Shipping Address'}</span>
            <button className="pp-close" onClick={() => setFormMode(null)}><X size={18} /></button>
          </div>
          <div className="pp-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={LBL}>Shipping Name <span className="pp-req">*</span></label>
              <input style={INP} type="text" value={form.name} onChange={setF('name')} placeholder={partyName} />
            </div>
            <div>
              <label style={LBL}>Street Address <span className="pp-req">*</span></label>
              <textarea
                rows={3}
                value={form.streetAddress}
                onChange={setF('streetAddress')}
                placeholder="Enter Street Address"
                style={{ ...INP, resize: 'none', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={LBL}>State</label>
                <input style={INP} type="text" value={form.state} onChange={setF('state')} placeholder="Enter State" />
              </div>
              <div>
                <label style={LBL}>Pincode</label>
                <input style={INP} type="text" value={form.pincode} onChange={setF('pincode')} placeholder="Enter pin code" />
              </div>
            </div>
            <div>
              <label style={LBL}>City</label>
              <input style={INP} type="text" value={form.city} onChange={setF('city')} placeholder="Enter City" />
            </div>
          </div>
          <div className="pp-modal-ftr">
            <button className="pp-btn-cancel" onClick={() => setFormMode(null)}>Cancel</button>
            <button className="pp-btn-primary" onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pp-overlay" onClick={onClose}>
      <div className="pp-modal pp-modal-sm" style={{ width: '500px' }} onClick={e => e.stopPropagation()}>
        <div className="pp-modal-hdr">
          <span>Manage Shipping Addresses</span>
          <button className="pp-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="pp-modal-body" style={{ padding: '0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', padding: '10px 20px', borderBottom: '1px solid #e5e7eb', fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>
            <span>Address</span>
            <span style={{ textAlign: 'center', minWidth: '50px' }}>Edit</span>
            <span style={{ textAlign: 'center', minWidth: '110px' }}>Default Address</span>
          </div>
          {list.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
              No shipping addresses added yet.
            </div>
          ) : (
            list.map(addr => (
              <div key={addr.id} style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto',
                padding: '14px 20px', borderBottom: '1px solid #f3f4f6',
                alignItems: 'center', background: addr.isDefault ? '#f5f3ff' : '#fff',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>{addr.name}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{addr.address || 'No Address'}</div>
                </div>
                <div style={{ textAlign: 'center', minWidth: '50px' }}>
                  <button onClick={() => openEdit(addr)}
                    style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}>
                    <Edit2 size={16} />
                  </button>
                </div>
                <div style={{ textAlign: 'center', minWidth: '110px' }}>
                  <button onClick={() => handleSetDefault(addr.id)}
                    style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      border: `2px solid ${addr.isDefault ? '#4f46e5' : '#d1d5db'}`,
                      background: addr.isDefault ? '#4f46e5' : '#fff',
                      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      padding: 0,
                    }}>
                    {addr.isDefault && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
                  </button>
                </div>
              </div>
            ))
          )}
          <div style={{ padding: '14px 20px', borderTop: '1px solid #e5e7eb' }}>
            <button onClick={openAdd}
              style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '14px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', padding: 0 }}>
              <Plus size={15} /> Add New Shipping Address
            </button>
          </div>
        </div>
        <div className="pp-modal-ftr">
          <button className="pp-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="pp-btn-primary" onClick={() => { onUpdate(list); onClose(); }}>Done</button>
        </div>
      </div>
    </div>
  );
};

// ── Custom Field Add Modal ─────────────────────────────────────────────────────
const CustomFieldModal: React.FC<{
  onClose: () => void;
  onCreate: (fieldName: string) => void;
}> = ({ onClose, onCreate }) => {
  const [cfName, setCfName] = useState('');
  const [cfType, setCfType] = useState('Text');
  const [cfReq, setCfReq] = useState(false);

  const INP: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1px solid #d1d5db',
    borderRadius: '7px', fontSize: '14px', color: '#111827', outline: 'none',
    boxSizing: 'border-box', background: '#fff',
  };

  return (
    <div className="pp-overlay" onClick={onClose}>
      <div className="pp-modal pp-modal-sm" onClick={e => e.stopPropagation()}>
        <div className="pp-modal-hdr">
          <span>Create Custom Field</span>
          <button className="pp-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="pp-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
              Field Name <span className="pp-req">*</span>
            </label>
            <input style={INP} type="text" placeholder="Enter field name" value={cfName} onChange={e => setCfName(e.target.value)} autoFocus />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
              Field Type <span className="pp-req">*</span>
            </label>
            <select value={cfType} onChange={e => setCfType(e.target.value)} style={{ ...INP, backgroundColor: '#fff' }}>
              <option>Text</option>
              <option>Number</option>
              <option>Date</option>
              <option>Dropdown</option>
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={cfReq} onChange={e => setCfReq(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#4f46e5' }} />
            <span style={{ fontSize: '14px', color: '#374151' }}>Required field</span>
          </label>
        </div>
        <div className="pp-modal-ftr">
          <button className="pp-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="pp-btn-primary" onClick={() => {
            if (!cfName.trim()) { alert('Field name is required'); return; }
            onCreate(cfName.trim());
            onClose();
          }}>Create Field</button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const PartyProfile: React.FC = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [party,           setParty]           = useState<PartyData | null>(null);
  const [bankAccounts,    setBankAccounts]    = useState<BankAccount[]>([]);
  const [customFields,    setCustomFields]    = useState<CustomField[]>([]);
  const [editingBank,     setEditingBank]     = useState<BankAccount | null>(null);
  const [showAddBank,     setShowAddBank]     = useState(false);
  const [showShipping,    setShowShipping]    = useState(false);
  const [showCfModal,     setShowCfModal]     = useState(false);
  const [shippingList,    setShippingList]    = useState<ShippingAddress[]>([]);

  // ── fetch party data
  useEffect(() => {
    if (!id) return;
    axios.get(`http://localhost:4000/api/parties/${id}`)
      .then(res => {
        const p = res.data.data;
        setParty({
          id: p.id,
          name: p.partyName,
          mobile: p.mobileNumber || "-",
          category: p.partyCategory || "-",
          type: p.partyType,
          balance: p.openingBalanceType === "To_Collect"
            ? Number(p.openingBalance || 0)
            : -Number(p.openingBalance || 0),
          email: p.email,
          gstin: p.gstin,
          panNumber: p.panNumber,
          billingAddress: p.billingAddress,
          shippingAddress: p.shippingAddress,
          creditPeriod: p.creditPeriod?.toString(),
          creditLimit: p.creditLimit?.toString(),
          contactPersonName: p.contactPersonName,
          dateOfBirth: p.dateOfBirth,
        });
        // initialize shipping list with primary address
        if (p.partyName) {
          setShippingList([{
            id: 1,
            name: p.partyName,
            address: p.shippingAddress || '',
            isDefault: true,
          }]);
        }
      })
      .catch(err => console.error("Error fetching party:", err));
  }, [id]);

  // ── load banks + custom fields from API
  useEffect(() => {
    if (!id) return;
    axios.get(`${API}/parties/${id}/bank-accounts`)
      .then(r => setBankAccounts(r.data.data || []))
      .catch(() => setBankAccounts([]));
    axios.get(`${API}/parties/${id}/custom-fields`)
      .then(r => setCustomFields(r.data.data || []))
      .catch(() => setCustomFields([]));
  }, [id]);

  // ── bank: add → API POST
  const handleAddBankSave = async (bank: BankAccount) => {
    try {
      const payload = {
        accountHolder: bank.accountHolder,
        accountNumber: bank.accountNumber,
        bankName: bank.bankName,
        ifscCode: bank.ifscCode,
        branchName: bank.branchName,
        accountType: bank.accountType,
        upiId: bank.upiId || '',
        isPrimary: bank.isPrimary,
      };
      const res = await axios.post(`${API}/parties/${id}/bank-accounts`, payload);
      setBankAccounts(prev => [...prev, res.data.data]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add bank account');
    }
  };

  // ── bank: edit save → API PUT
  const handleBankSave = async (updated: BankAccount, isNew: boolean) => {
    if (isNew) { handleAddBankSave(updated); return; }
    try {
      const payload = {
        accountHolder: updated.accountHolder,
        accountNumber: updated.accountNumber,
        bankName: updated.bankName,
        ifscCode: updated.ifscCode,
        branchName: updated.branchName,
        accountType: updated.accountType,
        upiId: updated.upiId || '',
        isPrimary: updated.isPrimary,
      };
      await axios.put(`${API}/parties/${id}/bank-accounts/${updated.id}`, payload);
      setBankAccounts(prev => prev.map(b => b.id === updated.id ? updated : b));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update bank account');
    }
  };

  // ── bank: delete → API DELETE
  const handleDeleteBank = async (bankId: number) => {
    if (!window.confirm("Delete this bank account?")) return;
    try {
      await axios.delete(`${API}/parties/${id}/bank-accounts/${bankId}`);
      setBankAccounts(prev => prev.filter(b => b.id !== bankId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete bank account');
    }
  };

  // ── custom field: create via API POST
  const handleCreateCf = async (fieldName: string) => {
    try {
      const res = await axios.post(`${API}/parties/${id}/custom-fields`, { fieldName, fieldValue: '' });
      const created = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
      setCustomFields(prev => [...prev, { id: created.id, fieldName: created.fieldName, fieldValue: created.fieldValue || '' }]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create custom field');
    }
  };

  // ── custom field: delete → API DELETE
  const handleDeleteCf = async (cfId: number) => {
    if (!window.confirm("Delete this custom field?")) return;
    try {
      await axios.delete(`${API}/parties/${id}/custom-fields/${cfId}`);
      setCustomFields(prev => prev.filter(f => f.id !== cfId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete custom field');
    }
  };

  if (!party) return <div style={{ padding: "20px", color: "#9ca3af" }}>Loading...</div>;

  return (
    <div className="profile-container">

      {/* ── LEFT COLUMN ─────────────────────────────────── */}
      <div className="pp-col">

        {/* General Details */}
        <div className="pp-card">
          <div className="pp-card-hdr">
            <FileText size={15} className="pp-hdr-icon" />
            <span>General Details</span>
          </div>
          <div className="pp-fields-grid">
            <div className="pp-field-row">
              <div className="pp-fitem">
                <span className="pp-flabel">Party Name</span>
                <span className="pp-fval">{party.name}</span>
              </div>
              <div className="pp-fitem">
                <span className="pp-flabel">Party Type</span>
                <span className="pp-fval">{party.type}</span>
              </div>
            </div>
            <div className="pp-field-row">
              <div className="pp-fitem">
                <span className="pp-flabel">Mobile Number</span>
                <span className="pp-fval">{party.mobile}</span>
              </div>
              <div className="pp-fitem">
                <span className="pp-flabel">Party Category</span>
                <span className="pp-fval">{party.category}</span>
              </div>
            </div>
            <div className="pp-field-row">
              <div className="pp-fitem pp-fitem-full">
                <span className="pp-flabel">Email</span>
                <span className="pp-fval">{party.email || "-"}</span>
              </div>
            </div>
            <div className="pp-field-row">
              <div className="pp-fitem pp-fitem-full">
                <span className="pp-flabel">Opening Balance</span>
                <span className="pp-fval">&#8377; {party.balance}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Credit Details */}
        <div className="pp-card">
          <div className="pp-card-hdr">
            <CreditCard size={15} className="pp-hdr-icon" />
            <span>Credit Details</span>
          </div>
          <div className="pp-fields-grid">
            <div className="pp-field-row">
              <div className="pp-fitem">
                <span className="pp-flabel">Credit Period</span>
                <span className="pp-fval">{party.creditPeriod ? `${party.creditPeriod} Days` : "-"}</span>
              </div>
              <div className="pp-fitem">
                <span className="pp-flabel">Credit Limit</span>
                <span className="pp-fval">{party.creditLimit || "-"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Party Bank Details */}
        <div className="pp-card">
          <div className="pp-card-hdr">
            <Landmark size={15} className="pp-hdr-icon" />
            <span>Party Bank Details</span>
          </div>

          {bankAccounts.length === 0 ? (
            <div className="pp-bank-empty">
              <span className="pp-bank-empty-txt">
                Add bank information to manage transactions with this party.
              </span>
              <button className="pp-circle-btn" onClick={() => setShowAddBank(true)} title="Add bank account">
                <Plus size={15} />
              </button>
            </div>
          ) : (
            <div className="pp-bank-list">
              {bankAccounts.map(bank => (
                <div key={bank.id} className="pp-bank-item">
                  <div className="pp-bank-left">
                    <div className="pp-bank-icon"><Building2 size={15} /></div>
                    <div>
                      <div className="pp-bank-masked">{maskAccount(bank.accountNumber)}</div>
                      <div className="pp-bank-full">{bank.accountNumber}</div>
                    </div>
                  </div>
                  <div className="pp-bank-actions">
                    <button className="pp-bank-edit" onClick={() => setEditingBank(bank)}>
                      <Edit2 size={12} /> Edit
                    </button>
                    <button className="pp-bank-del" onClick={() => handleDeleteBank(bank.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              <button className="pp-bank-add-more" onClick={() => setShowAddBank(true)}>
                <Plus size={13} /> Add Another Account
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ── RIGHT COLUMN ────────────────────────────────── */}
      <div className="pp-col">

        {/* Business Details */}
        <div className="pp-card">
          <div className="pp-card-hdr">
            <Building2 size={15} className="pp-hdr-icon" />
            <span>Business Details</span>
          </div>
          <div className="pp-fields-grid">
            <div className="pp-field-row">
              <div className="pp-fitem">
                <span className="pp-flabel">GSTIN</span>
                <span className="pp-fval">{party.gstin || "-"}</span>
              </div>
              <div className="pp-fitem">
                <span className="pp-flabel">PAN Number</span>
                <span className="pp-fval">{party.panNumber || "-"}</span>
              </div>
            </div>
            <div className="pp-field-row">
              <div className="pp-fitem pp-fitem-full">
                <span className="pp-flabel">Billing Address</span>
                <span className="pp-fval">{party.billingAddress || "-"}</span>
              </div>
            </div>
            <div className="pp-field-row">
              <div className="pp-fitem pp-fitem-full">
                <span className="pp-flabel">Shipping Address</span>
                <span className="pp-fval">
                  {shippingList.find(a => a.isDefault)?.address || party.shippingAddress || "-"}
                </span>
              </div>
            </div>
          </div>
          <button className="pp-manage-shipping" onClick={() => setShowShipping(true)}>
            Manage Shipping Addresses
          </button>
        </div>

        {/* Contact Person Details */}
        <div className="pp-card">
          <div className="pp-card-hdr">
            <User size={15} className="pp-hdr-icon" />
            <span>Contact Person Details</span>
          </div>
          <div className="pp-fields-grid">
            <div className="pp-field-row">
              <div className="pp-fitem">
                <span className="pp-flabel">Contact Person Name</span>
                <span className="pp-fval">{party.contactPersonName || "-"}</span>
              </div>
              <div className="pp-fitem">
                <span className="pp-flabel">Date of Birth</span>
                <span className="pp-fval">{party.dateOfBirth || "-"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Fields */}
        <div className="pp-card pp-card-custom">
          <div className="pp-card-hdr">
            <AlignJustify size={15} className="pp-hdr-icon" />
            <span>Custom Fields</span>
            <button className="pp-circle-btn pp-cf-add" onClick={() => setShowCfModal(true)} title="Add custom field">
              <Plus size={15} />
            </button>
          </div>

          {customFields.length === 0 ? (
            <div className="pp-cf-empty-wrap">
              <p className="pp-cf-empty">
                Now you can add custom item fields like Colour, Size, ID Number, etc.
              </p>
              <button className="pp-cf-goto-btn" onClick={() => setShowCfModal(true)}>
                Add Custom Fields
              </button>
            </div>
          ) : (
            <div className="pp-cf-grid">
              {customFields.map(cf => (
                <div key={cf.id} className="pp-cf-item">
                  <div className="pp-cf-item-hdr">
                    <span className="pp-cf-name">{cf.fieldName}</span>
                    <button className="pp-cf-del" onClick={() => handleDeleteCf(cf.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="pp-cf-value">{cf.fieldValue || "-"}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Bank Edit Modal ──────────────────────────────── */}
      {editingBank && (
        <BankModal
          bank={editingBank}
          onClose={() => setEditingBank(null)}
          onSave={handleBankSave}
        />
      )}

      {/* ── Bank Add Modal ───────────────────────────────── */}
      {showAddBank && (
        <BankModal
          bank={null}
          onClose={() => setShowAddBank(false)}
          onSave={handleBankSave}
        />
      )}

      {/* ── Shipping Modal ───────────────────────────────── */}
      {showShipping && party && (
        <ShippingModal
          partyName={party.name}
          addresses={shippingList}
          onClose={() => setShowShipping(false)}
          onUpdate={setShippingList}
        />
      )}

      {/* ── Custom Field Modal ───────────────────────────── */}
      {showCfModal && (
        <CustomFieldModal
          onClose={() => setShowCfModal(false)}
          onCreate={handleCreateCf}
        />
      )}
    </div>
  );
};

export default PartyProfile;