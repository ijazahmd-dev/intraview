import API from '../utils/axiosClient';


const ENDPOINTS = {
  interviewers: '/api/bookings/candidates/interviewers/',
  interviewerDetail: (id) => `/api/bookings/candidates/interviewers/${id}/`,
  availability: (id) => `/api/bookings/candidates/interviewers/${id}/availability/`,
  createBooking: '/api/bookings/',
};

export const candidateBookingsApi = {
  getInterviewers: (params = {}) =>
    API.get(ENDPOINTS.interviewers, { params }),

  getInterviewerDetail: (interviewerId) =>
    API.get(ENDPOINTS.interviewerDetail(interviewerId)),

  getAvailability: (interviewerId, date) =>
    API.get(ENDPOINTS.availability(interviewerId), {
      params: date ? { date } : {},
    }),

  createBooking: (availabilityId) => 
  API.post('/api/bookings/bookings/', { availability_id: availabilityId }),


  getTokenBalance: () => API.get('/api/bookings/candidate/token-balance/'),
};

