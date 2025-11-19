import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeProvider';
import { Input } from '../components/ui/Input';
import { StoryCard } from '../components/ui/StoryCard';
import { Search } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { MainTabScreenProps } from '../navigation/types';
import { Story, storyService, TagItem } from '../api/storyService';



// Hàm debounce để tránh gọi API liên tục khi gõ
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

export function SearchScreen() {
  const { colors, typography } = useTheme();
  const navigation = useNavigation<MainTabScreenProps<'Home'>['navigation']>();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500); // Đợi 500ms

  // 2. Sửa State: Dùng TagItem[] thay vì Tag[]
  const [tags, setTags] = useState<TagItem[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string | undefined>(undefined);
  
  const [results, setResults] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Lấy danh sách Tags
  useEffect(() => {
    storyService.getTags().then((res) => {
      setTags(res.data);
    }).catch(err => console.error("Lỗi lấy tags:", err));
  }, []);

  // Gọi API Search
  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      try {
        const response = await storyService.searchStories({
          query: debouncedQuery,
          tagId: selectedTagId,
          page: 1,
          pageSize: 20,
        });
        setResults(response.data.items || []);
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, [debouncedQuery, selectedTagId]);

  // 3. Sửa Render Tag: Dùng TagItem và thuộc tính .name
  const renderTagItem = ({ item }: { item: TagItem }) => {
    const isSelected = item.tagId === selectedTagId;
    return (
      <TouchableOpacity
        style={[
          styles.tagChip,
          { 
            backgroundColor: isSelected ? colors.primary : colors.card,
            borderColor: isSelected ? colors.primary : colors.border
          }
        ]}
        onPress={() => setSelectedTagId(isSelected ? undefined : item.tagId)}
      >
        <Text style={{ 
          color: isSelected ? colors.background : colors.foreground,
          fontSize: 12, fontWeight: '500' 
        }}>
          {item.name} 
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* Thanh tìm kiếm */}
        <View style={styles.searchContainer}>
          <Input
            placeholder="Nhập tên truyện, tác giả..."
            value={query}
            onChangeText={setQuery}
            leftIcon={<Search size={20} color={colors.mutedForeground} />}
            style={{ marginBottom: 0 }}
            autoFocus={true}
          />
        </View>

        {/* Danh sách Tags */}
        <View style={styles.tagListContainer}>
          <FlatList
            data={tags}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.tagId}
            renderItem={renderTagItem}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
          />
        </View>

        {/* Kết quả tìm kiếm */}
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.storyId}
            numColumns={3}
            contentContainerStyle={styles.resultList}
            columnWrapperStyle={{ gap: 12 }}
            ListEmptyComponent={
              <Text style={[typography.p, { textAlign: 'center', marginTop: 20, color: colors.mutedForeground }]}>
                Không tìm thấy truyện nào.
              </Text>
            }
            renderItem={({ item }) => (
              <View style={{ flex: 1, maxWidth: '33%' }}>
                 {/* 4. Sửa StoryCard: Mapping đúng tên trường dữ liệu */}
                 <StoryCard 
                    // Không truyền prop `id={...}` vì StoryCard không có prop đó
                    // Mapping từ API -> Props của Component
                    title={item.title}
                    cover={item.coverUrl}          
                    author={item.authorUsername}   
                    // genre="Truyện"                 // API list không trả genre, để mặc định hoặc ẩn
                    onClick={() => navigation.navigate('StoryDetail', { storyId: item.storyId })}
                 />
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  searchContainer: { padding: 16, paddingBottom: 8 },
  tagListContainer: { height: 50 },
  tagChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  resultList: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});