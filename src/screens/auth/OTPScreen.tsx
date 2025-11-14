// src/screens/auth/OTPScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeProvider';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Mail } from 'lucide-react-native';

// Import thư viện OTP vừa cài
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';

const CELL_COUNT = 6; // 6 ô OTP

export function OTPScreen({}: {}) {
  const { colors, typography } = useTheme();
  const [otp, setOtp] = useState('');

  // Tự động focus vào ô
  const ref = useBlurOnFulfill({ value: otp, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: otp,
    setValue: setOtp,
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. Header */}
      <View style={styles.header}>
        <TouchableOpacity /* onPress={() => onNavigate('signup')} */ style={styles.backButton}>
          <ArrowLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[typography.h2, { color: colors.foreground }]}>Xác thực OTP</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* 2. Icon và Text */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconBackground, { backgroundColor: colors.muted }]}>
            <Mail size={36} color={colors.foreground} />
          </View>
        </View>
        <Text style={[typography.h3, styles.title, { color: colors.foreground }]}>
          Nhập mã OTP
        </Text>
        <Text style={[typography.p, styles.subtitle, { color: colors.mutedForeground }]}>
          Mã OTP đã được gửi đến email của bạn.{'\n'}
          Vui lòng kiểm tra hộp thư.
        </Text>

        {/* 3. Ô nhập OTP */}
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

        {/* 4. Nút bấm */}
        <Button
          title="Xác nhận"
          variant="primary"
          // onPress={handleVerify}
          disabled={otp.length !== CELL_COUNT}
          style={{ marginTop: 24, opacity: otp.length !== CELL_COUNT ? 0.5 : 1 }}
        />

        {/* 5. Gửi lại */}
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