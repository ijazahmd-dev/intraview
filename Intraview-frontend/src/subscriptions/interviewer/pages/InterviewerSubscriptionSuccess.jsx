import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { interviewerSubscriptionsApi } from '../../interviewerSubscriptionsApi';
import Confetti from 'react-confetti';

const InterviewerSubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const planId = searchParams.get('plan_id');

  useEffect(() => {
    if (!planId) {
      toast.error('No subscription plan found');
      navigate('/interviewer/subscriptions');
      return;
    }

    const checkSubscription = async () => {
      try {
        const response = await interviewerSubscriptionsApi.getCurrentSubscription();
        setSubscription(response.data);
        setLoading(false);
        toast.success('Your interviewer subscription is now active!');
      } catch (error) {
        toast.error('Failed to verify subscription');
        setLoading(false);
      }
    };

    checkSubscription();
  }, [planId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600">Activating your interviewer profile...</p>
        </div>
      </div>
    );
  }

  const plan = subscription?.plan;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 overflow-hidden relative">
      {/* Confetti */}
      <Confetti 
        width={window.innerWidth} 
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={300}
        gravity={0.1}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-20 sm:py-32 relative z-10">
        {/* Hero Success */}
        <div className="text-center mb-20">
          <div className="w-36 h-36 bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-12 shadow-2xl ring-8 ring-emerald-200/50">
            <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-6">
            You're Live!
          </h1>
          
          <p className="text-2xl md:text-3xl text-gray-700 mb-4">Your interviewer subscription is now active</p>
          
          {plan && (
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent mb-8">
              {plan.name} Plan Activated
            </div>
          )}
        </div>

        {/* Subscription Card */}
        {subscription?.has_subscription && plan && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-200/50 p-12 mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Your New Powers</h2>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Plan Details */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 p-8 bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl border-2 border-emerald-100">
                  <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-3">{plan.name}</h3>
                    <div className="text-4xl font-black text-emerald-600">₹{plan.price_inr}</div>
                    <p className="text-lg text-emerald-700">per month</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="text-3xl font-bold text-blue-600 mb-2">✅ Live Now</div>
                    <p className="text-sm text-blue-700">Profile visible to candidates</p>
                  </div>
                  <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                    <div className="text-3xl font-bold text-green-600 mb-2">∞</div>
                    <p className="text-sm text-green-700">Unlimited bookings</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="text-center">
                <div className="text-6xl font-black text-gray-900 mb-6">🎤</div>
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8 rounded-3xl shadow-2xl">
                  <div className="text-5xl font-black mb-4">Ready to Earn</div>
                  <div className="text-xl opacity-90 mb-8">Start accepting interview requests immediately</div>
                  <div className="space-y-3 text-lg">
                    <div>• Priority candidate matching</div>
                    <div>• Analytics dashboard unlocked</div>
                    <div>• Cancel anytime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold text-gray-900">Get Started Now</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="group bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Go Live</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">Your profile is now visible to candidates. Check your availability and start earning.</p>
              <button 
                onClick={() => navigate('/interviewer/dashboard')}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 px-8 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Open Dashboard
              </button>
            </div>
            
            <div className="group bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Manage Plan</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">View subscription details, set your availability, and manage billing anytime.</p>
              <button 
                onClick={() => navigate('/interviewer/subscriptions')}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-4 px-8 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                View Subscription
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 text-center">
          <p className="text-xl text-gray-600 mb-6">
            Questions? Contact support at{' '}
            <a href="mailto:support@yourapp.com" className="text-emerald-600 hover:text-emerald-700 font-bold underline">
              support@yourapp.com
            </a>
          </p>
          <div className="text-sm text-gray-500">
            <p>Renews monthly • Cancel anytime • Secure Stripe billing</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewerSubscriptionSuccess;
