import React from "react";

export default function UserDetailModal({ user, onClose }) {
  if (!user) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>{user.username}</h2>
        <p style={styles.subTitle}>User ID: {user.user_id}</p>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Profile</h3>
          <Detail label="Email" value={user.email} />
          <Detail label="Phone" value={user.phone} />
          <Detail label="Role" value={user.role} />
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>System</h3>
          <Detail label="Status" value={user.active ? "Active" : "Inactive"} />
          <Detail label="Created" value={new Date(user.created_at).toLocaleString()} />
        </div>

        <button style={styles.closeBtn} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div style={styles.row}>
      <span style={styles.label}>{label}</span>
      <span style={styles.value}>{value}</span>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },
  modal: {
    width: "420px",
    background: "#fff",
    padding: "22px",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
  },
  title: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
    color: "#1F2A37",
  },
  subTitle: {
    fontSize: "13px",
    marginTop: 4,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  section: {
    marginTop: 20,
    borderTop: "1px solid #E2E8F0",
    paddingTop: 14,
  },
  sectionTitle: {
    margin: "0 0 10px",
    fontSize: "14px",
    fontWeight: 700,
    color: "#0F172A",
    textTransform: "uppercase",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    color: "#475569",
    fontSize: "13px",
  },
  value: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#1F2937",
    maxWidth: "55%",
    textAlign: "right",
  },
  closeBtn: {
    marginTop: 20,
    width: "100%",
    padding: "10px",
    background: "#1E88E5",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },
};
