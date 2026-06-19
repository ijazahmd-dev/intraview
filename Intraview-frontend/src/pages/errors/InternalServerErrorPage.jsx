import React from 'react';
import { ServerCrash, Home, RefreshCw } from 'lucide-react';
import ErrorLayout from './ErrorLayout';

const InternalServerErrorPage = () => {
  return (
    <ErrorLayout
      icon={ServerCrash}
      title="Something Went Wrong"
      description="We're experiencing an unexpected technical issue on our end. Our engineering team has been notified and is working to resolve it."
      primaryAction={{
        label: "Refresh Page",
        icon: RefreshCw,
        onClick: () => window.location.reload()
      }}
      secondaryAction={{
        label: "Return Home",
        icon: Home,
        href: "/home"
      }}
    />
  );
};

export default InternalServerErrorPage;
