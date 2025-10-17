// src/components/ScannerOverlay.js
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedLG = Animated.createAnimatedComponent(LinearGradient);

export default function ScannerOverlay({ label = 'Scanning plant…' }) {
  const y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(y, { toValue: 0, duration: 0, useNativeDriver: true }), // jump back
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [y]);

  // move gradient line from top → bottom
  const translateY = y.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200], // adjust with your image height; overlay is centered
  });

  return (
    <View style={styles.overlay} pointerEvents="none">
      {/* darken the photo slightly */}
      <View style={styles.dim} />

      {/* scanner beam */}
      <AnimatedLG
        colors={['transparent', 'rgba(255,255,255,0.35)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.beam, { transform: [{ translateY }] }]}
      />

      <View style={styles.labelWrap}>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  beam: {
    position: 'absolute',
    width: '92%',
    height: 90,           // thickness of the beam
    borderRadius: 12,
  },
  labelWrap: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  label: { color: '#fff', fontWeight: '700' },
});
