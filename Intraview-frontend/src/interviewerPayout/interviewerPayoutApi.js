

import API from '../utils/axiosClient'; 

const PAYOUT_ENDPOINTS = {
  // Interviewer endpoints
  REQUEST: '/api/wallet/payouts/request/',
  LIST: '/api/wallet/payouts/',
  DETAIL: (id) => `/api/wallet/payouts/${id}/`,
  STATS: '/api/wallet/payouts/stats/',
  ELIGIBILITY: '/api/wallet/payouts/eligibility/',
};

// ============================================
// INTERVIEWER PAYOUT API CALLS
// ============================================

/**
 * Check payout eligibility
 * GET /api/wallet/payouts/eligibility/
 */
export const checkPayoutEligibility = async () => {
  try {
    const response = await API.get(PAYOUT_ENDPOINTS.ELIGIBILITY);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to check eligibility',
      details: error.response?.data?.details || error.message,
    };
  }
};

/**
 * Create payout request
 * POST /api/wallet/payouts/request/
 */
export const createPayoutRequest = async (payoutData) => {
  try {
    const response = await API.post(PAYOUT_ENDPOINTS.REQUEST, payoutData);
    return {
      success: true,
      data: response.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to create payout request',
      details: error.response?.data?.details || error.message,
      fieldErrors: error.response?.data?.details || {}, // For form field errors
    };
  }
};

/**
 * Get payout list
 * GET /api/wallet/payouts/?status=REQUESTED
 */
export const getPayoutList = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.page_size) params.append('page_size', filters.page_size);
    
    const response = await API.get(
      `${PAYOUT_ENDPOINTS.LIST}?${params.toString()}`
    );
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch payouts',
      details: error.response?.data?.details || error.message,
    };
  }
};

/**
 * Get payout detail
 * GET /api/wallet/payouts/{id}/
 */
export const getPayoutDetail = async (payoutId) => {
  try {
    const response = await API.get(PAYOUT_ENDPOINTS.DETAIL(payoutId));
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch payout details',
      details: error.response?.data?.details || error.message,
    };
  }
};

/**
 * Get payout statistics
 * GET /api/wallet/payouts/stats/
 */
export const getPayoutStats = async () => {
  try {
    const response = await API.get(PAYOUT_ENDPOINTS.STATS);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch stats',
      details: error.response?.data?.details || error.message,
    };
  }
};

export default {
  checkPayoutEligibility,
  createPayoutRequest,
  getPayoutList,
  getPayoutDetail,
  getPayoutStats,
};
