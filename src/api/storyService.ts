import apiClient from './apiClient';

// --- 1. Type cho Chi tiết Truyện (StoryCatalog) ---
export interface Tag {
  tagId: string;
  tagName: string;
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

// --- 2. Type cho Chương (ChapterCatalog) ---
// Dựa trên JSON 
export interface Chapter {
  chapterId: string;
  chapterNo: number;
  title: string;
  languageCode: string;
  wordCount: number;
  accessType: 'free' | 'paid'; // "free"
  isLocked: boolean;
  publishedAt: string;
}

// Type trả về của API lấy danh sách chương (Paginated)
export interface ChapterListResponse {
  items: Chapter[];
  total: number;
  page: number;
  pageSize: number;
}

export const storyService = {
  /**
   * GET /api/StoryCatalog/{storyId}
   * Lấy thông tin chi tiết truyện (Metadata)
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
};