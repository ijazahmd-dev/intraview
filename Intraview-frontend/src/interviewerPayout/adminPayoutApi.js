// src/services/adminPayoutApi.js
import API from '../utils/axiosClient';

const API_BASE_URL = '/api/wallet/admin-wallet-payouts';

const handleApiError = (error) => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  return 'Something went wrong. Please try again.';
};

export const getAdminPayoutQueue = async (params = {}) => {
  try {
    const response = await API.get(`${API_BASE_URL}/queue/`, { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

export const getAdminPayoutHistory = async (params = {}) => {
  try {
    const response = await API.get(`${API_BASE_URL}/history/`, { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

export const getAdminPayoutDetail = async (payoutId) => {
  try {
    const response = await API.get(`${API_BASE_URL}/${payoutId}/`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

export const approvePayout = async (payoutId, payload = {}) => {
  try {
    const response = await API.post(`${API_BASE_URL}/${payoutId}/approve/`, payload);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

export const rejectPayout = async (payoutId, payload) => {
  try {
    const response = await API.post(`${API_BASE_URL}/${payoutId}/reject/`, payload);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

export const markPayoutPaid = async (payoutId, payload = {}) => {
  try {
    const response = await API.post(`${API_BASE_URL}/${payoutId}/mark-paid/`, payload);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

export const getAdminPayoutStats = async () => {
  try {
    const response = await API.get(`${API_BASE_URL}/stats/`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};
