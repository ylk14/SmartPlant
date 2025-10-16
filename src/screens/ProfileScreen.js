// src/screens/ProfileScreen.js
import React, { useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, Pressable } from 'react-native';
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

  const headerHeight = useMemo(() => 170, []);

  const renderItem = ({ item }) => {
    // Accept either remote URL (string) or local require()
    const imgSource =
      typeof item.photoUri === 'string' ? { uri: item.photoUri } : item.photoUri;

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
        android_ripple={{ color: '#00000018' }}
      >
        <Image source={imgSource} style={s.cardImage} />
        <View style={s.cardBody}>
          <Text numberOfLines={1} style={s.cardTitle}>{item.speciesName}</Text>
          <Text style={s.cardMeta}>{fmt(item.createdAt)}</Text>
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
          <Image source={{ uri: mockUser.avatar }} style={s.avatar} />
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
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
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
    height: 140,
    backgroundColor: '#93C3A0',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: { alignItems: 'center', justifyContent: 'center' },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    borderWidth: 3, borderColor: '#fff',
    marginBottom: 8, backgroundColor: '#ddd',
  },
  name: { fontSize: 18, fontWeight: '800', color: '#2b2b2b' },
  uid: { color: '#325243', marginTop: 2, opacity: 0.9 },

  sectionTitle: {
    marginTop: 8, paddingHorizontal: 16,
    fontSize: 16, fontWeight: '800', color: '#335a44',
  },

  card: {
    marginTop: 12, backgroundColor: '#fff',
    borderRadius: 14, overflow: 'hidden', elevation: 1,
  },
  cardImage: { width: '100%', height: 180 },
  cardBody: { paddingHorizontal: 12, paddingVertical: 10 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#2b2b2b' },
  cardMeta: { marginTop: 4, color: '#666' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 18, fontWeight: '800', color: '#2b2b2b' },
  emptySub: { marginTop: 6, color: '#666' },
});
