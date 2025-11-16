import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeProvider';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowLeft } from 'lucide-react-native';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';

// 1. Import hook, type và service
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthScreenProps } from '../../navigation/types';

import axios from 'axios';
import { authService } from '../../api/authService';


const CELL_COUNT = 6;

export function ResetPasswordScreen() {
  const { colors, typography } = useTheme();
  const navigation = useNavigation<AuthScreenProps<'ResetPassword'>['navigation']>();
  
  // 2. Lấy `email` được truyền từ ForgotPasswordScreen
  const route = useRoute<AuthScreenProps<'ResetPassword'>['route']>();
  const email = route.params.email;

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hook cho ô OTP
  const ref = useBlurOnFulfill({ value: otp, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: otp,
    setValue: setOtp,
  });

  const handleResetPassword = async () => {
    if (isLoading) return;
    
    // Kiểm tra mật khẩu khớp
    if (newPassword !== confirmNewPassword) {
      setError('Mật khẩu mới không khớp.');
      return;
    }
    if (otp.length !== CELL_COUNT) {
      setError('Vui lòng nhập đủ 6 số OTP.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 3. Gọi API resetPassword
      await authService.resetPassword({
        email,
        otp,
        newPassword,
        confirmNewPassword,
      });

      // 4. Nếu thành công, báo và quay về Đăng nhập
      Alert.alert(
        'Thành công!',
        'Mật khẩu của bạn đã được thay đổi. Vui lòng đăng nhập.',
        [{ text: 'OK', onPress: () => navigation.navigate('SignIn') }]
      );

    } catch (e) {
      const apiError = axios.isAxiosError(e)
        ? e.response?.data?.message
        : 'Đã xảy ra lỗi.';
      setError(apiError || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
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
        <Text style={[typography.h2, { color: colors.foreground }]}>Tạo Mật khẩu mới</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={[typography.p, styles.subtitle, { color: colors.mutedForeground }]}>
          Mã OTP đã được gửi đến email:{'\n'}
          <Text style={{ fontWeight: 'bold', color: colors.foreground }}>{email}</Text>
        </Text>

        {/* Ô nhập OTP */}
        <Text style={[typography.p, styles.label, { color: colors.foreground }]}>Nhập mã OTP</Text>
        <CodeField
          ref={ref}
          {...props}
          value={otp}
          onChangeText={setOtp}
          cellCount={CELL_COUNT}
          rootStyle={styles.codeFieldRoot}
          keyboardType="number-pad"
          renderCell={({ index, symbol, isFocused }) => (
            <View
              key={index}
              style={[styles.cell, { borderColor: isFocused ? colors.ring : colors.border, backgroundColor: colors.input }]}
              onLayout={getCellOnLayoutHandler(index)}
            >
              <Text style={[typography.h2, { color: colors.foreground }]}>
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            </View>
          )}
        />

        {/* Ô nhập Mật khẩu mới */}
        <Input
          label="Mật khẩu mới"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          style={styles.inputMargin}
        />
        <Input
          label="Xác nhận mật khẩu mới"
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          secureTextEntry
        />

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <Button
          title="Xác nhận"
          variant="primary"
          onPress={handleResetPassword}
          loading={isLoading}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  backButton: { padding: 8, marginLeft: -8, marginRight: 8 },
  contentContainer: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 16 },
  subtitle: { textAlign: 'center', marginBottom: 24 },
  label: { marginBottom: 8, fontWeight: '500' },
  codeFieldRoot: { marginBottom: 20 },
  cell: { width: 50, height: 60, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderRadius: 12 },
  inputMargin: { marginTop: 20 },
  errorText: { color: '#DC3545', textAlign: 'center', marginTop: 16, fontSize: 14 },
});