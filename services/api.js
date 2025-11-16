const PORT = 3000;
const HOST = '192.168.0.112';
// const HOST = '172.17.26.48';
export const API_BASE_URL = `http://${HOST}:${PORT}/api`;

// --- HELPER FUNCTION ---
// Handles errors and parsing for all API calls
async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Try to parse error, or return empty object
    const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
    console.error('API Error:', errorMessage);
    throw new Error(errorMessage);
  }
  // return empty object if no content
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  } else {
    return {}; 
  }
}

// ===================================================================
//                       ADMIN — USERS (POST-only)
// ===================================================================

export const fetchAdminUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Fetch admin users error:", error);
    throw error;
  }
};

export const fetchAdminUserById = async (user_id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Fetch admin user error:", error);
    throw error;
  }
};

export const updateAdminUser = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Update admin user error:", error);
    throw error;
  }
};

// ===================================================================
//                       ADMIN — ROLES (POST-only)
// ===================================================================

export const fetchRoles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/roles/list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Fetch roles error:", error);
    throw error;
  }
};

// ======================
// MFA FUNCTIONS (NO SECURITY)
// ======================

export const postVerifyMfa = async (challenge_id, otp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/mfa/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challenge_id, otp }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error in postVerifyMfa:", error);
    throw error;
  }
};

// ======================
// AUTH FUNCTIONS (NO SECURITY)
// ======================

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    // Use handleResponse for login
    return await handleResponse(response);
  } catch (error) {
    console.error("Login API error:", error);
    throw error;
  }
};

export const registerUser = async (userData) => { 
  try {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData), // { username, email, password }
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Register API error:", error);
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Forgot Password API error:", error);
    throw error;
  }
};

// ======================
// IOT SENSOR FUNCTIONS
// ======================

export const fetchSensorData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/iot/latest`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    throw error;
  }
};

export const fetchAllDeviceData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/devices/all`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching all device data:", error);
    throw error;
  }
};

export const postChatMessage = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error in postChatMessage:", error);
    throw error;
  }
};

export const resolveAlertsForDevice = async (deviceId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/resolve/device/${deviceId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error resolving alerts for device:", error);
    throw error;
  }
};

export const fetchDeviceHistory = async (deviceId, rangeKey) => {
  try {
    const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/history?range=${rangeKey}`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching device history:", error);
    throw error;
  }
};

export const fetchSpecies = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/species/all`);

    // Try to parse JSON safely
    const json = await response.json();

    // If backend returns an array directly
    if (Array.isArray(json)) {
      return json;
    }

    // If backend wraps it as { success, data: [...] }
    if (json && Array.isArray(json.data)) {
      return json.data;
    }

    console.warn('fetchSpecies: unexpected response shape', json);
    return [];
  } catch (error) {
    console.error('Error fetching species:', error);
    throw error;
  }
};

export const fetchObservationsBySpecies = async (speciesId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/observations/species/${speciesId}`);
    const json = await response.json();
    return json;   // must return { success, data: [...] }
  } catch (error) {
    console.error("Error fetching observations by species:", error);
    throw error;
  }
};

export const fetchSpeciesList = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/species/all`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching species list:", error);
    throw error;
  }
};

export const fetchAllSpecies = fetchSpeciesList;

export const addNewDevice = async (deviceData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/devices/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deviceData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Error adding new device:", error);
    throw error;
  }
};

// ======================
// USER PROFILE FUNCTIONS
// ======================

export const fetchUserProfile = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const fetchUserPosts = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/posts`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw error;
  }
};

// AI Functions 
export async function flagObservationUnsure(observationId, payload = {}) {
  const res = await fetch(
    `${API_BASE_URL}/admin/observations/${observationId}/flag-unsure`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );
  return handleResponse(res);
}

export async function confirmObservationLooksCorrect(observationId, payload = {}) {
  const res = await fetch(
    `${API_BASE_URL}/admin/observations/${observationId}/verify`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );
  return handleResponse(res);
}

export async function fetchPendingObservations(page = 1, pageSize = 100) {
  const url =
    `${API_BASE_URL}/admin/observations` +
    `?status=pending&page=${page}&page_size=${pageSize}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();  // { page, page_size, data, next_page, ... }
}

export async function approveObservation(id) {
  const res = await fetch(`${API_BASE_URL}/admin/observations/${id}/verify`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse(res);   // throws nice error if not ok
}

export async function rejectObservation(id) {
  const res = await fetch(`${API_BASE_URL}/admin/observations/${id}/reject`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse(res);
}

export async function confirmExistingSpecies(observationId, payload) {
  const body = {};
  if (payload?.species_id != null) {
    body.species_id = payload.species_id;
  }
  if (payload?.scientific_name) {
    body.scientific_name = payload.scientific_name;
  }

  const res = await fetch(
    `${API_BASE_URL}/admin/observations/${observationId}/confirm-existing`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  return handleResponse(res);
}

export async function confirmNewSpecies(observationId, payload) {
  const res = await fetch(
    `${API_BASE_URL}/admin/observations/${observationId}/confirm-new`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scientific_name: payload.scientific_name,
        common_name: payload.common_name,
        is_endangered: payload.is_endangered,
        description: payload.description,
      }),
    }
  );
  return handleResponse(res);
}

// ======================
// MAP
// ======================

export async function fetchMapObservations(isPublicUser) {
  const role = isPublicUser ? 'public' : 'admin';
  const res = await fetch(`${API_BASE_URL}/map/observations?role=${role}`);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to fetch map observations');
  }
  return json.data;
}

export async function updateObservationMask(observationId, isMasked) {
  const res = await fetch(
    `${API_BASE_URL}/admin/map/observations/${observationId}/mask`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_masked: isMasked }),
    }
  );

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to update mask');
  }
  return json;
}

export async function updateObservationLocation(observationId, payload) {
  const res = await fetch(
    `${API_BASE_URL}/admin/map/observations/${observationId}/location`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to update location');
  }
  return json;
}