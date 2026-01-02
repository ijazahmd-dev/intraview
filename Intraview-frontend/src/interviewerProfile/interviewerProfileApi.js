import API from "../utils/axiosClient"



// Upload / resubmit verification document
export const submitInterviewerVerification = async (data) => {
  const formData = new FormData();
  formData.append("document_type", data.document_type);
  formData.append("document_number", data.document_number || "");
  if (data.document_file) {
    formData.append("document_file", data.document_file);
  }
  const res = await API.post("/api/interviewer/verification/", formData);
  return res.data;
};

// Get current verification status + details
export const getInterviewerVerificationDetail = async () => {
  const res = await API.get("/api/interviewer/verification/detail/");
  return res.data;
};




// List with optional status filter: "PENDING" | "APPROVED" | "REJECTED" | "NOT_SUBMITTED"
export const fetchAdminVerifications = async (status) => {
  const params = {};
  if (status) params.status = status;
  const res = await API.get("/api/admin/interviewer-verifications/", { params });
  return res.data; // assuming DRF ListAPIView → array
};

// Detail for a single verification
export const fetchAdminVerificationDetail = async (id) => {
  const res = await API.get(`/api/admin/interviewer-verifications/${id}/`);
  return res.data;
};

// Review (approve / reject)
export const reviewAdminVerification = async (id, { action, rejection_reason }) => {
  const payload = { action };
  if (action === "reject") {
    payload.rejection_reason = rejection_reason || "";
  }
  const res = await API.post(
    `/api/admin/interviewer-verifications/${id}/review/`,
    payload
  );
  return res.data;
};

