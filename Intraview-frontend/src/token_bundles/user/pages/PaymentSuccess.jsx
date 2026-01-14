import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Gift, Clock, CreditCard, Coins } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('order_id');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (orderId) {
      // Fetch order details (mock for now)
      setTimeout(() => {
        setOrderDetails({
          id: orderId,
          amount: 799,
          tokens: 100,
          packName: 'Starter Pack',
          date: new Date().toLocaleString(),
          status: 'succeeded'
        });
        setLoading(false);
      }, 1500);
    }
  }, [orderId]);

  if (loading) {
    return <SuccessLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-28 h-28 bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border-8 border-white">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-emerald-700 to-green-700 bg-clip-text text-transparent mb-6">
            Payment Successful!
          </h1>
          
          <p className="text-2xl text-gray-600 font-semibold mb-2">
            Order #{orderId?.slice(-8) || 'N/A'}
          </p>
          <div className="inline-flex items-center gap-2 bg-white/80 px-6 py-3 rounded-2xl border-2 border-emerald-200 shadow-lg">
            <Gift className="w-6 h-6 text-emerald-600" />
            <span className="text-xl font-bold text-emerald-700">
              {orderDetails?.tokens?.toLocaleString() || '??'} tokens added to wallet
            </span>
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100 p-10 mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Order Summary</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl">
                <div>
                  <p className="text-sm font-medium text-gray-600">Token Pack</p>
                  <p className="text-2xl font-bold text-gray-900">{orderDetails?.packName}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-emerald-700">₹{orderDetails?.amount?.toLocaleString()}</p>
                  <p className="text-sm text-emerald-600 font-semibold">{orderDetails?.tokens?.toLocaleString()} tokens</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 rounded-2xl">
                <div className="text-center">
                  <Clock className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-lg font-bold text-gray-900">{orderDetails?.date}</p>
                </div>
                <div className="text-center">
                  <CreditCard className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Paid with</p>
                  <p className="text-lg font-bold text-gray-900">Stripe</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <p className="text-center text-sm text-gray-600 mb-4">
              💳 Securely processed via Stripe | PCI-DSS compliant
            </p>
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-8 rounded-2xl text-center font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer mx-auto max-w-sm">
              Download Receipt
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-6"
        >
          <h3 className="text-3xl font-bold text-gray-900">What's Next?</h3>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="group bg-white p-8 rounded-2xl shadow-xl border border-gray-200 hover:border-emerald-300 hover:shadow-2xl transition-all duration-300"
              onClick={() => navigate('/dashboard')}
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-200 transition-colors">
                <ArrowRight className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Book Interview</h4>
              <p className="text-gray-600">Use your new tokens to book mock interviews now</p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="group bg-white p-8 rounded-2xl shadow-xl border border-gray-200 hover:border-emerald-300 hover:shadow-2xl transition-all duration-300"
              onClick={() => navigate('/wallet')}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <Gift className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">View Wallet</h4>
              <p className="text-gray-600">Check your token balance and transaction history</p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="group bg-white p-8 rounded-2xl shadow-xl border border-gray-200 hover:border-purple-300 hover:shadow-2xl transition-all duration-300"
              onClick={() => navigate('/tokens')}
            >
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                {/* <Coins className="w-8 h-8 text-purple-600" /> */}
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Buy More</h4>
              <p className="text-gray-600">Get more tokens at great bundle prices</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Security Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center p-8 bg-white/50 rounded-3xl border border-emerald-100"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
            <p className="text-lg font-semibold text-gray-700">
              Your payment information is protected with enterprise-grade encryption
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center items-center text-sm text-gray-500">
            <span>🔒 PCI-DSS Level 1 Compliant</span>
            <span>•</span>
            <span>🛡️ 256-bit SSL Encryption</span>
            <span>•</span>
            <span>⚡ Instant Token Delivery</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Loading Animation
function SuccessLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center py-12">
      <div className="text-center">
        <div className="w-28 h-28 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-8"></div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Confirming Payment</h2>
        <p className="text-xl text-gray-600">Tokens will appear in seconds...</p>
      </div>
    </div>
  );
}
