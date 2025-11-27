import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeProvider';
import { authorService, FollowerUser } from '../../api/authorService';

interface FollowersModalProps {
  visible: boolean;
  authorId: string;
  onClose: () => void;
}

export function FollowersModal({ visible, authorId, onClose }: FollowersModalProps) {
  const { colors, typography } = useTheme();
  const [followers, setFollowers] = useState<FollowerUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && authorId) {
      setLoading(true);
      authorService.getFollowers(authorId)
        .then(res => {
          // API trả về res.data.items chứ không phải mảng trực tiếp
          if (res.data && res.data.items) {
            setFollowers(res.data.items);
          }
        })
        .catch(err => console.error("Lỗi lấy follower:", err))
        .finally(() => setLoading(false));
    }
  }, [visible, authorId]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[typography.h4, { color: colors.foreground }]}>Người theo dõi</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={followers}
              keyExtractor={(item, index) => item.accountId || index.toString()}
              contentContainerStyle={{ padding: 16 }}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: colors.mutedForeground, marginTop: 20 }}>
                  Chưa có người theo dõi nào.
                </Text>
              }
              renderItem={({ item }) => (
                <View style={styles.userItem}>
                  <Image 
                    source={{ uri: item.avatarUrl || 'https://via.placeholder.com/100' }} 
                    style={styles.avatar} 
                  />
                  <Text style={[typography.p, { color: colors.foreground, marginLeft: 12 }]}>
                    {item.username}
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { height: '70%', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  userItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eee' },
});