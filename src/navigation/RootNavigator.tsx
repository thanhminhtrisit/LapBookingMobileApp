import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import LoginScreen from '../screens/LoginScreen';
import StudentNavigator from './StudentNavigator';
import AdminNavigator from './AdminNavigator';

export type RootStackParamList = {
  Login: undefined;
  StudentTabs: undefined;
  AdminTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { currentUser } = useApp();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {!currentUser ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : currentUser.role === 'MEMBER' ? (
        <Stack.Screen name="StudentTabs" component={StudentNavigator} />
      ) : (
        <Stack.Screen name="AdminTabs" component={AdminNavigator} />
      )}
    </Stack.Navigator>
  );
}
