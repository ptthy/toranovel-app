import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Lock, Zap, X } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeProvider';
import { chapterService } from '../../api/storyService';
import { profileService } from '../../api/profileService'; // Import service chuẩn
import { useAuth } from '../../contexts/AuthContext'; // Import AuthContext để update global state

interface ChapterUnlockModalProps {
  visible: boolean;
  onClose: () => void;
  chapter: {
    chapterId: string;
    chapterNo: number;
    priceDias?: number;
    title: string;
  } | null;
  onSuccess: () => void;
}

export function ChapterUnlockModal({ visible, onClose, chapter, onSuccess }: ChapterUnlockModalProps) {
  const { colors, typography } = useTheme();
  const { fetchUserProfile } = useAuth(); // Lấy hàm này để update lại số dư toàn app sau khi mua
  
  const [isLoading, setIsLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);

  // Mỗi khi mở modal -> Lấy số dư mới nhất
  useEffect(() => {
    if (visible) {
      loadBalance();
    }
  }, [visible]);

  const loadBalance = async () => {
    try {
        const res = await profileService.getProfile();
        console.log("💰 Số dư trong Modal:", res.data.dias);
        setUserBalance(res.data.dias || 0);
    } catch (error) {
       console.log(error);
    }
  };

  const handleBuy = async () => {
    if (!chapter) return;
    setIsLoading(true);
    try {
      await chapterService.buyChapter(chapter.chapterId);
      
      // Mua xong -> Cập nhật lại số dư trong AuthContext (để màn hình Profile cũng tự cập nhật)
      await fetchUserProfile(); 
      
      Alert.alert("Thành công", "Mở khóa chương thành công!", [
        { text: "Đọc ngay", onPress: onSuccess }
      ]);
      
    } catch (error: any) {
      console.error("Lỗi mua chương:", error);

      // Xử lý lỗi 409 (Đã mua rồi)
      if (error.response && error.response.status === 409) {
          Alert.alert("Thông báo", "Bạn đã sở hữu chương này rồi.", [
              { text: "Vào đọc ngay", onPress: onSuccess }
          ]);
          return;
      }

      const msg = error.response?.data?.message || "Số dư không đủ hoặc lỗi hệ thống.";
      Alert.alert("Thất bại", msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!visible || !chapter) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card }]}>
          
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={24} color={colors.mutedForeground} />
          </TouchableOpacity>

          <View style={styles.iconWrapper}>
            <Lock size={40} color="#F97316" /> 
          </View>

          <Text style={[typography.h3, { color: colors.foreground, textAlign: 'center', marginBottom: 8 }]}>
            Chương Trả Phí
          </Text>

          <Text style={{ color: colors.mutedForeground, textAlign: 'center', marginBottom: 20, paddingHorizontal: 10 }}>
            Nội dung chương <Text style={{fontWeight: 'bold'}}>#{chapter.chapterNo}</Text> được khóa.
            Sử dụng Dias để mở khóa nhé!
          </Text>

          {/* Box Số dư */}
          <View style={styles.balanceBox}>
            <Text style={{ color: '#666', fontSize: 12 }}>Số dư hiện tại</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
               <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#007AFF' }}>
                 {userBalance.toLocaleString('en-US')}
               </Text>
               <Text style={{ fontSize: 14, color: '#007AFF' }}>Dias</Text>
            </View>
          </View>

          {/* Nút Mua */}
          <TouchableOpacity 
            style={[styles.buyButton, { opacity: isLoading ? 0.7 : 1 }]} 
            onPress={handleBuy}
            disabled={isLoading}
          >
            {isLoading ? (
               <ActivityIndicator color="#fff" />
            ) : (
               <>
                 <Lock size={18} color="#fff" />
                 <Text style={styles.buyText}>
                   Mở khóa ngay ({chapter.priceDias || 0} Dias)
                 </Text>
               </>
            )}
          </TouchableOpacity>

         

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  container: { width: '100%', maxWidth: 340, borderRadius: 20, padding: 24, alignItems: 'center' },
  closeBtn: { position: 'absolute', top: 12, right: 12, padding: 4 },
  iconWrapper: { 
    width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFF7ED', 
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: '#FFEDD5'
  },
  balanceBox: { 
    borderWidth: 1, borderColor: '#ddd', borderRadius: 12, 
    paddingVertical: 10, paddingHorizontal: 24, alignItems: 'center', marginBottom: 20 
  },
  buyButton: { 
    backgroundColor: '#F97316', width: '100%', paddingVertical: 14, borderRadius: 12,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 12
  },
  buyText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  topupButton: { 
    width: '100%', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#10B981',
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 
  }
});