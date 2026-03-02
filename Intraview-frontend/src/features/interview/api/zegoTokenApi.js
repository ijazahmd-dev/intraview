


import API from "../../../utils/axiosClient";

export async function fetchZegoToken(bookingId) {
  try {
    const res = await API.get(`/api/realtime/zego/token/${bookingId}/`);
    // Assuming DRF returns the token payload as JSON body
    return res.data;
  } catch (err) {
    let message = "Failed to fetch Zego token";

    if (err.response) {
      const { status, data } = err.response;
      if (data?.detail || data?.error) {
        message = data.detail || data.error;
      } else {
        message = `Failed to fetch Zego token (${status})`;
      }
    } else if (err.message) {
      message = err.message;
    }

    throw new Error(message);
  }
}
