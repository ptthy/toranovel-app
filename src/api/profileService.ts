import apiClient from './apiClient';

// --- 1. Định nghĩa Type cho Profile ---
export interface UserProfile {
  // Các trường gốc từ API GET /api/Profile
  accountId: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  gender: 'unspecified' | 'M' | 'F';
  birthday: string | null;
  strike: number;
  isAuthor: boolean;

  // --- CÁC TRƯỜNG MAPPING (Để dùng trong UI) ---
  id: string;            // Sẽ map từ accountId
  dateOfBirth: string | null; // Sẽ map từ birthday
  dias: number;          // Lấy từ API ví
  roles: string[];       // Sẽ tự tạo nếu API profile chưa trả về
  subscription: any;
}

// Interface cho hàm Update (PUT)
export interface UpdateProfileData {
  bio?: string;
  gender?: 'unspecified' | 'M' | 'F';
  birthday?: string | null; // Định dạng YYYY-MM-DD
}

// --- 2. Service ---
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
            return { data: { diaBalance: 0, isAuthor: false, subscription: null } };
        });

      const profileData = profileRes.data;
      const walletData = walletRes.data;

      // 3. Gộp dữ liệu & Mapping các trường bị thiếu cho UI
      const mergedData: UserProfile = {
        ...profileData,
        
        // Mapping ID và Birthday cho khớp với code cũ
        id: profileData.accountId,
        dateOfBirth: profileData.birthday,
        
        // Roles (Hiện tại API Profile chưa trả về roles, ta có thể lấy từ Token decode hoặc mặc định)
        roles: ['reader', ...(profileData.isAuthor ? ['author'] : [])], 

        // Dữ liệu từ ví
        dias: walletData.diaBalance || 0,
        subscription: walletData.subscription || null
      };

      return { data: mergedData };
    } catch (error) {
      console.error("Lỗi service getProfile:", error);
      throw error;
    }
  },

  /**
   * PUT /api/Profile
   * Cập nhật thông tin cá nhân
   */
  updateProfile: (data: UpdateProfileData) => {
    return apiClient.put('/api/Profile', data);
  },
  
  uploadAvatar: (formData: FormData) => apiClient.post<{ avatarUrl: string }>('/api/Profile/avatar', formData),

  requestEmailChange: (data: any) => apiClient.post('/api/Profile/email/otp', data),
  
  verifyEmailChange: (data: any) => apiClient.post('/api/Profile/email/verify', data),

  // --- AUTHOR FOLLOW ---
  getFollowedAuthors: (page = 1, pageSize = 20) => {
    return apiClient.get('/api/AuthorFollow/mine', {
      params: { page, pageSize }
    });
  },
  
  unfollowAuthor: (authorId: string) => {
    return apiClient.delete(`/api/AuthorFollow/${authorId}`);
  }
};