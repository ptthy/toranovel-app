import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { profileService, UserProfile } from '../api/profileService';
import { authService } from '../api/authService';
import apiClient from '../api/apiClient';

// Mở rộng type UserProfile để bao gồm dias nếu chưa có
// (Typescript có thể báo lỗi nếu UserProfile gốc không có field dias, nên ta ép kiểu tạm ở dưới)
type AuthContextType = {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: any; // Dùng any tạm thời để tránh lỗi Type nếu UserProfile chưa update
  signIn: (identifier: string, password: string) => Promise<boolean>;
  signOut: () => void;
  signInWithGoogle: (idToken: string) => Promise<boolean>;
  uploadAvatar: (uri: string) => Promise<boolean>;
  fetchUserProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  // --- HÀM ĐÃ SỬA: GỌI CẢ PROFILE VÀ WALLET ---
  const fetchUserProfile = async () => {
    try {
      // 1. Gọi API lấy thông tin cơ bản (Tên, Avatar...)
      const profileResponse = await profileService.getProfile();
      const profileData = profileResponse.data;

      // 2. Gọi API lấy thông tin Ví (Số dư Dias)
      // Thêm timestamp ?t=... để tránh bị Cache dữ liệu cũ
      const walletResponse = await apiClient.get(`/api/Profile/wallet?t=${new Date().getTime()}`);
      const walletData = walletResponse.data;

      console.log("DEBUG - Wallet Data:", walletData); // Check log xem ra 2400 chưa

      // 3. Gộp dữ liệu và Map 'diaBalance' thành 'dias'
      setUser({
        ...profileData, // Giữ lại username, email...
        dias: walletData.diaBalance || 0, // <-- QUAN TRỌNG: Map đúng field này UI mới hiện
        isAuthor: walletData.isAuthor,
        subscription: walletData.subscription
      });

    } catch (e) {
      console.error("Failed to fetch user profile or wallet", e);
      // Ném lỗi ra ngoài để `checkAuthStatus` bắt được
      throw e; 
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Gọi hàm fetch profile (đã bao gồm wallet)
          await fetchUserProfile();
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.error("Auth status check failed (likely expired token)", e);
        // Tự động dọn dẹp token rác
        await AsyncStorage.removeItem('authToken');
        delete apiClient.defaults.headers.common['Authorization'];
        setUser(null);
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const signIn = async (identifier: string, password: string) => {
    try {
      const response = await authService.login({ identifier, password });
      const { token } = response.data;

      await AsyncStorage.setItem('authToken', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await fetchUserProfile();
      setIsLoggedIn(true);
      return true;

    } catch (error) {
      console.error("Sign in failed", error);
      setIsLoggedIn(false);
      return false;
    }
  };

  const signInWithGoogle = async (idToken: string) => {
    try {
      const response = await authService.loginWithGoogle({ idToken }); 
      const { token } = response.data; 

      await AsyncStorage.setItem('authToken', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await fetchUserProfile();
      setIsLoggedIn(true);
      return true;

    } catch (error) {
      console.error("Google Sign in failed on backend", error);
      setIsLoggedIn(false);
      return false;
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      const formData = new FormData();
      formData.append('File', {
        uri: uri,
        name: `avatar_${user?.accountId || 'user'}.jpg`,
        type: 'image/jpeg',
      } as any);

      const response = await profileService.uploadAvatar(formData);
      
      setUser((currentUser: any) => {
        if (!currentUser) return null;
        return { ...currentUser, avatarUrl: response.data.avatarUrl };
      });
      return true;

    } catch (error) {
      console.error("Avatar upload failed", error);
      return false;
    }
  };

  const signOut = async () => {
    try {
      // await authService.logout();
    } catch (e) {
      console.error("Failed to call logout API", e);
    } finally {
      await AsyncStorage.removeItem('authToken');
      delete apiClient.defaults.headers.common['Authorization'];
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isLoggedIn, 
        isLoading, 
        user,
        signIn, 
        signOut, 
        signInWithGoogle, 
        uploadAvatar,
        fetchUserProfile 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}