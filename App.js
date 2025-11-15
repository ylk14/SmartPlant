import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native'; // Import NavigationContainer
import RootNavigator from './src/navigation/RootNavigator';

// ⬇️ *** IMPORT THE AUTH PROVIDER *** ⬇️
import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* ⬇️ *** WRAP YOUR APP IN THE PROVIDER *** ⬇️ */}
      <AuthProvider>
        {/* NavigationContainer should wrap the navigator */}
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}