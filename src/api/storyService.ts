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
 accessType: 'free' | 'dias' | 'paid';
  isLocked: boolean;
  publishedAt: string;
  contentUrl?: string;
  priceDias?: number;
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

export interface StoryRating {
  averageScore: number;
  totalRatings: number;
  viewerRating?: number;
}
export interface TopWeeklyItem {
  story: Story;
  weeklyViewCount: number;
  weekStartUtc: string;
}
export interface SystemVoice {
  voiceId: string;
  voiceName: string;
  voiceCode: string;
  description: string;
}

// Voice đã mua trả về trong chi tiết chương
export interface PurchasedVoice {
  voiceId: string;
  audioUrl: string;
  status: string; 
}
export interface ChapterVoiceStatus {
  voiceId: string;
  voiceName: string;
  voiceCode: string;
  status: string;
  priceDias: number;
  hasAudio: boolean; // Quan trọng: true mới được mua
  owned: boolean;    // true là đã mua rồi
  audioUrl: string | null;
}
// --- FIXED SERVICE ---
export const storyService = {
  getStoryDetail: (storyId: string) => {
    return apiClient.get<StoryDetail>(`/api/StoryCatalog/${storyId}`);
  },

  getChapters: (storyId: string) => {
    return apiClient.get<ChapterListResponse>(`/api/ChapterCatalog`, {
      params: { StoryId: storyId, PageSize: 100 }
    });
  },

  // SỬA ĐÚNG ENDPOINT
  getChapterDetail(chapterId: string) {
    return apiClient.get(`/api/ChapterCatalog/${chapterId}`);
  },

  // ✔️ HÀM LẤY NỘI DUNG CHƯƠNG ĐÃ ĐẶT ĐÚNG CHỖ
  async getChapterContent(contentUrl: string) {
    try {
      let fullUrl = contentUrl;

      if (!contentUrl.startsWith("http")) {
        const R2_BASE_URL = "https://pub-15618311c0ec468282718f80c66bcc13.r2.dev";
        fullUrl = `${R2_BASE_URL}/${contentUrl}`;
      }

      const res = await fetch(fullUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      return await res.text();
    } catch (err) {
      console.error("Error loading chapter content:", err);
      throw err;
    }
  },

  getTags: () => apiClient.get<TagItem[]>('/api/Tag'),

  searchStories: (params: { query?: string; tagId?: string; page?: number; pageSize?: number;sort?: string;

   }) => {
    const apiParams: any = {
      page: params.page || 1,
      pageSize: params.pageSize || 100, // Tăng mặc định lên 100 nếu không truyền
      tagId: params.tagId,
      SortBy: params.sort,
    };
    // Nếu API hỗ trợ search text qua param 'search' hoặc 'query', hãy chắc chắn đúng key
    if (params.query && params.query.trim().length > 0) {
      apiParams.query = params.query.trim();
    }

    return apiClient.get<StoryListResponse>('/api/StoryCatalog', { params: apiParams });
  },

  // 2. Thêm hàm lấy danh sách chung (thay thế getLatest cũ nếu cần)
  getStories: (page = 1, pageSize = 100) => {
     return apiClient.get<StoryListResponse>('/api/StoryCatalog', { 
       params: { page, pageSize } 
     });
  },

getTopWeekly: () => {
    return apiClient.get<TopWeeklyItem[]>('/api/StoryCatalog/top-weekly?limit=10');
  },
  getLatest: () => apiClient.get(`/api/StoryCatalog/latest`),

  getStoryRating: (storyId: string) => {
    return apiClient.get<StoryRating>(`/api/StoryRating/${storyId}`);
  },

  submitRating: (storyId: string, score: number) => {
    return apiClient.post(`/api/StoryRating/${storyId}`, { score });
  },
};

export const chapterService = {
  // 1. Lấy danh sách voice của hệ thống (Dùng cho settings nếu cần)
  getSystemVoices: () => {
    return apiClient.get<SystemVoice[]>('/api/VoiceChapter/voice-list');
  },

  // --- 2. THÊM MỚI: Lấy tình trạng voice của 1 chương cụ thể ---
  getChapterVoicesStatus: (chapterId: string) => {
    return apiClient.get<ChapterVoiceStatus[]>(`/api/ChapterCatalog/${chapterId}/voices`);
  },

  // 3. Mua chương
  buyChapter: (chapterId: string) => {
    return apiClient.post(`/api/ChapterPurchase/${chapterId}`);
  },

  // 4. Mua Voice
  buyVoiceForChapter: (chapterId: string, voiceIds: string[]) => {
    const payload = { voiceIds: voiceIds };
    return apiClient.post(`/api/ChapterPurchase/${chapterId}/order-voice`, payload);
  },

  // 5. Lấy chi tiết chương
  getChapterDetail: (chapterId: string) => {
    return apiClient.get(`/api/ChapterCatalog/${chapterId}`);
  }
};