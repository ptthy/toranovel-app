import apiClient from './apiClient';

// --- 1. Định nghĩa Type ---
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

// --- 2. Service ---
export const profileService = {
  getProfile: async () => {
    try {
      // 1. Gọi API Profile gốc
      const profilePromise = apiClient.get<any>('/api/Profile');
      
      // 2. Gọi API Wallet (ĐÃ SỬA ĐƯỜNG DẪN ĐÚNG)
      // Thêm ?t=... để tránh cache như trong AuthContext của bạn
      const walletPromise = apiClient.get(`/api/Profile/wallet?t=${new Date().getTime()}`)
        .then(res => res.data?.diaBalance ?? 0) // Lấy diaBalance
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
};