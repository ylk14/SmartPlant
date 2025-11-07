import React, { useState } from 'react';
import IotDetailModal from '../components/IotDetailModal';

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

const IoT = () => {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDate = (iso) => {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? iso : date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleViewDevice = (device) => {
    setSelectedDevice(device);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDevice(null);
  };

  const renderSensorReadings = (device) => {
    const { temperature, humidity, soil_moisture, motion_detected } = device.readings;
    
    return (
      <div style={styles.sensorsGroup}>
        <div style={{
          ...styles.sensorReading,
          ...(device.alerts.includes('Temperature') ? styles.sensorAlert : {})
        }}>
          <span style={styles.sensorIcon}>🌡️</span>
          <span style={styles.sensorValue}>{temperature}°C</span>
        </div>
        <div style={{
          ...styles.sensorReading,
          ...(device.alerts.includes('Humidity') ? styles.sensorAlert : {})
        }}>
          <span style={styles.sensorIcon}>💧</span>
          <span style={styles.sensorValue}>{humidity}%</span>
        </div>
        <div style={{
          ...styles.sensorReading,
          ...(device.alerts.includes('Soil Moisture') ? styles.sensorAlert : {})
        }}>
          <span style={styles.sensorIcon}>🌱</span>
          <span style={styles.sensorValue}>{soil_moisture}%</span>
        </div>
        <div style={{
          ...styles.sensorReading,
          ...(device.alerts.includes('Motion') ? styles.sensorAlert : {})
        }}>
          <span style={styles.sensorIcon}>🚶</span>
          <span style={styles.sensorValue}>{motion_detected ? 'Detected' : 'None'}</span>
        </div>
      </div>
    );
  };

  const renderDeviceRow = (device) => {
    const hasAlerts = device.alerts && device.alerts.length > 0;
    
    return (
      <div key={device.device_id} style={{
        ...styles.tableRow,
        ...(hasAlerts ? styles.alertRow : {})
      }}>
        <div style={styles.tableCellPlant}>
          <div style={styles.plantInfo}>
            <div style={styles.plantName}>{device.species}</div>
            <div style={styles.plantLocation}>{device.location.name}</div>
            {hasAlerts && (
              <div style={styles.alertBadge}>
                ⚠️ {device.alerts.length} Alert{device.alerts.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
        <div style={styles.tableCellDevice}>
          <div style={styles.deviceId}>{device.device_id}</div>
          <div style={styles.deviceName}>{device.device_name}</div>
        </div>
        <div style={styles.tableCellSensors}>
          {renderSensorReadings(device)}
        </div>
        <div style={styles.tableCellUpdated}>
          <div style={styles.lastUpdated}>
            {formatDate(device.last_updated)}
          </div>
        </div>
        <div style={styles.tableCellAction}>
          <button
            style={styles.viewDetailsBtn}
            onClick={() => handleViewDevice(device)}
          >
            View Details
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>IoT Monitoring Dashboard</h1>
        <p style={styles.subtitle}>
          Real-time sensor data from all connected devices. Click "View Details" for comprehensive analytics.
        </p>
      </div>

      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <div style={styles.tableHeaderCellPlant}>Plant & Location</div>
          <div style={styles.tableHeaderCellDevice}>Device</div>
          <div style={styles.tableHeaderCellSensors}>Sensor Readings</div>
          <div style={styles.tableHeaderCellUpdated}>Last Updated</div>
          <div style={styles.tableHeaderCellAction}>Actions</div>
        </div>

        <div style={styles.tableBody}>
          {MOCK_IOT_DEVICES.map(device => renderDeviceRow(device))}
        </div>
      </div>

      {isModalOpen && (
        <IotDetailModal 
          device={selectedDevice} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#F6F9F4',
    padding: '24px',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1F2A37',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '0',
    lineHeight: '1.5',
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 2fr 1fr 120px',
    backgroundColor: '#F8FAFC',
    borderBottom: '1px solid #E5E7EB',
    padding: '16px 20px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tableHeaderCellPlant: { textAlign: 'left' },
  tableHeaderCellDevice: { textAlign: 'left' },
  tableHeaderCellSensors: { textAlign: 'left' },
  tableHeaderCellUpdated: { textAlign: 'left' },
  tableHeaderCellAction: { textAlign: 'center' },
  tableBody: {
    maxHeight: '600px',
    overflowY: 'auto',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 2fr 1fr 120px',
    padding: '16px 20px',
    borderBottom: '1px solid #F3F4F6',
    alignItems: 'center',
    transition: 'background-color 0.2s',
  },
  alertRow: {
    backgroundColor: '#FEF2F2',
    borderLeft: '4px solid #EF4444',
  },
  tableCellPlant: {
    textAlign: 'left',
  },
  tableCellDevice: {
    textAlign: 'left',
  },
  tableCellSensors: {
    textAlign: 'left',
  },
  tableCellUpdated: {
    textAlign: 'left',
  },
  tableCellAction: {
    textAlign: 'center',
  },
  plantInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  plantName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
  },
  plantLocation: {
    fontSize: '12px',
    color: '#6B7280',
  },
  alertBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    padding: '2px 8px',
    borderRadius: '12px',
    marginTop: '4px',
    display: 'inline-block',
    width: 'fit-content',
  },
  deviceId: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
  },
  deviceName: {
    fontSize: '12px',
    color: '#6B7280',
  },
  sensorsGroup: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  sensorReading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '8px',
    borderRadius: '8px',
    backgroundColor: '#F8FAFC',
    minWidth: '60px',
  },
  sensorAlert: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
  },
  sensorIcon: {
    fontSize: '16px',
  },
  sensorValue: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
  },
  lastUpdated: {
    fontSize: '12px',
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  viewDetailsBtn: {
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

export default IoT;