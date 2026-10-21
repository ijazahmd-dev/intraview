// Signup.jsx — Same visual design as Login page
import React, { useState, useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { signup, checkAvailability } from '../api/authApi';
import OtpModal from '../components/OtpModal';
import PasswordStrengthBar from '../components/PasswordStrengthBar';
import { checkPasswordStrength } from '../utils/passwordStrength';
import toaster from '../utils/toaster';
import GoogleLoginButton from '../components/GoogleLoginButton.jsx';

const LOGO_URL = "https://res.cloudinary.com/dpn42vumz/image/upload/v1790803589/7a01858e-5b2d-420e-b5da-6722ef1f99d90000000000_injfdo.png";
const BG_IMAGE = "https://res.cloudinary.com/dpn42vumz/image/upload/v1790798661/d2507caf-1682-47c3-bc02-146b7fff50b9_tjtjtl.png";

const PAGE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  /* Hide scrollbars across all browsers */
  html,
  body,
  .sup-page,
  .sup-shell {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  html::-webkit-scrollbar,
  body::-webkit-scrollbar,
  .sup-page::-webkit-scrollbar,
  .sup-shell::-webkit-scrollbar {
    display: none;
    width: 0 !important;
    height: 0 !important;
  }

  .sup-page {
    position: relative;
    display: flex;
    min-height: 100vh;
    width: 100%;
    background-color: rgb(238, 240, 239);
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
    overflow-x: hidden;
  }

  .sup-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background-image: url('${BG_IMAGE}');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center calc(50% + 240px);
    pointer-events: none;
  }
  @media (min-width: 1024px) { .sup-bg { background-size: cover; } }

  .sup-shell {
    position: relative;
    margin: 0 auto;
    display: flex;
    min-height: 100vh;
    width: 100%;
    max-width: 1800px;
    flex-direction: column;
    overflow-x: hidden;
  }

  .sup-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 1800px;
    padding: 24px 28px;
    top: 0;
    z-index: 20;
  }
  @media (min-width: 768px) { .sup-nav { position: fixed; } }

  .sup-nav-logo {
    display: flex;
    align-items: center;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    transition: opacity 0.15s ease, transform 0.15s ease;
  }
  .sup-nav-logo:hover { opacity: 0.85; transform: translateY(-1px); }
  .sup-nav-logo-img {
    height: 80px;
    width: 135px;
    object-fit: fill;
    display: block;
  }
  @media (max-width: 640px) { .sup-nav-logo-img { height: 64px; width: 110px; } }

  .sup-nav-link {
    font-size: 1rem;
    font-weight: 400;
    color: rgb(57, 89, 77);
    line-height: 1.5;
    border-bottom: 1px solid transparent;
    transition: color 0.15s ease, border-color 0.15s ease;
    cursor: pointer;
    background: none;
    border-top: none; border-left: none; border-right: none;
    padding: 0;
  }
  .sup-nav-link:hover { color: rgb(22, 33, 28); border-bottom-color: rgb(22, 33, 28); }

  .sup-card-wrap {
    position: relative;
    z-index: 10;
    display: flex;
    justify-content: center;
    margin: auto 0;
    width: 100%;
    padding: 0 24px 24px;
  }
  @media (min-width: 768px) { .sup-card-wrap { width: fit-content; margin: auto auto; padding: 16px 0; } }

  .sup-card {
    display: flex;
    width: 648px;
    max-width: 100%;
    height: auto;
    flex-direction: column;
    border-radius: 24px;
    border: 1px solid rgb(224, 224, 224);
    background: #ffffff;
    padding: 24px;
    box-sizing: border-box;
  }
  @media (min-width: 768px) { .sup-card { padding: 40px 44px; } }

  .sup-heading {
    font-size: 1.75rem;
    font-weight: 420;
    line-height: 1.36;
    color: rgb(33, 33, 33);
    margin: 0;
    text-align: center;
  }
  @media (min-width: 1024px) { .sup-heading { font-size: 2.375rem; line-height: 1.2; } }

  .sup-oauth-row {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-top: 24px;
  }

  .sup-divider {
    display: flex;
    align-items: center;
    width: 100%;
    margin: 22px 0;
  }
  .sup-divider-line {
    flex: 1;
    height: 1.5px;
    background-color: rgb(57, 89, 77) !important;
    display: block;
    border: none;
  }
  .sup-divider-text {
    padding: 0 16px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgb(57, 89, 77);
    user-select: none;
    line-height: 1;
  }

  .sup-form { display: flex; flex-direction: column; margin-top: 0; width: 100%; }

  .sup-input-wrap { position: relative; width: 100%; }

  .sup-input-label {
    position: absolute;
    top: 0; left: 0;
    z-index: 10;
    padding: 10px 12px 0;
    pointer-events: none;
  }
  .sup-input-label-text {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgb(33, 33, 33);
    line-height: 1.36;
  }

  .sup-input {
    display: block;
    width: 100%;
    background: rgb(250, 250, 250);
    padding: 28px 12px 10px;
    font-size: 0.875rem;
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
    color: rgb(33, 33, 33);
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .sup-input::placeholder { color: rgb(189, 189, 189); }
  .sup-input--top { border: 1px solid rgb(189, 189, 189); border-bottom: none; border-radius: 8px 8px 0 0; }
  .sup-input--mid { border: 1px solid rgb(189, 189, 189); border-bottom: none; border-radius: 0; }
  .sup-input--bottom { border: 1px solid rgb(189, 189, 189); border-radius: 0 0 8px 8px; padding-right: 40px; }
  .sup-input:focus { position: relative; z-index: 5; box-shadow: 0 0 0 1px rgb(33,33,33); }
  .sup-input:disabled { color: rgb(97, 97, 97); cursor: not-allowed; }
  .sup-input--error { border-color: #ef4444 !important; box-shadow: 0 0 0 1px #ef4444 !important; }

  .sup-eye-btn {
    position: absolute;
    right: 12px; bottom: 14px;
    background: none; border: none; padding: 2px;
    cursor: pointer;
    color: rgb(57, 89, 77);
    display: flex; align-items: center; justify-content: center;
    z-index: 10;
    transition: color 0.12s ease;
  }
  .sup-eye-btn:hover { color: rgb(22, 33, 28); }

  .sup-field-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .sup-error-text { font-size: 0.75rem; color: #ef4444; margin: 2px 0 4px 2px; line-height: 1.4; display: block; }
  .sup-error-box { background: rgba(239,68,68,0.06); border: 1px solid #ef4444; border-radius: 6px; padding: 10px 14px; margin-bottom: 12px; }
  .sup-error-box p { font-size: 0.8125rem; color: #ef4444; margin: 0; line-height: 1.5; }

  .sup-terms-row { display: flex; align-items: flex-start; gap: 10px; margin: 16px 0 4px; }
  .sup-terms-checkbox { width: 16px; height: 16px; margin-top: 2px; flex-shrink: 0; accent-color: rgb(57, 89, 77); cursor: pointer; }
  .sup-terms-label { font-size: 0.875rem; color: rgb(97, 97, 97); line-height: 1.5; cursor: pointer; }
  .sup-terms-label a { color: rgb(57, 89, 77); text-decoration: underline; transition: color 0.15s ease; }
  .sup-terms-label a:hover { color: rgb(22, 33, 28); }

  .sup-submit-wrap { margin-top: 28px; width: 100%; display: flex; justify-content: center; }

  .sup-cell-btn { display: flex; align-items: stretch; gap: 4px; height: 40px; cursor: pointer; background: none; border: none; padding: 0; }
  .sup-cell-btn:disabled { cursor: not-allowed; opacity: 0.55; }
  .sup-cell-part { display: flex; height: 100%; transition: transform 0.15s ease; }
  .sup-cell-btn:hover:not(:disabled) .sup-cell-part { transform: translateX(-4px); }
  .sup-cell-part-main { flex: 1; min-width: 80px; }
  .sup-cell-part-arrow { flex: none; }
  .sup-bg-color { background: rgb(57, 89, 77); transition: background 0.15s ease; }
  .sup-cell-btn:hover:not(:disabled) .sup-bg-color { background: rgb(43, 66, 57); }
  .sup-cell-btn:active:not(:disabled) .sup-bg-color { background: rgb(22, 33, 28); }
  .sup-cell-btn:disabled .sup-bg-color { background: rgb(238, 238, 238); color: rgb(97,97,97); }
  .sup-cell-l { width: 12px; border-radius: 6px 0 0 6px; margin-right: -2px; }
  .sup-cell-mid { color: #ffffff; display: flex; align-items: center; justify-content: center; flex: 1; padding: 0 8px; font-size: 0.875rem; font-weight: 400; }
  .sup-cell-skew-r { width: 24px; transform: skewX(-21deg); border-radius: 0 10px 4px 0; }
  .sup-cell-skew-l { width: 24px; transform: skewX(-21deg); border-radius: 4px 0 0 10px; margin-right: -16px; }
  .sup-cell-r { width: 12px; border-radius: 0 6px 6px 0; margin-left: -2px; }
  .sup-cell-btn:disabled .sup-cell-mid { color: rgb(97,97,97); }
  .sup-cell-arrow-icon { display: flex; align-items: center; justify-content: center; padding: 0 4px; }

  .sup-bottom-terms { margin-top: 20px; font-size: 0.875rem; color: rgb(33, 33, 33); line-height: 1.5; text-align: center; }
  .sup-bottom-terms a { color: rgb(57, 89, 77); text-decoration: underline; transition: color 0.15s ease; }
  .sup-bottom-terms a:hover { color: rgb(22, 33, 28); }

  .sup-login-row { margin-top: 24px; display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 0.875rem; color: rgb(97, 97, 97); line-height: 1.5; }
  .sup-login-link { color: rgb(57, 89, 77); border-bottom: 1px solid transparent; transition: color 0.15s ease, border-color 0.15s ease; background: none; border-top: none; border-left: none; border-right: none; cursor: pointer; padding: 0; font: inherit; }
  .sup-login-link:hover { color: rgb(22, 33, 28); border-bottom-color: rgb(22, 33, 28); }

  .sup-avail-spinner {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    width: 16px; height: 16px;
    border: 2px solid rgb(189, 189, 189); border-top-color: rgb(57, 89, 77);
    border-radius: 50%; animation: sup-spin 0.6s linear infinite; z-index: 10; display: block;
  }
  @keyframes sup-spin { to { transform: translateY(-50%) rotate(360deg); } }

  .sup-strength-wrap { margin-top: 6px; margin-bottom: 4px; }
`;

function EyeOpenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(34,197,94)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIconSmall() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const Signup = () => {
  const navigate = useNavigate();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Weak', checks: null });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState({ username: false, email: false });

  const inputRefs = {
    username: useRef(null),
    email: useRef(null),
    password: useRef(null),
    confirmPassword: useRef(null),
    agreeTerms: useRef(null),
  };

  const formik = useFormik({
    initialValues: { username: '', email: '', password: '', confirmPassword: '', agreeTerms: false },
    validateOnBlur: true,
    validateOnChange: true,
    validationSchema: Yup.object({
      username: Yup.string()
        .required('Username is required.')
        .min(3, 'Username must be at least 3 characters.')
        .max(30, 'Username cannot exceed 30 characters.')
        .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.')
        .test('no-leading-number', 'Username cannot start with a number.', v => !v || !/^\d/.test(v))
        .test('not-all-numbers', 'Username cannot consist only of numbers.', v => !v || !/^\d+$/.test(v)),
      email: Yup.string()
        .transform(v => v.toLowerCase().trim())
        .required('Email is required.')
        .email('Enter a valid email address.'),
      password: Yup.string()
        .required('Password is required.')
        .min(8, 'Password must be at least 8 characters.')
        .max(128, 'Password cannot exceed 128 characters.')
        .test('no-spaces', 'Password cannot contain spaces.', v => !/\s/.test(v || ''))
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter.')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter.')
        .matches(/[0-9]/, 'Password must contain at least one number.')
        .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, 'Password must contain at least one special character.')
        .test('not-equal-username', 'Password cannot be equal to username.', function(v) {
          return !v || !this.parent.username || v.toLowerCase() !== this.parent.username.toLowerCase();
        })
        .test('not-email-prefix', 'Password cannot contain part of your email address.', function(v) {
          if (!v || !this.parent.email) return true;
          const prefix = this.parent.email.split('@')[0].toLowerCase();
          return !v.toLowerCase().includes(prefix);
        }),
      confirmPassword: Yup.string()
        .required('Confirm password is required.')
        .oneOf([Yup.ref('password'), null], 'Passwords do not match.'),
      agreeTerms: Yup.boolean().oneOf([true], 'Please accept the Terms and Conditions.'),
    }),
    onSubmit: async (values, { setSubmitting, setStatus, setErrors }) => {
      try {
        await signup({
          username: values.username.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
          confirm_password: values.confirmPassword,
          agree_terms: values.agreeTerms,
        });
        setOtpEmail(values.email.trim().toLowerCase());
        setShowOtpModal(true);
        toaster.success('OTP sent to your email!');
      } catch (err) {
        const errData = err.response?.data;
        let errMsg = 'Signup failed. Please try again.';
        if (errData?.errors) {
          setErrors(errData.errors);
          errMsg = errData.errors.non_field_errors ? errData.errors.non_field_errors[0] : 'Please fix the errors below.';
        } else if (errData?.error) {
          errMsg = errData.error;
        }
        setStatus({ error: errMsg });
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (formik.submitCount > 0 && !formik.isSubmitting && !formik.isValid) {
      const firstErrorKey = Object.keys(formik.errors)[0];
      if (firstErrorKey && inputRefs[firstErrorKey]?.current) {
        inputRefs[firstErrorKey].current.focus();
      }
    }
  }, [formik.submitCount, formik.isSubmitting, formik.errors, formik.isValid]);

  const handleBlurCheck = async (field, value) => {
    formik.handleBlur({ target: { name: field } });
    if (!value || formik.errors[field]) return;
    setCheckingAvailability(prev => ({ ...prev, [field]: true }));
    try {
      await checkAvailability({ [field]: value });
    } catch (err) {
      const errData = err.response?.data?.errors;
      if (errData?.[field]) formik.setFieldError(field, errData[field]);
    } finally {
      setCheckingAvailability(prev => ({ ...prev, [field]: false }));
    }
  };

  const isSubmitting = formik.isSubmitting;

  const fieldIcon = (field) => {
    if (!formik.touched[field]) return null;
    if (checkingAvailability[field]) return <span className="sup-avail-spinner" />;
    if (formik.errors[field]) return <span className="sup-field-icon"><XIconSmall /></span>;
    return <span className="sup-field-icon"><CheckIcon /></span>;
  };

  const errClass = (field) => formik.touched[field] && formik.errors[field] ? ' sup-input--error' : '';

  return (
    <div className="sup-page">
      <style>{PAGE_STYLES}</style>
      <div className="sup-bg" aria-hidden="true" />

      <div className="sup-shell">
        <nav className="sup-nav" aria-label="Site navigation">
          <button type="button" className="sup-nav-logo" onClick={() => { if (!isSubmitting) navigate('/'); }} aria-label="IntraView home">
            <img src={LOGO_URL} alt="IntraView" className="sup-nav-logo-img" />
          </button>
          <button type="button" className="sup-nav-link" onClick={() => { if (!isSubmitting) navigate('/login'); }} aria-label="Go to log in">
            Log in
          </button>
        </nav>

        <div className="sup-card-wrap">
          <div className="sup-card">
            <h1 className="sup-heading">Sign up</h1>

            <div className="sup-oauth-row">
              <GoogleLoginButton disabled={isSubmitting} variant="circle" />
            </div>

            <div className="sup-divider" role="separator" aria-label="Or continue with email">
              <span className="sup-divider-line" style={{ backgroundColor: 'rgb(57, 89, 77)', height: '1.5px', flex: 1, display: 'block' }} />
              <span className="sup-divider-text" style={{ color: 'rgb(57, 89, 77)' }}>or</span>
              <span className="sup-divider-line" style={{ backgroundColor: 'rgb(57, 89, 77)', height: '1.5px', flex: 1, display: 'block' }} />
            </div>

            <form className="sup-form" onSubmit={formik.handleSubmit} noValidate>
              {/* Username */}
              <div className="sup-input-wrap">
                <label className="sup-input-label" htmlFor="sup-username">
                  <span className="sup-input-label-text">Username</span>
                </label>
                <input
                  id="sup-username"
                  type="text"
                  placeholder="your_username"
                  spellCheck={false}
                  autoComplete="off"
                  className={`sup-input sup-input--top${errClass('username')}`}
                  disabled={isSubmitting}
                  ref={inputRefs.username}
                  {...formik.getFieldProps('username')}
                  onBlur={e => handleBlurCheck('username', e.target.value)}
                />
                {fieldIcon('username')}
              </div>
              {formik.touched.username && formik.errors.username && (
                <span className="sup-error-text" role="alert">{formik.errors.username}</span>
              )}

              {/* Email */}
              <div className="sup-input-wrap">
                <label className="sup-input-label" htmlFor="sup-email">
                  <span className="sup-input-label-text">Email</span>
                </label>
                <input
                  id="sup-email"
                  type="email"
                  placeholder="yourname@email.com"
                  spellCheck={false}
                  autoComplete="off"
                  className={`sup-input sup-input--mid${errClass('email')}`}
                  disabled={isSubmitting}
                  ref={inputRefs.email}
                  {...formik.getFieldProps('email')}
                  onBlur={e => handleBlurCheck('email', e.target.value)}
                />
                {fieldIcon('email')}
              </div>
              {formik.touched.email && formik.errors.email && (
                <span className="sup-error-text" role="alert">{formik.errors.email}</span>
              )}

              {/* Password */}
              <div className="sup-input-wrap">
                <label className="sup-input-label" htmlFor="sup-password">
                  <span className="sup-input-label-text">Password</span>
                </label>
                <input
                  id="sup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  spellCheck={false}
                  autoComplete="off"
                  className={`sup-input sup-input--mid${errClass('password')}`}
                  disabled={isSubmitting}
                  ref={inputRefs.password}
                  {...formik.getFieldProps('password')}
                  onChange={e => {
                    formik.handleChange(e);
                    setPasswordStrength(checkPasswordStrength(e.target.value));
                  }}
                />
                <button type="button" className="sup-eye-btn" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} tabIndex={-1}>
                  {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="sup-input-wrap">
                <label className="sup-input-label" htmlFor="sup-confirm-password">
                  <span className="sup-input-label-text">Confirm Password</span>
                </label>
                <input
                  id="sup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  spellCheck={false}
                  autoComplete="off"
                  className={`sup-input sup-input--bottom${errClass('confirmPassword')}`}
                  disabled={isSubmitting}
                  ref={inputRefs.confirmPassword}
                  {...formik.getFieldProps('confirmPassword')}
                />
                <button type="button" className="sup-eye-btn" onClick={() => setShowConfirmPassword(v => !v)} aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} tabIndex={-1}>
                  {showConfirmPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <span className="sup-error-text" role="alert">{formik.errors.confirmPassword}</span>
              )}
              {formik.touched.password && formik.errors.password && (
                <span className="sup-error-text" role="alert">{formik.errors.password}</span>
              )}

              {formik.values.password && (
                <div className="sup-strength-wrap">
                  <PasswordStrengthBar score={passwordStrength.score} label={passwordStrength.label} checks={passwordStrength.checks} />
                </div>
              )}

              {/* Terms */}
              <div className="sup-terms-row">
                <input
                  type="checkbox"
                  id="sup-terms"
                  name="agreeTerms"
                  className="sup-terms-checkbox"
                  ref={inputRefs.agreeTerms}
                  checked={formik.values.agreeTerms}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isSubmitting}
                />
                <label htmlFor="sup-terms" className="sup-terms-label">
                  I agree to the{' '}
                  <Link to="/terms-and-conditions" onClick={e => e.stopPropagation()}>Terms and Conditions</Link>
                </label>
              </div>
              {formik.touched.agreeTerms && formik.errors.agreeTerms && (
                <span className="sup-error-text" role="alert">{formik.errors.agreeTerms}</span>
              )}

              {/* API error */}
              {formik.status?.error && (
                <div className="sup-error-box" role="alert"><p>{formik.status.error}</p></div>
              )}

              {/* Submit */}
              <div className="sup-submit-wrap">
                <button type="submit" className="sup-cell-btn" disabled={isSubmitting || !formik.values.agreeTerms} aria-label={isSubmitting ? 'Creating account…' : 'Sign up'}>
                  <div className="sup-cell-part sup-cell-part-main">
                    <span className="sup-bg-color sup-cell-l"></span>
                    <div className="sup-bg-color sup-cell-mid">{isSubmitting ? 'Creating account…' : 'Sign up'}</div>
                    <span className="sup-bg-color sup-cell-skew-r"></span>
                  </div>
                  <div className="sup-cell-part sup-cell-part-arrow">
                    <span className="sup-bg-color sup-cell-skew-l"></span>
                    <div className="sup-bg-color sup-cell-mid sup-cell-arrow-icon"><ArrowRightIcon /></div>
                    <span className="sup-bg-color sup-cell-r"></span>
                  </div>
                </button>
              </div>
            </form>

            <p className="sup-bottom-terms">
              By signing up, you agree to the{' '}
              <Link to="/terms-of-use">Terms of Use</Link>{' '}
              and{' '}
              <Link to="/privacy-policy">Privacy Policy</Link>.
            </p>

            <div className="sup-login-row">
              <span>Already have an account?</span>
              <button type="button" className="sup-login-link" onClick={() => { if (!isSubmitting) navigate('/login'); }} disabled={isSubmitting}>
                Log in
              </button>
            </div>
          </div>
        </div>
      </div>

      {showOtpModal && (
        <OtpModal
          email={otpEmail}
          onSuccess={() => {
            toaster.success('Email verified successfully!');
            setTimeout(() => navigate('/login'), 800);
            setShowOtpModal(false);
          }}
          onClose={() => setShowOtpModal(false)}
        />
      )}
    </div>
  );
};

export default Signup;
