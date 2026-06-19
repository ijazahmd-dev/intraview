import React from 'react';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import ErrorLayout from './ErrorLayout';

const NotFoundPage = () => {
  return (
    <ErrorLayout
      icon={FileQuestion}
      title="Page Not Found"
      description="The page you are looking for doesn't exist or has been moved. Check the URL or return to the dashboard."
      primaryAction={{
        label: "Go Home",
        icon: Home,
        href: "/home"
      }}
      secondaryAction={{
        label: "Go Back",
        icon: ArrowLeft,
        // Using -1 in react-router goes back in history
        onClick: () => window.history.back()
      }}
    />
  );
};

export default NotFoundPage;
