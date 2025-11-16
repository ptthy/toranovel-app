import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeProvider';
import { Separator } from '../components/ui/Separator';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Moon, Sun, Lock, ChevronRight, Mail } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { profileService } from '../api/profileService';

export function SettingsScreen() {
  const { colors, typography, theme, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const { fetchUserProfile } = useAuth(); // Để refresh email

  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập OTP
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');

  // 1. Gửi OTP để đổi email
  const handleChangeEmail = async () => {
    setIsLoading(true);
    try {
      await profileService.requestEmailChange({ newEmail });
      setStep(2); // Chuyển sang bước nhập OTP
    } catch (e) {
      const apiError = axios.isAxiosError(e) ? e.response?.data?.message : 'Đã xảy ra lỗi.';
      Alert.alert('Lỗi', apiError);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Xác thực OTP
  const handleVerifyEmail = async () => {
    setIsLoading(true);
    try {
      await profileService.verifyEmailChange({ otp });
      await fetchUserProfile(); // Cập nhật email mới trong Context
      
      Alert.alert('Thành công', 'Email của bạn đã được thay đổi.');
      setModalVisible(false);
      setNewEmail('');
      setOtp('');
      setStep(1);

    } catch (e) {
      const apiError = axios.isAxiosError(e) ? e.response?.data?.message : 'OTP không hợp lệ.';
      Alert.alert('Lỗi', apiError);
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setModalVisible(false);
    setIsLoading(false);
    setStep(1);
    setNewEmail('');
    setOtp('');
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <ArrowLeft size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[typography.h4, { color: colors.foreground }]}>Cài đặt</Text>
        <View style={styles.headerButton} />{/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Giao diện */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Text style={[typography.h4, { color: colors.foreground }]}>Giao diện</Text>
          </View>
          <Separator />
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              {theme === 'light' ? (
                <Moon size={20} color={colors.mutedForeground} />
              ) : (
                <Sun size={20} color={colors.mutedForeground} />
              )}
              <Text style={[typography.body, { color: colors.foreground, marginLeft: 12 }]}>
                Chế độ tối
              </Text>
            </View>
            <Switch
              trackColor={{ false: colors.muted, true: colors.primary }}
              thumbColor={colors.background}
              onValueChange={toggleTheme}
              value={theme === 'dark'}
            />
          </View>
        </View>

        {/* Tài khoản & Bảo mật */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Text style={[typography.h4, { color: colors.foreground }]}>Tài khoản & Bảo mật</Text>
          </View>
          <Separator />
          <TouchableOpacity style={styles.menuItem} onPress={() => { /* Bạn tự thêm logic đổi mật khẩu */ }}>
            <View style={styles.menuItemLeft}>
              <Lock size={20} color={colors.mutedForeground} />
              <Text style={[typography.body, { color: colors.foreground, marginLeft: 12 }]}>
                Thay đổi mật khẩu
              </Text>
            </View>
            <ChevronRight size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
          <Separator />
          <TouchableOpacity style={styles.menuItem} onPress={() => setModalVisible(true)}>
            <View style={styles.menuItemLeft}>
              <Mail size={20} color={colors.mutedForeground} />
              <Text style={[typography.body, { color: colors.foreground, marginLeft: 12 }]}>
                Thay đổi Email
              </Text>
            </View>
            <ChevronRight size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal để Đổi Email */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={resetModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity onPress={resetModal} style={styles.closeButton}>
              <Text style={{ color: colors.mutedForeground }}>X</Text>
            </TouchableOpacity>
            
            <Mail size={32} color={colors.primary} />
            
            {step === 1 && (
              <>
                <Text style={[typography.h3, { color: colors.foreground, marginTop: 12, marginBottom: 8 }]}>
                  Thay đổi Email
                </Text>
                <Text style={[typography.p, { color: colors.mutedForeground, textAlign: 'center', marginBottom: 16 }]}>
                  Nhập email mới. Chúng tôi sẽ gửi mã OTP đến đó.
                </Text>
                <Input
                  label="Email mới"
                  value={newEmail}
                  onChangeText={setNewEmail}
                  keyboardType="email-address"
                />
                <Button title="Gửi mã OTP" loading={isLoading} onPress={handleChangeEmail} />
              </>
            )}
            
            {step === 2 && (
              <>
                <Text style={[typography.h3, { color: colors.foreground, marginTop: 12, marginBottom: 8 }]}>
                  Nhập mã OTP
                </Text>
                <Text style={[typography.p, { color: colors.mutedForeground, textAlign: 'center', marginBottom: 16 }]}>
                  Mã OTP đã được gửi đến {newEmail}.
                </Text>
                <Input
                  label="Mã OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="numeric"
                  maxLength={6}
                />
                <Button title="Xác nhận" loading={isLoading} onPress={handleVerifyEmail} />
              </>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { borderBottomWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, elevation: 2 },
  headerButton: { padding: 4, width: 40 },
  container: { padding: 16, gap: 16 },
  card: { borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, elevation: 2, overflow: 'hidden' },
  cardHeader: { padding: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  // Modal styles
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { borderRadius: 16, padding: 24, alignItems: 'center', width: '100%', borderWidth: 1, position: 'relative' },
  closeButton: { position: 'absolute', top: 12, right: 16, padding: 4 },
});