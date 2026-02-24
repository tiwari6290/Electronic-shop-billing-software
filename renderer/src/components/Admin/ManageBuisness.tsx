import React, { useState, useRef, CSSProperties } from 'react';
import AdminNavbar from './AdminNavbar/AdminNavbar';

// Types
interface UpgradePlan {
  name: string;
  price: number;
  originalPrice: number;
  period: string;
  yearlyPrice: string;
  badge?: string;
  recommended?: boolean;
}

// Exact styles matching the UI
const styles = {
  pageContainer: {
    background: '#F5F7FB',
    minHeight: '100vh',
    padding: '32px',
  } as CSSProperties,

  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '20px',
  } as CSSProperties,

  formGroup: {
    marginBottom: '20px',
  } as CSSProperties,

  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '8px',
  } as CSSProperties,

  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#1F2937',
    boxSizing: 'border-box' as const,
    background: '#FFFFFF',
  } as CSSProperties,

  select: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#1F2937',
    boxSizing: 'border-box' as const,
    background: '#FFFFFF',
  } as CSSProperties,

  uploadArea: {
    border: '2px dashed #D1D5DB',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    background: '#FAFBFC',
  } as CSSProperties,

  uploadIcon: {
    width: '40px',
    height: '40px',
    margin: '0 auto 8px',
    background: '#EEF2FF',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as CSSProperties,

  uploadText: {
    fontSize: '13px',
    color: '#6B7280',
    marginBottom: '4px',
  } as CSSProperties,

  uploadLink: {
    fontSize: '13px',
    color: '#3B82F6',
    fontWeight: 500,
    cursor: 'pointer',
  } as CSSProperties,

  uploadSubtext: {
    fontSize: '12px',
    color: '#9CA3AF',
    marginTop: '4px',
  } as CSSProperties,

  imagePreview: {
    marginTop: '12px',
  } as CSSProperties,

  previewImg: {
    maxWidth: '150px',
    maxHeight: '100px',
    borderRadius: '6px',
    border: '1px solid #E5E7EB',
  } as CSSProperties,

  radioGroup: {
    display: 'flex',
    gap: '32px',
    marginTop: '8px',
  } as CSSProperties,

  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
  } as CSSProperties,

  radio: {
    width: '18px',
    height: '18px',
    accentColor: '#5B5FED',
    cursor: 'pointer',
  } as CSSProperties,

  eInvoicingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    marginBottom: '20px',
  } as CSSProperties,

  eInvoicingLabel: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
  } as CSSProperties,

  toggleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as CSSProperties,

  toggleBadge: {
    padding: '2px 10px',
    background: '#3B82F6',
    color: 'white',
    fontSize: '11px',
    fontWeight: 600,
    borderRadius: '10px',
  } as CSSProperties,

  toggle: {
    position: 'relative' as const,
    width: '44px',
    height: '24px',
    background: '#D1D5DB',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'background 0.3s',
  } as CSSProperties,

  toggleActive: {
    background: '#3B82F6',
  } as CSSProperties,

  toggleCircle: {
    position: 'absolute' as const,
    top: '2px',
    left: '2px',
    width: '20px',
    height: '20px',
    background: '#FFFFFF',
    borderRadius: '50%',
    transition: 'left 0.3s',
  } as CSSProperties,

  toggleCircleActive: {
    left: '22px',
  } as CSSProperties,

  signatureSection: {
    marginTop: '32px',
  } as CSSProperties,

  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1F2937',
    marginBottom: '12px',
  } as CSSProperties,

  signatureBox: {
    border: '2px dashed #D1D5DB',
    borderRadius: '6px',
    padding: '32px',
    textAlign: 'center' as const,
    background: '#FAFBFC',
    cursor: 'pointer',
  } as CSSProperties,

  addSignatureLink: {
    color: '#3B82F6',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  } as CSSProperties,

  businessDetailsSection: {
    marginTop: '24px',
    padding: '16px',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
  } as CSSProperties,

  businessDetailsTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1F2937',
    marginBottom: '8px',
  } as CSSProperties,

  businessDetailsSubtitle: {
    fontSize: '13px',
    color: '#6B7280',
    marginBottom: '16px',
  } as CSSProperties,

  detailRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px',
  } as CSSProperties,

  detailInput: {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '14px',
  } as CSSProperties,

  addBtn: {
    padding: '10px 24px',
    background: '#5B5FED',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  } as CSSProperties,

  companySettingsSection: {
    marginTop: '40px',
  } as CSSProperties,

  tallyCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '20px',
  } as CSSProperties,

  tallyIcon: {
    width: '40px',
    height: '40px',
    background: '#EEF2FF',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as CSSProperties,

  tallyContent: {
    flex: 1,
  } as CSSProperties,

  tallyTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1F2937',
    marginBottom: '4px',
  } as CSSProperties,

  tallyBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    background: '#3B82F6',
    color: 'white',
    fontSize: '10px',
    fontWeight: 700,
    borderRadius: '8px',
    marginLeft: '8px',
  } as CSSProperties,

  tallySubtitle: {
    fontSize: '13px',
    color: '#6B7280',
  } as CSSProperties,

  addBusinessSection: {
    marginTop: '40px',
    padding: '40px',
    background: '#FFFFFF',
    borderRadius: '8px',
    textAlign: 'center' as const,
  } as CSSProperties,

  businessIllustration: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '20px',
  } as CSSProperties,

  store: {
    textAlign: 'center' as const,
  } as CSSProperties,

  storeLabel: {
    padding: '4px 12px',
    background: '#EF4444',
    color: 'white',
    fontSize: '10px',
    fontWeight: 700,
    borderRadius: '6px 6px 0 0',
    display: 'inline-block',
  } as CSSProperties,

  storeBuilding: {
    width: '120px',
    height: '80px',
    background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
    border: '3px solid #EF4444',
    borderRadius: '0 0 8px 8px',
    borderTop: 'none',
  } as CSSProperties,

  store2Label: {
    background: '#F59E0B',
  } as CSSProperties,

  store2Building: {
    background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
    borderColor: '#F59E0B',
  } as CSSProperties,

  businessText: {
    fontSize: '14px',
    color: '#6B7280',
    marginBottom: '20px',
  } as CSSProperties,

  createBtn: {
    padding: '10px 24px',
    background: '#5B5FED',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  } as CSSProperties,

  // Modal styles
  modalOverlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  } as CSSProperties,

  modal: {
    background: '#FFFFFF',
    borderRadius: '12px',
    maxWidth: '480px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  } as CSSProperties,

  modalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #E5E7EB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as CSSProperties,

  modalTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1F2937',
    margin: 0,
  } as CSSProperties,

  closeBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as CSSProperties,

  modalBody: {
    padding: '24px',
  } as CSSProperties,

  warningIcon: {
    width: '56px',
    height: '56px',
    background: '#FEE2E2',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  } as CSSProperties,

  modalText: {
    textAlign: 'center' as const,
    fontSize: '14px',
    color: '#6B7280',
    marginBottom: '24px',
  } as CSSProperties,

  planCard: {
    border: '2px solid #E5E7EB',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '12px',
    position: 'relative' as const,
    cursor: 'pointer',
  } as CSSProperties,

  planCardRecommended: {
    border: '2px solid #5B5FED',
    background: '#F5F6FF',
  } as CSSProperties,

  recommendedBadge: {
    position: 'absolute' as const,
    top: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '3px 12px',
    background: '#5B5FED',
    color: 'white',
    fontSize: '10px',
    fontWeight: 700,
    borderRadius: '10px',
  } as CSSProperties,

  planHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  } as CSSProperties,

  planName: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#1F2937',
  } as CSSProperties,

  planPricing: {
    marginTop: '8px',
  } as CSSProperties,

  originalPrice: {
    fontSize: '14px',
    color: '#9CA3AF',
    textDecoration: 'line-through',
    marginRight: '8px',
  } as CSSProperties,

  price: {
    fontSize: '24px',
    fontWeight: 800,
    color: '#1F2937',
  } as CSSProperties,

  period: {
    fontSize: '13px',
    color: '#6B7280',
  } as CSSProperties,

  yearlyPrice: {
    fontSize: '12px',
    color: '#6B7280',
    marginTop: '4px',
  } as CSSProperties,

  upgradeBtn: {
    width: '100%',
    padding: '12px',
    background: '#5B5FED',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '16px',
  } as CSSProperties,

  viewPlansBtn: {
    width: '100%',
    padding: '12px',
    background: 'white',
    color: '#5B5FED',
    border: '1.5px solid #5B5FED',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '8px',
  } as CSSProperties,
};

const ManageBusiness: React.FC = () => {
  const [logo, setLogo] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [gstRegistered, setGstRegistered] = useState<string>('no');
  const [eInvoicingEnabled, setEInvoicingEnabled] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

  const handleGstChange = (value: string) => {
    setGstRegistered(value);
    if (value === 'yes') {
      setEInvoicingEnabled(true);
    } else {
      setEInvoicingEnabled(false);
    }
  };

  const upgradePlans: UpgradePlan[] = [
    {
      name: 'DIAMOND',
      price: 217,
      originalPrice: 301,
      period: '/ month',
      yearlyPrice: 'Pay ₹2599/ year',
      badge: '👑',
    },
    {
      name: 'PLATINUM',
      price: 250,
      originalPrice: 417,
      period: '/ month',
      yearlyPrice: 'Pay ₹2999/ year',
      recommended: true,
      badge: '👑',
    },
    {
      name: 'ENTERPRISE',
      price: 417,
      originalPrice: 718,
      period: '/ month',
      yearlyPrice: 'Pay ₹4999/ year',
      badge: '💎',
    },
  ];

  return (
    <>
      {/* Navbar Component */}
      <AdminNavbar />
      
      {/* Page Content */}
      <div style={styles.pageContainer}>
      {/* Business Name */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Business Name *</label>
        <input type="text" defaultValue="Business Name" style={styles.input} />
      </div>

      {/* Logo and Business Type */}
      <div style={styles.formRow}>
        <div>
          <label style={styles.label}>Upload Logo</label>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            style={{ display: 'none' }}
          />
          <div style={styles.uploadArea} onClick={() => logoInputRef.current?.click()}>
            <div style={styles.uploadIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B5FED" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"></path>
              </svg>
            </div>
            <div style={styles.uploadLink}>Upload Logo</div>
            <div style={styles.uploadSubtext}>PNG/JPG, max 5 MB.</div>
            {logo && (
              <div style={styles.imagePreview}>
                <img src={logo} alt="Logo" style={styles.previewImg} />
              </div>
            )}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Business Type (Select multiple, if applicable)</label>
          <select style={styles.select}>
            <option>Select</option>
          </select>

          <label style={{ ...styles.label, marginTop: '20px' }}>Industry Type</label>
          <select style={styles.select}>
            <option>Select Industry Type</option>
          </select>

          <label style={{ ...styles.label, marginTop: '20px' }}>Business Registration Type</label>
          <select style={styles.select}>
            <option>Private Limited Company</option>
          </select>
        </div>
      </div>

      {/* Company Phone and Email */}
      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Company Phone Number</label>
          <input type="tel" placeholder="Enter Phone number" style={styles.input} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Company E-Mail</label>
          <input type="email" placeholder="Enter company e-mail" style={styles.input} />
        </div>
      </div>

      {/* Billing Address */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Billing Address</label>
        <input type="text" placeholder="Enter Billing Address" style={styles.input} />
      </div>

      {/* State and Pincode */}
      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>State</label>
          <select style={styles.select}>
            <option>Enter State</option>
          </select>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Pincode</label>
          <input type="text" placeholder="Enter Pincode" style={styles.input} />
        </div>
      </div>

      {/* City */}
      <div style={styles.formGroup}>
        <label style={styles.label}>City</label>
        <input type="text" placeholder="Enter City" style={styles.input} />
      </div>

      {/* GST Registered */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Are you GST Registered?</label>
        <div style={styles.radioGroup}>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="gst"
              value="yes"
              checked={gstRegistered === 'yes'}
              onChange={(e) => handleGstChange(e.target.value)}
              style={styles.radio}
            />
            Yes
          </label>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="gst"
              value="no"
              checked={gstRegistered === 'no'}
              onChange={(e) => handleGstChange(e.target.value)}
              style={styles.radio}
            />
            No
          </label>
        </div>
      </div>

      {/* GSTIN */}
      {gstRegistered === 'yes' && (
        <div style={styles.formGroup}>
          <label style={styles.label}>GSTIN*</label>
          <input type="text" placeholder="Enter your GST Number" style={styles.input} />
        </div>
      )}

      {/* E-Invoicing */}
      <div style={styles.eInvoicingRow}>
        <span style={styles.eInvoicingLabel}>Enable e-Invoicing</span>
        <div style={styles.toggleContainer}>
          <span style={styles.toggleBadge}>New</span>
          <div
            style={{
              ...styles.toggle,
              ...(eInvoicingEnabled ? styles.toggleActive : {}),
              opacity: gstRegistered === 'yes' ? 1 : 0.5,
              cursor: gstRegistered === 'yes' ? 'pointer' : 'not-allowed',
            }}
            onClick={() => {
              if (gstRegistered === 'yes') {
                setEInvoicingEnabled(!eInvoicingEnabled);
              }
            }}
          >
            <div
              style={{
                ...styles.toggleCircle,
                ...(eInvoicingEnabled ? styles.toggleCircleActive : {}),
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* PAN Number */}
      <div style={styles.formGroup}>
        <label style={styles.label}>PAN Number</label>
        <input type="text" placeholder="Enter your PAN Number" style={styles.input} />
      </div>

      {/* Signature Section */}
      <div style={styles.signatureSection}>
        <div style={styles.sectionTitle}>
          Signature
          <p style={{ fontSize: '12px', fontWeight: 400, color: '#6B7280', marginTop: '4px' }}>
            Note: Terms & Conditions and Signature added below will be shown on your Invoices
          </p>
        </div>
        <input
          ref={signatureInputRef}
          type="file"
          accept="image/*"
          onChange={handleSignatureUpload}
          style={{ display: 'none' }}
        />
        <div style={styles.signatureBox} onClick={() => signatureInputRef.current?.click()}>
          {signature ? (
            <img src={signature} alt="Signature" style={styles.previewImg} />
          ) : (
            <span style={styles.addSignatureLink}>+ Add Signature</span>
          )}
        </div>
      </div>

      {/* Add Business Details */}
      <div style={styles.businessDetailsSection}>
        <div style={styles.businessDetailsTitle}>Add Business Details</div>
        <div style={styles.businessDetailsSubtitle}>
          Add additional business information such as MSME number, Website etc.
        </div>
        <div style={styles.detailRow}>
          <select style={styles.detailInput}>
            <option>Website</option>
          </select>
          <span style={{ padding: '10px', color: '#6B7280' }}>=</span>
          <input type="text" placeholder="www.website.com" style={styles.detailInput} />
          <button style={styles.addBtn}>Add</button>
        </div>
      </div>

      {/* Company Settings */}
      <div style={styles.companySettingsSection}>
        <div style={styles.sectionTitle}>Company Settings</div>
        
        <div style={styles.tallyCard} onClick={() => setShowUpgradeModal(true)}>
          <div style={styles.tallyIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5B5FED" strokeWidth="2">
              <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"></path>
              <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
          </div>
          <div style={styles.tallyContent}>
            <div style={styles.tallyTitle}>
              Data Export to Tally
              <span style={styles.tallyBadge}>NEW</span>
            </div>
            <div style={styles.tallySubtitle}>Transfer vouchers, items and parties to Tally</div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>

      {/* Add New Business */}
      <div style={styles.addBusinessSection}>
        <div style={styles.sectionTitle}>Add New Business</div>
        <div style={styles.businessIllustration}>
          <div style={styles.store}>
            <div style={styles.storeLabel}>STORE 1</div>
            <div style={styles.storeBuilding}></div>
          </div>
          
          <span style={{ fontSize: '24px', color: '#9CA3AF' }}>+</span>
          
          <svg width="60" height="50">
            <rect x="5" y="5" width="50" height="35" rx="3" fill="#F3F4F6" stroke="#5B5FED" strokeWidth="2"/>
            <rect x="12" y="42" width="36" height="3" rx="1.5" fill="#5B5FED"/>
          </svg>
          
          <span style={{ fontSize: '24px', color: '#9CA3AF' }}>→</span>
          
          <div style={styles.store}>
            <div style={{ ...styles.storeLabel, ...styles.store2Label }}>STORE 2</div>
            <div style={{ ...styles.storeBuilding, ...styles.store2Building }}></div>
          </div>
        </div>
        
        <p style={styles.businessText}>
          Easily Manage all your businesses in one place on myBillBook app
        </p>
        
        <button style={styles.createBtn}>Create New Business</button>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div style={styles.modalOverlay} onClick={() => setShowUpgradeModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Your Free Trial has expired</h2>
              <button style={styles.closeBtn} onClick={() => setShowUpgradeModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.warningIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>

              <p style={styles.modalText}>Upgrade plan to continue enjoying all the benefits</p>

              {upgradePlans.map((plan, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.planCard,
                    ...(plan.recommended ? styles.planCardRecommended : {}),
                  }}
                >
                  {plan.recommended && (
                    <div style={styles.recommendedBadge}>Recommended for you</div>
                  )}
                  
                  <div style={styles.planHeader}>
                    <div style={styles.planName}>
                      <span>{plan.badge}</span> {plan.name}
                    </div>
                    <input
                      type="radio"
                      name="plan"
                      defaultChecked={plan.recommended}
                      style={{ width: '18px', height: '18px', accentColor: '#5B5FED' }}
                    />
                  </div>

                  <div style={styles.planPricing}>
                    <span style={styles.originalPrice}>₹{plan.originalPrice}</span>
                    <span style={styles.price}>₹{plan.price}</span>
                    <span style={styles.period}>{plan.period}</span>
                  </div>
                  <div style={styles.yearlyPrice}>{plan.yearlyPrice}</div>
                </div>
              ))}

              <button style={styles.upgradeBtn}>Upgrade</button>
              <button style={styles.viewPlansBtn}>View Plans</button>

              <p style={{ ...styles.modalText, marginTop: '12px', fontSize: '13px' }}>
                Get up to 40% off on multi-year plans.{' '}
                <span style={{ color: '#5B5FED', cursor: 'pointer', textDecoration: 'underline' }}>
                  Talk To Sales
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default ManageBusiness;


