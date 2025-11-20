import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../contexts/ThemeProvider';
// Thay đổi: Import icon Star thay vì List
import { User, Star } from 'lucide-react-native'; 

interface StoryListItemProps {
  title: string;
  cover: string;
  author: string;
  // totalChapters: number; // <-- Không dùng cái này nữa (hoặc để lại nếu muốn hiển thị ở chỗ khác)
  rating?: number; // <-- Thêm prop rating (có thể null)
  onClick: () => void;
}

export function StoryListItem({ 
  title, cover, author, rating = 0, onClick // Mặc định rating là 0 nếu không có
}: StoryListItemProps) {
  const { colors, typography } = useTheme();

  // Hàm render 5 ngôi sao
  const renderStars = (score: number) => {
    const stars = [];
    // Làm tròn điểm số (ví dụ 4.3 -> 4, 4.6 -> 5 để hiển thị sao đầy)
    const roundedScore = Math.round(score);

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={14} 
          // Nếu i <= điểm đã làm tròn -> màu vàng, ngược lại màu xám
          color={i <= roundedScore ? "#FFC107" : colors.mutedForeground} 
          // Nếu i <= điểm đã làm tròn -> tô đặc (fill), ngược lại chỉ viền
          fill={i <= roundedScore ? "#FFC107" : "transparent"}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]} 
      onPress={onClick}
      activeOpacity={0.7}
    >
      {/* Ảnh bìa */}
      <Image 
        source={{ uri: cover }} 
        style={styles.cover} 
        contentFit="cover"
        transition={500}
      />

      {/* Thông tin */}
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

          {/* === THAY ĐỔI Ở ĐÂY: Rating 5 Sao === */}
          <View style={styles.ratingRow}>
            {/* Gọi hàm render sao */}
            <View style={{ flexDirection: 'row' }}>
              {renderStars(rating)}
            </View>
            {/* Hiển thị số điểm bên cạnh (tùy chọn) */}
            {rating > 0 && (
               <Text style={{ color: colors.mutedForeground, fontSize: 12, marginLeft: 4 }}>
                 ({rating.toFixed(1)})
               </Text>
            )}
          </View>
          {/* =================================== */}
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
    justifyContent: 'flex-start',
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
  // Style mới cho hàng rating
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
});