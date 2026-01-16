// src/candidateWalletApi.js
import API from '../utils/axiosClient';

const candidateWalletApi = {
  // Wallet Summary
  getWalletSummary: () => API.get('/api/wallet/candidate/summary/'),
  
  // Transactions (with filters + pagination)
  getTransactions: ({ page = 1, pageSize = 20, type = null } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (type) params.append('type', type);
    
    return API.get(`/api/wallet/candidate/transactions/?${params}`);
  },
  
  // Stats
  getWalletStats: () => API.get('/api/wallet/candidate/stats/'),
};

export default candidateWalletApi;
