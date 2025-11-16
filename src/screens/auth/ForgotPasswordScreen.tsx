import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeProvider';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowLeft, KeyRound } from 'lucide-react-native';

// 1. Import hook, type và service
import { useNavigation } from '@react-navigation/native';
import { AuthScreenProps } from '../../navigation/types';

import axios from 'axios';
import { authService } from '../../api/authService';

export function ForgotPasswordScreen() {
  const { colors, typography } = useTheme();
  const navigation = useNavigation<AuthScreenProps<'ForgotPassword'>['navigation']>();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOTP = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      // 2. Gọi API forgotPassword
      await authService.forgotPassword({ email });

      // 3. Nếu thành công, chuyển sang màn hình ResetPassword
      navigation.navigate('ResetPassword', { email: email });

    } catch (e) {
      const apiError = axios.isAxiosError(e)
        ? e.response?.data?.message
        : 'Đã xảy ra lỗi.';
      setError(apiError || 'Email không tồn tại hoặc có lỗi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[typography.h2, { color: colors.foreground }]}>Quên mật khẩu</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Icon và Text */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconBackground, { backgroundColor: colors.muted }]}>
            <KeyRound size={36} color={colors.foreground} />
          </View>
        </View>
        <Text style={[typography.h3, styles.title, { color: colors.foreground }]}>
          Đặt lại mật khẩu
        </Text>
        <Text style={[typography.p, styles.subtitle, { color: colors.mutedForeground }]}>
          Nhập email của bạn để nhận mã OTP{'\n'}
          đặt lại mật khẩu
        </Text>

        {/* Form (Không có logic 'sent' nữa) */}
        <View style={styles.formView}>
          <Input
            label="Email"
            placeholder="example@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <Button
            title="Gửi mã OTP" // Đổi tên nút
            variant="primary"
            onPress={handleSendOTP} // 4. Gắn hàm
            loading={isLoading}
            disabled={!email}
            style={{ marginTop: 16, opacity: !email ? 0.5 : 1 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ... (Styles)
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: { padding: 8, marginLeft: -8, marginRight: 8 },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { textAlign: 'center', marginBottom: 12 },
  subtitle: { textAlign: 'center', marginBottom: 24 },
  formView: {
    width: '100%',
  },
  errorText: {
    color: '#DC3545',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
});