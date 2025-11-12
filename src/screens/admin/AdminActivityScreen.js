import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MOCK_ACTIVITY = [
  {
    id: 'act_010',
    actor: 'Sherlyn Lau',
    type: 'user_assign_role',
    target: 'reza.rashid@example.com',
    meta: { role: 'Plant Researcher' },
    createdAt: '2025-11-10T10:32:00Z',
  },
  {
    id: 'act_009',
    actor: 'Admin Lee',
    type: 'heatmap_mask',
    target: 'DEV-905',
    meta: { locationName: 'Trailside', plantName: 'Nepenthes rafflesiana' },
    createdAt: '2025-11-10T10:20:00Z',
  },
  {
    id: 'act_008b',
    actor: 'Admin Lee',
    type: 'heatmap_unmask',
    target: 'DEV-905',
    meta: { locationName: 'Trailside', plantName: 'Nepenthes rafflesiana' },
    createdAt: '2025-11-10T10:18:00Z',
  },
  {
    id: 'act_008',
    actor: 'Sherlyn Lau',
    type: 'device_add',
    target: 'DEV-909',
    meta: { deviceId: 'DEV-909', speciesName: 'Nepenthes rafflesiana' },
    createdAt: '2025-11-10T10:15:00Z',
  },
  {
    id: 'act_007',
    actor: 'Ranger Amir',
    type: 'alert_resolve',
    target: 'DEV-512B',
    meta: {
      deviceId: 'DEV-512B',
      speciesName: 'Nepenthes mirabilis',
      alertTypes: ['humidity', 'motion'],
    },
    createdAt: '2025-11-10T09:52:00Z',
  },
  {
    id: 'act_006',
    actor: 'Admin Lee',
    type: 'user_deactivate',
    target: 'kelly.then@example.com',
    createdAt: '2025-11-10T09:20:00Z',
  },
  {
    id: 'act_005c',
    actor: 'Admin Lee',
    type: 'user_assign_role',
    target: 'kelly.then@example.com',
    meta: { role: 'User' },
    createdAt: '2025-11-10T08:55:00Z',
  },
  {
    id: 'act_005b',
    actor: 'Admin Lee',
    type: 'flag_approve',
    target: 'Flagged observation',
    meta: { plantName: 'Rafflesia arnoldii' },
    createdAt: '2025-11-10T08:42:00Z',
  },
  {
    id: 'act_005a',
    actor: 'Ranger Amir',
    type: 'flag_identify',
    target: 'Observation obs_223',
    meta: { plantName: 'Nepenthes rafflesiana', aiGuess: 'Nepenthes rafflesiana' },
    createdAt: '2025-11-10T08:18:00Z',
  },
  {
    id: 'act_004',
    actor: 'Ranger Amir',
    type: 'alert_resolve',
    target: 'DEV-409A',
    meta: {
      deviceId: 'DEV-409A',
      speciesName: 'Nepenthes mirabilis',
      alertTypes: ['motion'],
    },
    createdAt: '2025-11-09T19:40:00Z',
  },
  {
    id: 'act_003',
    actor: 'Admin Lee',
    type: 'user_activate',
    target: 'bianca.doe@example.com',
    createdAt: '2025-11-09T17:18:00Z',
  },
  {
    id: 'act_002',
    actor: 'Sherlyn Lau',
    type: 'device_add',
    target: 'DEV-905',
    meta: { deviceId: 'DEV-905', speciesName: 'Dendrobium anosmum' },
    createdAt: '2025-11-09T13:32:00Z',
  },
];

const TIME_LABELS = [
  { limit: 60, format: secs => `${Math.max(1, Math.round(secs))}s ago` },
  { limit: 60 * 60, format: secs => `${Math.round(secs / 60)}m ago` },
  { limit: 60 * 60 * 24, format: secs => `${Math.round(secs / 3600)}h ago` },
];

function formatRelativeTime(iso) {
  try {
    const target = new Date(iso);
    const now = new Date();
    const diffInSeconds = (now.getTime() - target.getTime()) / 1000;

    for (const { limit, format } of TIME_LABELS) {
      if (diffInSeconds < limit) return format(diffInSeconds);
    }

    return target.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'iot', label: 'IoT' },
  { key: 'flagged', label: 'Flagged' },
  { key: 'heatmap', label: 'Heatmap' },
  { key: 'users', label: 'Users' },
];

const typeToCategory = type => {
  switch (type) {
    case 'device_add':
    case 'device_update':
    case 'alert_resolve':
      return 'iot';
    case 'flag_identify':
    case 'flag_approve':
      return 'flagged';
    case 'heatmap_mask':
    case 'heatmap_unmask':
      return 'heatmap';
    case 'user_activate':
    case 'user_deactivate':
    case 'user_assign_role':
      return 'users';
    default:
      return 'all';
  }
};

const ACTIVITY_TEMPLATES = roleLabels => ({
  user_activate: entry => `${entry.actor} reactivated user ${entry.target}.`,
  user_deactivate: entry => `${entry.actor} deactivated user ${entry.target}.`,
  user_assign_role: entry =>
    `${entry.actor} assigned ${roleLabels[entry.meta?.role] ?? entry.meta?.role ?? 'a new role'} to ${entry.target}.`,
  flag_identify: entry =>
    `${entry.actor} identified plant ${entry.meta?.plantName ?? entry.target}, AI suggested ${entry.meta?.aiGuess ?? 'a match'}.`,
  flag_approve: entry =>
    `${entry.actor} approved plant ${entry.meta?.plantName ?? entry.target}.`,
  heatmap_mask: entry =>
    `${entry.actor} masked location ${entry.meta?.locationName ?? 'Unknown'} for ${entry.meta?.plantName ?? entry.target}.`,
  heatmap_unmask: entry =>
    `${entry.actor} unmasked location ${entry.meta?.locationName ?? 'Unknown'} for ${entry.meta?.plantName ?? entry.target}.`,
  device_add: entry =>
    `${entry.actor} added device ${entry.meta?.deviceId ?? entry.target} for ${entry.meta?.speciesName ?? entry.meta?.plantName ?? 'a plant species'}.`,
  alert_resolve: entry =>
    `${entry.actor} resolved ${entry.meta?.alertTypes?.join(', ') ?? 'an IoT alert'} for ${entry.meta?.deviceId ?? entry.target}.`,
});

const buildActivityMessage = (entry, roleLabels) => {
  const template = ACTIVITY_TEMPLATES(roleLabels)[entry.type];
  if (template) return template(entry);
  if (entry.action && entry.target) return `${entry.actor} ${entry.action} ${entry.target}.`;
  if (entry.comment) return `${entry.actor}: ${entry.comment}`;
  return entry.actor ? `${entry.actor} recorded an activity.` : 'Activity recorded.';
};

function ActivityItem({ entry }) {
  const roleDisplayNames = {
    Admin: 'Administrator',
    'Plant Researcher': 'Plant Researcher',
    User: 'User',
  };
  const message = buildActivityMessage(entry, roleDisplayNames);

  return (
    <View style={styles.activityCard}>
      <View style={styles.activityBody}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityActor}>{entry.actor}</Text>
          <Text style={styles.activityTime}>{formatRelativeTime(entry.createdAt)}</Text>
        </View>
        <Text style={styles.activitySentence}>{message}</Text>
      </View>
    </View>
  );
}

export default function AdminActivityScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all');

  const results = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return MOCK_ACTIVITY.filter(entry => {
      const matchesFilter =
        filterTab === 'all' || typeToCategory(entry.type) === filterTab;

      if (!matchesFilter) return false;

      if (!normalizedQuery) return true;

      const haystack = [
        entry.actor,
        entry.action,
        entry.target,
        entry.comment,
        entry.type,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [searchQuery, filterTab]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Activity Feed</Text>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search activity or comments"
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </Pressable>
        )}
      </View>

      <View style={styles.filterRow}>
        {FILTER_TABS.map(tab => {
          const active = tab.key === filterTab;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setFilterTab(tab.key)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        contentContainerStyle={results.length === 0 ? styles.emptyStateWrapper : styles.listContent}
        renderItem={({ item }) => <ActivityItem entry={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={styles.emptyStateCard}>
            <Ionicons name="calendar-outline" size={28} color="#94A3B8" />
            <Text style={styles.emptyStateTitle}>No matching activity</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try a different search term or switch filters to see more history.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  searchBar: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  clearButton: {
    padding: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#1E88E5',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 32,
    gap: 12,
  },
  activityCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  activityBody: {
    gap: 6,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  activityActor: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  activitySentence: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  activityTarget: {
    fontWeight: '600',
    color: '#0F172A',
  },
  emptyStateWrapper: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});
