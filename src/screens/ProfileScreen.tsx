import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeProvider';
import { Image } from 'expo-image';
import { Separator } from '../components/ui/Separator';
import { Button } from '../components/ui/Button';
import { LinearGradient } from 'expo-linear-gradient';
// Thay Coins bằng Diamond
import { ChevronRight, LogOut, Edit, Settings, Diamond, Camera } from 'lucide-react-native';

import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MainTabScreenProps } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext'; 

import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from '@react-native-vector-icons/material-icons';

export function ProfileScreen() {
  const { colors, typography, theme } = useTheme();
  const navigation = useNavigation<MainTabScreenProps<'Profile'>['navigation']>();
  
  // Lấy thêm hàm fetchUserProfile để cập nhật số dư
  const { user, signOut, uploadAvatar, fetchUserProfile } = useAuth();
  
  const [isUploading, setIsUploading] = useState(false);

  // TỰ ĐỘNG CẬP NHẬT SỐ DƯ KHI QUAY LẠI MÀN HÌNH NÀY
  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [])
  );

  const gradientColors =
    theme === 'light'
      ? ['#1E5162', '#2C6B7C'] as const
      : ['#1A3D49', '#1E5162'] as const;

  const handleAvatarPress = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Cần quyền', 'Vui lòng cấp quyền truy cập thư viện ảnh để đổi avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setIsUploading(true);
      const uri = result.assets[0].uri;
      
      const success = await uploadAvatar(uri);
      
      if (!success) {
        Alert.alert('Lỗi', 'Upload ảnh thất bại. Vui lòng thử lại.');
      }
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[typography.h2, { color: colors.foreground }]}>Cá nhân</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Card */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.profileHeader}>
            <TouchableOpacity onPress={handleAvatarPress} disabled={isUploading}>
              <Image
                source={user?.avatarUrl ? { uri: user.avatarUrl } : null}
                style={styles.avatar}
              />
              <View style={styles.avatarOverlay}>
                {isUploading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Camera size={16} color="#FFF" />
                )}
              </View>
            </TouchableOpacity>
            
            <View style={styles.flex}>
              <Text style={[typography.h3, { color: colors.foreground }]}>{user?.username || 'Đang tải...'}</Text>
              <Text style={[typography.p, { color: colors.mutedForeground, marginTop: 4 }]}>
                {user?.email || ''}
              </Text>
            </View>
          </View>
          <Text style={[typography.p, { color: colors.mutedForeground, marginVertical: 16 }]}>
            {user?.bio || 'Chưa có tiểu sử.'}
          </Text>
          
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: colors.muted }]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Edit size={18} color={colors.foreground} />
            <Text style={[typography.button, { color: colors.foreground, fontWeight: '500', marginLeft: 8 }]}>
              Chỉnh sửa hồ sơ
            </Text>
          </TouchableOpacity>
        </View>

        {/* === THAY ĐỔI Ở ĐÂY: Dias Card === */}
        <LinearGradient colors={gradientColors} style={styles.xuCard}>
          <View style={styles.xuHeader}>
            <View style={styles.xuTitle}>
              {/* Icon Kim Cương */}
            <MaterialIcons name="diamond" size={24} color="#FFFF" />
              {/* Đổi chữ thành Dias */}
              <Text style={[typography.p, { color: '#F7F3E8', marginLeft: 8, fontWeight: '600' }]}>Dias</Text>
            </View>
            {/* Hiển thị số Dias thực từ User (nếu chưa có thì hiện 0) */}
            <Text style={[typography.h1, { color: '#F7F3E8', fontWeight: '700' }]}>
              {user?.dias ? user.dias.toLocaleString() : '0'}
            </Text>
          </View>
          <Button
            // Đổi chữ thành Nâng cấp gói
            title="Nâng cấp gói"
            onPress={() => navigation.navigate('TopUp')}
            style={styles.topupButton}
            textStyle={styles.topupButtonText}
          />
        </LinearGradient>
        {/* ================================= */}

        {/* Settings Card */}
        <View style={[styles.card, { backgroundColor: colors.card, paddingVertical: 0 }]}>
          <View style={styles.settingsHeader}>
            <Text style={[typography.h4, { color: colors.foreground }]}>Cài đặt</Text>
          </View>
          <Separator />
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={styles.menuItemLeft}>
              <Settings size={20} color={colors.mutedForeground} />
              <Text style={[typography.body, { color: colors.foreground, marginLeft: 12 }]}>
                Cài đặt ứng dụng
              </Text>
            </View>
            <ChevronRight size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[typography.h4, { color: colors.foreground, marginBottom: 16 }]}>Thống kê</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[typography.h2, { color: colors.foreground, fontWeight: '600' }]}>24</Text>
              <Text style={[typography.p, { color: colors.mutedForeground, fontSize: 11 }]}>Đang đọc</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[typography.h2, { color: colors.foreground, fontWeight: '600' }]}>156</Text>
              <Text style={[typography.p, { color: colors.mutedForeground, fontSize: 11 }]}>Đã lưu</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[typography.h2, { color: colors.foreground, fontWeight: '600' }]}>89</Text>
              <Text style={[typography.p, { color: colors.mutedForeground, fontSize: 11 }]}>Đã hoàn thành</Text>
            </View>
          </View>
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={signOut}
        >
          <LogOut size={20} color="#DC3545" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { borderBottomWidth: 1, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, elevation: 2 },
  container: { padding: 16, gap: 16 },
  card: { borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, elevation: 2 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { 
    width: 80, 
    height: 80, 
    borderRadius: 40,
    backgroundColor: '#eee', 
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  editButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 10 },
  xuCard: { borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, elevation: 5 },
  xuHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  xuTitle: { flexDirection: 'row', alignItems: 'center' },
  topupButton: { backgroundColor: '#F7F3E8', height: 44 },
  topupButtonText: { color: '#1E5162', fontWeight: '600' },
  settingsHeader: { padding: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, borderRadius: 12, borderWidth: 1 },
  logoutText: { color: '#DC3545', fontWeight: '600', fontSize: 16 },
});