import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  approveObservation,
  confirmExistingSpecies,
  confirmNewSpecies,
  rejectObservation,
  fetchAllSpecies,    
} from '../../../services/api';
// import * as servicesApi from '../services/api';
import { Picker } from '@react-native-picker/picker';

// const formatDate = (iso) => {
//   const date = new Date(iso);
//   return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
// };

const formatDate = (iso) => {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
};

const formatCoords = (lat, lon) => {
  if (lat == null || lon == null) return 'Not available';

  const nLat = Number(lat);
  const nLon = Number(lon);

  if (!Number.isFinite(nLat) || !Number.isFinite(nLon)) {
    return 'Not available';
  }

  // treat 0,0 as "no location"
  if (nLat === 0 && nLon === 0) {
    return 'Not available';
  }

  return `${nLat.toFixed(5)}, ${nLon.toFixed(5)}`;
};

const normalizeScientificName = (input) => {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_') // spaces → underscore
    .replace(/[^a-z_]/g, '') // strip non letters / underscores
    .replace(/_+/g, '_'); // collapse multiple underscores
};

// const openIdentify = async () => {
//   setIdentifyVisible(true);
//   try {
//     if (!speciesOptions.length) {
//       const list = await servicesApi.fetchSpeciesList();
//       setSpeciesOptions(list || []);
//     }
//   } catch (err) {
//     console.error('[Identify] failed to load species list', err);
//     Alert.alert('Error', 'Failed to load species list');
//   }
// };

export default function AdminFlagReviewScreen({ route, navigation }) {
  const observation = route?.params?.observation;
  const [showImage, setShowImage] = useState(false);
  const [identifyVisible, setIdentifyVisible] = useState(false);
  const [identifiedName, setIdentifiedName] = useState('');

  const [mode, setMode] = useState('existing'); // 'existing' | 'new'
  const [selectedSpeciesId, setSelectedSpeciesId] = useState(null);
  const [speciesOptions, setSpeciesOptions] = useState([]);

  const [newScientificName, setNewScientificName] = useState('');
  const [newCommonName, setNewCommonName] = useState('');
  const [newIsEndangered, setNewIsEndangered] = useState(false);
  const [newDescription, setNewDescription] = useState('');

  if (!observation) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Observation not found.</Text>
      </SafeAreaView>
    );
  }

  const handleApprove = async () => {
    try {
      console.log(`Approving observation ${observation.observation_id}...`);
      await approveObservation(observation.observation_id);
      
      Alert.alert('Success', 'Observation approved', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Approve error:', error);
      Alert.alert('Error', 'Could not approve observation');
    }
  };

  const handleReject = () => {
    Alert.alert(
      'Reject observation',
      'Are you sure you want to reject this observation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log(
                `Rejecting observation ${observation.observation_id}...`
              );
              await rejectObservation(observation.observation_id);

              Alert.alert('Rejected', 'Observation rejected', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error('Reject error:', error);
              Alert.alert('Error', 'Could not reject observation');
            }
          },
        },
      ]
    );
  };

  const handleConfirmNewSpecies = async () => {
    try {
      const raw = newScientificName.trim();
      if (!raw) {
        Alert.alert('Missing name', 'Scientific name is required for a new species.');
        return;
      }

      const normalized = normalizeScientificName(raw);

      console.log(
        `Confirming NEW species for observation ${observation.observation_id} as ${normalized}...`
      );

      await confirmNewSpecies(observation.observation_id, {
        scientific_name: normalized,
        common_name: newCommonName.trim(),
        is_endangered: newIsEndangered ? 1 : 0,
        description: newDescription.trim(),
      });

      setIdentifyVisible(false);
      Alert.alert('Success', 'New species added and observation updated', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Confirm new species error:', error);
      Alert.alert('Error', 'Could not save new species');
    }
  };

  const handleConfirmExistingSpecies = async () => {
    try {
      const name = identifiedName.trim();

      if (!selectedSpeciesId && !name) {
        Alert.alert(
          'Missing species',
          'Please select an existing species or type the scientific name.'
        );
        return;
      }

      const payload = {};
      if (selectedSpeciesId) {
        payload.species_id = selectedSpeciesId;
      }
      if (name) {
        payload.scientific_name = name;
      }

      console.log(
        `Confirming EXISTING species for observation ${observation.observation_id} with`,
        payload
      );

      await confirmExistingSpecies(observation.observation_id, payload);

      setIdentifyVisible(false);
      Alert.alert('Success', 'Observation linked to species', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Confirm existing species error:', error);
      Alert.alert('Error', 'Could not confirm existing species');
    }
  };

  const openIdentify = async () => {
    try {
      setIdentifiedName('');
      setSelectedSpeciesId(null);

      if (!speciesOptions.length) {
        const list = await fetchAllSpecies();
        setSpeciesOptions(list);
      }

      setIdentifyVisible(true);
    } catch (err) {
      console.error('[Identify] failed to load species list', err);
      Alert.alert(
        'Error',
        'Could not load species list. You can still type the name manually.'
      );
      setIdentifyVisible(true);
    }
  };

  const existingTabDisabled =
    !selectedSpeciesId && !identifiedName.trim();
  const newTabDisabled = !newScientificName.trim();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setShowImage(true)}
        >
          <View style={styles.photoWrapper}>
            <Image
              source={
                typeof observation.photo === 'string'
                  ? { uri: observation.photo }
                  : observation.photo
              }
              style={styles.photo}
            />
            <View style={styles.resizeBadge}>
              <Ionicons name="expand-outline" size={18} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>

        <Text style={styles.title}>{observation.plant_name}</Text>
        <Text style={styles.subtitle}>
          Observation {observation.observation_id}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Confidence</Text>
          <Text style={styles.sectionValue}>
            {Math.round(observation.confidence * 100)}%
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Location</Text>
          <Text style={styles.sectionValue}>
            {formatCoords(
              observation.location_latitude,
              observation.location_longitude
            )}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Submitted</Text>
          <Text style={styles.sectionValue}>
            {formatDate(observation.submitted_at)}
          </Text>
          <Text style={styles.sectionMeta}>
            Flagged by {observation.user}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
            <Text style={styles.rejectText}>REJECT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.approveButton}
            onPress={handleApprove}
          >
            <Text style={styles.approveText}>APPROVE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.identifyButton}
            onPress={openIdentify}
          >
            <Text style={styles.identifyText}>IDENTIFY</Text>
          </TouchableOpacity>
        </View>

        {/* Image Modal */}
        <Modal
          visible={showImage}
          transparent
          animationType="fade"
          onRequestClose={() => setShowImage(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalCloseArea}
              onPress={() => setShowImage(false)}
            />
            <Image
              source={
                typeof observation.photo === 'string'
                  ? { uri: observation.photo }
                  : observation.photo
              }
              style={styles.modalImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.modalDismiss}
              onPress={() => setShowImage(false)}
            >
              <Text style={styles.modalDismissText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Identify Modal */}
        <Modal
          visible={identifyVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIdentifyVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
              style={styles.identifyWrapper}
            >
              <ScrollView
                style={styles.identifyScroll}
                contentContainerStyle={styles.identifyScrollContent}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.identifyCard}>
                  <Text style={styles.identifyTitle}>
                    Confirm Plant Identity
                  </Text>

                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      style={[
                        styles.toggleBtn,
                        mode === 'existing' && styles.toggleBtnActive,
                      ]}
                      onPress={() => setMode('existing')}
                    >
                      <Text style={styles.toggleText}>Existing species</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.toggleBtn,
                        mode === 'new' && styles.toggleBtnActive,
                      ]}
                      onPress={() => setMode('new')}
                    >
                      <Text style={styles.toggleText}>New species</Text>
                    </TouchableOpacity>
                  </View>

                  {mode === 'existing' && (
                    <>
                      <Text style={styles.identifyLabel}>
                        Select existing species
                      </Text>
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={selectedSpeciesId}
                          onValueChange={(value) => {
                            setSelectedSpeciesId(value);

                            const selected = speciesOptions.find(
                              s => s.species_id === value
                            );

                            // when user picks an existing species, also set the scientific name
                            if (selected && selected.scientific_name) {
                              setIdentifiedName(selected.scientific_name);
                            }
                          }}
                        >
                          <Picker.Item label="Select a species..." value={null} />

                          {speciesOptions.map(s => (
                            <Picker.Item
                              key={s.species_id}
                              // show something human readable, like in AdminIotScreen
                              label={
                                s.display_name ||
                                s.scientific_name ||
                                s.common_name ||
                                `Species ${s.species_id}`
                              }
                              // value is the ID, which is what the backend wants
                              value={s.species_id}
                            />
                          ))}
                        </Picker>
                      </View>

                      <Text style={styles.identifyLabel}>
                        Or type scientific name
                      </Text>
                      <TextInput
                        style={styles.identifyInput}
                        value={identifiedName}
                        onChangeText={setIdentifiedName}
                        placeholder="e.g. casuarina_equisetifolia"
                        placeholderTextColor="#94A3B8"
                      />
                    </>
                  )}

                  {mode === 'new' && (
                    <>
                      <Text style={styles.identifyLabel}>Scientific name</Text>
                      <TextInput
                        style={styles.identifyInput}
                        value={newScientificName}
                        onChangeText={setNewScientificName}
                        placeholder="e.g. Casuarina equisetifolia"
                        placeholderTextColor="#94A3B8"
                      />

                      <Text style={styles.identifyLabel}>Common name</Text>
                      <TextInput
                        style={styles.identifyInput}
                        value={newCommonName}
                        onChangeText={setNewCommonName}
                        placeholder="e.g. Casuarina"
                        placeholderTextColor="#94A3B8"
                      />

                      <View style={styles.switchRow}>
                        <Text style={styles.identifyLabel}>Is endangered</Text>
                        <Switch
                          value={newIsEndangered}
                          onValueChange={setNewIsEndangered}
                        />
                      </View>

                      <Text style={styles.identifyLabel}>Description</Text>
                      <TextInput
                        style={[styles.identifyInput, styles.textArea]}
                        value={newDescription}
                        onChangeText={setNewDescription}
                        placeholder="Short description of this species"
                        placeholderTextColor="#94A3B8"
                        multiline
                        numberOfLines={3}
                      />
                    </>
                  )}

                  <View style={styles.identifyActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setIdentifyVisible(false)}
                    >
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.confirmButton,
                        (mode === 'existing' && existingTabDisabled) ||
                        (mode === 'new' && newTabDisabled)
                          ? styles.confirmButtonDisabled
                          : null,
                      ]}
                      disabled={
                        mode === 'existing'
                          ? existingTabDisabled
                          : newTabDisabled
                      }
                      onPress={() => {
                        if (mode === 'existing') {
                          handleConfirmExistingSpecies();
                        } else {
                          handleConfirmNewSpecies();
                        }
                      }}
                    >
                      <Text style={styles.confirmText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9F4',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    backgroundColor: '#e1e4e8',
  },
  photoWrapper: {
    position: 'relative',
  },
  resizeBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 16,
    padding: 8,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2A37',
  },
  sectionMeta: {
    fontSize: 12,
    color: '#64748B',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 8,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#B3261E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  rejectText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#166534',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  approveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  identifyButton: {
    flex: 1,
    backgroundColor: '#1D4ED8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  identifyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
    textAlign: 'center',
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCloseArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalImage: {
    width: '100%',
    height: '70%',
    borderRadius: 12,
    backgroundColor: '#333',
  },
  modalDismiss: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#1E88E5',
    borderRadius: 999,
  },
  modalDismissText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  identifyWrapper: {
    flex: 1,
    width: '100%',          
  },
  identifyScroll: {
    flex: 1,
    width: '100%',          
  },
  identifyScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',   
    paddingHorizontal: 24,
  },
  identifyCard: {
    width: '90%',           
    maxWidth: 420,         
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  identifyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  identifyLabel: {
    fontSize: 13,
    marginTop: 15,
    marginBottom: 6,
    fontWeight: '600',
    color: '#475569',
  },
  identifyInput: {
    borderWidth: 1,
    borderColor: '#CBD5F5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  identifyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#1E88E5',
  },
  confirmButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  confirmText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
    toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    padding: 4,
    marginTop: 8,
    marginBottom: 12,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#1E88E5',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 4,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
  },
});
