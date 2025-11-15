// src/layouts/AdminLayout.jsx
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import AdminAgentChat from '../components/AdminAgentChat';
import "./AdminLayout.css";

export default function AdminLayout({ children, user, onLogout }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className={`admin-layout ${isSidebarCollapsed ? "sidebar-hidden" : ""}`}>
      <div className={`sidebar-shell ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <Sidebar user={user} onLogout={onLogout} />
      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="admin-main">
        <Topbar
          user={user}
          onLogout={onLogout}
          onToggleSidebar={handleToggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <AdminAgentChat />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}