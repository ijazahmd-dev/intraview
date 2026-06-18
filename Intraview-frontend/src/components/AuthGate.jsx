// src/components/AuthGate.jsx
//
// Listens for the "intraview:auth:required" CustomEvent fired by axiosClient.js
// whenever any API call returns 401 for a candidate (non-admin, non-interviewer).
// Mounts the AuthRequiredModal on top of whatever page is currently visible —
// no hard browser redirect, no loss of page context.

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import AuthRequiredModal from './AuthRequiredModal';

const AuthGate = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the modal automatically if the route changes (e.g., user clicks Login)
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleAuthRequired = useCallback(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    window.addEventListener('intraview:auth:required', handleAuthRequired);
    return () => {
      window.removeEventListener('intraview:auth:required', handleAuthRequired);
    };
  }, [handleAuthRequired]);

  if (!open) return null;

  // onClose just hides the modal — user stays on the page.
  // They can still browse public content; if they try a protected action again
  // the modal will reappear.
  return <AuthRequiredModal onClose={() => setOpen(false)} />;
};

export default AuthGate;
