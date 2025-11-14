// src/screens/ReaderScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeProvider';
import { Image } from 'expo-image';
import { Input } from '../components/ui/Input'; // <-- Textarea
import { Button } from '../components/ui/Button';
import { ArrowLeft, Heart, Bookmark, Share2, ChevronLeft, ChevronRight, Moon, Sun, Type, Lock, Coins } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
const storyData = {
  title: 'Ma Vương Phục Sinh',
  author: 'Nguyễn Thanh Tùng',
  genre: 'Huyền Huyễn',
  cover: '...',
};
const comments = [
  { id: 1, user: 'Nguyễn Văn A', avatar: '...', comment: '...', likes: 15 },
];

export function ReaderScreen() {
  const { theme, toggleTheme, colors, typography } = useTheme();
  const [view, setView] = useState<'detail' | 'reading'>('detail');
  const [isFollowing, setIsFollowing] = useState(false);
  const [comment, setComment] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);

  // === VIEW ĐỌC TRUYỆN ===
  if (view === 'reading') {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
        {/* Header đọc */}
        <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity onPress={() => setView('detail')} style={styles.headerButton}>
            <ArrowLeft size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[typography.h4, { color: colors.foreground }]} numberOfLines={1}>
            Chương 1: Khởi đầu
          </Text>
          <View style={styles.fontControls}>
            <TouchableOpacity style={[styles.fontButton, { backgroundColor: colors.muted }]} onPress={() => setFontSize(Math.max(12, fontSize - 2))}>
              <Type size={16} color={colors.foreground} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.fontButton, { backgroundColor: colors.muted }]} onPress={() => setFontSize(Math.min(24, fontSize + 2))}>
              <Type size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Nội dung đọc */}
        <ScrollView contentContainerStyle={styles.readingContent}>
          <Text style={{ fontSize: fontSize, lineHeight: fontSize * 1.8, color: colors.foreground, ...typography.p }}>
            Trong một thế giới mà ma pháp và kiếm thuật thống trị...
            {/* (Thêm nội dung truyện ở đây) */}
          </Text>
          <View style={styles.chapterNav}>
            <Button title="Chương trước" variant="outline" style={styles.flex} />
            <Button title="Chương sau" variant="primary" style={styles.flex} />
          </View>
        </ScrollView>

        {/* Nút đổi Theme */}
        <TouchableOpacity style={[styles.themeToggle, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={toggleTheme}>
          {theme === 'light' ? (
            <Moon size={20} color={colors.foreground} />
          ) : (
            <Sun size={20} color={colors.foreground} />
          )}
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // === VIEW CHI TIẾT TRUYỆN ===
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header chi tiết */}
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity /* onPress={() => navigation.goBack()} */ style={styles.headerButton}>
          <ArrowLeft size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[typography.h4, { color: colors.foreground }]}>Chi tiết truyện</Text>
        <View style={styles.headerButton} />{/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* ... (Các phần Chi tiết, Giới thiệu, Danh sách chương, Bình luận) ... */}
        {/* Tôi sẽ rút gọn phần này cho ngắn, bạn có thể tự "dịch" các View/Text */}
        
        {/* Ví dụ: Danh sách chương */}
        <View style={[styles.card, { backgroundColor: colors.card, padding: 16 }]}>
          <Text style={[typography.h4, { color: colors.foreground, marginBottom: 12 }]}>Danh sách chương</Text>
          <TouchableOpacity 
            style={[styles.chapterItem, { backgroundColor: colors.muted }]}
            onPress={() => setView('reading')}
          >
            <Text style={[typography.p, { color: colors.foreground, fontWeight: '500' }]}>
              Chương 1: Khởi đầu
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.chapterItem, { backgroundColor: colors.background, borderColor: colors.border, borderStyle: 'dashed', borderWidth: 2 }]}
            onPress={() => setShowUnlockDialog(true)}
          >
            <Text style={[typography.p, { color: colors.foreground, fontWeight: '500' }]}>
              Chương 4: Bí mật được hé lộ
            </Text>
            <View style={styles.lockedChapter}>
              <Lock size={14} color={colors.mutedForeground} />
              <Coins size={12} color={colors.mutedForeground} />
              <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>5</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ... (Các phần Bình luận) ... */}

      </ScrollView>

      {/* Modal Mở khóa */}
      <Modal
        transparent
        visible={showUnlockDialog}
        animationType="fade"
        onRequestClose={() => setShowUnlockDialog(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Lock size={20} color={colors.primary} />
            <Text style={[typography.h3, { color: colors.foreground, marginTop: 12 }]}>Chương bị khóa</Text>
            <Text style={[typography.p, { color: colors.mutedForeground, textAlign: 'center', marginVertical: 16 }]}>
              Bạn cần <Text style={{ fontWeight: '600', color: colors.foreground }}>5 xu</Text> để mở khóa chương này.
            </Text>
            <View style={styles.modalFooter}>
              <Button title="Hủy" variant="outline" style={styles.flex} onPress={() => setShowUnlockDialog(false)} />
              <Button title="Nạp xu" variant="primary" style={styles.flex} /* onPress={() => ...} */ />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16, gap: 16 },
  header: { borderBottomWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, elevation: 2 },
  headerButton: { padding: 4, width: 40 },
  fontControls: { flexDirection: 'row', gap: 8 },
  fontButton: { padding: 6, borderRadius: 8 },
  readingContent: { padding: 24 },
  chapterNav: { flexDirection: 'row', gap: 16, marginTop: 32 },
  themeToggle: { position: 'absolute', bottom: 24, right: 24, width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 3 },
  card: { borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, elevation: 2 },
  chapterItem: { padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  lockedChapter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { borderRadius: 16, padding: 24, alignItems: 'center', width: '100%', borderWidth: 1 },
  modalFooter: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 16 },
});