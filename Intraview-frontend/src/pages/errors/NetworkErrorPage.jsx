import React from 'react';
import { WifiOff, Home, RefreshCw } from 'lucide-react';
import ErrorLayout from './ErrorLayout';

const NetworkErrorPage = () => {
  return (
    <ErrorLayout
      icon={WifiOff}
      title="Connection Lost"
      description="We couldn't connect to our servers. Please check your internet connection or try again in a moment."
      primaryAction={{
        label: "Retry Connection",
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

export default NetworkErrorPage;
