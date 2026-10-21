import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { requestPasswordReset } from "../api/authApi";
import OtpModal from "../components/OtpModal";
import toaster from "../utils/toaster";

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

const PAGE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  /* Hide scrollbars across all browsers */
  html,
  body,
  .fgt-page,
  .fgt-shell {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  html::-webkit-scrollbar,
  body::-webkit-scrollbar,
  .fgt-page::-webkit-scrollbar,
  .fgt-shell::-webkit-scrollbar {
    display: none;
    width: 0 !important;
    height: 0 !important;
  }

  .fgt-page {
    position: relative;
    display: flex;
    min-height: 100vh;
    width: 100%;
    background-color: rgb(238, 240, 239);
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
    overflow-x: hidden;
  }

  .fgt-bg {
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
    .fgt-bg { background-size: cover; }
  }

  .fgt-shell {
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
  .fgt-nav {
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
    .fgt-nav { position: fixed; }
  }

  .fgt-nav-logo {
    display: flex;
    align-items: center;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    transition: opacity 0.15s ease, transform 0.15s ease;
  }
  .fgt-nav-logo:hover {
    opacity: 0.85;
    transform: translateY(-1px);
  }
  .fgt-nav-logo-img {
    height: 80px;
    width: 135px;
    object-fit: fill;
    display: block;
    transition: transform 0.15s ease;
  }
  @media (max-width: 640px) {
    .fgt-nav-logo-img {
      height: 64px;
      width: 110px;
    }
  }

  .fgt-nav-link {
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
  .fgt-nav-link:hover { color: rgb(22, 33, 28); border-bottom-color: rgb(22, 33, 28); }

  /* Card wrapper */
  .fgt-card-wrap {
    position: relative;
    z-index: 10;
    display: flex;
    justify-content: center;
    margin: auto 0;
    width: 100%;
    padding: 0 24px 24px;
  }
  @media (min-width: 768px) {
    .fgt-card-wrap { width: fit-content; margin: auto auto; padding: 16px 0; }
  }

  .fgt-card {
    display: flex;
    width: 648px;
    max-width: 100%;
    min-height: 480px;
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
    .fgt-card { padding: 44px 44px 40px; }
  }

  .fgt-heading {
    font-size: 1.75rem;
    font-weight: 420;
    line-height: 1.36;
    color: rgb(33, 33, 33);
    margin: 0;
    text-align: center;
  }
  @media (min-width: 1024px) {
    .fgt-heading { font-size: 2.375rem; line-height: 1.2; }
  }

  .fgt-subheading {
    font-size: 0.9375rem;
    color: rgb(97, 97, 97);
    line-height: 1.5;
    text-align: center;
    margin: 14px auto 32px;
    max-width: 440px;
  }

  .fgt-form {
    display: flex;
    flex-direction: column;
    margin-top: 0;
    width: 100%;
  }

  /* Floating label input */
  .fgt-input-wrap {
    position: relative;
    width: 100%;
  }

  .fgt-input-label {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    padding: 10px 12px 0;
    pointer-events: none;
  }
  .fgt-input-label-text {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgb(33, 33, 33);
    line-height: 1.36;
  }

  .fgt-input {
    display: block;
    width: 100%;
    background: rgb(250, 250, 250);
    padding: 28px 12px 10px;
    font-size: 0.875rem;
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
    color: rgb(33, 33, 33);
    outline: none;
    box-sizing: border-box;
    border: 1px solid rgb(189, 189, 189);
    border-radius: 8px;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .fgt-input::placeholder { color: rgb(189, 189, 189); }
  .fgt-input:focus {
    position: relative;
    z-index: 5;
    box-shadow: 0 0 0 1px rgb(33, 33, 33);
    border-color: rgb(57, 89, 77);
  }
  .fgt-input:disabled { color: rgb(97, 97, 97); cursor: not-allowed; }
  .fgt-input--error {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 1px #ef4444 !important;
  }

  .fgt-error-text {
    font-size: 0.75rem;
    color: #ef4444;
    margin: 4px 0 0 2px;
    line-height: 1.4;
  }
  .fgt-error-box {
    background: rgba(239, 68, 68, 0.06);
    border: 1px solid #ef4444;
    border-radius: 6px;
    padding: 10px 14px;
    margin-top: 14px;
  }
  .fgt-error-box p {
    font-size: 0.8125rem;
    color: #ef4444;
    margin: 0;
    line-height: 1.5;
    text-align: center;
  }

  /* Submit "cell" button */
  .fgt-submit-wrap {
    margin-top: 36px;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .fgt-cell-btn {
    display: flex;
    align-items: stretch;
    gap: 4px;
    height: 40px;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
  }
  .fgt-cell-btn:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .fgt-cell-part {
    display: flex;
    height: 100%;
    transition: transform 0.15s ease;
  }
  .fgt-cell-btn:hover:not(:disabled) .fgt-cell-part {
    transform: translateX(-4px);
  }
  .fgt-cell-part-main {
    flex: 1;
    min-width: 120px;
  }
  .fgt-cell-part-arrow {
    flex: none;
  }

  .fgt-bg-color {
    background: rgb(57, 89, 77);
    transition: background 0.15s ease;
  }
  .fgt-cell-btn:hover:not(:disabled) .fgt-bg-color {
    background: rgb(43, 66, 57);
  }
  .fgt-cell-btn:active:not(:disabled) .fgt-bg-color {
    background: rgb(22, 33, 28);
  }
  .fgt-cell-btn:disabled .fgt-bg-color {
    background: rgb(238, 238, 238);
    color: rgb(97, 97, 97);
  }

  .fgt-cell-l {
    width: 12px;
    border-radius: 6px 0 0 6px;
    margin-right: -2px;
    transform-origin: top right;
  }
  .fgt-cell-mid {
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
  .fgt-cell-skew-r {
    width: 24px;
    transform: skewX(-21deg);
    border-radius: 0 10px 4px 0;
    transform-origin: top right;
  }
  .fgt-cell-skew-l {
    width: 24px;
    transform: skewX(-21deg);
    border-radius: 4px 0 0 10px;
    transform-origin: top right;
    margin-right: -16px;
  }
  .fgt-cell-r {
    width: 12px;
    border-radius: 0 6px 6px 0;
    margin-left: -2px;
    transform-origin: top right;
  }
  .fgt-cell-btn:disabled .fgt-cell-mid {
    color: rgb(97, 97, 97);
  }

  .fgt-cell-arrow-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s ease;
    padding: 0 6px;
  }

  .fgt-terms {
    margin-top: 24px;
    font-size: 0.875rem;
    color: rgb(33, 33, 33);
    line-height: 1.5;
    text-align: center;
  }
  .fgt-terms a {
    color: rgb(57, 89, 77);
    text-decoration: underline;
    transition: color 0.15s ease;
  }
  .fgt-terms a:hover { color: rgb(22, 33, 28); }

  .fgt-signup-row {
    margin-top: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 0.875rem;
    color: rgb(97, 97, 97);
    line-height: 1.5;
  }
  .fgt-signup-link {
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
  .fgt-signup-link:hover {
    color: rgb(22, 33, 28);
    border-bottom-color: rgb(22, 33, 28);
  }
`;

const ForgotPassword = () => {
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string()
        .trim()
        .email("Enter a valid email address.")
        .required("Email address is required."),
    }),
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        const cleanEmail = values.email.trim().toLowerCase();
        await requestPasswordReset({ email: cleanEmail });
        setEmail(cleanEmail);
        setShowOtpModal(true);
        toaster.success("OTP sent to your email!");
      } catch (err) {
        const errMsg =
          err.response?.data?.error ||
          err.response?.data?.detail ||
          (err.response?.data?.errors &&
            Object.values(err.response.data.errors)[0]) ||
          "Failed to send reset code. Please check your email and try again.";
        setStatus({ error: errMsg });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const emailErrorClass =
    formik.touched.email && formik.errors.email ? " fgt-input--error" : "";

  return (
    <div className="fgt-page">
      <style>{PAGE_STYLES}</style>
      <div className="fgt-bg" aria-hidden="true" />

      <div className="fgt-shell">
        {/* Top navigation */}
        <nav className="fgt-nav" aria-label="Site navigation">
          <button
            type="button"
            className="fgt-nav-logo"
            onClick={() => {
              if (!formik.isSubmitting) navigate("/");
            }}
            aria-label="IntraView home"
          >
            <img
              src={LOGO_URL}
              alt="IntraView"
              className="fgt-nav-logo-img"
            />
          </button>
          <button
            type="button"
            className="fgt-nav-link"
            onClick={() => {
              if (!formik.isSubmitting) navigate("/login");
            }}
            aria-label="Go to log in"
          >
            Log in
          </button>
        </nav>

        {/* Card wrapper */}
        <div className="fgt-card-wrap">
          <div className="fgt-card" role="main">
            <h1 className="fgt-heading">Forgot password</h1>

            <p className="fgt-subheading">
              Enter the email associated with your account, and we'll send you a 6-digit verification code to reset your password.
            </p>

            <form
              className="fgt-form"
              onSubmit={formik.handleSubmit}
              noValidate
            >
              <div className="fgt-input-wrap">
                <label className="fgt-input-label" htmlFor="fgt-email">
                  <span className="fgt-input-label-text">Email Address</span>
                </label>
                <input
                  id="fgt-email"
                  type="email"
                  placeholder="yourname@email.com"
                  spellCheck={false}
                  autoComplete="email"
                  className={`fgt-input${emailErrorClass}`}
                  disabled={formik.isSubmitting}
                  {...formik.getFieldProps("email")}
                />
              </div>

              {formik.touched.email && formik.errors.email && (
                <span className="fgt-error-text" role="alert">
                  {formik.errors.email}
                </span>
              )}

              {formik.status?.error && (
                <div className="fgt-error-box" role="alert">
                  <p>{formik.status.error}</p>
                </div>
              )}

              {/* Submit button */}
              <div className="fgt-submit-wrap">
                <button
                  type="submit"
                  className="fgt-cell-btn"
                  disabled={formik.isSubmitting}
                  aria-label={
                    formik.isSubmitting ? "Sending code…" : "Send reset code"
                  }
                >
                  <div className="fgt-cell-part fgt-cell-part-main">
                    <span className="fgt-bg-color fgt-cell-l"></span>
                    <div className="fgt-bg-color fgt-cell-mid">
                      {formik.isSubmitting ? (
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <svg
                            className="animate-spin"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending code…
                        </span>
                      ) : (
                        "Send reset code"
                      )}
                    </div>
                    <span className="fgt-bg-color fgt-cell-skew-r"></span>
                  </div>
                  <div className="fgt-cell-part fgt-cell-part-arrow">
                    <span className="fgt-bg-color fgt-cell-skew-l"></span>
                    <div className="fgt-bg-color fgt-cell-mid fgt-cell-arrow-icon">
                      <ArrowRightIcon />
                    </div>
                    <span className="fgt-bg-color fgt-cell-r"></span>
                  </div>
                </button>
              </div>
            </form>

            <p className="fgt-terms">
              Need assistance? View our{" "}
              <Link to="/terms-of-use">Terms of Use</Link> and{" "}
              <Link to="/privacy-policy">Privacy Policy</Link>.
            </p>

            <div className="fgt-signup-row">
              <span>Remember your password?</span>
              <button
                type="button"
                className="fgt-signup-link"
                onClick={() => {
                  if (!formik.isSubmitting) navigate("/login");
                }}
                disabled={formik.isSubmitting}
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <OtpModal
          email={email}
          mode="forgot-password"
          onSuccess={(resetToken) => {
            setShowOtpModal(false);
            navigate(`/reset-password?token=${resetToken}`);
          }}
          onClose={() => setShowOtpModal(false)}
        />
      )}
    </div>
  );
};

export default ForgotPassword;