import React, { createContext, useContext, useState } from 'react';
import {
  AppUser,
  Booking,
  Lab,
  AppNotification,
  labs as initialLabs,
  bookings as initialBookings,
  studentNotifications as initialStudentNotifs,
  adminNotifications as initialAdminNotifs,
  studentUser,
  adminUser,
} from '../data/mockData';

interface AppContextType {
  currentUser: AppUser | null;
  labs: Lab[];
  bookings: Booking[];
  notifications: AppNotification[];
  login: (role: 'student' | 'admin') => void;
  logout: () => void;
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
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [labs, setLabs] = useState<Lab[]>(initialLabs);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [studentNotifs, setStudentNotifs] = useState<AppNotification[]>(initialStudentNotifs);
  const [adminNotifs, setAdminNotifs] = useState<AppNotification[]>(initialAdminNotifs);

  const notifications = currentUser?.role === 'admin' ? adminNotifs : studentNotifs;

  const login = (role: 'student' | 'admin') => {
    setCurrentUser(role === 'student' ? studentUser : adminUser);
  };

  const logout = () => setCurrentUser(null);

  const addBooking = (booking: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBooking: Booking = {
      ...booking,
      id: `bk-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setBookings((prev) => [...prev, newBooking]);
  };

  const updateBookingStatus = (id: string, status: 'approved' | 'rejected', note?: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status, ...(note ? { note } : {}) } : b))
    );
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
    if (currentUser?.role === 'admin') {
      setAdminNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } else {
      setStudentNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }
  };

  const markAllNotificationsRead = () => {
    if (currentUser?.role === 'admin') {
      setAdminNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    } else {
      setStudentNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        labs,
        bookings,
        notifications,
        login,
        logout,
        addBooking,
        updateBookingStatus,
        addLab,
        updateLab,
        deleteLab,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
