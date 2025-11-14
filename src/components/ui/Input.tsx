// src/components/ui/Input.tsx
import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeProvider';

interface InputProps extends TextInputProps {
  label?: string; // <-- Làm cho label không bắt buộc
  leftIcon?: React.ReactNode;
}

export function Input({ label, style, leftIcon, multiline, ...props }: InputProps) {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.container}>
      {label && ( // <-- Chỉ hiển thị nếu có label
        <Text style={[typography.p, styles.label, { color: colors.foreground }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.input,
            borderColor: colors.border,
            paddingLeft: leftIcon ? 40 : 16, // <-- Thêm padding nếu có icon
            height: multiline ? 100 : 50, // <-- Hỗ trợ multiline
            paddingTop: multiline ? 12 : 0, // <-- Thêm padding top cho multiline
          },
        ]}
      >
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <TextInput
          style={[
            typography.body,
            styles.input,
            { color: colors.foreground, textAlignVertical: multiline ? 'top' : 'center' },
            style,
          ]}
          placeholderTextColor={colors.mutedForeground}
          multiline={multiline}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    left: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
  },
});