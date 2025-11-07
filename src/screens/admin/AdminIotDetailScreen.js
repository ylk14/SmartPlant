import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const formatDate = (iso) => {
  if (!iso) return 'N/A'; // Handle null/undefined dates
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
};

const SensorCard = ({ icon, title, value, unit, helper, alert }) => (
  <View style={[styles.sensorCard, alert ? styles.sensorCardAlert : styles.sensorCardOk]}>
    <View style={styles.sensorCardHeader}>
      <View
        style={[styles.sensorIconWrapper, alert ? styles.sensorIconAlert : styles.sensorIconOk]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={alert ? '#991B1B' : '#166534'}
        />
      </View>
      <Text style={[styles.sensorTitle, alert ? styles.sensorTitleAlert : styles.sensorTitleOk]}>{title}</Text>
    </View>
    <Text style={[styles.sensorValue, alert ? styles.sensorValueAlert : styles.sensorValueOk]}>
      {value}
      {!!unit && <Text style={styles.sensorUnit}>{unit}</Text>}
    </Text>
    {!!helper && (
      <Text style={[styles.sensorHelper, alert ? styles.sensorHelperAlert : styles.sensorHelperOk]}>
        {helper}
      </Text>
    )}
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

  // Ensure 'alerts' is an array, even if it's null/undefined
  const alerts = Array.isArray(device.alerts) ? device.alerts : [];

  const formatNumber = (val, digits = 1) => {
    if (typeof val !== 'number' || Number.isNaN(val)) return '--';
    return val.toFixed(digits);
  };
  
  // Ensure 'readings' exists before trying to access its properties
  const readings = device.readings || {};

  const sensorCards = [
    {
      key: 'temperature',
      icon: 'thermometer-outline',
      title: 'Temperature',
      value: formatNumber(readings.temperature, 1),
      unit: ' °C', // Corrected unit
      helper: alerts.includes('Temperature')
        ? 'Temperature exceeds the optimal window.'
        : 'Within optimal range.',
      alert: alerts.includes('Temperature'),
    },
    {
      key: 'humidity',
      icon: 'water-outline',
      title: 'Humidity',
      value: formatNumber(readings.humidity, 0),
      unit: '%',
      helper: alerts.includes('Humidity')
        ? 'High humidity detected. Inspect shelter.'
        : 'Air moisture is stable.',
      alert: alerts.includes('Humidity'),
    },
    {
      key: 'soil_moisture',
      icon: 'leaf-outline',
      title: 'Soil Moisture',
      value: formatNumber(readings.soil_moisture, 0),
      unit: '%',
      helper: alerts.includes('Soil Moisture')
        ? 'Soil moisture outside safe band.'
        : 'Root zone moisture is healthy.',
      alert: alerts.includes('Soil Moisture'),
    },
    {
      key: 'motion_detected',
      icon: 'walk-outline',
      title: 'Motion',
      value: readings.motion_detected ? 'Detected' : 'None',
      unit: '',
      helper: alerts.includes('Motion')
        ? 'Unexpected movement near this device.'
        : 'No unusual activity reported.',
      alert: alerts.includes('Motion'),
    },
  ];

  // 🔧 FIX 1: Your API doesn't provide 'device.photo', so we force the fallback.
  const imageSource = require('../../../assets/pitcher.jpg');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={imageSource} style={styles.photo} resizeMode="cover" />

        <Text style={styles.title}>{device.device_name || 'Unnamed Device'}</Text>
        <Text style={styles.subtitle}>Device ID: {device.device_id}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plant</Text>
          <Text style={styles.sectionValue}>Species ID: {device.species_id || 'N/A'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.sectionValue}>
            Lat: {device.location?.latitude?.toFixed(4) || 'N/A'}
            , Long: {device.location?.longitude?.toFixed(4) || 'N/A'}
          </Text>
        </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sensor Readings</Text>
            <View style={styles.sensorGrid}>
              {sensorCards.map(({ key: sensorKey, ...cardProps }) => (
                <SensorCard key={sensorKey} {...cardProps} />
              ))}
            </View>
          </View>

        <Text style={styles.updatedText}>Last updated {formatDate(device.last_updated)}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// STYLES (unchanged)
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
  sensorGrid: {
    gap: 12,
  },
  sensorCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  sensorCardOk: {
    backgroundColor: '#ECFDF3',
    borderColor: '#BBF7D0',
  },
  sensorCardAlert: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  sensorCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sensorIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensorIconOk: {
    backgroundColor: '#DCFCE7',
  },
  sensorIconAlert: {
    backgroundColor: '#FEE2E2',
  },
  sensorTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  sensorTitleOk: {
    color: '#166534',
  },
  sensorTitleAlert: {
    color: '#991B1B',
  },
  sensorValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  sensorValueOk: {
    color: '#064E3B',
  },
  sensorValueAlert: {
    color: '#B91C1C',
  },
  sensorUnit: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
    color: '#6B7280',
  },
  sensorHelper: {
    fontSize: 12,
  },
  sensorHelperOk: {
    color: '#15803D',
  },
  sensorHelperAlert: {
    color: '#B91C1C',
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