// src/screens/CameraScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, StyleSheet as RNStyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; // ✅ correct imports
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';

export default function CameraScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();            // ✅ now available
  const camRef = useRef(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        const { granted } = await requestPermission();
        if (!granted) {
          Alert.alert('Camera permission', 'Please allow camera access to continue.');
        }
      }
    })();
  }, [permission, requestPermission]);

  const takePicture = async () => {
    try {
      if (!camRef.current) return;
      const photo = await camRef.current.takePictureAsync({ quality: 1, exif: true });
      if (photo?.uri) {
        nav.navigate('Preview', { uri: photo.uri, source: 'camera', exif: photo.exif ?? null });
      }
    } catch (e) {
      console.warn('takePicture error:', e);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Requesting permission…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Camera permission not granted.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btn}>
          <Text style={styles.btnText}>Grant</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <CameraView
        ref={camRef}
        style={RNStyleSheet.absoluteFill}
        facing={facing}
        onCameraReady={() => setIsReady(true)}
        ratio="16:9"
      />

      {/* Top bar */}
      <View style={[styles.topBar, { top: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => {if (nav.canGoBack()) {
      nav.goBack();                 
    } else {
      
      nav.reset({ index: 0, routes: [{ name: 'Identify' }] }); // <-- change 'Identify' to your real route name if needed
    }
  }}
  style={styles.backBtn}
>
          <Text style={styles.backTxt}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom capture controls */}
      <View style={[styles.bottomBar, { bottom: insets.bottom + 24 }]}>
        <TouchableOpacity
          onPress={() => setFacing(p => (p === 'back' ? 'front' : 'back'))}
          style={[styles.smallBtn, { left: 24 }]}
        >
          <Text style={styles.smallBtnText}>Flip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={takePicture}
          disabled={!isReady}
          style={[styles.snapBtn, !isReady && { opacity: 0.6 }]}
          accessibilityLabel="Take picture"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  btn: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#6DAF7A', borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '700' },

  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingTop: 8,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  backBtn: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  backTxt: { color: '#9ad3a5', fontWeight: '700', fontSize: 16 },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  snapBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#eee',
  },
  smallBtn: {
    position: 'absolute',
    bottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#00000080',
    borderRadius: 8,
  },
  smallBtnText: { color: '#fff' },
});
