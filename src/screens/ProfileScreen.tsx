import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeProvider';
import { Image } from 'expo-image';
import { Separator } from '../components/ui/Separator';
import { Button } from '../components/ui/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, LogOut, Edit, Settings, Coins } from 'lucide-react-native';

// 1. Import hook và Type
import { useNavigation } from '@react-navigation/native';
import { MainTabScreenProps } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext'; // <-- Import Auth

export function ProfileScreen() {
  const { colors, typography, theme } = useTheme();
  
  // 2. Lấy navigation và auth
  const navigation = useNavigation<MainTabScreenProps<'Profile'>['navigation']>();
  const { signOut } = useAuth();
  
  const xuBalance = 120;
  const gradientColors =
    theme === 'light'
      ? ['#1E5162', '#2C6B7C'] as const
      : ['#1A3D49', '#1E5162'] as const;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[typography.h2, { color: colors.foreground }]}>Cá nhân</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Card */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {/* ... (Code Profile Header) ... */}
          <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.muted }]}>
            <Edit size={18} color={colors.foreground} />
            <Text style={[typography.button, { color: colors.foreground, fontWeight: '500', marginLeft: 8 }]}>
              Chỉnh sửa hồ sơ
            </Text>
          </TouchableOpacity>
        </View>

        {/* Xu Card */}
        <LinearGradient colors={gradientColors} style={styles.xuCard}>
          {/* ... (Code Xu Header) ... */}
          <Button
            title="Nạp xu"
            // 3. Sửa onPress
            onPress={() => navigation.navigate('TopUp')}
            style={styles.topupButton}
            textStyle={styles.topupButtonText}
          />
        </LinearGradient>

        {/* Settings Card */}
        <View style={[styles.card, { backgroundColor: colors.card, paddingVertical: 0 }]}>
          <View style={styles.settingsHeader}>
            <Text style={[typography.h4, { color: colors.foreground }]}>Cài đặt</Text>
          </View>
          <Separator />
          <TouchableOpacity 
            style={styles.menuItem}
            // 3. Sửa onPress
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
          // 3. Sửa onPress
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
  avatar: { width: 80, height: 80, borderRadius: 40 },
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