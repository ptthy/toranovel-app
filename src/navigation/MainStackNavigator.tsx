import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MainStackParamList } from "./types";
import { BottomTabNavigator } from "./BottomTabNavigator";
import { ReaderScreen } from "../screens/ReaderScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { TopUpScreen } from "../screens/TopUpScreen";
import { EditProfileScreen } from "../screens/EditProfileScreen";
import { StoryDetailScreen } from "../screens/StoryDetailScreen";

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="Reader" component={ReaderScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="TopUp" component={TopUpScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="StoryDetail" component={StoryDetailScreen} />
    </Stack.Navigator>
  );
}
