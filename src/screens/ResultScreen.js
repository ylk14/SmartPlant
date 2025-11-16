// src/screens/ResultScreen.js
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, CommonActions, useRoute } from '@react-navigation/native';
import {
  ROOT_TABS,
  TAB_HOME,
  TAB_IDENTIFY,
} from '../navigation/routes';
import {
  flagObservationUnsure,
  confirmObservationLooksCorrect,
} from '../../services/api';

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

const normConf = v => {
  const n = Number(v ?? 0);
  if (!isFinite(n)) return 0;
  return n > 1 ? n / 100 : Math.max(0, Math.min(1, n));
};
const formatConfidence = v => `${Math.round(normConf(v) * 100)}%`;
const keyify = s => String(s || '').trim().toLowerCase();

export default function ResultScreen() {
  const nav = useNavigation();
  const route = useRoute(); // This hook gets the route object
  const [isLoading, setIsLoading] = useState(false);

  const { photo, result } = route.params ?? {};
  const autoFlagged = !!result?.auto_flagged;
  const thresholdPct = Math.round(100 * (result?.threshold ?? 0.6));
  const clamp = v => Math.max(0, Math.min(1, Number(v) || 0));
  const confPct = Math.round(100 * clamp(result?.primary?.confidence));
  // // temporary debug
  // if (__DEV__) {
  //   console.log('[ResultScreen] result shape:', {
  //     hasCandidates: Array.isArray(result?.candidates),
  //     hasTopk: Array.isArray(result?.topk),
  //     hasTop_k: Array.isArray(result?.top_k),
  //     hasResults: Array.isArray(result?.results),
  //     species_name: result?.species_name,
  //     confidence: result?.confidence,
  //   });
  // }

  const observation_id = result?.observation_id ?? route.params?.observationId ?? null;

  // Build a unified top_k list from either result.top_k or result.results
  const topK = useMemo(() => {
    // collect all possible sources
    const arrCandidates = Array.isArray(result?.candidates) ? result.candidates : [];
    const arrTopk       = Array.isArray(result?.topk) ? result.topk : [];
    const arrTop_k      = Array.isArray(result?.top_k) ? result.top_k : [];
    const arrResults    = Array.isArray(result?.results) ? result.results : [];

    // map the ones that usually have confidence
    const mapWithConf = (arr) => arr.map(it => ({
      species: it.species || it.species_name || it.scientific_name || it.common_name || it.name || 'Unknown',
      confidence: normConf(it.confidence ?? it.score ?? it.prob ?? it.probability ?? it.p ?? it.value ?? 0),
    }));

    const fromConfSources = [
      ...mapWithConf(arrCandidates),
      ...mapWithConf(arrTopk),
      ...mapWithConf(arrTop_k),
    ];

    // index best confidence per species
    const confBySpecies = new Map();
    for (const r of fromConfSources) {
      const k = keyify(r.species);
      const prev = confBySpecies.get(k) ?? 0;
      if (r.confidence > prev) confBySpecies.set(k, r.confidence);
    }

    // bring in results, filling confidence from the map if missing
    const fromResults = arrResults.map(it => {
      const species = it.scientific_name || it.species_name || it.common_name || it.name || 'Unknown';
      const k = keyify(species);
      const conf = normConf(it.confidence ?? confBySpecies.get(k) ?? 0);
      return { species, confidence: conf };
    });

    // union all species, keep max confidence
    const union = [...fromConfSources, ...fromResults];
    const best = new Map();
    for (const r of union) {
      const k = keyify(r.species);
      const prev = best.get(k) ?? { species: r.species, confidence: 0 };
      if (r.confidence > prev.confidence) best.set(k, { species: r.species, confidence: r.confidence });
    }

    // sorted, highest first
    return Array.from(best.values()).sort((a, b) => b.confidence - a.confidence);
  }, [result]);

  if (__DEV__) console.log('[ResultScreen] topK:', topK);

  // Always produce a safe topMatch using topK first, then root fallback
  const topMatch = useMemo(() => {
    if (topK.length > 0) {
      return { species_name: topK[0].species, confidence: topK[0].confidence };
    }
    if (result?.species_name) {
      return { species_name: String(result.species_name), confidence: normConf(result.confidence) };
    }
    return { species_name: '', confidence: 0 };
  }, [topK, result]);

  // Dedup then take next five
  const others = useMemo(() => topK.slice(1, 6), [topK]);

  const topMatchDetails = useMemo(() => {
    const list = Array.isArray(result?.results) ? result.results : [];
    if (!list.length) return undefined;

    const needle = (topMatch.species_name || '').toLowerCase();
    if (!needle) return list[0];  // fallback

    const found = list.find(r => {
      const a = (r.scientific_name || '').toLowerCase();
      const b = (r.species_name || '').toLowerCase();
      const c = (r.common_name || '').toLowerCase();
      return a === needle || b === needle || c === needle;
    });

    return found || list[0];  // fallback to first entry if no exact match
  }, [result, topMatch]);

  // const handleFlagUnsure = async () => {
  //   if (!observation_id || isLoading) return;
  //   setIsLoading(true);
  //   try {
  //     await api.put(`/plant-observations/${observation_id}`, {
  //       status: 'pending',
  //     });
  //     nav.navigate('FlagUnsure', { observationId: observation_id, photoUri: photo?.uri });
  //   } catch (error) {
  //     console.error('Flag Unsure Error:', error);
  //     Alert.alert('Error', 'Could not submit your report.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleFlagUnsure = async () => {
    try {
      const observationId = result?.observation_id;
      console.log('[ResultScreen] topK:', topK);

      await flagObservationUnsure(observationId, { reason: 'user_flagged' });
      nav.navigate('FlagUnsure', { observationId: observation_id, photoUri: photo?.uri });
    } catch (err) {
      console.error('Flag Unsure Error:', err);
      Alert.alert('Error', 'Could not flag this observation. Please try again.');
    }
  };

  const handleConfirm = async () => {
    if (!observation_id || isLoading) return;
    setIsLoading(true);
    try {
      await confirmObservationLooksCorrect(observation_id, { source: 'user' });
      goHome();
    } catch (err) {
      console.error('Looks Correct Error:', err);
      Alert.alert('Error', 'Could not confirm this observation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  // const handleLooksCorrect = async () => {
  //   try {
  //     const observationId = result?.observation_id;
  //     await confirmObservationLooksCorrect(observationId, { source: 'user' });
  //     // update UI / navigate
  //   } catch (err) {
  //     console.error('Looks Correct Error:', err);
  //   }
  // };

  // const handleConfirm = async () => {
  //   if (!observation_id || isLoading) return;
  //   setIsLoading(true);
  //   try {
  //     await api.put(`/plant-observations/${observation_id}`, {
  //       status: 'verified',
  //     });
  //     goHome();
  //   } catch (error) {
  //     console.error('Confirm Error:', error);
  //     Alert.alert('Error', 'Could not confirm this observation.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const goHome = () => {
    nav.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: ROOT_TABS, params: { screen: TAB_HOME } }],
      })
    );
  };

  const goScanAgain = () => {
    nav.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: ROOT_TABS, params: { screen: TAB_IDENTIFY } }],
      })
    );
  };

  if (!result || !photo) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            Nothing to show
          </Text>
          <Text style={{ color: '#555' }}>
            Missing identification data. Please scan a plant again.
          </Text>
          <Pressable
            onPress={goScanAgain}
            style={[s.btn, s.btnOutline, { marginTop: 16 }]}
          >
            <Text style={[s.btnText, s.outlineTxt]}>Scan Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView contentContainerStyle={s.scrollContent}>
        <View style={s.header}>
          <Pressable onPress={goScanAgain} style={s.iconBtn}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </Pressable>
          <Text style={s.headerTitle}>Identification Result</Text>
          <Pressable onPress={goHome} style={s.iconBtn}>
            <Ionicons name="close" size={26} color="#333" />
          </Pressable>
        </View>

        <Image source={{ uri: photo?.uri }} style={s.photo} />

        {autoFlagged ? (
          <View style={s.card}>
            <Text style={s.title}>Sent for verification</Text>
            <Text style={s.description}>
              This image reached a confidence of {confPct}% which is below {thresholdPct}%.
              It was automatically submitted for expert review.
            </Text>
          </View>
        ) : (
          <View style={s.card}>
            <Text style={s.title}>
              {topMatchDetails?.common_name || topMatch.species_name || 'Unknown species'}
            </Text>
            <Text style={s.sciName}>
              {topMatch.species_name || topMatchDetails?.scientific_name || '—'}
            </Text>
            <View style={s.confidenceBox}>
              <Text style={s.confidenceLabel}>Confidence</Text>
              <Text style={s.confidenceValue}>{formatConfidence(topMatch?.confidence ?? 0)}</Text>
            </View>
            <Text style={s.description}>
              {topMatchDetails?.description || 'No description available for this species.'}
            </Text>
          </View>
        )}

        {!autoFlagged && others.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Other possible matches</Text>

            {others.map((it, idx) => (
              <View key={`${it.species}-${idx}`} style={s.altCard}>
                <View style={s.row}>
                  <Text style={s.altName} numberOfLines={1}>
                    {it.species}
                  </Text>
                  <Text style={s.altPct}>{formatConfidence(it.confidence)}</Text>
                </View>

                <View style={s.barTrack}>
                  <View style={[s.barFill, { width: formatConfidence(it.confidence) }]} />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Other matches can be listed here */}
        {/* ... */}
      </ScrollView>

      {/* ACTION BUTTONS AT THE BOTTOM */}
      <View style={s.bottomBar}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#6DAF7A" />
        ) : autoFlagged ? (
          <>
            <Pressable style={[s.btn, s.btnOutline]} onPress={goScanAgain}>
              <Text style={[s.btnText, s.outlineTxt]}>Scan Again</Text>
            </Pressable>
            <Pressable style={[s.btn, s.btnSolid]} onPress={goHome}>
              <Text style={s.btnText}>Home</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable style={[s.btn, s.btnOutline]} onPress={handleFlagUnsure}>
              <Text style={[s.btnText, s.outlineTxt]}>Flag as Unsure</Text>
            </Pressable>
            <Pressable style={[s.btn, s.btnSolid]} onPress={handleConfirm}>
              <Text style={s.btnText}>Looks Correct!</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9F4',
  },
  scrollContent: {
    paddingBottom: 110, // Space for the bottom bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  iconBtn: {
    padding: 6,
  },
  photo: {
    width: '100%',
    height: 300,
    backgroundColor: '#e0e0e0',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2A37',
    marginBottom: 4,
  },
  sciName: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#4B5563',
    marginBottom: 16,
  },
  confidenceBox: {
    backgroundColor: '#E0F2F1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  confidenceLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#00796B',
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#004D40',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24, // Extra padding for home bar
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
  },
  btn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  btnSolid: {
    backgroundColor: '#6DAF7A',
  },
  btnOutline: {
    borderWidth: 2,
    borderColor: '#6DAF7A',
  },
  btnText: {
    fontWeight: '700',
    color: '#fff',
    fontSize: 16,
  },
  outlineTxt: {
    color: '#6DAF7A',
  },
  section: { 
    marginHorizontal: 16, 
    marginBottom: 8 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#111', 
    marginBottom: 8 
  },
  altCard: {
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F7F9F8',
    marginBottom: 10,
    paddingHorizontal: 12
  },
  row: { 
  flexDirection: 'row', 
  alignItems: 'center', 
  justifyContent: 'space-between' 
},
  altName: { 
    fontSize: 15, 
    fontWeight: '500', 
    color: '#1c3b2c', 
    flexShrink: 1, 
    paddingRight: 8 
  },
  altPct: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#1c3b2c' 
  },
  barTrack: { 
    height: 8, 
    backgroundColor: '#E1E8E3', 
    borderRadius: 6, 
    marginTop: 8, 
    overflow: 'hidden' 
  },
  barFill: { 
    height: '100%', 
    backgroundColor: '#76B18A' 
  },
});
