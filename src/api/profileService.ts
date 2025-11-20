import apiClient from './apiClient';

// --- 1. Định nghĩa Type cho Profile (dựa trên API của bạn) ---

export interface UserProfile {
  accountId: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  gender: 'unspecified' | 'M' | 'F';
  birthday: string | null;
dias: number;
}

// Type cho PUT /api/Profile
interface UpdateProfileData {
  bio?: string;
  gender?: 'unspecified' | 'M' | 'F';
  birthday?: string | null; // <-- ĐÃ SỬA LỖI Ở ĐÂY
}

// Type cho POST /api/Profile/email/otp
interface NewEmailData {
  newEmail: string;
}

// Type cho POST /api/Profile/email/verify
interface VerifyEmailOtpData {
  otp: string;
}

// --- 2. Tạo đối tượng Profile Service ---

export const profileService = {
  /**
   * GET /api/Profile
   * Lấy thông tin profile của user hiện tại (đã login)
   */
  getProfile: () => {
    return apiClient.get<UserProfile>('/api/Profile');
  },

  /**
   * PUT /api/Profile
   * Cập nhật thông tin bio, gender, birthday
   */
  updateProfile: (data: UpdateProfileData) => {
    return apiClient.put('/api/Profile', data);
  },

  /**
   * POST /api/Profile/avatar
   * Upload avatar mới. Dùng FormData.
   */
  uploadAvatar: (formData: FormData) => {
    // API client đã được cấu hình để tự động xử lý header 'multipart/form-data'
    return apiClient.post<{ avatarUrl: string }>('/api/Profile/avatar', formData);
  },

  /**
   * POST /api/Profile/email/otp
   * Yêu cầu gửi OTP để đổi email
   */
  requestEmailChange: (data: NewEmailData) => {
    return apiClient.post('/api/Profile/email/otp', data);
  },

  /**
   * POST /api/Profile/email/verify
   * Xác thực OTP để hoàn tất đổi email
   */
  verifyEmailChange: (data: VerifyEmailOtpData) => {
    return apiClient.post('/api/Profile/email/verify', data);
  },
};