import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../contexts/ThemeProvider';
import { User, List, Clock } from 'lucide-react-native'; // Icon

interface StoryListItemProps {
  title: string;
  cover: string;
  author: string;
  totalChapters: number;
  publishedAt: string;
  onClick: () => void;
}

export function StoryListItem({ 
  title, cover, author, totalChapters, publishedAt, onClick 
}: StoryListItemProps) {
  const { colors, typography } = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]} 
      onPress={onClick}
      activeOpacity={0.7}
    >
      {/* Ảnh bìa (Bên trái) */}
      <Image 
        source={{ uri: cover }} 
        style={styles.cover} 
        contentFit="cover"
        transition={500}
      />

      {/* Thông tin (Bên phải) */}
      <View style={styles.info}>
        <Text 
          style={[typography.h4, { color: colors.foreground }]} 
          numberOfLines={2}
        >
          {title}
        </Text>

        <View style={styles.metaContainer}>
          {/* Tác giả */}
          <View style={styles.metaRow}>
            <User size={14} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>
              {author}
            </Text>
          </View>

          {/* Số chương & Ngày */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <List size={14} color={colors.primary} />
              <Text style={{ color: colors.mutedForeground, fontSize: 12, marginLeft: 4 }}>
                {totalChapters} chương
              </Text>
            </View>
            
            {/* Có thể thêm ngày cập nhật nếu muốn */}
            {/* <View style={styles.statItem}>
              <Clock size={14} color={colors.mutedForeground} />
              <Text style={{ color: colors.mutedForeground, fontSize: 12, marginLeft: 4 }}>
                {new Date(publishedAt).toLocaleDateString('vi-VN')}
              </Text>
            </View> */}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    // Shadow nhẹ cho đẹp
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    elevation: 2,
  },
  cover: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'flex-start', // Căn nội dung lên trên
    paddingVertical: 4,
  },
  metaContainer: {
    marginTop: 8,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});