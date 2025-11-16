import React, { useState } from "react";

export default function UserDetailModal({
  user,
  onClose,
  roleOptions,
  onChangeRole,
  onChangeActive,
  isBusy,
}) {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.avatar}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={styles.username}>{user.username}</h2>
            <p style={styles.subtext}>User ID: {user.user_id}</p>

            <span
              style={{
                ...styles.statusBadge,
                backgroundColor: user.active ? "#DCFCE7" : "#FEE2E2",
                color: user.active ? "#166534" : "#7F1D1D",
              }}
            >
              {user.active ? "✓ Active" : "⏸ Inactive"}
            </span>
          </div>
        </div>

        {/* Contact Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Contact Details</h3>

          <div style={styles.rowBetween}>
            <span style={styles.label}>Email</span>
            <span>{user.email}</span>
          </div>

          <div style={styles.rowBetween}>
            <span style={styles.label}>Phone</span>
            <span>{user.phone || "—"}</span>
          </div>
        </div>

        {/* Account Controls */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Account Controls</h3>

          {/* Status Toggle */}
          <div style={styles.rowBetween}>
            <span style={styles.label}>Status</span>
            <button
              disabled={isBusy}
              style={styles.actionBtn}
              onClick={() => {
                if (isBusy) return;

                const confirmMsg = user.active
                  ? "Are you sure you want to deactivate this account?"
                  : "Are you sure you want to activate this account?";

                if (window.confirm(confirmMsg)) {
                  onChangeActive(user.user_id, !user.active);
                }
              }}
            >
              {isBusy
                ? "Saving..."
                : user.active
                ? "Deactivate"
                : "Activate"}
            </button>
          </div>

          {/* Role Dropdown */}
          <div style={styles.rowBetween}>
            <span style={styles.label}>Role</span>

            <div style={{ position: "relative" }}>
              <button
                style={styles.roleBtn}
                disabled={isBusy}
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              >
                {user.role} ▼
              </button>

              {roleMenuOpen && (
                <div style={styles.dropdown}>
                  {roleOptions.map((role) => (
                    <div
                      key={role}
                      style={styles.dropdownItem}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to change this user's role to ${role}?`
                          )
                        ) {
                          onChangeRole(user.user_id, role);
                        }
                        setRoleMenuOpen(false);
                      }}
                    >
                      {role}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Close button */}
        <button style={styles.closeBtn} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

/* --------------------------------------------- */
/*                   OLD UI STYLES              */
/* --------------------------------------------- */
const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#FFF",
    width: "420px",
    borderRadius: "14px",
    padding: "20px",
  },
  header: {
    display: "flex",
    gap: "16px",
    marginBottom: "20px",
  },
  avatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "#E2E8F0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "22px",
    fontWeight: "bold",
    color: "#475569",
  },
  username: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
  },
  subtext: {
    margin: "4px 0 10px",
    fontSize: "12px",
    color: "#6B7280",
  },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "50px",
    fontSize: "12px",
    fontWeight: 700,
  },
  section: {
    background: "#F8FAFC",
    padding: "12px",
    borderRadius: "10px",
    marginTop: "18px",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: 700,
    marginBottom: "10px",
  },
  rowBetween: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
  },
  label: {
    fontWeight: 600,
    color: "#374151",
  },
  actionBtn: {
    padding: "6px 12px",
    background: "#2563EB",
    color: "#FFF",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  roleBtn: {
    padding: "6px 12px",
    background: "#E5E7EB",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  dropdown: {
    position: "absolute",
    top: "35px",
    right: 0,
    background: "#FFF",
    border: "1px solid #E2E8F0",
    borderRadius: "6px",
    width: "140px",
    zIndex: 50,
  },
  dropdownItem: {
    padding: "8px",
    borderBottom: "1px solid #F1F5F9",
    cursor: "pointer",
  },
  closeBtn: {
    marginTop: "20px",
    width: "100%",
    padding: "10px",
    background: "#2563EB",
    borderRadius: "6px",
    border: "none",
    color: "#FFF",
    cursor: "pointer",
  },
};
