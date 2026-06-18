// src/candidateProfile/candidate/hooks/useProfileForm.js





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
      case 'user_first_name':
        if (!value) {
          error = 'First name is required';
        } else if (value.trim().length < 2 || value.trim().length > 50) {
          error = 'First name must be between 2 and 50 characters';
        } else if (!/^[A-Za-z\s]+$/.test(value)) {
          error = 'First name must contain only letters';
        }
        break;

      case 'user_last_name':
        if (value) {
          if (value.trim().length < 2 || value.trim().length > 50) {
            error = 'Last name cannot exceed 50 characters';
          } else if (!/^[A-Za-z\s]+$/.test(value)) {
            error = 'Last name can only contain letters';
          }
        }
        break;

      case 'full_name':
        if (!value) {
          error = 'Display name is required';
        } else if (value.trim().length < 3 || value.trim().length > 60) {
          error = 'Display name must be between 3 and 60 characters';
        } else if (!/^[A-Za-z0-9\s]+$/.test(value)) {
          error = 'Display name contains invalid characters';
        }
        break;

      case 'phone':
        if (!value) {
          error = 'Enter a valid phone number';
        } else {
          let testVal = value.replace(/\s/g, '');
          if (testVal.startsWith('+91')) testVal = testVal.substring(3);
          else if (testVal.startsWith('91') && testVal.length === 12) testVal = testVal.substring(2);
          
          if (!/^\d{10}$/.test(testVal)) {
            error = 'Phone number must contain exactly 10 digits';
          }
        }
        break;

      case 'location':
        if (!value) {
          error = 'Location is required';
        } else if (value.trim().length < 2 || value.trim().length > 100) {
          error = 'Enter a valid location';
        } else if (!/^[A-Za-z\s,\-]+$/.test(value)) {
          error = 'Location contains invalid characters';
        }
        break;

      case 'headline':
        if (value && value.length > 150) {
          error = 'Headline cannot exceed 150 characters';
        }
        break;

      case 'bio':
        if (value && value.length > 1000) {
          error = 'About me cannot exceed 1000 characters';
        }
        break;

      case 'current_status':
        if (!value) {
          error = 'Please select your current status';
        }
        break;

      case 'current_role':
        if (!value) {
          error = 'Current role is required';
        } else if (value.trim().length < 2 || value.trim().length > 100) {
          error = 'Current role must be between 2 and 100 characters';
        }
        break;

      case 'target_role':
        if (!value) {
          error = 'Target role is required';
        } else if (value.trim().length < 2 || value.trim().length > 100) {
          error = 'Target role must be between 2 and 100 characters';
        }
        break;

      case 'experience_level':
        if (!value) {
          error = 'Select an experience level';
        }
        break;

      case 'years_experience':
        if (value === '' || value === null || value === undefined) {
          error = 'Enter valid years of experience';
        } else {
          const num = parseFloat(value);
          if (isNaN(num) || num < 0 || num > 50) {
            error = 'Years of experience must be between 0 and 50';
          }
        }
        break;

      case 'skills':
        if (!value || !Array.isArray(value) || value.length < 1) {
          error = 'Add at least 1 skill';
        } else if (value.length > 20) {
          error = 'Maximum 20 skills allowed';
        } else {
          const seen = new Set();
          for (let s of value) {
            if (s.trim().length < 2 || s.trim().length > 50) {
              error = `Skill must be between 2 and 50 characters`;
              break;
            }
            if (seen.has(s.trim().toLowerCase())) {
              error = 'Duplicate skills are not allowed';
              break;
            }
            seen.add(s.trim().toLowerCase());
          }
        }
        break;

      case 'preferred_interview_types':
        if (!value || !Array.isArray(value) || value.length === 0) {
          error = 'Select at least one interview type';
        }
        break;

      case 'preferred_difficulty':
        if (!value) {
          error = 'Select preferred difficulty level';
        }
        break;

      case 'preferred_duration':
        if (!value) {
          error = 'Select interview duration';
        }
        break;

      case 'interviewer_notes':
        if (value && value.length > 500) {
          error = 'Notes cannot exceed 500 characters';
        }
        break;

      case 'linkedin_url':
        if (value) {
          if (!value.startsWith('https://') || !/^https:\/\/(www\.)?linkedin\.com\/.*$/.test(value)) {
            error = 'Enter a valid LinkedIn profile URL';
          }
        }
        break;

      case 'github_url':
        if (value) {
          if (!value.startsWith('https://') || !/^https:\/\/(www\.)?github\.com\/.*$/.test(value)) {
            error = 'Enter a valid GitHub profile URL';
          }
        }
        break;

      case 'portfolio_url':
        if (value && !value.startsWith('https://')) {
          error = 'Enter a valid website URL';
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
    const newTouched = {};
    let firstErrorField = null;

    Object.keys(formData).forEach((fieldName) => {
      newTouched[fieldName] = true;
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        if (!firstErrorField) {
            firstErrorField = fieldName;
        }
      }
    });

    setErrors(newErrors);
    setTouched((prev) => ({ ...prev, ...newTouched }));

    if (firstErrorField) {
        setTimeout(() => {
            const el = document.querySelector(`[name="${firstErrorField}"]`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.focus();
            }
        }, 100);
    }

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

  const getFieldStatus = useCallback((name) => {
    if (!touched[name] && (formData[name] === undefined || formData[name] === '')) return 'normal';
    if (errors[name]) return 'error';
    if (touched[name] && !errors[name]) return 'valid';
    return 'normal';
  }, [touched, errors, formData]);

  // ============================================
  // HANDLE API ERRORS
  // ============================================

  const handleApiErrors = useCallback((apiError) => {
    if (apiError && apiError.response && apiError.response.data) {
      const data = apiError.response.data;
      const newErrors = {};
      const newTouched = {};
      let firstErrorField = null;

      Object.keys(data).forEach((key) => {
        newErrors[key] = Array.isArray(data[key]) ? data[key][0] : data[key];
        newTouched[key] = true;
        if (!firstErrorField) {
            firstErrorField = key;
        }
      });
      setErrors((prev) => ({ ...prev, ...newErrors }));
      setTouched((prev) => ({ ...prev, ...newTouched }));

      if (firstErrorField) {
        setTimeout(() => {
            const el = document.querySelector(`[name="${firstErrorField}"]`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.focus();
            }
        }, 100);
      }
      return true;
    }
    return false;
  }, []);

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
    getFieldStatus,
    setErrors,
    setTouched,
    handleApiErrors,
  };
};

export default useProfileForm;
