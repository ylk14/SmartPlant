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
import { ADMIN_ROOT, ROOT_TABS } from '../navigation/routes';



export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser(email, password);
      if (response.success) {
        const destinations = {
          admin: ADMIN_ROOT,
          user: ROOT_TABS,
        };
        const destination = destinations[response.role] ?? ROOT_TABS;
        Alert.alert(
          "Login Successful",
          `Signed in as ${response.role === 'admin' ? 'administrator' : 'user'}.`
        );
        // TODO: Remember user if checked
        if (rememberMe) {
          console.log("User wants to be remembered:", email);
          // Later: save token or user info securely
        }
        navigation.reset({
          index: 0,
          routes: [{ name: destination }],
        });

      }
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Forgot Password placeholder
  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Missing Email", "Please enter your registered email first.");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      Alert.alert("Check Your Inbox", "Password reset link sent!");
      console.log("Password reset requested for:", email);
    } catch (error) {
      Alert.alert("Error", "Unable to process request.");
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
        <Text style={styles.subtitle}>
          Join us today and explore our amazing features!
        </Text>

        {/* ✅ Buttons to switch between Sign Up / Login */}
        <View style={styles.switchButtons}>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => navigation.navigate("SignUp")}
          >
            <Text style={styles.switchText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.switchButton, styles.activeButton]}>
            <Text style={[styles.switchText, styles.activeText]}>Login</Text>
          </TouchableOpacity>
        </View>

        {/* ✅ Email Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#ccc"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* ✅ Password Field */}
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

        {/* ✅ Custom Remember Me Checkbox */}
        <View style={styles.rowContainer}>
          <TouchableOpacity
            style={styles.rememberContainer}
            onPress={() => setRememberMe(!rememberMe)}
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


        {/* ✅ Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? "Loading..." : "Login"}
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    width: "100%",
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    position: "absolute",
    right: 10,
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
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
