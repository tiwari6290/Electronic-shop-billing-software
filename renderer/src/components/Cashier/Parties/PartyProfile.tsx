import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./PartyProfile.css";
import axios from "axios";
import {
  FileText, CreditCard, Building2, User, AlignJustify,
  Plus, Trash2, Edit2, X, Landmark,
} from "lucide-react";

// ── Interfaces ──────────────────────────────────────────────────────────────
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
  reEnterAccountNumber?: string;
  ifscCode?: string;
  bankBranchName?: string;
  accountHolderName?: string;
  upiId?: string;
}

interface CustomField {
  id: number;
  fieldName: string;
  fieldType: string;
  value?: string;
}

// ── BankAccountModal ─────────────────────────────────────────────────────────
const BankAccountModal: React.FC<{
  partyId: string;
  existing?: BankAccount | null;
  onClose: () => void;
  onSaved: (acc: BankAccount) => void;
}> = ({ partyId, existing, onClose, onSaved }) => {
  const [form, setForm] = useState({
    accountNumber:       existing?.accountNumber || "",
    reEnterAccountNumber: "",
    ifscCode:            existing?.ifscCode || "",
    bankBranchName:      existing?.bankBranchName || "",
    accountHolderName:   existing?.accountHolderName || "",
    upiId:               existing?.upiId || "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.accountNumber.trim()) { alert("Account number is required"); return; }
    if (!existing && form.accountNumber !== form.reEnterAccountNumber) {
      alert("Account numbers do not match"); return;
    }
    const payload = {
      partyId,
      accountNumber: form.accountNumber,
      ifscCode: form.ifscCode,
      bankBranchName: form.bankBranchName,
      accountHolderName: form.accountHolderName,
      upiId: form.upiId,
    };
    try {
      if (existing) {
        const res = await axios.put(`http://localhost:4000/api/bank-accounts/${existing.id}`, payload);
        onSaved({ ...existing, ...res.data });
      } else {
        const res = await axios.post(`http://localhost:4000/api/bank-accounts`, payload);
        onSaved(res.data);
      }
    } catch {
      // fallback: use local state
      onSaved({ id: existing?.id ?? Date.now(), ...payload });
    }
    onClose();
  };

  return (
    <div className="pp-overlay" onClick={onClose}>
      <div className="pp-modal" onClick={e => e.stopPropagation()}>
        <div className="pp-modal-hdr">
          <span>{existing ? "Edit Bank Account" : "Add Bank Account"}</span>
          <button className="pp-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="pp-modal-body">
          <div className="pp-grid2">
            <div className="pp-field">
              <label>Bank Account Number <span className="pp-req">*</span></label>
              <input type="text" placeholder="ex: 123456789" value={form.accountNumber} onChange={set("accountNumber")} />
            </div>
            {!existing && (
              <div className="pp-field">
                <label>Re-Enter Account Number <span className="pp-req">*</span></label>
                <input type="text" placeholder="ex: 123456789" value={form.reEnterAccountNumber} onChange={set("reEnterAccountNumber")} />
              </div>
            )}
            <div className="pp-field">
              <label>IFSC Code</label>
              <input type="text" placeholder="ex: ICIC0001234" value={form.ifscCode} onChange={set("ifscCode")} />
            </div>
            <div className="pp-field">
              <label>Bank &amp; Branch Name</label>
              <input type="text" placeholder="ex: ICICI Bank, Mumbai" value={form.bankBranchName} onChange={set("bankBranchName")} />
            </div>
            <div className="pp-field">
              <label>Account Holder's Name</label>
              <input type="text" placeholder="ex: Babu Lal" value={form.accountHolderName} onChange={set("accountHolderName")} />
            </div>
            <div className="pp-field">
              <label>UPI ID</label>
              <input type="text" placeholder="ex: babulal@upi" value={form.upiId} onChange={set("upiId")} />
            </div>
          </div>
        </div>
        <div className="pp-modal-ftr">
          <button className="pp-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="pp-btn-primary" onClick={handleSave}>
            {existing ? "Update" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── CustomFieldModal ──────────────────────────────────────────────────────────
const CustomFieldModal: React.FC<{
  partyId: string;
  onClose: () => void;
  onSaved: (cf: CustomField) => void;
}> = ({ partyId, onClose, onSaved }) => {
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("Text");
  const [required, setRequired]   = useState(false);

  const handleCreate = async () => {
    if (!fieldName.trim()) { alert("Field name is required"); return; }
    try {
      const res = await axios.post(`http://localhost:4000/api/custom-fields`, { partyId, fieldName, fieldType });
      onSaved(res.data);
    } catch {
      onSaved({ id: Date.now(), fieldName, fieldType });
    }
    onClose();
  };

  return (
    <div className="pp-overlay" onClick={onClose}>
      <div className="pp-modal pp-modal-sm" onClick={e => e.stopPropagation()}>
        <div className="pp-modal-hdr">
          <span>Create Custom Field</span>
          <button className="pp-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="pp-modal-body">
          <div className="pp-field" style={{ marginBottom: 14 }}>
            <label>Field Name <span className="pp-req">*</span></label>
            <input type="text" placeholder="Enter field name" value={fieldName}
              onChange={e => setFieldName(e.target.value)} />
          </div>
          <div className="pp-field" style={{ marginBottom: 14 }}>
            <label>Field Type <span className="pp-req">*</span></label>
            <select value={fieldType} onChange={e => setFieldType(e.target.value)}>
              <option>Text</option>
              <option>Number</option>
              <option>Date</option>
              <option>Dropdown</option>
            </select>
          </div>
          <label className="pp-checkbox-row">
            <input type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)} />
            <span>Required field</span>
          </label>
        </div>
        <div className="pp-modal-ftr">
          <button className="pp-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="pp-btn-primary" onClick={handleCreate}>Create Field</button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const PartyProfile: React.FC = () => {
  const { id } = useParams();
  const [party, setParty]             = useState<PartyData | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [cfValues, setCfValues]         = useState<Record<number, string>>({});

  const [showBankModal, setShowBankModal]   = useState(false);
  const [editingBank, setEditingBank]       = useState<BankAccount | null>(null);
  const [showCfModal, setShowCfModal]       = useState(false);

  // ── fetch party
  useEffect(() => {
    if (!id) return;
    axios.get(`http://localhost:4000/api/parties/${id}`)
      .then(res => {
        const p = res.data;
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
      })
      .catch(err => console.error("Error fetching party:", err));
  }, [id]);

  // ── fetch bank accounts
  useEffect(() => {
    if (!id) return;
    axios.get(`http://localhost:4000/api/bank-accounts/party/${id}`)
      .then(res => setBankAccounts(res.data || []))
      .catch(() => setBankAccounts([]));
  }, [id]);

  // ── fetch custom fields
  useEffect(() => {
    if (!id) return;
    axios.get(`http://localhost:4000/api/custom-fields/party/${id}`)
      .then(res => setCustomFields(res.data || []))
      .catch(() => setCustomFields([]));
  }, [id]);

  const handleDeleteBank = async (bankId: number) => {
    if (!window.confirm("Delete this bank account?")) return;
    try { await axios.delete(`http://localhost:4000/api/bank-accounts/${bankId}`); } catch {}
    setBankAccounts(prev => prev.filter(b => b.id !== bankId));
  };

  const handleDeleteCf = async (cfId: number) => {
    if (!window.confirm("Delete this custom field?")) return;
    try { await axios.delete(`http://localhost:4000/api/custom-fields/${cfId}`); } catch {}
    setCustomFields(prev => prev.filter(f => f.id !== cfId));
  };

  const maskAccount = (acc: string) =>
    acc.length > 4 ? `x${acc.slice(-4)}` : acc;

  if (!party) return <div style={{ padding: "20px", color: "#9ca3af" }}>Loading...</div>;

  return (
    <div className="profile-container">

      {/* ── LEFT COLUMN ──────────────────────────── */}
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
                <span className="pp-fval">
                  {party.creditPeriod ? `${party.creditPeriod} Days` : "-"}
                </span>
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
            /* Empty state — matches screenshot 1 */
            <div className="pp-bank-empty">
              <span className="pp-bank-empty-txt">
                Add bank information to manage transactions with this party.
              </span>
              <button
                className="pp-circle-btn"
                onClick={() => { setEditingBank(null); setShowBankModal(true); }}
              >
                <Plus size={15} />
              </button>
            </div>
          ) : (
            /* Filled state — matches screenshot 2 */
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
                    <button
                      className="pp-bank-edit"
                      onClick={() => { setEditingBank(bank); setShowBankModal(true); }}
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button className="pp-bank-del" onClick={() => handleDeleteBank(bank.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                className="pp-bank-add-more"
                onClick={() => { setEditingBank(null); setShowBankModal(true); }}
              >
                <Plus size={13} /> Add Another Account
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ── RIGHT COLUMN ─────────────────────────── */}
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
                <span className="pp-fval">{party.shippingAddress || "-"}</span>
              </div>
            </div>
          </div>
          <button className="pp-manage-shipping">Manage Shipping Addresses</button>
        </div>

        {/* Contact Person Details — show always */}
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
            <button
              className="pp-circle-btn pp-cf-add"
              onClick={() => setShowCfModal(true)}
            >
              <Plus size={15} />
            </button>
          </div>

          {customFields.length === 0 ? (
            <p className="pp-cf-empty">
              Now you can add custom item fields like Colour, Size, ID Number, etc.
            </p>
          ) : (
            <div className="pp-cf-grid">
              {customFields.map(cf => (
                <div key={cf.id} className="pp-cf-item">
                  <div className="pp-cf-item-hdr">
                    <span className="pp-cf-name">{cf.fieldName}</span>
                    <button className="pp-cf-del" onClick={() => handleDeleteCf(cf.id)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <input
                    className="pp-cf-input"
                    type={cf.fieldType === "Number" ? "number" : cf.fieldType === "Date" ? "date" : "text"}
                    placeholder="Custom Value"
                    value={cfValues[cf.id] ?? cf.value ?? ""}
                    onChange={e => setCfValues(p => ({ ...p, [cf.id]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Modals ───────────────────────────────── */}
      {showBankModal && (
        <BankAccountModal
          partyId={id!}
          existing={editingBank}
          onClose={() => { setShowBankModal(false); setEditingBank(null); }}
          onSaved={acc => {
            if (editingBank) {
              setBankAccounts(prev => prev.map(b => b.id === acc.id ? acc : b));
            } else {
              setBankAccounts(prev => [...prev, acc]);
            }
          }}
        />
      )}

      {showCfModal && (
        <CustomFieldModal
          partyId={id!}
          onClose={() => setShowCfModal(false)}
          onSaved={cf => setCustomFields(prev => [...prev, cf])}
        />
      )}
    </div>
  );
};

export default PartyProfile;