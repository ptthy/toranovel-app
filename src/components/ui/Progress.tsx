// src/components/ui/Progress.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeProvider';

type ProgressProps = {
  value: number; // 0-100
};

export function Progress({ value }: ProgressProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.background, { backgroundColor: colors.muted }]}>
      <View
        style={[
          styles.bar,
          { backgroundColor: colors.primary, width: `${value}%` },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    height: 6, // h-1.5
    borderRadius: 3,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 3,
  },
});