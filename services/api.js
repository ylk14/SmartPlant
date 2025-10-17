// api.js
// All backend API connection functions are stored here

const API_BASE_URL = "https://your-backend-server.com/api"; 
// 🔧 Backend team: replace with your actual base URL later

// ======================
// LOGIN FUNCTION
// ======================
//mock version for testing
export const loginUser = async (email, password) => {
  console.log("Logging in:", email, password);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // simulate login success only for test credentials
      if (email === "test@example.com" && password === "12345678") {
        resolve({ success: true });
      } else {
        reject(new Error("Invalid email or password"));
      }
    }, 1000);
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
