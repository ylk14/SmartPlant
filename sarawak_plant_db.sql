-- SARAWAK PLANT DATABASE - PROPERLY ORDERED SCHEMA

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

DROP DATABASE plant_db;

CREATE DATABASE IF NOT EXISTS `plant_db`;
USE `plant_db`;


-- 1. Roles Table 
CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Species Table 
CREATE TABLE `species` (
  `species_id` int(11) NOT NULL AUTO_INCREMENT,
  `scientific_name` varchar(255) DEFAULT NULL,
  `common_name` varchar(255) DEFAULT NULL,
  `is_endangered` tinyint(1) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`species_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Users Table 
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `role_id` int(11) DEFAULT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. Sensor_Devices Table 
CREATE TABLE `sensor_devices` (
  `device_id` int(11) NOT NULL AUTO_INCREMENT,
  `device_name` varchar(100) DEFAULT NULL,
  `species_id` int(11) DEFAULT NULL,
  `location_latitude` decimal(9,6) DEFAULT NULL,
  `location_longitude` decimal(9,6) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`device_id`),
  KEY `species_id` (`species_id`),
  CONSTRAINT `species_ibfk_1` FOREIGN KEY (`species_id`) REFERENCES `species` (`species_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 5. Sensor_Readings Table 
CREATE TABLE `sensor_readings` (
  `reading_id` int(11) NOT NULL AUTO_INCREMENT,
  `device_id` int(11) DEFAULT NULL,
  `temperature` decimal(4,2) DEFAULT NULL,
  `humidity` float DEFAULT NULL,
  `soil_moisture` float DEFAULT NULL,
  `motion_detected` tinyint(1) DEFAULT NULL,
  `alert_generated` tinyint(1) DEFAULT 0,
  `reading_timestamp` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`reading_id`),
  KEY `device_id` (`device_id`),
  CONSTRAINT `sensor_readings_ibfk_1` FOREIGN KEY (`device_id`) REFERENCES `sensor_devices` (`device_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 6. Plant_Observations Table 
CREATE TABLE `plant_observations` (
  `observation_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `species_id` int(11) DEFAULT NULL,
  `photo_url` varchar(500) NOT NULL,
  `location_latitude` decimal(10,8) NOT NULL,
  `location_longitude` decimal(10,8) NOT NULL,
  `location_name` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `source` enum('camera','library') DEFAULT NULL,
  `status` enum('pending','verified','rejected') DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`observation_id`),
  KEY `user_id` (`user_id`),
  KEY `species_id` (`species_id`),
  CONSTRAINT `plant_observations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `plant_observations_ibfk_2` FOREIGN KEY (`species_id`) REFERENCES `species` (`species_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 7. AI_Results Table 
CREATE TABLE `ai_results` (
  `ai_result_id` int(11) NOT NULL AUTO_INCREMENT,
  `observation_id` int(11) DEFAULT NULL,
  `species_id` int(11) DEFAULT NULL,
  `confidence_score` decimal(5,4) DEFAULT NULL,
  `rank` tinyint(4) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`ai_result_id`),
  KEY `observation_id` (`observation_id`),
  KEY `species_id` (`species_id`),
  CONSTRAINT `ai_results_ibfk_1` FOREIGN KEY (`observation_id`) REFERENCES `plant_observations` (`observation_id`),
  CONSTRAINT `ai_results_ibfk_2` FOREIGN KEY (`species_id`) REFERENCES `species` (`species_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 8. Alerts Table 
CREATE TABLE `alerts` (
  `alert_id` int(11) NOT NULL AUTO_INCREMENT,
  `device_id` int(11) DEFAULT NULL,
  `reading_id` int(11) DEFAULT NULL,
  `alert_type` enum('motion','environment') NOT NULL,
  `alert_message` text NOT NULL,
  `is_resolved` tinyint(1) DEFAULT 0,
  `resolved_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`alert_id`),
  KEY `device_id` (`device_id`),
  KEY `reading_id` (`reading_id`),
  CONSTRAINT `alerts_ibfk_1` FOREIGN KEY (`device_id`) REFERENCES `sensor_devices` (`device_id`),
  CONSTRAINT `alerts_ibfk_2` FOREIGN KEY (`reading_id`) REFERENCES `sensor_readings` (`reading_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ==================== SAMPLE DATA ====================

-- 1. Insert Roles FIRST
INSERT INTO `roles` (`role_name`, `description`) VALUES 
('admin', 'System administrator'),
('researcher', 'Plant researcher'),
('public', 'General user');

-- 3. Insert Users 
INSERT INTO `users` (`role_id`, `username`, `email`, `password_hash`,  `avatar_url`) VALUES 
(1, 'Adil Rumy', 'test@example.com', 'password', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLpupyeOe_APhBJ1ydHfgqXO6ATCtwPDEOO9bzKoQd__wlSMBgc5gH-o-H3Iv4EXXhWs9jcpKMNs9WpG5tE2Ded0a8Q4v4G4nb10-JoWOP&s=10'),
(2, 'Adil Rumy2', 'test2@example.com', 'password2', NULL),
(3, 'Adil Rumy3', 'test3@example.com', 'password3', NULL);

-- 2. Insert Species 
-- 1. Rafflesia arnoldii
INSERT INTO `species` 
(`scientific_name`, `common_name`, `is_endangered`, `description`, `image_url`, `created_at`) 
VALUES 
(
  'Rafflesia arnoldii', 
  'Corpse Flower / Bunga Pakma', 
  1, 
  'A species of flowering plant in the parasitic genus Rafflesia. It is noted for producing the largest individual flower on Earth. It is endemic to the rainforests of Sumatra and Borneo.', 
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLpupyeOe_APhBJ1ydHfgqXO6ATCtwPDEOO9bzKoQd__wlSMBgc5gH-o-H3Iv4EXXhWs9jcpKMNs9WpG5tE2Ded0a8Q4v4G4nb10-JoWOP&s=10', 
  NOW()
);

-- 2. Nepenthes rajah
INSERT INTO `species` 
(`scientific_name`, `common_name`, `is_endangered`, `description`, `image_url`, `created_at`) 
VALUES 
(
  'Nepenthes rajah', 
  'Rajah Brooke\'s Pitcher Plant', 
  1, 
  'A carnivorous pitcher plant species of the family Nepenthaceae. It is endemic to Mount Kinabalu and neighbouring Mount Tambuyukon in Sabah, Malaysian Borneo. Nepenthes rajah is famous for its giant urn-shaped pitchers.', 
  NULL, 
  NOW()
);

-- 3. Dipterocarpus sarawakensis
INSERT INTO `species` 
(`scientific_name`, `common_name`, `is_endangered`, `description`, `image_url`, `created_at`) 
VALUES 
(
  'Dipterocarpus sarawakensis', 
  'Sarawak Keruing', 
  1, 
  'A species of tree in the family Dipterocarpaceae, endemic to Borneo. It is a large emergent tree growing up to 50m tall, found in mixed dipterocarp forests on sandy clay soils.', 
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Dipterocarpus_oblongifolius_foliage.jpg/640px-Dipterocarpus_oblongifolius_foliage.jpg', 
  NOW()
);

INSERT INTO `plant_observations` 
(`user_id`, `species_id`, `photo_url`, `location_latitude`, `location_longitude`, `location_name`, `notes`, `source`, `status`, `created_at`)
VALUES
(1, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLpupyeOe_APhBJ1ydHfgqXO6ATCtwPDEOO9bzKoQd__wlSMBgc5gH-o-H3Iv4EXXhWs9jcpKMNs9WpG5tE2Ded0a8Q4v4G4nb10-JoWOP&s=10', 3.13900300, 101.68685500, 'Kuala Lumpur City Park', 'Observed near the pond area, healthy leaves and flowering.', 'camera', 'pending', NOW()),
(1, 2, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLpupyeOe_APhBJ1ydHfgqXO6ATCtwPDEOO9bzKoQd__wlSMBgc5gH-o-H3Iv4EXXhWs9jcpKMNs9WpG5tE2Ded0a8Q4v4G4nb10-JoWOP&s=10', 2.74560000, 101.70720000, 'Putrajaya Botanical Garden', 'Leaves appear slightly yellow, might indicate low nitrogen.', 'library', 'verified', NOW()),
(1, 3, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLpupyeOe_APhBJ1ydHfgqXO6ATCtwPDEOO9bzKoQd__wlSMBgc5gH-o-H3Iv4EXXhWs9jcpKMNs9WpG5tE2Ded0a8Q4v4G4nb10-JoWOP&s=10', 5.41410000, 100.32880000, 'Penang Hill', 'Found in shaded area with moist soil.', 'camera', 'rejected', NOW());

-- 4. Insert Sensor_Devices 
INSERT INTO `sensor_devices` (`device_name`, `species_id`, `location_latitude`, `location_longitude`, `is_active`) VALUES 
('Test Sensor Device', 1, 1.50000000, 110.30000000, 1),
('Test Sensor Device', 1, 1.50000000, 110.30000000, 1),
('Test Sensor Device', 2, 1.50000000, 110.30000000, 1),
('Test Sensor Device', 3, 1.50000000, 110.30000000, 1);

-- 5. Insert Sensor Readings
INSERT INTO `sensor_readings` 
(`device_id`, `temperature`, `humidity`, `soil_moisture`, `motion_detected`, `alert_generated`, `reading_timestamp`)
VALUES
(1, 26.45, 65.2, 45.8, 1, 1, '2025-11-07 08:15:00'),
(2, 26.45, 65.2, 45.8, 1, 1, '2025-11-07 08:15:00'),
(3, 26.45, 65.2, 45.8, 1, 1, '2025-11-07 08:15:00');

-- 6. Insert Alert Table
INSERT INTO `alerts` 
(`device_id`, `reading_id`, `alert_type`, `alert_message`, `is_resolved`, `resolved_at`, `created_at`)
VALUES
('1' , 1, 'motion', 'Possible intrusion detected.', 0, NULL, '2025-11-07 08:21:00'),
('2' , 2, 'environment', 'Humidity is low', 0, NULL, '2025-11-07 08:21:00'),
('3' , 3, 'environment', 'Temperature is low', 0, NULL, '2025-11-07 08:21:00'),
('3' , 3, 'motion', 'Habitat disturbance detected', 0, NULL, '2025-11-07 08:21:00');


COMMIT;