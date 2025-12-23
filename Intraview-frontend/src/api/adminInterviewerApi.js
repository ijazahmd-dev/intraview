import API from "../utils/axiosClient";


export const fetchInterviewerApplications = (status) => {
  const params = status ? { status } : {};
  return API.get("/api/admin/interviewer-applications/", { params });
};

export const fetchInterviewerApplicationDetail = (id) => {
  return API.get(`/api/admin/interviewer-applications/${id}/`);
};

export const reviewInterviewerApplication = (id, payload) => {
  return API.post(
    `/api/admin/interviewer-applications/${id}/review/`,
    payload
  );
};