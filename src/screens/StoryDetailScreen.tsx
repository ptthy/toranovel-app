import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTheme } from '../contexts/ThemeProvider';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, List, User, Lock, LockOpen, Star, Flag, Heart, CheckCircle, XCircle, Gem } from 'lucide-react-native'; // Thêm Gem
import { LinearGradient } from 'expo-linear-gradient';

// --- IMPORTS ---
import apiClient from '../api/apiClient'; // Import apiClient để gọi API lịch sử
import { Chapter, StoryDetail, storyService, StoryRating } from '../api/storyService';
import { RatingModal } from '../components/ui/RatingModal'; 
import { ReportModal } from '../components/ui/ReportModal';
import { ChapterUnlockModal } from '../components/ui/ChapterUnlockModal';

// --- COMPONENT TOAST THÔNG BÁO ---
const ToastNotification = ({ visible, message, type }: { visible: boolean, message: string, type: 'success' | 'error' }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, friction: 5, useNativeDriver: true })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -100, duration: 200, useNativeDriver: true })
      ]).start();
    }
  }, [visible]);

  if (!visible && (fadeAnim as any)._value === 0) return null; 

  return (
    <Animated.View style={[styles.toastContainer, { opacity: fadeAnim, transform: [{ translateY }] }]}>
       <View style={[styles.toastContent, { backgroundColor: type === 'success' ? '#E8F5E9' : '#FFEBEE', borderColor: type === 'success' ? '#4CAF50' : '#F44336' }]}>
          {type === 'success' ? <CheckCircle size={20} color="#4CAF50" /> : <XCircle size={20} color="#F44336" />}
          <Text style={[styles.toastText, { color: type === 'success' ? '#2E7D32' : '#C62828' }]}>{message}</Text>
       </View>
    </Animated.View>
  );
};

export function StoryDetailScreen() {
  const { colors, typography } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { storyId } = route.params;

  // --- STATE ---
  const [story, setStory] = useState<StoryDetail | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🔥 STATE QUAN TRỌNG: Lưu danh sách ID các chương đã mua
  const [purchasedChapterIds, setPurchasedChapterIds] = useState<Set<string>>(new Set());

  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavLoading, setIsFavLoading] = useState(false);

  // State Modals
  const [ratingData, setRatingData] = useState<StoryRating | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2500);
  };

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      // Gọi song song các API cần thiết
      const [storyRes, chapterRes, ratingRes, favRes, historyRes] = await Promise.allSettled([
        storyService.getStoryDetail(storyId),
        storyService.getChapters(storyId),
        storyService.getStoryRating(storyId),
        storyService.getFavoriteStories(1, 100),
        // 🔥 GỌI API LỊCH SỬ MUA (Giống file TransactionHistoryScreen của bạn)
        apiClient.get('/api/ChapterPurchase/chapter-history') 
      ]);

      if (storyRes.status === 'fulfilled') {
        setStory(storyRes.value.data);
      }
      
      if (chapterRes.status === 'fulfilled') {
        const responseData = chapterRes.value.data;
        if (responseData && Array.isArray(responseData.items)) {
          const sortedChapters = responseData.items.sort((a: any, b: any) => a.chapterNo - b.chapterNo);
          setChapters(sortedChapters);
        }
      }

      // 🔥 XỬ LÝ DỮ LIỆU ĐÃ MUA
      if (historyRes.status === 'fulfilled') {
        const data = historyRes.value.data; // Dữ liệu trả về từ API
        if (Array.isArray(data)) {
            // Lấy ra danh sách chapterId từ lịch sử
            const boughtIds = new Set(data.map((item: any) => item.chapterId));
            setPurchasedChapterIds(boughtIds);
            // console.log("Các chương user đã mua:", boughtIds);
        }
      }

      if (ratingRes.status === 'fulfilled') {
        setRatingData(ratingRes.value.data);
      }

      if (favRes.status === 'fulfilled') {
        const myFavs = favRes.value.data.items || [];
        const found = myFavs.some((item: any) => item.storyId === storyId);
        setIsFavorite(found);
      }

    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => { fetchData(); }, [storyId])
  );

  const handleToggleFavorite = async () => {
    if (isFavLoading) return;
    setIsFavLoading(true);
    try {
      if (isFavorite) {
        await storyService.removeFavorite(storyId);
        setIsFavorite(false);
        showToast('Đã xóa khỏi Thư viện', 'success');
      } else {
        await storyService.addFavorite(storyId);
        setIsFavorite(true);
        showToast('Đã thêm vào Thư viện thành công!', 'success');
      }
    } catch (error) {
      console.error("Lỗi favorite:", error);
      showToast('Có lỗi xảy ra, vui lòng thử lại', 'error');
    } finally {
      setIsFavLoading(false);
    }
  };

  // --- LOGIC CHECK KHÓA ---
  const checkIsLocked = (chapter: Chapter) => {
    // 1. Nếu ID chương này nằm trong danh sách đã mua -> MỞ NGAY
    if (purchasedChapterIds.has(chapter.chapterId)) {
        return false; 
    }

    // 2. Nếu chương miễn phí (isLocked = false) -> MỞ
    // Ép kiểu any phòng trường hợp server trả về khác model
    const ch = chapter as any;
    if (!ch.isLocked) return false;

    // 3. Còn lại -> KHÓA
    return true;
  };

  const handlePressChapter = (chapter: Chapter) => {
    if (checkIsLocked(chapter)) {
      setSelectedChapter(chapter);
      setShowUnlockModal(true);
    } else {
      navigation.navigate('Reader', { storyId: storyId, chapterId: chapter.chapterId });
    }
  };

  const handleUnlockSuccess = () => {
    setShowUnlockModal(false);

    // Cập nhật client-side ngay lập tức để icon biến thành mở khóa
    if (selectedChapter) {
        setPurchasedChapterIds(prev => new Set(prev).add(selectedChapter.chapterId));
        
        showToast('Mở khóa thành công!', 'success');
        
        setTimeout(() => {
             navigation.navigate('Reader', { storyId: storyId, chapterId: selectedChapter.chapterId });
        }, 300);
    }
    
    // Gọi lại API sync dữ liệu nền
    fetchData(); 
  };

  const renderChapterItem = (chapter: Chapter) => {
    const isLocked = checkIsLocked(chapter); // Sử dụng hàm check mới

    return (
      <TouchableOpacity 
        key={chapter.chapterId}
        style={[styles.chapterItem, { borderBottomColor: colors.border }]}
        onPress={() => handlePressChapter(chapter)} 
      >
        <View style={{ flex: 1 }}>
          <Text style={[typography.p, { color: colors.foreground, fontWeight: '500' }]}>
            {chapter.title || `Chương ${chapter.chapterNo}`}
          </Text>
          <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 2 }}>
            {new Date(chapter.publishedAt).toLocaleDateString('vi-VN')} • {chapter.wordCount} chữ
          </Text>
        </View>
        <View style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {isLocked ? (
             <>
               {/* SỬA: Thay emoji 💎 bằng icon Gem */}
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                   <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: '600' }}>
                     {chapter.priceDias ?? 0}
                   </Text>
                   <Gem size={10} color="#4b98ff" fill="#4b98ff" />
               </View>
               <Lock size={16} color="#DC3545" />
             </>
          ) : (
             <LockOpen size={16} color={colors.primary} /> 
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading || !story) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={['top']}>
      <ToastNotification visible={toast.visible} message={toast.message} type={toast.type} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.headerContainer}>
          <Image source={{ uri: story.coverUrl }} style={styles.backgroundImage} blurRadius={15} />
          <LinearGradient colors={['transparent', colors.background]} style={styles.gradientOverlay} />
          
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.topRightButtons}>
             <TouchableOpacity 
                style={styles.iconButton} 
                onPress={handleToggleFavorite}
                activeOpacity={0.7}
             >
                <Heart 
                  size={24} 
                  color={isFavorite ? "#FF4B4B" : "#FFF"} 
                  fill={isFavorite ? "#FF4B4B" : "transparent"} 
                />
             </TouchableOpacity>

             <TouchableOpacity style={styles.iconButton} onPress={() => setShowReportModal(true)}>
                <Flag size={24} color="#FFF" />
             </TouchableOpacity>
          </View>

          <View style={styles.coverWrapper}>
            <Image source={{ uri: story.coverUrl }} style={styles.mainCover} contentFit="cover" />
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={[typography.h2, styles.title, { color: colors.foreground }]}>{story.title}</Text>
          
           <View style={styles.metaRow}>
            <User size={16} color={colors.mutedForeground} />
            <TouchableOpacity onPress={() => navigation.navigate('AuthorProfile', { authorId: story.authorId })}>
              <Text style={[typography.p, { color: colors.accent, marginLeft: 6, fontWeight: '600', textDecorationLine: 'underline' }]}>
                {story.authorUsername}
              </Text>
            </TouchableOpacity>
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
            
            <TouchableOpacity style={styles.statItem} onPress={() => setShowRatingModal(true)}>
              <Star size={20} color="#FFD700" fill="#FFD700" />
              <Text style={[typography.h4, { color: colors.foreground }]}>
                {ratingData?.averageScore ? ratingData.averageScore.toFixed(1) : "0.0"}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                  Đánh giá ({ratingData?.totalRatings || 0})
              </Text>
            </TouchableOpacity>
          </View>

           <Text style={[typography.h4, { color: colors.foreground, marginTop: 24, marginBottom: 8 }]}>
            Giới thiệu
          </Text>
          <Text style={[typography.p, { color: colors.mutedForeground, lineHeight: 22 }]}>
            {story.description}
          </Text>

          <View style={styles.chapterHeaderRow}>
             <Text style={[typography.h4, { color: colors.foreground }]}>Danh sách chương</Text>
             <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>{chapters.length} chương</Text>
          </View>
          
          {chapters.length > 0 ? (
            <View style={[styles.chapterList, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {chapters.map(renderChapterItem)}
            </View>
          ) : (
            <Text style={{ color: colors.mutedForeground, fontStyle: 'italic', marginTop: 8 }}>Chưa có chương nào.</Text>
          )}
        </View>
      </ScrollView>

      <RatingModal visible={showRatingModal} onClose={() => setShowRatingModal(false)} storyId={storyId} currentRating={ratingData?.viewerRating} onSuccess={fetchData} />
      <ReportModal visible={showReportModal} onClose={() => setShowReportModal(false)} targetId={storyId} targetType="Story" />
      <ChapterUnlockModal visible={showUnlockModal} chapter={selectedChapter} onClose={() => setShowUnlockModal(false)} onSuccess={handleUnlockSuccess} />

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
  topRightButtons: { position: 'absolute', top: 16, right: 16, zIndex: 10, flexDirection: 'row', gap: 12 },
  iconButton: { padding: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },
  coverWrapper: { width: 130, height: 190, borderRadius: 8, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, elevation: 8, marginBottom: -20, zIndex: 5 },
  mainCover: { width: '100%', height: '100%' },
  infoContainer: { padding: 20, paddingTop: 30 },
  title: { textAlign: 'center', fontWeight: '700', marginBottom: 8, fontSize: 22 },
  toastContainer: { position: 'absolute', top: 60, left: 20, right: 20, zIndex: 999, alignItems: 'center' },
  toastContent: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 25, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 4, gap: 8 },
  toastText: { fontWeight: '600', fontSize: 14 },
  metaRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 20 },
  tagBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statsBox: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, padding: 16, justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 4 },
  chapterHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, marginBottom: 12 },
  chapterList: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  chapterItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
});