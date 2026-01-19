// import React, { useEffect, useState } from 'react';
// import { useSearchParams, useNavigate } from 'react-router-dom';
// import { toast } from 'sonner';
// import { interviewerSubscriptionsApi } from '../../interviewerSubscriptionsApi';
// import Confetti from 'react-confetti';

// const InterviewerSubscriptionSuccess = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const [subscription, setSubscription] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const planId = searchParams.get('plan_id');

//   useEffect(() => {
//     if (!planId) {
//       toast.error('No subscription plan found');
//       navigate('/interviewer/subscriptions');
//       return;
//     }

//     const checkSubscription = async () => {
//       try {
//         const response = await interviewerSubscriptionsApi.getCurrentSubscription();
//         setSubscription(response.data);
//         setLoading(false);
//         toast.success('Your interviewer subscription is now active!');
//       } catch (error) {
//         toast.error('Failed to verify subscription');
//         setLoading(false);
//       }
//     };

//     checkSubscription();
//   }, [planId, navigate]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-6"></div>
//           <p className="text-xl text-gray-600">Activating your interviewer profile...</p>
//         </div>
//       </div>
//     );
//   }

//   const plan = subscription?.plan;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 overflow-hidden relative">
//       {/* Confetti */}
//       <Confetti 
//         width={window.innerWidth} 
//         height={window.innerHeight}
//         recycle={false}
//         numberOfPieces={300}
//         gravity={0.1}
//       />
      
//       <div className="max-w-4xl mx-auto px-4 py-20 sm:py-32 relative z-10">
//         {/* Hero Success */}
//         <div className="text-center mb-20">
//           <div className="w-36 h-36 bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-12 shadow-2xl ring-8 ring-emerald-200/50">
//             <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//             </svg>
//           </div>
          
//           <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-6">
//             You're Live!
//           </h1>
          
//           <p className="text-2xl md:text-3xl text-gray-700 mb-4">Your interviewer subscription is now active</p>
          
//           {plan && (
//             <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent mb-8">
//               {plan.name} Plan Activated
//             </div>
//           )}
//         </div>

//         {/* Subscription Card */}
//         {subscription?.has_subscription && plan && (
//           <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-200/50 p-12 mb-16 max-w-3xl mx-auto">
//             <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Your New Powers</h2>
            
//             <div className="grid lg:grid-cols-2 gap-12 items-center">
//               {/* Plan Details */}
//               <div className="space-y-8">
//                 <div className="flex items-center gap-4 p-8 bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl border-2 border-emerald-100">
//                   <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
//                     <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                     </svg>
//                   </div>
//                   <div>
//                     <h3 className="text-3xl font-bold text-gray-900 mb-3">{plan.name}</h3>
//                     <div className="text-4xl font-black text-emerald-600">₹{plan.price_inr}</div>
//                     <p className="text-lg text-emerald-700">per month</p>
//                   </div>
//                 </div>
                
//                 <div className="grid md:grid-cols-2 gap-6">
//                   <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
//                     <div className="text-3xl font-bold text-blue-600 mb-2">✅ Live Now</div>
//                     <p className="text-sm text-blue-700">Profile visible to candidates</p>
//                   </div>
//                   <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
//                     <div className="text-3xl font-bold text-green-600 mb-2">∞</div>
//                     <p className="text-sm text-green-700">Unlimited bookings</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Stats */}
//               <div className="text-center">
//                 <div className="text-6xl font-black text-gray-900 mb-6">🎤</div>
//                 <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8 rounded-3xl shadow-2xl">
//                   <div className="text-5xl font-black mb-4">Ready to Earn</div>
//                   <div className="text-xl opacity-90 mb-8">Start accepting interview requests immediately</div>
//                   <div className="space-y-3 text-lg">
//                     <div>• Priority candidate matching</div>
//                     <div>• Analytics dashboard unlocked</div>
//                     <div>• Cancel anytime</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Next Steps */}
//         <div className="max-w-3xl mx-auto text-center space-y-8">
//           <h2 className="text-4xl font-bold text-gray-900">Get Started Now</h2>
          
//           <div className="grid md:grid-cols-2 gap-8">
//             <div className="group bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
//               <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
//                 <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//               <h3 className="text-2xl font-bold text-gray-900 mb-6">Go Live</h3>
//               <p className="text-gray-600 mb-8 leading-relaxed">Your profile is now visible to candidates. Check your availability and start earning.</p>
//               <button 
//                 onClick={() => navigate('/interviewer/dashboard')}
//                 className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 px-8 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
//               >
//                 Open Dashboard
//               </button>
//             </div>
            
//             <div className="group bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
//               <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
//                 <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//               </svg>
//               </div>
//               <h3 className="text-2xl font-bold text-gray-900 mb-6">Manage Plan</h3>
//               <p className="text-gray-600 mb-8 leading-relaxed">View subscription details, set your availability, and manage billing anytime.</p>
//               <button 
//                 onClick={() => navigate('/interviewer/subscriptions')}
//                 className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-4 px-8 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
//               >
//                 View Subscription
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="mt-24 text-center">
//           <p className="text-xl text-gray-600 mb-6">
//             Questions? Contact support at{' '}
//             <a href="mailto:support@yourapp.com" className="text-emerald-600 hover:text-emerald-700 font-bold underline">
//               support@yourapp.com
//             </a>
//           </p>
//           <div className="text-sm text-gray-500">
//             <p>Renews monthly • Cancel anytime • Secure Stripe billing</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InterviewerSubscriptionSuccess;














import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle, Download, Calendar, CreditCard, Mic, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { interviewerSubscriptionsApi } from '../../interviewerSubscriptionsApi';

const InterviewerSubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);
  
  const orderId = searchParams.get('order_id');
  const planId = searchParams.get('plan_id');

  // ✅ 1. Fetch subscription + order details
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        
        // Get current subscription
        const subResponse = await interviewerSubscriptionsApi.getCurrentSubscription();
        setSubscription(subResponse.data);
        
        // Get order details by order_id (NEW!)
        if (orderId) {
          // Mock order details (replace with real API later)
          const mockOrder = {
            id: orderId,
            amount: 499,
            date: new Date().toLocaleString('en-IN'),
            status: 'SUCCEEDED',
          };
          setOrderDetails(mockOrder);
        }
        
        toast.success('🎤 Your interviewer subscription is now LIVE!');
      } catch (error) {
        console.error('Failed to load:', error);
        toast.error('Failed to verify subscription');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [orderId]);

  // ✅ 2. Download invoice handler
  const handleDownloadInvoice = useCallback(async () => {
    if (!orderId) {
      toast.error('No order ID found');
      return;
    }

    try {
      setDownloadLoading(true);
      const blob = await interviewerSubscriptionsApi.downloadSubscriptionInvoice(orderId);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Intraview_Interviewer_Invoice_${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('📄 Invoice downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download invoice');
    } finally {
      setDownloadLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-8"></div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Going Live...</h2>
          <p className="text-xl text-gray-600">Activating your interviewer profile</p>
        </motion.div>
      </div>
    );
  }

  const plan = subscription?.plan;
  const hasSubscription = subscription?.has_subscription;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 overflow-hidden relative">
      {/* Confetti */}
      <Confetti 
        width={window.innerWidth} 
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={400}
        gravity={0.1}
      />
      
      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20 relative z-10">
        {/* 🎯 HERO SUCCESS HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="w-32 h-32 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-12 shadow-2xl ring-8 ring-white/50">
            <CheckCircle className="w-20 h-20 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent mb-6 leading-tight">
            You're LIVE!
          </h1>
          
          <p className="text-2xl md:text-3xl text-gray-700 mb-6 max-w-2xl mx-auto leading-relaxed">
            Order <span className="font-bold text-emerald-700">#{orderId?.slice(-8)?.toUpperCase()}</span>
          </p>
          
          {hasSubscription && plan && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent mb-8"
            >
              {plan.name} Plan <span className="text-3xl">Activated</span>
            </motion.div>
          )}
        </motion.div>

        {/* 🎯 MAIN CONTENT */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          
          {/* LEFT: Plan Benefits + Invoice */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8 lg:max-w-2xl"
          >
            {/* Plan Card */}
            {hasSubscription && plan && (
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-200/50 p-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="text-4xl font-black text-emerald-600">₹{plan.price_inr}</div>
                    <p className="text-lg text-emerald-700 font-medium">per month</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100 hover:border-blue-200 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                      <Star className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-700">Live Now</div>
                    <p className="text-sm text-blue-700">Profile visible to candidates</p>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-100 hover:border-green-200 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <Star className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-700">∞</div>
                    <p className="text-sm text-green-700">Unlimited bookings</p>
                  </motion.div>
                </div>
              </div>
            )}

            {/* ✅ INVOICE DOWNLOAD SECTION */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl p-8 border-2 border-orange-200 shadow-xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <CreditCard className="w-12 h-12 text-orange-600" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Download Receipt</h3>
                  <p className="text-gray-600">Official invoice for your records</p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadInvoice}
                disabled={!orderId || downloadLoading}
                className={`group w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold shadow-xl transition-all duration-300 ${
                  orderId && !downloadLoading
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:shadow-2xl hover:from-orange-600 hover:to-amber-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {downloadLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-r-white rounded-full animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-6 h-6 group-hover:-translate-y-px transition-transform" />
                    <span>Download Invoice (PDF)</span>
                  </>
                )}
              </motion.button>
              
              {orderDetails && (
                <div className="mt-6 pt-6 border-t border-orange-200 text-sm text-gray-600 text-center">
                  Paid: ₹{orderDetails.amount?.toLocaleString()} | {orderDetails.date}
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* RIGHT: Stats + Next Steps */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            <div className="text-center p-12 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl border border-indigo-200 backdrop-blur-xl">
              <Mic className="w-24 h-24 text-indigo-500 mx-auto mb-6 opacity-80" />
              <div className="text-6xl font-black text-gray-900 mb-4">🎤</div>
              <h3 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                Ready to Earn
              </h3>
              <div className="text-xl text-gray-700 space-y-3 max-w-md mx-auto">
                <div>• Priority candidate matching</div>
                <div>• Analytics dashboard unlocked</div>
                <div>• Unlimited interview slots</div>
                <div>• Cancel anytime</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/interviewer/dashboard')}
                className="group w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 px-8 rounded-3xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center gap-4"
              >
                <Calendar className="w-8 h-8 group-hover:-translate-y-1 transition-transform" />
                Open Dashboard
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/interviewer/subscriptions')}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-6 px-8 rounded-3xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center gap-4"
              >
                <CreditCard className="w-8 h-8 group-hover:-translate-y-1 transition-transform" />
                Manage Subscription
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center py-12 px-8 bg-white/60 backdrop-blur-xl rounded-3xl border border-emerald-100 max-w-2xl mx-auto"
        >
          <p className="text-xl text-gray-700 mb-6">
            Questions? We're here 24/7 at{' '}
            <a href="mailto:support@intraview.app" className="text-emerald-600 hover:text-emerald-700 font-bold underline">
              support@intraview.app
            </a>
          </p>
          <div className="flex flex-wrap gap-6 justify-center items-center text-sm text-gray-500">
            <span>🔒 PCI-DSS Compliant</span>
            <span>•</span>
            <span>🛡️ End-to-end encryption</span>
            <span>•</span>
            <span>📱 Instant activation</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InterviewerSubscriptionSuccess;
