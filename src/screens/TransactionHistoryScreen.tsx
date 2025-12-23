import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeProvider';
import apiClient from '../api/apiClient';
import { Volume2, Calendar, BookOpen, LockOpen, Gem } from 'lucide-react-native'; // Thêm Gem

// 1. Interface hiển thị lên UI
interface TransactionItem {
  id: string;              
  type: 'voice' | 'chapter'; 
  storyTitle: string;
  chapterTitle: string;
  itemName: string;        
  priceDias: number;
  purchasedAt: string;
}

export function TransactionHistoryScreen() {
  const { colors, typography } = useTheme();
  const [history, setHistory] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGlobalHistory();
  }, []);

  // --- API 1: Lấy lịch sử mua CHAPTER ---
  const getChapterHistory = async (): Promise<TransactionItem[]> => {
    try {
      const res = await apiClient.get('/api/ChapterPurchase/chapter-history');
      const data = res.data;
      
      if (!Array.isArray(data)) return [];

      return data.map((item: any) => ({
        id: item.purchaseId,
        type: 'chapter',
        storyTitle: item.storyTitle || "Chưa cập nhật tên truyện",
        chapterTitle: item.chapterTitle || `Chương ${item.chapterNo}`, 
        itemName: "Mở khóa nội dung chương",
        priceDias: item.priceDias,
        purchasedAt: item.purchasedAt
      }));
    } catch (error) {
      console.error("Error fetching chapter history:", error);
      return [];
    }
  };

  // --- API 2: Lấy TOÀN BỘ lịch sử mua VOICE ---
  const getAllVoiceHistory = async (): Promise<TransactionItem[]> => {
    try {
      const res = await apiClient.get('/api/ChapterPurchase/voice-history');
      const data = res.data;
      
      if (!Array.isArray(data)) return [];

      const transactions: TransactionItem[] = [];

      data.forEach((story: any) => {
        if (story.chapters) {
          story.chapters.forEach((chapter: any) => {
            if (chapter.voices) {
              chapter.voices.forEach((voice: any) => {
                transactions.push({
                  id: voice.purchaseVoiceId,
                  type: 'voice',
                  storyTitle: story.storyTitle || "Chưa cập nhật",
                  chapterTitle: chapter.chapterTitle || `Chương ${chapter.chapterNo}`,
                  itemName: `Giọng đọc: ${voice.voiceName}`,
                  priceDias: voice.priceDias,
                  purchasedAt: voice.purchasedAt
                });
              });
            }
          });
        }
      });
      return transactions;
    } catch (error) {
      console.error("Error fetching all voice history:", error);
      return [];
    }
  };

  // --- HÀM TỔNG HỢP DỮ LIỆU ---
  const loadGlobalHistory = async () => {
    setLoading(true);
    try {
      const [chapters, voices] = await Promise.all([
        getChapterHistory(),
        getAllVoiceHistory()
      ]);

      const combined = [...chapters, ...voices];
      combined.sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());

      setHistory(combined);
    } catch (error) {
      console.error("Lỗi tải dữ liệu tổng hợp:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: TransactionItem }) => {
    const isVoice = item.type === 'voice';
    const IconComponent = isVoice ? Volume2 : LockOpen;
    const itemColor = isVoice ? colors.primary : '#F39C12'; 

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
           {/* THAY EMOJI BẰNG ICON GEM */}
           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
             <Text style={{ color: colors.primary, fontWeight: 'bold' }}>-{item.priceDias}</Text>
             <Gem size={14} color="#4b98ff" fill="#4b98ff" />
           </View>
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
          <View style={[styles.tag, { backgroundColor: isVoice ? 'rgba(0,0,0,0.05)' : '#FFF8E1' }]}>
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
          keyExtractor={(item, index) => item.id + index}
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