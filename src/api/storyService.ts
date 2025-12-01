import apiClient from "./apiClient";

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
  accessType: "free" | "dias" | "paid";
  isLocked: boolean;
  publishedAt: string;
  contentUrl?: string;
  priceDias?: number;
  mood?: {
    code: string;
    name: string;
  };
  moodMusicPaths?: string[];
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
  tags?: TagItem[];
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
  hasAudio: boolean;
  owned: boolean;
  audioUrl: string | null;
}

export interface FavoriteStoryItem {
  storyId: string;
  title: string;
  coverUrl: string;
  authorId: string;
  authorUsername: string;
  notiNewChapter: boolean;
  createdAt: string;
}

export interface TranslationStatus {
  languageCode: string;
  languageName: string;
  isOriginal: boolean;
  hasTranslation: boolean;
  contentUrl: string | null;
  wordCount: number;
}

export interface ChapterTranslationStatusResponse {
  chapterId: string;
  storyId: string;
  originalLanguageCode: string;
  locales: TranslationStatus[];
}

export interface TranslationResponse {
  content: string;
  contentUrl: string;
  cached: boolean;
}

// SERVICE
export const storyService = {
  getStoryDetail: (storyId: string) => {
    return apiClient.get<StoryDetail>(`/api/StoryCatalog/${storyId}`);
  },

  getChapters: (storyId: string) => {
    return apiClient.get<ChapterListResponse>(`/api/ChapterCatalog`, {
      params: { StoryId: storyId, PageSize: 100 },
    });
  },

  getChapterDetail(chapterId: string) {
    return apiClient.get(`/api/ChapterCatalog/${chapterId}`);
  },

  async getChapterContent(contentUrl: string) {
    try {
      let fullUrl = contentUrl;
      if (!contentUrl.startsWith("http")) {
        const R2_BASE_URL =
          "https://pub-15618311c0ec468282718f80c66bcc13.r2.dev";
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

  getTags: () => apiClient.get<TagItem[]>("/api/Tag"),

  searchStories: (params: {
    query?: string;
    tagId?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
  }) => {
    const apiParams: any = {
      page: params.page || 1,
      pageSize: params.pageSize || 100,
      tagId: params.tagId,
      SortBy: params.sort,
    };
    if (params.query && params.query.trim().length > 0) {
      apiParams.query = params.query.trim();
    }
    return apiClient.get<StoryListResponse>("/api/StoryCatalog", {
      params: apiParams,
    });
  },

  getStories: (page = 1, pageSize = 100) => {
    return apiClient.get<StoryListResponse>("/api/StoryCatalog", {
      params: { page, pageSize },
    });
  },

  getTopWeekly: () => {
    return apiClient.get<TopWeeklyItem[]>(
      "/api/StoryCatalog/top-weekly?limit=10"
    );
  },

  getLatest: () => apiClient.get(`/api/StoryCatalog/latest`),

  getStoryRating: (storyId: string) => {
    return apiClient.get<StoryRating>(`/api/StoryRating/${storyId}`);
  },

  submitRating: (storyId: string, score: number) => {
    return apiClient.post(`/api/StoryRating/${storyId}`, { score });
  },

  // FAVORITE API
  getFavoriteStories: (page = 1, pageSize = 20) => {
    return apiClient.get("/api/FavoriteStory", { params: { page, pageSize } });
  },

  addFavorite: (storyId: string) => {
    return apiClient.post(`/api/FavoriteStory/${storyId}`);
  },

  removeFavorite: (storyId: string) => {
    return apiClient.delete(`/api/FavoriteStory/${storyId}`);
  },

  // Bật/Tắt thông báo cho 1 truyện yêu thích cụ thể
  toggleStoryNotification: (storyId: string, enable: boolean) => {
    // API document ghi là PUT body object, nhưng curl ví dụ không thấy body rõ ràng
    return apiClient.put(`/api/FavoriteStory/${storyId}/notifications`, {
      enabled: enable,
    });
  },
  // TRANSLATION API

  // 1. Kiểm tra trạng thái dịch (Sửa kiểu trả về)
  getTranslationStatus: (chapterId: string) => {
    return apiClient.get<ChapterTranslationStatusResponse>(
      `/api/ChapterTranslation/${chapterId}`
    );
  },

  // 2. Trigger dịch
  triggerTranslate: (chapterId: string, targetLanguageCode: string) => {
    return apiClient.post(`/api/ChapterTranslation/${chapterId}`, {
      targetLanguageCode,
    });
  },

  // 3. Lấy nội dung
  getTranslatedContent: (chapterId: string, languageCode: string) => {
    return apiClient.get<TranslationResponse>(
      `/api/ChapterTranslation/${chapterId}`,
      {
        params: { languageCode },
      }
    );
  },

  checkPremiumStatus: async () => {
    try {
      return false; // Test mode
    } catch (error) {
      console.error("Lỗi check premium:", error);
      return false;
    }
  },
};

export const chapterService = {
  getSystemVoices: () => {
    return apiClient.get<SystemVoice[]>("/api/VoiceChapter/voice-list");
  },
  getChapterVoicesStatus: (chapterId: string) => {
    return apiClient.get<ChapterVoiceStatus[]>(
      `/api/ChapterCatalog/${chapterId}/voices`
    );
  },
  buyChapter: (chapterId: string) => {
    return apiClient.post(`/api/ChapterPurchase/${chapterId}`);
  },
  buyVoiceForChapter: (chapterId: string, voiceIds: string[]) => {
    const payload = { voiceIds: voiceIds };
    return apiClient.post(
      `/api/ChapterPurchase/${chapterId}/order-voice`,
      payload
    );
  },
  getChapterDetail: (chapterId: string) => {
    return apiClient.get(`/api/ChapterCatalog/${chapterId}`);
  },
};
export const subscriptionService = {
  // 1. Lấy trạng thái gói cước (để check có được claim ko)
  getStatus: () => {
    return apiClient.get('/api/Subscription/status');
  },
  
  // 2. Nhận kim cương hàng ngày (API bạn cần cho Notification)
  claimDaily: () => {
    return apiClient.post('/api/Subscription/claim-daily');
  }
};