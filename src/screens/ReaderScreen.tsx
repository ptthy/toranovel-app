import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, Alert, StatusBar, TouchableWithoutFeedback,
  useWindowDimensions, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageSquare, Settings, ChevronLeft, ChevronRight, Flag, Languages, X, Music, Menu, Pause, Play } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import RenderHtml, { defaultSystemFonts } from 'react-native-render-html';

import { useTheme } from '../contexts/ThemeProvider';
import { CommentModal } from '../components/ui/CommentModal';
import { ReportModal } from '../components/ui/ReportModal';
import { ReaderSettingsModal, READER_THEMES, READER_FONTS } from '../components/ui/ReaderSettingsModal';
import { MiniPlayer } from '../components/ui/MiniPlayer';
import { chapterService, ChapterVoiceStatus, storyService } from '../api/storyService';

const R2_BASE_URL = "https://pub-15618311c0ec468282718f80c66bcc13.r2.dev";

// Thêm các font tùy chỉnh
const systemFonts = [...defaultSystemFonts, 'Poppins', 'Times New Roman', 'serif', 'sans-serif', 'monospace'];

const SUPPORTED_LANGUAGES = [
  { code: 'vi-VN', name: 'Tiếng Việt' },
  { code: 'en-US', name: 'English' },
  { code: 'zh-CN', name: 'Tiếng Trung' },
  { code: 'ja-JP', name: 'Tiếng Nhật' },
  { code: 'ko-KR', name: 'Tiếng Hàn' },
];

export function ReaderScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  
  const { storyId, chapterId } = route.params as { storyId: string, chapterId: string };

  // --- UI STATE ---
  const [controlsVisible, setControlsVisible] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [themeId, setThemeId] = useState('sepia');
  const [fontId, setFontId] = useState('times');
  const [isLoading, setIsLoading] = useState(true);
  
  // --- DATA ---
  const [chapterContent, setChapterContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [chaptersList, setChaptersList] = useState<any[]>([]);

  // --- TRANSLATION ---
  const [isTranslateVisible, setIsTranslateVisible] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentLang, setCurrentLang] = useState('original');

  // --- MOOD MUSIC ---
  const [bgMusicSound, setBgMusicSound] = useState<Audio.Sound | null>(null);
  const [currentMusicIndex, setCurrentMusicIndex] = useState<number | null>(null); 
  const [musicPaths, setMusicPaths] = useState<string[]>([]); 
  const [currentMoodName, setCurrentMoodName] = useState("");

  // --- VOICE (Audio) ---
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [voicesList, setVoicesList] = useState<ChapterVoiceStatus[]>([]);
  const [currentVoice, setCurrentVoice] = useState<ChapterVoiceStatus | null>(null);

  // --- MODALS ---
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isCommentVisible, setIsCommentVisible] = useState(false);
  const [isReportVisible, setIsReportVisible] = useState(false);

  const currentTheme = READER_THEMES[themeId as keyof typeof READER_THEMES];
  const currentFont = READER_FONTS[fontId as keyof typeof READER_FONTS];

  // Base style cho RenderHTML
  const baseStyle = useMemo(() => ({
    fontFamily: currentFont.family,
    fontSize: fontSize,
    color: currentTheme.text,
    lineHeight: fontSize * 1.5,
    textAlign: 'justify' as const,
  }), [currentFont, fontSize, currentTheme]);

  const tagsStyles = useMemo(() => ({
    p: { marginBottom: 10 },
    h1: { fontSize: fontSize * 1.5, fontWeight: 'bold' as const, marginBottom: 16, fontFamily: currentFont.family },
    h2: { fontSize: fontSize * 1.3, fontWeight: 'bold' as const, marginBottom: 12, fontFamily: currentFont.family },
  }), [fontSize, currentFont]);

  // Cleanup khi thoát màn hình
  useEffect(() => {
    return () => {
      if (bgMusicSound) bgMusicSound.unloadAsync();
      if (sound) sound.unloadAsync();
    };
  }, [bgMusicSound, sound]);

  // Load danh sách chương
  useEffect(() => {
    storyService.getChapters(storyId).then(res => {
      if (res.data.items) setChaptersList(res.data.items.sort((a: any, b: any) => a.chapterNo - b.chapterNo));
    });
  }, [storyId]);

  // --- LOAD NỘI DUNG CHƯƠNG ---
  const loadChapter = async (targetId: string) => {
    setIsLoading(true);
    setCurrentLang('original');
    
    // Dừng nhạc nền & giọng đọc cũ
    if (bgMusicSound) { 
        try { await bgMusicSound.unloadAsync(); } catch(e){} 
        setBgMusicSound(null); setCurrentMusicIndex(null); 
    }
    if (sound) { 
        try { await sound.unloadAsync(); } catch(e){} 
        setSound(null); setIsPlayingVoice(false); setIsPlayerVisible(false); 
    }

    try {
      const res = await chapterService.getChapterDetail(targetId);
      const data = res.data; 
      if(!data) throw new Error("No Data");

      setChapterTitle(data.title || "Chương mới");

      // Nhạc nền
      if (data.moodMusicPaths && Array.isArray(data.moodMusicPaths)) {
        setMusicPaths(data.moodMusicPaths);
        setCurrentMoodName(data.mood?.name || "");
      } else {
        setMusicPaths([]);
        setCurrentMoodName("");
      }

      // Nội dung Text
      let rawPath = data.contentUrl || (data as any).contentPath;
      let content = "<p>Nội dung đang được cập nhật...</p>";
      
      if (rawPath) {
        let fullUrl = rawPath.startsWith('http') ? rawPath : `${R2_BASE_URL}/${rawPath}`;
        try {
            const textRes = await fetch(fullUrl);
            if(textRes.ok) {
                content = await textRes.text();
            }
        } catch(err) {
            console.error(err);
        }
      }
      setChapterContent(content);
      setOriginalContent(content);

      // Lấy danh sách giọng đọc
      chapterService.getChapterVoicesStatus(targetId)
        .then(res => setVoicesList(res.data))
        .catch(e => console.log("Voice fetch error:", e));

    } catch (error: any) {
      if (error.response?.status === 403) {
          Alert.alert("Chương VIP", "Vui lòng mở khóa để đọc.");
      } else {
          Alert.alert("Lỗi", "Không tải được thông tin chương.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (chapterId) loadChapter(chapterId); }, [chapterId]);

  // --- DỊCH THUẬT ---
  const handleTranslate = async (targetLang: string) => {
    setIsTranslateVisible(false);
    if (targetLang === 'original') {
      setChapterContent(originalContent);
      setCurrentLang('original');
      return;
    }

    const isPremium = await storyService.checkPremiumStatus();
    if (!isPremium) {
      Alert.alert("Premium", "Nâng cấp gói thành viên để sử dụng tính năng Dịch.");
      return;
    }

    setIsTranslating(true);
    try {
      const statusRes = await storyService.getTranslationStatus(chapterId);
      const locales = statusRes.data.locales || [];
      const langStatus = locales.find((l: any) => l.languageCode === targetLang);

      if (!langStatus || !langStatus.hasTranslation) {
         try {
           await storyService.triggerTranslate(chapterId, targetLang);
         } catch (triggerError) {}
      }

      const contentRes = await storyService.getTranslatedContent(chapterId, targetLang);
      
      if (contentRes.data && contentRes.data.content) {
        setChapterContent(contentRes.data.content);
        setCurrentLang(targetLang);
      } else if (contentRes.data && contentRes.data.contentUrl) {
         let fullUrl = contentRes.data.contentUrl.startsWith('http') ? contentRes.data.contentUrl : `${R2_BASE_URL}/${contentRes.data.contentUrl}`;
         const textRes = await fetch(fullUrl);
         setChapterContent(await textRes.text());
         setCurrentLang(targetLang);
      } else {
         Alert.alert("Thông báo", "Hệ thống đang dịch, vui lòng thử lại sau vài giây.");
      }
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể dịch chương này.");
    } finally {
      setIsTranslating(false);
    }
  };

  // --- NHẠC NỀN ---
  const playTrack = async (index: number) => {
    const isPremium = await storyService.checkPremiumStatus();
    if (!isPremium) {
      Alert.alert("Premium", "Nâng cấp gói thành viên để nghe nhạc nền.");
      return;
    }

    try {
      if (currentMusicIndex === index && bgMusicSound) {
        await bgMusicSound.stopAsync();
        await bgMusicSound.unloadAsync();
        setBgMusicSound(null);
        setCurrentMusicIndex(null);
        return;
      }
      if (bgMusicSound) {
        await bgMusicSound.unloadAsync();
      }
      const rawPath = musicPaths[index];
      const fullUrl = rawPath.startsWith('http') ? rawPath : `${R2_BASE_URL}/${rawPath}`;
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fullUrl },
        { shouldPlay: true, isLooping: true, volume: 0.5 }
      );
      setBgMusicSound(newSound);
      setCurrentMusicIndex(index);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể phát nhạc nền.");
    }
  };

  // --- VOICE LOGIC (ĐÃ FIX LỖI ĐÈ ÂM THANH) ---
  const playVoice = async (url: string) => {
    try {
      // 1. Nếu đang có sound, dừng và hủy nó trước
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlayingVoice(false);
      }

      const fullUrl = url.startsWith('http') ? url : `${R2_BASE_URL}/${url}`;
      
      // 2. Tạo sound mới
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fullUrl },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setIsPlayingVoice(true);
      
      // 3. Tự động tắt trạng thái play khi chạy hết bài
      newSound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlayingVoice(false);
          await newSound.setPositionAsync(0); // Reset về đầu
        }
      });
    } catch (err) {
      console.error("Lỗi phát voice:", err);
      Alert.alert("Lỗi", "Không thể phát giọng đọc này.");
    }
  };

  const toggleVoice = async () => {
     if (!sound) return;
     
     if (isPlayingVoice) {
       await sound.pauseAsync();
       setIsPlayingVoice(false);
     } else {
       await sound.playAsync();
       setIsPlayingVoice(true);
     }
  };

  const handleSelectVoice = async (voice: ChapterVoiceStatus) => {
    // Nếu chọn lại giọng đang phát -> Chỉ Play/Pause
    if (currentVoice?.voiceId === voice.voiceId && sound) {
        toggleVoice();
        // Mở mini player nếu nó đang ẩn
        if (!isPlayerVisible) setIsPlayerVisible(true);
        return;
    }

    if (voice.owned) {
      setCurrentVoice(voice);
      setIsPlayerVisible(true);
      // Gọi hàm play mới
      playVoice(voice.audioUrl!);
    } else {
      Alert.alert(
        "Mua giọng đọc", 
        `Bạn muốn mua giọng đọc "${voice.voiceName}" với giá ${voice.priceDias} dias?`, 
        [
          { text: "Hủy", style: "cancel" },
          { 
            text: "Mua ngay", 
            onPress: async () => { 
               try {
                  await chapterService.buyVoiceForChapter(chapterId, [voice.voiceId]);
                  Alert.alert("Thành công", "Đã mua giọng đọc. Vui lòng chọn lại để nghe.");
                  loadChapter(chapterId);
               } catch (err) {
                  Alert.alert("Thất bại", "Mua giọng đọc thất bại. Vui lòng kiểm tra số dư.");
               }
            }
          }
        ]
      );
    }
  };

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.bg }]} edges={['top', 'left', 'right']}>
      <StatusBar hidden={!controlsVisible} barStyle={themeId === 'dark' ? 'light-content' : 'dark-content'} />

      {/* HEADER */}
      <View style={[styles.header, { opacity: controlsVisible ? 1 : 0, height: controlsVisible ? 'auto' : 0 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ArrowLeft size={24} color={currentTheme.text} />
        </TouchableOpacity>
        {controlsVisible && currentMoodName ? (
           <View style={{backgroundColor: 'rgba(0,0,0,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12}}>
              <Text style={{color: currentTheme.text, fontSize: 12}}>Mood: {currentMoodName}</Text>
           </View>
        ) : null}
        <TouchableOpacity onPress={() => setIsReportVisible(true)} style={styles.iconBtn}>
          <Flag size={20} color={currentTheme.text} />
        </TouchableOpacity>
      </View>

      {/* MINI PLAYER */}
      {isPlayerVisible && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 10, paddingTop: 5, zIndex: 50 }}>
          <MiniPlayer 
            visible={true} isPlaying={isPlayingVoice} 
            voiceName={currentVoice?.voiceName || 'Voice'}
            onPlayPause={toggleVoice}
            onClose={() => { 
                if (sound) {
                    sound.stopAsync();
                    setIsPlayingVoice(false);
                }
                setIsPlayerVisible(false); 
            }}
          />
        </View>
      )}

      {/* CONTENT */}
      <View style={{ flex: 1 }}>
        {isLoading || isTranslating ? (
          <View style={styles.center}>
             <ActivityIndicator size="large" color={colors.primary} />
             {isTranslating && <Text style={{ color: currentTheme.text, marginTop: 10 }}>Đang dịch thuật...</Text>}
          </View>
        ) : (
          <TouchableWithoutFeedback onPress={() => setControlsVisible(!controlsVisible)}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <Text style={[styles.chapterTitle, { color: currentTheme.text, fontFamily: currentFont.family }]}>
                {chapterTitle}
              </Text>
              
              <RenderHtml
                contentWidth={width - 40}
                source={{ html: chapterContent }}
                baseStyle={baseStyle} 
                tagsStyles={tagsStyles}
                systemFonts={systemFonts} 
                enableExperimentalMarginCollapsing={true}
              />
              <View style={{ height: 100 }} />
            </ScrollView>
          </TouchableWithoutFeedback>
        )}
      </View>

      {/* FOOTER */}
      {controlsVisible && (
        <View style={[styles.footerAbsolute, { backgroundColor: currentTheme.bg, borderTopColor: colors.border }]}>
          <TouchableOpacity onPress={() => handleNavigate('prev')} style={styles.navBtn}>
            <ChevronLeft size={28} color={currentTheme.text} />
            <Text style={{fontSize: 10, color: currentTheme.text}}>Trước</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsTranslateVisible(true)} style={styles.centerBtn}>
            <Languages size={24} color={currentTheme.text} />
            <Text style={{ fontSize: 10, color: currentTheme.text, marginTop: 2 }}>
               {currentLang === 'original' ? 'Dịch' : currentLang.split('-')[0]}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsMenuVisible(true)} style={styles.centerBtn}>
            <Menu size={24} color={currentTheme.text} />
            <Text style={{ fontSize: 10, color: currentTheme.text, marginTop: 2 }}>Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleNavigate('next')} style={styles.navBtn}>
             <ChevronRight size={28} color={currentTheme.text} />
             <Text style={{fontSize: 10, color: currentTheme.text}}>Sau</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* --- MENU MODAL --- */}
      <Modal visible={isMenuVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setIsMenuVisible(false)}>
           <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={[styles.menuContent, { backgroundColor: currentTheme.bg }]}>
                    <View style={styles.menuHeader}>
                        <Text style={[styles.menuTitle, {color: currentTheme.text}]}>Menu</Text>
                        <TouchableOpacity onPress={() => setIsMenuVisible(false)}>
                            <X size={24} color={currentTheme.text} />
                        </TouchableOpacity>
                    </View>

                    {/* SECTION: NHẠC NỀN */}
                    <View style={styles.menuSection}>
                        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
                           <Music size={18} color={colors.primary} />
                           <Text style={[styles.sectionTitle, {color: colors.primary, marginLeft: 8}]}>
                              Nhạc nền {currentMoodName ? `(${currentMoodName})` : ''}
                           </Text>
                        </View>
                        
                        {musicPaths.length > 0 ? (
                           <View style={{ marginTop: 4 }}>
                              {musicPaths.map((path, index) => {
                                const isPlayingThis = currentMusicIndex === index;
                                return (
                                  <TouchableOpacity
                                    key={index}
                                    onPress={() => playTrack(index)}
                                    style={{
                                      flexDirection: 'row', alignItems: 'center',
                                      paddingVertical: 10, paddingHorizontal: 12,
                                      borderRadius: 8, marginBottom: 6,
                                      backgroundColor: isPlayingThis ? colors.primary + '15' : 'transparent',
                                      borderWidth: 1,
                                      borderColor: isPlayingThis ? colors.primary : 'rgba(150,150,150,0.2)'
                                    }}
                                  >
                                    {isPlayingThis ? (
                                      <Pause size={18} color={colors.primary} fill={colors.primary} />
                                    ) : (
                                      <Play size={18} color={currentTheme.text} />
                                    )}
                                    <Text style={{ marginLeft: 12, fontSize: 14, color: isPlayingThis ? colors.primary : currentTheme.text, fontWeight: isPlayingThis ? '600' : '400' }}>
                                      Bài {index + 1}
                                    </Text>
                                    {isPlayingThis && (
                                      <View style={{marginLeft: 'auto'}}>
                                         <Text style={{fontSize: 10, color: colors.primary, fontWeight: 'bold'}}>ĐANG PHÁT</Text>
                                      </View>
                                    )}
                                  </TouchableOpacity>
                                );
                              })}
                           </View>
                        ) : (
                           <Text style={{color: colors.mutedForeground, fontSize: 13, fontStyle: 'italic'}}>Không có nhạc cho chương này</Text>
                        )}
                    </View>

                    <View style={styles.divider} />

                    {/* SECTION: ACTIONS */}
                    <TouchableOpacity style={styles.menuItem} onPress={() => { setIsMenuVisible(false); setIsSettingsVisible(true); }}>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                           <Settings size={22} color={currentTheme.text} />
                           <Text style={[styles.menuText, {color: currentTheme.text}]}>Cài đặt giao diện & Giọng đọc</Text>
                        </View>
                    </TouchableOpacity>

                     <TouchableOpacity style={styles.menuItem} onPress={() => { setIsMenuVisible(false); setIsCommentVisible(true); }}>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                           <MessageSquare size={22} color={currentTheme.text} />
                           <Text style={[styles.menuText, {color: currentTheme.text}]}>Bình luận</Text>
                        </View>
                    </TouchableOpacity>

                     <TouchableOpacity style={[styles.menuItem, {borderBottomWidth: 0}]} onPress={() => { setIsMenuVisible(false); setIsReportVisible(true); }}>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                           <Flag size={22} color={colors.accent} />
                           <Text style={[styles.menuText, {color: colors.accent}]}>Báo cáo chương</Text>
                        </View>
                    </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
           </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* --- LANGUAGE MODAL --- */}
      <Modal visible={isTranslateVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
           <View style={[styles.modalContent, { backgroundColor: currentTheme.bg }]}>
              <View style={styles.modalHeader}>
                 <Text style={[styles.modalTitle, { color: currentTheme.text }]}>Chọn ngôn ngữ dịch</Text>
                 <TouchableOpacity onPress={() => setIsTranslateVisible(false)}>
                    <X size={24} color={currentTheme.text} />
                 </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.langItem} onPress={() => handleTranslate('original')}>
                 <Text style={{ color: currentTheme.text, fontWeight: currentLang === 'original' ? 'bold' : 'normal' }}>
                    Mặc định (Ngôn ngữ gốc)
                 </Text>
                 {currentLang === 'original' && <Text style={{color: colors.primary}}>✓</Text>}
              </TouchableOpacity>
              
              {SUPPORTED_LANGUAGES.map(lang => (
                 <TouchableOpacity key={lang.code} style={styles.langItem} onPress={() => handleTranslate(lang.code)}>
                    <Text style={{ color: currentTheme.text, fontWeight: currentLang === lang.code ? 'bold' : 'normal' }}>
                       {lang.name}
                    </Text>
                    {currentLang === lang.code && <Text style={{color: colors.primary}}>✓</Text>}
                 </TouchableOpacity>
              ))}
           </View>
        </View>
      </Modal>

      {/* Existing Modals */}
      <ReaderSettingsModal visible={isSettingsVisible} onClose={() => setIsSettingsVisible(false)} fontSize={fontSize} setFontSize={setFontSize} themeId={themeId} setThemeId={setThemeId} fontId={fontId} setFontId={setFontId} availableVoices={voicesList} currentVoiceId={currentVoice?.voiceId || null} onSelectVoice={handleSelectVoice} />
      <CommentModal visible={isCommentVisible} onClose={() => setIsCommentVisible(false)} chapterId={chapterId} />
      <ReportModal visible={isReportVisible} onClose={() => setIsReportVisible(false)} targetId={chapterId} targetType="chapter" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, zIndex: 10 },
  iconBtn: { padding: 8 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  chapterTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginTop: 10, marginBottom: 20 },
  footerAbsolute: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, borderTopWidth: 1, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  navBtn: { alignItems: 'center', padding: 8 },
  centerBtn: { alignItems: 'center', padding: 8, minWidth: 60 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, minHeight: 300 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  langItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: '#ccc' },
  menuContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  menuTitle: { fontSize: 18, fontWeight: 'bold' },
  menuSection: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 0.5, borderBottomColor: 'rgba(150,150,150,0.2)' },
  menuText: { fontSize: 16, fontWeight: '500' },
  divider: { height: 1, backgroundColor: 'rgba(150,150,150,0.1)', marginVertical: 8 },
});