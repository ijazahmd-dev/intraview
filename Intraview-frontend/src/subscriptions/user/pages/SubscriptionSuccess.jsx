import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { subscriptionsApi } from '../../subscriptionsApi';
// import Confetti from 'react-confetti';

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const planId = searchParams.get('plan_id');
    if (!planId) {
      toast.error('No subscription plan found');
      navigate('/subscriptions');
      return;
    }

    // Refresh subscription status
    const checkSubscription = async () => {
      try {
        const response = await subscriptionsApi.getCurrentSubscription();
        setSubscription(response.data);
        setLoading(false);
        toast.success('Welcome to your new plan!');
      } catch (error) {
        toast.error('Failed to load subscription details');
        setLoading(false);
      }
    };

    checkSubscription();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600">Finalizing your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 overflow-hidden">
      {/* Confetti */}
      {/* <Confetti 
        width={window.innerWidth} 
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={200}
        gravity={0.2}
      />
       */}
      <div className="max-w-4xl mx-auto px-4 py-20 sm:py-32 relative z-10">
        {/* Success Header */}
        <div className="text-center mb-20">
          <div className="w-32 h-32 bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl ring-8 ring-emerald-200/50">
            <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-6">
            Payment Successful!
          </h1>
          
          <p className="text-2xl text-gray-700 mb-2">Your subscription is now active</p>
          
          {subscription?.has_subscription && (
            <p className="text-4xl font-bold text-emerald-600">
              Welcome to <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                {subscription.plan_name}
              </span> Plan
            </p>
          )}
        </div>

        {/* Subscription Details */}
        {subscription?.has_subscription && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-200/50 p-10 mb-12 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What's Now Active</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-gray-900">{subscription.monthly_free_tokens} free tokens</p>
                    <p className="text-sm text-gray-600">Credited monthly</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {subscription.ai_interviews_per_month === -1 
                        ? 'Unlimited AI interviews' 
                        : `${subscription.ai_interviews_per_month} AI interviews/month`}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {subscription.has_priority_booking && (
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Priority booking</p>
                      <p className="text-sm text-gray-600">Skip the queue</p>
                    </div>
                  </div>
                )}
                
                {subscription.has_advanced_ai_feedback && (
                  <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Advanced AI feedback</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-emerald-200 text-center">
              <p className="text-sm text-gray-600 mb-4">
                Renews {new Date(subscription.end_date).toLocaleDateString()} • 
                Cancel anytime
              </p>
              <div className="text-2xl font-bold text-emerald-600">
                ₹{subscription.price_inr}/month
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">What's Next?</h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Booking</h3>
              <p className="text-gray-600 mb-6">Book interviews with top interviewers using your new plan benefits.</p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-8 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Go to Dashboard
              </button>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Manage Plan</h3>
              <p className="text-gray-600 mb-6">View subscription details, tokens, and manage billing anytime.</p>
              <button 
                onClick={() => navigate('/subscriptions')}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-4 px-8 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                View Subscription
              </button>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-20 text-center">
          <p className="text-lg text-gray-600 mb-8">
            Need help? Contact support anytime at{' '}
            <a href="mailto:support@yourapp.com" className="text-emerald-600 hover:text-emerald-700 font-semibold underline">
              support@yourapp.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
