// src/components/ui/Input.tsx
import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeProvider';

interface InputProps extends TextInputProps {
  label?: string;
  leftIcon?: React.ReactNode;
  rightAdornment?: React.ReactNode; // <-- thêm prop mới
}

export function Input({ 
  label, 
  style, 
  leftIcon, 
  rightAdornment, // <-- nhận thêm
  multiline, 
  ...props 
}: InputProps) {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.container}>
      {label && (
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
            paddingLeft: leftIcon ? 40 : 16,
            paddingRight: rightAdornment ? 40 : 16, // <-- chừa chỗ cho icon bên phải
            height: multiline ? 100 : 50,
            paddingTop: multiline ? 12 : 0,
          },
        ]}
      >
        {/* Left Icon */}
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        {/* Text Input */}
        <TextInput
          style={[
            typography.body,
            styles.input,
            {
              color: colors.foreground,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            style,
          ]}
          placeholderTextColor={colors.mutedForeground}
          multiline={multiline}
          {...props}
        />

        {/* Right Adornment */}
        {rightAdornment && (
          <View style={styles.rightAdornmentContainer}>{rightAdornment}</View>
        )}
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
    position: 'relative',
  },
  leftIconContainer: {
    position: 'absolute',
    left: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  rightAdornmentContainer: {
    position: 'absolute',
    right: 12,
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
