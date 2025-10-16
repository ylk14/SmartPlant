// src/data/mockPlants.js

// Mock user (replace later with real user data)
export const mockUser = {
  username: 'Sherlyn Lau',
  uid: '030825',
  avatar: 'https://i.pravatar.cc/150?img=15',
};

// Tip: If you want to use local assets instead of remote URLs,
// you can set photoUri to require('../../assets/NepenthesRafflesiana.jpeg')
// and the Image component will accept it (see ProfileScreen renderItem).

export const MOCK_POSTS = [
  {
    id: 'obs_001',
    speciesName: 'Nepenthes rafflesiana',
    scientificName: 'Nepenthes rafflesiana',
    commonName: "Raffles' Pitcher Plant",
    isEndangered: true,
    photoUri:
      'https://upload.wikimedia.org/wikipedia/commons/e/e0/Nepenthes_rafflesiana1.jpg',
    // photoUri: require('../../assets/NepenthesRafflesiana.jpeg'), // ← local file example
    createdAt: '2025-09-09T14:32:00.000Z',
    confidence: 88,
    region: 'Southeast Asia',
    locationName: 'National Park, Sarawak',
    latitude: 1.6107,
    longitude: 110.4321,
    notes:
      'Found near shaded forest edge. Healthy pitcher coloration, moist soil.',
    uploadedBy: 'You',
    source: 'camera',
  },
  {
    id: 'obs_002',
    speciesName: 'Rafflesia arnoldii',
    scientificName: 'Rafflesia arnoldii',
    commonName: 'Corpse Flower',
    isEndangered: true,
    photoUri:
      'https://upload.wikimedia.org/wikipedia/commons/2/2f/Rafflesia_arnoldii_2.jpg',
    // photoUri: require('../../assets/Rafflesia.jpeg'),
    createdAt: '2025-09-10T10:45:00.000Z',
    confidence: 74,
    region: 'Sumatra, Indonesia',
    locationName: 'Bengkulu Reserve',
    latitude: -3.7911,
    longitude: 102.2655,
    notes: 'Blooming phase; strong odor. Large diameter.',
    uploadedBy: 'You',
    source: 'library',
  },
  {
    id: 'obs_003',
    speciesName: 'Unknown (Possible Nepenthes sp.)',
    scientificName: 'Nepenthes sp.',
    commonName: 'Pitcher plant (uncertain)',
    isEndangered: false,
    photoUri:
      'https://upload.wikimedia.org/wikipedia/commons/8/86/Nepenthes_mirabilis6.jpg',
    createdAt: '2025-09-12T08:05:00.000Z',
    confidence: 42,
    region: 'Unknown',
    locationName: 'Trailside',
    latitude: 1.3001,
    longitude: 103.8003,
    notes: 'Blurry image; AI not confident. Should re-scan or flag.',
    uploadedBy: 'You',
    source: 'camera',
  },

  {
  id: 'obs_123',
  speciesName: 'Nepenthes rafflesiana',
  commonName: "Raffles' Pitcher Plant",
  isEndangered: true,
  photoUri: 'https://…',
  createdAt: '2025-09-10T10:45:00Z',
  confidence: 82,
  region: 'Southeast Asia',
  locationName: 'National Park, Sarawak',
  flagged: false,
  source: 'camera',
  coords: { lat: 1.61, lon: 110.43 }
}

];
