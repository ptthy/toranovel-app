// src/theme/colors.ts

// Định nghĩa bảng màu cơ bản
const palette = {
  primaryDark: '#1E5162',
  accent: '#2C6B7C',
  backgroundLight: '#F7F3E8',
  foregroundDark: '#1E5162',
  cardLight: '#FFFFFF',
  mutedLight: '#E8E0CE',
  mutedForegroundLight: '#5A7884',
  borderLight: '#DED6C4',

  primaryLight: '#F7F3E8',
  backgroundDark: '#0F2A33',
  foregroundLight: '#F7F3E8',
  cardDark: '#1A3D49',
  mutedDark: '#1E5162',
  mutedForegroundDark: '#C4BCAB',
  borderDark: '#1E5162',
};

// Định nghĩa màu sắc cho từng theme
export const lightColors = {
  primary: palette.primaryDark,
  accent: palette.accent,
  background: palette.backgroundLight,
  foreground: palette.foregroundDark,
  card: palette.cardLight,
  cardForeground: palette.foregroundDark,
  muted: palette.mutedLight,
  mutedForeground: palette.mutedForegroundLight,
  border: palette.borderLight,
  input: palette.cardLight,
  ring: palette.accent,
};

export const darkColors = {
  primary: palette.primaryLight,
  accent: palette.accent,
  background: palette.backgroundDark,
  foreground: palette.foregroundLight,
  card: palette.cardDark,
  cardForeground: palette.foregroundLight,
  muted: palette.mutedDark,
  mutedForeground: palette.mutedForegroundDark,
  border: palette.borderDark,
  input: palette.cardDark,
  ring: palette.accent,
};

// Export type để dùng trong Context
export type AppColors = typeof lightColors;