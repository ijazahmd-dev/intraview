import API from '../utils/axiosClient';



const ENDPOINTS = {
  current: "/api/subscriptions/me/",  
  plans: "/api/subscriptions/plans/",
  checkout: "/api/payments/subscriptions/checkout/",
};

export const subscriptionsApi = {
  getCurrentSubscription: () => API.get(ENDPOINTS.current),
  getSubscriptionPlans: () => API.get(ENDPOINTS.plans),
  createCheckout: (planId) => API.post(ENDPOINTS.checkout, { plan_id: planId }),
};