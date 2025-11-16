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
  Image, 
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Heatmap } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchMapObservations, API_BASE_URL } from '../../services/api';

const HEATMAP_RADIUS = Platform.OS === 'android' ? 40 : 60;

export default function HeatmapScreen() {
  const [observations, setObservations] = useState([]);
  const [selectedSpecies, setSelectedSpecies] = useState('All');
  const [endangeredFilter, setEndangeredFilter] = useState('all'); // all, endangered, non
  const [viewMode, setViewMode] = useState('heatmap'); // heatmap, markers
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date('2025-01-01'));

  const [detailsVisible, setDetailsVisible] = useState(false);

  const mapRef = useRef(null);

  const loadObservations = React.useCallback(async () => {
    try {
      setLoading(true);
      // true means "public" for the backend
      const all = await fetchMapObservations(true);

      // Normalise and keep everything, masking is handled in filtering
      const normalised = all.map(obs => {
        const apiBase = API_BASE_URL?.replace(/\/$/, '') || '';
          const base = apiBase.replace(/\/api$/, '');  // gives http://host:3000

          const rawPhoto = obs.photo_url || obs.photo || null;

          return {
            ...obs,
            photo_url: rawPhoto,
            photoUri: rawPhoto
              ? `${base}/${String(rawPhoto).replace(/^\/+/, '')}` // /uploads/...
              : null,
          };
        // const rawPhoto = obs.photo_url || obs.photo || null;

        return {
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
              : null,
          is_masked: !!obs.is_masked,
          photo_url: rawPhoto,
          photoUri: rawPhoto
            ? `${base}/${String(rawPhoto).replace(/^\/+/, '')}`
            : null,
          species: {
            ...(obs.species || {}),
            is_endangered: !!obs.species?.is_endangered,
          },
        };
      });

      setObservations(normalised);

      if (normalised.length > 0) {
        setSelectedObservation(normalised[0]);
      } else {
        setSelectedObservation(null);
      }
    } catch (err) {
      console.log('Observation fetch error (user heatmap):', err);
      Alert.alert('Error', 'Failed to load observations data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadObservations();

    // Auto refresh every 30 seconds so new observations appear
    const id = setInterval(() => {
      loadObservations();
    }, 30000);

    return () => clearInterval(id);
  }, [loadObservations]);

  // Only unmasked observations are available for the public heatmap
  const visibleObservations = useMemo(
    () => observations.filter(o => !o.is_masked),
    [observations]
  );

  const availableSpecies = useMemo(() => {
    const names = Array.from(
      new Set(
        visibleObservations
          .map(o => o.species?.common_name)
          .filter(Boolean)
      )
    );
    return ['All', ...names];  
  }, [visibleObservations]);

  const filteredObservations = useMemo(() => {
    let list = visibleObservations;

    if (endangeredFilter === 'endangered') {
      list = list.filter(o => o.species?.is_endangered);
    } else if (endangeredFilter === 'non') {
      list = list.filter(o => !o.species?.is_endangered);
    }

    if (selectedSpecies !== 'All') {
      list = list.filter(
        o => o.species?.common_name === selectedSpecies
      );
    }

    // Date filter: keep observations on or after selectedDate
    list = list.filter(o => {
      if (!o.created_at) return true;
      const obsDate = new Date(o.created_at);
      return obsDate.getTime() >= selectedDate.getTime();
    });

    return list;
  }, [visibleObservations, endangeredFilter, selectedSpecies, selectedDate]);

  const points = useMemo(
    () =>
      filteredObservations.map(obs => ({
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

    if (
      !selectedObservation ||
      !filteredObservations.some(
        o => o.observation_id === selectedObservation.observation_id
      )
    ) {
      setSelectedObservation(filteredObservations[0]);
    }
  }, [filteredObservations, selectedObservation]);

  useEffect(() => {
    if (!selectedObservation || !mapRef.current) return;

    if (
      selectedObservation.location_latitude == null ||
      selectedObservation.location_longitude == null
    ) {
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
  }, [selectedObservation]);

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const hasSelection = Boolean(selectedObservation);

  if (loading && observations.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading map data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header copied from admin, simplified for public view */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Species Heatmap</Text>
        <Text style={styles.headerSubtitle}>
          Only unmasked observations are shown to users.
        </Text>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Species</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
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
                    selectedSpecies === name &&
                      styles.filterChipTextActive,
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
                  endangeredFilter === opt.key &&
                    styles.filterChipActive,
                ]}
                onPress={() => setEndangeredFilter(opt.key)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    endangeredFilter === opt.key &&
                      styles.filterChipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Date from</Text>
          <TouchableOpacity
            style={styles.dateChip}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={14}
              color="#0F4C81"
            />
            <Text style={styles.dateChipText}>
              {selectedDate.toDateString()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Mode toggle row */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          onPress={() => setViewMode('heatmap')}
          style={[
            styles.modeButton,
            viewMode === 'heatmap' && styles.modeButtonActive,
            filteredObservations.length === 0 &&
              styles.modeButtonDisabled,
          ]}
          disabled={filteredObservations.length === 0}
        >
          <Ionicons
            name="flame-outline"
            size={16}
            color={
              filteredObservations.length === 0
                ? '#A1A9B6'
                : viewMode === 'heatmap'
                ? '#0F4C81'
                : '#5A6A78'
            }
          />
          <Text
            style={[
              styles.modeButtonText,
              viewMode === 'heatmap' &&
                styles.modeButtonTextActive,
              filteredObservations.length === 0 &&
                styles.modeButtonTextDisabled,
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
            filteredObservations.length === 0 &&
              styles.modeButtonDisabled,
          ]}
          disabled={filteredObservations.length === 0}
        >
          <Ionicons
            name="location-outline"
            size={16}
            color={
              filteredObservations.length === 0
                ? '#A1A9B6'
                : viewMode === 'markers'
                ? '#0F4C81'
                : '#5A6A78'
            }
          />
          <Text
            style={[
              styles.modeButtonText,
              viewMode === 'markers' &&
                styles.modeButtonTextActive,
              filteredObservations.length === 0 &&
                styles.modeButtonTextDisabled,
            ]}
          >
            Markers
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map area */}
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
          {viewMode === 'heatmap' &&
            points.length > 0 && (
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

          {viewMode === 'markers' &&
            filteredObservations.map(obs => (
              <Marker
                key={obs.observation_id}
                coordinate={{
                  latitude: obs.location_latitude,
                  longitude: obs.location_longitude,
                }}
                title={obs.species?.common_name}
                description={obs.location_name}
                pinColor="#1F5E92"
                onPress={() => setSelectedObservation(obs)}
              />
            ))}
        </MapView>

        {filteredObservations.length === 0 && (
          <View style={styles.emptyOverlay}>
            <Text style={styles.emptyOverlayText}>
              No unmasked observations match the current filters.
            </Text>
          </View>
        )}

        {hasSelection && (
          <TouchableOpacity
            style={styles.detailsHandle}
            onPress={() => setDetailsVisible(true)}
          >
            <Text style={styles.detailsHandleText}>
              {selectedObservation?.species?.common_name ||
                'Selected plant'}{' '}
              •{' '}
              {filteredObservations.length === 1
                ? '1 observation'
                : `${filteredObservations.length} observations`}
            </Text>
            <Ionicons name="chevron-up" size={16} color="#0F4C81" />
          </TouchableOpacity>
        )}
      </View>

      {/* Details bottom sheet, read only for users */}
      <Modal
        visible={detailsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailsVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.detailsCard}>
            <View style={styles.detailsHeaderRow}>
              <Text style={styles.panelTitle}>
                Observation details
              </Text>
              <Pressable
                onPress={() => setDetailsVisible(false)}
              >
                <Ionicons
                  name="close"
                  size={18}
                  color="#5B6C7C"
                />
              </Pressable>
            </View>

            {filteredObservations.length > 0 ? (
              <ScrollView
                style={styles.observationList}
                contentContainerStyle={styles.observationListContent}
              >
                {filteredObservations.map(obs => {
                  const isEndangeredObs =
                    !!obs.species?.is_endangered;

                  return (
                    <View
                      key={obs.observation_id}
                      style={[
                        styles.selectedCard,
                        isEndangeredObs
                          ? styles.cardEndangered
                          : styles.cardNonEndangered,
                      ]}
                    >
                      <View style={styles.selectedCardHeader}>
                        {obs.photoUri ? (
                          <Image
                            source={{ uri: obs.photoUri }}
                            style={styles.thumbImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.thumbPlaceholder}>
                            <Ionicons
                              name="image-outline"
                              size={20}
                              color="#9CA3AF"
                            />
                          </View>
                        )}

                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.selectedSpecies}>
                            {obs.species?.common_name}
                          </Text>
                          <Text style={styles.selectedScientific}>
                            {obs.species?.scientific_name}
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

                      <View style={styles.cardRow}>
                        <Ionicons
                          name="albums-outline"
                          size={16}
                          color="#5B6C7C"
                        />
                        <Text style={styles.cardRowText}>
                          Observation {obs.observation_id}
                        </Text>
                      </View>

                      <View style={styles.cardRow}>
                        <Ionicons
                          name="pin-outline"
                          size={16}
                          color="#5B6C7C"
                        />
                        <View>
                          <Text style={styles.detailLabel}>
                            Location
                          </Text>
                          <Text style={styles.detailValue}>
                            {obs.location_latitude != null &&
                            obs.location_longitude != null
                              ? `Lat ${obs.location_latitude.toFixed(
                                  4
                                )}, Lon ${obs.location_longitude.toFixed(
                                  4
                                )}`
                              : 'Coordinates not available'}
                          </Text>
                          {obs.location_name ? (
                            <Text style={styles.detailValue}>
                              {obs.location_name}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      <View style={styles.cardRow}>
                        <Ionicons
                          name="speedometer-outline"
                          size={16}
                          color="#5B6C7C"
                        />
                        <Text style={styles.detailLabel}>
                          Confidence
                        </Text>
                        <Text style={styles.detailValue}>
                          {obs.confidence_score != null
                            ? `${Math.round(
                                obs.confidence_score * 100
                              )}%`
                            : 'Not available'}
                        </Text>
                      </View>

                      {obs.created_at && (
                        <View style={styles.cardRow}>
                          <Ionicons
                            name="calendar-outline"
                            size={16}
                            color="#5B6C7C"
                          />
                          <Text style={styles.detailLabel}>
                            Observed on
                          </Text>
                          <Text style={styles.detailValue}>
                            {new Date(
                              obs.created_at
                            ).toLocaleString()}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={styles.emptyStateText}>
                No unmasked observations match these filters.
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
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
  panelTitle: { fontSize: 16, fontWeight: '700', color: '#0F1C2E' },
  filterRow: {
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 5,
  },
  filterLabel: {
    fontSize: 13,
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
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E3ECF9',
    gap: 6,
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F4C81',
  },
  observationList: {
    marginTop: 12,
  },
  observationListContent: {
    paddingBottom: 16,
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
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  detailValue: {
    fontSize: 13,
    color: '#111827',
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 13,
    color: '#5B6C7C',
  },
  emptyOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 16,
    padding: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  emptyOverlayText: {
    fontSize: 12,
    color: '#4B5563',
    textAlign: 'center',
  },
  thumbImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  thumbPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
