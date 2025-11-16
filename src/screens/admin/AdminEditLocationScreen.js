import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { updateObservationLocation } from '../../../services/api';

export default function AdminEditLocationScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { observation } = route.params || {};

  const [latitude, setLatitude] = useState(
    observation?.location_latitude != null
      ? String(observation.location_latitude)
      : ''
  );
  const [longitude, setLongitude] = useState(
    observation?.location_longitude != null
      ? String(observation.location_longitude)
      : ''
  );
  const [locationName, setLocationName] = useState(
    observation?.location_name || ''
  );
  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
        title: 'Edit Location',
        headerLeft: () => (
        <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
            marginLeft: 8,
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            }}
        >
            <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        ),
    });
    }, [navigation]);

  const handleSave = async () => {
    if (!observation || !observation.observation_id) {
      Alert.alert('Error', 'Missing observation data');
      return;
    }

    const trimmedLat = latitude.trim();
    const trimmedLon = longitude.trim();

    // Convert to numbers or null
    const latToSend =
      trimmedLat === '' ? null : Number.parseFloat(trimmedLat);
    const lonToSend =
      trimmedLon === '' ? null : Number.parseFloat(trimmedLon);

    if (
      (latToSend !== null && Number.isNaN(latToSend)) ||
      (lonToSend !== null && Number.isNaN(lonToSend))
    ) {
      Alert.alert('Invalid input', 'Latitude and longitude must be numbers');
      return;
    }

    setSaving(true);
    try {
      await updateObservationLocation(observation.observation_id, {
        latitude: latToSend,
        longitude: lonToSend,
        location_name: locationName.trim() || null,
      });

      Alert.alert('Success', 'Location updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      console.log('Update location failed:', err);
      Alert.alert('Error', 'Failed to update location');
    } finally {
      setSaving(false);
    }
  };

  const handleClearGeotag = () => {
    Alert.alert(
      'Remove geotag',
      'This will remove the stored GPS coordinates for this observation. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (!observation || !observation.observation_id) return;

            setSaving(true);
            try {
              await updateObservationLocation(observation.observation_id, {
                latitude: null,
                longitude: null,
                location_name: locationName.trim() || null,
              });

              setLatitude('');
              setLongitude('');

              Alert.alert('Done', 'Geotag removed', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (err) {
              console.log('Clear geotag failed:', err);
              Alert.alert('Error', 'Failed to remove geotag');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Edit or remove the geotag for this observation.
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Latitude</Text>
          <TextInput
            value={latitude}
            onChangeText={setLatitude}
            keyboardType="decimal-pad"
            placeholder="e.g. 1.5532"
            style={styles.input}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Longitude</Text>
          <TextInput
            value={longitude}
            onChangeText={setLongitude}
            keyboardType="decimal-pad"
            placeholder="e.g. 110.3456"
            style={styles.input}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Location name (optional)</Text>
          <TextInput
            value={locationName}
            onChangeText={setLocationName}
            placeholder="Protected habitat near Kuching"
            style={[styles.input, styles.multilineInput]}
            multiline
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={handleClearGeotag}
            disabled={saving}
          >
            <Ionicons name="trash-outline" size={16} color="#933d27" />
            <Text style={styles.clearButtonText}>Remove geotag</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={saving}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#ffffff" />
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 13,
    color: '#5B6C7C',
    marginBottom: 18,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#213547',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0D7E2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    flex: 1,
  },
  clearButton: {
    backgroundColor: '#FBE4DD',
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#933d27',
  },
  saveButton: {
    backgroundColor: '#0F4C81',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
