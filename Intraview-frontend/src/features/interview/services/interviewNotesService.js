// src/services/interviewNotesService.js

import {
  fetchInterviewerNotes,
  saveInterviewerNotes,
} from "../api/zegoTokenApi";

/**
 * Interviewer notes service - simple wrapper around API calls.
 * No local state, no React dependencies.
 */
export class InterviewNotesService {
  constructor(bookingId) {
    this.bookingId = bookingId;
  }

  /**
   * Fetch notes for the booking (returns empty if candidate or no notes).
   */
  async fetchNotes() {
    return await fetchInterviewerNotes(this.bookingId);
  }

  /**
   * Save/update notes (only works for interviewer).
   */
  async saveNotes(content) {
    return await saveInterviewerNotes(this.bookingId, content);
  }
}
