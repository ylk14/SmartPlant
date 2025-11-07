// api.js
// All backend API connection functions are stored here

const API_BASE_URL = "http://192.168.88.39:3000/api"; 
// 🔧 Backend team: replace with your actual base URL later

// ======================
// LOGIN FUNCTION
// ======================
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

//remove mock and use this real one
//export const loginUser = async (email, password) => {
  //try {
    //const response = await fetch(`${API_BASE_URL}/login`, {
      //method: "POST",
      //headers: {
        //"Content-Type": "application/json",
      //},
      //body: JSON.stringify({ email, password }),
    //});

    //if (!response.ok) {
      //throw new Error("Login failed. Please check your credentials.");
    //}

    //const data = await response.json();
    //return data; // backend should return something like { success: true, token: "..." }
  //} catch (error) {
    //console.error("Login API error:", error);
    //throw error;
  //}
//};

// ======================
// SIGN UP FUNCTION
// ======================
// ✅ Temporary mock backend
//replace the fake version after come out with the real one
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

//replace the api url after this and remove the mock version above
//export const registerUser = async (userData) => {
  //try {
    //const response = await fetch(`${API_BASE_URL}/register`, {
      //method: "POST",
      //headers: {
        //"Content-Type": "application/json",
      //},
      //body: JSON.stringify(userData),
    //});

    //if (!response.ok) {
      //throw new Error("Failed to register. Please try again.");
    //}

    //const data = await response.json();
    //return data;
  //} catch (error) {
    //console.error("Register API error:", error);
    //throw error;
  //}
//};

// ======================
// FORGOT PASSWORD FUNCTION
// ======================
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

// ======================
// IOT SENSOR FUNCTIONS
// ======================

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

// (Optional) Fetch specific sensor by ID
export const fetchSensorById = async (sensorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/iot/lastest/${sensorId}`);
    if (!response.ok) throw new Error("Failed to fetch sensor detail");
    return await response.json();
  } catch (error) {
    console.error("Error fetching sensor detail:", error);
    throw error;
  }
};