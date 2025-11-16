// src/screens/FlagUnsureScreen.js
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ROOT_TABS, TAB_HOME, TAB_IDENTIFY } from '../navigation/routes'; 
export default function FlagUnsureScreen() {
  const nav = useNavigation();

  const goHome = () => {
    nav.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: ROOT_TABS, params: { screen: TAB_HOME } }],
      })
    );
  };

  const goScan = () => {
    nav.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: ROOT_TABS, params: { screen: TAB_IDENTIFY } }],
      })
    );
  };

  return (
    <SafeAreaView style={s.container} edges={['top', 'left', 'right']}>
      <View style={s.center}>
        <Ionicons name="checkmark-circle" size={100} color="#6DAF7A" />
        <Text style={s.title}>Your report has been submitted for admin review.</Text>
        <Text style={s.subtext}>We’ll notify you once the identification is verified.</Text>

        <View style={s.btnRow}>
          <Pressable style={[s.btn, s.btnOutline]} onPress={goHome}>
            <Text style={[s.btnText, s.outlineTxt]}>Back to Home</Text>
          </Pressable>
          <Pressable style={[s.btn, s.btnSolid]} onPress={goScan}>
            <Text style={s.btnText}>Capture Again</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  title: { fontSize: 18, fontWeight: '700', color: '#333', textAlign: 'center', marginTop: 16 },
  subtext: { color: '#666', textAlign: 'center', marginTop: 8 },
  btnRow: { marginTop: 30, width: '100%' },
  btn: { borderRadius: 10, paddingVertical: 14, marginBottom: 14, alignItems: 'center' },
  btnSolid: { backgroundColor: '#6DAF7A' },
  btnOutline: { borderWidth: 2, borderColor: '#6DAF7A' },
  btnText: { fontWeight: '700', color: '#fff', fontSize: 16 },
  outlineTxt: { color: '#6DAF7A' },
});
