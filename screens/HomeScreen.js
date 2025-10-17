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

export default function HomeScreen({ navigation }) {
  const userName = "Ali"; // example placeholder, remove this later

  const plants = [
    { id: "1", name: "Aloe Vera", image: require("../assets/aloe.jpg") },
    { id: "2", name: "Snake Plant", image: require("../assets/snakeplant.jpg") },
    { id: "3", name: "Monstera", image: require("../assets/monstera.jpg") },
  ];

  const renderPlant = ({ item }) => (
    <TouchableOpacity style={styles.plantButton}>
      <Image source={item.image} style={styles.plantImage} />
      <Text style={styles.plantName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#FFFFFF","#F7FFED"]} style={styles.container}>
      {/* Welcome Text */}
      <Text style={styles.welcome}>Welcome, {userName} 👋</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#797979" />
        <TextInput
          placeholder="Search plants, guides, or users..."
          placeholderTextColor="#888"
          style={styles.searchInput}
        />
      </View>

      {/* Main Buttons */}
      <TouchableOpacity
        style={styles.bigButtonContainer}
        onPress={() => navigation.navigate("Identify")}
      >
        <LinearGradient colors={["#F6EFB9", "#E3E59B"]} style={styles.bigButton}>
          <Text style={styles.buttonText}>Identify Plants</Text>
          <Image
            source={require("../assets/IdentifyIcon.png")} 
            style={styles.buttonLogo}
          />
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.rowButtons}>
        <TouchableOpacity
          style={styles.smallButtonContainer}
          onPress={() => navigation.navigate("Heatmap")}
        >
          <LinearGradient colors={["#9C9872", "#B1AD8B"]} style={styles.smallButton}>
            <Text style={styles.buttonText}>Heatmap</Text>
            <Image
              source={require("../assets/MapIcon.png")} 
              style={styles.buttonLogoSmall}
            />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallButtonContainer}>
          <LinearGradient colors={["#A5C8A3", "#7FB97D"]} style={styles.smallButton}>
            <Text style={styles.buttonText}>Favourite</Text>
            <Image
              source={require("../assets/FavoriteIcon.png")} 
              style={styles.buttonLogoSmall}
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Discover More Section */}
      <Text style={styles.discoverTitle}>Discover more...</Text>
      <View style={styles.discoverContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={plants}
          renderItem={renderPlant}
          keyExtractor={(item) => item.id}
        />
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.navBarContainer}>
        <View style={styles.navBar}>
          <TouchableOpacity>
            <Ionicons name="home" size={26} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="search" size={26} color="#4CAF50" />
          </TouchableOpacity>

          {/* Space for floating scan button */}
          <View style={{ width: 60 }} />

          <TouchableOpacity onPress={() => navigation.navigate("Heatmap")}>
            <Ionicons name="map" size={26} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="person" size={26} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* Floating scan button */}
        <TouchableOpacity style={styles.scanButton}>
          <Ionicons name="camera" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
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
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#333",
  },
  bigButtonContainer: {
    marginBottom: 20,
  },
  bigButton: {
    height: 150,
    borderRadius: 20,
    padding: 15,
    justifyContent: "flex-end",
  },
  smallButtonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  smallButton: {
    height: 150,
    borderRadius: 20,
    padding: 15,
    justifyContent: "flex-end",
  },
  buttonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  buttonLogo: {
    position: "absolute",
    top: 15,
    right:2,
    width: 140,
    height: 100,
  },
  buttonLogoSmall: {
    position: "absolute",
    top: 15,
    right: 5,
    width: 80,
    height: 100,
    resizeMode: "contain", // keeps full image visible

  },
  rowButtons: {
    flexDirection: "row",
    marginBottom: 50,
  },
  discoverTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2F4F2F",
  },
  discoverContainer: {
    height: 130, // smaller height to fit navbar
  },
  plantButton: {
    alignItems: "center",
    marginRight: 30,
  },
  plantImage: {
    width: 100,
    height: 100,
    borderRadius: 40,
  },
  plantName: {
    marginTop: 5,
    color: "#333",
    fontWeight: "600",
  },
  navBarContainer: {
    position: "absolute",
    bottom: 60, // distance from bottom
    width: "100%",
    alignItems: "center",
  },

  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 35,
    width: "85%", // make it narrower to float in center
    height: 65,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },

  scanButton: {
    position: "absolute",
    bottom: 55,
    alignSelf: "center",
    backgroundColor: "#4CAF50",
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
});


