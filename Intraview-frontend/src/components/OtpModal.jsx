import React, { useState, useEffect, useRef } from "react";
import {
  verifyOtp,
  verifyForgotOtp,
  resendSignupOtp,
  resendForgotOtp,
} from "../api/authApi";
import toaster from "../utils/toaster";

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

function MailIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="16" x="2" y="4" rx="3" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

const MODAL_STYLES = `
  @keyframes otpModalFadeIn {
    from {
      opacity: 0;
      transform: scale(0.96) translateY(8px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .om-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background-color: rgba(22, 33, 28, 0.5);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  }

  .om-card {
    position: relative;
    width: 100%;
    max-width: 480px;
    background: #ffffff;
    border-radius: 24px;
    border: 1px solid rgb(224, 224, 224);
    padding: 38px 32px 32px;
    box-sizing: border-box;
    box-shadow: 0 24px 60px -12px rgba(22, 33, 28, 0.25);
    animation: otpModalFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @media (max-width: 500px) {
    .om-card {
      padding: 32px 20px 24px;
      border-radius: 20px;
    }
  }

  .om-close-btn {
    position: absolute;
    top: 18px;
    right: 18px;
    background: none;
    border: none;
    padding: 6px;
    color: rgb(150, 155, 153);
    cursor: pointer;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s ease, background-color 0.15s ease;
  }
  .om-close-btn:hover {
    color: rgb(33, 33, 33);
    background-color: rgb(245, 245, 245);
  }

  .om-icon-badge {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: rgba(57, 89, 77, 0.08);
    color: rgb(57, 89, 77);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px auto;
  }

  .om-heading {
    font-size: 1.625rem;
    font-weight: 420;
    line-height: 1.28;
    color: rgb(33, 33, 33);
    text-align: center;
    margin: 0 0 8px 0;
  }

  .om-subheading {
    font-size: 0.875rem;
    color: rgb(97, 97, 97);
    line-height: 1.5;
    text-align: center;
    margin: 0 0 24px 0;
  }
  .om-email {
    display: block;
    font-weight: 600;
    color: rgb(22, 33, 28);
    word-break: break-all;
    margin-top: 2px;
  }

  /* 6-box OTP digits */
  .om-digits-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 0 0 8px 0;
  }
  @media (max-width: 400px) {
    .om-digits-row {
      gap: 6px;
    }
  }

  .om-digit-box {
    width: 48px;
    height: 56px;
    border: 1px solid rgb(189, 189, 189);
    border-radius: 8px;
    background: rgb(250, 250, 250);
    font-size: 1.45rem;
    font-weight: 600;
    text-align: center;
    color: rgb(33, 33, 33);
    outline: none;
    font-family: inherit;
    transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    box-sizing: border-box;
    -webkit-appearance: none;
  }
  @media (max-width: 400px) {
    .om-digit-box {
      width: 40px;
      height: 50px;
      font-size: 1.25rem;
    }
  }

  .om-digit-box:focus {
    border-color: rgb(57, 89, 77);
    box-shadow: 0 0 0 1px rgb(57, 89, 77);
    background: #ffffff;
    position: relative;
    z-index: 2;
  }
  .om-digit-box--error {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 1px #ef4444 !important;
  }
  .om-digit-box:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .om-error-box {
    background: rgba(239, 68, 68, 0.06);
    border: 1px solid #ef4444;
    border-radius: 6px;
    padding: 10px 14px;
    margin: 14px 0 4px 0;
  }
  .om-error-box p {
    font-size: 0.8125rem;
    color: #ef4444;
    margin: 0;
    line-height: 1.5;
    text-align: center;
  }

  /* Cohere-style Cell Button */
  .om-submit-wrap {
    margin-top: 26px;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .om-cell-btn {
    display: flex;
    align-items: stretch;
    gap: 4px;
    height: 40px;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    outline: none;
  }
  .om-cell-btn:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .om-cell-part {
    display: flex;
    height: 100%;
    transition: transform 0.15s ease;
  }
  .om-cell-btn:hover:not(:disabled) .om-cell-part {
    transform: translateX(-4px);
  }
  .om-cell-part-main {
    flex: 1;
    min-width: 120px;
  }
  .om-cell-part-arrow {
    flex: none;
  }

  .om-bg-color {
    background: rgb(57, 89, 77);
    transition: background 0.15s ease;
  }
  .om-cell-btn:hover:not(:disabled) .om-bg-color {
    background: rgb(43, 66, 57);
  }
  .om-cell-btn:active:not(:disabled) .om-bg-color {
    background: rgb(22, 33, 28);
  }
  .om-cell-btn:disabled .om-bg-color {
    background: rgb(238, 238, 238);
    color: rgb(97, 97, 97);
  }

  .om-cell-l {
    width: 12px;
    border-radius: 6px 0 0 6px;
    margin-right: -2px;
    transform-origin: top right;
  }
  .om-cell-mid {
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
  .om-cell-skew-r {
    width: 24px;
    transform: skewX(-21deg);
    border-radius: 0 10px 4px 0;
    transform-origin: top right;
  }
  .om-cell-skew-l {
    width: 24px;
    transform: skewX(-21deg);
    border-radius: 4px 0 0 10px;
    transform-origin: top right;
    margin-right: -16px;
  }
  .om-cell-r {
    width: 12px;
    border-radius: 0 6px 6px 0;
    margin-left: -2px;
    transform-origin: top right;
  }
  .om-cell-btn:disabled .om-cell-mid {
    color: rgb(97, 97, 97);
  }

  .om-cell-arrow-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s ease;
    padding: 0 6px;
  }

  /* Resend & help text */
  .om-resend-row {
    margin-top: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 0.875rem;
    color: rgb(97, 97, 97);
    line-height: 1.5;
  }
  .om-resend-btn {
    background: none;
    border: none;
    color: rgb(57, 89, 77);
    font: inherit;
    font-weight: 500;
    padding: 0;
    cursor: pointer;
    border-bottom: 1px solid transparent;
    transition: color 0.15s ease, border-color 0.15s ease;
  }
  .om-resend-btn:hover:not(:disabled) {
    color: rgb(22, 33, 28);
    border-bottom-color: rgb(22, 33, 28);
  }
  .om-resend-btn:disabled {
    color: rgb(150, 155, 153);
    cursor: not-allowed;
    border-bottom-color: transparent;
  }

  .om-help-note {
    margin-top: 16px;
    font-size: 0.75rem;
    color: rgb(150, 155, 153);
    text-align: center;
    line-height: 1.4;
  }
`;

const OtpModal = ({ email, mode = "signup", onSuccess, onClose }) => {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(60);

  const inputsRef = useRef([]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const otpCode = digits.join("");

  const handleDigitChange = (index, value) => {
    setError("");

    // Handle single character typed
    const cleanValue = value.replace(/\D/g, "");
    if (!cleanValue) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      setDigits(nextDigits);
      return;
    }

    // Take the last entered character if multiple are entered in one box
    const char = cleanValue.slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = char;
    setDigits(nextDigits);

    // Auto-focus next input
    if (index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Current is already empty, go to previous and clear it
        const nextDigits = [...digits];
        nextDigits[index - 1] = "";
        setDigits(nextDigits);
        inputsRef.current[index - 1]?.focus();
        e.preventDefault();
      } else if (digits[index]) {
        // Clear current
        const nextDigits = [...digits];
        nextDigits[index] = "";
        setDigits(nextDigits);
        e.preventDefault();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    } else if (e.key === "Enter" && otpCode.length === 6 && !loading) {
      handleVerify();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text/plain")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedData) return;

    const nextDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      nextDigits[i] = pastedData[i] || "";
    }
    setDigits(nextDigits);
    setError("");

    // Focus last filled or 6th input
    const focusIndex = Math.min(pastedData.length, 5);
    inputsRef.current[focusIndex]?.focus();
  };

  const handleVerify = async () => {
    if (otpCode.length !== 6 || loading) return;

    setLoading(true);
    setError("");

    try {
      let response;
      if (mode === "forgot-password") {
        response = await verifyForgotOtp({ email, otp: otpCode });
        toaster.success("OTP verified successfully!");
        if (onSuccess) {
          onSuccess(response?.data?.reset_token);
        }
      } else {
        await verifyOtp({ email, otp: otpCode });
        toaster.success("Email verified successfully!");
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        (err.response?.data?.errors &&
          Object.values(err.response.data.errors)[0]) ||
        "Invalid or expired OTP. Please try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    setResending(true);
    setError("");

    try {
      if (mode === "forgot-password") {
        await resendForgotOtp({ email });
      } else {
        await resendSignupOtp({ email });
      }

      toaster.success("A new verification code has been sent!");
      setCooldown(60);
      setDigits(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } catch (err) {
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to resend code. Please try again later.";
      toaster.error(errMsg);
      setError(errMsg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="om-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <style>{MODAL_STYLES}</style>

      <div className="om-card">
        {/* Close button */}
        {onClose && (
          <button
            type="button"
            className="om-close-btn"
            onClick={onClose}
            aria-label="Close verification modal"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        {/* Icon badge */}
        <div className="om-icon-badge" aria-hidden="true">
          <MailIcon />
        </div>

        {/* Title */}
        <h2 className="om-heading">
          {mode === "forgot-password" ? "Verify reset code" : "Verify your email"}
        </h2>

        {/* Subtitle */}
        <p className="om-subheading">
          We've sent a 6-digit verification code to
          <span className="om-email">{email}</span>
        </p>

        {/* 6 Digit Input Boxes */}
        <div className="om-digits-row" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputsRef.current[idx] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              disabled={loading}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`om-digit-box${error ? " om-digit-box--error" : ""}`}
              aria-label={`Digit ${idx + 1}`}
              autoComplete={idx === 0 ? "one-time-code" : "off"}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="om-error-box" role="alert">
            <p>{error}</p>
          </div>
        )}

        {/* Verify button */}
        <div className="om-submit-wrap">
          <button
            type="button"
            onClick={handleVerify}
            className="om-cell-btn"
            disabled={loading || otpCode.length !== 6}
            aria-label={loading ? "Verifying…" : "Verify code"}
          >
            <div className="om-cell-part om-cell-part-main">
              <span className="om-bg-color om-cell-l"></span>
              <div className="om-bg-color om-cell-mid">
                {loading ? (
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
                    Verifying…
                  </span>
                ) : (
                  "Verify code"
                )}
              </div>
              <span className="om-bg-color om-cell-skew-r"></span>
            </div>
            <div className="om-cell-part om-cell-part-arrow">
              <span className="om-bg-color om-cell-skew-l"></span>
              <div className="om-bg-color om-cell-mid om-cell-arrow-icon">
                <ArrowRightIcon />
              </div>
              <span className="om-bg-color om-cell-r"></span>
            </div>
          </button>
        </div>

        {/* Resend row */}
        <div className="om-resend-row">
          <span>Didn't receive the code?</span>
          {cooldown > 0 ? (
            <span style={{ color: "rgb(150, 155, 153)", fontWeight: 500 }}>
              Resend in {cooldown}s
            </span>
          ) : (
            <button
              type="button"
              className="om-resend-btn"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
          )}
        </div>

        <p className="om-help-note">
          Can't find the email? Check your spam or promotions folder.
        </p>
      </div>
    </div>
  );
};

export default OtpModal;