import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { profileService, UserProfile } from '../api/profileService';
import { authService } from '../api/authService';
import apiClient from '../api/apiClient';


type AuthContextType = {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: UserProfile | null;
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
  const [user, setUser] = useState<UserProfile | null>(null);

  // SỬA LẠI HÀM NÀY:
  const fetchUserProfile = async () => {
    try {
      const response = await profileService.getProfile();
      setUser(response.data);
    } catch (e) {
      console.error("Failed to fetch user profile", e);
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
          
          // SỬA LẠI LOGIC NÀY:
          // Nếu fetchUserProfile() thành công, MỚI setLoggedIn(true)
          await fetchUserProfile();
          setIsLoggedIn(true);
        }
      } catch (e) {
        // Nếu fetchUserProfile() ném lỗi 401, nó sẽ nhảy vào đây
        // (Và chúng ta KHÔNG setLoggedIn(true))
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

  // ... (Hàm signIn và signInWithGoogle giữ nguyên,
  // chúng đã gọi fetchUserProfile() đúng cách)

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
        name: `avatar_${user?.accountId}.jpg`,
        type: 'image/jpeg',
      } as any);

      const response = await profileService.uploadAvatar(formData);
      
      setUser(currentUser => {
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