import axios from 'axios';
import Constants from 'expo-constants';

// Get API URL from environment variable
const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL || 'https://unpolarized-tiana-irretraceable.ngrok-free.dev/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 10000,
});

// Token management
let authToken: string | null = null;
let refreshTokenCallback: (() => Promise<void>) | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = () => authToken;

export const setRefreshTokenCallback = (callback: (() => Promise<void>) | null) => {
  refreshTokenCallback = callback;
};

// Add response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 error and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry && refreshTokenCallback) {
      originalRequest._retry = true;
      try {
        await refreshTokenCallback();
        // Retry the original request with new token
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API Types
export interface Gym {
  id: number;
  name: string;
  walls?: Wall[];
  boulders?: Boulder[];
}

export interface Wall {
  id: number;
  name: string;
}

export interface Boulder {
  id: number;
  wall: number;
  setter: number | null;
  setter_grade: string;
  concensus_grade: string;
  color: string;
  difficulty: string;
  climbing_style: string;
  date_set: string;
  is_active: boolean;
  num_ascents: number;
  user_has_sent: boolean;
  ascents?: Ascent[];
}

export interface Ascent {
  id: number;
  climber: number;
  boulder: number;
  ascent_type: 'flash' | 'send';
  date_climbed: string;
  points: number;
}

export interface LeaderboardEntry {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  total_points: number;
  rank: number;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  ascents: {
    id: number;
    boulder_id: number;
    boulder_grade: string;
    boulder_color: string;
    wall_name: string;
    gym_name: string;
    ascent_type: 'flash' | 'send';
    date_climbed: string;
    points: number;
  }[];
  stats: {
    total_ascents: number;
    total_points: number;
    flash_count: number;
    send_count: number;
  };
}

// API Functions

// Authentication
export const login = async (username: string, password: string) => {
  const response = await apiClient.post('/auth/token/', { username, password });
  const { access, refresh } = response.data;
  setAuthToken(access);
  return { access, refresh };
};

export const refreshToken = async (refresh: string) => {
  const response = await apiClient.post('/auth/token/refresh/', { refresh });
  const { access } = response.data;
  setAuthToken(access);
  return access;
};

export const logout = async () => {
  const response = await apiClient.post('/auth/logout/');
  setAuthToken(null);
  return response.data;
};

// Gyms
export const getGyms = async (): Promise<Gym[]> => {
  const response = await apiClient.get('/gyms/');
  // Handle paginated response from DRF
  return response.data.results || response.data;
};

export const getGym = async (id: number): Promise<Gym> => {
  const response = await apiClient.get(`/gyms/${id}/`);
  return response.data;
};

export const createGym = async (data: { name: string }): Promise<Gym> => {
  const response = await apiClient.post('/gyms/', data);
  return response.data;
};

// Walls
export const createWall = async (gymId: number, data: { name: string }): Promise<Wall> => {
  const response = await apiClient.post(`/gyms/${gymId}/walls/`, data);
  return response.data;
};

export const updateWall = async (gymId: number, wallId: number, data: { name: string }): Promise<Wall> => {
  const response = await apiClient.put(`/gyms/${gymId}/walls/${wallId}/`, data);
  return response.data;
};

export const deleteWall = async (gymId: number, wallId: number): Promise<void> => {
  await apiClient.delete(`/gyms/${gymId}/walls/${wallId}/`);
};

// Boulders
export const getBoulders = async (): Promise<Boulder[]> => {
  const response = await apiClient.get('/boulders/');
  return response.data;
};

export const getBoulder = async (id: number): Promise<Boulder> => {
  const response = await apiClient.get(`/boulders/${id}/`);
  return response.data;
};

export const createBoulder = async (data: {
  wall: number;
  setter?: number;
  setter_grade: string;
  concensus_grade?: string;
  color: string;
  difficulty?: string;
  climbing_style?: string;
}): Promise<Boulder> => {
  const response = await apiClient.post('/boulders/', data);
  return response.data;
};

export const updateBoulder = async (id: number, data: Partial<Boulder>): Promise<Boulder> => {
  const response = await apiClient.put(`/boulders/${id}/`, data);
  return response.data;
};

export const deleteBoulder = async (id: number): Promise<void> => {
  await apiClient.delete(`/boulders/${id}/`);
};

// Ascents
export const logAscent = async (boulderId: number, ascentType: 'flash' | 'send'): Promise<{ ascent: any; boulder: Boulder }> => {
  const response = await apiClient.post(`/boulders/${boulderId}/ascent/`, {
    ascent_type: ascentType,
  });
  return response.data;
};

export const deleteAscent = async (boulderId: number): Promise<{ boulder: Boulder }> => {
  const response = await apiClient.delete(`/boulders/${boulderId}/ascent/`);
  return response.data;
};

// Leaderboard
export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const response = await apiClient.get('/leaderboard/');
  return response.data;
};

// Profile
export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get('/profile/');
  return response.data;
};

export default apiClient;
