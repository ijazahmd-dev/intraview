import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const InterviewerSubscriptionCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planId = searchParams.get('plan_id');
  const planName = planId ? `Plan ${planId}` : 'your plan';

  const handleRetry = () => {
    toast.info('No worries! Upgrade anytime.');
    navigate('/interviewer/subscriptions');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Cancel Icon */}
        <div className="w-32 h-32 bg-gradient-to-r from-gray-400 to-gray-500 rounded-3xl flex items-center justify-center mx-auto mb-12 shadow-xl ring-8 ring-gray-200/50">
          <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        {/* Main Message */}
        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
          Subscription Cancelled
        </h1>
        
        <p className="text-2xl text-gray-600 mb-12 max-w-lg mx-auto leading-relaxed">
          No charges were made to your card. You can try again anytime.
        </p>

        {/* Plan Reference */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-10 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Plan: {planName}</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <div className="text-gray-500 uppercase tracking-wide mb-2">Status</div>
              <div className="font-bold text-2xl text-gray-900">Not Activated</div>
            </div>
            <div>
              <div className="text-gray-500 uppercase tracking-wide mb-2">Payment</div>
              <div className="font-bold text-2xl text-emerald-600">₹0 Charged</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Ready to Go Live?</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={handleRetry}
              className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 px-10 rounded-3xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-20 flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Try {planName} Plan
            </button>
            
            <button
              onClick={() => navigate('/interviewer/dashboard')}
              className="border-3 border-gray-300 hover:border-indigo-400 text-gray-800 hover:text-indigo-600 py-6 px-10 rounded-3xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 h-20 hover:bg-indigo-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Reassurance */}
        <div className="max-w-lg mx-auto space-y-4 text-gray-600 text-lg">
          <div className="flex items-center justify-center gap-3 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span><strong>100% Secure</strong> - No payment details were saved</span>
          </div>
          
          <p className="text-center">
            Plans never expire • Upgrade anytime • No commitment
          </p>
          
          <p className="text-center">
            Need help?{' '}
            <a href="mailto:support@yourapp.com" className="text-indigo-600 hover:text-indigo-700 font-bold underline">
              support@yourapp.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterviewerSubscriptionCancel;
