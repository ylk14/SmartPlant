import axios from 'axios';
import { Platform } from 'react-native';

const PORT = 3000;
const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const API_BASE_URL = `http://${HOST}:${PORT}`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

api.interceptors.request.use(cfg => {
  console.log('[api] ->', cfg.method?.toUpperCase(), cfg.baseURL + cfg.url);
  return cfg;
});
api.interceptors.response.use(
  r => r,
  err => {
    console.log('[api] <- error', err.response?.status, err.config?.url, err.response?.data);
    throw err;
  }
);

export default api;

// LOGIN FUNCTION
const MOCK_ACCOUNTS = {
  "admin@smartplant.dev": { password: "admin123", role: "admin" },
  "ranger@smartplant.dev": { password: "user1234", role: "user" },
};

//mock version for testing
export const loginUser = async (email, password) => {
  const key = email.trim().toLowerCase();
  console.log("Logging in:", key);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const account = MOCK_ACCOUNTS[key];
      if (account && account.password === password) {
        resolve({ success: true, role: account.role, email: key });
      } else {
        reject(new Error("Invalid email or password"));
      }
    }, 700);
  });
};

// SIGN UP FUNCTION
export const registerUser = async (userData) => { 
  console.log("Registering user:", userData);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate success if email not already “taken”
      if (userData.email !== "taken@example.com") {
        resolve({ success: true });
      } else {
        reject(new Error("Email already registered"));
      }
    }, 1000);
  });
};

// FORGOT PASSWORD FUNCTION
export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error("Failed to send reset link.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Forgot Password API error:", error);
    throw error;
  }
};

// IOT SENSOR FUNCTIONS
// Fetch all sensor readings
export const fetchSensorData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/iot/latest`);
    if (!response.ok) throw new Error("Failed to fetch sensor data");
    return await response.json();
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    throw error;
  }
};

export const fetchAllDeviceData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/devices/all`);
    if (!response.ok) {
      throw new Error('Failed to fetch all device data');
    }
    return await response.json(); // This will be an array
  } catch (error) {
    console.error("Error fetching all device data:", error);
    throw error;
  }
};

export const postChatMessage = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to get chat response');
    }
    
    return response.json();
  } catch (error) {
    console.error("Error in postChatMessage:", error);
    throw error;
  }
};

export const resolveAlertsForDevice = async (deviceId) => {
  try {
    // Note: deviceId here is the raw ID (e.g., 1, 2)
    const response = await fetch(`${API_BASE_URL}/alerts/resolve/device/${deviceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to resolve alerts for device');
    }
    return await response.json();
  } catch (error) {
    console.error("Error resolving alerts for device:", error);
    throw error;
  }
};