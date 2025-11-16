import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Heatmap } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { ADMIN_ENDANGERED } from '../../navigation/routes';
import { updateObservationMask, fetchMapObservations } from '../../../services/api';


export default function AdminHeatmapScreen() {
  const [observations, setObservations] = useState([]);
  const [selectedSpecies, setSelectedSpecies] = useState('All');
  const [loading, setLoading] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [endangeredFilter, setEndangeredFilter] = useState('all');

  const [viewMode, setViewMode] = useState('heatmap');
  const [selectedObservation, setSelectedObservation] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const mapRef = useRef(null);
  const isEndangered = !!selectedObservation?.species?.is_endangered;
  const isMasked = !!selectedObservation?.is_masked;

  let visibilityLabel = '';
  if (selectedObservation) {
    if (!isEndangered) {
      visibilityLabel = 'Visible to users (not an endangered species)';
    } else if (isMasked) {
      visibilityLabel = 'Location masked for users';
    } else {
      visibilityLabel = 'Visible to users (exact location shown)';
    }
  }

  const availableSpecies = useMemo(() => {
    const names = Array.from(
      new Set(
        observations
          .map(o => o.species?.common_name)
          .filter(Boolean)
      )
    );
    return ['All', ...names];
  }, [observations]);

  const filteredObservations = useMemo(() => {
    let list = observations;

    if (endangeredFilter === 'endangered') {
      list = list.filter(obs => obs.species?.is_endangered);
    } else if (endangeredFilter === 'non') {
      list = list.filter(obs => !obs.species?.is_endangered);
    }

    if (selectedSpecies !== 'All') {
      list = list.filter(
        obs => obs.species?.common_name === selectedSpecies
      );
    }

    return list;
  }, [observations, selectedSpecies, endangeredFilter]);

  const points = useMemo(
    () =>
      filteredObservations.map((obs) => ({
        latitude: obs.location_latitude,
        longitude: obs.location_longitude,
        weight: obs.species?.is_endangered ? 2 : 1,
      })),
    [filteredObservations]
  );

  useEffect(() => {
    if (!filteredObservations.length) {
      setSelectedObservation(null);
      return;
    }

    // if nothing is selected, or current selection is not in the filtered list,
    // pick the first one
    if (
      !selectedObservation ||
      !filteredObservations.some(
        o => o.observation_id === selectedObservation.observation_id
      )
    ) {
      setSelectedObservation(filteredObservations[0]);
    }
  }, [filteredObservations, selectedObservation]);

  const toggleMask = async (observation_id, nextValue) => {
    try {
      await updateObservationMask(observation_id, nextValue);

      setObservations(prev =>
        prev.map(o =>
          o.observation_id === observation_id
            ? { ...o, is_masked: nextValue }
            : o
        )
      );

      setSelectedObservation(prev =>
        prev && prev.observation_id === observation_id
          ? { ...prev, is_masked: nextValue }
          : prev
      );
    } catch (err) {
      console.log('Mask toggle failed:', err);
      Alert.alert('Error', 'Failed to update mask setting');
    }
  };

  const HEATMAP_RADIUS = Platform.OS === 'android' ? 40 : 60;
  const hasSelection = Boolean(selectedObservation);
  const visibleForUser = hasSelection
    ? (!isEndangered || !isMasked)
    : true;

  const incomingObservation = route?.params?.selectedObservation;

  const loadObservations = React.useCallback(async () => {
    try {
      setLoading(true);
      const all = await fetchMapObservations(false);

      const normalised = all.map(obs => ({
        ...obs,
        location_latitude:
          obs.location_latitude != null
            ? Number.parseFloat(obs.location_latitude)
            : null,
        location_longitude:
          obs.location_longitude != null
            ? Number.parseFloat(obs.location_longitude)
            : null,
        confidence_score:
          obs.confidence_score != null
            ? Number(obs.confidence_score)
            : 0.8,
      }));

      setObservations(normalised);

      // preselect species if coming from endangered list
      if (incomingObservation?.species?.common_name) {
        setSelectedSpecies(incomingObservation.species.common_name);
      } else {
        setSelectedSpecies('All');
      }

      if (normalised.length > 0) {
        const initial =
          incomingObservation &&
          normalised.find(
            o => o.observation_id === incomingObservation.observation_id
          );
        setSelectedObservation(initial || normalised[0]);
      }

      setViewMode('heatmap');
    } catch (err) {
      console.log('Observation fetch error (admin heatmap):', err);
    } finally {
      setLoading(false);
    }
  }, [incomingObservation]);

  useEffect(() => {
    loadObservations();

    const id = setInterval(() => {
      loadObservations();
    }, 30000);

    return () => clearInterval(id);
  }, [loadObservations]);
  

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
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Species</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {availableSpecies.map(name => (
                <TouchableOpacity
                  key={name}
                  style={[
                    styles.filterChip,
                    selectedSpecies === name && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedSpecies(name)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedSpecies === name && styles.filterChipTextActive,
                    ]}
                  >
                    {name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Endangered</Text>
            <View style={styles.filterChipRow}>
              {[
                { key: 'all', label: 'All' },
                { key: 'endangered', label: 'Endangered only' },
                { key: 'non', label: 'Non endangered' },
              ].map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.filterChip,
                    endangeredFilter === opt.key && styles.filterChipActive,
                  ]}
                  onPress={() => setEndangeredFilter(opt.key)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      endangeredFilter === opt.key && styles.filterChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
          {hasSelection && (
            <TouchableOpacity
              style={styles.detailsHandle}
              onPress={() => setDetailsVisible(true)}
            >
              <Text style={styles.detailsHandleText}>
                {selectedObservation?.species?.common_name || 'Selected plant'} •{' '}
                {filteredObservations.length === 1
                  ? '1 observation'
                  : `${filteredObservations.length} observations`}
              </Text>
              <Ionicons name="chevron-up" size={16} color="#0F4C81" />
            </TouchableOpacity>
          )}
        </View>

        <Modal
          visible={detailsVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setDetailsVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.detailsCard}>
              {/* your existing Endangered Species Controls content goes here */}
              {/* keep the same look you already have */}
              <View style={styles.detailsHeaderRow}>
                <Text style={styles.panelTitle}>Endangered Species Controls</Text>
                <TouchableOpacity onPress={() => setDetailsVisible(false)}>
                  <Ionicons name="close" size={18} color="#5B6C7C" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.chooseButton}
                onPress={handleChoosePlant}
              >
                <Ionicons name="leaf-outline" size={16} color="#0F4C81" />
                <Text style={styles.chooseButtonText}>View endangered list</Text>
              </TouchableOpacity>
              {filteredObservations.length > 0 ? (
                <ScrollView
                  style={styles.observationList}
                  contentContainerStyle={styles.observationListContent}
                >
                  {filteredObservations.map(obs => {
                    const isEndangeredObs = !!obs.species?.is_endangered;
                    const isMaskedObs = !!obs.is_masked;
                    const visibleForUsersObs = !isMaskedObs;

                    return (
                      <View
                        key={obs.observation_id}
                        style={[
                          styles.selectedCard,
                          isEndangeredObs ? styles.cardEndangered : styles.cardNonEndangered,
                        ]}
                      >
                        {/* header: name + status pill */}
                        <View style={styles.selectedCardHeader}>
                          <View>
                            <Text style={styles.selectedSpecies}>
                              {obs.species.common_name}
                            </Text>
                            <Text style={styles.selectedScientific}>
                              {obs.species.scientific_name}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.statusPill,
                              !isEndangeredObs && styles.statusPillNonEndangered,
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusPillText,
                                !isEndangeredObs && styles.statusPillTextNonEndangered,
                              ]}
                            >
                              {isEndangeredObs ? 'ENDANGERED' : 'NOT ENDANGERED'}
                            </Text>
                          </View>
                        </View>

                        {/* observation id */}
                        <View style={styles.cardRow}>
                          <Ionicons name="albums-outline" size={16} color="#5B6C7C" />
                          <Text style={styles.cardRowText}>
                            Observation {obs.observation_id}
                          </Text>
                        </View>

                        {/* location */}
                        <View style={styles.cardRow}>
                          <Ionicons name="pin-outline" size={16} color="#5B6C7C" />
                          <View>
                            <Text style={styles.detailLabel}>Location</Text>
                            <Text style={styles.detailValue}>
                              {obs.location_latitude != null && obs.location_longitude != null
                                ? `Lat ${obs.location_latitude.toFixed(4)}, Lon ${obs.location_longitude.toFixed(4)}`
                                : 'Coordinates not available'}
                            </Text>
                            {obs.location_name ? (
                              <Text style={styles.detailValue}>
                                {obs.location_name}
                              </Text>
                            ) : null}
                          </View>
                        </View>

                        {/* confidence */}
                        <View style={styles.cardRow}>
                          <Ionicons name="speedometer-outline" size={16} color="#5B6C7C" />
                          <Text style={styles.detailLabel}>Confidence</Text>
                          <Text style={styles.detailValue}>
                            {obs.confidence_score != null
                              ? `${Math.round(obs.confidence_score * 100)}%`
                              : 'Not available'}
                          </Text>
                        </View>

                        {/* visibility status */}
                        <View style={styles.visibilityRow}>
                          <Ionicons
                            name={visibleForUsersObs ? 'eye-outline' : 'eye-off-outline'}
                            size={16}
                            color={visibleForUsersObs ? '#166534' : '#B91C1C'}
                          />
                          <Text style={styles.visibilityLabel}>
                            {visibleForUsersObs ? 'Visible to users' : 'Masked from users'}
                          </Text>
                        </View>

                        {/* actions */}
                        <View style={styles.cardActionsRow}>
                          <TouchableOpacity
                            style={[
                              styles.maskButton,
                              isMaskedObs ? styles.masked : styles.unmasked,
                            ]}
                            onPress={() => {
                              const nextValue = !isMaskedObs;
                              Alert.alert(
                                nextValue ? 'Mask location' : 'Unmask location',
                                nextValue
                                  ? 'Hide this plant location from end users?'
                                  : 'Reveal this plant location to end users?',
                                [
                                  { text: 'Cancel', style: 'cancel' },
                                  {
                                    text: nextValue ? 'Mask' : 'Unmask',
                                    style: nextValue ? 'destructive' : 'default',
                                    onPress: () =>
                                      toggleMask(obs.observation_id, nextValue),
                                  },
                                ],
                                { cancelable: true }
                              );
                            }}
                          >
                            <Ionicons
                              name={isMaskedObs ? 'eye-off-outline' : 'eye-outline'}
                              size={18}
                              color={isMaskedObs ? '#933d27' : '#0F4C81'}
                            />
                            <Text
                              style={[
                                styles.maskButtonText,
                                isMaskedObs ? styles.maskedText : styles.unmaskedText,
                              ]}
                            >
                              {isMaskedObs ? 'Unmask for users' : 'Mask for users'}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.editLocationButton}
                            onPress={() => {
                              // keep selectedObservation in sync so the top badge uses this one
                              setSelectedObservation(obs);
                              navigation.navigate('AdminEditLocation', {
                                observation: obs,
                              });
                            }}
                          >
                            <Ionicons name="create-outline" size={16} color="#0F4C81" />
                            <Text style={styles.editLocationText}>Edit location</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              ) : (
                <Text style={styles.emptyStateText}>
                  No observations match the current filters.
                </Text>
              )}
            </View>
          </View>
        </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3E8EE',
    gap: 6,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#0F1C2E' },
  headerSubtitle: { fontSize: 12, color: '#5B6C7C', marginTop: 2 },
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
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  cardEndangered: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  cardNonEndangered: {
    backgroundColor: '#ECFDF3',
    borderColor: '#4ADE80',
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FEE2E2',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B91C1C',
  },
  statusPillNonEndangered: {
    backgroundColor: '#DCFCE7',
  },
  statusPillTextNonEndangered: {
    color: '#166534',
  },
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
  detailsActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  maskButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
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
  editLocationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginLeft: 8,
    gap: 6,
    backgroundColor: '#E5F0FB',
  },
  editLocationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F4C81',
  },
  detailsHandle: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  detailsHandleText: {
    fontSize: 13,
    color: '#0F4C81',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  detailsCard: {
    backgroundColor: '#F7FAFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
  },
  detailsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterRow: {
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 4,
    marginLeft: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 5,
  },
  filterLabel: {
    fontSize: 13,
    marginLeft: 0,
    fontWeight: '600',
    color: '#1F2A37',
  },
  filterChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D0D7E2',
    backgroundColor: '#FFFFFF',
    marginRight: 5,
  },
  filterChipActive: {
    backgroundColor: '#D7E6F7',
    borderColor: '#0F4C81',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
  },
  filterChipTextActive: {
    color: '#0F4C81',
    fontWeight: '600',
  },
  observationList: {
    marginTop: 12,
  },
  observationListContent: {
    paddingBottom: 16,
  },
  cardActionsRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  detailValue: {
    fontSize: 13,
    color: '#111827',
  },
});