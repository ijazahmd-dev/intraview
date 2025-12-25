import API from "../utils/axiosClient";

export const fetchOnboardingStatus = () =>
  API.get("/interviewer/onboarding/status/");

export const fetchProfile = () =>
  API.get("/interviewer/profile/");

export const saveProfile = (formData) =>
  API.post("/interviewer/profile/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const fetchAvailability = () =>
  API.get("/interviewer/availability/");

export const createAvailability = (payload) =>
  API.post("/interviewer/availability/create/", payload);

export const deleteAvailability = (slotId) =>
  API.delete(`/interviewer/availability/${slotId}/delete/`);

export const submitVerification = (formData) =>
  API.post("/interviewer/verification/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const fetchVerificationStatus = () =>
  API.get("/interviewer/verification/status/");

export const completeOnboarding = () =>
  API.post("/interviewer/onboarding/complete/");
