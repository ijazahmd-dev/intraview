import React from 'react';
import { XCircle, ArrowLeft, CreditCard, Shield, CheckCircle, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Cancel Header */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-16"
        >
          <div className="w-28 h-28 bg-gradient-to-r from-rose-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border-8 border-white">
            <XCircle className="w-16 h-16 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-rose-700 to-orange-600 bg-clip-text text-transparent mb-6">
            Payment Cancelled
          </h1>
          
          <p className="text-2xl text-gray-600 font-semibold mb-4">
            No charges were made to your account
          </p>
          <p className="text-lg text-gray-500 max-w-md mx-auto">
            Order #{orderId?.slice(-8) || 'N/A'} was not processed. 
            Your tokens remain unchanged.
          </p>
        </motion.div>

        {/* Security Confirmation */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-10 mb-12"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-8 p-6 bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl">
              <Shield className="w-12 h-12 text-gray-500" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Information is Safe</h3>
                <p className="text-gray-600">No payment details were stored or charged</p>
              </div>
              <CreditCard className="w-12 h-12 text-gray-500" />
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="text-center p-6 bg-gray-50 rounded-2xl">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {/* <CheckCircle className="w-8 h-8 text-emerald-600" /> */}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">No Charges</h4>
                <p className="text-gray-600">₹0.00 deducted from your account</p>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-2xl">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Secure</h4>
                <p className="text-gray-600">Protected by Stripe security</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-6"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/tokens')}
              className="flex-1 max-w-md bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-6 px-8 rounded-3xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto"
            >
              {/* <Gift className="w-6 h-6" /> */}
              Buy Tokens Again
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="flex-1 max-w-md bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-900 py-6 px-8 rounded-3xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto"
            >
              <ArrowLeft className="w-6 h-6" />
              Continue to Dashboard
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/wallet')}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Check Wallet Balance
            <CreditCard className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Reassurance Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center p-8 bg-white/50 rounded-3xl border border-gray-200"
        >
          <p className="text-lg font-semibold text-gray-700 mb-4">
            Ready to book your first mock interview?
          </p>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Your tokens are safe in your wallet. No payment was processed for this order.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
