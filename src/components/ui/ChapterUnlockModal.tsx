import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Lock, Zap, X, CheckCircle, Gem } from 'lucide-react-native'; 
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../../contexts/ThemeProvider';
import { chapterService } from '../../api/storyService';
import { profileService } from '../../api/profileService';
import { useAuth } from '../../contexts/AuthContext';

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
  const { fetchUserProfile } = useAuth();
  const navigation = useNavigation<any>();
  
  const [isLoading, setIsLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);

  useEffect(() => {
    if (visible) {
      loadBalance();
    }
  }, [visible]);

  const loadBalance = async () => {
    try {
        const res = await profileService.getProfile();
        setUserBalance(res.data.dias || 0);
    } catch (error) {
       console.log("Lỗi lấy số dư:", error);
    }
  };

  const handleBuy = async () => {
    if (!chapter) return;
    setIsLoading(true);
    try {
      await chapterService.buyChapter(chapter.chapterId);
      await fetchUserProfile();
      
      Alert.alert("Thành công", "Mở khóa chương thành công!", [
        { text: "Đọc ngay", onPress: onSuccess }
      ]);
      
    } catch (error: any) {
      console.log("Status code mua chương:", error.response?.status);

      if (error.response && error.response.status === 409) {
          fetchUserProfile();
          Alert.alert("Đã sở hữu", "Bạn đã mua chương này rồi. Hệ thống sẽ mở ngay bây giờ.", [
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

  const handleNavigateTopUp = () => {
      onClose();
      navigation.navigate('TopUp'); 
  };

  if (!visible || !chapter) return null;

  const price = chapter.priceDias || 0;
  const isNotEnoughMoney = userBalance < price;

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

          {/* Text mô tả */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20, paddingHorizontal: 10 }}>
            <Text style={{ color: colors.mutedForeground, textAlign: 'center' }}>
              Nội dung chương <Text style={{fontWeight: 'bold'}}>#{chapter.chapterNo}</Text> được khóa. Sử dụng 
            </Text>
            <View style={{ marginHorizontal: 4, transform: [{translateY: 2}] }}>
                <Gem size={14} color="#4b98ff" fill="#4b98ff" />
            </View>
            <Text style={{ color: colors.mutedForeground, textAlign: 'center' }}>để mở khóa nhé!</Text>
          </View>

          {/* Box Số dư */}
          <View style={styles.balanceBox}>
            <Text style={{ color: '#666', fontSize: 12 }}>Số dư hiện tại</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
               <Text style={{ fontSize: 18, fontWeight: 'bold', color: isNotEnoughMoney ? '#EF4444' : '#007AFF' }}>
                 {userBalance.toLocaleString('en-US')}
               </Text>
               <Gem size={16} color="#4b98ff" fill="#4b98ff" />
            </View>
          </View>

          {/* Nút Mua */}
          <TouchableOpacity 
            style={[
                styles.buyButton, 
                { opacity: (isLoading || isNotEnoughMoney) ? 0.7 : 1, backgroundColor: isNotEnoughMoney ? '#9CA3AF' : '#F97316' }
            ]} 
            onPress={handleBuy}
            disabled={isLoading || isNotEnoughMoney}
          >
            {isLoading ? (
               <ActivityIndicator color="#fff" />
            ) : (
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                 {isNotEnoughMoney ? <Lock size={18} color="#fff" /> : <CheckCircle size={18} color="#fff" />}
                 <Text style={styles.buyText}>
                   {isNotEnoughMoney ? "Không đủ số dư" : `Mở khóa ngay`}
                 </Text>
                 {!isNotEnoughMoney && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}>
                       <Text style={{ color: '#F97316', fontWeight: 'bold', fontSize: 12 }}>{price}</Text>
                       {/* Cập nhật màu Gem tại đây: Màu xanh #4b98ff */}
                       <Gem size={12} color="#4b98ff" fill="#4b98ff" />
                    </View>
                 )}
               </View>
            )}
          </TouchableOpacity>

          {/* Nút Nạp tiền */}
          {isNotEnoughMoney && (
              <TouchableOpacity style={styles.topupButton} onPress={handleNavigateTopUp}>
                  <Zap size={18} color="#10B981" />
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ color: '#10B981', fontWeight: 'bold' }}>Nạp thêm</Text>
                    <Gem size={14} color="#4b98ff" fill="#4b98ff" />
                    <Text style={{ color: '#10B981', fontWeight: 'bold' }}>ngay</Text>
                  </View>
              </TouchableOpacity>
          )}

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
    width: '100%', paddingVertical: 14, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12
  },
  buyText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  topupButton: { 
    width: '100%', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#10B981',
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 
  }
});