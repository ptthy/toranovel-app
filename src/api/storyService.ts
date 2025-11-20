import apiClient from './apiClient';

// --- TYPES ---
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
  averageRating?: number;
}

export interface StoryListResponse {
  items: Story[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TagItem {
  tagId: string;
  name: string; 
}

// --- SERVICE ---
export const storyService = {
  getStoryDetail: (storyId: string) => {
    return apiClient.get<StoryDetail>(`/api/StoryCatalog/${storyId}`);
  },

  getChapters: (storyId: string) => {
    return apiClient.get<ChapterListResponse>(`/api/ChapterCatalog`, {
      params: { StoryId: storyId, PageSize: 100 } 
    });
  },

  getTags: () => {
    return apiClient.get<TagItem[]>('/api/Tag');
  },

  // --- SỬA ĐOẠN NÀY ĐỂ FIX LỖI SEARCH ---
  searchStories: (params: { 
    page?: number; 
    pageSize?: number; 
    query?: string; 
    tagId?: string; 
  }) => {
    // Tạo object params sạch (không gửi query rỗng)
    const apiParams: any = {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      tagId: params.tagId,
    };

    // Chỉ gửi query nếu người dùng thực sự gõ chữ
    if (params.query && params.query.trim() !== '') {
      apiParams.query = params.query;
    }

    return apiClient.get<StoryListResponse>('/api/StoryCatalog', {
      params: apiParams,
    });
  },

  // Các API này có thể trả về Mảng [] hoặc Object {items: []} tùy backend
  // Chúng ta để Type là any để xử lý linh hoạt bên màn hình
  getTopWeekly: () => {
    return apiClient.get<any>('/api/StoryCatalog/top-weekly');
  },

  getLatest: () => {
    return apiClient.get<any>('/api/StoryCatalog/latest');
  },
};