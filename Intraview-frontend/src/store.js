import { configureStore } from '@reduxjs/toolkit';
import interviewerReducer from './interviewers/interviewerSlice';
import admininterviewerReducer from './interviewers/admin/adminInterviewerSlice';

export const store = configureStore({
  reducer: {
    // your reducers go here
    interviewer: interviewerReducer,
    adminInterviewer:admininterviewerReducer
  },
});
