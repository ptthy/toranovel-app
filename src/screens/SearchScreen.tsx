import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeProvider";
import { StoryListItem } from "../components/ui/StoryListItem";
import { Search, X, SlidersHorizontal } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { MainTabScreenProps } from "../navigation/types";
import { Story, storyService, TagItem } from "../api/storyService";
import { FilterModal } from "../components/ui/FilterModal";

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
  const navigation = useNavigation<MainTabScreenProps<"Home">["navigation"]>();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  // SỬA: Mặc định là 'latest' (Mới nhất) để luôn có dữ liệu
  const [filter, setFilter] = useState<{
    tagId: string | undefined;
    sort: "weekly" | "latest";
  }>({
    tagId: undefined,
    sort: "latest", // <--- Đổi thành 'latest'
  });

  const [tags, setTags] = useState<TagItem[]>([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [results, setResults] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Kiểm tra xem có đang tìm kiếm thực sự không (để hiển thị nút Back/Mặc định)
  const isSearching =
    debouncedQuery.length > 0 || filter.tagId || filter.sort !== "latest";

  useEffect(() => {
    storyService
      .getTags()
      .then((res) => {
        setTags(res.data);
      })
      .catch((err) => console.error("Lỗi lấy tags:", err));
  }, []);

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
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const MAX_ITEMS = 100;

        let response;
        // 1. Trường hợp có Search hoặc Filter Tag
        if (debouncedQuery.length > 0 || filter.tagId) {
          response = await storyService.searchStories({
            query: debouncedQuery,
            tagId: filter.tagId,
            page: 1,
            pageSize: MAX_ITEMS, // Lấy 100 item
          });
          setResults(extractData(response));
        }
        // 2. Trường hợp mặc định (Load All / Latest)
        else {
          if (filter.sort === "weekly") {
            // API top-weekly thường trả về số lượng cố định,
            // nếu muốn nhiều hơn phải dùng API Catalog chung
            const res = await storyService.getTopWeekly();
            setResults(extractData(res));
          } else {
            // "Get All" ở đây: Gọi API Catalog lấy 100 item mới nhất
            const res = await storyService.searchStories({
              page: 1,
              pageSize: MAX_ITEMS, // Lấy 100 item
            });
            setResults(extractData(res));
          }
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [debouncedQuery, filter]);

  const handleApplyFilter = (
    newTagId: string | undefined,
    newSort: "weekly" | "latest"
  ) => {
    setFilter({
      tagId: newTagId,
      sort: newSort,
    });
  };

  const renderFilterStatus = () => {
    if (!isSearching) return null;

    let statusText = "Danh sách: Mới cập nhật";
    if (filter.tagId) {
      const tagName = tags.find((t) => t.tagId === filter.tagId)?.name || "Thẻ";
      statusText = `Lọc theo: ${tagName}`;
    } else if (debouncedQuery.length > 0) {
      statusText = `Tìm kiếm: "${debouncedQuery}"`;
    } else if (filter.sort === "weekly") {
      statusText = "Danh sách: Hot Tuần";
    }

    return (
      <View style={styles.activeFilterBar}>
        <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
          {statusText}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setFilter({ tagId: undefined, sort: "latest" }); // Reset về mặc định
            setQuery("");
          }}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: 12,
              marginLeft: 12,
              fontWeight: "bold",
            }}
          >
            Mặc định
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* HEADER */}
        <View
          style={[styles.headerContainer, { borderBottomColor: colors.border }]}
        >
          <View style={[styles.searchBar, { backgroundColor: "#F2F2F2" }]}>
            <Search size={20} color="#999" style={{ marginLeft: 12 }} />
            <TextInput
              placeholder="Tìm kiếm truyện..."
              placeholderTextColor="#999"
              value={query}
              onChangeText={setQuery}
              style={[styles.input, { color: "#333" }]}
              autoFocus={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")}>
                <X size={18} color="#999" style={{ marginRight: 12 }} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setIsFilterVisible(true)}
          >
            <SlidersHorizontal
              size={24}
              color={isSearching ? colors.primary : colors.foreground}
            />
            {isSearching && <View style={styles.badge} />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            <Text style={{ color: colors.foreground, fontSize: 15 }}>
              Thoát
            </Text>
          </TouchableOpacity>
        </View>

        {renderFilterStatus()}

        {/* KẾT QUẢ */}
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item, index) =>
              item.storyId ? `${item.storyId}-${index}` : `item-${index}`
            }
            contentContainerStyle={styles.resultList}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={{ color: colors.mutedForeground }}>
                  {/* Nếu vào mà ko thấy gì thì chắc chắn DB trống hoặc lỗi mạng */}
                  Không có truyện nào để hiển thị.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <StoryListItem
              storyId={item.storyId}     
      authorId={item.authorId}
                title={item.title}
                cover={item.coverUrl}
                author={item.authorUsername}
                rating={item.averageRating || 0}
                onClick={() =>
                  navigation.navigate("StoryDetail", { storyId: item.storyId })
                }
              />
            )}
          />
        )}
      </View>

      <FilterModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onApply={handleApplyFilter}
        tags={tags}
        currentTagId={filter.tagId}
        currentSort={filter.sort}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    marginRight: 12,
  },
  input: { flex: 1, height: "100%", paddingHorizontal: 8, fontSize: 15 },
  filterButton: { padding: 8, marginRight: 4, position: "relative" },
  cancelButton: { paddingVertical: 8, marginLeft: 4 },
  badge: {
    position: "absolute",
    top: 8,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DC3545",
  },
  activeFilterBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultList: { padding: 16, paddingTop: 8 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyState: { alignItems: "center", marginTop: 40, paddingHorizontal: 20 },
});
