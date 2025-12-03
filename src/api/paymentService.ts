import apiClient from './apiClient';

// Interface dựa trên response JSON từ Backend
export interface PricingPackage {
  pricingId: string;
  amountVnd: number;      // Giá tiền (VNĐ)
  diamondGranted: number; // Số kim cương nhận được
  isActive: boolean;
  updatedAt: string;
}


export interface SubscriptionPlan {
  planCode: string;      
  planName: string;     
  priceVnd: number;      
  durationDays: number;  
  dailyDias: number;    
}
interface PaymentResponse {
  checkoutUrl: string;
  transactionId: string;
}
export const paymentService = {
  /**
   * Lấy danh sách các gói nạp từ server
   */
  getPricing: () => {
    return apiClient.get<PricingPackage[]>('/api/Payment/pricing');
  },

  /**
   * Tạo link thanh toán
   * @param amount Số tiền cần thanh toán (VNĐ)
   */

  // 1. [MỚI] Lấy danh sách gói Subscription từ API
  getSubscriptionPlans: () => {
    return apiClient.get<SubscriptionPlan[]>('/api/Subscription/plans');
  },

  // 2. Tạo link thanh toán cho Gói Tháng (Subscription)
  createSubscriptionLink: (planCode: string) => {
    return apiClient.post<PaymentResponse>('/api/Payment/create-subscription-link', {
      planCode: planCode
    });
  },
  createPaymentLink: (amount: number) => {
    return apiClient.post<PaymentResponse>('/api/Payment/create-link', {
      amount: amount
    });
  },
};