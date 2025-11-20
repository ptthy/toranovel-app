import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeProvider';
import { Input } from '../components/ui/Input';
import { StoryCard } from '../components/ui/StoryCard';
import { Search, BookOpen } from 'lucide-react-native';

import { useNavigation } from '@react-navigation/native';
import { MainTabScreenProps } from '../navigation/types';
import { Story, storyService } from '../api/storyService';



export function HomeScreen() {
  const { colors, typography, theme } = useTheme();
  const navigation = useNavigation<MainTabScreenProps<'Home'>['navigation']>();

  // State lưu dữ liệu từ API
  const [hotStories, setHotStories] = useState<Story[]>([]);
  const [newStories, setNewStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const extractData = (response: any): Story[] => {
    if (!response || !response.data) return [];
    if (response.data.items && Array.isArray(response.data.items)) {
      return response.data.items;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [hotRes, newRes] = await Promise.allSettled([
          storyService.getTopWeekly(),
          storyService.getLatest()
        ]);

        if (hotRes.status === 'fulfilled') {
          setHotStories(extractData(hotRes.value));
        }
        
        if (newRes.status === 'fulfilled') {
          setNewStories(extractData(newRes.value));
        }

      } catch (error) {
        console.error("Lỗi tải trang chủ:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Render danh sách truyện ngang
  const renderStoryList = (stories: Story[]) => {
    if (stories.length === 0) {
      return (
        <Text style={{ color: colors.mutedForeground, marginLeft: 4, fontStyle: 'italic' }}>
          Chưa có truyện nào.
        </Text>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {stories.map((story, index) => (
          <StoryCard
            // --- SỬA LỖI KEY TẠI ĐÂY ---
            // Kết hợp storyId và index để đảm bảo key luôn duy nhất
            key={story.storyId ? `${story.storyId}-${index}` : `story-${index}`} 
            // ---------------------------
            title={story.title}
            cover={story.coverUrl}
            author={story.authorUsername}
            onClick={() => navigation.navigate('StoryDetail', { storyId: story.storyId })}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.pageContainer}
      >
        {/* 1. Header & Search Bar */}
        <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.logoRow}>
            <View style={[styles.logoBg, { backgroundColor: theme === 'light' ? '#1E5162' : '#F7F3E8' }]}>
              <BookOpen size={18} color={theme === 'light' ? '#F7F3E8' : '#1E5162'} />
            </View>
            <Text style={[typography.h2, { color: colors.foreground }]}>
              ToraNovel Reader
            </Text>
          </View>

          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Search')}
          >
            <View pointerEvents="none">
              <Input
                placeholder="Tìm kiếm truyện, tác giả..."
                leftIcon={<Search size={18} color={colors.mutedForeground} />}
                editable={false} 
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* 2. Content */}
        {isLoading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
             <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.content}>
            
            {/* Section 1: Truyện Đề Xuất */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[typography.h3, { color: colors.foreground }]}>Truyện Đề Xuất</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                  <Text style={[typography.p, styles.seeAll, { color: colors.accent }]}>Xem thêm</Text>
                </TouchableOpacity>
              </View>
              {renderStoryList(hotStories.slice(0, 5))}
            </View>

            {/* Section 2: Mới Cập Nhật */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[typography.h3, { color: colors.foreground }]}>Mới Cập Nhật</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                  <Text style={[typography.p, styles.seeAll, { color: colors.accent }]}>Xem thêm</Text>
                </TouchableOpacity>
              </View>
              {renderStoryList(newStories)}
            </View>

            {/* Section 3: Thịnh Hành */}
            {hotStories.length > 5 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[typography.h3, { color: colors.foreground }]}>Thịnh Hành</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                    <Text style={[typography.p, styles.seeAll, { color: colors.accent }]}>Xem thêm</Text>
                  </TouchableOpacity>
                </View>
                {renderStoryList(hotStories.slice(5, 15))}
              </View>
            )}

          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pageContainer: { paddingBottom: 20 },
  header: {
    borderBottomWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    elevation: 2,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  logoBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAll: {
    fontWeight: '500',
    fontSize: 14,
  },
  scrollContainer: {
    gap: 12,
  },
});