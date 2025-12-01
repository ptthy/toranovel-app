import React, { useState, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeProvider';
import { TabView, SceneMap } from 'react-native-tab-view';
import { Image } from 'expo-image';
import { BookOpen } from 'lucide-react-native';
import { storyService } from '../api/storyService';
import { MainTabScreenProps } from '../navigation/types';

type LibraryStory = {
  id: string;
  title: string;
  author: string;
  progress?: number;
  cover: string;
};

type Route = {
  key: string;
  title: string;
};

// Component List Truyện (Dạng Grid)
const StoryList = ({ stories, isLoading, onNavigate }: { stories: LibraryStory[], isLoading?: boolean, onNavigate: (id: string) => void }) => {
  const { colors, typography } = useTheme();
  
  // Tính toán kích thước card
  const screenWidth = Dimensions.get('window').width;
  const numColumns = 3;
  const gap = 12; // Khoảng cách giữa các item
  const padding = 16;
  // (Chiều rộng màn hình - tổng padding - tổng gap) / số cột
  const itemWidth = (screenWidth - (padding * 2) - (gap * (numColumns - 1))) / numColumns;

  if (isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (stories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <BookOpen size={48} color={colors.mutedForeground} />
        <Text style={[typography.p, { color: colors.mutedForeground, marginTop: 16 }]}>
          Chưa có truyện nào.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={stories}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      numColumns={numColumns} // Bật chế độ Grid
      columnWrapperStyle={{ gap: gap }} // Gap ngang (yêu cầu RN > 0.71, nếu lỗi dùng marginRight trong item)
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.gridItem, { width: itemWidth }]}
          onPress={() => onNavigate(item.id)}
        >
          {/* Card Image */}
          <Image
            source={{ uri: item.cover }}
            style={[styles.gridCover, { height: itemWidth * 1.5 }]} // Tỉ lệ 2:3
            contentFit="cover"
          />
          {/* Title */}
          <Text
            style={[typography.p, { color: colors.foreground, fontSize: 12, marginTop: 6, textAlign: 'center', fontWeight: '500' }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
};

export function LibraryScreen() {
  const { colors, typography, theme } = useTheme();
  const navigation = useNavigation<MainTabScreenProps<'Library'>['navigation']>();
  const [index, setIndex] = useState(0);

  const [routes] = useState<Route[]>([
    { key: 'saved', title: 'Đã lưu' },
    { key: 'history', title: 'Lịch sử' },
    { key: 'downloaded', title: 'Đã tải' }
  ]);

  const [savedStories, setSavedStories] = useState<LibraryStory[]>([]);
  const [isSavedLoading, setIsSavedLoading] = useState(false);
  
  // Mấy cái này bạn tự fetch tương tự nhé
  const [historyStories] = useState<LibraryStory[]>([]); 
  const [downloadedStories] = useState<LibraryStory[]>([]); 

  const fetchSavedStories = async () => {
    setIsSavedLoading(true);
    try {
      const response = await storyService.getFavoriteStories(1, 100);
      if (response.data && Array.isArray(response.data.items)) {
        const mappedData: LibraryStory[] = response.data.items.map((item: any) => ({
          id: item.storyId,
          title: item.title,
          author: item.authorUsername || 'Tác giả',
          cover: item.coverUrl
        }));
        setSavedStories(mappedData);
      }
    } catch (error) {
      console.error('Lỗi tải thư viện đã lưu:', error);
    } finally {
      setIsSavedLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => { fetchSavedStories(); }, [])
  );

  const handleNavigateDetail = (storyId: string) => {
    navigation.navigate('StoryDetail', { storyId });
  };

  const renderScene = SceneMap({
    saved: () => <StoryList stories={savedStories} isLoading={isSavedLoading} onNavigate={handleNavigateDetail} />,
    history: () => <StoryList stories={historyStories} onNavigate={handleNavigateDetail} />,
    downloaded: () => <StoryList stories={downloadedStories} onNavigate={handleNavigateDetail} />,
  });

  const renderCustomTabBar = () => {
    const activeBg = theme === 'light' ? '#1E5162' : '#F7F3E8';
    const activeText = theme === 'light' ? '#F7F3E8' : '#1E5162';

    return (
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {routes.map((route, i) => {
          const isActive = i === index;
          return (
            <TouchableOpacity
              key={route.key}
              style={[styles.tabItem, { backgroundColor: isActive ? activeBg : 'transparent' }]}
              onPress={() => setIndex(i)}
            >
              <Text style={[typography.p, { color: isActive ? activeText : colors.mutedForeground, fontWeight: '600', fontSize: 13 }]}>
                {route.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[typography.h2, { color: colors.foreground }]}>Thư viện của tôi</Text>
      </View>

      {renderCustomTabBar()}

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={() => null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { borderBottomWidth: 1, padding: 16, elevation: 2 },
  tabBar: { margin: 16, borderRadius: 10, borderWidth: 1, padding: 4, flexDirection: 'row' },
  tabItem: { flex: 1, borderRadius: 8, paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
  
  listContainer: { padding: 16, paddingBottom: 100, gap: 12 }, // Gap dọc
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },

  // --- GRID STYLES ---
  gridItem: {
    // Width được tính toán động ở component
    marginBottom: 4,
  },
  gridCover: {
    width: '100%',
    borderRadius: 6,
    backgroundColor: '#eee',
  },
});