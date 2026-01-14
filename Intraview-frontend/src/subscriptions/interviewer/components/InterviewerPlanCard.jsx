// import React from 'react';
// import { toast } from 'sonner';

// const InterviewerPlanCard = ({ plan, currentPlanName, onSelect, disabled }) => {
//   const isCurrent = currentPlanName === plan.name;
//   const price = `₹${plan.price_inr}`;
//   const isMostPopular = plan.price_inr >= 499; // Highlight higher tiers

//   const features = [
//     '✅ Public profile',
//     '✅ Accept unlimited bookings',
//     '✅ Priority candidate matching',
//     '✅ Analytics dashboard',
//     plan.price_inr >= 999 && '✅ Priority support',
//     plan.price_inr >= 1999 && '✅ Featured profile',
//   ].filter(Boolean);

//   const handleSelect = () => {
//   if (disabled) {
//     toast.info('This plan is not available');
//     return;
//   }
  
//   // 🔥 FIX: Don't block if current sub is expired/cancelled
//   const hasActiveSub = currentPlanName && !currentSubscription?.is_expired;
  
//   if (hasActiveSub) {
//     toast.info('You already have an active subscription. Upgrade via dashboard.');
//     return;
//   }
  
//   onSelect(plan);
// };

//   return (
//     <div 
//       className={`
//         relative bg-white/70 backdrop-blur-xl border-4 rounded-3xl p-8 md:p-10 h-full
//         transition-all duration-300 hover:shadow-2xl hover:-translate-y-2
//         ${isCurrent 
//           ? 'border-emerald-500 ring-4 ring-emerald-100/50 shadow-2xl' 
//           : disabled 
//             ? 'border-gray-200 bg-gray-50/50 cursor-not-allowed opacity-60' 
//             : isMostPopular 
//               ? 'border-emerald-400 ring-2 ring-emerald-100/50 shadow-xl' 
//               : 'border-transparent hover:border-blue-200'
//         }
//       `}
//       onClick={handleSelect}
//     >
//       {isMostPopular && !isCurrent && !disabled && (
//         <div className="absolute top-6 right-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
//           Most Popular
//         </div>
//       )}

//       {isCurrent && (
//         <div className="absolute top-6 left-6 bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
//           Current Plan
//         </div>
//       )}

//       <div className="flex items-start justify-between mb-8 relative z-10">
//         <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
//           {plan.name}
//         </h3>
//         <div className="text-right">
//           <div className="text-4xl md:text-5xl font-bold text-gray-900">
//             {price}
//           </div>
//           <div className="text-lg font-semibold text-emerald-600 mt-2">
//             per month
//           </div>
//         </div>
//       </div>

//       <ul className="space-y-3 mb-10 flex-grow">
//         {features.map((feature, idx) => (
//           <li key={idx} className="flex items-center gap-3 text-gray-700">
//             <div className="w-3 h-3 bg-emerald-500 rounded-full flex-shrink-0"></div>
//             <span className="font-medium">{feature}</span>
//           </li>
//         ))}
//       </ul>

//       <button
//         disabled={disabled || isCurrent}
//         className={`
//           w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300
//           flex items-center justify-center gap-3 shadow-lg
//           ${isCurrent
//             ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300 cursor-default'
//             : disabled
//               ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-2 border-gray-300'
//               : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white hover:shadow-2xl hover:-translate-y-1'
//           }
//         `}
//       >
//         {isCurrent ? (
//           <>
//             Current Plan
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//             </svg>
//           </>
//         ) : disabled ? (
//           'Unavailable'
//         ) : (
//           'Get Started'
//         )}
//       </button>
//     </div>
//   );
// };

// export default InterviewerPlanCard;


















import React from 'react';
import { toast } from 'sonner';

const InterviewerPlanCard = ({ 
  plan, 
  currentSubscription,  // 🔥 FULL OBJECT, not just name
  onSelect, 
  disabled 
}) => {
  // 🔥 EXACT Backend Logic Match
  const isTrulyActive = currentSubscription?.has_subscription === true &&
                       currentSubscription?.status === 'ACTIVE' &&
                       currentSubscription?.is_expired === false &&
                       currentSubscription?.days_remaining > 0;

  const isCurrentPlan = currentSubscription?.plan?.id === plan.id && isTrulyActive;
  const price = `₹${plan.price_inr}`;
  const isMostPopular = plan.price_inr >= 499;

  const features = [
    '✅ Public profile',
    '✅ Accept unlimited bookings',
    '✅ Priority candidate matching',
    '✅ Analytics dashboard',
    plan.price_inr >= 999 && '✅ Priority support',
    plan.price_inr >= 1999 && '✅ Featured profile',
  ].filter(Boolean);

  const handleSelect = () => {
    if (disabled) {
      toast.error('This plan is not available');
      return;
    }
    
    if (isTrulyActive) {
      toast.info('✅ You already have an active subscription!', {
        description: `Your ${currentSubscription.plan.name} plan is active for ${currentSubscription.days_remaining} more days.`
      });
      return;
    }
    
    if (currentSubscription?.has_subscription && !isTrulyActive) {
      toast.success('💡 Perfect! Renew your expired subscription.', {
        description: `Get back to ${plan.name} for just ₹${plan.price_inr}/month`
      });
    } else {
      toast.success('Great choice!', {
        description: `Starting your ${plan.name} plan...`
      });
    }
    
    onSelect(plan);
  };

  return (
    <div 
      className={`
        relative bg-white/70 backdrop-blur-xl border-4 rounded-3xl p-8 md:p-10 h-full
        transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer
        ${isCurrentPlan 
          ? 'border-emerald-500 ring-4 ring-emerald-100/50 shadow-2xl' 
          : disabled 
            ? 'border-gray-200 bg-gray-50/50 cursor-not-allowed opacity-60' 
            : isMostPopular 
              ? 'border-emerald-400 ring-2 ring-emerald-100/50 shadow-xl' 
              : 'border-transparent hover:border-blue-200'
        }
      `}
      onClick={handleSelect}
    >
      {isMostPopular && !isCurrentPlan && !disabled && (
        <div className="absolute top-6 right-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
          Most Popular
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute top-6 left-6 bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
          Current Plan
          <svg className="w-3 h-3 inline ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {!isTrulyActive && currentSubscription?.plan?.id === plan.id && (
        <div className="absolute top-6 left-6 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
          Expired
        </div>
      )}

      <div className="flex items-start justify-between mb-8 relative z-10">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {plan.name}
        </h3>
        <div className="text-right">
          <div className="text-4xl md:text-5xl font-bold text-gray-900">
            {price}
          </div>
          <div className="text-lg font-semibold text-emerald-600 mt-2">
            per month
          </div>
        </div>
      </div>

      <ul className="space-y-3 mb-10 flex-grow">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-3 text-gray-700">
            <div className="w-3 h-3 bg-emerald-500 rounded-full flex-shrink-0"></div>
            <span className="font-medium">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        disabled={disabled || isCurrentPlan}
        className={`
          w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300
          flex items-center justify-center gap-3 shadow-lg
          ${isCurrentPlan
            ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300 cursor-default'
            : disabled
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-2 border-gray-300'
              : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white hover:shadow-2xl hover:-translate-y-1'
          }
        `}
      >
        {isCurrentPlan ? (
          <>
            Current Plan
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </>
        ) : disabled ? (
          'Unavailable'
        ) : currentSubscription?.plan?.id === plan.id ? (
          <>
            Renew Plan
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </>
        ) : (
          'Get Started'
        )}
      </button>
    </div>
  );
};

export default InterviewerPlanCard;

