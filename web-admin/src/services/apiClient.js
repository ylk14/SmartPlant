import axios from "axios";

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_BACKEND_URL) ||
  "http://localhost:3000"; 
console.log("🔥 USING THIS apiClient.js");


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const postVerifyMfa = async (payload) => {
  const { data } = await apiClient.post("/api/mfa/verify", payload);
  return data;
};

export const fetchUsers = async () => {
  const { data } = await apiClient.post("/api/admin/users/list");

  return data || [];
};

export const getUser = async (userId) => {
  const { data } = await apiClient.post("/api/admin/users/get", {
    user_id: userId,
  });
  return data.user;
};

export const updateUser = async (userId, payload) => {
  const { data } = await apiClient.post("/api/admin/users/update", {
    user_id: userId,
    ...payload,
  });
  return data;
};

export const fetchRoles = async () => {
  const { data } = await apiClient.post("/api/admin/roles/list");
  return data.roles || [];
};

export const normalizeUser = (u) => ({
  ...u,
  active: u.is_active === 1 || u.is_active === true,
  role: u.role_name || u.role || "",
});


export const normalizeUserList = (list = []) =>
  list.map((u) => normalizeUser(u));

// --- NEW FUNCTIONS FOR IOT PAGE ---

/**
 * Fetches the full list of all devices for the admin dashboard.
 * API Endpoint: GET /api/devices/all
 */
export const fetchDevices = async () => {
  const { data } = await apiClient.get("/api/devices/all");
  return data;
};

/**
 * Resolves all active alerts for a specific device.
 * API Endpoint: POST /api/alerts/resolve/device/:id
 */
export const resolveDeviceAlerts = async (deviceId) => {
  // We send the raw deviceId (e.g., 14), not "DEV-014"
  const { data } = await apiClient.post(
    `/api/alerts/resolve/device/${deviceId}`
  );
  return data;
};

/**
 * Fetches the time-series history for a single device.
 * API Endpoint: GET /api/devices/:id/history
 */
export const fetchDeviceHistory = async (deviceId, range) => {
  // We use 'params' to send the range as a query string
  // e.g., /api/devices/12/history?range=7D
  const { data } = await apiClient.get(`/api/devices/${deviceId}/history`, {
    params: { range }, // 👈 --- This adds '?range=...' to the URL
  });
  return data;
};

/**
 * Logs in a user.
 * API Endpoint: POST /api/users/login
 */
export const loginUser = async (email, password) => {
  const { data } = await apiClient.post("/api/users/login", {
    email,
    password,
  });
  return data; // Returns { success: true, user: {...} } or { success: false, message: "..." }
};

// Fetch species list for the dropdown
export const fetchSpeciesList = async () => {
  try {
    const response = await fetch('/api/species', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch species: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching species list:', error);
    throw error;
  }
};

// Add new device
export const addNewDevice = async (deviceData) => {
  try {
    const response = await fetch('/api/devices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deviceData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to add device: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding device:', error);
    throw error;
  }
};

export default apiClient;

