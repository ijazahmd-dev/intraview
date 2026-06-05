// // src/pages/candidate/components/sections/TokenSummary.jsx
// import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   Zap,
//   Crown,
//   TrendingUp,
//   Lock,
//   ArrowRight,
//   AlertCircle,
//   RefreshCw,
// } from 'lucide-react';
// import { fetchWalletSummary } from '../../../../wallets/candidateWalletSlice';
// import { fetchCurrentSubscription, fetchSubscriptionPlans } from '../../../../subscriptions/subscriptionSlice';
// import { fetchAiInterviewQuota } from '../../../../features/aiInterview/slice/aiInterviewSessionSlice';

// const plans = [
//   {
//     id: 'free',
//     name: 'Free',
//     price: '₹0',
//     period: 'forever',
//     tokens: 100,
//     interviews: 2,
//     badge: null,
//     recommended: false,
//   },
//   {
//     id: 'starter',
//     name: 'Starter',
//     price: '₹299',
//     period: '/month',
//     tokens: 500,
//     interviews: 10,
//     badge: null,
//     recommended: false,
//   },
//   {
//     id: 'pro',
//     name: 'Professional',
//     price: '₹699',
//     period: '/month',
//     tokens: 1500,
//     interviews: 'Unlimited',
//     badge: 'MOST POPULAR',
//     recommended: true,
//   },
//   {
//     id: 'enterprise',
//     name: 'Enterprise',
//     price: 'Custom',
//     period: 'contact sales',
//     tokens: 'Unlimited',
//     interviews: 'Unlimited',
//     badge: null,
//     recommended: false,
//   },
// ];

// const TokenSummary = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const { summary: walletSummary, loading: walletLoading, error: walletError } = useSelector(
//     (state) => state.candidateWallet
//   );
//   const { current: currentSub, plans: apiPlans, loading: subLoading } = useSelector(
//     (state) => state.subscription
//   );
//   const { quota: aiQuota } = useSelector(
//     (state) => state.aiInterviewSession
//   );

//   const isLoading = walletLoading || subLoading || aiQuota.status === "loading";

//   useEffect(() => {
//     dispatch(fetchWalletSummary());
//     dispatch(fetchCurrentSubscription());
//     dispatch(fetchSubscriptionPlans());
//     dispatch(fetchAiInterviewQuota());
//   }, [dispatch]);

//   const handleRetry = () => {
//     dispatch(fetchWalletSummary());
//     dispatch(fetchCurrentSubscription());
//     dispatch(fetchAiInterviewQuota());
//   };

//   // Normalise wallet fields
//   const available = walletSummary?.available_balance ?? walletSummary?.balance ?? 0;
//   const locked = walletSummary?.locked_balance ?? 0;
//   const total = walletSummary?.total_balance ?? (available + locked);

//   // Normalise subscription fields
//   const planName = currentSub?.plan_name ?? currentSub?.plan?.name ?? currentSub?.name ?? 'Free';
//   const planType = (currentSub?.plan_type ?? currentSub?.plan?.slug ?? planName).toLowerCase();
//   const renewalDate = currentSub?.end_date ?? currentSub?.renewal_date ?? currentSub?.expires_at;

//   const remainingPercent = total > 0 ? Math.min(100, (available / total) * 100) : 0;

//   // Use API plans if available, else fallback to static
//   const displayPlans = (apiPlans && apiPlans.length > 0) ? apiPlans.map((p) => ({
//     id: p.slug ?? p.id,
//     name: p.name,
//     price: p.price_inr != null ? (p.price_inr === 0 ? 'Free' : `₹${p.price_inr}`) : 'Custom',
//     period: '/month',
//     description: p.description,
//     badge: p.is_recommended ? 'MOST POPULAR' : null,
//     recommended: p.is_recommended ?? false,
//   })) : plans;

//   if (walletError && !isLoading) {
//     return (
//       <div className="space-y-6">
//         <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center">
//           <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
//           <p className="text-sm font-semibold text-rose-700 mb-4">Failed to load token data</p>
//           <button
//             onClick={handleRetry}
//             className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-all"
//           >
//             <RefreshCw className="w-3 h-3" />
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Current Plan Card */}
//       <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
//         <div className="flex items-start justify-between mb-6">
//           <div>
//             <p className="text-xs uppercase tracking-wider font-semibold text-indigo-100 mb-1">
//               Your subscription
//             </p>
//             {isLoading ? (
//               <div className="h-8 w-32 bg-white/20 rounded animate-pulse" />
//             ) : (
//               <h3 className="text-2xl sm:text-3xl font-black">{planName}</h3>
//             )}
//             {renewalDate && !isLoading && (
//               <p className="text-sm text-indigo-100 mt-2">
//                 Renews on {new Date(renewalDate).toLocaleDateString()}
//               </p>
//             )}
//           </div>
//           <Crown className="w-12 h-12 text-indigo-300 opacity-50" />
//         </div>

//         {/* Token Usage */}
//         <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-sm">
//           <div className="flex items-center justify-between mb-3">
//             <span className="text-sm font-semibold">Token balance</span>
//             {isLoading ? (
//               <div className="h-6 w-20 bg-white/20 rounded animate-pulse" />
//             ) : (
//               <span className="text-xl font-black">
//                 {total}
//               </span>
//             )}
//           </div>

//           {/* Progress Bar */}
//           <div className="h-3 bg-white/20 rounded-full overflow-hidden mb-3">
//             {isLoading ? (
//               <div className="h-full w-1/2 bg-white/30 animate-pulse rounded-full" />
//             ) : (
//               <div
//                 className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all"
//                 style={{ width: `${remainingPercent}%` }}
//               />
//             )}
//           </div>

//           <div className="grid grid-cols-2 gap-2 text-xs">
//             <div>
//               <p className="text-indigo-100">Available</p>
//               {isLoading ? (
//                 <div className="h-4 w-8 bg-white/20 rounded animate-pulse mt-0.5" />
//               ) : (
//                 <p className="font-bold">{available}</p>
//               )}
//             </div>
//             <div className="flex items-center gap-1">
//               <Lock className="w-3 h-3 text-amber-300" />
//               <div>
//                 <p className="text-indigo-100">Locked</p>
//                 {isLoading ? (
//                   <div className="h-4 w-8 bg-white/20 rounded animate-pulse mt-0.5" />
//                 ) : (
//                   <p className="font-bold">{locked}</p>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* AI Quota Summary */}
//           {aiQuota.status === "ready" && aiQuota.data && (aiQuota.data.free_ai_interviews_remaining > 0 || aiQuota.data.subscription_ai_interviews_remaining > 0 || aiQuota.data.has_unlimited_ai) && (
//             <div className="mt-4 pt-4 border-t border-white/10">
//               <p className="text-[10px] font-bold mb-2 text-indigo-100 uppercase tracking-widest text-white/70">Interview Quotas</p>
//               <div className="grid grid-cols-2 gap-3 text-xs">
//                 {aiQuota.data.has_unlimited_ai ? (
//                   <div>
//                     <p className="text-white/60">Pro Access</p>
//                     <p className="font-bold text-emerald-300">Unlimited</p>
//                   </div>
//                 ) : (
//                   <>
//                     {aiQuota.data.subscription_ai_interviews_remaining > 0 && (
//                       <div>
//                         <p className="text-white/60">Subscription</p>
//                         <p className="font-bold">{aiQuota.data.subscription_ai_interviews_remaining} Left</p>
//                       </div>
//                     )}
//                     {aiQuota.data.free_ai_interviews_remaining > 0 && (
//                       <div>
//                         <p className="text-white/60">Free Quota</p>
//                         <p className="font-bold">{aiQuota.data.free_ai_interviews_remaining} Left</p>
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* CTA */}
//         <button
//           onClick={() => navigate('/candidate/subscription')}
//           className="w-full mt-4 px-4 py-3 rounded-2xl bg-white/20 border border-white/40 text-white font-semibold hover:bg-white/30 transition-all flex items-center justify-center gap-2"
//         >
//           <Zap className="w-4 h-4" />
//           Upgrade Plan
//           <ArrowRight className="w-4 h-4" />
//         </button>
//       </div>

//       {/* Info Box */}
//       <div className="bg-white/80 rounded-3xl border border-slate-200 p-4 shadow-sm">
//         <div className="flex items-start gap-3">
//           <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
//           <div>
//             <p className="text-sm font-semibold text-slate-900 mb-1">What are tokens?</p>
//             <p className="text-xs text-slate-600">
//               Tokens power AI feedback and advanced features. Each mock interview costs tokens based on interview duration and feedback depth. Unused tokens carry over monthly.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Upgrade Plans */}
//       <div>
//         <h4 className="text-sm font-bold text-slate-900 mb-3">Upgrade your plan</h4>
//         <div className="grid md:grid-cols-2 gap-3">
//           {displayPlans.map((plan) => {
//             const isCurrent = planType.includes(plan.id) || planName.toLowerCase().includes(plan.name.toLowerCase());
//             return (
//               <div
//                 key={plan.id}
//                 className={`relative rounded-2xl p-4 border-2 transition-all ${isCurrent
//                   ? 'border-indigo-500 bg-indigo-50'
//                   : plan.recommended
//                     ? 'border-emerald-300 bg-emerald-50'
//                     : 'border-slate-200 bg-white hover:border-slate-300'
//                   }`}
//               >
//                 {/* Badge */}
//                 {(isCurrent || plan.badge) && (
//                   <div className="absolute -top-2 left-4">
//                     <span
//                       className={`text-[10px] font-black px-2 py-1 rounded-full ${isCurrent ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
//                         }`}
//                     >
//                       {isCurrent ? 'CURRENT' : plan.badge}
//                     </span>
//                   </div>
//                 )}

//                 <div className="pt-2">
//                   <h5 className="font-bold text-slate-900">{plan.name}</h5>
//                   <p className="text-xs text-slate-600 mt-0.5">
//                     {plan.price} <span className="text-[10px]">{plan.period}</span>
//                   </p>
//                   <div className="mt-3 text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
//                     {plan.description || "No description available"}
//                   </div>
//                 </div>

//                 {!isCurrent && (
//                   <button
//                     className="w-full mt-3 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
//                     onClick={() => navigate('/candidate/subscription')}
//                   >
//                     {plan.price === 'Custom' ? 'Contact sales' : 'Upgrade'}
//                   </button>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TokenSummary;


























// src/pages/candidate/components/sections/TokenSummary.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Zap, Crown, Lock, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchWalletSummary } from '../../../../wallets/candidateWalletSlice';
import { fetchCurrentSubscription, fetchSubscriptionPlans } from '../../../../subscriptions/subscriptionSlice';
import { fetchAiInterviewQuota } from '../../../../features/aiInterview/slice/aiInterviewSessionSlice';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  teal: '#0BB5A0',
  tealDark: '#099485',
  tealLight: '#E6F8F6',
  tealBorder: '#B3E8E3',
  yellow: '#F5C518',
  yellowDark: '#C9A214',
  yellowLight: '#FEFAE8',
  yellowBorder: '#EDD87A',
  dark: '#111827',
  gray: '#F5F5F5',
  grayBorder: '#E0E0E0',
  grayMid: '#E8E8E8',
  white: '#FFFFFF',
  text: '#1F2937',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
};

// ─── Static fallback plans ─────────────────────────────────────────────────────
const STATIC_PLANS = [
  { id: 'free', name: 'Free', price: '₹0', period: 'forever', badge: null, recommended: false },
  { id: 'starter', name: 'Starter', price: '₹299', period: '/month', badge: null, recommended: false },
  { id: 'pro', name: 'Professional', price: '₹699', period: '/month', badge: 'MOST POPULAR', recommended: true },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', period: 'contact sales', badge: null, recommended: false },
];

// ─── Skeleton block ────────────────────────────────────────────────────────────
const Skel = ({ w = '100%', h = '16px', r = '6px' }) => (
  <div style={{ width: w, height: h, borderRadius: r, background: 'rgba(255,255,255,0.18)', animation: 'ts-pulse 1.4s ease-in-out infinite' }} />
);

// ─── Component ─────────────────────────────────────────────────────────────────
const TokenSummary = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { summary: walletSummary, loading: walletLoading, error: walletError } = useSelector((state) => state.candidateWallet);
  const { current: currentSub, plans: apiPlans, loading: subLoading } = useSelector((state) => state.subscription);
  const { quota: aiQuota } = useSelector((state) => state.aiInterviewSession);

  const isLoading = walletLoading || subLoading || aiQuota.status === 'loading';

  useEffect(() => {
    dispatch(fetchWalletSummary());
    dispatch(fetchCurrentSubscription());
    dispatch(fetchSubscriptionPlans());
    dispatch(fetchAiInterviewQuota());
  }, [dispatch]);

  const handleRetry = () => {
    dispatch(fetchWalletSummary());
    dispatch(fetchCurrentSubscription());
    dispatch(fetchAiInterviewQuota());
  };

  // Normalise wallet
  const available = walletSummary?.available_balance ?? walletSummary?.balance ?? 0;
  const locked = walletSummary?.locked_balance ?? 0;
  const total = walletSummary?.total_balance ?? (available + locked);

  // Normalise subscription
  const planName = currentSub?.plan_name ?? currentSub?.plan?.name ?? currentSub?.name ?? 'Free';
  const planType = (currentSub?.plan_type ?? currentSub?.plan?.slug ?? planName).toLowerCase();
  const renewalDate = currentSub?.end_date ?? currentSub?.renewal_date ?? currentSub?.expires_at;

  const remainingPercent = total > 0 ? Math.min(100, (available / total) * 100) : 0;

  // Plans
  const displayPlans = (apiPlans?.length > 0)
    ? apiPlans.map((p) => ({
      id: p.slug ?? p.id,
      name: p.name,
      price: p.price_inr != null ? (p.price_inr === 0 ? 'Free' : `₹${p.price_inr}`) : 'Custom',
      period: '/month',
      description: p.description,
      badge: p.is_recommended ? 'MOST POPULAR' : null,
      recommended: p.is_recommended ?? false,
    }))
    : STATIC_PLANS;

  // Error state
  if (walletError && !isLoading) {
    return (
      <div style={{ fontFamily: '"DM Sans", sans-serif' }}>
        <div style={{
          background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '20px',
          padding: '40px', textAlign: 'center',
        }}>
          <AlertCircle size={32} style={{ color: '#EF4444', margin: '0 auto 10px', display: 'block' }} />
          <p style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: '#DC2626' }}>
            Failed to load token data
          </p>
          <button
            onClick={handleRetry}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '10px 20px', borderRadius: '12px', border: 'none',
              background: '#EF4444', color: C.white, fontWeight: 700, fontSize: '13px',
              cursor: 'pointer', fontFamily: '"DM Sans", sans-serif',
            }}
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: '"DM Sans", sans-serif' }}>
      <style>{`
        @keyframes ts-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes ts-spin   { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Current Plan Hero Card ── */}
      <div style={{
        borderRadius: '22px', padding: '28px',
        background: `linear-gradient(135deg, ${C.dark} 0%, #1A3532 55%, #0B8A79 100%)`,
        color: C.white, position: 'relative', overflow: 'hidden',
        boxShadow: `0 12px 48px rgba(11,181,160,0.20)`,
      }}>
        {/* Decorative */}
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: `${C.teal}18`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20px', left: '25%', width: '100px', height: '100px', borderRadius: '50%', background: `${C.yellow}10`, pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          {/* Plan name row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Your subscription
              </p>
              {isLoading ? <Skel w="140px" h="28px" r="8px" /> : (
                <h3 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: C.white }}>{planName}</h3>
              )}
              {renewalDate && !isLoading && (
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                  Renews {new Date(renewalDate).toLocaleDateString('en-IN')}
                </p>
              )}
            </div>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Crown size={22} style={{ color: C.yellow, opacity: 0.85 }} />
            </div>
          </div>

          {/* Token balance box */}
          <div style={{
            background: 'rgba(255,255,255,0.08)', borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.12)', padding: '16px', marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>Token balance</span>
              {isLoading ? <Skel w="60px" h="22px" r="6px" /> : (
                <span style={{ fontSize: '22px', fontWeight: 800, color: C.white }}>{total}</span>
              )}
            </div>

            {/* Progress bar */}
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.12)', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
              {isLoading ? (
                <div style={{ height: '100%', width: '50%', background: 'rgba(255,255,255,0.2)', animation: 'ts-pulse 1.4s ease-in-out infinite', borderRadius: '3px' }} />
              ) : (
                <div style={{
                  height: '100%', borderRadius: '3px',
                  background: `linear-gradient(90deg, ${C.teal}, ${C.yellow})`,
                  width: `${remainingPercent}%`, transition: 'width 0.5s ease',
                }} />
              )}
            </div>

            {/* Available / Locked */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '10px', color: 'rgba(255,255,255,0.55)' }}>Available</p>
                {isLoading ? <Skel w="40px" h="14px" r="4px" /> : (
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: C.teal }}>{available}</p>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <Lock size={11} style={{ color: C.yellow, marginTop: '1px', flexShrink: 0 }} />
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: '10px', color: 'rgba(255,255,255,0.55)' }}>Locked</p>
                  {isLoading ? <Skel w="40px" h="14px" r="4px" /> : (
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: C.yellow }}>{locked}</p>
                  )}
                </div>
              </div>
            </div>

            {/* AI quota strip */}
            {aiQuota.status === 'ready' && aiQuota.data && (
              aiQuota.data.has_unlimited_ai || aiQuota.data.subscription_ai_interviews_remaining > 0 || aiQuota.data.free_ai_interviews_remaining > 0
            ) && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                    Interview quotas
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {aiQuota.data.has_unlimited_ai ? (
                      <div>
                        <p style={{ margin: '0 0 1px', fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Pro Access</p>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: C.teal }}>Unlimited</p>
                      </div>
                    ) : (
                      <>
                        {aiQuota.data.subscription_ai_interviews_remaining > 0 && (
                          <div>
                            <p style={{ margin: '0 0 1px', fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Subscription</p>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: C.white }}>
                              {aiQuota.data.subscription_ai_interviews_remaining} left
                            </p>
                          </div>
                        )}
                        {aiQuota.data.free_ai_interviews_remaining > 0 && (
                          <div>
                            <p style={{ margin: '0 0 1px', fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Free quota</p>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: C.white }}>
                              {aiQuota.data.free_ai_interviews_remaining} left
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* Upgrade CTA */}
          <button
            onClick={() => navigate('/subscriptions')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.20)',
              background: 'rgba(255,255,255,0.10)', color: C.white, fontWeight: 700, fontSize: '13px',
              cursor: 'pointer', transition: 'background 0.15s', fontFamily: '"DM Sans", sans-serif',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
          >
            <Zap size={14} style={{ color: C.yellow }} />
            Upgrade Plan
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* ── What are tokens? ── */}
      <div style={{
        background: C.tealLight, borderRadius: '16px', border: `1px solid ${C.tealBorder}`,
        padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '10px', background: C.teal,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <AlertCircle size={15} style={{ color: C.white }} />
        </div>
        <div>
          <p style={{ margin: '0 0 3px', fontSize: '13px', fontWeight: 700, color: C.dark }}>What are tokens?</p>
          <p style={{ margin: 0, fontSize: '12px', color: C.textMuted, lineHeight: 1.5 }}>
            Tokens power AI feedback and advanced features. Each mock interview costs tokens based on duration and feedback depth. Unused tokens carry over monthly.
          </p>
        </div>
      </div>

      {/* ── Plans grid ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: '4px', height: '18px', borderRadius: '2px', background: C.yellow }} />
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: C.dark }}>Upgrade your plan</h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {displayPlans.map((plan) => {
            const isCurrent = planType.includes(plan.id) || planName.toLowerCase().includes(plan.name.toLowerCase());
            return (
              <div
                key={plan.id}
                style={{
                  position: 'relative', borderRadius: '16px', padding: '16px',
                  border: `1.5px solid ${isCurrent ? C.teal : plan.recommended ? C.yellowBorder : C.grayBorder}`,
                  background: isCurrent ? C.tealLight : plan.recommended ? C.yellowLight : C.white,
                  transition: 'all 0.15s',
                }}
              >
                {/* Badge */}
                {(isCurrent || plan.badge) && (
                  <div style={{ position: 'absolute', top: '-10px', left: '12px' }}>
                    <span style={{
                      fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '20px',
                      background: isCurrent ? C.teal : C.yellow,
                      color: isCurrent ? C.white : C.dark,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {isCurrent ? 'CURRENT' : plan.badge}
                    </span>
                  </div>
                )}

                <div style={{ paddingTop: isCurrent || plan.badge ? '6px' : '0' }}>
                  <h5 style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 700, color: C.dark }}>{plan.name}</h5>
                  <p style={{ margin: '0 0 8px', fontSize: '12px', color: C.textMuted }}>
                    {plan.price} <span style={{ fontSize: '10px' }}>{plan.period}</span>
                  </p>
                  {plan.description && (
                    <p style={{ margin: '0 0 10px', fontSize: '11.5px', color: C.textMuted, lineHeight: 1.5 }}>
                      {plan.description}
                    </p>
                  )}
                </div>

                {!isCurrent && (
                  <button
                    onClick={() => navigate('/subscriptions')}
                    style={{
                      width: '100%', padding: '8px', borderRadius: '10px', border: 'none',
                      background: plan.recommended ? C.yellow : C.gray,
                      color: plan.recommended ? C.dark : C.text,
                      fontWeight: 700, fontSize: '12px',
                      cursor: 'pointer', transition: 'all 0.15s', fontFamily: '"DM Sans", sans-serif',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    {plan.price === 'Custom' ? 'Contact sales' : 'Upgrade'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TokenSummary;