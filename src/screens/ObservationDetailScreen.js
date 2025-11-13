// src/screens/ObservationDetailScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ROOT_TABS } from '../navigation/routes';

const LOW_CONFIDENCE_THRESHOLD = 60;

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso || '—';
  }
}

export default function ObservationDetailScreen() {
  const nav = useNavigation();
  const route = useRoute();
  const [showImage, setShowImage] = useState(false);

  // Accept a rich set of params (pass as many as you have)
  const {
    photoUri,                 // string | require() object
    speciesName,              // e.g., "Nepenthes rafflesiana"
    commonName,               // e.g., "Raffles' Pitcher Plant"
    scientificName,           // if you separate common/scientific
    isEndangered,             // boolean
    confidence,               // number
    rank,                     // optional tinyint from AI_Results
    region,                   // optional
    locationName,             // human-readable name (Plant_Observations)
    latitude,                 // number
    longitude,                // number
    notes,                    // string
    uploadedBy,               // string
    createdAt,                // iso datetime
    source,                   // 'camera' | 'library' | 'unknown'
  } = route.params ?? {};

  const showLow = typeof confidence === 'number' && confidence < LOW_CONFIDENCE_THRESHOLD;

  const openMaps = () => {
    if (latitude != null && longitude != null) {
      const params = {
        focusLatitude: latitude,
        focusLongitude: longitude,
        focusLocationName: locationName || null,
      };

        const parent = nav.getParent();

        const navigateToHeatmap = navigator => {
          if (!navigator?.navigate) return false;
          navigator.navigate(ROOT_TABS, {
            screen: 'Heatmap',
            params,
          });
          return true;
        };

        if (!navigateToHeatmap(parent)) {
          navigateToHeatmap(nav);
        }
    }
  };

  // Support both local require() and remote uri
  const imageSource =
    typeof photoUri === 'string' ? { uri: photoUri } : photoUri || undefined;

  const titleText =
    scientificName || speciesName || 'Unknown Plant';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F7F7' }} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={s.container}>

        {/* Header row */}
        <View style={s.headerRow}>
          <Pressable onPress={() => nav.goBack()} style={s.backBtn}>
            <Text style={s.backTxt}>‹ Back</Text>
          </Pressable>
          <Text style={s.headerTitle}>Observation</Text>
          <View style={{ width: 56 }} />
        </View>
        {/* Photo */}
        {imageSource ? (
          <Pressable
            onPress={() => setShowImage(true)}
            android_ripple={{ color: '#00000014' }}
            style={s.imgWrapper}
          >
            <Image source={imageSource} style={s.img} />
            <View style={s.expandBadge}>
              <Ionicons name="expand-outline" size={20} color="#FFFFFF" />
            </View>
          </Pressable>
        ) : (
          <View style={[s.img, s.imgPlaceholder]}>
            <Text style={{ color: '#888' }}>No photo</Text>
          </View>
        )}

        {/* Title & chips */}
        <View style={s.titleWrap}>
          <Text style={s.title}>{titleText}</Text>
          {!!commonName && (
            <Text style={s.subTitle}>{commonName}</Text>
          )}

          <View style={s.chipsRow}>
            {typeof confidence === 'number' && (
              <View style={[s.chip, showLow ? s.chipLow : s.chipHigh]}>
                <Text style={[s.chipTxt, { color: showLow ? '#B74D3D' : '#2E7D32' }]}>
                  {showLow ? 'Low' : 'High'} • {Math.round(confidence)}%
                </Text>
              </View>
            )}
            {isEndangered && (
              <View style={[s.chip, s.chipWarn]}>
                <Text style={[s.chipTxt, { color: '#9C2A2A' }]}>Endangered</Text>
              </View>
            )}
          </View>
        </View>

        {/* Meta info */}
        <View style={s.section}>
          <Row label="Captured on" value={fmtDate(createdAt)} />
          {!!uploadedBy && <Row label="Uploaded by" value={uploadedBy} />}
          {!!source && <Row label="Source" value={source} />}
          {!!region && <Row label="Region" value={region} />}
          {!!locationName && <Row label="Location" value={locationName} />}
          {(latitude != null && longitude != null) && (
            <View style={[s.row, { alignItems: 'center' }]}>
              <View style={s.rowLeft}>
                <Text style={s.label}>Coordinates</Text>
              </View>
              <View style={s.rowRight}>
                <Text style={s.value}>{latitude.toFixed(6)}, {longitude.toFixed(6)}</Text>
                <Pressable style={s.mapsBtn} onPress={openMaps}>
                  <Text style={s.mapsTxt}>Open in Maps</Text>
                </Pressable>
              </View>
            </View>
          )}
          {rank != null && <Row label="AI rank" value={String(rank)} />}
        </View>

        {/* Notes */}
        {!!notes && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Notes</Text>
            <Text style={s.notes}>{notes}</Text>
          </View>
        )}

        {/* (Optional) future actions: share / delete */}
        {/* <View style={s.actionsRow}>
          <Pressable style={s.primaryBtn}><Text style={s.primaryTxt}>Share</Text></Pressable>
        </View> */}
      </ScrollView>

        <Modal
          visible={showImage}
          transparent
          animationType="fade"
          onRequestClose={() => setShowImage(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowImage(false)}>
            <View style={s.modalBackdrop}>
              <TouchableWithoutFeedback>
                <View style={s.modalContent}>
                  {imageSource ? (
                    <Image source={imageSource} style={s.modalImage} resizeMode="contain" />
                  ) : null}
                  <Pressable style={s.modalCloseBtn} onPress={() => setShowImage(false)}>
                    <Text style={s.modalCloseTxt}>Close</Text>
                  </Pressable>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <View style={s.row}>
      <View style={s.rowLeft}>
        <Text style={s.label}>{label}</Text>
      </View>
      <View style={s.rowRight}>
        <Text style={s.value}>{value}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingBottom: 24 },

  headerRow: {
    height: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEE',
  },
    backBtn: { paddingHorizontal: 8, paddingVertical: 6 },
    backTxt: { color: '#2b2b2b', fontWeight: '700' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#2b2b2b' },

  imgWrapper: { position: 'relative' },
  img: {
    width: '100%',
    height: 260,
    backgroundColor: '#ddd',
  },
  imgPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 8,
    borderRadius: 16,
  },

    titleWrap: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F7F7F7' },
    title: { fontSize: 26, fontWeight: 'bold', color: '#2b2b2b' },
    subTitle: { marginTop: 4, color: '#5A6B5F', fontSize: 16 },

  chipsRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#E7F2EA' },
  chipHigh: { backgroundColor: '#E7F2EA' },
  chipLow: { backgroundColor: '#FDECEA' },
  chipWarn: { backgroundColor: '#FBE9E9' },
  chipTxt: { fontWeight: '700' },

  section: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 4,
  },
  sectionTitle: { fontWeight: '800', marginBottom: 6, color: '#2b2b2b' },

  row: { flexDirection: 'row', paddingVertical: 8 },
  rowLeft: { width: 120 },
  rowRight: { flex: 1 },
  label: { color: '#6A6A6A' },
  value: { color: '#2b2b2b', fontWeight: '600' },

  notes: { color: '#2b2b2b' },

  mapsBtn: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: '#E6F3EA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mapsTxt: { color: '#2E7D32', fontWeight: '700' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  modalImage: {
    width: '100%',
    height: '70%',
    borderRadius: 12,
  },
  modalCloseBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 999,
    backgroundColor: '#1E88E5',
  },
  modalCloseTxt: {
    color: '#fff',
    fontWeight: '700',
  },

  // actionsRow: { paddingHorizontal: 16, marginTop: 12 },
  // primaryBtn: { backgroundColor: '#6DAF7A', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  // primaryTxt: { color: '#fff', fontWeight: '800' },
});
