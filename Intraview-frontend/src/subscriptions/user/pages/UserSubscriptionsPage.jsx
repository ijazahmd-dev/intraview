import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { 
  fetchCurrentSubscription, 
  fetchSubscriptionPlans,
  clearError 
} from '../../subscriptionSlice.js';
import CurrentSubscriptionCard from '../components/CurrentSubscriptionCard.jsx';
import SubscriptionPlansGrid from '../components/SubscriptionPlansGrid.jsx';

export default function UserSubscriptionsPage() {
  const dispatch = useDispatch();
  const { current, plans, loading, error } = useSelector(state => state.subscription);

  useEffect(() => {
    dispatch(fetchCurrentSubscription());
    dispatch(fetchSubscriptionPlans());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Unlock unlimited AI interviews, priority booking, and premium features
        </p>
      </div>

      {/* Current Subscription */}
      <CurrentSubscriptionCard 
        subscription={current} 
        plans={plans}
        loading={loading}
      />

      {/* Available Plans */}
      <SubscriptionPlansGrid 
        plans={plans}
        currentPlanId={current?.plan?.id}
        loading={loading}
      />
    </div>
  );
}
