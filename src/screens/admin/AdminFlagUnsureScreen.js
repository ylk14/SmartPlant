import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ADMIN_FLAG_REVIEW } from '../../navigation/routes';

const MOCK_FLAGGED = [
  {
    observation_id: 'OBS-3011',
    plant_name: 'Unknown Nepenthes',
    confidence: 0.42,
    user: 'field.scout',
    submitted_at: '2025-10-12T10:12:00Z',
    location: 'Gunung Mulu, Sarawak',
    photo: require('../../../assets/pitcher.jpg'),
    is_endangered: true,
  },
  {
    observation_id: 'OBS-2987',
    plant_name: 'Rafflesia ?',
    confidence: 0.35,
    user: 'flora.lens',
    submitted_at: '2025-10-09T08:45:00Z',
    location: 'Mount Kinabalu, Sabah',
    photo: require('../../../assets/rafflesia.jpg'),
    is_endangered: true,
  },
  {
    observation_id: 'OBS-2979',
    plant_name: 'Pitcher Plant Candidate',
    confidence: 0.28,
    user: 'botany.lee',
    submitted_at: '2025-10-08T16:20:00Z',
    location: 'Fraser\'s Hill, Pahang',
    photo: require('../../../assets/pitcher.jpg'),
    is_endangered: true,
  },
];

const toPercent = (score) => `${Math.round(score * 100)}%`;

export default function AdminFlagUnsureScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Flag Unsure Queue</Text>
      <Text style={styles.headerSubtitle}>
        AI low-confidence identifications awaiting manual review.
      </Text>

      <View style={styles.table}>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.cellWide, styles.headerText]}>Plant</Text>
          <Text style={[styles.cell, styles.headerText]}>Confidence</Text>
          <Text style={[styles.cellAction, styles.headerText]}>Action</Text>
        </View>

        <FlatList
          data={MOCK_FLAGGED}
          keyExtractor={(item) => item.observation_id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.cellWide}>
                <Text style={styles.plantText}>{item.plant_name}</Text>
                <Text style={styles.metaText}>Obs {item.observation_id} ? {item.location}</Text>
              </View>
              <Text style={styles.cell}>{toPercent(item.confidence)}</Text>
              <View style={styles.cellAction}>
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() => navigation.navigate(ADMIN_FLAG_REVIEW, { observation: item })}
                >
                  <Text style={styles.reviewText}>Review</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2A37',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
    marginBottom: 16,
  },
  table: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerRow: {
    backgroundColor: '#F1F5F9',
  },
  separator: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  cell: {
    flex: 0.9,
    fontSize: 13,
    color: '#334155',
  },
  cellWide: {
    flex: 1.8,
  },
  cellAction: {
    width: 120,
    alignItems: 'flex-end',
  },
  headerText: {
    fontWeight: '700',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  plantText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  reviewButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#6366F1',
  },
  reviewText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
