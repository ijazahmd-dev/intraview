import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const SubscriptionCancel = () => {
  const navigate = useNavigate();

  const handleContinueShopping = () => {
    toast.info('No worries! You can upgrade anytime.');
    navigate('/subscriptions');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Cancel Icon */}
        <div className="w-32 h-32 bg-gradient-to-r from-gray-400 to-gray-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl ring-8 ring-gray-200/50">
          <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        {/* Main Message */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Payment Cancelled
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
          No worries! Your subscription was not activated and no charges were made.
        </p>

        {/* Options */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-12 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Try Again?</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={handleContinueShopping}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 px-8 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3 h-20"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Upgrade Plan
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="border-2 border-gray-300 hover:border-gray-400 text-gray-800 py-6 px-8 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 h-20 hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Reassurance */}
        <div className="max-w-lg mx-auto space-y-4 text-gray-600">
          <p className="text-lg">
            💳 <strong>No payment was processed</strong> - your card details are safe
          </p>
          <p>
            ⏰ You can try again anytime - plans never expire
          </p>
          <p>
            ❓ Questions?{' '}
            <a href="mailto:support@yourapp.com" className="text-blue-600 hover:text-blue-700 font-semibold underline">
              support@yourapp.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCancel;
