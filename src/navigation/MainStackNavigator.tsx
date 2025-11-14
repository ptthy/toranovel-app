import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from './types';

// Import các màn hình Chính
import { BottomTabNavigator } from './BottomTabNavigator'; // File ta đã tạo
import { ReaderScreen } from '../screens/ReaderScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TopUpScreen } from '../screens/TopUpScreen'; // Bạn có thể tạo màn hình này

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Màn hình đầu tiên là Bottom Tabs */}
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

      {/* Các màn hình này sẽ "đè" lên trên Bottom Tabs */}
      <Stack.Screen name="Reader" component={ReaderScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="TopUp" component={TopUpScreen} />
    </Stack.Navigator>
  );
}