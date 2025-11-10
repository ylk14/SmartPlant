// src/components/Topbar.jsx
import React from "react";
import "./Topbar.css";

export default function Topbar({ onLogout }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">Admin Dashboard</h1>
      </div>
      
      <div className="topbar-right">
        <div className="topbar-user">
          <span className="user-avatar">👤</span>
          <span className="user-name">Administrator</span>
        </div>
        
        <button 
          className="topbar-logout-btn"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}