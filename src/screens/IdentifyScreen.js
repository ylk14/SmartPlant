// src/screens/IdentifyScreen.js
import { View, Text, Pressable, ImageBackground, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

export default function IdentifyScreen() {
  const nav = useNavigation();

  // Pick from gallery and jump to Preview
  const openLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to choose a picture.');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      exif: true, // keep geotag etc. if present
    });

    if (!res.canceled && res.assets?.length) {
      const { uri, exif } = res.assets[0];
      nav.navigate('Preview', { uri, source: 'library', exif: exif ?? null });
    }
  };

  return (
    // ✅ SafeAreaView ensures the title stays below camera notch or status bar
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Title */}
      <Text style={styles.title}>
        <Text style={styles.titleBold}>Identify</Text> Plants
      </Text>

      {/* Take a Photo card */}
      <Pressable
        style={styles.card}
        onPress={() => nav.navigate('Camera')}
        android_ripple={{ color: '#00000020' }}
      >
        <ImageBackground
          source={require('../../assets/TakePhoto.png')}
          imageStyle={styles.cardImage}
          style={styles.cardBg}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.05)']}
            style={styles.gradient}
          />
          <Text style={styles.cardText}>Take a Photo</Text>
        </ImageBackground>
      </Pressable>

      {/* Choose from Library card */}
      <Pressable
        style={[styles.card, { marginTop: 14 }]}
        onPress={openLibrary}
        android_ripple={{ color: '#00000020' }}
      >
        <ImageBackground
          source={require('../../assets/Library.png')}
          imageStyle={styles.cardImage}
          style={styles.cardBg}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.18)', 'rgba(0,0,0,0.04)']}
            style={styles.gradient}
          />
          <Text style={styles.cardText}>Choose from Library</Text>
        </ImageBackground>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24, // keep above bottom bar
    backgroundColor: '#F6F9F4',
  },
  title: { fontSize: 28, color: '#3b3b3b', marginVertical: 8 },
  titleBold: { fontWeight: '800', color: '#2b2b2b' },

  card: { borderRadius: 16, overflow: 'hidden' },
  cardBg: { height: 160, justifyContent: 'flex-end' },
  cardImage: { borderRadius: 16 },
  gradient: { ...StyleSheet.absoluteFillObject, borderRadius: 16 },
  cardText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    padding: 16,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowRadius: 12,
  },
});
