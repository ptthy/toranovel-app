// src/screens/auth/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeProvider';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ArrowLeft, KeyRound } from 'lucide-react-native';

export function ForgotPasswordScreen({}: {}) {
  const { colors, typography, theme } = useTheme();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  // Hardcode màu Green, vì không có trong theme
  const successColors = {
   background: theme === 'light' ? '#E6F7E9' : '#0F3A1A',
    border: theme === 'light' ? '#B2DDBB' : '#1A532C',
    text: theme === 'light' ? '#2D6F47' : '#A7D9B9',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. Header */}
      <View style={styles.header}>
        <TouchableOpacity /* onPress={() => onNavigate('signin')} */ style={styles.backButton}>
          <ArrowLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[typography.h2, { color: colors.foreground }]}>Quên mật khẩu</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* 2. Icon và Text */}
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

        {/* 3. Form hoặc Thông báo Success */}
        {!sent ? (
          <View style={styles.formView}>
            <Input
              label="Email"
              placeholder="example@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button
              title="Gửi mã OTP đặt lại mật khẩu"
              variant="primary"
              // onPress={handleSend}
              disabled={!email}
              style={{ marginTop: 16, opacity: !email ? 0.5 : 1 }}
            />
          </View>
        ) : (
          <View style={styles.successContainer}>
            <View
              style={[
                styles.successBox,
                {
                  backgroundColor: successColors.background,
                  borderColor: successColors.border,
                },
              ]}
            >
              <Text style={[typography.p, { color: successColors.text, fontWeight: '500' }]}>
                Mã OTP đã được gửi đến email của bạn!
              </Text>
            </View>
            <Text style={[typography.p, styles.subtitle, { color: colors.mutedForeground }]}>
              Vui lòng kiểm tra hộp thư và làm theo hướng dẫn{'\n'}
              để đặt lại mật khẩu.
            </Text>
          </View>
        )}
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
  formView: {
    width: '100%',
  },
  successContainer: {
    width: '100%',
    alignItems: 'center',
  },
  successBox: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
});