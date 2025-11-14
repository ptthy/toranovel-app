// src/components/ui/Separator.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeProvider';

export function Separator() {
  const { colors } = useTheme();
  return (
    <View style={[styles.separator, { backgroundColor: colors.border }]} />
  );
}

const styles = StyleSheet.create({
  separator: {
    height: 1,
    width: '100%',
  },
});