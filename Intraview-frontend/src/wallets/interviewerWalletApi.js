// src/interviewerWalletApi.js
import API from '../utils/axiosClient';

const interviewerWalletApi = {
  // Wallet Summary
  getWalletSummary: () => API.get('/api/wallet/interviewer/summary/'),
  
  // Transactions (with filters + pagination)
  getTransactions: ({ page = 1, pageSize = 20, type = null } = {}) => {
    console.log('🔗 Transactions URL building...'); // DEBUG
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(), // Django pagination expects "page_size"
    });
    if (type) params.append('type', type);
    
    const url = `/api/wallet/interviewer/transactions/?${params.toString()}`;
    console.log('🔗 Final URL:', url); // DEBUG
    
    return API.get(url);
  },
  
  // Earnings Summary (Key for Interviewers)
  getEarnings: () => API.get('/api/wallet/interviewer/earnings/'),
  
  // Full Stats
  getWalletStats: () => API.get('/api/wallet/interviewer/stats/'),
  
  // Earnings Transactions Only
  getEarningsTransactions: ({ page = 1, pageSize = 20 } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    return API.get(`/api/wallet/interviewer/earnings/transactions/?${params}`);
  },
};

export default interviewerWalletApi;
