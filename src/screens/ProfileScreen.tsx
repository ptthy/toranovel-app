import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  Settings,
  Bell,
  Library,
  History,
  ChevronRight,
  LogOut,
  Camera,
  UserPen,
  Crown,
  Wallet,
  ShieldCheck, 
  Users,
  Calendar,
} from "lucide-react-native";
import * as ImagePicker from 'expo-image-picker'; 

import { useTheme } from "../contexts/ThemeProvider";
import { useAuth } from "../contexts/AuthContext";
import { storyService } from "../api/storyService"; 
import { MainStackParamList } from "../navigation/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// 1. Import Modal (Hãy chắc chắn đường dẫn đúng với cấu trúc thư mục của bạn)
import { FollowedAuthorsModal } from "../components/ui/FollowedAuthorsModal"; // <--- THÊM DÒNG NÀY

const getRoleBadgeConfig = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin": return { label: "Quản trị viên", color: "#E74C3C", bg: "#FDEDEC" };
    case "author": return { label: "Tác giả", color: "#8E44AD", bg: "#F4ECF7" };
    case "reader": return { label: "Độc giả", color: "#2980B9", bg: "#EBF5FB" };
    default: return { label: role, color: "#7F8C8D", bg: "#F2F3F4" };
  }
};

export function ProfileScreen() {
  const { colors, typography } = useTheme();
  const { user, signOut, fetchUserProfile, uploadAvatar } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const [isPremium, setIsPremium] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // 2. Thêm state để bật tắt Modal
  const [showFollowedModal, setShowFollowedModal] = useState(false); // <--- THÊM DÒNG NÀY

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    await fetchUserProfile();
    const premiumStatus = await storyService.checkPremiumStatus();
    setIsPremium(premiumStatus);
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", style: "destructive", onPress: signOut },
    ]);
  };

  const handlePickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Lỗi", "Cần quyền truy cập thư viện ảnh để đổi Avatar.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0].uri) {
        setUploading(true);
        const success = await uploadAvatar(result.assets[0].uri);
        setUploading(false);
        if (success) Alert.alert("Thành công", "Đã cập nhật ảnh đại diện!");
        else Alert.alert("Lỗi", "Không thể cập nhật ảnh đại diện.");
      }
    } catch (error) {
      console.error(error);
      setUploading(false);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi chọn ảnh.");
    }
  };

  const handleNavigateEdit = () => {
    navigation.navigate("EditProfile");
  };

  const MenuItem = ({ icon: Icon, label, onPress, isDestructive = false }: any) => (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.iconBox, { backgroundColor: isDestructive ? "#FDEDEC" : colors.background }]}>
          <Icon size={20} color={isDestructive ? "#E74C3C" : colors.primary} />
        </View>
        <Text style={[typography.p, { color: isDestructive ? "#E74C3C" : colors.foreground, fontWeight: "600", marginLeft: 12 }]}>
          {label}
        </Text>
      </View>
      <ChevronRight size={20} color={colors.mutedForeground} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
      <View style={styles.topBar}>
          <Text style={[typography.h3, { color: colors.foreground }]}>Cá nhân</Text>
          <TouchableOpacity onPress={handleNavigateEdit} style={styles.topBarBtn}>
              <UserPen size={22} color={colors.primary} />
          </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* --- INFO SECTION --- */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {uploading ? (
                 <View style={[styles.avatar, {justifyContent: 'center', alignItems: 'center', backgroundColor: '#ddd'}]}>
                      <ActivityIndicator color={colors.primary} />
                 </View>
            ) : (
                <Image
                  source={{ uri: user?.avatarUrl || "https://i.pravatar.cc/150?img=12" }}
                  style={styles.avatar}
                />
            )}
            
            <TouchableOpacity 
                style={[styles.cameraBadge, { backgroundColor: colors.primary, borderColor: colors.background }]}
                onPress={handlePickAvatar}
            >
                <Camera size={14} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text style={[typography.h3, { color: colors.foreground, marginTop: 12 }]}>
            {user?.username || "Người dùng"}
          </Text>

          <Text style={[typography.p, { color: colors.mutedForeground, fontSize: 13 }]}>
            {user?.email}
          </Text>

          {user?.bio ? (
            <Text style={{ color: colors.foreground, textAlign: 'center', marginTop: 8, paddingHorizontal: 20, fontStyle: 'italic' }}>
              "{user.bio}"
            </Text>
          ) : (
            <Text style={{ color: colors.mutedForeground, textAlign: 'center', marginTop: 8, fontSize: 12 }}>
              Chưa có giới thiệu
            </Text>
          )}

          <View style={{flexDirection: 'row', gap: 16, marginTop: 8}}>
             {user?.dateOfBirth && (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Calendar size={12} color={colors.mutedForeground} />
                    <Text style={{fontSize: 12, color: colors.mutedForeground, marginLeft: 4}}>
                        {new Date(user.dateOfBirth).toLocaleDateString('vi-VN')}
                    </Text>
                </View>
             )}
          </View>

          <View style={styles.badgeRow}>
            {user?.roles && user.roles.map((role: string, index: number) => {
                const conf = getRoleBadgeConfig(role);
                return (
                    <View key={index} style={[styles.badge, { backgroundColor: conf.bg }]}>
                        <ShieldCheck size={12} color={conf.color} />
                        <Text style={[styles.badgeText, { color: conf.color }]}>{conf.label}</Text>
                    </View>
                );
            })}
            {isPremium && (
              <View style={[styles.badge, { backgroundColor: "#FFF8E1" }]}>
                <Crown size={12} color="#F1C40F" fill="#F1C40F" />
                <Text style={[styles.badgeText, { color: "#F39C12" }]}>Premium</Text>
              </View>
            )}
          </View>
        </View>

        {/* --- WALLET --- */}
        <View style={[styles.walletCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View>
                <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>Số dư khả dụng</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Text style={{ fontSize: 24, fontWeight: '800', color: colors.primary }}>
                        {user?.dias?.toLocaleString() || 0}
                    </Text>
                    <Wallet size={20} color={colors.primary} style={{ marginLeft: 8 }} />
                </View>
            </View>
            <TouchableOpacity 
                style={[styles.topUpBtn, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate("TopUp")}
            >
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>Nạp ngay</Text>
            </TouchableOpacity>
        </View>

        {/* --- ACTIONS --- */}
        <Text style={[typography.h4, { color: colors.foreground, marginVertical: 16, marginLeft: 4 }]}>Tiện ích</Text>

        <View style={styles.menuSection}>
          <MenuItem icon={Bell} label="Thông báo" onPress={() => navigation.navigate("Notification")} />
          
          {/* 3. Sửa sự kiện onPress để mở Modal */}
          <MenuItem 
            icon={Users} 
            label="Đang theo dõi" 
            onPress={() => setShowFollowedModal(true)} // <--- SỬA DÒNG NÀY
          />
          
          <MenuItem icon={Library} label="Thư viện của tôi" onPress={() => navigation.navigate("MainTabs", { screen: "Library" })} />
          <MenuItem icon={History} label="Lịch sử giao dịch" onPress={() => navigation.navigate("MainTabs", { screen: "History" })} />
          <MenuItem icon={Settings} label="Cài đặt" onPress={() => navigation.navigate("Settings")} />
        </View>

        <View style={{ marginTop: 24 }}>
             <MenuItem icon={LogOut} label="Đăng xuất" onPress={handleLogout} isDestructive />
        </View>
        
        <Text style={{ textAlign: 'center', color: colors.mutedForeground, fontSize: 10, marginTop: 32 }}>
            Phiên bản 1.0.0
        </Text>

      </ScrollView>

      {/* 4. Render Modal ở cuối SafeAreaView */}
      <FollowedAuthorsModal 
        visible={showFollowedModal} 
        onClose={() => setShowFollowedModal(false)} 
      />
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  topBarBtn: {
    padding: 8,
  },
  scrollContent: { padding: 20, paddingTop: 0 },
  header: { alignItems: "center", marginBottom: 20 },
  avatarContainer: { position: "relative" },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: "#fff" },
  cameraBadge: { 
    position: "absolute", 
    bottom: 0, 
    right: 0, 
    padding: 6, 
    borderRadius: 20, 
    borderWidth: 2 
  },
  badgeRow: { flexDirection: "row", marginTop: 12, gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  badge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  walletCard: { padding: 16, borderRadius: 16, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 1 },
  topUpBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  menuSection: { gap: 12 },
  menuItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderRadius: 12, borderWidth: 1 },
  menuLeft: { flexDirection: "row", alignItems: "center" },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
});