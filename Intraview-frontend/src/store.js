import { configureStore } from '@reduxjs/toolkit';
import interviewerReducer from './interviewers/interviewerSlice';

export const store = configureStore({
  reducer: {
    // your reducers go here
    interviewer: interviewerReducer,
  },
});
