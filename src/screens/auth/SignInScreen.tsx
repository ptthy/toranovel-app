import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert, // <-- 1. Import Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArrowLeft } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

// 2. Import hook điều hướng và Auth
import { useNavigation } from '@react-navigation/native';
import { AuthScreenProps } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeProvider';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Eye, EyeOff } from 'lucide-react-native';
// (Component GoogleIcon giữ nguyên)
const GoogleIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">

  </Svg>
);

export function SignInScreen() {
  const { colors, typography } = useTheme();
  const navigation = useNavigation<AuthScreenProps<'SignIn'>['navigation']>();
  
  // 4. Lấy hàm signIn từ Context
  const { signIn } = useAuth(); 

  // 5. Thêm state cho loading và lỗi
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // State để báo lỗi
const [showPassword, setShowPassword] = useState(false);

  // 6. Tạo hàm handleSignIn
  const handleSignIn = async () => {
    if (isLoading) return; // Không cho bấm nhiều lần

    setIsLoading(true);
    setError(null); // Xóa lỗi cũ

    try {
      // Gọi hàm signIn từ Context
      const success = await signIn(email, password);

      if (!success) {
        // Nếu AuthContext trả về false (đăng nhập thất bại)
        setError('Email hoặc mật khẩu không chính xác.');
      }
      // Nếu success = true, AuthContext sẽ tự động
      // đổi state và RootNavigator sẽ chuyển màn hình.
      // Chúng ta không cần làm gì thêm.

    } catch (e) {
      console.error(e); // Log lỗi chi tiết
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false); // Luôn tắt loading
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* 1. Header (Nút Back và Tiêu đề) */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[typography.h2, { color: colors.foreground }]}>Đăng nhập</Text>
        </View>

        {/* 2. Form */}
        <ScrollView
          contentContainerStyle={styles.formContainer}
          showsVerticalScrollIndicator={false}
        >
          <Input
            label="Email hoặc Username"
            placeholder="example@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
         <Input
  label="Mật khẩu"
  placeholder="Nhập mật khẩu"
  value={password}
  onChangeText={setPassword}
  secureTextEntry={!showPassword}
  rightAdornment={
    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
      {showPassword ? (
        <EyeOff size={20} color={colors.mutedForeground} />
      ) : (
        <Eye size={20} color={colors.mutedForeground} />
      )}
    </TouchableOpacity>
  }
/>

          <TouchableOpacity 
            onPress={() => navigation.navigate('ForgotPassword')} // <-- Sửa luôn nút này
            style={styles.forgotButton}
          >
            <Text style={[typography.p, { color: colors.accent, fontWeight: '600' }]}>
              Quên mật khẩu?
            </Text>
          </TouchableOpacity>

          {/* 7. Hiển thị lỗi (nếu có) */}
          {error && (
            <Text style={styles.errorText}>
              {error}
            </Text>
          )}

          <Button
            title="Đăng nhập"
            variant="primary"
            onPress={handleSignIn} // <-- 8. Gắn hàm handleSignIn
            loading={isLoading}    // <-- 9. Thêm prop loading
            style={{ marginTop: 16 }}
          />


          {/* 10. Nút chuyển sang Sign Up (Sửa luôn) */}
          <View style={styles.footerNav}>
            <Text style={[typography.p, { color: colors.mutedForeground }]}>
              Chưa có tài khoản?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  // 11. Thêm style cho ErrorText
  errorText: {
    color: '#DC3545', // Màu đỏ báo lỗi
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    borderBottomWidth: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
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