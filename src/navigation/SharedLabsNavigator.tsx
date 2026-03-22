import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/student/HomeScreen';
import LabDetailScreen from '../screens/student/LabDetailScreen';
import BookingScreen from '../screens/student/BookingScreen';

export type SharedLabsStackParamList = {
  Home: undefined;
  LabDetail: { id: number };
  Booking: { id: number };
};

const Stack = createNativeStackNavigator<SharedLabsStackParamList>();

export default function SharedLabsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="LabDetail" component={LabDetailScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
    </Stack.Navigator>
  );
}
