// src/screens/ProfileScreen.js
import React, { useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// ⬇️ NEW: import mock data from a single place
import { MOCK_POSTS, mockUser } from '../data/mockPlants';

function fmt(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function ProfileScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();

  const [plants] = useState(MOCK_POSTS);
  const hasPosts = plants.length > 0;

  const headerHeight = useMemo(() => 174, []);

  const renderItem = ({ item }) => {
    // Accept either remote URL (string) or local require()
    const imgSource =
      typeof item.photoUri === 'string' ? { uri: item.photoUri } : item.photoUri;

    const isEndangered = !!item.isEndangered;
    const conf = typeof item.confidence === 'number' ? item.confidence : undefined;

    // Confidence color band (non-intrusive)
    let confColor = '#9CA3AF';
    if (typeof conf === 'number') {
      if (conf >= 70) confColor = '#16A34A';       // green
      else if (conf >= 40) confColor = '#D97706';  // amber
      else confColor = '#DC2626';                  // red
    }

    return (
      <Pressable
        onPress={() =>
          nav.navigate('ObservationDetail', {
            id: item.id,
            speciesName: item.speciesName,
            scientificName: item.scientificName,
            commonName: item.commonName,
            isEndangered: item.isEndangered,
            photoUri: item.photoUri,
            createdAt: item.createdAt,
            confidence: item.confidence,
            region: item.region,
            locationName: item.locationName,
            latitude: item.latitude,
            longitude: item.longitude,
            notes: item.notes,
            uploadedBy: item.uploadedBy,
            source: item.source,
          })
        }
        style={s.card}
        android_ripple={{ color: '#00000014' }}
      >
        {/* image */}
        <View style={s.cardImageWrap}>
          <Image source={imgSource} style={s.cardImage} />
        </View>

        {/* body */}
        <View style={s.cardBody}>
          <Text numberOfLines={1} style={s.cardTitle}>
            {item.speciesName || item.commonName || 'Unknown species'}
          </Text>
          <Text style={s.cardMeta}>{fmt(item.createdAt)}</Text>

          {/* chips row (optional info) */}
          <View style={s.chipsRow}>
            {typeof conf === 'number' && (
              <View style={[s.chip, { backgroundColor: '#F1F5F9' }]}>
                <View style={[s.dot, { backgroundColor: confColor }]} />
                <Text style={s.chipText}>
                  {conf}% Confidence
                </Text>
              </View>
            )}
            {isEndangered && (
              <View style={[s.chip, { backgroundColor: '#FEE2E2' }]}>
                <View style={[s.dot, { backgroundColor: '#DC2626' }]} />
                <Text style={[s.chipText, { color: '#7F1D1D' }]}>Endangered</Text>
              </View>
            )}
            {!!item.locationName && (
              <View style={[s.chip, { backgroundColor: '#E2F3E9' }]}>
                <View style={[s.dot, { backgroundColor: '#22C55E' }]} />
                <Text style={[s.chipText, { color: '#155E3B' }]} numberOfLines={1}>
                  {item.locationName}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={s.container} edges={['top', 'left', 'right']}>
      {/* Curved header */}
      <View style={[s.headerWrap, { paddingTop: insets.top + 8 }]}>
        <View style={s.headerBg} />
          <View style={[s.headerContent, { height: headerHeight }]}>
            <View style={s.headerTopRow}>
              <Image source={{ uri: mockUser.avatar }} style={s.avatar} />
              <Pressable
                style={s.settingsButton}
                onPress={() => nav.navigate('Settings')}
                accessibilityRole="button"
              >
                <Ionicons name="settings-outline" size={22} color="#1F2A37" />
              </Pressable>
            </View>
          <Text style={s.name}>{mockUser.username}</Text>
          <Text style={s.uid}>UID: {mockUser.uid}</Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>My Plants</Text>

      {hasPosts ? (
        <FlatList
          data={plants}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={s.emptyWrap}>
          <Text style={s.emptyText}>No plants yet</Text>
          <Text style={s.emptySub}>Capture or upload a plant to see it here.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F9F4' },

  headerWrap: { backgroundColor: 'transparent' },
  headerBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 150,
    backgroundColor: '#93C3A0',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: { alignItems: 'center', justifyContent: 'center' },
  headerTopRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    marginBottom: 10,
  },
  avatar: {
    width: 86, height: 86, borderRadius: 43,
    borderWidth: 3, borderColor: '#fff',
    backgroundColor: '#E5E7EB',
  },
  settingsButton: {
    padding: 10,
    borderRadius: 999,
    backgroundColor: '#E5ECF3',
  },
  name: { fontSize: 18, fontWeight: '800', color: '#244332' },
  uid: { color: '#2E6A4C', marginTop: 2, opacity: 0.9 },

  sectionTitle: {
    marginTop: 10, paddingHorizontal: 16,
    fontSize: 16, fontWeight: '800', color: '#335a44',
  },

  listContent: { paddingHorizontal: 16, paddingBottom: 28 },

  card: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardImageWrap: {
    width: '100%',
    height: 180,
    backgroundColor: '#E8F0EA',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardBody: { paddingHorizontal: 14, paddingVertical: 12 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#233127' },
  cardMeta: { marginTop: 4, color: '#6B7280' },

  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: { fontSize: 12.5, color: '#1F2937', fontWeight: '700' },
  dot: {
    width: 6, height: 6, borderRadius: 3, marginRight: 6,
  },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 18, fontWeight: '800', color: '#2b2b2b' },
  emptySub: { marginTop: 6, color: '#666' },
});
