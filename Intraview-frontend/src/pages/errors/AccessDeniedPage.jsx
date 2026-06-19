import React from 'react';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import ErrorLayout from './ErrorLayout';

const AccessDeniedPage = () => {
  return (
    <ErrorLayout
      icon={ShieldAlert}
      title="Access Denied"
      description="You don't have permission to view this page. Ensure you are logged in with the correct account role (Candidate, Interviewer, or Admin)."
      primaryAction={{
        label: "Return Home",
        icon: Home,
        href: "/home"
      }}
      secondaryAction={{
        label: "Go Back",
        icon: ArrowLeft,
        onClick: () => window.history.back()
      }}
    />
  );
};

export default AccessDeniedPage;
