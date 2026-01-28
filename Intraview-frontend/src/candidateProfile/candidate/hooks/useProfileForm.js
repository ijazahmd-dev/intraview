// src/hooks/useProfileForm.js
import { useState, useCallback } from 'react';

/**
 * Custom hook for form handling in profile sections
 * Manages form state, validation, and submission
 */
export const useProfileForm = (initialData, onSubmit) => {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================
  // HANDLE INPUT CHANGE
  // ============================================

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setIsDirty(true);

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  }, [errors]);

  // ============================================
  // HANDLE ARRAY FIELDS (Skills, Interview Types)
  // ============================================

  const handleArrayChange = useCallback((fieldName, newArray) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: newArray,
    }));
    setIsDirty(true);
  }, []);

  // ============================================
  // HANDLE BLUR (Mark as touched)
  // ============================================

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  // ============================================
  // VALIDATE FIELD
  // ============================================

  const validateField = useCallback((name, value) => {
    let error = null;

    switch (name) {
      case 'full_name':
        if (value && value.trim().length < 2) {
          error = 'Full name must be at least 2 characters';
        }
        break;

      case 'phone':
        if (value && !/^[+\d\s\-()]{10,}$/.test(value)) {
          error = 'Invalid phone number format';
        }
        break;

      case 'location':
        if (value && value.trim().length < 3) {
          error = 'Location must be at least 3 characters';
        }
        break;

      case 'target_role':
        if (value && value.trim().length < 2) {
          error = 'Target role must be at least 2 characters';
        }
        break;

      case 'years_experience':
        if (value !== '' && value !== null) {
          const num = parseInt(value);
          if (isNaN(num) || num < 0 || num > 100) {
            error = 'Experience must be between 0 and 100 years';
          }
        }
        break;

      case 'linkedin_url':
      case 'github_url':
      case 'portfolio_url':
        if (value && !value.startsWith('https://')) {
          error = `${name.replace('_', ' ')} must start with https://`;
        }
        break;

      case 'interviewer_notes':
        if (value && value.length > 500) {
          error = 'Notes cannot exceed 500 characters';
        }
        break;

      default:
        break;
    }

    return error;
  }, []);

  // ============================================
  // VALIDATE ENTIRE FORM
  // ============================================

  const validateForm = useCallback(() => {
    const newErrors = {};

    Object.keys(formData).forEach((fieldName) => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  // ============================================
  // HANDLE SUBMIT
  // ============================================

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        await onSubmit(formData);
        setIsDirty(false);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm, onSubmit]
  );

  // ============================================
  // RESET FORM
  // ============================================

  const resetForm = useCallback(() => {
    setFormData(initialData || {});
    setErrors({});
    setTouched({});
    setIsDirty(false);
  }, [initialData]);

  // ============================================
  // UPDATE SPECIFIC FIELD
  // ============================================

  const setFieldValue = useCallback((name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsDirty(true);
  }, []);

  // ============================================
  // GET FIELD ERROR
  // ============================================

  const getFieldError = useCallback(
    (name) => {
      return touched[name] ? errors[name] : null;
    },
    [touched, errors]
  );

  // ============================================
  // RETURN OBJECT
  // ============================================

  return {
    // Form data
    formData,
    errors,
    touched,
    isDirty,
    isSubmitting,

    // Handlers
    handleChange,
    handleBlur,
    handleSubmit,
    handleArrayChange,
    setFieldValue,

    // Utilities
    validateField,
    validateForm,
    resetForm,
    getFieldError,
  };
};

export default useProfileForm;
