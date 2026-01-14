import React from 'react';
import { toast } from 'sonner';

const CurrentSubscription = ({ current }) => {
  if (!current?.has_subscription) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border-2 border-dashed border-gray-300 p-12 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Free Plan</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          You're currently on the Free plan. Upgrade to unlock premium features, priority booking, and monthly free tokens.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl mx-auto mb-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium uppercase tracking-wide">
              {current.status} Plan
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">{current.plan_name}</h2>
          <p className="text-xl opacity-90">₹{current.price_inr}/month</p>
        </div>
        
        <div className="text-right">
          <div className={`text-sm px-3 py-1 rounded-full font-medium ${
            current.is_expired 
              ? 'bg-red-500/20 text-red-200 border border-red-500/30' 
              : 'bg-white/20 backdrop-blur-sm'
          } inline-block mb-2`}>
            {current.is_expired ? 'Expired' : `${current.days_remaining} days left`}
          </div>
          <div className="space-y-1 text-sm opacity-90">
            <div>Start: {new Date(current.start_date).toLocaleDateString()}</div>
            {current.end_date && (
              <div>Ends: {new Date(current.end_date).toLocaleDateString()}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentSubscription;
