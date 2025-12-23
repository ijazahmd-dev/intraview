import API from '../utils/axiosClient'

export const interviewerLogin = (data) =>
  API.post("/auth/interviewer/login/", data);

export const interviewerForgotPassword = (data) =>
  API.post("/auth/forgot-password/", data);

export const interviewerVerifyOtp = (data) =>
  API.post("/auth/forgot-password/verify-otp/", data);

export const interviewerResetPassword = (data) =>
  API.post("/auth/forgot-password/reset/", data);