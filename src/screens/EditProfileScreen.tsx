import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeProvider';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Calendar } from 'lucide-react-native'; 
import { useNavigation } from '@react-navigation/native';
import { profileService } from '../api/profileService';
import axios from 'axios';
// 1. Import DatePicker
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type Gender = 'M' | 'F' | 'unspecified';

// Hàm helper để format Date -> YYYY-MM-DD
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function EditProfileScreen() {
  const { colors, typography } = useTheme();
  const navigation = useNavigation();
  const { user, fetchUserProfile } = useAuth();

  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [gender, setGender] = useState<Gender>(user?.gender || 'unspecified');
  
  // 2. State cho DatePicker
  // Chuyển string "YYYY-MM-DD" thành đối tượng Date
  const initialDate = user?.birthday ? new Date(user.birthday) : new Date();
  const [date, setDate] = useState<Date>(initialDate);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // 3. Hàm onChange cho DatePicker
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false); // Ẩn picker đi
    if (selectedDate) {
      setDate(selectedDate); // Cập nhật state
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await profileService.updateProfile({
        bio: bio,
        gender: gender,
        // 4. Format Date thành string YYYY-MM-DD khi gửi đi
        birthday: formatDate(date),
      });

      await fetchUserProfile();
      
      Alert.alert('Thành công', 'Hồ sơ của bạn đã được cập nhật.');
      navigation.goBack();

    } catch (e) {
      const apiError = axios.isAxiosError(e) ? e.response?.data?.message : 'Đã xảy ra lỗi.';
      Alert.alert('Lỗi', apiError);
    } finally {
      setIsLoading(false);
    }
  };

  // ... (GenderButton giữ nguyên)
  const GenderButton = ({ value, label }: { value: Gender, label: string }) => (
    <TouchableOpacity
      style={[
        styles.genderButton,
        { 
          backgroundColor: gender === value ? colors.primary : colors.input,
          borderColor: gender === value ? colors.primary : colors.border,
        }
      ]}
      onPress={() => setGender(value)}
    >
      <Text style={{ color: gender === value ? colors.background : colors.foreground, fontWeight: '500' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <ArrowLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[typography.h2, { color: colors.foreground }]}>Chỉnh sửa hồ sơ</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Username */}
        <Input
          label="Tên người dùng"
          value={username}
          onChangeText={setUsername}
          editable={true} 
        />
        
        {/* Bio */}
        <Input
          label="Tiểu sử (Bio)"
          value={bio}
          onChangeText={setBio}
          multiline
          placeholder="Giới thiệu về bạn..."
        />
        
        {/* 5. Thay thế Input Ngày sinh bằng DatePicker */}
        <Text style={[typography.p, styles.label, { color: colors.foreground }]}>Ngày sinh</Text>
        <TouchableOpacity 
          style={[styles.dateInput, { backgroundColor: colors.input, borderColor: colors.border }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[typography.body, { color: colors.foreground }]}>{formatDate(date)}</Text>
          <Calendar size={20} color={colors.mutedForeground} />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default" // (Android là 'spinner', iOS là 'default')
            onChange={onDateChange}
          />
        )}
        {/* === Kết thúc thay thế === */}
        
        {/* Gender */}
        <Text style={[typography.p, styles.label, { color: colors.foreground, marginTop: 16 }]}>Giới tính</Text>
        <View style={styles.genderContainer}>
          <GenderButton value="M" label="Nam" />
          <GenderButton value="F" label="Nữ" />
          <GenderButton value="unspecified" label="Không rõ" />
        </View>

        <Button
          title="Lưu thay đổi"
          variant="primary"
          onPress={handleSave}
          loading={isLoading}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerButton: { padding: 8, marginLeft: -8, marginRight: 8 },
  container: {
    padding: 24,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  // 6. Style cho Nút chọn ngày
  dateInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});