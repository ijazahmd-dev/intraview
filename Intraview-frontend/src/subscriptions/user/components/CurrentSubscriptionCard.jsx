import React from 'react';
import { CheckCircle, Clock, Calendar } from 'lucide-react';

const CurrentSubscriptionCard = ({ current }) => {

  /* ── No active subscription ── */
  if (!current?.has_subscription) {
    return (
      <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center max-w-2xl mx-auto">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Free Plan</h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          You're on the Free plan. Upgrade to unlock premium features, priority booking, and monthly free tokens.
        </p>
      </div>
    );
  }

  /* ── Active subscription ── */
  return (
    <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl shadow-lg p-8 max-w-2xl mx-auto text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

        {/* Left: plan name + price */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-teal-100">
              {current.status} Plan
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-1">{current.plan_name}</h2>
          <p className="text-teal-100 text-lg font-medium">₹{current.price_inr}/month</p>
        </div>

        {/* Right: dates + badge */}
        <div className="flex flex-col gap-2 sm:items-end">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full
            ${current.is_expired
              ? 'bg-red-500/20 text-red-200 border border-red-400/30'
              : 'bg-white/20 text-white'}`}
          >
            <Clock className="w-3 h-3" />
            {current.is_expired ? 'Expired' : `${current.days_remaining} days left`}
          </span>

          <div className="flex items-center gap-1.5 text-xs text-teal-100">
            <Calendar className="w-3 h-3" />
            <span>
              {new Date(current.start_date).toLocaleDateString()}
              {current.end_date && ` → ${new Date(current.end_date).toLocaleDateString()}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentSubscriptionCard;
