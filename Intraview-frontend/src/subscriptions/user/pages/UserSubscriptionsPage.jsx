import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { 
  fetchCurrentSubscription, 
  fetchSubscriptionPlans,
  clearError 
} from '../../subscriptionSlice.js';
import CurrentSubscription from '../components/CurrentSubscriptionCard.jsx';
import SubscriptionCard from '../components/SubscriptionPlansGrid.jsx';
import SubscriptionModal from '../components/SubscriptionModal.jsx';
import { subscriptionsApi } from '../../subscriptionsApi.js';

const SubscriptionsPage = () => {
  const dispatch = useDispatch();
  const { current, plans, loading, error } = useSelector(
    (state) => state.subscription
  );
  
  // Modal state
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCurrentSubscription());
    dispatch(fetchSubscriptionPlans());
  }, [dispatch]);

  const openPlanModal = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const handleProceedToCheckout = async (planId) => {
    const toastId = toast.loading('Creating secure checkout session...');
    
    try {
      const response = await subscriptionsApi.createCheckout(planId);
      
      // Backend returns Stripe checkout URL → redirect immediately
      toast.success('Redirecting to Stripe Checkout...', { id: toastId });
      window.location.href = response.data.checkout_url;
    } catch (error) {
      toast.error(
        error.response?.data?.detail || 
        'Failed to create checkout session. Please try again.', 
        { id: toastId }
      );
    }
  };

  // Show loading only on initial load
  if (loading && !current && plans.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Unlock premium features, priority booking, and monthly free tokens 
            to supercharge your interview preparation.
          </p>
        </div>

        {/* Current Subscription */}
        <CurrentSubscription current={current} />

        {/* Plans Grid */}
        <div className="mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <SubscriptionCard
                key={plan.id}
                plan={plan}
                currentPlan={current?.plan_name}
                onSubscribe={openPlanModal}
                disabled={!plan.is_active}
              />
            ))}
          </div>
        </div>

        {/* Error Handling */}
        {error && (
          <div className="mt-12 p-6 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-center justify-center gap-3">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-800 text-center font-medium">{error}</p>
            </div>
            <button
              onClick={() => dispatch(clearError())}
              className="mt-4 w-full sm:w-auto px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Subscription Modal */}
        <SubscriptionModal
          plan={selectedPlan}
          isOpen={isModalOpen}
          onClose={closeModal}
          onProceedToCheckout={handleProceedToCheckout}
        />
      </div>
    </div>
  );
};

export default SubscriptionsPage;