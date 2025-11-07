import React from 'react';

const IotDetailModal = ({ device, onClose }) => {
  if (!device) return null;

  const formatDate = (iso) => {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
  };

  const formatNumber = (val, digits = 1) => {
    if (typeof val !== 'number' || Number.isNaN(val)) return '--';
    return val.toFixed(digits);
  };

  const alerts = Array.isArray(device.alerts) ? device.alerts : [];

  const sensorCards = [
    {
      key: 'temperature',
      icon: '🌡️',
      title: 'Temperature',
      value: formatNumber(device.readings.temperature, 1),
      unit: '°C',
      helper: alerts.includes('Temperature')
        ? 'Temperature exceeds the optimal window.'
        : 'Within optimal range.',
      alert: alerts.includes('Temperature'),
    },
    {
      key: 'humidity',
      icon: '💧',
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
      icon: '🌱',
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
      icon: '🚶',
      title: 'Motion',
      value: device.readings.motion_detected ? 'Detected' : 'None',
      unit: '',
      helper: alerts.includes('Motion')
        ? 'Unexpected movement near this device.'
        : 'No unusual activity reported.',
      alert: alerts.includes('Motion'),
    },
  ];

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={modalStyles.closeButton} onClick={onClose}>×</button>
        
        <div style={modalStyles.content}>
          <div style={modalStyles.header}>
            <h2 style={modalStyles.deviceTitle}>{device.device_name}</h2>
            <div style={modalStyles.deviceSubtitle}>Device ID: {device.device_id}</div>
          </div>

          <div style={modalStyles.grid}>
            <div style={modalStyles.section}>
              <h3 style={modalStyles.sectionTitle}>Plant Information</h3>
              <div style={modalStyles.infoCard}>
                <div style={modalStyles.infoRow}>
                  <span style={modalStyles.infoLabel}>Species:</span>
                  <span style={modalStyles.infoValue}>{device.species}</span>
                </div>
              </div>
            </div>

            <div style={modalStyles.section}>
              <h3 style={modalStyles.sectionTitle}>Location</h3>
              <div style={modalStyles.infoCard}>
                <div style={modalStyles.infoRow}>
                  <span style={modalStyles.infoLabel}>Name:</span>
                  <span style={modalStyles.infoValue}>{device.location.name}</span>
                </div>
                <div style={modalStyles.infoRow}>
                  <span style={modalStyles.infoLabel}>Coordinates:</span>
                  <span style={modalStyles.infoValue}>
                    {device.location.latitude.toFixed(4)}, {device.location.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            <div style={modalStyles.section}>
              <h3 style={modalStyles.sectionTitle}>Detailed Sensor Readings</h3>
              <div style={modalStyles.sensorGrid}>
                {sensorCards.map((sensor) => (
                  <div
                    key={sensor.key}
                    style={{
                      ...modalStyles.sensorCard,
                      ...(sensor.alert ? modalStyles.sensorCardAlert : modalStyles.sensorCardNormal)
                    }}
                  >
                    <div style={modalStyles.sensorHeader}>
                      <span style={modalStyles.sensorIcon}>{sensor.icon}</span>
                      <span style={modalStyles.sensorTitle}>{sensor.title}</span>
                    </div>
                    <div style={{
                      ...modalStyles.sensorValue,
                      ...(sensor.alert ? modalStyles.sensorValueAlert : {})
                    }}>
                      {sensor.value}
                      {sensor.unit && <span style={modalStyles.sensorUnit}>{sensor.unit}</span>}
                    </div>
                    <div style={{
                      ...modalStyles.sensorHelper,
                      ...(sensor.alert ? modalStyles.sensorHelperAlert : {})
                    }}>
                      {sensor.helper}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={modalStyles.footer}>
            <div style={modalStyles.lastUpdated}>
              Last updated: {formatDate(device.last_updated)}
            </div>
            <button style={modalStyles.closeBtn} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  closeButton: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#6B7280',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  },
  content: {
    padding: '32px',
    maxHeight: 'calc(90vh - 64px)',
    overflowY: 'auto',
  },
  header: {
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #E5E7EB',
  },
  deviceTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1F2A37',
    margin: '0 0 4px 0',
  },
  deviceSubtitle: {
    fontSize: '14px',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
    margin: 0,
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
    padding: '16px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
  },
  infoLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#6B7280',
  },
  infoValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1F2A37',
  },
  sensorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  sensorCard: {
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
  },
  sensorCardNormal: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  sensorCardAlert: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  sensorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  sensorIcon: {
    fontSize: '20px',
  },
  sensorTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  sensorValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1F2A37',
    marginBottom: '8px',
  },
  sensorValueAlert: {
    color: '#DC2626',
  },
  sensorUnit: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: '4px',
  },
  sensorHelper: {
    fontSize: '12px',
    color: '#6B7280',
    lineHeight: '1.4',
  },
  sensorHelperAlert: {
    color: '#DC2626',
    fontWeight: '500',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid #E5E7EB',
  },
  lastUpdated: {
    fontSize: '12px',
    color: '#6B7280',
    fontStyle: 'italic',
  },
  closeBtn: {
    backgroundColor: '#6B7280',
    color: '#FFFFFF',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

export default IotDetailModal;