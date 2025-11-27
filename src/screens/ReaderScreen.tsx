import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, Alert, StatusBar, Dimensions, TouchableWithoutFeedback 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageSquare, Settings, ChevronLeft, ChevronRight, Flag } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';

import { chapterService, ChapterVoiceStatus, storyService } from '../api/storyService';

import { useTheme } from '../contexts/ThemeProvider';

import { CommentModal } from '../components/ui/CommentModal';
import { ReportModal } from '../components/ui/ReportModal';
import { ReaderSettingsModal, READER_THEMES, READER_FONTS } from '../components/ui/ReaderSettingsModal';
import { MiniPlayer } from '../components/ui/MiniPlayer';

const R2_BASE_URL = "https://pub-15618311c0ec468282718f80c66bcc13.r2.dev";

export function ReaderScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { storyId, chapterId } = route.params as { storyId: string, chapterId: string };

  // UI & DATA STATE
  const [controlsVisible, setControlsVisible] = useState(true);
  
  const [fontSize, setFontSize] = useState(18);
  const [themeId, setThemeId] = useState('sepia');
  const [fontId, setFontId] = useState('serif');
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  const currentTheme = READER_THEMES[themeId as keyof typeof READER_THEMES];
  const currentFont = READER_FONTS[fontId as keyof typeof READER_FONTS];

  const [isLoading, setIsLoading] = useState(true);
  const [chapterContent, setChapterContent] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [chaptersList, setChaptersList] = useState<any[]>([]);
  
  // AUDIO STATE
  const [voicesList, setVoicesList] = useState<ChapterVoiceStatus[]>([]);
  const [currentVoice, setCurrentVoice] = useState<ChapterVoiceStatus | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  // MODALS
  const [isCommentVisible, setIsCommentVisible] = useState(false);
  const [isReportVisible, setIsReportVisible] = useState(false);

  // Load List Chapter
  useEffect(() => {
    storyService.getChapters(storyId).then(res => {
      if (res.data.items) setChaptersList(res.data.items.sort((a, b) => a.chapterNo - b.chapterNo));
    });
  }, [storyId]);

  // Load Chapter Detail
  const loadChapter = async (targetId: string) => {
    setIsLoading(true);
    try {
      if (sound) { await sound.unloadAsync(); setSound(null); setIsPlayingVoice(false); setIsPlayerVisible(false); }

      const res = await chapterService.getChapterDetail(targetId);
      const data = res.data;
      setChapterTitle(data.title);

      const voiceRes = await chapterService.getChapterVoicesStatus(targetId);
      setVoicesList(voiceRes.data);

      let rawPath = data.contentUrl || (data as any).contentPath;
      if (rawPath) {
        let fullUrl = rawPath.startsWith('http') ? rawPath : `${R2_BASE_URL}/${rawPath}`;
        const textRes = await fetch(fullUrl);
        setChapterContent(await textRes.text());
      } else {
        setChapterContent("Nội dung đang cập nhật...");
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        Alert.alert("Chương VIP", "Vui lòng mở khóa để đọc.");
      } else {
        Alert.alert("Lỗi", "Không tải được chương.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (chapterId) loadChapter(chapterId); }, [chapterId]);

  // Audio Handlers
  const handleSelectVoice = async (voice: ChapterVoiceStatus) => {
    if (voice.owned) {
      setCurrentVoice(voice);
      setIsPlayerVisible(true); // Hiện player
      playAudio(voice.audioUrl!);
    } else {
      Alert.alert("Mua giọng đọc", `Mua giọng ${voice.voiceName}?`, [
        { text: "Hủy", style: "cancel" },
        { text: "Mua", onPress: async () => {
            try {
              await chapterService.buyVoiceForChapter(chapterId, [voice.voiceId]);
              Alert.alert("Thành công", "Đã mua giọng đọc.");
              loadChapter(chapterId);
            } catch (err) { Alert.alert("Thất bại", "Lỗi mua voice."); }
        }}
      ]);
    }
  };

  const playAudio = async (url: string) => {
    try {
      const fullUrl = url.startsWith('http') ? url : `${R2_BASE_URL}/${url}`;
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: fullUrl }, { shouldPlay: true });
      setSound(newSound);
      setIsPlayingVoice(true);
      newSound.setOnPlaybackStatusUpdate(s => { if (s.isLoaded && s.didJustFinish) setIsPlayingVoice(false); });
    } catch (err) { console.error(err); }
  };

  const togglePlayPause = async () => {
    if (!sound) return;
    if (isPlayingVoice) await sound.pauseAsync();
    else await sound.playAsync();
    setIsPlayingVoice(!isPlayingVoice);
  };

  // Navigation Handler
  const handleNavigate = (direction: 'prev' | 'next') => {
    const idx = chaptersList.findIndex(c => c.chapterId === chapterId);
    if (idx === -1) return;
    const target = direction === 'next' ? chaptersList[idx + 1] : chaptersList[idx - 1];
    if (target) {
      navigation.setParams({ chapterId: target.chapterId } as any);
      loadChapter(target.chapterId);
    } else {
      Alert.alert("Thông báo", direction === 'next' ? "Đã là chương cuối." : "Đã là chương đầu.");
    }
  };

  // --- RENDER ---
  // Dùng SafeAreaView để tự động tránh tai thỏ
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.bg }]} edges={['top', 'left', 'right']}>
      <StatusBar hidden={!controlsVisible} barStyle={themeId === 'dark' ? 'light-content' : 'dark-content'} />

      {/* 1. HEADER (Nằm trong SafeAreaView nên sẽ không bị đè) */}
      <View style={[styles.header, { opacity: controlsVisible ? 1 : 0, height: controlsVisible ? 'auto' : 0 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ArrowLeft size={24} color={currentTheme.text} />
        </TouchableOpacity>
        
        {/* Nút Report nằm bên phải Header */}
        <TouchableOpacity onPress={() => setIsReportVisible(true)} style={styles.iconBtn}>
          <Flag size={20} color={currentTheme.text} />
        </TouchableOpacity>
      </View>

      {/* 2. CONTENT (Có thể cuộn thoải mái) */}
      <View style={{ flex: 1 }}>
        {isLoading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
        ) : (
          <TouchableWithoutFeedback onPress={() => setControlsVisible(!controlsVisible)}>
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Title Chương */}
              <Text style={[styles.chapterTitle, { color: currentTheme.text, fontFamily: currentFont.family }]}>
                {chapterTitle}
              </Text>

              {/* --- MINI PLAYER (Nằm dưới Title) --- */}
              {isPlayerVisible && (
                <View style={{ marginBottom: 20 }}>
                  <MiniPlayer 
                    visible={true} 
                    isPlaying={isPlayingVoice} 
                    voiceName={currentVoice?.voiceName || 'Voice'}
                    onPlayPause={togglePlayPause}
                    onClose={() => { if (sound) sound.stopAsync(); setIsPlayerVisible(false); }}
                  />
                </View>
              )}

              {/* Nội dung Text */}
              <Text style={{ 
                color: currentTheme.text, 
                fontSize: fontSize, 
                fontFamily: currentFont.family, 
                lineHeight: fontSize * 1.6,
                textAlign: 'justify'
              }}>
                {chapterContent}
              </Text>

              {/* Khoảng trống cuối để không bị che bởi footer */}
              <View style={{ height: 100 }} />
            </ScrollView>
          </TouchableWithoutFeedback>
        )}
      </View>

      {/* 3. FOOTER (Nổi lên trên content) */}
      {controlsVisible && (
        <View style={[styles.footerAbsolute, { backgroundColor: currentTheme.bg, borderTopColor: colors.border }]}>
          <TouchableOpacity onPress={() => handleNavigate('prev')} style={styles.navBtn}>
            <ChevronLeft size={28} color={currentTheme.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsSettingsVisible(true)} style={styles.centerBtn}>
            <Settings size={24} color={currentTheme.text} />
            <Text style={{ fontSize: 10, color: currentTheme.text, marginTop: 2 }}>Cài đặt</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsCommentVisible(true)} style={styles.centerBtn}>
            <MessageSquare size={24} color={currentTheme.text} />
            <Text style={{ fontSize: 10, color: currentTheme.text, marginTop: 2 }}>Bình luận</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleNavigate('next')} style={styles.navBtn}>
            <ChevronRight size={28} color={currentTheme.text} />
          </TouchableOpacity>
        </View>
      )}

      {/* MODALS */}
      <ReaderSettingsModal
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
        fontSize={fontSize} setFontSize={setFontSize}
        themeId={themeId} setThemeId={setThemeId}
        fontId={fontId} setFontId={setFontId}
        availableVoices={voicesList}
        currentVoiceId={currentVoice?.voiceId || null}
        onSelectVoice={handleSelectVoice}
      />
      <CommentModal visible={isCommentVisible} onClose={() => setIsCommentVisible(false)} chapterId={chapterId} />
      <ReportModal visible={isReportVisible} onClose={() => setIsReportVisible(false)} targetId={chapterId} targetType="chapter" />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Header đơn giản
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8, zIndex: 10
  },
  iconBtn: { padding: 8 },

  // Content scroll
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  chapterTitle: { 
    fontSize: 22, fontWeight: 'bold', textAlign: 'center', 
    marginTop: 10, marginBottom: 20 
  },

  // Footer Nổi dưới đáy
  footerAbsolute: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 30,
    borderTopWidth: 1, elevation: 10, 
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5
  },
  navBtn: { padding: 10 },
  centerBtn: { alignItems: 'center', padding: 8 },
});