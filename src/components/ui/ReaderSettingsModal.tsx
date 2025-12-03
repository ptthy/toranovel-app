import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, Type, Palette, Volume2, Check } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeProvider';
import { ChapterVoiceStatus } from '../../api/storyService';

// Định nghĩa lại type cho Theme
export const READER_THEMES = {
  light: { id: 'light', bg: '#FFFFFF', text: '#000000', name: 'Sáng' },
  sepia: { id: 'sepia', bg: '#F4ECD8', text: '#5D4037', name: 'Vàng' },
  dark:  { id: 'dark',  bg: '#121212', text: '#B0B0B0', name: 'Tối' },
  black: { id: 'black', bg: '#000000', text: '#CCCCCC', name: 'Đen' },
};

// Cập nhật Font: Thêm Times New Roman và Poppins
export const READER_FONTS = {
  times:      { id: 'times',      family: 'Times New Roman', name: 'Times New Roman' },
  serif:      { id: 'serif',      family: 'serif', name: 'Serif (Có chân)' },
  sans:       { id: 'sans',       family: 'sans-serif', name: 'Sans (Không chân)' },
  poppins:    { id: 'poppins',    family: 'Poppins', name: 'Poppins' }, 
  monospace:  { id: 'monospace',  family: 'monospace', name: 'Mono' },
};

interface ReaderSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  themeId: string;
  setThemeId: (id: string) => void;
  fontId: string;
  setFontId: (id: string) => void;
  
  // --- THÊM PHẦN VOICE ---
  availableVoices: ChapterVoiceStatus[]; 
  currentVoiceId: string | null;
  onSelectVoice: (voice: ChapterVoiceStatus) => void;
}

export function ReaderSettingsModal({
  visible, onClose,
  fontSize, setFontSize,
  themeId, setThemeId,
  fontId, setFontId,
  availableVoices, currentVoiceId, onSelectVoice
}: ReaderSettingsModalProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.container, { backgroundColor: colors.card }]}>
          
          {/* 1. THANH KÉO TRÊN CÙNG */}
          <View style={styles.dragIndicator} />

          <ScrollView contentContainerStyle={{ padding: 20 }}>
            
            {/* --- PHẦN 1: CỠ CHỮ --- */}
            <View style={styles.section}>
              <View style={styles.headerRow}>
                <Type size={18} color={colors.foreground} />
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Cỡ chữ</Text>
              </View>
              <View style={styles.rowControl}>
                <TouchableOpacity onPress={() => setFontSize(Math.max(12, fontSize - 2))} style={[styles.btnCircle, { borderColor: colors.border }]}>
                  <Text style={{ fontSize: 14, color: colors.foreground }}>A-</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.foreground, width: 40, textAlign: 'center' }}>{fontSize}</Text>
                <TouchableOpacity onPress={() => setFontSize(Math.min(32, fontSize + 2))} style={[styles.btnCircle, { borderColor: colors.border }]}>
                  <Text style={{ fontSize: 20, color: colors.foreground }}>A+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* --- PHẦN 2: MÀU NỀN --- */}
            <View style={styles.section}>
              <View style={styles.headerRow}>
                <Palette size={18} color={colors.foreground} />
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Màu nền</Text>
              </View>
              <View style={styles.themeRow}>
                {Object.values(READER_THEMES).map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.themeOption, 
                      { backgroundColor: t.bg, borderColor: themeId === t.id ? colors.primary : colors.border }
                    ]}
                    onPress={() => setThemeId(t.id)}
                  >
                    {themeId === t.id && <Check size={16} color={t.text} />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* --- PHẦN 3: FONT CHỮ (Đã thêm Times & Poppins) --- */}
            <View style={styles.section}>
              <View style={styles.headerRow}>
                <Type size={18} color={colors.foreground} />
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Phông chữ</Text>
              </View>
              <View style={styles.fontRow}>
                {Object.values(READER_FONTS).map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    style={[
                      styles.fontOption,
                      { 
                        backgroundColor: fontId === f.id ? colors.primary + '20' : 'transparent', 
                        borderColor: fontId === f.id ? colors.primary : colors.border 
                      }
                    ]}
                    onPress={() => setFontId(f.id)}
                  >
                    <Text style={{ fontFamily: f.family, color: colors.foreground, fontSize: 12 }}>{f.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* --- PHẦN 4: GIỌNG ĐỌC AI --- */}
            <View style={styles.section}>
              <View style={styles.headerRow}>
                <Volume2 size={18} color={colors.foreground} />
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Giọng đọc AI</Text>
              </View>
              
              {availableVoices.length === 0 ? (
                <Text style={{ color: colors.mutedForeground, fontStyle: 'italic', marginTop: 8 }}>Chưa có giọng đọc nào.</Text>
              ) : (
                <View style={styles.voiceList}>
                  {availableVoices.map((voice) => {
                    const isSelected = currentVoiceId === voice.voiceId;
                    const isOwned = voice.owned;
                    
                    return (
                      <TouchableOpacity 
                        key={voice.voiceId}
                        style={[
                          styles.voiceItem, 
                          { 
                            borderColor: isSelected ? colors.primary : colors.border,
                            backgroundColor: isSelected ? colors.primary + '10' : 'transparent',
                            opacity: voice.hasAudio ? 1 : 0.5
                          }
                        ]}
                        disabled={!voice.hasAudio}
                        onPress={() => onSelectVoice(voice)}
                      >
                        <View style={{flex: 1}}>
                          <Text style={{ color: colors.foreground, fontWeight: isSelected ? 'bold' : 'normal' }}>
                            {voice.voiceName}
                          </Text>
                          {!isOwned && voice.hasAudio && (
                            <Text style={{ fontSize: 10, color: colors.accent }}>{voice.priceDias} 💎</Text>
                          )}
                        </View>
                        {isSelected && <Volume2 size={16} color={colors.primary} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'flex-end' },
  container: { borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, maxHeight: '80%' },
  dragIndicator: { width: 40, height: 4, backgroundColor: '#ccc', borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 5 },
  section: { marginBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
  
  // Font Control
  rowControl: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 12, padding: 8 },
  btnCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  
  // Theme Control
  themeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  themeOption: { flex: 1, height: 50, borderRadius: 25, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },

  // Font Family Control
  fontRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fontOption: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderRadius: 20 },

  // Voice Control
  voiceList: { gap: 8 },
  voiceItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1 },
});