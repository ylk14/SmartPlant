// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({ onLogout }) {
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/iot", label: "IoT Monitoring", icon: "📡" },
    { path: "/heatmap", label: "Species Heatmap", icon: "🗺️" },
    { path: "/flags", label: "Flagged Plants", icon: "🚩" },
    { path: "/users", label: "User Directory", icon: "👥" },
    { path: "/analytics", label: "Analytics", icon: "📈" },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Smart Plant</h2>
        <p className="sidebar-subtitle">Admin Portal</p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${
              location.pathname === item.path ? "sidebar-item-active" : ""
            }`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout Button at Bottom */}
      <div className="sidebar-footer">
        <button 
          className="sidebar-logout-btn"
          onClick={onLogout}
        >
          <span className="sidebar-icon">🚪</span>
          <span className="sidebar-label">Logout</span>
        </button>
      </div>
    </div>
  );
}