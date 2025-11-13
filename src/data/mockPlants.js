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


export const MOCK_IDENTIFY_RESULT = {
  plantName: 'Nepenthes rafflesiana',
  confidence: 80, // number, not string
  conservationStatus: 'Endangered',
  region: 'Southeast Asia',
  locationName: 'National Park, Sarawak',
  uploadedBy: 'Kelly Then',
  // Preview will overwrite these at runtime:
  uploadDate: '2025-10-01T10:00:00Z',
  photoUri: null,
}; 
export const MOCK_POSTS = [
  {
    id: 'obs_001',
    speciesName: 'Nepenthes rafflesiana',
    scientificName: 'Nepenthes rafflesiana',
    commonName: "Raffles' Pitcher Plant",
    isEndangered: true,
    flagged: false,
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
    uploadedBy: 'Kelly Then',
    userId: 2001,
    source: 'camera',
  },
  {
    id: 'obs_002',
    speciesName: 'Rafflesia arnoldii',
    scientificName: 'Rafflesia arnoldii',
    commonName: 'Corpse Flower',
    isEndangered: true,
    flagged: true,
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
    uploadedBy: 'Ranger Amir',
    userId: 2002,
    source: 'library',
  },
  {
    id: 'obs_003',
    speciesName: 'Unknown (Possible Nepenthes sp.)',
    scientificName: 'Nepenthes sp.',
    commonName: 'Pitcher plant (uncertain)',
    isEndangered: false,
    flagged: false,
    photoUri:
      'https://upload.wikimedia.org/wikipedia/commons/8/86/Nepenthes_mirabilis6.jpg',
    createdAt: '2025-09-12T08:05:00.000Z',
    confidence: 42,
    region: 'Unknown',
    locationName: 'Trailside',
    latitude: 1.3001,
    longitude: 103.8003,
    notes: 'Blurry image; AI not confident. Should re-scan or flag.',
    uploadedBy: 'Sherlyn Lau',
    userId: '030825',
    source: 'camera',
  },
];

export const MOCK_ROLES = [
  {
    roleId: 1,
    roleName: 'Admin',
    description: 'Manages platform settings and reviews escalations.',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    roleId: 2,
    roleName: 'Ranger',
    description: 'Field ranger responsible for on-site verification.',
    createdAt: '2025-02-10T10:00:00.000Z',
  },
  {
    roleId: 3,
    roleName: 'Citizen Scientist',
    description: 'Community member contributing plant observations.',
    createdAt: '2025-03-04T09:15:00.000Z',
  },
];

export const MOCK_USERS = [
  {
    userId: 2001,
    roleId: 3,
    username: 'Kelly Then',
    email: 'kelly.then@example.com',
    phone: '+60 12-345 6789',
    passwordHash: '***',
    avatarUrl: 'https://i.pravatar.cc/150?img=52',
    createdAt: '2025-08-15T08:22:00.000Z',
  },
  {
    userId: 2002,
    roleId: 2,
    username: 'Ranger Amir',
    email: 'amir.ranger@example.com',
    phone: '+60 11-2100 5566',
    passwordHash: '***',
    avatarUrl: 'https://i.pravatar.cc/150?img=36',
    createdAt: '2025-06-03T11:40:00.000Z',
  },
  {
    userId: 2003,
    roleId: 1,
    username: 'Admin Lee',
    email: 'admin.lee@example.com',
    phone: '+60 13-776 4231',
    passwordHash: '***',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    createdAt: '2025-04-26T17:05:00.000Z',
  },
];

export const MOCK_SPECIES = [
  {
    speciesId: 101,
    scientificName: 'Nepenthes rafflesiana',
    commonName: "Raffles' Pitcher Plant",
    isEndangered: true,
    description:
      'A widespread lowland pitcher plant native to Borneo and Sumatra, known for its colorful trumpet-shaped traps.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Nepenthes_rafflesiana1.jpg',
    createdAt: '2025-05-12T09:30:00.000Z',
  },
  {
    speciesId: 102,
    scientificName: 'Rafflesia arnoldii',
    commonName: 'Corpse Flower',
    isEndangered: true,
    description:
      'Produces the largest individual flower on earth with a strong odor to attract pollinators.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Rafflesia_arnoldii_2.jpg',
    createdAt: '2025-05-18T14:20:00.000Z',
  },
  {
    speciesId: 103,
    scientificName: 'Nepenthes mirabilis',
    commonName: 'Common swamp pitcher-plant',
    isEndangered: false,
    description: 'A hardy species often found in peat swamp forests and roadside ditches.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Nepenthes_mirabilis6.jpg',
    createdAt: '2025-05-24T16:45:00.000Z',
  },
  {
    speciesId: 104,
    scientificName: 'Dendrobium anosmum',
    commonName: 'Philippine dendrobium',
    isEndangered: false,
    description:
      'An epiphytic orchid with fragrant purple flowers, frequently cultivated in Southeast Asia.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Dendrobium_anosmum.jpg',
    createdAt: '2025-06-01T12:12:00.000Z',
  },
];

export const MOCK_SENSOR_DEVICES = [
  {
    deviceId: 'DEV-409A',
    deviceName: 'Rainforest Edge Camera',
    speciesId: 101,
    locationLatitude: 1.6107,
    locationLongitude: 110.4321,
    locationName: 'Sarawak Rainforest Edge',
    isActive: true,
    createdAt: '2025-07-01T08:00:00.000Z',
  },
  {
    deviceId: 'DEV-512B',
    deviceName: 'Bog Microclimate Station',
    speciesId: 103,
    locationLatitude: 1.3001,
    locationLongitude: 103.8003,
    locationName: 'Johor Peat Bog',
    isActive: true,
    createdAt: '2025-07-15T06:30:00.000Z',
  },
  {
    deviceId: 'DEV-927C',
    deviceName: 'Rafflesia Watch Node',
    speciesId: 102,
    locationLatitude: -3.7911,
    locationLongitude: 102.2655,
    locationName: 'Bengkulu Reserve',
    isActive: false,
    createdAt: '2025-07-22T13:45:00.000Z',
  },
];

export const MOCK_SENSOR_READINGS = [
  {
    readingId: 9001,
    deviceId: 'DEV-409A',
    temperature: 28.4,
    humidity: 82.2,
    soilMoisture: 67.5,
    motionDetected: true,
    readingStatus: 'processed',
    locationLatitude: 1.6108,
    locationLongitude: 110.4322,
    alertGenerated: false,
    timestamp: '2025-09-12T06:10:00.000Z',
  },
  {
    readingId: 9002,
    deviceId: 'DEV-512B',
    temperature: 30.1,
    humidity: 77.3,
    soilMoisture: 54.9,
    motionDetected: false,
    readingStatus: 'processed',
    locationLatitude: 1.3001,
    locationLongitude: 103.8005,
    alertGenerated: true,
    timestamp: '2025-09-12T06:05:00.000Z',
  },
  {
    readingId: 9003,
    deviceId: 'DEV-927C',
    temperature: 31.8,
    humidity: 69.9,
    soilMoisture: 40.1,
    motionDetected: true,
    readingStatus: 'pending',
    locationLatitude: -3.7910,
    locationLongitude: 102.2657,
    alertGenerated: true,
    timestamp: '2025-09-11T22:45:00.000Z',
  },
];

export const MOCK_ALERTS = [
  {
    alertId: 7001,
    deviceId: 'DEV-512B',
    readingId: 9002,
    alertType: 'humidity',
    alertMessage: 'Humidity dropped below safe threshold for Nepenthes mirabilis.',
    isResolved: false,
    resolvedAt: null,
    createdAt: '2025-09-12T06:06:00.000Z',
  },
  {
    alertId: 7002,
    deviceId: 'DEV-927C',
    readingId: 9003,
    alertType: 'device_offline',
    alertMessage: 'Device connectivity lost for over 6 hours.',
    isResolved: false,
    resolvedAt: null,
    createdAt: '2025-09-11T23:00:00.000Z',
  },
  {
    alertId: 7003,
    deviceId: 'DEV-409A',
    readingId: 9001,
    alertType: 'motion',
    alertMessage: 'Motion detected near endangered habitat.',
    isResolved: true,
    resolvedAt: '2025-09-12T07:20:00.000Z',
    createdAt: '2025-09-12T06:11:00.000Z',
  },
];

export const MOCK_AI_RESULTS = [
  {
    aiResultId: 3001,
    observationId: 'obs_001',
    speciesId: 101,
    confidenceScore: 0.884,
    rank: 1,
    createdAt: '2025-09-09T14:33:00.000Z',
  },
  {
    aiResultId: 3002,
    observationId: 'obs_001',
    speciesId: 103,
    confidenceScore: 0.072,
    rank: 2,
    createdAt: '2025-09-09T14:33:00.000Z',
  },
  {
    aiResultId: 3003,
    observationId: 'obs_003',
    speciesId: 103,
    confidenceScore: 0.422,
    rank: 1,
    createdAt: '2025-09-12T08:05:30.000Z',
  },
  {
    aiResultId: 3004,
    observationId: 'obs_002',
    speciesId: 102,
    confidenceScore: 0.742,
    rank: 1,
    createdAt: '2025-09-10T10:45:40.000Z',
  },
];
