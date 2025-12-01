import apiClient from './apiClient';

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
  }
};