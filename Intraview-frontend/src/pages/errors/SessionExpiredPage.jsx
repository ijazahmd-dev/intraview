import React from 'react';
import { Clock, RefreshCw, LayoutDashboard } from 'lucide-react';
import ErrorLayout from './ErrorLayout';

const SessionExpiredPage = () => {
  return (
    <ErrorLayout
      icon={Clock}
      title="Session Expired"
      description="The join window for this interview session has closed, or the session has timed out. Please return to your dashboard or create a new session."
      primaryAction={{
        label: "Create New Interview",
        icon: RefreshCw,
        href: "/ai-interview/roles"
      }}
      secondaryAction={{
        label: "Return to Dashboard",
        icon: LayoutDashboard,
        href: "/candidate/dashboard/upcoming"
      }}
    />
  );
};

export default SessionExpiredPage;
