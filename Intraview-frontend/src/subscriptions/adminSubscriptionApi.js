// src/adminSubscriptionApi.js
import API from '../utils/axiosClient';

const adminSubscriptionApi = {
  // List all plans
  getPlans: ({ page = 1, pageSize = 20, active = null } = {}) => {
    const params = new URLSearchParams({ page: page.toString(), page_size: pageSize.toString() });
    if (active !== null) params.append('is_active', active.toString());
    return API.get(`/api/user-subscriptions/plans/?${params}`);
  },
  
  // Create new plan
  createPlan: (data) => API.post('/api/user-subscriptions/plans/', data),
  
  // Retrieve single plan
  getPlan: (id) => API.get(`/api/user-subscriptions/plans/${id}/`),
  
  // Update plan
  updatePlan: (id, data) => API.patch(`/api/user-subscriptions/plans/${id}/`, data),
  
  // Activate plan
  activatePlan: (id) => API.post(`/api/user-subscriptions/plans/${id}/activate/`),
  
  // Deactivate plan  
  deactivatePlan: (id) => API.post(`/api/user-subscriptions/plans/${id}/deactivate/`),
};

export default adminSubscriptionApi;
