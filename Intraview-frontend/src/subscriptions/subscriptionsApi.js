import API from '../utils/axiosClient';



export const subscriptionAPI = {
  // Get user's current subscription
  getCurrentSubscription: () => API.get('/api/subscriptions/me/'),
  
  // Get all available plans
  getSubscriptionPlans: () => API.get('/api/subscriptions/plans/'),
};