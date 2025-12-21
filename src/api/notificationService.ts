import apiClient from './apiClient';

// --- INTERFACES ---

// Định nghĩa Payload linh động tùy theo loại thông báo
export interface NotificationPayload {
  // Cho loại 'subscription_reminder'
  planCode?: string;
  planName?: string;
  dailyDias?: number;
  
  // Cho loại 'new_chapter'
  storyId?: string;
  authorId?: string;
  chapterId?: string;
  chapterNo?: number;
  
  // Các trường khác nếu có...
  [key: string]: any; 
}

export interface NotificationItem {
  notificationId: string;
  recipientId: string;
  type: string; // 'subscription_reminder' | 'new_chapter' | 'system' ...
  title: string;
  message: string;
  payload?: NotificationPayload; // Dữ liệu đi kèm
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  // API của bạn hiện tại trả về { items: [...] }, có thể chưa có total/page
}

// --- SERVICE ---
export const notificationService = {
  /**
   * GET /api/Notification
   * Lấy danh sách thông báo
   */
  getNotifications: (page = 1, pageSize = 20) => {
    return apiClient.get<NotificationListResponse>('/api/Notification', {
      params: { page, pageSize }
    });
  },

  /**
   * Đánh dấu đã đọc 1 thông báo
   * (Giả định API: PUT /api/Notification/{id}/read)
   */
  markAsRead: (notificationId: string) => {
    return apiClient.put(`/api/Notification/${notificationId}/read`);
  },

  /**
   * Đánh dấu tất cả đã đọc
   * (Giả định API: PUT /api/Notification/read-all)
   */
  markAllAsRead: () => {
    return apiClient.put('/api/Notification/read-all');
  },

  // --- CÁC HÀM HỖ TRỢ LOGIC NHẬN QUÀ ---

  // Lấy trạng thái gói cước (để hiển thị thông báo ảo nếu cần)
  getSubscriptionStatus: async () => {
     // Gọi service subscription hoặc gọi trực tiếp API
     return apiClient.get('/api/Subscription/status');
  },

  // Nhận quà hàng ngày
  claimDailyReward: () => {
    return apiClient.post('/api/Subscription/claim-daily');
  }
};