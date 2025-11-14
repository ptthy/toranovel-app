// src/components/ui/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeProvider';

// Thêm các props mới
interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'outline'; // Giống trong file Welcome
  loading?: boolean;
textStyle?: StyleProp<TextStyle>;
}

export function Button({
  title,
  variant = 'primary',
  loading = false,
  style,
  textStyle, 
  ...props
}: ButtonProps) {
  const { colors, typography } = useTheme();

  // Style cho nút 'primary' (nút màu đặc)
  const primaryButton: ViewStyle = {
    backgroundColor: colors.primary,
    height: 50, // Figma là h-12 (48px), 50 là số đẹp
    borderRadius: 12,
  };
  const primaryText: TextStyle = {
    color: colors.background, // Chữ màu sáng
    ...typography.button, // Dùng font button từ theme
    fontWeight: '600',
  };

  // Style cho nút 'outline' (nút viền)
  const outlineButton: ViewStyle = {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
    borderWidth: 2,
    height: 50,
    borderRadius: 12,
  };
  const outlineText: TextStyle = {
    color: colors.primary, // Chữ màu tối
    ...typography.button,
    fontWeight: '600',
  };

  const buttonStyle =
    variant === 'primary' ? primaryButton : outlineButton;
  const baseTextStyle =
    variant === 'primary' ? primaryText : outlineText;

  return (
    <TouchableOpacity
      style={[styles.container, buttonStyle, style]}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.background : colors.primary} />
      ) : (
        <Text style={[baseTextStyle, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});