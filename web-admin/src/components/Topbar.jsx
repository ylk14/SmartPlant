// src/components/Topbar.jsx
import React from "react";
import "./Topbar.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

// A simple helper function to capitalize the first letter
const capitalize = (s) => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// 1. Accept the 'user' object as a prop
export default function Topbar({ user, onLogout }) {
  
  // 2. Get the role_name from the user object (e.g., "admin" or "researcher")
  //    and provide a fallback.
  const roleName = user?.role_name || 'User';

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">Admin Dashboard</h1>
      </div>
      
      <div className="topbar-right">
        <div className="topbar-user">
          <span className="user-avatar"><AccountCircleIcon /></span>
          
          {/* 3. Display the capitalized role name */}
          <span className="user-name">{capitalize(roleName)}</span>
        
        </div>

      </div>
    </div>
  );
}