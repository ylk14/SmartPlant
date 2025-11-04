import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const MOCK_ADMIN_CONTACT = {
  name: 'SmartPlant Support',
  email: 'support@smartplant.dev',
};

export default function SettingsScreen() {
  const navigation = useNavigation();

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Account Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Support</Text>
        <View style={styles.supportCard}>
          <Ionicons name="help-circle-outline" size={20} color="#155E75" />
          <View style={styles.supportTextBlock}>
            <Text style={styles.supportTitle}>{MOCK_ADMIN_CONTACT.name}</Text>
            <Text style={styles.supportSub}>{MOCK_ADMIN_CONTACT.email}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleLogout}
        style={styles.logoutButton}
        accessibilityRole="button"
      >
        <Ionicons name="log-out-outline" size={20} color="#B91C1C" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    backgroundColor: '#F6F9F4',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2A37',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    gap: 14,
  },
  supportTextBlock: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  supportSub: {
    fontSize: 13,
    color: '#334155',
    marginTop: 2,
  },
  logoutButton: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#B91C1C',
  },
});
