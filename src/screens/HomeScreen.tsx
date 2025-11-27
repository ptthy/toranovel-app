import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeProvider';
import { Input } from '../components/ui/Input';
import { StoryCard } from '../components/ui/StoryCard';
import { Search, BookOpen, Flame, Clock } from 'lucide-react-native';

import { useNavigation } from '@react-navigation/native';
import { MainTabScreenProps } from '../navigation/types';
import { Story, storyService } from '../api/storyService';

export function HomeScreen() {
  const { colors, typography, theme } = useTheme();
  const navigation = useNavigation<MainTabScreenProps<'Home'>['navigation']>();

  // --- STATE ---
  const [weeklyStories, setWeeklyStories] = useState<Story[]>([]);
  const [newStories, setNewStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper extract data
  const extractData = (response: any): Story[] => {
    if (!response || !response.data) return [];
    if (response.data.items && Array.isArray(response.data.items)) return response.data.items;
    if (Array.isArray(response.data)) return response.data;
    return [];
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [weeklyRes, newRes] = await Promise.allSettled([
          storyService.getTopWeekly(),
          storyService.searchStories({ page: 1, pageSize: 20, sort: 'Newest' })
        ]);

        if (weeklyRes.status === 'fulfilled') {
          const rawData = weeklyRes.value.data;
          if (Array.isArray(rawData) && rawData.length > 0 && (rawData[0] as any).story) {
            const mappedStories = rawData.map((item: any) => item.story);
            setWeeklyStories(mappedStories);
          } else {
            setWeeklyStories(extractData(weeklyRes.value));
          }
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

  // Render List
  const renderStoryList = (stories: Story[], showAuthor: boolean = true) => {
    if (stories.length === 0) {
      return (
        <Text style={{ color: colors.mutedForeground, marginLeft: 20, fontStyle: 'italic' }}>
          Đang cập nhật...
        </Text>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }} 
      >
        {stories.map((story, index) => (
          <StoryCard
            key={story.storyId ? `${story.storyId}-${index}` : `story-${index}`} 
            title={story.title}
            cover={story.coverUrl}
           
            onClick={() => navigation.navigate('StoryDetail', { storyId: story.storyId })}
          />
        ))}
      </ScrollView>
    );
  };

  // --- 1. MÀU NỀN MỚI ---
  const lightBg = '#F7F3E8'; // Màu kem bạn yêu cầu
  const darkBg = '#0F0F0F';
  
  const bgStyle = { backgroundColor: theme === 'light' ? lightBg : darkBg };
  
  // Màu nền cho Header & SearchBar hòa hợp
  const headerBg = theme === 'light' ? lightBg : '#1A1A1A';
  const searchBarBg = theme === 'light' ? '#EBE7DC' : '#282828'; // Tối hơn nền 1 chút để nổi

  return (
    <SafeAreaView style={[styles.flex, bgStyle]} edges={['top']}> 
      <StatusBar barStyle={theme === 'light' ? "dark-content" : "light-content"} backgroundColor={headerBg} />
      
      {/* HEADER */}
      <View style={[styles.headerContainer, { backgroundColor: headerBg, borderBottomColor: 'rgba(0,0,0,0.05)' }]}>
        <View style={styles.headerTopRow}>
          <View style={styles.logoGroup}>
             <View style={[styles.logoIcon, { backgroundColor: theme === 'light' ? '#1E5162' : '#D4B37F' }]}>
               <BookOpen size={16} color={theme === 'light' ? '#FFF' : '#000'} />
             </View>
             <Text style={[typography.h3, { color: colors.foreground, fontWeight: '700', letterSpacing: 0.5 }]}>
               ToraNovel
             </Text>
          </View>
        </View>

        {/* --- 2. FIX SEARCH BAR --- */}
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={() => navigation.navigate('Search')}
        >
          <View pointerEvents="none">
            <Input
              placeholder="Tìm kiếm truyện, tác giả..."
              placeholderTextColor={colors.mutedForeground}
              leftIcon={<Search size={18} color={colors.mutedForeground} />}
              editable={false} 
              // BorderWidth = 0 để bỏ khung, chỉnh background cho tiệp màu
              style={{ 
                backgroundColor: searchBarBg, 
                borderWidth: 0, 
                height: 42,
                borderRadius: 21, // Bo tròn hơn
                fontSize: 14
              }}
            />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.flex} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
             <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View>
            
            {/* SECTION 1: TOP TRUYỆN TUẦN */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                   <Flame size={20} color="#FF6B6B" fill="#FF6B6B" />
                   <Text style={[typography.h3, styles.sectionTitle, { color: colors.foreground }]}>
                     Top Truyện Tuần
                   </Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Search', { sort: 'weekly' } as any)}>
                  <Text style={[typography.p, { color: colors.accent, fontWeight: '600', fontSize: 13 }]}>
                    Xem tất cả
                  </Text>
                </TouchableOpacity>
              </View>
              {renderStoryList(weeklyStories, true)} 
            </View>

            {/* SECTION 2: MỚI CẬP NHẬT */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                   <Clock size={20} color="#4ECDC4" />
                   <Text style={[typography.h3, styles.sectionTitle, { color: colors.foreground }]}>
                     Mới Cập Nhật
                   </Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                  <Text style={[typography.p, { color: colors.accent, fontWeight: '600', fontSize: 13 }]}>
                    Xem tất cả
                  </Text>
                </TouchableOpacity>
              </View>
              {renderStoryList(newStories, false)}
            </View>

            {/* --- 3. FIX FOOTER BỊ CHE --- */}
            {/* Tăng chiều cao khoảng trống cuối cùng lên 100 để đẩy nội dung lên trên TabBar */}
            <View style={{ height: 100 }} />

          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  
  headerContainer: {
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16,
    // Shadow nhẹ hơn nữa
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1, zIndex: 10,
    borderBottomWidth: 1,
  },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  logoGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  
  scrollContent: { paddingTop: 24 },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontWeight: '700', fontSize: 18, letterSpacing: 0.3 },
});