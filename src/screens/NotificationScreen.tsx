import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, RefreshControl, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Bell, CheckCheck, MailOpen } from 'lucide-react-native';

import { useTheme } from '../contexts/ThemeProvider';
import { useAuth } from '../contexts/AuthContext'; // Import để lấy User ID cho thông báo ảo
import { notificationService, NotificationItem } from '../api/notificationService';


// Hàm format thời gian
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

export function NotificationScreen() {
  const { colors, typography, theme } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth(); // Lấy user hiện tại

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hàm lấy dữ liệu (Thông báo thực + Kiểm tra quà hàng ngày)
  const fetchNotifications = async () => {
    try {
      // Gọi song song: Lấy thông báo từ Server VÀ Kiểm tra trạng thái gói cước
      const [notifRes, subRes] = await Promise.all([
        notificationService.getNotifications(1, 50),
        // Thêm catch để nếu API status lỗi thì không chặn việc hiện thông báo thường
       notificationService.getSubscriptionStatus().catch(() => ({ data: null })) 
      ]);

      let items: NotificationItem[] = [];
      if (notifRes.data && Array.isArray(notifRes.data.items)) {
        items = notifRes.data.items;
      }

      // --- LOGIC TẠO THÔNG BÁO ẢO ---
      // Nếu user có gói Active VÀ được phép nhận hôm nay -> Chèn thông báo nhắc nhở lên đầu
      const subData = subRes.data;
   if (subData && subData.hasActiveSubscription && subData.canClaimToday) {
        const virtualNotif: NotificationItem = {
          notificationId: 'local_daily_claim', // ID giả định đặc biệt
          recipientId: user?.id || 'me',
          type: 'subscription_reminder', // Type để xử lý click
          title: '🎁 Nhận Kim Cương Hàng Ngày',
          message: `Bạn có ${subData.dailyDias} 💎 chưa nhận hôm nay. Bấm vào đây để nhận ngay!`,
          isRead: false, // Luôn hiển thị chưa đọc để gây chú ý
          createdAt: new Date().toISOString(),
        };
        // Chèn vào đầu danh sách
        items = [virtualNotif, ...items];
      }
      // -------------------------------

      setNotifications(items);

    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications();
  };

  const handleReadAll = async () => {
    // Chỉ đánh dấu các thông báo thật (có ID khác 'local_daily_claim')
    const realNotifications = notifications.filter(n => n.notificationId !== 'local_daily_claim');
    
    if (realNotifications.every(n => n.isRead)) return;

    const oldState = [...notifications];
    // Cập nhật UI ngay lập tức
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error("Lỗi đọc tất cả:", error);
      setNotifications(oldState); 
      Alert.alert("Lỗi", "Không thể thao tác lúc này");
    }
  };

  const handlePressNotification = async (item: NotificationItem) => {
    // 1. Đánh dấu đã đọc (Về mặt hiển thị UI)
    if (!item.isRead) {
      setNotifications(prev => 
        prev.map(n => n.notificationId === item.notificationId ? { ...n, isRead: true } : n)
      );
      
     
      if (item.notificationId !== 'local_daily_claim') {
         notificationService.markAsRead(item.notificationId).catch(err => console.log(err));
      }
    }

    // 2. --- XỬ LÝ NHẬN DIAS ---
    if (item.type === 'subscription_reminder') {
        try {
            await notificationService.claimDailyReward();
            Alert.alert("Thành công", "Bạn đã nhận được kim cương hàng ngày!");
            
            // Sau khi nhận thành công, XÓA thông báo ảo khỏi danh sách để không hiện nữa
            setNotifications(prev => prev.filter(n => n.notificationId !== 'local_daily_claim'));
            
        } catch (error: any) {
            console.error(error);
            const message = error?.response?.data?.message || "Có lỗi xảy ra hoặc bạn đã nhận rồi.";
            Alert.alert("Thông báo", message);
        }
    } else {
        // Xử lý các loại thông báo khác
        // Ví dụ: Điều hướng đến trang truyện...
        if (item.message) {
            Alert.alert("Nội dung", item.message);
        }
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const isRead = item.isRead;
    // Highlight màu khác cho thông báo nhắc nhận quà
    const isSpecial = item.notificationId === 'local_daily_claim';
    
    // Nếu là thông báo đặc biệt chưa đọc, dùng màu nền nổi bật hơn chút (hoặc giữ như cũ)
    const backgroundColor = isRead 
        ? colors.card 
        : (isSpecial ? (theme === 'light' ? '#E8F5E9' : '#1B2E21') : (theme === 'light' ? '#E3F2FD' : '#1A2A3A'));

    return (
      <TouchableOpacity 
        style={[styles.itemContainer, { backgroundColor, borderColor: colors.border }]}
        onPress={() => handlePressNotification(item)}
        activeOpacity={0.7}
      >
        <View style={[
            styles.iconBox, 
            { backgroundColor: isRead ? colors.muted : (isSpecial ? '#4CAF50' : colors.primary) }
        ]}>
           {isRead ? <MailOpen size={20} color="#FFF" /> : <Bell size={20} color="#FFF" />}
        </View>

        <View style={styles.contentBox}>
          <View style={styles.titleRow}>
             <Text 
                numberOfLines={1} 
                style={[
                    typography.h4, 
                    { color: colors.foreground, fontSize: 15, flex: 1, fontWeight: isRead ? '600' : '800' }
                ]}
             >
                {item.title}
             </Text>
             <Text style={{ color: colors.mutedForeground, fontSize: 11, marginLeft: 8 }}>
                {formatTime(item.createdAt)}
             </Text>
          </View>

          <Text 
            numberOfLines={2} 
            style={[typography.p, { color: isRead ? colors.mutedForeground : colors.foreground, fontSize: 13, marginTop: 4 }]}
          >
            {item.message}
          </Text>
        </View>

        {!isRead && <View style={[styles.unreadDot, isSpecial && { backgroundColor: '#4CAF50' }]} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <ArrowLeft size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[typography.h3, { color: colors.foreground }]}>Thông báo</Text>
        </View>

        <TouchableOpacity onPress={handleReadAll} style={styles.readAllBtn}>
            <CheckCheck size={18} color={colors.primary} />
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                Đọc tất cả
            </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
            data={notifications}
            keyExtractor={(item) => item.notificationId}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />
            }
            ListEmptyComponent={
                <View style={styles.emptyState}>
                    <Bell size={48} color={colors.mutedForeground} />
                    <Text style={{ color: colors.mutedForeground, marginTop: 16 }}>Chưa có thông báo nào</Text>
                </View>
            }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  readAllBtn: { 
    flexDirection: 'row', alignItems: 'center', 
    paddingHorizontal: 10, paddingVertical: 6, 
    backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 16 
  },
  listContent: { padding: 16, paddingBottom: 40 },
  itemContainer: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, marginBottom: 12,
    borderRadius: 12, borderWidth: 1,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 1,
  },
  iconBox: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  contentBox: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B30', marginLeft: 8 },
  emptyState: { alignItems: 'center', marginTop: 100, opacity: 0.7 }
});