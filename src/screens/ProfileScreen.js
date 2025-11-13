// src/screens/ProfileScreen.js
import React, { useCallback, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, Pressable, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { fetchUserProfile, fetchUserPosts } from '../../services/api';

// This is the hardcoded ID we discussed.
const TEMP_USER_ID = '1'; 

// (fmt function is unchanged)
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

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfileData = (userId) => {
    if (!userId) {
      setError('No User ID provided.');
      setLoading(false);
      return;
    }
    
    setError(null);
    setLoading(true);
    
    Promise.all([
      fetchUserProfile(userId),
      fetchUserPosts(userId)
    ])
    .then(([profileData, postsData]) => {
      setUser(profileData);
      setPosts(postsData || []);
    })
    .catch((err) => {
      console.error("Failed to load profile data:", err);
      setError("Could not load profile. Please try again.");
    })
    .finally(() => {
      setLoading(false);
      setRefreshing(false);
    });
  };

  useFocusEffect(
    useCallback(() => {
      loadProfileData(TEMP_USER_ID);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProfileData(TEMP_USER_ID);
  };

  const renderItem = ({ item }) => {
    // Use the real 'photo_url' from your database query
    const imgSource = item.photo_url ? { uri: item.photo_url } : null;

  const openObservation = () =>
    nav.navigate('ObservationDetail', {
      // Map database names to the names ObservationDetailScreen expects
      photoUri: item.photo_url,          // <--- Fix for the image
      createdAt: item.created_at,        // <--- Fix for the date
      speciesName: item.species_name,    // <--- Fix for the main title
      
      // Pass all other data the detail screen might want
      commonName: item.common_name,
      scientificName: item.scientific_name,
      latitude: item.latitude,
      longitude: item.longitude,
      notes: item.notes,
      uploadedBy: item.uploadedBy,
      
      // You can also pass the IDs
      observation_id: item.observation_id,
      user_id: item.user_id,
    });

    const initials = (item.uploadedBy || user?.username || '?')
      .slice(0, 2)
      .toUpperCase();

    return (
      <View style={s.post}>
        <Pressable
          style={s.imageWrap}
          onPress={openObservation}
          android_ripple={{ color: '#00000018' }}
        >
          {imgSource ? (
            <Image source={imgSource} style={s.postImage} resizeMode="cover" />
          ) : (
            <View style={[s.postImage, s.imageFallback]}>
              <Ionicons name="leaf-outline" size={60} color="#94A3B8" />
            </View>
          )}
        </Pressable>

        <View style={s.postBody}>
          <View style={s.postBadgeRow}>
            <View style={s.userBadge}>
              <Text style={s.userBadgeText}>{initials}</Text>
            </View>
            <Text style={s.username}>{item.uploadedBy || user?.username}</Text>
          </View>
          <View style={s.postBodyHeader}>
            <Text numberOfLines={2} style={s.postTitle}>
              {item.species_name || 'Unknown species'}
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
            {item.latitude ? item.latitude: 'Location not recorded'}
            , {item.latitude ? item.latitude: 'Location not recorded'}
          </Text>
          <Text style={s.postTimestamp}>{fmt(item.created_at)}</Text>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[s.container, s.centered]} edges={['top', 'left', 'right']}>
        <ActivityIndicator size="large" color="#2F6C4F" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        {user ? (
          <>
            <View style={s.headerRow}>
              <View style={s.profileInfo}>
                
                {/* ⬇️ *** THIS IS THE FIX *** ⬇️ */}
                {/* We no longer require() a local asset.
                  If 'user.avatar' (the URL) exists, we show it.
                  If not, we show 'null', and the 'backgroundColor' from
                  s.avatar will just show a grey circle.
                */}
                <Image 
                  source={user.avatar ? { uri: user.avatar } : null} 
                  style={s.avatar} 
                />
                <View>
                  <Text style={s.name}>{user.username}</Text>
                  {/* Use the real 'uid' from the database */}
                  <Text style={s.uid}>UID: {user.user_id}</Text>
                </View>
                
              </View>
              {/*
              <Pressable
                style={s.settingsButton}
                onPress={() => nav.navigate('Settings')}
                accessibilityRole="button"
              >
                <Ionicons name="settings-outline" size={22} color="#1F2A37" />
              </Pressable>
              */}
            </View>

            <View style={s.statsContainer}>
              <View style={s.statBlock}>
                <Text style={s.statLabel}>Plants</Text>
                <Text style={s.statValue}>{posts.length}</Text>
              </View>
            </View>
          </>
        ) : (
          <Text style={s.errorText}>{error || "Could not load user profile."}</Text>
        )}
      </View>

      <Text style={s.sectionTitle}>My Plants</Text>

      {error && !loading && (
        <View style={s.emptyWrap}>
          <Text style={s.emptyText}>Error</Text>
          <Text style={s.emptySub}>{error}</Text>
        </View>
      )}

      {!error && !loading && posts.length > 0 && (
        <FlatList
          data={posts}
          keyExtractor={(it) => it.observation_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
      
      {!error && !loading && posts.length === 0 && (
        <ScrollView 
          contentContainerStyle={s.emptyWrap}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={s.emptyText}>No plants yet</Text>
          <Text style={s.emptySub}>
            Capture or upload a plant to see it here.
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// (Styles are unchanged)
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F9F4' },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    backgroundColor: '#E5E7EB', // This grey will show if no avatar URL
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
    backgroundColor: '#E5E7EB',
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
  },
  imageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  emptyText: { fontSize: 18, fontWeight: '800', color: '#2b2b2b' },
  emptySub: { marginTop: 6, color: '#666' },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
    textAlign: 'center',
    padding: 20,
  },
});