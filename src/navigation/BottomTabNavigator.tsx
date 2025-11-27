import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, BookMarked, History, User } from 'lucide-react-native'; // Import icon History

import { HomeScreen } from '../screens/HomeScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { TransactionHistoryScreen } from '../screens/TransactionHistoryScreen'; // Import màn hình mới

import { useTheme } from '../contexts/ThemeProvider';

const Tab = createBottomTabNavigator();

export function BottomTabNavigator() {
  const { colors, typography, theme } = useTheme();
  const activeColor = theme === 'light' ? '#1E5162' : '#F7F3E8';
  const inactiveColor = theme === 'light' ? '#5A7884' : '#C4BCAB';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 70, // Tăng chiều cao lên chút để tránh cấn màn hình cong
          paddingTop: 8,
          paddingBottom: 10, // Padding dưới quan trọng cho iPhone X+
        },
        tabBarLabelStyle: {
          ...typography.p,
          fontWeight: '600',
          fontSize: 10,
          marginBottom: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ color, focused }) => <Home color={color} size={22} strokeWidth={focused ? 2.5 : 2} />,
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarLabel: 'Thư viện',
          tabBarIcon: ({ color, focused }) => <BookMarked color={color} size={22} strokeWidth={focused ? 2.5 : 2} />,
        }}
      />
     
      <Tab.Screen
        name="History"
        component={TransactionHistoryScreen}
        options={{
          tabBarLabel: 'Lịch sử',
          tabBarIcon: ({ color, focused }) => <History color={color} size={22} strokeWidth={focused ? 2.5 : 2} />,
        }}
      />
     
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Cá nhân',
          tabBarIcon: ({ color, focused }) => <User color={color} size={22} strokeWidth={focused ? 2.5 : 2} />,
        }}
      />
    </Tab.Navigator>
  );
}