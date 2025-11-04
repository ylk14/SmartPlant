import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const MOCK_FLAGGED = [
  {
    observation_id: 'OBS-3011',
    plantName: 'Unknown Nepenthes',
    confidence: 0.42,
    user: 'field.scout',
    submittedAt: '2025-10-12T10:12:00Z',
    location: 'Gunung Mulu, Sarawak',
  },
  {
    observation_id: 'OBS-2987',
    plantName: 'Rafflesia ?',
    confidence: 0.35,
    user: 'flora.lens',
    submittedAt: '2025-10-09T08:45:00Z',
    location: 'Mount Kinabalu, Sabah',
  },
  {
    observation_id: 'OBS-2979',
    plantName: 'Pitcher Plant Candidate',
    confidence: 0.28,
    user: 'botany.lee',
    submittedAt: '2025-10-08T16:20:00Z',
    location: 'Fraser\'s Hill, Pahang',
  },
];

function formatConfidence(score) {
  return `${Math.round(score * 100)}%`;
}

export default function AdminFlagUnsureScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Flag Unsure Queue</Text>
      <Text style={styles.subheading}>
        These observations were flagged by the community or the AI due to low confidence. Replace this list with live data when the endpoint is ready.
      </Text>

      <View style={styles.list}>
        {MOCK_FLAGGED.map((item) => (
          <View key={item.observation_id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardId}>{item.observation_id}</Text>
              <Text style={styles.confidence}>Confidence {formatConfidence(item.confidence)}</Text>
            </View>
            <Text style={styles.plantName}>{item.plantName}</Text>
            <Text style={styles.meta}>Submitted by {item.user}</Text>
            <Text style={styles.meta}>Location ? {item.location}</Text>
            <Text style={styles.meta}>Submitted ? {new Date(item.submittedAt).toLocaleString()}</Text>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
                <Text style={styles.actionText}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.actionSecondary]} activeOpacity={0.8}>
                <Text style={[styles.actionText, styles.actionSecondaryText]}>Assign</Text>
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
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E2D3D',
  },
  subheading: {
    marginTop: 8,
    fontSize: 14,
    color: '#4E5D6A',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardId: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6A7A88',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  confidence: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C2553B',
  },
  plantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#23364B',
  },
  meta: {
    marginTop: 6,
    fontSize: 13,
    color: '#5F6F7E',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
    marginTop: 18,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#1E88E5',
  },
  actionSecondary: {
    backgroundColor: '#E8EEF5',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionSecondaryText: {
    color: '#1E2D3D',
  },
});
