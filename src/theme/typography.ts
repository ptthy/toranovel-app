// src/theme/typography.ts
import { TextStyle } from 'react-native';

// Đây là tên bạn sẽ dùng khi load font
const fonts = {
  interRegular: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
  interBold: 'Inter_700Bold',
  poppinsRegular: 'Poppins_400Regular',
  poppinsMedium: 'Poppins_500Medium',
  poppinsSemiBold: 'Poppins_600SemiBold',
  poppinsBold: 'Poppins_700Bold',
};

export const typography = {
  h1: {
    fontFamily: fonts.poppinsSemiBold,
    fontSize: 28,
    lineHeight: 28 * 1.2,
  } as TextStyle,
  h2: {
    fontFamily: fonts.poppinsSemiBold,
    fontSize: 24,
    lineHeight: 24 * 1.3,
  } as TextStyle,
  h3: {
    fontFamily: fonts.poppinsSemiBold,
    fontSize: 20,
    lineHeight: 20 * 1.4,
  } as TextStyle,
  h4: {
    fontFamily: fonts.poppinsSemiBold,
    fontSize: 18,
    lineHeight: 18 * 1.4,
  } as TextStyle,
  p: {
    fontFamily: fonts.interRegular,
    fontSize: 14,
    lineHeight: 14 * 1.6,
  } as TextStyle,
  // Thêm các kiểu chữ khác nếu cần
  body: {
    fontFamily: fonts.interRegular,
    fontSize: 16,
  } as TextStyle,
  button: {
    fontFamily: fonts.interMedium,
    fontSize: 16,
  } as TextStyle,
};