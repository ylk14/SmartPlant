// src/screens/ProfileScreen.js
import React, { useCallback, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

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
  const [user, setUser] = useState(() => ({ ...mockUser }));

  useFocusEffect(
    useCallback(() => {
      setUser({ ...mockUser });
    }, [])
  );

  const renderItem = ({ item }) => {
    const imgSource =
      typeof item.photoUri === 'string' ? { uri: item.photoUri } : item.photoUri;

    const openObservation = () =>
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
      });

    const initials = (item.uploadedBy || user.username || '?')
      .slice(0, 2)
      .toUpperCase();

    return (
      <View style={s.post}>
        <Pressable
          style={s.imageWrap}
          onPress={openObservation}
          android_ripple={{ color: '#00000018' }}
        >
          <Image source={imgSource} style={s.postImage} resizeMode="cover" />
        </Pressable>

        <View style={s.postBody}>
          <View style={s.postBadgeRow}>
            <View style={s.userBadge}>
              <Text style={s.userBadgeText}>{initials}</Text>
            </View>
            <Text style={s.username}>{item.uploadedBy || user.username}</Text>
          </View>
          <View style={s.postBodyHeader}>
            <Text numberOfLines={2} style={s.postTitle}>
              {item.speciesName || item.commonName || 'Unknown species'}
            </Text>
            <Pressable
              style={s.viewButton}
              onPress={openObservation}
              android_ripple={{ color: '#00000010', borderless: false }}
            >
              <Text style={s.viewButtonText}>View</Text>
            </Pressable>
          </View>
          <Text style={s.postMeta}>
            {item.locationName ? item.locationName : 'Location not recorded'}
          </Text>
          <Text style={s.postTimestamp}>{fmt(item.createdAt)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <View style={s.headerRow}>
          <View style={s.profileInfo}>
            <Image source={{ uri: user.avatar }} style={s.avatar} />
            <View>
              <Text style={s.name}>{user.username}</Text>
              <Text style={s.uid}>UID: {user.uid}</Text>
            </View>
          </View>
          <Pressable
            style={s.settingsButton}
            onPress={() => nav.navigate('Settings')}
            accessibilityRole="button"
          >
            <Ionicons name="settings-outline" size={22} color="#1F2A37" />
          </Pressable>
        </View>

        <View style={s.statsContainer}>
          <View style={s.statBlock}>
            <Text style={s.statLabel}>Plants</Text>
            <Text style={s.statValue}>{plants.length}</Text>
          </View>
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
          <Text style={s.emptySub}>
            Capture or upload a plant to see it here.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F9F4' },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#F6F9F4',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
  name: { fontSize: 20, fontWeight: 'bold', color: '#244332' },
  uid: { color: '#2E6A4C', marginTop: 2, opacity: 0.9 },

  statsContainer: {
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCE9DE',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  statBlock: {
    alignItems: 'center',
  },
  statLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.6 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#244332', marginTop: 6 },

  sectionTitle: {
    marginTop: 18,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '800',
    color: '#335a44',
  },

  listContent: { paddingHorizontal: 0, paddingBottom: 48, paddingTop: 12 },

  post: {
    width: '100%',
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
  },
  imageWrap: {
    backgroundColor: '#CBD5F5',
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
  },
  postBody: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  postBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D8E9DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userBadgeText: { fontSize: 15, fontWeight: '700', color: '#24543B' },
  username: { fontSize: 15, fontWeight: '700', color: '#1F2A37' },
  postBodyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  postTitle: { flex: 1, fontSize: 17, fontWeight: '800', color: '#0F172A' },
  viewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#2F6C4F',
  },
  viewButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  postMeta: { fontSize: 13.5, fontWeight: '600', color: '#334155' },
  postTimestamp: { fontSize: 12.5, fontWeight: '600', color: '#64748B' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 18, fontWeight: '800', color: '#2b2b2b' },
  emptySub: { marginTop: 6, color: '#666' },
});
