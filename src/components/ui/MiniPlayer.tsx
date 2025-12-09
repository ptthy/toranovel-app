import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Pause, X } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeProvider';

interface MiniPlayerProps {
  visible: boolean;
  isPlaying: boolean;
  voiceName: string;
  onPlayPause: () => void;
  onClose: () => void;
  // --- THÊM 2 DÒNG NÀY ĐỂ FIX LỖI ---
  playbackRate: number; 
  onChangeSpeed: () => void;
}

export function MiniPlayer({ 
  visible, 
  isPlaying, 
  voiceName, 
  onPlayPause, 
  onClose,
  // --- NHẬN PROPS MỚI ---
  playbackRate, 
  onChangeSpeed 
}: MiniPlayerProps) {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      <View style={styles.info}>
        <Text style={{ color: colors.mutedForeground, fontSize: 10, textTransform: 'uppercase' }}>Đang phát giọng đọc</Text>
        <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 14 }}>{voiceName}</Text>
      </View>

      <View style={styles.controls}>
        {/* --- NÚT CHỈNH TỐC ĐỘ (MỚI) --- */}
        <TouchableOpacity 
          onPress={onChangeSpeed}
          style={{ 
            paddingHorizontal: 8, 
            paddingVertical: 4, 
            backgroundColor: 'rgba(0,0,0,0.05)', 
            borderRadius: 6,
            marginRight: 4
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.primary }}>
            {playbackRate}x
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onPlayPause} style={[styles.playBtn, { backgroundColor: colors.primary }]}>
          {isPlaying ? <Pause size={20} color="#fff" fill="#fff" /> : <Play size={20} color="#fff" fill="#fff" />}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
          <X size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 12, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5,
  },
  info: { flex: 1 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  playBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
});