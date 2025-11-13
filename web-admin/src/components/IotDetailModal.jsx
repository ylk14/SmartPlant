import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import GrassIcon from '@mui/icons-material/Grass';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';

const IotDetailModal = ({ device, onClose }) => {
  const navigate = useNavigate();

  if (!device) return null;

  // Real alert thresholds matching mobile app
  const thresholds = {
    TEMP_HIGH: 32.0,
    TEMP_LOW: 5.0,
    HUMIDITY_HIGH: 85.0,
    SOIL_MOISTURE_LOW: 20.0,
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString();
  };

  // Calculate alerts based on real thresholds
  const isTempAlert = device.readings.temperature > thresholds.TEMP_HIGH || 
                     device.readings.temperature < thresholds.TEMP_LOW;
  const isHumidityAlert = device.readings.humidity > thresholds.HUMIDITY_HIGH;
  const isSoilAlert = device.readings.soil_moisture < thresholds.SOIL_MOISTURE_LOW;
  const isMotionAlert = device.readings.motion_detected;

  const sensorCards = [
    {
      key: 'temperature',
      icon: <ThermostatIcon />,
      title: 'Temperature',
      value: device.readings.temperature?.toFixed(1) || '--',
      unit: '°C',
      helper: isTempAlert ? 'Outside optimal range' : 'Within optimal range',
      alert: isTempAlert,
    },
    {
      key: 'humidity',
      icon: <OpacityIcon />,
      title: 'Humidity',
      value: device.readings.humidity?.toFixed(0) || '--',
      unit: '%',
      helper: isHumidityAlert ? 'High humidity detected' : 'Air moisture stable',
      alert: isHumidityAlert,
    },
    {
      key: 'soil_moisture',
      icon: <GrassIcon />,
      title: 'Soil Moisture',
      value: device.readings.soil_moisture?.toFixed(0) || '--',
      unit: '%',
      helper: isSoilAlert ? 'Moisture level low' : 'Moisture level optimal',
      alert: isSoilAlert,
    },
    {
      key: 'motion_detected',
      icon: <DirectionsWalkIcon />,
      title: 'Motion',
      value: device.readings.motion_detected ? 'Detected' : 'None',
      unit: '',
      helper: isMotionAlert ? 'Movement detected' : 'No activity',
      alert: isMotionAlert,
    },
  ];

  const handleViewHistoricalData = () => {
    // Close the modal first
    onClose();
    // Navigate to analytics page with device data
    navigate('/iot-analytics', { 
      state: { 
        device: device
      }
    });
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <div style={modalStyles.titleWithIcon}>
            <DeviceHubIcon style={modalStyles.titleIcon} />
            <h2 style={modalStyles.title}>{device.device_name}</h2>
          </div>
          <button style={modalStyles.closeButton} onClick={onClose}>×</button>
        </div>

        <div style={modalStyles.content}>
          <div style={modalStyles.deviceInfo}>
            <div style={modalStyles.infoItem}>
              <label style={modalStyles.infoLabel}>Device ID:</label>
              <span style={modalStyles.infoValue}>{device.device_id}</span>
            </div>
            <div style={modalStyles.infoItem}>
              <label style={modalStyles.infoLabel}>Plant Species:</label>
              <span style={modalStyles.infoValue}>{device.species_name}</span>
            </div>
          </div>

          <div style={modalStyles.section}>
            <div style={modalStyles.sectionHeader}>
              <LocationOnIcon style={modalStyles.sectionIcon} />
              <h3 style={modalStyles.sectionTitle}>Location</h3>
            </div>
            <div style={modalStyles.locationCard}>
              <div style={modalStyles.locationName}>{device.location.name}</div>
              <div style={modalStyles.coordinates}>
                Lat: {device.location.latitude.toFixed(4)}, Long: {device.location.longitude.toFixed(4)}
              </div>
            </div>
          </div>

          <div style={modalStyles.section}>
            <div style={modalStyles.sectionHeader}>
              <AnalyticsIcon style={modalStyles.sectionIcon} />
              <h3 style={modalStyles.sectionTitle}>Sensor Readings</h3>
            </div>
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
                    <div style={{
                      ...modalStyles.sensorIconWrapper,
                      ...(sensor.alert ? modalStyles.sensorIconAlert : modalStyles.sensorIconNormal)
                    }}>
                      {sensor.icon}
                    </div>
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

          {/* Historical Data Button */}
          <button 
            style={modalStyles.historyButton}
            onClick={handleViewHistoricalData}
          >
            <AnalyticsIcon style={modalStyles.historyButtonIcon} />
            View Historical Data
          </button>

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
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e5e7eb',
  },
  titleWithIcon: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  titleIcon: {
    color: '#3b82f6',
    fontSize: '24px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2a37',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: '20px',
  },
  deviceInfo: {
    display: 'grid',
    gap: '12px',
    marginBottom: '20px',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
  },
  infoLabel: {
    fontWeight: '600',
    color: '#6b7280',
    fontSize: '14px',
  },
  infoValue: {
    color: '#1f2a37',
    fontSize: '14px',
    fontWeight: '600',
  },
  section: {
    marginBottom: '20px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  sectionIcon: {
    color: '#374151',
    fontSize: '18px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#374151',
    margin: 0,
  },
  locationCard: {
    backgroundColor: '#f8fafc',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  locationName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2a37',
    marginBottom: '4px',
  },
  coordinates: {
    fontSize: '12px',
    color: '#64748b',
  },
  sensorGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  sensorCard: {
    padding: '16px',
    borderRadius: '8px',
    border: '2px solid',
  },
  sensorCardNormal: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  sensorCardAlert: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  sensorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  sensorIconWrapper: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensorIconNormal: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
  },
  sensorIconAlert: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },
  sensorTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  sensorValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2a37',
    marginBottom: '4px',
  },
  sensorValueAlert: {
    color: '#dc2626',
  },
  sensorUnit: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: '2px',
  },
  sensorHelper: {
    fontSize: '12px',
    color: '#6b7280',
  },
  sensorHelperAlert: {
    color: '#dc2626',
    fontWeight: '500',
  },
  historyButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
  },
  historyButtonIcon: {
    fontSize: '18px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb',
  },
  lastUpdated: {
    fontSize: '12px',
    color: '#6b7280',
  },
  closeBtn: {
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
  },
};

export default IotDetailModal;