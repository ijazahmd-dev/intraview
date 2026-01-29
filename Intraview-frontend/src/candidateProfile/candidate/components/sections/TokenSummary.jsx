// src/pages/candidate/components/sections/TokenSummary.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Crown,
  TrendingUp,
  Calendar,
  Lock,
  ArrowRight,
  Gift,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

const TokenSummary = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('starter');

  // Mock data - replace with Redux state
  const userSubscription = {
    currentPlan: 'Starter',
    planType: 'starter',
    renewalDate: '2026-02-28',
    totalTokens: 500,
    usedTokens: 120,
    remainingTokens: 380,
    lockedTokens: 50,
    monthlyLimit: 500,
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '₹0',
      period: 'forever',
      tokens: 100,
      interviews: 2,
      features: [
        '2 mock interviews/month',
        '100 AI tokens',
        'Basic feedback',
        'Community support',
      ],
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
      features: [
        '10 mock interviews/month',
        '500 AI tokens',
        'Detailed feedback',
        'Email support',
        'Resume review',
      ],
      badge: 'CURRENT',
      recommended: false,
    },
    {
      id: 'pro',
      name: 'Professional',
      price: '₹699',
      period: '/month',
      tokens: 1500,
      interviews: 'Unlimited',
      features: [
        'Unlimited interviews',
        '1500 AI tokens',
        'Advanced analytics',
        'Priority support',
        'Resume + portfolio review',
        'Interview scheduling',
      ],
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
      features: [
        'Everything in Pro',
        'Unlimited AI tokens',
        'Dedicated account manager',
        'Custom integrations',
        'Team features',
        'SLA guarantee',
      ],
      badge: null,
      recommended: false,
    },
  ];

  const remainingPercent = (userSubscription.remainingTokens / userSubscription.totalTokens) * 100;
  const usedPercent = (userSubscription.usedTokens / userSubscription.totalTokens) * 100;

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-indigo-100 mb-1">
              Your subscription
            </p>
            <h3 className="text-2xl sm:text-3xl font-black">{userSubscription.currentPlan}</h3>
            <p className="text-sm text-indigo-100 mt-2">
              Renews on {new Date(userSubscription.renewalDate).toLocaleDateString()}
            </p>
          </div>
          <Crown className="w-12 h-12 text-indigo-300 opacity-50" />
        </div>

        {/* Token Usage */}
        <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Monthly token balance</span>
            <span className="text-xl font-black">
              {userSubscription.remainingTokens}/{userSubscription.totalTokens}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-white/20 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all"
              style={{ width: `${remainingPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-indigo-100">Available</p>
              <p className="font-bold">{userSubscription.remainingTokens}</p>
            </div>
            <div>
              <p className="text-indigo-100">Used</p>
              <p className="font-bold">{userSubscription.usedTokens}</p>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-300" />
              <div>
                <p className="text-indigo-100">Locked</p>
                <p className="font-bold">{userSubscription.lockedTokens}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/candidate/profile?tab=tokens')}
          className="w-full mt-4 px-4 py-3 rounded-2xl bg-white/20 border border-white/40 text-white font-semibold hover:bg-white/30 transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Upgrade Plan
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* What are Tokens? */}
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

      {/* Pricing Plans */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 mb-3">Upgrade your plan</h4>
        <div className="grid md:grid-cols-2 gap-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-4 border-2 cursor-pointer transition-all ${
                userSubscription.planType === plan.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : plan.recommended
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-2 left-4">
                  <span
                    className={`text-[10px] font-black px-2 py-1 rounded-full ${
                      plan.badge === 'CURRENT'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="pt-2">
                <h5 className="font-bold text-slate-900">{plan.name}</h5>
                <p className="text-xs text-slate-600 mt-0.5">
                  {plan.price} <span className="text-[10px]">{plan.period}</span>
                </p>

                {/* Key Features */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <Zap className="w-3 h-3 text-amber-600" />
                    <span className="text-slate-700 font-medium">
                      {plan.tokens} tokens/month
                    </span>
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

              {/* Action */}
              {userSubscription.planType !== plan.id && (
                <button
                  className="w-full mt-3 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    // navigate to payment
                  }}
                >
                  {plan.price === 'Custom' ? 'Contact sales' : 'Upgrade'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Features Comparison */}
      <div className="bg-white/80 rounded-3xl border border-slate-200 p-4 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 mb-3">Feature comparison</h4>
        <div className="space-y-2 text-xs">
          {['Mock interviews', 'AI feedback', 'Detailed analytics', 'Priority support', 'Portfolio review'].map(
            (feature, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-slate-700">{feature}</span>
                <div className="flex gap-2">
                  {plans.slice(0, 3).map((plan) => (
                    <div key={plan.id} className="text-center w-12">
                      {feature === 'Mock interviews' && plan.interviews !== 'Unlimited' ? (
                        <span className="text-[10px] font-bold text-slate-900">{plan.interviews}</span>
                      ) : ['AI feedback', 'Detailed analytics', 'Priority support', 'Portfolio review'].includes(feature) &&
                        plan.id !== 'free' ? (
                        <span className="text-emerald-600 font-bold">✓</span>
                      ) : feature === 'Portfolio review' && plan.id === 'enterprise' ? (
                        <span className="text-emerald-600 font-bold">✓</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 p-4">
        <div className="flex gap-3">
          <Gift className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold text-blue-900 mb-1">Referral bonus</p>
            <p className="text-blue-700">
              Refer a friend and get 100 tokens! Your friend also gets 50 tokens on signup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenSummary;
