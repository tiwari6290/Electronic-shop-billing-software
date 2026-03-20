import React, { useState } from 'react';
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
  Handshake,
  ChevronDown,
 FilePlus,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;   // ✅ optional karo
  children?: NavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const Sidebar: React.FC = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const navSections: NavSection[] = [
    {
      title: 'GENERAL',
      items: [
        { id: 'create-party', label: 'Create Party', icon: <Users size={18} />, path: '/cashier/create-party' },
        { 
      id: 'create-item', 
      label: 'Create Item', 
      icon: <Package size={18} />,
      children: [
        { 
          id: 'inventory', 
          label: 'Inventory', 
          icon: <Package size={16} />, 
          path: '/cashier/create-item/inventory' 
        },
        { 
          id: 'godown', 
          label: 'Godown', 
          icon: <Package size={16} />, 
          path: '/cashier/create-item/godown' 
        }
      ]
    },
        { id: 'Parties', label: 'Parties', icon: <Handshake size={18} />, path: '/cashier/parties' },
        { id: 'POS-billing', label: 'POS Billing', icon: <Users size={18} />, path: '/cashier/POS-billing' },
        { id: 'reports', label: 'Reports', icon: <FileSpreadsheet size={18} />, path: '/cashier/reports' },
        { id: 'invoice builder', label: 'Invoice Builder', icon: <FilePlus size={18} />, path: '/cashier/invoice-builder' },
      ]
    },
    {
      title: 'SALES TRANSACTIONS',
      items: [
        { id: 'sales-invoice', label: 'Sales Invoices', icon: <FileEdit size={18} />, path: '/cashier/sales-invoicses-list' },
        { id: 'quotation', label: 'Quotation', icon: <FileEdit size={18} />, path: '/cashier/quotation-estimate' },
        { id: 'payment-in', label: 'Payment In', icon: <CreditCard size={18} />, path: '/cashier/payment-in-list' },
        { id: 'sales-return', label: 'Sales Return', icon: <RotateCcw size={18} />, path: '/cashier/sales-return' },
        { id: 'credit-note', label: 'Credit Note', icon: <FileSpreadsheet size={18} />, path: '/cashier/credit-note' },
        { id: 'delivery-challan', label: 'Delivery Challan', icon: <Truck size={18} />, path: '/cashier/delivery-challan' },
        { id: 'proforma-invoice', label: 'Proforma Invoice', icon: <Receipt size={18} />, path: '/cashier/proforma-invoice' },
      ]
    },
    {
      title: 'PURCHASE TRANSACTIONS',
      items: [ 
        { id: 'purchase', label: 'Purchase', icon: <ShoppingCart size={18} />, path: '/cashier/purchase' },
        { id: 'payment-out', label: 'Payment Out', icon: <ArrowLeftRight size={18} />, path: '/cashier/payment-out-list' },
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
  <div key={item.id}>
    
    <button
      onClick={() => {
        if (item.children) {
          setOpenDropdown(openDropdown === item.id ? null : item.id);
        } else if (item.path) {
          handleItemClick(item.path);
        }
      }}
      className="w-full flex items-center rounded-lg"
      style={{
        gap: '12px',
        padding: '10px',
        backgroundColor: isActive(item.path || "") ? '#3b5a8f' : 'transparent',
        color: '#b8c5d6',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        textAlign: 'left'
      }}
    >
      <span>{item.icon}</span>
      <span style={{ flex: 1 }}>{item.label}</span>

{item.children && (
  <ChevronDown
    size={16}
    style={{
      transition: 'transform 0.2s ease',
      transform: openDropdown === item.id ? 'rotate(180deg)' : 'rotate(0deg)'
    }}
  />
)}
    </button>

    {/* Sub Items */}
    {item.children && openDropdown === item.id && (
      <div style={{ marginLeft: '32px', marginTop: '4px' }}>
        {item.children.map((sub) => (
          <button
            key={sub.id}
            onClick={() => sub.path && handleItemClick(sub.path)}
            className="w-full flex items-center rounded-lg"
            style={{
              gap: '10px',
              padding: '8px',
              backgroundColor: isActive(sub.path || "") ? '#3b5a8f' : 'transparent',
              color: '#b8c5d6',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              textAlign: 'left'
            }}
          >
            <span>{sub.icon}</span>
            <span>{sub.label}</span>
          </button>
        ))}
      </div>
    )}
  </div>
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