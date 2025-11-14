// Import các thư viện types
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// --- Định nghĩa dữ liệu truyền cho mỗi màn hình ---

// 1. Luồng Đăng nhập (Auth Stack)
export type AuthStackParamList = {
  Welcome: undefined; // Màn hình Welcome không cần dữ liệu
  SignIn: undefined;
  SignUp: undefined;
  OTP: undefined;
  ForgotPassword: undefined;
};

// 2. Luồng Chính (Main Tabs)
export type MainBottomTabParamList = {
  Home: undefined;
  Library: undefined;
  Audio: undefined;
  Profile: undefined;
};

// 3. Luồng Chính (Main Stack - Gồm Tabs và các màn hình con)
export type MainStackParamList = {
  MainTabs: { screen?: keyof MainBottomTabParamList }; // Màn hình chứa Bottom Tabs
  Reader: { story: any }; // Màn hình Reader nhận 1 object `story`
  Settings: undefined;
  TopUp: undefined; // Màn hình nạp xu
};


// --- Định nghĩa Props cho từng màn hình (Để dùng hook `useNavigation` và `useRoute`) ---

// Props cho màn hình trong Auth Stack
export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

// Props cho màn hình trong Main Stack
export type MainScreenProps<T extends keyof MainStackParamList> =
  NativeStackScreenProps<MainStackParamList, T>;

// Props cho màn hình BÊN TRONG Bottom Tab
export type MainTabScreenProps<T extends keyof MainBottomTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainBottomTabParamList, T>,
    NativeStackScreenProps<MainStackParamList>
  >;

// Khai báo global để `useNavigation` không báo lỗi
declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainStackParamList {}
  }
}