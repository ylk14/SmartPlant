import React, { useState, useEffect, useMemo } from "react";
import UserDetailModal from "../components/UserDetailModal";
import SearchIcon from "@mui/icons-material/Search";
import PeopleIcon from "@mui/icons-material/People";

// Mock data fallback (remove when backend API ready)
const MOCK_USERS = [
  {
    user_id: 1,
    username: "flora_admin",
    email: "flora@smartplant.dev",
    role: "Admin",
    phone: "+60 12-345 6789",
    active: true,
    created_at: "2024-06-10T09:45:00Z",
  },
  {
    user_id: 2,
    username: "ranger.sam", 
    email: "sam@smartplant.dev",
    role: "Plant Researcher",
    phone: "+60 13-222 1111",
    active: false,
    created_at: "2024-08-21T14:20:00Z",
  },
  {
    user_id: 3,
    username: "data.joy",
    email: "joy@smartplant.dev",
    role: "User",
    phone: "+60 17-555 6666",
    active: true,
    created_at: "2025-01-04T11:05:00Z",
  },
];

const ROLE_OPTIONS = ["Admin", "Plant Researcher", "User"];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleMenu, setRoleMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredDropdownItem, setHoveredDropdownItem] = useState(null);

  // Load mock first, replace with API later
  useEffect(() => {
    setUsers(MOCK_USERS);
  }, []);

  // Search functionality from mobile
  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return users
      .filter((user) => {
        if (!normalizedQuery) return true;
        return (
          user.username.toLowerCase().includes(normalizedQuery) ||
          user.phone.toLowerCase().includes(normalizedQuery) ||
          String(user.user_id).includes(normalizedQuery)
        );
      })
      .sort((a, b) => a.user_id - b.user_id); // Changed to sort by user_id in ascending order
  }, [searchQuery, users]);

  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.user_id === id ? { ...u, active: !u.active } : u
      )
    );
  };

  const updateRole = (id, role) => {
    setUsers((prev) =>
      prev.map((u) => (u.user_id === id ? { ...u, role } : u))
    );
    setRoleMenu(null);
    setHoveredDropdownItem(null);
  };

  const handleUserUpdate = (updatedUser) => {
    if (!updatedUser || typeof updatedUser.user_id === 'undefined') {
      return;
    }
    setUsers((prev) =>
      prev.map((user) =>
        user.user_id === updatedUser.user_id ? { ...user, ...updatedUser } : user
      )
    );
  };

  const getDropdownItemStyle = (role) => {
    const baseStyle = {
      padding: "10px 12px",
      cursor: "pointer",
      borderBottom: "1px solid #f1f1f1",
      fontSize: "13px",
    };
    
    if (hoveredDropdownItem === role) {
      return {
        ...baseStyle,
        backgroundColor: "#F8FAFC"
      };
    }
    
    return baseStyle;
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>User Directory</h2>
      <p style={styles.pageSubtitle}>
        Manage administrator and researcher accounts. All actions sync with backend & database.
      </p>

      {/* Search Bar from mobile */}
      <div style={styles.searchBar}>
        <SearchIcon style={styles.searchIcon} />
        <input
          type="text"
          style={styles.searchInput}
          placeholder="Search by username, phone, or ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery.length > 0 && (
          <button 
            style={styles.clearButton}
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>User ID</th>
              <th style={styles.th}>Username</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" style={styles.emptyState}>
                  <div style={styles.emptyStateContent}>
                    <PeopleIcon style={styles.emptyStateIcon} />
                    <p style={styles.emptyStateText}>No users found. Try a different search.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.user_id}>
                  <td style={styles.td}>{user.user_id}</td>
                  <td style={styles.td}>
                    <span style={!user.active ? styles.usernameInactive : {}}>
                      {user.username}
                    </span>
                  </td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>{user.phone}</td>

                  {/* Role Dropdown */}
                  <td style={styles.td}>
                    <div style={styles.roleColumn}>
                      <button
                        style={styles.roleBtn}
                        onClick={() =>
                          setRoleMenu(roleMenu === user.user_id ? null : user.user_id)
                        }
                      >
                        {user.role} ▼
                      </button>

                      {roleMenu === user.user_id && (
                        <div style={styles.dropdown}>
                          {ROLE_OPTIONS.map((r) => (
                            <div
                              key={r}
                              style={getDropdownItemStyle(r)}
                              onMouseEnter={() => setHoveredDropdownItem(r)}
                              onMouseLeave={() => setHoveredDropdownItem(null)}
                              onClick={() => updateRole(user.user_id, r)}
                            >
                              {r}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Centered status text + toggle */}
                  <td style={styles.td}>
                    <div style={styles.statusContainer}>
                      <div style={styles.statusText}>
                        {user.active ? "Active" : "Inactive"}
                      </div>

                      <div
                        style={{
                          ...styles.toggle,
                          backgroundColor: user.active ? "#3AA272" : "#D0D7DD",
                        }}
                        onClick={() => toggleStatus(user.user_id)}
                      >
                        <div
                          style={{
                            ...styles.toggleCircle,
                            marginLeft: user.active ? "22px" : "2px",
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Centered View button */}
                  <td style={styles.td}>
                    <button
                      style={styles.viewBtn}
                      onClick={() => setSelectedUser(user)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Enhanced User Detail Modal */}
      {selectedUser && (
        <UserDetailModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)}
          onUserUpdate={handleUserUpdate}
        />
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: "24px",
    backgroundColor: "#F5F6F8",
    minHeight: "100vh",
  },

  pageTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1E2D3D",
    marginBottom: "8px",
  },

  pageSubtitle: {
    fontSize: "14px",
    marginBottom: "20px",
    color: "#566573",
  },

  // Search bar styles from mobile
  searchBar: {
    marginTop: "16px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    padding: "0 14px",
    height: "44px",
    borderRadius: "14px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E2E8F0",
    gap: "8px",
    maxWidth: "400px",
  },

  searchIcon: {
    fontSize: "20px",
    color: "#64748B",
  },

  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "14px",
    color: "#0F172A",
    background: "transparent",
  },

  clearButton: {
    background: "none",
    border: "none",
    fontSize: "18px",
    color: "#94A3B8",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  tableWrapper: {
    marginTop: "20px",
    overflowX: "auto",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "center", // Changed to center align table headers
    padding: "16px",
    background: "#EBEEF2",
    fontWeight: "600",
    fontSize: "14px",
    color: "#1E2D3D",
  },

  td: {
    textAlign: "center", // Changed to center align table data
    padding: "16px",
    borderBottom: "1px solid #E7EAF0",
    fontSize: "14px",
    verticalAlign: "middle",
  },

  // Username inactive style from mobile
  usernameInactive: {
    color: "#9CA3AF",
  },

  // Empty state styles from mobile
  emptyState: {
    padding: "40px 20px",
    textAlign: "center",
  },

  emptyStateContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },

  emptyStateIcon: {
    fontSize: "48px",
    color: "#94A3B8",
  },

  emptyStateText: {
    fontSize: "14px",
    color: "#64748B",
    margin: 0,
  },

  // Role button + dropdown
  roleColumn: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
  },

  roleBtn: {
    padding: "8px 12px",
    background: "#E5ECF3",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    color: "#23364B",
  },

  dropdown: {
    position: "absolute",
    top: "38px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#fff",
    border: "1px solid #E2E8F0",
    width: "160px",
    borderRadius: "8px",
    zIndex: 10,
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },

  // Status toggle
  statusContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },

  statusText: {
    fontSize: "13px",
    fontWeight: 600,
  },

  toggle: {
    width: "44px",
    height: "22px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    transition: "0.2s",
  },

  toggleCircle: {
    width: "18px",
    height: "18px",
    background: "#fff",
    borderRadius: "50%",
    transition: "0.2s",
  },

  // View button
  viewBtn: {
    padding: "8px 16px",
    background: "#1E88E5",
    color: "#fff",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "13px",
  },
};