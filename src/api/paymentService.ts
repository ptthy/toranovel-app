import apiClient from './apiClient';

interface PaymentResponse {
  checkoutUrl: string;
  transactionId: string;
}

export const paymentService = {
  /**
   * Tạo link thanh toán
   * @param amount Số tiền cần thanh toán (VNĐ)
   */
  createPaymentLink: (amount: number) => {
    return apiClient.post<PaymentResponse>('/api/Payment/create-link', {
      amount: amount
    });
  },
};