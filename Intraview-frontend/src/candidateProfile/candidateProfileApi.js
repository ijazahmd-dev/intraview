import API from "../utils/axiosClient";




/**
 * Candidate Profile API endpoints
 * Base: /api/candidate/
 */

// ============================================
// PROFILE ENDPOINTS
// ============================================

/**
 * GET /api/candidate/profile/me/
 * Fetch current user's full profile
 */
export const getMyProfile = () => {
  return API.get('api/candidate/profile/me/');
};

/**
 * PATCH /api/candidate/profile/me/
 * Update current user's profile
 * 
 * @param {Object} data - Fields to update
 * Example:
 * {
 *   user_first_name: "John",
 *   user_last_name: "Doe",
 *   full_name: "John Doe",
 *   phone: "9876543210",
 *   location: "Mumbai, Maharashtra",
 *   timezone: "Asia/Kolkata",
 *   target_role: "Frontend Developer",
 *   experience_level: "JUNIOR",
 *   years_experience: 2,
 *   skills: ["React", "JavaScript", "Python"],
 *   current_status: "Working",
 *   current_role: "Junior Developer",
 *   preferred_interview_types: ["TECHNICAL", "DSA"],
 *   preferred_difficulty: "INTERMEDIATE",
 *   preferred_duration: 60,
 *   interviewer_notes: "Focus on React hooks",
 *   linkedin_url: "https://linkedin.com/in/johndoe",
 *   github_url: "https://github.com/johndoe",
 *   portfolio_url: "https://johndoe.com"
 * }
 */
export const updateProfile = (data) => {
  return API.patch('api/candidate/profile/me/', data);
};

/**
 * GET /api/candidate/profile/completion/
 * Get profile completion percentage & missing fields
 */
export const getProfileCompletion = () => {
  return API.get('api/candidate/profile/completion/');
};

// ============================================
// RESUME ENDPOINTS
// ============================================

/**
 * POST /api/candidate/profile/resume/upload/
 * Upload resume to Cloudinary
 * 
 * @param {File} file - PDF file (max 5MB)
 */
export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append('resume_file', file);
  
  return API.post('api/candidate/profile/resume/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * GET /api/candidate/profile/resume/status/
 * Get current resume status & URL
 */
export const getResumeStatus = () => {
  return API.get('api/candidate/profile/resume/status/');
};

/**
 * DELETE /api/candidate/profile/resume/delete/
 * Delete uploaded resume
 */
export const deleteResume = () => {
  return API.delete('api/candidate/profile/resume/delete/');
};

// ============================================
// PROFILE PICTURE ENDPOINTS
// ============================================

/**
 * POST /api/candidate/profile/picture/upload/
 * Upload profile picture to Cloudinary
 * 
 * @param {File} file - Image file (jpg/png/gif, max 5MB)
 */
export const uploadProfilePicture = (file) => {
  const formData = new FormData();
  formData.append('profile_picture', file);
  
  return API.post('api/candidate/profile/picture/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// ============================================
// HELPER METHODS
// ============================================

/**
 * Validate file before upload
 * @param {File} file
 * @param {string} type - 'resume' or 'picture'
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateFile = (file, type) => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `File size must be less than 5MB (${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
    };
  }

  if (type === 'resume') {
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Only PDF files are allowed for resume' };
    }
  }

  if (type === 'picture') {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Only JPG, PNG, and GIF images are allowed',
      };
    }
  }

  return { valid: true };
};




