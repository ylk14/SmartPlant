// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserProfile } from '../../services/api'; // We'll use this to re-validate the user

// Create the context
const AuthContext = createContext();

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app start, check if a user token is saved in storage
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        if (savedToken) {
          // We found a token, now let's get the user profile
          // This also validates the token
          const profile = await fetchUserProfile('me', savedToken); 
          setUser(profile);
          setToken(savedToken);
        }
      } catch (e) {
        console.warn('Failed to load user from storage', e);
        // Token might be invalid, so clear it
        await AsyncStorage.removeItem('userToken');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Login function
  const login = async (userData, authToken, rememberMe) => {
    setUser(userData);
    setToken(authToken);
    if (rememberMe) {
      await AsyncStorage.setItem('userToken', authToken);
    }
  };

  // Logout function
  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('userToken');
  };

  // Show a loading spinner while we check for a saved user
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Pass the state and functions to all children
  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily access the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};