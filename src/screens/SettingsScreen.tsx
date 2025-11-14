// src/screens/SettingsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeProvider';
import { Separator } from '../components/ui/Separator';
import { ArrowLeft, Moon, Sun, Lock, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
export function SettingsScreen() {
  const { colors, typography, theme, toggleTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity /* onPress={() => navigation.goBack()} */ style={styles.headerButton}>
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
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Lock size={20} color={colors.mutedForeground} />
              <Text style={[typography.body, { color: colors.foreground, marginLeft: 12 }]}>
                Thay đổi mật khẩu
              </Text>
            </View>
            <ChevronRight size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
        {/* ... (Các phần cài đặt khác) ... */}
      </ScrollView>
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
});