// src/layouts/AdminLayout.jsx
import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import AdminAgentChat from '../components/AdminAgentChat';
import "./AdminLayout.css";

export default function AdminLayout({ children, user, onLogout }) {
  return (
    <div className="admin-layout">
      {/* LEFT SIDEBAR */}
      {/* ⬇️ *** THIS IS THE FIX *** ⬇️
        Pass the 'user' prop to the Sidebar.
      */}
      <Sidebar user={user} onLogout={onLogout} />

      {/* RIGHT CONTENT AREA */}
      <div className="admin-main">
        <Topbar onLogout={onLogout} />
        <AdminAgentChat />
        <Topbar user={user} onLogout={onLogout} />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}