import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { X, Flag, CheckCircle } from 'lucide-react-native';
import { reportService, ReportTargetType } from '../../api/reportService';

// --- SỬA 1: Map Lý do hiển thị sang Enum Backend ---
// Backend enum: 'negative_content','misinformation','spam','ip_infringement'
const REPORT_REASONS = [
  { label: "Nội dung rác / Spam", value: "spam" },
  { label: "Nội dung tiêu cực / Xúc phạm", value: "negative_content" },
  { label: "Thông tin sai lệch", value: "misinformation" },
  { label: "Vi phạm bản quyền", value: "ip_infringement" },
];

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  targetId: string;
  targetType: ReportTargetType; // 'Story' | 'Chapter' | 'Comment'
}

export function ReportModal({ visible, onClose, targetId, targetType }: ReportModalProps) {
  const [selectedReasonValue, setSelectedReasonValue] = useState<string>(''); // Lưu 'value' (enum)
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReasonValue) {
      Alert.alert("Thông báo", "Vui lòng chọn lý do báo cáo.");
      return;
    }

    setLoading(true);
    try {
      // --- SỬA 2: Chuẩn hóa dữ liệu trước khi gửi ---
     const payload = {
        targetType: targetType, 
        targetId: targetId,
        reason: selectedReasonValue,
        details: details || "Không có mô tả thêm"
      };

      console.log("🚀 Report Payload:", payload); // Debug xem gửi gì

      await reportService.submitReport(payload);
      
      Alert.alert("Đã gửi", "Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét sớm nhất.");
      
      // Reset form
      setSelectedReasonValue('');
      setDetails('');
      onClose();
    } catch (error: any) {
      console.error("Lỗi gửi báo cáo:", error);
      // Hiển thị lỗi chi tiết nếu có từ backend
      const serverMessage = error.response?.data?.title || "Không thể gửi báo cáo.";
      Alert.alert("Lỗi", serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (targetType) {
      case 'Story': return 'Báo cáo truyện';
      case 'chapter': return 'Báo cáo chương';
      case 'Comment': return 'Báo cáo bình luận';
      default: return 'Báo cáo vi phạm';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <Flag size={20} color="#DC3545" />
                <Text style={styles.headerTitle}>{getTitle()}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Lý do */}
          <Text style={styles.label}>Chọn lý do:</Text>
          <View style={styles.reasonList}>
            {REPORT_REASONS.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.reasonItem,
                  selectedReasonValue === item.value && styles.reasonItemSelected
                ]}
                onPress={() => setSelectedReasonValue(item.value)}
              >
                <Text style={[
                  styles.reasonText,
                  selectedReasonValue === item.value && styles.reasonTextSelected
                ]}>{item.label}</Text>
                
                {selectedReasonValue === item.value && (
                  <CheckCircle size={16} color="#2C6B7C" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Chi tiết */}
          <Text style={styles.label}>Chi tiết thêm (tùy chọn):</Text>
          <TextInput
            style={styles.input}
            placeholder="Mô tả cụ thể vi phạm..."
            multiline
            numberOfLines={3}
            value={details}
            onChangeText={setDetails}
            textAlignVertical="top"
          />

          {/* Nút gửi */}
          <TouchableOpacity
            style={[styles.submitButton, (loading || !selectedReasonValue) && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading || !selectedReasonValue}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Gửi Báo Cáo</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC3545', 
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  reasonList: {
    gap: 8,
    marginBottom: 12,
  },
  reasonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  reasonItemSelected: {
    borderColor: '#2C6B7C',
    backgroundColor: '#E0F2F1',
  },
  reasonText: {
    color: '#555',
  },
  reasonTextSelected: {
    fontWeight: 'bold',
    color: '#2C6B7C',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    height: 80,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#DC3545',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#faa',
    opacity: 0.7
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});