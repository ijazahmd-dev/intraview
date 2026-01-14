// import React from 'react';
// import { toast } from 'sonner';
// import { interviewerSubscriptionsApi } from '../../interviewerSubscriptionsApi';

// const InterviewerSubscriptionModal = ({ plan, currentSubscription, isOpen, onClose }) => {
//   if (!isOpen || !plan) return null;

//   const daysInCycle = plan.billing_cycle_days;
//   const isCurrent = currentSubscription?.plan?.name === plan.name;

//   const handleSubscribe = async () => {
//     const toastId = toast.loading('Creating secure checkout session...');
    
//     try {
//       const response = await interviewerSubscriptionsApi.createCheckout(plan.id);
//       toast.success('Redirecting to Stripe...', { id: toastId });
//       window.location.href = response.data.checkout_url;
//     } catch (error) {
//       console.error('Subscription error:', error);
//       toast.error(
//         error.response?.data?.detail || 'Subscription setup failed',
//         { id: toastId }
//       );
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <div className="bg-white/90 backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50">
//         {/* Header */}
//         <div className="p-8 pb-4 border-b border-gray-100">
//           <div className="flex items-center justify-between">
//             <h2 className="text-3xl font-bold text-gray-900">
//               {plan.name} Plan
//             </h2>
//             <button
//               onClick={onClose}
//               className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//           <div className="flex items-center gap-2 mt-4">
//             <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
//             <span className="text-2xl font-bold text-emerald-600">₹{plan.price_inr}</span>
//             <span className="text-sm text-gray-500">/month</span>
//           </div>
//         </div>

//         {/* Benefits */}
//         <div className="p-8 space-y-8">
//           {/* Price Summary */}
//           <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-8 rounded-3xl border-2 border-emerald-100">
//             <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
//               <div className="text-center lg:text-left">
//                 <div className="text-4xl lg:text-5xl font-bold text-emerald-800 mb-2">₹{plan.price_inr}</div>
//                 <div className="text-lg text-emerald-700">billed every {daysInCycle} days</div>
//               </div>
//               <div className="flex flex-col sm:flex-row gap-3 pt-2">
//                 <span className="px-6 py-3 bg-white text-emerald-800 text-sm font-bold rounded-2xl border-2 border-emerald-200 shadow-sm">
//                   Cancel anytime
//                 </span>
//                 <span className="px-6 py-3 bg-white text-gray-700 text-sm font-bold rounded-2xl border shadow-sm">
//                   Secure Stripe checkout
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Features */}
//           <div>
//             <h3 className="text-2xl font-bold text-gray-900 mb-8">Unlock These Benefits:</h3>
//             <div className="grid md:grid-cols-2 gap-6">
//               <div className="flex items-start gap-4 p-6 bg-blue-50 rounded-2xl border border-blue-100">
//                 <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
//                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h4 className="font-bold text-xl text-gray-900 mb-2">Public Profile</h4>
//                   <p className="text-gray-700 leading-relaxed">Your profile becomes visible to all candidates searching for interviewers.</p>
//                 </div>
//               </div>

//               <div className="flex items-start gap-4 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
//                 <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
//                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h4 className="font-bold text-xl text-gray-900 mb-2">Unlimited Bookings</h4>
//                   <p className="text-gray-700 leading-relaxed">Accept as many interview requests as you want - no limits.</p>
//                 </div>
//               </div>

//               <div className="flex items-start gap-4 p-6 bg-purple-50 rounded-2xl border border-purple-100">
//                 <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
//                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h4 className="font-bold text-xl text-gray-900 mb-2">Priority Matching</h4>
//                   <p className="text-gray-700 leading-relaxed">Get matched with candidates faster through our priority system.</p>
//                 </div>
//               </div>

//               <div className="flex items-start gap-4 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
//                 <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
//                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h4 className="font-bold text-xl text-gray-900 mb-2">Analytics Dashboard</h4>
//                   <p className="text-gray-700 leading-relaxed">Track your performance, earnings, and candidate feedback.</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="p-8 pt-0 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl">
//           <div className="flex flex-col sm:flex-row gap-4">
//             <button
//               onClick={onClose}
//               className="flex-1 py-4 px-6 border border-gray-300 rounded-2xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200"
//               disabled={isCurrent}
//             >
//               Maybe Later
//             </button>
//             <button
//               onClick={handleSubscribe}
//               disabled={isCurrent}
//               className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//             >
//               <span>{isCurrent ? 'Already Active' : `Subscribe for ₹${plan.price_inr}`}</span>
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
//               </svg>
//             </button>
//           </div>
//           <p className="text-xs text-gray-500 text-center mt-4">
//             Secured by Stripe • Cancel anytime • Instant activation
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InterviewerSubscriptionModal;















import React from 'react';
import { toast } from 'sonner';
import { interviewerSubscriptionsApi } from '../../interviewerSubscriptionsApi';

const InterviewerSubscriptionModal = ({ plan, currentSubscription, isOpen, onClose }) => {
  if (!isOpen || !plan) return null;

  // 🔥 EXACT Backend Logic Match - SAME as other components
  const isTrulyActive = currentSubscription?.has_subscription === true &&
                       currentSubscription?.status === 'ACTIVE' &&
                       currentSubscription?.is_expired === false &&
                       currentSubscription?.days_remaining > 0;

  const isExpiredOrCancelled = currentSubscription?.has_subscription === true &&
                              (currentSubscription?.status === 'EXPIRED' ||
                               currentSubscription?.status === 'CANCELLED' ||
                               currentSubscription?.is_expired === true);

  const isSamePlan = currentSubscription?.plan?.id === plan.id;
  const daysInCycle = plan.billing_cycle_days || 30;
  const buttonText = isTrulyActive ? 'Already Active' : 
                    isExpiredOrCancelled && isSamePlan ? 'Renew Plan' :
                    `Subscribe for ₹${plan.price_inr}`;

  const handleSubscribe = async () => {
    const toastId = toast.loading(
      isTrulyActive ? 'Checking subscription...' :
      isExpiredOrCancelled && isSamePlan ? 'Renewing your plan...' :
      'Creating secure checkout session...'
    );
    
    try {
      // 🔥 Backend blocks duplicate ACTIVE subs, but we check frontend first
      if (isTrulyActive && isSamePlan) {
        toast.info('✅ Your subscription is already active!', { id: toastId });
        onClose();
        return;
      }

      const response = await interviewerSubscriptionsApi.createCheckout(plan.id);
      
      if (isExpiredOrCancelled && isSamePlan) {
        toast.success('🔄 Renewing your subscription...', { id: toastId });
      } else {
        toast.success('Redirecting to Stripe checkout...', { id: toastId });
      }
      
      window.location.href = response.data.checkout_url;
    } catch (error) {
      console.error('Subscription error:', error);
      
      // Handle specific backend errors
      if (error.response?.status === 400) {
        toast.error(
          error.response?.data?.detail || 'You already have an active subscription. Upgrade via dashboard.',
          { id: toastId }
        );
      } else if (error.response?.status === 403) {
        toast.error('Please complete your interviewer profile first.', { id: toastId });
      } else {
        toast.error(
          error.response?.data?.detail || 'Subscription setup failed. Please try again.',
          { id: toastId }
        );
      }
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
              {isExpiredOrCancelled && isSamePlan && (
                <span className="ml-3 px-3 py-1 bg-orange-500 text-white text-sm font-bold rounded-full">
                  Renew
                </span>
              )}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              disabled={isTrulyActive}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className={`w-4 h-4 rounded-full animate-pulse ${
              isTrulyActive ? 'bg-emerald-500' :
              isExpiredOrCancelled ? 'bg-orange-500' : 'bg-emerald-500'
            }`}></div>
            <span className={`text-2xl font-bold ${
              isTrulyActive ? 'text-emerald-600' :
              isExpiredOrCancelled ? 'text-orange-600' : 'text-emerald-600'
            }`}>
              ₹{plan.price_inr}
            </span>
            <span className="text-sm text-gray-500">/month</span>
          </div>
        </div>

        {/* Subscription Status Banner */}
        {currentSubscription?.has_subscription && (
          <div className={`p-4 rounded-2xl mx-8 mt-4 border ${
            isTrulyActive ? 'bg-emerald-50 border-emerald-200' :
            isExpiredOrCancelled ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 text-sm">
              <div className={`w-3 h-3 rounded-full ${
                isTrulyActive ? 'bg-emerald-500' :
                isExpiredOrCancelled ? 'bg-orange-500' : 'bg-gray-500'
              }`}></div>
              <span className="font-medium text-gray-800">
                {isTrulyActive ? `✅ Active: ${currentSubscription.plan?.name} (${currentSubscription.days_remaining} days left)` :
                 isExpiredOrCancelled ? `⚠️ ${currentSubscription.status}: ${currentSubscription.plan?.name}` :
                 'No active subscription'}
              </span>
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="p-8 space-y-8">
          {/* Price Summary */}
          <div className={`p-8 rounded-3xl border-2 ${
            isTrulyActive ? 'bg-emerald-50 border-emerald-100' :
            isExpiredOrCancelled ? 'bg-orange-50 border-orange-100 from-orange-50 to-red-50' :
            'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-100'
          }`}>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="text-center lg:text-left">
                <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">₹{plan.price_inr}</div>
                <div className="text-lg text-gray-700">billed every {daysInCycle} days</div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <span className="px-6 py-3 bg-white text-emerald-800 text-sm font-bold rounded-2xl border-2 border-emerald-200 shadow-sm">
                  Cancel anytime
                </span>
                <span className="px-6 py-3 bg-white text-gray-700 text-sm font-bold rounded-2xl border shadow-sm">
                  Secure Stripe checkout
                </span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Unlock These Benefits:</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-xl text-gray-900 mb-2">Public Profile</h4>
                  <p className="text-gray-700 leading-relaxed">Your profile becomes visible to all candidates searching for interviewers.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-xl text-gray-900 mb-2">Unlimited Bookings</h4>
                  <p className="text-gray-700 leading-relaxed">Accept as many interview requests as you want - no limits.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-purple-50 rounded-2xl border border-purple-100">
                <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-xl text-gray-900 mb-2">Priority Matching</h4>
                  <p className="text-gray-700 leading-relaxed">Get matched with candidates faster through our priority system.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-xl text-gray-900 mb-2">Analytics Dashboard</h4>
                  <p className="text-gray-700 leading-relaxed">Track your performance, earnings, and candidate feedback.</p>
                </div>
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
              disabled={isTrulyActive}
            >
              Maybe Later
            </button>
            <button
              onClick={handleSubscribe}
              disabled={isTrulyActive}
              className={`
                flex-1 py-4 px-6 font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                ${isTrulyActive 
                  ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300' 
                  : isExpiredOrCancelled && isSamePlan
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-2 border-orange-300'
                    : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white'
                }
              `}
            >
              <span>{buttonText}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">
            Secured by Stripe • Cancel anytime • Instant activation
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterviewerSubscriptionModal;
