import React, { useState, useEffect, useMemo, useCallback } from "react";
import UserDetailModal from "../components/UserDetailModal";
import SearchIcon from "@mui/icons-material/Search";
import PeopleIcon from "@mui/icons-material/People";
import {
  fetchUsers,
  fetchRoles,
  updateUser as persistUser,
} from "../services/apiClient";

const DEFAULT_ROLE_OPTIONS = ["Admin", "Plant Researcher", "User"];

/* --- ROLE METADATA LOGIC (unchanged) --- */
const buildRoleMetadata = (rolesList) => {
  const nameToId = {};
  const idToName = {};
  const options = [];

  const register = (name, id) => {
    if (!name && name !== 0) return;
    if (id == null) return;
    const normalizedName = String(name).trim();
    if (!normalizedName) return;
    const numericId = Number(id);
    if (Number.isNaN(numericId)) return;

    idToName[numericId] = normalizedName;
    nameToId[normalizedName] = numericId;
    nameToId[normalizedName.toLowerCase()] = numericId;
    if (!options.includes(normalizedName)) {
      options.push(normalizedName);
    }
  };

  if (Array.isArray(rolesList) && rolesList.length > 0) {
    rolesList.forEach((role) => register(role?.role_name, role?.role_id));
  }

  if (options.length === 0) {
    DEFAULT_ROLE_OPTIONS.forEach((roleName, index) =>
      register(roleName, index + 1)
    );
  }

  return { nameToId, idToName, options };
};

/* --- USER DECORATION LOGIC (unchanged) --- */
const decorateUsers = (apiUsers, idToName) => {
  if (!Array.isArray(apiUsers)) return [];

  return apiUsers.map((user) => {
    const roleId =
      typeof user.role_id === "number" || typeof user.role_id === "string"
        ? Number(user.role_id)
        : null;

    const resolvedRole =
      (typeof user.role_name === "string" && user.role_name.trim()) ||
      (roleId != null ? idToName[roleId] : null) ||
      "Unknown";

    const activeField =
      user.is_active ?? user.active ?? user.status ?? true;

    return {
      ...user,
      role_id: roleId,
      role: resolvedRole,
      active: Boolean(activeField),
      email: user.email ?? "",
      phone: user.phone ?? "",
    };
  });
};

/* --- BUILD UPDATE PAYLOAD (unchanged) --- */
const buildUpdatePayload = (user) => ({
  username: user.username,
  email: user.email,
  role_id: user.role_id,
  avatar_url: user.avatar_url ?? null,
  phone: user.phone ?? null,
  is_active: user.active ? 1 : 0,
});

/* --- MAIN PAGE COMPONENT --- */
export default function Users() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [_, setError] = useState(null);

  const [rolesMeta, setRolesMeta] = useState(() => buildRoleMetadata([]));
  const { options: roleOptions, nameToId: roleNameToId } = rolesMeta;

  const [updatingMap, setUpdatingMap] = useState({});

  const markUpdating = useCallback((userId, value) => {
    setUpdatingMap((prev) => {
      const next = { ...prev };
      if (value) next[userId] = true;
      else delete next[userId];
      return next;
    });
  }, []);

  const isUserBusy = useCallback(
    (userId) => Boolean(updatingMap[userId]),
    [updatingMap]
  );

  /* --- LOAD USERS + ROLES (unchanged) --- */
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [rolesResponse, usersResponse] = await Promise.all([
        fetchRoles().catch(() => []),
        fetchUsers(),
      ]);

      const metadata = buildRoleMetadata(rolesResponse);
      const decoratedUsers = decorateUsers(usersResponse, metadata.idToName);

      setRolesMeta(metadata);
      setUsers(decoratedUsers);

      setSelectedUser((prev) => {
        if (!prev) return prev;
        return decoratedUsers.find((u) => u.user_id === prev.user_id) || prev;
      });
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  /* --- OPTIMISTIC UPDATE (unchanged) --- */
  const applyOptimisticUpdate = useCallback((userId, updatedUser) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.user_id === userId ? { ...user, ...updatedUser } : user
      )
    );
    setSelectedUser((prev) =>
      prev && prev.user_id === userId ? { ...prev, ...updatedUser } : prev
    );
  }, []);

  const revertUserUpdate = useCallback((snapshot) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.user_id === snapshot.user_id ? { ...snapshot } : user
      )
    );
    setSelectedUser((prev) =>
      prev && prev.user_id === snapshot.user_id ? { ...snapshot } : prev
    );
  }, []);

  const runUserUpdate = useCallback(
    async (userId, updater, errorMessage) => {
      const currentUser = users.find((u) => u.user_id === userId);
      if (!currentUser) return false;

      const snapshot = { ...currentUser };
      const nextUser =
        typeof updater === "function"
          ? updater({ ...snapshot })
          : { ...snapshot, ...updater };

      applyOptimisticUpdate(userId, nextUser);
      markUpdating(userId, true);

      try {
        await persistUser(userId, buildUpdatePayload(nextUser));
        return true;
      } catch (err) {
        console.error(err);
        setError(errorMessage);
        revertUserUpdate(snapshot);
        return false;
      } finally {
        markUpdating(userId, false);
      }
    },
    [users, applyOptimisticUpdate, markUpdating, revertUserUpdate]
  );

  /* --- STATUS UPDATE (unchanged logic) --- */
  const updateStatus = async (userId, nextValue = null) => {
    const user = users.find((u) => u.user_id === userId);
    if (!user || isUserBusy(userId)) return false;

    const desiredValue =
      nextValue == null ? !user.active : Boolean(nextValue);

    return runUserUpdate(
      userId,
      { active: desiredValue },
      "Failed to update user status."
    );
  };

  /* --- ROLE UPDATE (unchanged logic) --- */
  const changeRole = async (userId, roleName) => {
    const user = users.find((u) => u.user_id === userId);
    if (!user || isUserBusy(userId)) return false;

    const roleId =
      roleNameToId[roleName] ??
      roleNameToId[roleName?.toLowerCase()] ??
      null;

    if (!roleId) {
      setError("Unknown role selected.");
      return false;
    }

    return runUserUpdate(
      userId,
      { role: roleName, role_id: roleId },
      "Failed to update user role."
    );
  };

  /* --- SEARCH --- */
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        String(u.user_id).includes(q)
    );
  }, [searchQuery, users]);

  /* -------------------------------------------------------- */
  /*                    OLD UI RETURN BLOCK                   */
  /* -------------------------------------------------------- */
  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>User Directory</h2>

      <div style={styles.searchBar}>
        <SearchIcon style={styles.searchIcon} />
        <input
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button style={styles.clearButton} onClick={() => setSearchQuery("")}>
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
            {loading ? (
              <tr>
                <td colSpan={7} style={styles.loadingState}>
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} style={styles.emptyState}>
                  <PeopleIcon style={styles.emptyStateIcon} />
                  <div>No users found.</div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const busy = isUserBusy(user.user_id);
                return (
                  <tr key={user.user_id}>
                    <td style={styles.td}>{user.user_id}</td>
                    <td style={styles.td}>{user.username}</td>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>{user.phone || "—"}</td>
                    <td style={styles.td}>{user.role}</td>
                    <td style={styles.td}>
                      {user.active ? "Active" : "Inactive"}
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.viewBtn}
                        disabled={busy}
                        onClick={() => setSelectedUser(user)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          roleOptions={roleOptions}
          onChangeRole={changeRole}
          onChangeActive={updateStatus}
          isBusy={isUserBusy(selectedUser.user_id)}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------- */
/*                         OLD UI STYLES                    */
/* -------------------------------------------------------- */
const styles = {
  page: {
    padding: "24px",
    background: "#F5F6F8",
    minHeight: "100vh",
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: 700,
    marginBottom: "14px",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    background: "#fff",
    borderRadius: "10px",
    padding: "8px 14px",
    width: "300px",
    marginBottom: "20px",
    border: "1px solid #E2E8F0",
  },
  searchIcon: { color: "#64748B" },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    marginLeft: "6px",
  },
  clearButton: {
    background: "none",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    color: "#6B7280",
  },
  tableWrapper: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    background: "#EBEEF2",
    padding: "14px",
    textAlign: "center",
    fontWeight: 600,
  },
  td: {
    padding: "14px",
    borderBottom: "1px solid #E5E7EB",
    textAlign: "center",
  },
  viewBtn: {
    padding: "6px 12px",
    background: "#3B82F6",
    color: "#fff",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
  },
  emptyStateIcon: {
    fontSize: "48px",
    color: "#94A3B8",
    marginBottom: "10px",
  },
  loadingState: {
    textAlign: "center",
    padding: "30px",
  },
};
