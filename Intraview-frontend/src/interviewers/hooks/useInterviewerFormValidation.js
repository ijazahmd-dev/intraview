// src/interviewers/hooks/useInterviewerFormValidation.js
// Enterprise-grade validation hook for the 4-step interviewer application form.

import { useState, useCallback } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

export const SPECIALIZATION_OPTIONS = [
  'Frontend',
  'Backend',
  'Full Stack',
  'Mobile',
  'Data Structures & Algorithms',
  'System Design',
  'DevOps',
  'Data Science / ML',
];

export const LANGUAGE_OPTIONS = [
  'English', 'Hindi', 'Malayalam', 'Tamil', 'Telugu',
  'Kannada', 'Bengali', 'Punjabi', 'Marathi', 'Urdu',
  'Arabic', 'French', 'German', 'Spanish', 'Chinese (Mandarin)',
  'Japanese', 'Korean', 'Portuguese', 'Russian', 'Italian',
];

export const TIMEZONE_OPTIONS = [
  { label: 'Asia/Kolkata (IST, UTC+5:30)',       value: 'Asia/Kolkata' },
  { label: 'Asia/Dubai (GST, UTC+4)',             value: 'Asia/Dubai' },
  { label: 'Asia/Singapore (SGT, UTC+8)',         value: 'Asia/Singapore' },
  { label: 'Asia/Tokyo (JST, UTC+9)',             value: 'Asia/Tokyo' },
  { label: 'Asia/Shanghai (CST, UTC+8)',          value: 'Asia/Shanghai' },
  { label: 'Asia/Seoul (KST, UTC+9)',             value: 'Asia/Seoul' },
  { label: 'Asia/Dhaka (BST, UTC+6)',             value: 'Asia/Dhaka' },
  { label: 'Asia/Karachi (PKT, UTC+5)',           value: 'Asia/Karachi' },
  { label: 'Asia/Colombo (SLST, UTC+5:30)',       value: 'Asia/Colombo' },
  { label: 'Asia/Kathmandu (NPT, UTC+5:45)',      value: 'Asia/Kathmandu' },
  { label: 'Europe/London (GMT/BST)',             value: 'Europe/London' },
  { label: 'Europe/Paris (CET, UTC+1)',           value: 'Europe/Paris' },
  { label: 'Europe/Berlin (CET, UTC+1)',          value: 'Europe/Berlin' },
  { label: 'Europe/Moscow (MSK, UTC+3)',          value: 'Europe/Moscow' },
  { label: 'America/New_York (EST, UTC-5)',       value: 'America/New_York' },
  { label: 'America/Chicago (CST, UTC-6)',        value: 'America/Chicago' },
  { label: 'America/Denver (MST, UTC-7)',         value: 'America/Denver' },
  { label: 'America/Los_Angeles (PST, UTC-8)',    value: 'America/Los_Angeles' },
  { label: 'America/Toronto (EST, UTC-5)',        value: 'America/Toronto' },
  { label: 'America/Vancouver (PST, UTC-8)',      value: 'America/Vancouver' },
  { label: 'America/Sao_Paulo (BRT, UTC-3)',      value: 'America/Sao_Paulo' },
  { label: 'Australia/Sydney (AEDT, UTC+11)',     value: 'Australia/Sydney' },
  { label: 'Australia/Melbourne (AEDT, UTC+11)',  value: 'Australia/Melbourne' },
  { label: 'Pacific/Auckland (NZST, UTC+12)',     value: 'Pacific/Auckland' },
  { label: 'Africa/Nairobi (EAT, UTC+3)',         value: 'Africa/Nairobi' },
  { label: 'UTC (Universal Coordinated Time)',    value: 'UTC' },
];

// ─── Field-level validators ───────────────────────────────────────────────────

const VALID_TIMEZONES = new Set(TIMEZONE_OPTIONS.map((t) => t.value));

const RESUME_ALLOWED_EXTS   = ['pdf', 'doc', 'docx'];
const CERT_ALLOWED_EXTS     = ['pdf', 'png', 'jpg', 'jpeg'];
const ADDL_ALLOWED_EXTS     = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'];
const DANGEROUS_EXTS        = ['exe', 'bat', 'cmd', 'sh', 'php', 'js', 'py', 'rb', 'zip', 'rar', 'tar'];
const RESUME_ALLOWED_MIMES  = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const CERT_ALLOWED_MIMES    = ['application/pdf', 'image/png', 'image/jpeg'];
const ADDL_ALLOWED_MIMES    = [...RESUME_ALLOWED_MIMES, 'image/png', 'image/jpeg'];

function getExt(filename) {
  return (filename || '').split('.').pop().toLowerCase();
}

function validatePhone(v) {
  if (!v || !v.trim()) return 'Phone number is required';
  let cleaned = v.replace(/\s/g, '');
  if (cleaned.startsWith('+91')) cleaned = cleaned.slice(3);
  else if (cleaned.startsWith('91') && cleaned.length === 12) cleaned = cleaned.slice(2);
  if (!/^\d{10}$/.test(cleaned)) return 'Phone number must contain exactly 10 digits';
  return null;
}

function validateCompany(v) {
  if (!v || !v.trim()) return 'Company name is required';
  const t = v.trim();
  if (t.length < 2 || t.length > 100) return 'Company name must be between 2 and 100 characters';
  if (!/^[A-Za-z0-9\s&.,\-'()]+$/.test(t)) return 'Enter a valid company name';
  return null;
}

function validateLocation(v) {
  if (!v || !v.trim()) return 'Location is required';
  const t = v.trim();
  if (t.length < 2 || t.length > 100) return 'Enter a valid location';
  if (!/^[A-Za-z\s,\-]+$/.test(t)) return 'Location can only contain letters, spaces, commas, and hyphens';
  return null;
}

function validateTimezone(v) {
  if (!v || !v.trim()) return 'Please select a valid timezone';
  if (!VALID_TIMEZONES.has(v)) return 'Please select a valid timezone';
  return null;
}

function validateLinkedIn(v) {
  if (!v || !v.trim()) return 'LinkedIn profile URL is required';
  if (!/^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_\-%.]+\/?$/.test(v.trim())) {
    return 'Enter a valid LinkedIn profile URL (e.g. https://linkedin.com/in/username)';
  }
  return null;
}

function validateGitHub(v) {
  if (!v || !v.trim()) return null; // optional
  if (!/^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_\-]+\/?$/.test(v.trim())) {
    return 'Enter a valid GitHub profile URL (e.g. https://github.com/username)';
  }
  return null;
}

function validateYearsExperience(v) {
  if (v === '' || v === null || v === undefined) return 'Professional experience is required';
  const n = parseFloat(v);
  if (isNaN(n)) return 'Enter a valid experience value';
  if (n < 1) return 'Minimum 1 year of professional experience required';
  if (n > 50) return 'Experience must be between 1 and 50 years';
  return null;
}

function validateYearsInterviewExp(v, professionalExp) {
  if (v === '' || v === null || v === undefined) return 'Interview experience is required';
  const n = parseFloat(v);
  if (isNaN(n) || n < 0) return 'Enter a valid interview experience value';
  const p = parseFloat(professionalExp);
  if (!isNaN(p) && n > p) return 'Interview experience cannot exceed professional experience';
  return null;
}

function validateSpecializations(v) {
  if (!Array.isArray(v) || v.length === 0) return 'Select at least one specialization';
  if (v.length > 5) return 'Maximum 5 specializations allowed';
  return null;
}

function validateEducation(v) {
  if (!v || !v.trim()) return 'Education details are required';
  const t = v.trim();
  if (t.length < 10) return 'Education must be at least 10 characters';
  if (t.length > 200) return 'Education must not exceed 200 characters';
  return null;
}

function validateLanguages(v) {
  if (!Array.isArray(v) || v.length === 0) return 'Select at least one language';
  if (v.length > 10) return 'Maximum 10 languages allowed';
  return null;
}

function validateExpertiseSummary(v) {
  if (!v || !v.trim()) return 'Expertise summary is required';
  const t = v.trim();
  if (t.length < 100) return `Minimum 100 characters required (${t.length}/100)`;
  if (t.length > 2000) return 'Maximum 2000 characters allowed';
  return null;
}

function validateMotivation(v) {
  if (!v || !v.trim()) return null; // optional
  if (v.trim().length > 1000) return 'Response cannot exceed 1000 characters';
  return null;
}

function validateResumeFile(file, existingResume) {
  if (!file && !existingResume) return 'Resume is required';
  if (!file) return null; // keeping existing
  const ext = getExt(file.name);
  if (DANGEROUS_EXTS.includes(ext)) return 'This file type is not allowed';
  if (!RESUME_ALLOWED_EXTS.includes(ext)) return 'Invalid file type. Accepted: PDF, DOC, DOCX';
  if (!RESUME_ALLOWED_MIMES.includes(file.type)) return 'Invalid file format';
  if (file.size > 10 * 1024 * 1024) return 'File exceeds 10 MB limit';
  return null;
}

function validateCertFile(file) {
  if (!file) return null; // optional
  const ext = getExt(file.name);
  if (DANGEROUS_EXTS.includes(ext)) return 'This file type is not allowed';
  if (!CERT_ALLOWED_EXTS.includes(ext)) return 'Invalid format. Accepted: PDF, PNG, JPG, JPEG';
  if (!CERT_ALLOWED_MIMES.includes(file.type)) return 'Invalid file format';
  if (file.size > 5 * 1024 * 1024) return 'File exceeds 5 MB limit';
  return null;
}

function validateAddlDocFile(file) {
  if (!file) return null; // optional
  const ext = getExt(file.name);
  if (DANGEROUS_EXTS.includes(ext)) return 'This file type is not allowed';
  if (!ADDL_ALLOWED_EXTS.includes(ext)) return 'Invalid format. Accepted: PDF, DOC, DOCX, PNG, JPG, JPEG';
  if (!ADDL_ALLOWED_MIMES.includes(file.type)) return 'Invalid file format';
  if (file.size > 10 * 1024 * 1024) return 'File exceeds 10 MB limit';
  return null;
}

// ─── Step field maps ──────────────────────────────────────────────────────────

const STEP_FIELDS = [
  ['phone_number', 'company_name', 'location', 'timezone', 'linkedin_url', 'github_url'],
  ['years_of_experience', 'years_of_interview_experience', 'specializations', 'education', 'languages', 'expertise_summary', 'motivation'],
  ['resume', 'certifications', 'additional_docs'],
  [], // review step — no new fields
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useInterviewerFormValidation() {
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  // Compute single field error given current formData
  const getFieldError = useCallback((field, formData) => {
    switch (field) {
      case 'phone_number':                 return validatePhone(formData.phone_number);
      case 'company_name':                 return validateCompany(formData.company_name);
      case 'location':                     return validateLocation(formData.location);
      case 'timezone':                     return validateTimezone(formData.timezone);
      case 'linkedin_url':                 return validateLinkedIn(formData.linkedin_url);
      case 'github_url':                   return validateGitHub(formData.github_url);
      case 'years_of_experience':          return validateYearsExperience(formData.years_of_experience);
      case 'years_of_interview_experience':return validateYearsInterviewExp(formData.years_of_interview_experience, formData.years_of_experience);
      case 'specializations':              return validateSpecializations(formData.specializations);
      case 'education':                    return validateEducation(formData.education);
      case 'languages':                    return validateLanguages(formData.languages);
      case 'expertise_summary':            return validateExpertiseSummary(formData.expertise_summary);
      case 'motivation':                   return validateMotivation(formData.motivation);
      case 'resume':                       return validateResumeFile(formData.resume, formData._existing_resume);
      case 'certifications':               return validateCertFile(formData.certifications);
      case 'additional_docs':              return validateAddlDocFile(formData.additional_docs);
      default:                             return null;
    }
  }, []);

  // Mark field touched + validate it
  const handleBlur = useCallback((field, formData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = getFieldError(field, formData);
    setErrors((prev) => ({ ...prev, [field]: err }));
  }, [getFieldError]);

  // Clear error on change (re-validate immediately for live feedback)
  const handleChangeValidate = useCallback((field, formData) => {
    const err = getFieldError(field, formData);
    setErrors((prev) => ({ ...prev, [field]: err }));
    if (!touched[field]) {
      // Only mark touched if user has started typing
      setTouched((prev) => ({ ...prev, [field]: true }));
    }
  }, [getFieldError, touched]);

  // Validate all fields in a given step; return true if valid
  const validateStep = useCallback((stepIndex, formData) => {
    const fields = STEP_FIELDS[stepIndex];
    const newErrors = {};
    const newTouched = {};
    let firstErrorField = null;

    fields.forEach((field) => {
      newTouched[field] = true;
      const err = getFieldError(field, formData);
      if (err) {
        newErrors[field] = err;
        if (!firstErrorField) firstErrorField = field;
      }
    });

    setTouched((prev) => ({ ...prev, ...newTouched }));
    setErrors((prev) => ({ ...prev, ...newErrors }));

    // Auto-scroll to first invalid field
    if (firstErrorField) {
      setTimeout(() => {
        const el = document.querySelector(
          `[name="${firstErrorField}"], [data-field="${firstErrorField}"]`
        );
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (typeof el.focus === 'function') el.focus();
        }
      }, 80);
    }

    return Object.keys(newErrors).length === 0;
  }, [getFieldError]);

  // Validate all steps; returns { valid: bool, firstInvalidStep: number|null }
  const validateAll = useCallback((formData) => {
    let allErrors = {};
    let allTouched = {};
    let firstInvalidStep = null;

    STEP_FIELDS.forEach((fields, stepIndex) => {
      fields.forEach((field) => {
        allTouched[field] = true;
        const err = getFieldError(field, formData);
        if (err) {
          allErrors[field] = err;
          if (firstInvalidStep === null) firstInvalidStep = stepIndex;
        }
      });
    });

    setTouched(allTouched);
    setErrors(allErrors);

    return {
      valid: Object.keys(allErrors).length === 0,
      firstInvalidStep,
    };
  }, [getFieldError]);

  // Wire in API errors returned from backend 400 responses
  const handleApiErrors = useCallback((errorPayload) => {
    const data = errorPayload?.response?.data || errorPayload;
    if (!data || typeof data !== 'object') return;

    const newErrors = {};
    const newTouched = {};
    Object.keys(data).forEach((key) => {
      newErrors[key] = Array.isArray(data[key]) ? data[key][0] : String(data[key]);
      newTouched[key] = true;
    });
    setErrors((prev) => ({ ...prev, ...newErrors }));
    setTouched((prev) => ({ ...prev, ...newTouched }));
  }, []);

  // Helper: should we show error for this field?
  const getDisplayError = useCallback((field) => {
    return touched[field] ? errors[field] || null : null;
  }, [touched, errors]);

  // Helper: border / ring class for a field
  const getFieldStatus = useCallback((field) => {
    if (!touched[field]) return 'normal';
    if (errors[field]) return 'error';
    return 'valid';
  }, [touched, errors]);

  const resetValidation = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    handleBlur,
    handleChangeValidate,
    validateStep,
    validateAll,
    handleApiErrors,
    getDisplayError,
    getFieldStatus,
    resetValidation,
  };
}
