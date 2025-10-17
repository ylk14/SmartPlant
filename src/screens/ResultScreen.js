// src/screens/ResultScreen.js
import React, { useState, useMemo } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Modal } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  red:   '#E74C3C',
  amber: '#F4C542',
  green: '#4CAF50',
  ink:   '#2b2b2b',
  gray:  '#777',
  card:  '#FFFFFF',
  bg:    '#F7F7F7',
  muted: '#EEE',
};

function getConfidenceVisual(score = 0) {
  const n = Number(score) || 0;
  if (n < 40)  return { label: 'Low',    color: COLORS.red   };
  if (n < 70)  return { label: 'Medium', color: COLORS.amber };
  return        { label: 'High',  color: COLORS.green };
}

export default function ResultScreen() {
  const nav = useNavigation();
  const route = useRoute();
  const [showModal, setShowModal] = useState(false);

  const {
    plantName,
    confidence,
    conservationStatus,
    region,
    locationName,
    uploadedBy,
    uploadDate,
    photoUri,
    lowConfidence,

    // optional extras
    scientificName,
    commonName,
    speciesId,
  } = route.params ?? {};

  const { label: levelLabel, color: levelColor } = useMemo(
    () => getConfidenceVisual(confidence),
    [confidence]
  );

  const endangered =
    typeof conservationStatus === 'string' &&
    conservationStatus.toLowerCase().includes('endangered');

  return (
    <SafeAreaView style={s.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => nav.goBack()} style={s.backBtn}>
          <Text style={s.backTxt}>‹</Text>
        </Pressable>
        <Text style={s.title}>AI Result</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Card */}
      <View style={s.card}>
        <View style={s.topRow}>
          <Image source={{ uri: photoUri }} style={s.thumb} />
          <View style={s.confBox}>
            <View style={[s.circle, { borderColor: levelColor }]}>
              <Text style={[s.level, { color: levelColor }]}>{levelLabel}</Text>
              <Text style={[s.score, { color: levelColor }]}>{Number(confidence).toFixed(0)}</Text>
              <Text style={s.scoreSub}>Confidence</Text>
            </View>
          </View>
        </View>

        {/* Names */}
        <View style={{ marginTop: 10 }}>
          <Text style={s.commonName}>
            {commonName || plantName || 'Unknown Plant'}
          </Text>

          {(scientificName || plantName) && (
            <View style={s.scienceRow}>
              <Text style={s.scienceName}>
                <Text style={{ fontStyle: 'italic' }}>
                  {scientificName || plantName}
                </Text>
                {speciesId ? `  •  ID: ${speciesId}` : ''}
              </Text>

              {endangered && (
                <View style={s.badgeDanger}>
                  <Text style={s.badgeDangerTxt}>Endangered</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Meta */}
        <View style={s.metaList}>
          <InfoRow label="Confidence Score" value={`${Number(confidence).toFixed(1)}%`} />
          <InfoRow label="Location" value={locationName || 'Unknown location'} />
          <InfoRow label="Region" value={region || '—'} />
          <InfoRow label="Conservation Status" value={conservationStatus || '—'} />
        </View>

        <Text style={s.uploadMeta}>
          Uploaded by {uploadedBy || 'You'}
          {'\n'}
          {uploadDate}
        </Text>

        {/* Low-confidence flow */}
        {lowConfidence && (
          <>
            <Pressable style={s.flagBtn} onPress={() => setShowModal(true)}>
              <Text style={s.flagTxt}>Flag As Unsure</Text>
            </Pressable>

            <Modal
              visible={showModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowModal(false)}
            >
              <View style={s.modalBg}>
                <View style={s.modalBox}>
                  <Text style={s.modalTitle}>Flag As Unsure</Text>
                  <Text style={s.modalText}>
                    Are you sure you want to send this plant for{' '}
                    <Text style={{ fontWeight: '700' }}>admin review</Text>?
                  </Text>

                  <View style={s.modalBtns}>
                    <Pressable onPress={() => setShowModal(false)} style={s.cancelBtn}>
                      <Text style={s.cancelTxt}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setShowModal(false);
                        nav.navigate('FlagUnsure', { plantName, photoUri });
                      }}
                      style={s.confirmBtn}
                    >
                      <Text style={s.confirmTxt}>Confirm</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

/* --- tiny component for neat rows --- */
function InfoRow({ label, value }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    height: 56,
    backgroundColor: '#F0F0F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backTxt: { fontSize: 24, color: '#333' },
  title: { fontWeight: '800', color: '#333' },

  card: {
    margin: 12,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },

  topRow: { flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 110, height: 110, borderRadius: 12, marginRight: 14, backgroundColor: '#DDD' },
  confBox: { flex: 1, alignItems: 'center' },
  circle: {
    width: 150, height: 150,
    borderRadius: 75,
    borderWidth: 12,            // ring thickness
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  level: { fontWeight: '800', marginBottom: 2 },
  score: { fontSize: 30, fontWeight: '900', lineHeight: 32 },
  scoreSub: { color: COLORS.gray },

  commonName: { fontSize: 18, fontWeight: '900', color: COLORS.ink },
  scienceRow: { marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  scienceName: { color: '#555' },

  badgeDanger: {
    backgroundColor: '#FCE7E9',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeDangerTxt: { color: '#C22534', fontWeight: '800', fontSize: 12 },

  metaList: { marginTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.muted, paddingTop: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  infoLabel: { color: '#666' },
  infoValue: { color: COLORS.ink, fontWeight: '700' },

  uploadMeta: { color: COLORS.gray, marginTop: 10 },

  flagBtn: {
    marginTop: 16,
    backgroundColor: COLORS.red,
    borderRadius: 24,
    alignItems: 'center',
    paddingVertical: 12,
  },
  flagTxt: { color: '#fff', fontWeight: '900' },

  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    width: '82%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    elevation: 4,
  },
  modalTitle: { fontWeight: '900', fontSize: 18, marginBottom: 10 },
  modalText: { color: '#333', fontSize: 15, marginBottom: 20 },
  modalBtns: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  cancelTxt: { color: '#333', fontWeight: '700' },
  confirmBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.red,
  },
  confirmTxt: { color: '#fff', fontWeight: '800' },
});
