// src/adminInterviewerSubscriptionApi.js
import API from '../utils/axiosClient';

const adminInterviewerSubscriptionApi = {
  // List all interviewer subscription plans
  getPlans: ({ page = 1, pageSize = 20, active = null } = {}) => {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      page_size: pageSize.toString() 
    });
    if (active !== null) params.append('is_active', active.toString());
    return API.get(`/api/interviewer-subscriptions/interviewer-subscription-plans/?${params}`);
  },
  
  // Create new plan
  createPlan: (data) => API.post('/api/interviewer-subscriptions/interviewer-subscription-plans/', data),
  
  // Retrieve single plan
  getPlan: (id) => API.get(`/api/interviewer-subscriptions/interviewer-subscription-plans/${id}/`),
  
  // Update plan
  updatePlan: (id, data) => API.patch(`/api/interviewer-subscriptions/interviewer-subscription-plans/${id}/`, data),
  
  // Activate plan
  activatePlan: (id) => API.post(`/api/interviewer-subscriptions/interviewer-subscription-plans/${id}/activate/`),
  
  // Deactivate plan  
  deactivatePlan: (id) => API.post(`/api/interviewer-subscriptions/interviewer-subscription-plans/${id}/deactivate/`),
};

export default adminInterviewerSubscriptionApi;
