import React, { useState, useEffect } from 'react';
import {
  LocalFlorist,
  People,
  Public,
  Sensors,
  Flag,
  CheckCircle,
  Warning
} from '@mui/icons-material';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalPlants: 0,
      totalUsers: 0,
      flaggedPlants: 0,
      activeSensors: 0
    },
    recentActivities: [],
    systemStatus: {
      api: 'operational',
      database: 'operational'
    }
  });

  const [loading, setLoading] = useState(true);

  // Mock data - simple and minimal
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setDashboardData({
            stats: {
              totalPlants: 1247,
              totalUsers: 5892,
              flaggedPlants: 23,
              activeSensors: 15
            },
            recentActivities: [
              { 
                id: 1, 
                user: "John Doe", 
                action: "identified", 
                plant: "Rafflesia", 
                time: "2 mins ago"
              },
              { 
                id: 2, 
                user: "System", 
                action: "flagged", 
                plant: "Orchid species", 
                time: "1 hour ago"
              },
              { 
                id: 3, 
                user: "Sensor #5", 
                action: "reported", 
                plant: "unusual reading", 
                time: "3 hours ago"
              }
            ],
            systemStatus: {
              api: 'operational',
              database: 'operational'
            }
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Styles
  const styles = {
    dashboard: {
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    },
    header: {
      marginBottom: '32px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#0f172a',
      margin: '0 0 8px 0'
    },
    subtitle: {
      fontSize: '16px',
      color: '#64748b',
      margin: '0'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    },
    statCard: {
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0'
    },
    statHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px'
    },
    statIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    plantsIcon: {
      background: '#dcfce7',
      color: '#16a34a'
    },
    usersIcon: {
      background: '#dbeafe',
      color: '#2563eb'
    },
    flagIcon: {
      background: '#fef2f2',
      color: '#dc2626'
    },
    sensorIcon: {
      background: '#f3e8ff',
      color: '#9333ea'
    },
    statTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      margin: '0'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#0f172a',
      margin: '4px 0 4px 0'
    },
    statDescription: {
      fontSize: '12px',
      color: '#64748b'
    },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '20px',
      alignItems: 'start'
    },
    card: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    },
    cardHeader: {
      padding: '16px 20px',
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc'
    },
    cardTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#0f172a',
      margin: '0'
    },
    activityList: {
      padding: '0'
    },
    activityItem: {
      padding: '12px 20px',
      borderBottom: '1px solid #f1f5f9',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px'
    },
    activityItemLast: {
      borderBottom: 'none'
    },
    activityIcon: {
      width: '24px',
      height: '24px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      marginTop: '2px'
    },
    successIcon: {
      background: '#dcfce7',
      color: '#16a34a'
    },
    warningIcon: {
      background: '#fef3c7',
      color: '#d97706'
    },
    activityContent: {
      flex: '1'
    },
    activityText: {
      fontSize: '14px',
      color: '#0f172a',
      margin: '0 0 2px 0',
      lineHeight: '1.4'
    },
    activityTime: {
      fontSize: '12px',
      color: '#64748b'
    },
    actionButtons: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      padding: '20px'
    },
    actionButton: {
      padding: '16px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      background: 'white',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease',
      textAlign: 'center'
    },
    actionButtonHover: {
      borderColor: '#2563eb',
      backgroundColor: '#eff6ff'
    },
    actionIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    userDirectoryIcon: {
      background: '#dbeafe',
      color: '#2563eb'
    },
    heatmapIcon: {
      background: '#dcfce7',
      color: '#16a34a'
    },
    iotIcon: {
      background: '#f3e8ff',
      color: '#9333ea'
    },
    flaggedIcon: {
      background: '#fef2f2',
      color: '#dc2626'
    },
    actionTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#0f172a',
      margin: '0'
    },
    statusList: {
      padding: '16px'
    },
    statusItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 0'
    },
    statusName: {
      fontSize: '14px',
      color: '#0f172a',
      fontWeight: '500'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'uppercase'
    },
    statusOperational: {
      background: '#dcfce7',
      color: '#16a34a'
    },
    statusDegraded: {
      background: '#fef3c7',
      color: '#d97706'
    },
    loadingSpinner: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
      fontSize: '16px',
      color: '#64748b'
    }
  };

  const [hoveredAction, setHoveredAction] = useState(null);

  if (loading) {
    return (
      <div style={styles.dashboard}>
        <div style={styles.loadingSpinner}>
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboard}>
      {/* Global Styles */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          * {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          }
        `}
      </style>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <p style={styles.subtitle}>
          Smart Plant Sarawak - Plant Identification System
        </p>
      </div>

      {/* Statistics Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <div style={{...styles.statIcon, ...styles.plantsIcon}}>
              <LocalFlorist style={{ fontSize: 20 }} />
            </div>
            <div>
              <h3 style={styles.statTitle}>Total Plants</h3>
              <div style={styles.statValue}>{dashboardData.stats.totalPlants.toLocaleString()}</div>
              <div style={styles.statDescription}>Species in database</div>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <div style={{...styles.statIcon, ...styles.usersIcon}}>
              <People style={{ fontSize: 20 }} />
            </div>
            <div>
              <h3 style={styles.statTitle}>Users</h3>
              <div style={styles.statValue}>{dashboardData.stats.totalUsers.toLocaleString()}</div>
              <div style={styles.statDescription}>Registered users</div>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <div style={{...styles.statIcon, ...styles.flagIcon}}>
              <Flag style={{ fontSize: 20 }} />
            </div>
            <div>
              <h3 style={styles.statTitle}>Flagged Plants</h3>
              <div style={styles.statValue}>{dashboardData.stats.flaggedPlants}</div>
              <div style={styles.statDescription}>Requiring review</div>
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statHeader}>
            <div style={{...styles.statIcon, ...styles.sensorIcon}}>
              <Sensors style={{ fontSize: 20 }} />
            </div>
            <div>
              <h3 style={styles.statTitle}>Active Sensors</h3>
              <div style={styles.statValue}>{dashboardData.stats.activeSensors}</div>
              <div style={styles.statDescription}>IoT devices online</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={styles.contentGrid}>
        {/* Left Column - Recent Activity */}
        <div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Recent Activity</h3>
            </div>
            <div style={styles.activityList}>
              {dashboardData.recentActivities.map((activity, index) => (
                <div 
                  key={activity.id}
                  style={{
                    ...styles.activityItem,
                    ...(index === dashboardData.recentActivities.length - 1 && styles.activityItemLast)
                  }}
                >
                  <div style={{
                    ...styles.activityIcon,
                    ...(activity.action === 'flagged' || activity.action === 'reported' ? styles.warningIcon : styles.successIcon)
                  }}>
                    {activity.action === 'flagged' || activity.action === 'reported' ? 
                      <Warning style={{ fontSize: 14 }} /> : 
                      <CheckCircle style={{ fontSize: 14 }} />
                    }
                  </div>
                  <div style={styles.activityContent}>
                    <p style={styles.activityText}>
                      <strong>{activity.user}</strong> {activity.action} {activity.plant}
                    </p>
                    <div style={styles.activityTime}>{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Quick Actions */}
          <div style={{...styles.card, marginBottom: '20px'}}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Quick Access</h3>
            </div>
            <div style={styles.actionButtons}>
              {[
                { 
                  id: 'user-directory', 
                  title: 'User Directory', 
                  icon: People,
                  style: 'userDirectoryIcon'
                },
                { 
                  id: 'heatmap', 
                  title: 'Heatmap', 
                  icon: Public,
                  style: 'heatmapIcon'
                },
                { 
                  id: 'iot-monitoring', 
                  title: 'IoT Monitoring', 
                  icon: Sensors,
                  style: 'iotIcon'
                },
                { 
                  id: 'flagged-plants', 
                  title: 'Flagged Plants', 
                  icon: Flag,
                  style: 'flaggedIcon'
                }
              ].map((action) => (
                <button
                  key={action.id}
                  style={{
                    ...styles.actionButton,
                    ...(hoveredAction === action.id && styles.actionButtonHover)
                  }}
                  onMouseEnter={() => setHoveredAction(action.id)}
                  onMouseLeave={() => setHoveredAction(null)}
                  onClick={() => console.log(`Navigating to: ${action.title}`)}
                >
                  <div style={{...styles.actionIcon, ...styles[action.style]}}>
                    <action.icon style={{ fontSize: 20 }} />
                  </div>
                  <div style={styles.actionTitle}>{action.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>System Status</h3>
            </div>
            <div style={styles.statusList}>
              {Object.entries(dashboardData.systemStatus).map(([key, value]) => (
                <div key={key} style={styles.statusItem}>
                  <span style={styles.statusName}>
                    {key === 'api' && 'API Server'}
                    {key === 'database' && 'Database'}
                  </span>
                  <span style={{
                    ...styles.statusBadge,
                    ...(value === 'operational' ? styles.statusOperational : styles.statusDegraded)
                  }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}