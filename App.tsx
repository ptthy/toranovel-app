import 'react-native-gesture-handler'; // Phải import ở dòng đầu tiên
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
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
  // State for update status
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

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
          setUpdateMessage('Đang kiểm tra cập nhật...');
          setIsUpdating(true);

          const update = await Updates.checkForUpdateAsync();

          if (update.isAvailable) {
            setUpdateMessage('Đang tải bản cập nhật...');
            await Updates.fetchUpdateAsync();

            setUpdateMessage('Đang cài đặt...');
            // Reload the app to apply the update
            await Updates.reloadAsync();
          } else {
            // No update available, hide loading
            setIsUpdating(false);
          }
        }
      } catch (error) {
        // Handle error - hide loading and continue
        console.log('Error checking for updates:', error);
        setIsUpdating(false);
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

      {/* Update Overlay */}
      {isUpdating && (
        <View style={styles.updateOverlay}>
          <View style={styles.updateContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.updateText}>{updateMessage}</Text>
          </View>
        </View>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  updateOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  updateContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  updateText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#333333',
    textAlign: 'center',
  },
});