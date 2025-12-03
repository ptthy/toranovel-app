import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeProvider';
import apiClient from '../api/apiClient';
import { Volume2, Calendar, BookOpen, LockOpen } from 'lucide-react-native';

// 1. Tạo Interface chung cho cả 2 loại giao dịch
interface TransactionItem {
  id: string;              // purchaseId hoặc purchaseVoiceId
  type: 'voice' | 'chapter'; // Phân loại để render icon
  storyTitle: string;
  chapterTitle: string;
  itemName: string;        // Tên giọng đọc hoặc "Mở khóa chương"
  priceDias: number;
  purchasedAt: string;
}

export function TransactionHistoryScreen() {
  const { colors, typography } = useTheme();
  const [history, setHistory] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllHistory();
  }, []);

  const fetchAllHistory = async () => {
    try {
      setLoading(true);
      
      // 2. Gọi song song cả 2 API
      const [voiceRes, chapterRes] = await Promise.all([
        apiClient.get('/api/ChapterPurchase/voice-history'),
        apiClient.get('/api/ChapterPurchase/chapter-history')
      ]);

      const voiceData = voiceRes.data;
      const chapterData = chapterRes.data;

      let combinedList: TransactionItem[] = [];

      // --- XỬ LÝ 1: VOICE HISTORY (Cần flatten như cũ) ---
      if (Array.isArray(voiceData)) {
        voiceData.forEach((story: any) => {
          if (story.chapters) {
            story.chapters.forEach((chapter: any) => {
              if (chapter.voices) {
                chapter.voices.forEach((voice: any) => {
                  combinedList.push({
                    id: voice.purchaseVoiceId,
                    type: 'voice',
                    storyTitle: story.storyTitle,
                    chapterTitle: chapter.chapterTitle,
                    itemName: `Voice: ${voice.voiceName}`,
                    priceDias: voice.priceDias,
                    purchasedAt: voice.purchasedAt
                  });
                });
              }
            });
          }
        });
      }

      // --- XỬ LÝ 2: CHAPTER HISTORY (Map trực tiếp) ---
      // API trả về mảng phẳng các purchaseId
      if (Array.isArray(chapterData)) {
        chapterData.forEach((item: any) => {
          combinedList.push({
            id: item.purchaseId,
            type: 'chapter',
            storyTitle: item.storyTitle || "Truyện chưa cập nhật tên",
            chapterTitle: item.chapterTitle || `Chương ${item.chapterNo}`,
            itemName: "Mở khóa nội dung chương",
            priceDias: item.priceDias,
            purchasedAt: item.purchasedAt
          });
        });
      }

      // 3. Sắp xếp tất cả theo thời gian giảm dần (Mới nhất lên đầu)
      combinedList.sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());

      setHistory(combinedList);

    } catch (error) {
      console.error("Lỗi tải lịch sử giao dịch:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: TransactionItem }) => {
    // Tùy chỉnh Icon và Màu sắc dựa trên loại giao dịch
    const isVoice = item.type === 'voice';
    const IconComponent = isVoice ? Volume2 : LockOpen;
    const itemColor = isVoice ? colors.primary : '#E67E22'; // Voice màu chính, Chapter màu cam (ví dụ)

    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Dòng 1: Tên truyện & Giá tiền */}
        <View style={styles.rowBetween}>
           <Text 
             style={[typography.p, { color: colors.foreground, flex: 1, fontWeight: 'bold', fontSize: 15 }]} 
             numberOfLines={1}
           >
             {item.storyTitle}
           </Text>
           <Text style={{ color: colors.primary, fontWeight: 'bold' }}>-{item.priceDias} 💎</Text>
        </View>
        
        {/* Dòng 2: Tên chương */}
        <View style={styles.infoRow}>
          <BookOpen size={14} color={colors.mutedForeground} />
          <Text style={{ color: colors.mutedForeground, fontSize: 12, marginLeft: 4 }}>
            {item.chapterTitle}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Dòng 3: Loại giao dịch & Ngày tháng */}
        <View style={styles.rowBetween}>
          <View style={[styles.tag, { backgroundColor: isVoice ? 'rgba(0,0,0,0.05)' : '#FFF3E0' }]}>
            <IconComponent size={14} color={itemColor} />
            <Text style={{ color: colors.foreground, fontSize: 12, marginLeft: 4, fontWeight: '500' }}>
              {item.itemName}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Calendar size={14} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, fontSize: 10, marginLeft: 4 }}>
              {new Date(item.purchasedAt).toLocaleDateString('vi-VN')} {new Date(item.purchasedAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={[typography.h3, { color: colors.foreground }]}>Lịch sử giao dịch</Text>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 40, color: colors.mutedForeground }}>
              Bạn chưa có giao dịch nào.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, elevation: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  divider: { height: 1, marginVertical: 12 },
  tag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
});