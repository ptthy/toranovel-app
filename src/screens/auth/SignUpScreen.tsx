import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeProvider";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthScreenProps } from "../../navigation/types";
import axios from "axios";
import { authService } from "../../api/authService";

export function SignUpScreen() {
  const { colors, typography } = useTheme();
  const navigation = useNavigation<AuthScreenProps<"SignUp">["navigation"]>();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUsernameInvalid = username.length > 0 && username.length < 6;
  const isPasswordInvalid = password.length > 0 && password.length < 6;

  const handleSignUp = async () => {
    if (isLoading) return;

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.register({
        username,
        email,
        password,
        confirmPassword,
      });

      navigation.navigate("OTP", { email });
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const apiError =
          e.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
        setError(apiError);
      } else {
        setError("Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[typography.h2, { color: colors.foreground }]}>Đăng ký</Text>
        </View>

        <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
          <Input
            label="Tên người dùng"
            placeholder="nguyenvana"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          {/* {!isUsernameInvalid && (
            <Text style={styles.helperText}>Username phải có ít nhất 6 ký tự</Text>
          )} */}

          {isUsernameInvalid && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>Username phải từ 6–20 ký tự.</Text>
            </View>
          )}

          <Input
            label="Email"
            placeholder="example@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Mật khẩu"
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightAdornment={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color={colors.mutedForeground} />
                ) : (
                  <Eye size={20} color={colors.mutedForeground} />
                )}
              </TouchableOpacity>
            }
          />

          {/* {!isPasswordInvalid && (
            <Text style={styles.helperText}>Mật khẩu phải có ít nhất 6 ký tự</Text>
          )} */}

          {isPasswordInvalid && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>Mật khẩu phải có ít nhất 6 ký tự</Text>
            </View>
          )}

          <Input
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            rightAdornment={
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? (
                  <EyeOff size={20} color={colors.mutedForeground} />
                ) : (
                  <Eye size={20} color={colors.mutedForeground} />
                )}
              </TouchableOpacity>
            }
          />

          {error && <Text style={styles.formError}>{error}</Text>}

          <Button
            title="Đăng ký"
            variant="primary"
            onPress={handleSignUp}
            loading={isLoading}
            style={{ marginTop: 16 }}
          />

          <View style={styles.footerNav}>
            <Text style={[typography.p, { color: colors.mutedForeground }]}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
              <Text style={[typography.p, { color: colors.accent, fontWeight: "600" }]}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },

  backButton: {
    padding: 8,
    marginLeft: -8,
    marginRight: 8,
  },

  formContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },

  helperText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    marginLeft: 4,
    marginBottom: 8,
  },

  errorBox: {
    backgroundColor: "#FBEAEA",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 8,
  },

  errorBoxText: {
    color: "#D32F2F",
    fontSize: 13,
  },

  formError: {
    color: "#DC3545",
    textAlign: "center",
    marginVertical: 12,
    fontSize: 14,
  },

  footerNav: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
});
