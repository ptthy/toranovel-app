import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// --- KHOÁ REFRESH TRÁNH GỌI NHIỀU LẦN ---
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ---------- REQUEST INTERCEPTOR ----------
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------- RESPONSE INTERCEPTOR (REFRESH TOKEN) ----------
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 → thử refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // đánh dấu request đã retry
      originalRequest._retry = true;

      if (isRefreshing) {
        // chờ refresh xong rồi retry tiếp
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const oldToken = await AsyncStorage.getItem("authToken");

        // CALL API REFRESH
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/Auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${oldToken}`,
            },
          }
        );

        const newToken = refreshResponse.data.token;

        // Lưu token mới
        await AsyncStorage.setItem("authToken", newToken);
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

        processQueue(null, newToken);
        isRefreshing = false;

        // Gắn token mới vào request gốc rồi retry
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // clear token
        await AsyncStorage.removeItem("authToken");
        delete apiClient.defaults.headers.common["Authorization"];

        return Promise.reject(refreshError);
      }
    }

    // không phải lỗi 401 thì reject bình thường
    return Promise.reject(error);
  }
);

export default apiClient;
