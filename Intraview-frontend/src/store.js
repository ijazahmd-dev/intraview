import { configureStore } from '@reduxjs/toolkit';
import interviewerReducer from './interviewers/interviewerSlice';
import admininterviewerReducer from './interviewers/admin/adminInterviewerSlice';
import interviewerAuthReducer from './authentication/interviewerAuthSlice'
import authReducer from "./authentication/authSlice";
import adminAuthReducer from "./authentication/adminAuthSlice";

export const store = configureStore({
  reducer: {
    // your reducers go here
    interviewer: interviewerReducer,
    adminInterviewer:admininterviewerReducer,
    interviewerAuth: interviewerAuthReducer,
    auth: authReducer,
    adminAuth: adminAuthReducer,
  },
});
