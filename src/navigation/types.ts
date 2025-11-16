import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// 1. Luồng Đăng nhập (Auth Stack)
export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  OTP: { email: string }; // <-- SỬA DÒNG NÀY (từ undefined)
  ForgotPassword: undefined;
  ResetPassword: { email: string };
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
  MainTabs: { screen?: keyof MainBottomTabParamList };
  Reader: { story: any };
  Settings: undefined;
  TopUp: undefined;
};

// --- (Các Type Props giữ nguyên) ---

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

// Khai báo global
declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainStackParamList {}
  }
}