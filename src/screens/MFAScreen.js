import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { postVerifyMfa } from "../../services/api";
import { useAuth } from "../context/AuthContext";

// Import correct route constants
import { ADMIN_ROOT, ROOT_TABS } from "../navigation/routes";

export default function MFAScreen({ route, navigation }) {
  const { challenge_id, email } = route.params || {};
  const { login } = useAuth();

  const [mfaCode, setMfaCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");

  // Countdown timer
  useEffect(() => {
    setTimeLeft(30);
    setCanResend(false);

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVerify = async () => {
    if (mfaCode.length !== 6) {
      setError("Please enter 6 digits");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await postVerifyMfa(challenge_id, mfaCode);
      console.log("MFA result:", result);

      if (!result.success || !result.user) {
        setError(result.message || "Verification failed");
        return;
      }

      const user = result.user;

      // Save user profile to AuthContext
      await login(user);

      Alert.alert("Success", "Verification passed!");

        setTimeout(() => {
          if (user.role_id === 1 || user.role_id === 2) {
            navigation.reset({
              index: 0,
              routes: [{ name: ADMIN_ROOT }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: ROOT_TABS }],
            });
          }
        }, 50);

    } catch (err) {
      console.error("MFA error:", err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="mail" size={32} color="#fff" />
        </View>

        <Text style={styles.title}>Email Verification</Text>
        <Text style={styles.subtitle}>
          Enter the code sent to <Text style={{ color: "#9ADE7B" }}>{email}</Text>
        </Text>

        <TextInput
          style={styles.input}
          maxLength={6}
          keyboardType="numeric"
          value={mfaCode}
          onChangeText={setMfaCode}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[
            styles.verifyButton,
            mfaCode.length !== 6 && { opacity: 0.5 },
          ]}
          disabled={loading || mfaCode.length !== 6}
          onPress={handleVerify}
        >
          <Text style={styles.verifyButtonText}>
            {loading ? "Verifying..." : "Verify Code"}
          </Text>
        </TouchableOpacity>

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn’t receive the code?</Text>
          <TouchableOpacity
            disabled={!canResend}
            onPress={() => Alert.alert("Sent", "New OTP sent")}
          >
            <Text
              style={[
                styles.resendButtonText,
                !canResend && { color: "#999" },
              ]}
            >
              {canResend ? "Resend Code" : `Resend in ${timeLeft}s`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030712",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#78a756",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#F9FAFB",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#D1D5DB",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 18,
    color: "#E5E7EB",
    textAlign: "center",
    letterSpacing: 4,
    marginBottom: 10,
    backgroundColor: "#020617",
  },
  error: {
    color: "#F87171",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  verifyButton: {
    width: "100%",
    backgroundColor: "#78a756",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resendRow: {
    flexDirection: "row",
    marginTop: 16,
    alignItems: "center",
  },
  resendText: { color: "#6B7280", marginRight: 6 },
  resendButtonText: {
    color: "#78a756",
    fontWeight: "600",
  },
});
