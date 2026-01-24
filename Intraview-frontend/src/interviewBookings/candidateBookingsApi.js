


import API from '../utils/axiosClient';

const ENDPOINTS = {
  // Interviewer endpoints
  interviewers: '/api/bookings/candidates/interviewers/',
  interviewerDetail: (id) => `/api/bookings/candidates/interviewers/${id}/`,
  calendarAvailability: (id, date) => `/api/bookings/candidates/interviewers/${id}/calendar/`,
  
  // Booking creation
  createBooking: '/api/bookings/create-booking/',
  
  // Dashboard & History
  upcomingBookings: '/api/bookings/dashboard/candidate/upcoming/',
  pastBookings: '/api/bookings/dashboard/candidate/history/',
  
  // Booking details & actions
  bookingDetail: (bookingId) => `/api/bookings/bookings-detail/${bookingId}/`,
  cancelBooking: (bookingId) => `/api/bookings/bookings/${bookingId}/cancel/`,
  completeBooking: (bookingId) => `/api/bookings/bookings/${bookingId}/complete/`,
  
  // Token management
  tokenBalance: '/api/bookings/candidate/token-balance/',
  tokenSummary: '/api/bookings/dashboard/candidate/token-summary/',
};

export const candidateBookingsApi = {
  // Interviewer management
  getInterviewers: (params = {}) =>
    API.get(ENDPOINTS.interviewers, { params }),

  getInterviewerDetail: (interviewerId) =>
    API.get(ENDPOINTS.interviewerDetail(interviewerId)),

  getCalendarAvailability: (interviewerId, date) =>
    API.get(ENDPOINTS.calendarAvailability(interviewerId), {
      params: date ? { date } : {},
    }),

  // Booking creation
  createBooking: (availabilityId) => 
    API.post(ENDPOINTS.createBooking, { availability_id: availabilityId }),

  // Dashboard bookings
  getUpcomingBookings: () =>
    API.get(ENDPOINTS.upcomingBookings),

  getPastBookings: () =>
    API.get(ENDPOINTS.pastBookings),

  // Booking details & actions
  getBookingDetail: (bookingId) =>
    API.get(ENDPOINTS.bookingDetail(bookingId)),

  cancelBooking: (bookingId, data = {}) =>
    API.post(ENDPOINTS.cancelBooking(bookingId), data),

  completeBooking: (bookingId) =>
    API.post(ENDPOINTS.completeBooking(bookingId), {}),

  // Token management
  getTokenBalance: () =>
    API.get(ENDPOINTS.tokenBalance),

  getTokenSummary: () =>
    API.get(ENDPOINTS.tokenSummary),

  rescheduleBooking: (bookingId, data) =>
    API.post(`/api/bookings/bookings/${bookingId}/reschedule/`, data),
};


