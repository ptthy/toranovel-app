import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeProvider';
import { Button } from '../../components/ui/Button';
import { BookOpen } from 'lucide-react-native';

// 1. Import hook và Type
import { useNavigation } from '@react-navigation/native';
import { AuthScreenProps } from '../../navigation/types';

export function WelcomeScreen() { // 2. Đã xóa prop
  const { colors, typography } = useTheme();
  
  // 3. Lấy navigation từ hook
  const navigation = useNavigation<AuthScreenProps<'Welcome'>['navigation']>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoBackground, { backgroundColor: colors.primary }]}>
            <BookOpen size={48} color={colors.background} />
          </View>
        </View>
        <Text style={[typography.h1, styles.title, { color: colors.foreground }]}>
          ToraNovel Reader
        </Text>
        <Text style={[typography.p, styles.subtitle, { color: colors.mutedForeground }]}>
          Khám phá hàng ngàn light novel{'\n'}
          và truyện tranh hấp dẫn
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Đăng nhập"
          variant="primary"
          // 4. Sửa onPress
          onPress={() => navigation.navigate('SignIn')}
        />
        <View style={{ height: 16 }} />
        <Button
          title="Đăng ký"
          variant="outline"
          // 4. Sửa onPress
          onPress={() => navigation.navigate('SignUp')}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[typography.p, { color: colors.mutedForeground, fontSize: 12, textAlign: 'center' }]}>
          Bằng cách tiếp tục, bạn đồng ý với{'\n'}
          <Text style={{ color: colors.accent, textDecorationLine: 'underline' }}>
            Điều khoản dịch vụ
          </Text>
          {' và '}
          <Text style={{ color: colors.accent, textDecorationLine: 'underline' }}>
            Chính sách bảo mật
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24, // px-6
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoBackground: {
    width: 96, // w-24
    height: 96, // h-24
    borderRadius: 24, // rounded-3xl
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12, // mb-3
  },
  subtitle: {
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: 24,
  },
  footer: {
    paddingBottom: 16,
  },
});