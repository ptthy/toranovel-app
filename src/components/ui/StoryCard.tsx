import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../contexts/ThemeProvider';

type StoryCardProps = {
  title: string;
  cover: string;
  author: string;
  onClick: () => void;
};

export function StoryCard({ title, cover, author, onClick }: StoryCardProps) {
  const { colors, typography } = useTheme();

  return (
    <TouchableOpacity style={styles.container} onPress={onClick}>
      <Image
        source={{ uri: cover }}
        style={styles.coverImage}
        // XÓA DÒNG `placeholder` GÂY LỖI
        contentFit="cover"
        transition={300}
      />
      <Text
        style={[typography.p, styles.title, { color: colors.foreground }]}
        numberOfLines={2}
      >
        {title}
      </Text>
      <Text
        style={[typography.p, styles.author, { color: colors.mutedForeground }]}
        numberOfLines={1}
      >
        {author}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 130,
  },
  coverImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    backgroundColor: '#eee', // Màu này sẽ là placeholder
  },
  title: {
    marginTop: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  author: {
    fontSize: 12,
    marginTop: 4,
  },
});