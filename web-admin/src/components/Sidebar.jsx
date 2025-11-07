import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import FlagIcon from "@mui/icons-material/Flag";
import MapIcon from "@mui/icons-material/Map";
import SensorsIcon from "@mui/icons-material/Sensors";
import InsightsIcon from "@mui/icons-material/Insights";

export default function Sidebar() {
  const location = useLocation();

  const menu = [
    { label: "Dashboard", path: "/", icon: <DashboardIcon /> },
    { label: "Users", path: "/users", icon: <PeopleIcon /> },
    { label: "Flagged Plants", path: "/flags", icon: <FlagIcon /> },
    { label: "Heatmap", path: "/heatmap", icon: <MapIcon /> },
    { label: "IoT Monitoring", path: "/iot", icon: <SensorsIcon /> },
    { label: "Analytics", path: "/analytics", icon: <InsightsIcon /> },
  ];

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">SmartPlant Admin</h2>

      <div className="sidebar-menu">
        {menu.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${active ? "active" : ""}`}
            >
              <span className="icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

