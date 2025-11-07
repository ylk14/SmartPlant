import React, { useState, useEffect } from "react";

// ✅ Mock data fallback (remove when backend API ready)
const MOCK_USERS = [
  {
    user_id: 1,
    username: "flora_admin",
    role: "Admin",
    email: "flora@smartplant.dev",
    phone: "+60 12-345 6789",
    active: true,
    created_at: "2024-06-10T09:45:00Z",
  },
  {
    user_id: 2,
    username: "ranger.sam",
    role: "Plant Researcher",
    email: "sam@smartplant.dev",
    phone: "+60 13-222 1111",
    active: false,
    created_at: "2024-08-21T14:20:00Z",
  },
  {
    user_id: 3,
    username: "data.joy",
    role: "User",
    email: "joy@smartplant.dev",
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

  // ✅ Load mock first, replace with API later
  useEffect(() => {
    setUsers(MOCK_USERS);
  }, []);

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
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>User Directory</h2>
      <p style={styles.pageSubtitle}>
        Manage administrator and researcher accounts. All actions sync with backend & database.
      </p>

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
            {users.map((user) => (
              <tr key={user.user_id}>
                <td style={styles.td}>{user.user_id}</td>
                <td style={styles.td}>{user.username}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>{user.phone}</td>

                {/* ✅ Role Dropdown */}
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
                            style={styles.dropdownItem}
                            onClick={() => updateRole(user.user_id, r)}
                          >
                            {r}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </td>

                {/* ✅ Centered status text + toggle */}
                <td style={{ ...styles.td, textAlign: "center" }}>
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

                {/* ✅ Centered View button */}
                <td style={{ ...styles.td, textAlign: "center" }}>
                  <button
                    style={styles.viewBtn}
                    onClick={() => setSelectedUser(user)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ USER DETAIL MODAL */}
      {selectedUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>{selectedUser.username}</h3>
            <p style={styles.modalSub}>User ID: {selectedUser.user_id}</p>

            <div style={styles.detailRow}>
              <span>Email:</span> <strong>{selectedUser.email}</strong>
            </div>
            <div style={styles.detailRow}>
              <span>Phone:</span> <strong>{selectedUser.phone}</strong>
            </div>
            <div style={styles.detailRow}>
              <span>Role:</span> <strong>{selectedUser.role}</strong>
            </div>
            <div style={styles.detailRow}>
              <span>Status:</span>{" "}
              <strong>{selectedUser.active ? "Active" : "Inactive"}</strong>
            </div>
            <div style={styles.detailRow}>
              <span>Created:</span>{" "}
              <strong>{new Date(selectedUser.created_at).toLocaleString()}</strong>
            </div>

            <button
              style={styles.closeBtn}
              onClick={() => setSelectedUser(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

//
// ✅ STYLES
//

const styles = {
  page: {
    padding: "24px",
  },

  pageTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1E2D3D",
  },

  pageSubtitle: {
    fontSize: "14px",
    marginBottom: "20px",
    color: "#566573",
  },

  tableWrapper: {
    marginTop: "20px",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
    borderRadius: "12px",
  },

  th: {
    textAlign: "left",
    padding: "14px",
    background: "#EBEEF2",
    fontWeight: "600",
    fontSize: "14px",
  },

  td: {
    padding: "14px",
    borderBottom: "1px solid #E7EAF0",
    fontSize: "14px",
  },

  //
  // ✅ Role button + dropdown
  //

  roleColumn: {
    position: "relative",
  },

  roleBtn: {
    padding: "8px 12px",
    background: "#E5ECF3",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
  },

  dropdown: {
    position: "absolute",
    top: "38px",
    left: 0,
    background: "#fff",
    border: "1px solid #ccc",
    width: "160px",
    borderRadius: "8px",
    zIndex: 10,
  },

  dropdownItem: {
    padding: "10px",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
  },

  //
  // ✅ Status toggle
  //

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
    width: "40px",
    height: "20px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    transition: "0.2s",
  },

  toggleCircle: {
    width: "16px",
    height: "16px",
    background: "#fff",
    borderRadius: "50%",
    transition: "0.2s",
  },

  //
  // ✅ View button
  //

  viewBtn: {
    padding: "8px 14px",
    background: "#1E88E5",
    color: "#fff",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  },

  //
  // ✅ Modal
  //

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "380px",
    background: "#fff",
    padding: "22px",
    borderRadius: "14px",
  },

  modalTitle: {
    fontSize: "20px",
    fontWeight: "700",
  },

  modalSub: {
    fontSize: "12px",
    color: "#555",
    marginBottom: "14px",
  },

  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    fontSize: "14px",
  },

  closeBtn: {
    marginTop: "16px",
    width: "100%",
    padding: "10px",
    background: "#1E88E5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};
