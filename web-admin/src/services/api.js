import axios from 'axios';

// Web-specific configuration
const PORT = 3000;
const HOST = 'localhost'; // or your server IP
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

// Mock data for web version
const MOCK_ACCOUNTS = {
  "admin@smartplant.dev": { password: "admin123", role: "admin" },
  "ranger@smartplant.dev": { password: "user1234", role: "user" },
};

// Login function for web
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

// Chat function for web (Now connected to the real backend)
export const postChatMessage = async (query) => {
  try {
    // Calls POST /api/chat (from your dataRoutes.js)
    // We override the default timeout to 90 seconds, as the AI can be slow.
    const { data } = await api.post(
      '/api/chat', 
      { query },
      { timeout: 90000 } // 90-second timeout
    );
    return data; // Returns { reply: "..." }
  } catch (error) {
    console.error("Error in postChatMessage:", error);
    // This will throw the error so the chat component can catch it
    throw error; 
  }
};

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


// Dashboard API functions
export const fetchDashboardStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return await response.json();
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

export const fetchRecentActivities = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/activities`);
    if (!response.ok) throw new Error('Failed to fetch recent activities');
    return await response.json();
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    throw error;
  }
};

export const fetchSystemStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/status`);
    if (!response.ok) throw new Error('Failed to fetch system status');
    return await response.json();
  } catch (error) {
    console.error("Error fetching system status:", error);
    throw error;
  }
};

// --- ⬇️ FUNCTIONS NEEDED FOR IOT.JSX ⬇️ ---

/**
 * Fetches the full list of all devices for the admin dashboard.
 * API Endpoint: GET /api/devices/all
 */
export const fetchDevices = async () => {
  const { data } = await api.get("/api/devices/all");
  return data;
};

/**
 * Resolves all active alerts for a specific device.
 * API Endpoint: POST /api/alerts/resolve/device/:id
 */
export const resolveDeviceAlerts = async (deviceId) => {
  const { data } = await api.post(
    `/api/alerts/resolve/device/${deviceId}`
  );
  return data;
};

/**
 * Fetches the list of all species for the dropdown.
 * API Endpoint: GET /api/species/all
 */
export const fetchSpeciesList = async () => {
  const { data } = await api.get("/api/species/all"); 
  return data;
};

/**
 * Adds a new device to the database.
 * API Endpoint: POST /api/devices/add
 */
export const addNewDevice = async (deviceData) => {
  // { device_name, species_id, latitude, longitude }
  const { data } = await api.post("/api/devices/add", deviceData);
  return data;
};