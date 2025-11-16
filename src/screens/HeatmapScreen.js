import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Platform,
  Alert,
  TextInput,
  Pressable,
} from "react-native";
import MapView, { Marker, Heatmap } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// ===================== MOCK DATA =====================
const mockObservations = [
  {
    observation_id: 1,
    user: { username: "Ali" },
    species: {
      common_name: "Borneo Pitcher Plant",
      scientific_name: "Nepenthes rajah",
      is_endangered: true,
      image_url: require("../../assets/PlantPin.png"),
    },
    photo_url: require("../../assets/pitcher.jpg"),
    location_latitude: 1.5536,
    location_longitude: 110.3593,
    location_name: "Kuching Wetlands",
    created_at: "2025-09-10",
    notes: "Found near mangrove area",
  },
  {
    observation_id: 2,
    user: { username: "Sarah" },
    species: {
      common_name: "Rafflesia",
      scientific_name: "Rafflesia arnoldii",
      is_endangered: true,
      image_url: require("../../assets/PlantPin.png"),
    },
    photo_url: require("../../assets/rafflesia.jpg"),
    location_latitude: 1.4667,
    location_longitude: 110.3333,
    location_name: "Bako National Park",
    created_at: "2025-09-18",
    notes: "Strong smell, fully bloomed.",
  },
  {
    observation_id: 3,
    user: { username: "Mei" },
    species: {
      common_name: "Wild Orchid",
      scientific_name: "Dendrobium anosmum",
      is_endangered: false,
      image_url: require("../../assets/PlantPin.png"),
    },
    photo_url: require("../../assets/orchid.jpg"),
    location_latitude: 1.49,
    location_longitude: 110.36,
    location_name: "Semenggoh Reserve",
    created_at: "2025-09-20",
    notes: "Attached to a tree, bright purple.",
  },
  {
    observation_id: 4,
    user: { username: "John" },
    species: {
      common_name: "Sarawak Fern",
      scientific_name: "Dipteris sarawakensis",
      is_endangered: false,
      image_url: require("../../assets/PlantPin.png"),
    },
    photo_url: require("../../assets/aloe.jpg"),
    location_latitude: 1.52,
    location_longitude: 110.34,
    location_name: "Matang Wildlife Center",
    created_at: "2025-09-15",
    notes: "Growing on forest floor",
  },
  {
    observation_id: 5,
    user: { username: "David" },
    species: {
      common_name: "Palm Tree",
      scientific_name: "Arecaceae sp.",
      is_endangered: false,
      image_url: require("../../assets/PlantPin.png"),
    },
    photo_url: require("../../assets/aloe.jpg"),
    location_latitude: 1.48,
    location_longitude: 110.32,
    location_name: "Santubong Area",
    created_at: "2025-09-12",
    notes: "Common palm species",
  },
];

// Mock user authentication state - replace with your actual auth context
const isPublicUser = true; // Set to false for admin users

export default function HeatmapScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const mapRef = useRef(null);
  const insets = useSafeAreaInsets();

  // ======= STATE VARIABLES =======
  const [observations, setObservations] = useState([]);
  const [mode, setMode] = useState("heatmap");
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState("All");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date("2025-01-01"));
  const [speciesSearch, setSpeciesSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ======= RESET STATE WHEN SCREEN IS FOCUSED =======
  useFocusEffect(
    React.useCallback(() => {
      // Reset all filters and state to default when screen comes into focus
      setSelectedSpecies("All");
      setSelectedDate(new Date("2025-01-01"));
      setSpeciesSearch("");
      setMode("heatmap");
      setSelectedPlant(null);
      
      // Reset map to initial region
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: 1.55,
          longitude: 110.35,
          latitudeDelta: 0.4,
          longitudeDelta: 0.4,
        }, 500);
      }
    }, [])
  );

  // ======= BACKEND INTEGRATION READY =======
  useEffect(() => {
    const fetchObservations = async () => {
      try {
        setLoading(true);
        
        // ======= BACKEND INTEGRATION POINT =======
        // Replace this mock API call with actual backend API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For now, using mock data
        setObservations(mockObservations);
        
      } catch (error) {
        console.error("Failed to fetch observations:", error);
        Alert.alert("Error", "Failed to load observations data");
        setObservations(mockObservations);
      } finally {
        setLoading(false);
      }
    };

    fetchObservations();
  }, []);

  // ======= FILTERING LOGIC =======
  const filteredObservations = observations.filter((obs) => {
    // For public users, only show non-endangered species
    if (isPublicUser && obs.species.is_endangered) {
      return false;
    }
    
    const speciesMatch =
      selectedSpecies === "All" ||
      obs.species.common_name === selectedSpecies;
    const dateMatch =
      new Date(obs.created_at).getTime() >= selectedDate.getTime();
    return speciesMatch && dateMatch;
  });

  // Get species list based on user type and search
  const getAvailableSpecies = () => {
    let availableObservations = observations;
    
    // For public users, filter out endangered species
    if (isPublicUser) {
      availableObservations = observations.filter(obs => !obs.species.is_endangered);
    }
    
    const species = ["All", ...new Set(availableObservations.map((o) => o.species.common_name))];
    
    // Filter by search text if provided
    if (speciesSearch.trim()) {
      return species.filter(sp => 
        sp.toLowerCase().includes(speciesSearch.toLowerCase())
      );
    }
    
    return species;
  };

  const speciesList = getAvailableSpecies();

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const HEATMAP_RADIUS = Platform.OS === "android" ? 40 : 60;

  if (loading) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'left', 'right']}>
        <View style={s.loadingContainer}>
          <Text style={s.loadingText}>Loading map data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top', 'left', 'right']}>
      {/* Header - Updated to match ProfileScreen */}
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <View style={s.headerRow}>
          

          <Text style={s.headerTitle}>Heatmap & Observations</Text>
          
          <Pressable
            style={s.filterButton}
            onPress={() => setFilterVisible(true)}
            android_ripple={{ color: '#00000010', borderless: false }}
          >
            <Ionicons name="filter" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {/* Toggle Button - Updated styling */}
      <View style={s.toggleContainer}>
        <Pressable
          style={[s.toggleButton, mode === "heatmap" && s.activeButton]}
          onPress={() => setMode("heatmap")}
          android_ripple={{ color: '#00000010', borderless: false }}
        >
          <Text style={[s.toggleText, mode === "heatmap" && s.activeToggleText]}>Heatmap</Text>
        </Pressable>
        <Pressable
          style={[s.toggleButton, mode === "pins" && s.activeButton]}
          onPress={() => setMode("pins")}
          android_ripple={{ color: '#00000010', borderless: false }}
        >
          <Text style={[s.toggleText, mode === "pins" && s.activeToggleText]}>Pins</Text>
        </Pressable>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={s.map}
        initialRegion={{
          latitude: 1.55,
          longitude: 110.35,
          latitudeDelta: 0.4,
          longitudeDelta: 0.4,
        }}
        zoomEnabled={true}
        scrollEnabled={true}
        zoomControlEnabled={true}
        rotateEnabled={true}
        pitchEnabled={true}
        onPress={() => setSelectedPlant(null)}
      >
        {/* HEATMAP MODE */}
        {mode === "heatmap" && filteredObservations.length > 0 && (
          <Heatmap
            points={filteredObservations.map((obs) => ({
              latitude: obs.location_latitude,
              longitude: obs.location_longitude,
              weight: 1,
            }))}
            radius={HEATMAP_RADIUS}
            opacity={0.7}
            gradient={{
              colors: ["#ADFF2F", "#FFFF00", "#FF8C00", "#FF0000"],
              startPoints: [0.01, 0.25, 0.5, 1],
              colorMapSize: 256,
            }}
          />
        )}

        {/* PINS MODE */}
        {mode === "pins" &&
          filteredObservations.map((obs) => (
            <Marker
              key={obs.observation_id}
              coordinate={{
                latitude: obs.location_latitude,
                longitude: obs.location_longitude,
              }}
              title={obs.species.common_name}
              description={obs.location_name}
              pinColor="#2F6C4F"
              onPress={() => {
                try {
                  setSelectedPlant(obs);
                } catch (e) {
                  console.log("Error selecting plant:", e);
                }
              }}
            />
          ))}
      </MapView>

      {/* Map Controls */}
      <View style={s.mapControls}>
        <Pressable
          style={s.mapControlButton}
          onPress={() => {
            if (mapRef.current) {
              mapRef.current.animateToRegion({
                latitude: 1.55,
                longitude: 110.35,
                latitudeDelta: 0.4,
                longitudeDelta: 0.4,
              }, 500);
            }
          }}
          android_ripple={{ color: '#00000010', borderless: false }}
        >
          <Ionicons name="locate" size={20} color="#1F2A37" />
        </Pressable>
      </View>

      {/* Filter Modal - Updated styling */}
      <Modal visible={filterVisible} transparent animationType="slide">
        <View style={s.modalContainer}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Filter Observations</Text>

            <Text style={s.filterLabel}>Search Species</Text>
            <TextInput
              style={s.searchInput}
              placeholder="Type to search species..."
              value={speciesSearch}
              onChangeText={setSpeciesSearch}
              placeholderTextColor="#64748B"
            />

            <Text style={s.filterLabel}>Select Species</Text>
            <ScrollView 
              style={s.speciesListContainer}
              showsVerticalScrollIndicator={false}
            >
              {speciesList.length > 0 ? (
                speciesList.map((sp) => (
                  <Pressable
                    key={sp}
                    style={[
                      s.speciesButton,
                      selectedSpecies === sp && s.selectedSpecies,
                    ]}
                    onPress={() => {
                      setSelectedSpecies(sp);
                      setSpeciesSearch("");
                    }}
                    android_ripple={{ color: '#00000010', borderless: false }}
                  >
                    <Text style={[
                      s.speciesText,
                      selectedSpecies === sp && s.selectedSpeciesText
                    ]}>{sp}</Text>
                  </Pressable>
                ))
              ) : (
                <Text style={s.noResultsText}>No species found</Text>
              )}
            </ScrollView>

            <Text style={s.filterLabel}>Date After:</Text>
            <Pressable
              style={s.dateButton}
              onPress={() => setShowDatePicker(true)}
              android_ripple={{ color: '#00000010', borderless: false }}
            >
              <Text style={s.dateText}>
                {selectedDate.toDateString()}
              </Text>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            <View style={s.modalButtons}>
              <Pressable
                style={s.resetButton}
                onPress={() => {
                  setSelectedSpecies("All");
                  setSelectedDate(new Date("2025-01-01"));
                  setSpeciesSearch("");
                }}
                android_ripple={{ color: '#00000010', borderless: false }}
              >
                <Text style={s.resetText}>Reset</Text>
              </Pressable>
              <Pressable
                style={s.closeButton}
                onPress={() => setFilterVisible(false)}
                android_ripple={{ color: '#00000010', borderless: false }}
              >
                <Text style={s.closeText}>Apply</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Plant Detail Popup - Updated styling */}
      {selectedPlant && selectedPlant.photo_url && (
        <Modal transparent animationType="fade" visible={true}>
          <View style={s.detailOverlay}>
            <View style={s.detailCard}>
              <Image
                source={
                  typeof selectedPlant.photo_url === "number"
                    ? selectedPlant.photo_url
                    : { uri: selectedPlant.photo_url }
                }
                style={s.detailImage}
              />

              <Text style={s.detailTitle}>
                {selectedPlant.species?.common_name || "Unknown Plant"}
              </Text>
              <Text style={s.detailSub}>
                {selectedPlant.species?.scientific_name || "N/A"}
              </Text>
              
              <View style={s.detailInfoRow}>
                <Ionicons name="location" size={16} color="#64748B" />
                <Text style={s.detailInfo}>
                  {selectedPlant.location_name || "Unknown Location"}
                </Text>
              </View>
              
              <View style={s.detailInfoRow}>
                <Ionicons name="person" size={16} color="#64748B" />
                <Text style={s.detailInfo}>
                  {selectedPlant.user?.username || "Anonymous"}
                </Text>
              </View>
              
              <View style={s.detailInfoRow}>
                <Ionicons name="calendar" size={16} color="#64748B" />
                <Text style={s.detailInfo}>
                  {selectedPlant.created_at
                    ? new Date(selectedPlant.created_at).toDateString()
                    : "Unknown Date"}
                </Text>
              </View>
              
              <View style={s.detailInfoRow}>
                <Ionicons 
                  name={selectedPlant.species?.is_endangered ? "warning" : "checkmark-circle"} 
                  size={16} 
                  color={selectedPlant.species?.is_endangered ? "#DC2626" : "#16A34A"} 
                />
                <Text style={[
                  s.detailInfo,
                  selectedPlant.species?.is_endangered ? s.endangeredText : s.commonText
                ]}>
                  {selectedPlant.species?.is_endangered
                    ? "Endangered Species"
                    : "Common Species"}
                </Text>
              </View>

              <Text style={s.detailNotes}>
                {selectedPlant.notes || "No notes provided."}
              </Text>

              <Pressable
                onPress={() => setSelectedPlant(null)}
                style={s.closeDetail}
                android_ripple={{ color: '#00000010', borderless: false }}
              >
                <Text style={s.closeDetailText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

// ===================== UPDATED STYLES =====================
const s = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F6F9F4' 
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#F6F9F4',
  },
  
  loadingText: {
    fontSize: 16,
    color: "#1F2A37",
    fontWeight: '600'
  },

  // Header styles matching ProfileScreen
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
  
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#244332',
    textAlign: 'center',
    flex: 1,
  },
  
  filterButton: {
    padding: 10,
    borderRadius: 999,
    backgroundColor: '#2F6C4F',
  },

  // Toggle container
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  
  toggleButton: {
    backgroundColor: "#E5ECF3",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    marginHorizontal: 6,
  },
  
  activeButton: { 
    backgroundColor: "#2F6C4F" 
  },
  
  toggleText: { 
    color: "#64748B", 
    fontWeight: "700", 
    fontSize: 14 
  },
  
  activeToggleText: { 
    color: "#FFFFFF" 
  },

  map: { 
    flex: 1 
  },
  
  mapControls: {
    position: "absolute",
    right: 16,
    bottom: 100,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 25,
    padding: 5,
    elevation: 4,
  },
  
  mapControlButton: {
    padding: 10,
    borderRadius: 20,
  },

  // Modal styles updated
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  
  modalContent: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 20,
    padding: 20,
    maxHeight: "80%",
    elevation: 8,
  },
  
  modalTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: '#244332',
    marginBottom: 16,
    textAlign: 'center'
  },
  
  filterLabel: { 
    marginTop: 16, 
    fontWeight: "700", 
    color: '#1F2A37',
    fontSize: 14,
    marginBottom: 6
  },
  
  searchInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    fontSize: 14,
    color: '#1F2A37',
  },
  
  speciesListContainer: {
    maxHeight: 150,
    marginVertical: 8,
  },
  
  speciesButton: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  
  selectedSpecies: { 
    backgroundColor: "#2F6C4F",
    borderColor: '#2F6C4F',
  },
  
  speciesText: { 
    color: "#374151", 
    fontWeight: '600',
    fontSize: 14,
  },
  
  selectedSpeciesText: { 
    color: "#FFFFFF" 
  },
  
  noResultsText: {
    textAlign: "center",
    color: "#64748B",
    fontStyle: "italic",
    marginVertical: 20,
    fontSize: 14,
  },
  
  dateButton: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: "center",
  },
  
  dateText: { 
    color: "#1F2A37", 
    fontWeight: '600',
    fontSize: 14,
  },
  
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  
  resetButton: {
    backgroundColor: "#E5ECF3",
    padding: 14,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  
  resetText: { 
    color: "#64748B", 
    fontWeight: "700", 
    fontSize: 14 
  },
  
  closeButton: {
    backgroundColor: "#2F6C4F",
    padding: 14,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
  },
  
  closeText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 14 
  },

  // Detail popup styles
  detailOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  
  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    elevation: 8,
  },
  
  detailImage: { 
    width: "100%", 
    height: 200, 
    borderRadius: 12,
    marginBottom: 16,
  },
  
  detailTitle: { 
    fontSize: 18, 
    fontWeight: "800", 
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center'
  },
  
  detailSub: { 
    fontStyle: "italic", 
    color: "#64748B", 
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  
  detailInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  
  detailInfo: { 
    color: "#334155", 
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  
  endangeredText: { 
    color: "#DC2626", 
    fontWeight: "700" 
  },
  
  commonText: { 
    color: "#16A34A", 
    fontWeight: "700" 
  },
  
  detailNotes: {
    marginTop: 12,
    fontStyle: "italic",
    color: "#555",
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  
  closeDetail: {
    backgroundColor: "#2F6C4F",
    marginTop: 16,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  
  closeDetailText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 14 
  },
});