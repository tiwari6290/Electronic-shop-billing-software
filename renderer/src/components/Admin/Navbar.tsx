import React, { useState, CSSProperties } from 'react';

// Inline Styles
const styles = {
  // Navbar styles
  navbar: {
    background: '#FFFFFF',
    borderBottom: '1px solid #E5E7EB',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    flexWrap: 'wrap' as const,
  } as CSSProperties,

  navbarCenter: {
    flex: 1,
    textAlign: 'left' as const,
  } as CSSProperties,

  pageTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#1A1D2E',
    margin: 0,
    marginBottom: '2px',
  } as CSSProperties,

  pageSubtitle: {
    fontSize: '13px',
    color: '#6B7280',
    fontWeight: 500,
    margin: 0,
  } as CSSProperties,

  navbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap' as const,
  } as CSSProperties,

  // Button styles
  btnBase: {
    padding: '10px 18px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap' as const,
    fontFamily: "'Manrope', sans-serif",
    transition: 'all 0.2s ease',
  } as CSSProperties,

  btnPrimary: {
    background: '#5B5FED',
    color: 'white',
    boxShadow: '0 2px 8px rgba(91, 95, 237, 0.25)',
  } as CSSProperties,

  btnSecondary: {
    background: '#F5F6FA',
    color: '#1A1D2E',
    border: '1px solid #E5E7EB',
  } as CSSProperties,

  btnWarning: {
    background: 'white',
    color: '#F59E0B',
    border: '1.5px solid #F59E0B',
  } as CSSProperties,

  btnDisabled: {
    background: '#D1D5DB',
    cursor: 'not-allowed',
    boxShadow: 'none',
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
    padding: '20px',
    backdropFilter: 'blur(4px)',
  } as CSSProperties,

  chatOverlay: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: 0,
  } as CSSProperties,

  modalContent: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  } as CSSProperties,

  modalMedium: {
    width: '100%',
    maxWidth: '480px',
  } as CSSProperties,

  modalLarge: {
    width: '100%',
    maxWidth: '750px',
  } as CSSProperties,

  modalHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #E5E7EB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#FAFBFC',
  } as CSSProperties,

  modalTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#1A1D2E',
    margin: 0,
  } as CSSProperties,

  closeBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: 'none',
    background: 'transparent',
    color: '#6B7280',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  } as CSSProperties,

  modalBody: {
    padding: '24px',
    overflowY: 'auto' as const,
    flex: 1,
  } as CSSProperties,

  modalDescription: {
    textAlign: 'center' as const,
    color: '#6B7280',
    fontSize: '14px',
    lineHeight: 1.6,
    marginBottom: '24px',
  } as CSSProperties,

  // Business Illustration
  businessIllustration: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '32px 0',
    marginBottom: '16px',
    flexWrap: 'wrap' as const,
  } as CSSProperties,

  storeIcon: {
    textAlign: 'center' as const,
  } as CSSProperties,

  storeLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: 'white',
    background: '#FF6B6B',
    padding: '4px 12px',
    borderRadius: '12px 12px 0 0',
    display: 'inline-block',
  } as CSSProperties,

  storeLabel2: {
    background: '#F59E0B',
  } as CSSProperties,

  storeBuilding: {
    width: '100px',
    height: '80px',
    background: 'linear-gradient(135deg, #FFE5E5 0%, #FFD0D0 100%)',
    borderRadius: '0 0 8px 8px',
    border: '3px solid #FF6B6B',
  } as CSSProperties,

  storeBuilding2: {
    background: 'linear-gradient(135deg, #FFF4E5 0%, #FFE8CC 100%)',
    borderColor: '#F59E0B',
  } as CSSProperties,

  iconText: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#9CA3AF',
  } as CSSProperties,

  monitorIcon: {
    width: '60px',
    height: '45px',
    background: '#F3F4F6',
    border: '3px solid #5B5FED',
    borderRadius: '6px',
    position: 'relative' as const,
  } as CSSProperties,

  // Form styles
  formGroup: {
    marginBottom: '20px',
  } as CSSProperties,

  formLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1A1D2E',
    marginBottom: '8px',
  } as CSSProperties,

  formInput: {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: "'Manrope', sans-serif",
    color: '#1A1D2E',
    transition: 'all 0.2s ease',
    background: 'white',
    boxSizing: 'border-box' as const,
  } as CSSProperties,

  // Close Year specific
  closeYearContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',
    padding: '32px',
  } as CSSProperties,

  contentTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1A1D2E',
    marginBottom: '20px',
    lineHeight: 1.4,
  } as CSSProperties,

  watchBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 24px',
    background: 'white',
    border: '2px solid #FF0000',
    borderRadius: '8px',
    color: '#FF0000',
    fontWeight: 700,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '32px',
  } as CSSProperties,

  infoBox: {
    background: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '16px',
  } as CSSProperties,

  infoBoxTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#1A1D2E',
    marginBottom: '12px',
  } as CSSProperties,

  infoBoxText: {
    fontSize: '14px',
    color: '#6B7280',
    lineHeight: 1.6,
    margin: 0,
  } as CSSProperties,

  infoBoxList: {
    fontSize: '14px',
    color: '#6B7280',
    lineHeight: 1.6,
    listStyle: 'none',
    padding: 0,
    margin: 0,
  } as CSSProperties,

  listItem: {
    paddingLeft: '20px',
    position: 'relative' as const,
    marginBottom: '10px',
  } as CSSProperties,

  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    padding: '16px',
    background: 'white',
    border: '1.5px solid #E5E7EB',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  } as CSSProperties,

  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: '#5B5FED',
  } as CSSProperties,

  // Voucher Prefix
  stepIndicator: {
    textAlign: 'center' as const,
    fontSize: '14px',
    fontWeight: 600,
    color: '#6B7280',
    marginBottom: '24px',
  } as CSSProperties,

  prefixGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  } as CSSProperties,

  prefixField: {
    position: 'relative' as const,
  } as CSSProperties,

  charLimit: {
    position: 'absolute' as const,
    bottom: '14px',
    right: '14px',
    fontSize: '11px',
    color: '#9CA3AF',
    background: 'white',
    padding: '0 4px',
  } as CSSProperties,

  // Chat Modal
  chatModal: {
    width: '420px',
    height: '600px',
    background: 'white',
    borderRadius: '12px 0 0 0',
    boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column' as const,
  } as CSSProperties,

  chatHeader: {
    padding: '20px 24px',
    background: 'linear-gradient(135deg, #5B5FED 0%, #7B7FFF 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: '12px 0 0 0',
  } as CSSProperties,

  chatTitleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as CSSProperties,

  chatAvatar: {
    width: '42px',
    height: '42px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as CSSProperties,

  chatTitle: {
    fontSize: '16px',
    fontWeight: 700,
    margin: 0,
  } as CSSProperties,

  chatBody: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto' as const,
    background: '#F9FAFB',
  } as CSSProperties,

  chatMessage: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  } as CSSProperties,

  messageAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#E0E7FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  } as CSSProperties,

  messageBubble: {
    background: 'white',
    padding: '12px 16px',
    borderRadius: '12px 12px 12px 4px',
    fontSize: '14px',
    lineHeight: 1.5,
    color: '#1A1D2E',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    border: '1px solid #E5E7EB',
  } as CSSProperties,

  messageTime: {
    fontSize: '11px',
    color: '#9CA3AF',
    marginTop: '6px',
  } as CSSProperties,

  chatActions: {
    marginTop: '20px',
    padding: '16px',
    background: 'white',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
  } as CSSProperties,

  chatActionsTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#1A1D2E',
    marginBottom: '12px',
  } as CSSProperties,

  actionButtons: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  } as CSSProperties,

  actionBtn: {
    padding: '12px 16px',
    background: '#F5F6FA',
    border: '1.5px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1A1D2E',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left' as const,
    fontFamily: "'Manrope', sans-serif",
  } as CSSProperties,

  chatFooter: {
    padding: '16px 24px',
    background: 'white',
    borderTop: '1px solid #E5E7EB',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  } as CSSProperties,

  chatInput: {
    flex: 1,
    padding: '12px 16px',
    border: '1.5px solid #E5E7EB',
    borderRadius: '20px',
    fontSize: '14px',
    fontFamily: "'Manrope', sans-serif",
    color: '#1A1D2E',
    transition: 'all 0.2s ease',
  } as CSSProperties,

  sendBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#5B5FED',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  } as CSSProperties,

  modalFooter: {
    padding: '16px 20px',
    borderTop: '1px solid #E5E7EB',
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    background: '#FAFBFC',
  } as CSSProperties,
};

// X Icon Component
const XIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Main Navbar Component
const AdminNavbar: React.FC = () => {
  const [showCreateBusiness, setShowCreateBusiness] = useState(false);
  const [showCloseYear, setShowCloseYear] = useState(false);
  const [showVoucherPrefix, setShowVoucherPrefix] = useState(false);
  const [showChatSupport, setShowChatSupport] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        * {
          box-sizing: border-box;
        }
        
        @media (max-width: 768px) {
          .navbar-responsive {
            padding: 12px 16px !important;
          }
          .close-year-responsive,
          .prefix-grid-responsive {
            grid-template-columns: 1fr !important;
          }
          .chat-modal-responsive {
            width: 100% !important;
            height: 100% !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      <nav style={{ ...styles.navbar }} className="navbar-responsive">
        <div style={styles.navbarCenter}>
          <h1 style={styles.pageTitle}>Business Settings</h1>
          <p style={styles.pageSubtitle}>Edit Your Company Settings And Information</p>
        </div>

        <div style={styles.navbarRight}>
          <button 
            style={{ ...styles.btnBase, ...styles.btnPrimary }}
            onClick={() => setShowCreateBusiness(true)}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#4A4DD9';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#5B5FED';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Create new business
          </button>
          <button 
            style={{ ...styles.btnBase, ...styles.btnSecondary }}
            onClick={() => setShowChatSupport(true)}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#EBEDF3';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#F5F6FA';
            }}
          >
            Chat Support
          </button>
          <button 
            style={{ ...styles.btnBase, ...styles.btnWarning }}
            onClick={() => setShowCloseYear(true)}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#FEF3E2';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white';
            }}
          >
            Close Financial Year
          </button>
          <button 
            style={{ ...styles.btnBase, ...styles.btnPrimary }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#4A4DD9';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#5B5FED';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Save Changes
          </button>
        </div>
      </nav>

      {/* Create Business Modal */}
      {showCreateBusiness && (
        <CreateBusinessModal onClose={() => setShowCreateBusiness(false)} />
      )}

      {/* Close Financial Year Modal */}
      {showCloseYear && (
        <CloseFinancialYearModal 
          onClose={() => setShowCloseYear(false)}
          onContinue={() => {
            setShowCloseYear(false);
            setShowVoucherPrefix(true);
          }}
        />
      )}

      {/* Voucher Prefix Modal */}
      {showVoucherPrefix && (
        <VoucherPrefixModal onClose={() => setShowVoucherPrefix(false)} />
      )}

      {/* Chat Support Modal */}
      {showChatSupport && (
        <ChatSupportModal onClose={() => setShowChatSupport(false)} />
      )}
    </>
  );
};

// Create Business Modal
const CreateBusinessModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={{ ...styles.modalContent, ...styles.modalMedium }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Create Business</h2>
          <button 
            style={styles.closeBtn} 
            onClick={onClose}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#F5F6FA';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <XIcon />
          </button>
        </div>

        <div style={styles.modalBody}>
          <div style={styles.businessIllustration}>
            <div style={styles.storeIcon}>
              <div style={styles.storeLabel}>STORE 1</div>
              <div style={styles.storeBuilding}></div>
            </div>
            <div style={styles.iconText}>+</div>
            <div style={styles.monitorIcon}></div>
            <div style={styles.iconText}>→</div>
            <div style={styles.storeIcon}>
              <div style={{ ...styles.storeLabel, ...styles.storeLabel2 }}>STORE 2</div>
              <div style={{ ...styles.storeBuilding, ...styles.storeBuilding2 }}></div>
            </div>
          </div>

          <p style={styles.modalDescription}>
            Have more than 1 business?<br />
            Easily manage all your businesses on myBillBook
          </p>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Business Name *</label>
            <input 
              type="text" 
              placeholder="Enter business name" 
              style={styles.formInput}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#5B5FED';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(91, 95, 237, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Business Type</label>
            <select 
              style={styles.formInput}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#5B5FED';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(91, 95, 237, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <option>Select</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Industry Type</label>
            <input 
              type="text" 
              placeholder="Type to search" 
              style={styles.formInput}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#5B5FED';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(91, 95, 237, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Incorporation Type *</label>
            <input 
              type="text" 
              placeholder="Type to search" 
              style={styles.formInput}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#5B5FED';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(91, 95, 237, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button 
            style={{ ...styles.btnBase, ...styles.btnSecondary }} 
            onClick={onClose}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#EBEDF3';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#F5F6FA';
            }}
          >
            Cancel
          </button>
          <button 
            style={{ ...styles.btnBase, ...styles.btnPrimary }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#4A4DD9';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#5B5FED';
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// Close Financial Year Modal
const CloseFinancialYearModal: React.FC<{ 
  onClose: () => void;
  onContinue: () => void;
}> = ({ onClose, onContinue }) => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={{ ...styles.modalContent, ...styles.modalLarge }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Close accounts for fiscal year 2024-2025</h2>
          <button 
            style={styles.closeBtn} 
            onClick={onClose}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#F5F6FA';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <XIcon />
          </button>
        </div>

        <div style={styles.modalBody}>
          <div style={styles.closeYearContent} className="close-year-responsive">
            <div>
              <h3 style={styles.contentTitle}>How to close 2024-2025 accounting books on myBillBook</h3>
              
              <button 
                style={styles.watchBtn}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#FFF5F5';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="red">
                  <path d="M10 8v8l6-4-6-4z"></path>
                  <circle cx="12" cy="12" r="10" fill="none" stroke="red" strokeWidth="2"></circle>
                </svg>
                Watch Now
              </button>
            </div>

            <div>
              <div style={styles.infoBox}>
                <h4 style={styles.infoBoxTitle}>What is closing accounting books?</h4>
                <p style={styles.infoBoxText}>
                  Closing your books is an accounting process wherein you close your current 
                  accounting data for fiscal year <strong>1 April 2024 - 31 March 2025</strong> and 
                  start the new fiscal year <strong>1 April 2025 - 31 March 2026</strong> afresh.
                </p>
              </div>

              <div style={styles.infoBox}>
                <h4 style={styles.infoBoxTitle}>How will your myBillBook data be affected?</h4>
                <ul style={styles.infoBoxList}>
                  <li style={styles.listItem}>
                    <span style={{ position: 'absolute', left: '6px', color: '#5B5FED', fontWeight: 'bold' }}>•</span>
                    All sales invoices, purchase invoices, quotations, etc that you make from 
                    today will have new prefixes in the format - <strong>GS/26-27/1</strong>. You can change 
                    these prefixes as you need in the next step.
                  </li>
                  <li style={styles.listItem}>
                    <span style={{ position: 'absolute', left: '6px', color: '#5B5FED', fontWeight: 'bold' }}>•</span>
                    All your existing data will not be changed and stored as it is.
                  </li>
                  <li style={styles.listItem}>
                    <span style={{ position: 'absolute', left: '6px', color: '#5B5FED', fontWeight: 'bold' }}>•</span>
                    To view your old transactions, you can change the date filter to Previous 
                    Fiscal Year.
                  </li>
                </ul>
              </div>

              <label 
                style={styles.checkboxContainer}
                onMouseOver={(e) => {
                  if (!isChecked) {
                    e.currentTarget.style.borderColor = '#5B5FED';
                    e.currentTarget.style.background = '#FAFBFF';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isChecked) {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.background = 'white';
                  }
                }}
              >
                <input 
                  type="checkbox" 
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  style={styles.checkbox}
                />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>I have read and understood all the instructions</span>
              </label>
            </div>
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button 
            style={{ 
              ...styles.btnBase, 
              ...styles.btnPrimary, 
              padding: '10px 24px',
              ...(isChecked ? {} : styles.btnDisabled)
            }}
            disabled={!isChecked}
            onClick={onContinue}
            onMouseOver={(e) => {
              if (isChecked) {
                e.currentTarget.style.background = '#4A4DD9';
              }
            }}
            onMouseOut={(e) => {
              if (isChecked) {
                e.currentTarget.style.background = '#5B5FED';
              }
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// Voucher Prefix Modal
const VoucherPrefixModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={{ ...styles.modalContent, ...styles.modalMedium }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Set new prefixes for vouchers</h2>
          <button 
            style={styles.closeBtn} 
            onClick={onClose}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#F5F6FA';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <XIcon />
          </button>
        </div>

        <div style={styles.modalBody}>
          <p style={styles.modalDescription}>
            You can set your own sales voucher prefixes or continue with our suggested prefixes, same for next step.
          </p>

          <div style={styles.stepIndicator}>Sales Vouchers - Step (1/2)</div>

          <div style={styles.prefixGrid} className="prefix-grid-responsive">
            <div style={styles.prefixField}>
              <label style={styles.formLabel}>Sales Invoice Prefix</label>
              <input type="text" defaultValue="ME/SL/26-27/" style={styles.formInput} readOnly />
              <span style={styles.charLimit}>12 / 12</span>
            </div>

            <div style={styles.prefixField}>
              <label style={styles.formLabel}>Starting Serial No.</label>
              <input type="number" defaultValue="1" style={styles.formInput} />
            </div>

            <div style={styles.prefixField}>
              <label style={styles.formLabel}>Payment In prefix</label>
              <input type="text" defaultValue="ME/PI/26-27/" style={styles.formInput} readOnly />
              <span style={styles.charLimit}>12 / 12</span>
            </div>

            <div style={styles.prefixField}>
              <label style={styles.formLabel}>Sales Return prefix</label>
              <input type="text" defaultValue="ME/SR/26-27/" style={styles.formInput} readOnly />
              <span style={styles.charLimit}>12 / 12</span>
            </div>

            <div style={styles.prefixField}>
              <label style={styles.formLabel}>Credit Note prefix</label>
              <input type="text" defaultValue="ME/CN/26-27/" style={styles.formInput} readOnly />
              <span style={styles.charLimit}>12 / 12</span>
            </div>

            <div style={styles.prefixField}>
              <label style={styles.formLabel}>Quotation/Estimate prefix</label>
              <input type="text" defaultValue="ME/QO/26-27/" style={styles.formInput} readOnly />
              <span style={styles.charLimit}>12 / 12</span>
            </div>
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button 
            style={{ ...styles.btnBase, ...styles.btnSecondary }} 
            onClick={onClose}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#EBEDF3';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#F5F6FA';
            }}
          >
            Cancel
          </button>
          <button 
            style={{ ...styles.btnBase, ...styles.btnPrimary }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#4A4DD9';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#5B5FED';
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// Chat Support Modal
const ChatSupportModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div style={{ ...styles.modalOverlay, ...styles.chatOverlay }} onClick={onClose}>
      <div style={styles.chatModal} className="chat-modal-responsive" onClick={(e) => e.stopPropagation()}>
        <div style={styles.chatHeader}>
          <div style={styles.chatTitleSection}>
            <div style={styles.chatAvatar}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h3 style={styles.chatTitle}>myBillBook Support</h3>
          </div>
          <button 
            style={{ ...styles.closeBtn, color: 'white', background: 'rgba(255, 255, 255, 0.1)' }} 
            onClick={onClose}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <XIcon />
          </button>
        </div>

        <div style={styles.chatBody}>
          <div style={styles.chatMessage}>
            <div style={styles.messageAvatar}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#5B5FED">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <div style={styles.messageBubble}>
                Hi, welcome to myBillBook Support!
                <div style={styles.messageTime}>10:58 am, Feb 17</div>
              </div>
            </div>
          </div>

          <div style={styles.chatMessage}>
            <div style={styles.messageAvatar}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#5B5FED">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <div style={styles.messageBubble}>
                How would you like us to help you today?
              </div>
            </div>
          </div>

          <div style={styles.chatActions}>
            <h4 style={styles.chatActionsTitle}>Options</h4>
            <div style={styles.actionButtons}>
              <button 
                style={styles.actionBtn}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#5B5FED';
                  e.currentTarget.style.color = '#5B5FED';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#F5F6FA';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.color = '#1A1D2E';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                Chat with an agent
              </button>
              <button 
                style={styles.actionBtn}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#5B5FED';
                  e.currentTarget.style.color = '#5B5FED';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#F5F6FA';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.color = '#1A1D2E';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                Need help over a call
              </button>
            </div>
            <div style={styles.messageTime}>10:58 am, Feb 17</div>
          </div>
        </div>

        <div style={styles.chatFooter}>
          <input 
            type="text" 
            placeholder="Type here" 
            style={styles.chatInput}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#5B5FED';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
            }}
          />
          <button 
            style={styles.sendBtn}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#4A4DD9';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#5B5FED';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;