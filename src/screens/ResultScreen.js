// src/screens/ResultScreen.js
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Modal } from 'react-native';


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
  } = route.params ?? {};

  const levelLabel = confidence >= 60 ? 'High' : 'Low';

  return (
    // 👇 Safe area so the header is not under the status bar / camera hole
    <SafeAreaView style={s.container} edges={['top', 'left', 'right']}>
      <View style={s.header}>
        <Pressable onPress={() => nav.goBack()} style={s.backBtn}>
          <Text style={s.backTxt}>‹</Text>
        </Pressable>
        <Text style={s.title}>AI Result</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={s.card}>
        <View style={s.row}>
          <Image source={{ uri: photoUri }} style={s.thumb} />
          <View style={s.confBox}>
            <View style={s.circle}>
              <Text style={s.level}>{levelLabel}</Text>
              <Text style={s.score}>{Number(confidence).toFixed(0)}</Text>
              <Text style={s.scoreSub}>Confidence</Text>
            </View>
          </View>
        </View>

        <Text style={s.name}>{plantName || 'Unknown Plant'}</Text>
        <Text style={s.info}>Confidence Score: {Number(confidence).toFixed(1)}%</Text>
        <Text style={s.info}>Location: {locationName || 'Unknown location'}</Text>
        <Text style={s.info}>Region: {region || '—'}</Text>
        <Text style={s.info}>Conservation Status: {conservationStatus || '—'}</Text>

        <Text style={s.meta}>
          Uploaded by {uploadedBy || 'You'}{'\n'}{uploadDate}
        </Text>

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
            Are you sure you want to send this plant for <Text style={{ fontWeight: '700' }}>admin review</Text>?
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

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: {
    height: 56,
    backgroundColor: '#EEE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backTxt: { fontSize: 24, color: '#333' },
  title: { fontWeight: '700', color: '#333' },

  card: { margin: 12, backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 96, height: 96, borderRadius: 8, marginRight: 12 },
  confBox: { flex: 1, alignItems: 'center' },
  circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 10,
    borderColor: '#B9EAC3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  level: { color: '#6DAF7A', fontWeight: '700', marginBottom: 2 },
  score: { fontSize: 28, fontWeight: '800', color: '#2b2b2b', lineHeight: 30 },
  scoreSub: { color: '#777' },

  name: { marginTop: 12, fontSize: 18, fontWeight: '800', color: '#2b2b2b' },
  info: { color: '#333', marginTop: 4 },
  meta: { color: '#777', marginTop: 10 },

  flagBtn: {
    marginTop: 16,
    backgroundColor: '#E74C3C',
    borderRadius: 22,
    alignItems: 'center',
    paddingVertical: 12,
  },
  flagTxt: { color: '#fff', fontWeight: '800' },

  modalBg: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  alignItems: 'center',
  justifyContent: 'center',
},
modalBox: {
  width: '80%',
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 20,
  elevation: 4,
},
modalTitle: { fontWeight: '800', fontSize: 18, marginBottom: 10 },
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
  backgroundColor: '#E74C3C',
},
confirmTxt: { color: '#fff', fontWeight: '800' },

});

