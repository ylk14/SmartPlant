const cors = require('cors');
const express = require('express');

// --- Routes ---
const dataRoutes = require('./routes/dataRoutes');
const alertRoutes = require('./routes/alertRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const speciesRoutes = require('./routes/speciesRoute'); // For the 'Add Device' dropdown
const userRoutes = require('./routes/userRoutes');     // For the User Profile
//const aiRoutes = require('./routes/aiRoutes');         // For the AI Chat

// --- MQTT ---
const mqttClient = require('./mqtt/mqttClient'); // Initializes MQTT

const app = express();
const port = 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json()); // Lets Express understand JSON form data

// --- API Endpoints ---
app.use('/api', dataRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/devices', deviceRoutes);

// ⬇️ *** THIS IS THE FIX *** ⬇️
// Use the variable 'speciesRoutes' (plural) that you defined on line 8
app.use('/api/species', speciesRoutes);

app.use('/api/users', userRoutes);
//app.use('/api/ai', aiRoutes);

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});