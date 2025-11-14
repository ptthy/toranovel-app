// src/screens/auth/SignUpScreen.tsx
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
import { Input } from '../../components/ui/Input';
import { ArrowLeft } from 'lucide-react-native';

// Tạm thời
type SignUpScreenProps = {
  // onNavigate: (page: string) => void;
};

export function SignUpScreen({}: SignUpScreenProps) {
  const { colors, typography } = useTheme();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* 1. Header */}
        <View style={styles.header}>
          <TouchableOpacity /* onPress={() => onNavigate('welcome')} */ style={styles.backButton}>
            <ArrowLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[typography.h2, { color: colors.foreground }]}>Đăng ký</Text>
        </View>

        {/* 2. Form */}
        <ScrollView
          contentContainerStyle={styles.formContainer}
          showsVerticalScrollIndicator={false}
        >
          <Input
            label="Tên người dùng"
            placeholder="nguyenvana"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <Input
            label="Email"
            placeholder="example@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Mật khẩu"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Input
            label="Xác nhận mật khẩu"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Button
            title="Đăng ký"
            variant="primary"
            // onPress={handleSignUp}
            style={{ marginTop: 16 }}
          />

          {/* 3. Nút chuyển sang Sign In */}
          <View style={styles.footerNav}>
            <Text style={[typography.p, { color: colors.mutedForeground }]}>
              Đã có tài khoản?{' '}
            </Text>
            <TouchableOpacity /* onPress={() => onNavigate('signin')} */>
              <Text style={[typography.p, { color: colors.accent, fontWeight: '600' }]}>
                Đăng nhập
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
  footerNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
});