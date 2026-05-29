// src/pages/candidate/components/sections/TokenSummary.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Zap,
  Crown,
  TrendingUp,
  Lock,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { fetchWalletSummary } from '../../../../wallets/candidateWalletSlice';
import { fetchCurrentSubscription, fetchSubscriptionPlans } from '../../../../subscriptions/subscriptionSlice';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: 'forever',
    tokens: 100,
    interviews: 2,
    badge: null,
    recommended: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '₹299',
    period: '/month',
    tokens: 500,
    interviews: 10,
    badge: null,
    recommended: false,
  },
  {
    id: 'pro',
    name: 'Professional',
    price: '₹699',
    period: '/month',
    tokens: 1500,
    interviews: 'Unlimited',
    badge: 'MOST POPULAR',
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact sales',
    tokens: 'Unlimited',
    interviews: 'Unlimited',
    badge: null,
    recommended: false,
  },
];

const TokenSummary = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { summary: walletSummary, loading: walletLoading, error: walletError } = useSelector(
    (state) => state.candidateWallet
  );
  const { current: currentSub, plans: apiPlans, loading: subLoading } = useSelector(
    (state) => state.subscription
  );

  const isLoading = walletLoading || subLoading;

  useEffect(() => {
    dispatch(fetchWalletSummary());
    dispatch(fetchCurrentSubscription());
    dispatch(fetchSubscriptionPlans());
  }, [dispatch]);

  const handleRetry = () => {
    dispatch(fetchWalletSummary());
    dispatch(fetchCurrentSubscription());
  };

  // Normalise wallet fields
  const available = walletSummary?.balance ?? walletSummary?.available_tokens ?? 0;
  const locked = walletSummary?.locked_balance ?? walletSummary?.locked_tokens ?? 0;
  const total = walletSummary?.total_tokens ?? walletSummary?.monthly_limit ?? (available + locked);
  const used = walletSummary?.used_tokens ?? Math.max(0, total - available - locked);

  // Normalise subscription fields
  const planName = currentSub?.plan_name ?? currentSub?.plan?.name ?? currentSub?.name ?? 'Free';
  const planType = (currentSub?.plan_type ?? currentSub?.plan?.slug ?? planName).toLowerCase();
  const renewalDate = currentSub?.end_date ?? currentSub?.renewal_date ?? currentSub?.expires_at;

  const remainingPercent = total > 0 ? Math.min(100, (available / total) * 100) : 0;

  // Use API plans if available, else fallback to static
  const displayPlans = (apiPlans && apiPlans.length > 0) ? apiPlans.map((p) => ({
    id: p.slug ?? p.id,
    name: p.name,
    price: p.price != null ? `₹${p.price}` : 'Custom',
    period: '/month',
    tokens: p.token_limit ?? p.tokens ?? '—',
    interviews: p.interview_limit ?? p.interviews ?? '—',
    badge: p.is_recommended ? 'MOST POPULAR' : null,
    recommended: p.is_recommended ?? false,
  })) : plans;

  if (walletError && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-rose-700 mb-4">Failed to load token data</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-indigo-100 mb-1">
              Your subscription
            </p>
            {isLoading ? (
              <div className="h-8 w-32 bg-white/20 rounded animate-pulse" />
            ) : (
              <h3 className="text-2xl sm:text-3xl font-black">{planName}</h3>
            )}
            {renewalDate && !isLoading && (
              <p className="text-sm text-indigo-100 mt-2">
                Renews on {new Date(renewalDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <Crown className="w-12 h-12 text-indigo-300 opacity-50" />
        </div>

        {/* Token Usage */}
        <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Token balance</span>
            {isLoading ? (
              <div className="h-6 w-20 bg-white/20 rounded animate-pulse" />
            ) : (
              <span className="text-xl font-black">
                {available}/{total}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-white/20 rounded-full overflow-hidden mb-3">
            {isLoading ? (
              <div className="h-full w-1/2 bg-white/30 animate-pulse rounded-full" />
            ) : (
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all"
                style={{ width: `${remainingPercent}%` }}
              />
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-indigo-100">Available</p>
              {isLoading ? (
                <div className="h-4 w-8 bg-white/20 rounded animate-pulse mt-0.5" />
              ) : (
                <p className="font-bold">{available}</p>
              )}
            </div>
            <div>
              <p className="text-indigo-100">Used</p>
              {isLoading ? (
                <div className="h-4 w-8 bg-white/20 rounded animate-pulse mt-0.5" />
              ) : (
                <p className="font-bold">{used}</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-300" />
              <div>
                <p className="text-indigo-100">Locked</p>
                {isLoading ? (
                  <div className="h-4 w-8 bg-white/20 rounded animate-pulse mt-0.5" />
                ) : (
                  <p className="font-bold">{locked}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/candidate/subscription')}
          className="w-full mt-4 px-4 py-3 rounded-2xl bg-white/20 border border-white/40 text-white font-semibold hover:bg-white/30 transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Upgrade Plan
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-white/80 rounded-3xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-slate-900 mb-1">What are tokens?</p>
            <p className="text-xs text-slate-600">
              Tokens power AI feedback and advanced features. Each mock interview costs tokens based on interview duration and feedback depth. Unused tokens carry over monthly.
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade Plans */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 mb-3">Upgrade your plan</h4>
        <div className="grid md:grid-cols-2 gap-3">
          {displayPlans.map((plan) => {
            const isCurrent = planType.includes(plan.id) || planName.toLowerCase().includes(plan.name.toLowerCase());
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-4 border-2 transition-all ${isCurrent
                  ? 'border-indigo-500 bg-indigo-50'
                  : plan.recommended
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
              >
                {/* Badge */}
                {(isCurrent || plan.badge) && (
                  <div className="absolute -top-2 left-4">
                    <span
                      className={`text-[10px] font-black px-2 py-1 rounded-full ${isCurrent ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                        }`}
                    >
                      {isCurrent ? 'CURRENT' : plan.badge}
                    </span>
                  </div>
                )}

                <div className="pt-2">
                  <h5 className="font-bold text-slate-900">{plan.name}</h5>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {plan.price} <span className="text-[10px]">{plan.period}</span>
                  </p>
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Zap className="w-3 h-3 text-amber-600" />
                      <span className="text-slate-700 font-medium">{plan.tokens} tokens/month</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <TrendingUp className="w-3 h-3 text-blue-600" />
                      <span className="text-slate-700 font-medium">
                        {plan.interviews === 'Unlimited'
                          ? 'Unlimited interviews'
                          : `${plan.interviews} interviews/month`}
                      </span>
                    </div>
                  </div>
                </div>

                {!isCurrent && (
                  <button
                    className="w-full mt-3 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                    onClick={() => navigate('/candidate/subscription')}
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
