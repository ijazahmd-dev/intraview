import API from "../utils/axiosClient";

const ENDPOINTS = {
  tokenPacks: '/api/payments/token-packs/',
  purchase: '/api/payments/token-purchase/',
  paymentOrder: (orderId) => `/api/payments/order/${orderId}/`, 
  invoiceDownload: (orderId) => `/api/payments/invoice/${orderId}/`,
};

export const tokenApi = {
  getTokenPacks: () => API.get(ENDPOINTS.tokenPacks),
  createPurchase: (tokenPackId) => API.post(ENDPOINTS.purchase, { 
    token_pack_id: parseInt(tokenPackId) 
  }),

  getPaymentOrder: (orderId) => API.get(ENDPOINTS.paymentOrder(orderId)),

  downloadPaymentInvoice: async (orderId) => {
    const response = await API.get(ENDPOINTS.invoiceDownload(orderId), {
      responseType: 'blob'  // ✅ CRITICAL for PDF
    });
    return response.data;
  },
};