import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  userName?: string;
  userPhone?: string;
}

const AdminSidebar: React.FC<SidebarProps> = ({ 
  userName = "mondal electronic", 
  userPhone = "9142581382" 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarStyle: React.CSSProperties = {
    width: '280px',
    height: '100vh',
    backgroundColor: '#ffffff',
    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const userSectionStyle: React.CSSProperties = {
    padding: '20px',
    borderBottom: '1px solid #e5e7eb',
  };

  const userInfoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  };

  const avatarStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#f97316',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '600',
    flexShrink: 0,
  };

  const userDetailsStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const userNameStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: '2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const userPhoneStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#6b7280',
  };

  const backButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#1e293b',
    color: '#ffffff',
    border: 'none',
    borderRadius: '24px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const menuContainerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 0',
  };

const menuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 20px',
  color: '#6b7280',
  fontSize: '14px',
  cursor: 'pointer',
  border: 'none',
  background: '#ffffff',
  width: '100%',
  textAlign: 'left',
};

  const activeMenuItemStyle: React.CSSProperties = {
    ...menuItemStyle,
    backgroundColor: '#6366f1',
    color: '#ffffff',
    borderRadius: '8px',
    margin: '0 12px',
    padding: '12px 16px',
    width: 'calc(100% - 24px)',
  };

  const iconStyle: React.CSSProperties = {
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const menuItems = [
    { path: '/admin/account', label: 'Account', icon: '👤' },
    { path: '/admin/manage-business', label: 'Manage Business', icon: '🏢' },
    { path: '/admin/invoice-settings', label: 'Invoice Settings', icon: '⚙️' },
    { path: '/admin/print-settings', label: 'Print Settings', icon: '🖨️' },
    { path: '/admin/manage-users', label: 'Manage Users', icon: '👥' },
    { path: '/admin/reminders', label: 'Reminders', icon: '🔔' },
    { path: '/admin/ca-reports', label: 'CA Reports Sharing', icon: '📊' },
    { path: '/admin/pricing', label: 'Pricing', icon: '💰' },
    { path: '/admin/refer-earn', label: 'Refer & Earn', icon: '🎁' },
    { path: '/admin/help-support', label: 'Help And Support', icon: '❓' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={sidebarStyle}>
      <div style={userSectionStyle}>
        <div style={userInfoStyle}>
          <div style={avatarStyle}>
            M
          </div>
          <div style={userDetailsStyle}>
            <div style={userNameStyle}>{userName}</div>
            <div style={userPhoneStyle}>{userPhone}</div>
          </div>
        </div>
        <button 
          style={backButtonStyle}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
          onClick={() => navigate('/admin/dashboard')}
        >
          <span style={iconStyle}>←</span>
          Back to Dashboard
        </button>
      </div>

      <div style={menuContainerStyle}>
        {menuItems.map((item) => (
          <button
            key={item.path}
            style={isActive(item.path) ? activeMenuItemStyle : menuItemStyle}
            onMouseEnter={(e) => {
            if (!isActive(item.path)) {
              e.currentTarget.style.backgroundColor = '#ffffff';
            }
          }}

          onMouseLeave={(e) => {
            if (!isActive(item.path)) {
              e.currentTarget.style.backgroundColor = '#ffffff';
            }
          }}
            onClick={() => navigate(item.path)}
          >
            <span style={iconStyle}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <button 
          style={menuItemStyle}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          onClick={() => navigate('/login')}
        >
          <span style={iconStyle}>🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;