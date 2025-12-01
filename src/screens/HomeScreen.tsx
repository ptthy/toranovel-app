import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeProvider';
import { Input } from '../components/ui/Input';
import { Search, BookOpen, Flame, Clock, Bell } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { MainTabScreenProps } from '../navigation/types';
import { Story, storyService } from '../api/storyService';
// 👇 Import Service mới
import { notificationService, NotificationItem } from '../api/notificationService';

export function HomeScreen() {
  const { colors, typography, theme } = useTheme();
  const navigation = useNavigation<MainTabScreenProps<'Home'>['navigation']>();

  // --- STATE ---
  const [weeklyStories, setWeeklyStories] = useState<Story[]>([]);
  const [newStories, setNewStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Notification
  const [notificationCount, setNotificationCount] = useState(0);

  const extractData = (response: any): Story[] => {
    if (!response || !response.data) return [];
    if (response.data.items && Array.isArray(response.data.items)) return response.data.items;
    if (Array.isArray(response.data)) return response.data;
    return [];
  };

  // Hàm tải data truyện
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

  // 👇 LOGIC NOTIFICATION MỚI 👇
  // Dùng useFocusEffect để mỗi khi quay lại Home thì update số lượng thông báo
  useFocusEffect(
    useCallback(() => {
      const fetchNotifications = async () => {
        try {
          const res = await notificationService.getNotifications(1, 20); // Lấy 20 tin mới nhất
          if (res.data && res.data.items) {
            // Đếm số lượng tin chưa đọc (isRead === false)
            const unread = res.data.items.filter((item: NotificationItem) => !item.isRead).length;
            setNotificationCount(unread);
          }
        } catch (error) {
          console.log("Lỗi tải thông báo:", error);
        }
      };

      fetchNotifications();
    }, [])
  );

  const renderStoryList = (stories: Story[]) => {
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
        contentContainerStyle={{ paddingHorizontal: 16 }} 
      >
        {stories.map((story, index) => (
          <TouchableOpacity 
            key={story.storyId ? `${story.storyId}-${index}` : `story-${index}`}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('StoryDetail', { storyId: story.storyId })}
            style={{ width: 105, marginRight: 12 }} 
          >
            <Image 
              source={{ uri: story.coverUrl }} 
              style={{ 
                width: 105, 
                height: 155, 
                borderRadius: 8, 
                backgroundColor: '#e1e1e1' 
              }}
              resizeMode="cover"
            />
            <Text 
              numberOfLines={2} 
              style={[
                typography.p, 
                { 
                  color: colors.foreground, 
                  fontWeight: '600', 
                  fontSize: 13, 
                  marginTop: 6,
                  lineHeight: 18
                }
              ]}
            >
              {story.title}
            </Text>
            <Text numberOfLines={1} style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 2 }}>
               {story.authorUsername || "Tác giả"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const lightBg = '#F7F3E8'; 
  const darkBg = '#0F0F0F';
  const bgStyle = { backgroundColor: theme === 'light' ? lightBg : darkBg };
  const headerBg = theme === 'light' ? lightBg : '#1A1A1A';
  const searchBarBg = theme === 'light' ? '#EBE7DC' : '#282828';
  const iconColor = theme === 'light' ? '#333' : '#FFF';

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

      
          <TouchableOpacity 
            style={styles.notificationButton}
           
            onPress={() => navigation.navigate('Notification')} 
          >
            <Bell size={24} color={iconColor} />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Search')}>
          <View pointerEvents="none">
            <Input
              placeholder="Tìm kiếm truyện, tác giả..."
              placeholderTextColor={colors.mutedForeground}
              leftIcon={<Search size={18} color={colors.mutedForeground} />}
              editable={false} 
              style={{ 
                backgroundColor: searchBarBg, 
                borderWidth: 0, 
                height: 42,
                borderRadius: 21,
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
            {/* Top Truyện Tuần */}
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
              {renderStoryList(weeklyStories)} 
            </View>

            {/* Mới Cập Nhật */}
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
              {renderStoryList(newStories)}
            </View>

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
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1, zIndex: 10,
    borderBottomWidth: 1,
  },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  logoGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  notificationButton: { position: 'relative', padding: 4 },
  badge: {
    position: 'absolute', top: 0, right: 0, backgroundColor: '#FF3B30', borderRadius: 10,
    minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#FFF',
  },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: 'bold', paddingHorizontal: 2 },
  scrollContent: { paddingTop: 24 },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontWeight: '700', fontSize: 18, letterSpacing: 0.3 },
});