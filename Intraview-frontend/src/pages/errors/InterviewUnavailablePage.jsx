import React from 'react';
import { MonitorX, LayoutDashboard, Home } from 'lucide-react';
import ErrorLayout from './ErrorLayout';

const InterviewUnavailablePage = () => {
  return (
    <ErrorLayout
      icon={MonitorX}
      title="Interview Not Available"
      description="This interview session is either invalid, deleted, or has already been completed. You cannot join this session."
      primaryAction={{
        label: "Return to Dashboard",
        icon: LayoutDashboard,
        href: "/candidate/dashboard/upcoming"
      }}
      secondaryAction={{
        label: "Return Home",
        icon: Home,
        href: "/home"
      }}
    />
  );
};

export default InterviewUnavailablePage;
