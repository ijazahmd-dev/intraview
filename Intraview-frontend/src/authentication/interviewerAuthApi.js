import API from '../utils/axiosClient'

export const interviewerLogin = (data) =>
  API.post("/auth/interviewer/login/", data);

export const interviewerLogout = async () => {
const res = await API.post("/auth/interviewer/logout/");
return res.data;
}