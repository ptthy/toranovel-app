// src/screens/LibraryScreen.tsx
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeProvider';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Image } from 'expo-image';
import { Progress } from '../components/ui/Progress';
import { BookOpen } from 'lucide-react-native';
type LibraryStory = {
  id: number;
  title: string;
  author: string;
  progress: number;
  cover: string;
};
const readingStories: LibraryStory[] = [
  // ... (Dữ liệu của bạn)
];
const savedStories: LibraryStory[] = [
  // ... (Dữ liệu của bạn)
];
const historyStories: LibraryStory[] = [
  // ... (Dữ liệu của bạn)
];

// Component cho 1 list truyện
const StoryList = ({ stories }: { stories: LibraryStory[] }) => {
  const { colors, typography } = useTheme();

  if (stories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <BookOpen size={48} color={colors.mutedForeground} />
        <Text style={[typography.p, { color: colors.mutedForeground, marginTop: 16 }]}>
          Chưa có truyện nào trong thư viện.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={stories}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.storyItem, { backgroundColor: colors.card }]}
          // onPress={() => onNavigate('Reader', { story: item })}
        >
          <Image
            source={{ uri: item.cover }}
            style={styles.storyCover}
            contentFit="cover"
          />
          <View style={styles.storyInfo}>
            <View>
              <Text
                style={[typography.h4, { color: colors.foreground }]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <Text style={[typography.p, { color: colors.mutedForeground, fontSize: 12, marginTop: 4 }]}>
                {item.author}
              </Text>
            </View>
            <View>
              <View style={styles.progressRow}>
                <Text style={[typography.p, { color: colors.mutedForeground, fontSize: 11 }]}>Tiến độ</Text>
                <Text style={[typography.p, { color: colors.foreground, fontSize: 11, fontWeight: '600' }]}>
                  {item.progress}%
                </Text>
              </View>
              <Progress value={item.progress} />
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

// Map các scene
const renderScene = SceneMap({
  saved: () => <StoryList stories={savedStories} />,
  history: () => <StoryList stories={historyStories} />,
  downloaded: () => <StoryList stories={readingStories} />,
});

export function LibraryScreen() {
  const { colors, typography, theme } = useTheme();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'saved', title: 'Đã lưu' },
    { key: 'history', title: 'Lịch sử đọc' },
    { key: 'downloaded', title: 'Đã tải xuống' },
  ]);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[typography.h2, { color: colors.foreground }]}>Thư viện của tôi</Text>
      </View>

      {/* Tab View */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={(props) => (
        <TabBar
          {...(props as any)} // <-- SỬA LẠI DÒNG NÀY
          style={[styles.tabBar, { backgroundColor: colors.card, borderColor: colors.border }]}
          indicatorStyle={{ backgroundColor: 'transparent' }} // Ẩn indicator
          renderLabel={({ route, focused }: { route: { title: string }, focused: boolean }) => {
            const isActive = focused;
            const activeBg = theme === 'light' ? '#1E5162' : '#F7F3E8';
            const activeText = theme === 'light' ? '#F7F3E8' : '#1E5162';
            const inactiveText = colors.mutedForeground;

              return (
              <View
                style={[
                  styles.tabItem,
                  { backgroundColor: isActive ? activeBg : 'transparent' },
                ]}
              >
                <Text style={[typography.p, { color: isActive ? activeText : inactiveText, fontWeight: '600' }]}>
                  {route.title}
                </Text>
              </View>
              );
            }}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    borderBottomWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    elevation: 2,
  },
  tabBar: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 10,
    borderWidth: 1,
    padding: 4,
    elevation: 0, // Bỏ shadow mặc định
  },
  tabItem: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  storyItem: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  storyCover: {
    width: 80,
    height: 112,
    borderRadius: 8,
  },
  storyInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
});