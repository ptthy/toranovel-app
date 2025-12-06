import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { Mood } from "./moodTypes";
import { useMoodEffect } from "./useMoodEffect";

interface Props {
  mood: Mood;
  children?: React.ReactNode;
}

export const MoodEffectView: React.FC<Props> = ({ mood, children }) => {
  const effect = useMoodEffect(mood);

  const scale = useRef(new Animated.Value(effect.scale)).current;
  const opacity = useRef(new Animated.Value(effect.opacity)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: effect.scale,
        duration: effect.transitionMs,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: effect.opacity,
        duration: effect.transitionMs,
        useNativeDriver: true,
      }),
    ]).start();
  }, [effect]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: effect.bgColor,
          opacity: opacity,
          transform: [{ scale }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
