import API from '../utils/axiosClient'

export const interviewerLogin = (data) =>
  API.post("/auth/interviewer/login/", data);

export const getCurrentInterviewer = async () => {
  return await API.get("/auth/interviewer/me/");
};

export const interviewerLogout = async () => {
const res = await API.post("/auth/interviewer/logout/");
return res.data;
}