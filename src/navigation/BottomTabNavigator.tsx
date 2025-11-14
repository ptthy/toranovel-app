// src/navigation/BottomTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, BookMarked, Headphones, User } from 'lucide-react-native';

// Import các màn hình chính của bạn
import { HomeScreen } from '../screens/HomeScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ReaderScreen } from '../screens/ReaderScreen'; // Giả sử Audio là Reader

import { useTheme } from '../contexts/ThemeProvider';

// Khởi tạo Tab Navigator
const Tab = createBottomTabNavigator();

export function BottomTabNavigator() {
   const { colors, typography, theme } = useTheme();
  // Lấy màu sắc từ Figma của bạn
  const activeColor = theme === 'light' ? '#1E5162' : '#F7F3E8';
  const inactiveColor = theme === 'light' ? '#5A7884' : '#C4BCAB';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Ẩn header mặc định
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: colors.card, // bg-[var(--card)]
          borderTopColor: colors.border, // border-t border-[var(--border)]
          height: 64, // h-16
          paddingTop: 8, // Thêm padding cho đẹp
        },
       tabBarLabelStyle: {
          ...typography.p, // <-- ĐƯA LÊN ĐẦU TIÊN (để lấy fontFamily)
          fontWeight: '600', // <-- Ghi đè fontWeight
          fontSize: 10, // <-- Ghi đè fontSize
          // Bỏ 2 dòng 'fontSize' cũ
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ color, focused }) => (
            <Home color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarLabel: 'Thư viện',
          tabBarIcon: ({ color, focused }) => (
            <BookMarked color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Audio" // Bạn có thể đổi tên "Reader" thành "Audio"
        component={ReaderScreen}
        options={{
          tabBarLabel: 'Audio',
          tabBarIcon: ({ color, focused }) => (
            <Headphones color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Cá nhân',
          tabBarIcon: ({ color, focused }) => (
            <User color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}