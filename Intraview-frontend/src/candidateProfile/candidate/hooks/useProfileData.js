// src/hooks/useProfileData.js
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProfile,
  updateProfileAsync,
  fetchProfileCompletion,
  uploadResumeAsync,
  deleteResumeAsync,
  uploadProfilePictureAsync,
} from '../../profileSlice';

/**
 * Custom hook for all profile data & operations
 * Handles fetching, updating, uploading with Redux integration
 */
export const useProfileData = () => {
  const dispatch = useDispatch();
  
  const profile = useSelector((state) => state.profile);
  const {
    user,
    candidateProfile,
    completion,
    resume,
    activeTab,
    isEditing,
    loading,
    errors,
    success,
  } = profile;

  // ============================================
  // FETCH DATA ON MOUNT
  // ============================================

  useEffect(() => {
    // Fetch profile on component mount
    dispatch(fetchProfile());
    dispatch(fetchProfileCompletion());
  }, [dispatch]);

  // ============================================
  // PROFILE UPDATE
  // ============================================

  const handleUpdateProfile = useCallback(
    async (data) => {
      const result = await dispatch(updateProfileAsync(data));
      return result.payload;
    },
    [dispatch]
  );

  // ============================================
  // RESUME OPERATIONS
  // ============================================

  const handleUploadResume = useCallback(
    async (file) => {
      const result = await dispatch(uploadResumeAsync(file));
      return result.payload;
    },
    [dispatch]
  );

  const handleDeleteResume = useCallback(async () => {
    const result = await dispatch(deleteResumeAsync());
    return result.payload;
  }, [dispatch]);

  // ============================================
  // PROFILE PICTURE UPLOAD
  // ============================================

  const handleUploadPicture = useCallback(
    async (file) => {
      const result = await dispatch(uploadProfilePictureAsync(file));
      return result.payload;
    },
    [dispatch]
  );

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Get profile completion percentage
   */
  const getCompletionPercentage = useCallback(() => {
    return completion.percentage;
  }, [completion.percentage]);

  /**
   * Check if field is missing
   */
  const isMissingField = useCallback(
    (fieldName) => {
      return completion.missingFields.includes(fieldName);
    },
    [completion.missingFields]
  );

  /**
   * Get profile picture URL
   */
  const getProfilePicture = useCallback(() => {
    return user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`;
  }, [user?.profilePicture, user?.firstName, user?.lastName]);

  /**
   * Get full name
   */
  const getFullName = useCallback(() => {
    if (candidateProfile?.full_name) {
      return candidateProfile.full_name;
    }
    return `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  }, [candidateProfile?.full_name, user?.firstName, user?.lastName]);

  // ============================================
  // RETURN OBJECT
  // ============================================

  return {
    // Data
    user,
    candidateProfile,
    completion,
    resume,
    activeTab,
    isEditing,

    // Loading states
    isLoadingProfile: loading.profile,
    isUpdatingProfile: loading.update,
    isLoadingCompletion: loading.completion,
    isUploadingResume: loading.resumeUpload,
    isDeletingResume: loading.resumeDelete,
    isUploadingPicture: loading.pictureUpload,

    // Error states
    profileError: errors.profile,
    updateError: errors.update,
    resumeError: errors.resume,
    pictureError: errors.picture,

    // Success messages
    profileSuccess: success.profile,
    resumeSuccess: success.resume,
    pictureSuccess: success.picture,

    // Methods
    handleUpdateProfile,
    handleUploadResume,
    handleDeleteResume,
    handleUploadPicture,

    // Utilities
    getCompletionPercentage,
    isMissingField,
    getProfilePicture,
    getFullName,
  };
};

export default useProfileData;
