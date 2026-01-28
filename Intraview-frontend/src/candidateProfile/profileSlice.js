// src/store/slices/profileSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as candidateProfileApi from './candidateProfileApi';

// ============================================
// ASYNC THUNKS
// ============================================

/**
 * Fetch current user's profile
 */
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await candidateProfileApi.getMyProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch profile');
    }
  }
);

/**
 * Update profile
 */
export const updateProfileAsync = createAsyncThunk(
  'profile/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      const response = await candidateProfileApi.updateProfile(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update profile');
    }
  }
);

/**
 * Fetch profile completion
 */
export const fetchProfileCompletion = createAsyncThunk(
  'profile/fetchCompletion',
  async (_, { rejectWithValue }) => {
    try {
      const response = await candidateProfileApi.getProfileCompletion();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch completion');
    }
  }
);

/**
 * Upload resume
 */
export const uploadResumeAsync = createAsyncThunk(
  'profile/uploadResume',
  async (file, { rejectWithValue }) => {
    try {
      const response = await candidateProfileApi.uploadResume(file);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to upload resume');
    }
  }
);

/**
 * Delete resume
 */
export const deleteResumeAsync = createAsyncThunk(
  'profile/deleteResume',
  async (_, { rejectWithValue }) => {
    try {
      const response = await candidateProfileApi.deleteResume();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete resume');
    }
  }
);

/**
 * Upload profile picture
 */
export const uploadProfilePictureAsync = createAsyncThunk(
  'profile/uploadProfilePicture',
  async (file, { rejectWithValue }) => {
    try {
      const response = await candidateProfileApi.uploadProfilePicture(file);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to upload picture');
    }
  }
);

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
  // Profile data
  user: null,
  candidateProfile: null,
  
  // Completion tracking
  completion: {
    percentage: 0,
    missingFields: [],
  },

  // Resume
  resume: {
    hasResume: false,
    resumeFileUrl: null,
    resumeUrl: null,
    uploadStatus: 'DONE',
    uploadedAt: null,
  },

  // UI State
  activeTab: 'overview', // overview, preferences, tokens, resume (link), settings (link)
  isEditing: false,
  editingField: null,

  // Loading states
  loading: {
    profile: false,
    update: false,
    completion: false,
    resumeUpload: false,
    resumeDelete: false,
    pictureUpload: false,
  },

  // Error states
  errors: {
    profile: null,
    update: null,
    completion: null,
    resume: null,
    picture: null,
  },

  // Success messages
  success: {
    profile: null,
    resume: null,
    picture: null,
  },
};

// ============================================
// SLICE
// ============================================

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  
  reducers: {
    // Set active tab
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },

    // Toggle edit mode
    setIsEditing: (state, action) => {
      state.isEditing = action.payload;
    },

    // Set field being edited
    setEditingField: (state, action) => {
      state.editingField = action.payload;
    },

    // Clear success messages
    clearSuccess: (state) => {
      state.success = {
        profile: null,
        resume: null,
        picture: null,
      };
    },

    // Clear error messages
    clearErrors: (state) => {
      state.errors = {
        profile: null,
        update: null,
        completion: null,
        resume: null,
        picture: null,
      };
    },

    // Reset to initial state
    resetProfile: (state) => {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    // ============================================
    // FETCH PROFILE
    // ============================================
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading.profile = true;
        state.errors.profile = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading.profile = false;
        state.user = {
          id: action.payload.user_id,
          email: action.payload.user_email,
          firstName: action.payload.user_first_name,
          lastName: action.payload.user_last_name,
          profilePicture: action.payload.user_profile_picture,
        };
        state.candidateProfile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading.profile = false;
        state.errors.profile = action.payload;
      });

    // ============================================
    // UPDATE PROFILE
    // ============================================
    builder
      .addCase(updateProfileAsync.pending, (state) => {
        state.loading.update = true;
        state.errors.update = null;
        state.success.profile = null;
      })
      .addCase(updateProfileAsync.fulfilled, (state, action) => {
        state.loading.update = false;
        state.success.profile = 'Profile updated successfully!';
        
        // Update profile data
        if (action.payload.data) {
          state.candidateProfile = action.payload.data;
        } else {
          state.candidateProfile = action.payload;
        }
        
        state.isEditing = false;
        state.editingField = null;

        // Clear success after 3 seconds
        setTimeout(() => {
          state.success.profile = null;
        }, 3000);
      })
      .addCase(updateProfileAsync.rejected, (state, action) => {
        state.loading.update = false;
        state.errors.update = action.payload;
      });

    // ============================================
    // FETCH COMPLETION
    // ============================================
    builder
      .addCase(fetchProfileCompletion.pending, (state) => {
        state.loading.completion = true;
        state.errors.completion = null;
      })
      .addCase(fetchProfileCompletion.fulfilled, (state, action) => {
        state.loading.completion = false;
        state.completion = {
          percentage: action.payload.completion_percentage || 0,
          missingFields: action.payload.missing_fields || [],
        };
      })
      .addCase(fetchProfileCompletion.rejected, (state, action) => {
        state.loading.completion = false;
        state.errors.completion = action.payload;
      });

    // ============================================
    // UPLOAD RESUME
    // ============================================
    builder
      .addCase(uploadResumeAsync.pending, (state) => {
        state.loading.resumeUpload = true;
        state.errors.resume = null;
        state.success.resume = null;
      })
      .addCase(uploadResumeAsync.fulfilled, (state, action) => {
        state.loading.resumeUpload = false;
        state.resume = {
          hasResume: action.payload.data?.has_resume || true,
          resumeFileUrl: action.payload.data?.resume_file_url || null,
          resumeUrl: action.payload.data?.resume_url || null,
          uploadStatus: action.payload.data?.upload_status || 'DONE',
          uploadedAt: action.payload.data?.uploaded_at || new Date().toISOString(),
        };
        state.success.resume = 'Resume uploaded successfully!';

        // Clear success after 3 seconds
        setTimeout(() => {
          state.success.resume = null;
        }, 3000);
      })
      .addCase(uploadResumeAsync.rejected, (state, action) => {
        state.loading.resumeUpload = false;
        state.errors.resume = action.payload;
      });

    // ============================================
    // DELETE RESUME
    // ============================================
    builder
      .addCase(deleteResumeAsync.pending, (state) => {
        state.loading.resumeDelete = true;
        state.errors.resume = null;
      })
      .addCase(deleteResumeAsync.fulfilled, (state) => {
        state.loading.resumeDelete = false;
        state.resume = {
          hasResume: false,
          resumeFileUrl: null,
          resumeUrl: null,
          uploadStatus: 'DONE',
          uploadedAt: null,
        };
        state.success.resume = 'Resume deleted successfully!';

        // Clear success after 3 seconds
        setTimeout(() => {
          state.success.resume = null;
        }, 3000);
      })
      .addCase(deleteResumeAsync.rejected, (state, action) => {
        state.loading.resumeDelete = false;
        state.errors.resume = action.payload;
      });

    // ============================================
    // UPLOAD PROFILE PICTURE
    // ============================================
    builder
      .addCase(uploadProfilePictureAsync.pending, (state) => {
        state.loading.pictureUpload = true;
        state.errors.picture = null;
        state.success.picture = null;
      })
      .addCase(uploadProfilePictureAsync.fulfilled, (state, action) => {
        state.loading.pictureUpload = false;
        if (state.user) {
          state.user.profilePicture = action.payload.picture_url || action.payload.data?.picture_url;
        }
        state.success.picture = 'Profile picture updated successfully!';

        // Clear success after 3 seconds
        setTimeout(() => {
          state.success.picture = null;
        }, 3000);
      })
      .addCase(uploadProfilePictureAsync.rejected, (state, action) => {
        state.loading.pictureUpload = false;
        state.errors.picture = action.payload;
      });
  },
});

// ============================================
// EXPORTS
// ============================================

export const {
  setActiveTab,
  setIsEditing,
  setEditingField,
  clearSuccess,
  clearErrors,
  resetProfile,
} = profileSlice.actions;

export default profileSlice.reducer;
