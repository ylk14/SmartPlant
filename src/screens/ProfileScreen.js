import React, { useCallback, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, Pressable, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// ⬇️ *** STEP 1: Import useAuth *** ⬇️
import { useAuth } from '../context/AuthContext';
import { fetchUserPosts } from '../../services/api';

// ⬇️ *** STEP 2: REMOVE THE BYPASS *** ⬇️
// const TEMP_USER_ID = '1'; // No longer needed!

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

  // ⬇️ *** STEP 3: Get the REAL user and logout function from context *** ⬇️
  const { user, logout } = useAuth();

  // ⬇️ *** We no longer need local 'user' state, context handles it! *** ⬇️
  // const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // ⬇️ *** STEP 4: Simplify data loading *** ⬇️
  const loadProfileData = () => {
    // If no user from context, do nothing.
    if (!user) {
      setLoading(false);
      return;
    }
    
    setError(null);
    setLoading(true);
    
    // We *already have* the user profile from context,
    // so we ONLY need to fetch their posts!
    
    // We pass the REAL user's ID now
    fetchUserPosts(user.user_id)
    .then((postsData) => {
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

  // ⬇️ *** STEP 5: Update the 'useFocusEffect' hook *** ⬇️
  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [user]) // Re-run this effect if the 'user' object from context changes
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProfileData();
  };

  // ⬇️ *** STEP 6: Update the 'openObservation' function *** ⬇️
  // (This is the fix we made earlier, just keeping it)
  const openObservation = (item) =>
    nav.navigate('ObservationDetail', {
      photoUri: item.photo_url,
      createdAt: item.created_at,
      speciesName: item.species_name,
      commonName: item.common_name,
      scientificName: item.scientific_name,
      latitude: item.latitude,
      longitude: item.longitude,
      notes: item.notes,
      uploadedBy: item.uploadedBy,
      observation_id: item.observation_id,
      user_id: item.user_id,
    });


  const renderItem = ({ item }) => {
    const imgSource = item.photo_url ? { uri: item.photo_url } : null;

    const initials = (item.uploadedBy || user?.username || '?')
      .slice(0, 2)
      .toUpperCase();

    return (
      <View style={s.post}>
        <Pressable
          style={s.imageWrap}
          onPress={() => openObservation(item)} // Pass item
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
              onPress={() => openObservation(item)} // Pass item
              android_ripple={{ color: '#00000010', borderless: false }}
            >
              <Text style={s.viewButtonText}>View</Text>
            </Pressable>
          </View>
          {/* <Text style={s.postMeta}>
            {item.location_name ? item.location_name : 'Location not recorded'}
          </Text> */}
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
        
        {/* ⬇️ *** STEP 7: This section now just works! *** ⬇️ */}
        {/* It automatically uses the 'user' from the context */}
        {user ? (
          <>
            <View style={s.headerRow}>
              <View style={s.profileInfo}>
                <Image 
                  source={user.avatar ? { uri: user.avatar } : null} 
                  style={s.avatar} 
                />
                <View>
                  <Text style={s.name}>{user.username}</Text>
                  <Text style={s.uid}>UID: {user.user_id}</Text>
                </View>
              </View>
              
              {/* ⬇️ *** BONUS: Replaced Settings with a working Logout button *** ⬇️ */}
              <Pressable
                style={s.settingsButton}
                onPress={logout} // This logs the user out
                accessibilityRole="button"
              >
                {/* Changed icon to a red log-out icon */}
                <Ionicons name="log-out-outline" size={22} color="#B91C1C" />
              </Pressable>
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
    backgroundColor: '#FEE2E2', // Changed color for logout
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