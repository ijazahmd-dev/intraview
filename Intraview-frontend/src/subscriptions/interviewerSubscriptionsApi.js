import API from "../utils/axiosClient";



const ENDPOINTS = {
  plans: "/api/interviewer-subscriptions/plans/",
  current: "/api/interviewer-subscriptions/me/",
  checkout: "/api/payments/interviewer/subscription/checkout/",
  invoiceDownload: (orderId) => `/api/interviewer-subscriptions/invoice/${orderId}/`,
};

export const interviewerSubscriptionsApi = {
  getPlans: () => API.get(ENDPOINTS.plans),
  getCurrentSubscription: () => API.get(ENDPOINTS.current),
  createCheckout: (planId) => API.post(ENDPOINTS.checkout, { 
    plan_id: planId 
  }),
  downloadSubscriptionInvoice: async (orderId) => {
    const response = await API.get(ENDPOINTS.invoiceDownload(orderId), {
      responseType: 'blob'
    });
    return response.data;
  },
};