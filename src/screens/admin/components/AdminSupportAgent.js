import React, { useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ADMIN_AGENT_CHAT } from '../../../navigation/routes';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FAB_SIZE = 56;
const H_PADDING = 24;
const V_PADDING = 28;
const INITIAL_POSITION = { x: 0, y: 0 };

export default function AdminSupportAgent() {
  const pan = useRef(new Animated.ValueXY(INITIAL_POSITION)).current;
  const [expanded, setExpanded] = useState(false);
  const navigation = useNavigation();

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
      },
      onPanResponderMove: Animated.event([
        null,
        { dx: pan.x, dy: pan.y },
      ], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();

        const boundary = {
          minX: -SCREEN_WIDTH + FAB_SIZE + H_PADDING * 2,
          maxX: 0,
          minY: -SCREEN_HEIGHT + FAB_SIZE + V_PADDING * 2,
          maxY: 0,
        };

        const clampedX = Math.max(boundary.minX, Math.min(pan.x._value, boundary.maxX));
        const clampedY = Math.max(boundary.minY, Math.min(pan.y._value, boundary.maxY));

        Animated.spring(pan, {
          toValue: { x: clampedX, y: clampedY },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.fab, expanded && styles.fabExpanded]}
        onPress={() => setExpanded((prev) => !prev)}
      >
        <Ionicons name="sparkles-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>

        {expanded && (
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Ionicons name="sparkles" size={16} color="#2563EB" />
              <Text style={styles.cardTitle}>SmartPlant Agent</Text>
            </View>
            <Text style={styles.cardSubtitle}>
              Ask for help, triage alerts, or summarize field readings instantly.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.chatButton}
              onPress={() => navigation.navigate(ADMIN_AGENT_CHAT)}
            >
              <Text style={styles.chatButtonText}>Open AI Assistant</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    zIndex: 200,
    alignItems: 'flex-end',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabExpanded: {
    backgroundColor: '#1D4ED8',
  },
  card: {
    marginTop: 12,
    width: 220,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#475467',
    marginBottom: 12,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#2563EB',
  },
  chatButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
