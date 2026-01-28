import { configureStore } from '@reduxjs/toolkit';
import interviewerReducer from './interviewers/interviewerSlice';
import admininterviewerReducer from './interviewers/admin/adminInterviewerSlice';
import interviewerAuthReducer from './authentication/interviewerAuthSlice'
import authReducer from "./authentication/authSlice";
import adminAuthReducer from "./authentication/adminAuthSlice";
import subscriptionReducer from './subscriptions/subscriptionSlice';
import tokenReducer from './token_bundles/tokenSlice';
import candidateWalletReducer from './wallets/candidateWalletSlice';
import interviewerWalletReducer from './wallets/interviewerWalletSlice';
import adminSubscriptionReducer from './subscriptions/adminSubscriptionSlice';
import adminInterviewerSubscriptionReducer from './subscriptions/adminInterviewerSubscriptionSlice';
import adminTokenPackReducer from './token_bundles/adminTokenPackSlice';
import profileReducer from './candidateProfile/profileSlice';

export const store = configureStore({
  reducer: {
    // your reducers go here
    interviewer: interviewerReducer,
    adminInterviewer:admininterviewerReducer,
    interviewerAuth: interviewerAuthReducer,
    auth: authReducer,
    adminAuth: adminAuthReducer,
    subscription: subscriptionReducer,
    tokens: tokenReducer,
    candidateWallet: candidateWalletReducer,
    interviewerWallet: interviewerWalletReducer,
    adminSubscription: adminSubscriptionReducer,
    adminInterviewerSubscription: adminInterviewerSubscriptionReducer,
    adminTokenPack: adminTokenPackReducer,
    profile: profileReducer,
  },
});
