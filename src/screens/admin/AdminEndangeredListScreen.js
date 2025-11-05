import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ADMIN_HEATMAP, ADMIN_ROOT } from '../../navigation/routes';

const MOCK_ENDANGERED_SPECIES = [
  {
    observation_id: 'OBS-3011',
    user_id: 42,
    species: {
      species_id: 5,
      common_name: 'Rafflesia arnoldii',
      scientific_name: 'Rafflesia arnoldii',
    },
    location_name: 'Bako National Park',
    location_latitude: 1.6667,
    location_longitude: 110.4667,
    confidence_score: 0.74,
    is_masked: false,
    is_endangered: true,
  },
  {
    observation_id: 'OBS-2987',
    user_id: 51,
    species: {
      species_id: 9,
      common_name: 'Nepenthes rajah',
      scientific_name: 'Nepenthes rajah',
    },
    location_name: 'Santubong Forest Reserve',
    location_latitude: 1.735,
    location_longitude: 110.331,
    confidence_score: 0.68,
    is_masked: true,
    is_endangered: true,
  },
  {
    observation_id: 'OBS-2944',
    user_id: 63,
    species: {
      species_id: 12,
      common_name: 'Nepenthes lowii',
      scientific_name: 'Nepenthes lowii',
    },
    location_name: 'Mount Kinabalu',
    location_latitude: 6.075,
    location_longitude: 116.5588,
    confidence_score: 0.61,
    is_masked: false,
    is_endangered: true,
  },
  {
    observation_id: 'OBS-2921',
    user_id: 74,
    species: {
      species_id: 16,
      common_name: 'Vanda coerulea',
      scientific_name: 'Vanda coerulea',
    },
    location_name: 'Crocker Range Park',
    location_latitude: 5.371,
    location_longitude: 116.144,
    confidence_score: 0.57,
    is_masked: false,
    is_endangered: true,
  },
  {
    observation_id: 'OBS-2899',
    user_id: 17,
    species: {
      species_id: 14,
      common_name: 'Dendrobium anosmum',
      scientific_name: 'Dendrobium anosmum',
    },
    location_name: 'Semenggoh Nature Reserve',
    location_latitude: 1.352,
    location_longitude: 110.31,
    confidence_score: 0.81,
    is_masked: false,
    is_endangered: true,
  },
  {
    observation_id: 'OBS-2885',
    user_id: 91,
    species: {
      species_id: 21,
      common_name: 'Nepenthes villosa',
      scientific_name: 'Nepenthes villosa',
    },
    location_name: 'Tambuyukon',
    location_latitude: 6.275,
    location_longitude: 116.649,
    confidence_score: 0.65,
    is_masked: true,
    is_endangered: true,
  },
  {
    observation_id: 'OBS-2850',
    user_id: 102,
    species: {
      species_id: 24,
      common_name: 'Paphiopedilum rothchildianum',
      scientific_name: 'Paphiopedilum rothchildianum',
    },
    location_name: 'Mount Kinabalu',
    location_latitude: 6.05,
    location_longitude: 116.6667,
    confidence_score: 0.54,
    is_masked: false,
    is_endangered: true,
  },
  {
    observation_id: 'OBS-2833',
    user_id: 118,
    species: {
      species_id: 28,
      common_name: 'Rafflesia keithii',
      scientific_name: 'Rafflesia keithii',
    },
    location_name: 'Poring Hot Springs',
    location_latitude: 6.05,
    location_longitude: 116.682,
    confidence_score: 0.6,
    is_masked: false,
    is_endangered: true,
  },
  {
    observation_id: 'OBS-2799',
    user_id: 133,
    species: {
      species_id: 33,
      common_name: 'Nepenthes bicalcarata',
      scientific_name: 'Nepenthes bicalcarata',
    },
    location_name: 'Gunung Mulu',
    location_latitude: 4.05,
    location_longitude: 114.8,
    confidence_score: 0.73,
    is_masked: false,
    is_endangered: true,
  },
  {
    observation_id: 'OBS-2764',
    user_id: 144,
    species: {
      species_id: 37,
      common_name: 'Dipterocarpus sarawakensis',
      scientific_name: 'Dipterocarpus sarawakensis',
    },
    location_name: 'Lambir Hills',
    location_latitude: 4.2,
    location_longitude: 114.03,
    confidence_score: 0.66,
    is_masked: false,
    is_endangered: true,
  },
  {
    observation_id: 'OBS-2720',
    user_id: 155,
    species: {
      species_id: 40,
      common_name: 'Hopea beccariana',
      scientific_name: 'Hopea beccariana',
    },
    location_name: 'Batang Ai National Park',
    location_latitude: 1.2,
    location_longitude: 111.9,
    confidence_score: 0.49,
    is_masked: false,
    is_endangered: true,
  },
  {
    observation_id: 'OBS-2698',
    user_id: 166,
    species: {
      species_id: 44,
      common_name: 'Nepenthes truncata',
      scientific_name: 'Nepenthes truncata',
    },
    location_name: 'Danum Valley',
    location_latitude: 4.93,
    location_longitude: 117.75,
    confidence_score: 0.58,
    is_masked: false,
    is_endangered: true,
  },
];

export default function AdminEndangeredListScreen() {
  const [speciesList, setSpeciesList] = useState(MOCK_ENDANGERED_SPECIES);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState(null);
  const navigation = useNavigation();

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
                  navigation.navigate(ADMIN_ROOT, {
                    screen: ADMIN_HEATMAP,
                    params: {
                      selectedObservation: item,
                    },
                  });
                  navigation.goBack();
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
