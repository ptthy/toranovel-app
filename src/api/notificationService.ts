import apiClient from './apiClient';

// --- INTERFACES CHO NOTIFICATION ---
export interface NotificationItem {
  notificationId: string;
  recipientId: string;
  type: string; // 'subscription_reminder', etc.
  title: string;
  message: string;
  payload?: any;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  total: number;
  page: number;
  pageSize: number;
}

// --- INTERFACES CHO SUBSCRIPTION (Dùng để check trạng thái nhận quà) ---
export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  planCode: string | null;
  planName: string | null;
  startAt: string | null;
  endAt: string | null;
  dailyDias: number;
  priceVnd: number;
  lastClaimedAt: string | null;
  canClaimToday: boolean;
}

export const notificationService = {
  // 1. Lấy danh sách thông báo
  getNotifications: (page = 1, pageSize = 20) => {
    return apiClient.get<NotificationListResponse>('/api/Notification', {
      params: { page, pageSize }
    });
  },

  // 2. Đánh dấu đã đọc 1 thông báo
  markAsRead: (notificationId: string) => {
    return apiClient.post(`/api/Notification/${notificationId}/read`);
  },

  // 3. Đánh dấu đã đọc tất cả
  markAllAsRead: () => {
    return apiClient.post('/api/Notification/read-all');
  },

  // --- CÁC HÀM SUBSCRIPTION (Tích hợp vào đây để tiện gọi ở màn hình Notification) ---
  
  // 4. Kiểm tra trạng thái gói cước (để biết có được nhận quà hôm nay không)
  getSubscriptionStatus: () => {
    return apiClient.get<SubscriptionStatus>('/api/Subscription/status');
  },

  // 5. Nhận quà hàng ngày
  claimDailyReward: () => {
    return apiClient.post('/api/Subscription/claim-daily');
  }
};