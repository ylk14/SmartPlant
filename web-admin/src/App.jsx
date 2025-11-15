import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Flags from "./pages/Flags";
import Heatmap from "./pages/Heatmap";
import IoT from "./pages/IoT";
import IotAnalytics from "./pages/IotAnalytics";
import Login from "./pages/Login";

// A helper component for our new role check
const AdminRoute = ({ user, onLogout, children }) => {
  if (user && user.role_name === 'admin') {
    return <AdminLayout user={user} onLogout={onLogout}>{children}</AdminLayout>;
  }
  // If not admin, redirect them
  return <Navigate to="/dashboard" replace />;
};

// A helper component for all authenticated users
const ProtectedRoute = ({ user, onLogout, children }) => {
  if (user) {
    return <AdminLayout user={user} onLogout={onLogout}>{children}</AdminLayout>;
  }
  return <Navigate to="/login" replace />;
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const userString = localStorage.getItem('adminUser');
      
      if (userString) {
        setCurrentUser(JSON.parse(userString));
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const isAuthenticated = !!currentUser;

  const handleLogin = (userData) => {
  console.log("Login userData:", userData);

  // ENSURE USER HAS REQUIRED PROPERTIES
  const userWithName = {
    ...userData,
    name: userData.name || userData.username || "Admin User", // Add name if missing
    role_name: userData.role_name || userData.role || "admin" // Ensure role_name exists
  };

  console.log("🔍 [App.jsx] Final user data:", userWithName);

  setCurrentUser(userWithName);
  localStorage.setItem('adminUser', JSON.stringify(userWithName));
  localStorage.setItem('adminToken', 'mock-token-here');
};

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px',
        color: '#6B7280'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Login onLogin={handleLogin} />
          } 
        />
        
        {/* --- ⬇️ *** THIS IS THE FIX *** ⬇️ ---
          We use a new 'AdminRoute' component for the /users path.
          Only users with role_name 'admin' can access this.
        */}
        <Route 
          path="/users" 
          element={
            <AdminRoute user={currentUser} onLogout={handleLogout}>
              <Users />
            </AdminRoute>
          } 
        />
        
        {/* --- All other routes are normal ProtectedRoutes --- */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute user={currentUser} onLogout={handleLogout}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/flags" 
          element={
            <ProtectedRoute user={currentUser} onLogout={handleLogout}>
              <Flags />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/heatmap" 
          element={
            <ProtectedRoute user={currentUser} onLogout={handleLogout}>
              <Heatmap />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/iot" 
          element={
            <ProtectedRoute user={currentUser} onLogout={handleLogout}>
              <IoT />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/iot-analytics" 
          element={
            <ProtectedRoute user={currentUser} onLogout={handleLogout}>
              <IotAnalytics />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirects */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="*" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </Router>
  );
}