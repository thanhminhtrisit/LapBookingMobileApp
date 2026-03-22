import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Booking,
  Lab,
  AppNotification,
  labs as initialLabs,
  bookings as initialBookings,
  studentNotifications as initialStudentNotifs,
  adminNotifications as initialAdminNotifs,
  BookingStatus,
} from '../data/mockData';
import { authAPI, UserResponseDTO } from '../services/api';

interface AppContextType {
  currentUser: UserResponseDTO | null;
  isLoading: boolean;
  authError: string | null;
  labs: Lab[];
  bookings: Booking[];
  myBookings: Booking[];
  notifications: AppNotification[];
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginAsMember: () => Promise<void>;
  loginAsAdmin: () => Promise<void>;
  logout: () => Promise<void>;
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  updateBookingStatus: (id: string, status: BookingStatus, note?: string) => void;
  fetchMyBookings: () => void;
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
  const [authError, setAuthError] = useState<string | null>(null);

  const myBookings = bookings.filter(b => b.studentId === currentUser?.userId.toString());

  const notifications = currentUser?.admin ? adminNotifs : studentNotifs;

  useEffect(() => {
    checkExistingUser();
  }, []);

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

  const logout = async () => {
    try {
      setIsLoading(true);
      await authAPI.logout();
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout Error:', error);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      // Mock login
      const mockUser: UserResponseDTO = {
        userId: 1,
        id: 1,
        username: email.split('@')[0],
        email,
        fullName: 'Mock User',
        phone: null,
        firebaseUid: 'mock',
        admin: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: 'MEMBER',
        staffCode: '12345',
        department: 'IT',
        faculty: 'Computer Science',
        studentCode: 'SE123456'
      };
      setCurrentUser(mockUser);
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsMember = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const mockUser: UserResponseDTO = {
        userId: 2,
        id: 2,
        username: 'student',
        email: 'student@example.com',
        fullName: 'John Doe',
        phone: null,
        firebaseUid: 'mock',
        admin: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: 'MEMBER',
        studentCode: 'SE183698',
        department: 'Software Engineering',
        faculty: 'Computer Science & IT'
      };
      setCurrentUser(mockUser);
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsAdmin = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const mockUser: UserResponseDTO = {
        userId: 3,
        id: 3,
        username: 'admin',
        email: 'admin@example.com',
        fullName: 'Admin User',
        phone: null,
        firebaseUid: 'mock',
        admin: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        role: 'STAFF',
        staffCode: 'ADM001',
        department: 'Administration',
        faculty: 'Management'
      };
      setCurrentUser(mockUser);
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addBooking = (booking: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBooking: Booking = { ...booking, id: `bk-${Date.now()}`, createdAt: new Date().toISOString() };
    setBookings((prev) => [...prev, newBooking]);
  };
  const updateBookingStatus = (id: string, status: BookingStatus, note?: string) => {
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
      setAdminNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } else {
      setStudentNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    }
  };
  const markAllNotificationsRead = () => {
    if (currentUser?.admin) {
      setAdminNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } else {
      setStudentNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };
  const fetchMyBookings = () => {
    // Mock fetch, since data is local
  };

  return (
    <AppContext.Provider value={{
      currentUser, isLoading, authError, labs, bookings, myBookings, notifications,
      logout, addBooking, updateBookingStatus,
      addLab, updateLab, deleteLab, markNotificationRead, markAllNotificationsRead,
      loginWithEmail, loginAsMember, loginAsAdmin, fetchMyBookings
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
