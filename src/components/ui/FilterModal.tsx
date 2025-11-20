import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TouchableWithoutFeedback 
} from 'react-native';

import { X, Check } from 'lucide-react-native';
import { TagItem } from '../../api/storyService';
import { useTheme } from '../../contexts/ThemeProvider';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (selectedTagId: string | undefined, sortOption: 'weekly' | 'latest') => void;
  tags: TagItem[];
  currentTagId: string | undefined;
  currentSort: 'weekly' | 'latest';
}

export function FilterModal({ 
  visible, onClose, onApply, tags, currentTagId, currentSort 
}: FilterModalProps) {
  const { colors, typography } = useTheme();

  // State tạm thời trong Modal (chưa áp dụng ngay khi chọn)
  const [tempTagId, setTempTagId] = useState<string | undefined>(currentTagId);
  const [tempSort, setTempSort] = useState<'weekly' | 'latest'>(currentSort);

  // Đồng bộ state khi mở modal
  useEffect(() => {
    if (visible) {
      setTempTagId(currentTagId);
      setTempSort(currentSort);
    }
  }, [visible, currentTagId, currentSort]);

  const handleReset = () => {
    setTempTagId(undefined);
    setTempSort('weekly');
  };

  const handleApply = () => {
    onApply(tempTagId, tempSort);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
              
              {/* Header Modal */}
              <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={handleReset}>
                  <Text style={{ color: colors.mutedForeground }}>Làm mới</Text>
                </TouchableOpacity>
                <Text style={[typography.h4, { color: colors.foreground }]}>Bộ lọc & Sắp xếp</Text>
                <TouchableOpacity onPress={onClose}>
                  <X size={24} color={colors.foreground} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.content}>
                
                {/* Phần 1: Sắp xếp */}
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Sắp xếp theo</Text>
                <View style={styles.chipsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      tempSort === 'weekly' 
                        ? { backgroundColor: colors.primary, borderColor: colors.primary }
                        : { backgroundColor: colors.input, borderColor: colors.border }
                    ]}
                    onPress={() => setTempSort('weekly')}
                  >
                    <Text style={{ color: tempSort === 'weekly' ? '#FFF' : colors.foreground }}>
                      Hot Tuần
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      tempSort === 'latest' 
                        ? { backgroundColor: colors.primary, borderColor: colors.primary }
                        : { backgroundColor: colors.input, borderColor: colors.border }
                    ]}
                    onPress={() => setTempSort('latest')}
                  >
                    <Text style={{ color: tempSort === 'latest' ? '#FFF' : colors.foreground }}>
                      Mới Cập Nhật
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Phần 2: Thể loại (Tags) */}
                <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Thể loại</Text>
                <View style={styles.chipsContainer}>
                  {tags.map((tag) => {
                    const isSelected = tempTagId === tag.tagId;
                    return (
                      <TouchableOpacity
                        key={tag.tagId}
                        style={[
                          styles.chip,
                          isSelected
                            ? { backgroundColor: colors.primary, borderColor: colors.primary }
                            : { backgroundColor: colors.input, borderColor: colors.border }
                        ]}
                        onPress={() => setTempTagId(isSelected ? undefined : tag.tagId)}
                      >
                        <Text style={{ color: isSelected ? '#FFF' : colors.foreground }}>
                          {tag.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Footer Button */}
              <View style={[styles.footer, { borderTopColor: colors.border }]}>
                <TouchableOpacity 
                  style={[styles.applyButton, { backgroundColor: colors.primary }]}
                  onPress={handleApply}
                >
                  <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 16 }}>
                    Áp dụng ({[tempTagId ? 1 : 0].reduce((a, b) => a + b, 0) + (tempSort !== 'weekly' ? 1 : 0)})
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '75%', // Chiếm 75% màn hình
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  applyButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});