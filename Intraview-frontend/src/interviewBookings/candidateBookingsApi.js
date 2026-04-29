


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


    // Reschedule (new request-based flow)
  rescheduleOptions: (bookingId) =>
    `/api/bookings/${bookingId}/reschedule/options/`,
  rescheduleRequest: (bookingId) =>
    `/api/bookings/${bookingId}/reschedule/request/`,
  notifyInterviewerNewSlot: (bookingId) =>
    `/api/bookings/${bookingId}/reschedule/notify-interviewer/`,
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



  // NEW request-based reschedule flow

  /**
   * GET /api/bookings/:bookingId/reschedule/options/
   * Returns has_slots, can_request, etc.
   */
  getRescheduleOptions: (bookingId) =>
    API.get(ENDPOINTS.rescheduleOptions(bookingId)),

  /**
   * POST /api/bookings/:bookingId/reschedule/request/
   * body: { proposed_availability_id, note }
   */
  submitRescheduleRequest: (bookingId, data) =>
    API.post(ENDPOINTS.rescheduleRequest(bookingId), data),

  /**
   * POST /api/bookings/:bookingId/reschedule/notify-interviewer/
   * body: { preferred_window }
   */
  notifyInterviewerForNewSlot: (bookingId, data) =>
    API.post(ENDPOINTS.notifyInterviewerNewSlot(bookingId), data),

};





// export async function getRescheduleOptions(bookingId) {
//   const res = await api.get(`/bookings/${bookingId}/reschedule/options/`);
//   return res.data;
// }


// export async function requestReschedule(bookingId, payload) {
//   const res = await api.post(`/bookings/${bookingId}/reschedule/request/`, payload);
//   return res.data;
// }



// export async function notifyInterviewerForNewSlot(bookingId, payload) {
//   const res = await api.post(
//     `/bookings/${bookingId}/reschedule/notify-interviewer/`,
//     payload
//   );
//   return res.data;
// }



// export async function getInterviewerUpcomingSessions() {
//   const res = await api.get('/bookings/dashboard/interviewer/upcoming/');
//   return res.data;
// }




// export async function acceptReschedule(bookingId) {
//   const res = await api.post(`/bookings/${bookingId}/reschedule/accept/`);
//   return res.data;
// }



// export async function rejectReschedule(bookingId, payload) {
//   const res = await api.post(`/bookings/${bookingId}/reschedule/reject/`, payload);
//   return res.data;
// }


