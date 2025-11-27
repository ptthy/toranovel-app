import apiClient from './apiClient';

// Các loại đối tượng có thể báo cáo (khớp với quy định của Backend)
export type ReportTargetType = 'Story' | 'chapter' | 'Comment';

export interface ReportRequest {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details: string;
}

export const reportService = {
  // Gửi báo cáo
  submitReport: (data: ReportRequest) => {
    return apiClient.post('/api/Report', data);
  },
};