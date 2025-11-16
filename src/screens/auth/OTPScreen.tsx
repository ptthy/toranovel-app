import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeProvider';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';

// 1. Import hook, type, service và Auth
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthScreenProps } from '../../navigation/types';

import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../api/authService';

const CELL_COUNT = 6;

export function OTPScreen() {
  const { colors, typography } = useTheme();
  const navigation = useNavigation<AuthScreenProps<'OTP'>['navigation']>();
  
  // 2. Lấy `email` được truyền từ SignUpScreen
  const route = useRoute<AuthScreenProps<'OTP'>['route']>();
  const email = route.params.email; // Đây là email của người dùng

  // 3. Lấy hàm signIn (để tự động đăng nhập)
  const { signIn } = useAuth(); // Chúng ta sẽ dùng signIn "giả" để đổi state

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const ref = useBlurOnFulfill({ value: otp, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: otp,
    setValue: setOtp,
  });

  // 4. Tạo hàm Handle Verify
  const handleVerify = async () => {
    if (otp.length !== CELL_COUNT) return;
    setIsLoading(true);

    try {
      // Gọi API verifyOtp
      const response = await authService.verifyOtp({ email, otp });

      // API này (theo authService.ts) không trả về token.
      // Nó chỉ xác nhận tài khoản.
      // Vì vậy, ta báo thành công và quay lại màn hình Đăng nhập.
      
      Alert.alert(
        'Thành công!',
        'Tài khoản của bạn đã được xác thực. Vui lòng đăng nhập.',
        [{ text: 'OK', onPress: () => navigation.navigate('SignIn') }]
      );
      
      // Nâng cao: Nếu API verifyOtp có trả về token,
      // bạn có thể gọi hàm "signIn" tại đây để đăng nhập luôn.

    } catch (e) {
      if (axios.isAxiosError(e)) {
        Alert.alert('Lỗi', e.response?.data?.message || 'Mã OTP không hợp lệ.');
      } else {
        Alert.alert('Lỗi', 'Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[typography.h2, { color: colors.foreground }]}>Xác thực OTP</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconBackground, { backgroundColor: colors.muted }]}>
            <Mail size={36} color={colors.foreground} />
          </View>
        </View>
        <Text style={[typography.h3, styles.title, { color: colors.foreground }]}>
          Nhập mã OTP
        </Text>
        <Text style={[typography.p, styles.subtitle, { color: colors.mutedForeground }]}>
          Mã OTP đã được gửi đến email:{'\n'}
          <Text style={{ fontWeight: 'bold', color: colors.foreground }}>{email}</Text>
        </Text>

        <CodeField
          ref={ref}
          {...props}
          value={otp}
          onChangeText={setOtp}
          cellCount={CELL_COUNT}
          rootStyle={styles.codeFieldRoot}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          renderCell={({ index, symbol, isFocused }) => (
            <View
              key={index}
              style={[
                styles.cell,
                {
                  borderColor: isFocused ? colors.ring : colors.border,
                  backgroundColor: colors.input,
                },
              ]}
              onLayout={getCellOnLayoutHandler(index)}
            >
              <Text style={[typography.h2, { color: colors.foreground }]}>
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            </View>
          )}
        />

        <Button
          title="Xác nhận"
          variant="primary"
          onPress={handleVerify} // <-- 5. Gắn hàm
          loading={isLoading}    // <-- 6. Gắn loading
          disabled={otp.length !== CELL_COUNT}
          style={{ marginTop: 24, opacity: otp.length !== CELL_COUNT ? 0.5 : 1 }}
        />
        <View style={styles.resendContainer}>
          <Text style={[typography.p, { color: colors.mutedForeground, marginBottom: 8 }]}>
            Không nhận được mã?
          </Text>
          <TouchableOpacity /* onPress={handleResend} */>
            <Text style={[typography.p, { color: colors.accent, fontWeight: '600' }]}>
              Gửi lại mã OTP
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

     

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
    width: 80, // w-20
    height: 80, // h-20
    borderRadius: 40, // rounded-full
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { textAlign: 'center', marginBottom: 12 },
  subtitle: { textAlign: 'center', marginBottom: 24 },
  codeFieldRoot: {
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-between',
  },
  cell: {
    width: 50, // Gần bằng w-12
    height: 60, // Gần bằng h-14
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
  },
  resendContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
});