import React from 'react';
import { XCircle, LayoutDashboard, Home } from 'lucide-react';
import ErrorLayout from './ErrorLayout';

const PaymentCancelledPage = () => {
  return (
    <ErrorLayout
      icon={XCircle}
      title="Payment Cancelled"
      description="Your checkout process was cancelled. You haven't been charged. You can resume your purchase anytime from your dashboard."
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

export default PaymentCancelledPage;
