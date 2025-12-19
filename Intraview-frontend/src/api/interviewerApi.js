import API from "../utils/axiosClient";


const interviewerApi = {
  getStatus: async () => {
    const res = await API.get("/api/interviewer/status/");
    return res.data;
  },

  apply: async (data) => {
    const res = await API.post("/api/interviewer/apply/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  getEligibility: async () => {
    const res = await API.get("/api/interviewer/eligibility/");
    return res.data;
  },
};

export default interviewerApi;
