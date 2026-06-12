import React from 'react';
import { toast } from 'sonner';
import { X, Check, ArrowRight, Shield, Zap } from 'lucide-react';
import { subscriptionsApi } from '../../subscriptionsApi';

const SubscriptionModal = ({ plan, isOpen, onClose, onProceedToCheckout }) => {
  if (!isOpen || !plan) return null;

  const features = [
    plan.monthly_free_tokens > 0 && `${plan.monthly_free_tokens} free tokens/month`,
    plan.ai_interviews_per_month === -1
      ? 'Unlimited AI interviews'
      : plan.ai_interviews_per_month > 0
        ? `${plan.ai_interviews_per_month} AI interviews/month`
        : null,
    plan.has_priority_booking     && 'Priority booking',
    plan.has_advanced_ai_feedback && 'Advanced AI feedback',
  ].filter(Boolean);

  const handleProceed = async () => {
    const toastId = toast.loading('Creating checkout session...');
    try {
      const response = await subscriptionsApi.createCheckout(plan.id);
      toast.success('Redirecting to Stripe...', { id: toastId });
      window.location.href = response.data.checkout_url;
    } catch (error) {
      toast.error(
        error.response?.data?.detail || 'Checkout creation failed',
        { id: toastId }
      );
    }
  };

  return (
    <>
      <style>{`
        @keyframes backdropIn { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(28px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        .sm-backdrop { animation: backdropIn 0.2s ease both; }
        .sm-card     { animation: slideUp   0.3s ease both; }
      `}</style>

      {/* Backdrop */}
      <div
        className="sm-backdrop fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Card */}
        <div
          className="sm-card bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* ── Teal header ── */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-teal-100 text-xs font-bold uppercase tracking-widest mb-1">Subscription Plan</p>
                <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="mt-5 pt-5 border-t border-white/20">
              <p className="text-teal-100 text-xs font-semibold uppercase tracking-widest mb-1">Monthly Price</p>
              <p className="text-4xl font-bold text-white">
                {plan.price_inr === 0 ? 'Free' : `₹${plan.price_inr}`}
                {plan.price_inr > 0 && <span className="text-lg font-normal text-teal-100">/mo</span>}
              </p>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="p-6 space-y-5">
            {/* Description */}
            {plan.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{plan.description}</p>
            )}

            {/* Features */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">What's included</p>
              <ul className="space-y-2.5">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-teal-600" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Shield className="w-3.5 h-3.5 text-teal-500" />
                Secure Stripe checkout
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Zap className="w-3.5 h-3.5 text-teal-500" />
                Cancel anytime
              </div>
            </div>
          </div>

          {/* ── Footer actions ── */}
          <div className="px-6 pb-6 flex flex-col gap-3">
            <button
              onClick={handleProceed}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-sm"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubscriptionModal;
