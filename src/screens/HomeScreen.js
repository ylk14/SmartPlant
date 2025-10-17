import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// ✅ use your tab route constant so it always matches RootNavigator
import { TAB_IDENTIFY } from "../navigation/routes";

export default function HomeScreen({ navigation }) {
  const userName = "Ali"; // example placeholder, remove this later

  const plants = [
    { id: "1", name: "Aloe Vera", image: require("../../assets/aloe.jpg") },
    { id: "2", name: "Snake Plant", image: require("../../assets/snakeplant.jpg") },
    { id: "3", name: "Monstera", image: require("../../assets/monstera.jpg") },
  ];

  const renderPlant = ({ item }) => (
    <TouchableOpacity style={styles.plantButton}>
      <Image source={item.image} style={styles.plantImage} />
      <Text style={styles.plantName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#FFFFFF", "#F7FFED"]} style={styles.container}>
      {/* Welcome */}
      <Text style={styles.welcome}>Welcome, {userName} 👋</Text>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#797979" />
        <TextInput
          placeholder="Search plants, guides, or users..."
          placeholderTextColor="#888"
          style={styles.searchInput}
        />
      </View>

      {/* Identify CTA (go to Identify tab) */}
      <TouchableOpacity
        style={styles.bigButtonContainer}
        onPress={() => navigation.navigate(TAB_IDENTIFY)}
      >
        <LinearGradient colors={["#F6EFB9", "#E3E59B"]} style={styles.bigButton}>
          <Text style={styles.buttonText}>Identify Plants</Text>
          <Image
            source={require("../../assets/IdentifyIcon.png")}
            style={styles.buttonLogo}
          />
        </LinearGradient>
      </TouchableOpacity>

      {/* Heatmap + Favourite shortcuts */}
      <View style={styles.rowButtons}>
        <TouchableOpacity
          style={styles.smallButtonContainer}
          onPress={() => navigation.navigate("Heatmap")}
        >
          <LinearGradient colors={["#9C9872", "#B1AD8B"]} style={styles.smallButton}>
            <Text style={styles.buttonText}>Heatmap</Text>
            <Image
              source={require("../../assets/MapIcon.png")}
              style={styles.buttonLogoSmall}
            />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallButtonContainer}>
          <LinearGradient colors={["#A5C8A3", "#7FB97D"]} style={styles.smallButton}>
            <Text style={styles.buttonText}>Favourite</Text>
            <Image
              source={require("../../assets/FavoriteIcon.png")}
              style={styles.buttonLogoSmall}
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Discover */}
      <Text style={styles.discoverTitle}>Discover more...</Text>
      <View style={styles.discoverContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={plants}
          renderItem={renderPlant}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingRight: 12 }}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24, // room above your floating tab bar
  },
  welcome: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#565943",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#edededff",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 25,
    height: 45,
  },
  searchInput: { flex: 1, marginLeft: 8, color: "#333" },

  bigButtonContainer: { marginBottom: 20 },
  bigButton: {
    height: 150,
    borderRadius: 20,
    padding: 15,
    justifyContent: "flex-end",
  },

  rowButtons: { flexDirection: "row", gap: 10, marginBottom: 22 },
  smallButtonContainer: { flex: 1 },
  smallButton: {
    height: 150,
    borderRadius: 20,
    padding: 15,
    justifyContent: "flex-end",
  },

  buttonText: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  buttonLogo: {
    position: "absolute",
    top: 15,
    right: 2,
    width: 140,
    height: 100,
  },
  buttonLogoSmall: {
    position: "absolute",
    top: 15,
    right: 5,
    width: 80,
    height: 100,
    resizeMode: "contain",
  },

  discoverTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2F4F2F",
  },
  discoverContainer: { height: 130 },

  plantButton: { alignItems: "center", marginRight: 30 },
  plantImage: { width: 100, height: 100, borderRadius: 40 },
  plantName: { marginTop: 5, color: "#333", fontWeight: "600" },
});
