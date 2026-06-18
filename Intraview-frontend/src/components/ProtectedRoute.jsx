// src/components/ProtectedRoute.jsx

import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AuthRequiredModal from './AuthRequiredModal';

/**
 * ProtectedRoute
 * --------------
 * Wraps any route that requires authentication.
 *
 * Behaviour:
 *  - Bootstrapping  →  full-screen spinner (prevents flash)
 *  - Not logged in  →  AuthRequiredModal (no hard redirect)
 *  - Logged in      →  renders children normally
 */
const ProtectedRoute = ({ children }) => {
  const { user, bootstrapped } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  // ── Auth state not yet resolved (app boot) ────────────────────
  if (!bootstrapped) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  // ── Not authenticated → show modal over a neutral background ──
  if (!user) {
    return (
      <>
        {/* Neutral background so no protected content leaks through */}
        <div className="min-h-screen bg-gray-50" />

        {/* Auth modal — dismisses to homepage */}
        <AuthRequiredModal onClose={() => navigate('/', { replace: true })} />
      </>
    );
  }

  // ── Authenticated ─────────────────────────────────────────────
  return children;
};

export default ProtectedRoute;
