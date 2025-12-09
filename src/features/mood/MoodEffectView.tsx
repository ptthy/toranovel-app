import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import LottieView from "lottie-react-native";
import { Mood } from "./moodTypes";
import { useMoodEffect } from "./useMoodEffect";

interface Props {
  mood: Mood;
  children?: React.ReactNode;
}

export const MoodEffectView: React.FC<Props> = ({ mood, children }) => {
  const effect = useMoodEffect(mood);

  // Animation cho độ đậm nhạt của màu nền (Fade in)
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: effect.opacity,
      duration: effect.transitionMs,
      useNativeDriver: true,
    }).start();
  }, [effect]);

  return (
    <View style={styles.container}>
      
      {/* -----------------------------------------------------------
          LAYER 1 (Dưới cùng): MÀU ÁM NỀN (TINT COLOR)
          zIndex: 0
      ----------------------------------------------------------- */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: effect.bgColor,
            opacity: opacity,
            zIndex: 0, 
          },
        ]}
        pointerEvents="none" 
      />

      {/* -----------------------------------------------------------
          LAYER 2 (Giữa): HIỆU ỨNG LOTTIE (Mưa, Tuyết...)
          zIndex: 1 - Nằm đè lên màu nền nhưng vẫn dưới chữ
      ----------------------------------------------------------- */}
      <View 
        style={[StyleSheet.absoluteFill, { zIndex: 1 }]} 
        pointerEvents="none"
      >
        {effect.animationSource && (
          <LottieView
            source={effect.animationSource}
            autoPlay
            loop
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            speed={effect.animationSpeed || 1}
          />
        )}
      </View>

      {/* -----------------------------------------------------------
          LAYER 3 (Trên cùng): NỘI DUNG TRUYỆN (CHILDREN)
          zIndex: 10 - Nổi lên trên tất cả để đọc chữ rõ ràng
      ----------------------------------------------------------- */}
      <View style={[styles.contentContainer, { zIndex: 10 }]}>
        {children}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
    // Không đặt background ở đây để nhìn xuyên thấu xuống dưới
  }
});
