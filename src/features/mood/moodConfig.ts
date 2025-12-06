import { Mood } from "./moodTypes";

export const moodConfig: Record<
  Mood,
  {
    bgColor: string;
    blur: number;
    scale: number;
    opacity: number;
    transitionMs: number;
  }
> = {
  sad: {
    bgColor: "#4a5568",
    blur: 6,
    scale: 0.95,
    opacity: 0.7,
    transitionMs: 500,
  },
  calm: {
    bgColor: "#a3ceda",
    blur: 2,
    scale: 1,
    opacity: 1,
    transitionMs: 400,
  },
  romantic: {
    bgColor: "#ffccd5",
    blur: 1,
    scale: 1.05,
    opacity: 1,
    transitionMs: 500,
  },
  mysterious: {
    bgColor: "#1a1a1d",
    blur: 8,
    scale: 0.98,
    opacity: 0.85,
    transitionMs: 600,
  },
  excited: {
    bgColor: "#ffe08a",
    blur: 0,
    scale: 1.1,
    opacity: 1,
    transitionMs: 300,
  },
  neutral: {
    bgColor: "#e2e8f0",
    blur: 0,
    scale: 1,
    opacity: 1,
    transitionMs: 300,
  },
};
