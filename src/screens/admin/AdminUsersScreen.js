import React, { useState } from 'react';
import { SafeAreaView, Text, StyleSheet, View, Switch, TouchableOpacity } from 'react-native';

const INITIAL_USERS = [
  { user_id: 1, username: 'flora_admin', role: 'Super Admin', email: 'flora@smartplant.dev', active: true },
  { user_id: 2, username: 'ranger.sam', role: 'Field Researcher', email: 'sam@smartplant.dev', active: false },
  { user_id: 3, username: 'data.joy', role: 'Data Analyst', email: 'joy@smartplant.dev', active: true },
];

export default function AdminUsersScreen() {
  const [users, setUsers] = useState(INITIAL_USERS);

  const handleToggle = (username) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.username === username ? { ...user, active: !user.active } : user
      )
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>User Directory</Text>
      <Text style={styles.subtitle}>
        Toggle account access and inspect user details. Hook these interactions to backend actions when the API is available.
      </Text>

      <View style={styles.list}>
        {users.map((user) => (
          <View key={user.user_id} style={styles.card}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.username}>{user.username}</Text>
                <Text style={styles.metaId}>User ID: {user.user_id}</Text>
                <Text style={styles.email}>{user.email}</Text>
              </View>
              <View style={styles.statusGroup}>
                <Text style={[styles.statusLabel, user.active ? styles.statusActive : styles.statusInactive]}>
                  {user.active ? 'Active' : 'Inactive'}
                </Text>
                <Switch
                  value={user.active}
                  onValueChange={() => handleToggle(user.username)}
                  trackColor={{ false: '#D0D7DD', true: '#3AA272' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.role}>{user.role}</Text>
              <TouchableOpacity activeOpacity={0.75} style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F5F6F8',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E2D3D',
  },
  subtitle: {
    fontSize: 14,
    color: '#4E5D6A',
    marginTop: 8,
    lineHeight: 20,
  },
  list: {
    marginTop: 24,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E4E9EE',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#23364B',
  },
  email: {
    marginTop: 4,
    fontSize: 13,
    color: '#5F6F7E',
  },
  metaId: {
    marginTop: 2,
    fontSize: 11,
    color: '#7A8996',
    letterSpacing: 0.3,
  },
  statusGroup: {
    alignItems: 'flex-end',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statusActive: {
    color: '#3AA272',
  },
  statusInactive: {
    color: '#B03A2E',
  },
  metaRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  role: {
    fontSize: 13,
    color: '#4E5D6A',
    fontWeight: '600',
  },
  viewButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#1E88E5',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
