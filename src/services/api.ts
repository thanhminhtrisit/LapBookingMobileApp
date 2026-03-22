import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * ⚠️ QUAN TRỌNG: 
 * - Nếu dùng MÁY ẢO Android: Dùng 'http://10.0.2.2:8082'
 * - Nếu dùng ĐIỆN THOẠI THẬT: Dùng IP máy tính của bạn (VD: 'http://192.168.1.40:8082')
 * - Không dùng 'localhost' vì App sẽ không hiểu.
 */
const DEV_IP = '192.168.1.40'; // <--- THAY IP MÁY TÍNH CỦA BẠN VÀO ĐÂY (chạy ipconfig để lấy)

export const API_BASE_URL = Platform.OS === 'android' && !DEV_IP.includes('192.168') 
  ? 'http://10.0.2.2:8082' 
  : `http://${DEV_IP}:8082`;

export interface UserResponseDTO {
  userId: number;
  id: number; // alias
  username: string;
  email: string;
  fullName: string;
  phone: string | null;
  firebaseUid: string;
  admin: boolean;
  createdAt: string;
  updatedAt: string;
  role: 'STAFF' | 'MEMBER' | 'SUPPORTER' | 'UNKNOWN';
  staffId?: number;
  staffCode?: string;
  department?: string;
  faculty?: string;
  studentCode?: string;
}

export interface CreateBookingRequest {
  labId: string;
  studentId: string;
  date: string;
  timeSlot: string;
  purpose: string;
}

export interface LabResponse {
  id: string;
  name: string;
  location: string;
  status: string;
}

const STORAGE_KEYS = {
  ID_TOKEN: 'auth_id_token',
  USER_DATA: 'auth_user_data',
};

export const authAPI = {
  signIn: async (idToken: string): Promise<UserResponseDTO> => {
    try {
      console.log('Connecting to Backend:', `${API_BASE_URL}/api/auth/signin`);
      const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }

      const userData: UserResponseDTO = await response.json();
      
      // Store data using SecureStore
      await SecureStore.setItemAsync(STORAGE_KEYS.ID_TOKEN, idToken);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('API Connection Error:', error);
      throw new Error('Could not connect to Backend. Check if your Server is running and IP is correct.');
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ID_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
  },

  getStoredUser: async (): Promise<UserResponseDTO | null> => {
    const data = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  },

  getStoredToken: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync(STORAGE_KEYS.ID_TOKEN);
  },
};
