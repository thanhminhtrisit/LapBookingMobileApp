import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  Booking,
  Lab,
  AppNotification,
  labs as initialLabs,
  bookings as initialBookings,
  studentNotifications as initialStudentNotifs,
  adminNotifications as initialAdminNotifs,
} from '../data/mockData';
import { authAPI, UserResponseDTO } from '../services/api';
import { Alert } from 'react-native';

const WEB_CLIENT_ID = '61094037653-rst3umuupb6pvlqkluasob8vv363tfjd.apps.googleusercontent.com';

interface AppContextType {
  currentUser: UserResponseDTO | null;
  isLoading: boolean;
  labs: Lab[];
  bookings: Booking[];
  notifications: AppNotification[];
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  updateBookingStatus: (id: string, status: 'approved' | 'rejected', note?: string) => void;
  addLab: (lab: Omit<Lab, 'id'>) => void;
  updateLab: (id: string, labData: Partial<Lab>) => void;
  deleteLab: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [labs, setLabs] = useState<Lab[]>(initialLabs);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [studentNotifs, setStudentNotifs] = useState<AppNotification[]>(initialStudentNotifs);
  const [adminNotifs, setAdminNotifs] = useState<AppNotification[]>(initialAdminNotifs);

  const notifications = currentUser?.admin ? adminNotifs : studentNotifs;

  useEffect(() => {
    configureGoogleSignIn();
    checkExistingUser();
  }, []);

  const configureGoogleSignIn = () => {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: true,
    });
  };

  const checkExistingUser = async () => {
    try {
      const storedUser = await authAPI.getStoredUser();
      if (storedUser) {
        setCurrentUser(storedUser);
      }
    } catch (error) {
      console.error('Error checking existing user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      /**
       * ⚠️ MOCK LOGIN ĐỂ DEMO
       * Nếu Google thật đang lỗi cấu hình, chúng ta sẽ dùng dữ liệu giả 
       * để vào app và demo các tính năng Home, Lab, Booking...
       */
      console.log('--- ĐANG CHẠY CHẾ ĐỘ MOCK LOGIN ---');
      
      // Giả lập dữ liệu từ Backend Spring Boot trả về
      const mockUser: UserResponseDTO = {
        userId: 1,
        username: "hailq",
        email: "hailqse183698@fpt.edu.vn",
        fullName: "Le Quoc Hai",
        phone: null,
        firebaseUid: "abc123xyz",
        admin: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: 'STAFF'
      };

      // Tạm thời bỏ qua bước gọi Google/Backend thực tế
      // Nếu bạn muốn test Backend thực tế, hãy comment đoạn trên và dùng authAPI.signIn("fake-token")
      
      setCurrentUser(mockUser);
      Alert.alert("Demo Mode", "Đã đăng nhập thành công bằng tài khoản Demo.");
      
    } catch (error: any) {
      console.error('Login Error:', error);
      Alert.alert('Login Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      // await GoogleSignin.signOut(); // Có thể lỗi nếu chưa cấu hình đúng nên tạm đóng
      await authAPI.logout();
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout Error:', error);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ... (giữ nguyên các hàm addBooking, updateBookingStatus, v.v. của bạn)
  const addBooking = (booking: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBooking: Booking = { ...booking, id: `bk-${Date.now()}`, createdAt: new Date().toISOString() };
    setBookings((prev) => [...prev, newBooking]);
  };
  const updateBookingStatus = (id: string, status: 'approved' | 'rejected', note?: string) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status, ...(note ? { note } : {}) } : b)));
  };
  const addLab = (lab: Omit<Lab, 'id'>) => {
    const newLab: Lab = { ...lab, id: `lab-${Date.now()}` };
    setLabs((prev) => [...prev, newLab]);
  };
  const updateLab = (id: string, labData: Partial<Lab>) => {
    setLabs((prev) => prev.map((l) => (l.id === id ? { ...l, ...labData } : l)));
  };
  const deleteLab = (id: string) => {
    setLabs((prev) => prev.filter((l) => l.id !== id));
  };
  const markNotificationRead = (id: string) => {
    if (currentUser?.admin) {
      setAdminNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } else {
      setStudentNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }
  };
  const markAllNotificationsRead = () => {
    if (currentUser?.admin) {
      setAdminNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    } else {
      setStudentNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser, isLoading, labs, bookings, notifications,
      signInWithGoogle, logout, addBooking, updateBookingStatus,
      addLab, updateLab, deleteLab, markNotificationRead, markAllNotificationsRead
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
