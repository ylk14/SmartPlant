const userModel = require('../models/userModel');

// --- Register ---
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    
    // Create new user (using the dynamic role lookup)
    await userModel.createUser(username, email, password);
    res.status(201).json({ success: true, message: 'User registered successfully' });

  } catch (err) {
    // Handle database-level errors (like 'public' role not found)
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
};

// --- Login ---
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findUserByEmail(email);

    // Check password (plain text, as requested)
    if (!user || user.password_hash !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Get full profile data (including role_name)
    const profile = await userModel.getUserProfile(user.user_id);

    // Login success! Send user object. Token is null.
    res.json({ success: true, user: profile, token: null });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
};

// ⬇️ *** THIS FUNCTION IS NOW FIXED (NO SECURITY) *** ⬇️
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find the user
    const user = await userModel.findUserByEmail(email);
    
    if (user) {
      // User exists. In a real app, you'd send an email.
      console.log(`✅ Password reset requested for valid email: ${email}`);
      res.json({ success: true, message: 'Password reset email sent (simulation).' });
    } else {
      // User does NOT exist. Tell the frontend.
      console.log(`❌ Password reset requested for non-existent email: ${email}`);
      res.status(404).json({ success: false, message: 'Email not found in database.' });
    }

  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
};

// --- Get Profile ---
exports.getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await userModel.getUserProfile(id);
    
    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// --- Get Posts ---
exports.getUserPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const posts = await userModel.getUserPosts(id);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};