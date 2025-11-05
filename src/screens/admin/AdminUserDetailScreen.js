import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';

const FALLBACK_USER = {
  user_id: '-',
  username: 'Unknown',
  role: 'User',
  email: 'unknown@smartplant.dev',
  phone: 'N/A',
  created_at: 'N/A',
  active: false,
};

const formatDate = (iso) => {
  if (!iso || iso === 'N/A') return 'Pending sync';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
};

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value ?? '?'}</Text>
  </View>
);

export default function AdminUserDetailScreen({ route }) {
  const user = route?.params?.user ?? FALLBACK_USER;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{user.username}</Text>
        <Text style={styles.subtitle}>User ID: {user.user_id}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <DetailRow label="Email" value={user.email} />
          <DetailRow label="Phone" value={user.phone} />
          <DetailRow label="Role" value={user.role} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System</Text>
          <DetailRow label="Status" value={user.active ? 'Active' : 'Inactive'} />
          <DetailRow label="Created" value={formatDate(user.created_at)} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9F4',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    gap: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2A37',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: '#475569',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    maxWidth: '60%',
    textAlign: 'right',
  },
});
