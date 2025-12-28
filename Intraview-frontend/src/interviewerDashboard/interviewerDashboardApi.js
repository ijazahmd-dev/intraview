import API from "../utils/axiosClient";

export const fetchDashboardSummary = () =>
  API.get("api/interviewer/dashboard/");

export const fetchProfile = () =>
  API.get("api/interviewer/me/profile/");

export const updateProfile = (payload) =>
  API.put("api/interviewer/me/profile/", payload);

export const patchProfile = (payload) =>
  API.patch("api/interviewer/me/profile/", payload);

export const fetchAvailability = () =>
  API.get("api/interviewer/availability/");

export const createAvailability = (payload) =>
  API.post("api/interviewer/availability/create/", payload);

export const deleteAvailability = (slotId) =>
  API.delete(`api/interviewer/availability/${slotId}/delete/`);
