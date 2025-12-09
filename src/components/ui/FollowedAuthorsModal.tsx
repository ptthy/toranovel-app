import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, Modal, TouchableOpacity, 
  FlatList, ActivityIndicator, Alert 
} from 'react-native';
import { Image } from 'expo-image';
import { X, UserCheck, UserMinus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeProvider';
import { FollowedAuthorItem, profileService } from '../../api/profileService';


interface FollowedAuthorsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function FollowedAuthorsModal({ visible, onClose }: FollowedAuthorsModalProps) {
  const { colors, typography } = useTheme();
  const navigation = useNavigation<any>();
  
  const [authors, setAuthors] = useState<FollowedAuthorItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnfollowing, setIsUnfollowing] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      fetchData();
    }
  }, [visible]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await profileService.getFollowedAuthors(1, 100); // Lấy 100 người
      setAuthors(res.data.items);
    } catch (error) {
      console.error("Lỗi tải danh sách tác giả:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollow = (authorId: string, username: string) => {
    Alert.alert(
      "Hủy theo dõi", 
      `Bạn muốn hủy theo dõi ${username}?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Đồng ý", 
          style: 'destructive',
          onPress: async () => {
            setIsUnfollowing(authorId);
            try {
              await profileService.unfollowAuthor(authorId);
              // Xóa khỏi list local
              setAuthors(prev => prev.filter(a => a.authorId !== authorId));
            } catch (error) {
              Alert.alert("Lỗi", "Không thể hủy theo dõi.");
            } finally {
              setIsUnfollowing(null);
            }
          }
        }
      ]
    );
  };

  const handlePressAuthor = (authorId: string) => {
    onClose();
    navigation.navigate("AuthorProfile", { authorId });
  };

  const renderItem = ({ item }: { item: FollowedAuthorItem }) => (
    <TouchableOpacity 
      style={[styles.itemContainer, { borderBottomColor: colors.border }]}
      onPress={() => handlePressAuthor(item.authorId)}
    >
      <Image 
        source={{ uri: item.avatarUrl || `https://ui-avatars.com/api/?name=${item.username}&background=random` }} 
        style={styles.avatar} 
      />
      
      <View style={styles.info}>
        <Text style={[typography.h4, { color: colors.foreground, fontSize: 16 }]}>
          {item.username}
        </Text>
        <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 2 }}>
          Đã theo dõi từ {new Date(item.followedAt).toLocaleDateString('vi-VN')}
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.unfollowBtn, { backgroundColor: colors.muted }]}
        onPress={() => handleUnfollow(item.authorId, item.username)}
        disabled={isUnfollowing === item.authorId}
      >
        {isUnfollowing === item.authorId ? (
          <ActivityIndicator size="small" color={colors.foreground} />
        ) : (
          <UserMinus size={18} color={colors.mutedForeground} />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[typography.h3, { color: colors.foreground }]}>Đang theo dõi ({authors.length})</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {/* List */}
          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={authors}
              keyExtractor={item => item.authorId}
              renderItem={renderItem}
              contentContainerStyle={{ padding: 16 }}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', marginTop: 40, color: colors.mutedForeground }}>
                  Bạn chưa theo dõi tác giả nào.
                </Text>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { height: '80%', borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 16, borderBottomWidth: 1 
  },
  closeBtn: { padding: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  itemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  info: { flex: 1 },
  unfollowBtn: { padding: 8, borderRadius: 20 },
});