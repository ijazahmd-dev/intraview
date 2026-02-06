/**
 * Interview API Service
 * Handles REST API calls for interview/booking operations
 */

import API from "../../../utils/axiosClient"; // Adjust path as needed

/**
 * Get booking details
 */
export async function getBookingDetails(bookingId) {
  try {
    const response = await API.get(`/api/bookings/bookings/${bookingId}/`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Failed to fetch booking:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Failed to fetch booking details",
    };
  }
}

/**
 * Get current user info (to determine role)
 */
export async function getCurrentUser() {
  try {
    // Adjust endpoint based on your auth setup
    const response = await API.get("/auth/me/");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Failed to fetch user info",
    };
  }
}

/**
 * Mark session as completed (called when user ends call)
 */
export async function endInterviewSession(bookingId) {
  try {
    const response = await API.post(`/api/bookings/${bookingId}/end/`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Failed to end session:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Failed to end session",
    };
  }
}

/**
 * Get interview session status
 */
export async function getSessionStatus(bookingId) {
  try {
    const response = await API.get(`/api/sessions/${bookingId}/status/`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Failed to fetch session status:", error);
    return {
      success: false,
      error: error.response?.data?.detail || "Failed to fetch session status",
    };
  }
}
