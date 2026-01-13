import React from 'react';
import { ArrowRight, Crown, CheckCircle, Zap } from 'lucide-react';

export default function SubscriptionPlansGrid({ plans, currentPlanId, loading }) {
  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-3xl p-8 h-80"></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Available Plans</h2>
        <div className="text-sm text-gray-500">
          {plans.length} plans available
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <SubscriptionPlanCard 
            key={plan.id}
            plan={plan}
            isCurrent={plan.id === currentPlanId}
          />
        ))}
      </div>
    </div>
  );
}

function SubscriptionPlanCard({ plan, isCurrent }) {
  const features = [
    `AI Interviews: ${plan.ai_interviews_per_month === -1 ? 'Unlimited' : plan.ai_interviews_per_month}/month`,
    plan.monthly_free_tokens > 0 && `${plan.monthly_free_tokens} Free Tokens`,
    plan.has_priority_booking && 'Priority Booking',
    plan.has_advanced_ai_feedback && 'Advanced AI Feedback',
  ].filter(Boolean);

  return (
    <div className={`group relative bg-white rounded-3xl shadow-xl border-2 p-8 h-full transition-all hover:shadow-2xl hover:-translate-y-2 ${
      isCurrent 
        ? 'border-emerald-500 ring-4 ring-emerald-100/50 bg-emerald-50' 
        : 'border-gray-200 hover:border-emerald-200'
    }`}>
      {/* Current Plan Badge */}
      {isCurrent && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-6 py-2 rounded-2xl text-sm font-semibold shadow-lg">
          Current Plan
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-2 rounded-2xl font-semibold mb-4">
          <Crown className="w-5 h-5" />
          {plan.name}
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">₹{plan.price_inr}</div>
        <div className="text-2xl font-light text-gray-600 mb-8">per month</div>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
        isCurrent
          ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-200 hover:bg-emerald-200'
          : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
      }`}>
        {isCurrent ? 'Manage Plan' : 'Get Started'}
        {!isCurrent && <ArrowRight className="group-hover:translate-x-1 transition-transform" />}
      </button>
    </div>
  );
}
