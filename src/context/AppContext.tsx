import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authAPI,
  labsAPI,
  bookingsAPI,
  notificationsAPI,
  adminAPI,
  UserResponseDTO,
  LabResponse,
  BookingResponse,
  NotificationResponse,
  CreateBookingRequest,
} from '../services/api';
import { Alert } from 'react-native';

interface AppContextType {
  // Auth
  currentUser: UserResponseDTO | null;
  isLoading: boolean;
  authError: string | null;

  // Login/Logout
  login: (email: string, password: string) => Promise<void>;
  register: (body: Parameters<typeof authAPI.register>[0]) => Promise<void>;
  loginAsMember: () => Promise<void>;
  loginAsAdmin: () => Promise<void>;
  logout: () => Promise<void>;

  // Labs
  labs: LabResponse[];
  labsLoading: boolean;
  fetchLabs: () => Promise<void>;

  // Bookings
  myBookings: BookingResponse[];
  pendingBookings: BookingResponse[];
  bookingsLoading: boolean;
  fetchMyBookings: () => Promise<void>;
  fetchPendingBookings: () => Promise<void>;
  createBooking: (req: CreateBookingRequest) => Promise<BookingResponse>;
  approveBooking: (id: number) => Promise<void>;
  rejectBooking: (id: number, reason?: string) => Promise<void>;
  cancelBooking: (id: number) => Promise<void>;

  // Notifications
  notifications: NotificationResponse[];
  notificationsLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: number) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // User management (ADMIN)
  users: UserResponseDTO[];
  usersLoading: boolean;
  fetchUsers: () => Promise<void>;
  updateUserRole: (id: number, role: 'MEMBER' | 'STAFF' | 'ADMIN') => Promise<void>;

  // Lab management (ADMIN)
  createLab: (body: Parameters<typeof labsAPI.create>[0]) => Promise<void>;
  updateLab: (id: number, body: Parameters<typeof labsAPI.update>[1]) => Promise<void>;
  updateLabStatus: (id: number, status: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED', msg?: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Data States
  const [labs, setLabs] = useState<LabResponse[]>([]);
  const [labsLoading, setLabsLoading] = useState(false);
  
  const [myBookings, setMyBookings] = useState<BookingResponse[]>([]);
  const [pendingBookings, setPendingBookings] = useState<BookingResponse[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Admin User States
  const [users, setUsers] = useState<UserResponseDTO[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Initialization
  useEffect(() => {
    const init = async () => {
      try {
        const storedUser = await authAPI.getStoredUser();
        if (storedUser) {
          setCurrentUser(storedUser);
          // Fetch initial data in background
          fetchLabs();
          fetchNotifications();
          if (storedUser.role === 'MEMBER') {
            fetchMyBookings();
          } else {
            fetchPendingBookings();
            if (storedUser.role === 'ADMIN') {
              fetchUsers();
            }
          }
        }
      } catch (err) {
        console.error('App init error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Auth Actions
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const data = await authAPI.login(email, password);
      setCurrentUser(data.user);
      
      // Fetch data after login
      fetchLabs();
      fetchNotifications();
      if (data.user.role === 'MEMBER') {
        fetchMyBookings();
      } else {
        fetchPendingBookings();
        if (data.user.role === 'ADMIN') {
          fetchUsers();
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      setAuthError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (body: Parameters<typeof authAPI.register>[0]) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const data = await authAPI.register(body);
      setCurrentUser(data.user);
      
      // Fetch initial data
      fetchLabs();
      fetchNotifications();
      fetchMyBookings(); // New users are always MEMBER
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsMember = async () => login('member@example.com', 'password123');
  const loginAsAdmin = async () => login('admin@lab.com', 'Admin@123');

  const logout = async () => {
    setIsLoading(true);
    try {
      await authAPI.logout();
      // Clear states
      setCurrentUser(null);
      setLabs([]);
      setMyBookings([]);
      setPendingBookings([]);
      setNotifications([]);
      setUsers([]);
      setAuthError(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Lab Actions
  const fetchLabs = useCallback(async () => {
    setLabsLoading(true);
    try {
      const data = await labsAPI.getAll(); // No filter -> ACTIVE
      setLabs(data);
    } catch (err: any) {
      console.error('Fetch labs error:', err);
    } finally {
      setLabsLoading(false);
    }
  }, []);

  const createLab = async (body: Parameters<typeof labsAPI.create>[0]) => {
    try {
      await labsAPI.create(body);
      await fetchLabs();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create lab');
      throw err;
    }
  };

  const updateLab = async (id: number, body: Parameters<typeof labsAPI.update>[1]) => {
    try {
      await labsAPI.update(id, body);
      await fetchLabs();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update lab');
      throw err;
    }
  };

  const updateLabStatus = async (id: number, status: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED', msg?: string) => {
    try {
      await labsAPI.updateStatus(id, status, msg);
      await fetchLabs();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update status');
      throw err;
    }
  };

  // Booking Actions
  const fetchMyBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const data = await bookingsAPI.getMine();
      setMyBookings(data);
    } catch (err: any) {
      console.error('Fetch my bookings error:', err);
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  const fetchPendingBookings = useCallback(async () => {
    if (!currentUser || currentUser.role === 'MEMBER') return;
    setBookingsLoading(true);
    try {
      const data = await bookingsAPI.getPending();
      setPendingBookings(data);
    } catch (err: any) {
      console.error('Fetch pending bookings error:', err);
    } finally {
      setBookingsLoading(false);
    }
  }, [currentUser]);

  const createBooking = async (req: CreateBookingRequest) => {
    try {
      const newBooking = await bookingsAPI.create(req);
      await fetchMyBookings();
      return newBooking;
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Booking failed');
      throw err;
    }
  };

  const approveBooking = async (id: number) => {
    try {
      await bookingsAPI.approve(id);
      await fetchPendingBookings();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Approval failed');
    }
  };

  const rejectBooking = async (id: number, reason?: string) => {
    try {
      await bookingsAPI.reject(id, reason);
      await fetchPendingBookings();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Rejection failed');
    }
  };

  const cancelBooking = async (id: number) => {
    try {
      await bookingsAPI.cancel(id);
      if (currentUser?.role === 'MEMBER') {
        await fetchMyBookings();
      } else {
        await fetchPendingBookings();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Cancellation failed');
    }
  };

  // Notification Actions
  const fetchNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    try {
      const data = await notificationsAPI.getAll();
      setNotifications(data);
    } catch (err: any) {
      console.error('Fetch notifications error:', err);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  const markNotificationRead = async (id: number) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err: any) {
      console.error('Mark read error:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err: any) {
      console.error('Mark all read error:', err);
    }
  };

  // ADMIN - USER MGMT
  const fetchUsers = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'ADMIN') return;
    setUsersLoading(true);
    try {
      const data = await adminAPI.getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Fetch users error:', err);
    } finally {
      setUsersLoading(false);
    }
  }, [currentUser]);

  const updateUserRole = async (id: number, role: 'MEMBER' | 'STAFF' | 'ADMIN') => {
    try {
      await adminAPI.updateRole(id, role);
      await fetchUsers();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update role');
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser, isLoading, authError,
      login, register, loginAsMember, loginAsAdmin, logout,
      labs, labsLoading, fetchLabs,
      myBookings, pendingBookings, bookingsLoading,
      fetchMyBookings, fetchPendingBookings, createBooking,
      approveBooking, rejectBooking, cancelBooking,
      notifications, notificationsLoading, fetchNotifications,
      markNotificationRead, markAllNotificationsRead,
      users, usersLoading, fetchUsers, updateUserRole,
      createLab, updateLab, updateLabStatus
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
