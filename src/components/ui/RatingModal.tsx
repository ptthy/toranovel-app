import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Star, X } from 'lucide-react-native';
import { storyService } from '../../api/storyService';



interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  storyId: string;
  currentRating?: number; // Điểm cũ nếu user đã từng đánh giá
  onSuccess: () => void; // Callback để reload lại data sau khi đánh giá xong
}

export function RatingModal({ visible, onClose, storyId, currentRating = 0, onSuccess }: RatingModalProps) {
  const [rating, setRating] = useState(currentRating);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn số sao bạn muốn đánh giá.");
      return;
    }

    setIsSubmitting(true);
    try {
      await storyService.submitRating(storyId, rating);
      Alert.alert("Thành công", "Cảm ơn bạn đã đánh giá!");
      onSuccess(); // Load lại thông tin rating ở màn hình chính
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể gửi đánh giá. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Đánh giá truyện</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Stars */}
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                <Star
                  size={40}
                  color={star <= rating ? "#FFD700" : "#E0E0E0"} // Vàng hoặc Xám
                  fill={star <= rating ? "#FFD700" : "transparent"}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.hint}>
            {rating > 0 ? `Bạn chọn ${rating} sao` : "Chạm để chọn sao"}
          </Text>

          {/* Button */}
          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.disabledButton]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitText}>Gửi đánh giá</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  hint: {
    color: '#666',
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#2C6B7C',
    width: '100%',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});