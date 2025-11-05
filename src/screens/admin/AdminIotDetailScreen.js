import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';

const formatDate = (iso) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
};

const SensorRow = ({ label, value, unit }) => (
  <View style={styles.sensorRow}>
    <Text style={styles.sensorLabel}>{label}</Text>
    <Text style={styles.sensorValue}>{value}{unit}</Text>
  </View>
);

export default function AdminIotDetailScreen({ route }) {
  const device = route?.params?.device;

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No device data provided.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={device.photo} style={styles.photo} />

        <Text style={styles.title}>{device.device_name}</Text>
        <Text style={styles.subtitle}>Device ID: {device.device_id}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plant</Text>
          <Text style={styles.sectionValue}>{device.species}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.sectionValue}>{device.location.name}</Text>
          <Text style={styles.sectionMeta}>
            {device.location.latitude.toFixed(4)}, {device.location.longitude.toFixed(4)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sensor Readings</Text>
          <SensorRow label="Temperature" value={device.readings.temperature} unit="?C" />
          <SensorRow label="Humidity" value={device.readings.humidity} unit="%" />
          <SensorRow label="Soil Moisture" value={device.readings.soil_moisture} unit="%" />
          <SensorRow
            label="Motion"
            value={device.readings.motion_detected ? 'Detected' : 'None'}
            unit=""
          />
        </View>

        <Text style={styles.updatedText}>Last updated {formatDate(device.last_updated)}</Text>
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
    gap: 18,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 18,
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
    gap: 8,
  },
  sectionTitle: {
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
    color: '#6B7280',
  },
  sensorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sensorLabel: {
    fontSize: 13,
    color: '#475569',
  },
  sensorValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  updatedText: {
    fontSize: 12,
    color: '#4B5563',
  },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
    textAlign: 'center',
    marginTop: 40,
  },
});
