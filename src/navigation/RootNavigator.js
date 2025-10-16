// src/navigation/RootNavigator.js
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ROOT_TABS, TAB_HOME, TAB_IDENTIFY } from './routes';

// screens
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import IdentifyScreen from '../screens/IdentifyScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CameraScreen from '../screens/CameraScreen';
import PreviewScreen from '../screens/PreviewScreen';
import ResultScreen from '../screens/ResultScreen';
import FlagUnsureScreen from '../screens/FlagUnsureScreen';
import ObservationDetailScreen from '../screens/ObservationDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/** --- Layout constants (tweak freely, no logic impact) --- */
const BAR_HEIGHT = 68;
const FAB_SIZE = 84;        // ✅ bigger button (was 68)
const FAB_BORDER = 6;
const FAB_RADIUS = FAB_SIZE / 2;
const FAB_LIFT = FAB_RADIUS + 12;

function Tabs() {
  return (
    <Tab.Navigator
      initialRouteName={TAB_HOME}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: '#6DAF7A',
        tabBarInactiveTintColor: '#9AA3A7',
        tabBarStyle: styles.floatingBar,
        tabBarItemStyle: styles.tabItem,   // ✅ centers icons vertically
      }}
    >
      <Tab.Screen
        name={TAB_HOME}
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="search" size={24} color={color} />
          ),
        }}
      />

      {/* BIG center Scan button that overlaps the bar */}
      <Tab.Screen
        name={TAB_IDENTIFY}
        component={IdentifyScreen}
        options={{
          tabBarIcon: () => null, // icon is rendered inside custom button
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              activeOpacity={0.9}
              style={[styles.fabHitbox, { top: -FAB_LIFT }]} // ✅ visually centered overlap
              accessibilityRole="button"
              accessibilityLabel="Identify"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View style={styles.fab}>
                <Ionicons name="scan" size={28} color="#fff" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="map" size={24} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={ROOT_TABS} screenOptions={{ headerShown: false }}>
        {/* Tabs container */}
        <Stack.Screen name={ROOT_TABS} component={Tabs} />

        {/* Flow screens on top of tabs */}
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="Preview" component={PreviewScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="FlagUnsure" component={FlagUnsureScreen} />
        <Stack.Screen name="ObservationDetail" component={ObservationDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  floatingBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 15,
    height: BAR_HEIGHT,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderTopWidth: 0,
    // subtle internal padding so icons sit perfectly centered
    paddingTop: Platform.OS === 'ios' ? 10 : 6,
    paddingBottom: Platform.OS === 'ios' ? 14 : 10,
    // modern shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.10,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 12 },
    }),
  },

  // Centers each tab item vertically regardless of bar height
  tabItem: {
    height: BAR_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Touch container for the FAB (positioned above the bar)
  fabHitbox: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },

  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_RADIUS,
    backgroundColor: '#6DAF7A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: FAB_BORDER,
    borderColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.20,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 14 },
    }),
  },
});
