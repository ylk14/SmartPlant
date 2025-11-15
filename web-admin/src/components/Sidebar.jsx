// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SensorsIcon from "@mui/icons-material/Sensors";
import MapIcon from "@mui/icons-material/Map";
import FlagIcon from "@mui/icons-material/Flag";
import LogoutIcon from "@mui/icons-material/Logout";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

// 1. 👈 --- Accept the 'user' prop ---
export default function Sidebar({ user, onLogout }) {
  const location = useLocation();

  // DEBUG: Check what user prop contains
  console.log("Sidebar user prop:", user);

  // 2. 👈 --- Check the user's role ---
  const isAdmin = user?.role_name === 'admin';

  const allMenuItems = [
    { path: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    // 3. 👈 --- Add an 'adminOnly' flag to this item ---
    { path: "/users", label: "User Directory", icon: <PeopleIcon />, adminOnly: true },
    { path: "/flags", label: "Flagged Plants", icon: <FlagIcon /> },
    { path: "/heatmap", label: "Heatmap", icon: <MapIcon /> },
    { path: "/iot", label: "IoT Monitoring", icon: <SensorsIcon /> },
  ];

  // 4. 👈 --- Filter the list based on the user's role ---
  const menuItems = allMenuItems.filter(item => {
    // If the item is not adminOnly, always show it
    if (!item.adminOnly) {
      return true;
    }
    // Otherwise, only show it if the user IS an admin
    return isAdmin;
  });

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Smart Plant</h2>
        <p className="sidebar-subtitle">Admin Portal</p>
      </div>

      {/* USER PROFILE SECTION - ADDED THIS */}
      <div className="sidebar-user-profile">
        <div className="user-profile-header">
          <div className="user-avatar">
            {user?.name ? user.username.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) : "U"}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.username || user?.name || "Loading..."}</div>
            <div className="user-role">
              <AdminPanelSettingsIcon className="role-icon" />
              {user?.role_name ? user.role_name.charAt(0).toUpperCase() + user.role_name.slice(1) : "User"}
            </div>
          </div>
        </div>
        <div className="user-email">{user?.email || "user@example.com"}</div>
      </div>

      <nav className="sidebar-nav">
        {/* 5. 👈 --- This now renders the filtered list --- */}
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
          <span className="sidebar-icon"><LogoutIcon /></span>
          <span className="sidebar-label">Logout</span>
        </button>
      </div>
    </div>
  );
}