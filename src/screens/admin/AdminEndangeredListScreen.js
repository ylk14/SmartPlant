import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// keep your weird relative paths so Metro does not cry
import { ADMIN_HEATMAP, ADMIN_ROOT } from '../../navigation/routes';
import { fetchSpeciesList } from '../../../services/api';

export default function AdminEndangeredListScreen() {
  const navigation = useNavigation();
  const [speciesList, setSpeciesList] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadSpecies = useCallback(async () => {
    try {
      setLoading(true);

      const raw = await fetchSpeciesList();
      console.log('[EndangeredList] raw species:', raw);

      const speciesArray = Array.isArray(raw)
        ? raw
        : raw && Array.isArray(raw.data)
        ? raw.data
        : [];

      console.log('[EndangeredList] normalised:', speciesArray);

      // only keep endangered ones (handles 1, '1', true, 'true')
      const endangeredOnly = speciesArray.filter((s) => {
        const v = s.is_endangered;
        return (
          Number(v) === 1 ||
          v === true ||
          v === 'true'
        );
      });

      // map into the “observation-like” shape the UI expects
      const converted = endangeredOnly.map((s) => ({
        observation_id: `species-${s.species_id}`,
        species: {
          species_id: s.species_id,
          common_name: s.common_name ?? s.display_name,
          scientific_name: s.scientific_name ?? s.display_name,
          is_endangered: true,
        },
        location_name: 'Unknown', // still no single name, locations vary
        location_latitude: s.sample_latitude ?? null,
        location_longitude: s.sample_longitude ?? null,
        is_masked: false,
      }));

      setSpeciesList(converted);
    } catch (err) {
      console.error('[EndangeredList] error loading species:', err);
      setSpeciesList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSpecies();
  }, [loadSpecies]);

  const sortedList = useMemo(
    () =>
      [...speciesList].sort((a, b) =>
        a.species.common_name
          .toLowerCase()
          .localeCompare(b.species.common_name.toLowerCase()),
      ),
    [speciesList],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading endangered species…</Text>
      </SafeAreaView>
    );
  }

  if (!sortedList.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Endangered species</Text>
        </View>

        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No endangered species</Text>
          <Text style={styles.emptySubtitle}>
            Once you mark species as endangered in the admin panel,
            they will appear here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Endangered species</Text>
      </View>
      <FlatList
        data={sortedList}
        keyExtractor={(item) => item.observation_id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.speciesName}>
                  {item.species.common_name}
                </Text>
                <Text style={styles.scientificName}>
                  {item.species.scientific_name}
                </Text>
              </View>
              <View style={styles.badgeDanger}>
                <Text style={styles.badgeDangerText}>ENDANGERED</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color="#555"
                style={styles.metaIcon}
              />
              <Text style={styles.metaText}>
                {item.location_latitude != null && item.location_longitude != null
                  ? `Lat ${item.location_latitude.toFixed(4)}, Lon ${item.location_longitude.toFixed(4)}`
                  : 'Unknown'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => {
                // optional: jump back to heatmap focused on this species
                navigation.navigate(ADMIN_ROOT, {
                  screen: ADMIN_HEATMAP,
                  params: {
                    selectedSpeciesId: item.species.species_id,
                  },
                });
              }}
            >
              <Ionicons
                name="map-outline"
                size={18}
                color="#0b5"
                style={styles.metaIcon}
              />
              <Text style={styles.mapButtonText}>View on heatmap</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  center: {
    flex: 1,
    backgroundColor: '#FFF5F7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#555',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  separator: {
    height: 12,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  speciesName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  scientificName: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  badgeDanger: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFEBEE',
  },
  badgeDangerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#C62828',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaIcon: {
    marginRight: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#555',
  },
  mapButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapButtonText: {
    fontSize: 14,
    color: '#0b5',
    fontWeight: '500',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
});
