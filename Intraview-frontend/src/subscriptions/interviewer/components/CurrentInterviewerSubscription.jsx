// import React from 'react';

// const CurrentInterviewerSubscription = ({ currentSubscription }) => {
//   if (!currentSubscription?.has_subscription) {
//     return (
//       <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-xl border border-gray-200 text-center max-w-2xl mx-auto">
//         <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
//           <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2-2h0a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
//           </svg>
//         </div>
//         <h2 className="text-3xl font-bold text-gray-900 mb-4">No Active Subscription</h2>
//         <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
//           Activate an interviewer subscription to go live, accept bookings, and start earning.
//         </p>
//         <div className="text-sm text-gray-500 space-y-1">
//           <p>• Limited to 0 bookings per month</p>
//           <p>• Cannot accept new interview requests</p>
//           <p>• Profile not visible to candidates</p>
//         </div>
//       </div>
//     );
//   }

//   const plan = currentSubscription.plan;
//   const daysRemaining = currentSubscription.days_remaining;

//   return (
//     <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-3xl p-10 shadow-2xl max-w-2xl mx-auto">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h2 className="text-3xl font-bold mb-2">Current Plan</h2>
//           <p className="text-emerald-100 opacity-90">{plan.name}</p>
//         </div>
//         <div className="text-right">
//           <div className="text-2xl font-bold">₹{plan.price_inr}</div>
//           <div className="text-sm opacity-90">/month</div>
//         </div>
//       </div>

//       <div className="grid md:grid-cols-2 gap-6 mb-8">
//         <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-6">
//           <div className="text-3xl font-bold text-white mb-2">{daysRemaining}</div>
//           <div className="text-sm uppercase tracking-wide opacity-90">Days Remaining</div>
//         </div>
//         <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-6">
//           <div className="text-3xl font-bold text-white mb-2">✅ Active</div>
//           <div className="text-sm uppercase tracking-wide opacity-90">Status</div>
//         </div>
//       </div>

//       <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
//         <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//           Active Benefits
//         </h3>
//         <div className="space-y-2 text-sm">
//           <p>• Profile visible to all candidates</p>
//           <p>• Unlimited booking requests</p>
//           <p>• Priority support</p>
//           <p>• Analytics dashboard</p>
//         </div>
//       </div>

//       {daysRemaining <= 7 && (
//         <div className="mt-6 p-4 bg-yellow-400/20 border border-yellow-400/50 rounded-xl">
//           <p className="text-yellow-100 text-sm font-semibold">
//             ⚠️ Renews in {daysRemaining} days
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CurrentInterviewerSubscription;



















import React from 'react';
import { toast } from 'sonner';

const CurrentInterviewerSubscription = ({ currentSubscription }) => {
  // 🔥 EXACT Backend Logic Match
  const isTrulyActive = currentSubscription?.has_subscription === true &&
                       currentSubscription?.status === 'ACTIVE' &&
                       currentSubscription?.is_expired === false &&
                       currentSubscription?.days_remaining > 0;

  const isExpiredOrCancelled = currentSubscription?.has_subscription === true &&
                              (currentSubscription?.status === 'EXPIRED' ||
                               currentSubscription?.status === 'CANCELLED' ||
                               currentSubscription?.is_expired === true);

  if (!currentSubscription?.has_subscription) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-xl border border-gray-200 text-center max-w-2xl mx-auto">
        <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2-2h0a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">No Active Subscription</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Activate an interviewer subscription to go live, accept bookings, and start earning.
        </p>
        <div className="text-sm text-gray-500 space-y-1">
          <p>• Limited to 0 bookings per month</p>
          <p>• Cannot accept new interview requests</p>
          <p>• Profile not visible to candidates</p>
        </div>
      </div>
    );
  }

  const plan = currentSubscription.plan;
  const daysRemaining = currentSubscription.days_remaining || 0;

  if (isExpiredOrCancelled) {
    toast.info(`Your ${plan.name} subscription is ${currentSubscription.status?.toLowerCase()}. Renew to go live again.`);
    return (
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-3xl p-12 shadow-2xl max-w-2xl mx-auto border-4 border-orange-200/30">
        <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-8">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold mb-4 text-center">Subscription {currentSubscription.status}</h2>
        <div className="text-center mb-8">
          <div className="text-5xl font-black mb-2">{plan.name}</div>
          <div className="text-2xl opacity-90">₹{plan.price_inr}/month</div>
        </div>
        <div className="text-lg text-orange-100 mb-8 max-w-md mx-auto text-center">
          Renew your plan to restore full access to candidates and bookings.
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div>
            <div className="text-orange-200 font-semibold">Status</div>
            <div className="font-bold text-xl">{currentSubscription.status}</div>
          </div>
          <div>
            <div className="text-orange-200 font-semibold">Days Expired</div>
            <div className="font-bold text-xl">-{daysRemaining}</div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ ACTIVE SUBSCRIPTION
  return (
    <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-3xl p-10 shadow-2xl max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Current Plan</h2>
          <p className="text-emerald-100 opacity-90">{plan.name}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">₹{plan.price_inr}</div>
          <div className="text-sm opacity-90">/month</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-6">
          <div className="text-3xl font-bold text-white mb-2">{daysRemaining}</div>
          <div className="text-sm uppercase tracking-wide opacity-90">Days Remaining</div>
        </div>
        <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-6">
          <div className="text-3xl font-bold text-white mb-2">✅ Active</div>
          <div className="text-sm uppercase tracking-wide opacity-90">Status</div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Active Benefits
        </h3>
        <div className="space-y-2 text-sm">
          <p>• Profile visible to all candidates</p>
          <p>• Unlimited booking requests</p>
          <p>• Priority support</p>
          <p>• Analytics dashboard</p>
        </div>
      </div>

      {daysRemaining <= 7 && (
        <div className="mt-6 p-4 bg-yellow-400/20 border border-yellow-400/50 rounded-xl">
          <p className="text-yellow-100 text-sm font-semibold">
            ⚠️ Renews in {daysRemaining} days
          </p>
        </div>
      )}
    </div>
  );
};

export default CurrentInterviewerSubscription;
