import apiClient from './apiClient';

// --- 1. Định nghĩa Type cho Profile ---
export interface UserProfile {
  accountId: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  gender: 'unspecified' | 'M' | 'F';
  birthday: string | null;
  dias: number; // Field tự gộp từ ví
}

interface UpdateProfileData {
  bio?: string;
  gender?: 'unspecified' | 'M' | 'F';
  birthday?: string | null;
}

// --- 2. Định nghĩa Type cho Followed Authors (MỚI THÊM) ---
export interface FollowedAuthorItem {
  authorId: string;
  username: string;
  avatarUrl: string | null;
  notificationsEnabled: boolean;
  followedAt: string;
}

export interface FollowedListResponse {
  items: FollowedAuthorItem[];
  total: number;
  page: number;
  pageSize: number;
}

// --- 3. Service ---
export const profileService = {
  getProfile: async () => {
    try {
      // 1. Lấy thông tin cơ bản
      const profileRes = await apiClient.get<any>('/api/Profile');
      
      // 2. Lấy thông tin ví (Wallet)
      // Thêm timestamp để tránh cache
      const walletRes = await apiClient.get<any>(`/api/Profile/wallet?t=${new Date().getTime()}`)
        .catch(err => {
            console.log("Lỗi lấy ví:", err);
            return { data: { diaBalance: 0, isAuthor: false } };
        });

      // 3. Gộp dữ liệu
      const mergedData: UserProfile = {
        ...profileRes.data,
        dias: walletRes.data.diaBalance || 0,
        isAuthor: walletRes.data.isAuthor || false,
        subscription: walletRes.data.subscription || null
      };

      return { data: mergedData };
    } catch (error) {
      console.error("Lỗi service getProfile:", error);
      throw error;
    }
  },

  updateProfile: (data: any) => apiClient.put('/api/Profile', data),
  
  uploadAvatar: (formData: FormData) => apiClient.post<{ avatarUrl: string }>('/api/Profile/avatar', formData),

  
  requestEmailChange: (data: any) => apiClient.post('/api/Profile/email/otp', data),
  
  verifyEmailChange: (data: any) => apiClient.post('/api/Profile/email/verify', data),

  /**
   * GET /api/AuthorFollow/mine
   * Lấy danh sách tác giả đang theo dõi (MỚI THÊM)
   */
  getFollowedAuthors: (page = 1, pageSize = 20) => {
    return apiClient.get<FollowedListResponse>('/api/AuthorFollow/mine', {
      params: { page, pageSize }
    });
  },
  
  /**
   * DELETE /api/AuthorFollow/{authorId}
   * Hủy theo dõi tác giả (Tiện ích bổ sung nếu cần dùng trong modal list)
   */
  unfollowAuthor: (authorId: string) => {
    return apiClient.delete(`/api/AuthorFollow/${authorId}`);
  }
};