import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CheckCircle, FlaskConical, Bell, User } from 'lucide-react-native';
import { useApp } from '../context/AppContext';

import ApprovalsScreen from '../screens/admin/ApprovalsScreen';
import ManageLabsScreen from '../screens/admin/ManageLabsScreen';
import LabFormScreen from '../screens/admin/LabFormScreen';
import NotificationsScreen from '../screens/admin/NotificationsScreen';
import ProfileScreen from '../screens/admin/ProfileScreen';

export type ManageLabsStackParamList = {
  ManageLabs: undefined;
  LabForm: { id?: string } | undefined;
};

export type AdminTabParamList = {
  Approvals: undefined;
  ManageLabsStack: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const ManageLabsStack = createNativeStackNavigator<ManageLabsStackParamList>();
const Tab = createBottomTabNavigator<AdminTabParamList>();

function ManageLabsStackNavigator() {
  return (
    <ManageLabsStack.Navigator screenOptions={{ headerShown: false }}>
      <ManageLabsStack.Screen name="ManageLabs" component={ManageLabsScreen} />
      <ManageLabsStack.Screen name="LabForm" component={LabFormScreen} />
    </ManageLabsStack.Navigator>
  );
}

export default function AdminNavigator() {
  const { notifications, bookings } = useApp();
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;

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
        name="Approvals"
        component={ApprovalsScreen}
        options={{
          tabBarLabel: 'Approvals',
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#F59E0B', fontSize: 9 },
          tabBarIcon: ({ color, focused }) => (
            <CheckCircle size={22} color={color} strokeWidth={focused ? 2.5 : 1.75} />
          ),
        }}
      />
      <Tab.Screen
        name="ManageLabsStack"
        component={ManageLabsStackNavigator}
        options={{
          tabBarLabel: 'Manage Labs',
          tabBarIcon: ({ color, focused }) => (
            <FlaskConical size={22} color={color} strokeWidth={focused ? 2.5 : 1.75} />
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
