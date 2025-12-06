import { useMemo } from "react";
import { moodConfig } from "./moodConfig";
import { Mood } from "./moodTypes";

export const useMoodEffect = (mood: Mood) => {
  return useMemo(() => {
    return moodConfig[mood] || moodConfig["neutral"];
  }, [mood]);
};
