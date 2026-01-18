import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Gift, Clock, CreditCard, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { tokenApi } from '../../tokensApi';  // Your axios pattern
import { toast } from 'sonner';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState(null);

  const orderId = searchParams.get('order_id');

  // ✅ REAL API CALL - Fetch order details by orderId
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError('No order ID found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await tokenApi.getPaymentOrder(orderId);
        const data = response.data;

        // Transform API data for display
        const details = {
          id: data.internal_order_id,
          amount: data.amount_inr,
          tokens: data.token_pack?.tokens || 0,
          packName: data.token_pack?.name || 'Token Pack',
          date: new Date(data.updated_at).toLocaleString('en-IN', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          status: data.status,
          email: data.user_email || 'Your Account',
        };

        setOrderDetails(details);
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError('Failed to load order details. Invoice still available.');
        
        // Fallback mock (rare case)
        setOrderDetails({
          id: orderId,
          amount: 799,
          tokens: 100,
          packName: 'Starter Pack (100 tokens)',
          date: new Date().toLocaleString('en-IN'),
          status: 'SUCCEEDED',
          email: 'Your Account',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleDownloadInvoice = useCallback(async () => {
    if (!orderId) {
      alert('Order ID not available');
      return;
    }

    try {
      setDownloadLoading(true);
      const blob = await tokenApi.downloadPaymentInvoice(orderId);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Intraview_Invoice_${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download invoice. Please try again.');
    } finally {
      setDownloadLoading(false);
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
            Order #{orderId?.slice(-8)?.toUpperCase() || 'N/A'}
          </p>
          <div className="inline-flex items-center gap-2 bg-white/80 px-6 py-3 rounded-2xl border-2 border-emerald-200 shadow-lg">
            <Gift className="w-6 h-6 text-emerald-600" />
            <span className="text-xl font-bold text-emerald-700">
              {orderDetails?.tokens?.toLocaleString() || '??'} tokens added to wallet
            </span>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-orange-600 bg-orange-50 px-4 py-2 rounded-xl text-sm"
            >
              {error}
            </motion.p>
          )}
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
                  <p className="text-3xl font-bold text-emerald-700">
                    ₹{orderDetails?.amount?.toLocaleString() || '0'}
                  </p>
                  <p className="text-sm text-emerald-600 font-semibold">
                    {orderDetails?.tokens?.toLocaleString() || '0'} tokens
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 rounded-2xl">
                <div className="text-center">
                  <Clock className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-lg font-bold text-gray-900">
                    {orderDetails?.date || 'Just now'}
                  </p>
                </div>
                <div className="text-center">
                  <CreditCard className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Paid with</p>
                  <p className="text-lg font-bold text-gray-900">Stripe</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">Bill To</h4>
              <div className="space-y-2 text-sm">
                <p className="font-semibold">{orderDetails?.email}</p>
                <p className="text-gray-600">Order #{orderDetails?.id?.slice(-8)}</p>
                <p className="text-xs text-emerald-600 font-medium bg-emerald-100 px-2 py-1 rounded-full inline-block">
                  {orderDetails?.status}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <p className="text-center text-sm text-gray-600 mb-8">
              💳 Securely processed via Stripe | PCI-DSS compliant
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadInvoice}
                disabled={!orderId || downloadLoading}
                className={`group flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-bold shadow-xl transition-all duration-300 transform hover:-translate-y-1 min-w-[220px] ${
                  orderId && !downloadLoading
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-2xl hover:from-emerald-600 hover:to-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {downloadLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-r-white rounded-full animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                    Download Invoice
                  </>
                )}
              </motion.button>
              
              <button
                onClick={() => navigate('/wallet')}
                className="px-8 py-4 rounded-2xl bg-white border-2 border-emerald-300 text-emerald-700 font-bold hover:bg-emerald-50 hover:border-emerald-400 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                View Wallet
              </button>
            </div>
          </div>
        </motion.div>

        {/* Next Steps + Security Footer - SAME AS BEFORE */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-center space-y-6 mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-8">What's Next?</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <motion.div whileHover={{ scale: 1.05, y: -5 }} className="group bg-white p-8 rounded-2xl shadow-xl border border-gray-200 hover:border-emerald-300 hover:shadow-2xl transition-all duration-300 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-200 transition-colors duration-200">
                <ArrowRight className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Book Interview</h4>
              <p className="text-gray-600">Use your new tokens now</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -5 }} className="group bg-white p-8 rounded-2xl shadow-xl border border-gray-200 hover:border-emerald-300 hover:shadow-2xl transition-all duration-300 cursor-pointer" onClick={() => navigate('/wallet')}>
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors duration-200">
                <Gift className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Check Wallet</h4>
              <p className="text-gray-600">View balance & history</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -5 }} className="group bg-white p-8 rounded-2xl shadow-xl border border-gray-200 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 cursor-pointer" onClick={() => navigate('/candidate/wallet')}>
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors duration-200">
                <CreditCard className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Buy More</h4>
              <p className="text-gray-600">Get better rates</p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center p-8 bg-white/50 rounded-3xl border border-emerald-100 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
            <p className="text-lg font-semibold text-gray-700">Enterprise-grade payment security</p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center items-center text-sm text-gray-500">
            <span>🔒 PCI-DSS Compliant</span><span>•</span>
            <span>🛡️ End-to-end encryption</span><span>•</span>
            <span>⚡ Instant token delivery</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function SuccessLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center py-12">
      <div className="text-center">
        <div className="w-28 h-28 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-8"></div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Loading Order Details</h2>
        <p className="text-xl text-gray-600">Fetching your purchase...</p>
      </div>
    </div>
  );
}
