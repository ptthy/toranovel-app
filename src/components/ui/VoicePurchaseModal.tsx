import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { X, Play, CheckCircle, Circle, ShoppingCart, Volume2, MicOff, Gem } from 'lucide-react-native'; // Thêm Gem
import { useTheme } from '../../contexts/ThemeProvider';
import { chapterService, ChapterVoiceStatus } from '../../api/storyService';


interface VoicePurchaseModalProps {
  visible: boolean;
  onClose: () => void;
  chapterId: string;
  onPurchaseSuccess: () => void; // Callback load lại chương
  onPlayVoice: (url: string) => void;
}

export function VoicePurchaseModal({ 
  visible, onClose, chapterId, onPurchaseSuccess, onPlayVoice 
}: VoicePurchaseModalProps) {
  const { colors, typography } = useTheme();
  
  const [voices, setVoices] = useState<ChapterVoiceStatus[]>([]);
  const [selectedVoiceIds, setSelectedVoiceIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    if (visible && chapterId) {
      loadData();
      setSelectedVoiceIds([]);
    }
  }, [visible, chapterId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await chapterService.getChapterVoicesStatus(chapterId);
      setVoices(res.data);
    } catch (error) {
      console.error("Lỗi tải voice status:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle chọn voice để mua
  const toggleSelection = (voiceId: string) => {
    if (selectedVoiceIds.includes(voiceId)) {
      setSelectedVoiceIds(prev => prev.filter(id => id !== voiceId));
    } else {
      setSelectedVoiceIds(prev => [...prev, voiceId]);
    }
  };

  // Mua voice
  const handleBuyVoices = async () => {
    if (selectedVoiceIds.length === 0) return;
    
    setBuying(true);
    try {
      await chapterService.buyVoiceForChapter(chapterId, selectedVoiceIds);
      Alert.alert("Thành công", "Đã mua giọng đọc thành công!");
      onPurchaseSuccess(); // Reload lại reader screen
      onClose();
    } catch (error: any) {
      console.error("Lỗi mua voice:", error);
      const msg = error.response?.data?.title || "Giao dịch thất bại.";
      Alert.alert("Thất bại", msg);
    } finally {
      setBuying(false);
    }
  };

  const renderItem = ({ item }: { item: ChapterVoiceStatus }) => {
    const isSelected = selectedVoiceIds.includes(item.voiceId);

    // 1. Trường hợp đã mua -> Hiện nút Play
    if (item.owned && item.audioUrl) {
      return (
        <View style={[styles.itemContainer, { borderColor: colors.primary, backgroundColor: colors.card }]}>
          <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
            <Volume2 size={24} color={colors.primary} />
          </View>
          <View style={styles.infoBox}>
            <Text style={[typography.h4, { color: colors.foreground }]}>{item.voiceName}</Text>
            <Text style={{ color: colors.success, fontSize: 12 }}>Đã sở hữu</Text>
          </View>
          <TouchableOpacity 
            style={[styles.playButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              onClose(); // Đóng modal để nhìn thấy màn hình đọc
              onPlayVoice(item.audioUrl!);
            }}
          >
            <Play size={16} color="#fff" fill="#fff" />
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>Nghe</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // 2. Trường hợp chưa có Audio (Server chưa tạo) -> Disable
    if (!item.hasAudio) {
      return (
        <View style={[styles.itemContainer, { borderColor: colors.border, opacity: 0.6 }]}>
          <View style={[styles.iconBox, { backgroundColor: '#eee' }]}>
            <MicOff size={24} color={colors.mutedForeground} />
          </View>
          <View style={styles.infoBox}>
            <Text style={[typography.h4, { color: colors.mutedForeground }]}>{item.voiceName}</Text>
            <Text style={{ color: colors.mutedForeground, fontSize: 12, fontStyle: 'italic' }}>
              Chưa hỗ trợ
            </Text>
          </View>
        </View>
      );
    }

    // 3. Trường hợp có Audio nhưng chưa mua -> Cho phép chọn
    return (
      <TouchableOpacity 
        style={[
          styles.itemContainer, 
          { borderColor: isSelected ? colors.primary : colors.border, backgroundColor: isSelected ? colors.primary + '05' : colors.card }
        ]}
        onPress={() => toggleSelection(item.voiceId)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, { backgroundColor: colors.muted }]}>
          <Volume2 size={24} color={colors.foreground} />
        </View>
        <View style={styles.infoBox}>
          <Text style={[typography.h4, { color: colors.foreground }]}>{item.voiceName}</Text>
          {/* SỬA: Thay emoji 💎 bằng Icon Gem */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
             <Text style={{ color: colors.accent, fontWeight: 'bold', fontSize: 13 }}>
                {item.priceDias}
             </Text>
             <Gem size={12} color="#579fff" fill="#579fff" />
          </View>
        </View>
        
        {isSelected ? (
          <CheckCircle size={24} color={colors.primary} fill={colors.primary + '20'} />
        ) : (
          <Circle size={24} color={colors.mutedForeground} />
        )}
      </TouchableOpacity>
    );
  };

  // Tính tổng tiền các item đang chọn
  const totalPrice = selectedVoiceIds.reduce((sum, id) => {
    const v = voices.find(x => x.voiceId === id);
    return sum + (v?.priceDias || 0);
  }, 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[typography.h3, { color: colors.foreground }]}>Giọng đọc AI</Text>
            <TouchableOpacity onPress={onClose}><X size={24} color={colors.mutedForeground} /></TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={voices}
              keyExtractor={item => item.voiceId}
              renderItem={renderItem}
              contentContainerStyle={{ padding: 16 }}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: colors.mutedForeground, marginTop: 20 }}>
                  Chương này chưa có giọng đọc nào.
                </Text>
              }
            />
          )}

          {selectedVoiceIds.length > 0 && (
            <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
              <View>
                <Text style={{ color: colors.mutedForeground }}>Tổng thanh toán:</Text>
                {/* SỬA: Thay chữ Dias bằng Icon Gem */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                   <Text style={[typography.h3, { color: colors.primary }]}>{totalPrice}</Text>
                   <Gem size={18} color="#4b98ff" fill="#4b98ff" />
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.buyButton, { backgroundColor: colors.primary }]}
                onPress={handleBuyVoices}
                disabled={buying}
              >
                {buying ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <ShoppingCart size={20} color="#fff" />
                    <Text style={styles.buyButtonText}>Mua ngay</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { height: '65%', borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, alignItems: 'center' },
  itemContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 12, borderRadius: 12, borderWidth: 1 },
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoBox: { flex: 1 },
  playButton: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, alignItems: 'center' },
  footer: { padding: 16, paddingBottom: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1 },
  buyButton: { flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30, alignItems: 'center', gap: 8 },
  buyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});