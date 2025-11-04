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
} from "react-native";
import MapView, { Marker, Heatmap } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

// ===================== MOCK DATA =====================
const mockObservations = [
  {
    observation_id: 1,
    user: { username: "Ali" },
    species: {
      common_name: "Borneo Pitcher Plant",
      scientific_name: "Nepenthes rajah",
      is_endangered: 1,
      image_url: require("../../assets/PlantPin.png"), // 🔹 Local image
    },
    photo_url: require("../../assets/pitcher.jpg"), // 🔹 Local image for observation
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
      is_endangered: 1,
      image_url: require("../../assets/PlantPin.png"), //image: generic reference image of a species
    },
    photo_url: require("../../assets/rafflesia.jpg"),  //photo:actual photo uploaded by user for a specific sighting
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
      is_endangered: 0,
      image_url: require("../../assets/PlantPin.png"), 
    },
    photo_url: require("../../assets/orchid.jpg"), 
    location_latitude: 1.49,
    location_longitude: 110.36,
    location_name: "Semenggoh Reserve",
    created_at: "2025-09-20",
    notes: "Attached to a tree, bright purple.",
  },
];

export default function HeatmapScreen() {
  const navigation = useNavigation();
  const mapRef = useRef(null);

  const [observations, setObservations] = useState(mockObservations); //need to replace this when connect to backend and database
  const [mode, setMode] = useState("heatmap"); // 'heatmap' or 'pins'
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState("All");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date("2025-01-01"));

  // ======= FILTERING =======
  const filteredObservations = observations.filter((obs) => {
    const speciesMatch =
      selectedSpecies === "All" ||
      obs.species.common_name === selectedSpecies;
    const dateMatch =
      new Date(obs.created_at).getTime() >= selectedDate.getTime();
    return speciesMatch && dateMatch;
  });

  const speciesList = ["All", ...new Set(observations.map((o) => o.species.common_name))];

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  // ======= Automatically center to filtered species =======
  useEffect(() => {
    if (selectedSpecies !== "All") {
      const selectedObs = observations.find(
        (obs) => obs.species.common_name === selectedSpecies
      );
      if (selectedObs && mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: selectedObs.location_latitude,
            longitude: selectedObs.location_longitude,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          },
          1000
        );
      }
    }
  }, [selectedSpecies]);

  const HEATMAP_RADIUS = Platform.OS === "android" ? 40 : 60;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#A5C8A3", "#F7FFED"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="arrow-back" size={24} color="#2F3E46" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Heatmap & Observations</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="filter" size={22} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Toggle Button */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, mode === "heatmap" && styles.activeButton]}
          onPress={() => setMode("heatmap")}
        >
          <Text style={styles.toggleText}>Heatmap</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, mode === "pins" && styles.activeButton]}
          onPress={() => setMode("pins")}
        >
          <Text style={styles.toggleText}>Pins</Text>
        </TouchableOpacity>
      </View>

        {/* Map */}
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: 1.55,
            longitude: 110.35,
            latitudeDelta: 0.4,
            longitudeDelta: 0.4,
          }}
          zoomEnabled
          scrollEnabled
          onPress={() => setSelectedPlant(null)}
        >
          {/* HEATMAP MODE (no click interaction) */}
          {mode === "heatmap" && filteredObservations.length > 0 && (
            <Heatmap
              points={filteredObservations.map((obs) => ({
                latitude: obs.location_latitude,
                longitude: obs.location_longitude,
                weight: obs.species.is_endangered ? 2 : 1,
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

          {/* PINS MODE (interactive markers) */}
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
                pinColor="#2C6E49"
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

      {/* Filter Modal */}
      <Modal visible={filterVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Observations</Text>

            <Text style={styles.filterLabel}>Species</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {speciesList.map((sp) => (
                <TouchableOpacity
                  key={sp}
                  style={[
                    styles.speciesButton,
                    selectedSpecies === sp && styles.selectedSpecies,
                  ]}
                  onPress={() => setSelectedSpecies(sp)}
                >
                  <Text style={styles.speciesText}>{sp}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>Date After:</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {selectedDate.toDateString()}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setFilterVisible(false)}
            >
              <Text style={styles.closeText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Plant Detail Popup */}
      {selectedPlant && selectedPlant.photo_url && (
        <Modal transparent animationType="fade" visible={true}>
          <View style={styles.detailOverlay}>
            <View style={styles.detailCard}>
              <Image
                source={
                  typeof selectedPlant.photo_url === "number"
                    ? selectedPlant.photo_url
                    : { uri: selectedPlant.photo_url }
                }
                style={styles.detailImage}
              />

              <Text style={styles.detailTitle}>
                {selectedPlant.species?.common_name || "Unknown Plant"}
              </Text>
              <Text style={styles.detailSub}>
                {selectedPlant.species?.scientific_name || "N/A"}
              </Text>
              <Text style={styles.detailInfo}>
                🌍 {selectedPlant.location_name || "Unknown Location"}
              </Text>
              <Text style={styles.detailInfo}>
                👤 Uploaded by {selectedPlant.user?.username || "Anonymous"}
              </Text>
              <Text style={styles.detailInfo}>
                🕒{" "}
                {selectedPlant.created_at
                  ? new Date(selectedPlant.created_at).toDateString()
                  : "Unknown Date"}
              </Text>
              <Text style={styles.detailInfo}>
                ⚠️{" "}
                {selectedPlant.species?.is_endangered
                  ? "Endangered Species"
                  : "Common Species"}
              </Text>
              <Text style={styles.detailNotes}>
                Notes: {selectedPlant.notes || "No notes provided."}
              </Text>

              <TouchableOpacity
                onPress={() => setSelectedPlant(null)}
                style={styles.closeDetail}
              >
                <Text style={{ color: "#fff" }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

// ===================== STYLES =====================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7FFED" },
  header: {
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 5,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#2F3E46", top: 10 },
  backButton: {
    position: "absolute",
    left: 20,
    bottom: 20,
  },
  filterButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#9C9872",
    padding: 8,
    borderRadius: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  toggleButton: {
    backgroundColor: "#E0E0E0",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activeButton: { backgroundColor: "#A5C8A3" },
  toggleText: { color: "#2F3E46", fontWeight: "bold" },
  map: { flex: 1 },
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
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  filterLabel: { marginTop: 10, fontWeight: "bold" },
  speciesButton: {
    backgroundColor: "#E8E8E8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginVertical: 5,
  },
  selectedSpecies: { backgroundColor: "#A5C8A3" },
  speciesText: { color: "#2F3E46" },
  dateButton: {
    backgroundColor: "#E8E8E8",
    borderRadius: 10,
    padding: 8,
    marginTop: 5,
    alignItems: "center",
  },
  dateText: { color: "#2F3E46" },
  closeButton: {
    backgroundColor: "#A5C8A3",
    marginTop: 15,
    padding: 10,
    borderRadius: 15,
    alignItems: "center",
  },
  closeText: { color: "#fff", fontWeight: "bold" },
  detailOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    width: "85%",
    alignItems: "center",
  },
  detailImage: { width: 200, height: 150, borderRadius: 15 },
  detailTitle: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  detailSub: { fontStyle: "italic", color: "#555" },
  detailInfo: { marginTop: 5, color: "#333" },
  detailNotes: {
    marginTop: 8,
    fontStyle: "italic",
    textAlign: "center",
    color: "#555",
  },
  closeDetail: {
    backgroundColor: "#9C9872",
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
  },
});
