import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';
import { authService } from '../api/authService';


type AuthContextType = {
  isLoggedIn: boolean;
  isLoading: boolean; // Thêm state loading
  signIn: (identifier: string, password: string) => Promise<boolean>;
  signOut: () => void;
  // Thêm các hàm khác (register, v.v...)
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Bắt đầu ở true

  // Hàm kiểm tra token khi app khởi động
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          // Gắn token vào header của apiClient cho các request sau
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.error("Failed to load auth token", e);
      }
      setIsLoading(false); // Hoàn tất loading
    };

    checkAuthStatus();
  }, []);

  const signIn = async (identifier: string, password: string) => {
    try {
      const response = await authService.login({ identifier, password });
      
      const { token, user } = response.data; // Giả sử API trả về { token, user }

      // 1. Lưu token
      await AsyncStorage.setItem('authToken', token);

      // 2. Gắn token vào header cho các request TƯƠNG LAI
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 3. Cập nhật state
      setIsLoggedIn(true);
      return true; // Báo thành công

    } catch (error) {
      console.error("Sign in failed", error);
      setIsLoggedIn(false);
      return false; // Báo thất bại
    }
  };

  const signOut = async () => {
    try {
      // Gọi API logout (nếu có) để vô hiệu hóa token phía server
      // await authService.logout(); 
    } catch (e) {
      console.error("Failed to call logout API", e);
    } finally {
      // 1. Xóa token
      await AsyncStorage.removeItem('authToken');

      // 2. Xóa token khỏi header
      delete apiClient.defaults.headers.common['Authorization'];

      // 3. Cập nhật state
      setIsLoggedIn(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, signIn, signOut }}>
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