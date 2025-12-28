import API from "../utils/axiosClient";

export const fetchOnboardingStatus = () =>
  API.get("api/interviewer/onboarding/status/");

export const fetchProfile = () =>
  API.get("api/interviewer/profile/");

export const saveProfile = (formData) =>
  API.post("api/interviewer/profile/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const fetchAvailability = () =>
  API.get("api/interviewer/availability/");

export const createAvailability = (payload) =>
  API.post("api/interviewer/availability/create/", payload);

export const deleteAvailability = (slotId) =>
  API.delete(`api/interviewer/availability/${slotId}/delete/`);

export const submitVerification = (formData) =>
  API.post("api/interviewer/verification/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const fetchVerificationStatus = () =>
  API.get("api/interviewer/verification/status/");

export const completeOnboarding = () =>
  API.post("api/interviewer/onboarding/complete/");
