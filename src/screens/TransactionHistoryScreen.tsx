import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeProvider';
import apiClient from '../api/apiClient';
import { Volume2, Calendar, BookOpen } from 'lucide-react-native';

interface VoiceHistoryItem {
  purchaseVoiceId: string;
  chapterId: string;
  storyTitle: string;
  chapterTitle: string;
  voiceName: string;
  priceDias: number;
  purchasedAt: string;
}

export function TransactionHistoryScreen() {
  const { colors, typography } = useTheme();
  const [history, setHistory] = useState<VoiceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await apiClient.get('/api/ChapterPurchase/voice-history');
      const data = res.data;
      
      // Flatten data: API trả về grouped by story, ta cần trải phẳng ra để list
      let flatList: VoiceHistoryItem[] = [];
      if (Array.isArray(data)) {
        data.forEach((story: any) => {
          if (story.chapters) {
            story.chapters.forEach((chapter: any) => {
              if (chapter.voices) {
                chapter.voices.forEach((voice: any) => {
                  flatList.push({
                    ...voice,
                    storyTitle: story.storyTitle,
                    chapterTitle: chapter.chapterTitle
                  });
                });
              }
            });
          }
        });
      }
      // Sắp xếp mới nhất lên đầu
      flatList.sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());
      setHistory(flatList);
    } catch (error) {
      console.error("Lỗi tải lịch sử:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: VoiceHistoryItem }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.rowBetween}>
       <Text style={[typography.p, { color: colors.foreground, flex: 1, fontWeight: 'bold', fontSize: 15 }]}>
          {item.storyTitle}
        </Text>
        <Text style={{ color: colors.primary, fontWeight: 'bold' }}>-{item.priceDias} 💎</Text>
      </View>
      
      <View style={styles.infoRow}>
        <BookOpen size={14} color={colors.mutedForeground} />
        <Text style={{ color: colors.mutedForeground, fontSize: 12, marginLeft: 4 }}>
          {item.chapterTitle}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.rowBetween}>
        <View style={styles.voiceTag}>
          <Volume2 size={14} color={colors.primary} />
          <Text style={{ color: colors.foreground, fontSize: 12, marginLeft: 4 }}>
            Voice: {item.voiceName}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Calendar size={14} color={colors.mutedForeground} />
          <Text style={{ color: colors.mutedForeground, fontSize: 10, marginLeft: 4 }}>
            {new Date(item.purchasedAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      </View>
    </View>
  );

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
          keyExtractor={item => item.purchaseVoiceId}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 40, color: colors.mutedForeground }}>
              Bạn chưa mua giọng đọc nào.
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
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  divider: { height: 1, marginVertical: 10 },
  voiceTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)', padding: 4, borderRadius: 4 },
});