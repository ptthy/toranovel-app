import apiClient from './apiClient';

// ==========================================
// 1. CÁC TYPE CHO CHI TIẾT TRUYỆN (Detail)
// ==========================================
export interface Tag {
  tagId: string;
  tagName: string; // API chi tiết trả về "tagName"
}

export interface StoryDetail {
  storyId: string;
  title: string;
  authorId: string;
  authorUsername: string;
  coverUrl: string;
  isPremium: boolean;
  description: string;
  totalChapters: number;
  publishedAt: string;
  lengthPlan: string;
  tags: Tag[];
}

// ==========================================
// 2. CÁC TYPE CHO DANH SÁCH CHƯƠNG (Chapters)
// ==========================================
export interface Chapter {
  chapterId: string;
  chapterNo: number;
  title: string;
  languageCode: string;
  wordCount: number;
  accessType: 'free' | 'paid';
  isLocked: boolean;
  publishedAt: string;
}

export interface ChapterListResponse {
  items: Chapter[];
  total: number;
  page: number;
  pageSize: number;
}

// ==========================================
// 3. CÁC TYPE CHO TÌM KIẾM & DANH SÁCH (Search)
// ==========================================

// Type cho 1 truyện trong danh sách tìm kiếm (ngắn gọn hơn StoryDetail)
export interface Story {
  storyId: string;
  title: string;
  authorId: string;
  authorUsername: string;
  coverUrl: string;
  totalChapters: number;
  publishedAt: string;
  shortDescription?: string;
  lengthPlan?: string;
  // Lưu ý: API search có thể trả về cấu trúc tag khác hoặc không có tag
}

// Type trả về của API tìm kiếm
export interface StoryListResponse {
  items: Story[];
  total: number;
  page: number;
  pageSize: number;
}

// Type cho API lấy danh sách Tag (/api/Tag)
export interface TagItem {
  tagId: string;
  name: string; // Lưu ý: API /api/Tag trả về "name", khác với "tagName" ở trên
}

// ==========================================
// 4. STORY SERVICE (Đã sửa lỗi đóng ngoặc)
// ==========================================
export const storyService = {
  /**
   * GET /api/StoryCatalog/{storyId}
   * Lấy thông tin chi tiết truyện
   */
  getStoryDetail: (storyId: string) => {
    return apiClient.get<StoryDetail>(`/api/StoryCatalog/${storyId}`);
  },

  /**
   * GET /api/ChapterCatalog?StoryId={storyId}
   * Lấy danh sách chương
   */
  getChapters: (storyId: string) => {
    return apiClient.get<ChapterListResponse>(`/api/ChapterCatalog`, {
      params: { 
        StoryId: storyId, 
        PageSize: 100 
      } 
    });
  },

  /**
   * GET /api/Tag
   * Lấy danh sách tất cả các thể loại (để lọc)
   */
  getTags: () => {
    return apiClient.get<TagItem[]>('/api/Tag');
  },

  /**
   * GET /api/StoryCatalog
   * Tìm kiếm và Lọc truyện
   */
  searchStories: (params: { 
    page?: number; 
    pageSize?: number; 
    query?: string; // Tìm theo tên
    tagId?: string; // Lọc theo tag
  }) => {
    return apiClient.get<StoryListResponse>('/api/StoryCatalog', {
      params: {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        query: params.query,
        tagId: params.tagId,
      },
    });
  },
};