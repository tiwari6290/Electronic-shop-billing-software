import React from "react";
import "./AdminSidebar.css";
import { Settings, Users, ShoppingCart, MessageSquare, Calendar,BarChart3 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface AdminSidebarProps {
  userName?: string;
  userPhone?: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  userName = "mondal electronic",
  userPhone = "9142581382",
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const avatarLetter = userName?.charAt(0).toUpperCase() || "A";

  const menuItems = [
    {
      label: "Staff Attendance & Payroll",
      icon: <Calendar size={18} />,
      path: "/admin/staff-attendence",
    },
    {
      label: "Manage Users",
      icon: <Users size={18} />,
      path: "/admin/settings/manage-users", // opens settings layout
    },
    {
      label: "Online Orders",
      icon: <ShoppingCart size={18} />,
      path: "/admin/online-orders",
    },
    {
      label: "SMS Marketing",
      icon: <MessageSquare size={18} />,
      path: "/admin/sms-marketing",
    },
  ];

  // Highlight active menu
  const isActive = (path: string) =>
    location.pathname.startsWith(path);

  return (
  <div className="sidebar">
    {/* Profile Section */}
    <div className="profile-section">
      <div className="profile-left">
        <div className="avatar">{avatarLetter}</div>
        <div className="profile-info">
          <h4>{userName}</h4>
          <p>{userPhone}</p>
        </div>
      </div>

      <Settings
        size={18}
        className="settings-icon"
        onClick={() => navigate("/admin/settings")}
      />
    </div>

    {/* ================= GENERAL SECTION ================= */}
    <div className="section-title">GENERAL</div>

    <div
  className={`menu-item ${
    location.pathname.startsWith("/admin/reports") ? "active" : ""
  }`}
  onClick={() => navigate("/admin/reports")}
>
  <BarChart3 size={18} />   {/* optional better icon */}
  <span>Reports</span>
</div>

    {/* ================= BUSINESS TOOLS ================= */}
    <div className="section-title">BUSINESS TOOLS</div>

    <div className="menu">
      {menuItems.map((item) => (
        <div
          key={item.path}
          className={`menu-item ${isActive(item.path) ? "active" : ""}`}
          onClick={() => navigate(item.path)}
        >
          {item.icon}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  </div>
);
};

export default AdminSidebar;