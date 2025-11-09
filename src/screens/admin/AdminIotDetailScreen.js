import React, { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ADMIN_IOT_ANALYTICS } from '../../navigation/routes';

const formatDate = (iso) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
};

const HOURS = 60 * 60 * 1000;
const DAYS = 24 * HOURS;

const generateMockHistory = () => {
  const now = new Date();
  const start = new Date(now.getTime() - 7 * DAYS);
  const steps = 56; // 7 days @ 3 hour intervals

  return Array.from({ length: steps + 1 }, (_, index) => {
    const pointDate = new Date(start.getTime() + index * 3 * HOURS);
    const phase = index / 3.4;
    const tempBase = 25 + 3.5 * Math.sin(phase) + 0.6 * Math.cos(phase * 1.2);
    const humidityBase = 68 + 12 * Math.sin(phase / 1.6 + 1) + 3 * Math.cos(phase / 2.8);
    const soilBase = 52 + 7 * Math.cos(phase / 1.3 + 0.4) + 2 * Math.sin(phase / 4);
    const motionDetected = ((index + 3) % 9 === 0) || ((index + 5) % 13 === 0);

    return {
      timestamp: pointDate.toISOString(),
      temperature: Number(tempBase.toFixed(1)),
      humidity: Math.max(40, Math.min(98, Math.round(humidityBase))),
      soil_moisture: Math.max(32, Math.min(90, Math.round(soilBase))),
      motion_detected: motionDetected,
    };
  });
};

const coerceMetricNumber = (value) => {
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const normalizeHistoryEntry = (entry) => {
  if (!entry) return null;

  const timestamp =
    entry.timestamp ??
    entry.recorded_at ??
    entry.created_at ??
    entry.time ??
    entry.datetime;

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const readings = entry.readings ?? entry.metrics ?? entry;

  const temperature =
    coerceMetricNumber(readings?.temperature ?? readings?.temp ?? entry.temperature);
  const humidity =
    coerceMetricNumber(readings?.humidity ?? readings?.relative_humidity ?? entry.humidity);
  const soil =
    coerceMetricNumber(
      readings?.soil_moisture ??
        readings?.soilMoisture ??
        readings?.soil ??
        entry.soil_moisture
    );

  if ([temperature, humidity, soil].some((val) => val === null)) {
    return null;
  }

  const motionDetected =
    typeof readings?.motion_detected === 'boolean'
      ? readings.motion_detected
      : typeof entry.motion_detected === 'boolean'
        ? entry.motion_detected
        : Boolean(readings?.motion ?? readings?.motionDetected);

  return {
    timestamp: date.toISOString(),
    temperature,
    humidity,
    soil_moisture: soil,
    motion_detected: motionDetected,
  };
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
  const navigation = useNavigation();
  const device = route?.params?.device;

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No device data provided.</Text>
      </SafeAreaView>
    );
  }

  const alerts = Array.isArray(device.alerts) ? device.alerts : [];

  const historySeries = useMemo(() => {
    const normalizedHistory = Array.isArray(device.history)
      ? device.history.map(normalizeHistoryEntry).filter(Boolean)
      : [];

    const fallbackHistory = generateMockHistory();
    const merged = [...fallbackHistory];

    normalizedHistory.forEach((entry) => {
      merged.push(entry);
    });

    const uniqueMap = new Map();
    merged.forEach((entry) => {
      uniqueMap.set(entry.timestamp, entry);
    });

    return Array.from(uniqueMap.values()).sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
  }, [device]);

  const formatNumber = (val, digits = 1) => {
    if (typeof val !== 'number' || Number.isNaN(val)) return '--';
    return val.toFixed(digits);
  };

  const sensorCards = [
    {
      key: 'temperature',
      icon: 'thermometer-outline',
      title: 'Temperature',
      value: formatNumber(device.readings.temperature, 1),
      unit: '?C',
      helper: alerts.includes('Temperature')
        ? 'Temperature exceeds the optimal window.'
        : 'Within optimal range.',
      alert: alerts.includes('Temperature'),
    },
    {
      key: 'humidity',
      icon: 'water-outline',
      title: 'Humidity',
      value: formatNumber(device.readings.humidity, 0),
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
      value: formatNumber(device.readings.soil_moisture, 0),
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
      value: device.readings.motion_detected ? 'Detected' : 'None',
      unit: '',
      helper: alerts.includes('Motion')
        ? 'Unexpected movement near this device.'
        : 'No unusual activity reported.',
      alert: alerts.includes('Motion'),
    },
  ];

  const imageSource = device.photo ? device.photo : require('../../../assets/pitcher.jpg');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.canGoBack() && navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>

        <Image source={imageSource} style={styles.photo} resizeMode="cover" />

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
            <View style={styles.sensorGrid}>
              {sensorCards.map(({ key: sensorKey, ...cardProps }) => (
                <SensorCard key={sensorKey} {...cardProps} />
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.historyButton}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate(ADMIN_IOT_ANALYTICS, {
                device,
                history: historySeries,
              })
            }
          >
            <Text style={styles.historyButtonText}>View Historical Data</Text>
          </TouchableOpacity>

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
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginBottom: 12,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 4,
    },
    backButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#0F172A',
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
    historyButton: {
      marginTop: 12,
      alignSelf: 'stretch',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 16,
      backgroundColor: '#2563EB',
      shadowColor: '#2563EB',
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    historyButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
      letterSpacing: 0.2,
      textTransform: 'uppercase',
    },
});
