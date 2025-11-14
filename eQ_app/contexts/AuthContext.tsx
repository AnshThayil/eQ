import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, refreshToken as refreshAuthToken, setRefreshTokenCallback } from '@/services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (accessToken: string, refreshToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    loadTokens();
    // Register refresh token callback
    setRefreshTokenCallback(refreshAccessToken);
    
    return () => {
      // Cleanup callback on unmount
      setRefreshTokenCallback(null);
    };
  }, []);

  const loadTokens = async () => {
    try {
      const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      
      // Only set authenticated if we have both tokens
      if (accessToken && refreshToken) {
        setAuthToken(accessToken);
        setIsAuthenticated(true);
      } else if (accessToken || refreshToken) {
        // If we have only one token, clear both (corrupted state)
        await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        setAuthToken(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (accessToken: string, refreshToken: string) => {
    try {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      setAuthToken(accessToken);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      setAuthToken(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error removing tokens:', error);
      throw error;
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        // Clear auth state silently
        await signOut();
        throw new Error('No refresh token available');
      }

      const newAccessToken = await refreshAuthToken(refreshToken);
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
      setAuthToken(newAccessToken);
    } catch (error: any) {
      console.error('Error refreshing token:', error);
      // If refresh fails, sign out
      await signOut();
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        signIn,
        signOut,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
