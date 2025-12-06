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
  /**
   * Lấy thông tin Profile + Số dư ví
   */
  getProfile: async () => {
    try {
      // 1. Gọi API Profile gốc
      const profilePromise = apiClient.get<any>('/api/Profile');
      
      // 2. Gọi API Wallet
      const walletPromise = apiClient.get(`/api/Profile/wallet?t=${new Date().getTime()}`)
        .then(res => res.data?.diaBalance ?? 0)
        .catch((err) => {
            console.log("Lỗi gọi Wallet:", err);
            return 0;
        });

      // 3. Chạy song song
      const [profileRes, diasAmount] = await Promise.all([profilePromise, walletPromise]);

      // 4. Gộp dữ liệu
      const mergedData: UserProfile = {
        ...profileRes.data,
        dias: diasAmount, 
      };

      return { data: mergedData };

    } catch (error) {
      console.error("Lỗi lấy profile:", error);
      throw error;
    }
  },

  updateProfile: (data: UpdateProfileData) => apiClient.put('/api/Profile', data),
  
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