import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
// ❌ We no longer need useNavigation here for logout
// import { useNavigation } from '@react-navigation/native';

// ⬇️ *** IMPORT useAuth *** ⬇️
import { useAuth } from '../context/AuthContext';

import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminFlagUnsureScreen from '../screens/admin/AdminFlagUnsureScreen';
import AdminHeatmapScreen from '../screens/admin/AdminHeatmapScreen';
import AdminActivityScreen from '../screens/admin/AdminActivityScreen';
import AdminIotScreen from '../screens/admin/AdminIotScreen';
import {
  ADMIN_USERS,
  ADMIN_FLAG_UNSURE,
  ADMIN_HEATMAP,
  ADMIN_IOT,
  ADMIN_ACTIVITY,
} from './routes';
import AdminSupportAgent from '../screens/admin/components/AdminSupportAgent';

const Drawer = createDrawerNavigator();

// ❌ We no longer need this static profile
// const ADMIN_PROFILE = { ... };
// const ADMIN_INITIALS = ...;

function AdminDrawerContent(props) {
  // ⬇️ *** GET THE REAL USER AND LOGOUT FUNCTION *** ⬇️
  const { user, logout } = useAuth();
  
  // This is a "safe" fallback in case user is null
  const safeUser = user || { username: 'Admin', role_name: 'Admin', email: '' };

  // Generate initials from the REAL user's name
  const adminInitials = safeUser.username
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || 'AD';

  // ⬇️ *** THIS IS THE FIX *** ⬇️
  // The logout button now *only* calls the logout function from context.
  // RootNavigator will handle the screen change.
  const handleLogout = () => {
    logout();
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScrollContainer}>
      <View style={styles.profileContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{adminInitials}</Text>
        </View>
        {/* ⬇️ *** Show the REAL user's info *** ⬇️ */}
        <Text style={styles.profileName}>{safeUser.username}</Text>
        <Text style={styles.profileRole}>{safeUser.role_name}</Text>
        <Text style={styles.profileEmail}>{safeUser.email}</Text>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7} accessibilityRole="button">
          <Ionicons name="log-out-outline" size={18} color="#1E2D3D" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

        <View style={styles.drawerListWrapper}>
          <DrawerItemList {...props} />
        </View>

      <View style={styles.drawerFooter}>
        <Text style={styles.footerText}>SmartPlant Admin Console</Text>
        <Text style={styles.footerSubtext}>Version 1.0.0</Text>
      </View>
    </DrawerContentScrollView>
  );
}

// (The rest of the file is unchanged)
const drawerScreens = [
  {
    name: ADMIN_ACTIVITY,
    label: 'Activity',
    component: AdminActivityScreen,
  },
  {
    name: ADMIN_USERS,
    label: 'Users',
    component: AdminUsersScreen,
  },
  {
    name: ADMIN_FLAG_UNSURE,
    label: 'Flag Unsure',
    component: AdminFlagUnsureScreen,
  },
  {
    name: ADMIN_HEATMAP,
    label: 'Heatmap',
    component: AdminHeatmapScreen,
  },
  {
    name: ADMIN_IOT,
    label: 'IoT Monitoring',
    component: AdminIotScreen,
  },
];

export default function AdminNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName={ADMIN_USERS}
      drawerContent={(props) => <AdminDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleStyle: { color: '#1E2D3D', fontSize: 18, fontWeight: '700' },
        headerTintColor: '#1E2D3D',
        headerShadowVisible: false,
        sceneContainerStyle: { backgroundColor: '#FFFFFF' },
        drawerType: 'front',
          drawerStyle: { width: 256, backgroundColor: '#FFFFFF', paddingVertical: 0 },
          drawerInactiveTintColor: '#51606C',
          drawerActiveTintColor: '#FFFFFF',
          drawerActiveBackgroundColor: '#1E88E5',
          drawerItemStyle: { marginVertical: 0, borderRadius: 0 },
          drawerContentContainerStyle: { paddingLeft: 0, paddingRight: 0 },
          drawerLabelStyle: { fontSize: 15, fontWeight: '500', marginLeft: -12 },
      }}
    >
        {drawerScreens.map((screen) => (
          <Drawer.Screen
            key={screen.name}
            name={screen.name}
            options={{
              title: screen.label,
            }}
          >
            {(props) => (
              <View style={{ flex: 1 }}>
                <screen.component {...props} />
                <AdminSupportAgent />
              </View>
            )}
          </Drawer.Screen>
        ))}
    </Drawer.Navigator>
  );
}

// (Styles are unchanged)
const styles = StyleSheet.create({
  drawerScrollContainer: {
    flexGrow: 1,
    paddingTop: 0,
    backgroundColor: '#FFFFFF',
  },
  profileContainer: {
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F5',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1E88E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E2D3D',
  },
  profileRole: {
    marginTop: 4,
    fontSize: 13,
    color: '#71808E',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  profileEmail: {
    marginTop: 6,
    fontSize: 12,
    color: '#8794A0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#EEF2F8',
    gap: 8,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E2D3D',
  },
  drawerListWrapper: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 0,
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F5',
    backgroundColor: '#FFFFFF',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E2D3D',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footerSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#51606C',
  },
});