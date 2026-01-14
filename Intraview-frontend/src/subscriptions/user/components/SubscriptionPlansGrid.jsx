import React from 'react';
import { toast } from 'sonner';

const SubscriptionCard = ({ plan, currentPlan, onSubscribe, disabled }) => {
  const isCurrent = plan.name === currentPlan;
  const price = plan.price_inr === 0 ? 'Free' : `₹${plan.price_inr}`;

  const features = [
    plan.monthly_free_tokens > 0 && `${plan.monthly_free_tokens} free tokens/month`,
    plan.ai_interviews_per_month > 0 && `${plan.ai_interviews_per_month === -1 ? 'Unlimited' : plan.ai_interviews_per_month} AI interviews`,
    plan.has_priority_booking && 'Priority booking',
    plan.has_advanced_ai_feedback && 'Advanced AI feedback',
  ].filter(Boolean);

  const handleClick = () => {
    if (disabled) {
      toast.info('This plan is not available');
      return;
    }
    
    if (isCurrent) {
      toast.info('You are already on this plan');
      return;
    }
    console.log("🟢 SENDING PLAN:", plan); 
    onSubscribe(plan);
  };

  return (
    <div
      className={`
        group bg-white/70 backdrop-blur-xl border-2 rounded-3xl p-8 md:p-10 h-full
        transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-300
        ${isCurrent 
          ? 'border-4 border-emerald-500 ring-4 ring-emerald-100/50 shadow-2xl' 
          : disabled 
            ? 'border-gray-200 bg-gray-50/50 cursor-not-allowed opacity-60' 
            : 'border-transparent hover:border-blue-200'
        }
      `}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-6">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {plan.name}
        </h3>
        <div className="text-right">
          <div className="text-3xl md:text-4xl font-bold text-gray-900">
            {price}
          </div>
          <div className="text-sm text-gray-500 uppercase tracking-wide">
            per month
          </div>
        </div>
      </div>

      {plan.description && (
        <p className="text-gray-600 mb-8 leading-relaxed">{plan.description}</p>
      )}

      <ul className="space-y-3 mb-10">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-3 text-gray-700">
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
            {feature}
          </li>
        ))}
      </ul>

      <button
        disabled={disabled || isCurrent}
        className={`
          w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-200
          flex items-center justify-center gap-2
          ${isCurrent
            ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300 cursor-default'
            : disabled
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
          }
        `}
      >
        {isCurrent ? (
          <>
            Current Plan
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </>
        ) : disabled ? (
          'Unavailable'
        ) : (
          'Get Started'
        )}
      </button>
    </div>
  );
};

export default SubscriptionCard;
