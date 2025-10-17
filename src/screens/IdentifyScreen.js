// src/screens/IdentifyScreen.js
import { View, Text, Pressable, Image, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

// Tilt angles: right-card rotates inward (negative), left-card mirrors inward (positive)
const ROTATE_RIGHT_IN = '-38deg';
const ROTATE_LEFT_IN  = '38deg';

export default function IdentifyScreen() {
  const nav = useNavigation();

  // Pick from gallery and jump to Preview (unchanged)
  const openLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to choose a picture.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      exif: true,
    });
    if (!res.canceled && res.assets?.length) {
      const { uri, exif } = res.assets[0];
      nav.navigate('Preview', { uri, source: 'library', exif: exif ?? null });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Title */}
      <Text style={styles.title}>
        <Text style={styles.titleBold}>Identify</Text> Plants
      </Text>

      {/* Take a Photo — image on RIGHT, tilt inward */}
      <Pressable
        style={[styles.card, { marginTop: 15}]}
        onPress={() => nav.navigate('Camera')}
        android_ripple={{ color: '#00000020' }}
      >
        {/* slightly cooler green gradient like in figma */}
        <LinearGradient
          colors={['#8FC8A0', '#60966bff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.cardBg}
        >
          <Image
            source={require('../../assets/TakePhoto.png')}
            resizeMode="cover"
            style={[
              styles.cardImageBase,
              styles.cardImageRight,
              { transform: [{ rotate: ROTATE_RIGHT_IN }] },
            ]}
          />
          <Text style={styles.cardText}>Take a Photo</Text>
        </LinearGradient>
      </Pressable>

      {/* Choose from Library — image on LEFT, mirrored tilt inward */}
      <Pressable
        style={[styles.card, { marginTop: 30}]}
        onPress={openLibrary}
        android_ripple={{ color: '#00000020' }}
      >
        {/* warm cream→gold gradient like figma */}
        <LinearGradient
          colors={['#F8F0B6', '#d0cba3ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.cardBg}
        >
          <Image
            source={require('../../assets/Library.png')}
            resizeMode="cover"
            style={[
              styles.cardImageBase,
              styles.cardImageLeft,
              { transform: [{ rotate: ROTATE_LEFT_IN }] },
            ]}
          />
          <View style={styles.cardTextRightWrap}>
  <Text style={[styles.cardText, styles.cardTextRight, { color: '#565943' }]}>
    Choose{'\n'}from Library
  </Text>
</View>

        </LinearGradient>
      </Pressable>
    </SafeAreaView>
  );
}

const CARD_H = 180;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24, // keep above bottom bar
    backgroundColor: '#F6F9F4',
  },

  title: { fontSize: 35, color: '#2f2f2f', marginVertical: 18 },
  titleBold: {
    fontWeight: '800',
    color: '#263B2E',
    textShadowColor: 'rgba(0,0,0,0.12)',
    textShadowRadius: 6,
  },

  card: {
    borderRadius: 23,
    overflow: 'hidden',
    elevation: 7,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    backgroundColor: '#fff',
  },

  cardBg: {
    height: CARD_H,
    borderRadius: 23,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },

  /**
   * Image sizing/placement:
   * - Oversized so rotated image fully covers the card with no gaps.
   * - Right card pushes image to the right, left card mirrors to the left.
   */
  cardImageBase: {
    position: 'absolute',
    top: -10,
    width: CARD_H * 1.95,   // a bit larger to remove any empty background
    height: CARD_H * 1.75,
    opacity: 1,
    borderRadius: 16,
  },
  cardImageRight: {
    right: -120,
  },
  cardImageLeft: {
    left: -70,
    top: -30,
  },

  cardText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
    padding: 16,

  },

  cardTextRightWrap: {
  width: '100%',
  alignItems: 'flex-end', // push text to right
  paddingRight: 7,
  paddingBottom: 3,
},

cardTextRight: {
  textAlign: 'right',
  lineHeight: 34, // adjust spacing between "Choose" and "from Library"
},

});
