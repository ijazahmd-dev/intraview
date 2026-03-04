


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



export async function notifyDisconnect(bookingId) {
  try {
    const resp = await API.post(
      `/api/realtime/zego/disconnect/${bookingId}/`
    );
    return resp.data;
  } catch (err) {
    // best-effort; log but don't break UI
    console.error("Disconnect API failed:", err);
    return null;
  }
}




export async function fetchInterviewerNotes(bookingId) {
  try {
    const res = await API.get(`/api/realtime/interviewer-notes/${bookingId}/`);
    return res.data;
  } catch (err) {
    if (err.response?.status === 403) {
      // Candidate tried to access notes - just return empty
      return { content: "", updated_at: null };
    }
    console.error("Failed to fetch interviewer notes:", err);
    return { content: "", updated_at: null };
  }
}

export async function saveInterviewerNotes(bookingId, content) {
  try {
    const res = await API.put(`/api/realtime/interviewer-notes/${bookingId}/`, {
      content: content || "",
    });
    return res.data;
  } catch (err) {
    console.error("Failed to save interviewer notes:", err);
    throw err;
  }
}
