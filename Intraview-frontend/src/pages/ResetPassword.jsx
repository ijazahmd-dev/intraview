import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { resetPassword } from "../api/authApi";
import toaster from "../utils/toaster";
import PasswordStrengthBar from "../components/PasswordStrengthBar";
import { checkPasswordStrength } from "../utils/passwordStrength";

const LOGO_URL =
  "https://res.cloudinary.com/dpn42vumz/image/upload/v1790803589/7a01858e-5b2d-420e-b5da-6722ef1f99d90000000000_injfdo.png";
const BG_IMAGE =
  "https://res.cloudinary.com/dpn42vumz/image/upload/v1790798661/d2507caf-1682-47c3-bc02-146b7fff50b9_tjtjtl.png";

function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function EyeOpenIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgb(220, 38, 38)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

const PAGE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  /* Hide scrollbars across all browsers */
  html,
  body,
  .rst-page,
  .rst-shell {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  html::-webkit-scrollbar,
  body::-webkit-scrollbar,
  .rst-page::-webkit-scrollbar,
  .rst-shell::-webkit-scrollbar {
    display: none;
    width: 0 !important;
    height: 0 !important;
  }

  .rst-page {
    position: relative;
    display: flex;
    min-height: 100vh;
    width: 100%;
    background-color: rgb(238, 240, 239);
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
    overflow-x: hidden;
  }

  .rst-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    margin: 0 auto;
    background-image: url('${BG_IMAGE}');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center calc(50% + 240px);
    pointer-events: none;
  }
  @media (min-width: 1024px) {
    .rst-bg { background-size: cover; }
  }

  .rst-shell {
    position: relative;
    margin: 0 auto;
    display: flex;
    min-height: 100vh;
    width: 100%;
    max-width: 1800px;
    flex-direction: column;
    overflow-x: hidden;
  }

  /* Nav: static on mobile, fixed on desktop */
  .rst-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 1800px;
    padding: 24px 28px;
    top: 0;
    z-index: 20;
  }
  @media (min-width: 768px) {
    .rst-nav { position: fixed; }
  }

  .rst-nav-logo {
    display: flex;
    align-items: center;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    transition: opacity 0.15s ease, transform 0.15s ease;
  }
  .rst-nav-logo:hover {
    opacity: 0.85;
    transform: translateY(-1px);
  }
  .rst-nav-logo-img {
    height: 80px;
    width: 135px;
    object-fit: fill;
    display: block;
    transition: transform 0.15s ease;
  }
  @media (max-width: 640px) {
    .rst-nav-logo-img {
      height: 64px;
      width: 110px;
    }
  }

  .rst-nav-link {
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
  .rst-nav-link:hover { color: rgb(22, 33, 28); border-bottom-color: rgb(22, 33, 28); }

  /* Card wrapper */
  .rst-card-wrap {
    position: relative;
    z-index: 10;
    display: flex;
    justify-content: center;
    margin: auto 0;
    width: 100%;
    padding: 0 24px 24px;
  }
  @media (min-width: 768px) {
    .rst-card-wrap { width: fit-content; margin: auto auto; padding: 16px 0; }
  }

  .rst-card {
    display: flex;
    width: 648px;
    max-width: 100%;
    min-height: 520px;
    height: auto;
    flex-direction: column;
    border-radius: 24px;
    border: 1px solid rgb(224, 224, 224);
    background: #ffffff;
    padding: 24px;
    box-sizing: border-box;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  }
  @media (min-width: 768px) {
    .rst-card { padding: 44px 44px 40px; }
  }

  .rst-heading {
    font-size: 1.75rem;
    font-weight: 420;
    line-height: 1.36;
    color: rgb(33, 33, 33);
    margin: 0;
    text-align: center;
  }
  @media (min-width: 1024px) {
    .rst-heading { font-size: 2.375rem; line-height: 1.2; }
  }

  .rst-subheading {
    font-size: 0.9375rem;
    color: rgb(97, 97, 97);
    line-height: 1.5;
    text-align: center;
    margin: 14px auto 30px;
    max-width: 440px;
  }

  .rst-form {
    display: flex;
    flex-direction: column;
    margin-top: 0;
    width: 100%;
  }

  /* Stacked input group */
  .rst-input-wrap {
    position: relative;
    width: 100%;
  }

  .rst-input-label {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    padding: 10px 12px 0;
    pointer-events: none;
  }
  .rst-input-label-text {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgb(33, 33, 33);
    line-height: 1.36;
  }

  .rst-input {
    display: block;
    width: 100%;
    background: rgb(250, 250, 250);
    padding: 28px 40px 10px 12px;
    font-size: 0.875rem;
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
    color: rgb(33, 33, 33);
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .rst-input::placeholder { color: rgb(189, 189, 189); }

  .rst-input--top {
    border: 1px solid rgb(189, 189, 189);
    border-bottom: none;
    border-radius: 8px 8px 0 0;
  }
  .rst-input--bottom {
    border: 1px solid rgb(189, 189, 189);
    border-radius: 0 0 8px 8px;
  }

  .rst-input:focus {
    position: relative;
    z-index: 5;
    box-shadow: 0 0 0 1px rgb(33, 33, 33);
    border-color: rgb(57, 89, 77);
  }
  .rst-input:disabled { color: rgb(97, 97, 97); cursor: not-allowed; }
  .rst-input--error {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 1px #ef4444 !important;
  }

  .rst-eye-btn {
    position: absolute;
    right: 12px;
    bottom: 14px;
    background: none;
    border: none;
    padding: 2px;
    cursor: pointer;
    color: rgb(57, 89, 77);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: color 0.12s ease;
  }
  .rst-eye-btn:hover { color: rgb(22, 33, 28); }

  .rst-error-text {
    font-size: 0.75rem;
    color: #ef4444;
    margin: 4px 0 6px 2px;
    line-height: 1.4;
  }
  .rst-error-box {
    background: rgba(239, 68, 68, 0.06);
    border: 1px solid #ef4444;
    border-radius: 6px;
    padding: 10px 14px;
    margin-top: 14px;
  }
  .rst-error-box p {
    font-size: 0.8125rem;
    color: #ef4444;
    margin: 0;
    line-height: 1.5;
    text-align: center;
  }

  /* Password strength wrap */
  .rst-strength-wrap {
    margin-top: 12px;
    margin-bottom: 6px;
  }

  /* Submit "cell" button */
  .rst-submit-wrap {
    margin-top: 36px;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .rst-cell-btn {
    display: flex;
    align-items: stretch;
    gap: 4px;
    height: 40px;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
  }
  .rst-cell-btn:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .rst-cell-part {
    display: flex;
    height: 100%;
    transition: transform 0.15s ease;
  }
  .rst-cell-btn:hover:not(:disabled) .rst-cell-part {
    transform: translateX(-4px);
  }
  .rst-cell-part-main {
    flex: 1;
    min-width: 120px;
  }
  .rst-cell-part-arrow {
    flex: none;
  }

  .rst-bg-color {
    background: rgb(57, 89, 77);
    transition: background 0.15s ease;
  }
  .rst-cell-btn:hover:not(:disabled) .rst-bg-color {
    background: rgb(43, 66, 57);
  }
  .rst-cell-btn:active:not(:disabled) .rst-bg-color {
    background: rgb(22, 33, 28);
  }
  .rst-cell-btn:disabled .rst-bg-color {
    background: rgb(238, 238, 238);
    color: rgb(97, 97, 97);
  }

  .rst-cell-l {
    width: 12px;
    border-radius: 6px 0 0 6px;
    margin-right: -2px;
    transform-origin: top right;
  }
  .rst-cell-mid {
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 0 16px;
    font-size: 0.875rem;
    font-weight: 400;
    white-space: nowrap;
  }
  .rst-cell-skew-r {
    width: 24px;
    transform: skewX(-21deg);
    border-radius: 0 10px 4px 0;
    transform-origin: top right;
  }
  .rst-cell-skew-l {
    width: 24px;
    transform: skewX(-21deg);
    border-radius: 4px 0 0 10px;
    transform-origin: top right;
    margin-right: -16px;
  }
  .rst-cell-r {
    width: 12px;
    border-radius: 0 6px 6px 0;
    margin-left: -2px;
    transform-origin: top right;
  }
  .rst-cell-btn:disabled .rst-cell-mid {
    color: rgb(97, 97, 97);
  }

  .rst-cell-arrow-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s ease;
    padding: 0 6px;
  }

  .rst-terms {
    margin-top: 24px;
    font-size: 0.875rem;
    color: rgb(33, 33, 33);
    line-height: 1.5;
    text-align: center;
  }
  .rst-terms a {
    color: rgb(57, 89, 77);
    text-decoration: underline;
    transition: color 0.15s ease;
  }
  .rst-terms a:hover { color: rgb(22, 33, 28); }

  .rst-signup-row {
    margin-top: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 0.875rem;
    color: rgb(97, 97, 97);
    line-height: 1.5;
  }
  .rst-signup-link {
    color: rgb(57, 89, 77);
    border-bottom: 1px solid transparent;
    transition: color 0.15s ease, border-color 0.15s ease;
    background: none;
    border-top: none; border-left: none; border-right: none;
    cursor: pointer;
    padding: 0;
    font: inherit;
    font-weight: 500;
  }
  .rst-signup-link:hover {
    color: rgb(22, 33, 28);
    border-bottom-color: rgb(22, 33, 28);
  }

  /* Warning state badge */
  .rst-warning-badge {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background-color: rgba(239, 68, 68, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 12px auto 20px auto;
  }
`;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "Weak",
    checks: null,
  });

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .required("Password is required.")
        .min(8, "Password must be at least 8 characters.")
        .max(128, "Password cannot exceed 128 characters.")
        .test("no-spaces", "Password cannot contain spaces.", (v) => !/\s/.test(v || ""))
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter.")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter.")
        .matches(/[0-9]/, "Password must contain at least one number.")
        .matches(
          /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
          "Password must contain at least one special character."
        ),
      confirmPassword: Yup.string()
        .required("Confirm password is required.")
        .oneOf([Yup.ref("password"), null], "Passwords do not match."),
    }),
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        await resetPassword({
          reset_token: resetToken,
          new_password: values.password,
        });

        toaster.success("Password reset successful! Please log in.");
        navigate("/login");
      } catch (err) {
        const errMsg =
          err.response?.data?.error ||
          err.response?.data?.detail ||
          (err.response?.data?.errors &&
            Object.values(err.response.data.errors)[0]) ||
          "Password reset failed. Please request a new reset link.";
        setStatus({ error: errMsg });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const pwErrClass =
    formik.touched.password && formik.errors.password
      ? " rst-input--error"
      : "";
  const cpwErrClass =
    formik.touched.confirmPassword && formik.errors.confirmPassword
      ? " rst-input--error"
      : "";

  return (
    <div className="rst-page">
      <style>{PAGE_STYLES}</style>
      <div className="rst-bg" aria-hidden="true" />

      <div className="rst-shell">
        {/* Top navigation */}
        <nav className="rst-nav" aria-label="Site navigation">
          <button
            type="button"
            className="rst-nav-logo"
            onClick={() => navigate("/")}
            aria-label="IntraView home"
          >
            <img
              src={LOGO_URL}
              alt="IntraView"
              className="rst-nav-logo-img"
            />
          </button>
          <button
            type="button"
            className="rst-nav-link"
            onClick={() => navigate("/login")}
            aria-label="Go to log in"
          >
            Log in
          </button>
        </nav>

        {/* Card wrapper */}
        <div className="rst-card-wrap">
          <div className="rst-card" role="main">
            {!resetToken ? (
              // Invalid / missing token state
              <div style={{ textAlign: "center", width: "100%" }}>
                <div className="rst-warning-badge" aria-hidden="true">
                  <AlertTriangleIcon />
                </div>

                <h1 className="rst-heading" style={{ color: "rgb(220, 38, 38)" }}>
                  Invalid or Expired Link
                </h1>

                <p className="rst-subheading" style={{ maxWidth: "400px" }}>
                  The password reset token is missing or has expired. Please request a new password reset link to continue.
                </p>

                <div className="rst-submit-wrap" style={{ marginTop: "24px" }}>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="rst-cell-btn"
                  >
                    <div className="rst-cell-part rst-cell-part-main">
                      <span className="rst-bg-color rst-cell-l"></span>
                      <div className="rst-bg-color rst-cell-mid">
                        Request new link
                      </div>
                      <span className="rst-bg-color rst-cell-skew-r"></span>
                    </div>
                    <div className="rst-cell-part rst-cell-part-arrow">
                      <span className="rst-bg-color rst-cell-skew-l"></span>
                      <div className="rst-bg-color rst-cell-mid rst-cell-arrow-icon">
                        <ArrowRightIcon />
                      </div>
                      <span className="rst-bg-color rst-cell-r"></span>
                    </div>
                  </button>
                </div>

                <div className="rst-signup-row" style={{ marginTop: "32px" }}>
                  <span>Remember your password?</span>
                  <button
                    type="button"
                    className="rst-signup-link"
                    onClick={() => navigate("/login")}
                  >
                    Log in
                  </button>
                </div>
              </div>
            ) : (
              // Valid token: reset form
              <>
                <h1 className="rst-heading">Set new password</h1>

                <p className="rst-subheading">
                  Create a strong and secure password for your account.
                </p>

                <form
                  className="rst-form"
                  onSubmit={formik.handleSubmit}
                  noValidate
                >
                  {/* New Password */}
                  <div className="rst-input-wrap">
                    <label className="rst-input-label" htmlFor="rst-password">
                      <span className="rst-input-label-text">New Password</span>
                    </label>
                    <input
                      id="rst-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      spellCheck={false}
                      autoComplete="new-password"
                      className={`rst-input rst-input--top${pwErrClass}`}
                      disabled={formik.isSubmitting}
                      {...formik.getFieldProps("password")}
                      onChange={(e) => {
                        formik.handleChange(e);
                        setPasswordStrength(checkPasswordStrength(e.target.value));
                      }}
                    />
                    <button
                      type="button"
                      className="rst-eye-btn"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <div className="rst-input-wrap">
                    <label
                      className="rst-input-label"
                      htmlFor="rst-confirm-password"
                    >
                      <span className="rst-input-label-text">
                        Confirm Password
                      </span>
                    </label>
                    <input
                      id="rst-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      spellCheck={false}
                      autoComplete="new-password"
                      className={`rst-input rst-input--bottom${cpwErrClass}`}
                      disabled={formik.isSubmitting}
                      {...formik.getFieldProps("confirmPassword")}
                    />
                    <button
                      type="button"
                      className="rst-eye-btn"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                    </button>
                  </div>

                  {/* Validation errors */}
                  {formik.touched.password && formik.errors.password && (
                    <span className="rst-error-text" role="alert">
                      {formik.errors.password}
                    </span>
                  )}
                  {formik.touched.confirmPassword &&
                    formik.errors.confirmPassword && (
                      <span className="rst-error-text" role="alert">
                        {formik.errors.confirmPassword}
                      </span>
                    )}

                  {/* Password strength meter */}
                  {formik.values.password && (
                    <div className="rst-strength-wrap">
                      <PasswordStrengthBar
                        score={passwordStrength.score}
                        label={passwordStrength.label}
                        checks={passwordStrength.checks}
                      />
                    </div>
                  )}

                  {/* Backend error box */}
                  {formik.status?.error && (
                    <div className="rst-error-box" role="alert">
                      <p>{formik.status.error}</p>
                    </div>
                  )}

                  {/* Submit button */}
                  <div className="rst-submit-wrap">
                    <button
                      type="submit"
                      className="rst-cell-btn"
                      disabled={formik.isSubmitting}
                      aria-label={
                        formik.isSubmitting
                          ? "Resetting password…"
                          : "Reset password"
                      }
                    >
                      <div className="rst-cell-part rst-cell-part-main">
                        <span className="rst-bg-color rst-cell-l"></span>
                        <div className="rst-bg-color rst-cell-mid">
                          {formik.isSubmitting ? (
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <svg
                                className="animate-spin"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Resetting password…
                            </span>
                          ) : (
                            "Reset password"
                          )}
                        </div>
                        <span className="rst-bg-color rst-cell-skew-r"></span>
                      </div>
                      <div className="rst-cell-part rst-cell-part-arrow">
                        <span className="rst-bg-color rst-cell-skew-l"></span>
                        <div className="rst-bg-color rst-cell-mid rst-cell-arrow-icon">
                          <ArrowRightIcon />
                        </div>
                        <span className="rst-bg-color rst-cell-r"></span>
                      </div>
                    </button>
                  </div>
                </form>

                <p className="rst-terms">
                  Need assistance? View our{" "}
                  <Link to="/terms-of-use">Terms of Use</Link> and{" "}
                  <Link to="/privacy-policy">Privacy Policy</Link>.
                </p>

                <div className="rst-signup-row">
                  <span>Remember your password?</span>
                  <button
                    type="button"
                    className="rst-signup-link"
                    onClick={() => {
                      if (!formik.isSubmitting) navigate("/login");
                    }}
                    disabled={formik.isSubmitting}
                  >
                    Log in
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;