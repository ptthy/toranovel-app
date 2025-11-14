import React, { useState } from 'react'; // Tạm dùng useState
// import { useAuth } from '../contexts/AuthContext'; // Trong app thật, dùng context
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { AuthStackNavigator } from './AuthStackNavigator';
import { MainStackNavigator } from './MainStackNavigator';
import { useTheme } from '../contexts/ThemeProvider'; // Import theme
import { useAuth } from '../contexts/AuthContext';
export function RootNavigator() {
  // const { isLoggedIn } = useAuth(); // Đây là cách làm chuẩn
  
  // Tạm thời dùng state giả lập
const { isLoggedIn } = useAuth();
  
  const { theme, colors } = useTheme();

  // Tạo theme cho NavigationContainer
  const navigationTheme = {
    ...DefaultTheme,
    dark: theme === 'dark',
    colors: {
        ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.foreground,
      border: colors.border,
      notification: colors.accent,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      {isLoggedIn ? <MainStackNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
}