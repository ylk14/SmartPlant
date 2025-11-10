// src/layouts/AdminLayout.jsx
import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./AdminLayout.css";

export default function AdminLayout({ children, onLogout }) {
  return (
    <div className="admin-layout">
      {/* LEFT SIDEBAR */}
      <Sidebar onLogout={onLogout} />

      {/* RIGHT CONTENT AREA */}
      <div className="admin-main">
        <Topbar onLogout={onLogout} />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}

