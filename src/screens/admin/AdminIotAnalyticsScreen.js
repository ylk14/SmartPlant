import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Line, Circle, Polyline } from 'react-native-svg';

const HOURS = 60 * 60 * 1000;
const DAYS = 24 * HOURS;

const RANGE_PRESETS = {
  '1H': { label: 'Last Hour', windowMs: 1 * HOURS },
  '24H': { label: '24 Hours', windowMs: 24 * HOURS },
  '7D': { label: '7 Days', windowMs: 7 * DAYS },
};

const METRICS = [
  { key: 'temperature', label: 'Temperature', unit: '°C', color: '#F97316', digits: 1 },
  { key: 'humidity', label: 'Humidity', unit: '%', color: '#2563EB', digits: 0 },
  { key: 'soil_moisture', label: 'Soil Moisture', unit: '%', color: '#22C55E', digits: 0 },
];

const generateMockHistory = () => {
  const now = new Date();
  const start = new Date(now.getTime() - 7 * DAYS);
  const points = 56; // 7 days @ 3-hour interval

  return Array.from({ length: points + 1 }, (_, index) => {
    const pointDate = new Date(start.getTime() + index * 3 * HOURS);
    const phase = index / 3.6;
    const temperature = 24.5 + 3.8 * Math.sin(phase) + 0.7 * Math.cos(phase * 1.2);
    const humidity = 65 + 15 * Math.sin(phase / 1.8 + 0.9) + 4 * Math.cos(phase / 3.1);
    const soil = 50 + 9 * Math.cos(phase / 1.4 + 0.6) + 2.2 * Math.sin(phase / 5.2);
    const motionDetected = ((index + 2) % 10 === 0) || ((index + 4) % 14 === 0);

    return {
      timestamp: pointDate.toISOString(),
      temperature: Number(temperature.toFixed(1)),
      humidity: Math.round(Math.max(38, Math.min(97, humidity))),
      soil_moisture: Math.round(Math.max(30, Math.min(88, soil))),
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

  const metrics = entry.readings ?? entry.metrics ?? entry;

  const temperature =
    coerceMetricNumber(metrics?.temperature ?? metrics?.temp ?? entry.temperature);
  const humidity =
    coerceMetricNumber(metrics?.humidity ?? metrics?.relative_humidity ?? entry.humidity);
  const soil =
    coerceMetricNumber(
      metrics?.soil_moisture ??
        metrics?.soilMoisture ??
        metrics?.soil ??
        entry.soil_moisture
    );

  if ([temperature, humidity, soil].some((val) => val === null)) {
    return null;
  }

  const motionDetected =
    typeof metrics?.motion_detected === 'boolean'
      ? metrics.motion_detected
      : typeof entry.motion_detected === 'boolean'
        ? entry.motion_detected
        : Boolean(metrics?.motion ?? metrics?.motionDetected);

  return {
    timestamp: date.toISOString(),
    temperature,
    humidity,
    soil_moisture: soil,
    motion_detected: motionDetected,
  };
};

const combineHistory = (incomingHistory) => {
  const normalizedIncoming = Array.isArray(incomingHistory)
    ? incomingHistory.map(normalizeHistoryEntry).filter(Boolean)
    : [];

  const fallback = generateMockHistory();
  const merged = [...fallback];

  normalizedIncoming.forEach((entry) => {
    merged.push(entry);
  });

  const unique = new Map();
  merged.forEach((entry) => {
    unique.set(entry.timestamp, entry);
  });

  return Array.from(unique.values()).sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );
};

const formatNumber = (value, digits = 0) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--';
  return value.toFixed(digits);
};

const formatAxisLabel = (timestamp, rangeKey) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '--';
  if (rangeKey === '7D') {
    return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const MetricChart = ({ data, metric, rangeKey, chartWidth }) => {
  const chartHeight = 164;
  const topPadding = 18;
  const bottomPadding = 28;

  const filteredEntries = data.filter(
    (entry) =>
      typeof entry[metric.key] === 'number' && !Number.isNaN(entry[metric.key])
  );
  const metricValues = filteredEntries.map((entry) => entry[metric.key]);

  if (metricValues.length === 0) {
    return (
      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>{metric.label}</Text>
        <Text style={styles.metricEmpty}>No readings available for this window.</Text>
      </View>
    );
  }

  const min = Math.min(...metricValues);
  const max = Math.max(...metricValues);
  const span = max - min || 1;
  const avg = metricValues.reduce((sum, value) => sum + value, 0) / metricValues.length;
  const delta =
    metricValues.length > 1
      ? metricValues[metricValues.length - 1] - metricValues[0]
      : 0;

  const color = metric.color;

  const points = filteredEntries.map((entry, index) => {
    const value = entry[metric.key];
    const x =
      filteredEntries.length > 1
        ? (index / (filteredEntries.length - 1)) * chartWidth
        : chartWidth / 2;
    const normalized = (value - min) / span;
    const y =
      chartHeight -
      (normalized * (chartHeight - topPadding - bottomPadding) + bottomPadding);
    return {
      x,
      y,
      timestamp: entry.timestamp,
      value,
    };
  });

  const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(' ');

  const gridLines = Array.from({ length: 4 }, (_, index) => {
    const ratio = index / 3;
    const y =
      chartHeight -
      (ratio * (chartHeight - topPadding - bottomPadding) + bottomPadding);
    return { y };
  });

  const axisLabels = [
    points[0],
    points[Math.floor(points.length / 2)] ?? points[points.length - 1],
    points[points.length - 1],
  ];

  const deltaColor =
    delta === 0 ? '#475467' : delta > 0 ? '#16A34A' : '#DC2626';
  const deltaIcon =
    delta === 0 ? 'remove-outline' : delta > 0 ? 'arrow-up' : 'arrow-down';

  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricTitle}>{metric.label}</Text>
        <View style={styles.metricHeaderRight}>
          <Ionicons name={deltaIcon} size={14} color={deltaColor} />
          <Text style={[styles.metricDelta, { color: deltaColor }]}>
            {delta > 0 ? '+' : ''}
            {formatNumber(delta, metric.digits)}
            {metric.unit}
          </Text>
        </View>
      </View>

      <View style={styles.metricSummaryRow}>
        <View style={styles.metricSummaryItem}>
          <Text style={styles.metricSummaryLabel}>Latest</Text>
          <Text style={styles.metricSummaryValue}>
            {formatNumber(metricValues[metricValues.length - 1], metric.digits)}
            {metric.unit}
          </Text>
        </View>
        <View style={styles.metricSummaryItem}>
          <Text style={styles.metricSummaryLabel}>Average</Text>
          <Text style={styles.metricSummaryValue}>
            {formatNumber(avg, metric.digits)}
            {metric.unit}
          </Text>
        </View>
        <View style={styles.metricSummaryItem}>
          <Text style={styles.metricSummaryLabel}>Range</Text>
          <Text style={styles.metricSummaryValue}>
            {formatNumber(min, metric.digits)}–{formatNumber(max, metric.digits)}
            {metric.unit}
          </Text>
        </View>
      </View>

      <View style={styles.chartCanvas}>
        <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          {gridLines.map((line, index) => (
            <Line
              key={`grid-${index}`}
              x1="0"
              y1={line.y}
              x2={chartWidth}
              y2={line.y}
              stroke="#E2E8F0"
              strokeDasharray="4 6"
              strokeWidth={1}
            />
          ))}

          <Polyline
            points={polylinePoints}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point, index) => (
            <Circle
              key={`${metric.key}-dot-${index}`}
              cx={point.x}
              cy={point.y}
              r={rangeKey === '7D' ? 0 : 3.2}
              fill="#FFFFFF"
              stroke={color}
              strokeWidth={rangeKey === '7D' ? 0 : 2}
            />
          ))}
        </Svg>
      </View>

      <View style={styles.chartXAxisRow}>
        {axisLabels.map((point, index) => (
          <Text key={`${metric.key}-axis-${index}`} style={styles.chartXAxisLabel}>
            {formatAxisLabel(point?.timestamp, rangeKey)}
          </Text>
        ))}
      </View>
    </View>
  );
};

export default function AdminIotAnalyticsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();

  const device = route?.params?.device ?? {};
  const incomingHistory = route?.params?.history ?? [];

  const combinedHistory = useMemo(
    () => combineHistory(incomingHistory),
    [incomingHistory]
  );

  const [selectedRange, setSelectedRange] = useState('24H');

  const rangeHistory = useMemo(() => {
    if (combinedHistory.length === 0) {
      return [];
    }
    const latestTimestamp = new Date(
      combinedHistory[combinedHistory.length - 1].timestamp
    ).getTime();
    const windowMs = RANGE_PRESETS[selectedRange].windowMs;
    const threshold = latestTimestamp - windowMs;
    const filtered = combinedHistory.filter(
      (entry) => new Date(entry.timestamp).getTime() >= threshold
    );
    if (filtered.length >= 6) {
      return filtered;
    }
    return combinedHistory.slice(-Math.min(combinedHistory.length, 12));
  }, [combinedHistory, selectedRange]);

  const latestEntry = rangeHistory[rangeHistory.length - 1];
  const motionEvents = rangeHistory.filter((entry) => entry.motion_detected).length;
  const activeAlerts = Array.isArray(device.alerts) ? device.alerts.length : 0;

  const chartWidth = Math.min(width - 40, 540);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Historical Analytics</Text>
          <Text style={styles.headerSubtitle}>
            {device.device_name ?? device.device_id ?? 'Unknown Device'}
          </Text>
        </View>
      </View>

      <View style={styles.rangeRow}>
        {Object.entries(RANGE_PRESETS).map(([key, preset]) => {
          const isActive = key === selectedRange;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setSelectedRange(key)}
              style={[styles.rangeChip, isActive && styles.rangeChipActive]}
              activeOpacity={0.8}
              accessibilityLabel={`Show data for ${preset.label}`}
            >
              <Text
                style={[styles.rangeChipText, isActive && styles.rangeChipTextActive]}
              >
                {preset.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Last Reading</Text>
            <Text style={styles.kpiValue}>
              {latestEntry
                ? new Date(latestEntry.timestamp).toLocaleString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: 'short',
                  })
                : '--'}
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Motion Events</Text>
            <Text style={styles.kpiValue}>{motionEvents}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Active Alerts</Text>
            <Text style={styles.kpiValue}>{activeAlerts}</Text>
          </View>
        </View>

        {METRICS.map((metric) => (
          <MetricChart
            key={metric.key}
            data={rangeHistory}
            metric={metric}
            rangeKey={selectedRange}
            chartWidth={chartWidth}
          />
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#F5F6FA',
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#475467',
    marginTop: 2,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  rangeChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#E2E8F0',
  },
  rangeChipActive: {
    backgroundColor: '#2563EB',
  },
  rangeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475467',
  },
  rangeChipTextActive: {
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 20,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  kpiCard: {
    flex: 1,
    minWidth: 120,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  kpiLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#64748B',
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  metricCard: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    gap: 14,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  metricHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricDelta: {
    fontSize: 13,
    fontWeight: '600',
  },
  metricSummaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricSummaryItem: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  metricSummaryLabel: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metricSummaryValue: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  chartCanvas: {
    width: '100%',
  },
  chartXAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  chartXAxisLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  metricEmpty: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748B',
  },
});
