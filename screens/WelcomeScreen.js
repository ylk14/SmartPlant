import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <ImageBackground
      source={require('../assets/welcome-bg.jpg')}  
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={styles.textContainer}>
        <Text style={styles.mainTitle}>Smart Plant</Text>
        <Text style={styles.subTitle}>Sarawak</Text>
        </View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.buttonText}>Let’s Begin</Text>
          </TouchableOpacity>

          <View style={styles.collabContainer}>
            <Text style={styles.collabText}>In collaboration with</Text>
              <Image
                source={require('../assets/logo.jpg')} 
                style={styles.logo}
                resizeMode="contain"
              />
          </View>
        </View>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Slight dark overlay for readability
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  mainTitle: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#fff',
    textAlign:'center',
  },
  subTitle:{
    fontSize:28,
        fontWeight: 'bold',

    color:'#fff',
    marginTop:1,
    textAlign:'center',

  },
  bottomContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
  },
  button: {
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 50,
    backgroundColor: 'transparent',
    marginBottom:20,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  collabContainer: {
    alignItems: 'center',
    gap: 6,
  },
  collabText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  logo: {
    width: 100,
    height: 100,
  },
});
