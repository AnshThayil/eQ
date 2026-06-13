import axios from 'axios';
import Constants from 'expo-constants';
import logger from './logger';

// Get API URL from environment variable
const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

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

    logger.error('[API]', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status ?? 'network error');
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

/**
 * A wall as it appears in the setter setting-schedule / queue.
 * The backend calls these "zones".
 */
export interface Zone {
  id: number;
  name: string;
  gym: number;
  gym_name: string;
  order: number;
  last_set: string | null;
  next_reset: string | null;
  next_reset_is_override: boolean;
  active_route_count: number;
}

export interface ZoneScheduleResponse {
  gym_id: number;
  setting_day: number | null;
  zones_per_reset: number;
  zones: Zone[];
}


export interface Boulder {
  id: number;
  wall: number;
  setter: number | null;
  tester: number | null;
  comments: string;
  setter_grade: string;
  concensus_grade: string;
  color: string;
  difficulty: string;
  climbing_style: string;
  date_set: string;
  is_active: boolean;
  num_ascents: number;
  user_has_sent: boolean;
  user_has_saved: boolean;
  ascents?: Ascent[];
  wall_details?: {
    id: number;
    name: string;
  };
  setter_details?: StaffUser | null;
  tester_details?: StaffUser | null;
}

/** A staff user as returned for setter/tester dropdowns and route details. */
export interface StaffUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  name: string;
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Ascent {
  id: number;
  climber: number;
  climber_details?: User;
  boulder: number;
  ascent_type: 'flash' | 'send';
  perceived_difficulty?: 'easy' | 'medium' | 'hard' | null;
  liked: boolean;
  date_climbed: string;
  points: number;
}

export interface ActivityAscent {
  id: number;
  climber: number;
  climber_details: User;
  boulder: number;
  ascent_type: 'flash' | 'send';
  perceived_difficulty: 'easy' | 'medium' | 'hard';
  perceived_difficulty_display: string;
  liked: boolean;
  date_climbed: string;
  points: number;
  boulder_grade: string;
  boulder_color: string;
  boulder_difficulty: string;
  boulder_climbing_style: string;
  wall_name: string;
  gym_name: string;
}

export interface LeaderboardEntry {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  total_points: number;
  index: number; // Continuous numbering (1, 2, 3, 4, 5, 6...)
  rank: number; // With ties (1, 2, 3, 4, 4, 6...)
}

export interface UserProfile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  stats: {
    total_ascents: number;
    highest_grade: string | null;
    strongest_climbing_style: string | null;
    climbs_by_level: Record<string, number>;
    flashes_by_level: Record<string, number>;
    climbing_style_distribution: Record<string, number>;
  };
  saved_climbs: SavedClimb[];
}

export interface SavedClimb {
  id: number;
  setter_grade: string;
  color: string;
  difficulty: string;
  climbing_style: string;
  wall_name: string;
  gym_name: string;
  num_ascents: number;
}

export interface ExploreClassVariation {
  id: number;
  service_group: number;
  service_group_name: string;
  service_type: 'membership' | 'class' | 'event';
  name: string;
  access_type: 'sessions' | 'unlimited' | 'single_day';
  num_sessions: number | null;
  price: string;
  duration_days: number | null;
  yoactiv_service_variation_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExploreClassGroup {
  id: number;
  gym: number;
  gym_name: string;
  name: string;
  description: string;
  service_type: 'membership' | 'class' | 'event';
  yoactiv_service_id: string;
  is_active: boolean;
  variations: ExploreClassVariation[];
  created_at: string;
  updated_at: string;
}

export interface ExploreResponse {
  classes: ExploreClassGroup[];
}

export interface ExploreMembershipsResponse {
  memberships: ExploreClassGroup[];
}

export interface ExploreEventsResponse {
  events: ExploreClassGroup[];
}

export interface ExploreActivePlan {
  service_id: number;
  service_group_id: number;
  service_group_name: string;
  service_type: 'membership' | 'class' | 'event';
  name: string;
  expiry_date: string | null;
  purchase_date: string | null;
  sessions_completed: number | string | null;
  total_num_sessions: number | string | null;
}

export interface ExploreActiveResponse {
  active_plans: ExploreActivePlan[];
}

// API Functions

// Authentication
export const login = async (username: string, password: string) => {
  const response = await apiClient.post('/auth/token/', { username, password });
  const { access, refresh, is_staff } = response.data;
  setAuthToken(access);
  return { access, refresh, isStaff: is_staff as boolean };
};

export const refreshToken = async (refresh: string) => {
  const response = await apiClient.post('/auth/token/refresh/', { refresh });
  const { access } = response.data;
  setAuthToken(access);
  return access;
};

export const logout = async (refresh: string) => {
  const response = await apiClient.post('/auth/logout/', { refresh });
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
export const getBoulders = async (params?: { wall?: number; is_active?: boolean }): Promise<Boulder[]> => {
  const response = await apiClient.get('/boulders/', { params });
  return response.data.results ?? response.data;
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

export const getStaffUsers = async (): Promise<StaffUser[]> => {
  const response = await apiClient.get('/staff-users/');
  return response.data.staff_users;
};

// Zones (setting schedule)
export const getZones = async (gymId?: number): Promise<ZoneScheduleResponse> => {
  const response = await apiClient.get('/zones/', {
    params: gymId ? { gym_id: gymId } : undefined,
  });
  return response.data;
};

export const updateZone = async (
  zoneId: number,
  data: { next_reset?: string | null; mark_up_next?: boolean },
): Promise<ZoneScheduleResponse> => {
  const response = await apiClient.patch(`/zones/${zoneId}/`, data);
  return response.data;
};

export const reorderZones = async (order: number[]): Promise<ZoneScheduleResponse> => {
  const response = await apiClient.post('/zones/reorder/', { order });
  return response.data;
};

export const resetZone = async (zoneId: number): Promise<{ detail: string; wall_id: number }> => {
  const response = await apiClient.post(`/zones/${zoneId}/reset/`);
  return response.data;
};


// Ascents
export const logAscent = async (
  boulderId: number,
  ascentType: 'flash' | 'send',
  difficulty: string,
  liked: boolean,
): Promise<{ ascent: Ascent; boulder: Boulder }> => {
  const response = await apiClient.post(`/boulders/${boulderId}/ascent/`, {
    ascent_type: ascentType,
    difficulty,
    liked,
  });
  return response.data;
};

export const deleteAscent = async (boulderId: number): Promise<{ boulder: Boulder }> => {
  const response = await apiClient.delete(`/boulders/${boulderId}/ascent/`);
  return response.data;
};

export interface SettingHistoryEntry {
  date: string;
  zones: string[];
  setters: string[];
  route_count: number;
}

export interface SettingHistoryResponse {
  history: SettingHistoryEntry[];
}

export interface SettingHistoryDetailResponse {
  date: string;
  routes: Boulder[];
}

export const getSettingHistory = async (): Promise<SettingHistoryResponse> => {
  const response = await apiClient.get('/setting-history/');
  return response.data;
};

export const getSettingHistoryDetail = async (date: string): Promise<SettingHistoryDetailResponse> => {
  const response = await apiClient.get(`/setting-history/${date}/`);
  return response.data;
};

export const getLatestAscents = async (): Promise<ActivityAscent[]> => {
  const response = await apiClient.get('/activity/');
  return response.data.ascents;
};

export const getMyAscents = async (): Promise<ActivityAscent[]> => {
  const response = await apiClient.get('/my-ascents/');
  return response.data.ascents;
};

// Saved Climbs
export const saveClimb = async (boulderId: number): Promise<{ detail: string; boulder: Boulder }> => {
  const response = await apiClient.post(`/boulders/${boulderId}/save/`, {});
  return response.data;
};

export const unsaveClimb = async (boulderId: number): Promise<{ boulder: Boulder }> => {
  const response = await apiClient.delete(`/boulders/${boulderId}/save/`);
  return response.data;
};

// Leaderboard
export const getLeaderboard = async (params?: {
  gym_id?: number | null;
  only_active?: boolean;
}): Promise<{ leaderboard: LeaderboardEntry[]; your_ranking: number | null; your_user_id: number | null }> => {
  const queryParams = new URLSearchParams();
  if (params?.gym_id) {
    queryParams.append('gym_id', params.gym_id.toString());
  }
  if (params?.only_active !== undefined) {
    queryParams.append('only_active', params.only_active.toString());
  }
  
  const url = `/leaderboard/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiClient.get(url);
  return response.data;
};

export interface PersonalInfo {
  name: string;
  email: string | null;
  phone: string | null;
  image: string | null;
  dob: string | null;
  emergency_contact_name: string | null;
  emergency_contact_number: string | null;
}

// Profile
export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get('/profile/');
  return response.data;
};

export const getPersonalInfo = async (): Promise<PersonalInfo> => {
  const response = await apiClient.get('/personal-info/');
  return response.data;
};

export const getExploreClasses = async (): Promise<ExploreResponse> => {
  const response = await apiClient.get('/explore-classes/');
  return response.data;
};

export const getExploreMemberships = async (): Promise<ExploreMembershipsResponse> => {
  const response = await apiClient.get('/explore-memberships/');
  return response.data;
};

export const getExploreEvents = async (): Promise<ExploreEventsResponse> => {
  const response = await apiClient.get('/explore-events/');
  return response.data;
};

export const getExploreActive = async (): Promise<ExploreActiveResponse> => {
  const response = await apiClient.get('/explore-active/');
  return response.data;
};

// Payment types
export interface PaymentOrderResponse {
  razorpay_order_id: string;
  amount_paise: number;
  currency: string;
  razorpay_key_id: string;
  prefill_name: string;
  prefill_email: string;
  prefill_contact: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface UserOrder {
  id: number;
  razorpay_order_id: string;
  service_name: string;
  service_type: string;
  amount_paise: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed';
  created_at: string;
}

// Payment API functions
export const createPaymentOrder = async (serviceId: number): Promise<PaymentOrderResponse> => {
  const response = await apiClient.post('/payments/create-order/', { service_id: serviceId });
  return response.data;
};

export const verifyPayment = async (payload: VerifyPaymentPayload): Promise<void> => {
  await apiClient.post('/payments/verify/', payload);
};

export const markPaymentFailed = async (razorpayOrderId: string): Promise<void> => {
  await apiClient.post('/payments/mark-failed/', { razorpay_order_id: razorpayOrderId });
};

export const getUserOrders = async (): Promise<UserOrder[]> => {
  const response = await apiClient.get('/payments/orders/');
  return response.data;
};

// User Settings
export interface UserSettings {
  leaderboard_opt_in: boolean;
  sends_visibility: 'everyone' | 'only_me';
}

export const getUserSettings = async (): Promise<UserSettings> => {
  const response = await apiClient.get('/settings/');
  return response.data;
};

export const updateUserSettings = async (settings: Partial<UserSettings>): Promise<UserSettings> => {
  const response = await apiClient.patch('/settings/', settings);
  return response.data;
};

export default apiClient;
