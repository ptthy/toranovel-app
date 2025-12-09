import { useMemo } from "react";
import { moodConfig } from "./moodConfig";
import { Mood } from "./moodTypes";

export const useMoodEffect = (mood: Mood) => {
  return useMemo(() => {
    // Nếu mood không tồn tại trong config, trả về neutral
    return moodConfig[mood] || moodConfig["neutral"];
  }, [mood]);
};
