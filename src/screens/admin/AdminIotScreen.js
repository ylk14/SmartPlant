import React, { useMemo, useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
// ⬇️ *** IMPORT ScrollView and RefreshControl *** ⬇️
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ADMIN_IOT_DETAIL } from '../../navigation/routes';
import { fetchAllDeviceData, resolveAlertsForDevice } from '../../../services/api';

export default function AdminIotScreen() {
  const navigation = useNavigation();

  const [iotDevices, setIotDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false); // <-- NEW STATE

  // ⬇️ *** UPDATED: Simplified data loading function *** ⬇️
  const loadData = async () => {
    try {
      setError(null);
      const deviceData = await fetchAllDeviceData();
      setIotDevices(deviceData || []);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load dashboard data");
    }
  };

  // ⬇️ *** UPDATED: useEffect now handles initial load AND auto-refresh *** ⬇️
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };
    
    initialLoad(); // Run initial load

    // Set up the 5-minute auto-refresh
    const intervalId = setInterval(loadData, 30000); // 300,000 ms = 0.5 minute

    // Clear interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // ⬇️ *** NEW: Function for manual pull-to-refresh *** ⬇️
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // ⬇️ *** UPDATED: handleResolveDeviceAlerts just re-fetches data *** ⬇️
  const handleResolveDeviceAlerts = async (deviceId) => {
    try {
      await resolveAlertsForDevice(deviceId);
      await loadData(); // Just re-fetch, don't show loading indicator
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    }
  };

  // Memoized lists (Unchanged)
  const alertDevices = useMemo(
    () => iotDevices.filter((device) => device.alerts),
    [iotDevices]
  );
  const normalDevices = useMemo(
    () => iotDevices.filter((device) => !device.alerts),
    [iotDevices]
  );

  // renderDeviceRow (Unchanged from our last fix)
  const renderDeviceRow = (item, isAlert = false) => (
    <View style={[styles.row, isAlert && styles.alertRow]} key={item.device_id}>
      <View style={styles.cellWide}>
        <Text style={[styles.plantText, isAlert && styles.alertPlantText]}>{item.species_id}</Text>
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

  // Main loading indicator
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#1E88E5" />
      </SafeAreaView>
    );
  }
  
  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  // ⬇️ *** UPDATED: Return statement now uses ScrollView *** ⬇️
  return (
    <SafeAreaView style={styles.container}>
      {/* Headers are outside the ScrollView */}
      <Text style={styles.headerTitle}>IoT Monitoring</Text>
      <Text style={styles.headerSubtitle}>
        Overview of active sensors in the field. Tap `View` to drill into analytics.
      </Text>

      {/* ScrollView wraps BOTH lists and provides pull-to-refresh */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* --- Alerted Device List --- */}
        {alertDevices.length > 0 && (
          <View style={[styles.table, styles.alertTable]}>
            <View style={[styles.row, styles.headerRow, styles.alertHeaderRow]}>
              <Text style={[styles.cellWide, styles.headerText, styles.alertHeaderText]}>Plant</Text>
              <Text style={[styles.cell, styles.headerText, styles.alertHeaderText]}>Device ID</Text>
              <Text style={[styles.cellAction, styles.headerText, styles.alertHeaderText]}>Action</Text>
            </View>
            {/* Note: This map is fine since alerts are usually few. */}
            {alertDevices.map((item) => renderDeviceRow(item, true))}
          </View>
        )}

        {/* --- Normal Device List --- */}
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
            // This prevents nested scroll warnings and lets the parent ScrollView handle all scrolling
            scrollEnabled={false} 
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {alertDevices.length > 0 ? 'All other plants are stable.' : 'No devices found.'}
                </Text>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ⬇️ *** UPDATED: Styles (added listContainer) *** ⬇️
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9F4',
    padding: 20,
  },
  // New style to make the ScrollView fill the space
  listContainer: {
    flex: 1,
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
    flexDirection: 'row', 
    justifyContent: 'flex-end',
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
  },
});