import API from '../../../utils/axiosClient';


const feedbackApi = {
  // Submit evaluation for booking
  submitEvaluation: async (bookingId, data) => {
    const response = await API.post(
      `/api/feedback/interviewer/evaluations/bookings/${bookingId}/submit/`,
      data
    );
    return response.data;
  },
  
  // Get interviewer's evaluations list
  getMyEvaluations: async () => {
    const response = await API.get('/api/feedback/interviewer/evaluations/');
    return response.data;
  },
  
  // Get single evaluation details
  getEvaluation: async (evaluationId) => {
    const response = await API.get(`/api/feedback/interviewer/evaluations/${evaluationId}/`);
    return response.data;
  },
  
  // Check if evaluation can be submitted for booking
  checkEvaluationStatus: async (bookingId) => {
    const response = await API.get(
      `/api/feedback/interviewer/evaluations/bookings/${bookingId}/status/`
    );
    return response.data;
  },
};

export default feedbackApi;
