import apiClient from './apiClient';
import { Story } from './storyService'; 

// --- INTERFACES DỰA TRÊN RESPONSE BODY ---

// 1. Cấu trúc thông tin thống kê tác giả (nằm trong field 'author')
export interface AuthorStats {
  authorId: string;
  rankName: string;        // Bronze, Silver...
  rankRewardRate: number;
  rankMinFollowers: number;
  totalFollower?: number; 

  followerCount: number;      
  publishedStoryCount: number; 
  
  isRestricted: boolean;
  isVerified: boolean;
}

// 2. Cấu trúc Profile trả về từ API /api/PublicProfile/{id}
export interface PublicProfileResponse {
  accountId: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  gender: string;
  
  createdAt: string;
  isAuthor: boolean;
  
  // Object chứa thông tin thống kê
  author: AuthorStats | null; 

  // Trạng thái follow. Nếu null = chưa follow. Nếu có object = đang follow
  followState: { 
    isNotificationEnabled: boolean 
  } | null;
}

// 3. Cấu trúc người theo dõi (Follower)
export interface FollowerUser {
  accountId: string;
  username: string;
  avatarUrl: string | null;
  followerSince?: string;
}

// 4. Response danh sách followers (có phân trang)
export interface FollowerListResponse {
  items: FollowerUser[];
  total: number;
  page: number;
  pageSize: number;
}

// 5. Response danh sách truyện của tác giả
export interface AuthorStoryResponse {
  items: Story[];
  total: number;
  page: number;
  pageSize: number;
}

// --- SERVICE ---

export const authorService = {
  // Lấy thông tin profile (bao gồm cả trạng thái follow và stats)
  getPublicProfile: (accountId: string) => {
    return apiClient.get<PublicProfileResponse>(`/api/PublicProfile/${accountId}`);
  },

  // Lấy danh sách truyện của tác giả
  getAuthorStories: (accountId: string) => {
    return apiClient.get<AuthorStoryResponse>(`/api/PublicProfile/${accountId}/stories`, {
      params: { Page: 1, PageSize: 50, SortBy: 'Newest' } // Lấy nhiều chút
    });
  },

  // Follow tác giả (Body: { "enableNotifications": true })
  followAuthor: (authorId: string) => {
    return apiClient.post(`/api/AuthorFollow/${authorId}`, { enableNotifications: true });
  },

  // Hủy Follow tác giả
  unfollowAuthor: (authorId: string) => {
    return apiClient.delete(`/api/AuthorFollow/${authorId}`);
  },

  // Lấy danh sách người theo dõi
  getFollowers: (authorId: string, page = 1) => {
    return apiClient.get<FollowerListResponse>(`/api/AuthorFollow/${authorId}/followers`, {
      params: { page, pageSize: 20 }
    });
  }
};