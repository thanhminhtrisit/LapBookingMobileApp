import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, CalendarDays, Bell, User } from 'lucide-react-native';
import { useApp } from '../context/AppContext';

import HomeScreen from '../screens/student/HomeScreen';
import LabDetailScreen from '../screens/student/LabDetailScreen';
import BookingScreen from '../screens/student/BookingScreen';
import MyBookingsScreen from '../screens/student/MyBookingsScreen';
import NotificationsScreen from '../screens/student/NotificationsScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
import SharedLabsNavigator from './SharedLabsNavigator';

export type HomeStackParamList = {
  LabList: undefined;
  LabDetail: { id: number };
  Booking: { id: number };
};

export type StudentTabParamList = {
  HomeStack: undefined;
  MyBookings: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator<StudentTabParamList>();

export default function StudentNavigator() {
  const { notifications } = useApp();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F3F4F6',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: '#F97316',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: { fontSize: 10 },
      }}
    >
      <Tab.Screen
        name="HomeStack"
        component={SharedLabsNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Home size={22} color={color} strokeWidth={focused ? 2.5 : 1.75} />
          ),
        }}
      />
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{
          tabBarLabel: 'My Bookings',
          tabBarIcon: ({ color, focused }) => (
            <CalendarDays size={22} color={color} strokeWidth={focused ? 2.5 : 1.75} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#EF4444', fontSize: 9 },
          tabBarIcon: ({ color, focused }) => (
            <Bell size={22} color={color} strokeWidth={focused ? 2.5 : 1.75} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <User size={22} color={color} strokeWidth={focused ? 2.5 : 1.75} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
