import 'react-native-gesture-handler'; // Phải import ở dòng đầu tiên
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';

// Import Font (Cần cài: npx expo install @expo-google-fonts/inter @expo-google-fonts/poppins)
import {
  useFonts as useInter,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  useFonts as usePoppins,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

// Import các Provider và Navigator
import { ThemeProvider } from './src/contexts/ThemeProvider';
import { RootNavigator } from './src/navigation';
import { AuthProvider } from './src/contexts/AuthContext';
export default function App() {
  // Load 2 bộ font
  let [interLoaded] = useInter({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  let [poppinsLoaded] = usePoppins({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Check for updates when app starts
  useEffect(() => {
    async function checkForUpdates() {
      try {
        // Only check for updates in production builds
        if (!__DEV__) {
          const update = await Updates.checkForUpdateAsync();

          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            // Reload the app to apply the update
            await Updates.reloadAsync();
          }
        }
      } catch (error) {
        // Handle error - you can add error logging here
        console.log('Error checking for updates:', error);
      }
    }

    checkForUpdates();
  }, []);

  // Nếu font chưa load xong, hiển thị màn hình loading
  if (!interLoaded || !poppinsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Đây là cấu trúc "bọc" chuẩn của một app Expo
 return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider> 
            <RootNavigator />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}