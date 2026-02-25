import { useNavigate, useLocation } from 'react-router-dom';
import { 
  
  Users, 
  Package, 
  FileEdit, 
  CreditCard, 
  RotateCcw, 
  FileSpreadsheet, 
  Truck, 
  Receipt, 
  ShoppingCart, 
  ArrowLeftRight, 
  CornerUpLeft, 
  StickyNote, 
  ShoppingBag, 
  DollarSign,
  LogOut,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navSections: NavSection[] = [
    {
      title: 'GENERAL',
      items: [
        { id: 'create-party', label: 'Create Party', icon: <Users size={18} />, path: '/cashier/create-party' },
        { id: 'create-item', label: 'Create Item', icon: <Package size={18} />, path: '/cashier/create-item' },
        { id: 'POS-Billing', label: 'POS Billing', icon: <Package size={18} />, path: '/cashier/POS-Billing' },
      ]
    },
    {
      title: 'SALES TRANSACTIONS',
      items: [
        { id: 'quotation', label: 'Quotation', icon: <FileEdit size={18} />, path: '/cashier/quotation' },
        { id: 'payment-in', label: 'Payment In', icon: <CreditCard size={18} />, path: '/cashier/payment-in' },
        { id: 'sales-return', label: 'Sales Return', icon: <RotateCcw size={18} />, path: '/cashier/sales-return' },
        { id: 'sales-invoice', label: 'Sales Invoice', icon: <FileEdit size={18} />, path: '/cashier/sales-invoice' },
        { id: 'credit-note', label: 'Credit Note', icon: <FileSpreadsheet size={18} />, path: '/cashier/credit-note' },
        { id: 'delivery-challan', label: 'Delivery Challan', icon: <Truck size={18} />, path: '/cashier/delivery-challan' },
        { id: 'proforma-invoice', label: 'Proforma Invoice', icon: <Receipt size={18} />, path: '/cashier/proforma-invoice' },
      ]
    },
    {
      title: 'PURCHASE TRANSACTIONS',
      items: [
        { id: 'purchase', label: 'Purchase', icon: <ShoppingCart size={18} />, path: '/cashier/purchase' },
        { id: 'payment-out', label: 'Payment Out', icon: <ArrowLeftRight size={18} />, path: '/cashier/payment-out' },
        { id: 'purchase-return', label: 'Purchase Return', icon: <CornerUpLeft size={18} />, path: '/cashier/purchase-return' },
        { id: 'debit-note', label: 'Debit Note', icon: <StickyNote size={18} />, path: '/cashier/debit-note' },
        { id: 'purchase-orders', label: 'Purchase Orders', icon: <ShoppingBag size={18} />, path: '/cashier/purchase-orders' },
        { id: 'create-expense', label: 'Create Expense', icon: <DollarSign size={18} />, path: '/cashier/create-expense' },
        { id: 'logout', label: 'Logout', icon: <LogOut size={18} />, path: 'logout' },
      ]
    }
  ];

 const handleItemClick = (path: string) => {
  if (path === "logout") {
    handleLogout();
  } else {
    navigate(path);
  }
};


const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("branch");

  navigate("/login", { replace: true });
};

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div 
      className="flex flex-col h-screen w-64 text-white"
      style={{
        background: 'linear-gradient(180deg, #1e3a5f 0%, #0d1b2a 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}
    >
      

      

      {/* Navigation Sections */}
      <div 
        className="flex-1" 
        style={{ 
          overflowY: 'auto',
          paddingLeft: '16px',
          paddingRight: '16px',
          paddingBottom: '16px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        
      >
        <style>
          {`
            .sidebar-nav::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        <div className="sidebar-nav">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} style={{ marginBottom: '24px' }}>
              <h3 
                style={{ 
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#64748b',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  paddingLeft: '12px',
                  marginBottom: '8px'
                }}
              >
                {section.title}
              </h3>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.path)}
                    className="w-full flex items-center rounded-lg"
                    style={{
                      gap: '12px',
                      padding: '10px',
                      backgroundColor: isActive(item.path) ? '#3b5a8f' : 'transparent',
                      color: isActive(item.path) ? '#ffffff' : '#b8c5d6',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '14px',
                      fontWeight: '500',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive(item.path)) {
                        e.currentTarget.style.backgroundColor = 'rgba(59, 90, 143, 0.4)';
                        e.currentTarget.style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive(item.path)) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#b8c5d6';
                      }
                    }}
                  >
                    <span style={{ 
                      color: isActive(item.path) ? '#a5b4fc' : '#8796a8',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
            
          ))}
        </div>
      </div>

      {/* Footer */}
      <div 
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '16px'
        }}
      >
        
        <div 
          className="flex items-center" 
          style={{ 
            gap: '8px', 
            color: '#8796a8',
            fontSize: '11px'
          }}
        >
          <span className="flex items-center">
            <div 
              style={{ 
                backgroundColor: '#22c55e', 
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                marginRight: '6px' 
              }}
            ></div>
            100% Secure
          </span>
          <span>•</span>
          <span className="flex items-center">
            <div 
              style={{ 
                backgroundColor: '#3b82f6',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                marginRight: '6px'
              }}
            ></div>
            ISO Certified
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;