import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions, StatusBar
} from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../contexts/ThemeProvider';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, UserPlus, UserCheck, MapPin, Calendar, Award } from 'lucide-react-native';
import { MainScreenProps } from '../navigation/types';

import { authorService, PublicProfileResponse } from '../api/authorService';
import { Story } from '../api/storyService';
import { StoryListItem } from '../components/ui/StoryListItem';
import { FollowersModal } from '../components/ui/FollowersModal';

const { width } = Dimensions.get('window');

export function AuthorProfileScreen() {
  const { colors, typography } = useTheme();
  const navigation = useNavigation<MainScreenProps<'StoryDetail'>['navigation']>();
  const route = useRoute<any>(); 
  
  // Dùng accountId truyền từ màn hình trước
  const accountId = route.params?.authorId; 

  const [profile, setProfile] = useState<PublicProfileResponse | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [showFollowers, setShowFollowers] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'works'>('works'); // Mặc định vào tab tác phẩm cho tiện

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (!accountId) return;

        const [profileRes, storyRes] = await Promise.all([
          authorService.getPublicProfile(accountId),
          authorService.getAuthorStories(accountId)
        ]);
        
      const profileData = profileRes.data;
setProfile(profileData);

// SỬA LOGIC LẤY SỐ FOLLOWERS
// Ưu tiên 'totalFollower' (số 101 từ JSON) trước, nếu không có mới tìm các biến khác
const displayCount = 
  profileData.author?.totalFollower ?? // API trả về 101 ở đây
  profileData.author?.followerCount ?? // Fallback
  0;

setFollowerCount(displayCount);


// Xử lý Follow
setIsFollowing(profileData.followState !== null);
     
        
        // Xử lý danh sách truyện
        if (storyRes.data && Array.isArray(storyRes.data.items)) {
          setStories(storyRes.data.items);
        }

      } catch (error) {
        console.error("Lỗi tải profile:", error);
        Alert.alert("Lỗi", "Không tải được thông tin tác giả.");
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [accountId]);

  const handleToggleFollow = async () => {
    if (!profile) return;
    const previousState = isFollowing;
    setIsFollowing(!previousState);
    setFollowerCount(prev => previousState ? prev - 1 : prev + 1);

    try {
      if (previousState) await authorService.unfollowAuthor(accountId);
      else await authorService.followAuthor(accountId);
    } catch (error) {
      setIsFollowing(previousState);
      setFollowerCount(prev => previousState ? prev + 1 : prev - 1);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!profile) return null;

  const defaultBanner = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900&auto=format&fit=crop&q=60'; 
  const defaultAvatar = 'https://ui-avatars.com/api/?background=random&size=200&name=' + (profile.username || 'User');
  
  // Lấy Rank từ API
  const rankName = profile.author?.rankName || "Newbie"; 
  const totalStories = profile.author?.publishedStoryCount || 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* --- 1. HEADER & BANNER --- */}
        <View style={styles.headerWrapper}>
          <Image source={{ uri: defaultBanner }} style={styles.bannerImage} contentFit="cover" />
          <View style={styles.darkOverlay} />

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>

          {/* Avatar + Info */}
          <View style={styles.overlayContent}>
             <View style={styles.avatarBorder}>
                <Image source={{ uri: profile.avatarUrl || defaultAvatar }} style={styles.avatar} />
             </View>
             
             <Text style={styles.headerUsername}>{profile.username}</Text>
             
             {/* --- HIỂN THỊ RANK --- */}
             <View style={styles.rankContainer}>
                <Award size={14} color="#FFD700" />
                <Text style={styles.rankText}>{rankName}</Text>
             </View>
          </View>
        </View>

        {/* --- 2. ACTIONS & STATS --- */}
        <View style={styles.actionsContainer}>
          
          {/* Stats Row */}
          <View style={styles.statsRow}>
             <View style={styles.statItem}>
                <Text style={[typography.h4, { color: colors.foreground }]}>{totalStories}</Text>
                <Text style={styles.statLabel}>Tác phẩm</Text>
             </View>
             <View style={styles.divider} />
             <TouchableOpacity style={styles.statItem} onPress={() => setShowFollowers(true)}>
                <Text style={[typography.h4, { color: colors.foreground }]}>{followerCount}</Text>
                <Text style={styles.statLabel}>Người theo dõi</Text>
             </TouchableOpacity>
          </View>

          {/* Nút Follow (Đã bỏ nút nhắn tin) */}
          <TouchableOpacity 
            style={[
              styles.followButton, 
              { backgroundColor: isFollowing ? colors.muted : colors.primary }
            ]}
            onPress={handleToggleFollow}
          >
             {isFollowing ? (
               <><UserCheck size={18} color={colors.foreground} /><Text style={[styles.followText, {color: colors.foreground}]}>Đang theo dõi</Text></>
             ) : (
               <><UserPlus size={18} color="#fff" /><Text style={styles.followText}>Theo dõi</Text></>
             )}
          </TouchableOpacity>

        </View>

        {/* --- 3. TAB NAVIGATION --- */}
        <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'about' && styles.activeTabButton]}
              onPress={() => setActiveTab('about')}
            >
              <Text style={[styles.tabText, { color: activeTab === 'about' ? colors.foreground : colors.mutedForeground }]}>Giới thiệu</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'works' && styles.activeTabButton]}
              onPress={() => setActiveTab('works')}
            >
              <Text style={[styles.tabText, { color: activeTab === 'works' ? colors.foreground : colors.mutedForeground }]}>Tác phẩm</Text>
            </TouchableOpacity>
        </View>

        {/* --- 4. TAB CONTENT --- */}
        <View style={styles.contentContainer}>
            {activeTab === 'about' ? (
              <View>
                 <Text style={[typography.p, { color: colors.foreground, lineHeight: 24 }]}>
                    {profile.bio || "Tác giả này chưa viết giới thiệu."}
                 </Text>
                 <View style={[styles.metaRow, { marginTop: 20 }]}>
                    <Calendar size={16} color={colors.mutedForeground} />
                    <Text style={{ color: colors.mutedForeground, marginLeft: 8 }}>
                        Tham gia {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
                 </View>
              </View>
            ) : (
              // TAB TÁC PHẨM (Dùng StoryListItem kiểu mới)
              <View>
                 {stories.length > 0 ? (
                   stories.map((story, index) => (
                     <StoryListItem
                       key={story.storyId || index}
                       
                       // Truyền đầy đủ props
                       storyId={story.storyId}
                       authorId={profile.accountId} // Fix lỗi authorId missing
                       title={story.title}
                       cover={story.coverUrl}
                       author={story.authorUsername}
                       
                       // --- CHẾ ĐỘ HIỂN THỊ PROFILE ---
                       viewMode="profile" 
                       tags={(story as any).tags || []} // Truyền tags vào
                       // -------------------------------

                       onClick={() => navigation.push('StoryDetail', { storyId: story.storyId })}
                     />
                   ))
                 ) : (
                   <Text style={{ textAlign: 'center', color: colors.mutedForeground, marginTop: 20 }}>
                     Chưa có tác phẩm nào.
                   </Text>
                 )}
              </View>
            )}
        </View>

      </ScrollView>

      <FollowersModal visible={showFollowers} authorId={accountId} onClose={() => setShowFollowers(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerWrapper: { height: 260, width: '100%', alignItems: 'center', justifyContent: 'center' },
  bannerImage: { ...StyleSheet.absoluteFillObject },
  darkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  backButton: { position: 'absolute', top: 50, left: 16, zIndex: 10, padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  
  overlayContent: { alignItems: 'center', marginTop: 10 },
  avatarBorder: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#fff', marginBottom: 10 },
  avatar: { width: '100%', height: '100%', borderRadius: 50 },
  headerUsername: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  
  // Rank Style
  rankContainer: { 
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, 
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#FFD700'
  },
  rankText: { color: '#FFD700', fontWeight: 'bold', fontSize: 12 },

  actionsContainer: { paddingVertical: 16, alignItems: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 40, marginBottom: 16 },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  divider: { width: 1, height: 30, backgroundColor: '#ddd' },

  followButton: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: width * 0.8, height: 44, borderRadius: 22, // Nút dài ra
  },
  followText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  tabContainer: { flexDirection: 'row', marginTop: 10, borderBottomWidth: 1, paddingHorizontal: 20 },
  tabButton: { marginRight: 24, paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTabButton: { borderBottomColor: '#2C6B7C' },
  tabText: { fontSize: 16, fontWeight: '600' },
  contentContainer: { padding: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
});