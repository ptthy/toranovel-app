import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// 1. Luồng Đăng nhập (Auth Stack)
export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  OTP: { email: string };
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

// 3. Luồng Chính (Main Stack)
export type MainStackParamList = {
  MainTabs: { screen?: keyof MainBottomTabParamList };
  Reader: { storyId: string; chapterId: string }; // Cập nhật Reader nhận ID
  Settings: undefined;
  TopUp: undefined;
  EditProfile: undefined;
  StoryDetail: { storyId: string }; // <-- THÊM DÒNG NÀY
};

// --- Các Type Props (Giữ nguyên) ---
export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainScreenProps<T extends keyof MainStackParamList> =
  NativeStackScreenProps<MainStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainBottomTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainBottomTabParamList, T>,
    NativeStackScreenProps<MainStackParamList>
  >;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainStackParamList {}
  }
}