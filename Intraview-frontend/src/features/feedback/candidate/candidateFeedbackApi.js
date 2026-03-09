// src/features/feedback/candidate/candidateFeedbackApi.js

import API from '../../../utils/axiosClient';

// All endpoints are under /api/feedback/...
// (from the urls.py you shared)

const candidateFeedbackApi = {
  // 1) List evaluations the candidate has received
  // GET /api/feedback/candidate/evaluations/
  getMyEvaluations: async () => {
    const response = await API.get('/api/feedback/candidate/evaluations/');
    // Backend returns a plain list (no {results: []})
    // so just return response.data
    return response.data;
  },

  // 2) Single evaluation detail
  // GET /api/feedback/candidate/evaluations/:evaluationId/
  getEvaluationDetail: async (evaluationId) => {
    const response = await API.get(
      `/api/feedback/candidate/evaluations/${evaluationId}/`
    );
    return response.data;
  },

  // 3) Submit a review about the interviewer for a booking
  // POST /api/feedback/candidate/reviews/bookings/:bookingId/submit/
  submitInterviewerReview: async (bookingId, data) => {
    const response = await API.post(
      `/api/feedback/candidate/reviews/bookings/${bookingId}/submit/`,
      data
    );
    // { message, review: InterviewerReviewDetailSerializer }
    return response.data;
  },

  // 4) Get a specific review the candidate has already given
  // GET /api/feedback/candidate/reviews/:reviewId/
  getReviewDetail: async (reviewId) => {
    const response = await API.get(
      `/api/feedback/candidate/reviews/${reviewId}/`
    );
    return response.data;
  },
};

export default candidateFeedbackApi;
