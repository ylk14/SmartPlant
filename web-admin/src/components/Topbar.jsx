import React from "react";
import "./Topbar.css";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function Topbar() {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <h3>Admin Dashboard</h3>
      </div>

      <div className="topbar-right">
        <NotificationsNoneIcon className="topbar-icon" />
        <AccountCircleIcon className="topbar-icon" />
      </div>
    </div>
  );
}
