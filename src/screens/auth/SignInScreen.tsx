// src/screens/auth/SignInScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeProvider';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input'; // <-- Input NATIVE
import { ArrowLeft } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg'; // <-- Import Svg

// Tạm thời
type SignInScreenProps = {
  // onNavigate: (page: string) => void;
};

// SVG Icon Google (lấy từ file web của bạn)
const GoogleIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </Svg>
);

export function SignInScreen({}: SignInScreenProps) {
  const { colors, typography } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* 1. Header (Nút Back và Tiêu đề) */}
        <View style={styles.header}>
          <TouchableOpacity /* onPress={() => onNavigate('welcome')} */ style={styles.backButton}>
            <ArrowLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[typography.h2, { color: colors.foreground }]}>Đăng nhập</Text>
        </View>

        {/* 2. Form (Gói trong ScrollView để tránh bị che) */}
        <ScrollView
          contentContainerStyle={styles.formContainer}
          showsVerticalScrollIndicator={false}
        >
          <Input
            label="Email"
            placeholder="example@email.com"
            value={email}
            onChangeText={setEmail} // <-- Thay đổi ở đây
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Mật khẩu"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword} // <-- Thay đổi ở đây
            secureTextEntry // <-- Dùng prop này cho password
          />

          <TouchableOpacity /* onPress={() => onNavigate('forgot-password')} */ style={styles.forgotButton}>
            <Text style={[typography.p, { color: colors.accent, fontWeight: '600' }]}>
              Quên mật khẩu?
            </Text>
          </TouchableOpacity>

          <Button
            title="Đăng nhập"
            variant="primary"
            // onPress={handleSignIn}
            style={{ marginTop: 16 }}
          />

          {/* 3. Divider (Đường kẻ "Hoặc") */}
          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { borderColor: colors.border }]} />
            <Text style={[typography.p, styles.dividerText, { backgroundColor: colors.background, color: colors.mutedForeground }]}>
              Hoặc
            </Text>
          </View>

          {/* 4. Nút Google */}
          <TouchableOpacity
            style={[styles.googleButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            // onPress={handleGoogleSignIn}
          >
            <GoogleIcon />
            <Text style={[typography.button, { color: colors.foreground, marginLeft: 12, fontWeight: '600' }]}>
              Đăng nhập bằng Google
            </Text>
          </TouchableOpacity>

          {/* 5. Nút chuyển sang Sign Up */}
          <View style={styles.footerNav}>
            <Text style={[typography.p, { color: colors.mutedForeground }]}>
              Chưa có tài khoản?{' '}
            </Text>
            <TouchableOpacity /* onPress={() => onNavigate('signup')} */>
              <Text style={[typography.p, { color: colors.accent, fontWeight: '600' }]}>
                Đăng ký ngay
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginRight: 8,
  },
  formContainer: {
    flexGrow: 1,
    paddingHorizontal: 24, // px-6
    paddingVertical: 16,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24, // my-6
  },
  dividerLine: {
    flex: 1,
    height: 1,
    borderBottomWidth: 1,
  },
  dividerText: {
    paddingHorizontal: 16, // px-4
    position: 'absolute',
    alignSelf: 'center',
  },
  googleButton: {
    height: 50,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
});