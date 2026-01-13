import React from 'react';
import { Crown, Calendar, CheckCircle2, XCircle } from 'lucide-react';

export default function CurrentSubscriptionCard({ subscription, plans, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 text-center">
        <div className="animate-pulse bg-gray-200 h-12 w-32 mx-auto rounded-xl mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!subscription?.has_subscription) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl shadow-xl border border-gray-200 p-8 text-center">
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Crown className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Plan</h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          You're on the free plan. Upgrade to unlock premium features like unlimited AI interviews and priority booking.
        </p>
        <div className="bg-white rounded-2xl p-4 inline-block">
          <span className="text-sm text-gray-500">Limited to 5 AI interviews/month</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-50 via-white to-blue-50 rounded-3xl shadow-xl border border-emerald-200 p-8">
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
        {/* Status Badge */}
        <div className={`px-4 py-2 rounded-2xl font-semibold flex items-center gap-2 ${
          subscription.is_expired 
            ? 'bg-red-100 text-red-800 border border-red-200' 
            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
        }`}>
          {subscription.is_expired ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
          {subscription.is_expired ? 'Expired' : 'Active'}
          {subscription.days_remaining > 0 && !subscription.is_expired && (
            <span>{subscription.days_remaining} days left</span>
          )}
        </div>

        {/* Plan Card */}
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-2xl shadow-md mb-4">
            <Crown className="w-6 h-6 text-yellow-500" />
            <span className="text-2xl font-bold text-gray-900">{subscription.plan_name}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="flex flex-col items-center p-3 bg-white/50 rounded-xl backdrop-blur-sm">
              <span className="font-semibold text-emerald-600">₹{subscription.price_inr}</span>
              <span className="text-gray-600">/month</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-white/50 rounded-xl backdrop-blur-sm">
              <span className="font-semibold">{subscription.monthly_free_tokens}</span>
              <span className="text-gray-600">Free tokens</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-white/50 rounded-xl backdrop-blur-sm">
              <span className="font-semibold">{subscription.ai_interviews_per_month === -1 ? 'Unlimited' : subscription.ai_interviews_per_month}</span>
              <span className="text-gray-600">AI Interviews</span>
            </div>
          </div>
        </div>

        {/* Renew CTA */}
        {!subscription.is_expired && (
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="bg-white border-2 border-emerald-200 hover:border-emerald-300 text-emerald-700 px-8 py-3 rounded-2xl font-semibold hover:shadow-md transition-all">
              Manage Plan
            </button>
            <button className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
              Renew Early
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
