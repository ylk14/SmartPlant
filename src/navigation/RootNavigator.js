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
      }}
    >
      <Tab.Screen
        name={TAB_HOME}
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
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
            <TouchableOpacity {...props} activeOpacity={0.9} style={styles.fabHitbox}>
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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={ROOT_TABS}
        screenOptions={{ headerShown: false }}
      >
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

const BAR_HEIGHT = 70;

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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 12 },
    }),
  },
  fabHitbox: {
    top: -28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#6DAF7A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 14 },
    }),
  },
});
