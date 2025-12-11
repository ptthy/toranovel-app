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
  user: UserProfile | null; // Dùng type chuẩn
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
      // Gọi service đã xử lý logic gộp API rồi
      const res = await profileService.getProfile();
      
      console.log("🔥 User Data (Sau khi gộp):", res.data);
      setUser(res.data);

    } catch (e) {
      console.error("Lỗi fetchUserProfile context:", e);
      throw e; 
    }
  };

useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          await fetchUserProfile();
          setIsLoggedIn(true);
        }
      } catch (e: any) {
        // Lỗi 404 thường do Token cũ/sai -> API trả về Unauthorized hoặc Not Found
        console.error("Check Auth thất bại:", e);
        
        // Chỉ logout nếu lỗi 401 (Unauthorized) hoặc token rác
        // Nếu lỗi 404 do API sai đường dẫn thì không nên logout vội
        if (e.response?.status === 401 || e.response?.status === 403) {
             await signOut();
        }
      } finally {
        setIsLoading(false);
      }
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