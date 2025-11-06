import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Heatmap } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_ENDANGERED } from '../../navigation/routes';

const mockAdminObservations = [
  {
    observation_id: 'OBS-3011',
    user_id: 42,
    species: {
      species_id: 5,
      common_name: 'Rafflesia arnoldii',
      scientific_name: 'Rafflesia arnoldii',
      is_endangered: true,
    },
    location_latitude: 1.4667,
    location_longitude: 110.3333,
    location_name: 'Bako National Park',
    confidence_score: 0.35,
    is_masked: false,
  },
  {
    observation_id: 'OBS-2987',
    user_id: 51,
    species: {
      species_id: 9,
      common_name: 'Nepenthes rajah',
      scientific_name: 'Nepenthes rajah',
      is_endangered: true,
    },
    location_latitude: 1.595,
    location_longitude: 110.345,
    location_name: 'Santubong Forest Reserve',
    confidence_score: 0.62,
    is_masked: true,
  },
  {
    observation_id: 'OBS-2860',
    user_id: 17,
    species: {
      species_id: 14,
      common_name: 'Dendrobium anosmum',
      scientific_name: 'Dendrobium anosmum',
      is_endangered: false,
    },
    location_latitude: 1.522,
    location_longitude: 110.365,
    location_name: 'Semenggoh Nature Reserve',
    confidence_score: 0.81,
    is_masked: false,
  },
];

export default function AdminHeatmapScreen() {
  const [observations, setObservations] = useState(mockAdminObservations);
  const [viewMode, setViewMode] = useState('heatmap');
  const [selectedObservation, setSelectedObservation] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const mapRef = useRef(null);

  const filteredObservations = useMemo(
    () =>
      selectedObservation
        ? observations.filter(
            (obs) => obs.species.species_id === selectedObservation.species.species_id
          )
        : [],
    [observations, selectedObservation]
  );

  const points = useMemo(
    () =>
      filteredObservations.map((obs) => ({
        latitude: obs.location_latitude,
        longitude: obs.location_longitude,
        weight: obs.species.is_endangered ? 2 : 1,
      })),
    [filteredObservations]
  );

  const toggleMask = (observation_id) => {
    setObservations((prev) =>
      prev.map((item) =>
        item.observation_id === observation_id
          ? { ...item, is_masked: !item.is_masked }
          : item
      )
    );
    setSelectedObservation((prev) =>
      prev && prev.observation_id === observation_id
        ? { ...prev, is_masked: !prev.is_masked }
        : prev
    );
  };

  const HEATMAP_RADIUS = Platform.OS === 'android' ? 40 : 60;
  const hasSelection = Boolean(selectedObservation);
  const visibleForUser = hasSelection
    ? filteredObservations.some((obs) => !obs.is_masked)
    : true;

  const incomingObservation = route?.params?.selectedObservation;

  useEffect(() => {
    if (!incomingObservation) {
      return;
    }

    setObservations((prev) => {
      const existingIndex = prev.findIndex(
        (obs) => obs.observation_id === incomingObservation.observation_id
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...prev[existingIndex], ...incomingObservation };
        return updated;
      }
      return [...prev, incomingObservation];
    });

    setSelectedObservation((prev) => {
      if (prev && prev.observation_id === incomingObservation.observation_id) {
        return { ...prev, ...incomingObservation };
      }
      return { ...incomingObservation };
    });
    setViewMode('heatmap');
  }, [incomingObservation]);

  useEffect(() => {
    if (!selectedObservation || !mapRef.current) {
      return;
    }

    mapRef.current.animateToRegion(
      {
        latitude: selectedObservation.location_latitude,
        longitude: selectedObservation.location_longitude,
        latitudeDelta: 0.25,
        longitudeDelta: 0.25,
      },
      600
    );
    navigation.setParams({ selectedObservation: undefined });
  }, [selectedObservation, navigation]);

  const handleChoosePlant = () => {
    navigation.navigate(ADMIN_ENDANGERED, {
      origin: 'AdminHeatmap',
      selectedObservationId: selectedObservation?.observation_id,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Species Heatmap</Text>
          <Text style={styles.headerSubtitle}>Select a plant to view heatmap distribution.</Text>
        </View>

        <View style={styles.modeRow}>
          <TouchableOpacity
            onPress={() => setViewMode('heatmap')}
            style={[
              styles.modeButton,
              viewMode === 'heatmap' && styles.modeButtonActive,
              !hasSelection && styles.modeButtonDisabled,
            ]}
            disabled={!hasSelection}
          >
            <Ionicons
              name="flame-outline"
              size={16}
              color={!hasSelection ? '#A1A9B6' : viewMode === 'heatmap' ? '#0F4C81' : '#5A6A78'}
            />
            <Text
              style={[
                styles.modeButtonText,
                viewMode === 'heatmap' && styles.modeButtonTextActive,
                !hasSelection && styles.modeButtonTextDisabled,
              ]}
            >
              Heatmap
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('markers')}
            style={[
              styles.modeButton,
              viewMode === 'markers' && styles.modeButtonActive,
              !hasSelection && styles.modeButtonDisabled,
            ]}
            disabled={!hasSelection}
          >
            <Ionicons
              name="location-outline"
              size={16}
              color={!hasSelection ? '#A1A9B6' : viewMode === 'markers' ? '#0F4C81' : '#5A6A78'}
            />
            <Text
              style={[
                styles.modeButtonText,
                viewMode === 'markers' && styles.modeButtonTextActive,
                !hasSelection && styles.modeButtonTextDisabled,
              ]}
            >
              Markers
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mapWrapper}>
        <MapView
          ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: 1.55,
              longitude: 110.35,
              latitudeDelta: 0.3,
              longitudeDelta: 0.3,
            }}
          >
            {hasSelection && viewMode === 'heatmap' && points.length > 0 && (
                <Heatmap
                  points={points}
                  radius={HEATMAP_RADIUS}
                  opacity={0.7}
                  gradient={{
                    colors: ['#ADFF2F', '#FFFF00', '#FF8C00', '#FF0000'],
                    startPoints: [0.01, 0.25, 0.5, 1],
                    colorMapSize: 256,
                  }}
                />
            )}

            {hasSelection && viewMode === 'markers' &&
              filteredObservations.map((obs) => (
                <Marker
                  key={obs.observation_id}
                  coordinate={{ latitude: obs.location_latitude, longitude: obs.location_longitude }}
                  title={obs.species.common_name}
                  description={obs.location_name}
                  pinColor="#1F5E92"
                />
              ))}
          </MapView>

          {hasSelection && (
            <View
              style={[
                styles.visibilityBadge,
                !visibleForUser && styles.visibilityBadgeBlocked,
              ]}
            >
              <Text
                style={[
                  styles.visibilityText,
                  !visibleForUser && styles.visibilityTextBlocked,
                ]}
              >
                {visibleForUser ? 'Visible for user' : 'Not visible for user'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Endangered Species Controls</Text>
          </View>
          <TouchableOpacity style={styles.chooseButton} onPress={handleChoosePlant}>
            <Ionicons name="leaf-outline" size={16} color="#0F4C81" />
            <Text style={styles.chooseButtonText}>Choose a plant</Text>
          </TouchableOpacity>

          {selectedObservation ? (
            <View style={styles.selectedCard}>
              <View style={styles.selectedCardHeader}>
                <View>
                  <Text style={styles.selectedSpecies}>{selectedObservation.species.common_name}</Text>
                  <Text style={styles.selectedScientific}>{selectedObservation.species.scientific_name}</Text>
                </View>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>
                    {selectedObservation.species.is_endangered ? 'Endangered' : 'Not endangered'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardRow}>
                <Ionicons name="albums-outline" size={16} color="#5B6C7C" />
                <Text style={styles.cardRowText}>Observation {selectedObservation.observation_id}</Text>
              </View>
              <View style={styles.cardRow}>
                <Ionicons name="pin-outline" size={16} color="#5B6C7C" />
                <Text style={styles.cardRowText}>{selectedObservation.location_name}</Text>
              </View>
              <View style={styles.cardRow}>
                <Ionicons name="speedometer-outline" size={16} color="#5B6C7C" />
                <Text style={styles.cardRowText}>
                  Confidence {(selectedObservation.confidence_score * 100).toFixed(0)}%
                </Text>
              </View>
              <View style={styles.visibilityRow}>
                <Ionicons
                  name={visibleForUser ? 'eye-outline' : 'eye-off-outline'}
                  size={16}
                  color={visibleForUser ? '#166534' : '#B91C1C'}
                />
                <Text style={styles.visibilityLabel}>
                  {visibleForUser ? 'Visible to users' : 'Masked from users'}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.maskButton, selectedObservation.is_masked ? styles.masked : styles.unmasked]}
                onPress={() => toggleMask(selectedObservation.observation_id)}
              >
                <Ionicons
                  name={selectedObservation.is_masked ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={selectedObservation.is_masked ? '#933d27' : '#0F4C81'}
                />
                <Text
                  style={[
                    styles.maskButtonText,
                    selectedObservation.is_masked ? styles.maskedText : styles.unmaskedText,
                  ]}
                >
                  {selectedObservation.is_masked ? 'Unmask for users' : 'Mask for users'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.emptyStateText}>
              No plant selected yet. Choose a plant to review distribution controls.
            </Text>
          )}
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3E8EE',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F1C2E' },
  headerSubtitle: { fontSize: 12, color: '#5B6C7C', marginTop: 4 },
  modeRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3E8EE',
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#EEF2F8',
    gap: 8,
  },
  modeButtonActive: { backgroundColor: '#D7E6F7' },
  modeButtonDisabled: { opacity: 0.7 },
  modeButtonText: { fontSize: 13, fontWeight: '600', color: '#5A6A78' },
  modeButtonTextActive: { color: '#0F4C81' },
  modeButtonTextDisabled: { color: '#A1A9B6' },
  mapWrapper: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  visibilityBadge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  visibilityBadgeBlocked: {
    backgroundColor: '#FEE2E2',
    shadowColor: '#B91C1C',
  },
  visibilityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  visibilityTextBlocked: {
    color: '#B91C1C',
  },
  panel: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
  },
  panelTitle: { fontSize: 16, fontWeight: '700', color: '#0F1C2E' },
  chooseButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#E3ECF9',
  },
  chooseButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F4C81',
  },
  selectedCard: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: '#F8FBFF',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  selectedCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  selectedSpecies: { fontSize: 16, fontWeight: '700', color: '#0F1C2E' },
  selectedScientific: { fontSize: 13, color: '#4B5563', marginTop: 2 },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
  },
  statusPillText: { fontSize: 11, fontWeight: '700', color: '#B91C1C', textTransform: 'uppercase' },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  cardRowText: { fontSize: 13, color: '#374151' },
  visibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 6,
  },
  visibilityLabel: { fontSize: 12, fontWeight: '600', color: '#1F2937' },
  maskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
    marginTop: 14,
  },
  masked: { backgroundColor: '#FBE4DD' },
  unmasked: { backgroundColor: '#E3ECF9' },
  maskButtonText: { fontSize: 12, fontWeight: '600' },
  maskedText: { color: '#933d27' },
  unmaskedText: { color: '#0F4C81' },
  emptyStateText: {
    marginTop: 16,
    fontSize: 13,
    color: '#5B6C7C',
  },
});
