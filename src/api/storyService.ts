import apiClient from "./apiClient";

// --- INTERFACES ---

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

// Interface cho trạng thái gói cước (Premium)
export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  planCode: string | null;
  planName: string | null;
  startAt: string | null;
  endAt: string | null;
  dailyDias: number;
  priceVnd: number;
  lastClaimedAt: string | null;
  canClaimToday: boolean;
}

// --- STORY SERVICE ---
export const storyService = {
  // 1. Kiểm tra User có phải Premium không
  checkPremiumStatus: async () => {
    try {
      const res = await apiClient.get<SubscriptionStatus>('/api/Subscription/status');
      return res.data && res.data.hasActiveSubscription;
    } catch (error) {
      console.error("Lỗi kiểm tra Premium:", error);
      return false; 
    }
  },

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

  toggleStoryNotification: (storyId: string, enable: boolean) => {
    return apiClient.put(`/api/FavoriteStory/${storyId}/notifications`, {
      enabled: enable,
    });
  },

  // TRANSLATION API
  getTranslationStatus: (chapterId: string) => {
    return apiClient.get<ChapterTranslationStatusResponse>(
      `/api/ChapterTranslation/${chapterId}`
    );
  },

  triggerTranslate: (chapterId: string, targetLanguageCode: string) => {
    return apiClient.post(`/api/ChapterTranslation/${chapterId}`, {
      targetLanguageCode,
    });
  },

  getTranslatedContent: (chapterId: string, languageCode: string) => {
    // Lưu ý: Endpoint này có thể không tồn tại trong Swagger,
    // nhưng ReaderScreen đang dùng triggerTranslate để lấy URL nên hàm này ít dùng.
    return apiClient.get<TranslationResponse>(`/api/ChapterTranslation/${chapterId}`, {
        params: { languageCode }
    });
  }
};

// --- CHAPTER SERVICE (Dành cho mua bán & chi tiết) ---
export const chapterService = {
  // Lấy chi tiết chương
  getChapterDetail: (chapterId: string) => {
    return apiClient.get(`/api/ChapterCatalog/${chapterId}`);
  },

  // Lấy trạng thái giọng đọc
  getChapterVoicesStatus: (chapterId: string) => {
    return apiClient.get<ChapterVoiceStatus[]>(`/api/ChapterCatalog/${chapterId}/voices`);
  },

  // Mua chương (Đúng Swagger: ID trên URL)
  buyChapter: (chapterId: string) => {
    return apiClient.post(`/api/ChapterPurchase/${chapterId}`);
  },

  // Mua giọng đọc cho chương (Đúng Swagger: ID trên URL)
  buyVoiceForChapter: (chapterId: string, voiceIds: string[]) => {
    return apiClient.post(`/api/ChapterPurchase/${chapterId}/order-voice`, { voiceIds });
  }
};

// --- SUBSCRIPTION SERVICE ---
export const subscriptionService = {
    getStatus: () => {
        return apiClient.get<SubscriptionStatus>('/api/Subscription/status');
    },
    claimDaily: () => {
        return apiClient.post('/api/Subscription/claim-daily');
    }
};