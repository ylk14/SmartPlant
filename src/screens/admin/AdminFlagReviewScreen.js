import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const formatDate = (iso) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
};

export default function AdminFlagReviewScreen({ route, navigation }) {
  const observation = route?.params?.observation;
  const [showImage, setShowImage] = useState(false);
  const [identifyVisible, setIdentifyVisible] = useState(false);
  const [identifiedName, setIdentifiedName] = useState('');

  if (!observation) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Observation not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => setShowImage(true)}>
          <View style={styles.photoWrapper}>
            <Image source={observation.photo} style={styles.photo} />
            <View style={styles.resizeBadge}>
              <Ionicons name="expand-outline" size={18} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>

        <Text style={styles.title}>{observation.plant_name}</Text>
        <Text style={styles.subtitle}>Observation {observation.observation_id}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Confidence</Text>
          <Text style={styles.sectionValue}>{Math.round(observation.confidence * 100)}%</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Location</Text>
          <Text style={styles.sectionValue}>{observation.location}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Submitted</Text>
          <Text style={styles.sectionValue}>{formatDate(observation.submitted_at)}</Text>
          <Text style={styles.sectionMeta}>Flagged by {observation.user}</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => Alert.alert('Approved', 'The observation has been approved.')}
          >
            <Text style={styles.approveText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.identifyButton}
            onPress={() => {
              setIdentifiedName('');
              setIdentifyVisible(true);
            }}
          >
            <Text style={styles.identifyText}>Identify</Text>
          </TouchableOpacity>
        </View>
        <Modal visible={showImage} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalCloseArea} onPress={() => setShowImage(false)} />
            <Image source={observation.photo} style={styles.modalImage} resizeMode="contain" />
            <TouchableOpacity style={styles.modalDismiss} onPress={() => setShowImage(false)}>
              <Text style={styles.modalDismissText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
        <Modal visible={identifyVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.select({ ios: 'padding', android: 'height' })}
              style={styles.identifyWrapper}
            >
              <View style={styles.identifyCard}>
                <Text style={styles.identifyTitle}>Confirm Plant Identity</Text>
                <Text style={styles.identifyLabel}>Plant Name</Text>
                <TextInput
                  style={styles.identifyInput}
                  value={identifiedName}
                  onChangeText={setIdentifiedName}
                  placeholder="Enter confirmed plant name"
                  placeholderTextColor="#94A3B8"
                  autoFocus
                  returnKeyType="done"
                />
                <View style={styles.identifyActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setIdentifyVisible(false)}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmButton, !identifiedName && styles.confirmButtonDisabled]}
                    disabled={!identifiedName}
                    onPress={() => {
                      Alert.alert('Identified', `Recorded as ${identifiedName}.`);
                      setIdentifyVisible(false);
                    }}
                  >
                    <Text style={styles.confirmText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9F4',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: 18,
  },
  photoWrapper: {
    position: 'relative',
  },
  resizeBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 16,
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2A37',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2A37',
  },
  sectionMeta: {
    fontSize: 12,
    color: '#64748B',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#22C55E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  approveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  identifyButton: {
    flex: 1,
    backgroundColor: '#1E88E5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  identifyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
    textAlign: 'center',
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  identifyWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  modalCloseArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalImage: {
    width: '100%',
    height: '70%',
    borderRadius: 12,
  },
  modalDismiss: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#1E88E5',
    borderRadius: 999,
  },
  modalDismissText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  identifyCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  identifyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  identifyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  identifyInput: {
    borderWidth: 1,
    borderColor: '#CBD5F5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  identifyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#1E88E5',
  },
  confirmButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  confirmText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
