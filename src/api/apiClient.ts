import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants'; // Import Constants

// 1. Lấy API_BASE_URL từ biến .env đã cấu hình
// Dùng `extra` nếu bạn không dùng EXPO_PUBLIC_, nhưng EXPO_PUBLIC_ sẽ đơn giản hơn
// const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

// Cách mới và đơn giản nhất (sau khi đổi tên .env):
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor (Đã "dịch" sang AsyncStorage)
apiClient.interceptors.request.use(
  async (config) => { // <-- Phải là 'async'
    // Lấy token từ AsyncStorage
    const token = await AsyncStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Xử lý FormData (giữ nguyên)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (Đã "dịch" - đơn giản hóa)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // QUAN TRỌNG:
    // Interceptor không nên xử lý điều hướng.
    // Hãy để cho AuthContext (nơi gọi API) quyết định
    // phải làm gì khi gặp lỗi (ví dụ: lỗi 403).
    // Chúng ta chỉ cần reject lỗi để nơi gọi xử lý.
    return Promise.reject(error);
  }
);

export default apiClient;