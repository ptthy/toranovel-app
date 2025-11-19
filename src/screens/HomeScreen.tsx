import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeProvider';
import { Input } from '../components/ui/Input';
import { StoryCard } from '../components/ui/StoryCard';
import { Search, BookOpen } from 'lucide-react-native';

// 1. Import hook và Type
import { useNavigation } from '@react-navigation/native';
import { MainTabScreenProps } from '../navigation/types';

// Thêm Type cho Story
type Story = {
  id: string; // <--- SỬA: Đổi từ number thành string để khớp với API và Navigation
  title: string;
  author: string;
  genre: string;
  cover: string;
};

const trendingStories: Story[] = [
  // SỬA: Đổi id thành chuỗi '1', '2'
  { id: '1', title: 'Ma Vương Phục Sinh', author: 'Nguyễn Thanh Tùng', genre: 'Huyền Huyễn', cover: 'https://via.placeholder.com/150' },
  { id: '2', title: 'Hoàng Hậu Giả Mạo', author: 'Lê Minh Anh', genre: 'Cổ Trang', cover: 'https://via.placeholder.com/150' },
];
const recentUpdates: Story[] = [
  // SỬA: Đổi id thành chuỗi '5'
  { id: '5', title: 'Kiếm Khách Lãng Du', author: 'Hoàng Minh Tuấn', genre: 'Kiếm Hiệp', cover: 'https://via.placeholder.com/150' },
];

export function HomeScreen() {
  const { colors, typography, theme } = useTheme();
  
  // 2. Lấy navigation từ hook
  const navigation = useNavigation<MainTabScreenProps<'Home'>['navigation']>();

  const renderStoryList = (stories: Story[]) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {stories.map((story) => (
        <StoryCard
          key={story.id}
          {...story}
          // Bây giờ story.id là string, nên không còn lỗi nữa
          onClick={() => navigation.navigate('StoryDetail', { storyId: story.id })}
        />
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.pageContainer}
      >
        {/* 1. Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.logoRow}>
            <View style={[styles.logoBg, { backgroundColor: theme === 'light' ? '#1E5162' : '#F7F3E8' }]}>
              <BookOpen size={18} color={theme === 'light' ? '#F7F3E8' : '#1E5162'} />
            </View>
            <Text style={[typography.h2, { color: colors.foreground }]}>
              ToraNovel Reader
            </Text>
          </View>
          <Input
            placeholder="Tìm kiếm truyện, tác giả..."
            leftIcon={<Search size={18} color={colors.mutedForeground} />}
          />
        </View>

        {/* 2. Content */}
        <View style={styles.content}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[typography.h3, { color: colors.foreground }]}>Truyện đề xuất</Text>
              <TouchableOpacity>
                <Text style={[typography.p, styles.seeAll, { color: colors.accent }]}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            {renderStoryList(trendingStories)}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[typography.h3, { color: colors.foreground }]}>Đang đọc</Text>
              <TouchableOpacity>
                <Text style={[typography.p, styles.seeAll, { color: colors.accent }]}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            {renderStoryList(recentUpdates.slice(0, 3))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[typography.h3, { color: colors.foreground }]}>Thịnh hành</Text>
              <TouchableOpacity>
                <Text style={[typography.p, styles.seeAll, { color: colors.accent }]}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            {renderStoryList(recentUpdates)}
          </View>
        </View>
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