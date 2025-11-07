import React, { useMemo, useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ADMIN_IOT_DETAIL } from '../../navigation/routes';
import { fetchSensorData } from '../../../services/api'; // 🔧 FIX 1: IMPORT API

export default function AdminIotScreen() {
  const navigation = useNavigation();

  // ADD STATE FOR LOADING AND REAL DATA
  const [iotDevices, setIotDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ADD USEEFFECT TO FETCH DATA
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSensorData(); // Fetches single object
        if (data) {
          setIotDevices([data]); // Put the single object into an array
        } else {
          setIotDevices([]);
        }
      } catch (err) {
        console.error("Failed to load IoT data:", err);
        setError("Failed to load IoT data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // CONNECT useMemo TO REAL DATA STATE
  const alertDevices = useMemo(
    () => iotDevices.filter((device) => device.alerts && device.alerts.length > 0),
    [iotDevices]
  );
  const normalDevices = useMemo(
    () => iotDevices.filter((device) => !device.alerts || device.alerts.length === 0),
    [iotDevices]
  );

  const renderDeviceRow = (item, isAlert = false) => (
    <View style={[styles.row, isAlert && styles.alertRow]}
      key={item.device_id}
    >
      <View style={styles.cellWide}>
        {/*CHANGED item.species to item.device_name */}
        <Text style={[styles.plantText, isAlert && styles.alertPlantText]}>{item.device_name}</Text>
        
        {/* CHANGED item.location.name to item.node_id (or similar) */}
        <Text style={[styles.metaText, isAlert && styles.alertMetaText]}>{item.node_id}</Text>
        
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#1E88E5" />
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

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
              <Text style={styles.emptyStateText}>
                {alertDevices.length > 0 ? 'All other plants are stable.' : 'No devices found.'}
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9F4',
    padding: 20,
    justifyContent: 'center' // Center loading indicator
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
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
    textAlign: 'center',
  },
});