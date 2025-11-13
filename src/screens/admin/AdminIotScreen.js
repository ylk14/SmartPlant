import React, { useMemo, useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
// 1. IMPORT Modal, Pressable, and ActivityIndicator
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  TextInput, ScrollView, RefreshControl, ActivityIndicator,
  Modal, Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ADMIN_IOT_DETAIL } from '../../navigation/routes';
// 2. IMPORT ALL API functions (old and new)
import { 
  fetchAllDeviceData, 
  resolveAlertsForDevice,
  fetchSpeciesList, // New
  addNewDevice      // New
} from '../../../services/api';
// 3. IMPORT Picker for the dropdown
import { Picker } from '@react-native-picker/picker';

// 4. HELPER: FormField component (from your 'new' file)
function FormField({ label, value, onChangeText, placeholder, keyboardType = 'default', containerStyle }) {
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

// 5. HELPER: New FormPicker component for the Species dropdown
function FormPicker({ label, selectedValue, onValueChange, items, containerStyle }) {
  return (
    <View style={[styles.fieldContainer, containerStyle]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker}
        >
          {/* Add a "None" option */}
          <Picker.Item label="-- Select a species --" value={null} />
          {items.map((item) => (
            <Picker.Item 
              key={item.species_id} 
              label={item.display_name} 
              value={item.species_id} 
            />
          ))}
        </Picker>
      </View>
    </View>
  );
}

// --- MAIN SCREEN COMPONENT ---
export default function AdminIotScreen() {
  const navigation = useNavigation();
  
  // --- States for Data and UI (from your 'old' file) ---
  const [searchQuery, setSearchQuery] = useState('');
  const [iotDevices, setIotDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // --- States for 'Add Device' Modal ---
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [speciesList, setSpeciesList] = useState([]); // For the dropdown
  const [formError, setFormError] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  // Form fields based on your new backend
  const [newDeviceForm, setNewDeviceForm] = useState({
    device_name: '',
    species_id: null,
    latitude: '',
    longitude: '',
  });

  // --- Data Loading ---
  // 6. UPDATED loadData to fetch devices AND species
  const loadData = async () => {
    try {
      setError(null);
      // Fetch both devices and species list in parallel
      const [deviceData, speciesData] = await Promise.all([
        fetchAllDeviceData(),
        fetchSpeciesList()
      ]);
      setIotDevices(deviceData || []);
      setSpeciesList(speciesData || []);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load dashboard data");
    }
  };

  // 7. UPDATED useEffect for initial load + auto-refresh
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };
    initialLoad();
    
    const intervalId = setInterval(async () => {
      try {
        // Auto-refresh only the device data
        const deviceData = await fetchAllDeviceData();
        setIotDevices(deviceData || []);
      } catch (err) {
        console.error("Failed to auto-refresh devices:", err);
      }
    }, 30000); 
    
    return () => clearInterval(intervalId);
  }, []);

  // Pull-to-refresh handler (full reload)
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  // 'Resolve Alert' button handler (from your 'old' file)
  const handleResolveDeviceAlerts = async (deviceId) => {
    try {
      await resolveAlertsForDevice(deviceId);
      // Just reload devices
      const deviceData = await fetchAllDeviceData();
      setIotDevices(deviceData || []);
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    }
  };

  // --- Modal Handlers (from your 'new' file, but fixed) ---
  const openAddModal = () => {
    setNewDeviceForm({ // Reset form
      device_name: '',
      species_id: null,
      latitude: '',
      longitude: '',
    });
    setFormError(null);
    setFormSubmitting(false);
    setAddModalVisible(true);
  };
  const closeAddModal = () => setAddModalVisible(false);

  const handleFormChange = (key, value) => {
    setNewDeviceForm(prev => ({ ...prev, [key]: value }));
  };

  // 'Save Device' button handler (now connected to backend)
  const handleSubmitNewDevice = async () => {
    setFormError(null);
    // 8. VALIDATE real form fields
    if (!newDeviceForm.device_name || !newDeviceForm.latitude || !newDeviceForm.longitude || !newDeviceForm.species_id) {
      setFormError('All fields are required, including species.'); // <-- Updated message
      return;
    }
    
    setFormSubmitting(true);
    try {
      // 9. CALL real API
      await addNewDevice(newDeviceForm);
      closeAddModal();
      // Reload all data to show the new device
      onRefresh(); 
    } catch (err) {
      setFormError(err.message || 'An error occurred.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // --- Memos for Filtering (from your 'old' file) ---
  const filteredDevices = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return iotDevices.filter((device) => { 
        if (!normalizedQuery) return true;
        
        const haystack = [
          device.device_name,
          device.device_id,
          device.species_name, // Search real data field
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      });
  }, [searchQuery, iotDevices]);

  const alertDevices = useMemo(
      () => filteredDevices.filter((device) => device.alerts && device.alerts.length > 0),
      [filteredDevices]
    );
  const normalDevices = useMemo(
      () => filteredDevices.filter((device) => !device.alerts || device.alerts.length === 0),
      [filteredDevices]
    );
  const noMatches = filteredDevices.length === 0 && searchQuery.length > 0;

  // --- RENDER FUNCTION FOR DEVICE ROW (from your 'old' file) ---
  const renderDeviceRow = (item, isAlert = false) => (
    <View style={[styles.row, isAlert && styles.alertRow]} key={item.device_id}>
      <View style={styles.cellWide}>
        <Text style={[styles.plantText, isAlert && styles.alertPlantText]}>{item.species_name || 'N/A'}</Text>
        
        {isAlert && (
          <Text style={styles.alertDetailText}>Alerts: {item.alerts}</Text>
        )}
      </View>
      <Text style={[styles.cell, isAlert && styles.alertCellText]}>{item.device_id}</Text>
      
      <View style={styles.cellAction}>
        {isAlert && (
          <TouchableOpacity
            style={styles.resolveButton}
            onPress={() => handleResolveDeviceAlerts(item.device_id_raw)}
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

  // --- RENDER FUNCTION FOR LOADING STATE (from your 'old' file) ---
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#1E88E5" />
      </SafeAreaView>
    );
  }
  
  // --- RENDER FUNCTION FOR ERROR STATE (from your 'old' file) ---
  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  // --- MAIN JSX RENDER ---
  return (
    <SafeAreaView style={styles.container}>
      {/* 10. MERGED HEADER (Title + Add Button) */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>IoT Monitoring</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddModal}
          accessibilityRole="button"
          accessibilityLabel="Add IoT device"
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Search Bar (from your 'old' file) */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by device or plant"
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

      {/* Device Lists (from your 'old' file) */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
                  <Text style={[styles.cellAction, styles.headerText, styles.alertHeaderText]}>Action</Text>
                </View>
                {alertDevices.map((item) => renderDeviceRow(item, true))}
              </View>
            )}

            <View style={styles.table}>
              <View style={[styles.row, styles.headerRow]}>
                <Text style={[styles.cellWide, styles.headerText]}>Plant</Text>
                <Text style={[styles.cell, styles.headerText]}>Device ID</Text>
                <Text style={[styles.cellAction, styles.headerText]}>Action</Text>
              </View>

              <FlatList
                data={normalDevices}
                keyExtractor={(item) => item.device_id}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({ item }) => renderDeviceRow(item, false)}
                scrollEnabled={false} 
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
      </ScrollView>

      {/* 11. --- ADD DEVICE MODAL (from your 'new' file, but FIXED) --- */}
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
              Provide the device details to monitor the new sensor.
            </Text>
            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Form fields as requested */}
              <FormField
                label="Device Name"
                value={newDeviceForm.device_name}
                placeholder="e.g. Bako Sensor #1"
                onChangeText={value => handleFormChange('device_name', value)}
              />
              
              {/* REPLACED with Dropdown */}
              <FormPicker
                label="Plant Species"
                selectedValue={newDeviceForm.species_id}
                onValueChange={value => handleFormChange('species_id', value)}
                items={speciesList}
              />
              
              {/* REMOVED: Plant Name */}
              
              <View style={styles.modalRow}>
                <FormField
                  label="Latitude"
                  value={newDeviceForm.latitude}
                  placeholder="e.g. 1.4667"
                  keyboardType="numeric"
                  onChangeText={value => handleFormChange('latitude', value)}
                  containerStyle={styles.modalRowItem}
                />
                <FormField
                  label="Longitude"
                  value={newDeviceForm.longitude}
                  placeholder="e.g. 110.3333"
                  keyboardType="numeric"
                  onChangeText={value => handleFormChange('longitude', value)}
                  containerStyle={styles.modalRowItem}
                />
              </View>
              
              {/* REMOVED: Location Name */}
              
              {formError && (
                <Text style={styles.formErrorText}>{formError}</Text>
              )}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={closeAddModal}
                disabled={formSubmitting}
              >
                <Text style={[styles.modalButtonText, styles.modalCancelText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalPrimary]}
                onPress={handleSubmitNewDevice}
                disabled={formSubmitting}
              >
                {formSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalButtonText}>Save Device</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// 12. --- STYLES (Merged from both files) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9F4',
    padding: 20,
  },
  // Style for loading/error states
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
  },
  // Merged Header (Title + Button)
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2A37',
  },
  addButton: { // From 'new' file
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },
  searchBar: { // From 'old' file
    marginTop: 12, // Adjusted margin
    marginBottom: 16,
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
    fontSize: 13.5,
    color: '#0F172A',
  },
  clearButton: {
    padding: 4,
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
  },
  alertHeaderRow: {
    backgroundColor: '#FEE2E2',
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
  cellAction: { // Centered style from previous request
    width: 120,
    flexDirection: 'row', 
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8, 
    textAlign: 'center',
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
    textTransform: 'capitalize', 
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
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
    textAlign: 'center',
    paddingHorizontal: 20,
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
  // --- Modal Styles (from 'new' file) ---
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
  // New styles for Picker
  pickerContainer: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
  },
  picker: {
    color: '#0F172A',
  },
  // New style for form error
  formErrorText: {
    fontSize: 13,
    color: '#B91C1C',
    textAlign: 'center',
    marginTop: 4,
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