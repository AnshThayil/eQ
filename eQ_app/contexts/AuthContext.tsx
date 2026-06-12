import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, refreshToken as refreshAuthToken, setRefreshTokenCallback, logout as apiLogout } from '@/services/api';
import logger from '@/services/logger';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string | null;
  isStaff: boolean;
  signIn: (accessToken: string, refreshToken: string, username: string, isStaff?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USERNAME_KEY = 'username';
const IS_STAFF_KEY = 'is_staff';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [isStaff, setIsStaff] = useState(false);

  const loadTokens = useCallback(async () => {
    try {
      const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      const storedUsername = await AsyncStorage.getItem(USERNAME_KEY);
      const storedIsStaff = await AsyncStorage.getItem(IS_STAFF_KEY);
      
      // Only set authenticated if we have both tokens
      if (accessToken && refreshToken) {
        setAuthToken(accessToken);
        setIsAuthenticated(true);
        setUsername(storedUsername);
        setIsStaff(storedIsStaff === 'true');
      } else if (accessToken || refreshToken) {
        // If we have only one token, clear both (corrupted state)
        await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        await AsyncStorage.removeItem(USERNAME_KEY);
        await AsyncStorage.removeItem(IS_STAFF_KEY);
        setAuthToken(null);
        setIsAuthenticated(false);
        setUsername(null);
        setIsStaff(false);
      } else {
        setUsername(storedUsername);
      }
    } catch (error) {
      logger.error('Error loading tokens:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = async (accessToken: string, refreshToken: string, username: string, staffFlag?: boolean) => {
    try {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      await AsyncStorage.setItem(USERNAME_KEY, username);
      await AsyncStorage.setItem(IS_STAFF_KEY, String(staffFlag ?? false));
      setAuthToken(accessToken);
      setIsAuthenticated(true);
      setUsername(username);
      setIsStaff(staffFlag ?? false);
    } catch (error) {
      logger.error('Error saving tokens:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const storedRefreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (storedRefreshToken) {
        try {
          await apiLogout(storedRefreshToken);
        } catch {
          // Server-side blacklist failure is non-fatal — clear local tokens regardless
        }
      }
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      await AsyncStorage.removeItem(USERNAME_KEY);
      await AsyncStorage.removeItem(IS_STAFF_KEY);
      setAuthToken(null);
      setIsAuthenticated(false);
      setUsername(null);
      setIsStaff(false);
    } catch (error) {
      logger.error('Error removing tokens:', error);
      throw error;
    }
  };

  const refreshAccessToken = useCallback(async () => {
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
      logger.error('Error refreshing token:', error);
      // If refresh fails, sign out
      await signOut();
      throw error;
    }
  }, []);

  useEffect(() => {
    loadTokens();
    setRefreshTokenCallback(refreshAccessToken);

    return () => {
      setRefreshTokenCallback(null);
    };
  }, [loadTokens, refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        username,
        isStaff,
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
