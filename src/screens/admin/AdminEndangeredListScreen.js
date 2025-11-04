import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MOCK_ENDANGERED_SPECIES = [
  { observation_id: 'OBS-3011', species_name: 'Rafflesia arnoldii', location: 'Bako National Park', status: 'Critical', confidence: 35, is_masked: false },
  { observation_id: 'OBS-2987', species_name: 'Nepenthes rajah', location: 'Santubong Forest Reserve', status: 'High Priority', confidence: 62, is_masked: true },
  { observation_id: 'OBS-2944', species_name: 'Nepenthes lowii', location: 'Mount Kinabalu', status: 'High Priority', confidence: 58, is_masked: false },
  { observation_id: 'OBS-2921', species_name: 'Vanda coerulea', location: 'Crocker Range Park', status: 'Observation', confidence: 44, is_masked: false },
  { observation_id: 'OBS-2899', species_name: 'Dendrobium anosmum', location: 'Semenggoh Nature Reserve', status: 'Monitoring', confidence: 81, is_masked: false },
  { observation_id: 'OBS-2885', species_name: 'Nepenthes villosa', location: 'Tambuyukon', status: 'Critical', confidence: 29, is_masked: true },
  { observation_id: 'OBS-2850', species_name: 'Paphiopedilum rothchildianum', location: 'Mount Kinabalu', status: 'High Priority', confidence: 55, is_masked: false },
  { observation_id: 'OBS-2833', species_name: 'Rafflesia keithii', location: 'Poring Hot Springs', status: 'Observation', confidence: 48, is_masked: false },
  { observation_id: 'OBS-2799', species_name: 'Nepenthes bicalcarata', location: 'Gunung Mulu', status: 'Monitoring', confidence: 66, is_masked: false },
  { observation_id: 'OBS-2764', species_name: 'Dipterocarpus sarawakensis', location: 'Lambir Hills', status: 'Monitoring', confidence: 72, is_masked: false },
  { observation_id: 'OBS-2720', species_name: 'Hopea beccariana', location: 'Batang Ai National Park', status: 'Observation', confidence: 38, is_masked: false },
  { observation_id: 'OBS-2698', species_name: 'Nepenthes truncata', location: 'Danum Valley', status: 'High Priority', confidence: 63, is_masked: false },
  { observation_id: 'OBS-2665', species_name: 'Anoectochilus sandvicensis', location: 'Kubah National Park', status: 'Monitoring', confidence: 74, is_masked: false },
  { observation_id: 'OBS-2642', species_name: 'Rhododendron durionifolium', location: 'Gunung Silam', status: 'Observation', confidence: 52, is_masked: false },
  { observation_id: 'OBS-2610', species_name: 'Nepenthes clipeata', location: 'Mount Kelam', status: 'Critical', confidence: 31, is_masked: true },
];

export default function AdminEndangeredListScreen() {
  const [speciesList, setSpeciesList] = useState(MOCK_ENDANGERED_SPECIES);
  const toggleMask = (observation_id) => {
    setSpeciesList((prev) =>
      prev.map((item) =>
        item.observation_id === observation_id
          ? { ...item, is_masked: !item.is_masked }
          : item
      )
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={speciesList}
        keyExtractor={(item) => item.observation_id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.species}>{item.species_name}</Text>
              <Text style={[styles.statusBadge, getStatusStyle(item.status)]}>{item.status}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="pin-outline" size={16} color="#5B6B7A" />
              <Text style={styles.metaText}>{item.location}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="albums-outline" size={16} color="#5B6B7A" />
              <Text style={styles.metaText}>Observation {item.observation_id}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="speedometer-outline" size={16} color="#5B6B7A" />
              <Text style={styles.metaText}>Confidence {item.confidence}%</Text>
            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.maskButton, item.is_masked ? styles.masked : styles.unmasked]}
                onPress={() => toggleMask(item.observation_id)}
                accessibilityRole="button"
              >
                <Ionicons
                  name={item.is_masked ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={item.is_masked ? '#933d27' : '#0F4C81'}
                />
                <Text style={[styles.maskButtonText, item.is_masked ? styles.maskedText : styles.unmaskedText]}>
                  {item.is_masked ? 'Masked' : 'Visible'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function getStatusStyle(status) {
  switch (status) {
    case 'Critical':
      return { backgroundColor: '#FEE2E2', color: '#B91C1C' };
    case 'High Priority':
      return { backgroundColor: '#FEF3C7', color: '#B45309' };
    case 'Monitoring':
      return { backgroundColor: '#DBEAFE', color: '#1E3A8A' };
    default:
      return { backgroundColor: '#E5E7EB', color: '#374151' };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9F4',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  species: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F1C2E',
    flexShrink: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#475569',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  maskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  masked: { backgroundColor: '#FBE4DD' },
  unmasked: { backgroundColor: '#E3ECF9' },
  maskButtonText: { fontSize: 12, fontWeight: '600' },
  maskedText: { color: '#933d27' },
  unmaskedText: { color: '#0F4C81' },
  viewButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F4C81',
  },
  separator: {
    height: 16,
  },
});
