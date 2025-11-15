const db = require('../config/db');

// --- NEW FUNCTION ---
// Find a user by their email address (for login)
exports.findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM Users WHERE email = ?';
    db.query(query, [email], (err, rows) => {
      if (err) {
        console.error('❌ Error finding user by email:', err);
        return reject(err); 
      }
      resolve(rows[0]); 
    });
  });
};

// --- UPDATED FUNCTION ---
// Create a new user in the database (now with dynamic role lookup)
exports.createUser = (username, email, plainTextPassword) => {
  return new Promise((resolve, reject) => {
    
    // 1. Find the 'public' role ID from the database
    const roleQuery = 'SELECT role_id FROM Roles WHERE role_name = ?';
    
    db.query(roleQuery, ['public'], (err, roles) => {
      if (err) {
        console.error('❌ Error finding role:', err);
        return reject(err);
      }
      
      // Check if 'public' role exists
      if (!roles || roles.length === 0) {
        const errMsg = "Database setup error: 'public' role not found in Roles table.";
        console.error(errMsg);
        return reject(new Error(errMsg));
      }
      
      const publicRoleId = roles[0].role_id;
      
      // 2. Now that we have the role ID, create the user
      const insertQuery = 'INSERT INTO Users (username, email, password_hash, role_id) VALUES (?, ?, ?, ?)';
      
      db.query(
        insertQuery, 
        [username, email, plainTextPassword, publicRoleId], 
        (insertErr, result) => {
          if (insertErr) {
            // This will catch duplicate email errors, etc.
            console.error('❌ Error creating user:', insertErr);
            return reject(insertErr);
          }
          // Successfully created the user
          resolve(result);
        }
      );
    });
  });
};

// --- UPDATED FUNCTION ---
// Get user profile (this now also gets the role_name for the login controller)
exports.getUserProfile = (userId) => {
  return new Promise((resolve, reject) => {
    
    // This query now joins with the Roles table to get the role_name
    const query = `
      SELECT 
        u.user_id, 
        u.username, 
        u.email, 
        u.avatar_url AS avatar,
        r.role_name  -- We get the role name (e.g., 'public', 'admin')
      FROM 
        Users u
      LEFT JOIN
        Roles r ON u.role_id = r.role_id
      WHERE 
        u.user_id = ?;
    `;
    
    db.query(query, [userId], (err, rows) => {
      if (err) {
        console.error('❌ Error fetching user profile:', err);
        return reject(err); 
      }
      resolve(rows[0]); 
    });
  });
};

// This function is unchanged from our previous fixes
exports.getUserPosts = (userId) => {
  return new Promise((resolve, reject) => {
    
    const query = `
      SELECT 
        o.observation_id,
        o.user_id,
        o.location_latitude AS latitude,   
        o.location_longitude AS longitude, 
        o.photo_url AS photo_url,
        o.created_at,
        o.notes,
        s.scientific_name,
        s.common_name,
        u.username AS uploadedBy
      FROM 
        Plant_Observations o
      LEFT JOIN 
        Species s ON o.species_id = s.species_id
      LEFT JOIN
        Users u ON o.user_id = u.user_id
      WHERE 
        o.user_id = ?
      ORDER BY 
        o.created_at DESC;
    `;
    
    db.query(query, [userId], (err, rows) => {
      if (err) {
        console.error('❌ Error fetching user posts:', err);
        return reject(err);
S      }
      
      const posts = rows.map(post => ({
        ...post,
        species_name: post.scientific_name || post.common_name || 'Unknown species'
      }));
      resolve(posts);
    });
  });
};