import apiClient from './apiClient';

// --- INTERFACES (Dựa trên dự đoán chuẩn, bạn kiểm tra lại với Swagger response thực tế) ---

export interface UserCommentInfo {
  accountId: string;
  username: string;
  avatarUrl: string | null;
}

export interface CommentItem {
  id: string; // hoặc commentId
  content: string;
  createdAt: string;
  userId: string; 
  
  // Thường backend sẽ trả về object User lồng bên trong hoặc các trường user phẳng
  userInfo?: UserCommentInfo; // Hoặc user: UserCommentInfo
  username?: string;          // Hoặc phẳng như này
  avatarUrl?: string;

  parentId?: string | null; // Nếu là reply comment
  replyCount?: number;
  likeCount?: number;
  isLiked?: boolean; // Người dùng hiện tại có like chưa
}

export interface CommentListResponse {
  items: CommentItem[];
  total: number;
  page: number;
  pageSize: number;
}

// --- SERVICE ---

export const commentService = {
  // 1. Lấy comment theo Chương (Dùng trong Reader Screen)
  getCommentsByChapter: (chapterId: string, page = 1) => {
    return apiClient.get<CommentListResponse>(`/api/ChapterComment/chapter/${chapterId}`, {
      params: { page, pageSize: 20 }
    });
  },

  // 2. Lấy comment theo Truyện (Dùng trong Story Detail)
  getCommentsByStory: (storyId: string, page = 1) => {
    return apiClient.get<CommentListResponse>(`/api/ChapterComment/story/${storyId}`, {
      params: { page, pageSize: 20 }
    });
  },

  // 3. Gửi comment mới (POST)
  postComment: (chapterId: string, content: string, parentCommentId?: string) => {
    return apiClient.post(`/api/ChapterComment/${chapterId}`, {
      content,
      parentCommentId: parentCommentId || null
    });
  },

  // 4. Like/Reaction comment (POST reaction)
  reactToComment: (chapterId: string, commentId: string, type: 'Like' | 'Love' = 'Like') => {
    return apiClient.post(`/api/ChapterComment/${chapterId}/${commentId}/reaction`, {
      reactionType: type
    });
  },

  // 5. Bỏ Like (DELETE reaction)
  removeReaction: (chapterId: string, commentId: string) => {
    return apiClient.delete(`/api/ChapterComment/${chapterId}/${commentId}/reaction`);
  }
};