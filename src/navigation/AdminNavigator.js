import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminFlagUnsureScreen from '../screens/admin/AdminFlagUnsureScreen';
import AdminHeatmapScreen from '../screens/admin/AdminHeatmapScreen';
import AdminIotScreen from '../screens/admin/AdminIotScreen';
import { ADMIN_USERS, ADMIN_FLAG_UNSURE, ADMIN_HEATMAP, ADMIN_IOT } from './routes';

const Drawer = createDrawerNavigator();

const ADMIN_PROFILE = {
  name: 'Flora Administrator',
  role: 'Super Admin',
  email: 'flora.admin@smartplant.dev',
};

const ADMIN_INITIALS = ADMIN_PROFILE.name
  .split(' ')
  .filter(Boolean)
  .map((part) => part[0]?.toUpperCase() ?? '')
  .join('')
  .slice(0, 2) || 'AD';

function AdminDrawerContent(props) {
  const navigation = useNavigation();

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScrollContainer}>
      <View style={styles.profileContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{ADMIN_INITIALS}</Text>
        </View>
        <Text style={styles.profileName}>{ADMIN_PROFILE.name}</Text>
        <Text style={styles.profileRole}>{ADMIN_PROFILE.role}</Text>
        <Text style={styles.profileEmail}>{ADMIN_PROFILE.email}</Text>
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
        <Text style={styles.footerSubtext}>Mock data - backend coming soon</Text>
      </View>
    </DrawerContentScrollView>
  );
}

const drawerScreens = [
  {
    name: ADMIN_USERS,
    label: 'Users',
    icon: 'people-outline',
    component: AdminUsersScreen,
  },
  {
    name: ADMIN_FLAG_UNSURE,
    label: 'Flag Unsure',
    icon: 'flag-outline',
    component: AdminFlagUnsureScreen,
  },
  {
    name: ADMIN_HEATMAP,
    label: 'Heatmap',
    icon: 'map-outline',
    component: AdminHeatmapScreen,
  },
  {
    name: ADMIN_IOT,
    label: 'IoT Monitoring',
    icon: 'pulse-outline',
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
        drawerStyle: { width: 256, backgroundColor: '#FFFFFF' },
        drawerInactiveTintColor: '#51606C',
        drawerActiveTintColor: '#1E88E5',
        drawerActiveBackgroundColor: '#E6F2FE',
        drawerLabelStyle: { fontSize: 15, fontWeight: '500', marginLeft: -12 },
        drawerItemStyle: { borderRadius: 10, marginVertical: 2 },
      }}
    >
      {drawerScreens.map((screen) => (
        <Drawer.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={{
            title: screen.label,
            drawerIcon: ({ color, size }) => (
              <Ionicons name={screen.icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Drawer.Navigator>
  );
}

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
    paddingHorizontal: 12,
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
