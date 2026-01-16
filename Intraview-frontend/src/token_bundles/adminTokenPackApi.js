// src/adminTokenPackApi.js
import API from '../utils/axiosClient';

const adminTokenPackApi = {
  // List + Filter token packs
  getTokenPacks: ({ 
    page = 1, 
    pageSize = 20, 
    active = null, 
    min_price = null, 
    max_price = null,
    search = null 
  } = {}) => {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      page_size: pageSize.toString() 
    });
    
    if (active !== null) params.append('is_active', active.toString());
    if (min_price !== null) params.append('min_price', min_price.toString());
    if (max_price !== null) params.append('max_price', max_price.toString());
    if (search) params.append('search', search);
    
    return API.get(`/api/payments/admin/payments/token-packs/?${params}`);
  },
  
  // Create new token pack
  createTokenPack: (data) => API.post('/api/payments/admin/payments/token-packs/', data),
  
  // Update token pack (PATCH only)
  updateTokenPack: (id, data) => API.patch(`/api/payments/admin/payments/token-packs/${id}/`, data),
  
  // Retrieve single pack
  getTokenPack: (id) => API.get(`/api/payments/admin/payments/token-packs/${id}/`),
};

export default adminTokenPackApi;
