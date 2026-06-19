import React from 'react';
import { CreditCard, RefreshCw, LayoutDashboard } from 'lucide-react';
import ErrorLayout from './ErrorLayout';

const PaymentFailedPage = () => {
  return (
    <ErrorLayout
      icon={CreditCard}
      title="Payment Failed"
      description="We couldn't process your payment. Your card may have been declined or the connection was interrupted. Please try again or use a different payment method."
      primaryAction={{
        label: "Retry Payment",
        icon: RefreshCw,
        onClick: () => window.history.back()
      }}
      secondaryAction={{
        label: "Return to Dashboard",
        icon: LayoutDashboard,
        href: "/candidate/dashboard/upcoming"
      }}
    />
  );
};

export default PaymentFailedPage;
