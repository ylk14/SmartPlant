import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Flags from "./pages/Flags";
import Heatmap from "./pages/Heatmap";
import IoT from "./pages/IoT";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/users" element={<AdminLayout><Users /></AdminLayout>} />
        <Route path="/flags" element={<AdminLayout><Flags /></AdminLayout>} />
        <Route path="/heatmap" element={<AdminLayout><Heatmap /></AdminLayout>} />
        <Route path="/iot" element={<AdminLayout><IoT /></AdminLayout>} />
        <Route path="/analytics" element={<AdminLayout><Analytics /></AdminLayout>} />
      </Routes>
    </Router>
  );
}
