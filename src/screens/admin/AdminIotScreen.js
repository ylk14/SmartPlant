import React, { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
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
  const alertDevices = useMemo(
    () => MOCK_IOT_DEVICES.filter((device) => device.alerts && device.alerts.length > 0),
    []
  );
  const normalDevices = useMemo(
    () => MOCK_IOT_DEVICES.filter((device) => !device.alerts || device.alerts.length === 0),
    []
  );

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
      <Text style={styles.headerSubtitle}>
        Overview of active sensors in the field. Tap `View` to drill into analytics.
      </Text>

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
          renderItem={({ item }) => renderDeviceRow(item)}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>All monitored plants are currently in alert state.</Text>
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
  emptyState: {
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  emptyStateText: {
    fontSize: 13,
    color: '#475467',
    textAlign: 'center',
  },
});
