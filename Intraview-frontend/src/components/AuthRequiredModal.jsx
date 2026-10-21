// src/components/AuthRequiredModal.jsx
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const LOGO_URL =
  'https://res.cloudinary.com/dpn42vumz/image/upload/v1790803589/7a01858e-5b2d-420e-b5da-6722ef1f99d90000000000_injfdo.png';

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

const MODAL_STYLES = `
  @keyframes armModalFadeIn {
    from {
      opacity: 0;
      transform: scale(0.96) translateY(8px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .arm-overlay {
    position: fixed;
    inset: 0;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background-color: rgba(22, 33, 28, 0.55);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  }

  .arm-card {
    position: relative;
    width: 100%;
    max-width: 460px;
    background: #ffffff;
    border-radius: 24px;
    border: 1px solid rgb(224, 224, 224);
    padding: 40px 36px 34px;
    box-sizing: border-box;
    box-shadow: 0 24px 60px -12px rgba(22, 33, 28, 0.28);
    animation: armModalFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @media (max-width: 500px) {
    .arm-card {
      padding: 32px 22px 26px;
      border-radius: 20px;
    }
  }

  .arm-close-btn {
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
  .arm-close-btn:hover {
    color: rgb(33, 33, 33);
    background-color: rgb(245, 245, 245);
  }

  .arm-logo-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 12px;
  }
  .arm-logo-img {
    height: 72px;
    width: 122px;
    object-fit: fill;
    display: block;
  }

  .arm-heading {
    font-size: 1.625rem;
    font-weight: 420;
    line-height: 1.3;
    color: rgb(33, 33, 33);
    text-align: center;
    margin: 0 0 8px 0;
  }

  .arm-subheading {
    font-size: 0.875rem;
    color: rgb(97, 97, 97);
    line-height: 1.5;
    text-align: center;
    margin: 0 auto 28px auto;
    max-width: 360px;
  }

  /* Cohere-style Cell Button */
  .arm-submit-wrap {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .arm-cell-btn {
    display: flex;
    align-items: stretch;
    gap: 4px;
    height: 42px;
    width: 100%;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    outline: none;
  }

  .arm-cell-part {
    display: flex;
    height: 100%;
    transition: transform 0.15s ease;
  }
  .arm-cell-btn:hover .arm-cell-part {
    transform: translateX(-4px);
  }
  .arm-cell-part-main {
    flex: 1;
    min-width: 120px;
  }
  .arm-cell-part-arrow {
    flex: none;
  }

  .arm-bg-color {
    background: rgb(57, 89, 77);
    transition: background 0.15s ease;
  }
  .arm-cell-btn:hover .arm-bg-color {
    background: rgb(43, 66, 57);
  }
  .arm-cell-btn:active .arm-bg-color {
    background: rgb(22, 33, 28);
  }

  .arm-cell-l {
    width: 12px;
    border-radius: 6px 0 0 6px;
    margin-right: -2px;
    transform-origin: top right;
  }
  .arm-cell-mid {
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 0 16px;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    letter-spacing: 0.0025em;
  }
  .arm-cell-skew-r {
    width: 24px;
    transform: skewX(-21deg);
    border-radius: 0 10px 4px 0;
    transform-origin: top right;
  }
  .arm-cell-skew-l {
    width: 24px;
    transform: skewX(-21deg);
    border-radius: 4px 0 0 10px;
    transform-origin: top right;
    margin-right: -16px;
  }
  .arm-cell-r {
    width: 12px;
    border-radius: 0 6px 6px 0;
    margin-left: -2px;
    transform-origin: top right;
  }

  .arm-cell-arrow-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s ease;
    padding: 0 6px;
  }

  /* Divider */
  .arm-divider {
    display: flex;
    align-items: center;
    width: 100%;
    margin: 18px 0;
  }
  .arm-divider-line {
    flex: 1;
    height: 1.5px;
    background-color: rgb(57, 89, 77);
    display: block;
    border: none;
  }
  .arm-divider-text {
    padding: 0 14px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgb(57, 89, 77);
    user-select: none;
    line-height: 1;
  }

  /* Secondary button (matches OAuth button style on Login) */
  .arm-secondary-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 42px;
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid rgb(218, 220, 224);
    background: #ffffff;
    color: rgb(33, 33, 33);
    font-size: 0.875rem;
    font-weight: 500;
    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
    line-height: 1.5;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
    box-sizing: border-box;
    text-decoration: none;
  }
  .arm-secondary-btn:hover {
    background: rgb(245, 245, 245);
    border-color: rgb(117, 117, 117);
  }
  .arm-secondary-btn:active {
    background: rgb(238, 238, 238);
    border-color: rgb(33, 33, 33);
  }

  /* Terms row */
  .arm-terms {
    margin-top: 24px;
    font-size: 0.8125rem;
    color: rgb(97, 97, 97);
    line-height: 1.5;
    text-align: center;
  }
  .arm-terms a {
    color: rgb(57, 89, 77);
    text-decoration: underline;
    transition: color 0.15s ease;
  }
  .arm-terms a:hover {
    color: rgb(22, 33, 28);
  }
`;

const AuthRequiredModal = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Save intended destination for redirect back
  const intendedPath = location.pathname + location.search;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleLogin = () => navigate('/login', { state: { from: intendedPath } });
  const handleSignup = () => navigate('/signup', { state: { from: intendedPath } });
  const handleClose = () => (onClose ? onClose() : navigate(-1));

  return createPortal(
    <div
      className="arm-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Sign in required"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <style>{MODAL_STYLES}</style>

      <div className="arm-card">
        {/* Close button */}
        <button
          type="button"
          className="arm-close-btn"
          onClick={handleClose}
          aria-label="Close modal"
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

        {/* IntraView brand logo */}
        <div className="arm-logo-wrap">
          <img src={LOGO_URL} alt="IntraView" className="arm-logo-img" />
        </div>

        {/* Heading */}
        <h2 className="arm-heading">Sign in to continue</h2>

        {/* Subtitle */}
        <p className="arm-subheading">
          This page requires an account. Log in or create a free account to continue with IntraView.
        </p>

        {/* Primary Action: Log in cell button */}
        <div className="arm-submit-wrap">
          <button
            id="auth-modal-login-btn"
            type="button"
            onClick={handleLogin}
            className="arm-cell-btn"
            aria-label="Log in to your account"
          >
            <div className="arm-cell-part arm-cell-part-main">
              <span className="arm-bg-color arm-cell-l"></span>
              <div className="arm-bg-color arm-cell-mid">Log in to your account</div>
              <span className="arm-bg-color arm-cell-skew-r"></span>
            </div>
            <div className="arm-cell-part arm-cell-part-arrow">
              <span className="arm-bg-color arm-cell-skew-l"></span>
              <div className="arm-bg-color arm-cell-mid arm-cell-arrow-icon">
                <ArrowRightIcon />
              </div>
              <span className="arm-bg-color arm-cell-r"></span>
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="arm-divider" role="separator" aria-label="Or">
          <span className="arm-divider-line" />
          <span className="arm-divider-text">or</span>
          <span className="arm-divider-line" />
        </div>

        {/* Secondary Action: Create account button */}
        <button
          id="auth-modal-signup-btn"
          type="button"
          onClick={handleSignup}
          className="arm-secondary-btn"
        >
          Create a free account
        </button>

        {/* Terms row */}
        <p className="arm-terms">
          By continuing you agree to our{' '}
          <Link to="/terms-of-use" onClick={handleClose}>
            Terms of Use
          </Link>{' '}
          and{' '}
          <Link to="/privacy-policy" onClick={handleClose}>
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>,
    document.body
  );
};

export default AuthRequiredModal;
