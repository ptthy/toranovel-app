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
// 1. Đảm bảo đã import Gem
import {
  ArrowLeft,
  Crown,
  Zap,
  Globe,
  Mic,
  Gift,
  Gem,
} from "lucide-react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { useAuth } from "../contexts/AuthContext";
import {
  paymentService,
  PricingPackage,
  SubscriptionPlan,
} from "../api/paymentService";

// Helper component: Icon Gem nhỏ dùng trong dòng text
// Size 16 để vừa với dòng chữ, marginBottom -3 để căn dòng đẹp hơn
const InlineGem = () => (
  <Gem size={16} color="#4b98ff" fill="#4b98ff" style={{ marginBottom: -3 }} />
);

const PREMIUM_FEATURES_UI = [
  // text để trống hoặc placeholder vì ta sẽ render custom ở dưới
  { icon: Gift, id: "gift" }, 
  { icon: Zap, id: "daily" },
  { icon: Crown, text: "Đổi nhạc nền, hiệu ứng đọc" },
  { icon: Globe, text: "Dịch truyện sang đa ngôn ngữ" },
];

export function TopUpScreen() {
  const { colors, typography } = useTheme();
  const navigation = useNavigation();
  const { user, fetchUserProfile } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionPlan | null>(null);
  const [singlePackages, setSinglePackages] = useState<PricingPackage[]>([]);

  // ... (Giữ nguyên các hàm fetch API: fetchSubscriptionPlan, fetchPricingPackages...)
  const fetchSubscriptionPlan = async () => {
    try {
      const response = await paymentService.getSubscriptionPlans();
      if (response.data && response.data.length > 0) {
        const premiumPlan = response.data.find((p) => p.planCode === "premium_month") || response.data[0];
        setSubscriptionData(premiumPlan);
      }
    } catch (error) {
      console.error("Lỗi lấy gói tháng:", error);
    }
  };

  const fetchPricingPackages = async () => {
    try {
      const response = await paymentService.getPricing();
      if (response.data) {
        const activePkgs = response.data.filter((p) => p.isActive);
        activePkgs.sort((a, b) => a.amountVnd - b.amountVnd);
        setSinglePackages(activePkgs);
      }
    } catch (error) {
      console.error("Lỗi lấy gói lẻ:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
      fetchSubscriptionPlan();
      fetchPricingPackages();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([fetchUserProfile(), fetchSubscriptionPlan(), fetchPricingPackages()]);
    setIsRefreshing(false);
  }, []);

  const handleSubscription = async () => {
    if (!subscriptionData) return;
    setIsLoading(true);
    try {
      const response = await paymentService.createSubscriptionLink(subscriptionData.planCode);
      const { checkoutUrl } = response.data;
      if (checkoutUrl) await Linking.openURL(checkoutUrl);
      else Alert.alert("Lỗi", "Không lấy được link thanh toán.");
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Có lỗi khi tạo gói tháng.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOneTimePayment = async (amount: number) => {
    setIsLoading(true);
    try {
      const response = await paymentService.createPaymentLink(amount);
      const { checkoutUrl } = response.data;
      if (checkoutUrl) await Linking.openURL(checkoutUrl);
      else Alert.alert("Lỗi", "Không lấy được link thanh toán.");
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Có lỗi khi tạo giao dịch.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => amount.toLocaleString("vi-VN") + "đ";

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={[typography.h3, { color: colors.foreground }]}>Ưu Đãi</Text>
          {/* --- SỬA HEADER: Thay 💎 bằng InlineGem --- */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "600" }}>
              Số dư: {user?.dias || 0}
            </Text>
            <InlineGem />
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {/* === 1. GÓI THÁNG === */}
        <Text style={[typography.h4, styles.sectionTitle, { color: colors.foreground }]}>
          Gói Tháng
        </Text>

        {!subscriptionData ? (
          <ActivityIndicator color={colors.primary} style={{ margin: 20 }} />
        ) : (
          <TouchableOpacity activeOpacity={0.9} onPress={handleSubscription}>
            <LinearGradient
              colors={["#1E5162", "#2C6B7C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumCard}
            >
              <View style={styles.premiumHeader}>
                <View>
                  <Text style={styles.premiumTitle}>{subscriptionData.planName}</Text>
                  
                  {/* --- SỬA SUBTITLE: Thay 💎 bằng InlineGem --- */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 4 }}>
                    <Text style={styles.premiumSubtitleText}>
                       Nhận tổng {(subscriptionData.dailyDias * subscriptionData.durationDays) + 500}{" "}
                    </Text>
                    <InlineGem />
                    <Text style={styles.premiumSubtitleText}>
                       {" "}/ {subscriptionData.durationDays} ngày
                    </Text>
                  </View>

                </View>
                <View style={styles.priceTag}>
                  <Text style={styles.priceText}>{formatCurrency(subscriptionData.priceVnd)}</Text>
                  <Text style={styles.durationText}>/ tháng</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.featureList}>
                {PREMIUM_FEATURES_UI.map((item, index) => {
                  return (
                    <View key={index} style={styles.featureItem}>
                      <item.icon size={18} color="#FFD700" />
                      
                      {/* --- SỬA FEATURE LIST: Render custom text có chứa Gem --- */}
                      {index === 0 ? (
                         // Dòng 1: Nhận ngay 500
                        <View style={styles.textRow}>
                          <Text style={styles.featureText}>Nhận ngay 500 </Text>
                          <InlineGem />
                          <Text style={styles.featureText}> sau khi mua gói</Text>
                        </View>
                      ) : index === 1 ? (
                        // Dòng 2: Nhận hằng ngày
                        <View style={styles.textRow}>
                          <Text style={styles.featureText}>
                            Nhận {subscriptionData.dailyDias} 
                          </Text>
                          <View style={{ marginHorizontal: 2 }}><InlineGem /></View>
                          <Text style={styles.featureText}>mỗi ngày</Text>
                        </View>
                      ) : (
                        // Các dòng text thường
                        <Text style={styles.featureText}>{item.text}</Text>
                      )}

                    </View>
                  );
                })}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* === 2. GÓI MUA LẺ === */}
        <Text style={[typography.h4, styles.sectionTitle, { color: colors.foreground, marginTop: 32 }]}>
          Gói Mua Lẻ
        </Text>

        <View style={styles.packageList}>
          {singlePackages.length === 0 && !isRefreshing ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
          ) : (
            singlePackages.map((pkg) => (
              <TouchableOpacity
                key={pkg.pricingId}
                style={[styles.packageItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleOneTimePayment(pkg.amountVnd)}
              >
                <View style={styles.packageLeft}>
                  {/* IconBox với background nhạt và icon xanh */}
                  <View style={styles.iconBox}>
                     <Gem size={24} color="#4b98ff" fill="#4b98ff" />
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={[typography.h4, { color: colors.foreground }]}>
                      {pkg.diamondGranted.toLocaleString()} Kim Cương
                    </Text>
                    <Text style={{ color: "#27AE60", fontSize: 12, fontWeight: "600" }}>
                      Mua ngay
                    </Text>
                  </View>
                </View>

                <View style={styles.packageRight}>
                  <Text style={[typography.button, { color: colors.primary }]}>
                    {formatCurrency(pkg.amountVnd)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={{ color: "#FFF", marginTop: 12 }}>Đang xử lý...</Text>
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
  // Style text cho subtitle trong Premium Card
  premiumSubtitleText: {
    color: "#FFF",
    fontSize: 14,
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
  // Helper style để căn text và icon cùng dòng
  textRow: { flexDirection: 'row', alignItems: 'center' },
  featureText: { color: "#FFF", fontSize: 14, fontWeight: "500" },
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