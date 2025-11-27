import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../contexts/ThemeProvider';
import { User, Star, Tag } from 'lucide-react-native';
import { storyService } from '../../api/storyService';
import { useNavigation } from '@react-navigation/native';

// Định nghĩa Tag type
interface StoryTag {
  tagId: string;
  tagName: string;
}

interface StoryListItemProps {
  storyId: string;
  authorId?: string; // Để optional để tránh lỗi nếu không truyền
  title: string;
  cover: string;
  author: string;
  rating?: number;
  
  // --- Props mới ---
  tags?: StoryTag[]; // Danh sách thẻ
  viewMode?: 'default' | 'profile'; // Chế độ hiển thị: 'default' (Search) hoặc 'profile' (Tác giả)
  
  onClick: () => void;
}

export function StoryListItem({ 
  storyId, authorId, title, cover, author, rating = 0, tags = [], viewMode = 'default', onClick 
}: StoryListItemProps) {
  const { colors, typography } = useTheme();
  const navigation = useNavigation<any>();
  const [currentRating, setCurrentRating] = useState(rating);

  useEffect(() => {
    let isMounted = true;
    const fetchRating = async () => {
      try {
        // Chỉ fetch nếu chưa có rating
        if (rating === 0 && storyId) {
          const res = await storyService.getStoryRating(storyId);
          if (isMounted && res.data) {
            setCurrentRating(res.data.averageScore || 0);
          }
        }
      } catch (error) { }
    };
    fetchRating();
    return () => { isMounted = false; };
  }, [storyId, rating]);

  // Hàm render 5 ngôi sao (Cho chế độ Default)
  const renderStars = (score: number) => {
    const stars = [];
    const roundedScore = Math.round(score);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} size={12} 
          color={i <= roundedScore ? "#FFC107" : colors.mutedForeground} 
          fill={i <= roundedScore ? "#FFC107" : "transparent"}
          style={{ marginRight: 1 }}
        />
      );
    }
    return stars;
  };

  // Hàm render Tags (Cho chế độ Profile)
  const renderTags = () => {
    if (!tags || tags.length === 0) return null;
    // Chỉ lấy tối đa 2-3 tags để không bị tràn
    const displayTags = tags.slice(0, 2); 
    
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
        {displayTags.map(t => (
          <View key={t.tagId} style={[styles.miniTag, { backgroundColor: colors.muted }]}>
            <Text style={{ fontSize: 10, color: colors.mutedForeground }}>{t.tagName}</Text>
          </View>
        ))}
        {tags.length > 2 && (
           <Text style={{ fontSize: 10, color: colors.mutedForeground, alignSelf: 'center' }}>+{tags.length - 2}</Text>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]} 
      onPress={onClick} activeOpacity={0.7}
    >
      <Image source={{ uri: cover }} style={styles.cover} contentFit="cover" transition={500} />

      <View style={styles.info}>
        <Text style={[typography.h4, { color: colors.foreground }]} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.metaContainer}>
          
          {/* DÒNG 1: Tùy thuộc vào viewMode */}
          <View style={styles.metaRow}>
            {viewMode === 'default' ? (
              // MODE SEARCH: Hiện Tên Tác Giả
              <>
                <User size={14} color={colors.mutedForeground} />
                <TouchableOpacity 
                  onPress={() => authorId && navigation.navigate('AuthorProfile', { authorId })}
                  hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                  disabled={!authorId}
                >
                  <Text style={[styles.metaText, { color: colors.mutedForeground, textDecorationLine: 'underline' }]} numberOfLines={1}>
                    {author}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              // MODE PROFILE: Hiện Số Rating (Ví dụ: 4.5)
              <>
                <Star size={14} color="#FFC107" fill="#FFC107" />
                <Text style={[styles.metaText, { color: colors.foreground, fontWeight: 'bold' }]}>
                  {currentRating > 0 ? currentRating.toFixed(1) : "Chưa có đánh giá"}
                </Text>
              </>
            )}
          </View>

          {/* DÒNG 2: Tùy thuộc vào viewMode */}
          <View style={styles.ratingRow}>
             {viewMode === 'default' ? (
               // MODE SEARCH: Hiện 5 ngôi sao
               <View style={{ flexDirection: 'row' }}>{renderStars(currentRating)}</View>
             ) : (
               // MODE PROFILE: Hiện Tags thể loại
               renderTags()
             )}
          </View>

        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', padding: 12, marginBottom: 12,
    borderRadius: 12, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 2,
  },
  cover: { width: 80, height: 120, borderRadius: 8 },
  info: { flex: 1, marginLeft: 16, justifyContent: 'flex-start', paddingVertical: 4 },
  metaContainer: { marginTop: 8, gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  miniTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
});