import React from 'react';
import { toast } from 'sonner';
import { CheckCircle, Check } from 'lucide-react';

const SubscriptionPlansGrid = ({ plan, currentPlan, onSubscribe, disabled }) => {
  const isCurrent = plan.name === currentPlan;
  const isPro = plan.name?.toLowerCase().includes('pro');
  const price = plan.price_inr === 0 ? 'Free' : `₹${plan.price_inr}`;

  const features = [
    plan.monthly_free_tokens > 0    && `${plan.monthly_free_tokens} free tokens/month`,
    plan.ai_interviews_per_month > 0 && (
      plan.ai_interviews_per_month === -1
        ? 'Unlimited AI interviews'
        : `${plan.ai_interviews_per_month} AI interviews/month`
    ),
    plan.has_priority_booking        && 'Priority booking',
    plan.has_advanced_ai_feedback    && 'Advanced AI feedback',
  ].filter(Boolean);

  const handleClick = () => {
    if (disabled) { toast.info('This plan is not available'); return; }
    if (isCurrent) { toast.info('You are already on this plan'); return; }
    onSubscribe(plan);
  };

  return (
    <div
      className={`
        relative bg-white border-2 rounded-2xl flex flex-col overflow-hidden
        transition-all duration-300 cursor-pointer
        ${isCurrent
          ? 'border-teal-500 ring-2 ring-teal-100 shadow-md'
          : disabled
            ? 'border-gray-200 opacity-60 cursor-not-allowed'
            : isPro
              ? 'border-gray-900 hover:shadow-lg'
              : 'border-gray-200 hover:border-teal-300 hover:shadow-md'}
      `}
      onClick={handleClick}
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full ${isPro ? 'bg-gray-900' : isCurrent ? 'bg-teal-500' : 'bg-gray-100'}`} />

      {/* Current badge */}
      {isCurrent && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1 bg-teal-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Current
          </span>
        </div>
      )}

      {/* Pro badge */}
      {isPro && !isCurrent && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1 bg-gray-900 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            Pro
          </span>
        </div>
      )}

      <div className="p-7 flex flex-col flex-1">
        {/* Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>

        {/* Price */}
        <div className="flex items-end gap-1 mb-2">
          <span className="text-4xl font-bold text-gray-900">{price}</span>
          {plan.price_inr > 0 && (
            <span className="text-gray-400 text-sm mb-1">/month</span>
          )}
        </div>

        {/* Description */}
        {plan.description && (
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">{plan.description}</p>
        )}

        {/* Features */}
        <ul className="space-y-2.5 mb-8 flex-1">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2.5 text-sm text-gray-700">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0
                ${isCurrent || isPro ? 'bg-teal-500' : 'bg-teal-100'}`}>
                <Check className={`w-2.5 h-2.5 ${isCurrent || isPro ? 'text-white' : 'text-teal-600'}`} />
              </div>
              {feature}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          disabled={disabled || isCurrent}
          className={`
            w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200
            ${isCurrent
              ? 'bg-teal-50 text-teal-700 border-2 border-teal-200 cursor-default'
              : disabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isPro
                  ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-sm hover:shadow-md'
                  : 'bg-teal-500 hover:bg-teal-600 text-white shadow-sm hover:shadow-md'
            }
          `}
        >
          {isCurrent ? '✓ Current Plan' : disabled ? 'Unavailable' : 'Get Started'}
        </button>
      </div>
    </div>
  );
};

export default SubscriptionPlansGrid;
