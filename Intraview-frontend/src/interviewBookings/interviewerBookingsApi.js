// src/api/interviewerBookingsApi.js
import API from '../utils/axiosClient';

const ENDPOINTS = {
  upcomingSessions: '/api/bookings/dashboard/interviewer/upcoming/',
  completedSessions: '/api/bookings/dashboard/interviewer/history/',
  bookingDetail: (bookingId) => `/api/bookings/dashboard/interviewer/bookings/${bookingId}/`,
  cancelBooking: (bookingId) => `/api/bookings/bookings/${bookingId}/cancel-by-interviewer/`,

  // NEW: reschedule request handling
  acceptReschedule: (bookingId) =>
    `/api/bookings/${bookingId}/reschedule/accept/`,
  rejectReschedule: (bookingId) =>
    `/api/bookings/${bookingId}/reschedule/reject/`,

};

export const interviewerBookingsApi = {
  getUpcomingSessions: () => API.get(ENDPOINTS.upcomingSessions),
  getCompletedSessions: () => API.get(ENDPOINTS.completedSessions),
  getBookingDetail: (bookingId) => API.get(ENDPOINTS.bookingDetail(bookingId)),
  cancelBooking: (bookingId, reason) => 
    API.post(ENDPOINTS.cancelBooking(bookingId), { reason }),

  // NEW: reschedule actions
  acceptReschedule: (bookingId) =>
    API.post(ENDPOINTS.acceptReschedule(bookingId)),

  rejectReschedule: (bookingId, reason) =>
    API.post(ENDPOINTS.rejectReschedule(bookingId), { reason }),

};
