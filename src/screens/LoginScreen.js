import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { loginUser, forgotPassword } from "../../services/api";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // ------------------------------------------------------------
  // ✅ Helper: Mask email for messages
  const maskEmail = (email) => {
    if (!email) return "";
    const [local, domain] = email.split("@");
    if (!local || !domain) return email;
    const maskedLocal = local.slice(0, 2) + "*".repeat(local.length - 2);
    return `${maskedLocal}@${domain}`;
  };

  // ------------------------------------------------------------
  // ✅ Helper: Forgot password
  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Missing Email", "Please enter your registered email first.");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email);
      Alert.alert("Check Your Inbox", `Password reset link sent to ${maskEmail(email)}`);
    } catch (err) {
      Alert.alert("Error", "Unable to process request.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // 🔥 REAL LOGIN → triggers MFA
  const handleLoginPress = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser(email, password);

      console.log("[LoginScreen] Login response:", response);

      if (!response.success) {
        setLoading(false);

        // handle inactive account properly
        if (response.code === "ACCOUNT_INACTIVE") {
          Alert.alert(
            "Account Deactivated",
            "Your account has been deactivated. Please contact the administrator."
          );
          return;
        }

        // Other errors
        Alert.alert("Login Failed", response.message || "Invalid credentials");
        return;
      }

      // 🔥 navigate to MFA screen with challenge_id
      navigation.navigate("MFA", {
        challenge_id: response.challenge_id,
        email: email,
        role_name: response.role_name,
        user_id: response.user_id
      });


    } catch (err) {
      console.log("Login error:", err);
      Alert.alert("Login Error", err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/signup-bg.jpg")}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <Image
          source={require("../../assets/logo.jpg")}
          style={styles.logo}
        />

        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        <View style={styles.switchButtons}>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => navigation.navigate("SignUp")}
          >
            <Text style={styles.switchText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.switchButton, styles.activeButton]}>
            <Text style={[styles.switchText, styles.activeText]}>
              Login
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          {/* EMAIL */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#ccc"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* PASSWORD */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter your password"
                placeholderTextColor="#ccc"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.iconButton}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#ccc"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* REMEMBER ME + FORGOT */}
          <View style={styles.rowContainer}>
            <TouchableOpacity
              onPress={() => setRememberMe(!rememberMe)}
              style={styles.rememberContainer}
            >
              <Ionicons
                name={rememberMe ? "checkbox" : "square-outline"}
                size={22}
                color={rememberMe ? "#4CAF50" : "#ccc"}
              />
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* LOGIN BUTTON */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLoginPress}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "Checking..." : "Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#ddd",
    marginBottom: 20,
    textAlign: "center",
  },
  switchButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 25,
  },
  switchButton: {
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fff",
    marginHorizontal: 8,
  },
  switchText: {
    color: "#fff",
    fontWeight: "bold",
  },
  activeButton: {
    backgroundColor: "#78a756ff",
    borderColor: "#78a756ff",
  },
  activeText: {
    color: "#fff",
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  label: {
    color: "#fff",
    marginBottom: 5,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
  codeInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 4,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    position: "absolute",
    right: 10,
    padding: 8,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rememberText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 14,
  },
  forgotText: {
    color: "#78a756ff",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#78a756ff",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  mfaHeader: {
    alignItems: "center",
    marginBottom: 25,
  },
  mfaIconContainer: {
    backgroundColor: "rgba(120, 167, 86, 0.8)",
    padding: 15,
    borderRadius: 50,
    marginBottom: 15,
  },
  mfaTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  mfaSubtitle: {
    fontSize: 14,
    color: "#ddd",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 5,
  },
  emailHighlight: {
    fontWeight: "bold",
    color: "#78a756ff",
  },
  mfaHint: {
    fontSize: 13,
    color: "#bbb",
    textAlign: "center",
    marginBottom: 20,
  },
  mockCodeDisplay: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: "100%",
  },
  mockTitle: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    fontSize: 14,
  },
  mockCodeText: {
    color: "#ddd",
    textAlign: "center",
    fontSize: 13,
    marginBottom: 5,
  },
  codeHighlight: {
    backgroundColor: "#1F2937",
    color: "#FFFFFF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: "bold",
  },
  mockNote: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
  },
  mfaButtonGroup: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  backButton: {
    flex: 1,
    paddingVertical: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  verifyButton: {
    flex: 2,
    paddingVertical: 15,
    backgroundColor: "#78a756ff",
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "rgba(120, 167, 86, 0.5)",
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resendContainer: {
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  resendText: {
    color: "#ddd",
    fontSize: 13,
    marginBottom: 8,
  },
  resendButton: {
    color: "#78a756ff",
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});