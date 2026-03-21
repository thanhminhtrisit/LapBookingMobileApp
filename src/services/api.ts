import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// =======================================================================
// TYPES & INTERFACES
// =======================================================================

/**
 * BaseResponse wrapper from backend
 */
export interface BaseResponse<T = any> {
  statusCode: string;
  message: string;
  data: T;
}

/**
 * Auth
 */
export interface AuthResponse {
  token: string;
  tokenType: string;
  user: UserResponseDTO;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

/**
 * User — matches ACTUAL backend UserResponse
 */
export interface UserResponseDTO {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: 'MEMBER' | 'STAFF' | 'ADMIN';
  studentCode?: string | null;
  staffCode?: string | null;
  department?: string | null;
  faculty?: string | null;
  createdAt: string;
}

/**
 * Lab — matches backend LabResponse
 */
export interface LabResponse {
  id: number;
  name: string;
  code: string;
  location: string;
  description: string;
  capacity: number;
  building?: string | null;
  faculty?: string | null;
  equipment?: string | null; // raw JSON string: '[{"name":"PC","quantity":30}]'
  status: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
  isOccupied?: boolean;
  createdAt: string;
}

/**
 * Booking — matches backend BookingResponse
 */
export interface BookingResponse {
  id: number;
  userId: number;
  userName: string;
  labId: number;
  labName: string;
  labLocation: string;
  startTime: string;  // ISO: "2026-03-20T09:00:00"
  endTime: string;
  title: string;
  note: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reviewedByName: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface CreateBookingRequest {
  labId: number;
  startTime: string;  // "2026-03-20T09:00:00"
  endTime: string;
  title: string;
  note?: string;
}

/**
 * Notification — matches backend NotificationResponse
 */
export interface NotificationResponse {
  id: number;
  bookingId: number | null;
  type: 'BOOKING_APPROVED' | 'BOOKING_REJECTED' | 'BOOKING_CANCELLED'
      | 'LAB_MAINTENANCE' | 'LAB_CLOSED' | 'BOOKING_IN_PROGRESS';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// =======================================================================
// BASE URL SETUP
// =======================================================================

const DEV_IP = '192.168.1.40'; // placeholder — user will change

export const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8082'     // emulator
    : `http://${DEV_IP}:8082`;   // real device

// =======================================================================
// TOKEN STORAGE
// =======================================================================

const KEYS = {
  TOKEN: 'auth_jwt_token',
  USER: 'auth_user_data',
};

export const tokenStorage = {
  save: async (token: string, user: UserResponseDTO) => {
    await SecureStore.setItemAsync(KEYS.TOKEN, token);
    await SecureStore.setItemAsync(KEYS.USER, JSON.stringify(user));
  },
  getToken: async (): Promise<string | null> =>
    SecureStore.getItemAsync(KEYS.TOKEN),
  getUser: async (): Promise<UserResponseDTO | null> => {
    const raw = await SecureStore.getItemAsync(KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  },
  clear: async () => {
    await SecureStore.deleteItemAsync(KEYS.TOKEN);
    await SecureStore.deleteItemAsync(KEYS.USER);
  },
};

// =======================================================================
// CORE FETCH HELPER
// =======================================================================

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  requireAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (requireAuth) {
    const token = await tokenStorage.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const body = await response.json();

    // Handle both { statusCode, data } wrapper and flat responses
    if (body && typeof body === 'object' && 'statusCode' in body) {
      const s = String(body.statusCode);
      if (s !== '200' && s !== '201') {
        throw new Error(body.message || `API Error ${s}`);
      }
      return body.data as T;
    }

    // If flat response, check HTTP status
    if (!response.ok) {
      throw new Error(body?.message || `HTTP Error ${response.status}`);
    }

    return body as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out after 15 seconds. Please check your network or backend.');
    }
    throw err;
  }
}

// =======================================================================
// API MODULES
// =======================================================================

export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const data = await apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false);
    await tokenStorage.save(data.token, data.user);
    return data;
  },

  register: async (req: RegisterRequest): Promise<AuthResponse> => {
    const data = await apiFetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(req),
    }, false);
    await tokenStorage.save(data.token, data.user);
    return data;
  },

  getMe: async (): Promise<UserResponseDTO> =>
    apiFetch<UserResponseDTO>('/api/auth/me'),

  logout: async () => tokenStorage.clear(),

  getStoredUser: () => tokenStorage.getUser(),
  getStoredToken: () => tokenStorage.getToken(),
};

export const labsAPI = {
  getAll: (status?: string): Promise<LabResponse[]> =>
    apiFetch(`/api/labs${status ? `?status=${status}` : ''}`),

  getById: (id: number): Promise<LabResponse> =>
    apiFetch(`/api/labs/${id}`),

  getSchedule: (labId: number, date: string): Promise<BookingResponse[]> =>
    apiFetch(`/api/labs/${labId}/bookings?date=${date}`),

  // ADMIN only
  create: (body: {
    name: string; code: string; location?: string;
    description?: string; capacity?: number;
    building?: string; faculty?: string; equipment?: string;
  }): Promise<LabResponse> =>
    apiFetch('/api/labs', { method: 'POST', body: JSON.stringify(body) }),

  update: (id: number, body: {
    name?: string; location?: string; description?: string;
    capacity?: number; building?: string; faculty?: string; equipment?: string;
  }): Promise<LabResponse> =>
    apiFetch(`/api/labs/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  updateStatus: (id: number, status: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED', message?: string) =>
    apiFetch(`/api/labs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, message }),
    }),
};

export const bookingsAPI = {
  create: (req: CreateBookingRequest): Promise<BookingResponse> =>
    apiFetch('/api/bookings', { method: 'POST', body: JSON.stringify(req) }),

  getMine: (): Promise<BookingResponse[]> =>
    apiFetch('/api/bookings/my'),

  // STAFF/ADMIN
  getPending: (): Promise<BookingResponse[]> =>
    apiFetch('/api/bookings/pending'),

  // ADMIN only
  getAll: (): Promise<BookingResponse[]> =>
    apiFetch('/api/bookings'),

  approve: (id: number): Promise<BookingResponse> =>
    apiFetch(`/api/bookings/${id}/approve`, { method: 'PATCH' }),

  reject: (id: number, reason?: string): Promise<BookingResponse> =>
    apiFetch(`/api/bookings/${id}/reject`, {
      method: 'PATCH',
      body: reason ? JSON.stringify({ reason }) : undefined,
    }),

  cancel: (id: number): Promise<BookingResponse> =>
    apiFetch(`/api/bookings/${id}/cancel`, { method: 'PATCH' }),
};

export const notificationsAPI = {
  getAll: (): Promise<NotificationResponse[]> =>
    apiFetch('/api/notifications'),

  markRead: (id: number) =>
    apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' }),

  markAllRead: () =>
    apiFetch('/api/notifications/read-all', { method: 'PATCH' }),
};

export const adminAPI = {
  getUsers: (): Promise<UserResponseDTO[]> =>
    apiFetch('/api/admin/users'),

  updateRole: (userId: number, role: 'MEMBER' | 'STAFF' | 'ADMIN') =>
    apiFetch(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
};
