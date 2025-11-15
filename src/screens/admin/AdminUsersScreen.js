// src/screens/admin/AdminUsersScreen.js
import React, { useMemo, useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ADMIN_USER_DETAIL } from "../../navigation/routes";

import { fetchAdminUsers } from "../../../services/api";

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminUsers();
      setUsers(data || []);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = (updatedUser) => {
    if (!updatedUser || typeof updatedUser.user_id === "undefined") return;

    setUsers((prev) =>
      prev.map((u) => (u.user_id === updatedUser.user_id ? updatedUser : u))
    );
  };

  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return users
      .filter((u) => {
        if (!normalizedQuery) return true;
        return (
          (u.username || "").toLowerCase().includes(normalizedQuery) ||
          (u.email || "").toLowerCase().includes(normalizedQuery) ||
          String(u.user_id).includes(normalizedQuery)
        );
      })
      .sort((a, b) => (a.username || "").localeCompare(b.username || ""));
  }, [searchQuery, users]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Directory</Text>
        <Text style={styles.subtitle}>Search, manage access, and review roles.</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by username, email, or ID"
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={styles.clearButton}
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2e7d32"
          style={{ marginTop: 30 }}
        />
      ) : (
        <View style={styles.list}>
          {filteredUsers.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={20} color="#94A3B8" />
              <Text style={styles.emptyStateText}>
                No users found. Try a different search.
              </Text>
            </View>
          )}

          {filteredUsers.map((user) => {
            const isActive =
              user.is_active === 1 || user.is_active === true || user.active;

            return (
              <View key={user.user_id} style={styles.card}>
                <Text
                  style={[
                    styles.username,
                    !isActive && styles.usernameInactive,
                  ]}
                >
                  {user.username}
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaTextCol}>
                    <Text style={styles.metaId}>User ID: {user.user_id}</Text>
                    <Text style={styles.phone}>{user.email}</Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.75}
                    style={styles.viewButton}
                    onPress={() =>
                      navigation.navigate(ADMIN_USER_DETAIL, {
                        userData: user, // 👈 matches new detail screen
                        onUpdate: handleUserUpdate,
                      })
                    }
                  >
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#F5F6F8",
  },
  header: {
    gap: 4,
    marginTop: 4,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E2D3D",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  searchBar: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: "#0F172A",
  },
  clearButton: {
    padding: 4,
  },
  list: {
    marginTop: 24,
    gap: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E4E9EE",
    gap: 4,
  },
  username: {
    fontSize: 17,
    fontWeight: "600",
    color: "#23364B",
  },
  usernameInactive: {
    color: "#9CA3AF",
  },
  phone: {
    marginTop: 4,
    fontSize: 12.5,
    color: "#5F6F7E",
  },
  metaId: {
    marginTop: 2,
    fontSize: 11,
    color: "#7A8996",
    letterSpacing: 0.3,
  },
  metaRow: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  metaTextCol: {
    gap: 2,
  },
  viewButton: {
    alignSelf: "flex-end",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 9,
    backgroundColor: "#1E88E5",
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E4E9EE",
    alignItems: "center",
    gap: 10,
  },
  emptyStateText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
  },
});
