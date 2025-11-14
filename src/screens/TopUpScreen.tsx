// src/screens/TopUpScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeProvider';
import { Button } from '../components/ui/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Coins, ExternalLink } from 'lucide-react-native';
import * as Linking from 'expo-linking'; // <-- Import Linking
import { useNavigation } from '@react-navigation/native';
// Định nghĩa 'type' cho gói nạp
type Package = {
  xu: number;
  price: string;
  popular: boolean;
};

const packages: Package[] = [ // <-- Thêm type Package[]
  { xu: 20, price: '10.000đ', popular: false },
  { xu: 50, price: '20.000đ', popular: true },
  { xu: 120, price: '50.000đ', popular: false },
  { xu: 250, price: '100.000đ', popular: false },
  // ... (các gói khác)
];

export function TopUpScreen() {
  const { colors, typography, theme } = useTheme();
  const currentBalance = 120;
  const gradientColors =
    theme === 'light'
      ? ['#1E5162', '#2C6B7C'] as const
      : ['#1A3D49', '#1E5162'] as const;

  // Dùng Linking để mở web
  const handlePayment = async (pkg: Package) => {
    try {
      await Linking.openURL('https://payment-example.com');
    } catch (error) {
      Alert.alert('Không thể mở trang thanh toán');
    }
  };

  const renderPackage = ({ item }: { item: Package }) => {
    const isPopular = item.popular;

    // Style cho nút
    const buttonStyle = isPopular
      ? { backgroundColor: colors.primary }
      : { backgroundColor: colors.muted };
    const textStyle = isPopular
      ? { color: colors.background }
      : { color: colors.foreground };

    return (
      <View
        style={[
          styles.packageItem,
          {
            backgroundColor: colors.card,
            borderColor: isPopular ? colors.primary : colors.border,
          },
        ]}
      >
        {isPopular && (
          <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
            <Text style={[typography.p, { color: colors.background, fontSize: 10, fontWeight: '600' }]}>
              Phổ biến
            </Text>
          </View>
        )}
        <View style={styles.packageContent}>
          <View style={styles.xuRow}>
            <Coins size={20} color={colors.primary} />
            <Text style={[typography.h2, { color: colors.foreground, fontWeight: '700' }]}>
              {item.xu}
            </Text>
          </View>
          <Text style={[typography.p, { color: colors.foreground, fontWeight: '600', marginBottom: 12 }]}>
            {item.price}
          </Text>
          <Button
            title="Chọn"
            onPress={() => handlePayment(item)}
            style={[styles.packageButton, buttonStyle]}
            textStyle={[textStyle, { fontSize: 13, fontWeight: '600' }]}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity /* onPress={() => navigation.goBack()} */ style={styles.headerButton}>
          <ArrowLeft size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[typography.h4, { color: colors.foreground }]}>Nạp xu</Text>
        <View style={styles.headerButton} />{/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Balance Card */}
        <LinearGradient colors={gradientColors} style={styles.balanceCard}>
          <View style={styles.xuRow}>
            <Coins size={24} color="#F7F3E8" />
            <Text style={[typography.p, { color: '#F7F3E8', marginLeft: 8 }]}>Số dư hiện tại</Text>
          </View>
          <Text style={[typography.h1, { color: '#F7F3E8', fontWeight: '700', fontSize: 32, marginTop: 4 }]}>
            {currentBalance} xu
          </Text>
        </LinearGradient>

        {/* Intro */}
        <View style={styles.introSection}>
          <Text style={[typography.h3, { color: colors.foreground, marginBottom: 16 }]}>Chọn gói nạp</Text>
          <Text style={[typography.p, { color: colors.mutedForeground }]}>
            1 xu = 1 chương truyện có phí. Nạp xu để mở khóa các chương đặc biệt.
          </Text>
        </View>

        {/* Gói nạp (Grid) */}
        <FlatList
          data={packages}
          renderItem={renderPackage}
          keyExtractor={(item) => item.xu.toString()}
          numColumns={2}
          scrollEnabled={false} // Vì đã có ScrollView cha
          style={styles.grid}
          columnWrapperStyle={styles.gridRow}
        />

        {/* Payment Info */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[typography.h4, styles.paymentTitle, { color: colors.foreground }]}>
            <ExternalLink size={18} color={colors.foreground} /> Phương thức thanh toán
          </Text>
          {/* ... (phần text về phương thức thanh toán) ... */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { borderBottomWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, elevation: 2 },
  headerButton: { padding: 4, width: 40 },
  container: { padding: 16, gap: 24 },
  balanceCard: { borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, elevation: 5 },
  xuRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  introSection: { gap: 8 },
  grid: { marginHorizontal: -6 },
  gridRow: { gap: 12 },
  packageItem: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    elevation: 2,
    marginHorizontal: 6, // Tạo gap
  },
  popularBadge: {
    position: 'absolute',
    top: -12, // Dịch chuyển lên
    alignSelf: 'center', // Căn giữa
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
  },
  packageContent: {
    padding: 16,
    alignItems: 'center',
    paddingTop: 24, // Dành chỗ cho badge
  },
  packageButton: {
    width: '100%',
    height: 36,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    elevation: 2,
    borderWidth: 1,
  },
  paymentTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
});