import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ADMIN_IOT_DETAIL } from '../../navigation/routes';

const MOCK_IOT_DEVICES = [
  {
    device_id: 'DEV-001',
    device_name: 'Soil Monitor A1',
    species: 'Rafflesia arnoldii',
    location: {
      name: 'Bako National Park',
      latitude: 1.4667,
      longitude: 110.3333,
    },
    readings: {
      temperature: 28.4,
      humidity: 78,
      soil_moisture: 42,
      motion_detected: false,
    },
    last_updated: '2025-10-21T12:45:00Z',
    alerts: [],
  },
  {
    device_id: 'DEV-014',
    device_name: 'Weather Station B3',
    species: 'Nepenthes rajah',
    location: {
      name: 'Santubong Forest Reserve',
      latitude: 1.595,
      longitude: 110.345,
    },
    readings: {
      temperature: 24.9,
      humidity: 91,
      soil_moisture: 65,
      motion_detected: true,
    },
    last_updated: '2025-10-21T12:41:00Z',
    alerts: ['Humidity', 'Motion'],
  },
  {
    device_id: 'DEV-020',
    device_name: 'Trail Camera C2',
    species: 'Dipterocarpus sarawakensis',
    location: {
      name: 'Lambir Hills',
      latitude: 1.285,
      longitude: 110.523,
    },
    readings: {
      temperature: 26.8,
      humidity: 84,
      soil_moisture: 55,
      motion_detected: false,
    },
    last_updated: '2025-10-21T12:36:00Z',
    alerts: ['Soil Moisture'],
  },
];

export default function AdminIotScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [newDeviceForm, setNewDeviceForm] = useState(() => ({
    deviceId: '',
    plantSpecies: '',
    plantName: '',
    latitude: '',
    longitude: '',
    locationName: '',
  }));

  const resetForm = () =>
    setNewDeviceForm({
      deviceId: '',
      plantSpecies: '',
      plantName: '',
      latitude: '',
      longitude: '',
      locationName: '',
    });

  const openAddModal = () => {
    resetForm();
    setAddModalVisible(true);
  };
  const closeAddModal = () => setAddModalVisible(false);

  const handleFormChange = (key, value) =>
    setNewDeviceForm(prev => ({
      ...prev,
      [key]: value,
    }));

  const handleSubmitNewDevice = () => {
    const deviceLabel = newDeviceForm.deviceId.trim() || 'New device';
    Alert.alert(
      'Confirm new device',
      `Confirm to add the device ${deviceLabel}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Confirm',
          style: 'default',
          onPress: () => {
            closeAddModal();
            Alert.alert('Success', `${deviceLabel} is added in IoT Monitor.`);
          },
        },
      ],
      {cancelable: true},
    );
  };

  const filteredDevices = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return MOCK_IOT_DEVICES.slice()
      .filter((device) => {
        if (!normalizedQuery) return true;
        const haystack = [
          device.device_name,
          device.device_id,
          device.species,
          device.location?.name,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .sort((a, b) => a.device_name.localeCompare(b.device_name));
  }, [searchQuery]);

  const alertDevices = useMemo(
      () => filteredDevices.filter((device) => device.alerts && device.alerts.length > 0),
      [filteredDevices]
    );
  const normalDevices = useMemo(
      () => filteredDevices.filter((device) => !device.alerts || device.alerts.length === 0),
      [filteredDevices]
    );
  const noMatches = filteredDevices.length === 0;

    const handleResolveAlerts = device => {
      Alert.alert(
        'Resolve alerts',
        `Mark alerts for ${device.device_name || device.device_id} as resolved?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Confirm',
            style: 'default',
            onPress: () => {
              Alert.alert('Alerts resolved', 'Device alerts will be cleared once backend is ready.');
            },
          },
        ],
        {cancelable: true},
      );
    };

    const renderDeviceRow = (item, isAlert = false) => (
    <View style={[styles.row, isAlert && styles.alertRow]}
      key={item.device_id}
    >
      <View style={styles.cellWide}>
        <Text style={[styles.plantText, isAlert && styles.alertPlantText]}>{item.species}</Text>
        <Text style={[styles.metaText, isAlert && styles.alertMetaText]}>{item.location.name}</Text>
        {isAlert && (
          <Text style={styles.alertDetailText}>Alerts: {item.alerts.join(', ')}</Text>
        )}
      </View>
      <Text style={[styles.cell, isAlert && styles.alertCellText]}>{item.device_id}</Text>
      <View style={styles.cellAction}>
          {isAlert && (
            <TouchableOpacity
              style={styles.resolveButton}
              onPress={() => handleResolveAlerts(item)}
            >
              <Text style={styles.resolveButtonText}>Resolve</Text>
            </TouchableOpacity>
          )}
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => navigation.navigate(ADMIN_IOT_DETAIL, { device: item })}
        >
          <Text style={styles.viewText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>IoT Monitoring</Text>
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by device, plant, or location"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
              accessibilityLabel="Clear search"
            >
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddModal}
          accessibilityRole="button"
          accessibilityLabel="Add IoT device"
        >
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

        {noMatches ? (
          <View style={[styles.table, styles.emptyCard]}>
            <Ionicons name="hardware-chip-outline" size={24} color="#94A3B8" />
            <Text style={styles.emptyCardTitle}>No devices found</Text>
            <Text style={styles.emptyCardSubtitle}>Try a different search term or clear the filter.</Text>
          </View>
        ) : (
          <>
            {alertDevices.length > 0 && (
              <View style={[styles.table, styles.alertTable]}>
                <View style={[styles.row, styles.headerRow, styles.alertHeaderRow]}>
                  <Text style={[styles.cellWide, styles.headerText, styles.alertHeaderText]}>Plant</Text>
                  <Text style={[styles.cell, styles.headerText, styles.alertHeaderText]}>Device ID</Text>
            <Text style={[styles.cellActionHeader, styles.headerText, styles.alertHeaderText]}>Action</Text>
                </View>
                {alertDevices.map((item) => renderDeviceRow(item, true))}
              </View>
            )}

            <View style={styles.table}>
              <View style={[styles.row, styles.headerRow]}>
                <Text style={[styles.cellWide, styles.headerText]}>Plant</Text>
                <Text style={[styles.cell, styles.headerText]}>Device ID</Text>
                  <Text style={[styles.cellActionHeader, styles.headerText]}>Action</Text>
              </View>

              <FlatList
                data={normalDevices}
                keyExtractor={(item) => item.device_id}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({ item }) => renderDeviceRow(item)}
                ListEmptyComponent={() => (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                      {alertDevices.length > 0
                        ? 'All matching devices are currently in alert state.'
                        : 'No non-alert devices match your search.'}
                    </Text>
                  </View>
                )}
              />
            </View>
          </>
        )}

      <Modal
        transparent
        animationType="fade"
        visible={isAddModalVisible}
        onRequestClose={closeAddModal}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeAddModal}>
          <Pressable style={styles.modalCard} onPress={event => event.stopPropagation()}>
            <Text style={styles.modalTitle}>Add IoT Device</Text>
            <Text style={styles.modalSubtitle}>
              Provide the device details so admins can monitor the new sensor in real time.
            </Text>
            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <FormField
                label="Device ID"
                value={newDeviceForm.deviceId}
                placeholder="e.g. DEV-901"
                onChangeText={value => handleFormChange('deviceId', value)}
              />
              <FormField
                label="Plant Species"
                value={newDeviceForm.plantSpecies}
                placeholder="e.g. Nepenthes rafflesiana"
                onChangeText={value => handleFormChange('plantSpecies', value)}
              />
              <FormField
                label="Plant Name"
                value={newDeviceForm.plantName}
                placeholder="Common name (optional)"
                onChangeText={value => handleFormChange('plantName', value)}
              />
              <View style={styles.modalRow}>
                <FormField
                  label="Latitude"
                  value={newDeviceForm.latitude}
                  placeholder="e.g. 1.3521"
                  keyboardType="numeric"
                  onChangeText={value => handleFormChange('latitude', value)}
                  containerStyle={styles.modalRowItem}
                />
                <FormField
                  label="Longitude"
                  value={newDeviceForm.longitude}
                  placeholder="e.g. 103.8198"
                  keyboardType="numeric"
                  onChangeText={value => handleFormChange('longitude', value)}
                  containerStyle={styles.modalRowItem}
                />
              </View>
              <FormField
                label="Location"
                value={newDeviceForm.locationName}
                placeholder="Location description"
                onChangeText={value => handleFormChange('locationName', value)}
              />
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={closeAddModal}
              >
                <Text style={[styles.modalButtonText, styles.modalCancelText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalPrimary]}
                onPress={handleSubmitNewDevice}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  containerStyle,
}) {
  return (
    <View style={[styles.fieldContainer, containerStyle]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={keyboardType}
      />
    </View>
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
  table: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  alertTable: {
    marginBottom: 16,
    borderColor: '#FECACA',
    backgroundColor: '#FFF1F2',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerRow: {
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  alertHeaderRow: {
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  cell: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
  },
  cellWide: {
    flex: 1.6,
  },
  cellActionHeader: {
    width: 120,
    textAlign: 'center',
  },
  cellAction: {
    width: 120,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
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
  alertRow: {
    backgroundColor: '#FFE4E6',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#FCA5A5',
  },
  alertPlantText: {
    color: '#7F1D1D',
  },
  alertMetaText: {
    color: '#B91C1C',
  },
  alertCellText: {
    color: '#7F1D1D',
  },
  alertHeaderText: {
    color: '#7F1D1D',
  },
  alertDetailText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#B91C1C',
  },
  viewButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#1E88E5',
  },
  viewText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
    resolveButton: {
      backgroundColor: '#D1FAE5',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    resolveButtonText: {
      color: '#065F46',
      fontSize: 12,
      fontWeight: '600',
    },
  emptyState: {
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  emptyStateText: {
    fontSize: 13,
    color: '#475467',
    textAlign: 'center',
  },
  searchWrapper: {
    marginTop: 18,
    marginBottom: 16,
    position: 'relative',
    alignItems: 'flex-end',
  },
  searchBar: {
    width: '100%',
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
  addButton: {
    position: 'absolute',
    right: 6,
    top: -60,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
  },
  clearButton: {
    padding: 4,
  },
  emptyCard: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 10,
  },
  emptyCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  emptyCardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#475467',
    lineHeight: 18,
  },
  modalContent: {
    gap: 14,
    paddingBottom: 4,
  },
  modalRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalRowItem: {
    flex: 1,
  },
  fieldContainer: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  fieldInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
    fontSize: 14,
    color: '#0F172A',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },
  modalCancel: {
    backgroundColor: '#E2E8F0',
  },
  modalPrimary: {
    backgroundColor: '#2563EB',
  },
  modalButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalCancelText: {
    color: '#1F2937',
  },
});
