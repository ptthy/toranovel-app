import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, AppColors } from '../theme/colors';
import { typography } from '../theme/typography';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  colors: AppColors; // <-- Chúng ta cung cấp đối tượng màu sắc
  typography: typeof typography; // <-- Cung cấp cả typography
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Tự động phát hiện theme của hệ thống
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null | undefined
  const [theme, setTheme] = useState<Theme>(systemScheme || 'light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Chọn đúng bảng màu dựa trên state `theme`
  const currentColors = theme === 'light' ? lightColors : darkColors;

  const value = {
    theme,
    toggleTheme,
    colors: currentColors, // <-- Pass màu
    typography: typography, // <-- Pass font
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// Đây là hook "xịn" mà bạn sẽ dùng trong mọi component
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}