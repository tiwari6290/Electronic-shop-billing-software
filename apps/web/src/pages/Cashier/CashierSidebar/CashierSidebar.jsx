import "./CashierSidebar.css";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  Users,
  Package,
  FileText,
  CreditCard,
  RotateCcw,
  Truck,
  ShoppingCart,
  ShoppingBag,
  ArrowUpRight,
  CornerDownLeft,
  FileMinus,
  ClipboardList,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function CashierSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`cashier-sidebar ${collapsed ? "collapsed" : ""}`}>

      {/* BRAND */}
      <div className="cashier-brand">
        <div className="cashier-logo">⚡</div>

        {!collapsed && (
          <div>
            <h2>ElectroShop</h2>
            <p>Cashier Panel</p>
          </div>
        )}

        {/* TOGGLE */}
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* MENU */}
      <nav className="cashier-menu">

        <p className="menu-title">GENERAL</p>
        <NavLink to="/cashier/create-party" className="menu-item">
          <Users size={18} />
          {!collapsed && <span>Create Party</span>}
        </NavLink>

        <NavLink to="/cashier/create-item" className="menu-item">
          <Package size={18} />
          {!collapsed && <span>Create Item</span>}
        </NavLink>

        <p className="menu-title">SALES TRANSACTIONS</p>
        <NavLink to="/cashier/quotation" className="menu-item">
          <FileText size={18} />
          {!collapsed && <span>Quotation</span>}
        </NavLink>

        <NavLink to="/cashier/payment-in" className="menu-item">
          <CreditCard size={18} />
          {!collapsed && <span>Payment In</span>}
        </NavLink>

        <NavLink to="/cashier/sales-return" className="menu-item">
          <RotateCcw size={18} />
          {!collapsed && <span>Sales Return</span>}
        </NavLink>

        <NavLink to="/cashier/credit-note" className="menu-item">
          <FileText size={18} />
          {!collapsed && <span>Credit Note</span>}
        </NavLink>

        <NavLink to="/cashier/delivery-challan" className="menu-item">
          <Truck size={18} />
          {!collapsed && <span>Delivery Challan</span>}
        </NavLink>

        <NavLink to="/cashier/proforma-invoice" className="menu-item">
          <ShoppingCart size={18} />
          {!collapsed && <span>Proforma Invoice</span>}
        </NavLink>

        <p className="menu-title">PURCHASE TRANSACTIONS</p>
        <NavLink to="/cashier/purchase" className="menu-item">
          <ShoppingBag size={18} />
          {!collapsed && <span>Purchase</span>}
        </NavLink>

        <NavLink to="/cashier/payment-out" className="menu-item">
          <ArrowUpRight size={18} />
          {!collapsed && <span>Payment Out</span>}
        </NavLink>

        <NavLink to="/cashier/purchase-return" className="menu-item">
          <CornerDownLeft size={18} />
          {!collapsed && <span>Purchase Return</span>}
        </NavLink>

        <NavLink to="/cashier/debit-note" className="menu-item">
          <FileMinus size={18} />
          {!collapsed && <span>Debit Note</span>}
        </NavLink>

        <NavLink to="/cashier/purchase-orders" className="menu-item">
          <ClipboardList size={18} />
          {!collapsed && <span>Purchase Orders</span>}
        </NavLink>

      </nav>

      {/* USER */}
      <div className="cashier-user">
        <div className="avatar">RJ</div>
        {!collapsed && (
          <div>
            <h4>Rohan</h4>
            <p>Main Counter</p>
          </div>
        )}
      </div>

      {/* LOGOUT */}
      <button className="logout-btn">
        <LogOut size={18} />
        {!collapsed && "Logout"}
      </button>

    </aside>
  );
}
