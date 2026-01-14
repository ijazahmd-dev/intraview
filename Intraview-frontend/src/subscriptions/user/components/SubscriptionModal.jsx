import React from 'react';
import { toast } from 'sonner';
import { subscriptionsApi } from '../../subscriptionsApi';

const SubscriptionModal = ({ plan, isOpen, onClose, onProceedToCheckout }) => {
  if (!isOpen || !plan) return null;

  const features = [
    `${plan.monthly_free_tokens} free tokens/month`,
    plan.ai_interviews_per_month === -1 ? 'Unlimited AI interviews' : 
    plan.ai_interviews_per_month > 0 ? `${plan.ai_interviews_per_month} AI interviews/month` : 
    'No AI interviews',
    plan.has_priority_booking && 'Priority booking',
    plan.has_advanced_ai_feedback && 'Advanced AI feedback',
  ].filter(Boolean);

  const handleProceed = async () => {
    const toastId = toast.loading('Creating checkout session...');
    
    try {
      const response = await subscriptionsApi.createCheckout(plan.id);
      toast.success('Redirecting to Stripe...', { id: toastId });
      
      // Backend returns Stripe URL → redirect
      window.location.href = response.data.checkout_url;
    } catch (error) {
      toast.error(
        error.response?.data?.detail || 'Checkout creation failed', 
        { id: toastId }
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50">
        {/* Header */}
        <div className="p-8 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">
              {plan.name} Plan
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-emerald-600 font-semibold">₹{plan.price_inr}/month</span>
          </div>
        </div>

        {/* Features */}
        <div className="p-8 space-y-6">
          {plan.description && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
              <p className="text-gray-800 leading-relaxed">{plan.description}</p>
            </div>
          )}

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">What's included:</h3>
            <ul className="space-y-4">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Summary */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border-2 border-emerald-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="text-3xl font-bold text-emerald-800">₹{plan.price_inr}</div>
                <div className="text-sm text-emerald-700">billed monthly</div>
              </div>
              <div className="flex gap-3 pt-1">
                <span className="px-4 py-1 bg-white text-emerald-800 text-sm font-medium rounded-lg border border-emerald-200">
                  Cancel anytime
                </span>
                <span className="px-4 py-1 bg-white text-gray-700 text-sm font-medium rounded-lg border">
                  Secure checkout
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-8 pt-0 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 px-6 border border-gray-300 rounded-2xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200"
            >
              Maybe later
            </button>
            <button
              onClick={handleProceed}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
