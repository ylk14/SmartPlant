import React, { useMemo, useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  TextInput, ScrollView, RefreshControl, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ADMIN_IOT_DETAIL } from '../../navigation/routes';
import { fetchAllDeviceData, resolveAlertsForDevice } from '../../../services/api';

export default function AdminIotScreen() {
  const navigation = useNavigation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [iotDevices, setIotDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };
    initialLoad();
    // 30-second auto-refresh
    const intervalId = setInterval(loadData, 30000); 
    return () => clearInterval(intervalId);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleResolveDeviceAlerts = async (deviceId) => {
    try {
      await resolveAlertsForDevice(deviceId);
      await loadData();
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    }
  };

  const filteredDevices = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return iotDevices.filter((device) => { 
        if (!normalizedQuery) return true;
        
        const haystack = [
          device.device_name,
          device.device_id,
          device.species_name,
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9F4',
    padding: 20,
  },
  listContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2A37',
  },
  searchBar: {
    marginTop: 16,
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
  cellAction: {
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
});