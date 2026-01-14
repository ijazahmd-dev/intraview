import API from "../utils/axiosClient";

const ENDPOINTS = {
  tokenPacks: '/api/payments/token-packs/',
  purchase: '/api/payments/token-purchase/',
};

export const tokenApi = {
  getTokenPacks: () => API.get(ENDPOINTS.tokenPacks),
  createPurchase: (tokenPackId) => API.post(ENDPOINTS.purchase, { 
    token_pack_id: parseInt(tokenPackId) 
  }),
};