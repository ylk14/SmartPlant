import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { ADMIN_HEATMAP, ADMIN_ROOT } from '../../navigation/routes';
import { fetchSpecies } from "../../../services/api";


export default function AdminEndangeredListScreen() {
  const [speciesList, setSpeciesList] = useState([]);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState(null);
  const navigation = useNavigation();
  React.useEffect(() => {
  loadSpecies();
}, []);

  const loadSpecies = async () => {
    try {
      const data = await fetchSpecies();
      console.log("Fetched endangered species:", data);

      const speciesArray = Array.isArray(data) ? data : data.data;

      if (!speciesArray) {
        console.error("Species list missing:", data);
        return;
      }

      // Show only endangered species
      const endangeredOnly = speciesArray.filter(s => s.is_endangered === 1);

      // Convert to frontend format
      const converted = endangeredOnly.map(s => ({
      observation_id: "DB-" + s.species_id,
      species: {
        species_id: s.species_id,
        common_name: s.common_name,
        scientific_name: s.scientific_name,
        is_endangered: true,

      },
      location_name: "Unknown",

      // ADD THESE TWO FIELDS 
      location_latitude: 1.55,      // fake coordinate for testing
      location_longitude: 110.35,

      is_masked: false,
  }));

      setSpeciesList(converted);

    } catch (err) {
      console.error("Error loading species list:", err);
    }
  };



  const toggleMask = (observation_id) => {
    setSpeciesList((prev) =>
      prev.map((item) =>
        item.observation_id === observation_id
          ? { ...item, is_masked: !item.is_masked }
          : item
      )
    );
  };

  const sortedList = useMemo(
    () =>
      [...speciesList].sort((a, b) => {
        const nameA = a.species.common_name.toLowerCase();
        const nameB = b.species.common_name.toLowerCase();
        return nameA.localeCompare(nameB);
      }),
    [speciesList]
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={sortedList}
        keyExtractor={(item) => item.observation_id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => {
          const isSelected = selectedSpeciesId === item.species.species_id;
          return (
            <View style={[styles.listItem, isSelected && styles.listItemSelected]}>
              <View style={styles.listItemInfo}>
                <Text style={styles.speciesName}>{item.species.common_name}</Text>
                <Text style={styles.metaText}>Status: {item.is_endangered ? 'Endangered' : 'Not endangered'}</Text>
                <Text style={styles.metaText}>Region: {item.location_name}</Text>
              </View>
              <TouchableOpacity
                style={[styles.selectButton, isSelected && styles.selectButtonActive]}
                onPress={() => {
                  if (isSelected) {
                    setSelectedSpeciesId(null);
                    return;
                  }

                  setSelectedSpeciesId(item.species.species_id);
                  navigation.dispatch(
                    CommonActions.navigate({
                      name: ADMIN_ROOT,
                    params: {
                      screen: ADMIN_HEATMAP,
                      params: {
                        selectedObservation: item,
                      },
                    },
                      })
                    );
                  }}
              >
                <Text style={[styles.selectButtonText, isSelected && styles.selectButtonTextActive]}>Select</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.maskButton, item.is_masked ? styles.masked : styles.unmasked]}
                onPress={() => toggleMask(item.observation_id)}
                accessibilityRole="button"
              >
                <Ionicons
                  name={item.is_masked ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={item.is_masked ? '#933d27' : '#0F4C81'}
                />
                <Text style={[styles.maskButtonText, item.is_masked ? styles.maskedText : styles.unmaskedText]}>
                  {item.is_masked ? 'Masked' : 'Visible'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 12,
  },
  listItemSelected: {
    backgroundColor: '#EFF5FF',
  },
  listItemInfo: {
    flex: 1,
  },
  speciesName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F1C2E',
  },
  metaText: {
    fontSize: 12,
    color: '#5A6A78',
    marginTop: 2,
  },
  selectButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#E3ECF9',
  },
  selectButtonActive: {
    backgroundColor: '#1A54A5',
  },
  selectButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F4C81',
  },
  selectButtonTextActive: {
    color: '#FFFFFF',
  },
  maskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
  },
  masked: { backgroundColor: '#FBE4DD' },
  unmasked: { backgroundColor: '#E3ECF9' },
  maskButtonText: { fontSize: 12, fontWeight: '600' },
  maskedText: { color: '#933d27' },
  unmaskedText: { color: '#0F4C81' },
  separator: {
    height: 12,
  },
});