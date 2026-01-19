import API from '../utils/axiosClient';



const ENDPOINTS = {
  current: "/api/user-subscriptions/subscriptions/me/",  
  plans: "/api/user-subscriptions/subscriptions/plans/",
  checkout: "/api/payments/subscriptions/checkout/",
  invoiceDownload: (orderId) => `/api/user-subscriptions/subscriptions/invoice/${orderId}/`,
};

export const subscriptionsApi = {
  getCurrentSubscription: () => API.get(ENDPOINTS.current),
  getSubscriptionPlans: () => API.get(ENDPOINTS.plans),
  createCheckout: (planId) => API.post(ENDPOINTS.checkout, { plan_id: planId }),
  downloadSubscriptionInvoice: async (orderId) => {
    const response = await API.get(ENDPOINTS.invoiceDownload(orderId), {
      responseType: 'blob'
    });
    return response.data;
  },
};