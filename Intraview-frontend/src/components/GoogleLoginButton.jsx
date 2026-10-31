// src/components/GoogleLoginButton.jsx
// Custom-styled Google Sign-In button that matches the Login page's design.
// Renders an invisible Google SDK button in the background and triggers it
// when the visible custom button is clicked.

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { googleLoginUser, fetchUser } from "../authentication/authSlice";
import toaster from "../utils/toaster";

// ── Google coloured "G" icon (matches the Login page design) ────────────────
function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

// ── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{
        animation: "glb-spin 0.8s linear infinite",
        flexShrink: 0,
      }}
    >
      <circle cx="12" cy="12" r="10" stroke="#211C18" strokeWidth="3" strokeOpacity="0.2" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="#211C18"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Cohere-styled Google icon (coloured) ────────────────────────────────────
function GoogleColoredIcon({ size = 20 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 0 24 24" width={size} aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
// variant: undefined | 'cohere' | 'circle'
//   default  — renders the official Google SDK button.
//   'cohere' — renders custom-styled button with Google SDK overlay.
//   'circle' — renders circular button with Google SDK overlay.
const GoogleLoginButton = ({ disabled = false, variant, className }) => {
  const hiddenRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Handle the credential returned by the Google SDK
  const handleCredentialResponse = async (response) => {
    if (isSigningIn || disabled) return;

    setIsSigningIn(true);
    setLoading(true);

    try {
      const result = await dispatch(googleLoginUser(response.credential));

      if (googleLoginUser.fulfilled.match(result)) {
        if (!result.payload?.user) {
          await dispatch(fetchUser());
        }
        toaster.success("Google Sign-In successful!");
        navigate("/home");
      }
    } catch (err) {
      console.error("Google login error:", err);
      toaster.error(err.response?.data?.error || "Google sign-in failed");
    } finally {
      setLoading(false);
      setIsSigningIn(false);
    }
  };

  // Initialise the Google SDK and render the widget
  useEffect(() => {
    let interval = null;

    const setupGoogle = () => {
      if (!window.google?.accounts?.id || !hiddenRef.current) return false;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(hiddenRef.current, {
        type: variant === "circle" ? "icon" : "standard",
        shape: variant === "circle" ? "circle" : "rectangular",
        theme: "outline",
        size: "large",
        text: "signin_with",
      });

      setSdkReady(true);
      return true;
    };

    if (!setupGoogle()) {
      interval = setInterval(() => {
        if (setupGoogle()) {
          clearInterval(interval);
        }
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, GOOGLE_CLIENT_ID]);

  // Click handler fallback
  const handleClick = () => {
    if (disabled || loading) return;
    const sdkBtn = hiddenRef.current?.querySelector("div[role='button'], iframe");
    if (sdkBtn) {
      sdkBtn.click();
    } else {
      window.google?.accounts?.id?.prompt();
    }
  };

  const isDisabled = disabled || loading;

  // ── Circle variant ────────────────────────────────────────────────────────
  if (variant === 'circle') {
    return (
      <div
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          overflow: "hidden",
        }}
        onClick={handleClick}
      >
        {/* Visible custom circular button */}
        <button
          type="button"
          disabled={isDisabled}
          tabIndex={-1}
          aria-hidden="true"
          className={className || "clp-google-circle-btn"}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            margin: 0,
            pointerEvents: "none",
          }}
        >
          {loading ? <Spinner /> : <GoogleColoredIcon size={22} />}
        </button>

        {/* Real Google SDK button directly over the custom button so user clicks trigger Google popup */}
        <div
          ref={hiddenRef}
          aria-label="Sign in with Google"
          title="Sign in with Google"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.001,
            zIndex: 10,
            cursor: isDisabled ? "not-allowed" : "pointer",
            pointerEvents: isDisabled ? "none" : "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "scale(1.4)",
            overflow: "hidden",
          }}
        />
      </div>
    );
  }

  // ── Cohere variant ────────────────────────────────────────────────────────
  if (variant === 'cohere') {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
        onClick={handleClick}
      >
        <button
          type="button"
          disabled={isDisabled}
          tabIndex={-1}
          aria-hidden="true"
          className={className || "clp-oauth-btn"}
          style={{ width: "100%", pointerEvents: "none" }}
        >
          {loading ? <Spinner /> : <GoogleColoredIcon />}
          <span>{loading ? 'Signing in…' : 'Continue with Google'}</span>
        </button>

        <div
          ref={hiddenRef}
          aria-label="Continue with Google"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.001,
            zIndex: 10,
            cursor: isDisabled ? "not-allowed" : "pointer",
            pointerEvents: isDisabled ? "none" : "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "scale(1.1)",
            overflow: "hidden",
          }}
        />
      </div>
    );
  }

  // ── Default variant: official Google SDK button (original behaviour) ───────
  return (
    <>
      {/* ── Keyframe animation injected once ─────────────────────────────── */}
      <style>{`
        @keyframes glb-spin { to { transform: rotate(360deg); } }

        .glb-btn {
          width: 100%;
          height: 54px;
          border-radius: 2px;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #FBF7F4;
          border: 1.5px solid #211C18;
          color: #211C18;
          box-shadow: 4px 4px 0 0 #211C18;
          transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
          position: relative;
          overflow: hidden;
        }

        .glb-btn:hover:not(:disabled) {
          transform: translate(-1px, -1px);
          box-shadow: 5px 5px 0 0 #211C18;
          background: #F0EBE5;
        }

        .glb-btn:active:not(:disabled) {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0 0 #211C18;
        }

        .glb-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
      `}</style>

      {/* ── Visible custom button ── COMMENTED OUT FOR PROD COMPATIBILITY ──
      <button
        type="button"
        className="glb-btn"
        onClick={handleClick}
        disabled={isDisabled}
        aria-label="Continue with Google"
      >
        {loading ? <Spinner /> : <GoogleIcon />}
        {loading ? "SIGNING IN..." : "CONTINUE WITH GOOGLE"}
      </button>
      */}

      {/* ── Official Google SDK button (Now visible!) ─────────────── */}
      <div
        ref={hiddenRef}
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          marginTop: "10px",
          pointerEvents: isDisabled ? "none" : "auto",
          opacity: isDisabled ? 0.6 : 1,
        }}
      />
    </>
  );
};

export default GoogleLoginButton;
