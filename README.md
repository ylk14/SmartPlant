# SmartPlant Mobile App (Frontend)

React Native + Expo mobile app.
---

## 1. Prerequisites

Make sure you have these installed:

- Node.js (LTS version is recommended)
- npm (comes with Node)
- Expo CLI (installed locally via `npx`, no global install required)
- Android Studio  
  - Android SDK  
  - An Android Virtual Device (AVD) if you want to run the emulator
- Git (optional but useful)

Backend requirements:

- The AI backend (Node + Python) should be running on  
  **http://10.0.2.2:3000** when using the Android emulator.  
  If you change the backend port or host, update the URLs in the frontend code.

---

## 2. Setup

Clone the repo and install dependencies.

```bash
# clone your repo if needed
git clone https://github.com/ylk14/SmartPlant.git

# go into the frontend folder
cd SmartPlant

# install JavaScript dependencies
npm install
