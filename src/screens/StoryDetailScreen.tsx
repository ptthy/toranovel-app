import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTheme } from '../contexts/ThemeProvider';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MainScreenProps } from '../navigation/types';
import { ArrowLeft, BookOpen, List, User, Lock, LockOpen } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Chapter, StoryDetail, storyService } from '../api/storyService';


export function StoryDetailScreen() {
  const { colors, typography } = useTheme();
  const navigation = useNavigation<MainScreenProps<'StoryDetail'>['navigation']>();
  const route = useRoute<MainScreenProps<'StoryDetail'>['route']>();
  
  const { storyId } = route.params;

  const [story, setStory] = useState<StoryDetail | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storyRes, chapterRes] = await Promise.allSettled([
          storyService.getStoryDetail(storyId),
          storyService.getChapters(storyId)
        ]);

        if (storyRes.status === 'fulfilled') {
          setStory(storyRes.value.data);
        }
        
        if (chapterRes.status === 'fulfilled') {
           const responseData = chapterRes.value.data;
           if (responseData && Array.isArray(responseData.items)) {
             const sortedChapters = responseData.items.sort((a, b) => a.chapterNo - b.chapterNo);
             setChapters(sortedChapters);
           }
        }
      } catch (error) {
        console.error("Lỗi tải truyện:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [storyId]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!story) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Không tìm thấy truyện.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
           <Text style={{ color: colors.primary }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderChapterItem = (chapter: Chapter) => (
    <TouchableOpacity 
      key={chapter.chapterId}
      style={[styles.chapterItem, { borderBottomColor: colors.border }]}
      onPress={() => navigation.navigate('Reader', { storyId: story.storyId, chapterId: chapter.chapterId })}
    >
      <View style={{ flex: 1 }}>
        <Text style={[typography.p, { color: colors.foreground, fontWeight: '500' }]}>
          {chapter.title || `Chương ${chapter.chapterNo}`}
        </Text>
        <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 2 }}>
          {new Date(chapter.publishedAt).toLocaleDateString('vi-VN')} • {chapter.wordCount} chữ
        </Text>
      </View>
      <View style={{ marginLeft: 10 }}>
        {chapter.accessType === 'free' ? (
           <LockOpen size={16} color={colors.mutedForeground} /> 
        ) : (
           <Lock size={16} color="#DC3545" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header & Cover */}
        <View style={styles.headerContainer}>
          <Image source={{ uri: story.coverUrl }} style={styles.backgroundImage} blurRadius={15} />
          <LinearGradient colors={['transparent', colors.background]} style={styles.gradientOverlay} />
          
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.coverWrapper}>
            <Image source={{ uri: story.coverUrl }} style={styles.mainCover} contentFit="cover" />
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={[typography.h2, styles.title, { color: colors.foreground }]}>{story.title}</Text>
          
          <View style={styles.metaRow}>
            <User size={16} color={colors.mutedForeground} />
            <Text style={[typography.p, { color: colors.accent, marginLeft: 6, fontWeight: '600' }]}>
              {story.authorUsername}
            </Text>
          </View>

          <View style={styles.tagsRow}>
            {story.tags.map((tag) => (
              <View key={tag.tagId} style={[styles.tagBadge, { backgroundColor: colors.muted }]}>
                <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>{tag.tagName}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.statsBox, { borderColor: colors.border }]}>
            <View style={styles.statItem}>
              <List size={20} color={colors.primary} />
              <Text style={[typography.h4, { color: colors.foreground }]}>{story.totalChapters}</Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>Chương</Text>
            </View>
            <View style={styles.statItem}>
              <BookOpen size={20} color={colors.primary} />
              <Text style={[typography.h4, { color: colors.foreground }]}>
                 {story.lengthPlan === 'short' ? 'Ngắn' : 'Dài'}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>Độ dài</Text>
            </View>
          </View>

          <Text style={[typography.h4, { color: colors.foreground, marginTop: 24, marginBottom: 8 }]}>
            Giới thiệu
          </Text>
          <Text style={[typography.p, { color: colors.mutedForeground, lineHeight: 22 }]}>
            {story.description}
          </Text>

          <View style={styles.chapterHeaderRow}>
             <Text style={[typography.h4, { color: colors.foreground }]}>Danh sách chương</Text>
             <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
               {chapters.length} chương
             </Text>
          </View>
          
          {chapters.length > 0 ? (
            <View style={[styles.chapterList, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {chapters.map(renderChapterItem)}
            </View>
          ) : (
            <Text style={{ color: colors.mutedForeground, fontStyle: 'italic', marginTop: 8 }}>
              Chưa có chương nào.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 40 },
  headerContainer: { height: 280, alignItems: 'center', justifyContent: 'flex-end' },
  backgroundImage: { ...StyleSheet.absoluteFillObject, opacity: 0.5 },
  gradientOverlay: { ...StyleSheet.absoluteFillObject },
  backButton: { position: 'absolute', top: 16, left: 16, zIndex: 10, padding: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },
  coverWrapper: { 
    width: 130, height: 190, borderRadius: 8, overflow: 'hidden', 
    shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, elevation: 8,
    marginBottom: -20, zIndex: 5
  },
  mainCover: { width: '100%', height: '100%' },
  infoContainer: { padding: 20, paddingTop: 30 },
  title: { textAlign: 'center', fontWeight: '700', marginBottom: 8, fontSize: 22 },
  metaRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 20 },
  tagBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statsBox: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, padding: 16, justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 4 },
  chapterHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, marginBottom: 12 },
  chapterList: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  chapterItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
});