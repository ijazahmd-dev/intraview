// src/components/AuthRequiredModal.jsx

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, LogIn, UserPlus, Lock, ArrowRight, Shield } from 'lucide-react';

/**
 * AuthRequiredModal
 * -----------------
 * Shown by ProtectedRoute when the user is NOT authenticated.
 * Replaces the hard <Navigate to="/login" /> with a polished modal.
 *
 * Props:
 *   onClose — called when user dismisses the modal (e.g. backdrop click / X).
 *             Typically navigates back or to home.
 */
const AuthRequiredModal = ({ onClose }) => {
  const navigate   = useNavigate();
  const location   = useLocation();

  // Save the intended destination so login/signup can redirect back.
  const intendedPath = location.pathname + location.search;

  // Lock body scroll while modal is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleLogin  = () => navigate('/login',  { state: { from: intendedPath } });
  const handleSignup = () => navigate('/signup', { state: { from: intendedPath } });
  const handleClose  = () => (onClose ? onClose() : navigate(-1));

  // Stop propagation so clicks inside card don't close the modal.
  const stopPropagation = (e) => e.stopPropagation();

  return (
    <>
      {/* ── Keyframes injected once ────────────────────────────────── */}
      <style>{`
        @keyframes iv-modal-in {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .iv-modal-card {
          animation: iv-modal-in 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes iv-pulse-ring {
          0%, 100% { transform: scale(1);    opacity: 0.5; }
          50%       { transform: scale(1.18); opacity: 0;   }
        }
        .iv-lock-pulse::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 1rem;
          background: #14b8a6;
          animation: iv-pulse-ring 2.4s ease-out infinite;
        }
      `}</style>

      {/* ── Full-viewport overlay ───────────────────────────────────── */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
        aria-modal="true"
        role="dialog"
        aria-label="Sign in required"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-gray-900/55 backdrop-blur-[3px]" />

        {/* ── Modal card ────────────────────────────────────────────── */}
        <div
          className="iv-modal-card relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={stopPropagation}
        >
          {/* ── Teal top accent strip ─── */}
          <div className="h-1.5 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600" />

          <div className="px-8 pt-8 pb-10">

            {/* ── Close button ──────────────────────────── */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* ── Brand mark ───────────────────────────── */}
            <div className="flex items-center justify-center gap-2.5 mb-7">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm select-none">In</span>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">IntraView</span>
            </div>

            {/* ── Lock icon with pulse ─────────────────── */}
            <div className="flex justify-center mb-6">
              <div className="relative iv-lock-pulse">
                <div className="relative z-10 w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center border-2 border-teal-100">
                  <Lock className="w-7 h-7 text-teal-500" />
                </div>
              </div>
            </div>

            {/* ── Heading ─────────────────────────────── */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Sign in to continue
            </h2>
            <p className="text-gray-500 text-center text-sm leading-relaxed max-w-xs mx-auto mb-8">
              This page requires you to be signed in. Log in or create a free
              account to get started with IntraView.
            </p>

            {/* ── Trust badge row ─────────────────────── */}
            <div className="flex items-center justify-center gap-4 mb-8 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                Secure sign in
              </span>
              <span className="w-px h-3.5 bg-gray-200" />
              <span>Free to join</span>
              <span className="w-px h-3.5 bg-gray-200" />
              <span>No credit card</span>
            </div>

            {/* ── Action buttons ──────────────────────── */}
            <div className="space-y-3">
              {/* Primary — Log In */}
              <button
                id="auth-modal-login-btn"
                onClick={handleLogin}
                className="
                  w-full bg-teal-500 hover:bg-teal-600 active:bg-teal-700
                  text-white font-semibold py-3.5 rounded-xl
                  transition-all duration-200
                  flex items-center justify-center gap-2
                  shadow-sm hover:shadow-md
                  group
                "
              >
                <LogIn className="w-4 h-4" />
                Log In to Your Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Secondary — Sign Up */}
              <button
                id="auth-modal-signup-btn"
                onClick={handleSignup}
                className="
                  w-full border-2 border-gray-200 hover:border-teal-300 hover:bg-teal-50
                  text-gray-700 font-semibold py-3.5 rounded-xl
                  transition-all duration-200
                  flex items-center justify-center gap-2
                "
              >
                <UserPlus className="w-4 h-4 text-teal-500" />
                Create a Free Account
              </button>
            </div>

            {/* ── Divider ─────────────────────────────── */}
            <p className="text-center text-xs text-gray-400 mt-6">
              By continuing you agree to our{' '}
              <span className="text-teal-600 hover:underline cursor-pointer">Terms</span>
              {' '}and{' '}
              <span className="text-teal-600 hover:underline cursor-pointer">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthRequiredModal;
