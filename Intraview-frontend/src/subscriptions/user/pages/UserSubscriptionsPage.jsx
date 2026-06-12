import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  fetchCurrentSubscription,
  fetchSubscriptionPlans,
  clearError
} from '../../subscriptionSlice.js';
import CurrentSubscriptionCard from '../components/CurrentSubscriptionCard.jsx';
import SubscriptionPlansGrid from '../components/SubscriptionPlansGrid.jsx';
import SubscriptionModal from '../components/SubscriptionModal.jsx';
import { subscriptionsApi } from '../../subscriptionsApi.js';
import CandidateNavbar from '../../../components/CandidateNavbar.jsx';
import CandidateFooter from '../../../components/CandidateFooter.jsx';
import { CheckCircle, Zap, Shield } from 'lucide-react';

const PERKS = [
  { icon: CheckCircle, text: 'Monthly free tokens included' },
  { icon: Zap,         text: 'Unlimited or on-demand AI mock interviews' },
  { icon: Shield,      text: 'Cancel anytime, no lock-in contracts' },
];

const SubscriptionsPage = () => {
  const dispatch = useDispatch();
  const { current, plans, loading, error } = useSelector(
    (state) => state.subscription
  );

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
      toast.success('Redirecting to Stripe Checkout...', { id: toastId });
      window.location.href = response.data.checkout_url;
    } catch (error) {
      toast.error(
        error.response?.data?.detail || 'Failed to create checkout session. Please try again.',
        { id: toastId }
      );
    }
  };

  /* ── Loading ── */
  if (loading && !current && plans.length === 0) {
    return (
      <>
        <CandidateNavbar />
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Loading your subscription plans...</p>
        </div>
        <CandidateFooter />
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .sub-anim   { animation: fadeUp 0.55s ease both; }
        .sub-anim-1 { animation-delay: 0.08s; }
        .sub-anim-2 { animation-delay: 0.18s; }
        .sub-anim-3 { animation-delay: 0.28s; }
        .sub-anim-4 { animation-delay: 0.38s; }
      `}</style>

      <CandidateNavbar />

      {/* ── Hero ── */}
      <section className="bg-white border-b border-gray-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 mb-6 sub-anim">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
            </span>
            <span className="text-sm font-semibold text-teal-700">Subscription Plans</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 sub-anim sub-anim-1 leading-tight">
            Interview Smarter. <span className="bg-yellow-400 px-2">Prepare Better.</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-xl mx-auto sub-anim sub-anim-2 leading-relaxed">
            Choose a plan that matches your prep intensity — from casual practice to
            full-on interview readiness.
          </p>
        </div>
      </section>

      {/* ── Perks strip ── */}
      <section className="bg-gray-50 border-b border-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 sub-anim sub-anim-3">
          {PERKS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-gray-600">
              <Icon className="w-4 h-4 text-teal-500 flex-shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Main content ── */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">

          {/* Current Subscription */}
          <div className="sub-anim sub-anim-3 mb-14">
            <CurrentSubscriptionCard current={current} />
          </div>

          {/* Section heading */}
          <div className="mb-8 sub-anim sub-anim-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Available Plans</h2>
            <p className="text-gray-500 text-sm">Click any plan to review and subscribe.</p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sub-anim sub-anim-4">
            {plans.map((plan) => (
              <SubscriptionPlansGrid
                key={plan.id}
                plan={plan}
                currentPlan={current?.plan_name}
                onSubscribe={openPlanModal}
                disabled={!plan.is_active}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-10 p-5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-4">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 5a7 7 0 110 14A7 7 0 0112 5z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-red-800 font-medium text-sm">{error}</p>
              </div>
              <button
                onClick={() => dispatch(clearError())}
                className="text-sm font-semibold text-red-600 hover:text-red-700 underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-white border-t border-gray-100 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-10 text-center shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-3">Need more flexibility?</h2>
            <p className="text-teal-50 text-sm mb-6 leading-relaxed">
              Buy token bundles to top up your wallet anytime, without a subscription.
            </p>
            <a
              href="/tokens"
              className="inline-block bg-white text-teal-600 font-semibold px-8 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
            >
              Buy Tokens →
            </a>
          </div>
        </div>
      </section>

      <SubscriptionModal
        plan={selectedPlan}
        isOpen={isModalOpen}
        onClose={closeModal}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CandidateFooter />
    </>
  );
};

export default SubscriptionsPage;