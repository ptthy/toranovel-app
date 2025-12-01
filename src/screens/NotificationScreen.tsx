import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, RefreshControl, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Bell, CheckCheck, Clock, MailOpen } from 'lucide-react-native';

import { useTheme } from '../contexts/ThemeProvider';
import { notificationService, NotificationItem } from '../api/notificationService';
import { subscriptionService } from '../api/storyService'; // Import Subscription Service

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

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications(1, 50);
      if (res.data && Array.isArray(res.data.items)) {
        setNotifications(res.data.items);
      }
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
    if (notifications.every(n => n.isRead)) return;

    const oldState = [...notifications];
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
    // Đánh dấu đã đọc
    if (!item.isRead) {
      setNotifications(prev => 
        prev.map(n => n.notificationId === item.notificationId ? { ...n, isRead: true } : n)
      );
      notificationService.markAsRead(item.notificationId).catch(err => console.log(err));
    }

    // --- XỬ LÝ NHẬN DIAS ---
    if (item.type === 'subscription_reminder') {
        try {
            await subscriptionService.claimDaily();
            Alert.alert("Thành công", "Bạn đã nhận được kim cương hàng ngày!");
        } catch (error) {
            console.error(error);
            Alert.alert("Thông báo", "Bạn đã nhận quà hôm nay rồi hoặc gói cước đã hết hạn.");
        }
    } else {
        // Xử lý các loại thông báo khác (ví dụ mở truyện)
        Alert.alert("Thông báo", item.message);
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const isRead = item.isRead;
    const backgroundColor = isRead ? colors.card : (theme === 'light' ? '#E3F2FD' : '#1A2A3A');

    return (
      <TouchableOpacity 
        style={[styles.itemContainer, { backgroundColor, borderColor: colors.border }]}
        onPress={() => handlePressNotification(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, { backgroundColor: isRead ? colors.muted : colors.primary }]}>
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

        {!isRead && <View style={styles.unreadDot} />}
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