import React, { useState, useEffect, useMemo } from 'react';
import IotDetailModal from '../components/IotDetailModal';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import SensorsIcon from '@mui/icons-material/Sensors';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const MOCK_IOT_DEVICES = [
  {
    device_id: 'DEV-001',
    device_id_raw: 1,
    device_name: 'Soil Monitor A1',
    species_name: 'Rafflesia arnoldii',
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
    device_id_raw: 14,
    device_name: 'Weather Station B3',
    species_name: 'Nepenthes rajah',
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
    alerts: ['humidity', 'motion'],
  },
  {
    device_id: 'DEV-020',
    device_id_raw: 20,
    device_name: 'Trail Camera C2',
    species_name: 'Dipterocarpus sarawakensis',
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
    alerts: ['soil_moisture'],
  },
];

const Iot = () => {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load data function
  const loadData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDevices(MOCK_IOT_DEVICES);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  };

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };
    
    loadInitialData();
    
    // Auto-refresh every 30 seconds
    const intervalId = setInterval(loadData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Manual refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Filter devices based on search
  const filteredDevices = useMemo(() => {
    if (!searchQuery.trim()) return devices;
    
    const normalizedQuery = searchQuery.toLowerCase();
    return devices.filter((device) => {
      const searchableText = [
        device.device_name,
        device.device_id,
        device.species_name,
        device.location.name,
      ].join(' ').toLowerCase();
      
      return searchableText.includes(normalizedQuery);
    });
  }, [searchQuery, devices]);

  // Separate alert devices
  const alertDevices = filteredDevices.filter(device => device.alerts && device.alerts.length > 0);
  const normalDevices = filteredDevices.filter(device => !device.alerts || device.alerts.length === 0);

  const handleViewDevice = (device) => {
    setSelectedDevice(device);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDevice(null);
  };

  // Resolve alerts
  const handleResolveAlerts = (deviceId) => {
    setDevices(prev => prev.map(device => 
      device.device_id === deviceId 
        ? { ...device, alerts: [] }
        : device
    ));
  };

  // Show loading state
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>IoT Monitoring</h1>
        <p style={styles.subtitle}>Real-time sensor data from all connected devices</p>
      </div>

      {/* Search Bar */}
      <div style={styles.searchBar}>
        <SearchIcon style={styles.searchIcon} />
        <input
          style={styles.searchInput}
          placeholder="Search by device, plant, or location"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            style={styles.clearButton}
            onClick={() => setSearchQuery('')}
          >
            ×
          </button>
        )}
      </div>

      {/* Refresh Button */}
      <div style={styles.refreshContainer}>
        <button 
          style={styles.refreshButton}
          onClick={onRefresh}
          disabled={refreshing}
        >
          <RefreshIcon style={styles.refreshIcon} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Alert Devices Section */}
      {alertDevices.length > 0 && (
        <div style={styles.alertSection}>
          <div style={styles.sectionHeader}>
            <div style={styles.titleWithIcon}>
              <WarningIcon style={styles.alertTitleIcon} />
              <h3 style={styles.alertTitle}>Devices with Alerts</h3>
            </div>
            <div style={styles.alertCount}>{alertDevices.length} device(s) need attention</div>
          </div>
          <div style={styles.table}>
            {alertDevices.map(device => (
              <div key={device.device_id} style={styles.alertRow}>
                <div style={styles.cell}>
                  <div style={styles.plantName}>{device.species_name}</div>
                  <div style={styles.location}>{device.location.name}</div>
                  <div style={styles.alertBadge}>
                    Alerts: {device.alerts.join(', ')}
                  </div>
                </div>
                <div style={styles.cell}>
                  <div style={styles.deviceId}>{device.device_id}</div>
                  <div style={styles.deviceName}>{device.device_name}</div>
                </div>
                <div style={styles.cell}>
                  <div style={styles.actions}>
                    <button 
                      style={styles.resolveButton}
                      onClick={() => handleResolveAlerts(device.device_id)}
                    >
                      <CheckCircleIcon style={styles.buttonIcon} />
                      Resolve
                    </button>
                    <button 
                      style={styles.viewButton}
                      onClick={() => handleViewDevice(device)}
                    >
                      <VisibilityIcon style={styles.buttonIcon} />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Normal Devices Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={styles.titleWithIcon}>
            <SensorsIcon style={styles.sectionTitleIcon} />
            <h3 style={styles.sectionTitle}>All Devices</h3>
          </div>
          <div style={styles.deviceCount}>{normalDevices.length} device(s) normal</div>
        </div>
        
        {normalDevices.length > 0 ? (
          <div style={styles.table}>
            {normalDevices.map(device => (
              <div key={device.device_id} style={styles.row}>
                <div style={styles.cell}>
                  <div style={styles.plantName}>{device.species_name}</div>
                  <div style={styles.location}>{device.location.name}</div>
                </div>
                <div style={styles.cell}>
                  <div style={styles.deviceId}>{device.device_id}</div>
                  <div style={styles.deviceName}>{device.device_name}</div>
                </div>
                <div style={styles.cell}>
                  <button 
                    style={styles.viewButton}
                    onClick={() => handleViewDevice(device)}
                  >
                    <VisibilityIcon style={styles.buttonIcon} />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            {searchQuery ? (
              <>
                <SearchIcon style={styles.emptyIcon} />
                <p style={styles.emptyText}>No devices found for "{searchQuery}"</p>
                <p style={styles.emptySubtext}>Try adjusting your search terms</p>
              </>
            ) : (
              <>
                <SensorsIcon style={styles.emptyIcon} />
                <p style={styles.emptyText}>No devices available</p>
                <p style={styles.emptySubtext}>Devices will appear here when connected</p>
              </>
            )}
          </div>
        )}
      </div>

      {isModalOpen && selectedDevice && (
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
    padding: '20px',
    backgroundColor: '#f6f9f4',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2a37',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '16px',
    maxWidth: '500px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  searchIcon: {
    color: '#64748b',
    fontSize: '20px',
    marginRight: '12px',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: '#0f172a',
    background: 'transparent',
  },
  clearButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshContainer: {
    marginBottom: '24px',
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  refreshIcon: {
    fontSize: '18px',
  },
  alertSection: {
    marginBottom: '24px',
  },
  section: {
    marginBottom: '24px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  titleWithIcon: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  alertTitleIcon: {
    color: '#dc2626',
    fontSize: '20px',
  },
  alertTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#dc2626',
    margin: 0,
  },
  sectionTitleIcon: {
    color: '#1f2a37',
    fontSize: '20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2a37',
    margin: 0,
  },
  alertCount: {
    fontSize: '12px',
    color: '#dc2626',
    fontWeight: '600',
  },
  deviceCount: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '600',
  },
  table: {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  row: {
    display: 'flex',
    padding: '16px',
    borderBottom: '1px solid #f1f5f9',
    alignItems: 'center',
    transition: 'background-color 0.2s',
  },
  alertRow: {
    display: 'flex',
    padding: '16px',
    borderBottom: '1px solid #f1f5f9',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderLeft: '4px solid #dc2626',
  },
  cell: {
    flex: 1,
    padding: '0 8px',
  },
  plantName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2a37',
    marginBottom: '4px',
  },
  location: {
    fontSize: '12px',
    color: '#64748b',
  },
  alertBadge: {
    fontSize: '11px',
    color: '#dc2626',
    fontWeight: '600',
    backgroundColor: '#fee2e2',
    padding: '2px 8px',
    borderRadius: '12px',
    marginTop: '4px',
    display: 'inline-block',
  },
  deviceId: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2a37',
    marginBottom: '4px',
  },
  deviceName: {
    fontSize: '12px',
    color: '#6b7280',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  viewButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#1e88e5',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  resolveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  buttonIcon: {
    fontSize: '16px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    color: '#9ca3af',
  },
  emptyText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
    margin: '0 0 8px 0',
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #3182ce',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '12px',
  },
};

// Add CSS for spinner
if (typeof document !== 'undefined') {
  const styleSheet = document.styleSheets[0];
  if (styleSheet) {
    try {
      styleSheet.insertRule(`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `, styleSheet.cssRules.length);
    } catch (e) {
      console.log('Could not insert spinner animation');
    }
  }
}

export default Iot;