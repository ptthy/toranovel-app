import { Mood } from "./moodTypes";

const LOTTIE_SOURCES = {
  sad: require("../../../assets/lottie/rain.json"),
  calm: require("../../../assets/lottie/clouds.json"), 
  romantic: require("../../../assets/lottie/hearts.json"),
  mysterious: require("../../../assets/lottie/fog.json"),
  excited: require("../../../assets/lottie/confetti.json"),
  neutral: require("../../../assets/lottie/starry.json"),
};

export const moodConfig: Record<
  Mood,
  {
    bgColor: string;       // Màu ám nền
    opacity: number;       // Độ đậm của màu nền (0.1 - 0.5 để không che chữ)
    transitionMs: number;  // Thời gian chuyển cảnh
    animationSource: any;  // File Lottie
    animationSpeed: number;// Tốc độ chạy Lottie
    scale: number;         // Giữ lại để tương thích code cũ
    blur: number;          // Giữ lại
  }
> = {
  sad: {
    bgColor: "#1a365d", // Xanh dương tối (buồn)
    opacity: 0.3,
    transitionMs: 500,
    animationSource: LOTTIE_SOURCES.sad,
    animationSpeed: 1,
    scale: 1,
    blur: 0,
  },
  romantic: {
    bgColor: "#fbb6ce", // Hồng phấn
    opacity: 0.25,
    transitionMs: 500,
    animationSource: LOTTIE_SOURCES.romantic,
    animationSpeed: 1,
    scale: 1,
    blur: 0,
  },
  mysterious: {
    bgColor: "#000000", // Đen
    opacity: 0.4,
    transitionMs: 600,
    animationSource: LOTTIE_SOURCES.mysterious,
    animationSpeed: 0.5,
    scale: 1,
    blur: 0,
  },
  excited: {
    bgColor: "#faf089", // Vàng nhạt
    opacity: 0.2,
    transitionMs: 300,
    animationSource: LOTTIE_SOURCES.excited,
    animationSpeed: 1.2,
    scale: 1,
    blur: 0,
  },
  calm: {
    bgColor: "#90cdf4", // Xanh trời nhẹ
    opacity: 0.2,
    transitionMs: 400,
    animationSource: LOTTIE_SOURCES.calm,
    animationSpeed: 0.8,
    scale: 1,
    blur: 0,
  },
  neutral: {
    bgColor: "transparent",
    opacity: 0,
    transitionMs: 300,
    animationSource: LOTTIE_SOURCES.neutral,
    animationSpeed: 1,
    scale: 1,
    blur: 0,
  },
};
