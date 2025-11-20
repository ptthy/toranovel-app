import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeProvider";
import {
  ArrowLeft,
  Crown,
  Zap,
  Globe,
  Mic,
} from "lucide-react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import MaterialIcons from "@react-native-vector-icons/material-icons";
import { useAuth } from "../contexts/AuthContext"; // Import Auth để cập nhật số dư
import { paymentService } from "../api/paymentService";

// --- CẤU HÌNH GÓI NẠP (MAPPING) ---
// displayPrice: Giá hiển thị lên màn hình (50k, 100k...)
// apiAmount: Giá trị gửi lên Server Backend (2k, 3k...)

const PREMIUM_PACKAGE = {
  id: "monthly_100",
  name: "Hội Viên Tháng",
  displayPrice: 100000, // Hiển thị 100k
  apiAmount: 3000,      // Gửi lên 3k (Ví dụ: Map với gói test trung bình)
  diasInstant: 1000,
  diasDaily: 50,
  features: [
    { icon: Zap, text: "Nhận 50 Dias mỗi ngày" },
    { icon: Crown, text: "Đổi nhạc nền, hiệu ứng đọc" },
    { icon: Globe, text: "Dịch truyện 4 ngôn ngữ" },
    { icon: Mic, text: "Mở khóa 2 giọng đọc AI cao cấp" },
  ],
};

const SINGLE_PACKAGES = [
  { 
    id: "single_50", 
    displayPrice: 50000, // UI hiện 50,000đ
    apiAmount: 2000,     // API nhận 2000đ -> Được 550 Dias
    dias: 550, 
    bonus: "10%" 
  },
  { 
    id: "single_100", 
    displayPrice: 100000, // UI hiện 100,000đ
    apiAmount: 3000,      // API nhận 3000đ -> Được 1150 Dias
    dias: 1150, 
    bonus: "15%" 
  },
  { 
    id: "single_200", 
    displayPrice: 200000, // UI hiện 200,000đ
    apiAmount: 4000,      // API nhận 4000đ -> Được 2400 Dias
    dias: 2400, 
    bonus: "20%" 
  },
];

export function TopUpScreen() {
  const { colors, typography } = useTheme();
  const navigation = useNavigation();
  const { user, fetchUserProfile } = useAuth(); // Lấy user và hàm refresh
  
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tự động cập nhật số dư khi quay lại màn hình này
  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchUserProfile();
    setIsRefreshing(false);
  }, []);

  // Hàm xử lý thanh toán
  const handlePayment = async (amountToSend: number) => {
    setIsLoading(true);
    try {
      // Gọi API tạo link với số tiền test (apiAmount)
      const response = await paymentService.createPaymentLink(amountToSend);
      const { checkoutUrl } = response.data;

      if (checkoutUrl) {
        const supported = await Linking.canOpenURL(checkoutUrl);
        if (supported) {
          await Linking.openURL(checkoutUrl);
        } else {
          Alert.alert("Lỗi", "Không thể mở trình duyệt thanh toán.");
        }
      } else {
        Alert.alert("Lỗi", "Không lấy được link thanh toán.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tạo giao dịch.");
    } finally {
      setIsLoading(false);
    }
  };

  // Component hiển thị giá tiền (VND)
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
           <Text style={[typography.h3, { color: colors.foreground }]}>Ưu Đãi</Text>
           <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>
             Số dư: {user?.dias || 0} 💎
           </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {/* 1. GÓI HỘI VIÊN (PREMIUM) */}
        <Text
          style={[
            typography.h4,
            styles.sectionTitle,
            { color: colors.foreground },
          ]}
        >
          Gói Tháng
        </Text>

        <TouchableOpacity
          activeOpacity={0.9}
          // UI hiển thị 100k, nhưng gửi API là 3000 (hoặc giá test khác)
          onPress={() => handlePayment(PREMIUM_PACKAGE.apiAmount)}
        >
          <LinearGradient
            colors={["#1E5162", "#2C6B7C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.premiumCard}
          >
            <View style={styles.premiumHeader}>
              <View>
                <Text style={styles.premiumTitle}>PREMIUM MONTHLY</Text>
                <Text style={styles.premiumSubtitle}>
                  Nhận ngay {PREMIUM_PACKAGE.diasInstant} Dias
                </Text>
              </View>
              <View style={styles.priceTag}>
                {/* Hiển thị giá thật */}
                <Text style={styles.priceText}>
                  {formatCurrency(PREMIUM_PACKAGE.displayPrice)}
                </Text>
                <Text style={styles.durationText}>/ tháng</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.featureList}>
              {PREMIUM_PACKAGE.features.map((item, index) => (
                <View key={index} style={styles.featureItem}>
                  <item.icon size={18} color="#FFD700" />
                  <Text style={styles.featureText}>{item.text}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* 2. GÓI MUA LẺ (SINGLE) */}
        <Text
          style={[
            typography.h4,
            styles.sectionTitle,
            { color: colors.foreground, marginTop: 32 },
          ]}
        >
          Gói Mua Lẻ
        </Text>

        <View style={styles.packageList}>
          {SINGLE_PACKAGES.map((pkg) => (
            <TouchableOpacity
              key={pkg.id}
              style={[
                styles.packageItem,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              // Quan trọng: Gửi apiAmount (giá test) khi bấm nút
              onPress={() => handlePayment(pkg.apiAmount)}
            >
              <View style={styles.packageLeft}>
                <View style={styles.iconBox}>
                  <MaterialIcons name="diamond" size={24} color="#2980B9" />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={[typography.h4, { color: colors.foreground }]}>
                      {pkg.dias.toLocaleString()} Kim Cương
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: "#27AE60",
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    Tặng thêm {pkg.bonus}
                  </Text>
                </View>
              </View>

              <View style={styles.packageRight}>
                {/* Hiển thị displayPrice (giá thật) */}
                <Text style={[typography.button, { color: colors.primary }]}>
                  {formatCurrency(pkg.displayPrice)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={{ color: "#FFF", marginTop: 12 }}>
            Đang tạo giao dịch...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: { padding: 4 },
  content: { padding: 16, paddingBottom: 40 },

  sectionTitle: { marginBottom: 12 },

  // Premium Card Styles
  premiumCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    elevation: 6,
  },
  premiumHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFD700",
    letterSpacing: 0.5,
  },
  premiumSubtitle: {
    color: "#FFF",
    fontSize: 14,
    marginTop: 4,
    opacity: 0.9,
  },
  priceTag: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  priceText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  durationText: {
    color: "#E0E0E0",
    fontSize: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 16,
  },
  featureList: { gap: 10 },
  featureItem: { flexDirection: "row", alignItems: "center", gap: 12 },
  featureText: { color: "#FFF", fontSize: 14, fontWeight: "500" },

  // Single Package List Styles
  packageList: { gap: 12 },
  packageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  packageLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  packageRight: {
    backgroundColor: "#F0F8FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
});